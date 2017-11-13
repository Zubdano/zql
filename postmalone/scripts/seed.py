import requests

events = []

for i in range(10):
    events.extend([
        {
            'user_id': 'ross{}'.format(i),
            'properties': {
                'disease': [ 'cancer' ],
            },
        },
        {
            'user_id': 'ross{}'.format(i),
            'properties': {
                'prescribed': [ 'chemo' ],
            },
        },
    ])

for event in events:
    requests.post('http://localhost:2015/event', json=event)
