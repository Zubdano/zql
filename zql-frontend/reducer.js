import React from 'react';
import {
  CompositeDecorator,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';

import Requestor from './requests/requestor';

const BASE_URL = 'http://localhost:5000';
const ANNOTATION_ROUTE = '/annotation/';
const KEYWORDS_ROUTE = '/keywords/';

const RECEIVE_ANNOTATION = 'RECEIVE_ANNOTATION';
const RECEIVE_KEYWORDS = 'RECEIVE_KEYWORDS';
const UPDATE_EDITOR_STATE = 'UPDATE_EDITOR_STATE';

// TODO: Move the entity stuff to another file
function matchKeywordsStrategy(keywords) {
  return (contentBlock, callback, contentState) => {
    const text = contentBlock.getText();
    const re = new RegExp(`\\b${keywords.join('|')}\\b`, 'ig');
    let resArr, start;
    while (true) {
      resArr = re.exec(text);
      if (resArr === null) break;
      start = resArr.index;
      callback(start, start + resArr[0].length);
    }
  }
}

function findEntitiesStrategy(type) {
  return (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === type
        );
      },
      callback
    );
  }
}

const KeywordSpan = (props) => {
  return (
    <span style={{color: 'blue', fontWeight: 900}}>
      {props.children}
    </span>
  );
};

const AcceptedSpan = (props) => {
  return (
    <span data-offset-key={props.offsetkey} style={{color: 'green'}}>
      {props.children}
    </span>
  )
}

const initialDecorator = new CompositeDecorator([
  {
    strategy: findEntitiesStrategy('ACCEPTED'),
    component: AcceptedSpan,
  },
]);

const initialState = {
  editorState: EditorState.createEmpty(initialDecorator),
};

// TODO: Rename
function reducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_ANNOTATION:
      return state;
    case RECEIVE_KEYWORDS:
      const withKeywordDecorator = new CompositeDecorator([
        {
          'strategy': matchKeywordsStrategy(action.keywords),
          'component': KeywordSpan,
        }
      ]);
      const editorStateWithDecorator = EditorState.set(state.editorState, {
        decorator: withKeywordDecorator,
      });

      return {
        ...state,
        editorState: editorStateWithDecorator,
      };
    case UPDATE_EDITOR_STATE:
      return {
        ...state,
        editorState: action.editorState,
      };
    default:
      return state;
  }
}

function updateEditorState(editorState) {
  return {
    type: UPDATE_EDITOR_STATE,
    editorState: editorState,
  };
}

function setEditorState(editorState) {
  return (dispatch) => dispatch(updateEditorState(editorState));
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

function fetchAnnotation(plainText) {
  const data = {raw: plainText.toLowerCase()};
  return (dispatch) => new Requestor(BASE_URL).post(ANNOTATION_ROUTE, data)
    .then(json => dispatch(receiveAnnotation(json)));
}

function fetchKeywords() {
  return (dispatch) => new Requestor(BASE_URL).get(KEYWORDS_ROUTE)
    .then(json => dispatch(receiveKeywords(json)));
}

export {
  fetchAnnotation,
  fetchKeywords,
  reducer,
  setEditorState,
};
