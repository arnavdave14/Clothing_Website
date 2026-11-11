import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { type CartItem } from '../data'
import { scrollToSection } from '../lib/scroll'

type CartDrawerProps = {
  open: boolean
  items: CartItem[]
  onClose: () => void
  onQty: (key: string, delta: number) => void
  onRemove: (key: string) => void
}

const FREE_SHIPPING = 250

export default function CartDrawer({ open, items, onClose, onQty, onRemove }: CartDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const remaining = Math.max(0, FREE_SHIPPING - subtotal)
  const progress = Math.min(1, subtotal / FREE_SHIPPING)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 420)
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
        <>
          <motion.div
            className="scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            aria-hidden="true"
          />
          <motion.aside
            className="cart"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 280 }}
          >
            <div className="cart__top">
              <span className="cart__title">Your bag ({String(count).padStart(2, '0')})</span>
              <button className="cart__close" onClick={onClose} ref={closeRef} aria-label="Close bag">
                <span />
                <span />
              </button>
            </div>

            {items.length > 0 ? (
              <>
                <div className="cart__ship">
                  <p>
                    {remaining > 0
                      ? `You're €${remaining} from complimentary shipping`
                      : 'Complimentary shipping unlocked.'}
                  </p>
                  <div className="cart__ship-bar" aria-hidden="true">
                    <span style={{ transform: `scaleX(${progress})` }} />
                  </div>
                </div>

                <ul className="cart__items">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.key}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 36 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="cart__item"
                      >
                        <img src={item.image} alt={item.name} />
                        <div className="cart__item-info">
                          <div className="cart__item-row">
                            <span className="cart__item-name">{item.name}</span>
                            <span>€{item.price}</span>
                          </div>
                          <span className="cart__item-meta">
                            {item.color} — Size {item.size}
                          </span>
                          <div className="cart__item-row cart__item-row--bottom">
                            <div className="qty" aria-label={`Quantity for ${item.name}`}>
                              <button onClick={() => onQty(item.key, -1)} aria-label="Decrease quantity">
                                −
                              </button>
                              <span>{item.qty}</span>
                              <button onClick={() => onQty(item.key, 1)} aria-label="Increase quantity">
                                +
                              </button>
                            </div>
                            <button className="cart__remove" onClick={() => onRemove(item.key)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="cart__foot">
                  <div className="cart__total">
                    <span>Subtotal</span>
                    <span>€{subtotal}</span>
                  </div>
                  <p className="cart__note">Taxes included. Shipping calculated at checkout.</p>
                  <button className="btn-add" type="button">
                    Checkout
                  </button>
                  <p className="cart__demo">Checkout is disabled in this preview.</p>
                </div>
              </>
            ) : (
              <div className="cart__empty">
                <p>Your bag is quiet.</p>
                <button
                  className="btn-add"
                  onClick={() => {
                    onClose()
                    scrollToSection('#collection', -72, 400)
                  }}
                >
                  Explore the collection
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
