import React from "react"

import './ControlledSelect.css'

const ControlledSelect = ({ elementId = "options-select", defaultText = "Select one", options = [], selectedId = null, onSelected = () => { } }) => {

  const onInput = (e) => {
    onSelected(e.target.value);
  }

  return (
    <>
    <div className="ControlledSelect">
      <select id={elementId} value={selectedId || ""} onInput={onInput}>
        {true ?
          <option value="" disabled hidden>
            {defaultText}
          </option>
          : null}
        {options.map(({ id, text }) => (
          <option key={id} value={id}>
            {text}
          </option>
        ))}
      </select>
    </div>
    </>
  );
}

export default ControlledSelect;