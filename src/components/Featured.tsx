import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/scroll'
import { featured } from '../data'

export type AddPayload = {
  productId: string
  name: string
  price: number
  image: string
  color: string
  size: string
}

type FeaturedProps = {
  onAdd: (payload: AddPayload) => void
}

export default function Featured({ onAdd }: FeaturedProps) {
  const rootRef = useRef<HTMLElement>(null)
  const [color, setColor] = useState(featured.colors[0].name)
  const [size, setSize] = useState('M')
  const [openAccordion, setOpenAccordion] = useState<number | null>(0)
  const [added, setAdded] = useState(false)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.featured__media',
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.3,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: '.featured__media', start: 'top 82%' },
        },
      )

      gsap.from('.featured__reveal', {
        y: 34,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.07,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.featured__info', start: 'top 78%' },
      })

      gsap.fromTo(
        '.featured__media img',
        { scale: 1.12 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        },
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  const addToBag = () => {
    onAdd({
      productId: featured.id,
      name: featured.name,
      price: featured.price,
      image: featured.image,
      color,
      size,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <section className="featured section" id="featured" ref={rootRef} aria-labelledby="featured-title">
      <div className="section-head">
        <span className="label">No. 02 — Featured piece</span>
        <span className="label">Made to order</span>
      </div>

      <div className="featured__grid">
        <div className="featured__media">
          <img src={featured.image} alt={featured.alt} loading="lazy" />
          <span className="featured__badge">Double-faced wool — 60 made</span>
        </div>

        <div className="featured__info">
          <span className="label featured__reveal">01 / 06 — Outerwear</span>
          <h2 className="display featured__name featured__reveal" id="featured-title">
            The Atelier
            <br />
            <em>Coat</em>
          </h2>
          <p className="featured__price featured__reveal">€{featured.price}</p>
          <p className="featured__desc featured__reveal">
            A coat with the quiet weight of a room. Cut from double-faced Italian wool so the seams
            disappear and the collar can wrap like a scarf. Made once, made well.
          </p>

          <ul className="featured__details featured__reveal">
            {featured.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>

          <div className="option featured__reveal">
            <span className="option__label">Colour — {color}</span>
            <div className="swatches" role="group" aria-label="Choose a colour">
              {featured.colors.map((swatch) => (
                <button
                  key={swatch.name}
                  className="swatch"
                  style={{ background: swatch.hex }}
                  onClick={() => setColor(swatch.name)}
                  aria-label={swatch.name}
                  aria-pressed={color === swatch.name}
                >
                  {color === swatch.name && (
                    <motion.span className="swatch__ring" layoutId="swatch-ring" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="option featured__reveal">
            <span className="option__label">Size</span>
            <div className="sizes" role="group" aria-label="Choose a size">
              {featured.sizes.map((value) => (
                <button
                  key={value}
                  className="size"
                  onClick={() => setSize(value)}
                  aria-pressed={size === value}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            className="btn-add featured__reveal"
            onClick={addToBag}
            whileTap={{ scale: 0.985 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? 'added' : 'add'}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {added ? 'Added to bag ✓' : `Add to bag — €${featured.price}`}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <div className="accordions featured__reveal">
            {featured.accordions.map((item, i) => {
              const isOpen = openAccordion === i
              return (
                <div className="accordion" key={item.title}>
                  <button
                    className="accordion__trigger"
                    onClick={() => setOpenAccordion(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`accordion-panel-${i}`}
                  >
                    <span>{item.title}</span>
                    <motion.span
                      className="accordion__icon"
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                      aria-hidden="true"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`accordion-panel-${i}`}
                        role="region"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="accordion__body">{item.body}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
