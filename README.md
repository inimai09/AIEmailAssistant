# AI Email Assistant

Generate Gmail replies in one click. A Chrome extension sends the email you're reading, plus a tone or custom instruction, to a Spring Boot backend, which asks OpenRouter to write the reply.

> **Status:** Backend and Chrome extension (MV3) are implemented. Load the unpacked extension from `chrome-extension/` and keep the backend running on `localhost:8080`. See the [Roadmap](#roadmap).

---

## Why this project exists

Replying to email is repetitive. Most replies follow a pattern ("confirm the meeting," "politely decline," "ask for more details"), but writing each one still takes time. This project puts an AI assistant inside Gmail so the user can describe the reply they want and get a draft instantly.

## Demo

**Email received**

> Hi, can we schedule a meeting for tomorrow?

**Instruction**

> Write a professional reply.

**Generated reply**

> Hi, tomorrow works for me. Please let me know what time works best for you.

---

## How it works

```mermaid
flowchart TD
    A[Gmail] --> B[Chrome Extension<br/>AI Reply button]
    B -->|POST /api/email/generate| C[Spring Boot API]
    C --> D[EmailController]
    D --> E[EmailService]
    E --> F[OpenRouterService]
    F -->|OpenAI-compatible API| G[OpenRouter]
    G --> H[Generated reply]
    H --> B
```

1. The user opens an email in Gmail and clicks **AI Reply**.
2. The extension sends the email text and the user's instruction to the backend.
3. The backend validates the request and builds a prompt.
4. OpenRouter generates the reply and the backend returns it.
5. The extension inserts the reply into Gmail's compose box.

Steps 1–5 are implemented in code. Gmail DOM behavior should be verified manually (see `chrome-extension/README.md`).

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot, Spring Web, Bean Validation, Maven |
| AI | OpenRouter (OpenAI-compatible Chat Completions API) |
| Frontend | Chrome Extension (Manifest V3), JavaScript, CSS |
| Tooling | Git, GitHub |

---

## Project structure

```text
src/main/java/com/inimai/ai_email_assistant
├── controller
│   └── EmailController.java      # REST endpoint
├── service
│   ├── EmailService.java         # Business logic and prompt building
│   └── OpenRouterService.java    # OpenRouter API client
├── dtos
│   └── EmailGenerateRequest.java # Validated request body
└── AiEmailAssistantApplication.java

chrome-extension/
├── manifest.json                 # Manifest V3
├── background.js                 # Calls local backend
├── content.js                    # Gmail DOM + AI Reply panel
├── selection-utils.js            # Textarea + contenteditable selection/replace
├── sentence-assistant.js         # Floating sentence toolbar
├── content.css
└── README.md                     # Load + manual test steps
```

The code is split into three layers: the **controller** handles HTTP, the **service** holds the logic, and the **AI client** is isolated in its own class, so the model provider can be swapped without touching the rest of the app.

---

## Roadmap

**Backend**
- [x] Spring Boot project setup
- [x] `POST /api/email/generate` endpoint
- [x] Request DTO with validation
- [x] Service layer and OpenRouter integration
- [x] Environment-based API key configuration (`OPENROUTER_API_KEY`)
- [x] End-to-end request flow tested
- [ ] Error handling and retry strategy
- [ ] Rate limiting
- [ ] Logging and monitoring

**AI**
- [x] OpenRouter API integration
- [ ] Improved prompt design
- [ ] Preset tones (professional, friendly, short, firm)
- [ ] Context-aware replies for long email threads

**Chrome extension**
- [x] Detect an open email in Gmail
- [x] **AI Reply** button
- [x] Tone picker and custom instruction input
- [x] Connect to the backend
- [x] Insert the reply into the compose box
- [x] Loading and error states
- [x] Edit the reply before inserting
- [ ] Publish the extension

**Deployment**
- [ ] Deploy the backend
- [ ] Publish the extension

## Author

**Inimai S**, [GitHub](https://github.com/inimai09)
