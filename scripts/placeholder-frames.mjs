import sharp from 'sharp'
import fs from 'node:fs/promises'

const W = 1440
const H = 810
const COUNT = 96
const FPS = 24
const OUT = 'public/frames'

const segments = [
  { src: 'public/images/look-2.webp', zoomFrom: 1, zoomTo: 1.07, driftX: -14, driftY: -6 },
  { src: 'public/images/look-3.webp', zoomFrom: 1.04, zoomTo: 1, driftX: 10, driftY: 4 },
  { src: 'public/images/look-1.webp', zoomFrom: 1, zoomTo: 1.08, driftX: -8, driftY: -10 },
]

const sources = await Promise.all(segments.map((s) => fs.readFile(s.src)))
const FADE = 8 / COUNT

const render = async (index, local) => {
  const seg = segments[index]
  const src = sources[index]
  const zoom = seg.zoomFrom + (seg.zoomTo - seg.zoomFrom) * local
  const rw = Math.round(W * zoom)
  const rh = Math.round(H * zoom)
  const base = await sharp(src)
    .resize({ width: rw, height: rh, fit: 'cover', position: sharp.strategy.attention })
    .toBuffer()
  const left = Math.min(rw - W, Math.max(0, Math.round((rw - W) / 2 + seg.driftX * local)))
  const top = Math.min(rh - H, Math.max(0, Math.round((rh - H) / 2 + seg.driftY * local)))
  return sharp(base)
    .extract({ left, top, width: W, height: H })
    .removeAlpha()
    .png()
    .toBuffer()
}

const smooth = (t) => t * t * (3 - 2 * t)

async function main() {
  await fs.mkdir(OUT, { recursive: true })
  const total = segments.length
  for (let i = 0; i < COUNT; i += 1) {
    const t = i / (COUNT - 1)
    const p = t * total
    const index = Math.min(total - 1, Math.floor(p))
    const local = Math.min(1, p - index)
    const base = await render(index, local)

    let frame = await sharp(base)
    if (index < total - 1) {
      const boundary = index + 1
      const dist = boundary - p
      if (dist > 0 && dist < FADE) {
        const overlay = await render(index + 1, 0)
        const alpha = smooth(1 - dist / FADE)
        const layer = await sharp(overlay).removeAlpha().ensureAlpha(alpha).png().toBuffer()
        frame = sharp(base).composite([{ input: layer }])
      }
    }

    const name = `frame-${String(i + 1).padStart(4, '0')}.webp`
    await frame.webp({ quality: 74, effort: 5 }).toFile(`${OUT}/${name}`)
    process.stdout.write(`\r${i + 1}/${COUNT}`)
  }

  const manifest = {
    count: COUNT,
    fps: FPS,
    width: W,
    height: H,
    source: 'placeholder from stills — replace with your film',
    generatedAt: new Date().toISOString(),
  }
  await fs.writeFile(`${OUT}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`\nWrote ${COUNT} frames + manifest to ${OUT}`)
}

main()
