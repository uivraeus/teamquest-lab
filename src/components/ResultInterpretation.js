import React from "react";

const summaryInto = "Your team's result";
const zeroStageSummary  = `${summaryInto} doesn't match any stage`; 
const oneStageSummary   = `${summaryInto} matches stage`;
const twoStageSummary   = `${summaryInto} matches both stage`;
const threeStageSummary = `${summaryInto} matches three different stages;`;
const fourStageSummary  = `${summaryInto} matches all four stages`;

const ResultInterpretation = ({ matches }) => {
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

  return (
    <h4>{summary}</h4>
  );
};

export default ResultInterpretation;
