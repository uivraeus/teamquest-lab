import React from "react";
import BackBtnLink from "../components/BackBtnLink";
import BtnLinkItem from "../components/BtnLinkItem";
import TeamAdmin from "../components/TeamAdmin";
import useAppContext from "../hooks/AppContext";
import { absCreatorPath } from "../RoutePaths";

import { ReactComponent as PasswordIcon } from "../icons/password.svg";
import { ReactComponent as TerminateIcon } from "../icons/terminate.svg";

import "./Manage.css";

const Manage = ({ teams }) => {
  const { user } = useAppContext();
  
  //Routing helpers shall ensure that we never end up here with user==null, but...
  if (!user) return <></>;

  return (
  <>
    <h1>Manage account and teams</h1>
    <div className="Manage-account">
      <h3><em>{user.email}</em></h3>
      <ul>
        <li>
          <BtnLinkItem
            destPath={absCreatorPath("changePassword")}
            Icon={PasswordIcon}
            textLink="Change"
            textAfter="your account password"
          />
        </li>
        <li>
          <BtnLinkItem
            destPath={absCreatorPath("terminate")}
            Icon={TerminateIcon}
            textLink="Terminate"
            textAfter="your account and delete all data"
          />
        </li>      
      </ul>
    </div>
    <TeamAdmin user={user} teams={teams} />
    <BackBtnLink separator/>
  </>      
  );
};

export default Manage;
