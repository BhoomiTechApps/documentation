# Artisan Outlet user manual

The user manual for **Artisan Outlet 2.8.0** (WordPress shop for rural artisans) and its add-on
**Artisan Outlet Mobile 2.6.0** (the phone app and the artisan section), as one static website.

Published at: `https://bhoomitechapps.github.io/documentation/artisan-outlet/`

## Contents

```
index.html               the whole manual (15 chapters); the address (#id) picks the chapter
assets/css/manual.css    layout shared with the other BhoomiTech manuals
assets/css/theme.css     the shop's Terracotta colours, phone-screenshot galleries, the order-flow strip
assets/fonts/            Onest (SIL Open Font License)
assets/js/manual.js      sidebar, search, prev/next, image zoom, light/dark, numbered hotspots
img/                     screenshots (WebP, taken at 2x for the desktop and 3x for the phone) and the icon
tools/sample-shop/       builds the sample shop the screenshots come from
tools/screenshots/       the scripts that took the screenshots
```

No build step: GitHub Pages serves the folder as it is. To preview locally, run a web server from the
`documentation` folder (for example `python3 -m http.server`) and open `http://localhost:8000/artisan-outlet/`.

## Settings

At the top of `assets/js/manual.js`:

* `APP_URL` – the address of your shop (for example the page with `[ao_outlet]`). When set, an
  **Open the shop** button appears in the top bar. Empty by default, which hides the button.

## The sample shop

The screenshots show "Hastakala Crafts", a sample shop with four **fictional** artisans from Assam and
twelve crafts. The pictures of crafts and artisans are drawn illustrations (`tools/sample-shop/make-images.py`),
not photos of real people or products. Two artisans are shipped for by the website (Rupa Kalita, Dipali Das)
and two ship and are paid directly (Hemanta Pal, Bikash Deka), so both ways of selling appear.

## Retaking the screenshots

The scripts drive a real WordPress site through one story: three website orders and two app orders,
staff confirming and shipping, an artisan shipping with photos in the app, then commission and payout
settled and confirmed by each side.

1. **A test site.** WordPress 6.2+ with the Twenty Twenty-Five theme, pretty permalinks
   (`/%postname%/`), an administrator `admin` / `admin123`, and both plugins active.
   PHP's built-in server works with `tools/sample-shop/router.php`:

   ```
   php -S localhost:8781 -t /path/to/wordpress tools/sample-shop/router.php
   ```

2. **The sample shop.** From `tools/sample-shop`:

   ```
   python3 make-images.py                     # needs Pillow; writes images/
   wp eval-file seed.php                      # artisans, crafts, settings, Shop page, demo pages
   wp eval-file reset.php                     # (to start again) clears orders and artisan logins
   ```

   Keep a copy of the database after seeding: the story must start from a shop with no orders.

3. **The screenshots.** From `tools/screenshots`:

   ```
   npm install && npx playwright install chromium
   WP_URL=http://localhost:8781 npm run all
   ```

   The phases run in order and each depends on the one before (`p1-admin` … `p10-search`; phase 8 sets the Help link and retakes the Store settings, phase 9 adds artisan contact links and retakes the artisan screens, phase 10 shows search as you type). Phase 1
   writes the artisans' PINs to `pins.json`, phase 2 the order links to `orders.json`, phase 3 the
   key of order HK-4 to `hk4.key`. Pictures go to `../../img`; a few extra pictures are taken that the
   manual doesn't use.

4. **Hotspots.** `npm run measure` prints the rectangles for the numbered hotspots on the order page
   (`#orders-page`) and the app home screen (`#app`), as `data-spots` in `index.html`. Run it when
   order HK-1 is waiting for its payment to be verified (after phase 3).

## Notes

* Twenty Twenty-Five prints a "Written by … in" line under the title of craft and artisan pages (it
  treats them like blog posts). The scripts hide that line in the two page-top screenshots, since it
  belongs to the theme, not the shop.
