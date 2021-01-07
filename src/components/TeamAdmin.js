import React, { useCallback, useEffect, useState } from "react";
import AppBtn from "./AppBtn";
import {
  checkNewName,
  deleteTeam,
  renameTeam,
  initTransfer /*, removeTransfer, commitTransfer*/,
  removeTransfer,
  commitTransfer,
} from "../helpers/team";
import Teams from "./Teams";
import TextInputModal from "./TextInputModal";
import useAppContext from "../hooks/AppContext";
import useTeamTracker from "../hooks/TeamTracker";
import useTransferTracker from "../hooks/TransferTracker";
import { useHistory } from "react-router-dom";

import { ReactComponent as RenameIcon } from "../icons/edit.svg";
import { ReactComponent as TransferIcon } from "../icons/transferteam.svg";
import { ReactComponent as TransferAbortIcon } from "../icons/cancel.svg";
import { ReactComponent as TransferConfirmIcon } from "../icons/confirmation.svg";
import { ReactComponent as TransferShareIcon } from "../icons/share.svg";
import { ReactComponent as DeleteIcon } from "../icons/trash.svg";

import "./TeamAdmin.css";

/* This component builds upon the Teams component, which is used to select
 * (or create) a team. For the selected team, a set of "admin operations"
 * are then provided.
 */

//"user" always valid here (parent's responsibility)
const TeamAdmin = ({ user }) => {
  const { showAlert, queryConfirm } = useAppContext();
  const history = useHistory();

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

  //Also keep track of any ongoing transfer that the user has initiated
  const transfers = useTransferTracker(user, true);

  //Control of modal for renaming selected team
  const [renameTeamId, setRenameTeamId] = useState(null);
  const onRenameResult = async (result) => {
    if (
      result.id &&
      selectedTeamId === result.id &&
      result.value &&
      availableTeamNames
    ) {
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
      showAlert(
        "Inconsistent state",
        "Something is not right. Aborting delete operation",
        "Error"
      );
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
                deleteTeam(e.target.id, user)
                  .then((result) => {
                    //TODO/TBD? cancel spinner?
                  })
                  .catch((err) => {
                    showAlert("Data backend error", err.message, "Error");
                  });
              }
            },
            "Continue/Abort"
          );
        }
      }
    );
  };

  // Event handlers for managing the steps for a team transfer
  const onInitiateTransfer = (e) => {
    if (selectedTeamId !== e.target.id) {
      return;
    }
    const teamName = selectedTeam.alias;
    queryConfirm(
      "Initiate transfer",
      `This will start a transfer of the ownership of "${teamName}" to another user account`,
      (confirmed) => {
        if (confirmed) {
          initTransfer(e.target.id, teamName, user)
            .then((transferId) => {
              history.push(`/creator/transfer/${transferId}`);
            })
            .catch((err) => {
              showAlert("Data backend error", err.message, "Error");
            });
        }
      },
      "Continue/Abort"
    );
  };

  const onCancelTransfer = (e) => {
    if (selectedTeamId !== e.target.id || !transfers || !selectedTeam) {
      return; // should not happen... but who knows - maybe some race conditions?
    }
    const transferData = transfers.find((t) => t.tid === selectedTeamId);
    if (!transferData) {
      return; // dito
    }
    const teamName = transferData.alias;
    const transferId = transferData.id;
    queryConfirm(
      "Cancel transfer",
      `This will cancel the ongoing transfer of "${teamName}". You will remain the owner of this team.`,
      (confirmed) => {
        if (confirmed) {
          removeTransfer(transferId).catch((err) => {
            showAlert("Data backend error", err.message, "Error");
          });
        }
      },
      "Continue/Abort"
    );
  };

  const onCommitTransfer = (e) => {
    if (selectedTeamId !== e.target.id) {
      return;
    }
    const transferData = transfers.find((t) => t.tid === selectedTeamId);
    if (!transferData) {
      return;
    }
    const teamName = transferData.alias;
    const newOwner = transferData.receiver ? transferData.receiver.email : "<unknown>"
    queryConfirm(
      "Confirm transfer",
      `This is the final step in the transfer of "${teamName}" to ${newOwner}. You will not have any access to the team after this.`,
      (confirmed) => {
        if (confirmed) {
          commitTransfer(transferData).catch((err) => {
            showAlert("Data backend error", err.message, "Error");
          });
        }
      },
      "Continue/Abort"
    );
  };

  const onShareTransfer = (e) => {
    if (selectedTeamId !== e.target.id || !transfers || !selectedTeam) {
      return; // should not happen... but who knows - maybe some race conditions?
    }
    const transferData = transfers.find((t) => t.tid === selectedTeamId);
    if (!transferData) {
      return; // dito
    }
    history.push(`/creator/transfer/${transferData.id}`);
  };

  //Render helpers
  const headingStr =
    selectedTeam && surveys && consistentState
      ? `Created ${new Date(selectedTeam.createTime).toLocaleDateString()}` +
        (!!selectedTeam.suspendTime
          ? " - ⚠:suspended"
          : `, surveys: ${surveys.length}`)
      : "Synchronizing...";

  const operationsClassNames =
    "TeamAdmin-operations" +
    (selectedTeamId && consistentState ? " TeamAdmin-operations-active" : "");

  const selectedTeamTransferData =
    selectedTeamId && transfers
      ? transfers.find((t) => t.tid === selectedTeamId)
      : null;

  const transferInitiated = !!selectedTeamTransferData;

  const transferPendingCommit = selectedTeamTransferData
    ? !!selectedTeamTransferData.recConfirmUid
    : false;

  const transferNewOwner =
    selectedTeamTransferData &&
    selectedTeamTransferData.receiver &&
    selectedTeamTransferData.receiver.email;

  const transferStr = transferInitiated
    ? transferPendingCommit
      ? "Confirm transfer to:"
      : `Waiting for acknowledge from${transferNewOwner ? ":" : " the new owner"}`
    : "";

  // Helper-component for the team operations rendering (icon/label etc)
  const TeamOps = () => {
    const ops = [
      [
        "Share the team transfer URL",
        onShareTransfer,
        TransferShareIcon,
        transferInitiated && !transferPendingCommit,
      ],
      [
        "Cancel ongoing transfer of team",
        onCancelTransfer,
        TransferAbortIcon,
        transferInitiated,
      ],
      [
        "Change the team name",
        () => setRenameTeamId(selectedTeamId),
        RenameIcon,
        !transferInitiated,
      ],
      [
        "Transfer the team to someone else",
        onInitiateTransfer,
        TransferIcon,
        !transferInitiated,
      ],
      [
        "Confirm transfer of team",
        onCommitTransfer,
        TransferConfirmIcon,
        transferPendingCommit,
      ],
      ["Delete the team and its surveys", onDeleteTeam, DeleteIcon, true],
    ];

    return (
      <ul>
        {ops.map((o, i) => {
          if (!o[3]) return null;
          const Icon = o[2];
          return (
            <li key={i}>
              <div className="TeamAdmin-operation">
                <AppBtn
                  onClick={o[1]}
                  id={selectedTeamId}
                  disabled={!consistentState}
                >
                  <Icon />
                </AppBtn>
                <p>{o[0]}</p>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  //Component render (finally)
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
        {transferInitiated
          ? <p className="TeamAdmin-transfer-status">
              <b>Transfer initiated</b>
              <br/>
              {transferStr}
              <i> {transferNewOwner ? transferNewOwner : null}</i>
            </p>
          : null
        }        
        <TeamOps />
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
