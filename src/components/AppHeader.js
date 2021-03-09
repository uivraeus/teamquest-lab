import React from 'react';
import AppBtn from './AppBtn';
import useAppContext from '../hooks/AppContext'
import UserSettings from './UserSettings';
import { useHistory, useLocation } from 'react-router-dom';

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
    
  const homeLogoClassName = "AppHeader-home-logo" + (isAtHome ? "" : " AppHeader-home-visible")
  return (
      <header className="AppHeader">
        <nav className="AppHeader-app-navigation">
          <div className="AppHeader-about-pages">
            <AppBtn text="Terms" kind="menu" id="terms-of-service" onClick={() => history.push('/terms')} />
            <span> | </span>
            <AppBtn text="Privacy" kind="menu" id="privacy-policy" onClick={() => history.push('/privacy')} />
            <span> | </span>
            <AppBtn text="Contact" kind="menu" id="contact-information" onClick={() => history.push('/contact')} />
          </div>
          <div className={homeLogoClassName}>
            <AppBtn onClick={() => history.push(homeLocation)} disabled={isAtHome}>
              <Home />
            </AppBtn>
            <p className="style-override">Mini-TMQ</p>
          </div>
        </nav>        
        {user ? <UserSettings user={user} /> : null}
      </header> 
  );
}

export default AppHeader;
