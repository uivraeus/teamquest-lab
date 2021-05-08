import React, { useEffect, useState } from "react";
import InfoBlock from "../components/InfoBlock";
import SurveySetup from "../components/SurveySetup";
import RouteSelect from "../components/RouteSelect"
import { Link, useHistory } from "react-router-dom";

import "./Create.css";

//Parent must ensure that "teams" is always valid (not null/undefined)
const Create = ({ teams }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  const history = useHistory();
  const surveyCreated = (surveyId) => {
    //console.log("Survey created: ", surveyId);
    history.push(`/creator/info/${surveyId}`);
  };

  //If no team(s) defined, the user must create one via the Manage section
  //TODO: fix this in Creator with some custom "TeamsRoute" or similar
  useEffect(() => {
    if (teams.length === 0) {
      history.push(`/creator/manage`);
    }
  }, [teams, history]);
  if (teams.length === 0) {
    return null;
  }
  
  return (
    <div className="Create">
      <>
        <h1>Run a new survey</h1>
        <label htmlFor="team-select">Team:</label>
        <RouteSelect
          options={teams}
          textKey="alias"
          elementId="team-select"
          onSelected={setSelectedTeam}
        />
        <InfoBlock>
          <p>
            Additional teams can be defined via the {" "}
            <Link to={{pathname:"/creator/manage", state:{prevPage:"Create new survey"}}}>Manage</Link> section
          </p>
        </InfoBlock>
        {selectedTeam ? (
          <SurveySetup teamId={selectedTeam.id} onCreated={surveyCreated} />
        ) : null}
      </>
    </div>
  );
};

export default Create;
