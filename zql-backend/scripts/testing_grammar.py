from arpeggio import Optional, ZeroOrMore, OneOrMore, EOF, ParserPython, NoMatch
from arpeggio import RegExMatch

def root(): return [diagnosis_grammar, examination_grammar]

def diagnosis_grammar(): return 'diagnosed', patient, 'with', disease

def examination_grammar(): return 'examined', patient, 'with', exam

def disease(): return ['cancer', 'hiv', 'aids']

def exam(): return ['catscan', 'anal probe', 'needle probe']

def patient(): return RegExMatch(r'\w+')

# grammars = root()
# print(grammars)
# print(grammars[0].__name__)
# exit(0)

parser = ParserPython(root, memoization=True)

inputstring = "diagnosed someone with hiv"

try:
    match_root = parser.parse(inputstring)
    match_grammar = match_root[0]
    for rule in match_grammar:
        print(str(rule), rule.rule_name)


except NoMatch as e:
    print('No match!')
    print(e.__dict__)
    print('len input', len(inputstring))

    for rule in e.rules:
        if isinstance(rule, RegExMatch):
            print('dis a regex')
            print(rule.rule_name)
        else:
            print('dis a value')
            print(str(rule))
