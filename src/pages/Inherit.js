import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import { ackTransfer, grabTransfer } from "../helpers/team";
import useAppContext from "../hooks/AppContext";
import useTransferTracker from "../hooks/TransferTracker";
import { useParams, useHistory } from "react-router-dom";

import "./Inherit.css";

const Inherit = () => {
  const { transferId } = useParams();
  const { user, showAlert } = useAppContext();
  const transfers = useTransferTracker(user, false); //receiver-role
  const [transferData, setTransferData] = useState(null); //for the applicable transfer
  const [acknowledged, setAcknowledged] = useState(false);
  const [dbError, setDbError] = useState(null);
  const history = useHistory();

  const teamName = transferData && transferData.alias;
  const currentOwner = transferData && transferData.email;
  
  useEffect(() => {
    //If the specified transferId appears in the list of transfers, we have
    //already "grabbed" it. Otherwise, that is the first step to take.
    if (transfers !== null && user) {
      const obj = transfers.find((t) => t.id === transferId);
      if (obj) {
        if (obj.recConfirmUid === user.uid) {
          //in case we enter this page after an earlier ack
          setAcknowledged(true);
        }
        setTransferData(obj);
      } else {
        if (!acknowledged) {
          grabTransfer(transferId, user)
          .catch(e => {
            setDbError(e.message);
          });
        } else {
          //Transfer object removed. Probably because it was confirmed by
          //the (previous) owner.
          //TBD/TODO: track owned teams and look for the new team there
          //->print some kind of confirmation?
        }        
      }
    }
  }, [transfers, transferId, user, acknowledged]);

  useEffect(() => {
    if (dbError && showAlert) {
      showAlert("Transfer data load error", dbError, "Error");
      history.push("/"); //just somewhere...
    }
  }, [dbError, showAlert, history]);

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
              You don't have to keep this page open or remain logged in. The transfer can proceed anyway.
            </p>
          </>
      }      
    </div>
  );
};

export default Inherit;
