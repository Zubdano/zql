import uuid

from passlib.hash import sha256_crypt


class Permissions(object):
    """
    Enum for permissions
    """
    EDITOR = 0      # can edit the grammar
    WRITER = 1      # can write sentences and submit them to the system
    READER = 2      # can read sentences assigned to them

    ALL = frozenset([EDITOR, WRITER, READER])


def get_user_by_api_key(mongo, api_key):
    """
    Returns the user dictionary with the given API key or None if one doesn't exist.
    """
    return mongo.db.users.find_one({'api_key': api_key})


def login_user(mongo, username, password):
    """
    Returns the user with the given username and password or None if the data is invalid.
    """
    user = mongo.db.users.find_one({'username': username})
    if user and sha256_crypt.verify(password, user['password']):
        return {
            'username': user['username'],
            'permission': user['permission'],
            'api_key': user['api_key'],
        }

    return None


def create_user(mongo, username, password, permission):
    """
    Creates a user with the given attributes.
    """
    assert permission in Permissions.ALL, '{} is an invalid permission'.format(permission)
    assert not mongo.db.users.find_one({'username': username}), \
        'username {} already exists'.format(username)

    # Generate token for user
    while True:
        api_key = uuid.uuid4().hex[:24]
        if not mongo.db.users.find_one({'api_key': api_key}):
            break

    user = {
        'username': username,
        'password': _hash_password(password),
        'permission': permission,
        'api_key': api_key,
    }
    mongo.db.users.insert_one(user)

    return {
        'username': user['username'],
        'permission': user['permission'],
        'api_key': user['api_key'],
    }


def _hash_password(password):
    """
    Calculates and returns the hash of the password.
    """
    return sha256_crypt.encrypt(password)
