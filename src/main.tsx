import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { CartProvider } from './context/CartProvider.tsx'
import { DemoProvider } from './context/DemoProvider.tsx'
import { RoleProvider } from './context/RoleProvider.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <DemoProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </DemoProvider>
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>,
)
