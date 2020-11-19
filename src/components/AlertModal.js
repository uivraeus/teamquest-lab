import React, { useEffect, useState } from "react";
import AppBtn from "./AppBtn";
import { Modal } from "react-responsive-modal";

import { ReactComponent as WarningIcon } from "../icons/warning.svg";

//use default class names and styling, with a few overrides
import "react-responsive-modal/styles.css";
import "./AlertModal.css";

export const Alert = {
  INFO: "Info",
  WARNING: "Warning",
  ERROR: "Error",
};

const AlertModal = ({ alert, onClose = () => {} }) => {
  //Maintain a local state of the content to show so that it is
  //maintained during the "closing fade-out" (when "alert" is null)
  const [content, setContent] = useState({
    heading: "<Heading>",
    text: "<Question>",
    type: Alert.INFO,
    code: "",
  });
  useEffect(() => {
    //Only update content when a new alert is defined (not removed)
    if (alert) {
      setContent({
        heading: alert.heading || "<Heading>",
        text: alert.text || "<Information>",
        type: alert.type || Alert.INFO,
        code: alert.code || "",
      });
    }
  }, [alert]);

  const alertTypeClass = `AlertModal Alert-${content.type}`;
  return (
    <Modal
      open={!!alert}
      onClose={() => onClose()}
      closeOnOverlayClick={false}
      center
    >
      <div className={alertTypeClass}>
        <div className="Alert-Heading">
          <WarningIcon />
          <h4>{content.heading}</h4>
        </div>
        <p>{content.text}</p>
        {content.code.length ? (
          <div className="Alert-CodeBlock">
            <code>{content.code}</code>
          </div>
        ) : null}
        <AppBtn
          text="OK"
          kind="accent"
          id="acknowledge"
          onClick={() => onClose()}
        />
      </div>
    </Modal>
  );
};

export default AlertModal;
