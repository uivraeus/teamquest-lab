import React, { useState } from "react";
import AppBtn from "./AppBtn";
import { createSurvey } from "../helpers/survey";
import useAppContext from "../hooks/AppContext";

import "./SurveySetup.css";

const SurveySetup = ({ teamId, onCreated }) => {
  //TBD: configurable defaults?
  const [minAnswers, setMinAnswers] = useState(3);
  const [maxAnswers, setMaxAnswers] = useState(3);
  const [hoursOpen, setHoursOpen] = useState(1);
  
  const {showAlert} = useAppContext();

  const onEdit = (e) => {
    const value =
      isNaN(e.target.value) || e.target.value <= 0 ? "" : Number(e.target.value);
    if (e.target.id === "min") setMinAnswers(value);
    else if (e.target.id === "max") setMaxAnswers(value);
    else if (e.target.id === "hours") setHoursOpen(value);
  };

  const startSurvey = async (e) => {
    e.preventDefault();

    try {
      const surveyId = await createSurvey(teamId, minAnswers, maxAnswers, hoursOpen)
      onCreated(surveyId);
    } catch (e) {
      console.log(e);
      showAlert("Data backend error", e.message, "Error");
    }
  };

  const validSettings =
    minAnswers && typeof minAnswers === "number" &&
    maxAnswers && typeof maxAnswers === "number" &&
    maxAnswers >= minAnswers &&
    hoursOpen && typeof hoursOpen === "number";

  return (
    <div className="SurveySetup">
      <form onSubmit={startSurvey}>
        <fieldset className="param-list">
          <legend>Survey parameters</legend>
          <li className="param-list-entry">
            <label htmlFor="min">Minimum number of responders:</label>
            <input
              type="number"
              min="1"
              value={minAnswers}
              id="min"
              onChange={onEdit}
            />
          </li>
          <li className="param-list-entry">
            <label htmlFor="min">Maximum number of responders:</label>
            <input
              type="number"
              min={`${minAnswers}`}
              value={maxAnswers}
              id="max"
              onChange={onEdit}
            />
          </li>
          <li className="param-list-entry">
            <label htmlFor="hours">Hours before survey closes</label>
            <input
              type="number"
              min="1"
              value={hoursOpen}
              id="hours"
              onChange={onEdit}
            />
          </li>
        </fieldset>
        <AppBtn text="Start Survey" kind="accent" type="submit" id="start" disabled={!validSettings}/>
      </form>
    </div>
  );
};

export default SurveySetup;
