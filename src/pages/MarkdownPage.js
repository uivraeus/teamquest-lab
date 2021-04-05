import React, { useEffect, useState } from "react";
import { loadMarkdown, headingRenderer, linkRenderer } from "../helpers/markdown";
import ReactMarkdown from "react-markdown";
import { useLocation } from 'react-router-dom';

import './MarkdownPage.css';

//This is a generic (~template) page, for which the entire content is fetched and
//rendered via a markdown file.

const MarkdownPage = ({mdFileName = "undefined"}) => {
  //Actual content comes from the markdown file
  const [content, setContent] = useState(null);
  useEffect(() => {
    loadMarkdown(mdFileName)
      .then((text) => setContent(text))
      .catch((e) => setContent("```\n" + e.message + "\n```"));
  }, [mdFileName]);

  //If the user enters the app here, with a hash (e.g. via bookmark or navigate-back
  //after leaving it), the auto-scrolling in the browser will fail as the HTML has
  //not been rendered yet (the "id" corresponding to the # doesn't exist)
  //NOTE: this fix will fire at every "internal" navigation as well, even though the
  //browser's logic is sufficient in that case. But it it simpler to always run it
  //than to keep track of when it is really required.
  const location = useLocation();
  useEffect(() => {
    if (content && location.hash.startsWith("#")) {
      const id = location.hash.slice(1);
      const element = document.getElementById(id);
      element && element.scrollIntoView();
    }
  }, [location, content]);

  return (
    <ReactMarkdown className="MarkdownPage" children={content ? content : "Loading..."} renderers={{ link: linkRenderer, heading: headingRenderer }} />
  );
};

export default MarkdownPage;
