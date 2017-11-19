import requests

submissions = []

for i in range(10):
    submissions.extend([
        'diagnosed pranav{} with cancer'.format(chr(65+i)),
        'performed chemo on pranav{}'.format(chr(65+i)),
    ])

for submission in submissions:
    requests.post('http://localhost:2015/event', json={'raw': submission})
