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
      if (document.querySelector("dialog[open]")) return;                         // lightbox
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


  window.RJS = { smoothTo: function (y) { if (smoothTo) smoothTo(y); else window.scrollTo(0, y); } };
})();
