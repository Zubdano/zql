import requests
import importlib
import os

GRAMMAR_FILE_NAME = "__init__.py"
GRAMMAR_FOLDER_NAME = "gen"

GRAMMAR_ID = "5a0bc90e734d1d08bf70e0ff"
GRAMMAR_URL = "http://localhost:2666/grammar/{}".format(GRAMMAR_ID)

current_hash = ''
primary_keys = set()
gen = None

def fix_list(l, keywords):
    result = []
    for item in l:
        if item in keywords:
            result.append('"{}"'.format(item))
        else:
            result.append(item)
    return result

def sanitize_values(values, keywords):
    result = []
    for value in values:
        fixed_value = fix_list(value, keywords)
        if len(fixed_value) == 1:
            result.append(fixed_value[0])
        else:
            result.append(tuple(fixed_value))

    if len(result) == 1:
        return "{}".format(", ".join(result[0]))
    return "[{}]".format(", ".join(result))

def verify_hash(data):
    global current_hash
    if data['hash'] == current_hash:
        return True
    current_hash = data['hash']
    return False

def generate_file_from_data(data):
    global gen, primary_keys
    if verify_hash(data):
        importlib.reload(gen)
        return gen.root

    keywords = set(data['keywords'])
    variables = set(data['variables'])
    primary_keys = set()

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
                grammar_file.write("return RegExMatch(r'{}')".format(details['value'][0][0]))
            elif details['type'] == 'rule':
                grammar_file.write("return ")
                values = sanitize_values(details['value'], keywords)

                if details['oneOrMore']:
                    grammar_file.write("OneOrMore({}, sep=',')".format(values))
                else:
                    grammar_file.write(values)

            if details['isPrimary']:
                primary_keys.add(rulename)

            grammar_file.write('\n\n')

    gen = importlib.import_module(GRAMMAR_FOLDER_NAME)
    importlib.reload(gen)
    return gen.root

def get_grammar_root():
    # TODO: Verify hashes or update
    res = requests.get(GRAMMAR_URL)
    return generate_file_from_data(res.json())
