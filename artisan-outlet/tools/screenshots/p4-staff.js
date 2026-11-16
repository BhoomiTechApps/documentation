// Phase 4: store staff work the orders from phases 2–3.
//   HK-1 confirm payment → packed → shipped (India Post) → delivered
//   HK-3 payment not received → the customer is asked to check
//   HK-4 the artisan's own order, as staff see it
const L = require("./lib");
const { el, area, shot, wait, SITE } = L;
const ADMIN = SITE + "/wp-admin/";
const orders = JSON.parse(L.fs.readFileSync(L.path.join(__dirname, "orders.json")));

const ord = (n) => ADMIN + "admin.php?page=ao-orders&order=" + n;
const panel = (p, title) => p.locator("#wpbody-content .ao-panel", { has: p.locator(`h2:text-is("${title}"), h3:text-is("${title}")`) }).first();
async function act(p, label) { await p.click(`#wpbody-content button:has-text("${label}")`); await wait(p, 1300); }

(async () => {
  const b = await L.chromium.launch();
  const p = await L.desktop(b, { user: "admin", pass: "admin123" });
  await p.addInitScript(() => document.addEventListener("DOMContentLoaded", () => { const s = document.createElement("style"); s.textContent = "img.avatar{visibility:hidden}"; document.head.appendChild(s); }));

  console.log("dashboard & list");
  await p.goto(ADMIN + "admin.php?page=artisan-outlet"); await wait(p);
  await el(p, "#wpbody-content .wrap", "dashboard", 6);
  await p.goto(ADMIN + "admin.php?page=ao-orders"); await wait(p);
  await el(p, "#wpbody-content .wrap", "orders-list", 6);
  await p.goto(ADMIN + "admin.php?page=ao-orders&status=verifying"); await wait(p);

  console.log("HK-1");
  await p.goto(ord(1)); await wait(p);
  await el(p, "#wpbody-content .wrap", "order-verify", 6);
  await el(p, panel(p, "Payment"), "order-panel-payment", 8);
  await el(p, panel(p, "Website ↔ artisan"), "order-panel-money", 8);
  await act(p, "Money received — confirm payment");
  await el(p, "#wpbody-content .wrap", "order-confirmed", 6);
  // packed, then shipped with courier and tracking number
  await p.selectOption("#wpbody-content [name=status]", "packed"); await act(p, "Update");
  await p.selectOption("#wpbody-content [name=status]", "shipped");
  await p.selectOption("#wpbody-content [name=courier]", "India Post");
  await p.fill("#wpbody-content [name=tracking_no]", "EK987654321IN");
  await p.fill("#wpbody-content form:has([name=tracking_no]) [name=note]", "Packed in a cloth bag inside a box.");
  await el(p, panel(p, "Shipping"), "order-panel-shipping", 8);
  await act(p, "Update");
  // the customer's view once shipped
  const c = await L.desktop(b); await c.goto(orders.hk1); await wait(c, 1500);
  await el(c, ".ao-outlet", "customer-shipped", 6); await c.context().close();
  // in transit, then delivered
  await p.selectOption("#wpbody-content [name=status]", "in_transit"); await p.fill("#wpbody-content [name=location]", "Guwahati sorting hub"); await act(p, "Update");
  await p.selectOption("#wpbody-content [name=status]", "delivered"); await act(p, "Update");
  // a note
  await p.fill("#wpbody-content form:has([name=public]) [name=note]", "Customer asked for the gamosa to be gift-wrapped.");
  await act(p, "Add note");
  await el(p, "#wpbody-content .wrap", "order-delivered", 6);
  await el(p, panel(p, "History"), "order-panel-history", 8);

  console.log("HK-3");
  await p.goto(ord(3)); await wait(p);
  await p.fill("#wpbody-content form:has(button:has-text('Not received')) [name=note]", "Not found in our account. Please check the UTR.");
  await p.locator("#wpbody-content form:has(button:has-text('Not received')) [name=note]").evaluate((e) => { e.blur(); e.setSelectionRange(0, 0); e.scrollLeft = 0; });
  await el(p, panel(p, "Payment"), "order-panel-not-received", 8);
  await act(p, "Not received — ask customer to check");
  const c3 = await L.desktop(b); await c3.goto(orders.hk3); await wait(c3, 1500);
  await el(c3, ".ao-outlet", "customer-not-received", 6); await c3.context().close();

  console.log("HK-4 (artisan ships)");
  await p.goto(ord(4)); await wait(p);
  await el(p, "#wpbody-content .wrap", "order-artisan-ships", 6);
  await el(p, panel(p, "Payment"), "order-panel-artisan-payment", 8);

  await p.goto(ADMIN + "admin.php?page=ao-orders"); await wait(p);
  await el(p, "#wpbody-content .wrap", "orders-list-later", 6);
  await b.close();
})();
