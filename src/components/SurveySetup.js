import React, { useState } from "react";
import AppBtn from "./AppBtn";
import { createSurvey } from "../helpers/survey";
import useAppContext from "../hooks/AppContext";

import "./SurveySetup.css";

const SurveySetup = ({ teamId, onCreated }) => {
  //TBD: configurable defaults?
  const minAnswers = 3;
  const [expAnswers, setExpAnswers] = useState(3);
  const [hoursOpen, setHoursOpen] = useState(1);
  
  const {showAlert} = useAppContext();

  const onEdit = (e) => {
    const value =
      isNaN(e.target.value) || e.target.value <= 0 ? "" : Number(e.target.value);
    if (e.target.id === "exp") setExpAnswers(value);
    else if (e.target.id === "hours") setHoursOpen(value);
  };

  const startSurvey = async (e) => {
    e.preventDefault();

    try {
      const surveyId = await createSurvey(teamId, minAnswers, expAnswers, hoursOpen)
      onCreated(surveyId);
    } catch (e) {
      console.log(e);
      showAlert("Data backend error", e.message, "Error");
    }
  };

  const validSettings =
    expAnswers && typeof expAnswers === "number" &&
    expAnswers >= minAnswers &&
    hoursOpen && typeof hoursOpen === "number";

  return (
    <div className="SurveySetup">
      <form onSubmit={startSurvey}>
        <fieldset className="param-list">
          <legend>Survey parameters</legend>
          <li className="param-list-entry">
            <label htmlFor="exp">Expected number of responders (≥3)</label>
            <input
              type="number"
              min={`${minAnswers}`}
              value={expAnswers}
              id="exp"
              onChange={onEdit}
            />
          </li>
          <li className="param-list-entry">
            <label htmlFor="hours">Hours before survey closes:</label>
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
