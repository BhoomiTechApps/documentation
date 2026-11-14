# OCR Studio user manual

The complete user manual for **OCR Studio**, the offline OCR tool and corpus builder for Eastern Nagari (Bengali–Assamese script) and English. Written for OCR Studio 3.2.0.

It is a plain static website (HTML, CSS and JavaScript, no build step), made to live in the `ocr-studio` folder of the `documentation` repository and be served by GitHub Pages, next to the Lekhoni manual. It uses the same framework as the Lekhoni manual, recoloured to OCR Studio's BhoomiTech look (Stone / Graphite with the muga-gold accent, Onest typeface).

## Publishing

Put this folder in the repository as `documentation/ocr-studio/` and push. With GitHub Pages already switched on for the repository (see the Lekhoni manual's README), the manual is at

`https://bhoomitechapps.github.io/documentation/ocr-studio/`

Open it from a web address (GitHub Pages or a local web server). Opened straight from disk, everything works except the key table and the "Try it here" box in *Proofreading & typing*, which load the typing rules with `fetch`.

```sh
cd documentation
python3 -m http.server 8000
# then open http://localhost:8000/ocr-studio/
```

## Linking to the app

To show an **Open OCR Studio** button, set `APP_URL` at the top of `assets/js/manual.js`. Leave it empty to hide the button.

To open this manual from OCR Studio itself, add a link to `https://bhoomitechapps.github.io/documentation/ocr-studio/` in the app (for example a help button in the controls bar).

## What's in the folder

```
ocr-studio/
├── index.html                 the whole manual (16 chapters, one page)
├── assets/
│   ├── css/manual.css         shared manual styles (same as the Lekhoni manual)
│   ├── css/theme.css          OCR Studio colours and the Onest typeface
│   ├── fonts/                 Onest (SIL Open Font License, OFL.txt)
│   ├── js/manual.js           sidebar, chapters, search, zoom, theme, hotspots
│   ├── js/ime-demo.js         "Try it here" box and the key table
│   └── vendor/ime/            OCR Studio's typing engine and rules (copies)
├── img/                       screenshots (WebP) and the app icon
├── samples/                   practice files offered to readers
└── tools/screenshots/         scripts that make the samples and the screenshots
```

How the page works (chapters, automatic sidebar, search, anchors, print) is the same as in the Lekhoni manual; see its README.

## Keeping the manual up to date

### When the typing rules change

The key table and the "Try it here" box read `assets/vendor/ime/`. Copy `engine.js`, `forwardMap.json`, `reverseMap.json`, `defaults.json` and `js-engine-settings.default.json` from the app's `js/ime/` folder over them.

### Regenerating the screenshots

`tools/screenshots/make-samples.js` makes the sample book (`gramer-katha.pdf`), the crooked scan and the phone photo. `shots.js` opens OCR Studio in a headless Chrome, works through the whole manual's workflow on those files (recognition, proofreading, deskew, perspective, clean-up, source details, saving, collection, typing, recording with a fake microphone) and saves every screenshot into `img/` as WebP. It also saves the exports it makes into `downloads/`, which is handy for checking what the manual says about them.

```sh
# 1. serve OCR Studio somewhere, e.g.
cd path/to/ocr-studio && python3 -m http.server 8770

# 2. in another terminal
cd documentation/ocr-studio/tools/screenshots
npm install
npx playwright install chromium
npm run samples
OCR_URL=http://localhost:8770/index.html npm run shots
cp samples/gramer-katha.pdf samples/page2-crooked.jpg samples/photo.jpg ../../samples/
```

The computer needs **Noto Serif Bengali** and **Noto Sans Bengali** installed for the sample pages and the text to render.

`shots.js` also writes `img/overview-spots.json` (the positions of the parts of the window). If the layout changes, copy it into the `data-spots` attribute of the `hotspot-fig` figure in *The OCR Studio window*.

The perspective demo drags the corners to the page corners listed in `corners.json`; if you change the phone photo, update them.

### Version

The version in the top bar and the sidebar ("Written for OCR Studio 3.2.0") is plain text in `index.html`; update it together with the **What's new** chapter.
