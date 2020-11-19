import React, { useState } from "react";
import SurveySetup from "../components/SurveySetup";
import Teams from "../components/Teams";
import useAppContext from "../hooks/AppContext";
import { useHistory } from "react-router-dom";

import "./Create.css";

const Create = () => {
  const { user } = useAppContext();
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const history = useHistory();
  const surveyCreated = (surveyId) => {
    //console.log("Survey created: ", surveyId);
    history.push(`/creator/info/${surveyId}`);
  };

  //Routing helpers shall ensure that we never end up here with user==null, but...
  if (!user) return (<></>);

  return (
    <div className="Create">
      <>
        <h1>Run a new survey</h1>
        <Teams user={user} onSelected={setSelectedTeamId} />
        {selectedTeamId ? (
          <SurveySetup teamId={selectedTeamId} onCreated={surveyCreated} />
        ) : null}
      </>
    </div>
  );
};

export default Create;
