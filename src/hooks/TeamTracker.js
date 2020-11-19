import { useEffect, useState } from 'react';
import { cancelAll, getAll, getMeta, CompLev } from '../helpers/survey';

/* This useTeamTracker hook allows other components to make use of continuously
 * updated survey responses
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

//returns { surveys, readError }
function useTeamTracker(teamId) {
  
  //Responses, incl. meta-data for all surveys for the team
  //(incl. recent ones, which may still be open)
  const [surveys, setSurveys] = useState(null);
  const [readError, setReadError] = useState(null);
 
  useEffect( () => {
    //Subscribe to all raw survey data
    let dbDataRef = null;
    if (teamId !== null) {
      try {
        dbDataRef = getAll(teamId, (rawSurveys, anyError) => {
          if (anyError) { //TBD;
            console.log("anyError set when reding surveys for teamId:", teamId);
          }
          if (rawSurveys && rawSurveys.length) {
            // Now refine the "raw responses" into something more useful
            setSurveys(convertFromRaw(rawSurveys));
          } else {
            // No surveys found (probably not an error)
            setSurveys([]);
          }          
          setReadError(null);
        });
      } catch(e) {
        console.log(e);
        setReadError(e.message);
      }
    } else {
      setSurveys(null);
    }

    return () => {
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
  
  return { surveys, readError }
}

export default useTeamTracker;
