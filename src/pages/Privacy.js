import React, { useEffect, useState } from "react";
import { loadMarkdown, headingRenderer, linkRenderer } from "../helpers/markdown";
import ReactMarkdown from "react-markdown";

const Privacy = () => {
  //Actual content comes from the markdown file
  const [content, setContent] = useState("Loading...");
  useEffect(() => {
    loadMarkdown("privacy")
      .then((text) => setContent(text))
      .catch((e) => setContent("```\n" + e.message + "\n```"));
  }, []);

  return (
    <ReactMarkdown children={content} renderers={{ link: linkRenderer, heading: headingRenderer }} />
  );
};

export default Privacy;
