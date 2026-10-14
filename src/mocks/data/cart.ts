// Do not import this file directly — use getCart() in src/mocks/index.ts.
// The cart starts pre-filled so cart/checkout can be demoed and usability-tested
// without going through the listing pages first. Subtotal: Rs 1,916.

export const INITIAL_CART: { productId: string; quantity: number }[] = [
  { productId: 'p001', quantity: 1 }, // Earbuds, Rs 1,299
  { productId: 'p005', quantity: 2 }, // Phone case, 2 x Rs 199
  { productId: 'p021', quantity: 1 }, // Masala chai, Rs 219
]
