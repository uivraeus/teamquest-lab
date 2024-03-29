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
    await db.push(`teams`, {
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
    await db.update(`teams/${teamId}`, {
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
export const deleteTeam = async (teamId, user) => {
  try {
    //First "suspend" the team to prevent concurrent creation of new surveys
    await db.update(`teams/${teamId}`, {
      suspendTime: {".sv": "timestamp"}
    });

    //Also remove any ongoing transfers of this team (should be max 1 but also look for dangling left-overs)
    const txSnapshots = await db.once(db.query("transfers", db.orderByChild("uid"), db.equalTo(user.uid)));
    let removePromises=[];
    txSnapshots.forEach(snap => {
      if (snap.val().tid === teamId) {
        removePromises.push(removeTransfer(snap.key));        
      }
    });
    const removeOutcome = await Promise.allSettled(removePromises);
    if ((removeOutcome.filter(o => o.status === "rejected")).length > 0) {
      throw new Error(`Pending team transfer could not be aborted`);
    }

    //Then, delete all surveys of this team
    const surveyIds = await fetchAllId(teamId);
    const delPromises = surveyIds.map(sId => deleteSurvey(sId));
    const delOutcome = await Promise.allSettled(delPromises);
    const numFailed = (delOutcome.filter(o => o.status === "rejected")).length;
    if (numFailed > 0) {
      throw new Error(`${numFailed} survey(s) could not be deleted`);
    }

    //Finally, delete the actual team node
    await db.set(`teams/${teamId}`, null);

  } catch (e) {
    const errMsg = "Error during deletion of team. " + e.message;
    throw new Error(errMsg);
  }
}

//Onetime fetch of IDs (only) of all teams for a specific user
//Result is array if IDs
export const fetchAllTeamId = async (user) => {
  try {
    const query = db.query("teams", db.orderByChild("uid") , db.equalTo(user.uid));
    const snapshot = await db.once(query);
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

//Remove ongoing transfer (~ abort or "done" depending on how far it proceeded)
export const removeTransfer = async (transferId) => {
  try {
    await db.set(`transfers/${transferId}`, null);
  } catch(e) {
    const errMsg = "Could not remove team transfer";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
}

//Initiate a new team transfer
//Returns the transferId
export const initTransfer = async (teamId, teamName, user) => {
  try {
    const r = await db.push(`transfers`, {
      uid: user.uid,
      email: user.email,
      alias: teamName,
      tid: teamId,
      initTime: {".sv":"timestamp"}
    })

    return r.key;
  } catch(e) {
    const errMsg = "Could not initiate transfer of team.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
}

//The receiving side of a team transfer must grab exclusive (receiver) access
//(after this, no other user can do that)
export const grabTransfer = async (transferId, user) => {
  try {
    await db.set(`transfers/${transferId}/receiver`, {
      uid: user.uid,
      email: user.email
    });
  } catch(e) {
    const errMsg = "Could not grab receiver role for transfer.";
    //Skip error logging here as this API may be "optimistically" used
    //console.log(errMsg, e);
    throw new Error(errMsg);
  }
}

//The pending new owner Acknowledges a transfer (typically after seeing the
//team name and current owner)
export const ackTransfer = async (transferId, user) => {
  try {
    await db.set(`transfers/${transferId}/recConfirmUid`, user.uid);
  } catch(e) {
    const errMsg = "Could not acknowledge transfer.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
} 

//Do the actual transfer, i.e. replace the owner.
//(includes deletion of transfer-node)
//Note that after this has been done the current user (owner) no longer
//has any control of the team
//(This function could be "extended" to also support fetching of the transfer
//node but for now, it only supports an externally provided node, i.e. from a
//separate earlier fetch)
export const commitTransfer = async (transferObject) => {
  //First perform the actual ownership switch
  try {
    const newUid = transferObject.recConfirmUid;
    const teamId = transferObject.tid;
    await db.update(`teams/${teamId}`, {
      uid: newUid,
      lastTransferTime: {".sv": "timestamp"},
    });
  } catch (e) {
    const errMsg = "Could not change owner of the team.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }

  //Finally, remove the transfer node
  try {
    await removeTransfer(transferObject.id);
  } catch(e) {
    const errMsg = "Could not clean up after completed team transfer.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
}

//One-time load of transfer data for specified transfer ID
//Parameter "isInitiator": true => transfer _from_ the user
//                         false = transfer _to_ the user
export const loadTransferData = async (transferId, isInitiator, user) => {
  //Due to the access rules we have to "query" the data instead of just reading it
  //from "/transfers/<transferId>"
  try {
    const qChild = isInitiator ? "uid" : "receiver/uid";
    const snapshot = await db.once(db.query("transfers", db.orderByChild(qChild), db.equalTo(user.uid)));
    let obj = null;
    snapshot.forEach(snap => {
      const fields = snap.val();
      if (!obj && fields.email && fields.uid) {
        //Check for valid entry (~ owner uid/email)
        //(There should be (max) 1 entry but check "obj" anyway)
        obj = { id: snap.key, ...fields }
      }
    });
    if (!obj) {
      throw new Error("Could not find data for transfer specified ID");
    }
    
    return obj;

  } catch(e) {
    const errMsg = "Could not load transfer data.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
}

//Load (and subscribe for) all transfers a specific user is involved in
//Parameter "isInitiator": true => transfer _from_ the user
//                         false = transfer _to_ the user
//Data will be provided to callback function as array with oldest first
//This function returns a "unsubscribe function" that shall be provided to
//cancelAllTransferData to end the subscription (at some point)
export const getAllTransferData = (user, isInitiator, cb) => {
  let unsubscribeFn = null; //default return value
  try {
    if (!cb) //A "better" check would also cover type and signature etc.
      throw new Error("No callback function specified");

    const qChild = isInitiator ? "uid" : "receiver/uid";
    const query = db.query("transfers", db.orderByChild(qChild), db.equalTo(user.uid));
    unsubscribeFn = db.onValue(query, snapshot => {
      let transfers = [];
      //!: Debug experiments show that a futile* attempt to write a receiver
      //   sub-node (see Grab-function) will result in a short-lived entry
      //   ending up here (with only the receiver-field, not the rest)
      //   Don't know if this a "bug" or "by design" but don't propagate
      //   that crap upwards.
      //   -> add check on outer uid/email fields
      //   (*) "futile" due to non-existing transfer id (e.g. old/canceled)
      //       or just because of security permission rejection.
      snapshot.forEach(snap => {
        const fields = snap.val();
        if (fields.uid && fields.email) {
          //Append to id to "raw" object content
          transfers.push({ id: snap.key, ...fields });
        }
      });
      cb(transfers); //never null - always [] of length 0 or more
    })
  } catch (e) {
    const errMsg = "Could not setup subscription for transfer data.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }

  return unsubscribeFn;
};

//Cancel subscription for team transfer data (see getAllTransferData above)
export const cancelAllTransferData = (unsubscribeFn) => {
  try {
    unsubscribeFn();
  } catch(e) {
    const errMsg = "Could not cancel transfer data subscription.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
};
