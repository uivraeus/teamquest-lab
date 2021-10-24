import React, { useEffect } from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock";
import RouteSelect from "../components/RouteSelect";
import SurveyResults from "../components/SurveyResults";
import { useHistory, useParams } from "react-router-dom";
import useAppContext from '../hooks/AppContext'
import useOwnedTeams from '../hooks/OwnedTeams';

import { ReactComponent as ShareIcon } from "../icons/share.svg";

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
  const { showAlert, user, validatedAccess } = useAppContext();
  
  //Alert on db read error (but don't do anything... what _could_ be done?)
  useEffect( () => {
    if (readError && showAlert) {
      showAlert("Data backend error", "Error reading user's team data", "Error", readError);
    }
  }, [readError, showAlert])

  //If we were directed to this page from the Creator, then we have a hand-over
  //of information on owned teams. Use that before useOwnedTeams returns a value.
  const ownedTeams = teams || (history.location.state && history.location.state.teams) || null;
  const mySelectedTeam = (ownedTeams && ownedTeams.find(t => t.id === teamId));

  //An owner of a selected team can share the results page via the team-control section
  const onShare = () => {
    history.push(`/creator/share-results/${teamId}`, {prevPage: "Results page", teams:ownedTeams});
  };
  
  //When the owner of a team, pass a long a "manage surveys link" to SurveyResult
  const manageUrl = mySelectedTeam ? `/creator/tracker/${teamId}` : null;

  return (
    <>
      {user && validatedAccess ?
        <div className="ResultsPage-signed-in">
          <div className="ResultsPage-team-control">
            {ownedTeams ?
              (!teamId || mySelectedTeam) ?
                <>
                  <label htmlFor="team-select">Team:</label>
                  <RouteSelect
                    options={ownedTeams}
                    textKey="alias"
                    elementId="team-select"
                  />
                  {mySelectedTeam ?
                    <AppBtn onClick={() => onShare()}>
                      <ShareIcon />
                    </AppBtn> : null
                  }
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
        <SurveyResults teamId={teamId} manageUrl={manageUrl} /> : null
      }
      
    </>
  );
};

export default ResultsPage;
