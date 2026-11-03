(() => {
  const root = document.getElementById('live');
  if (!root) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width: 60rem)').matches;
  if (calm) return;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  /* на скрытой вкладке сцены стоят и не тратят ресурсы */
  const sleep = async (ms) => { await wait(ms); while (document.hidden) await wait(400); };
  const make = (cls, html = '', tag = 'div') => { const n = document.createElement(tag); n.className = cls; n.innerHTML = html; return n; };
  const win = (cls, title, dot) => { const w = make(`w ${cls}`); w.append(make('w-h', `<i style="background:${dot}"></i><span>${title}</span>`)); return w; };

  /* бот: идёт переписка */
  const chatScene = (title, lines) => {
    const el = win('w-chat', title, '#2aabee'), log = make('w-log');
    el.append(log);
    return {
      el,
      reset: () => log.replaceChildren(),
      play: async () => {
        for (const [who, text] of lines) {
          if (who === 'bot') {
            const t = make('w-msg bot w-typing', '<i></i><i></i><i></i>');
            log.append(t);
            await sleep(800);
            t.remove();
          } else await sleep(600);
          const m = make(`w-msg ${who}`);
          m.textContent = text;
          log.append(m);
          await sleep(650);
        }
      },
    };
  };

  /* сайт: страница собирается по блокам */
  const siteScene = (url, cls, body, doneText) => {
    const el = win('w-site', url, '#febc2e');
    const page = make(`w-page ${cls}`, body);
    const done = make('w-done', doneText);
    el.append(page, done);
    const blocks = [...page.querySelectorAll('.b')];
    return {
      el,
      reset: () => { blocks.forEach((b) => b.classList.remove('on')); done.classList.remove('on'); },
      play: async () => {
        for (const b of blocks) { b.classList.add('on'); await sleep(340); }
        await sleep(300);
        done.classList.add('on');
        await sleep(500);
      },
    };
  };

  /* таблица: заявка прилетает, статус меняется */
  const tableScene = () => {
    const names = [['Анна', 'Стрижка'], ['Ольга', 'Маникюр'], ['Игорь', 'Столик'], ['Мария', 'Доставка'], ['Денис', 'Ремонт']];
    let k = 0, total = 14;
    const el = win('w-table', 'Таблица заявок', '#1e8e3e');
    const count = make('w-count', `Сегодня: <b>${total}</b>`);
    const body = make('w-rows');
    const row = (n, w, st, cls = '') => make(`w-row ${cls}`, `<span>${n}</span><span>${w}</span><em>${st}</em>`);
    body.append(row('Игорь', 'Столик', 'Принята'), row('Мария', 'Доставка', 'Принята'));
    el.append(count, body);
    return {
      el,
      reset: () => {},
      play: async () => {
        const [n, w] = names[k++ % names.length];
        const r = row(n, w, 'Новая', 'land new');
        body.prepend(r);
        while (body.children.length > 3) body.lastChild.remove();
        total += 1;
        count.innerHTML = `Сегодня: <b>${total}</b>`;
        await sleep(1500);
        r.classList.remove('new');
        r.querySelector('em').textContent = 'Принята';
        await sleep(500);
      },
    };
  };

  /* алгоритм: заявка идёт по схеме, ветка зависит от условия */
  const flowScene = (title, t) => {
    const el = win('w-flow', title, '#eab26b');
    el.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 260 192" class="w-graph"><path class="ln" d="M130 34V56M108 84 62 110M152 84 198 110M62 138 130 160M198 138 130 160"/><g class="nd" data-n="a"><rect x="74" y="8" width="112" height="26" rx="7"/><text x="130" y="25">${t[0]}</text></g><g class="nd" data-n="q"><rect x="66" y="56" width="128" height="30" rx="15"/><text x="130" y="75">${t[1]}</text></g><g class="nd" data-n="y"><rect x="8" y="110" width="108" height="28" rx="7"/><text x="62" y="128">${t[2]}</text></g><g class="nd" data-n="n"><rect x="144" y="110" width="108" height="28" rx="7"/><text x="198" y="128">${t[3]}</text></g><g class="nd" data-n="z"><rect x="70" y="160" width="120" height="26" rx="7"/><text x="130" y="177">${t[4]}</text></g></svg>`);
    const nodes = Object.fromEntries([...el.querySelectorAll('.nd')].map((n) => [n.dataset.n, n]));
    let branch = 'y';
    const go = (k) => { Object.values(nodes).forEach((n) => n.classList.remove('hot')); nodes[k].classList.add('hot'); };
    go('a');
    return {
      el,
      reset: () => { Object.values(nodes).forEach((n) => n.classList.remove('hot', 'was')); go('a'); },
      play: async () => {
        for (const k of ['a', 'q', branch, 'z']) { go(k); nodes[k].classList.add('was'); await sleep(850); }
        branch = branch === 'y' ? 'n' : 'y';
      },
    };
  };

  /* сервер: всё работает, идёт резервная копия */
  const serverScene = () => {
    const el = win('w-server', 'Сервер', '#28c840');
    el.append(make('w-state', '<i></i>Сайт и бот работают'));
    const bars = make('w-bars', Array.from({ length: 18 }, () => '<i></i>').join(''));
    const bar = make('w-progress', '<span>Резервная копия</span><u><i></i></u>');
    el.append(bars, bar);
    const fill = bar.querySelector('u i'), label = bar.querySelector('span');
    const shake = () => [...bars.children].forEach((b) => { b.style.height = `${28 + Math.round(Math.random() * 62)}%`; });
    shake();
    return {
      el,
      reset: () => { fill.style.width = '0'; label.textContent = 'Резервная копия'; },
      play: async () => {
        for (let p = 20; p <= 100; p += 20) { fill.style.width = `${p}%`; shake(); await sleep(620); }
        label.textContent = 'Копия сохранена';
        await sleep(500);
      },
    };
  };

  /* уведомления руководителю */
  const noticeScene = () => {
    const el = win('w-notice', 'Telegram руководителя', '#2aabee'), log = make('w-log');
    el.append(log);
    return {
      el,
      reset: () => log.replaceChildren(),
      play: async () => {
        const a = make('w-note', '<b>Новая заявка</b>Анна, стрижка в субботу<div class="w-keys"><span>Принять</span><span>Позвонить</span></div>');
        log.append(a);
        await sleep(1300);
        a.querySelector('.w-keys span').classList.add('press');
        await sleep(450);
        a.querySelector('.w-keys').remove();
        a.insertAdjacentHTML('beforeend', '<em>Заявка принята</em>');
        await sleep(800);
        const b = make('w-note', '<b>Новый отзыв</b><span class="w-stars"><i>★</i><i>★</i><i>★</i><i>★</i><i>★</i></span>');
        log.append(b);
        for (const s of b.querySelectorAll('.w-stars i')) { await sleep(180); s.classList.add('on'); }
        await sleep(700);
      },
    };
  };

  /* расписание: неделя заполняется записями */
  const calendarScene = () => {
    const el = win('w-cal', 'Запись на неделю', '#7f77dd');
    const days = make('w-days', ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => `<span>${d}</span>`).join(''));
    const grid = make('w-slots', Array.from({ length: 21 }, () => '<i></i>').join(''));
    const note = make('w-note-line', 'Свободных окон: 21');
    el.append(days, grid, note);
    const cells = [...grid.children], order = [5, 12, 2, 19, 8, 15, 0, 10];
    return {
      el,
      reset: () => { cells.forEach((c) => c.classList.remove('on')); note.textContent = 'Свободных окон: 21'; },
      play: async () => {
        for (const [i, k] of order.entries()) {
          cells[k].classList.add('on');
          note.textContent = `Свободных окон: ${20 - i}`;
          await sleep(520);
        }
        await sleep(600);
      },
    };
  };

  /* отчёт: собирается сам и уходит руководителю */
  const reportScene = () => {
    const el = win('w-report', 'Отчёт за неделю', '#1d9e75');
    const sum = make('w-sum', 'Заявок: <b>0</b>');
    const bars = make('w-chart', [34, 52, 41, 68, 88, 74, 46].map((v) => `<i data-v="${v}"></i>`).join(''));
    const done = make('w-done', 'Отправлен руководителю в 9:00');
    el.append(sum, bars, done);
    const items = [...bars.children], num = sum.querySelector('b');
    return {
      el,
      reset: () => { items.forEach((b) => { b.style.height = '4%'; }); num.textContent = '0'; done.classList.remove('on'); },
      play: async () => {
        let total = 0;
        for (const b of items) {
          b.style.height = `${b.dataset.v}%`;
          total += Math.round(+b.dataset.v / 12);
          num.textContent = total;
          await sleep(330);
        }
        done.classList.add('on');
        await sleep(700);
      },
    };
  };

  /* список дел: шаг за шагом отмечается выполненным */
  const listScene = (title, dot, head, items, doneText) => {
    const el = win('w-list', title, dot);
    if (head) el.append(make('w-amount', head));
    const list = make('w-ticks', items.map((t) => `<div><i></i><span>${t}</span></div>`).join(''));
    const done = make('w-done', doneText);
    el.append(list, done);
    const rows = [...list.children];
    return {
      el,
      reset: () => { rows.forEach((r) => r.classList.remove('on')); done.classList.remove('on'); },
      play: async () => {
        for (const r of rows) { await sleep(720); r.classList.add('on'); }
        await sleep(300);
        done.classList.add('on');
        await sleep(600);
      },
    };
  };

  const chatLines = [['me', 'Хочу записаться на стрижку'], ['bot', 'Когда вам удобно?'], ['me', 'В субботу, после обеда'], ['bot', 'Записал на 15:00. Напомню накануне']];
  const chatLines2 = [['me', 'Какая доставка до дома?'], ['bot', 'Бесплатно от 1 000 ₽, привезём за час'], ['me', 'Отлично, оформляю'], ['bot', 'Заказ №128 принят']];
  const chatLines3 = [['me', 'Когда забрать машину?'], ['bot', 'Ремонт закончен, ждём после 17:00'], ['me', 'Сколько к оплате?'], ['bot', '4 200 ₽, можно картой на месте']];
  const siteSalon = '<div class="b w-nav"><b>Вера</b><u></u><u></u></div><div class="b w-pic"></div><div class="b w-title">Стрижка рядом с домом</div><div class="b w-text"><u></u><u></u></div><div class="w-cards"><div class="b"></div><div class="b"></div><div class="b"></div></div><div class="b w-cta">Записаться</div>';
  const siteAuto = '<div class="b w-nav"><b>Мотор</b><u></u><u></u></div><div class="w-split"><div><div class="b w-title">Ремонт за один день</div><div class="b w-text"><u></u><u></u></div><div class="b w-cta">Заказать звонок</div></div><div class="b w-pic"></div></div><div class="b w-price"><span>Замена масла</span><b>1 500 ₽</b></div><div class="b w-price"><span>Диагностика</span><b>900 ₽</b></div>';
  const siteShop = '<div class="b w-nav"><b>Лавка</b><u></u><span class="w-cart">Корзина 2</span></div><div class="b w-title">Свежий хлеб с доставкой</div><div class="w-goods"><div class="b"><i></i><span>Батон</span><b>90 ₽</b></div><div class="b"><i></i><span>Багет</span><b>120 ₽</b></div><div class="b"><i></i><span>Ржаной</span><b>110 ₽</b></div></div>';
  const factory = {
    chat: () => chatScene('Бот салона', chatLines),
    chat2: () => chatScene('Бот магазина', chatLines2),
    chat3: () => chatScene('Бот автосервиса', chatLines3),
    site: () => siteScene('salon-vera.ru', 'p-salon', siteSalon, 'Сайт опубликован'),
    site2: () => siteScene('motor-service.ru', 'p-auto', siteAuto, 'Заявки идут с сайта'),
    site3: () => siteScene('lavka-hleb.ru', 'p-shop', siteShop, 'Каталог обновлён'),
    table: tableScene,
    flow: () => flowScene('Алгоритм заявки', ['Новая заявка', 'Рабочее время?', 'Ответить сразу', 'Ответить утром', 'Записать в таблицу']),
    flow2: () => flowScene('Алгоритм заказа', ['Новый заказ', 'Есть на складе?', 'Собрать заказ', 'Найти замену', 'Сообщить клиенту']),
    server: serverScene,
    notice: noticeScene,
    calendar: calendarScene,
    report: reportScene,
    search: () => listScene('Сайт в поиске', '#378add', '', ['Карта сайта готова', 'Добавлен в Яндекс', 'Добавлен в Google'], 'Сайт можно найти в поиске'),
    reminder: () => listScene('Напоминания клиентам', '#d4537e', '', ['Анна, завтра в 11:00', 'Денис, завтра в 14:30', 'Ольга, в субботу в 15:00'], 'Все напоминания отправлены'),
    deploy: () => listScene('Обновление сайта', '#28c840', '', ['Копия сохранена', 'Новая версия загружена', 'Проверка пройдена'], 'Обновлено без остановки сайта'),
    payment: () => listScene('Оплата', '#ba7517', '<span>Счёт №42</span><b>3 500 ₽</b>', ['Счёт выставлен', 'Деньги получены', 'Чек отправлен клиенту'], 'Оплата записана в таблицу'),
  };

  const layer = (cls) => {
    const l = make(`layer ${cls}`);
    root.append(l);
    return l;
  };
  /* каждая сцена живёт в своём ритме */
  const loop = async (scene, pause, shift) => {
    await sleep(shift);
    const seen = () => { const r = scene.el.getBoundingClientRect(); return r.bottom > -60 && r.top < innerHeight + 60; };
    for (;;) {
      while (!seen()) await wait(500);
      scene.reset();
      await scene.play();
      await sleep(pause);
    }
  };

  /* четыре скопления по краям, центр свободен. Окна идут строго вертикально, у каждого своя скорость и свой небольшой сдвиг вбок */
  const TYPES = ['chat', 'flow', 'server', 'deploy', 'site', 'table', 'notice', 'chat2', 'calendar', 'site2', 'report', 'flow2', 'chat3', 'search', 'payment', 'site3', 'reminder'];
  const HERO_COUNT = 8, TIGHT_COUNT = 11;
  const WIDE = 1440, BASE = 240, ROOM = 34, GAP = 18, NAV = 74, END_ROOM = 800, SLOW = 0.2, FAST = 0.62, EDGE = 24;
  const LANES = [
    { side: 'left', from: 0.006, to: 0.04, v: [0.34, 0.62] },
    { side: 'right', from: 0.006, to: 0.04, v: [0.34, 0.62] },
    { side: 'left', from: 0.165, to: 0.21, v: [0.2, 0.4] },
    { side: 'right', from: 0.165, to: 0.21, v: [0.2, 0.4] },
  ];
  const cards = [];
  const build = () => {
    const l = layer('cards');
    TYPES.forEach((type, i) => {
      const scene = factory[type]();
      l.append(scene.el);
      cards.push({ scene, v: 0 });
      loop(scene, 1300, 200 + i * 240);
    });
  };
  /* при каждой раскладке один и тот же случайный рисунок */
  let seed = 23;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  /* два окна не должны пересекаться, пока оба на экране. Движение прямолинейное, поэтому хватает проверки концов отрезка */
  const clear = (a, b, vh, end) => {
    if (a.right + GAP < b.left || b.right + GAP < a.left) return true;
    const span = (c) => [Math.max(0, (c.top - vh - EDGE) / c.v), Math.min(end + END_ROOM, (c.top + c.h + EDGE) / c.v)];
    const [a0, a1] = span(a), [b0, b1] = span(b);
    const from = Math.max(a0, b0), to = Math.min(a1, b1);
    if (from > to) return true;
    const delta = (q) => (b.top - b.v * q) - (a.top - a.v * q);
    const below = (d) => d >= a.h + GAP, above = (d) => d <= -(b.h + GAP);
    return (below(delta(from)) && below(delta(to))) || (above(delta(from)) && above(delta(to)));
  };

  /* текст первого экрана остаётся свободным */
  const heroBox = () => {
    const y = scrollY, range = document.createRange();
    const parts = [...document.querySelectorAll('.hero .eyebrow, .hero h1 .ln, .hero .lead, .hero .actions .btn')].map((n) => { range.selectNodeContents(n); return n.matches('.btn') ? n.getBoundingClientRect() : range.getBoundingClientRect(); });
    return { left: Math.min(...parts.map((r) => r.left)) - 56, right: Math.max(...parts.map((r) => r.right)) + 56, top: Math.min(...parts.map((r) => r.top)) + y - 14, bottom: Math.max(...parts.map((r) => r.bottom)) + y + 14 };
  };

  const arrange = () => {
    const vw = innerWidth, vh = innerHeight, end = document.documentElement.scrollHeight - vh;
    const z = Math.min(1, vw / WIDE), wide = vw > 1024;
    const count = wide ? cards.length : TIGHT_COUNT;
    const laneCount = wide ? LANES.length : 2;
    const hero = heroBox();
    const placed = { left: [], right: [] };
    seed = 23;
    root.style.setProperty('--z', z.toFixed(3));
    cards.forEach((card, i) => {
      const el = card.scene.el;
      if (i >= count) { el.style.display = 'none'; card.v = 0; return; }
      el.style.display = '';
      const natural = el.offsetHeight + ROOM;
      const heroCard = i < Math.min(HERO_COUNT, Math.ceil(count * 0.5));
      const firstLater = Math.min(HERO_COUNT, Math.ceil(count * 0.5));
      const when = heroCard ? 0 : ((i - firstLater + 0.5) / (count - firstLater)) * end;
      let laneIndex = i % laneCount, spot = null;
      for (let tries = 0; tries < 1500 && !spot; tries++) {
        if (tries % 500 === 499) laneIndex = (laneIndex + 1) % laneCount;
        const lane = LANES[laneIndex], { side } = lane;
        const v = lane.v[0] + rnd() * (lane.v[1] - lane.v[0]);
        const d = 0.82 + ((v - SLOW) / (FAST - SLOW)) * 0.18;
        const w = BASE * z * d, h = natural * z * d;
        const off = (lane.from + rnd() * (lane.to - lane.from)) * vw;
        const left = side === 'left' ? off : vw - off - w;
        const onScreen = NAV + rnd() * Math.max(1, vh - h - NAV - 16);
        const later = heroCard ? when : Math.max(0, Math.min(end, when + (rnd() - 0.5) * end * Math.min(0.6, tries / 1500)));
        const top = onScreen + v * later;
        const c = { left, right: left + w, top, h, v, d, off, side };
        const onHero = c.left < hero.right && c.right > hero.left && top < hero.bottom && top + h > hero.top;
        if (!onHero && placed[side].every((o) => clear(o, c, vh, end))) spot = c;
      }
      if (!spot) { el.style.display = 'none'; card.v = 0; return; }
      const { side } = spot;
      placed[side].push(spot);
      card.v = spot.v;
      el.style.left = el.style.right = '';
      el.style[side] = `${((spot.off / vw) * 100).toFixed(2)}%`;
      el.style.top = `${Math.round(spot.top)}px`;
      el.style.transformOrigin = side === 'right' ? '100% 0' : '0 0';
      el.style.setProperty('--d', spot.d.toFixed(3));
      el.style.opacity = (0.5 + ((spot.v - SLOW) / (FAST - SLOW)) * 0.44).toFixed(2);
    });
    moveCards();
  };
  const moveCards = () => {
    const y = scrollY;
    /* отдельное свойство: сдвиг не должен умножаться на масштаб окна */
    cards.forEach((c) => { if (c.v) c.scene.el.style.translate = `0 ${(-c.v * y).toFixed(1)}px`; });
  };
  if (!small) {
    build();
    arrange();
    /* шрифты меняют высоту страницы и положение заголовка */
    let size = `${innerWidth}x${innerHeight}`;
    addEventListener('resize', () => {
      /* раскрытие аватарки размеров окна не меняет, и окна остаются на местах */
      const now = `${innerWidth}x${innerHeight}`;
      if (now !== size) { size = now; arrange(); }
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(arrange);
  }

  /* под текстом лежит мягкая подложка: прозрачной становится только эта часть окна */
  const TEXT = '.hero h1 .ln, .hero .lead, .hero .eyebrow, .hero .actions .btn, .sec h2, .svc h3, .svc p, .price, .ask, .note, .note-top, .tabs button, .demo-text h3, .demo-text p, .flow-hint, .flow-tabs button, .chat, .flow-row .card, .flow-reset, .stage, .seg button, .steps h3, .steps p, .idx, .cta .lead, .cta .actions .btn, .foot-in > *';
  const BLOCK = '.chat, .card, .stage, button, .btn';
  const scrim = document.getElementById('scrim'), html = document.documentElement;
  const measure = () => {
    /* меряем без сдвига анимации появления */
    html.classList.add('measuring');
    const y = scrollY, range = document.createRange(), parts = document.createDocumentFragment();
    document.querySelectorAll(TEXT).forEach((n) => {
      range.selectNodeContents(n);
      const r = n.matches(BLOCK) ? n.getBoundingClientRect() : range.getBoundingClientRect();
      if (!r.width) return;
      /* длина заголовка меняется вместе со словом, поэтому запас шире */
      const side = n.matches('.hero h1 .ln') ? 96 : 20;
      const part = document.createElement('i');
      const left = Math.max(0, r.left - side), right = Math.min(html.clientWidth, r.right + side);
      part.style.cssText = `left:${left.toFixed(0)}px;top:${(r.top + y - 16).toFixed(0)}px;width:${(right - left).toFixed(0)}px;height:${(r.height + 32).toFixed(0)}px`;
      parts.append(part);
    });
    html.classList.remove('measuring');
    scrim.replaceChildren(parts);
  };
  let measureQueued = false;
  const remeasure = () => {
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(() => { measureQueued = false; measure(); });
  };
  if (!small) {
  addEventListener('resize', remeasure);
  addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  /* высота блоков меняется, например при смене вкладки примеров */
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.querySelector('main'));
  measure();
  }

  const layers = [...document.querySelectorAll('[data-speed]')];
  let queued = false;
  const paint = () => {
    const y = scrollY;
    layers.forEach((l) => { l.style.transform = `translate3d(0, ${(-(+l.dataset.speed) * y).toFixed(1)}px, 0)`; });
    moveCards();
    queued = false;
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(paint); } }, { passive: true });
  paint();
})();
