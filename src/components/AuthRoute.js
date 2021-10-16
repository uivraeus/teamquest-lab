import React from "react";
import useAppContext from "../hooks/AppContext";
import { Route, Redirect } from "react-router-dom";

const privateStartPath = "/creator/main";
const publicStartPath = "/start";
const verifyPath = "/creator/verify";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { user, verifiedAccount } = useAppContext();
  
  return (
    <Route
      {...rest}
      render={(props) =>
        !!user ? (
          verifiedAccount ? (
            props.location.pathname === verifyPath ? (
                <Redirect to={privateStartPath} />
            ) : (
                <Component {...props} />     
            )  
          ) : (
            props.location.pathname === verifyPath ? (
                <Component {...props} />
            ) : (
                <Redirect to={verifyPath} />
            )
          )          
        ) : (
          <Redirect
            to={{ pathname: publicStartPath, state: { from: props.location } }}
          />
        )
      }
    />
  );
};

const PublicRoute = ({ component: Component, ...rest }) => {
  const { user } = useAppContext();

  return (
    <Route
      {...rest}
      render={(props) =>
        !user ? <Component {...props} /> : <Redirect to={privateStartPath} />
      }
    />
  );
};

export { PrivateRoute, PublicRoute };
