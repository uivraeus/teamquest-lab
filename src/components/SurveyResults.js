import React from "react";
import { CompLev } from "../helpers/survey";
import InfoBlock from "./InfoBlock";
import SurveyResult from "./SurveyResult";
import ResultsChart from "./ResultsChart";
import ResultInterpretation from "./ResultInterpretation";
import useTeamResults from "../hooks/TeamResults";
import { Link } from "react-router-dom";

import './SurveyResults.css';

//The charts presented under this result page are partially styled via javascript
//So, to align the colors between the latest result and the history plots the
//colors are defined here (or at least which css-variables that hold them)
const colors = ["a", "b", "c", "d"].map(c => `var(--color-result-${c})`);

const labels = [
  "1. Dependency and Inclusion",
  "2. Counter-Dependency and Fight",
  "3. Trust and Structure",
  "4. Work and Productivity"
];

const toolboxUrl = "https://proagileab.github.io/agile-team-development/";

const SurveyResults = ({ teamId, manageUrl = null }) => {
  const { results, latestResult, analysisError } = useTeamResults(teamId);

  //Derive information/text to render for the "latest result"
  //TODO (?): replace with "selected" instead of "latest"
  let showLatestResult = false;
  let latestDescrStr = null;
  if (latestResult) {
    const meta = latestResult.meta;
    latestDescrStr =
      new Date(meta.createTime).toLocaleDateString() + ", ";
    showLatestResult = !!latestResult.maturity; //maturity is always present in survey
    let resultDescr = "results not yet available";
    if (showLatestResult) {
      resultDescr = meta.ongoing ? "still ongoing" : "completed";
    }
    if (meta.compLev === CompLev.CANCELED) {
      latestDescrStr += "cancelled";
    } else if (!meta.ongoing && meta.compLev === CompLev.TOO_FEW) {
      latestDescrStr += "never completed (too few responders)";
    } else {
      const n = meta.numResponders;
      latestDescrStr +=
        `${n} responder` + (n !== 1 ? "s (" : " (") + resultDescr + ")";
    }
  }

  //Hint to the users waiting for analysis results due to ongoing survey
  const CompletionHint = () =>
    manageUrl ?
      <p>
        You can mark the survey as completed by <Link to={{pathname:manageUrl, state:{prevPage:"Results page"}}}>
        editing the survey settings</Link> if no additional responses are expected.
      </p> : 
      <p>
        The initiator of the survey can mark it as completed if no additional responses
        are expected.
      </p>  

  return (
    <div className="SurveyResults">
      <h3>Latest survey</h3>
      {analysisError ? (
        <p><em>Could not obtain any results</em></p>
      ) : (
        <>
          {!results ? (
            <p>Loading...</p>
          ) : (
            <>
              {latestResult ? (
                <>
                  <em>{latestDescrStr}</em>
                  <hr/>
                  <h4>Matching stages:</h4>
                  <SurveyResult 
                    resultData={latestResult.maturity}
                    colors = {colors}
                    labels = {labels}
                  />
                  <h4>Analysis</h4>
                  {(latestResult.meta.ongoing || !showLatestResult) ?
                    <>
                      <p><i>Waiting for completed survey...</i></p>
                      {latestResult.meta.compLev !== CompLev.TOO_FEW ?
                        <InfoBlock>
                          <CompletionHint/>
                        </InfoBlock> : null
                      } 
                    </> :
                    <ResultInterpretation resultData={latestResult.maturity}/>
                  }                  
                  <hr/>
                  {(!latestResult.meta.ongoing && latestResult.maturity) ?
                    <InfoBlock>
                      <p>
                        You can find the entire toolbox for all the stages <a href={toolboxUrl} target="_blank" rel="noreferrer" >here</a>.
                      </p>
                      <p>
                        If the suggested tools don't suit your team, please also look at the other tools and try them out.
                      </p>
                    </InfoBlock> : null
                  }
                  
                </>
              ) : (
                <em>No surveys found</em>
              )}
              {results.length > 1 ? (
                <>
                  <h3>Team history</h3>
                  <ResultsChart
                    results={results}
                    maxVal={100}
                    colors = {colors}
                    labels = {labels}
                  />
                </>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SurveyResults;
