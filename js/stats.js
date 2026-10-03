// Счётчик посещений GoatCounter: без cookie, без личных данных, не следит между сайтами.
// Включается, когда ниже вписан код счётчика (адрес https://КОД.goatcounter.com). Пока код пустой, ничего не грузится.
// Считаем: просмотр страницы, какие окна открывают, клики по внешним ссылкам, язык. Локально (localhost) и при Do Not Track не считаем.
(function () {
  const OS = (window.OS = window.OS || {});
  const CODE = '';   // например 'ssnirtek'; получите на goatcounter.com/signup

  const off = !CODE || /^(localhost|127\.|\[::1\])/.test(location.hostname) || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const send = (path, title) => {
    if (off || !window.goatcounter || !window.goatcounter.count) return;
    window.goatcounter.count({ path, title: title || path, event: true });
  };
  OS.track = send;

  function init() {
    if (off) return;
    const s = document.createElement('script');
    s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.dataset.goatcounter = 'https://' + CODE + '.goatcounter.com/count';
    document.head.append(s);

    // какие окна открывают
    const open = OS.wm.open;
    OS.wm.open = function (id) {
      const app = OS.apps.get(id);
      send('open/' + id, 'Открыто окно: ' + (app ? app.title : id));
      return open.apply(this, arguments);
    };
    // клики по внешним ссылкам (GitHub, Telegram, почта, PDF)
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      const h = a.getAttribute('href');
      if (/\.pdf(\?|$)/i.test(h)) send('click/pdf', 'Резюме (PDF)');
      else if (/^mailto:/.test(h)) send('click/mail', 'Почта');
      else if (/^https?:/.test(h) && new URL(h, location.href).host !== location.host) send('click/' + new URL(h, location.href).host, 'Ссылка: ' + h);
    }, true);
    send('lang/' + OS.lang, 'Язык: ' + OS.lang);
  }

  OS.stats = { init };
})();
