import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' makes every asset path relative, so the built site works under any
// GitHub Pages subfolder (https://alecson12.github.io/<repo-name>/) without
// having to write the repo name here. Pages are addressed with #/… links.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5175, strictPort: true, host: true },
})
