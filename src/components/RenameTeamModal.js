import React, { useEffect, useState } from "react";
import AppBtn from "./AppBtn";
import { checkNewName, renameTeam } from "../helpers/team";
import { Modal } from "react-responsive-modal";
import useAppContext from "../hooks/AppContext"
import useOwnedTeams from "../hooks/OwnedTeams"

import { ReactComponent as CancelIcon } from "../icons/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../icons/confirmation.svg";

//use default class names and styling, with a few overrides
import "react-responsive-modal/styles.css";
import "./RenameTeamModal.css";

//"user" always valid here (parent's responsibility)
//teamId === null -> modal inactive
const RenameTeamModal = ({ user, teamId, onClose }) => {
  // Controlled input
  const [name, setName] = useState("");
  const {showAlert} = useAppContext();

  //Ensure input reset if teamId changes
  useEffect(() => {
    setName("");
  }, [teamId]);
    
  //For validation we need to track the names of existing teams
  const { teams, readError } = useOwnedTeams();
  const [ oldTeamNames, setOldTeamNames ] = useState(null)
  useEffect(() => {
    if (teams && !readError) {
      setOldTeamNames(teams.map((t) => t.alias));
    } else {
      setOldTeamNames(null);
      if (readError) {
        showAlert("Data backend error", readError, "Error");
      }
    }
  }, [teams, readError, showAlert]);
  
  //The controlled input
  const editTeamName = (e) => {
    setName(e.target.value);
  };

  //Execute the renaming (~ "user commit")
  const onRenameTeam = async (e) => {
    e.preventDefault();
    try {
      await renameTeam(user, teamId, name, oldTeamNames);
      onClose();
    } catch (e) {
      showAlert("Data backend error", e.message, "Error");
    }
  };

  const onCancel = (e) => {
    e.preventDefault();
    setName("");
    onClose();
  }

  const confirmDisabled = !(teamId && oldTeamNames && checkNewName(name, oldTeamNames));
  
  return (
    <Modal
      open={!!teamId}
      onClose={onClose}
      closeOnOverlayClick={false}
      center
      classNames={{ modal: "RenameTeamModal" }}
      onAnimationEnd={()=>setName("")}
      showCloseIcon={false}
    >
      <h4>Enter the new name</h4>
      <form onSubmit={onRenameTeam}>
        <div className="RenameTeamModal-input-control">
          <input
            className="app-input"
            autoFocus
            onChange={editTeamName}
            value={name}
          ></input>
          <AppBtn type="submit" disabled={confirmDisabled}>
            <ConfirmIcon />
          </AppBtn>
          <AppBtn onClick={onCancel}>
            <CancelIcon />
          </AppBtn>
        </div>
      </form>
    </Modal>
  );
};

export default RenameTeamModal;
