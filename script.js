/* YourCompany website scripts: vanilla JS, no dependencies */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---- Reference-style announcement bar and header ---- */
  if (!$('.announcement')) {
    const applyLink = document.querySelector('.menu a[href="#apply"], .menu a[href="index.html#apply"]');
    const announcement = document.createElement('div');
    announcement.className = 'announcement';
    announcement.innerHTML = '<a href="' + (applyLink ? applyLink.getAttribute('href') : '#apply') + '">Plan your 2027 internship - Apply today! <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a>';
    document.body.prepend(announcement);
  }

  const navIn = $('.nav-in');
  if (navIn && !$('.nav-tools')) {
    const tools = document.createElement('div');
    tools.className = 'nav-tools';
    tools.innerHTML = '<a href="destinations.html" aria-label="Search destinations"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></a><a href="programs.html" aria-label="Saved internship programs"><i class="fa-regular fa-heart" aria-hidden="true"></i></a>';
    navIn.appendChild(tools);
  }

  /* ---- Configuration: EDIT HERE ---- */
  const WHATSAPP_NUMBER = '0000000000'; // PLACEHOLDER: country code + number, digits only
  $$('[data-wa]').forEach(a => a.href = a.href.replace('0000000000', WHATSAPP_NUMBER));
  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Missing photos: hide broken <img> so the gradient fallback shows ---- */
  $$('img').forEach(img => {
    const hide = () => img.style.display = 'none';
    img.addEventListener('error', hide);
    if (img.complete && !img.naturalWidth) hide();
  });

  /* ---- Sticky nav, back-to-top ---- */
  const nav = $('#nav'), top = $('#top');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 40);
    top.classList.toggle('show', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---- Mobile menu ---- */
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) nav.classList.add('scrolled'); else onScroll();
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---- Scroll reveal ---- */
  const revealEls = $$('.card, .dest, .steps li, .faq details, .form, .slider');
  revealEls.forEach((el, i) => { el.classList.add('rv'); el.style.setProperty('--i', i % 4); });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); setTimeout(() => e.target.classList.remove('rv', 'in'), 1300); }
  }), { threshold: .12 });
  revealEls.forEach(el => io.observe(el));

  /* ---- Counters: only animate when data-count > 0 (real numbers supplied) ---- */
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count;
    co.unobserve(el);
    if (!(end > 0)) return; // placeholder stays as "—"
    let n = 0; const step = Math.max(1, Math.ceil(end / 60));
    const t = setInterval(() => { n = Math.min(end, n + step); el.textContent = n + '+'; if (n >= end) clearInterval(t); }, 25);
  }), { threshold: .5 });
  $$('.count').forEach(el => co.observe(el));

  /* ---- FAQ: one open at a time ---- */
  const faqs = $$('.faq details');
  faqs.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach(o => o !== d && (o.open = false));
  }));

  /* ---- Testimonial slider (home page only) ---- */
  const slides = $$('.slide'), dots = $('#dots'), prevBtn = $('#prev'), nextBtn = $('#next');
  if (slides.length && dots && prevBtn && nextBtn) {
    let cur = 0, timer;
    slides.forEach(() => dots.appendChild(document.createElement('i')));
    const show = i => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('on', k === cur));
      $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === cur));
    };
    const auto = () => { clearInterval(timer); timer = setInterval(() => show(cur + 1), 6000); };
    prevBtn.onclick = () => { show(cur - 1); auto(); };
    nextBtn.onclick = () => { show(cur + 1); auto(); };
    show(0); auto();
  }

  /* ---- Destination buttons pre-select the country in the form ---- */
  $$('[data-country]').forEach(b => b.addEventListener('click', () => {
    const sel = $('#country');
    if (!sel) return;
    const opt = [...sel.options].find(o => o.text.startsWith(b.dataset.country));
    if (opt) sel.value = opt.value;
  }));

  /* ---- Form validation (frontend only; home page) ---- */
  const form = $('#form'), ok = $('#ok');
  if (form && ok) {
  const rules = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email, e.g. name@example.com.',
    phone: v => /^\+?[0-9\s-]{8,15}$/.test(v) || 'Enter a valid phone number with 8 to 15 digits.',
    year: v => (v >= 2015 && v <= 2035) || 'Enter a graduation year between 2015 and 2035.'
  };
  function check(f) {
    const v = f.value.trim(); let msg = '';
    if (f.required && !v) msg = 'This field is required.';
    else if (v && rules[f.name]) { const r = rules[f.name](v); if (r !== true) msg = r; }
    f.classList.toggle('bad', !!msg);
    let e = f.parentElement.querySelector('.err');
    if (msg) { if (!e) { e = document.createElement('span'); e.className = 'err'; e.setAttribute('role', 'alert'); f.after(e); } e.textContent = msg; }
    else if (e) e.remove();
    return !msg;
  }
  $$('input, select, textarea', form).forEach(f => f.addEventListener('blur', () => check(f)));
  form.addEventListener('submit', async ev => {
    ev.preventDefault(); ok.hidden = true;
    const fields = $$('input, select, textarea', form);
    const valid = fields.map(check).every(Boolean);
    if (!valid) return fields.find(f => f.classList.contains('bad')).focus();

    const data = Object.fromEntries(new FormData(form));
    const btn = $('button[type=submit]', form); btn.disabled = true;
    /* BACKEND REQUIRED: this form does NOT send data anywhere yet.
       To receive applications, POST `data` to your own API or a form service
       (e.g. Formspree, Google Apps Script, or your server), for example:
       await fetch('https://YOUR-ENDPOINT', { method:'POST',
         headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }); */
    await new Promise(r => setTimeout(r, 600)); // simulated delay
    btn.disabled = false; form.reset(); ok.hidden = false; ok.scrollIntoView({ block: 'center' });
  });

  const params = new URLSearchParams(location.search);
  const pick = (sel, want) => {
    if (!sel || !want) return;
    const opt = [...sel.options].find(o => o.value === want || o.text === want || o.text.startsWith(want));
    if (opt) sel.value = opt.value;
  };
  pick($('#country'), params.get('country'));
  pick($('[name=domain]'), params.get('domain'));
  }

  /* ---- Scroll progress bar + hero rings parallax ---- */
  const bar = $('#progress'), rings = $('.rings');
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar && max > 0) bar.style.width = (scrollY / max * 100) + '%';
    if (rings && scrollY < 900) rings.style.transform = `translateY(calc(-50% + ${scrollY * .15}px))`;
  }, { passive: true });

  /* ---- Card spotlight follows the pointer ---- */
  $$('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ---- Process line draws when visible ---- */
  const steps = $('.steps');
  if (steps) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { steps.classList.add('go'); o.disconnect(); } }), { threshold: .3 }).observe(steps);

  /* ---- Highlight current section in the menu ---- */
  const links = $$('.menu a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const s = $(l.getAttribute('href')); if (s) spy.observe(s); });
})();
