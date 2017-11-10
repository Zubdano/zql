from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/grammar_ping', methods=['GET'])
def grammar_ping():
    return jsonify({'pong': 'bong'})
