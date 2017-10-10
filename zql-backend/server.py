import json
import grammar

from flask import Flask, jsonify, request

app = Flask(__name__)

def persist(raw_text, parse_result):
    print('Successfully parsed', raw_text, 'with rule', parse_result['rule'])
    print('Parsed properties:', parse_result['properties'])

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

    data = request.json
    print(data)
    sentence = data['raw']
    
    parsed_result = grammar.parse_sentence(sentence)
    resp = jsonify(parsed_result)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == '__main__':
    app.run()
