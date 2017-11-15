from graph import *

def test_verify_structure():
    graph = {
        'a': ['b', 'c'],
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
    test_verify_structure()
