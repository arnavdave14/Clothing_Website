import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gsap } from '../lib/gsap'
import { getLenis, prefersReducedMotion } from '../lib/scroll'
import { looks } from '../data'

export default function Lookbook() {
  const rootRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.lookbook__title .display-line > span', {
        yPercent: 112,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.09,
        scrollTrigger: { trigger: '.lookbook__title', start: 'top 88%' },
      })

      gsap.utils.toArray<HTMLElement>('.look').forEach((figure) => {
        const media = figure.querySelector('.look__media')
        const parallax = figure.querySelector('.look__parallax')
        if (media) {
          gsap.fromTo(
            media,
            { clipPath: 'inset(0 0 100% 0)' },
            {
              clipPath: 'inset(0 0 0% 0)',
              duration: 1.35,
              ease: 'power4.inOut',
              scrollTrigger: { trigger: figure, start: 'top 86%' },
            },
          )
        }
        if (parallax) {
          gsap.fromTo(
            parallax,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: 'none',
              scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        }
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (active === null) return
    const lenis = getLenis()
    lenis?.stop()
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 350)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
      if (event.key === 'ArrowRight') setActive((prev) => (prev === null ? 0 : (prev + 1) % looks.length))
      if (event.key === 'ArrowLeft')
        setActive((prev) => (prev === null ? 0 : (prev - 1 + looks.length) % looks.length))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
      lenis?.start()
    }
  }, [active])

  const step = (delta: number) =>
    setActive((prev) => (prev === null ? 0 : (prev + delta + looks.length) % looks.length))

  return (
    <section className="lookbook section" id="lookbook" ref={rootRef} aria-labelledby="lookbook-title">
      <div className="section-head">
        <span className="label">No. 03 — Lookbook</span>
        <span className="label">AW26 / 35mm</span>
      </div>

      <div className="lookbook__head">
        <h2 className="display lookbook__title" id="lookbook-title">
          <span className="display-line">
            <span>Quiet</span>
          </span>
          <span className="display-line">
            <span>
              <em>geometry.</em>
            </span>
          </span>
        </h2>
        <p className="lookbook__intro">
          Three studies in drape, light and movement — photographed in a Lisbon gallery over one
          unhurried afternoon.
        </p>
      </div>

      <div className="lookbook__grid">
        {looks.map((look, i) => (
          <figure className={`look look--${['a', 'b', 'c'][i]}`} key={look.id}>
            <button
              className="look__btn"
              onClick={() => setActive(i)}
              aria-label={`View look ${i + 1}: ${look.caption}`}
            >
              <span className="look__media">
                <span className="look__parallax">
                  <img src={look.image} alt={look.alt} loading="lazy" />
                </span>
              </span>
              <span className="look__caption">
                <span>{look.caption}</span>
                <span className="look__view">View — {String(i + 1).padStart(2, '0')}</span>
              </span>
              <span className="look__location">{look.location}</span>
            </button>
          </figure>
        ))}

        <div className="lookbook__note">
          <span className="label">A note on making</span>
          <p>
            “Fabric first, form second, <em>noise never.</em>”
          </p>
          <span className="lookbook__sign">— Inês Costa, founder</span>
        </div>
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Look ${active + 1}: ${looks[active].caption}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <button className="lightbox__scrim" onClick={() => setActive(null)} aria-label="Close viewer" />
            <motion.figure
              key={looks[active].id}
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={looks[active].image} alt={looks[active].alt} />
              <figcaption>
                <span>{looks[active].caption}</span>
                <span>
                  {String(active + 1).padStart(2, '0')} / {String(looks.length).padStart(2, '0')}
                </span>
              </figcaption>
            </motion.figure>

            <button className="lightbox__nav lightbox__nav--prev" onClick={() => step(-1)} aria-label="Previous look">
              ←
            </button>
            <button className="lightbox__nav lightbox__nav--next" onClick={() => step(1)} aria-label="Next look">
              →
            </button>
            <button className="lightbox__close" onClick={() => setActive(null)} ref={closeRef} aria-label="Close viewer">
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
