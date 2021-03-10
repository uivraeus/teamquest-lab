import React from 'react';
import AppBtn from "./AppBtn";
import { logout } from '../helpers/auth';
import { useHistory } from 'react-router-dom';

import { ReactComponent as UserIcon } from "../icons/user.svg"

import './UserSettings.css';

const UserSettings = ( {user} ) => {
    const history = useHistory();
    
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
            <AppBtn id="manage-user-account" onClick={() => history.push('/creator/manage')}>
                <UserIcon />
            </AppBtn>
        </div>
    );
}

export default UserSettings;
