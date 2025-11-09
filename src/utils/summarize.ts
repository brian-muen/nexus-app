const API_BASE = (typeof window !== 'undefined' ? import.meta.env?.VITE_BACKEND_URL : process.env?.VITE_BACKEND_URL) || 'http://localhost:5174';

export const summarizeText = async (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return 'Overview: No description provided.';
  }

  const response = await fetch(`${API_BASE}/api/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: trimmed }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Summarization request failed.');
  }

  const payload = (await response.json()) as { summary?: string };
  if (!payload.summary) {
    throw new Error('Summarization returned an empty response.');
  }

  return payload.summary;
};
