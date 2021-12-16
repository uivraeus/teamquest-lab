import React from "react";
import AppBtn from "./AppBtn";
import { ReactComponent as LeftIcon } from "../icons/left-arrow.svg";

import './ResultsNav.css';

//Input is a list of "result objects" with shape {meta, ...})
const ResultsNav = ({ results, currentId = null, updateCurrentId = (id) => {} }) => {
  const index = (results && currentId) ? results.findIndex(r => r.meta.id === currentId) : -1;
  const prevId = index > 0 ? results[index - 1].meta.id : null;
  const nextId = (index !== -1 && index < results.length - 1) ? results[index + 1].meta.id : null
  
  return (
    <div className="ResultsNav">
      <AppBtn id="prev" onClick={() => updateCurrentId(prevId)} disabled={prevId === null}>
        <LeftIcon />
      </AppBtn>
      <AppBtn id="next" onClick={() => updateCurrentId(nextId)} disabled={nextId === null}>
        <LeftIcon />
      </AppBtn>
    </div>  
  );
};

export default ResultsNav;
