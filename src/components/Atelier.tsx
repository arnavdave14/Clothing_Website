import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/scroll'
import Ticker from './Ticker'

const steps = [
  {
    num: '01',
    title: 'Source slowly',
    body: 'Deadstock wool from Biella, organic linen from Normandy. We buy what already exists and let the material decide the shape.',
  },
  {
    num: '02',
    title: 'Cut by hand',
    body: 'Patterns are drafted on paper, toiled, and re-cut until the shoulder sits like it has always been there.',
  },
  {
    num: '03',
    title: 'Finish together',
    body: 'Each piece passes through one pair of hands from first stitch to final press — and returns to us for repairs, for years.',
  },
]

export default function Atelier() {
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.atelier__title .display-line > span', {
        yPercent: 112,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.atelier__title', start: 'top 84%' },
      })

      gsap.from('.atelier__intro p', {
        y: 26,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.atelier__intro p', start: 'top 88%' },
      })

      gsap.from('.steps li', {
        y: 34,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.steps', start: 'top 84%' },
      })

      gsap.from('.atelier__quote p', {
        yPercent: 35,
        autoAlpha: 0,
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.atelier__quote', start: 'top 88%' },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="atelier" id="atelier" ref={rootRef} aria-labelledby="atelier-title">
      <div className="atelier__inner">
        <div className="section-head">
          <span className="label">No. 04 — Atelier</span>
          <span className="label">Lisbon — 38.7°N</span>
        </div>

        <div className="atelier__grid">
          <div className="atelier__intro">
            <h2 className="display atelier__title" id="atelier-title">
              <span className="display-line">
                <span>Fewer pieces.</span>
              </span>
              <span className="display-line">
                <span>
                  <em>Better made.</em>
                </span>
              </span>
            </h2>
            <p>
              We release one small collection a year, then spend the rest of it listening — to wear,
              to repair notes, to the way a coat falls after a winter. Twelve hands, one room, no
              seasons to chase.
            </p>
          </div>

          <ol className="steps">
            {steps.map((step) => (
              <li key={step.num}>
                <span className="step__num">{step.num}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="atelier__quote">
          <p>
            “We make clothes for the years, <em>not the season.</em>”
          </p>
        </div>
      </div>

      <Ticker dark items={['Small runs', 'Deadstock wool', 'Hand-finished', 'Free repairs', 'Lisbon made']} />
    </section>
  )
}
