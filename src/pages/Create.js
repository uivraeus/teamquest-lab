import React, { useEffect, useState } from "react";
import SurveySetup from "../components/SurveySetup";
import RouteSelect from "../components/RouteSelect"
import { useHistory } from "react-router-dom";
import useAppContext from "../hooks/AppContext";

import "./Create.css";

//Parent must ensure that "teams" is always valid (not null/undefined)
const Create = ({ teams }) => {
  const { showAlert } = useAppContext();
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  const history = useHistory();
  const surveyCreated = (surveyId) => {
    //console.log("Survey created: ", surveyId);
    history.push(`/creator/info/${surveyId}`);
  };

  //If no team(s) defined, the user must create one via the Manage section
  useEffect(() => {
    if (teams.length === 0) {
      history.push(`/creator/manage`);
      showAlert("No team defined yet", 
        "To initiate a survey you must first create a team. You have now been redirected to the Manage section where this can be done.");
    }
  }, [teams, history, showAlert]);
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
        {selectedTeam ? (
          <SurveySetup teamId={selectedTeam.id} onCreated={surveyCreated} />
        ) : null}
      </>
    </div>
  );
};

export default Create;
