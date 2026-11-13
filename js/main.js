(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- hero video ---------- */
  var heroV = $(".bg-video");
  function tryPlay(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  if (heroV && !RM && !saveData) tryPlay(heroV);

  /* ---------- lazy section videos: load + play only when visible ---------- */
  var lazyVids = $$(".lazy-video");
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (RM || saveData) return; // poster only
          if (!v.src && v.dataset.src) { v.src = v.dataset.src; }
          tryPlay(v);
        } else if (!v.paused) { v.pause(); }
      });
    }, { rootMargin: "200px 0px", threshold: 0.01 });
    lazyVids.forEach(function (v) { vio.observe(v); });
    if (heroV) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (RM || saveData) return; e.isIntersecting ? tryPlay(heroV) : heroV.pause(); });
      }).observe(heroV);
    }
  }

  /* ---------- hero title split ---------- */
  $$(".split").forEach(function (el) {
    if (RM) return;
    var t = el.textContent; el.textContent = "";
    el.setAttribute("aria-label", t);
    t.split("").forEach(function (c, i) {
      var s = document.createElement("span");
      s.className = "ch"; s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--i", i); s.textContent = c;
      el.appendChild(s);
    });
  });

  /* ---------- typewriter ---------- */
  var words = ["FOTOVOLTAICO", "METALLURGIA", "OFFSHORE", "GIURISTA D'IMPRESA", "AVVOCATO D'AFFARI", "ROBOTICA"];
  var typer = $("#typer");
  if (typer) {
    if (RM) { typer.textContent = words.join(" · "); }
    else {
      var wi = 0, ci = 0, del = false;
      (function tick() {
        var w = words[wi];
        ci += del ? -1 : 1;
        typer.textContent = w.slice(0, ci);
        var d = del ? 38 : 85;
        if (!del && ci === w.length) { del = true; d = 1700; }
        else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; d = 380; }
        setTimeout(tick, d);
      })();
    }
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = $$(".reveal");
  // stagger siblings
  reveals.forEach(function (el) {
    var sibs = $$(".reveal", el.parentElement).filter(function (s) { return s.parentElement === el.parentElement; });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty("--d", Math.min(i * 0.08, 0.5) + "s");
  });
  var rio;
  if ("IntersectionObserver" in window && !RM) {
    rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { rio.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- counters ---------- */
  function runCount(el) {
    var to = +el.dataset.to, suf = el.dataset.suffix || "";
    if (RM) { el.textContent = to.toLocaleString("it-IT") + suf; return; }
    var t0 = null, dur = 1600;
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e).toLocaleString("it-IT") + suf;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  var counts = $$(".count");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counts.forEach(function (c) { cio.observe(c); });
  } else counts.forEach(runCount);

  /* ---------- scroll: progress, nav, parallax, active link ---------- */
  var bar = $(".progress span"), nav = $("#nav");
  var par = RM ? [] : $$("[data-parallax]");
  var links = $$(".menu a");
  var secs = links.map(function (a) { return $(a.getAttribute("href")); });
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = doc.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    nav.classList.toggle("scrolled", y > 40);
    par.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var k = parseFloat(el.dataset.parallax);
      el.style.transform = "translate3d(0," + (-(r.top) * k * 0.5).toFixed(1) + "px,0)";
    });
    var cur = -1;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle("active", i === cur); });
    ticking = false;
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- mobile menu ---------- */
  var tog = $(".nav-toggle");
  tog.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    tog.setAttribute("aria-expanded", open);
  });
  links.forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("nav-open"); tog.setAttribute("aria-expanded", "false"); }); });

  /* ---------- tilt + glow (pointer devices only) ---------- */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine && !RM) {
    $$(".tilt").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
        el.style.transform = "perspective(800px) rotateX(" + ((0.5 - y) * 7) + "deg) rotateY(" + ((x - 0.5) * 9) + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
    $$(".magnetic").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- tabs ---------- */
  var tabs = $$(".tab");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (o) {
        var on = o === t; o.classList.toggle("is-active", on); o.setAttribute("aria-selected", on);
        var p = $("#" + o.getAttribute("aria-controls")); p.hidden = !on; p.classList.toggle("is-active", on);
      });
    });
  });

  /* ---------- gallery (impianti): only entries with a real foto ---------- */
  var esc = function (s) { return String(s || "").replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var withPhoto = (window.IMPIANTI || []).filter(function (it) { return it && it.foto; });
  var gal = $("#gallery");
  var filters = $(".filters");
  if (gal && withPhoto.length) {
    if (filters) filters.hidden = false;
    gal.hidden = false;
    withPhoto.forEach(function (it, idx) {
      var d = document.createElement("div");
      d.className = "g-item reveal"; d.dataset.tipo = it.tipo;
      var tag = '<span class="g-tag ' + esc(it.tipo) + '">' + esc(it.tipo) + "</span>";
      var meta = [it.luogo, it.anno].filter(Boolean).join(" · ");
      d.innerHTML = tag + '<img loading="lazy" decoding="async" src="' + esc(it.foto) + '" alt="' + esc(it.titolo + (meta ? " — " + meta : "")) + '">' +
        '<div class="g-cap"><b>' + esc(it.titolo) + "</b>" + esc(meta) + "</div>" +
        '<button aria-label="Ingrandisci: ' + esc(it.titolo) + '" data-i="' + idx + '"></button>';
      gal.appendChild(d);
    });
    $$(".g-item").forEach(function (el, i) {
      el.style.setProperty("--d", (i % 3) * 0.08 + "s");
      if (rio) rio.observe(el); else el.classList.add("in");
    });
    $$(".chip").forEach(function (c) {
      c.addEventListener("click", function () {
        $$(".chip").forEach(function (o) { o.classList.toggle("is-active", o === c); o.setAttribute("aria-selected", o === c); });
        var f = c.dataset.filter;
        $$(".g-item").forEach(function (g) { g.classList.toggle("hide", f !== "tutti" && g.dataset.tipo !== f); });
      });
    });

    var lb = $("#lightbox"), lbImg = $("img", lb), lbCap = $("figcaption", lb), cur = 0, lastFocus = null;
    function show(i) {
      cur = (i + withPhoto.length) % withPhoto.length;
      var it = withPhoto[cur];
      lbImg.src = it.foto; lbImg.alt = it.titolo;
      lbCap.textContent = [it.titolo, [it.luogo, it.anno].filter(Boolean).join(" · "), it.didascalia].filter(Boolean).join(" — ");
    }
    function open(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lb-close", lb).focus(); }
    function close() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
    gal.addEventListener("click", function (e) { var b = e.target.closest("button[data-i]"); if (b) open(+b.dataset.i); });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(cur - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
    });
    var tx = null;
    lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); tx = null; });
  }

  $("#year").textContent = new Date().getFullYear();
})();
