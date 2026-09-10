import { MAGIX_PREVIEW_STYLES } from './Magix.styles';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const icon = (content) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
const trophy = icon('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>');
const check = icon('<path d="m20 6-11 11-5-5"/>');
const restart = icon('<path d="M3 12a9 9 0 0 1 15.36-6.36L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.36 6.36L3 16M8 16H3v5"/>');
const resultTrophy = trophy.replace('width="24" height="24"', 'width="44" height="44"');
const resultClock = icon('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>').replace('width="24" height="24"', 'width="44" height="44"');

export function generateMagixHtml(config, level, slotNames, sides) {
  const title = escapeHtml(config.nombreApp || 'Magix');
  const levelData = JSON.stringify(level).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; line-height: 1.6; }
    ${MAGIX_PREVIEW_STYLES}
    .hidden { display: none !important; }
    .magix-countdown { font-size: 6rem; color: #fff; }
    .magix-export-info { display: grid; gap: 12px; text-align: left; }
    .magix-export-info dt { color: var(--muted); font-size: .84rem; }
    .magix-export-info dd { overflow-wrap: anywhere; }
  </style>
</head>
<body class="magix-shell">
  <main id="start" class="magix-card magix-setup">
    <h1 id="start-title">${[...(config.nombreApp || 'Magix')].map((char, i) => `<span style="animation-delay:${i * .05}s">${char === ' ' ? '&nbsp;' : escapeHtml(char)}</span>`).join('')}</h1>
    <span class="magix-category">Matemáticas</span>
    <div class="magix-rules-banner"><div><strong>Magix: el triángulo mágico</strong><p>Coloca seis números sin repetirlos para que los tres lados del triángulo alcancen la misma suma.</p></div></div>
    <p>Nivel: <strong>${level.name}</strong> · Suma: <strong>${level.target}</strong></p>
    <div class="magix-actions"><button id="play" class="magix-button magix-button--primary">Iniciar juego</button><button id="show-info" class="magix-button magix-button--ghost">Información</button></div>
  </main>
  <main id="game" class="magix-card hidden">
    <header class="magix-game-intro"><h1>Juego de ${title}</h1><p>Haz que cada lado sume <strong id="target">${level.target}</strong></p></header>
    <div class="magix-layout">
      <section class="magix-stage">
        <div class="magix-triangle-wrap">
          <svg aria-hidden="true" class="magix-triangle-lines" viewBox="0 0 520 390"><path d="M260 35 62 348h396L260 35Z" /></svg>
          <div id="slots"></div>
          ${sides.map((side, i) => `<div class="magix-side-total magix-side-total--${i}"><span>${side.name}</span><strong id="total-${i}">0</strong></div>`).join('')}
        </div>
        <div id="message" aria-live="polite" class="magix-message is-visible"></div>
        <div class="magix-number-bank"><div class="magix-number-bank__heading"><span>Números disponibles</span><small>Sin repetir</small></div><div id="bank" class="magix-number-bank__items"></div></div>
      </section>
      <aside class="magix-sidebar"><section class="magix-progress-panel">
        <div class="magix-progress-panel__heading">${trophy}<h2>Progreso</h2></div>
        <dl class="magix-progress-stats"><div><dt>Dificultad</dt><dd>${level.name}</dd></div><div><dt>Tiempo</dt><dd id="time"></dd></div><div><dt>Puntaje</dt><dd id="score">0</dd></div>${sides.map((side, i) => `<div><dt>${side.name}</dt><dd id="side-${i}"></dd></div>`).join('')}</dl>
        <div class="magix-actions magix-actions--sidebar"><button id="check" class="magix-button magix-button--primary">${check} Comprobar</button><button id="restart" class="magix-button magix-button--ghost">${restart} Reiniciar</button></div>
      </section></aside>
    </div>
  </main>
  <div id="info" class="magix-modal-backdrop hidden"><section class="magix-modal magix-modal--info" role="dialog" aria-modal="true" aria-labelledby="info-title"><h2 id="info-title">${title}</h2><dl class="magix-export-info">${[
    ['Autor', config.autor || 'No especificado'], ['Nivel', level.name], ['Versión', config.version || '1.0.0'],
    ['Plataformas', (config.plataformas || ['web']).join(', ')], ['Descripción', config.descripcion || 'El triángulo mágico.'],
  ].map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl><div class="magix-modal__actions"><button id="close-info" class="magix-button magix-button--primary">Cerrar</button></div></section></div>
  <div id="countdown" class="magix-modal-backdrop hidden"><strong class="magix-countdown">5</strong></div>
  <div id="result" class="magix-modal-backdrop hidden"><section id="result-card" class="magix-modal" role="dialog" aria-modal="true" aria-labelledby="result-title"><span id="result-icon">${trophy}</span><h2 id="result-title"></h2><p id="result-text"></p><div class="magix-modal__actions"><button id="again" class="magix-button magix-button--primary">Jugar de nuevo</button><button id="home" class="magix-button magix-button--ghost">Volver al inicio</button></div></section></div>
  <script>
    const level = ${levelData};
    const sides = ${JSON.stringify(sides.map(side => side.indexes))};
    const slotNames = ${JSON.stringify(slotNames)};
    let placed = Array(6).fill(null), order = [], selected = null, time = level.seconds, timer = null;
    const $ = id => document.getElementById(id);
    const formatTime = value => String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');
    const shuffle = values => { const result = [...values]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; };
    function draw() {
      $('slots').innerHTML = '';
      placed.forEach((number, index) => {
        const button = document.createElement('button');
        button.className = 'magix-slot magix-slot--' + index + (number == null ? ' is-empty' : ' is-filled');
        button.textContent = number == null ? (selected == null ? '+' : '↓') : number;
        button.setAttribute('aria-label', number == null ? 'Posición vacía: ' + slotNames[index] : slotNames[index] + ': ' + number);
        button.onclick = () => {
          if (selected != null) { const previous = placed.indexOf(selected); if (previous >= 0) placed[previous] = null; placed[index] = selected; selected = null; }
          else if (placed[index] != null) placed[index] = null;
          draw();
        };
        $('slots').appendChild(button);
      });
      $('bank').innerHTML = '';
      order.filter(number => !placed.includes(number)).forEach(number => {
        const button = document.createElement('button');
        button.className = 'magix-number' + (selected === number ? ' is-selected' : '');
        button.textContent = number;
        button.setAttribute('aria-pressed', selected === number);
        button.onclick = () => { selected = selected === number ? null : number; draw(); };
        $('bank').appendChild(button);
      });
      sides.forEach((indexes, index) => { const total = indexes.reduce((sum, slot) => sum + (placed[slot] || 0), 0); $('total-' + index).textContent = total; $('side-' + index).textContent = total + ' / ' + level.target; });
    }
    function reset() {
      placed = Array(6).fill(null); order = shuffle(level.numbers); selected = null; time = level.seconds;
      $('score').textContent = '0'; $('message').textContent = 'Selecciona un número y luego una posición.'; $('time').textContent = formatTime(time);
      clearInterval(timer);
      timer = setInterval(() => { time--; $('time').textContent = formatTime(time); if (time <= 0) { clearInterval(timer); finish(false); } }, 1000);
      draw();
    }
    function finish(won) {
      $('result-card').className = 'magix-modal magix-modal--' + (won ? 'success' : 'timeout');
      $('result-icon').innerHTML = won ? ${JSON.stringify(resultTrophy).replace(/</g, '\\u003c')} : ${JSON.stringify(resultClock).replace(/</g, '\\u003c')};
      $('result-title').textContent = won ? '¡Triángulo resuelto!' : 'Tiempo agotado';
      $('result-text').textContent = won ? 'Ganaste ' + level.points + ' puntos.' : 'Puedes intentarlo nuevamente.';
      $('score').textContent = won ? level.points : 0;
      $('result').classList.remove('hidden');
    }
    function begin() {
      let count = 5; $('countdown').classList.remove('hidden'); $('countdown').querySelector('strong').textContent = count;
      const tick = setInterval(() => { count--; if (count === 0) { clearInterval(tick); $('countdown').classList.add('hidden'); $('start').classList.add('hidden'); $('game').classList.remove('hidden'); reset(); } else $('countdown').querySelector('strong').textContent = count; }, 700);
    }
    $('play').onclick = begin;
    $('show-info').onclick = () => $('info').classList.remove('hidden');
    $('close-info').onclick = () => $('info').classList.add('hidden');
    $('restart').onclick = reset;
    $('again').onclick = () => { $('result').classList.add('hidden'); reset(); };
    $('home').onclick = () => { clearInterval(timer); $('result').classList.add('hidden'); $('game').classList.add('hidden'); $('start').classList.remove('hidden'); };
    $('check').onclick = () => {
      if (placed.some(number => number == null)) { $('message').textContent = 'Completa las seis posiciones.'; return; }
      const solved = sides.every(indexes => indexes.reduce((sum, index) => sum + placed[index], 0) === level.target);
      if (solved) { clearInterval(timer); finish(true); } else $('message').textContent = 'Revisa las sumas e inténtalo de nuevo.';
    };
  </script>
</body>
</html>`;
}
