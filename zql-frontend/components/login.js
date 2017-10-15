import React, { Component } from 'react';

class LoginScreen extends Component {

  constructor(props) {
    super(props);

  }

  handleSubmit = () => {
    const usernameText = this._username.value;
    const password = this._password.value;
    if (usernameText == 'pranav' && password == 'password') {
      this.props.onLogin()
    }
  }

  render() {
    return (
      <div>
        <input
          ref={(c) => this._username = c}
          type="text"
        />
        <input
          ref={(c) => this._password = c}
          type="password"
        />
        <input
          type="button"
          value="Submit"
          onClick={this.handleSubmit}
        />
      </div>
    );
  }
}

export default LoginScreen;
