import React from 'react';
import AppBtn from "./AppBtn";
import { logout } from '../helpers/auth';
// import { ReactComponent as UserIcon } from "../icons/user.svg"

import './UserSettings.css';

const UserSettings = ( {user} ) => {
    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.log(e);
        }
    }
    return (
        <div className="UserSettings">
            <AppBtn text="Log out" kind="menu" id="logout" onClick={handleLogout} />
            <p><em>{user.email}</em></p>
        </div>
    );
}

export default UserSettings;
