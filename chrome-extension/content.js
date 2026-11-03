(() => {
  const MARKER = "data-aea-btn";
  const PANEL_ID = "aea-panel";
  const API_MESSAGE = "GENERATE_REPLY";

  const TONES = {
    Professional: "Write a professional reply.",
    Friendly: "Write a friendly reply.",
    Concise: "Write a concise reply.",
  };

  let selectedTone = "Professional";
  let injectScheduled = false;
  let observer = null;

  function scheduleInject() {
    if (injectScheduled) return;
    injectScheduled = true;
    requestAnimationFrame(() => {
      injectScheduled = false;
      tryInjectButton();
    });
  }

  function isEmailViewOpen() {
    return Boolean(
      document.querySelector("h2.hP") ||
        document.querySelector("[data-thread-perm-id]") ||
        document.querySelector("div.a3s.aiL")
    );
  }

  function findReplyToolbar() {
    const replyCandidates = Array.from(
      document.querySelectorAll(
        'div[role="button"][aria-label^="Reply"], span[role="button"][aria-label^="Reply"]'
      )
    ).filter((el) => {
      const label = (el.getAttribute("aria-label") || "").toLowerCase();
      return label === "reply" || label.startsWith("reply ");
    });

    for (const reply of replyCandidates) {
      const toolbar =
        reply.closest('[role="toolbar"]') ||
        reply.parentElement ||
        reply;
      if (toolbar) return { toolbar, reply };
    }
    return null;
  }

  function tryInjectButton() {
    document.querySelectorAll(`[${MARKER}]`).forEach((btn) => {
      if (!document.body.contains(btn)) btn.remove();
    });

    if (!isEmailViewOpen()) {
      closePanel();
      return;
    }

    const found = findReplyToolbar();
    if (!found) return;

    if (found.toolbar.querySelector(`[${MARKER}]`)) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "aea-reply-btn";
    button.setAttribute(MARKER, "true");
    button.textContent = "AI Reply";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPanel(button);
    });

    if (found.reply.nextSibling) {
      found.reply.parentElement.insertBefore(button, found.reply.nextSibling);
    } else {
      found.reply.parentElement.appendChild(button);
    }
  }

  function extractEmail() {
    const subject =
      document.querySelector("h2.hP")?.innerText?.trim() ||
      document.querySelector("[data-thread-perm-id]")?.innerText?.trim() ||
      "";

    const senderEl = document.querySelector("span.gD");
    const sender =
      senderEl?.getAttribute("email")?.trim() ||
      senderEl?.getAttribute("name")?.trim() ||
      senderEl?.innerText?.trim() ||
      "";

    const bodies = Array.from(document.querySelectorAll("div.a3s.aiL"))
      .map((node) => node.innerText?.trim() || "")
      .filter(Boolean);

    const messageContent = bodies.join("\n\n").trim();

    const emailContent = [
      subject ? `Subject: ${subject}` : "",
      sender ? `From: ${sender}` : "",
      messageContent ? `Message:\n${messageContent}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return { subject, sender, messageContent, emailContent };
  }

  function closePanel() {
    document.getElementById(PANEL_ID)?.remove();
  }

  function openPanel(anchor) {
    closePanel();

    const email = extractEmail();
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.className = "aea-panel";
    panel.innerHTML = `
      <div class="aea-panel-header">
        <h3 class="aea-panel-title">AI Reply</h3>
        <button type="button" class="aea-close" aria-label="Close">×</button>
      </div>
      <p class="aea-meta"></p>
      <label class="aea-label">Tone</label>
      <div class="aea-tones"></div>
      <label class="aea-label" for="aea-instruction">Custom instruction</label>
      <textarea id="aea-instruction" class="aea-textarea" placeholder="Optional details for the reply..."></textarea>
      <label class="aea-label" for="aea-reply">Generated reply (editable)</label>
      <textarea id="aea-reply" class="aea-textarea aea-reply-draft" placeholder="Generated reply will appear here. Edit freely, or select a sentence to refine it."></textarea>
      <p class="aea-hint">Select text in this draft or in Gmail’s reply box to improve a sentence. Nothing is sent automatically.</p>
      <div class="aea-actions">
        <button type="button" class="aea-btn aea-btn-primary" id="aea-generate">Generate Reply</button>
        <button type="button" class="aea-btn aea-btn-secondary" id="aea-insert" disabled>Insert into Gmail</button>
      </div>
      <div class="aea-status is-info" id="aea-status"></div>
    `;

    document.body.appendChild(panel);
    positionPanel(panel, anchor);

    const meta = panel.querySelector(".aea-meta");
    meta.textContent = [
      email.subject ? `Subject: ${email.subject}` : "Subject: (not found)",
      email.sender ? `From: ${email.sender}` : "From: (not found)",
      email.messageContent
        ? `Body: ${email.messageContent.slice(0, 160)}${email.messageContent.length > 160 ? "…" : ""}`
        : "Body: (not found)",
    ].join("\n");

    const tones = panel.querySelector(".aea-tones");
    Object.keys(TONES).forEach((tone) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "aea-tone" + (tone === selectedTone ? " is-active" : "");
      chip.textContent = tone;
      chip.addEventListener("click", () => {
        selectedTone = tone;
        tones.querySelectorAll(".aea-tone").forEach((el) => {
          el.classList.toggle("is-active", el.textContent === selectedTone);
        });
      });
      tones.appendChild(chip);
    });

    panel.querySelector(".aea-close").addEventListener("click", closePanel);
    panel.querySelector("#aea-generate").addEventListener("click", () => {
      void onGenerate(panel, email);
    });
    panel.querySelector("#aea-insert").addEventListener("click", () => {
      void onInsert(panel);
    });

    const replyBox = panel.querySelector("#aea-reply");
    replyBox.addEventListener("input", () => {
      panel.querySelector("#aea-insert").disabled = !replyBox.value.trim();
    });

    if (!email.messageContent) {
      setStatus(panel, "Could not read this email's body. Open a message and try again.", "error");
      panel.querySelector("#aea-generate").disabled = true;
    }
  }

  function positionPanel(panel, anchor) {
    const rect = anchor.getBoundingClientRect();
    const width = panel.offsetWidth || 420;
    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - width - 12
    );
    let top = rect.bottom + 8;
    const height = panel.offsetHeight || 360;
    if (top + height > window.innerHeight - 12) {
      top = Math.max(12, rect.top - height - 8);
    }
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  function setStatus(panel, message, kind) {
    const status = panel.querySelector("#aea-status");
    status.textContent = message || "";
    status.className = `aea-status is-${kind || "info"}`;
  }

  function buildInstruction(customText) {
    const tone = TONES[selectedTone] || TONES.Professional;
    const custom = (customText || "").trim();
    return custom ? `${tone} ${custom}` : tone;
  }

  async function onGenerate(panel, email) {
    const generateBtn = panel.querySelector("#aea-generate");
    const insertBtn = panel.querySelector("#aea-insert");
    const replyBox = panel.querySelector("#aea-reply");
    const instructionBox = panel.querySelector("#aea-instruction");

    if (!email.emailContent.trim()) {
      setStatus(panel, "Email content is empty.", "error");
      return;
    }

    generateBtn.disabled = true;
    insertBtn.disabled = true;
    setStatus(panel, "Generating reply…", "info");

    try {
      const response = await chrome.runtime.sendMessage({
        type: API_MESSAGE,
        payload: {
          emailContent: email.emailContent,
          instruction: buildInstruction(instructionBox.value),
        },
      });

      if (!response?.ok) {
        throw new Error(response?.error || "Generation failed");
      }

      replyBox.value = response.reply;
      insertBtn.disabled = !response.reply.trim();
      setStatus(
        panel,
        "Reply ready. Edit it here, refine selected sentences, then insert into Gmail. Sending stays manual.",
        "success"
      );
    } catch (error) {
      setStatus(panel, error?.message || "Generation failed", "error");
    } finally {
      generateBtn.disabled = false;
    }
  }

  async function onInsert(panel) {
    const reply = panel.querySelector("#aea-reply").value.trim();
    if (!reply) {
      setStatus(panel, "Nothing to insert. Generate a reply first.", "error");
      return;
    }

    setStatus(panel, "Opening Gmail reply composer…", "info");
    const composer = await ensureComposer();
    if (!composer) {
      setStatus(
        panel,
        "Could not find Gmail's reply box. Click Reply once, then try Insert again.",
        "error"
      );
      return;
    }

    const ok = insertTextIntoComposer(composer, reply);
    if (ok) {
      setStatus(
        panel,
        "Inserted into Gmail. Review the draft and send it yourself — nothing was sent automatically.",
        "success"
      );
    } else {
      setStatus(panel, "Failed to insert text into the composer.", "error");
    }
  }

  async function ensureComposer() {
    let composer = findComposer();
    if (composer) return composer;

    const replyBtn = Array.from(
      document.querySelectorAll(
        'div[role="button"][aria-label^="Reply"], span[role="button"][aria-label^="Reply"]'
      )
    ).find((el) => {
      const label = (el.getAttribute("aria-label") || "").toLowerCase();
      return label === "reply" || label.startsWith("reply ");
    });

    replyBtn?.click();

    for (let i = 0; i < 20; i++) {
      await wait(100);
      composer = findComposer();
      if (composer) return composer;
    }
    return null;
  }

  function findComposer() {
    const selectors = [
      'div[role="textbox"][aria-label*="Message Body"]',
      'div[role="textbox"][aria-label*="message body"]',
      'div[aria-label="Message Body"][contenteditable="true"]',
      'div.Am.Al.editable[contenteditable="true"]',
      'div[contenteditable="true"][g_editable="true"]',
    ];

    for (const selector of selectors) {
      const nodes = Array.from(document.querySelectorAll(selector));
      const visible = nodes.find(isVisible);
      if (visible) return visible;
    }
    return null;
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function insertTextIntoComposer(composer, text) {
    try {
      composer.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(composer);
      selection.removeAllRanges();
      selection.addRange(range);

      const inserted = document.execCommand("insertText", false, text);
      if (!inserted) {
        composer.textContent = text;
        composer.dispatchEvent(inputEvent("input"));
      } else {
        composer.dispatchEvent(inputEvent("input"));
      }
      composer.dispatchEvent(inputEvent("change"));
      return true;
    } catch {
      return false;
    }
  }

  function inputEvent(type) {
    return new InputEvent(type, { bubbles: true, cancelable: true });
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => scheduleInject());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener("hashchange", scheduleInject);
  window.addEventListener("popstate", scheduleInject);

  if (document.body) {
    startObserver();
    scheduleInject();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      startObserver();
      scheduleInject();
    });
  }
})();
