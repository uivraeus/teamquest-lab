import AppBtn from "../components/AppBtn";
import { Link, useNavigate } from "react-router-dom";

import './BtnLinkItem.css';

const BtnLinkItem = ({ destPath, historyState=null, Icon, textBefore="", textLink, textAfter="", disabled=false }) => {
  const navigate = useNavigate();
  
  const className = "BtnLinkItem" + (disabled ? " BtnLinkItem-disabled" : "");
  return (
    <div className={className}>
      <AppBtn onClick={() => navigate(destPath, { state: historyState })} disabled={disabled}>
        <Icon />
      </AppBtn>
      <p>
        {textBefore.length ? `${textBefore} `: ""}
        {disabled ? textLink : <Link to={destPath} state={historyState}>{textLink}</Link>}
        {textAfter.length ? ` ${textAfter}`: ""} 
      </p>
    </div>
  )
}

export default BtnLinkItem;