from graph import verify_structure, construct_graph


def integration_test():
    grammar = {
	"root": {
            'type': "rule",
            'oneOrMore': False,
            'value': [["diagnosed_rule"], ["ayylmfao"]]
        },
	"diagnosed_rule": {
            'type': "rule",
            'oneOrMore': False,
            'value': ["diagnosed", "patient", "with", "disease"]
        },
	"patient": {
            'type': "variable",
            'oneOrMore': False,
            'value': "[a-zA-Z]+"
        },
	"disease": {
            'type': "rule",
            'oneOrMore': False,
            'value': [["cancer"], ["diabetes"], ["aids"]]
        }
    }

    graph = construct_graph(grammar)
    print(graph)
    valid, reason = verify_structure(graph)
    print(valid, reason)


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
    integration_test()
