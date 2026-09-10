import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, Download, FileText, Calendar,
    Monitor, Shapes, Puzzle, List, Clock, Type, Tag, Layers,
    Play, HelpCircle, RotateCcw, Info, Timer, Star, CheckSquare,
    ArrowRight, GripVertical, Shuffle, User
} from 'lucide-react';

const IconConfigure = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"></path>
    </svg>
);

// --- ESTILOS COMPARTIDOS (IDÉNTICOS A ACERTIJO.JSX) ---
const Style = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap');
    
    /* --- ESTILOS GENERALES --- */
    :root {
      --primary-color: #005f92;
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

    .config-controls {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      align-items: end;
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
    }
    .control-group select {
      padding: 0.75rem;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      font-size: 1rem;
      background: white;
    }

    /* --- GRID DE ELEMENTOS (CATÁLOGO) --- */
    .riddle-catalog {
        border: 1px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        padding: 1.5rem;
        flex-grow: 1;
        overflow-y: auto;
        max-height: 500px;
        background: #fafafa;
    }
    
    .riddle-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }

    .riddle-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 0.75rem;
    }

    .acertijo-select-btn {
        background: white;
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid var(--medium-gray-color);
        transition: all 0.2s ease;
        text-align: left;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;
        width: 100%;
        color: var(--dark-text);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    
    .acertijo-select-btn:hover {
        background-color: var(--light-gray-color);
        border-color: var(--primary-color);
    }

    .acertijo-select-btn.selected {
        background-color: #e0f2fe;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
    }

    /* --- BOTONES DE NAVEGACIÓN --- */
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
        background-color: #005f92;
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
    
    .question-card {
        background: white;
        padding: 1.5rem; 
        border-radius: 1rem; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
        text-align: center; 
        min-height: 150px; 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        align-items: center; 
        position: relative;
        border: 1px solid var(--medium-gray-color);
    }

    .question-text {
        font-family: 'Merriweather', serif; 
        font-size: 1.5rem; 
        color: var(--secondary-color); 
        line-height: 1.5;
        margin-top: 1rem;
    }

    .topic-badge {
        background: #e0f2fe; 
        color: var(--primary-color); 
        padding: 0.25rem 1rem; 
        border-radius: 2rem; 
        font-weight: 700; 
        font-size: 0.8rem; 
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
    }

    /* Estilos específicos para Ordenamiento (Restaurando 2 columnas) */
    .dnd-container-restored {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 1.5rem;
        align-items: start;
        width: 100%;
    }
    
    .dnd-column {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .dnd-column h3 {
        text-align: center;
        font-size: 1.1rem;
        color: var(--dark-gray-color);
        margin: 0 0 0.5rem 0;
    }

    .dnd-list-box {
        background: #f8fafc;
        border: 1px solid var(--medium-gray-color);
        border-radius: 0.75rem;
        min-height: 300px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .dnd-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding-top: 3rem;
        color: var(--medium-gray-color);
    }

    .dnd-item {
        background: white;
        border: 1px solid var(--medium-gray-color);
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        cursor: grab;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--dark-text);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
    }
    
    .dnd-item:hover {
        transform: translateY(-2px);
        border-color: var(--primary-color);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 10;
    }
    
    .dnd-item.dragging {
        opacity: 0.5;
        border: 2px dashed var(--primary-color);
        background: #e0f2fe;
    }
    
    .dnd-item.static {
        cursor: default;
        background: #f1f5f9;
        color: #64748b;
        border-style: dashed;
    }
    .dnd-item.static:hover {
        transform: none;
        border-color: var(--medium-gray-color);
        box-shadow: none;
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

    @media (max-width: 900px) {
        .config-controls, .game-layout { grid-template-columns: 1fr; }
        .game-layout { gap: 1rem; }
        .dnd-container-restored { grid-template-columns: 1fr; }
        .dnd-arrow { transform: rotate(90deg); padding: 1rem 0; }
    }
    `}</style>
);

// --- ESTILOS DEL SUMMARY (Idénticos a Acertijo.jsx) ---
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

// --- GENERADOR HTML (Restaurando DnD de dos columnas y Modales Correctos) ---
const generateGameCode = (config, gameDetails, selectedPlatforms) => {
    if (!config) config = { difficulty: "Básico", timeLimit: 300, exercises: [] };
    const rawDate = (() => {
        try {
            const stored = typeof localStorage !== 'undefined'
                ? localStorage.getItem('acertijo:creation_date')
                : null;
            return stored || gameDetails?.date || new Date().toISOString();
        } catch { return gameDetails?.date || new Date().toISOString(); }
    })();
    const formattedDate = (() => {
        try {
            return new Date(rawDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Fecha no especificada'; }
    })();

    const platformsString = selectedPlatforms && selectedPlatforms.length > 0
        ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
        : 'Web';

    const titleText = gameDetails.gameName || 'Ordenamiento de Información';
    const animatedTitleHTML = `
    <div class="game-title">
        ${'Juego de Ordenamiento de Información'.split('').map((char, index) =>
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
    <title>${gameDetails.gameName || 'Ordenamiento de Información'} - ${config.difficulty}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root { 
            --primary-color: #005f92; /* Match React Preview */
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
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 950px; display: flex; flex-direction: column; }
        
        .game-layout { display: grid; grid-template-columns: 1fr 250px; gap: 2rem; width: 100%; }
        @media (max-width: 768px) { .game-layout { grid-template-columns: 1fr; } }

        .question-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center; min-height: 150px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; border: 1px solid var(--medium-gray); margin-bottom: 1.5rem; }
        .question-text { font-family: 'Merriweather', serif; font-size: 1.5rem; color: var(--secondary-color); line-height: 1.5; margin-top: 1rem; }
        .topic-badge { background: #e0f2fe; color: var(--primary-color); padding: 0.25rem 1rem; border-radius: 2rem; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; position: absolute; top: 1rem; }
        
        /* Drag and Drop Styles */
        .dnd-container-restored { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1.5rem; align-items: start; width: 100%; }
        .dnd-column { display: flex; flex-direction: column; gap: 0.5rem; }
        .dnd-column h3 { text-align: center; font-size: 1.1rem; color: var(--dark-gray); margin: 0 0 0.5rem 0; }
        .dnd-list-box { background: #f8fafc; border: 1px solid var(--medium-gray); border-radius: 0.75rem; min-height: 300px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .dnd-arrow { display: flex; align-items: center; justify-content: center; height: 100%; padding-top: 3rem; color: var(--medium-gray); }

        .dnd-item { background: white; border: 1px solid var(--medium-gray); padding: 0.75rem 1rem; border-radius: 0.5rem; cursor: grab; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; color: var(--dark-text); box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-weight: 600; font-family: 'Inter', sans-serif; font-size: 0.95rem; }
        .dnd-item:hover { transform: translateY(-2px); border-color: var(--primary-color); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); z-index: 10; }
        .dnd-item.dragging { opacity: 0.5; border: 2px dashed var(--primary-color); background: #e0f2fe; }
        .dnd-item.static { cursor: default; background: #f1f5f9; color: #64748b; border-style: dashed; }

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
        
        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; min-width: 200px; }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .btn-exit { background: #1f2937; }
        .btn-retry { background: var(--primary-color); }
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }
        
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        /* Animated Title */
        .game-title { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        .game-title.static span { animation: none; transform: none; }
        @keyframes wave-animation { 0%, 40%, 100% { transform: translateY(0); } 20% { transform: translateY(-20px); } }

        /* Modal Info */
        .info-modal-content { background: white; padding: 2.5rem; border-radius: 1rem; max-width: 600px; width: 90%; position: relative; border: 1px solid #e5e7eb; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .info-header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .info-title { font-size: 1.8rem; color: var(--primary-color); margin: 0; font-weight: 800; }
        .info-subtitle { color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; }
        .info-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
        .info-item { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .info-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 0.25rem; }
        .info-value { font-size: 1.1rem; color: #334155; font-weight: 500; }
        .info-desc { grid-column: 1 / -1; background: #fff; padding: 0; border: none; }
        .close-info-btn { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
        
        @media (max-width: 768px) {
             .dnd-container-restored { grid-template-columns: 1fr; }
             .dnd-arrow { transform: rotate(90deg); padding: 1rem 0; }
        }
    </style>
</head>
<body>
    <div id="start-screen" class="overlay">
    <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">Ordenamiento de Información</h2>

        <div style="background: #e0f2fe; color: #005f92; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem;">
            Nivel: ${config.difficulty}
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
                <h2 class="info-title">Ordenamiento de Información</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
            </div>
            <div class="info-details-grid">
                <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${gameDetails.authorName || 'No especificado'}</span></div>

                <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${gameDetails.version || '1.0.0'}</span></div>
                <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-item"><span class="info-label">Dificultad</span><span class="info-value">${config.difficulty}</span></div>
                <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${platformsString}</span></div>
                <div class="info-item info-desc">
                    <span class="info-label">Descripción</span>
                    <p style="color:#475569; line-height:1.6;">${gameDetails.description || 'Ejercicio de ordenamiento lógico.'}</p>
                </div>
            </div>
            <div style="text-align: center;"><button class="big-btn" style="padding: 0.5rem 2rem; font-size: 1rem;" onclick="toggleInfo(false)">Cerrar</button></div>
        </div>
    </div>

    <div id="end-screen" class="overlay hidden">
        <h1 id="end-title" style="color:var(--primary-color); font-size:3rem; font-weight: 800;">Fin del Juego</h1>
        <h2 style="color:var(--secondary-color); font-size:2rem; margin:1rem 0;">Puntos Obtenidos: <span id="final-score">0</span></h2>
        <div class="end-buttons">
             <button class="big-btn btn-exit" onclick="exitGame()">Salir</button>
             <button class="big-btn btn-retry" onclick="location.reload()">Volver a Jugar</button>
        </div>
    </div>

    <div class="container" id="game-ui" style="display:none;">
        ${animatedTitleHTML}
        <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
    <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
    <span style="font-size:1rem; color:#1e40af; font-weight:500;">Organiza los pasos en la secuencia acertada.</span>
</div>
        <div class="game-layout">
            <div class="game-left-col">
                <div class="question-card" id="memory-view">
                    <span class="topic-badge">Memoriza</span>
                    <h2 class="question-text" id="mem-title">Título</h2>
                    <p id="mem-desc" style="color:#666; margin-bottom:1rem;"></p>
                    <div style="color:var(--wrong); font-weight:bold; font-size:1.5rem;" id="mem-timer">5</div>
                    <div id="mem-list" class="static-list-container" style="flex-direction:column; align-items:flex-start;"></div>
                </div>

                <div id="play-view" class="hidden">
                    <div class="question-card" style="margin-bottom:1.5rem;">
                         <span class="topic-badge">Ordena</span>
                        <h2 class="question-text" id="play-title">Título</h2>
                    </div>
                    
                    <div class="dnd-container-restored">
                        <div class="dnd-column">
                            <h3>Opciones</h3>
                            <div id="static-list-container" class="dnd-list-box"></div>
                        </div>
                        <div class="dnd-arrow"><i data-lucide="arrow-right" style="width:32px; height:32px;"></i></div>
                        <div class="dnd-column">
                            <h3>Tu Orden</h3>
                            <div id="user-list" class="dnd-list-box"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="game-right-col">
                <div class="stats-block">
                    <h3>Progreso</h3>
                    <div class="stats-item"><span>Nivel:</span> <strong>${config.difficulty}</strong></div>
                    <div class="stats-item"><span>Tiempo:</span> <strong id="timer-display">00:00</strong></div>
                    <div class="stats-item"><span>Puntaje:</span> <strong id="score-display">0</strong></div>
                    <div class="stats-item"><span>Ejercicio:</span> <strong id="progress-display">1 / ${config.exercises.length}</strong></div>
                </div>
                <button class="btn btn-primary" onclick="checkSolution()">Validar Solución</button>
                <button class="btn btn-primary" margin-top:0.5rem;" onclick="endGame(false)">Finalizar Juego</button>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        let state = { currentIdx: 0, score: 0, timeLeft: config.timeLimit, timerId: null, userOrder: [] };
        
        function toggleInfo(show) {
            const el = document.getElementById('info-overlay');
            if(show) { el.classList.remove('hidden'); el.style.display = 'flex'; }
            else { el.classList.add('hidden'); setTimeout(()=>el.style.display='none', 300); }
        }

        function formatTime(s) {
    const m = Math.floor(s/60).toString().padStart(2,'0');
    const sec = (s%60).toString().padStart(2,'0');
    return m + ':' + sec;
}

        function exitGame() {
            window.close();
            Swal.fire({
                title: 'Juego Finalizado',
                text: 'Por favor, cierra esta pestaña manualmente.',
                icon: 'info',
                confirmButtonText: 'Entendido'
            });
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const display = document.getElementById('countdown-display');
            display.innerText = count;
            const int = setInterval(() => {
                count--;
                if(count > 0) {
                    display.innerText = count;
                    display.style.animation = 'none';
                    display.offsetHeight; 
                    display.style.animation = 'popIn 0.5s ease-out';
                } else {
                    clearInterval(int);
                    document.getElementById('countdown-screen').classList.add('hidden');
                    initGame();
                }
            }, 1000);
        }

        function formatTime(s) {
            const m = Math.floor(s/60).toString().padStart(2,'0');
            const sec = (s%60).toString().padStart(2,'0');
            return m + ':' + sec;
        }

        function initGame() {
    document.getElementById('game-ui').style.display = 'block';
    state.timerId = setInterval(() => {
        state.timeLeft--;
        document.getElementById('timer-display').innerText = formatTime(state.timeLeft); // CAMBIO AQUÍ
        if(state.timeLeft <= 0) endGame(false);
    }, 1000);
    loadExercise();
}

        function loadExercise() {
            const ex = config.exercises[state.currentIdx];
            document.getElementById('progress-display').innerText = (state.currentIdx + 1) + ' / ' + config.exercises.length;
            
            // Memory Phase
            document.getElementById('play-view').classList.add('hidden');
            document.getElementById('memory-view').classList.remove('hidden');
            
            document.getElementById('mem-title').innerText = ex.title;
            document.getElementById('mem-desc').innerText = ex.description;
            const memList = document.getElementById('mem-list');
            memList.innerHTML = '';
            ex.steps.forEach((s, i) => {
                const item = document.createElement('div');
                item.style.marginBottom = '0.5rem';
                item.innerHTML = '<b>'+(i+1)+'.</b> ' + s;
                memList.appendChild(item);
            });

            let memTime = 5;
            document.getElementById('mem-timer').innerText = memTime;
            const memInt = setInterval(() => {
                memTime--;
                document.getElementById('mem-timer').innerText = memTime;
                if(memTime <= 0) {
                    clearInterval(memInt);
                    startPlayPhase(ex);
                }
            }, 1000);
        }

        function startPlayPhase(ex) {
            document.getElementById('memory-view').classList.add('hidden');
            document.getElementById('play-view').classList.remove('hidden');
            document.getElementById('play-title').innerText = ex.title;

            const shuffledStatic = [...ex.steps].sort(() => Math.random() - 0.5);
            const staticContainer = document.getElementById('static-list-container');
            staticContainer.innerHTML = '';
            shuffledStatic.forEach(s => {
                const d = document.createElement('div');
                d.className = 'dnd-item static';
                d.innerText = s;
                staticContainer.appendChild(d);
            });

            let shuffledUser = [...ex.steps].sort(() => Math.random() - 0.5);
            while(JSON.stringify(shuffledUser) === JSON.stringify(ex.steps)) {
                 shuffledUser = [...ex.steps].sort(() => Math.random() - 0.5);
            }
            state.userOrder = shuffledUser;
            renderUserList();
            lucide.createIcons();
        }

        let draggedItemIdx = null;

        function renderUserList() {
            const container = document.getElementById('user-list');
            container.innerHTML = '';
            state.userOrder.forEach((itemText, idx) => {
                const el = document.createElement('div');
                el.className = 'dnd-item';
                el.draggable = true;
                el.innerHTML = '<span style="color:#aaa; margin-right:8px;">☰</span> ' + itemText;
                
                el.addEventListener('dragstart', (e) => {
                    draggedItemIdx = idx;
                    el.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                
                el.addEventListener('dragend', () => {
                    el.classList.remove('dragging');
                    draggedItemIdx = null;
                });

                el.addEventListener('dragover', (e) => e.preventDefault());
                
                el.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    if (draggedItemIdx === null || draggedItemIdx === idx) return;
                    const item = state.userOrder.splice(draggedItemIdx, 1)[0];
                    state.userOrder.splice(idx, 0, item);
                    draggedItemIdx = idx;
                    renderUserList();
                });

                container.appendChild(el);
            });
        }

        function checkSolution() {
            const ex = config.exercises[state.currentIdx];
            const isCorrect = JSON.stringify(state.userOrder) === JSON.stringify(ex.steps);
            
            if(isCorrect) {
                state.score += 10;
                document.getElementById('score-display').innerText = state.score;
                Swal.fire({ title: '¡Correcto!', icon: 'success', timer: 1500, showConfirmButton: false })
                .then(() => {
                    state.currentIdx++;
                    if(state.currentIdx < config.exercises.length) {
                        loadExercise();
                    } else {
                        endGame(true);
                    }
                });
            } else {
                Swal.fire({ title: 'Incorrecto', text: 'El orden no es correcto.', icon: 'error' });
            }
        }

        function endGame(completed) {
            clearInterval(state.timerId);
            document.getElementById('game-ui').style.display = 'none';
            document.getElementById('end-screen').classList.remove('hidden');
            document.getElementById('final-score').innerText = state.score;
            document.getElementById('end-title').innerText = completed ? "¡Juego Completado!" : "Fin del Juego";
        }
        
        lucide.createIcons();
    </script>
</body>
</html>`;
};

// --- ANDROID: CONFIGURACIÓN Y GENERACIÓN DE APPLICATION ID ÚNICO ---
const ANDROID_BUILD_GRADLE_PATH = "android/app/build.gradle";
const CAPACITOR_CONFIG_PATH = "android/app/src/main/assets/capacitor.config.json";
const ANDROID_STRINGS_PATH = "android/app/src/main/res/values/strings.xml";
const ORDENARIMG_APPLICATION_ID_BASE = "io.ordenarimg.steam";

const createUuidSegment = () => {
    const rawUuid = window.crypto?.randomUUID?.()
        || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    return `uuid_${uuid}`;
};

const buildOrdenarIMGApplicationId = () => {
    return `${ORDENARIMG_APPLICATION_ID_BASE}.${createUuidSegment()}`;
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

const applyOrdenarIMGAndroidMetadata = async (zip, { applicationId }) => {
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
// --- COMPONENTE SUMMARY (Idéntico a Acertijo.jsx) ---
const Summary = ({ config, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const [jsZipReady, setJsZipReady] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};

    const MOCK_DATA = {
        selectedAreas: ['science', 'math'],
        selectedSkills: ['Resolución de problemas', 'Lógica'],
        gameDetails: {
            gameName: "Ordenamiento de Información (Preview)",
            description: "Juego de prueba de ordenamiento lógico.",
            version: "1.0.0",
            date: null
        },
        selectedPlatforms: ['web']
    };

    // Siempre fecha actual — no depender de localStorage
    const getFixedCreationDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    };

    const {
        selectedAreas = MOCK_DATA.selectedAreas,
        selectedSkills = MOCK_DATA.selectedSkills,
        gameDetails: rawGameDetails = MOCK_DATA.gameDetails,
        selectedPlatforms = MOCK_DATA.selectedPlatforms
    } = Object.keys(state).length > 0 ? state : MOCK_DATA;

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
        setIsGenerating(true);
        setProgress(0);
        setStatusText("Iniciando...");

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 10) + 2;
            if (currentProgress >= 90) {
                clearInterval(interval);
                setStatusText("Procesando recursos...");
                generateAndDownloadZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Generando código HTML...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Incrustando imágenes...");
                setProgress(currentProgress);
            }
        }, 200);
    };

    const generateAndDownloadZip = async () => {
        try {
            const zip = new window.JSZip();
            const htmlContent = generateGameCode(config, gameDetails, selectedPlatforms);

            const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'ordenar_img')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            zip.file(htmlFileName, htmlContent);
            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'ordenar_img')}_web.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setProgress(100);
            setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error(error);
            setStatusText("Error al generar.");
            setIsGenerating(false);
        }
    };

    // ── Descarga ZIP Android (Capacitor) ──────────────────────────────────────
    const handleDownloadAndroidZip = () => {
        if (isGenerating || !jsZipReady) return;
        setIsGenerating(true); setProgress(0); setStatusText("Iniciando...");
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 8) + 4;
            if (currentProgress >= 90) {
                clearInterval(interval);
                setStatusText("Inyectando recursos en Android...");
                generateAndDownloadAndroidZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Descargando plantilla Android...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando ejercicios...");
                setProgress(currentProgress);
            }
        }, 150);
    };

    const generateAndDownloadAndroidZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        try {
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/ordenamiento_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Procesando archivos ZIP...");
            const zipOriginal = await window.JSZip.loadAsync(arrayBuffer);

            setStatusText("Inyectando configuración...");

            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];

            // Nivel → normalizarNivelConfig en Reorder.tsx acepta 'basico'/'intermedio'/'avanzado'
            const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
            const nivelKey = nivelMap[config.difficulty] || config.difficulty?.toLowerCase() || 'basico';

            // Ejercicios como array de IDs string — Reorder.tsx los busca en diccionarioOrdenamiento
            const ejerciciosCompletos = config.exercises.map(e => ({
                id: e.id,
                title: e.title || e.titulo || e.id,
                description: e.description || e.titulo || '',
                steps: Array.isArray(e.steps)
                    ? e.steps
                    : (e.instruccionesOrdenadas || []).map(i => i.texto || i)
            }));

            const fullConfig = {
                nivel: nivelKey,
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                fecha: details.date
                    ? details.date.split('T')[0]
                    : new Date().toISOString().split('T')[0],
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Ordenamiento',
                plataformas: selectedPlats,
                timeLimit: config.timeLimit,
                juegos: ejerciciosCompletos.length,   // coincide con ejercicios inyectados
                ejercicios: ejerciciosCompletos            // objetos completos, no solo IDs
            };

            // Inyectar sobre el ZIP original — preserva Gradle y permisos
            const androidApplicationId = buildOrdenarIMGApplicationId();
            zipOriginal.file(
                "android/app/src/main/assets/public/config/reorder-config.json",
                JSON.stringify(fullConfig, null, 2)
            );
            await applyOrdenarIMGAndroidMetadata(zipOriginal, { applicationId: androidApplicationId });


            setStatusText("Generando paquete final...");
            const blob = await zipOriginal.generateAsync({
                type: "blob",
                platform: "UNIX"
            });

            const platformsSuffix = (Array.isArray(selectedPlats) ? selectedPlats : ['movil'])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'ordenar_img')}_${platformsSuffix}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setProgress(100); setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error("Error generando el ZIP de Android:", error);
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
            const htmlContent = generateGameCode(config, gameDetails, selectedPlatforms);
            const webZip = new window.JSZip();

            const htmlFileNameCombined = `${normalizeFileName(gameDetails?.gameName || 'ordenar_img')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            webZip.file(htmlFileNameCombined, htmlContent);
            const webBlob = await webZip.generateAsync({ type: "blob" });
            outerZip.file(`${normalizeFileName(gameDetails?.gameName || 'ordenar_img')}_web.zip`, webBlob);

            // ── Generar ZIP Android ──
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/ordenamiento_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Inyectando configuración Android...");
            const zipOriginal = await window.JSZip.loadAsync(arrayBuffer);

            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];
            const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
            const nivelKey = nivelMap[config.difficulty] || config.difficulty?.toLowerCase() || 'basico';

            const ejerciciosCompletos = config.exercises.map(e => ({
                id: e.id,
                title: e.title || e.titulo || e.id,
                description: e.description || e.titulo || '',
                steps: Array.isArray(e.steps)
                    ? e.steps
                    : (e.instruccionesOrdenadas || []).map(i => i.texto || i)
            }));

            const fullConfig = {
                nivel: nivelKey,
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                fecha: details.date ? details.date.split('T')[0] : new Date().toISOString().split('T')[0],
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Ordenamiento',
                plataformas: selectedPlats,
                timeLimit: config.timeLimit,
                juegos: ejerciciosCompletos.length,
                ejercicios: ejerciciosCompletos
            };

            const androidApplicationId = buildOrdenarIMGApplicationId();
            zipOriginal.file(
                "android/app/src/main/assets/public/config/reorder-config.json",
                JSON.stringify(fullConfig, null, 2)
            );
            await applyOrdenarIMGAndroidMetadata(zipOriginal, { applicationId: androidApplicationId });


            const androidBlob = await zipOriginal.generateAsync({ type: "blob", platform: "UNIX" });
            const mobilePlatforms = (selectedPlatforms ?? [])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            outerZip.file(`${normalizeFileName(details?.gameName || 'ordenar_img')}_${mobilePlatforms}.zip`, androidBlob);

            // ── ZIP contenedor final ──
            setStatusText("Empaquetando todo...");
            const finalBlob = await outerZip.generateAsync({ type: "blob" });
            const platformsLabel = (selectedPlatforms ?? [])
                .map(p => platformLabel(p))
                .join('_');
            const url = window.URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'ordenar_img')}_${platformsLabel}.zip`;

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

    // Helpers de iconos
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
        } catch { return 'Fecha inválida'; }
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
                        <div className="info-card-value">{gameDetails.gameName || 'No disponible'}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><User size={16} /> Autor</div>
                        <div className="info-card-value">{gameDetails.authorName || gameDetails.author || 'No especificado'}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><Layers size={16} /> Versión</div>
                        <div className="info-card-value">{gameDetails.version || '1.0.0'}</div>
                    </div>
                    <div className="info-card full-width">
                        <div className="info-card-header"><FileText size={16} /> Descripción</div>
                        <div className="info-card-value">
                            {gameDetails.description || 'Sin descripción.'}
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

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2.5rem 0' }} />

                <div className="info-grid" style={{ marginTop: '2rem' }}>
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
                                        <img src={getAreaIcon(areaId)} alt="" style={{ width: '20px', height: '20px' }} onError={(e) => { e.target.src = 'https://placehold.co/20x20/eee/aaa?text=?'; }} />
                                        {getAreaName(areaId)}
                                    </span>
                                ))}
                            </div>
                        ) : (<p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay áreas seleccionadas.</p>)}
                    </div>
                    <div className="info-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#0077b6' }}>
                            <Puzzle size={20} color="#8b5cf6" /> Habilidades Seleccionadas
                        </h4>
                        {selectedSkills?.length > 0 ? (
                            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#334155', textAlign: 'left' }}>
                                {selectedSkills.map(skill => (<li key={skill} style={{ marginBottom: '0.4rem' }}>{skill}</li>))}
                            </ul>
                        ) : (<p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay habilidades seleccionadas.</p>)}
                    </div>
                </div>
            </div>

            <div className="summary-card" style={{ marginTop: '2.5rem' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#0077b6' }}>Parámetros del Juego</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', rowGap: '1rem', alignItems: 'center' }}>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Type size={18} /> Dificultad:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.difficulty}</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Tiempo Límite:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{formatTime(config.timeLimit)} minutos</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><List size={18} /> Ejercicios:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.exercises.length}</strong>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#334155' }}>Ejercicios seleccionados:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {config.exercises.map(e => (
                            <span key={e.id} style={{
                                background: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem',
                                border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#475569'
                            }}>
                                {e.title}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    <button className="btn-primary-summary" onClick={onBack} disabled={isGenerating} style={{ opacity: isGenerating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={18} /> Volver a Editar
                    </button>
                </div>
            </div>

            <div className="download-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '3rem', padding: '2rem', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
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
                            <div style={{ width: '100%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', marginTop: '0.5rem', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
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

/* COMPONENTE PRINCIPAL */
export default function OrdenamientoInformacion() {
    const [view, setView] = useState('home');
    const [difficulty, setDifficulty] = useState('Básico');
    const [exercisePool, setExercisePool] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300);
    const [gameTimerId, setGameTimerId] = useState(null);

    // Router Hooks
    const navigate = useNavigate();
    const location = useLocation();

    // Estados Juego
    const [staticList, setStaticList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);

    const difficultySettings = useMemo(() => ({
        'Básico': { max: 3, time: 300, poolSize: 5 },
        'Intermedio': { max: 4, time: 600, poolSize: 6 },
        'Avanzado': { max: 5, time: 900, poolSize: 7 },
    }), []);

    // --- EFECTOS ---
    useEffect(() => {
        if (!document.getElementById('swal-script')) {
            const s = document.createElement('script');
            s.id = 'swal-script';
            s.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
            s.async = true;
            document.head.appendChild(s);
        }
    }, []);

    useEffect(() => {
        const settings = difficultySettings[difficulty];
        const allExercises = EXERCISE_DATA[difficulty];
        const pool = shuffleArray([...allExercises]).slice(0, settings.poolSize);
        setExercisePool(pool);
        setSelectedExercises([]);
    }, [difficulty, difficultySettings]);

    useEffect(() => {
        if (view === 'game') {
            const timerId = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timerId);
                        handleTimeUp();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            setGameTimerId(timerId);
            return () => clearInterval(timerId);
        } else {
            if (gameTimerId) clearInterval(gameTimerId);
        }
    }, [view]);

    useEffect(() => {
        let timer;
        if (view === 'memory') {
            timer = setTimeout(showGameScreen, 5000);
        }
        return () => { if (timer) clearTimeout(timer); };
    }, [view, currentExerciseIndex]);

    useEffect(() => { window.scrollTo(0, 0); }, [view]);

    const loadExercise = (exercise) => {
        const shuffled1 = shuffleArray([...exercise.steps]);
        let shuffled2 = shuffleArray([...exercise.steps]);
        while (JSON.stringify(shuffled2) === JSON.stringify(exercise.steps)) {
            shuffled2 = shuffleArray([...exercise.steps]);
        }
        setStaticList(shuffled1.map((step, i) => ({ id: `static-${i}`, content: step })));
        setUserList(shuffled2.map((step, i) => ({ id: `user-${i}`, content: step })));
    };

    const handleExerciseToggle = (exercise) => {
        setSelectedExercises(prev => {
            const isSelected = prev.find(e => e.id === exercise.id);
            const max = difficultySettings[difficulty].max;
            if (isSelected) return prev.filter(e => e.id !== exercise.id);
            if (prev.length < max) return [...prev, exercise];
            return prev;
        });
    };

    const startGame = () => {
        if (selectedExercises.length === 0) return;
        setTimeLeft(difficultySettings[difficulty].time);
        setScore(0);
        setCurrentExerciseIndex(0);
        loadExercise(selectedExercises[0]);
        setView('memory');
    };

    const showGameScreen = () => setView('game');

    const handleTimeUp = () => {
        // Si se acaba el tiempo, llamamos a finishGame con el puntaje actual
        finishGame(score);
    };

    const resetGame = () => {
        setView('home');
        setSelectedExercises([]);
    };

    const finishGame = (finalScore = score) => {
        if (window.Swal) {
            window.Swal.fire({
                title: '¡Juego Completado!',
                html: `<p>Puntaje Obtenido: <strong>${finalScore}</strong></p>`,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Volver a Jugar',
                cancelButtonText: 'Salir',
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#4b5563',
                reverseButtons: true,
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    startGame();
                } else if (result.dismiss === window.Swal.DismissReason.cancel) {
                    // Salir: Regresa a la pantalla de configuración sin reiniciar la selección (igual que Acertijo)
                    setView('home');
                }
            });
        } else {
            setView('home');
        }
    };

    const checkSolution = () => {
        const currentExercise = selectedExercises[currentExerciseIndex];
        const userOrder = userList.map(item => item.content);
        const correctOrder = currentExercise.steps;

        if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
            const newScore = score + 10;
            setScore(newScore);
            if (window.Swal) {
                window.Swal.fire({ title: '¡Correcto!', icon: 'success', timer: 1000, showConfirmButton: false })
                    .then(() => {
                        const nextIndex = currentExerciseIndex + 1;
                        if (nextIndex < selectedExercises.length) {
                            setCurrentExerciseIndex(nextIndex);
                            loadExercise(selectedExercises[nextIndex]);
                            setView('memory');
                        } else {
                            // Juego terminado correctamente
                            finishGame(newScore);
                        }
                    });
            }
        } else {
            if (window.Swal) window.Swal.fire({ title: 'Incorrecto', text: 'Intenta nuevamente.', icon: 'error' });
        }
    };

    // LOGICA DnD
    const handleDragStart = (e, item, index) => {
        setDraggedItem({ item, index });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ item, index }));
        e.currentTarget.classList.add('dragging');
    };
    const handleDragEnter = (e, targetIndex) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.index === targetIndex) return;
        let newList = [...userList];
        const [removed] = newList.splice(draggedItem.index, 1);
        newList.splice(targetIndex, 0, removed);
        setUserList(newList);
        setDraggedItem({ ...draggedItem, index: targetIndex });
    };
    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedItem(null);
    };

    const goToSummary = () => {
        setView('summary');
        navigate('/settings?view=summary', {
            replace: true,
            state: {
                ...location.state,
                gameDetails: location.state?.gameDetails || {},
                selectedPlatforms: location.state?.selectedPlatforms || []
            }
        });
    };
    const currentConfig = difficultySettings[difficulty];

    // --- RENDERS ---
    const renderSetupScreen = () => (
        <div className="config-screen">
            <div className="game-title">
                {'Ordenamiento de Información'.split('').map((char, index) => (
                    <span key={index} style={{ animationDelay: `${index * 0.07}s` }}>
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </div>

            <div className="rules-text">
                <h2>Configura tu juego seleccionando los ejercicios.</h2>
            </div>

            <div className="config-controls">
                <div className="control-group">
                    <label>Seleccione el nivel de dificultad:</label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                        {['Básico', 'Intermedio', 'Avanzado'].map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>
                <div className="control-group" style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <button className="no-rounded-button" style={{ backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', fontSize: '0.9rem' }} onClick={() => setSelectedExercises([])}>
                        <RotateCcw size={16} /> Reiniciar Selección
                    </button>
                </div>
            </div>

            <div className="riddle-catalog">
                <div className="riddle-header">
                    <strong style={{ color: '#1f2937' }}>Catálogo de Ejercicios</strong>
                    <span style={{ color: '#0077b6', fontWeight: 'bold' }}>{selectedExercises.length} / {currentConfig.max} Seleccionados</span>
                </div>
                <div className="riddle-grid">
                    {exercisePool.map(exercise => {
                        const isSelected = selectedExercises.find(e => e.id === exercise.id);
                        return (
                            <button key={exercise.id} onClick={() => handleExerciseToggle(exercise)} className={`acertijo-select-btn ${isSelected ? 'selected' : ''}`}>
                                <div style={{ marginTop: 2 }}>{isSelected ? <CheckCircle size={18} color="#0077b6" /> : <List size={18} color="#ccc" />}</div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase' }}>{exercise.title}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exercise.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="config-footer">
                <button onClick={() => navigate(-1)} className="no-rounded-button">
                    <ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior
                </button>
                <button onClick={startGame} disabled={selectedExercises.length < currentConfig.max} className="no-rounded-button">
                    Siguiente <ArrowRight style={{ marginLeft: '0.5rem' }} size={16} />
                </button>
            </div>
        </div>
    );

    const renderGame = () => {
        const exercise = selectedExercises[currentExerciseIndex];
        const isMemory = view === 'memory';
        return (
            <div className="game-screen">
                <div className="game-title">
                    {'Ordenamiento de Información'.split('').map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.07}s` }}>{char === ' ' ? '\u00A0' : char}</span>
                    ))}
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
                    <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>Organiza los pasos en la secuencia acertada.</span>
                </div>
                <div className="game-layout">
                    <div className="game-left-col">
                        {isMemory ? (
                            <div className="question-card" style={{ minHeight: '300px', justifyContent: 'flex-start' }}>
                                <span className="topic-badge">Memoriza</span>
                                <h2 className="question-text" style={{ marginBottom: '0.5rem' }}>{exercise.title}</h2>
                                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{exercise.description}</p>
                                <div style={{ color: 'var(--wrong-color)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>¡Memoriza el orden!</div>
                                <div style={{ textAlign: 'left', width: '100%', maxWidth: '400px', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed var(--primary-color)' }}>
                                    {exercise.steps.map((step, i) => (
                                        <div key={i} style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)', fontWeight: 600 }}>
                                            <span style={{ color: 'var(--primary-color)' }}>{i + 1}.</span> {step}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="question-card" style={{ marginBottom: '1.5rem' }}>
                                    <span className="topic-badge">Ordena</span>
                                    <h2 className="question-text" style={{ marginTop: '0.5rem' }}>{exercise.title}</h2>
                                </div>

                                <div className="dnd-container-restored">
                                    <div className="dnd-column">
                                        <h3 style={{ color: 'var(--dark-gray-color)', fontSize: '1.1rem', textAlign: 'center', marginBottom: '0.5rem' }}>Opciones</h3>
                                        <div className="dnd-list-box" style={{ background: '#f8fafc', border: '1px solid var(--medium-gray-color)', borderRadius: '0.75rem', padding: '1rem', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {staticList.map((item) => (
                                                <div key={item.id} className="dnd-item static" style={{ cursor: 'default', background: '#f1f5f9', color: '#64748b', borderStyle: 'dashed', border: '1px solid var(--medium-gray-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600' }}>
                                                    {item.content}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="dnd-arrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: '3rem', color: 'var(--medium-gray-color)' }}>
                                        <ArrowRight size={32} />
                                    </div>

                                    <div className="dnd-column">
                                        <h3 style={{ color: 'var(--primary-color)', fontSize: '1.1rem', textAlign: 'center', marginBottom: '0.5rem' }}>Tu Orden</h3>
                                        <div className="dnd-list-box dnd-area" style={{ background: 'white', border: '1px solid var(--medium-gray-color)', borderRadius: '0.75rem', padding: '1rem', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {userList.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className={`dnd-item ${draggedItem?.item.id === item.id ? 'dragging' : ''}`}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, item, index)}
                                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                                    onDragEnd={handleDragEnd}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    style={{ background: 'white', border: '1px solid var(--medium-gray-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'grab', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--dark-text)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontWeight: '600' }}
                                                >
                                                    <GripVertical size={20} style={{ color: '#9ca3af', cursor: 'grab' }} />
                                                    {item.content}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="game-right-col">
                        <div className="stats-block">
                            <h3>Progreso</h3>
                            <div class="stats-item"><span>Nivel:</span> <strong>{difficulty}</strong></div>
                            <div class="stats-item"><span>Tiempo Limite:</span> <strong>{formatTime(timeLeft)}</strong></div>
                            <div class="stats-item"><span>Puntos:</span> <strong>{score}</strong></div>
                            <div class="stats-item"><span>Ejercicio:</span> <strong>{currentExerciseIndex + 1}/{selectedExercises.length}</strong></div>
                        </div>
                        {!isMemory && (
                            <>
                                <button className="btn-primary" onClick={checkSolution}>Verificar Solución</button>
                                <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => finishGame(score)}>Finalizar Juego</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="nav-footer">
                    <button className="no-rounded-button" onClick={() => setView('home')}>
                        <ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior
                    </button>
                    <button className="no-rounded-button" onClick={goToSummary}>
                        <IconConfigure size={16} style={{ marginRight: '0.5rem' }} /> Terminar Configuración <ArrowRight style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="acertijo-container">
            <Style />
            {view === 'summary' && <Summary config={{ difficulty, timeLimit: currentConfig.time, exercises: selectedExercises }} onBack={() => setView('home')} />}
            {view === 'home' && renderSetupScreen()}
            {(view === 'memory' || view === 'game') && renderGame()}
        </div>
    );
}

// --- DATA ---
function shuffleArray(array) {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
// Función para formatear tiempo en MM:SS
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
const EXERCISE_DATA = {
    'Básico': [
        { id: 'b1', title: 'Lanzar un satélite', description: 'Pasos para lanzar un satélite.', steps: ['Construir el satélite', 'Montarlo en el cohete', 'Pruebas de sistemas', 'Encender motores', 'Liberar en órbita'] },
        { id: 'b2', title: 'Usar telescopio', description: 'Pasos para observar planetas.', steps: ['Buscar lugar oscuro', 'Colocar telescopio', 'Apuntar al planeta', 'Enfocar imagen', 'Registrar observación'] },
        { id: 'b3', title: 'Foto satelital', description: 'Capturar imagen del espacio.', steps: ['Encender cámaras', 'Apuntar zona', 'Ajustar enfoque', 'Capturar imagen', 'Enviar a Tierra'] },
        { id: 'b4', title: 'Uso de GPS', description: 'Cómo funciona el GPS.', steps: ['Activar dispositivo', 'Recibir señales', 'Calcular posición', 'Mostrar coordenadas', 'Indicar ruta'] },
        { id: 'b5', title: 'Detectar cometa', description: 'Descubrimiento astronómico.', steps: ['Revisar imágenes', 'Identificar objeto', 'Comparar posición', 'Confirmar cometa', 'Anunciar hallazgo'] }
    ],
    'Intermedio': [
        { id: 'i1', title: 'Iluminación auto', description: 'Evaluar iluminación.', steps: ['Instalar sensor', 'Prueba manual', 'Simular paso', 'Observar encendido', 'Ajustar sensor'] },
        { id: 'i2', title: 'Bici eléctrica', description: 'Evaluar bicicleta.', steps: ['Cargar batería', 'Encender sistema', 'Probar velocidad', 'Medir duración', 'Registrar datos'] },
        { id: 'i3', title: 'Horno inteligente', description: 'Evaluar horno.', steps: ['Encender horno', 'Colocar alimento', 'Verificar cocción', 'Observar resultado', 'Calificar eficiencia'] },
        { id: 'i4', title: 'Riego auto', description: 'Sistema de riego.', steps: ['Programar horario', 'Activar sistema', 'Verificar alcance', 'Revisar apagado', 'Proponer ajustes'] },
        { id: 'i5', title: 'Alarma seguridad', description: 'Prueba de alarma.', steps: ['Simular evento', 'Escuchar alarma', 'Comprobar rapidez', 'Revisar señal', 'Registrar resultado'] },
        { id: 'i6', title: 'Casa domótica', description: 'Evaluar automatización.', steps: ['Conectar dispositivos', 'Comandos voz', 'Verificar ejecución', 'Revisar consumo', 'Sugerir mejoras'] }
    ],
    'Avanzado': [
        { id: 'a1', title: 'Casa sustentable', description: 'Construcción eco.', steps: ['Diseñar estructura', 'Reunir equipo', 'Construir obra', 'Instalar solares', 'Evaluar impacto'] },
        { id: 'a2', title: 'Ahorro agua', description: 'Sistema escolar.', steps: ['Identificar fugas', 'Diseñar sistema', 'Instalar equipos', 'Probar con alumnos', 'Evaluar ahorro'] },
        { id: 'a3', title: 'Riego huerto', description: 'Automatización agrícola.', steps: ['Medir terreno', 'Diseñar red', 'Instalar mangueras', 'Probar horario', 'Evaluar crecimiento'] },
        { id: 'a4', title: 'Paneles rurales', description: 'Energía solar.', steps: ['Identificar necesidad', 'Diseñar sistema', 'Instalar paneles', 'Conectar red', 'Evaluar costos'] },
        { id: 'a5', title: 'Transporte escolar', description: 'Mejora logística.', steps: ['Identificar problemas', 'Diseñar rutas', 'Revisar vehículos', 'Comunicar cambios', 'Evaluar puntualidad'] },
        { id: 'a6', title: 'Alimentos sanos', description: 'Nutrición escolar.', steps: ['Detectar necesidad', 'Crear menú', 'Organizar cocina', 'Implementar venta', 'Evaluar consumo'] },
        { id: 'a7', title: 'Reciclaje', description: 'Gestión residuos.', steps: ['Colocar botes', 'Enseñar separación', 'Recolectar material', 'Entregar centro', 'Evaluar reducción'] }
    ]
};