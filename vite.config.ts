import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Vitest picks this file up automatically; tests run in Node (pure functions only).
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
