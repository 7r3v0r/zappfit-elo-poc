// ============================================================
// admin.js — Athlete Management Page Logic
// ZappFit Performance Tracker
// ============================================================

(function () {
  'use strict';

  let clients = [];
  let editingId = null;
  let deletingId = null;
  let selectedColor = null;
  let activeStatus = 'all';
  let searchQuery = '';

  // ─── Init ─────────────────────────────────────────────────
  function init() {
    clients = ZappData.loadData();
    renderStats();
    renderRoster();
    buildColorPicker();
    bindEvents();
    // Pre-fill today's date in join date field
    document.getElementById('f-joindate').value = new Date().toISOString().split('T')[0];
    if (window.lucide) lucide.createIcons();
  }

  // ─── Stats ────────────────────────────────────────────────
  function renderStats() {
    const ranked = clients.filter(c => c.totalClasses >= 5);
    const elos = clients.map(c => c.elo);
    const top = clients.reduce((best, c) => (!best || c.elo > best.elo) ? c : best, null);

    document.getElementById('stat-total').textContent = clients.length;
    document.getElementById('stat-ranked').textContent = ranked.length;
    document.getElementById('stat-top').textContent = top ? top.elo.toLocaleString() : '—';
    document.getElementById('stat-top-name').textContent = top ? top.name : '—';

    const avg = elos.length ? Math.round(elos.reduce((a, b) => a + b, 0) / elos.length) : 0;
    document.getElementById('stat-avg').textContent = avg.toLocaleString();
  }

  // ─── Roster ───────────────────────────────────────────────
  function renderRoster() {
    const tbody = document.getElementById('roster-tbody');
    tbody.innerHTML = '';

    const filtered = clients.filter(c => {
      const matchStatus = activeStatus === 'all' || c.status === activeStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.classType.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

    document.getElementById('empty-state').style.display = filtered.length === 0 ? 'block' : 'none';

    filtered.forEach(client => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', client.id);
      tr.classList.add('animate-in');

      const statusClass = {
        established: 'status-established',
        provisional: 'status-provisional',
        new: 'status-new',
      }[client.status] || 'status-new';

      const youTag = client.isYou
        ? '<span class="you-tag" style="margin-left:4px;">YOU</span>'
        : '';

      tr.innerHTML = `
        <td>
          <div class="avatar" style="background:${client.avatarColor};color:#fff;font-size:0.68rem;width:32px;height:32px;">${client.initials}</div>
        </td>
        <td>
          <div style="font-weight:600;font-size:0.875rem;">${client.name}${youTag}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">ID: ${client.id}</div>
        </td>
        <td style="font-size:0.8rem;color:var(--text-secondary);">${client.location}</td>
        <td style="font-size:0.8rem;color:var(--text-secondary);">${client.classType}</td>
        <td><span class="status-chip ${statusClass}">${client.status}</span></td>
        <td>
          <span style="font-family:var(--font-display);font-size:1rem;">${client.elo.toLocaleString()}</span>
        </td>
        <td style="font-size:0.85rem;color:var(--text-secondary);">${client.totalClasses}</td>
        <td style="font-size:0.8rem;color:var(--text-muted);">${client.joinDate}</td>
        <td>
          <div class="action-cell" style="justify-content:flex-end;">
            <button class="btn-icon btn-edit" title="Edit" data-id="${client.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon btn-delete danger" title="Delete" data-id="${client.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Bind row actions
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => promptDelete(btn.getAttribute('data-id')));
    });
  }

  // ─── Color Picker ─────────────────────────────────────────
  function buildColorPicker() {
    const grid = document.getElementById('color-picker');
    grid.innerHTML = '';
    ZappData.AVATAR_COLORS.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.background = color;
      swatch.setAttribute('data-color', color);
      swatch.addEventListener('click', () => {
        grid.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        selectedColor = color;
      });
      grid.appendChild(swatch);
    });
  }

  function setPickerColor(color) {
    const grid = document.getElementById('color-picker');
    grid.querySelectorAll('.color-swatch').forEach(s => {
      s.classList.toggle('selected', s.getAttribute('data-color') === color);
    });
    selectedColor = color;
  }

  // ─── Modal: Add ───────────────────────────────────────────
  function openAddModal() {
    editingId = null;
    document.getElementById('modal-title').textContent = 'ADD ATHLETE';
    document.getElementById('f-name').value = '';
    document.getElementById('f-location').value = 'Downtown';
    document.getElementById('f-classtype').value = 'HIIT';
    document.getElementById('f-joindate').value = new Date().toISOString().split('T')[0];
    document.getElementById('f-elo').value = '1200';
    document.getElementById('elo-field-wrap').style.display = 'block';

    // Pick an unused color
    const usedColors = new Set(clients.map(c => c.avatarColor));
    const pick = ZappData.AVATAR_COLORS.find(c => !usedColors.has(c)) || ZappData.AVATAR_COLORS[0];
    setPickerColor(pick);

    document.getElementById('modal-save').textContent = 'Add Athlete';
    openModal();
  }

  // ─── Modal: Edit ──────────────────────────────────────────
  function openEditModal(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    editingId = id;
    document.getElementById('modal-title').textContent = 'EDIT ATHLETE';
    document.getElementById('f-name').value = client.name;
    document.getElementById('f-location').value = client.location;
    document.getElementById('f-classtype').value = client.classType;
    document.getElementById('f-joindate').value = client.joinDate;
    document.getElementById('f-elo').value = client.elo;
    document.getElementById('elo-field-wrap').style.display = 'block';

    setPickerColor(client.avatarColor);

    document.getElementById('modal-save').textContent = 'Save Changes';
    openModal();
  }

  function openModal() {
    document.getElementById('athlete-modal').classList.add('open');
    document.getElementById('f-name').focus();
  }

  function closeModal() {
    document.getElementById('athlete-modal').classList.remove('open');
    editingId = null;
  }

  // ─── Save ─────────────────────────────────────────────────
  function saveAthlete() {
    const name = document.getElementById('f-name').value.trim();
    if (!name) {
      showToast('Athlete name is required.', 'error');
      document.getElementById('f-name').focus();
      return;
    }

    const data = {
      name,
      location: document.getElementById('f-location').value,
      classType: document.getElementById('f-classtype').value,
      joinDate: document.getElementById('f-joindate').value,
      elo: document.getElementById('f-elo').value,
      avatarColor: selectedColor,
    };

    if (editingId) {
      ZappData.editClient(clients, editingId, data);
      showToast(`${name} updated.`, 'success');
    } else {
      ZappData.addClient(clients, data);
      showToast(`${name} added to roster!`, 'success');
    }

    ZappData.saveData(clients);
    closeModal();
    renderStats();
    renderRoster();
  }

  // ─── Delete ───────────────────────────────────────────────
  function promptDelete(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    deletingId = id;
    document.getElementById('delete-name').textContent = client.name;
    document.getElementById('confirm-delete-bar').classList.add('visible');
    document.getElementById('confirm-delete-bar').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function confirmDelete() {
    if (!deletingId) return;
    const client = clients.find(c => c.id === deletingId);
    ZappData.deleteClient(clients, deletingId);
    ZappData.saveData(clients);
    showToast(`${client ? client.name : 'Athlete'} removed.`, 'info');
    deletingId = null;
    document.getElementById('confirm-delete-bar').classList.remove('visible');
    renderStats();
    renderRoster();
  }

  function cancelDelete() {
    deletingId = null;
    document.getElementById('confirm-delete-bar').classList.remove('visible');
  }

  // ─── Events ───────────────────────────────────────────────
  function bindEvents() {
    document.getElementById('btn-add-athlete').addEventListener('click', openAddModal);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', saveAthlete);
    document.getElementById('btn-confirm-delete').addEventListener('click', confirmDelete);
    document.getElementById('btn-cancel-delete').addEventListener('click', cancelDelete);

    // Close modal on backdrop click
    document.getElementById('athlete-modal').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    // Search
    document.getElementById('roster-search').addEventListener('input', function () {
      searchQuery = this.value;
      renderRoster();
    });

    // Status filter chips
    document.getElementById('filter-status-bar').addEventListener('click', function (e) {
      const chip = e.target.closest('[data-status]');
      if (!chip) return;
      activeStatus = chip.getAttribute('data-status');
      this.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderRoster();
    });

    // Enter key in form
    document.getElementById('f-name').addEventListener('keydown', e => {
      if (e.key === 'Enter') saveAthlete();
    });
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
