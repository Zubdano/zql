import React, { Component } from 'react';
import { Button, Icon, Navbar } from 'react-materialize';
import { NavLink, withRouter } from 'react-router-dom'

import { Permissions, auth } from '../requests/auth';
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
        {auth.currentUser.permission <= Permissions.EDITOR && <li><NavLink activeClassName="selected" to="/grammar">Grammar Editor</NavLink></li>}
        {auth.currentUser.permission <= Permissions.WRITER && <li><NavLink activeClassName="selected" to="/input">Text Input</NavLink></li>}
        {auth.currentUser.permission <= Permissions.READER && <li><NavLink activeClassName="selected" to="/events">Events</NavLink></li>}
        {logoutButton}
      </Navbar>
    );
  }
}

export default withRouter(Header);
