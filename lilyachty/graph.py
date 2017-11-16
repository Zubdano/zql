def construct_graph(grammar):
    """Constructs a graph representation of the input grammar.
    The graph contains only the LHS rules, and doesn't containt any free variables.
    Returns in an adjacency list format.
    """
    
    graph = {}
    rules = filter(lambda lhs: grammar[lhs]['type'] == 'rule', grammar.keys())
    rules = set(rules)

    for rule in rules:
        graph[rule] = []
        
        for value in iter_rhs(grammar[rule]['value']):
            if value in rules:
                graph[rule].append(value)

    return dict(graph)


def verify_structure(graph):
    """Verifies the structure of the graph, if it is a connected DAG."""
    
    ordering = []
    try:
        ordering = topological_sort(graph)
    except CycleFound as e:
        return False, 'Cycle found with rules {}'.format(', '.join(e.cycle)), None

    # Now, run a DFS to get order from a root node.
    ordering2 = []
    dfs(ordering[0], graph, set(), ordering2, set())

    if len(ordering) != len(ordering2):
        return False, 'Multiple root nodes', ordering
    
    return True, '', ordering


def iter_rhs(values):
    """Flattens the RHS values array which is passed by the frontend."""    
    for value in values:
        if nested(value):
            yield from iter_rhs(value)
        else:
            yield value


###
### PRIVATE HELPER FUNCTIONS
###


class CycleFound(Exception):
    def __init__(self, cycle):
        super().__init__()
        self.cycle = cycle


def nested(obj):
    return hasattr(obj, '__iter__') and not isinstance(obj, str)


def dfs(v, graph, visited, ordering, current):
    if v in current:
        raise CycleFound(current)

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
