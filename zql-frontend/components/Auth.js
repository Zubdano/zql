import React, { Component } from 'react';

import TextInput from './TextInput';
import LoginScreen from './login';
import GrammarEditor from './GrammarEditor';

class Auth extends Component {

	constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
    };
  }

  render() {
    return (
      <div>
        { this.state.loggedIn ?  <TextInput /> :
          <LoginScreen
            onLogin={() => this.setState({loggedIn: true})}
          /> }
      </div>
    );
  }
}

export default Auth;
