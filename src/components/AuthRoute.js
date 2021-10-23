import React, {useEffect} from "react";
import useAppContext from "../hooks/AppContext";
import { Route, Redirect, useHistory } from "react-router-dom";

const privateStartPath = "/creator/main";
const publicStartPath = "/start";
const verifyPath = "/creator/verify";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { user, verifiedAccount } = useAppContext();
  
  //Handle transition away from /verify (i.e. when "skipping") via effect instead
  //of <Redirect> in render function. For some reason the latter always resulted
  //in re-mount of Create, which felt unnecessary.
  const history = useHistory();
  useEffect(()=> {
    if (verifiedAccount && history.location.pathname === verifyPath) {
      history.replace(privateStartPath)
    }
  });

  return (
    <Route
      {...rest}
      render={(props) =>
        !!user ? (
          verifiedAccount ? (
            <Component {...props} />
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
