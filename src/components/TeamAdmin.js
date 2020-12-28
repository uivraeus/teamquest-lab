import React, { useState } from "react";
import AppBtn from "../components/AppBtn";
import RenameTeamModal from "../components/RenameTeamModal";
import Teams from "../components/Teams";

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
  //What the user selects via the Teams component
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  //Control of modal for renaming selected team
  const [renameTeamId, setRenameTeamId] = useState(null);

  const operationsClassNames =
    "TeamAdmin-operations" +
    (selectedTeamId ? " TeamAdmin-operations-active" : "");

  return (
    <>
      <Teams user={user} onSelected={setSelectedTeamId} />
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
      <RenameTeamModal
        user={user}
        teamId={renameTeamId}
        onClose={() => setRenameTeamId(null)}
      />
    </>
  );
};

export default TeamAdmin;