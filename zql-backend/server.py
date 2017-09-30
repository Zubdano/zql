import json

from flask import Flask, jsonify, request
from textx.metamodel import metamodel_from_str
from textx.exceptions import TextXSyntaxError

app = Flask(__name__)

class GrammarRule(object):
    self.ACCEPT = 'accept'
    self.REJECT = 'reject'
    self.INCOMPLETE = 'incomplete'

    def __init__(self, name, grammar, properties):
        self.name = name
        self.grammar = grammar
        self.properties = properties

        # If grammar invalid, following will raise.
        self.metamodel = metamodel_from_str(grammar)

    def parse(self, raw):
       	# AYY YO BOY, PARSE SOME SHIT
        try:
	    model = self.metamodel.model_from_str(raw)
            return self.ACCEPT, -1
        except TextXSyntaxError as e:
            rejection_idx = e.col
            if e.col == len(raw) + 1:
                return self.INCOMPLETE, e.col
            else:
                return self.REJECT, e.col

diagnosis = '''
Diagnosis:
    'diagnosed' patient=ID 'with' disease=Disease
;

Disease:
    'hiv' | 'aids' | 'diabetes' | 'ebola' | 'adhd' | 'cancer' | 'cance'
;
'''

examination = '''
Examination:
    'performed' exams+=Exam[','] 'on' patient=ID
;

Exam:
    'mri' | 'catscan' | 'needle scan' | 'vaccination' | 'cance scan' | 'anal probe'
;
'''

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
