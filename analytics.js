(() => {
  const consentKey = 'careerMinuteAnalyticsConsent'
  let enabled = false
  let settings = null

  const eventPayload = (event, detail = '') => ({ event, detail: String(detail).slice(0, 160), page: window.location.pathname })
  async function record(event, detail = '') {
    if (!enabled) return
    const payload = eventPayload(event, detail)
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: `career_minute_${payload.event}`, ...payload })
    if (typeof window.fbq === 'function') window.fbq('trackCustom', `CareerMinute${payload.event.replace(/(^|_)([a-z])/g, (_, _lead, letter) => letter.toUpperCase())}`, { detail: payload.detail })
    try { await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(payload) }) } catch { /* analytics should never interrupt a visitor action */ }
  }
  function injectGoogle(id) {
    if (!id || document.querySelector(`script[data-ga-id="${id}"]`)) return
    const script = document.createElement('script'); script.async = true; script.dataset.gaId = id; script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`; document.head.append(script)
    window.dataLayer = window.dataLayer || []; window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments) }; window.gtag('js', new Date()); window.gtag('config', id, { anonymize_ip: true })
  }
  function injectMeta(id) {
    if (!id || window.fbq) return
    window.fbq = function fbq(){ window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments) }
    window.fbq.queue = []; window.fbq.loaded = true; window.fbq.version = '2.0'
    const script = document.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.append(script)
    window.fbq('init', id); window.fbq('track', 'PageView')
  }
  function enableTracking() {
    enabled = true
    if (settings?.analytics) { injectGoogle(settings.analytics.googleMeasurementId); injectMeta(settings.analytics.metaPixelId) }
    record('page_view')
  }
  function renderConsent() {
    if (localStorage.getItem(consentKey)) { if (localStorage.getItem(consentKey) === 'accepted') enableTracking(); return }
    const bangla = document.documentElement.dataset.language !== 'en'
    const banner = document.createElement('aside')
    banner.className = 'analytics-consent'
    banner.setAttribute('aria-label', bangla ? 'অ্যানালিটিক্স পছন্দ' : 'Analytics preference')
    banner.innerHTML = bangla
      ? '<p><strong>গোপনীয়তার পছন্দ</strong> কোন ক্যারিয়ার মিনিট সার্ভিসটি ভিজিটরদের বেশি উপকারী মনে হচ্ছে তা জানতে আমরা ঐচ্ছিক অ্যানালিটিক্স ব্যবহার করি।</p><div><button type="button" data-analytics-decline>শুধু প্রয়োজনীয়</button><button type="button" data-analytics-accept>অ্যানালিটিক্স অনুমতি দিন</button></div>'
      : '<p><strong>Privacy choice</strong> We use optional analytics to learn which Career Minute services visitors find helpful.</p><div><button type="button" data-analytics-decline>Essential only</button><button type="button" data-analytics-accept>Allow analytics</button></div>'
    document.body.append(banner)
    banner.querySelector('[data-analytics-decline]').addEventListener('click', () => { localStorage.setItem(consentKey, 'declined'); banner.remove() })
    banner.querySelector('[data-analytics-accept]').addEventListener('click', () => { localStorage.setItem(consentKey, 'accepted'); banner.remove(); enableTracking() })
  }
  window.CareerMinuteAnalytics = { track: record }
  document.addEventListener('click', (event) => {
    const action = event.target.closest('a.button, button.button, .card-link, .quick-contact a, .mobile-sticky a')
    if (!action) return
    record('cta_click', action.dataset.service || action.textContent.replace(/\s+/g, ' ').trim())
  })
  fetch('/api/settings', { credentials: 'same-origin' }).then((response) => response.ok ? response.json() : null).then((value) => { settings = value; renderConsent() }).catch(renderConsent)
})()
