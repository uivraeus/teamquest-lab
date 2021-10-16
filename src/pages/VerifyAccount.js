import React from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock";
import { logout, verify } from "../helpers/auth";
import useAppContext from "../hooks/AppContext";
import { Link, useHistory } from 'react-router-dom'

import "./VerifyAccount.css";

const VerifyAccount = () => {
  const { user, skipVerification, showAlert } = useAppContext();
  const history = useHistory();

  const triggerVerification = async (e) => {
    try {
      await verify();
      showAlert("E-mail sent", "Check your in-box for an e-mail with further instructions");
      //The user must log in again to sync the (verified) authentication state
      await logout();
      history.replace("/login");
    } catch(e) {
      showAlert("Operation failed", "Could not initiate sending of verification e-mail", "Error", e.message);
    }
  }
  
  // Content depending on type of user
  const legacyUser = true;
  const headingText = legacyUser 
    ? "Verify your e-mail address "
    : "Almost there"
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
    <div className="VerifyAccount">
      <h1>{headingText}</h1>
      <p>Your account, <i>{user.email}</i>, {situationText}</p>
      <p>{processText} You will then have to login again to synchronize your account status.</p>
      <AppBtn text="Send verification mail" kind="accent" onClick={triggerVerification}/>
      <AppBtn text="Skip this" onClick={skipVerification}/>
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
  );
};

export default VerifyAccount;
