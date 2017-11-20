import React, { Component } from 'react';
import './LoginScreen.scss';
import { Button, Preloader } from 'react-materialize';
import ReactLoading from 'react-loading';

import { auth } from '../requests/auth';

class LoginScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      username: null,
      password: null,
      error: null,
      isLoading: false,
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {
      username,
      password,
    } = this.state;

    if (!username || !password) {
      this.setState({error: 'Please enter a username or password'});
      return;
    }
    this.setState({isLoading: true});

    this.setState({error: null});
    auth.login(username, password, success => {
      this.setState({isLoading: false})
      if (!success) {
        this.setState({error: 'Invalid username or password'});
        return;
      }

      const state = this.props.location.state;
      const pathname = state ? state.pathname : '/events';

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
          className="loginElement"
          placeholder="Username"
          onChange={this.handleUsernameChange}
          type="text"
        />
        <input
          className="loginElement"
          placeholder="Password"
          onChange={this.handlePasswordChange}
          type="password"
        />
        { this.state.isLoading ?
          <Preloader
            className="loginSpinner"
            flashing
            /> :
            <Button onClick={this.handleSubmit}>Login</Button>
        }
        {error}
      </form>
    );
  }
}

export default LoginScreen;
