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

  const { prompt } = (req.body ?? {}) as { prompt?: string };
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are Nexus, an academic support assistant with an informative, encouraging tone. Provide clear, structured responses and highlight actionable next steps.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const summary = response.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ summary });
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ||
      error?.message ||
      'Chat request failed.';
    console.error('[api/chat] failed', message);
    return res.status(500).json({ error: message });
  }
}


