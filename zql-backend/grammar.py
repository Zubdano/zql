from textx.metamodel import metamodel_from_str
from textx.exceptions import TextXSyntaxError


ACCEPT = 'accept'
REJECT = 'reject'
FAILURE = 'failure'
INCOMPLETE = 'incomplete'

class GrammarRule(object):
    def __init__(self, name, grammar, properties):
        self.name = name
        self.grammar = grammar
        self.properties = properties

        # If grammar invalid, following will raise.
        self.metamodel = metamodel_from_str(grammar)

    def parse(self, raw):
        result = {
            'rule': self.name,
            'status': None,
            'properties': {},
            'rejection_idx': -1,
        }

        try:
	    model = self.metamodel.model_from_str(raw)
            result['status'] = ACCEPT
            result['properties'] = self._get_properties(model)
        except TextXSyntaxError as e:
            result['status'] = INCOMPLETE if e.col == len(raw) + 1 else REJECT
            result['rejection_idx'] = e.col
        except AttributeError as e:
            result['status'] = FAILURE

        return result

    def _get_properties(self, model):
        return dict(map(lambda p: (p, getattr(model, p)), self.properties))

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

# TODO: turn this into a dictionary probably.
rules = [
    GrammarRule('diagnosis', diagnosis, ['patient', 'disease']),
    GrammarRule('examination', examination, ['exams', 'patient']),
]
