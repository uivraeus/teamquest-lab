import React from 'react'
import { ReactComponent as InfoIcon } from "../icons/info.svg";

import './InfoBlock.css';

const InfoBlock = ({ children }) => {
  return (
    <div className="InfoBlock">
      <div className="InfoBlock-icon">
        <InfoIcon />
      </div>
      <div className="InfoBlock-content">
        {children}
      </div>
    </div>
  );
};

export default InfoBlock;