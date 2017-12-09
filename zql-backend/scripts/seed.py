import requests

submissions = []

for i in range(10):
    submissions.extend([
        'diagnosed pranav{} with cancer'.format(chr(65+i)),
        'performed chemotherapy on pranav{}'.format(chr(65+i)),
    ])

user_headers = {'User.Username': 'house', 'User.Permission': 1}

for submission in submissions:
    requests.post('http://localhost:2015/event', json={'input': submission}, headers=user_headers)
