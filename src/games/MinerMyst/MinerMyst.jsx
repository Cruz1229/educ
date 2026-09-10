import { buildMissingMobileDownload } from '../../utils/missingMobileGames';
import { downloadGameArchive } from '../../utils/gameDownloadPackaging';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Timer, Trophy, Check, X, Play, Search, Star, Gem, ArrowLeft, ArrowRight, BookOpen, Layers,
    HelpCircle, CheckSquare, Download, Tag, Type, FileText, Calendar, Monitor, Shapes, Puzzle, CheckCircle
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

        .minerales-container {
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

        .catalog-screen {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            flex-grow: 1;
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

        .difficulty-select-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin: 1rem 0 3rem 0;
            border-bottom: 1px solid var(--medium-gray-color);
            padding-bottom: 2rem;
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

        .catalog-actions {
            display: flex;
            justify-content: space-between;
            margin-top: auto;
            padding-top: 1.5rem;
            border-top: 1px solid var(--medium-gray-color);
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
        .no-rounded-button.btn-success { background-color: var(--correct-color); color: white; }
        .no-rounded-button.btn-success:hover:not(:disabled) { background-color: #16a34a; }

        @keyframes floatImage {
            0%, 100% { transform: translateY(0px) scale(1); }
            50%       { transform: translateY(-6px) scale(1.03); }
        }
        @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(0,119,182,0.3); }
            50%       { box-shadow: 0 0 24px 6px rgba(0,119,182,0.35); }
        }
        @keyframes popJump {
            0% { transform: translateY(0) scale(1); }
            100% { transform: translateY(-15px) scale(1.2); }
        }
        @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .swal-confetti {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        .swal-confetti span {
            animation: popJump 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite alternate;
        }
        .swal-confetti span:nth-child(2) {
            animation-delay: 0.2s;
        }
        .swal-confetti span:nth-child(3) {
            animation-delay: 0.4s;
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
        }

        .clue-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #bae6fd;
            border-radius: var(--border-radius);
            padding: 2.5rem 2rem 2rem;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            position: relative;
            margin-top: 1rem;
        }

        .clue-icon {
            background: white;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            color: var(--primary-color);
            border: 3px solid #e0f2fe;
        }

        .mineral-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            width: 100%;
        }

        .mineral-card {
            background: white;
            border: 2px solid var(--medium-gray-color);
            border-radius: var(--border-radius);
            padding: 1.25rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .mineral-card.selected {
            border-color: var(--primary-color);
            background-color: #e0f2fe;
            box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.2);
            transform: scale(1.02);
        }

        .mineral-card:hover {
            border-color: var(--primary-color);
            transform: translateY(-2px);
        }

        .mineral-icon {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 -3px 6px rgba(0,0,0,0.15), 0 4px 6px rgba(0,0,0,0.1);
        }

        .mineral-name {
            font-weight: 700;
            color: var(--secondary-color);
            font-size: 1.1rem;
        }

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
            font-size: 1.2rem;
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
            animation: pulse-warn 1s infinite;
        }

        @keyframes pulse-warn {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .instructions-box {
            background: #e0f2fe;
            padding: 1rem;
            border-radius: 0.5rem;
            color: #0369a1;
            font-size: 0.95rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--primary-color);
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
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .info-card { background: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 0.5rem; }
        .info-card-header { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.95rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; width: 100%; }
        .info-card-value { font-size: 1.25rem; color: #334155; font-weight: 500; text-align: center; width: 100%; }
        .full-width { grid-column: 1 / -1; }
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
        .rules-text { text-align: center; color: #6b7280; margin-bottom: 2rem; font-size: 1.1rem; }
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
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .nav-footer {
            display: flex;
            justify-content: space-between;
            gap: 1.5rem;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--medium-gray-color);
            width: 100%;
        }

        @media (max-width: 900px) {
            .game-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
            .mineral-grid { grid-template-columns: repeat(2, 1fr); }
            .info-grid { grid-template-columns: 1fr; }
        }
    `}</style>
);

const DIFFICULTY_SETTINGS = {
    Básico: { timeLimit: 120, points: 10, clues: 5 },
    Avanzado: { timeLimit: 120, points: 20, clues: 10 }
};

const MINERALS_DATA = [
    { id: 'diamante', name: 'Diamante', properties: 'Dureza: 10, Brillo: Adamantino', clue: 'Es la sustancia natural más dura conocida. No conduce la electricidad pero tiene un brillo resplandeciente.', color: '#60a5fa', img: '/images/minerales/diamante.png' },
    { id: 'magnetita', name: 'Magnetita', properties: 'Dureza: 5.5-6.5, Magnetismo: Fuerte', clue: 'Este mineral oscuro actúa como un imán natural, atrayendo fuertemente objetos de hierro y otros metales.', color: '#374151', img: '/images/minerales/magnetita.png' },
    { id: 'oro', name: 'Oro', properties: 'Dureza: 2.5-3, Conductividad: Muy alta', clue: 'Metal precioso muy maleable, excelente conductor de electricidad y se distingue por su brillo amarillo.', color: '#fbbf24', img: '/images/minerales/oro.png' },
    { id: 'cuarzo', name: 'Cuarzo', properties: 'Dureza: 7, Brillo: Vítreo', clue: 'Mineral abundante con brillo similar al cristal. Es lo suficientemente duro como para rayar el vidrio.', color: '#c084fc', img: '/images/minerales/cuarzo.png' },
    { id: 'grafito', name: 'Grafito', properties: 'Dureza: 1-2, Conductividad: Alta', clue: 'Es tan blando que deja marca en el papel. A pesar de ser no metal, es un excelente conductor eléctrico.', color: '#9ca3af', img: '/images/minerales/grafito.png' },
    { id: 'pirita', name: 'Pirita', properties: 'Dureza: 6-6.5, Brillo: Metálico', clue: 'Conocida como "el oro de los tontos" por su color, pero es mucho más dura y quebradiza que el oro real.', color: '#d97706', img: '/images/minerales/pirita.png' },
    { id: 'esmeralda', name: 'Esmeralda', properties: 'Dureza: 7.5-8, Brillo: Vítreo', clue: 'Piedra preciosa de color verde intenso, variedad del berilo. Muy valorada en joyería.', color: '#10b981', img: '/images/minerales/esmeralda.png' },
    { id: 'rubi', name: 'Rubí', properties: 'Dureza: 9, Brillo: Adamantino a Vítreo', clue: 'Gema preciosa de color rojo vibrante, variedad del corindón. Es el segundo mineral más duro después del diamante.', color: '#ef4444', img: '/images/minerales/rubi.png' },
    { id: 'zafiro', name: 'Zafiro', properties: 'Dureza: 9, Brillo: Vítreo', clue: 'Gema preciosa comúnmente azul, hermana del rubí por ser variedad de corindón. Extremadamente dura.', color: '#3b82f6', img: '/images/minerales/zafiro.png' },
    { id: 'amatista', name: 'Amatista', properties: 'Dureza: 7, Brillo: Vítreo', clue: 'Variedad de cuarzo de color violeta, muy popular por su belleza en formaciones de geodas.', color: '#8b5cf6', img: '/images/minerales/amatista.png' },
    { id: 'obsidiana', name: 'Obsidiana', properties: 'Dureza: 5-5.5, Brillo: Vítreo', clue: 'Vidrio volcánico natural de color negro o muy oscuro, formado por el rápido enfriamiento de la lava.', color: '#1f2937', img: '/images/minerales/obsidiana.png' },
    { id: 'malaquita', name: 'Malaquita', properties: 'Dureza: 3.5-4, Brillo: Sedoso', clue: 'Mineral de cobre reconocible por su color verde opaco con hermosas bandas concéntricas.', color: '#047857', img: '/images/minerales/malaquita.png' },
    { id: 'lapislazuli', name: 'Lapislázuli', properties: 'Dureza: 5-5.5, Brillo: Resinoso', clue: 'Roca compuesta por varios minerales, destaca por su color azul profundo salpicado de motas doradas de pirita.', color: '#1e3a8a', img: '/images/minerales/lapislazuli.png' },
    { id: 'fluorita', name: 'Fluorita', properties: 'Dureza: 4, Brillo: Vítreo', clue: 'Mineral muy colorido que puede ser púrpura, verde o azul. A menudo fluorescente bajo luz ultravioleta.', color: '#a78bfa', img: '/images/minerales/fluorita.png' },
    { id: 'calcita', name: 'Calcita', properties: 'Dureza: 3, Brillo: Vítreo a Perlado', clue: 'Mineral muy común que puede reaccionar burbujeando con ácidos. Su forma cristalina romboédrica es muy típica.', color: '#fef08a', img: '/images/minerales/calcita.png' }
];

const generateMineralesCode = (difficulty, gameDetails, selectedPlatforms) => {
    const config = DIFFICULTY_SETTINGS[difficulty];
    const titleText = gameDetails?.gameName || 'MinerMyst';
    const authorName = gameDetails?.authorName || 'No especificado';
    const version = gameDetails?.version || '1.0.0';
    const gameDesc = gameDetails?.description || 'Identificar diferentes minerales con base en sus propiedades físicas.';
    const formattedDate = (() => {
        try {
            const rawDate = gameDetails?.date || new Date().toISOString();
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
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
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
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        * { box-sizing: border-box; }

        body { 
            background: #f0f2f5; 
            display: flex; justify-content: center; 
            min-height: 100vh; padding: 20px; margin: 0; 
            color: var(--dark-text);
        }

        .container { 
            background: var(--light-text); 
            padding: 2rem; 
            border-radius: var(--border-radius); 
            box-shadow: var(--box-shadow); 
            width: 100%; 
            max-width: 1200px; 
            display: flex; flex-direction: column; 
            min-height: 85vh;
            margin: auto;
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
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
            width: 100%;
        }

        .rules-banner h2 { margin-top: 0; margin-bottom: 0.5rem; font-size: 1.4rem; display: flex; align-items: center; gap: 0.5rem; }
        .rules-banner p { margin: 0; font-size: 1rem; line-height: 1.5; }

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

        .game-layout {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 2rem;
            width: 100%;
            align-items: start;
        }

        .game-main-col { display: flex; flex-direction: column; gap: 1.5rem; }

        .clue-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #bae6fd;
            border-radius: var(--border-radius);
            padding: 2.5rem 2rem 2rem;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            position: relative;
            margin-top: 1rem;
        }

        .clue-icon {
            background: white;
            width: 60px; height: 60px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            color: var(--primary-color);
            border: 3px solid #e0f2fe;
        }

        .mineral-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%; }

        .mineral-card {
            background: white;
            border: 2px solid var(--medium-gray-color);
            border-radius: var(--border-radius);
            padding: 1rem;
            display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            overflow: hidden;
        }

        .mineral-card.selected {
            border-color: var(--primary-color);
            background-color: #e0f2fe;
            box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.2);
            transform: scale(1.02);
        }

        .mineral-card:hover { border-color: var(--primary-color); transform: translateY(-2px); }

        .mineral-name { font-weight: 700; color: var(--secondary-color); font-size: 1.1rem; margin-top: auto; }

        .game-right-col { display: flex; flex-direction: column; gap: 1.5rem; }

        .stats-block {
            background: white;
            border: 1px solid var(--medium-gray-color);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            text-align: left;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }

        .stats-block h3 { margin-top: 0; margin-bottom: 1.25rem; font-size: 1.2rem; color: var(--secondary-color); border-bottom: 2px solid var(--light-gray-color); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .stats-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 1.05rem; }
        .stats-item span { color: var(--dark-gray-color); font-weight: 500; }
        .stats-item strong { font-weight: 700; color: var(--secondary-color); }

        @keyframes popJump { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-15px) scale(1.2); } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }

        .swal-confetti { display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem; }
        .swal-confetti span { animation: popJump 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite alternate; }
        .swal-confetti span:nth-child(2) { animation-delay: 0.2s; }
        .swal-confetti span:nth-child(3) { animation-delay: 0.4s; }

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
            border-radius: var(--border-radius); 
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
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }
        
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

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

        @media (max-width: 900px) { .game-layout { grid-template-columns: 1fr; } }
        @media (max-width: 600px) { .mineral-grid { grid-template-columns: repeat(2, 1fr); } }
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
                <div class="info-item"><span class="info-label">Nivel</span><span class="info-value">${difficulty}</span></div>
                <div class="info-item info-desc"><span class="info-label">Descripción</span><p class="info-value">${gameDesc}</p></div>
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem;" onclick="toggleInfo(false)">Cerrar</button>
            </div>
        </div>
    </div>

    <div class="container hidden" id="game-ui">
        <div class="game-title">${('Juego de ' + titleText).split('').map((char, i) => `<span style="animation-delay: ${i * 0.05}s">${char === ' ' ? '&nbsp;' : char}</span>`).join('')}</div>
        
        <div class="game-layout">
            <div class="game-main-col">
                <div style="display: grid; grid-template-columns: 1fr; max-width: 600px; margin: 0 auto 1.5rem auto; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 0.85rem 1.25rem; text-align: center;">
                    <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; margin-bottom: 0.25rem; display: block;">
                        📋 Reglas básicas
                    </span>
                    <span style="font-size: 1rem; color: #1e40af; font-weight: 500;">
                        Analiza las propiedades físicas del mineral y elige la respuesta correcta.
                    </span>
                </div>

                <div class="clue-box">
                    <div class="clue-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <h3 style="color: var(--secondary-color); margin-bottom: 1rem; font-size: 1.25rem;">Propiedades Detectadas</h3>
                    <p style="font-size: 1.2rem; line-height: 1.6; color: var(--dark-text); font-style: italic; font-weight: 500;" id="clue-text"></p>
                </div>

                <div style="margin-top: 0.5rem; width: 100%;">
                    <div class="mineral-grid" id="mineral-grid"></div>
                </div>
            </div>

            <div class="game-right-col">
                <div class="stats-block">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                        Progreso
                    </h3>
                    <div class="stats-item" style="margin-top: 1rem;">
                        <span>Nivel:</span> <strong style="color: var(--primary-color)">${difficulty}</strong>
                    </div>
                    <div class="stats-item">
                        <span>Pista:</span> <strong id="round-val">1 / 6</strong>
                    </div>
                    <div class="stats-item">
                        <span>Tiempo:</span>
                        <strong id="time-val" style="color: var(--primary-color); font-weight: bold;">00:00</strong>
                    </div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray-color); padding-top: 0.75rem; margin-top: 0.25rem;">
                        <span>Puntaje:</span> <strong id="score-val" style="font-size: 1.2rem; color: var(--primary-color);">0 pts</strong>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 1.25rem;">
                        <button class="no-rounded-button btn-primary" style="width: 100%; justify-content: center;" onclick="validateAnswer()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            Validar Solución
                        </button>
                        <button class="no-rounded-button btn-primary" style="width: 100%; justify-content: center;" onclick="promptEndGame()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Finalizar Juego
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        const minerals = ${JSON.stringify(MINERALS_DATA).replace(/\/images\/minerales\//g, './images/minerales/')};
        let state = { roundData: [], currentRound: 0, score: 0, timeLeft: config.timeLimit, selectedId: null, isPlaying: false, timer: null };

        function toggleInfo(show) {
            document.getElementById('info-overlay').classList.toggle('hidden', !show);
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            const countdownScreen = document.getElementById('countdown-screen');
            const display = document.getElementById('countdown-display');
            countdownScreen.classList.remove('hidden');
            
            let count = 5;
            display.innerText = count;
            display.style.animation = 'none';
            void display.offsetWidth;
            display.style.animation = 'popIn 0.5s ease-out';
            
            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    display.innerText = count;
                    display.style.animation = 'none';
                    void display.offsetWidth;
                    display.style.animation = 'popIn 0.5s ease-out';
                } else {
                    clearInterval(interval);
                    countdownScreen.classList.add('hidden');
                    startGame();
                }
            }, 1000);
        }

        function startGame() {
            document.getElementById('game-ui').classList.remove('hidden');
            state.roundData = [...minerals].sort(() => Math.random() - 0.5).slice(0, config.clues);
            state.currentRound = 0; state.score = 0; state.timeLeft = config.timeLimit; state.isPlaying = true;
            startTimer();
            renderRound();
        }

        function startTimer() {
            clearInterval(state.timer);
            state.timer = setInterval(() => {
                state.timeLeft--; 
                updateUI();
                if(state.timeLeft <= 0) { 
                    clearInterval(state.timer); 
                    Swal.fire({
                        title: '¡Tiempo agotado!', 
                        html: \`
                          <p style="font-size: 1.1rem; margin-bottom: 0;">Se acabó el tiempo límite para esta pista.<br/>El mineral correcto era: <strong>\${state.roundData[state.currentRound].name}</strong>.</p>
                          <div style="font-size: 1.2rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
                            0 Puntos obtenidos
                          </div>\`,
                        icon: 'warning', 
                        confirmButtonText: 'Continuar',
                        confirmButtonColor: '#0077b6', 
                        allowOutsideClick: false
                    }).then(nextRound); 
                }
            }, 1000);
        }

        function formatTime(s) {
            const m = Math.floor(s / 60).toString().padStart(2, '0');
            const secs = (s % 60).toString().padStart(2, '0');
            return m + ':' + secs;
        }

        function renderRound() {
            state.selectedId = null;
            const correct = state.roundData[state.currentRound];
            document.getElementById('clue-text').innerText = '"' + correct.clue + '"';
            
            // Get 5 distractors
            const distractors = minerals.filter(m => m.id !== correct.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 5);
            const roundOptions = [correct, ...distractors].sort(() => Math.random() - 0.5);

            const grid = document.getElementById('mineral-grid');
            grid.innerHTML = '';
            roundOptions.forEach(m => {
                const btn = document.createElement('button');
                btn.className = 'mineral-card';
                btn.dataset.id = m.id;
                
                const imgDiv = document.createElement('div');
                imgDiv.style.cssText = \`width: 100%; height: 100px; border-radius: 8px; background-image: url(\${m.img}); background-size: cover; background-position: center; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);\`;
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'mineral-name';
                nameSpan.innerText = m.name;
                
                btn.appendChild(imgDiv);
                btn.appendChild(nameSpan);
                
                btn.onclick = () => { state.selectedId = m.id; updateGrid(); };
                grid.appendChild(btn);
            });
            updateUI();
        }

        function updateGrid() {
            const cards = document.querySelectorAll('.mineral-card');
            cards.forEach(c => {
                if (c.dataset.id === state.selectedId) c.classList.add('selected');
                else c.classList.remove('selected');
            });
        }

        function updateUI() {
            document.getElementById('round-val').innerText = (state.currentRound + 1) + ' / ' + state.roundData.length;
            const timeEl = document.getElementById('time-val');
            timeEl.innerText = formatTime(state.timeLeft);
            if (state.timeLeft <= 15) {
                timeEl.style.color = 'var(--wrong-color)';
            } else {
                timeEl.style.color = 'var(--primary-color)';
            }
            document.getElementById('score-val').innerText = state.score + ' pts';
        }

        function validateAnswer() {
            if(!state.selectedId) return Swal.fire({title: 'Atención', text: 'Selecciona un mineral primero', icon: 'info', confirmButtonColor: '#0077b6'});
            
            clearInterval(state.timer);
            const isCorrect = state.selectedId === state.roundData[state.currentRound].id;
            const currentMineralName = state.roundData[state.currentRound].name;
            
            if(isCorrect) {
                state.score += config.points;
                Swal.fire({
                    title: '¡Excelente!', 
                    html: \`
                      <div class="swal-confetti">
                        <span style="font-size: 3rem;">🎉</span>
                        <span style="font-size: 3rem;">✨</span>
                        <span style="font-size: 3rem;">🎊</span>
                      </div>
                      <p style="font-size: 1.1rem; margin-bottom: 0;">¡Muy bien! Era el <strong>\${currentMineralName}</strong>.</p>
                      <div style="font-size: 1.4rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.5rem 1rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
                        ⭐ +\${config.points} Puntos
                      </div>
                    \`,
                    icon: 'success', 
                    confirmButtonColor: '#0077b6', 
                    confirmButtonText: 'Siguiente Pista',
                    allowOutsideClick: false
                }).then(nextRound);
            } else {
                Swal.fire({
                    title: 'Incorrecto', 
                    html: \`
                      <p style="font-size: 1.1rem; margin-bottom: 0;">La respuesta no es correcta.<br/>El mineral correcto era: <strong>\${currentMineralName}</strong>.</p>
                      <div style="font-size: 1.2rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
                        0 Puntos obtenidos
                      </div>
                    \`,
                    icon: 'error', 
                    confirmButtonColor: '#0077b6', 
                    confirmButtonText: 'Continuar',
                    allowOutsideClick: false
                }).then(nextRound);
            }
        }

        function nextRound() {
            if(state.currentRound + 1 < state.roundData.length) {
                state.currentRound++; 
                state.timeLeft = config.timeLimit; 
                startTimer();
                renderRound();
            } else {
                Swal.fire({
                    title: '¡Juego Completado!',
                    html: \`
                      <div class="swal-confetti">
                        <span style="font-size: 3rem;">🌟</span>
                        <span style="font-size: 3rem;">🏆</span>
                        <span style="font-size: 3rem;">🌟</span>
                      </div>
                      <p style="font-size: 1.1rem; margin-bottom: 0;">Has terminado todas las pistas exitosamente.</p>
                      <div style="font-size: 1.4rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.5rem 1rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
                        Puntaje Total: \${state.score}
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
            }
        }

        function promptEndGame() {
            clearInterval(state.timer);
            Swal.fire({
                title: '¿Deseas finalizar el juego?',
                text: 'Tu puntaje actual es de ' + state.score + ' puntos.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#4b5563',
                confirmButtonText: 'Sí, finalizar',
                cancelButtonText: 'Seguir Jugando'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.close();
                    document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
                } else {
                    startTimer();
                }
            });
        }
    </script>
</body>
</html>`;
};

const MineralesMisteriosos = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [gameState, setGameState] = useState('start');
    const [difficulty, setDifficulty] = useState('');

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(180);
    const [currentRound, setCurrentRound] = useState(0);
    const [roundData, setRoundData] = useState([]);
    const [history, setHistory] = useState([]);
    const [selectedMineralId, setSelectedMineralId] = useState(null);
    const [currentOptions, setCurrentOptions] = useState([]);

    // Siempre usar la fecha actual del sistema (equipo del usuario) — igual que Acertijo.jsx
    const getFixedCreationDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    };

    const rawGameDetails = location.state?.gameDetails || {};
    const gameDetails = { ...rawGameDetails, date: getFixedCreationDate() };
    const selectedAreas = location.state?.selectedAreas || [];
    const selectedSkills = location.state?.selectedSkills || [];
    const selectedPlatforms = location.state?.selectedPlatforms || [];

    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Iniciando...');
    const jsZipReady = true;



    useEffect(() => {
        if (gameState === 'playing' && roundData.length > 0 && roundData[currentRound]) {
            const correct = roundData[currentRound];
            const distractors = MINERALS_DATA.filter(m => m.id !== correct.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 5);
            const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
            setCurrentOptions(options);
        }
    }, [currentRound, roundData, gameState]);

    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (gameState === 'playing' && timeLeft <= 0) {
            setHistory(prev => [...prev, { mineral: roundData[currentRound], correct: false, points: 0 }]);
            Swal.fire({
                title: '¡Tiempo agotado!',
                html: `
                  <p style="font-size: 1.1rem; margin-bottom: 0;">Se acabó el tiempo límite para esta pista.<br/>El mineral correcto era: <strong>${roundData[currentRound]?.name || ''}</strong>.</p>
                  <div style="font-size: 1.2rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
                    0 Puntos obtenidos
                  </div>
                `,
                icon: 'warning',
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#0077b6',
                allowOutsideClick: false
            }).then(() => checkNextRound(score));
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft, currentRound, roundData]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${m}:${secs}`;
    };



    const normalizeFileName = (str) =>
        (str || '').trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_');

    const platformLabel = (p) => ({ web: 'Web', android: 'Android', ios: 'iOS' }[String(p).toLowerCase()] || p);

    const handleSmartDownload = async () => { if (isGenerating) return; setIsGenerating(true); setProgress(10); await generateAndDownloadZip(); };

    const generateAndDownloadZip = async () => {
        try {
            setStatusText('Preparando juego y configuración...');
            const result = await buildMissingMobileDownload({
                slug: 'minermyst', details: gameDetails, platforms: selectedPlatforms,
                options: { nivel: difficulty }, htmlContent: generateMineralesCode(difficulty, gameDetails, selectedPlatforms), webAssets: MINERALS_DATA.map(m => m.img),
                onStatus: (status) => { setStatusText(status); setProgress(current => Math.min(90, current + 15)); }
            });
            downloadGameArchive(result.blob, result.fileName);
            setProgress(100); setStatusText('¡Descarga iniciada!');
        } catch (error) {
            console.error(error); setStatusText(error?.message || 'Error al generar el paquete.');
        } finally { setIsGenerating(false); }
    };


    const startGame = () => {
        const config = DIFFICULTY_SETTINGS[difficulty];
        const shuffled = [...MINERALS_DATA].sort(() => Math.random() - 0.5).slice(0, config.clues);
        setRoundData(shuffled);
        setCurrentRound(0);
        setScore(0);
        setTimeLeft(config.timeLimit);
        setHistory([]);
        setSelectedMineralId(null);
        setGameState('playing');
    };

    const handleValidate = () => {
        if (!selectedMineralId) {
            Swal.fire({
                title: 'Atención',
                text: 'Debes seleccionar un mineral antes de validar.',
                icon: 'info',
                confirmButtonColor: '#0077b6'
            });
            return;
        }

        const currentMineral = roundData[currentRound];
        const isCorrect = selectedMineralId === currentMineral.id;
        const config = DIFFICULTY_SETTINGS[difficulty];

        let nextScore = score;
        if (isCorrect) {
            nextScore += config.points;
            setScore(nextScore);
            setHistory(prev => [...prev, { mineral: currentMineral, correct: true, points: config.points }]);

            Swal.fire({
                title: '¡Excelente!',
                html: `
                  <div class="swal-confetti">
                    <span style="font-size: 3rem;">🎉</span>
                    <span style="font-size: 3rem;">✨</span>
                    <span style="font-size: 3rem;">🎊</span>
                  </div>
                  <p style="font-size: 1.1rem; margin-bottom: 0;">¡Muy bien! Era el <strong>${currentMineral.name}</strong>.</p>
                  <div style="font-size: 1.4rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.5rem 1rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
                    ⭐ +${config.points} Puntos
                  </div>
                `,
                icon: 'success',
                confirmButtonColor: '#0077b6',
                confirmButtonText: 'Siguiente Pista',
                allowOutsideClick: false
            }).then(() => checkNextRound(nextScore));
        } else {
            setHistory(prev => [...prev, { mineral: currentMineral, correct: false, points: 0 }]);

            Swal.fire({
                title: 'Incorrecto',
                html: `
                  <p style="font-size: 1.1rem; margin-bottom: 0;">La respuesta no es correcta.<br/>El mineral correcto era: <strong>${currentMineral.name}</strong>.</p>
                  <div style="font-size: 1.2rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
                    0 Puntos obtenidos
                  </div>
                `,
                icon: 'error',
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#0077b6',
                allowOutsideClick: false
            }).then(() => checkNextRound(nextScore));
        }
    };

    const checkNextRound = (finalScore) => {
        const displayScore = typeof finalScore === 'number' ? finalScore : score;
        if (currentRound + 1 < roundData.length) {
            setCurrentRound(prev => prev + 1);
            setSelectedMineralId(null);
            setTimeLeft(DIFFICULTY_SETTINGS[difficulty].timeLimit);
        } else {
            Swal.fire({
                title: '¡Juego Completado!',
                html: `
                  <div class="swal-confetti">
                    <span style="font-size: 3rem;">🌟</span>
                    <span style="font-size: 3rem;">🏆</span>
                    <span style="font-size: 3rem;">🌟</span>
                  </div>
                  <p style="font-size: 1.1rem; margin-bottom: 0;">Has terminado todas las pistas exitosamente.</p>
                  <div style="font-size: 1.4rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.5rem 1rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
                    Puntaje Total: ${displayScore}
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
                    setGameState('start');
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    startGame();
                }
            });
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
            if (result.isConfirmed) setGameState('start');
        });
    };

    const renderAnimatedTitle = (showPreview = false) => (
        <div className="game-title" style={{ flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                {'Juego de MinerMyst'.split('').map((char, index) => (
                    <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </div>
            {showPreview && (
                <span style={{ fontSize: '1.2rem', color: 'var(--dark-gray-color)', fontWeight: 'normal', marginTop: '0.5rem' }}>
                    (Vista Previa)
                </span>
            )}
        </div>
    );

    const renderStartScreen = () => {
        const gameIcon = location.state?.selectedGame?.icon || null;

        return (
            <div className="catalog-screen">
                {renderAnimatedTitle(false)}

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {gameIcon ? (
                        <img src={gameIcon} alt="Minerales" className="game-preview-image"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <div className="game-image-placeholder">■</div>
                    )}
                    <span className="game-info-badge">Ciencia y Materiales</span>
                </div>

                <div className="rules-banner">
                    <h2><HelpCircle size={24} /> Identificación de Minerales</h2>
                    <p>Analiza las propiedades físicas del mineral y elige la respuesta correcta.</p>
                </div>

                <div className="difficulty-select-wrapper">
                    <label>Selecciona el nivel de dificultad:</label>
                    <select className="difficulty-select" value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}>
                        <option value="" disabled>Selecciona una opción</option>
                        {Object.keys(DIFFICULTY_SETTINGS).map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>

                <div className="catalog-actions">
                    <button className="no-rounded-button btn-primary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} /> Anterior
                    </button>
                    <button className="no-rounded-button btn-primary" onClick={startGame} disabled={!difficulty}>
                        Siguiente <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    };

    const renderPlayingScreen = () => {
        const currentClue = roundData[currentRound];

        return (
            <div style={{ width: '100%' }}>
                {renderAnimatedTitle(true)}

                <div className="game-layout">
                    <div className="game-main-col">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto 1.5rem auto', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                                📋 Reglas básicas
                            </span>
                            <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>
                                Analiza las propiedades físicas del mineral y elige la respuesta correcta.
                            </span>
                        </div>

                        <div className="clue-box">
                            <div className="clue-icon"><Search size={32} strokeWidth={2.5} /></div>
                            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', fontSize: '1.25rem' }}>
                                Propiedades Detectadas
                            </h3>
                            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--dark-text)', fontStyle: 'italic', fontWeight: '500' }}>
                                "{currentClue?.clue}"
                            </p>
                        </div>

                        <div style={{ marginTop: '0.5rem', width: '100%' }}>
                            <div className="mineral-grid">
                                {currentOptions.map(mineral => (
                                    <button
                                        key={mineral.id}
                                        className={`mineral-card ${selectedMineralId === mineral.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedMineralId(mineral.id)}
                                        style={{ overflow: 'hidden', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}
                                    >
                                        <div style={{
                                            width: '100%', height: '100px', borderRadius: '8px',
                                            backgroundImage: `url(${mineral.img})`,
                                            backgroundSize: 'cover', backgroundPosition: 'center',
                                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                                        }}>
                                        </div>
                                        <span className="mineral-name" style={{ marginTop: 'auto' }}>{mineral.name}</span>
                                    </button>
                                ))}
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
                                <span>Pista:</span> <strong>{currentRound + 1} / {roundData.length}</strong>
                            </div>
                            <div className="stats-item">
                                <span>Tiempo:</span>
                                <strong style={{ color: timeLeft <= 15 ? 'var(--wrong-color)' : 'var(--primary-color)', fontWeight: 'bold' }}>
                                    {formatTime(timeLeft)}
                                </strong>
                            </div>
                            <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                                <span>Puntaje:</span> <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{score} pts</strong>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                                <button className="no-rounded-button btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleValidate}>
                                    <CheckSquare size={16} /> Validar Solución
                                </button>
                                <button className="no-rounded-button btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleFinishGame}>
                                    <X size={16} /> Finalizar Juego
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="nav-footer">
                    <button className="no-rounded-button btn-primary" onClick={() => {
                        setGameState('start');
                        navigate('/settings', { replace: true, state: { ...location.state, setupStep: 'game' } });
                    }}>
                        <ArrowLeft size={16} /> Anterior
                    </button>
                    <button className="no-rounded-button btn-primary" onClick={() => {
                        setGameState('summary');
                        navigate('/settings?view=Summary', { replace: true, state: { ...location.state, setupStep: 'summary' } });
                    }}>
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
                <p className="rules-text">Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.</p>
                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.5rem 0 2rem 0', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }} />

                <h1 className="selection-title" style={{ textAlign: 'center', color: '#0077b6', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>
                    Resumen de la Configuración
                </h1>

                <div className="summary-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
                            <div className="info-card-value">{gameDetails.gameName || 'MinerMyst'}</div>
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
                                {gameDetails.description || 'Identificar diferentes minerales con base en sus propiedades físicas. A través de pistas, deben elegir el mineral correcto.'}
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
                </div>{/* cierra summary-details */}

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
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{DIFFICULTY_SETTINGS[difficulty]?.timeLimit / 60} minuto{DIFFICULTY_SETTINGS[difficulty]?.timeLimit / 60 !== 1 ? 's' : ''} por pista</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Star size={18} /> Pistas:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{DIFFICULTY_SETTINGS[difficulty]?.clues}</strong>
                        </div>
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <button className="no-rounded-button btn-primary" onClick={() => {
                            setGameState('start');
                            navigate('/settings', { replace: true, state: { ...location.state, setupStep: 'game' } });
                        }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

                        {/* Badges de plataforma */}
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

                        {/* Barra de progreso */}
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
                        {!jsZipReady ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Cargando librería...
                            </>
                        ) : isGenerating ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Generando...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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


    return (
        <div className="minerales-container">
            <Style />
            {gameState === 'start' && renderStartScreen()}
            {gameState === 'playing' && renderPlayingScreen()}
            {gameState === 'summary' && renderSummaryScreen()}
        </div>
    );
};

export default MineralesMisteriosos;
