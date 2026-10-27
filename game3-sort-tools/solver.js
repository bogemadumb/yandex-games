var G = require('../game3-sort/gen.js');
var CAP = 4;

function key(tubes) {
  var c = [];
  for (var i = 0; i < tubes.length; i++) { var t = tubes[i], v = 0; for (var j = 0; j < t.length; j++) v = v * 13 + t[j]; c.push(v); }
  c.sort(function (a, b) { return a - b; });
  return c.join(',');
}
function mono(a) { for (var i = 1; i < a.length; i++) if (a[i] !== a[0]) return false; return true; }

function neighbors(tubes) {
  var out = [], f, t, emptyDone = false;
  for (f = 0; f < tubes.length; f++) {
    var a = tubes[f]; if (!a.length) continue;
    var am = mono(a);
    if (am && a.length === CAP) continue;
    emptyDone = false;
    for (t = 0; t < tubes.length; t++) {
      if (t === f) continue;
      var b = tubes[t];
      if (b.length >= CAP) continue;
      if (b.length) { if (b[b.length - 1] !== a[a.length - 1]) continue; }
      else { if (am) continue; if (emptyDone) continue; emptyDone = true; }
      out.push([f, t]);
    }
  }
  return out;
}
function apply(tubes, m) {
  var n = new Array(tubes.length);
  for (var i = 0; i < tubes.length; i++) n[i] = (i === m[0] || i === m[1]) ? tubes[i].slice() : tubes[i];
  n[m[1]].push(n[m[0]].pop());
  return n;
}

function bfs(tubes, maxNodes) {
  var seen = new Set([key(tubes)]), states = [tubes], parent = [-1], mv = [null], head = 0;
  if (G.isWon(tubes)) return { moves: 0, path: [], nodes: 1 };
  while (head < states.length) {
    var s = states[head], ns = neighbors(s);
    for (var i = 0; i < ns.length; i++) {
      var c = apply(s, ns[i]), k = key(c);
      if (seen.has(k)) continue;
      seen.add(k); states.push(c); parent.push(head); mv.push(ns[i]);
      if (G.isWon(c)) {
        var path = [], p = states.length - 1;
        while (parent[p] >= 0) { path.push(mv[p]); p = parent[p]; }
        path.reverse();
        return { moves: path.length, path: path, nodes: states.length };
      }
    }
    head++;
    if (states.length > maxNodes) return null;
  }
  return null;
}

function h(tubes) {
  var best = {}, tot = 0, i, t;
  for (i = 0; i < tubes.length; i++) {
    t = tubes[i]; if (!t.length) continue;
    var m = 1; while (m < t.length && t[m] === t[0]) m++;
    tot += t.length - m;
    var c = t[0];
    if (best[c] === undefined) best[c] = m; else { tot += Math.min(best[c], m); if (m > best[c]) best[c] = m; }
  }
  return tot;
}

function Heap() { this.a = []; }
Heap.prototype.push = function (x) {
  var a = this.a, i = a.length; a.push(x);
  while (i > 0) { var p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; var t = a[p]; a[p] = a[i]; a[i] = t; i = p; }
};
Heap.prototype.pop = function () {
  var a = this.a, top = a[0], last = a.pop();
  if (a.length) {
    a[0] = last; var i = 0, n = a.length;
    for (;;) {
      var l = 2 * i + 1, r = l + 1, s = i;
      if (l < n && a[l][0] < a[s][0]) s = l;
      if (r < n && a[r][0] < a[s][0]) s = r;
      if (s === i) break;
      var t = a[s]; a[s] = a[i]; a[i] = t; i = s;
    }
  }
  return top;
};

function wastar(tubes, w, maxNodes, maxMoves) {
  var heap = new Heap(), best = new Map(), nodes = [], expanded = 0;
  var k0 = key(tubes); best.set(k0, 0);
  nodes.push({ s: tubes, g: 0, p: -1, m: null });
  heap.push([w * h(tubes), 0]);
  while (heap.a.length) {
    var top = heap.pop(), nd = nodes[top[1]];
    var kk = key(nd.s);
    if (best.get(kk) < nd.g) continue;
    if (G.isWon(nd.s)) {
      var path = [], p = top[1];
      while (nodes[p].p >= 0) { path.push(nodes[p].m); p = nodes[p].p; }
      path.reverse();
      return { moves: path.length, path: path, nodes: expanded };
    }
    if (++expanded > maxNodes) return null;
    if (nd.g >= maxMoves) continue;
    var ns = neighbors(nd.s);
    for (var i = 0; i < ns.length; i++) {
      var c = apply(nd.s, ns[i]), ck = key(c), g = nd.g + 1, old = best.get(ck);
      if (old !== undefined && old <= g) continue;
      best.set(ck, g);
      nodes.push({ s: c, g: g, p: top[1], m: ns[i] });
      heap.push([g + w * h(c), nodes.length - 1]);
    }
  }
  return null;
}

function verify(tubes, path) {
  var t = tubes.map(function (a) { return a.slice(); });
  for (var i = 0; i < path.length; i++) {
    if (!G.canMove(t, path[i][0], path[i][1])) return false;
    t[path[i][1]].push(t[path[i][0]].pop());
  }
  return G.isWon(t);
}

module.exports = { bfs: bfs, wastar: wastar, verify: verify, h: h, key: key };
