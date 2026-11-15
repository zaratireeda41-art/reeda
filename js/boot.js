/* Reeda — boot.js: caricato nel <head> (prima era uno script inline; ora esterno per la CSP script-src 'self') */
(function (w, d) {
  "use strict";
  var h = d.documentElement;

  /* Anti-clickjacking (GitHub Pages non permette l'header X-Frame-Options / frame-ancestors):
     se la pagina e' dentro un iframe di un altro sito, la nasconde e prova a uscire dal frame. */
  if (w.self !== w.top) {
    h.classList.add("framed");
    try { w.top.location.replace(w.self.location.href); } catch (e) { /* bloccato dal sandbox: la pagina resta nascosta */ }
    return;
  }

  h.classList.add("js");
  try {
    if (w.sessionStorage.getItem("reeda-intro")) h.classList.add("pl-skip");
    w.sessionStorage.setItem("reeda-intro", "1");
  } catch (e) {}
  // se main.js non parte entro 6 s, mostra comunque tutto il contenuto
  setTimeout(function () { if (!w.__motionReady) h.classList.remove("js"); }, 6000);
})(window, document);
