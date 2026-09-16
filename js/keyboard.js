/**
 * UI/UX Pro Max — Keyboard Navigation & Shortcut Controller
 * Handles J/K case navigation, C/M/O reviewer decision hotkeys, / search focus, and ? shortcuts overlay.
 */

import { selectNextCase, selectPrevCase, triggerCurrentDecision } from './queue.js';

export function initKeyboardShortcuts() {
  const modal = document.getElementById("shortcutsModal");
  const openBtn = document.getElementById("openShortcutsModal");
  const closeBtn = document.getElementById("closeShortcutsModal");

  const toggleModal = (show) => {
    if (!modal) return;
    if (show === undefined) {
      modal.classList.toggle("open");
    } else if (show) {
      modal.classList.add("open");
    } else {
      modal.classList.remove("open");
    }
  };

  openBtn?.addEventListener("click", () => toggleModal(true));
  closeBtn?.addEventListener("click", () => toggleModal(false));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) toggleModal(false);
  });

  document.addEventListener("keydown", e => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    const isInputActive = activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable;

    // Toggle Help Modal with ? (Shift + /)
    if (e.key === '?' && !isInputActive) {
      e.preventDefault();
      toggleModal();
      return;
    }

    // Search focus: / or Ctrl+K / Cmd+K
    if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) && !isInputActive) {
      e.preventDefault();
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // Escape to close modal or blur active input
    if (e.key === 'Escape') {
      if (modal && modal.classList.contains("open")) {
        toggleModal(false);
        return;
      }
      if (isInputActive) {
        document.activeElement.blur();
      }
      return;
    }

    // Skip decision and navigation shortcuts if user is typing text
    if (isInputActive) return;

    // J or Down Arrow -> Select Next Case
    if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
      e.preventDefault();
      selectNextCase();
    }

    // K or Up Arrow -> Select Previous Case
    else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
      e.preventDefault();
      selectPrevCase();
    }

    // C -> Quick Confirm Diagnosis
    else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      triggerCurrentDecision('confirmed');
    }

    // M -> Request More Tests
    else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      triggerCurrentDecision('more-tests');
    }

    // O -> Override Diagnosis
    else if (e.key === 'o' || e.key === 'O') {
      e.preventDefault();
      triggerCurrentDecision('overridden');
    }
  });
}
