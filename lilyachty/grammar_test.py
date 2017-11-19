from graph import iter_rhs, verify_structure, construct_graph
from parse import generate_keywords_and_variables, get_user_id_rules
from hashing import stringify_grammar


def test_get_user_id_rules():
    grammar = {
        'a': {'isPrimary': True, 'value': '3'},
        'z': {'isPrimary': False, 'value': '6'},
        'c': {'isPrimary': False, 'value': '9'},
    }
    assert len(get_user_id_rules(grammar)) == 1

    grammar = {
        'a': {'isPrimary': True, 'value': '3'},
        'z': {'isPrimary': True, 'value': '6'},
        'c': {'isPrimary': False, 'value': '9'},
    }
    assert len(get_user_id_rules(grammar)) == 2

    grammar = {
        'a': {'isPrimary': False, 'value': '3'},
        'z': {'isPrimary': False, 'value': '6'},
        'c': {'isPrimary': False, 'value': '9'},
    }
    assert len(get_user_id_rules(grammar)) == 0

def test_stringify_grammar():
    grammar = {
        'a': {'type': '1', 'oneOrMore': '2', 'isPrimary': 'f', 'value': '3', 'join': 'and'},
        'z': {'type': '4', 'oneOrMore': '5', 'isPrimary': 'f', 'value': '6', 'join': 'and'},
        'c': {'type': '7', 'oneOrMore': '8', 'isPrimary': 'f', 'value': '9', 'join': 'and'},
    }
    sgram = stringify_grammar(grammar)
    assert sgram == '[["a", "1", "2", "f", "and", "3"], ["c", "7", "8", "f", "and", "9"], ["z", "4", "5", "f", "and", "6"]]'


def test_iter_rhs():
    rhs = [[['a'], [[['b']]], 'c'], ['d']]
    gen = iter_rhs(rhs)
    
    assert next(gen) == 'a'
    assert next(gen) == 'b'
    assert next(gen) == 'c'
    assert next(gen) == 'd'
    
    try:
        next(gen)
        assert 'naren' == 'vasan'
    except StopIteration:
        pass


def integration_test():
    grammar = {
        'root': {
            'type': 'rule',
            'oneOrMore': False,
            'value': [['diagnosis'], ['examination']]
        },
        'diagnosis': {
            'type': 'rule',
            'oneOrMore': False,
            'value': ['diagnosed', 'patient', 'with', 'disease']
        },
        'examination': {
            'type': 'rule',
            'oneOrMore': False,
            'value': ['performed', 'exams', 'on', 'patient']
        },
        'patient': {
            'type': 'variable',
            'oneOrMore': False,
            'value': '[a-zA-Z]+'
        },
        'disease': {
            'type': 'rule',
            'oneOrMore': False,
            'value': [['cancer'], ['diabetes'], ['aids']]
        },
        'exams': {
            'type': 'rule',
            'oneOrMore': True,
            'value': [['colonoscopy'], ['mri'], ['catscan']]
        }
    }

    graph = construct_graph(grammar)
    assert len(graph) == 5
    assert graph['root'] == ['diagnosis', 'examination']
    assert graph['diagnosis'] == ['disease']
    assert graph['examination'] == ['exams']
    assert graph['disease'] == []
    assert graph['exams'] == []

    valid, reason, rules = verify_structure(graph)
    assert valid

    keywords, variables = generate_keywords_and_variables(grammar)
    assert 'with' in keywords
    assert 'mri' in keywords
    assert variables == ['patient']


def test_verify_structure():
    graph = {
        'a': ['b', 'c', 'd'],
        'b': ['c', 'd'],
        'c': ['a'],
        'd': [],
    }
    valid, reason, rules = verify_structure(graph)
    assert not valid
    assert reason.startswith('Cycle')

    graph = {
        'a': ['b', 'c'],
        'b': [],
        'c': [],
        'd': ['e', 'f'],
        'e': [],
        'f': [],
    }
    valid, reason, rules = verify_structure(graph)
    assert not valid
    assert reason.startswith('Multiple')

    graph = {
        'a': ['b', 'c'],
        'b': ['c', 'd'],
        'c': ['d'],
        'd': [],
    }
    valid, reason, rules = verify_structure(graph)
    assert valid
    assert rules == ['a', 'b', 'c', 'd']


if __name__ != 'vasansr':
    test_get_user_id_rules()
    test_stringify_grammar()
    test_iter_rhs()
    test_verify_structure()
    integration_test()
