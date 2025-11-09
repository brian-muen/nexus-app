import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Wand2, Loader2, AlertCircle } from 'lucide-react'
import useAssignments from '@/hooks/useAssignments'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const formatTimestamp = (date: Date) =>
  date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

const createPrompt = (messages: ChatMessage[], context: string) => {
  const history = messages
    .map((message) => `${message.role === 'user' ? 'Student' : 'Advisor'}: ${message.content}`)
    .join('\n')

  return `You are Nexus, an informed academic assistant for university students. You provide concise, practical guidance in a professional yet friendly tone. You have access to the following assignment context:\n\n${context}\n\nConversation so far:\n${history}\n\nRespond to the student in the same tone. Avoid restating the entire context—focus on the key next actions or clarifications.`
}

export default function Chatbot() {
  const { assignments } = useAssignments()
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: crypto.randomUUID(),
    role: 'assistant',
    content: 'Hi! I’m Nexus. Share a question or assignment you’re working on, and I’ll help you map the next steps.',
    timestamp: formatTimestamp(new Date()),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const context = useMemo(() => {
    const upcoming = [...assignments]
      .filter((assignment) => assignment.dueDate)
      .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime())
      .slice(0, 5)

    if (upcoming.length === 0) {
      return 'No assignments with due dates available.'
    }

    return upcoming
      .map((assignment, index) => {
        const due = assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'No due date'
        const course = assignment.raw?.course?.code ?? assignment.raw?.course?.name ?? 'Unknown course'
        return `${index + 1}. ${assignment.name} (${course}) — due ${due}`
      })
      .join('\n')
  }, [assignments])
  const apiBase = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:5174'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: formatTimestamp(new Date()),
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const prompt = createPrompt([...messages, userMessage], context)
      const { summary } = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text())
        }
        return response.json()
      })

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: summary ?? 'I’m here to help—could you try rephrasing the question?',
        timestamp: formatTimestamp(new Date()),
      }

      setMessages((current) => [...current, assistantMessage])
    } catch (caughtError) {
      console.error('[chatbot] failed to call assistant', caughtError)
      setError('Something went wrong reaching the assistant. Please try again shortly.')
    } finally {
      setLoading(false)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="chatbot">
      <header className="chatbot-header">
        <div className="chatbot-header-meta">
          <span className="chatbot-pill">Nexus Assistant</span>
          <h1>Ask questions, get unstuck</h1>
          <p>
            Your academic co-pilot for Canvas and beyond. The assistant knows your upcoming deadlines and keeps answers grounded, clear, and actionable.
          </p>
        </div>
      </header>

      <section className="chatbot-body">
        <div className="chatbot-thread">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chatbot-bubble ${message.role === 'assistant' ? 'assistant' : 'user'}`}
            >
              <div className="chatbot-bubble-meta">
                <span>{message.role === 'assistant' ? 'Nexus' : 'You'}</span>
                <time>{message.timestamp}</time>
              </div>
              <p>{message.content}</p>
            </div>
          ))}
          {loading && (
            <div className="chatbot-bubble assistant typing">
              <div className="chatbot-bubble-meta">
                <span>Nexus</span>
                <time>typing…</time>
              </div>
              <div className="chatbot-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          {error && (
            <div className="chatbot-error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chatbot-input" onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about an assignment, concept, or next steps…"
            aria-label="Chat input"
            rows={2}
          />
          <button type="submit" className="chatbot-send" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            <span>{loading ? 'Thinking…' : 'Send'}</span>
          </button>
        </form>
      </section>
    </div>
  )
}
