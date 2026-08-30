// Runtime stub for `@ai-sdk/react` (Vercel AI SDK; this hook lived in `ai/react`
// through v4). See ./README.md for why these exist.
//
// An empty conversation. The chat gold's empty state is the one branch a test can
// reach without a model behind it, and it is also the branch most likely to be
// wrong — an unlabelled input, a missing aria-live region — so it is worth
// rendering rather than skipping.

type TextPart = { type: 'text'; text: string };
type UIMessage = { id: string; role: 'user' | 'assistant' | 'system'; parts: TextPart[] };

export const useChat = (_options?: Record<string, unknown>) => ({
  messages: [] as UIMessage[],
  sendMessage: (_msg?: { text: string }) => Promise.resolve(),
  regenerate: () => Promise.resolve(),
  stop: () => {},
  setMessages: (_m: UIMessage[]) => {},
  status: 'ready' as const,
  error: undefined as Error | undefined,
});

export const useCompletion = () => ({
  completion: '',
  complete: (_prompt?: string) => Promise.resolve(null),
  input: '',
  setInput: (_v: string) => {},
  handleInputChange: () => {},
  handleSubmit: (e?: { preventDefault?: () => void }) => { e?.preventDefault?.(); },
  isLoading: false,
  stop: () => {},
  error: undefined as Error | undefined,
});
