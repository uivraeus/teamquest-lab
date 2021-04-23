import React, { useEffect, useState } from "react";
import InfoBlock from "../components/InfoBlock";
import Teams from "../components/Teams";
import SurveyEditModal from "../components/SurveyEditModal";
import SurveyItem from "../components/SurveyItem";
import useAppContext from "../hooks/AppContext";
import useTeamTracker from "../hooks/TeamTracker";
import useValidatedTeam, {ValidationStatus} from "../hooks/ValidatedTeam";
import { CompLev, deleteSurvey } from "../helpers/survey";
import { Link, useHistory, useParams } from "react-router-dom";

import "./SurveyCatalog.css";

const SurveyCatalog = () => {
  const { queryConfirm, showAlert, user } = useAppContext();
  const history = useHistory();
  const { teamId } = useParams();
  
  //The output from TeamTracker is not "access protected" in any way
  //(unauthenticated users must be able to follow a team's result)
  //But it would be very confusing to allow showing another user's catalog
  //here so ensure that the team is actually "owned" by the current user.
  //(Any attempts to modify/discard surveys would in the end fail due to
  //access permissions in the backend anyway)
  const validationResult = useValidatedTeam(teamId);
  const validatedTeamId = validationResult.teamObj ? validationResult.teamObj.id : null;

  useEffect(() => {
    if (validationResult.status === ValidationStatus.NOT_OWNER) {
      !!showAlert && showAlert(
        "Invalid URL",
        "It looks like you tried to access a team you are not the owner of"
      );
      
      //Why SetTimeout?
      //Because of crappy setTimeout in Teams... in case of only
      //one team with "auto-selection" I might get a onTeamSelect
      //call delayed by a setTimeout inside Teams (TODO: fix that!)
      setTimeout(() => !!history && history.replace("/"), 0);
    } else if (validationResult.status === ValidationStatus.FAILED) {
      !!showAlert && showAlert(
        "User configuration error",
        "Could not derive user's team ownership",
        "Error",
        validationResult.errorMsg
      );
    }
  }, [validationResult, showAlert, history]);

  let { surveys, readError } = useTeamTracker(validatedTeamId);
  
  const onTeamsSelect = (id) => {
    history.push(`/creator/tracker/${id}`);
  };

  const onShare = ({ id }) => {
    history.push(`/creator/info/${id}`);
  };

  /* Edit button sets ID, which is used to set "meta" via effect to ensure
   * consistency if "surveys" is updated ("meta" drives the edit modal)
   */
  const [editSurveyId, setEditSurveyId] = useState(null);
  const [editSurveyMeta, setEditSurveyMeta] = useState(null);
  const onEdit = ({ id }) => {
    setEditSurveyId(id);
  };

  useEffect(() => {
    let editMeta = null;
    if (surveys && editSurveyId) {
      const meta = surveys.filter((s) => s.meta.id === editSurveyId).map((s) => s.meta);
      if (meta.length > 0) {
        editMeta = meta[0];
      } else {
        console.log(`Can't find survey with id ${editSurveyId} for editing`);
        setEditSurveyId(null);
      }
    }
    setEditSurveyMeta(editMeta);
  }, [surveys, editSurveyId]);
  
  const onEditClose = () => {
    setEditSurveyId(null); //Id=null -> meta=null
  };

  const onDelete = ({ id, createTime }) => {
    const dateStr = new Date(createTime).toLocaleDateString();
    queryConfirm(
      "Delete survey",
      `Are you sure you want to delete the survey from ${dateStr}?`,
      (confirmed) => {
        if (confirmed) {
          //TODO/TBD: need for some "spinner" or other blocking wait until done?
          deleteSurvey(id)
          .then((r) => {
            //nothing to do here (yet), the result from deleteSurvey is empty anyway
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
          <InfoBlock>
            <p>
              The <Link to={pathR}>analysis result page</Link> for this team is
              continuously updated when new responses are received.
            </p>
          </InfoBlock>
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
                    <SurveyItem
                      surveyMeta={s.meta}
                      onEdit={onEdit}
                      onDelete={onDelete} />
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
          <SurveyEditModal meta={editSurveyMeta} onClose={onEditClose}/>
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
