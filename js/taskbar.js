// Панель задач: кнопки открытых окон, меню «Пуск», часы.
(function () {
  const OS = (window.OS = window.OS || {});
  const tasks = () => document.getElementById('tasks');
  const menu = () => document.getElementById('startmenu');
  const start = () => document.getElementById('start');

  function refresh() {
    const top = OS.wm.focused();
    tasks().replaceChildren(...OS.wm.all().map((w) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'task' + (w === top ? ' active' : '') + (w.min ? ' min' : '');
      const i = document.createElement('span'); i.textContent = w.app.icon || '';
      const t = document.createElement('span'); t.textContent = w.app.title;
      b.append(i, t);
      b.addEventListener('click', () => {
        if (w.min) { OS.wm.restore(w); OS.wm.focus(w); }
        else if (w === top) OS.wm.minimize(w);
        else OS.wm.focus(w);
      });
      return b;
    }));
  }

  function buildMenu() {
    const m = menu();
    m.replaceChildren(...OS.apps.list.filter((a) => a.desktop !== false).map((a) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = a.label || a.title;
      b.addEventListener('click', () => { toggleMenu(false); OS.wm.open(a.id); });
      li.append(b); return li;
    }));
    const sep = document.createElement('li'); sep.className = 'sep'; m.append(sep);
    const cap = document.createElement('li'); cap.className = 'cap'; cap.textContent = 'обои'; m.append(cap);
    [['mountain', 'горы'], ['night', 'ночной город'], ['spb', 'питер']].forEach(([key, name]) => {
      const w = document.createElement('li');
      const wb = document.createElement('button'); wb.type = 'button'; wb.textContent = name;
      wb.addEventListener('click', () => { OS.setWall(key); toggleMenu(false); });
      w.append(wb); m.append(w);
    });
    const sep3 = document.createElement('li'); sep3.className = 'sep'; m.append(sep3);
    const r = document.createElement('li');
    const rb = document.createElement('button'); rb.type = 'button'; rb.textContent = 'расставить папки заново';
    rb.addEventListener('click', () => { OS.desktop.reset(); toggleMenu(false); });
    r.append(rb); m.append(r);
  }

  function toggleMenu(show) {
    const open = show === undefined ? menu().hidden : show;
    menu().hidden = !open;
    start().setAttribute('aria-expanded', String(open));
  }

  function clock() {
    const d = new Date();
    document.getElementById('clock').textContent = d.toLocaleTimeString(OS.locale, { hour: '2-digit', minute: '2-digit' });
  }

  function init() {
    buildMenu();
    start().addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
    document.addEventListener('click', (e) => { if (!menu().contains(e.target)) toggleMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });
    clock(); setInterval(clock, 20000);
    refresh();
  }

  OS.taskbar = { init, refresh };
})();
