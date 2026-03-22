// ============================================================
// leaderboard.js — Leaderboard Page Logic
// ZappFit Performance Tracker
// ============================================================

(function () {
  'use strict';

  let allClients = [];
  let activeFilter = { type: 'all', value: null };

  // ─── Init ────────────────────────────────────────────────
  function init() {
    allClients = ZappData.loadData();
    renderStats();
    renderFilterChips();
    renderLeaderboard();
    initLucide();
  }

  // ─── Stats Bar ───────────────────────────────────────────
  function renderStats() {
    const ranked = ZappData.getSortedLeaderboard(allClients);
    const topElo = ranked[0] ? ranked[0].elo : 0;
    const avgElo = ranked.length
      ? Math.round(ranked.reduce((s, c) => s + c.elo, 0) / ranked.length)
      : 0;

    document.getElementById('stat-ranked').textContent = ranked.length;
    document.getElementById('stat-top-elo').textContent = topElo.toLocaleString();
    document.getElementById('stat-avg-elo').textContent = avgElo.toLocaleString();
    document.getElementById('stat-total').textContent = allClients.length;
  }

  // ─── Filter Chips ────────────────────────────────────────
  function renderFilterChips() {
    // Locations
    const locations = [...new Set(allClients.map(c => c.location))].sort();
    const locContainer = document.getElementById('filter-locations');
    locContainer.innerHTML = '';

    locations.forEach(loc => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.setAttribute('data-filter-type', 'location');
      chip.setAttribute('data-filter-value', loc);
      chip.textContent = loc;
      chip.addEventListener('click', () => setFilter('location', loc, chip));
      locContainer.appendChild(chip);
    });

    // Class types
    const classTypes = [...new Set(allClients.map(c => c.classType))].sort();
    const typeContainer = document.getElementById('filter-classtypes');
    typeContainer.innerHTML = '';

    classTypes.forEach(ct => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.setAttribute('data-filter-type', 'classtype');
      chip.setAttribute('data-filter-value', ct);
      chip.textContent = ct;
      chip.addEventListener('click', () => setFilter('classtype', ct, chip));
      typeContainer.appendChild(chip);
    });

    // "All" chip
    document.getElementById('chip-all').addEventListener('click', () => {
      clearFilters();
    });
  }

  function setFilter(type, value, el) {
    // If same filter, clear it
    if (activeFilter.type === type && activeFilter.value === value) {
      clearFilters();
      return;
    }

    activeFilter = { type, value };

    // Update chip states
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('chip-all').classList.remove('active');

    renderLeaderboard();
  }

  function clearFilters() {
    activeFilter = { type: 'all', value: null };
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.getElementById('chip-all').classList.add('active');
    renderLeaderboard();
  }

  // ─── Leaderboard Render ──────────────────────────────────
  function renderLeaderboard() {
    let ranked = ZappData.getSortedLeaderboard(allClients);

    // Apply filter
    if (activeFilter.type === 'location') {
      ranked = ranked.filter(c => c.location === activeFilter.value);
    } else if (activeFilter.type === 'classtype') {
      ranked = ranked.filter(c => c.classType === activeFilter.value);
    }

    const tbody = document.getElementById('lb-tbody');
    tbody.innerHTML = '';

    if (ranked.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="7" style="text-align:center;padding:40px;color:var(--text-secondary);">
        No clients match the current filter.
      </td>`;
      tbody.appendChild(row);
      return;
    }

    ranked.forEach((client, index) => {
      const rank = index + 1;
      const delta = client.elo - client.prevElo;
      const isYou = client.isYou;

      const tr = document.createElement('tr');
      tr.className = '';
      if (isYou) tr.classList.add('you-row');
      if (rank <= 3) tr.classList.add(`top-rank-row-${rank}`);
      tr.style.animationDelay = `${index * 0.04}s`;
      tr.classList.add('animate-in');

      // Trend
      const trendClass = delta > 0 ? 'trend-up' : delta < 0 ? 'trend-down' : 'trend-neutral';
      const trendIcon = delta > 0
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>'
        : delta < 0
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';

      // ELO delta display
      const deltaText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—';
      const deltaClass = delta > 0 ? 'elo-delta-up' : delta < 0 ? 'elo-delta-down' : 'elo-delta-neutral';

      // Rank badge
      const rankBadgeClass = rank <= 3 ? `rank-${rank}` : 'rank-other';

      // Status badge
      let statusBadge = '';
      if (client.status === 'provisional') {
        statusBadge = `<span class="badge badge-provisional" style="margin-left:6px;">Prov.</span>`;
      }

      // You tag
      const youTag = isYou ? `<span class="you-tag" style="margin-left:6px;">YOU</span>` : '';

      // Last session delta pill
      const lastDeltaStr = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0';
      const lastDeltaColor = delta > 0 ? 'var(--accent)' : delta < 0 ? 'var(--warning)' : 'var(--text-secondary)';

      tr.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="rank-badge ${rankBadgeClass}">${rank}</div>
          </div>
        </td>
        <td>
          <div class="lb-name-cell">
            <div class="avatar" style="background:${client.avatarColor};color:#fff;">${client.initials}</div>
            <div class="lb-name-info">
              <div style="display:flex;align-items:center;gap:4px;">
                <span class="lb-name">${client.name}</span>
                ${youTag}
                ${statusBadge}
              </div>
              <div class="lb-location">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${client.location} · ${client.classType}
              </div>
            </div>
          </div>
        </td>
        <td>
          <span class="lb-elo">${client.elo.toLocaleString()}</span>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="trend-arrow ${trendClass}">${trendIcon}</div>
            <span class="elo-delta ${deltaClass}" style="font-size:0.8rem;">${lastDeltaStr}</span>
          </div>
        </td>
        <td style="color:var(--text-secondary);font-size:0.875rem;">${client.totalClasses}</td>
        <td style="color:var(--text-secondary);font-size:0.8rem;">${formatRelativeDate(client.lastActive)}</td>
        <td>
          <a href="profile.html?id=${client.id}" class="btn btn-sm btn-secondary">
            View
          </a>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Re-init lucide icons for newly rendered content
    if (window.lucide) lucide.createIcons();
  }

  // ─── Helpers ─────────────────────────────────────────────
  function formatRelativeDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date('2026-03-22'); // use current date context
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }

  function initLucide() {
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // ─── Reset button ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all leaderboard data to seed values? This cannot be undone.')) {
          allClients = ZappData.resetData();
          ZappData.saveData(allClients);
          renderStats();
          renderLeaderboard();
          showToast('Leaderboard reset to default data.', 'info');
        }
      });
    }
  });

  // ─── Toast helper ─────────────────────────────────────────
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      error:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      info:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `${icons[type] || icons.info}<span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ─── Run ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
