# Kozmik Kreations — Graphic Design Portfolio

An interactive universe: every project is a planet. Built with Vite + React + Tailwind,
the same setup as the other three sites.

## See it on your computer

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5175

## Where things are

| What | Where |
| --- | --- |
| All text (home, about, contact, email, links) | `src/content/site.js` |
| The projects: titles, slide order, planet look | `src/content/projects.js` |
| Your original artwork (never changed by the site) | `Projects/` |
| Your logo files, as supplied | `KozmikLogos/` (copied to `public/brand/`) |
| Web-sized copies the site loads | `public/media/` (made automatically) |

## Add or change a project

1. Put the images / videos in a folder inside `Projects/`.
2. Open `src/content/projects.js`, copy one of the blocks and fill it in.
   `slides` is the list of files **in the order they should appear**.
   `layout` is `'carousel'` (one slide at a time, for carousel posts) or
   `'gallery'` (everything on one page, for poster sets and single prints).
3. Run:

```bash
npm run media
```

   That makes the web-sized copies and tells you if a file is missing or was left out.
   Videos need one extra tool the first time: `npm install --no-save ffmpeg-static`.

Nothing is cropped or redrawn. Images are only resized and saved as high-quality WebP;
videos are re-encoded at web size with their sound.

## Publish

The repo is ready for GitHub Pages (`.github/workflows/deploy.yml`). The site works
under any repo name, so nothing needs editing first.

1. Create an empty repo on GitHub.
2. `git remote add origin https://github.com/alecson12/<repo-name>.git`
3. `git push -u origin main`
4. If the first run fails, set Settings → Pages → Source to **GitHub Actions** and re-run.

`Projects/` (the 827 MB of originals) is deliberately not uploaded; keep your own backup of it.
