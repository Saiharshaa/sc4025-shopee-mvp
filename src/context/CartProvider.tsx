import { useMemo, useState, type ReactNode } from 'react'
import { getCart } from '../mocks'
import type { CartItem } from '../types'
import { CartContext, MAX_QUANTITY, type CartContextValue } from './cartContext'

/**
 * Holds the live cart for the whole app (seeded from the mock cart).
 * OWNER: Person 4 (Tech Lead). Read it anywhere with useCart().
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => getCart().items)

  const value = useMemo<CartContextValue>(() => {
    const clamp = (q: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(q)))

    return {
      cart: { items },
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      addItem: (product, quantity = 1) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.product.id === product.id)
          if (!existing) return [...prev, { product, quantity: clamp(quantity) }]
          return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: clamp(i.quantity + quantity) } : i))
        }),
      setQuantity: (productId, quantity) =>
        setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity: clamp(quantity) } : i))),
      removeItem: (productId) => setItems((prev) => prev.filter((i) => i.product.id !== productId)),
      clearCart: () => setItems([]),
    }
  }, [items])

  return <CartContext value={value}>{children}</CartContext>
}
