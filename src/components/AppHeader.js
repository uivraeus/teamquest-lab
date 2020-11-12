import React, { useEffect, useState } from 'react';
import { auth } from "../services/firebase";
import UserSettings from './UserSettings';
import { Link } from 'react-router-dom';

import './AppHeader.css';

const AppHeader = ( { authenticated }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = auth().currentUser;
    setUser(u);

    // Return what to do when "un-mounting"
    return () => {
      //TBD
    };
  }, [authenticated]);

  return (
      <header className="AppHeader">
        <Link className="style-override" to="/start">mini-GDQ</Link>
        {user ? <UserSettings user={user} /> : null}
      </header>
      
  );
}

export default AppHeader;
