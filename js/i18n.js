// Язык сайта: русский (по умолчанию) или английский. Выбор запоминается; ссылка с ?lang=en сразу открывает английскую версию.
// Тексты данных (data.js) переводятся целиком после загрузки словаря (js/i18n-en.js), а всё, что появляется на экране
// (окна, подписи, меню), переводит наблюдатель: он ищет русский текст в словаре и заменяет его. Нет слова в словаре: остаётся по-русски.
(function () {
  const OS = (window.OS = window.OS || {});
  const CYR = /[А-Яа-яЁё]/;
  const fromUrl = new URLSearchParams(location.search).get('lang');
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) { /* без запоминания тоже работает */ }
  const lang = fromUrl === 'en' || fromUrl === 'ru' ? fromUrl : (saved === 'en' ? 'en' : 'ru');
  if (fromUrl) { try { localStorage.setItem('lang', fromUrl); } catch (e) { /* ничего */ } }

  OS.lang = lang;
  OS.locale = lang === 'en' ? 'en-GB' : 'ru-RU';
  document.documentElement.lang = lang;
  OS.EN = OS.EN || {};

  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
  let map = null;   // нормализованный ключ -> [перевод, исходный ключ]
  const buildMap = () => { map = new Map(); for (const k in OS.EN) map.set(norm(k), [OS.EN[k], k]); };

  // t('русская строка') -> перевод или та же строка. Понимает регистр: ВЕРХНИЙ остаётся верхним, «Первая заглавная» сохраняется.
  function t(str) {
    if (lang !== 'en' || typeof str !== 'string' || !CYR.test(str)) return str;
    if (!map) buildMap();
    const m = str.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const lead = m[1], tail = m[3];
    let core = m[2], dot = '', open = '', close = '';
    const br = core.match(/^\[\s*([\s\S]*?)\s*\]$/);
    if (br) { open = '[ '; close = ' ]'; core = br[1]; }
    if (core.length > 1 && core.endsWith('.') && !map.has(norm(core))) { dot = '.'; core = core.slice(0, -1); }
    let hit = map.get(norm(core));
    if (!hit) {
      // составные строки: «Результат: текст», «а · б · в», «Открыть: Проект, подпись»
      for (const sep of [': ', ' · ']) {
        if (core.indexOf(sep) > 0) {
          const parts = core.split(sep);
          const done = parts.map((x) => t(x));
          if (done.some((x, k) => x !== parts[k])) return lead + open + done.join(sep) + close + dot + tail;
        }
      }
      return str;
    }
    let out = hit[0];
    const letters = core.replace(/[^A-Za-zА-Яа-яЁё]/g, '');
    if (letters && letters === letters.toUpperCase() && letters.length > 1) out = out.toUpperCase();
    else if (core !== hit[1] && core[0] !== core[0].toLowerCase() && hit[1][0] === hit[1][0].toLowerCase()) out = out.charAt(0).toUpperCase() + out.slice(1);
    return lead + open + out + close + dot + tail;
  }

  // Перевод всех строк внутри объекта данных (массивы, вложенные объекты)
  function translateTree(v) {
    if (typeof v === 'string') return t(v);
    if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) v[i] = translateTree(v[i]); return v; }
    if (v && typeof v === 'object') { for (const k in v) v[k] = translateTree(v[k]); return v; }
    return v;
  }
  function translateData() {
    if (lang !== 'en' || !OS.data) return;
    translateTree(OS.data);
    OS.data.owner.resume = 'assets/resume-en.pdf';
    document.title = 'Ekaterina Sysoeva — portfolio';
    const d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', 'Portfolio of Ekaterina Sysoeva, backend developer (junior), built as a desktop.');
  }

  // Наблюдатель за экраном: переводит текстовые узлы и атрибуты, которые появляются на странице
  const ATTRS = ['title', 'aria-label', 'alt', 'placeholder'];
  function fixNode(n) {
    if (n.nodeType === 3) { const v = n.nodeValue; if (CYR.test(v)) { const r = t(v); if (r !== v) n.nodeValue = r; } return; }
    if (n.nodeType !== 1) return;
    if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
    for (const a of ATTRS) { const v = n.getAttribute(a); if (v && CYR.test(v)) { const r = t(v); if (r !== v) n.setAttribute(a, r); } }
    for (let c = n.firstChild; c; c = c.nextSibling) fixNode(c);
  }
  function observe() {
    if (lang !== 'en') return;
    fixNode(document.body);
    new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === 'childList') m.addedNodes.forEach(fixNode);
        else if (m.type === 'characterData') fixNode(m.target);
        else if (m.type === 'attributes') fixNode(m.target);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function setLang(l) {
    try { localStorage.setItem('lang', l); } catch (e) { /* ничего */ }
    const u = new URL(location.href); u.searchParams.delete('lang'); location.href = u.toString();
  }

  // tl(text): переводит многострочный текст построчно, сохраняя выравнивание пробелами (для терминала)
  function tl(text) {
    if (lang !== 'en' || typeof text !== 'string') return text;
    const NL = String.fromCharCode(10);
    return text.split(NL).map((line) => line.split(/(\s{2,})/).map((part) => (/^\s{2,}$/.test(part) ? part : t(part))).join('')).join(NL);
  }

  OS.t = t;
  OS.tl = tl;
  OS.i18n = { t, translateData, observe, setLang, lang, norm };
})();
