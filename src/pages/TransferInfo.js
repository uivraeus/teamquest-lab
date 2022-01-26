import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import { loadTransferData } from "../helpers/team";
import useAppContext from "../hooks/AppContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode.react";
import { absCreatorPath } from "../RoutePaths";

import { ReactComponent as CopyIcon } from "../icons/copy.svg";

import "./TransferInfo.css";

/* TODO:
 * See notes in SurveyInfo regarding copy of QR code
 */

const TransferInfo = () => {
  const { transferId } = useParams();
  const [transferData, setTransferData] = useState(null);
  const { user, showAlert } = useAppContext();
  const [readError, setReadError] = useState(null);
  const navigate = useNavigate();

  const teamName = transferData && transferData.alias;
  const myHost = `${window.location.protocol}//${window.location.host}`;
  const fullUrl = `${myHost}${absCreatorPath("inherit")}/${transferId}`;

  useEffect(() => {
    //Load the transfer object. (Don't subscribe to any exotic changes, cancellation etc.)
    if (transferId && user) {
      loadTransferData(transferId, true, user)
        .then((obj) => {
          setTransferData(obj);
        })
        .catch((e) => {
          setReadError(e.message);
        });
    }
  }, [transferId, user]);

  useEffect(() => {
    if (readError && showAlert) {
      showAlert("Transfer data load error", readError, "Error");
      navigate(absCreatorPath("manage"), { replace: true }); //just somewhere...
    }
  }, [readError, showAlert, navigate]);

  const onCopy = async (e) => {
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch (e) {
      console.log("Failed to copy to clipboard:", e);
    }
  };

  //Early exits
  if (readError) {
    return <></>;
  }
  if (!transferData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="TransferInfo">
      <h3>Transfer ownership of team <i>{teamName}</i></h3>
      <p>
        Share the following URL with the person who shall inherit the
        ownership.
      </p>
      <div className="TransferInfo-url">
        <div className="TransferInfo-url-content">
          <a href={fullUrl}>{fullUrl}</a>
          <div className="TransferInfo-QR">
            <QRCode value={fullUrl} size={128} />'
          </div>
        </div>

        <div className="TransferInfo-url-helpers">
          <AppBtn onClick={onCopy}>
            {" "}
            <CopyIcon />{" "}
          </AppBtn>
        </div>
      </div>
      <p>
        The new owner must have an account and be logged in prior to
        opening the URL. Then he or she must acknowledge the transfer.
      </p>
      <p>
        After the new owner has acknowledged, a final confirmation must be made by{" "}
        <i>you</i>. Up until that point you may cancel the transfer.
      </p>
      <p>
        Final confirmation and cancellation is managed via the{" "}
        <Link to={absCreatorPath("manage")}>Manage</Link> section
      </p>
    </div>
  );
};

export default TransferInfo;
