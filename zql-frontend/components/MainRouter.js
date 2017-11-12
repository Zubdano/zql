import React from 'react';
import { Switch, Route } from 'react-router-dom'
import Auth from './Auth';
import GrammarEditor from './GrammarEditor';
import Events from './Events';

const MainRouter = () => (
  <main>
    <Switch>
      <Route exact path='/' component={Auth}/>
      <Route path='/grammar' component={GrammarEditor}/>
      <Route path='/events' component={Events}/>
    </Switch>
  </main>
)

export default MainRouter;