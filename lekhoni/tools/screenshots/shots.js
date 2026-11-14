const L = require("./lib");
const fs = require("fs");
const log = (...a) => console.log(...a);

(async () => {
  const b = await L.chromium.launch();
  let p;

  // ── 1. Overview with hotspots ──
  p = await L.open(b);
  await L.zoom(p, 0.75);
  await L.shot(p, "overview");
  const spots = await p.evaluate(() => {
    const W = innerWidth, H = innerHeight;
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: +(b.x / W * 100).toFixed(2), y: +(b.y / H * 100).toFixed(2), w: +(b.width / W * 100).toFixed(2), h: +(b.height / H * 100).toFixed(2) }; };
    const groups = [...document.querySelectorAll(".toolbar .tool-group")];
    const byLabel = (t) => groups.find((g) => g.querySelector(".tg-label")?.textContent.trim().toLowerCase() === t);
    return {
      project: r(byLabel("project")), output: r(byLabel("output")), edit: r(byLabel("edit")), insert: r(byLabel("insert")),
      typing: r(byLabel("typing")), view: r(byLabel("view")),
      rail: r(document.getElementById("pages-rail")),
      ruler: r(document.querySelector(".pub-ruler-h") || document.querySelector(".page")),
      page: r(document.querySelector(".page")),
      panel: r(document.getElementById("props-panel")),
      status: r(document.getElementById("statusbar")),
    };
  });
  fs.writeFileSync(L.OUT + "/overview-spots.json", JSON.stringify(spots, null, 1));
  await L.el(p, "#toolbar", "toolbar");
  await L.el(p, "#statusbar", "statusbar");
  await L.shot(p, "rail", { clip: { x: 0, y: 68, width: 180, height: 480 } });
  for (const g of ["project", "output", "edit", "insert", "typing", "view"]) {
    const s = spots[g];
    await L.shot(p, "tb-" + g, { clip: { x: s.x * 14.4 - 2, y: 0, width: s.w * 14.4 + 4, height: 68 } });
  }
  await p.context().close();

  // ── 2. Panels (tall window so each panel shows in full) ──
  p = await L.open(b, { h: 2300 });
  await L.zoom(p, 1);
  const panel = async (name) => {
    await p.waitForTimeout(300);
    const c = await p.evaluate(() => {
      const panel = document.getElementById("props-panel").getBoundingClientRect();
      const pane = document.querySelector("#props-panel .ppane:not([hidden])");
      let bottom = 0;
      for (const n of pane.querySelectorAll("*")) if (n.offsetParent && getComputedStyle(n).visibility !== "hidden") bottom = Math.max(bottom, n.getBoundingClientRect().bottom);
      return { x: panel.x, y: panel.y, width: panel.width, height: bottom - panel.y + 14 };
    });
    await L.shot(p, name, { clip: c });
  };
  const tab = async (t) => { await p.click(`.ptab[data-tab="${t}"]`); await p.waitForTimeout(200); };
  // Text box (article)
  let r = await L.boxRect(p, "story1");
  await p.mouse.click(r.x + r.w * 0.75, r.y + r.h * 0.5); await p.waitForTimeout(300);
  await tab("text"); await panel("panel-text");
  await tab("frame"); await panel("panel-frame-text");
  await tab("arrange"); await panel("panel-arrange");
  await tab("page"); await panel("panel-page");
  // Picture
  r = await L.boxRect(p, "pic"); await p.mouse.click(r.x + r.w / 2, r.y + r.h / 2); await p.waitForTimeout(300);
  await tab("frame"); await panel("panel-frame-image");
  // Shape (quote background) — click its edge area away from the text box over it
  r = await L.boxRect(p, "qbg"); await p.mouse.click(r.x + 6, r.y + r.h / 2); await p.waitForTimeout(300);
  await tab("frame"); await panel("panel-frame-shape");
  // Line
  r = await L.boxRect(p, "rule"); await p.mouse.click(r.x + r.w / 3, r.y + r.h / 2); await p.waitForTimeout(300);
  await tab("frame"); await panel("panel-frame-line");
  // Table on page 2
  await p.click(".pages-rail .page-thumb >> nth=1").catch(async () => { await p.locator("#pages-rail [title='Page 2']").click(); });
  await p.waitForTimeout(500);
  r = await L.boxRect(p, "tbl"); await p.mouse.click(r.x + r.w * 0.2, r.y + r.h * 0.5); await p.waitForTimeout(300);
  await tab("frame"); await panel("panel-frame-table");
  await tab("text"); await panel("panel-text-table");
  await p.context().close();

  // ── 3. Dialogs ──
  p = await L.open(b, { h: 1400 });
  await p.click('.ptab[data-tab="page"]'); await p.click("#page-setup"); await p.waitForTimeout(300);
  await p.evaluate(() => { const m = document.getElementById("setup-modal"); m.style.maxHeight = "none"; });
  await L.el(p, "#setup-modal", "dlg-page-setup");
  await p.keyboard.press("Escape");
  await p.click("#btn-save-as"); await p.waitForTimeout(200); await L.el(p, "#saveas-modal", "dlg-save-as"); await p.keyboard.press("Escape");
  await p.keyboard.press("Control+f"); await p.waitForTimeout(200);
  await p.fill("#find-text", "লেখনী"); await p.fill("#replace-text", "লেখনী ৫"); await p.click("#find-next"); await p.waitForTimeout(200);
  await L.el(p, "#find-overlay .modal", "dlg-find"); await p.click("#find-close");
  // Link dialog on a word in the subtitle
  r = await L.boxRect(p, "sub"); await p.mouse.dblclick(r.x + r.w / 2 - 30, r.y + r.h / 2); await p.waitForTimeout(200);
  await p.keyboard.press("Control+k"); await p.waitForTimeout(250);
  await p.fill("#link-target", "example.com/lekhoni");
  await L.el(p, "#link-modal", "dlg-link"); await p.click("#link-cancel");
  await p.click("#tool-table"); r = await L.boxRect(p, "ed1"); await p.mouse.click(r.x + 40, r.y + r.h + 60); await p.waitForTimeout(250);
  await L.el(p, "#table-modal", "dlg-table"); await p.click("#table-cancel");
  await p.context().close();

  // ── 4. Canvas close-ups at 100% ──
  p = await L.open(b, { w: 1440, h: 1200 });
  await L.zoom(p, 1);
  const around = async (id, name, pad = 40, extra = {}) => {
    const q = await L.boxRect(p, id);
    await L.shot(p, name, { clip: { x: q.x - pad - (extra.l || 0), y: q.y - pad - (extra.t || 0), width: q.w + pad * 2 + (extra.l || 0) + (extra.r || 0), height: q.h + pad * 2 + (extra.t || 0) + (extra.b || 0) } });
  };
  // Picture selected: grip, resize and rotation handles; wrap round it
  r = await L.boxRect(p, "pic"); await p.mouse.click(r.x + r.w / 2, r.y + r.h / 2); await p.waitForTimeout(300);
  await L.shot(p, "selected-picture", { clip: { x: r.x - 30, y: r.y - 40, width: r.w + 420, height: r.h + 120 } });
  // Rotated star selected
  r = await L.boxRect(p, "star"); await p.mouse.click(r.x + r.w / 2, r.y + r.h / 2); await p.waitForTimeout(300);
  await around("star", "rotate-star", 50, { b: 40 });
  // Quote: rectangle + text over it, both selected (multi-select)
  await p.keyboard.press("Escape");
  r = await L.boxRect(p, "qbg"); await p.mouse.click(r.x + 6, r.y + r.h / 2); await p.waitForTimeout(200);
  r = await L.boxRect(p, "star"); await p.keyboard.down("Shift"); await p.mouse.click(r.x + r.w / 2, r.y + r.h / 2); await p.keyboard.up("Shift"); await p.waitForTimeout(300);
  await around("qbg", "multi-select", 40, { r: 30, b: 30 });
  await p.keyboard.press("Escape");
  // Drop cap & justified article
  r = await L.boxRect(p, "story1");
  await L.shot(p, "dropcap", { clip: { x: r.x + r.w * 0.47, y: r.y - 6, width: r.w * 0.55, height: 190 } });
  // Text wrap round the picture (nothing selected)
  await L.shot(p, "text-wrap", { clip: { x: r.x - 10, y: r.y - 10, width: r.w + 20, height: 330 } });
  // Flow-out marker at the end of the first frame
  await L.shot(p, "flow-out", { clip: { x: r.x + r.w - 520, y: r.y + r.h - 150, width: 560, height: 190 } });
  // Two-column frame
  await around("ed1", "columns", 20);
  // Page 1 whole, fit page
  await L.zoom(p, "fit-page"); await p.waitForTimeout(300);
  await L.el(p, ".page", "page1");
  // Page 2
  await p.locator(".pages-rail .page-thumb").nth(1).click(); await p.waitForTimeout(500);
  await L.el(p, ".page", "page2");
  await L.zoom(p, 1); await p.waitForTimeout(300);
  await around("story2", "flow-in", 20, { b: 0 });
  await around("list", "lists", 14);
  r = await L.boxRect(p, "tbl"); await p.mouse.click(r.x + r.w * 0.2, r.y + r.h * 0.3); await p.waitForTimeout(300);
  await around("tbl", "table-selected", 30);
  // Link bubble: put the caret in the e-mail link
  const a = await p.locator('.page a[href^="mailto"]').boundingBox();
  await p.mouse.click(a.x + 20, a.y + a.height / 2); await p.waitForTimeout(400);
  await around("note", "link-bubble", 20, { b: 50 });
  await p.keyboard.press("Escape");
  // Header & page number of page 2 (100%)
  await p.evaluate(() => document.querySelector(".page .page-header").scrollIntoView({ block: "center" })); await p.waitForTimeout(300);
  const hd = await p.locator(".page .page-header").boundingBox();
  await L.shot(p, "header", { clip: { x: hd.x - 60, y: hd.y - 10, width: hd.width + 120, height: hd.height + 70 } });
  await p.evaluate(() => document.querySelector(".page .page-number").scrollIntoView({ block: "center" })); await p.waitForTimeout(300);
  const pn = await p.locator(".page .page-number").boundingBox();
  const pg2 = await p.locator(".page").boundingBox();
  await L.shot(p, "page-number", { clip: { x: pg2.x, y: pn.y - 70, width: 420, height: 130 } });
  await p.context().close();

  // ── 5. Things made from scratch: typing, overset, guides, empty app ──
  p = await L.open(b, { blank: true });
  await L.shot(p, "empty-app");
  await L.zoom(p, 1);
  const pgb = await p.locator(".page").boundingBox();
  await p.click("#tool-text"); await p.mouse.click(pgb.x + 260, pgb.y + 180); await p.waitForTimeout(250);
  await p.keyboard.type("ami bangla likhi", { delay: 30 });
  await p.waitForTimeout(300);
  let tb = await p.locator(".page .box").first().boundingBox();
  await L.shot(p, "phonetic-typing", { clip: { x: tb.x - 30, y: tb.y - 30, width: tb.width + 60, height: tb.height + 60 } });
  // Overset: keep typing until it overflows
  for (let i = 0; i < 6; i++) { await p.keyboard.press("Enter"); await p.keyboard.type("amra notun lekha likhi", { delay: 2 }); }
  await p.keyboard.press("Escape"); await p.waitForTimeout(400);
  tb = await p.locator(".page .box").first().boundingBox();
  await L.shot(p, "overset", { clip: { x: tb.x - 30, y: tb.y - 30, width: tb.width + 60, height: tb.height + 70 } });
  // Guide dragged from the top ruler
  const ruler = await p.locator(".pub-ruler-h").first().boundingBox();
  await p.mouse.move(pgb.x + 400, ruler.y + ruler.height / 2); await p.mouse.down();
  await p.mouse.move(pgb.x + 400, pgb.y + 360, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(300);
  await L.shot(p, "guide", { clip: { x: pgb.x - 30, y: pgb.y - 30, width: 760, height: 470 } });
  await p.context().close();

  log("done");
  await b.close();
})();
