import json
import grammar

from flask import Flask, jsonify, request

app = Flask(__name__)

def persist(raw_text, parse_result):
    print 'Successfully parsed', raw_text, 'with rule', parse_result['rule']
    print 'Parsed properties:', parse_result['properties']

@app.route('/')
def hello():
    return jsonify({'yo': 'face'})

@app.route('/annotation/', methods=['POST', 'OPTIONS'])
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

    data = json.loads(request.data)
    raw_text = data['raw']
    
    rule_parsing_data = []
    for rule in grammar.rules:
        parse_result = rule.parse(raw_text)

        if parse_result['status'] == grammar.ACCEPT:
            persist(raw_text, parse_result)

        rule_parsing_data.append(parse_result)

    resp = jsonify(rule_parsing_data)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
