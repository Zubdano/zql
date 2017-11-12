import { fromJS } from 'immutable';

import Requestor from '../requests/requestor';

const BASE_URL = 'http://localhost:5000';
const GET_EVENTS_ROUTE = '/events';

const RECEIVE_EVENTS = 'EVENTS_RECEIVE_EVENTS';

const initialState = {
  events: fromJS([
    {
      'eventId': '1',
      'properties': {
        'disease': ['cancer'],
        'patient': 'pranav', 
      }
    },
    {
      'eventId': '2',
      'properties': {
        'exams': ['colonoscopy'], 
        'patient': 'pranav',
      }
    },
    {
      'eventId': '3',
      'properties': {
        'exams': ['catscan', 'colonoscopy'], 
        'patient': 'ross',
      }
    },
    {
      'eventId': '4',
      'properties': {
        'disease': ['cancer', 'aids'],
        'patient': 'pranav', 
      }
    },
  ]),
};

function eventsReducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_EVENTS:
      return {
        ...state,
        events: action.events,
      };
    default:
      return state;
  }
}

function receiveEvents(events) {
  return {
    type: RECEIVE_EVENTS,
    events: events,
  };
}

function fetchEvents() {
  // TODO: Fetch for particular user_id, probably using auth
  return (dispatch) => new Requestor(BASE_URL).get(GET_EVENTS_ROUTE)
    .then(json => dispatch(receiveEvents(json)));
}

export {
  eventsReducer,
  fetchEvents,
};
