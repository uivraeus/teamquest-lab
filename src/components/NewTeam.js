import React, { useState } from "react";
import AppBtn from "./AppBtn";
import useAppContext from "../hooks/AppContext"

import { checkNewName, createNewTeam } from "../helpers/team";
import { ReactComponent as CancelIcon } from "../icons/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../icons/confirmation.svg";

import "./NewTeam.css";

//"user" always valid here (parent's responsibility)
const NewTeam = ({ user, oldTeamNames, onDone }) => {
  // Add a new team
  const [name, setName] = useState("");
  const {showAlert} = useAppContext();

  const editTeamName = (e) => {
    setName(e.target.value);
  };

  const addNewTeam = async (e) => {
    e.preventDefault();
    try {
      await createNewTeam(user, name, oldTeamNames);
      setName("");
      if (onDone) onDone();
    } catch (e) {
      showAlert("Data backend error", e.message, "Error");
    }
  };

  const onCancel = (e) => {
    e.preventDefault();
    onDone();
  }

  //Close the edit form on ESC.
  //TODO: Add "history-" solution for "back-button" (especially on Android)
  const onKeyDown = (e) => {
    if (e.keyCode === 27) { //ESC
      onCancel(e);
    }
  }

  const confirmDisabled = !checkNewName(name, oldTeamNames);
  
  return (
    <div className="NewTeam">
      <form onSubmit={addNewTeam} onKeyDown={onKeyDown}>
        <div className="NewTeam-input-control">
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
    </div>
  );
};

export default NewTeam;
