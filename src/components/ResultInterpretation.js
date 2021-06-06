import React from "react";
import MarkdownBlock from "./MarkdownBlock";

import "./ResultInterpretation.css";

const summaryInto = "Your team's result";
const zeroStageSummary  = `${summaryInto} doesn't match any stage`; 
const oneStageSummary   = `${summaryInto} matches stage`;
const twoStageSummary   = `${summaryInto} matches both stage`;
const threeStageSummary = `${summaryInto} matches three different stages;`;
const fourStageSummary  = `${summaryInto} matches all four stages`;

const defaultData = [0, 0, 0, 0];
const ResultInterpretation = ({ resultData }) => {
  const data = resultData || defaultData;

  //A "match" is defined by a result value > 75
  const matches = data.reduce((acc, v, i) => (v > 75) ? acc.concat(i + 1) : acc, []);

  //Derive the applicable summary string;
  let summary = zeroStageSummary;
  if (matches.length === 1) {
    summary = `${oneStageSummary} ${matches[0]}`;
  } else if (matches.length === 2) {
    summary = `${twoStageSummary} ${matches[0]} and ${matches[1]}`;
  } else if (matches.length === 3) {
    summary = `${threeStageSummary} ${matches[0]}, ${matches[1]} and ${matches[2]}`;
  } else if (matches.length === 4) {
    summary = fourStageSummary;
  }

  const detailsFile = `stage-details-${matches.length ? matches.join('') : 0}`; 
  return (
    <div className="ResultInterpretation">
      <p>{summary}.</p>
      <MarkdownBlock mdFileName={detailsFile} />
    </div>
  );
};

export default ResultInterpretation;
