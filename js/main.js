// Точка входа: рисуем рабочий стол и панель задач. Без заставки: сразу видно имя и папки.
(function () {
  const OS = window.OS;

  // Обои: «mountain» (горы), «night» (ночной город) или «spb» (Петербург, телебашня). Выбор запоминается.
  const saved = (() => { try { return localStorage.getItem('wall'); } catch (e) { return null; } })();
  document.body.dataset.wall = ['night', 'spb', 'mountain'].includes(saved) ? saved : 'mountain';
  OS.setWall = (w) => {
    document.body.dataset.wall = w;
    try { localStorage.setItem('wall', w); } catch (e) { /* без запоминания тоже работает */ }
  };

  OS.desktop.render();
  OS.taskbar.init();
  OS.contextMenu.init();
  OS.extras.init();
  OS.works.init();

  // можно открыть нужную папку по ссылке: index.html#projects
  const fromHash = location.hash.replace('#', '');
  if (fromHash && OS.apps.get(fromHash)) OS.wm.open(fromHash);
})();
