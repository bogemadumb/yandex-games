var G = require('../game3-sort/gen.js'), S = require('./solver.js');
var fails = [], t0 = Date.now();

// 1. structure + determinism
var structBad = 0, detBad = 0, startWon = 0, e1 = 0, e2 = 0;
for (var n = 1; n <= G.TOTAL; n++) {
  var L = G.generate(n), L2 = G.generate(n), P = G.params(n);
  var cnt = {}, ok = L.tubes.length === P.k + P.e && L.k === P.k;
  L.tubes.forEach(function (t) { if (t.length !== 0 && t.length !== 4) ok = false; t.forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; if (c < 1 || c > P.k) ok = false; }); });
  for (var c = 1; c <= P.k; c++) if (cnt[c] !== 4) ok = false;
  if (L.tubes.filter(function (t) { return !t.length; }).length !== P.e) ok = false;
  if (!ok) structBad++;
  if (JSON.stringify(L.tubes) !== JSON.stringify(L2.tubes)) detBad++;
  if (G.isWon(L.tubes)) startWon++;
  if (P.e === 1) e1++; else e2++;
}
console.log('1) structure: levels', G.TOTAL, 'bad', structBad, 'nondeterministic', detBad, 'already-solved at start', startWon, '| 2-empty', e2, '1-empty', e1);

// 2. BFS on first 20
var bfsOk = 0, sum = 0, mx = 0, nodes = 0, mn = 99, tb = Date.now();
for (n = 1; n <= 20; n++) {
  L = G.generate(n);
  var r = S.bfs(L.tubes, 8e6);
  if (r && S.verify(L.tubes, r.path)) { bfsOk++; sum += r.moves; mx = Math.max(mx, r.moves); mn = Math.min(mn, r.moves); nodes += r.nodes; } else fails.push('bfs ' + n);
}
console.log('2) BFS levels 1-20: solved', bfsOk + '/20', 'optimal moves min/avg/max', mn + '/' + (sum / 20).toFixed(1) + '/' + mx, 'states explored', nodes, (Date.now() - tb) + 'ms');

// 3. solver with move limit on all levels
var LIMIT = 150, solved = 0, msum = 0, mmax = 0, nsum = 0, replayBad = 0, ts = Date.now(), bands = {};
for (n = 1; n <= G.TOTAL; n++) {
  L = G.generate(n);
  var res = null, ws = [2, 4, 8];
  for (var i = 0; i < ws.length && !res; i++) res = S.wastar(L.tubes, ws[i], 2e6, LIMIT);
  if (res && S.verify(L.tubes, res.path) && res.moves <= LIMIT) { solved++; msum += res.moves; mmax = Math.max(mmax, res.moves); nsum += res.nodes; var b = Math.floor((n - 1) / 40); (bands[b] = bands[b] || []).push(res.moves); }
  else fails.push('solver ' + n);
}
console.log('3) solver (weighted A*, limit ' + LIMIT + ' moves): solved', solved + '/' + G.TOTAL, 'avg moves', (msum / solved).toFixed(1), 'max', mmax, 'avg nodes', Math.round(nsum / solved), (Date.now() - ts) + 'ms');
console.log('   avg solution length by 40-level band:', Object.keys(bands).map(function (b) { var a = bands[b]; return (b * 40 + 1) + '-' + (b * 40 + 40) + ':' + (a.reduce(function (x, y) { return x + y; }, 0) / a.length).toFixed(1); }).join('  '));

// 4. constructive proof for 1-empty levels
var cons = 0, consOk = 0;
for (n = 1; n <= G.TOTAL; n++) {
  L = G.generate(n); if (!L.sol) continue; cons++;
  var tbs = L.tubes.map(function (a) { return a.slice(); }), good = true;
  L.sol.forEach(function (m) { if (!G.canMove(tbs, m[0], m[1])) good = false; else tbs[m[1]].push(tbs[m[0]].pop()); });
  if (good && G.isWon(tbs)) consOk++; else fails.push('construct ' + n);
}
console.log('4) 1-empty levels, built by constrained reverse shuffle: replay of recorded solution', consOk + '/' + cons);

// 5. stuck-detector sanity
console.log('5) total time', (Date.now() - t0) + 'ms', 'FAILS:', fails.length ? fails.join(', ') : 'none');
