import React from "react";
import { CompLev } from "../helpers/survey";
import EfficiencyResult from "./EfficiencyResult";
import HistoryChart from "./HistoryChart";
import InfoBlock from "./InfoBlock";
import MarkdownBlock from "./MarkdownBlock";
import MaturityResult from "./MaturityResult";
import ResultsNav from "./ResultsNav";
import useTeamResults from "../hooks/TeamResults";
import { matchedMaturityStages } from "../helpers/algorithm";
import { Link, useLocation, useNavigate } from "react-router-dom";

import './SurveyResults.css';

const toolboxUrl = "https://proagileab.github.io/agile-team-development/";

const SurveyResults = ({ teamId, selectedSurveyId = null, manageUrl = null }) => {
  const { results, latestResult, analysisError } = useTeamResults(teamId);

  //Show the latest result if there is no (valid) selection
  const selectedResult = (selectedSurveyId && results && results.find(r => r.meta.id === selectedSurveyId)) || latestResult;
  const oldSurveySelected = selectedResult !== latestResult;
 
  //Helper for navigating among survey instances
  const navigate = useNavigate();
  const location = useLocation();
  const updateSelection = (id) => {
    const query = id ? `?sId=${id}` : "";
    const uri = `${location.pathname}${query}`;
    navigate(uri, { replace: true });
  }

  //Derive information/text to render for the selected (or latest) result
  let showSelectedResult = false;
  let selectedDescrStr = null;
  if (selectedResult) {
    const meta = selectedResult.meta;
    selectedDescrStr =
      new Date(meta.createTime).toLocaleDateString() + ", ";
    showSelectedResult = !!selectedResult.maturity; //maturity is always present in survey
    let resultDescr = "results not yet available";
    if (showSelectedResult) {
      resultDescr = meta.ongoing ? "not yet completed" : "completed";
    }
    if (meta.compLev === CompLev.CANCELED) {
      selectedDescrStr += "cancelled";
    } else if (!meta.ongoing && meta.compLev === CompLev.TOO_FEW) {
      selectedDescrStr += "never completed (too few responders)";
    } else {
      const n = meta.numResponders;
      selectedDescrStr +=
        `${n} responder` + (n !== 1 ? "s (" : " (") + resultDescr + ")";
    }
  }
  //Interpretation of selected maturity result
  const matchingStages = showSelectedResult ? matchedMaturityStages(selectedResult.maturity) : [];
  const detailsFile = `stage-details-${matchingStages.length ? matchingStages.join('') : 0}`;

  //Hint to the users waiting for analysis results due to ongoing survey
  const CompletionHint = () =>
    manageUrl ?
      <p>
        You can mark the survey as completed by <Link to={manageUrl} state={{prevPage:"Results page"}}>
        editing the survey settings</Link> if no additional responses are expected.
      </p> : 
      <p>
        The initiator of the survey can mark it as completed if no additional responses
        are expected.
      </p>  
  
  //Only include completed results when plotting and browsing the history
  //But for navigation, it makes most sense to always (unconditionally) include the latest entry
  const completedResults = results ? results.filter(r => !r.meta.ongoing) : [];
  const lastCompleted = completedResults.length ? completedResults[completedResults.length - 1] : null;
  const navigableResults = latestResult && lastCompleted && latestResult !== lastCompleted
    ? [ ...completedResults, latestResult]
    : completedResults;
  
  return (
    <div className="SurveyResults">
      <div className="SelectionHeading">
        <h3>{ oldSurveySelected ? "Selected" : "Latest"} survey</h3>
        <ResultsNav
          results={navigableResults}
          currentId={selectedResult ? selectedResult.meta.id : null}
          updateCurrentId={updateSelection}
        />
      </div>
      {analysisError ? (
        <p><em>Could not obtain any results</em></p>
      ) : (
        <>
          {!results ? (
            <p>Loading...</p>
          ) : (
            <>
              {selectedResult ? (
                <>
                  <em>{selectedDescrStr}</em>
                  {selectedResult.meta.ongoing && selectedResult.meta.compLev === CompLev.SOME ?
                    <InfoBlock>
                      <CompletionHint/>
                    </InfoBlock> : null                    
                  }
                  <hr/>
                  <div className="SurveyResults-latest-graphs">
                    <MaturityResult 
                      resultData={selectedResult.maturity}
                      ongoing={selectedResult.meta.ongoing}
                    />
                    <EfficiencyResult 
                      resultData={selectedResult.efficiency}
                    />
                  </div>
                  {results.length > 1 ? (
                    <>
                      <hr/>
                      <h3>Team history</h3>
                      <HistoryChart
                        results={completedResults}
                        selectedId={selectedSurveyId}
                        updateSelection={updateSelection}
                      />
                    </>) : null
                  }
                  <hr/>
                  {(!selectedResult.meta.ongoing && selectedResult.maturity) ?
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SurveyResults;
