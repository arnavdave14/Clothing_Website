import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = 'http://127.0.0.1:5173/'
const OUT = 'shots'
fs.mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
})

const logs = []
const failed = []
function watch(page) {
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) logs.push(`[${msg.type()}] ${msg.text()}`)
  })
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`))
  page.on('requestfailed', (req) => failed.push(req.url()))
}

const page = await browser.newPage()
watch(page)
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await sleep(4200)

const geometry = await page.evaluate(() => {
  const film = document.querySelector('#film')
  if (!film) return null
  const rect = film.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    height: rect.height,
    viewport: innerHeight,
    rail: !!document.querySelector('.section-rail'),
    headerLinks: [...document.querySelectorAll('.site-header__nav a')].map((a) => a.textContent?.trim()),
  }
})
console.log('film geometry', geometry)

const scrollFor = (p) => geometry.top + (geometry.height - geometry.viewport) * p

const sample = async () =>
  page.evaluate(() => {
    const canvas = document.querySelector('.sequence__canvas')
    if (!(canvas instanceof HTMLCanvasElement) || !canvas.width) return null
    const ctx = canvas.getContext('2d')
    const points = [
      [canvas.width * 0.3, canvas.height * 0.55],
      [canvas.width * 0.5, canvas.height * 0.5],
      [canvas.width * 0.7, canvas.height * 0.4],
    ]
    return points.map(([x, y]) => [...ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data])
  })

const chapters = () =>
  page.$$eval('.sequence__chapter', (els) =>
    els.map((el) => ({
      title: el.querySelector('h3')?.textContent,
      opacity: Number(getComputedStyle(el).opacity).toFixed(2),
      visibility: getComputedStyle(el).visibility,
    })),
  )

for (const p of [0.02, 0.18, 0.4, 0.62, 0.86, 0.98]) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollFor(p))
  await sleep(1100)
  const snapped = await page.evaluate(() => Math.round(window.scrollY))
  console.log(`p=${p} scroll=${snapped}`, await sample(), await chapters())
  await page.screenshot({ path: `${OUT}/film-${String(p).replace('.', '')}.png` })
}

// wait for full preload
await sleep(2500)
console.log(
  'sequence state',
  await page.evaluate(() => ({
    loaded: document.querySelector('#film')?.classList.contains('is-loaded'),
    playing: document.querySelector('#film')?.classList.contains('is-playing'),
    loadLabel: document.querySelector('.sequence__load')?.textContent,
    manifest: performance.getEntriesByType('resource').filter((r) => r.name.includes('/frames/')).length,
  })),
)

// rail active state while on film
console.log('rail active', await page.$$eval('.section-rail__link.is-active', (els) => els.map((e) => e.textContent?.trim())))

// menu link count
await page.evaluate(() => window.scrollTo(0, 0))
await sleep(900)
await page.evaluate(() => document.querySelector('.site-header__menu')?.click())
await sleep(1000)
console.log('menu links', await page.$$eval('.menu__link .menu__label', (els) => els.map((e) => e.textContent)))
await page.screenshot({ path: `${OUT}/film-menu.png` })
await page.keyboard.press('Escape')
await sleep(600)

// intermediate width regression
for (const [w, h, name] of [
  [1280, 800, '1280'],
  [1024, 768, '1024'],
]) {
  const p = await browser.newPage()
  watch(p)
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await p.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
  await sleep(4200)
  const top = await p.evaluate(() => {
    const el = document.querySelector('#film')
    return el ? el.getBoundingClientRect().top + window.scrollY : 0
  })
  await p.evaluate((y) => window.scrollTo(0, y + 300), top)
  await sleep(1800)
  await p.screenshot({ path: `${OUT}/film-${name}.png` })
  console.log(name, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
  await p.close()
}

// mobile
const mobile = await browser.newPage()
watch(mobile)
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await mobile.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await sleep(4200)
const mGeo = await mobile.evaluate(() => {
  const el = document.querySelector('#film')
  const rect = el.getBoundingClientRect()
  return { top: rect.top + window.scrollY, height: rect.height, viewport: innerHeight }
})
for (const p of [0.1, 0.45, 0.8]) {
  await mobile.evaluate((y) => window.scrollTo(0, y), mGeo.top + (mGeo.height - mGeo.viewport) * p)
  await sleep(1200)
  await mobile.screenshot({ path: `${OUT}/film-mobile-${String(p).replace('.', '')}.png` })
}
console.log(
  'mobile',
  mGeo,
  'overflow',
  await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  'rail',
  await mobile.$eval('.section-rail', (el) => getComputedStyle(el).display).catch(() => 'missing'),
)

// reduced motion
const rm = await browser.newPage()
watch(rm)
await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await rm.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await rm.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await sleep(1600)
await rm.evaluate(() => {
  const el = document.querySelector('#film')
  if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
})
await sleep(1200)
console.log(
  'reduced motion film',
  await rm.evaluate(() => ({
    height: document.querySelector('#film')?.getBoundingClientRect().height,
    scrollY,
    static: document.querySelector('#film')?.classList.contains('sequence--static'),
    chapters: [...document.querySelectorAll('.sequence__chapter')].map((el) => ({
      opacity: getComputedStyle(el).opacity,
      top: Math.round(el.getBoundingClientRect().top),
      bottom: Math.round(el.getBoundingClientRect().bottom),
    })),
    overflow: document.documentElement.scrollWidth > innerWidth,
  })),
)
await rm.screenshot({ path: `${OUT}/film-reduced-motion.png` })

console.log('console issues:', logs.length ? logs : 'none')
console.log('failed requests:', failed.length ? [...new Set(failed)] : 'none')
await browser.close()
