/**
 * Analytics View Controller — synDx Cream Clinical Edition
 * Dashboard with warm cream palette bar charts and stat cards.
 */

import { getCasesSync } from './data.js';

export function renderAnalytics() {
  const cases = getCasesSync();
  const container = document.getElementById("view-analytics");
  if (!container) return;

  const total = cases.length;
  const reviewedToday = cases.filter(c => c.day === "today" && c.status !== "pending").length;
  const pending = cases.filter(c => c.status === "pending").length;
  const emergencyCount = cases.filter(c => c.emergency).length;
  const avgConfidence = total ? Math.round(cases.reduce((s, c) => s + c.confidence, 0) / total) : 0;

  const tierCounts = {
    A: cases.filter(c => c.tier === "A").length,
    B: cases.filter(c => c.tier === "B").length,
    C: cases.filter(c => c.tier === "C").length
  };
  const maxTier = Math.max(...Object.values(tierCounts)) || 1;

  const statusCounts = {
    confirmed: cases.filter(c => c.status === "confirmed").length,
    "more-tests": cases.filter(c => c.status === "more-tests").length,
    overridden: cases.filter(c => c.status === "overridden").length,
    pending: cases.filter(c => c.status === "pending").length
  };
  const maxStatus = Math.max(...Object.values(statusCounts)) || 1;

  const notesFeed = cases.filter(c => c.note).map(c => `
    <div class="nitem">
      <div class="nid mono">${c.id} · ${c.condition}</div>
      <div class="ntext">${c.note}</div>
    </div>
  `).join("") || `<div style="color:var(--text-muted); font-size:0.85rem; padding:0.5rem 0; font-style:italic;">No reviewer decision notes recorded yet.</div>`;

  container.innerHTML = `
    <div class="stat-cards">
      <div class="stat-card">
        <div class="num">${total}</div>
        <div class="lab">Total Ingested Cases</div>
      </div>
      <div class="stat-card teal">
        <div class="num">${reviewedToday}</div>
        <div class="lab">Reviewed Today</div>
      </div>
      <div class="stat-card amber">
        <div class="num">${pending}</div>
        <div class="lab">Pending Action</div>
      </div>
      <div class="stat-card rose">
        <div class="num">${emergencyCount}</div>
        <div class="lab">Emergency SLA Flags</div>
      </div>
    </div>

    <div class="analytics-grid">
      <div class="panel">
        <h3>Model Diagnostic Confidence Tiers</h3>
        <div class="bar-row">
          <div class="blabel"><span>Tier A — High Confidence (≥85%)</span><span class="bv" style="color:var(--accent-sage);">${tierCounts.A} cases</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(tierCounts.A / maxTier) * 100}%; background:var(--accent-sage);"></div></div>
        </div>
        <div class="bar-row">
          <div class="blabel"><span>Tier B — Medium Confidence (65–84%)</span><span class="bv" style="color:var(--accent-gold);">${tierCounts.B} cases</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(tierCounts.B / maxTier) * 100}%; background:var(--accent-gold);"></div></div>
        </div>
        <div class="bar-row">
          <div class="blabel"><span>Tier C — Low Confidence (&lt;65%)</span><span class="bv" style="color:var(--accent-ruby);">${tierCounts.C} cases</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(tierCounts.C / maxTier) * 100}%; background:var(--accent-ruby);"></div></div>
        </div>
        <div style="margin-top:1.25rem; padding-top:0.85rem; border-top:1px solid var(--border-light); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.78rem; color:var(--text-muted);">Overall Mean Confidence</span>
          <span class="mono" style="font-size:1.05rem; font-weight:700; color:var(--accent-primary);">${avgConfidence}%</span>
        </div>
      </div>

      <div class="panel">
        <h3>Reviewer Decision Outcomes</h3>
        <div class="bar-row">
          <div class="blabel"><span>Confirmed Diagnosis</span><span class="bv">${statusCounts.confirmed}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(statusCounts.confirmed / maxStatus) * 100}%; background:var(--accent-sage);"></div></div>
        </div>
        <div class="bar-row">
          <div class="blabel"><span>Additional Tests Requested</span><span class="bv">${statusCounts["more-tests"]}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(statusCounts["more-tests"] / maxStatus) * 100}%; background:var(--accent-gold);"></div></div>
        </div>
        <div class="bar-row">
          <div class="blabel"><span>Model Diagnosis Overridden</span><span class="bv">${statusCounts.overridden}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(statusCounts.overridden / maxStatus) * 100}%; background:var(--accent-ruby);"></div></div>
        </div>
        <div class="bar-row">
          <div class="blabel"><span>Pending Review</span><span class="bv">${statusCounts.pending}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(statusCounts.pending / maxStatus) * 100}%; background:var(--text-faint);"></div></div>
        </div>
      </div>
    </div>

    <div class="panel">
      <h3>Clinical Rationale &amp; Decision Notes</h3>
      <div class="notes-feed">${notesFeed}</div>
    </div>
  `;
}
