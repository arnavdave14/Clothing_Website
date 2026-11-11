import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { navLinks } from '../data'
import { scrollToSection } from '../lib/scroll'

type MenuOverlayProps = {
  open: boolean
  onClose: () => void
}

export default function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  const [active, setActive] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    setActive(0)
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 450)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
      previous?.focus?.({ preventScroll: true })
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="menu__top">
            <span className="menu__logo">ÉLAN</span>
            <span className="label menu__top-label">Index — AW26</span>
            <button className="menu__close" onClick={onClose} ref={closeRef} aria-label="Close menu">
              <span />
              <span />
            </button>
          </div>

          <div className="menu__body">
            <nav aria-label="Menu">
              <ul className="menu__list">
                {navLinks.map((link, i) => (
                  <li key={link.href} className="menu__item">
                    <div className="menu__mask">
                      <motion.a
                        href={link.href}
                        className={`menu__link${active === i ? ' is-active' : ''}`}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        initial={{ y: '110%' }}
                        animate={{ y: '0%' }}
                        transition={{ duration: 0.8, delay: 0.25 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(event) => {
                          event.preventDefault()
                          onClose()
                          scrollToSection(link.href, -64, 750)
                        }}
                      >
                        <span className="menu__index">0{i + 1}</span>
                        <span className="menu__label">{link.label}</span>
                        <span className="menu__arrow" aria-hidden="true">
                          ↗
                        </span>
                      </motion.a>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="menu__preview" aria-hidden="true">
              <AnimatePresence mode="wait">
                <motion.img
                  key={navLinks[active].image}
                  src={navLinks[active].image}
                  alt=""
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </AnimatePresence>
              <span className="menu__preview-meta">{navLinks[active].meta}</span>
            </div>
          </div>

          <div className="menu__foot">
            <a href="mailto:hello@elan.studio">hello@elan.studio</a>
            <span className="label">Lisbon · 38.7°N, 9.1°W</span>
            <a href="mailto:hello@elan.studio?subject=Studio%20visit">Book a studio visit ↗</a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
