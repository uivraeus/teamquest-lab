import React from 'react';
import AppBtn from './AppBtn';
import useAppContext from '../hooks/AppContext'
import UserSettings from './UserSettings';
import { useNavigate, useLocation } from 'react-router-dom';
import { absAppPath, absCreatorPath } from '../RoutePaths';

import { ReactComponent as Home } from "../icons/home.svg";
import { ReactComponent as Logo } from "../icons/logo.svg";

import './AppHeader.css';

const AppHeader = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  //Don't show "Home" when we're there already
  //(different depending on auth state)
  const location = useLocation();
  const homeLocation = user ? absCreatorPath("main") : absAppPath("start");
  const isAtHome = location && location.pathname ===  homeLocation;
    
  const homeLogoClassName = "AppHeader-home-logo" + (isAtHome ? "" : " AppHeader-home-visible")
  return (
      <header className="AppHeader">
        <nav className="AppHeader-app-navigation">
          <div className="AppHeader-about-pages">
            <AppBtn text="Terms" kind="menu" id="terms-of-service" onClick={() => navigate(absAppPath("terms"))} />
            <span> | </span>
            <AppBtn text="Privacy" kind="menu" id="privacy-policy" onClick={() => navigate(absAppPath("privacy"))} />
            <span> | </span>
            <AppBtn text="Contact" kind="menu" id="contact-information" onClick={() => navigate(absAppPath("contact"))} />
          </div>
          <div className={homeLogoClassName}>
            <AppBtn onClick={() => navigate(homeLocation)} disabled={isAtHome}>
              <Home />
            </AppBtn>
            <Logo />
          </div>
        </nav>        
        {user ? <UserSettings user={user} /> : null}
      </header> 
  );
}

export default AppHeader;
