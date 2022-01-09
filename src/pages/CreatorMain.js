//3rd-party
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'

//My hooks and helpers
import AppBtn from "../components/AppBtn";
import InfoBlock from '../components/InfoBlock';
import { absAppPath, absCreatorPath } from '../RoutePaths';

import { ReactComponent as SurveyNewIcon } from "../icons/survey-new.svg";
import { ReactComponent as ResultsIcon } from "../icons/results.svg";
import { ReactComponent as SurveyMonIcon } from "../icons/survey-monitor.svg";
import { ReactComponent as SettingsIcon } from "../icons/settings.svg";

import './CreatorMain.css';

const CreatorMain = ({ teams }) => {
  //Make sub-pages know where they came from (what "back" implies) 
  //Also include "teams" (if available) for jump-starting ownership check for
  //"dual private/public use" pages                    
  const historyState = {prevPage: "Main menu", teams};
  const navigate = useNavigate();
  const goTo = (path) => {
    navigate(path, { state: historyState });
  }
  
  //If we enter the signed in part of the app without any team(s), then help the
  //user understand that the first thing to do is to create a team.
  //NOTE: what to show before "teams" has loaded?
  // - the logical move would be to "disallow" but..
  // - that will cause a "disabled-flicker" at each load when there _are_ teams
  // -> optimize on the common case (teams.length > 0)
  //    (it's just a presentational thing; the teams-pages will not mount anyway)
  const allowTeamsOp = !teams || teams.length > 0;
  const teamsLinkClassName = "CreatorMain-link" + (allowTeamsOp ? "" : " CreatorMain-link-disabled");
  
  //TODO: refactor this to make it more DRY (add some render-helper or similar)
  return (
    <div className="CreatorMain">
      <h1>Creator Admin</h1>
      <ul>
        <li>
          <div className={teamsLinkClassName}>
            <AppBtn onClick={() => goTo(absCreatorPath("new"))} disabled={!allowTeamsOp}>
              <SurveyNewIcon />
            </AppBtn>
            {allowTeamsOp ?
              <p><Link to={absCreatorPath("new")} state={historyState}>Create</Link> a new survey</p> :
              <p>Create a new survey</p>
            }
          </div>
        </li>
        <li>
          <div className={teamsLinkClassName}>
            <AppBtn onClick={() => goTo(absAppPath("results"))} disabled={!allowTeamsOp}>
              <ResultsIcon />
            </AppBtn>
            {allowTeamsOp ?
              <p><Link to={absAppPath("results")} state={historyState}>Analyze</Link> results of previously created surveys</p> :
              <p>Results and analysis of previously created surveys</p>
            }
          </div>
        </li>
        <li>
          <div className={teamsLinkClassName}>
            <AppBtn onClick={() => goTo(absCreatorPath("monitor"))} disabled={!allowTeamsOp}>
              <SurveyMonIcon />
            </AppBtn>
            {allowTeamsOp ?
              <p><Link to={absCreatorPath("monitor")} state={historyState}>Monitor</Link> and manage previously created surveys</p> :
              <p>Monitor and manage previously created surveys</p>
            }
          </div>
        </li>
        <li>
          <div className="CreatorMain-link">
            <AppBtn onClick={() => goTo(absCreatorPath("manage"))}>
              <SettingsIcon />
            </AppBtn>
            <p><Link to={absCreatorPath("manage")} state={historyState}>Manage</Link> your account and associated teams</p>
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
  );
}

export default CreatorMain;
