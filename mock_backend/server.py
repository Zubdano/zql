import json

from flask import Flask, jsonify, request
app = Flask(__name__)


VERB_TOKENS = frozenset(['am', 'eat'])
ADJ_TOKENS = frozenset(['funny', 'yellow'])


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

    sentence = json.loads(request.data)
    sentence['errorMsg'] = None
    sentence['isError'] = False

    for word in sentence['words']:
        if word['text'] in VERB_TOKENS:
            word['annotation'] = 'verb'
        elif word['text'] in ADJ_TOKENS:
            word['annotation'] = 'adj'
        else:
            word['annotation'] = None

        if word['text'] == 'cance':
            sentence['errorMsg'] = 'i said no cance'
            sentence['isError'] = True

    if not sentence['isError'] and sentence['words'] and \
            sentence['words'][-1]['text'].endswith('.'):
        sentence['isComplete'] = True
    else:
        sentence['isComplete'] = False

    resp = jsonify(sentence)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
