// ============================================================
// elo.js — ELO Calculation Engine
// ZappFit Performance Tracker
// ============================================================

const ELO_ENGINE = (() => {
  const FLOOR = 800;

  // ─── K-Factor ─────────────────────────────────────────────
  function getKFactor(totalClasses) {
    if (totalClasses >= 100) return 10;
    if (totalClasses >= 15) return 20;
    return 40;
  }

  // ─── Expected Score ────────────────────────────────────────
  // E(A) = 1 / (1 + 10^((R_B - R_A) / 400))
  function expectedScore(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  // ─── Percentile Calculation ────────────────────────────────
  // Returns value in [0, 1] based on rank within group
  // Higher metric value = higher percentile
  function calcPercentile(values) {
    const n = values.length;
    if (n === 0) return [];
    if (n === 1) return [0.5];

    // Rank each value (1 = lowest → lowest percentile)
    const sorted = [...values].sort((a, b) => a - b);

    return values.map(v => {
      // Count how many values are strictly below v
      const below = sorted.filter(x => x < v).length;
      const equal = sorted.filter(x => x === v).length;
      // Midpoint rank method
      const rank = below + (equal - 1) / 2;
      return rank / (n - 1 === 0 ? 1 : n - 1);
    });
  }

  // ─── Composite Score ──────────────────────────────────────
  // Weights: Reps=0.35, Rounds=0.30, Weight=0.20, Calories=0.15
  // Missing metrics are excluded and weights re-normalized
  const BASE_WEIGHTS = {
    reps: 0.35,
    rounds: 0.30,
    weight: 0.20,
    calories: 0.15,
  };

  /**
   * Calculate composite scores for a session.
   * @param {Array<Object>} participants - Array of { id, reps?, rounds?, weight?, calories? }
   * @returns {Array<Object>} Same array with .composite added, and .percentiles object
   */
  function calcCompositeScores(participants) {
    const metrics = ['reps', 'rounds', 'weight', 'calories'];

    // Determine which metrics are present for at least one participant
    const presentMetrics = metrics.filter(m =>
      participants.some(p => p[m] !== undefined && p[m] !== null && p[m] !== '')
    );

    if (presentMetrics.length === 0) {
      return participants.map(p => ({ ...p, composite: 0.5, percentiles: {} }));
    }

    // Compute raw weight sum for normalization
    const totalWeight = presentMetrics.reduce((sum, m) => sum + BASE_WEIGHTS[m], 0);

    // Compute per-metric percentiles
    const metricPercentiles = {};
    for (const m of presentMetrics) {
      const values = participants.map(p => {
        const v = parseFloat(p[m]);
        return isNaN(v) ? 0 : v;
      });
      metricPercentiles[m] = calcPercentile(values);
    }

    // Compute composite
    return participants.map((p, i) => {
      let composite = 0;
      const percs = {};
      for (const m of presentMetrics) {
        const w = BASE_WEIGHTS[m] / totalWeight; // normalized weight
        const perc = metricPercentiles[m][i];
        composite += w * perc;
        percs[m] = Math.round(perc * 100);
      }
      return {
        ...p,
        composite: Math.round(composite * 10000) / 10000,
        percentiles: percs,
      };
    });
  }

  // ─── Rank Participants ────────────────────────────────────
  // Returns participants with .rank (1 = best composite)
  function rankParticipants(participants) {
    const sorted = [...participants].sort((a, b) => b.composite - a.composite);
    return participants.map(p => {
      const rank = sorted.findIndex(s => s.id === p.id) + 1;
      return { ...p, rank };
    });
  }

  // ─── ELO Pairwise Update ──────────────────────────────────
  /**
   * Run full round-robin ELO update for a session.
   * @param {Array<Object>} participants - Each must have: id, elo, totalClasses, composite
   * @returns {Array<Object>} Each participant with .newElo and .eloDelta
   */
  function runPairwiseElo(participants) {
    // Validate
    if (!participants || participants.length < 2) {
      return participants.map(p => ({ ...p, newElo: p.elo, eloDelta: 0 }));
    }

    // Initialize delta accumulator
    const deltas = {};
    participants.forEach(p => { deltas[p.id] = 0; });

    // Round-robin: every A vs every B (A < B by index to avoid duplicates,
    // but we apply updates to both)
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const A = participants[i];
        const B = participants[j];

        const eA = expectedScore(A.elo, B.elo);
        const eB = expectedScore(B.elo, A.elo); // = 1 - eA

        // Actual score: based on composite rank (lower rank number = better = wins)
        let sA, sB;
        if (A.composite > B.composite) {
          sA = 1; sB = 0;
        } else if (A.composite < B.composite) {
          sA = 0; sB = 1;
        } else {
          sA = 0.5; sB = 0.5;
        }

        const kA = getKFactor(A.totalClasses);
        const kB = getKFactor(B.totalClasses);

        deltas[A.id] += kA * (sA - eA);
        deltas[B.id] += kB * (sB - eB);
      }
    }

    // Apply deltas with floor
    return participants.map(p => {
      const rawNew = p.elo + deltas[p.id];
      const newElo = Math.max(FLOOR, Math.round(rawNew));
      const eloDelta = newElo - p.elo;
      return { ...p, newElo, eloDelta };
    });
  }

  // ─── Full Session Pipeline ────────────────────────────────
  /**
   * Full pipeline: composite → rank → ELO pairwise
   * @param {Array<Object>} participants - { id, elo, totalClasses, reps?, rounds?, weight?, calories? }
   * @returns {Array<Object>} Enriched with composite, rank, newElo, eloDelta, percentiles
   */
  function processSession(participants) {
    // Step 1: Composite scores
    let withComposite = calcCompositeScores(participants);

    // Step 2: Rank
    let withRank = rankParticipants(withComposite);

    // Step 3: ELO pairwise
    let withElo = runPairwiseElo(withRank);

    // Sort by rank for display
    return withElo.sort((a, b) => a.rank - b.rank);
  }

  // ─── Inactivity Decay ─────────────────────────────────────
  /**
   * Apply inactivity decay: 5 pts/week after 4 weeks inactive, floor 800.
   * @param {Object} client - Client object with lastActive and elo
   * @param {Date} [now] - Reference date (defaults to today)
   * @returns {number} Decayed ELO
   */
  function applyInactivityDecay(client, now = new Date()) {
    const lastDate = new Date(client.lastActive);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksInactive = Math.floor((now - lastDate) / msPerWeek);

    if (weeksInactive <= 4) return client.elo;

    const decayWeeks = weeksInactive - 4;
    const decayAmount = decayWeeks * 5;
    return Math.max(FLOOR, client.elo - decayAmount);
  }

  // Public API
  return {
    getKFactor,
    expectedScore,
    calcPercentile,
    calcCompositeScores,
    rankParticipants,
    runPairwiseElo,
    processSession,
    applyInactivityDecay,
    FLOOR,
  };
})();

window.ELO = ELO_ENGINE;
