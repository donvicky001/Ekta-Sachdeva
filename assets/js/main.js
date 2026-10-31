/* Ekta Sachdeva · interactions (no dependencies) */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  if (reduce) document.documentElement.classList.add('no-motion');

  /* ---------- nav: solid on scroll, hide on scroll down, progress bar ---------- */
  const nav = $('#nav');
  const bar = $('.progress i');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    nav.classList.toggle('solid', y > 30);
    if (!menu.classList.contains('open')) nav.classList.toggle('hide', y > lastY && y > 400);
    lastY = y;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = $('.burger');
  const menu = $('#menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      $$('a', menu).forEach((a, i) => (a.style.transitionDelay = `${0.05 + i * 0.035}s`));
      requestAnimationFrame(() => menu.classList.add('open'));
    } else {
      menu.classList.remove('open');
      setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 400);
    }
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });
  onScroll();

  /* ---------- active nav link ---------- */
  const navLinks = $$('.links a');
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const s = $(a.getAttribute('href')); if (s) secObs.observe(s); });

  /* ---------- count-up numbers (keeps original formatting) ---------- */
  const NUM = /\d[\d,]*(?:\.\d+)?/g;
  const countUp = (el) => {
    const tpl = el.dataset.final || el.textContent;
    el.dataset.final = tpl;
    if (reduce) return;
    const parts = [...tpl.matchAll(NUM)].map((m) => {
      const raw = m[0];
      const dec = (raw.split('.')[1] || '').length;
      return { raw, val: parseFloat(raw.replace(/,/g, '')), dec, comma: raw.includes(',') };
    });
    if (!parts.length) return;
    const fmt = (p, v) => {
      let s = v.toFixed(p.dec);
      if (p.comma) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: p.dec, maximumFractionDigits: p.dec });
      return s;
    };
    const dur = 1600, t0 = performance.now();
    el.style.minWidth = el.offsetWidth + 'px';
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 4);
      let i = 0;
      el.textContent = tpl.replace(NUM, () => fmt(parts[i], parts[i++].val * e));
      if (t < 1) requestAnimationFrame(step);
      else { el.textContent = tpl; el.style.minWidth = ''; }
    };
    requestAnimationFrame(step);
  };

  /* ---------- reveal on scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      revealObs.unobserve(el);
      $$('[data-count]', el).forEach(countUp);
      if (el.matches('[data-count]')) countUp(el);
      if (el.classList.contains('donutwrap')) drawDonut();
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach((el) => revealObs.observe(el));

  /* counters not inside a reveal block (e.g. hero is handled above via .stats) */
  const loose = $$('[data-count]').filter((el) => !el.closest('[data-reveal]'));
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { countUp(en.target); countObs.unobserve(en.target); } });
  }, { threshold: 0.4 });
  loose.forEach((el) => countObs.observe(el));

  /* ---------- donut ---------- */
  const donut = $('.donut');
  const segs = $$('circle[data-seg]', donut);
  segs.forEach((c) => c.setAttribute('stroke-dasharray', reduce ? c.dataset.dash : '0 490.09'));
  let drawn = false;
  function drawDonut() {
    if (drawn) return; drawn = true;
    segs.forEach((c, i) => setTimeout(() => c.setAttribute('stroke-dasharray', c.dataset.dash), 120 + i * 140));
  }
  $$('.legend li').forEach((li) => {
    const c = $(`circle[data-seg="${li.dataset.seg}"]`, donut);
    li.addEventListener('mouseenter', () => { donut.classList.add('dim'); c.classList.add('act'); });
    li.addEventListener('mouseleave', () => { donut.classList.remove('dim'); c.classList.remove('act'); });
  });
  segs.forEach((c) => {
    const li = $(`.legend li[data-seg="${c.dataset.seg}"]`);
    c.addEventListener('mouseenter', () => { donut.classList.add('dim'); c.classList.add('act'); li.style.background = 'rgba(243,236,226,.05)'; });
    c.addEventListener('mouseleave', () => { donut.classList.remove('dim'); c.classList.remove('act'); li.style.background = ''; });
  });

  /* ---------- spotlight cards ---------- */
  if (fine) {
    $$('.spot').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        b.style.transform = `translate(${x}px, ${y}px)`;
      });
      b.addEventListener('pointerleave', () => (b.style.transform = ''));
    });
  }

  /* ---------- portrait tilt ---------- */
  const frame = $('.tilt');
  if (fine && !reduce && frame) {
    const area = $('.hero');
    area.addEventListener('pointermove', (e) => {
      const r = frame.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      frame.style.transform = `perspective(900px) rotateY(${dx * 10}deg) rotateX(${-dy * 10}deg)`;
    });
    area.addEventListener('pointerleave', () => (frame.style.transform = ''));
  }

  /* ---------- drag-to-scroll strips ---------- */
  $$('.strip').forEach((s) => {
    let down = false, sx = 0, sl = 0, moved = 0;
    s.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = s.scrollLeft;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) s.classList.add('drag');
      s.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return; down = false;
      setTimeout(() => s.classList.remove('drag'), 0);
    });
    s.addEventListener('click', (e) => { if (moved > 5) { e.preventDefault(); e.stopPropagation(); } }, true);
    s.addEventListener('dragstart', (e) => e.preventDefault());
  });

  /* ---------- lightbox ---------- */
  const lb = $('#lb');
  const lbImg = $('img', lb);
  const lbCap = $('figcaption', lb);
  let group = [], idx = 0, lastFocus = null;
  const items = $$('.shot, .pf');
  const show = (i) => {
    idx = (i + group.length) % group.length;
    const fig = group[idx];
    const img = $('img', fig);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    const cap = $('figcaption', fig);
    lbCap.innerHTML = cap ? cap.innerHTML : img.alt;
    $$('.lb-nav', lb).forEach((b) => (b.style.display = group.length > 1 ? '' : 'none'));
  };
  const open = (fig) => {
    const parent = fig.closest('.strip, .gal, .pair') || fig.parentElement;
    group = $$('.shot, .pf', parent);
    lastFocus = document.activeElement;
    show(group.indexOf(fig));
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => lb.classList.add('open'));
    $('.lb-x', lb).focus();
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lb.hidden = true; }, 350);
    if (lastFocus) lastFocus.focus();
  };
  items.forEach((fig) => {
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'View larger: ' + ($('img', fig)?.alt || 'image'));
    fig.addEventListener('click', () => open(fig));
    fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(fig); } });
  });
  $('.lb-x', lb).addEventListener('click', close);
  $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let tx = 0;
  lb.addEventListener('touchstart', (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });
})();
