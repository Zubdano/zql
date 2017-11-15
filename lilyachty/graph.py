class CycleFound(Exception):
    def __init__(self, msg):
        super().__init__()
        self.msg = msg


def nested(obj):
    return hasattr(obj, '__iter__') and not isinstance(obj, str)


def add_edges(graph, rule, values, rules):
    for value in values:
        if nested(value):
            add_edges(graph, rule, value, rules)
        else:
            if value in rules:
                graph[rule].append(value)


def construct_graph(grammar):
    graph = {}
    rules = filter(lambda lhs: grammar[lhs]['type'] == 'rule', grammar.keys())
    rules = set(rules)

    for rule in rules:
        graph[rule] = []
        add_edges(graph, rule, grammar[rule]['value'], rules)

    return dict(graph)


def dfs(v, graph, visited, ordering, current):
    if v in current:
        raise CycleFound(v)

    current.add(v)

    for u in graph[v]:
        if u not in visited:
            dfs(u, graph, visited, ordering, current)

    current.remove(v)
    visited.add(v)
    ordering.append(v)


def topological_sort(graph):
    visited = set()
    ordering = []

    for v in graph:
        if v not in visited:
            dfs(v, graph, visited, ordering, set())

    return ordering[::-1]

def verify_structure(graph):
    ordering = []
    try:
        ordering = topological_sort(graph)
    except CycleFound as e:
        return False, 'Cycle found including rule {}'.format(e.msg)

    # Now, run a DFS to get order from a root node.
    ordering2 = []
    dfs(ordering[0], graph, set(), ordering2, set())

    if len(ordering) != len(ordering2):
        return False, 'Multiple root nodes'
    
    return True, ''
