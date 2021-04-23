import { useEffect, useState } from 'react';
import useAppContext from './AppContext'
import { db } from "../services/firebase";


/* This hook allows other components to obtain a list of the teams currently owned
 * by the current user
 *
 * The main output from this hook is the "teams" array but to allow for error
 * reporting, a "readError" is also provided (null when no error). So, these
 * entries are bundled into an object.
 * 
 * Implementation note:
 * I don't want to return a new/unique object instance for every call if the
 * contained information hasn't changed. This may help users of this hook when
 * creating dependency-lists for other hooks. It could be done with useMemo,
 * useReducer and probably many other techniques. I chose to return a "state"
 * which holds the entire result object.
 */

const defaultResult = { teams: null, readError:null };
const useOwnedTeams = () => {
  const { user } = useAppContext();
  const [result, setResult] = useState(defaultResult);
  
  useEffect(() => {
    let ref = null;
    let onNewData = null; 
    if (user) {
      //Subscribe to teams data for the user;
      ref = db.ref("teams").orderByChild("uid").equalTo(user.uid)
      try {
        onNewData = ref.on("value", (snapshot) => {
          try {
            let dbTeams = [];
            snapshot.forEach((snap) => {
              dbTeams.push({ id: snap.key, ...snap.val() });
            });
            //console.log("new 'teams' received, last:", !dbTeams.length ? "<none>" : dbTeams[dbTeams.length - 1].alias);
            //TODO: sort teams by "alias"?
            setResult({ ...defaultResult, teams: dbTeams });
          } catch (e) {
            console.log(e);
            setResult({ ...defaultResult, readError: e.message });
          }
        });
      } catch (e) {
        console.log(e);
        setResult({ ...defaultResult, readError: e.message });
      }
    }

    return () => {
      if (ref) {
        if (onNewData)
          ref.off("value", onNewData);
      }
    };
  }, [user]);
  
  return result;
}

export default useOwnedTeams;
