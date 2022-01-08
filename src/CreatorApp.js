//3rd-party
import React, { lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom'
import { creatorPaths as paths } from './RoutePaths';
import useOwnedTeams from './hooks/OwnedTeams';
import useAppContext from './hooks/AppContext';
import LoadingIndicator from './components/LoadingIndicator';

//Lazy loaded components for the sub-pages
//(chunk names aren't required but makes it easier to analyze in dev tools )
const SurveyInfo = lazy(() => import(/* webpackChunkName: 'SurveyInfo' */ './pages/SurveyInfo'));
const Inherit = lazy(() => import(/* webpackChunkName: 'Inherit' */ './pages/Inherit'));
const TransferInfo = lazy(() => import(/* webpackChunkName: 'TransferInfo' */ './pages/TransferInfo'));
const ChangePassword = lazy(() => import(/* webpackChunkName: 'ChangePassword' */ './pages/ChangePassword'));
const TerminateAccount = lazy(() => import(/* webpackChunkName: 'TerminateAccount' */ './pages/TerminateAccount'));
const ShareResults = lazy(() => import(/* webpackChunkName: 'ShareResults' */ './pages/ShareResults'));
const VerifyAccount = lazy(() => import(/* webpackChunkName: 'VerifyAccount'*/ './pages/VerifyAccount'));
//The routes that are more "popular" can be preloaded (gray-area...)
const CreatorMainPromise = import(/* webpackChunkName: 'CreatorMain' */ './pages/CreatorMain');  
const CreatePromise = import(/* webpackChunkName: 'Create' */ './pages/Create');
const ManagePromise = import(/* webpackChunkName: 'Manage' */ './pages/Manage');
const SurveyCatalogPromise = import(/* webpackChunkName: 'SurveyCatalog' */ './pages/SurveyCatalog');
const CreatorMain = lazy(() => CreatorMainPromise);
const Create = lazy(() => CreatePromise);
const Manage = lazy(() => ManagePromise);
const SurveyCatalog = lazy(() => SurveyCatalogPromise);

const CreatorApp = () => {
  const { teams, readError } = useOwnedTeams();
  const { showAlert } = useAppContext();
  
  //Alert on db read error
  useEffect( () => {
    if (readError && showAlert) {
      showAlert("Data backend error", "Error reading user's team data", "Error", readError);
      //Don't really know what to do in this case... something is wrong with
      //the backend DB connection
    }
  }, [readError, showAlert])
  
  /**
   * Internal render-helper for pages that require an _initialized_ "teams" prop
   * Some components that consume "teams" are OK to render also before teams is
   * loaded/available (see *1* below)
   */
  const teamsPage = (Component ) => {
    if (readError) {
      return <p>Can't access user's team configuration</p>
    }
    else if (!teams) {
      return <LoadingIndicator text="Loading user's team configuration"/>;
    } else {
      return <Component teams={teams}/>
    }
  };

  // Some components that consume "teams" are OK to render also before teams is loaded/available (see *1 below)
  return (
    <Routes>
      <Route path={paths.changePassword} element={<ChangePassword/>}/>
      <Route path={`${paths.info}/:surveyId`} element={<SurveyInfo/>}/>
      <Route path={`${paths.inherit}/:transferId`} element={teamsPage(Inherit)}/>
      <Route path={paths.main} element={<CreatorMain teams={teams}/>}/>                       {/*1*/}
      <Route path={paths.manage} element={teamsPage(Manage)}/>
      <Route path={`${paths.manage}/:teamId`} element={teamsPage(Manage)}/>
      <Route path={paths.monitor} element={teamsPage(SurveyCatalog)}/>
      <Route path={`${paths.monitor}/:teamId`} element={teamsPage(SurveyCatalog)}/>
      <Route path={paths.new} element={ teamsPage(Create) }/>
      <Route path={`${paths.new}/:teamId`} element={teamsPage(Create) }/>
      <Route path={`${paths.shareResults}/:teamId`} element={<ShareResults teams={teams}/>}/> {/*1*/}
      <Route path={paths.terminate} element={<TerminateAccount/>}/>
      <Route path={`${paths.transfer}/:transferId`} element={<TransferInfo/>}/>
      <Route path={paths.verify} element={<VerifyAccount/>}/>

      <Route path="/*" element={<Navigate replace to={paths.main} />}/>    
    </Routes>    
  );
}

export default CreatorApp;
