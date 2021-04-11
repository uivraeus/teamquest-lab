import React, { useState } from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock";
import { Link } from "react-router-dom";
import { signup } from "../helpers/auth";

import "./Signup.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);

  const deriveStatus = () => {
    var status = "";
    var error = false;
    var pending = true;
    if (!submitted) {
      if (email.length === 0) {
        status = "Please enter an email address";
      } else if (password.length === 0) {
        status = "Please select a password";
      } else if (password.length < 6) {
        //Firebase requirement
        status = "Password must be at least six characters";
      } else if (password.localeCompare(password2)) {
        if (password2.length >= password.length) {
          status = "Passwords don't match";
          error = true;
        } else {
          status = "Please confirm the password";
        }
      } else {
        status = "Passwords match";
        pending = false;
      }
    } else {
      if (!response) {
        status = "Registering...";
        error = false;
      } else {
        status = response;
        error = true;
      }
    }

    return { status, pending, error };
  };

  const handleChange = (e) => {
    if (e.target.name === "email") setEmail(e.target.value);
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
      //created user is returned by signup but we don't use it (here)
      await signup(email, password);
    } catch (error) {
      setResponse(error.message);
    }
  };

  const { status, pending, error } = deriveStatus();
  return (
    <div className="Signup">
      <h1>Sign up for the Mini-TMQ tool</h1>
      <p>You need an account to create and manage surveys for your team.</p>
      <p>By signing up for an account you are agreeing to the <Link to="/terms">Terms and Conditions of Use</Link>.</p>
      <hr></hr>
      <p className={error ? "error-response" : null}>{status}</p>

      <form onSubmit={handleSubmit}>
        <div className="Signup-control">
          <input
            className="app-input"
            placeholder="Email"
            name="email"
            type="email"
            onChange={handleChange}
            value={email}
          ></input>
          <input
            className="app-input"
            placeholder="Password"
            name="password"
            type="password"
            onChange={handleChange}
            value={password}
          ></input>
          <input
            className="app-input"
            placeholder="Confirm password"
            name="password2"
            type="password"
            onChange={handleChange}
            value={password2}
          ></input>

          <AppBtn text="Sign up" kind="accent" type="submit" disabled={pending} />
        </div>
      </form>
      <InfoBlock>
        <p>
          The email address you specify will be used if you forget your password and need to <Link to="/reset">reset</Link> it. 
        </p>
        <p>
          Learn more about how user information is managed in the <Link to="/privacy">privacy policy</Link>.
        </p>
        <hr></hr>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
        
      </InfoBlock>
    </div>
  );
};

export default Signup;
