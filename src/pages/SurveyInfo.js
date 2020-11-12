import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import { load } from "../helpers/survey";
import { Link, useParams } from "react-router-dom";
import { ReactComponent as CopyIcon } from "../icons/copy.svg";
import QRCode from "qrcode.react";

import './SurveyInfo.css';

/* TODO:
 * The plan was to let the "copy button" also cover the QR code. But how to actually
 * copy a canvas, in a widely-browser-supported way, is still unclear to me.
 * Also, I'm thinking about a "expand" (full-screen:ish) button for filling the
 * screen with the QR-code. But I need to first understand more about custom styling
 * (scaling) of the canvas.
 */

const SurveyInfo = () => {
  const { surveyId } = useParams();
  const [surveyObject, setSurveyObject] = useState(null);
  const [readError, setReadError] = useState(null);

  useEffect(() => {
    //Load the survey object. (Don't subscribe to any exotic changes, cancellation etc.)
    load(surveyId)
      .then((survey) => {
        setSurveyObject(survey);
      })
      .catch((e) => {
        const errMsg = "Could not find specified survey in the database";
        console.log(errMsg, e);
        setReadError(errMsg);
      });
  }, [surveyId]);

  const myHost = `${window.location.protocol}//${window.location.host}`;
  const fullUrlQ = `${myHost}/run/${surveyId}`;
  const pathR =
    `/results` + (surveyObject ? `/${surveyObject.meta.teamId}` : ``);

  const onCopy = async (e) => {
    try {
      await navigator.clipboard.writeText(fullUrlQ);
    } catch (e) {
      console.log("Failed to copy to clipboard:", e);
    }
  }

  if (readError) {
    return <p>{readError}</p>
  } else {
    return (
      <div className="SurveyInfo">
        <p>Please find the questionnaire at the following URL:</p>
        <div className="SurveyInfo-url">
          <div className="SurveyInfo-url-content">
            <a href={fullUrlQ}>{fullUrlQ}</a>
            <div className="SurveyInfo-QR">
              <QRCode value={fullUrlQ} size={128}/>'
            </div>
          </div>        
        
          <div className="SurveyInfo-url-helpers">
            <AppBtn onClick={onCopy}> <CopyIcon/> </AppBtn>
          </div>
        </div>
        <p>
          The <Link to={pathR}>analysis result page</Link> will be updated when
          enough responses have been collected
        </p>
      </div>
    );
  }
};

export default SurveyInfo;
