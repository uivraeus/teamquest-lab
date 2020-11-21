import React, { useState } from "react";
import AppBtn from "../components/AppBtn";
import { Link } from "react-router-dom";
import { login } from "../helpers/auth";

import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(null);
  const [initiated, setInitiated] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === "email") setEmail(e.target.value);
    else if (e.target.name === "password") setPassword(e.target.value);
    if (initiated && response) {
      //Previous attempt failed, restart
      setInitiated(false);
      setResponse(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setInitiated(true);
      await login(email, password);
    } catch (err) {
      setResponse(err.message);
    }
  };

  //This rule could be improved
  const credentialsEntered = email.length && password.length;

  const status = response
    ? response
    : initiated
    ? "Logging in..."
    : "Please enter your credentials";

  return (
    <div className="Login">
      <h1>Login to Mini-TMQ tool</h1>
      <p className={response ? "error-response" : null}>{status}</p>

      <form onSubmit={handleLogin}>
        <div className="Login-control">
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
          <AppBtn
            text="Login"
            kind="accent"
            type="submit"
            id="login"
            disabled={!credentialsEntered}
          />
        </div>
      </form>

      <p>
        No account? <Link to="/signup">Sign up</Link> to create one.
      </p>
    </div>
  );
};

export default Login;
