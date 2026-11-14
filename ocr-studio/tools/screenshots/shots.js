// Screenshots for the OCR Studio user manual, taken from the running app.
const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const APP = process.env.OCR_URL || "http://localhost:8770/index.html";
const OUT = process.env.OUT || path.join(__dirname, "..", "..", "img");
const SAMPLES = process.env.SAMPLES || path.join(__dirname, "samples");
const DL = process.env.DOWNLOADS || path.join(__dirname, "downloads");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(DL, { recursive: true });

const SOURCE = { title: "গ্রামবাংলার কথা", author: "সুধীর দাস", year: "1962", publisher: "Village library collection",
  edition: "1st edition", language: "ben", script: "Beng", rights: "permission", contributor: "Heritage volunteers", place: "Village library", notes: "Sample book for the manual" };

async function shot(p, name, opts = {}) {
  const buf = await p.screenshot(opts);
  await sharp(buf).webp({ quality: 86 }).toFile(`${OUT}/${name}.webp`);
}
async function el(p, sel, name, pad = 0) {
  const b = await p.locator(sel).first().boundingBox();
  await shot(p, name, { clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + 2 * pad, height: b.height + 2 * pad } });
}
async function open(browser, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 1440, height: o.h || 900 }, deviceScaleFactor: 2, acceptDownloads: true, permissions: ["microphone", "clipboard-read", "clipboard-write"] });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log("PAGEERR", String(e)));
  await p.goto(APP + (o.query || ""));
  await p.waitForTimeout(1200);
  return p;
}
async function load(p, file) { await p.setInputFiles("#fileInput", path.join(SAMPLES, file)); await p.waitForTimeout(1200); }
async function ocr(p) {
  await p.evaluate(() => (document.getElementById("textStatus").textContent = ""));
  await p.click("#startBtn");
  await p.waitForFunction(() => /confidence/.test(document.getElementById("textStatus").textContent), null, { timeout: 180000 });
  await p.waitForTimeout(400);
}
async function fillSource(p) {
  await p.click('button[title="Source details"]'); await p.waitForTimeout(300);
  for (const [k, v] of Object.entries(SOURCE)) {
    const f = p.locator(`#sourceForm [name="${k}"]`);
    if ((await f.evaluate((e) => e.tagName)) === "SELECT") await f.selectOption(v); else await f.fill(v);
  }
}
async function saveSource(p) { await p.click('#sourceForm button[value="save"]'); await p.waitForTimeout(500); }
async function download(p, action, name) {
  const [d] = await Promise.all([p.waitForEvent("download"), action()]);
  const f = path.join(DL, name || d.suggestedFilename()); await d.saveAs(f); return f;
}
async function toastShot(p, name) {
  await p.waitForFunction(() => { const t = document.getElementById("toast"); return t && t.classList.contains("show"); });
  await p.waitForTimeout(450);
  const b = await p.locator("#toast").boundingBox();
  await shot(p, name, { clip: { x: b.x - 10, y: b.y - 10, width: b.width + 20, height: b.height + 20 } });
}

(async () => {
  const b = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  let p;

  // ── 1. First open ──
  p = await open(b);
  await shot(p, "empty");
  await p.context().close();

  // ── 2. The main workflow on the clean page ──
  p = await open(b);
  await load(p, "gramer-katha.pdf");
  await shot(p, "loaded");
  await fillSource(p);
  await el(p, "#sourceDialog", "dlg-source");
  await saveSource(p);
  await p.waitForTimeout(2500);
  await ocr(p);
  await shot(p, "overview");
  // hotspots for the overview
  const spots = await p.evaluate(() => {
    const W = innerWidth, H = innerHeight;
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: +(b.x / W * 100).toFixed(2), y: +(b.y / H * 100).toFixed(2), w: +(b.width / W * 100).toFixed(2), h: +(b.height / H * 100).toFixed(2) }; };
    const g = [...document.querySelectorAll(".controls .control-group")];
    const span = (a, z) => { const A = a.getBoundingClientRect(), Z = z.getBoundingClientRect(); return { x: +(A.x / W * 100).toFixed(2), y: +(Math.min(A.y, Z.y) / H * 100).toFixed(2), w: +((Z.right - A.x) / W * 100).toFixed(2), h: +((Math.max(A.bottom, Z.bottom) - Math.min(A.y, Z.y)) / H * 100).toFixed(2) }; };
    return {
      language: r(g[0]), file: r(g[1]), progress: r(document.getElementById("ocrProgress").parentElement), collection: span(document.querySelector(".control-group--end button"), document.querySelector(".control-group--end button")),
      theme: r(document.querySelector(".os-seg")), offline: r(document.getElementById("offlineStatus")),
      zoom: r(document.querySelector(".zoom-controls")), pages: r(document.querySelector(".pagination-controls")), tools: r(document.querySelector(".image-tools")),
      canvas: r(document.getElementById("canvasWrapper")), actions: r(document.querySelector(".right-panel-actions")), source: r(document.getElementById("sourceSummary")),
      text: r(document.getElementById("output")), status: r(document.getElementById("textStatus")),
    };
  });
  fs.writeFileSync(OUT + "/overview-spots.json", JSON.stringify(spots));
  await el(p, ".controls", "controls");
  await el(p, "#normalToolbar", "left-toolbar");
  await el(p, ".right-panel .panel-header", "text-actions");
  await el(p, "#sourceSummary", "source-summary");
  await el(p, "#textStatus", "text-status", 6);
  await el(p, ".right-panel", "text-raw");
  // Proofread: fix the machine's mistakes
  let txt = await p.inputValue("#output");
  fs.writeFileSync(DL + "/raw-p1.txt", txt);
  const fixed = txt.replace("দুরের", "দূরের").replace(/শোনান\s*\|/, "শোনান।").replace(/\s+\|/g, "।");
  await p.fill("#output", fixed); await p.waitForTimeout(500);
  await el(p, ".right-panel", "text-corrected");
  await el(p, "#textStatus", "text-status-corrected", 6);
  // Line-count warning: join two lines
  await p.fill("#output", fixed.replace("আমাদের গ্রাম,\n", "আমাদের গ্রাম, ")); await p.waitForTimeout(500);
  await el(p, "#textStatus", "text-status-lines", 6);
  await p.fill("#output", fixed); await p.waitForTimeout(400);
  // Save dialog + every export of this page
  await p.click('button[title="Save / export"]'); await p.waitForTimeout(300);
  await el(p, "#saveDialog", "dlg-save");
  await download(p, () => p.click(".save-option >> nth=0"), "p1.txt");
  await p.click('button[title="Save / export"]'); await p.waitForTimeout(200);
  await download(p, () => p.click("#savePdfBtn"), "p1.pdf");
  await p.click('button[title="Save / export"]'); await p.waitForTimeout(200);
  await download(p, () => p.click(".save-option >> nth=2"), "p1-bundle.zip");
  await p.click('button[title="Save / export"]'); await p.waitForTimeout(200);
  await download(p, () => p.click("#saveLinesBtn"), "p1-training.zip");
  // Add to the collection
  await p.click('button[title="Add this page to the collection"]'); await p.waitForTimeout(200);
  await toastShot(p, "toast-added");
  // Copy menu (right-click in the text)
  const tb = await p.locator("#output").boundingBox();
  await p.mouse.click(tb.x + 200, tb.y + 80, { button: "right" }); await p.waitForTimeout(300);
  await shot(p, "context-menu", { clip: { x: tb.x + 140, y: tb.y + 40, width: 300, height: 150 } });
  await p.keyboard.press("Escape");

  // ── 3. Page 2: faded print on uneven paper ──
  await p.click("#nextPage"); await p.waitForTimeout(1200);
  const cv = async (name) => el(p, "#canvasWrapper", name);
  await cv("p2-before");
  await ocr(p);
  await el(p, "#textStatus", "text-status-cleanup", 6);
  const [win] = await Promise.all([p.context().waitForEvent("page"), p.click("#textStatus .link-btn")]);
  await win.waitForLoadState(); await win.waitForTimeout(500);
  const imgBuf = await win.evaluate(async () => { const r = await fetch(location.href); const b = new Uint8Array(await r.arrayBuffer()); let s = ""; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); });
  fs.writeFileSync(DL + "/cleaned-p2.png", Buffer.from(imgBuf, "base64")); await win.close();
  await p.click('button[title="Add this page to the collection"]'); await p.waitForFunction(() => /Added page/.test((document.getElementById("toast") || {}).textContent || ""), null, { timeout: 30000 }); await p.waitForTimeout(300);
  await p.click('button[title^="Greyscale and stretch"]'); await p.waitForTimeout(700); await cv("p2-enhance");
  await p.click('button[title="Undo all image corrections"]'); await p.waitForTimeout(900);
  await p.click('button[title^="Convert to black and white"]'); await p.waitForTimeout(700); await cv("p2-bw");
  await p.click('button[title="Undo all image corrections"]'); await p.waitForTimeout(900);

  // ── 3b. A crooked scan with clear print: Deskew ──
  await load(p, "page2-crooked.jpg");
  await cv("crooked-before");
  await p.click('button[title="Auto-correct skew"]'); await p.waitForTimeout(1600);
  await toastShot(p, "toast-deskew");
  await cv("crooked-after");

  // ── 4. The phone photo: perspective ──
  await load(p, "photo.jpg");
  await p.waitForTimeout(500);
  await cv("photo-before");
  await p.click('button[title="Correct perspective warp"]'); await p.waitForTimeout(500);
  const C = JSON.parse(fs.readFileSync(path.join(__dirname, "corners.json")));
  const toScreen = async ([x, y]) => p.evaluate(([x, y]) => { const c = document.getElementById("canvas"), r = c.getBoundingClientRect(); return [r.x + x * r.width / c.width, r.y + y * r.height / c.height]; }, [x, y]);
  const pad = Math.min(C.w, C.h) * 0.05;
  const starts = [[pad, pad], [C.w - pad, pad], [C.w - pad, C.h - pad], [pad, C.h - pad]];
  for (let i = 0; i < 4; i++) {
    const [sx, sy] = await toScreen(starts[i]); const [tx, ty] = await toScreen(C.pts[i]);
    await p.mouse.move(sx, sy); await p.mouse.down(); await p.mouse.move(tx, ty, { steps: 8 }); await p.mouse.up();
  }
  await p.waitForTimeout(300);
  await shot(p, "perspective-mode", { clip: await p.evaluate(() => { const r = document.querySelector(".left-panel").getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }) });
  await p.click("#perspectiveToolbar .primary-btn"); await p.waitForTimeout(800);
  await cv("photo-after");
  // Source for the photo: same book, page 37
  await p.click('button[title="Source details"]'); await p.waitForTimeout(300);
  for (const [k, v] of Object.entries(SOURCE)) { const f = p.locator(`#sourceForm [name="${k}"]`); if ((await f.evaluate((e) => e.tagName)) === "SELECT") await f.selectOption(v); else await f.fill(v); }
  await p.fill('#sourceForm [name="notes"]', "Page 37, photographed with a phone"); await saveSource(p);
  await ocr(p);
  await shot(p, "photo-result");
  await p.click('button[title="Add this page to the collection"]'); await p.waitForFunction(() => /Added page/.test((document.getElementById("toast") || {}).textContent || ""), null, { timeout: 30000 }); await p.waitForTimeout(300);

  // ── 5. Collection ──
  await p.setViewportSize({ width: 1440, height: 1300 }); await p.waitForTimeout(300);
  await p.click('.control-group--end .secondary-btn'); await p.waitForTimeout(500);
  await el(p, "#collectionDialog", "dlg-collection");
  await download(p, () => p.click("#exportCollectionBtn"), "collection.zip");
  await p.keyboard.press("Escape");

  // ── 6. Language models ──
  await p.click('button[title="Language models"]'); await p.waitForTimeout(300);
  await el(p, "#modelsDialog", "dlg-models"); await p.keyboard.press("Escape");

  // ── 7. Eastern Nagari typing ──
  await p.fill("#output", ""); await p.click("#keyboardBtn"); await p.waitForTimeout(600);
  await p.keyboard.type("ami bishnupriya manipuri ", { delay: 25 });
  await p.keyboard.type("lekh", { delay: 25 }); await p.waitForTimeout(300);
  await el(p, ".right-panel", "keyboard-on");
  await p.keyboard.type("a ", { delay: 25 });
  fs.writeFileSync(DL + "/typed.txt", await p.inputValue("#output"));
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);

  // ── 8. Recording (fake microphone) ──
  await p.click("#recordBtn"); await p.waitForTimeout(3200);
  await el(p, ".right-panel .panel-header", "recording");
  await p.click("#recordBtn"); await p.waitForTimeout(800);
  await el(p, ".right-panel", "recorded", 0);
  // Listen without an installed voice
  await p.click("#listenBtn"); await p.waitForTimeout(1500);
  const lt = await p.locator("#toast").textContent(); fs.writeFileSync(DL + "/listen-toast.txt", lt);
  await p.context().close();

  // ── 9. Dark theme and phone ──
  p = await open(b, { query: "?theme=dark" });
  await load(p, "gramer-katha.pdf"); await ocr(p);
  await shot(p, "dark");
  await p.context().close();
  p = await open(b, { w: 390, h: 844 });
  await load(p, "gramer-katha.pdf"); await ocr(p);
  await shot(p, "phone", { fullPage: false });
  await p.evaluate(() => document.querySelector(".right-panel").scrollIntoView()); await p.waitForTimeout(300);
  await shot(p, "phone-text");
  await p.context().close();

  // Faded page beside the cleaned copy the engine read.
  const H = 900;
  const left = await sharp(path.join(SAMPLES, "page2.jpg")).resize({ height: H }).toBuffer();
  const right = await sharp(path.join(DL, "cleaned-p2.png")).resize({ height: H }).toBuffer();
  const lw = (await sharp(left).metadata()).width, rw = (await sharp(right).metadata()).width;
  await sharp({ create: { width: lw + rw + 30, height: H, channels: 3, background: "#d8d5ce" } })
    .composite([{ input: left, left: 0, top: 0 }, { input: right, left: lw + 30, top: 0 }]).webp({ quality: 85 }).toFile(OUT + "/cleanup-compare.webp");

  console.log("done");
  await b.close();
})();
