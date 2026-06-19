# Deploying The Fraction Subtraction PWA

This project is a static PWA. It can be served by GitHub Pages, Cloudflare Pages, or any static host.

## GitHub Pages

1. Push this repository to GitHub.
2. In the GitHub repository, open `Settings` -> `Pages`.
3. Set source to `Deploy from a branch`.
4. Choose branch `main` and folder `/root`.
5. Save, then open the published Pages URL.

## iPad Install

1. Open the published URL in Safari on iPad.
2. Tap the Share button.
3. Tap `Add to Home Screen`.
4. Open `分數相減` from the Home Screen.

## PWA Files

- `manifest.webmanifest`: app name, icons, start URL, shortcuts.
- `sw.js`: offline cache for the roadmap, lessons, reference sheets, and icons.
- `pwa.js`: service worker registration that works from GitHub Pages project paths.
- `assets/icons/`: app icons for browser and iPad Home Screen.
