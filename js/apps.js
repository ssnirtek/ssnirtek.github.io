// Программы рабочего стола. Каждая программа: { id, title, label, note, art, tab, tilt, size, desktop, render(body) }.
//   label: подпись под папкой, note: рукописная приписка, art: картинка на папке, tab: вид вкладки (left/right/long), tilt: наклон в градусах.
// Чтобы добавить новую папку, достаточно вызвать OS.apps.register({...}) в конце этого файла.
(function () {
  const OS = (window.OS = window.OS || {});
  const D = OS.data;

  const list = [];
  OS.apps = {
    list,
    get: (id) => list.find((a) => a.id === id),
    register: (app) => { list.push(app); },
  };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const chips = (arr) => '<div class="chips">' + arr.map((c) => '<span class="chip">' + esc(c) + '</span>').join('') + '</div>';

  /* ---------- Обо мне ---------- */
  OS.apps.register({
    id: 'about', title: 'Обо мне', label: 'обо мне', note: 'профиль', art: 'assets/art/folders/about.webp', tab: 'left', tilt: -2, pos: [33.9, 25.8],
    skin: 'white', size: { w: 940, h: 700 },
    render(body) {
      const o = D.owner;
      const jobs = D.experience.slice(0, 3).concat([['2021 – 2025', 'ВкусВилл, сборщик заказов; контент-менеджер магазина']]);
      const edu = D.experience[4];
      const right = [
        [edu[0], edu[1], edu[2]],
        ['2026', 'Диплом: Bijouterie.ss', 'Интернет-магазин на Yii2, 10 таблиц, 96 проверок'],
        ['2025', 'Perfume API', 'REST-сервис: токены, заказы, отзывы, Postman'],
      ];
      const flat = (t) => esc(t).toUpperCase();
      const dots = (arr) => arr.map((x) => '<li>' + flat(x) + '.</li>').join('');
      const tools = ['PHP', 'Yii2', 'MySQL', 'Git', 'Postman', 'Figma'];
      const skills = ['Backend', 'REST API', 'Базы данных', 'Вёрстка', 'Макеты'];
      const projects = D.projects.map((p) => p.title);

      body.innerHTML =
        '<div class="ab">' +
          '<header class="ab-head">' +
            '<div class="ab-name"><span class="hand first">Екатерина</span><span class="hand last">Сысоева</span></div>' +
            '<div><div class="ab-tag"><svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><path d="M20 44 C18 14 120 6 168 22 C204 34 188 68 120 72 C52 76 12 66 14 40 C15 26 40 12 72 9"/></svg><span class="hand">обо мне</span></div>' +
            '<div class="ab-year type">2026</div></div>' +
          '</header>' +

          '<section class="ab-about">' +
            '<figure class="ab-photo"><img src="' + o.photo + '" alt="' + esc(o.name) + '"></figure>' +
            '<div><h2>Обо мне</h2>' +
              D.about.map((p) => '<p>' + esc(p) + '</p>').join('') +
              '<p><a href="mailto:' + o.email + '">Написать на почту</a></p></div>' +
          '</section>' +

          '<div class="ab-hi"><span class="t">Специализация</span><span class="sign">backend developer</span></div>' +

          '<section class="ab-tl type">' +
            '<div class="col">' + jobs.map((e) => '<div class="row"><span class="yr">' + flat(e[0]) + '</span><span><b>' + flat(e[1]) + '</b></span></div>').join('') + '</div>' +
            '<div class="col">' + right.map((e) => '<div class="row"><span class="yr">' + flat(e[0]) + '</span><span><b>' + flat(e[1]) + '</b><br><span class="sub">' + flat(e[2]) + '</span></span></div>').join('') + '</div>' +
          '</section>' +

          '<section class="ab-cols type">' +
            '<div><h3>[инструменты]</h3><ul>' + dots(tools) + '</ul></div>' +
            '<div><h3>[навыки]</h3><ul>' + dots(skills) + '</ul></div>' +
            '<div><h3>[качества]</h3><ul>' + dots(D.qualities) + '</ul></div>' +
            '<div><h3>[проекты]</h3><ul>' + dots(projects) + '</ul></div>' +
            '<div><h3>[языки]</h3><ul>' + D.languages.map((l) => '<li>' + esc(l[0]).toUpperCase() + ' ' + l[1] + '.</li>').join('') + '</ul></div>' +
          '</section>' +

          '<footer class="ab-foot"><a href="https://t.me/' + o.telegram + '" target="_blank" rel="noopener">@' + esc(o.telegram) + '</a><a href="mailto:' + o.email + '">' + esc(o.email) + '</a><span>' + esc(o.city) + '</span></footer>' +
        '</div>';
    },
  });

  /* ---------- Общие кусочки для «белых листов» ---------- */
  // Заголовок листа: крупные буквы маркером, одно слово розовой кистью (как фамилия на столе)
  const head = (kicker, plain, accent) =>
    '<header class="sh-head"><p class="type sh-kick">' + esc(kicker) + '</p>' +
    '<h2 class="hand sh-title">' + esc(plain) + (accent ? ' <span class="pk">' + esc(accent) + '</span>' : '') + '</h2></header>';
  // Строка с технологиями в скобках, как в CV: [ PHP · YII2 · MYSQL ]
  const bracket = (arr) => '<p class="type sh-stack">[ ' + arr.map((s) => esc(s).toUpperCase()).join(' · ') + ' ]</p>';
  const dotted = (arr) => arr.map((x) => '<li>' + esc(x).toUpperCase() + '.</li>').join('');

  /* ---------- Проекты (папка с папками) ---------- */
  OS.apps.register({
    id: 'projects', pos: [52.7, 17.3], title: 'Проекты', label: 'проекты', note: 'работы', art: 'assets/art/folders/projects.webp', tab: 'right', tilt: 1.5,
    skin: 'white', size: { w: 700, h: 520 },
    render(body) {
      body.innerHTML = '<div class="ab">' + head('портфолио', 'Выполненные', 'проекты') + '<ul class="files sh-files"></ul>' +
        '<p class="note sh-hint">дважды нажмите на папку, чтобы открыть</p></div>';
      const ul = body.querySelector('.files');
      D.projects.filter((p) => !p.hidden).forEach((p, i) => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'file'; b.title = p.sub;
        b.style.setProperty('--tilt', [-1.5, 1, -0.5, 1.8, -1][i % 5] + 'deg');
        b.innerHTML = '<span class="glyph"></span><span class="label"></span><span class="note"></span>';
        b.querySelector('.glyph').replaceWith(OS.ui.folder(p.art, p.tab));
        b.querySelector('.label').textContent = p.label || p.title;
        b.querySelector('.note').textContent = p.note || '';
        b.addEventListener('dblclick', () => OS.wm.open(p.id));
        b.addEventListener('click', (e) => { if (e.detail === 0 || window.matchMedia('(pointer: coarse)').matches) OS.wm.open(p.id); });
        li.append(b); ul.append(li);
      });
    },
  });

  /* ---------- Проект: Bijouterie.ss ---------- */
  OS.apps.register({
    id: 'bijouterie', title: 'Bijouterie.ss', desktop: false, skin: 'white', size: { w: 900, h: 720 },
    render(body) {
      const b = D.bijouterie, p = D.projects[0];
      body.innerHTML = '<div class="ab">' + head(p.sub, 'Bijouterie', '.ss') + bracket(p.stack) +
        '<div class="sh-stage"><img src="assets/img/bijouterie-laptop.jpg" alt="Главная страница магазина на ноутбуке" style="flex:1.7;min-width:0">' +
        '<img class="phone" src="assets/img/bijouterie-phone.jpg" alt="Карточка товара на телефоне"></div>' +
        '<div class="sh-facts">' + b.facts.map((f) => '<div><b class="hand">' + f[0] + '</b><span class="type">' + esc(f[1]) + '</span></div>').join('') + '</div>' +
        '<ul class="sh-list">' + b.points.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>' +
        '<h3 class="hand sh-sub">Как это устроено</h3><div class="sh-gal">' +
        b.slides.map((s) => '<a href="assets/img/' + s[0] + '.jpg" target="_blank" rel="noopener" title="' + esc(s[1]) + '"><img src="assets/img/' + s[0] + '.jpg" alt="' + esc(s[1]) + '" loading="lazy"></a>').join('') + '</div></div>';
    },
  });

  /* ---------- Проект: Perfume API ---------- */
  OS.apps.register({
    id: 'perfume', title: 'Perfume API', desktop: false, skin: 'white', size: { w: 760, h: 640 },
    render(body) {
      const f = D.perfume, p = D.projects[1];
      body.innerHTML = '<div class="ab">' + head(p.sub, 'Perfume', 'API') + bracket(p.stack) +
        '<ul class="sh-list">' + f.points.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>' +
        '<h3 class="hand sh-sub">Запросы</h3><div class="type sh-api">' +
        f.endpoints.map((e) => '<div><span class="pk-m">' + e[0].padEnd(4, ' ') + '</span> ' + esc(e[1]) + '</div>').join('') + '</div></div>';
    },
  });

  /* ---------- Проект: Gift Selector (C#) ---------- */
  OS.apps.register({
    id: 'gift', title: 'Gift Selector', desktop: false, skin: 'white', size: { w: 900, h: 720 },
    render(body) {
      const g = D.gift, p = D.projects.find((x) => x.id === 'gift');
      body.innerHTML = '<div class="ab">' + head(p.sub, 'Gift', 'Selector') + bracket(p.stack) +
        '<div class="sh-stage sh-win"><img src="assets/img/gift-app.png" alt="Главное окно приложения для подбора подарков"></div>' +
        '<div class="sh-facts">' + g.facts.map((f) => '<div><b class="hand">' + f[0] + '</b><span class="type">' + esc(f[1]) + '</span></div>').join('') + '</div>' +
        '<ul class="sh-list">' + g.points.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>' +
        '<h3 class="hand sh-sub">Как устроена база</h3>' +
        '<section class="ab-cols type sh-cols"><div><h3>[таблицы]</h3><ul>' + dotted(g.tables) + '</ul></div>' +
        '<div style="grid-column: span 2"><h3>[запрос]</h3><div class="sh-api" style="white-space:pre">' + esc(g.code) + '</div></div></section>' +
        '<p class="type sh-stack" style="margin-top:22px">[ <a href="https://github.com/' + D.owner.github + '/gift" target="_blank" rel="noopener">github.com/' + esc(D.owner.github) + '/gift</a> ]</p></div>';
    },
  });

  /* ---------- О системе (из меню правой кнопки) ---------- */
  OS.apps.register({
    id: 'system', title: 'О системе', icon: '⚙', desktop: false, skin: 'white', size: { w: 640, h: 600 },
    render(body) {
      const o = D.owner;
      body.innerHTML = '<div class="ab">' + head('о системе', 'Портфолио', '2026') + bracket(['версия 2026']) +
        '<section class="sh-tl type">' +
        D.system.map((r) => '<div class="row"><span class="yr">' + esc(r[0]).toUpperCase() + '</span><div><b>' +
          (r[0] === 'статус' ? '<span class="sys-dot"></span>' : '') + esc(r[1]).toUpperCase() + '</b></div></div>').join('') + '</section>' +
        '<p class="type sh-stack sys-links">[ <a href="https://github.com/' + o.github + '" target="_blank" rel="noopener">github.com/' + esc(o.github) + '</a> · ' +
        '<a href="https://t.me/' + o.telegram + '" target="_blank" rel="noopener">@' + esc(o.telegram) + '</a> ]</p></div>';
    },
  });

  /* ---------- ИИ: опыт работы с нейросетями ---------- */
  OS.apps.register({
    id: 'ai', title: 'ИИ', desktop: false, skin: 'white', size: { w: 900, h: 720 },
    render(body) {
      const fig = (s) => '<figure class="ai-shot' + (s.wide ? ' wide' : '') + '"><a href="assets/ai/' + s.src + '.jpg" target="_blank" rel="noopener" title="' + esc(s.title) + '">' +
        '<img src="assets/ai/' + s.src + '.jpg" alt="' + esc(s.title) + '" loading="lazy"></a><figcaption class="type">' + esc(s.title) + '</figcaption></figure>';
      const shots = D.aiShots.map(fig);
      // последняя картинка стоит в паре с примером запроса
      const last = shots.pop();
      const gallery = '<h3 class="hand sh-sub">Визуализация магазина</h3>' +
        '<p class="sh-text">Визуализация магазина из дипломного проекта в реальном пространстве. Изображения сгенерированы нейросетью Gemini по моим запросам: я задавала фирменные цвета (графит, нежно-розовый, травяной зелёный), материалы и ракурсы и дорабатывала результат до соответствия замыслу. Это не фотографии: магазин существует только как сайт.</p>' +
        '<div class="ai-gal">' + shots.join('') + last +
        '<div class="ai-prompt-box"><h3>[пример запроса]</h3><p class="sh-api ai-prompt">' + esc(D.aiPrompt) + '</p></div></div>';
      const items = D.ai.map((c) => '<li><b class="type">' + esc(c.title).toUpperCase() + '</b>' +
        (c.tools ? '<span class="type sh-stack" style="display:block;margin:2px 0 4px">[ ' + c.tools.map((t) => esc(t).toUpperCase()).join(' · ') + ' ]</span>' : '') +
        '<span>' + esc(c.what) + '</span>' + (c.result ? '<br><span style="color:var(--black)">Результат: ' + esc(c.result) + '</span>' : '') + '</li>').join('');
      body.innerHTML = '<div class="ab">' + head('нейросети и автоматизация', 'Работа с', 'ИИ') +
        (items ? '<ul class="sh-list" style="margin-top:18px">' + items + '</ul>' : '<p class="sh-text">Здесь будут проекты, в которых я использовала нейросети.</p>') +
        gallery + '</div>';
    },
  });

  /* ---------- Дизайн в Figma: папка с кейсами и окна кейсов ---------- */
  OS.apps.register({
    id: 'figma', title: 'Дизайн в Figma', desktop: false, skin: 'white', size: { w: 700, h: 520 },
    render(body) {
      body.innerHTML = '<div class="ab">' + head('макеты сайтов и инфографика', 'Дизайн в', 'Figma') + '<ul class="files sh-files"></ul>' +
        '<p class="note sh-hint">дважды нажмите на папку, чтобы открыть</p></div>';
      const ul = body.querySelector('.files');
      D.figma.filter((c) => !c.hidden).forEach((c, i) => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'file'; b.title = c.sub;
        b.style.setProperty('--tilt', [-1.5, 1, -0.5, 1.8][i % 4] + 'deg');
        b.innerHTML = '<span class="glyph"></span><span class="label"></span><span class="note"></span>';
        b.querySelector('.glyph').replaceWith(OS.ui.folder(c.art, c.tab));
        b.querySelector('.label').textContent = c.label;
        b.querySelector('.note').textContent = c.note;
        b.addEventListener('dblclick', () => OS.wm.open(c.id));
        b.addEventListener('click', (e) => { if (e.detail === 0 || window.matchMedia('(pointer: coarse)').matches) OS.wm.open(c.id); });
        li.append(b); ul.append(li);
      });
    },
  });

  D.figma.forEach((c) => {
    OS.apps.register({
      id: c.id, title: c.title, desktop: false, skin: 'white', size: { w: 900, h: 700 },
      render(body) {
        // картинки лежат в assets/figma/<папка>/1.jpg, 2.jpg ...; если файла нет, плитка тихо убирается
        const shots = Array.from({ length: c.shots }, (_, i) => 'assets/figma/' + c.dir + '/' + (i + 1) + '.jpg');
        body.innerHTML = '<div class="ab">' + head(c.sub, c.title) + bracket(c.stack) +
          '<p class="sh-text">' + esc(c.text) + '</p><div class="sh-gal sh-fig">' +
          shots.map((s) => '<a href="' + s + '" target="_blank" rel="noopener"><img src="' + s + '" alt="' + esc(c.title) + '" loading="lazy" onerror="this.closest(\'a\').remove()"></a>').join('') + '</div></div>';
      },
    });
  });

  /* ---------- Остальные проекты (общий шаблон) ---------- */
  D.projects.filter((p) => p.text).forEach((p) => {
    OS.apps.register({
      id: p.id, title: p.title, desktop: false, skin: 'white', size: p.shots || p.points ? { w: 860, h: 700 } : { w: 560, h: 380 },
      render(body) {
        const gh = p.repo ? '<p class="proj-links"><a class="hb-lite" href="https://github.com/' + D.owner.github + '/' + p.repo + '" target="_blank" rel="noopener">код на GitHub</a></p>' : '';
        body.innerHTML = '<div class="ab">' + head(p.sub, p.title) + bracket(p.stack) + '<p class="sh-text">' + esc(p.text) + '</p>' +
          (p.points ? '<ul class="sh-list">' + p.points.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>' : '') + gh +
          (p.shots ? '<div class="sh-gal sh-fig proj-gal">' + p.shots.map((s) => '<figure><a href="assets/projects/' + s.src + '.jpg" target="_blank" rel="noopener"><img src="assets/projects/' + s.src + '.jpg" alt="' + esc(s.cap) + '" loading="lazy"></a><figcaption class="type">' + esc(s.cap) + '</figcaption></figure>').join('') + '</div>' : '') +
          (p.note2 ? '<p class="note sh-hint">' + esc(p.note2) + '</p>' : '') + '</div>';
      },
    });
  });

  /* ---------- Навыки ---------- */
  OS.apps.register({
    id: 'skills', pos: [65.8, 36.7], title: 'Навыки', label: 'навыки', note: 'технологии', art: 'assets/art/folders/skills.webp', tab: 'long', tilt: -1,
    skin: 'white', size: { w: 820, h: 600 },
    render(body) {
      body.innerHTML = '<div class="ab">' + head('навыки', 'Профессиональные', 'навыки') +
        '<section class="ab-cols type sh-cols">' +
        D.skills.map((g) => '<div><h3>[' + esc(g.group) + ']</h3><ul>' + dotted(g.items) + '</ul></div>').join('') + '</section></div>';
    },
  });

  /* ---------- Опыт и учёба ---------- */
  OS.apps.register({
    id: 'experience', pos: [41.8, 71.1], title: 'Опыт и образование', label: 'опыт', note: 'работа и учёба', art: 'assets/art/folders/experience.webp', tab: 'left', tilt: 2,
    skin: 'white', size: { w: 780, h: 660 },
    render(body) {
      body.innerHTML = '<div class="ab">' + head('опыт и образование', 'Опыт и', 'образование') + '<section class="sh-tl type">' +
        D.experience.map((e) => '<div class="row"><span class="yr">' + esc(e[0]).toUpperCase() + '</span><div><b>' + esc(e[1]).toUpperCase() + '</b><p class="sub">' + esc(e[2]).toUpperCase() + '</p></div></div>').join('') + '</section></div>';
    },
  });

  /* ---------- Резюме (PDF) ---------- */
  OS.apps.register({
    id: 'resume', pos: [64.3, 72.8], posNarrow: [52, 56], title: 'Резюме', label: 'резюме', note: 'pdf', art: 'assets/art/folders/resume.webp', tab: 'right', tilt: -1.5,
    skin: 'white', size: { w: 680, h: 580 },
    render(body) {
      body.style.padding = '0';
      body.innerHTML = '<iframe class="pdf" src="' + D.owner.resume + '" title="Резюме"></iframe>';
    },
  });

  /* ---------- Контакты ---------- */
  OS.apps.register({
    id: 'contact', pos: [94.4, 11.4], title: 'Контакты', label: 'контакты', note: 'почта, telegram', art: 'assets/art/folders/contact.webp', tab: 'long', tilt: 1,
    skin: 'white', size: { w: 560, h: 440 },
    render(body) {
      const o = D.owner;
      body.innerHTML = '<div class="ab">' + head('контакты', 'Как', 'связаться') +
        '<p class="sh-text">Рассматриваю предложения о работе в роли backend-разработчика. Связаться со мной можно через Telegram или по электронной почте.</p>' +
        '<ul class="sh-contacts type">' +
          '<li><span>[telegram]</span><a href="https://t.me/' + o.telegram + '" target="_blank" rel="noopener">@' + esc(o.telegram) + '</a></li>' +
          '<li><span>[e-mail]</span><a href="mailto:' + o.email + '">' + esc(o.email) + '</a></li>' +
          '<li><span>[github]</span><a href="https://github.com/' + o.github + '" target="_blank" rel="noopener">github.com/' + esc(o.github) + '</a></li>' +
          '<li><span>[город]</span><b>' + esc(o.city) + '</b></li>' +
        '</ul></div>';
    },
  });
})();
