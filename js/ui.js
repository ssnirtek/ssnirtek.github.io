// Общие кусочки интерфейса. Сейчас тут «художественная папка»: корпус заполнен картинкой,
// позади выглядывает вкладка, сверху мягкая тень. У каждой папки своя картинка и свой вид вкладки.
(function () {
  const OS = (window.OS = window.OS || {});
  let n = 0;

  // Контуры задней стенки с вкладкой (холст 200 x 170): слева, справа, длинная
  const BACKS = {
    left:  'M14 152 V20 Q14 8 26 8 H74 Q82 8 87 15 L93 24 Q97 30 105 30 H180 Q192 30 192 42 V152 Z',
    right: 'M8 152 V42 Q8 30 20 30 H95 Q103 30 107 24 L113 15 Q118 8 126 8 H174 Q186 8 186 20 V152 Z',
    long:  'M14 152 V20 Q14 8 26 8 H122 Q130 8 135 15 L141 24 Q145 30 153 30 H180 Q192 30 192 42 V152 Z',
  };
  const FRONT = { x: 6, y: 44, w: 188, h: 114, r: 12 };


  OS.ui = {

    // folder(art, tab) -> <span class="folder">. tab: 'left' | 'right' | 'long'
    folder(art, tab) {
      const span = document.createElement('span');
      span.className = 'folder';
      // готовая папка-картинка (PNG с прозрачным фоном) показывается целиком
      if (art.includes('/folders/')) {
        span.classList.add('whole');
        const img = document.createElement('img');
        img.src = art; img.alt = ''; img.decoding = 'async'; img.draggable = false;
        span.append(img);
        return span;
      }
      const id = 'f' + (++n);
      span.innerHTML =
        '<svg viewBox="0 0 200 170" aria-hidden="true" focusable="false">' +
          '<defs>' +
            '<clipPath id="b' + id + '"><path d="' + (BACKS[tab] || BACKS.left) + '"/></clipPath>' +
            '<clipPath id="r' + id + '"><rect x="' + FRONT.x + '" y="' + FRONT.y + '" width="' + FRONT.w + '" height="' + FRONT.h + '" rx="' + FRONT.r + '"/></clipPath>' +
          '</defs>' +
          '<g clip-path="url(#b' + id + ')">' +
            '<image href="' + art + '" x="-30" y="-30" width="260" height="260" preserveAspectRatio="xMidYMid slice"/>' +
            '<rect x="0" y="0" width="200" height="170" fill="#151513" opacity=".34"/>' +
          '</g>' +
          '<g clip-path="url(#r' + id + ')">' +
            '<image href="' + art + '" x="' + FRONT.x + '" y="' + FRONT.y + '" width="' + FRONT.w + '" height="' + FRONT.h + '" preserveAspectRatio="xMidYMid slice"/>' +
            '<rect x="' + FRONT.x + '" y="' + FRONT.y + '" width="' + FRONT.w + '" height="2" fill="#fff" opacity=".4"/>' +
          '</g>' +
        '</svg>';
      return span;
    },
  };
})();
