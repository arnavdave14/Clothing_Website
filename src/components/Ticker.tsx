import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/scroll'

type TickerProps = {
  items: string[]
  dark?: boolean
}

export default function Ticker({ items, dark = false }: TickerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const skewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current
    const skew = skewRef.current
    if (!root || !skew) return

    const setSkew = gsap.quickTo(skew, 'skewX', { duration: 0.65, ease: 'power3.out' })
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        setSkew(gsap.utils.clamp(-5, 5, self.getVelocity() / 420))
      },
    })

    return () => {
      trigger.kill()
      gsap.killTweensOf(skew)
      gsap.set(skew, { skewX: 0 })
    }
  }, [])

  const group = (key: string) => (
    <div className="ticker__group" key={key} aria-hidden={key === 'b'}>
      {items.map((item, i) => (
        <span className="ticker__item" key={`${key}-${i}`}>
          {item}
          <span className="ticker__sep" aria-hidden="true" />
        </span>
      ))}
    </div>
  )

  return (
    <div className={`ticker${dark ? ' ticker--dark' : ''}`} ref={rootRef} aria-hidden="true">
      <div className="ticker__skew" ref={skewRef}>
        <div className="ticker__track">
          {group('a')}
          {group('b')}
        </div>
      </div>
    </div>
  )
}
