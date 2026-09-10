import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    HelpCircle, RotateCcw, Timer, Trophy, Star, CheckCircle,
    Download, ArrowLeft, Tag, Layers, FileText, Calendar, Monitor,
    Shapes, Puzzle, Type, Clock, List, Upload, Image as ImageIcon, Trash2,
    Play, ArrowRight, Info, Check, X
} from 'lucide-react';

const IconConfigure = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105-.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"></path>
    </svg>
);

// --- ESTILOS COMPARTIDOS ---
const Style = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap');
    
    /* --- ESTILOS GENERALES --- */
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
      --border-radius: 0.5rem;
      --box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    body {
        background-color: #f0f2f5;
        margin: 0;
    }

    .acertijo-container {
      background: var(--light-text);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 2rem;
      width: 100%;
      max-width: 950px;
      margin: 20px auto;
      color: var(--dark-text);
      min-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    /* --- TÍTULO ANIMADO --- */
    .game-title {
        text-align: center;
        font-size: 3rem;
        font-weight: 700;
        color: var(--secondary-color);
        margin-bottom: 1rem;
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
        20% { transform: translateY(-20px); }
    }

    /* --- PANTALLA DE CONFIGURACIÓN --- */
    .config-screen {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      flex-grow: 1;
    }
    
    .rules-text {
        text-align: center;
        color: var(--dark-gray-color);
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--medium-gray-color);
        margin-top: 1rem;
    }
    .rules-text h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
    }

    /* Layout vertical para configuración del rompecabezas */
    .config-controls {
      display: flex;
      flex-direction: column;
      gap: 2rem; 
      align-items: stretch;
      margin-bottom: 1rem;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      text-align: left;
      gap: 0.5rem;
    }
    .control-group label {
      font-weight: 500;
      color: var(--dark-gray-color);
      font-size: 1.1rem;
    }
    .control-group select, .control-group input[type="text"] {
      padding: 0.75rem;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      font-size: 1rem;
      background: white;
    }

    .file-input-wrapper {
        border: 2px dashed var(--medium-gray-color);
        border-radius: 1rem;
        padding: 3rem 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        background: #fafafa;
        color: var(--dark-gray-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        min-height: 300px;
    }
    .file-input-wrapper:hover {
        border-color: var(--primary-color);
        background: #f0f9ff;
        color: var(--primary-color);
    }

    /* --- BOTONES DEL FOOTER DE CONFIGURACIÓN --- */
     .config-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 2rem;
        border-top: 1px solid var(--medium-gray-color);
        padding-top: 1.5rem;
    }
    
    .no-rounded-button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
    }
    .no-rounded-button:hover {
        background-color: #0077b6;
        color: white;
    }
    
    .no-rounded-button:disabled {
        background-color: var(--medium-gray-color);
        color: #9ca3af;
        cursor: not-allowed;
        opacity: 0.7;
        pointer-events: none;
    }

    /* --- ESTILOS DEL JUEGO (GAME UI) --- */
    .game-screen {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .clue-text {
        text-align: center;
        color: var(--dark-gray-color);
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
    }

    .game-layout {
        display: grid;
        grid-template-columns: 1fr 250px; 
        gap: 2rem;
        width: 100%;
        align-items: start;
    }
    
    .game-left-col {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
    }

    .game-right-col {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .stats-block {
        border: 1px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        padding: 1rem;
        text-align: left;
        background: white;
    }
    .stats-block h3 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        color: var(--secondary-color);
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--medium-gray-color);
    }
    .stats-item {
        margin-bottom: 0.75rem;
        font-size: 1rem;
        display: flex;
        justify-content: space-between;
    }
    .stats-item strong {
        font-weight: 700;
        color: var(--dark-text);
    }

    .btn-primary {
        background-color: var(--primary-color);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: var(--border-radius);
        font-weight: 600;
        border: none;
        cursor: pointer;
        width: 100%;
        transition: background 0.2s;
    }
    .btn-primary:hover {
        background-color: #005f92;
    }

    .nav-footer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1.5rem;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--medium-gray-color);
        width: 100%;
    }

    /* --- ESTILOS ESPECÍFICOS DEL ROMPECABEZAS --- */
    .puzzle-area-wrapper {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        justify-content: center;
        flex-wrap: wrap;
        width: 100%;
    }
    
    .puzzle-board-container {
        border: 2px solid var(--medium-gray-color);
        background: #f8fafc;
        padding: 0.5rem;
        border-radius: var(--border-radius);
    }
    
    .puzzle-pieces-pool {
        border: 2px dashed var(--medium-gray-color);
        background: #fff;
        padding: 0.5rem;
        border-radius: var(--border-radius);
        min-width: 150px;
        display: grid;
        gap: 5px;
        align-content: start;
    }

    .puzzle-slot {
        background: rgba(255,255,255,0.5);
        border: 1px dashed #ccc;
        box-sizing: border-box;
    }

    .puzzle-piece {
        cursor: grab;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.1s;
        touch-action: none;
        border: 1px solid rgba(0,0,0,0.1); /* Borde sutil por defecto */
    }
    .puzzle-piece:active {
        cursor: grabbing;
        transform: scale(1.05);
        z-index: 100;
    }
    
    /* BORDES DE VALIDACIÓN */
    .puzzle-piece.correct {
        border: 3px solid var(--correct-color) !important;
        box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
        z-index: 10;
    }
    .puzzle-piece.incorrect {
        border: 3px solid var(--wrong-color) !important;
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
        z-index: 10;
    }
    .puzzle-piece.disabled {
        cursor: not-allowed;
        opacity: 0.8;
    }

    @media (max-width: 900px) {
        .config-controls, .game-layout { grid-template-columns: 1fr; }
        .game-layout { gap: 1rem; }
        .puzzle-area-wrapper { flex-direction: column; align-items: center; }
    }
    `}</style>
);

// --- ESTILOS DE SUMMARY ---
const summaryStyles = `
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
    .rules-text {
        text-align: center;
        color: #6b7280;
        margin-bottom: 2rem;
        font-size: 1.1rem;
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
    .btn-success {
        background: #005f92;
    }
    .btn-success:hover:not(:disabled) {
        background: #004a73;
    }
    
    /* Grid Helpers */
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    
    .info-card { 
        background: white; 
        padding: 1.25rem; 
        border-radius: 0.75rem; 
        box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
        border: 1px solid #f1f5f9; 
        display: flex; 
        flex-direction: column; 
        gap: 0.5rem; 
    }
    
    .info-card-header { 
        display: flex; 
        align-items: center; 
        gap: 0.5rem; 
        color: #64748b; 
        font-size: 0.9rem; 
        font-weight: 600; 
        text-transform: uppercase; 
        letter-spacing: 0.05em; 
        width: 100%;
    }
    
    .info-card-value { 
        font-size: 1.1rem; 
        color: #334155; 
        font-weight: 500; 
        text-align: center; 
        width: 100%;
    }
    
    .full-width { grid-column: 1 / -1; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
`;

// --- NIVELES DE DIFICULTAD ---
const LEVELS = {
    basico: { name: 'Básico', difficulty: 3, time: 180 },
    intermedio: { name: 'Intermedio', difficulty: 4, time: 300 },
    avanzado: { name: 'Avanzado', difficulty: 5, time: 420 },
};

// --- GENERADOR HTML PARA ROMPECABEZAS (Estilo Acertijo.jsx) ---
const generatePuzzleCode = (config, gameDetails, selectedPlatforms, imageBase64) => {
    const rawDate = (() => {
        try {
            const stored = typeof localStorage !== 'undefined'
                ? localStorage.getItem('rompecabezas:creation_date')
                : null;
            const now = new Date(); const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
            return stored || gameDetails?.date || local;
        } catch { const now = new Date(); return gameDetails?.date || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`; }
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

    const cleanImageBase64 = imageBase64 ? imageBase64.replace(/(\r\n|\n|\r)/gm, "") : "";

    const titleText = gameDetails.gameName || 'Rompecabezas';
    const animatedTitleHTML = `
    <div class="game-title">
        ${'Juego del Rompecabezas'.split('').map((char, index) =>
        `<span style="animation-delay: ${index * 0.07}s">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('')}
    </div>
`;

    const staticTitleHTML = `
        <div class="game-title static">
            ${titleText.split('').map((char) =>
        `<span>${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('')}
        </div>
    `;

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleText} - ${config.name}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root { 
            --primary-color: #005f92; /* Azul principal igual a Acertijo */
            --secondary-color: #1f2937; 
            --light-gray: #f3f4f6;
            --medium-gray: #d1d5db; 
            --dark-gray: #4b5563; 
            --correct: #22c55e; 
            --wrong: #ef4444;
            --light-text: #ffffff; 
            --dark-text: #111827;
        }
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; display: flex; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 900px; display: flex; flex-direction: column; }
        
        .game-layout { display: grid; grid-template-columns: 1fr 250px; gap: 2rem; width: 100%; }
        @media (max-width: 768px) { .game-layout { grid-template-columns: 1fr; } }

        .game-left-col { display: flex; flex-direction: column; gap: 1.5rem; align-items: center; }

        .stats-block { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; height: fit-content; background: white; }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); }
        .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }

        .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; color: white; transition: background 0.2s; }
        .btn-primary { background: var(--primary-color); }
        .btn-primary:hover { background: #005f92; }
        
        /* Overlays */
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; transition: opacity 0.3s; padding: 20px; box-sizing: border-box; }
        .hidden { display: none !important; opacity: 0; pointer-events: none; }
        
        .big-btn { 
            padding: 1rem 2rem; 
            font-size: 1.2rem; 
            font-weight: bold; 
            background: var(--primary-color); 
            color: white; 
            border: none; 
            border-radius: 0.5rem; 
            cursor: pointer; 
            transition: transform 0.2s; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            margin: 0.5rem; 
            display: inline-flex; 
            align-items: center; 
            gap: 0.5rem; 
            justify-content: center; 
            min-width: 200px; 
        }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        
        /* Estilos de botones finales igual a Acertijo */
        .btn-exit { background: #1f2937; } /* Gris oscuro */
        .btn-retry { background: var(--primary-color); } /* Azul */
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }
        
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        /* Animated Title Styles */
        .game-title {
            text-align: center;
            font-size: 3rem;
            font-weight: 700;
            color: var(--secondary-color);
            margin-bottom: 1rem;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
        }
        .game-title span {
            display: inline-block;
            animation: wave-animation 1.8s infinite;
            position: relative;
        }
        .game-title.static span { animation: none; transform: none; }
        @keyframes wave-animation {
            0%, 40%, 100% { transform: translateY(0); }
            20% { transform: translateY(-20px); }
        }

        /* Puzzle Styles */
        .puzzle-area-wrapper {
            display: flex; gap: 1rem; align-items: flex-start; justify-content: center; flex-wrap: wrap; width: 100%;
        }
        .puzzle-board-container {
            border: 2px solid var(--medium-gray); background: #f8fafc; padding: 0.5rem; border-radius: 0.5rem;
        }
        .puzzle-pieces-pool {
            border: 2px dashed var(--medium-gray); background: #fff; padding: 0.5rem; border-radius: 0.5rem;
            min-width: 150px; display: grid; gap: 5px; align-content: start;
        }
        .puzzle-slot {
            background: rgba(255,255,255,0.5); border: 1px dashed #ccc; box-sizing: border-box;
        }
        .puzzle-piece {
            cursor: grab; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: transform 0.1s;
            border: 1px solid rgba(0,0,0,0.1);
        }
        .puzzle-piece.correct { border: 3px solid var(--correct); z-index: 10; box-shadow: 0 0 8px rgba(34, 197, 94, 0.6); }
        .puzzle-piece.incorrect { border: 3px solid var(--wrong); z-index: 10; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6); }
        .puzzle-piece.disabled { cursor: not-allowed; opacity: 0.8; }

        /* Estilos Modal Info */
        .info-modal-content {
            background: white; padding: 2.5rem; border-radius: 1rem; max-width: 600px; width: 90%;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; position: relative;
        }
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
        
        /* Utility */
        .clue-text { text-align: center; color: var(--dark-gray); margin-bottom: 0.5rem; font-size: 1.1rem; }
    </style>
</head>
<body>
    <!-- DATA CONTAINER -->
    <script id="puzzle-image-data" type="text/plain">${cleanImageBase64}</script>

    <div id="start-screen" class="overlay">
    <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">Rompecabezas</h2>

        <div style="background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">
            Nivel: ${config.name} 
        </div>
       
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <button class="big-btn" onclick="startGameSequence()">▶ Iniciar Juego</button>
            <button class="big-btn btn-info" onclick="toggleInfo(true)">ℹ Información</button>
        </div>
    </div>

    <div id="countdown-screen" class="overlay hidden">
        <div id="countdown-display" class="countdown-number">5</div>
    </div>

    <div id="info-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">Rompecabezas</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
            </div>
            <div class="info-details-grid">
                            <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${gameDetails.authorName || 'No especificado'}</span></div>
                <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${gameDetails.version || '1.0.0'}</span></div>
                <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${platformsString}</span></div>
                <div class="info-item"><span class="info-label">Dificultad</span><span class="info-value">${config.name}</span></div>
                <div class="info-item info-desc">
                    <span class="info-label">Descripción</span>
                    <p class="info-value">${gameDetails.description || 'Sin descripción disponible.'}</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem;" onclick="toggleInfo(false)">Cerrar</button>
            </div>
        </div>
    </div>

    <div id="end-screen" class="overlay hidden">
        <h1 id="end-title" style="color:var(--primary-color); font-size:3rem; font-weight: 800;">Fin del Juego</h1>
        <h2 style="color:var(--secondary-color); font-size:2rem; margin:1rem 0;">Puntos Obtenidos: <span id="final-score">0</span></h2>
        <div class="end-buttons" style="display:flex; gap:1rem;">
             <button class="big-btn btn-exit" onclick="exitGame()">Salir</button>
             <button class="big-btn btn-retry" onclick="location.reload()">Volver a Jugar</button>
        </div>
    </div>

    <div class="container" id="game-ui" style="display:none;">
        ${animatedTitleHTML}
<div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
    <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
    <span style="font-size:1rem; color:#1e40af; font-weight:500;">Coloca las piezas correctamente para formar la imagen.</span>
</div>
        <div class="game-layout">
            <div class="game-left-col">
                <div class="puzzle-area-wrapper">
                    <div class="puzzle-pieces-pool" id="puzzle-panel" style="grid-template-columns: repeat(${config.difficulty}, 1fr);"></div>
                    <div class="puzzle-board-container">
                        <div id="puzzle-board" style="display: grid; grid-template-columns: repeat(${config.difficulty}, 1fr);"></div>
                    </div>
                </div>
            </div>
            <div class="game-right-col">
                <div class="stats-block">
                    <h3>Progreso</h3>
                    <div class="stats-item"><span>Nivel:</span> <strong id="nivel">${config.name}</strong></div>
                   <div class="stats-item"><span>Tiempo Límite:</span> <strong id="timer">${formatTime(config.time)}</strong></div>

                    <div class="stats-item"><span>Puntaje:</span> <strong id="score">0</strong></div>
                    <div class="stats-item"><span>Piezas:</span> <strong id="pieces-count">0/${config.difficulty * config.difficulty}</strong></div>
                </div>
                 <button class="btn btn-primary" onclick="finishGame(false)">Finalizar Juego</button>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        let imageSrc = "";
        try { imageSrc = document.getElementById('puzzle-image-data').textContent.trim(); } catch(e) {}
        
        let state = { timeLeft: config.time, timer: null, active: false, score: 0 };
        let board = [], panelPieces = [];
        let draggedItem = null;
        
        const pieceSize = 100; // Increased size for larger grid
        
        function getPieceStyle(index) {
            const row = Math.floor(index / config.difficulty);
            const col = index % config.difficulty;
            const xPercent = (col / (config.difficulty - 1)) * 100;
            const yPercent = (row / (config.difficulty - 1)) * 100;
            return 'width:'+pieceSize+'px; height:'+pieceSize+'px;' +
                   'background-image: url(' + imageSrc + '); ' +
                   'background-position: ' + xPercent + '% ' + yPercent + '%; ' +
                   'background-size: ' + (config.difficulty * 100) + '% ' + (config.difficulty * 100) + '%;' + 
                   'background-repeat: no-repeat;';
        }

        function initGameData() {
            const total = config.difficulty * config.difficulty;
            board = Array(total).fill(null);
            panelPieces = Array.from({length: total}, (_, i) => ({id: i, originalIndex: i}));
            panelPieces.sort(() => Math.random() - 0.5);
            renderGame();
        }

        function renderGame() {
            const boardEl = document.getElementById('puzzle-board');
            const panelEl = document.getElementById('puzzle-panel');
            
            boardEl.innerHTML = '';
            board.forEach((piece, idx) => {
                const slot = document.createElement('div');
                slot.className = 'puzzle-slot';
                slot.style.width = pieceSize + 'px';
                slot.style.height = pieceSize + 'px';
                slot.ondragover = e => e.preventDefault();
                slot.ondrop = () => handleDropOnBoard(idx);
                if(piece) {
                    const el = createPieceEl(piece, 'board', idx);
                    if(piece.originalIndex === idx) el.classList.add('correct');
                    else el.classList.add('incorrect');
                    slot.appendChild(el);
                }
                boardEl.appendChild(slot);
            });

            panelEl.innerHTML = '';
            panelPieces.forEach((piece, idx) => {
                const el = createPieceEl(piece, 'panel', idx);
                panelEl.appendChild(el);
            });
            
            // Update stats
            const placed = board.filter(p => p !== null).length;
            document.getElementById('pieces-count').innerText = placed + '/' + (config.difficulty * config.difficulty);
        }

        function createPieceEl(piece, origin, idx) {
            const el = document.createElement('div');
            el.className = 'puzzle-piece';
            el.style = getPieceStyle(piece.originalIndex);
            el.draggable = true;
            el.ondragstart = (e) => {
                draggedItem = { piece, origin, index: idx };
            };
            return el;
        }

        function handleDropOnBoard(targetIdx) {
            if (!state.active || !draggedItem || board[targetIdx]) return;
            board[targetIdx] = draggedItem.piece;
            if (draggedItem.origin === 'panel') {
                panelPieces = panelPieces.filter(p => p.id !== draggedItem.piece.id);
            } else {
                board[draggedItem.index] = null;
            }
            draggedItem = null;
            renderGame();
            checkWin();
        }

        document.getElementById('puzzle-panel').ondragover = e => e.preventDefault();
        document.getElementById('puzzle-panel').ondrop = () => {
             if (!state.active || !draggedItem || draggedItem.origin === 'panel') return;
             board[draggedItem.index] = null;
             panelPieces.push(draggedItem.piece);
             draggedItem = null;
             renderGame();
        };

        function checkWin() {
            const isFull = board.every(p => p !== null);
            if (isFull) {
                const isCorrect = board.every((p, i) => p.originalIndex === i);
                if (isCorrect) {
                    state.score = 10;
                    document.getElementById('score').innerText = state.score;
                    setTimeout(() => finishGame(true), 500);
                }
            }
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const d = document.getElementById('countdown-display');
            d.innerText = count;
            const i = setInterval(() => {
                count--;
                if(count > 0) { d.innerText = count; d.style.animation='none'; d.offsetHeight; d.style.animation='popIn 0.5s ease-out'; }
                else { clearInterval(i); document.getElementById('countdown-screen').classList.add('hidden'); startGame(); }
            }, 1000);
        }

        function startGame() {
            document.getElementById('game-ui').style.display = 'block';
            state.active = true;
            state.timeLeft = config.time;
            initGameData();
           state.timer = setInterval(() => {
    state.timeLeft--;
    const mins = Math.floor(state.timeLeft / 60);
    const secs = state.timeLeft % 60;
    document.getElementById('timer').innerText = mins + ':' + (secs < 10 ? '0' : '') + secs;
    if(state.timeLeft <= 0) finishGame(false);
}, 1000);
        }

        function finishGame(win) {
            clearInterval(state.timer);
            state.active = false;
            document.getElementById('game-ui').style.display = 'none';
            document.getElementById('end-screen').classList.remove('hidden');
            // MISMO MENSAJE QUE ACERTIJO.JSX
            document.getElementById('end-title').innerText = win ? "¡Juego Completado!" : "Fin del Juego";
            
            if(!win) state.score = 0;
            document.getElementById('final-score').innerText = state.score;
        }

        function toggleInfo(show) {
             const m = document.getElementById('info-overlay');
             m.classList.toggle('hidden', !show);
             m.style.display = show ? 'flex' : 'none';
        }
        function exitGame() { window.close(); Swal.fire({title:'Cierra la pestaña', icon:'info'}); }
        lucide.createIcons();
    </script>
</body>
</html>`;
};
// --- ANDROID: CONFIGURACIÓN Y GENERACIÓN DE APPLICATION ID ÚNICO ---
const ANDROID_BUILD_GRADLE_PATH = "android/app/build.gradle";
const CAPACITOR_CONFIG_PATH = "android/app/src/main/assets/capacitor.config.json";
const ANDROID_STRINGS_PATH = "android/app/src/main/res/values/strings.xml";
const ROMPECABEZAS_APPLICATION_ID_BASE = "io.rompecabezas.steam";

const createUuidSegment = () => {
    const rawUuid = window.crypto?.randomUUID?.()
        || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    return `uuid_${uuid}`;
};

const buildRompecabezasApplicationId = () => {
    return `${ROMPECABEZAS_APPLICATION_ID_BASE}.${createUuidSegment()}`;
};

const escapeXmlValue = (str) => str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
// Normaliza un texto: minúsculas, sin acentos, espacios → guión bajo
const normalizeFileName = (str) =>
    (str || '')
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");

// Mapea el nombre de plataforma a su etiqueta en el ZIP
const platformLabel = (p) => {
    const val = p.toLowerCase();
    if (val === 'web') return 'web';
    return 'movil'; // android, ios, mobile → siempre "movil"
};

const updateZipTextFile = async (zip, filePath, updateContent) => {
    const file = zip.file(filePath);
    if (!file) throw new Error(`No se encontro ${filePath} en la plantilla Android`);
    const currentContent = await file.async("string");
    zip.file(filePath, updateContent(currentContent));
};

const applyRompecabezasAndroidMetadata = async (zip, { applicationId }) => {
    await updateZipTextFile(zip, ANDROID_BUILD_GRADLE_PATH, (content) => content
        .replace(/applicationId\s+["'][^"']+["']/, `applicationId "${applicationId}"`));

    await updateZipTextFile(zip, CAPACITOR_CONFIG_PATH, (content) => {
        try {
            const capacitorConfig = JSON.parse(content);
            return JSON.stringify({ ...capacitorConfig, appId: applicationId }, null, 2);
        } catch {
            return content.replace(/"appId"\s*:\s*"[^"]*"/, `"appId": ${JSON.stringify(applicationId)}`);
        }
    });

    await updateZipTextFile(zip, ANDROID_STRINGS_PATH, (content) => content
        .replace(/<string name="package_name">[^<]*<\/string>/, `<string name="package_name">${escapeXmlValue(applicationId)}</string>`)
        .replace(/<string name="custom_url_scheme">[^<]*<\/string>/, `<string name="custom_url_scheme">${escapeXmlValue(applicationId)}</string>`));
};
// --- COMPONENTE SUMMARY (Idéntico estructura a Acertijo.jsx) ---
const Summary = ({ config, imageSrc, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const [jsZipReady, setJsZipReady] = useState(false);

    const location = useLocation();
    const state = location.state;

    const MOCK_DATA = {
        selectedAreas: ['Arte', 'Lógica'],
        selectedSkills: ['Percepción Visual', 'Resolución de Problemas'],
        gameDetails: {
            gameName: "Rompecabezas Visual",
            description: "Arma la imagen arrastrando las piezas a su lugar correcto.",
            version: "1.0.0",
            date: null
        },
        selectedPlatforms: ['web']
    };

    const getFixedCreationDate = () => {
        const KEY = 'rompecabezas:creation_date';
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
        localStorage.setItem(KEY, today);
        return today;
    };

    const {
        selectedAreas = MOCK_DATA.selectedAreas,
        selectedSkills = MOCK_DATA.selectedSkills,
        gameDetails: rawGameDetails = MOCK_DATA.gameDetails,
        selectedPlatforms = MOCK_DATA.selectedPlatforms
    } = state || MOCK_DATA;

    const gameDetails = { ...rawGameDetails, date: getFixedCreationDate() };

    useEffect(() => {
        if (window.JSZip) { setJsZipReady(true); return; }
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.async = true;
        script.onload = () => setJsZipReady(true);
        document.body.appendChild(script);
        return () => { if (document.body.contains(script)) document.body.removeChild(script); }
    }, []);

    const handleDownloadZip = () => {
        if (isGenerating || !jsZipReady) return;
        setIsGenerating(true); setProgress(0); setStatusText("Iniciando...");

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 10) + 5;
            if (currentProgress >= 90) {
                clearInterval(interval);
                setStatusText("Procesando recursos...");
                generateAndDownloadZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Generando código HTML...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Incrustando imágenes...");
                setProgress(currentProgress);
            }
        }, 150);
    };

    const generateAndDownloadZip = async () => {
        try {
            const zip = new window.JSZip();
            const htmlContent = generatePuzzleCode(config, gameDetails, selectedPlatforms, imageSrc);

            const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'rompecabezas')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            zip.file(htmlFileName, htmlContent);

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'rompecabezas')}_web.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setProgress(100); setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error(error);
            setStatusText("Error al generar");
            setIsGenerating(false);
        }
    };

    const handleDownloadAndroidZip = () => {
        if (isGenerating || !jsZipReady) return;
        setIsGenerating(true);
        setProgress(0);
        setStatusText("Iniciando...");
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 10) + 2;
            if (currentProgress >= 90) {
                clearInterval(interval);
                setStatusText("Inyectando configuración en Android...");
                generateAndDownloadAndroidZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Descargando plantilla Android...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando configuraciones...");
                setProgress(currentProgress);
            }
        }, 200);
    };

    const generateAndDownloadAndroidZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }
        try {
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/rompecabezas_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Procesando archivos ZIP...");
            const zip = await window.JSZip.loadAsync(arrayBuffer);

            setStatusText("Inyectando configuración...");
            const selectedPlats = selectedPlatforms ?? [];
            const details = gameDetails ?? {};

            // Convertir imageSrc (data URL) a base64 puro para el asset
            const imageBase64 = imageSrc ? imageSrc.split(',')[1] || '' : '';
            const imageMimeType = imageSrc ? (imageSrc.match(/data:([^;]+);/) || [])[1] || 'image/png' : 'image/png';
            const imageExt = imageMimeType.split('/')[1] || 'png';

            const fullConfig = {
                nivel: config?.name || 'Básico',
                dificultad: config?.difficulty || 3,
                tiempoLimite: config?.time || 180,
                autor: details.authorName || '',
                version: details.version || '1.0.0',
                fecha: details.date || (() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`; })(),
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Rompecabezas',
                plataformas: Array.isArray(selectedPlats) ? selectedPlats : ['android'],
                areasSeleccionadas: selectedAreas || [],
                habilidadesSeleccionadas: selectedSkills || [],
                numImagenes: 1,
                imagen: `/images/puzzle-image.${imageExt}`
            };

            // Inyectar config JSON en assets de Capacitor
            const androidApplicationId = buildRompecabezasApplicationId();
            zip.file(
                "android/app/src/main/assets/public/config/rompecabezas-config.json",
                JSON.stringify(fullConfig, null, 2)
            );
            await applyRompecabezasAndroidMetadata(zip, { applicationId: androidApplicationId });

            // Inyectar la imagen como asset
            if (imageBase64) {
                zip.file(
                    `android/app/src/main/assets/public/images/puzzle-image.${imageExt}`,
                    imageBase64,
                    { base64: true }
                );
            }


            setStatusText("Generando paquete final...");
            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            const platformsSuffix = (Array.isArray(selectedPlats) ? selectedPlats : ['movil'])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            link.download = `${normalizeFileName(details?.gameName || 'rompecabezas')}_${platformsSuffix}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setProgress(100);
            setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error("Error generando ZIP Android:", error);
            setStatusText("Error al generar el archivo Android.");
            setIsGenerating(false);
        }
    };

    // ── ZIP Combinado (Web + Android) ────────────────────────────────────────
    const generateAndDownloadCombinedZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        try {
            const outerZip = new window.JSZip();

            // ── Generar ZIP Web ──
            setStatusText("Generando paquete Web...");
            const htmlContent = generatePuzzleCode(config, gameDetails, selectedPlatforms, imageSrc);
            const webZip = new window.JSZip();

            const htmlFileNameCombined = `${normalizeFileName(gameDetails?.gameName || 'rompecabezas')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            webZip.file(htmlFileNameCombined, htmlContent);
            const webBlob = await webZip.generateAsync({ type: "blob" });
            outerZip.file(`${normalizeFileName(gameDetails?.gameName || 'rompecabezas')}_web.zip`, webBlob);

            // ── Generar ZIP Android ──
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/rompecabezas_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Inyectando configuración Android...");
            const zip = await window.JSZip.loadAsync(arrayBuffer);

            const selectedPlats = selectedPlatforms ?? [];
            const details = gameDetails ?? {};

            // Imagen → asset Android
            const imageBase64 = imageSrc ? imageSrc.split(',')[1] || '' : '';
            const imageMimeType = imageSrc ? (imageSrc.match(/data:([^;]+);/) || [])[1] || 'image/png' : 'image/png';
            const imageExt = imageMimeType.split('/')[1] || 'png';

            const fullConfig = {
                nivel: config?.name || 'Básico',
                dificultad: config?.difficulty || 3,
                tiempoLimite: config?.time || 180,
                autor: details.authorName || '',
                version: details.version || '1.0.0',
                fecha: details.date || (() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`; })(),

                descripcion: details.description || '',
                nombreApp: details.gameName || 'Rompecabezas',
                plataformas: Array.isArray(selectedPlats) ? selectedPlats : ['android'],
                areasSeleccionadas: selectedAreas || [],
                habilidadesSeleccionadas: selectedSkills || [],
                numImagenes: 1,
                imagen: `/images/puzzle-image.${imageExt}`
            };

            const androidApplicationId = buildRompecabezasApplicationId();
            zip.file(
                "android/app/src/main/assets/public/config/rompecabezas-config.json",
                JSON.stringify(fullConfig, null, 2)
            );
            await applyRompecabezasAndroidMetadata(zip, { applicationId: androidApplicationId });

            if (imageBase64) {
                zip.file(
                    `android/app/src/main/assets/public/images/puzzle-image.${imageExt}`,
                    imageBase64,
                    { base64: true }
                );
            }


            const androidBlob = await zip.generateAsync({ type: "blob" });
            const mobilePlatforms = (selectedPlatforms ?? [])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            outerZip.file(`${normalizeFileName(details?.gameName || 'rompecabezas')}_${mobilePlatforms}.zip`, androidBlob);

            // ── ZIP contenedor final ──
            setStatusText("Empaquetando todo...");
            const finalBlob = await outerZip.generateAsync({ type: "blob" });
            const platformsLabel = (selectedPlatforms ?? [])
                .map(p => platformLabel(p))
                .join('_');
            const url = window.URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'rompecabezas')}_${platformsLabel}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setProgress(100); setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error("Error generando ZIP combinado:", error);
            setStatusText("Error al generar el archivo combinado.");
            setIsGenerating(false);
        }
    };

    // ── Botón inteligente: decide qué descargar según plataformas ──
    const handleSmartDownload = () => {
        if (isGenerating || !jsZipReady) return;
        const hasWeb = selectedPlatforms?.some(p => p.toLowerCase() === 'web');
        const hasAndroid = selectedPlatforms?.some(p => p.toLowerCase() === 'android');

        if (hasWeb && hasAndroid) {
            setIsGenerating(true); setProgress(0); setStatusText("Iniciando...");
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += Math.floor(Math.random() * 6) + 3;
                if (currentProgress >= 90) {
                    clearInterval(interval);
                    setProgress(90);
                    setStatusText("Empaquetando plataformas...");
                    generateAndDownloadCombinedZip();
                } else {
                    if (currentProgress > 20 && currentProgress < 50) setStatusText("Generando Web...");
                    if (currentProgress >= 50 && currentProgress < 80) setStatusText("Generando Android...");
                    setProgress(currentProgress);
                }
            }, 180);
        } else if (hasAndroid) {
            handleDownloadAndroidZip();
        } else {
            handleDownloadZip();
        }
    };

    const getAreaName = (areaId) => {
        const areas = { science: 'Ciencia', technology: 'Tecnología', engineering: 'Ingeniería', arts: 'Arte', math: 'Matemáticas' };
        return areas[areaId] || areaId;
    };

    const getAreaIcon = (areaId) => {
        const icons = {
            science: '/images/areas/Ciencia.png',
            technology: '/images/areas/Tecnologia.png',
            engineering: '/images/areas/Ingenieria.png',
            arts: '/images/areas/Artes.png',
            math: '/images/areas/Matematicas.png'
        };
        return icons[areaId] || 'https://placehold.co/32x32/eee/aaa?text=?';
    };
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        try {
            const normalized = dateString.includes('T') ? dateString : dateString + 'T00:00:00';
            return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (error) { return "Fecha inválida"; }
    };

    return (
        <div className="summary-screen">
            <style>{summaryStyles}</style>
            <h2 style={{ color: '#0077b6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <CheckCircle size={32} color="#22c55e" /> ¡Configuración Exitosa!
            </h2>
            <p className="rules-text">Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.</p>

            <h1 className="selection-title" style={{ textAlign: 'center', color: '#0077b6', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>
                Resumen de la Configuración
            </h1>

            <div className="summary-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="info-grid">
                    <div className="info-card">
                        <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
                        <div className="info-card-value">{gameDetails.gameName || 'Rompecabezas'}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><Tag size={16} /> Autor</div>
                        <div className="info-card-value">{gameDetails.authorName || 'No especificado'}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><Layers size={16} /> Versión</div>
                        <div className="info-card-value">{gameDetails.version || '1.0.0'}</div>
                    </div>
                    <div className="info-card full-width">
                        <div className="info-card-header"><FileText size={16} /> Descripción</div>
                        <div className="info-card-value">{gameDetails.description || 'Sin descripción'}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><Calendar size={16} /> Fecha de Creación</div>
                        <div className="info-card-value">{formatDate(gameDetails.date)}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><Monitor size={16} /> Plataformas</div>
                        <div className="info-card-value">
                            {selectedPlatforms && selectedPlatforms.length > 0
                                ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
                                : 'Web'}
                        </div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2.5rem 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                    <div className="info-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#0077b6' }}>
                            <Shapes size={20} color="#3b82f6" /> Áreas Seleccionadas
                        </h4>
                        {selectedAreas?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {selectedAreas.map(areaId => (
                                    <span key={areaId} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.5rem 0.75rem', background: '#eff6ff',
                                        borderRadius: '0.5rem', fontSize: '0.95rem', color: '#1e40af'
                                    }}>
                                        <img src={getAreaIcon(areaId)} alt="" style={{ width: '20px', height: '20px', borderRadius: '4px' }} onError={(e) => { e.target.src = 'https://placehold.co/20x20/eee/aaa?text=?'; }} />
                                        {getAreaName(areaId)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay áreas seleccionadas.</p>
                        )}
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
                        ) : (
                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay habilidades seleccionadas.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="summary-card" style={{ marginTop: '2.5rem' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#0077b6' }}>
                    Parámetros del Juego
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', rowGap: '1rem', alignItems: 'center' }}>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Type size={18} /> Dificultad:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.name} ({config.difficulty}x{config.difficulty})</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Tiempo Límite:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{formatTime(config.time)} minutos</strong>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#334155' }}>Imagen Seleccionada:</strong>
                    <img src={imageSrc} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    <button className="btn-primary-summary" onClick={onBack} disabled={isGenerating} style={{ opacity: isGenerating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={18} /> Volver a Editar
                    </button>
                </div>
            </div>

            <div className="download-section">
                <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                    <h3 style={{ color: '#0077b6', marginBottom: '0.5rem' }}>Descargar Paquete del Juego</h3>
                    <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                        Genera el archivo .zip listo para descargar en su computadora.
                    </p>

                    {/* ── TABS DE PLATAFORMAS ── */}
                    <div style={{
                        display: 'inline-flex', gap: '0.5rem', background: '#e2e8f0',
                        borderRadius: '2rem', padding: '4px', marginBottom: '1rem'
                    }}>
                        {selectedPlatforms?.some(p => p.toLowerCase() === 'web') && (
                            <span style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 16px', borderRadius: '2rem', fontSize: '0.85rem',
                                fontWeight: '600', background: '#ffffff', color: '#0077b6',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                                Web
                            </span>
                        )}
                        {selectedPlatforms?.some(p => p.toLowerCase() === 'android') && (
                            <span style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 16px', borderRadius: '2rem', fontSize: '0.85rem',
                                fontWeight: '600', background: '#ffffff', color: '#16a34a',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                    <line x1="12" y1="18" x2="12.01" y2="18" />
                                </svg>
                                Android
                            </span>
                        )}
                    </div>

                    {/* Descripción dinámica */}
                    <p style={{
                        fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.5rem',
                        background: '#f1f5f9', borderRadius: '0.5rem', padding: '8px 14px',
                        border: '1px dashed #cbd5e1'
                    }}>
                        {(() => {
                            const hasWeb = selectedPlatforms?.some(p => p.toLowerCase() === 'web');
                            const hasAndroid = selectedPlatforms?.some(p => p.toLowerCase() === 'android');
                            if (hasWeb && hasAndroid) return '📦 Se generará un ZIP con el paquete Web y el proyecto Android incluidos.';
                            if (hasAndroid) return '📱 Se generará el proyecto Android (plantilla Capacitor).';
                            return '🌐 Se generará el archivo HTML del juego listo para web.';
                        })()}
                    </p>

                    {/* Barra de progreso */}
                    {isGenerating && (
                        <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: '500' }}>
                                <span>{statusText}</span><span>{progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', marginTop: '0.5rem' }}>
                                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#0077b6', transition: 'width 0.3s ease-out', borderRadius: '7px' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── BOTÓN INTELIGENTE ÚNICO ── */}
                <button
                    className="btn-primary-summary btn-success"
                    onClick={handleSmartDownload}
                    disabled={isGenerating || !jsZipReady}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        boxShadow: '0 4px 14px 0 rgba(0, 95, 146, 0.35)',
                        minWidth: '240px', justifyContent: 'center',
                        fontSize: '1rem', padding: '0.85rem 2rem',
                        cursor: (isGenerating || !jsZipReady) ? 'wait' : 'pointer',
                        opacity: (isGenerating || !jsZipReady) ? 0.8 : 1,
                        borderRadius: '0.75rem', fontWeight: '700', letterSpacing: '0.02em'
                    }}
                >
                    {!jsZipReady ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ animation: 'spin 1s linear infinite' }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Cargando librería...
                        </>
                    ) : isGenerating ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ animation: 'spin 1s linear infinite' }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Generando...
                        </>
                    ) : (selectedPlatforms?.filter(p => ['web', 'android'].includes(p.toLowerCase())).length > 1) ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                            Generar (.zip)
                        </>
                    ) : selectedPlatforms?.some(p => p.toLowerCase() === 'android') ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Generar (.zip)
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Generar (.zip)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// --- COMPONENTE VISTA PREVIA (Estilo Acertijo.jsx) ---
const PuzzlePreviewContent = ({ imageSrc, level, onBack, onFinishConfig }) => {
    const { difficulty, time: timeLimit } = level;
    const [board, setBoard] = useState([]);
    const [panelPieces, setPanelPieces] = useState([]);
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [score, setScore] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const draggedItem = useRef(null);
    const timerRef = useRef(null);
    const pieceSize = 100;

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        clearInterval(timerRef.current);
                        setIsActive(false);
                        window.Swal.fire({ title: 'Tiempo Agotado', icon: 'warning', confirmButtonText: 'Reiniciar' })
                            .then(() => initializeGame());
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive]);

    const initializeGame = () => {
        clearInterval(timerRef.current);
        const total = difficulty * difficulty;
        setBoard(Array(total).fill({ piece: null, isCorrect: false }));
        const pieces = Array.from({ length: total }, (_, i) => ({ id: i, originalIndex: i }));
        setPanelPieces(pieces.sort(() => Math.random() - 0.5));
        setTimeLeft(timeLimit);
        setScore(0);
        setIsActive(false);
    };

    useEffect(() => { initializeGame(); }, [difficulty]);

    const getPieceStyle = (piece) => {
        const row = Math.floor(piece.originalIndex / difficulty);
        const col = piece.originalIndex % difficulty;
        const xPercent = difficulty === 1 ? 0 : (col / (difficulty - 1)) * 100;
        const yPercent = difficulty === 1 ? 0 : (row / (difficulty - 1)) * 100;
        return {
            backgroundImage: `url(${imageSrc})`,
            backgroundPosition: `${xPercent}% ${yPercent}%`,
            backgroundSize: `${difficulty * 100}% ${difficulty * 100}%`,
            backgroundRepeat: 'no-repeat',
            width: `${pieceSize}px`, height: `${pieceSize}px`
        };
    };

    const handleDragStart = (piece, origin, index) => (e) => {
        e.dataTransfer.setData("text/plain", piece.id);
        draggedItem.current = { piece, origin, index };
    };

    const handleDropOnBoard = (idx) => {
        if (!isActive || !draggedItem.current || board[idx].piece) return;
        const { piece, origin, index: originIdx } = draggedItem.current;
        const newBoard = [...board];
        newBoard[idx] = { piece, isCorrect: piece.originalIndex === idx };

        if (origin === 'panel') {
            setPanelPieces(panelPieces.filter(p => p.id !== piece.id));
        } else {
            newBoard[originIdx] = { piece: null, isCorrect: false };
        }
        setBoard(newBoard);
        draggedItem.current = null;
        checkWin(newBoard);
    };

    const handleDropOnPanel = () => {
        if (!isActive || !draggedItem.current || draggedItem.current.origin === 'panel') return;
        const { piece, index: originIdx } = draggedItem.current;
        const newBoard = [...board];
        newBoard[originIdx] = { piece: null, isCorrect: false };
        setBoard(newBoard);
        setPanelPieces([...panelPieces, piece]);
        draggedItem.current = null;
    };

    const checkWin = (currentBoard) => {
        if (currentBoard.every(slot => slot.piece && slot.isCorrect)) {
            clearInterval(timerRef.current);
            setIsActive(false);
            // Puntuación fija: 10 puntos al ganar
            setScore(10);
            // Invocar el modal final idéntico a Acertijo.jsx
            setTimeout(() => handleFinishGame(true), 500);
        }
    };

    const handleFinishGame = (completed = false) => {
        // Mostrar modal para confirmar - IDÉNTICO A ACERTIJO.JSX
        window.Swal.fire({
            title: completed ? '¡Juego Completado!' : '¡Juego Finalizado!',
            html: `<p>Puntaje Obtenido: <strong>${completed ? 10 : score}</strong></p>`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Volver a Jugar',
            cancelButtonText: 'Salir',
            confirmButtonColor: '#0077b6', // Color primario
            cancelButtonColor: '#4b5563', // Color secundario (gris oscuro)
            reverseButtons: true,
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                // Volver a Jugar: Reinicia el juego
                initializeGame();
                setIsActive(true);
            } else if (result.dismiss === window.Swal.DismissReason.cancel) {
                // Salir: Regresa a la pantalla de configuración
                onBack();
            }
        });
    }

    return (
        <>

            <div className="game-layout">
                <div className="game-left-col">
                    {/* START OVERLAY */}
                    {!isActive && timeLeft === timeLimit && (
                        <div style={{ marginBottom: '1rem' }}>
                            <button className="btn-primary" onClick={() => setIsActive(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <Play size={20} /> Comenzar Juego
                            </button>
                        </div>
                    )}

                    <div className="puzzle-area-wrapper">
                        {/* POOL */}
                        <div
                            className="puzzle-pieces-pool"
                            onDragOver={e => e.preventDefault()}
                            onDrop={handleDropOnPanel}
                            style={{ gridTemplateColumns: `repeat(${difficulty}, 1fr)` }}
                        >
                            {panelPieces.map((p) => (
                                <div
                                    key={p.id} className={`puzzle-piece ${!isActive ? 'disabled' : ''}`}
                                    style={getPieceStyle(p)}
                                    draggable={isActive}
                                    onDragStart={handleDragStart(p, 'panel', -1)}
                                />
                            ))}
                        </div>

                        {/* BOARD */}
                        <div className="puzzle-board-container">
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${difficulty}, 1fr)` }}>
                                {board.map((slot, i) => (
                                    <div
                                        key={i}
                                        className="puzzle-slot"
                                        style={{ width: `${pieceSize}px`, height: `${pieceSize}px` }}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={() => handleDropOnBoard(i)}
                                    >
                                        {slot.piece && (
                                            <div
                                                className={`puzzle-piece ${slot.isCorrect ? 'correct' : 'incorrect'}`}
                                                style={getPieceStyle(slot.piece)}
                                                draggable={isActive}
                                                onDragStart={handleDragStart(slot.piece, 'board', i)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="game-right-col">
                    <div className="stats-block">
                        <h3>Progreso</h3>
                        <div className="stats-item"><span>Nivel:</span> <strong>{level.name}</strong></div>
                        <div className="stats-item"><span>Tiempo Límite:</span> <strong>{formatTime(timeLeft)}</strong></div>

                        <div className="stats-item"><span>Puntaje:</span> <strong>{score}</strong></div>
                        <div className="stats-item"><span>Piezas:</span> <strong>{board.filter(x => x.piece).length}/{difficulty * difficulty}</strong></div>
                    </div>
                    <button className="btn-primary" onClick={() => handleFinishGame(false)}>
                        Finalizar Juego
                    </button>
                </div>
            </div>

            <div className="nav-footer">
                <button className="no-rounded-button" onClick={onBack}>
                    <ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior
                </button>
                <button className="no-rounded-button" onClick={onFinishConfig}>
                    <IconConfigure size={16} style={{ marginRight: '0.5rem' }} /> Terminar Configuración <ArrowRight style={{ marginLeft: '0.5rem' }} />
                </button>
            </div>
        </>
    );
};

// --- COMPONENTE PRINCIPAL (Configuración) ---

// Agregar esta función después de las constantes LEVELS
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
const Rompecabezas = () => {
    const [view, setView] = useState('home');
    const [imageSrc, setImageSrc] = useState(null);
    const [fileName, setFileName] = useState('');
    const [levelKey, setLevelKey] = useState('basico');
    const fileInputRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!document.getElementById('sweetalert-script')) {
            const s = document.createElement('script'); s.id = 'sweetalert-script';
            s.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11'; document.head.appendChild(s);
        }
    }, [view]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                window.Swal?.fire({ icon: 'error', title: 'Formato inválido', text: 'Solo imágenes JPG, PNG, GIF.' });
                return;
            }
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (ev) => setImageSrc(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setImageSrc(null); setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const goToSummary = () => {
        setView('summary');
        navigate('/settings?view=summary', { replace: true, state: location.state });
    };

    const renderConfigScreen = () => (
        <div className="config-screen">
            <div className="game-title">
                {'Juego de Rompecabezas'.split('').map((letter, index) => (
                    <span key={index} style={{ animationDelay: `${index * 0.07}s` }}>
                        {letter === ' ' ? '\u00A0' : letter}
                    </span>
                ))}
            </div>

            <div className="rules-text">
                <h2>Configura tu juego seleccionando la imagen deseada y seleccionando la dificultad.</h2>
            </div>

            <div className="config-controls">
                <div className="control-group">
                    <label>Seleccione el nivel de dificultad:</label>
                    <select value={levelKey} onChange={(e) => setLevelKey(e.target.value)}>
                        {Object.keys(LEVELS).map(k => (
                            <option key={k} value={k}>{LEVELS[k].name} ({LEVELS[k].difficulty}x{LEVELS[k].difficulty})</option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label>Seleccione la imagen del Rompecabezas:</label>
                    <div className="file-input-wrapper" onClick={() => fileInputRef.current?.click()}>
                        {imageSrc ? (
                            <>
                                <img src={imageSrc} alt="Preview" style={{ maxHeight: '250px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                                    <CheckCircle size={20} color="#22c55e" />
                                    <span style={{ fontWeight: '600' }}>{fileName}</span>
                                </div>
                                <button onClick={removeImage} className="no-rounded-button" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginTop: '1rem', background: '#fee2e2', color: '#ef4444' }}>
                                    <Trash2 size={16} style={{ marginRight: '4px' }} /> Cambiar Imagen
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ background: '#e0f2fe', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                    <Upload size={48} color="#0077b6" />
                                </div>
                                <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Haz clic para seleccionar una imagen</span>
                                <small style={{ color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' }}>Formatos Permitidos: JPG, PNG, GIF</small>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                    </div>
                </div>
            </div>

            <div className="config-footer">
                <button onClick={() => navigate(-1)} className="no-rounded-button">
                    <ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior
                </button>
                <button
                    onClick={() => setView('preview')}
                    disabled={!imageSrc}
                    className="no-rounded-button"
                >
                    Siguiente <ArrowRight style={{ marginLeft: '0.5rem' }} />
                </button>
            </div>
        </div>
    );

    return (
        <>
            <Style />
            <div className="acertijo-container">
                {view === 'summary' ? (
                    <Summary config={LEVELS[levelKey]} imageSrc={imageSrc} onBack={() => setView('home')} />
                ) : view === 'preview' ? (
                    <div className="game-screen">
                        {/* Título Animado */}
                        <div className="game-title">
                            {'Juego de Rompecabezas'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${i * 0.07}s` }}>{c === ' ' ? '\u00A0' : c}</span>)}
                        </div>
                        <h3 style={{ textAlign: 'center', color: '#6b7280', marginTop: '-0.5rem', marginBottom: '1.5rem', fontWeight: '500' }}>(Vista Previa)</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            margin: '0 auto 1.5rem auto',
                            maxWidth: '600px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '0.75rem',
                            padding: '0.85rem 1.25rem',
                            textAlign: 'center'
                        }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem' }}>📋 Reglas Básicas</span>
                            <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>Coloca las piezas correctamente para formar la imagen.</span>
                        </div>
                        {/* Lógica del juego insertada aquí para tener control total del layout */}
                        <PuzzlePreviewContent
                            imageSrc={imageSrc}
                            level={LEVELS[levelKey]}
                            onFinishConfig={goToSummary}
                            onBack={() => setView('home')}
                        />
                    </div>
                ) : (
                    renderConfigScreen()
                )}
            </div>
        </>
    );
};

export default Rompecabezas;