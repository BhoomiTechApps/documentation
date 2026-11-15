/**
 * "Try the engine" box and map table for the TransLit-Lab manual.
 *
 * Uses the JS packages that the Parity add-on builds (translit-forward.js and translit-reverse.js, the
 * UMD files from each package's dist/ folder), copied into assets/vendor/translit/. They carry the
 * maps, engine settings and snippets they were built from, so the box and the table show exactly what
 * those packages do. After you change the maps or snippets in the lab, build the JS packages again and
 * copy the two dist files here; the manual follows automatically.
 */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const show = (s) => esc(s).replace(/‌/g, '<i class="zw">ZWNJ</i>').replace(/‍/g, '<i class="zw">ZWJ</i>');

  const SECTIONS = [
    ["consonants", "Consonants"],
    ["independent_vowels", "Vowels (independent form)"],
    ["matras", "Vowel signs (after a consonant, shown on ◌)"],
    ["special", "Special: anusvara, visarga, chandrabindu, hasanta …"],
    ["digits", "Digits"],
    ["punctuation", "Punctuation"],
  ];

  function engines() {
    return { forward: window.TranslitForward, reverse: window.TranslitReverse };
  }

  // ── The try box ───────────────────────────────────────────────────────
  function setupTry() {
    const box = $("#try-box");
    if (!box) return;
    const E = engines();
    const input = $("#try-input"), out = $("#try-output"), log = $("#try-log"), status = $("#try-status");
    if (!E.forward || !E.reverse) { status.textContent = "The engine files could not be loaded."; return; }
    let dir = "forward";
    const examples = { forward: "ami tomay bhalobashi", reverse: "আমি তোমায় ভালোবাসি" };

    const runIt = () => {
      const r = E[dir].run(input.value);
      out.innerHTML = show(r.output);
      out.lang = dir === "forward" ? "bn" : "en";
      log.textContent = (r.log || []).join("\n");
      status.textContent = (dir === "forward" ? "Forward (Roman → BPM)" : "Reverse (BPM → Roman)") + " · package v" + E[dir].version + " · " + (r.log || []).length + " log lines";
    };
    box.querySelectorAll("[data-dir]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.dir === dir) return;
      dir = b.dataset.dir;
      box.querySelectorAll("[data-dir]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      input.value = examples[dir];
      input.lang = dir === "forward" ? "en" : "bn";
      runIt();
    }));
    input.addEventListener("input", runIt);
    runIt();
  }

  // ── The map table ─────────────────────────────────────────────────────
  function setupTable() {
    const host = $("#map-table");
    if (!host || !window.TranslitForward) return;
    const map = window.TranslitForward.getDefaults().map || {};
    let html = "", total = 0;
    for (const [sec, label] of SECTIONS) {
      const pairs = (Array.isArray(map[sec]) ? map[sec] : []).map((e) => (e.length === 3 ? [e[1], e[2]] : e));
      if (!pairs.length) continue;
      total += pairs.length;
      html += `<h4>${label} <small>${pairs.length}</small></h4><div class="keys">`;
      for (const [k, v] of pairs) {
        let shown = v === "" ? "(none)" : v;
        if (sec === "matras" && v) shown = "◌" + v;
        if (sec === "special" && /^[ঁ-ঃ্]/.test(v)) shown = "◌" + v;
        html += `<div class="key"><code>${esc(k)}</code><b lang="bn">${show(shown)}</b></div>`;
      }
      html += "</div>";
    }
    host.innerHTML = `<p class="status">${total} entries in the forward map of translit-js-forward v${esc(window.TranslitForward.version)}.</p>` + html;
  }

  function start() { setupTry(); setupTable(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
