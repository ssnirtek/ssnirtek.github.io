// Меню по правой кнопке мыши, как на настоящем рабочем столе.
// На пустом месте: обновить, сменить обои, расставить папки, о системе. На папке: открыть.
// Внутри окон остаётся обычное меню браузера (копировать, открыть ссылку и т. д.).
(function () {
  const OS = (window.OS = window.OS || {});
  let menu = null;

  const WALLS = [['mountain', 'горы'], ['night', 'ночной город'], ['meadow', 'луг']];

  function close() { if (menu) { menu.remove(); menu = null; } }

  // Один пункт: { label, run } | { label, sub: [...] } | { sep: true }
  function build(items, isSub) {
    const ul = document.createElement('ul');
    ul.className = isSub ? 'ctx sub' : 'ctx';
    ul.setAttribute('role', 'menu');
    items.forEach((it) => {
      const li = document.createElement('li');
      if (it.sep) { li.className = 'sep'; li.setAttribute('role', 'separator'); ul.append(li); return; }
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'menuitem');
      const chk = document.createElement('span'); chk.className = 'chk'; chk.textContent = it.checked ? '•' : '';
      const txt = document.createElement('span'); txt.textContent = it.label;
      b.append(chk, txt);
      if (it.sub) {
        li.className = 'has-sub';
        const arrow = document.createElement('span'); arrow.className = 'arr'; arrow.textContent = '›';
        b.append(arrow);
        li.append(b, build(it.sub, true));
        const toggle = (open) => li.classList.toggle('open', open);
        li.addEventListener('mouseenter', () => toggle(true));
        li.addEventListener('mouseleave', () => toggle(false));
        b.addEventListener('click', () => toggle(!li.classList.contains('open')));
      } else {
        b.addEventListener('click', () => { close(); it.run(); });
        li.addEventListener('mouseenter', () => { ul.querySelectorAll(':scope > .has-sub.open').forEach((x) => x.classList.remove('open')); });
        li.append(b);
      }
      ul.append(li);
    });
    return ul;
  }

  function show(x, y, items) {
    close();
    menu = build(items, false);
    menu.style.visibility = 'hidden';
    document.body.append(menu);
    const r = menu.getBoundingClientRect();
    const left = Math.max(6, Math.min(x, innerWidth - r.width - 8));
    const top = Math.max(6, Math.min(y, innerHeight - r.height - 8));
    menu.style.left = left + 'px'; menu.style.top = top + 'px';
    // если справа нет места, вложенное меню раскрывается влево
    if (left + r.width + 200 > innerWidth) menu.classList.add('flip');
    menu.style.visibility = '';
  }

  function desktopItems() {
    const cur = document.body.dataset.wall;
    return [
      { label: 'обновить', run: () => OS.desktop.refresh() },
      { sep: true },
      { label: 'сменить обои', sub: WALLS.map(([key, name]) => ({ label: name, checked: key === cur, run: () => OS.setWall(key) })) },
      { label: 'расставить папки заново', run: () => OS.desktop.reset() },
      { sep: true },
      { label: 'о системе', run: () => OS.wm.open('system') },
    ];
  }

  function onKey(e) {
    if (!menu) return;
    if (e.key === 'Escape') { close(); return; }
    const open = menu.querySelector('.has-sub.open > .sub');
    const scope = open || menu;
    const btns = [...scope.querySelectorAll(':scope > li > button')];
    const i = btns.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); btns[(i + 1) % btns.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); btns[i < 0 ? btns.length - 1 : (i - 1 + btns.length) % btns.length].focus(); }
    else if (e.key === 'ArrowRight') {
      const li = document.activeElement && document.activeElement.parentNode;
      if (li && li.classList.contains('has-sub')) { e.preventDefault(); li.classList.add('open'); const s = li.querySelector('.sub button'); if (s) s.focus(); }
    } else if (e.key === 'ArrowLeft' && open) {
      e.preventDefault(); const li = open.parentNode; li.classList.remove('open'); li.querySelector(':scope > button').focus();
    }
  }

  function init() {
    document.addEventListener('contextmenu', (e) => {
      // окна, панель задач и меню «Пуск» оставляем с обычным меню браузера
      if (e.target.closest('.win, #taskbar, #startmenu, .ctx')) return;
      if (!e.target.closest('#desktop')) return;
      e.preventDefault();
      const slot = e.target.closest('.slot');
      if (slot && slot.dataset.app) {
        const id = slot.dataset.app;
        show(e.clientX, e.clientY, [{ label: 'открыть', run: () => OS.wm.open(id) }]);
      } else {
        show(e.clientX, e.clientY, desktopItems());
      }
    });
    document.addEventListener('pointerdown', (e) => { if (menu && !e.target.closest('.ctx')) close(); }, true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('blur', close);
    window.addEventListener('resize', close);
    document.addEventListener('wheel', close, { passive: true });
  }

  OS.contextMenu = { init, close };
})();
