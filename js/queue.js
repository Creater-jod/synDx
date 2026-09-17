/**
 * Queue View Controller — synDx Cream Clinical Edition
 * Warm cream palette with CSS variable references throughout.
 */

import { getCasesSync, updateCaseDecision, revertLastDecision, tierLabel, statusLabel } from './data.js';
import { showToast } from './toast.js';

let activeFilter = "all";
let searchTerm = "";
let selectedId = null;

export function initQueueView() {
  const cases = getCasesSync();
  if (cases.length > 0 && !selectedId) {
    selectedId = cases[0].id;
  }

  setupEventListeners();
  renderQueue();
  renderDetail();
}

function setupEventListeners() {
  const filtersEl = document.getElementById("filters");
  if (filtersEl && !filtersEl.dataset.initialized) {
    filtersEl.addEventListener("click", e => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.filter;
      renderQueue();
    });
    filtersEl.dataset.initialized = "true";
  }

  const searchEl = document.getElementById("searchInput");
  if (searchEl && !searchEl.dataset.initialized) {
    searchEl.addEventListener("input", e => {
      searchTerm = e.target.value;
      renderQueue();
    });
    searchEl.dataset.initialized = "true";
  }
}

export function getFilteredCases() {
  let list = getCasesSync();
  if (activeFilter === "pending") list = list.filter(c => c.status === "pending");
  else if (activeFilter === "emergency") list = list.filter(c => c.emergency);
  else if (["A", "B", "C"].includes(activeFilter)) list = list.filter(c => c.tier === activeFilter);

  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    list = list.filter(c => c.id.toLowerCase().includes(q) || c.condition.toLowerCase().includes(q));
  }
  return list;
}

export function renderQueue() {
  const cases = getCasesSync();
  const filtered = getFilteredCases();

  // Update Topbar Metrics
  const pendingCount = cases.filter(c => c.status === "pending").length;
  const emergencyCount = cases.filter(c => c.emergency).length;
  const avgConfidence = cases.length ? Math.round(cases.reduce((acc, c) => acc + c.confidence, 0) / cases.length) : 0;

  const topPending = document.getElementById("topPendingCount");
  const topEmergency = document.getElementById("topEmergencyCount");
  const topAvg = document.getElementById("topAvgConfidence");
  const navCount = document.getElementById("navQueueCount");

  if (topPending) topPending.textContent = pendingCount;
  if (topEmergency) topEmergency.textContent = emergencyCount;
  if (topAvg) topAvg.textContent = `${avgConfidence}%`;
  if (navCount) navCount.textContent = pendingCount;

  const listEl = document.getElementById("queueList");
  if (!listEl) return;

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">No cases found</p>
        <p style="font-size: 0.82rem;">Try adjusting your search query or filters.</p>
      </div>
    `;
    return;
  }

  if (!filtered.some(c => c.id === selectedId)) {
    selectedId = filtered[0].id;
    renderDetail();
  }

  listEl.innerHTML = filtered.map(c => {
    const isSelected = c.id === selectedId;
    return `
      <div class="case-card ${isSelected ? 'selected' : ''}" data-id="${c.id}" role="option" aria-selected="${isSelected}" tabindex="0">
        <div class="case-card-header">
          <span class="case-id">${c.id}</span>
          ${c.emergency ? `<span class="urgency-badge">⚡ EMERGENCY</span>` : ''}
        </div>
        <div class="case-condition">${c.condition}</div>
        <div class="case-meta">
          <span class="tier-badge tier-${c.tier}">TIER ${c.tier} · ${c.confidence}%</span>
          <span class="mono" style="font-size: 0.72rem;">${c.time}</span>
        </div>
      </div>
    `;
  }).join("");

  listEl.querySelectorAll(".case-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedId = card.dataset.id;
      renderQueue();
      renderDetail();
    });
  });
}

export function renderDetail() {
  const detailEl = document.getElementById("detail");
  if (!detailEl) return;

  const cases = getCasesSync();
  const c = cases.find(x => x.id === selectedId);

  if (!c) {
    detailEl.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-muted); font-style:italic;">
        Select a case from the queue to view diagnostic details.
      </div>
    `;
    return;
  }

  const maxFeatureVal = Math.max(...c.features.map(f => f.value)) || 1;

  detailEl.innerHTML = `
    <!-- Header Summary -->
    <div class="detail-header">
      <div class="dh-top">
        <div class="dh-title-group">
          <h2>${c.condition}</h2>
          <div class="dh-sub">Case: <span style="color:var(--accent-primary); font-weight:700;">${c.id}</span> · Model: <span style="color:var(--text-primary);">${c.audit.model}</span></div>
        </div>
        <div class="dh-badges">
          <span class="tier-badge tier-${c.tier}" style="font-size:0.8rem; padding:0.25rem 0.6rem;">TIER ${c.tier}</span>
          ${c.emergency ? `<span class="urgency-badge" style="font-size:0.78rem; padding:0.25rem 0.6rem;">⚡ EMERGENCY</span>` : ''}
        </div>
      </div>

      <div class="confidence-dial">
        <div class="dial-score">${c.confidence}%</div>
        <div class="dial-meta">
          <span class="dial-lbl">Diagnosis Confidence (${tierLabel(c.tier)})</span>
          <div class="dial-bar-track">
            <div class="dial-bar-fill" style="width: ${c.confidence}%;"></div>
          </div>
        </div>
        <div style="margin-left: auto;">
          ${c.status !== "pending"
            ? `<span class="status-pill ${c.status}">${statusLabel(c.status)}</span>`
            : `<span class="status-pill" style="background:var(--accent-gold-bg); color:var(--accent-gold);">pending review</span>`}
        </div>
      </div>
    </div>

    <!-- Feature Importance -->
    <div class="glass-section">
      <div class="section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
        Clinical Feature Contributions (SHAP Values)
      </div>
      <div class="feature-list">
        ${c.features.map(f => `
          <div class="feature-row">
            <div class="feat-meta">
              <span class="feat-name">${f.label}</span>
              <span class="feat-val">+${f.value}%</span>
            </div>
            <div class="feat-track">
              <div class="feat-fill" style="width: ${(f.value / maxFeatureVal) * 100}%;"></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- Decision Actions -->
    <div class="decision-box">
      <div class="section-title" style="margin-bottom:0;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-sage)" stroke-width="2"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Reviewer Decision
      </div>

      <div class="decision-actions">
        <button class="btn-decision btn-confirm" id="btnConfirm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Confirm [C]
        </button>
        <button class="btn-decision btn-tests" id="btnTests">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          More Tests [M]
        </button>
        <button class="btn-decision btn-override" id="btnOverride">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Override [O]
        </button>
      </div>

      <textarea class="notes-input" id="caseNotes" placeholder="Add clinical rationale or notes for the case record...">${c.note || ''}</textarea>
    </div>

    <!-- Referral -->
    <div class="referral-card">
      <div class="ref-info">
        <div class="ref-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div>
          <div style="font-weight:600; font-size:0.88rem;">${c.referral.name}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Distance: ${c.referral.distance}</div>
        </div>
      </div>
      <span class="stock-tag ${c.referral.stock === 'yes' ? 'stock-yes' : 'stock-low'}">
        ${c.referral.stock === 'yes' ? '✓ In Stock' : '⚠ Low Stock'}
      </span>
    </div>

    <!-- SHA-256 Audit -->
    <div class="audit-box">
      <div>
        <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); font-weight:600;">SHA-256 Cryptographic Proof</div>
        <div style="font-family:'JetBrains Mono',monospace; font-size:0.78rem; color:var(--text-secondary); margin-top:0.15rem;">
          Case: ${c.audit.case_hash.substring(0, 12)}…
        </div>
      </div>
      <button class="hash-btn" id="copyCaseHash" data-hash="${c.audit.case_hash}">
        Copy Hash 📋
      </button>
    </div>
  `;

  // Event handlers
  const noteEl = document.getElementById("caseNotes");

  document.getElementById("btnConfirm")?.addEventListener("click", () => {
    executeDecision("confirmed", noteEl?.value || "");
  });

  document.getElementById("btnTests")?.addEventListener("click", () => {
    executeDecision("more-tests", noteEl?.value || "");
  });

  document.getElementById("btnOverride")?.addEventListener("click", () => {
    executeDecision("overridden", noteEl?.value || "");
  });

  document.getElementById("copyCaseHash")?.addEventListener("click", (e) => {
    const hash = e.currentTarget.dataset.hash;
    navigator.clipboard.writeText(hash).then(() => {
      showToast({ message: `Copied: ${hash.substring(0, 10)}…`, type: 'info' });
    });
  });
}

async function executeDecision(status, note) {
  if (!selectedId) return;

  const result = await updateCaseDecision(selectedId, status, note);
  if (!result) return;

  const { targetCase } = result;

  showToast({
    message: `${targetCase.id} → ${statusLabel(status)}`,
    type: status === 'confirmed' ? 'success' : status === 'more-tests' ? 'warning' : 'danger',
    onUndo: async () => {
      await revertLastDecision(selectedId);
      renderQueue();
      renderDetail();
      showToast({ message: `Reverted ${selectedId}`, type: 'info' });
    }
  });

  renderQueue();
  renderDetail();
}

export function selectNextCase() {
  const list = getFilteredCases();
  if (!list.length) return;
  const currentIndex = list.findIndex(c => c.id === selectedId);
  selectedId = currentIndex === -1 || currentIndex === list.length - 1 ? list[0].id : list[currentIndex + 1].id;
  renderQueue();
  renderDetail();
  scrollSelectedIntoView();
}

export function selectPrevCase() {
  const list = getFilteredCases();
  if (!list.length) return;
  const currentIndex = list.findIndex(c => c.id === selectedId);
  selectedId = currentIndex === -1 || currentIndex === 0 ? list[list.length - 1].id : list[currentIndex - 1].id;
  renderQueue();
  renderDetail();
  scrollSelectedIntoView();
}

function scrollSelectedIntoView() {
  const selectedEl = document.querySelector(`.case-card[data-id="${selectedId}"]`);
  if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

export function triggerCurrentDecision(status) {
  const noteEl = document.getElementById("caseNotes");
  executeDecision(status, noteEl?.value || "");
}
