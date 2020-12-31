import { db } from '../services/firebase';
import { deleteAccount } from './auth';
import { deleteTeam, fetchAllTeamId } from './team';

//Misc functions for accessing and modifying user meta-data
//(very tuned to how we use Firebase)

//Delete everything related to a user, including the account itself
//This operation cannot be undone!
export const deleteAccountAndData = async (user, password) => {
  try {
    //First "suspend" the user to prevent concurrent creation of new teams etc
    await db.ref(`teams/${user.uid}`).update({
      suspend: { ".sv": "timestamp" }
    });

    //Then, delete all surveys of this team
    const teamIds = await fetchAllTeamId(user);
    const delPromises = teamIds.map(tId => deleteTeam(user, tId));
    const delOutcome = await Promise.allSettled(delPromises);
    const numFailed = (delOutcome.filter(o => o.status === "rejected")).length;
    if (numFailed > 0) {
      throw new Error(`${numFailed} team(s) could not be deleted`);
    }

    //Finally, delete the account
    await deleteAccount(password);

  } catch (e) {
    const errMsg = "Error during deletion of account. " + e.message;
    throw new Error(errMsg);
  }
}
