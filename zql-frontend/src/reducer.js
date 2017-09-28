const initialState = {
  value: 0,
};

const SET_VALUE = 'SET_VALUE';

// TODO: Rename
function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_VALUE:
      return {
        ...state,
        value: action.value,
      };
    default:
      return state;
  }
}

function setValue(value) {
  return {
    type: SET_VALUE,
    value: value,
  };
}

export default reducer;
