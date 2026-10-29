(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* language */
  const dict = {
    en: {
      brand: 'Egor Holkin', nav_work: 'Work', nav_path: 'Path', nav_contact: 'Contact',
      hero_h1: '<span class="line"><span>A backend</span></span><span class="line"><span>you can lean on</span></span>',
      hero_lead: 'Egor Holkin. Java, Spring Boot, Python. Open to backend roles.',
      cta_tg: 'Message on Telegram', cta_work: 'See the work',
      work_h: 'Work that is alive',
      l_src: 'Source',
      zx_p: 'Getting around blocks from one window: the zapret core, a Telegram proxy, strategy search by trial. It installs and updates the third-party tools itself.',
      zx_f1: 'current release', zx_f2: 'stars on GitHub', zx_f3: 'Windows 10/11, GPLv3', zx_l1: 'Project page',
      tx_p: 'A personal game ranking with no build step and no backend: HTML, ES modules, JSON. The tier is computed from the score and cannot be set by hand.',
      tx_l1: 'Open the site', tx_aria: 'Two scoring axes', tx_a1: 'points at most for quality across criteria', tx_a2: 'points at most for enjoyment on one slider',
      jl_p: 'A library on three Spring services with PostgreSQL. Deploys with Docker in one command.',
      jl_s1: 'Site', jl_s2: 'Users', jl_s3: 'Books',
      ix1: 'Hands bulk agent work to OpenCode’s free models', ix2: 'An AI secretary, Spring 2025 hackathon, 2nd place',
      ix3: 'Rock-paper-scissors by hand gestures, DevHack #5, 2nd place', ix4: 'A desktop control panel for Telegram bots',
      path_h: 'Internship at hh.ru',
      path_p: 'February to August 2026: the backend of an internal platform for choosing analyst schools. Spring Boot, PostgreSQL with Liquibase migrations, MinIO, all in Docker, shipped through GitHub Actions. Built the AI review of submitted solutions for admins.',
      hk_h: 'Hackathons', hk_p: 'More than ten in three years, leading the team in each.',
      hk_2: '2nd place', hk_3: '3rd place', hk_f: 'finalist', hk_s25: 'Spring Hackathon 2025',
      st_h: 'What I work with', st_b: 'Backend', st_d: 'Data', st_i: 'Infrastructure', st_a: 'AI in products', st_ap: 'Claude and the tooling around it',
      ct_h: 'Let’s build', ft: 'Rostov-on-Don'
    }
  };
  const ru = {};
  const text = [...document.querySelectorAll('[data-i18n]')];
  const html = [...document.querySelectorAll('[data-i18n-html]')];
  const aria = [...document.querySelectorAll('[data-i18n-aria]')];
  text.forEach((n) => (ru[n.dataset.i18n] = n.textContent));
  html.forEach((n) => (ru[n.dataset.i18nHtml] = n.innerHTML));
  aria.forEach((n) => (ru[n.dataset.i18nAria] = n.getAttribute('aria-label')));
  const btn = document.querySelector('.lang');
  const apply = (lang) => {
    const d = lang === 'en' ? dict.en : ru;
    text.forEach((n) => { if (d[n.dataset.i18n] != null) n.textContent = d[n.dataset.i18n]; });
    html.forEach((n) => { if (d[n.dataset.i18nHtml] != null) n.innerHTML = d[n.dataset.i18nHtml]; });
    aria.forEach((n) => { if (d[n.dataset.i18nAria] != null) n.setAttribute('aria-label', d[n.dataset.i18nAria]); });
    root.lang = lang;
    btn.querySelector('.lang-to').textContent = lang === 'en' ? 'RU' : 'EN';
    document.title = lang === 'en' ? 'Egor Holkin, backend developer' : 'Егор Холкин, бэкенд-разработчик';
    try { localStorage.setItem('lang', lang); } catch (e) {}
  };
  btn.addEventListener('click', () => apply(root.lang === 'en' ? 'ru' : 'en'));
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  if (saved === 'en' || (!saved && !/^ru|^uk|^be|^kk/i.test(navigator.language || 'ru'))) apply('en');

  /* reveal */
  const rv = [...document.querySelectorAll('.rv')];
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    rv.forEach((n) => io.observe(n));
  } else rv.forEach((n) => n.classList.add('in'));

  /* scroll progress */
  const bar = document.querySelector('.progress');
  const upd = () => {
    const h = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
  };
  addEventListener('scroll', upd, { passive: true });
  upd();

  /* brass light follows the pointer */
  const glow = document.querySelector('.glow');
  if (glow && !reduce && matchMedia('(pointer: fine)').matches) {
    let tx = innerWidth * 0.7, ty = innerHeight * 0.3, x = tx, y = ty;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
    const tick = () => {
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      glow.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(tick);
    };
    tick();
  }
})();
