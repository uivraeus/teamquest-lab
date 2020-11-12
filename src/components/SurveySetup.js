import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import AppBtn from "./AppBtn";

import "./SurveySetup.css";

const SurveySetup = ({ teamId, onCreated }) => {
  //TBD: configurable defaults?
  const [minAnswers, setMinAnswers] = useState(3);
  const [maxAnswers, setMaxAnswers] = useState(3);
  const [hoursOpen, setHoursOpen] = useState(1);
  const [writeError, setWriteError] = useState(null);

  //Fetch applicable question-set from the data backend
  const [questions, setQuestions] = useState(null); //{id, #questions}
  const [readError, setReadError] = useState(null);

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
      setWriteError(null);

      //To make validation rules simpler the various "len" entires are in #characters (when stored)
      //E.g. for 3 questions the answer may be ",[1,4,2]" (i.e. length 8)
      const lenIncrement = questions.num * 2 + 2;
      const minLenAnswers = minAnswers * lenIncrement;
      const maxLenAnswers = maxAnswers * lenIncrement;
      const result = await db.ref(`surveys`).push({
        meta: {
          ...{ teamId, minLenAnswers, maxLenAnswers, lenIncrement, hoursOpen },
          createTime: { ".sv": "timestamp" },
          questionsId: questions.id,
        },
      });
      onCreated(result.key);
    } catch (e) {
      console.log(e);
      setWriteError(e.message);
    }
  };

  useEffect(() => {
    //Keep it "simple";
    //Only check for a applicable question-set once, i.e. no subscription
    //to last-minute changes once this component has been mounted
    const ref = db
      .ref("question-sets")
      .orderByChild("createTime")
      .limitToLast(1);

    ref
      .once("value")
      .then((snapshot) => {
        if (snapshot.numChildren() !== 1)
          throw new Error("No valid question-set found");
        snapshot.forEach((snap) => {
          setQuestions({
            id: snap.key,
            num: snap.child("questions").numChildren(),
          });
        });
      })
      .catch((e) => {
        console.log(e);
        setReadError(e.message);
      });

    // Return what to do when "un-mounting"
    return () => {
      //TBD
    };
  }, []); //run once (~did mount) //TODO! check if this is the "correct way"

  const validSettings =
    questions &&
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
      {readError ? <p>{readError}</p> : null}
      {writeError ? <p>{writeError}</p> : null}
    </div>
  );
};

export default SurveySetup;
