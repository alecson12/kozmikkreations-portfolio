// npm run assets
//
// Makes the small web files that come from the originals in this folder:
//   · the browser-tab icons, from KozmikLogos/Kozmik_White.png
//       white  → shown when the browser is in dark mode
//       dark   → the same shape, recoloured, shown when the browser is in light mode
//   · the web copy of the ambient track, from the MP3 in the project folder
//
// Nothing is redrawn or cropped: the logo keeps its shape and proportions and is only
// placed, whole, on a square.

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const brand = path.join(root, 'public/brand')
const MARK = path.join(root, 'KozmikLogos/Kozmik_White.png')
const DARK = { r: 10, g: 13, b: 24 } // the site's own near-black, for light browser tabs
const NIGHT = { r: 3, g: 4, b: 10, alpha: 1 } // the site background, behind the phone home-screen icon

mkdirSync(brand, { recursive: true })

// the logo, whole, centred on a transparent square
async function square(size, colour, pad = 0.04) {
  const inner = Math.round(size * (1 - pad * 2))
  let logo = sharp(MARK).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  if (colour) {
    // same shape (the transparency is untouched), another colour
    const alpha = await logo.clone().extractChannel('alpha').toBuffer()
    logo = sharp({ create: { width: inner, height: inner, channels: 3, background: colour } }).joinChannel(alpha)
  }
  const m = Math.round((size - inner) / 2)
  return sharp(await logo.png().toBuffer()).extend({ top: m, bottom: size - inner - m, left: m, right: size - inner - m, background: { r: 0, g: 0, b: 0, alpha: 0 } })
}

for (const size of [32, 48, 192]) {
  await (await square(size)).png().toFile(path.join(brand, `favicon-white-${size}.png`))
  await (await square(size, DARK)).png().toFile(path.join(brand, `favicon-dark-${size}.png`))
}
// phones' home screens need a solid background
await (await square(180, null, 0.16)).flatten({ background: NIGHT }).png().toFile(path.join(brand, 'apple-touch-icon.png'))
console.log('icons   → public/brand/favicon-white-*.png, favicon-dark-*.png, apple-touch-icon.png')

// ── the ambient track ────────────────────────────────────────────────────────
const source = readdirSync(root).find((f) => /float\.mp3$/i.test(f))
if (!source) {
  console.log('music   → no "…float.mp3" in the project folder, skipped')
} else {
  let ffmpeg = 'ffmpeg'
  try {
    ffmpeg = (await import('ffmpeg-static')).default
  } catch {
    /* use the one installed on the computer */
  }
  const out = path.join(root, 'public/audio/float.mp3')
  if (statSync(path.join(root, source)).size < 3.5 * 1048576) {
    // already web-sized: used exactly as supplied, not converted again
    copyFileSync(path.join(root, source), out)
    console.log(`music   → public/audio/float.mp3 (${(statSync(out).size / 1048576).toFixed(1)} MB, as supplied)`)
    process.exit(0)
  }
  // sound only (the embedded cover picture is left out), title and artist tags kept
  const run = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', path.join(root, source), '-map', '0:a', '-c:a', 'libmp3lame', '-b:a', '160k', '-map_metadata', '0', '-id3v2_version', '3', out])
  if (run.status !== 0 || !existsSync(out)) console.log('music   → could not be converted:', String(run.stderr || run.error || ''))
  else console.log(`music   → public/audio/float.mp3 (${(statSync(out).size / 1048576).toFixed(1)} MB)`)
}
