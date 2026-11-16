// Phase 10 (core 2.8.0, Mobile 2.6.0): search as you type, on the website and in the app.
const L = require("./lib");
const { wait, SITE } = L;

(async () => {
  const b = await L.chromium.launch();
  const p = await L.desktop(b);
  await p.goto(SITE + "/shop/"); await wait(p, 1200);
  const box = p.locator(".ao-outlet input[name=ao_q]").first();
  await box.click(); await box.pressSequentially("sualkuchi silk", { delay: 60 }); await wait(p, 1500);
  await p.mouse.move(2, 2);
  await L.hideBar(p);
  const loc = p.locator(".ao-outlet").first(); await loc.scrollIntoViewIfNeeded();
  const r = await loc.boundingBox(); const sy = await p.evaluate(() => scrollY);
  await L.shot(p, "shop-search", { fullPage: true, clip: { x: r.x - 6, y: r.y + sy - 6, width: r.width + 12, height: Math.min(560, r.height) + 12 } });
  const m = await L.phone(b);
  await m.goto(SITE + "/craft-app/#/"); await wait(m, 1500);
  const ai = m.locator("[data-search] input");
  await ai.click(); await ai.pressSequentially("bell metal", { delay: 60 }); await wait(m, 1600);
  await L.shot(m, "app-search");
  await b.close();
})();
