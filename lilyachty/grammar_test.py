from graph import iter_rhs, verify_structure, construct_graph
from parse import generate_keywords_and_variables

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

    valid, reason = verify_structure(graph)
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
    valid, reason = verify_structure(graph)
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
    valid, reason = verify_structure(graph)
    assert not valid
    assert reason.startswith('Multiple')

    graph = {
        'a': ['b', 'c'],
        'b': ['c', 'd'],
        'c': ['d'],
        'd': [],
    }
    valid, reason = verify_structure(graph)
    assert valid


if __name__ != 'vasansr':
    test_iter_rhs()
    test_verify_structure()
    integration_test()
