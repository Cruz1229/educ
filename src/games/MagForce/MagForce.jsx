import { buildMissingMobileDownload } from '../../utils/missingMobileGames';
import { downloadGameArchive } from '../../utils/gameDownloadPackaging';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Trophy, ArrowLeft, ArrowRight, Tag, Layers, FileText,
    Calendar, Monitor, HelpCircle, Type, X, CheckSquare, Shapes, Puzzle, CheckCircle,
    Magnet, Check, Play, Clock
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

    .has-tooltip {
      position: relative;
    }
    .has-tooltip:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 110%;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(17, 24, 39, 0.9);
      color: white;
      padding: 0.4rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      white-space: nowrap;
      z-index: 50;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      pointer-events: none;
    }
    .has-tooltip:hover::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-width: 5px;
      border-style: solid;
      border-color: rgba(17, 24, 39, 0.9) transparent transparent transparent;
      z-index: 50;
      pointer-events: none;
    }

    .testing-magnetic {
      animation: pulseMagnetic 1s infinite;
      border: 3px solid var(--correct-color) !important;
      background-color: #dcfce7 !important;
      box-shadow: 0 0 15px var(--correct-color) !important;
    }
    @keyframes pulseMagnetic {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }

    .testing-non-magnetic {
      animation: vibrateNonMagnetic 0.3s ease-in-out infinite;
      border: 3px solid var(--wrong-color) !important;
      background-color: #fee2e2 !important;
      box-shadow: 0 0 15px var(--wrong-color) !important;
    }
    @keyframes vibrateNonMagnetic {
      0% { transform: translate(0); }
      20% { transform: translate(-3px, 3px); }
      40% { transform: translate(-3px, -3px); }
      60% { transform: translate(3px, 3px); }
      80% { transform: translate(3px, -3px); }
      100% { transform: translate(0); }
    }

    .tested-item {
      filter: grayscale(100%);
      opacity: 0.6;
      cursor: not-allowed !important;
      pointer-events: none;
    }

    .result-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: bold;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .badge-correct { background-color: var(--correct-color); }
    .badge-wrong { background-color: var(--wrong-color); }

    .magforce-container {
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
    .no-rounded-button.btn-primary:hover:not(:disabled) { background-color: #005f92; }

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
      cursor: pointer;
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
    .object-item:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
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
    }

    .magnet-zone {
      width: 100%;
      height: 280px;
      border: 3px dashed var(--medium-gray-color);
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      background: #f8fafc;
      transition: all 0.3s;
      overflow: hidden;
    }
    .magnet-zone.drag-over {
      border-color: var(--primary-color);
      background: #e0f2fe;
    }

    .magnet-image {
      font-size: 7rem;
      z-index: 2;
      animation: pulseMagnet 2s infinite;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    @keyframes pulseMagnet {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    @keyframes magnetVibrate {
      0% { transform: translate(0, 0) rotate(0deg) scale(1.05); }
      10% { transform: translate(-5px, -5px) rotate(-10deg) scale(1.1); }
      20% { transform: translate(5px, -5px) rotate(10deg) scale(1.1); }
      30% { transform: translate(-5px, 5px) rotate(-10deg) scale(1.1); }
      40% { transform: translate(5px, 5px) rotate(10deg) scale(1.1); }
      50% { transform: translate(-5px, -5px) rotate(-10deg) scale(1.1); }
      60% { transform: translate(5px, -5px) rotate(10deg) scale(1.1); }
      70% { transform: translate(-5px, 5px) rotate(-10deg) scale(1.1); }
      80% { transform: translate(5px, 5px) rotate(10deg) scale(1.1); }
      90% { transform: translate(-5px, -5px) rotate(-10deg) scale(1.1); }
      100% { transform: translate(0, 0) rotate(0deg) scale(1); }
    }
    .magnet-vibrate {
      animation: magnetVibrate 0.5s ease-in-out !important;
    }

    .magnetic-waves-1, .magnetic-waves-2, .magnetic-waves-3 {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      border: 4px solid #3b82f6;
      opacity: 0;
      pointer-events: none;
      z-index: 1;
    }
    .magnet-active .magnetic-waves-1 { animation: ripple 0.8s ease-out; }
    .magnet-active .magnetic-waves-2 { animation: ripple 0.8s ease-out 0.15s; }
    .magnet-active .magnetic-waves-3 { animation: ripple 0.8s ease-out 0.3s; border-color: #8b5cf6; }

    @keyframes ripple {
      0% { width: 120px; height: 120px; opacity: 0.8; border-width: 8px; }
      100% { width: 350px; height: 350px; opacity: 0; border-width: 0px; }
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
      font-size: 3rem;
      cursor: grab;
      transition: transform 0.2s;
      width: 70px;
      height: 70px;
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
    .draggable-item.placed {
      position: absolute;
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: default;
      box-shadow: none;
      background: transparent;
      z-index: 3;
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
      color: #005f92;
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

    @media (max-width: 900px) {
      .game-layout {
        grid-template-columns: 1fr;
      }
      .objects-grid {
        grid-template-columns: repeat(8, 1fr);
      }
    }
    @media (max-width: 600px) { 
      .info-grid { grid-template-columns: 1fr; }
      .objects-grid { grid-template-columns: repeat(4, 1fr); }
    }
  `}</style>
);

const OBJECTS_CATALOG = [
    { id: 'clip', name: 'Clip', isMagnetic: true, icon: '📎' },
    { id: 'nail', name: 'Clavo de hierro', isMagnetic: true, icon: '📌' },
    { id: 'wrench', name: 'Llave inglesa', isMagnetic: true, icon: '🔧' },
    { id: 'nut', name: 'Tuerca de acero', isMagnetic: true, icon: '🔩' },
    { id: 'scissors', name: 'Tijeras', isMagnetic: true, icon: '✂️' },
    { id: 'spoon', name: 'Cuchara de metal', isMagnetic: true, icon: '🥄' },
    { id: 'key', name: 'Llave de hierro', isMagnetic: true, icon: '🔑' },
    { id: 'padlock', name: 'Candado', isMagnetic: true, icon: '🔒' },
    { id: 'bottle', name: 'Botella de plástico', isMagnetic: false, icon: '🧴' },
    { id: 'eraser', name: 'Goma', isMagnetic: false, icon: '🧽' },
    { id: 'pencil', name: 'Lápiz', isMagnetic: false, icon: '✏️' },
    { id: 'wood', name: 'Madera', isMagnetic: false, icon: '🪵' },
    { id: 'apple', name: 'Manzana', isMagnetic: false, icon: '🍎' },
    { id: 'glass', name: 'Vaso de vidrio', isMagnetic: false, icon: '🥛' },
    { id: 'book', name: 'Cuaderno', isMagnetic: false, icon: '📓' },
    { id: 'coin', name: 'Moneda de acero', isMagnetic: true, icon: '🪙' },
    { id: 'ruler', name: 'Regla de plástico', isMagnetic: false, icon: '📏' },
    { id: 'ball', name: 'Pelota', isMagnetic: false, icon: '🏀' },
    { id: 'paper', name: 'Papel', isMagnetic: false, icon: '📄' },
    { id: 'pin', name: 'Alfiler', isMagnetic: true, icon: '📍' },
    { id: 'brick', name: 'Ladrillo', isMagnetic: false, icon: '🧱' },
    { id: 'pan', name: 'Sartén de hierro', isMagnetic: true, icon: '🍳' },
    { id: 'shoe', name: 'Zapato', isMagnetic: false, icon: '👞' },
    { id: 'ring', name: 'Anillo de oro', isMagnetic: false, icon: '💍' }
];

const generateMagForceCode = (selectedObjects, gameDetails = {}, selectedPlatforms = ['web']) => {
    const titleText = gameDetails.gameName || 'MagForce';
    const authorName = gameDetails.authorName || 'No especificado';
    const version = gameDetails.version || '1.0.0';
    const gameDesc = gameDetails.description || 'Juego de arrastrar y soltar para identificar objetos magnéticos.';
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
        
        .magnet-zone { width: 100%; height: 280px; border: 3px dashed var(--medium-gray); border-radius: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background: #f8fafc; transition: all 0.3s; overflow: hidden; margin-bottom: 1rem;}
        .magnet-zone.drag-over { border-color: var(--primary-color); background: #e0f2fe; }
        .magnet-image { font-size: 7rem; z-index: 2; animation: pulseMagnet 2s infinite; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
        @keyframes pulseMagnet { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

        @keyframes magnetVibrate {
          0% { transform: translate(0, 0) rotate(0deg) scale(1.05); }
          10% { transform: translate(-5px, -5px) rotate(-10deg) scale(1.1); }
          20% { transform: translate(5px, -5px) rotate(10deg) scale(1.1); }
          30% { transform: translate(-5px, 5px) rotate(-10deg) scale(1.1); }
          40% { transform: translate(5px, 5px) rotate(10deg) scale(1.1); }
          50% { transform: translate(-5px, -5px) rotate(-10deg) scale(1.1); }
          60% { transform: translate(5px, -5px) rotate(10deg) scale(1.1); }
          70% { transform: translate(-5px, 5px) rotate(-10deg) scale(1.1); }
          80% { transform: translate(5px, 5px) rotate(10deg) scale(1.1); }
          90% { transform: translate(-5px, -5px) rotate(-10deg) scale(1.1); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }
        .magnet-vibrate { animation: magnetVibrate 0.5s ease-in-out !important; }

        @keyframes magnetVibrateError {
          0% { transform: translate(0, 0) rotate(0deg) scale(1.05); }
          20% { transform: translate(-10px, 0) scale(1.1); }
          40% { transform: translate(10px, 0) scale(1.1); }
          60% { transform: translate(-10px, 0) scale(1.1); }
          80% { transform: translate(10px, 0) scale(1.1); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }
        .magnet-vibrate-error { animation: magnetVibrateError 0.5s ease-in-out !important; }
        .magnet-zone.magnet-error { border-color: var(--wrong) !important; background: #fef2f2 !important; }
        .magnetic-waves-1, .magnetic-waves-2, .magnetic-waves-3 { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 50%; border: 4px solid #3b82f6; opacity: 0; pointer-events: none; z-index: 1; }
        .magnet-active .magnetic-waves-1 { animation: ripple 0.8s ease-out; }
        .magnet-active .magnetic-waves-2 { animation: ripple 0.8s ease-out 0.15s; }
        .magnet-active .magnetic-waves-3 { animation: ripple 0.8s ease-out 0.3s; border-color: #8b5cf6; }
        @keyframes ripple { 0% { width: 120px; height: 120px; opacity: 0.8; border-width: 8px; } 100% { width: 350px; height: 350px; opacity: 0; border-width: 0px; } }

        .has-tooltip { position: relative; }
        .has-tooltip:hover::after { content: attr(data-tooltip); position: absolute; bottom: 110%; left: 50%; transform: translateX(-50%); background-color: rgba(17, 24, 39, 0.9); color: white; padding: 0.4rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; white-space: nowrap; z-index: 50; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); pointer-events: none; }
        .has-tooltip:hover::before { content: ''; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); border-width: 5px; border-style: solid; border-color: rgba(17, 24, 39, 0.9) transparent transparent transparent; z-index: 50; pointer-events: none; }

        .testing-magnetic { animation: pulseMagnetic 1s infinite; border: 3px solid var(--correct) !important; background-color: #dcfce7 !important; box-shadow: 0 0 15px var(--correct) !important; }
        @keyframes pulseMagnetic { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }

        .testing-non-magnetic { animation: vibrateNonMagnetic 0.3s ease-in-out infinite; border: 3px solid var(--wrong) !important; background-color: #fee2e2 !important; box-shadow: 0 0 15px var(--wrong) !important; }
        @keyframes vibrateNonMagnetic { 0% { transform: translate(0); } 20% { transform: translate(-3px, 3px); } 40% { transform: translate(-3px, -3px); } 60% { transform: translate(3px, 3px); } 80% { transform: translate(3px, -3px); } 100% { transform: translate(0); } }

        .tested-item { filter: grayscale(100%); opacity: 0.6; cursor: not-allowed !important; pointer-events: none; }
        .result-badge { position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .badge-correct { background-color: var(--correct); }
        .badge-wrong { background-color: var(--wrong); }

        .draggable-objects { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; width: 100%; min-height: 100px; padding: 1rem; background: #f1f5f9; border-radius: 1rem; box-sizing: border-box; }
        .draggable-item { font-size: 3rem; cursor: grab; transition: transform 0.2s; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); user-select: none; position: relative; }
        .draggable-item:active { cursor: grabbing; transform: scale(1.1); }
        .draggable-item.dragging { opacity: 0.5; }
        .draggable-item.placed { position: absolute; transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: default; box-shadow: none; background: transparent; z-index: 3; }

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

        .stats-column { display: flex; flex-direction: column; gap: 1.5rem; }
        .stats-block { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; height: fit-content; background: white; }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); display: flex; align-items: center; gap: 0.5rem; }
        .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }
        
        .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: var(--border-radius); cursor: pointer; font-weight: bold; color: white; transition: background 0.2s; }
        .btn-primary { background: var(--primary-color); }
        .btn-primary:hover { background: #004b75; }
        
        /* Overlays */
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

    <div id="start-screen" class="overlay">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; text-align: center; color: var(--secondary-color);">${titleText}</h1>
        <div style="background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">Objetos magnéticos a encontrar: <span id="magnetic-total-display">${selectedObjects.filter(o => o.isMagnetic).length}</span></div>
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
        <h2 class="game-title" id="main-title" style="margin-top: 0; display: flex; justify-content: center;"></h2>
        
        <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
            <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
            <span style="font-size:1rem; color:#1e40af; font-weight:500;">¿Sabes cuáles son los objetos magnéticos? Arrastra el objeto magnético correcto y observa cómo se mueve hacia el imán.</span>
        </div>

        <div class="game-layout">
            <div class="diagram-column">
                <div id="magnet-zone" class="magnet-zone">
                    <div class="magnetic-waves-1"></div>
                    <div class="magnetic-waves-2"></div>
                    <div class="magnetic-waves-3"></div>
                    <div class="magnet-image">🧲</div>
                </div>
                <div id="draggable-objects" class="draggable-objects"></div>
            </div>
            <div class="stats-column">
                <div class="stats-block">
                    <h3><i data-lucide="trophy"></i> Progreso</h3>
                    <div class="stats-item"><span>Objetos Magnéticos:</span> <strong id="found-val" style="color: var(--primary-color)">0 / <span class="total-mag">0</span></strong></div>
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
        const gameObjects = ${JSON.stringify(selectedObjects)};
        let score = 0;
        let placedObjects = [];
        let testedObjects = [];
        let isPlaying = false;
        let isTesting = false;
        const totalToFind = gameObjects.filter(o => o.isMagnetic).length;
        let timeElapsed = 0;
        let timerInterval;

        function formatTime(s) {
            const m = Math.floor(s / 60);
            const secs = s % 60;
            return m + ':' + (secs < 10 ? '0' : '') + secs;
        }

        function formatTimeFriendly(s) {
            const m = Math.floor(s / 60);
            const secs = s % 60;
            if (m > 0) {
                return m + ' minuto' + (m !== 1 ? 's' : '') + ' y ' + secs + ' segundo' + (secs !== 1 ? 's' : '');
            }
            return secs + ' segundo' + (secs !== 1 ? 's' : '');
        }

        function initTitle() {
            const el = document.getElementById('main-title');
            el.innerHTML = "Juego de MagForce".split('').map((c, i) => '<span style="animation-delay:'+(i*0.05)+'s">'+(c===' '?'&nbsp;':c)+'</span>').join('');
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

        function startGame() {
            document.getElementById('game-ui').style.display = 'flex';
            document.getElementById('magnetic-total-display').innerText = totalToFind;
            document.querySelectorAll('.total-mag').forEach(el => el.innerText = totalToFind);
            initTitle();
            isPlaying = true;
            
            timerInterval = setInterval(() => {
                timeElapsed++;
                document.getElementById('time-val').innerText = formatTime(timeElapsed);
            }, 1000);
            
            const objectsContainer = document.getElementById('draggable-objects');
            objectsContainer.innerHTML = '';
            
            gameObjects.forEach(obj => {
                const el = document.createElement('div');
                el.className = 'draggable-item has-tooltip';
                el.draggable = true;
                el.id = obj.id;
                el.innerText = obj.icon;
                el.setAttribute('data-tooltip', obj.name);
                
                el.addEventListener('dragstart', (e) => {
                    if(!isPlaying || isTesting || testedObjects.includes(obj.id)) { e.preventDefault(); return; }
                    e.dataTransfer.setData('text/plain', obj.id);
                    setTimeout(() => el.classList.add('dragging'), 0);
                });
                
                el.addEventListener('dragend', () => {
                    el.classList.remove('dragging');
                });
                
                objectsContainer.appendChild(el);
            });
            
            const magnetZone = document.getElementById('magnet-zone');
            magnetZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                magnetZone.classList.add('drag-over');
            });
            magnetZone.addEventListener('dragleave', () => {
                magnetZone.classList.remove('drag-over');
            });
            magnetZone.addEventListener('drop', (e) => {
                e.preventDefault();
                magnetZone.classList.remove('drag-over');
                if(!isPlaying || isTesting) return;
                
                const id = e.dataTransfer.getData('text/plain');
                if(testedObjects.includes(id)) return;
                
                const draggedEl = document.getElementById(id);
                if(!draggedEl || draggedEl.classList.contains('placed')) return;
                
                const objData = gameObjects.find(o => o.id === id);
                if(!placedObjects.find(o => o.id === id)) {
                    placedObjects.push(objData);
                    magnetZone.appendChild(draggedEl);
                    draggedEl.classList.add('placed');
                    draggedEl.draggable = false;
                    draggedEl.setAttribute('data-tooltip', objData.name);
                    
                    const radius = 60;
                    const i = placedObjects.length - 1;
                    const angle = (i * Math.PI * 2) / gameObjects.length;
                    draggedEl.style.position = 'absolute';
                    draggedEl.style.left = 'calc(50% - 35px + ' + Math.cos(angle) * radius + 'px)';
                    draggedEl.style.top = 'calc(50% - 35px + ' + Math.sin(angle) * radius + 'px)';
                    
                    draggedEl.onclick = () => {
                        if(!isPlaying || isTesting || testedObjects.includes(id)) return;
                        draggedEl.classList.remove('placed');
                        draggedEl.draggable = true;
                        draggedEl.style.position = 'relative';
                        draggedEl.style.left = 'auto';
                        draggedEl.style.top = 'auto';
                        draggedEl.onclick = null;
                        document.getElementById('draggable-objects').appendChild(draggedEl);
                        placedObjects = placedObjects.filter(o => o.id !== id);
                    };
                }
            });
        }

        function handleValidateSolution() {
            if (!isPlaying || isTesting) return;
            if (placedObjects.length === 0) {
                Swal.fire('Atención', 'Coloca al menos un objeto en el imán para validar.', 'warning');
                return;
            }

            isTesting = true;

            const wrongObjects = placedObjects.filter(o => !o.isMagnetic);
            const correctObjects = placedObjects.filter(o => o.isMagnetic);

            placedObjects.forEach(obj => {
                const el = document.getElementById(obj.id);
                if (el) {
                    el.classList.add(obj.isMagnetic ? 'testing-magnetic' : 'testing-non-magnetic');
                }
            });

            if (wrongObjects.length > 0) {
                const magnetZone = document.getElementById('magnet-zone');
                magnetZone.classList.add('magnet-error');
                const img = magnetZone.querySelector('.magnet-image');
                img.classList.add('magnet-vibrate-error');
            } else {
                const magnetZone = document.getElementById('magnet-zone');
                magnetZone.classList.add('magnet-active');
                const img = magnetZone.querySelector('.magnet-image');
                img.classList.add('magnet-vibrate');
            }

            setTimeout(() => {
                const magnetZone = document.getElementById('magnet-zone');
                magnetZone.classList.remove('magnet-error', 'magnet-active');
                const img = magnetZone.querySelector('.magnet-image');
                img.classList.remove('magnet-vibrate-error', 'magnet-vibrate');
                
                placedObjects.forEach(obj => {
                    const el = document.getElementById(obj.id);
                    if (el) {
                        el.classList.remove('testing-magnetic', 'testing-non-magnetic');
                        if (!testedObjects.includes(obj.id)) {
                            testedObjects.push(obj.id);
                        }
                    }
                });

                isTesting = false;

                if (wrongObjects.length > 0) {
                    Swal.fire({
                        title: '¡Cuidado!',
                        text: 'Has colocado objetos que NO son atraídos por el imán. ¡El imán los ha rechazado!',
                        icon: 'error'
                    }).then(() => {
                        wrongObjects.forEach(obj => {
                            const el = document.getElementById(obj.id);
                            if (el) {
                                el.classList.remove('placed');
                                el.draggable = false;
                                el.classList.add('tested-item');
                                el.style.position = 'relative';
                                el.style.left = 'auto';
                                el.style.top = 'auto';
                                el.onclick = null;
                                
                                if (!el.querySelector('.result-badge')) {
                                    const badge = document.createElement('div');
                                    badge.className = 'result-badge badge-wrong';
                                    badge.innerText = '✕';
                                    el.appendChild(badge);
                                }

                                document.getElementById('draggable-objects').appendChild(el);
                            }
                        });
                        
                        correctObjects.forEach(obj => {
                            const el = document.getElementById(obj.id);
                            if (el) {
                                el.classList.add('tested-item');
                                el.draggable = false;
                                el.onclick = null;
                                if (!el.querySelector('.result-badge')) {
                                    const badge = document.createElement('div');
                                    badge.className = 'result-badge badge-correct';
                                    badge.innerText = '✓';
                                    el.appendChild(badge);
                                }
                            }
                        });
                        placedObjects = correctObjects;
                    });
                } else {
                    correctObjects.forEach(obj => {
                        const el = document.getElementById(obj.id);
                        if (el) {
                            el.classList.add('tested-item');
                            el.draggable = false;
                            el.onclick = null;
                            if (!el.querySelector('.result-badge')) {
                                const badge = document.createElement('div');
                                badge.className = 'result-badge badge-correct';
                                badge.innerText = '✓';
                                el.appendChild(badge);
                            }
                        }
                    });

                    score = (correctObjects.length * 10);
                    document.getElementById('found-val').innerHTML = (score/10) + ' / <span class="total-mag">' + totalToFind + '</span>';
                    document.getElementById('score-val').innerText = score + ' pts';
                    
                    if ((score/10) === totalToFind) {
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
                                    location.reload();
                                }
                            });
                        }, 1200);
                    } else {
                        setTimeout(() => {
                            Swal.fire({
                                title: '¡Correcto!',
                                html: \`
                                  <p style="font-size: 1.1rem; margin-bottom: 0;">¡Muy bien! Has identificado correctamente los objetos magnéticos.</p>
                                  <div style="font-size: 1.1rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGreenGlow 1.5s infinite;">✨ +\${correctObjects.length * 10} Puntos</div>
                                \`,
                                icon: 'success',
                                confirmButtonText: 'Continuar',
                                confirmButtonColor: '#0077b6'
                            });
                        }, 800);
                    }
                }
            }, 1200);
        }

        function handleFinishGame(auto = false) {
            clearInterval(timerInterval);
            if(!auto) {
                Swal.fire({
                    title: '¿Deseas finalizar el juego?',
                    text: 'Tu puntaje actual es de ' + score + ' puntos.',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#0077b6',
                    cancelButtonColor: '#4b5563',
                    confirmButtonText: 'Sí, finalizar',
                    cancelButtonText: 'Seguir Jugando'
                }).then((res) => {
                    if(res.isConfirmed) {
                        window.close();
                        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
                    } else {
                        if(isPlaying) {
                            timerInterval = setInterval(() => {
                                timeElapsed++;
                                document.getElementById('time-val').innerText = formatTime(timeElapsed);
                            }, 1000);
                        }
                    }
                });
            } else {
                window.close();
                document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
            }
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

const MagForce = () => {
    const [view, setView] = useState('home');
    const [selectedObjects, setSelectedObjects] = useState([]);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [score, setScore] = useState(0);
    const [placedObjects, setPlacedObjects] = useState([]);
    const [testedObjects, setTestedObjects] = useState([]);
    const [draggedItemId, setDraggedItemId] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [magnetAnim, setMagnetAnim] = useState(false);
    const [magnetAnimError, setMagnetAnimError] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const jsZipReady = true;

    const MOCK_DATA = {
        selectedAreas: ['science'],
        selectedSkills: ['Pensamiento estructurado y lógico', 'Diseño y construcción de soluciones', 'Resolución de problemas complejos'],
        gameDetails: { gameName: 'MagForce', description: 'Juego interactivo para identificar objetos magnéticos a través del arrastrar y soltar.', version: '1.0.0', date: null },
        selectedPlatforms: ['web']
    };

    const stateData = location.state || {};
    const selectedAreas = stateData.selectedAreas || MOCK_DATA.selectedAreas;
    const selectedSkills = stateData.selectedSkills || MOCK_DATA.selectedSkills;
    const gameDetails = stateData.gameDetails || MOCK_DATA.gameDetails;
    const selectedPlatforms = stateData.selectedPlatforms || MOCK_DATA.selectedPlatforms;

    const getFixedCreationDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    };

    const gameDetailsWithDate = { ...gameDetails, date: getFixedCreationDate() };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setTimeElapsed((prev) => prev + 1);
            }, 1000);
        } else if (!isPlaying && timeElapsed !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isPlaying, timeElapsed]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const secs = s % 60;
        return `${m}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const formatTimeFriendly = (s) => {
        const m = Math.floor(s / 60);
        const secs = s % 60;
        if (m > 0) {
            return `${m} minuto${m !== 1 ? 's' : ''} y ${secs} segundo${secs !== 1 ? 's' : ''}`;
        }
        return `${secs} segundo${secs !== 1 ? 's' : ''}`;
    };



    const handleObjectToggle = (obj) => {
        const isSelected = selectedObjects.find(o => o.id === obj.id);
        if (isSelected) {
            setSelectedObjects(selectedObjects.filter(o => o.id !== obj.id));
        } else {
            if (selectedObjects.length >= 8) {
                Swal.fire('Límite alcanzado', 'Solo puedes seleccionar 8 objetos en total.', 'warning');
                return;
            }
            setSelectedObjects([...selectedObjects, obj]);
        }
    };

    const magneticCount = selectedObjects.filter(o => o.isMagnetic).length;
    const isSelectionValid = selectedObjects.length === 8;

    const startNewGame = () => {
        if (magneticCount < 3) {
            Swal.fire('Atención', 'Debes incluir al menos 3 objetos magnéticos para poder jugar.', 'warning');
            return;
        }
        setView('play');
        setIsPlaying(true);
        setScore(0);
        setPlacedObjects([]);
        setTestedObjects([]);
        setDraggedItemId(null);
        setIsTesting(false);
    };

    const handleDragStart = (e, obj) => {
        if (!isPlaying || isTesting || testedObjects.includes(obj.id)) return;
        if (placedObjects.find(o => o.id === obj.id)) return;
        e.dataTransfer.setData('text/plain', obj.id);
        setDraggedItemId(obj.id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!isPlaying || isTesting) return;

        const id = e.dataTransfer.getData('text/plain');
        if (testedObjects.includes(id)) return;

        const obj = selectedObjects.find(o => o.id === id);
        if (!obj) return;
        if (placedObjects.find(o => o.id === id)) return;

        const newPlaced = [...placedObjects, obj];
        setPlacedObjects(newPlaced);
        setDraggedItemId(null);
    };

    const handleRemoveFromMagnet = (obj) => {
        if (!isPlaying) return;
        setPlacedObjects(placedObjects.filter(o => o.id !== obj.id));
    };

    const handleValidateSolution = () => {
        if (!isPlaying || isTesting) return;
        if (placedObjects.length === 0) {
            Swal.fire('Atención', 'Coloca al menos un objeto en el imán para validar.', 'warning');
            return;
        }

        setIsTesting(true);

        const wrongObjects = placedObjects.filter(o => !o.isMagnetic);
        const correctObjects = placedObjects.filter(o => o.isMagnetic);

        if (wrongObjects.length > 0) {
            setMagnetAnimError(true);
        } else {
            setMagnetAnim(true);
        }

        setTimeout(() => {
            setMagnetAnim(false);
            setMagnetAnimError(false);
            setIsTesting(false);

            const newlyTested = placedObjects.map(o => o.id);
            setTestedObjects(prev => [...new Set([...prev, ...newlyTested])]);

            if (wrongObjects.length > 0) {
                Swal.fire({
                    title: '¡Cuidado!',
                    text: 'Has colocado objetos que NO son atraídos por el imán. ¡El imán los ha rechazado!',
                    icon: 'error'
                }).then(() => {
                    setPlacedObjects(correctObjects);
                });
            } else {
                const currentScore = correctObjects.length * 10;
                setScore(currentScore);

                if (correctObjects.length === magneticCount) {
                    setTimeout(() => {
                        setIsPlaying(false);
                        Swal.fire({
                            title: '¡Juego Completado!',
                            html: `
                              <div class="swal-confetti">
                                <span style="font-size: 3rem;">🌟</span>
                                <span style="font-size: 3rem;">🏆</span>
                                <span style="font-size: 3rem;">🌟</span>
                              </div>
                              <p style="font-size: 1.1rem; margin-bottom: 0;">Has encontrado todos los materiales conductores en <strong>${formatTimeFriendly(timeElapsed)}</strong>. Ganaste <strong>${currentScore}</strong> puntos.</p>
                              <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                                Puntaje Total: ${currentScore}
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
                              <p style="font-size: 1.1rem; margin-bottom: 0;">¡Muy bien! Has identificado correctamente los objetos magnéticos.</p>
                              <div style="font-size: 1.1rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGreenGlow 1.5s infinite;">✨ +${correctObjects.length * 10} Puntos</div>
                            `,
                            icon: 'success',
                            confirmButtonText: 'Continuar',
                            confirmButtonColor: '#0077b6'
                        });
                    }, 800);
                }
            }
        }, 1200);
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
                slug: 'magforce', details: gameDetailsWithDate, platforms: selectedPlatforms,
                options: { objetos: selectedObjects }, htmlContent: generateMagForceCode(selectedObjects, gameDetailsWithDate, selectedPlatforms), webAssets: [],
                onStatus: (status) => { setStatusText(status); setProgress(current => Math.min(90, current + 15)); }
            });
            downloadGameArchive(result.blob, result.fileName);
            setProgress(100); setStatusText('¡Descarga iniciada!');
        } catch (error) {
            console.error(error); setStatusText(error?.message || 'Error al generar el paquete.');
        } finally { setIsGenerating(false); }
    };

    const renderSetupScreen = () => {
        const gameIcon = location.state?.selectedGame?.icon || "/images/juegos/magforce.png";
        return (
            <div className="catalog-screen">
                <div className="game-title">
                    {'Juego de MagForce'.split('').map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src={gameIcon} alt="MagForce" className="game-preview-image" onError={(e) => { e.target.style.display = 'none'; }} />
                    <span className="game-info-badge">Ciencia y Lógica</span>
                </div>

                <div className="rules-banner">
                    <h2><HelpCircle size={22} /> MagForce: Objetos Magnéticos</h2>
                    <p>
                        Configura tu juego seleccionando exactamente 8 objetos del catálogo.
                        ¡Asegúrate de incluir objetos magnéticos para que el juego sea divertido!
                    </p>
                </div>

                <div style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--medium-gray-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: 'var(--secondary-color)' }}>Catálogo de Objetos</h3>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: selectedObjects.length === 8 ? 'var(--primary-color)' : 'var(--dark-gray-color)' }}>
                            Seleccionados: {selectedObjects.length}/8
                        </div>
                    </div>

                    <div className="objects-grid">
                        {OBJECTS_CATALOG.map(obj => {
                            const isSelected = selectedObjects.find(o => o.id === obj.id);
                            return (
                                <div
                                    key={obj.id}
                                    className={`object-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleObjectToggle(obj)}
                                >
                                    {isSelected && <Check size={16} className="check-icon" />}
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
                        disabled={!isSelectionValid}
                        style={{ opacity: isSelectionValid ? 1 : 0.5, cursor: isSelectionValid ? 'pointer' : 'not-allowed' }}
                    >
                        <ArrowRight size={18} /> Siguiente
                    </button>
                </div>
            </div>
        );
    };

    const renderGameScreen = () => {
        return (
            <div className="game-screen">
                <style>{`
                    @keyframes magnetVibrateErrorReact {
                        0% { transform: translate(0, 0) rotate(0deg) scale(1.05); }
                        20% { transform: translate(-10px, 0) scale(1.1); }
                        40% { transform: translate(10px, 0) scale(1.1); }
                        60% { transform: translate(-10px, 0) scale(1.1); }
                        80% { transform: translate(10px, 0) scale(1.1); }
                        100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                    }
                `}</style>
                <div className="game-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    {'Juego de MagForce'.split('').map((char, index) => (
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
                        ¿Sabes cuáles son los objetos magnéticos? Arrastra el objeto magnético correcto y observa cómo se mueve hacia el imán.
                    </span>
                </div>

                <div className="game-layout">
                    <div className="game-main-col">
                        <div
                            className={`magnet-zone ${isDragOver ? 'drag-over' : ''} ${magnetAnim ? 'magnet-active' : ''}`}
                            style={{
                                ...(magnetAnimError ? { borderColor: 'var(--wrong-color, #ef4444)', backgroundColor: '#fef2f2' } : {})
                            }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="magnetic-waves-1"></div>
                            <div className="magnetic-waves-2"></div>
                            <div className="magnetic-waves-3"></div>
                            <div
                                className={`magnet-image ${magnetAnim ? 'magnet-vibrate' : ''}`}
                                style={magnetAnimError ? {
                                    animation: 'none',
                                    transform: 'translateX(0)',
                                    transition: 'transform 0.1s',
                                    animationName: 'magnetVibrateErrorReact',
                                    animationDuration: '0.5s',
                                    animationTimingFunction: 'ease-in-out'
                                } : {}}
                            >🧲</div>
                            {placedObjects.map((obj, i) => {
                                const isTested = testedObjects.includes(obj.id);
                                const radius = 60;
                                const angle = (i * Math.PI * 2) / selectedObjects.length;

                                let effectClass = '';
                                if (isTesting) {
                                    effectClass = obj.isMagnetic ? 'testing-magnetic' : 'testing-non-magnetic';
                                }

                                return (
                                    <div
                                        key={`placed-${obj.id}`}
                                        className={`draggable-item placed has-tooltip ${effectClass} ${isTested && obj.isMagnetic ? 'tested-item' : ''}`}
                                        data-tooltip={obj.name}
                                        style={{
                                            position: 'absolute',
                                            left: `calc(50% - 35px + ${Math.cos(angle) * radius}px)`,
                                            top: `calc(50% - 35px + ${Math.sin(angle) * radius}px)`,
                                            cursor: (isTesting || isTested) ? 'default' : 'pointer'
                                        }}
                                        onClick={() => {
                                            if (!isTesting && !isTested) handleRemoveFromMagnet(obj);
                                        }}
                                    >
                                        {obj.icon}
                                        {isTested && obj.isMagnetic && (
                                            <div className="result-badge badge-correct">✓</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="draggable-objects">
                            {selectedObjects.map(obj => {
                                const isPlaced = placedObjects.find(o => o.id === obj.id);
                                if (isPlaced) return null;
                                const isTested = testedObjects.includes(obj.id);

                                return (
                                    <div
                                        key={obj.id}
                                        className={`draggable-item has-tooltip ${draggedItemId === obj.id ? 'dragging' : ''} ${isTested ? 'tested-item' : ''}`}
                                        draggable={isPlaying && !isTested}
                                        onDragStart={(e) => {
                                            if (!isTested) handleDragStart(e, obj);
                                        }}
                                        onDragEnd={() => setDraggedItemId(null)}
                                        data-tooltip={obj.name}
                                    >
                                        {obj.icon}
                                        {isTested && !obj.isMagnetic && (
                                            <div className="result-badge badge-wrong">✕</div>
                                        )}
                                        {isTested && obj.isMagnetic && (
                                            <div className="result-badge badge-correct">✓</div>
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
                                <span>Objetos Magnéticos:</span> <strong style={{ color: 'var(--primary-color)' }}>{score / 10} / {magneticCount}</strong>
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
                            <div className="info-card-value">{gameDetailsWithDate.gameName || 'MagForce'}</div>
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
                                {gameDetailsWithDate.description || 'Juego interactivo para identificar objetos magnéticos a través del arrastrar y soltar.'}
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
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Magnet size={18} /> Objetos Seleccionados:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>8</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Check size={18} /> Objetos Magnéticos Para Encontrar:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{magneticCount}</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Tiempo:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>Cronómetro progresivo</strong>
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
            <div className="magforce-container">
                {view === 'home' && renderSetupScreen()}
                {view === 'play' && renderGameScreen()}
                {view === 'summary' && renderSummaryScreen()}
            </div>
        </>
    );
};

export default MagForce;
