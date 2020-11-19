import React from 'react';
import useAppContext from '../hooks/AppContext'
import UserSettings from './UserSettings';
import { Link } from 'react-router-dom';

import './AppHeader.css';

const AppHeader = () => {
  const { user } = useAppContext();

  return (
      <header className="AppHeader">
        <Link className="style-override" to="/start">mini-GDQ</Link>
        {user ? <UserSettings user={user} /> : null}
      </header>
      
  );
}

export default AppHeader;
