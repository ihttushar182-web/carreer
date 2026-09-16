import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const pages = [
  'index.html',
  'services/index.html',
  'services/cv/index.html',
  'services/portfolio-website/index.html',
  'pricing/index.html',
  'samples/index.html',
  'about/index.html',
  'faq/index.html',
  'contact/index.html',
  'order/index.html',
  'thank-you/index.html',
  'policies/index.html',
]

export default defineConfig({
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((file) => [file.replace('/index.html', '').replace('.html', '') || 'home', resolve(process.cwd(), file)])),
    },
  },
})
