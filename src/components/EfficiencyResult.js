import React from "react";
import ResultPie from "./ResultPie";

import "./EfficiencyResult.css";


const label = "Perceived Efficiency";
const description = "How the team views its own productivity";
const color = "var(--color-result-e)";

const categoryClass = "EfficiencyResult-category";
const activeCategoryClass = `${categoryClass} active`;
const descrClass = "EfficiencyResult-description";
const disabledDescrClass = `${descrClass} disabled`;

const EfficiencyResult = ({ resultData }) => {
  const data = resultData || 0;

  return <div className="EfficiencyResult">
    <h4>Productivity</h4>
    <div className="EfficiencyResult-graph-container">
      <div className={resultData ? activeCategoryClass : categoryClass}>
        <ResultPie
          value={data}
          max={100}
          color={color}
          textColor={data > 0 ? color : "var(--color-result-nomatch)"}
        />
        <div className={resultData ? descrClass : disabledDescrClass}>
          <span><p>{label}</p></span>
          <p>{description}</p>
        </div>
      </div>      
    </div>
  </div>
};

export default EfficiencyResult;
