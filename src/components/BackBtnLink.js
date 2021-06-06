import React from "react";
import AppBtn from "../components/AppBtn";
import { Link, useHistory } from "react-router-dom";

import { ReactComponent as BackIcon } from "../icons/left-arrow.svg";

import "./BackBtnLink.css";

/* Conditional rendering of a "back button/link" if the location state has
 * a prevPage field.
 */

const BackBtnLink = ({ separator }) => {
  const history = useHistory();
  const backPage = history.location.state && history.location.state.prevPage;
  if (!backPage) {
    return null;
  }

  const onBack = (e) => {
    e && e.preventDefault();
    history.goBack()
  }
  return (
    <>
      {separator ? <hr className="BackBtnLink-separator"/> : null}
      <div className="BackBtnLink">
        <AppBtn name="navigate-back" onClick={() => onBack()}>
          <BackIcon />
        </AppBtn>
        <p>
          Back to <Link to={""} onClick={onBack}>{backPage}</Link>
        </p>
      </div>
    </>
  );
};

export default BackBtnLink;