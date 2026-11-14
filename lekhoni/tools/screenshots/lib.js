const { chromium } = require("playwright");
const path = require("path");
const { build } = require("./sample");
const sharp = require("sharp");
const fs = require("fs");
// Screenshots go straight into the manual's img folder.
const OUT = process.env.OUT || path.join(__dirname, "..", "..", "img");
// Where Lekhoni is running, e.g. `npx http-server path/to/lekhoni -p 8765`.
const APP = process.env.LEKHONI_URL || "http://localhost:8765/index.html";
fs.mkdirSync(OUT, { recursive: true });

async function open(browser, opts = {}) {
  const doc = opts.blank ? null : await build();
  const ctx = await browser.newContext({ viewport: { width: opts.w || 1440, height: opts.h || 900 }, deviceScaleFactor: 2, acceptDownloads: true });
  if (doc) await ctx.addInitScript((d) => localStorage.setItem("bn-dtp-doc-v1", JSON.stringify({ t: Date.now() + 1e9, doc: d })), doc);
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(APP);
  await p.waitForSelector(".page");
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
  return p;
}
/** Save a screenshot as WebP. */
async function shot(p, name, opts = {}) {
  const buf = await p.screenshot(opts);
  await sharp(buf).webp({ quality: 86 }).toFile(`${OUT}/${name}.webp`);
  return buf;
}
async function el(p, selector, name, pad = 0) {
  const b = await p.locator(selector).first().boundingBox();
  return shot(p, name, { clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 } });
}
async function zoom(p, v) { await p.selectOption("#zoom-select", String(v)); await p.waitForTimeout(400); }
async function boxRect(p, id) {
  return p.evaluate((id) => { const r = document.querySelector(`.box[data-box-id="${id}"]`).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, id);
}
async function selectBox(p, id) {
  // Select without entering text editing: shift-click toggles selection; use the move tab after a first click.
  const r = await boxRect(p, id);
  await p.mouse.click(r.x + r.w / 2, r.y + Math.min(r.h / 2, 12));
  await p.waitForTimeout(250);
}
module.exports = { chromium, open, shot, el, zoom, boxRect, selectBox, OUT };
