# Install — Gemini

1. Unzip `frontend-design-pro-v*.skill`.
2. Put `SKILL.md` in the system instruction — the `system_instruction` config in the `google-genai` SDK, or the System Instructions field in AI Studio. The same field works against AI Studio and Vertex AI; only the client construction differs.
3. Narrow integration: add the one or two `skills/{id}/SKILL.md` files plus the `core/*.md` deps you know you need. Broad integration: add all 8 `core/*.md` and all 19 skill routers — small enough that a large context window absorbs it. Leave `references/` out; 332,974 tokens is too large to paste wholesale in any window.
4. For genuine on-demand loading, wire a function/tool that reads a pack file by path, and let the model call it after matching the routing table in `SKILL.md`.
5. Verify: ask *"which skill file matched this request, and what's in its routing row?"* You want a specific path back, not generically good advice.

**Degradation:** static context by default, not lazy loading — whatever sits in the system instruction is paid on every request, needed or not. A large context window makes that affordable, not free. Only a function-calling loop you build yourself gets the ~5,000–6,300-tokens-per-request model.

Full setup, SDK snippet and limitations: [docs/GEMINI_SETUP.md](../../docs/GEMINI_SETUP.md).
