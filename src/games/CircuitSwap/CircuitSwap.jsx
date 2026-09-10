import { buildMissingMobileDownload } from '../../utils/missingMobileGames';
import { downloadGameArchive } from '../../utils/gameDownloadPackaging';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    ArrowLeft, ArrowRight, CheckCircle, HelpCircle, Magnet,
    Check, X, FileText, Monitor, Calendar, Type, Layers, Trophy, Zap, Tag, Shapes, Puzzle, Settings, Clock
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
      font-family: system-ui, -apple-system, sans-serif;
    }

    .circuitswap-container {
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
    .no-rounded-button.btn-primary:hover:not(:disabled) { background-color: #004b75; }

    .catalog-actions {
      display: flex;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid var(--medium-gray-color);
    }

    /* --- CATALOGO DE OBJETOS --- */
    .objects-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 0.5rem;
      margin: 1.5rem 0;
    }
    .object-item {
      border: 2px solid var(--medium-gray-color);
      border-radius: 0.5rem;
      padding: 0.5rem;
      text-align: center;
      cursor: default;
      transition: all 0.2s;
      background: white;
      user-select: none;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 85px;
    }
    .object-item.selected {
      border-color: var(--primary-color);
      background: #eff6ff;
      box-shadow: 0 4px 6px -1px rgba(0, 119, 182, 0.2);
    }
    .object-icon {
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }
    .object-name {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--secondary-color);
      line-height: 1.1;
      word-break: break-word;
    }
    .check-icon {
      position: absolute;
      top: 5px;
      right: 5px;
      background: var(--correct-color);
      color: white;
      border-radius: 50%;
      padding: 2px;
    }

    /* --- GAME LAYOUT --- */
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
      background: white;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 2rem;
      min-height: 400px;
      align-items: center;
    }

    /* --- CIRCUIT BOARD --- */
    .circuit-board {
      position: relative;
      width: 320px;
      height: 240px;
      margin: 2rem auto;
      border: 4px solid transparent;
    }
    .wire {
      position: absolute;
      background-color: var(--medium-gray-color);
      transition: all 0.3s ease;
      z-index: 1;
    }
    .circuit-active .wire { background-color: #39ff14; box-shadow: 0 0 15px #39ff14, 0 0 5px #39ff14; }
    .circuit-error .wire {
      background-color: var(--wrong-color);
      box-shadow: 0 0 10px var(--wrong-color);
    }
    .wire-top { top: 35px; left: 35px; right: 35px; height: 4px; }
    .wire-right { top: 35px; bottom: 35px; right: 35px; width: 4px; }
    .wire-bottom { bottom: 35px; left: 35px; right: 35px; height: 4px; }
    .wire-left { top: 35px; bottom: 35px; left: 35px; width: 4px; }

    .slot {
      position: absolute;
      width: 70px;
      height: 70px;
      background: white;
      border: 2px dashed var(--medium-gray-color);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: all 0.3s;
      font-size: 2.5rem;
    }
    .slot.drag-over {
      border-color: var(--primary-color);
      background: #e0f2fe;
    }
    .static-battery { top: 0; left: 50%; transform: translateX(-50%); border-style: solid; border-color: var(--medium-gray-color); cursor: default; } 
    .static-bulb { top: 50%; right: 0; transform: translateY(-50%); border-style: solid; border-color: var(--medium-gray-color); cursor: default; } 
    .slot-connector { bottom: 0; left: 50%; transform: translateX(-50%); } 

    .slot-label {
      position: absolute;
      top: -20px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--dark-gray-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bulb-glow {
      position: absolute;
      top: 50%; right: 0; transform: translateY(-50%) scale(1.5);
      width: 80px; height: 80px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(253,224,71,0.8) 0%, rgba(253,224,71,0) 70%);
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
      z-index: 5;
    }
    .circuit-active .bulb-glow {
      opacity: 1;
      animation: pulseGlow 1.5s infinite alternate;
    }
    @keyframes pulseGlow { 0% { transform: translateY(-50%) scale(1.5); opacity: 0.6; } 100% { transform: translateY(-50%) scale(2.2); opacity: 1; filter: drop-shadow(0 0 20px #fde047); } }

    @keyframes popJump { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-15px) scale(1.2); } }
    .swal-confetti { display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem; }
    .swal-confetti span { animation: popJump 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite alternate; }
    .swal-confetti span:nth-child(2) { animation-delay: 0.2s; }
    .swal-confetti span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes pulseScoreGlow { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
    @keyframes pulseGreenGlow { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }

    @keyframes errorVibrate {
      0% { transform: translateX(0); }
      20% { transform: translateX(-5px); }
      40% { transform: translateX(5px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
      100% { transform: translateX(0); }
    }
    .circuit-error {
      animation: errorVibrate 0.4s ease-in-out;
    }

    .has-tooltip {
      position: relative;
    }
    .has-tooltip .tooltip-text {
      visibility: hidden;
      opacity: 0;
      width: max-content;
      background-color: var(--secondary-color);
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 6px 12px;
      position: absolute;
      z-index: 100;
      bottom: 110%;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      transition: opacity 0.3s, transform 0.3s;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      pointer-events: none;
    }
    .has-tooltip .tooltip-text::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: var(--secondary-color) transparent transparent transparent;
    }
    .has-tooltip:hover .tooltip-text {
      visibility: visible;
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    
    .draggable-item.tested {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(100%);
      background-color: #f3f4f6;
    }
    .draggable-item.tested:active {
      transform: none;
    }
    .tested-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      color: white;
      border-radius: 50%;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .testing-conductor {
      animation: pulseConductor 1.5s infinite alternate;
      border: 2px solid #39ff14;
      background-color: #eaffea;
      border-radius: 50%;
    }
    .testing-insulator {
      animation: vibrateError 0.4s ease-in-out;
      border: 2px solid var(--wrong-color);
      background-color: #ffeaea;
      border-radius: 50%;
    }

    @keyframes pulseConductor {
      0% { box-shadow: 0 0 5px #39ff14; transform: scale(1); }
      100% { box-shadow: 0 0 20px #39ff14; transform: scale(1.1); }
    }

    .draggable-objects {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      width: 100%;
      min-height: 100px;
      padding: 1rem;
      background: #f1f5f9;
      border-radius: 1rem;
    }

    .draggable-item {
      font-size: 2.5rem;
      cursor: grab;
      transition: transform 0.2s;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      user-select: none;
      position: relative;
    }
    .draggable-item:active {
      cursor: grabbing;
      transform: scale(1.1);
    }
    .draggable-item.dragging {
      opacity: 0.5;
    }

    .placed-item {
      font-size: 2.5rem;
      cursor: pointer;
      user-select: none;
      animation: popInSlot 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes popInSlot {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
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
      color: var(--primary-color);
      margin-bottom: 2rem;
      font-size: 2rem;
      font-weight: 700;
    }
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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

    @media (max-width: 900px) {
      .game-layout {
        grid-template-columns: 1fr;
      }
      .objects-grid {
        grid-template-columns: repeat(6, 1fr);
      }
    }
    @media (max-width: 600px) { 
      .info-grid { grid-template-columns: 1fr; }
      .objects-grid { grid-template-columns: repeat(3, 1fr); }
    }
  `}</style>
);

const OBJECTS_CATALOG = [
    { id: 'clip', name: 'Clip de metal', type: 'material', icon: '📎', isConductor: true },
    { id: 'llave', name: 'Llave de bronce', type: 'material', icon: '🔑', isConductor: true },
    { id: 'clavo', name: 'Clavo de hierro', type: 'material', icon: '🔩', isConductor: true },
    { id: 'moneda', name: 'Moneda', type: 'material', icon: '🪙', isConductor: true },
    { id: 'aluminio', name: 'Papel Aluminio', type: 'material', icon: '📜', isConductor: true },
    { id: 'agua', name: 'Vaso con agua salada', type: 'material', icon: '💧', isConductor: true },
    { id: 'tenedor', name: 'Tenedor', type: 'material', icon: '🍴', isConductor: true },
    { id: 'anillo', name: 'Anillo de oro', type: 'material', icon: '💍', isConductor: true },
    { id: 'cobre', name: 'Cable de cobre', type: 'material', icon: '🔌', isConductor: true },
    { id: 'oro', name: 'Medalla de oro', type: 'material', icon: '🥇', isConductor: true },
    { id: 'alambre', name: 'Alambre de acero', type: 'material', icon: '🔗', isConductor: true },
    { id: 'madera', name: 'Madera', type: 'material', icon: '🪵', isConductor: false },
    { id: 'plastico', name: 'Plástico', type: 'material', icon: '🧴', isConductor: false },
    { id: 'goma', name: 'Goma', type: 'material', icon: '🧽', isConductor: false },
    { id: 'papel', name: 'Papel', type: 'material', icon: '📄', isConductor: false },
    { id: 'tela', name: 'Tela', type: 'material', icon: '👕', isConductor: false },
    { id: 'vidrio', name: 'Vaso de vidrio', type: 'material', icon: '🥃', isConductor: false },
    { id: 'globo', name: 'Globo', type: 'material', icon: '🎈', isConductor: false },
    { id: 'carton', name: 'Cartón', type: 'material', icon: '📦', isConductor: false },
    { id: 'lana', name: 'Lana', type: 'material', icon: '🧶', isConductor: false },
    { id: 'piedra', name: 'Piedra', type: 'material', icon: '🪨', isConductor: false },
    { id: 'hoja', name: 'Hoja seca', type: 'material', icon: '🍂', isConductor: false },
    { id: 'ceramica', name: 'Taza de cerámica', type: 'material', icon: '☕', isConductor: false },
    { id: 'cuero', name: 'Guante de cuero', type: 'material', icon: '🧤', isConductor: false }
];

const generateCircuitSwapCode = (gameDetails = {}, selectedPlatforms = ['web'], selectedObjectsArr = []) => {
    const titleText = gameDetails.gameName || 'CircuitSwap';
    const authorName = gameDetails.authorName || 'No especificado';
    const version = gameDetails.version || '1.0.0';
    const gameDesc = gameDetails.description || 'Juego de construcción de circuitos y prueba de materiales conductores.';
    const rawDate = (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    })();
    const formattedDate = (() => {
        try {
            const normalized = rawDate.includes('T') ? rawDate : rawDate + 'T00:00:00';
            return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Fecha no especificada'; }
    })();
    const platformsStr = selectedPlatforms && selectedPlatforms.length > 0
        ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
        : 'Web';

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleText}</title>
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
        
        .game-layout { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; width: 100%; margin-top: 1.5rem; }
        @media (max-width: 800px) { .game-layout { grid-template-columns: 1fr; } }

        .diagram-column { background: white; border: 1px solid var(--medium-gray); border-radius: var(--border-radius); padding: 1.5rem; display: flex; flex-direction: column; align-items: center; }
        
        /* CIRCUIT BOARD */
        .circuit-board { position: relative; width: 320px; height: 240px; margin: 2rem auto; border: 4px solid transparent; }
        .wire { position: absolute; background-color: var(--medium-gray); transition: all 0.3s ease; z-index: 1; }
        .circuit-active .wire { background-color: #39ff14; box-shadow: 0 0 15px #39ff14, 0 0 5px #39ff14; }
        .circuit-error .wire { background-color: var(--wrong); box-shadow: 0 0 10px var(--wrong); }
        .wire-top { top: 35px; left: 35px; right: 35px; height: 4px; }
        .wire-right { top: 35px; bottom: 35px; right: 35px; width: 4px; }
        .wire-bottom { bottom: 35px; left: 35px; right: 35px; height: 4px; }
        .wire-left { top: 35px; bottom: 35px; left: 35px; width: 4px; }

        .slot { position: absolute; width: 70px; height: 70px; background: white; border: 2px dashed var(--medium-gray); border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.3s; font-size: 2.5rem; }
        .slot.drag-over { border-color: var(--primary-color); background: #e0f2fe; }
        .static-battery { top: 0; left: 50%; transform: translateX(-50%); border-style: solid; border-color: var(--medium-gray); cursor: default; } 
        .static-bulb { top: 50%; right: 0; transform: translateY(-50%); border-style: solid; border-color: var(--medium-gray); cursor: default; } 
        .slot-connector { bottom: 0; left: 50%; transform: translateX(-50%); } 
        .slot-label { position: absolute; top: -20px; font-size: 0.75rem; font-weight: 700; color: var(--dark-gray); text-transform: uppercase; letter-spacing: 0.05em; }

        .bulb-glow { position: absolute; top: 50%; right: 0; transform: translateY(-50%) scale(1.5); width: 80px; height: 80px; border-radius: 50%; background: radial-gradient(circle, rgba(253,224,71,0.8) 0%, rgba(253,224,71,0) 70%); opacity: 0; transition: opacity 0.5s; pointer-events: none; z-index: 5; }
        .circuit-active .bulb-glow { opacity: 1; animation: pulseGlow 1.5s infinite alternate; }
        @keyframes pulseGlow { 0% { transform: translateY(-50%) scale(1.5); opacity: 0.6; } 100% { transform: translateY(-50%) scale(2.2); opacity: 1; filter: drop-shadow(0 0 20px #fde047); } }

        @keyframes popJump { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-15px) scale(1.2); } }
        .swal-confetti { display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem; }
        .swal-confetti span { animation: popJump 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite alternate; }
        .swal-confetti span:nth-child(2) { animation-delay: 0.2s; }
        .swal-confetti span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulseScoreGlow { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }

        @keyframes errorVibrate { 0% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } 100% { transform: translateX(0); } }
        .circuit-error { animation: errorVibrate 0.4s ease-in-out; }

        .has-tooltip { position: relative; }
        .has-tooltip .tooltip-text { visibility: hidden; opacity: 0; width: max-content; background-color: var(--secondary-color); color: #fff; text-align: center; border-radius: 6px; padding: 6px 12px; position: absolute; z-index: 100; bottom: 110%; left: 50%; transform: translateX(-50%) translateY(10px); transition: opacity 0.3s, transform 0.3s; font-size: 0.9rem; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); pointer-events: none; }
        .has-tooltip .tooltip-text::after { content: ""; position: absolute; top: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: var(--secondary-color) transparent transparent transparent; }
        .has-tooltip:hover .tooltip-text { visibility: visible; opacity: 1; transform: translateX(-50%) translateY(0); }
        
        .draggable-item.tested { opacity: 0.5; cursor: not-allowed; filter: grayscale(100%); background-color: #f3f4f6; }
        .draggable-item.tested:active { transform: none; }
        .tested-badge { position: absolute; top: -6px; right: -6px; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }

        .testing-conductor { animation: pulseConductor 1.5s infinite alternate; border: 2px solid #39ff14; background-color: #eaffea; border-radius: 50%; }

        @keyframes pulseConductor { 0% { box-shadow: 0 0 5px #39ff14; transform: scale(1); } 100% { box-shadow: 0 0 20px #39ff14; transform: scale(1.1); } }

        .draggable-objects { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; width: 100%; min-height: 100px; padding: 1rem; background: #f1f5f9; border-radius: 1rem; box-sizing: border-box; }
        .draggable-item { font-size: 2.5rem; cursor: grab; transition: transform 0.2s; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); user-select: none; position: relative; }
        .draggable-item:active { cursor: grabbing; transform: scale(1.1); }
        .draggable-item.dragging { opacity: 0.5; }
        .placed-item { font-size: 2.5rem; cursor: pointer; user-select: none; animation: popInSlot 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes popInSlot { 0% { transform: scale(0); } 100% { transform: scale(1); } }

        .stats-column { display: flex; flex-direction: column; gap: 1.5rem; }
        .stats-block { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: var(--border-radius); height: fit-content; background: white; }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); display: flex; align-items: center; gap: 0.5rem; }
        .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }
        
        .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: var(--border-radius); cursor: pointer; font-weight: bold; color: white; transition: background 0.2s; }
        .btn-primary { background: var(--primary-color); }
        .btn-primary:hover { background: #004b75; }
        
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; transition: opacity 0.3s; padding: 20px; box-sizing: border-box; }
        .hidden { display: none !important; opacity: 0; pointer-events: none; }
        
        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); color: white; border: none; border-radius: var(--border-radius); cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; min-width: 200px; }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        
        .btn-exit { background: #111827; }
        .btn-exit:hover { background: #000000; }
        .btn-retry { background: var(--primary-color); }
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }
        
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        .game-title { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        @keyframes wave-animation { 0%, 40%, 100% { transform: translateY(0); } 20% { transform: translateY(-20px); } }

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
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://unpkg.com/lucide@0.263.1/dist/umd/lucide.js"></script>

    <div id="start-screen" class="overlay">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; text-align: center; color: var(--secondary-color);">${titleText}</h1>
        <div style="background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">Objetivo: Armar circuito y probar materiales</div>
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

    <div id="end-screen" class="overlay hidden">
        <h1 id="end-title" style="color:var(--primary-color); font-size:3rem; font-weight: 800;">Juego Terminado</h1>
        <h2 style="color:var(--secondary-color); font-size:2rem; margin:1rem 0;">Puntos Obtenidos: <span id="final-score">0</span></h2>
        <div class="end-buttons" style="display:flex; gap:1rem;">
             <button class="big-btn btn-exit" onclick="exitGame()">Salir</button>
             <button class="big-btn btn-retry" onclick="location.reload()">Volver a Jugar</button>
        </div>
    </div>

    <div class="container" id="game-ui" style="display:none;">
        <div class="game-title" id="main-title"></div>
        
        <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
            <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
            <span style="font-size:1rem; color:#1e40af; font-weight:500;">¡Arma tu circuito! Elige el objeto conductor correcto y observa cómo se enciende el foco.</span>
        </div>

        <div class="game-layout">
            <div class="diagram-column">
                <div class="circuit-board" id="circuit-board">
                    <div class="wire wire-top"></div>
                    <div class="wire wire-right"></div>
                    <div class="wire wire-bottom"></div>
                    <div class="wire wire-left"></div>
                    
                    <div class="bulb-glow" id="bulb-glow"></div>

                    <div class="slot static-battery" id="static-battery">
                        <div class="placed-item has-tooltip" style="cursor: default; animation: none;">🔋<span class="tooltip-text">Pila</span></div>
                        <span class="slot-label">Pila</span>
                    </div>
                    <div class="slot static-bulb" id="static-bulb">
                        <div class="placed-item has-tooltip" style="cursor: default; animation: none;">💡<span class="tooltip-text">Foco</span></div>
                        <span class="slot-label">Foco</span>
                    </div>
                    <div class="slot slot-connector" data-type="connector" id="slot-connector">
                        <span class="slot-label">Conexión</span>
                    </div>
                </div>
                <div id="draggable-objects" class="draggable-objects"></div>
            </div>
            <div class="stats-column">
                <div class="stats-block">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg> Progreso
                    </h3>
                    <div class="stats-item" style="margin-top: 1rem;">
                        <span>Elemento Conductor:</span> <strong id="conductors-val" style="color: var(--primary-color)">0 / ${selectedObjectsArr.filter(o => o.isConductor).length}</strong>
                    </div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray); padding-top: 0.75rem; margin-top: 0.75rem;">
                        <span>Estado del circuito:</span> <strong id="circuit-status" style="color: var(--dark-gray)">Abierto</strong>
                    </div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray); padding-top: 0.75rem; margin-top: 0.75rem;">
                        <span>Tiempo:</span> <strong id="time-val" style="color: var(--primary-color); font-weight: bold;">00:00</strong>
                    </div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray); padding-top: 0.75rem; margin-top: 0.75rem;">
                        <span>Puntaje:</span> <strong id="score-val" style="color: var(--primary-color); font-size: 1.2rem;">0 pts</strong>
                    </div>
                    <button class="btn btn-primary" onclick="handleValidateSolution()" style="width: 100%;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Validar Solución</button>
                    <button class="btn btn-primary" onclick="handleFinishGame(false)" style="width: 100%;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Finalizar Juego</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const gameObjects = ${JSON.stringify(selectedObjectsArr)};
        let score = 0;
        let foundConductors = [];
        let testedObjects = [];
        const totalConductors = ${selectedObjectsArr.filter(o => o.isConductor).length};
        let placedSlots = { battery: null, bulb: null, connector: null };
        let isPlaying = false;
        let timeElapsed = 0;
        let timerInterval = null;

        function toggleInfo(show) {
            const m = document.getElementById('info-overlay');
            if (show) {
                m.classList.remove('hidden');
                m.style.display = 'flex';
            } else {
                m.classList.add('hidden');
                m.style.display = 'none';
            }
        }

        function formatTime(s) {
            const m = Math.floor(s / 60).toString().padStart(2, '0');
            const secs = (s % 60).toString().padStart(2, '0');
            return m + ':' + secs;
        }

        function formatTimeFriendly(s) {
            const m = Math.floor(s / 60);
            const secs = s % 60;
            if (m > 0) {
                return m + ' minuto' + (m !== 1 ? 's' : '') + ' y ' + secs + ' segundo' + (secs !== 1 ? 's' : '');
            }
            return secs + ' segundo' + (secs !== 1 ? 's' : '');
        }

        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeElapsed++;
                document.getElementById('time-val').innerText = formatTime(timeElapsed);
            }, 1000);
        }

        function initTitle() {
            const el = document.getElementById('main-title');
            el.innerHTML = 'Juego de CircuitSwap'.split('').map((c, i) => '<span style="animation-delay:'+(i*0.04)+'s">'+(c===' '?'&nbsp;':c)+'</span>').join('');
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const d = document.getElementById('countdown-display');
            d.innerText = count;
            const interval = setInterval(() => {
                count--;
                if(count > 0) { d.innerText = count; d.style.animation='none'; void d.offsetWidth; d.style.animation='popIn 0.5s ease-out'; }
                else { clearInterval(interval); document.getElementById('countdown-screen').classList.add('hidden'); startGame(); }
            }, 1000);
        }

        function exitGame() {
            window.close();
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
        }

        function renderObjects() {
            const container = document.getElementById('draggable-objects');
            container.innerHTML = '';
            gameObjects.forEach(obj => {
                // If object is placed in a slot, don't render it here
                if(Object.values(placedSlots).some(p => p && p.id === obj.id)) return;
                
                const isTested = testedObjects.includes(obj.id);
                
                const el = document.createElement('div');
                el.className = 'draggable-item has-tooltip' + (isTested ? ' tested' : '');
                el.draggable = isPlaying && !isTested;
                el.id = obj.id;
                el.innerText = obj.icon;
                
                const tooltip = document.createElement('span');
                tooltip.className = 'tooltip-text';
                tooltip.innerText = obj.name;
                el.appendChild(tooltip);

                if (isTested) {
                    const badge = document.createElement('div');
                    badge.className = 'tested-badge';
                    badge.style.backgroundColor = obj.isConductor ? 'var(--correct)' : 'var(--wrong)';
                    badge.innerText = obj.isConductor ? '✓' : '✕';
                    el.appendChild(badge);
                }
                
                el.addEventListener('dragstart', (e) => {
                    if(!isPlaying || isTested) { e.preventDefault(); return; }
                    e.dataTransfer.setData('text/plain', obj.id);
                    setTimeout(() => el.classList.add('dragging'), 0);
                });
                
                el.addEventListener('dragend', () => {
                    el.classList.remove('dragging');
                });
                
                container.appendChild(el);
            });
        }

        function startGame() {
            document.getElementById('game-ui').style.display = 'flex';
            initTitle();
            isPlaying = true;
            timeElapsed = 0;
            document.getElementById('time-val').innerText = '00:00';
            startTimer();
            try { if (typeof lucide !== 'undefined') lucide.createIcons(); } catch(e) {}
            
            renderObjects();
            
            ['connector'].forEach(slotType => {
                const slotEl = document.getElementById('slot-' + slotType);
                slotEl.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if(!placedSlots[slotType]) slotEl.classList.add('drag-over');
                });
                slotEl.addEventListener('dragleave', () => {
                    slotEl.classList.remove('drag-over');
                });
                slotEl.addEventListener('drop', (e) => {
                    e.preventDefault();
                    slotEl.classList.remove('drag-over');
                    if(!isPlaying || placedSlots[slotType]) return;
                    
                    const id = e.dataTransfer.getData('text/plain');
                    const objData = gameObjects.find(o => o.id === id);
                    if(!objData) return;
                    
                    placedSlots[slotType] = objData;
                    
                    // Render inside slot
                    const innerEl = document.createElement('div');
                    innerEl.className = 'placed-item has-tooltip';
                    innerEl.innerText = objData.icon;
                    innerEl.id = 'placed-connector';
                    
                    const tooltip = document.createElement('span');
                    tooltip.className = 'tooltip-text';
                    tooltip.innerText = objData.name + ' (Clic para quitar)';
                    innerEl.appendChild(tooltip);

                    innerEl.onclick = () => {
                        if(!isPlaying) return;
                        placedSlots[slotType] = null;
                        slotEl.innerHTML = '<span class="slot-label">' + slotEl.getAttribute('data-type') + '</span>';
                        if (slotType === 'battery') slotEl.innerHTML = '<span class="slot-label">Pila</span>';
                        if (slotType === 'bulb') slotEl.innerHTML = '<span class="slot-label">Foco</span>';
                        if (slotType === 'connector') slotEl.innerHTML = '<span class="slot-label">Conexión</span>';
                        
                        document.getElementById('circuit-board').classList.remove('circuit-active', 'circuit-error');
                        renderObjects();
                    };
                    slotEl.appendChild(innerEl);
                    renderObjects();
                });
            });
        }

        function handleValidateSolution() {
            if (!isPlaying) return;
            const cb = document.getElementById('circuit-board');
            cb.classList.remove('circuit-active', 'circuit-error');

            const connectorObj = placedSlots.connector;

            if (!connectorObj) {
                cb.classList.add('circuit-error');
                Swal.fire('Atención', 'Coloca un material en el espacio de conexión para probar si es conductor.', 'warning');
                setTimeout(() => cb.classList.remove('circuit-error'), 400);
                return;
            }

        if (!testedObjects.includes(connectorObj.id)) {
            testedObjects.push(connectorObj.id);
        }

        const placedConnector = document.getElementById('placed-connector');

        if (connectorObj.isConductor) {
            document.getElementById('circuit-board').classList.add('circuit-active');
            document.getElementById('circuit-status').innerText = 'Cerrado (Conductor)';
            if (placedConnector) placedConnector.classList.add('testing-conductor');
            
            let pointGained = false;
            if (!foundConductors.includes(connectorObj.id)) {
                foundConductors.push(connectorObj.id);
                score += 1;
                pointGained = true;
                document.getElementById('conductors-val').innerText = score + ' / ' + totalConductors;
                document.getElementById('score-val').innerText = score + ' pts';
            }
            
            if (foundConductors.length === totalConductors) {
                clearInterval(timerInterval);
                setTimeout(() => {
                    isPlaying = false;
                    Swal.fire({
                        title: '¡Juego Completado!',
                        html: \`
                          <div class="swal-confetti">
                            <span style="font-size: 3rem;">🌟</span>
                            <span style="font-size: 3rem;">🏆</span>
                            <span style="font-size: 3rem;">🌟</span>
                          </div>
                          <p style="font-size: 1.1rem; margin-bottom: 0;">Has encontrado todos los materiales conductores en <strong>\${formatTimeFriendly(timeElapsed)}</strong>. Ganaste <strong>\${score}</strong> puntos.</p>
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
                            window.close();
                            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            startGame();
                        }
                    });
                }, 1200);
            } else {
                setTimeout(() => {
                    Swal.fire({
                        title: '¡Correcto!',
                        html: \`
                          <p style="font-size: 1.1rem; margin-bottom: 0;">¡Muy bien! El <strong>\${connectorObj.name}</strong> es un material conductor.</p>
                          \${pointGained ? '<div style="font-size: 1.1rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGreenGlow 1.5s infinite;">✨ +1 Punto</div>' : ''}
                        \`,
                        icon: 'success',
                        confirmButtonText: 'Continuar',
                        confirmButtonColor: '#0077b6'
                    });
                }, 800);
            }
        } else {
            document.getElementById('circuit-board').classList.add('circuit-error');
            document.getElementById('circuit-status').innerText = 'Abierto';
            if (placedConnector) placedConnector.classList.add('testing-insulator');
            
            setTimeout(() => {
                Swal.fire({
                    title: '¡Aislante!',
                    html: \`
                      <p style="font-size: 1.1rem; margin-bottom: 0;">¡Oh no! El foco no enciende porque el <strong>\${connectorObj.name}</strong> es un material aislante.</p>
                      <div style="font-size: 1.1rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
                        0 Puntos obtenidos
                      </div>
                    \`,
                    icon: 'error',
                    confirmButtonText: 'Continuar',
                    confirmButtonColor: '#0077b6'
                });
                document.getElementById('circuit-board').classList.remove('circuit-error');
                if (placedConnector) placedConnector.classList.remove('testing-insulator');
            }, 800);
        }
    }

    function handleFinishGame() {
        clearInterval(timerInterval);
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
                isPlaying = false;
                exitGame();
            }
        });
    }
    </script>
</body>
</html>`;
};

const CircuitSwap = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [view, setView] = useState('home');
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [foundConductors, setFoundConductors] = useState([]);
    const [testedObjects, setTestedObjects] = useState([]);
    const [circuitAnim, setCircuitAnim] = useState('');
    const [placedSlots, setPlacedSlots] = useState({ battery: { id: 'battery' }, bulb: { id: 'bulb' }, connector: null });
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const jsZipReady = true;
    const [gameDetailsWithDate, setGameDetailsWithDate] = useState({});
    const [selectedPlatforms, setSelectedPlatforms] = useState(['web']);
    const [selectedObjects, setSelectedObjects] = useState([]);
    const [dragOverSlot, setDragOverSlot] = useState(null);
    const [draggedItemId, setDraggedItemId] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${m}:${secs}`;
    };

    const formatTimeFriendly = (s) => {
        const m = Math.floor(s / 60);
        const secs = s % 60;
        if (m > 0) {
            return `${m} minuto${m !== 1 ? 's' : ''} y ${secs} segundo${secs !== 1 ? 's' : ''}`;
        }
        return `${secs} segundo${secs !== 1 ? 's' : ''}`;
    };

    useEffect(() => {
        let timer;
        if (isPlaying) {
            timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [isPlaying]);

    const handleDragStart = (e, obj) => {
        if (!isPlaying) return;
        e.dataTransfer.setData('text/plain', obj.id);
        setDraggedItemId(obj.id);
    };

    const handleDragOver = (e, slotType) => {
        e.preventDefault();
        if (!placedSlots[slotType]) {
            setDragOverSlot(slotType);
        }
    };

    const handleDragLeave = () => {
        setDragOverSlot(null);
    };

    const handleDrop = (e, slotType) => {
        e.preventDefault();
        setDragOverSlot(null);
        if (!isPlaying || placedSlots[slotType]) return;

        const id = e.dataTransfer.getData('text/plain');
        const objData = selectedObjects.find(o => o.id === id);
        if (!objData) return;

        setPlacedSlots(prev => ({ ...prev, [slotType]: objData }));
    };

    const handleRemoveFromSlot = (slotType) => {
        if (!isPlaying) return;
        setPlacedSlots(prev => ({ ...prev, [slotType]: null }));
        setCircuitAnim('');
    };

    // Siempre usar la fecha actual del sistema (equipo del usuario) — igual que Acertijo.jsx
    const getFixedCreationDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    };



    const toggleObjectSelection = (obj) => {
        if (selectedObjects.find(o => o.id === obj.id)) {
            setSelectedObjects(selectedObjects.filter(o => o.id !== obj.id));
        } else {
            if (selectedObjects.length < 8) {
                if (!obj.isConductor) {
                    const nonConductorsCount = selectedObjects.filter(o => !o.isConductor).length;
                    if (nonConductorsCount >= 4) {
                        Swal.fire({
                            title: 'Atención',
                            text: 'Debes incluir al menos 4 materiales conductores en tu selección final de 8 elementos. ¡Prueba a seleccionar otros materiales!',
                            icon: 'info',
                            confirmButtonColor: '#0077b6'
                        });
                        return;
                    }
                }
                setSelectedObjects([...selectedObjects, obj]);
            } else {
                Swal.fire('Límite alcanzado', 'Solo puedes seleccionar 8 materiales.', 'warning');
            }
        }
    };

    const startNewGame = () => {
        if (selectedObjects.length !== 8) return;
        const conductors = selectedObjects.filter(o => o.isConductor).length;
        if (conductors < 4) return;

        setPlacedSlots({ battery: { id: 'battery' }, bulb: { id: 'bulb' }, connector: null });
        setScore(0);
        setFoundConductors([]);
        setTestedObjects([]);
        setCircuitAnim('');
        setTimeElapsed(0);
        setIsPlaying(true);
        setView('play');
    };

    const goToSummary = () => {
        setView('summary');
    };

    const goToHome = () => {
        setView('home');
    };

    const handleValidateSolution = () => {
        if (!isPlaying) return;
        const connectorObj = placedSlots.connector;

        if (!connectorObj) {
            setCircuitAnim('error');
            Swal.fire('Atención', 'Coloca un material en el espacio de conexión para probar si es conductor.', 'warning');
            setTimeout(() => setCircuitAnim(''), 400);
            return;
        }

        if (!testedObjects.includes(connectorObj.id)) {
            setTestedObjects(prev => [...prev, connectorObj.id]);
        }

        if (connectorObj.isConductor) {
            setCircuitAnim('active');
            let updatedFound = [...foundConductors];
            let pointGained = false;
            if (!updatedFound.includes(connectorObj.id)) {
                updatedFound.push(connectorObj.id);
                setFoundConductors(updatedFound);
                setScore(prev => prev + 1);
                pointGained = true;
            }
            const totalConductors = selectedObjects.filter(o => o.isConductor).length;

            if (updatedFound.length === totalConductors) {
                setIsPlaying(false);
                setTimeout(() => {
                    Swal.fire({
                        title: '¡Juego Completado!',
                        html: `
                          <div class="swal-confetti">
                            <span style="font-size: 3rem;">🌟</span>
                            <span style="font-size: 3rem;">🏆</span>
                            <span style="font-size: 3rem;">🌟</span>
                          </div>
                          <p style="font-size: 1.1rem; margin-bottom: 0;">Has encontrado todos los materiales conductores en <strong>${formatTimeFriendly(timeElapsed)}</strong>. Ganaste <strong>${updatedFound.length}</strong> puntos.</p>
                          <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                            Puntaje Total: ${updatedFound.length}
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
                }, 1200);
            } else {
                setTimeout(() => {
                    Swal.fire({
                        title: '¡Correcto!',
                        html: `
                          <p style="font-size: 1.1rem; margin-bottom: 0;">¡Muy bien! El <strong>${connectorObj.name}</strong> es un material conductor.</p>
                          ${pointGained ? '<div style="font-size: 1.1rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGreenGlow 1.5s infinite;">✨ +1 Punto</div>' : ''}
                        `,
                        icon: 'success',
                        confirmButtonText: 'Continuar',
                        confirmButtonColor: '#0077b6'
                    });
                }, 800);
            }
        } else {
            setCircuitAnim('error');
            setTimeout(() => {
                Swal.fire({
                    title: '¡Aislante!',
                    html: `
                      <p style="font-size: 1.1rem; margin-bottom: 0;">¡Oh no! El foco no enciende porque el <strong>${connectorObj.name}</strong> es un material aislante.</p>
                      <div style="font-size: 1.1rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
                        0 Puntos obtenidos
                      </div>
                    `,
                    icon: 'error',
                    confirmButtonText: 'Continuar',
                    confirmButtonColor: '#0077b6'
                });
                setCircuitAnim('');
            }, 800);
        }
    };

    const handleFinishGame = () => {
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
                setIsPlaying(false);
                goToHome();
            }
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
                slug: 'circuitswap', details: gameDetailsWithDate, platforms: selectedPlatforms,
                options: { objetos: selectedObjects }, htmlContent: generateCircuitSwapCode(gameDetailsWithDate, selectedPlatforms, selectedObjects), webAssets: [],
                onStatus: (status) => { setStatusText(status); setProgress(current => Math.min(90, current + 15)); }
            });
            downloadGameArchive(result.blob, result.fileName);
            setProgress(100); setStatusText('¡Descarga iniciada!');
        } catch (error) {
            console.error(error); setStatusText(error?.message || 'Error al generar el paquete.');
        } finally { setIsGenerating(false); }
    };

    const renderSetupScreen = () => {
        const gameIcon = location.state?.selectedGame?.icon || "/images/juegos/circuitswap.png";
        return (
            <div className="catalog-screen">
                <div className="game-title">
                    {'Juego de CircuitSwap'.split('').map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src={gameIcon} alt="CircuitSwap" className="game-preview-image" onError={(e) => { e.target.style.display = 'none'; }} />
                    <span className="game-info-badge">Ciencia y Lógica</span>
                </div>

                <div className="rules-banner">
                    <h2><HelpCircle size={22} /> Construcción de Circuitos</h2>
                    <p>
                        Explora la conductividad eléctrica configurando tu propio laboratorio virtual. Selecciona exactamente 8 materiales para tu experimento, asegurándote de incluir al menos 4 objetos conductores que permitan cerrar el circuito y encender el foco.
                    </p>
                </div>

                <div style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--medium-gray-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--secondary-color)' }}>Elementos disponibles</h3>
                        <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                            {selectedObjects.length} / 8 Seleccionados
                        </span>
                    </div>
                    <div className="objects-grid">
                        {OBJECTS_CATALOG.map(obj => {
                            const isSelected = selectedObjects.find(o => o.id === obj.id);
                            return (
                                <div
                                    key={obj.id}
                                    className={`object-item ${isSelected ? 'selected' : ''}`}
                                    style={{ cursor: 'pointer', opacity: isSelected ? 1 : 0.6 }}
                                    onClick={() => toggleObjectSelection(obj)}
                                >
                                    <div className="object-icon">{obj.icon}</div>
                                    <div className="object-name">{obj.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="catalog-actions">
                    <button className="no-rounded-button btn-primary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} /> Anterior
                    </button>
                    <button
                        className="no-rounded-button btn-primary"
                        onClick={startNewGame}
                        disabled={selectedObjects.length !== 8 || selectedObjects.filter(o => o.isConductor).length < 4}
                        style={{ opacity: (selectedObjects.length === 8 && selectedObjects.filter(o => o.isConductor).length >= 4) ? 1 : 0.5 }}
                    >
                        <ArrowRight size={18} /> Siguiente
                    </button>
                </div>
            </div>
        );
    };

    const renderGameScreen = () => {
        const unplacedObjects = selectedObjects.filter(obj =>
            !Object.values(placedSlots).find(p => p && p.id === obj.id)
        );

        return (
            <div className="game-screen">
                <div className="game-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    {'Juego de CircuitSwap'.split('').map((char, index) => (
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
                        Arma tu circuito! elige el objeto conductor correcto y observa cómo se enciende el foco!
                    </span>
                </div>

                <div className="game-layout">
                    <div className="game-main-col">
                        <div className={`circuit-board ${circuitAnim === 'active' ? 'circuit-active' : ''} ${circuitAnim === 'error' ? 'circuit-error' : ''}`}>
                            <div className="wire wire-top"></div>
                            <div className="wire wire-right"></div>
                            <div className="wire wire-bottom"></div>
                            <div className="wire wire-left"></div>

                            <div className="bulb-glow"></div>

                            <div className="slot static-battery">
                                <div className="placed-item has-tooltip" style={{ cursor: 'default', animation: 'none' }}>
                                    🔋
                                    <span className="tooltip-text">Pila</span>
                                </div>
                                <span className="slot-label">Pila</span>
                            </div>
                            <div className="slot static-bulb">
                                <div className="placed-item has-tooltip" style={{ cursor: 'default', animation: 'none' }}>
                                    💡
                                    <span className="tooltip-text">Foco</span>
                                </div>
                                <span className="slot-label">Foco</span>
                            </div>
                            <div
                                className={`slot slot-connector ${dragOverSlot === 'connector' ? 'drag-over' : ''}`}
                                onDragOver={(e) => handleDragOver(e, 'connector')}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 'connector')}
                            >
                                {!placedSlots['connector'] ? (
                                    <span className="slot-label">Conexión</span>
                                ) : (
                                    <div
                                        className={`placed-item has-tooltip ${circuitAnim === 'active' && placedSlots['connector'] ? 'testing-conductor' : ''} ${circuitAnim === 'error' && placedSlots['connector'] ? 'testing-insulator' : ''}`}
                                        onClick={() => handleRemoveFromSlot('connector')}
                                    >
                                        {placedSlots['connector'].icon}
                                        <span className="tooltip-text">{placedSlots['connector'].name} (Clic para quitar)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="draggable-objects">
                            {unplacedObjects.map(obj => {
                                const isTested = testedObjects.includes(obj.id);
                                return (
                                    <div
                                        key={obj.id}
                                        className={`draggable-item has-tooltip ${draggedItemId === obj.id ? 'dragging' : ''} ${isTested ? 'tested' : ''}`}
                                        draggable={isPlaying && !isTested}
                                        onDragStart={(e) => {
                                            if (isTested) { e.preventDefault(); return; }
                                            handleDragStart(e, obj);
                                        }}
                                        onDragEnd={() => setDraggedItemId(null)}
                                    >
                                        {obj.icon}
                                        <span className="tooltip-text">{obj.name}</span>
                                        {isTested && (
                                            <div className="tested-badge" style={{ backgroundColor: obj.isConductor ? 'var(--correct-color)' : 'var(--wrong-color)' }}>
                                                {obj.isConductor ? '✓' : '✕'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="game-right-col">
                        <div className="stats-block">
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Trophy size={18} /> Progreso
                            </h3>
                            <div className="stats-item" style={{ marginTop: '1rem' }}>
                                <span>Elemento Conductor:</span> <strong style={{ color: 'var(--primary-color)' }}>{score} / {selectedObjects.filter(o => o.isConductor).length}</strong>
                            </div>
                            <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                                <span>Estado del circuito:</span> <strong style={{ color: 'var(--dark-gray-color)' }}>{circuitAnim === 'active' ? 'Cerrado (Conductor)' : 'Abierto'}</strong>
                            </div>
                            <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                                <span>Tiempo:</span> <strong style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{formatTime(timeElapsed)}</strong>
                            </div>
                            <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                                <span>Puntaje:</span> <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{score} pts</strong>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                                <button
                                    className="no-rounded-button btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--primary-color)' }}
                                    onClick={handleValidateSolution}
                                >
                                    <CheckCircle size={16} /> Validar Solución
                                </button>
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
        const selectedAreas = location.state?.selectedAreas || [];
        const selectedSkills = location.state?.selectedSkills || [];
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

                <div className="summary-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
                            <div className="info-card-value">{gameDetailsWithDate.gameName || 'CircuitSwap'}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-header"><Type size={16} /> Nombre del Autor</div>
                            <div className="info-card-value">{gameDetailsWithDate.authorName || 'No especificado'}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-header"><Layers size={16} /> Versión</div>
                            <div className="info-card-value">{gameDetailsWithDate.version || '1.0.0'}</div>
                        </div>
                        <div className="info-card full-width">
                            <div className="info-card-header"><FileText size={16} /> Descripción</div>
                            <div className="info-card-value">
                                {gameDetailsWithDate.description || 'Juego de construcción de circuitos y prueba de materiales conductores.'}
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-header"><Calendar size={16} /> Fecha de Creación</div>
                            <div className="info-card-value">{formatDate(gameDetailsWithDate.date)}</div>
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
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Layers size={18} /> Elementos Seleccionados:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{selectedObjects.length}</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Tiempo:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>Cronómetro progresivo</strong>
                        </div>
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <button className="btn-primary" onClick={goToHome} disabled={isGenerating}
                            style={{ opacity: isGenerating ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s', border: 'none', background: 'var(--primary-color)', color: 'white', fontSize: '1rem' }}>
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
                        className="btn-primary btn-success"
                        onClick={handleSmartDownload}
                        disabled={isGenerating || !jsZipReady}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            boxShadow: '0 4px 14px 0 rgba(0, 95, 146, 0.35)',
                            minWidth: '240px', justifyContent: 'center',
                            fontSize: '1rem', padding: '0.85rem 2rem',
                            cursor: (isGenerating || !jsZipReady) ? 'wait' : 'pointer',
                            opacity: (isGenerating || !jsZipReady) ? 0.8 : 1,
                            borderRadius: '0.75rem', fontWeight: '700', letterSpacing: '0.02em',
                            background: 'var(--primary-color)', color: 'white', border: 'none'
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
            <div className="circuitswap-container">
                {view === 'home' && renderSetupScreen()}
                {view === 'play' && renderGameScreen()}
                {view === 'summary' && renderSummaryScreen()}
            </div>
        </>
    );
};

export default CircuitSwap;
