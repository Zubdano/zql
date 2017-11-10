import argparse
import logging

from logging.handlers import RotatingFileHandler
from server import app


parser = argparse.ArgumentParser(description='Rap demon.')
parser.add_argument('--port', type=int, default=2666)
parser.add_argument('--logging', type=bool, default=False)


if __name__ == '__main__':
    args = parser.parse_args()

    if args.logging:
        # Set up logging
        handler = RotatingFileHandler('logs/lilyachty.log', maxBytes=10000, backupCount=1)
        logging.getLogger('werkzeug').addHandler(handler)
        app.logger.addHandler(handler)

    app.run(threaded=True, port=args.port)
