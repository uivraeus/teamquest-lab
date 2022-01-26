import React, { useCallback, useEffect, useRef, useState } from "react";
import AppBtn from "./AppBtn";
import {
  checkNewName,
  createNewTeam,
  deleteTeam,
  renameTeam,
  initTransfer,
  removeTransfer,
  commitTransfer,
} from "../helpers/team";
import RouteSelect from "./RouteSelect";
import TextInputModal from "./TextInputModal";
import useAppContext from "../hooks/AppContext";
import useTeamTracker from "../hooks/TeamTracker";
import useTransferTracker from "../hooks/TransferTracker";
import { useNavigate } from "react-router-dom";
import { absCreatorPath } from "../RoutePaths";

import { ReactComponent as RenameIcon } from "../icons/edit.svg";
import { ReactComponent as TransferIcon } from "../icons/transferteam.svg";
import { ReactComponent as TransferAbortIcon } from "../icons/cancel.svg";
import { ReactComponent as TransferConfirmIcon } from "../icons/confirmation.svg";
import { ReactComponent as TransferShareIcon } from "../icons/share.svg";
import { ReactComponent as DeleteIcon } from "../icons/trash.svg";

import "./TeamAdmin.css";

/* This component bundles the team selection (via RouteSelect) with a set
 * of "team admin operations", incl. creation, renaming, transfer and deletion.
 */

//"user" and "teams" always valid here, but teams may be [] (parent's responsibility)
const TeamAdmin = ({ user, teams }) => {
  const { showAlert, queryConfirm } = useAppContext();
  const navigate = useNavigate();

  //What the user selects via the RouteSelect component
  const [selectedTeam, setSelectedTeam] = useState(null);

  //Additional tricks, to support auto-selection of newly created teams
  const refNewTeamName = useRef(null);
  const onTeamSelected = useCallback(t => {
    refNewTeamName.current = null; //remove auto-selection hint
    setSelectedTeam(t)
  },[refNewTeamName]);
  
  //Also keep track of any ongoing transfer that the user has initiated
  const transfers = useTransferTracker(user, true);

  //Convenient shorthands
  const selectedTeamId = selectedTeam ? selectedTeam.id : null;
  const teamNames = teams.map(t => t.alias);
  
  //Control of modal for creating a new team
  const [defineNewTeam, setDefineNewTeam] = useState(false);
  const onCreateResult = async (result) => {
    if (result.value) {
      try {
        refNewTeamName.current = result.value; //auto-selection hint
        await createNewTeam(user, result.value, teamNames);
        setDefineNewTeam(false);
      } catch (e) {
        setDefineNewTeam(false);
        showAlert("Data backend error", e.message, "Error");
      }
    } else {
      setDefineNewTeam(false);
    }
  };
  const validateNewName = (value) => {
    return checkNewName(value, teamNames);
  };
  
  //Control of modal for renaming selected team
  const [renameTeamId, setRenameTeamId] = useState(null);
  const onRenameResult = async (result) => {
    if (
      result.id &&
      selectedTeamId === result.id &&
      result.value
    ) {
      try {
        await renameTeam(result.id, result.value, teamNames);
        setRenameTeamId(null);
      } catch (e) {
        setRenameTeamId(null);
        showAlert("Data backend error", e.message, "Error");
      }
    } else {
      setRenameTeamId(null);
    }
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
  //Also, during deletions the "de-selection" may lag "teams" update.
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
              navigate(`${absCreatorPath("transfer")}/${transferId}`);
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
      "Cancel transfer?",
      `This will cancel the ongoing transfer of "${teamName}" and you will remain the owner of this team.`,
      (confirmed) => {
        if (confirmed) {
          removeTransfer(transferId).catch((err) => {
            showAlert("Data backend error", err.message, "Error");
          });
        }
      }
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
    navigate(`${absCreatorPath("transfer")}/${transferData.id}`);
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
      ? "Pending transfer to:"
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
      { teams.length === 0 ?
          <p className="TeamAdmin-accent">
            <em>There is no team associated with your account. Click "New" to create one.</em>
          </p> : 
          <label htmlFor="team-select">Selected team:</label>
      }
      <div className="TeamAdmin-select-create">
        <RouteSelect
          options={teams}
          textKey="alias"
          elementId="team-select"
          autoSelectText={refNewTeamName.current}
          onSelected={onTeamSelected}
        />
        <AppBtn 
          id="create-new-team" 
          text="New"
          kind={teams.length === 0 ? "accent" : null}
          onClick={()=>setDefineNewTeam(true)}
          disabled={defineNewTeam}/>
      </div>
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
        id={defineNewTeam ? 1 : null}
        label="Enter a name for the team"
        onResult={onCreateResult}
        validateFn={validateNewName}
      />
      <TextInputModal
        id={renameTeamId}
        label="Enter a new team name"
        onResult={onRenameResult}
        validateFn={validateNewName}
      />
    </>
  );
};

export default TeamAdmin;
