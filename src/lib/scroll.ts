import type Lenis from 'lenis'

let instance: Lenis | null = null

export function setLenis(next: Lenis | null) {
  instance = next
}

export function getLenis() {
  return instance
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function scrollToSection(hash: string, offset = -72, delay = 0) {
  const run = () => {
    const el = document.querySelector<HTMLElement>(hash)
    if (!el) return
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(el, { offset, duration: 1.4 })
    } else {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    }
  }
  if (delay > 0) window.setTimeout(run, delay)
  else run()
}

export function splitWords(root: HTMLElement): HTMLElement[] {
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ''
      if (!text.trim()) return
      const frag = document.createDocumentFragment()
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part))
        } else {
          const span = document.createElement('span')
          span.className = 'word'
          span.textContent = part
          frag.appendChild(span)
        }
      })
      node.parentNode?.replaceChild(frag, node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk)
    }
  }
  Array.from(root.childNodes).forEach(walk)
  return Array.from(root.querySelectorAll<HTMLElement>('.word'))
}
