import React, { createContext, useEffect, useState } from 'react';
import Modal from 'react-modal'
import AlertModal from './AlertModal';
import { errorTracking } from '../services/sentry';
import QueryModal from './QueryModal';
import useOwnedTeams from '../hooks/OwnedTeams';

import { logout } from '../helpers/auth';
import useAuthState from '../hooks/AuthState';

//Default settings for all modals in the app (see http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');
Modal.defaultProps.closeTimeoutMS=300
Modal.defaultProps.shouldCloseOnOverlayClick=false
Modal.defaultProps.overlayClassName="ModalDefaults-Overlay ModalDefaults-Overlay-z-index"

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
  //TODO: This is broken (see openAlert below)
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

  //TODO: This is broken  (or never worked)... the "else" will never trigger when openAlert is
  //      invoked via fixedContext ("alert" is always null in that closure)
  //      (also openQuery above)
  const openAlert = (heading, text, type, code ) => {
    if (!alert) {
      console.log(`@openAlert: ${heading},${text},${type}`)
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
    skipVerification: () => setSkipVerification(true) 
  });

  //The auth state is more than just logged in/out. Use dedicated hook for managing it.
  const [skipVerification, setSkipVerification] = useState(false); //support for legacy users w/o verifiable addresses
  const authState = useAuthState(fixedContext.showAlert, skipVerification);

  //The exported context (variable and fixed parts together)
  const [ context, setContext ] = useState({
    ...authState,
    teams: null,
    ...fixedContext
  });
  
  //Setup detection of user's auth status changes
  useEffect(() => {
    console.log(`@AppContext/authState; initialAuthChecked: ${authState.initialAuthChecked}, user: ${authState.user ? authState.user.email : "<none>"}, verifiedAccount: ${authState.verifiedAccount}, validatedAccess: ${authState.validatedAccess}`)
    setContext(prev => ({
        ...prev,
        ...authState,
      }));
  }, [authState])

  //Keep track of teams owned by the logged in user
  const { teams, readError } = useOwnedTeams(context.user, context.validatedAccess);
  useEffect( () => {
    console.log("@AppContext/teams;", teams)
    setContext(prev => ({ ...prev, teams }))
  }, [teams])
  useEffect( () => {
    if (readError) {
      console.log("Data backend error - Error reading user's team data:", readError)
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
      {authState.initialAuthChecked ? children : null }
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider};
