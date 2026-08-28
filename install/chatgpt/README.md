# Install — ChatGPT (Custom GPT)

1. Unzip `frontend-design-pro-v*.skill`.
2. Create a Custom GPT and open its **Knowledge** section.
3. Upload a curated subset: `SKILL.md`, the `core/*.md` files a typical request needs, the 2–3 skill routers your work actually hits, and the specific `references/*.md` you know you want. **A Custom GPT accepts at most 20 knowledge files for the lifetime of that GPT.** [`knowledge-manifest.json`](knowledge-manifest.json) beside this file is a suggested starting list, not a shipped bundle — adjust it to your use case.
4. Paste the routing instruction from the setup doc into **Instructions**: match one skill in the registry table, search knowledge for that skill file and its declared core deps, state which files it used before writing code.
5. Verify: ask *"which skill file are you using, and what does its routing table say matched this request?"* You want one path and a roughly quoted routing row — a plausible summary means it is improvising, not retrieving.

**Degradation:** retrieval, not lazy loading — knowledge files are chunked and searched by relevance, and the GPT cannot decide mid-conversation to fetch a reference. The 20-file cap means curating a subset of 116 reference files before the first message, which is exactly the decision the registry was built to defer until the request arrives.

Full setup and limits: [docs/CHATGPT_SETUP.md](../../docs/CHATGPT_SETUP.md).
