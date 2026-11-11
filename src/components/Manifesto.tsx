import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion, splitWords } from '../lib/scroll'

export default function Manifesto() {
  const rootRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const el = textRef.current
      if (!el) return
      let words = Array.from(el.querySelectorAll<HTMLElement>('.word'))
      if (words.length === 0) {
        words = splitWords(el)
        el.dataset.split = 'true'
      }
      gsap.set(words, { opacity: 0.14 })
      gsap.to(words, {
        opacity: 1,
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          end: 'bottom 52%',
          scrub: true,
        },
      })

      gsap.from('.manifesto__aside > *', {
        y: 28,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: asideRef.current,
          start: 'top 88%',
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="manifesto section" ref={rootRef}>
      <div className="section-head">
        <span className="label">No. 00 — Manifesto</span>
        <span className="label">Est. 2019</span>
      </div>

      <div className="manifesto__body">
        <p className="manifesto__text" ref={textRef}>
          Clothing should move like a second thought — present, never loud. We cut <em>fewer things,
          better</em>, from deadstock wool, organic linen and peace-silk, in small runs that let the
          fabric breathe.
        </p>

        <div className="manifesto__aside" ref={asideRef}>
          <p className="manifesto__note">
            One studio. Twelve hands. Every piece is finished by the person who cut it.
          </p>
          <dl className="stats">
            <div>
              <dt>12</dt>
              <dd>Pieces per season</dd>
            </div>
            <div>
              <dt>100%</dt>
              <dd>Natural fibre</dd>
            </div>
            <div>
              <dt>01</dt>
              <dd>Atelier, in Lisbon</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
