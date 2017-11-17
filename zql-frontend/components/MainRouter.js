import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'
import GrammarEditor from './GrammarEditor';
import Events from './Events';
import LoginScreen from './LoginScreen';
import TextInput from './TextInput';
import { auth } from '../requests/auth';

function renderWithAuth(component, props) {
  const Comp = component;
  if (!auth.loggedIn) {
    return <Redirect to={{
      pathname: '/login',
      state: { pathname: props.location.pathname }
    }}/>;
  }
  return <Comp {...props} />;
}

const MainRouter = () => (
  <main>
    <Switch>
      <Route path='/input' render={(props) => renderWithAuth(TextInput, props)}/>
      <Route path='/grammar' render={(props) => renderWithAuth(GrammarEditor, props)}/>
      <Route path='/events' render={(props) => renderWithAuth(Events, props)}/>
      <Route path='/login' component={LoginScreen}/>
    </Switch>
  </main>
);

export default MainRouter;
