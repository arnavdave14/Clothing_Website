import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/scroll'

const DEFAULT_FRAMES = 96
const framePath = (index: number) => `/frames/frame-${String(index).padStart(4, '0')}.webp`

const chapters = [
  {
    index: '01',
    title: 'Cloth in motion',
    copy: 'Ivory silk, caught between two steps. The fabric leads; the body follows.',
  },
  {
    index: '02',
    title: 'The finished hand',
    copy: 'Double-faced wool, hand-finished in Lisbon. A cuff, a seam, an hour of quiet work.',
  },
  {
    index: '03',
    title: 'One long afternoon',
    copy: 'Two figures in a sunlit room. Stillness, held in the cut of a coat.',
  },
]

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })

export default function Sequence() {
  const rootRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const posterRef = useRef<HTMLImageElement>(null)
  const loadRef = useRef<HTMLSpanElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const chapterRefs = useRef<Array<HTMLDivElement | null>>([])
  const staticMode = useRef(prefersReducedMotion()).current
  const [status, setStatus] = useState<'loading' | 'frames' | 'poster'>(staticMode ? 'poster' : 'loading')

  useEffect(() => {
    if (staticMode) return
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    let disposed = false
    let started = false
    let total = DEFAULT_FRAMES
    let chapter = 0
    const frames: Array<HTMLImageElement | undefined> = []
    const progressRef = { current: 0 }

    const pick = (index: number) => {
      for (let i = Math.min(index, total - 1); i >= 0; i -= 1) {
        if (frames[i]) return frames[i]
      }
      return frames.find(Boolean)
    }

    const draw = (progress = 0) => {
      const image = pick(Math.round(progress * (total - 1)))
      if (!image) return
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const width = Math.round(rect.width * dpr)
      const height = Math.round(rect.height * dpr)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const scale = Math.max(width / image.width, height / image.height)
      const drawWidth = image.width * scale
      const drawHeight = image.height * scale
      ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
    }

    const start = async () => {
      if (started || disposed) return
      started = true

      let count = DEFAULT_FRAMES
      try {
        const response = await fetch('/frames/manifest.json', { cache: 'no-store' })
        if (response.ok) {
          const manifest = (await response.json()) as { count?: number }
          if (manifest.count) count = Math.max(2, Math.min(600, Math.floor(manifest.count)))
        }
      } catch {
        /* no manifest — try the default frame set */
      }
      if (disposed) return

      total = count
      const first = await loadImage(framePath(1))
      if (disposed) return
      if (!first) {
        setStatus('poster')
        root.classList.add('is-loaded')
        return
      }

      frames[0] = first
      setStatus('frames')
      requestAnimationFrame(() => draw(progressRef.current))

      let next = 2
      let done = 1
      const worker = async () => {
        while (next <= total && !disposed) {
          const index = next
          next += 1
          const image = await loadImage(framePath(index))
          if (disposed) return
          if (image) frames[index - 1] = image
          done += 1
          if (loadRef.current && done % 2 === 0) {
            loadRef.current.textContent = `Loading film ${Math.round((done / total) * 100)}%`
          }
          if (image) draw(progressRef.current)
        }
      }
      await Promise.all(Array.from({ length: 6 }, worker))
      if (disposed) return
      root.classList.add('is-loaded')
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer?.disconnect()
          void start()
        }
      },
      { rootMargin: '120% 0px' },
    )
    observer.observe(root)

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progressRef.current = self.progress
        root.style.setProperty('--film-p', self.progress.toFixed(4))
        const nextChapter = Math.min(chapters.length, Math.floor(self.progress * chapters.length) + 1)
        if (nextChapter !== chapter) {
          chapter = nextChapter
          if (counterRef.current) counterRef.current.textContent = String(chapter).padStart(2, '0')
        }
        if (posterRef.current) {
          posterRef.current.style.transform = `translate3d(0, ${(-3 + self.progress * 6).toFixed(2)}%, 0) scale(${(1.06 - self.progress * 0.06).toFixed(3)})`
        }
        draw(self.progress)
      },
    })

    const context = gsap.context(() => {
      const blocks = chapterRefs.current.filter((el): el is HTMLDivElement => Boolean(el))
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
      })
      blocks.forEach((el, i) => {
        const enter = 0.04 + i * 0.33
        const leave = enter + 0.27
        timeline.fromTo(
          el,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' },
          enter,
        )
        if (i < blocks.length - 1) {
          timeline.to(el, { autoAlpha: 0, y: -26, duration: 0.07, ease: 'power2.in' }, leave)
        }
      })
      if (wordRef.current) {
        timeline.fromTo(wordRef.current, { xPercent: -4 }, { xPercent: 4, duration: 1, ease: 'none' }, 0)
      }
    }, root)

    const onResize = () => draw(progressRef.current)
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      observer.disconnect()
      trigger.kill()
      context.revert()
      window.removeEventListener('resize', onResize)
    }
  }, [staticMode])

  return (
    <section
      className={`sequence${status === 'frames' ? ' is-playing' : ''}${staticMode ? ' sequence--static' : ''}`}
      id="film"
      ref={rootRef}
      aria-labelledby="film-title"
    >
      <div className="sequence__sticky">
        <img
          className="sequence__poster"
          ref={posterRef}
          src="/images/look-2.webp"
          alt=""
          aria-hidden="true"
        />
        <canvas className="sequence__canvas" ref={canvasRef} aria-hidden="true" />
        <div className="sequence__scrim" aria-hidden="true" />

        <div className="sequence__head">
          <span className="label">Interlude — AW26</span>
          <span className="label sequence__note">Sound off · Shot on 35mm</span>
        </div>

        <h2 className="sr-only" id="film-title">
          The film — cloth in motion
        </h2>
        <p className="sr-only">
          A short studio film in three movements: ivory silk in motion, the finished hand of a wool
          coat, and two figures in an afternoon of Lisbon light.
        </p>

        <div className="sequence__word" aria-hidden="true">
          <span ref={wordRef}>MOUVEMENT</span>
        </div>

        <div className="sequence__chapters">
          {chapters.map((chapter, index) => (
            <div
              className="sequence__chapter"
              key={chapter.index}
              ref={(element) => {
                chapterRefs.current[index] = element
              }}
            >
              <span className="sequence__chapter-index label">{chapter.index}</span>
              <h3 className="sequence__chapter-title">{chapter.title}</h3>
              <p className="sequence__chapter-copy">{chapter.copy}</p>
            </div>
          ))}
        </div>

        <span className="sequence__load label" ref={loadRef}>
          Loading film 00%
        </span>

        <div className="sequence__foot">
          <span className="label">Scroll to play</span>
          <div className="sequence__meter" aria-hidden="true">
            <i />
          </div>
          <span className="label sequence__count">
            <span ref={counterRef}>01</span> / 03
          </span>
        </div>
      </div>
    </section>
  )
}
