import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/scroll'

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return
    const el = ringRef.current
    if (!el) return

    el.classList.add('is-enabled')
    const xTo = gsap.quickTo(el, 'x', { duration: 0.38, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.38, ease: 'power3.out' })

    const onMove = (event: PointerEvent) => {
      xTo(event.clientX)
      yTo(event.clientY)
    }
    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      el.classList.toggle('is-hover', Boolean(target?.closest('a, button, [data-cursor]')))
    }
    const onLeave = () => el.classList.remove('is-visible')
    const onEnter = () => el.classList.add('is-visible')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  return <div className="cursor" ref={ringRef} aria-hidden="true" />
}
