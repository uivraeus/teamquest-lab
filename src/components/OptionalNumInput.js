import React, { useEffect, useRef, useState } from "react";
import CheckboxLabel from "./CheckboxLabel";

import "./OptionalNumInput.css";

//TBD/TODO: add support for min/max or defaults?
const OptionalNumInput = ({ description="<description>", unitLabel="<unit>", onChange=null, disabled=false } ) => {
  const [value, setValue] = useState(null);
  const inputRef = useRef(null);

  //Only positive (non-zero) numbers are accepted
  const onEdit = (e) => {
    if(!(isNaN(e.target.value) || e.target.value <= 0)) {
      setValue(Number(e.target.value));
    } else {
      setValue("");
    }
  }

  //Treat empty field as a flip (back) to disabled
  const onInputFocusLost = (e) => {
    if (value === "") {
      setValue(null)
    }
  }

  const onFlip = (e) => {
    if (e.target.checked) {
      setValue(1); //hard-coded default (and minimum)
    } else {
      setValue(null);
    }
  }

  //Make sure previous edits are wiped when disabling
  useEffect(() => {
    if (disabled) {
      setValue(null);
    }
  }, [disabled]);

  //Update parent whenever the value changes
  useEffect(()=>{
    if (onChange) {
      if (value) {
        onChange(value);
      } else {
        onChange(null); //also for the empty string case ("")
      }
    }
  }, [onChange, value]);

  //Focus on input
  //(needed for when "enabling" but simpler to do for all value updates)
  useEffect(()=>{
    if (value) {
      inputRef.current && inputRef.current.focus();
    }
  }, [value, unitLabel]);

  //kind of a hack (only keep alphanumeric)
  const idInput = unitLabel.replace(/[^a-z0-9.]+/ig, "");
  
  return (
    <div className="OptionalNumInput">
      <CheckboxLabel
        name={idInput}
        value={value !== null}
        checked={value != null}
        onChange={onFlip}
        text={description}
        disabled={disabled}
      />
      <div className="OptionalNumInput-edit">
        <input
          ref={inputRef}
          type="number"
          min="1"
          value = {value ? value : ""}
          id={idInput}
          onChange={onEdit}
          onBlur={onInputFocusLost}
          disabled={value === null}
        />
        <label htmlFor={idInput}>{unitLabel}</label>
      </div>
    </div>
  );
}

export default OptionalNumInput;

