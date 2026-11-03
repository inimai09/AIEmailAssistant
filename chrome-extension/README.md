# AI Email Assistant — Chrome Extension

Manifest V3 extension that adds **AI Reply** in Gmail and talks to the local Spring Boot backend at `http://localhost:8080`.

The OpenRouter API key stays on the backend (`OPENROUTER_API_KEY`). The extension never sees it.

## Features

1. **Generate + edit a full reply** in the extension panel, then **Insert into Gmail**. Sending is always manual.
2. **Sentence assistant** — select text in the panel draft or Gmail’s reply composer to:
   - Edit manually
   - Improve with AI
   - Make concise / professional
   - Run a custom instruction  
   Only the selected span is replaced after you confirm.

## Load the extension

1. Start the Spring Boot backend with `OPENROUTER_API_KEY` set.
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** (or **Reload** if already loaded)
5. Select this `chrome-extension` folder
6. Open [Gmail](https://mail.google.com)

## Manual verification

Gmail’s DOM is dynamic. These behaviors were **not** auto-verified in a live Gmail session here — check by hand:

### Full reply flow
1. Open an email → **AI Reply** → Generate.
2. Edit the draft in the panel textarea.
3. **Insert into Gmail** → confirm the edited text lands in the composer.
4. Confirm Gmail does **not** send by itself.

### Sentence assistant
1. In the panel draft, select one sentence → floating toolbar should appear above the selection.
2. **Edit manually** → change text → **Apply** → only that span changes.
3. Select again → **Make concise** / **Make professional** → preview → **Replace**.
4. **Improve with AI** / **Custom instruction** → enter guidance → preview → **Replace** or **Cancel**.
5. Open Gmail Reply, select text in the contenteditable composer, and repeat a replace.
6. Confirm unselected text is preserved; Cancel leaves the original alone.
7. Change/clear the selection mid-flow and confirm a clear error or toolbar hide.
8. Stop the backend and confirm API failures show in the popover.

## Request contract

Unchanged:

```http
POST http://localhost:8080/api/email/generate
Content-Type: application/json

{
  "emailContent": "...",
  "instruction": "..."
}
```

Sentence transforms reuse the same endpoint with the selected text as `emailContent` and a rewrite-focused `instruction`.

## Files

| File | Role |
|---|---|
| `manifest.json` | MV3 config |
| `background.js` | Backend POST proxy |
| `content.js` | AI Reply panel + insert |
| `selection-utils.js` | Textarea + contenteditable selection/replace |
| `sentence-assistant.js` | Floating toolbar + manual/AI edit UI |
| `content.css` | Panel + toolbar styles |
