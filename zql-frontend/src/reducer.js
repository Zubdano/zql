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

const RECEIVE_ANNOTATION = 'RECEIVE_ANNOTATION';
const UPDATE_EDITOR_STATE = 'UPDATE_EDITOR_STATE';

// TODO: Move the entity stuff to another file
function matchCancerRegex(contentBlock, callback, contentState) {
  const text = contentBlock.getText();
  const re = /cancer/ig;
  let resArr, start;
  while (true) {
    resArr = re.exec(text);
    if (resArr === null) break;
    start = resArr.index;
    callback(start, start + resArr[0].length);
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

const CancerSpan = (props) => {
  return (
    <span style={{color: 'red'}}>
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

const decorator = new CompositeDecorator([
  {
    strategy: matchCancerRegex,
    component: CancerSpan,
  },
  {
    strategy: findEntitiesStrategy('ACCEPTED'),
    component: AcceptedSpan,
  },
]);

const initialState = {
  editorState: EditorState.createEmpty(decorator),
};

// TODO: Rename
function reducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_ANNOTATION:
      if (action.data[0].status === "accept") {
        const editorState = state.editorState;
        const contentState = editorState.getCurrentContent();

        // TODO: check if there is a block
        const firstBlock = contentState.getFirstBlock();
        const blockKey = firstBlock.getKey();
        const selectionState = new SelectionState({
          anchorKey: blockKey,
          anchorOffset: 0,
          focusKey: blockKey,
          focusOffset: firstBlock.getLength(),
        });

        const cursorSelectionState = new SelectionState({
          anchorKey: blockKey,
          anchorOffset: firstBlock.getLength(),
          focusKey: blockKey,
          focusOffset: firstBlock.getLength(),
          hasFocus: true,
        })

        const contentStateWithEntity = contentState.createEntity(
          'ACCEPTED',
          'SEGMENTED',
          null,
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const contentStateWithAccepted = Modifier.applyEntity(
          contentStateWithEntity,
          selectionState,
          entityKey,
        );
        const contentStateWithCursor = contentStateWithAccepted.merge({
          selectionBefore: cursorSelectionState,
          selectionAfter: cursorSelectionState,
        });

        return {
          ...state,
          editorState: EditorState.push(editorState, contentStateWithCursor, 'apply-entity'),
        };
      }
      return state;
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
    data: data,
  };
}

function fetchAnnotation(plainText) {
  return (dispatch) => new Requestor(BASE_URL).post(ANNOTATION_ROUTE, {raw: plainText})
    .then(json => dispatch(receiveAnnotation(json)));
}

export {
  fetchAnnotation,
  reducer,
  setEditorState,
};
