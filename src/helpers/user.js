import { auth, db } from '../services/firebase';
import { deleteAccount } from './auth';
import { deleteTeam, fetchAllTeamId } from './team';

//Misc functions for accessing and modifying user meta-data
//(very tuned to how we use Firebase)

//Delete everything related to a user, including the account itself
//This operation cannot be undone!
export const deleteAccountAndData = async (user, password) => {
  try {
    //Before doing any "damage" - confirm correct password.
    //This is "hackable" but still convenient to prevent valid usage but
    //with the wrong password, which will fail at the actual account
    //deletion.
    await auth.reauthenticateCurrentUser(password);
    //-> will throw error from backend if not correct

    //First "suspend" the user to prevent concurrent creation of new teams etc
    //from other devices where the user might be logged in
    //TODO: await ...
    //(or maybe trigger logout on those via some user-meta-variable?)

    //Then, delete all surveys of this team
    const teamIds = await fetchAllTeamId(user);
    const delPromises = teamIds.map(tId => deleteTeam(tId, user));
    const delOutcome = await Promise.allSettled(delPromises);
    const numFailed = (delOutcome.filter(o => o.status === "rejected")).length;
    if (numFailed > 0) {
      throw new Error(`${numFailed} team(s) could not be deleted`);
    }

    //Finally, delete the account
    //Move the user from the list of validated users to the list of deleted users
    //This is done to ensure that still-valid access tokens on other devices can't
    //be used to perform "authenticated operations"
    //Note that the order must be (according to security rules):
    //1. add to x_users
    //2. remove from v_users
    //Also, note that clearing v_users is always OK, also when the users wasn't listed
    //there in the first place (never validated)
    await db.set(`x_users/${user.uid}`, {".sv": "timestamp"});
    await db.set(`v_users/${user.uid}`, null);
    console.log("@@@ call deleteAccount()")
    await deleteAccount(password);
    console.log("@@@ deleteAccount() completed")
  } catch (e) {
    const errMsg = "Error during deletion of account. " + e.message;
    throw new Error(errMsg);
  }
}

// Throws if the password doesn't apply for the currently logged in user
export const confirmPassword = async (password) => {
  //This is "hackable" but still convenient to prevent valid usage but
  //with the wrong password
  await auth.reauthenticateCurrentUser(password);   
}

// Update user's entry in the validated-users list (keep track of latest access)
export const validateAccess = async (user) => {
  // No check w.r.t. security rules here. Will throw if misused.
  await db.set(`v_users/${user.uid}`, {".sv": "timestamp"});
}

// Subscribe to changes in the user's entry in the validated-users list
// Expects a callback-function with signature (bool, error|undefined) => {},
// ie. true if validated
// Returns an unsubscribe-function
export const onValidatedAccess = (user, callback) => {
  const unsubscribeFn = db.onValue(db.query(`v_users/${user.uid}`), snapshot => {
    callback(!!snapshot.val());
  }, error => {
    callback(false, error);
  });
  return unsubscribeFn;
}
