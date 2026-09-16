(() => {
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const $ = (selector, scope = document) => scope.querySelector(selector);

  $('#year').textContent = new Date().getFullYear();

  // Compact mobile navigation
  const menuButton = $('.menu-button');
  const nav = $('.main-nav');
  menuButton?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  $$('.main-nav a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  // Reveal content as it enters the viewport. Keep hero immediately visible.
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('shown');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((element) => revealObserver.observe(element));

  // Feature solution tabs
  $$('.feature-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const chosen = tab.dataset.feature;
      $$('.feature-tab').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      $$('.feature-panel').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === chosen));
    });
  });

  // Configurable package category tabs
  $$('.pricing-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const chosen = tab.dataset.pricing;
      $$('.pricing-tab').forEach((item) => item.classList.toggle('active', item === tab));
      $$('.price-cards').forEach((panel) => panel.classList.toggle('active', panel.dataset.pricePanel === chosen));
    });
  });

  // Testimonial carousel
  const testimonials = $$('.testimonial');
  let activeTestimonial = 0;
  const renderTestimonial = (direction = 1) => {
    testimonials.forEach((item, index) => item.classList.toggle('active', index === activeTestimonial));
    $('.testimonial-count').innerHTML = `${String(activeTestimonial + 1).padStart(2, '0')} <i></i> ${String(testimonials.length).padStart(2, '0')}`;
  };
  $('.slide-next')?.addEventListener('click', () => { activeTestimonial = (activeTestimonial + 1) % testimonials.length; renderTestimonial(1); });
  $('.slide-prev')?.addEventListener('click', () => { activeTestimonial = (activeTestimonial - 1 + testimonials.length) % testimonials.length; renderTestimonial(-1); });

  // Helpful lightweight notifications for channels that need business details before launch
  const toast = $('.toast');
  let toastTimeout;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('visible'), 4200);
  }
  $$('[data-show-toast]').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    showToast(button.dataset.showToast);
  }));
  $$('[data-open-sample]').forEach((button) => button.addEventListener('click', () => {
    const kind = button.dataset.openSample === 'cv' ? 'CV sample previews' : 'live portfolio sample previews';
    showToast(`More ${kind} will be added from Career Minute’s approved client work.`);
  }));

  // Order request modal and progressive form
  const modal = $('#order-modal');
  const form = $('#order-form');
  const progressCurrent = $('.form-progress-current');
  const progressBar = $('.form-progress i');
  let activeStep = 1;

  function normalizeService(service) {
    if (!service || service === 'Career profile') return 'Career Profile / Bundle';
    if (service.includes('Portfolio')) return 'Portfolio Website';
    if (service.includes('CV')) return 'Professional CV';
    if (service.includes('Document')) return 'Career Document';
    if (service.includes('Pack') || service.includes('Bundle')) return 'Career Profile / Bundle';
    return service;
  }

  function openModal(service) {
    const previousRequestWasSubmitted = $('.form-success', form).classList.contains('visible');
    if (previousRequestWasSubmitted) {
      form.reset();
      fileStatus.textContent = '';
    }
    const serviceInput = $(`input[name="service"][value="${normalizeService(service)}"]`, form);
    if (serviceInput) serviceInput.checked = true;
    setStep(1);
    $$('.form-success', form).forEach((item) => item.classList.remove('visible'));
    $$('.form-step', form).forEach((item) => item.style.display = '');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => $('.modal-close').focus(), 50);
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
  $$('[data-open-order]').forEach((button) => button.addEventListener('click', () => openModal(button.dataset.service)));
  $$('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  function setStep(step) {
    activeStep = step;
    $$('.form-step', form).forEach((item) => item.classList.toggle('active', Number(item.dataset.step) === step));
    progressCurrent.textContent = `Step ${step} of 3`;
    progressBar.style.width = `${step * 33.333}%`;
    $('.order-main').scrollTop = 0;
  }
  function errorFor(key, message = '') {
    const element = $(`[data-error-for="${key}"]`, form);
    if (element) element.textContent = message;
  }
  function validateStep(step) {
    if (step === 1) {
      const selected = $('input[name="service"]:checked', form);
      errorFor('service', selected ? '' : 'Please choose a service to continue.');
      return Boolean(selected);
    }
    if (step === 2) {
      const fields = $$('[data-step="2"] [required]', form).filter((field) => field.type !== 'file');
      const invalid = fields.find((field) => !field.value.trim() || !field.checkValidity());
      errorFor('details', invalid ? 'Please complete the highlighted details with a valid email address.' : '');
      if (invalid) {
        invalid.focus();
        return false;
      }
      return true;
    }
    if (step === 3) {
      const valid = $('input[name="consent"]', form).checked;
      errorFor('consent', valid ? '' : 'Please confirm your consent before submitting.');
      return valid;
    }
    return true;
  }
  function fillReview() {
    const data = new FormData(form);
    const service = data.get('service');
    $('.request-review').innerHTML = [
      ['Service', service],
      ['Name', data.get('fullName')],
      ['Email', data.get('email')],
      ['Phone', data.get('phone')],
      ['Goal', data.get('goal')],
    ].map(([label, value]) => `<p><b>${label}:</b>${escapeHtml(value || '—')}</p>`).join('');
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }
  $$('.form-next', form).forEach((button) => button.addEventListener('click', () => {
    if (!validateStep(activeStep)) return;
    if (activeStep === 2) fillReview();
    setStep(Math.min(3, activeStep + 1));
  }));
  $$('.form-back', form).forEach((button) => button.addEventListener('click', () => setStep(Math.max(1, activeStep - 1))));

  const fileInput = $('input[name="file"]', form);
  const fileStatus = $('.file-status', form);
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) { fileStatus.textContent = ''; return; }
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    const extension = file.name.split('.').pop().toLowerCase();
    const allowedExtension = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'].includes(extension);
    if ((!allowed.includes(file.type) && !allowedExtension) || file.size > 10 * 1024 * 1024) {
      fileStatus.textContent = 'Please upload a PDF, DOCX, JPG or PNG under 10 MB.';
      fileStatus.style.color = '#bf4c43';
      fileInput.value = '';
      return;
    }
    fileStatus.textContent = `Attached: ${file.name} (${Math.ceil(file.size / 1024)} KB)`;
    fileStatus.style.color = '#3b8e7d';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateStep(3)) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const reference = `CM-${new Date().getFullYear()}${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const submission = { ...data, reference, submittedAt: new Date().toISOString(), file: fileInput.files?.[0]?.name || null };
    try {
      const submissions = JSON.parse(localStorage.getItem('careerMinuteRequests') || '[]');
      submissions.push(submission);
      localStorage.setItem('careerMinuteRequests', JSON.stringify(submissions));
    } catch (_) { /* The confirmation still works when storage is unavailable. */ }
    $('.success-name').textContent = data.fullName.split(' ')[0] || 'there';
    $('.order-reference').textContent = reference;
    $$('.form-step', form).forEach((item) => item.style.display = 'none');
    $('.form-success', form).classList.add('visible');
    progressCurrent.textContent = 'Request submitted';
    progressBar.style.width = '100%';
  });

  // Newsletter lead capture is intentionally local until email provider is connected.
  $('#newsletter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = $('#newsletter-email').value.trim();
    if (!email || !$('#newsletter-email').checkValidity()) {
      $('#newsletter-email').focus();
      return;
    }
    try {
      const subscribers = JSON.parse(localStorage.getItem('careerMinuteNewsletter') || '[]');
      if (!subscribers.includes(email)) subscribers.push(email);
      localStorage.setItem('careerMinuteNewsletter', JSON.stringify(subscribers));
    } catch (_) { /* no-op */ }
    event.currentTarget.reset();
    showToast('You’re on the Career Minute notes list. Welcome.');
  });
})();
