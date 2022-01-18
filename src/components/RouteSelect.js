import React, { useEffect } from "react";
import ControlledSelect from "./ControlledSelect";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/* Generic select-component which keeps track of the current selection via a route
 * parameter, as defined for react-router's "Route". The set of available options
 * to select between is specified via an array of "option" objects.
 * The parent must provide the key names for an "ID" and a "Text" field in the
 * option objects (The text is what shows up in the select)
 * 
 * The parent can specify an "auto select"; i.e. a text that, if present among
 * the options, it will always be selected (enforced)
 * 
 * Any history state set externally for the current route will be preserved through
 * any history-replace operations triggered by this component. 
 *
 * Constraints:
 * - Only one param can exist in the URL to signify the ID of the selected item
 * - Matching path must be defined with ":<id-name>"
 *   
 * Example: 
 *   url:                 /my/route/to/page/1234
 *   matching Route path: /my/route/to/page/:pageId
 *   options-array      : [{id: 1000, text: "One option"}, {id: 1234, text: "Another option"}]
 *   -> the select will show the text corresponding to id=1234 ("Another option")
 *   -> the user can change selection to "One option"
 *      -> the route will change (replaced:ed) to /my/route/to/page/1000
 *      -> if provided, the parent's onSelected will be called with the selected option, i.e. 
 *         {id: 1000, text: "One option"}
 *          
 */

// Based on current location, extract parameter part and base-part (without it)
// Route composition with RR6 may result in additional "param" for sub-routes
// (e.g. "*" for everything under creator/*")
// Skip those and extract the value of the one indicated by (e.g.) ":id" in the
// Route path (if it exists, return null otherwise)
const getBasePathAndParamValue = (location, params) => {
  const paramsArray = Object.entries(params).filter(([key, value]) => !key.includes("*"));
  let paramValue = null;
  let basePath = location.pathname;
  if (paramsArray.length === 1) {
    paramValue = paramsArray[0][1];
    basePath = basePath.replace(`/${paramValue}`, "");
  }
  return [basePath, paramValue];  
}

const dummyOnSelected = () => { };

//Really recommended to apply useCallback for the onSelected prop
const RouteSelect = ({
  options,
  idKey = "id",
  textKey = "text",
  elementId = "options-select",
  autoSelectText = null,
  onSelected = dummyOnSelected
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [basePath, routeId] = getBasePathAndParamValue(location, params);
  
  //Validate the route's "id part" against the available options and notify parent on the outcome
  useEffect(() => {
    //Don't make any decisions before the options are known
    if (options) {
      if (routeId) {
        //something selected, ensure that it corresponds to one of the options
        const option = options.find(o => o[idKey] === routeId) || null;
        if (option) {
          //Notify parent on current selection (might not be a "change").
          onSelected(option)
        } else {
          //Either the user has entered an invalid URL explicitly, or the
          //team that was selected got deleted.
          //console.log("Invalid ID parameter in URL:", routeId);
          navigate(basePath, {replace: true, state: location.state});
        }
      } else {
        //nothing selected (yet)
        if (options.length === 1) {
          //Only one option available, auto-select it */
          navigate(`${basePath}/${options[0][idKey]}`, { replace: true, state: location.state });
        } else {
          //Ensure that the parent know that nothing is selected
          onSelected(null);
        }
      }
    }
  }, [routeId, basePath, options, idKey, location, navigate, onSelected]);


  // Manage auto selection; treat as a "hint", i.e. don't treat a mismatch w.r.t.
  // available options as an error (typical use case: new item created but not
  // yet available among the options)
  useEffect(() => {
    if (options && autoSelectText) {
      //Is there a matching option?
      const option = options.find(o => o[textKey] === autoSelectText) || null;
      if (option) {
        //Is it not selected yet?
        if (option[idKey] !== routeId) {
          //Select it
          navigate(`${basePath}/${option[idKey]}`, { replace: true, state: location.state })
        }
      }
    }
  }, [routeId, basePath, options, idKey, textKey, location, navigate, autoSelectText]);

  //Only show the select when there is something to select
  if (options.length === 0) {
    return null;
  }
  
  return (
    <ControlledSelect
      elementId={elementId}
      defaultText="- select -"
      options={options ? options.map(o => ({ id: o[idKey], text: o[textKey] })) : []}
      onSelected={id => navigate(`${basePath}/${id}`, { replace: true, state: location.state })}
      selectedId={routeId}
    />
  );
}

export default RouteSelect;