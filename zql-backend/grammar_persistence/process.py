from graph import construct_graph, verify_structure
from parse import generate_keywords_and_variables, get_user_id_rules
from hashing import hash_grammar
from persist import persist_grammar


def process_grammar(grammar_id, grammar):
    # Produce a graph representing the grammar.
    graph = construct_graph(grammar)
    
    # Verify the structural integrity of the graph.
    # Rules are returned in topological order of dependency.
    valid, reason, rules = verify_structure(graph)
    if not valid:
        return valid, reason

    # Verify that there is only one user_id rule.
    user_id_rules = get_user_id_rules(grammar)
    if len(user_id_rules) > 1:
        return False, 'Only one of {} can be the user id'.format(', '.join(user_id_rules))

    # Parse to generate the keywords and variables from the grammar.
    keywords, variables = generate_keywords_and_variables(grammar)

    # Hash the grammar deterministically
    hsh = hash_grammar(grammar)

    # Attempt to persist the grammar to mongo.
    return persist_grammar(grammar_id, grammar, hsh, rules, keywords, variables)