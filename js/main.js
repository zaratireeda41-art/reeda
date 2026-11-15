/* Reeda — main.js v15: premium motion (GSAP + ScrollTrigger + Lenis, vendored locally) */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  window.__motionReady = true;

  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s || "").replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  var G = window.gsap, ST = window.ScrollTrigger;
  var HAS_G = !!(G && ST) && !RM;
  if (HAS_G) {
    G.registerPlugin(ST);
    doc.classList.add("gsap-on");
    ST.config({ ignoreMobileResize: true });
    G.defaults({ ease: "expo.out" });
  }

  /* ---------- smooth scroll (Lenis) — desktop / fine pointer only; touch keeps native iOS scroll ---------- */
  var lenis = null;
  if (HAS_G && fine && window.Lenis) {
    try {
      lenis = new window.Lenis({
        duration: 1.15,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        wheelMultiplier: 1
      });
      lenis.on("scroll", ST.update);
      G.ticker.add(function (time) { lenis.raf(time * 1000); });
      G.ticker.lagSmoothing(0);
    } catch (e) { lenis = null; }
  }
  // anchor links glide with Lenis (native smooth-scroll CSS handles the rest)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || !lenis) return;
    var id = a.getAttribute("href");
    var t = id === "#top" || id === "#" ? 0 : $(id);
    if (t === null) return;
    e.preventDefault();
    lenis.scrollTo(t, { duration: 1.6, offset: 0 });
  });

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
    }, { rootMargin: "300px 0px", threshold: 0.01 });
    lazyVids.forEach(function (v) { vio.observe(v); });
    if (heroV) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (RM || saveData) return; e.isIntersecting ? tryPlay(heroV) : heroV.pause(); });
      }).observe(heroV);
    }
  }

  /* ---------- hero title split (chars) ---------- */
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

  /* ---------- hero tagline split in lines (masked slide-up) ---------- */
  var tag = $(".hero-tag");
  if (tag) {
    var tagText = tag.textContent.trim(), tagSplit = false;
    var splitLines = function () {
      if (tagSplit) return; tagSplit = true;
      if (RM) { tag.classList.add("lines-ready"); return; }
      var words = tagText.split(/\s+/);
      tag.innerHTML = words.map(function (w) { return '<span class="lw" style="display:inline-block">' + esc(w) + "</span>"; }).join(" ");
      var lines = [], lastTop = null;
      $$(".lw", tag).forEach(function (s) {
        var top = s.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 3) { lines.push([]); lastTop = top; }
        lines[lines.length - 1].push(s.textContent);
      });
      tag.setAttribute("aria-label", tagText);
      tag.innerHTML = lines.map(function (l, i) {
        return '<span class="ln" aria-hidden="true"><span class="lni" style="--l:' + i + '">' + esc(l.join(" ")) + "</span></span>";
      }).join("");
      tag.classList.add("lines-ready");
      // once revealed, restore plain text so it re-flows naturally on resize/rotation
      var restore = function () { tag.textContent = tagText; tag.removeAttribute("aria-label"); removeEventListener("resize", restore); };
      setTimeout(function () { addEventListener("resize", restore); }, 2600);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(splitLines);
    setTimeout(splitLines, 700);
  }

  /* ---------- typewriter ---------- */
  var words = ["FOTOVOLTAICO", "METALLURGIA", "OFFSHORE", "GIURISTA D'IMPRESA", "AVVOCATO D'AFFARI", "ROBOTICA"];
  var typer = $("#typer");
  if (typer) {
    if (RM) { typer.textContent = words.join(" · "); }
    else {
      var wi = 0, ci = words[0].length, del = true;
      setTimeout(function tick() {
        var w = words[wi];
        ci += del ? -1 : 1;
        typer.textContent = w.slice(0, ci);
        var d = del ? 38 : 85;
        if (!del && ci === w.length) { del = true; d = 1700; }
        else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; d = 380; }
        setTimeout(tick, d);
      }, (doc.classList.contains("pl-skip") ? 1500 : 3800));
    }
  }

  /* ---------- GSAP scroll choreography ---------- */
  function onceIn(el, start, fn) {
    ST.create({ trigger: el, start: start, end: "max", once: true, onEnter: fn });
  }
  if (HAS_G) {
    var mm = G.matchMedia();
    var hero = $(".hero"), heroMedia = $(".hero-media"), heroContent = $(".hero-content");

    // HERO: pinned "curtain" on desktop (next sections slide over it), scrubbed depth everywhere
    if (hero) {
      mm.add("(min-width: 900px) and (hover: hover)", function () {
        ST.create({ trigger: hero, start: "top top", end: "bottom top", pin: true, pinSpacing: false });
        var tl = G.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        tl.to(heroContent, { yPercent: -22, opacity: 0 }, 0)
          .to(heroMedia, { scale: 1.12, opacity: 0.35 }, 0);
      });
      mm.add("(max-width: 899px), (hover: none)", function () {
        var tl = G.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        tl.to(heroContent, { y: -70, opacity: 0.15 }, 0)
          .to(heroMedia, { yPercent: 12 }, 0);
      });
    }

    // HEADINGS: words slide up out of masks
    $$(".sec-head h2, .about-grid > h2").forEach(function (h) {
      var txt = h.textContent.trim();
      h.classList.remove("reveal");
      h.setAttribute("aria-label", txt);
      h.innerHTML = txt.split(/\s+/).map(function (w) {
        return '<span class="w" aria-hidden="true"><span class="wi">' + esc(w) + "</span></span>";
      }).join(" ");
      h.classList.add("h-split");
      var wis = $$(".wi", h);
      G.set(wis, { yPercent: 118, rotate: 4 });
      onceIn(h, "top 88%", function () {
        h.classList.add("in");
        G.to(wis, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.07 });
      });
    });

    // VIDEOS: clip-path window opens + inner zoom-out while scrolling in, then gentle parallax
    $$(".vid-wide, .vid-card").forEach(function (fig) {
      fig.classList.remove("reveal");
      var v = $("video", fig);
      G.fromTo(fig, { clipPath: "inset(12% 9% 12% 9% round 28px)" },
        { clipPath: "inset(0% 0% 0% 0% round 18px)", ease: "none",
          scrollTrigger: { trigger: fig, start: "top 98%", end: "top 40%", scrub: 0.6 } });
      if (v) {
        G.fromTo(v, { scale: 1.32 }, { scale: 1.06, ease: "none",
          scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: 0.6 } });
        G.fromTo(v, { yPercent: -3 }, { yPercent: 3, ease: "none",
          scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true } });
      }
    });

    // BAND sections: parallax depth on the background video
    $$(".band").forEach(function (sec) {
      var m = $(".band-media", sec);
      if (!m) return;
      G.fromTo(m, { yPercent: -8 }, { yPercent: 8, ease: "none",
        scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });
      var c = $(".band-content", sec);
      if (c) G.fromTo(c, { y: 60 }, { y: -40, ease: "none",
        scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // QUOTE: words light up as you read
    var qp = $(".quote p");
    if (qp) {
      var q = $(".quote"); q.classList.remove("reveal");
      var qt = qp.textContent.trim();
      qp.setAttribute("aria-label", qt);
      qp.innerHTML = qt.split(/\s+/).map(function (w) { return '<span class="qw" aria-hidden="true">' + esc(w) + "</span>"; }).join(" ");
      G.fromTo($$(".qw", qp), { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: qp, start: "top 85%", end: "bottom 50%", scrub: true } });
    }

    // TIMELINE: the line draws itself with the scroll
    var tlEl = $(".timeline");
    if (tlEl) {
      G.fromTo(tlEl, { "--tl": 0 }, { "--tl": 1, ease: "none",
        scrollTrigger: { trigger: tlEl, start: "top 75%", end: "bottom 60%", scrub: true } });
    }

    // MARQUEE: speed + skew react to scroll velocity, direction follows scroll
    var track = $(".marquee-track");
    if (track) {
      track.style.animation = "none";
      var mx = 0, half = 0, vTarget = 0, vSmooth = 0, mdir = 1, mVisible = true;
      var measure = function () { half = track.scrollWidth / 2; };
      measure(); addEventListener("resize", measure);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
      ST.create({ start: 0, end: "max", onUpdate: function (s) {
        var v = s.getVelocity(); vTarget = v; if (Math.abs(v) > 5) mdir = v > 0 ? 1 : -1;
      } });
      if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { mVisible = es[0].isIntersecting; }).observe(track.parentElement);
      G.ticker.add(function (time, dt) {
        vSmooth += (vTarget - vSmooth) * 0.08; vTarget *= 0.92;
        if (!mVisible || !half) return;
        var speed = 55 + Math.min(Math.abs(vSmooth) * 0.35, 1400);
        mx -= speed * mdir * (dt / 1000);
        if (mx <= -half) mx += half; else if (mx > 0) mx -= half;
        var sk = clamp(-vSmooth * 0.0035, -9, 9);
        track.style.transform = "translate3d(" + mx.toFixed(2) + "px,0,0) skewX(" + sk.toFixed(2) + "deg)";
      });
    }

    // re-measure once fonts + media posters settle
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
    addEventListener("load", function () { ST.refresh(); });
  }

  /* ---------- reveal on scroll (IntersectionObserver + CSS transitions) ---------- */
  var reveals = $$(".reveal");
  reveals.forEach(function (el) {
    var sibs = $$(".reveal", el.parentElement).filter(function (s) { return s.parentElement === el.parentElement; });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty("--d", Math.min(i * 0.09, 0.54) + "s");
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
    var t0 = null, dur = 1800;
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
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

  /* ---------- scroll: progress, glass nav hide/show, fallback parallax, active link ---------- */
  var bar = $(".progress span"), nav = $("#nav");
  var par = (RM || HAS_G) ? [] : $$("[data-parallax]");
  var links = $$(".menu a");
  var secs = links.map(function (a) { return $(a.getAttribute("href")); });
  var ticking = false, lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY, h = doc.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    nav.classList.toggle("scrolled", y > 40);
    var dy = y - lastY;
    if (!RM) {
      if (y > innerHeight * 0.6 && dy > 6 && !document.body.classList.contains("nav-open")) nav.classList.add("nav-hidden");
      else if (dy < -6 || y < innerHeight * 0.6) nav.classList.remove("nav-hidden");
    }
    lastY = y;
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
  // show the nav again when the pointer goes near the top
  if (fine) addEventListener("pointermove", function (e) { if (e.clientY < 80) nav.classList.remove("nav-hidden"); }, { passive: true });

  /* ---------- mobile menu ---------- */
  var tog = $(".nav-toggle");
  tog.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    tog.setAttribute("aria-expanded", open);
    nav.classList.remove("nav-hidden");
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  links.forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("nav-open"); tog.setAttribute("aria-expanded", "false"); if (lenis) lenis.start(); }); });

  /* ---------- desktop micro-interactions ---------- */
  if (fine && !RM) {
    // card tilt + spotlight
    $$(".tilt").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
        el.style.transform = "perspective(800px) rotateX(" + ((0.5 - y) * 7) + "deg) rotateY(" + ((x - 0.5) * 9) + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });

    // magnetic buttons (+ label parallax)
    $$(".magnetic, .brand").forEach(function (el) {
      if (el.classList.contains("btn") && !$(".btn-label", el)) {
        el.innerHTML = '<span class="btn-label">' + el.innerHTML + "</span>";
      }
      var label = $(".btn-label", el);
      if (HAS_G) {
        var qx = G.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }), qy = G.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
        var lx = label ? G.quickTo(label, "x", { duration: 0.6, ease: "power3.out" }) : null, ly = label ? G.quickTo(label, "y", { duration: 0.6, ease: "power3.out" }) : null;
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
          qx(dx * 0.3); qy(dy * 0.4);
          if (lx) { lx(dx * 0.12); ly(dy * 0.16); }
        });
        el.addEventListener("pointerleave", function () {
          G.to(el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1,0.35)" });
          if (label) G.to(label, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1,0.35)" });
        });
      } else {
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25) + "px)";
        });
        el.addEventListener("pointerleave", function () { el.style.transform = ""; });
      }
    });

    // custom cursor: dot follows exactly, ring trails with easing; grows over links/videos
    var cur = $(".cursor"), cDot = $(".cursor-dot"), cRing = $(".cursor-ring");
    var glow = $(".cursor-glow");
    if (cur) {
      doc.classList.add("has-cursor");
      var px = innerWidth / 2, py = innerHeight / 2, rx = px, ry = py, cOn = false;
      addEventListener("pointermove", function (e) {
        if (e.pointerType && e.pointerType !== "mouse") return;
        px = e.clientX; py = e.clientY;
        if (!cOn) { cOn = true; cur.classList.add("on"); if (glow) glow.classList.add("on"); rx = px; ry = py; }
      }, { passive: true });
      document.addEventListener("mouseleave", function () { cOn = false; cur.classList.remove("on"); if (glow) glow.classList.remove("on"); });
      addEventListener("pointerdown", function () { cur.classList.add("c-down"); });
      addEventListener("pointerup", function () { cur.classList.remove("c-down"); });
      document.addEventListener("pointerover", function (e) {
        var t = e.target;
        var link = t.closest && t.closest("a, button, .magnetic, [role=tab], label");
        var media = !link && t.closest && t.closest(".vid-wide, .vid-card");
        cur.classList.toggle("c-link", !!link);
        cur.classList.toggle("c-media", !!media);
      });
      (function loop() {
        rx += (px - rx) * 0.16; ry += (py - ry) * 0.16;
        cDot.style.transform = "translate3d(" + px + "px," + py + "px,0)";
        cRing.style.transform = "translate3d(" + rx.toFixed(2) + "px," + ry.toFixed(2) + "px,0)";
        if (glow) glow.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
        requestAnimationFrame(loop);
      })();
    }
  }

  /* ---------- tabs ---------- */
  var tabs = $$(".tab");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (o) {
        var on = o === t; o.classList.toggle("is-active", on); o.setAttribute("aria-selected", on);
        var p = $("#" + o.getAttribute("aria-controls")); p.hidden = !on; p.classList.toggle("is-active", on);
      });
      if (HAS_G) ST.refresh();
    });
  });

  /* ---------- gallery (impianti): only entries with a real foto ---------- */
  var withPhoto = (window.IMPIANTI || []).filter(function (it) { return it && it.foto; });
  var gal = $("#gallery");
  var filters = $(".filters");
  if (gal && withPhoto.length) {
    if (filters) filters.hidden = false;
    gal.hidden = false;
    withPhoto.forEach(function (it, idx) {
      var d = document.createElement("div");
      d.className = "g-item reveal"; d.dataset.tipo = it.tipo;
      var tg = '<span class="g-tag ' + esc(it.tipo) + '">' + esc(it.tipo) + "</span>";
      var meta = [it.luogo, it.anno].filter(Boolean).join(" · ");
      d.innerHTML = tg + '<img loading="lazy" decoding="async" src="' + esc(it.foto) + '" alt="' + esc(it.titolo + (meta ? " — " + meta : "")) + '">' +
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
        if (HAS_G) ST.refresh();
      });
    });

    var lb = $("#lightbox"), lbImg = $("img", lb), lbCap = $("figcaption", lb), cur2 = 0, lastFocus = null;
    var show = function (i) {
      cur2 = (i + withPhoto.length) % withPhoto.length;
      var it = withPhoto[cur2];
      lbImg.src = it.foto; lbImg.alt = it.titolo;
      if (lbCap) lbCap.textContent = [it.titolo, [it.luogo, it.anno].filter(Boolean).join(" · "), it.didascalia].filter(Boolean).join(" — ");
    };
    var open = function (i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; if (lenis) lenis.stop(); $(".lb-close", lb).focus(); };
    var close = function () { lb.hidden = true; document.body.style.overflow = ""; if (lenis) lenis.start(); if (lastFocus) lastFocus.focus(); };
    gal.addEventListener("click", function (e) { var b = e.target.closest("button[data-i]"); if (b) open(+b.dataset.i); });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(cur2 - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(cur2 + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(cur2 - 1); else if (e.key === "ArrowRight") show(cur2 + 1);
    });
    var tx = null;
    lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(cur2 + (dx < 0 ? 1 : -1)); tx = null; });
  }

  $("#year").textContent = new Date().getFullYear();
})();
