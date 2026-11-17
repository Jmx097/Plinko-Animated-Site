# PLINKO JARVIS — Cinematic Hologram Demo

A **zero-API-key**, browser-rendered, interactive JARVIS-style proof of concept for Plinko Solutions sales demonstrations.

## What is real in v0.1
- Original procedural **3D particle head, neck, and shoulders** drawn with GPU shaders (Three.js).
- A real animated transition from the particle face into a connected **3D network graph**.
- Live GPU animation, parallax movement, scanning, blue/cyan filaments, and orange neural energy.
- Browser **speech recognition** when available, plus spoken answers using **SpeechSynthesis**.
- Typed input, keyboard controls, toggleable sound, mobile layout, and low-power rendering.
- Three scripted sales demonstrations: introduction, illustrative lead pipeline, and automation flow.
- Runs as a static site. **No VPS, ElevenLabs, paid inference, API key or database required.**

## Important limitations (tell demo viewers)
- This is a **scripted demonstration**, **not a ChatGPT/Gemini/Claude integration**.
- Numbers like "48 leads" are illustrative, **not connected to a client's live CRM**.
- Clicking scenarios and recognizing keywords triggers pre-authored spoken responses. Free-form questions do not receive LLM-generated answers.
- Browser speech recognition is not truly streaming full-duplex AI audio; it is **turn-based STT → script → browser TTS**. In some browsers it relies on a vendor speech service, so "no API bill" does not mean all audio is offline.
- Speech recognition is most dependable in supported Chromium browsers; other browsers may only support text input and speech output.
- Performance depends on the viewer's device/GPU. Lower graphics quality with the built-in toggle.

## Getting started

No build step, no npm dependencies, and no API tokens:

1. Open a Codespace on the repository, or check out this feature branch.
2. From the repository root, serve the demo directory using a static server:
   - Python: \`cd jarvis-hologram-demo && python3 -m http.server 8080\`
   - Or Node: \`npx serve jarvis-hologram-demo\`
3. Open the forwarded HTTPS Codespaces port, or visit \`http://localhost:8080\` locally.
4. Click the demo scenarios. Enable sound; then try the microphone, or type \`show the sales pipeline\`.
5. Test on desktop Chrome before a client meeting.

**Do not double-click index.html directly**: ES modules and browser microphone features work better with HTTP(S).

Three.js is loaded from a public CDN using an **import map**, so an internet connection is required to obtain the JS module unless you self-host it.

## Controls
- **01 — Awaken JARVIS:** the blue/orange particle bust and spoken introduction
- **02 — Visualize a pipeline:** face morphs into animated graph with **illustrative** metrics
- **03 — Show agent capabilities:** simulated agent workflow narrative
- **Run showcase:** automated guided sequence through all three scenes
- **Microphone** or **Space:** speech recognition (if supported by the browser)
- **Type + Enter:** offline keyword routing to scripted scenes
- **Esc:** reset to face
- **Low power:** lower particle count and render resolution
- **Sound:** enable or disable browser synthesized narration

## Cost & architecture

| Component | Runtime | Incremental cost |
| --- | --- | --- |
| Visualization | Viewer WebGL GPU, Three.js | $0 |
| Data | Bundled sample objects | $0 |
| Speech output | Browser SpeechSynthesis | $0 API charge |
| Speech input | Web Speech API where available | $0 directly charged to this app |
| Hosting | Static host e.g. Cloudflare Pages free plan | $0 within published limits |
| Development | GitHub Codespaces (included allowance) | $0 within included limits |

The site should be deployed to an HTTPS static host before testing microphone permission on mobile.

**No new infrastructure subscriptions are required for the v0.1 showcase.** This does not guarantee availability of browser speech services or the usage limits of third-party free offerings.

## Static deployment

Set the static hosting **publish/root directory** to \`jarvis-hologram-demo\` and use **no build command**.

A GitHub branch alone does not automatically publish a live site. Deploy separately through Cloudflare Pages, Netlify, or an existing static hosting workflow. Do not add secrets to this public repository.

## Paths
- \`index.html\` — responsive hologram cockpit
- \`styles.css\` — cinematic cyan/orange design system
- \`src/render.js\` — procedural GPU bust and morphing graph
- \`src/main.js\` — browser speech, script routing, demo controls

## Next improvements — not part of v0.1

1. Record and incorporate actual client-feedback on visual wow and intelligibility.
2. Add optional **true realtime model-to-voice** mode (Gemini Live or OpenAI Realtime) behind a consent screen and a properly secured, rate-limited token broker.
3. Build more expressive mouth/face animation, driven by real speech amplitude and phoneme timing where available.
4. Optional authenticated live integrations: n8n, CRM, sales pipeline, Plinko Pocket context. Never claim an integration is live before it is verified.
5. Run actual browser rendering tests and visual snapshots on target hardware, optimize FPS and cold start.
6. Publish a gated public-demo URL only after reviewing privacy and provider usage restrictions.

## Repository safety

The demo is isolated under \`jarvis-hologram-demo/\`. No files in the pre-existing website project were changed. This project neither sends customer data nor executes external workflows.
