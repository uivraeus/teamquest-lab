import React from "react";
import AppBtn from "../components/AppBtn";
import BackBtnLink from "../components/BackBtnLink";
import { Link, useNavigate } from 'react-router-dom'
import TeamAdmin from "../components/TeamAdmin";
import useAppContext from "../hooks/AppContext";
import { absCreatorPath } from "../RoutePaths";

import { ReactComponent as PasswordIcon } from "../icons/password.svg";
import { ReactComponent as TerminateIcon } from "../icons/terminate.svg";

import "./Manage.css";

const Manage = ({ teams }) => {
  const { user } = useAppContext();
  
  const pathPassword = absCreatorPath("changePassword");
  const pathTerminate = absCreatorPath("terminate");
  const navigate = useNavigate();
  const goTo = (path) => {
    navigate(path);
  }
  
  //Routing helpers shall ensure that we never end up here with user==null, but...
  if (!user) return <></>;

  return (
  <>
    <h1>Manage account and teams</h1>
    <div className="Manage-account">
      <h3><em>{user.email}</em></h3>
      <ul>
        <li>
          <div className="Manage-account-link">
            <AppBtn onClick={() => goTo(pathPassword)}>
              <PasswordIcon />
            </AppBtn>
            <p><Link to={pathPassword}>Change</Link> your account password</p>
          </div>
        </li>
        <li>
          <div className="Manage-account-link">
            <AppBtn onClick={() => goTo(pathTerminate)}>
              <TerminateIcon />
            </AppBtn>
            <p><Link to={pathTerminate}>Terminate</Link> your account and delete all data</p>
          </div>
        </li>      
      </ul>
    </div>
    <TeamAdmin user={user} teams={teams} />
    <BackBtnLink separator/>
  </>      
  );
};

export default Manage;
