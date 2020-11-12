//3rd-party
import React, { useEffect, useState } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom'

//My routes and stuff
import AppHeader from './components/AppHeader'
import { PrivateRoute, PublicRoute} from './components/AuthRoute';
import Login from './pages/Login';
import Start from './pages/Start';
import Signup from './pages/Signup';
//import SurveyInfo from './pages/SurveyInfo';
import SurveyResults from './pages/SurveyResults';
import Creator from './pages/Creator'
// import Create from './pages/Create';
import Run from './pages/Run';

//Auth & Data backend
import { auth } from './services/firebase'

import './App.css';


const App = () => {
  //Hook up with data backend authentication
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  useEffect ( () => {
    auth().onAuthStateChanged((user) => {
      if (user) {
        setAuthenticated(true);
        setLoading(false); //TODO: wait for other data?
      } else {
        setAuthenticated(false); //? later, after successful logon?
        setLoading(false);
      }      
    });
    // Return what to do when un-mounting
    return () => {
      //TBD
    }
  }, []); //run once (~did mount)

  return (
    <div className="App">
      <AppHeader authenticated={authenticated} />
      <div className="App-content">
        {loading ? 
          <p>Loading...</p> : (
          <Switch>
            <PublicRoute exact path="/start" authenticated={authenticated} component={Start}></PublicRoute>
            <Route path="/run/:surveyId" component={Run}></Route>
            <Route path="/results/:teamId" component={SurveyResults}></Route>
            <PublicRoute path="/signup" authenticated={authenticated} component={Signup}></PublicRoute>
            <PublicRoute path="/login" authenticated={authenticated} component={Login}></PublicRoute>
            <PrivateRoute path="/creator" authenticated={authenticated} component={Creator}></PrivateRoute>
            <Redirect from="/" to="/start" />
          </Switch>
        )}
      </div>
    </div>
  );
}

export default App;
