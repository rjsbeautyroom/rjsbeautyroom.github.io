/* RJS Beauty Room — interactive lash and brow style guides (guides.html) */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var rot = function (v, deg) { var r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  var smooth = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

  // A curved gold stroke from base point b, heading in direction dir, length L.
  function stroke(g, b, dir, L, w, delay, bendDeg) {
    var tip = [b[0] + dir[0] * L, b[1] + dir[1] * L];
    var bend = rot(dir, bendDeg);
    var c = [b[0] + bend[0] * L * .55, b[1] + bend[1] * L * .55];
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", "M" + b[0].toFixed(1) + " " + b[1].toFixed(1) + " Q" + c[0].toFixed(1) + " " + c[1].toFixed(1) + " " + tip[0].toFixed(1) + " " + tip[1].toFixed(1));
    p.setAttribute("pathLength", "1");
    p.setAttribute("stroke", "url(#gGold)");
    p.setAttribute("stroke-width", w);
    p.style.animationDelay = delay.toFixed(3) + "s";
    g.appendChild(p);
  }

  // ---------- Lashes: upper lid is a quadratic curve (60,150) -> (200,40) -> (340,150) ----------
  var L0 = [60, 150], L1 = [200, 40], L2 = [340, 150];
  function lidAt(t) { var u = 1 - t; return [u*u*L0[0] + 2*u*t*L1[0] + t*t*L2[0], u*u*L0[1] + 2*u*t*L1[1] + t*t*L2[1]]; }
  function lidNormal(t) {
    var dx = 2*(1-t)*(L1[0]-L0[0]) + 2*t*(L2[0]-L1[0]), dy = 2*(1-t)*(L1[1]-L0[1]) + 2*t*(L2[1]-L1[1]);
    var len = Math.hypot(dx, dy); return [dy/len, -dx/len];
  }
  var LASH = {
    wispy:   { n: 32, fan: [-10, 0, 10],        len: .86,  w: .95, spikeEvery: 4, spikeLen: 1.45, spikeW: 2.1 },
    classic: { n: 30, fan: [0],                 len: 1.0,  w: 2.4, spikeEvery: 0 },
    angel:   { n: 32, fan: [-9, 0, 9],          len: .8,   w: .75, spikeEvery: 5, spikeLen: 1.22, spikeW: 1.4 },
    volume:  { n: 32, fan: [-16, -8, 0, 8, 16], len: 1.02, w: .8,  spikeEvery: 0 }
  };
  function drawLashes(g, key) {
    var c = LASH[key];
    for (var i = 0; i < c.n; i++) {
      var t = .05 + .9 * (i / (c.n - 1));
      var b = lidAt(t), nrm = rot(lidNormal(t), (t - .5) * 50);
      var base = 24 + 30 * smooth((t - .05) / .75) - 10 * smooth((t - .88) / .12);
      var delay = i * .012;
      if (c.spikeEvery && i % c.spikeEvery === 2) { stroke(g, b, nrm, base * c.spikeLen, c.spikeW, delay, 18); continue; }
      for (var f = 0; f < c.fan.length; f++) stroke(g, b, rot(nrm, c.fan[f]), base * c.len * (1 - Math.abs(c.fan[f]) / 90), c.w, delay, 18);
    }
  }

  // ---------- Brows: a spine from the inner corner, up to the arch, down to the tail ----------
  var B0 = [70, 150], B1 = [230, 76], B2 = [345, 128];
  function spineAt(t) { var u = 1 - t; return [u*u*B0[0] + 2*u*t*B1[0] + t*t*B2[0], u*u*B0[1] + 2*u*t*B1[1] + t*t*B2[1]]; }
  function spineTan(t) {
    var dx = 2*(1-t)*(B1[0]-B0[0]) + 2*t*(B2[0]-B1[0]), dy = 2*(1-t)*(B1[1]-B0[1]) + 2*t*(B2[1]-B1[1]);
    var len = Math.hypot(dx, dy); return [dx/len, dy/len];
  }
  function thick(t) { return (4 + 22 * smooth(t / .18)) * (1 - .86 * smooth((t - .32) / .68)); }  // rounded head, full body, fine tail
  function browPoint(t, v) {                                   // v: -1 (lower edge) .. 1 (upper edge)
    var p = spineAt(t), tn = spineTan(t), n = [tn[1], -tn[0]];
    var h = thick(t) / 2 * v;
    return [p[0] + n[0] * h, p[1] + n[1] * h];
  }
  function browShape() {
    var up = [], lo = [];
    for (var i = 0; i <= 40; i++) { var t = i / 40; up.push(browPoint(t, 1)); lo.push(browPoint(t, -1)); }
    var pts = up.concat(lo.reverse());
    return "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L") + " Z";
  }
  var seed = 7;
  var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  var BROW = {
    lamination: { fill: .1,  hairs: 170, w: 1.05, len: [13, 21], style: "up",      spread: 10 },
    hybrid:     { fill: .5,  hairs: 80,  w: .9,   len: [9, 14],  style: "natural", spread: 6, soft: true },
    wax:        { fill: .4,  hairs: 90,  w: 1.0,  len: [9, 14],  style: "natural", spread: 6 },
    micro:      { fill: 0,   hairs: 110, w: .75,  len: [11, 17], style: "natural", spread: 4 }
  };
  function drawBrows(g, key, fillEl) {
    var c = BROW[key];
    fillEl.setAttribute("d", browShape());
    fillEl.style.opacity = c.fill;
    fillEl.style.filter = c.soft ? "url(#gSoft)" : "none";
    seed = 7;                                                    // same neat pattern every time
    for (var i = 0; i < c.hairs; i++) {
      var t = (i + rnd() * .8) / c.hairs * .96 + .02, v = rnd() * 1.6 - .8;
      var b = browPoint(t, v), tn = spineTan(t), dir;
      if (c.style === "up") {
        dir = rot([0, -1], 14 + t * 46 + (rnd() - .5) * c.spread);         // brushed up and towards the tail
      } else if (t < .16) {
        dir = rot([0, -1], 8 + t * 150 + (rnd() - .5) * c.spread);        // brow head grows upwards
      } else {
        dir = rot(tn, (v < 0 ? -1 : 1) * (16 + rnd() * c.spread));         // lower hairs lift, upper hairs settle, meeting at the spine
      }
      var L = c.len[0] + rnd() * (c.len[1] - c.len[0]);
      L *= (.55 + .45 * Math.abs(thick(t)) / 26) ;                           // shorter hairs where the brow is thinner
      stroke(g, b, dir, L, c.w, t * .45, c.style === "up" ? 10 : 6);
    }
  }


  // ---------- Nails: a fingertip seen from above, nail plate drawn from the cuticle up ----------
  var NL = 165, NR = 235, NC = 160;                             // nail edges and cuticle line
  function nailPath(shape, T, L, R, C) {
    L = L == null ? NL : L; R = R == null ? NR : R; C = C == null ? NC : C;
    var M = (L + R) / 2, w = R - L, f = function (n) { return n.toFixed(1); };
    var start = "M" + f(L) + " " + f(C) + " ", close = " L" + f(R) + " " + f(C) + " Q" + f(M) + " " + f(C + w * .28) + " " + f(L) + " " + f(C) + " Z";
    var tip;
    switch (shape) {
      case "square":   tip = "L" + f(L) + " " + f(T) + " L" + f(R) + " " + f(T); break;
      case "squoval":  tip = "L" + f(L) + " " + f(T + 9) + " Q" + f(L) + " " + f(T) + " " + f(L + 9) + " " + f(T) + " L" + f(R - 9) + " " + f(T) + " Q" + f(R) + " " + f(T) + " " + f(R) + " " + f(T + 9); break;
      case "round":    tip = "L" + f(L) + " " + f(T + w / 2) + " A" + f(w / 2) + " " + f(w / 2) + " 0 0 1 " + f(R) + " " + f(T + w / 2); break;
      case "oval":     tip = "L" + f(L) + " " + f(T + w * .65) + " C" + f(L) + " " + f(T + w * .15) + " " + f(L + w * .2) + " " + f(T) + " " + f(M) + " " + f(T) + " C" + f(R - w * .2) + " " + f(T) + " " + f(R) + " " + f(T + w * .15) + " " + f(R) + " " + f(T + w * .65); break;
      case "almond":   tip = "L" + f(L) + " " + f(T + w * .8) + " C" + f(L) + " " + f(T + w * .35) + " " + f(M - w * .12) + " " + f(T) + " " + f(M) + " " + f(T) + " C" + f(M + w * .12) + " " + f(T) + " " + f(R) + " " + f(T + w * .35) + " " + f(R) + " " + f(T + w * .8); break;
      case "coffin":   tip = "L" + f(L) + " " + f(T + w * .9) + " L" + f(L + w * .24) + " " + f(T) + " L" + f(R - w * .24) + " " + f(T) + " L" + f(R) + " " + f(T + w * .9); break;
      case "stiletto": tip = "L" + f(L) + " " + f(T + w) + " C" + f(L) + " " + f(T + w * .5) + " " + f(M - 3) + " " + f(T + 6) + " " + f(M) + " " + f(T) + " C" + f(M + 3) + " " + f(T + 6) + " " + f(R) + " " + f(T + w * .5) + " " + f(R) + " " + f(T + w); break;
    }
    return start + tip + close;
  }
  function el(g, d, attrs, cls) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    for (var k in attrs) p.setAttribute(k, attrs[k]);
    if (cls) p.setAttribute("class", cls);
    g.appendChild(p);
    return p;
  }
  var FINGER = "M142 222 L142 112 C142 58 258 58 258 112 L258 222";
  var NAIL = {
    biab:   { shape: "squoval", T: 70,  fill: .5,  label: "natural length" },
    hard:   { shape: "almond",  T: 18,  fill: .9,  label: "added length" },
    polish: { shape: "round",   T: 84,  fill: 1,   label: "natural nail" }
  };
  function drawNails(g, key) {
    var c = NAIL[key];
    var finger = el(g, FINGER, { "pathLength": 1, "stroke": "rgba(226,196,139,.5)", "stroke-width": 2 });
    finger.style.animationDelay = "0s";
    var d = nailPath(c.shape, c.T);
    var nail = el(g, d, { "stroke": "url(#gGold)", "stroke-width": 1.5, "pathLength": 1 }, "nail");
    nail.style.fill = "url(#gGold)"; nail.style.fillOpacity = c.fill;
    // a soft shine down the nail
    var shine = el(g, "M" + (NL + 14) + " " + (NC - 12) + " L" + (NL + 14) + " " + (c.T + 26), { "stroke": "rgba(255,248,230,.75)", "stroke-width": 4, "pathLength": 1 });
    shine.style.animationDelay = ".35s";
  }
  function setupShapes(root) {
    root.querySelectorAll("[data-shape]").forEach(function (fig, i) {
      var svg = fig.querySelector("svg"), g = document.createElementNS(NS, "g");
      g.setAttribute("class", "ls-lines");
      svg.appendChild(g);
      el(g, FINGER, { "pathLength": 1, "stroke": "rgba(226,196,139,.45)", "stroke-width": 2.5 });
      var n = el(g, nailPath(fig.dataset.shape, 30), { "stroke": "url(#gGold)", "stroke-width": 2, "pathLength": 1 }, "nail");
      n.style.fill = "url(#gGold)"; n.style.fillOpacity = .85;
      g.querySelectorAll("path").forEach(function (p) { p.style.animationDelay = (i * .06).toFixed(2) + "s"; });
    });
  }


  // ---------- Tattoos: fine line artwork drawn stroke by stroke ----------
  function line(g, d, w, delay) {
    var p = el(g, d, { "stroke": "url(#gGold)", "stroke-width": w || 1.6, "pathLength": 1, "stroke-linecap": "round", "stroke-linejoin": "round" });
    p.style.animationDelay = (delay || 0).toFixed(2) + "s";
    return p;
  }
  function drawTattoo(g, key) {
    var i, d = 0;
    if (key === "florals") {
      // curved stem, leaves in pairs, a five-petal bloom and a bud
      var S0 = [150, 205], S1 = [150, 110], S2 = [238, 52];
      var sAt = function (t) { var u = 1 - t; return [u*u*S0[0] + 2*u*t*S1[0] + t*t*S2[0], u*u*S0[1] + 2*u*t*S1[1] + t*t*S2[1]]; };
      var sN = function (t) { var dx = 2*(1-t)*(S1[0]-S0[0]) + 2*t*(S2[0]-S1[0]), dy = 2*(1-t)*(S1[1]-S0[1]) + 2*t*(S2[1]-S1[1]), l = Math.hypot(dx, dy); return [dx/l, dy/l]; };
      line(g, "M150 205 Q150 110 238 52", 1.6, 0);
      [.22, .42, .62].forEach(function (t, k) {
        [1, -1].forEach(function (side, j) {
          var p = sAt(t), tn = sN(t), n = rot(tn, side * 62);
          var tip = [p[0] + n[0] * 30, p[1] + n[1] * 30], a = rot(n, 32), b = rot(n, -32);
          line(g, "M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " Q" + (p[0] + a[0] * 20).toFixed(1) + " " + (p[1] + a[1] * 20).toFixed(1) + " " + tip[0].toFixed(1) + " " + tip[1].toFixed(1) + " Q" + (p[0] + b[0] * 20).toFixed(1) + " " + (p[1] + b[1] * 20).toFixed(1) + " " + p[0].toFixed(1) + " " + p[1].toFixed(1), 1.3, .25 + k * .15 + j * .07);
        });
      });
      var c = [244, 48];
      for (i = 0; i < 5; i++) {
        var dir = rot([0, -1], i * 72 + 20), l = rot(dir, 34), r = rot(dir, -34);
        var b0 = [c[0] + dir[0] * 5, c[1] + dir[1] * 5], tp = [c[0] + dir[0] * 30, c[1] + dir[1] * 30];
        line(g, "M" + b0[0].toFixed(1) + " " + b0[1].toFixed(1) + " C" + (c[0] + l[0] * 26).toFixed(1) + " " + (c[1] + l[1] * 26).toFixed(1) + " " + (tp[0] + l[0] * 6).toFixed(1) + " " + (tp[1] + l[1] * 6).toFixed(1) + " " + tp[0].toFixed(1) + " " + tp[1].toFixed(1) + " C" + (tp[0] + r[0] * 6).toFixed(1) + " " + (tp[1] + r[1] * 6).toFixed(1) + " " + (c[0] + r[0] * 26).toFixed(1) + " " + (c[1] + r[1] * 26).toFixed(1) + " " + b0[0].toFixed(1) + " " + b0[1].toFixed(1), 1.3, .8 + i * .08);
      }
      line(g, "M244 43 A5 5 0 1 1 243.9 43", 1.3, 1.25);
      line(g, "M171 128 Q205 120 214 100", 1.2, .6);
      line(g, "M214 100 C206 92 212 80 220 84 C228 88 224 100 214 100", 1.2, .95);
    } else if (key === "script") {
      var clipId = "tClip" + Math.floor(Math.random() * 1e6);
      var cp = document.createElementNS(NS, "clipPath"); cp.setAttribute("id", clipId);
      var rect = document.createElementNS(NS, "rect"); rect.setAttribute("x", 0); rect.setAttribute("y", 0); rect.setAttribute("height", 220); rect.setAttribute("width", 0);
      cp.appendChild(rect); g.appendChild(cp);
      var tx = document.createElementNS(NS, "text");
      tx.setAttribute("x", 200); tx.setAttribute("y", 132); tx.setAttribute("text-anchor", "middle");
      tx.setAttribute("class", "t-script"); tx.setAttribute("fill", "url(#gGold)"); tx.setAttribute("clip-path", "url(#" + clipId + ")");
      tx.textContent = "love";
      g.appendChild(tx);
      line(g, "M120 168 Q200 158 282 168", 1.1, 1.2);
      var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (still) { rect.setAttribute("width", 400); }
      else {
        var t0 = null;
        var grow = function (ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1400); rect.setAttribute("width", (400 * (1 - Math.pow(1 - k, 3))).toFixed(1)); if (k < 1 && rect.isConnected) requestAnimationFrame(grow); };
        requestAnimationFrame(grow);
      }
    } else if (key === "minimal") {
      line(g, "M128 72 A40 40 0 1 0 128 152 A44 44 0 0 1 128 72 Z", 1.6, 0);          // crescent moon
      line(g, "M205 138 C160 108 176 76 205 96 C234 76 250 108 205 138 Z", 1.6, .35); // heart
      line(g, "M282 78 Q286 108 314 112 Q286 116 282 146 Q278 116 250 112 Q278 108 282 78 Z", 1.6, .7); // sparkle
      line(g, "M318 70 L318 82 M312 76 L324 76", 1.2, 1);
      line(g, "M160 60 A2 2 0 1 1 159.9 60", 2, 1.1);
      line(g, "M238 160 A2 2 0 1 1 237.9 160", 2, 1.15);
    } else {
      var pts = [[108, 150], [150, 98], [196, 122], [240, 72], [288, 104], [268, 158]];
      for (i = 0; i < pts.length - 1; i++) line(g, "M" + pts[i][0] + " " + pts[i][1] + " L" + pts[i + 1][0] + " " + pts[i + 1][1], 1, i * .12);
      pts.forEach(function (p, k) { line(g, "M" + p[0] + " " + (p[1] - 4) + " A4 4 0 1 1 " + (p[0] - .1) + " " + (p[1] - 4), 1.8, .6 + k * .05); });
      line(g, "M326 58 Q328 70 340 72 Q328 74 326 86 Q324 74 312 72 Q324 70 326 58 Z", 1.3, 1);   // tiny sparkle
      line(g, "M76 70 Q77 76 83 77 Q77 78 76 84 Q75 78 69 77 Q75 76 76 70 Z", 1.1, 1.1);
      line(g, "M318 176 A2 2 0 1 1 317.9 176", 1.8, 1.2);
    }
  }

  // ---------- Shared tab behaviour ----------
  function setupGuide(root, draw) {
    var data = JSON.parse(root.querySelector("script[type='application/json']").textContent);
    var tabs = Array.prototype.slice.call(root.querySelectorAll(".ls-tab"));
    var g = root.querySelector(".ls-lines"), fillEl = root.querySelector(".ls-fill");
    var copy = root.querySelector(".ls-copy");
    function select(key) {
      var d = data[key];
      tabs.forEach(function (b) { b.setAttribute("aria-selected", b.dataset.style === key ? "true" : "false"); b.tabIndex = b.dataset.style === key ? 0 : -1; });
      root.querySelector(".ls-name").textContent = d.name;
      root.querySelector(".ls-text").textContent = d.text;
      root.querySelector(".ls-best-text").textContent = d.best;
      var ul = root.querySelector(".ls-points"); ul.textContent = "";
      d.points.forEach(function (p) { var li = document.createElement("li"); li.textContent = p; ul.appendChild(li); });
      copy.classList.remove("swap"); void copy.offsetWidth; copy.classList.add("swap");
      g.textContent = "";
      draw(g, key, fillEl);
    }
    root.querySelector(".ls-tabs").addEventListener("click", function (e) {
      var b = e.target.closest(".ls-tab"); if (b) select(b.dataset.style);
    });
    root.querySelector(".ls-tabs").addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var i = tabs.indexOf(document.activeElement); if (i < 0) return;
      var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); select(n.dataset.style);
    });
    select(tabs[0].dataset.style);
  }

  var lash = document.querySelector("[data-guide='lash']");
  var brow = document.querySelector("[data-guide='brow']");
  if (lash) setupGuide(lash, drawLashes);
  if (brow) setupGuide(brow, drawBrows);
  var nails = document.querySelector("[data-guide='nail']");
  if (nails) setupGuide(nails, drawNails);
  var tattoo = document.querySelector("[data-guide='tattoo']");
  if (tattoo) setupGuide(tattoo, drawTattoo);
  var shapes = document.querySelector("[data-shapes]");
  if (shapes) setupShapes(shapes);
})();
