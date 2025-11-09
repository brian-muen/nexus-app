import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!client) {
    return res.status(500).json({ error: 'OPENAI_API_KEY environment variable is not set.' });
  }

  const { text } = (req.body ?? {}) as { text?: string };
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required.' });
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
              You are an academic summarization assistant that writes clear, polished, and grammatically correct assignment summaries.

              Your output must follow this exact structure:
              Overview: <1–2 complete sentences summarizing the assignment purpose and key learning objectives. Use fluent grammar and academic tone.>
              Details:
              • <1–3 bullets highlighting important context, requirements, or themes. Each bullet should be concise and well-phrased.>
              ToDo:
              • <2–5 bullets describing explicit student actions, starting each with a verb (e.g., "Write", "Submit", "Analyze").>

              Guidelines:
              - Always paraphrase instead of quoting.
              - Focus on what the assignment teaches, not just what it asks for.
              - If information is missing, note it naturally (e.g., "No explicit objectives provided.").
              - Keep the summary natural and professional, as if written by a TA in Canvas.
          `,
        },
        { role: 'user', content: text },
      ],
    });

    const summary = response.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ summary });
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ||
      error?.message ||
      'Summarization failed.';
    console.error('[api/summarize] failed', message);
    return res.status(500).json({ error: message });
  }
}


