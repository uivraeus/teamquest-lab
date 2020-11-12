import React, { useEffect, useState } from "react";
import SurveySetup from "../components/SurveySetup";
import Teams from "../components/Teams";
import { auth } from "../services/firebase";
import { useHistory } from "react-router-dom";

import "./Create.css";

const Create = () => {
  const [user, setUser] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const history = useHistory();
  const surveyCreated = (surveyId) => {
    //console.log("Survey created: ", surveyId);
    history.push(`/creator/info/${surveyId}`);
  };

  useEffect(() => {
    const u = auth().currentUser;
    setUser(u);

    // Return what to do when "un-mounting"
    return () => {
      //TBD
    };
  }, []); //run once (~did mount) //TODO! check if this is the "correct way"

  return (
    <div className="Create">
      {user ? (
        <>
          <h1>Run a new survey</h1>
          <Teams user={user} onSelected={setSelectedTeamId} />
          {selectedTeamId ? (
            <SurveySetup teamId={selectedTeamId} onCreated={surveyCreated} />
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default Create;
