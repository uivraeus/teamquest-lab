import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { loadMarkdown, MdLink, MdHeading, MdBlockquote } from "../helpers/markdown";
import ReactMarkdown from "react-markdown";

import './MarkdownBlock.css';

//This is a generic (~template) component, for which the entire content is fetched and
//rendered via a markdown file.

const MarkdownBlock = ({mdFileName = "undefined", onLoaded=null}) => {
  //Actual content comes from the markdown file
  const [content, setContent] = useState(null);

  //When switching content (loading a new md-file), the "natural" height will be 0 during
  //the transition. This may (often) result in an overall page height small enough to make
  //the scroll bar disappear for a short while, which implies short periods of "wider"
  //layout area. The net effect is a very unwelcome flickering experience. Avoid that by
  //maintaining the height of the old content until the new is loaded.
  const blockRef = useRef();
  useLayoutEffect(() => {
    if (content) {
      //Forget the previous content's height
      blockRef.current.style.setProperty('--prev-content-height', "0px");
    }
  }, [content])

  useEffect(() => {
    //Remember the old content's height for min-height styling during the transition
    blockRef.current.style.setProperty('--prev-content-height', blockRef.current.clientHeight + "px");
    setContent(null);

    let abort = false;
    loadMarkdown(mdFileName)
      .then((text) => {
        if (!abort) {
          setContent(text)
          onLoaded && onLoaded(mdFileName);
        }
      })
      .catch((e) => {
        if (!abort) {
          setContent("```\n" + e.message + "\n```")
          //indicate completed but failed loading
          onLoaded && onLoaded(e);
        }
      });
    
    return () => {
      abort = true;
      onLoaded && onLoaded(null);
    }
  }, [mdFileName, onLoaded]);

  
  //No "loading" indicator for now...
  return (
    <div ref={blockRef} className="MarkdownBlock">
      <ReactMarkdown
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
    </div>
  );
};

export default MarkdownBlock;
