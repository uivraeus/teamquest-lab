import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import Teams from "../components/Teams";
import SurveyItem from "../components/SurveyItem";
import useAppContext from "../hooks/AppContext";
import useTeamTracker from "../hooks/TeamTracker";
import useOwnedTeams from "../hooks/OwnedTeams";
import { CompLev, deleteSurvey } from "../helpers/survey";
import { Link, useHistory, useParams } from "react-router-dom";

import { ReactComponent as ResultsIcon } from "../icons/analysis.svg";

import "./SurveyCatalog.css";

const SurveyCatalog = () => {
  const { queryConfirm, showAlert, user } = useAppContext();
  const history = useHistory();
  const { teamId } = useParams();
  const ownedTeams = useOwnedTeams();

  //The output from TeamTracker is not "access protected" in any way
  //(unauthenticated users must be able to follow a team's result)
  //But it would be very confusing to allow showing another user's catalog
  //here so ensure that the team is actually "owned" by the current user.
  //(Any attempts to modify/discard surveys would in the end fail due to
  //access permissions in the backend anyway)
  const [validatedTeamId, setValidatedTeamId] = useState(null);
  useEffect(() => {
    if (ownedTeams && ownedTeams.teams && teamId) {
      if (ownedTeams.teams.map((t) => t.id).includes(teamId)) {
        setValidatedTeamId(teamId);
      } else {
        showAlert(
          "Invalid URL",
          "It looks like you tried to access a team you are not the owner of"
        );
        //Why SetTimeout?
        //Because of crappy setTimeout in Teams... in case of only
        //one team with "auto-selection" I might get a onTeamSelect
        //call delayed by a setTimeout inside Teams (TODO: fix that!)
        setTimeout(() => history.push("/"), 0);
      }
    }

    if (ownedTeams && ownedTeams.readError && showAlert) {
      showAlert(
        "User configuration error",
        "Could not derive user's team ownership",
        "Error",
        ownedTeams.readError
      );
    }
  }, [teamId, ownedTeams, showAlert, history]);

  let { surveys, readError } = useTeamTracker(validatedTeamId);

  const onTeamsSelect = (id) => {
    history.push(`/creator/tracker/${id}`);
  };

  const onShare = ({ id }) => {
    history.push(`/creator/info/${id}`);
  };

  const onEdit = ({ id }) => {
    showAlert("TODO", "Add support for editing ongoing surveys");
  };

  const onDelete = ({ id, createTime }) => {
    const dateStr = new Date(createTime).toLocaleDateString();
    queryConfirm(
      "Delete survey",
      `Are you sure you want to delete the survey from ${dateStr}?`,
      (confirmed) => {
        if (confirmed) {
          deleteSurvey(id)
          .then((r) => {
            console.log("then r:", r);
          })
          .catch((r) => {
            console.log("catch, r:", r);
            showAlert("Data backend error", r.message, "Error");
          });
        }
      }
    );
  };

  const pathR = `/results/${validatedTeamId}`;
  const onResults = () => {
    history.push(pathR);
  };

  //"early exit" (Routing helpers shall ensure that user is always defined though...)
  if (!user) <></>;

  //Sort the surveys according to their completion status
  //Here it makes most sense to present newest surveys first
  const ongoing = surveys && surveys.filter((s) => s.meta.ongoing).reverse();
  const completed =
    surveys &&
    surveys
      .filter((s) => !s.meta.ongoing && s.meta.compLev !== CompLev.TOO_FEW)
      .reverse();
  const discarded =
    surveys &&
    surveys
      .filter(
        (s) =>
          !s.meta.ongoing &&
          (s.meta.compLev === CompLev.TOO_FEW ||
            s.meta.compLev === CompLev.CANCELED)
      )
      .reverse();

  return (
    <div className="SurveyCatalog">
      <h1>Survey catalog</h1>
      <Teams
        user={user}
        enableEdit={false}
        onSelected={onTeamsSelect}
        extSelection={validatedTeamId}
      />
      {surveys ? (
        <>
          <div className="SurveyCatalog-result-link">
            <div>
              <AppBtn onClick={onResults}>
                <ResultsIcon />
              </AppBtn>
            </div>
            <p>
              The <Link to={pathR}>analysis result page</Link> for this team is
              continuously updated when new responses are received.
            </p>
          </div>
          <h3>Ongoing surveys</h3>
          {ongoing.length ? (
            <ul>
              {" "}
              {ongoing.map((s) => {
                return (
                  <li key={s.meta.id}>
                    <SurveyItem
                      surveyMeta={s.meta}
                      onShare={onShare}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>
              <em>No ongoing surveys</em>
            </p>
          )}
          <h3>Completed surveys</h3>
          {completed.length ? (
            <ul>
              {" "}
              {completed.map((s) => {
                return (
                  <li key={s.meta.id}>
                    <SurveyItem surveyMeta={s.meta} onDelete={onDelete} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>
              <em>No completed surveys</em>
            </p>
          )}

          {discarded.length ? (
            <>
              <h3>Never completed surveys</h3>
              <ul>
                {" "}
                {discarded.map((s) => {
                  return (
                    <li key={s.meta.id}>
                      <SurveyItem
                        surveyMeta={s.meta}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </>
      ) : validatedTeamId ? (
        <p>
          <em>Loading surveys...</em>
        </p>
      ) : null}
      {readError ? (
        <p>
          <em>{readError}</em>
        </p>
      ) : null}
    </div>
  );
};

export default SurveyCatalog;
