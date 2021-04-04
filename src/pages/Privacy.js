import React, { useEffect, useState } from "react";
import { loadMarkdown, headingRenderer, linkRenderer } from "../helpers/markdown";
import ReactMarkdown from "react-markdown";

import '../helpers/Markdown.css';

const Privacy = () => {
  //Actual content comes from the markdown file
  const [content, setContent] = useState("Loading...");
  useEffect(() => {
    loadMarkdown("privacy")
      .then((text) => setContent(text))
      .catch((e) => setContent("```\n" + e.message + "\n```"));
  }, []);

  return (
    <ReactMarkdown className="Markdown" children={content} renderers={{ link: linkRenderer, heading: headingRenderer }} />
  );
};

export default Privacy;
