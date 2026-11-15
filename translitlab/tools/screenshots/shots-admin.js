// Admin screens: revisions are created first (one edit by a Transliterator, one by the administrator),
// then Settings → TranslitLab, Users, and the Parity add-on (check, run, a deliberate mismatch, builds).
const L = require("./lib");
const { el, area, shot, context, lab, tab, run, toastShot, download, SITE } = L;

async function editSnippet(p, idx, fn) {
  await tab(p, "snippets");
  await p.locator("#snip-panel-list-body [data-snip-edit]").nth(idx).click(); await p.waitForTimeout(600);
  await fn();
  await p.click("#btn-save-snippet-panel"); await p.waitForTimeout(1500);
}
async function done(p) {
  await p.waitForFunction(() => /^(Done|Stopped|Error)/.test(document.querySelector(".tlp-status")?.textContent || ""), null, { timeout: 300000 });
  await p.waitForTimeout(700);
}
// the result card from its top down to the end of the Nth difference row
async function resultTop(p, name, rows = 6) {
  const c = p.locator(".tlp-card >> nth=2");
  const cb = await c.boundingBox();
  const trs = c.locator(".tlp-table tbody tr");
  const n = await trs.count();
  let bottom = cb.y + cb.height;
  if (n > rows) { const rb = await trs.nth(rows - 1).boundingBox(); bottom = rb.y + rb.height; }
  const sy = await p.evaluate(() => scrollY);
  await L.shot(p, name, { fullPage: true, clip: { x: cb.x - 6, y: cb.y + sy - 6, width: cb.width + 12, height: bottom - cb.y + 12 } });
}
const card = (p, h2) => p.locator(".tl-card", { has: p.locator(`h2:text-is("${h2}")`) }).first();

(async () => {
  const b = await L.chromium.launch();

  // ── Make some history ─────────────────────────────────────────────────────
  console.log("history");
  let p = await context(b, { user: "rina", pass: "rina123" });
  await lab(p);
  await editSnippet(p, 3, async () => {
    await p.fill("#ped-desc", (await p.inputValue("#ped-desc")) + " Checked against the 1962 orthography list.");
  });
  await p.context().close();

  p = await context(b, { user: "admin", pass: "admin123", w: 1180, h: 860 });
  await p.addInitScript(() => document.addEventListener("DOMContentLoaded", () => { const s = document.createElement("style"); s.textContent = "img.avatar{visibility:hidden} #wpadminbar{display:none!important} html.wp-toolbar{padding-top:0!important}"; document.head.appendChild(s); }));
  await lab(p);
  await editSnippet(p, 1, async () => {
    const js = await p.inputValue("#ped-js");
    await p.fill("#ped-js", js.replace("{", "{\n  // Reviewed for the Heritage word list."));
  });

  // ── Settings → TranslitLab ────────────────────────────────────────────────
  console.log("settings");
  await p.goto(SITE + "/wp-admin/options-general.php?page=translitlab-settings"); await p.waitForTimeout(800);
  const cards = { "Frontend Shortcode": "settings-shortcode", "Interface": "settings-interface", "Default Tab Visibility": "settings-default-tabs",
    "Transliterator Access & Tabs": "settings-access", "When the plugin is deleted": "settings-delete", "Data & Backups": "settings-backups",
    "Revision History": "settings-revisions", "Custom Snippet JavaScript": "settings-custom-js" };
  for (const [h, name] of Object.entries(cards)) await el(p, card(p, h), name, 6).catch((e) => console.log("missing", h, e.message.split("\n")[0]));

  // The Role field on a Transliterator's profile
  await p.goto(SITE + "/wp-admin/user-edit.php?user_id=3"); await p.waitForTimeout(600);
  await el(p, "tr.user-role-wrap", "user-role", 6).catch(() => {});

  // ── Parity ───────────────────────────────────────────────────────────────
  console.log("parity");
  const PAR = SITE + "/wp-admin/tools.php?page=translitlab-parity";
  await p.goto(PAR); await p.waitForSelector(".tlp-env", { timeout: 20000 }); await p.waitForTimeout(800);
  await shot(p, "parity-page", { fullPage: true });
  await el(p, ".tlp-card >> nth=0", "parity-check", 6);
  await el(p, ".tlp-card >> nth=1", "parity-run-form", 6);
  await p.selectOption("#tlp-count", "250");
  await p.click("text=Run parity test");
  await p.waitForTimeout(1500);
  await done(p);
  await resultTop(p, "parity-result-ok", 5);
  await download(p, () => p.click("text=Download full report (JSON)"), "parity-report-ok.json");

  // A deliberate mismatch: switch off Step 2 (explicit ZWNJ) for the JS engine only.
  console.log("mismatch");
  const q = await p.context().newPage(); q.on("dialog", (d) => d.accept());
  await lab(q); await tab(q, "engines");
  await q.uncheck("#eset-js-hardcode_independent_vowel"); await q.click(".eset-save[data-engine=js]"); await q.waitForTimeout(1500);
  await p.bringToFront();
  await p.click("text=Reload configuration"); await p.waitForTimeout(2500);
  await el(p, ".tlp-card >> nth=0", "parity-check-settings-differ", 6);
  await p.fill(".tlp-card textarea", "ami tomay bhalobashi\nek din\nuttor");
  await p.evaluate(() => (document.querySelector(".tlp-status").textContent = ""));
  await p.click("text=Run parity test");
  await done(p);
  await resultTop(p, "parity-result-diff", 6);
  await download(p, () => p.click("text=Download full report (JSON)"), "parity-report-diff.json");
  // open one row's logs
  const row = p.locator(".tlp-card >> nth=2").locator(".tlp-table tbody tr").first();
  await row.locator("summary").click().catch(() => {}); await p.waitForTimeout(300);
  await el(p, row, "parity-diff-logs", 6).catch(() => {});

  // put it back
  await q.bringToFront(); await q.click(".eset-reset[data-engine=js]"); await q.waitForTimeout(1500);
  await q.close();
  await p.bringToFront(); await p.click("text=Reload configuration"); await p.waitForTimeout(2500);

  // ── Build packages ───────────────────────────────────────────────────────
  console.log("build");
  await el(p, ".tlp-modules", "parity-modules", 6);
  for (const id of ["js-forward", "php-forward", "js-reverse", "php-reverse"]) {
    const mod = p.locator(`.tlp-module[data-module=${id}]`);
    const f = await download(p, () => mod.locator("button", { hasText: "Build & download" }).click(), null);
    console.log("   ", id, "→", L.path.basename(f));
    await p.waitForFunction((id) => /Self-test|Not self-tested/.test(document.querySelector(`.tlp-module[data-module=${id}]`).textContent), id, { timeout: 120000 });
    await p.waitForTimeout(600);
    if (id === "js-forward") await el(p, mod, `parity-built-${id}`, 6);
  }
  await p.goto(PAR); await p.waitForSelector(".tlp-module"); await p.waitForTimeout(1500);
  await el(p, ".tlp-modules", "parity-modules-built", 6);
  await p.context().close();
  await b.close();
})();
