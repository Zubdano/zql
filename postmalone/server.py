from flask import Flask, jsonify, request
from flask_pymongo import PyMongo

app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'postmalone'
mongo = PyMongo(app)


@app.route('/event', methods=['POST'])
def push_event():
    data = request.json
    obj_id = mongo.db.events.insert_one(data).inserted_id
    return jsonify({'obj_id': str(obj_id)})


@app.route('/events/<subscriber_id>', methods=['GET'])
def get_events(subscriber_id):
    cursor = mongo.db.events.find({'who': subscriber_id})
    res = []
    for event in cursor:
        event['_id'] = str(event['_id'])
        res.append(event)

    return jsonify(res)