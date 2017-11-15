from graph import iter_rhs


def generate_keywords_and_variables(grammar):
    keywords = set()
    variables = []

    for lhs in grammar:
        data = grammar[lhs]

        if data['type'] == 'variable':
            variables.append(lhs)
            continue

        # Must be a rule now.
        for value in iter_rhs(data['value']):
            if value not in grammar:
                keywords.add(value)

    return list(keywords), variables