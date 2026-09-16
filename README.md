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

Bangla is the default visitor language. The persistent language switcher provides full static English routes under `/en/`, for example `/en/services/cv/`; these routes use reciprocal Bangla/English `hreflang` metadata for search engines.

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

## Secure order API and admin workspace

The project includes an Express production server at `server.mjs`. It provides same-origin endpoints for orders, contact messages, CV Checklist signups, consent-aware conversion events, private uploads and a password-protected admin workspace.

```bash
# Build the public pages, then run the same-origin production server
npm run build
cp .env.example .env
# Set strong unique ADMIN_PASSWORD and SESSION_SECRET values in .env
npm start
```

Open `/admin/` to sign in and manage orders, order status, payment status, internal notes, business contact settings, payment instructions, package prices and analytics IDs.

### Docker deployment

```bash
docker build -t career-minute .
docker run --env-file .env -p 8787:8787 -v career-minute-data:/app/data career-minute
```

Put the container behind an HTTPS reverse proxy and store the persistent `data` volume on encrypted infrastructure.

- Uploaded CVs/payment proofs are validated and saved outside the public web directory (`data/uploads/`).
- Request and contact content is sanitized and rate limited.
- Admin sessions use HttpOnly, SameSite cookies and expire after 12 hours.
- `Helmet` sends production security headers; the admin workspace is excluded from search indexing.
- Optional order-notification email is supported with Resend once `RESEND_API_KEY` and `businessEmail` are set.

For development, keep the API and Vite server running in separate terminals:

```bash
npm run dev:api
npm run dev
```

Vite proxies `/api` requests to the API server, so browser code uses only same-origin relative URLs.

## Before public launch

1. Point `careerminute.com` (or update canonical, Open Graph and sitemap URLs if a different domain is used).
2. Set strong production `ADMIN_PASSWORD` and `SESSION_SECRET` values; do not use the example values.
3. Add the approved business email, business hours and verified payment details in `/admin/`.
4. Add verified bKash, Nagad, Rocket, card or SSLCommerz payment settings and test the verification process.
5. Mount `data/` as encrypted persistent storage, or replace the storage adapter with managed PostgreSQL/private cloud storage for a multi-server deployment.
6. Review final package pricing, delivery time, revision allowances and legal policy wording.
7. Connect analytics and conversion events (GA4 / Meta Pixel) using the production IDs in `/admin/`.
8. Replace demonstration testimonials with approved customer reviews and live sample links.

## Form behavior in this build

Order, contact and CV Checklist forms post to the same-origin API. The order API validates required fields, validates supported uploads (PDF, DOC, DOCX, JPG, PNG; maximum 10 MB), creates a Career Minute reference and stores requests privately for the admin workspace. Customer tracking only starts after visitors accept the optional analytics preference.

## Brand

- Logo asset: `public/assets/career-minute-logo.svg`
- Primary colors: Career Minute blue, deep navy and growth green
- Footer credit: `© 2026 Career Minute · Built By Nexus Lift`
