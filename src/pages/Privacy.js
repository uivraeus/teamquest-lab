import React, { useEffect, useState } from "react";
import { loadMarkdown, linkRenderer } from "../helpers/markdown";
import ReactMarkdown from "react-markdown";

const Privacy = () => {
  //Actual content comes from the markdown file
  const [content, setContent] = useState("Loading...");
  useEffect(() => {
    loadMarkdown("privacy")
      .then((text) => setContent(text))
      .catch((e) => setContent("Error: " + e.message));
  }, []);

  return (
    <ReactMarkdown children={content} renderers={{ link: linkRenderer }} />
  );
};

export default Privacy;
