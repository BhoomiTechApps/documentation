// Phase 7: Rupa (the website ships for her) confirms her payout in the app; final admin screens;
// the customer's view of Hemanta's order with his photos.
const L = require("./lib");
const { el, shot, wait, SITE } = L;
const APP = SITE + "/craft-app/";
const ADMIN = SITE + "/wp-admin/";
const pins = JSON.parse(L.fs.readFileSync(L.path.join(__dirname, "pins.json")));

async function go(q, hash, ms = 1500) { await q.goto(APP + hash); await wait(q, ms); await q.evaluate(() => window.scrollTo(0, 0)); await wait(q, 200); }

(async () => {
  const b = await L.chromium.launch();

  console.log("Rupa");
  const q = await L.phone(b);
  await go(q, "#/ap");
  await q.fill("[name=phone]", pins.rupa.phone); await q.fill("[name=pin]", pins.rupa.pin);
  await q.click("button:has-text('Sign in')"); await wait(q, 2000);
  await q.evaluate(() => window.scrollTo(0, 0)); await shot(q, "ap-website-artisan");
  await go(q, "#/ap/money"); await shot(q, "ap-payout-confirm");
  await q.locator("#view button", { hasText: /^Received$|Yes|Received/ }).first().click(); await wait(q, 1500);
  await q.evaluate(() => window.scrollTo(0, 0)); await shot(q, "ap-payout-confirmed");
  await q.context().close();

  console.log("customer view of HK-4");
  const key = L.fs.readFileSync(L.path.join(__dirname, "hk4.key"), "utf8").trim();
  const c = await L.phone(b);
  await go(c, `#/order/HK-4/${key}`, 2200);
  await c.locator("#view h3:has-text('Updates'), #view h2:has-text('Updates'), #view :text('Updates')").first().evaluate((e) => e.scrollIntoView({ block: "start" })).catch(() => {});
  await c.evaluate(() => window.scrollBy(0, -70)); await wait(c, 400);
  await shot(c, "app-order-photos");
  await c.context().close();

  console.log("admin");
  const p = await L.desktop(b, { user: "admin", pass: "admin123" });
  await p.addInitScript(() => document.addEventListener("DOMContentLoaded", () => { const s = document.createElement("style"); s.textContent = "img.avatar{visibility:hidden}"; document.head.appendChild(s); }));
  await p.goto(ADMIN + "admin.php?page=artisan-outlet"); await wait(p);
  await el(p, "#wpbody-content .wrap", "dashboard-later", 6);
  await p.goto(ADMIN + "admin.php?page=ao-settlements&artisan=" + (await L.artisanIds(p)).rupa); await wait(p);
  await el(p, "#wpbody-content .wrap", "settlements-settled", 6);
  await p.goto(ADMIN + "admin.php?page=ao-sales"); await wait(p);
  await el(p, "#wpbody-content .wrap", "sales-report", 6);
  await p.goto(ADMIN + "edit.php?post_type=ao_artisan"); await wait(p);
  await el(p, "#wpbody-content .wrap", "artisans-list-later", 6);
  await b.close();
})();
