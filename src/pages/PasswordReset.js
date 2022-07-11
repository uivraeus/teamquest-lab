import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock";
import { logout, reset } from "../helpers/auth";
import { useNavigate } from "react-router-dom";
import useAppContext from "../hooks/AppContext";
import { absAppPath } from "../RoutePaths";

import "./PasswordReset.css";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [response, setResponse] = useState(null);
  const [initiated, setInitiated] = useState(false);
  const { user, showAlert } = useAppContext();
  const navigate = useNavigate();

  //In case we land here when logged in
  useEffect(() => {
    if (user) {
      setEmail(user.email)
    }
  }, [user]);

  const handleChange = (e) => {
    if (e.target.name === "email") setEmail(e.target.value);
    if (initiated && response) {
      //Previous attempt failed, restart
      setInitiated(false);
      setResponse(null);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      if (email === "crash@here.now") {
        //Temporary (?) crash-logic for testing
        console.log("Intentionally crashing...");
        setEmail(() =>  e.dontExists());
        return;
      } else if (email === "error@here.now") {
        showAlert("Intentional error", "Test message", "Error", "Resistance is futile");
        return;
      }
      setInitiated(true);
      await reset(email);
      if (user) {
        //Not the most common case but if a logged in user forgot
        //the password and triggers a reset, it doesn't makes sense
        //to come back after completed reset without having to
        //log in using the new password.
        await logout();
      }
      const message = 
        "Check your in-box for an e-mail with further instructions.\n\n" +
        "Didn't receive the mail? Check your spam/junk mail folder.";
      showAlert("E-mail sent", message);
      navigate(absAppPath("login"), { replace: true });
    } catch (err) {
      setResponse(err.message);
    }
  };

  const status = response
    ? response
    : initiated
      ? "Sending link for password reset..."
      : "Please enter your account's email address";

  return (
    <div className="PasswordReset">
      <h1>Reset your password for the Mini-TMQ tool</h1>
      <p className={response ? "error-response" : null}>{status}</p>

      <form onSubmit={handlePasswordReset}>
        <div className="PasswordReset-control">
          <input
            className="app-input"
            placeholder="Email"
            name="email"
            type="email"
            onChange={handleChange}
            value={email}
          ></input>

          <AppBtn
            text="Send mail"
            kind="accent"
            type="submit"
            id="send"
            disabled={!email.length}
          />
        </div>
      </form>
      <InfoBlock>
        <h4>What happens next?</h4>
        <p>
          You will receive an email with a link to a separate site at which you
          can specify a new password for your account.
        </p>
        <p>
          Afterwards, you can login here using your updated credentials.
        </p>
      </InfoBlock>
    </div>
  );
};

export default PasswordReset;
