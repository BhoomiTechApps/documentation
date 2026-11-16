// Phase 5: Hemanta (the artisan ships) works order HK-4 in the artisan section of the app,
// with packing and courier-docket photos switched on, then pays the store its commission.
const L = require("./lib");
const { shot, wait, SITE } = L;
const APP = SITE + "/craft-app/";
const pins = JSON.parse(L.fs.readFileSync(L.path.join(__dirname, "pins.json")));
const IMG = process.env.PHOTOS || require("path").join(__dirname, "..", "sample-shop", "images");

async function go(q, hash, ms = 1500) { await q.goto(APP + hash); await wait(q, ms); await q.evaluate(() => window.scrollTo(0, 0)); await wait(q, 200); }
async function scrollTo(q, sel) { await q.locator(sel).first().evaluate((e) => e.scrollIntoView({ block: "start" })); await q.evaluate(() => window.scrollBy(0, -70)); await wait(q, 400); }
async function tap(q, label) { await q.locator("#view button", { hasText: label }).first().click(); await wait(q, 1500); }

(async () => {
  const b = await L.chromium.launch();
  const q = await L.phone(b);

  console.log("sign in");
  await go(q, "#/account"); await shot(q, "ap-account-entry");
  await go(q, "#/ap");
  await q.fill("[name=phone]", pins.hemanta.phone); await q.fill("[name=pin]", pins.hemanta.pin);
  await shot(q, "ap-signin");
  await q.click("button:has-text('Sign in')"); await wait(q, 2000);
  await q.evaluate(() => window.scrollTo(0, 0)); await shot(q, "ap-todo");

  console.log("HK-4");
  await go(q, "#/ap/order/4"); await shot(q, "ap-check-payment");
  await tap(q, "Yes, money received");
  await q.evaluate(() => window.scrollTo(0, 0)); await shot(q, "ap-pack-ship");
  // pack, with a photo
  await q.locator("#view input[type=file]").first().setInputFiles(IMG + "/parcel.jpg"); await wait(q, 1200);
  await scrollTo(q, "#view h3, #view h2"); await shot(q, "ap-pack-photo");
  await tap(q, "Mark packed");
  // ship, with the courier receipt
  await q.selectOption("#view [name=courier]", "India Post");
  await q.fill("#view [name=tracking_no]", "EK123456789IN");
  await q.locator("#view input[type=file]").last().setInputFiles(IMG + "/docket.jpg"); await wait(q, 1200);
  await scrollTo(q, "#view [name=courier]"); await q.evaluate(() => window.scrollBy(0, -160)); await wait(q, 300);
  await shot(q, "ap-ship");
  await tap(q, "Mark shipped");
  await q.evaluate(() => window.scrollTo(0, 0)); await shot(q, "ap-on-the-way");
  await q.fill("#view [name=location]", "Reached Kochi sorting office"); await tap(q, "Add update");
  await tap(q, "Out for delivery");
  await tap(q, "Delivered");
  await scrollTo(q, "#view h3:has-text('History'), #view h2:has-text('History')"); await shot(q, "ap-history");

  console.log("lists and money");
  await go(q, "#/ap/done"); await shot(q, "ap-done");
  await go(q, "#/ap/money"); await shot(q, "ap-money");
  await q.locator("#view input[name=o]").first().check().catch(() => {});
  await q.fill("#view [name=ref]", "634567890123");
  await scrollTo(q, "#view [name=ref]"); await q.evaluate(() => window.scrollBy(0, -260)); await wait(q, 300);
  await shot(q, "ap-pay-commission");
  await tap(q, "I have paid");
  await q.evaluate(() => window.scrollTo(0, 0)); await shot(q, "ap-commission-sent");
  await b.close();
})();
