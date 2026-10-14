import { createContext } from 'react'
import type { Cart, Product } from '../types'

export interface CartContextValue {
  cart: Cart
  /** Total units across all lines (for badges). */
  itemCount: number
  /** Adds to an existing line if the product is already in the cart. */
  addItem: (product: Product, quantity?: number) => void
  /** Clamped to 1..MAX_QUANTITY. Use removeItem to delete a line. */
  setQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const MAX_QUANTITY = 99

export const CartContext = createContext<CartContextValue | null>(null)
