class APIError(Exception):
    def __init__(self, message, status_code=None):
        Exception.__init__(self)
        self.message = message
        self.status_code = status_code or 400

    def to_dict(self):
        return {'error': self.message}
