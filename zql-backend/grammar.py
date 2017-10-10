from arpeggio import Optional, ZeroOrMore, OneOrMore, EOF, ParserPython, NoMatch, RegExMatch

### GRAMMAR ###

def root(): return [diagnosis_grammar, examination_grammar]

def diagnosis_grammar(): return 'diagnosed', patient, 'with', disease

def examination_grammar(): return 'examined', patient, 'with', exam

def disease(): return ['cancer', 'hiv', 'aids']

def exam(): return ['catscan', 'anal probe', 'needle probe']

def patient(): return RegExMatch(r'\w+')

###########

# STATUSES
ACCEPT = 'accept'
REJECT = 'reject'
INCOMPLETE = 'incomplete'

def parse_sentence(sentence):
    parser = ParserPython(root)
    res = {
        'rule': None,
        'status': None,
        'properties': {},
        'suggestions': [],
        'rejectindex': -1,
    }

    try:
        root_node = parser.parse(sentence)
        grammar_node = root_node[0]
        res['rule'] = grammar_node.rule_name
        res['status'] = ACCEPT
        res['properties'] = dict(parse_properties(grammar_node))
    except NoMatch as e:
        if e.col == len(sentence) + 1:
            # the sentence failed to match at the very end
            # so the status of it is incomplete match
            res['status'] = INCOMPLETE
        else:
            res['status'] = REJECT

        res['suggestions'] = list(parse_autocomplete(e.rules))
        res['rejectindex'] = e.col

    return res

def parse_autocomplete(nomatch_rules):
    for rule in nomatch_rules:
        if isinstance(rule, RegExMatch):
            yield {
                'type': 'property',
                'suggest': rule.rule_name,
            }
        else:
            yield {
                'type': 'value',
                'suggest': str(rule),
            }

def parse_properties(grammar_node):
    # grammar node is the top level node
    # all its children rules are denormalized to 1 level deep
    for rule in grammar_node:
        if rule.rule_name != '':
            yield (rule.rule_name, str(rule))
