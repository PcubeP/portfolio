// Headless capture: enter the experience, fly to each world, screenshot.
// Uses the installed Chrome (channel: 'chrome') so no browser download.
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = 'C:/tmp/shots'
const URL = 'http://localhost:5174/'

// [label, t] — where along the flight to park the camera.
const STOPS = [
  ['identity', 0.02],
  ['creations', 0.25],
  ['pool', 0.4],
  ['tennis', 0.52],
  ['garage', 0.6875],
  ['crt', 0.75],
  ['arcade', 0.89],
  ['connect', 0.995],
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--use-angle=default', '--ignore-gpu-blocklist', '--enable-webgl', '--enable-unsafe-swiftshader'],
  })
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message))

  await page.goto(URL, { waitUntil: 'networkidle' })
  await sleep(500)
  // enter the experience (window keydown listener + buttons both call enter())
  await page.keyboard.press('Enter')
  await sleep(1000)
  // wait for the lazy WebGL canvas to mount
  await page.waitForSelector('canvas.world-canvas', { timeout: 15000 }).catch(() => {})
  await sleep(3000) // env/hdri + first worlds

  for (const [label, t] of STOPS) {
    await page.evaluate((tt) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo(0, Math.round(tt * max))
    }, t)
    // Poll the live flight parameter until the spring settles (screenshots taken
    // mid-transition park the camera between worlds and misrepresent framing).
    let last = -1
    let stableFor = 0
    for (let i = 0; i < 60; i++) {
      await sleep(250)
      const cur = await page.evaluate(() => (window.__fx ? +window.__fx.t.toFixed(4) : -1))
      if (cur >= 0 && Math.abs(cur - last) < 0.001) {
        stableFor++
        if (stableFor >= 3) break
      } else {
        stableFor = 0
      }
      last = cur
    }
    await sleep(2000) // extra beat for NearGate glTF fetch/decode
    const dbg = await page.evaluate(() => {
      const w = window
      const fx = w.__fx, cam = w.__cam
      if (!fx || !cam) return null
      return { t: +fx.t.toFixed(3), pos: [cam.position.x, cam.position.y, cam.position.z].map((n) => +n.toFixed(1)) }
    })
    await page.screenshot({ path: `${OUT}/${label}.png` })
    console.log('shot', label, 't=' + t, dbg ? `fx.t=${dbg.t} cam=[${dbg.pos}]` : '(no dbg)')
  }

  await browser.close()
  if (errors.length) {
    console.log('\n=== PAGE ERRORS (' + errors.length + ') ===')
    for (const e of [...new Set(errors)].slice(0, 30)) console.log('-', e)
  } else {
    console.log('\nno page errors')
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
