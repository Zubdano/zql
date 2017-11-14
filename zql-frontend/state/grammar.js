import { fromJS } from 'immutable';

import Requestor from '../requests/requestor';

const BASE_URL = 'http://localhost:5000';
// TODO: change these to the legit ones
const GET_GRAMMAR_ROUTE = '/getgrammar';
const CHANGE_GRAMMAR_ROUTE = '/changegrammar';

const RECEIVE_GRAMMAR = 'GRAMMAR_RECEIVE_GRAMMAR';
const RECEIVE_GRAMMAR_VALIDITY = 'GRAMMAR_RECEIVE_GRAMMAR_VALIDITY';
const INPUT_FIELDS_CHANGED = 'GRAMMAR_INPUT_FIELDS_CHANGED';

const initialState = {
  inputFields: fromJS({}),
  hasError: false,
};

function grammarReducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_GRAMMAR:
    case INPUT_FIELDS_CHANGED:
      return {
        ...state,
        inputFields: action.grammar,
      };
    case RECEIVE_GRAMMAR_VALIDITY:
      return {
        ...state,
        hasError: !action.grammarValid,
      };
    default:
      return state;
  }
}

function receiveGrammar(data) {
  return {
    type: RECEIVE_GRAMMAR,
    grammar: data,
  };
}

function receiveGrammarValidity(data) {
  // TODO: error message
  return {
    type: RECEIVE_GRAMMAR_VALIDITY,
    grammarValid: data.grammarValid, 
  };
}

function grammarChanged(grammar) {
  return {
    type: INPUT_FIELDS_CHANGED,
    grammar: grammar,
  };
}

function fetchGrammar() {
  // return {
  //   type: RECEIVE_GRAMMAR,
  //   grammar: fromJS([]),
  // };
  return (dispatch) => new Requestor(BASE_URL).get(GET_GRAMMAR_ROUTE)
    .then(json => dispatch(receiveGrammar(json)));
}

function submitGrammar(grammar) {
  const data = grammar.toJSON();
  return (dispatch) => new Requestor(BASE_URL).post(CHANGE_GRAMMAR_ROUTE, data)
    .then(json => dispatch(receiveGrammarValidity(json)));
}

function changeInputFields(inputFields) {
  return dispatch => dispatch(grammarChanged(inputFields));
}

export {
  grammarReducer,
  changeInputFields,
  fetchGrammar,
  submitGrammar,
};
