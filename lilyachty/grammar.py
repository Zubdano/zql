from pymongo import MongoClient

# db = MongoClient().grammar


def generate_keywords(grammar):
    return []

def persist(user_id, grammar, keywords):
    return True

def handle_grammar_update(user_id, grammar):
    graph = construct_graph()
    valid, reason = verify_structure(graph)
    keywords = generate_keywords()
    success = persist(user_id, grammar, keywords)
