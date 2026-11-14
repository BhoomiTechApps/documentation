/**
 * Phonetic typing playground and key table for the manual.
 * Uses the same engine and map file as Lekhoni (assets/vendor/translit/).
 * When the app's mapping changes, copy the new translit-forward-map.json here
 * and the table and the playground follow automatically.
 */
(function () {
  "use strict";

  const MAP_URL = "assets/vendor/translit/translit-forward-map.json";
  const WORD = /[a-zA-Z0-9.:^~`$,+]+(?:'[a-zA-Z0-9.:^~`$,+]*)*/g; // what Lekhoni treats as one word
  const $ = (s) => document.querySelector(s);

  const SECTIONS = [
    ["independent_vowels", "Vowels at the start of a word or after another vowel"],
    ["matras", "Vowel signs after a consonant (shown on ◌)"],
    ["consonants", "Consonants"],
    ["special", "Signs: anusvara, visarga, chandrabindu, hasanta"],
    ["digits", "Digits"],
    ["punctuation", "Punctuation"],
  ];

  function show(out, txt) { if (out) out.textContent = txt; }

  function renderTable(map, lang) {
    const host = $("#key-table");
    if (!host) return;
    const overrides = (map.lang_overrides && map.lang_overrides[lang]) || {};
    let html = "";
    for (const [sec, label] of SECTIONS) {
      let pairs = Array.isArray(map[sec]) ? map[sec].slice() : [];
      if (overrides[sec]) {
        const over = new Map(overrides[sec]);
        pairs = pairs.map(([k, v]) => [k, over.has(k) ? over.get(k) : v]);
      }
      if (!pairs.length) continue;
      html += `<h4>${label}</h4><div class="keys">`;
      for (const [k, v] of pairs) {
        let shown = v === "" ? "(none)" : v;
        if (sec === "matras" && v) shown = "◌" + v;
        if (sec === "special" && /^[ঁ-ঃ্]/.test(v)) shown = "◌" + v.replace(/‌/g, "");
        html += `<div class="key"><code>${escape(k)}</code><b>${escape(shown)}</b></div>`;
      }
      html += "</div>";
    }
    host.innerHTML = html;
  }
  const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function init() {
    const inp = $("#pg-input"), out = $("#pg-output"), status = $("#pg-status");
    if (!inp && !$("#key-table")) return;
    if (!window.Translit) { show(status, "The typing engine did not load."); return; }
    fetch(MAP_URL)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((map) => {
        window.Translit.init(map);
        const lang = () => (document.querySelector('input[name="pg-lang"]:checked') || {}).value || "bn";
        const run = () => {
          window.Translit.lang = lang();
          show(out, inp.value.replace(WORD, (w) => window.Translit.parse(w)));
        };
        inp.addEventListener("input", run);
        document.querySelectorAll('input[name="pg-lang"]').forEach((r) => r.addEventListener("change", () => { run(); renderTable(map, lang()); }));
        run();
        renderTable(map, lang());
        show(status, "Uses Lekhoni’s own typing engine and the same key map as the app.");
      })
      .catch(() => {
        show(status, "The key map could not be loaded. Open this manual from its web address (GitHub Pages) or a local web server, not as a file.");
        const t = $("#key-table");
        if (t) t.innerHTML = '<p class="callout warn">The key table needs the manual to be opened from a web address.</p>';
      });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
