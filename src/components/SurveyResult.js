import React from "react";
import ResultPie from "./ResultPie";

import "./SurveyResult.css";

const descriptions = [
  "This is the forming stage of a team",
  "This is the storming stage of a team",
  "This is the norming stage of a team",
  "This is the performing stage of a team",
];

const descrClass = "SurveyResult-description";
const disabledDescrClass = "SurveyResult-description disabled";

const SurveyResult = ({ resultData, colors, labels }) => {
  const data = resultData || [0, 0, 0, 0];

  return <div className="SurveyResult">
    {data.map((value, index) => (
      <div key={index} className="SurveyResult-category">
        <ResultPie
          value={value}
          max={100}
          color={value > 75 ? colors[index] : "var(--color-result-nomatch)"}
          textColor={value > 75 ? "var(--color-text)" : "var(--color-result-nomatch)"}
        />
        <div className={resultData && value > 75 ? descrClass : disabledDescrClass}>
          <span><p>{labels[index]}</p></span>
          <p>{descriptions[index]}</p>
        </div>
      </div>
    ))}
  </div>;
};

export default SurveyResult;
