import React, { useEffect, useState } from 'react';
import AppBtn from './AppBtn';
import CheckboxLabel from './CheckboxLabel';
import OptionalNumInput from './OptionalNumInput';
import useAppContext from "../hooks/AppContext";
import { addResponders, CompLev, markCompleted, setClosingTime } from "../helpers/survey";
import { Modal } from "react-responsive-modal";

//use default class names and styling, with a few overrides
import "react-responsive-modal/styles.css";
import "./SurveyEditModal.css";

const SurveyEditModal = ({ meta, onClose }) => {
  //The editable attributes
  const [complete, setComplete] = useState(false);
  const [hours, setHours] = useState(null);
  const [addResp, setAddResp] = useState(null);

  //Modal's state (based on "meta" prop)
  const [editMeta, setEditMeta] = useState(null);
  const [editing, setEditing] = useState(false);

  const { showAlert } = useAppContext();

  const onClosing = (...args) => {
    setEditing(false); //prevent further updates
    onClose();
  };

  useEffect(() => {
    if (!meta) {
      setComplete(false);
      //"hours" and "addResp" are managed via OptionalNumInputs, which will re-mount.
    }

    setEditMeta(meta);
    if (meta) {
      setEditing(true);
    }
  
  }, [meta]);

  useEffect(() => {
    if (editMeta && meta && editMeta.id !== meta.id) {
      //Weird misuse case? Suddenly we're editing a different survey -> bail out
      setEditing(false);
      setEditMeta(null);
      showAlert("Change of survey state", "Aborting edit due to unexpected change of survey state","Warning");
    }
    //TODO: add detection of concurrent edit or other "critical" meta update
  }, [meta, editMeta, showAlert]);
  
  const onApply = async () => {
    if (editing) {
      setEditing(false);
      if (editMeta) {
        try {
          if (complete) {
            await markCompleted(editMeta.id);
          } else {
            if (hours) {
              await setClosingTime(editMeta.id, editMeta.createTime, hours);
            }
            if (addResp) {
              await addResponders(editMeta.id, addResp);
            }
          }
        } catch (e) {
          console.log(e);
        }        
      }
      onClosing();
    }
  };

  const onCancel = () => {
    onClosing();
  };

  //Actual rendering
  const dateStr = editMeta ? new Date(editMeta.createTime).toLocaleDateString() : "";
  const anyChange = !!complete || !!hours || !!addResp;
  const allowComplete = editMeta && editMeta.compLev === CompLev.SOME;
  return (
    <Modal
      open={!!editMeta}
      onClose={onClosing}
      closeOnOverlayClick={false}
      center
      classNames={{ modal: "SurveyEditModal" }}
    >
      <h3>Edit survey: {dateStr}</h3>
      <CheckboxLabel
        name="complete"
        value={complete}
        checked={complete}
        onChange={(e) => setComplete(e.target.checked)}
        disabled={!allowComplete}
        text="Mark the survey as completed"
      />
      <fieldset className="SurveyEditModal-attributes" disabled={complete}>
        <legend>Possible updates</legend>
        <OptionalNumInput
          description = "Update remaining time"
          unitLabel = "hours (from now)"
          onChange = {(value) => setHours(value)}
          disabled = {complete}
        />
        <OptionalNumInput
          description = "Allow for more responders"
          unitLabel = "additional responders"
          onChange = {(value) => setAddResp(value)}
          disabled = {complete}
        />
      </fieldset>
      <div className="SurveyEditModal-control">
        <AppBtn
          text="Apply"
          kind="accent"
          id="apply"
          disabled={!anyChange || !editing}
          onClick={onApply}
        />
        <AppBtn
          text="Cancel"
          id="cancel"
          disabled={!editing}
          onClick={onCancel}
        />
      </div>      
    </Modal>
  );
}

export default SurveyEditModal;