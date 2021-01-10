import React, { useCallback, useEffect, useState } from "react";
import AppBtn from "./AppBtn";
import NewTeam from "./NewTeam";
import RadioLabel from "./RadioLabel";
import useOwnedTeams from "../hooks/OwnedTeams";

import { ReactComponent as NewTeamIcon } from "../icons/newteam.svg";

import "./Teams.css";

//"user" always valid here (parent's responsibility)
const Teams = ({ user, enableEdit=true, onSelected, onAvailableTeams = null, extSelection = null, blockSuspended = true }) => {
  //Defined teams (as read from database)
  const { teams, readError } = useOwnedTeams();
  useEffect(() => {
    if (teams && onAvailableTeams) {
      onAvailableTeams(teams);
    }
  }, [teams, onAvailableTeams])

  //We're using a "controlled input" for the team selection
  //The parent can control what is actually "selected" via the extSelection prop. 
  //Otherwise this component will automatically modify it's selection state when
  //the user clicks any of the radio inputs
  const [selected, setSelected] = useState(null);
  useEffect(() =>{
    setSelected(extSelection);
  }, [extSelection]);
  
  //Handle user input
  const onChecked = useCallback((e) => {
    if (!extSelection) {
      setSelected(e.target.value);
    }
    //Notify parent (who may update extSelection)
    onSelected(e.target.value);
  }, [onSelected, extSelection]);
  
  //Helper for "faking" a checked event (to keep related logic in one place)
  const simulateChecked = useCallback((value) => {
    onChecked({ target: { name: "team", value } });
  }, [onChecked]);

  //Control for showing component for defining a new team
  const [newTeamVisible, setNewTeamVisible] = useState(false);
  
  const onNewClicked = () => {
    if (!newTeamVisible) {
      //Clear any previous selection (just confusing to maintain any)
      simulateChecked(null);
    }
    setNewTeamVisible(!newTeamVisible); //toggle
  };

  //Keep track of additions/deletions among the owned teams to improve the UX
  // - null: init-value to detect "first actual value" (don't trigger "additions")
  // - otherwise, all: [{id, alias, isSuspended}]
  //              added/deleted: [id]
  const [myTeams, setMyTeams] = useState(null); 
  useEffect(() => {
    if (teams === null) {
      return;
    }
    setMyTeams((prev) => {
      //Only keep track of id, alias and suspended-status
      const newAll = teams.map(t => ({id: t.id, alias: t.alias, isSuspended: !!t.suspendTime}));
        
      //First update, skip added/deleted logic
      if (prev === null) {
        return {all: newAll, added:[], deleted:[]};
      }

      //When new teams are created Firebase seems to make a "dual write" of the createTime
      //(probably due to some detail of .sv/timestamp-implementation)
      //Anyway, avoid reacting on such "timestamp-only" adjustment by checking if all id
      //alias and isSuspended fields are identical.
      const ignore = 
        prev.all.length === newAll.length &&
        prev.all.reduce((acc, p) => 
          acc && !!newAll.find(n => (
            n.id === p.id && 
            n.alias === p.alias && 
            n.isSuspended === p.isSuspended)
          ), true);

      if (!ignore) {
        const deleted = prev.all.map(p => p.id).filter(p => !(newAll.find(n => n.id === p)));
        const added = newAll.map(n => n.id).filter(n => !(prev.all.find(p => p.id === n)));
        return {all: newAll, added, deleted};
      } else {
        return prev;
      }
    });
  },[teams])

  //Control when to auto-show the new-team editor w.r.t. current team status
  useEffect(() => {
    if (myTeams === null) {
      return;
    }
    if (myTeams.all.length === 0) {
      //No teams yet -> user probably wants to define one (can still hide it via cancel)
      setNewTeamVisible(true);
    } else if (myTeams.added.length > 0) {
      //Probably a desired behavior... (I think)
      setNewTeamVisible(false);
    }
  }, [myTeams])

  //Control auto-selection w.r.t. current team status
  useEffect(() => {
    if (myTeams === null) {
      return;
    }
    if (selected && myTeams.deleted.find(d => d === selected)) {
      //Selected team deleted, clear selection
      simulateChecked(null);
    } else if (selected === null && myTeams.all.length === 1) {
      //No selection but only one team -> select it
      //Note: In case two teams, where one is deleted, we will eventually end up here
      //and select the remaining one. (No need to add more logic to cover moved 
      //selection in one pass)
      simulateChecked(myTeams.all[0].id);
    }
  }, [myTeams, simulateChecked, selected])

  //Early-exit for when no teams are defined (and edit is not allowed)
  if (myTeams && myTeams.all.length === 0 && !enableEdit) {
    return (<p><em>No teams defined for the current user</em></p>)
  }
 
  //Some render-helpers
  const instruction = myTeams
    ? (selected)
      ? "Selected team"
      : newTeamVisible
        ? "Name a new team"
        : enableEdit
          ? "Select a team or create a new one"
          : "Select a team"
    : "";

  //TODO: clean up this mess! E.g. make a few more helper functions or variables.
  return (
    <>
      {!myTeams ? (
        <p>Loading teams...</p>
      ) : (
        <div className="Teams">
          {readError ? (
            <>
              <hr></hr>
              <p>{readError}</p>
            </>
          ) : null}
          <fieldset>
            <legend>{instruction}</legend>
            <ul>
              {myTeams.all.map((team) => {
                return (
                  <RadioLabel
                    key={team.id}
                    name="team"
                    value={team.id}
                    text={team.alias + (team.isSuspended ? " ⚠":"")}
                    checked={selected === team.id}
                    onChange={onChecked}
                    disabled={newTeamVisible || (blockSuspended && team.isSuspended)}
                  />
                );
              })}
            </ul>
            {!newTeamVisible ?
              enableEdit ? (              
              <AppBtn onClick={onNewClicked}>
                <NewTeamIcon />
              </AppBtn>
              ) : null
              : (
              <NewTeam
                user={user}
                oldTeamNames={myTeams.all.map((t) => t.alias)}
                onDone={() => setNewTeamVisible(false)}
              />
            )}
          </fieldset>
        </div>
      )}
    </>
  );
};

export default Teams;
