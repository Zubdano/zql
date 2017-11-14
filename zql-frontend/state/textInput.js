import React from 'react';
import {
  CompositeDecorator,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
import { List, fromJS } from 'immutable';

import createIssueSuggestionPlugin, { defaultSuggestionsFilter } from '../plugin'
import Requestor from '../requests/requestor';

const BASE_URL = 'http://localhost:5000';
const ANNOTATION_ROUTE = '/annotation/';
const KEYWORDS_ROUTE = '/keywords/';

const RECEIVE_ANNOTATION = 'TEXT_INPUT_RECEIVE_ANNOTATION';
const RECEIVE_KEYWORDS = 'TEXT_INPUT_RECEIVE_KEYWORDS';
const UPDATE_EDITOR_STATE = 'TEXT_INPUT_UPDATE_EDITOR_STATE';
const UPDATE_SEARCH_VALUE = 'TEXT_INPUT_UPDATE_SEARCH_VALUE';
const CLEAR_ALL = 'TEXT_INPUT_CLEAR_ALL';

function filterSuggestions(searchValue, allSuggestions) {
  return defaultSuggestionsFilter(searchValue, allSuggestions);
}

const KeywordSpan = (props) => {
  return (
    <span style={{color: 'blue', fontWeight: 900}}>
      {props.children}
    </span>
  );
};

class KeywordMatcher {
  constructor(keywords = []) {
    this._keywords = keywords;
  }

  setKeywords(keywords) {
    this._keywords = keywords;
  }

  getStrategy = (contentBlock, callback, contentState) => {
    if (this._keywords.length > 0) {
      const text = contentBlock.getText();
      const re = new RegExp(`\\b(${this._keywords.join('|')})\\b`, 'ig');
      let resArr, start;
      while (true) {
        resArr = re.exec(text);
        if (resArr === null) break;
        start = resArr.index;
        callback(start, start + resArr[0].length);
      }
    }
  }
};

// Hacky way to set the keyword decorator after the fact
const keywordMatcher = new KeywordMatcher();
const keywordDecorator = {
  'strategy': keywordMatcher.getStrategy,
  'component': KeywordSpan,
};

const initialState = {
  editorState: EditorState.createEmpty(),
  autocompletePlugin: createIssueSuggestionPlugin(),
  suggestions: List(),
  allSuggestions: List(),
  searchValue: '',
  status: null,
  inputFields: fromJS([]),
};

function textInputReducer(state = initialState, action) {
  switch (action.type) {
    case CLEAR_ALL:
      return {
        ...state,
        suggestions: List(),
        allSuggestions: List(),
        searchValue: '',
        status: null,
      }
    case RECEIVE_ANNOTATION:
      const plainSuggestions = action.suggestions.filter(({type}) => type === 'value')
                                                 .map(({suggest}) => suggest);
      const allSuggestions = fromJS(plainSuggestions);
      return {
        ...state,
        allSuggestions: allSuggestions,
        suggestions: filterSuggestions(state.searchValue, allSuggestions),
        status: action.status,
      };
    case RECEIVE_KEYWORDS:
      keywordMatcher.setKeywords(action.keywords);
      return state;
    case UPDATE_EDITOR_STATE:
      return {
        ...state,
        editorState: action.editorState,
      };
    case UPDATE_SEARCH_VALUE:
      return {
        ...state,
        searchValue: action.searchValue,
        suggestions: filterSuggestions(action.searchValue, state.allSuggestions),
      }
    default:
      return state;
  }
}

function receiveAnnotation(data) {
  return {
    type: RECEIVE_ANNOTATION,
    rejectIndex: data.rejectIndex,
    suggestions: data.suggestions,
    status: data.status,
  };
}

function receiveKeywords(data) {
  return {
    type: RECEIVE_KEYWORDS,
    keywords: data,
  }
}

function updateEditorState(editorState) {
  return {
    type: UPDATE_EDITOR_STATE,
    editorState: editorState,
  };
}

function updateSearchValue(searchValue) {
  return {
    type: UPDATE_SEARCH_VALUE,
    searchValue: searchValue,
  }
}

function fetchAnnotation(plainText) {
  const data = {raw: plainText.toLowerCase()};
  return (dispatch) => new Requestor(BASE_URL).post(ANNOTATION_ROUTE, data)
    .then(json => dispatch(receiveAnnotation(json)));
}

function fetchKeywords() {
  return (dispatch) => new Requestor(BASE_URL).get(KEYWORDS_ROUTE)
    .then(json => dispatch(receiveKeywords(json)));
}

function setEditorState(editorState) {
  return (dispatch) => dispatch(updateEditorState(editorState));
}

function setSearchValue(searchValue) {
  return (dispatch) => dispatch(updateSearchValue(searchValue));
}

function clearAll() {
  return (dispatch) => dispatch({ type: CLEAR_ALL });
}

export {
  clearAll,
  fetchAnnotation,
  fetchKeywords,
  setEditorState,
  setSearchValue,
  textInputReducer,
  keywordDecorator,
};
