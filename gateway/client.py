import requests
import server

from abc import ABCMeta, abstractmethod


class BaseClient(metaclass=ABCMeta):
    def make_request(self, route, method, data, headers):
        try:
            return self._make_request(route, method, data, headers)
        except Exception as e:
            print('Could not forward request. Reason:', str(e))
            return {'error': str(e)}, 400

    @abstractmethod
    def _make_request(self, route, method, data, headers):
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

    def _make_request(self, route, method, data, headers):
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
    def _make_request(self, route, method, data, headers):
        pass


class AuthDecorator(ClientDecorator):
    """
    Decorator for performing both authentication and authorization.
    Sends user id and permission level downstream.
    """

    def __init__(self, next_client):
        super().__init__(next_client)

    def _make_request(self, route, method, data, headers):
        token = headers['Token']

        user = self._fetch_user(token)
        if not user:
            raise Exception('Could not find user with token {}'.format(token))

        headers['User.Id'] = str(user['_id'])
        headers['User.Permission'] = user['permission']

        return self._next.make_request(route, method, data, headers)

    def _fetch_user(self, token):
        return server.mongo.db.users.find_one({'token': token})
