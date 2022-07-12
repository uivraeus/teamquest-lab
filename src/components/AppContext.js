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
  //Internal states to control modal activation, last element is always the latest/top-most
  const [ queries, setQueries ] = useState([]);
  const [ alerts, setAlerts ] = useState([]);

  const onCloseQuery = () => {
    setQueries(queries.slice(0, -1));
  }
  const onCloseAlert = () => {
    setAlerts(alerts.slice(0, -1));
  }

  //The fixed (constant) part of the context, i.e. the functions
  const [ fixedContext ] = useState({
    queryConfirm: (heading, text, resultCb, type ) => {
      setQueries(prev => [...prev, { heading, text, resultCb, type }]);
    },
    showAlert: (heading, text, type, code ) => {
      setAlerts(prev => [...prev, { heading, text, type, code }]);
      if (type === "Error") {
        errorTracking.captureMessage(`${heading}: ${text}${code ? " | " + code : ""}`);
      }
    },
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
    setContext(prev => ({
        ...prev,
        ...authState,
      }));
  }, [authState])

  //Keep track of teams owned by the logged in user
  const { teams, readError } = useOwnedTeams(context.user, context.validatedAccess);
  useEffect( () => {
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
  
  //Use fix-length arrays for rendered modals (with null-entries for unused slots)
  //Closing a modal shall correspond to rendering of it with a null value. Limit to a history-depth
  //of 3 probably never exceeded but if that happens the ones at the bottom of the deck will not show.
  const [renderedQueries, setRenderedQueries] = useState([null, null, null])
  const [renderedAlerts, setRenderedAlerts] = useState([null, null, null])
  const lastThreeWithNullPad = array => [...array.slice(-3), null, null, null].slice(0,3)
  useEffect(() => {
    setRenderedQueries(lastThreeWithNullPad(queries))
  }, [queries])
  useEffect(() => {
    setRenderedAlerts(lastThreeWithNullPad(alerts))
  }, [alerts])

  //Basically render all possible modals and then the actual (wrapped) components
  //if the initial authentication check has completed.
  return (
    <AppContext.Provider value={context} >
      {renderedQueries.map((q,ix) => <QueryModal key={`query-modal-${ix}`} query={q} onClose={onCloseQuery} />)}
      {renderedAlerts.map((a,ix) => <AlertModal key={`alert-modal-${ix}`} alert={a} onClose={onCloseAlert} />)}
      {authState.initialAuthChecked ? children : null }
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider};
