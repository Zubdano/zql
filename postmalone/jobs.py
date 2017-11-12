from flask_rq import job
from pymongo import MongoClient

from pipeline import (
	CompositeProcessor,
	EventPersistenceProcessor,
	EventState,
)

db = MongoClient().postmalone


EVENT_PIPELINE = CompositeProcessor([
	EventPersistenceProcessor(db),
])


@job
def process_event(data):
	EVENT_PIPELINE.process(EventState([data]))
