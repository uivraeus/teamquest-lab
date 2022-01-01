import React, { useEffect, useState } from "react";
import AppBtn from "./AppBtn";
import { Modal } from "react-responsive-modal";

import { ReactComponent as CancelIcon } from "../icons/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../icons/confirmation.svg";

//use default class names and styling, with a few overrides
import "react-responsive-modal/styles.css";
import "./TextInputModal.css";

//id: null -> modal disabled
//onResult: (result) => {}, where "result" is:
// - {id, value:<string> } if user commits input that passed validateFn()
// - {id, value:null } if user canceled
const TextInputModal = ({
  id = null,
  label = "Enter your input",
  validateFn = (value) => value.length > 0,
  type = "text",
  autocomplete,
  hiddenUsernameInputValue,
  onResult,
}) => {
  //Controlled input
  const [value, setValue] = useState("");

  //Visual state of the modal
  const [active, setActive] = useState(false);

  //Ensure input reset if id changes
  useEffect(() => {
    setValue("");
    if (id) {
      setActive(true);
    }
  }, [id]);

  //User commits input
  const onCommit = async (e) => {
    e.preventDefault();
    setActive(false);
    onResult({ id, value });
  };

  const onCancel = (e) => {
    e && e.preventDefault();
    setActive(false);
    setValue("");
    onResult({ id, value: null });
  };

  const confirmDisabled = !validateFn(value);

  return (
    <Modal
      open={active}
      onClose={onCancel}
      closeOnOverlayClick={false}
      center
      classNames={{ modal: "TextInputModal" }}
      onAnimationEnd={() => setValue("")}
      showCloseIcon={false}
    >
      <h4>{label}</h4>
      <form onSubmit={onCommit}>
        <div className="TextInputModal-input-control">
          { hiddenUsernameInputValue ? 
            <input //hidden - just to please password managers
              className="hidden-input"
              type="text" value={hiddenUsernameInputValue} 
              autocomplete="username">
            </input>
          : null }
          <input
            className="app-input"
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            value={value}
            type={type}
            autocomplete={autocomplete}
            name="modal-text-input"
            id={`input-${id}`}
          ></input>
          <AppBtn type="submit" disabled={confirmDisabled}>
            <ConfirmIcon />
          </AppBtn>
          <AppBtn onClick={onCancel}>
            <CancelIcon />
          </AppBtn>
        </div>
      </form>
    </Modal>
  );
};

export default TextInputModal;
