import { Route, Routes } from 'react-router'
import Layout from './components/layout/Layout'
import CartPage from './pages/cart/CartPage'
import CheckoutPage from './pages/checkout/CheckoutPage'
import HomePage from './pages/home/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import OrderTrackingPage from './pages/orders/OrderTrackingPage'
import ProductDetailPage from './pages/product-detail/ProductDetailPage'
import ProductListPage from './pages/products/ProductListPage'
import WalletPage from './pages/wallet/WalletPage'

/**
 * Route table. OWNER: Person 4 (Tech Lead).
 * Need a new route? Ask in the group chat / open a PR. Don't edit this file on
 * your feature branch, or every branch will conflict here.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Person 1 (PM) */}
        <Route index element={<HomePage />} />
        {/* Person 2 (Analyst) */}
        <Route path="products" element={<ProductListPage />} />
        {/* Person 3 (Designer) */}
        <Route path="product/:id" element={<ProductDetailPage />} />
        {/* Person 4 (Tech Lead) */}
        <Route path="cart" element={<CartPage />} />
        {/* Person 4 (Tech Lead) */}
        <Route path="checkout" element={<CheckoutPage />} />
        {/* Person 5 (GTM) */}
        <Route path="wallet" element={<WalletPage />} />
        {/* Person 5 (GTM) */}
        <Route path="orders/:id" element={<OrderTrackingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
