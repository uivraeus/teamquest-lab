import React, { useState } from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock";
import LoadingIndicator from '../components/LoadingIndicator';
import { logout, verify } from "../helpers/auth";
import useAppContext from "../hooks/AppContext";
import { Link } from 'react-router-dom'
import { absAppPath } from "../RoutePaths";

import "./VerifyAccount.css";

const VerifyAccount = () => {
  const { user, validatedAccess, skipVerification, showAlert } = useAppContext();
  const [pending, setPending] = useState(false);
  
  //If we end up here it means that the user hasn't verified the e-mail address
  //But if, at the same time, this user has a validated access it must imply that
  //it was granted "manually". This would typically correspond to a "legacy user",
  //ie. one who signed up before verification became mandatory.
  const legacyUser = validatedAccess; //null until status in known, then true/false
  
  const triggerVerification = async (e) => {
    setPending(true);
    try {
      await verify();
      showAlert("E-mail sent", "Check your in-box for an e-mail with further instructions");
      //The user must log in again to sync the (verified) authentication state
      await logout();
      //navigate(absAppPath("login"), { replace: true });  <-- won't work due to AuthRoute race... will end up at /start
      window.location.href = window.location.origin + "/login"; //plan B (this will cause a page reload)      
    } catch(e) {
      setPending(false);
      showAlert("Operation failed", "Could not initiate sending of verification e-mail", "Error", e.message);
    }
  }
  
  // Content depending on type of user (will be treated as non-legacy until known)
  const situationText = legacyUser
    ? "was setup and used without any verification of your e-mail address. We would like to fix that now."
    : "has been created but we have to verify your e-mail address before you can proceed."
  const processText = legacyUser
    ? "We will send you an e-mail, which contains a link for you to follow in order complete the verification."
    : "When you click the button we will send you an e-mail, which contains a link for you to follow in order to complete the signup process."
  const orElseText = legacyUser
    ? "now we will remind you again."
    : "we will eventually terminate your account."

  return (
    legacyUser !== null
    ? <div className="VerifyAccount">
        <h1>Verify your e-mail address</h1>
        <p>Your account, <i>{user.email}</i>, {situationText}</p>
        <p>{processText} You will then have to login again to synchronize your account status.</p>
        <div className="VerifyAccount-control">
          <AppBtn text="Send verification mail" kind="accent" onClick={triggerVerification} disabled={pending}/>
          {legacyUser ? <AppBtn text="Skip this" onClick={skipVerification} disabled={pending}/> : null }
        </div>
        <InfoBlock>
          <p>
            If you already did this but didn't receive any mail, you should try and click the button again.
          </p>
          <hr/>
          <p>
            Forgot your current password? <Link to={absAppPath("passwordReset")}>Reset</Link> it via email.
          </p>
          <hr/>
          <p>If you don't proceed with this step {orElseText}</p>
        </InfoBlock>
      </div>
    : <LoadingIndicator text="Loading user account information"/> 
  );
};

export default VerifyAccount;
