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
  const flow = {
    start: ['Здравствуйте! Что хотите сделать?', [['Заказать кофе', 'order'], ['Часы работы', 'hours']]],
    hours: ['Работаем каждый день с 8:00 до 21:00. Адрес: ул. Садовая, 5.', [['Заказать кофе', 'order'], ['Сначала', 'start']]],
    order: ['Что берёте?', [['Капучино', 'time'], ['Латте', 'time'], ['Эспрессо', 'time']]],
    time: ['Когда заберёте?', [['Через 15 минут', 'done'], ['Через час', 'done']]],
    done: [() => `Готово! Заказ №127: ${st.drink.toLowerCase()}, ${st.when.toLowerCase()}. Ждём вас!`, [['Заказать ещё', 'order'], ['Сначала', 'start']]],
  };
  const add = (text, who) => {
    const m = document.createElement('div');
    m.className = 'msg ' + who;
    m.textContent = text;
    log.append(m);
    log.scrollTop = log.scrollHeight;
    return m;
  };
  const botSay = (step) => {
    keys.replaceChildren();
    const [t, opts] = flow[step];
    const render = () => {
      add(typeof t === 'function' ? t() : t, 'bot');
      opts.forEach(([label, to]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', () => {
          if (step === 'order') st.drink = label;
          if (step === 'time') st.when = label;
          if (to === 'start') log.replaceChildren(); else add(label, 'me');
          botSay(to);
        });
        keys.append(b);
      });
    };
    if (calm) { render(); return; }
    const tp = add('...', 'bot');
    tp.classList.add('typing');
    setTimeout(() => { tp.remove(); render(); }, 550);
  };
  if (log) botSay('start');

  /* автоматизация */
  const go = $('.flow-go');
  if (go) {
    const nodes = $$('.node'), wires = $$('.wire'), fl = $('.flow-log');
    const lines = ['Заявка получена с сайта', 'Строка добавлена в таблицу', 'Уведомление отправлено вам в Telegram'];
    const line = (t) => { const li = document.createElement('li'); li.textContent = t; fl.append(li); };
    go.addEventListener('click', () => {
      go.disabled = true;
      nodes.forEach((n) => n.classList.remove('on'));
      wires.forEach((w) => w.classList.remove('go'));
      fl.replaceChildren();
      const step = calm ? 0 : 800;
      nodes[0].classList.add('on'); line(lines[0]);
      setTimeout(() => wires[0].classList.add('go'), 100);
      setTimeout(() => { nodes[1].classList.add('on'); line(lines[1]); wires[1].classList.add('go'); }, step);
      setTimeout(() => { nodes[2].classList.add('on'); line(lines[2]); go.disabled = false; }, step * 2);
    });
  }

  /* сайт: компьютер и телефон */
  $$('.seg button').forEach((b) => b.addEventListener('click', () => {
    $$('.seg button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    $('.browser').dataset.view = b.dataset.view;
  }));

  /* калькулятор */
  const base = { site: 15000, bot: 15000, auto: 10000, host: 2000 };
  const mult = [1, 2, 3.5];
  const sel = { kind: 'site', level: 0 };
  const sum = $('.calc-sum');
  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n).replace(/\s/g, ' ');
  const upd = () => {
    const v = Math.round(base[sel.kind] * mult[sel.level] / 500) * 500;
    sum.textContent = `от ${fmt(v)} ₽${sel.kind === 'host' ? ' в месяц' : ''}`;
    sum.classList.remove('bump');
    void sum.offsetWidth;
    sum.classList.add('bump');
  };
  $$('.chips').forEach((g) => g.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    $$('button', g).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    sel[g.dataset.group] = g.dataset.group === 'level' ? +b.dataset.v : b.dataset.v;
    upd();
  }));
})();
