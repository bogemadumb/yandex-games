var fs = require('fs'), G = require('../game3-sort/gen.js'), S = require('./solver.js');
var pars = [], t0 = Date.now(), fails = 0;
for (var n = 1; n <= G.TOTAL; n++) {
  var L = G.generate(n), best = null, cfg = L.k <= 4 ? [[1, 4e6]] : (L.k <= 8 ? [[1, 1.5e6], [1.5, 1.5e6]] : [[1.5, 1.5e6], [2.5, 1.5e6], [4, 2e6]]);
  if (L.k <= 4) { var b = S.bfs(L.tubes, 6e6); if (b && S.verify(L.tubes, b.path)) best = b.moves; }
  for (var i = 0; i < cfg.length && best === null; i++) { var r = S.wastar(L.tubes, cfg[i][0], cfg[i][1], 300); if (r && S.verify(L.tubes, r.path)) best = r.moves; }
  if (best === null && L.sol) best = L.sol.length;
  if (best === null) { fails++; best = Math.round(L.k * 4); }
  pars.push(best);
}
fs.writeFileSync('../game3-sort/pars.js', 'window.SortPars=' + JSON.stringify(pars) + ';\n');
console.log('done', pars.length, 'fails', fails, (Date.now() - t0) + 'ms');
