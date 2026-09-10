import { buildMissingMobileDownload } from '../../utils/missingMobileGames';
import { downloadGameArchive } from '../../utils/gameDownloadPackaging';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Timer, Trophy, Star, ArrowLeft, ArrowRight, Tag, Layers, FileText,
    Calendar, Monitor, Lock, Check, CheckCircle, HelpCircle, Type, Shapes, Puzzle, CheckSquare, X
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

    .fractal-container {
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

    .swal-confetti {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
      animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    @keyframes bounceIn {
      0% { transform: scale(0); opacity: 0; }
      80% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes pulseScoreGlow {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }
    @keyframes pulseGreenGlow {
      0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }

    .btn-primary {
      background-color: var(--primary-color);
      color: white;
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
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #005f92;
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
    
    .btn-success { background: #005f92; }
    .btn-success:hover:not(:disabled) { background: #004a73; }

    /* Game Board specific */
    .game-board {
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 2.5rem 2rem 2rem 2rem;
      background: #f8fafc;
      position: relative;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }
    .board-title {
      position: absolute;
      top: -15px;
      left: 20px;
      background: #f8fafc;
      padding: 0 10px;
      color: var(--primary-color);
      font-size: 1.4rem;
      font-weight: 700;
    }

    .fractal-selectors {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }
    .fractal-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border: 2px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 600;
        color: var(--secondary-color);
        min-width: 140px;
    }
    .fractal-btn.active {
        border-color: var(--primary-color);
        background-color: #e0f2fe;
    }
    .fractal-btn svg {
        fill: none;
        stroke: var(--primary-color);
        stroke-width: 4;
    }
    
    polygon.interactive-shape {
        cursor: pointer;
        transition: fill 0.2s, stroke-width 0.2s, filter 0.2s;
    }
    polygon.interactive-shape:hover {
        fill: #e0f2fe !important;
        fill-opacity: 0.9 !important;
        stroke-width: 2.5px !important;
        filter: drop-shadow(0px 2px 4px rgba(0, 119, 182, 0.25));
    }
    
    .game-info-row {
        display: flex;
        justify-content: space-around;
        font-size: 1.1rem;
        color: var(--secondary-color);
        margin-bottom: 1rem;
    }

    .game-area-box {
        border: 1px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        background: white;
        padding: 1rem;
        min-height: 450px;
        display: flex;
        flex-direction: column;
    }
    .game-area-header {
        display: flex;
        justify-content: space-between;
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--secondary-color);
        margin-bottom: 1rem;
    }
    .svg-container {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .catalog-screen {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        flex-grow: 1;
    }

    .difficulty-select-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin: 1rem 0;
    }

    .difficulty-select-wrapper label {
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--secondary-color);
    }

    .difficulty-select {
        padding: 0.75rem 1.5rem;
        border: 2px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        font-size: 1rem;
        background: white;
        font-weight: 600;
        outline: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .difficulty-select:focus {
        border-color: var(--primary-color);
    }

    .custom-select {
      padding: 0.75rem 1rem;
      border: 2px solid var(--medium-gray-color);
      border-radius: 0.5rem;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
      background: white;
      cursor: pointer;
    }
    .custom-select:focus {
      border-color: var(--primary-color);
    }

    .catalog-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: auto;
        padding-top: 1.5rem;
        border-top: 1px solid var(--medium-gray-color);
    }

    /* --- BOTONES estilo BioFlor --- */
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

    /* --- IMAGEN DEL JUEGO con efectos --- */
    @keyframes floatImage {
      0%, 100% { transform: translateY(0px) scale(1); }
      50%       { transform: translateY(-6px) scale(1.03); }
    }
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0,119,182,0.3); }
      50%       { box-shadow: 0 0 24px 6px rgba(0,119,182,0.35); }
    }
    .game-preview-image {
      width: 120px; height: 120px;
      object-fit: contain;
      border-radius: 18px;
      background: rgba(0,119,182,0.08);
      padding: 10px;
      border: 2px solid rgba(0,119,182,0.22);
      animation: floatImage 3.5s ease-in-out infinite, glowPulse 3.5s ease-in-out infinite;
      display: block;
      margin: 0 auto 0.75rem;
    }
    .game-image-placeholder {
      width: 120px; height: 120px;
      border-radius: 18px;
      background: rgba(0,119,182,0.1);
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem;
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

    /* --- GAME LAYOUT COMPATIBILIDAD CON HANOI/BIOFLOR --- */
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

    .game-right-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
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

    @media (max-width: 900px) {
      .game-layout {
        grid-template-columns: 1fr;
      }
    }

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
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .info-card { background: white; padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem; }
    .info-card-header { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; width: 100%; }
    .info-card-value { font-size: 1.1rem; color: #334155; font-weight: 500; text-align: center; width: 100%; }
    .full-width { grid-column: 1 / -1; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
    `}</style>
);

const Icons = {
    sierpinski: (
        <svg viewBox="0 0 100 100" width="30" height="30">
            <polygon points="50,10 10,90 90,90" fill="none" stroke="#0077b6" strokeWidth="6" />
            <polygon points="50,90 30,50 70,50" fill="none" stroke="#0077b6" strokeWidth="6" />
        </svg>
    ),
    koch: (
        <svg viewBox="0 0 100 100" width="30" height="30">
            <polyline points="10,70 36.6,70 50,46.9 63.3,70 90,70" fill="none" stroke="#0077b6" strokeWidth="6" />
        </svg>
    ),
    dragon: (
        <svg viewBox="0 0 100 100" width="30" height="30">
            <polyline points="20,50 50,50 50,20" fill="none" stroke="#0077b6" strokeWidth="6" strokeLinejoin="round" />
            <polyline points="50,50 50,80 80,80" fill="none" stroke="#0077b6" strokeWidth="6" strokeLinejoin="round" />
        </svg>
    )
};

const DIFFICULTY_SETTINGS = {
    Básico: { timeLimit: 300, points: 15 },
    Avanzado: { timeLimit: 600, points: 25 }
};

const H_FACTOR = Math.sqrt(3) / 2;

// Límites seguros del lienzo (viewBox 0 0 400 400) para que ningún error
// (desplazado, sobrante, etc.) termine renderizado fuera de la vista o
// exactamente encima de otra figura, lo que lo volvería "invisible" o imposible de encontrar.
const CANVAS_MIN = 15;
const CANVAS_MAX = 385;
const clamp = (value, min = CANVAS_MIN, max = CANVAS_MAX) => Math.min(max, Math.max(min, value));

const getSierpinskiInitial = () => [{ id: 'S', x: 20, y: 20, size: 360, currentDepth: 0 }];

const getKochInitial = () => {
    const x1 = 60, y1 = 280;
    const x2 = 340, y2 = 280;
    const x3 = 200, y3 = 280 - 280 * H_FACTOR;
    return [
        { id: 'K0', x1, y1, x2, y2, currentDepth: 0 },
        { id: 'K1', x1: x2, y1: y2, x2: x3, y2: y3, currentDepth: 0 },
        { id: 'K2', x1: x3, y1: y3, x2: x1, y2: y1, currentDepth: 0 }
    ];
};

const getDragonInitial = () => [
    { id: 'D', x1: 100, y1: 200, x2: 300, y2: 200, currentDepth: 0, turnRight: true }
];

const CONFIG = {
    sierpinski: { targetDepthBasico: 3, targetDepthAvanzado: 3, initialNodes: getSierpinskiInitial },
    koch: { targetDepthBasico: 2, targetDepthAvanzado: 2, initialNodes: getKochInitial },
    dragon: { targetDepthBasico: 5, targetDepthAvanzado: 4, initialNodes: getDragonInitial }
};

const getTargetLength = (type) => {
    if (type === 'sierpinski') return Math.pow(3, CONFIG.sierpinski.targetDepthAvanzado);
    if (type === 'koch') return 3 * Math.pow(4, CONFIG.koch.targetDepthAvanzado);
    if (type === 'dragon') return Math.pow(2, CONFIG.dragon.targetDepthAvanzado);
    return 1;
};

const getChildren = (type, node) => {
    const { id, currentDepth } = node;
    const newDepth = currentDepth + 1;

    if (type === 'sierpinski') {
        const { x, y, size } = node;
        const s2 = size / 2;
        const h2 = s2 * H_FACTOR;
        return [
            { id: id + '-0', x: x + s2 / 2, y, size: s2, currentDepth: newDepth },
            { id: id + '-1', x, y: y + h2, size: s2, currentDepth: newDepth },
            { id: id + '-2', x: x + s2, y: y + h2, size: s2, currentDepth: newDepth }
        ];
    }

    if (type === 'koch') {
        const { x1, y1, x2, y2 } = node;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const xA = x1 + dx / 3;
        const yA = y1 + dy / 3;
        const xC = x1 + 2 * dx / 3;
        const yC = y1 + 2 * dy / 3;
        const angle = -Math.PI / 3;
        const xB = xA + (xC - xA) * Math.cos(angle) - (yC - yA) * Math.sin(angle);
        const yB = yA + (xC - xA) * Math.sin(angle) + (yC - yA) * Math.cos(angle);

        return [
            { id: id + '-0', x1, y1, x2: xA, y2: yA, currentDepth: newDepth },
            { id: id + '-1', x1: xA, y1: yA, x2: xB, y2: yB, currentDepth: newDepth },
            { id: id + '-2', x1: xB, y1: yB, x2: xC, y2: yC, currentDepth: newDepth },
            { id: id + '-3', x1: xC, y1: yC, x2, y2, currentDepth: newDepth }
        ];
    }

    if (type === 'dragon') {
        const { x1, y1, x2, y2, turnRight } = node;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const nx = turnRight ? -dy : dy;
        const ny = turnRight ? dx : -dx;
        const xMid = x1 + dx / 2 + nx / 2;
        const yMid = y1 + dy / 2 + ny / 2;

        return [
            { id: id + '-0', x1, y1, x2: xMid, y2: yMid, currentDepth: newDepth, turnRight: true },
            { id: id + '-1', x1: xMid, y1: yMid, x2, y2, currentDepth: newDepth, turnRight: false }
        ];
    }
};

const generateFullFractal = (type, targetDepth) => {
    let nodes = CONFIG[type].initialNodes();
    for (let d = 0; d < targetDepth; d++) {
        let nextNodes = [];
        for (const n of nodes) {
            nextNodes.push(...getChildren(type, n));
        }
        nodes = nextNodes;
    }
    return nodes;
};

const generateHtmlCode = (difficulty, gameDetails, selectedPlatforms) => {
    const config = DIFFICULTY_SETTINGS[difficulty];
    const titleText = gameDetails.gameName || 'Diseño Fractal';
    const authorName = gameDetails.authorName || 'No especificado';
    const version = gameDetails.version || '1.0.0';
    const gameDesc = gameDetails.description || 'Crea y repara figuras fractalizadas mediante iteraciones matemáticas.';
    const rawDate = gameDetails?.date || new Date().toISOString();
    const formattedDate = (() => {
        try {
            const normalized = rawDate.includes('T') ? rawDate : rawDate + 'T00:00:00';
            return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Fecha no especificada'; }
    })();
    const platformsStr = selectedPlatforms && selectedPlatforms.length > 0
        ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
        : 'Web';
    const rulesText = difficulty === 'Básico'
        ? 'Repara patrones fractales matemáticos, tienes que identificar los errores en las siguientes figuras.'
        : 'Construye patrones fractales matemáticos, tienes que completar el diseño sin romper la simetría ni la secuencia del fractal.';

    const configStr = JSON.stringify(config);

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
            --correct: #22c55e;
            --wrong: #ef4444;
            --light-text: #ffffff;
            --dark-text: #111827;
            --border-radius: 0.75rem;
        }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 1050px; display: flex; flex-direction: column; }

        .game-layout { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; width: 100%; margin-top: 0.5rem; }
        @media (max-width: 800px) { .game-layout { grid-template-columns: 1fr; } }

        .diagram-column { background: white; border: 1px solid var(--medium-gray); border-radius: var(--border-radius); padding: 1.5rem; display: flex; flex-direction: column; align-items: center; width: 100%; box-sizing: border-box; }

        .fractal-selectors { display: flex; justify-content: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .fractal-btn { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border: 2px solid var(--medium-gray); border-radius: var(--border-radius); background: white; cursor: pointer; font-weight: 600; color: var(--secondary-color); min-width: 140px; transition: all 0.2s; }
        .fractal-btn.active { border-color: var(--primary-color); background-color: #e0f2fe; }
        .fractal-btn.locked { opacity: 0.5; cursor: not-allowed; }
        .fractal-btn .check-icon { color: var(--correct); }
        .fractal-btn .lock-icon { color: var(--dark-gray); }
        .game-area-box { border: 1px solid var(--medium-gray); border-radius: var(--border-radius); background: white; padding: 1rem; min-height: 420px; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
        .game-area-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 1.1rem; color: var(--secondary-color); margin-bottom: 1rem; }
        .svg-container { flex-grow: 1; display: flex; align-items: center; justify-content: center; }

        .swal-confetti { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        @keyframes bounceIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulseScoreGlow { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
        @keyframes pulseGreenGlow { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }

        .stats-column { display: flex; flex-direction: column; gap: 1.5rem; }
        .stats-block { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; height: fit-content; background: white; }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); display: flex; align-items: center; gap: 0.5rem; }
        .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }

        .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: var(--border-radius); cursor: pointer; font-weight: bold; color: white; transition: background 0.2s; }
        .btn-primary { background: var(--primary-color); }
        .btn-primary:hover { background: #005f92; }

        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; transition: opacity 0.3s; padding: 20px; box-sizing: border-box; }
        .hidden { display: none !important; opacity: 0; pointer-events: none; }

        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); color: white; border: none; border-radius: var(--border-radius); cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; min-width: 200px; }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }

        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        .game-title { text-align: center; font-size: 2.5rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 0.5rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        @keyframes wave-animation { 0%, 40%, 100% { transform: translateY(0); } 20% { transform: translateY(-15px); } }

        .rules-box { display: grid; grid-template-columns: 1fr; max-width: 600px; margin: 0 auto 1.5rem auto; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 0.85rem 1.25rem; text-align: center; }
        .rules-box .rules-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; margin-bottom: 0.25rem; display: block; }
        .rules-box .rules-text { font-size: 1rem; color: #1e40af; font-weight: 500; }

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
        .close-info-btn:hover { color: var(--wrong); }
    </style>
</head>
<body>
    <div id="start-screen" class="overlay">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; text-align: center; color: var(--secondary-color);">${titleText}</h1>
        <div style="background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">Nivel: ${difficulty}</div>
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <button class="big-btn" onclick="startGameSequence()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Iniciar Juego</button>
            <button class="big-btn btn-info" onclick="toggleInfo(true)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> Información</button>
        </div>
    </div>

    <div id="countdown-screen" class="overlay hidden"><div id="countdown-display" class="countdown-number">5</div></div>

    <div id="info-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">Juego de ${titleText}</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
            </div>
            <div class="info-details-grid">
                <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${authorName}</span></div>
                <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${version}</span></div>
                <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${platformsStr}</span></div>
                <div class="info-item info-desc"><span class="info-label">Descripción</span><p class="info-value">${gameDesc}</p></div>
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem;" onclick="toggleInfo(false)">Cerrar</button>
            </div>
        </div>
    </div>

    <div class="container" id="game-ui" style="display:none;">
        <h2 class="game-title" id="main-title"></h2>
        <div class="rules-box">
            <span class="rules-label">📋 Reglas Básicas</span>
            <span class="rules-text">${rulesText}</span>
        </div>

        <div class="game-layout">
            <div class="diagram-column">
                <div class="fractal-selectors" id="fractal-selectors"></div>
                <div class="game-area-box">
                    <div class="game-area-header">
                        <span>${difficulty === 'Básico' ? 'Encuentra los errores' : 'Construye el fractal'}</span>
                        <span id="progress-text"></span>
                    </div>
                    <div class="svg-container">
                        <svg id="fractal-svg" width="360" height="360" viewBox="0 0 400 400"></svg>
                    </div>
                </div>
            </div>
            <div class="stats-column">
                <div class="stats-block">
                    <h3><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg> Progreso</h3>
                    <div class="stats-item"><span>Modo:</span> <strong style="color: var(--primary-color)">${difficulty === 'Básico' ? 'Identificación' : 'Construcción'}</strong></div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray); padding-top: 0.75rem; margin-top: 0.75rem;">
                        <span>Tiempo:</span> <strong id="time-val" style="color: var(--primary-color); font-weight: bold;">00:00</strong>
                    </div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray); padding-top: 0.75rem; margin-top: 0.75rem;">
                        <span>${difficulty === 'Básico' ? 'Errores Encontrados:' : 'Ramas Completadas:'}</span> <strong id="found-val" style="color: var(--primary-color)">0</strong>
                    </div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray); padding-top: 0.75rem; margin-top: 0.75rem;">
                        <span>Puntaje:</span> <strong id="score-val" style="color: var(--primary-color); font-size: 1.2rem;">0 pts</strong>
                    </div>
                    <button class="btn btn-primary" onclick="validateSolution()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="m9 11 3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> Validar Solución</button>
                    <button class="btn btn-primary" onclick="handleFinishGame()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg> Finalizar Juego</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const difficulty = '${difficulty}';
        const config = ${configStr};
        const H_FACTOR = ${H_FACTOR};
        const gameTitleText = ${JSON.stringify('Juego de ' + titleText)};
        const CANVAS_MIN = 15;
        const CANVAS_MAX = 385;
        const clamp = (value, min = CANVAS_MIN, max = CANVAS_MAX) => Math.min(max, Math.max(min, value));

        const getSierpinskiInitial = () => [{ id: 'S', x: 20, y: 20, size: 360, currentDepth: 0 }];
        const getKochInitial = () => {
            const x1 = 60, y1 = 280;
            const x2 = 340, y2 = 280;
            const x3 = 200, y3 = 280 - 280 * H_FACTOR;
            return [
                { id: 'K0', x1, y1, x2, y2, currentDepth: 0 },
                { id: 'K1', x1: x2, y1: y2, x2: x3, y2: y3, currentDepth: 0 },
                { id: 'K2', x1: x3, y1: y3, x2: x1, y2: y1, currentDepth: 0 }
            ];
        };
        const getDragonInitial = () => [{ id: 'D', x1: 100, y1: 200, x2: 300, y2: 200, currentDepth: 0, turnRight: true }];

        const CONFIG = {
            sierpinski: { targetDepthBasico: 3, targetDepthAvanzado: 3, initialNodes: getSierpinskiInitial },
            koch: { targetDepthBasico: 2, targetDepthAvanzado: 2, initialNodes: getKochInitial },
            dragon: { targetDepthBasico: 5, targetDepthAvanzado: 4, initialNodes: getDragonInitial }
        };

        const FRACTAL_LABELS = { sierpinski: 'Triángulo de Sierpinski', koch: 'Copo de Koch', dragon: 'Curva de dragón' };
        const FRACTAL_ICONS = {
            sierpinski: '<svg viewBox="0 0 100 100" width="28" height="28"><polygon points="50,10 10,90 90,90" fill="none" stroke="#0077b6" stroke-width="6" /><polygon points="50,90 30,50 70,50" fill="none" stroke="#0077b6" stroke-width="6" /></svg>',
            koch: '<svg viewBox="0 0 100 100" width="28" height="28"><polyline points="10,70 36.6,70 50,46.9 63.3,70 90,70" fill="none" stroke="#0077b6" stroke-width="6" /></svg>',
            dragon: '<svg viewBox="0 0 100 100" width="28" height="28"><polyline points="20,50 50,50 50,20" fill="none" stroke="#0077b6" stroke-width="6" stroke-linejoin="round" /><polyline points="50,50 50,80 80,80" fill="none" stroke="#0077b6" stroke-width="6" stroke-linejoin="round" /></svg>'
        };

        const getTargetLength = (type) => {
            if (type === 'sierpinski') return Math.pow(3, CONFIG.sierpinski.targetDepthAvanzado);
            if (type === 'koch') return 3 * Math.pow(4, CONFIG.koch.targetDepthAvanzado);
            if (type === 'dragon') return Math.pow(2, CONFIG.dragon.targetDepthAvanzado);
            return 1;
        };

        const getChildren = (type, node) => {
            const id = node.id; const currentDepth = node.currentDepth;
            const newDepth = currentDepth + 1;

            if (type === 'sierpinski') {
                const x = node.x; const y = node.y; const size = node.size;
                const s2 = size / 2;
                const h2 = s2 * H_FACTOR;
                return [
                    { id: id + '-0', x: x + s2/2, y, size: s2, currentDepth: newDepth },
                    { id: id + '-1', x, y: y + h2, size: s2, currentDepth: newDepth },
                    { id: id + '-2', x: x + s2, y: y + h2, size: s2, currentDepth: newDepth }
                ];
            }
            if (type === 'koch') {
                const x1 = node.x1; const y1 = node.y1; const x2 = node.x2; const y2 = node.y2;
                const dx = x2 - x1; const dy = y2 - y1;
                const xA = x1 + dx / 3; const yA = y1 + dy / 3;
                const xC = x1 + 2 * dx / 3; const yC = y1 + 2 * dy / 3;
                const angle = -Math.PI / 3;
                const xB = xA + (xC - xA) * Math.cos(angle) - (yC - yA) * Math.sin(angle);
                const yB = yA + (xC - xA) * Math.sin(angle) + (yC - yA) * Math.cos(angle);
                return [
                    { id: id + '-0', x1, y1, x2: xA, y2: yA, currentDepth: newDepth },
                    { id: id + '-1', x1: xA, y1: yA, x2: xB, y2: yB, currentDepth: newDepth },
                    { id: id + '-2', x1: xB, y1: yB, x2: xC, y2: yC, currentDepth: newDepth },
                    { id: id + '-3', x1: xC, y1: yC, x2, y2, currentDepth: newDepth }
                ];
            }
            if (type === 'dragon') {
                const x1 = node.x1; const y1 = node.y1; const x2 = node.x2; const y2 = node.y2; const turnRight = node.turnRight;
                const dx = x2 - x1; const dy = y2 - y1;
                const nx = turnRight ? -dy : dy; const ny = turnRight ? dx : -dx;
                const xMid = x1 + dx/2 + nx/2; const yMid = y1 + dy/2 + ny/2;
                return [
                    { id: id + '-0', x1, y1, x2: xMid, y2: yMid, currentDepth: newDepth, turnRight: true },
                    { id: id + '-1', x1: xMid, y1: yMid, x2, y2, currentDepth: newDepth, turnRight: false }
                ];
            }
        };

        const generateFullFractal = (type, targetDepth) => {
            let nodes = CONFIG[type].initialNodes();
            for (let d = 0; d < targetDepth; d++) {
                let nextNodes = [];
                for (const n of nodes) {
                    nextNodes.push(...getChildren(type, n));
                }
                nodes = nextNodes;
            }
            return nodes;
        };

        function shuffleFractals() {
            const arr = ['sierpinski', 'koch', 'dragon'];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function pickRandomIndices(pool, count) {
            const copy = [...pool];
            const picked = [];
            while (picked.length < count && copy.length > 0) {
                const r = Math.floor(Math.random() * copy.length);
                picked.push(copy.splice(r, 1)[0]);
            }
            return picked;
        }

        let gameShapes = [];
        let errorsFound = 0;
        let totalErrors = 5;
        let isPlaying = false;
        let timeLeft = 0;
        let fractalType = 'sierpinski';
        let fractalOrder = ['sierpinski', 'koch', 'dragon'];
        let completedFractals = [];
        let score = 0;
        let timerInterval = null;

        function formatTime(seconds) {
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            return \`\${m}:\${s}\`;
        }

        function initTitle() {
            const el = document.getElementById('main-title');
            el.innerHTML = gameTitleText.split('').map((c, i) => '<span style="animation-delay:' + (i * 0.05) + 's">' + (c === ' ' ? '&nbsp;' : c) + '</span>').join('');
        }

        function exitToClosedScreen() {
            window.close();
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const d = document.getElementById('countdown-display');
            d.innerText = count;
            const interval = setInterval(() => {
                count--;
                if (count > 0) { d.innerText = count; d.style.animation = 'none'; void d.offsetWidth; d.style.animation = 'popIn 0.5s ease-out'; }
                else { clearInterval(interval); document.getElementById('countdown-screen').classList.add('hidden'); startGame(); }
            }, 1000);
        }

        function startGame() {
            document.getElementById('game-ui').style.display = 'flex';
            document.getElementById('game-ui').style.flexDirection = 'column';
            initTitle();
            fractalOrder = shuffleFractals();
            completedFractals = [];
            score = 0;
            document.getElementById('score-val').innerText = '0 pts';
            initGame(fractalOrder[0]);
        }

        function renderFractalSelectors() {
            const container = document.getElementById('fractal-selectors');
            container.innerHTML = '';
            fractalOrder.forEach((type, position) => {
                const isCompleted = completedFractals.includes(type);
                const isUnlocked = isCompleted || position === completedFractals.length;
                const btn = document.createElement('button');
                btn.className = 'fractal-btn' + (fractalType === type ? ' active' : '') + (!isUnlocked ? ' locked' : '');
                btn.disabled = !isUnlocked;
                btn.innerHTML = FRACTAL_ICONS[type] + '<span>' + FRACTAL_LABELS[type] + '</span>' +
                    (isCompleted ? '<svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '') +
                    (!isUnlocked ? '<svg class="lock-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>' : '');
                if (isUnlocked && type !== fractalType) btn.onclick = () => initGame(type);
                else btn.style.cursor = isUnlocked ? 'default' : 'not-allowed';
                container.appendChild(btn);
            });
        }

        function initGame(type) {
            fractalType = type;
            timeLeft = config.timeLimit;
            isPlaying = true;
            errorsFound = 0;

            if (difficulty === 'Básico') {
                const targetDepth = CONFIG[type].targetDepthBasico;
                const baseNodes = generateFullFractal(type, targetDepth);
                const allIndices = baseNodes.map((_, i) => i);

                const errorCounts = { missing: 2, wrongOrientation: 2, wrongSize: 2, wrongLocation: 2 };
                const numExtra = 1;

                let pool = [...allIndices];
                const assigned = {};
                Object.entries(errorCounts).forEach(([errType, count]) => {
                    const picked = pickRandomIndices(pool, count);
                    picked.forEach(i => { assigned[i] = errType; });
                    pool = pool.filter(i => !picked.includes(i));
                });

                const nodesWithErrors = baseNodes.map((n, i) => {
                    if (assigned[i]) return { ...n, isError: true, errorType: assigned[i] };
                    return { ...n, isError: false, errorType: null };
                });

                const extraShapes = [];
                for (let e = 0; e < numExtra; e++) {
                    const candidatePool = pool.length > 0 ? pool : allIndices;
                    const sourceIndex = candidatePool[Math.floor(Math.random() * candidatePool.length)];
                    const source = baseNodes[sourceIndex];
                    const jitterA = Math.random() > 0.5 ? 1 : -1;
                    const jitterB = Math.random() > 0.5 ? 1 : -1;
                    extraShapes.push({
                        ...source,
                        id: 'extra-' + e + '-' + source.id,
                        isError: true,
                        isExtra: true,
                        errorType: 'extra',
                        x: source.x !== undefined ? clamp(source.x + jitterA * 35) : undefined,
                        y: source.y !== undefined ? clamp(source.y + jitterB * 25) : undefined,
                        x1: source.x1 !== undefined ? clamp(source.x1 + jitterA * 25) : undefined,
                        y1: source.y1 !== undefined ? clamp(source.y1 + jitterB * 20) : undefined,
                        x2: source.x2 !== undefined ? clamp(source.x2 + jitterA * 25) : undefined,
                        y2: source.y2 !== undefined ? clamp(source.y2 + jitterB * 20) : undefined,
                    });
                }

                totalErrors = nodesWithErrors.filter(n => n.isError).length + extraShapes.length;
                gameShapes = [...nodesWithErrors, ...extraShapes];
            } else {
                gameShapes = CONFIG[type].initialNodes();
            }

            renderFractalSelectors();
            updateUI();
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeLeft--;
                updateUI();
                if (timeLeft <= 0) handleTimeout();
            }, 1000);
        }

        function handleShapeClick(shapeId) {
            if (!isPlaying) return;

            if (difficulty === 'Básico') {
                const shape = gameShapes.find(s => s.id === shapeId);
                if (!shape || !shape.isError) return;

                if (shape.isExtra) {
                    gameShapes = gameShapes.filter(s => s.id !== shapeId);
                } else {
                    gameShapes = gameShapes.map(s => s.id === shapeId ? { ...s, isError: false, errorType: null } : s);
                }
                errorsFound++;
                updateUI();
                if (errorsFound >= totalErrors) handleWin();
            } else {
                const node = gameShapes.find(s => s.id === shapeId);
                if (!node || node.currentDepth >= CONFIG[fractalType].targetDepthAvanzado) return;

                const newChildren = getChildren(fractalType, node);
                gameShapes = [...gameShapes.filter(n => n.id !== node.id), ...newChildren];
                updateUI();

                const allAtTarget = gameShapes.every(s => s.currentDepth === CONFIG[fractalType].targetDepthAvanzado);
                if (allAtTarget && gameShapes.length > 1) handleWin();
            }
        }

        function renderShapes() {
            const svgEl = document.getElementById('fractal-svg');
            svgEl.innerHTML = '';
            const NS = "http://www.w3.org/2000/svg";

            const sortedShapes = [...gameShapes].sort((a, b) => {
                if (a.isError && !b.isError) return 1;
                if (!a.isError && b.isError) return -1;
                return 0;
            });

            sortedShapes.forEach(shape => {
                if (fractalType === 'sierpinski') {
                    let renderX = shape.x;
                    let renderY = shape.y;
                    let renderSize = shape.size;
                    let strokeColor = '#0077b6';
                    let strokeWidth = '2';
                    let dashArray = 'none';
                    let fillOpacity = 1;
                    let fillColor = shape.isError ? '#fee2e2' : '#ffffff';
                    let inverted = false;
                    let circleMarker = null;

                    if (shape.errorType === 'wrongSize') {
                        const scaleFactor = shape.id.length % 2 === 0 ? 1.35 : 0.6;
                        const centerX = shape.x + shape.size / 2;
                        const centerY = shape.y + (shape.size * H_FACTOR) / 2;
                        renderSize = shape.size * scaleFactor;
                        renderX = centerX - renderSize / 2;
                        renderY = centerY - (renderSize * H_FACTOR) / 2;
                        strokeColor = 'var(--wrong)';
                        fillColor = '#fee2e2';
                    } else if (shape.errorType === 'missing') {
                        dashArray = '5,5';
                        fillOpacity = 0.2;
                        fillColor = '#fee2e2';
                        strokeColor = 'var(--wrong)';
                    } else if (shape.errorType === 'extra') {
                        strokeColor = 'var(--wrong)';
                        fillColor = '#fee2e2';
                    } else if (shape.errorType === 'wrongOrientation') {
                        inverted = true;
                        strokeColor = 'var(--wrong)';
                        fillColor = '#fee2e2';
                    } else if (shape.errorType === 'wrongLocation') {
                        renderX = clamp(shape.x + shape.size * 0.4, CANVAS_MIN, CANVAS_MAX - renderSize);
                        renderY = clamp(shape.y - shape.size * 0.28, CANVAS_MIN, CANVAS_MAX - renderSize * H_FACTOR);
                        strokeColor = 'var(--wrong)';
                        fillColor = '#fee2e2';
                        circleMarker = { cx: renderX + renderSize / 2, cy: renderY + (renderSize * H_FACTOR) / 2, r: renderSize * 0.85 };
                    }

                    const points = inverted
                        ? \`\${renderX},\${renderY} \${renderX + renderSize},\${renderY} \${renderX + renderSize / 2},\${renderY + renderSize * H_FACTOR}\`
                        : \`\${renderX + renderSize / 2},\${renderY} \${renderX},\${renderY + renderSize * H_FACTOR} \${renderX + renderSize},\${renderY + renderSize * H_FACTOR}\`;

                    if (circleMarker) {
                        const circle = document.createElementNS(NS, "circle");
                        circle.setAttribute("cx", circleMarker.cx);
                        circle.setAttribute("cy", circleMarker.cy);
                        circle.setAttribute("r", circleMarker.r);
                        circle.setAttribute("fill", "none");
                        circle.setAttribute("stroke", "var(--wrong)");
                        circle.setAttribute("stroke-width", "1.5");
                        circle.setAttribute("stroke-dasharray", "4,3");
                        circle.setAttribute("opacity", "0.7");
                        circle.style.pointerEvents = 'none';
                        svgEl.appendChild(circle);
                    }

                    const poly = document.createElementNS(NS, "polygon");
                    poly.setAttribute("points", points);
                    poly.setAttribute("fill", fillColor);
                    poly.setAttribute("fill-opacity", fillOpacity);
                    poly.setAttribute("stroke", strokeColor);
                    poly.setAttribute("stroke-width", strokeWidth);
                    poly.setAttribute("stroke-dasharray", dashArray);
                    poly.style.transition = 'all 0.2s';

                    const isInteractive = shape.isError || difficulty === 'Avanzado';
                    if (isInteractive) {
                        poly.style.cursor = "pointer";
                        poly.onmouseenter = () => {
                            if (!shape.isError) poly.setAttribute("fill", "#e0f2fe");
                        };
                        poly.onmouseleave = () => {
                            if (!shape.isError) poly.setAttribute("fill", fillColor);
                        };
                        poly.onclick = () => handleShapeClick(shape.id);
                    } else {
                        poly.style.pointerEvents = "none";
                    }
                    svgEl.appendChild(poly);
                } else {
                    let targetX1 = shape.x1;
                    let targetY1 = shape.y1;
                    let targetX2 = shape.x2;
                    let targetY2 = shape.y2;
                    let strokeColor = '#0077b6';
                    let strokeWidth = 2.5;
                    let dashArray = 'none';
                    let circleMarker = null;

                    if (shape.errorType === 'wrongSize') {
                        const dx = shape.x2 - shape.x1;
                        const dy = shape.y2 - shape.y1;
                        const scaleFactor = shape.id.length % 2 === 0 ? 1.4 : 0.6;
                        targetX2 = clamp(shape.x1 + dx * scaleFactor);
                        targetY2 = clamp(shape.y1 + dy * scaleFactor);
                        strokeColor = 'var(--wrong)';
                    } else if (shape.errorType === 'missing') {
                        dashArray = '5,5';
                        strokeWidth = 2;
                        strokeColor = 'var(--wrong)';
                    } else if (shape.errorType === 'extra') {
                        strokeColor = 'var(--wrong)';
                    } else if (shape.errorType === 'wrongOrientation') {
                        const dx = shape.x2 - shape.x1;
                        const dy = shape.y2 - shape.y1;
                        const rotAngle = -Math.PI / 2;
                        targetX2 = clamp(shape.x1 + dx * Math.cos(rotAngle) - dy * Math.sin(rotAngle));
                        targetY2 = clamp(shape.y1 + dx * Math.sin(rotAngle) + dy * Math.cos(rotAngle));
                        strokeColor = 'var(--wrong)';
                    } else if (shape.errorType === 'wrongLocation') {
                        const offsetX = 22;
                        const offsetY = -16;
                        targetX1 = clamp(shape.x1 + offsetX); targetY1 = clamp(shape.y1 + offsetY);
                        targetX2 = clamp(shape.x2 + offsetX); targetY2 = clamp(shape.y2 + offsetY);
                        strokeColor = 'var(--wrong)';
                        circleMarker = { cx: (targetX1 + targetX2) / 2, cy: (targetY1 + targetY2) / 2, r: 22 };
                    }

                    if (circleMarker) {
                        const circle = document.createElementNS(NS, "circle");
                        circle.setAttribute("cx", circleMarker.cx);
                        circle.setAttribute("cy", circleMarker.cy);
                        circle.setAttribute("r", circleMarker.r);
                        circle.setAttribute("fill", "none");
                        circle.setAttribute("stroke", "var(--wrong)");
                        circle.setAttribute("stroke-width", "1.5");
                        circle.setAttribute("stroke-dasharray", "4,3");
                        circle.setAttribute("opacity", "0.7");
                        circle.style.pointerEvents = 'none';
                        svgEl.appendChild(circle);
                    }

                    const g = document.createElementNS(NS, "g");
                    const isInteractive = shape.isError || difficulty === 'Avanzado';

                    if (isInteractive) {
                        const hitLine = document.createElementNS(NS, "line");
                        hitLine.setAttribute("x1", targetX1);
                        hitLine.setAttribute("y1", targetY1);
                        hitLine.setAttribute("x2", targetX2);
                        hitLine.setAttribute("y2", targetY2);
                        hitLine.setAttribute("stroke", "transparent");
                        hitLine.setAttribute("stroke-width", "16");
                        hitLine.setAttribute("stroke-linecap", "round");
                        hitLine.style.cursor = "pointer";
                        hitLine.onclick = () => handleShapeClick(shape.id);
                        g.appendChild(hitLine);

                        const visibleLine = document.createElementNS(NS, "line");
                        visibleLine.setAttribute("x1", targetX1);
                        visibleLine.setAttribute("y1", targetY1);
                        visibleLine.setAttribute("x2", targetX2);
                        visibleLine.setAttribute("y2", targetY2);
                        visibleLine.setAttribute("stroke", strokeColor);
                        visibleLine.setAttribute("stroke-width", strokeWidth);
                        visibleLine.setAttribute("stroke-dasharray", dashArray);
                        visibleLine.setAttribute("stroke-linecap", "round");
                        visibleLine.style.pointerEvents = "none";
                        visibleLine.style.transition = 'all 0.2s';
                        g.appendChild(visibleLine);
                    } else {
                        const visibleLine = document.createElementNS(NS, "line");
                        visibleLine.setAttribute("x1", targetX1);
                        visibleLine.setAttribute("y1", targetY1);
                        visibleLine.setAttribute("x2", targetX2);
                        visibleLine.setAttribute("y2", targetY2);
                        visibleLine.setAttribute("stroke", strokeColor);
                        visibleLine.setAttribute("stroke-width", strokeWidth);
                        visibleLine.setAttribute("stroke-dasharray", dashArray);
                        visibleLine.setAttribute("stroke-linecap", "round");
                        visibleLine.style.pointerEvents = "none";
                        g.appendChild(visibleLine);
                    }

                    svgEl.appendChild(g);
                }
            });
        }

        function updateUI() {
            document.getElementById('time-val').innerText = formatTime(timeLeft);
            document.getElementById('time-val').style.color = timeLeft <= 10 ? 'var(--wrong)' : 'var(--primary-color)';
            document.getElementById('progress-text').innerText = difficulty === 'Básico'
                ? 'Errores: ' + errorsFound + ' / ' + totalErrors
                : 'Completado: ' + gameShapes.length + ' / ' + getTargetLength(fractalType);
            document.getElementById('found-val').innerText = difficulty === 'Básico'
                ? errorsFound + ' / ' + totalErrors
                : gameShapes.length + ' / ' + getTargetLength(fractalType);
            renderShapes();
        }

        function handleTimeout() {
            clearInterval(timerInterval);
            isPlaying = false;
            Swal.fire({
                title: 'Tiempo agotado',
                text: 'Tiempo agotado, intente nuevamente',
                icon: 'error',
                confirmButtonColor: '#0077b6',
                confirmButtonText: 'Reiniciar juego'
            }).then(() => {
                initGame(fractalType);
            });
        }

        function handleWin() {
            clearInterval(timerInterval);
            isPlaying = false;

            score = score + config.points;
            document.getElementById('score-val').innerText = score + ' pts';

            if (!completedFractals.includes(fractalType)) completedFractals.push(fractalType);
            const nextFractal = fractalOrder.find(f => !completedFractals.includes(f));
            renderFractalSelectors();

            if (nextFractal) {
                Swal.fire({
                    title: '¡Correcto!',
                    html: \`
                      <p style="font-size: 1.1rem; margin-bottom: 0;">¡Muy bien! Reparaste correctamente la figura fractal.</p>
                      <div style="font-size: 1.1rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGreenGlow 1.5s infinite;">✨ +\${config.points} Puntos</div>
                    \`,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Ir a la siguiente figura',
                    cancelButtonText: 'Finalizar Juego',
                    confirmButtonColor: '#0077b6',
                    cancelButtonColor: '#4b5563',
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        initGame(nextFractal);
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        exitToClosedScreen();
                    }
                });
            } else {
                Swal.fire({
                    title: '¡Felicidades!',
                    html: \`
                      <div class="swal-confetti">
                        <span style="font-size: 3rem;">🌟</span>
                        <span style="font-size: 3rem;">🏆</span>
                        <span style="font-size: 3rem;">🌟</span>
                      </div>
                      <p style="font-size: 1.1rem; margin-bottom: 0;">Has reparado todas las figuras fractales y obtenido <strong>\${score}</strong> puntos.</p>
                      <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                        Puntaje Total: \${score}
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
                }).then((result) => {
                    if (result.isConfirmed) {
                        exitToClosedScreen();
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        startGame();
                    }
                });
            }
        }

        function validateSolution() {
            if (difficulty === 'Básico') {
                const remainingErrors = gameShapes.filter(s => s.isError).length;
                if (remainingErrors === 0) {
                    handleWin();
                } else {
                    Swal.fire({
                        title: 'Incompleto',
                        text: 'Aún quedan ' + remainingErrors + ' errores por encontrar. ¡Sigue buscando!',
                        icon: 'info',
                        confirmButtonColor: '#0077b6'
                    });
                }
            } else {
                const allAtTarget = gameShapes.every(s => s.currentDepth === CONFIG[fractalType].targetDepthAvanzado);
                if (allAtTarget && gameShapes.length > 1) {
                    handleWin();
                } else {
                    Swal.fire({
                        title: 'Incompleto',
                        text: 'Aún no has terminado de construir todas las ramas del fractal. ¡Sigue iterando!',
                        icon: 'info',
                        confirmButtonColor: '#0077b6'
                    });
                }
            }
        }

        function handleFinishGame() {
            Swal.fire({
                title: '¿Deseas finalizar el juego?',
                text: 'Tu puntaje actual es de ' + score + ' puntos.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#4b5563',
                confirmButtonText: 'Sí, finalizar',
                cancelButtonText: 'Seguir Jugando'
            }).then((result) => {
                if (result.isConfirmed) {
                    clearInterval(timerInterval);
                    isPlaying = false;
                    exitToClosedScreen();
                } else {
                    if (isPlaying) {
                        clearInterval(timerInterval);
                        timerInterval = setInterval(() => {
                            timeLeft--;
                            updateUI();
                            if (timeLeft <= 0) handleTimeout();
                        }, 1000);
                    }
                }
            });
        }

        function toggleInfo(show) {
            const m = document.getElementById('info-overlay');
            if (show) { m.classList.remove('hidden'); m.style.display = 'flex'; }
            else { m.classList.add('hidden'); m.style.display = 'none'; }
        }
    </script>
</body>
</html>`;
};

const DiseñoFractal = () => {
    const [view, setView] = useState('home');
    const [difficulty, setDifficulty] = useState('');

    // Game state
    const [fractalType, setFractalType] = useState('sierpinski');
    const [fractalOrder, setFractalOrder] = useState(['sierpinski', 'koch', 'dragon']);
    const [completedFractals, setCompletedFractals] = useState([]);
    const [gameShapes, setGameShapes] = useState([]);
    const [errorsFound, setErrorsFound] = useState(0);
    const [totalErrors, setTotalErrors] = useState(5);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);

    const timerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const jsZipReady = true;

    const MOCK_DATA = {
        selectedAreas: ['science', 'math'],
        selectedSkills: ['Lógica', 'Resolución de problemas', 'Reconocimiento de patrones'],
        gameDetails: { gameName: 'Diseño Fractal', description: 'Crea y repara figuras fractalizadas mediante iteraciones matemáticas.', version: '1.0.0', date: null },
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

    const currentConfig = DIFFICULTY_SETTINGS[difficulty];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);



    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Mezcla el orden de los fractales para que la secuencia no se repita entre partidas
    const shuffleFractals = () => {
        const arr = ['sierpinski', 'koch', 'dragon'];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    // Elige `count` índices al azar (sin repetir) dentro de `pool`
    const pickRandomIndices = (pool, count) => {
        const copy = [...pool];
        const picked = [];
        while (picked.length < count && copy.length > 0) {
            const r = Math.floor(Math.random() * copy.length);
            picked.push(copy.splice(r, 1)[0]);
        }
        return picked;
    };

    const initGame = (type = fractalType) => {
        setFractalType(type);
        setTimeLeft(currentConfig.timeLimit);
        setIsPlaying(true);
        setErrorsFound(0);

        if (difficulty === 'Básico') {
            const targetDepth = CONFIG[type].targetDepthBasico;
            const baseNodes = generateFullFractal(type, targetDepth);
            const allIndices = baseNodes.map((_, i) => i);

            // Distribuye los errores en 5 categorías, según la guía visual:
            // faltante, mal orientado, tamaño incorrecto, ubicación incorrecta y sobrante
            const errorCounts = { missing: 2, wrongOrientation: 2, wrongSize: 2, wrongLocation: 2 };
            const numExtra = 1;

            let pool = [...allIndices];
            const assigned = {};
            Object.entries(errorCounts).forEach(([errType, count]) => {
                const picked = pickRandomIndices(pool, count);
                picked.forEach(i => { assigned[i] = errType; });
                pool = pool.filter(i => !picked.includes(i));
            });

            const nodesWithErrors = baseNodes.map((n, i) => {
                if (assigned[i]) return { ...n, isError: true, errorType: assigned[i] };
                return { ...n, isError: false, errorType: null };
            });

            // Genera figuras "sobrantes" que no pertenecen al fractal correcto.
            // Se elige el origen SOLO entre nodos que no tengan ya un error asignado
            // (usando `pool`, lo que sobra tras repartir errorCounts) para evitar que la
            // figura sobrante quede duplicada/superpuesta encima de otro error y lo tape.
            // Además, se recorta (clamp) dentro del lienzo para que nunca quede fuera de vista.
            const extraShapes = [];
            for (let e = 0; e < numExtra; e++) {
                const candidatePool = pool.length > 0 ? pool : allIndices;
                const sourceIndex = candidatePool[Math.floor(Math.random() * candidatePool.length)];
                const source = baseNodes[sourceIndex];
                const jitterA = Math.random() > 0.5 ? 1 : -1;
                const jitterB = Math.random() > 0.5 ? 1 : -1;
                extraShapes.push({
                    ...source,
                    id: `extra-${e}-${source.id}`,
                    isError: true,
                    isExtra: true,
                    errorType: 'extra',
                    x: source.x !== undefined ? clamp(source.x + jitterA * 35) : undefined,
                    y: source.y !== undefined ? clamp(source.y + jitterB * 25) : undefined,
                    x1: source.x1 !== undefined ? clamp(source.x1 + jitterA * 25) : undefined,
                    y1: source.y1 !== undefined ? clamp(source.y1 + jitterB * 20) : undefined,
                    x2: source.x2 !== undefined ? clamp(source.x2 + jitterA * 25) : undefined,
                    y2: source.y2 !== undefined ? clamp(source.y2 + jitterB * 20) : undefined,
                });
            }

            // El total mostrado se calcula a partir de las figuras realmente generadas
            // (no de una fórmula fija), así el contador siempre corresponde a errores
            // que en verdad existen y pueden encontrarse.
            const totalErrorCount = nodesWithErrors.filter(n => n.isError).length + extraShapes.length;
            setTotalErrors(totalErrorCount);
            setGameShapes([...nodesWithErrors, ...extraShapes]);
        } else {
            setGameShapes(CONFIG[type].initialNodes());
        }
    };

    const startNewGame = () => {
        const order = shuffleFractals();
        setFractalOrder(order);
        setCompletedFractals([]);
        setScore(0);
        setView('play');
        initGame(order[0]);
    };

    useEffect(() => {
        if (view === 'play' && isPlaying) {
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
        }
        return () => clearInterval(timerRef.current);
    }, [view, isPlaying]);

    const handleTimeout = () => {
        setIsPlaying(false);
        Swal.fire({
            title: 'Tiempo agotado',
            text: 'Tiempo agotado, intente nuevamente',
            icon: 'error',
            confirmButtonColor: '#0077b6',
            confirmButtonText: 'Reiniciar juego'
        }).then(() => {
            initGame(fractalType);
        });
    };

    const handleWin = () => {
        clearInterval(timerRef.current);
        setIsPlaying(false);

        const newScore = score + currentConfig.points;
        setScore(newScore);

        const updatedCompleted = [...completedFractals, fractalType];
        setCompletedFractals(updatedCompleted);
        const nextFractal = fractalOrder.find(f => !updatedCompleted.includes(f));

        if (nextFractal) {
            Swal.fire({
                title: '¡Correcto!',
                html: `
                  <p style="font-size: 1.1rem; margin-bottom: 0;">¡Muy bien! Reparaste correctamente la figura fractal.</p>
                  <div style="font-size: 1.1rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGreenGlow 1.5s infinite;">✨ +${currentConfig.points} Puntos</div>
                `,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Ir a la siguiente figura',
                cancelButtonText: 'Finalizar Juego',
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#4b5563',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    initGame(nextFractal);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    goToHome();
                }
            });
        } else {
            Swal.fire({
                title: '¡Felicidades!',
                html: `
                  <div class="swal-confetti">
                    <span style="font-size: 3rem;">🌟</span>
                    <span style="font-size: 3rem;">🏆</span>
                    <span style="font-size: 3rem;">🌟</span>
                  </div>
                  <p style="font-size: 1.1rem; margin-bottom: 0;">Has reparado todas las figuras fractales y obtenido <strong>${newScore}</strong> puntos.</p>
                  <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                    Puntaje Total: ${newScore}
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
                    startNewGame();
                }
            });
        }
    };

    const handleShapeClick = (shapeId) => {
        if (!isPlaying) return;

        if (difficulty === 'Básico') {
            const shape = gameShapes.find(s => s.id === shapeId);
            if (!shape || !shape.isError) return;

            if (shape.isExtra) {
                // La figura sobrante se corrige eliminándola del tablero
                setGameShapes(prev => prev.filter(s => s.id !== shapeId));
            } else {
                // La figura faltante o de tamaño incorrecto se corrige restaurándola
                setGameShapes(prev => prev.map(s => s.id === shapeId ? { ...s, isError: false, errorType: null } : s));
            }
            setErrorsFound(prev => prev + 1);
        } else {
            const node = gameShapes.find(s => s.id === shapeId);
            if (!node || node.currentDepth >= CONFIG[fractalType].targetDepthAvanzado) return;

            const newChildren = getChildren(fractalType, node);
            const updatedShapes = [...gameShapes.filter(n => n.id !== node.id), ...newChildren];
            setGameShapes(updatedShapes);
        }
    };

    const validateSolution = () => {
        if (difficulty === 'Básico') {
            const remainingErrors = gameShapes.filter(s => s.isError).length;
            if (remainingErrors === 0) {
                handleWin();
            } else {
                Swal.fire({
                    title: 'Incompleto',
                    text: `Aún quedan ${remainingErrors} errores por encontrar. ¡Sigue buscando!`,
                    icon: 'info',
                    confirmButtonColor: '#0077b6'
                });
            }
        } else {
            const allAtTarget = gameShapes.every(s => s.currentDepth === CONFIG[fractalType].targetDepthAvanzado);
            if (allAtTarget && gameShapes.length > 1) {
                handleWin();
            } else {
                Swal.fire({
                    title: 'Incompleto',
                    text: 'Aún no has terminado de construir todas las ramas del fractal. ¡Sigue iterando!',
                    icon: 'info',
                    confirmButtonColor: '#0077b6'
                });
            }
        }
    };

    const handleFinishGame = () => {
        Swal.fire({
            title: '¿Deseas finalizar el juego?',
            text: `Tu juego de Diseño Fractal finalizará y regresarás al panel de configuración.`,
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
            .replace(/ñ/g, '§ntilde§')
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/§ntilde§/g, 'ñ')
            .replace(/\s+/g, "_");

    const platformLabel = (p) => ({ web: 'Web', android: 'Android', ios: 'iOS' }[String(p).toLowerCase()] || p);

    const handleSmartDownload = async () => { if (isGenerating) return; setIsGenerating(true); setProgress(10); await generateAndDownloadZip(); };

    const generateAndDownloadZip = async () => {
        try {
            setStatusText('Preparando juego y configuración...');
            const result = await buildMissingMobileDownload({
                slug: 'diseno-fractal', details: gameDetails, platforms: selectedPlatforms,
                options: { nivel: difficulty }, htmlContent: generateHtmlCode(difficulty, gameDetails, selectedPlatforms), webAssets: [],
                onStatus: (status) => { setStatusText(status); setProgress(current => Math.min(90, current + 15)); }
            });
            downloadGameArchive(result.blob, result.fileName);
            setProgress(100); setStatusText('¡Descarga iniciada!');
        } catch (error) {
            console.error(error); setStatusText(error?.message || 'Error al generar el paquete.');
        } finally { setIsGenerating(false); }
    };

    const renderSetupScreen = () => {
        const gameIcon = location.state?.selectedGame?.icon || null;
        return (
            <div className="catalog-screen">
                <div className="game-title">
                    {'Juego de Diseño Fractal'.split('').map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>

                {/* Imagen del juego con efectos, centrada debajo del título */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {gameIcon ? (
                        <img src={gameIcon} alt="Diseño Fractal" className="game-preview-image" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <div className="game-image-placeholder">❄️🌀</div>
                    )}
                    <span className="game-info-badge">Geometría Fractal</span>
                </div>

                <div className="rules-banner">
                    <h2><HelpCircle size={22} /> Reglas Básicas</h2>
                    <p>
                        {difficulty === 'Básico' && 'Repara patrones fractales matemáticos, tienes que identificar los errores en las siguientes figuras.'}
                        {difficulty === 'Avanzado' && 'Construye patrones fractales matemáticos, tienes que completar el diseño sin romper la simetría ni la secuencia del fractal.'}
                        {!difficulty && 'Selecciona un nivel de dificultad para conocer las reglas del reto.'}
                    </p>
                </div>

                <div className="difficulty-select-wrapper" style={{ flexDirection: 'column', paddingBottom: '2rem', borderBottom: '1px solid var(--medium-gray-color)', display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                    <label style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--secondary-color)' }}>Selecciona el nivel de dificultad:</label>
                    <select
                        className="custom-select"
                        style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="" disabled>Selecciona una opción</option>
                        {Object.keys(DIFFICULTY_SETTINGS).map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>

                <div className="catalog-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--medium-gray-color)' }}>
                    <button className="no-rounded-button btn-primary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} /> Anterior
                    </button>
                    <button
                        className="no-rounded-button btn-primary"
                        onClick={startNewGame}
                        disabled={!difficulty}
                        style={{ opacity: !difficulty ? 0.5 : 1, cursor: !difficulty ? 'not-allowed' : 'pointer' }}
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
                    {'Juego de Diseño Fractal'.split('').map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--dark-gray-color)', marginBottom: '1rem' }}>
                    (Vista Previa)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto 1.5rem auto', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                        📋 Reglas básicas
                    </span>
                    <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>
                        {difficulty === 'Básico'
                            ? 'Repara patrones fractales matemáticos, tienes que identificar los errores en las siguientes figuras.'
                            : 'Construye patrones fractales matemáticos, tienes que completar el diseño sin romper la simetría ni la secuencia del fractal.'}
                    </span>
                </div>

                <div className="game-layout">
                    <div className="game-main-col">
                        <div className="game-board" style={{ width: '100%', margin: 0 }}>
                            <div className="fractal-selectors">
                                {fractalOrder.map((type) => {
                                    const label = type === 'sierpinski' ? 'Triángulo de Sierpinski' : type === 'koch' ? 'Copo de Koch' : 'Curva de dragón';
                                    const position = fractalOrder.indexOf(type);
                                    const isCompleted = completedFractals.includes(type);
                                    const isUnlocked = isCompleted || position === completedFractals.length;
                                    return (
                                        <button
                                            key={type}
                                            className={`fractal-btn ${fractalType === type ? 'active' : ''}`}
                                            onClick={() => isUnlocked && type !== fractalType && initGame(type)}
                                            disabled={!isUnlocked}
                                            style={{ opacity: isUnlocked ? 1 : 0.5, cursor: isUnlocked ? (type !== fractalType ? 'pointer' : 'default') : 'not-allowed' }}
                                        >
                                            {Icons[type]}
                                            {label}
                                            {isCompleted && <Check size={14} color="var(--correct-color)" />}
                                            {!isUnlocked && <Lock size={14} />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="game-area-box">
                                <div className="game-area-header">
                                    <span>{difficulty === 'Básico' ? 'Encuentra los errores' : 'Construye el fractal'}</span>
                                    <span>{difficulty === 'Básico' ? `Errores: ${errorsFound} / ${totalErrors}` : `Completado: ${gameShapes.length} / ${getTargetLength(fractalType)}`}</span>
                                </div>
                                <div className="svg-container">
                                    <svg width="400" height="400" viewBox="0 0 400 400">
                                        {(() => {
                                            const sortedGameShapes = [...gameShapes].sort((a, b) => {
                                                if (a.isError && !b.isError) return 1;
                                                if (!a.isError && b.isError) return -1;
                                                return 0;
                                            });

                                            return sortedGameShapes.map(shape => {
                                                if (fractalType === 'sierpinski') {
                                                    let renderX = shape.x;
                                                    let renderY = shape.y;
                                                    let renderSize = shape.size;
                                                    let strokeColor = '#0077b6';
                                                    let strokeWidth = 2;
                                                    let dashArray = 'none';
                                                    let fillOpacity = 1;
                                                    let fillColor = shape.isError ? '#fee2e2' : '#ffffff';
                                                    let inverted = false;
                                                    let circleMarker = null;

                                                    if (shape.errorType === 'wrongSize') {
                                                        const scaleFactor = shape.id.length % 2 === 0 ? 1.35 : 0.6;
                                                        const centerX = shape.x + shape.size / 2;
                                                        const centerY = shape.y + (shape.size * H_FACTOR) / 2;
                                                        renderSize = shape.size * scaleFactor;
                                                        renderX = centerX - renderSize / 2;
                                                        renderY = centerY - (renderSize * H_FACTOR) / 2;
                                                        strokeColor = 'var(--wrong-color)';
                                                        fillColor = '#fee2e2';
                                                    } else if (shape.errorType === 'missing') {
                                                        dashArray = '5,5';
                                                        fillOpacity = 0.2;
                                                        fillColor = '#fee2e2';
                                                        strokeColor = 'var(--wrong-color)';
                                                    } else if (shape.errorType === 'extra') {
                                                        strokeColor = 'var(--wrong-color)';
                                                        fillColor = '#fee2e2';
                                                    } else if (shape.errorType === 'wrongOrientation') {
                                                        inverted = true;
                                                        strokeColor = 'var(--wrong-color)';
                                                        fillColor = '#fee2e2';
                                                    } else if (shape.errorType === 'wrongLocation') {
                                                        renderX = clamp(shape.x + shape.size * 0.4, CANVAS_MIN, CANVAS_MAX - renderSize);
                                                        renderY = clamp(shape.y - shape.size * 0.28, CANVAS_MIN, CANVAS_MAX - renderSize * H_FACTOR);
                                                        strokeColor = 'var(--wrong-color)';
                                                        fillColor = '#fee2e2';
                                                        circleMarker = { cx: renderX + renderSize / 2, cy: renderY + (renderSize * H_FACTOR) / 2, r: renderSize * 0.85 };
                                                    }

                                                    const points = inverted
                                                        ? `${renderX},${renderY} ${renderX + renderSize},${renderY} ${renderX + renderSize / 2},${renderY + renderSize * H_FACTOR}`
                                                        : `${renderX + renderSize / 2},${renderY} ${renderX},${renderY + renderSize * H_FACTOR} ${renderX + renderSize},${renderY + renderSize * H_FACTOR}`;

                                                    const isInteractive = shape.isError || difficulty === 'Avanzado';

                                                    return (
                                                        <g key={shape.id}>
                                                            {circleMarker && (
                                                                <circle cx={circleMarker.cx} cy={circleMarker.cy} r={circleMarker.r} fill="none" stroke="var(--wrong-color)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.7} style={{ pointerEvents: 'none' }} />
                                                            )}
                                                            <polygon
                                                                points={points}
                                                                fill={fillColor}
                                                                fillOpacity={fillOpacity}
                                                                stroke={strokeColor}
                                                                strokeWidth={strokeWidth}
                                                                strokeDasharray={dashArray}
                                                                onClick={() => isInteractive && handleShapeClick(shape.id)}
                                                                className={isInteractive ? 'interactive-shape' : ''}
                                                                style={{
                                                                    transition: 'all 0.2s',
                                                                    cursor: isInteractive ? 'pointer' : 'default',
                                                                    pointerEvents: isInteractive ? 'all' : 'none'
                                                                }}
                                                            />
                                                        </g>
                                                    );
                                                } else {
                                                    let targetX1 = shape.x1;
                                                    let targetY1 = shape.y1;
                                                    let targetX2 = shape.x2;
                                                    let targetY2 = shape.y2;
                                                    let strokeColor = '#0077b6';
                                                    let strokeWidth = 2.5;
                                                    let dashArray = 'none';
                                                    let circleMarker = null;

                                                    if (shape.errorType === 'wrongSize') {
                                                        const dx = shape.x2 - shape.x1;
                                                        const dy = shape.y2 - shape.y1;
                                                        const scaleFactor = shape.id.length % 2 === 0 ? 1.4 : 0.6;
                                                        targetX2 = clamp(shape.x1 + dx * scaleFactor);
                                                        targetY2 = clamp(shape.y1 + dy * scaleFactor);
                                                        strokeColor = 'var(--wrong-color)';
                                                    } else if (shape.errorType === 'missing') {
                                                        dashArray = '5,5';
                                                        strokeWidth = 2;
                                                        strokeColor = 'var(--wrong-color)';
                                                    } else if (shape.errorType === 'extra') {
                                                        strokeColor = 'var(--wrong-color)';
                                                    } else if (shape.errorType === 'wrongOrientation') {
                                                        const dx = shape.x2 - shape.x1;
                                                        const dy = shape.y2 - shape.y1;
                                                        const rotAngle = -Math.PI / 2;
                                                        targetX2 = clamp(shape.x1 + dx * Math.cos(rotAngle) - dy * Math.sin(rotAngle));
                                                        targetY2 = clamp(shape.y1 + dx * Math.sin(rotAngle) + dy * Math.cos(rotAngle));
                                                        strokeColor = 'var(--wrong-color)';
                                                    } else if (shape.errorType === 'wrongLocation') {
                                                        const offsetX = 22;
                                                        const offsetY = -16;
                                                        targetX1 = clamp(shape.x1 + offsetX); targetY1 = clamp(shape.y1 + offsetY);
                                                        targetX2 = clamp(shape.x2 + offsetX); targetY2 = clamp(shape.y2 + offsetY);
                                                        strokeColor = 'var(--wrong-color)';
                                                        circleMarker = { cx: (targetX1 + targetX2) / 2, cy: (targetY1 + targetY2) / 2, r: 22 };
                                                    }

                                                    const isInteractive = shape.isError || difficulty === 'Avanzado';

                                                    return (
                                                        <g key={shape.id}>
                                                            {circleMarker && (
                                                                <circle cx={circleMarker.cx} cy={circleMarker.cy} r={circleMarker.r} fill="none" stroke="var(--wrong-color)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.7} style={{ pointerEvents: 'none' }} />
                                                            )}
                                                            {isInteractive ? (
                                                                <>
                                                                    <line
                                                                        x1={targetX1} y1={targetY1} x2={targetX2} y2={targetY2}
                                                                        stroke="transparent"
                                                                        strokeWidth={16}
                                                                        strokeLinecap="round"
                                                                        onClick={() => handleShapeClick(shape.id)}
                                                                        style={{ cursor: 'pointer' }}
                                                                    />
                                                                    <line
                                                                        x1={targetX1} y1={targetY1} x2={targetX2} y2={targetY2}
                                                                        stroke={strokeColor}
                                                                        strokeWidth={strokeWidth}
                                                                        strokeDasharray={dashArray}
                                                                        strokeLinecap="round"
                                                                        style={{ transition: 'all 0.2s', pointerEvents: 'none' }}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <line
                                                                    x1={targetX1} y1={targetY1} x2={targetX2} y2={targetY2}
                                                                    stroke={strokeColor}
                                                                    strokeWidth={strokeWidth}
                                                                    strokeDasharray={dashArray}
                                                                    strokeLinecap="round"
                                                                    style={{ transition: 'all 0.2s', pointerEvents: 'none' }}
                                                                />
                                                            )}
                                                        </g>
                                                    );
                                                }
                                            });
                                        })()}
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="game-right-col">
                        <div className="stats-block">
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Trophy size={18} /> Progreso
                            </h3>
                            <div className="stats-item" style={{ marginTop: '1rem' }}>
                                <span>Nivel:</span> <strong style={{ color: 'var(--primary-color)' }}>{difficulty}</strong>
                            </div>
                            <div className="stats-item">
                                <span>Tiempo:</span>
                                <strong style={{ color: timeLeft <= 10 ? 'var(--wrong-color)' : 'var(--primary-color)', fontWeight: 'bold' }}>{formatTime(timeLeft)}</strong>
                            </div>
                            <div className="stats-item">
                                <span>Modo:</span>
                                <strong style={{ color: 'var(--primary-color)' }}>{difficulty === 'Básico' ? 'Identificación' : 'Construcción'}</strong>
                            </div>
                            <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                                <span>{difficulty === 'Básico' ? 'Errores Encontrados:' : 'Ramas Completadas:'}</span>
                                <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                                    {difficulty === 'Básico' ? `${errorsFound} / ${totalErrors}` : `${gameShapes.length} / ${getTargetLength(fractalType)}`}
                                </strong>
                            </div>
                            <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                                <span>Puntaje:</span>
                                <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{score} pts</strong>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                                <button className="no-rounded-button btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={validateSolution}>
                                    <CheckSquare size={16} /> Validar Solución
                                </button>
                                <button className="no-rounded-button btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleFinishGame}>
                                    <X size={16} /> Finalizar Juego
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="nav-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', width: '100%', borderTop: '1px solid var(--medium-gray-color)', paddingTop: '1.5rem' }}>
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
                            <div className="info-card-value">{gameDetails.gameName || 'Diseño Fractal'}</div>
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
                                {gameDetails.description || 'Crea y repara figuras fractalizadas mediante iteraciones matemáticas.'}
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

                {/* ── ÁREAS Y HABILIDADES en columnas responsivas distribuidas ── */}
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
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{difficulty}</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Timer size={18} /> Tiempo Límite:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentConfig.timeLimit / 60} minutos</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Star size={18} /> Puntos:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentConfig.points}</strong>
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
            <div className="fractal-container">
                {view === 'home' && renderSetupScreen()}
                {view === 'play' && renderGameScreen()}
                {view === 'summary' && renderSummaryScreen()}
            </div>
        </>
    );
};

export default DiseñoFractal;
