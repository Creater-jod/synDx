/**
 * UI/UX Pro Max — Toast Notification Manager
 * Provides non-blocking feedback with interactive Undo action capability.
 */

let toastContainer = null;

export function initToastSystem() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    toastContainer.setAttribute("role", "region");
    toastContainer.setAttribute("aria-label", "Notifications");
    document.body.appendChild(toastContainer);
  }
}

/**
 * Show a toast notification
 * @param {Object} options
 * @param {string} options.message - Text message
 * @param {'success'|'warning'|'danger'|'info'} options.type - Notification type
 * @param {Function} [options.onUndo] - Callback function for Undo button
 * @param {number} [options.duration=4000] - Duration in ms
 */
export function showToast({ message, type = 'info', onUndo = null, duration = 4000 }) {
  initToastSystem();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");

  const textSpan = document.createElement("span");
  textSpan.className = "toast-message";
  textSpan.textContent = message;
  toast.appendChild(textSpan);

  if (onUndo) {
    const undoBtn = document.createElement("button");
    undoBtn.className = "toast-undo-btn mono";
    undoBtn.textContent = "Undo ↺";
    undoBtn.addEventListener("click", () => {
      onUndo();
      dismissToast(toast);
    });
    toast.appendChild(undoBtn);
  }

  const closeBtn = document.createElement("button");
  closeBtn.className = "toast-close-btn";
  closeBtn.innerHTML = "&times;";
  closeBtn.setAttribute("aria-label", "Close notification");
  closeBtn.addEventListener("click", () => dismissToast(toast));
  toast.appendChild(closeBtn);

  toastContainer.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  const timer = setTimeout(() => {
    dismissToast(toast);
  }, duration);

  toast._timer = timer;
}

function dismissToast(toast) {
  if (!toast || !toast.parentNode) return;
  if (toast._timer) clearTimeout(toast._timer);

  toast.classList.remove("show");
  toast.classList.add("hide");

  toast.addEventListener("transitionend", () => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  });
}
