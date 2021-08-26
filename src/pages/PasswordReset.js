import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock";
import { logout, reset } from "../helpers/auth";
import { useHistory } from "react-router-dom";
import useAppContext from "../hooks/AppContext";

import "./PasswordReset.css";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [response, setResponse] = useState(null);
  const [initiated, setInitiated] = useState(false);
  const { user, showAlert } = useAppContext();
  const history = useHistory();

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
      setInitiated(true);
      await reset(email);
      if (user) {
        //Not the most common case but if a logged in user forgot
        //the password and triggers a reset, it doesn't makes sense
        //to come back after completed reset without having to
        //log in using the new password.
        await logout();
      }
      showAlert("Email sent", "Check your in-box for an email with further instructions");
      history.replace("/login");
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
