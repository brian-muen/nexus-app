// Summarization helper. The OpenAI SDK is only imported when running in a
// server/node environment so that client-side bundles don't attempt to include
// node-only dependencies.
export const summarizeText = async (text: string) => {
  // If running in browser, bail out with a friendly message so the UI doesn't crash.
  if (typeof window !== 'undefined') {
    return "Summarization unavailable in the browser. Configure a server-side proxy or run summarization on the backend.";
  }

  // Dynamically import the OpenAI SDK on the server only.
  // This keeps the client bundle free of server-only dependencies.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Summarize the following assignment clearly and concisely.' },
      { role: 'user', content: text }
    ],
  });

  return response.choices?.[0].message?.content ?? '';
};