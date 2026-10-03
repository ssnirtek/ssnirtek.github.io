// Программа «Терминал»: команды help, about, projects, skills, experience, contact, open, ls, clear и другие.
(function () {
  const OS = (window.OS = window.OS || {});
  const D = OS.data;

  const PROMPT = 'kate@bijouterie:~$';
  const HELP = [
    ['help', 'список команд'],
    ['about', 'коротко обо мне'],
    ['projects', 'проекты'],
    ['skills', 'навыки'],
    ['experience', 'опыт и учёба'],
    ['contact', 'как связаться'],
    ['open <имя>', 'открыть окно (about, projects, skills, resume, contact, bijouterie, perfume)'],
    ['neofetch', 'система (как у программистов)'],
    ['github', 'открыть мой GitHub'],
    ['telegram', 'открыть Telegram'],
    ['ls', 'что есть на рабочем столе'],
    ['clear', 'очистить экран'],
  ];

  const commands = {
    help: () => HELP.map((h) => h[0].padEnd(14, ' ') + h[1]).join('\n'),
    about: () => D.about.join('\n\n'),
    whoami: () => D.owner.name + ', ' + D.owner.role,
    projects: () => D.projects.map((p) => '• ' + p.title + ' (' + p.stack.join(', ') + ')\n  ' + p.sub).join('\n'),
    skills: () => D.skills.map((g) => g.group + ': ' + g.items.join(', ')).join('\n'),
    experience: () => D.experience.map((e) => e[0] + '  ' + e[1]).join('\n'),
    contact: () => 'E-mail: ' + D.owner.email + '\nГород:  ' + D.owner.city,
    ls: () => OS.apps.list.filter((a) => a.desktop !== false).map((a) => a.id).join('  '),
    neofetch: () => [
      "     .-~~~~-.        kate@bijouterie",
      "   .'   ,,   '.      ---------------",
      "  (            )     OS:       Katya OS 2026",
      "  (            )     Стек:     PHP · Yii2 · MySQL · Git",
      "   '.        .'      Редактор: Cursor",
      "     '-....-'        Макеты:   Figma",
      "                     Статус:   открыта к предложениям",
    ].join('\n'),
    github: () => { window.open('https://github.com/' + D.owner.github, '_blank', 'noopener'); return 'открываю github.com/' + D.owner.github; },
    telegram: () => { window.open('https://t.me/' + D.owner.telegram, '_blank', 'noopener'); return 'открываю t.me/' + D.owner.telegram; },
    sudo: (args) => (args.join(' ').replace(/\s+/g, ' ').trim() === 'hire katya')
      ? '[sudo] пароль для recruiter: ********\nДоступ разрешён. Пишите: ' + D.owner.email + ' или @' + D.owner.telegram
      : 'recruiter is not in the sudoers file. This incident will be reported.',
    date: () => new Date().toLocaleString('ru-RU'),
    'hire-me': () => 'Заявка принята. Осталось написать на ' + D.owner.email + ' :)',
  };

  OS.apps.register({
    id: 'terminal', pos: [25.2, 44.8], title: 'Терминал', label: 'терминал', note: 'help', art: 'assets/art/folders/terminal.png', tab: 'left', tilt: -2, size: { w: 620, h: 400 },
    render(body) {
      body.innerHTML = '<div class="term"><div class="out" aria-live="polite"></div>' +
        '<form><span class="p">' + PROMPT + '</span><input type="text" autocomplete="off" spellcheck="false" aria-label="Команда"></form></div>';
      const out = body.querySelector('.out');
      const form = body.querySelector('form');
      const input = body.querySelector('input');
      const history = []; let hi = 0;

      const print = (text, cls) => {
        const d = document.createElement('div');
        if (cls) d.className = cls;
        d.textContent = text;
        out.append(d);
        body.scrollTop = body.scrollHeight;
      };

      print('Терминал. Напишите help, чтобы увидеть команды.', 'd');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const line = input.value.trim();
        input.value = '';
        if (!line) return;
        history.push(line); hi = history.length;
        print(PROMPT + ' ' + line, 'p');
        const [cmd, ...args] = line.split(/\s+/);
        if (cmd === 'clear') { out.replaceChildren(); return; }
        if (cmd === 'open') {
          const id = args[0];
          if (id && OS.apps.get(id)) { OS.wm.open(id); print('открываю ' + id, 'd'); }
          else print('не нашла программу «' + (id || '') + '». Попробуйте ls.', 'd');
          return;
        }
        if (commands[cmd]) print(commands[cmd](args));
        else print('команда не найдена: ' + cmd + '. Напишите help.', 'd');
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && history.length) { hi = Math.max(0, hi - 1); input.value = history[hi]; e.preventDefault(); }
        if (e.key === 'Tab') {
          e.preventDefault();
          const v = input.value.trim();
          const hit = v && Object.keys(commands).concat(['clear', 'open']).filter((c) => c.startsWith(v));
          if (hit && hit.length === 1) input.value = hit[0] + ' ';
        }
        if (e.key === 'ArrowDown' && history.length) { hi = Math.min(history.length, hi + 1); input.value = history[hi] || ''; e.preventDefault(); }
      });
      body.addEventListener('click', () => input.focus());
      setTimeout(() => input.focus(), 50);
    },
  });
})();
