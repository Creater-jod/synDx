/**
 * Audit Log View Controller — synDx Cream Clinical Edition
 * Warm cream palette with SHA-256 hash ledger, copy buttons, and live filter.
 */

import { getCasesSync, statusLabel } from './data.js';
import { showToast } from './toast.js';

let auditSearchTerm = "";

export function renderAuditLog(searchQuery) {
  if (searchQuery !== undefined) {
    auditSearchTerm = searchQuery;
  }

  const cases = getCasesSync();
  const container = document.getElementById("view-audit");
  if (!container) return;

  const q = auditSearchTerm.toLowerCase();
  const filtered = cases.filter(c => !q || c.id.toLowerCase().includes(q) || c.condition.toLowerCase().includes(q) || c.audit.model.toLowerCase().includes(q));

  const rows = filtered.map(c => `
    <tr>
      <td class="mono" style="font-weight:700; color:var(--accent-primary);">${c.id}</td>
      <td style="font-weight:600; color:var(--text-primary);">${c.condition}</td>
      <td><span class="tier-badge tier-${c.tier}">TIER ${c.tier}</span></td>
      <td>
        ${c.status !== "pending"
          ? `<span class="status-pill ${c.status}">${statusLabel(c.status)}</span>`
          : `<span class="status-pill" style="background:var(--accent-gold-bg); color:var(--accent-gold);">pending</span>`}
      </td>
      <td>
        <button class="hash-btn" data-hash="${c.audit.case_hash}" title="Copy SHA-256 Case Hash">
          ${c.audit.case_hash.substring(0, 10)}… 📋
        </button>
      </td>
      <td>
        <button class="hash-btn" data-hash="${c.audit.diagnosis_hash}" title="Copy SHA-256 Diagnosis Hash">
          ${c.audit.diagnosis_hash.substring(0, 10)}… 📋
        </button>
      </td>
      <td class="mono" style="font-size:0.78rem; color:var(--accent-blue);">${c.audit.model}</td>
      <td class="mono" style="font-size:0.75rem; color:var(--text-muted);">${c.time}</td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="audit-toolbar">
      <div class="search-box" style="width: 380px;">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input class="search-input" id="auditSearch" placeholder="Filter by Case ID, condition, or model version..." value="${auditSearchTerm}" />
      </div>
      <div style="font-size:0.78rem; color:var(--text-muted);">
        Showing <span class="mono" style="color:var(--text-primary); font-weight:600;">${filtered.length}</span> of <span class="mono" style="color:var(--text-primary); font-weight:600;">${cases.length}</span> immutable records
      </div>
    </div>

    <div class="table-container">
      <table class="audit-table">
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Condition</th>
            <th>Tier</th>
            <th>Status</th>
            <th>Case Hash (SHA-256)</th>
            <th>Diagnosis Hash</th>
            <th>Model Engine</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted); font-style:italic;">No audit entries match your filter.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  // Hash copy buttons
  document.querySelectorAll(".hash-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const hash = btn.dataset.hash;
      navigator.clipboard.writeText(hash).then(() => {
        showToast({ message: `Copied: ${hash.substring(0, 12)}…`, type: 'info' });
      }).catch(() => {
        showToast({ message: `Failed to copy hash`, type: 'danger' });
      });
    });
  });

  const searchInput = document.getElementById("auditSearch");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      renderAuditLog(e.target.value);
    });
  }
}
