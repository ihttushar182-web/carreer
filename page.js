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
    const fileStatus = $('.purchase-file-status');
    upload?.addEventListener('change', () => validateUpload(upload, fileStatus));
    orderForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const uploadOk = !upload || validateUpload(upload, fileStatus);
      if (!orderForm.checkValidity() || !uploadOk) {
        orderForm.reportValidity();
        return;
      }
      const data = Object.fromEntries(new FormData(orderForm).entries());
      const reference = `CM-${new Date().getFullYear()}${String(Math.floor(Math.random() * 9000) + 1000)}`;
      data.reference = reference;
      data.submittedAt = new Date().toISOString();
      data.file = upload?.files?.[0]?.name || '';
      try {
        const requests = JSON.parse(localStorage.getItem('careerMinuteRequests') || '[]');
        requests.push(data);
        localStorage.setItem('careerMinuteRequests', JSON.stringify(requests));
      } catch (_) { /* Submission flow remains available where local storage is disabled. */ }
      const selected = serviceField.options[serviceField.selectedIndex].text;
      window.location.assign(`/thank-you/?ref=${encodeURIComponent(reference)}&name=${encodeURIComponent(data.fullName)}&service=${encodeURIComponent(selected)}`);
    });
  }

  const contactForm = $('#contact-form');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(contactForm).entries());
    try {
      const messages = JSON.parse(localStorage.getItem('careerMinuteMessages') || '[]');
      messages.push({ ...data, submittedAt: new Date().toISOString() });
      localStorage.setItem('careerMinuteMessages', JSON.stringify(messages));
    } catch (_) { /* no-op */ }
    notify('Thank you. Your message is ready for the Career Minute team.');
    contactForm.reset();
  });

  const name = new URLSearchParams(window.location.search).get('name');
  const service = new URLSearchParams(window.location.search).get('service');
  const ref = new URLSearchParams(window.location.search).get('ref');
  const thankName = $('[data-thank-name]');
  if (thankName && name) thankName.textContent = name.split(' ')[0];
  const thankService = $('[data-thank-service]');
  if (thankService && service) thankService.textContent = service;
  const thankRef = $('[data-thank-ref]');
  if (thankRef && ref) thankRef.textContent = ref;
})();
