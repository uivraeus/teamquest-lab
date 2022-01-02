import React, { useEffect, useState } from "react";
import AppBtn from "../components/AppBtn";
import CheckboxLabel from "../components/CheckboxLabel";
import InfoBlock from "../components/InfoBlock";
import TextInputModal from "../components/TextInputModal";
import { fetchAllId } from "../helpers/survey";
import { fetchAllTeamId } from "../helpers/team";
import { confirmPassword, deleteAccountAndData } from "../helpers/user";
import { Link, useHistory } from "react-router-dom";
import useAppContext from "../hooks/AppContext";

import { ReactComponent as TerminateImage } from "../icons/terminate.svg";

import "./TerminateAccount.css";

const TerminateAccount = () => {
  const history = useHistory();
  const { queryConfirm, showAlert, user } = useAppContext();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [terminating, setTerminating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [queryPassword, setQueryPassword] = useState(false);
  
  //No need to subscribe to real-time updates of teams/surveys here. The reason
  //for collecting the summary is just "for information"
  //So, just collect the numbers when user changes (which implies ~"at mount-time")
  useEffect(() => {
    const asyncWrapper = async () => {
      try {
        const teams = await fetchAllTeamId(user);
        const tSurveys = await Promise.all(teams.map((t) => fetchAllId(t)));
        const numSurveys = tSurveys.reduce((acc, s) => acc + s.length, 0);

        setSummary({ numTeams: teams.length, numSurveys });
      } catch (e) {
        setError(e.message);
      }
    };
    asyncWrapper();
  }, [user]);

  useEffect(() => {
    if (error && showAlert) {
      showAlert("Data backend error", error, "Error");
    }
  }, [error, showAlert]);

  const doTerminate = (password) => {
    queryConfirm(
      "Really want to do this?",
      "This operation is final and cannot be undone!",
      (confirmed) => {
        if (confirmed) {
          setTerminating(true);
          deleteAccountAndData(user, password)
            .then((result) => {
              const extraStr =
                summary && summary.numTeams > 0
                  ? " and associated team and survey data deleted"
                  : "";
              showAlert(
                "Account terminated",
                "Your account has been removed" + extraStr
              );
            })
            .catch((err) => {
              showAlert("Data backend error", err.message, "Error");
              history.push("/creator/manage"); // just go somewhere...
            });
        }
      },
      "Continue/Abort"
    );
  };

  const onInitiateTermination = (e) => {
    setQueryPassword(true);
  }

  const onPassword = ({ value }) => {
    setQueryPassword(false);
    if (value.length > 0) {
      confirmPassword(value)
      .then(() => doTerminate(value))
      .catch(() => { 
        showAlert("Authentication error", "Aborting termination of user account", "Info");
        setConfirmed(false);
      })
    }
  }

  //Render helpers
  const numTeamsStr = summary
    ? `${summary.numTeams} team${summary.numTeams === 1 ? "" : "s"}`
    : "";
  const numSurveyStr = summary
    ? `${summary.numSurveys} survey${summary.numSurveys === 1 ? "" : "s"}`
    : "";
  const classNames = "TerminateAccount" + 
    (confirmed ? " TerminateAccount-confirmed" : "") +
    (terminating ? " TerminateAccount-terminating" : ""); 
  
  return (
    <div className={classNames}>
      <TerminateImage />
      <h1>Permanent termination of account</h1>
      {terminating ? (
        <p>Terminating...</p>
      ) : (
        <>
          <h3>Are you certain about this?</h3>
          <p>
            If you terminate your account, all teams and surveys managed by you
            will be deleted and you will not be able to login again.
          </p>
          <p>
            If you want to use this tool in the future you will have to sign up
            for a new account.
          </p>
          <CheckboxLabel
            name="confirm"
            value={confirmed}
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            disabled={!!error || terminating}
            text="Yes, I'm certain"
          />
          <TextInputModal
            id={queryPassword ? "password" : null}
            label="Please re-enter your account password"
            type="password"
            autoComplete="current-password"
            hiddenUsernameInputValue={user.email}
            onResult={onPassword}
            validateFn={(value) => value.length >= 6}
          />
          <h3>Account status</h3>
          {summary ? (
            <>
              <p>
                Your account currently manages {numTeamsStr} and {numSurveyStr}.
              </p>
              {summary.numSurveys > 0 ? (
                <InfoBlock>
                  <p>
                    Do you know that you can transfer ownership of your teams to
                    someone else?
                  </p>
                  <p>
                    This enables continuous tracking of a team's progress
                    regardless of which user that initiates and manages the
                    surveys.
                  </p>
                  <p>
                    Transfers are initiated from the{" "}
                    <Link to="/creator/manage">Manage</Link> section.
                  </p>
                </InfoBlock>
              ) : null}
              <AppBtn
                text="Terminate account"
                disabled={!!error || terminating || !confirmed}
                onClick={onInitiateTermination}
              />
            </>
          ) : (
            <p>Loading...</p>
          )}
        </>
      )}
    </div>
  );
};

export default TerminateAccount;
