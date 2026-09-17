(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector)
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]))
  let settings = null

  async function request(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', ...options })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Request failed.')
    return body
  }
  function setMessage(selector, message, failed = false) {
    const element = $(selector); element.textContent = message; element.classList.toggle('error', failed)
  }
  function orderCard(order) {
    const date = new Date(order.createdAt).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' })
    const options = ['new', 'pending', 'information-review', 'in-progress', 'first-draft', 'revision', 'final-review', 'completed', 'cancelled']
      .map((status) => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status.replaceAll('-', ' ')}</option>`).join('')
    const paymentLabels = { pending: 'Pending verification', paid: 'Approved / paid', failed: 'Rejected / failed', refunded: 'Refunded' }
    const payments = ['pending', 'paid', 'failed', 'refunded'].map((status) => `<option value="${status}" ${order.paymentStatus === status ? 'selected' : ''}>${paymentLabels[status]}</option>`).join('')
    return `<article class="admin-order" data-order-id="${escapeHtml(order.id)}"><div class="admin-order-summary"><span class="admin-reference">${escapeHtml(order.reference)}</span><h3>${escapeHtml(order.fullName)}</h3><p>${escapeHtml(order.service)} · ${escapeHtml(order.profession)}</p><small>${escapeHtml(order.email)} · ${escapeHtml(order.phone)} · ${date}</small></div><div class="admin-order-goal"><b>Career goal</b><p>${escapeHtml(order.goal)}</p>${order.document ? `<small>Attachment: <a href="/api/admin/orders/${encodeURIComponent(order.id)}/files/document" target="_blank" rel="noreferrer">${escapeHtml(order.document.fileName)}</a></small>` : ''}${order.paymentMethod ? `<small>Payment method: ${escapeHtml(order.paymentMethod)} Personal</small>` : ''}${order.transactionId ? `<small>Transaction ID: ${escapeHtml(order.transactionId)}</small>` : ''}${order.paymentScreenshot ? `<small>Payment proof: <a href="/api/admin/orders/${encodeURIComponent(order.id)}/files/payment-proof" target="_blank" rel="noreferrer">${escapeHtml(order.paymentScreenshot.fileName)}</a></small>` : ''}</div><div class="admin-order-controls"><label>Order status<select name="status">${options}</select></label><label>Payment<select name="paymentStatus">${payments}</select></label><label>Internal note<textarea name="adminNote" rows="3" placeholder="Private note for the team">${escapeHtml(order.adminNote)}</textarea></label><button type="button" class="admin-save-order">Save update</button></div></article>`
  }
  function renderOrders(orders) {
    const container = $('#admin-orders')
    if (!orders.length) { container.innerHTML = '<p class="admin-empty">No service requests match this view yet.</p>'; return }
    container.innerHTML = orders.map(orderCard).join('')
    container.querySelectorAll('.admin-save-order').forEach((button) => button.addEventListener('click', async () => {
      const card = button.closest('.admin-order'); button.disabled = true; button.textContent = 'Saving…'
      try {
        await request(`/api/admin/orders/${encodeURIComponent(card.dataset.orderId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: $('[name="status"]', card).value, paymentStatus: $('[name="paymentStatus"]', card).value, adminNote: $('[name="adminNote"]', card).value }) })
        button.textContent = 'Saved ✓'; setTimeout(() => { button.textContent = 'Save update'; button.disabled = false }, 1200)
        loadDashboard()
      } catch (error) { button.textContent = error.message; button.disabled = false }
    }))
  }
  function updateStats(orders) {
    $('[data-stat="new"]').textContent = orders.filter((order) => order.status === 'new').length
    $('[data-stat="in-progress"]').textContent = orders.filter((order) => ['in-progress', 'first-draft', 'revision', 'final-review'].includes(order.status)).length
    $('[data-stat="completed"]').textContent = orders.filter((order) => order.status === 'completed').length
    $('[data-stat="payment"]').textContent = orders.filter((order) => order.paymentStatus === 'pending').length
  }
  function populateSettings(value) {
    settings = value
    const form = $('#admin-settings-form')
    form.businessEmail.value = value.businessEmail || ''; form.businessHours.value = value.businessHours || ''; form.whatsappNumber.value = value.whatsappNumber || ''; form.facebookUrl.value = value.facebookUrl || ''
    form.googleMeasurementId.value = value.analytics?.googleMeasurementId || ''; form.metaPixelId.value = value.analytics?.metaPixelId || ''
    for (const method of ['bKash', 'Nagad', 'Rocket', 'Card']) {
      form[`${method}Enabled`].checked = Boolean(value.payment?.[method]?.enabled)
      form[`${method}Account`].value = value.payment?.[method]?.account || ''
      form[`${method}Instruction`].value = value.payment?.[method]?.instruction || ''
    }
    const bindPackage = (prefix, key) => { const item = value.packages?.[key] || {}; form[`${prefix}Price`].value = item.price || ''; form[`${prefix}Days`].value = item.deliveryDays || ''; form[`${prefix}Revisions`].value = item.revisions || '' }
    bindPackage('cvFoundation', 'cv-foundation'); bindPackage('cvMomentum', 'cv-momentum'); bindPackage('portfolioShowcase', 'portfolio-showcase'); bindPackage('personalBrand', 'personal-brand-pack')
  }
  async function loadDashboard() {
    const filter = $('#admin-status-filter').value
    const [orderResult, settingsResult] = await Promise.all([request(`/api/admin/orders${filter ? `?status=${encodeURIComponent(filter)}` : ''}`), request('/api/admin/settings')])
    renderOrders(orderResult.orders); updateStats(orderResult.orders); populateSettings(settingsResult)
  }

  $('#admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); const button = $('button', event.currentTarget); button.disabled = true
    try {
      await request('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) })
      $('#admin-login').hidden = true; $('#admin-dashboard').hidden = false; await loadDashboard()
    } catch (error) { setMessage('#admin-login-message', error.message, true) } finally { button.disabled = false }
  })
  $('#admin-logout').addEventListener('click', async () => { try { await request('/api/admin/logout', { method: 'POST' }) } finally { window.location.reload() } })
  $('#admin-refresh').addEventListener('click', () => loadDashboard().catch((error) => setMessage('#admin-settings-message', error.message, true)))
  $('#admin-status-filter').addEventListener('change', () => loadDashboard().catch((error) => setMessage('#admin-settings-message', error.message, true)))
  $('#admin-settings-form').addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); const button = $('button[type="submit"]', form); button.disabled = true
    const payment = {}; for (const method of ['bKash', 'Nagad', 'Rocket', 'Card']) payment[method] = { enabled: Boolean(form[`${method}Enabled`].checked), account: values[`${method}Account`], instruction: values[`${method}Instruction`] }
    const packageValue = (prefix, key) => ({ ...settings.packages[key], price: values[`${prefix}Price`], deliveryDays: values[`${prefix}Days`], revisions: values[`${prefix}Revisions`] })
    const packages = { ...settings.packages, 'cv-foundation': packageValue('cvFoundation', 'cv-foundation'), 'cv-momentum': packageValue('cvMomentum', 'cv-momentum'), 'portfolio-showcase': packageValue('portfolioShowcase', 'portfolio-showcase'), 'personal-brand-pack': packageValue('personalBrand', 'personal-brand-pack') }
    try {
      const response = await request('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessEmail: values.businessEmail, businessHours: values.businessHours, whatsappNumber: values.whatsappNumber, facebookUrl: values.facebookUrl, analytics: { googleMeasurementId: values.googleMeasurementId, metaPixelId: values.metaPixelId }, payment, packages }) })
      settings = { ...settings, ...response.settings, payment, packages }; setMessage('#admin-settings-message', 'Public settings saved successfully.')
    } catch (error) { setMessage('#admin-settings-message', error.message, true) } finally { button.disabled = false }
  })
})()
