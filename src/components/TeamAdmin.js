import React, { useCallback, useState } from "react";
import AppBtn from "../components/AppBtn";
import { checkNewName, renameTeam } from "../helpers/team";
import Teams from "../components/Teams";
import TextInputModal from "../components/TextInputModal";
import useAppContext from "../hooks/AppContext"

import { ReactComponent as RenameIcon } from "../icons/edit.svg";
import { ReactComponent as TransferIcon } from "../icons/transferteam.svg";
import { ReactComponent as DeleteIcon } from "../icons/trash.svg";

import "./TeamAdmin.css";

/* This component builds upon the Teams component, which is used to select
 * (or create) a team. For the selected team, a set of "admin operations"
 * are then provided.
 */

//"user" always valid here (parent's responsibility)
const TeamAdmin = ({ user }) => {
  const {showAlert} = useAppContext();

  //What the user selects via the Teams component
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  //Also, let the Teams component share its view of available teams
  //Note: important to apply useCallback here to not get stuck in a re-render loop
  //(Teams component doesn't do any clever equality check on onAvailableTeams)
  const [availableTeamNames, setAvailableTeamNames] = useState(null);
  const onAvailableTeams = useCallback((teams) => {
    if (teams) {
      setAvailableTeamNames(teams.map((t) => t.alias));
    }
  },[]);

  //Control of modal for renaming selected team
  const [renameTeamId, setRenameTeamId] = useState(null);
  const onRenameResult = async (result) => {
    if (result.id && (result.id === selectedTeamId) && result.value && availableTeamNames) {
      try {
        await renameTeam(user, result.id, result.value, availableTeamNames);
      } catch (e) {
        showAlert("Data backend error", e.message, "Error");
      }
    }
    setRenameTeamId(null);
  };
  const validateNewName = (value) => {
    return availableTeamNames && checkNewName(value, availableTeamNames);
  };

  const operationsClassNames =
    "TeamAdmin-operations" +
    (selectedTeamId ? " TeamAdmin-operations-active" : "");

  return (
    <>
      <Teams
        user={user}
        onSelected={setSelectedTeamId}
        onAvailableTeams={onAvailableTeams}
      />
      <div className={operationsClassNames}>
        <ul>
          <li>
            <div className="TeamAdmin-operation">
              <AppBtn
                onClick={() => {
                  setRenameTeamId(selectedTeamId);
                }}
              >
                <RenameIcon />
              </AppBtn>
              <p>Change the team name</p>
            </div>
          </li>
          <li>
            <div className="TeamAdmin-operation">
              <AppBtn onClick={() => {}}>
                <TransferIcon />
              </AppBtn>
              <p>Transfer the team to someone else</p>
            </div>
          </li>
          <li>
            <div className="TeamAdmin-operation">
              <AppBtn onClick={() => {}}>
                <DeleteIcon />
              </AppBtn>
              <p>Delete the team and its surveys</p>
            </div>
          </li>
        </ul>
      </div>
      <TextInputModal
        id={renameTeamId}
        label="Enter the new team name"
        onResult={onRenameResult}
        validateFn={validateNewName}
      />
    </>
  );
};

export default TeamAdmin;
