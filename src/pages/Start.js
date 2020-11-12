import React from 'react';
import { Link } from 'react-router-dom';

//import './Start.css';

const Start = () => {
    return (
        <div className="Start">
            <h2>Welcome to mini-GDQ</h2>
            <p>Bla, bla, bla...</p>
            <p>With this tool you prepare assessment runs and create questionnaire links for your team members.</p>
            <p><Link to="/login">Login</Link> to create a new assessment run.</p>
            <p>Or, if you don't have an account, <Link to="/signup">sign up</Link> to create one.</p>
        </div>
    );
}

export default Start;
