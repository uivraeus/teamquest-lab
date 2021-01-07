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
export const deleteTeam = async (teamId, user) => {
  try {
    //First "suspend" the team to prevent concurrent creation of new surveys
    await db.ref(`teams/${teamId}`).update({
      suspendTime: {".sv": "timestamp"}
    });

    //Also remove any ongoing transfers of this team (should be max 1 but also look for dangling left-overs)
    const txSnapshots = await db.ref("transfers").orderByChild("uid").equalTo(user.uid).once("value");
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

//Remove ongoing transfer (~ abort or "done" depending on how far it proceeded)
export const removeTransfer = async (transferId) => {
  try {
    await db.ref(`transfers/${transferId}`).set(null);
  } catch(e) {
    const errMsg = "Could not remove team transfer";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
}

//Remove any ongoing team transfer(s) initiated by the specified user
export const abortInitiatedTransfers = async (user) => {
  try {
    //First find all (/any) transfers initiated by the specified user
    const snapshot = await db.ref("transfers").orderByChild("uid").equalTo(user.uid).once("value");
    let transferIds = [];
    snapshot.forEach(snap => {
      transferIds.push(snap.key);
    });

    if (transferIds.length > 0) {
      //Now blast them (most likely max one)
      const delPromises = transferIds.map(tId => db.ref(`transfers/${tId}`).set(null));
      const delOutcome = await Promise.allSettled(delPromises);
      const numFailed = (delOutcome.filter(o => o.status === "rejected")).length;
      if (numFailed > 0) {
        throw new Error(`${numFailed} transfers(s) could not be deleted`);
      }
    }        
  } catch(e) {
    const errMsg = "Could not abort/clean team transfer(s).";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
}

//Initiate a new team transfer
//Returns the transferId
export const initTransfer = async (teamId, teamName, user) => {
  try {
    const r = await db.ref(`transfers`).push({
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
    await db.ref(`transfers/${transferId}/receiver`).set({
      uid: user.uid,
      email: user.email
    });
  } catch(e) {
    const errMsg = "Could not grab receiver role for transfer.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
}

//The pending new owner Acknowledges a transfer (typically after seeing the
//team name and current owner)
export const ackTransfer = async (transferId, user) => {
  try {
    await db.ref(`transfers/${transferId}/recConfirmUid`).set(user.uid);
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
    await db.ref(`teams/${teamId}`).update({
      uid: newUid,
      lastTransferTime: {".sv": "timestamp"},
    })
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
    const snapshot = await db.ref("transfers").orderByChild(qChild).equalTo(user.uid).once("value");
    let obj = null;
    snapshot.forEach(snap => {
      if (!obj) {
        //There should be (max) 1 entry but anyway...
        obj = { id: snap.key, ...snap.val() }
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
//This function returns a "reference" that shall be provided to
//cancelAllTransferData to end the subscription (at some point)
export const getAllTransferData = (user, isInitiator, cb) => {
  let dataRef = null; //default return value
  try {
    if (!cb) //A "better" check would also cover type and signature etc.
      throw new Error("No callback function specified");

    const qChild = isInitiator ? "uid" : "receiver/uid";
    const ref = db.ref("transfers").orderByChild(qChild).equalTo(user.uid);
    dataRef = ref.on("value", snapshot => {
      let transfers = [];
      snapshot.forEach(snap => {
        //Append to id to "raw" object content
        transfers.push({ id: snap.key, ...snap.val() });
      });

      //Sort by time? No, just rely on Firebase "default" key order
      //From the docs:
      //"The unique key generated by push() is based on a timestamp,
      // so list items are automatically ordered chronologically."
      cb(transfers);
    })
  } catch (e) {
    const errMsg = "Could not setup subscription for transfer data.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }

  return dataRef;
};

//Cancel subscription for team transfer data (see getAllTransferData above)
export const cancelAllTransferData = (user, isInitiator, dbDataRef) => {
  try {
    const qChild = isInitiator ? "uid" : "receiver/uid";
    const ref = db.ref("transfers").orderByChild(qChild).equalTo(user.uid);
    ref.off("value", dbDataRef);
  } catch(e) {
    const errMsg = "Could not cancel transfer data subscription.";
    console.log(errMsg, e);
    throw new Error(errMsg);
  }
};
