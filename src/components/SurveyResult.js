import React from "react";
import ResultPie from "./ResultPie";

import "./SurveyResult.css";

const SurveyResult = ({ resultData, colors, labels }) => {
  const data = resultData || [0, 0, 0, 0];
  const descriptions = [
    "This is the forming stage of a team",
    "This is the storming stage of a team",
    "This is the norming stage of a team",
    "This is the performing stage of a team",
  ];

  const descrClassName = "SurveyResult-description" + (resultData ? "" : " disabled")
  return <div className="SurveyResult">
    {data.map((value, index) => (
      <div key={index} className="SurveyResult-category">
        <ResultPie
          value={value}
          max={100}
          color={colors[index]}
        />
        <div className={descrClassName}>
          <span><p>{labels[index]}</p></span>
          <p>{descriptions[index]}</p>
        </div>
      </div>
    ))}
  </div>;
};

export default SurveyResult;
