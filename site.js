(() => {
  const root = document.documentElement;
  const dict = window.I18N;
  const KEY = 'lang';

  /* язык */
  const apply = (lang) => {
    const d = dict[lang];
    document.querySelectorAll('[data-i18n]').forEach((n) => { const v = d[n.dataset.i18n]; if (v != null) n.textContent = v; });
    document.querySelectorAll('[data-i18n-label]').forEach((n) => { const v = d[n.dataset.i18nLabel]; if (v != null) n.setAttribute('aria-label', v); });
    document.querySelectorAll('[data-i18n-alt]').forEach((n) => { const v = d[n.dataset.i18nAlt]; if (v != null) n.alt = v; });
    root.lang = lang;
    document.title = d.title;
  };
  const save = (lang) => { try { localStorage.setItem(KEY, lang); } catch (e) {} };
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'ru' || q === 'en') { saved = q; save(q); }

  document.querySelectorAll('.lang').forEach((b) => b.addEventListener('click', () => {
    const next = root.lang === 'en' ? 'ru' : 'en';
    apply(next); save(next);
  }));

  if (saved === 'ru' || saved === 'en') {
    if (saved === 'en') apply('en');
  } else {
    /* при первом визите спрашиваем язык */
    const en = !/^(ru|uk|be|kk)/i.test(navigator.language || 'ru');
    const dlg = document.createElement('dialog');
    dlg.className = 'langdlg';
    dlg.innerHTML = `
      <p class="langdlg-h"><span lang="ru">${dict.ru.modal_h}</span><span lang="en">${dict.en.modal_h}</span></p>
      <div class="langdlg-b">
        <button type="button" class="btn ${en ? 'btn-secondary' : 'btn-primary'}" value="ru" lang="ru">Русский</button>
        <button type="button" class="btn ${en ? 'btn-primary' : 'btn-secondary'}" value="en" lang="en">English</button>
      </div>`;
    document.body.append(dlg);
    const pick = (lang) => { apply(lang); save(lang); dlg.close(); };
    dlg.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => pick(b.value)));
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); pick(en ? 'en' : 'ru'); });
    dlg.showModal();
    dlg.querySelector(`button[value="${en ? 'en' : 'ru'}"]`).focus();
  }

  /* проявление секций */
  const rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach((n) => io.observe(n));
  } else rv.forEach((n) => n.classList.add('in'));

  /* шапка уплотняется при прокрутке */
  const nav = document.querySelector('.nav');
  if (nav) {
    const upd = () => nav.classList.toggle('is-scrolled', scrollY > 8);
    addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* активный пункт меню */
  const links = [...document.querySelectorAll('.side-nav a, .nav-links a')];
  const targets = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (links.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      if (e.target.classList.contains('hero')) { links.forEach((a) => a.removeAttribute('aria-current')); return; }
      links.forEach((a) => (a.getAttribute('href') === '#' + e.target.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    }), { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach((t) => spy.observe(t));
    const hero = document.querySelector('.hero');
    if (hero) spy.observe(hero);
  }
})();
