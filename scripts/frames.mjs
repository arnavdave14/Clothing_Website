// Convert a film clip into scroll-scrub frames.
// Usage: node scripts/frames.mjs path/to/film.mp4 [--fps 24] [--width 1440] [--quality 74]
// Requires ffmpeg + ffprobe on PATH.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const args = process.argv.slice(2)
const input = args.find((a) => !a.startsWith('--'))
if (!input) {
  console.error('Usage: node scripts/frames.mjs path/to/film.mp4 [--fps 24] [--width 1440] [--quality 74]')
  process.exit(1)
}

const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}

const fps = flag('fps', '24')
const width = flag('width', '1440')
const quality = flag('quality', '74')
const out = 'public/frames'

const run = (cmd, cmdArgs) => {
  try {
    return execFileSync(cmd, cmdArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`${cmd} is not installed. Install ffmpeg and run this again.`)
    } else {
      console.error(`\n${cmd} failed:\n${error.stderr || error.message}`)
    }
    process.exit(1)
  }
}

run('ffmpeg', ['-version'])
run('ffprobe', ['-version'])

const probe = run('ffprobe', [
  '-v',
  'error',
  '-select_streams',
  'v:0',
  '-show_entries',
  'stream=width,height,r_frame_rate:format=duration',
  '-of',
  'json',
  input,
])
const info = JSON.parse(probe)
const duration = Number(info.format?.duration || 0)

fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })

console.log(`Extracting ${fps} fps, ${width}px wide frames from ${input} (${duration.toFixed(2)}s)...`)
run('ffmpeg', [
  '-y',
  '-i',
  input,
  '-vf',
  `fps=${fps},scale=${width}:-2:flags=lanczos`,
  '-c:v',
  'libwebp',
  '-quality',
  quality,
  '-compression_level',
  '6',
  '-an',
  `${out}/frame-%04d.webp`,
])

const files = fs.readdirSync(out).filter((f) => /^frame-\d{4}\.webp$/.test(f))
if (!files.length) {
  console.error('No frames were written. Check the input video.')
  process.exit(1)
}

const manifest = {
  count: files.length,
  fps: Number(fps),
  width: Number(width),
  source: input,
  generatedAt: new Date().toISOString(),
}
fs.writeFileSync(`${out}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Done: ${files.length} frames (~${(files.length / Number(fps)).toFixed(2)}s) + manifest.json`)
