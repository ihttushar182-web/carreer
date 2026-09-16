# Career Minute

A responsive, multi-page service-commerce website for **Career Minute** — professional CVs, personal portfolio websites and career documents.

## Pages

- `/` — Home
- `/services/` — All services
- `/services/cv/` — Professional CV service
- `/services/portfolio-website/` — Portfolio website service
- `/pricing/` — Packages and quote paths
- `/samples/` — Sample visual directions
- `/about/` — About Career Minute
- `/faq/` — Frequently asked questions
- `/contact/` — Contact form and Facebook channel
- `/order/` — Project purchase/request flow
- `/thank-you/` — Confirmation page with return-home action
- `/policies/` — Privacy, terms, refund, delivery, revision and file-handling policies

## Local development

```bash
npm ci
npm run dev
```

The Vite server is configured to bind to `0.0.0.0` and support preview hosts.

## Production build

```bash
npm run build
npm run preview
```

The production-ready static files are generated in `dist/`. All clean URLs are emitted as folder routes with `index.html` files, so they work on Netlify, Vercel, Cloudflare Pages, cPanel static hosting and similar platforms.

## Before public launch

1. Point `careerminute.com` (or update canonical, Open Graph and sitemap URLs if a different domain is used).
2. Add the approved business email and WhatsApp number to the contact area.
3. Connect order and contact forms to a secure server/API, database, private file storage and email notification provider.
4. Add verified bKash, Nagad, Rocket, card or SSLCommerz payment settings.
5. Review final package pricing, delivery time, revision allowances and legal policy wording.
6. Connect analytics and conversion events (GA4 / Meta Pixel) using the production IDs.

## Form behavior in this build

The request, contact and newsletter flows validate user input and retain prototype submissions in browser local storage. This enables the complete customer journey and thank-you flow in the static deployment. For a live business launch, connect these flows to server-side storage and authenticated admin order management before collecting real customer files or payments.

## Brand

- Logo asset: `public/assets/career-minute-logo.svg`
- Primary colors: Career Minute blue, deep navy and growth green
- Footer credit: `© 2026 Career Minute · Built By Nexus Lift`
