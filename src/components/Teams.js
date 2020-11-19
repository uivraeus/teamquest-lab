import React, { useEffect, useState } from "react";
import AppBtn from "./AppBtn";
import NewTeam from "./NewTeam";
import RadioLabel from "./RadioLabel";
import useOwnedTeams from "../hooks/OwnedTeams";

import { ReactComponent as NewTeamIcon } from "../icons/newteam.svg";

import "./Teams.css";

//"user" always valid here (parent's responsibility)
const Teams = ({ user, enableEdit=true, onSelected, extSelection = null }) => {
  //Defined teams (as read from database)
  const { teams, readError } = useOwnedTeams();

  //We're using a "controlled input" for the team selection
  const [selected, setSelected] = useState(null);
  const onChecked = (e) => {
    //console.log("onChecked", selected, "->", e.target.value);
    if (!extSelection) setSelected(e.target.value);
    onSelected(e.target.value); //notify parent (who may update extSelection)
  };
  useEffect(() =>{
    setSelected(extSelection);
  }, [extSelection]);

  //Helper for "faking" a checked event (to keep related logic in one place)
  const simulateChecked = (value) => {
    onChecked({ target: { name: "team", value } });
  };

  //Control for showing component for defining a new team
  const [newTeamVisible, setNewTeamVisible] = useState(false);
  //TODO? Add some logic for waiting on confirmation from the database? (or is that actually
  //covered by the async/await in NewTeam?)
  //TODO? Change this messy logic so that we are able to auto-select a newly created user (when > 1)

  //Some "last-minute" adjustments of the state w.r.t. "teams"
  //(didn't find a good fit for this in the hooks... but there probably is one)
  if (teams) {
    let selId = -1;
    if (teams.length === 0 && !newTeamVisible && enableEdit) setNewTeamVisible(true);
    //no reason to hide it if a new team must (and can) be created
    else if (teams.length === 1 && !newTeamVisible) selId = teams[0].id;
    //only one team, make it selected by default
    else if (selected && !teams.map((t) => t.id).includes(selected))
      selId = null; //previously selected team must have been removed

    if (selId !== -1 && selected !== selId && !extSelection) {
      setTimeout(() => simulateChecked(selId), 0); //fake change event (to keep related logic in only one place)
    }
  }

  const onNewClicked = () => {
    if (!newTeamVisible) {
      //Clear any previous selection (just confusing to maintain any)
      simulateChecked(null);
    }
    setNewTeamVisible(!newTeamVisible); //toggle
  };

  //Early-exit for when no teams are defined (and edit is not allowed)
  //TODO: replace with something fancier
  if (teams && teams.length === 0 && !enableEdit) {
    return (<p><em>No teams defined for the current user</em></p>)
  }

  //Some render-helpers
  const instruction = teams
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
      {!teams ? (
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
              {teams.map((team) => {
                return (
                  <RadioLabel
                    key={team.id}
                    name="team"
                    value={team.id}
                    text={team.alias}
                    checked={selected === team.id}
                    onChange={onChecked}
                    disabled={newTeamVisible}
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
                oldTeamNames={teams.map((t) => t.alias)}
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
