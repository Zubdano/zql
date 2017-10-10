import React, { Component } from 'react';

import './App.scss';
import TextInput from './components/TextInput';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to ZQL</h1>
        </header>
        <TextInput />
      </div>
    );
  }
}

export default App;
