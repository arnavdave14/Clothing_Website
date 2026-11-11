import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ScrollTrigger } from '../lib/gsap'
import { scrollToSection } from '../lib/scroll'

const sections = [
  { id: 'collection', label: 'Collection' },
  { id: 'film', label: 'Film' },
  { id: 'featured', label: 'Featured' },
  { id: 'lookbook', label: 'Lookbook' },
  { id: 'atelier', label: 'Atelier' },
  { id: 'footer', label: 'Letters' },
]

export default function SectionRail() {
  const [active, setActive] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const reveal = ScrollTrigger.create({
      trigger: document.getElementById('collection') ?? document.body,
      start: 'top 85%',
      onEnter: () => setVisible(true),
      onLeaveBack: () => setVisible(false),
    })

    const triggers = sections
      .map((section) => {
        const element = document.getElementById(section.id)
        if (!element) return null
        return ScrollTrigger.create({
          trigger: element,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) setActive(section.id)
          },
        })
      })
      .filter((trigger): trigger is ScrollTrigger => Boolean(trigger))

    return () => {
      reveal.kill()
      triggers.forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <nav className={`section-rail${visible ? ' is-visible' : ''}`} aria-label="Page sections">
      <span className="label section-rail__title">Index</span>
      <ol>
        {sections.map((section, index) => {
          const isActive = active === section.id
          return (
            <li key={section.id}>
              <button
                type="button"
                className={`section-rail__link${isActive ? ' is-active' : ''}`}
                onClick={() => scrollToSection(`#${section.id}`, -72)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="section-rail__num label">0{index + 1}</span>
                <span className="section-rail__label">{section.label}</span>
                {isActive && (
                  <motion.span
                    className="section-rail__dot"
                    layoutId="section-rail-dot"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
