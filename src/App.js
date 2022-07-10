//3rd-party
import React, {Suspense, lazy } from 'react';
import { Route, Navigate, Routes, useLocation } from 'react-router-dom'

//App framework components
import { requireSignedIn, requireSignedOut} from './components/AuthRoute';
import AppHeader from './components/AppHeader'
import LoadingIndicator from './components/LoadingIndicator';
import { appPaths as paths } from './RoutePaths';
import './App.css';

//Lazy loaded components for the sub-pages
//(chunk names aren't required but makes it easier to analyze in dev tools )
const CreatorApp = lazy(() => import(/* webpackChunkName: 'CreatorApp' */ './CreatorApp'));
const Start = lazy(() => import(/* webpackChunkName: 'Start' */ './pages/Start'));
const Run = lazy(() => import(/* webpackChunkName: 'Run' */ './pages/Run'));
const Signup = lazy(() => import(/* webpackChunkName: 'Signup' */ './pages/Signup'));
const PasswordReset = lazy(() => import(/* webpackChunkName: 'PasswordReset' */ './pages/PasswordReset'));
const Contact = lazy(() => import(/* webpackChunkName: 'Contact' */ './pages/Contact'));
const MarkdownPage = lazy(() => import(/* webpackChunkName: 'MarkdownPage' */ './pages/MarkdownPage'));
//Preload the Login page to ensure it's available during the signup/verify flow (better user experience)
const LoginPromise = import(/* webpackChunkName: 'Login' */ './pages/Login');
const Login = lazy(() => LoginPromise);
//The ResultsPage is very "popular" (and somewhat big), so let's preload it
const ResultsPagePromise = import(/* webpackChunkName: 'ResultsPage' */ './pages/ResultsPage');
const ResultsPage = lazy(() => ResultsPagePromise);

const App = () => {
  const { pathname } = useLocation();
  console.log("@App (render):", pathname)
  

  //Note that the "results" route is a bit special; the variant without any
  //team-identifier is only available for users who are signed in (who can
  //select one of their teams)
  return (
    <div className="App">
      <AppHeader />
      
        <div className="App-content">
          <Suspense fallback={<LoadingIndicator />}>  
            <Routes>

              <Route path={paths.start} element = {requireSignedOut(<Start/>, "Start")}/>
              <Route path={paths.signup} element = {requireSignedOut(<Signup/>, "Signup")}/>

              <Route path={paths.results} element = {requireSignedIn(<ResultsPage/>, "ResultsPage")}/>
              <Route path={paths.creator + "/*"} element = {requireSignedIn(<CreatorApp/>, "CreatorApp")}/>

              <Route path={paths.login} element = {<Login/>}/>
              <Route path={paths.run + "/:surveyId"} element={<Run/>}/>
              <Route path={paths.results +"/:teamId"} element={<ResultsPage/>}/>
              <Route path={paths.contact} element={<Contact/>}/>
              <Route path={paths.privacy} element={<MarkdownPage mdFileName="privacy"/>}/>
              <Route path={paths.terms} element={<MarkdownPage mdFileName="terms"/>}/>
              <Route path={paths.passwordReset} element={<PasswordReset/>}/>
              
              <Route path="/*" element={<Navigate replace to={paths.start} />}/>
            </Routes>
          </Suspense>
        </div>
            
    </div>
  );
}

export default App;
