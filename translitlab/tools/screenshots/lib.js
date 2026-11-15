// Shared helpers for the TranslitLab manual screenshots.
const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SITE = process.env.WP_URL || "http://localhost:8780";
const LAB = process.env.LAB_URL || SITE + "/?page_id=4";              // page with [translitlab]
const LAB_LIGHT = process.env.LAB_LIGHT_URL || SITE + "/?page_id=7";  // page with [translitlab theme="light" height="820"]
const OUT = process.env.OUT || path.join(__dirname, "..", "..", "img");
const DL = process.env.DOWNLOADS || path.join(__dirname, "downloads");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(DL, { recursive: true });

async function shot(p, name, opts = {}) {
  const buf = await p.screenshot(opts);
  await sharp(buf).webp({ quality: 86 }).toFile(`${OUT}/${name}.webp`);
  console.log("  •", name);
}
async function el(p, sel, name, pad = 0) {
  const loc = typeof sel === "string" ? p.locator(sel).first() : sel;
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  const sy = await p.evaluate(() => scrollY), sx = await p.evaluate(() => scrollX);
  await shot(p, name, { fullPage: true, clip: { x: Math.max(0, b.x + sx - pad), y: Math.max(0, b.y + sy - pad), width: b.width + 2 * pad, height: b.height + 2 * pad } });
}
async function area(p, sels, name, pad = 8) {     // union of several elements
  let x1 = 1e9, y1 = 1e9, x2 = 0, y2 = 0;
  for (const s of sels) { const b = await p.locator(s).first().boundingBox(); x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height); }
  await shot(p, name, { clip: { x: Math.max(0, x1 - pad), y: Math.max(0, y1 - pad), width: x2 - x1 + 2 * pad, height: y2 - y1 + 2 * pad } });
}
async function context(browser, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 1440, height: o.h || 900 }, deviceScaleFactor: 2, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"] });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log("PAGEERR", String(e)));
  p.on("dialog", (d) => d.accept());
  if (o.user) {
    await p.goto(SITE + "/wp-login.php");
    await p.fill("#user_login", o.user); await p.fill("#user_pass", o.pass);
    await p.click("#wp-submit"); await p.waitForLoadState();
  }
  return p;
}
async function lab(p, url = LAB) {
  await p.goto(url);
  await p.waitForFunction(() => document.querySelector("#snippet-list .snip-item, #snippet-list > *") || document.querySelector(".tl-card-title"), null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(1200);
  // scroll so the frame top sits just under the admin bar
  await p.evaluate(() => { const f = document.querySelector(".tl-frame"); if (f) window.scrollTo(0, f.getBoundingClientRect().top + scrollY - 40); });
  await p.waitForTimeout(300);
}
async function tab(p, name) { await p.click(`.tab-btn[data-tab=${name}]`); await p.waitForTimeout(900); }
async function run(p, text, dir = "forward") {
  await tab(p, "test");
  await p.click(`.dir-btn[data-dir=${dir}]`);
  await p.fill("#input-text", text);
  await p.click("#btn-run");
  await p.waitForFunction(() => /ms/.test(document.getElementById("php-status").textContent), null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(700);
}
async function toastShot(p, name) {
  await p.waitForFunction(() => { const t = document.getElementById("toast"); return t && getComputedStyle(t).opacity > 0.9; }, null, { timeout: 8000 });
  await p.waitForTimeout(300);
  await el(p, "#toast", name, 10);
}
async function download(p, action, name) {
  const [d] = await Promise.all([p.waitForEvent("download"), action()]);
  const f = path.join(DL, name || d.suggestedFilename()); await d.saveAs(f); return f;
}
module.exports = { chromium, sharp, fs, path, SITE, LAB, LAB_LIGHT, OUT, DL, shot, el, area, context, lab, tab, run, toastShot, download };
