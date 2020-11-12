import React, { useRef, useImperativeHandle } from "react";

import "./AppBtn.css";

/**
 * This component exists just because I want ot "inject" a blur() call
 * after clicks. As a bonus, I think the styling of the buttons also found
 * a better home compared to before.
 * However, the "tricky" part is how to use a "ref" here (for blur) and
 * at the same time offer the parent to keep a ref, via forwardRef() usage.
 * Different articles list different options (depending on actual needs)
 * and React might change in the future which renders all this useless.
 * But this is what I read (I settled for the first one in the list):
 * - https://reactjs.org/docs/hooks-reference.html#useimperativehandle
 * - https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
 * - https://github.com/gregberge/react-merge-refs
 */

const AppBtn = React.forwardRef(({ text, children, kind, type, name, id, role, disabled, onClick }, ref) => {
  //[https://reactjs.org/docs/hooks-reference.html#useimperativehandle]
  //I.e. only "export" focus() and _my own_ isActiveElement()
  const internalRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      internalRef.current.focus(); // TBD... Risk of accessing undefined?
    },
    isActiveElement: () => {
      return internalRef.current === document.activeElement;
    }
  }));

  //Internal click handle that will "un-focus" the button
  //TODO: even more tricks?
  const clickWrapper = (e) => {
    if (internalRef && internalRef.current) {
      internalRef.current.blur();
    }
    //Forward the actual processing for this click
    if (onClick) {
      onClick(e);
    }
  };

  let classes = "AppBtn";
  if (kind) classes += ` AppBtn-${kind}`;
  if (children) classes += " AppBtn-svg"; //only child type supported here
  return (
    <button
      ref={internalRef}
      className={classes}
      type={type ? type : "button"}
      name={name ? name : null}
      id={id ? id: null}
      role={role ? role : null}
      disabled={disabled ? disabled : null}
      onClick={clickWrapper}
    >
      {text ? text : children ? children : "AppBtn"}
    </button>
  );
});

export default AppBtn;
