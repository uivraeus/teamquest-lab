import React, { useEffect, useState } from 'react';
import AnswerNav from '../components/AnswerNav';
import { getTimeLeft, isOpen, isOpenById, load, loadQuestions, pushResponse } from '../helpers/survey';
import { Link, useParams } from 'react-router-dom';
import { absAppPath } from '../RoutePaths';

import './Run.css';

const Run = () => {
  const { surveyId } = useParams();
  
  //Questions are read from data backend (at mount) and answers written to it (at Submit)
  const [questionsHandle, setQuestionsHandle] = useState(null); //both questions and answer options
  const [readError, setReadError] = useState(null);
  const [submitted, setSubmitted] = useState(false); //TBD: Really needed?
  const [writeError, setWriteError] = useState(null);

  //The "open status" and its lifetime is derived when mounting this component.
  //There are probably (rare) cases where the database state change in a significant way
  //before submitting our answers, which may result in a write failure. If that occurs
  //a fresh read-out can be done to determine the details of what happened.
  const [surveyOpen, setSurveyOpen] = useState(true);
  const [idCloseTimeout, setIdCloseTimeout] = useState(null);

  //The team ID (derived from meta-data) is needed for linking to results page
  const [teamId, setTeamId] = useState(null);

  useEffect ( () => {
    //Load the initial survey state (object)
    load(surveyId).then( surveyObject => {
      //Save for showing results link
      setTeamId(surveyObject.meta.teamId);

      //Check that this survey is still open and valid
      if (!isOpen(surveyObject)) {
        setSurveyOpen(false);
      } else {
        loadQuestions(surveyObject).then( dbQuestions => {
          setQuestionsHandle(dbQuestions);

          //For now we don't subscribe to any changes, just assume
          //that the survey closes according to the current status
          const timeLeft = Math.max(0, getTimeLeft(surveyObject));
          //2147483647 (576h or 24 days) is the actual max for setTimeout but our numeric precision is not very good
          //at that range anyway so to make things a bit more deterministic (I think) and skip it completely if it is
          //more than 24h (86393109 ms) 
          if (timeLeft < 86393109) {
            const idTimeout = setTimeout( () => {
              setSurveyOpen(false);
              setIdCloseTimeout(null);//trigger (dummy) clear now, i.e. not at some later moment.
            }, timeLeft);
            setIdCloseTimeout(idTimeout);
            //console.log("Question loaded", Math.round(timeLeft/60000), "minutes left until survey closes");
          }
        }).catch( e => setReadError(e.message));
      }                           
    }).catch( e => {
        setReadError(e.message);    
    });    
    
    // When surveyId change (not really a case for us)
    return () => {
      //TBD
    }
  }, [surveyId]);
  
  //Awkward solution for managing the close timeout (use the "reverse effect")
  useEffect ( () => {
    return () => {
      if (idCloseTimeout)
        clearTimeout(idCloseTimeout);
    }
  }, [idCloseTimeout]);

  const onSubmitAnswers = (answers) => {
    if (!submitted) {
      setWriteError(null);
      pushResponse(surveyId, answers).then( r => {
        setSubmitted(true);
        setIdCloseTimeout(null); //-> cancel timeout started at mount 
      }).catch(e => {
        //Something failed, let's see if the survey just closed
        let errMsg = e.message; //default
        isOpenById(surveyId).then( stillOpen => {
          if (!stillOpen) {
            errMsg = "Survey closed before answers were recorded.";
            console.log(errMsg);
            setWriteError(errMsg);
            setSurveyOpen(false);
          }
        }).catch( e => {
          errMsg += e.message;
          setWriteError(errMsg); 
        }); 
      });
    }        
  }

  return (
    <div className="Run">
      {readError ? <p>{readError}</p> : <>
        {writeError ? <p>{writeError}</p> : null}
        {submitted ?
          <p>Thank you for participating!</p>
          : !surveyOpen ?
            <p>This survey is closed</p>
            : questionsHandle ?
                <AnswerNav questionsHandle={questionsHandle} onSubmitAnswers={onSubmitAnswers} />              
              : <p>Loading...</p>      
        }
        {(submitted || !surveyOpen) && teamId  ?
          <p>Visit the <Link to={`${absAppPath("results")}/${teamId}`}>Results and History</Link> page to see your team's status</p>
          : null
        }
      </>} 
    </div>
  );
}

export default Run;
