import React, { useState } from "react";
import AppBtn from "../components/AppBtn";
import { update } from "../helpers/auth";
import useAppContext from "../hooks/AppContext";
import { useHistory } from 'react-router-dom'

import "./ChangePassword.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);

  const { showAlert } = useAppContext();
  const history = useHistory();
  
  //TODO (?): common helper for signup and this component
  //(but the logic is only similar - not identical)
  const deriveStatus = () => {
    var status = "";
    var error = false;
    var pending = true;
    if (!submitted) {
      if (oldPassword.length < 6) {
        status = "Please enter your current password";
      } else if (password.length === 0) {
        status = "Please select a new password";
      } else if (password.length < 6) {
        //Firebase requirement
        status = "Password must be at least six characters";
      } else if (password.localeCompare(password2)) {
        if (password2.length >= password.length) {
          status = "Passwords don't match";
          error = true;
        } else {
          status = "Please confirm the new password";
        }
      } else if (oldPassword === password) {
          status = "New password must be different from the current password"
          error = true;
      } else {
        status = "Passwords match";
        pending = false;
      }
    } else {
      if (!response) {
        status = "Updating...";
        error = false;
      } else {
        status = response;
        error = true;
      }
    }

    return { status, pending, error };
  };

  const handleChange = (e) => {
    if (e.target.name === "current password") setOldPassword(e.target.value);
    else if (e.target.name === "password") setPassword(e.target.value);
    else if (e.target.name === "password2") setPassword2(e.target.value);

    if (submitted && response) {
      //Something went wrong in last submit-attempt. Prepare for a new one.
      setSubmitted(false);
      setResponse(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await update(oldPassword, password);
      showAlert("Update complete", "The password for your account has now been updated");
      //go back, probably to account management if the user didn't explicitly enter the URL.
      history.goBack();
    } catch (error) {
      setResponse(error.message);
    }
  };

  const { status, pending, error } = deriveStatus();
  return (
    <div className="ChangePassword">
      <h1>Change password</h1>
      <p className={error ? "error-response" : null}>{status}</p>

      <form onSubmit={handleSubmit}>
        <div className="ChangePassword-control">
          <input
            className="app-input"
            placeholder="Current password"
            name="current password"
            type="password"
            onChange={handleChange}
            value={oldPassword}
          ></input>
          <input
            className="app-input"
            placeholder="New password"
            name="password"
            type="password"
            onChange={handleChange}
            value={password}
          ></input>
          <input
            className="app-input"
            placeholder="Confirm new password"
            name="password2"
            type="password"
            onChange={handleChange}
            value={password2}
          ></input>

          <AppBtn text="Update" kind="accent" type="submit" disabled={pending} />
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
