import argparse

from server import app


parser = argparse.ArgumentParser(description='Gateway to heaven.')
parser.add_argument('--port', type=int, default=2420)


if __name__ == '__main__':
    args = parser.parse_args()
    app.run(threaded=True, port=args.port)
