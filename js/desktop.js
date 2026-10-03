// Рабочий стол: папки лежат свободно (позиции в процентах). Их можно перетаскивать, позиции запоминаются.
// Двойной клик (или касание на телефоне) открывает окно.
(function () {
  const OS = (window.OS = window.OS || {});
  const KEY = 'icon-pos-v1';
  const isMobile = () => window.matchMedia('(max-width: 720px)').matches;
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* без запоминания тоже работает */ } };

  function render() {
    const ul = document.getElementById('icons');
    const desk = document.getElementById('desktop');
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const saved = load();

    ul.replaceChildren(...OS.apps.list.filter((a) => a.desktop !== false).map((a) => {
      const pos = saved[a.id] || a.pos || [50, 50];
      const li = document.createElement('li');
      li.className = 'slot';
      li.dataset.app = a.id;
      li.style.left = pos[0] + '%';
      li.style.top = pos[1] + '%';

      const b = document.createElement('button');
      b.type = 'button'; b.className = 'icon';
      b.style.setProperty('--tilt', (a.tilt || 0) + 'deg');
      b.innerHTML = '<span class="glyph"></span><span class="label"></span><span class="note"></span>';
      if (a.art) {
        const f = OS.ui.folder(a.art, a.tab);
        if (a.href) { f.classList.add('shortcut'); f.insertAdjacentHTML('beforeend', '<i class="arrow" aria-hidden="true"></i>'); }   // стрелка ярлыка
        b.querySelector('.glyph').replaceWith(f);
      }
      else b.querySelector('.glyph').textContent = a.icon || '📄';
      b.querySelector('.label').textContent = a.label || a.title;
      b.querySelector('.note').textContent = a.note || '';

      let wasDragged = false;
      b.addEventListener('click', (e) => {
        if (wasDragged) return;                       // после перетаскивания окно не открываем
        ul.querySelectorAll('.icon.sel').forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
        // двойной клик, Enter с клавиатуры или одно касание на телефоне
        if (coarse || e.detail >= 2 || e.detail === 0) OS.wm.open(a.id);
      });

      // перетаскивание папки по столу
      li.addEventListener('pointerdown', (e) => {
        if (isMobile() || e.button !== 0) return;
        const dr = desk.getBoundingClientRect();
        const r = li.getBoundingClientRect();
        const offX = e.clientX - (r.left + r.width / 2), offY = e.clientY - (r.top + r.height / 2);
        const sx = e.clientX, sy = e.clientY;
        const startLeft = li.style.left, startTop = li.style.top;
        let moved = false;
        const move = (ev) => {
          if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
          moved = true; li.classList.add('drag');
          const x = Math.max(4, Math.min(96, (ev.clientX - offX - dr.left) / dr.width * 100));
          const y = Math.max(8, Math.min(92, (ev.clientY - offY - dr.top) / dr.height * 100));
          li.style.left = x + '%'; li.style.top = y + '%';
        };
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          li.classList.remove('drag');
          if (moved && OS.extras && OS.extras.onDrop && OS.extras.onDrop(li, a)) {
            // папку «бросили в корзину»: возвращаем на место
            li.style.left = startLeft; li.style.top = startTop;
            wasDragged = true; setTimeout(() => { wasDragged = false; }, 0);
          } else if (moved) {
            saved[a.id] = [parseFloat(li.style.left), parseFloat(li.style.top)];
            save(saved);
            wasDragged = true; setTimeout(() => { wasDragged = false; }, 0);
          }
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });

      li.append(b); return li;
    }));

    // клик по пустому месту снимает выделение
    if (!desk._bound) {
      desk._bound = true;
      desk.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('.icon')) ul.querySelectorAll('.icon.sel').forEach((x) => x.classList.remove('sel'));
      });
    }
  }

  // вернуть папки на исходные места
  function reset() { try { localStorage.removeItem(KEY); } catch (e) { /* ничего */ } render(); }

  // «обновить»: папки на мгновение гаснут и возвращаются, как на настоящем столе
  function refresh() {
    const ul = document.getElementById('icons');
    ul.classList.add('refresh');
    setTimeout(() => { render(); ul.classList.remove('refresh'); }, 200);
  }

  OS.desktop = { render, reset, refresh };
})();
