import React from "react";
import AppBtn from "./AppBtn";

import "./ErrorFallback.css";

const ErrorFallback = () => {
  
  return (
    <div className="ErrorFallback">
      <p>Sorry for this mess 😟 </p>
      <p><i>(very embarrassing)</i></p>
      <br/>
      <AppBtn 
        id="reload"
        text="Reload application"
        onClick={()=>window.location=window.origin}
      />
    </div>
  );
}

export default ErrorFallback;