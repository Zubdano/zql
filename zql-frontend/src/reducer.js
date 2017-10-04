import { EditorState } from 'draft-js';

import Requestor from './requests/requestor';

const BASE_URL = 'http://localhost:5000';
const ANNOTATION_ROUTE = '/annotation/';

const RECEIVE_ANNOTATION = 'RECEIVE_ANNOTATION';
const UPDATE_EDITOR_STATE = 'UPDATE_EDITOR_STATE';

const initialState = {
  editorState: EditorState.createEmpty(),
};

// TODO: Rename
function reducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_ANNOTATION:
      console.log(action.data);
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
