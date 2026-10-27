const fs = require('fs'), path = require('path');
const GAME = path.join(__dirname, '..', 'game5-flux');
const S = require(path.join(GAME, 'sim.js')); global.Sim = S;
const G = require(path.join(GAME, 'gen.js'));

const SPECS = [
  // world 1: spark
  [{ nA: 1, haz: 0, minTurn: 20, side: 0 }, { nA: 1, haz: 1, minTurn: 30, side: 0 }, { nR: 1, haz: 1, minTurn: 25 }, { nA: 1, nR: 1, haz: 1, minTurn: 50 }, { nA: 2, haz: 2, minTurn: 70 }, { nA: 1, nR: 1, haz: 2, rect: .5, minTurn: 90 }],
  // world 2: poles
  [{ nA: 1, nR: 1, haz: 2, rect: .4, minTurn: 100 }, { nA: 2, nR: 1, haz: 2, rect: .4, minTurn: 120 }, { nA: 1, nR: 2, haz: 3, rect: .4, minTurn: 120 }, { nA: 2, nR: 2, haz: 3, rect: .5, minTurn: 140 }, { nA: 3, nR: 1, haz: 3, rect: .5, minTurn: 150 }, { nA: 2, nR: 2, haz: 4, rect: .5, minTurn: 200 }],
  // world 3: anchors (fixed charges)
  [{ fixedA: 1, nA: 1, haz: 1, minTurn: 80 }, { fixedR: 1, nA: 1, haz: 2, minTurn: 90 }, { fixedA: 1, fixedR: 1, nA: 1, haz: 2, rect: .4, minTurn: 110 }, { fixedA: 1, nR: 1, nA: 1, haz: 3, rect: .4, minTurn: 130 }, { fixedA: 1, fixedR: 1, nA: 1, nR: 1, haz: 3, rect: .5, minTurn: 150 }, { fixedA: 2, fixedR: 1, nA: 2, nR: 1, haz: 4, rect: .5, minTurn: 180 }],
  // world 4: rebound
  [{ bounce: true, bump: 1, nA: 1, haz: 1, minTurn: 100 }, { bounce: true, bump: 1, nA: 1, nR: 1, haz: 2, minTurn: 120 }, { bounce: true, bump: 2, nA: 1, nR: 1, haz: 2, rect: .4, minTurn: 140 }, { bounce: true, bump: 2, nA: 2, nR: 1, haz: 3, rect: .4, minTurn: 160 }, { bounce: true, bump: 3, nA: 1, nR: 2, haz: 3, rect: .5, minTurn: 180 }, { bounce: true, bump: 3, fixedA: 1, nA: 2, nR: 1, haz: 4, rect: .5, minTurn: 200 }],
  // world 5: portals
  [{ portals: 1, nA: 1, haz: 1, minTurn: 40, minLen: 800 }, { portals: 1, nA: 1, nR: 1, haz: 2, minTurn: 60, minLen: 800 }, { portals: 1, fixedA: 1, nA: 1, haz: 2, rect: .4, minTurn: 80, minLen: 900 }, { portals: 1, nA: 2, nR: 1, haz: 3, rect: .4, minTurn: 100, minLen: 900 }, { portals: 2, nA: 1, nR: 1, haz: 3, rect: .5, minTurn: 100, minLen: 1000 }, { portals: 2, fixedR: 1, nA: 2, nR: 1, haz: 4, rect: .5, minTurn: 120, minLen: 1000 }],
  // world 6: orbits
  [{ fixedA: 1, orbit: 1, nA: 1, haz: 1, minTurn: 100 }, { fixedR: 1, orbit: 1, nA: 1, nR: 1, haz: 2, minTurn: 120 }, { fixedA: 1, fixedR: 1, orbit: 1, nA: 1, nR: 1, haz: 2, rect: .4, minTurn: 140 }, { fixedA: 1, fixedR: 1, orbit: 2, nA: 1, nR: 1, haz: 3, rect: .4, minTurn: 160 }, { fixedA: 2, fixedR: 1, orbit: 2, nA: 2, nR: 1, haz: 3, rect: .5, minTurn: 180 }, { fixedA: 2, fixedR: 2, orbit: 2, nA: 2, nR: 1, haz: 4, rect: .5, minTurn: 200 }],
  // world 7: fog (partial preview)
  [{ prev: 1, nA: 1, nR: 1, haz: 2, rect: .4, minTurn: 120 }, { prev: 1, nA: 2, nR: 1, haz: 3, rect: .4, minTurn: 140 }, { prev: 1, fixedA: 1, nA: 1, nR: 1, haz: 3, rect: .5, minTurn: 160 }, { prev: 1, bounce: true, bump: 2, nA: 2, nR: 1, haz: 3, rect: .5, minTurn: 180 }, { prev: 1, portals: 1, fixedR: 1, nA: 2, nR: 1, haz: 4, rect: .5, minTurn: 160, minLen: 900 }, { prev: 1, fixedA: 1, fixedR: 1, orbit: 1, nA: 2, nR: 1, haz: 4, rect: .5, minTurn: 200 }],
  // world 8: chaos
  [{ prev: 1, bounce: true, bump: 2, fixedA: 1, nA: 2, nR: 1, haz: 4, rect: .5, minTurn: 200 }, { prev: 1, portals: 1, fixedA: 1, fixedR: 1, orbit: 1, nA: 2, nR: 1, haz: 4, rect: .5, minTurn: 200, minLen: 900 }, { prev: 1, bounce: true, bump: 3, portals: 1, nA: 2, nR: 2, haz: 4, rect: .5, minTurn: 220, minLen: 900 }, { prev: 0, fixedA: 1, fixedR: 1, orbit: 1, nA: 2, nR: 1, haz: 4, rect: .5, minTurn: 200 }, { prev: 0, bounce: true, bump: 2, fixedA: 1, orbit: 1, nA: 2, nR: 2, haz: 4, rect: .5, minTurn: 220 }, { prev: 0, portals: 1, bounce: true, bump: 2, fixedA: 1, fixedR: 1, orbit: 1, nA: 2, nR: 2, haz: 5, rect: .5, minTurn: 240, minLen: 900 }]
];

const out = [], report = [];
let idx = 0;
SPECS.forEach((ws, wi) => ws.forEach((sp, j) => {
  const tgt = Math.max(0.004, 0.2 * Math.pow(0.93, idx));
  let best = null;
  const spec = Object.assign({ world: wi + 1, hazMin: sp.haz }, sp);
  for (let k = 0; k < 90; k++) {
    const seed = 1000 * (wi + 1) + 37 * (j + 1) + k + 1;
    const L = G.gen(seed, spec);
    if (!L) continue;
    const wr = G.winRate(L, 500, seed);
    const score = Math.abs(Math.log((wr.win + 0.003) / (tgt + 0.003)));
    if (!best || score < best.score) best = { L, wr, score, seed };
    if (score < 0.18) break;
  }
  if (!best) { console.error('FAILED slot', wi + 1, j + 1); process.exit(1); }
  const L = best.L; L.id = idx + 1; L.rate = Math.round(best.wr.win * 1000) / 10;
  delete L.w; delete L.h;
  out.push(L); report.push([idx + 1, wi + 1, j + 1, best.seed, (best.wr.win * 100).toFixed(1), (tgt * 100).toFixed(1), L.inv.join(''), L.haz.length, L.fixed.length, L.bump.length, L.portals.length, L.bounce ? 'B' : '-', L.prev].join('\t'));
  idx++;
}));
console.log('id\tw\tj\tseed\twin%\ttgt%\tinv\thaz\tfix\tbmp\tprt\tbnc\tprev');
console.log(report.join('\n'));
fs.writeFileSync(path.join(GAME, 'levels.js'), 'window.LEVELS=' + JSON.stringify(out) + ';\n');
console.log('bytes', fs.statSync(path.join(GAME, 'levels.js')).size);
