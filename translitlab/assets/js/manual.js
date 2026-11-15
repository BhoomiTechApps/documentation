/**
 * TransLit-Lab user manual — behaviour (same framework as the Lekhoni and OCR Studio manuals).
 * One HTML page holds every chapter; the address (#id) decides which chapter shows.
 * Builds the sidebar, search, prev/next links, image zoom, theme switch and the
 * numbered hotspots on the interface tour.
 */
(function () {
  "use strict";

  // ── Settings you may want to change ──────────────────────────────────
  const CONFIG = {
    // Address of the page on your site that shows the lab ([translitlab]).
    // Leave empty to hide the "Open the lab" button.
    APP_URL: "",
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const chapters = $$("main .chapter");
  const slug = (t) => t.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60);

  // ── Ids and anchor links on every heading ────────────────────────────
  const used = new Set($$("[id]").map((e) => e.id));
  for (const ch of chapters) {
    for (const h of $$("h2, h3", ch)) {
      if (!h.id) {
        let id = ch.id + "-" + slug(h.textContent), n = 2;
        while (used.has(id)) id = ch.id + "-" + slug(h.textContent) + "-" + n++;
        h.id = id;
        used.add(id);
      }
      const a = document.createElement("a");
      a.className = "anchor";
      a.href = "#" + h.id;
      a.textContent = "#";
      a.setAttribute("aria-label", "Link to this section");
      h.appendChild(a);
    }
  }
  const headingText = (h) => h.childNodes[0] ? Array.from(h.childNodes).filter((n) => !(n.classList && n.classList.contains("anchor"))).map((n) => n.textContent).join("").trim() : "";

  // ── Sidebar ──────────────────────────────────────────────────────────
  const navList = $("#toc");
  chapters.forEach((ch, i) => {
    const li = document.createElement("li");
    li.className = "ch";
    li.dataset.ch = ch.id;
    const title = ch.dataset.title || headingText($("h1", ch));
    li.innerHTML = `<a href="#${ch.id}"><span class="n">${i + 1}</span><span></span></a>`;
    li.querySelector("span:last-child").textContent = title;
    const subs = $$("h2", ch);
    if (subs.length) {
      const ol = document.createElement("ol");
      ol.className = "sub";
      for (const h of subs) {
        const sli = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#" + h.id;
        a.textContent = headingText(h);
        sli.appendChild(a);
        ol.appendChild(sli);
      }
      li.appendChild(ol);
    }
    navList.appendChild(li);
  });

  // ── Prev / next ──────────────────────────────────────────────────────
  chapters.forEach((ch, i) => {
    const pager = document.createElement("nav");
    pager.className = "pager";
    pager.setAttribute("aria-label", "Chapters");
    const link = (c, cls, label) => `<a class="${cls}" href="#${c.id}"><small>${label}</small>${(c.dataset.title || headingText($("h1", c)))}</a>`;
    pager.innerHTML = (chapters[i - 1] ? link(chapters[i - 1], "prev", "← Previous") : "") + (chapters[i + 1] ? link(chapters[i + 1], "next", "Next →") : "");
    ch.appendChild(pager);
  });

  // ── Routing: show one chapter at a time ──────────────────────────────
  let current = null;
  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    let target = id ? document.getElementById(id) : null;
    const ch = (target && target.closest(".chapter")) || chapters[0];
    if (ch !== current) {
      chapters.forEach((c) => (c.hidden = c !== ch));
      current = ch;
      $$("#toc .ch").forEach((li) => li.classList.toggle("on", li.dataset.ch === ch.id));
      document.title = (ch.dataset.title || headingText($("h1", ch))) + " — TransLit-Lab user manual";
      observeHeadings();
    }
    document.body.classList.remove("nav-open");
    if (target && target !== ch) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: "start" });
        target.classList.remove("flash");
        void target.offsetWidth;
        target.classList.add("flash");
      });
    } else {
      window.scrollTo(0, 0);
    }
    const active = $(`#toc .ch[data-ch="${ch.id}"]`);
    if (active) active.scrollIntoView({ block: "nearest" });
  }
  window.addEventListener("hashchange", route);

  // Highlight the sub-heading being read.
  let io = null;
  function observeHeadings() {
    if (io) io.disconnect();
    const links = new Map($$(`#toc .ch[data-ch="${current.id}"] .sub a`).map((a) => [a.getAttribute("href").slice(1), a]));
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.classList.remove("here"));
        const a = links.get(e.target.id);
        if (a) a.classList.add("here");
      }
    }, { rootMargin: "-70px 0px -70% 0px" });
    $$("h2", current).forEach((h) => io.observe(h));
  }

  // ── Search ───────────────────────────────────────────────────────────
  /** Text of an element with a space between cells, list items and paragraphs. */
  const textHolder = document.createElement("template");
  function textOf(node) {
    textHolder.innerHTML = node.outerHTML.replace(/<\/(td|th|li|p|dt|dd|h\d|div|tr|figcaption)>/gi, " $&");
    return textHolder.content.textContent.replace(/\s+/g, " ");
  }
  const index = [];
  for (const ch of chapters) {
    const chTitle = ch.dataset.title || headingText($("h1", ch));
    let entry = { id: ch.id, title: chTitle, path: chTitle, text: "" };
    index.push(entry);
    for (const node of $$(":scope > *, :scope > .side > div > *", ch)) {
      if (node.matches("h1, .pager, .side, script")) continue;
      if (node.matches("h2, h3")) {
        entry = { id: node.id, title: headingText(node), path: chTitle, text: "" };
        index.push(entry);
        continue;
      }
      entry.text += " " + textOf(node);
    }
  }
  index.forEach((e) => { e.lt = e.title.toLowerCase(); e.lx = e.text.toLowerCase(); });

  const input = $("#search"), box = $("#results");
  let hits = [], sel = -1;
  const escHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function mark(text, terms) {
    let h = escHtml(text);
    for (const t of terms) h = h.replace(new RegExp(escRe(escHtml(t)), "gi"), (m) => `<mark>${m}</mark>`);
    return h;
  }
  function search(q) {
    const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1 || /[^\x00-\x7f]/.test(t));
    if (!terms.length) { box.hidden = true; return; }
    hits = index
      .map((e) => {
        let score = 0;
        for (const t of terms) {
          const inTitle = e.lt.includes(t), inText = e.lx.includes(t);
          if (!inTitle && !inText) return null;
          score += (inTitle ? 10 : 0) + (inText ? 1 + Math.min(4, e.lx.split(t).length - 1) * 0.2 : 0);
        }
        return { e, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
    sel = -1;
    if (!hits.length) {
      box.innerHTML = `<div class="empty">Nothing found for “${escHtml(q)}”. Try another word, or look in the <a href="#troubleshooting">troubleshooting</a> chapter.</div>`;
    } else {
      box.innerHTML = hits.map(({ e }) => {
        const i = Math.max(0, e.lx.indexOf(terms.find((t) => e.lx.includes(t)) || ""));
        const snip = e.text.slice(Math.max(0, i - 60), i + 110).trim();
        return `<a href="#${e.id}"><div class="r-path">${escHtml(e.path)}</div><div class="r-title">${mark(e.title, terms)}</div>` +
          (snip ? `<div class="r-snip">…${mark(snip, terms)}…</div>` : "") + `</a>`;
      }).join("");
    }
    box.hidden = false;
  }
  input.addEventListener("input", () => search(input.value.trim()));
  input.addEventListener("focus", () => { if (input.value.trim()) search(input.value.trim()); });
  input.addEventListener("keydown", (e) => {
    const links = $$("a", box);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!links.length) return;
      sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links.forEach((a, i) => a.classList.toggle("on", i === sel));
      links[sel].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      const a = links[sel >= 0 ? sel : 0];
      if (a) { location.hash = a.getAttribute("href"); box.hidden = true; input.blur(); }
    } else if (e.key === "Escape") {
      box.hidden = true;
      input.blur();
    }
  });
  box.addEventListener("click", (e) => { if (e.target.closest("a")) { box.hidden = true; } });
  document.addEventListener("click", (e) => { if (!e.target.closest(".search")) box.hidden = true; });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); input.select(); }
  });

  // ── Theme ────────────────────────────────────────────────────────────
  const root = document.documentElement;
  const savedTheme = (() => { try { return localStorage.getItem("translitlab-manual-theme"); } catch (e) { return null; } })();
  root.dataset.theme = savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  $("#theme").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("translitlab-manual-theme", root.dataset.theme); } catch (e) { }
  });

  // ── Menu (small screens) ─────────────────────────────────────────────
  $("#menu").addEventListener("click", () => document.body.classList.toggle("nav-open"));

  // ── Open Lekhoni button ──────────────────────────────────────────────
  const appBtn = $("#open-app");
  if (CONFIG.APP_URL) appBtn.href = CONFIG.APP_URL;
  else appBtn.remove();
  $$("[data-app-link]").forEach((a) => { if (CONFIG.APP_URL) a.href = CONFIG.APP_URL; else a.replaceWith(...a.childNodes); });

  // ── Image zoom ───────────────────────────────────────────────────────
  const lb = $("#lightbox"), lbImg = $("#lightbox img"), lbCap = $("#lightbox p");
  document.addEventListener("click", (e) => {
    const img = e.target.closest("figure img");
    if (!img || e.target.closest(".hs")) return;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    const cap = img.closest("figure").querySelector("figcaption");
    lbCap.textContent = cap ? cap.textContent : img.alt;
    lb.hidden = false;
  });
  lb.addEventListener("click", () => (lb.hidden = true));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.hidden = true; });

  // ── Hotspots on the interface tour ───────────────────────────────────
  for (const fig of $$(".hotspot-fig")) {
    const spots = JSON.parse(fig.dataset.spots);
    const layer = document.createElement("div");
    layer.className = "hotspots";
    const legend = document.getElementById(fig.dataset.legend);
    const items = legend ? $$("li[data-spot]", legend) : [];
    items.forEach((li, i) => {
      const s = spots[li.dataset.spot];
      if (!s) return;
      const num = String(i + 1);
      li.insertAdjacentHTML("afterbegin", `<span class="num">${num}</span>`);
      const hs = document.createElement("a");
      hs.className = "hs";
      hs.href = li.dataset.href || "#";
      hs.style.cssText = `left:${s.x}%;top:${s.y}%;width:${s.w}%;height:${s.h}%`;
      hs.innerHTML = `<span>${num}</span>`;
      hs.title = li.textContent.replace(/^\d+/, "").trim();
      const on = (v) => { hs.classList.toggle("on", v); li.classList.toggle("on", v); };
      hs.addEventListener("mouseenter", () => on(true));
      hs.addEventListener("mouseleave", () => on(false));
      li.addEventListener("mouseenter", () => on(true));
      li.addEventListener("mouseleave", () => on(false));
      layer.appendChild(hs);
    });
    fig.querySelector(".hotspot-img").appendChild(layer);
  }

  // ── Back to top ──────────────────────────────────────────────────────
  const top = $("#to-top");
  window.addEventListener("scroll", () => top.classList.toggle("show", scrollY > 700), { passive: true });
  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  route();
})();
