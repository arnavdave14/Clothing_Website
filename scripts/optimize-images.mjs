import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const srcDir = 'vibe_images'
const outDir = 'public/images'
fs.mkdirSync(outDir, { recursive: true })

const map = {
  'elan-hero': 'hero',
  'elan-coat': 'product-coat',
  'elan-dress': 'product-dress',
  'elan-trouser': 'product-trouser',
  'elan-shirt': 'product-shirt',
  'elan-look-1': 'look-1',
  'elan-look-2': 'look-2',
  'elan-look-3': 'look-3',
  'elan-featured': 'featured',
}

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.png'))
const sheet = []

for (const [key, name] of Object.entries(map)) {
  const file = files.find((f) => f.startsWith(key + '_'))
  if (!file) continue
  const src = path.join(srcDir, file)
  const width = key === 'elan-hero' ? 1400 : 1200
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(path.join(outDir, `${name}.webp`))
  const meta = await sharp(src).metadata()
  sheet.push({ name, file: src, w: meta.width, h: meta.height })
}

const cellW = 320
const cellH = 400
const cols = 5
const rows = Math.ceil(sheet.length / cols)
const composites = []
for (let i = 0; i < sheet.length; i++) {
  const buf = await sharp(sheet[i].file)
    .resize(cellW, cellH, { fit: 'cover' })
    .png()
    .toBuffer()
  composites.push({
    input: buf,
    left: (i % cols) * cellW,
    top: Math.floor(i / cols) * cellH,
  })
}
await sharp({
  create: { width: cols * cellW, height: rows * cellH, channels: 3, background: '#e9e4da' },
})
  .composite(composites)
  .png()
  .toFile('vibe_images/contact-sheet.png')

for (const s of sheet) console.log(s.name, s.w, 'x', s.h)
console.log('done')
