var G = require('../game3-sort/gen.js'), S = require('./solver.js');
var step = Number(process.argv[2] || 10), from = Number(process.argv[3] || 1);
var rows = [];
for (var n = from; n <= 320; n += step) {
  var L = G.generate(n), r = null, t0 = Date.now();
  if (L.k <= 4) r = S.bfs(L.tubes, 3e6);
  if (!r) r = S.wastar(L.tubes, 1.5, 1.5e6, 400);
  rows.push(n + ' k' + L.k + ' e' + L.e + ' mix ' + L.mix + '/' + 3 * L.k + ' opt ' + (r ? r.moves : 'FAIL') + ' att ' + L.att + ' ' + (Date.now() - t0) + 'ms');
}
console.log(rows.join('\n'));
