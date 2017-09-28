import json

from flask import Flask, jsonify, request
app = Flask(__name__)


VERB_TOKENS = frozenset(['am', 'eat'])
ADJ_TOKENS = frozenset(['funny', 'yellow'])


@app.route('/')
def hello():
    resp = jsonify({'yo': 'face'})
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


@app.route('/annotation/', methods=['POST'])
def annotation():
	"""
	Takes in an object representing a sentence and returns annotations for the words in that
	sentence.
	"""
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
			sentence['isError']	= True

	if not sentence['isError'] and sentence['words'] and \
			sentence['words'][-1]['text'].endswith('.'):
		sentence['isComplete'] = True
	else:
		sentence['isComplete'] = False

	return jsonify(sentence)

