import abc

from flask import request, jsonify
from redis import RedisError
import pymongo

from jobs import process_event_data


class BaseHandler(object):
    """
    Base class for request handlers.
    """

    __metaclass__ = abc.ABCMeta

    @abc.abstractproperty
    def view_name(self):
        """
        Implement to return the Flask view name for this handler.
        """
        raise NotImplementedError()

    @abc.abstractproperty
    def methods(self):
        """
        Implement to return the methods supported by this handler.
        """
        raise NotImplementedError()

    @abc.abstractmethod
    def handle(self, *args, **kwargs):
        """
        Implement to handle the request.
        """


class EventPushHandler(BaseHandler):
    """
    Handles event submitting endpoint.
    """

    view_name = 'push_event'
    methods = ['POST']

    def handle(self):
        """
        Pushes event to the task queue.
        """
        username = request.headers.get('User.Username')
        permission = request.headers.get('User.Permission')

        if permission is None or int(permission) > 1:
            return jsonify({'error': 'not allowed'}), 409

        data = {
            'author': username,
            'input': request.json['input'],
        }
        try:
            process_event_data.delay(data)
            return jsonify({'success': True})
        except RedisError:
            return jsonify({'success': False})


class GetEventsHandler(BaseHandler):
    """
    Handles endpoint for getting the events for a user.
    """

    view_name = 'get_events'
    methods = ['GET']

    EVENT_OUTPUT_FIELDS = [
        'created_at',
        'user_id',
        'properties',
        'rule',
        'author',
        'input',
    ]

    PREDICTED_EVENT_OUTPUT_FIELDS = [
        'created_at',
        'user_id',
        'properties',
        'rule',
        'author',
        'prob',
    ]

    def __init__(self, mongo):
        """
        @param mongo: mongo client
        """
        self.mongo = mongo

    def handle(self):
        """
        Fetches events for the user id given in the headers.
        """
        # TODO: Handle errors
        user_id = request.headers.get('User.Username')

        if user_id is None:
            return jsonify([])

        cursor = self.mongo.db.events.find({'user_id': user_id}).sort('created_at', pymongo.DESCENDING)
        events = []
        predicted = None
        for event in cursor:
            if event.get('predicted', False):
                assert not predicted
                predicted = {f: event[f] for f in self.PREDICTED_EVENT_OUTPUT_FIELDS}
            else:
                events.append({f: event[f] for f in self.EVENT_OUTPUT_FIELDS})

        return jsonify({'predicted': predicted, 'eventlog': events})
