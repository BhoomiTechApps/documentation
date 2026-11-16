// Phase 8 (core 2.6.2): set Settings → Store → Help link, retake the Store tab, and show the Help button.
const L = require("./lib");
const { el, area, wait, SITE } = L;
const DOC = process.env.HELP_URL || "https://bhoomitechapps.github.io/documentation/artisan-outlet/";

(async () => {
  const b = await L.chromium.launch();
  const a = await L.desktop(b, { user: "admin", pass: "admin123", w: 1000, h: 820 });
  await a.goto(SITE + "/wp-admin/admin.php?page=ao-settings&tab=store"); await wait(a);
  await a.fill("#ao_help_url", DOC); await a.fill("#ao_help_label", "Help");
  await a.click("#wpbody-content [type=submit]"); await wait(a, 1200);
  await a.goto(SITE + "/wp-admin/admin.php?page=ao-settings&tab=store"); await wait(a);
  await el(a, "#wpbody-content .wrap", "settings-store", 6);

  const p = await L.desktop(b);
  await p.goto(SITE + "/shop/"); await wait(p, 1200);
  await area(p, [".ao-tabs"], "shop-help", 12);
  const q = await L.phone(b);
  await q.goto(SITE + "/shop/"); await wait(q, 1200);
  await area(q, [".ao-tabs"], "shop-help-phone", 10);
  await b.close();
})();
