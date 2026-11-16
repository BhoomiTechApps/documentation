// Phase 2: the website as a shopper sees it, and three website orders:
//   HK-1  Ananya, Rupa's Eri stole + gamosa, UPI to the store (staff confirm it in phase 4)
//   HK-2  Meera, Dipali's japi, cash on delivery
//   HK-3  Arjun, Rupa's phanek wrap, UPI (staff mark it "not received" in phase 4)
const L = require("./lib");
const { el, area, shot, wait, SITE } = L;
const SHOP = SITE + "/shop/";

// Crop the top `h` pixels of an element.
async function top(p, sel, name, h, pad = 6) {
  await L.hideBar(p);
  const loc = p.locator(sel).first(); await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox(); const sy = await p.evaluate(() => scrollY);
  await shot(p, name, { fullPage: true, clip: { x: b.x - pad, y: b.y + sy - pad, width: b.width + 2 * pad, height: Math.min(h, b.height) + 2 * pad } });
}
const card = (p, name) => p.locator(".ao-outlet .ao-card", { hasText: name }).first();
async function add(p, name) { await card(p, name).locator("button", { hasText: "Add to cart" }).click(); await wait(p, 700); }
async function cartTab(p) { await p.locator(".ao-outlet [role=tab], .ao-outlet a, .ao-outlet button").filter({ hasText: /^Cart/ }).first().click(); await wait(p, 900); }
async function checkout(p, f, method) {
  await p.click(".ao-outlet button:has-text('Checkout')"); await wait(p, 900);
  for (const [k, v] of Object.entries(f)) if (k !== "state") await p.fill(`.ao-outlet [name=${k}]`, v);
  await p.selectOption(".ao-outlet [name=state]", f.state);
  await p.check(`.ao-outlet [name=method][value=${method}]`);
}
async function place(p) { await p.click(".ao-outlet button:has-text('Place order')"); await wait(p, 2200); }

(async () => {
  const b = await L.chromium.launch();
  let p = await L.desktop(b);

  // ── Browsing ──
  console.log("browse");
  await p.goto(SHOP); await wait(p, 1500);
  await top(p, ".ao-outlet", "shop-crafts", 1060);
  await p.locator(".ao-outlet .ao-chip, .ao-outlet a, .ao-outlet button").filter({ hasText: /^Handloom$/ }).first().click(); await wait(p, 1200);
  await top(p, ".ao-outlet", "shop-filter", 760);
  await p.locator(".ao-outlet [role=tab], .ao-outlet a, .ao-outlet button").filter({ hasText: /^Artisans$/ }).first().click(); await wait(p, 1200);
  await top(p, ".ao-outlet", "shop-artisans", 900);

  // craft page
  await p.goto(SITE + "/craft/muga-silk-mekhela-chador/"); await wait(p, 1200);
  await p.evaluate(() => { const t = [...document.querySelectorAll("p, div")].find(e => /^Written by/.test(e.textContent.trim()) && e.textContent.length < 80); if (t) (t.closest(".wp-block-group") || t).style.display = "none"; });
  await area(p, [".wp-block-post-title", ".ao-craft-page .ao-hero"], "craft-page-top", 14);
  for (const [t, n] of [["making", "craft-page-making"], ["care", "craft-page-care"], ["artisan", "craft-page-artisan"]]) {
    await p.click(`.ao-craft-page [role=tab][aria-controls*='-${t}']`); await wait(p, 500);
    await area(p, [".ao-craft-page .ao-tablist", `.ao-craft-page [data-panel=${t}]`], n, 10);
  }
  await el(p, ".ao-more-by", "craft-page-more", 10);
  // artisan page
  await p.goto(SITE + "/artisan/rupa-kalita/"); await wait(p, 1200);
  await p.evaluate(() => { const t = [...document.querySelectorAll("p, div")].find(e => /^Written by/.test(e.textContent.trim()) && e.textContent.length < 80); if (t) (t.closest(".wp-block-group") || t).style.display = "none"; });
  await area(p, [".wp-block-post-title", ".ao-artisan-page .ao-hero"], "artisan-page-top", 14);
  for (const [t, n] of [["crafts", "artisan-page-crafts"], ["story", "artisan-page-story"], ["tradition", "artisan-page-tradition"], ["workshop", "artisan-page-workshop"]]) {
    await p.click(`.ao-artisan-page [role=tab][aria-controls*='-${t}']`); await wait(p, 500);
    await area(p, [".ao-artisan-page .ao-tablist", `.ao-artisan-page [data-panel=${t}]`], n, 10);
  }

  // ── HK-1: UPI to the store ──
  console.log("order HK-1 (UPI)");
  await p.goto(SHOP); await wait(p, 1200);
  await add(p, "Eri silk stole"); await add(p, "Gamosa with red border");
  await el(p, ".ao-outlet .ao-card:has-text('Gamosa with red border')", "card-added", 8);
  // floating cart button on another page
  await p.goto(SITE + "/artisan/dipali-das/"); await wait(p, 1000);
  const fab = p.locator("#ao-cart-fab");
  if (await fab.isVisible()) { const bb = await fab.boundingBox(); await shot(p, "cart-fab", { clip: { x: bb.x - 60, y: bb.y - 40, width: bb.width + 80, height: bb.height + 60 } }); }
  await p.goto(SHOP); await wait(p, 1000);
  await cartTab(p);
  await el(p, ".ao-outlet", "cart", 6);
  await checkout(p, { name: "Ananya Sharma", phone: "9876543210", email: "ananya@example.com", address_1: "12 Lake View Road", address_2: "Near the post office", city: "Shillong", district: "East Khasi Hills", state: "Meghalaya", pincode: "793001" }, "upi");
  await el(p, ".ao-outlet", "checkout", 6);
  await place(p);
  await el(p, ".ao-outlet", "pay-upi-desktop", 6);
  await p.fill(".ao-outlet [name=ref]", "412345678901"); await p.click(".ao-outlet button:has-text('Submit')"); await wait(p, 1600);
  await el(p, ".ao-outlet", "pay-reference-sent", 6);
  const hk1 = p.url();

  // ── HK-2: cash on delivery ──
  console.log("order HK-2 (COD)");
  await p.context().close(); p = await L.desktop(b);
  await p.goto(SHOP); await wait(p, 1200);
  await add(p, "Japi (bamboo sun hat)");
  await cartTab(p);
  await checkout(p, { name: "Meera Iyer", phone: "9845012345", email: "", address_1: "7 Temple Street", address_2: "", city: "Mysuru", district: "Mysuru", state: "Karnataka", pincode: "570001" }, "cod");
  await el(p, ".ao-outlet form, .ao-outlet", "checkout-cod", 6);
  await place(p);
  await el(p, ".ao-outlet", "order-cod", 6);

  // ── HK-3: UPI, reference that the store will not find ──
  console.log("order HK-3 (UPI, not received later)");
  await p.context().close(); p = await L.desktop(b);
  await p.goto(SHOP); await wait(p, 1200);
  await add(p, "Phanek wrap");
  await cartTab(p);
  await checkout(p, { name: "Arjun Bora", phone: "9864098640", email: "arjun@example.com", address_1: "21 Zoo Road", address_2: "", city: "Guwahati", district: "Kamrup Metro", state: "Assam", pincode: "781024" }, "upi");
  await place(p);
  await p.fill(".ao-outlet [name=ref]", "512398765432"); await p.click(".ao-outlet button:has-text('Submit')"); await wait(p, 1500);
  L.fs.writeFileSync(L.path.join(__dirname, "orders.json"), JSON.stringify({ hk1, hk3: p.url() }, null, 1));

  // ── Track order ──
  console.log("track");
  await p.context().close(); p = await L.desktop(b);
  await p.goto(SITE + "/track-order/"); await wait(p, 1200);
  const tr = p.locator(".entry-content, main").first();
  await p.fill("[name=order]", "HK-1"); await p.fill("[name=contact]", "9876543210");
  await area(p, ["[name=order]", "[name=contact]", "button:has-text('Track order')"], "track-form", 24);
  await p.click("button:has-text('Track order')"); await wait(p, 1500);
  await el(p, ".ao-root, .aos-root, .ao-track, main .wp-block-post-content", "track-result", 6);

  // ── Card templates ──
  console.log("cards");
  await p.goto(SITE + "/card-templates/"); await wait(p, 1500);
  for (const s of ["paired", "simple", "overlay", "list", "story", "minimal"]) await el(p, `.ao-cards-${s}`, "cards-" + s, 8);

  // ── The app embedded in a page ──
  await p.goto(SITE + "/shop-app/"); await wait(p, 3000);
  await el(p, ".wp-block-post-content iframe, .entry-content iframe, iframe", "embedded-app", 6);
  await p.context().close();

  // ── Phone banner on the website ──
  const q = await L.phone(b);
  await q.goto(SHOP); await wait(q, 1500);
  const bn = await q.locator("#aom-banner").boundingBox();
  await shot(q, "phone-banner", { clip: { x: 0, y: Math.max(0, bn.y - 360), width: 390, height: 844 - Math.max(0, bn.y - 360) } });
  await b.close();
})();
