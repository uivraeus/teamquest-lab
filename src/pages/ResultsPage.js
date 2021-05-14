import React, { useEffect } from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock";
import RouteSelect from "../components/RouteSelect";
import SurveyResults from "../components/SurveyResults";
import { useHistory, useParams } from "react-router-dom";
import useAppContext from '../hooks/AppContext'
import useOwnedTeams from '../hooks/OwnedTeams';

import './ResultsPage.css';

/* This page is accessible via a "public route", i.e. not only to signed-in users.
 * However, _when_ signed in, the page will allow for "team control" if the team
 * is owned by the signed in user.
 * (A signed in user might still view the results from a team he/whe doesn't own)
 */

const ResultsPage = () => {
  const { teamId } = useParams();
  const history = useHistory();
  
  //For signed in users; determine what to show in the team-control part
  const { teams, readError } = useOwnedTeams();
  const { showAlert, user } = useAppContext();
  const mySelectedTeam = (teams && teams.find(t => t.id === teamId));
  
  //Alert on db read error (but don't do anything... what _could_ be done?)
  useEffect( () => {
    if (readError && showAlert) {
      showAlert("Error reading user's team data", readError, "Error");
    }
  }, [readError, showAlert])

  return (
    <>
      {user ?
        <div className="ResultsPage-signed-in">
          <div className="ResultsPage-team-control">
            {teams ?
              (!teamId || mySelectedTeam) ?
                <>
                  <label htmlFor="team-select">Team:</label>
                  <RouteSelect
                    options={teams}
                    textKey="alias"
                    elementId="team-select"
                  />
                </> :
                <InfoBlock>
                  <p>This is not one of your managed teams</p>
                  <AppBtn text="Show my teams" onClick={()=>history.push("/results")} />
                </InfoBlock>
              :
              <p>Loading team ownership information...</p>
            }
          </div>
          <hr/>
        </div> : null
      }
      {teamId ?
        <SurveyResults teamId={teamId} /> : null
      }
      
    </>
  );
};

export default ResultsPage;
