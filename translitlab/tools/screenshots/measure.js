const L = require("./lib");
(async () => {
  const b = await L.chromium.launch();
  const p = await L.context(b, { user: "admin", pass: "admin123" });
  await L.lab(p); await L.run(p, "ami tomay bhalobashi");
  const spots = await p.evaluate(() => {
    const F = document.querySelector(".tl-frame").getBoundingClientRect();
    const pick = { "tabs": ".tab-bar", "reset": "#btn-reset-defaults", "snippets": "#snippet-list", "direction": ".dir-btn[data-dir=forward]", "run": "#btn-run", "input": "#input-text", "js": "#panel-test .engine-label.js", "php": "#panel-test .engine-label.php", "jsout": "#js-output", "phpout": "#php-output", "jslog": "#js-log", "phplog": "#php-log", "status": "#js-status", "map": "#map-viewer-panel", "ver": ".tl-frame-head", "foot": ".tl-frame-foot", "snipcount": "#snip-count", "dirgroup": ".dir-btn[data-dir=reverse]", "Reset defaults": "#btn-reset-defaults",
      "Active snippets": "#snippet-list", "Direction": ".dir-btn[data-dir=forward]", "Run": "#btn-run", "Input": "#input-text",
      "JS engine": "#js-output", "PHP engine": "#php-output", "Match badge": "#js-status", "Map viewer": "#map-viewer-panel",
      "Version": ".tl-frame-ver", "Credit line": ".tl-frame-foot" };
    const out = {};
    for (const [k, s] of Object.entries(pick)) { const e = document.querySelector(s); if (!e) continue; const r = e.getBoundingClientRect();
      const f=(v)=>+v.toFixed(2); out[k] = { x: f((r.left - F.left) / F.width * 100), y: f((r.top - F.top) / F.height * 100), w: f(r.width / F.width * 100), h: f(r.height / F.height * 100) }; }
    const badge = document.querySelector("#js-status .badge, #js-status span:last-child"); 
    return { out, size: [F.width, F.height], js: document.getElementById("js-status").innerHTML.slice(0, 300) };
  });
  console.log(JSON.stringify(spots, null, 1));
  await b.close();
})();
