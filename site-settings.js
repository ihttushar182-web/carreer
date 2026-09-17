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
    const isBangla = (document.documentElement.dataset.language || document.documentElement.lang) !== 'en'

    $all('[data-package-price]').forEach((element) => {
      const packageInfo = settings.packages?.[element.dataset.packagePrice]
      const price = formatPrice(packageInfo?.price)
      if (!price) return
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
    const transactionInput = document.querySelector('[name="transactionId"]')
    const transactionHelp = document.querySelector('[data-transaction-help]')
    const waitingCopy = isBangla
      ? 'bKash Personal বা Nagad Personal নির্বাচন করলে Send Money-এর নির্দেশনা দেখুন।'
      : 'Select bKash Personal or Nagad Personal to see the Send Money instructions.'
    const verificationCopy = isBangla
      ? 'Send Money করার পর Transaction ID দিন। পেমেন্ট অ্যাডমিন যাচাই ও অনুমোদন না করা পর্যন্ত অপেক্ষমাণ থাকবে।'
      : 'After Send Money, enter the Transaction ID. Payment stays pending until an authenticated admin manually verifies and approves it.'

    const showPaymentInstructions = () => {
      const choice = paymentChoices.find((input) => input.checked)?.value
      const details = choice && settings.payment?.[choice]
      const enabled = Boolean(details?.enabled)
      if (paymentHint) {
        paymentHint.textContent = enabled
          ? [details.account ? `${choice} Personal · Send Money to: ${details.account}.` : '', details.instruction || verificationCopy].filter(Boolean).join(' ')
          : waitingCopy
      }
      if (transactionInput) transactionInput.required = enabled
      if (transactionHelp) transactionHelp.textContent = enabled
        ? (isBangla ? 'Send Money-এর পর আবশ্যক; অ্যাডমিন হাতে ধরে যাচাই করবেন' : 'required after Send Money; an admin verifies it manually')
        : (isBangla ? 'Send Money করলে আবশ্যক; পেমেন্ট না করলে খালি রাখুন' : 'required only when you use Send Money')
    }
    paymentChoices.forEach((input) => input.addEventListener('change', showPaymentInstructions))
    showPaymentInstructions()
  })
})()
