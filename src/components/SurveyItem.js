import React from 'react';
import AppBtn from "./AppBtn";
import { CompLev } from '../helpers/survey';

import { ReactComponent as ShareIcon } from "../icons/share.svg";
import { ReactComponent as EditIcon } from "../icons/edit.svg";
import { ReactComponent as TrashIcon } from "../icons/trash.svg";

import "./SurveyItem.css";

const SurveyItem = ({ surveyMeta, onShare, onEdit, onDelete }) => {

  //Derive proper color for indicator
  const cL = surveyMeta.compLev; //shorter
  const statusNameSuffix = surveyMeta.ongoing ? (
    (cL === CompLev.TOO_FEW ? "ongoing-too-few" : "ongoing-some")
  ) : (
    (cL === CompLev.ALL ? "complete" : 
      (cL === CompLev.SOME ? "complete-some" : "terminated")
    )
  );
  const statusName = `SurveyItem-indicator SurveyItem-${statusNameSuffix}`;

  //Text versions of meta
  const dateStr = new Date(surveyMeta.createTime).toLocaleDateString();

  return (
    <div className="SurveyItem">
      <div className="SurveyItem-info">
        <div className={statusName}>+</div>
        <div className="SurveyItem-info-details">
          <h4>{dateStr}</h4>
          <p>{`${cL} (${surveyMeta.numResponders})`}</p>
        </div>
      </div>
      <div className="SurveyItem-edit">
        { onShare ? 
          <AppBtn onClick={() => onShare(surveyMeta)}>
            <ShareIcon />
          </AppBtn> : null }
        { onEdit ? 
          <AppBtn onClick={() => onEdit(surveyMeta)}>
            <EditIcon />
          </AppBtn> : null }
        { onDelete ?
          <AppBtn onClick={() => onDelete(surveyMeta)}>
            <TrashIcon />
          </AppBtn> : null }
      </div>

    </div>
  );
};

export default SurveyItem;