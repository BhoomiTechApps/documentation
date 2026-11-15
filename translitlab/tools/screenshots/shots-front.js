// Front-end screens: notices, the five lab tabs, dialogs, a Transliterator's view and the light theme.
const L = require("./lib");
const { el, area, shot, context, lab, tab, run, toastShot, download, LAB, LAB_LIGHT } = L;

(async () => {
  const b = await L.chromium.launch();

  // ── Notices ───────────────────────────────────────────────────────────────
  console.log("notices");
  let p = await context(b);
  await lab(p); await el(p, ".tl-frame", "notice-login", 12);
  await p.context().close();

  p = await context(b, { user: "amit", pass: "amit123" });           // Transliterator, no lab access
  await lab(p); await el(p, ".tl-frame", "notice-no-access", 12);
  await p.context().close();

  p = await context(b, { user: "rina", pass: "rina123", w: 900, h: 800 });   // too narrow
  await lab(p); await el(p, ".tl-frame", "notice-desktop", 0);
  await p.context().close();

  // ── Administrator: the lab ────────────────────────────────────────────────
  console.log("lab (admin)");
  p = await context(b, { user: "admin", pass: "admin123" });
  await lab(p);
  await shot(p, "page-context", { fullPage: false });                  // the lab on its page
  await run(p, "ami tomay bhalobashi");
  await el(p, ".tl-frame", "lab-overview");
  await el(p, "#panel-test > div:nth-child(2)", "test-center");

  // reverse direction
  await run(p, "আমি তোমায় ভালোবাসি", "reverse");
  await el(p, "#panel-test > div:nth-child(2)", "test-reverse");

  // active snippets column
  await el(p, "#snippet-list", "test-snippets", 0).catch(() => {});

  // map viewer
  await p.selectOption("#map-view-select", "forward"); await p.waitForTimeout(700);
  await el(p, "#map-viewer-panel", "map-viewer");
  await p.fill("#map-search", "kh"); await p.waitForTimeout(500);
  await el(p, "#map-viewer-panel", "map-viewer-filter");
  await p.fill("#map-search", "");
  await p.locator('#map-grid .map-entry[data-from="kh"]').first().click(); await p.waitForTimeout(500);
  await el(p, "#map-edit-modal", "map-edit-modal", 14);
  await p.click("#btn-map-edit-cancel"); await p.waitForTimeout(300);

  // ── Snippets tab ───────────────────────────────────────────────────────────
  console.log("snippets");
  await tab(p, "snippets");
  await p.locator("#snip-panel-list-body [data-snip-edit]").nth(1).click(); await p.waitForTimeout(700);
  await el(p, ".tl-frame", "snippets-editor");
  // selection bar
  const checks = p.locator("#snip-panel-list-body input[type=checkbox]");
  if (await checks.count()) { await checks.nth(0).check(); await checks.nth(3).check(); await p.waitForTimeout(300); await el(p, "#sel-action-bar", "snippets-selection", 6).catch(() => {}); }
  await p.click("#btn-sel-clear").catch(() => {});
  // export one snippet -> use it as the import sample
  const snipFile = await download(p, () => p.locator("#snip-panel-list-body [data-snip-export]").nth(1).click(), "snippet-sample.json");
  await p.click("#btn-import-snippets"); await p.waitForTimeout(400);
  await p.setInputFiles("#import-file-input", snipFile); await p.waitForTimeout(600);
  await el(p, "#import-modal", "snippets-import", 14);
  await p.click("#btn-import-cancel"); await p.waitForTimeout(300);

  // ── Maps tab ───────────────────────────────────────────────────────────────
  console.log("maps");
  await tab(p, "maps");
  await p.selectOption("#maps-tab-view-select", "forward"); await p.waitForTimeout(900);
  await el(p, ".tl-frame", "maps-tab");
  // move a row down to show the unsaved-order state
  await p.locator("#maps-tab-body .map-row-btn[data-action=down]").nth(1).click(); await p.waitForTimeout(500);
  await el(p, "#maps-tab-body .map-section-block", "maps-reorder", 2);
  await p.locator("#maps-tab-body .btn-map-section-cancel").first().click(); await p.waitForTimeout(400);
  const mapFile = await download(p, () => p.click("#btn-maps-tab-export"), "forward-map-sample.json");
  await p.click("#btn-maps-tab-import"); await p.waitForTimeout(400);
  await p.setInputFiles("#import-map-file-input", mapFile); await p.waitForTimeout(700);
  await el(p, "#import-map-modal", "maps-import", 14);
  await p.click("#btn-import-map-cancel"); await p.waitForTimeout(300);

  // ── Engines tab ────────────────────────────────────────────────────────────
  console.log("engines");
  await tab(p, "engines"); await p.waitForTimeout(1200);
  await el(p, ".tl-frame", "engines-tab");
  await el(p, "#engine-settings-js", "engine-settings", 6).catch(() => {});

  // ── Debug tab ──────────────────────────────────────────────────────────────
  console.log("debug");
  await run(p, "ami tomay bhalobashi");
  await tab(p, "debug"); await p.waitForTimeout(700);
  await el(p, ".tl-frame", "debug-tab");

  // header strip: tabs + reset
  await tab(p, "test");
  await area(p, [".tab-btn[data-tab=test]", "#btn-help"], "lab-header", 8);
  await p.context().close();

  // ── Transliterator view (Rina: Test, Snippets, Maps by default) ───────────
  console.log("transliterator");
  p = await context(b, { user: "rina", pass: "rina123" });
  await lab(p);
  await area(p, [".tab-btn[data-tab=test]", "#btn-help"], "lab-header-transliterator", 8);
  await tab(p, "snippets");
  await p.locator("#snip-panel-list-body [data-snip-edit]").nth(1).click(); await p.waitForTimeout(700);
  await el(p, "#snip-panel-editor-inner", "snippet-editor-locked", 4).catch(() => {});
  await p.context().close();

  // ── Light theme ────────────────────────────────────────────────────────────
  console.log("light");
  p = await context(b, { user: "admin", pass: "admin123" });
  await lab(p, LAB_LIGHT);
  await run(p, "amar sonar bangla");
  await el(p, ".tl-frame", "lab-light");
  await p.context().close();

  await b.close();
})();
