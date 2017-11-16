import server

from bson.objectid import ObjectId


def persist_grammar(grammar_id, grammar, hsh, rules, keywords, variables):
    doc = {
        'structure': grammar,
        'hash': hsh,
        'rules': rules,
        'keywords': keywords,
        'variables': variables
    }

    try:
        server.mongo.db.grammars.update_one({'_id': ObjectId(grammar_id)}, {'$set': doc})
        return True, ''
    except Except as e:
        return False, str(e)
