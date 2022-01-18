import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock"
import { ackTransfer, grabTransfer } from "../helpers/team";
import useAppContext from "../hooks/AppContext";
import useTransferTracker from "../hooks/TransferTracker";
import { Link, useParams, useNavigate } from "react-router-dom";
import { absCreatorPath } from "../RoutePaths";

import "./Inherit.css";

const Inherit = ({ teams }) => {
  const { transferId } = useParams();
  const { user, showAlert } = useAppContext();
  const transfers = useTransferTracker(user, false); //receiver-role
  const [transferData, setTransferData] = useState(null); //for the applicable transfer
  const [grab, setGrab] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [dbError, setDbError] = useState(null);
  const navigate = useNavigate();
  
  //Keep track of owned teams to detect successful transfer
  const [outcome, setOutcome] = useState(null);

  const teamName = transferData && transferData.alias;
  const currentOwner = transferData && transferData.email;
  
  useEffect(() => {
    //If the specified transferId appears in the list of transfers, we have
    //already "grabbed" it. Otherwise, that is the first step to take.
    if (!dbError && transfers !== null && user) {
      //See if we have grabbed the transfer
      const obj = transfers.find((t) => t.id === transferId);
      if (obj) {
        if (obj.recConfirmUid === user.uid) {
          //Acknowledged; Ensure state matches in case we enter this page after an earlier ack
          setAcknowledged(true);
        }
        setTransferData(obj);
      } else {
        //"transfers" holds valid data but not the entry we're looking for -> grab it
        //(unless we know it's already acknowledged)
        if (!acknowledged) {
          setGrab(prevState => prevState || {user, transferId}); //one-time flip
        } else {
          //Cancelled or completed? The useEffect on "teams" below should detect
          //an successful transfer before we end up here but delay the "bad news" a few
          //seconds if there is some kind of race between teams/transfers updates.
          //(The logic in teams.js makes the update in the right order but I'm not sure
          //one can always rely on that here... even though experiments indicate it)
          const timeout = setTimeout(() => {
            //only update if the "success-path" hasn't triggered
            setOutcome(prev => prev === null ? false : prev);
          }, 5000);

          return () => {
            clearTimeout(timeout);
          }
        }        
      }
    }
  }, [transfers, transferId, user, acknowledged, dbError]);

  //One-time effect when "grab" is raised
  useEffect(() => {
    if (grab) {
      grabTransfer(grab.transferId, grab.user)
      .catch(e => {
        //This "error" can happen if the user enters an old URL (completed or cancelled transfer)
        setDbError(e.message);
      });
    }
  }, [grab])

  //Trying to access a non-existing transfer when opening up the page
  //(can't tell if this is a completed/cancelled transfer or just an invalid id)
  useEffect(() => {
    if (dbError && showAlert) {
      showAlert("Invalid transfer ID", 
        "Can't access transfer information. Maybe the transfer has already been completed or cancelled?",
        "Info", dbError);
      navigate(absCreatorPath("manage"), { replace: true }); //just somewhere.
    }
  }, [dbError, showAlert, navigate]);

  //Detect completed transfer (nice feedback - nothing really important)
  //(This only works if the user has kept this page open - not if revisiting it
  //at a later point in time after completion)
  useEffect(() => {
    if (transferData && teams && teams.find(t => t.id === transferData.tid)) {
      setOutcome(true);
    }
  }, [transferData, teams])
  
  //Some kind of outcome has been identified in one of the useEffects above
  //-> inform the user and redirect away from this page.
  useEffect(() => {
    if (outcome !== null) {
      if (outcome) {
        showAlert("Transfer completed", "You are now the new owner of the team", "Info");
      } else {
        showAlert("Transfer cancelled", "The original owner never completed the transfer", "Info");
      }
      navigate(absCreatorPath("manage"), { replace: true });
    }
  }, [outcome, showAlert, navigate])

  const onAcknowledge = async () => {
    try {
      await ackTransfer(transferId, user);
      setAcknowledged(true);
    }
    catch(e) {
      setDbError(e.message);
    }
  }

  //Early exits
  if (dbError) {
    return <></>;
  }
  if (!transferData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="Inherit">
      <h3>Inherit team</h3>
      <p>
        User <i>{currentOwner}</i> has initiated an ownership transfer for team <i>{teamName}</i>.  
      </p>
      {!acknowledged 
        ? <>
            <p>
              The first step of this process is for you to acknowledge that you want to inherit the ownership
            </p> 
            <AppBtn text="Acknowledge" onClick={onAcknowledge}/>
          </>
        : <>
            <p>
              You have acknowledged that you want to inherit the ownership.
            </p>
            <p>
              Once the current owner has confirmed the transfer, <i>{teamName}</i> will appear among your other teams.
              You can then manage it and create surveys like for any other team you own.
            </p>
            <p>
              All your teams are listed in the <Link to={absCreatorPath("manage")}>Manage</Link> section.
            </p>
            <InfoBlock>
              <p>
                You don't have to keep this page open or remain logged in. The transfer can proceed anyway.
              </p>
            </InfoBlock>
          </>
      }      
    </div>
  );
};

export default Inherit;
