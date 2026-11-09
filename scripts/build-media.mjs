// Makes the web-sized copies of the artwork that the site actually loads.
//
//   npm run media            only makes what is missing or out of date
//   npm run media -- --force remakes everything
//
// Reads   Projects/<folder>/<file>          (the originals — never changed)
// Writes  public/media/<project-id>/…       (WebP at several widths, MP4 + poster)
//         src/content/media.json            (sizes, so the page never jumps while loading)
//
// Images are only resized (never cropped, never enlarged) and saved as high-quality
// WebP. Videos are re-encoded to H.264 at web size, same shape, sound kept.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { PROJECTS } from '../src/content/projects.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'Projects')
const OUT = path.join(ROOT, 'public', 'media')
const MANIFEST = path.join(ROOT, 'src', 'content', 'media.json')
const FORCE = process.argv.includes('--force')

const WIDTHS = [480, 960, 1600, 2400] // never larger than the original
const VIDEO_MAX_WIDTH = 1080
const IMAGE_RE = /\.(png|jpe?g|webp|avif|gif)$/i
const VIDEO_RE = /\.(mp4|mov|m4v|webm)$/i

const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
const fresh = (out, src) => !FORCE && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs
const kb = (f) => Math.round(fs.statSync(f).size / 1024)

let ffmpegPath = null
async function ffmpeg() {
  if (ffmpegPath) return ffmpegPath
  try {
    ffmpegPath = (await import('ffmpeg-static')).default
  } catch {
    ffmpegPath = 'ffmpeg' // fall back to one installed on the computer
  }
  try {
    execFileSync(ffmpegPath, ['-version'], { stdio: 'ignore' })
  } catch {
    throw new Error('Videos need ffmpeg. Run:  npm install --no-save ffmpeg-static   then run this again.')
  }
  return ffmpegPath
}

async function buildImage(src, dir, base) {
  const raw = await sharp(src).metadata()
  const meta = raw.autoOrient ?? raw // phone photos: use the size after turning them upright
  const widths = WIDTHS.filter((w) => w < meta.width)
  if (!widths.length || meta.width <= WIDTHS.at(-1)) widths.push(meta.width)
  const variants = []
  for (const w of widths) {
    const name = `${base}-${w}.webp`
    const out = path.join(dir, name)
    if (!fresh(out, src)) {
      await sharp(src)
        .autoOrient()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: w >= 1600 ? 90 : 86, effort: 5, smartSubsample: true })
        .toFile(out)
      console.log(`    ${name}  ${kb(out)} KB`)
    }
    variants.push({ w, src: name })
  }
  return { type: 'image', w: meta.width, h: meta.height, variants }
}

async function buildVideo(src, dir, base) {
  const bin = await ffmpeg()
  const name = `${base}.mp4`
  const posterName = `${base}-poster.webp`
  const out = path.join(dir, name)
  const poster = path.join(dir, posterName)
  if (!fresh(out, src)) {
    execFileSync(
      bin,
      [
        '-v', 'error', '-y', '-i', src,
        '-map', '0:v:0', '-map', '0:a:0?',
        '-vf', `scale='min(${VIDEO_MAX_WIDTH},iw)':-2`,
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart',
        out,
      ],
      { stdio: 'inherit' },
    )
    console.log(`    ${name}  ${kb(out)} KB`)
  }
  if (!fresh(poster, src)) {
    const png = path.join(dir, `${base}-poster.tmp.png`)
    execFileSync(bin, ['-v', 'error', '-y', '-i', out, '-frames:v', '1', png], { stdio: 'inherit' })
    await sharp(png).webp({ quality: 86, effort: 5 }).toFile(poster)
    fs.rmSync(png)
  }
  const meta = await sharp(poster).metadata()
  return { type: 'video', w: meta.width, h: meta.height, src: name, poster: posterName }
}

const manifest = {}
const problems = []
const expected = new Set()

for (const project of PROJECTS) {
  const folder = path.join(SRC, project.folder)
  if (!fs.existsSync(folder)) {
    problems.push(`${project.id}: folder not found → Projects/${project.folder}`)
    manifest[project.id] = []
    continue
  }
  const files =
    project.slides ??
    fs.readdirSync(folder).filter((f) => IMAGE_RE.test(f) || VIDEO_RE.test(f)).sort(natural)
  const dir = path.join(OUT, project.id)
  fs.mkdirSync(dir, { recursive: true })
  console.log(`${project.title}  (${files.length})`)

  const items = []
  for (const [i, file] of files.entries()) {
    const src = path.join(folder, file)
    const base = String(i + 1).padStart(2, '0')
    if (!fs.existsSync(src)) {
      problems.push(`${project.id}: file not found → ${project.folder}/${file}`)
      continue
    }
    if (!IMAGE_RE.test(file) && !VIDEO_RE.test(file)) {
      problems.push(`${project.id}: not an image or video → ${file}`)
      continue
    }
    const item = VIDEO_RE.test(file) ? await buildVideo(src, dir, base) : await buildImage(src, dir, base)
    items.push({ file, ...item })
    for (const f of [item.src, item.poster, ...(item.variants ?? []).map((v) => v.src)]) {
      if (f) expected.add(path.join(dir, f))
    }
  }
  manifest[project.id] = items

  // Files in the folder that the project does not list (so nothing is silently left out).
  const listed = new Set(files)
  for (const f of fs.readdirSync(folder)) {
    if ((IMAGE_RE.test(f) || VIDEO_RE.test(f)) && !listed.has(f)) {
      problems.push(`${project.id}: in the folder but not in slides → ${f}`)
    }
  }
}

// Remove copies left over from files that were renamed, reordered or removed.
if (fs.existsSync(OUT)) {
  for (const id of fs.readdirSync(OUT)) {
    const dir = path.join(OUT, id)
    if (!fs.statSync(dir).isDirectory()) continue
    for (const f of fs.readdirSync(dir)) {
      if (!expected.has(path.join(dir, f))) fs.rmSync(path.join(dir, f))
    }
    if (!fs.readdirSync(dir).length) fs.rmdirSync(dir)
  }
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

const total = Object.values(manifest).reduce((n, items) => n + items.length, 0)
console.log(`\n${PROJECTS.length} projects, ${total} pieces → public/media`)
if (problems.length) {
  console.log('\nNeeds a look:')
  for (const p of problems) console.log('  - ' + p)
  process.exitCode = 1
}
