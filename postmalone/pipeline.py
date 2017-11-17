import abc
import base64
import datetime
import functools
import itertools
import json
import hashlib
import requests

import pymongo


class Processor(object):
    """
    Base class for processors, objects that take some input from a previous processor,
    process it, and pass some output to another processor.
    """
    # TODO: validate inputs

    __metaclass__ = abc.ABCMeta

    @abc.abstractmethod
    def process(self, data):
        """
        Implement to process the data and produce some output.
        """
        raise NotImplementedError()


class CompositeProcessor(Processor):
    """
    Processes a list of processors, returning the output from the last one.
    """

    def __init__(self, processors):
        """
        @param processors: list of processors to process.
        """
        self.processors = processors

    def process(self, data):
        """
        Pipes the data through the processors in order.

        @param data: input data to the processor.
        @return: output from the last processor.
        """
        return functools.reduce(lambda data, proc: proc.process(data), self.processors, data)


def hash_dict(obj):
    """
    Hashes the json representation of obj using sha-256 to have almost certain uniqueness.
    @param obj: dict to be hashed
    @return: sha256 b64 encoded hash of the dict
    """
    m = hashlib.sha256()
    s = json.dumps(obj, sort_keys=True)
    m.update(bytes(s, 'utf-8'))
    return base64.b64encode(m.digest()).decode('utf-8')


def get_occurrence_ids(event_hashes):
    """
    Generates all event hashes for the given events determined by the properties of the event.
    """
    def add_combinations(agg, i):
        occurrence_lists = list(itertools.combinations(event_hashes, i+1))
        occurrence_ids = [''.join(sorted(set(comb))) for comb in occurrence_lists]
        return agg + occurrence_ids

    return list(set(functools.reduce(add_combinations, range(len(event_hashes)), [])))


class EventState(object):
    """
    Object passed through in the event pipeline.
    """

    def __init__(self, events, occurrences=None):
        self.events = events
        self.occurrences = occurrences or []

    def with_events(self, events):
        return EventState(self.events + events, self.occurrences)

    def with_occurrences(self, occurrences):
        return EventState(self.events, self.occurrences + occurrences)

    def __eq__(self, other):
        return self.events == other.events and self.occurrences == other.occurrences

class InterpreterProcessor(Processor):
    """
    Gets event data from the interpreter service
    """

    INTERPRETER_URL = 'http://localhost:2020/interpret'

    def process(self, data):
        res = requests.post(self.INTERPRETER_URL, json={'raw': data})
        return EventState([res.json()])

class MongoProcessor(Processor):
    """
    Base processor for processors that require access to Mongo.
    """

    def __init__(self, db):
        """
        @param db: mongo postmalone database object.
        """
        self.db = db


class RecentEventsProcessor(MongoProcessor):
    """
    Fetches recent events for the user in the given event. Takes the user_id from the first event
    in the state.
    """

    def __init__(self, db, window):
        """
        @param db: mongo postmalone database object.
        @param window: number of events we look back at for predictions.
        """
        super(RecentEventsProcessor, self).__init__(db)
        self.window = window

    def process(self, state):
        """
        Fetches most recent events for current user id.
        """
        user_id = state.events[0]['user_id']
        events = list(self.db.events.find({
            'user_id': user_id,
        }).sort('created_at', pymongo.DESCENDING).limit(self.window))
        return state.with_events(events)


class FetchAggregationsProcessor(MongoProcessor):
    """
    Fetches occurences of different events.
    Assumes that the first event in state is the target event, and all other events are the
    precursor events.
    """

    def process(self, state):
        """
        Fetches occurrences in the database, related to the given events.
        """
        event_hashes = [hash_dict(event['properties']) for event in state.events]
        occurrence_ids = get_occurrence_ids(event_hashes)
        occurrences = list(self.db.occurrences.find({'key': {'$in': occurrence_ids}}))
        return state.with_occurrences(occurrences)


class IncrAggregationsProcessor(MongoProcessor):
    """
    Increments occurrences of given events.
    Assumes that the first event in state is the target event, and all other events are the
    precursor events.
    """

    def process(self, state):
        """
        Increments occurrences of given events.
        """
        event_hashes = [hash_dict(event['properties']) for event in state.events]
        occurrence_ids = get_occurrence_ids(event_hashes[1:])
        bulk = self.db.occurrences.initialize_ordered_bulk_op()
        if occurrence_ids:
            for occurrence_id in occurrence_ids:
                bulk.find({'key': occurrence_id}).upsert().update(
                    {
                        '$inc': {'count': 1, '{}_count'.format(event_hashes[0]): 1},
                        '$set': {'key': occurrence_id},
                    },
                )
            bulk.execute()
        return state


class MarkovProcessor(MongoProcessor):

    SMOOTHING = 2
    THRESHOLD = 0.75

    def process(self, state):
        occurrences = state.occurrences
        best_prediction = None

        for occurrence in occurrences:
            count = occurrence['count']
            for name, value in occurrence.items():
                if name.endswith('_count'):
                    prob = float(value) / (count + self.SMOOTHING)
                    if best_prediction is None or prob > best_prediction[0]:
                        best_prediction = (prob, name[:-6])

        if best_prediction is not None and best_prediction[0] > self.THRESHOLD:
            events = list(self.db.events.find({'key': best_prediction[1]}).limit(1))
            # TODO: Log not found
            print(events)
            if events:
                return state.with_events([{
                    'user_id': state.events[0]['user_id'],
                    'properties': events[0]['properties'],
                    'predicted': True,
                    'prob': best_prediction[0],
                }])

        return state


class PrepareEventsProcessor(Processor):
    """
    Removes events that were already added and populates `created_at` on new events.
    """

    def process(self, state):
        events = [event for event in state.events if '_id' not in event]
        created_at = datetime.datetime.utcnow()
        for event in events:
            event['created_at'] = created_at
            event['key'] = hash_dict(event['properties'])

        return EventState(events, state.occurrences)


class CleanupPredictedProcessor(MongoProcessor):
    """
    Cleans up predicted events.
    TODO: Write unit tests
    """

    def process(self, state):
        """
        Removes all predicted events for the user if there already exists a user
        """
        user_id = state.events[0]['user_id']
        predicted_events = [event for event in state.events if event.get('predicted')]
        predicted_hashes = [hash_dict(event['properties']) for event in predicted_events]
        related_events = list(
            self.db.events.find({'key': {'$in': predicted_hashes}, 'user_id': user_id}),
        )
        related_hashes = {event['key'] for event in related_events}
        predicted_events = [
            event for i, event in enumerate(predicted_events)
            if predicted_hashes[i] not in related_hashes
        ]
        if predicted_events:
            self.db.events.remove({'user_id': user_id, 'predicted': True})

        events = [event for event in state.events if not event.get('predicted')]
        event_hashes = [hash_dict(event['properties']) for event in events]
        self.db.events.remove({'user_id': user_id, 'predicted': True, 'key': {
            '$in': event_hashes}})

        return EventState(events + predicted_events, state.occurrences)


class EventPersistenceProcessor(MongoProcessor):

    def process(self, state):
        """
        Persists the events in the state to the database.
        """
        # TODO: Error handling
        self.db.events.insert_many(state.events)
        return state
