import React, { Component } from 'react';
import './LoginScreen.scss';
import { auth } from '../requests/auth';

class LoginScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      'username': null,
      'password': null,
      'error': null,
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {
      username,
      password,
    } = this.state;

    if (!username || !password) {
      this.setState({'error': 'Please enter a username or password'});
      return;
    }

    this.setState({'error': null});
    auth.login(username, password, success => {
      if (!success) {
        this.setState({'error': 'Invalid username or password'});
        return;
      }

      const state = this.props.location.state;
      const pathname = state ? state.pathname : '/';

      this.props.history.replace(pathname);
    })
  }

  handleUsernameChange = (username) => {
    this.setState({ username: username.target.value });
  }

  handlePasswordChange = (password) => {
    this.setState({ password: password.target.value });
  }

  render() {
    const error = this.state.error ? <p className="loginError">{this.state.error}</p> : null;
    return (
      <form action="#" className="loginContainer">
        <input
          placeholder="Username"
          className="loginElement loginText"
          onChange={this.handleUsernameChange}
          type="text"
        />
        <input
          placeholder="Password"
          className="loginElement loginText"
          onChange={this.handlePasswordChange}
          type="password"
        />
        <input
          className="loginElement loginButton"
          type="submit"
          value="Log In"
          onClick={this.handleSubmit}
        />
        {error}
      </form>
    );
  }
}

export default LoginScreen;
