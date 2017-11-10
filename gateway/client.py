import requests
from abc import ABCMeta, abstractmethod


class BaseClient(metaclass=ABCMeta):
    @abstractmethod
    def make_request(self, route, method, data, headers):
        # Returns: result[dict], status_code[int]
        pass

class HttpClient(BaseClient):
    """
    Basic client to forward HTTP requests and relay their response.
    """

    def __init__(self, base_url):
        # NOTE: all base urls must end with '/'
        assert base_url.endswith('/')

        self._base_url = base_url

    def get_base_url(self):
        return self._base_url

    def make_request(self, route, method, data, headers):
        url = self.get_base_url() + route
        r = requests.request(method=method, url=url, data=data, headers=headers)

        status_code = r.status_code
        result = {}
        try:
            result = r.json()
        except ValueError:
            result = {'error': 'Could not parse JSON'}
            status_code = 400
        
        return result, status_code


class ClientDecorator(BaseClient):
    def __init__(self, next_client):
        self._next = next_client

    @abstractmethod
    def make_request(self, route, method, data, headers):
        pass


class AuthDecorator(ClientDecorator):
    """
    Decorator for performing both authentication and authorization.
    Sends user id and permission level downstream.
    """

    def __init__(self, next_client):
        super().__init__(next_client)

    def make_request(self, route, method, data, headers):
        token = headers['Token']
        user = self._fetch_user(token)
        headers['user.id'] = user['id']
        headers['user.permission'] = user['permission']

        return self._next.make_request(route, method, data, headers)

    def _fetch_user(self, token):
        # TODO: actually use mongo for this
        # Also it's weird that it lives here.
        return {'id': '123', 'permission': 0}
