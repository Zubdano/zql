import os

from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_rq import RQ

from handler import (
    GetEventsHandler,
    EventPushHandler,
)

app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'postmalone'
mongo_uri = 'mongodb://{}:{}@ds259325.mlab.com:59325/zql'
app.config['MONGO_URI'] = mongo_uri.format(os.environ['ZQL_MONGO_USER'], os.environ['ZQL_MONGO_PASS'])
mongo = PyMongo(app)
RQ(app)


# Map from routes to list of handlers that can handle them, assuming no overlap in the method of
# each handler.
HANDLER_MAP = {
    '/event': [EventPushHandler()],
    '/events/<user_id>': [GetEventsHandler(mongo)],
}


def register_handlers(handler_map):
    """
    Registers handlers for different routes.
    @param handler_map: mapping of routes to list of handlers for that route.
    """
    for route, handlers in handler_map.items():
        for handler in handlers:
            app.add_url_rule(route, handler.view_name, handler.handle, methods=handler.methods)


register_handlers(HANDLER_MAP)
