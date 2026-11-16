// Phase 6: settling up. The store confirms Hemanta's commission and pays Rupa her share of HK-1.
const L = require("./lib");
const { el, wait, SITE } = L;
const ADMIN = SITE + "/wp-admin/";

(async () => {
  const b = await L.chromium.launch();
  const p = await L.desktop(b, { user: "admin", pass: "admin123" });
  await p.goto(ADMIN + "admin.php?page=ao-settlements"); await wait(p);
  await el(p, "#wpbody-content .wrap", "settlements", 6);
  await p.click("#wpbody-content button:has-text('Received — confirm')"); await wait(p, 1300);
  await el(p, "#wpbody-content .wrap", "settlements-confirmed", 6);

  // Rupa: payout for HK-1
  await p.goto(ADMIN + "admin.php?page=ao-settlements&artisan=" + (await L.artisanIds(p)).rupa); await wait(p);
  const box = p.locator("#wpbody-content input[name='orders[]']").first();
  if (!(await box.isChecked())) await box.check();
  await p.fill("#wpbody-content [name=reference]", "734567890124");
  await el(p, "#wpbody-content .wrap", "settle-up", 6);
  await p.click("#wpbody-content button:has-text('Record payout sent')"); await wait(p, 1300);
  await el(p, "#wpbody-content .wrap", "settle-up-recorded", 6);
  await b.close();
})();
