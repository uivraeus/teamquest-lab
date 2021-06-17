import React from "react";
import ResultPie from "./ResultPie";

import "./MaturityResult.css";

const descriptions = [
  "This is the forming stage of a team",
  "This is the storming stage of a team",
  "This is the norming stage of a team",
  "This is the performing stage of a team",
];

const categoryClass = "MaturityResult-category"
const matchedCategoryClass = `${categoryClass} matched`
const descrClass = "MaturityResult-description";
const disabledDescrClass = `${descrClass} disabled`;

const MaturityResult = ({ resultData, colors, labels }) => {
  const data = resultData || [0, 0, 0, 0];

  return <div className="MaturityResult">
    {data.map((value, index) => (
      <div key={index} className={value > 75 ? matchedCategoryClass : categoryClass}>
        <ResultPie
          value={value}
          max={100}
          color={colors[index]}
          opacity={value > 75 ? "1.0" : "0.3"}
          textColor={value > 75 ? colors[index] : "var(--color-result-nomatch)"}
        />
        <div className={resultData ? descrClass : disabledDescrClass}>
          <span><p>{labels[index]}</p></span>
          <p>{descriptions[index]}</p>
        </div>
      </div>
    ))}
  </div>;
};

export default MaturityResult;
