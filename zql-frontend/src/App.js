import React, { Component } from 'react';

import logo from './logo.svg';
import './App.css';
import TextInput from './TextInput';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to ZQL</h1>
        </header>
        <p className="App-intro">
          Ayy yo boi, type sum shit
        </p>
        <TextInput />
      </div>
    );
  }
}

export default App;
