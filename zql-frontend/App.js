import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import './App.scss';
import MainRouter from './components/MainRouter';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
    };
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to ZQL</h1>
        </header>
        <Link to='/'>Text Input</Link>
        <Link to='/grammar'>Grammar Editor</Link>
        <Link to='/events'>Events</Link>
        <MainRouter />
      </div>
    );
  }
}

export default App;
