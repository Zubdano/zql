import { fromJS } from 'immutable';

import Requestor from '../requests/requestor';
import { BASE_URL } from '../requests/constants';

// TODO: change these to the legit ones
const GET_GRAMMAR_ROUTE = '/grammars';
const CHANGE_GRAMMAR_ROUTE = '/grammar/';

const RECEIVE_GRAMMAR = 'GRAMMAR_RECEIVE_GRAMMAR';
const RECEIVE_GRAMMAR_VALIDITY = 'GRAMMAR_RECEIVE_GRAMMAR_VALIDITY';
const INPUT_FIELDS_CHANGED = 'GRAMMAR_INPUT_FIELDS_CHANGED';
const RULES_CHANGED = 'GRAMMAR_RULES_LIST_CHANGED';
const VARIABLES_CHANGED = 'GRAMMAR_VARIABLES_LIST_CHANGED';
const FOCUSED_CLASS_CHANGED = 'GRAMMAR_FOCUSED_CLASS_CHANGED';

const initialState = {
  error: null,
  inputFields: fromJS({}),
  focusedClass: 'chip-0-0',
  rules: fromJS([]).toSet(),
  variables: fromJS([]).toSet(),
};

function grammarReducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_GRAMMAR:
      return {
        ...state,
        id: action.id,
        inputFields: action.grammar,
        variables: action.variables,
        rules: action.rules,
        focusedClass: 'chip-0-0',
      };
    case INPUT_FIELDS_CHANGED:
      return {
        ...state,
        inputFields: action.grammar,
      };
    case RECEIVE_GRAMMAR_VALIDITY:
      return {
        ...state,
        error: action.error,
      };
    case FOCUSED_CLASS_CHANGED:
      return {
        ...state,
        focusedClass: action.focusClass,
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

function changeReceivedGrammar(data) {
  data = fromJS(data);
  let grammar = data.get('structure');
  let newGrammar = fromJS([]);

  grammar.map((value, key) => {
    let numVals = value.get('value').size;
    let newValue = value.get('value').get(numVals - 1).size;
    // let newValue = value.get('value').setIn([numVals - 1, numTokens], "");
    newGrammar = newGrammar.push(
      fromJS({
        key: key,
        oneOrMore: value.get('oneOrMore'),
        isPrimary: value.get('isPrimary'),
        value: value.get('value'),
      })
    );
  });

  return newGrammar;
}

function receiveGrammar(data) {
  let grammar = changeReceivedGrammar(data[0]);

  return {
    type: RECEIVE_GRAMMAR,
    id: data[0]._id,
    grammar: grammar,
    variables: fromJS(data[0].variables).toSet(),
    rules: fromJS([]).toSet(),
  };
}

function receiveGrammarValidity(data) {
  return {
    type: RECEIVE_GRAMMAR_VALIDITY,
    error: data.error, 
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

function focusClassChanged(focusClass) {
  return {
    type: FOCUSED_CLASS_CHANGED,
    focusClass: focusClass,
  }
}

function fetchGrammar() {
  return (dispatch) => new Requestor(BASE_URL).get(GET_GRAMMAR_ROUTE)
    .then(json => {dispatch(receiveGrammar(json));});
}

function submitGrammar(grammar, grammarId) {
  return (dispatch) => new Requestor(BASE_URL).post(CHANGE_GRAMMAR_ROUTE + grammarId, grammar)
    .then(json => dispatch(receiveGrammarValidity({})))
    .catch(error => dispatch(receiveGrammarValidity({error: error.message})));

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

function changeFocusClass(focusClass) {
  return dispatch => dispatch(focusClassChanged(focusClass));
}

export {
  grammarReducer,
  changeInputFields,
  changeRules,
  changeVariables,
  changeFocusClass,
  fetchGrammar,
  submitGrammar,
};
