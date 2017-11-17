import React, { Component } from 'react';
import { Button, Icon, Navbar } from 'react-materialize';
import { NavLink, withRouter } from 'react-router-dom'

import { auth } from '../requests/auth';
import './Header.scss';

class Header extends Component {

  logout = () => {
    auth.logout();
    this.props.history.push('/login');
  }

  render() {
    const logoutButton = auth.loggedIn ? (
      <Button className="logoutButton" onClick={this.logout}>Logout</Button>
    ) : null;
    return (
      <Navbar brand='ZQL'>
        <li><NavLink to="/">Text Input</NavLink></li>
        <li><NavLink to="/events">Events</NavLink></li>
        <li><NavLink to="/grammar">Grammar Editor</NavLink></li>
        {logoutButton}
      </Navbar>
    );
  }
}

export default withRouter(Header);
