// ============================================================
// profile.js — Client Profile Page Logic
// ZappFit Performance Tracker
// ============================================================

(function () {
  'use strict';

  let allClients = [];
  let client = null;
  let eloChart = null;

  // ─── Init ────────────────────────────────────────────────
  function init() {
    allClients = ZappData.loadData();

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      // Default to the "you" client or first client
      const youClient = allClients.find(c => c.isYou) || allClients[0];
      if (youClient) {
        window.location.replace(`profile.html?id=${youClient.id}`);
        return;
      }
    }

    client = ZappData.getClientById(allClients, id);

    if (!client) {
      document.getElementById('profile-content').innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
          <p>Client not found.</p>
          <a href="index.html" class="btn btn-secondary" style="margin-top:16px;">Back to Leaderboard</a>
        </div>`;
      return;
    }

    renderProfile();
    renderStats();
    renderChart();
    renderHistory();
    renderPersonalRecords();
    renderClientNav();
    if (window.lucide) lucide.createIcons();
  }

  // ─── Profile Hero ─────────────────────────────────────────
  function renderProfile() {
    const ranked = ZappData.getSortedLeaderboard(allClients);
    const rankPos = ranked.findIndex(c => c.id === client.id);
    const rankDisplay = rankPos >= 0 ? `#${rankPos + 1}` : 'Unranked';
    const delta = client.elo - client.prevElo;
    const deltaText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0';
    const deltaClass = delta > 0 ? 'elo-delta-up' : delta < 0 ? 'elo-delta-down' : 'elo-delta-neutral';

    // You tag
    const youTag = client.isYou ? `<span class="you-tag" style="vertical-align:middle;margin-left:8px;">YOU</span>` : '';

    // Status badge
    let statusBadge = '';
    if (client.status === 'provisional') {
      statusBadge = `<span class="badge badge-provisional" style="margin-left:8px;">Provisional</span>`;
    } else if (client.status === 'new') {
      statusBadge = `<span class="badge badge-new" style="margin-left:8px;">New Member</span>`;
    }

    document.getElementById('profile-hero').innerHTML = `
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;width:100%;">
        <div class="avatar avatar-lg" style="background:${client.avatarColor};color:#fff;flex-shrink:0;">${client.initials}</div>

        <div class="profile-elo-display">
          <div class="profile-elo-label">ELO Rating</div>
          <div class="profile-elo-value">${client.elo.toLocaleString()}</div>
          <div style="margin-top:6px;font-size:0.75rem;" class="elo-delta ${deltaClass}">${deltaText} last class</div>
        </div>

        <div class="profile-info">
          <div class="profile-name">
            ${client.name}
            ${youTag}
            ${statusBadge}
          </div>
          <div class="profile-meta">
            <div class="profile-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${client.location}
            </div>
            <div class="profile-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              ${client.classType}
            </div>
            <div class="profile-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Joined ${formatDate(client.joinDate)}
            </div>
            <div class="profile-meta-item" style="color:var(--accent);font-weight:600;">
              ${rankDisplay} on Leaderboard
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;margin-left:auto;">
          <div style="text-align:center;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px 20px;">
            <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-secondary);margin-bottom:4px;">K-Factor</div>
            <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--accent);">${ELO.getKFactor(client.totalClasses)}</div>
          </div>
        </div>
      </div>
    `;
  }

  // ─── Stats Grid ───────────────────────────────────────────
  function renderStats() {
    // Calculate win rate (rank 1 sessions)
    const wins = client.history.filter(h => h.rank === 1).length;
    const winRate = client.history.length > 0
      ? Math.round((wins / client.history.length) * 100)
      : 0;

    // ELO peak
    const peakElo = client.history.reduce((max, h) => Math.max(max, h.elo), 0);

    // Weeks since last active
    const lastDate = new Date(client.lastActive);
    const now = new Date('2026-03-22');
    const weeksInactive = Math.floor((now - lastDate) / (7 * 24 * 60 * 60 * 1000));
    const isDecaying = weeksInactive > 4;

    document.getElementById('stat-total-classes').textContent = client.totalClasses;
    document.getElementById('stat-best-rank').textContent = client.bestRank !== 99 ? `#${client.bestRank}` : '—';
    document.getElementById('stat-win-rate').textContent = `${winRate}%`;
    document.getElementById('stat-streak').textContent = client.streak;
    document.getElementById('stat-peak-elo').textContent = peakElo.toLocaleString();
    document.getElementById('stat-last-active').textContent = formatRelativeDate(client.lastActive);

    if (isDecaying) {
      document.getElementById('stat-last-active').style.color = 'var(--warning)';
      document.getElementById('decay-warning').style.display = 'flex';
    }
  }

  // ─── ELO Chart ────────────────────────────────────────────
  function renderChart() {
    const history = client.history;
    if (history.length === 0) return;

    const labels = history.map(h => {
      const d = new Date(h.date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const eloValues = history.map(h => h.elo);

    // Gradient fill
    const ctx = document.getElementById('elo-chart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(57, 181, 74, 0.3)');
    gradient.addColorStop(1, 'rgba(57, 181, 74, 0.0)');

    eloChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'ELO Rating',
          data: eloValues,
          borderColor: '#39B54A',
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#39B54A',
          pointBorderColor: '#1A1A2E',
          pointBorderWidth: 2,
          pointRadius: history.length > 15 ? 3 : 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#39B54A',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e2a4a',
            borderColor: 'rgba(57,181,74,0.4)',
            borderWidth: 1,
            titleColor: '#ffffff',
            bodyColor: '#A0A0A0',
            padding: 12,
            callbacks: {
              title: (items) => labels[items[0].dataIndex],
              label: (item) => {
                const h = history[item.dataIndex];
                const deltaStr = h.delta > 0 ? `+${h.delta}` : h.delta < 0 ? `${h.delta}` : '±0';
                return [
                  ` ELO: ${item.raw.toLocaleString()}  (${deltaStr})`,
                  ` Rank in class: #${h.rank}`,
                  ` Composite: ${Math.round((h.composite || 0) * 100)}%`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#A0A0A0',
              font: { family: 'Inter', size: 11 },
              maxTicksLimit: 8,
            },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#A0A0A0',
              font: { family: 'Inter', size: 11 },
              callback: v => v.toLocaleString(),
            },
            suggestedMin: Math.max(800, Math.min(...eloValues) - 50),
            suggestedMax: Math.max(...eloValues) + 50,
          },
        },
      },
    });
  }

  // ─── Session History Table ────────────────────────────────
  function renderHistory() {
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = '';

    const recentSessions = [...client.history].reverse().slice(0, 15);

    if (recentSessions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-secondary);">No sessions yet</td></tr>`;
      return;
    }

    recentSessions.forEach((session, index) => {
      const deltaClass = session.delta > 0 ? 'elo-delta-up' : session.delta < 0 ? 'elo-delta-down' : 'elo-delta-neutral';
      const deltaText = session.delta > 0 ? `+${session.delta}` : session.delta < 0 ? `${session.delta}` : '±0';
      const rankBadgeClass = session.rank <= 3 ? `rank-${session.rank}` : 'rank-other';
      const composite = session.composite ? `${Math.round(session.composite * 100)}%` : '—';

      const tr = document.createElement('tr');
      tr.classList.add('animate-in');
      tr.style.animationDelay = `${index * 0.04}s`;
      tr.innerHTML = `
        <td style="font-size:0.85rem;color:var(--text-secondary);">${formatDate(session.date)}</td>
        <td>
          <div class="rank-badge ${rankBadgeClass}" style="width:28px;height:28px;font-size:0.8rem;">${session.rank}</div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:50px;background:rgba(255,255,255,0.06);border-radius:3px;height:4px;overflow:hidden;">
              <div style="width:${Math.round((session.composite || 0) * 100)}%;height:100%;background:var(--accent);border-radius:3px;"></div>
            </div>
            <span style="font-size:0.8rem;color:var(--text-secondary);">${composite}</span>
          </div>
        </td>
        <td>
          <span class="elo-delta ${deltaClass}" style="font-size:0.875rem;font-weight:700;">${deltaText}</span>
        </td>
        <td style="font-family:var(--font-display);font-weight:700;font-size:0.9rem;">${session.elo.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ─── Personal Records ─────────────────────────────────────
  function renderPersonalRecords() {
    const wins = client.history.filter(h => h.rank === 1).length;
    const top3 = client.history.filter(h => h.rank <= 3).length;
    const avgComposite = client.history.length > 0
      ? Math.round(client.history.reduce((s, h) => s + (h.composite || 0), 0) / client.history.length * 100)
      : 0;

    // Longest win streak
    let longestStreak = 0;
    let currentStreak = 0;
    client.history.forEach(h => {
      if (h.rank <= 2) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    // ELO gain/loss extremes
    const maxGain = client.history.reduce((max, h) => Math.max(max, h.delta || 0), 0);
    const maxLoss = client.history.reduce((min, h) => Math.min(min, h.delta || 0), 0);

    document.getElementById('pr-wins').textContent = wins;
    document.getElementById('pr-top3').textContent = top3;
    document.getElementById('pr-avg-composite').textContent = `${avgComposite}%`;
    document.getElementById('pr-best-composite').textContent = `${Math.round((client.maxComposite || 0) * 100)}%`;
    document.getElementById('pr-longest-streak').textContent = longestStreak;
    document.getElementById('pr-max-gain').textContent = maxGain > 0 ? `+${maxGain}` : '—';
    document.getElementById('pr-max-loss').textContent = maxLoss < 0 ? `${maxLoss}` : '—';
  }

  // ─── Client Nav (prev/next) ───────────────────────────────
  function renderClientNav() {
    const ranked = ZappData.getSortedLeaderboard(allClients);
    const currentIdx = ranked.findIndex(c => c.id === client.id);

    const prevBtn = document.getElementById('btn-prev-client');
    const nextBtn = document.getElementById('btn-next-client');

    if (prevBtn && currentIdx > 0) {
      const prev = ranked[currentIdx - 1];
      prevBtn.href = `profile.html?id=${prev.id}`;
      prevBtn.title = prev.name;
      prevBtn.style.display = 'inline-flex';
    } else if (prevBtn) {
      prevBtn.style.display = 'none';
    }

    if (nextBtn && currentIdx < ranked.length - 1 && currentIdx >= 0) {
      const next = ranked[currentIdx + 1];
      nextBtn.href = `profile.html?id=${next.id}`;
      nextBtn.title = next.name;
      nextBtn.style.display = 'inline-flex';
    } else if (nextBtn) {
      nextBtn.style.display = 'none';
    }
  }

  // ─── Helpers ─────────────────────────────────────────────
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatRelativeDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date('2026-03-22');
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }

  // ─── Run ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
