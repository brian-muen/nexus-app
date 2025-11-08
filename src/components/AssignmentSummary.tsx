import React, { useEffect, useState } from "react";
import { summarizeText } from "../utils/summarize";

interface AssignmentSummaryProps {
  description: string;
}

const AssignmentSummary: React.FC<AssignmentSummaryProps> = ({ description }) => {
  const [summary, setSummary] = useState<string>("");

  useEffect(() => {
    const fetchSummary = async () => {
      const result = await summarizeText(description);
      setSummary(result);
    };
    fetchSummary();
  }, [description]);

  return <p>{summary || "Loading summary..."}</p>;
};

export default AssignmentSummary;
