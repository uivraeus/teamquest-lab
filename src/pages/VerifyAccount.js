import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock";
import LoadingIndicator from '../components/LoadingIndicator';
import { logout, verify } from "../helpers/auth";
import { isValidated } from "../helpers/user";
import useAppContext from "../hooks/AppContext";
import { Link, useHistory } from 'react-router-dom'

import "./VerifyAccount.css";

const VerifyAccount = () => {
  const { user, skipVerification, showAlert } = useAppContext();
  const history = useHistory();
  const [pending, setPending] = useState(false);
  const [legacyUser, setLegacyUser] = useState(null); // null until known, then bool

  useEffect(() => {
    isValidated(user)
    .then(validated => setLegacyUser(validated)) //a user with unverified email but still validated
    .catch(error => {
      const msg = error.message ? error.message : error
      showAlert("Data backend error", "Could not read user configuration", "Error", msg);
      logout(); // Why not... at least not getting stuck on this page
    });
  },[user, showAlert])

  const triggerVerification = async (e) => {
    setPending(true);
    try {
      await verify();
      showAlert("E-mail sent", "Check your in-box for an e-mail with further instructions");
      //The user must log in again to sync the (verified) authentication state
      await logout();
      history.replace("/login");
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
            Forgot your current password? <Link to="/reset">Reset</Link> it via email.
          </p>
          <hr/>
          <p>If you don't proceed with this step {orElseText}</p>
        </InfoBlock>
      </div>
    : <LoadingIndicator text="Loading user account information"/> 
  );
};

export default VerifyAccount;
