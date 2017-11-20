import React, { Component } from 'react';
import { Button, Icon, Navbar } from 'react-materialize';
import { NavLink, withRouter } from 'react-router-dom'

import { Permissions, auth } from '../requests/auth';
import './Header.scss';

const DEFAULT_PERMISSION = 3;

class Header extends Component {

  logout = () => {
    auth.logout();
    this.props.history.push('/login');
  }

  render() {
    const permission = auth.loggedIn ? auth.currentUser.permission : DEFAULT_PERMISSION;
    const logoutButton = auth.loggedIn ? (
      <Button className="logoutButton" onClick={this.logout}>Logout</Button>
    ) : null;
    return (
      <Navbar brand='ZQL'>
        {permission <= Permissions.WRITER && <li><NavLink activeClassName="selected" to="/grammar">Grammar Editor</NavLink></li>}
        {permission <= Permissions.WRITER && <li><NavLink activeClassName="selected" to="/input">Text Input</NavLink></li>}
        {permission <= Permissions.READER && <li><NavLink activeClassName="selected" to="/events">Events</NavLink></li>}
        {logoutButton}
      </Navbar>
    );
  }
}

export default withRouter(Header);
