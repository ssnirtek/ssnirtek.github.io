// Стикер «мои работы» на столе: карточка с фото, которые сменяются каждые 3 секунды.
// Клик по фото открывает окно проекта. Карточку можно перетащить, положение запоминается.
// Фото и подписи лежат в data.js (works). Отключается удалением строки OS.works.init() в main.js.
(function () {
  const OS = (window.OS = window.OS || {});
  const D = OS.data;
  const KEY = 'works-pos-v1';
  const EVERY = 3000;
  const isMobile = () => window.matchMedia('(max-width: 820px)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* без запоминания тоже работает */ } };

  function init() {
    const list = D.works || [];
    if (!list.length || isMobile()) return;
    const desk = document.getElementById('desktop'), wins = document.getElementById('windows');

    const el = document.createElement('aside');
    el.className = 'works'; el.setAttribute('aria-label', 'Мои работы');
    el.innerHTML =
      '<span class="tape"></span>' +
      '<button type="button" class="w-stage">' +
        list.map((w, i) => '<img class="w-slide' + (i === 0 ? ' on' : '') + '" ' + (i === 0 ? 'src' : 'data-src') + '="' + w.img + '" alt="' + esc(w.title + ', ' + w.sub) + '" draggable="false" decoding="async">').join('') +
        '<span class="w-open">открыть</span><i class="w-bar"></i>' +
      '</button>' +
      '<p class="w-cap"><b></b><small></small></p>' +
      '<div class="w-dots">' + list.map((w, i) => '<button type="button" aria-label="Показать: ' + esc(w.title) + '" data-i="' + i + '"></button>').join('') + '</div>';

    const pos = load();
    if (pos) { el.style.left = pos[0] + '%'; el.style.top = pos[1] + '%'; }
    desk.insertBefore(el, wins);

    const slides = [...el.querySelectorAll('.w-slide')], dots = [...el.querySelectorAll('.w-dots button')];
    // остальные слайды подгружаем, когда браузер освободился: первый экран грузится быстрее
    const loadRest = () => slides.forEach((s) => { if (s.dataset.src) { s.src = s.dataset.src; delete s.dataset.src; } });
    (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(loadRest, { timeout: 3000 });
    const cap = el.querySelector('.w-cap'), bar = el.querySelector('.w-bar'), stage = el.querySelector('.w-stage');
    let cur = 0, timer = null;

    const show = (i) => {
      cur = (i + list.length) % list.length;
      slides.forEach((s, k) => s.classList.toggle('on', k === cur));
      dots.forEach((d, k) => d.classList.toggle('on', k === cur));
      cap.classList.add('swap');
      setTimeout(() => {
        cap.querySelector('b').textContent = list[cur].title;
        cap.querySelector('small').textContent = list[cur].sub;
        cap.classList.remove('swap');
      }, 180);
      stage.setAttribute('aria-label', 'Открыть: ' + list[cur].title + ', ' + list[cur].sub);
    };
    const restartBar = () => { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; };
    const stop = () => { clearInterval(timer); timer = null; el.classList.add('paused'); };
    const play = () => {
      stop();
      if (document.hidden) return;
      el.classList.remove('paused'); restartBar();
      timer = setInterval(() => { show(cur + 1); restartBar(); }, EVERY);
    };
    cap.querySelector('b').textContent = list[0].title; cap.querySelector('small').textContent = list[0].sub;
    dots[0].classList.add('on'); stage.setAttribute('aria-label', 'Открыть: ' + list[0].title + ', ' + list[0].sub);

    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', play);
    el.addEventListener('focusin', stop);
    el.addEventListener('focusout', (e) => { if (!el.contains(e.relatedTarget)) play(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else play(); });
    dots.forEach((d) => d.addEventListener('click', () => { show(+d.dataset.i); }));

    // клик по фото открывает проект, перетаскивание двигает карточку
    let dragged = false;
    stage.addEventListener('click', () => { if (dragged) return; const w = list[cur]; if (w.open) OS.wm.open(w.open); });
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('.w-dots')) return;
      const dr = desk.getBoundingClientRect(), r = el.getBoundingClientRect();
      const ox = e.clientX - (r.left + r.width / 2), oy = e.clientY - (r.top + r.height / 2);
      const sx = e.clientX, sy = e.clientY; let moved = false;
      const move = (ev) => {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
        moved = true; el.classList.add('lift');
        el.style.left = Math.max(8, Math.min(92, (ev.clientX - ox - dr.left) / dr.width * 100)) + '%';
        el.style.top = Math.max(8, Math.min(92, (ev.clientY - oy - dr.top) / dr.height * 100)) + '%';
      };
      const up = () => {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
        el.classList.remove('lift');
        if (moved) { dragged = true; setTimeout(() => { dragged = false; }, 0); save([parseFloat(el.style.left), parseFloat(el.style.top)]); }
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });

    // «расставить папки заново» возвращает карточку на место
    const reset = OS.desktop.reset;
    OS.desktop.reset = () => { reset(); try { localStorage.removeItem(KEY); } catch (e) { /* ничего */ } el.style.left = ''; el.style.top = ''; };

    play();
  }

  OS.works = { init };
})();
