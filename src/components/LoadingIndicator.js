import React, { useEffect, useState } from "react";

import "./LoadingIndicator.css";

const LoadingIndicator = ({ text="Loading" }) => {
  const [visible, setVisible] = useState(false);

  //Delay the loading indicator a bit (for rapid loading it's just annoying)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const className = "LoadingIndicator" + (visible ? " visible" : "");
  return (
    <div className={className}>
      <p><i>{text}...</i></p>
    </div>
  );
}

export default LoadingIndicator;