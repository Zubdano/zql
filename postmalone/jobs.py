import os
from urllib.parse import quote_plus

from flask_rq import job
from pymongo import MongoClient

from pipeline import (
	CleanupPredictedProcessor,
	CompositeProcessor,
	EventPersistenceProcessor,
	EventState,
	FetchAggregationsProcessor,
	IncrAggregationsProcessor,
	MarkovProcessor,
	PrepareEventsProcessor,
	RecentEventsProcessor,
)

mongo_uri = 'mongodb://{}:{}@ds259325.mlab.com:59325/zql'
mongo_uri = mongo_uri.format(os.environ['ZQL_MONGO_USER'], os.environ['ZQL_MONGO_PASS'])
db = MongoClient(mongo_uri).zql

EVENTS_WINDOW = 3


EVENT_PIPELINE = CompositeProcessor([
	RecentEventsProcessor(db, 3),
	FetchAggregationsProcessor(db),
	IncrAggregationsProcessor(db),
	MarkovProcessor(db),
	PrepareEventsProcessor(),
	CleanupPredictedProcessor(db),
	EventPersistenceProcessor(db),
])


@job
def process_event(data):
	EVENT_PIPELINE.process(EventState([data]))
