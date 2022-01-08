import React, { useEffect } from "react";
import AppBtn from "../components/AppBtn";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode.react";
import BackBtnLink from "../components/BackBtnLink";
import { absAppPath } from "../RoutePaths";

import { ReactComponent as CopyIcon } from "../icons/copy.svg";

import './ShareResults.css';

/* See notes in SurveyInfo regarding various improvements
 * (maybe also possible to create some generalized component for this?)
 */

const ShareResults = ({teams}) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  //We are typically directed to this page from the ResultsPage, which is outside
  //the "Creator scope". Instead of waiting for Creator to load the "teams" prop
  //This page supports a null-teams scenario with hand-over of information via
  //the history state as an interim solution (not the "cleanest" design but I want
  //the results-url to be identical for authenticated and other users)
  const ownedTeams = teams || (location.state && location.state.teams) || null;
  const teamObj = (ownedTeams && ownedTeams.find(t => t.id === teamId));
  const teamName = teamObj ? teamObj.alias : null;
  useEffect(() => {
    //minimal error handling
    if (!teamName) {
      navigate(absAppPath("creator"), { replace: true });
    }
  }, [teamName, navigate]);
  if (!teamName) {
    return null;
  }
  
  const myHost = `${window.location.protocol}//${window.location.host}`;
  const fullUrlQ = `${myHost}${absAppPath("results")}/${teamId}`;
    
  const onCopy = async (e) => {
    try {
      await navigator.clipboard.writeText(fullUrlQ);
    } catch (e) {
      console.log("Failed to copy to clipboard:", e);
    }
  }

  return (
    <>
      <div className="ShareResults">
        <h3>Share the results for team "{teamName}"</h3>
        <p>
          Any user can access the results, without authentication.
        </p>
        <p>
          They will however not see the team's name, only an anonymous team identifier.
        </p>
        <br/>
        <p>Share the following URL:</p>
        <div className="ShareResults-url">
          <div className="ShareResults-url-content">
            <a href={fullUrlQ}>{fullUrlQ}</a>
            <div className="ShareResults-QR">
              <QRCode value={fullUrlQ} size={128}/>'
            </div>
          </div>        
        
          <div className="ShareResults-url-helpers">
            <AppBtn onClick={onCopy}> <CopyIcon/> </AppBtn>
          </div>
        </div>
      </div>
      <BackBtnLink />
    </>
  );
  
};

export default ShareResults;
