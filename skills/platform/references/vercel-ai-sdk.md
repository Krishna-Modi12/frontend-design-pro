# Vercel AI SDK Reference
# frontend-design-pro-v10 | v1.0.0
# ─────────────────────────────────────────────────────────────────────────────
# AI SDK v4 (ai package) + @ai-sdk/* providers.
# Covers: useChat, useCompletion, streamText, generateText, tool calling,
# streaming UI, RSC streaming, multimodal, structured output.
# ─────────────────────────────────────────────────────────────────────────────

## Installation

```bash
npm install ai @ai-sdk/openai           # OpenAI provider
npm install ai @ai-sdk/anthropic        # Anthropic provider
npm install ai @ai-sdk/google           # Google Gemini provider
```

---

## 1. `useChat` — Chat Interface Hook

The primary hook for building chat UIs. Streams responses, manages history.

### Route handler (server)

```tsx
// app/api/chat/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const maxDuration = 30   // Vercel function timeout (seconds)

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
  })

  return result.toDataStreamResponse()
}
```

### Client component

```tsx
// components/chat.tsx
'use client'
import { useChat } from 'ai/react'
import { useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'

export function Chat() {
  const {
    messages,     // Message[] — full conversation history
    input,        // string — current input value
    handleInputChange,
    handleSubmit,
    isLoading,    // boolean — waiting for stream to complete
    error,        // Error | undefined
    stop,         // () => void — stop streaming
    reload,       // () => void — retry last message
  } = useChat({
    api: '/api/chat',
    onError: (err) => console.error('Chat error:', err),
    onFinish: (message) => {
      // message.content = full AI response after stream completes
    },
  })

  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-[600px] flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)]">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--color-ink-tertiary)]">
            <Bot className="h-10 w-10" />
            <p className="text-sm">How can I help you today?</p>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--color-brand-subtle)] flex items-center justify-center">
                <Bot className="h-4 w-4 text-[var(--color-brand)]" aria-hidden="true" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-[var(--color-brand)] text-white'
                  : 'bg-[var(--color-bg-subtle)] text-[var(--color-ink)]'
              }`}
            >
              {message.content}
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--color-brand)]/20 flex items-center justify-center">
                <User className="h-4 w-4 text-[var(--color-brand)]" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--color-brand-subtle)] flex items-center justify-center">
              <Bot className="h-4 w-4 text-[var(--color-brand)]" aria-hidden="true" />
            </div>
            <div className="bg-[var(--color-bg-subtle)] rounded-2xl px-4 py-3">
              <div className="flex gap-1" aria-label="Assistant is typing">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink-tertiary)] animate-bounce"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div role="alert" className="mx-4 mb-2 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 px-4 py-2 text-sm text-[var(--color-error)] flex justify-between items-center">
          <span>{error.message}</span>
          <button onClick={reload} className="text-xs underline">Retry</button>
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--color-border)] p-3 flex gap-2"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Message…"
          disabled={isLoading}
          aria-label="Chat message"
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] disabled:opacity-50"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="flex-shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-ink-secondary)] hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className="flex-shrink-0 rounded-lg bg-[var(--color-brand)] p-2 text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </form>
    </div>
  )
}
```

### `useChat` options

```tsx
useChat({
  api:              '/api/chat',
  id:               'my-chat',     // persist across remounts
  initialMessages:  [],            // seed conversation
  initialInput:     '',
  body:             { userId },    // extra POST body fields
  headers:          { 'x-custom': 'value' },
  onResponse:       (res) => {},   // called when HTTP response starts
  onFinish:         (msg) => {},   // called when stream completes
  onError:          (err) => {},
  streamProtocol:   'data',        // 'data' (default) | 'text'
  experimental_throttle: 50,       // ms — throttle UI updates (perf)
})
```

---

## 2. `useCompletion` — Single-turn Text Completion

```tsx
'use client'
import { useCompletion } from 'ai/react'

export function EmailImprover() {
  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/improve',
  })

  const [draft, setDraft] = useState('')

  return (
    <div className="space-y-4">
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Paste your email draft…"
        rows={6}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-4 text-sm"
      />
      <button
        onClick={() => complete(draft)}
        disabled={isLoading || !draft}
        className="btn-primary"
      >
        {isLoading ? 'Improving…' : 'Improve with AI'}
      </button>
      {completion && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-2">Improved version</p>
          <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap">{completion}</p>
        </div>
      )}
    </div>
  )
}
```

```tsx
// app/api/improve/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const result = await streamText({
    model: anthropic('claude-opus-4-5'),
    prompt: `Improve this email to be clearer and more professional. Keep the same meaning. Return only the improved email text.\n\n${prompt}`,
  })

  return result.toTextStreamResponse()
}
```

---

## 3. `generateText` — Non-streaming, server-side

```tsx
// lib/ai.ts
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function classifyIntent(message: string): Promise<string> {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `Classify this support message into one of: billing, technical, feature-request, other.
    
Message: "${message}"
    
Respond with only the category name.`,
    maxTokens: 20,
    temperature: 0,
  })
  return text.trim()
}

// Use in Server Action or route handler
export async function handleTicket(formData: FormData) {
  'use server'
  const message = formData.get('message') as string
  const intent = await classifyIntent(message)
  await db.ticket.create({ data: { message, intent } })
}
```

---

## 4. `streamText` — Streaming, server-side

```tsx
// app/api/summarize/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export async function POST(req: Request) {
  const { document } = await req.json()

  const result = await streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: 'You are an expert document summarizer.',
    messages: [
      { role: 'user', content: `Summarize this document in 3 bullet points:\n\n${document}` }
    ],
    maxTokens: 512,
    temperature: 0.3,
    // Callbacks
    onChunk: ({ chunk }) => {
      if (chunk.type === 'text-delta') process.stdout.write(chunk.textDelta)
    },
    onFinish: ({ usage, finishReason }) => {
      console.log(`Tokens used: ${usage.totalTokens}, reason: ${finishReason}`)
    },
  })

  return result.toDataStreamResponse()
}
```

---

## 5. Tool Calling

### Server: define tools with Zod schemas

```tsx
// app/api/agent/route.ts
import { streamText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      searchProducts: tool({
        description: 'Search the product catalog by query and optional category filter',
        parameters: z.object({
          query:    z.string().describe('Search query'),
          category: z.enum(['electronics', 'clothing', 'home', 'all']).optional(),
          limit:    z.number().min(1).max(20).default(5),
        }),
        execute: async ({ query, category, limit }) => {
          const products = await db.product.findMany({
            where: {
              name: { contains: query, mode: 'insensitive' },
              ...(category !== 'all' && category ? { category } : {}),
            },
            take: limit,
          })
          return products
        },
      }),

      getWeather: tool({
        description: 'Get current weather for a location',
        parameters: z.object({
          city:    z.string(),
          country: z.string().length(2).describe('ISO 3166-1 alpha-2 country code'),
        }),
        execute: async ({ city, country }) => {
          const res = await fetch(`https://api.weather.example.com?city=${city}&country=${country}`)
          return res.json()
        },
      }),
    },
    maxSteps: 5,   // allow multi-step tool use (agentic loop)
  })

  return result.toDataStreamResponse()
}
```

### Client: render tool calls and results

```tsx
'use client'
import { useChat } from 'ai/react'

export function AgentChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/agent',
  })

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {/* Text content */}
          {message.content && (
            <p className="text-sm">{message.content}</p>
          )}

          {/* Tool invocations */}
          {message.toolInvocations?.map(toolCall => (
            <div key={toolCall.toolCallId} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3 my-2 text-sm">
              <p className="font-mono text-xs text-[var(--color-ink-tertiary)] mb-1">
                🔧 {toolCall.toolName}
              </p>

              {/* Pending */}
              {'result' in toolCall ? (
                <pre className="text-xs text-[var(--color-ink)] overflow-auto">
                  {JSON.stringify(toolCall.result, null, 2)}
                </pre>
              ) : (
                <p className="text-xs text-[var(--color-ink-tertiary)] animate-pulse">
                  Running…
                </p>
              )}
            </div>
          ))}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  )
}
```

---

## 6. Structured Output (`generateObject`)

```tsx
// lib/extract.ts
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const ContactSchema = z.object({
  name:    z.string(),
  email:   z.string().email().optional(),
  phone:   z.string().optional(),
  company: z.string().optional(),
  intent:  z.enum(['sales', 'support', 'partnership', 'other']),
  urgency: z.enum(['low', 'medium', 'high']),
  summary: z.string().max(200),
})

export async function extractContactInfo(emailText: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: ContactSchema,
    prompt: `Extract contact information and classify intent from this email:\n\n${emailText}`,
  })

  return object   // typed as z.infer<typeof ContactSchema>
}
```

---

## 7. Multimodal (Images + Text)

```tsx
// app/api/vision/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('image') as File
  const question = formData.get('question') as string

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')

  const result = await streamText({
    model: anthropic('claude-opus-4-5'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: base64,
            mimeType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
          },
          {
            type: 'text',
            text: question || 'What do you see in this image?',
          },
        ],
      },
    ],
  })

  return result.toDataStreamResponse()
}
```

```tsx
// components/image-analyzer.tsx — client
'use client'
import { useCompletion } from 'ai/react'
import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'

export function ImageAnalyzer() {
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { complete, completion, isLoading } = useCompletion({ api: '/api/vision' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    const fd = new FormData()
    fd.append('image', file)
    fd.append('question', 'Describe what you see in detail.')

    // useCompletion with FormData — use fetch directly for multipart
    const res = await fetch('/api/vision', { method: 'POST', body: fd })
    // or use a custom streaming approach
  }

  return (
    <form onSubmit={handleSubmit}>
      <label
        className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-border)] p-8 cursor-pointer hover:border-[var(--color-brand)] transition-colors"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-[var(--color-ink-tertiary)]" />
            <span className="text-sm text-[var(--color-ink-secondary)]">Click to upload image</span>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) setPreview(URL.createObjectURL(file))
          }}
        />
      </label>
      <button type="submit" disabled={!preview || isLoading} className="mt-3 btn-primary w-full">
        {isLoading ? 'Analyzing…' : 'Analyze Image'}
      </button>
      {completion && (
        <p className="mt-4 text-sm text-[var(--color-ink)] whitespace-pre-wrap">{completion}</p>
      )}
    </form>
  )
}
```

---

## 8. RSC Streaming with `createStreamableUI`

For streaming React components directly from the server (Next.js App Router):

```tsx
// app/actions/ai-actions.tsx
'use server'

import { createStreamableUI, createStreamableValue } from 'ai/rsc'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function generateReport(topic: string) {
  const ui = createStreamableUI()

  // Start streaming immediately
  ui.update(<div className="animate-pulse text-sm text-[var(--color-ink-tertiary)]">Generating report…</div>)

  // Run async in background
  ;(async () => {
    const result = await streamText({
      model: openai('gpt-4o'),
      prompt: `Write a concise 3-paragraph report about: ${topic}`,
    })

    let text = ''
    for await (const chunk of result.textStream) {
      text += chunk
      ui.update(
        <div className="prose prose-sm max-w-none text-[var(--color-ink)]">
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      )
    }

    ui.done()
  })()

  return ui.value
}
```

```tsx
// components/report-generator.tsx
'use client'
import { useState } from 'react'
import { generateReport } from '@/app/actions/ai-actions'

export function ReportGenerator() {
  const [report, setReport] = useState<React.ReactNode>(null)
  const [loading, setLoading] = useState(false)

  async function handleGenerate(topic: string) {
    setLoading(true)
    const ui = await generateReport(topic)
    setReport(ui)
    setLoading(false)
  }

  return (
    <div>
      <button onClick={() => handleGenerate('renewable energy trends')} disabled={loading}>
        {loading ? 'Starting…' : 'Generate Report'}
      </button>
      {report && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-6">
          {report}
        </div>
      )}
    </div>
  )
}
```

---

## 9. Embedding & RAG Pattern

```tsx
// lib/embeddings.ts
import { embed, embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

// Single embedding
export async function getEmbedding(text: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  })
  return embedding   // number[]
}

// Batch embeddings (cheaper, fewer API calls)
export async function getEmbeddings(texts: string[]) {
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: texts,
  })
  return embeddings  // number[][]
}

// RAG retrieval function
export async function findRelevantDocs(query: string, docs: { content: string; embedding: number[] }[]) {
  const queryEmbedding = await getEmbedding(query)

  // Cosine similarity
  function cosineSim(a: number[], b: number[]) {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
    return dot / (normA * normB)
  }

  return docs
    .map(doc => ({ ...doc, score: cosineSim(queryEmbedding, doc.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
```

---

## 10. Error Handling & Edge Cases

```tsx
// Route handler with proper error handling
export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: openai('gpt-4o'),
      messages,
      // Abort if client disconnects
      abortSignal: req.signal,
    })

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        // Sanitize — never expose internal errors to client
        if (error instanceof Error) {
          if (error.message.includes('rate limit')) return 'Rate limit reached. Please try again.'
          if (error.message.includes('context length')) return 'Conversation too long. Start a new chat.'
        }
        return 'An error occurred. Please try again.'
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

---

## 11. Model Selection Guide

| Task | Recommended model | Why |
|---|---|---|
| Chat (high quality) | `openai('gpt-4o')` | Best instruction following |
| Chat (fast/cheap) | `openai('gpt-4o-mini')` | 10× cheaper, 2× faster |
| Long docs, analysis | `anthropic('claude-opus-4-5')` | 200K context, superior reasoning |
| Fast inference | `anthropic('claude-haiku-4-5-20251001')` | Lowest latency |
| Code generation | `openai('gpt-4o')` | Best for complex code |
| Classification | `openai('gpt-4o-mini')` | Simple tasks, low cost |
| Embeddings | `openai.embedding('text-embedding-3-small')` | Fast, good quality |
| Vision | `anthropic('claude-opus-4-5')` or `openai('gpt-4o')` | Both excellent |

---

## 12. UI Patterns for AI Features

### Streaming text with cursor

```tsx
function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  return (
    <span className="whitespace-pre-wrap">
      {text}
      {isStreaming && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--color-brand)] align-text-bottom"
        />
      )}
    </span>
  )
}
```

### Token counter / context meter

```tsx
function ContextMeter({ used, max }: { used: number; max: number }) {
  const pct = Math.min(used / max, 1)
  const color = pct > 0.9 ? 'var(--color-error)' : pct > 0.7 ? 'var(--color-warning)' : 'var(--color-success)'

  return (
    <div className="flex items-center gap-2 text-xs text-[var(--color-ink-tertiary)]">
      <div className="h-1 w-24 rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </div>
      <span>{used.toLocaleString()} / {max.toLocaleString()} tokens</span>
    </div>
  )
}
```

### Copy message button

```tsx
function MessageActions({ content }: { content: string }) {
  const { copy, copied } = useCopyToClipboard()

  return (
    <button
      onClick={() => copy(content)}
      aria-label={copied ? 'Copied' : 'Copy message'}
      className="rounded p-1 text-[var(--color-ink-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-ink)] transition-[opacity,color]"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}
// Wrap parent with className="group" to show on hover
```
