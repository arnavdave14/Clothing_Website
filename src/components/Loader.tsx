import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { getLenis, prefersReducedMotion } from '../lib/scroll'

type LoaderProps = {
  onReveal: () => void
  onComplete: () => void
}

export default function Loader({ onReveal, onComplete }: LoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const doneRef = useRef(false)
  const callbacks = useRef({ onReveal, onComplete })
  callbacks.current = { onReveal, onComplete }

  useEffect(() => {
    document.documentElement.classList.add('is-loading')
    window.scrollTo(0, 0)
    return () => document.documentElement.classList.remove('is-loading')
  }, [])

  useLayoutEffect(() => {
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(rootRef.current, { display: 'none' })
        callbacks.current.onReveal()
        callbacks.current.onComplete()
        return
      }

      const counter = { value: 0 }
      const tl = gsap.timeline()

      tl.from('.loader__letter', {
        yPercent: 120,
        duration: 1,
        stagger: 0.07,
        ease: 'power4.out',
      })
        .from('.loader__tag', { autoAlpha: 0, y: 12, duration: 0.6, ease: 'power2.out' }, 0.35)
        .from('.loader__foot > *', { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.08 }, 0.3)
        .to(
          counter,
          {
            value: 100,
            duration: 1.7,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (countRef.current) {
                countRef.current.textContent = String(Math.round(counter.value)).padStart(2, '0')
              }
            },
          },
          0.1,
        )
        .fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1.7, ease: 'power2.inOut' }, 0.1)
        .to('.loader__center', { yPercent: -12, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, 2)
        .to('.loader__foot', { autoAlpha: 0, duration: 0.4 }, 2)
        .to(
          rootRef.current,
          {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.95,
            ease: 'power4.inOut',
            onStart: () => {
              if (!doneRef.current) {
                doneRef.current = true
                callbacks.current.onReveal()
                getLenis()?.start()
                ScrollTrigger.refresh()
              }
            },
          },
          2.1,
        )
        .add(() => callbacks.current.onComplete(), 3.1)

      return () => {
        tl.kill()
      }
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="loader" ref={rootRef} aria-hidden="true">
      <div className="loader__center">
        <div className="loader__word">
          {'ÉLAN'.split('').map((letter, i) => (
            <span className="loader__mask" key={i}>
              <span className="loader__letter">{letter}</span>
            </span>
          ))}
        </div>
        <span className="loader__tag">Studio collection — N°01</span>
      </div>
      <div className="loader__foot">
        <span className="label">Lisbon · 38.7°N</span>
        <span className="loader__count" ref={countRef}>
          00
        </span>
      </div>
      <div className="loader__bar">
        <span ref={barRef} />
      </div>
    </div>
  )
}
