//3rd-party
import React from 'react';

//My hooks and helpers
import BtnLinkItem from "../components/BtnLinkItem"
import InfoBlock from '../components/InfoBlock';
import { absAppPath, absCreatorPath } from '../RoutePaths';

import { ReactComponent as SurveyNewIcon } from "../icons/survey-new.svg";
import { ReactComponent as ResultsIcon } from "../icons/results.svg";
import { ReactComponent as SurveyMonIcon } from "../icons/survey-monitor.svg";
import { ReactComponent as SettingsIcon } from "../icons/settings.svg";

import './CreatorMain.css';

// Input to list of BtnLinkItem components
// - [destPath, <disable-if-no-team>, Icon, textLink, textAfter]
const menuItems = [
  [absCreatorPath("new"), true, SurveyNewIcon, "Create", "a new survey"],
  [absAppPath("results"), true, ResultsIcon, "Analyze", "results of previously created surveys"],
  [absCreatorPath("monitor"), true, SurveyMonIcon, "Monitor", "and manage previously created surveys"],
  [absCreatorPath("manage"), false, SettingsIcon, "Manage", "your account and associated teams"]
];

const CreatorMain = ({ teams }) => {
  //Make sub-pages know where they came from (what "back" implies) 
  const historyState = {prevPage: "Main menu"};
  
  //If we enter the signed in part of the app without any team(s), then help the
  //user understand that the first thing to do is to create a team.
  //NOTE: what to show before "teams" has loaded?
  // - the logical move would be to "disallow" but..
  // - that will cause a "disabled-flicker" at each load when there _are_ teams
  // -> optimize on the common case (teams.length > 0)
  //    (it's just a presentational thing; the teams-pages will not mount anyway)
  const allowTeamsOp = !teams || teams.length > 0;
  
  return (
    <div className="CreatorMain">
      <h1>Creator Admin</h1>
      <ul>
        {menuItems.map((cols, index) => {
          const disabled = cols[1] ? !allowTeamsOp : false;
          return (
            <li key={index}>
              <BtnLinkItem
                destPath={cols[0]}
                disabled={disabled}
                Icon={cols[2]}
                historyState={historyState}
                textLink={cols[3]}
                textAfter={cols[4]}
              />
            </li>
          );
        })}
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
