/* RJS Beauty Room — shared behaviour for every page:
   smooth scrolling, in-page link gliding, header on scroll, scroll reveals, footer year. */
(function () {
  var root = document.documentElement;
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  // ---------- Smooth scrolling (desktop mouse/trackpad only) ----------
  var smoothTo = null;
  (function () {
    if (still || !window.matchMedia || !matchMedia("(pointer: fine)").matches) return;
    root.style.scrollBehavior = "auto";
    var target = window.scrollY, current = target, running = false;
    var maxY = function () { return document.documentElement.scrollHeight - window.innerHeight; };
    var loop = function () {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.5) { current = target; running = false; }
      window.scrollTo(0, current);
      if (running) requestAnimationFrame(loop);
    };
    var go = function () { if (!running) { running = true; requestAnimationFrame(loop); } };
    var innerScroller = function (el) {
      for (; el && el !== document.body && el !== root; el = el.parentElement) {
        var oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) return true;
      }
      return false;
    };
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;                               // pinch-zoom
      if (root.classList.contains("intro-on") && !root.classList.contains("intro-done")) return;
      if (document.querySelector("dialog[open]") || root.classList.contains("menu-open")) return;  // lightbox / phone menu
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;                        // sideways swipes
      if (innerScroller(e.target)) return;
      e.preventDefault();
      if (!running) current = target = window.scrollY;
      var d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1);
      target = Math.max(0, Math.min(maxY(), target + d));
      go();
    }, { passive: false });
    window.addEventListener("scroll", function () { if (!running) current = target = window.scrollY; }, { passive: true });
    smoothTo = function (y) { if (!running) current = window.scrollY; target = Math.max(0, Math.min(maxY(), y)); go(); };
  })();

  // In-page links glide to their section, clear of the sticky header
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var id = a.getAttribute("href").slice(1);
    var el = id ? document.getElementById(id) : document.body;
    if (!el) return;
    e.preventDefault();
    var y = id === "top" || !id ? 0 : el.getBoundingClientRect().top + window.scrollY - 70;
    if (smoothTo) smoothTo(y); else window.scrollTo({ top: y, behavior: still ? "auto" : "smooth" });
    if (id && history.replaceState) history.replaceState(null, "", "#" + id);
  });


  // Header deepens on scroll; banner drifts gently (parallax)
  var header = document.querySelector(".top");
  var heroPic = document.querySelector(".hero picture");
  var progress = document.getElementById("progress");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle("scrolled", y > 40);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ")";
    if (!still && heroPic && y < window.innerHeight * 1.2) heroPic.style.transform = "translate3d(0," + (y * 0.28).toFixed(1) + "px,0)";
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Reveal sections as they scroll into view
  if (root.classList.contains("js-reveal")) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });
  }


  // ---------- Phone menu: built from the header links ----------
  (function () {
    var nav = document.querySelector(".top .nav");
    if (!nav) return;
    var BOOK = "https://rjsbeautyroom.as.me/schedule/dfc4edcf";
    var FB = "https://www.facebook.com/profile.php?id=61563781078767";
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "menu-btn"; btn.setAttribute("aria-label", "Open menu");
    btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "mmenu");
    btn.innerHTML = "<span></span><span></span>";
    nav.appendChild(btn);

    var logo = document.querySelector(".brand img");
    var panel = document.createElement("div");
    panel.id = "mmenu"; panel.className = "mmenu"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-label", "Menu");
    panel.innerHTML =
      '<div class="mm-top">' + (logo ? '<img class="mm-logo" src="' + logo.getAttribute("src") + '" alt="">' : '<span></span>') +
      '<button type="button" class="mm-close" aria-label="Close menu"><span></span><span></span></button></div>' +
      '<nav class="mm-links" aria-label="Menu"></nav>' +
      '<div class="mm-foot"><a class="btn" href="' + BOOK + '" target="_blank" rel="noopener">Book online</a><a class="btn ghost" href="' + FB + '" target="_blank" rel="noopener">Message us</a></div>';
    document.body.appendChild(panel);
    var list = panel.querySelector(".mm-links"), lastFocus = null;

    function fill() {
      list.textContent = "";
      var n = 0;
      nav.querySelectorAll("a.link").forEach(function (a) {
        if (a.hidden) return;
        var l = document.createElement("a");
        l.href = a.getAttribute("href"); l.textContent = a.textContent;
        if (a.classList.contains("current")) l.className = "current";
        l.style.setProperty("--i", n++);
        list.appendChild(l);
      });
    }
    function open() {
      fill(); lastFocus = document.activeElement;
      panel.hidden = false; root.classList.add("menu-open");
      btn.setAttribute("aria-expanded", "true");
      requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.add("on"); }); });
      var first = list.querySelector("a"); if (first) first.focus({ preventScroll: true });
    }
    function close(returnFocus) {
      panel.classList.remove("on"); root.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
      setTimeout(function () { panel.hidden = true; }, still ? 0 : 450);
      if (returnFocus !== false && lastFocus) lastFocus.focus({ preventScroll: true });
    }
    btn.addEventListener("click", open);
    panel.querySelector(".mm-close").addEventListener("click", function () { close(); });
    list.addEventListener("click", function (e) { if (e.target.closest("a")) close(false); });   // the link then glides / navigates as normal
    document.addEventListener("keydown", function (e) {
      if (panel.hidden) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {                                                  // keep keyboard focus inside the open menu
        var f = panel.querySelectorAll("a, button"), a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    if (window.matchMedia) {
      var wide = matchMedia("(min-width: 861px)");
      var onWide = function (m) { if (m.matches && !panel.hidden) close(false); };
      if (wide.addEventListener) wide.addEventListener("change", onWide); else if (wide.addListener) wide.addListener(onWide);
    }
  })();

  // ---------- Back to top ----------
  (function () {
    var b = document.createElement("button");
    b.type = "button"; b.className = "to-top"; b.setAttribute("aria-label", "Back to top");
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>';
    document.body.appendChild(b);
    b.addEventListener("click", function () {
      if (smoothTo) smoothTo(0); else window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
      var brand = document.querySelector(".brand"); if (brand) brand.focus({ preventScroll: true });
    });
    var show = function () { b.classList.toggle("on", window.scrollY > window.innerHeight * .9); };
    window.addEventListener("scroll", show, { passive: true }); show();
  })();

  // ---------- Announcement bar: off until assets/announcement.json has "show": true ----------
  (function () {
    var header = document.querySelector(".top");
    var css = document.querySelector('link[href$="site.css"]');
    if (!header || !window.fetch) return;
    var base = css ? css.getAttribute("href").replace(/site\.css$/, "") : "assets/";
    fetch(base + "announcement.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (a) {
        if (!a || !a.show || !a.text) return;
        var key = "rjs-ann-" + a.text;
        try { if (sessionStorage.getItem(key)) return; } catch (e) {}
        var bar = document.createElement("div");
        bar.className = "announce"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Announcement");
        var p = document.createElement("p"); p.textContent = a.text;
        if (a.link && a.linkText) {
          var l = document.createElement("a"); l.href = a.link; l.textContent = a.linkText;
          if (/^https?:/.test(a.link)) { l.target = "_blank"; l.rel = "noopener"; }
          p.appendChild(document.createTextNode(" ")); p.appendChild(l);
        }
        var x = document.createElement("button"); x.type = "button"; x.className = "announce-x"; x.setAttribute("aria-label", "Hide announcement"); x.textContent = "×";
        x.addEventListener("click", function () { bar.remove(); try { sessionStorage.setItem(key, "1"); } catch (e) {} });
        bar.appendChild(p); bar.appendChild(x);
        header.parentNode.insertBefore(bar, header);
      })
      .catch(function () {});
  })();

  window.RJS = { smoothTo: function (y) { if (smoothTo) smoothTo(y); else window.scrollTo(0, y); } };
})();
