import functools
import json
import grammar
import generate

from flask import Flask, jsonify, request

app = Flask(__name__)

def persist(sentence, parsed_result):
    app.logger.info('Parsed properties:', parsed_result['properties'])

@app.route('/keywords')
def keywords():
    root = generate.get_grammar_root()
    keywords = grammar.get_keywords(root)
    return jsonify(keywords)


@app.route('/interpret', methods=['POST', 'OPTIONS'])
def annotation():
    """
    Takes in an object representing a sentence and returns annotations for the words in that
    sentence.
    """
    data = request.json
    sentence = data['raw']

    root = generate.get_grammar_root()
    parsed_result = grammar.parse_sentence(sentence, root)

    app.logger.info('Parsed sentence:"{}" status:{}'.format(sentence, parsed_result['status']))
    if parsed_result['status'] == grammar.ACCEPT:
        persist(sentence, parsed_result)

    resp = jsonify(parsed_result)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
