import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion, scrollToSection } from '../lib/scroll'

type HeroProps = {
  ready: boolean
}

export default function Hero({ ready }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!ready || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      tl.fromTo('.hero__line > span', { yPercent: 118 }, { yPercent: 0, duration: 1.15, stagger: 0.09 }, 0.05)
        .fromTo('.hero__eyebrow > *', { yPercent: 120, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08 }, 0.1)
        .fromTo('.hero__lede', { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.55)
        .fromTo('.circle-cta', { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.6)' }, 0.62)
        .fromTo('.hero__meta > *', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08 }, 0.72)
        .fromTo('.hero__media', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.25, ease: 'power4.inOut' }, 0.15)
        .fromTo('.hero__img', { scale: 1.16 }, { scale: 1, duration: 1.7, ease: 'power2.out' }, 0.15)
        .fromTo('.hero__stamp', { scale: 0.6, rotate: -25, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.5)' }, 0.95)

      gsap.to('.hero__img', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [ready])

  return (
    <section className="hero" id="top" ref={rootRef}>
      <div className="hero__copy">
        <div className="hero__eyebrow">
          <span>Autumn — Winter 2026</span>
          <span>Lisbon, PT</span>
        </div>

        <h1 className="hero__title">
          <span className="hero__line">
            <span>Form</span>
          </span>
          <span className="hero__line">
            <span>follows</span>
          </span>
          <span className="hero__line">
            <span>
              <em>feeling.</em>
            </span>
          </span>
        </h1>

        <div className="hero__bottom">
          <p className="hero__lede">
            Sculptural silhouettes for the everyday. Cut in small runs from deadstock wool and organic
            linen, in an atelier we know by name.
          </p>
          <a
            className="circle-cta"
            href="#collection"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#collection')
            }}
          >
            <span>
              Explore
              <br />
              the collection
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 19 19 5M9 5h10v10" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>
        </div>

        <div className="hero__meta">
          <span>No. 01 — Studio Collection</span>
          <span className="hero__meta-mid">Shot on 35mm</span>
          <button className="hero__scroll" onClick={() => scrollToSection('#collection')}>
            <span>Scroll</span>
            <span className="hero__scroll-line" aria-hidden="true">
              <i />
            </span>
          </button>
        </div>
      </div>

      <div className="hero__media">
        <div className="hero__img-wrap">
          <img
            className="hero__img"
            src="/images/hero.webp"
            alt="Model in an oversized charcoal wool coat and ivory trousers in a warm studio"
            fetchPriority="high"
          />
        </div>
        <div className="hero__stamp" aria-hidden="true">
          <svg className="hero__stamp-ring" viewBox="0 0 120 120">
            <defs>
              <path id="stampPath" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
            </defs>
            <text textLength="266" lengthAdjust="spacing">
              <textPath href="#stampPath">STUDIO COLLECTION — AW26 — MADE IN LISBON —</textPath>
            </text>
          </svg>
          <span className="hero__stamp-mark">É</span>
        </div>
      </div>
    </section>
  )
}
