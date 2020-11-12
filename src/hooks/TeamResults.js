import { useEffect, useState } from 'react';
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

//returns { results, latestResult, analysisError }
// - every "result" in results has the shape {meta, analysis}
// - latestResult may have analysis=null if still not ready (otherwise results[len-1])
function useTeamResults(teamId) {
  const { surveys, readError } = useTeamTracker(teamId);

  const [ {results, latestResult}, setResults] = useState({ results: null, latestResult: null });
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    if (surveys && surveys.length && !readError) {
      try {
        //Filter out the surveys for which we will derive and present the results
        const validSurveys = surveys.filter(isValidForAnalysis);

        //Fake some analysis result (TODO: replace with actual computation)
        const dummyRandom = () => Math.floor(Math.random() * 10) + 1;
        const newResults = validSurveys.map((survey, ix) => {
          const analysis = [
            dummyRandom(),
            dummyRandom(),
            dummyRandom(),
            ix % 11,
          ];
          return { meta: survey.meta, analysis };
        });

        //If the latest (last) entry was valid just point to the entry in results
        //Otherwise create a new object without analysis
        const newLatestResult = isValidForAnalysis(surveys[surveys.length - 1])
          ? newResults[newResults.length -1]
          : {meta: surveys[surveys.length - 1].meta, analysis: null};
              
        //Update state and clear any previous error
        setResults({results: newResults, latestResult: newLatestResult});
        setAnalysisError(null);

      } catch (e) {
        console.log("Corrupted survey data?", e);
        setAnalysisError(e.message);
        setResults({ results: null, latestResult: null });
      }
    } else {
      if (readError) {
        setAnalysisError(`Error reading raw survey data: ${readError}`);
      }
      setResults({ results: null, latestResult: null });
    }
  }, [surveys, readError]);

  return {results, latestResult, analysisError }
}

export default useTeamResults;
