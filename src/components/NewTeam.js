import React, { useState } from "react";
import AppBtn from "./AppBtn";
import { ReactComponent as CancelIcon } from "../icons/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../icons/confirmation.svg";

import { db } from "../services/firebase";

import "./NewTeam.css";

//"user" always valid here (parent's responsibility)
const NewTeam = ({ user, oldTeamNames, onDone }) => {
  // Add a new team
  const [name, setName] = useState("");
  const [writeError, setWriteError] = useState(null);
  
  const editTeamName = (e) => {
    setName(e.target.value);
  };

  const addNewTeam = async (e) => {
    e.preventDefault();
    try {
      setWriteError(null);
      if (!isNaN(name)) throw new Error("Team name can't be a number"); //also checked in backend
      if (oldTeamNames.includes(name))
        throw new Error("Team name already exists"); //no unique-check in backend :-/

      await db.ref(`teams/${user.uid}/teams`).push({
        alias: name,
        createTime: { ".sv": "timestamp" }, //server-side timestamp generation
      });

      setName("");
      if (onDone) onDone();
    } catch (e) {
      console.log(e);
      setWriteError(e.message);
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

  const confirmDisabled = (name.length === 0) || oldTeamNames.includes(name);
  
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
      {writeError ? (
        <>
          <hr></hr>
          <p>{writeError}</p>
        </>
      ) : null}
    </div>
  );
};

export default NewTeam;
