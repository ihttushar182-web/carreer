(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const menuButton = $('.menu-button');
  const nav = $('.main-nav');
  menuButton?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('.main-nav a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('shown'); observer.unobserve(entry.target); }
  }), { threshold: 0.1 });
  $$('.reveal').forEach((element) => observer.observe(element));

  const toast = $('.toast');
  let timeout;
  const notify = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(timeout);
    timeout = setTimeout(() => toast.classList.remove('visible'), 3600);
  };

  const validateUpload = (input, status) => {
    const file = input.files?.[0];
    if (!file) return true;
    const extension = file.name.split('.').pop().toLowerCase();
    const supported = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'].includes(extension);
    if (!supported || file.size > 10 * 1024 * 1024) {
      status.textContent = 'Please use a PDF, DOCX, JPG or PNG under 10 MB.';
      status.classList.add('error');
      input.value = '';
      return false;
    }
    status.textContent = `Attached: ${file.name}`;
    status.classList.remove('error');
    return true;
  };

  const orderForm = $('#purchase-form');
  if (orderForm) {
    const params = new URLSearchParams(window.location.search);
    const requestedService = params.get('service');
    const serviceField = $('#requested-service');
    const serviceDisplay = $('#selected-service-display');
    if (requestedService && serviceField) {
      const matching = Array.from(serviceField.options).find((option) => option.value.toLowerCase() === requestedService.toLowerCase());
      if (matching) serviceField.value = matching.value;
    }
    const updateService = () => { if (serviceDisplay) serviceDisplay.textContent = serviceField.options[serviceField.selectedIndex].text; };
    serviceField?.addEventListener('change', updateService);
    updateService();

    const upload = $('#project-file');
    const paymentUpload = $('input[name="paymentScreenshot"]');
    const fileStatus = $('.purchase-file-status');
    upload?.addEventListener('change', () => validateUpload(upload, fileStatus));
    paymentUpload?.addEventListener('change', () => validateUpload(paymentUpload, fileStatus));
    orderForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const uploadOk = (!upload || validateUpload(upload, fileStatus)) && (!paymentUpload || validateUpload(paymentUpload, fileStatus));
      if (!orderForm.checkValidity() || !uploadOk) {
        orderForm.reportValidity();
        return;
      }
      const submitButton = orderForm.querySelector('button[type="submit"]');
      const request = new FormData(orderForm);
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting…';
      try {
        const response = await fetch('/api/orders', { method: 'POST', body: request, credentials: 'same-origin' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Your request could not be submitted.');
        const selected = serviceField.options[serviceField.selectedIndex].text;
        window.CareerMinuteAnalytics?.track('order_submit', selected);
        window.location.assign(`/thank-you/?ref=${encodeURIComponent(result.reference)}&name=${encodeURIComponent(request.get('fullName'))}&service=${encodeURIComponent(selected)}`);
      } catch (error) {
        fileStatus.textContent = error.message || 'Unable to submit right now. Please message us on WhatsApp.';
        fileStatus.classList.add('error');
        submitButton.disabled = false;
        submitButton.innerHTML = 'Submit my request <span>→</span>';
      }
    });
  }

  const contactForm = $('#contact-form');
  contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
    const button = contactForm.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(contactForm).entries());
    button.disabled = true;
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your message could not be sent.');
      window.CareerMinuteAnalytics?.track('contact_submit', data.topic);
      notify('Thank you. Career Minute has received your message.');
      contactForm.reset();
    } catch (error) {
      notify(error.message || 'Unable to send your message right now. Please use WhatsApp.');
    } finally { button.disabled = false; }
  });

  const trackingForm = $('#order-tracking-form');
  const trackingResult = $('[data-tracking-result]');
  if (trackingForm && trackingResult) {
    const initialReference = new URLSearchParams(window.location.search).get('ref');
    if (initialReference) trackingForm.elements.reference.value = initialReference.toUpperCase();
    const isBangla = document.documentElement.lang === 'bn';
    const statusLabels = isBangla ? {
      new: 'রিকোয়েস্ট পাওয়া গেছে', pending: 'অপেক্ষমাণ', 'information-review': 'তথ্য পর্যালোচনায়', 'in-progress': 'কাজ চলছে', 'first-draft': 'প্রথম ড্রাফট প্রস্তুত', revision: 'রিভিশন চলছে', 'final-review': 'চূড়ান্ত পর্যালোচনায়', completed: 'ডেলিভারি সম্পন্ন', cancelled: 'বাতিল'
    } : {
      new: 'Request received', pending: 'Pending', 'information-review': 'Information review', 'in-progress': 'In production', 'first-draft': 'First draft ready', revision: 'Revision in progress', 'final-review': 'Final review', completed: 'Delivery completed', cancelled: 'Cancelled'
    };
    const paymentLabels = isBangla ? { pending: 'পেমেন্ট অপেক্ষমাণ', paid: 'পেমেন্ট যাচাইকৃত', failed: 'পেমেন্ট ব্যর্থ', refunded: 'রিফান্ড করা হয়েছে' } : { pending: 'Payment pending', paid: 'Payment verified', failed: 'Payment failed', refunded: 'Payment refunded' };
    const renderTracking = (lines, isError = false) => {
      trackingResult.replaceChildren();
      trackingResult.hidden = false;
      trackingResult.classList.toggle('error', isError);
      lines.forEach(({ text, prominent }) => {
        const item = document.createElement('p');
        item.textContent = text;
        if (prominent) item.className = 'track-status';
        trackingResult.append(item);
      });
    };
    trackingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const reference = trackingForm.elements.reference;
      reference.value = reference.value.trim().toUpperCase();
      if (!trackingForm.checkValidity()) { trackingForm.reportValidity(); return; }
      const submitButton = trackingForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = isBangla ? 'খোঁজা হচ্ছে…' : 'Checking…';
      try {
        const response = await fetch('/api/orders/track', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
          body: JSON.stringify(Object.fromEntries(new FormData(trackingForm).entries())),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || (isBangla ? 'অবস্থা পাওয়া যায়নি।' : 'Unable to retrieve status.'));
        const order = result.order;
        const updated = new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-GB', { dateStyle: 'medium' }).format(new Date(order.updatedAt));
        renderTracking([
          { text: `${isBangla ? 'রেফারেন্স' : 'Reference'}: ${order.reference}` },
          { text: statusLabels[order.status] || order.status, prominent: true },
          { text: `${isBangla ? 'সার্ভিস' : 'Service'}: ${order.service}` },
          { text: `${isBangla ? 'পেমেন্ট' : 'Payment'}: ${paymentLabels[order.paymentStatus] || order.paymentStatus}` },
          { text: `${isBangla ? 'সর্বশেষ আপডেট' : 'Last updated'}: ${updated}` },
        ]);
      } catch (error) {
        renderTracking([{ text: error.message || (isBangla ? 'এখন অবস্থা দেখা যাচ্ছে না।' : 'Status is unavailable right now.') }], true);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = isBangla ? 'অবস্থা দেখুন <span>→</span>' : 'Check status <span>→</span>';
      }
    });
  }

  const name = new URLSearchParams(window.location.search).get('name');
  const service = new URLSearchParams(window.location.search).get('service');
  const ref = new URLSearchParams(window.location.search).get('ref');
  const thankName = $('[data-thank-name]');
  if (thankName && name) thankName.textContent = name.split(' ')[0];
  const thankService = $('[data-thank-service]');
  if (thankService && service) thankService.textContent = service;
  const thankRef = $('[data-thank-ref]');
  if (thankRef && ref) thankRef.textContent = ref;
  const trackingLink = $('[data-track-link]');
  if (trackingLink && ref) {
    const url = new URL(trackingLink.href, window.location.origin);
    url.searchParams.set('ref', ref);
    trackingLink.href = `${url.pathname}${url.search}`;
  }
})();
