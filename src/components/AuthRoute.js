import React, {useEffect} from "react";
import useAppContext from "../hooks/AppContext";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { absAppPath, absCreatorPath } from "../RoutePaths";
import { flushSync } from "react-dom";

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

  //For some reason the redirects between creator-paths causes re-mounting of CreatorApp
  //when done via <Navigate>. That is unfortunate as it triggers a re-fetch of "teams".
  //A work-around (because I haven't understood the root-cause) is to redirect via the
  //navigate-function as a side-effect instead. I think it would be possible to always
  //do that but I really prefer the <Navigate> version so I stick to it when it doesn't
  //hurt.
  const redirectViaEffect = redirect && redirect.includes(absAppPath("creator"));
  const navigate = useNavigate();
  useEffect(()=> {
    if (redirectViaEffect) {
      console.log("@redirect vi useEffect")
      flushSync(() => 
        navigate(redirect, { replace: true })
      );
    }
  });

  return (redirect && !redirectViaEffect ? <Navigate to={redirect} replace /> : children );
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

