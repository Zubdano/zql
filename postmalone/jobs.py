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

db = MongoClient().postmalone

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
