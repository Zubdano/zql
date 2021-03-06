import os

from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from process import process_grammar


app = Flask(__name__)
mongo_uri = 'mongodb://{}:{}@ds259325.mlab.com:59325/zql'
app.config['MONGO_URI'] = mongo_uri.format(os.environ['ZQL_MONGO_USER'], os.environ['ZQL_MONGO_PASS'])
mongo = PyMongo(app)


@app.route('/grammars', methods=['GET'])
def get_grammars():
    cursor = mongo.db.grammars.find()
    res = []
    for grammar in cursor:
        grammar['_id'] = str(grammar['_id'])
        res.append(grammar)

    return jsonify(res)


@app.route('/grammar/<grammar_id>', methods=['POST'])
def update_grammar(grammar_id):
    user_id = request.headers['User.Username']
    user_permission = int(request.headers['User.Permission'])

    if user_permission != 0:
        return jsonify({'error': 'Not allowed.'}), 409

    data = request.json
    grammar = data['grammar']

    success, reason = process_grammar(grammar_id, grammar)
    if not success:
        return jsonify({'error': reason}), 400

    return get_grammar(grammar_id)


@app.route('/grammar/<grammar_id>', methods=['GET'])
def get_grammar(grammar_id):
    grammar = mongo.db.grammars.find_one({'_id': ObjectId(grammar_id)})
    grammar['_id'] = str(grammar['_id'])
    return jsonify(grammar)
