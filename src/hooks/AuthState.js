import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import { auth } from '../services/firebase'
import { onValidatedAccess, validateAccess } from '../helpers/user';


const defaultState = { 
  initialAuthChecked: false, // one-time toggle -> true during application start-up
  user: null,                // null when not logged in
  verifiedAccount: false,    // true if logged in and user's email address has been verified
  validatedAccess: null,     // true if user allowed to use the app, null until status fetched for user (then true/false)
};

const useAuthState = (alertFn = () => {}, skipVerification = false ) => {
  const [authState, _setAuthState] = useState(defaultState);
  
  //It is essential that any updates of the login- or verification/validation status is
  //updated without any batching (React 18+). Otherwise there is a risk of triggering
  //backend security rule violations due to races for some database operations.
  //This is why a setAuthStateSync is defined to be used for those kind of updates.
  //(wrap in setTimeout to enable usage inside useEffects)
  const setAuthStateSync = arg => setTimeout(()=> flushSync(() => _setAuthState(arg)), 0);

  //Setup detection of authentication changes
  useEffect ( () => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthStateSync(prev => ({
        initialAuthChecked: true, //one-time toggling false->true
        user,
        verifiedAccount: !!user && (user.emailVerified || skipVerification),
        validatedAccess: !!user ? prev.validatedAccess : null
      }));
    });
    return () => {
      unsubscribe();
    }
  }, [skipVerification]);

  //In addition to "auth" status, access to private data also relies on an explicit
  //validation entry (/field) for the user account. For a verified account it shall
  //be possible to validate the access. For an unverified account, any attempt to
  //validate the access shall result in rejection (due to backend security policies).
  //There is a known "issue" here:
  //If, for some reason, `validateAccess` fails, there will be a successful (true)
  //indication via the `onValidatedAccess`-callback (probably because of local
  //caching in the Firebase SDK). Then, a short moment later the truth is reviled
  //and the callback will trigger again with "false". So the `validatedAccess`
  //property in the context will "lie" for a while. This means that there will be
  //a subsequent access issue when fetching of "private" data is attempted.
  //(Not so nice but not a big issue either... validateAccess shall not fail unless
  //the logic for invoking it or the security rules are broken)
  //Possible solutions:
  //- only set `validatedAccess=true` in a `.then` of `validateAccess`, OR
  //- keep track of local action and ignore the first callback-response
  //- (TODO: Think of multiple devices...)
  useEffect( () => {
    if (authState.verifiedAccount) {
      validateAccess(authState.user)
      .catch(e => {
        alertFn("Data backend error", "Couldn't validate access to private data", "Error", e.message || e);
      });
    }
  }, [authState.verifiedAccount, authState.user, alertFn])

  useEffect( () => {
    let unsubscribeFn = null;
    if (authState.user) {
      unsubscribeFn = onValidatedAccess(authState.user, (validated, e) => {
        if (e) {
          //In some (rare?) cases thee is a race when logging out or terminating the account causing
          //an "access error" before the unsubscribe function has had a chance to run. So, "hide"
          //this error (and hope that it doesn't appear during other circumstances). 
          //TODO: replace this work-around with a proper (robust) solution
          //alertFn("Data backend error", "Couldn't retrieve access validation status", "Error", e.message || e);
          console.warn(`Data backend error - Couldn't retrieve access validation status. Error: ${e.message || e}`)
        }
        setAuthStateSync(prev => ({ ...prev, validatedAccess: validated }))
      });
    }        
    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };      
  }, [authState.user])

  return authState
}

export default useAuthState;

