(() => {
  const AEA = (window.AEA = window.AEA || {});

  const COMPOSER_SELECTORS = [
    'div[role="textbox"][aria-label*="Message Body"]',
    'div[role="textbox"][aria-label*="message body"]',
    'div[aria-label="Message Body"][contenteditable="true"]',
    'div.Am.Al.editable[contenteditable="true"]',
    'div[contenteditable="true"][g_editable="true"]',
  ];

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findComposers() {
    return COMPOSER_SELECTORS.flatMap((selector) =>
      Array.from(document.querySelectorAll(selector))
    ).filter(isVisible);
  }

  function closestComposer(node) {
    if (!node) return null;
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    if (!el || !el.closest) return null;
    for (const selector of COMPOSER_SELECTORS) {
      const match = el.closest(selector);
      if (match) return match;
    }
    return null;
  }

  function isOurUi(node) {
    const el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    return Boolean(el?.closest?.("#aea-panel, #aea-sentence-ui, .aea-sentence-toolbar, .aea-sentence-popover"));
  }

  function getTextareaSelectionRect(textarea) {
    const rect = textarea.getBoundingClientRect();
    return {
      top: rect.top + 8,
      bottom: rect.top + 28,
      left: rect.left + 12,
      right: Math.min(rect.right - 12, rect.left + 220),
      width: Math.min(rect.width - 24, 208),
      height: 20,
    };
  }

  function capture() {
    const active = document.activeElement;

    if (
      active &&
      active.id === "aea-reply" &&
      active.tagName === "TEXTAREA" &&
      typeof active.selectionStart === "number"
    ) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      if (start === end) return null;
      const text = active.value.slice(start, end);
      if (!text.trim()) return null;
      return {
        kind: "textarea",
        element: active,
        start,
        end,
        text,
        rect: getTextareaSelectionRect(active),
      };
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0).cloneRange();
    if (isOurUi(range.commonAncestorContainer)) return null;

    const composer = closestComposer(range.commonAncestorContainer);
    if (!composer) return null;

    const text = range.toString();
    if (!text.trim()) return null;

    let rect;
    try {
      rect = range.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        const rects = range.getClientRects();
        rect = rects.length ? rects[0] : composer.getBoundingClientRect();
      }
    } catch {
      rect = composer.getBoundingClientRect();
    }

    return {
      kind: "range",
      range,
      root: composer,
      text,
      rect,
    };
  }

  function isValid(snapshot) {
    if (!snapshot) return false;

    if (snapshot.kind === "textarea") {
      const el = snapshot.element;
      if (!el || !document.body.contains(el)) return false;
      if (snapshot.start < 0 || snapshot.end > el.value.length) return false;
      return el.value.slice(snapshot.start, snapshot.end) === snapshot.text;
    }

    if (snapshot.kind === "range") {
      try {
        const node = snapshot.range.commonAncestorContainer;
        if (!node || !document.contains(node)) return false;
        if (!closestComposer(node)) return false;
        return snapshot.range.toString() === snapshot.text;
      } catch {
        return false;
      }
    }

    return false;
  }

  function notifyEditable(el) {
    if (!el) return;
    el.dispatchEvent(
      new InputEvent("input", { bubbles: true, cancelable: true, inputType: "insertText" })
    );
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function replace(snapshot, nextText) {
    if (!isValid(snapshot)) {
      return { ok: false, error: "Selection changed or is no longer available. Select the text again." };
    }

    if (snapshot.kind === "textarea") {
      const el = snapshot.element;
      const before = el.value.slice(0, snapshot.start);
      const after = el.value.slice(snapshot.end);
      el.value = before + nextText + after;
      const caret = snapshot.start + nextText.length;
      el.focus();
      el.setSelectionRange(caret, caret);
      notifyEditable(el);
      return { ok: true };
    }

    try {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(snapshot.range);

      const root = snapshot.root;
      root.focus?.();

      let inserted = false;
      try {
        inserted = document.execCommand("insertText", false, nextText);
      } catch {
        inserted = false;
      }

      if (!inserted) {
        snapshot.range.deleteContents();
        const textNode = document.createTextNode(nextText);
        snapshot.range.insertNode(textNode);
        selection.removeAllRanges();
        const after = document.createRange();
        after.setStartAfter(textNode);
        after.collapse(true);
        selection.addRange(after);
      }

      notifyEditable(root);
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not replace the selected text in Gmail." };
    }
  }

  AEA.Selection = {
    capture,
    isValid,
    replace,
    findComposers,
    closestComposer,
  };
})();
