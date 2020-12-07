import React from "react";
import "./RadioLabel.css";

/*
 * Struggled with different variants of "custom radio input" but many examples didn't
 * look well and healthy (for me). Eventually I settled for this one:
 *   https://www.w3schools.com/howto/howto_css_custom_checkbox.asp
 *   (with some minor tweaks)
 * 
 * That will have to do for now
 */

const RadioLabel = React.forwardRef(({ name, value, text, checked, onChange, disabled=false }, ref) => {
  return (
    <label className="RadioLabel">
      <input
        ref={ref}
        type="radio"
        value={value}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="RadioLabel-control"></span>
      <span className="RadioLabel-text">{text}</span>
      <br />
    </label>
  );
});

export default RadioLabel;
