import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock"
import { ackTransfer, grabTransfer } from "../helpers/team";
import useAppContext from "../hooks/AppContext";
import useTransferTracker from "../hooks/TransferTracker";
import useOwnedTeams from "../hooks/OwnedTeams";
import { Link, useParams, useHistory } from "react-router-dom";

import "./Inherit.css";

const Inherit = () => {
  const { transferId } = useParams();
  const { user, showAlert } = useAppContext();
  const transfers = useTransferTracker(user, false); //receiver-role
  const [transferData, setTransferData] = useState(null); //for the applicable transfer
  const [grab, setGrab] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [dbError, setDbError] = useState(null);
  const history = useHistory();

  //Keep track of owned teams to detect successful transfer
  const { teams } = useOwnedTeams();
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
          //Transfer object removed. Probably because it was confirmed by
          //the (previous) owner.
          //TODO: set outcome to false if prev is null (don't overwrite true)
          //setOutcome(prev => prev === null ? false : prev);
          //But... is there a potential race?
          //- Even though experiments indicate that the teams-update always happens first 
          //  (and it is executed in that order at the other end)
          //- Better be safe and do this via a delayed update via a cancellable timeout
        }        
      }
    }
  }, [transfers, transferId, user, acknowledged, dbError]);

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
      history.push("/creator/manage"); //just somewhere.
    }
  }, [dbError, showAlert, history]);

  //Detect completed transfer (nice feedback - nothing important for the transfer)
  //(This only works if the user has kept this page open - not if revisiting it
  //at a later point in time)
  useEffect(() => {
    if (transferData && teams && teams.find(t => t.id === transferData.tid)) {
      setOutcome(true);
    }
  }, [transferData, teams])
  useEffect(() => {
    if (outcome !== null) {
      if (outcome) {
        showAlert("Transfer completed", "You are now the new owner of the team", "Info");
        history.push("/creator/manage");
      } else {
        showAlert("Transfer cancelled", "The original owner never completed the transfer", "Info");
        history.push("/"); //just somewhere.
      }
    }
  }, [outcome, showAlert, history])

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
              All your teams are listed in the <Link to={"/creator/manage"}>Manage</Link> section.
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
