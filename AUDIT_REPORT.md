# Career Minute — Website Audience & Launch Audit

**Audit date:** 17 September 2026
**Scope:** Career Minute public website, user journey, visible conversion paths, clean-route deployment build, SEO baseline and responsive readiness.
**Audience lens:** Students, fresh graduates, job seekers, career switchers, corporate/NGO applicants, freelancers and creative professionals in Bangladesh.

## Executive assessment

The website now makes a strong first impression as a **career-document and personal-brand platform**, not simply a CV maker. Its clearest journey is:

> Home → choose CV / portfolio / career service → order request → request confirmation → thank-you page → return home.

**Frontend/static deployment readiness: 9 / 10**
**Live commerce/data-operation readiness: 7.5 / 10** — the same-origin API, private upload handling, admin workspace, payment-verification workflow and consent-aware analytics are now implemented. Verified merchant payment details, a production business email, persistent encrypted storage and authentic testimonials remain business-launch configuration tasks.

### Implementation update — improvements completed

- Added same-origin `/api` service endpoints for orders, contact messages, CV Checklist subscriptions and conversion events.
- Added private validated upload handling, rate limiting, security headers and a protected `/admin/` order-management workspace.
- Added configurable payment methods, merchant instructions, package prices, delivery days, revision counts, business contact details, GA4 and Meta Pixel fields in admin settings.
- Added a manual payment-preparation area with transaction ID and payment-proof upload support.
- Added a privacy-choice banner; analytics starts only after visitor consent.
- Added a free CV Checklist lead capture and a visitor decision helper for students, job applicants, portfolio buyers and personal-brand clients.
- Added static English routes under `/en/` with reciprocal Bangla/English `hreflang` tags, while Bangla remains the default path.
- Added a 404 response page, social-sharing image and Docker deployment file.

---

## Audit checks completed

| Check | Result |
| --- | --- |
| Production routes and assets checked | **31 / 31 returned HTTP 200** |
| Internal local links inspected | **42 unique links; 0 broken** |
| Facebook destination | `https://www.facebook.com/careerminute` applied across the site |
| WhatsApp destination | `https://wa.me/8801814716713` applied as a quick-contact button and contact-channel link |
| Logo asset | Available site-wide at `/assets/career-minute-logo.svg` |
| Human realistic-cartoon artwork | Present on all 12 public pages; all character images have descriptive alt text |
| Page title, meta description, canonical URL | Present on all 12 public pages |
| Bengali / English language controls | Present on all public page headers; **Bangla is the default** |
| Sitemap and robots file | Available at `/sitemap.xml` and `/robots.txt` |
| Production build | Passes with clean folder-route output, static English routes and a 404 page |
| Same-origin service API | Health, settings, order, contact, subscriber and protected admin routes tested |
| JavaScript static syntax checks | Passed for order, page, language, analytics, settings, admin and server scripts |

### Public route inventory

- `/`
- `/services/`
- `/services/cv/`
- `/services/portfolio-website/`
- `/pricing/`
- `/samples/`
- `/about/`
- `/faq/`
- `/contact/`
- `/order/`
- `/thank-you/`
- `/policies/`

---

## Good side / ভালো দিক

### 1. Clear positioning from a visitor perspective

- The primary promise is clear: **“Your Career Deserves More Than a Basic CV.”**
- The website differentiates Career Minute with the stronger **CV + portfolio website + personal branding** positioning.
- A visitor can quickly understand that the brand supports both job applications and online professional presence.

### 2. Strong conversion path

- The primary CTA appears in the header, hero, service cards, pricing areas and the final CTA.
- Service requests can start from the homepage or a dedicated order page.
- The thank-you screen gives the visitor a reference number, explains what happens next and provides a return-to-home action.
- Facebook and WhatsApp are visible as quick contact options for visitors who prefer conversation before ordering.

### 3. Professional visual language

- The logo is consistently used in the header, footer, forms, thank-you flow and browser favicon.
- Motion graphics are career-relevant rather than decorative: moving CV cards, portfolio-browser scenes, progression indicators, animated document shapes and subtle orbit effects.
- Every public page now contains a semi-realistic cartoon professional—career starter, designer, creative freelancer, experienced professional or mentor—with a subtle floating motion treatment.
- The design does not rely on generic stock photography; it feels more ownable and private for a career-services brand.

### 4. Mobile usability

- Responsive layouts include a compact menu, conversion-focused mobile sticky CTA and mobile-scaled artwork.
- Important buttons remain touch-friendly and the content hierarchy becomes single-column at small device widths.
- The design includes specific safeguards for 360px-wide screens.

### 5. Content and trust coverage

- Visitors can access Services, CV, Portfolio, Packages, Samples, About, FAQ, Contact and policy information.
- The homepage includes a rotating review section and proof-oriented explanations of what each service delivers.
- The website avoids job-guarantee claims, which is appropriate for a trustworthy career service.

### 6. SEO and discoverability baseline

- Every public page has its own title, meta description, canonical URL and Open Graph fundamentals.
- The homepage has ProfessionalService schema and the existing Facebook page is included as a social profile.
- `robots.txt`, `sitemap.xml`, readable heading hierarchy and clean URLs are in place.
- Bengali is the default visitor language. The **EN** control enables English through the language preference / URL parameter.

---

## Fault side / সীমাবদ্ধতা ও ঝুঁকি

### P0 — configure before accepting real paid orders

1. **Choose persistent, encrypted production storage**
   - The same-origin server now accepts orders, messages and files; uploads are kept outside the public directory and admin access is protected.
   - For a multi-server production deployment, mount encrypted persistent storage or replace the local storage adapter with managed PostgreSQL and private cloud object storage.
   - **Impact:** High. CVs and career documents contain sensitive personal data.

2. **Configure verified payment accounts**
   - bKash, Nagad, Rocket and card / SSLCommerz settings, transaction ID capture, payment-proof upload and admin payment states are now ready.
   - Merchant numbers, gateway URLs and payment instructions must be entered in `/admin/` before presenting a method to customers.
   - **Impact:** High for sales operations.

3. **Configure operational contact details**
   - WhatsApp is live with **01814716713** and an opening message.
   - Set the business email, business hours and response policy in `/admin/`; optional Resend notification delivery also requires its API key.
   - **Impact:** Medium. Some visitors will expect a formal email route and response-time expectation.

4. **Testimonials are presentation samples, not verified customer evidence**
   - The reviews improve page rhythm and explain perceived value, but they must be replaced or explicitly approved as genuine before public launch.
   - **Impact:** High for trust and advertising compliance.

### P1 — should be completed during launch preparation

5. **Domain assumption must be checked**
   - Canonical and sitemap URLs currently use `https://careerminute.com`.
   - If the live domain differs, these must be updated before indexing.

6. **Open Graph image is ready; validate on the live domain**
   - A branded social-sharing image has been added for Facebook and other social previews.
   - Use Facebook Sharing Debugger after DNS is connected to refresh cached previews.

7. **Static English routes are ready; continue Bengali content QA**
   - Bangla remains the default view and static English routes are available under `/en/` with reciprocal language tags.
   - Before launch, ask a native Bangla copy editor to check final translation nuance, especially all legal and payment wording.

8. **Analytics is implemented but IDs must be connected**
   - Consent-aware CTA, form and page events are now supported through the API and optional GA4 / Meta Pixel configuration.
   - Add the real IDs in `/admin/` and test events with GA4 DebugView and Meta Pixel Helper.

9. **No live sample links**
   - The Samples page is visually effective, but serious portfolio buyers will gain more confidence from 2–4 approved live portfolio demos and real before/after CV examples.

10. **No browser/device regression test recorded**
    - Static route, build and responsive CSS checks pass. Before production, run physical-device / browser checks on Android Chrome, iPhone Safari, desktop Chrome, Firefox and Safari.

---

## Improving side / উন্নয়নের পরবর্তী ধাপ

### Highest-value conversion improvements

1. Add final package prices, delivery days and revision counts after commercial approval.
2. Add a small “Typical response time” promise near WhatsApp and the order form, for example: **“Replies within business hours.”**
3. Add 3–6 authentic testimonials with permission, service name, profession and optionally a blurred profile image.
4. Add approved CV before/after samples and at least two live personal-portfolio demos.
5. Publish a lead magnet: **Free CV Checklist / ক্যারিয়ার ডকুমেন্ট চেকলিস্ট** in exchange for name and email.
6. Add a short “Why this service?” decision helper for students, experienced candidates and freelancers.

### Highest-value trust improvements

1. Add the final business email, business hours and a clear service support policy.
2. Add payment instructions only after verified bKash/Nagad/Rocket/card accounts are available.
3. Add an SSLCommerz or other approved gateway for automated card/mobile-finance payment in a later phase.
4. Connect secure cloud storage with private access controls for CVs, photos, certificates and project files.
5. Add spam protection (Turnstile/reCAPTCHA), file-virus scanning and rate limiting to all real forms.

### SEO and content improvements

1. Confirm the production domain and update all canonical, sitemap and Open Graph URLs if needed.
2. Create a branded Open Graph image using the Career Minute logo and core message.
3. Publish Bangla-first and English content as dedicated server-rendered/static language routes for the best local SEO results.
4. Add a Career Notes blog with focused topics such as:
   - `CV vs Resume`
   - `ATS-friendly CV কী?`
   - `Fresh Graduate CV`
   - `Portfolio Website কেন প্রয়োজন?`
   - `LinkedIn Optimization`
5. Connect Google Search Console, GA4 and Meta Pixel; track service-page views, CTA clicks, order starts and submitted requests.

### Technical production improvements

1. Replace browser local-storage submissions with a Node.js API and PostgreSQL order database.
2. Create admin login, order statuses, customer file storage, request notes and payment-verification controls.
3. Send order confirmation via email and/or WhatsApp after secure server receipt.
4. Use cloud storage with signed/private URLs; never expose submitted CV documents publicly.
5. Perform Lighthouse, accessibility, form-security and cross-browser tests on the staging domain.

---

## Audience-journey conclusion

For a Bangladeshi visitor arriving from Facebook, the website now answers the key questions in a natural order:

1. **What is Career Minute?** A professional career-document and personal-brand service.
2. **Is this only CV making?** No—there are CVs, portfolio websites and supporting career documents.
3. **Which service suits me?** Dedicated service and pricing pages make the choice clear.
4. **Can I talk to someone first?** Yes—Facebook and WhatsApp are one tap away.
5. **What happens when I order?** The order page and thank-you page communicate the review, confirmation and delivery process.
6. **Can I trust the process?** The policy pages, clear claims, professional layout and explanations build confidence; verified testimonials and a live secure backend are the remaining critical trust upgrades.

## Final release recommendation

**Approve the design, bilingual public site and deployment build.**
**Before public payments and confidential file collection, configure and test the P0 operational settings: persistent storage, strong admin secrets, business email and verified merchant payment details.**
