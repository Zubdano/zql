import Requestor from './requests/requestor';

const BASE_URL = 'http://localhost:5000';
const ANNOTATION_ROUTE = '/annotation/';

const RECEIVE_ANNOTATION = 'RECEIVE_ANNOTATION';
const UPDATE_WORD_TEXT = 'UPDATE_WORD_TEXT';

const initialState = {
  sentence: {
    words: [],
    errorMsg: null,
    isComplete: false,
    isError: false,
  },
};

// TODO: Rename
function reducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_ANNOTATION:
      // TODO: Finish
      return {
        ...state,
        sentence: action.sentence,
      };
    case UPDATE_WORD_TEXT:
      // TODO: copy old annotations
      return {
        ...state,
        sentence: {
          ...state.sentence,
          words: action.words.map(wordText => ({text: wordText})),
        }
      };
    default:
      return state;
  }
}

function updateWordText(words) {
  return {
    type: UPDATE_WORD_TEXT,
    words: words,
  };
}

function updateSentenceText(text) {
  return (dispatch) => dispatch(updateWordText(text.split(' ')));
}

function receiveAnnotation(sentence) {
  return {
    type: RECEIVE_ANNOTATION,
    sentence: sentence,
  };
}

function fetchAnnotation(sentence) {
  return (dispatch) => new Requestor(BASE_URL).post(ANNOTATION_ROUTE, sentence)
    .then(json => dispatch(receiveAnnotation(json)));
}

export {
  fetchAnnotation,
  updateSentenceText,
  reducer,
};
