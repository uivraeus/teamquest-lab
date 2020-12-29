import { db } from '../services/firebase';

//Misc functions for accessing and modifying team meta-data
//(very tuned to how we use Firebase)

//Check and Validate helpers for a proposed team name
//(no unique-check in backend :-/ )
//1. The check variant (aka bool variant)
export const checkNewName = (newName, oldNames) => {
  if (newName.length === 0) {
    return false;
  }
  if (!isNaN(newName)) {
    return false;
  }
  if (oldNames.includes(newName)) {
    return false;
  }
  return true
}
//2. The validate variant (aka throw variant)
export const validateNewName = (newName, oldNames) => {
  if (newName.length === 0) {
    throw new Error("Team name can't an empty string");
  }
  if (!isNaN(newName)) {
    throw new Error("Team name can't be a number");
  }
  if (oldNames.includes(newName)) {
    throw new Error("Team name already exists");
  }
}

//Create a new team under the specified user
export const createNewTeam = async (user, teamName, oldTeamNames) => {
  try {
    validateNewName(teamName, oldTeamNames);
    await db.ref(`teams/${user.uid}/teams`).push({
      alias: teamName,
      createTime: { ".sv": "timestamp" }, //server-side timestamp generation
    });
  } catch (e) {
    const errMsg = "Could not create new team. " + e.message;
    throw new Error(errMsg);
  }
}

//Rename an existing team owned by the specified user
export const renameTeam = async (user, teamId, teamName, oldTeamNames) => {
  try {
    validateNewName(teamName, oldTeamNames);
    await db.ref(`teams/${user.uid}/teams/${teamId}`).update({
      alias: teamName,
      lastRenameTime: { ".sv": "timestamp" }, //server-side timestamp generation
    });
  } catch (e) {
    const errMsg = "Could not rename team. " + e.message;
    throw new Error(errMsg);
  }
}

//Delete a team (permanently). All associated surveys will also be deleted
//This operation cannot be undone!
export const deleteTeam = async (user, teamId) => {
  try {
    console.log("TODO: Deleting team", teamId, "...");
    return new Promise((resolve,reject) => setTimeout(() => {
      console.log("simulated delete done");
      try {
        resolve(true);
      } catch(e) {
        const errMsg = "Error during deletion of team. " + e.message;
        reject(new Error(errMsg));
      }
    }, 1000));
  } catch (e) {
    const errMsg = "Could not initiate deletion of team. " + e.message;
    throw new Error(errMsg);
  }
}