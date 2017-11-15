import os

from flask import Flask, jsonify, request
from flask_pymongo import PyMongo


app = Flask(__name__)
mongo_uri = 'mongodb://{}:{}@ds259325.mlab.com:59325/zql'
app.config['MONGO_URI'] = mongo_uri.format(os.environ['ZQL_MONGO_USER'], os.environ['ZQL_MONGO_PASS'])
mongo = PyMongo(app)

@app.route('/grammar_ping', methods=['GET'])
def grammar_ping():
    return jsonify({'pong': 'bong'})

@app.route('/grammar', methods=['PUT'])
def update_grammar():
    user_id = request.headers['User.Id']
    user_permission = request.headers['User.Permission']

    if user_permission != 0:
        return jsonify('error': 'Not allowed.'}), 409

    return jsonify({'updated': 'grammar'})

@app.route('/grammar', methods=['GET'])
def get_grammar():
    return jsonify({'got': 'grammar'})
