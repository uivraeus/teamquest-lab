import React from "react";
import InfoBlock from "../components/InfoBlock";
import { Link } from "react-router-dom";

import "./Start.css";

const TextBlockItem = ({ children }) => {
  return (
    <div className="TextBlockItem">
      <span className="TextBlockItem-circle"></span>
      <div className="TextBlockItem-content">
        {children}
      </div>
    </div>
  );
}

const Start = () => {
  return (
    <div className="Start">
      <h3>
        Welcome to the{" "}
        <span className="NoBreak">Mini Team Maturity Questionnaire</span>
      </h3>
      <div className="Start-text-block">
        <TextBlockItem>
          <p>
            The mini-TMQ is a <em>tiny-yet-effective</em> measurement of the
            collaborative maturity of agile teams.
          </p>
        </TextBlockItem>
        <TextBlockItem>
          <p>
            It comprises 13 items rated on a <em>Likert scale</em> from 1-5 that
            outputs a team’s maturity profile regarding its internal
            collaboration.
          </p>
        </TextBlockItem>
        <TextBlockItem>
          <p>
            It is built upon Susan Wheelan’s Integrated Model of Group
            Development.
          </p>
        </TextBlockItem>
      </div>
      <div className="Start-account-info">
        <p>
          <Link to="/login">Login</Link> to manage your team's
          surveys.
        </p>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link> to create
          one.
        </p>
      </div>
      <InfoBlock>
        <p>
          Individual team members do not need any account to take the
          survey. No login is required for that.
        </p>
        <p>
          All answers are anonymized and the tool only presents
          statistics on the team-level, using anonymous team-URLs.
        </p>
      </InfoBlock>
    </div>
  );
};

export default Start;
