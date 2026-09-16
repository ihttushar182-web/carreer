(() => {
  const $all = (selector) => Array.from(document.querySelectorAll(selector))
  const formatPrice = (price) => {
    const numeric = Number(String(price || '').replace(/[^0-9.]/g, ''))
    return Number.isFinite(numeric) && numeric > 0 ? `৳${numeric.toLocaleString('en-BD')}` : ''
  }
  const getSettings = async () => {
    try {
      const response = await fetch('/api/settings', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      if (!response.ok) return null
      return await response.json()
    } catch { return null }
  }
  getSettings().then((settings) => {
    if (!settings) return
    window.careerMinuteSettings = settings
    $all('[data-package-price]').forEach((element) => {
      const packageInfo = settings.packages?.[element.dataset.packagePrice]
      const price = formatPrice(packageInfo?.price)
      if (!price) return
      const isBangla = document.documentElement.dataset.language !== 'en'
      const delivery = packageInfo.deliveryDays ? ` · ${packageInfo.deliveryDays} ${isBangla ? 'দিন' : 'days'}` : ''
      const revisions = packageInfo.revisions ? ` · ${packageInfo.revisions} ${isBangla ? 'রিভিশন' : 'revisions'}` : ''
      const label = isBangla ? 'প্যাকেজ শুরু' : 'Starting package'
      element.innerHTML = `${price}<small>${label}${delivery}${revisions}</small>`
    })
    $all('[data-business-email]').forEach((element) => {
      if (!settings.businessEmail) return
      if (element.tagName === 'A') element.href = `mailto:${settings.businessEmail}`
      element.textContent = settings.businessEmail
    })
    $all('[data-business-hours]').forEach((element) => { if (settings.businessHours) element.textContent = settings.businessHours })
    $all('[data-business-email-link]').forEach((element) => { if (settings.businessEmail) element.href = `mailto:${settings.businessEmail}` })
    const paymentHint = document.querySelector('[data-payment-instructions]')
    const paymentChoices = $all('[name="paymentMethod"]')
    const showPaymentInstructions = () => {
      const choice = paymentChoices.find((input) => input.checked)?.value
      const details = choice && settings.payment?.[choice]
      if (!paymentHint) return
      paymentHint.textContent = details?.enabled
        ? [details.account ? `Pay to: ${details.account}.` : '', details.instruction || 'Use the verified payment details shared by Career Minute.'].filter(Boolean).join(' ')
        : 'Payment instructions will be shared after Career Minute confirms your service scope.'
    }
    paymentChoices.forEach((input) => input.addEventListener('change', showPaymentInstructions))
    showPaymentInstructions()
  })
})()
