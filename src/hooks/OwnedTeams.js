import { useEffect, useState } from 'react';
import useAppContext from './AppContext'
import { db } from "../services/firebase";


/* This hook allows other components to obtain a list of the teams currently owned
 * by the current user
 */

//returns { teams, readError }
const useOwnedTeams = () => {
  const { user } = useAppContext();
  const [teams, setTeams] = useState(null);
  const [readError, setReadError] = useState(null);
  
  useEffect(() => {
    let ref = null;
    let onNewData = null; 
    if (user) {
      //Subscribe to teams data for the user;
      ref = db.ref("teams").orderByChild("uid").equalTo(user.uid)
      setReadError(null);
      try {
        onNewData = ref.on("value", (snapshot) => {
          try {
            let dbTeams = [];
            snapshot.forEach((snap) => {
              dbTeams.push({ id: snap.key, ...snap.val() });
            });
            //console.log("new 'teams' received, last:", !dbTeams.length ? "<none>" : dbTeams[dbTeams.length - 1].alias);
            //TODO: sort teams by "alias"?
            setTeams(dbTeams);
          } catch (e) {
            console.log(e);
            setReadError(e.message);
          }
        });
      } catch (e) {
        console.log(e);
        setReadError(e.message);
      }
    }

    // Return what to do when "un-mounting"
    return () => {
      if (ref) {
        //console.log("ref.off: ", onNewData ? "callback" : "all callbacks");
        if (onNewData)
          ref.off("value", onNewData);
      }
    };
  }, [user]);
  
  return { teams, readError };
}

export default useOwnedTeams;
