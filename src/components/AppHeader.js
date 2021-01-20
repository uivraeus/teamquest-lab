import React, { useLayoutEffect } from 'react';
import AppBtn from './AppBtn';
import useAppContext from '../hooks/AppContext'
import UserSettings from './UserSettings';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { ReactComponent as Home } from "../icons/home.svg";

import './AppHeader.css';

const AppHeader = () => {
  const { user } = useAppContext();
  const history = useHistory();

  //Don't show "Home" when we're there already
  //(different depending on auth state)
  const location = useLocation();
  const homeLocation = user ? "/creator/main" : "/start";
  const isAtHome = location && location.pathname ===  homeLocation;
  
  /* The two height variants were derived from what I ended up with before
   * trying to control the height explicitly (e.g. derived from font-size,
   * margins etc.). Just stick with these until I decide I don't like them.
   */
  useLayoutEffect(() => {
    const h = user ? "5.155em" : "3.188em";
    document.documentElement.style.setProperty(
      '--height-header', h
    );
  }, [user])

  const homeLogoClassName = "AppHeader-home-logo" + (isAtHome ? "" : " AppHeader-home-visible")
  return (
      <header className="AppHeader">
        <div className={homeLogoClassName}>
          <AppBtn onClick={() => history.push(homeLocation)} disabled={isAtHome}>
            <Home />
          </AppBtn>
          <Link className="style-override" to={homeLocation}>Mini-TMQ</Link>
        </div>        
        {user ? <UserSettings user={user} /> : null}
      </header>
      
  );
}

export default AppHeader;
