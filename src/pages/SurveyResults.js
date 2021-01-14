import React from "react";
import { CompLev } from "../helpers/survey";
import InfoBlock from "../components/InfoBlock";
import SurveyResult from "../components/SurveyResult";
import ResultsChart from "../components/ResultsChart";
import useTeamResults from "../hooks/TeamResults";
import { useParams } from "react-router-dom";

import './SurveyResults.css';

const SurveyResults = () => {
  const { teamId } = useParams();
  const { results, latestResult, analysisError } = useTeamResults(teamId);

  //The charts presented under this result page are partially styled via javascript
  //So, to align the colors between the latest result and the history plots the
  //colors are defined here (or at least which css-variables that hold them)
  const colors = ["a", "b", "c", "d"].map(c => `var(--color-result-${c})`);

  const labels = [
    "Dependency and Inclusion",
    "Counter-Dependency and Fight",
    "Trust and Structure",
    "Work and Productivity"
  ];

  const toolboxUrl = "https://en.wikipedia.org/wiki/Knitting";

  //Derive information/text to render for the "latest result"
  //TODO: replace with "selected" instead of "latest" ?
  let showLatestResult = false;
  let latestDescrStr = null;
  if (latestResult) {
    const meta = latestResult.meta;
    latestDescrStr =
      new Date(meta.createTime).toLocaleDateString() + ", ";
    showLatestResult = !!latestResult.analysis;
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
                  <SurveyResult 
                    resultData={latestResult.analysis}
                    colors = {colors}
                    labels = {labels}
                  />
                  <InfoBlock>
                    <p>
                      Learn more about the <a href={toolboxUrl}>Toolbox</a> for working
                      with each team maturity profile
                    </p>
                  </InfoBlock>
                </>
              ) : (
                <em>No surveys found</em>
              )}
              {results.length > 1 ? (
                <>
                  <h3>Team history</h3>
                  <ResultsChart
                    results={results}
                    maxVal={10}
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
