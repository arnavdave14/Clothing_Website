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
function watch(page) {
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) logs.push(`[${msg.type()}] ${msg.text()}`)
  })
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`))
}

const jump = (page, y) => page.evaluate((v) => window.scrollTo(0, v), y)
const topOf = (page, sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s)
    return el ? el.getBoundingClientRect().top + window.scrollY : null
  }, sel)

// ---------- desktop interactions ----------
const page = await browser.newPage()
watch(page)
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await sleep(4200)
console.log('desktop initial scrollY', await page.evaluate(() => window.scrollY))

// scroll restoration: scroll down, reload, should start at 0
await jump(page, 1400)
await sleep(700)
await page.reload({ waitUntil: 'networkidle0' })
await sleep(4200)
console.log('after reload scrollY', await page.evaluate(() => window.scrollY))

// featured interactions
await jump(page, await topOf(page, '#featured'))
await sleep(1400)
await page.screenshot({ path: `${OUT}/v-desktop-featured.png` })

const beforeCount = await page.$eval('.site-header__count', (el) => el.textContent?.trim())
await page.click('.swatches .swatch:nth-child(3)')
await sleep(350)
await page.click('.sizes .size:nth-child(3)')
await sleep(350)
await page.click('.btn-add')
await sleep(700)
const addLabel = await page.$eval('.btn-add', (el) => el.textContent?.trim())
const bagCount = await page.$eval('.site-header__count', (el) => el.textContent?.trim())
console.log('add to bag:', { beforeCount, addLabel, bagCount })

const acc = await page.$('.accordion__trigger')
if (acc) {
  await acc.click()
  await sleep(600)
  console.log(
    'accordion expanded:',
    await page.$eval('.accordion__trigger', (el) => el.getAttribute('aria-expanded')),
    'body:',
    await page.$$eval('.accordion__body', (els) => els.length),
  )
  await page.screenshot({ path: `${OUT}/v-desktop-accordion.png` })
}

// cart drawer interactions
await page.evaluate(() => document.querySelector('.site-header__bag')?.click())
await sleep(800)
const totalBefore = await page.$eval('.cart__total span:last-child', (el) => el.textContent?.trim())
await page.click('.qty button[aria-label="Increase quantity"]')
await sleep(500)
const totalAfter = await page.$eval('.cart__total span:last-child', (el) => el.textContent?.trim())
console.log('cart total:', { totalBefore, totalAfter })
const inertWhenCart = await page.$eval('.page', (el) => el.hasAttribute('inert'))
console.log('page inert while cart open:', inertWhenCart)
await page.screenshot({ path: `${OUT}/v-desktop-cart-item.png` })
await page.keyboard.press('Escape')
await sleep(700)
const focusAfterClose = await page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName)
console.log('focus after cart close:', focusAfterClose)

// footer bottom + newsletter
await jump(page, await page.evaluate(() => document.body.scrollHeight))
await sleep(1400)
await page.screenshot({ path: `${OUT}/v-desktop-footer-bottom.png` })
await jump(page, await topOf(page, '#newsletter'))
await sleep(1200)
await page.type('#newsletter-email', 'studio@example.com')
await page.click('.newsletter button[type="submit"]')
await sleep(800)
const success = await page.$eval('.newsletter__success', (el) => el.textContent?.trim())
console.log('newsletter success:', success)
await page.screenshot({ path: `${OUT}/v-desktop-newsletter.png` })

// full lookbook section
await jump(page, await topOf(page, '#lookbook'))
await sleep(1600)
const look = await page.$('#lookbook')
if (look) await look.screenshot({ path: `${OUT}/v-desktop-lookbook-full.png` })

// menu focus + inert
await jump(page, 0)
await sleep(900)
await page.click('.site-header__menu')
await sleep(1000)
console.log(
  'menu: page inert',
  await page.$eval('.page', (el) => el.hasAttribute('inert')),
  'dialog role',
  await page.$eval('.menu', (el) => el.getAttribute('role')),
)
await page.keyboard.press('Escape')
await sleep(700)

// ---------- intermediate breakpoints ----------
for (const [w, h, name] of [
  [1280, 800, '1280'],
  [1024, 768, '1024'],
  [768, 1024, '768'],
]) {
  const p = await browser.newPage()
  watch(p)
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await p.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
  await sleep(4200)
  const info = await p.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth > innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth,
  }))
  await p.screenshot({ path: `${OUT}/v-${name}-hero.png` })
  await jump(p, await topOf(p, '#collection'))
  await sleep(1500)
  await p.screenshot({ path: `${OUT}/v-${name}-collection.png` })
  await jump(p, await topOf(p, '#featured'))
  await sleep(1400)
  await p.screenshot({ path: `${OUT}/v-${name}-featured.png` })
  console.log(name, info)
  await p.close()
}

// ---------- mobile ----------
const mobile = await browser.newPage()
watch(mobile)
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await mobile.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await sleep(4200)
console.log('mobile initial scrollY', await mobile.evaluate(() => window.scrollY))
await jump(mobile, await topOf(mobile, '#collection'))
await sleep(1400)
await mobile.screenshot({ path: `${OUT}/v-mobile-collection.png` })
const cap = await mobile.evaluate(() => {
  const card = document.querySelector('.product-card')
  const cap = document.querySelector('.product-card__text h3')
  if (!card || !cap) return null
  return {
    cardLeft: Math.round(card.getBoundingClientRect().left),
    capLeft: Math.round(cap.getBoundingClientRect().left),
    scrollPadding: getComputedStyle(document.querySelector('.collection__viewport')).scrollPaddingInline,
  }
})
console.log('mobile collection geometry', cap)
await mobile.evaluate(() => {
  const v = document.querySelector('.collection__viewport')
  if (v) v.scrollTo({ left: v.scrollWidth, behavior: 'instant' })
})
await sleep(600)
await mobile.screenshot({ path: `${OUT}/v-mobile-collection-end.png` })

// ---------- reduced motion ----------
const rm = await browser.newPage()
watch(rm)
await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await rm.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await rm.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await sleep(1500)
const rmInfo = await rm.evaluate(() => ({
  loader: !!document.querySelector('.loader'),
  scrollY: window.scrollY,
  heroVisible: !!document.querySelector('.hero'),
  bodyOverflow: getComputedStyle(document.body).overflow,
}))
await rm.screenshot({ path: `${OUT}/v-reduced-motion.png` })
await jump(rm, await topOf(rm, '#featured'))
await sleep(900)
await rm.screenshot({ path: `${OUT}/v-reduced-motion-featured.png` })
const rmInView = await rm.$eval('.featured__name', (el) => {
  const r = el.getBoundingClientRect()
  return r.top >= 0 && r.top < innerHeight && getComputedStyle(el).opacity
})
console.log('reduced motion', rmInfo, 'featured title', rmInView)

console.log('console issues:', logs.length ? logs : 'none')
await browser.close()
