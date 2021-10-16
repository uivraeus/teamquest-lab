import React, { createContext, useEffect, useState } from 'react';
import AlertModal from './AlertModal';
import { errorTracking } from '../services/sentry';
import QueryModal from './QueryModal';
import { validateAccess } from '../helpers/user';

//Auth & Data backend
import { auth } from '../services/firebase'

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
        verifiedAccount: user && (user.emailVerified || prev.verifiedAccount), 
        ...fixedContext
      }));
    });
    return () => {
      unsubscribe();
    }
  }, [fixedContext]);
  
  useEffect( () => {
    if (context.verifiedAccount) {
      validateAccess(context.user)
      .catch(e => {
        errorTracking.captureException(e);
        console.error(e);
      });
    }
  }, [context.verifiedAccount, context.user])
  
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
