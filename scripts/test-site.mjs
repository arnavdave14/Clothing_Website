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
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
page.on('console', (msg) => {
  if (['error', 'warning'].includes(msg.type())) logs.push(`[${msg.type()}] ${msg.text()}`)
})
page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`))

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await sleep(4200)

const info = await page.evaluate(() => ({
  scrollY,
  innerWidth,
  innerHeight,
  scrollHeight: document.body.scrollHeight,
  overflowX: document.documentElement.scrollWidth > innerWidth,
  loader: !!document.querySelector('.loader'),
  fonts: document.fonts.status,
}))
console.log('initial', info)

await page.evaluate(() => window.scrollTo(0, 0))
await sleep(900)
await page.screenshot({ path: `${OUT}/desktop-hero.png` })

const sections = ['#collection', '#featured', '#lookbook', '#atelier', '#footer']
for (const sel of sections) {
  const top = await page.evaluate((s) => {
    const el = document.querySelector(s)
    if (!el) return null
    return el.getBoundingClientRect().top + window.scrollY
  }, sel)
  if (top == null) continue
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, top + 30))
  await sleep(1400)
  const name = sel.replace('#', '')
  await page.screenshot({ path: `${OUT}/desktop-${name}.png` })
  console.log(sel, 'top', Math.round(top), 'scrollY', await page.evaluate(() => Math.round(scrollY)))
}

// horizontal scroll through the pinned collection
await page.evaluate(() => {
  const el = document.querySelector('#collection')
  if (el) window.scrollTo(0, el.offsetTop + 30)
})
await sleep(1000)
const pinHeight = await page.evaluate(() => {
  const spacer = document.querySelector('#collection')?.parentElement?.querySelector('.pin-spacer')
  return spacer ? spacer.getBoundingClientRect().height : null
})
await page.evaluate(() => window.scrollBy(0, 900))
await sleep(1000)
await page.screenshot({ path: `${OUT}/desktop-collection-2.png` })
console.log('pin spacer', pinHeight)

// menu overlay
await page.evaluate(() => window.scrollTo(0, 0))
await sleep(700)
await page.click('.site-header__menu')
await sleep(1100)
await page.screenshot({ path: `${OUT}/desktop-menu.png` })
await page.keyboard.press('Escape')
await sleep(900)

// cart drawer
await page.click('.site-header__bag')
await sleep(800)
await page.screenshot({ path: `${OUT}/desktop-cart-empty.png` })
await page.keyboard.press('Escape')
await sleep(700)

// quick add from collection
await page.evaluate(() => {
  const el = document.querySelector('#collection')
  if (el) window.scrollTo(0, el.offsetTop + 30)
})
await sleep(1200)
await page.click('.product-card__quick')
await sleep(900)
await page.screenshot({ path: `${OUT}/desktop-cart.png` })
await page.keyboard.press('Escape')
await sleep(600)

// lookbook lightbox
await page.evaluate(() => {
  const el = document.querySelector('#lookbook')
  if (el) window.scrollTo(0, el.offsetTop - 40)
})
await sleep(1400)
const lookButtons = await page.$$('.look__btn')
if (lookButtons.length) {
  await lookButtons[0].click()
  await sleep(900)
  await page.screenshot({ path: `${OUT}/desktop-lightbox.png` })
  await page.keyboard.press('Escape')
  await sleep(500)
}

console.log('console issues:', logs.length ? logs : 'none')

// mobile pass
const mobile = await browser.newPage()
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await mobile.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await sleep(4200)
await mobile.evaluate(() => window.scrollTo(0, 0))
await sleep(800)
await mobile.screenshot({ path: `${OUT}/mobile-hero.png` })
const mobileInfo = await mobile.evaluate(() => ({
  scrollY,
  overflowX: document.documentElement.scrollWidth > innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth,
}))
console.log('mobile', mobileInfo)

for (const [sel, name] of [
  ['#collection', 'collection'],
  ['#featured', 'featured'],
  ['#lookbook', 'lookbook'],
  ['#footer', 'footer'],
]) {
  const top = await mobile.evaluate((s) => {
    const el = document.querySelector(s)
    return el ? el.getBoundingClientRect().top + window.scrollY : null
  }, sel)
  if (top == null) continue
  await mobile.evaluate((y) => window.scrollTo(0, y + 20), top)
  await sleep(1200)
  await mobile.screenshot({ path: `${OUT}/mobile-${name}.png` })
}

await mobile.evaluate(() => window.scrollTo(0, 0))
await sleep(500)
await mobile.click('.site-header__menu')
await sleep(1000)
await mobile.screenshot({ path: `${OUT}/mobile-menu.png` })

await browser.close()
