import React from "react";
import { Link } from "react-router-dom";

import "./Start.css";

const Start = () => {
  return (
    <div className="Start">
      <h3>
        Welcome to the{" "}
        <span className="NoBreak">Mini Team Maturity Questionnaire</span>
      </h3>
      <div className="Start-info-block">
        <p>
          The mini-TMQ is a <em>tiny-yet-effective</em> measurement of the
          collaborative maturity of agile teams.
        </p>
        <p>
          It comprises 13 items rated on a <em>Likert scale</em> from 1-5 that
          outputs a team’s maturity profile regarding its internal
          collaboration.
        </p>
        <p>
          It is built upon Susan Wheelan’s Integrated Model of Group
          Development.
        </p>
      </div>
      <h3>Managing teams and surveys</h3>
      <div className="Start-info-block">
        <p>
          <Link to="/login">Login</Link> to initiate and manage your team's
          surveys.
        </p>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link> to create
          one.
        </p>
      </div>
      <div className="Start-notice-block">
        <p>
          Individual team members do not need any account to take the
          survey. No login is required for that.
        </p>
        <p>
          All answers are anonymized and the tool only presents
          statistics on the team-level, using anonymous team-URLs.
        </p>
      </div>
    </div>
  );
};

export default Start;
