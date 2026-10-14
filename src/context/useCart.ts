import { useContext } from 'react'
import { CartContext, type CartContextValue } from './cartContext'

/**
 * Access the live cart from any page:
 *   const { cart, addItem, itemCount } = useCart()
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
