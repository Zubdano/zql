from collections import Iterable

from arpeggio import Optional, ZeroOrMore, OneOrMore, EOF, ParserPython, NoMatch, RegExMatch
from logger import log

import os

# STATUSES
ACCEPT = 'accept'
REJECT = 'reject'
INCOMPLETE = 'incomplete'

GRAMMAR_FILE_NAME = "__init__.py"
GRAMMAR_FOLDER_NAME = "gen"

root = None
def generate_file_from_data(data):
    keywords = set(data['keywords'])
    variables = set(data['variables'])

    grammar_folder_path = os.path.dirname(__file__) + "/" + GRAMMAR_FOLDER_NAME
    if not os.path.isdir(grammar_folder_path):
        os.mkdir(grammar_folder_path)

    grammar_file_path = grammar_folder_path + "/" + GRAMMAR_FILE_NAME
    with open(grammar_file_path, "w+") as grammar_file:
        grammar_file.write("# AUTOMATICALLY GENERATED\n")
        grammar_file.write("from arpeggio import Optional, ZeroOrMore, OneOrMore, EOF, ParserPython, NoMatch, RegExMatch\n\n")
        for rulename, details in data['structure'].items():
            grammar_file.write("def {}(): ".format(rulename))
            if details['type'] == 'variable':
                grammar_file.write("return RegExMatch(r'{}')".format(details['value']))
            elif details['type'] == 'rule':
                grammar_file.write("return ")
                quoted_values = []
                if isinstance(details['value'][0], list):
                    values = [value[0] for value in details['value']]

                    if details['oneOrMore']:
                        grammar_file.write("OneOrMore({}, sep=',')".format(values))
                    else:
                        quoted_values = []
                        for value in values:
                            if value in data['structure'].keys():
                                quoted_values.append(value)
                            else:
                                quoted_values.append("'{}'".format(value))
                        grammar_file.write("[{}]".format(", ".join(quoted_values)))
                else:
                    for value in details['value']:
                        if value in keywords:
                            quoted_values.append('"{}"'.format(value))
                        else:
                            quoted_values.append(value)
                    grammar_file.write(", ".join(quoted_values))

            grammar_file.write('\n\n')

    root = __import__(GRAMMAR_FOLDER_NAME).root
    return init_keywords(root)

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
            if isinstance(rule, Iterable):
                # TODO: this happens in the case that a rule is
                # an xor of potential values. Thus, we would get
                # a list containing solely the value.
                # E.g. disease -> [hiv]

                values = []
                for subrule in rule:
                    value = str(subrule)
                    if value != ',':
                        values.append(value)
                yield (rule.rule_name, values)
            else:
                yield (rule.rule_name, str(rule))

def init_keywords(root_rule):
    log.info('Initializing keywords...')
    keywords = set()
    for base_rule in root_rule():
        grammar = base_rule()
        for rule in grammar:
            if isinstance(rule, str):
                # If a top-level rule is a string, then it must
                # be a keyword.
                keywords.add(rule)

    log.info('Keywords: ', keywords)
    return list(keywords)
