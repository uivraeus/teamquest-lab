//3rd-party
import React, { useEffect } from 'react';
import { Link, Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'

//My sub-routes and stuff
import SurveyInfo from './SurveyInfo';
import Inherit from './Inherit';
import TransferInfo from './TransferInfo';
import Create from './Create';
import Manage from './Manage';
import SurveyCatalog from './SurveyCatalog'; 
import ChangePassword from './ChangePassword';
import TerminateAccount from './TerminateAccount';
import useOwnedTeams from '../hooks/OwnedTeams';
import useAppContext from '../hooks/AppContext';
import AppBtn from "../components/AppBtn";

import { ReactComponent as SurveyNewIcon } from "../icons/survey-new.svg";
import { ReactComponent as SurveyMonIcon } from "../icons/survey-monitor.svg";
import { ReactComponent as SettingsIcon } from "../icons/settings.svg";

import './Creator.css';

/* Internal render-helper for pages that require an _initialized_ "teams" prop  */
const teamsPage = (Component, teams, readError ) => {
  if (readError) {
    return () => (<p>Can't access user team configuration</p>)
  }
  else if (!teams) {
    return () => (<p>Loading user team configuration...</p>);
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

  const history = useHistory();
  const goTo = (path) => {
    history.push(path);
  }

  //Alert on db read error
  useEffect( () => {
    if (readError && showAlert) {
      showAlert("Error reading user's team data", readError, "Error");
      //Don't really know what to do in this case... something is wrong with
      //the backend DB connection
    }
  }, [readError, showAlert])

  return (
    <>
      <Switch>
        <Route exact path={`${path}/main`}>
          <div className="Creator">
            <h1>Creator Admin</h1>
            <ul>
              <li>
                <div className="Creator-link">
                  <AppBtn onClick={() => goTo(pathNew)}>
                    <SurveyNewIcon />
                  </AppBtn>
                  <p><Link to={pathNew}>Create</Link> a new survey</p>
                </div>
              </li>
              <li>
                <div className="Creator-link">
                  <AppBtn onClick={() => goTo(pathMonitor)}>
                    <SurveyMonIcon />
                  </AppBtn>
                  <p><Link to={pathMonitor}>Monitor</Link> and manage previously created surveys</p>
                </div>
              </li>
              <li>
                <div className="Creator-link">
                  <AppBtn onClick={() => goTo(pathManage)}>
                    <SettingsIcon />
                  </AppBtn>
                  <p><Link to={pathManage}>Manage</Link> your account and associated teams</p>
                </div>
              </li>
            </ul>    
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
        <Route exact path={pathPassword} component={ChangePassword}></Route>
        <Route exact path={pathTerminate} component={TerminateAccount}></Route>
        <Redirect from={`${path}/`} to={`${path}/main`} />
      </Switch>
    </>
  );
}

export default Creator;
