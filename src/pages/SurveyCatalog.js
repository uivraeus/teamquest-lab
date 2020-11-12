import React, { useEffect, useState } from 'react';
import AppBtn from "../components/AppBtn"
import Teams from "../components/Teams";
import SurveyItem from "../components/SurveyItem";
import useTeamTracker from "../hooks/TeamTracker";
import { CompLev } from '../helpers/survey';
import { auth } from "../services/firebase";
import { Link, useHistory, useParams } from "react-router-dom";

import { ReactComponent as ResultsIcon } from "../icons/analysis.svg";

import "./SurveyCatalog.css";


const SurveyCatalog = () => {
  const [user, setUser] = useState(null);
  const history = useHistory();
  const { teamId } = useParams();
  
  let { surveys, readError } = useTeamTracker(teamId || null);

  useEffect(() => {
    const u = auth().currentUser;
    setUser(u);
  }, []);

  const onTeamsSelect = (id) => {
    history.push(`/creator/tracker/${id}`);
  }

  const onShare = (surveyId) => {
    history.push(`/creator/info/${surveyId}`);
  };

  const onEdit = (surveyId) => {
    console.log("TODO: Edit survey settings", surveyId);
  }

  const onDelete  = (surveyId) => {
    console.log("TODO: Delete (discard?) survey", surveyId);
  }

  const pathR = `/results/${teamId}`;
  const onResults = () => {
    history.push(pathR);
  }

  //"early exit"
  if (!user) {
    return (<p>Loading user...</p>)
  }

  //Sort the surveys according to their completion status
  //Here it makes most sense to present newest surveys first
  const ongoing = surveys && surveys.filter( s => s.meta.ongoing ).reverse();
  const completed  = surveys && surveys.filter (s =>
    (!s.meta.ongoing && s.meta.compLev !== CompLev.TOO_FEW)).reverse();
  const discarded = surveys && surveys.filter(s => (!s.meta.ongoing && (
    (s.meta.compLev === CompLev.TOO_FEW) ||
    (s.meta.compLev === CompLev.CANCELED)))).reverse();

  return (
    <div className="SurveyCatalog">
      <h1>Survey catalog</h1>
      <Teams user={user} enableEdit={false} onSelected={onTeamsSelect} extSelection={teamId} />
      {surveys ? (<>
        <div className="SurveyCatalog-result-link">
          <div>
            <AppBtn onClick={onResults}>
              <ResultsIcon />
            </AppBtn>
          </div>
          <p>The <Link to={pathR}>analysis result page</Link> for this team is continuously updated when new responses are received.</p>
        </div>  
        <h3>Ongoing surveys</h3>
        {ongoing.length ?
          <ul> {
            ongoing.map( s => {
            return (
              <li key={s.meta.id}>
                <SurveyItem surveyMeta={s.meta} onShare={onShare} onEdit={onEdit} onDelete={onDelete}/>
              </li>
            )
          })}</ul> : <p><em>No ongoing surveys</em></p>}
        <h3>Completed surveys</h3>
        {completed.length ?
          <ul> {
            completed.map( s => {
            return (
              <li key={s.meta.id}>
                <SurveyItem surveyMeta={s.meta} onDelete={onDelete}/>
              </li>
            )
          })}</ul> : <p><em>No completed surveys</em></p>}
        <h3>Discarded or never completed surveys</h3>
        {discarded.length ?
          <ul> {
            discarded.map( s => {
            return (
              <li key={s.meta.id}>
                <SurveyItem surveyMeta={s.meta} />
              </li>
            )
          })}</ul> : <p><em>No discarded surveys</em></p>}
      </>) : teamId ?
       <p><em>Loading surveys...</em></p> : null}
      {readError ? <p><em>{readError}</em></p> : null}
    </div>
  );
}

export default SurveyCatalog;