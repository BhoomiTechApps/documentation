// Phase 1: the admin side of the catalogue, every settings tab, and artisan app logins (PINs saved to pins.json).
const L = require("./lib");
const { el, area, shot, wait, SITE } = L;
const ADMIN = SITE + "/wp-admin/";

async function tab(p, box, name) {
  await p.locator(`${box} [role=tab]`, { hasText: name }).first().click();
  await wait(p, 400);
}

(async () => {
  const b = await L.chromium.launch();
  const p = await L.desktop(b, { user: "admin", pass: "admin123" });
  await p.addInitScript(() => document.addEventListener("DOMContentLoaded", () => { const s = document.createElement("style"); s.textContent = "img.avatar{visibility:hidden}"; document.head.appendChild(s); }));

  const ART = await L.artisanIds(p);

  // ── Menu, crafts list ──
  console.log("catalogue");
  await p.goto(ADMIN + "edit.php?post_type=ao_craft"); await wait(p);
  await el(p, "#toplevel_page_artisan-outlet", "admin-menu", 0);
  await el(p, "#wpbody-content .wrap", "crafts-list", 6);

  // ── Craft edit ──
  const craftId = await p.locator("#the-list tr", { hasText: "Muga silk mekhela chador" }).first().getAttribute("id");
  await p.goto(ADMIN + `post.php?post=${craftId.replace("post-", "")}&action=edit`); await wait(p, 1200);
  await shot(p, "craft-edit");
  const CB = "#ao_craft_details";
  for (const [t, n] of [["Price & stock", "craft-tab-price"], ["Artisan", "craft-tab-artisan"], ["Making process", "craft-tab-making"], ["Care", "craft-tab-care"], ["More photos", "craft-tab-photos"]]) {
    await tab(p, CB, t); await el(p, CB, n, 4);
  }

  // ── Artisans list and edit ──
  await p.goto(ADMIN + "edit.php?post_type=ao_artisan"); await wait(p);
  await el(p, "#wpbody-content .wrap", "artisans-list", 6);
  await p.goto(ADMIN + `post.php?post=${ART.rupa}&action=edit`); await wait(p, 1200);
  await shot(p, "artisan-edit");
  const AB = "#ao_artisan_details";
  for (const [t, n] of [["Profile", "artisan-tab-profile"], ["Heritage", "artisan-tab-heritage"], ["Photos & video", "artisan-tab-photos"], ["Selling & payment", "artisan-tab-selling-website"], ["Private notes", "artisan-tab-notes"]]) {
    await tab(p, AB, t); await el(p, AB, n, 4);
  }
  // Hemanta: the artisan ships
  await p.goto(ADMIN + `post.php?post=${ART.hemanta}&action=edit`); await wait(p, 1200);
  await tab(p, AB, "Selling & payment"); await el(p, AB, "artisan-tab-selling-artisan", 4);

  // ── App logins ──
  console.log("logins");
  const pins = {};
  for (const [key, phone, snap] of [["hemanta", "9800000202", true], ["rupa", "9800000101", false]]) {
    await p.goto(ADMIN + `post.php?post=${ART[key]}&action=edit`); await wait(p, 1200);
    await tab(p, AB, "App login");
    if (snap) await el(p, AB, "artisan-tab-login", 4);
    await p.check("[name='ao_login[create]']"); await p.fill("[name='ao_login[phone]']", phone);
    await p.click("#publish"); await wait(p, 1500);
    await tab(p, AB, "App login");
    const t = await L.text(p, AB);
    pins[key] = { phone, pin: (t.match(/PIN:\s*(\d{8})/) || [])[1] };
    if (snap) await el(p, AB, "artisan-login-pin", 4);
  }
  L.fs.writeFileSync(L.path.join(__dirname, "pins.json"), JSON.stringify(pins, null, 1));
  console.log("   pins", JSON.stringify(pins));

  // ── Craft types ──
  await p.goto(ADMIN + "edit-tags.php?taxonomy=ao_craft_type&post_type=ao_craft"); await wait(p);
  await el(p, "#col-right", "craft-types", 6);

  // ── Settings (narrower window: the forms read better) ──
  console.log("settings");
  await p.setViewportSize({ width: 1000, height: 820 });
  for (const t of ["store", "payments", "shipping", "artisans", "display", "look", "app"]) {
    await p.goto(ADMIN + "admin.php?page=ao-settings&tab=" + t); await wait(p, 900);
    if (t === "artisans") {
      await p.check("[name='ao_settings[photo_packed]']"); await p.check("[name='ao_settings[photo_shipped]']");
      await p.click("#wpbody-content [type=submit]"); await wait(p, 1200);
    }
    await el(p, "#wpbody-content .wrap", "settings-" + t, 6);
  }
  // Colours & fonts is long: crop it in two parts at "Shape & type", plus the preview close-up
  await p.goto(ADMIN + "admin.php?page=ao-settings&tab=look"); await wait(p, 900);
  await L.fs.promises.unlink(L.path.join(L.OUT, "settings-look.webp")).catch(() => {});
  const wrap = p.locator("#wpbody-content .wrap").first();
  const split = p.locator("#wpbody-content h2", { hasText: "Shape & type" }).first();
  await L.hideBar(p);
  const sy = await p.evaluate(() => scrollY);
  const wb = await wrap.boundingBox(), hb = await split.boundingBox();
  await shot(p, "settings-look-colours", { fullPage: true, clip: { x: wb.x - 6, y: wb.y + sy - 6, width: wb.width + 12, height: hb.y - wb.y } });
  await shot(p, "settings-look-type", { fullPage: true, clip: { x: wb.x - 6, y: hb.y + sy - 10, width: wb.width + 12, height: wb.y + wb.height - hb.y + 16 } });
  const prev = p.locator("#wpbody-content [class*=preview]").first();
  if (await prev.count()) await el(p, prev, "settings-look-preview", 6);
  await b.close();
})();
