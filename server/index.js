import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5174

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

app.use(cors())
app.use(express.json())

const requireClient = (res) => {
  if (!client) {
    res.status(500).json({ error: 'OPENAI_API_KEY not set on the server.' })
    return false
  }
  return true
}

const createChatCompletion = async (messages) => {
  if (!client) throw new Error('Missing OpenAI client')
  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages,
  })
  return response.choices?.[0]?.message?.content ?? ''
}

app.post('/api/chat', async (req, res) => {
  if (!requireClient(res)) return

  const { prompt } = req.body || {}
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' })
  }

  try {
    const summary = await createChatCompletion([
      {
        role: 'system',
        content:
          'You are Nexus, an academic support assistant with an informative, encouraging tone. Provide clear, structured responses and highlight actionable next steps.',
      },
      { role: 'user', content: prompt },
    ])

    res.json({ summary })
  } catch (error) {
    const message = error?.response?.data?.error?.message || error?.message || 'Chat request failed'
    console.error('[server] chat failed', message)
    res.status(500).json({ error: message })
  }
})

app.post('/api/summarize', async (req, res) => {
  if (!requireClient(res)) return

  const { text } = req.body || {}
  if (!text) {
    return res.status(400).json({ error: 'Text is required.' })
  }

  try {
    const summary = await createChatCompletion([
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
     ])
 
     res.json({ summary })
   } catch (error) {
    const message = error?.response?.data?.error?.message || error?.message || 'Summarization failed'
    console.error('[server] summarize failed', message)
    res.status(500).json({ error: message })
   }
 })
 
 app.listen(PORT, () => {
   console.log(`[chatbot-backend] listening on http://localhost:${PORT}`)
 })
