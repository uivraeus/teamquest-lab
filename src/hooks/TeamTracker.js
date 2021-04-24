import { useEffect, useState } from 'react';
import { cancelAll, getAll, getMeta, CompLev } from '../helpers/survey';

/* This useTeamTracker hook allows other components to make use of continuously
 * updated survey responses
 *
 * The main output from this hook is the "surveys" array and the associated
 * "surveysTeamId", which enables consistency checks when the input teamId
 * changes. To allow for error reporting, a "readError" is also provided (null
 * when no error).
 * All these result entries are bundled into an object. 
 */

//Internal list conversion helper ("raw responses" -> results, incl. meta-data)
const convertFromRaw = (surveys) => {
  return surveys.map(survey => {
    try {
      return getMeta(survey); // { meta, respHandle }
    } catch(e) {
      //TODO: OK to just "fake" CANCELED or better to bail out completely?
      console.log(e);
      console.log("Bad survey data detected, skipping");
      return {
        meta: {createTime:0, compLev:CompLev.CANCELED, ongoing:false, numResponders:0},
        respHandle: null
      };
    }       
  });
};

const defaultResult = { surveys: null, readError:null, surveysTeamId: null };
function useTeamTracker(teamId) {
  
  //Responses, incl. meta-data for all surveys for the team
  //(incl. recent ones, which may still be open)
  const [result, setResult] = useState(defaultResult);
  
  useEffect( () => {
    //Subscribe to all raw survey data
    let dbDataRef = null;
    if (teamId !== null) {
      try {
        dbDataRef = getAll(teamId, (rawSurveys, anyError) => {
          if (anyError) { //TBD;
            console.log("anyError set when reding surveys for teamId:", teamId);
          }
          // Now refine the "raw responses" into something more useful
          // (if no surveys are found that is probably not an error)
          const surveys = (rawSurveys && rawSurveys.length) ?
            convertFromRaw(rawSurveys) :
            [];
          setResult({ ...defaultResult, surveys, surveysTeamId: teamId }); 
        });
      } catch(e) {
        console.log(e);
        setResult({ ...defaultResult, readError: e.message });
      }
    } else {
      setResult(defaultResult);
    }

    return () => {
      //Don't provide obsolete results when the teamId changes
      setResult(defaultResult);
      if (dbDataRef) {
        //Unsubscribe from prev team's updates
        try {
          cancelAll(teamId, dbDataRef);
        } catch(e) {
          console.log("Could not cancel subscription", e);
        }
      }
    };
  }, [teamId]);
  
  //Never return obsolete results when the teamId changes
  if (teamId !== result.surveysTeamId) {
    return defaultResult;  
  } else {
    return result;
  }
}

export default useTeamTracker;
