import React from "react";
import TeamAdmin from "../components/TeamAdmin";
import useAppContext from "../hooks/AppContext";

import "./Manage.css";

const Manage = () => {
  const { user } = useAppContext();

  //Routing helpers shall ensure that we never end up here with user==null, but...
  if (!user) return <></>;

  return (
    <div className="Manage">
      <h1>Manage account and teams</h1>
      <h3>Your account</h3>
      <p>TODO...</p>
      <h3>Your teams</h3>
      <TeamAdmin user={user} />
    </div>
  );
};

export default Manage;
