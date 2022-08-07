import React, { createContext, useEffect, useState } from 'react';
import Modal from 'react-modal'
import AlertModal from './AlertModal';
import { errorTracking } from '../services/sentry';
import QueryModal from './QueryModal';
import { onValidatedAccess, validateAccess } from '../helpers/user';
import useOwnedTeams from '../hooks/OwnedTeams';

//Auth backend
import { auth } from '../services/firebase'
import { logout } from '../helpers/auth';
import { flushSync } from 'react-dom';

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
    skipVerification: () => setContextSync(prev => ({ ...prev, verifiedAccount: !!prev.user })) 
  });

  //The exported context (variable and fixed parts together)
  //It is essential that any updates of the login- or verification/validation status is
  //updated without any batching (React 18+). Otherwise there is a risk of triggering
  //backend security rule violations due to races for some data base operations.
  //This is why a setContextSync is defined to be used for those kind of updates.
  //(Probably an indication of a fragile design solution but it's what we do for now)
  const [ context, setContext ] = useState({
    initialAuthChecked: false,
    user: null,
    verifiedAccount: false,
    validatedAccess: null, // null until status fetched from backend (then true/false)
    teams: null,
    ...fixedContext
  });
  // wrap in setTimeout to enable usage inside useEffects
  const setContextSync = arg => setTimeout(()=> flushSync(() => setContext(arg)), 0);
  
  //Setup detection of authentication changes
  useEffect ( () => {
    //Given that "fixedContext" really is fixed, there should only be one (1)
    //invocation of this function... but keep track of and apply "unsubscribe"
    //anyway as some kind of extra (/over) defensive measure 
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setContextSync(prev => ({
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
          //In some (rare?) cases thee is a race when logging out or terminating the account causing
          //an "access error" before the unsubscribe function has had a chance to run. So, "hide"
          //this error (and hope that it doesn't appear during other circumstances). 
          //TODO: replace this work-around with a proper (robust) solution
          //fixedContext.showAlert("Data backend error", "Couldn't retrieve access validation status", "Error", e.message || e);
          console.warn(`Data backend error - Couldn't retrieve access validation status. Error: ${e.message || e}`)
        }
        setContextSync(prev => ({ ...prev, validatedAccess: validated }))
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
      {context.initialAuthChecked ? children : null }
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider};
