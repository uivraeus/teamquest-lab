import React, { useEffect, useState } from "react";
import BackBtnLink from "../components/BackBtnLink";
import InfoBlock from "../components/InfoBlock";
import SurveySetup from "../components/SurveySetup";
import RouteSelect from "../components/RouteSelect"
import { Link, useLocation, useNavigate } from "react-router-dom";
import { absCreatorPath } from "../RoutePaths";

import "./Create.css";

//Parent must ensure that "teams" is always valid (not null/undefined)
const Create = ({ teams }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const surveyCreated = (surveyId) => {
    //console.log("Survey created: ", surveyId);
    //Replace with maintained state so that "back" implies back to main menu
    navigate(`${absCreatorPath("info")}/${surveyId}`, { replace: true, state: location.state });
  };

  //If no team(s) defined, the user must create one via the Manage section
  //TODO: fix this in CreatorApp with some custom "requireTeam" or similar
  useEffect(() => {
    if (teams.length === 0) {
      navigate(absCreatorPath("manage"));
    }
  }, [teams, navigate]);
  if (teams.length === 0) {
    return null;
  }
  
  return (
    <div className="Create">    
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
          <Link to={absCreatorPath("manage")} state={{prevPage:"Create new survey"}}>Manage</Link> section
        </p>
      </InfoBlock>
      {selectedTeam ? (
        <SurveySetup teamId={selectedTeam.id} onCreated={surveyCreated} />
      ) : null}
      <BackBtnLink separator/>
    </div>
  );
};

export default Create;
