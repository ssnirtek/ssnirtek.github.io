// «Настоящий рабочий стол»: корзина, трей (раскладка, сеть, батарея, календарь), поиск по столу (Ctrl+K),
// приветствие по времени суток, подчёркивание имени; ярлыки-ссылки (выключены флагом SHORTCUTS).
// Всё отключается удалением строки OS.extras.init() в main.js.
(function () {
  const OS = (window.OS = window.OS || {});
  const D = OS.data;
  const o = D.owner;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const isMobile = () => window.matchMedia('(max-width: 820px)').matches;
  const store = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };

  /* ---------- Ярлыки-ссылки (слева на столе). ВЫКЛЮЧЕНЫ: чтобы включить, поставьте SHORTCUTS = true ---------- */
  const SHORTCUTS = false;
  const LINKS = [
    { id: 'link-github', title: 'GitHub', label: 'github', note: 'мой код', art: 'assets/art/weave.webp', tab: 'right', href: 'https://github.com/' + o.github, pos: [5.5, 30], tilt: -1.5 },
    { id: 'link-telegram', title: 'Telegram', label: 'telegram', note: 'пиши мне', art: 'assets/art/pink-watercolor.webp', tab: 'left', href: 'https://t.me/' + o.telegram, pos: [5.5, 45], tilt: 1.2 },
    { id: 'link-mail', title: 'Почта', label: 'почта', note: 'e-mail', art: 'assets/art/envelope.webp', tab: 'long', href: 'mailto:' + o.email, pos: [5.5, 60], tilt: -1 },
    // hh.ru добавить, когда будет публичная ссылка на резюме: { id: 'link-hh', title: 'hh.ru', label: 'hh.ru', note: 'резюме', art: 'assets/art/lined.webp', tab: 'right', href: '...', pos: [5.5, 75], tilt: 1 },
  ];
  if (SHORTCUTS) LINKS.forEach((l) => OS.apps.register(l));

  /* ---------- Корзина: пустая ---------- */
  OS.apps.register({
    id: 'trash', title: 'Корзина', label: 'корзина', note: 'пусто', art: 'assets/art/oldpaper.webp', tab: 'long', pos: [5.3, 79.7], tilt: 1,
    skin: 'white', size: { w: 520, h: 260 },
    render(body) {
      body.innerHTML = '<div class="ab"><header class="sh-head"><p class="type sh-kick">корзина</p><h2 class="hand sh-title">Тут <span class="pk">пусто</span></h2></header></div>';
    },
  });

  // папку «бросили в корзину»: корзина трясётся, папка возвращается, появляется подпись
  function onDrop(li, app) {
    const t = document.querySelector('.slot[data-app="trash"]');
    if (!t || app.id === 'trash') return false;
    const a = li.getBoundingClientRect(), b = t.getBoundingClientRect();
    if (Math.hypot((a.left + a.width / 2) - (b.left + b.width / 2), (a.top + a.height / 2) - (b.top + b.height / 2)) > 80) return false;
    const icon = t.querySelector('.icon');
    icon.classList.remove('shake'); void icon.offsetWidth; icon.classList.add('shake');
    bubble(t, app.href ? 'ярлык не мусор' : 'эту папку нельзя: это моё портфолио');
    return true;
  }
  function bubble(slot, text) {
    document.querySelectorAll('.bubble').forEach((x) => x.remove());
    const r = slot.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'bubble'; el.textContent = text;
    el.style.left = (r.right + 8) + 'px'; el.style.top = (r.top + r.height / 2 - 18) + 'px';
    document.body.append(el);
    setTimeout(() => el.classList.add('out'), 2200);
    setTimeout(() => el.remove(), 2700);
  }

  /* ---------- Приветствие и подчёркивание имени ---------- */
  function greeting() {
    const h = new Date().getHours();
    const g = h < 5 ? 'доброй ночи' : h < 12 ? 'доброе утро' : h < 18 ? 'добрый день' : 'добрый вечер';
    const e = document.querySelector('#hello .eyebrow'); if (e) e.textContent = g + ' · портфолио 2026';
    const s = document.querySelector('#hello .script');
    if (s && !s.querySelector('.uline')) {
      s.insertAdjacentHTML('beforeend', '<svg class="uline" viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true"><path d="M4 12C56 3 110 15 168 7S262 9 296 4" pathLength="1"/></svg>');
    }
    const hello = document.getElementById('desktop');
    if (hello && !hello.querySelector('.hello-btns')) {
      const o = D.owner;
      hello.insertAdjacentHTML('beforeend',
        '<div class="hello-btns">' +
          '<a class="hb primary" href="' + D.owner.resume + '" download>скачать резюме</a>' +
          '<a class="hb ghost" href="https://t.me/' + o.telegram + '" target="_blank" rel="noopener"><svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><path d="M20 44 C18 14 120 6 168 22 C204 34 188 68 120 72 C52 76 12 66 14 40 C15 26 40 12 72 9"/></svg><span>написать</span></a>' +
        '</div>');
    }
  }

  /* ---------- Трей: поиск, раскладка, сеть, батарея, календарь ---------- */
  const SVG = {
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>',
    wifi: '<svg viewBox="0 0 24 24"><path d="M3 9.5a13 13 0 0 1 18 0M6 13a8.5 8.5 0 0 1 12 0M9 16.5a4 4 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/></svg>',
    off: '<svg viewBox="0 0 24 24"><path d="M3 9.5a13 13 0 0 1 18 0M6 13a8.5 8.5 0 0 1 12 0M9 16.5a4 4 0 0 1 6 0"/><path d="M4 4l16 16"/></svg>',
    bat: '<svg viewBox="0 0 24 24"><rect x="3" y="7.5" width="16" height="9" rx="2"/><path d="M21 10.5v3"/><rect class="lv" x="5" y="9.5" width="12" height="5" rx="1" fill="currentColor" stroke="none"/></svg>',
  };
  function tray() {
    const t = document.getElementById('tray'), clock = document.getElementById('clock');
    const mk = (cls, html, title, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tray-btn ' + cls; b.innerHTML = html; b.title = title; if (fn) b.addEventListener('click', fn); return b; };
    const search = mk('t-search', SVG.search, 'Поиск по столу (Ctrl+K)', () => spotlight(true));
    const lang = mk('t-lang', '<span>' + OS.lang.toUpperCase() + '</span>', 'Язык сайта: русский / английский', () => OS.i18n.setLang(OS.lang === 'en' ? 'ru' : 'en'));
    const net = mk('t-net', navigator.onLine ? SVG.wifi : SVG.off, navigator.onLine ? 'Сеть подключена' : 'Нет сети');
    net.style.cursor = 'default';
    const setNet = () => { net.innerHTML = navigator.onLine ? SVG.wifi : SVG.off; net.title = navigator.onLine ? 'Сеть подключена' : 'Нет сети'; };
    window.addEventListener('online', setNet); window.addEventListener('offline', setNet);
    t.insertBefore(search, clock); t.insertBefore(lang, clock); t.insertBefore(net, clock);
    if (navigator.getBattery) {
      navigator.getBattery().then((b) => {
        const el = mk('t-bat', SVG.bat + '<span></span>', 'Батарея');
        el.style.cursor = 'default';
        const upd = () => { el.querySelector('span').textContent = Math.round(b.level * 100) + '%'; el.querySelector('.lv').setAttribute('width', String(Math.max(1, Math.round(12 * b.level)))); };
        upd(); b.addEventListener('levelchange', upd);
        t.insertBefore(el, clock);
      }).catch(() => { /* батареи нет: просто не показываем */ });
    }
    clock.setAttribute('role', 'button'); clock.setAttribute('tabindex', '0'); clock.title = 'Календарь';
    clock.addEventListener('click', (e) => { e.stopPropagation(); calendar(); });
    clock.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); calendar(); } });
  }

  /* ---------- Календарь ---------- */
  let cal = null;
  function closeCal() { if (cal) { cal.remove(); cal = null; } }
  function calendar() {
    if (cal) { closeCal(); return; }
    let y = new Date().getFullYear(), m = new Date().getMonth();
    cal = document.createElement('div'); cal.className = 'cal'; cal.setAttribute('role', 'dialog'); cal.setAttribute('aria-label', 'Календарь');
    document.body.append(cal);
    const draw = () => {
      const now = new Date();
      const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      const title = new Date(y, m, 1).toLocaleDateString(OS.locale, { month: 'long' }) + ' ' + y;
      let cells = '';
      for (let i = 0; i < first; i++) cells += '<span></span>';
      for (let d = 1; d <= days; d++) {
        const today = d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
        cells += '<span class="' + (today ? 'today' : '') + '">' + (today ? '<svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><path d="M20 44C18 14 120 6 168 22 204 34 188 68 120 72 52 76 12 66 14 40 15 26 40 12 72 9"/></svg>' : '') + '<b>' + d + '</b></span>';
      }
      cal.innerHTML = '<div class="cal-head"><button type="button" data-d="-1" aria-label="Предыдущий месяц">‹</button><h3>' + esc(title) + '</h3><button type="button" data-d="1" aria-label="Следующий месяц">›</button></div>' +
        '<div class="cal-wd">' + (OS.lang === 'en' ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']).map((x) => '<span>' + x + '</span>').join('') + '</div><div class="cal-grid">' + cells + '</div>' +
        '<p class="cal-foot">' + esc(now.toLocaleDateString(OS.locale, { weekday: 'long', day: 'numeric', month: 'long' })) + '</p>';
    };
    draw();
    cal.addEventListener('click', (e) => {
      e.stopPropagation();
      const b = e.target.closest('[data-d]'); if (!b) return;
      m += +b.dataset.d; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } draw();
    });
  }

  /* ---------- Поиск по столу (Ctrl+K или «/») ---------- */
  let spot = null;
  function spotlight(open) {
    if (!open) { if (spot) { spot.remove(); spot = null; } return; }
    if (spot) return;
    const hidden = new Set([...D.projects, ...D.figma].filter((x) => x.hidden).map((x) => x.id));
    const items = OS.apps.list.filter((a) => !hidden.has(a.id)).map((a) => {
      const p = D.projects.find((x) => x.id === a.id);
      return { name: a.title, hint: p ? p.sub : (a.href ? a.href.replace(/^mailto:|^https?:\/\//, '') : ''), kind: a.href ? 'ссылка' : 'окно', run: () => OS.wm.open(a.id) };
    }).concat([['mountain', 'горы'], ['night', 'ночной город'], ['spb', 'питер']].map(([k, n]) => ({ name: 'обои: ' + n, hint: '', kind: 'обои', run: () => OS.setWall(k) })))
      .concat([{ name: 'расставить папки заново', hint: '', kind: 'стол', run: () => OS.desktop.reset() }]);
    spot = document.createElement('div'); spot.className = 'spot';
    spot.innerHTML = '<div class="spot-card" role="dialog" aria-label="Поиск"><input type="text" placeholder="поиск: проекты, навыки, github…" aria-label="Поиск" autocomplete="off" spellcheck="false"><ul role="listbox"></ul></div>';
    document.body.append(spot);
    const input = spot.querySelector('input'), ul = spot.querySelector('ul');
    let list = [], idx = 0;
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      list = items.filter((i) => !q || (i.name + ' ' + i.hint).toLowerCase().includes(q)).slice(0, 8);
      idx = Math.min(idx, Math.max(0, list.length - 1));
      ul.innerHTML = list.length ? list.map((i, k) => '<li role="option" class="' + (k === idx ? 'on' : '') + '" data-k="' + k + '"><b>' + esc(i.name) + '</b><small>' + esc(i.hint) + '</small><em>' + i.kind + '</em></li>').join('') : '<li class="none">ничего не нашла</li>';
    };
    const go = (k) => { const it = list[k]; if (!it) return; spotlight(false); it.run(); };
    input.addEventListener('input', () => { idx = 0; draw(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(list.length - 1, idx + 1); draw(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); draw(); }
      else if (e.key === 'Enter') { e.preventDefault(); go(idx); }
    });
    ul.addEventListener('click', (e) => { const li = e.target.closest('li[data-k]'); if (li) go(+li.dataset.k); });
    ul.addEventListener('mousemove', (e) => { const li = e.target.closest('li[data-k]'); if (li && +li.dataset.k !== idx) { idx = +li.dataset.k; draw(); } });
    spot.addEventListener('pointerdown', (e) => { if (e.target === spot) spotlight(false); });
    draw(); input.focus();
  }

  /* ---------- Запуск ---------- */
  function init() {
    greeting(); tray();
    document.addEventListener('click', (e) => { if (cal && !e.target.closest('.cal')) closeCal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const overlay = cal || spot || document.querySelector('.ctx');
        closeCal(); spotlight(false);
        // Esc без открытых подсказок закрывает верхнее окно (кроме ввода в терминале)
        const inField = /^(input|textarea)$/i.test((e.target.tagName || ''));
        const top = OS.wm.focused && OS.wm.focused();
        if (!overlay && top && !inField) OS.wm.close(top);
      }
      const typing = /^(input|textarea)$/i.test((e.target.tagName || '')) || e.target.isContentEditable;
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); spotlight(true); }
    });
  }

  OS.extras = { init, onDrop, spotlight };
})();
