var G = require('../game3-sort/gen.js');
var t0 = Date.now(), bad = 0, rows = [];
for (var n = 1; n <= 320; n++) {
  var t1 = Date.now(), L = G.generate(n), dt = Date.now() - t1;
  var tb = L.tubes.map(function (a) { return a.slice(); });
  var ok = true;
  L.sol.forEach(function (m) { if (!G.canMove(tb, m[0], m[1])) ok = false; else tb[m[1]].push(tb[m[0]].pop()); });
  if (!ok || !G.isWon(tb) || G.isWon(L.tubes)) bad++;
  var P = G.params(n);
  rows.push([n, L.k, L.e, L.sol.length, L.mix, L.att, dt, ok]);
}
console.log('bad', bad, 'ms', Date.now() - t0);
[1, 2, 3, 5, 8, 10, 20, 40, 80, 120, 150, 200, 240, 300, 320].forEach(function (n) { console.log(rows[n - 1].join(' ')); });
var worstAtt = rows.reduce(function (m, r) { return Math.max(m, r[5]); }, 0), worstMs = rows.reduce(function (m, r) { return Math.max(m, r[6]); }, 0);
console.log('worst att', worstAtt, 'worst ms', worstMs);
var fl = rows.filter(function (r) { var need = Math.floor(G.params(r[0]).mix * 3 * r[1]); return r[4] < need; }).length;
console.log('below target mix', fl);
