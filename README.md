# AI Email Assistant

A Gmail Chrome extension built with **Java, Spring Boot, and JavaScript** that helps you generate, refine, and personalize email replies without leaving Gmail. Choose a tone, add custom instructions, edit the draft, and insert it into Gmail.

**You stay in control. The extension never sends emails automatically.**

<img width="1899" height="942" alt="AI Email Assistant screenshot" src="https://github.com/user-attachments/assets/d4259648-29c0-4c46-80a6-c3b3e7869c49" />

## Demo
![Uploading image.png…]()


## Features

- **AI reply generation** from the original email and your instructions.
- **Tone selection:** Professional, Friendly, or Concise.
- **Custom instructions**, for example "Politely decline the invitation."
- **Editable drafts:** review and change the reply before inserting it into Gmail.
- **Sentence-level editing:** select text and improve it, make it more professional or concise, or apply a custom instruction, without regenerating the whole email.
- **User-controlled sending:** drafts are only generated and inserted. You send every message yourself.

## Tech Stack

| Component | Technology |
|---|---|
| Backend | Java 21, Spring Boot 4.1.1, Spring Web |
| Validation | Jakarta Bean Validation |
| Build tool | Maven |
| AI | Groq API, model `qwen/qwen3.8-27b` |
| Extension | Chrome Manifest V3, JavaScript, HTML, CSS |

## Project Structure

```text
AIEmailAssistant/
├── src/main/
│   ├── java/com/inimai/ai_email_assistant/
│   │   ├── controller/
│   │   │   └── EmailController.java
│   │   ├── service/
│   │   │   ├── EmailService.java
│   │   │   └── GroqService.java
│   │   ├── dtos/
│   │   │   └── EmailGenerateRequest.java
│   │   └── AiEmailAssistantApplication.java
│   └── resources/
│       └── application.properties
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── selection-utils.js
│   ├── sentence-assistant.js
│   └── content.css
├── .env
├── .gitignore
└── pom.xml
```

## Backend Architecture

| Component | Responsibility |
|---|---|
| `EmailController` | Exposes the REST endpoint and handles requests |
| `EmailService` | Coordinates reply generation |
| `GroqService` | Communicates with the Groq API |
| `EmailGenerateRequest` | Represents and validates request data |

Separating HTTP handling, business logic, and AI communication lets the AI provider be changed without touching the controller.

## API

### `POST /api/email/generate`

Base URL: `http://localhost:8080`

```json
{
  "emailContent": "Hi, can we schedule a meeting for tomorrow?",
  "instruction": "Write a professional reply."
}
```

Both fields are required (`@NotBlank`). The response is the generated reply as plain text:

```text
Hi,

Thank you for reaching out. Tomorrow works well for me.
Please let me know what time would be convenient.

Best regards
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/inimai09/AIEmailAssistant.git
cd AIEmailAssistant
```

### 2. Configure the API key

Create a `.env` file in the project root (next to `pom.xml`):

```env
GROQ_API_KEY=your_groq_api_key
```

Never commit your `.env` file or expose your API key.

### 3. Check `application.properties`

```properties
groq.api-key=${GROQ_API_KEY}
groq.base-url=https://api.groq.com/openai/v1
groq.model=qwen/qwen3.8-27b
```

Make sure the model is available to your Groq account.

### 4. Run the backend

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

macOS / Linux:

```bash
./mvnw spring-boot:run
```

The backend runs at `http://localhost:8080`.

### 5. Load the extension

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.
4. Open Gmail, open an email, and look for the AI Reply button.

After reloading the extension, refresh Gmail too.

## Author

**Inimai S** · [@inimai09](https://github.com/inimai09)
