(function (root) {
  var E = {};
  E.N = 8;
  E.COST0 = [10, 150, 2500, 4e4, 7e5, 1.3e7, 2.5e8, 5e9];
  E.INC = [0.5, 2.5, 14, 83, 580, 3600, 2.3e4, 1.4e5];
  E.GROW = 1.15;
  E.MS = [25, 50, 100, 150, 200, 300, 400];
  E.HEAT_TAP = 4; E.HEAT_DECAY = 6; E.FIRE_T = 5; E.FIRE_MULT = 3; E.CRIT_EVERY = 10; E.CRIT_MULT = 5;
    E.STAR_DIV = 4e4; E.STAR_MIN = 10; E.STAR_BONUS = 0.1;
  E.TAP_MAX = 30; E.OFF_MAX = 10;

  E.UPS = [];
  for (var i = 0; i < E.N; i++) {
    E.UPS.push({ id: 's' + i + 'a', kind: 'stand', i: i, need: 10, cost: E.COST0[i] * 100, mult: 2, n: 'up_a' });
    E.UPS.push({ id: 's' + i + 'b', kind: 'stand', i: i, need: 40, cost: E.COST0[i] * 5000, mult: 3, n: 'up_b' });
  }
  E.UPS.push({ id: 'g1', kind: 'global', cost: 5e4, mult: 1.5, n: 'g_1' });
  E.UPS.push({ id: 'g2', kind: 'global', cost: 5e6, mult: 2, n: 'g_2' });
  E.UPS.push({ id: 'g3', kind: 'global', cost: 5e8, mult: 2, n: 'g_3' });
  E.UPS.push({ id: 'g4', kind: 'global', cost: 5e10, mult: 3, n: 'g_4' });
  E.UPS.push({ id: 'g5', kind: 'global', cost: 5e12, mult: 5, n: 'g_5' });
  E.UPMAP = {}; E.UPS.forEach(function (u) { E.UPMAP[u.id] = u; });

  E.unitCost = function (i, n) { return E.COST0[i] * Math.pow(E.GROW, n); };
  E.bulkCost = function (i, n, k) { return E.COST0[i] * Math.pow(E.GROW, n) * (Math.pow(E.GROW, k) - 1) / (E.GROW - 1); };
  E.maxBuy = function (i, n, cash) {
    var c = E.unitCost(i, n); if (cash < c) return 0;
    var k = Math.floor(Math.log(1 + cash * (E.GROW - 1) / c) / Math.log(E.GROW));
    while (k > 0 && E.bulkCost(i, n, k) > cash) k--;
    while (E.bulkCost(i, n, k + 1) <= cash) k++;
    return k;
  };
  E.msMult = function (n) { var m = 1; for (var j = 0; j < E.MS.length; j++) if (n >= E.MS[j]) m *= 2; return m; };
  E.nextMs = function (n) { for (var j = 0; j < E.MS.length; j++) if (n < E.MS[j]) return E.MS[j]; return 0; };
  E.starMult = function (stars) { return 1 + E.STAR_BONUS * stars; };
  E.standMult = function (S, i) {
    var m = E.msMult(S.n[i]);
    if (S.up['s' + i + 'a']) m *= 2;
    if (S.up['s' + i + 'b']) m *= 3;
    return m;
  };
  E.globalMult = function (S) {
    var m = E.starMult(S.stars);
    for (var k = 1; k <= 5; k++) if (S.up['g' + k]) m *= E.UPMAP['g' + k].mult;
    return m;
  };
  E.standIncome = function (S, i) { return S.n[i] * E.INC[i] * E.standMult(S, i); };
  E.baseCps = function (S) { var s = 0; for (var i = 0; i < E.N; i++) s += E.standIncome(S, i); return s * E.globalMult(S); };
  E.tapCost = function (l) { return Math.round(40 * Math.pow(1.95, l)); };
  E.tapBase = function (l) { return 1 + l; };
  E.tapPct = function (l) { return 0.004 * l; };
  E.offCost = function (l) { return Math.round(5000 * Math.pow(3.2, l)); };
  E.offEff = function (l) { return 0.25 + 0.05 * l; };
  E.offCap = function (l) { return 2 + l; };
  E.tapValue = function (S, mult) {
    return (E.tapBase(S.tap) * E.starMult(S.stars) * E.upGlobalOnly(S) + E.baseCps(S) * E.tapPct(S.tap)) * (mult || 1);
  };
  E.upGlobalOnly = function (S) { var m = 1; for (var k = 1; k <= 5; k++) if (S.up['g' + k]) m *= E.UPMAP['g' + k].mult; return m; };
  E.prestigeGain = function (run) { return Math.floor(Math.sqrt(Math.max(0, run) / E.STAR_DIV)); };
  E.upAvailable = function (S, u) {
    if (S.up[u.id]) return false;
    if (u.kind === 'stand') return S.n[u.i] >= Math.max(1, u.need - 5) || S.run >= u.cost / 4;
    return S.run >= u.cost / 10;
  };
  E.upCanBuy = function (S, u) { return !S.up[u.id] && (u.kind === 'global' || S.n[u.i] >= u.need); };
  E.fresh = function (stars) { return { cash: 0, run: 0, life: 0, stars: stars || 0, n: [0, 0, 0, 0, 0, 0, 0, 0], up: {}, tap: 0, off: 0, boost: 0 }; };
  if (typeof module !== 'undefined' && module.exports) module.exports = E; else root.ECO = E;
})(typeof window !== 'undefined' ? window : this);
