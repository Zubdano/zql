import requests

submissions = []


# requests.post('http://localhost:2420/create_user', json={'username': 'editor', 'password': 'minecraft', 'permission': 0})
# requests.post('http://localhost:2420/create_user', json={'username': 'writer', 'password': 'minecraft', 'permission': 1})
# requests.post('http://localhost:2420/create_user', json={'username': 'reader', 'password': 'minecraft', 'permission': 2})

for i in range(10):
    submissions.extend([
        'diagnosed pranav{} with cancer'.format(chr(65+i)),
        'performed chemotherapy on pranav{}'.format(chr(65+i)),
    ])

for submission in submissions:
    r = requests.post('http://localhost:2015/event', json={'raw': submission}, headers={'User.Username': 'vasan', 'User.Permission': '0'})
    print(r.content)
