import React, { useRef, useState } from "react";
import AppBtn from "./AppBtn";
import RadioLabel from './RadioLabel'
import { ReactComponent as LeftIcon } from "../icons/left-arrow.svg";

import './AnswerNav.css';

/* TODO/TBD: 
 * The tab/keyboard navigation is a bit "off" here w.r.t focus etc. Maybe good to revise it with inspiration
 * from this article: https://www.w3.org/TR/wai-aria-practices/examples/radio/radio-1/radio-1.html
 */ 

const AnswerNav = ({ questionsHandle, onSubmitAnswers }) => {
  const questions = questionsHandle.questions;
  const answerOptions = questionsHandle.answerOptions;

  const [answers, setAnswers] = useState(Array(questions.length).fill(-1)); // -1 corresponds to "unanswered";
  const [current, setCurrent] = useState(0); // start with first question

  //References to DOM elements for controlling focus and arrow-key navigation
  const refPrev = useRef(null);
  const refNext = useRef(null);
  const refSubmit = useRef(null);
  const refInput = useRef(null);

  //Helpers for "auto-navigating"
  const isNextUnanswered = () => {
    if (current < questions.length - 1) {
      return answers[current + 1] === -1;
    }
    return false;
  }

  const isSubmitAllowed = () => {
    return (answers.reduce((acc, v) => acc && v !== -1, true) &&
      refSubmit &&
      refSubmit.current);
  }

  //My hack to distinguish between selection(/answer) change based on
  //explicit (mouse) clicking and up/down-keys
  const [keyUpDownPressed, setKeyUpDownPressed] = useState(false);
  
  //Callbacks for user (answer) input
  const onAnswerChange = (e) => {
    const updatedAnswers = answers.map((v, i) =>
      i === current ? Number(e.target.value) : v
    );
    setAnswers(updatedAnswers);

    if (!keyUpDownPressed) {
      if (isNextUnanswered()) {
        //Move to next question (after some esthetic delay)
        setTimeout(onNext, 500);
      } else if (isSubmitAllowed()) { //TBD: better to only move focus when _last_ question answered?
        //No more questions to answer
        if (refSubmit && refSubmit.current) {
          refSubmit.current.focus();
        }
      }
    } else {
      setKeyUpDownPressed(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    onSubmitAnswers(answers);
  };

  //Callbacks for navigating back and forth among the questions
  const onPrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
    if (refInput && refInput.current) {
      // console.log("move focus to input");
      //TODO: not sure this works as intended for me...
      refInput.current.focus();
    }
  };

  const onNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
    if (refInput && refInput.current) {
      //console.log("move focus to input");
      refInput.current.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 38 || e.keyCode === 40) {
      setKeyUpDownPressed(true);
    } else {
      setKeyUpDownPressed(false);
    }

    if (e.keyCode === 37 || e.keyCode === 39) {
      //left or right arrow key
      e.preventDefault();
      //Default behavior is to navigate between questions. The exceptions are:
      //- When Prev-button is focused, "Right" moves focus to Next-button
      //- and vice versa for the Next/"Left" case
      if (refPrev && refPrev.current && refNext && refNext.current) { //just in case...
        if (e.keyCode === 39) {
          if (refPrev.current.isActiveElement()) {
            refNext.current.focus();
          } else {
            onNext();
          }
        } else {
          if (refNext.current.isActiveElement()) {
            refPrev.current.focus();
          } else {
            onPrev();
          }
        }
      }
    }
  };

  //Helpers for which buttons to enable/disable
  const allowSubmit = answers.reduce((acc, v) => acc && v !== -1, true);
  const allowPrev = current > 0;
  const allowNext = current < answers.length - 1;

  //The styling of the radio-input (including all spans around/next to it)
  //are inspired by: https://moderncss.dev/pure-css-custom-styled-radio-buttons/ 
  return (
    <form className="AnswerNav-form" onSubmit={onSubmit} onKeyDown={onKeyDown}>
      <div className="AnswerNav-content">
        <div className="AnswerNav-content-question">
          <p>{questions[current]}</p>
        </div>
        <fieldset ref={refInput}>
          {answerOptions.map((v, i) => {
            return (
              <RadioLabel
                key={i}
                name="answer"
                value={i}
                text={v}
                checked={i === answers[current]}
                onChange={onAnswerChange}
              />
            );
          })}
        </fieldset>

        <div className="Navigator">
          <div className="Navigator-direction">
            <AppBtn ref={refPrev} id="prev" onClick={onPrev} disabled={!allowPrev}>
              <LeftIcon />
            </AppBtn>
            <label>
              {current + 1} / {answers.length}
            </label>
            <AppBtn ref={refNext} id="next" onClick={onNext} disabled={!allowNext}>
              <LeftIcon />
            </AppBtn>
          </div>
          <AppBtn ref={refSubmit} text="Submit answers" kind="accent" type="submit" id="submit" disabled={!allowSubmit}/>
        </div>
      </div>
    </form>
  );
};

export default AnswerNav;
