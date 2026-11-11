import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { getLenis, scrollToSection } from '../lib/scroll'
import { navLinks } from '../data'

type HeaderProps = {
  cartCount: number
  onOpenMenu: () => void
  onOpenCart: () => void
}

export default function Header({ cartCount, onOpenMenu, onOpenCart }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      setHidden(y > 160 && y > last)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toTop = () => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 1.4 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${hidden ? ' is-hidden' : ''}`}>
      <button className="site-header__logo" onClick={toTop} aria-label="ÉLAN — back to top">
        ÉLAN<span className="site-header__reg">®</span>
      </button>

      <nav className="site-header__nav" aria-label="Primary">
        {navLinks.slice(0, 3).map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => {
              e.preventDefault()
              scrollToSection(link.href)
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="site-header__actions">
        <button className="site-header__bag" onClick={onOpenCart} aria-label={`Open bag, ${cartCount} items`}>
          <span>Bag</span>
          <span className="site-header__count" aria-hidden="true">
            <motion.span
              key={cartCount}
              initial={{ y: -7, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {String(cartCount).padStart(2, '0')}
            </motion.span>
          </span>
        </button>

        <button className="site-header__menu" onClick={onOpenMenu} aria-label="Open menu">
          <span>Menu</span>
          <span className="site-header__burger" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </div>
    </header>
  )
}
