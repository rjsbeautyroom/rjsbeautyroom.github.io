/* RJS Training Academy page: course finder and photo spaces */
(function () {
  // Photo spaces: on the live site an empty space simply disappears; anywhere else it shows
  // a gold placeholder saying which file to add. A section with no photos at all is hidden live.
  var live = /(^|\.)rjsbeautyroom\.(co\.uk|github\.io)$/.test(location.hostname);
  function missing(fig) {
    fig.classList.add("empty");
    if (live) fig.hidden = true;
    var sec = fig.closest("[data-photo-section]");
    if (live && sec && !sec.querySelector("[data-photo]:not([hidden])")) sec.hidden = true;
  }
  document.querySelectorAll("[data-photo]").forEach(function (fig) {
    var img = fig.querySelector("img");
    var probe = new Image();                       // check straight away, even for lazy-loaded photos
    probe.onerror = function () { missing(fig); };
    probe.src = img.getAttribute("src");
  });

  // Course finder
  var dataEl = document.getElementById("finderData");
  if (!dataEl) return;
  var DATA = JSON.parse(dataEl.textContent);
  var opts = Array.prototype.slice.call(document.querySelectorAll(".cf-opt"));
  var box = document.querySelector(".cf-result");
  function select(key) {
    var d = DATA[key];
    opts.forEach(function (b) { b.setAttribute("aria-selected", b.dataset.key === key ? "true" : "false"); b.tabIndex = b.dataset.key === key ? 0 : -1; });
    box.querySelector(".fr-title").textContent = d.title;
    box.querySelector(".fr-text").textContent = d.text;
    var ul = box.querySelector(".fr-list"); ul.textContent = "";
    d.courses.forEach(function (c) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="c-name"></span><span class="c-dots" aria-hidden="true"></span><span class="c-price"></span>';
      li.querySelector(".c-name").textContent = c[0]; li.querySelector(".c-price").textContent = c[1];
      ul.appendChild(li);
    });
    box.classList.remove("swap"); void box.offsetWidth; box.classList.add("swap");
  }
  document.querySelector(".cf-opts").addEventListener("click", function (e) { var b = e.target.closest(".cf-opt"); if (b) select(b.dataset.key); });
  document.querySelector(".cf-opts").addEventListener("keydown", function (e) {
    if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].indexOf(e.key) < 0) return;
    e.preventDefault();
    var i = opts.indexOf(document.activeElement); if (i < 0) return;
    var n = opts[(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : opts.length - 1)) % opts.length];
    n.focus(); select(n.dataset.key);
  });
  select(opts[0].dataset.key);
})();
