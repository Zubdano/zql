import argparse

from server import app


parser = argparse.ArgumentParser(description='Now they always say congratulations.')
parser.add_argument('--port', type=int, default=2015)


if __name__ == '__main__':
    args = parser.parse_args()
    app.run(threaded=True, port=args.port)
