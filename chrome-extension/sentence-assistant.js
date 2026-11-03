(() => {
  const AEA = (window.AEA = window.AEA || {});
  const UI_ROOT_ID = "aea-sentence-ui";
  const API_MESSAGE = "GENERATE_REPLY";

  const PRESET_INSTRUCTIONS = {
    improve: "Improve the clarity and quality of this text while preserving its meaning.",
    concise: "Make this text more concise while preserving its meaning.",
    professional: "Make this text more professional in tone while preserving its meaning.",
  };

  let snapshot = null;
  let hideTimer = null;

  function ensureRoot() {
    let root = document.getElementById(UI_ROOT_ID);
    if (root) return root;
    root = document.createElement("div");
    root.id = UI_ROOT_ID;
    document.body.appendChild(root);
    return root;
  }

  function clearUi() {
    const root = document.getElementById(UI_ROOT_ID);
    if (root) root.innerHTML = "";
  }

  function keepSelectionOnPointer(event) {
    event.preventDefault();
  }

  function buildSentenceInstruction(userInstruction) {
    return (
      "Rewrite ONLY the provided text according to the instruction. " +
      "Return only the rewritten text. Do not write a full email, greeting, closing, or signature. " +
      "Do not wrap the result in quotation marks or add commentary.\n\n" +
      "Instruction: " +
      userInstruction
    );
  }

  function positionNearSelection(el, rect) {
    const width = el.offsetWidth || 320;
    const height = el.offsetHeight || 44;
    const gap = 8;

    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.min(Math.max(8, left), window.innerWidth - width - 8);

    let top = rect.top - height - gap;
    if (top < 8) {
      top = Math.min(rect.bottom + gap, window.innerHeight - height - 8);
    }

    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(top)}px`;
  }

  function showToolbar() {
    if (!snapshot || !AEA.Selection.isValid(snapshot)) {
      clearUi();
      return;
    }

    const root = ensureRoot();
    root.innerHTML = "";

    const toolbar = document.createElement("div");
    toolbar.className = "aea-sentence-toolbar";
    toolbar.setAttribute("role", "toolbar");
    toolbar.innerHTML = `
      <button type="button" class="aea-chip" data-action="manual">Edit manually</button>
      <button type="button" class="aea-chip" data-action="improve">Improve with AI</button>
      <button type="button" class="aea-chip" data-action="concise">Make concise</button>
      <button type="button" class="aea-chip" data-action="professional">Make professional</button>
      <button type="button" class="aea-chip" data-action="custom">Custom instruction</button>
    `;

    toolbar.addEventListener("mousedown", keepSelectionOnPointer);
    toolbar.addEventListener("pointerdown", keepSelectionOnPointer);

    toolbar.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const action = btn.getAttribute("data-action");
        if (action === "manual") openManualEditor();
        else if (action === "improve" || action === "custom") openInstructionEditor(action);
        else if (action === "concise") void runAiTransform(PRESET_INSTRUCTIONS.concise);
        else if (action === "professional") void runAiTransform(PRESET_INSTRUCTIONS.professional);
      });
    });

    root.appendChild(toolbar);
    positionNearSelection(toolbar, snapshot.rect);
  }

  function openManualEditor() {
    if (!snapshot || !AEA.Selection.isValid(snapshot)) {
      clearUi();
      return;
    }

    const root = ensureRoot();
    root.innerHTML = "";

    const pop = document.createElement("div");
    pop.className = "aea-sentence-popover";
    pop.innerHTML = `
      <div class="aea-popover-title">Edit selection</div>
      <textarea class="aea-sentence-textarea" id="aea-manual-edit"></textarea>
      <div class="aea-popover-actions">
        <button type="button" class="aea-btn aea-btn-primary" id="aea-manual-apply">Apply</button>
        <button type="button" class="aea-btn aea-btn-secondary" id="aea-manual-cancel">Cancel</button>
      </div>
      <div class="aea-status is-info" id="aea-sentence-status"></div>
    `;

    pop.addEventListener("mousedown", keepSelectionOnPointer);
    pop.addEventListener("pointerdown", keepSelectionOnPointer);

    root.appendChild(pop);
    positionNearSelection(pop, snapshot.rect);

    const field = pop.querySelector("#aea-manual-edit");
    field.value = snapshot.text;
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);

    pop.querySelector("#aea-manual-cancel").addEventListener("click", () => {
      clearUi();
      snapshot = null;
    });

    pop.querySelector("#aea-manual-apply").addEventListener("click", () => {
      const next = field.value;
      if (!next.trim()) {
        setSentenceStatus(pop, "Replacement text cannot be empty.", "error");
        return;
      }
      const result = AEA.Selection.replace(snapshot, next);
      if (!result.ok) {
        setSentenceStatus(pop, result.error, "error");
        return;
      }
      snapshot = null;
      clearUi();
    });
  }

  function openInstructionEditor(mode) {
    if (!snapshot || !AEA.Selection.isValid(snapshot)) {
      clearUi();
      return;
    }

    const root = ensureRoot();
    root.innerHTML = "";

    const title =
      mode === "custom" ? "Custom instruction" : "Improve with AI";
    const placeholder =
      mode === "custom"
        ? 'e.g. "Make this more polite."'
        : 'e.g. "Make this warmer and clearer."';

    const pop = document.createElement("div");
    pop.className = "aea-sentence-popover";
    pop.innerHTML = `
      <div class="aea-popover-title">${title}</div>
      <p class="aea-popover-hint">Only the selected text will be rewritten.</p>
      <textarea class="aea-sentence-textarea" id="aea-ai-instruction" placeholder="${placeholder}"></textarea>
      <div class="aea-popover-actions">
        <button type="button" class="aea-btn aea-btn-primary" id="aea-ai-run">Generate</button>
        <button type="button" class="aea-btn aea-btn-secondary" id="aea-ai-cancel">Cancel</button>
      </div>
      <div class="aea-status is-info" id="aea-sentence-status"></div>
    `;

    pop.addEventListener("mousedown", keepSelectionOnPointer);
    pop.addEventListener("pointerdown", keepSelectionOnPointer);
    root.appendChild(pop);
    positionNearSelection(pop, snapshot.rect);

    const field = pop.querySelector("#aea-ai-instruction");
    if (mode === "improve") {
      field.value = "Improve this text while keeping the same meaning.";
    }
    field.focus();

    pop.querySelector("#aea-ai-cancel").addEventListener("click", () => {
      showToolbar();
    });

    pop.querySelector("#aea-ai-run").addEventListener("click", () => {
      const instruction = field.value.trim();
      if (!instruction) {
        setSentenceStatus(pop, "Enter an instruction first.", "error");
        return;
      }
      void runAiTransform(instruction);
    });
  }

  function setSentenceStatus(host, message, kind) {
    const status = host.querySelector("#aea-sentence-status");
    if (!status) return;
    status.textContent = message || "";
    status.className = `aea-status is-${kind || "info"}`;
  }

  async function runAiTransform(userInstruction) {
    if (!snapshot || !AEA.Selection.isValid(snapshot)) {
      clearUi();
      return;
    }

    const locked = { ...snapshot, range: snapshot.range };
    const root = ensureRoot();
    root.innerHTML = "";

    const pop = document.createElement("div");
    pop.className = "aea-sentence-popover";
    pop.innerHTML = `
      <div class="aea-popover-title">AI suggestion</div>
      <p class="aea-popover-hint">Original</p>
      <div class="aea-sentence-preview aea-sentence-original"></div>
      <p class="aea-popover-hint">Suggestion</p>
      <textarea class="aea-sentence-textarea" id="aea-ai-preview" readonly></textarea>
      <div class="aea-popover-actions">
        <button type="button" class="aea-btn aea-btn-primary" id="aea-ai-replace" disabled>Replace</button>
        <button type="button" class="aea-btn aea-btn-secondary" id="aea-ai-cancel">Cancel</button>
      </div>
      <div class="aea-status is-info" id="aea-sentence-status">Generating…</div>
    `;

    pop.addEventListener("mousedown", keepSelectionOnPointer);
    pop.addEventListener("pointerdown", keepSelectionOnPointer);
    root.appendChild(pop);
    positionNearSelection(pop, locked.rect);

    pop.querySelector(".aea-sentence-original").textContent = locked.text;

    const preview = pop.querySelector("#aea-ai-preview");
    const replaceBtn = pop.querySelector("#aea-ai-replace");

    pop.querySelector("#aea-ai-cancel").addEventListener("click", () => {
      snapshot = null;
      clearUi();
    });

    try {
      const response = await chrome.runtime.sendMessage({
        type: API_MESSAGE,
        payload: {
          emailContent: locked.text,
          instruction: buildSentenceInstruction(userInstruction),
        },
      });

      if (!response?.ok) {
        throw new Error(response?.error || "Generation failed");
      }

      const suggestion = String(response.reply || "").trim();
      if (!suggestion) {
        throw new Error("Backend returned an empty suggestion");
      }

      preview.readOnly = false;
      preview.value = suggestion;
      replaceBtn.disabled = false;
      setSentenceStatus(pop, "Review the suggestion, edit if needed, then Replace.", "success");

      replaceBtn.addEventListener("click", () => {
        const next = preview.value;
        if (!next.trim()) {
          setSentenceStatus(pop, "Replacement text cannot be empty.", "error");
          return;
        }
        snapshot = locked;
        const result = AEA.Selection.replace(locked, next);
        if (!result.ok) {
          setSentenceStatus(pop, result.error, "error");
          return;
        }
        snapshot = null;
        clearUi();
      });
    } catch (error) {
      setSentenceStatus(pop, error?.message || "Generation failed", "error");
    }
  }

  function sameSnapshot(a, b) {
    if (!a || !b || a.kind !== b.kind || a.text !== b.text) return false;
    if (a.kind === "textarea") {
      return (
        a.element === b.element &&
        a.start === b.start &&
        a.end === b.end
      );
    }
    try {
      return (
        a.range.startContainer === b.range.startContainer &&
        a.range.startOffset === b.range.startOffset &&
        a.range.endContainer === b.range.endContainer &&
        a.range.endOffset === b.range.endOffset
      );
    } catch {
      return false;
    }
  }

  function onSelectionMaybeChanged() {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      const activePop = document.querySelector(".aea-sentence-popover");
      if (activePop) return;

      const next = AEA.Selection.capture();
      if (!next) {
        if (!document.querySelector(".aea-sentence-toolbar")) return;
        clearUi();
        snapshot = null;
        return;
      }

      if (
        sameSnapshot(snapshot, next) &&
        document.querySelector(".aea-sentence-toolbar")
      ) {
        snapshot = next;
        return;
      }

      snapshot = next;
      showToolbar();
    }, 120);
  }

  function onDocumentPointerDown(event) {
    const target = event.target;
    if (target?.closest?.(`#${UI_ROOT_ID}`)) return;
    if (document.querySelector(".aea-sentence-popover")) return;

    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      const next = AEA.Selection.capture();
      if (!next) {
        clearUi();
        snapshot = null;
      }
    }, 0);
  }

  function start() {
    document.addEventListener("mouseup", onSelectionMaybeChanged);
    document.addEventListener("keyup", (event) => {
      const selectAll =
        (event.key === "a" || event.key === "A") &&
        (event.ctrlKey || event.metaKey);
      if (
        event.key === "Shift" ||
        event.key.startsWith("Arrow") ||
        selectAll
      ) {
        onSelectionMaybeChanged();
      }
    });
    document.addEventListener("selectionchange", onSelectionMaybeChanged);
    document.addEventListener("mousedown", onDocumentPointerDown, true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        clearUi();
        snapshot = null;
      }
    });
  }

  AEA.SentenceAssistant = { start };
  start();
})();
