//3rd-party
import React from 'react';
import { Link, Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'

//My sub-routes and stuff
import SurveyInfo from './SurveyInfo';
import Create from './Create';
import Manage from './Manage';
import SurveyCatalog from './SurveyCatalog'; 
import ChangePassword from './ChangePassword';
import TerminateAccount from './TerminateAccount';

import AppBtn from "../components/AppBtn";
import { ReactComponent as SurveyNewIcon } from "../icons/survey-new.svg";
import { ReactComponent as SurveyMonIcon } from "../icons/survey-monitor.svg";
import { ReactComponent as SettingsIcon } from "../icons/settings.svg";

import './Creator.css';

const Creator = () => {
  const { path } = useRouteMatch();
  const pathNew = `${path}/new`;
  const pathMonitor = `${path}/tracker`;
  const pathManage = `${path}/manage`;
  const pathPassword = `${path}/password`;
  const pathTerminate = `${path}/terminate`;

  const history = useHistory();
  const goTo = (path) => {
    history.push(path);
  }

  return (
    <>
      <Switch>
        <Route exact path={`${path}/main`}>
          <div className="Creator">
            <h1>Mini-TMQ Creator</h1>
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
        <Route path={pathNew} component={Create}></Route>
        <Route exact path={pathMonitor} component={SurveyCatalog}></Route>
        <Route path={`${pathMonitor}/:teamId`} component={SurveyCatalog}></Route>
        <Route path={`${path}/info/:surveyId`} component={SurveyInfo}></Route>
        <Route exact path={pathManage} component={Manage}></Route>
        <Route exact path={pathPassword} component={ChangePassword}></Route>
        <Route exact path={pathTerminate} component={TerminateAccount}></Route>
        <Redirect from={`${path}/`} to={`${path}/main`} />
      </Switch>
    </>
  );
}

export default Creator;
