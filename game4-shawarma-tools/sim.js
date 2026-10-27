const E = require('../game4-shawarma/economy.js');
function sim(profile, opt) {
  opt = opt || {};
  const S = E.fresh(opt.stars || 0);
  let t = 0, heat = 0, fire = 0, taps = 0, log = {}, nextAct = 0;
  const dt = 0.25, MAXT = 3 * 3600;
  const marks = [];
  function tapRate() { return t < profile.burst ? profile.hi : profile.lo; }
  function gainWays() {
    const cps0 = E.baseCps(S), tr = tapRate();
    const out = [];
    for (let i = 0; i < E.N; i++) {
      if (i > 0 && S.n[i - 1] === 0) continue;
      const cost = E.unitCost(i, S.n[i]);
      S.n[i]++; const d = E.baseCps(S) - cps0; S.n[i]--;
      out.push({ cost, d, act: () => { S.cash -= cost; S.n[i]++; } , k: 'stand' + i });
    }
    E.UPS.forEach(u => {
      if (!E.upCanBuy(S, u)) return;
      S.up[u.id] = true; const d = E.baseCps(S) - cps0; S.up[u.id] = false; delete S.up[u.id];
      out.push({ cost: u.cost, d: d + (u.kind === 'global' ? tr * E.tapValue(S) * (1 - 1 / u.mult) : 0), act: () => { S.cash -= u.cost; S.up[u.id] = true; }, k: u.id });
    });
    if (S.tap < E.TAP_MAX) {
      const c = E.tapCost(S.tap), v0 = E.tapValue(S); S.tap++; const v1 = E.tapValue(S); S.tap--;
      out.push({ cost: c, d: tr * (v1 - v0) * 1.3, act: () => { S.cash -= c; S.tap++; }, k: 'tap' });
    }
    return out;
  }
  let firstGainT = {};
  while (t < MAXT) {
    // taps
    const tr = tapRate();
    const nt = tr * dt + (Math.random() < 0 ? 0 : 0);
    S._tf = (S._tf || 0) + nt; let k = Math.floor(S._tf); S._tf -= k;
    for (let q = 0; q < k; q++) {
      taps++;
      let m = 1; if (taps % E.CRIT_EVERY === 0) m *= E.CRIT_MULT; if (fire > 0) m *= E.FIRE_MULT;
      const v = E.tapValue(S, m) * (S.boost > 0 ? 2 : 1); S.cash += v; S.run += v; S.life += v;
      if (fire <= 0) { heat += E.HEAT_TAP; if (heat >= 100) { fire = E.FIRE_T; heat = 0; } }
    }
    if (fire > 0) { fire -= dt; if (fire <= 0) { fire = 0; heat = 0; } } else heat = Math.max(0, heat - E.HEAT_DECAY * dt);
    const inc = E.baseCps(S) * dt; S.cash += inc; S.run += inc; S.life += inc;
    t += dt;
    // purchase decisions every profile.think seconds
    if (t >= nextAct) {
      nextAct = t + profile.think;
      for (let guard = 0; guard < 50; guard++) {
        const ways = gainWays().filter(w => w.d > 0);
        if (!ways.length) break;
        ways.forEach(w => w.pb = w.cost / w.d);
        ways.sort((a, b) => a.pb - b.pb);
        const best = ways[0];
        let pick = null;
        if (best.cost <= S.cash) pick = best;
        else {
          // would a cheaper-affordable item with pb <= 1.5*best be bought?
          const cand = ways.find(w => w.cost <= S.cash && w.pb <= best.pb * profile.greed);
          if (cand && (best.cost - S.cash) / Math.max(1, E.baseCps(S) + tapRate() * E.tapValue(S)) > profile.wait) pick = cand;
        }
        if (!pick) break;
        pick.act(); log[pick.k] = (log[pick.k] || 0) + 1;
      }
    }
    if (opt.curve && Math.abs(t % 300) < dt / 2) opt.curve.push([Math.round(t / 60), S.run, E.baseCps(S), S.n.join(',')]);
    const g = E.prestigeGain(S.run);
    [1, 5, 10, 20].forEach(x => { if (g >= x && !firstGainT[x]) firstGainT[x] = t; });
    if (opt.stopAt && g >= opt.stopAt) break;
  }
  return { t, firstGainT, S, taps, log };
}
const P = {
  active: { burst: 600, hi: 4, lo: 1.5, think: 4, greed: 1.6, wait: 20 },
  relaxed: { burst: 300, hi: 3, lo: 0.6, think: 8, greed: 1.8, wait: 30 }
};
const m = s => (s / 60).toFixed(1) + 'm';
for (const [name, p] of Object.entries(P)) {
  const curve = []; const r = sim(p, { stopAt: 20, curve });
  if (process.env.CURVE) curve.forEach(c => console.log('  ', c[0] + 'm run=' + c[1].toExponential(2) + ' cps=' + c[2].toExponential(2) + ' n=' + c[3]));
  console.log(name, 'gain>=1', m(r.firstGainT[1] || 1e9), '>=5', m(r.firstGainT[5] || 1e9), '>=10', m(r.firstGainT[10] || 1e9), '>=20', m(r.firstGainT[20] || 1e9), 'stands', r.S.n.join(','), 'tap', r.S.tap, 'ups', Object.keys(r.S.up).length);
}
if (process.argv[2] === 'second') {
  const p = P.active;
  let stars = 0;
  for (let run = 0; run < 4; run++) {
    const r = sim(p, { stars, stopAt: 0 });
  }
}
if (process.argv[2] === 'runs') {
  let stars = 0, tot = 0;
  for (let run = 1; run <= 5; run++) {
    const r = sim(P.active, { stars, stopAt: 10 });
    tot += r.t; stars += 10;
    console.log('run', run, 'start stars', stars - 10, 'gain>=10 at', m(r.t), 'stands', r.S.n.join(','));
  }
}
