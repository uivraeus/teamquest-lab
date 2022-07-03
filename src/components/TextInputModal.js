import React, { useEffect, useState } from "react";
import AppBtn from "./AppBtn";
import Modal from "react-modal";

import { ReactComponent as CancelIcon } from "../icons/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../icons/confirmation.svg";

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
  autoComplete,
  hiddenUsernameInputValue,
  onResult,
}) => {
  //Controlled input
  const [value, setValue] = useState("");

  //Visual state of the modal
  const [active, setActive] = useState(false);

  //Ensure input reset if id changes
  useEffect(() => {
    if (id) {
      setValue("");
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
      isOpen={active}
      onRequestClose={onCancel}
      className="ModalDefaults-Content TextInputModal"
    >
      <h4>{label}</h4>
      <form onSubmit={onCommit}>
        <div className="TextInputModal-input-control">
          { hiddenUsernameInputValue ? 
            <input //hidden - just to please password managers
              className="hidden-input"
              type="text" value={hiddenUsernameInputValue} 
              autoComplete="username"
              readOnly>
            </input>
          : null }
          <input
            className="app-input"
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            value={value}
            type={type}
            autoComplete={autoComplete}
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
