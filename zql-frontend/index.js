import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';

import './index.scss';
import App from './App';
import { reducer } from './reducer';

let store = createStore(reducer, applyMiddleware(thunk));

ReactDOM.render(
	<BrowserRouter>
	  <Provider store={store}>
	    <App />
	  </Provider>
	</BrowserRouter>,
  document.getElementById('root')
);