// Runtime stub for `ai/react` (Vercel AI SDK). See ./README.md for why these exist.
//
// An empty conversation. The chat gold's empty state is the one branch a test can
// reach without a model behind it, and it is also the branch most likely to be
// wrong — an unlabelled input, a missing aria-live region — so it is worth
// rendering rather than skipping.

type Message = { id: string; role: 'user' | 'assistant'; content: string };

export const useChat = (_options?: Record<string, unknown>) => ({
  messages: [] as Message[],
  input: '',
  setInput: () => {},
  handleInputChange: () => {},
  handleSubmit: (e?: { preventDefault?: () => void }) => { e?.preventDefault?.(); },
  append: () => Promise.resolve(null),
  reload: () => Promise.resolve(null),
  stop: () => {},
  isLoading: false,
  status: 'ready' as const,
  error: undefined as Error | undefined,
});

export const useCompletion = () => ({
  completion: '',
  input: '',
  handleInputChange: () => {},
  handleSubmit: (e?: { preventDefault?: () => void }) => { e?.preventDefault?.(); },
  isLoading: false,
  stop: () => {},
  error: undefined as Error | undefined,
});
