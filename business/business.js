(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* слово в заголовке */
  const words = $$('.rot .rw');
  if (words.length > 1 && !calm) {
    let i = 0;
    setInterval(() => {
      const prev = words[i];
      i = (i + 1) % words.length;
      prev.classList.replace('on', 'out');
      words[i].classList.add('on');
      setTimeout(() => prev.classList.remove('out'), 450);
    }, 2600);
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
  const miniBtn = $('.mini-btn');
  if (miniBtn) {
    const cards = $$('.card'), wires = $$('.wire'), tbody = $('.sheet tbody'), tg = $('.tg-log');
    const step = calm ? 0 : 900;
    const later = (fn, ms) => (ms ? setTimeout(fn, ms) : fn());
    const timers = [];
    const at = (fn, ms) => timers.push(later(fn, ms));
    const reset = () => {
      timers.forEach(clearTimeout); timers.length = 0;
      cards.forEach((c) => c.classList.remove('on'));
      wires.forEach((w) => w.classList.remove('go'));
      $$('.row-new', tbody).forEach((r) => r.remove());
      tg.replaceChildren();
      miniBtn.disabled = false;
      miniBtn.textContent = 'Записаться';
    };
    miniBtn.addEventListener('click', () => {
      miniBtn.disabled = true;
      miniBtn.textContent = 'Заявка отправлена';
      cards[0].classList.add('on');
      at(() => wires[0].classList.add('go'), calm ? 0 : 150);
      at(() => {
        cards[1].classList.add('on');
        const tr = document.createElement('tr');
        tr.className = 'row-new';
        tr.innerHTML = '<td>Анна</td><td>+7 900 000 00 00</td><td><span class="tag new">Новая</span></td>';
        tbody.prepend(tr);
        wires[1].classList.add('go');
      }, step);
      at(() => {
        cards[2].classList.add('on');
        const m = document.createElement('div');
        m.className = 'tg-msg';
        m.innerHTML = '<b>Новая заявка</b>Анна, +7 900 000 00 00<br>Дегустация в субботу';
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
  $$('.seg button').forEach((b) => b.addEventListener('click', () => {
    $$('.seg button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    $('.browser').dataset.view = b.dataset.view;
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
