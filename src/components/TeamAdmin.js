import React, { useCallback, useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import { checkNewName, deleteTeam, renameTeam } from "../helpers/team";
import Teams from "../components/Teams";
import TextInputModal from "../components/TextInputModal";
import useAppContext from "../hooks/AppContext";
import useTeamTracker from "../hooks/TeamTracker";

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
  const { showAlert, queryConfirm } = useAppContext();

  //What the user selects via the Teams component
  const [selectedTeam, setSelectedTeam] = useState(null);
  const selectedTeamId = selectedTeam ? selectedTeam.id : null;
  
  //Also, let the Teams component share its view of available teams
  //Note: important to apply useCallback here to not get stuck in a re-render loop
  //(Teams component doesn't do any clever equality check on onAvailableTeams)
  const [availableTeamNames, setAvailableTeamNames] = useState(null);
  const onAvailableTeams = useCallback((teams) => {
    if (teams) {
      setAvailableTeamNames(teams.map((t) => t.alias));
    } else {
      setAvailableTeamNames(null);
    }
  }, []);

  //Control of modal for renaming selected team
  const [renameTeamId, setRenameTeamId] = useState(null);
  const onRenameResult = async (result) => {
    if (result.id && (selectedTeamId === result.id) && result.value && availableTeamNames) {
      try {
        await renameTeam(result.id, result.value, availableTeamNames);
      } catch (e) {
        showAlert("Data backend error", e.message, "Error");
      }
    }
    setRenameTeamId(null);
  };
  const validateNewName = (value) => {
    return availableTeamNames && checkNewName(value, availableTeamNames);
  };

  //Keep track of all associated surveys, both for displaying "summary"
  //and for enumerating through when deleting all surveys
  const { surveys, readError, surveysTeamId } = useTeamTracker(selectedTeamId);
  useEffect(() => {
    if (readError) {
      console.log(readError);
    }
  }, [readError]);

  //There is a short delay between switching team id and "surveys" being
  //being updated. Normally not a big thing but in context of permanent
  //deletion I think it is worth being certain we have a consistent state
  const consistentState = surveysTeamId === selectedTeamId;

  //The GUI-part of the team-deletion procedure
  const onDeleteTeam = (e) => {
    if (selectedTeamId !== e.target.id) {
      showAlert("Inconsistent state", "Something is not right. Aborting delete operation", "Error");
      return;
    }
    const teamName = selectedTeam.alias;
    queryConfirm(
      "Delete team and surveys",
      `Are you sure you want to permanently delete the team "${teamName}" and all associated surveys?`,
      (confirmed) => {
        if (confirmed) {
          queryConfirm(
            "Really want to do this?",
            "This operation is final and cannot be undone!",
            (confirmed) => {
              if (confirmed) {
                deleteTeam(e.target.id)
                .then(result => {
                  //TODO/TBD? cancel spinner?
                })
                .catch(err => {
                  showAlert("Data backend error", err.message, "Error");
                })
              }
            },
            "Continue/Abort"            
          )
        }
      }
    );
  };

  const initiateTransfer = (e) => {
    if (selectedTeamId !== e.target.id) {
      showAlert("Inconsistent state", "Something is not right. Aborting transfer operation", "Error");
      return;
    }
    showAlert("TODO: Transfer team", "This feature is not implemented yet");
  }

  //Render helpers
  const headingStr = (selectedTeam && surveys && consistentState)
    ? ((`Created ${new Date(selectedTeam.createTime).toLocaleDateString()}`) +
        (!!selectedTeam.suspendTime ? " - ⚠:suspended" : `, surveys: ${surveys.length}`))
    : "Synchronizing...";
  const operationsClassNames =
    "TeamAdmin-operations" +
    ((selectedTeamId && consistentState) ? " TeamAdmin-operations-active" : "");

  return (
    <>
      <Teams
        user={user}
        onSelected={(i, o) => setSelectedTeam(o)}
        onAvailableTeams={onAvailableTeams}
        blockSuspended={false}
      />
      <div className={operationsClassNames}>
        <h4>{headingStr}</h4>
        <ul>
          <li>
            <div className="TeamAdmin-operation">
              <AppBtn
                onClick={() => {
                  setRenameTeamId(selectedTeamId);
                }}
                id={selectedTeamId}
                disabled={!consistentState}
              >
                <RenameIcon />
              </AppBtn>
              <p>Change the team name</p>
            </div>
          </li>
          <li>
            <div className="TeamAdmin-operation">
              <AppBtn 
                onClick={initiateTransfer}
                id={selectedTeamId}
                disabled={!consistentState}
              >
                <TransferIcon />
              </AppBtn>
              <p>Transfer the team to someone else</p>
            </div>
          </li>
          <li>
            <div className="TeamAdmin-operation">
              <AppBtn
                onClick={onDeleteTeam}
                id={selectedTeamId}
                disabled={!consistentState}
              >
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
