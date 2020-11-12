import React from "react";
import ResultPie from "./ResultPie";

import "./SurveyResult.css";

const SurveyResult = ({ resultData, colors, labels }) => {
  const data = resultData || [0, 0, 0, 0];
  const descriptions = [
    "How well the members cooperate",
    "The teams ability to resolve conflicts and do a lot of other stuff",
    "How productive the team is",
    "The maturity of the the team",
  ];

  const descrClassName = "SurveyResult-description" + (resultData ? "" : " disabled")
  return <div className="SurveyResult">
    {data.map((value, index) => (
      <div key={index} className="SurveyResult-category">
        <ResultPie
          value={value}
          max={10}
          color={colors[index]}
        />
        <div className={descrClassName}>
          <span><p><em>{labels[index]}</em></p></span>
          <p><em>{descriptions[index]}</em></p>
        </div>
      </div>
    ))}
  </div>;
};

export default SurveyResult;
