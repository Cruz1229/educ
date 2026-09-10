import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Info,
  Layers,
  Monitor,
  RefreshCw,
  Tag,
  Trophy,
  Type,
} from 'lucide-react';
import {
  buildGamePackageNotice,
  createGameDownloadArchive,
  downloadGameArchive,
  formatGamePlatformList,
  normalizeGamePlatforms,
} from '../../utils/gameDownloadPackaging';
import { MAGIX_PREVIEW_STYLES } from './Magix.styles';
import { generateMagixHtml } from './Magix.export';

export const MAGIX_NATIVE_TEMPLATE_URLS = Object.freeze({
  android: '/templates/magix_android.zip',
  ios: '/templates/magix_ios.zip',
});

export const MAGIX_LEVELS = Object.freeze({
  basic: {
    name: 'Básico',
    configValue: 'basico',
    target: 9,
    seconds: 60,
    points: 15,
    numbers: [1, 2, 3, 4, 5, 6],
  },
  advanced: {
    name: 'Avanzado',
    configValue: 'avanzado',
    target: 30,
    seconds: 25,
    points: 25,
    numbers: [4, 7, 9, 12, 14, 17],
  },
});

const SLOT_NAMES = [
  'vértice superior',
  'lado izquierdo',
  'vértice inferior izquierdo',
  'base',
  'vértice inferior derecho',
  'lado derecho',
];

const SIDES = [
  { name: 'Izquierdo', indexes: [0, 1, 2] },
  { name: 'Base', indexes: [2, 3, 4] },
  { name: 'Derecho', indexes: [0, 5, 4] },
];

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

function normalizeFileName(value) {
  return String(value || 'magix')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function buildMagixApplicationId() {
  const rawUuid = window.crypto?.randomUUID?.()
    || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  return `io.magix.steam.uuid_${rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase()}`;
}

export function generateMagixCode(config) {
  const level = MAGIX_LEVELS[config.nivel === 'avanzado' ? 'advanced' : 'basic'];
  return generateMagixHtml(config, level, SLOT_NAMES, SIDES);
}

function TriangleBoard({ placed, selectedNumber, onSlotClick }) {
  const totals = SIDES.map(({ indexes }) =>
    indexes.reduce((total, index) => total + (placed[index] ?? 0), 0),
  );
  return (
    <div className="magix-triangle-wrap">
      <svg aria-hidden="true" className="magix-triangle-lines" viewBox="0 0 520 390">
        <path d="M260 35 62 348h396L260 35Z" />
      </svg>
      {placed.map((number, index) => (
        <button
          aria-label={number == null ? `Posición vacía: ${SLOT_NAMES[index]}` : `${SLOT_NAMES[index]}: ${number}`}
          className={`magix-slot magix-slot--${index} ${number == null ? 'is-empty' : 'is-filled'}`}
          key={SLOT_NAMES[index]}
          onClick={() => onSlotClick(index)}
          type="button"
        >
          {number ?? <span>{selectedNumber == null ? '+' : '↓'}</span>}
        </button>
      ))}
      {SIDES.map((side, index) => (
        <div className={`magix-side-total magix-side-total--${index}`} key={side.name}>
          <span>{side.name}</span><strong>{totals[index]}</strong>
        </div>
      ))}
    </div>
  );
}

function MagixGenerator() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state || {};
  const selectedPlatforms = normalizeGamePlatforms(stateData.selectedPlatforms);
  const gameDetails = stateData.gameDetails || {};
  const selectedAreas = stateData.selectedAreas || ['math'];
  const selectedSkills = stateData.selectedSkills || [];
  const [view, setView] = useState('setup');
  const [levelKey, setLevelKey] = useState('basic');
  const [placed, setPlaced] = useState(Array(6).fill(null));
  const [numberOrder, setNumberOrder] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [timeLeft, setTimeLeft] = useState(MAGIX_LEVELS.basic.seconds);
  const [status, setStatus] = useState('idle');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const level = MAGIX_LEVELS[levelKey];

  const availableNumbers = useMemo(
    () => numberOrder.filter((number) => !placed.includes(number)),
    [numberOrder, placed],
  );
  const totals = useMemo(
    () => SIDES.map(({ indexes }) => indexes.reduce((sum, index) => sum + (placed[index] ?? 0), 0)),
    [placed],
  );

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setStatus('lost');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  function startGame() {
    setPlaced(Array(6).fill(null));
    setNumberOrder(shuffle(level.numbers));
    setSelectedNumber(null);
    setTimeLeft(level.seconds);
    setScore(0);
    setMessage('Selecciona un número y luego una posición.');
    setStatus('playing');
    setView('play');
  }

  function moveToSlot(index) {
    if (status !== 'playing') return;
    if (selectedNumber != null) {
      setPlaced((current) => {
        const next = [...current];
        const previous = next.indexOf(selectedNumber);
        if (previous >= 0) next[previous] = null;
        next[index] = selectedNumber;
        return next;
      });
      setSelectedNumber(null);
      setMessage('');
      return;
    }
    if (placed[index] != null) {
      setPlaced((current) => current.map((number, slot) => slot === index ? null : number));
    } else {
      setMessage('Primero selecciona un número disponible.');
    }
  }

  function checkSolution() {
    if (placed.some((number) => number == null)) {
      setMessage('Completa las seis posiciones antes de comprobar.');
      return;
    }
    if (totals.every((total) => total === level.target) && new Set(placed).size === 6) {
      setScore(level.points);
      setStatus('won');
    } else {
      setMessage('Aún no coincide. Revisa las sumas de los tres lados.');
    }
  }

  function goToSummary() {
    setView('summary');
    setStatus('idle');
    navigate('/settings?view=Summary', {
      replace: true,
      state: { ...location.state, setupStep: 'summary' },
    });
  }

  function goToSetup() {
    setView('setup');
    setStatus('idle');
    navigate('/settings', {
      replace: true,
      state: { ...location.state, setupStep: 'game' },
    });
  }

  const config = {
    nombreApp: gameDetails.gameName || 'Magix',
    nivel: level.configValue,
    autor: gameDetails.authorName || '',
    version: gameDetails.version || '1.0.0',
    fecha: gameDetails.date || new Date().toISOString(),
    descripcion: gameDetails.description || 'Juego de Magix: el triángulo mágico.',
    plataformas: selectedPlatforms,
  };

  async function handleDownload() {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(10);
    setStatusText('Preparando configuración...');
    try {
      const baseName = normalizeFileName(config.nombreApp);
      const content = await createGameDownloadArchive({
        folderName: 'Magix',
        baseFileName: baseName,
        htmlContent: generateMagixCode(config),
        configFileName: 'magix-config.json',
        config,
        selectedPlatforms,
        nativeTemplates: {
          android: { url: MAGIX_NATIVE_TEMPLATE_URLS.android, replaceIndex: false },
          ios: { url: MAGIX_NATIVE_TEMPLATE_URLS.ios, replaceIndex: false },
        },
        nativeMetadata: { appId: buildMagixApplicationId(), appName: config.nombreApp },
        onStatus: (nextStatus) => {
          setStatusText(nextStatus);
          setProgress((current) => Math.min(90, current + 18));
        },
      });
      downloadGameArchive(content, `${baseName}_${selectedPlatforms.join('_')}.zip`);
      setProgress(100);
      setStatusText('¡Descarga iniciada!');
      window.setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
    } catch (error) {
      console.error('Error generando el paquete de Magix:', error);
      setStatusText(error?.message || 'Error al generar el paquete.');
      setIsGenerating(false);
    }
  }

  if (view === 'summary') {
    return (
      <main className="magix-generator-shell">
        <section className="magix-generator-card magix-summary">
          <h2><CheckCircle size={32} /> ¡Configuración exitosa!</h2>
          <p>Revisa los detalles y descarga el juego.</p>
          <div className="magix-summary-grid">
            <div><Tag /><span>Nombre del juego</span><strong>{config.nombreApp}</strong></div>
            <div><Type /><span>Autor</span><strong>{config.autor || 'No especificado'}</strong></div>
            <div><Layers /><span>Versión</span><strong>{config.version}</strong></div>
            <div><Calendar /><span>Fecha</span><strong>{String(config.fecha).slice(0, 10)}</strong></div>
            <div><Monitor /><span>Plataformas</span><strong>{formatGamePlatformList(selectedPlatforms)}</strong></div>
            <div><FileText /><span>Descripción</span><strong>{config.descripcion}</strong></div>
          </div>
          <div className="magix-summary-parameters">
            <strong>Nivel: {level.name}</strong>
            <strong>Suma objetivo: {level.target}</strong>
            <strong>Tiempo: {level.seconds} segundos</strong>
          </div>
          <p className="magix-package-notice">📦 {buildGamePackageNotice(selectedPlatforms)}</p>
          <div className="magix-platform-badges">
            {selectedPlatforms.map((platform) => <span key={platform}>{platform === 'ios' ? 'iOS' : platform.charAt(0).toUpperCase() + platform.slice(1)}</span>)}
          </div>
          {isGenerating && <div className="magix-download-progress"><span>{statusText}</span><progress max="100" value={progress} /></div>}
          <div className="magix-summary-actions">
            <button className="magix-button magix-button--ghost" disabled={isGenerating} onClick={goToSetup} type="button"><ArrowLeft /> Volver a editar</button>
            <button className="magix-button magix-button--primary" disabled={isGenerating} onClick={handleDownload} type="button"><Download /> {isGenerating ? 'Generando...' : 'Generar (.zip)'}</button>
          </div>
          <small className="magix-scope-note">Área: Matemáticas · {selectedAreas.length} área(s) · {selectedSkills.length} habilidad(es)</small>
        </section>
      </main>
    );
  }

  if (view === 'setup') {
    return (
      <main className="magix-generator-shell">
        <section className="magix-generator-card magix-setup">
          <h1>{'Juego de Magix'.split('').map((char, index) => <span key={`${char}-${index}`} style={{ animationDelay: `${index * 0.05}s` }}>{char === ' ' ? '\u00a0' : char}</span>)}</h1>
          <img alt="Magix" className="magix-game-logo" src={stateData.selectedGame?.icon || '/images/juegos/magix.svg'} />
          <span className="magix-category">Matemáticas</span>
          <div className="magix-rules-banner"><Info /><div><strong>Magix: el triángulo mágico</strong><p>Coloca seis números sin repetirlos para que los tres lados del triángulo alcancen la misma suma.</p></div></div>
          <label htmlFor="magix-difficulty">Selecciona el nivel de dificultad:</label>
          <select id="magix-difficulty" onChange={(event) => setLevelKey(event.target.value)} value={levelKey}>
            {Object.entries(MAGIX_LEVELS).map(([key, option]) => <option key={key} value={key}>{option.name} — suma {option.target}</option>)}
          </select>
          <div className="magix-summary-actions">
            <button className="magix-button magix-button--ghost" onClick={() => navigate(-1)} type="button"><ArrowLeft /> Anterior</button>
            <button className="magix-button magix-button--primary" onClick={startGame} type="button">Comenzar vista previa</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="magix-shell">
      <section className="magix-card">
        <header className="magix-game-intro">
          <h1>Juego de Magix</h1>
          <p>Haz que cada lado sume <strong>{level.target}</strong></p>
        </header>
        <div className="magix-layout">
          <section className="magix-stage">
            <TriangleBoard onSlotClick={moveToSlot} placed={placed} selectedNumber={selectedNumber} />
            <div aria-live="polite" className={`magix-message ${message ? 'is-visible' : ''}`}>{message}</div>
            <div className="magix-number-bank">
              <div className="magix-number-bank__heading"><span>Números disponibles</span><small>Sin repetir</small></div>
              <div className="magix-number-bank__items">
                {availableNumbers.map((number) => (
                  <button aria-pressed={selectedNumber === number} className={`magix-number ${selectedNumber === number ? 'is-selected' : ''}`} key={number} onClick={() => setSelectedNumber((current) => current === number ? null : number)} type="button">{number}</button>
                ))}
              </div>
            </div>
          </section>
          <aside className="magix-sidebar">
            <section className="magix-progress-panel">
              <div className="magix-progress-panel__heading"><Trophy /><h2>Progreso</h2></div>
              <dl className="magix-progress-stats">
                <div><dt>Dificultad</dt><dd>{level.name}</dd></div>
                <div><dt>Tiempo</dt><dd>{formatTime(timeLeft)}</dd></div>
                <div><dt>Puntaje</dt><dd>{score}</dd></div>
                {SIDES.map((side, index) => <div key={side.name}><dt>{side.name}</dt><dd>{totals[index]} / {level.target}</dd></div>)}
              </dl>
              <div className="magix-actions magix-actions--sidebar">
                <button className="magix-button magix-button--primary" onClick={checkSolution} type="button"><Check /> Comprobar</button>
                <button className="magix-button magix-button--ghost" onClick={startGame} type="button"><RefreshCw /> Reiniciar</button>
                <button className="magix-button magix-button--ghost" onClick={goToSummary} type="button">Terminar configuración</button>
              </div>
            </section>
          </aside>
        </div>
      </section>
      {(status === 'won' || status === 'lost') && (
        <div className="magix-modal-backdrop">
          <section className={`magix-modal magix-modal--${status === 'won' ? 'success' : 'timeout'}`}>
            {status === 'won' ? <Trophy size={44} /> : <Clock size={44} />}
            <h2>{status === 'won' ? '¡Triángulo resuelto!' : 'Tiempo agotado'}</h2>
            <p>{status === 'won' ? `Ganaste ${level.points} puntos.` : 'Puedes intentarlo nuevamente.'}</p>
            <div className="magix-modal__actions">
              <button className="magix-button magix-button--primary" onClick={startGame} type="button">Jugar de nuevo</button>
              <button className="magix-button magix-button--ghost" onClick={goToSummary} type="button">Terminar configuración</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default function Magix() {
  return <><style>{MAGIX_PREVIEW_STYLES}</style><MagixGenerator /></>;
}
