import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom'

import './App.scss';
import MainRouter from './components/MainRouter';
import { auth, Permissions } from './requests/auth';

class App extends Component {

  logout = () => {
    auth.logout();
    this.props.history.push('/login');
  }

  render() {
    const currentUser = auth.currentUser;
    // Display nothing if not logged in
    const permission = currentUser ? currentUser.permission : 3
    // TODO: Put this into separate Header component
    // TODO: Only display pages if the permission is there
    const links = [];
    if (permission <= Permissions.READER) {
      links.push(<Link key="textInput" to='/'>Text Input</Link>);
    }
    if (permission <= Permissions.WRITER) {
      links.push(<Link key="events" to='/events'>Events</Link>);
    }
    if (permission <= Permissions.EDITOR) {
      links.push(<Link key="grammar" to='/grammar'>Grammar Editor</Link>);
    }
    if (auth.loggedIn) {
      links.push(<button key="logout" onClick={this.logout}>Logout</button>);
    }

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to ZQL</h1>
        </header>
        {links}
        <MainRouter />
      </div>
    );
  }
}

export default withRouter(App);
