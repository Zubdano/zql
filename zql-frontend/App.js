import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom'

import './App.scss';
import MainRouter from './components/MainRouter';
import Header from './components/Header';
import { auth, Permissions } from './requests/auth';

class App extends Component {

  render() {
    return (
      <div className="App">
        <Header />
        <MainRouter />
      </div>
    );
  }
}

export default withRouter(App);
