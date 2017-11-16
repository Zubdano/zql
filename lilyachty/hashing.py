import hashlib
import json


def stringify_grammar(grammar):
    skeys = sorted(grammar.keys())
    deterministic = []

    for lhs in sorted(grammar.keys()):
        data = grammar[lhs]
        deterministic.append([lhs, data['type'], data['oneOrMore'], data['value']])

    return json.dumps(deterministic)

def hash_grammar(grammar):
    gs = stringify_grammar(grammar)
    return hashlib.md5(gs.encode('utf-8')).hexdigest()
