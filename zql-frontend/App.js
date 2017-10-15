import React, { Component } from 'react';

import './App.scss';
import TextInput from './components/TextInput';
import LoginScreen from './components/login';

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
        { this.state.loggedIn ?  <TextInput /> :
          <LoginScreen
            onLogin={() => this.setState({loggedIn: true})}
          /> }
      </div>
    );
  }
}

export default App;
