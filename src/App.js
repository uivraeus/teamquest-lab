//3rd-party
import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom'

//My routes and stuff
import useAppContext from './hooks/AppContext'
import AppHeader from './components/AppHeader'
import { PrivateRoute, PublicRoute} from './components/AuthRoute';
import Login from './pages/Login';
import PasswordReset from './pages/PasswordReset';
import Start from './pages/Start';
import Signup from './pages/Signup';
import SurveyResults from './pages/SurveyResults';
import Creator from './pages/Creator'
import Run from './pages/Run';

import './App.css';


const App = () => {
  const { initialAuthChecked } = useAppContext();

  return (
    <div className="App">
      <AppHeader />
      <div className="App-content">
        {!initialAuthChecked ? 
          <p>Loading...</p> : (
          <Switch>
            <PublicRoute exact path="/start" component={Start}></PublicRoute>
            <Route path="/run/:surveyId" component={Run}></Route>
            <Route path="/results/:teamId" component={SurveyResults}></Route>
            <PublicRoute path="/signup" component={Signup}></PublicRoute>
            <PublicRoute path="/login" component={Login}></PublicRoute>
            <Route path="/reset" component={PasswordReset}></Route>
            <PrivateRoute path="/creator" component={Creator}></PrivateRoute>
            <Redirect from="/" to="/start" />
          </Switch>
        )}
      </div>
    </div>
  );
}

export default App;
