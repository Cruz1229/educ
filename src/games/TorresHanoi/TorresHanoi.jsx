import { buildMissingMobileDownload } from '../../utils/missingMobileGames';
import { downloadGameArchive } from '../../utils/gameDownloadPackaging';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Timer, Trophy, Star, ArrowLeft, ArrowRight, Tag, Layers, FileText, Info,
    Calendar, Monitor, HelpCircle, Type, X, CheckSquare, Shapes, Puzzle, CheckCircle
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

    @keyframes pulseGlow {
      0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); transform: scale(1); }
      50% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); transform: scale(1.05); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); transform: scale(1); }
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
    @keyframes popJump {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-15px) scale(1.2); }
    }

    .hanoi-container {
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
    .btn-primary:hover:not(:disabled) { background-color: #005f92; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .catalog-actions {
      display: flex;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid var(--medium-gray-color);
    }

    /* --- IMAGEN DEL JUEGO con efectos (estilo Platform.jsx) --- */
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
      align-items: center;
    }

    .hanoi-board {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      width: 100%;
      max-width: 800px;
      height: 350px;
      background: white;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 2rem 1rem;
      position: relative;
    }

    .peg {
      width: 30%;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
      cursor: pointer;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .peg:hover {
      background-color: #f8fafc;
    }
    
    .peg.selected-peg {
      background-color: #e0f2fe;
    }

    .peg::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 90%;
      background-color: #374151;
      border-radius: 6px;
      z-index: 1;
    }

    .peg::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 10%;
      width: 80%;
      height: 10px;
      background-color: #111827;
      border-radius: 5px;
      z-index: 1;
    }

    .disk {
      height: 30px;
      pointer-events: none;
      border-radius: 15px;
      z-index: 2;
      transition: all 0.2s;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      border: 2px solid rgba(0,0,0,0.2);
    }
    
    .disk.selected {
      transform: translateY(-20px);
      box-shadow: 0 10px 15px rgba(0,0,0,0.2);
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

    .nav-footer {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--medium-gray-color);
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
    .btn-success { background: #005f92; }
    .btn-success:hover:not(:disabled) { background: #004a73; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .info-card { background: white; padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem; }
    .info-card-header { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; width: 100%; }
    .info-card-value { font-size: 1.1rem; color: #334155; font-weight: 500; text-align: center; width: 100%; }
    .full-width { grid-column: 1 / -1; }
    .rules-text { text-align: center; color: #6b7280; margin-bottom: 2rem; font-size: 1.1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @media (max-width: 900px) {
      .game-layout {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
  `}</style>
);

const DIFFICULTY_SETTINGS = {
    Básico: { disks: 4, timeLimit: 300, points: 15, attempts: 1 },
    Avanzado: { disks: 6, timeLimit: 600, points: 25, attempts: 2 }
};

const DISK_COLORS = [
    '#FF0000', // Red
    '#FF7F00', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#0000FF', // Blue
    '#4B0082', // Indigo
    '#9400D3'  // Violet
];

// --- GENERADOR HTML PARA EL JUEGO INDEPENDIENTE ---
const generateHanoiCode = (difficulty, gameDetails = {}, selectedPlatforms = ['web']) => {
    const config = DIFFICULTY_SETTINGS[difficulty];
    const titleText = gameDetails.gameName || 'Torres de Hanoi';
    const authorName = gameDetails.authorName || 'No especificado';
    const version = gameDetails.version || '1.0.0';
    const gameDesc = gameDetails.description || 'Juego matemático de discos y postes.';
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

        @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); transform: scale(1); }
            50% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); transform: scale(1.05); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); transform: scale(1); }
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
        @keyframes popJump {
            0% { transform: translateY(0) scale(1); }
            100% { transform: translateY(-15px) scale(1.2); }
        }

        body { font-family: system-ui, -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 1050px; display: flex; flex-direction: column; }
        
        .game-layout { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; width: 100%; margin-top: 1.5rem; }
        @media (max-width: 800px) { .game-layout { grid-template-columns: 1fr; } }

        .diagram-column { background: white; border: 1px solid var(--medium-gray); border-radius: var(--border-radius); padding: 1.5rem; display: flex; flex-direction: column; align-items: center; }
        
        /* Tablero */
        .hanoi-board { display: flex; justify-content: space-around; align-items: flex-end;
            width: 100%; height: 320px; background: white;
            border: 1px solid var(--medium-gray); border-radius: var(--border-radius);
            padding: 2rem 1rem; position: relative; box-sizing: border-box; }
        .peg { width: 30%; height: 100%; position: relative; display: flex;
            flex-direction: column-reverse; align-items: center; cursor: pointer;
            border-radius: 8px; transition: background-color 0.2s; }
        .peg:hover { background-color: #f8fafc; }
        .peg.selected-peg { background-color: #e0f2fe; }
        .peg::before { content: ''; position: absolute; bottom: 0; left: 50%;
            transform: translateX(-50%); width: 12px; height: 90%;
            background-color: #374151; border-radius: 6px; z-index: 1; }
        .peg::after { content: ''; position: absolute; bottom: -10px; left: 10%;
            width: 80%; height: 10px; background-color: #111827; border-radius: 5px; z-index: 1; }
        .disk { height: 30px; pointer-events: none; border-radius: 15px; z-index: 2; transition: all 0.2s;
            margin-bottom: 2px; display: flex; align-items: center; justify-content: center;
            font-weight: bold; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            border: 2px solid rgba(0,0,0,0.2); box-sizing: border-box; }
        .disk.selected { transform: translateY(-20px); box-shadow: 0 10px 15px rgba(0,0,0,0.2); }

        .stats-column { display: flex; flex-direction: column; gap: 1.5rem; }
        .stats-block { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; height: fit-content; background: white; }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); display: flex; align-items: center; gap: 0.5rem; }
        .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }
        
        .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: var(--border-radius); cursor: pointer; font-weight: bold; color: white; transition: background 0.2s; }
        .btn-primary { background: var(--primary-color); }
        .btn-primary:hover { background: #005f92; }
        .btn-success { background: var(--correct); }
        .btn-secondary { background: var(--dark-gray); }
        
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
        
        .btn-exit { background: #111827; }
        .btn-exit:hover { background: #000000; }
        .btn-retry { background: var(--primary-color); }
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }
        
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        .game-title { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        .game-title.static span { animation: none; transform: none; }
        @keyframes wave-animation { 0%, 40%, 100% { transform: translateY(0); } 20% { transform: translateY(-20px); } }

        .timer-warn { color: var(--wrong) !important; }

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

    <div id="howtoplay-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleHowToPlay(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">¿Cómo jugar Torres de Hanoi?</h2>
                <div class="info-subtitle">Aprende las reglas y mecánicas básicas</div>
            </div>
            
            <div class="info-details-grid" style="grid-template-columns: 1fr;">
                <div class="info-item info-desc" style="background: #f8fafc; padding: 1.5rem; border: none; border-radius: 0.5rem;">
                    <ul style="margin: 0; padding-left: 1.2rem; color: #334155; line-height: 1.6; font-size: 1.05rem; text-align: left;">
                        <li style="margin-bottom: 0.75rem;">El objetivo es mover todos los discos desde el poste inicial hasta otro poste.</li>
                        <li style="margin-bottom: 0.75rem;">Haz clic en un <strong>poste con discos</strong> para seleccionar el disco superior.</li>
                        <li style="margin-bottom: 0.75rem;">Luego haz clic en el <strong>poste destino</strong> donde quieres mover el disco.</li>
                        <li style="margin-bottom: 0.75rem;"><strong>Regla fundamental:</strong> Nunca puedes colocar un disco grande sobre uno más pequeño.</li>
                        <li style="margin-bottom: 0.75rem;">El juego se considerará resuelto cuando <strong>todos los discos</strong> estén apilados en el poste 2 o 3.</li>
                        <li>Presiona <strong>"Validar Solución"</strong> para comprobar que has completado el rompecabezas a tiempo.</li>
                    </ul>
                </div>
            </div>

            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem; background: var(--primary-color); color: white; border: none;" onclick="toggleHowToPlay(false)">¡Entendido!</button>
            </div>
        </div>
    </div>

    <div id="end-screen" class="overlay hidden">
        <h1 id="end-title" style="color:var(--primary-color); font-size:3rem; font-weight: 800;">Juego Terminado</h1>
        <h2 style="color:var(--secondary-color); font-size:2rem; margin:1rem 0;">Puntos Obtenidos: <span id="final-score">0</span></h2>
        <div class="end-buttons" style="display:flex; gap:1rem;">
             <button class="big-btn btn-exit" onclick="exitGame()"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Salir</button>
             <button class="big-btn btn-retry" onclick="location.reload()"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg> Volver a Jugar</button>
        </div>
    </div>

    <div class="container" id="game-ui" style="display:none;">
        <div class="game-title" id="main-title"></div>
        
        <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
            <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
            <span style="font-size:1rem; color:#1e40af; font-weight:500;">Mueve todos los discos desde el poste inicial hasta el poste destino, con la condición de nunca colocar un disco grande sobre uno más pequeño.</span>
        </div>

        <div class="game-layout">
            <div class="diagram-column">
                <div style="display:flex; flex-direction:row; justify-content:center; align-items:center; gap:10px; margin-bottom:15px;">
                    <button class="btn btn-primary" onclick="toggleHowToPlay(true)" style="margin:0; width:auto; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.4rem;"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Cómo Jugar
                    </button>
                </div>
                <div class="hanoi-board" id="board">
                    <div class="peg" id="peg-0" onclick="handlePegClick(0)"></div>
                    <div class="peg" id="peg-1" onclick="handlePegClick(1)"></div>
                    <div class="peg" id="peg-2" onclick="handlePegClick(2)"></div>
                </div>
            </div>
            <div class="stats-column">
                <div class="stats-block">
                    <h3><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg> Progreso</h3>
                    <div class="stats-item"><span>Nivel:</span> <strong>${difficulty}</strong></div>
                    <div class="stats-item"><span>Tiempo:</span> <strong id="timer-val">00:00</strong></div>
                    <div class="stats-item"><span>Puntaje:</span> <strong id="score-val">0 pts</strong></div>
                    <button class="btn btn-primary" onclick="handleValidate()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> Validar Solución</button>
                    <button class="btn btn-primary" onclick="handleFinish()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Finalizar Juego</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        const diskColors = ${JSON.stringify(DISK_COLORS)};
        let state = { pegs: [[], [], []], selectedPeg: null, timeLeft: config.timeLimit, attempts: 0, score: 0, isPlaying: false };

        function initTitle() {
            const el = document.getElementById('main-title');
            el.innerHTML = "${titleText}".split('').map((c, i) => '<span style="animation-delay:'+(i*0.05)+'s">'+(c===' '?'&nbsp;':c)+'</span>').join('');
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

        let timerInterval;
        function startGame() {
            document.getElementById('game-ui').style.display = 'flex';
            initTitle();
            for(let i=config.disks; i>0; i--) state.pegs[0].push(i);
            state.isPlaying = true;
            updateUI();
            timerInterval = setInterval(() => { 
                if(state.isPlaying) {
                    if (state.timeLeft > 0) {
                        state.timeLeft--; 
                        updateUI(); 
                    } else {
                        handleTimeout();
                    }
                } 
            }, 1000);
            lucide.createIcons();
        }

        function handleTimeout() {
            state.isPlaying = false;
            clearInterval(timerInterval);
            state.attemptsUsed = (state.attemptsUsed || 0) + 1;
            if (state.attemptsUsed >= config.attempts) {
                Swal.fire({
                    title: 'Tiempo agotado',
                    text: 'Intente nuevamente.',
                    icon: 'error',
                    confirmButtonColor: '#0077b6'
                }).then(() => {
                    finish(false);
                });
            } else {
                Swal.fire({
                    title: 'Tiempo agotado',
                    text: 'Tiene usted otra oportunidad.',
                    icon: 'warning',
                    confirmButtonText: 'Reintentar',
                    confirmButtonColor: '#0077b6'
                }).then(() => {
                    const initialPegs = [[], [], []];
                    for (let i = config.disks; i >= 1; i--) {
                        initialPegs[0].push(i);
                    }
                    state.pegs = initialPegs;
                    state.selectedPeg = null;
                    state.timeLeft = config.timeLimit;
                    state.isPlaying = true;
                    updateUI();
                    timerInterval = setInterval(() => { 
                        if(state.isPlaying) {
                            if (state.timeLeft > 0) {
                                state.timeLeft--; 
                                updateUI(); 
                            } else {
                                handleTimeout();
                            }
                        } 
                    }, 1000);
                });
            }
        }

        function updateUI() {
            document.getElementById('timer-val').innerText = Math.floor(state.timeLeft/60)+':'+(state.timeLeft%60).toString().padStart(2,'0');
            state.pegs.forEach((peg, idx) => {
                const el = document.getElementById('peg-'+idx); 
                el.innerHTML = '';
                if(state.selectedPeg === idx) {
                    el.classList.add('selected-peg');
                } else {
                    el.classList.remove('selected-peg');
                }
                peg.forEach((s, i) => {
                    const d = document.createElement('div'); 
                    d.className = 'disk';
                    if (state.selectedPeg === idx && i === peg.length - 1) {
                        d.classList.add('selected');
                    }
                    d.style.width = (30+(s/config.disks)*60)+'%'; 
                    d.style.backgroundColor = diskColors[s-1];
                    el.appendChild(d);
                });
            });
        }

        function handlePegClick(idx) {
            if(!state.isPlaying) return;
            if(state.selectedPeg === null) {
                if(state.pegs[idx].length > 0) {
                    state.selectedPeg = idx;
                    updateUI();
                }
            } else {
                if(state.selectedPeg === idx) {
                    state.selectedPeg = null;
                    updateUI();
                } else {
                    const s = state.pegs[state.selectedPeg], t = state.pegs[idx];
                    if(s.length > 0 && (t.length === 0 || s[s.length-1] < t[t.length-1])) {
                        t.push(s.pop());
                    } else {
                        Swal.fire({
                            title: 'Movimiento Inválido',
                            text: 'No puedes colocar un disco grande sobre uno más pequeño.',
                            icon: 'error',
                            confirmButtonColor: '#0077b6'
                        });
                    }
                    state.selectedPeg = null;
                    updateUI();
                }
            }
        }

        function handleValidate() {
            if(state.pegs[1].length === config.disks || state.pegs[2].length === config.disks) {
                state.score = config.points;
                clearInterval(timerInterval);
                state.isPlaying = false;
                Swal.fire({
                    title: '¡Felicidades!',
                    html: '<div class="swal-confetti"><span style="font-size: 3rem;">✨</span><span style="font-size: 3rem;">🎉</span><span style="font-size: 3rem;">✨</span></div><p style="font-size: 1.1rem; margin-bottom: 0;">Has resuelto el juego a tiempo.</p><div style="font-size: 1.4rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.5rem 1rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">✨ +${config.points} Puntos</div>',
                    icon: 'success',
                    confirmButtonText: 'Ver Resultados',
                    confirmButtonColor: '#0077b6'
                }).then(() => {
                    finish(true);
                });
            } else Swal.fire('Incompleto', 'Debes mover todos los discos a otro poste.', 'info');
        }

        function handleFinish() {
            Swal.fire({
                title: '¿Deseas finalizar el juego?',
                text: 'Tu puntaje actual es de ' + state.score + ' puntos.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#0077b6',
                confirmButtonText: 'Sí, finalizar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    clearInterval(timerInterval);
                    finish(false);
                }
            });
        }

        function finish(win) {
            state.isPlaying = false;
            document.getElementById('game-ui').style.display = 'none';
            document.getElementById('end-screen').classList.remove('hidden');
            document.getElementById('final-score').innerText = state.score;
        }

        function toggleInfo(show) {
            const m = document.getElementById('info-overlay');
            if (show) { m.classList.remove('hidden'); m.style.display = 'flex'; }
            else { m.classList.add('hidden'); m.style.display = 'none'; }
        }
        function toggleHowToPlay(show) {
            const m = document.getElementById('howtoplay-overlay');
            if (show) { m.classList.remove('hidden'); m.style.display = 'flex'; }
            else { m.classList.add('hidden'); m.style.display = 'none'; }
        }
    </script>
</body>
</html>`;
};


const TorresHanoi = () => {
    const [view, setView] = useState('home');
    const [difficulty, setDifficulty] = useState('');

    // Game state
    const [pegs, setPegs] = useState([[], [], []]);
    const [selectedPeg, setSelectedPeg] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [attemptsUsed, setAttemptsUsed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const timerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const jsZipReady = true;

    const MOCK_DATA = {
        selectedAreas: ['science'],
        selectedSkills: ['Lógica', 'Resolución de problemas'],
        gameDetails: { gameName: 'Torres de Hanoi', description: 'Juego matemático de discos y postes.', version: '1.0.0', date: null },
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

    const currentConfig = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS['Básico'];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);



    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const initGame = () => {
        const initialPegs = [[], [], []];
        for (let i = currentConfig.disks; i >= 1; i--) {
            initialPegs[0].push(i);
        }
        setPegs(initialPegs);
        setSelectedPeg(null);
        setTimeLeft(currentConfig.timeLimit);
        setScore(0);
        setAttemptsUsed(0);
        setIsPlaying(true);
    };

    const startNewGame = () => {
        setView('play');
        initGame();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, isPlaying, attemptsUsed]);

    const handleTimeout = () => {
        setIsPlaying(false);
        const newAttempts = attemptsUsed + 1;
        setAttemptsUsed(newAttempts);

        if (newAttempts >= currentConfig.attempts) {
            Swal.fire({
                title: 'Tiempo agotado',
                text: 'Intente nuevamente.',
                icon: 'error',
                showCancelButton: true,
                confirmButtonText: 'Finalizar Juego',
                cancelButtonText: 'Volver a Jugar',
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#0077b6'
            }).then((result) => {
                if (result.isConfirmed) {
                    goToHome();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    startNewGame();
                }
            });
        } else {
            Swal.fire({
                title: 'Tiempo agotado',
                text: 'Tiene usted otra oportunidad.',
                icon: 'warning',
                confirmButtonText: 'Reintentar',
                confirmButtonColor: '#0077b6'
            }).then(() => {
                const initialPegs = [[], [], []];
                for (let i = currentConfig.disks; i >= 1; i--) {
                    initialPegs[0].push(i);
                }
                setPegs(initialPegs);
                setSelectedPeg(null);
                setTimeLeft(currentConfig.timeLimit);
                setIsPlaying(true);
            });
        }
    };

    const checkWin = (newPegs) => {
        if (newPegs[1].length === currentConfig.disks || newPegs[2].length === currentConfig.disks) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            setScore(currentConfig.points);

            Swal.fire({
                title: '¡Felicidades!',
                html: `
                    <div class="swal-confetti">
                        <span style="font-size: 3rem;">✨</span>
                        <span style="font-size: 3rem;">🎉</span>
                        <span style="font-size: 3rem;">✨</span>
                    </div>
                    <p style="font-size: 1.1rem; margin-bottom: 0;">Has resuelto el juego a tiempo.</p>
                    <div style="font-size: 1.4rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.5rem 1rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
                        ✨ +${currentConfig.points} Puntos
                    </div>
                `,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Finalizar Juego',
                cancelButtonText: 'Volver a Jugar',
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#0077b6'
            }).then((result) => {
                if (result.isConfirmed) {
                    goToHome();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    startNewGame();
                }
            });
        }
    };

    const handlePegClick = (pegIndex) => {
        if (!isPlaying) return;

        if (selectedPeg === null) {
            if (pegs[pegIndex].length > 0) {
                setSelectedPeg(pegIndex);
            }
        } else {
            if (selectedPeg === pegIndex) {
                setSelectedPeg(null);
            } else {
                const sourcePeg = [...pegs[selectedPeg]];
                const targetPeg = [...pegs[pegIndex]];
                const diskToMove = sourcePeg[sourcePeg.length - 1];
                const topDiskTarget = targetPeg.length > 0 ? targetPeg[targetPeg.length - 1] : null;

                if (topDiskTarget === null || diskToMove < topDiskTarget) {
                    targetPeg.push(sourcePeg.pop());
                    const newPegs = [...pegs];
                    newPegs[selectedPeg] = sourcePeg;
                    newPegs[pegIndex] = targetPeg;
                    setPegs(newPegs);
                    setSelectedPeg(null);
                    // checkWin se llama manualmente desde el botón «Validar Solución»
                } else {
                    Swal.fire({
                        title: 'Movimiento Inválido',
                        text: 'No puedes colocar un disco grande sobre uno más pequeño.',
                        icon: 'error',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    setSelectedPeg(null);
                }
            }
        }
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
            cancelButtonColor: '#0077b6',
            confirmButtonText: 'Sí, finalizar',
            cancelButtonText: 'Seguir Jugando'
        }).then((result) => {
            if (result.isConfirmed) {
                clearInterval(timerRef.current);
                goToHome();
            }
        });
    };

    const showHowToPlayModal = () => {
        Swal.fire({
            title: '¿Cómo jugar Torres de Hanoi?',
            html: `
                <div style="text-align: left; font-size: 1rem; color: #334155; line-height: 1.6;">
                    <p style="margin-bottom: 0.75rem;">El objetivo es mover todos los discos desde el poste inicial hasta otro poste.</p>
                    <p style="margin-bottom: 0.75rem;">Haz clic en un <strong>poste con discos</strong> para seleccionar el disco superior.</p>
                    <p style="margin-bottom: 0.75rem;">Luego haz clic en el <strong>poste destino</strong> donde quieres mover el disco.</p>
                    <p style="margin-bottom: 0.75rem;"><strong>Regla fundamental:</strong> Nunca puedes colocar un disco grande sobre uno más pequeño.</p>
                    <p style="margin-bottom: 0.75rem;">El juego se considerará resuelto cuando <strong>todos los discos</strong> estén apilados en el poste 2 o 3.</p>
                    <p>Presiona <strong>"Validar Solución"</strong> para comprobar que has completado el rompecabezas a tiempo.</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: '¡Entendido!',
            confirmButtonColor: '#0077b6'
        });
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
    const platformLabel = (p) => ({ web: 'Web', android: 'Android', ios: 'iOS' }[String(p).toLowerCase()] || p);
    const handleSmartDownload = async () => { if (isGenerating) return; setIsGenerating(true); setProgress(10); await generateAndDownloadZip(); };

    const generateAndDownloadZip = async () => {
        try {
            setStatusText('Preparando juego y configuración...');
            const result = await buildMissingMobileDownload({
                slug: 'torres-hanoi', details: gameDetailsWithDate, platforms: selectedPlatforms,
                options: { nivel: difficulty }, htmlContent: generateHanoiCode(difficulty, gameDetailsWithDate, selectedPlatforms), webAssets: [],
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
                    {'Juego de Torres de Hanoi'.split('').map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>

                {/* Imagen del juego con efectos, centrada debajo del título */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {gameIcon ? (
                        <img src={gameIcon} alt="Torres de Hanoi" className="game-preview-image" onError={(e) => { e.target.onerror = null; e.target.src = '/images/juegos/hanoi.png'; }} />
                    ) : (
                        <div className="game-image-placeholder">🗼</div>
                    )}
                    <span className="game-info-badge">Ingeniería</span>
                </div>

                <div className="rules-banner">
                    <h2><HelpCircle size={22} /> Torres de Hanoi</h2>
                    <p>
                        Resuelve el clásico rompecabezas matemático de las Torres de Hanoi. El objetivo es mover todos los discos apilados en el primer poste hacia otro poste, respetando las reglas de mover un disco a la vez y nunca colocar un disco más grande sobre uno más pequeño.
                    </p>
                </div>

                <div className="difficulty-select-wrapper" style={{ flexDirection: 'column', paddingBottom: '2rem', borderBottom: '1px solid var(--medium-gray-color)' }}>
                    <label>Selecciona el nivel de dificultad:</label>
                    <select
                        id="difficulty-select"
                        className="difficulty-select"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="" disabled>Selecciona un nivel...</option>
                        {Object.keys(DIFFICULTY_SETTINGS).map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>

                <div className="catalog-actions">
                    <button className="no-rounded-button btn-primary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} /> Anterior
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="no-rounded-button btn-primary"
                            onClick={startNewGame}
                            disabled={!difficulty}
                            style={{ opacity: difficulty ? 1 : 0.5, cursor: difficulty ? 'pointer' : 'not-allowed' }}
                        >
                            <ArrowRight size={18} /> Siguiente
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderGameScreen = () => {
        return (
            <div className="game-screen">
                <div className="game-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    {'Juego de Torres de Hanoi'.split('').map((char, index) => (
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
                        Mueve todos los discos desde el poste inicial hasta el poste destino, con la condición de nunca colocar un disco grande sobre uno más pequeño.
                    </span>
                </div>

                <div className="game-layout">
                    <div className="game-main-col">
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '15px', width: '100%' }}>
                            <button className="btn-primary" onClick={showHowToPlayModal} style={{ margin: 0, width: 'auto' }}>
                                <Info size={16} /> Cómo Jugar
                            </button>
                        </div>
                        <div className="hanoi-board">
                            {pegs.map((pegDisks, i) => (
                                <div
                                    key={i}
                                    className={`peg ${selectedPeg === i ? 'selected-peg' : ''}`}
                                    onClick={() => handlePegClick(i)}
                                >
                                    {pegDisks.map((diskSize, idx) => {
                                        const isTopAndSelected = selectedPeg === i && idx === pegDisks.length - 1;
                                        const widthPercent = 30 + (diskSize / currentConfig.disks) * 60;
                                        return (
                                            <div
                                                key={diskSize}
                                                className={`disk ${isTopAndSelected ? 'selected' : ''}`}
                                                style={{
                                                    width: `${widthPercent}%`,
                                                    backgroundColor: DISK_COLORS[diskSize - 1]
                                                }}
                                            >
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
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
                                <span>Intentos:</span> <strong style={{ color: 'var(--primary-color)' }}>{attemptsUsed} / {currentConfig.attempts}</strong>
                            </div>
                            <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                                <span>Puntaje:</span> <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{score} pts</strong>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                                <button
                                    className="no-rounded-button btn-primary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                    onClick={() => {
                                        if (pegs[1].length === currentConfig.disks || pegs[2].length === currentConfig.disks) {
                                            checkWin(pegs);
                                        } else {
                                            Swal.fire('Incompleto', 'Debes mover todos los discos a otro poste.', 'info');
                                        }
                                    }}
                                >
                                    <CheckSquare size={16} /> Validar Solución
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
                <p className="rules-text">Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.</p>
                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 2rem 0', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }} />

                <h1 className="selection-title" style={{ textAlign: 'center', color: '#0077b6', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>
                    Resumen de la Configuración
                </h1>

                <div className="summary-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
                            <div className="info-card-value">{gameDetailsWithDate.gameName || 'Torres de Hanoi'}</div>
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
                                {gameDetailsWithDate.description || 'Juego matemático compuesto por tres postes y discos de distinto tamaño.'}
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
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentConfig.timeLimit / 60} minuto{currentConfig.timeLimit / 60 !== 1 ? 's' : ''}</strong>
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
            <div className="hanoi-container">
                {view === 'home' && renderSetupScreen()}
                {view === 'play' && renderGameScreen()}
                {view === 'summary' && renderSummaryScreen()}
            </div>
        </>
    );
};

export default TorresHanoi;
