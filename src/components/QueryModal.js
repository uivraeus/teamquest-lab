import React, { useEffect, useState } from 'react';
import AppBtn from "./AppBtn";
import { Modal } from 'react-responsive-modal'

//use default class names and styling, with a few overrides
import 'react-responsive-modal/styles.css'
import './QueryModal.css'


//First option in each pair corresponds to resultCb(true), the second "false"
export const Query = {
  YES_NO: 'Yes/No',
  CONFIRM_CANCEL : 'Confirm/Cancel',
  CONTINUE_ABORT : 'Continue/Abort'
};

const QueryModal = ({ query, onClose = () => {} }) => {

  //Maintain a local state of the content to show so that it is
  //maintained during the "closing fade-out" (when "query" is null)
  const [content, setContent] = useState({
    heading: "<Heading>",
    text: "<Question>",
    type: Query.YES_NO  
  });
  useEffect(() => {
    //Only update content when a new query is defined (not removed)
    if (query) {
      setContent({
        heading: query.heading || "<Heading>",
        text: query.text || "<Question>",
        type: query.type || Query.YES_NO
      });
    }
  }, [query]);

  const positiveText = content.type.split("/")[0];
  const negativeText = content.type.split("/")[1];
  
  //Handle response by invoking the result-callback and closing
  const onResponse = (positive) => {
    query && query.resultCb && query.resultCb(positive);
    onClose();
  }
  return (
    <Modal open={!!query} onClose={() => onResponse(false)} closeOnOverlayClick={false} center>
      <div className="QueryModal">
        <h3>{content.heading}</h3>
        <p>{content.text}</p>
        <AppBtn
              text={positiveText}
              kind="accent"
              id="positive"
              onClick={() => onResponse(true)}
        />
        <AppBtn
              text={negativeText}
              id="negative"
              onClick={() => onResponse(false)}
        />
      </div>
    </Modal>
  );
};

export default QueryModal;