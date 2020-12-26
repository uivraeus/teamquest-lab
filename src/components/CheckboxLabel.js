import React from "react";
import "./CheckboxLabel.css";

/* Styled checkbox (with associated label)
 * - Why are some of the most basic needs not met by "the standard"?
 * Took a lot of inspiration from:
 *   https://moderncss.dev/pure-css-custom-checkbox-style/
 * But, also made a few changes and trade-offs
 */

const CheckboxLabel = React.forwardRef(
  ({ name, value, text, checked, onChange, disabled = false }, ref) => {
    const labelClassName = "CheckboxLabel" +
      (disabled ? " CheckboxLabel-disabled" : "");
    return (
      <label className={labelClassName}>
        <span className="CheckboxLabel-input">
          <input
            ref={ref}
            type="checkbox"
            value={value}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
          />
          <span className="CheckboxLabel-control">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                d="M1.73 12.91l6.37 6.37L22.79 4.59"
              />
            </svg>
          </span>
        </span>
        <span>{text}</span>
      </label>
    );
  }
);

export default CheckboxLabel;
