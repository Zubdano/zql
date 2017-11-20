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

const MainRouter = () => {
  const priority = auth.loggedIn ? auth.currentUser.permission : 3;
  const routes = [
    <Route key='events' path='/events' render={(props) => renderWithAuth(Events, props)}/>
  ];

  if (priority <= 1) {
    routes.push(
      <Route key='input' path='/input' render={(props) => renderWithAuth(TextInput, props)}/>
    );
    routes.push(
      <Route key='grammar' path='/grammar' render={(props) => renderWithAuth(GrammarEditor, props)}/>
    );
  }

  return (
    <main>
      <Switch>
        {routes}
        <Route path='/login' component={LoginScreen}/>
        <Redirect exact from='/' to='/events'/>
      </Switch>
    </main>
  );
};

export default MainRouter;
