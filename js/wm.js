// Менеджер окон: открыть, закрыть, двигать, менять размер, сворачивать, разворачивать.
(function () {
  const OS = (window.OS = window.OS || {});
  const wins = new Map();          // id -> { id, el, app, min, max }
  let zTop = 10;
  let cascade = 0;

  const desk = () => document.getElementById('windows');   // область окон: над панелью задач
  const layer = () => document.getElementById('windows');
  const isMobile = () => window.matchMedia('(max-width: 720px)').matches;

  function open(appId) {
    const app = OS.apps.get(appId);
    if (!app) return null;

    // одно окно на программу: повторное открытие просто поднимает его
    if (wins.has(appId)) {
      const w = wins.get(appId);
      restore(w);
      focus(w);
      return w;
    }

    const el = document.createElement('section');
    el.className = 'win' + (app.skin ? ' skin-' + app.skin : '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', app.title);
    el.innerHTML =
      '<header class="win-bar">' +
        '<span class="win-icon"></span><span class="win-title"></span>' +
        '<div class="win-btns">' +
          '<button type="button" data-a="min" aria-label="Свернуть">&#8211;</button>' +
          '<button type="button" data-a="max" aria-label="Развернуть">&#9633;</button>' +
          '<button type="button" data-a="close" aria-label="Закрыть">&#215;</button>' +
        '</div>' +
      '</header><div class="win-body"></div><span class="win-grip"></span>';
    el.querySelector('.win-icon').textContent = app.icon || '';
    el.querySelector('.win-title').textContent = app.title;

    const size = app.size || { w: 560, h: 400 };
    const d = desk().getBoundingClientRect();
    const w = Math.min(size.w, d.width - 20);
    const h = Math.min(size.h, d.height - 20);
    const x = Math.max(8, Math.min(d.width - w - 8, 110 + (cascade % 6) * 28));
    const y = Math.max(8, Math.min(d.height - h - 8, 40 + (cascade % 6) * 28));
    cascade++;
    Object.assign(el.style, { width: w + 'px', height: h + 'px', left: x + 'px', top: y + 'px' });

    const win = { id: appId, el, app, min: false, max: false };
    wins.set(appId, win);
    layer().appendChild(el);
    app.render(el.querySelector('.win-body'), win);

    bind(win);
    focus(win);
    OS.taskbar && OS.taskbar.refresh();
    return win;
  }

  function bind(win) {
    const el = win.el;
    el.addEventListener('pointerdown', () => focus(win));

    el.querySelector('.win-btns').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.a === 'close') close(win);
      if (b.dataset.a === 'min') minimize(win);
      if (b.dataset.a === 'max') toggleMax(win);
    });

    const bar = el.querySelector('.win-bar');
    bar.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) toggleMax(win); });
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || win.max || isMobile()) return;
      const r = el.getBoundingClientRect();
      const dr = desk().getBoundingClientRect();
      const dx = e.clientX - r.left, dy = e.clientY - r.top;
      bar.setPointerCapture(e.pointerId);
      const move = (ev) => {
        let x = ev.clientX - dx - dr.left, y = ev.clientY - dy - dr.top;
        x = Math.max(-r.width + 90, Math.min(dr.width - 90, x));
        y = Math.max(0, Math.min(dr.height - 36, y));
        el.style.left = x + 'px'; el.style.top = y + 'px';
      };
      const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
    });

    const grip = el.querySelector('.win-grip');
    grip.addEventListener('pointerdown', (e) => {
      if (win.max || isMobile()) return;
      e.stopPropagation();
      const r = el.getBoundingClientRect();
      const sx = e.clientX, sy = e.clientY;
      grip.setPointerCapture(e.pointerId);
      const move = (ev) => {
        el.style.width = Math.max(280, r.width + ev.clientX - sx) + 'px';
        el.style.height = Math.max(180, r.height + ev.clientY - sy) + 'px';
      };
      const up = () => { grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); };
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', up);
    });
  }

  function focus(win) {
    wins.forEach((w) => w.el.classList.toggle('focus', w === win));
    win.el.style.zIndex = ++zTop;
    OS.taskbar && OS.taskbar.refresh();
  }
  function focused() {
    let top = null;
    wins.forEach((w) => { if (!w.min && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w; });
    return top;
  }
  function minimize(win) {
    win.min = true; win.el.classList.add('min');
    const next = focused(); if (next) focus(next);
    OS.taskbar && OS.taskbar.refresh();
  }
  function restore(win) {
    win.min = false; win.el.classList.remove('min');
  }
  function toggleMax(win) {
    win.max = !win.max;
    win.el.classList.toggle('max', win.max);
  }
  function close(win) {
    win.el.remove(); wins.delete(win.id);
    const next = focused(); if (next) focus(next);
    OS.taskbar && OS.taskbar.refresh();
  }

  OS.wm = { open, focus, minimize, restore, close, all: () => [...wins.values()], focused };
})();
