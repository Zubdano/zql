import { fromJS } from 'immutable';

import Requestor from '../requests/requestor';
import { BASE_URL } from '../requests/constants';

const GET_EVENTS_ROUTE = '/events';

const RECEIVE_EVENTS = 'EVENTS_RECEIVE_EVENTS';

const initialState = {
  events: fromJS({predicted: null, eventlog: []}),
};

function eventsReducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_EVENTS:
      return {
        ...state,
        events: fromJS(action.events),
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
