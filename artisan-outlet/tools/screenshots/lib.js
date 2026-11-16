// Shared helpers for the Artisan Outlet manual screenshots.
const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SITE = process.env.WP_URL || "http://localhost:8781";
const OUT = process.env.OUT || path.join(__dirname, "..", "..", "img");
fs.mkdirSync(OUT, { recursive: true });

async function shot(p, name, opts = {}) {
  const buf = await p.screenshot(opts);
  await sharp(buf).webp({ quality: 86 }).toFile(`${OUT}/${name}.webp`);
  console.log("  •", name);
}
// Crops of tall elements are taken from a full-page capture, where WordPress's fixed admin bar would be
// drawn across the top; hide it for crops.
async function hideBar(p) {
  await p.evaluate(() => { if (document.getElementById("wpadminbar") && !document.getElementById("ao-hidebar")) { const s = document.createElement("style"); s.id = "ao-hidebar"; s.textContent = "#wpadminbar{display:none!important}html.wp-toolbar{padding-top:0!important}html{margin-top:0!important}"; document.head.appendChild(s); } });
}
async function el(p, sel, name, pad = 0) {
  await hideBar(p);
  const loc = typeof sel === "string" ? p.locator(sel).first() : sel;
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  const sx = await p.evaluate(() => scrollX), sy = await p.evaluate(() => scrollY);
  await shot(p, name, { fullPage: true, clip: { x: Math.max(0, b.x + sx - pad), y: Math.max(0, b.y + sy - pad), width: b.width + 2 * pad, height: b.height + 2 * pad } });
}
async function area(p, sels, name, pad = 8) {
  await hideBar(p);
  let x1 = 1e9, y1 = 1e9, x2 = 0, y2 = 0;
  const sx = await p.evaluate(() => scrollX), sy = await p.evaluate(() => scrollY);
  for (const s of sels) { const b = await (typeof s === "string" ? p.locator(s).first() : s).boundingBox(); x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height); }
  await shot(p, name, { fullPage: true, clip: { x: Math.max(0, x1 + sx - pad), y: Math.max(0, y1 + sy - pad), width: x2 - x1 + 2 * pad, height: y2 - y1 + 2 * pad } });
}
async function desktop(browser, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 1280, height: o.h || 860 }, deviceScaleFactor: 2, acceptDownloads: true, locale: "en-IN", timezoneId: "Asia/Kolkata" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log("PAGEERR", String(e)));
  p.on("dialog", (d) => d.accept());
  if (o.user) await login(p, o.user, o.pass);
  return p;
}
async function phone(browser, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "en-IN", timezoneId: "Asia/Kolkata",
    userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log("PAGEERR", String(e)));
  p.on("dialog", (d) => d.accept());
  return p;
}
async function login(p, user, pass) {
  await p.goto(SITE + "/wp-login.php");
  await p.fill("#user_login", user); await p.fill("#user_pass", pass);
  await p.click("#wp-submit"); await p.waitForLoadState();
}
const wait = (p, ms = 800) => p.waitForTimeout(ms);
// Post IDs of the sample artisans, looked up by name in Artisan Outlet → Artisans (needs a logged-in page).
async function artisanIds(p) {
  await p.goto(SITE + "/wp-admin/edit.php?post_type=ao_artisan&posts_per_page=100");
  const rows = await p.$$eval("#the-list tr", (trs) => trs.map((tr) => [tr.querySelector(".row-title")?.textContent.trim(), tr.id.replace("post-", "")]));
  const id = (name) => +(rows.find((r) => r[0] === name) || [])[1];
  return { rupa: id("Rupa Kalita"), hemanta: id("Hemanta Pal"), dipali: id("Dipali Das"), bikash: id("Bikash Deka") };
}
async function text(p, sel = "body") { return (await p.locator(sel).first().innerText()).replace(/\n{2,}/g, "\n").slice(0, 3000); }
module.exports = { artisanIds, chromium, sharp, fs, path, SITE, OUT, shot, el, area, hideBar, desktop, phone, login, wait, text };
