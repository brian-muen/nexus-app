import React, { useEffect, useState } from "react";
import { summarizeText } from "../utils/summarize";

interface AssignmentSummaryProps {
  description: string;
}

type SummaryState = "idle" | "loading" | "ready" | "error";

const AssignmentSummary: React.FC<AssignmentSummaryProps> = ({ description }) => {
  const [summary, setSummary] = useState<string>("");
  const [status, setStatus] = useState<SummaryState>("idle");

  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      if (!description?.trim()) {
        setSummary("No description provided.");
        setStatus("ready");
        return;
      }

      setStatus("loading");
      try {
        const result = await summarizeText(description);
        if (!cancelled) {
          setSummary(result);
          setStatus("ready");
        }
      } catch (err: any) {
        if (!cancelled) {
          setStatus("error");
          setSummary(err?.message ?? "We couldn’t summarize this description.");
        }
      }
    };

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, [description]);

  if (status === "loading") {
    return <div className="assignment-summary"><span className="summary-muted">Summarizing…</span></div>;
  }

  if (status === "error") {
    return <div className="assignment-summary"><span className="summary-error">{summary}</span></div>;
  }

  const lines = summary.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const bullets = lines.filter((line) => line.startsWith("• "));
  const body = lines.filter((line) => !line.startsWith("• "));

  return (
    <div className="assignment-summary">
      {body.length > 0 && body.map((line, index) => (
        <p key={`summary-line-${index}`} className="summary-text">
          {line}
        </p>
      ))}
      {bullets.length > 0 && (
        <ul className="summary-list">
          {bullets.map((line, index) => (
            <li key={`summary-bullet-${index}`}>{line.replace(/^•\s*/, "")}</li>
          ))}
        </ul>
      )}
      {lines.length === 0 && <span className="summary-muted">No summary available.</span>}
    </div>
  );
};

export default AssignmentSummary;
