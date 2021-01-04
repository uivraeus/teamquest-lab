import { db } from '../services/firebase';
import { deleteSurvey, fetchAllId } from './survey';

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

//Create a new team owned by the specified user
export const createNewTeam = async (user, teamName, oldTeamNames) => {
  try {
    validateNewName(teamName, oldTeamNames);
    await db.ref(`teams`).push({
      uid: user.uid,
      alias: teamName,
      createTime: { ".sv": "timestamp" }, //server-side timestamp generation
    });
  } catch (e) {
    const errMsg = "Could not create new team. " + e.message;
    throw new Error(errMsg);
  }
}

//Rename an existing team
export const renameTeam = async (teamId, teamName, oldTeamNames) => {
  try {
    validateNewName(teamName, oldTeamNames);
    await db.ref(`teams/${teamId}`).update({
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
export const deleteTeam = async (teamId) => {
  try {
    //First "suspend" the team to prevent concurrent creation of new surveys
    await db.ref(`teams/${teamId}`).update({
      suspendTime: {".sv": "timestamp"}
    });

    //Then, delete all surveys of this team
    const surveyIds = await fetchAllId(teamId);
    const delPromises = surveyIds.map(sId => deleteSurvey(sId));
    const delOutcome = await Promise.allSettled(delPromises);
    const numFailed = (delOutcome.filter(o => o.status === "rejected")).length;
    if (numFailed > 0) {
      throw new Error(`${numFailed} survey(s) could not be deleted`);
    }

    //Finally, delete the actual team node
    await db.ref(`teams/${teamId}`).set(null);

  } catch (e) {
    const errMsg = "Error during deletion of team. " + e.message;
    throw new Error(errMsg);
  }
}

//Onetime fetch of IDs (only) of all teams for a specific user
//Result is array if IDs
export const fetchAllTeamId = async (user) => {
  try {
    const ref = db.ref("teams").orderByChild("uid").equalTo(user.uid);
    const snapshot = await ref.once("value");
    let teamIds = [];
    snapshot.forEach(snap => {
      teamIds.push(snap.key);
    });
    return teamIds;
  } catch(e) {
    const errMsg = "Could not fetch team IDs for user.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
}
 