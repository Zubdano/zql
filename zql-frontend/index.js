import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';

import './index.scss';
import App from './App';
import { textInputReducer } from './state/textInput';
import { grammarReducer } from './state/grammar';

const store = createStore(combineReducers({
  textInputReducer,
  grammarReducer,
}), applyMiddleware(thunk));

ReactDOM.render(
	<BrowserRouter>
	  <Provider store={store}>
	    <App />
	  </Provider>
	</BrowserRouter>,
  document.getElementById('root')
);
