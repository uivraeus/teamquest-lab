import { useEffect, useState } from 'react';
import useOwnedTeams from "./OwnedTeams";

/* This hook allows other components to translate a team id into a team object
 * if validation of ownership is successful.
 * The main output from this hook is "status" which indicates if the user owns
 * the team and, if that is the case, also the "teamObj".
 * To allow for error reporting, an "errorMsg" is also provided (null when no
 * error). All output is bundled into one object.
 * 
 * Implementation note:
 * I don't want to return a new/unique object instance for every call if the
 * contained information hasn't changed. This may help users of this hook when
 * creating dependency-lists for other hooks. It could be done with useMemo,
 * useReducer and probably many other techniques. I chose to return a "state"
 * which holds the entire result object.
 */

//Validation status "enum"
export const ValidationStatus = {
    PENDING: 'Ownership validation pending',
    OWNER : 'Ownership confirmed',
    NOT_OWNER : 'Ownership not held',
    FAILED: 'Could not derive owned teams'
  };
  

const defaultResult = { teamObj:null, status:ValidationStatus.PENDING, errorMsg:null };
const useValidatedTeam = (teamId) => {
  const ownedTeams = useOwnedTeams();
  const [result, setResult] = useState(defaultResult);

  useEffect(() => {
    const {teams, readError} = ownedTeams;
    if (teams && teamId) {
      const match = teams.filter((t) => (t.id === teamId));
      if (match.length === 1) {
        setResult({ ...defaultResult, teamObj:match[0], status:ValidationStatus.OWNER });
      } else {
        // nothing found, the user does not own this team
        // (treat length > 1 as an "silent" error, corrupt useOwnedTeams or backend data?)
        setResult({ ...defaultResult, status: ValidationStatus.NOT_OWNER });
      }
    }

    if (readError) {
        setResult({ ...defaultResult, status: ValidationStatus.FAILED, errorMsg: readError });
    }
  }, [teamId, ownedTeams]);
  
  return result;
}

export default useValidatedTeam;
