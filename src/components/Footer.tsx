import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gsap } from '../lib/gsap'
import { getLenis, prefersReducedMotion, scrollToSection } from '../lib/scroll'

export default function Footer() {
  const rootRef = useRef<HTMLElement>(null)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [time, setTime] = useState('--:--')

  useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Lisbon',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
      )
    }
    update()
    const id = window.setInterval(update, 30000)
    return () => window.clearInterval(id)
  }, [])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.footer__news h2 .display-line > span', {
        yPercent: 112,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.09,
        scrollTrigger: { trigger: '.footer__news h2', start: 'top 85%' },
      })

      gsap.from('.footer__main > *', {
        y: 26,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.footer__main', start: 'top 90%' },
      })

      gsap.fromTo(
        '.footer__wordmark span',
        { yPercent: 26 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.footer__wordmark',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true,
          },
        },
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  const toTop = () => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 1.6 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer" id="footer" ref={rootRef}>
      <section className="footer__news" id="newsletter" aria-labelledby="newsletter-title">
        <div className="section-head">
          <span className="label">No. 05 — Letters</span>
          <span className="label">Twice a season</span>
        </div>

        <div className="footer__news-grid">
          <h2 className="display footer__news-title" id="newsletter-title">
            <span className="display-line">
              <span>Join the</span>
            </span>
            <span className="display-line">
              <span>
                <em>atelier list.</em>
              </span>
            </span>
          </h2>

          <div className="footer__news-copy">
            <p>
              Early access to studio drops, repair notes, and the occasional letter from Lisbon. No
              noise.
            </p>

            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  className="newsletter__success"
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  role="status"
                >
                  Welcome in. Look for a letter from Lisbon.
                </motion.div>
              ) : (
                <motion.form
                  className="newsletter"
                  key="form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    setSent(true)
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <label className="sr-only" htmlFor="newsletter-email">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                  <button type="submit" aria-label="Subscribe to the newsletter">
                    Subscribe
                    <span aria-hidden="true">→</span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <span className="footer__privacy">By subscribing you agree to a quiet approach to email.</span>
          </div>
        </div>
      </section>

      <div className="footer__main">
        <div className="footer__brand">
          <span className="footer__logo">ÉLAN</span>
          <p>Sculptural essentials, cut in small runs in Lisbon. Made to be kept.</p>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <div className="footer__col">
            <span className="label">Explore</span>
            {[
              ['Collection', '#collection'],
              ['Film', '#film'],
              ['Lookbook', '#lookbook'],
              ['Atelier', '#atelier'],
              ['Newsletter', '#newsletter'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToSection(href)
                }}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="footer__col">
            <span className="label">Studio</span>
            <a href="mailto:hello@elan.studio">hello@elan.studio</a>
            <a
              href="#atelier"
              onClick={(event) => {
                event.preventDefault()
                scrollToSection('#atelier')
              }}
            >
              Care & repairs
            </a>
            <a
              href="#featured"
              onClick={(event) => {
                event.preventDefault()
                scrollToSection('#featured')
              }}
            >
              Made to order
            </a>
          </div>

          <div className="footer__col">
            <span className="label">Visit</span>
            <p>
              Rua das Flores 24
              <br />
              1200-192 Lisbon
              <br />
              By appointment
            </p>
          </div>
        </nav>
      </div>

      <div className="footer__wordmark" aria-hidden="true">
        <span>ÉLAN</span>
      </div>

      <div className="footer__legal">
        <span>© 2026 Élan Studio</span>
        <span className="footer__clock">Lisbon — {time}</span>
        <button onClick={toTop}>
          Back to top <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  )
}
