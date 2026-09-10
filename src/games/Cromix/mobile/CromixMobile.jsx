import { useEffect, useMemo, useState } from 'react';
import './CromixMobile.css';

const COLORS = [
  ['Amarillo', '#ffd800', '#172033'], ['Anaranjado', '#ff9900', '#172033'],
  ['Naranja', '#ff6600', '#fff'], ['Café', '#8b4513', '#fff'],
  ['Rojo', '#ef233c', '#fff'], ['Magenta', '#e6007e', '#fff'],
  ['Morado', '#7900b5', '#fff'], ['Negro', '#111', '#fff'],
  ['Azul', '#2457ff', '#fff'], ['Gris', '#718096', '#fff'],
  ['Verde', '#00a83b', '#fff'], ['Lila', '#c8a2c8', '#172033'],
];

const QUESTIONS = {
  'Básico': [
    ['¿Cuáles son los colores primarios?', ['Amarillo', 'Rojo', 'Azul']],
    ['¿Qué colores forman el verde?', ['Amarillo', 'Azul']],
    ['¿Qué colores forman el morado?', ['Rojo', 'Azul']],
    ['¿Qué colores forman el naranja?', ['Rojo', 'Amarillo']],
  ],
  'Intermedio': [
    ['¿Qué colores forman el anaranjado?', ['Amarillo', 'Naranja']],
    ['¿Qué colores forman el magenta?', ['Rojo', 'Morado']],
    ['¿Cuál es el contraste del rojo?', ['Verde']],
    ['¿Cuál es el contraste del amarillo?', ['Morado']],
    ['¿Cuál es el contraste del azul?', ['Naranja']],
  ],
  'Avanzado': [
    ['¿Qué color se asocia con la alegría?', ['Amarillo']],
    ['¿Qué color se asocia con el miedo?', ['Lila']],
    ['¿Qué color se asocia con el asco?', ['Verde']],
    ['¿Qué color se asocia con el enojo?', ['Rojo']],
    ['¿Qué color se asocia con la tristeza?', ['Azul']],
    ['¿Qué color se asocia con la ansiedad?', ['Naranja']],
  ],
};

const LEVEL_TIME = { 'Básico': 180, 'Intermedio': 240, 'Avanzado': 300 };
const DEFAULT_CONFIG = {
  nombreApp: 'Cromix', nivel: 'Básico', autor: 'STEAM-G', version: '1.0.0',
  fecha: '', descripcion: 'Rueda cromática interactiva basada en el modelo de Newton.',
  plataformas: ['android'],
};

function normalizeLevel(value) {
  const normalized = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalized === 'avanzado' || normalized === 'advanced') return 'Avanzado';
  if (normalized === 'intermedio' || normalized === 'intermediate') return 'Intermedio';
  return 'Básico';
}

function formatTime(total) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export default function CromixMobile() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [phase, setPhase] = useState('start');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(LEVEL_TIME['Básico']);
  const [message, setMessage] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const level = normalizeLevel(config.nivel);
  const questions = QUESTIONS[level];
  const question = questions[index];

  useEffect(() => {
    fetch('./config/cromix-config.json')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('config')))
      .then((loaded) => setConfig({ ...DEFAULT_CONFIG, ...loaded }))
      .catch(() => setConfig(DEFAULT_CONFIG));
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const timer = window.setInterval(() => setTime((current) => {
      if (current <= 1) {
        window.clearInterval(timer);
        setPhase('result');
        setMessage('Tiempo agotado.');
        return 0;
      }
      return current - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [phase, index]);

  const maxSelected = question?.[1].length || 1;
  const mixedColor = useMemo(() => {
    if (!selected.length) return '#e2e8f0';
    const values = selected.map((name) => COLORS.find(([color]) => color === name)?.[1]).filter(Boolean);
    const totals = values.reduce((rgb, hex) => {
      const value = Number.parseInt(hex.slice(1), 16);
      return [rgb[0] + (value >> 16), rgb[1] + ((value >> 8) & 255), rgb[2] + (value & 255)];
    }, [0, 0, 0]);
    return `rgb(${totals.map((value) => Math.round(value / values.length)).join(',')})`;
  }, [selected]);

  function start() {
    setIndex(0); setSelected([]); setScore(0); setTime(LEVEL_TIME[level]);
    setMessage('Selecciona los colores que respondan la pregunta.'); setPhase('playing');
  }

  function toggleColor(name) {
    setSelected((current) => current.includes(name)
      ? current.filter((color) => color !== name)
      : current.length >= maxSelected ? [...current.slice(1), name] : [...current, name]);
  }

  function validate() {
    if (!selected.length) { setMessage('Selecciona al menos un color.'); return; }
    const correct = question[1].length === selected.length && question[1].every((color) => selected.includes(color));
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    setMessage(correct ? '¡Respuesta correcta!' : `Respuesta correcta: ${question[1].join(' + ')}`);
    window.setTimeout(() => {
      if (index + 1 >= questions.length) { setPhase('result'); return; }
      setIndex((current) => current + 1); setSelected([]); setTime(LEVEL_TIME[level]);
    }, 900);
  }

  return (
    <main className="cromix-mobile">
      {phase === 'start' ? (
        <section className="cromix-mobile-card cromix-mobile-start">
          <span className="cromix-mobile-mark">🎨</span>
          <h1>{config.nombreApp}</h1><p>Rueda Cromática de Newton</p>
          <span className="cromix-mobile-level">Nivel: {level}</span>
          <button className="cromix-mobile-primary" onClick={start}>Iniciar juego</button>
          <button className="cromix-mobile-secondary" onClick={() => setShowInfo(true)}>Información</button>
        </section>
      ) : phase === 'playing' ? (
        <section className="cromix-mobile-card">
          <header><div><strong>{config.nombreApp}</strong><span>Rueda Cromática</span></div><button onClick={() => setShowInfo(true)}>ⓘ</button></header>
          <div className="cromix-mobile-stats"><span>Ejercicio {index + 1}/{questions.length}</span><span>⏱ {formatTime(time)}</span><span>⭐ {score}</span></div>
          <section className="cromix-mobile-question"><span>🎨</span><h2>{question[0]}</h2><p>Selecciona {maxSelected} color{maxSelected === 1 ? '' : 'es'}.</p></section>
          <div className="cromix-mobile-layout">
            <div className="cromix-mobile-wheel">
              {COLORS.map(([name, hex, text]) => <button aria-pressed={selected.includes(name)} key={name} onClick={() => toggleColor(name)} style={{ background: hex, color: text }}>{name}{selected.includes(name) && <b>✓</b>}</button>)}
              <span style={{ background: mixedColor }}>{selected.length ? selected.join(' + ') : 'Elige'}</span>
            </div>
            <aside><h3>Tu selección</h3>{selected.length ? selected.map((name) => <span key={name}>{name}</span>) : <p>Aún no hay colores.</p>}<button className="cromix-mobile-primary" onClick={validate}>Validar solución</button><button className="cromix-mobile-secondary" onClick={() => setPhase('result')}>Finalizar</button></aside>
          </div>
          <p aria-live="polite" className="cromix-mobile-message">{message}</p>
        </section>
      ) : (
        <section className="cromix-mobile-card cromix-mobile-result"><span>🏆</span><h1>Juego finalizado</h1><p>Obtuviste <strong>{score} de {questions.length}</strong> puntos.</p><button className="cromix-mobile-primary" onClick={start}>Jugar de nuevo</button><button className="cromix-mobile-secondary" onClick={() => setPhase('start')}>Volver al inicio</button></section>
      )}
      {showInfo && <div className="cromix-mobile-modal"><section><h2>{config.nombreApp}</h2><dl><div><dt>Autor</dt><dd>{config.autor || 'No especificado'}</dd></div><div><dt>Versión</dt><dd>{config.version}</dd></div><div><dt>Nivel</dt><dd>{level}</dd></div><div><dt>Descripción</dt><dd>{config.descripcion}</dd></div></dl><button className="cromix-mobile-primary" onClick={() => setShowInfo(false)}>Cerrar</button></section></div>}
    </main>
  );
}
