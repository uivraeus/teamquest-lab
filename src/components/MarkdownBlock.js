import React, { useEffect, useState } from "react";
import { loadMarkdown, MdLink, MdHeading, MdBlockquote } from "../helpers/markdown";
import ReactMarkdown from "react-markdown";

import './MarkdownBlock.css';

//This is a generic (~template) component, for which the entire content is fetched and
//rendered via a markdown file.

const MarkdownBlock = ({mdFileName = "undefined", onLoaded=null}) => {
  //Actual content comes from the markdown file
  const [content, setContent] = useState(null);
  useEffect(() => {
    //avoid confusing scroll-pos after changing "page"
    //(keeping the old content would avoid a "white flash" but any "scroll-to-top"
    //is hard to get synchronized to the exact content switch)
    setContent(null);
    
    loadMarkdown(mdFileName)
      .then((text) => {
        setContent(text)
        if (onLoaded) {
          onLoaded(mdFileName);
        }
      })
      .catch((e) => setContent("```\n" + e.message + "\n```"));
  }, [mdFileName, onLoaded]);

  
  //No "loading" indicator for now...
  return (
    <ReactMarkdown 
      className="MarkdownBlock"
      children={content ? content : ""} 
      components={{
        a: MdLink,
        h1: MdHeading,
        h2: MdHeading,
        h3: MdHeading,
        h4: MdHeading,
        h5: MdHeading,
        h6: MdHeading,
        blockquote: MdBlockquote
      }} />
  );
};

export default MarkdownBlock;
