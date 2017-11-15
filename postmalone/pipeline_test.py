import datetime
import mock
import unittest

from pymongo import MongoClient, DESCENDING
from freezegun import freeze_time

from .pipeline import (
    hash_dict,
    Processor,
    CompositeProcessor,
    EventState,
    FetchAggregationsProcessor,
    IncrAggregationsProcessor,
    MarkovProcessor,
    RecentEventsProcessor,
)


class PlusTwo(Processor):

    def process(self, data):
        return data + 2


class MinusOne(Processor):
 
    def process(self, data):
        return data - 1


class TestCompositeProcessor(unittest.TestCase):

    def test_run_processors(self):
        processors = [PlusTwo(), MinusOne()]
        comp_proc = CompositeProcessor(processors)
        self.assertEqual(3, comp_proc.process(2))


class TestEventState(unittest.TestCase):

    def test_with_events(self):
        state = EventState([
            {'some': 'event'},
        ], [
            {'some': 'occurrence'},
        ])

        more_events = [
            {'event': 'one'},
            {'event': 'two'},
        ]
        expected_state = EventState([
            {'some': 'event'},
            {'event': 'one'},
            {'event': 'two'},
        ], [
            {'some': 'occurrence'},
        ])

        self.assertEqual(expected_state, state.with_events(more_events))

    def test_with_occurrences(self):
        state = EventState([
            {'some': 'event'},
        ], [
            {'some': 'occurrence'},
        ])

        more_occurrences = [
            {'occurrences': 'one'},
            {'occurrences': 'two'},
        ]
        expected_state = EventState([
            {'some': 'event'},
        ], [
            {'some': 'occurrence'},
            {'occurrences': 'one'},
            {'occurrences': 'two'},
        ])

        self.assertEqual(expected_state, state.with_occurrences(more_occurrences))


class TestRecentEventsProcessor(unittest.TestCase):

    def test_process(self):
        mockdb = mock.MagicMock()
        state = EventState([
            {'some': 'event', 'user_id': 123},
        ], [
            {'some': 'occurrence'},
        ])

        more_events = [
            {'event': 'one'},
            {'event': 'two'},
        ]
        expected_state = EventState([
            {'some': 'event', 'user_id': 123},
            {'event': 'one'},
            {'event': 'two'},
        ], [
            {'some': 'occurrence'},
        ])
        mockdb.events.find.return_value.sort.return_value.limit.return_value = more_events
        processor = RecentEventsProcessor(mockdb, 2)
        o_processor = FetchAggregationsProcessor(123)
        actual_state = processor.process(state)

        self.assertEqual(expected_state, actual_state)
        mockdb.events.find.assert_called_once_with({'user_id': 123})
        mockdb.events.find.return_value.sort.assert_called_once_with('created_at', DESCENDING)
        mockdb.events.find.return_value.sort.return_value.limit.assert_called_once_with(2)


class TestFetchAggregationsProcessor(unittest.TestCase):

    def test_process(self):
        mockdb = mock.MagicMock()
        properties1 = {'disease': 'cancer'}
        properties2 = {'disease': 'aids'}
        state = EventState([
            {'user_id': 123, 'properties': properties1},
            {'user_id': 123, 'properties': properties2},
        ], [
            {'some': 'occurrence'},
        ])

        hash1 = hash_dict(properties1)
        hash2 = hash_dict(properties2)
        hash3 = ''.join(sorted([hash1, hash2]))

        more_occurrences = [
            {'occurrences': 'one'},
            {'occurrences': 'two'},
            {'occurrences': 'three'},
        ]
        expected_state = EventState([
            {'user_id': 123, 'properties': properties1},
            {'user_id': 123, 'properties': properties2},
        ], [
            {'some': 'occurrence'},
            {'occurrences': 'one'},
            {'occurrences': 'two'},
            {'occurrences': 'three'},
        ])
        mockdb.occurrences.find.return_value = more_occurrences
        processor = FetchAggregationsProcessor(mockdb)
        actual_state = processor.process(state)

        self.assertEqual(expected_state, actual_state)
        self.assertCountEqual(mockdb.occurrences.find.call_args_list[0][0][0]['key']['$in'],
            [hash1, hash2, hash3])


class TestIncrAggregationsProcessor(unittest.TestCase):

    def test_process(self):
        mockdb = mock.MagicMock()
        properties1 = {'disease': 'cancer'}
        properties2 = {'disease': 'aids'}
        state = EventState([
            {'user_id': 123, 'properties': properties1},
            {'user_id': 123, 'properties': properties2},
        ], [
            {'some': 'occurrence'},
        ])

        hash1 = hash_dict(properties1)
        hash2 = hash_dict(properties2)
        processor = IncrAggregationsProcessor(mockdb)
        actual_state = processor.process(state)

        self.assertEqual(state, actual_state)
        mockdb.occurrences.initialize_ordered_bulk_op.assert_called_once_with()
        mockbulk = mockdb.occurrences.initialize_ordered_bulk_op.return_value
        mockbulk.find.assert_called_once_with({'key': hash2})
        mockbulk.find.return_value.upsert.assert_called_once_with()
        mockbulk.find.return_value.upsert.return_value.update.assert_called_once_with(
            {
                '$inc': {'count': 1, '{}_count'.format(hash1): 1},
                '$set': {'key': hash2},
            }
        )
        mockbulk.execute.assert_called_once_with()


class TestMarkovProcessor(unittest.TestCase):

    def test_process(self):
        mockdb = mock.MagicMock()
        properties1 = {'disease': 'cancer'}
        properties2 = {'disease': 'aids'}
        hash2 = hash_dict(properties2)
        state = EventState([
            {'user_id': 123, 'properties': properties1},
        ], [
            {'count': 10, '{}_count'.format(hash2): 10},
        ])

        processor = MarkovProcessor(mockdb)
        expected_state = EventState([
            {'user_id': 123, 'properties': properties1},
            {'user_id': 123, 'properties': properties2, 'predicted': True,
            'prob': 10. / (10 + MarkovProcessor.SMOOTHING)},
        ], [
            {'count': 10, '{}_count'.format(hash2): 10},
        ])
        mockdb.events.find.return_value.limit.return_value = [
            {'user_id': 234, 'properties': properties2},
        ]
        actual_state = processor.process(state)

        self.assertEqual(expected_state, actual_state)
        mockdb.events.find.assert_called_once_with({'key': hash2})
        mockdb.events.find.return_value.limit.assert_called_once_with(1)

    def test_process_no_predict(self):
        mockdb = mock.MagicMock()
        properties1 = {'disease': 'cancer'}
        properties2 = {'disease': 'aids'}
        hash2 = hash_dict(properties2)
        state = EventState([
            {'user_id': 123, 'properties': properties1},
        ], [
            {'count': 10, '{}_count'.format(hash2): 1},
        ])

        processor = MarkovProcessor(mockdb)
        mockdb.events.find.return_value.limit.return_value = [
            {'user_id': 234, 'properties': properties2},
        ]
        actual_state = processor.process(state)

        self.assertEqual(state, actual_state)
        self.assertEqual(0, mockdb.events.find.call_count)


class TestPrepareEventsProcessor(unittest.TestCase):

    @freeze_time()
    def test_process(self):
        properties1 = {'disease': 'cancer'}
        state = EventState([
            {'user_id': 123, 'properties': properties1},
            {'_id': 123, 'user_id': 123, 'properties': properties1},
        ], [
            {'count': 10},
        ])

        expected_state = EventState([
            {'user_id': 123, 'properties': properties1, 'created_at': datetime.datetime.utcnow(),
            'key': hash_dict(properties1)},
        ], [
            {'count': 10},
        ])
