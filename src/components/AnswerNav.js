import React, { useRef, useState } from "react";
import AppBtn from "./AppBtn";
import RadioLabel from './RadioLabel'
import { ReactComponent as LeftIcon } from "../icons/left-arrow.svg";

import './AnswerNav.css';

/* TODO/TBD: 
 * The tab/keyboard navigation is maybe not exactly what I want. Maybe good to revise it with inspiration
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
  const refFirstRadio = useRef(null);
  const refLastRadio = useRef(null);

  //Helpers for which buttons to enable/disable
  const allowSubmit = answers.reduce((acc, v) => acc && v !== -1, true);
  const allowPrev = current > 0;
  const allowNext = current < answers.length - 1 && answers[current] !== -1; //no sneak peaks

  //Helpers for auto-moving focus in an "intelligent" fashion
  const focusOnFirstInput = () => {
    refFirstRadio && refFirstRadio.current && refFirstRadio.current.focus();
  }
  const focusOnLastInput = () => {
    refLastRadio && refLastRadio.current && refLastRadio.current.focus();
  }
  const focusOnPrev = () => {
    refPrev && refPrev.current && refPrev.current.focus();
  }
  const focusOnNext = () => {
    refNext && refNext.current && refNext.current.focus();
  }  
  
  //My hack to distinguish between selection(/answer) change based on
  //explicit (mouse) clicking and up/down-keys
  const [keyUpDownPressed, setKeyUpDownPressed] = useState(false);
  
  //Callbacks for user (answer) input, either via clicking or arrow-navigating
  const onAnswerChange = (e) => {
    const updatedAnswers = answers.map((v, i) =>
      i === current ? Number(e.target.value) : v
    );
    setAnswers(updatedAnswers);

    if (!keyUpDownPressed) {
      //typical "click on answer" case
      if (current < answers.length - 1) {
        setTimeout(focusOnNext, 0); //have to let the re-rendering enable the button first
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
    if (current > 1) {
      focusOnPrev();
    } else {
      focusOnNext();
    }
  };

  const onNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
    if (current < questions.length - 2) {
      const nextUnanswered = answers[current + 1] === -1;
      if (!nextUnanswered) {
        focusOnNext();
      }
    } else {
      focusOnPrev();
    }
  };

  const onKeyDown = (e) => {
    if (refPrev && refPrev.current && refNext && refNext.current) { //just in case...
    
      if (e.keyCode === 38 || e.keyCode === 40) {
        //up or down arrow key
        setKeyUpDownPressed(true);
        if (refPrev.current.isActiveElement() || refNext.current.isActiveElement()) {
          if (e.keyCode === 38) {
            //arrow-up, while prev or next is selected -> move focus to last radio input
            focusOnLastInput();
          } else {
            //arrow-down -> focus on first instead
            focusOnFirstInput();
          }
        }
      } else {
        setKeyUpDownPressed(false);
      }

      if (e.keyCode === 37 || e.keyCode === 39) {
        //left or right arrow key
        e.preventDefault();
        //Default behavior is to navigate between questions. The exceptions are:
        //- When Prev-button is focused, "Right" moves focus to Next-button
        //- and vice versa for the Next/"Left" case
        if (e.keyCode === 39) {
          if (refPrev.current.isActiveElement()) {
            focusOnNext();
          } else if (allowNext) {
            onNext();
          }
        } else {
          if (refNext.current.isActiveElement()) {
            focusOnPrev();
          } else if (allowPrev) {
            onPrev();
          }
        }
      }
    }
  };

  //Helper for selecting the proper "ref" for the radio inputs
  const getApplicableInputRef = (i) => (
    (i === answerOptions.length - 1) ? refLastRadio : (i === 0 ? refFirstRadio : null)
  );

  //The styling of the radio-input (including all spans around/next to it)
  //are inspired by: https://moderncss.dev/pure-css-custom-styled-radio-buttons/ 
  return (
    <form className="AnswerNav-form" onSubmit={onSubmit} onKeyDown={onKeyDown}>
      <div className="AnswerNav-content">
        <div className="AnswerNav-content-question">
          <p>{questions[current]}</p>
        </div>
        <fieldset>
          {answerOptions.map((v, i) => {
            return (
              <RadioLabel
                ref = {getApplicableInputRef(i)}
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
          <AppBtn text="Submit answers" kind="accent" type="submit" id="submit" disabled={!allowSubmit}/>
        </div>
      </div>
    </form>
  );
};

export default AnswerNav;
