import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    RotateCcw, Trophy, CheckCircle,
    Hash, Type, Divide,
    Play, Check, ArrowLeft, ArrowRight, Download,
    Monitor, Shapes, Grid, Clock, List, Layers, Puzzle,
    Calendar, Tag, FileText, Info, User
} from 'lucide-react';

const IconConfigure = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"></path>
    </svg>
);

// --- ESTILOS COMPARTIDOS ---
const Style = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
    
    :root {
      /* Colores actualizados para coincidir con Rompecabezas.jsx */
      --primary-color: #005f92; /* Azul actualizado para coincidir con Rompecabezas */
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
      
      /* Sudoku specific */
      --grid-border-strong: #005f92; /* Azul oscuro para bordes fuertes */
      --grid-border-light: #94a3b8;
      --cell-hover-bg: #f0f9ff;
    }

    body {
        background-color: #f0f2f5;
        margin: 0;
        font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    .sudoku-container {
      background: var(--light-text);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 2rem;
      width: 100%;
      max-width: 1100px; /* Aumentado el ancho máximo para acomodar el tablero más grande */
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

    /* --- AREA DE INFORMACIÓN / CATALOGO --- */
    .info-catalog {
        border: 1px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        padding: 1.5rem;
        flex-grow: 1;
        background: #fafafa;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .catalog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }

    .mode-preview {
        background: white;
        border: 1px solid var(--medium-gray-color);
        border-radius: 8px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        text-align: center;
    }
    
    .preview-badges {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .badge {
        background: #e0f2fe;
        color: var(--primary-color);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    /* --- FOOTER DE NAVEGACIÓN --- */
     .config-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 2rem;
        border-top: 1px solid var(--medium-gray-color);
        padding-top: 1.5rem;
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
        background-color: #005f92;
        color: white;
        border: 1px solid transparent;
    }
    .no-rounded-button:hover:not(:disabled) {
        background-color: #005f92;
        transform: translateY(-1px);
    }
    .no-rounded-button:disabled {
        background-color: var(--medium-gray-color);
        cursor: not-allowed;
        opacity: 0.7;
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
        grid-template-columns: 1fr 280px; /* Columna derecha un poco más ancha */
        gap: 3rem; /* Más espacio entre el tablero y los controles */
        width: 100%;
        align-items: start;
    }
    
    .game-left-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center; /* Centrado vertical y horizontal */
    }

    .game-right-col {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .stats-block {
        border: 1px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        padding: 1.5rem; /* Más padding interno */
        text-align: left;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
        background-color: #005f92;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: var(--border-radius);
        font-weight: 600;
        border: none;
        cursor: pointer;
        width: 100%;
        transition: background 0.2s;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
    }
    .btn-primary:hover {
        background-color: #005f92;
    }
    
    /* Botones de acción en juego */
    .game-actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    /* --- SUDOKU GRID STYLES MEJORADO --- */
    .sudoku-grid {
        border-collapse: collapse;
        border: 4px solid var(--grid-border-strong);
        margin: 0 auto;
        background: white;
        /* Sombra más pronunciada para resaltar el tablero */
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    .cell-container {
      border: 1px solid var(--grid-border-light);
      position: relative;
      padding: 0;
      width: 64px; /* AUMENTADO: de 52px a 64px */
      height: 64px; /* AUMENTADO: de 52px a 64px */
    }
    
    .cell-container:not(.readonly-cell):hover {
        background-color: var(--cell-hover-bg);
    }

    /* Reglas de Bordes Mejoradas */
    .sudoku-grid.size-9 tr:nth-child(3n) td { border-bottom: 3px solid var(--grid-border-strong) !important; }
    .sudoku-grid.size-9 tr:last-child td { border-bottom: 1px solid var(--grid-border-light) !important; } 
    .sudoku-grid.size-9 td:nth-child(3n) { border-right: 3px solid var(--grid-border-strong) !important; }
    .sudoku-grid.size-9 td:last-child { border-right: 1px solid var(--grid-border-light) !important; } 
    
    .sudoku-grid.size-6 tr:nth-child(2n) td { border-bottom: 3px solid var(--grid-border-strong) !important; }
    .sudoku-grid.size-6 tr:last-child td { border-bottom: 1px solid var(--grid-border-light) !important; }
    .sudoku-grid.size-6 td:nth-child(3n) { border-right: 3px solid var(--grid-border-strong) !important; }
    .sudoku-grid.size-6 td:last-child { border-right: 1px solid var(--grid-border-light) !important; }

    .cell {
        width: 100%;
        height: 100%;
        border: none;
        text-align: center;
        font-size: 2rem; /* AUMENTADO: de 1.6rem a 2rem para mejor visibilidad */
        font-weight: 600;
        color: var(--primary-color);
        background: transparent;
        outline: none;
        padding: 0;
        margin: 0;
        display: block;
        transition: all 0.2s;
    }

    .cell:focus {
        background-color: #fff;
        box-shadow: inset 0 0 0 3px rgba(0, 95, 146, 0.3);
    }
    
    .cell.readonly {
        font-weight: 800;
        color: var(--secondary-color);
        background-color: #f1f5f9;
        cursor: default;
    }

    @media (max-width: 1000px) {
        .game-layout { grid-template-columns: 1fr; gap: 2rem; }
        .game-left-col { order: 1; }
        .game-right-col { order: 2; width: 100%; max-width: 500px; margin: 0 auto; }
        .cell-container { width: 45px; height: 45px; } /* Ajuste responsivo */
        .cell { font-size: 1.4rem; }
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
        display: flex; align-items: center; gap: 0.5rem; 
        color: #64748b; font-size: 0.9rem; font-weight: 600; 
        text-transform: uppercase; letter-spacing: 0.05em; width: 100%;
    }
    .info-card-value { 
        font-size: 1.1rem; color: #334155; font-weight: 500; text-align: center; width: 100%;
    }
    .full-width { grid-column: 1 / -1; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
`;

// --- LÓGICA DE SUDOKU ---
const getSudokuSymbols = (size, type) => {
    switch (type) {
        case 'letters': return Array.from({ length: size }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
        case 'fractions': return Array.from({ length: size }, (_, i) => `${i + 1}/${size}`);
        case 'numbers': default: return Array.from({ length: size }, (_, i) => i + 1);
    }
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const generateValidSudoku = (size, contentType) => {
    const grid = Array(size).fill(null).map(() => Array(size).fill(0));
    const symbols = getSudokuSymbols(size, contentType);

    const isSafe = (row, col, symbol) => {
        // Validar fila y columna
        for (let x = 0; x < size; x++) {
            if (grid[row][x] === symbol || grid[x][col] === symbol) return false;
        }

        // Validar subcuadrícula
        let subGridHeight, subGridWidth;
        if (size === 9) {
            [subGridHeight, subGridWidth] = [3, 3];
        } else if (size === 6) {
            [subGridHeight, subGridWidth] = [2, 3];
        } else if (size === 3) {
            // CORRECCIÓN: Para 3x3, la subcuadrícula es toda la grid, 
            // así que solo validamos filas y columnas
            return true;
        } else {
            return true;
        }

        const startRow = row - (row % subGridHeight);
        const startCol = col - (col % subGridWidth);
        for (let i = 0; i < subGridHeight; i++) {
            for (let j = 0; j < subGridWidth; j++) {
                if (grid[i + startRow][j + startCol] === symbol) return false;
            }
        }
        return true;
    };

    function solve() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === 0) {
                    for (const symbol of shuffleArray([...symbols])) {
                        if (isSafe(i, j, symbol)) {
                            grid[i][j] = symbol;
                            if (solve()) return true;
                            grid[i][j] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    solve();
    return grid;
};

const createPuzzle = (solution, size) => {
    const puzzle = solution.map(row => [...row]);
    const removalPercentage = { 3: 0.5, 6: 0.45, 9: 0.55 };
    const cellsToRemove = Math.floor(size * size * (removalPercentage[size] || 0.5));
    let removed = 0;
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        if (puzzle[row][col] !== null) {
            puzzle[row][col] = null;
            removed++;
        }
    }
    return puzzle;
};

// --- GENERADOR HTML (SUDOKU.HTML) ---
const generateGameCode = (config, gameDetails, selectedPlatforms) => {

    const rawDate = (() => {
        try {
            const stored = typeof localStorage !== 'undefined'
                ? localStorage.getItem('sudoku:creation_date')
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

    const titleText = 'Juego de Sudoku'; // Título Fijo

    // Animated Title
    const animatedTitleHTML = `
    <div class="game-title">
        ${'Juego de Sudoku'.split('').map((char, index) =>
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

    // IMPORTANT: Injecting logic into HTML
    const gameLogicScript = `
        const config = ${JSON.stringify(config)};
        let solution = [];
        let initialGrid = [];
        let playerGrid = [];
        let time = 0;
        let timerInterval;
        let totalEmpty = 0;

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function getSudokuSymbols(size, type) {
            switch (type) {
                case 'letters': return Array.from({ length: size }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
                case 'fractions': return Array.from({ length: size }, (_, i) => (i + 1) + '/' + size);
                case 'numbers': default: return Array.from({ length: size }, (_, i) => i + 1);
            }
        }

        function generateValidSudoku(size, contentType) {
            const grid = Array(size).fill(null).map(() => Array(size).fill(0));
            const symbols = getSudokuSymbols(size, contentType);
            
            const isSafe = (row, col, symbol) => {
    // Validar fila y columna
    for (let x = 0; x < size; x++) {
        if (grid[row][x] === symbol || grid[x][col] === symbol) return false;
    }
    
    // Validar subcuadrícula
    let subGridHeight, subGridWidth;
    if (size === 9) { 
        [subGridHeight, subGridWidth] = [3, 3]; 
    } else if (size === 6) { 
        [subGridHeight, subGridWidth] = [2, 3]; 
    } else if (size === 3) { 
        // Para 3x3, solo validamos filas y columnas
        return true; 
    } else { 
        return true; 
    }

    const startRow = row - (row % subGridHeight);
    const startCol = col - (col % subGridWidth);
    for (let i = 0; i < subGridHeight; i++) {
        for (let j = 0; j < subGridWidth; j++) {
            if (grid[i + startRow][j + startCol] === symbol) return false;
        }
    }
    return true;
};

            function solve() {
                for (let i = 0; i < size; i++) {
                    for (let j = 0; j < size; j++) {
                        if (grid[i][j] === 0) {
                            for (const symbol of shuffleArray([...symbols])) {
                                if (isSafe(i, j, symbol)) {
                                    grid[i][j] = symbol;
                                    if (solve()) return true;
                                    grid[i][j] = 0;
                                }
                            }
                            return false;
                        }
                    }
                }
                return true;
            }
            solve();
            return grid;
        }

        function createPuzzle(sol, size) {
            const puzzle = sol.map(row => [...row]);
            const removalPercentage = { 3: 0.5, 6: 0.45, 9: 0.55 };
            const cellsToRemove = Math.floor(size * size * (removalPercentage[size] || 0.5));
            let removed = 0;
            while (removed < cellsToRemove) {
                const row = Math.floor(Math.random() * size);
                const col = Math.floor(Math.random() * size);
                if (puzzle[row][col] !== null) {
                    puzzle[row][col] = null;
                    removed++;
                }
            }
            return puzzle;
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const countDisplay = document.getElementById('countdown-display');
            countDisplay.innerText = count;
            const countInterval = setInterval(() => {
                count--;
                if(count > 0) {
                    countDisplay.innerText = count;
                    countDisplay.style.animation = 'none';
                    countDisplay.offsetHeight; 
                    countDisplay.style.animation = 'popIn 0.5s ease-out';
                } else {
                    clearInterval(countInterval);
                    document.getElementById('countdown-screen').classList.add('hidden');
                    initGame();
                }
            }, 1000);
        }

        function initGame() {
            document.getElementById('game-ui').style.display = 'block';
            solution = generateValidSudoku(config.size, config.contentType);
            const puzzle = createPuzzle(solution, config.size);
            initialGrid = puzzle;
            playerGrid = puzzle.map(row => [...row]);
            
            // Calculate Total Empty
            totalEmpty = 0;
            initialGrid.forEach(row => row.forEach(cell => { if(cell === null) totalEmpty++; }));
            
            time = 0;
            updateStats();
            renderGrid();
            
            clearInterval(timerInterval);
const timeLimits = { 3: 300, 6: 600, 9: 900 };
const maxTime = timeLimits[config.size];

timerInterval = setInterval(() => {
    time++;
    if (time >= maxTime) {
        clearInterval(timerInterval);
        Swal.fire({
            title: '¡Tiempo Agotado!',
            text: 'Se acabó el tiempo para este nivel.',
            icon: 'warning',
            confirmButtonText: 'Reintentar',
            confirmButtonColor: '#005f92'
        }).then(() => initGame());
        return;
    }
    
    // Calcular tiempo restante
    const remaining = maxTime - time;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    
    // Cambiar color según tiempo restante
    const timerElement = document.getElementById('timer');
    timerElement.innerText = mins + ':' + String(secs).padStart(2, '0');
    
    if (remaining <= 60) {
        timerElement.style.color = '#ef4444'; // Rojo último minuto
    } else if (remaining <= 120) {
        timerElement.style.color = '#f59e0b'; // Naranja últimos 2 minutos
    } else {
        timerElement.style.color = '#111827'; // Color normal
    }
}, 1000);
        }

        function updateStats() {
            // Count current filled empty spots
            let filled = 0;
            for(let i=0; i<config.size; i++) {
                for(let j=0; j<config.size; j++) {
                    if (initialGrid[i][j] === null && playerGrid[i][j] !== null) {
                        filled++;
                    }
                }
            }
            document.getElementById('challenges').innerText = filled + '/' + totalEmpty;
            document.getElementById('score').innerText = '0';
        }
      function renderGrid() {
    const table = document.getElementById('sudoku-board');
    table.className = 'sudoku-grid size-' + config.size;
    table.innerHTML = '';
    
    for(let i=0; i<config.size; i++) {
        const tr = document.createElement('tr');
        for(let j=0; j<config.size; j++) {
            const td = document.createElement('td');
            td.className = 'cell-container';
            if(initialGrid[i][j] !== null) td.classList.add('readonly-cell');
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'cell';
            // CORREGIDO: Usar la variable config que está definida al inicio del script
            input.setAttribute('maxLength', config.contentType === 'fractions' ? '3' : '1');
            
            if(initialGrid[i][j] !== null) {
                input.value = initialGrid[i][j];
                input.readOnly = true;
                input.classList.add('readonly');
            } else {
                if(playerGrid[i][j] !== null) input.value = playerGrid[i][j];
                input.oninput = (e) => handleInput(i, j, e.target.value, e.target);
            }
            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}
    function handleInput(row, col, value, inputElem) {
    let processed = value;
    
    if (config.contentType === 'numbers') {
        if (!/^[1-9]$/.test(value)) {
            processed = '';
        } else {
            const num = parseInt(value);
            if (num < 1 || num > config.size) {
                processed = '';
            } else {
                processed = num;
            }
        }
    } else if (config.contentType === 'letters') {
        if (!/^[A-Z]$/i.test(value)) {
            processed = '';
        } else {
            const upper = value.toUpperCase();
            const maxLetter = String.fromCharCode('A'.charCodeAt(0) + config.size - 1);
            if (upper > maxLetter) {
                processed = '';
            } else {
                processed = upper;
            }
        }
    } else if (config.contentType === 'fractions') {
        if (value === '') {
            processed = '';
        } else {
            // CORREGIDO: Construir el patrón correctamente
            const pattern = '^[1-' + config.size + '](\\/[1-' + config.size + ']?)?$';
            const fractionPattern = new RegExp(pattern);
            if (!fractionPattern.test(value)) {
                inputElem.value = playerGrid[row][col] || '';
                return;
            }
            if (value.includes('/')) {
                const parts = value.split('/');
                if (parts.length === 2 && parts[1] && parts[1] !== config.size.toString()) {
                    inputElem.value = playerGrid[row][col] || '';
                    return;
                }
            }
            processed = value;
        }
    }
    
    if (processed === '') {
        playerGrid[row][col] = null;
        inputElem.value = '';
    } else {
        playerGrid[row][col] = config.contentType === 'numbers' ? parseInt(processed) : processed;
        inputElem.value = processed;
    }
    updateStats();
}

        function checkSolution() {
            let isComplete = true;
            let isCorrect = true;
            let correctCount = 0;
            
            for(let i=0; i<config.size; i++) {
                for(let j=0; j<config.size; j++) {
                    if(playerGrid[i][j] === null) isComplete = false;
                    else if(String(playerGrid[i][j]) !== String(solution[i][j])) isCorrect = false;
                    
                    // Count correct for scoring (only for initially empty cells)
                    if (initialGrid[i][j] === null && playerGrid[i][j] !== null && String(playerGrid[i][j]) === String(solution[i][j])) {
                        correctCount++;
                    }
                }
            }
            
            const score = correctCount * 10;
            
            if(!isComplete) {
                Swal.fire({ title: 'Juego en curso', text: 'Completa todas las celdas.', icon: 'info' });
                return;
            }
            if(!isCorrect) {
                Swal.fire({ title: 'Error', text: 'Hay errores en la solución. Intenta de nuevo.', icon: 'error' });
                return;
            }
            
            showFinishModal(score, true);
        }

        function finishGameManual() {
            let correctCount = 0;
             for(let i=0; i<config.size; i++) {
                for(let j=0; j<config.size; j++) {
                    if (initialGrid[i][j] === null && playerGrid[i][j] !== null && String(playerGrid[i][j]) === String(solution[i][j])) {
                        correctCount++;
                    }
                }
            }
            const score = correctCount * 10;
            showFinishModal(score, false);
        }

        function showFinishModal(score, isSuccess) {
            clearInterval(timerInterval);
            
             Swal.fire({
                title: isSuccess ? '¡Juego Completado!' : '¡Juego Finalizado!',
                html: '<p>Puntos Obtenidos: <strong>' + score + '</strong></p>',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Volver a Jugar',
                cancelButtonText: 'Salir',
                confirmButtonColor: '#005f92', // Color Primario de Rompecabezas
                cancelButtonColor: '#4b5563', // Gris oscuro
                reverseButtons: true,
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    initGame(); // Reiniciar
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    document.getElementById('game-ui').style.display = 'none';
                    document.getElementById('end-screen').classList.remove('hidden');
                    document.getElementById('final-score').innerText = score;
                }
            });
        }

        function exitGame() { window.close(); Swal.fire('Cierra la pestaña manualmente.'); }
        function toggleInfo(show) {
            const el = document.getElementById('info-overlay');
            el.classList.toggle('hidden', !show);
            el.style.display = show ? 'flex' : 'none';
        }
    `;

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleText}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root { 
            --primary-color: #005f92; /* Sincronizado con Rompecabezas */
            --secondary-color: #1f2937; 
            --light-gray: #f3f4f6;
            --medium-gray: #d1d5db; 
            --dark-gray: #4b5563; 
            --correct: #22c55e; 
            --wrong: #ef4444;
            --light-text: #ffffff; 
            --dark-text: #111827;
            --grid-border-strong: #005f92; /* También actualizado */
            --grid-border-light: #94a3b8;
            --cell-hover-bg: #f0f9ff;
        }
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; display: flex; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 1000px; display: flex; flex-direction: column; }
        
        .game-layout { display: grid; grid-template-columns: 1fr 280px; gap: 3rem; width: 100%; }
        
        /* AÑADIDO: Centrado de la columna izquierda para la cuadrícula */
        .game-left-col { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
        }

        .sudoku-grid { 
            border-collapse: collapse; 
            border: 4px solid var(--grid-border-strong); 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .cell-container { border: 1px solid var(--grid-border-light); width: 64px; height: 64px; padding: 0; position: relative; }
        .cell { width: 100%; height: 100%; border: none; text-align: center; font-size: 2rem; font-weight: 600; color: var(--primary-color); outline: none; background: transparent; padding: 0; margin: 0; transition: all 0.2s; }
        .cell:focus { background-color: #fff; box-shadow: inset 0 0 0 3px rgba(0, 95, 146, 0.3); }
        .cell.readonly { font-weight: 800; color: var(--secondary-color); background-color: #f1f5f9; cursor: default; }
        .readonly-cell { background-color: #f1f5f9; }
        
        /* Grid Lines */
        .sudoku-grid.size-9 tr:nth-child(3n) td { border-bottom: 3px solid var(--grid-border-strong) !important; }
        .sudoku-grid.size-9 tr:last-child td { border-bottom: 1px solid var(--grid-border-light) !important; }
        .sudoku-grid.size-9 td:nth-child(3n) { border-right: 3px solid var(--grid-border-strong) !important; }
        .sudoku-grid.size-9 td:last-child { border-right: 1px solid var(--grid-border-light) !important; }
        .sudoku-grid.size-6 tr:nth-child(2n) td { border-bottom: 3px solid var(--grid-border-strong) !important; }
        .sudoku-grid.size-6 tr:last-child td { border-bottom: 1px solid var(--grid-border-light) !important; }
        .sudoku-grid.size-6 td:nth-child(3n) { border-right: 3px solid var(--grid-border-strong) !important; }
        .sudoku-grid.size-6 td:last-child { border-right: 1px solid var(--grid-border-light) !important; }

        .stats-block { border: 1px solid var(--medium-gray); padding: 1.5rem; border-radius: 0.5rem; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); }
        .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }
        
        .btn-primary { background-color: var(--primary-color); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.5rem; transition: background 0.2s; white-space: nowrap; }
        .btn-primary:hover { background-color: #004a73; }

        .game-actions { display: flex; flex-direction: column; gap: 1rem; }

        /* Overlays */
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; transition: opacity 0.3s; padding: 20px; box-sizing: border-box; }
        .hidden { display: none !important; opacity: 0; pointer-events: none; }
        
        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); color: white; border: none; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; min-width: 200px; transition: transform 0.2s; }
        .big-btn:hover { transform: scale(1.05); }
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }
        .btn-exit { background: #1f2937; }
        
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        
        .game-title { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        .game-title.static span { animation: none; transform: none; }
        @keyframes wave-animation { 0%, 40%, 100% { transform: translateY(0); } 20% { transform: translateY(-20px); } }

        /* Responsive */
        @media (max-width: 1000px) { 
            .game-layout { grid-template-columns: 1fr; gap: 2rem; }
            .game-left-col { order: 1; }
            .game-right-col { order: 2; width: 100%; max-width: 500px; margin: 0 auto; }
            .cell-container { width: 45px; height: 45px; } 
            .cell { font-size: 1.4rem; }
        }

        /* Info Modal */
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
    </style>
</head>
<body>
    <div id="start-screen" class="overlay">
    <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">Sudoku</h2>

        <div style="background: #e0f2fe; color: #005f92; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 1rem; display: inline-block;">
    Nivel: ${config.level} 
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
                <h2 class="info-title">Sudoku</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
            </div>
            <div class="info-details-grid">
                <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${gameDetails.authorName || 'No especificado'}</span></div>

                <div class="info-item">
                    <span class="info-label">Versión</span>
                    <span class="info-value">${gameDetails.version || '1.0.0'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha</span>
                    <span class="info-value">${formattedDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Plataformas</span>
                    <span class="info-value">${platformsString}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Configuración</span>
                    <span class="info-value">${config.level} / ${config.contentType}</span>
                </div>
                <div class="info-item">
    <span class="info-label">Tiempo Límite</span>
    <span class="info-value">${config.size === 3 ? '5 minutos' : config.size === 6 ? '10 minutos' : '15 minutos'}</span>
</div>
                <div class="info-item info-desc">
                    <span class="info-label">Descripción</span>
                    <p class="info-value" style="font-size:1rem; color:#475569;">${gameDetails.description || 'Sin descripción disponible.'}</p>
                </div>
            </div>
             <div style="text-align: center; margin-top: 1.5rem;">
                <button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem;" onclick="toggleInfo(false)">Cerrar</button>
            </div>
        </div>
    </div>

    <div id="end-screen" class="overlay hidden">
        <h1 style="color:var(--primary-color); font-size:3rem; font-weight: 800;">¡Juego Finalizado!</h1>
        <h2 style="color:var(--secondary-color); font-size:2rem; margin:1rem 0;">Puntos Obtenidos: <span id="final-score">0</span></h2>
        <div class="end-buttons">
             <button class="big-btn btn-exit" onclick="exitGame()">Salir</button>
             <button class="big-btn" onclick="location.reload()">Volver a Jugar</button>
        </div>
    </div>

    <div class="container" id="game-ui" style="display:none;">
        ${animatedTitleHTML}
        
         <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
    <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
    <span style="font-size:1rem; color:#1e40af; font-weight:500;">Completa los espacios de la cuadrícula sin repetir números en cada fila y columna.</span>
</div>

        <div class="game-layout">
            <div class="game-left-col">
                <table id="sudoku-board" class="sudoku-grid"></table>
            </div>
            <div class="game-right-col">
                <div class="stats-block">
                    <h3>Progreso</h3>
                    <div class="stats-item"><span>Tiempo:</span> <strong id="timer">0 min 00 seg</strong></div>
                    <div class="stats-item"><span>Puntaje:</span> <strong id="score">0</strong></div>
                    <div class="stats-item"><span>Desafíos:</span> <strong id="challenges">0/0</strong></div>
                </div>
                <div class="game-actions">
                     <button class="btn-primary" onclick="checkSolution()">
                        <i data-lucide="check"></i> Verificar Solución
                     </button>
                     <button class="btn-primary" onclick="finishGameManual()">
                        Finalizar Juego
                     </button>
                 </div>
            </div>
        </div>
    </div>

    <script>
        ${gameLogicScript}
        lucide.createIcons();
    </script>
</body>
</html>`;
};
// --- ANDROID: GENERACIÓN DE APPLICATION ID ÚNICO ---
const SUDOKU_APPLICATION_ID_BASE = "io.sudoku.steam";

const createSudokuUuidSegment = () => {
    const rawUuid = window.crypto?.randomUUID?.()
        || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    return `uuid_${uuid}`;
};

const buildSudokuApplicationId = () => {
    return `${SUDOKU_APPLICATION_ID_BASE}.${createSudokuUuidSegment()}`;
};

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
// --- COMPONENTE SUMMARY (Adaptado para Sudoku) ---
const Summary = ({ config, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const [jsZipReady, setJsZipReady] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;

    const MOCK_DATA = {
        selectedAreas: ['math', 'logic'],
        selectedSkills: ['Resolución de problemas', 'Pensamiento Lógico'],
        gameDetails: {
            gameName: "Juego de Sudoku",
            description: "Juego de lógica matemática para desarrollar el pensamiento crítico.",
            version: "1.0.0",
            date: null
        },
        selectedPlatforms: ['web']
    };

    // Siempre fecha actual del sistema — igual que CalculadoraMental
    const getFixedCreationDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
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
            setStatusText("Finalizando HTML...");
            const htmlContent = generateGameCode(config, gameDetails, selectedPlatforms);

            const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'sudoku')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            zip.file(htmlFileName, htmlContent);
            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'sudoku')}_web.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setProgress(100);
            setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error("Error:", error);
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
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando configuración...");
                setProgress(currentProgress);
            }
        }, 150);
    };

    const generateAndDownloadAndroidZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        try {
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/sudoku_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Procesando archivos ZIP...");
            const zipOriginal = await window.JSZip.loadAsync(arrayBuffer);

            // ── Detectar prefijo real de rutas dentro del ZIP ────────────────
            // En producción el ZIP puede tener "android/app/..." o directamente "app/..."
            const allPaths = [];
            zipOriginal.forEach((relativePath) => allPaths.push(relativePath));
            const hasAndroidPrefix = allPaths.some(p => p.startsWith('android/'));
            const prefix = hasAndroidPrefix ? 'android/' : '';

            setStatusText("Inyectando configuración...");

            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];

            const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
            const nivelKey = nivelMap[config.level] || config.level?.toLowerCase() || 'basico';

            const tipoMap = { numbers: 'numeros', letters: 'letras', fractions: 'fracciones' };
            const tipoContenido = tipoMap[config.contentType] || config.contentType || 'numeros';

            const appName = details.gameName || 'sudoku';
            const applicationId = buildSudokuApplicationId();

            const fullConfig = {
                nivel: nivelKey,
                tamano: config.size,
                tipoContenido: tipoContenido,
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                fecha: details.date
                    ? details.date.split('T')[0]
                    : new Date().toISOString().split('T')[0],
                descripcion: details.description || '',
                nombreApp: appName,
                plataformas: selectedPlats
            };

            // ── 1. Inyectar config JSON con prefijo dinámico ─────────────────
            zipOriginal.file(
                `${prefix}app/src/main/assets/public/config/sudoku-config.json`,
                JSON.stringify(fullConfig, null, 2)
            );

            // ── 2. Parchear strings.xml — buscar ruta real en el ZIP ─────────
            const stringsKey = allPaths.find(p => p.includes('res/values/strings.xml'));
            if (stringsKey) {
                let stringsContent = await zipOriginal.file(stringsKey).async("string");
                stringsContent = stringsContent.replace(
                    /<string name="app_name">.*?<\/string>/,
                    `<string name="app_name">${appName}</string>`
                );
                zipOriginal.file(stringsKey, stringsContent);
            }

            // ── 3. Parchear build.gradle — buscar ruta real en el ZIP ────────
            const buildGradleKey = allPaths.find(p =>
                p.endsWith('app/build.gradle') || p.endsWith('app\\build.gradle')
            );
            if (buildGradleKey) {
                let gradleContent = await zipOriginal.file(buildGradleKey).async("string");
                gradleContent = gradleContent.replace(
                    /applicationId\s+"[^"]+"/,
                    `applicationId "${applicationId}"`
                );
                zipOriginal.file(buildGradleKey, gradleContent);
            }

            // ── 4. Parchear capacitor.settings.gradle ────────────────────────
            const capSettingsKey = allPaths.find(p => p.includes('capacitor.settings.gradle'));
            if (capSettingsKey) {
                let capContent = await zipOriginal.file(capSettingsKey).async("string");
                capContent = capContent.replace(
                    /BUNDLE_ID\s*=\s*"[^"]+"/,
                    `BUNDLE_ID = "${applicationId}"`
                );
                zipOriginal.file(capSettingsKey, capContent);
            }
            // ── 5. Parchear capacitor.config.json ────────────────────────────
            const capConfigKey = allPaths.find(p => p.includes('capacitor.config.json'));
            if (capConfigKey) {
                try {
                    const capConfigContent = await zipOriginal.file(capConfigKey).async("string");
                    const capConfig = JSON.parse(capConfigContent);
                    zipOriginal.file(capConfigKey, JSON.stringify({ ...capConfig, appId: applicationId }, null, 2));
                } catch { /* si no es JSON válido, omitir */ }
            }


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
            link.download = `${normalizeFileName(details?.gameName || 'sudoku')}_${platformsSuffix}.zip`;
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

            const htmlFileNameCombined = `${normalizeFileName(gameDetails?.gameName || 'sudoku')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            webZip.file(htmlFileNameCombined, htmlContent);
            const webBlob = await webZip.generateAsync({ type: "blob" });
            outerZip.file(`${normalizeFileName(gameDetails?.gameName || 'sudoku')}_web.zip`, webBlob);

            // ── Generar ZIP Android ──
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/sudoku_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Inyectando configuración Android...");
            const zipOriginal = await window.JSZip.loadAsync(arrayBuffer);

            const allPaths = [];
            zipOriginal.forEach((relativePath) => allPaths.push(relativePath));
            const hasAndroidPrefix = allPaths.some(p => p.startsWith('android/'));
            const prefix = hasAndroidPrefix ? 'android/' : '';

            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];
            const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
            const nivelKey = nivelMap[config.level] || config.level?.toLowerCase() || 'basico';
            const tipoMap = { numbers: 'numeros', letters: 'letras', fractions: 'fracciones' };
            const tipoContenido = tipoMap[config.contentType] || config.contentType || 'numeros';
            const appName = details.gameName || 'sudoku';
            const applicationId = buildSudokuApplicationId();

            const fullConfig = {
                nivel: nivelKey,
                tamano: config.size,
                tipoContenido: tipoContenido,
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                fecha: details.date ? details.date.split('T')[0] : new Date().toISOString().split('T')[0],
                descripcion: details.description || '',
                nombreApp: appName,
                plataformas: selectedPlats
            };

            // 1. Config JSON
            zipOriginal.file(
                `${prefix}app/src/main/assets/public/config/sudoku-config.json`,
                JSON.stringify(fullConfig, null, 2)
            );

            // 2. strings.xml
            const stringsKey = allPaths.find(p => p.includes('res/values/strings.xml'));
            if (stringsKey) {
                let stringsContent = await zipOriginal.file(stringsKey).async("string");
                stringsContent = stringsContent.replace(
                    /<string name="app_name">.*?<\/string>/,
                    `<string name="app_name">${appName}</string>`
                );
                zipOriginal.file(stringsKey, stringsContent);
            }

            // 3. build.gradle
            const buildGradleKey = allPaths.find(p =>
                p.endsWith('app/build.gradle') || p.endsWith('app\\build.gradle')
            );
            if (buildGradleKey) {
                let gradleContent = await zipOriginal.file(buildGradleKey).async("string");
                gradleContent = gradleContent.replace(
                    /applicationId\s+"[^"]+"/,
                    `applicationId "${applicationId}"`
                );
                zipOriginal.file(buildGradleKey, gradleContent);
            }

            // 4. capacitor.settings.gradle
            const capSettingsKey = allPaths.find(p => p.includes('capacitor.settings.gradle'));
            if (capSettingsKey) {
                let capContent = await zipOriginal.file(capSettingsKey).async("string");
                capContent = capContent.replace(
                    /BUNDLE_ID\s*=\s*"[^"]+"/,
                    `BUNDLE_ID = "${applicationId}"`
                );
                zipOriginal.file(capSettingsKey, capContent);
            }

            // ── 5. Parchear capacitor.config.json ────────────────────────────
            const capConfigKeyComb = allPaths.find(p => p.includes('capacitor.config.json'));
            if (capConfigKeyComb) {
                try {
                    const capConfigContent = await zipOriginal.file(capConfigKeyComb).async("string");
                    const capConfig = JSON.parse(capConfigContent);
                    zipOriginal.file(capConfigKeyComb, JSON.stringify({ ...capConfig, appId: applicationId }, null, 2));
                } catch { /* si no es JSON válido, omitir */ }
            }


            const androidBlob = await zipOriginal.generateAsync({ type: "blob", platform: "UNIX" });
            const mobilePlatforms = (selectedPlatforms ?? [])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            outerZip.file(`${normalizeFileName(details?.gameName || 'sudoku')}_${mobilePlatforms}.zip`, androidBlob);

            // ── ZIP contenedor final ──
            setStatusText("Empaquetando todo...");
            const finalBlob = await outerZip.generateAsync({ type: "blob" });
            const platformsLabel = (selectedPlatforms ?? [])
                .map(p => platformLabel(p))
                .join('_');
            const url = window.URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'sudoku')}_${platformsLabel}.zip`;
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
        const areas = { science: 'Ciencia', technology: 'Tecnología', engineering: 'Ingeniería', arts: 'Arte', math: 'Matemáticas', logic: 'Lógica' };
        return areas[areaId] || areaId;
    };
    const getAreaIcon = (areaId) => {
        const icons = {
            science: '/images/areas/Ciencia.png', technology: '/images/areas/Tecnologia.png',
            engineering: '/images/areas/Ingenieria.png', arts: '/images/areas/Artes.png',
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
                    <div className="info-card"><div className="info-card-header"><Tag size={16} /> Nombre</div><div className="info-card-value">{gameDetails.gameName || 'Juego de Sudoku'}</div></div>
                    <div className="info-card"><div className="info-card-header"><User size={16} /> Autor</div><div className="info-card-value">{gameDetails.authorName || gameDetails.author || 'No especificado'}</div></div>
                    <div className="info-card"><div className="info-card-header"><Layers size={16} /> Versión</div><div className="info-card-value">{gameDetails.version || '1.0.0'}</div></div>
                    <div className="info-card full-width"><div className="info-card-header"><FileText size={16} /> Descripción</div><div className="info-card-value">{gameDetails.description || 'Juego de lógica.'}</div></div>
                    <div className="info-card"><div className="info-card-header"><Calendar size={16} /> Fecha</div><div className="info-card-value">{formatDate(gameDetails.date)}</div></div>
                    <div className="info-card"><div className="info-card-header"><Monitor size={16} /> Plataformas</div><div className="info-card-value">{selectedPlatforms?.length > 0 ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ') : 'Web'}</div></div>
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
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#0077b6' }}>Parámetros del Juego</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', rowGap: '1rem', alignItems: 'center' }}>
                    <div className="summary-row"><span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Tag size={18} /> Dificultad:</span><strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.level}</strong></div>
                    <div className="summary-row"><span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Grid size={18} /> Cuadrícula:</span><strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.size}x{config.size}</strong></div>
                    <div className="summary-row"><span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Type size={18} /> Contenido:</span><strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.contentType === 'numbers' ? 'Números' : config.contentType === 'letters' ? 'Letras' : 'Fracciones'}</strong></div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}>
                            <Clock size={18} /> Tiempo Límite:
                        </span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>
                            {config.size === 3 ? '5 minutos' : config.size === 6 ? '10 minutos' : '15 minutos'}
                        </strong>
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

// --- COMPONENTE PRINCIPAL (SUDOKU GAME) ---
const SudokuGame = () => {
    const [view, setView] = useState('home');
    const [levelStr, setLevelStr] = useState(''); // Inicio vacío para validación
    const [contentType, setContentType] = useState(''); // Inicio vacío para validación

    const [initialGrid, setInitialGrid] = useState([]);
    const [playerGrid, setPlayerGrid] = useState([]);
    const [solution, setSolution] = useState([]);
    const [time, setTime] = useState(0);
    const [emptyCount, setEmptyCount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    // Map level string to size
    const getLevelSize = (l) => {
        if (l === 'Básico') return 3;
        if (l === 'Intermedio') return 6;
        if (l === 'Avanzado') return 9;
        return 9; // Default fallback
    };

    const size = levelStr ? getLevelSize(levelStr) : 0;
    // Limpiar contentType si se selecciona Avanzado y está en fracciones
    useEffect(() => {
        if (levelStr === 'Avanzado' && contentType === 'fractions') {
            setContentType('');
        }
    }, [levelStr, contentType]);

    useEffect(() => {
        let timer;
        if (view === 'game') {
            // Límites de tiempo por nivel (en segundos)
            const timeLimits = { 3: 300, 6: 600, 9: 900 }; // 5min, 10min, 15min
            const maxTime = timeLimits[size];

            timer = setInterval(() => {
                setTime(prev => {
                    const newTime = prev + 1;
                    if (newTime >= maxTime) {
                        clearInterval(timer);
                        window.Swal?.fire({
                            title: '¡Tiempo Agotado!',
                            text: 'Se acabó el tiempo para este nivel.',
                            icon: 'warning',
                            confirmButtonText: 'Reintentar',
                            confirmButtonColor: '#0077b6'
                        }).then(() => {
                            // Reiniciar el juego sin usar handleStartGame
                            const newSolution = generateValidSudoku(size, contentType);
                            const newPuzzle = createPuzzle(newSolution, size);
                            setSolution(newSolution);
                            setInitialGrid(newPuzzle);
                            setPlayerGrid(newPuzzle.map(row => [...row]));

                            let blanks = 0;
                            newPuzzle.forEach(r => r.forEach(c => { if (c === null) blanks++; }));
                            setEmptyCount(blanks);
                            setTime(0);
                        });
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [view, size, contentType]); // Cambiar dependencias

    const handleStartGame = useCallback(() => {
        const newSolution = generateValidSudoku(size, contentType);
        const newPuzzle = createPuzzle(newSolution, size);
        setSolution(newSolution);
        setInitialGrid(newPuzzle);
        setPlayerGrid(newPuzzle.map(row => [...row]));

        let blanks = 0;
        newPuzzle.forEach(r => r.forEach(c => { if (c === null) blanks++; }));
        setEmptyCount(blanks);

        setTime(0);
        setView('game');
    }, [size, contentType]);
    const handleCellChange = (r, c, val) => {
        const newGrid = playerGrid.map(row => [...row]);
        let processed = val === '' ? null : val;

        if (processed !== null) {
            if (contentType === 'numbers') {
                if (!/^[1-9]$/.test(processed)) return;
                processed = parseInt(processed);
                if (processed < 1 || processed > size) return;
            } else if (contentType === 'letters') {
                if (!/^[A-Z]$/i.test(processed)) return;
                processed = val.toUpperCase();
                const maxLetter = String.fromCharCode('A'.charCodeAt(0) + size - 1);
                if (processed > maxLetter) return;
            } else if (contentType === 'fractions') {
                if (val === '') {
                    processed = null;
                } else {
                    // CORREGIDO: Usar 'size' en lugar de 'config.size'
                    const pattern = '^[1-' + size + '](\\/[1-' + size + ']?)?$';
                    const fractionPattern = new RegExp(pattern);
                    if (!fractionPattern.test(processed)) return;

                    if (processed.includes('/')) {
                        const parts = processed.split('/');
                        if (parts.length === 2 && parts[1] && parts[1] !== size.toString()) {
                            return;
                        }
                    }
                }
            }
        }
        newGrid[r][c] = processed;
        setPlayerGrid(newGrid);
    };

    const calculateFilledCells = () => {
        let filled = 0;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (initialGrid[i][j] === null && playerGrid[i][j] !== null) {
                    filled++;
                }
            }
        }
        return filled;
    };

    // Calcula puntaje basado en celdas correctas que estaban vacías
    const calculateScore = () => {
        let correct = 0;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (initialGrid[i][j] === null && playerGrid[i][j] !== null && String(playerGrid[i][j]) === String(solution[i][j])) {
                    correct++;
                }
            }
        }
        return correct * 10;
    };

    const handleCheckSolution = () => {
        let isComplete = true, isCorrect = true;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (playerGrid[i][j] === null) isComplete = false;
                else if (String(playerGrid[i][j]) !== String(solution[i][j])) isCorrect = false;
            }
        }

        if (!isComplete) {
            window.Swal?.fire({ title: 'Juego en curso', text: 'Completa todas las celdas.', icon: 'info' });
            return;
        }
        if (!isCorrect) {
            window.Swal?.fire({ title: 'Error', text: 'Hay errores. Intenta de nuevo.', icon: 'error' });
            return;
        }

        const finalScore = calculateScore();
        showFinishModal(finalScore, true);
    };

    const handleFinishGame = () => {
        const currentScore = calculateScore();
        showFinishModal(currentScore, false);
    };

    const showFinishModal = (score, isSuccess) => {
        // Configuración idéntica a Rompecabezas.jsx
        window.Swal?.fire({
            title: isSuccess ? '¡Juego Completado!' : '¡Juego Finalizado!',
            html: `<p>Puntaje Obtenido: <strong>${score}</strong></p>`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Volver a Jugar',
            cancelButtonText: 'Salir',
            confirmButtonColor: '#0077b6', // Color primario (Rompecabezas Blue)
            cancelButtonColor: '#4b5563', // Gris oscuro
            reverseButtons: true,
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((res) => {
            if (res.isConfirmed) handleStartGame();
            else setView('home');
        });
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

    const renderGrid = () => (
        <table className={`sudoku-grid size-${size}`}>
            <tbody>
                {playerGrid.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, colIndex) => {
                            const isReadOnly = initialGrid[rowIndex]?.[colIndex] !== null;
                            return (
                                <td key={colIndex} className={`cell-container ${isReadOnly ? 'readonly-cell' : ''}`}>
                                    <input
                                        type="text"
                                        className={`cell ${isReadOnly ? 'readonly' : ''}`}
                                        value={cell === null ? '' : cell}
                                        readOnly={isReadOnly}
                                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                        maxLength={contentType === 'fractions' ? 3 : 1}  // CORREGIDO: Aumentar a 3 para formato "X/Y"
                                    />
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderConfigScreen = () => (
        <div className="config-screen">
            <div className="game-title">
                {'Juego de Sudoku'.split('').map((char, index) => (
                    <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </div>

            <div className="rules-text">
                <h2>Configura tu juego seleccionando el tipo de contenido</h2>
            </div>

            <div className="config-controls">
                <div className="control-group">
                    <label>Selecciona el nivel de dificultad:</label>
                    <select value={levelStr} onChange={(e) => setLevelStr(e.target.value)}>
                        <option value="" disabled>Seleccione una dificultad...</option>
                        <option value="Básico">Básico (3x3)</option>
                        <option value="Intermedio">Intermedio (6x6)</option>
                        <option value="Avanzado">Avanzado (9x9)</option>
                    </select>
                </div>
                <div className="control-group">
                    <label>Selecciona el tipo de contenido:</label>
                    <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                        <option value="" disabled>Seleccione el tipo de contenido...</option>
                        <option value="numbers">Números (1-9)</option>
                        <option value="letters">Letras (A-I)</option>
                        {levelStr !== 'Avanzado' && <option value="fractions">Fracciones</option>}
                    </select>
                </div>
            </div>

            {/* Solo mostramos la vista previa si se ha seleccionado algo, o un placeholder */}
            <div className="info-catalog">
                <div className="catalog-header">
                    <strong style={{ color: '#1f2937' }}>Descripción de la configuración</strong>
                    {levelStr && <span style={{ color: '#0077b6', fontWeight: 'bold' }}>{size}x{size}</span>}
                </div>
                <div className="mode-preview">
                    {levelStr && contentType ? (
                        <>
                            <div className="preview-badges">
                                <div className="badge"><Grid size={16} /> {levelStr}</div>
                                <div className="badge"><Type size={16} /> {contentType === 'numbers' ? 'Números' : contentType === 'letters' ? 'Letras' : 'Fracciones'}</div>
                                <div className="badge">
                                    <Clock size={16} />
                                    {size === 3 ? '5 min' : size === 6 ? '10 min' : '15 min'}
                                </div>
                            </div>
                            <p style={{ color: '#666', fontSize: '0.9rem', maxWidth: '400px' }}>
                                El modo <strong>{levelStr}</strong> genera una cuadrícula de <strong>{size}x{size}</strong>.
                                El objetivo es rellenar las celdas vacías con
                                {contentType === 'numbers' ? ' números del 1 al ' + size : contentType === 'letters' ? ' letras de la A a la ' + String.fromCharCode('A'.charCodeAt(0) + size - 1) : ' fracciones'}.
                            </p>
                        </>
                    ) : (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Selecciona un nivel y tipo de contenido para ver la descripción.</p>
                    )}
                </div>
            </div>

            <div className="config-footer">
                <button onClick={() => navigate(-1)} className="no-rounded-button">
                    <ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior
                </button>
                <button onClick={handleStartGame} className="no-rounded-button" disabled={!levelStr || !contentType}>
                    Siguiente <ArrowRight style={{ marginLeft: '0.5rem' }} />
                </button>
            </div>
        </div>
    );

    return (
        <>
            <Style />
            <div className="sudoku-container">
                {view === 'summary' && (
                    <Summary
                        config={{ level: levelStr, size, contentType }}
                        onBack={() => setView('home')}
                    />
                )}

                {view === 'game' && (
                    <div className="game-screen">
                        <div className="game-title">
                            {'Juego de Sudoku'.split('').map((char, index) => (
                                <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
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
                            <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>Completa los espacios de la cuadrícula sin repetir números en cada fila y columna.</span>
                        </div>
                        <div className="game-layout">
                            <div className="game-left-col">
                                {renderGrid()}
                            </div>
                            <div className="game-right-col">
                                <div className="stats-block">
                                    <h3>Progreso</h3>
                                    <p className="stats-item">Nivel: <strong>{levelStr}</strong></p>
                                    <div className="stats-item">
                                        <span>Tiempo Límite:</span>
                                        <strong style={{
                                            color: (() => {
                                                const timeLimits = { 3: 300, 6: 600, 9: 900 };
                                                const remaining = timeLimits[size] - time;
                                                if (remaining <= 60) return '#ef4444'; // Rojo último minuto
                                                if (remaining <= 120) return '#f59e0b'; // Naranja últimos 2 min
                                                return '#111827'; // Normal
                                            })()
                                        }}>
                                            {(() => {
                                                const timeLimits = { 3: 300, 6: 600, 9: 900 };
                                                const remaining = timeLimits[size] - time;
                                                const mins = Math.floor(remaining / 60);
                                                const secs = remaining % 60;
                                                return `${mins}:${secs.toString().padStart(2, '0')}`;
                                            })()}
                                        </strong>
                                    </div>
                                    <div className="stats-item"><span>Desafíos:</span> <strong>{calculateFilledCells()}/{emptyCount}</strong></div>
                                </div>
                                <div className="game-actions">
                                    <button className="btn-primary" onClick={handleCheckSolution}>
                                        <Check /> Validar Solución
                                    </button>
                                    <button className="btn-primary" onClick={handleFinishGame}>
                                        Finalizar Juego
                                    </button>
                                </div>
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
                )}

                {view === 'home' && renderConfigScreen()}
            </div>
        </>
    );
};

export default SudokuGame;