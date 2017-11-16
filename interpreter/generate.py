import requests
import os

GRAMMAR_FILE_NAME = "__init__.py"
GRAMMAR_FOLDER_NAME = "gen"

GRAMMAR_ID = "5a0bc90e734d1d08bf70e0ff"
GRAMMAR_URL = "http://localhost:2666/grammar/{}".format(GRAMMAR_ID)

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
    return root

def get_grammar_root():
    # TODO: Verify hashes or update
    res = requests.get(GRAMMAR_URL)
    return generate_file_from_data(res.json())
