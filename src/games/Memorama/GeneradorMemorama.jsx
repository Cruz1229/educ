import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    HelpCircle, RotateCcw, Timer, Trophy, Star, CheckCircle,
    Download, ArrowLeft, Tag, Layers, FileText, Calendar, Monitor,
    Shapes, Puzzle, Type, Clock, List, Upload, Image as ImageIcon, Trash2,
    Play, ArrowRight, Info, Check, X, Grid, UploadCloud
} from 'lucide-react';

// --- UTILERÍA: Cargar scripts externos ---
const useExternalScripts = (urls) => {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const loadScript = (url) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${url}"]`)) { resolve(); return; }
                const script = document.createElement('script');
                script.src = url; script.async = true;
                script.onload = resolve; script.onerror = reject;
                document.body.appendChild(script);
            });
        };
        Promise.all(urls.map(loadScript)).then(() => setLoaded(true)).catch(err => console.error(err));
    }, [urls]);
    return loaded;
};

// --- ESTILOS COMPARTIDOS (Basados en Rompecabezas.jsx) ---
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
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        background: #fafafa;
        color: var(--dark-gray-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        min-height: 200px;
    }
    .file-input-wrapper:hover {
        border-color: var(--primary-color);
        background: #f0f9ff;
        color: var(--primary-color);
    }

    /* --- SELECCIÓN DE IMÁGENES (Memorama Específico) --- */
    .image-selection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
        max-height: 300px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
    }
    .selection-item {
        position: relative;
        cursor: pointer;
        border-radius: 0.5rem;
        overflow: hidden;
        aspect-ratio: 1;
        border: 2px solid transparent;
        transition: all 0.2s;
    }
    .selection-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .selection-item.selected {
        border-color: var(--primary-color);
        transform: scale(0.95);
        box-shadow: 0 0 0 2px rgba(0, 119, 182, 0.3);
    }
    .selection-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        background: var(--primary-color);
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    }
    .counter-badge {
        background-color: #e0f2fe;
        color: #0077b6;
        padding: 0.4rem 0.8rem;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border: 1px solid #bae6fd;
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
        width: 100%;
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

    /* --- ESTILOS ESPECÍFICOS DEL MEMORAMA --- */
    .memorama-grid {
        display: grid;
        gap: 1rem;
        width: 100%;
        justify-content: center;
        /* Responsive grid columns will be inline style based on difficulty */
    }

    .card {
        perspective: 1000px;
        width: 100px;
        height: 100px;
        cursor: pointer;
    }
    
    .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
    }
    
    .card.is-flipped .card-inner, .card.is-matched .card-inner {
        transform: rotateY(180deg);
    }

    .card-front, .card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        border-radius: 0.5rem;
        border: 2px solid #cbd5e1;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .card-front {
        background: linear-gradient(135deg, #e0f2fe, #bfdbfe);
        color: #005f92;
        font-weight: 800;
        font-size: 0.9rem;
    }

    .card-back {
        background-color: white;
        transform: rotateY(180deg);
        padding: 4px;
    }
    
    .card-back img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 4px;
    }

    @media (max-width: 900px) {
        .config-controls, .game-layout { grid-template-columns: 1fr; }
        .game-layout { gap: 1rem; }
    }
    `}</style>
);

// --- ESTILOS DE SUMMARY (Idénticos a Rompecabezas.jsx) ---
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
const DIFFICULTY_LEVELS = {
    'Básico': { pairs: 3, time: 180, name: 'Básico' },
    'Intermedio': { pairs: 6, time: 300, name: 'Intermedio' },
    'Avanzado': { pairs: 8, time: 600, name: 'Avanzado' }
};

// --- ICONOS COMPARTIDOS ---
const IconConfigure = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"></path>
    </svg>
);

// --- GENERADOR HTML PARA MEMORAMA ---

// Función para formatear tiempo en mm:ss
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
const generateMemoramaCode = (difficultyKey, images, gameDetails, selectedPlatforms) => {
    const config = DIFFICULTY_LEVELS[difficultyKey];
    const imagesJson = JSON.stringify(images);

    const rawDate = (() => {
        try {
            const stored = typeof localStorage !== 'undefined'
                ? localStorage.getItem('memorama:creation_date')
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

    const titleText = gameDetails.gameName || 'Memorama';
    const animatedTitleHTML = `
    <div class="game-title">
        ${'Juego del Memorama'.split('').map((char, index) =>
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
            --primary-color: #005f92; 
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

        .game-left-col { display: flex; flex-direction: column; gap: 1.5rem; align-items: center; width: 100%; }

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
        
        .btn-exit { background: #1f2937; } 
        .btn-retry { background: var(--primary-color); } 
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

        /* Memorama Styles */
        .memorama-grid {
            display: grid;
            gap: 1rem;
            justify-content: center;
            width: 100%;
        }
        .card { perspective: 1000px; width: 100px; height: 100px; cursor: pointer; }
        .card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
        .card.is-flipped .card-inner, .card.is-matched .card-inner { transform: rotateY(180deg); }
        .card-front, .card-back { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 0.5rem; border: 2px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center; }
        .card-front { background: linear-gradient(135deg, #e0f2fe, #bfdbfe); color: var(--primary-color); font-weight: 800; font-size: 0.9rem; }
        .card-back { background-color: white; transform: rotateY(180deg); padding: 4px; }
        .card-back img { width: 100%; height: 100%; object-fit: contain; border-radius: 4px; }

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
        
        .clue-text { text-align: center; color: var(--dark-gray); margin-bottom: 0.5rem; font-size: 1.1rem; }
    </style>
</head>
<body>
    <div id="start-screen" class="overlay">
              <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">Memorama</h2>

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
                <h2 class="info-title">${titleText}</h2>
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
    <span style="font-size:1rem; color:#1e40af; font-weight:500;">Forma los pares iguales antes del tiempo límite.</span>
</div>
        
        <div class="game-layout">
            <div class="game-left-col">
                <div class="memorama-grid" id="grid-container" style="grid-template-columns: repeat(${Math.ceil(Math.sqrt(config.pairs * 2))}, auto);"></div>
            </div>
            <div class="game-right-col">
                <div class="stats-block">
                    <h3>Progreso</h3>
                    <div class="stats-item"><span>Nivel:</span> <strong id="nivel">${config.name}</strong></div>
                    <div class="stats-item"><span>Tiempo Límite:</span> <strong id="timer">${Math.floor(config.time / 60)}:${(config.time % 60).toString().padStart(2, '0')}</strong></div>
                    <div class="stats-item"><span>Puntaje:</span> <strong id="score">0</strong></div>
                    <div class="stats-item"><span>Pares:</span> <strong id="pairs-count">0/${config.pairs}</strong></div>
                </div>
                 <button class="btn btn-primary" onclick="finishGame(false)">Finalizar Juego</button>
            </div>
        </div>
    </div>

    <script>
        const INITIAL_IMAGES = ${imagesJson};
        const GAME_CONFIG = ${JSON.stringify(config)};
        let state = { score: 0, timeLeft: GAME_CONFIG.time, timer: null, cards: [], flipped: [], checking: false, matchedCount: 0 };

        function toggleInfo(show) {
             const m = document.getElementById('info-overlay');
             m.classList.toggle('hidden', !show);
             m.style.display = show ? 'flex' : 'none';
        }
        function exitGame() { window.close(); Swal.fire({title:'Cierra la pestaña', icon:'info'}); }

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
            initBoard();
            startTimer();
        }

        function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

        function initBoard() {
            const gameCards = [];
            INITIAL_IMAGES.forEach(img => {
                gameCards.push({ id: img.id + '-a', imgId: img.id, url: img.url });
                gameCards.push({ id: img.id + '-b', imgId: img.id, url: img.url });
            });
            state.cards = shuffle(gameCards);
            const grid = document.getElementById('grid-container');
            grid.innerHTML = '';
            
            // Adjust grid columns if needed
            const cols = Math.ceil(Math.sqrt(state.cards.length));
            grid.style.gridTemplateColumns = \`repeat(\${cols}, auto)\`;

            state.cards.forEach(card => {
                const cardEl = document.createElement('div');
                cardEl.className = 'card'; 
                cardEl.id = card.id;
                cardEl.innerHTML = \`
                    <div class="card-inner">
                        <div class="card-front"><span>STEAM-G</span></div>
                        <div class="card-back"><img src="\${card.url}" /></div>
                    </div>
                \`;
                cardEl.onclick = () => handleCardClick(card, cardEl);
                grid.appendChild(cardEl);
            });
        }

        function handleCardClick(cardData, cardEl) {
            if(state.checking || cardEl.classList.contains('is-flipped') || cardEl.classList.contains('is-matched') || state.timeLeft <= 0) return;
            
            cardEl.classList.add('is-flipped');
            state.flipped.push({ data: cardData, el: cardEl });

            if(state.flipped.length === 2) {
                state.checking = true;
                checkMatch();
            }
        }

        function checkMatch() {
            const [c1, c2] = state.flipped;
            if(c1.data.imgId === c2.data.imgId) {
                setTimeout(() => {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Correcto!',
                        text: '+10 puntos',
                        timer: 1000,
                        showConfirmButton: false,
                        position: 'center'
                    });
                    state.score += 10;
                    document.getElementById('score').innerText = state.score;
                    c1.el.classList.add('is-matched');
                    c2.el.classList.add('is-matched');
                    state.matchedCount++;
                    document.getElementById('pairs-count').innerText = state.matchedCount + '/' + GAME_CONFIG.pairs;
                    state.flipped = [];
                    state.checking = false;
                    
                    if(state.matchedCount === GAME_CONFIG.pairs) {
                        setTimeout(() => finishGame(true), 500);
                    }
                }, 500);
            } else {
                setTimeout(() => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incorrecto',
                        text: 'Inténtalo de nuevo',
                        timer: 1000,
                        showConfirmButton: false,
                        position: 'center'
                    });
                    c1.el.classList.remove('is-flipped');
                    c2.el.classList.remove('is-flipped');
                    state.flipped = [];
                    state.checking = false;
                }, 1000);
            }
        }

        function startTimer() {
    state.timer = setInterval(() => {
        state.timeLeft--;
        const mins = Math.floor(state.timeLeft / 60);
        const secs = state.timeLeft % 60;
        document.getElementById('timer').innerText = mins + ':' + secs.toString().padStart(2, '0');
        if(state.timeLeft <= 0) finishGame(false);
    }, 1000);
}

        function finishGame(win) {
            clearInterval(state.timer);
            document.getElementById('game-ui').style.display = 'none';
            document.getElementById('end-screen').classList.remove('hidden');
            document.getElementById('end-title').innerText = win ? "¡Juego Completado!" : "Fin del Juego";
            document.getElementById('final-score').innerText = state.score;
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
const MEMORAMA_APPLICATION_ID_BASE = "io.memorama.steam";

const createUuidSegment = () => {
    const rawUuid = window.crypto?.randomUUID?.()
        || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    return `uuid_${uuid}`;
};

const buildMemoramaApplicationId = () => {
    return `${MEMORAMA_APPLICATION_ID_BASE}.${createUuidSegment()}`;
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

const applyMemoramaAndroidMetadata = async (zip, { applicationId }) => {
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
// --- COMPONENTE SUMMARY ---
const Summary = ({ config, images, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const [jsZipReady, setJsZipReady] = useState(false);

    const location = useLocation();
    const state = location.state;

    const MOCK_DATA = {
        selectedAreas: ['Arte', 'Lógica'],
        selectedSkills: ['Memoria Visual', 'Atención'],
        gameDetails: {
            gameName: "Juego de Memoria",
            description: "Encuentra todos los pares de cartas.",
            version: "1.0.0",
            date: null
        },
        selectedPlatforms: ['web']
    };

    const getFixedCreationDate = () => {
        const KEY = 'memorama:creation_date';
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
        try { localStorage.setItem(KEY, today); } catch { }
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

    // ── Descarga ZIP Web ──────────────────────────────────────────────────────
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
            const difficultyKey = Object.keys(DIFFICULTY_LEVELS).find(
                key => DIFFICULTY_LEVELS[key].pairs === config.pairs
            ) || 'Básico';
            const htmlContent = generateMemoramaCode(difficultyKey, images, gameDetails, selectedPlatforms);

            const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'memorama')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            zip.file(htmlFileName, htmlContent);
            const content = await zip.generateAsync({ type: "blob", platform: "UNIX" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'memorama')}_web.zip`;
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
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando imágenes...");
                setProgress(currentProgress);
            }
        }, 150);
    };

    const generateAndDownloadAndroidZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        try {
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/memorama_android.zip');
            if (!response.ok) {
                throw new Error("No se pudo descargar la plantilla base de Android");
            }
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Procesando archivos ZIP...");
            const zip = await window.JSZip.loadAsync(arrayBuffer);

            setStatusText("Inyectando configuración...");

            // Mapear nivel al formato que espera Home.tsx
            const nivelMap = {
                'Básico': 'basic',
                'Intermedio': 'intermediate',
                'Avanzado': 'advanced'
            };
            const nivelKey = nivelMap[config.name] || 'basic';

            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];

            // Construir imagenes como Record<difficulty, string[]> con base64 para Home.tsx
            const imagenesConfig = {
                [nivelKey]: images.map(img => img.url) // img.url ya es data:image/...;base64,...
            };

            const fullConfig = {
                nivel: config.name,          // "Básico" / "Intermedio" / "Avanzado"
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                fecha: (() => {
                    const now = new Date();
                    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                })(),
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Memorama',
                plataformas: selectedPlats,
                imagenes: imagenesConfig
            };

            // Inyectar en el path de assets de Capacitor (igual que CalculadoraMental)
            const androidApplicationId = buildMemoramaApplicationId();
            zip.file(
                "android/app/src/main/assets/public/config/memorama-config.json",
                JSON.stringify(fullConfig, null, 2)
            );
            await applyMemoramaAndroidMetadata(zip, { applicationId: androidApplicationId });


            setStatusText("Generando paquete final...");
            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            const platformsSuffix = (Array.isArray(selectedPlats) ? selectedPlats : ['movil'])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            link.download = `${normalizeFileName(details?.gameName || 'memorama')}_${platformsSuffix}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

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
            // DESPUÉS
            setStatusText("Generando paquete Web...");
            const difficultyKey = Object.keys(DIFFICULTY_LEVELS).find(
                key => DIFFICULTY_LEVELS[key].pairs === config.pairs
            ) || 'Básico';
            const htmlContent = generateMemoramaCode(difficultyKey, images, gameDetails, selectedPlatforms);
            const webZip = new window.JSZip();

            const htmlFileNameCombined = `${normalizeFileName(gameDetails?.gameName || 'memorama')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            webZip.file(htmlFileNameCombined, htmlContent);
            const webBlob = await webZip.generateAsync({ type: "blob" });
            outerZip.file(`${normalizeFileName(gameDetails?.gameName || 'memorama')}_web.zip`, webBlob);

            // ── Generar ZIP Android ──
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/memorama_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Inyectando configuración Android...");
            const zip = await window.JSZip.loadAsync(arrayBuffer);

            const nivelMap = { 'Básico': 'basic', 'Intermedio': 'intermediate', 'Avanzado': 'advanced' };
            const nivelKey = nivelMap[config.name] || 'basic';
            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];
            const imagenesConfig = { [nivelKey]: images.map(img => img.url) };

            const fullConfig = {
                nivel: config.name,
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                fecha: details.date
                    ? new Date(details.date).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Memorama',
                plataformas: selectedPlats,
                imagenes: imagenesConfig
            };

            const androidApplicationId = buildMemoramaApplicationId();
            zip.file(
                "android/app/src/main/assets/public/config/memorama-config.json",
                JSON.stringify(fullConfig, null, 2)
            );
            await applyMemoramaAndroidMetadata(zip, { applicationId: androidApplicationId });


            const androidBlob = await zip.generateAsync({ type: "blob", platform: "UNIX" });
            const mobilePlatforms = (selectedPlatforms ?? [])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            outerZip.file(`${normalizeFileName(details?.gameName || 'memorama')}_${mobilePlatforms}.zip`, androidBlob);

            // ── ZIP contenedor final ──
            setStatusText("Empaquetando todo...");
            const finalBlob = await outerZip.generateAsync({ type: "blob" });
            const platformsLabel = (selectedPlatforms ?? [])
                .map(p => platformLabel(p))
                .join('_');
            const url = window.URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'memorama')}_${platformsLabel}.zip`;
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

    // Helpers
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
                        <div className="info-card-value">{gameDetails.gameName || 'Memorama'}</div>
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
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.name}</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Tiempo Límite:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{formatTime(config.time)} minutos</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><List size={18} /> Pares de Imágenes:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.pairs}</strong>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#334155' }}>Imágenes Seleccionadas:</strong>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {images.map((img, i) => (
                            <img key={i} src={img.url} alt="Thumb" style={{ width: '60px', height: '60px', borderRadius: '8px', border: '1px solid #ddd', objectFit: 'cover' }} />
                        ))}
                    </div>
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

// --- VISTA PREVIA DEL MEMORAMA ---
const MemoramaPreviewContent = ({ images, level, onBack, onFinishConfig }) => {
    const { pairs, time: timeLimit, name: levelName } = level;
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [score, setScore] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCount, setMatchedCount] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const timerRef = useRef(null);

    // Inicializar juego
    const initializeGame = () => {
        clearInterval(timerRef.current);

        // Crear pares
        let deck = [];
        images.forEach(img => {
            deck.push({ id: `${img.id}-a`, imgId: img.id, url: img.url, isFlipped: false, isMatched: false });
            deck.push({ id: `${img.id}-b`, imgId: img.id, url: img.url, isFlipped: false, isMatched: false });
        });

        // Barajar
        deck.sort(() => Math.random() - 0.5);

        setCards(deck);
        setFlippedCards([]);
        setMatchedCount(0);
        setTimeLeft(timeLimit);
        setScore(0);
        setIsActive(false);
        setIsChecking(false);
    };

    useEffect(() => { initializeGame(); }, [images]);

    // Timer - Lógica actualizada para coincidir con Rompecabezas.jsx
    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        clearInterval(timerRef.current);
                        setIsActive(false);
                        window.Swal.fire({
                            title: 'Tiempo Agotado',
                            icon: 'warning',
                            confirmButtonText: 'Reiniciar',
                            confirmButtonColor: '#0077b6',
                            allowOutsideClick: false
                        }).then(() => initializeGame());
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive]);

    // Logica de Cartas
    const handleCardClick = (clickedCard) => {
        if (!isActive || isChecking || clickedCard.isFlipped || clickedCard.isMatched) return;

        // Voltear carta
        const newCards = cards.map(c => c.id === clickedCard.id ? { ...c, isFlipped: true } : c);
        setCards(newCards);

        const newFlipped = [...flippedCards, clickedCard];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setIsChecking(true);
            checkMatch(newFlipped, newCards);
        }
    };

    const checkMatch = (flipped, currentCards) => {
        const [c1, c2] = flipped;
        if (c1.imgId === c2.imgId) {
            // Match
            setTimeout(() => {
                // Modal de CORRECTO
                window.Swal.fire({
                    icon: 'success',
                    title: '¡Correcto!',
                    text: '+10 puntos',
                    timer: 1000,
                    showConfirmButton: false,
                    position: 'center'
                });

                // Calculamos el nuevo score y lo pasamos si termina el juego
                // para evitar el problema del closure (estado desactualizado)
                const newScore = score + 10;
                setScore(newScore);

                const matchedCards = currentCards.map(c =>
                    (c.id === c1.id || c.id === c2.id) ? { ...c, isMatched: true } : c
                );
                setCards(matchedCards);
                setMatchedCount(m => {
                    const newCount = m + 1;
                    if (newCount === pairs) setTimeout(() => handleFinishGame(true, newScore), 500);
                    return newCount;
                });
                setFlippedCards([]);
                setIsChecking(false);
            }, 500);
        } else {
            // No Match
            setTimeout(() => {
                // Modal de INCORRECTO
                window.Swal.fire({
                    icon: 'error',
                    title: 'Incorrecto',
                    text: 'Inténtalo de nuevo',
                    timer: 1000,
                    showConfirmButton: false,
                    position: 'center'
                });

                const resetCards = currentCards.map(c =>
                    (c.id === c1.id || c.id === c2.id) ? { ...c, isFlipped: false } : c
                );
                setCards(resetCards);
                setFlippedCards([]);
                setIsChecking(false);
            }, 1000);
        }
    };

    // Modificado para aceptar scoreOverride y mostrar el puntaje real al finalizar
    const handleFinishGame = (completed = false, finalScoreOverride = null) => {
        clearInterval(timerRef.current);
        setIsActive(false);
        const finalScore = finalScoreOverride !== null ? finalScoreOverride : score;

        // Modal exactamente igual a Rompecabezas.jsx
        window.Swal.fire({
            title: completed ? '¡Juego Completado!' : '¡Juego Finalizado!',
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
                initializeGame();
                setIsActive(true);
            } else if (result.dismiss === window.Swal.DismissReason.cancel) {
                onBack();
            }
        });
    };

    return (
        <>
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
                <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>Forma los pares iguales antes del tiempo límite.</span>
            </div>
            <div className="game-layout">
                <div className="game-left-col">
                    {!isActive && timeLeft === timeLimit && (
                        <div style={{ marginBottom: '1rem' }}>
                            <button className="btn-primary" onClick={() => setIsActive(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <Play size={20} /> Comenzar Juego
                            </button>
                        </div>
                    )}

                    <div className="memorama-grid" style={{
                        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(cards.length))}, auto)`,
                        opacity: isActive ? 1 : 0.5, // Visualmente deshabilitado
                        pointerEvents: isActive ? 'auto' : 'none', // Funcionalmente deshabilitado
                        transition: 'opacity 0.3s'
                    }}>
                        {cards.map(card => (
                            <div
                                key={card.id}
                                className={`card ${card.isFlipped || card.isMatched ? 'is-flipped' : ''}`}
                                onClick={() => handleCardClick(card)}
                            >
                                <div className="card-inner">
                                    <div className="card-front"><span>STEAM-G</span></div>
                                    <div className="card-back"><img src={card.url} alt="img" /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="game-right-col">
                    <div className="stats-block">
                        <h3>Progreso</h3>
                        <div className="stats-item"><span>Nivel:</span> <strong>{levelName}</strong></div>
                        <div className="stats-item"><span>Tiempo Límite:</span> <strong>{formatTime(timeLeft)}</strong></div>
                        <div className="stats-item"><span>Puntaje:</span> <strong>{score}</strong></div>
                        <div className="stats-item"><span>Pares:</span> <strong>{matchedCount}/{pairs}</strong></div>
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
const GeneradorMemorama = () => {
    const libsLoaded = useExternalScripts([
        'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
        'https://cdn.jsdelivr.net/npm/sweetalert2@11'
    ]);

    const [view, setView] = useState('home');
    const [levelKey, setLevelKey] = useState('Básico');

    // Estados para lógica ZIP
    const [uploadedImages, setUploadedImages] = useState([]); // Todas las imgs del zip
    const [selectedImages, setSelectedImages] = useState([]); // Las seleccionadas por el user
    const [error, setError] = useState(null);
    const [isProcessingZip, setIsProcessingZip] = useState(false);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => { window.scrollTo(0, 0); }, [view]);

    // Helpers de lógica ZIP
    const requiredPairs = DIFFICULTY_LEVELS[levelKey].pairs;

    const handleLevelChange = (e) => {
        setLevelKey(e.target.value);
        setSelectedImages([]); // Reset selection on level change
        setError(null);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.zip')) {
            window.Swal?.fire({ icon: 'error', title: 'Error', text: 'Sube un archivo .zip' });
            return;
        }

        setIsProcessingZip(true);
        setError(null);
        setUploadedImages([]);
        setSelectedImages([]);

        try {
            const zip = await window.JSZip.loadAsync(file);
            const imagePromises = [];
            let idCounter = 0;

            zip.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir && /\.(jpe?g|png|gif|webp)$/i.test(zipEntry.name)) {
                    const promise = zipEntry.async('base64').then(b64 => {
                        const ext = zipEntry.name.split('.').pop().toLowerCase();
                        let mime = 'image/jpeg';
                        if (ext === 'png') mime = 'image/png';
                        if (ext === 'gif') mime = 'image/gif';
                        const url = `data:${mime};base64,${b64}`;
                        return { id: idCounter++, url, name: zipEntry.name };
                    });
                    imagePromises.push(promise);
                }
            });

            const loaded = await Promise.all(imagePromises);
            if (loaded.length < requiredPairs) {
                setError(`El ZIP contiene ${loaded.length} imágenes, pero el nivel requiere ${requiredPairs}.`);
            } else {
                setUploadedImages(loaded);
            }
        } catch (err) {
            console.error(err);
            setError("Error al leer el archivo ZIP.");
        } finally {
            setIsProcessingZip(false);
            event.target.value = null;
        }
    };

    const toggleImageSelection = (img) => {
        if (selectedImages.find(s => s.id === img.id)) {
            setSelectedImages(selectedImages.filter(s => s.id !== img.id));
        } else {
            if (selectedImages.length < requiredPairs) {
                setSelectedImages([...selectedImages, img]);
            } else {
                // Opcional: Reemplazar el ultimo o mostrar alerta
                window.Swal?.fire({ toast: true, position: 'top-end', icon: 'warning', title: `Solo necesitas ${requiredPairs} imágenes`, showConfirmButton: false, timer: 1500 });
            }
        }
    };

    const goToPreview = () => {
        if (selectedImages.length !== requiredPairs) {
            window.Swal?.fire({ icon: 'warning', title: 'Atención', text: `Debes seleccionar exactamente ${requiredPairs} imágenes.` });
            return;
        }
        setView('preview');
    };

    const goToSummary = () => {
        setView('summary');
        navigate('/settings?view=summary', { replace: true, state: location.state });
    };

    const renderConfigScreen = () => (
        <div className="config-screen">
            <div className="game-title">
                {'Juego de Memorama'.split('').map((letter, index) => (
                    <span key={index} style={{ animationDelay: `${index * 0.07}s` }}>
                        {letter === ' ' ? '\u00A0' : letter}
                    </span>
                ))}
            </div>

            <div className="rules-text">
                <h2>Configura tu juego subiendo en un archivo .zip las imágenes seleccionadas.</h2>
            </div>

            <div className="config-controls">
                <div className="control-group">
                    <label>Seleccione el nivel de dificultad:</label>
                    <select value={levelKey} onChange={handleLevelChange}>
                        {Object.entries(DIFFICULTY_LEVELS).map(([k, v]) => (
                            <option key={k} value={k}>{v.name} ({v.pairs} imágenes)</option>
                        ))}
                    </select>
                    <small style={{
                        display: 'block',
                        marginTop: '0.4rem',
                        color: '#0077b6',
                        fontWeight: '600',
                        fontSize: '0.88rem'
                    }}>
                        📷 Este nivel requiere <strong>{DIFFICULTY_LEVELS[levelKey].pairs} imágenes</strong> en el archivo .ZIP
                    </small>
                </div>

                <div className="control-group">
                    <label>Subir imágenes del juego (.zip):</label>
                    <div className="file-input-wrapper" onClick={() => fileInputRef.current?.click()}>
                        <div style={{ background: '#e0f2fe', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
                            <UploadCloud size={48} color="#0077b6" />
                        </div>
                        {isProcessingZip ? (
                            <span style={{ fontWeight: '600' }}>Procesando imágenes...</span>
                        ) : uploadedImages.length > 0 ? (
                            <>
                                <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>¡Imágenes cargadas correctamente!</span>
                                <small style={{ color: '#6b7280' }}>Contiene {uploadedImages.length} imágenes.</small>
                                <button onClick={(e) => { e.stopPropagation(); setUploadedImages([]); setSelectedImages([]); }} className="no-rounded-button" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginTop: '0.5rem', background: '#fee2e2', color: '#ef4444' }}>
                                    <Trash2 size={16} style={{ marginRight: '4px' }} /> Cambiar Imágenes
                                </button>
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Haz clic para subir archivo .ZIP</span>
                                <small style={{ color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' }}>Asegúrate de que contenga imágenes en formato (JPG, PNG).</small>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".zip" style={{ display: 'none' }} />
                    </div>
                    {error && <div style={{ color: 'var(--wrong-color)', marginTop: '0.5rem', fontWeight: 'bold' }}>{error}</div>}
                </div>

                {uploadedImages.length > 0 && (
                    <div className="control-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Selecciona {requiredPairs} imágenes:</label>
                            <span className="counter-badge">
                                <CheckCircle size={16} /> {selectedImages.length} / {requiredPairs}
                            </span>
                        </div>

                        <div className="image-selection-grid">
                            {uploadedImages.map(img => {
                                const isSelected = selectedImages.find(s => s.id === img.id);
                                return (
                                    <div
                                        key={img.id}
                                        className={`selection-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleImageSelection(img)}
                                    >
                                        <img src={img.url} alt="thumb" />
                                        {isSelected && <div className="selection-badge"><Check size={12} /></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="config-footer">
                <button onClick={() => navigate(-1)} className="no-rounded-button">
                    <ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior
                </button>
                <button
                    onClick={goToPreview}
                    disabled={selectedImages.length !== requiredPairs}
                    className="no-rounded-button"
                >
                    Siguiente <ArrowRight style={{ marginLeft: '0.5rem' }} />
                </button>
            </div>
        </div>
    );

    if (!libsLoaded) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando recursos...</div>;

    return (
        <>
            <Style />
            <div className="acertijo-container">
                {view === 'summary' ? (
                    <Summary config={DIFFICULTY_LEVELS[levelKey]} images={selectedImages} onBack={() => setView('home')} />
                ) : view === 'preview' ? (
                    <div className="game-screen">
                        <div className="game-title">
                            {'Juego de Memorama'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${i * 0.07}s` }}>{c === ' ' ? '\u00A0' : c}</span>)}
                        </div>
                        <h3 style={{ textAlign: 'center', color: '#6b7280', marginTop: '-0.5rem', marginBottom: '1.5rem', fontWeight: '500' }}>(Vista Previa)</h3>

                        <MemoramaPreviewContent
                            images={selectedImages}
                            level={DIFFICULTY_LEVELS[levelKey]}
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

export default GeneradorMemorama;