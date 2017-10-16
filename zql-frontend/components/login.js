import React, { Component } from 'react';
import './login.scss';

class LoginScreen extends Component {

  constructor(props) {
    super(props);

  }

  handleSubmit = (e) => {
    e.preventDefault()
    const usernameText = this._username.value;
    const password = this._password.value;
    if (usernameText == 'pranav' && password == 'password') {
      this.props.onLogin()
    }
  }

  render() {
    return (
      <form action="#" className="loginContainer">
        <input
          placeholder="Username"
          className="loginElement loginText"
          ref={(c) => this._username = c}
          type="text"
        />
        <input
          placeholder="Password"
          className="loginElement loginText"
          ref={(c) => this._password = c}
          type="password"
        />
        <input
          className="loginElement loginButton"
          type="submit"
          value="Log In"
          onClick={this.handleSubmit}
        />
      </form>
    );
  }
}

export default LoginScreen;
