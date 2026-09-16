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
  'admin/index.html',
  '404.html',
  'cv-checklist/index.html',
  'en/index.html',
  'en/cv-checklist/index.html',
  'en/services/index.html',
  'en/services/cv/index.html',
  'en/services/portfolio-website/index.html',
  'en/pricing/index.html',
  'en/samples/index.html',
  'en/about/index.html',
  'en/faq/index.html',
  'en/contact/index.html',
  'en/order/index.html',
  'en/thank-you/index.html',
  'en/policies/index.html',
]

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: { '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true } },
  },
  preview: { host: '0.0.0.0', allowedHosts: true },
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((file) => [file.replace('/index.html', '').replace('.html', '') || 'home', resolve(process.cwd(), file)])),
    },
  },
})
