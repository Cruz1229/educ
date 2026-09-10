import { buildMissingMobileDownload } from '../../utils/missingMobileGames';
import { downloadGameArchive } from '../../utils/gameDownloadPackaging';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Timer, Trophy, ArrowLeft, ArrowRight, Tag, Layers, FileText,
  Calendar, Monitor, Play, HelpCircle, Type, X, CheckSquare, Shapes, Puzzle, RotateCcw, CheckCircle
} from 'lucide-react';

const Style = () => (
  <style>{`
    :root {
      --primary-color: #0077b6;
      --secondary-color: #1f2937;
      --light-gray-color: #f3f4f6;
      --medium-gray-color: #d1d5db;
      --dark-gray-color: #4b5563;
      --correct-color: #22c55e;
      --wrong-color: #ef4444;
      --light-text: #ffffff;
      --dark-text: #111827;
      --border-radius: 0.75rem;
      --box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    @keyframes pulseScoreGlow {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
      50% { transform: scale(1.03); box-shadow: 0 0 12px 4px rgba(59, 130, 246, 0.3); }
    }

    .memoria-container {
      background: var(--light-text);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 2rem;
      width: 100%;
      max-width: 1200px;
      margin: 20px auto;
      color: var(--dark-text);
      min-height: 85vh;
      display: flex;
      flex-direction: column;
    }

    .game-title {
      text-align: center;
      font-size: 3rem;
      font-weight: 800;
      color: var(--secondary-color);
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
    }

    .game-title span {
      display: inline-block;
      animation: wave-animation 1.8s infinite;
      position: relative;
    }

    @keyframes wave-animation {
      0%, 40%, 100% { transform: translateY(0); }
      20% { transform: translateY(-15px); }
    }

    .rules-banner {
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      border-left: 6px solid var(--primary-color);
      border-radius: 0.5rem;
      padding: 1.5rem;
      color: #0369a1;
      text-align: left;
      margin-bottom: 2rem;
    }

    .rules-banner h2 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .rules-banner p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.5;
    }

    .config-form-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 500px;
      margin: 2rem auto;
      background: #f8fafc;
      padding: 2rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--medium-gray-color);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      text-align: left;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      font-size: 1rem;
      color: var(--secondary-color);
    }

    .form-select {
      padding: 0.75rem 1rem;
      border: 2px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      font-size: 1rem;
      background: white;
      font-weight: 600;
      outline: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .form-select:focus {
      border-color: var(--primary-color);
    }

    /* --- BOTONES estilo BioFlor / Hanoi --- */
    .no-rounded-button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 700;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
      background-color: var(--light-gray-color);
      color: var(--dark-gray-color);
    }
    .no-rounded-button:hover:not(:disabled) { filter: brightness(0.95); }
    .no-rounded-button:disabled { opacity: 0.6; cursor: not-allowed; }
    .no-rounded-button.btn-primary { background-color: var(--primary-color); color: white; }
    .no-rounded-button.btn-primary:hover:not(:disabled) { background-color: #005f92; }
    .no-rounded-button.btn-success { background-color: var(--correct-color); color: white; }
    .no-rounded-button.btn-success:hover:not(:disabled) { background-color: #16a34a; }
    .no-rounded-button.btn-warning { background-color: #f59e0b; color: white; }
    .no-rounded-button.btn-warning:hover:not(:disabled) { background-color: #d97706; }

    .catalog-actions {
      display: flex;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid var(--medium-gray-color);
    }

    /* --- IMAGEN DEL JUEGO con efectos --- */
    @keyframes floatImage {
      0%, 100% { transform: translateY(0px) scale(1); }
      50%       { transform: translateY(-6px) scale(1.03); }
    }
    @keyframes glowPulse {
      0%, 100% { opacity: 0.4; box-shadow: 0 0 0 0 rgba(0,119,182,0.3); }
      50%       { opacity: 0.75; box-shadow: 0 0 24px 6px rgba(0,119,182,0.35); }
    }
    .game-preview-image {
      width: 120px;
      height: 120px;
      object-fit: contain;
      border-radius: 18px;
      background: rgba(0,119,182,0.08);
      padding: 10px;
      border: 2px solid rgba(0,119,182,0.22);
      box-shadow: 0 4px 18px rgba(0,119,182,0.18);
      animation: floatImage 3.5s ease-in-out infinite, glowPulse 3.5s ease-in-out infinite;
      display: block;
      margin: 0 auto 0.75rem;
    }
    .game-image-placeholder {
      width: 120px; height: 120px;
      border-radius: 18px;
      background: rgba(0,119,182,0.1);
      display: flex; align-items: center; justify-content: center;
      font-size: 3.5rem;
      border: 2px solid rgba(0,119,182,0.2);
      margin: 0 auto 0.75rem;
      animation: floatImage 3.5s ease-in-out infinite;
    }
    .game-info-badge {
      display: inline-block;
      background: rgba(0,86,179,0.12);
      color: #0056b3;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 3px 14px;
      border-radius: 20px;
      border: 1px solid rgba(0,119,182,0.25);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }

    /* --- GAME PANELS --- */
    .game-layout {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
      width: 100%;
      align-items: start;
    }

    .game-main-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      align-items: center;
      width: 100%;
    }

    /* --- GRIDS --- */
    .memoria-grid {
      display: grid;
      gap: 1rem;
      width: 100%;
      background: #f8fafc;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;
    }
    .memoria-grid.grid-12 {
      grid-template-columns: repeat(4, 1fr);
    }
    .memoria-grid.grid-20 {
      grid-template-columns: repeat(4, 1fr);
    }

    .word-card {
      background: white;
      border: 2px solid var(--medium-gray-color);
      border-radius: 0.5rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80px;
      font-weight: 700;
      color: var(--secondary-color);
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
      transition: all 0.2s;
      position: relative;
    }
    
    .word-card.memorizing {
      background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
      border-color: #bae6fd;
      color: #0369a1;
      transform: scale(1.02);
      box-shadow: 0 4px 6px rgba(0,119,182,0.1);
    }

    .word-card.empty-slot {
      background: #f1f5f9;
      border: 2px dashed var(--medium-gray-color);
      color: #94a3b8;
      font-weight: 500;
      cursor: default;
    }

    .word-card.filled-slot {
      background: #eff6ff;
      border-color: var(--primary-color);
      color: #1e40af;
      cursor: pointer;
    }
    .word-card.filled-slot:hover {
      background: #fef2f2;
      border-color: var(--wrong-color);
      color: var(--wrong-color);
    }

    .card-index {
      position: absolute;
      top: 5px;
      left: 8px;
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .word-pool-container {
      width: 100%;
      background: #f1f5f9;
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-top: 1.5rem;
      text-align: left;
    }

    .word-pool-title {
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--secondary-color);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .word-pool-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
    }

    .pool-word-btn {
      padding: 0.6rem 1.2rem;
      background: white;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      font-weight: 600;
      color: var(--secondary-color);
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .pool-word-btn:hover:not(:disabled) {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,119,182,0.2);
    }

    .pool-word-btn:disabled {
      background: #e2e8f0;
      color: #94a3b8;
      border-color: #cbd5e1;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* --- RIGHT COLUMN / PROGRESS --- */
    .game-right-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .stats-block {
      background: white;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      text-align: left;
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    }

    .stats-block h3 {
      margin-top: 0;
      margin-bottom: 1.25rem;
      font-size: 1.3rem;
      color: var(--secondary-color);
      border-bottom: 2px solid var(--light-gray-color);
      padding-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stats-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 1.05rem;
    }

    .stats-item span {
      color: var(--dark-gray-color);
      font-weight: 500;
    }

    .stats-item strong {
      font-weight: 700;
      color: var(--secondary-color);
    }

    .timer-warn {
      color: var(--wrong-color) !important;
      animation: pulse 1s infinite alternate;
    }

    @keyframes pulse {
      from { transform: scale(1); }
      to { transform: scale(1.05); }
    }

    .nav-footer {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--medium-gray-color);
    }

    /* --- MEMORIZE PROGRESS HEADER --- */
    .memorize-progress-bar-wrapper {
      width: 100%;
      height: 10px;
      background-color: #e2e8f0;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 1.5rem;
    }
    .memorize-progress-bar {
      height: 100%;
      background-color: var(--primary-color);
      transition: width 0.1s linear;
    }

    /* --- SUMMARY SCREEN --- */
    .summary-screen {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
      background: #ffffff;
      color: #1f2937;
    }
    .selection-title {
      text-align: center;
      color: #005f92;
      margin-bottom: 2rem;
      font-size: 2rem;
      font-weight: 700;
    }
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      margin-top: 2rem;
    }
    .summary-row {
      display: flex;
      flex-direction: row; 
      align-items: center; 
      gap: 0.5rem;
      justify-content: flex-start; 
      white-space: nowrap;
    }
    .download-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      margin-top: 3rem;
      padding: 2rem;
      background: #f8fafc;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
    }
    .btn-primary-summary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      background: #005f92;
      color: white;
      font-size: 1rem;
    }
    .btn-primary-summary:hover:not(:disabled) {
      background: #004a73;
      transform: translateY(-1px);
    }
    .btn-primary-summary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .info-card { background: white; padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem; }
    .info-card-header { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; width: 100%; }
    .info-card-value { font-size: 1.1rem; color: #334155; font-weight: 500; text-align: center; width: 100%; }
    .full-width { grid-column: 1 / -1; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @media (max-width: 900px) {
      .game-layout {
        grid-template-columns: 1fr;
      }
      .memoria-grid.grid-12, .memoria-grid.grid-20 {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    @media (max-width: 600px) {
      .info-grid { grid-template-columns: 1fr; }
      .memoria-grid.grid-12, .memoria-grid.grid-20 {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `}</style>
);

const CATEGORIES_WORDS = {
  'Nombres de personas': [
    'Sofía', 'Alejandro', 'Mateo', 'Valentina', 'Santiago',
    'Camila', 'Sebastián', 'Isabella', 'Nicolás', 'Mariana',
    'Diego', 'Lucía', 'Samuel', 'Daniela', 'Lucas',
    'Victoria', 'Benjamín', 'Gabriela', 'Joaquín', 'Martina',
    'Daniel', 'Andrea', 'Manuel', 'Elena', 'Felipe'
  ],
  'Países': [
    'México', 'España', 'Argentina', 'Colombia', 'Brasil',
    'Canadá', 'Francia', 'Italia', 'Alemania', 'Japón',
    'Chile', 'Perú', 'Portugal', 'Australia', 'Egipto',
    'Rusia', 'Grecia', 'Suiza', 'China', 'Bélgica',
    'India', 'Noruega', 'Suecia', 'Corea', 'Austria'
  ],
  'Plantas': [
    'Helecho', 'Orquídea', 'Rosa', 'Girasol', 'Cactus',
    'Margarita', 'Lirio', 'Tulipán', 'Lavanda', 'Clavel',
    'Bambú', 'Sábila', 'Hiedra', 'Violeta', 'Musgo',
    'Palmera', 'Pino', 'Menta', 'Romero', 'Albahaca',
    'Hortensia', 'Jazmín', 'Begonia', 'Crisantemo', 'Gardenia'
  ],
  'Nombre de números': [
    'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco',
    'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez',
    'Once', 'Doce', 'Trece', 'Catorce', 'Quince',
    'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve', 'Veinte',
    'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta'
  ],
  'Instrumentos musicales': [
    'Guitarra', 'Piano', 'Violín', 'Flauta', 'Batería',
    'Trompeta', 'Saxofón', 'Arpa', 'Bajo', 'Clarinete',
    'Acordeón', 'Trombón', 'Violonchelo', 'Oboe', 'Xilófono',
    'Mandolina', 'Lira', 'Pandereta', 'Gaita', 'Órgano',
    'Fagot', 'Tuba', 'Bongó', 'Triángulo', 'Maraca'
  ],
  'Personajes famosos': [
    'Einstein', 'Cervantes', 'Da Vinci', 'Shakespeare', 'Mozart',
    'Beethoven', 'Newton', 'Galileo', 'Marie Curie', 'Picasso',
    'Aristóteles', 'Platón', 'Dalí', 'Tesla', 'Darwin',
    'Steve Jobs', 'Gandhi', 'Cleopatra', 'Napoleón', 'Lincoln',
    'Edison', 'Stephen Hawking', 'Van Gogh', 'Maradona', 'Pelé'
  ],
  'Partes de computadora': [
    'Procesador', 'Memoria RAM', 'Disco Duro', 'Tarjeta Madre', 'Tarjeta de Video',
    'Fuente de Poder', 'Gabinete', 'Ventilador', 'Teclado', 'Mouse',
    'Monitor', 'Disipador', 'Memoria ROM', 'Puerto USB', 'Tarjeta de Sonido',
    'Unidad SSD', 'Pasta Térmica', 'Lector de Discos', 'Cables SATA', 'Placa de Red',
    'Memoria Caché', 'Cámara Web', 'Micrófono', 'Gabinete Gamer', 'Auriculares'
  ],
  'Tecnología': [
    'Internet', 'Algoritmo', 'Base de Datos', 'Inteligencia Artificial', 'Robótica',
    'Satélite', 'Microchip', 'Servidor', 'Smartphone', 'Computación Cuántica',
    'Blockchain', 'Ciberseguridad', 'Realidad Virtual', 'Nube', 'Programación',
    'Redes 5G', 'Sensor', 'Fibra Óptica', 'Bluetooth', 'Router',
    'Impresora 3D', 'Nanotecnología', 'Biotecnología', 'Realidad Aumentada', 'Machine Learning'
  ]
};

const DIFFICULTY_SETTINGS = {
  'Básico': {
    wordsCount: 12,
    memorizeTime: 45,
    solveTime: 300, // 5 minutos
    points: 10,
    categories: ['Nombres de personas', 'Países', 'Plantas', 'Nombre de números']
  },
  'Avanzado': {
    wordsCount: 20,
    memorizeTime: 50,
    solveTime: 600, // 10 minutos
    points: 20,
    categories: ['Instrumentos musicales', 'Personajes famosos', 'Partes de computadora', 'Tecnología']
  }
};

const normalizeFileName = (name) => {
  if (!name) return 'juego';
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const platformLabel = (p) => ({ web: 'Web', android: 'Android', ios: 'iOS' }[String(p).toLowerCase()] || p);

const generateMemoriaCode = (difficulty, category, gameDetails, selectedPlatforms, customWordsCount) => {
  const titleText = gameDetails?.gameName || 'Juego de Memoria';
  const authorName = gameDetails?.authorName || 'No especificado';
  const version = gameDetails?.version || '1.0.0';
  const rawDate = gameDetails?.date || (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
  })();
  const formattedDate = (() => {
    try {
      const normalized = rawDate.includes('T') ? rawDate : rawDate + 'T00:00:00';
      return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return 'Fecha no especificada'; }
  })();
  const platformsString = selectedPlatforms && selectedPlatforms.length > 0
    ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
    : 'Web';
  const gameDesc = gameDetails?.description || 'Pon a prueba tu memoria. Se te mostrará una lista de palabras ubicadas en posiciones numeradas para que las memorices. Luego deberás colocarlas de vuelta en el mismo orden exacto.';

  const diffVal = difficulty || 'Básico';
  const catVal = category || 'General';
  const countVal = parseInt(customWordsCount) || (diffVal === 'Básico' ? 8 : 15);

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleText}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        :root {
            --primary-color: #0077b6;
            --secondary-color: #1f2937;
            --light-gray: #f3f4f6;
            --medium-gray: #d1d5db;
            --dark-gray: #4b5563;
            --correct-color: #22c55e;
            --wrong-color: #ef4444;
            --border-radius: 0.75rem;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; display: flex; justify-content: center; min-height: 100vh; padding: 20px; color: #111827; }

        .container { background: white; padding: 2rem; border-radius: var(--border-radius);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 100%; max-width: 1024px;
            display: flex; flex-direction: column; gap: 1.5rem; min-height: 85vh; }

        /* ─── TÍTULO ANIMADO ─── */
        .game-title { text-align: center; font-size: 2.8rem; font-weight: 800; color: var(--secondary-color);
            margin-bottom: 0.5rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        @keyframes wave-animation { 0%, 40%, 100% { transform: translateY(0); } 20% { transform: translateY(-15px); } }

        /* ─── OVERLAY ─── */
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255,255,255,0.98); display: flex; flex-direction: column;
            justify-content: center; align-items: center; z-index: 50; padding: 20px; }
        .hidden { display: none !important; }

        .start-title { font-size: 2.5rem; font-weight: 800; color: var(--secondary-color); margin-bottom: 1rem; text-align: center; }
        .start-badge { background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block; font-size: 1rem; }
        .start-desc { color: var(--dark-gray); text-align: center; max-width: 560px; line-height: 1.6; margin-bottom: 2rem; font-size: 1rem; }
        
        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); color: white; border: none; border-radius: var(--border-radius); cursor: pointer; transition: transform 0.2s, background-color 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; min-width: 200px; }
        .big-btn:hover { transform: scale(1.05); background-color: #005f92; }
        .big-btn.btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }
        .big-btn.btn-info:hover { background: #e0f2fe; }

        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        /* ─── MODAL INFO ─── */
        .info-modal-content { background: white; padding: 2.5rem; border-radius: 1rem; max-width: 600px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; position: relative; }
        .info-header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .info-title { font-size: 1.8rem; color: var(--primary-color); margin: 0; font-weight: 800; }
        .info-subtitle { color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; }
        .info-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
        .info-item { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .info-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem; font-weight: 600; }
        .info-value { font-size: 1.1rem; color: #334155; font-weight: 500; }
        .info-desc { grid-column: 1 / -1; background: #fff; padding: 0; border: none; }
        .close-info-btn { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
        .close-info-btn:hover { color: var(--wrong-color); }

        /* ─── REGLAS BÁSICAS ─── */
        .rules-card { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 0.85rem 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; text-align: center; margin-bottom: 1rem; }
        .rules-card-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        .rules-card-text { font-size: 0.95rem; font-weight: 500; color: #1e40af; line-height: 1.4; }

        /* ─── TABLERO Y JUEGO ─── */
        .btn-action { display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            width: 100%; padding: 0.75rem 1.5rem; border: none; border-radius: var(--border-radius); font-size: 1rem; font-weight: 700;
            cursor: pointer; transition: all 0.2s; background-color: var(--primary-color); color: white; }
        .btn-action:hover { background-color: #005f92; }
        .btn-action.btn-secondary { background-color: var(--dark-gray); }
        .btn-action.btn-secondary:hover { background-color: #374151; }
        .btn-action:disabled { opacity: 0.6; cursor: not-allowed; }

        .game-layout { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; width: 100%; align-items: start; }
        @media (max-width: 768px) { .game-layout { grid-template-columns: 1fr; } }

        .memoria-grid { display: grid; gap: 0.75rem; width: 100%; background: #f8fafc; border: 1px solid var(--medium-gray); border-radius: var(--border-radius); padding: 1.25rem; }
        .grid-12 { grid-template-columns: repeat(4, 1fr); }
        .grid-20 { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 600px) { .grid-12, .grid-20 { grid-template-columns: repeat(2, 1fr); } }

        .word-card { background: white; border: 2px solid var(--medium-gray); border-radius: 0.5rem; padding: 0.8rem;
            display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 75px;
            font-weight: 700; color: var(--secondary-color); box-shadow: 0 2px 4px rgba(0,0,0,0.04); position: relative; transition: all 0.2s; }
        .word-card.memorizing { background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%); border-color: #bae6fd; color: #0369a1; transform: scale(1.02); }
        .word-card.empty-slot { background: #f1f5f9; border: 2px dashed var(--medium-gray); color: #94a3b8; font-weight: 500; cursor: default; }
        .word-card.filled-slot { background: #eff6ff; border-color: var(--primary-color); color: #1e40af; cursor: pointer; }
        .word-card.filled-slot:hover { background: #fef2f2; border-color: var(--wrong-color); color: var(--wrong-color); }
        .card-index { position: absolute; top: 4px; left: 6px; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

        .memorize-progress-bar-wrapper { width: 100%; height: 10px; background-color: #e2e8f0; border-radius: 5px; overflow: hidden; margin-bottom: 0.5rem; }
        .memorize-progress-bar { height: 100%; background-color: var(--primary-color); width: 100%; transition: width 0.1s linear; }

        .word-pool-container { width: 100%; background: #f1f5f9; border-radius: var(--border-radius); padding: 1.25rem; text-align: left; margin-top: 1rem; }
        .word-pool-title { font-weight: 700; margin-bottom: 0.75rem; color: var(--secondary-color); }
        .word-pool-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; justify-content: center; }
        .pool-word-btn { padding: 0.5rem 1rem; background: white; border: 1px solid var(--medium-gray); border-radius: var(--border-radius);
            font-weight: 600; color: var(--secondary-color); cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .pool-word-btn:hover:not(:disabled) { background: var(--primary-color); color: white; border-color: var(--primary-color); transform: translateY(-2px); }
        .pool-word-btn:disabled { background: #e2e8f0; color: #94a3b8; border-color: #cbd5e1; cursor: not-allowed; box-shadow: none; }

        .stats-block { background: white; border: 1px solid var(--medium-gray); border-radius: var(--border-radius); padding: 1.25rem; }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--secondary-color);
            border-bottom: 2px solid var(--light-gray); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .stats-item { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; font-size: 1rem; }
        .stats-item span { color: var(--dark-gray); font-weight: 500; }
        .stats-item strong { font-weight: 700; color: var(--primary-color); }
        .timer-warn { color: var(--wrong-color) !important; animation: pulse 1s infinite alternate; }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.05); } }

        @keyframes pulseScoreGlow {
            0% { box-shadow: 0 0 5px #3b82f6; }
            50% { box-shadow: 0 0 18px #3b82f6, 0 0 30px #bfdbfe; }
            100% { box-shadow: 0 0 5px #3b82f6; }
        }
    </style>
</head>
<body>

    <div id="start-screen" class="overlay">
        <h1 class="start-title">${titleText}</h1>
        <div class="start-badge">Nivel: ${diffVal} </div>
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <button class="big-btn" onclick="startGameSequence()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Iniciar Juego
            </button>
            <button class="big-btn btn-info" onclick="toggleInfo(true)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Información
            </button>
        </div>
    </div>

    <div id="countdown-screen" class="overlay hidden">
        <div id="countdown-display" class="countdown-number">5</div>
    </div>

    <div id="info-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">${titleText}</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma EducSteam</div>
            </div>
            <div class="info-details-grid">
                <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${authorName}</span></div>
                <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${version}</span></div>
                <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${platformsString}</span></div>
                <div class="info-item info-desc"><span class="info-label">Descripción</span><p class="info-value">${gameDesc}</p></div>
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="big-btn" style="font-size:1rem; padding:0.75rem 2rem;" onclick="toggleInfo(false)">Cerrar</button>
            </div>
        </div>
    </div>

    <div class="container" id="game-ui" style="display:none;">
        <h2 class="game-title" id="main-title" style="margin-top:0; font-size:2.5rem;"></h2>

        <div class="rules-card" id="rules-card">
            <span class="rules-card-label" id="rules-label">📋 Reglas básicas — Memorizando</span>
            <span class="rules-card-text" id="rules-text">Observa detenidamente las palabras y su orden, ya que desaparecerán.</span>
        </div>

        <div id="mem-progress-wrapper" class="memorize-progress-bar-wrapper">
            <div id="mem-progress-bar" class="memorize-progress-bar"></div>
        </div>

        <div class="game-layout">
            <div class="game-main-col">
                <div id="words-grid" class="memoria-grid"></div>
                <div id="word-pool-section" class="word-pool-container hidden">
                    <h4 class="word-pool-title">&#128397; Banco de Palabras</h4>
                    <div id="words-pool" class="word-pool-grid"></div>
                </div>
            </div>

            <div class="game-right-col">
                <div class="stats-block">
                    <h3>&#127942; Progreso</h3>
                    <div class="stats-item" style="margin-top:0.5rem;"><span>Nivel:</span><strong id="stat-level">${diffVal}</strong></div>
                    <div class="stats-item"><span>Categoría:</span><strong id="stat-category" style="font-size:0.9rem; text-align:right; max-width:140px;">${catVal}</strong></div>
                    <div class="stats-item"><span>Fase:</span><strong id="stat-phase" style="color:var(--primary-color)">Memorizando</strong></div>
                    <div class="stats-item" style="border-top:1px solid var(--medium-gray); padding-top:0.75rem; margin-top:0.75rem;">
                        <span>Tiempo:</span><strong id="timer-val">00:00</strong>
                    </div>
                    <div class="stats-item" style="border-top:1px solid var(--medium-gray); padding-top:0.75rem; margin-top:0.75rem;">
                        <span>Puntaje:</span><strong id="score-val" style="font-size:1.2rem;">0 pts</strong>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.65rem; margin-top:1.25rem;">
                        <button class="btn-action" id="btn-skip-mem" onclick="skipMemorization()">
                            &#9654; Empezar a Ordenar
                        </button>
                        <button class="btn-action hidden" id="btn-validate" onclick="validateSolution()">
                            &#10003; Validar Solución
                        </button>
                        <button class="btn-action hidden" id="btn-clear" onclick="clearPlacedWords()">
                            &#8634; Limpiar Todo
                        </button>
                        <button class="btn-action hidden" id="btn-undo" onclick="undoLastPlacedWord()">
                            &#8634; Deshacer Último
                        </button>
                        <button class="btn-action" onclick="exitGame()">
                            &#10005; Finalizar Juego
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const wordDatabase = ${JSON.stringify(CATEGORIES_WORDS)};
        const difficultySettings = ${JSON.stringify(DIFFICULTY_SETTINGS)};
        const presetDifficulty = "${diffVal}";
        const presetCategory = "${catVal}";
        const presetWordsCount = ${countVal};
        const titleText = "${titleText}";

        let originalWords = [];
        let shuffledWords = [];
        let placedWords = [];
        let gamePhase = 'memorizing';
        let timerInterval = null;
        let timeLeft = 0;
        let score = 0;
        let totalMemorizeTime = 45;

        function toggleInfo(show) {
            const el = document.getElementById('info-overlay');
            if (show) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const d = document.getElementById('countdown-display');
            d.innerText = count;
            d.style.animation = 'none';
            void d.offsetWidth;
            d.style.animation = 'popIn 0.5s ease-out';

            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    d.innerText = count;
                    d.style.animation = 'none';
                    void d.offsetWidth;
                    d.style.animation = 'popIn 0.5s ease-out';
                } else {
                    clearInterval(interval);
                    document.getElementById('countdown-screen').classList.add('hidden');
                    startGame();
                }
            }, 1000);
        }

        function initTitle() {
            const el = document.getElementById('main-title');
            const titleToDisplay = "Juego de Memoria";
            el.innerHTML = titleToDisplay.split('').map((c, i) =>
                '<span style="animation-delay:' + (i * 0.05) + 's">' + (c === ' ' ? '&nbsp;' : c) + '</span>'
            ).join('');
        }

        function formatTime(s) {
            const m = Math.floor(s / 60).toString().padStart(2, '0');
            const sec = (s % 60).toString().padStart(2, '0');
            return m + ':' + sec;
        }

        function shuffleArray(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        function startGame() {
            const wordsList = wordDatabase[presetCategory] || wordDatabase['General'] || Object.values(wordDatabase)[0];
            const sampled = shuffleArray(wordsList).slice(0, presetWordsCount);
            originalWords = [...sampled];
            shuffledWords = shuffleArray(sampled);
            placedWords = Array(presetWordsCount).fill(null);

            document.getElementById('start-screen').classList.add('hidden');
            const gameUI = document.getElementById('game-ui');
            gameUI.style.display = 'flex';
            gameUI.style.flexDirection = 'column';

            document.getElementById('stat-level').innerText = presetDifficulty;
            document.getElementById('stat-category').innerText = presetCategory;

            initTitle();
            startMemorizePhase();
        }

        function startMemorizePhase() {
            gamePhase = 'memorizing';
            const config = difficultySettings[presetDifficulty] || difficultySettings['Básico'];
            timeLeft = config.memorizeTime;
            totalMemorizeTime = config.memorizeTime;
            score = 0;

            document.getElementById('stat-phase').innerText = 'Memorizando';
            document.getElementById('stat-phase').style.color = 'var(--primary-color)';
            document.getElementById('rules-label').innerText = '📋 Reglas básicas — Memorizando';
            document.getElementById('rules-text').innerText = 'Observa detenidamente las palabras y su orden, ya que desaparecerán.';
            document.getElementById('mem-progress-wrapper').classList.remove('hidden');
            document.getElementById('word-pool-section').classList.add('hidden');
            document.getElementById('btn-skip-mem').classList.remove('hidden');
            document.getElementById('btn-validate').classList.add('hidden');
            document.getElementById('btn-clear').classList.add('hidden');
            document.getElementById('btn-undo').classList.add('hidden');

            renderBoard();
            updateStatsUI();

            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeLeft--;
                updateStatsUI();
                const pct = (timeLeft / totalMemorizeTime) * 100;
                document.getElementById('mem-progress-bar').style.width = pct + '%';
                if (timeLeft <= 0) startSolvePhase();
            }, 1000);
        }

        function skipMemorization() {
            startSolvePhase();
        }

        function startSolvePhase() {
            clearInterval(timerInterval);
            gamePhase = 'solving';
            const config = difficultySettings[presetDifficulty] || difficultySettings['Básico'];
            timeLeft = config.solveTime;

            document.getElementById('stat-phase').innerText = 'Ordenando';
            document.getElementById('stat-phase').style.color = '#e07a5f';
            document.getElementById('rules-label').innerText = '📋 Reglas básicas — Ordenando';
            document.getElementById('rules-text').innerText = 'Ahora es tu turno de colocarlas de acuerdo a la posición que recuerdas, dando clic en las palabras para ordenarlas correctamente en el tablero.';
            document.getElementById('mem-progress-wrapper').classList.add('hidden');
            document.getElementById('word-pool-section').classList.remove('hidden');
            document.getElementById('btn-skip-mem').classList.add('hidden');
            document.getElementById('btn-validate').classList.remove('hidden');
            document.getElementById('btn-clear').classList.remove('hidden');
            document.getElementById('btn-undo').classList.remove('hidden');

            renderBoard();
            renderPool();
            updateStatsUI();

            timerInterval = setInterval(() => {
                timeLeft--;
                updateStatsUI();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    handleTimeout();
                }
            }, 1000);
        }

        function renderBoard() {
            const grid = document.getElementById('words-grid');
            grid.className = 'memoria-grid ' + (presetDifficulty === 'Básico' ? 'grid-12' : 'grid-20');
            grid.innerHTML = '';

            if (gamePhase === 'memorizing') {
                originalWords.forEach((word, idx) => {
                    const card = document.createElement('div');
                    card.className = 'word-card memorizing';
                    card.innerHTML = '<span class="card-index">' + (idx + 1) + '</span>' + word;
                    grid.appendChild(card);
                });
            } else {
                placedWords.forEach((word, idx) => {
                    const card = document.createElement('div');
                    if (word === null) {
                        card.className = 'word-card empty-slot';
                        card.innerHTML = '<span class="card-index">' + (idx + 1) + '</span>Ranura ' + (idx + 1);
                    } else {
                        card.className = 'word-card filled-slot';
                        card.innerHTML = '<span class="card-index">' + (idx + 1) + '</span>' + word;
                        card.onclick = () => removePlacedWord(idx);
                    }
                    grid.appendChild(card);
                });
            }
        }

        function renderPool() {
            const pool = document.getElementById('words-pool');
            pool.innerHTML = '';
            shuffledWords.forEach(word => {
                const btn = document.createElement('button');
                btn.className = 'pool-word-btn';
                btn.innerText = word;
                btn.disabled = placedWords.includes(word);
                btn.onclick = () => placeWord(word);
                pool.appendChild(btn);
            });
        }

        function placeWord(word) {
            if (gamePhase !== 'solving') return;
            const emptyIdx = placedWords.indexOf(null);
            if (emptyIdx !== -1) {
                placedWords[emptyIdx] = word;
                renderBoard();
                renderPool();
            }
        }

        function removePlacedWord(index) {
            if (gamePhase !== 'solving') return;
            placedWords[index] = null;
            renderBoard();
            renderPool();
        }

        function clearPlacedWords() {
            placedWords = Array(originalWords.length).fill(null);
            renderBoard();
            renderPool();
        }

        function undoLastPlacedWord() {
            if (gamePhase !== 'solving') return;
            for (let i = placedWords.length - 1; i >= 0; i--) {
                if (placedWords[i] !== null) {
                    removePlacedWord(i);
                    break;
                }
            }
        }

        function updateStatsUI() {
            document.getElementById('timer-val').innerText = formatTime(timeLeft);
            const timerEl = document.getElementById('timer-val');
            if (timeLeft <= 10 && gamePhase === 'solving') timerEl.className = 'timer-warn';
            else timerEl.className = '';
            document.getElementById('score-val').innerText = score + ' pts';
        }

        function validateSolution() {
            if (gamePhase !== 'solving') return;
            if (placedWords.includes(null)) {
                Swal.fire({ title: 'Incompleto', text: 'Debes colocar todas las palabras antes de validar.', icon: 'warning', confirmButtonColor: '#0077b6' });
                return;
            }

            let isCorrect = true;
            for (let i = 0; i < originalWords.length; i++) {
                if (placedWords[i] !== originalWords[i]) {
                    isCorrect = false;
                    break;
                }
            }

            if (isCorrect) {
                clearInterval(timerInterval);
                gamePhase = 'finished';
                const config = difficultySettings[presetDifficulty] || { points: 10 };
                score = config.points;
                updateStatsUI();

                Swal.fire({
                    title: '¡Juego Completado!',
                    html: \`
                      <div class="swal-confetti">
                        <span style="font-size: 3rem;">🌟</span>
                        <span style="font-size: 3rem;">🏆</span>
                        <span style="font-size: 3rem;">🌟</span>
                      </div>
                      <p style="font-size: 1.1rem; margin-bottom: 0;">¡Felicidades! Ordenaste la secuencia de palabras correctamente.</p>
                      <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                        Puntaje Total: \${score} pts
                      </div>
                    \`,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonColor: '#0077b6',
                    cancelButtonColor: '#0077b6',
                    confirmButtonText: 'Finalizar Juego',
                    cancelButtonText: 'Volver a Jugar',
                    reverseButtons: true,
                    allowOutsideClick: false
                }).then((r) => {
                    if (r.isConfirmed) {
                        exitGameDirect();
                    } else if (r.dismiss === Swal.DismissReason.cancel) {
                        startGameSequence();
                    }
                });
            } else {
                Swal.fire({ title: 'Orden incorrecto', text: 'El orden de las palabras no es correcto, intente nuevamente.', icon: 'error', confirmButtonColor: '#0077b6' });
                clearPlacedWords();
            }
        }

        function handleTimeout() {
            clearInterval(timerInterval);
            Swal.fire({
                title: '¡Tiempo Agotado!',
                text: 'Se acabó el tiempo para resolver este nivel.',
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#4b5563',
                confirmButtonText: 'Reintentar',
                cancelButtonText: 'Finalizar Juego',
                reverseButtons: true
            }).then((r) => {
                if (r.isConfirmed) {
                    startGameSequence();
                } else {
                    exitGameDirect();
                }
            });
        }

        function exitGame() {
            Swal.fire({
                title: '¿Deseas finalizar el juego?',
                text: 'Tu puntaje actual es de ' + score + ' puntos.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#4b5563',
                confirmButtonText: 'Sí, finalizar',
                cancelButtonText: 'Seguir Jugando',
                reverseButtons: true
            }).then((r) => {
                if (r.isConfirmed) {
                    exitGameDirect();
                }
            });
        }

        function exitGameDirect() {
            clearInterval(timerInterval);
            window.close();
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
        }
    </script>
</body>
</html>`;
};

const Memoria = () => {

  const [view, setView] = useState('home');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [customWordsCount, setCustomWordsCount] = useState('');

  // Game states
  const [originalWords, setOriginalWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [placedWords, setPlacedWords] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gamePhase, setGamePhase] = useState('memorizing'); // 'memorizing' | 'solving' | 'finished'
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);

  const timerRef = useRef(null);
  const totalMemorizeTimeRef = useRef(45);

  const navigate = useNavigate();
  const location = useLocation();

  // ZIP Download states
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Iniciando...");
  const jsZipReady = true;

  const MOCK_DATA = {
    selectedAreas: ['technology'],
    selectedSkills: ['Memoria Visual', 'Atención', 'Ordenamiento Secuencial'],
    gameDetails: {
      gameName: 'Juego de Memoria',
      authorName: 'EducSteam Developer',
      description: 'Juego de memorización en donde el usuario memoriza el orden de las palabras y luego las reconstruye.',
      version: '1.0.0',
      date: null
    },
    selectedPlatforms: ['web']
  };

  // Siempre usar la fecha actual del sistema (equipo del usuario) — igual que Acertijo.jsx
  const getFixedCreationDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
  };

  const stateData = location.state || {};
  const selectedAreas = stateData.selectedAreas || MOCK_DATA.selectedAreas;
  const selectedSkills = stateData.selectedSkills || MOCK_DATA.selectedSkills;
  const rawGameDetails = stateData.gameDetails || MOCK_DATA.gameDetails;
  const gameDetails = { ...rawGameDetails, date: getFixedCreationDate() };
  const selectedPlatforms = stateData.selectedPlatforms || MOCK_DATA.selectedPlatforms;

  const currentConfig = difficulty ? DIFFICULTY_SETTINGS[difficulty] : null;
  const isFormValid = Boolean(difficulty && category && customWordsCount);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Load JSZip dynamically


  const handleDifficultyChange = (e) => {
    const val = e.target.value;
    setDifficulty(val);
    setCategory('');
    setCustomWordsCount('');
  };

  // Sync initial view with URL search params
  useEffect(() => {
    if (location.search.includes('view=Summary') || stateData.setupStep === 'summary') {
      setView('summary');
    } else {
      setView('home');
    }
  }, [location.search, stateData.setupStep]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const shuffleArray = (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // Start memorizing
  const startGame = () => {
    const config = DIFFICULTY_SETTINGS[difficulty];
    const categoryWords = CATEGORIES_WORDS[category];

    // Choose random N words from category
    const chosen = shuffleArray(categoryWords).slice(0, customWordsCount);
    setOriginalWords(chosen);
    setShuffledWords(shuffleArray(chosen));
    setPlacedWords(Array(customWordsCount).fill(null));

    setView('play');
    setGamePhase('memorizing');
    setTimeLeft(config.memorizeTime);
    totalMemorizeTimeRef.current = config.memorizeTime;
    setScore(0);
    setIsPlaying(true);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          startSolving(chosen);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Move from memorizing to solving phase
  const startSolving = (oWords = originalWords) => {
    const config = DIFFICULTY_SETTINGS[difficulty];
    setGamePhase('solving');
    setTimeLeft(config.solveTime);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setIsPlaying(false);
    Swal.fire({
      title: '¡Tiempo Agotado!',
      text: 'Se acabó el tiempo para resolver este nivel.',
      icon: 'error',
      confirmButtonColor: '#0077b6'
    }).then(() => {
      // Re-start
      startGame();
    });
  };

  const handleWordClick = (word) => {
    if (gamePhase !== 'solving' || !isPlaying) return;

    const nextEmptyIndex = placedWords.indexOf(null);
    if (nextEmptyIndex !== -1) {
      const newPlaced = [...placedWords];
      newPlaced[nextEmptyIndex] = word;
      setPlacedWords(newPlaced);
    }
  };

  const handleSlotClick = (index) => {
    if (gamePhase !== 'solving' || !isPlaying) return;
    if (placedWords[index] === null) return;

    const newPlaced = [...placedWords];
    newPlaced[index] = null;
    setPlacedWords(newPlaced);
  };

  const handleUndo = () => {
    if (gamePhase !== 'solving' || !isPlaying) return;
    // Encontrar la última posición llena
    let lastFilledIdx = -1;
    for (let i = placedWords.length - 1; i >= 0; i--) {
      if (placedWords[i] !== null) {
        lastFilledIdx = i;
        break;
      }
    }
    if (lastFilledIdx !== -1) {
      handleSlotClick(lastFilledIdx);
    }
  };

  const handleClear = () => {
    if (gamePhase !== 'solving' || !isPlaying) return;
    setPlacedWords(Array(originalWords.length).fill(null));
  };

  const handleValidate = () => {
    if (gamePhase !== 'solving' || !isPlaying) return;

    if (placedWords.includes(null)) {
      Swal.fire({
        title: 'Incompleto',
        text: 'Debes ordenar todas las palabras en el tablero antes de validar.',
        icon: 'warning',
        confirmButtonColor: '#0077b6'
      });
      return;
    }

    let isCorrect = true;
    for (let i = 0; i < originalWords.length; i++) {
      if (placedWords[i] !== originalWords[i]) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      clearInterval(timerRef.current);
      setIsPlaying(false);
      setGamePhase('finished');
      const earnedScore = currentConfig ? currentConfig.points : 10;
      setScore(earnedScore);

      Swal.fire({
        title: '¡Juego Completado!',
        html: `
          <div style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 3rem;">🌟</span>
            <span style="font-size: 3rem;">🏆</span>
            <span style="font-size: 3rem;">🌟</span>
          </div>
          <p style="font-size: 1.1rem; margin-bottom: 0;">¡Felicidades! Ordenaste la secuencia de palabras correctamente.</p>
          <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
            Puntaje Total: ${earnedScore} pts
          </div>
        `,
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#0077b6',
        cancelButtonColor: '#0077b6',
        confirmButtonText: 'Finalizar Juego',
        cancelButtonText: 'Volver a Jugar',
        reverseButtons: true,
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          goToHome();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          startGame();
        }
      });
    } else {
      Swal.fire({
        title: 'Orden incorrecto',
        text: 'El orden de las palabras no es correcto, intente nuevamente.',
        icon: 'error',
        confirmButtonColor: '#0077b6'
      });
      // Limpiar para reintentar
      handleClear();
    }
  };

  const handleFinishGame = () => {
    Swal.fire({
      title: '¿Deseas finalizar el juego?',
      text: `Tu puntaje actual es de ${score} puntos.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0077b6',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Seguir Jugando'
    }).then((result) => {
      if (result.isConfirmed) {
        clearInterval(timerRef.current);
        setIsPlaying(false);
        goToHome();
      }
    });
  };

  const goToSummary = () => {
    setView('summary');
    navigate('/settings?view=Summary', {
      replace: true,
      state: { ...location.state, setupStep: 'summary' }
    });
  };

  const goToHome = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setView('home');
    navigate('/settings', {
      replace: true,
      state: { ...location.state, setupStep: 'game' }
    });
  };

  const normalizeFileName = (str) =>
    (str || '')
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

  const platformLabel = (p) => ({ web: 'Web', android: 'Android', ios: 'iOS' }[String(p).toLowerCase()] || p);

  const handleSmartDownload = async () => { if (isGenerating) return; setIsGenerating(true); setProgress(10); await generateAndDownloadZip(); };

  const generateAndDownloadZip = async () => {
        try {
            setStatusText('Preparando juego y configuración...');
            const result = await buildMissingMobileDownload({
                slug: 'memoria', details: gameDetails, platforms: selectedPlatforms,
                options: { nivel: difficulty, categoria: category, cantidadPalabras: customWordsCount }, htmlContent: generateMemoriaCode(difficulty, category, gameDetails, selectedPlatforms, customWordsCount), webAssets: [],
                onStatus: (status) => { setStatusText(status); setProgress(current => Math.min(90, current + 15)); }
            });
            downloadGameArchive(result.blob, result.fileName);
            setProgress(100); setStatusText('¡Descarga iniciada!');
        } catch (error) {
            console.error(error); setStatusText(error?.message || 'Error al generar el paquete.');
        } finally { setIsGenerating(false); }
    };

  const showHowToPlayModal = () => {
    Swal.fire({
      title: '¿Cómo jugar al Juego de Memoria?',
      html: `
        <div style="text-align:left;font-size:0.95rem;line-height:1.6;">
          <p><strong>Objetivo:</strong> Recordar y posicionar las palabras en el orden en que se mostraron en el tablero.</p>
          <ol>
            <li><strong>Fase de memorización:</strong> Observa detenidamente las palabras y su orden, ya que desaparecerán. Tendrás 45 segundos (Básico) o 50 segundos (Avanzado) para memorizarlas. Si ya estás listo, puedes omitir la espera pulsando "Empezar a Ordenar".</li>
            <li><strong>Fase de ordenamiento:</strong> Ahora es tu turno de colocarlas de acuerdo a la posición que recuerdas, dando clic en las palabras para ordenarlas correctamente en el tablero.</li>
            <li><strong>Correcciones:</strong> Si te equivocas, puedes hacer clic sobre la palabra en el casillero para regresarla a la lista desordenada, o usar el botón "Limpiar Todo".</li>
            <li><strong>Validar:</strong> Pulsa "Validar Solución" para corroborar el orden antes de que acabe el tiempo (5 minutos en básico y 10 minutos en avanzado).</li>
          </ol>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '¡Entendido!',
      confirmButtonColor: '#0077b6'
    });
  };

  const renderSetupScreen = () => {
    const gameIcon = location.state?.selectedGame?.icon || null;
    return (
      <div className="catalog-screen">
        <div className="game-title">
          {'Juego de Memoria'.split('').map((char, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {gameIcon ? (
            <img src={gameIcon} alt="Juego de Memoria" className="game-preview-image" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="game-image-placeholder">🧠</div>
          )}
          <span className="game-info-badge">Atención y Memoria Visual</span>
        </div>

        <div className="rules-banner">
          <h2><HelpCircle size={22} /> Reglas del Juego</h2>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Memorizando:</strong> Observa detenidamente las palabras y su orden, ya que desaparecerán.
          </p>
          <p>
            <strong>Ordenando:</strong> Ahora es tu turno de colocarlas de acuerdo a la posición que recuerdas, dando clic en las palabras para ordenarlas correctamente en el tablero.
          </p>
        </div>

        <div className="config-form-wrapper">
          <div className="form-group">
            <label>Selecciona el nivel de dificultad:</label>
            <select
              className="form-select"
              value={difficulty}
              onChange={handleDifficultyChange}
            >
              <option value="" disabled hidden>-- Selecciona el nivel de dificultad --</option>
              {Object.keys(DIFFICULTY_SETTINGS).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Selecciona la categoría de objetos:</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!difficulty}
            >
              <option value="" disabled hidden>-- Selecciona la categoría de objetos --</option>
              {difficulty && DIFFICULTY_SETTINGS[difficulty].categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Selecciona la cantidad de palabras:</label>
            <select
              className="form-select"
              value={customWordsCount}
              onChange={(e) => setCustomWordsCount(e.target.value ? parseInt(e.target.value) : '')}
              disabled={!difficulty}
            >
              <option value="" disabled hidden>-- Selecciona la cantidad de palabras --</option>
              {difficulty && (difficulty === 'Básico' ? [6, 7, 8, 9, 10, 11, 12] : [15, 16, 17, 18, 19, 20]).map(count => (
                <option key={count} value={count}>{count} palabras</option>
              ))}
            </select>
          </div>
        </div>

        <div className="catalog-actions">
          <button className="no-rounded-button btn-primary" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Anterior
          </button>
          <button
            className="no-rounded-button btn-primary"
            onClick={startGame}
            disabled={!isFormValid}
          >
            Siguiente <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderGameScreen = () => {
    return (
      <div className="game-screen" style={{ width: '100%' }}>
        <div className="game-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {'Juego de Memoria'.split('').map((char, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--dark-gray-color)', marginBottom: '1.25rem' }}>
          (Vista Previa)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto 1.5rem auto', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.85rem 1.25rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
            📋 Reglas básicas — {gamePhase === 'memorizing' ? 'Memorizando' : 'Ordenando'}
          </span>
          <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>
            {gamePhase === 'memorizing'
              ? 'Observa detenidamente las palabras y su orden, ya que desaparecerán.'
              : 'Ahora es tu turno de colocarlas de acuerdo a la posición que recuerdas, dando clic en las palabras para ordenarlas correctamente en el tablero.'
            }
          </span>
        </div>

        {gamePhase === 'memorizing' && (
          <div className="memorize-progress-bar-wrapper">
            <div
              className="memorize-progress-bar"
              style={{ width: `${(timeLeft / totalMemorizeTimeRef.current) * 100}%` }}
            ></div>
          </div>
        )}

        <div className="game-layout">
          <div className="game-main-col">
            {/* GRID DE CASILLEROS */}
            <div className={`memoria-grid ${difficulty === 'Básico' ? 'grid-12' : 'grid-20'}`}>
              {gamePhase === 'memorizing' ? (
                originalWords.map((word, idx) => (
                  <div key={idx} className="word-card memorizing">
                    <span className="card-index">{idx + 1}</span>
                    {word}
                  </div>
                ))
              ) : (
                placedWords.map((word, idx) => (
                  <div
                    key={idx}
                    className={`word-card ${word === null ? 'empty-slot' : 'filled-slot'}`}
                    onClick={() => handleSlotClick(idx)}
                  >
                    <span className="card-index">{idx + 1}</span>
                    {word === null ? `Ranura ${idx + 1}` : word}
                  </div>
                ))
              )}
            </div>

            {/* BANCO DE PALABRAS SHUFFLED */}
            {gamePhase === 'solving' && (
              <div className="word-pool-container">
                <h4 className="word-pool-title"><Puzzle size={18} color="var(--primary-color)" /> Banco de Palabras</h4>
                <div className="word-pool-grid">
                  {shuffledWords.map((word, idx) => {
                    const isPlaced = placedWords.includes(word);
                    return (
                      <button
                        key={idx}
                        className="pool-word-btn"
                        disabled={isPlaced}
                        onClick={() => handleWordClick(word)}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA LATERAL (PROGRESO) */}
          <div className="game-right-col">
            <div className="stats-block">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} /> Progreso
              </h3>
              <div className="stats-item" style={{ marginTop: '1rem' }}>
                <span>Nivel:</span> <strong style={{ color: 'var(--primary-color)' }}>{difficulty}</strong>
              </div>
              <div className="stats-item">
                <span>Categoría:</span> <strong style={{ color: 'var(--primary-color)' }}>{category}</strong>
              </div>
              <div className="stats-item">
                <span>Fase:</span> <strong style={{ color: gamePhase === 'memorizing' ? 'var(--primary-color)' : '#d97706' }}>{gamePhase === 'memorizing' ? 'Memorizando' : 'Ordenando'}</strong>
              </div>
              <div className="stats-item">
                <span>Tiempo:</span>
                <strong style={{ color: timeLeft <= 10 ? 'var(--wrong-color)' : 'var(--primary-color)', fontWeight: 'bold' }}>{formatTime(timeLeft)}</strong>
              </div>
              <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                <span>Puntaje:</span> <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{score} pts</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                {gamePhase === 'memorizing' ? (
                  <button
                    className="no-rounded-button btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      clearInterval(timerRef.current);
                      startSolving();
                    }}
                  >
                    <Play size={16} /> Empezar a Ordenar
                  </button>
                ) : (
                  <>
                    <button
                      className="no-rounded-button btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={handleValidate}
                    >
                      <CheckSquare size={16} /> Validar Solución
                    </button>
                    <button
                      className="no-rounded-button btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={handleClear}
                    >
                      <RotateCcw size={16} /> Limpiar Todo
                    </button>
                    <button
                      className="no-rounded-button btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={handleUndo}
                    >
                      <RotateCcw size={16} style={{ transform: 'scaleX(-1)' }} /> Deshacer Último
                    </button>
                  </>
                )}
                <button
                  className="no-rounded-button btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleFinishGame}
                >
                  <X size={16} /> Finalizar Juego
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="nav-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <button className="no-rounded-button btn-primary" onClick={goToHome}>
            <ArrowLeft size={16} /> Anterior
          </button>
          <button className="no-rounded-button btn-primary" onClick={goToSummary}>
            Terminar Configuración <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderSummaryScreen = () => {
    const getAreaName = (areaId) => {
      const areas = { science: 'Ciencia', technology: 'Tecnología', engineering: 'Ingeniería', arts: 'Arte', math: 'Matemáticas' };
      return areas[areaId] || areaId;
    };
    const getAreaIcon = (areaId) => {
      const icons = { science: '/images/areas/Ciencia.png', technology: '/images/areas/Tecnologia.png', engineering: '/images/areas/Ingenieria.png', arts: '/images/areas/Artes.png', math: '/images/areas/Matematicas.png' };
      return icons[areaId] || 'https://placehold.co/20x20/eee/aaa?text=?';
    };
    const formatDate = (dateString) => {
      if (!dateString) return 'No especificada';
      try {
        const normalized = dateString.includes('T') ? dateString : dateString + 'T00:00:00';
        return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch { return 'Fecha inválida'; }
    };

    return (
      <div className="summary-screen">
        <h2 style={{ color: '#0077b6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <CheckCircle size={32} color="#22c55e" /> ¡Configuración Exitosa!
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', margin: '0 0 2rem 0', fontSize: '1.1rem' }}>Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.</p>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 2rem 0', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }} />

        <h1 className="selection-title" style={{ textAlign: 'center', color: '#0077b6', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>
          Resumen de la Configuración
        </h1>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
              <div className="info-card-value">{gameDetails.gameName || 'Juego de Memoria'}</div>
            </div>
            <div className="info-card">
              <div className="info-card-header"><Type size={16} /> Nombre del Autor</div>
              <div className="info-card-value">{gameDetails.authorName || 'No especificado'}</div>
            </div>
            <div className="info-card">
              <div className="info-card-header"><Layers size={16} /> Versión</div>
              <div className="info-card-value">{gameDetails.version || '1.0.0'}</div>
            </div>
            <div className="info-card full-width">
              <div className="info-card-header"><FileText size={16} /> Descripción</div>
              <div className="info-card-value">
                {gameDetails.description || 'Juego de memorización en donde el usuario memoriza el orden de las palabras y luego las reconstruye.'}
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-header"><Calendar size={16} /> Fecha de Creación</div>
              <div className="info-card-value">{formatDate(gameDetails.date)}</div>
            </div>
            <div className="info-card">
              <div className="info-card-header"><Monitor size={16} /> Plataformas</div>
              <div className="info-card-value">
                {selectedPlatforms?.length > 0
                  ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
                  : 'No seleccionadas'}
              </div>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2.5rem 0', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <div className="info-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#0077b6' }}>
              <Shapes size={20} color="#3b82f6" /> Áreas Seleccionadas
            </h4>
            {selectedAreas?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {selectedAreas.map(areaId => (
                  <span key={areaId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#eff6ff', borderRadius: '0.5rem', fontSize: '0.95rem', color: '#1e40af' }}>
                    <img src={getAreaIcon(areaId)} alt="" style={{ width: '20px', height: '20px' }}
                      onError={(e) => { e.target.src = 'https://placehold.co/20x20/eee/aaa?text=?'; }} />
                    {getAreaName(areaId)}
                  </span>
                ))}
              </div>
            ) : <p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay áreas seleccionadas.</p>}
          </div>

          <div className="info-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#0077b6' }}>
              <Puzzle size={20} color="#8b5cf6" /> Habilidades Seleccionadas
            </h4>
            {selectedSkills?.length > 0 ? (
              <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#334155', textAlign: 'left' }}>
                {selectedSkills.map(skill => (
                  <li key={skill} style={{ marginBottom: '0.4rem' }}>{skill}</li>
                ))}
              </ul>
            ) : <p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay habilidades seleccionadas.</p>}
          </div>
        </div>

        <div className="summary-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#0077b6' }}>
            Parámetros del Juego
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', rowGap: '1rem', alignItems: 'center' }}>
            <div className="summary-row">
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Tag size={18} /> Dificultad:</span>
              <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{difficulty || 'No seleccionada'}</strong>
            </div>
            <div className="summary-row">
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Tag size={18} /> Categoría:</span>
              <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{category || 'No seleccionada'}</strong>
            </div>
            <div className="summary-row">
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Timer size={18} /> Tiempo de Memorización:</span>
              <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentConfig ? currentConfig.memorizeTime : 0} segundos</strong>
            </div>
            <div className="summary-row">
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Timer size={18} /> Tiempo Límite de Resolución:</span>
              <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentConfig ? currentConfig.solveTime / 60 : 0} minutos</strong>
            </div>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <button className="no-rounded-button btn-primary" onClick={goToHome} disabled={isGenerating}
              style={{ opacity: isGenerating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={18} /> Volver a Editar
            </button>
          </div>
        </div>

        <div className="download-section" style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
            <h3 style={{ color: '#0077b6', marginBottom: '0.5rem' }}>Descargar Paquete del Juego</h3>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>Genera el archivo .zip listo para descargar en su computadora.</p>

            <div style={{ display: 'inline-flex', gap: '0.5rem', background: '#e2e8f0', borderRadius: '2rem', padding: '4px', marginBottom: '1rem' }}>
              {selectedPlatforms?.some(p => p.toLowerCase() === 'web') && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '600', background: '#ffffff', color: '#0077b6', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  Web
                </span>
              )}
            </div>

            {isGenerating && (
              <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: '500' }}>
                  <span>{statusText}</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#0077b6', transition: 'width 0.3s ease-out', borderRadius: '7px' }} />
                </div>
              </div>
            )}
          </div>
          <button
            className="no-rounded-button btn-primary"
            onClick={handleSmartDownload}
            disabled={isGenerating || !jsZipReady}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: '0 4px 14px 0 rgba(0, 119, 182, 0.35)',
              minWidth: '240px', justifyContent: 'center',
              fontSize: '1rem', padding: '0.85rem 2rem',
              cursor: (isGenerating || !jsZipReady) ? 'wait' : 'pointer',
              opacity: (isGenerating || !jsZipReady) ? 0.8 : 1,
              fontWeight: '700', letterSpacing: '0.02em'
            }}
          >
            {!jsZipReady ? 'Cargando librería...' : isGenerating ? 'Generando...' : 'Generar (.zip)'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Style />
      <div className="memoria-container">
        {view === 'home' && renderSetupScreen()}
        {view === 'play' && renderGameScreen()}
        {view === 'summary' && renderSummaryScreen()}
      </div>
    </>
  );
};

export default Memoria;
