// Phase 9 (core 2.7.0, Mobile 2.5.0): artisan contact and social links.
// Retakes the artisan screens (the details box now has seven tabs), sets Rupa's and Hemanta's links
// through the Contact & social tab, and shows the icons on cards and artisan pages, website and app.
const L = require("./lib");
const { el, shot, wait, SITE } = L;
const ADMIN = SITE + "/wp-admin/";
const AB = "#ao_artisan_details";
const LINKS = {
  rupa: [["whatsapp", "98000 00101"], ["instagram", "@rupa.weaves"], ["website", "https://example.org/rupa-kalita"]],
  hemanta: [["phone", "+91 98000 00202"], ["youtube", "@asharikandiclay"], ["", ""]],
};
const hideByline = (p) => p.evaluate(() => { const t = [...document.querySelectorAll("p, div")].find((e) => /^Written by/.test(e.textContent.trim()) && e.textContent.length < 80); if (t) (t.closest(".wp-block-group") || t).style.display = "none"; });

async function tab(p, name) { await p.locator(`${AB} [role=tab]`, { hasText: name }).first().click(); await p.mouse.move(2, 2); await wait(p, 400); }
async function setLinks(p, rows) {
  await tab(p, "Contact & social");
  for (let i = 0; i < 3; i++) { await p.selectOption(`[name='ao_links[${i}][type]']`, rows[i][0]); await p.fill(`[name='ao_links[${i}][value]']`, rows[i][1]); }
}

(async () => {
  const b = await L.chromium.launch();
  const p = await L.desktop(b, { user: "admin", pass: "admin123" });
  const ART = await L.artisanIds(p);

  console.log("artisan screens");
  await p.goto(ADMIN + `post.php?post=${ART.rupa}&action=edit`); await wait(p, 1200);
  await setLinks(p, LINKS.rupa);
  await el(p, AB, "artisan-tab-contact", 4);
  await p.click("#publish"); await wait(p, 1500);
  await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 200);
  await shot(p, "artisan-edit");
  for (const [t, n] of [["Profile", "artisan-tab-profile"], ["Heritage", "artisan-tab-heritage"], ["Photos & video", "artisan-tab-photos"], ["Selling & payment", "artisan-tab-selling-website"], ["Private notes", "artisan-tab-notes"]]) {
    await tab(p, t); await el(p, AB, n, 4);
  }
  await p.goto(ADMIN + `post.php?post=${ART.hemanta}&action=edit`); await wait(p, 1200);
  await setLinks(p, LINKS.hemanta);
  await p.click("#publish"); await wait(p, 1500);
  await tab(p, "Selling & payment"); await el(p, AB, "artisan-tab-selling-artisan", 4);
  // App login and the one-time PIN, on an artisan without a login yet
  await p.goto(ADMIN + `post.php?post=${ART.dipali}&action=edit`); await wait(p, 1200);
  await tab(p, "App login"); await el(p, AB, "artisan-tab-login", 4);
  await p.check("[name='ao_login[create]']"); await p.fill("[name='ao_login[phone]']", "9800000303");
  await p.click("#publish"); await wait(p, 1500);
  await tab(p, "App login"); await el(p, AB, "artisan-login-pin", 4);

  console.log("settings");
  await p.setViewportSize({ width: 1000, height: 820 });
  await p.goto(ADMIN + "admin.php?page=ao-settings&tab=display"); await wait(p, 900);
  await el(p, "#wpbody-content .wrap", "settings-display", 6);

  console.log("website");
  const w = await L.desktop(b);
  await w.goto(SITE + "/shop/?ao_type=handloom"); await wait(w, 1200);
  await el(w, w.locator(".ao-card-paired", { hasText: "Eri silk stole" }).first(), "card-contacts", 8);
  await w.goto(SITE + "/artisan/rupa-kalita/"); await wait(w, 1200); await hideByline(w);
  await L.area(w, [".wp-block-post-title", ".ao-artisan-page .ao-hero"], "artisan-page-top", 14);

  console.log("app");
  const q = await L.phone(b);
  await q.goto(SITE + "/craft-app/#/crafts?type=handloom"); await wait(q, 2200);
  await el(q, q.locator(".pair").first(), "app-card-contacts", 6);
  await q.goto(SITE + `/craft-app/#/artisan/${ART.rupa}`); await wait(q, 2200);
  await q.locator(".contacts-page").first().evaluate((e) => e.scrollIntoView({ block: "center" })); await wait(q, 300);
  await shot(q, "app-artisan-contacts");
  await b.close();
})();
