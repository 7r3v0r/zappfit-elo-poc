// ============================================================
// simulate.js — Class Simulation Page Logic
// ZappFit Performance Tracker
// ============================================================

(function () {
  'use strict';

  let allClients = [];
  let selectedIds = new Set();
  let lastResults = null;

  // ─── Init ────────────────────────────────────────────────
  function init() {
    allClients = ZappData.loadData();
    renderClientSelector();
    bindEvents();
    if (window.lucide) lucide.createIcons();
  }

  // ─── Client Selector ─────────────────────────────────────
  function renderClientSelector() {
    const grid = document.getElementById('client-selector-grid');
    grid.innerHTML = '';

    allClients.forEach(client => {
      const card = document.createElement('label');
      card.className = 'client-check-card';
      card.setAttribute('data-id', client.id);
      card.innerHTML = `
        <input type="checkbox" value="${client.id}" class="client-checkbox">
        <div class="avatar" style="background:${client.avatarColor};color:#fff;font-size:0.7rem;">${client.initials}</div>
        <div class="client-check-info">
          <div class="client-check-name">${client.name}</div>
          <div class="client-check-elo">ELO ${client.elo.toLocaleString()} · ${client.totalClasses} classes</div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Bind checkboxes
    grid.querySelectorAll('.client-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.value;
        const card = cb.closest('.client-check-card');
        if (cb.checked) {
          if (selectedIds.size >= 10) {
            cb.checked = false;
            showToast('Maximum 10 participants per class.', 'error');
            return;
          }
          selectedIds.add(id);
          card.classList.add('selected');
        } else {
          selectedIds.delete(id);
          card.classList.remove('selected');
        }
        renderScoreInputs();
        updateRunButton();
      });
    });
  }

  // ─── Score Inputs ─────────────────────────────────────────
  function renderScoreInputs() {
    const container = document.getElementById('score-inputs-section');
    const grid = document.getElementById('scores-grid');

    if (selectedIds.size < 2) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    grid.innerHTML = '';

    Array.from(selectedIds).forEach(id => {
      const client = allClients.find(c => c.id === id);
      if (!client) return;

      const card = document.createElement('div');
      card.className = 'score-entry-card animate-in';
      card.setAttribute('data-client-id', id);
      card.innerHTML = `
        <div class="score-entry-header">
          <div class="avatar" style="background:${client.avatarColor};color:#fff;font-size:0.7rem;">${client.initials}</div>
          <div>
            <div class="score-entry-name">${client.name}</div>
            <div class="score-entry-elo">ELO ${client.elo.toLocaleString()} · K=${ELO.getKFactor(client.totalClasses)}</div>
          </div>
        </div>
        <div class="score-inputs">
          <div class="form-group">
            <label class="form-label">Reps</label>
            <input type="number" class="form-input score-field" data-metric="reps" placeholder="e.g. 85" min="0" max="999">
          </div>
          <div class="form-group">
            <label class="form-label">Rounds</label>
            <input type="number" class="form-input score-field" data-metric="rounds" placeholder="e.g. 5" min="0" max="99" step="0.5">
          </div>
          <div class="form-group">
            <label class="form-label">Weight (lbs)</label>
            <input type="number" class="form-input score-field" data-metric="weight" placeholder="e.g. 135" min="0" max="1000">
          </div>
          <div class="form-group">
            <label class="form-label">Calories</label>
            <input type="number" class="form-input score-field" data-metric="calories" placeholder="e.g. 420" min="0" max="9999">
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  // ─── Run Button State ──────────────────────────────────────
  function updateRunButton() {
    const btn = document.getElementById('btn-run');
    const countEl = document.getElementById('selected-count');
    const count = selectedIds.size;
    countEl.textContent = `${count} selected`;
    btn.disabled = count < 2;
  }

  // ─── Events ───────────────────────────────────────────────
  function bindEvents() {
    document.getElementById('btn-run').addEventListener('click', runSimulation);
    document.getElementById('btn-select-all').addEventListener('click', selectAll);
    document.getElementById('btn-clear-all').addEventListener('click', clearAll);
    document.getElementById('btn-random-scores').addEventListener('click', fillRandomScores);
  }

  function selectAll() {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    let count = 0;
    checkboxes.forEach(cb => {
      if (!cb.checked && count < 10) {
        cb.checked = true;
        selectedIds.add(cb.value);
        cb.closest('.client-check-card').classList.add('selected');
        count++;
      }
    });
    renderScoreInputs();
    updateRunButton();
  }

  function clearAll() {
    selectedIds.clear();
    document.querySelectorAll('.client-checkbox').forEach(cb => {
      cb.checked = false;
      cb.closest('.client-check-card').classList.remove('selected');
    });
    renderScoreInputs();
    updateRunButton();

    // Hide results
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) resultsSection.style.display = 'none';
  }

  function fillRandomScores() {
    document.querySelectorAll('.score-entry-card').forEach(card => {
      card.querySelectorAll('.score-field').forEach(input => {
        const metric = input.getAttribute('data-metric');
        let val;
        switch(metric) {
          case 'reps':     val = Math.floor(Math.random() * 80) + 40; break;
          case 'rounds':   val = (Math.random() * 4 + 2).toFixed(1); break;
          case 'weight':   val = Math.floor(Math.random() * 150) + 65; break;
          case 'calories': val = Math.floor(Math.random() * 300) + 200; break;
        }
        input.value = val;
      });
    });
    showToast('Random scores filled in!', 'info');
  }

  // ─── Run Simulation ───────────────────────────────────────
  function runSimulation() {
    const btn = document.getElementById('btn-run');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Calculating...`;

    // Small delay for UX feel
    setTimeout(() => {
      try {
        const participants = gatherParticipantData();
        if (!participants || participants.length < 2) {
          showToast('Need at least 2 participants with scores.', 'error');
          resetRunButton();
          return;
        }

        const results = ELO.processSession(participants);
        lastResults = results;
        renderResults(results);
        showToast('Simulation complete!', 'success');
      } catch(e) {
        console.error(e);
        showToast('Error running simulation. Check console.', 'error');
      }
      resetRunButton();
    }, 600);
  }

  function resetRunButton() {
    const btn = document.getElementById('btn-run');
    btn.disabled = selectedIds.size < 2;
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      Run Class
    `;
  }

  function gatherParticipantData() {
    const participants = [];
    document.querySelectorAll('.score-entry-card').forEach(card => {
      const id = card.getAttribute('data-client-id');
      const client = allClients.find(c => c.id === id);
      if (!client) return;

      const p = {
        id: client.id,
        name: client.name,
        initials: client.initials,
        avatarColor: client.avatarColor,
        elo: client.elo,
        totalClasses: client.totalClasses,
      };

      card.querySelectorAll('.score-field').forEach(input => {
        const metric = input.getAttribute('data-metric');
        const val = input.value.trim();
        if (val !== '') {
          p[metric] = parseFloat(val);
        }
      });

      participants.push(p);
    });
    return participants;
  }

  // ─── Render Results ───────────────────────────────────────
  function renderResults(results) {
    const section = document.getElementById('results-section');
    section.style.display = 'block';

    const tbody = document.getElementById('results-tbody');
    tbody.innerHTML = '';

    results.forEach((r, index) => {
      const deltaClass = r.eloDelta > 0 ? 'elo-delta-up' : r.eloDelta < 0 ? 'elo-delta-down' : 'elo-delta-neutral';
      const deltaText = r.eloDelta > 0 ? `+${r.eloDelta}` : `${r.eloDelta}`;
      const deltaBg = r.eloDelta > 0 ? 'rgba(57,181,74,0.1)' : r.eloDelta < 0 ? 'rgba(255,107,53,0.1)' : 'transparent';
      const deltaBorder = r.eloDelta > 0 ? 'rgba(57,181,74,0.3)' : r.eloDelta < 0 ? 'rgba(255,107,53,0.3)' : 'var(--border)';

      const rankBadgeClass = r.rank <= 3 ? `rank-${r.rank}` : 'rank-other';

      // Build percentile detail
      const percParts = Object.entries(r.percentiles || {}).map(([metric, perc]) => {
        const labels = { reps: 'Reps', rounds: 'Rounds', weight: 'Wt', calories: 'Cal' };
        return `${labels[metric] || metric}: ${perc}%`;
      }).join(' · ');

      const tr = document.createElement('tr');
      tr.style.animationDelay = `${index * 0.06}s`;
      tr.classList.add('animate-in');

      tr.innerHTML = `
        <td>
          <div class="rank-badge ${rankBadgeClass}" style="margin:0 auto;">${r.rank}</div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="avatar" style="background:${r.avatarColor};color:#fff;font-size:0.7rem;">${r.initials}</div>
            <div>
              <div style="font-weight:600;font-size:0.9rem;">${r.name}</div>
              <div style="font-size:0.72rem;color:var(--text-secondary);">${percParts || 'No metric data'}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:60px;background:rgba(255,255,255,0.06);border-radius:3px;height:5px;overflow:hidden;">
              <div style="width:${Math.round(r.composite * 100)}%;height:100%;background:var(--accent);border-radius:3px;"></div>
            </div>
            <span style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);">${Math.round(r.composite * 100)}%</span>
          </div>
        </td>
        <td>
          <div style="display:inline-flex;align-items:center;gap:4px;background:${deltaBg};border:1px solid ${deltaBorder};padding:4px 10px;border-radius:20px;">
            <span class="elo-delta ${deltaClass}" style="font-size:0.875rem;font-weight:700;">${deltaText}</span>
          </div>
        </td>
        <td>
          <span style="font-family:var(--font-display);font-size:1rem;font-weight:800;">${r.newElo.toLocaleString()}</span>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Show commit button
    document.getElementById('btn-commit').style.display = 'inline-flex';

    // Scroll to results
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Bind commit button
    document.getElementById('btn-commit').onclick = commitResults;
  }

  // ─── Commit Results ───────────────────────────────────────
  function commitResults() {
    if (!lastResults) return;

    const btn = document.getElementById('btn-commit');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Committing...`;

    setTimeout(() => {
      lastResults.forEach((result, index) => {
        const clientIdx = allClients.findIndex(c => c.id === result.id);
        if (clientIdx === -1) return;

        ZappData.updateClientAfterSession(
          allClients[clientIdx],
          result.newElo,
          result.composite,
          result.rank
        );
      });

      ZappData.saveData(allClients);

      // Update the results table to reflect committed state
      document.querySelectorAll('#results-tbody tr').forEach((row, i) => {
        row.style.opacity = '0.6';
      });

      btn.style.display = 'none';

      // Add committed notice
      const notice = document.createElement('div');
      notice.style.cssText = 'display:flex;align-items:center;gap:8px;color:var(--accent);font-weight:600;font-size:0.875rem;padding:8px 0;';
      notice.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Results committed to leaderboard
      `;
      btn.parentNode.appendChild(notice);

      showToast('ELO ratings updated and saved!', 'success');

      // Refresh client selector data
      allClients = ZappData.loadData();
      lastResults = null;

      // Re-render selector with updated ELOs
      renderClientSelector();
      clearAll();
    }, 800);
  }

  // ─── Toast ────────────────────────────────────────────────
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = {
      success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
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

  // ─── Run ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
