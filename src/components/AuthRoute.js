import React from "react";
import useAppContext from "../hooks/AppContext";
import { Navigate, useLocation } from "react-router-dom";
import { absAppPath, absCreatorPath } from "../RoutePaths";

/**
 * Exported helper functions for wrapping the target element with components
 * that verifies required auth-state preconditions.
 * These wrapper-components are also responsible for redirecting/navigating
 * to the proper fallback pages when the requirements are not fulfilled.
 */ 

export const requireSignedIn = (element) => {
  return(
    <RequireSignedIn>
      {element}
    </RequireSignedIn>
  )
}

export const requireSignedOut = (element) => {
  return(
    <RequireSignedOut>
      {element}
    </RequireSignedOut>
  )
}


/**
 * The internal (non-exported) components and related logic
 */

const RequireSignedIn = ({ children }) => {
  const { user, verifiedAccount } = useAppContext();
  const { pathname } = useLocation();
  const redirect = requireSignedInRedirect(!!user, verifiedAccount, pathname);

  return (redirect ? <Navigate to={redirect} replace /> : children );
}


const RequireSignedOut = ({ children }) => {
  const { user } = useAppContext();
  const redirect = requireSignedOutRedirect(!!user);

  return (redirect ? <Navigate to={redirect} replace /> : children );
}

// This code knows/assumes a bit too much about the routing setup... (but it is very convenient)
const redirectPath = {
  NONE: null,
  PUBLIC_START: absAppPath("start"),
  PRIVATE_MAIN: absCreatorPath("main"),
  VERIFY: absCreatorPath("verify")
}  

const requireSignedInRedirect = (isAuth, isVerified, currentPath) => {
  if (isAuth) {
    if (isVerified) {
      if (currentPath === redirectPath.VERIFY) {
        return redirectPath.PRIVATE_MAIN;
      } else {
        return redirectPath.NONE;
      }
    } else {
      if (currentPath === redirectPath.VERIFY) {
        return redirectPath.NONE;
      } else {
        return redirectPath.VERIFY;
      }
    }
  } else{
    return redirectPath.PUBLIC_START;
  }
}
const requireSignedOutRedirect = (isAuth) => {
  if (isAuth) {
    return redirectPath.PRIVATE_MAIN;
  } else {
    return redirectPath.NONE;
  }
}

