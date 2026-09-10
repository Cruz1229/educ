import { buildMissingMobileDownload } from '../../utils/missingMobileGames';
import { downloadGameArchive } from '../../utils/gameDownloadPackaging';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Timer, Trophy, Star, ArrowLeft, ArrowRight, Tag, Layers, FileText,
    Calendar, Monitor, Shapes, HelpCircle, CheckCircle, X, CheckSquare, Type, Puzzle, Check
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

    .tangram-container {
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

    .catalog-actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid var(--medium-gray-color);
    }

    /* --- ENHANCED CATALOG GRID --- */
    .objects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1.25rem;
      margin-top: 1rem;
    }
    .object-item {
      border: 2px solid #e2e8f0;
      border-radius: var(--border-radius);
      padding: 0.85rem 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      position: relative;
      box-shadow: 0 2px 4px rgba(0,0,0,0.03);
    }
    .object-item:hover {
      border-color: var(--primary-color);
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 10px 20px -5px rgba(0, 119, 182, 0.2);
    }
    .object-item.selected {
      border-color: var(--primary-color);
      background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
      box-shadow: 0 4px 12px rgba(0, 119, 182, 0.25);
    }
    .check-icon {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--primary-color);
      color: white;
      border-radius: 50%;
      padding: 3px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .object-thumb-box {
      width: 110px;
      height: 110px;
      background: #ffffff;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .object-item:hover .object-thumb-box {
      transform: scale(1.04);
    }
    .object-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--secondary-color);
      text-align: center;
    }
    .object-category-tag {
      font-size: 0.72rem;
      font-weight: 600;
      color: #0284c7;
      background: #e0f2fe;
      padding: 2px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
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
      gap: 1rem;
      align-items: center;
    }

    .tangram-board {
      width: 100%;
      height: 600px;
      background: #f8fafc;
      border: 2px dashed var(--medium-gray-color);
      border-radius: var(--border-radius);
      position: relative;
      overflow: hidden;
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

    @keyframes pulseScoreGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
    }
    @keyframes pulseGreenGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
    }
    .swal-confetti { display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem; }

    @media (max-width: 900px) {
      .game-layout { grid-template-columns: 1fr; }
    }
  `}</style>
);

const DIFFICULTY_SETTINGS = {
    Básico: { timeLimit: 300, figuresCount: 3, pointsPerFigure: 10 },
    Avanzado: { timeLimit: 240, figuresCount: 4, pointsPerFigure: 20 }
};

const FIGURE_POOL = [
    {
        // Casa: chimenea verde, tejado (amarillo y naranja) y cuerpo (rosa, azul, morado y rojo) según casa.png
        name: 'Casa',
        targets: [
            { id: 'LT1', x: 425, y: 250, rot: 180 },    // Tejado principal (naranja)
            { id: 'PA', x: 300, y: 275, rot: 0 },       // Vertiente izquierda del tejado (amarillo)
            { id: 'SQ', x: 339.64, y: 214.64, rot: 45 },// Chimenea (verde)
            { id: 'LT2', x: 400, y: 350, rot: 180 },    // Base inferior del cuerpo (azul)
            { id: 'MT', x: 350, y: 350, rot: 90 },      // Pared izquierda (rosa)
            { id: 'ST1', x: 450, y: 325, rot: 180 },    // Sección superior derecha (morado)
            { id: 'ST2', x: 475, y: 350, rot: 270 }     // Pared derecha (rojo)
        ]
    },
    {
        // Barco: mástil (ST1+SQ+ST2) y casco encajado (LT1+LT2+MT+PA) idéntico a barco.png sin solapamientos
        name: 'Barco',
        targets: [
            { id: 'ST1', x: 350, y: 150, rot: 0 },         // Vela superior (rosa)
            { id: 'SQ', x: 350, y: 210.36, rot: 45 },    // Mástil (verde)
            { id: 'ST2', x: 350, y: 270.71, rot: 180 },   // Conector mástil-casco (morado)
            { id: 'LT1', x: 350, y: 345.71, rot: 180 },   // Casco central (cian)
            { id: 'LT2', x: 450, y: 345.71, rot: 0 },     // Casco derecho (naranja)
            { id: 'PA', x: 275, y: 320.71, rot: 0 },     // Cubierta izquierda (amarillo)
            { id: 'MT', x: 250, y: 395.71, rot: 180 }    // Esquina inferior izquierda (azul/rojo)
        ]
    },
    {
        // Vela según vela.png (geometría verificada: cada pieza contigua comparte
        // arista exacta con la siguiente, sin huecos ni solapamientos):
        //   PA(llama, arriba) → SQ(cuello) → ST1(collar, apunta abajo)
        //   → MT(sup-der) + LT1(columna izq) → ST2(inf-der) → LT2(base amplia)
        name: 'Vela',
        targets: [
            { id: 'PA', x: 435.36, y: 110.71, rot: 135 }, // Llama
            { id: 'SQ', x: 400, y: 216.77, rot: 45 }, // Cuello
            { id: 'ST1', x: 400, y: 277.13, rot: 180 }, // Collar, apunta abajo
            { id: 'MT', x: 400, y: 352.13, rot: 180 }, // Esquina superior derecha
            { id: 'LT1', x: 400, y: 402.13, rot: 270 }, // Columna izquierda
            { id: 'ST2', x: 425, y: 452.13, rot: 270 }, // Esquina inferior derecha
            { id: 'LT2', x: 400, y: 502.13, rot: 180 }  // Base amplia
        ]
    },
    {
        // Manzana: hoja/tallo superior y cuerpo redondeado de fruta
        name: 'Manzana',
        targets: [
            { id: 'ST1', x: 400, y: 150, rot: 45 },
            { id: 'ST2', x: 420, y: 190, rot: 225 },
            { id: 'LT1', x: 360, y: 270, rot: 315 },
            { id: 'LT2', x: 440, y: 270, rot: 45 },
            { id: 'MT', x: 350, y: 370, rot: 135 },
            { id: 'SQ', x: 400, y: 360, rot: 0 },
            { id: 'PA', x: 450, y: 370, rot: 45 }
        ]
    },
    {
        // Copa: cáliz ancho, talle y base estable
        name: 'Copa',
        targets: [
            { id: 'LT1', x: 350, y: 180, rot: 270 },
            { id: 'LT2', x: 450, y: 180, rot: 90 },
            { id: 'SQ', x: 400, y: 260, rot: 45 },
            { id: 'ST1', x: 400, y: 320, rot: 0 },
            { id: 'ST2', x: 400, y: 370, rot: 180 },
            { id: 'MT', x: 400, y: 430, rot: 180 },
            { id: 'PA', x: 400, y: 460, rot: 0 }
        ]
    },
    {
        // Hélice: eje central con 4 aspas simétricas
        name: 'Hélice',
        targets: [
            { id: 'SQ', x: 400, y: 300, rot: 45 },
            { id: 'LT1', x: 400, y: 180, rot: 0 },
            { id: 'LT2', x: 400, y: 420, rot: 180 },
            { id: 'MT', x: 520, y: 300, rot: 90 },
            { id: 'PA', x: 280, y: 300, rot: 90 },
            { id: 'ST1', x: 470, y: 230, rot: 45 },
            { id: 'ST2', x: 330, y: 370, rot: 225 }
        ]
    },
    {
        // Pez: cuerpo romboidal, aletas y cola
        name: 'Serpiente',
        targets: [
            { id: 'LT1', x: 414.64, y: 289.64, rot: 315 },
            { id: 'LT2', x: 514.64, y: 289.64, rot: 45 },
            { id: 'MT', x: 400, y: 375, rot: 90 },
            { id: 'SQ', x: 314.64, y: 389.64, rot: 45 },
            { id: 'PA', x: 254.28, y: 350, rot: 90 },
            { id: 'ST1', x: 229.28, y: 250, rot: 180 },
            { id: 'ST2', x: 229.28, y: 200, rot: 0 }
        ]
    },
    {
        // Gato: cuerpo triangular, cabeza cuadrada, orejas y cola
        name: 'Gato',
        targets: [
            { id: 'LT1', x: 408.22, y: 386.9, rot: 45 },
            { id: 'LT2', x: 337.5, y: 386.9, rot: 315 },
            { id: 'SQ', x: 372.86, y: 210.13, rot: 45 },
            { id: 'ST1', x: 308.22, y: 145.42, rot: 225 },
            { id: 'ST2', x: 437.5, y: 145.42, rot: 135 },
            { id: 'MT', x: 372.86, y: 507.62, rot: 135 },
            { id: 'PA', x: 543.57, y: 386.9, rot: 90 }
        ]
    },
    {
        // Perro: cabeza cuadrada con hocico, oreja y cuerpo erguido
        name: 'Pato',
        targets: [
            { id: 'SQ', x: 400, y: 160, rot: 45 },
            { id: 'ST1', x: 335, y: 135, rot: 225 },
            { id: 'ST2', x: 465, y: 185, rot: 135 },
            { id: 'LT1', x: 400, y: 280, rot: 90 },
            { id: 'LT2', x: 480, y: 360, rot: 0 },
            { id: 'PA', x: 570, y: 310, rot: 45 },
            { id: 'MT', x: 340, y: 380, rot: 270 }
        ]
    },
    {
        // Caballo: cabeza, cuello erguido, lomo y cola
        name: 'Perro',
        targets: [
            { id: 'ST1', x: 340, y: 160, rot: 225 },
            { id: 'SQ', x: 400, y: 190, rot: 45 },
            { id: 'ST2', x: 430, y: 130, rot: 135 },
            { id: 'LT1', x: 400, y: 280, rot: 180 },
            { id: 'LT2', x: 490, y: 350, rot: 0 },
            { id: 'MT', x: 560, y: 420, rot: 90 },
            { id: 'PA', x: 580, y: 290, rot: 135 }
        ]
    },
    {
        // Zorro: cabeza puntiaguda con dos orejas grandes y cola frondosa
        name: 'Zorro',
        targets: [
            { id: 'SQ', x: 400, y: 200, rot: 45 },
            { id: 'ST1', x: 340, y: 140, rot: 225 },
            { id: 'ST2', x: 460, y: 140, rot: 135 },
            { id: 'LT1', x: 400, y: 320, rot: 0 },
            { id: 'LT2', x: 520, y: 320, rot: 270 },
            { id: 'MT', x: 320, y: 280, rot: 90 },
            { id: 'PA', x: 350, y: 400, rot: 0 }
        ]
    },
    {
        // Conejo: orejas largas erguidas, cuerpo acurrucado y patitas
        name: 'Conejo',
        targets: [
            { id: 'SQ', x: 380, y: 200, rot: 45 },
            { id: 'ST1', x: 340, y: 120, rot: 225 },
            { id: 'ST2', x: 410, y: 120, rot: 135 },
            { id: 'LT1', x: 420, y: 320, rot: 315 },
            { id: 'LT2', x: 490, y: 380, rot: 45 },
            { id: 'MT', x: 330, y: 340, rot: 180 },
            { id: 'PA', x: 550, y: 340, rot: 45 }
        ]
    },
    {
        // Cisne: cuello largo, cuerpo y ala
        name: 'Cisne',
        targets: [
            { id: 'LT1', x: 464.64, y: 425, rot: 45 },
            { id: 'LT2', x: 329.28, y: 410.36, rot: 180 },
            { id: 'MT', x: 279.28, y: 310.36, rot: 0 },
            { id: 'SQ', x: 364.64, y: 325, rot: 45 },
            { id: 'ST1', x: 279.28, y: 235.36, rot: 0 },
            { id: 'ST2', x: 279.28, y: 285.36, rot: 180 },
            { id: 'PA', x: 375, y: 214.64, rot: 90 }
        ]
    },
    {
        // Helicóptero: rotor superior, cabina y rotor de cola
        name: 'Helicóptero',
        targets: [
            { id: 'ST1', x: 330, y: 140, rot: 90 },
            { id: 'ST2', x: 470, y: 140, rot: 270 },
            { id: 'SQ', x: 400, y: 180, rot: 0 },
            { id: 'LT1', x: 350, y: 280, rot: 270 },
            { id: 'LT2', x: 450, y: 280, rot: 90 },
            { id: 'PA', x: 550, y: 280, rot: 0 },
            { id: 'MT', x: 630, y: 240, rot: 45 }
        ]
    },
    {
        // Cohete: nariz puntiaguda, cuerpo y aletas
        name: 'Cohete',
        targets: [
            { id: 'LT1', x: 360.36, y: 284.64, rot: 0 },
            { id: 'LT2', x: 360.36, y: 384.64, rot: 180 },
            { id: 'MT', x: 260.36, y: 364.64, rot: 45 },
            { id: 'SQ', x: 495.72, y: 400, rot: 45 },
            { id: 'PA', x: 535.36, y: 339.64, rot: 0 },
            { id: 'ST1', x: 435.36, y: 314.64, rot: 270 },
            { id: 'ST2', x: 485.36, y: 214.64, rot: 90 }
        ]
    }
];

const TARGETS = {
    Básico: ['Casa', 'Barco', 'Vela', 'Serpiente'],
    Avanzado: ['Gato', 'Perro', 'Pato', 'Zorro', 'Conejo']
};

const FIG_CATEGORIES = {
    Casa: 'Hogar',
    Barco: 'Navegación',
    Vela: 'Objeto',
    Pez: 'Acuático',
    Serpiente: 'Animal',
    Gato: 'Mascota',
    Perro: 'Mascota',
    Pato: 'Ave',
    Caballo: 'Animal',
    Zorro: 'Silvestre',
    Conejo: 'Mascota',
    Cisne: 'Ave',
    Helicóptero: 'Vehículo',
    Cohete: 'Vehículo'
};

const FIGURE_MAP = FIGURE_POOL.reduce((acc, fig) => {
    acc[fig.name] = fig;
    return acc;
}, {});

const getRandomFigures = (count) => {
    const shuffled = [...FIGURE_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
};

const PIECE_PATHS = {
    LT: "M -100,-50 L 100,-50 L 0,50 Z",
    MT: "M -50,-50 L 50,50 L -50,50 Z",
    ST: "M -50,25 L 50,25 L 0,-25 Z",
    SQ: "M -50,0 L 0,-50 L 50,0 L 0,50 Z",
    PA: "M -25,-25 L 75,-25 L 25,25 L -75,25 Z"
};

const PIECE_COLORS = {
    LT1: "#ef4444",
    LT2: "#f97316",
    MT: "#3b82f6",
    ST1: "#eab308",
    ST2: "#a855f7",
    SQ: "#06b6d4",
    PA: "#22c55e"
};

const checkRotation = (pType, rotA, rotB) => {
    let diff = Math.abs((rotA % 360 + 360) % 360 - (rotB % 360 + 360) % 360);
    if (diff > 180) diff = 360 - diff;
    if (pType === 'SQ') {
        return diff < 20 || Math.abs(diff - 90) < 20 || Math.abs(diff - 180) < 20;
    }
    if (pType === 'PA') {
        return diff < 20 || Math.abs(diff - 180) < 20;
    }
    return diff < 20;
};

const generateTangramCode = (difficulty, targetObjects, gameDetails, selectedPlatforms) => {
    const config = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS['Básico'];
    const titleText = gameDetails?.gameName || 'Juego de Tangram';
    const authorName = gameDetails?.authorName || 'EducSteam';
    const version = gameDetails?.version || '1.0.0';
    const gameDesc = gameDetails?.description || 'Arma figuras utilizando tu creatividad y las 7 piezas del tangram.';
    const diffVal = difficulty || 'Básico';

    const selectedFigures = (targetObjects && targetObjects.length > 0)
        ? targetObjects.map(name => FIGURE_MAP[name] || FIGURE_POOL[0])
        : getRandomFigures(config.figuresCount);

    let formattedDate = 'No especificada';
    if (gameDetails?.date) {
        try {
            const normalized = gameDetails.date.includes('T') ? gameDetails.date : gameDetails.date + 'T00:00:00';
            formattedDate = new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { formattedDate = 'No especificada'; }
    }

    const platformsString = (selectedPlatforms && selectedPlatforms.length > 0)
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
            --light-gray: #f3f4f6;
            --medium-gray: #d1d5db;
            --dark-gray: #4b5563;
            --border-radius: 0.75rem;
            --box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
            background: #f0f2f5; 
            display: flex; 
            justify-content: center; 
            min-height: 100vh; 
            margin: 0; 
            padding: 20px; 
            box-sizing: border-box;
        }
        .container { 
            background: white; 
            padding: 2rem; 
            border-radius: var(--border-radius); 
            box-shadow: var(--box-shadow); 
            width: 100%; 
            max-width: 1100px; 
            display: flex; 
            flex-direction: column; 
            min-height: 80vh;
        }
        .game-layout { 
            display: grid; 
            grid-template-columns: 1fr 300px; 
            gap: 2rem; 
            width: 100%; 
            align-items: start;
        }
        @media (max-width: 900px) { 
            .game-layout { grid-template-columns: 1fr; } 
        }
        
        .game-title { 
            text-align: center; 
            font-size: 2.5rem; 
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
        
        .rules-card {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: var(--border-radius);
            padding: 0.85rem 1.25rem;
            text-align: center;
            margin: 0 auto 1.5rem auto;
            max-width: 600px;
        }
        .rules-card-label {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            color: #64748b;
            margin-bottom: 0.25rem;
            display: block;
        }
        .rules-card-text {
            font-size: 1rem;
            color: #1e40af;
            font-weight: 500;
        }

        .stats-block { 
            background: white;
            border: 1px solid var(--medium-gray); 
            padding: 1.5rem; 
            border-radius: var(--border-radius); 
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            text-align: left;
        }
        .stats-block h3 { 
            margin: 0; 
            font-size: 1.2rem; 
            color: var(--secondary-color); 
            padding-bottom: 0.5rem; 
            border-bottom: 1px solid var(--medium-gray); 
        }
        .stats-item { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.75rem; 
            font-size: 1.05rem; 
        }
        .stats-item span {
            color: var(--dark-gray);
            font-weight: 500;
        }
        .stats-item strong {
            font-weight: 700;
            color: var(--primary-color);
        }
        
        .tangram-board { 
            width: 100%; 
            height: 500px; 
            background: #f8fafc; 
            border: 2px dashed var(--medium-gray); 
            border-radius: var(--border-radius); 
            position: relative; 
            overflow: hidden; 
            touch-action: none;
        }
        
        .btn-action {
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
            width: 100%;
            box-sizing: border-box;
        }
        .btn-action:hover:not(:disabled) { 
            background-color: #005f92;
        }
        .btn-action:disabled { 
            opacity: 0.6; 
            cursor: not-allowed; 
        }
        
        .overlay { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(255,255,255,0.95); 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            z-index: 50; 
            transition: opacity 0.3s;
            padding: 20px; 
            box-sizing: border-box; 
        }
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
        .big-btn:hover { 
            transform: scale(1.05); 
            filter: brightness(1.1); 
        }
        .btn-info { 
            background: white; 
            color: var(--primary-color); 
            border: 2px solid var(--primary-color); 
        }

        .countdown-number { 
            font-size: 8rem; 
            font-weight: bold; 
            color: var(--primary-color); 
            animation: popIn 0.5s ease-out; 
        }
        @keyframes popIn { 
            0% { transform: scale(0); opacity: 0; } 
            80% { transform: scale(1.1); } 
            100% { transform: scale(1); opacity: 1; } 
        }

        .info-modal-content { 
            background: white; 
            padding: 2.5rem; 
            border-radius: 1rem; 
            max-width: 600px; 
            width: 90%; 
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); 
            border: 1px solid #e5e7eb; 
            position: relative; 
        }
        .info-header { 
            text-align: center; 
            border-bottom: 2px solid #f1f5f9; 
            padding-bottom: 1.5rem; 
            margin-bottom: 1.5rem; 
        }
        .info-title { 
            font-size: 1.8rem; 
            color: var(--primary-color); 
            margin: 0; 
            font-weight: 800; 
        }
        .info-subtitle { 
            color: #64748b; 
            font-size: 0.9rem; 
            margin-top: 0.5rem; 
        }
        .info-details-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 1.5rem; 
            margin-bottom: 1.5rem; 
        }
        .info-item { 
            background: #f8fafc; 
            padding: 1rem; 
            border-radius: 0.5rem; 
            border: 1px solid #e2e8f0; 
        }
        .info-label { 
            font-size: 0.8rem; 
            color: #64748b; 
            text-transform: uppercase; 
            letter-spacing: 0.05em; 
            display: block; 
            margin-bottom: 0.25rem; 
            font-weight: 600; 
        }
        .info-value { 
            font-size: 1.1rem; 
            color: #334155; 
            font-weight: 500; 
        }
        .info-desc { 
            grid-column: 1 / -1; 
            background: #fff; 
            padding: 0; 
            border: none; 
        }
        .close-info-btn { 
            position: absolute; 
            top: 1rem; 
            right: 1rem; 
            background: transparent; 
            border: none; 
            font-size: 1.5rem; 
            cursor: pointer; 
            color: #94a3b8; 
        }
        .close-info-btn:hover { 
            color: var(--wrong-color); 
        }

        @keyframes pulseScoreGlow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        }
        .swal-confetti { display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div id="start-screen" class="overlay">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; text-align: center; color: var(--secondary-color);">${titleText}</h1>
        <div style="background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">Nivel: ${diffVal} </div>
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <button class="big-btn" onclick="startGameSequence()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Iniciar Juego</button>
            <button class="big-btn btn-info" onclick="toggleInfo(true)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> Información</button>
        </div>
    </div>

    <div id="countdown-screen" class="overlay hidden">
        <div id="countdown-display" class="countdown-number">5</div>
    </div>

    <div id="info-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">Juego de ${titleText}</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma EducSteam</div>
            </div>
            <div class="info-details-grid">
                <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${authorName}</span></div>
                <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${version}</span></div>
                <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${platformsString}</span></div>
                <div class="info-item info-desc"><span class="info-label">Descripción</span><p class="info-value">${gameDesc}</p></div>
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem;" onclick="toggleInfo(false)">Cerrar</button>
            </div>
        </div>
    </div>

    <div class="container" id="game-ui" style="display:none;">
        <h2 class="game-title" id="main-title" style="margin-top:0; font-size:2.5rem;"></h2>

        <div class="rules-card" id="rules-card">
            <span class="rules-card-label">📋 Reglas básicas</span>
            <span class="rules-card-text">Arrastra las figuras que componen el Tangram hacia el área de trabajo, para armar la figura que se te presenta, recuerda utilizar todas las piezas.</span>
        </div>

        <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
            <button class="btn-action" onclick="showHowToPlayModal()" style="width: auto; background-color: #0077b6;">❓ Cómo Se Juega</button>
        </div>

        <div class="game-layout">
            <div class="game-main-col">
                <div class="tangram-board">
                    <svg id="svgCanvas" viewBox="0 0 800 600" style="width: 100%; height: 100%; touch-action: none;">
                        <g opacity="0.15" id="silhouette"></g>
                        <g id="pieces"></g>
                    </svg>
                </div>
            </div>
            <div class="game-right-col">
                <div class="stats-block">
                    <h3>🏆 Progreso</h3>
                    <div class="stats-item" style="margin-top:0.5rem;"><span>Nivel:</span><strong id="stat-level">${diffVal}</strong></div>
                    <div class="stats-item"><span>Figura:</span><strong id="fig-name" style="font-size:0.9rem; text-align:right; max-width:160px;">-</strong></div>
                    <div class="stats-item" style="border-top:1px solid var(--medium-gray); padding-top:0.75rem; margin-top:0.75rem;">
                        <span>Tiempo:</span><strong id="timer">00:00</strong>
                    </div>
                    <div class="stats-item" style="border-top:1px solid var(--medium-gray); padding-top:0.75rem; margin-top:0.75rem;">
                        <span>Puntaje:</span><strong id="score" style="font-size:1.2rem;">0 pts</strong>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.65rem; margin-top:1.25rem;">
                        <button class="btn-action" onclick="validateSolution()">
                            ✓ Validar Solución
                        </button>
                        <button class="btn-action" onclick="finishGame()">
                            ✕ Finalizar Juego
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        const FIGURE_POOL = ${JSON.stringify(FIGURE_POOL)};
        const PIECE_PATHS = ${JSON.stringify(PIECE_PATHS)};
        const PIECE_COLORS = ${JSON.stringify(PIECE_COLORS)};
        const presetDifficulty = "${diffVal}";
        
        let state = {
            gameFigures: [],
            currentRound: 0,
            pieces: [],
            timeLeft: config.timeLimit,
            score: 0,
            isPlaying: false,
            timerInterval: null
        };
        
        const svgCanvas = document.getElementById('svgCanvas');

        function toggleInfo(show) {
            const el = document.getElementById('info-overlay');
            if (show) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const d = document.getElementById('countdown-display');
            d.innerText = count;
            d.style.animation = 'none';
            void d.offsetWidth;
            d.style.animation = 'popIn 0.5s ease-out';

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

        function initTitle() {
            const el = document.getElementById('main-title');
            const titleToDisplay = "Juego de Tangram";
            el.innerHTML = titleToDisplay.split('').map((c, i) =>
                '<span style="animation-delay:' + (i * 0.05) + 's">' + (c === ' ' ? '&nbsp;' : c) + '</span>'
            ).join('');
        }
        
        function formatTime(seconds) {
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            return m + ':' + s;
        }

        function checkRotation(pType, rotA, rotB) {
            let diff = Math.abs((rotA % 360 + 360) % 360 - (rotB % 360 + 360) % 360);
            if (diff > 180) diff = 360 - diff;
            if (pType === 'SQ') return diff < 20 || Math.abs(diff - 90) < 20 || Math.abs(diff - 180) < 20;
            if (pType === 'PA') return diff < 20 || Math.abs(diff - 180) < 20;
            return diff < 20;
        }

        function getRandomFigures(count) {
            const shuffled = [...FIGURE_POOL].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count);
        }

        function initPieces() {
            const types = ['LT1', 'LT2', 'MT', 'ST1', 'ST2', 'SQ', 'PA'];
            return types.map((id, index) => {
                const isLeft = index % 2 === 0;
                return {
                    id,
                    type: id.replace(/[0-9]/g, ''),
                    x: isLeft ? 100 + Math.random() * 50 : 650 + Math.random() * 50,
                    y: 100 + index * 70,
                    rot: Math.floor(Math.random() * 8) * 45,
                    locked: false
                };
            });
        }

        function renderPieces() {
            const piecesGroup = document.getElementById('pieces');
            piecesGroup.innerHTML = '';
            
            state.pieces.forEach(p => {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('data-piece-id', p.id);
                path.setAttribute('d', PIECE_PATHS[p.type]);
                path.setAttribute('transform', 'translate(' + p.x + ', ' + p.y + ') rotate(' + p.rot + ')');
                path.setAttribute('fill', PIECE_COLORS[p.id]);
                path.setAttribute('stroke', '#1f2937');
                path.setAttribute('stroke-width', '2');
                path.style.cursor = p.locked ? 'default' : 'grab';
                
                if (!p.locked) {
                    path.addEventListener('pointerdown', (e) => onPointerDown(e, p.id));
                }
                piecesGroup.appendChild(path);
            });
        }

        function updatePieceTransform(piece) {
            const el = document.querySelector('#pieces path[data-piece-id="' + piece.id + '"]');
            if (el) {
                el.setAttribute('transform', 'translate(' + piece.x + ', ' + piece.y + ') rotate(' + piece.rot + ')');
            }
        }

        function renderSilhouette(figure) {
            const sil = document.getElementById('silhouette');
            sil.innerHTML = '';
            figure.targets.forEach(t => {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', PIECE_PATHS[t.id.replace(/[0-9]/g, '')]);
                path.setAttribute('transform', 'translate(' + t.x + ', ' + t.y + ') rotate(' + t.rot + ')');
                path.setAttribute('fill', '#000');
                sil.appendChild(path);
            });
        }

        let dragInfo = null;

        function getSvgPoint(clientX, clientY) {
            const pt = svgCanvas.createSVGPoint();
            pt.x = clientX;
            pt.y = clientY;
            return pt.matrixTransform(svgCanvas.getScreenCTM().inverse());
        }

        function onPointerDown(e, id) {
            if (!state.isPlaying) return;
            e.preventDefault();
            // Capturamos el puntero en el <svg> (que nunca se destruye) en vez del
            // <path> individual, ya que ese path se recrea al renderizar y perdía
            // la captura del puntero a mitad del arrastre.
            try { svgCanvas.setPointerCapture(e.pointerId); } catch (err) {}
            const pt = getSvgPoint(e.clientX, e.clientY);
            const piece = state.pieces.find(p => p.id === id);
            
            dragInfo = {
                id,
                pointerId: e.pointerId,
                startX: pt.x,
                startY: pt.y,
                pieceStartX: piece.x,
                pieceStartY: piece.y,
                moved: false,
                time: Date.now()
            };
            
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        }

        function onPointerMove(e) {
            if (!dragInfo) return;
            e.preventDefault();
            const pt = getSvgPoint(e.clientX, e.clientY);
            const dx = pt.x - dragInfo.startX;
            const dy = pt.y - dragInfo.startY;
            
            // Cualquier desplazamiento real (por pequeño que sea) cuenta como
            // arrastre, no como toque. Antes, un umbral de píxeles hacía que un
            // ajuste fino y rápido se interpretara como "toque para rotar" y
            // rotaba la pieza 45° sin que el jugador lo notara, dejándola
            // desalineada aunque pareciera estar en su sitio.
            if (Math.hypot(dx, dy) > 1) {
                dragInfo.moved = true;
            }
            
            const pieceIndex = state.pieces.findIndex(p => p.id === dragInfo.id);
            state.pieces[pieceIndex].x = dragInfo.pieceStartX + dx;
            state.pieces[pieceIndex].y = dragInfo.pieceStartY + dy;
            // Solo actualizamos el transform de la pieza arrastrada, sin recrear
            // todos los <path> del SVG (eso era lo que rompía el arrastre).
            updatePieceTransform(state.pieces[pieceIndex]);
        }

        function onPointerUp(e) {
            if (!dragInfo) return;
            try { svgCanvas.releasePointerCapture(dragInfo.pointerId); } catch (err) {}
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            
            const drag = dragInfo;
            dragInfo = null;
            
            const pieceIndex = state.pieces.findIndex(p => p.id === drag.id);
            const piece = state.pieces[pieceIndex];
            const currentFigure = state.gameFigures[state.currentRound];
            
            if (!drag.moved && (Date.now() - drag.time) < 300) {
                piece.rot = (piece.rot + 45) % 360;
                renderPieces();
            } else {
                const candidates = currentFigure.targets.filter(t =>
                    t.id.startsWith(piece.type) &&
                    !state.pieces.find(p => p.locked && p.targetId === t.id) &&
                    Math.abs(t.x - piece.x) < 45 &&
                    Math.abs(t.y - piece.y) < 45 &&
                    checkRotation(piece.type, piece.rot, t.rot)
                );
                // Si hay varios blancos válidos (mismo tipo de pieza), usamos el más
                // cercano en vez del primero que aparezca en la lista de la figura.
                let target = null;
                let bestDist = Infinity;
                candidates.forEach(t => {
                    const d = Math.hypot(t.x - piece.x, t.y - piece.y);
                    if (d < bestDist) { bestDist = d; target = t; }
                });
                
                if (target) {
                    piece.x = target.x;
                    piece.y = target.y;
                    piece.rot = target.rot;
                    piece.locked = true;
                    piece.targetId = target.id;
                    renderPieces();
                }
            }
        }

        function loadRound() {
            const currentFigure = state.gameFigures[state.currentRound];
            state.pieces = initPieces();
            state.timeLeft = config.timeLimit;
            document.getElementById('fig-name').innerText = currentFigure.name + ' (' + (state.currentRound + 1) + ' de ' + state.gameFigures.length + ')';
            document.getElementById('timer').innerText = formatTime(state.timeLeft);
            renderSilhouette(currentFigure);
            renderPieces();
        }

        function validateSolution() {
            if (!state.isPlaying) return;
            const currentFigure = state.gameFigures[state.currentRound];

            if (state.pieces.every(p => p.locked)) {
                clearInterval(state.timerInterval);
                state.score += config.pointsPerFigure;
                document.getElementById('score').innerText = state.score + ' pts';

                if (state.currentRound + 1 < state.gameFigures.length) {
                    Swal.fire({
                        title: '¡Excelente!',
                        html: '<p style="font-size: 1.1rem; margin-bottom: 0;">¡Has armado la figura <strong>"' + currentFigure.name + '"</strong>!</p>' +
                              '<div style="font-size: 1.1rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block;">✨ +' + config.pointsPerFigure + ' Puntos</div>',
                        icon: 'success',
                        confirmButtonText: 'Siguiente Figura',
                        confirmButtonColor: '#0077b6'
                    }).then(() => {
                        state.currentRound++;
                        loadRound();
                        startTimer();
                    });
                } else {
                    Swal.fire({
                        title: '¡Felicidades!',
                        html: \`
                          <div class="swal-confetti">
                            <span style="font-size: 3rem;">🌟</span>
                            <span style="font-size: 3rem;">🏆</span>
                            <span style="font-size: 3rem;">🌟</span>
                          </div>
                          <p style="font-size: 1.1rem; margin-bottom: 0;">Has completado todas las figuras del nivel <strong>\${presetDifficulty}</strong>.</p>
                          <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                            Puntaje Total: \${state.score} pts
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
                    }).then((r) => {
                        if (r.isConfirmed) {
                            exitGameDirect();
                        } else if (r.dismiss === Swal.DismissReason.cancel) {
                            startGameSequence();
                        }
                    });
                }
            } else {
                Swal.fire({
                    title: 'Solución Incompleta',
                    text: 'Aún quedan piezas por colocar correctamente en la silueta.',
                    icon: 'warning',
                    confirmButtonColor: '#0077b6'
                });
            }
        }

        function startTimer() {
            clearInterval(state.timerInterval);
            document.getElementById('timer').innerText = formatTime(state.timeLeft);
            state.timerInterval = setInterval(() => {
                state.timeLeft--;
                document.getElementById('timer').innerText = formatTime(state.timeLeft);
                if (state.timeLeft <= 0) {
                    clearInterval(state.timerInterval);
                    Swal.fire({
                        title: '¡Tiempo Agotado!',
                        text: 'Se acabó el tiempo para resolver esta figura.',
                        icon: 'error',
                        showCancelButton: true,
                        confirmButtonColor: '#0077b6',
                        cancelButtonColor: '#4b5563',
                        confirmButtonText: 'Reintentar',
                        cancelButtonText: 'Finalizar Juego',
                        reverseButtons: true
                    }).then((r) => {
                        if (r.isConfirmed) {
                            startGameSequence();
                        } else {
                            exitGameDirect();
                        }
                    });
                }
            }, 1000);
        }

        function startGame() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('game-ui').style.display = 'flex';
            document.getElementById('game-ui').style.flexDirection = 'column';
            initTitle();
            state.gameFigures = ${JSON.stringify(selectedFigures)};
            state.currentRound = 0;
            state.score = 0;
            state.isPlaying = true;
            document.getElementById('score').innerText = '0 pts';
            loadRound();
            startTimer();
        }

        function finishGame() {
            Swal.fire({
                title: '¿Deseas finalizar el juego?',
                text: 'Tu puntaje actual es de ' + state.score + ' puntos.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#4b5563',
                confirmButtonText: 'Sí, finalizar',
                cancelButtonText: 'Seguir Jugando',
                reverseButtons: true
            }).then((r) => {
                if (r.isConfirmed) {
                    exitGameDirect();
                }
            });
        }

        function exitGameDirect() {
            clearInterval(state.timerInterval);
            window.close();
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
        }

        function showHowToPlayModal() {
            Swal.fire({
                title: '¿Cómo jugar Tangram?',
                html: \`
                    <div style="text-align:left;font-size:0.95rem;line-height:1.6;">
                        <p><strong>Objetivo:</strong> Armar las figuras indicadas usando las 7 piezas del tangram.</p>
                        <ol>
                            <li><strong>Arrastra</strong> las piezas hacia la silueta en el área de trabajo.</li>
                            <li>Haz un <strong>clic rápido</strong> sobre una pieza para rotarla 45°.</li>
                            <li>Las piezas <strong>se fijarán automáticamente</strong> al colocarse en la posición y rotación correctas.</li>
                            <li>Haz clic en <strong>«Validar Solución»</strong> al completar la figura.</li>
                            <li>Recuerda utilizar todas las piezas.</li>
                        </ol>
                    </div>
                \`,
                icon: 'info',
                confirmButtonText: '¡Entendido!',
                confirmButtonColor: '#0077b6'
            });
        }
    </script>
</body>
</html>`;
};

const Tangram = () => {
    const [view, setView] = useState('home');
    const [difficulty, setDifficulty] = useState('');
    const [gameFigures, setGameFigures] = useState([]);
    const [currentRound, setCurrentRound] = useState(0);

    const [pieces, setPieces] = useState([]);
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
        gameDetails: { gameName: 'Tangram Creativo', description: 'Arma figuras utilizando tu imaginación y las 7 piezas del tangram.', version: '1.0.0', date: null },
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

    const currentConfig = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS['Básico'];
    const currentFigure = gameFigures[currentRound] || FIGURE_POOL[0];

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, isPlaying]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const initPieces = () => {
        const types = ['LT1', 'LT2', 'MT', 'ST1', 'ST2', 'SQ', 'PA'];
        return types.map((id, index) => {
            const isLeft = index % 2 === 0;
            return {
                id,
                type: id.replace(/[0-9]/g, ''),
                x: isLeft ? 100 + Math.random() * 50 : 650 + Math.random() * 50,
                y: 100 + index * 70,
                rot: Math.floor(Math.random() * 8) * 45,
                locked: false
            };
        });
    };

    const [targetObjects, setTargetObjects] = useState([]);

    const maxFigures = currentConfig?.figuresCount || 0;
    const isSelectionValid = targetObjects.length === maxFigures;

    const handleDifficultyChange = (newLevel) => {
        setDifficulty(newLevel);
        setTargetObjects([]);
    };

    const handleTargetToggle = (figName) => {
        if (!difficulty) return;
        const max = maxFigures;
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
        const config = DIFFICULTY_SETTINGS[difficulty];
        if (targetObjects.length !== config.figuresCount) return;

        const figures = targetObjects.map(name => FIGURE_MAP[name] || FIGURE_POOL[0]);
        setGameFigures(figures);
        setCurrentRound(0);
        setView('play');
        setPieces(initPieces());
        setTimeLeft(config.timeLimit);
        setScore(0);
        setIsPlaying(true);
    };

    const handleTimeout = () => {
        setIsPlaying(false);
        Swal.fire({
            title: '⏰ Tiempo agotado',
            html: `
              <p style="font-size: 1.05rem; margin-bottom: 0;">Se acabó el tiempo para esta figura. ¡Inténtalo de nuevo!</p>
              <div style="font-size: 1.1rem; font-weight: bold; color: #b91c1c; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #fee2e2; border: 2px solid #ef4444; border-radius: 0.5rem; display: inline-block;">
                Puntaje actual: ${score} pts
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'Reintentar',
            confirmButtonColor: '#0077b6'
        }).then(() => {
            setPieces(initPieces());
            setTimeLeft(currentConfig.timeLimit);
            setIsPlaying(true);
        });
    };

    const checkWinStatus = (newPieces) => {
        if (newPieces.every(p => p.locked)) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            const earned = score + currentConfig.pointsPerFigure;
            setScore(earned);
            const isLastRound = currentRound === gameFigures.length - 1;

            if (isLastRound) {
                setTimeout(() => {
                    Swal.fire({
                        title: '¡Felicidades!',
                        html: `
                          <div class="swal-confetti">
                            <span style="font-size: 3rem;">🌟</span>
                            <span style="font-size: 3rem;">🏆</span>
                            <span style="font-size: 3rem;">🌟</span>
                          </div>
                          <p style="font-size: 1.1rem; margin-bottom: 0;">Has completado todas las figuras del nivel <strong>${difficulty}</strong>.</p>
                          <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                            Puntaje Total: ${earned} pts
                          </div>
                        `,
                        icon: 'success',
                        confirmButtonText: 'Ver Resultados',
                        confirmButtonColor: '#0077b6',
                        allowOutsideClick: false
                    }).then(() => {
                        goToSummary();
                    });
                }, 800);
            } else {
                setTimeout(() => {
                    Swal.fire({
                        title: '¡Excelente!',
                        html: `
                          <p style="font-size: 1.1rem; margin-bottom: 0;">¡Has armado la figura <strong>"${currentFigure.name}"</strong>!</p>
                          <div style="font-size: 1.1rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGreenGlow 1.5s infinite;">✨ +${currentConfig.pointsPerFigure} Puntos</div>
                        `,
                        icon: 'success',
                        confirmButtonText: 'Siguiente Figura',
                        confirmButtonColor: '#0077b6'
                    }).then(() => {
                        const nextRound = currentRound + 1;
                        setCurrentRound(nextRound);
                        setPieces(initPieces());
                        setTimeLeft(currentConfig.timeLimit);
                        setIsPlaying(true);
                    });
                }, 600);
            }
        } else {
            Swal.fire({
                title: 'Solución Incompleta',
                text: 'Aún quedan piezas por colocar correctamente en la silueta.',
                icon: 'warning',
                confirmButtonColor: '#0077b6'
            });
        }
    };

    const getSvgPoint = (clientX, clientY) => {
        const svg = svgRef.current;
        if (!svg) return { x: clientX, y: clientY };
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
    };

    const onPointerDown = (e, piece) => {
        if (piece.locked || !isPlaying) return;
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        const pt = getSvgPoint(e.clientX, e.clientY);
        dragRef.current = {
            id: piece.id,
            startX: pt.x,
            startY: pt.y,
            pieceStartX: piece.x,
            pieceStartY: piece.y,
            moved: false,
            time: Date.now()
        };
    };

    const onPointerMove = (e) => {
        if (!dragRef.current || !isPlaying) return;
        const drag = dragRef.current;
        const pt = getSvgPoint(e.clientX, e.clientY);
        const dx = pt.x - drag.startX;
        const dy = pt.y - drag.startY;

        if (Math.hypot(dx, dy) > 10) {
            drag.moved = true;
        }

        setPieces(prev => prev.map(p =>
            p.id === drag.id ? { ...p, x: drag.pieceStartX + dx, y: drag.pieceStartY + dy } : p
        ));
    };

    const onPointerUp = (e) => {
        if (!dragRef.current || !isPlaying) return;
        e.target.releasePointerCapture(e.pointerId);

        const drag = dragRef.current;
        dragRef.current = null;

        if (!drag.moved && (Date.now() - drag.time) < 300) {
            setPieces(prev => prev.map(p =>
                p.id === drag.id ? { ...p, rot: (p.rot + 45) % 360 } : p
            ));
        } else {
            setPieces(prev => {
                const piece = prev.find(p => p.id === drag.id);
                if (!piece || !currentFigure) return prev;
                const candidates = currentFigure.targets.filter(t =>
                    t.id.startsWith(piece.type) &&
                    !prev.find(p => p.locked && p.targetId === t.id) &&
                    Math.abs(t.x - piece.x) < 45 &&
                    Math.abs(t.y - piece.y) < 45 &&
                    checkRotation(piece.type, piece.rot, t.rot)
                );
                // Si hay varios blancos válidos del mismo tipo de pieza, usamos el
                // más cercano en vez del primero que aparezca en la lista.
                let target = null;
                let bestDist = Infinity;
                candidates.forEach(t => {
                    const d = Math.hypot(t.x - piece.x, t.y - piece.y);
                    if (d < bestDist) { bestDist = d; target = t; }
                });

                if (target) {
                    const newPieces = prev.map(p =>
                        p.id === drag.id ? { ...p, x: target.x, y: target.y, rot: target.rot, locked: true, targetId: target.id } : p
                    );
                    return newPieces;
                }
                return prev;
            });
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
            html: `
              <p style="font-size: 1.05rem; margin-bottom: 0;">Serás redirigido al panel de configuración.</p>
              <div style="font-size: 1.1rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block;">
                Puntaje actual: ${score} pts
              </div>
            `,
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
                slug: 'tangram', details: gameDetails, platforms: selectedPlatforms,
                options: { nivel: difficulty, figuras: targetObjects }, htmlContent: generateTangramCode(difficulty, targetObjects, gameDetails, selectedPlatforms), webAssets: [],
                onStatus: (status) => { setStatusText(status); setProgress(current => Math.min(90, current + 15)); }
            });
            downloadGameArchive(result.blob, result.fileName);
            setProgress(100); setStatusText('¡Descarga iniciada!');
        } catch (error) {
            console.error(error); setStatusText(error?.message || 'Error al generar el paquete.');
        } finally { setIsGenerating(false); }
    };

    const showHowToPlayModal = () => {
        Swal.fire({
            title: '¿Cómo jugar Tangram?',
            html: `
                <div style="text-align:left;font-size:0.95rem;line-height:1.6;">
                    <p><strong>Objetivo:</strong> Armar las figuras indicadas usando las 7 piezas del tangram.</p>
                    <ol>
                        <li><strong>Arrastra</strong> las piezas hacia el área de trabajo sobre la silueta.</li>
                        <li>Haz un <strong>clic rápido</strong> sobre una pieza para rotarla 45°.</li>
                        <li>Las piezas <strong>se fijarán automáticamente</strong> cuando estén en su posición y rotación correctas.</li>
                        <li>Haz clic en <strong>«Validar Solución»</strong> al completar la figura.</li>
                        <li>Recuerda utilizar todas las piezas.</li>
                    </ol>
                    <p style="margin-top:0.75rem;"><strong>Niveles de dificultad:</strong><br/>
                    • <em>Básico:</em> 3 figuras, 5 minutos por ejercicio (10 pts/figura).<br/>
                    • <em>Avanzado:</em> 4 figuras, 4 minutos por ejercicio (20 pts/figura).</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: '¡Entendido!',
            confirmButtonColor: '#0077b6'
        });
    };

    const renderSetupScreen = () => {
        const gameIcon = location.state?.selectedGame?.icon || null;
        return (
            <div className="catalog-screen">
                <div className="game-title">
                    {'Juego de Tangram'.split('').map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {gameIcon ? (
                        <img src={gameIcon} alt="Tangram" className="game-preview-image"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <div className="game-image-placeholder">■</div>
                    )}
                    <span className="game-info-badge">Geometría y Creatividad</span>
                </div>

                <div className="rules-banner">
                    <h2><HelpCircle size={22} /> Tangram</h2>
                    <p>Arma las figuras indicadas usando las 7 piezas del tangram. Arrastra las piezas y haz clic rápido para rotarlas.</p>
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
                                const figDef = FIGURE_MAP[figName];
                                return (
                                    <div
                                        key={figName}
                                        className={`object-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleTargetToggle(figName)}
                                    >
                                        {isSelected && <Check size={16} className="check-icon" />}
                                        <div className="object-thumb-box">
                                            <svg viewBox="150 100 450 450" style={{ width: '100%', height: '100%' }}>
                                                {figDef?.targets?.map(t => (
                                                    <path
                                                        key={t.id}
                                                        d={PIECE_PATHS[t.id.replace(/[0-9]/g, '')]}
                                                        transform={`translate(${t.x}, ${t.y}) rotate(${t.rot})`}
                                                        fill={PIECE_COLORS[t.id]}
                                                        stroke="#1f2937"
                                                        strokeWidth="2.5"
                                                        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.18))' }}
                                                    />
                                                ))}
                                            </svg>
                                        </div>
                                        <div className="object-name">{figName}</div>
                                        <span className="object-category-tag">{FIG_CATEGORIES[figName] || 'Figura'}</span>
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
                    <button
                        className="no-rounded-button btn-primary"
                        onClick={startNewGame}
                        disabled={!isSelectionValid}
                        style={{ opacity: isSelectionValid ? 1 : 0.5, cursor: isSelectionValid ? 'pointer' : 'not-allowed' }}
                    >
                        Siguiente <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    };

    const renderGameScreen = () => (
        <div className="game-screen">
            <div className="game-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {'Juego de Tangram'.split('').map((char, index) => (
                    <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </div>
            <div style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--dark-gray-color)', marginBottom: '1rem' }}>
                (Vista Previa)
            </div>

            {/* Cuadro de Reglas Básicas Homogenizado (igual a MagForce) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto 1.5rem auto', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                    📋 Reglas básicas
                </span>
                <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>
                    Arrastra las figuras que componen el Tangram hacia el área de trabajo, para armar la figura que se te presenta, recuerda utilizar todas las piezas.
                </span>
            </div>

            <div className="game-layout">
                <div className="game-main-col">
                    {/* Botón Cómo Se Juega en vista previa (Obs 1) */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '0.5rem' }}>
                        <button className="no-rounded-button btn-primary" onClick={showHowToPlayModal} style={{ width: 'auto' }}>
                            <HelpCircle size={18} /> Cómo Se Juega
                        </button>
                    </div>

                    <div className="tangram-board">
                        <svg ref={svgRef} viewBox="0 0 800 600"
                            style={{ width: '100%', height: '100%', touchAction: 'none' }}>
                            <g opacity="0.15">
                                {currentFigure?.targets?.map(t => (
                                    <path key={`target-${t.id}`}
                                        d={PIECE_PATHS[t.id.replace(/[0-9]/g, '')]}
                                        transform={`translate(${t.x}, ${t.y}) rotate(${t.rot})`}
                                        fill="#000" />
                                ))}
                            </g>
                            {pieces.map(p => (
                                <path key={p.id}
                                    d={PIECE_PATHS[p.type]}
                                    transform={`translate(${p.x}, ${p.y}) rotate(${p.rot})`}
                                    fill={PIECE_COLORS[p.id]}
                                    stroke="#1f2937" strokeWidth="2"
                                    onPointerDown={(e) => onPointerDown(e, p)}
                                    onPointerMove={onPointerMove}
                                    onPointerUp={onPointerUp}
                                    style={{ cursor: p.locked ? 'default' : 'grab' }} />
                            ))}
                        </svg>
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
                            <span>Figura:</span> <strong style={{ color: 'var(--primary-color)' }}>{currentFigure?.name} ({currentRound + 1} de {gameFigures.length || currentConfig.figuresCount})</strong>
                        </div>
                        <div className="stats-item">
                            <span>Tiempo:</span>
                            <strong style={{ color: timeLeft <= 10 ? 'var(--wrong-color)' : 'var(--primary-color)', fontWeight: 'bold' }}>
                                {formatTime(timeLeft)}
                            </strong>
                        </div>
                        <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                            <span>Puntaje:</span> <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{score} pts</strong>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                            <button
                                className="no-rounded-button btn-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => {
                                    if (pieces.every(p => p.locked)) {
                                        checkWinStatus(pieces);
                                    } else {
                                        Swal.fire('Incompleto', 'Debes colocar todas las piezas en su posición correcta.', 'info');
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

                <h1 className="selection-title" style={{ textAlign: 'center', color: '#0077b6', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>Resumen de la Configuración</h1>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
                            <div className="info-card-value">{gameDetails.gameName || 'Tangram'}</div>
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
                                {gameDetails.description || 'Arma figuras utilizando tu creatividad y las 7 piezas del tangram.'}
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
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Layers size={18} /> Ejercicios:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentConfig.figuresCount} figuras</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Timer size={18} /> Tiempo por Ejercicio:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{Math.round(currentConfig.timeLimit / 60)} minutos</strong>
                        </div>
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Star size={18} /> Puntaje Máximo:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentConfig.figuresCount * currentConfig.pointsPerFigure} pts</strong>
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
            <div className="tangram-container">
                {view === 'home' && renderSetupScreen()}
                {view === 'play' && renderGameScreen()}
                {view === 'summary' && renderSummaryScreen()}
            </div>
        </>
    );
};

export default Tangram;
