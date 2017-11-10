from client import AuthDecorator, HttpClient
from flask import Flask, jsonify, request


app = Flask(__name__)


# Initialize clients for all of our services.
# TODO: abstract away all the base URLs. These will be diff when we run on heroku.
# TODO: ping the server.
grammar        = AuthDecorator(HttpClient('http://127.0.0.1:2666/'))
interpreter    = AuthDecorator(HttpClient('http://127.0.0.1:2020/'))
postprocessing = AuthDecorator(HttpClient('http://127.0.0.1:2015/'))

mapping = {
    # Interpreter Service forwarders
    'interpret': interpreter,
    'keywords': interpreter, # TODO: move this to grammar service

    # Grammar Service forwarders
    'update_grammar': grammar,

    # Postprocessing Service forwarders
    'submit': postprocessing, # TODO: wtf does this do?
    'get_events': postprocessing,
}


def copy_headers():
    headers = {}
    for header in request.headers.keys():
        headers[header] = request.headers.get(header)

    return headers


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def forward(path):
    print('Forwarding route: %s method: %s' % (path, request.method))

    if path not in mapping:
        return jsonify({'error': 'Path not found in mapping'}), 401

    res, code = mapping[path].make_request(
            path, request.method, request.data, copy_headers())
    return jsonify(res), code
