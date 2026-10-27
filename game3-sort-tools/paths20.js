var G = require('../game3-sort/gen.js'), S = require('./solver.js'), out = {};
for (var n = 1; n <= 20; n++) out[n] = S.bfs(G.generate(n).tubes, 8e6).path;
require('fs').writeFileSync(process.argv[2], JSON.stringify(out));
