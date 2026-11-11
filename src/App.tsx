import { useCallback, useEffect, useState } from 'react'
import Lenis from 'lenis'
import Header from './components/Header'
import Hero from './components/Hero'
import Ticker from './components/Ticker'
import Manifesto from './components/Manifesto'
import Collection from './components/Collection'
import Sequence from './components/Sequence'
import Featured, { type AddPayload } from './components/Featured'
import Lookbook from './components/Lookbook'
import Atelier from './components/Atelier'
import Footer from './components/Footer'
import MenuOverlay from './components/MenuOverlay'
import CartDrawer from './components/CartDrawer'
import Loader from './components/Loader'
import ScrollProgress from './components/ScrollProgress'
import Cursor from './components/Cursor'
import SectionRail from './components/SectionRail'
import { gsap, ScrollTrigger } from './lib/gsap'
import { getLenis, prefersReducedMotion, setLenis } from './lib/scroll'
import { tickerItems, type CartItem, type Product } from './data'

export default function App() {
  const [ready, setReady] = useState(false)
  const [loaderDone, setLoaderDone] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    setLenis(lenis)
    lenis.stop()
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const lenis = getLenis()
    if (menuOpen || cartOpen) {
      lenis?.stop()
      document.documentElement.classList.add('is-locked')
    } else {
      lenis?.start()
      document.documentElement.classList.remove('is-locked')
    }
  }, [menuOpen, cartOpen, ready])

  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  const handleReveal = useCallback(() => {
    window.scrollTo(0, 0)
    setReady(true)
    document.documentElement.classList.remove('is-loading')
    getLenis()?.start()
    window.setTimeout(() => ScrollTrigger.refresh(), 120)
  }, [])

  const handleLoaderComplete = useCallback(() => setLoaderDone(true), [])

  const addToCart = useCallback((payload: AddPayload) => {
    const key = `${payload.productId}-${payload.color}-${payload.size}`
    setCart((prev) => {
      const existing = prev.find((item) => item.key === key)
      if (existing) {
        return prev.map((item) => (item.key === key ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...prev, { ...payload, key, qty: 1 }]
    })
    setMenuOpen(false)
    setCartOpen(true)
  }, [])

  const quickAdd = useCallback(
    (product: Product) => {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.colors[0].name,
        size: 'M',
      })
    },
    [addToCart],
  )

  const openMenu = useCallback(() => {
    setCartOpen(false)
    setMenuOpen(true)
  }, [])

  const openCart = useCallback(() => {
    setMenuOpen(false)
    setCartOpen(true)
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  const changeQty = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, qty: Math.max(1, item.qty + delta) } : item,
      ),
    )
  }, [])

  const removeItem = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key))
  }, [])

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="grain" aria-hidden="true" />
      <ScrollProgress />
      <Cursor />
      <div className="page" inert={menuOpen || cartOpen}>
        <Header cartCount={cartCount} onOpenMenu={openMenu} onOpenCart={openCart} />

        <main id="main">
          <Hero ready={ready} />
          <Ticker items={tickerItems} />
          <Manifesto />
          <Collection onQuickAdd={quickAdd} />
          <Ticker
            items={['Free repairs, always', 'Studio collection 01', 'Cut in Lisbon', 'Made to be kept']}
          />
          <Sequence />
          <Featured onAdd={addToCart} />
          <Lookbook />
          <Atelier />
          <Footer />
        </main>

        <SectionRail />
      </div>

      <MenuOverlay open={menuOpen} onClose={closeMenu} />
      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={closeCart}
        onQty={changeQty}
        onRemove={removeItem}
      />
      {!loaderDone && <Loader onReveal={handleReveal} onComplete={handleLoaderComplete} />}
    </>
  )
}
