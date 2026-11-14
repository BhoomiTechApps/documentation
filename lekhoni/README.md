# Lekhoni user manual

The complete user manual for **Lekhoni (লেখনী)**, the Bengali and Assamese desktop-publishing app that runs in the browser. Written for Lekhoni 5.3.3.

It is a plain static website (HTML, CSS and JavaScript, with no build step) made to live in the `lekhoni` folder of the `documentation` repository and be served by GitHub Pages.

## Publishing on GitHub Pages

1. Put this folder in the repository as `documentation/lekhoni/` and push.
2. On GitHub, open the repository's **Settings › Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick your branch (for example `main`) and the folder `/ (root)`, then **Save**.
4. After a minute the manual is at
   `https://<your-user-or-org>.github.io/documentation/lekhoni/`

The manual needs to be opened from a web address (GitHub Pages or any local web server). If you open `index.html` straight from disk, everything works except the phonetic key table and the "Try it here" box, which load the key map with `fetch`.

To preview locally:

```sh
cd documentation
python3 -m http.server 8000
# then open http://localhost:8000/lekhoni/
```

## Linking to the app

To show an **Open Lekhoni** button in the top bar, set the app's address at the top of `assets/js/manual.js`:

```js
const CONFIG = {
  APP_URL: "https://<your-user-or-org>.github.io/lekhoni/",
};
```

Leave it empty to hide the button.

## What's in the folder

```
lekhoni/
├── index.html                 the whole manual (16 chapters, one page)
├── assets/
│   ├── css/manual.css         styles (light and dark, print)
│   ├── js/manual.js           sidebar, chapters, search, zoom, theme, hotspots
│   ├── js/translit-demo.js    "Try it here" box and the key table
│   └── vendor/translit/       Lekhoni's typing engine and key map (copies)
├── img/                       screenshots (WebP) and the app icon
└── tools/screenshots/         scripts that regenerate the screenshots
```

### How the page works

* Each chapter is a `<section class="chapter" id="…">` in `index.html`. The address (`#pages`, `#text-lists`, …) decides which chapter shows; links to any heading work.
* The sidebar, chapter numbers, "Previous / Next" links, heading anchors and the search index are all built from the headings when the page loads. Add or rename a heading and everything follows; no list to maintain.
* Headings without an `id` get one automatically (`chapter-id` + heading text). Give important headings a fixed `id` if other pages will link to them.
* The search box (press `/`) searches every chapter, including Bengali words.
* Click any screenshot to view it full size. **Print** in the top bar prints the whole manual, one chapter per page.

## Keeping the manual up to date

### When the phonetic key map changes

The key table and the "Try it here" box read `assets/vendor/translit/translit-forward-map.json`. Copy the new `data/translit-forward-map.json` from Lekhoni over it. If the engine itself changes, also copy `js/translit-engine.js`, `js/translit-hooks.js` and `js/translit-wrapper.js` from the app into `assets/vendor/translit/`.

The examples in the text (`ami bangla likhi` → আমি বাংলা লিখি, `kabyo` → কাব্য, `k'Sh` → ক‌ষ, `amader gramer khobor` → আমাদের গ্রামের খবর) were checked against the current map; check them again after changing it.

### Regenerating the screenshots

The scripts in `tools/screenshots/` open Lekhoni in a headless Chrome, load a sample two-page Bengali magazine (`sample.js`) and save every screenshot into `img/` as WebP.

```sh
# 1. serve the Lekhoni app somewhere, e.g.
npx http-server ../../../../lekhoni -p 8765        # path to the app's folder

# 2. install and run the screenshot scripts
cd documentation/lekhoni/tools/screenshots
npm install
npx playwright install chromium
LEKHONI_URL=http://localhost:8765/index.html npm run shots
```

For Bengali text to render, the computer needs **Noto Serif Bengali** and **Noto Sans Bengali** installed (the app's web fonts are not loaded during capture).

The script also writes `img/overview-spots.json`: the positions of the parts of the window in the overview picture. If the toolbar or panels move, copy that JSON into the `data-spots` attribute of the `hotspot-fig` figure in the *Lekhoni window* chapter.

### Version

The version shown in the top bar and the sidebar ("Written for Lekhoni 5.3.3") is plain text in `index.html`; update it together with the **What's new** chapter.
