import { buildMissingMobileDownload } from '../../utils/missingMobileGames';
import { downloadGameArchive } from '../../utils/gameDownloadPackaging';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Timer, Trophy, Star, ArrowLeft, ArrowRight, Tag, Layers, FileText,
    Calendar, Monitor, Check, Shapes, Palette, Trash2, RotateCw, HelpCircle, Play, X, CheckSquare, Type, Puzzle, CheckCircle
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

    .art-container {
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

    .setup-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 500px;
      margin: 0 auto 3rem auto;
    }

    .setup-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .setup-group label {
      font-weight: 600;
      color: var(--secondary-color);
      font-size: 1.1rem;
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

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-danger {
      background-color: var(--wrong-color);
    }
    .btn-danger:hover:not(:disabled) {
      background-color: #dc2626;
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

    .config-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      border-top: 1px solid var(--medium-gray-color);
      padding-top: 1.5rem;
    }

    /* --- CATALOGO DE OBJETOS / FIGURAS --- */
    .objects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .object-item {
      border: 2px solid var(--medium-gray-color);
      border-radius: 0.5rem;
      padding: 0.75rem 0.5rem;
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
      min-height: 140px;
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
    .object-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--secondary-color);
      margin-top: 0.5rem;
      line-height: 1.1;
      word-break: break-word;
    }
    .check-icon {
      position: absolute;
      top: 6px;
      right: 6px;
      background: var(--correct-color);
      color: white;
      border-radius: 50%;
      padding: 2px;
      z-index: 5;
    }

    .config-screen {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* --- GAME LAYOUT --- */
    .geo-game-layout {
      display: grid;
      grid-template-columns: 250px 1fr 250px;
      gap: 1.5rem;
      width: 100%;
      align-items: start;
    }

    .geo-sidebar {
      background: white;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    }
    
    .geo-sidebar h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--secondary-color);
      border-bottom: 2px solid var(--light-gray-color);
      padding-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .geo-color-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    .color-swatch {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      transition: transform 0.1s;
    }
    .color-swatch:hover { transform: scale(1.1); }
    .color-swatch.active { border-color: var(--secondary-color); transform: scale(1.1); box-shadow: 0 0 5px rgba(0,0,0,0.3); }

    .geo-shape-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .shape-btn {
      background: var(--light-gray-color);
      border: 1px solid var(--medium-gray-color);
      border-radius: 0.5rem;
      padding: 0.75rem;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: background 0.2s;
    }
    .shape-btn:hover { background: #e2e8f0; }
    .shape-btn svg { width: 40px; height: 40px; }

    .geo-art-board {
      width: 100%;
      height: 600px;
      background: #f8fafc;
      border: 2px dashed var(--medium-gray-color);
      border-radius: var(--border-radius);
      position: relative;
      overflow: hidden;
    }

    .geo-stats-block {
      background: white;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      text-align: left;
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

    .geo-instructions-box {
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
      align-items: center; 
      gap: 0.5rem;
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
    .btn-success { background: #005f92; }
    .btn-success:hover:not(:disabled) { background: #004a73; transform: translateY(-1px); }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .info-card { background: white; padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem; }
    .info-card-header { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; width: 100%; }
    .info-card-value { font-size: 1.1rem; color: #334155; font-weight: 500; text-align: center; width: 100%; }
    .full-width { grid-column: 1 / -1; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

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

    @media (max-width: 900px) {
      .game-layout { grid-template-columns: 1fr; }
    }
  `}</style>
);

const DIFFICULTY_SETTINGS = {
    Básico: { timeLimit: 300, points: 10, figures: 3 },
    Avanzado: { timeLimit: 240, points: 20, figures: 5 }
};

const TARGETS = {
    Básico: ['Casa', 'Carro', 'Árbol', 'Barco', 'Cometa', 'Regalo', 'Bandera'],
    Avanzado: ['Tren', 'Castillo', 'Estrella', 'Cohete', 'Avión', 'Molino', 'Trofeo', 'OVNI']
};

const TARGET_EXAMPLES = {
    'Casa': [
        { type: 'square', color: '#f97316', x: 400, y: 350, rot: 0 },
        { type: 'triangle', color: '#ef4444', x: 400, y: 250, rot: 0 },
    ],
    'Carro': [
        { type: 'rectangle', color: '#ef4444', x: 400, y: 350, rot: 0 },
        { type: 'square', color: '#3b82f6', x: 375, y: 290, rot: 0 },
        { type: 'triangle', color: '#3b82f6', x: 445, y: 290, rot: 90 },
        { type: 'circle', color: '#111827', x: 350, y: 392, rot: 0 },
        { type: 'circle', color: '#111827', x: 450, y: 392, rot: 0 },
    ],
    'Árbol': [
        { type: 'rectangle', color: '#78350f', x: 400, y: 380, rot: 90 },
        { type: 'triangle', color: '#22c55e', x: 400, y: 255, rot: 0 },
        { type: 'triangle', color: '#22c55e', x: 400, y: 205, rot: 0 },
        { type: 'triangle', color: '#22c55e', x: 400, y: 155, rot: 0 },
    ],
    'Barco': [
        { type: 'rectangle', color: '#78350f', x: 400, y: 400, rot: 0 },
        { type: 'rectangle', color: '#64748b', x: 400, y: 275, rot: 90 },
        { type: 'triangle', color: '#ef4444', x: 445, y: 255, rot: 90 },
        { type: 'triangle', color: '#eab308', x: 358, y: 275, rot: 270 },
    ],
    'Cometa': [
        { type: 'rhombus', color: '#ef4444', x: 400, y: 230, rot: 0 },
        { type: 'triangle', color: '#eab308', x: 400, y: 335, rot: 180 },
        { type: 'triangle', color: '#3b82f6', x: 400, y: 420, rot: 0 }
    ],
    'Regalo': [
        { type: 'square', color: '#ef4444', x: 400, y: 355, rot: 0 },
        { type: 'rectangle', color: '#eab308', x: 400, y: 355, rot: [0, 90] },
        { type: 'rhombus', color: '#eab308', x: 400, y: 285, rot: [0, 90] }
    ],
    'Bandera': [
        { type: 'rectangle', color: '#78350f', x: 400, y: 380, rot: 90 },
        { type: 'triangle', color: '#22c55e', x: 488, y: 320, rot: 90 }
    ],
    'Tren': [
        { type: 'rectangle', color: '#ef4444', x: 425, y: 355, rot: 0 },
        { type: 'square', color: '#3b82f6', x: 325, y: 330, rot: 0 },
        { type: 'circle', color: '#111827', x: 325, y: 393, rot: 0 },
        { type: 'circle', color: '#111827', x: 400, y: 393, rot: 0 },
        { type: 'circle', color: '#111827', x: 475, y: 393, rot: 0 },
        { type: 'rectangle', color: '#78350f', x: 475, y: 280, rot: 90 },
        { type: 'triangle', color: '#eab308', x: 280, y: 355, rot: 270 }
    ],
    'Castillo': [
        { type: 'square', color: '#64748b', x: 400, y: 400, rot: 0 },
        { type: 'rectangle', color: '#64748b', x: 312.5, y: 412.5, rot: 90 },
        { type: 'rectangle', color: '#64748b', x: 487.5, y: 412.5, rot: 90 },
        { type: 'triangle', color: '#ef4444', x: 312.5, y: 287.5, rot: 0 },
        { type: 'triangle', color: '#ef4444', x: 487.5, y: 287.5, rot: 0 },
        { type: 'square', color: '#64748b', x: 400, y: 300, rot: 0 },
        { type: 'triangle', color: '#ef4444', x: 400, y: 200, rot: 0 }
    ],
    'Estrella': [
        { type: 'triangle', color: '#eab308', x: 400, y: 265, rot: 0 },
        { type: 'triangle', color: '#f97316', x: 435, y: 300, rot: 90 },
        { type: 'triangle', color: '#eab308', x: 400, y: 335, rot: 180 },
        { type: 'triangle', color: '#f97316', x: 365, y: 300, rot: 270 }
    ],
    'Cohete': [
        { type: 'triangle', color: '#ef4444', x: 400, y: 160, rot: 0 },
        { type: 'rectangle', color: '#3b82f6', x: 400, y: 272.5, rot: 90 },
        { type: 'triangle', color: '#ef4444', x: 340, y: 360, rot: [315, 45] },
        { type: 'triangle', color: '#ef4444', x: 460, y: 360, rot: [45, 315] },
        { type: 'rhombus', color: '#f97316', x: 400, y: 390, rot: [0, 90] }
    ],
    'Avión': [
        { type: 'rectangle', color: '#3b82f6', x: 400, y: 300, rot: 0 },
        { type: 'triangle', color: '#ef4444', x: 500, y: 300, rot: 90 },
        { type: 'rectangle', color: '#64748b', x: 400, y: 300, rot: 90 },
        { type: 'triangle', color: '#ef4444', x: 320, y: 250, rot: 0 },
        { type: 'triangle', color: '#ef4444', x: 320, y: 350, rot: 180 },
        { type: 'rhombus', color: '#eab308', x: 280, y: 300, rot: [0, 90] }
    ],
    'Molino': [
        { type: 'square', color: '#78350f', x: 400, y: 350, rot: 0 },
        { type: 'rectangle', color: '#78350f', x: 400, y: 420, rot: 90 },
        { type: 'triangle', color: '#ef4444', x: 400, y: 255, rot: 0 },
        { type: 'triangle', color: '#22c55e', x: 445, y: 300, rot: 90 },
        { type: 'triangle', color: '#eab308', x: 400, y: 345, rot: 180 },
        { type: 'triangle', color: '#3b82f6', x: 355, y: 300, rot: 270 }
    ],
    'Trofeo': [
        { type: 'rectangle', color: '#3b82f6', x: 400, y: 210, rot: 0 },
        { type: 'triangle', color: '#f97316', x: 310, y: 255, rot: 270 },
        { type: 'triangle', color: '#f97316', x: 490, y: 255, rot: 90 },
        { type: 'triangle', color: '#eab308', x: 400, y: 290, rot: 180 },
        { type: 'rectangle', color: '#64748b', x: 400, y: 370, rot: 90 },
        { type: 'rectangle', color: '#78350f', x: 400, y: 430, rot: 0 }
    ],
    'OVNI': [
        { type: 'circle', color: '#3b82f6', x: 400, y: 270, rot: 0 },
        { type: 'rectangle', color: '#64748b', x: 400, y: 320, rot: 0 },
        { type: 'rhombus', color: '#eab308', x: 320, y: 320, rot: [90, 0] },
        { type: 'rhombus', color: '#eab308', x: 480, y: 320, rot: [90, 0] },
        { type: 'triangle', color: '#22c55e', x: 350, y: 390, rot: 180 },
        { type: 'triangle', color: '#22c55e', x: 400, y: 390, rot: 180 },
        { type: 'triangle', color: '#22c55e', x: 450, y: 390, rot: 180 }
    ]
};

const PALETTE_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#d946ef', '#111827',
    '#64748b', '#78350f', '#f472b6', '#2dd4bf'
];

const SHAPE_DEFS = {
    circle: { label: 'Círculo', path: 'M -50,0 A 50,50 0 1,0 50,0 A 50,50 0 1,0 -50,0 Z', w: 100, h: 100 },
    square: { label: 'Cuadrado', path: 'M -50,-50 L 50,-50 L 50,50 L -50,50 Z', w: 100, h: 100 },
    rectangle: { label: 'Rectángulo', path: 'M -75,-37.5 L 75,-37.5 L 75,37.5 L -75,37.5 Z', w: 150, h: 75 },
    triangle: { label: 'Triángulo', path: 'M 0,-50 L 50,50 L -50,50 Z', w: 100, h: 100 },
    rhombus: { label: 'Rombo', path: 'M 0,-60 L 40,0 L 0,60 L -40,0 Z', w: 80, h: 120 }
};

// Tolerancias y comparación real de piezas contra la figura modelo
// (tipo, color, posición y rotación), usadas por el editor de vista previa.
const POSITION_TOLERANCE = 90;
const ROTATION_TOLERANCE = 35;
const ROTATION_SYMMETRY = { circle: 1, square: 90, rectangle: 180, rhombus: 180, triangle: 360 };

const rotationMatches = (shapeType, targetRot, actualRot) => {
    const period = ROTATION_SYMMETRY[shapeType] || 360;
    const diff = (((actualRot || 0) - (targetRot || 0)) % period + period) % period;
    const wrapped = Math.min(diff, period - diff);
    return wrapped <= ROTATION_TOLERANCE;
};

const checkSingleTargetRotationMatch = (shapeType, targetRot, actualRot) => {
    if (Array.isArray(targetRot)) {
        return targetRot.some(r => rotationMatches(shapeType, r, actualRot));
    }
    return rotationMatches(shapeType, targetRot, actualRot);
};

const isCreationCorrect = (targetName, shapes) => {
    const target = TARGET_EXAMPLES[targetName] || [];
    if (!shapes || shapes.length !== target.length) return false;

    // Centroid of target figure
    const targetCenterX = target.reduce((sum, t) => sum + t.x, 0) / target.length;
    const targetCenterY = target.reduce((sum, t) => sum + t.y, 0) / target.length;

    // Centroid of user's creation
    const userCenterX = shapes.reduce((sum, s) => sum + s.x, 0) / shapes.length;
    const userCenterY = shapes.reduce((sum, s) => sum + s.y, 0) / shapes.length;

    const offsetX = userCenterX - targetCenterX;
    const offsetY = userCenterY - targetCenterY;

    // Shift user shapes to align center of mass with target
    const normShapes = shapes.map(s => ({
        ...s,
        x: s.x - offsetX,
        y: s.y - offsetY
    }));

    const used = new Array(normShapes.length).fill(false);

    const backtrack = (ti) => {
        if (ti === target.length) return true;
        const t = target[ti];
        for (let i = 0; i < normShapes.length; i++) {
            if (used[i]) continue;
            const s = normShapes[i];
            if (s.type !== t.type) continue;
            if ((s.color || '').trim().toLowerCase() !== (t.color || '').trim().toLowerCase()) continue;
            const dx = s.x - t.x, dy = s.y - t.y;
            if (Math.sqrt(dx * dx + dy * dy) > POSITION_TOLERANCE) continue;
            if (!checkSingleTargetRotationMatch(t.type, t.rot || 0, s.rot || 0)) continue;
            used[i] = true;
            if (backtrack(ti + 1)) return true;
            used[i] = false;
        }
        return false;
    };

    return backtrack(0);
};

// Normaliza un texto: minúsculas, sin acentos, espacios -> guión bajo
const normalizeFileName = (str) =>
    (str || '')
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");

// Mapea el nombre de plataforma a su etiqueta en el ZIP
const platformLabel = (p) => ({ web: 'Web', android: 'Android', ios: 'iOS' }[String(p).toLowerCase()] || p);

const generateArtCode = (difficulty, targetObjects, gameDetails, selectedPlatforms) => {
    const config = DIFFICULTY_SETTINGS[difficulty];
    const titleText = gameDetails.gameName || 'Arte Geométrico';
    const authorName = gameDetails.authorName || 'No especificado';
    const version = gameDetails.version || '1.0.0';
    const gameDesc = gameDetails.description || 'Juego de arte geométrico: construye figuras con formas geométricas.';
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
        body { font-family: system-ui, -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 1200px; display: flex; flex-direction: column; }
        .game-layout { display: grid; grid-template-columns: 250px 1fr 250px; gap: 1.5rem; width: 100%; }
        @media (max-width: 900px) { .game-layout { grid-template-columns: 1fr; } }

        /* ── Animated Title ── */
        .game-title { text-align: center; font-size: 3rem; font-weight: 800; color: var(--secondary-color); margin-bottom: 1rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        @keyframes wave-animation { 0%, 40%, 100% { transform: translateY(0); } 20% { transform: translateY(-20px); } }

        /* ── Sidebar ── */
        .sidebar { background: white; border: 1px solid var(--medium-gray); border-radius: var(--border-radius); padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .sidebar h3 { margin: 0 0 0.75rem 0; font-size: 1.1rem; color: var(--secondary-color); border-bottom: 2px solid var(--light-gray); padding-bottom: 0.5rem; }

        /* ── Color palette ── */
        .color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
        .color-swatch { width: 100%; aspect-ratio: 1; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 0.15s; }
        .color-swatch.active { border-color: var(--secondary-color); transform: scale(1.15); }

        /* ── Shape buttons ── */
        .shape-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        .shape-btn { background: var(--light-gray); border: 1px solid var(--medium-gray); border-radius: 0.5rem; padding: 0.75rem; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: background 0.15s; }
        .shape-btn:hover { background: #e2e8f0; }
        .shape-btn svg { width: 40px; height: 40px; }

        /* ── Stats ── */
        .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }

        /* ── Art board ── */
        .art-board { width: 100%; height: 600px; background: #f8fafc; border: 2px dashed var(--medium-gray); border-radius: var(--border-radius); position: relative; overflow: hidden; touch-action: none; }

        /* ── Buttons ── */
        .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: var(--border-radius); cursor: pointer; font-weight: bold; color: white; transition: background 0.2s; font-size: 1rem; }
        .btn-primary { background: var(--primary-color); }
        .btn-primary:hover { background: #004b75; }
        .btn-secondary { background: var(--dark-gray); }
        .btn-secondary:hover { background: #374151; }
        .btn-danger { background: var(--wrong); }
        .btn-danger:hover { background: #dc2626; }

        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); color: white; border: none; border-radius: var(--border-radius); cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; min-width: 200px; }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .btn-exit { background: #111827; }
        .btn-exit:hover { background: #000000; }
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }

        /* ── Overlays ── */
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.97); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; transition: opacity 0.3s; padding: 20px; box-sizing: border-box; }
        .hidden { display: none !important; opacity: 0; pointer-events: none; }

        /* ── Countdown ── */
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        /* ── Info modal ── */
        .info-modal-content { background: white; padding: 2.5rem; border-radius: 1rem; max-width: 600px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; position: relative; }
        .info-header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .info-title { font-size: 1.8rem; color: var(--primary-color); margin: 0; font-weight: 800; }
        .info-subtitle { color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; }
        .info-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
        .info-item { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .info-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem; font-weight: 600; }
        .info-value { font-size: 1.1rem; color: #334155; font-weight: 500; }
        .info-desc { grid-column: 1 / -1; background: #fff; border: none; }
        .close-info-btn { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
        .close-info-btn:hover { color: var(--wrong); }

        /* ── Rules banner ── */
        .rules-banner { display: grid; grid-template-columns: 1fr; max-width: 700px; margin: 0 auto 1.5rem auto; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--border-radius); padding: 0.85rem 1.25rem; text-align: center; }
        .rules-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; margin-bottom: 0.25rem; display: block; }
        .rules-text { font-size: 1rem; color: #1e40af; font-weight: 500; }

        /* ── Swal animations ── */
        .swal-confetti { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        @keyframes bounceIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulseScoreGlow { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
        @keyframes pulseGreenGlow { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
    </style>
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- START SCREEN -->
    <div id="start-screen" class="overlay">
        <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; text-align: center; color: var(--secondary-color);">${titleText}</h1>
        <div style="background: #e0f2fe; color: #0369a1; padding: 0.5rem 1.5rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">
            Nivel: ${difficulty}
        </div>
      
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <button class="big-btn" onclick="startGameSequence()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Iniciar Juego
            </button>
            <button class="big-btn btn-info" onclick="toggleInfo(true)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Información
            </button>
        </div>
    </div>

    <!-- COUNTDOWN SCREEN -->
    <div id="countdown-screen" class="overlay hidden">
        <div id="countdown-display" class="countdown-number">5</div>
    </div>

    <!-- INFO MODAL -->
    <div id="info-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">${titleText}</h2>
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

    <!-- GAME UI -->
    <div class="container" id="game-ui" style="display:none;">
        <h2 class="game-title" id="main-title" style="margin-top: 0; display: flex; justify-content: center;"></h2>

        <div class="rules-banner">
            <span class="rules-label" id="rules-label">📋 Reglas básicas (Figura 1 de ${targetObjects.length})</span>
            <span class="rules-text">Observa la imagen que se muestra en el panel derecho, elige las formas geométricas necesarias y construye la figura de la imagen.</span>
        </div>

        <div class="game-layout">
            <div class="sidebar">
                <div>
                    <h3>🎨 Paleta de Colores</h3>
                    <div class="color-grid" id="color-grid"></div>
                </div>
                <div>
                    <h3>🔺 Formas</h3>
                    <div class="shape-list" id="shape-list"></div>
                </div>
            </div>

            <div class="art-board">
                <svg id="svgCanvas" viewBox="0 0 800 600" style="width: 100%; height: 100%; touch-action: none;">
                    <g id="canvas-pieces"></g>
                </svg>
            </div>

            <div class="sidebar">
                <div>
                    <h3>📊 Progreso (<span id="round-indicator">1</span>)</h3>
                    <div class="stats-item"><span>Objetivo:</span> <strong id="target-name"></strong></div>
                    <div style="width: 100%; height: 140px; background: #e2e8f0; border-radius: 0.5rem; margin-bottom: 1rem; overflow: hidden;">
                        <svg id="target-svg-preview" viewBox="200 100 400 400" style="width: 100%; height: 100%;"></svg>
                    </div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray); padding-top: 0.75rem; margin-top: 0.75rem;">
                        <span>Tiempo:</span> <strong id="timer" style="color: var(--primary-color); font-weight: bold;">00:00</strong>
                    </div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray); padding-top: 0.75rem; margin-top: 0.75rem;">
                        <span>Puntaje:</span> <strong id="score" style="color: var(--primary-color); font-size: 1.2rem;">0 pts</strong>
                    </div>
                </div>
                <div>
                    <h3>🛠 Herramientas</h3>
                    <button class="btn btn-primary" onclick="rotateSelected()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                        Rotar Selección
                    </button>
                    <button class="btn btn-primary" onclick="deleteSelected()" style="margin-top: 0.5rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
                        Eliminar
                    </button>
                    <button class="btn btn-primary" style="margin-top: 1.5rem;" onclick="validateCreation()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Validar Solución
                    </button>
                    <button class="btn btn-primary" style="margin-top: 0.5rem;" onclick="handleFinishGame()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        Finalizar Juego
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        const PALETTE_COLORS = ${JSON.stringify(PALETTE_COLORS)};
        const TARGET_OBJECTS = ${JSON.stringify(targetObjects)};
        const TARGET_EXAMPLES = ${JSON.stringify(TARGET_EXAMPLES)};
        const SHAPE_DEFS = ${JSON.stringify(SHAPE_DEFS)};

        const POSITION_TOLERANCE = 90;
        const ROTATION_TOLERANCE = 35;
        const ROTATION_SYMMETRY = { circle: 1, square: 90, rectangle: 180, rhombus: 180, triangle: 360 };

        function rotationMatches(shapeType, targetRot, actualRot) {
            const period = ROTATION_SYMMETRY[shapeType] || 360;
            const diff = (((actualRot || 0) - (targetRot || 0)) % period + period) % period;
            const wrapped = Math.min(diff, period - diff);
            return wrapped <= ROTATION_TOLERANCE;
        }

        function checkSingleTargetRotationMatch(shapeType, targetRot, actualRot) {
            if (Array.isArray(targetRot)) {
                return targetRot.some(r => rotationMatches(shapeType, r, actualRot));
            }
            return rotationMatches(shapeType, targetRot, actualRot);
        }

        function isCreationCorrect(targetName, shapes) {
            const target = TARGET_EXAMPLES[targetName] || [];
            if (!shapes || shapes.length !== target.length) return false;

            const targetCenterX = target.reduce((sum, t) => sum + t.x, 0) / target.length;
            const targetCenterY = target.reduce((sum, t) => sum + t.y, 0) / target.length;

            const userCenterX = shapes.reduce((sum, s) => sum + s.x, 0) / shapes.length;
            const userCenterY = shapes.reduce((sum, s) => sum + s.y, 0) / shapes.length;

            const offsetX = userCenterX - targetCenterX;
            const offsetY = userCenterY - targetCenterY;

            const normShapes = shapes.map(s => ({
                ...s,
                x: s.x - offsetX,
                y: s.y - offsetY
            }));

            const used = new Array(normShapes.length).fill(false);

            function backtrack(ti) {
                if (ti === target.length) return true;
                const t = target[ti];
                for (let i = 0; i < normShapes.length; i++) {
                    if (used[i]) continue;
                    const s = normShapes[i];
                    if (s.type !== t.type) continue;
                    if ((s.color || '').trim().toLowerCase() !== (t.color || '').trim().toLowerCase()) continue;
                    const dx = s.x - t.x, dy = s.y - t.y;
                    if (Math.sqrt(dx * dx + dy * dy) > POSITION_TOLERANCE) continue;
                    if (!checkSingleTargetRotationMatch(t.type, t.rot || 0, s.rot || 0)) continue;
                    used[i] = true;
                    if (backtrack(ti + 1)) return true;
                    used[i] = false;
                }
                return false;
            }

            return backtrack(0);
        }

        const state = {
            shapes: [],
            selectedId: null,
            currentColor: PALETTE_COLORS[0],
            currentShape: 'rect',
            score: 0,
            timeLeft: config.timeLimit,
            isPlaying: false,
            timerInterval: null,
            currentRound: 0,
            isDragging: false,
            dragOffsetX: 0,
            dragOffsetY: 0,
            nextId: 1,
        };

        function toggleInfo(show) {
            const el = document.getElementById('info-overlay');
            if (show) { el.classList.remove('hidden'); } else { el.classList.add('hidden'); }
        }

        function initTitle() {
            const el = document.getElementById('main-title');
            const text = "Juego de ${titleText}";
            el.innerHTML = text.split('').map((c, i) =>
                '<span style="animation-delay:' + (i * 0.05) + 's">' + (c === ' ' ? '&nbsp;' : c) + '</span>'
            ).join('');
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const d = document.getElementById('countdown-display');
            d.innerText = count;
            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    d.innerText = count;
                    d.style.animation = 'none';
                    void d.offsetWidth;
                    d.style.animation = 'popIn 0.5s ease-out';
                } else {
                    clearInterval(interval);
                    document.getElementById('countdown-screen').classList.add('hidden');
                    startGame();
                }
            }, 1000);
        }

        function exitGame() {
            window.close();
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
        }

        function formatTime(s) {
            const m = Math.floor(s / 60);
            const secs = s % 60;
            return (m < 10 ? '0' : '') + m + ':' + (secs < 10 ? '0' : '') + secs;
        }

        function initUI() {
            const colorGrid = document.getElementById('color-grid');
            colorGrid.innerHTML = '';
            PALETTE_COLORS.forEach(color => {
                const div = document.createElement('div');
                div.className = 'color-swatch' + (color === state.currentColor ? ' active' : '');
                div.style.background = color;
                div.onclick = () => {
                    state.currentColor = color;
                    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                    div.classList.add('active');
                    if (state.selectedId !== null) {
                        const sh = state.shapes.find(s => s.id === state.selectedId);
                        if (sh) {
                            sh.color = color;
                            renderCanvas();
                        }
                    }
                };
                colorGrid.appendChild(div);
            });

            const shapeList = document.getElementById('shape-list');
            shapeList.innerHTML = '';
            Object.keys(SHAPE_DEFS).forEach(type => {
                const def = SHAPE_DEFS[type];
                const btn = document.createElement('div');
                btn.className = 'shape-btn';
                btn.title = def.label;
                btn.innerHTML = \`<svg viewBox="-100 -100 200 200"><path d="\${def.path}" fill="\${state.currentColor}"/></svg>\`;
                btn.onclick = () => { addShape(type); };
                shapeList.appendChild(btn);
            });
        }

        function addShape(type) {
            if (!state.isPlaying) return;
            const newShape = {
                id: state.nextId++,
                type: type,
                color: state.currentColor,
                x: 400,
                y: 300,
                rot: 0
            };
            state.shapes.push(newShape);
            state.selectedId = newShape.id;
            renderCanvas();
        }

        function getSvgPoint(clientX, clientY) {
            const svg = document.getElementById('svgCanvas');
            if (!svg) return { x: clientX, y: clientY };
            const pt = svg.createSVGPoint();
            pt.x = clientX;
            pt.y = clientY;
            return pt.matrixTransform(svg.getScreenCTM().inverse());
        }

        let dragData = null;

        function updateSelectionStyles() {
            const group = document.getElementById('canvas-pieces');
            if (!group) return;
            Array.from(group.children).forEach(el => {
                const isSelected = String(el.dataset.shapeId) === String(state.selectedId);
                if (isSelected) {
                    el.setAttribute('stroke', '#111827');
                    el.setAttribute('stroke-width', '4');
                    el.setAttribute('stroke-dasharray', '8,4');
                } else {
                    el.setAttribute('stroke', 'none');
                    el.setAttribute('stroke-width', '0');
                }
            });
        }

        function renderCanvas() {
            const group = document.getElementById('canvas-pieces');
            group.innerHTML = '';
            state.shapes.forEach(sh => {
                const def = SHAPE_DEFS[sh.type];
                if (!def) return;
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', def.path);
                path.setAttribute('transform', \`translate(\${sh.x}, \${sh.y}) rotate(\${sh.rot || 0})\`);
                path.setAttribute('fill', sh.color);
                path.style.cursor = 'grab';
                path.dataset.shapeId = sh.id;

                if (sh.id === state.selectedId) {
                    path.setAttribute('stroke', '#111827');
                    path.setAttribute('stroke-width', '4');
                    path.setAttribute('stroke-dasharray', '8,4');
                } else {
                    path.setAttribute('stroke', 'none');
                    path.setAttribute('stroke-width', '0');
                }

                path.addEventListener('pointerdown', (e) => {
                    if (!state.isPlaying) return;
                    e.preventDefault();
                    e.stopPropagation();
                    state.selectedId = sh.id;
                    state.currentColor = sh.color;
                    updateSelectionStyles();

                    path.setPointerCapture(e.pointerId);
                    const pt = getSvgPoint(e.clientX, e.clientY);
                    dragData = {
                        id: sh.id,
                        el: path,
                        startX: pt.x,
                        startY: pt.y,
                        pieceStartX: sh.x,
                        pieceStartY: sh.y,
                        moved: false,
                        time: Date.now()
                    };
                });

                path.addEventListener('pointermove', (e) => {
                    if (!dragData || dragData.id !== sh.id || !state.isPlaying) return;
                    const pt = getSvgPoint(e.clientX, e.clientY);
                    const dx = pt.x - dragData.startX;
                    const dy = pt.y - dragData.startY;
                    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                        dragData.moved = true;
                    }
                    sh.x = dragData.pieceStartX + dx;
                    sh.y = dragData.pieceStartY + dy;
                    path.setAttribute('transform', \`translate(\${sh.x}, \${sh.y}) rotate(\${sh.rot || 0})\`);
                });

                path.addEventListener('pointerup', (e) => {
                    if (!dragData || dragData.id !== sh.id) return;
                    path.releasePointerCapture(e.pointerId);
                    const moved = dragData.moved;
                    const dt = Date.now() - dragData.time;
                    dragData = null;

                    if (!moved && dt < 300) {
                        sh.rot = ((sh.rot || 0) + 45) % 360;
                        renderCanvas();
                    }
                });

                group.appendChild(path);
            });
        }

        function renderTargetPreview() {
            const target = TARGET_OBJECTS[state.currentRound];
            document.getElementById('target-name').innerText = target;
            document.getElementById('target-name-instructions') && (document.getElementById('target-name-instructions').innerText = target);
            document.getElementById('round-indicator').innerText = \`\${state.currentRound + 1} / \${TARGET_OBJECTS.length}\`;
            if (document.getElementById('rules-label')) {
                document.getElementById('rules-label').innerText = \`📋 Reglas básicas (Figura \${state.currentRound + 1} de \${TARGET_OBJECTS.length})\`;
            }
            const svgPreview = document.getElementById('target-svg-preview');
            svgPreview.innerHTML = '';
            const examples = TARGET_EXAMPLES[target] || [];
            examples.forEach(s => {
                const def = SHAPE_DEFS[s.type];
                if (def) {
                    const displayRot = Array.isArray(s.rot) ? s.rot[0] : (s.rot || 0);
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', def.path);
                    path.setAttribute('transform', \`translate(\${s.x}, \${s.y}) rotate(\${displayRot})\`);
                    path.setAttribute('fill', s.color);
                    svgPreview.appendChild(path);
                }
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            const svgEl = document.getElementById('svgCanvas');
            if (svgEl) {
                svgEl.addEventListener('pointerdown', (e) => {
                    if (e.target.tagName === 'svg' || e.target.id === 'svgCanvas' || e.target.id === 'canvas-pieces') {
                        state.selectedId = null;
                        renderCanvas();
                    }
                });
            }
        });

        function rotateSelected() {
            const sh = state.shapes.find(s => s.id === state.selectedId);
            if (sh) { sh.rot = ((sh.rot || 0) + 45) % 360; renderCanvas(); }
        }

        function deleteSelected() {
            state.shapes = state.shapes.filter(s => s.id !== state.selectedId);
            state.selectedId = null;
            renderCanvas();
        }

        function handleFinishGame() {
            Swal.fire({
                title: '¿Deseas finalizar el juego?',
                text: \`Tu puntaje actual es de \${state.score} pts.\`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#4b5563',
                confirmButtonText: 'Sí, finalizar',
                cancelButtonText: 'Seguir Jugando'
            }).then((result) => {
                if (result.isConfirmed) exitGame();
            });
        }

        function validateCreation() {
            const targetName = TARGET_OBJECTS[state.currentRound];
            const targetShapes = TARGET_EXAMPLES[targetName] || [];
            const targetShapeCount = targetShapes.length;

            if (state.shapes.length < targetShapeCount) {
                Swal.fire({
                    title: 'Creación Incompleta',
                    text: 'Esta figura requiere ' + targetShapeCount + ' piezas geométricas (tienes ' + state.shapes.length + ').',
                    icon: 'warning',
                    confirmButtonColor: '#0077b6'
                });
                return;
            }

            if (state.shapes.length > targetShapeCount) {
                Swal.fire({
                    title: 'Piezas adicionales',
                    text: 'Esta figura requiere exactamente ' + targetShapeCount + ' piezas (tienes ' + state.shapes.length + '). Elimina las sobrantes.',
                    icon: 'warning',
                    confirmButtonColor: '#0077b6'
                });
                return;
            }

            if (!isCreationCorrect(targetName, state.shapes)) {
                Swal.fire({
                    title: 'No coincide con el modelo',
                    text: 'Revisa el tipo, color, posición y rotación de cada pieza. Compara tu creación con la figura de referencia.',
                    icon: 'error',
                    confirmButtonColor: '#0077b6',
                    confirmButtonText: 'Reintentar'
                });
                return;
            }
            clearInterval(state.timerInterval);
            state.isPlaying = false;
            state.score += config.points;
            document.getElementById('score').innerText = state.score + ' pts';

            const isLastRound = state.currentRound === TARGET_OBJECTS.length - 1;

            Swal.fire({
                title: '¡Creación Registrada!',
                html: \`
                  <p style="font-size: 1.1rem; margin-bottom: 0;">¡Excelente trabajo artístico!</p>
                  <div style="font-size: 1.1rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGreenGlow 1.5s infinite;">✨ +\${config.points} Puntos</div>
                \`,
                icon: 'success',
                confirmButtonText: isLastRound ? 'Ver Resultados' : 'Siguiente Figura',
                confirmButtonColor: '#0077b6'
            }).then(() => {
                if (isLastRound) {
                    Swal.fire({
                        title: '¡Juego Completado!',
                        html: \`
                          <div class="swal-confetti">
                            <span style="font-size: 3rem;">🌟</span>
                            <span style="font-size: 3rem;">🏆</span>
                            <span style="font-size: 3rem;">🌟</span>
                          </div>
                          <p style="font-size: 1.1rem; margin-bottom: 0;">Has construido todas las figuras. Ganaste <strong>\${state.score}</strong> puntos.</p>
                          <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                            Puntaje Total: \${state.score} pts
                          </div>
                        \`,
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#0077b6',
                        cancelButtonColor: '#0077b6',
                        confirmButtonText: 'Terminar Juego',
                        cancelButtonText: 'Volver a Jugar',
                        reverseButtons: true,
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            exitGame();
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            startGame();
                        }
                    });
                } else {
                    state.currentRound++;
                    startRound();
                }
            });
        }

        function startGame() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('game-ui').style.display = 'flex';
            initTitle();
            state.score = 0;
            state.currentRound = 0;
            document.getElementById('score').innerText = '0 pts';
            startRound();
        }

        function startRound() {
            state.shapes = [];
            state.selectedId = null;
            state.timeLeft = config.timeLimit;
            state.isPlaying = true;

            initUI();
            renderTargetPreview();
            renderCanvas();

            if (state.timerInterval) clearInterval(state.timerInterval);
            document.getElementById('timer').innerText = formatTime(state.timeLeft);

            state.timerInterval = setInterval(() => {
                state.timeLeft--;
                document.getElementById('timer').innerText = formatTime(state.timeLeft);
                if (state.timeLeft <= 0) {
                    clearInterval(state.timerInterval);
                    state.isPlaying = false;
                    Swal.fire({
                        title: 'Tiempo agotado',
                        text: 'No lograste terminar a tiempo.',
                        icon: 'error',
                        confirmButtonColor: '#0077b6',
                        confirmButtonText: state.currentRound === TARGET_OBJECTS.length - 1 ? 'Ver Resultados' : 'Siguiente Figura'
                    }).then(() => {
                        if (state.currentRound === TARGET_OBJECTS.length - 1) {
                            Swal.fire({
                                title: '¡Juego Completado!',
                                html: \`
                                  <div class="swal-confetti">
                                    <span style="font-size: 3rem;">🌟</span>
                                    <span style="font-size: 3rem;">🏆</span>
                                    <span style="font-size: 3rem;">🌟</span>
                                  </div>
                                  <p style="font-size: 1.1rem; margin-bottom: 0;">El juego ha terminado. Lograste <strong>\${state.score}</strong> puntos.</p>
                                  <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                                    Puntaje Total: \${state.score} pts
                                  </div>
                                \`,
                                icon: 'success',
                                showCancelButton: true,
                                confirmButtonColor: '#0077b6',
                                cancelButtonColor: '#0077b6',
                                confirmButtonText: 'Terminar Juego',
                                cancelButtonText: 'Volver a Jugar',
                                reverseButtons: true,
                                allowOutsideClick: false
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    exitGame();
                                } else if (result.dismiss === Swal.DismissReason.cancel) {
                                    startGame();
                                }
                            });
                        } else {
                            state.currentRound++;
                            startRound();
                        }
                    });
                }
            }, 1000);
        }
    </script>
</body>
</html>`;
};

const GeometricArt = () => {
    const [view, setView] = useState('home');
    const [difficulty, setDifficulty] = useState('');
    const [targetObjects, setTargetObjects] = useState([]);
    const [currentRound, setCurrentRound] = useState(0);

    const [shapes, setShapes] = useState([]);
    const [currentColor, setCurrentColor] = useState(PALETTE_COLORS[0]);
    const [selectedId, setSelectedId] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const timerRef = useRef(null);
    const svgRef = useRef(null);
    const dragRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const jsZipReady = true;

    const MOCK_DATA = {
        selectedAreas: ['arts', 'math'],
        selectedSkills: ['Creatividad', 'Geometría'],
        gameDetails: { gameName: 'Arte Geométrico', description: 'Crea representaciones visuales usando formas geométricas.', version: '1.0.0', date: null },
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

    const currentConfig = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.Básico;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);



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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                clearInterval(timerRef.current);
                setIsPlaying(false);
                goToHome();
            }
        });
    };

    const maxFigures = difficulty ? (DIFFICULTY_SETTINGS[difficulty]?.figures || 0) : 0;
    const isSelectionValid = difficulty && targetObjects.length === maxFigures;

    const handleDifficultyChange = (newLevel) => {
        setDifficulty(newLevel);
        setTargetObjects([]);
    };

    const handleTargetToggle = (figName) => {
        if (!difficulty) return;
        const max = DIFFICULTY_SETTINGS[difficulty]?.figures || 0;
        if (targetObjects.includes(figName)) {
            setTargetObjects(prev => prev.filter(t => t !== figName));
        } else {
            if (targetObjects.length < max) {
                setTargetObjects(prev => [...prev, figName]);
            } else {
                Swal.fire({
                    title: 'Límite alcanzado',
                    text: `Solo puedes seleccionar un máximo de ${max} figuras para el nivel ${difficulty}.`,
                    icon: 'info',
                    confirmButtonColor: '#0077b6',
                    confirmButtonText: 'Entendido'
                });
            }
        }
    };

    const startNewGame = () => {
        if (!difficulty) return;
        const activeLevel = difficulty;
        const config = DIFFICULTY_SETTINGS[activeLevel] || DIFFICULTY_SETTINGS.Básico;

        if (targetObjects.length !== config.figures) return;

        setCurrentRound(0);

        setView('play');
        setShapes([]);
        setSelectedId(null);
        setTimeLeft(config.timeLimit);
        setScore(0);
        setIsPlaying(true);
    };

    const startRound = (timeLim) => {
        setShapes([]);
        setSelectedId(null);
        setTimeLeft(timeLim);
        setIsPlaying(true);
    };

    const handleTimeout = () => {
        setIsPlaying(false);
        Swal.fire({
            title: 'Tiempo agotado',
            text: 'No lograste terminar a tiempo.',
            icon: 'error',
            confirmButtonColor: '#0077b6',
            confirmButtonText: 'Siguiente Figura'
        }).then(() => {
            if (currentRound === targetObjects.length - 1) {
                Swal.fire({
                    title: '¡Juego Completado!',
                    html: `
                      <div class="swal-confetti">
                        <span style="font-size: 3rem;">🌟</span>
                        <span style="font-size: 3rem;">🏆</span>
                        <span style="font-size: 3rem;">🌟</span>
                      </div>
                      <p style="font-size: 1.1rem; margin-bottom: 0;">El juego ha terminado. Lograste <strong>${score}</strong> puntos.</p>
                      <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                        Puntaje Total: ${score}
                      </div>
                    `,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonColor: '#0077b6',
                    cancelButtonColor: '#0077b6',
                    confirmButtonText: 'Ver Resultados',
                    cancelButtonText: 'Volver a Jugar',
                    reverseButtons: true,
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        goToSummary();
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        startNewGame();
                    }
                });
            } else {
                setCurrentRound(prev => prev + 1);
                startRound(currentConfig.timeLimit);
            }
        });
    };

    const validateCreation = () => {
        const targetName = targetObjects[currentRound];
        const targetShapes = TARGET_EXAMPLES[targetName] || [];
        const targetShapeCount = targetShapes.length;

        if (shapes.length < targetShapeCount) {
            Swal.fire({
                title: 'Creación Incompleta',
                text: `Esta figura requiere ${targetShapeCount} piezas geométricas (tienes ${shapes.length}).`,
                icon: 'warning',
                confirmButtonColor: '#0077b6'
            });
            return;
        }

        if (shapes.length > targetShapeCount) {
            Swal.fire({
                title: 'Piezas adicionales',
                text: `Esta figura requiere exactamente ${targetShapeCount} piezas (tienes ${shapes.length}). Elimina las sobrantes.`,
                icon: 'warning',
                confirmButtonColor: '#0077b6'
            });
            return;
        }

        if (!isCreationCorrect(targetName, shapes)) {
            Swal.fire({
                title: 'No coincide con el modelo',
                text: 'Revisa el tipo, color, posición y rotación de cada pieza. Compara tu creación con la figura de referencia.',
                icon: 'error',
                confirmButtonColor: '#0077b6',
                confirmButtonText: 'Reintentar'
            });
            return;
        }
        clearInterval(timerRef.current);
        setIsPlaying(false);

        const newScore = score + currentConfig.points;
        setScore(newScore);

        const isLastRound = currentRound === targetObjects.length - 1;

        Swal.fire({
            title: '¡Creación Registrada!',
            html: `
              <p style="font-size: 1.1rem; margin-bottom: 0;">¡Excelente trabajo artístico!</p>
              <div style="font-size: 1.1rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGreenGlow 1.5s infinite;">✨ +${currentConfig.points} Puntos</div>
            `,
            icon: 'success',
            confirmButtonText: isLastRound ? 'Ver Resultados' : 'Siguiente Figura',
            confirmButtonColor: '#0077b6'
        }).then(() => {
            if (isLastRound) {
                Swal.fire({
                    title: '¡Juego Completado!',
                    html: `
                      <div class="swal-confetti">
                        <span style="font-size: 3rem;">🌟</span>
                        <span style="font-size: 3rem;">🏆</span>
                        <span style="font-size: 3rem;">🌟</span>
                      </div>
                      <p style="font-size: 1.1rem; margin-bottom: 0;">Has construido todas las figuras. Ganaste <strong>${newScore}</strong> puntos.</p>
                      <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                        Puntaje Total: ${newScore}
                      </div>
                    `,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonColor: '#0077b6',
                    cancelButtonColor: '#0077b6',
                    confirmButtonText: 'Ver Resultados',
                    cancelButtonText: 'Volver a Jugar',
                    reverseButtons: true,
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        goToSummary();
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        startNewGame();
                    }
                });
            } else {
                setCurrentRound(prev => prev + 1);
                startRound(currentConfig.timeLimit);
            }
        });
    };

    const addShape = (type) => {
        if (!isPlaying) return;
        const newShape = {
            id: Date.now(),
            type,
            color: currentColor,
            x: 400,
            y: 300,
            rot: 0
        };
        setShapes(prev => [...prev, newShape]);
        setSelectedId(newShape.id);
    };

    const deleteSelected = () => {
        if (!selectedId) return;
        setShapes(prev => prev.filter(s => s.id !== selectedId));
        setSelectedId(null);
    };

    const rotateSelected = () => {
        if (!selectedId) return;
        setShapes(prev => prev.map(s => s.id === selectedId ? { ...s, rot: (s.rot + 45) % 360 } : s));
    };

    const getSvgPoint = (clientX, clientY) => {
        const svg = svgRef.current;
        if (!svg) return { x: clientX, y: clientY };
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
    };

    const onPointerDown = (e, shape) => {
        if (!isPlaying) return;
        e.preventDefault();
        e.stopPropagation();
        setSelectedId(shape.id);
        setCurrentColor(shape.color);

        e.target.setPointerCapture(e.pointerId);
        const pt = getSvgPoint(e.clientX, e.clientY);
        dragRef.current = {
            id: shape.id,
            startX: pt.x,
            startY: pt.y,
            pieceStartX: shape.x,
            pieceStartY: shape.y,
            moved: false,
            time: Date.now()
        };
    };

    const onPointerMove = (e) => {
        const currentDrag = dragRef.current;
        if (!currentDrag || !isPlaying) return;

        const pt = getSvgPoint(e.clientX, e.clientY);
        const dx = pt.x - currentDrag.startX;
        const dy = pt.y - currentDrag.startY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            currentDrag.moved = true;
        }

        setShapes(prev => prev.map(s =>
            s.id === currentDrag.id ? { ...s, x: currentDrag.pieceStartX + dx, y: currentDrag.pieceStartY + dy } : s
        ));
    };

    const onPointerUp = (e) => {
        if (!dragRef.current || !isPlaying) return;
        e.target.releasePointerCapture(e.pointerId);

        const drag = dragRef.current;
        dragRef.current = null;

        if (!drag.moved && (Date.now() - drag.time) < 300) {
            // Click to Rotate
            setShapes(prev => prev.map(s =>
                s.id === drag.id ? { ...s, rot: (s.rot + 45) % 360 } : s
            ));
        }
    };

    const handleCanvasClick = (e) => {
        if (e.target.tagName === 'svg') {
            setSelectedId(null);
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

    const handleSmartDownload = async () => { if (isGenerating) return; setIsGenerating(true); setProgress(10); await generateAndDownloadZip(); };

    const generateAndDownloadZip = async () => {
        try {
            setStatusText('Preparando juego y configuración...');
            const result = await buildMissingMobileDownload({
                slug: 'geometric-art', details: gameDetails, platforms: selectedPlatforms,
                options: { nivel: difficulty, figuras: targetObjects }, htmlContent: generateArtCode(difficulty, targetObjects, gameDetails, selectedPlatforms), webAssets: [],
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
                    {'Juego de Geometric Art'.split('').map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>

                {/* Imagen del juego con efectos, centrada debajo del título */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {gameIcon ? (
                        <img src={gameIcon} alt="Arte Geométrico" className="game-preview-image" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <div className="game-image-placeholder">📐🎨</div>
                    )}
                    <span className="game-info-badge">Arte y Creatividad</span>
                </div>

                <div className="rules-banner">
                    <h2><HelpCircle size={22} /> Arte Geométrico</h2>
                    <p>
                        Observa la imagen que se muestra en el panel derecho, elige las formas geométricas necesarias y construye la figura de la imagen.
                    </p>
                </div>

                <div className="difficulty-select-wrapper" style={{ flexDirection: 'column', paddingBottom: '2rem', borderBottom: '1px solid var(--medium-gray-color)', display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                    <label style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--secondary-color)' }}>Selecciona el nivel de dificultad:</label>
                    <select
                        id="difficulty-select"
                        className="custom-select"
                        style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}
                        value={difficulty}
                        onChange={(e) => handleDifficultyChange(e.target.value)}
                    >
                        <option value="" disabled>Selecciona un nivel...</option>
                        {Object.keys(DIFFICULTY_SETTINGS).map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>

                {difficulty && (
                    <div style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--medium-gray-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--secondary-color)' }}>Catálogo de Figuras</h3>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: targetObjects.length === maxFigures ? 'var(--primary-color)' : 'var(--dark-gray-color)' }}>
                                Seleccionadas: {targetObjects.length}/{maxFigures}
                            </div>
                        </div>

                        <div className="objects-grid">
                            {(TARGETS[difficulty] || []).map(figName => {
                                const isSelected = targetObjects.includes(figName);
                                return (
                                    <div
                                        key={figName}
                                        className={`object-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleTargetToggle(figName)}
                                    >
                                        {isSelected && <Check size={16} className="check-icon" />}
                                        <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '0.375rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg viewBox="200 100 400 400" style={{ width: '100%', height: '100%' }}>
                                                {TARGET_EXAMPLES[figName]?.map((s, i) => {
                                                    const displayRot = Array.isArray(s.rot) ? s.rot[0] : (s.rot || 0);
                                                    return (
                                                        <path
                                                            key={i}
                                                            d={SHAPE_DEFS[s.type].path}
                                                            transform={`translate(${s.x}, ${s.y}) rotate(${displayRot})`}
                                                            fill={s.color}
                                                        />
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                        <div className="object-name">{figName}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="catalog-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--medium-gray-color)' }}>
                    <button className="no-rounded-button btn-primary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} /> Anterior
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
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
            </div>
        );
    };

    const renderGameScreen = () => (
        <div className="game-screen">
            <div className="game-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {'Juego de Geometric Art'.split('').map((char, index) => (
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
                    📋 Reglas básicas (Figura {currentRound + 1} de {targetObjects.length})
                </span>
                <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>
                    Observa la imagen que se muestra en el panel derecho, elige las formas geométricas necesarias y construye la figura de la imagen.
                </span>
            </div>

            <div className="geo-game-layout">
                <div className="geo-sidebar">
                    <div>
                        <h3><Palette size={18} /> Colores</h3>
                        <div className="geo-color-grid">
                            {PALETTE_COLORS.map(color => (
                                <div
                                    key={color}
                                    className={`color-swatch ${currentColor === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => {
                                        setCurrentColor(color);
                                        if (selectedId) {
                                            setShapes(prev => prev.map(s => s.id === selectedId ? { ...s, color } : s));
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3><Shapes size={18} /> Formas</h3>
                        <div className="geo-shape-list">
                            {Object.entries(SHAPE_DEFS).map(([type, def]) => (
                                <div key={type} className="shape-btn" onClick={() => addShape(type)} title={def.label}>
                                    <svg viewBox="-100 -100 200 200">
                                        <path d={def.path} fill={currentColor} />
                                    </svg>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="geo-art-board">
                    <svg
                        ref={svgRef}
                        viewBox="0 0 800 600"
                        style={{ width: '100%', height: '100%', touchAction: 'none' }}
                        onPointerDown={handleCanvasClick}
                    >
                        {shapes.map(s => (
                            <path
                                key={s.id}
                                d={SHAPE_DEFS[s.type].path}
                                transform={`translate(${s.x}, ${s.y}) rotate(${s.rot})`}
                                fill={s.color}
                                stroke={selectedId === s.id ? '#111827' : 'none'}
                                strokeWidth={selectedId === s.id ? '4' : '0'}
                                strokeDasharray={selectedId === s.id ? '8,4' : 'none'}
                                onPointerDown={(e) => onPointerDown(e, s)}
                                onPointerMove={onPointerMove}
                                onPointerUp={onPointerUp}
                                style={{ cursor: 'grab' }}
                            />
                        ))}
                    </svg>
                </div>

                <div className="geo-sidebar">
                    <div className="geo-stats-block" style={{ padding: 0, border: 'none', boxShadow: 'none' }}>
                        <h3 style={{ margin: 0, paddingBottom: '0.5rem', borderBottom: '1px solid var(--medium-gray-color)' }}>
                            Progreso ({currentRound + 1}/{targetObjects.length})
                        </h3>
                        <div style={{ padding: '1rem 0' }}>
                            <div style={{ marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                                <strong>Objetivo:</strong> {targetObjects[currentRound]}
                            </div>
                            <div style={{ width: '100%', height: '140px', background: '#e2e8f0', borderRadius: '0.5rem', marginBottom: '1rem', overflow: 'hidden' }}>
                                <svg viewBox="200 100 400 400" style={{ width: '100%', height: '100%' }}>
                                    {TARGET_EXAMPLES[targetObjects[currentRound]]?.map((s, i) => {
                                        const displayRot = Array.isArray(s.rot) ? s.rot[0] : (s.rot || 0);
                                        return (
                                            <path
                                                key={i}
                                                d={SHAPE_DEFS[s.type].path}
                                                transform={`translate(${s.x}, ${s.y}) rotate(${displayRot})`}
                                                fill={s.color}
                                            />
                                        );
                                    })}
                                </svg>
                            </div>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                <strong>Tiempo:</strong> <span style={{ color: timeLeft <= 10 ? 'var(--wrong-color)' : 'inherit', fontWeight: timeLeft <= 10 ? 'bold' : 'normal' }}>{formatTime(timeLeft)} s</span>
                            </div>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                <strong>Puntaje:</strong> {score}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="no-rounded-button btn-primary" style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.875rem' }} onClick={rotateSelected} disabled={!selectedId}>
                            <RotateCw size={14} /> Rotar
                        </button>
                        <button className="no-rounded-button btn-primary" style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.875rem' }} onClick={deleteSelected} disabled={!selectedId}>
                            <Trash2 size={14} /> Eliminar
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                        <button className="no-rounded-button btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={validateCreation}>
                            <CheckSquare size={16} /> Validar Solución
                        </button>
                        <button className="no-rounded-button btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleFinishGame}>
                            <X size={16} /> Finalizar Juego
                        </button>
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
                <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1rem', fontSize: '1.1rem' }}>Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.</p>
                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 2rem 0', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }} />

                <h1 className="selection-title" style={{ textAlign: 'center', color: '#0077b6', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>Resumen de la Configuración</h1>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
                            <div className="info-card-value">{gameDetails.gameName || 'Arte Geométrico'}</div>
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
                                {gameDetails.description || 'Crea representaciones visuales usando formas geométricas.'}
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
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{difficulty || 'Básico'}</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Shapes size={18} /> Figuras a construir:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentConfig?.figures || 3} figuras</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Timer size={18} /> Tiempo por figura:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{((currentConfig?.timeLimit || 300) / 60)} minuto{((currentConfig?.timeLimit || 300) / 60) !== 1 ? 's' : ''}</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Star size={18} /> Puntaje por figura:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentConfig?.points || 10} pts</strong>
                        </div>
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <button className="no-rounded-button btn-primary" onClick={goToHome} disabled={isGenerating}
                            style={{ opacity: isGenerating ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s', border: 'none', background: '#0077b6', color: 'white', fontSize: '1rem' }}>
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
                            {selectedPlatforms?.some(p => (p || '').toLowerCase() === 'web') && (
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

                    {/* Botón inteligente */}
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
                            fontWeight: '700', letterSpacing: '0.02em',
                            background: '#0077b6', color: 'white', border: 'none', borderRadius: '0.75rem'
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
        <>
            <Style />
            <div className="art-container">
                {view === 'home' && renderSetupScreen()}
                {view === 'play' && renderGameScreen()}
                {view === 'summary' && renderSummaryScreen()}
            </div>
        </>
    );
};

export default GeometricArt;
