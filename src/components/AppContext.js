import React, { createContext, useEffect, useState } from 'react';
import AlertModal from './AlertModal';
import { errorTracking } from '../services/sentry';
import QueryModal from './QueryModal';
import { onValidatedAccess, validateAccess } from '../helpers/user';
import useOwnedTeams from '../hooks/OwnedTeams';

//Auth backend
import { auth } from '../services/firebase'
import { logout } from '../helpers/auth';

/**
 * The application context provides a set of "global" attributes and
 * general functions that are used throughout the application.
 * E.g. APIs for "alert" and "query" modals 
 */

//Default values just defined as some kind of API definition
const AppContext = createContext({
  initialAuthChecked: false,
  user: null,
  verifiedAccount: false,
  validatedAccess: null, // null until status fetched from backend (then true/false)
  teams: null, //teams owned by the user (if logged in), null until known ([] if none)
  queryConfirm: (heading, text, resultCb, type) => {},
  showAlert: (heading, text, type, code) => {},
  skipVerification: () => {}
});

const AppContextProvider = ({ children }) => {
  //Internal states to control modal activation
  const [ query, setQuery ] = useState(null);
  const [ alert, setAlert ] = useState(null);

  //Helper for handling open/closing of modals
  //TODO: use history to make "navigate back" close the modal
  //(really nice on Android with its "back-button")
  const openQuery = (heading, text, resultCb, type ) => {
    if (!query) {
      setQuery({ heading, text, resultCb, type });
    } else {
      console.log("TODO/TBD: multiple concurrent queries?");
      resultCb && resultCb(false);
    }
  };
  const onCloseQuery = () => {
    setQuery(null);
  }

  const openAlert = (heading, text, type, code ) => {
    if (!alert) {
      setAlert({ heading, text, type, code });
      if (type === "Error") {
        errorTracking.captureMessage(`${heading}: ${text}${code ? " | " + code : ""}`);
      }
    } else {
      console.log("TODO/TBD: multiple concurrent or queued alerts?");
    }
  };
  const onCloseAlert = () => {
    setAlert(null);
  }

  //The fixed (constant) part of the context, i.e. the functions
  const [ fixedContext ] = useState({
    queryConfirm: (...args) => openQuery(...args),
    showAlert: (...args) => openAlert(...args),
    skipVerification: () => setContext(prev => ({ ...prev, verifiedAccount: !!prev.user }))
  });

  //The exported context (variable and fixed parts together)
  const [ context, setContext ] = useState({
    initialAuthChecked: false,
    user: null,
    verifiedAccount: false,
    validatedAccess: null, // null until status fetched from backend (then true/false)
    teams: null,
    ...fixedContext
  });

  //Setup detection of authentication changes
  useEffect ( () => {
    //Given that "fixedContext" really is fixed, there should only be one (1)
    //invocation of this function... but keep track of and apply "unsubscribe"
    //anyway as some kind of extra (/over) defensive measure 
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setContext(prev => ({
        initialAuthChecked: true, //one-time toggling false->true
        user,
        verifiedAccount: !!user && (user.emailVerified || prev.verifiedAccount),
        validatedAccess: !!user ? prev.validatedAccess : null,
        teams: prev.teams,
        ...fixedContext
      }));
    });
    return () => {
      unsubscribe();
    }
  }, [fixedContext]);
  
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
  //(Not so nice but not a big issue either)
  //Possible solutions:
  //- only set `validatedAccess=true` in a `.then` of `validateAccess`, OR
  //- keep track of local action and ignore the first callback-response
  //- (TODO: Think of multiple devices...)
  useEffect( () => {
    if (context.verifiedAccount) {
      validateAccess(context.user)
      .catch(e => {
        fixedContext.showAlert("Data backend error", "Couldn't validate access to private data", "Error", e.message || e);
      });
    }
  }, [context.verifiedAccount, context.user, fixedContext])
  useEffect( () => {
    let unsubscribeFn = null;
    if (context.user) {
      unsubscribeFn = onValidatedAccess(context.user, (validated, e) => {
        if (e) {
          fixedContext.showAlert("Data backend error", "Couldn't retrieve access validation status", "Error", e.message || e);
        }
        setContext(prev => ({ ...prev, validatedAccess: validated }))
      });
    }        
    return () => {
      if (unsubscribeFn)
        unsubscribeFn();
    };      
  }, [context.user, fixedContext])

  //Keep track of teams owned by the logged in user
  const { teams, readError } = useOwnedTeams(context.user, context.validatedAccess);
  useEffect( () => {
    setContext(prev => ({ ...prev, teams }))
  }, [teams])
  useEffect( () => {
    if (readError) {
      fixedContext.showAlert("Data backend error", "Error reading user's team data", "Error", readError);
      //Don't really know what to do in this case... something is wrong with the backend DB connection
      logout()
    }
  }, [readError, fixedContext])
  
  //Basically render all possible modals and then the actual (wrapped) components
  //if the initial authentication check has completed.
  return (
    <AppContext.Provider value={context} >
      <QueryModal query={query} onClose={onCloseQuery} />
      <AlertModal alert={alert} onClose={onCloseAlert} />
      {context.initialAuthChecked ? children : null }
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider};
