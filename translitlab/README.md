# TransLit-Lab user manual

The user manual for **TransLit-Lab 1.5.1** (WordPress plugin) and its add-on **TransLit-Lab Parity 1.1.0**, as one static website.

Published at: `https://bhoomitechapps.github.io/documentation/translitlab/`

## Contents

```
index.html                    the whole manual (18 chapters); the address (#id) picks the chapter
assets/css/manual.css         layout shared with the Lekhoni and OCR Studio manuals
assets/css/theme.css          BhoomiTech colours (Stone / Graphite, muga gold) and TransLit-Lab additions
assets/fonts/                 Onest (SIL Open Font License)
assets/js/manual.js           sidebar, search, prev/next, image zoom, light/dark, numbered hotspots
assets/js/try-engine.js       the "Try the engine" box and the forward-map table
assets/vendor/translit/       translit-forward.js and translit-reverse.js, the JS packages built by
                              the Parity add-on (GPL-2.0-or-later, see LICENSE there)
img/                          screenshots (WebP, taken at 2x) and the icon
tools/screenshots/            the scripts that took the screenshots
```

No build step: GitHub Pages serves the folder as it is. To preview locally, run a web server from the
`documentation` folder (for example `python3 -m http.server`) and open `http://localhost:8000/translitlab/`.

## Settings

At the top of `assets/js/manual.js`:

* `APP_URL` – the address of the page on your site that shows the lab. When set, an **Open the lab**
  button appears in the top bar. Empty by default, which hides the button.

## Updating the try box and the map table

Both use the two JS packages in `assets/vendor/translit/`, so they show the maps and snippets those
packages were built from. After changing the lab's data:

1. In WordPress, open **Tools → TransLit-Lab Parity → Build packages** and build **JS forward** and
   **JS reverse**.
2. From each ZIP copy `dist/translit-forward.js` and `dist/translit-reverse.js` into
   `assets/vendor/translit/`, replacing the old ones.

Nothing else needs changing.

## Retaking the screenshots

The screenshots come from a real WordPress site running both plugins. The scripts in
`tools/screenshots` log in, click through the lab and the admin pages, and save WebP files to `img/`.

1. A test site (WordPress 6.0+, PHP 8.0+) with TransLit-Lab and TransLit-Lab Parity active, and:
   * user `admin` / `admin123` (administrator);
   * user `rina` / `rina123`, display name *Rina Sinha*, role Transliterator, **with** lab access;
   * user `amit` / `amit123`, display name *Amit Das*, role Transliterator, **without** lab access, with
     an override of Test and Maps;
   * default tabs: Test, Snippets and Maps;
   * a page with `[translitlab]` (default address `/?page_id=4`, or set `LAB_URL`) and a page with
     `[translitlab theme="light" height="820"]` (`/?page_id=7`, or set `LAB_LIGHT_URL`).
2. Start from fresh data (no revisions, no recorded builds): the admin script makes two edits to create
   revision history, switches one engine setting off to show a difference and back on, and builds all
   four packages.
3. Run:

   ```
   cd tools/screenshots
   npm install && npx playwright install chromium
   WP_URL=http://localhost:8780 npm run front
   WP_URL=http://localhost:8780 npm run admin
   ```

   `npm run measure` prints the positions used for the numbered hotspots in the tour chapter
   (`data-spots` in `index.html`); update them if the lab's layout changes.
