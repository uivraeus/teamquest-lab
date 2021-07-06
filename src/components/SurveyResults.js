import React from "react";
import { CompLev } from "../helpers/survey";
import EfficiencyResult from "./EfficiencyResult";
import InfoBlock from "./InfoBlock";
import MarkdownBlock from "./MarkdownBlock";
import MaturityResult from "./MaturityResult";
import ResultsChart from "./ResultsChart";
import useTeamResults from "../hooks/TeamResults";
import { matchedMaturityStages } from "../helpers/algorithm";
import { Link } from "react-router-dom";

import './SurveyResults.css';

//The charts presented under this result page are partially styled via javascript
//So, to align the colors between the latest result and the history plots the
//colors are defined here (or at least which css-variables that hold them)
const colorsM = ["m1", "m2", "m3", "m4"].map(c => `var(--color-result-${c})`);
const colorE = `var(--color-result-e)`;

const labelsM = [
  "1. Dependency and Inclusion",
  "2. Counter-Dependency and Fight",
  "3. Trust and Structure",
  "4. Work and Productivity"
];
const labelE = "Perceived Efficiency";

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
      resultDescr = meta.ongoing ? "not yet completed" : "completed";
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
  //Interpretation of current maturity result
  const matchingStages = showLatestResult ? matchedMaturityStages(latestResult.maturity) : [];
  const detailsFile = `stage-details-${matchingStages.length ? matchingStages.join('') : 0}`;

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
                  {latestResult.meta.compLev === CompLev.SOME ?
                    <InfoBlock>
                      <CompletionHint/>
                    </InfoBlock> : null                    
                  }
                  <hr/>
                  <div className="SurveyResults-latest-graphs">
                    <MaturityResult 
                      resultData={latestResult.maturity}
                      ongoing={latestResult.meta.ongoing}
                      colors = {colorsM}
                      labels = {labelsM}
                    />
                    <EfficiencyResult 
                      resultData={latestResult.efficiency}
                      color = {colorE}
                      label = {labelE}
                    />
                  </div>
                  <hr/>
                  {(!latestResult.meta.ongoing && latestResult.maturity) ?
                    <>
                      <MarkdownBlock mdFileName={detailsFile} />
                      <InfoBlock>
                        <p>
                          You can find the entire toolbox for all the stages <a href={toolboxUrl} target="_blank" rel="noreferrer" >here</a>.
                        </p>
                        <p>
                          If the suggested tools don't suit your team, please also look at the other tools and try them out.
                        </p>
                      </InfoBlock>
                    </> : null
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
                    colors = {colorsM}
                    labels = {labelsM}
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
