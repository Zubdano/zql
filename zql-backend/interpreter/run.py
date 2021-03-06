import logging
import argparse

from logging.handlers import RotatingFileHandler
from server import app


parser = argparse.ArgumentParser(description='Gateway to heaven.')
parser.add_argument('--port', type=int, default=2020)
parser.add_argument('--logging', type=bool, default=False)


if __name__ == '__main__':
    args = parser.parse_args()

    if args.logging:
        # Set up logging
        handler = RotatingFileHandler('logs/interpreter.log', maxBytes=10000, backupCount=1)
        logging.getLogger('werkzeug').addHandler(handler)
        logging.getLogger('interpreter').addHandler(handler)
        app.logger.addHandler(handler)

    app.run(threaded=True, port=args.port)
