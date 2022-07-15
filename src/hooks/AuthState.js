import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import { auth } from '../services/firebase'
import { checkValidatedAccess, onTerminating, validateAccess } from '../helpers/user';


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
    console.log("@AuthState/subscribe")
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log(`@AuthState/onAuthStateChanged; ${user ? user.email + ", verified: " + user.emailVerified : "<no user>"}, skipVerification: ${skipVerification}`)
      setAuthStateSync(prev => ({
        initialAuthChecked: true, //one-time toggling false->true
        user,
        verifiedAccount: !!user && (user.emailVerified || skipVerification),
        validatedAccess: !!user ? prev.validatedAccess : null
      }));
    });
    return () => {
      console.log("@AuthState/unsubscribe")
      unsubscribe();
    }
  }, [skipVerification]);

  //In addition to "auth" status, access to private data also relies on an explicit
  //validation entry (/field) for the user account. For a verified account it shall
  //be possible to validate the access. For an unverified account, any attempt to
  //validate the access shall result in rejection (due to backend security policies).
  //The exception (may) be "legacy" accounts, which are not verified but where an
  //db-admin has (manually) updated the validation status.
  useEffect( () => {
    if (authState.user) {
      // Always start by checking the current status. Actually only needed for legacy users but
      // it doesn't hurt and it keeps the code simpler
      console.log("@AuthState/verifyAccount; call checkValidatedAccess()")
      checkValidatedAccess(authState.user)
      .then(validated => {
        console.log("@AuthState/verifyAccount; checkValidatedAccess returned", validated)  
        if (validated || authState.verifiedAccount) {
          validateAccess(authState.user)
          .then(() => {
              console.log(`@AuthState/verifiedAccount; validateAccess() completed w/o errors`)
              setAuthStateSync(prev => ({ ...prev, validatedAccess: true }))
            })
          .catch(e => {
            alertFn("Data backend error", "Couldn't validate access to private data", "Error", e.message || e);
          });
        } else {
          setAuthStateSync(prev => ({ ...prev, validatedAccess: false }))
        }
      })
      .catch(e => {
        alertFn("Data backend error", "Couldn't obtain the user's validation status", "Error", e.message || e);
      });
    }    
  }, [authState.verifiedAccount, authState.user, alertFn])

  // Subscribe to account termination indication (just before the account is deleted)
  useEffect( () => {
    let unsubscribeFn = null;
    if (authState.user && authState.validatedAccess) {
      console.log("@AuthState/user; subscribe to termination indication")
      unsubscribeFn = onTerminating(authState.user, e => {
        console.log(`@AuthState/onTerminating; ${authState.user.email}`)
        if (e) {
          alertFn("Data backend error", "Couldn't retrieve termination indication", "Error", e.message || e);
          console.warn(`Data backend error - Couldn't retrieve termination indication. Error: ${e.message || e}`)
        }
        setAuthStateSync(prev => ({ ...prev, validatedAccess: false }));
      });
    }        
    return () => {
      if (unsubscribeFn) {
        console.log("@AuthState/user; unsubscribe from termination indication")
        unsubscribeFn();
      }
    };      
  }, [authState.user, authState.validatedAccess, alertFn])

  return authState
}

export default useAuthState;

