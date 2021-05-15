//3rd-party
import React, {Suspense, lazy} from 'react';
import { Route, Redirect, Switch } from 'react-router-dom'

//App framework components
import { PrivateRoute, PublicRoute} from './components/AuthRoute';
import AppHeader from './components/AppHeader'
import LoadingIndicator from './components/LoadingIndicator';

import './App.css';

//Lazy loaded components for the sub-pages
//(chunk names aren't required but makes it easier to analyze in dev tools )
const Creator = lazy(() => import(/* webpackChunkName: 'Creator' */ './pages/Creator'));
const Start = lazy(() => import(/* webpackChunkName: 'Start' */ './pages/Start'));
const Run = lazy(() => import(/* webpackChunkName: 'Run' */ './pages/Run'));
const Login = lazy(() => import(/* webpackChunkName: 'Login' */ './pages/Login'));
const Signup = lazy(() => import(/* webpackChunkName: 'Signup' */ './pages/Signup'));
const PasswordReset = lazy(() => import(/* webpackChunkName: 'PasswordReset' */ './pages/PasswordReset'));
const Contact = lazy(() => import(/* webpackChunkName: 'Contact' */ './pages/Contact'));
const MarkdownPage = lazy(() => import(/* webpackChunkName: 'MarkdownPage' */ './pages/MarkdownPage'));
//The ResultsPage is very "popular" (and somewhat big), so let's preload it
const ResultsPagePromise = import(/* webpackChunkName: 'ResultsPage' */ './pages/ResultsPage');
const ResultsPage = lazy(() => ResultsPagePromise);


const App = () => {
  //Note that the /result route is a bit special; the variant without any
  //team-identifier is only available for users who are signed in (who can
  //select one of their teams)
  return (
    <div className="App">
      <AppHeader />
      
        <div className="App-content">
          <Suspense fallback={<LoadingIndicator />}>  
            <Switch>
              <PublicRoute exact path="/start" component={Start}></PublicRoute>
              <PrivateRoute exact path="/results" component={ResultsPage}></PrivateRoute>
              <Route path="/run/:surveyId" component={Run}></Route>
              <Route path="/results/:teamId" component={ResultsPage}></Route>
              <PublicRoute path="/signup" component={Signup}></PublicRoute>
              <PublicRoute path="/login" component={Login}></PublicRoute>
              <Route path="/contact" component={Contact}></Route>
              <Route path="/privacy" render={() => <MarkdownPage mdFileName="privacy"/>}></Route>
              <Route path="/terms" render={() => <MarkdownPage mdFileName="terms"/>}></Route>
              <Route path="/reset" component={PasswordReset}></Route>
              <PrivateRoute path="/creator" component={Creator}></PrivateRoute>
              <Redirect from="/" to="/start" />
            </Switch>
          </Suspense>
        </div>
            
    </div>
  );
}

export default App;
