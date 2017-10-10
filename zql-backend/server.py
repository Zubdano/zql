import functools
import json
import grammar

from flask import Flask, jsonify, request

app = Flask(__name__)


# TBH idk why we need this, but doesn't work without it when testing on localhost
# For now, just add this to POST request handlers
def access_control(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        resp = func(*args, **kwargs)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    return wrapper


def persist(raw_text, parse_result):
    print('Successfully parsed', raw_text, 'with rule', parse_result['rule'])
    print('Parsed properties:', parse_result['properties'])


@app.route('/keywords/')
@access_control
def keywords():
    return jsonify(grammar.keywords)


@app.route('/annotation/', methods=['POST', 'OPTIONS'])
@access_control
def annotation():
    """
    Takes in an object representing a sentence and returns annotations for the words in that
    sentence.
    """
    if request.method == 'OPTIONS':
        resp = Flask.make_default_options_response(app)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        resp.headers['Content-Type'] = 'application/json'
        return resp

    data = request.json
    sentence = data['raw']

    parsed_result = grammar.parse_sentence(sentence)
    resp = jsonify(parsed_result)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
