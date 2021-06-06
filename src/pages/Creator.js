//3rd-party
import React, { Suspense, lazy, useEffect } from 'react';
import { Link, Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'

//My hooks and helpers
import useOwnedTeams from '../hooks/OwnedTeams';
import useAppContext from '../hooks/AppContext';
import AppBtn from "../components/AppBtn";
import InfoBlock from '../components/InfoBlock';
import LoadingIndicator from '../components/LoadingIndicator';

import { ReactComponent as SurveyNewIcon } from "../icons/survey-new.svg";
import { ReactComponent as ResultsIcon } from "../icons/results.svg";
import { ReactComponent as SurveyMonIcon } from "../icons/survey-monitor.svg";
import { ReactComponent as SettingsIcon } from "../icons/settings.svg";

import './Creator.css';

//Lazy loaded components for the sub-pages
//(chunk names aren't required but makes it easier to analyze in dev tools )
const SurveyInfo = lazy(() => import(/* webpackChunkName: 'SurveyInfo' */ './SurveyInfo'));
const Inherit = lazy(() => import(/* webpackChunkName: 'Inherit' */ './Inherit'));
const TransferInfo = lazy(() => import(/* webpackChunkName: 'TransferInfo' */ './TransferInfo'));
const ChangePassword = lazy(() => import(/* webpackChunkName: 'ChangePassword' */ './ChangePassword'));
const TerminateAccount = lazy(() => import(/* webpackChunkName: 'TerminateAccount' */ './TerminateAccount'));
const ShareResults = lazy(() => import(/* webpackChunkName: 'ShareResults' */ './ShareResults'));
//The routes that are more "popular" can be preloaded (gray-area...)
const CreatePromise = import(/* webpackChunkName: 'Create' */ './Create');
const ManagePromise = import(/* webpackChunkName: 'Manage' */ './Manage');
const SurveyCatalogPromise = import(/* webpackChunkName: 'SurveyCatalog' */ './SurveyCatalog');
const Create = lazy(() => CreatePromise);
const Manage = lazy(() => ManagePromise);
const SurveyCatalog = lazy(() => SurveyCatalogPromise);

/* Internal render-helper for pages that require an _initialized_ "teams" prop  */
const teamsPage = (Component, teams, readError ) => {
  if (readError) {
    return () => (<p>Can't access user team configuration</p>)
  }
  else if (!teams) {
    return () => (<LoadingIndicator text="Loading user team configuration"/>);
  } else {
    return () => <Component teams={teams}/>
  }
};

const Creator = () => {
  const { teams, readError } = useOwnedTeams();
  const {showAlert} = useAppContext();
  const { path } = useRouteMatch();
  const pathNew = `${path}/new`;
  const pathMonitor = `${path}/tracker`;
  const pathManage = `${path}/manage`;
  const pathPassword = `${path}/password`;
  const pathTerminate = `${path}/terminate`;
  const pathInherit = `${path}/inherit`
  const pathTransfer = `${path}/transfer`
  const pathShareResults = `${path}/share-results`;

  //Results are shown via a public route (also for signed in users)
  const pathResults = "/results";

  const history = useHistory();

  //Make sub-pages know where they came from (what "back" implies) 
  //Also include "teams" for jump-starting ownership check "dual private/public use" pages                    
  const historyState = {prevPage: "Main menu", teams};
  const goTo = (path) => {
    history.push(path, historyState);
  }

  //Alert on db read error
  useEffect( () => {
    if (readError && showAlert) {
      showAlert("Error reading user's team data", readError, "Error");
      //Don't really know what to do in this case... something is wrong with
      //the backend DB connection
    }
  }, [readError, showAlert])

  //If we enter the signed in part of the app without any team(s), then help the
  //user understand that the first thing to do is to create a team.
  //NOTE: what to show before "teams" has loaded?
  //      - the logical move would be to "disallow" but..
  //      - that will cause a "disabled-flicker" at each load when there _are_ teams
  //        -> optimize on the common case (teams.length > 0)
  //        (it's just a presentational thing; the teams-pages will not mount anyway)
  const allowTeamsOp = !teams || teams.length > 0;
  const teamsLinkClassName = "Creator-link" + (allowTeamsOp ? "" : " Creator-link-disabled");
  //TODO: refactor this to make it more DRY (add some render-helper or similar)
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Switch>
        <Route exact path={`${path}/main`}>
          <div className="Creator">
            <h1>Creator Admin</h1>
            <ul>
              <li>
                <div className={teamsLinkClassName}>
                  <AppBtn onClick={() => goTo(pathNew)} disabled={!allowTeamsOp}>
                    <SurveyNewIcon />
                  </AppBtn>
                  {allowTeamsOp ?
                    <p><Link to={{pathname:pathNew, state:historyState}}>Create</Link> a new survey</p> :
                    <p>Create a new survey</p>
                  }
                </div>
              </li>
              <li>
                <div className={teamsLinkClassName}>
                  <AppBtn onClick={() => goTo(pathResults)} disabled={!allowTeamsOp}>
                    <ResultsIcon />
                  </AppBtn>
                  {allowTeamsOp ?
                    <p><Link to={{pathname:pathResults, state:historyState}}>Results</Link> and analysis of previously created surveys</p> :
                    <p>Results and analysis of previously created surveys</p>
                  }
                </div>
              </li>
              <li>
                <div className={teamsLinkClassName}>
                  <AppBtn onClick={() => goTo(pathMonitor)} disabled={!allowTeamsOp}>
                    <SurveyMonIcon />
                  </AppBtn>
                  {allowTeamsOp ?
                    <p><Link to={{pathname:pathMonitor, state:historyState}}>Monitor</Link> and manage previously created surveys</p> :
                    <p>Monitor and manage previously created surveys</p>
                  }
                </div>
              </li>
              <li>
                <div className="Creator-link">
                  <AppBtn onClick={() => goTo(pathManage)}>
                    <SettingsIcon />
                  </AppBtn>
                  <p><Link to={{pathname:pathManage, state:historyState}}>Manage</Link> your account and associated teams</p>
                </div>
              </li>
            </ul>
            {!allowTeamsOp ?
              <InfoBlock>
                <p>You need to define a team before you can create and monitor surveys.</p>
                <p>Do that in the Manage section</p>
              </InfoBlock> : null
            }    
          </div>
        </Route>
        
        <Route exact path={pathNew} render={ teamsPage(Create, teams, readError) } ></Route>
        <Route path={`${pathNew}/:teamId`} render={ teamsPage(Create, teams, readError) } ></Route>
        <Route exact path={pathMonitor} render={ teamsPage(SurveyCatalog, teams, readError) }></Route>
        <Route path={`${pathMonitor}/:teamId`} render={ teamsPage(SurveyCatalog, teams, readError)}></Route>
        <Route path={`${path}/info/:surveyId`} component={SurveyInfo}></Route>
        <Route path={`${pathInherit}/:transferId`} render={ teamsPage(Inherit, teams, readError)}></Route>
        <Route path={`${pathTransfer}/:transferId`} component={TransferInfo}></Route>
        <Route exact path={pathManage} render={ teamsPage(Manage, teams, readError) }></Route>
        <Route exact path={`${pathManage}/:teamId`} render={ teamsPage(Manage, teams, readError) }></Route>
        {/* Result-sharing page does not require an initialized teams prop, so don't delay its rendering */}
        <Route path={`${pathShareResults}/:teamId`} render={ () => <ShareResults teams={teams}/> } ></Route>
        <Route exact path={pathPassword} component={ChangePassword}></Route>
        <Route exact path={pathTerminate} component={TerminateAccount}></Route>
        <Redirect from={`${path}/`} to={`${path}/main`} />
      </Switch>
    </Suspense>
  );
}

export default Creator;
