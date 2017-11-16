from functools import wraps
import os

from client import AuthDecorator, HttpClient
from flask import Flask, jsonify, request, g
from flask_pymongo import PyMongo

from auth import create_user, get_user_by_token, login_user
from errors import APIError


app = Flask(__name__)
mongo_uri = 'mongodb://{}:{}@ds259325.mlab.com:59325/zql'
app.config['MONGO_URI'] = mongo_uri.format(os.environ['ZQL_MONGO_USER'], os.environ['ZQL_MONGO_PASS'])
mongo = PyMongo(app)


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
    'grammar': grammar,
    'grammars': grammar,

    # Postprocessing Service forwarders
    'submit': postprocessing, # TODO: wtf does this do?
    'events': postprocessing,
}


def copy_headers():
    headers = {}
    for header in request.headers.keys():
        headers[header] = request.headers.get(header)

    return headers


# TBH idk why we need this, but doesn't work without it when testing on localhost
# For now, just add this to POST request handlers
def access_control(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            resp = Flask.make_default_options_response(app)
            resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,token'
            resp.headers['Content-Type'] = 'application/json'
        else:
            resp = func(*args, **kwargs)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    return wrapper


@app.route('/login', methods=['POST', 'OPTIONS'])
@access_control
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    if username is None or password is None:
        raise APIError('Missing username or password', status_code=409)

    user = login_user(mongo, username, password)
    if not user:
        raise APIError('Incorrect username/password', status_code=409)

    return jsonify(user)


@app.route('/create_user', methods=['POST', 'OPTIONS'])
@access_control
def new_user():
    username = request.json.get('username')
    password = request.json.get('password')
    permission = request.json.get('permission')

    if username is None or password is None or permission is None:
        raise APIError('Missing username, password or permission', status_code=409)

    try:
        user = create_user(mongo, username, password, permission)
    except AssertionError as e:
        raise APIError(e.args[0])

    return jsonify(user)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
@access_control
def forward(path):
    app.logger.info('Forwarding route: %s method: %s' % (path, request.method))

    forwarder = path.split('/')[0]
    if forwarder not in mapping:
        raise APIError('Path not found in mapping', 401)

    res, code = mapping[forwarder].make_request(
            path, request.method, request.data, copy_headers())

    resp = jsonify(res)
    print(res, code)
    resp.status_code = code
    return resp


@app.errorhandler(APIError)
def handle_api_error(e):
    response = jsonify(e.to_dict())
    response.status_code = e.status_code
    return response
