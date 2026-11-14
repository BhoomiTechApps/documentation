/**
 * Eastern Nagari typing playground and key table for the OCR Studio manual.
 * Uses the same engine, key map and rules as the app (assets/vendor/ime/, copied
 * from the app's js/ime/). When the app's typing rules change, copy the new files
 * here and the table and the playground follow automatically.
 */
(function () {
  "use strict";

  const BASE = "assets/vendor/ime/";
  const WORD = /[\x21-\x7e]+/g; // the app treats any run of printable Roman characters as one word
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const SECTIONS = [
    ["independent_vowels", "Vowels at the start of a word or after another vowel"],
    ["matras", "Vowel signs after a consonant (shown on ◌)"],
    ["consonants", "Consonants"],
    ["special", "Signs: anusvara, visarga, chandrabindu, hasanta"],
    ["digits", "Digits"],
    ["punctuation", "Punctuation"],
  ];

  function renderTable(map) {
    const host = $("#key-table");
    if (!host) return;
    let html = "";
    for (const [sec, label] of SECTIONS) {
      const pairs = Array.isArray(map[sec]) ? map[sec] : [];
      if (!pairs.length) continue;
      html += `<h4>${label}</h4><div class="keys">`;
      for (const [k, v] of pairs) {
        let shown = v === "" ? "(none)" : v.replace(/‌/g, "");
        if (sec === "matras" && v) shown = "◌" + v;
        if (sec === "special" && /^[ঁ-ঃ্]/.test(v)) shown = "◌" + shown;
        html += `<div class="key"><code>${esc(k)}</code><b>${esc(shown)}</b></div>`;
      }
      html += "</div>";
    }
    host.innerHTML = html;
  }

  /** Build the transliterator exactly as the app does (js/studio.js, loadKeyboard). */
  function makeEngine(forward, reverse, hooks, settings) {
    const nameOf = (b) => (/function\s+([A-Za-z0-9_$]+)\s*\(/.exec(b || "") || [])[1];
    const buckets = { pre: [], loop: [], post: [] };
    hooks.filter((h) => h.direction === "forward" && h.is_active && buckets[h.hook_stage] && nameOf(h.js_body))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .forEach((h) => { try { buckets[h.hook_stage].push(new Function(h.js_body + "\nreturn " + nameOf(h.js_body) + ";")()); } catch (e) { /* skip */ } });
    const maps = { forward, reverse };
    return (t) => (t ? window.CPLAI_ENGINE.bpmTransliterate(t, "forward", maps, buckets.pre, buckets.loop, buckets.post, {}, settings).output : "");
  }

  function init() {
    const inp = $("#pg-input"), out = $("#pg-output"), status = $("#pg-status");
    if (!inp && !$("#key-table")) return;
    if (!window.CPLAI_ENGINE) { if (status) status.textContent = "The typing engine did not load."; return; }
    const get = (n) => fetch(BASE + n).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
    Promise.all(["forwardMap.json", "reverseMap.json", "defaults.json", "js-engine-settings.default.json"].map(get))
      .then(([forward, reverse, hooks, settings]) => {
        const tr = makeEngine(forward, reverse, hooks, settings);
        const run = () => { out.textContent = inp.value.replace(WORD, (w) => tr(w)); };
        inp.addEventListener("input", run);
        run();
        renderTable(forward);
        if (status) status.textContent = "Uses OCR Studio’s own typing engine and rules.";
      })
      .catch(() => {
        if (status) status.textContent = "The typing rules could not be loaded. Open this manual from its web address (GitHub Pages) or a local web server, not as a file.";
        const t = $("#key-table");
        if (t) t.innerHTML = '<p class="callout warn">The key table needs the manual to be opened from a web address.</p>';
      });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
