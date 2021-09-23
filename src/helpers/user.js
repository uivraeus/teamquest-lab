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
    //Also add the user to the list of deleted/disabled users to ensure that
    //still-valid access tokens on other devices can't be used to perform
    //"authenticated operations"
    await db.set(`x_users/${user.uid}`, {".sv": "timestamp"});
    await deleteAccount(password);

  } catch (e) {
    const errMsg = "Error during deletion of account. " + e.message;
    throw new Error(errMsg);
  }
}
