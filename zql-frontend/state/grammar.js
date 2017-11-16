import { fromJS } from 'immutable';

import Requestor from '../requests/requestor';

const BASE_URL = 'http://localhost:2666';
// TODO: change these to the legit ones
const GET_GRAMMAR_ROUTE = '/grammar';
const CHANGE_GRAMMAR_ROUTE = '/changegrammar';

const RECEIVE_GRAMMAR = 'GRAMMAR_RECEIVE_GRAMMAR';
const RECEIVE_GRAMMAR_VALIDITY = 'GRAMMAR_RECEIVE_GRAMMAR_VALIDITY';
const INPUT_FIELDS_CHANGED = 'GRAMMAR_INPUT_FIELDS_CHANGED';
const RULES_CHANGED = 'GRAMMAR_RULES_LIST_CHANGED';
const VARIABLES_CHANGED = 'GRAMMAR_VARIABLES_LIST_CHANGED';

const initialState = {
  hasError: false,
  inputFields: fromJS({}),
  rules: fromJS([]).toSet(),
  variables: fromJS([]).toSet(),
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
    case RULES_CHANGED:
      return {
        ...state,
        rules: action.rules,
      };
    case VARIABLES_CHANGED:
      return {
        ...state,
        variables: action.variables,
      }; 
    default:
      return state;
  }
}

function receiveGrammar(data) {
  return {
    type: RECEIVE_GRAMMAR,
    grammar: fromJS(data.structure),
    variables: fromJS(data.variables).toSet(),
    rules: fromJS(data.rules).toSet(),
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

function rulesChanged(rules) {
  return {
    type: RULES_CHANGED,
    rules: rules,
  }
}

function variablesChanged(variables) {
  return {
    type: VARIABLES_CHANGED,
    variables: variables,
  }
}

function fetchGrammar() {
  return (dispatch) => new Requestor(BASE_URL).get(GET_GRAMMAR_ROUTE)
    .then(json => dispatch(receiveGrammar(json)));
}

function submitGrammar(grammar) {
  const data = JSON.stringify(grammar);
  return (dispatch) => new Requestor(BASE_URL).post(CHANGE_GRAMMAR_ROUTE, data)
    .then(json => dispatch(receiveGrammarValidity(json)));
}

function changeInputFields(inputFields) {
  return dispatch => dispatch(grammarChanged(inputFields));
}

function changeRules(rules) {
  return dispatch => dispatch(rulesChanged(rules));
}

function changeVariables(variables) {
  return dispatch => dispatch(variablesChanged(variables));
}

export {
  grammarReducer,
  changeInputFields,
  changeRules,
  changeVariables,
  fetchGrammar,
  submitGrammar,
};
