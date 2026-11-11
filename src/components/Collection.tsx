import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion, scrollToSection } from '../lib/scroll'
import { products, type Product } from '../data'

type CollectionProps = {
  onQuickAdd: (product: Product) => void
}

export default function Collection({ onQuickAdd }: CollectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const section = sectionRef.current
    const pin = pinRef.current
    const track = trackRef.current
    if (!section || !pin || !track) return

    const ctx = gsap.context(() => {
      gsap.from('.collection__title .display-line > span', {
        yPercent: 112,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.09,
        scrollTrigger: { trigger: section, start: 'top 70%' },
      })

      gsap.from('.product-card', {
        y: 50,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 55%' },
      })

      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const progress = progressRef.current
        const getDistance = () =>
          Math.max(0, track.scrollWidth - document.documentElement.clientWidth + 32)

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${getDistance() + window.innerHeight * 0.2}`,
            pin,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progress) gsap.set(progress, { scaleX: self.progress })
            },
          },
        })

        return () => {
          tween.scrollTrigger?.kill()
          tween.kill()
          gsap.set(track, { x: 0 })
          if (progress) gsap.set(progress, { scaleX: 0 })
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="collection" id="collection" ref={sectionRef} aria-labelledby="collection-title">
      <div className="collection__pin" ref={pinRef}>
        <div className="collection__head">
          <div className="section-head">
            <span className="label">No. 01 — Collection</span>
            <span className="label">Six pieces / AW26</span>
          </div>
          <div className="collection__title-row">
            <h2 className="display collection__title" id="collection-title">
              <span className="display-line">
                <span>The studio,</span>
              </span>
              <span className="display-line">
                <span>
                  <em>worn.</em>
                </span>
              </span>
            </h2>
            <p className="collection__hint">
              Scroll to move
              <span aria-hidden="true">→</span>
            </p>
          </div>
        </div>

        <div className="collection__viewport">
          <div className="collection__track" ref={trackRef}>
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-card__media">
                  <img src={product.image} alt={product.alt} loading="lazy" />
                  <span className="product-card__index">{product.index}</span>
                  <button
                    className="product-card__quick"
                    onClick={() => onQuickAdd(product)}
                    aria-label={`Add ${product.name} to bag, size M, colour ${product.colors[0].name}`}
                  >
                    Add to bag <span aria-hidden="true">+</span>
                  </button>
                </div>
                <div className="product-card__info">
                  <div className="product-card__text">
                    <h3>{product.name}</h3>
                    <span className="product-card__cat">{product.category}</span>
                    <span className="product-card__colors" aria-hidden="true">
                      {product.colors.map((color) => (
                        <i key={color.name} style={{ background: color.hex }} />
                      ))}
                    </span>
                  </div>
                  <span className="product-card__price">€{product.price}</span>
                </div>
              </article>
            ))}

            <div className="collection__end">
              <span className="label">Next</span>
              <a
                href="#lookbook"
                className="collection__end-link"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('#lookbook')
                }}
              >
                See it
                <br />
                <em>in motion</em>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="collection__foot">
          <span className="label">04 pieces — Studio 01</span>
          <div className="collection__progress" aria-hidden="true">
            <span ref={progressRef} />
          </div>
          <span className="label collection__foot-note">Made in Lisbon</span>
        </div>
      </div>
    </section>
  )
}
