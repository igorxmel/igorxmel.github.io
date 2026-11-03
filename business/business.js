(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* тема: выбор запоминается, без выбора следуем настройке браузера или системы */
  const themeBtn = $('#theme'), root = document.documentElement, sysDark = matchMedia('(prefers-color-scheme: dark)');
  const setTheme = (t) => {
    root.dataset.theme = t;
    $('meta[name="theme-color"]').content = t === 'dark' ? '#14100b' : '#f6f1e7';
    const label = t === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
    themeBtn.setAttribute('aria-label', label);
    themeBtn.title = label;
  };
  const savedTheme = () => { try { return localStorage.getItem('biz-theme'); } catch (e) { return null; } };
  setTheme(root.dataset.theme);
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('biz-theme', next); } catch (e) {}
  });
  sysDark.addEventListener('change', (e) => { if (!savedTheme()) setTheme(e.matches ? 'dark' : 'light'); });

  /* слово в заголовке */
  const words = $$('.rot .rw'), rot = $('.rot');
  let wordIndex = 0;
  /* место под слово равно его длине, поэтому строка не уезжает */
  const fitWord = () => { rot.style.width = words[wordIndex].getBoundingClientRect().width + 'px'; };
  if (rot) {
    fitWord();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWord);
    addEventListener('resize', fitWord);
  }
  if (words.length > 1 && !calm) {
    setInterval(() => {
      const prev = words[wordIndex];
      wordIndex = (wordIndex + 1) % words.length;
      prev.classList.replace('on', 'out');
      words[wordIndex].classList.add('on');
      fitWord();
      setTimeout(() => prev.classList.remove('out'), 450);
    }, 2600);
  }

  /* аватарка: по нажатию переезжает в центр и становится крупнее */
  const who = $('.eyebrow'), avaBtn = $('.ava-btn');
  if (who && avaBtn) {
    const name = $('.who', who);
    let moves = [];
    const offset = (from, to) => `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`;
    avaBtn.addEventListener('click', () => {
      const open = !who.classList.contains('open');
      const a0 = avaBtn.getBoundingClientRect(), n0 = name.getBoundingClientRect(), h0 = who.getBoundingClientRect().height;
      moves.forEach((m) => m.cancel());
      who.classList.toggle('open', open);
      avaBtn.setAttribute('aria-expanded', open);
      avaBtn.setAttribute('aria-label', open ? 'Уменьшить фото' : 'Показать фото крупнее');
      const settled = () => dispatchEvent(new Event('resize'));
      if (calm) { settled(); return; }
      const h1 = who.getBoundingClientRect().height;
      who.style.height = `${h0}px`;
      const a1 = avaBtn.getBoundingClientRect(), n1 = name.getBoundingClientRect();
      const timing = { duration: 560, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
      moves = [
        avaBtn.animate({ transform: [offset(a0, a1), 'none'], transformOrigin: ['0 0', '0 0'] }, timing),
        name.animate({ transform: [offset(n0, n1), 'none'], transformOrigin: ['0 0', '0 0'] }, timing),
        who.animate({ height: [`${h0}px`, `${h1}px`] }, timing),
      ];
      who.style.height = '';
      moves[0].onfinish = settled;
    });
  }

  /* появление при прокрутке */
  const rv = $$('.sec h2, .note-top, .tabs, .panel:not([hidden]), .svc li, .steps li, .cta .lead, .cta .actions');
  rv.forEach((n) => n.classList.add('rv'));
  $$('.svc li').forEach((n, k) => n.style.setProperty('--d', k * 80 + 'ms'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach((n) => io.observe(n));
  } else rv.forEach((n) => n.classList.add('in'));

  /* вкладки примеров */
  const tabs = $$('.tabs [role="tab"]');
  const show = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const p = document.getElementById(t.getAttribute('aria-controls'));
      p.hidden = !on;
      if (on) p.classList.add('rv', 'in');
    });
  };
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = tabs[(k + d + tabs.length) % tabs.length];
      show(n); n.focus(); e.preventDefault();
    });
  });


  /* бот */
  const log = $('.chat-log'), keys = $('.chat-keys');
  const st = {};
  const MAP = '<svg class="map" viewBox="0 0 280 150" role="img" aria-label="Карта: кофейня на улице Садовой"><rect width="280" height="150" fill="#eae6dc"/><rect x="0" y="92" width="280" height="22" fill="#bfe0ee"/><rect x="170" y="8" width="96" height="62" rx="6" fill="#cfe5c6"/><g fill="#dcd5c6"><rect x="12" y="10" width="62" height="34" rx="3"/><rect x="86" y="10" width="62" height="34" rx="3"/><rect x="12" y="58" width="62" height="26" rx="3"/><rect x="86" y="58" width="62" height="26" rx="3"/><rect x="12" y="124" width="100" height="20" rx="3"/><rect x="170" y="124" width="100" height="20" rx="3"/></g><g stroke="#fff" stroke-width="7" fill="none"><path d="M0 52h280M156 0v150"/></g><path d="M0 52h280M156 0v150" stroke="#f3efe6" stroke-width="3" fill="none"/><g transform="translate(156 52)"><ellipse cx="0" cy="10" rx="9" ry="3" fill="#0003"/><path d="M0 8c-9-10-13-14-13-21a13 13 0 0 1 26 0c0 7-4 11-13 21z" fill="#e5533d"/><circle cy="-13" r="5" fill="#fff"/></g></svg>';
  const flow = {
    start: { t: 'Здравствуйте! Что хотите сделать?', k: [['Заказать кофе', 'order'], ['Часы работы и адрес', 'where']] },
    where: { t: 'Мы на улице Садовой, 5, вход со двора. Работаем каждый день с 8:00 до 21:00.', map: true, k: [['Заказать кофе', 'order'], ['Оценить кофейню', 'rate']] },
    order: { t: 'Что берёте?', k: [['Капучино', 'time'], ['Латте', 'time'], ['Эспрессо', 'time']] },
    time: { t: 'Когда заберёте?', k: [['Через 15 минут', 'done'], ['Через час', 'done']] },
    done: { t: () => `Готово! Заказ №127: ${st.drink.toLowerCase()}, ${st.when.toLowerCase()}. Ждём вас!`, k: [['Как добраться', 'where'], ['Оценить кофейню', 'rate']] },
    rate: { t: 'Как вам у нас? Оценка поможет нам стать лучше.', k: [['5 ★', 'thanks'], ['4 ★', 'thanks'], ['3 ★', 'thanks'], ['2 ★', 'thanks'], ['1 ★', 'thanks']], star: true },
    thanks: { t: () => (st.stars >= 4 ? 'Спасибо! Рады, что вам понравилось. Ждём снова.' : 'Спасибо за честность. Мы передали отзыв управляющему и постараемся исправиться.'), k: [['Сначала', 'start']] },
  };
  const add = (text, who) => {
    const m = document.createElement('div');
    m.className = 'msg ' + who;
    m.textContent = text;
    log.append(m);
    log.scrollTop = log.scrollHeight;
    return m;
  };
  const addMap = () => {
    const m = document.createElement('div');
    m.className = 'msg bot mapmsg';
    m.innerHTML = MAP + '<div class="map-cap"><b>ул. Садовая, 5</b><span>открыто до 21:00</span></div>';
    log.append(m);
    log.scrollTop = log.scrollHeight;
  };
  const botSay = (step) => {
    keys.replaceChildren();
    const s = flow[step];
    const render = () => {
      add(typeof s.t === 'function' ? s.t() : s.t, 'bot');
      if (s.map) addMap();
      s.k.forEach(([label, to]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        if (s.star) b.classList.add('star');
        b.addEventListener('click', () => {
          if (step === 'order') st.drink = label;
          if (step === 'time') st.when = label;
          if (step === 'rate') st.stars = parseInt(label, 10);
          if (to === 'start') log.replaceChildren(); else add(label, 'me');
          botSay(to);
        });
        keys.append(b);
      });
      log.scrollTop = log.scrollHeight;
    };
    if (calm) { render(); return; }
    const tp = add('...', 'bot');
    tp.classList.add('typing');
    setTimeout(() => { tp.remove(); render(); }, 550);
  };
  if (log) botSay('start');

  /* автоматизация: сайт, таблица, Telegram */
  const miniBtn = $('.mini-btn'), form = $('form.mini');
  if (miniBtn && form) {
    const lock = (on) => $$('input, button', form).forEach((n) => { n.disabled = on; });
    $$('input.field', form).forEach((n) => n.addEventListener('focus', () => n.select()));
    const cards = $$('.card'), wires = $$('.wire'), tbody = $('.sheet tbody'), tg = $('.tg-log');
    const pills = $$('.flow-tabs button');
    const small = matchMedia('(max-width: 60rem)');
    const step = calm ? 0 : small.matches ? 1300 : 900;
    const view = (i) => {
      cards.forEach((c, k) => c.classList.toggle('cur', k === i));
      pills.forEach((b, k) => b.classList.toggle('on', k === i));
    };
    pills.forEach((b) => b.addEventListener('click', () => view(+b.dataset.i)));
    const later = (fn, ms) => (ms ? setTimeout(fn, ms) : fn());
    const timers = [];
    const at = (fn, ms) => timers.push(later(fn, ms));
    const reset = () => {
      timers.forEach(clearTimeout); timers.length = 0;
      cards.forEach((c) => c.classList.remove('on'));
      wires.forEach((w) => w.classList.remove('go'));
      view(0);
      $$('.row-new', tbody).forEach((r) => r.remove());
      tg.replaceChildren();
      lock(false);
      miniBtn.textContent = 'Записаться';
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (miniBtn.disabled) return;
      const name = form.elements.name.value.trim() || 'Анна';
      const phone = form.elements.phone.value.trim() || '+7 900 000 00 00';
      const topic = form.elements.topic.value;
      lock(true);
      miniBtn.textContent = 'Заявка отправлена';
      cards[0].classList.add('on');
      at(() => wires[0].classList.add('go'), calm ? 0 : 150);
      at(() => {
        cards[1].classList.add('on');
        view(1);
        const tr = document.createElement('tr');
        tr.className = 'row-new';
        tr.innerHTML = '<td><b></b><small></small></td><td></td><td><span class="tag new">Новая</span></td>';
        $('b', tr).textContent = name;
        $('small', tr).textContent = phone;
        tr.children[1].textContent = topic;
        tbody.prepend(tr);
        wires[1].classList.add('go');
      }, step);
      at(() => {
        cards[2].classList.add('on');
        view(2);
        const m = document.createElement('div');
        m.className = 'tg-msg';
        m.innerHTML = '<b>Новая заявка</b><span></span><br><span></span>';
        const [who, what] = $$('span', m);
        who.textContent = name + ', ' + phone;
        what.textContent = topic;
        tg.append(m);
        const k = document.createElement('div');
        k.className = 'tg-keys';
        k.innerHTML = '<button type="button">Принять</button><button type="button">Позвонить</button>';
        tg.append(k);
        const [ok, call] = $$('button', k);
        ok.addEventListener('click', () => {
          k.remove();
          const r = document.createElement('div');
          r.className = 'tg-msg';
          r.innerHTML = '<b>Заявка принята</b>Клиенту отправлено подтверждение.';
          tg.append(r);
          const tag = $('.row-new .tag', tbody);
          if (tag) { tag.textContent = 'Принята'; tag.classList.remove('new'); }
        });
        call.addEventListener('click', () => {
          const r = document.createElement('div');
          r.className = 'tg-msg';
          r.innerHTML = '<b>Звоним клиенту</b>Номер набран с вашего телефона.';
          tg.append(r);
        });
      }, step * 2);
    });
    $('.flow-reset').addEventListener('click', reset);
  }

  /* сайт: компьютер и телефон */
  const browser = $('.browser'), narrow = matchMedia('(max-width: 48rem)');
  const syncView = () => { browser.dataset.view = narrow.matches ? 'phone' : ($('.seg button.on') || {}).dataset.view || 'desktop'; };
  narrow.addEventListener('change', syncView);
  syncView();
  $$('.seg button').forEach((b) => b.addEventListener('click', () => {
    $$('.seg button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    syncView();
  }));

  /* переход из услуг сразу к нужному примеру */
  $$('[data-tab]').forEach((a) => a.addEventListener('click', () => {
    const t = document.getElementById(a.dataset.tab);
    if (t) show(t);
  }));

  /* телефон и почта: на компьютере копируем, на телефоне открываем как обычно */
  const desktop = matchMedia('(hover: hover) and (pointer: fine)');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.append(toast);
  let toastTimer;
  const say = (text) => {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
    const area = document.createElement('textarea');
    area.value = text;
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.append(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    area.remove();
    return ok;
  };
  $$('a[data-copy]').forEach((a) => a.addEventListener('click', async (e) => {
    if (!desktop.matches) return;
    e.preventDefault();
    say(await copy(a.dataset.copy) ? `${a.dataset.done}: ${a.dataset.copy}` : a.dataset.copy);
  }));

  /* кнопка «Написать» внизу на телефоне */
  const dock = $('#dock'), contact = $('#contact');
  if (dock) {
    let nearContact = false;
    const upd = () => dock.classList.toggle('show', scrollY > 500 && !nearContact);
    if ('IntersectionObserver' in window && contact) new IntersectionObserver((es) => { nearContact = es[0].isIntersecting; upd(); }).observe(contact);
    addEventListener('scroll', upd, { passive: true });
    upd();
  }
})();
