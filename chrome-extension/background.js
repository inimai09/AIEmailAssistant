const GENERATE_URL = "http://localhost:8080/api/email/generate";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "GENERATE_REPLY") {
    return false;
  }

  generateReply(message.payload)
    .then((reply) => sendResponse({ ok: true, reply }))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: error?.message || "Failed to generate reply",
      })
    );

  return true;
});

async function generateReply({ emailContent, instruction }) {
  if (!emailContent || !String(emailContent).trim()) {
    throw new Error("Email content is empty");
  }
  if (!instruction || !String(instruction).trim()) {
    throw new Error("Instruction is empty");
  }

  let response;
  try {
    response = await fetch(GENERATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailContent: String(emailContent),
        instruction: String(instruction),
      }),
    });
  } catch {
    throw new Error(
      "Could not reach the backend at http://localhost:8080. Is it running?"
    );
  }

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text?.trim()
        ? `Backend error (${response.status}): ${text.trim()}`
        : `Backend error (${response.status})`
    );
  }

  if (!text || !text.trim()) {
    throw new Error("Backend returned an empty reply");
  }

  return text;
}
