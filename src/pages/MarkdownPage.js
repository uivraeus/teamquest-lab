import React, { useEffect, useState } from "react";
import LoadingIndicator from "../components/LoadingIndicator";
import MarkdownBlock from "../components/MarkdownBlock";
import { useLocation } from 'react-router-dom';

import './MarkdownPage.css';

//This is a generic (~template) page, for which the entire content is fetched and
//rendered via a markdown file.

const MarkdownPage = ({mdFileName}) => {
  //If the user enters the app here, with a hash (e.g. via bookmark or navigate-back
  //after leaving it), the auto-scrolling in the browser will fail as the HTML has
  //not been rendered yet (the "id" corresponding to the # doesn't exist)
  //NOTE: this fix will fire at every "internal" navigation as well, even though the
  //browser's logic is sufficient in that case. But it it simpler to always run it
  //than to keep track of when it is really required.
  const [loaded, setLoaded] = useState(null);
  const location = useLocation();
  useEffect(() => {
    if (loaded && loaded === mdFileName && location.hash.startsWith("#")) {
      const id = location.hash.slice(1);
      const element = document.getElementById(id);
      element && element.scrollIntoView();
    }
  }, [mdFileName, location, loaded]);

  return (
    <>
      {!loaded ? <LoadingIndicator /> : null }
      <MarkdownBlock mdFileName={mdFileName} onLoaded={setLoaded} />
    </>
  );
};

export default MarkdownPage;
