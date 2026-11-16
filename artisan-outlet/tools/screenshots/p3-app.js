// Phase 3: the phone app as a shopper sees it, and two app orders:
//   HK-4  Ravi, Hemanta's terracotta horse (the artisan ships; UPI paid to Hemanta directly)
//   HK-5  Kavya, Bikash's bell metal kahi, left unpaid
const L = require("./lib");
const { el, shot, wait, SITE } = L;
const APP = SITE + "/craft-app/";

async function go(q, hash, ms = 1500) { await q.goto(APP + hash); await wait(q, ms); await q.evaluate(() => window.scrollTo(0, 0)); await wait(q, 200); }
const screen = (q, name) => shot(q, name);
async function scrollTo(q, sel) { await q.locator(sel).first().evaluate((e) => e.scrollIntoView({ block: "start" })); await q.evaluate(() => window.scrollBy(0, -70)); await wait(q, 400); }

(async () => {
  const b = await L.chromium.launch();
  let q = await L.phone(b);

  console.log("browse");
  await go(q, "#/", 2500); await screen(q, "app-home");
  await go(q, "#/crafts"); await screen(q, "app-crafts");
  await go(q, "#/artisans"); await screen(q, "app-artisans");
  // a craft
  await go(q, "#/crafts");
  await q.locator(".pcard-link, .pair-link, a[href^='#/craft/']", { hasText: "Asharikandi terracotta horse" }).first().click(); await wait(q, 1500);
  await q.evaluate(() => window.scrollTo(0, 0)); await screen(q, "app-craft");
  await q.click("[role=tab][data-tab=process]"); await wait(q, 400);
  await scrollTo(q, ".tabs"); await screen(q, "app-craft-making");
  const craftHash = await q.evaluate(() => location.hash);
  // the artisan
  await q.click("a.byline"); await wait(q, 1500); await q.evaluate(() => window.scrollTo(0, 0));
  await screen(q, "app-artisan");

  // ── HK-4: artisan ships, paid to the artisan ──
  console.log("order HK-4");
  await go(q, craftHash);
  await q.locator("#view button", { hasText: "Add to cart" }).first().click(); await wait(q, 800);
  await go(q, "#/cart"); await screen(q, "app-cart");
  await q.click("button:has-text('Checkout')"); await wait(q, 1200);
  for (const [k, v] of Object.entries({ name: "Ravi Menon", phone: "9811122233", email: "ravi@example.com", address_1: "4B Palm Grove", city: "Kochi", pincode: "682001" })) await q.fill(`[name=${k}]`, v);
  await q.selectOption("[name=state]", "Kerala");
  await scrollTo(q, "[name=method]"); await screen(q, "app-checkout-payment");
  await q.click("button:has-text('Place order')"); await wait(q, 2500);
  // the order's private key is in the address (#/order/HK-4/<key>); phase 7 needs it
  L.fs.writeFileSync(L.path.join(__dirname, "hk4.key"), (await q.evaluate(() => location.hash)).split("/").pop());
  await q.evaluate(() => window.scrollTo(0, 0)); await screen(q, "app-pay");
  await q.fill("[name=ref]", "523456789012"); await q.click("button:has-text('Submit')"); await wait(q, 1500);
  await q.evaluate(() => window.scrollTo(0, 0)); await screen(q, "app-pay-sent");

  // ── HK-5: left unpaid ──
  console.log("order HK-5");
  await go(q, "#/crafts");
  await q.locator(".pcard, .pair, .lcard", { hasText: "Bell metal kahi" }).first().locator("button", { hasText: "Add to cart" }).click(); await wait(q, 800);
  // the one-artisan rule: the cart held Hemanta's horse before HK-4 was placed; now it is empty, so this just adds
  await go(q, "#/cart");
  await q.click("button:has-text('Checkout')"); await wait(q, 1200);
  for (const [k, v] of Object.entries({ name: "Kavya Nair", phone: "9895098950", address_1: "18 Beach Road", city: "Kozhikode", pincode: "673001" })) await q.fill(`[name=${k}]`, v);
  await q.selectOption("[name=state]", "Kerala");
  await q.click("button:has-text('Place order')"); await wait(q, 2500);
  await q.click("summary:has-text('Show QR code')"); await wait(q, 600);
  await scrollTo(q, "summary:has-text('Show QR code')"); await screen(q, "app-pay-qr");

  // orders on this device, account
  await go(q, "#/track"); await screen(q, "app-orders");
  await go(q, "#/account"); await screen(q, "app-account");
  await b.close();
})();
