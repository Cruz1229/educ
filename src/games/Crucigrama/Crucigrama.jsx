import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Clock, Award, HelpCircle, CheckCircle, Brain, Target, Ruler,
    RotateCcw, ArrowLeft, ArrowRight, Download, Tag, Layers,
    FileText, Calendar, Monitor, Shapes, Puzzle, List, Type,
    Grid, Home, Settings, Info, Play, Filter, Zap, Layout, Check, X
} from 'lucide-react';

// --- ICONO DE CONFIGURACIÓN (Helper) ---
const IconConfigure = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"></path>
    </svg>
);

// --- ESTILOS COMPARTIDOS ---
const Style = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap');
    
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
      max-width: 1100px;
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

    /* --- GRID DE SELECCIÓN --- */
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

    /* --- BOTONES DEL FOOTER --- */
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
        width: 100%;
        overflow-x: auto; 
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

    /* --- ESTILOS ESPECÍFICOS DEL GRID DE CRUCIGRAMA --- */
    .crossword-grid-wrapper {
        display: inline-block;
        background: #EBF4FF; /* Color original del fondo del grid container */
        padding: 1rem;
        border-radius: 0.5rem;
        border: 2px solid #60A5FA; /* Color original del borde del grid */
        margin: 0 auto;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .clues-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-top: 1rem;
    }
    
    .clue-box {
        background: white;
        border: 1px solid var(--medium-gray-color);
        border-radius: 0.5rem;
        padding: 1rem;
        box-shadow: 0 2px 4px -1px rgba(0,0,0,0.06);
    }

    .clue-box h4 {
        color: #1D4ED8; /* Azul original */
        margin-top: 0;
        margin-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
        font-size: 1.125rem;
        font-weight: bold;
    }

    .clue-list {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 300px;
        overflow-y: auto;
    }

    .clue-item {
        padding: 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        gap: 0.5rem;
        align-items: flex-start;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }
    .clue-item:hover {
        background-color: #f0f9ff;
    }
    .clue-item.selected {
        font-weight: 600;
    }
    .clue-item.solved {
        text-decoration: line-through;
        color: #9ca3af;
    }
    
    .clue-number-badge {
        font-weight: bold;
        color: #1F2937;
        margin-right: 4px;
    }
   .check-btn {
    width: 2rem;
    height: 2rem;
    min-width: 2rem;
    padding: 0;
    background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
    color: white;
    border-radius: 8px;
    border: 2px solid #1D4ED8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: bold;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(29, 78, 216, 0.2);
}

.check-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(29, 78, 216, 0.3);
    background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
}

.check-btn:active {
    transform: scale(0.95);
}

.check-btn.solved-btn {
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    border-color: #059669;
    cursor: default;
}

.check-btn.solved-btn:hover {
    transform: none;
}
.rules-hint {
    background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
    border: 2px solid #3B82F6;
    border-radius: 0.75rem;
    padding: 1rem 1.5rem;
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
}

.rules-hint-icon {
    width: 2rem;
    height: 2rem;
    min-width: 2rem;
    background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
    color: white;
    border-radius: 8px;
    border: 2px solid #1D4ED8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(29, 78, 216, 0.2);
}

.rules-hint-text {
    color: #1E40AF;
    font-size: 0.95rem;
    font-weight: 500;
    flex: 1;
}

.rules-hint-text strong {
    color: #1D4ED8;
    font-weight: 700;
}

    @media (max-width: 900px) {
        .config-controls, .game-layout { grid-template-columns: 1fr; }
        .clues-container { grid-template-columns: 1fr; }
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

// --- DATOS DEL CRUCIGRAMA ---
const puzzleData = {
    'Básico': {
        theme: 'Sistema Internacional de Medidas (SI)',
        words: [
            { id: 'metro', word: 'METRO', clue: 'Es la unidad básica para medir la longitud. ¡Sirve para saber qué tan largo es algo, desde una regla hasta una cancha de fútbol!' },
            { id: 'kelvin', word: 'KELVIN', clue: 'Es la unidad para medir la temperatura en el mundo científico. ¡Los científicos lo usan hasta en experimentos espaciales!' },
            { id: 'amperio', word: 'AMPERIO', clue: 'Mide la corriente eléctrica. ¡Gracias a él, podemos saber cuánta electricidad pasa por un cable!' },
            { id: 'segundo', word: 'SEGUNDO', clue: 'Es la unidad básica del tiempo. ¡El reloj no para de contarlos uno tras otro!' },
            { id: 'kilogramo', word: 'KILOGRAMO', clue: 'Es la unidad que usamos para medir la masa. ¡Cuando pesas una sandía, estás usando esta medida!' },
        ]
    },
    'Intermedio': {
        theme: 'Sistema Inglés de Medidas',
        words: [
            { id: 'unidades', word: 'UNIDADES', clue: 'Son las palabras o números que usamos para decir cuánto mide algo, como "pies" o "pulgadas".' },
            { id: 'pulgada', word: 'PULGADA', clue: 'Son pequeñas unidades de medida. ¡Tu pantalla del celular también se mide en ellas!' },
            { id: 'pie', word: 'PIE', clue: 'Unidad usada para medir alturas. ¡Un pie no solo camina, también mide!' },
            { id: 'yarda', word: 'YARDA', clue: 'Unidad más grande que el pie. ¡En los campos de fútbol americano se usa para marcar la distancia!' },
            { id: 'milla', word: 'MILLA', clue: 'Unidad muy usada para medir grandes distancias, como las que recorren los autos.' },
            { id: 'estandar', word: 'ESTANDAR', clue: 'Es una medida que se usa como modelo para que todos midan igual. ¡Así nadie se confunde!' },
            { id: 'conversion', word: 'CONVERSION', clue: 'Es cuando cambiamos una medida a otra. ¡Cómo pasar de pulgadas a centímetros!' },
            { id: 'galon', word: 'GALON', clue: 'Unidad para medir líquidos como la leche o la gasolina.' },
            { id: 'onza', word: 'ONZA', clue: 'Unidad que sirve para medir peso o líquidos. ¡El chocolate y los jugos la usan mucho!' },
            { id: 'libra', word: 'LIBRA', clue: 'Unidad que se usa para medir peso. ¡Si te pesas en una báscula inglesa, verás tu peso en esta unidad!' },
        ]
    },
    'Avanzado': {
        theme: 'Construcción y propiedades de las figuras planas y los cuerpos',
        words: [
            { id: 'punto', word: 'PUNTO', clue: 'Es el lugar más pequeño que existe en la geometría. ¡No tiene tamaño, pero lo empieza todo!' },
            { id: 'segmento', word: 'SEGMENTO', clue: 'Es una parte de una línea que tiene principio y fin. ¡Como una cuerda cortada!' },
            { id: 'recta', word: 'RECTA', clue: 'Línea que no tiene curvas y se extiende al infinito. ¡Nunca se dobla!' },
            { id: 'angulo', word: 'ANGULO', clue: 'Se forma cuando dos líneas se juntan. ¡Algunos son abiertos, otros cerrados!' },
            { id: 'paralelogramo', word: 'PARALELOGRAMO', clue: 'Figura de cuatro lados donde los lados opuestos son paralelos. ¡Nunca se cruzan!' },
            { id: 'esfera', word: 'ESFERA', clue: 'Cuerpo totalmente redondo. ¡Como una pelota perfecta!' },
            { id: 'vertice', word: 'VERTICE', clue: 'Es el punto donde se juntan dos lados o aristas. ¡Como la esquina de una caja!' },
            { id: 'prisma', word: 'PRISMA', clue: 'Cuerpo con dos bases iguales y caras rectangulares. ¡Como una caja alargada!' },
            { id: 'area', word: 'AREA', clue: 'Es la medida de la superficie que ocupa una figura. ¡Lo que "cubre" la forma!' },
            { id: 'diametro', word: 'DIAMETRO', clue: 'Línea que atraviesa el círculo por el centro. ¡Lo divide en dos partes iguales!' },
            { id: 'radio', word: 'RADIO', clue: 'Es la línea que va del centro del círculo al borde. ¡La mitad del camino!' },
            { id: 'poligono', word: 'POLIGONO', clue: 'Figura cerrada formada por varios lados. ¡Pueden tener 3, 5 o muchos más!' },
            { id: 'trapecio', word: 'TRAPECIO', clue: 'Tiene cuatro lados, y solo dos son paralelos. ¡Una figura muy especial!' },
            { id: 'perimetro', word: 'PERIMETRO', clue: 'Es la medida del contorno de una figura. ¡Cómo rodearla con una cuerda!' },
            { id: 'hexagono', word: 'HEXAGONO', clue: 'Figura de seis lados. ¡Las abejas lo usan para construir panales!' },
        ]
    }
};

const difficultySettings = {
    'Básico': { min: 3, max: 3, time: 600 },
    'Intermedio': { min: 5, max: 5, time: 1200 },
    'Avanzado': { min: 7, max: 7, time: 1800 }
};

// --- GENERADOR HTML (CROSSWORD) ACTUALIZADO ---
// Incluye estilos del GeneradorMemorama (Modales, Overlays, Diseño pulido)
// y adapta la interfaz del crucigrama para que coincida con la vista previa de React
const generateCrosswordCode = (config, gameDetails, selectedPlatforms) => {
    if (!config) config = { difficulty: "Básico", timeLimit: 600, words: [] };

    const rawDate = (() => {
        try {
            const stored = typeof localStorage !== 'undefined'
                ? localStorage.getItem('crucigrama:creation_date')
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

    const titleText = gameDetails.gameName || 'Crucigrama';
    const wordsJSON = JSON.stringify(config.words);

    // Título animado para overlays
    // Título animado para overlays
    const animatedTitleHTML = `
    <div class="game-title">
        ${'Juego del Crucigrama'.split('').map((char, index) =>
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
    <title>${titleText} - ${config.difficulty}</title>
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
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 1100px; display: flex; flex-direction: column; }
        
        /* Overlays Styles (From Memorama) */
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; transition: opacity 0.3s; padding: 20px; box-sizing: border-box; }
        .hidden { display: none !important; opacity: 0; pointer-events: none; }
        
        .big-btn { 
            padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); 
            color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: transform 0.2s; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0.5rem; display: inline-flex; align-items: center; 
            gap: 0.5rem; justify-content: center; min-width: 200px; 
        }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .btn-exit { background: #1f2937; } 
        .btn-retry { background: var(--primary-color); } 
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }

        /* Titles */
        .game-title { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        .game-title.static span { animation: none; transform: none; }
        @keyframes wave-animation { 0%, 40%, 100% { transform: translateY(0); } 20% { transform: translateY(-20px); } }
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
@keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        /* Modal Info Styles */
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

        /* Game Layout */
        .game-layout { display: grid; grid-template-columns: 1fr 250px; gap: 2rem; align-items: start; width: 100%; margin-top: 2rem; }
        @media (max-width: 900px) { .game-layout { grid-template-columns: 1fr; } .clues-container { grid-template-columns: 1fr; } }
        
        .game-left-col { width: 100%; overflow-x: auto; display: flex; flex-direction: column; gap: 1.5rem; }
        .game-right-col { display: flex; flex-direction: column; gap: 1rem; }

        /* Crossword Grid Styles (Matching React Preview) */
        .crossword-grid-wrapper { display: inline-block; background: #EBF4FF; padding: 1rem; border-radius: 0.5rem; border: 2px solid #60A5FA; margin: 0 auto; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
        .cw-table { display: grid; gap: 1px; background: transparent; }
        .cw-cell { width: 2.75rem; height: 2.75rem; background: white; border: 2px solid #9CA3AF; position: relative; display: flex; align-items: center; justify-content: center; border-radius: 0.375rem; transition: all 0.15s; padding: 1px; }
        .cw-cell input { width: 100%; height: 100%; border: none; text-align: center; font-weight: bold; font-size: 1.25rem; background: transparent; outline: none; padding: 0; margin: 0; color: #111827; text-transform: uppercase; }
        .cw-cell.black { background: transparent; border: none; }
        .cw-cell.solved { background: #D1FAE5; border-color: #6EE7B7; }
        .cw-cell.solved input { color: #065F46; }
        .cw-cell.selected { border-color: #3B82F6; background: #E0F2FE; }
        .cw-number { position: absolute; top: 2px; left: 4px; font-size: 0.75rem; color: #6B7280; font-weight: bold; pointer-events: none; line-height: 1; }

        /* Clues Styles */
        .clues-container { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
        .clue-box { background: white; border: 1px solid var(--medium-gray); border-radius: 0.5rem; padding: 1rem; box-shadow: 0 2px 4px -1px rgba(0,0,0,0.06); }
        .clue-box h4 { color: #1D4ED8; margin-top: 0; margin-bottom: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; font-size: 1.125rem; font-weight: bold; }
        .clue-list { list-style: none; padding: 0; margin: 0; max-height: 300px; overflow-y: auto; }
        .clue-item { padding: 0.5rem; border-radius: 4px; cursor: pointer; display: flex; gap: 0.5rem; align-items: flex-start; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .clue-item:hover { background-color: #f0f9ff; }
        .clue-item.selected { font-weight: 600; background-color: #f0f9ff; }
        .clue-item.solved { text-decoration: line-through; color: #9ca3af; }
        .clue-number-badge { font-weight: bold; color: #1F2937; margin-right: 4px; }
        .check-btn { width: 2rem; height: 2rem; min-width: 2rem; padding: 0; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; border-radius: 8px; border: 2px solid #1D4ED8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: bold; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(29, 78, 216, 0.2); }
        .check-btn:hover { transform: scale(1.05); box-shadow: 0 4px 8px rgba(29, 78, 216, 0.3); background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); }
        .check-btn:active { transform: scale(0.95); }
        .rules-hint { background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border: 2px solid #3B82F6; border-radius: 0.75rem; padding: 1rem 1.5rem; margin-top: 1.5rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1); }
        .rules-hint-icon { width: 2rem; height: 2rem; min-width: 2rem; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; border-radius: 8px; border: 2px solid #1D4ED8; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: bold; box-shadow: 0 2px 4px rgba(29, 78, 216, 0.2); }
        .rules-hint-text { color: #1E40AF; font-size: 0.95rem; font-weight: 500; flex: 1; }
        .rules-hint-text strong { color: #1D4ED8; font-weight: 700; }
        /* Stats & Buttons */
        .stats-block { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; background: white; }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); }
        .stats-item { margin-bottom: 0.75rem; display: flex; justify-content: space-between; font-size: 1rem; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }
        .btn-game { background-color: var(--primary-color); color: white; padding: 0.75rem 1.5rem; border-radius: var(--border-radius); font-weight: 600; border: none; cursor: pointer; width: 100%; transition: background 0.2s; margin-top: 10px; }
        .btn-game:hover { background-color: #005f92; }

    </style>
</head>
<body>

    <!-- Start Screen Overlay -->
    <div id="start-screen" class="overlay">
                <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">Crucigrama</h2>
        <div style="background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">
            Nivel: ${config.difficulty}
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <button class="big-btn" onclick="startGame()">▶ Iniciar Juego</button>
            <button class="big-btn btn-info" onclick="toggleInfo(true)">ℹ Información</button>
        </div>
    </div>

    <!-- Info Overlay -->
    <div id="info-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">Crucigrama</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
            </div>
            <div class="info-details-grid">
            <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${gameDetails.authorName || 'No especificado'}</span></div>
                <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${gameDetails.version || '1.0.0'}</span></div>
            <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${platformsString}</span></div>
                <div class="info-item"><span class="info-label">Dificultad</span><span class="info-value">${config.difficulty}</span></div>
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
    <!-- Countdown Screen Overlay -->
<div id="countdown-screen" class="overlay hidden">
    <div id="countdown-display" class="countdown-number">5</div>
</div>
    <!-- End Screen Overlay -->
    <div id="end-screen" class="overlay hidden">
        <h1 id="end-title" style="color:var(--primary-color); font-size:3rem; font-weight: 800;">Fin del Juego</h1>
        <h2 style="color:var(--secondary-color); font-size:2rem; margin:1rem 0;">Puntos Obtenidos: <span id="final-score">0</span></h2>
        <div class="end-buttons" style="display:flex; gap:1rem;">
             <button class="big-btn btn-exit" onclick="window.close()">Salir</button>
             <button class="big-btn btn-retry" onclick="location.reload()">Volver a Jugar</button>
        </div>
    </div>

    <!-- Main Game UI -->
    <div class="container hidden" id="game-ui">
        ${animatedTitleHTML}
         <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
    <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
    <span style="font-size:1rem; color:#1e40af; font-weight:500;">Descifra las pistas horizontales y verticales para completar el crucigrama.</span>
</div>
        <div class="game-layout">
            <div class="game-left-col">
                <!-- Wrapper para el grid centrado y estilizado -->
                <div class="crossword-grid-wrapper">
                    <div id="crossword-container">Generando crucigrama...</div>
                </div>
                <!-- AGREGA ESTE BLOQUE -->
<div class="rules-hint">
    <div class="rules-hint-icon">✓</div>
    <div class="rules-hint-text">
        <strong>Instrucción:</strong> Haz clic en los botones <span style="display: inline-flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; border-radius: 6px; font-size: 0.75rem; font-weight: bold; margin: 0 0.25rem; border: 2px solid #1D4ED8;">H</span> o <span style="display: inline-flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; border-radius: 6px; font-size: 0.75rem; font-weight: bold; margin: 0 0.25rem; border: 2px solid #1D4ED8;">V</span> al lado de cada pista para verificar si tu respuesta es correcta.
    </div>
</div>
                <div class="clues-container">
                    <div class="clue-box">
                        <h4 style={{color: '#0077b6'}}>Horizontales</h4>
                        <div id="clues-h" class="clue-list"></div>
                    </div>
                    <div class="clue-box">
                        <h4 style={{color: '#0077b6'}}>Verticales</h4>
                        <div id="clues-v" class="clue-list"></div>
                    </div>
                </div>
            </div>
            
            <div class="game-right-col">
                <div class="stats-block">
                    <h3>Progreso</h3>
                    <div class="stats-item"><span>Dificultad:</span> <strong>${config.difficulty}</strong></div>
                    <div class="stats-item"><span>Tiempo Límite:</span> <strong id="timer">--:--</strong></div>
                    <div class="stats-item"><span>Puntaje:</span> <strong id="score">0</strong></div>
                    <div class="stats-item"><span>Palabras:</span> <strong id="word-count">0/${config.words.length}</strong></div>
                </div>
                <button class="btn-game" onclick="finishGameUI()">Finalizar Juego</button>
            </div>
        </div>
    </div>

    <script>
        const words = ${wordsJSON};
        const timeLimit = ${config.timeLimit};
        let timeLeft = timeLimit;
        let score = 0;
        let timerInterval;
        let activePuzzle = null;
        let userGrid = [];
        let solvedWordsIDs = [];

        function toggleInfo(show) {
             const m = document.getElementById('info-overlay');
             if(show) { m.classList.remove('hidden'); m.style.display = 'flex'; }
             else { m.classList.add('hidden'); m.style.display = 'none'; }
        }

        // --- BACKTRACKING ALGORITHM ---
        const generateCrosswordGrid = (words) => {
          if (!words || words.length === 0) return null;
          const MAX_RESTARTS = 50; 
          const rows = 20; const cols = 20;
          const makeGrid = () => Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
          const inBounds = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;
          
          const canPlace = (grid, word, dir, sr, sc) => {
            const len = word.length;
            const endR = sr + (dir === 'vertical' ? len - 1 : 0);
            const endC = sc + (dir === 'horizontal' ? len - 1 : 0);
            if (!inBounds(sr, sc) || !inBounds(endR, endC)) return false;
            
            if (dir === 'horizontal') {
              if (sc - 1 >= 0 && grid[sr][sc - 1]) return false;
              if (sc + len < cols && grid[sr][sc + len]) return false;
            } else {
              if (sr - 1 >= 0 && grid[sr - 1][sc]) return false;
              if (sr + len < rows && grid[sr + len][sc]) return false;
            }

            for (let i = 0; i < len; i++) {
              const r = sr + (dir === 'vertical' ? i : 0);
              const c = sc + (dir === 'horizontal' ? i : 0);
              const letter = word[i];
              const existing = grid[r][c];
              if (existing && existing !== letter) return false;
              if (!existing) {
                if (dir === 'horizontal') {
                  if (r - 1 >= 0 && grid[r - 1][c]) return false;
                  if (r + 1 < rows && grid[r + 1][c]) return false;
                } else {
                  if (c - 1 >= 0 && grid[r][c - 1]) return false;
                  if (c + 1 < cols && grid[r][c + 1]) return false;
                }
              }
            }
            return true;
          };

          const applyPlace = (grid, word, dir, sr, sc) => {
            for (let i = 0; i < word.length; i++) {
              const r = sr + (dir === 'vertical' ? i : 0);
              const c = sc + (dir === 'horizontal' ? i : 0);
              grid[r][c] = word[i];
            }
          };

          const cloneGrid = (grid) => grid.map((row) => row.slice());
          const shuffle = (arr) => { const a = arr.slice(); for(let i=a.length-1; i>0; i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

          const getCandidatesByCrossing = (grid, word, dir) => {
            const candidates = [];
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                if (grid[r][c] && word.includes(grid[r][c])) {
                   for(let j=0; j<word.length; j++){
                       if(word[j] === grid[r][c]){
                           const sr = dir === 'horizontal' ? r : r - j;
                           const sc = dir === 'horizontal' ? c - j : c;
                           candidates.push({ r: sr, c: sc });
                       }
                   }
                }
              }
            }
            return shuffle(candidates);
          };

          const backtrack = (grid, idx, shuffled, directions, entries) => {
            if (idx >= shuffled.length) return entries;
            const w = shuffled[idx];
            const dir = directions[idx];
            
            let candidates = getCandidatesByCrossing(grid, w.word, dir);
            if(candidates.length === 0 && idx === 0) candidates.push({r: Math.floor(rows/2), c: Math.floor(cols/2)});

            for (const cand of candidates) {
              if (canPlace(grid, w.word, dir, cand.r, cand.c)) {
                const nextGrid = cloneGrid(grid);
                applyPlace(nextGrid, w.word, dir, cand.r, cand.c);
                const nextEntries = entries.concat({
                  id: w.id, direction: dir, start: [cand.r, cand.c], word: w.word, clue: w.clue
                });
                const res = backtrack(nextGrid, idx + 1, shuffled, directions, nextEntries);
                if (res) return res;
              }
            }
            return null;
          };

          for (let restart = 0; restart < MAX_RESTARTS; restart++) {
            const grid = makeGrid();
            const shuffled = shuffle(words).map(w => ({ ...w, word: w.word.toUpperCase() }));
            const directions = shuffled.map((_, i) => i % 2 === 0 ? 'horizontal' : 'vertical');
            
            const first = shuffled[0];
            const fDir = directions[0];
            const mid = Math.floor(rows/2);
            if(canPlace(grid, first.word, fDir, mid, mid)) {
                applyPlace(grid, first.word, fDir, mid, mid);
                const entries = [{ id: first.id, direction: fDir, start: [mid, mid], word: first.word, clue: first.clue }];
                
                const res = backtrack(grid, 1, shuffled, directions, entries);
                if(res && res.length === words.length) {
                    let minR=rows, maxR=0, minC=cols, maxC=0;
                    res.forEach(s => {
                        let r = s.start[0], c = s.start[1];
                        minR = Math.min(minR, r); minC = Math.min(minC, c);
                        if(s.direction === 'horizontal') { maxR = Math.max(maxR, r); maxC = Math.max(maxC, c + s.word.length - 1); }
                        else { maxR = Math.max(maxR, r + s.word.length - 1); maxC = Math.max(maxC, c); }
                    });
                    const solutions = res.map(s => ({ ...s, start: [s.start[0]-minR, s.start[1]-minC] }));
                    return { gridSize: Math.max(maxR-minR+1, maxC-minC+1) + 1, solutions };
                }
            }
          }
          return null;
        };

        function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('countdown-screen').classList.remove('hidden');
    let count = 5;
    const countDisplay = document.getElementById('countdown-display');
    countDisplay.innerText = count;
    const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countDisplay.innerText = count;
            countDisplay.style.animation = 'none';
            countDisplay.offsetHeight; // fuerza reflow para reiniciar animación
            countDisplay.style.animation = '';
        } else {
            clearInterval(countInterval);
            document.getElementById('countdown-screen').classList.add('hidden');
            document.getElementById('game-ui').classList.remove('hidden');
            initGameLogic();
        }
    }, 1000);
}

        function initGameLogic() {
           activePuzzle = generateCrosswordGrid(words);
           if(!activePuzzle) { document.getElementById('crossword-container').innerText = "Error al generar. Recarga."; return; }
           
           // UI Setup
           const container = document.getElementById('crossword-container');
           container.innerHTML = '';
           const table = document.createElement('div');
           table.className = 'cw-table';
           table.style.gridTemplateColumns = 'repeat(' + activePuzzle.gridSize + ', 2.75rem)'; // Same size as React
           
           userGrid = Array(activePuzzle.gridSize).fill().map(() => Array(activePuzzle.gridSize).fill(''));
           
           // Numbering
           const numbers = {};
           let num = 1;
           activePuzzle.solutions.forEach(s => {
               const k = s.start.join('-');
               if(!numbers[k]) numbers[k] = num++;
           });

           // Render Cells
           for(let r=0; r<activePuzzle.gridSize; r++){
               for(let c=0; c<activePuzzle.gridSize; c++){
                   const cell = document.createElement('div');
                   cell.className = 'cw-cell black';
                   cell.id = 'cell-'+r+'-'+c;
                   
                   let isChar = false;
                   let cellNum = null;
                   
                   activePuzzle.solutions.forEach(s => {
                       const [sr, sc] = s.start;
                       if(sr === r && sc === c) cellNum = numbers[sr+'-'+sc];
                       for(let i=0; i<s.word.length; i++) {
                           const rr = sr + (s.direction==='vertical'?i:0);
                           const cc = sc + (s.direction==='horizontal'?i:0);
                           if(rr===r && cc===c) isChar = true;
                       }
                   });
                   
                   if(isChar) {
                       cell.className = 'cw-cell';
                       if(cellNum) {
                           const nSpan = document.createElement('span');
                           nSpan.className = 'cw-number';
                           nSpan.innerText = cellNum;
                           cell.appendChild(nSpan);
                       }
                       const inp = document.createElement('input');
                       inp.maxLength = 1;
                       inp.oninput = (e) => { 
                           e.target.value = e.target.value.toUpperCase(); 
                           userGrid[r][c] = e.target.value;
                       };
                       inp.onfocus = () => highlightWord(r, c);
                       cell.appendChild(inp);
                   }
                   table.appendChild(cell);
               }
           }
           container.appendChild(table);

           // Render Clues
           const listH = document.getElementById('clues-h');
           const listV = document.getElementById('clues-v');
           activePuzzle.solutions.forEach(s => {
               const k = s.start.join('-');
               const item = document.createElement('div');
               item.className = 'clue-item';
               item.id = 'clue-' + s.id;
               item.onclick = () => { selectClue(s); };
               
               const btnCheck = document.createElement('button');
               btnCheck.className = 'check-btn';
               btnCheck.innerText = s.direction === 'horizontal' ? 'H' : 'V';
               btnCheck.onclick = (e) => { e.stopPropagation(); checkSpecificWord(s); };

               const txt = document.createElement('span');
               txt.style.marginLeft = '8px';
               txt.innerHTML = '<span class="clue-number-badge">' + numbers[k] + '.</span> ' + s.clue;

               item.appendChild(btnCheck);
               item.appendChild(txt);

               if(s.direction === 'horizontal') listH.appendChild(item);
               else listV.appendChild(item);
           });
           
           startTimer();
        }

        function highlightWord(r, c) {
            // Remove previous highlights
            document.querySelectorAll('.cw-cell').forEach(el => el.classList.remove('selected'));
            document.querySelectorAll('.clue-item').forEach(el => el.classList.remove('selected'));

            // Find word at this cell
            const found = activePuzzle.solutions.find(s => {
                const [sr, sc] = s.start;
                if(s.direction === 'horizontal') return r === sr && c >= sc && c < sc + s.word.length;
                return c === sc && r >= sr && r < sr + s.word.length;
            });

            if(found) {
                const clueEl = document.getElementById('clue-' + found.id);
                if(clueEl) {
                    clueEl.classList.add('selected');
                    // SCROLL REMOVED to prevent UI jumping
                }
                
                const [sr, sc] = found.start;
                for(let i=0; i<found.word.length; i++){
                    const rr = sr + (found.direction==='vertical'?i:0);
                    const cc = sc + (found.direction==='horizontal'?i:0);
                    const cell = document.getElementById('cell-'+rr+'-'+cc);
                    if(cell) cell.classList.add('selected');
                }
            }
        }

        function selectClue(s) {
            // Highlight manually selected clue
            const [sr, sc] = s.start;
            const input = document.querySelector('#cell-'+sr+'-'+sc+' input');
            if(input) input.focus();
        }

        function checkSpecificWord(clue) {
            if(solvedWordsIDs.includes(clue.id)) return;
            
            const [sr, sc] = clue.start;
            let currentWord = "";
            for(let i=0; i<clue.word.length; i++) {
               const rr = sr + (clue.direction==='vertical'?i:0);
               const cc = sc + (clue.direction==='horizontal'?i:0);
               currentWord += (userGrid[rr][cc] || "");
            }

            if(currentWord === clue.word) {
                Swal.fire({ title: '¡Correcto!', icon: 'success', timer: 1000, showConfirmButton: false });
                score += 10;
                document.getElementById('score').innerText = score;
                solvedWordsIDs.push(clue.id);
                document.getElementById('word-count').innerText = solvedWordsIDs.length + '/' + activePuzzle.solutions.length;

                // Mark visually
                const clueEl = document.getElementById('clue-' + clue.id);
                if(clueEl) clueEl.classList.add('solved');
                
                for(let i=0; i<clue.word.length; i++) {
                   const rr = sr + (clue.direction==='vertical'?i:0);
                   const cc = sc + (clue.direction==='horizontal'?i:0);
                   const cell = document.getElementById('cell-'+rr+'-'+cc);
                   if(cell) {
                       cell.classList.add('solved');
                       cell.querySelector('input').style.color = '#065F46';
                   }
                }

                if(solvedWordsIDs.length === activePuzzle.solutions.length) {
                    setTimeout(() => finishGameUI(true), 500);
                }
            } else {
                Swal.fire({ title: 'Incorrecto', text: 'Revisa tus letras', icon: 'error', timer: 1000, showConfirmButton: false });
            }
        }
       function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function startTimer() {
    document.getElementById('timer').innerText = formatTime(timeLeft);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = formatTime(timeLeft);
        if(timeLeft <= 0) { clearInterval(timerInterval); finishGameUI(false); }
    }, 1000);
}

        function finishGameUI(won = false) {
            clearInterval(timerInterval);
            document.getElementById('game-ui').classList.add('hidden');
            document.getElementById('end-screen').classList.remove('hidden');
            document.getElementById('end-title').innerText = won ? '¡Juego Completado!' : 'Fin del Juego';
            document.getElementById('final-score').innerText = score;
        }

        lucide.createIcons();
    </script>
</body>
</html>`;
};

// --- COMPONENTE GRID CELL ---
const GridCell = React.memo(({ value, isReadOnly, number, onChange, onFocus, isSolved, isSelected }) => {
    const handleChange = (e) => {
        const val = e.target.value.toUpperCase().slice(-1);
        onChange(val);
    };

    const cellStyle = {
        width: '100%',
        height: '100%',
        position: 'relative',
        background: isReadOnly ? '#E5E7EB' : (isSolved ? '#D1FAE5' : (isSelected ? '#E0F2FE' : 'white')),
        border: isReadOnly ? '1px solid #D1D5DB' : (isSolved ? '2px solid #6EE7B7' : (isSelected ? '2px solid #3B82F6' : '2px solid #9CA3AF')),
        borderRadius: '0.375rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s'
    };

    const inputStyle = {
        width: '100%',
        height: '100%',
        border: 'none',
        textAlign: 'center',
        background: 'transparent',
        fontWeight: 'bold',
        fontSize: '1.25rem',
        color: isSolved ? '#065F46' : '#111827',
        outline: 'none',
        padding: 0,
        cursor: isReadOnly ? 'default' : 'text'
    };

    const numberStyle = {
        position: 'absolute',
        top: '2px',
        left: '4px',
        fontSize: '0.75rem',
        color: '#6B7280',
        fontWeight: 'bold',
        pointerEvents: 'none',
        lineHeight: 1
    };

    return (
        <div style={{ width: '2.75rem', height: '2.75rem', padding: '1px' }}>
            <div style={cellStyle}>
                {number && <span style={numberStyle}>{number}</span>}
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    onFocus={onFocus}
                    style={inputStyle}
                />
            </div>
        </div>
    );
});

// --- ANDROID: CONFIGURACIÓN Y GENERACIÓN DE APPLICATION ID ÚNICO ---
const ANDROID_BUILD_GRADLE_PATH = "android/app/build.gradle";
const CAPACITOR_CONFIG_PATH = "android/app/src/main/assets/capacitor.config.json";
const ANDROID_STRINGS_PATH = "android/app/src/main/res/values/strings.xml";
const CRUCIGRAMA_APPLICATION_ID_BASE = "io.crucigrama.steam";

const createUuidSegment = () => {
    const rawUuid = window.crypto?.randomUUID?.()
        || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    return `uuid_${uuid}`;
};

const buildCrucigramaApplicationId = () => {
    return `${CRUCIGRAMA_APPLICATION_ID_BASE}.${createUuidSegment()}`;
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

const applyCrucigramaAndroidMetadata = async (zip, { applicationId }) => {
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
const Summary = ({ config, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const [jsZipReady, setJsZipReady] = useState(false);

    const location = useLocation();
    const state = location.state;

    const MOCK_DATA = {
        selectedAreas: ['science', 'math'],
        selectedSkills: ['Vocabulario', 'Lógica'],
        gameDetails: {
            gameName: "Juego de Prueba (Preview)",
            description: "Esta es una descripción de prueba para el preview.",
            version: "1.0.0",
            date: null
        },
        selectedPlatforms: ['web']
    };

    const getFixedCreationDate = () => {
        const KEY = 'crucigrama:creation_date';
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
        if (window.JSZip) {
            setJsZipReady(true);
            return;
        }
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
        if (!window.JSZip) return;
        try {
            const zip = new window.JSZip();

            // Normalizar palabras al formato que Home.tsx espera: { answer, clue }
            // Para el HTML web: mantener formato original {id, word, clue} que usa el motor interno
            const enrichedConfig = {
                ...config,
                words: (config.words || []).map(w => ({
                    id: w.id || w.word || w.answer || '',
                    word: (w.word || w.answer || w.palabra || '').toUpperCase().trim(),
                    clue: w.clue || w.pista || ''
                })).filter(w => w.word && w.clue)
            };
            const htmlContent = generateCrosswordCode(enrichedConfig, gameDetails, selectedPlatforms);

            const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'crucigrama')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            zip.file(htmlFileName, htmlContent);

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'crucigrama')}_web.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setProgress(100);
            setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error("Error ZIP:", error);
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
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando palabras...");
                setProgress(currentProgress);
            }
        }, 200);
    };

    const generateAndDownloadAndroidZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }
        try {
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/crucigrama_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Procesando archivos ZIP...");
            const zip = await window.JSZip.loadAsync(arrayBuffer);

            setStatusText("Inyectando configuración...");
            const selectedPlats = state?.selectedPlatforms ?? [];
            const details = state?.gameDetails ?? {};

            // Bug 1 fix: normalizar palabras al formato { answer, clue } que Home.tsx espera
            const normalizedWords = (config.words || []).map(w => ({
                answer: (w.answer || w.word || w.palabra || '').toUpperCase().trim(),
                clue: w.clue || w.pista || ''
            })).filter(w => w.answer && w.clue);

            // Mapear dificultad al key inglés que Home.tsx espera en normalizarNivelConfig
            const nivelMap = { 'Básico': 'basic', 'Intermedio': 'intermediate', 'Avanzado': 'advanced' };
            const nivelKey = nivelMap[config?.difficulty] || 'basic';

            const fullConfig = {
                nivel: nivelKey,
                autor: details.authorName || '',
                version: details.version || '1.0.0',
                fecha: details.date || (() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`; })(),
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Crucigrama',
                plataformas: Array.isArray(selectedPlats) ? selectedPlats : ['android'],
                palabras: normalizedWords  // Home.tsx lee "palabras" con { answer, clue }
            };

            const androidApplicationId = buildCrucigramaApplicationId();
            zip.file(
                "android/app/src/main/assets/public/config/crucigrama-config.json",
                JSON.stringify(fullConfig, null, 2)
            );
            await applyCrucigramaAndroidMetadata(zip, { applicationId: androidApplicationId });


            setStatusText("Generando paquete final...");
            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            const platformsSuffix = (Array.isArray(selectedPlats) ? selectedPlats : ['movil'])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            link.download = `${normalizeFileName(details?.gameName || 'crucigrama')}_${platformsSuffix}.zip`;
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
            const enrichedConfig = {
                ...config,
                words: (config.words || []).map(w => ({
                    answer: (w.answer || w.word || w.palabra || '').toUpperCase().trim(),
                    clue: w.clue || w.pista || ''
                })).filter(w => w.answer && w.clue)
            };
            const htmlContent = generateCrosswordCode(enrichedConfig, gameDetails, selectedPlatforms);
            const webZip = new window.JSZip();

            const htmlFileNameCombined = `${normalizeFileName(gameDetails?.gameName || 'crucigrama')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            webZip.file(htmlFileNameCombined, htmlContent);
            const webBlob = await webZip.generateAsync({ type: "blob" });
            outerZip.file(`${normalizeFileName(gameDetails?.gameName || 'crucigrama')}_web.zip`, webBlob);

            // ── Generar ZIP Android ──
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/crucigrama_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Inyectando configuración Android...");
            const androidZip = await window.JSZip.loadAsync(arrayBuffer);
            const selectedPlats = state?.selectedPlatforms ?? [];
            const details = state?.gameDetails ?? {};
            const normalizedWords = (config.words || []).map(w => ({
                answer: (w.answer || w.word || w.palabra || '').toUpperCase().trim(),
                clue: w.clue || w.pista || ''
            })).filter(w => w.answer && w.clue);
            const nivelMap = { 'Básico': 'basic', 'Intermedio': 'intermediate', 'Avanzado': 'advanced' };
            const fullConfig = {
                nivel: nivelMap[config?.difficulty] || 'basic',
                autor: details.authorName || '',
                version: details.version || '1.0.0',
                fecha: details.date || new Date().toISOString(),
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Crucigrama',
                plataformas: Array.isArray(selectedPlats) ? selectedPlats : ['android'],
                palabras: normalizedWords
            };
            const androidApplicationId = buildCrucigramaApplicationId();
            androidZip.file(
                "android/app/src/main/assets/public/config/crucigrama-config.json",
                JSON.stringify(fullConfig, null, 2)
            );
            await applyCrucigramaAndroidMetadata(androidZip, { applicationId: androidApplicationId });
            const androidBlob = await androidZip.generateAsync({ type: "blob", platform: "UNIX" });

            const mobilePlatforms = (selectedPlatforms ?? [])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            outerZip.file(`${normalizeFileName(details?.gameName || 'crucigrama')}_${mobilePlatforms}.zip`, androidBlob);

            // ── ZIP contenedor final ──
            setStatusText("Empaquetando todo...");
            const finalBlob = await outerZip.generateAsync({ type: "blob" });
            const platformsLabel = (selectedPlatforms ?? [])
                .map(p => platformLabel(p))
                .join('_');
            const url = window.URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'crucigrama')}_${platformsLabel}.zip`;
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

    const formatDate = (dateString) => {
        try {
            const normalized = dateString?.includes('T') ? dateString : (dateString || '') + 'T00:00:00';
            return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        catch (e) { return "Fecha inválida"; }
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
        return icons[areaId] || 'https://placehold.co/20x20/eee/aaa?text=?';
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
                        <div className="info-card-value">{gameDetails.gameName}</div>
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
                        <div className="info-card-value">{gameDetails.description || 'Sin descripción.'}</div>
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
                                        <img
                                            src={getAreaIcon(areaId)}
                                            alt=""
                                            style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                                            onError={(e) => { e.target.src = 'https://placehold.co/20x20/eee/aaa?text=?'; }}
                                        />
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

                <div className="summary-card" style={{ marginTop: '2.5rem' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#0077b6' }}>
                        Parámetros del Juego
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', rowGap: '1rem', alignItems: 'center' }}>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Type size={18} /> Dificultad:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.difficulty}</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Tiempo Límite:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>
                                {Math.floor(config.timeLimit / 60)} minutos
                            </strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><List size={18} /> Palabras:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.words.length}</strong>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#334155' }}>Palabras Seleccionadas:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                            {config.words.map(w => (
                                <span key={w.id} style={{
                                    background: 'white', padding: '6px 12px',
                                    borderRadius: '20px', fontSize: '0.9rem', border: '1px solid #e2e8f0',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#475569'
                                }}>
                                    {w.word}
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
                            boxShadow: '0 4px 14px 0 rgba(0, 119, 182, 0.35)',
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
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function Crucigrama() {
    const [view, setView] = useState('home');
    const [difficulty, setDifficulty] = useState('Básico');
    const [selectedWords, setSelectedWords] = useState([]);

    // AGREGA AQUÍ la función formatTime
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const availableWords = useMemo(() => puzzleData[difficulty]?.words || [], [difficulty]);

    // Game States
    const [activePuzzle, setActivePuzzle] = useState(null);
    const [userGrid, setUserGrid] = useState([]);
    const [solvedWords, setSolvedWords] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedClue, setSelectedClue] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setSelectedWords([]);
    }, [difficulty]);

    useEffect(() => {
        if (!window.Swal) {
            const s = document.createElement('script');
            s.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
            document.body.appendChild(s);
            return () => { if (document.body.contains(s)) document.body.removeChild(s); }
        }
    }, []);

    // --- LÓGICA DE GENERACIÓN (BACKTRACKING) ---
    const generateCrosswordGrid = useCallback((words) => {
        if (!words || words.length === 0) return null;
        const MAX_RESTARTS = 200;
        const rows = 20; const cols = 20;

        const makeGrid = () => Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
        const inBounds = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;

        const canPlace = (grid, word, dir, sr, sc) => {
            const len = word.length;
            const endR = sr + (dir === 'vertical' ? len - 1 : 0);
            const endC = sc + (dir === 'horizontal' ? len - 1 : 0);

            if (!inBounds(sr, sc) || !inBounds(endR, endC)) return false;

            if (dir === 'horizontal') {
                if (sc - 1 >= 0 && grid[sr][sc - 1]) return false;
                if (sc + len < cols && grid[sr][sc + len]) return false;
            } else {
                if (sr - 1 >= 0 && grid[sr - 1][sc]) return false;
                if (sr + len < rows && grid[sr + len][sc]) return false;
            }

            for (let i = 0; i < len; i++) {
                const r = sr + (dir === 'vertical' ? i : 0);
                const c = sc + (dir === 'horizontal' ? i : 0);
                const letter = word[i];
                const existing = grid[r][c];

                if (existing && existing !== letter) return false;

                if (!existing) {
                    if (dir === 'horizontal') {
                        if (r - 1 >= 0 && grid[r - 1][c]) return false;
                        if (r + 1 < rows && grid[r + 1][c]) return false;
                    } else {
                        if (c - 1 >= 0 && grid[r][c - 1]) return false;
                        if (c + 1 < cols && grid[r][c + 1]) return false;
                    }
                }
            }
            return true;
        };

        const applyPlace = (grid, word, dir, sr, sc) => {
            for (let i = 0; i < word.length; i++) {
                const r = sr + (dir === 'vertical' ? i : 0);
                const c = sc + (dir === 'horizontal' ? i : 0);
                grid[r][c] = word[i];
            }
        };

        const cloneGrid = (grid) => grid.map((row) => row.slice());
        const shuffle = (arr) => {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };

        const getCandidatesByCrossing = (grid, word, dir) => {
            const candidates = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = grid[r][c];
                    if (!cell) continue;
                    for (let j = 0; j < word.length; j++) {
                        if (word[j] !== cell) continue;
                        const sr = dir === 'horizontal' ? r : r - j;
                        const sc = dir === 'horizontal' ? c - j : c;
                        candidates.push({ r: sr, c: sc });
                    }
                }
            }
            return shuffle(candidates);
        };

        const backtrack = (grid, idx, shuffled, directions, entries) => {
            if (idx >= shuffled.length) return entries;

            const w = shuffled[idx];
            const dir = directions[idx];

            let crossingCandidates = getCandidatesByCrossing(grid, w.word, dir);

            if (idx === 0 && crossingCandidates.length === 0) {
                crossingCandidates.push({ r: Math.floor(rows / 2), c: Math.floor(cols / 2) });
            }

            for (const cand of crossingCandidates) {
                if (!canPlace(grid, w.word, dir, cand.r, cand.c)) continue;

                const nextGrid = cloneGrid(grid);
                applyPlace(nextGrid, w.word, dir, cand.r, cand.c);

                const nextEntries = entries.concat({
                    id: w.id,
                    direction: dir,
                    start: [cand.r, cand.c],
                    word: w.word,
                    clue: w.clue
                });

                const res = backtrack(nextGrid, idx + 1, shuffled, directions, nextEntries);
                if (res) return res;
            }

            return null;
        };

        for (let restart = 0; restart < MAX_RESTARTS; restart++) {
            const grid = makeGrid();
            const shuffled = shuffle(words).map((w) => ({ ...w, word: w.word.toUpperCase() }));
            const directions = shuffled.map((_, i) => i % 2 === 0 ? 'horizontal' : 'vertical');

            const first = shuffled[0];
            const firstDir = directions[0];
            const midR = Math.floor(rows / 2);
            const midC = Math.floor(cols / 2);

            const baseR = firstDir === 'vertical' ? midR - Math.floor(first.word.length / 2) : midR;
            const baseC = firstDir === 'horizontal' ? midC - Math.floor(first.word.length / 2) : midC;

            if (!canPlace(grid, first.word, firstDir, baseR, baseC)) continue;

            const g0 = cloneGrid(grid);
            applyPlace(g0, first.word, firstDir, baseR, baseC);

            const entries0 = [{
                id: first.id, direction: firstDir, start: [baseR, baseC], word: first.word, clue: first.clue,
            }];

            const res = backtrack(g0, 1, shuffled, directions, entries0);

            if (res && res.length === words.length) {
                let minRow = rows, maxRow = 0, minCol = cols, maxCol = 0;
                res.forEach(sol => {
                    let r = sol.start[0];
                    let c = sol.start[1];
                    minRow = Math.min(minRow, r);
                    minCol = Math.min(minCol, c);
                    if (sol.direction === 'horizontal') {
                        maxRow = Math.max(maxRow, r);
                        maxCol = Math.max(maxCol, c + sol.word.length - 1);
                    } else {
                        maxRow = Math.max(maxRow, r + sol.word.length - 1);
                        maxCol = Math.max(maxCol, c);
                    }
                });

                const adjustedSolutions = res.map(sol => ({
                    ...sol,
                    start: [sol.start[0] - minRow, sol.start[1] - minCol]
                }));

                return {
                    gridSize: Math.max(maxRow - minRow + 1, maxCol - minCol + 1) + 1,
                    solutions: adjustedSolutions
                };
            }
        }
        return null;
    }, []);

    // Construcción del Grid visual
    const buildGrid = useCallback((puzzle, solvedWords, selectedClue) => {
        if (!puzzle) return { grid: [], numbers: new Map() };
        const { gridSize, solutions } = puzzle;
        const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => ({ value: '', isReadOnly: true, number: null, isSolved: false, isSelected: false })));
        const numbers = new Map();
        let numCounter = 1;

        solutions.forEach(sol => {
            const [r, c] = sol.start;
            const key = `${r}-${c}`;
            if (!numbers.has(key)) numbers.set(key, numCounter++);
        });

        // Marcar celdas
        solutions.forEach(sol => {
            const [r, c] = sol.start;
            const key = `${r}-${c}`;
            const isSolvedWord = solvedWords.includes(sol.id);
            const isSelectedWord = selectedClue?.id === sol.id;

            for (let i = 0; i < sol.word.length; i++) {
                const rr = r + (sol.direction === 'vertical' ? i : 0);
                const cc = c + (sol.direction === 'horizontal' ? i : 0);
                if (rr < gridSize && cc < gridSize) {
                    const cell = grid[rr][cc];
                    cell.isReadOnly = false;
                    if (i === 0) cell.number = numbers.get(key);
                    if (isSolvedWord) cell.isSolved = true;
                    if (isSelectedWord && !cell.isSolved) cell.isSelected = true;
                }
            }
        });
        return { grid, numbers };
    }, []);

    const gridTemplate = useMemo(() => buildGrid(activePuzzle, solvedWords, selectedClue), [activePuzzle, solvedWords, selectedClue, buildGrid]);

    // --- HANDLERS ---
    const handleToggleWord = (word) => {
        const config = difficultySettings[difficulty];
        if (selectedWords.some(w => w.id === word.id)) {
            setSelectedWords(selectedWords.filter(w => w.id !== word.id));
        } else if (selectedWords.length < config.max) {
            setSelectedWords([...selectedWords, word]);
        }
    };

    const startGame = () => {
        const config = difficultySettings[difficulty];
        if (selectedWords.length < config.min) {
            window.Swal?.fire('Atención', `Selecciona al menos ${config.min} palabras`, 'warning');
            return;
        }
        const puzzle = generateCrosswordGrid(selectedWords);
        if (puzzle) {
            setActivePuzzle(puzzle);
            const emptyGrid = Array.from({ length: puzzle.gridSize }, () => Array(puzzle.gridSize).fill(''));
            setUserGrid(emptyGrid);
            setSolvedWords([]);
            setScore(0);
            setTimeLeft(config.time);
            setView('game');
        } else {
            window.Swal?.fire('Error', 'No se pudo generar el crucigrama con estas palabras. Intenta otra combinación.', 'error');
        }
    };

    useEffect(() => {
        let timer;
        if (view === 'game' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && view === 'game') {
            window.Swal?.fire('Tiempo Agotado', '', 'error').then(() => setView('home'));
        }
        return () => clearInterval(timer);
    }, [view, timeLeft]);

    const checkWord = (clue) => {
        if (solvedWords.includes(clue.id)) return;

        const word = clue.word;
        let userWord = "";
        const [sr, sc] = clue.start;
        for (let i = 0; i < word.length; i++) {
            const r = sr + (clue.direction === 'vertical' ? i : 0);
            const c = sc + (clue.direction === 'horizontal' ? i : 0);
            userWord += userGrid[r]?.[c] || "";
        }

        if (userWord === word) {
            setSolvedWords(prev => {
                const newSolved = [...prev, clue.id];
                if (newSolved.length === activePuzzle.solutions.length) {
                    setTimeout(() => finishGame(score + 10), 500);
                }
                return newSolved;
            });
            const newScore = score + 10;
            setScore(newScore);
            window.Swal?.fire({ title: '¡Correcto!', icon: 'success', timer: 1000, showConfirmButton: false });
        } else {
            window.Swal?.fire({ title: 'Incorrecto', text: 'Intenta de nuevo', icon: 'error', timer: 1000, showConfirmButton: false });
        }
    };

    const handleCellChange = (r, c, val) => {
        const newGrid = [...userGrid];
        newGrid[r][c] = val;
        setUserGrid(newGrid);
    };

    const handleCellFocus = (r, c) => {
        if (!activePuzzle) return;
        const found = activePuzzle.solutions.find(s => {
            const [sr, sc] = s.start;
            if (s.direction === 'horizontal') return r === sr && c >= sc && c < sc + s.word.length;
            return c === sc && r >= sr && r < sr + s.word.length;
        });
        if (found) setSelectedClue(found);
    };

    const finishGame = (finalScore = score) => {
        window.Swal?.fire({
            title: '¡Juego Completado!',
            html: `<p>Puntos Obtenidos: <strong>${finalScore}</strong></p>`,
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
                setView('home');
            }
        });
    };

    const goToSummary = () => {
        setView('summary');
        navigate('/settings?view=summary', { replace: true, state: location.state });
    };

    const currentConfig = difficultySettings[difficulty];

    // --- RENDER CONFIG ---
    const renderConfig = () => (
        <div className="config-screen">
            <div className="game-title">
                {'Juego del Crucigrama'.split('').map((char, i) => (
                    <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>{char === ' ' ? '\u00A0' : char}</span>
                ))}
            </div>
            <div className="rules-text">
                <h2>Configura tu crucigrama seleccionando las palabras.</h2>
            </div>
            <div className="config-controls">
                <div className="control-group">
                    <label>Selecciona el nivel de dificultad:</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                        {Object.keys(difficultySettings).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                </div>
                <div className="control-group" style={{ alignItems: 'flex-end' }}>
                    <button className="no-rounded-button" onClick={() => setSelectedWords([])} style={{ backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', fontSize: '0.9rem' }}>
                        <RotateCcw size={16} /> Reiniciar Selección
                    </button>
                </div>
            </div>

            <div className="riddle-catalog">
                <div className="riddle-header">
                    <strong>Catálogo de Palabras</strong>
                    <span style={{ color: '#0077b6', fontWeight: 'bold' }}>
                        {selectedWords.length} / {currentConfig.max} (Mínimo: {currentConfig.min})
                    </span>
                </div>
                <div className="riddle-grid">
                    {availableWords.map(w => {
                        const selected = selectedWords.some(s => s.id === w.id);
                        return (
                            <button key={w.id} className={`acertijo-select-btn ${selected ? 'selected' : ''}`} onClick={() => handleToggleWord(w)}>
                                <div>{selected ? <CheckCircle size={18} color="#0077b6" /> : <HelpCircle size={18} color="#ccc" />}</div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase' }}>{w.word}</div>
                                    <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.clue}</div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="config-footer">
                <button onClick={() => navigate(-1)} className="no-rounded-button">
                    <ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior
                </button>
                <button
                    onClick={startGame}
                    disabled={selectedWords.length < currentConfig.max}
                    className="no-rounded-button"
                >
                    Siguiente <ArrowRight style={{ marginLeft: '0.5rem' }} />
                </button>
            </div>
        </div>
    );

    // --- RENDER GAME ---
    const renderGame = () => {
        const horizontalClues = activePuzzle.solutions.filter(s => s.direction === 'horizontal');
        const verticalClues = activePuzzle.solutions.filter(s => s.direction === 'vertical');

        return (
            <div className="game-screen">
                <div className="game-title">
                    {'Juego del Crucigrama'.split('').map((char, i) => (
                        <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>{char === ' ' ? '\u00A0' : char}</span>
                    ))}
                </div>
                <h3 style={{ textAlign: 'center', color: '#6b7280', marginTop: '-0.5rem', marginBottom: '1.5rem', fontWeight: '500' }}>
                    (Vista Previa)
                </h3>
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
                    <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>Descifra las pistas horizontales y verticales para completar el crucigrama.</span>
                </div>
                <div className="game-layout">
                    <div className="game-left-col">
                        <div className="crossword-grid-wrapper">
                            {/* Render Grid Table */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${activePuzzle.gridSize}, 2.75rem)`,
                                gap: '1px'
                            }}>
                                {gridTemplate.grid.map((row, r) =>
                                    row.map((cell, c) => (
                                        <GridCell
                                            key={`${r}-${c}`}
                                            value={userGrid[r][c]}
                                            isReadOnly={cell.isReadOnly}
                                            number={cell.number}
                                            isSolved={cell.isSolved}
                                            isSelected={cell.isSelected}
                                            onFocus={() => handleCellFocus(r, c)}
                                            onChange={(val) => handleCellChange(r, c, val)}
                                        />
                                    ))
                                )}
                            </div>

                        </div>

                        {/* AGREGA ESTE BLOQUE COMPLETO */}
                        <div className="rules-hint">
                            <div className="rules-hint-icon">✓</div>
                            <div className="rules-hint-text">
                                <strong>Instrucción:</strong> Haz clic en los botones <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '1.5rem',
                                    height: '1.5rem',
                                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                    color: 'white',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    margin: '0 0.25rem',
                                    border: '2px solid #1D4ED8'
                                }}>H</span> o <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '1.5rem',
                                    height: '1.5rem',
                                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                    color: 'white',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    margin: '0 0.25rem',
                                    border: '2px solid #1D4ED8'
                                }}>V</span> al lado de cada pista para verificar si tu respuesta es correcta.
                            </div>
                        </div>



                        <div className="clues-container">
                            <div className="clue-box">
                                <h4 style={{ color: '#0077b6' }}>Horizontales</h4>
                                <ul className="clue-list">
                                    {horizontalClues.map(s => (
                                        <li key={s.id} className={`clue-item ${solvedWords.includes(s.id) ? 'solved' : ''} ${selectedClue?.id === s.id ? 'selected' : ''}`} onClick={() => setSelectedClue(s)}>
                                            <button className="check-btn" onClick={(e) => { e.stopPropagation(); checkWord(s); }}>H</button>
                                            <span style={{ marginLeft: '8px' }}>
                                                <span className="clue-number-badge">{gridTemplate.numbers.get(`${s.start[0]}-${s.start[1]}`)}.</span>
                                                {s.clue}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="clue-box">
                                <h4 style={{ color: '#0077b6' }}>Verticales</h4>
                                <ul className="clue-list">
                                    {verticalClues.map(s => (
                                        <li key={s.id} className={`clue-item ${solvedWords.includes(s.id) ? 'solved' : ''} ${selectedClue?.id === s.id ? 'selected' : ''}`} onClick={() => setSelectedClue(s)}>
                                            <button className="check-btn" onClick={(e) => { e.stopPropagation(); checkWord(s); }}>V</button>
                                            <span style={{ marginLeft: '8px' }}>
                                                <span className="clue-number-badge">{gridTemplate.numbers.get(`${s.start[0]}-${s.start[1]}`)}.</span>
                                                {s.clue}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="game-right-col">
                        <div className="stats-block">
                            <h3>Progreso</h3>
                            <div className="stats-item"><span>Nivel:</span> <strong>{difficulty}</strong></div>
                            <div className="stats-item"><span>Tiempo Límite:</span> <strong>{formatTime(timeLeft)}</strong></div>
                            <div className="stats-item"><span>Puntaje:</span> <strong>{score}</strong></div>
                            <div className="stats-item"><span>Palabras:</span> <strong>{solvedWords.length}/{activePuzzle.solutions.length}</strong></div>
                        </div>
                        <button className="btn-primary" onClick={() => finishGame()}>Finalizar Juego</button>
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
        <>
            <Style />
            <div className="acertijo-container">
                {view === 'home' && renderConfig()}
                {view === 'game' && renderGame()}
                {view === 'summary' && (
                    <Summary
                        config={{ difficulty, words: selectedWords, timeLimit: difficultySettings[difficulty].time }}
                        onBack={() => setView('home')}
                    />
                )}
            </div>
        </>
    );
}