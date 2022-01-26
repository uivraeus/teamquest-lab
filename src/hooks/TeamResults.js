import { useEffect, useState } from 'react';
import { splitResponses, verifyInput } from '../helpers/responses';
import { analyzeEfficiency, analyzeMaturity } from '../helpers/algorithm';
import useAppContext from "../hooks/AppContext"
import useTeamTracker from "./TeamTracker";
import { CompLev } from "../helpers/survey";

/* This useTeamResults hook allows other components to make use of continuously
 * updated survey results (history). Under the hood, it uses the useTeamTracker
 * hook for reading raw survey responses.
 */

//Helper for evaluating of a survey has enough responses for calculating a result
const isValidForAnalysis = (survey) => {
  return survey.meta.compLev === CompLev.SOME || survey.meta.compLev === CompLev.ALL;
}

//The underlying algorithms produce output in % with 1pp resolution [0-100]
//But when presented to the end-users it makes more sense to round to nearest 10pp
const roundResult = value => 10 * Math.round(value/10);
const roundResults = values => values.map(v => roundResult(v));

const defaultResult =  { meta: null, maturity: null };

//returns { results, latestResult, analysisError }
// - every "result" in results has the shape of defaultResult above
// - latestResult may have null in the analysis parts if still not ready (otherwise results[len-1])
function useTeamResults(teamId) {
  const { surveys, readError } = useTeamTracker(teamId);

  const [ {results, latestResult}, setResults] = useState({ results: null, latestResult: null });
  const [analysisError, setAnalysisError] = useState(null);

  const {showAlert} = useAppContext();

  useEffect(() => {
    if (surveys && surveys.length && !readError) {
      try {
        //Filter out the surveys for which we will derive and present the results
        const validSurveys = surveys.filter(isValidForAnalysis);

        const newResults = validSurveys.map((survey) => {
          verifyInput(survey.respHandle.responses);
          const resp = splitResponses(survey);
          const efficiency = resp.efficiency ? roundResult(analyzeEfficiency(resp.efficiency)) : null;
          const maturity = resp.maturity ? roundResults(analyzeMaturity(resp.maturity)) : null;
          return { meta: survey.meta, efficiency, maturity };
        });

        //If the latest (last) entry was valid just point to the entry in results
        //Otherwise create a new object without analysis parts
        const newLatestResult = isValidForAnalysis(surveys[surveys.length - 1])
          ? newResults[newResults.length -1]
          : { ...defaultResult, meta: surveys[surveys.length - 1].meta };
              
        //Update state and clear any previous error
        setResults({results: newResults, latestResult: newLatestResult});
        setAnalysisError(null);

      } catch (e) {
        setAnalysisError(`Corrupted survey data? ${e.message}`);
        setResults({ results: null, latestResult: null });
      }
    } else {
      if (readError) {
        setAnalysisError(`Error reading raw survey data: ${readError}`);
      }
      if (surveys && surveys.length === 0) {
        //Probably no surveys defined for this team yet
        setResults({ results: [], latestResult: null });
      }
    }
  }, [surveys, readError]);

  //Alert on error
  useEffect( () => {
    if (analysisError && showAlert) {
      showAlert("Error analyzing team results", analysisError, "Error");
    }
  }, [analysisError, showAlert])

  return {results, latestResult, analysisError }
}

export default useTeamResults;
