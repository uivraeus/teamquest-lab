import React from 'react';
import useAppContext from '../hooks/AppContext'
import { Route, Redirect } from 'react-router-dom'


const PrivateRoute = ({ component: Component, ...rest }) => {
    const { user } = useAppContext();

    return (
        <Route
            {...rest}
            render={(props) => !!user
                ? <Component {...props} />
                : <Redirect to={{ pathname: '/start', state: { from: props.location } }} />
            }
        />
    )           
}

const PublicRoute = ({ component: Component, ...rest }) => {
    const { user } = useAppContext();
    
    return (
        <Route
            {...rest}
            render={(props) => !user
                ? <Component {...props} />
                : <Redirect to='/creator/main' />
            }
        />
    )
}

export { PrivateRoute, PublicRoute };