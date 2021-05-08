import React, { useEffect } from "react";
import ControlledSelect from "./ControlledSelect";
import { useHistory, useRouteMatch } from "react-router-dom";

/* Generic select-component which keeps track of the current selection via a route
 * parameter, as defined for react-router's "Route". The set of available options
 * to select between is specified via an array of "option" objects.
 * The parent must provide the key names for an "ID" and a "Text" field in the
 * option objects (The text is what shows up in the select)
 * 
 * The parent can specify and "auto select"; i.e. a text that, if present among
 * the options, it will always be selected (enforced)
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
 *      -> the route will change (push:ed) to /my/route/to/page/1000
 *      -> if provided, the parent's onSelected will be called with the selected option, i.e. 
 *         {id: 1234, text: "Another option"}
 *          
 */

//Derive base part of current rout (just crop from "/:" to the end)
const getBasePath = (routeMatch) => routeMatch.path.replace(/\/:.+/, "");

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
  const history = useHistory();
  const routeMatch = useRouteMatch();

  //Validate the route's "id part" against the available options and notify parent on the outcome
  useEffect(() => {
    //Don't make any decisions before the options are known
    if (options) {
      //Only support 0 or 1 parameter
      const paramValues = Object.values(routeMatch.params);
      if (paramValues.length === 1) {
        //something selected, ensure that it corresponds to one of the options
        const routeId = paramValues[0];
        const option = options.find(o => o[idKey] === routeId) || null;
        if (option) {
          //Notify parent on current selection.
          onSelected(option)
        } else {
          //Either the user has entered an invalid URL explicitly, or the
          //team that was selected got deleted.
          //console.log("Invalid ID parameter in URL:", routeId);
          history.replace(`${getBasePath(routeMatch)}`);
        }
      } else {
        //nothing selected (yet)
        if (options.length === 1) {
          //Only one option available, auto-select it */
          history.replace(`${getBasePath(routeMatch)}/${options[0][idKey]}`);
        } else {
          //Ensure that the parent know that nothing is selected
          onSelected(null);
        }
      }
    }
  }, [routeMatch, options, idKey, history, onSelected]);


  // Manage auto selection; treat as a "hint", i.e. don't treat a mismatch w.r.t.
  // available options as an error (typical use case: new item created but not
  // yet available among the options)
  useEffect(() => {
    if (options && autoSelectText) {
      //Is there a matching option?
      const option = options.find(o => o[textKey] === autoSelectText) || null;
      if (option) {
        //Is it not selected yet?
        const paramValues = Object.values(routeMatch.params);
        const selectedId = (paramValues.length === 1) ? paramValues[0] : null;
        if (selectedId && (option[idKey] !== selectedId)) {
          //Select it
          history.push(`${getBasePath(routeMatch)}/${option[idKey]}`)
        }
      }
    }
  }, [routeMatch, options, idKey, textKey, history, autoSelectText]);

  //Only show the select when there is something to select
  if (options.length === 0) {
    return null;
  }
  
  const values = Object.values(routeMatch.params);
  const routeId = values.length === 1 ? values[0] : null;
  return (
    <ControlledSelect
      elementId={elementId}
      defaultText="- select -"
      options={options ? options.map(o => ({ id: o[idKey], text: o[textKey] })) : []}
      onSelected={id => history.push(`${getBasePath(routeMatch)}/${id}`)}
      selectedId={routeId}
    />
  );
}

export default RouteSelect;