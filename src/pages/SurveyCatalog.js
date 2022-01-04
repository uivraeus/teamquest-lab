import React, { useEffect, useState } from "react";
import BackBtnLink from "../components/BackBtnLink";
import InfoBlock from "../components/InfoBlock";
import RouteSelect from "../components/RouteSelect"
import SurveyEditModal from "../components/SurveyEditModal";
import SurveyItem from "../components/SurveyItem";
import useAppContext from "../hooks/AppContext";
import useTeamTracker from "../hooks/TeamTracker";
import { CompLev, deleteSurvey } from "../helpers/survey";
import { Link, useNavigate } from "react-router-dom";
import { absAppPath, absCreatorPath } from "../RoutePaths";

import "./SurveyCatalog.css";

const SurveyCatalog = ({ teams }) => {
  const { queryConfirm, showAlert } = useAppContext();
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState(null);
  let { surveys, readError } = useTeamTracker(selectedTeam ? selectedTeam.id : null);
  
  const onShare = ({ id }) => {
    navigate(`${absCreatorPath("info")}/${id}`);
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
  
  //If no team(s) defined, the user must create one via the Manage section
  //TODO: fix this in Creator with some custom "TeamsRoute" or similar
  useEffect(() => {
    if (teams.length === 0) {
      navigate(absCreatorPath("manage"));
    }
  }, [teams, navigate]);
  if (teams.length === 0) {
    return null;
  }
  
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

  const pathR = `${absAppPath("results")}/${selectedTeam ? selectedTeam.id : ""}`;
  
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
      <label htmlFor="team-select">Team:</label>
      <RouteSelect
        options={teams}
        textKey="alias"
        elementId="team-select"
        onSelected={setSelectedTeam}
      />
      {surveys ? (
        <>
          <InfoBlock>
            <p>
              The <Link to={pathR} state={teams}>analysis result page</Link> for
              this team is continuously updated when new responses are received.
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
      ) : selectedTeam ? (
        <p>
          <em>Loading surveys...</em>
        </p>
      ) : null}
      {readError ? (
        <p>
          <em>{readError}</em>
        </p>
      ) : null}
      <BackBtnLink separator/>
    </div>
  );
};

export default SurveyCatalog;
