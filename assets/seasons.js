/* RJS Beauty Room — seasonal themes (purely decorative).
   Controlled by assets/theme.json: "auto" follows the calendar (see byDate below), "none" turns themes off,
   or a theme name (e.g. "halloween") forces that theme on whatever the date.
   Preview any theme without switching it on: add ?season=christmas to the address (or #season-christmas).
   Nothing here changes links, buttons or layout: every decoration ignores clicks and taps. */
(function () {
  var SEASONS = ["halloween", "christmas", "newyear", "valentines", "mothersday", "easter"];
  var root = document.documentElement;
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  // ---------- Which theme is on ----------
  // Easter Sunday for a given year (Gregorian computus). Mothering Sunday (UK) is 3 weeks before it.
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
        f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31),
        da = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mo - 1, da);
  }
  // "auto": follow the calendar
  //   Halloween 17–31 Oct · Christmas 1–27 Dec · New Year 28 Dec–2 Jan · Valentine's 1–14 Feb
  //   Mother's Day the week up to Mothering Sunday · Easter Palm Sunday to Easter Monday
  function byDate(now) {
    var y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
    var day = new Date(y, now.getMonth(), d).getTime(), DAY = 864e5;
    var e = easter(y).getTime();
    if (m === 10 && d >= 17) return "halloween";
    if (m === 12 && d <= 27) return "christmas";
    if ((m === 12 && d >= 28) || (m === 1 && d <= 2)) return "newyear";
    if (m === 2 && d <= 14) return "valentines";
    if (day >= e - 28 * DAY && day <= e - 21 * DAY) return "mothersday";
    if (day >= e - 7 * DAY && day <= e + DAY) return "easter";
    return "none";
  }
  function resolve(name) {
    if (name !== "auto") return name;
    var t = (location.search.match(/[?&]date=(\d{4})-(\d\d)-(\d\d)/) || []);   // ?date=2026-10-20 to test a date
    return byDate(t[1] ? new Date(+t[1], t[2] - 1, +t[3]) : new Date());
  }

  function pick(done) {
    var q = (location.search.match(/[?&]season=([a-z]+)/) || location.hash.match(/season-([a-z]+)/) || [])[1];
    if (q) return done(resolve(q));
    var css = document.querySelector('link[href$="site.css"]');
    var base = css ? css.getAttribute("href").replace(/site\.css$/, "") : "assets/";
    if (!window.fetch) return done(resolve("auto"));
    fetch(base + "theme.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (t) { done(resolve(t && t.season ? t.season : "auto")); })
      .catch(function () { done(resolve("auto")); });
  }

  // ---------- Ornaments hanging over the top of the banner ----------
  var G = "url(#seasonGold)";
  function svg(w, h, inner, cls) {
    return '<svg class="' + cls + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }
  function hanger(x, len, shape, delay, cls) {
    return '<div class="s-hang ' + (cls || "") + '" style="left:' + x + '%;--len:' + len + 'px;--d:' + delay + 's"><span class="s-string"></span>' + shape + '</div>';
  }
  var heart = function (fill) { return svg(40, 36, '<path d="M20 34 C4 22 0 14 4 8 C8 1 17 2 20 9 C23 2 32 1 36 8 C40 14 36 22 20 34 Z" fill="' + fill + '" stroke="' + G + '" stroke-width="1.5"/>', "s-shape"); };
  var star = svg(40, 40, '<path d="M20 2 L24.5 15 L38 15 L27 23.5 L31 37 L20 29 L9 37 L13 23.5 L2 15 L15.5 15 Z" fill="rgba(243,223,178,.25)" stroke="' + G + '" stroke-width="1.6" stroke-linejoin="round"/>', "s-shape");
  var bauble = function (c) { return svg(40, 48, '<rect x="16" y="2" width="8" height="6" rx="1.5" fill="' + G + '"/><circle cx="20" cy="27" r="17" fill="' + c + '" stroke="' + G + '" stroke-width="1.5"/><path d="M8 22 Q20 30 32 22" fill="none" stroke="rgba(255,240,210,.55)" stroke-width="1.2"/><circle cx="14" cy="20" r="3" fill="rgba(255,255,255,.35)"/>', "s-shape"); };
  var egg = function (c) { return svg(34, 44, '<path d="M17 2 C28 2 32 22 32 29 C32 38 25 42 17 42 C9 42 2 38 2 29 C2 22 6 2 17 2 Z" fill="' + c + '" stroke="' + G + '" stroke-width="1.4"/><path d="M4 26 Q10 21 17 26 T30 26" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.4"/><path d="M5 33 Q11 29 17 33 T29 33" fill="none" stroke="' + G + '" stroke-width="1.1"/>', "s-shape"); };
  var spider = svg(40, 40, '<ellipse cx="20" cy="22" rx="7" ry="8.5" fill="#1a1512" stroke="' + G + '" stroke-width="1.3"/><circle cx="20" cy="12" r="4.5" fill="#1a1512" stroke="' + G + '" stroke-width="1.2"/>' +
      '<path d="M14 18 Q6 12 3 16 M14 22 Q5 21 2 26 M14 26 Q7 30 5 36 M26 18 Q34 12 37 16 M26 22 Q35 21 38 26 M26 26 Q33 30 35 36" fill="none" stroke="' + G + '" stroke-width="1.2" stroke-linecap="round"/>', "s-shape");

  var pumpkin = svg(64, 60,
    '<path d="M32 12 C31 7 33 3 37 1" fill="none" stroke="#5c7a3a" stroke-width="3.2" stroke-linecap="round"/>' +
    '<ellipse cx="20" cy="36" rx="15" ry="20" fill="#c9601a"/><ellipse cx="44" cy="36" rx="15" ry="20" fill="#c9601a"/>' +
    '<ellipse cx="32" cy="36" rx="15" ry="21.5" fill="#e27a26"/>' +
    '<path d="M20 17 Q13 36 20 55 M44 17 Q51 36 44 55" fill="none" stroke="#a84e14" stroke-width="1.3"/>' +
    '<path d="M21 30 L27 30 L24 24 Z M37 30 L43 30 L40 24 Z" fill="#ffd36b"/>' +
    '<path d="M19 40 Q32 50 45 40 L41 42 L39 39 L36 43 L32 40 L28 43 L25 39 L23 42 Z" fill="#ffd36b"/>' +
    '<ellipse cx="32" cy="36" rx="29" ry="21.5" fill="none" stroke="' + G + '" stroke-width="1"/>', "s-shape s-glow s-pump");
  var flower = function (c) { var p = ""; for (var k = 0; k < 5; k++) p += '<ellipse cx="20" cy="11" rx="6" ry="9" transform="rotate(' + (k * 72) + ' 20 20)" fill="' + c + '" stroke="' + G + '" stroke-width=".9"/>'; return svg(40, 40, p + '<circle cx="20" cy="20" r="4.5" fill="' + G + '"/>', "s-shape"); };
  function web() {
    var lines = "", arcs = "", r, a, i;
    for (i = 0; i <= 6; i++) { a = i / 6 * Math.PI / 2; lines += '<path d="M0 0 L' + (Math.cos(a) * 170).toFixed(1) + ' ' + (Math.sin(a) * 170).toFixed(1) + '"/>'; }
    for (r = 34; r <= 170; r += 34) {
      var d = "M" + r + " 0";
      for (i = 1; i <= 6; i++) {
        var a0 = (i - 1) / 6 * Math.PI / 2, a1 = i / 6 * Math.PI / 2, am = (a0 + a1) / 2, sag = r * .82;
        d += " Q" + (Math.cos(am) * sag).toFixed(1) + " " + (Math.sin(am) * sag).toFixed(1) + " " + (Math.cos(a1) * r).toFixed(1) + " " + (Math.sin(a1) * r).toFixed(1);
      }
      arcs += '<path d="' + d + '"/>';
    }
    var g = '<g fill="none" stroke="rgba(248,240,225,.9)" stroke-width="1.8" stroke-linecap="round">' + lines + arcs + '</g>';
    return svg(180, 180, g, "s-corner s-tl s-web") + svg(180, 180, g, "s-corner s-tr s-web s-small");
  }
  function sprig(flower, leaf, berry) {
    // a botanical corner: curved stems with leaves, plus flowers or berries
    var s = '<g fill="none" stroke="' + G + '" stroke-width="1.4" stroke-linecap="round"><path d="M0 18 Q70 20 150 70"/><path d="M18 0 Q30 60 70 120"/></g>';
    [[40, 26, -20], [80, 38, 10], [118, 54, -25], [26, 40, 60], [40, 74, 30], [56, 98, 70]].forEach(function (l) {
      s += '<path d="M0 0 Q9 -9 22 0 Q9 9 0 0 Z" transform="translate(' + l[0] + ' ' + l[1] + ') rotate(' + l[2] + ')" fill="' + leaf + '" stroke="' + G + '" stroke-width="1"/>';
    });
    if (berry) [[60, 30], [66, 36], [56, 38], [30, 58], [36, 64]].forEach(function (b) { s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="4.5" fill="' + berry + '" stroke="' + G + '" stroke-width=".8"/>'; });
    if (flower) [[150, 70, 13], [70, 120, 12], [98, 44, 9]].forEach(function (f) {
      for (var k = 0; k < 5; k++) s += '<ellipse cx="' + f[0] + '" cy="' + (f[1] - f[2] * .7) + '" rx="' + (f[2] * .45) + '" ry="' + (f[2] * .75) + '" transform="rotate(' + (k * 72) + ' ' + f[0] + ' ' + f[1] + ')" fill="' + flower + '" stroke="' + G + '" stroke-width=".9"/>';
      s += '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="' + (f[2] * .28) + '" fill="' + G + '"/>';
    });
    return s;
  }

  var THEMES = {
    halloween: {
      garland: function () { return [pumpkin, spider]; },
      particles: "bats", greeting: "Happy Halloween", tint: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 35%, rgba(20,5,25,.55) 100%), linear-gradient(180deg, rgba(45,12,55,.35), rgba(20,5,25,.08) 45%, rgba(110,40,0,.55))",
      ornaments: function () {
        return '<div class="s-moon"></div>' + web() + hanger(10, 70, pumpkin, .2) + hanger(17, 125, pumpkin, .8) + hanger(77, 150, spider, 0, "s-bob") +
          hanger(85, 90, pumpkin, .5) + hanger(92, 55, spider, .9, "s-bob") + '<div class="s-fog"></div>';
      },
      ribbon: '<svg viewBox="0 0 64 60" width="18" height="17" aria-hidden="true"><ellipse cx="20" cy="36" rx="15" ry="20" fill="#c9601a"/><ellipse cx="44" cy="36" rx="15" ry="20" fill="#c9601a"/><ellipse cx="32" cy="36" rx="15" ry="21.5" fill="#e27a26"/><path d="M32 12 C31 7 33 3 37 1" fill="none" stroke="#5c7a3a" stroke-width="4"/><path d="M21 30 L27 30 L24 24 Z M37 30 L43 30 L40 24 Z M19 40 Q32 50 45 40 Z" fill="#ffd36b"/></svg>'
    },
    christmas: {
      ribbon: '<svg viewBox="0 0 40 40" width="16" height="16" aria-hidden="true"><path d="M20.0 20.0 L37.0 20.0 M29.4 20.0 L33.2 23.8 M29.4 20.0 L33.2 16.2 M33.6 20.0 L36.2 22.6 M33.6 20.0 L36.2 17.4 M20.0 20.0 L28.5 34.7 M24.7 28.1 L23.3 33.4 M24.7 28.1 L29.9 29.5 M26.8 31.8 L25.8 35.4 M26.8 31.8 L30.4 32.7 M20.0 20.0 L11.5 34.7 M15.3 28.1 L10.1 29.5 M15.3 28.1 L16.7 33.4 M13.2 31.8 L9.6 32.7 M13.2 31.8 L14.2 35.4 M20.0 20.0 L3.0 20.0 M10.6 20.0 L6.8 16.2 M10.6 20.0 L6.8 23.8 M6.4 20.0 L3.8 17.4 M6.4 20.0 L3.8 22.6 M20.0 20.0 L11.5 5.3 M15.3 11.9 L16.7 6.6 M15.3 11.9 L10.1 10.5 M13.2 8.2 L14.2 4.6 M13.2 8.2 L9.6 7.3 M20.0 20.0 L28.5 5.3 M24.7 11.9 L29.9 10.5 M24.7 11.9 L23.3 6.6 M26.8 8.2 L30.4 7.3 M26.8 8.2 L25.8 4.6 " fill="none" stroke="#f3e6c4" stroke-width="2.4" stroke-linecap="round"/></svg>',
      garland: function () { return [bauble("#8e1c24"), bauble("#1f5a34"), bauble("#b8923f")]; },
      particles: "snow", greeting: "Merry Christmas", tint: "linear-gradient(180deg, rgba(10,25,50,.25), rgba(0,0,0,0) 45%, rgba(10,20,40,.4))",
      ornaments: function () {
        return svg(170, 130, sprig(null, "#2f6b3a", "#b3262e"), "s-corner s-tl") +
          hanger(76, 70, bauble("#8e1c24"), 0) + hanger(83, 120, bauble("#1f5a34"), .6) + hanger(90, 55, bauble("#b8923f"), 1.2);
      }
    },
    newyear: {
      ribbon: '<svg viewBox="0 0 40 40" width="16" height="16" aria-hidden="true"><path d="M20.0 2.0 Q22.2 17.8 38.0 20.0 Q22.2 22.2 20.0 38.0 Q17.8 22.2 2.0 20.0 Q17.8 17.8 20.0 2.0 Z" fill="#f6e6bd"/></svg>',
      garland: function () { return [star]; },
      particles: "sparkle", greeting: "Happy New Year", tint: "linear-gradient(180deg, rgba(15,10,30,.3), rgba(0,0,0,0) 45%, rgba(10,8,20,.45))",
      ornaments: function () { return hanger(8, 60, star, .3) + hanger(14, 110, star, 0) + hanger(80, 90, star, .8) + hanger(88, 50, star, .4) + hanger(93, 130, star, 1.1); }
    },
    valentines: {
      ribbon: '<svg viewBox="0 0 40 40" width="16" height="16" aria-hidden="true"><path d="M20.0 31.7 C0.5 20.0 9.6 6.3 20.0 15.4 C30.4 6.3 39.5 20.0 20.0 31.7 Z" fill="#eaa1b1"/></svg>',
      garland: function () { return [heart("#b0304f"), heart("#e8a4b4")]; },
      particles: "hearts", greeting: "Happy Valentine's", tint: "linear-gradient(180deg, rgba(90,15,45,.22), rgba(0,0,0,0) 45%, rgba(80,10,35,.42))",
      ornaments: function () { return hanger(9, 80, heart("#b0304f"), 0) + hanger(15, 130, heart("#e8a4b4"), .6) + hanger(83, 110, heart("#e8a4b4"), .3) + hanger(90, 60, heart("#b0304f"), .9); }
    },
    mothersday: {
      ribbon: '<svg viewBox="0 0 40 40" width="17" height="17" aria-hidden="true"><ellipse cx="20.0" cy="10.1" rx="6.8" ry="10.8" transform="rotate(0 20.0 20.0)" fill="#f2c4cf"/><ellipse cx="20.0" cy="10.1" rx="6.8" ry="10.8" transform="rotate(72 20.0 20.0)" fill="#f2c4cf"/><ellipse cx="20.0" cy="10.1" rx="6.8" ry="10.8" transform="rotate(144 20.0 20.0)" fill="#f2c4cf"/><ellipse cx="20.0" cy="10.1" rx="6.8" ry="10.8" transform="rotate(216 20.0 20.0)" fill="#f2c4cf"/><ellipse cx="20.0" cy="10.1" rx="6.8" ry="10.8" transform="rotate(288 20.0 20.0)" fill="#f2c4cf"/><circle cx="20.0" cy="20.0" r="4.5" fill="#e2c48b"/></svg>',
      garland: function () { return [flower("#f2c4cf"), flower("#f7dbe1")]; },
      particles: "petals", greeting: "Happy Mother's Day", petal: ["#f2c4cf", "#f7dbe1", "#e8a4b4"], tint: "linear-gradient(180deg, rgba(90,40,60,.18), rgba(0,0,0,0) 45%, rgba(60,20,35,.35))",
      ornaments: function () { return svg(170, 130, sprig("#f2c4cf", "#6f8f5c"), "s-corner s-tl") + svg(170, 130, sprig("#f7dbe1", "#6f8f5c"), "s-corner s-tr"); }
    },
    easter: {
      ribbon: '<svg viewBox="0 0 34 44" width="13" height="17" aria-hidden="true"><path d="M17 2 C28 2 32 22 32 29 C32 38 25 42 17 42 C9 42 2 38 2 29 C2 22 6 2 17 2 Z" fill="#d9cdf0"/><path d="M4 26 Q10 21 17 26 T30 26" fill="none" stroke="#fff" stroke-width="2"/></svg>',
      garland: function () { return [egg("#d9cdf0"), egg("#f7d4dc"), egg("#cfe7c4")]; },
      particles: "petals", greeting: "Happy Easter", petal: ["#f6e7a8", "#cfe7c4", "#d9cdf0", "#f7d4dc"], tint: "linear-gradient(180deg, rgba(60,70,40,.15), rgba(0,0,0,0) 45%, rgba(30,40,20,.3))",
      ornaments: function () { return svg(170, 130, sprig("#f6e7a8", "#8fb07e"), "s-corner s-tl") + hanger(80, 70, egg("#d9cdf0"), 0) + hanger(87, 115, egg("#f7d4dc"), .5) + hanger(93, 60, egg("#cfe7c4"), 1); }
    }
  };

  // ---------- Gentle particles across the page ----------
  function particles(kind, theme, box) {
    if (still || !box) return;
    var cv = document.createElement("canvas");
    cv.className = "s-canvas"; cv.setAttribute("aria-hidden", "true");
    box.insertBefore(cv, box.firstChild);
    var ctx = cv.getContext("2d"), W, H, dpr, list = [], raf = null;
    var small = window.innerWidth < 700;
    var COUNT = { snow: small ? 35 : 70, bats: small ? 7 : 14, sparkle: small ? 22 : 40, hearts: small ? 8 : 14, petals: small ? 10 : 18 }[kind];
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = box.clientWidth; H = box.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function R(a, b) { return a + Math.random() * (b - a); }
    function make(anywhere) {
      var p = { x: R(0, W), y: anywhere ? R(0, H) : -20, r: R(1.2, 3.4), vx: R(-.2, .2), vy: R(.3, .9), a: R(0, 6.3), s: R(.004, .02), o: R(.35, .85) };
      if (kind === "bats") { p.y = R(20, H * .6); p.x = anywhere ? R(0, W) : -40; p.vx = R(.7, 1.6); p.vy = 0; p.r = R(14, 30); p.o = R(.8, 1); }
      if (kind === "hearts") { p.y = anywhere ? R(0, H) : H + 20; p.vy = -R(.3, .7); p.r = R(5, 10); p.o = R(.25, .55); }
      if (kind === "sparkle") { p.vy = 0; p.vx = 0; p.r = R(2, 5); p.o = 0; p.life = R(0, 6.3); }
      if (kind === "petals") { p.r = R(4, 8); p.c = theme.petal[Math.floor(R(0, theme.petal.length))]; p.rot = R(0, 6.3); p.vr = R(-.02, .02); p.o = R(.45, .8); }
      return p;
    }
    function drawBat(p, t) {
      var f = Math.sin(t * .014 + p.a) * .7 + .3, r = p.r;
      ctx.save(); ctx.translate(p.x, p.y + Math.sin(t * .002 + p.a) * 8); ctx.globalAlpha = p.o;
      ctx.beginPath();
      ctx.moveTo(-r * .14, -r * .12);
      ctx.lineTo(-r * .13, -r * .4); ctx.lineTo(-r * .05, -r * .22); ctx.lineTo(r * .05, -r * .22); ctx.lineTo(r * .13, -r * .4); ctx.lineTo(r * .14, -r * .12);
      ctx.quadraticCurveTo(r * .5, -r * .5 * f, r, -r * .28 * f);
      ctx.quadraticCurveTo(r * .86, 0, r * .72, r * .16);
      ctx.quadraticCurveTo(r * .6, r * .03, r * .46, r * .2);
      ctx.quadraticCurveTo(r * .33, r * .06, r * .18, r * .26);
      ctx.quadraticCurveTo(0, r * .48, -r * .18, r * .26);
      ctx.quadraticCurveTo(-r * .33, r * .06, -r * .46, r * .2);
      ctx.quadraticCurveTo(-r * .6, r * .03, -r * .72, r * .16);
      ctx.quadraticCurveTo(-r * .86, 0, -r, -r * .28 * f);
      ctx.quadraticCurveTo(-r * .5, -r * .5 * f, -r * .14, -r * .12);
      ctx.closePath();
      ctx.fillStyle = "#16110e"; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(226,196,139,.75)"; ctx.stroke();
      ctx.restore();
    }
    function drawHeart(p) {
      var r = p.r; ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = p.o; ctx.fillStyle = "#e8a4b4";
      ctx.beginPath(); ctx.moveTo(0, r * .9);
      ctx.bezierCurveTo(-r * 1.4, 0, -r * .8, -r, 0, -r * .35);
      ctx.bezierCurveTo(r * .8, -r, r * 1.4, 0, 0, r * .9); ctx.fill(); ctx.restore();
    }
    function drawSparkle(p) {
      var r = p.r * (.6 + .4 * Math.sin(p.life)); ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = Math.max(0, Math.sin(p.life)) * .9;
      ctx.fillStyle = "#f3dfb2"; ctx.beginPath();
      ctx.moveTo(0, -r * 2); ctx.quadraticCurveTo(r * .2, -r * .2, r * 2, 0); ctx.quadraticCurveTo(r * .2, r * .2, 0, r * 2);
      ctx.quadraticCurveTo(-r * .2, r * .2, -r * 2, 0); ctx.quadraticCurveTo(-r * .2, -r * .2, 0, -r * 2); ctx.fill(); ctx.restore();
    }
    function drawPetal(p) {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.o; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.ellipse(0, 0, p.r * .55, p.r, 0, 0, 6.2832); ctx.fill(); ctx.restore();
    }
    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (kind === "snow") {
          p.a += p.s; p.x += p.vx + Math.sin(p.a) * .3; p.y += p.vy;
          ctx.globalAlpha = p.o; ctx.fillStyle = "#fffaf0"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
          if (p.y > H + 10) list[i] = make(false);
        } else if (kind === "bats") {
          p.x += p.vx; drawBat(p, t); if (p.x > W + 40) list[i] = make(false);
        } else if (kind === "hearts") {
          p.a += p.s; p.x += Math.sin(p.a) * .4; p.y += p.vy; drawHeart(p); if (p.y < -20) list[i] = make(false);
        } else if (kind === "sparkle") {
          p.life += .03; drawSparkle(p); if (p.life > 6.3) { list[i] = make(true); list[i].life = 3.2; }
        } else if (kind === "petals") {
          p.a += p.s; p.x += p.vx + Math.sin(p.a) * .6; p.y += p.vy; p.rot += p.vr; drawPetal(p); if (p.y > H + 20) list[i] = make(false);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    size();
    for (var i = 0; i < COUNT; i++) list.push(make(true));
    window.addEventListener("resize", size);
    // only animate while the banner is on screen and the tab is open
    var onScreen = true;
    var run = function () { if (onScreen && !document.hidden) { if (!raf) raf = requestAnimationFrame(frame); } else if (raf) { cancelAnimationFrame(raf); raf = null; } };
    document.addEventListener("visibilitychange", run);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; run(); }).observe(box);
    run();
  }

  function apply(name) {
    if (SEASONS.indexOf(name) < 0) return;
    var t = THEMES[name];
    root.setAttribute("data-season", name);
    // shared gold gradient for the ornaments
    var defs = document.createElement("div");
    defs.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="seasonGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b98f4f"/><stop offset=".5" stop-color="#f3dfb2"/><stop offset="1" stop-color="#c9a262"/></linearGradient></defs></svg>';
    document.body.appendChild(defs.firstChild);
    // ornaments over the banner (homepage) or the page heading (other pages)
    var hero = document.querySelector(".hero"), head = !hero && document.querySelector(".page-head");
    var box = null;
    if (hero) {
      box = document.createElement("div");
      box.className = "s-deco"; box.setAttribute("aria-hidden", "true");
      box.innerHTML = t.ornaments() + (t.greeting ? '<p class="s-greet">' + t.greeting + '</p>' : "");
      if (t.tint) box.style.setProperty("--tint", t.tint);
      hero.appendChild(box);
    } else if (head && t.garland) {
      var shapes = t.garland(), html = "", lens = [16, 38, 24, 44, 20, 34, 14, 40, 26];
      for (var i = 0; i < 9; i++) html += hanger(4 + i * 11.5, lens[i], shapes[i % shapes.length], (i % 4) * .25);
      var g = document.createElement("div");
      g.className = "s-deco s-garland"; g.setAttribute("aria-hidden", "true");
      g.innerHTML = '<span class="s-rope"></span>' + html;
      head.classList.add("s-has-garland");
      head.insertBefore(g, head.firstChild);
    }
    if (t.ribbon) document.querySelectorAll(".ribbon-track i").forEach(function (i) { i.innerHTML = t.ribbon; });
    particles(t.particles, t, box);
  }

  pick(apply);
})();
