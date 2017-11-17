import hashlib
import importlib
import os
import requests

GRAMMAR_FILE_NAME = "__init__.py"
GRAMMAR_FOLDER_NAME = "gen"

GRAMMAR_ID = "5a0bc90e734d1d08bf70e0ff"
GRAMMAR_URL = "http://localhost:2666/grammar/{}".format(GRAMMAR_ID)

class GrammarRule:
    def __init__(self, text, data_hash):
        self.text = text
        self.data_hash = data_hash

class GrammarRuleFactory:
    def __init__(self):
        self.rules = {}

    def _get_hash_from_dict(self, d):
        return hashlib.md5(str(d).encode('utf-8')).hexdigest()

    def get_or_create_rule(self, rulename, details, keywords):
        """
        Creates a GrammarRule if it doesn't exist
        """

        if rulename not in self.rules.keys() or self.rules[rulename].data_hash != self._get_hash_from_dict(details):
            func_string = self._get_func_string(rulename, details, keywords)
            self.rules[rulename] = GrammarRule(func_string, self._get_hash_from_dict(details))
        return self.rules[rulename]

    def delete_rule(self, rulename):
        """
        Deletes a rule
        """
        if rulename in self.rules:
            del self.rules[rulename]

    def _get_func_string(self, rulename, details, keywords):
        res = "def {}(): ".format(rulename)
        if details['type'] == 'variable':
            res += "return RegExMatch(r'{}')".format(details['value'][0])
        elif details['type'] == 'rule':
            res += "return "
            final_value = ''

            print(details)
            if details['join'] == 'and':
                final_value += "{}".format(", ".join(self._fix_list(details['value'], keywords)))
            elif details['join'] == 'or':
                final_value += "[{}]".format(", ".join(self._fix_list(details['value'], keywords)))

            if details['oneOrMore']:
                final_value = "OneOrMore({}, sep=',')".format(final_value)

            res += final_value

        return res

    def _fix_list(self, l, keywords):
        result = []
        for item in l:
            if item in keywords:
                result.append('"{}"'.format(item))
            else:
                result.append(item)
        return result

grammarRuleFactory = GrammarRuleFactory()

class GrammarState:
    current_hash = ''
    primary_key = None
    gen_module = None

def _verify_hash(data):
    if data['hash'] == GrammarState.current_hash:
        return True
    GrammarState.current_hash = data['hash']
    return False

def _generate_file_from_data(data):
    if _verify_hash(data):
        importlib.reload(GrammarState.gen_module)

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
            rule = grammarRuleFactory.get_or_create_rule(rulename, details, keywords)

            if details['isPrimary']:
                GrammarState.primary_key = rulename

            grammar_file.write(rule.text)
            grammar_file.write('\n\n')

    GrammarState.gen_module = importlib.import_module(GRAMMAR_FOLDER_NAME)
    importlib.reload(GrammarState.gen_module)

def get_grammar_root():
    res = requests.get(GRAMMAR_URL)
    _generate_file_from_data(res.json())

    return GrammarState.gen_module.root
