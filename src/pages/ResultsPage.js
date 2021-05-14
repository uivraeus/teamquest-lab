import React from "react";
import SurveyResults from "../components/SurveyResults";
import { useParams } from "react-router-dom";

import './ResultsPage.css';

const ResultsPage = () => {
  const { teamId } = useParams();
  
  return (
    <SurveyResults teamId={teamId} />
  );
};

export default ResultsPage;
