// Prints hotspot rectangles (percent of the cropped picture) for the order page and the app home screen.
const L = require("./lib");
const pct = (r, F) => ({ x: +((r.left - F.left) / F.width * 100).toFixed(2), y: +((r.top - F.top) / F.height * 100).toFixed(2), w: +(r.width / F.width * 100).toFixed(2), h: +(r.height / F.height * 100).toFixed(2) });
(async () => {
  const b = await L.chromium.launch();
  const p = await L.desktop(b, { user: "admin", pass: "admin123" });
  await p.goto(L.SITE + "/wp-admin/admin.php?page=ao-orders&order=1"); await L.wait(p);
  await L.hideBar(p);
  console.log("order", JSON.stringify(await p.evaluate((src) => { const pct = eval(src); const wrap = document.querySelector("#wpbody-content .wrap").getBoundingClientRect();
    const F = { left: wrap.left - 6, top: wrap.top - 6, width: wrap.width + 12, height: wrap.height + 12 };
    const out = {}; const panel = (t) => [...document.querySelectorAll(".ao-panel")].find(x => x.querySelector("h2,h3")?.textContent.trim() === t);
    out.status = pct(document.querySelector("#wpbody-content h1").getBoundingClientRect(), F);
    for (const [k, t] of [["items", "Items"], ["history", "History"], ["customer", "Customer"], ["payment", "Payment"], ["shipping", "Shipping"], ["money", "Website ↔ artisan"]]) out[k] = pct(panel(t).getBoundingClientRect(), F);
    return out; }, pct.toString())));
  const q = await L.phone(b);
  await q.goto(L.SITE + "/craft-app/"); await L.wait(q, 2500);
  console.log("app", JSON.stringify(await q.evaluate((src) => { const pct = eval(src); const F = { left: 0, top: 0, width: innerWidth, height: innerHeight };
    const g = (s) => { const e = document.querySelector(s); return e ? pct(e.getBoundingClientRect(), F) : null; };
    const nav = [...document.querySelectorAll("nav a, .tabbar a, .bottom-nav a")].map(a => [a.textContent.trim(), pct(a.getBoundingClientRect(), F)]);
    return { header: g("header"), account: g("header a, header button"), hero: g("h1"), search: g("form.search"), chips: g(".chips, .chip-row"), card: g(".pair, .pcard"), nav }; }, pct.toString())));
  await b.close();
})();
