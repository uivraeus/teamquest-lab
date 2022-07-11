import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import InfoBlock from "../components/InfoBlock";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../helpers/auth";
import { absAppPath, absCreatorPath } from "../RoutePaths";

import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(null);
  const [initiated, setInitiated] = useState(false);
  const navigate = useNavigate();
  
  const location = useLocation();
  useEffect(() => {
    if (location.state && location.state.emailHint) {
      setEmail(location.state.emailHint);
    }
  }, [location])
  
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
      // Defer actual navigation to avoid (almost unnoticeable) route toggling between
      // creator/start until AppContext's auth-state is updated 
      setTimeout(() => navigate(absCreatorPath("main"), { replace: true }), 0);
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
            autoComplete="username"
            onChange={handleChange}
            value={email}
          ></input>

          <input
            className="app-input"
            placeholder="Password"
            name="password"
            type="password"
            autoComplete="current-password"
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
      <InfoBlock>
        <p>
          Forgot your password? <Link to={absAppPath("passwordReset")}>Reset</Link> it via email.
        </p>
        <hr></hr>
        <p>
          No account? <Link to={absAppPath("signup")}>Sign up</Link> to create one.
        </p>
      </InfoBlock>
    </div>
  );
};

export default Login;
