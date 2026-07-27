// EXAMPLE: Reference-quality AI Chat UI
// Intent: CREATE_COMPONENT · Product: ai-assistant · Dials: DV=4 MI=4 VD=7
// Key principles:
//   • Simulated useChat hook (Vercel AI SDK pattern) with streaming state
//   • Stop/abort button during streaming
//   • Example prompt quick-start buttons
//   • Auto-scroll to latest message via useRef + scrollIntoView
//   • Message history with timestamps and role distinction
//   • OKLCH colors, Manrope font, dark mode, prefers-reduced-motion

import { useState, useEffect, useRef, useCallback } from "react";

// @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap')

// Simulated useChat hook — mirrors Vercel AI SDK's ai/react interface
export type ChatRole = "user" | "assistant"
export interface ChatMessage { id: string; role: ChatRole; content: string; timestamp: Date; isStreaming?: boolean; aborted?: boolean }

function useChat({ initialMessages = [] }: { initialMessages?: ChatMessage[] } = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const MOCK_RESPONSES = {
    default: [
      "That's an interesting angle. When I look at the architecture here, the key bottleneck is likely the N+1 query pattern in your data layer — each list item fires a separate DB call. Batching with DataLoader would cut latency by roughly 73.4% based on similar workloads with 1,200+ records.",
      "The component re-renders on every keystroke because `filteredItems` is recalculated inline. Moving it into a `useMemo` with the right dependency array should drop your render count from 847ms to under 60ms.",
      "For the TypeScript migration path, I'd start with `allowJs: true` and `checkJs: true` in tsconfig — that gives you incremental safety without rewriting everything at once. Your `utils/` folder looks like the highest-value target first.",
    ],
    design: [
      "Your current contrast ratio between the card text and background is 3.2:1 — that fails WCAG AA (needs 4.5:1 minimum). Shifting the body text from slate-400 to slate-600 gets you to 6.8:1 without changing the visual weight significantly.",
      "The spacing rhythm breaks at the `<SidePanel>` boundary — it's using 16px gutters while everything else is on a 24px grid. Standardizing to 24px will make the layout feel more intentional across breakpoints.",
    ],
    business: [
      "Looking at your CAC trend over the last 6 quarters: it's climbing from $42 to $89 while LTV stayed flat at $340. The payback period has stretched from 4.1 months to 9.7 months — that's the real signal worth addressing before scaling ad spend.",
      "The pricing page conversion data suggests the $49/mo plan is cannibalizing your $129/mo tier. Users who see both options together convert to the higher tier 23% less often. A two-option layout (not three) typically improves revenue per visitor.",
    ],
  };

  const getResponse = (userMessage: string) => {
    const lower = userMessage.toLowerCase();
    if (lower.includes("design") || lower.includes("color") || lower.includes("spacing")) {
      return MOCK_RESPONSES.design[Math.floor(Math.random() * MOCK_RESPONSES.design.length)];
    }
    if (lower.includes("revenue") || lower.includes("pricing") || lower.includes("cac") || lower.includes("ltv")) {
      return MOCK_RESPONSES.business[Math.floor(Math.random() * MOCK_RESPONSES.business.length)];
    }
    return MOCK_RESPONSES.default[Math.floor(Math.random() * MOCK_RESPONSES.default.length)];
  };

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Simulate streaming: add assistant message shell, then stream content
      const assistantId = `assistant-${Date.now()}`;
      const fullResponse = getResponse(userMessage.content);

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
      ]);

      let charIndex = 0;
      const streamInterval = setInterval(() => {
        if (controller.signal.aborted) {
          clearInterval(streamInterval);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false, aborted: true } : m
            )
          );
          setIsLoading(false);
          return;
        }

        charIndex += Math.floor(Math.random() * 4) + 2;
        const chunk = fullResponse.slice(0, charIndex);
        const done = charIndex >= fullResponse.length;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: done ? fullResponse : chunk, isStreaming: !done }
              : m
          )
        );

        if (done) {
          clearInterval(streamInterval);
          setIsLoading(false);
        }
      }, 28);
    },
    [input, isLoading]
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  return { messages, input, handleInputChange, handleSubmit, isLoading, error, stop, setInput };
}

// ─── Timestamp formatter ─────────────────────────────────────────────────────
function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Thinking indicator ──────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Assistant is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-[oklch(55%_0.18_255)] animate-bounce"
          style={{ animationDelay: `${i * 140}ms` }}
        />
      ))}
    </span>
  );
}

// ─── Message bubble ──────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <article
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      aria-label={`${isUser ? "You" : "Assistant"} said`}
    >
      {/* Avatar */}
      <div
        className={`size-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-1 ${
          isUser
            ? "bg-[oklch(55%_0.2_255)] text-[oklch(98%_0.01_255)]"
            : "bg-[oklch(72%_0.15_160)] text-[oklch(20%_0.04_255)] dark:text-[oklch(96%_0.02_255)]"
        }`}
        aria-hidden="true"
      >
        {isUser ? "Y" : "AI"}
      </div>

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed transition ${
            isUser
              ? "bg-[oklch(55%_0.2_255)] text-[oklch(98%_0.01_255)] rounded-tr-sm"
              : "bg-[oklch(96%_0.01_255)] dark:bg-[oklch(22%_0.015_255)] text-[oklch(18%_0.02_255)] dark:text-[oklch(92%_0.01_255)] border border-[oklch(88%_0.02_255)] dark:border-[oklch(30%_0.02_255)] rounded-tl-sm"
          }`}
        >
          {message.isStreaming && !message.content ? (
            <ThinkingDots />
          ) : (
            <p>
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse align-middle" aria-hidden="true" />
              )}
            </p>
          )}
          {message.aborted && (
            <p className="mt-1 text-xs opacity-60 italic">[Response stopped]</p>
          )}
        </div>
        <time
          dateTime={message.timestamp?.toISOString()}
          className="text-[10px] text-[oklch(55%_0.02_255)] dark:text-[oklch(60%_0.02_255)] px-1"
        >
          {formatTime(message.timestamp || new Date())}
        </time>
      </div>
    </article>
  );
}

// ─── Example prompts ─────────────────────────────────────────────────────────
const EXAMPLE_PROMPTS = [
  { label: "Debug slow renders", prompt: "My React list component re-renders on every keystroke — how do I profile and fix it?" },
  { label: "Improve color contrast", prompt: "Can you audit my design for WCAG AA color contrast issues and suggest fixes?" },
  { label: "Pricing page strategy", prompt: "Our pricing page has three tiers but conversion is low — what does the data suggest?" },
  { label: "TypeScript migration", prompt: "What's the safest incremental path to migrate a large JavaScript codebase to TypeScript?" },
];
export type Example_promptsItem = (typeof EXAMPLE_PROMPTS)[number]

// ─── Main component ──────────────────────────────────────────────────────────
export default function AIChatUI() {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [showPrompts, setShowPrompts] = useState(true);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, stop, setInput } =
    useChat({
      initialMessages: [
        {
          id: "welcome-1",
          role: "assistant",
          content:
            "Hi — I can help you debug code, review design decisions, or analyze business metrics. What are you working on today?",
          timestamp: new Date(Date.now() - 120_000),
        },
      ],
    });

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Hide example prompts once user sends first message
  useEffect(() => {
    if (messages.some((m) => m.role === "user")) {
      setShowPrompts(false);
    }
  }, [messages]);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setShowPrompts(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <main
      className="flex flex-col min-h-[100dvh] bg-[oklch(97%_0.008_255)] dark:bg-[oklch(12%_0.015_255)] font-[Manrope,system-ui,sans-serif]"
      aria-label="AI Chat interface"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Skip navigation for keyboard users */}
      <a
        href="#chat-input"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[oklch(55%_0.2_255)] focus:text-[oklch(98%_0.01_255)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-[oklch(55%_0.2_255)] text-sm font-medium"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[oklch(88%_0.02_255)] dark:border-[oklch(25%_0.02_255)] bg-[oklch(97%_0.008_255)]/80 dark:bg-[oklch(12%_0.015_255)]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="size-8 rounded-lg bg-[oklch(55%_0.2_255)] flex items-center justify-center"
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8c0 1.54.52 2.96 1.38 4.1L1.5 14.5l2.46-1.37A6.46 6.46 0 0 0 8 14.5c3.59 0 6.5-2.91 6.5-6.5S11.59 1.5 8 1.5z" fill="oklch(98% 0.01 255)" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-[oklch(18%_0.02_255)] dark:text-[oklch(93%_0.01_255)] leading-none">
                Meridian AI
              </h1>
              <p className="text-[10px] text-[oklch(55%_0.03_255)] dark:text-[oklch(65%_0.02_255)] mt-0.5">
                Code · Design · Strategy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="text-xs text-[oklch(55%_0.18_255)] dark:text-[oklch(70%_0.15_255)] font-medium animate-pulse">
                Thinking…
              </span>
            )}
            <button
              aria-label="New conversation"
              className="size-9 rounded-lg hover:bg-[oklch(91%_0.02_255)] dark:hover:bg-[oklch(22%_0.02_255)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.2_255)] focus-visible:ring-offset-2 flex items-center justify-center text-[oklch(45%_0.03_255)] dark:text-[oklch(70%_0.02_255)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <section
        className="flex-1 overflow-y-auto"
        aria-label="Conversation history"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Error state */}
          {error && (
            <div
              role="alert"
              aria-describedby="chat-error-desc"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[oklch(95%_0.05_25)] dark:bg-[oklch(20%_0.04_25)] border border-[oklch(82%_0.08_25)] dark:border-[oklch(35%_0.06_25)]"
            >
              <span className="text-[oklch(52%_0.18_25)]" aria-hidden="true">⚠</span>
              <p id="chat-error-desc" className="text-sm text-[oklch(42%_0.12_25)] dark:text-[oklch(75%_0.1_25)] font-medium">
                {error || "Something went wrong. Please try again."}
              </p>
            </div>
          )}

          {/* Example prompts */}
          {showPrompts && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-[oklch(55%_0.03_255)] dark:text-[oklch(60%_0.02_255)] uppercase tracking-wider mb-3">
                Try asking about
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handlePromptClick(p.prompt)}
                    className="text-left px-4 py-3 min-h-[44px] rounded-xl border border-[oklch(85%_0.025_255)] dark:border-[oklch(28%_0.025_255)] bg-[oklch(99%_0.005_255)] dark:bg-[oklch(17%_0.015_255)] hover:border-[oklch(60%_0.15_255)] dark:hover:border-[oklch(55%_0.15_255)] hover:bg-[oklch(96%_0.03_255)] dark:hover:bg-[oklch(20%_0.03_255)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.2_255)] focus-visible:ring-offset-2 group"
                    aria-label={`Start with prompt: ${p.prompt}`}
                  >
                    <span className="block text-xs font-semibold text-[oklch(40%_0.04_255)] dark:text-[oklch(80%_0.02_255)] group-hover:text-[oklch(38%_0.15_255)] dark:group-hover:text-[oklch(78%_0.12_255)] transition-colors">
                      {p.label}
                    </span>
                    <span className="block text-[11px] text-[oklch(60%_0.025_255)] dark:text-[oklch(58%_0.02_255)] mt-0.5 leading-snug line-clamp-2">
                      {p.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </section>

      {/* Input area */}
      <footer className="border-t border-[oklch(88%_0.02_255)] dark:border-[oklch(25%_0.02_255)] bg-[oklch(97%_0.008_255)] dark:bg-[oklch(12%_0.015_255)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <label htmlFor="chat-input" className="sr-only">
              Message Meridian AI
            </label>
            <div className="flex-1 relative">
              <textarea
                id="chat-input"
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about code, design decisions, or business metrics…"
                rows={1}
                disabled={isLoading}
                aria-describedby={error ? "chat-error-desc" : undefined}
                className="w-full resize-none rounded-2xl border border-[oklch(85%_0.025_255)] dark:border-[oklch(28%_0.025_255)] bg-[oklch(99%_0.005_255)] dark:bg-[oklch(17%_0.015_255)] px-4 py-3 text-sm text-[oklch(18%_0.02_255)] dark:text-[oklch(92%_0.01_255)] placeholder:text-[oklch(65%_0.02_255)] dark:placeholder:text-[oklch(50%_0.02_255)] min-h-[44px] max-h-[160px] focus:outline-none focus:ring-2 focus:ring-[oklch(55%_0.2_255)] focus:border-transparent transition-colors disabled:opacity-50 leading-relaxed"
                style={{ fieldSizing: "content" }}
              />
            </div>

            {/* Stop button — visible only during streaming */}
            {isLoading && (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop generating response"
                className="size-11 rounded-2xl bg-[oklch(92%_0.03_25)] dark:bg-[oklch(22%_0.04_25)] hover:bg-[oklch(88%_0.06_25)] dark:hover:bg-[oklch(28%_0.06_25)] border border-[oklch(82%_0.06_25)] dark:border-[oklch(35%_0.06_25)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.2_255)] focus-visible:ring-offset-2 flex items-center justify-center shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="10" height="10" rx="2" fill="oklch(52% 0.18 25)" />
                </svg>
              </button>
            )}

            {/* Send button */}
            {!isLoading && (
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="size-11 rounded-2xl bg-[oklch(55%_0.2_255)] hover:bg-[oklch(50%_0.22_255)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.2_255)] focus-visible:ring-offset-2 flex items-center justify-center shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M14 8L2 2l3 6-3 6 12-6z" fill="oklch(98% 0.01 255)" />
                </svg>
              </button>
            )}
          </form>

          <p className="mt-2 text-[10px] text-[oklch(62%_0.02_255)] dark:text-[oklch(50%_0.02_255)] text-center">
            Press <kbd className="font-mono bg-[oklch(91%_0.02_255)] dark:bg-[oklch(22%_0.02_255)] px-1 py-0.5 rounded text-[9px]">Enter</kbd> to send
            · <kbd className="font-mono bg-[oklch(91%_0.02_255)] dark:bg-[oklch(22%_0.02_255)] px-1 py-0.5 rounded text-[9px]">Shift+Enter</kbd> for new line
          </p>
        </div>
      </footer>
    </main>
  );
}
