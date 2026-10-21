// @ts-nocheck
/**
 * fetch-assets.mjs — one-time CC0 / license-clean asset downloader.
 *
 *   node scripts/fetch-assets.mjs
 *
 * Pulls real PBR textures + HDRIs (Poly Haven, CC0) and display/graffiti fonts
 * (Google Fonts, OFL / Apache-2.0) into public/assets/, then writes CREDITS.md
 * with the source URL + license for every file. Textures are resolved through
 * the Poly Haven files API so we download exactly the maps each asset ships
 * (prefer the packed `arm` = AO/Rough/Metal; fall back to separate rough/ao).
 *
 * RESOLUTION TIERS (for photorealism up close):
 *   - Hero surfaces the drone flies close to (floors/near-walls) → 4K diff/nor/arm
 *     + a 4K Displacement map (disp.jpg) for real relief on subdivided geometry.
 *   - Props / smaller surfaces → 2K.
 *   - Every set also gets a 2K `diff_low.jpg` for the lowFi (mobile/reduced) path,
 *     so phones never fetch the 4K albedo.
 *   - HDRIs: 2K neutral studio + 4K warm autoshop. Models: 4K hero (car/tv), 2K props.
 * All jpg/hdr — mipmap-friendly, no draco/ktx runtime decoders.
 *
 * Idempotent: existing files are skipped, so re-runs are cheap. To force a
 * resolution upgrade, delete the target folder first (old files would be kept).
 */
import { mkdir, writeFile, stat, appendFile, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'assets')
const PH_API = 'https://api.polyhaven.com/files'
const PH_HDRI = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr'
const GF = 'https://raw.githubusercontent.com/google/fonts/main'

const LOW_RES = '2k' // lowFi diffuse-only variant resolution (diff_low.jpg)

// ── Manifest ────────────────────────────────────────────────────────────────
// Poly Haven texture asset ids → { id, folder, res, disp }. Each becomes
// textures/<folder>/{diff,nor,arm}.jpg (+ disp.jpg when `disp`) + diff_low.jpg.
// All CC0. Hero surfaces the camera flies close to pull 4K + displacement;
// props/accents stay 2K.
const TEXTURES = [
  { id: 'concrete_floor_02', folder: 'concrete', res: '4k', disp: true },  // garage / gallery / connect / arcade floors
  { id: 'wood_planks', folder: 'wood', res: '4k', disp: true },            // CRT floor / easel / desk / crates
  { id: 'baseball_playground', folder: 'clay', res: '4k', disp: true },    // tennis clay court
  { id: 'blue_floor_tiles_01', folder: 'pooltile', res: '4k', disp: true },// pool floor + walls
  { id: 'asphalt_02', folder: 'asphalt', res: '4k', disp: true },          // journey road
  { id: 'corrugated_iron_02', folder: 'corrugated', res: '4k', disp: false },// warehouse walls + roof
  { id: 'painted_metal_shutter', folder: 'shutter', res: '4k', disp: false },// garage roller door
  { id: 'metal_plate', folder: 'metal', res: '2k', disp: false },          // casings, cabinets, posts, props
  { id: 'rusty_metal_02', folder: 'rusty', res: '2k', disp: false },       // BBQ body / weathered accents
  { id: 'rubber_tiles', folder: 'rubber', res: '2k', disp: false },        // tires / lane ropes
]

// Poly Haven MODELS (CC0, photoscanned glTF + baked PBR) → [slug, folder, res].
// Multi-file glTF: a .gltf + a .bin + a textures/ folder, downloaded intact so
// three's GLTFLoader resolves the relative URIs. This is what actually kills the
// "primitive box" look — real geometry with real baked detail. Hero props (the
// car + TV the camera flies into) pull 4K baked textures; the rest stay 2K.
const MODELS = [
  ['covered_car', 'car', '4k'],               // garage hero (photoscan under a cover)
  ['Television_01', 'tv', '4k'],              // pop-culture CRT set
  ['portable_welding_cart', 'weldingcart', '2k'],
  ['metal_tool_chest', 'toolchest', '2k'],
  ['wooden_crate_01', 'crate', '2k'],
  ['old_military_crate', 'militarycrate', '2k'],
  ['spray_paint_bottles', 'spraycans', '2k'], // artwork zone
  ['hanging_industrial_lamp', 'shoplamp', '2k'],
  ['barrel_stove', 'stove', '2k'],            // food / BBQ zone
  ['potted_plant_01', 'plant', '2k'],         // greenery for life
  ['gaming_console', 'gameconsole', '2k'],    // arcade
  ['boombox', 'boombox', '2k'],               // arcade / music
  ['WoodenTable_01', 'table', '2k'],          // connect desk
  ['modern_arm_chair_01', 'armchair', '2k'],  // connect
  ['desk_lamp_arm_01', 'desklamp', '2k'],     // connect
  ['Camera_01', 'camera', '2k'],              // videography prop
  ['metal_stool_01', 'stool', '2k'],
  ['cardboard_box_01', 'cardboardbox', '2k'],
]

// Poly Haven HDRIs (CC0) → [id, name, res] .hdr for image-based lighting.
const HDRIS = [
  ['studio_small_08', 'studio', '2k'],     // neutral global IBL
  ['autoshop_01', 'autoshop', '4k'],       // warm garage / car reflections
]

// Google Fonts static .ttf (troika needs ttf/otf, not woff2).
const FONTS = [
  ['ofl/chakrapetch/ChakraPetch-Regular.ttf', 'display.ttf', 'Chakra Petch', 'OFL-1.1'],
  ['ofl/rubikspraypaint/RubikSprayPaint-Regular.ttf', 'graffiti.ttf', 'Rubik Spray Paint', 'OFL-1.1'],
  ['apache/permanentmarker/PermanentMarker-Regular.ttf', 'marker.ttf', 'Permanent Marker', 'Apache-2.0'],
]

// ── Helpers ───────────────────────────────────────────────────────────────
const credits = []

async function exists(p) {
  try { const s = await stat(p); return s.size > 0 } catch { return false }
}

async function download(url, dest, { retries = 3, timeout = 90000 } = {}) {
  if (await exists(dest)) { console.log('  skip (exists)', dest.replace(OUT, 'assets')); return true }
  await mkdir(dirname(dest), { recursive: true })
  for (let attempt = 1; attempt <= retries; attempt++) {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), timeout)
    try {
      const res = await fetch(url, { signal: ac.signal, redirect: 'follow' })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 256) throw new Error(`suspiciously small (${buf.length}b)`)
      await writeFile(dest, buf)
      console.log(`  ok  ${(buf.length / 1024).toFixed(0).padStart(6)}KB  ${dest.replace(OUT, 'assets')}`)
      return true
    } catch (e) {
      clearTimeout(timer)
      console.warn(`  retry ${attempt}/${retries} (${e.message}) ${url}`)
      await rm(dest, { force: true })
      if (attempt === retries) { console.error(`  FAILED ${url}`); return false }
      await new Promise((r) => setTimeout(r, 1500 * attempt))
    }
  }
  return false
}

function pickJpg(node, res = '1k') {
  if (!node) return null
  // Strict: use exactly the requested res. Only fall back (with a warning) if
  // that tier is genuinely absent — silent downgrades were the original bug.
  let r = node[res]
  if (!r) {
    const avail = Object.keys(node).filter((k) => /^\d+k$/.test(k))
    const alt = res === LOW_RES ? '1k' : avail.sort((a, b) => parseInt(b) - parseInt(a))[0]
    if (alt && node[alt]) {
      console.warn(`    ! ${res} missing, using ${alt}`)
      r = node[alt]
    }
  }
  return r && r.jpg && r.jpg.url
}

async function fetchTexture({ id, folder, res = '2k', disp = false }) {
  console.log(`texture: ${id} → ${folder} (${res}${disp ? ' +disp' : ''})`)
  const r = await fetch(`${PH_API}/${id}`)
  if (!r.ok) { console.error(`  API ${r.status} for ${id}`); return }
  const j = await r.json()
  const jobs = []
  const diff = pickJpg(j.Diffuse, res)
  const nor = pickJpg(j.nor_gl, res)
  const arm = pickJpg(j.arm, res)
  if (diff) jobs.push([diff, join(OUT, 'textures', folder, 'diff.jpg')])
  if (nor) jobs.push([nor, join(OUT, 'textures', folder, 'nor.jpg')])
  if (arm) {
    jobs.push([arm, join(OUT, 'textures', folder, 'arm.jpg')])
  } else {
    const rough = pickJpg(j.Rough, res)
    const ao = pickJpg(j.AO, res)
    if (rough) jobs.push([rough, join(OUT, 'textures', folder, 'rough.jpg')])
    if (ao) jobs.push([ao, join(OUT, 'textures', folder, 'ao.jpg')])
  }
  // real surface relief for the hero floors that get subdivided geometry
  if (disp) {
    const d = pickJpg(j.Displacement, res)
    if (d) jobs.push([d, join(OUT, 'textures', folder, 'disp.jpg')])
    else console.warn(`    ! no Displacement for ${id}`)
  }
  // lightweight diffuse for the lowFi (mobile/reduced) path
  const low = pickJpg(j.Diffuse, LOW_RES)
  if (low) jobs.push([low, join(OUT, 'textures', folder, 'diff_low.jpg')])
  for (const [url, dest] of jobs) await download(url, dest)
  credits.push(`- **textures/${folder}/** — Poly Haven \`${id}\` (${res}) — https://polyhaven.com/a/${id} — CC0`)
}

// Download a multi-file glTF model: the .gltf, its .bin, and every texture in
// the API's `include` map, preserving the relative paths the .gltf references.
async function fetchModel([slug, folder, res = '1k']) {
  console.log(`model: ${slug} → ${folder} (${res})`)
  const r = await fetch(`${PH_API}/${slug}`)
  if (!r.ok) { console.error(`  API ${r.status} for ${slug}`); return }
  const j = await r.json()
  const node = j.gltf && (j.gltf[res] || j.gltf['1k'] || j.gltf['2k'])
  const entry = node && node.gltf
  if (!entry || !entry.url) { console.error(`  no gltf for ${slug}`); return }
  const dir = join(OUT, 'models', folder)
  // the .gltf itself (name is arbitrary — internal URIs are relative)
  await download(entry.url, join(dir, 'model.gltf'))
  // its .bin + textures, keyed by the exact relative path the .gltf expects
  for (const [rel, val] of Object.entries(entry.include || {})) {
    const url = typeof val === 'object' ? val.url : val
    if (url) await download(url, join(dir, rel))
  }
  credits.push(`- **models/${folder}/** — Poly Haven \`${slug}\` — https://polyhaven.com/a/${slug} — CC0`)
}

async function main() {
  console.log('== textures ==')
  for (const t of TEXTURES) await fetchTexture(t)

  console.log('== models ==')
  for (const m of MODELS) await fetchModel(m)

  console.log('== hdri ==')
  for (const [id, name, res] of HDRIS) {
    await download(`${PH_HDRI}/${res}/${id}_${res}.hdr`, join(OUT, 'hdri', `${name}.hdr`))
    credits.push(`- **hdri/${name}.hdr** — Poly Haven \`${id}\` (${res}) — https://polyhaven.com/a/${id} — CC0`)
  }

  console.log('== fonts ==')
  for (const [path, local, name, lic] of FONTS) {
    await download(`${GF}/${path}`, join(OUT, 'fonts', local))
    credits.push(`- **fonts/${local}** — ${name} (Google Fonts) — https://github.com/google/fonts/tree/main/${dirname(path)} — ${lic}`)
  }

  const md =
    '# Asset credits\n\n' +
    'All assets below are license-clean (CC0 / OFL-1.1 / Apache-2.0) and were\n' +
    'downloaded by `scripts/fetch-assets.mjs`. No copyrighted or trademarked assets.\n\n' +
    credits.join('\n') + '\n'
  await mkdir(OUT, { recursive: true })
  await writeFile(join(OUT, 'CREDITS.md'), md)
  console.log('\nwrote', join(OUT, 'CREDITS.md'))
  console.log('done.')
}

main().catch((e) => { console.error(e); process.exit(1) })
