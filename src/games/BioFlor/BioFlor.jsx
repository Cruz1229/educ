import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Timer, Trophy, Star, Download, ArrowLeft, Tag, Layers, FileText,
  Calendar, Monitor, Shapes, Puzzle, Play, ArrowRight, Check, Grid,
  Info, RefreshCw, X, HelpCircle, CheckSquare, Type, CheckCircle
} from 'lucide-react';
import {
  buildGamePackageNotice,
  createGameDownloadArchive,
  downloadGameArchive,
  formatGamePlatformList,
  normalizeGamePlatforms,
} from '../../utils/gameDownloadPackaging';

// --- ESTILOS COMPARTIDOS CON LA LÍNEA GRÁFICA DE EDUCSTEAM ---
export const BIOFLOR_PREVIEW_STYLES = `
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
      font-family: system-ui, -apple-system, sans-serif;
    }

    @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
    @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    .swal-confetti { display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

    .bioflor-container {
      background: var(--light-text);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 2rem;
      width: 100%;
      max-width: 1400px;
      margin: 20px auto;
      color: var(--dark-text);
      min-height: 85vh;
      display: flex;
      flex-direction: column;
    }

    /* --- TÍTULO ANIMADO --- */
    .game-title {
      text-align: center;
      font-size: 3rem;
      font-weight: 700;
      color: var(--secondary-color);
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      font-family: system-ui, -apple-system, sans-serif;
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

    /* --- CATALOGO / INICIO --- */
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

    .flower-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin: 1.5rem 0;
      max-height: 480px;
      overflow-y: auto;
      padding: 0.75rem;
    }

    .flower-grid::-webkit-scrollbar {
      width: 8px;
    }

    .flower-grid::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .flower-grid::-webkit-scrollbar-thumb {
      background: var(--primary-color);
      border-radius: 4px;
    }

    @keyframes floatImage {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
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
    .game-info-badge {
      display: inline-block;
      background: rgba(0,86,179,0.12);
      color: #0056b3;
      padding: 0.35rem 1rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      border: 1px solid rgba(0,86,179,0.2);
    }

    .flower-grid::-webkit-scrollbar-thumb:hover {
      background: #005f92;
    }

    .flower-card {
      position: relative;
      cursor: pointer;
      border-radius: 1rem;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
    }

    .flower-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 4px;
      background: transparent;
      transition: background 0.3s ease;
    }

    .flower-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      border-color: #cbd5e1;
    }

    .flower-card:hover::before {
      background: #bae6fd;
    }

    .flower-card.selected {
      border-color: var(--primary-color);
      background-color: #f0f9ff;
      box-shadow: 0 10px 15px -3px rgba(0, 119, 182, 0.1), 0 4px 6px -2px rgba(0, 119, 182, 0.05);
    }

    .flower-card.selected::before {
      background: var(--primary-color);
    }

    .flower-thumbnail {
      width: 100%;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 0.75rem;
      padding: 0.5rem;
      transition: all 0.3s ease;
    }

    .flower-card:hover .flower-thumbnail {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    }

    .flower-card.selected .flower-thumbnail {
      background: white;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
    }

    .flower-info {
      text-align: center;
      width: 100%;
    }

    .flower-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--secondary-color);
      margin-bottom: 0.25rem;
      transition: color 0.2s;
    }

    .flower-card.selected .flower-name {
      color: var(--primary-color);
    }

    .flower-sciname {
      font-size: 0.82rem;
      font-style: italic;
      color: #64748b;
    }

    .selected-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--primary-color);
      color: white;
      border-radius: 9999px;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      box-shadow: 0 4px 6px -1px rgba(0, 119, 182, 0.4);
      border: 2px solid white;
      animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes popIn {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .catalog-actions {
      display: flex;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid var(--medium-gray-color);
    }

    /* --- GAME LAYOUT --- */
    .game-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
      width: 100%;
      align-items: start;
    }

    .game-main-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .diagram-panel {
      background: white;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .flower-svg-container {
      width: 100%;
      max-width: 440px;
      height: 440px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .flower-part-svg {
      transition: all 0.3s ease;
    }

    .flower-part-svg.highlighted {
      filter: drop-shadow(0 0 8px #ffd700) brightness(1.2);
      transform: scale(1.03);
    }

    .flower-part-svg.dissected {
      transform: translate(var(--dx), var(--dy));
      opacity: 0.7;
    }

    .pieces-dock {
      width: 100%;
      background: #f8fafc;
      border: 2px dashed var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 1rem;
      margin-top: 1.5rem;
    }

    .pieces-dock h4 {
      margin-top: 0;
      margin-bottom: 0.75rem;
      font-size: 1rem;
      color: var(--dark-gray-color);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dock-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      min-height: 80px;
    }

    .piece-card {
      background: white;
      border: 1px solid var(--medium-gray-color);
      border-radius: 0.5rem;
      padding: 0.5rem;
      cursor: grab;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      position: relative;
    }

    .piece-card:active {
      cursor: grabbing;
    }

    .piece-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      border-color: var(--primary-color);
    }

    .piece-card.selected {
      border-color: var(--primary-color);
      background-color: #eff6ff;
      box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.2);
    }

    .piece-card-thumb {
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .piece-card-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--secondary-color);
      text-transform: capitalize;
    }

    /* --- SLOTS SECTION (CENTER/RIGHT ASOCIACIÓN) --- */
    .association-panel {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .slot-card {
      background: #f8fafc;
      border: 2px dashed var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-height: 110px;
      transition: all 0.3s;
      position: relative;
    }

    .slot-card.drag-over {
      background-color: #e0f2fe;
      border-color: var(--primary-color);
    }

    .slot-card.correct {
      border-color: var(--correct-color);
      background-color: #f0fdf4;
    }

    .slot-card.incorrect {
      border-color: var(--wrong-color);
      background-color: #fef2f2;
    }

    .slot-label {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--secondary-color);
      text-align: left;
      border-bottom: 1px solid var(--medium-gray-color);
      padding-bottom: 0.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .slot-content {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-grow: 1;
      height: 60px;
    }

    .placed-piece {
      background: white;
      border: 1px solid var(--medium-gray-color);
      border-radius: 0.5rem;
      padding: 0.4rem;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      position: relative;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      animation: pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes pop-in {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .placed-piece-thumb {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placed-piece-info {
      text-align: left;
      flex-grow: 1;
    }

    .placed-piece-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--secondary-color);
    }

    .remove-placed-btn {
      background: none;
      border: none;
      color: var(--dark-gray-color);
      cursor: pointer;
      padding: 2px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .remove-placed-btn:hover {
      background-color: #fee2e2;
      color: var(--wrong-color);
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

    .stats-item:last-child {
      margin-bottom: 0;
    }

    .stats-item span {
      color: var(--dark-gray-color);
      font-weight: 500;
    }

    .stats-item strong {
      font-weight: 700;
      color: var(--secondary-color);
    }

    /* --- BOTONES --- */
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

    .no-rounded-button:hover:not(:disabled) {
      filter: brightness(0.95);
    }

    .no-rounded-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
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

    .btn-primary:hover:not(:disabled) {
      background: #004a73;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* override for game buttons that also have .no-rounded-button */
    .no-rounded-button.btn-primary {
      background-color: var(--primary-color);
      color: white;
      border-radius: var(--border-radius);
      font-weight: 700;
    }

    .no-rounded-button.btn-primary:hover:not(:disabled) {
      background-color: #005f92;
    }

    .btn-success {
      background: #005f92;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #004a73;
    }

    .btn-secondary {
      background-color: var(--dark-gray-color);
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #374151;
    }

    .nav-footer {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--medium-gray-color);
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
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .info-card { background: white; padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem; }
    .info-card-header { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; width: 100%; }
    .info-card-value { font-size: 1.1rem; color: #334155; font-weight: 500; text-align: center; width: 100%; }
    .full-width { grid-column: 1 / -1; }

    @media (max-width: 900px) {
      .game-layout {
        grid-template-columns: 1fr;
      }
      .dock-grid {
        grid-template-columns: repeat(3, 1fr);
      }
      .association-panel {
        grid-template-columns: 1fr;
      }
      .info-grid {
        grid-template-columns: 1fr;
      }
    }

    .rules-text { text-align: center; color: #6b7280; margin-bottom: 2rem; font-size: 1.1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `;

const Style = () => <style>{BIOFLOR_PREVIEW_STYLES}</style>;

// --- BASE DE DATOS DE LAS FLORES Y SUS PARTES ---
const FLOWER_CATALOG = [
  {
    id: 'lirio',
    name: 'Lirio Violeta',
    scientificName: 'Lilium Violaceum',
    family: 'Liliaceae',
    description: 'Es una flor monocotiledónea caracterizada por sus grandes pétalos vistosos teñidos de violeta y su pistilo alargado prominente.',
    color: '#9c27b0',
    colorLight: '#e040fb',
    svgType: 'lily'
  },
  {
    id: 'rosa',
    name: 'Rosa Silvestre',
    scientificName: 'Rosa Canina',
    family: 'Rosaceae',
    description: 'Una de las especies florales más emblemáticas. Cuenta con sépalos foliosos triangulares y pétalos superpuestos de color carmesí vibrante.',
    color: '#e91e63',
    colorLight: '#f48fb1',
    svgType: 'rose'
  },
  {
    id: 'tulipan',
    name: 'Tulipán Radiante',
    scientificName: 'Tulipa Gesneriana',
    family: 'Liliaceae',
    description: 'Su cáliz erecto en forma de copa alberga un ovario grande y estigma trilobulado, protegido por pétalos de color fuego anaranjado.',
    color: '#ff5722',
    colorLight: '#ffb74d',
    svgType: 'tulip'
  },
  {
    id: 'girasol',
    name: 'Girasol Dorado',
    scientificName: 'Helianthus Annuus',
    family: 'Asteraceae',
    description: 'Flor compuesta fascinante. Sus pétalos radiales rodean un disco oscuro central donde se agrupan los óvulos y estambres dorados.',
    color: '#ffc107',
    colorLight: '#ffe082',
    svgType: 'sunflower'
  },
  {
    id: 'cempasuchil',
    name: 'Cempasúchil',
    scientificName: 'Tagetes Erecta',
    family: 'Asteraceae',
    description: 'La icónica flor de los muertos mexicana. Presenta múltiples pétalos densos y redondos de un color naranja dorado intensamente aromático.',
    color: '#fb8c00',
    colorLight: '#ffe082',
    svgType: 'cempasuchil'
  },
  {
    id: 'dalia',
    name: 'Dalia Mexicana',
    scientificName: 'Dahlia Pinnata',
    family: 'Asteraceae',
    description: 'La flor nacional de México. Posee pétalos geométricos simétricos superpuestos en círculos que forman una corona espectacular y colorida.',
    color: '#d81b60',
    colorLight: '#f48fb1',
    svgType: 'dalia'
  },
  {
    id: 'nochebuena',
    name: 'Flor de Nochebuena',
    scientificName: 'Euphorbia Pulcherrima',
    family: 'Euphorbiaceae',
    description: 'Nativa de México y símbolo mundial de la Navidad. Sus llamativas "hojas" rojas son brácteas que rodean a una pequeña inflorescencia central.',
    color: '#c62828',
    colorLight: '#ff8a80',
    svgType: 'nochebuena'
  },
  {
    id: 'flordemayo',
    name: 'Flor de Mayo',
    scientificName: 'Plumeria Rubra',
    family: 'Apocynaceae',
    description: 'Flor mesoamericana de exquisito aroma y pétalos planos de forma helicoidal con tonos rosáceos y un corazón amarillo brillante.',
    color: '#e91e63',
    colorLight: '#fff9c4',
    svgType: 'flordemayo'
  }
];

// Nombres científicos e información de las 8 partes para uso educativo
const FLOWER_PARTS_INFO = {
  sepalos: 'Sépalos: Hojas modificadas verdes que forman el cáliz y protegen al capullo floral en desarrollo.',
  petalos: 'Pétalos: Hojas coloreadas y vistosas encargadas de atraer a los polinizadores.',
  antera: 'Antera: Estructura abultada en el extremo del estambre que produce y contiene los granos de polen.',
  filamento: 'Filamento: Hilo o soporte delgado que sostiene a la antera en una posición accesible.',
  estigma: 'Estigma: Zona pegajosa en la punta del pistilo diseñada para recibir y retener los granos de polen.',
  pistilo: 'Pistilo / Estilo: Conducto o cuello tubular que conecta el estigma con el ovario para guiar el tubo polínico.',
  ovario: 'Ovario: Base ensanchada del órgano femenino que protege y resguarda a los óvulos.',
  ovulo: 'Óvulo: Estructura reproductiva femenina dentro del ovario que se convertirá en semilla al ser fecundada.'
};

const DIFFICULTY_SETTINGS = {
  Básico: { timeLimit: 300, label: 'Básico: 3 flores' },
  Intermedio: { timeLimit: 240, label: 'Intermedio: 4 flores' },
  Avanzado: { timeLimit: 180, label: 'Avanzado: 5 flores' }
};

const REQUIRED_FLOWERS = {
  Básico: 3,
  Intermedio: 4,
  Avanzado: 5
};

export const BIOFLOR_NATIVE_TEMPLATE_URLS = Object.freeze({
  android: '/templates/bioflor_android.zip',
  ios: '/templates/bioflor_ios.zip'
});

const BIOFLOR_APPLICATION_ID_BASE = "io.bioflor.steam";

const createUuidSegment = () => {
  const rawUuid = window.crypto?.randomUUID?.()
    || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
  return `uuid_${uuid}`;
};

const buildBioFlorApplicationId = () =>
  `${BIOFLOR_APPLICATION_ID_BASE}.${createUuidSegment()}`;

// --- DIBUJOS SVG DE CADA PARTE INDIVIDUAL PARA CARDS/SLOTS ---
const renderMiniPartSvg = (partId, flowerColor = '#9c27b0') => {
  switch (partId) {
    case 'sepalos':
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          <path d="M25 40 C15 35 10 20 10 10 C18 18 22 28 25 35 C28 28 32 18 40 10 C40 20 35 35 25 40 Z" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.5" />
        </svg>
      );
    case 'petalos':
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          <path d="M25 5 C35 15 45 28 38 40 C30 45 20 45 12 40 C5 28 15 15 25 5 Z" fill={flowerColor} stroke="#fff" strokeWidth="1" />
        </svg>
      );
    case 'antera':
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          <rect x="18" y="10" width="14" height="20" rx="7" fill="#ffeb3b" stroke="#fbc02d" strokeWidth="1.5" />
          <circle cx="21" cy="20" r="1.5" fill="#f57f17" />
          <circle cx="29" cy="20" r="1.5" fill="#f57f17" />
        </svg>
      );
    case 'filamento':
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          <path d="M25 5 C23 20 27 30 25 45" fill="none" stroke="#a5d6a7" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'estigma':
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          <circle cx="25" cy="18" r="8" fill="#81c784" stroke="#2e7d32" strokeWidth="1.5" />
          <circle cx="18" cy="18" r="5" fill="#81c784" stroke="#2e7d32" strokeWidth="1.5" />
          <circle cx="32" cy="18" r="5" fill="#81c784" stroke="#2e7d32" strokeWidth="1.5" />
        </svg>
      );
    case 'pistilo':
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          <path d="M22 5 L28 5 L26 45 L24 45 Z" fill="#81c784" stroke="#4caf50" strokeWidth="1" />
        </svg>
      );
    case 'ovario':
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          <path d="M25 5 C15 15 12 30 18 40 C22 45 28 45 32 40 C38 30 35 15 25 5 Z" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.5" />
        </svg>
      );
    case 'ovulo':
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          <circle cx="25" cy="25" r="10" fill="#fff9c4" stroke="#fbc02d" strokeWidth="2" />
          <circle cx="25" cy="25" r="4" fill="#fbc02d" />
        </svg>
      );
    default:
      return null;
  }
};

// --- RENDERIZADO DEL DIAGRAMA COMPLETO DE LA FLOR (SVG) ---
const FlowerFullDiagram = ({
  flower,
  highlightedPart = null,
  isDissectedMode = false,
  correctParts = [],
  wrongPart = null,
  onDropOnPart = null,
  onPartClick = null
}) => {
  const isPartDissected = (part) => isDissectedMode && !correctParts.includes(part);
  const isDissected = isPartDissected;
  const color = flower.color;
  const colorLight = flower.colorLight;
  const type = flower.svgType || 'lily';
  const fid = flower.id;

  const getPartProps = (part) => {
    const isCorrect = correctParts.includes(part);
    const isWrong = wrongPart === part;
    const isHigh = highlightedPart === part;

    const classes = [
      'flower-part-svg',
      isHigh ? 'highlighted' : '',
      isCorrect ? 'correct-glow' : '',
      isWrong ? 'wrong-glow' : '',
      isDissectedMode && !isCorrect ? 'interactive-part' : ''
    ].filter(Boolean).join(' ');

    const handlers = {};
    if (isDissectedMode && !isCorrect && onDropOnPart) {
      handlers.onDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over-part');
      };
      handlers.onDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over-part');
      };
      handlers.onDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over-part');
        const pieceId = e.dataTransfer.getData('text/plain');
        onDropOnPart(pieceId, part);
      };
      if (onPartClick) {
        handlers.onClick = () => onPartClick(part);
      }
    }

    return {
      className: classes,
      style: {
        cursor: isDissectedMode && !isCorrect ? 'pointer' : 'default'
      },
      ...handlers
    };
  };
  // --- 1. SÉPALOS ---
  const renderSepalos = () => {
    switch (type) {
      case 'rose':
        return (
          <g>
            <path d="M160 250 Q130 220 120 180 Q145 200 170 230 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1" />
            <path d="M240 250 Q270 220 280 180 Q255 200 230 230 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1" />
            <path d="M200 260 Q170 310 150 330 Q185 300 200 270 Z" fill="#1b5e20" />
            <path d="M200 260 Q230 310 250 330 Q215 300 200 270 Z" fill="#1b5e20" />
          </g>
        );
      case 'tulip':
        return (
          <g>
            <path d="M175 285 C160 295 145 315 150 335 C165 315 175 300 182 285 Z" fill="#388e3c" stroke="#2e7d32" />
            <path d="M225 285 C240 295 255 315 250 335 C235 315 225 300 218 285 Z" fill="#388e3c" stroke="#2e7d32" />
          </g>
        );
      case 'sunflower':
        return (
          <g>
            {/* Múltiples sépalos verdes puntiagudos en círculo */}
            <path d="M110 200 Q90 220 70 230 Q105 230 120 210 Z" fill="#2e7d32" />
            <path d="M290 200 Q310 220 330 230 Q295 230 280 210 Z" fill="#2e7d32" />
            <path d="M130 250 Q110 280 90 300 Q130 280 145 260 Z" fill="#2e7d32" />
            <path d="M270 250 Q290 280 310 300 Q270 280 255 260 Z" fill="#2e7d32" />
            <path d="M200 290 Q200 335 190 350 Q210 335 200 295 Z" fill="#1b5e20" />
          </g>
        );
      case 'hibiscus':
        return (
          <path d="M165 240 C155 265 170 285 200 288 C230 285 245 265 235 240 C220 260 180 260 165 240 Z" fill="#388e3c" stroke="#1b5e20" strokeWidth="1.5" />
        );
      case 'cempasuchil':
        return (
          <path d="M175 240 C175 270 180 300 200 305 C220 300 225 270 225 240 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="2" />
        );
      case 'dalia':
        return (
          <g>
            <path d="M140 240 C120 260 120 290 145 285 Z" fill="#2e7d32" stroke="#1b5e20" />
            <path d="M260 240 C280 260 280 290 255 285 Z" fill="#2e7d32" stroke="#1b5e20" />
            <path d="M200 250 C180 290 160 310 200 320 C240 310 220 290 200 250 Z" fill="#1b5e20" />
          </g>
        );
      case 'nochebuena':
        return (
          <g>
            <path d="M200 200 C120 180 110 90 150 90 C170 100 185 150 200 200 Z" fill="#2e7d32" stroke="#1b5e20" />
            <path d="M200 200 C280 180 290 90 250 90 C230 100 215 150 200 200 Z" fill="#2e7d32" stroke="#1b5e20" />
          </g>
        );
      case 'flordemayo':
        return (
          <circle cx="200" cy="250" r="15" fill="#4caf50" stroke="#2e7d32" strokeWidth="2" />
        );
      case 'lily':
      default:
        return (
          <g>
            <path d="M200 300 C155 315 130 280 120 250 C140 270 170 285 200 290 Z" fill="#4caf50" stroke="#2e7d32" strokeWidth="2" />
            <path d="M200 300 C245 315 270 280 280 250 C260 270 230 285 200 290 Z" fill="#4caf50" stroke="#2e7d32" strokeWidth="2" />
            <path d="M200 300 C200 340 180 345 160 350 C180 330 195 315 200 300 Z" fill="#388e3c" />
          </g>
        );
    }
  };
  // --- 2. PÉTALOS ---
  const renderPetalos = () => {
    switch (type) {
      case 'rose':
        return (
          <g>
            {/* Roseta de capas concéntricas */}
            {/* Capa Exterior */}
            <path d="M200 240 C100 260 80 120 160 90 C200 90 200 180 200 240 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="0.8" opacity="0.95" />
            <path d="M200 240 C300 260 320 120 240 90 C200 90 200 180 200 240 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="0.8" opacity="0.95" />
            <path d="M200 250 C130 310 60 260 100 180 C140 180 180 210 200 250 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="0.8" opacity="0.95" />
            <path d="M200 250 C270 310 340 260 300 180 C260 180 220 210 200 250 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="0.8" opacity="0.95" />
            {/* Capa Media */}
            <circle cx="160" cy="160" r="45" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="0.5" />
            <circle cx="240" cy="160" r="45" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="0.5" />
            <circle cx="200" cy="205" r="45" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="0.5" />
            {/* Capa Interna */}
            <circle cx="180" cy="175" r="28" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="0.5" />
            <circle cx="220" cy="175" r="28" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="0.5" />
            <circle cx="200" cy="155" r="28" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="0.5" />
            <circle cx="200" cy="175" r="18" fill={color} stroke="#ffd700" strokeWidth="0.5" />
          </g>
        );
      case 'tulip':
        return (
          <g>
            {/* Forma de copa vertical clásica */}
            {/* Pétalos de atrás */}
            <path d="M200 290 C150 250 130 90 200 90 C270 90 250 250 200 290 Z" fill={`url(#petal-grad-${fid})`} opacity="0.85" stroke="#fff" strokeWidth="1" />
            {/* Pétalo Izquierdo */}
            <path d="M200 290 C100 290 90 120 185 100 C210 150 210 240 200 290 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1" />
            {/* Pétalo Derecho */}
            <path d="M200 290 C300 290 310 120 215 100 C190 150 190 240 200 290 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1" />
            {/* Pétalo Frontal */}
            <path d="M200 290 C170 280 160 140 200 130 C240 140 230 280 200 290 Z" fill={`url(#petal-grad-${fid})`} stroke="#ffe082" strokeWidth="0.5" />
          </g>
        );
      case 'sunflower':
        return (
          <g>
            {/* 16 pétalos radiales apuntando en ángulos */}
            {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, i) => (
              <path
                key={i}
                d="M200 200 L185 60 Q200 35 215 60 Z"
                fill={`url(#petal-grad-${fid})`}
                stroke="#ff8f00"
                strokeWidth="0.5"
                transform={`rotate(${angle} 200 200)`}
              />
            ))}
          </g>
        );
      case 'hibiscus':
        return (
          <g>
            {/* 5 pétalos superpuestos gigantes y planos */}
            <path d="M200 200 C130 110 90 50 170 50 C210 50 200 150 200 200 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1.2" />
            <path d="M200 200 C270 110 310 50 230 50 C190 50 200 150 200 200 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1.2" />
            <path d="M200 200 C280 180 340 230 310 285 C265 285 220 220 200 200 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1.2" />
            <path d="M200 200 C120 180 60 230 90 285 C135 285 180 220 200 200 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1.2" />
            <path d="M200 200 C140 260 160 340 200 340 C240 340 260 260 200 200 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1.2" />
          </g>
        );
      case 'cempasuchil':
        // Cempasúchil pom-pom
        const cempLayers = [
          { count: 16, r: 85, scale: 0.8 },
          { count: 12, r: 65, scale: 0.65 },
          { count: 8, r: 40, scale: 0.5 },
          { count: 4, r: 15, scale: 0.3 }
        ];
        let cempasuchilPetals = [];
        cempLayers.forEach((layer, layerIdx) => {
          for (let i = 0; i < layer.count; i++) {
            const angle = (360 / layer.count) * i + (layerIdx * 15);
            cempasuchilPetals.push(
              <path
                key={`cemp-${layerIdx}-${i}`}
                d="M200 200 C180 140 160 110 200 100 C240 110 220 140 200 200 Z"
                fill={`url(#petal-grad-${fid})`}
                stroke="#ffb300"
                strokeWidth="0.5"
                transform={`rotate(${angle} 200 200) translate(200 200) scale(${layer.scale}) translate(-200 -200)`}
              />
            );
          }
        });
        return <g>{cempasuchilPetals}</g>;
      case 'dalia':
        // Dalia Mexicana
        const dLayers = [
          { count: 18, scale: 0.82 },
          { count: 14, scale: 0.68 },
          { count: 10, scale: 0.52 },
          { count: 6, scale: 0.35 }
        ];
        let daliaPetals = [];
        dLayers.forEach((layer, layerIdx) => {
          for (let i = 0; i < layer.count; i++) {
            const angle = (360 / layer.count) * i + (layerIdx * 20);
            daliaPetals.push(
              <path
                key={`dalia-${layerIdx}-${i}`}
                d="M200 200 C160 120 170 80 200 70 C230 80 240 120 200 200 Z"
                fill={`url(#petal-grad-${fid})`}
                stroke="#fff"
                strokeWidth="0.5"
                transform={`rotate(${angle} 200 200) translate(200 200) scale(${layer.scale}) translate(-200 -200)`}
              />
            );
          }
        });
        return <g>{daliaPetals}</g>;
      case 'nochebuena':
        // Nochebuena bracts
        return (
          <g>
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, i) => (
              <path
                key={`noche-${i}`}
                d="M200 200 C150 140 145 60 200 40 C255 60 250 140 200 200 Z"
                fill={`url(#petal-grad-${fid})`}
                stroke="#b71c1c"
                strokeWidth="1"
                transform={`rotate(${angle} 200 200)`}
              />
            ))}
            <circle cx="200" cy="200" r="18" fill="#ffd54f" stroke="#2e7d32" strokeWidth="2" />
          </g>
        );
      case 'flordemayo':
        // Plumeria
        return (
          <g>
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <path
                key={`plume-${i}`}
                d="M200 200 C150 160 130 90 200 70 C230 70 240 130 200 200 Z"
                fill={`url(#petal-grad-${fid})`}
                stroke="#fff"
                strokeWidth="1.2"
                transform={`rotate(${angle} 200 200)`}
              />
            ))}
            <circle cx="200" cy="200" r="25" fill="#ffeb3b" opacity="0.8" />
          </g>
        );
      case 'lily':
      default:
        return (
          <g>
            {/* Pétalos traseros */}
            <path d="M200 200 C120 150 110 50 170 50 C200 80 200 150 200 200 Z" fill={`url(#petal-grad-${fid})`} opacity="0.9" stroke="#fff" strokeWidth="1" />
            <path d="M200 200 C280 150 290 50 230 50 C200 80 200 150 200 200 Z" fill={`url(#petal-grad-${fid})`} opacity="0.9" stroke="#fff" strokeWidth="1" />
            {/* Pétalos delanteros / laterales */}
            <path d="M200 200 C110 210 50 160 70 100 C110 110 160 160 200 200 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1" />
            <path d="M200 200 C290 210 350 160 330 100 C290 110 240 160 200 200 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1" />
            <path d="M200 200 C150 280 70 300 90 230 C120 220 170 210 200 200 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1" />
            <path d="M200 200 C250 280 330 300 310 230 C280 220 230 210 200 200 Z" fill={`url(#petal-grad-${fid})`} stroke="#fff" strokeWidth="1" />
          </g>
        );
    }
  };

  // --- 3. OVARIO ---
  const renderOvario = () => {
    switch (type) {
      case 'rose':
        return (
          <path d="M200 235 C165 235 150 285 200 298 C250 285 235 235 200 235 Z" fill="#1b5e20" stroke="#0a320a" strokeWidth="2.5" />
        );
      case 'tulip':
        return (
          <path d="M188 285 L212 285 L218 190 L182 190 Z" fill={`url(#ovary-grad-${fid})`} stroke="#1b5e20" strokeWidth="2" />
        );
      case 'sunflower':
        return (
          <g>
            {/* Ovario es el gran receptáculo / disco central */}
            <circle cx="200" cy="200" r="90" fill="#3e2723" stroke="#271711" strokeWidth="4" />
          </g>
        );
      case 'hibiscus':
        return (
          <path d="M200 200 C180 205 175 250 200 255 C225 250 220 205 200 200 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.5" />
        );
      case 'cempasuchil':
        return (
          <path d="M190 280 C190 250 185 220 200 215 C215 220 210 250 210 280 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.5" />
        );
      case 'dalia':
        return (
          <path d="M190 250 C170 250 170 290 200 295 C230 290 230 250 200 250 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="2" />
        );
      case 'nochebuena':
        return (
          <path d="M200 220 C180 225 175 255 200 265 C225 255 220 225 200 220 Z" fill="#4caf50" stroke="#1b5e20" strokeWidth="2" />
        );
      case 'flordemayo':
        return (
          <path d="M190 220 C190 200 185 240 200 245 C215 240 210 200 210 220 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="2" />
        );
      case 'lily':
      default:
        return (
          <path d="M200 200 C160 220 160 290 200 300 C240 290 240 220 200 200 Z" fill={`url(#ovary-grad-${fid})`} stroke="#1b5e20" strokeWidth="3" />
        );
    }
  };

  // --- 4. ÓVULOS ---
  const renderOvulos = () => {
    switch (type) {
      case 'rose':
        return (
          <g>
            <circle cx="185" cy="265" r="5" fill="#fff9c4" stroke="#fbc02d" strokeWidth="1" />
            <circle cx="215" cy="265" r="5" fill="#fff9c4" stroke="#fbc02d" strokeWidth="1" />
            <circle cx="200" cy="250" r="5" fill="#fff9c4" stroke="#fbc02d" strokeWidth="1" />
            <circle cx="200" cy="280" r="5" fill="#fff9c4" stroke="#fbc02d" strokeWidth="1" />
          </g>
        );
      case 'tulip':
        return (
          <g>
            <circle cx="195" cy="210" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="205" cy="210" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="195" cy="235" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="205" cy="235" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="195" cy="260" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="205" cy="260" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
          </g>
        );
      case 'sunflower':
        return (
          <g>
            {/* Múltiples óvulos radiales simulados concéntricos */}
            <circle cx="200" cy="200" r="70" fill="none" stroke="#ffeb3b" strokeWidth="4" strokeDasharray="3 7" />
            <circle cx="200" cy="200" r="50" fill="none" stroke="#ffeb3b" strokeWidth="4" strokeDasharray="4 8" />
            <circle cx="200" cy="200" r="30" fill="none" stroke="#ffd54f" strokeWidth="4" strokeDasharray="2 6" />
            <circle cx="200" cy="200" r="10" fill="#ffd54f" />
          </g>
        );
      case 'hibiscus':
        return (
          <g>
            <circle cx="194" cy="225" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="206" cy="225" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="200" cy="215" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="200" cy="235" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
          </g>
        );
      case 'cempasuchil':
        return (
          <g>
            <circle cx="200" cy="240" r="4" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="200" cy="260" r="4" fill="#fff9c4" stroke="#fbc02d" />
          </g>
        );
      case 'dalia':
        return (
          <g>
            <circle cx="190" cy="270" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="210" cy="270" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="200" cy="260" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="200" cy="280" r="4.5" fill="#fff9c4" stroke="#fbc02d" />
          </g>
        );
      case 'nochebuena':
        return (
          <g>
            <circle cx="193" cy="242" r="4" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="207" cy="242" r="4" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="200" cy="254" r="4" fill="#fff9c4" stroke="#fbc02d" />
          </g>
        );
      case 'flordemayo':
        return (
          <g>
            <circle cx="195" cy="230" r="3" fill="#fff9c4" stroke="#fbc02d" />
            <circle cx="205" cy="230" r="3" fill="#fff9c4" stroke="#fbc02d" />
          </g>
        );
      case 'lily':
      default:
        return (
          <g>
            <circle cx="185" cy="245" r="7" fill="#fff9c4" stroke="#fbc02d" strokeWidth="1.5" />
            <circle cx="215" cy="245" r="7" fill="#fff9c4" stroke="#fbc02d" strokeWidth="1.5" />
            <circle cx="185" cy="265" r="7" fill="#fff9c4" stroke="#fbc02d" strokeWidth="1.5" />
            <circle cx="215" cy="265" r="7" fill="#fff9c4" stroke="#fbc02d" strokeWidth="1.5" />
          </g>
        );
    }
  };
  // --- 5. PISTILO ---
  const renderPistilo = () => {
    switch (type) {
      case 'rose':
        return (
          <path d="M197 235 L197 165 L203 165 L203 235 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
        );
      case 'tulip':
        // En el tulipán el pistilo es casi inexistente, el ovario conecta directo al estigma
        return (
          <path d="M195 190 L205 190 L205 178 L195 178 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
        );
      case 'sunflower':
        return (
          <g>
            {/* Múltiples mini-pistilos en el disco central */}
            <path d="M160 170 Q160 150 163 145" fill="none" stroke="#81c784" strokeWidth="2" />
            <path d="M240 170 Q240 150 237 145" fill="none" stroke="#81c784" strokeWidth="2" />
            <path d="M200 140 Q200 120 202 115" fill="none" stroke="#81c784" strokeWidth="2" />
          </g>
        );
      case 'hibiscus':
        return (
          // Columna estaminal larga y curva característica
          <path d="M200 205 Q220 140 240 85" fill="none" stroke="#d81b60" strokeWidth="6.5" strokeLinecap="round" />
        );
      case 'cempasuchil':
        return (
          <path d="M198 215 L198 160 L202 160 L202 215 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
        );
      case 'dalia':
        return (
          <path d="M196 250 L196 150 L204 150 L204 250 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="1.5" />
        );
      case 'nochebuena':
        return (
          <path d="M197 220 L197 185 L203 185 L203 220 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
        );
      case 'flordemayo':
        return (
          <path d="M196 220 L196 160 L204 160 L204 220 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="1.5" />
        );
      case 'lily':
      default:
        return (
          <path d="M194 210 L194 135 L206 135 L206 210 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="1.5" />
        );
    }
  };

  // --- 6. ESTIGMA ---
  const renderEstigma = () => {
    switch (type) {
      case 'rose':
        return (
          <circle cx="200" cy="162" r="6" fill="#a5d6a7" stroke="#1b5e20" strokeWidth="1.5" />
        );
      case 'tulip':
        return (
          <g>
            {/* Estigma trilobulado ancho en la punta */}
            <circle cx="200" cy="172" r="8" fill="#c8e6c9" stroke="#1b5e20" strokeWidth="1.5" />
            <circle cx="192" cy="172" r="5" fill="#c8e6c9" stroke="#1b5e20" strokeWidth="1" />
            <circle cx="208" cy="172" r="5" fill="#c8e6c9" stroke="#1b5e20" strokeWidth="1" />
          </g>
        );
      case 'sunflower':
        return (
          <g>
            <path d="M163 145 Q165 140 167 145" fill="none" stroke="#ffeb3b" strokeWidth="1.5" />
            <path d="M237 145 Q235 140 233 145" fill="none" stroke="#ffeb3b" strokeWidth="1.5" />
            <path d="M202 115 Q204 110 206 115" fill="none" stroke="#ffeb3b" strokeWidth="1.5" />
          </g>
        );
      case 'hibiscus':
        return (
          <g>
            {/* 5 ramificaciones circulares rojas del estigma */}
            <circle cx="240" cy="78" r="4.5" fill="#880e4f" stroke="#310010" strokeWidth="1" />
            <circle cx="249" cy="80" r="4.5" fill="#880e4f" stroke="#310010" strokeWidth="1" />
            <circle cx="233" cy="88" r="4.5" fill="#880e4f" stroke="#310010" strokeWidth="1" />
            <circle cx="244" cy="91" r="4.5" fill="#880e4f" stroke="#310010" strokeWidth="1" />
            <circle cx="254" cy="87" r="4.5" fill="#880e4f" stroke="#310010" strokeWidth="1" />
          </g>
        );
      case 'cempasuchil':
        return (
          <circle cx="200" cy="158" r="4" fill="#ffeb3b" stroke="#fbc02d" strokeWidth="1" />
        );
      case 'dalia':
        return (
          <g>
            <circle cx="196" cy="148" r="4" fill="#a5d6a7" stroke="#1b5e20" />
            <circle cx="204" cy="148" r="4" fill="#a5d6a7" stroke="#1b5e20" />
          </g>
        );
      case 'nochebuena':
        return (
          <circle cx="200" cy="182" r="5" fill="#ffd54f" stroke="#f57f17" strokeWidth="1" />
        );
      case 'flordemayo':
        return (
          <path d="M192 160 C192 153 208 153 208 160 Z" fill="#c8e6c9" stroke="#1b5e20" strokeWidth="1" />
        );
      case 'lily':
      default:
        return (
          <g>
            <circle cx="200" cy="128" r="10" fill="#a5d6a7" stroke="#1b5e20" strokeWidth="2" />
            <circle cx="192" cy="124" r="7" fill="#a5d6a7" stroke="#1b5e20" strokeWidth="1.5" />
            <circle cx="208" cy="124" r="7" fill="#a5d6a7" stroke="#1b5e20" strokeWidth="1.5" />
          </g>
        );
    }
  };

  // --- 7. FILAMENTOS ---
  const renderFilamentos = () => {
    switch (type) {
      case 'rose':
        return (
          <g>
            {/* Múltiples filamentos en corona */}
            <path d="M175 220 Q160 190 170 170" fill="none" stroke="#a5d6a7" strokeWidth="2" />
            <path d="M225 220 Q240 190 230 170" fill="none" stroke="#a5d6a7" strokeWidth="2" />
            <path d="M185 225 Q170 200 182 175" fill="none" stroke="#a5d6a7" strokeWidth="2" />
            <path d="M215 225 Q230 200 218 175" fill="none" stroke="#a5d6a7" strokeWidth="2" />
          </g>
        );
      case 'tulip':
        return (
          <g>
            {/* 6 filamentos robustos basales */}
            <path d="M175 285 L165 200" fill="none" stroke="#fff9c4" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M225 285 L235 200" fill="none" stroke="#fff9c4" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M190 290 L175 220" fill="none" stroke="#fff9c4" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M210 290 L225 220" fill="none" stroke="#fff9c4" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      case 'sunflower':
        return (
          <g>
            <path d="M150 180 L145 165" fill="none" stroke="#ffeb3b" strokeWidth="2" />
            <path d="M250 180 L255 165" fill="none" stroke="#ffeb3b" strokeWidth="2" />
            <path d="M180 150 L178 140" fill="none" stroke="#ffeb3b" strokeWidth="2" />
            <path d="M220 150 L222 140" fill="none" stroke="#ffeb3b" strokeWidth="2" />
          </g>
        );
      case 'hibiscus':
        return (
          <g>
            {/* Pequeños filamentos que nacen de la columna estaminal */}
            <path d="M215 170 Q225 172 228 170" fill="none" stroke="#ffeb3b" strokeWidth="2" />
            <path d="M220 150 Q232 152 235 150" fill="none" stroke="#ffeb3b" strokeWidth="2" />
            <path d="M224 130 Q237 132 240 130" fill="none" stroke="#ffeb3b" strokeWidth="2" />
            <path d="M228 110 Q242 112 245 110" fill="none" stroke="#ffeb3b" strokeWidth="2" />
            {/* Lado izquierdo de la columna */}
            <path d="M211 160 Q199 158 196 160" fill="none" stroke="#ffeb3b" strokeWidth="2" />
            <path d="M216 140 Q204 138 201 140" fill="none" stroke="#ffeb3b" strokeWidth="2" />
            <path d="M220 120 Q208 118 205 120" fill="none" stroke="#ffeb3b" strokeWidth="2" />
          </g>
        );
      case 'cempasuchil':
        return (
          <g>
            <path d="M185 220 Q175 190 180 170" fill="none" stroke="#fff9c4" strokeWidth="1.5" />
            <path d="M215 220 Q225 190 220 170" fill="none" stroke="#fff9c4" strokeWidth="1.5" />
          </g>
        );
      case 'dalia':
        return (
          <g>
            <path d="M175 250 L170 180" fill="none" stroke="#a5d6a7" strokeWidth="2" />
            <path d="M225 250 L230 180" fill="none" stroke="#a5d6a7" strokeWidth="2" />
            <path d="M185 250 L180 175" fill="none" stroke="#a5d6a7" strokeWidth="1.5" />
            <path d="M215 250 L220 175" fill="none" stroke="#a5d6a7" strokeWidth="1.5" />
          </g>
        );
      case 'nochebuena':
        return (
          <g>
            <path d="M190 220 L180 185" fill="none" stroke="#c8e6c9" strokeWidth="2" />
            <path d="M210 220 L220 185" fill="none" stroke="#c8e6c9" strokeWidth="2" />
          </g>
        );
      case 'flordemayo':
        return (
          <g>
            <path d="M185 220 L180 170" fill="none" stroke="#c8e6c9" strokeWidth="2" />
            <path d="M215 220 L220 170" fill="none" stroke="#c8e6c9" strokeWidth="2" />
          </g>
        );
      case 'lily':
      default:
        return (
          <g>
            <path d="M180 230 Q160 210 165 155" fill="none" stroke="#c8e6c9" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M220 230 Q240 210 235 155" fill="none" stroke="#c8e6c9" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        );
    }
  };

  // --- 8. ANTERAS ---
  const renderAnteras = () => {
    switch (type) {
      case 'rose':
        return (
          <g>
            <circle cx="170" cy="168" r="3.5" fill="#fbc02d" stroke="#f57f17" strokeWidth="0.5" />
            <circle cx="230" cy="168" r="3.5" fill="#fbc02d" stroke="#f57f17" strokeWidth="0.5" />
            <circle cx="182" cy="173" r="3.5" fill="#fbc02d" stroke="#f57f17" strokeWidth="0.5" />
            <circle cx="218" cy="173" r="3.5" fill="#fbc02d" stroke="#f57f17" strokeWidth="0.5" />
          </g>
        );
      case 'tulip':
        return (
          <g>
            <rect x="159" y="190" width="12" height="15" rx="3" fill="#212121" stroke="#000" strokeWidth="1" />
            <rect x="229" y="190" width="12" height="15" rx="3" fill="#212121" stroke="#000" strokeWidth="1" />
            <rect x="169" y="210" width="10" height="13" rx="2.5" fill="#212121" stroke="#000" strokeWidth="1" />
            <rect x="221" y="210" width="10" height="13" rx="2.5" fill="#212121" stroke="#000" strokeWidth="1" />
          </g>
        );
      case 'sunflower':
        return (
          <g>
            <circle cx="145" cy="164" r="2.5" fill="#fbc02d" />
            <circle cx="255" cy="164" r="2.5" fill="#fbc02d" />
            <circle cx="178" cy="139" r="2.5" fill="#fbc02d" />
            <circle cx="222" cy="139" r="2.5" fill="#fbc02d" />
          </g>
        );
      case 'hibiscus':
        return (
          <g>
            <circle cx="229" cy="169" r="2.5" fill="#ffd54f" stroke="#ffb300" strokeWidth="0.5" />
            <circle cx="236" cy="149" r="2.5" fill="#ffd54f" stroke="#ffb300" strokeWidth="0.5" />
            <circle cx="241" cy="129" r="2.5" fill="#ffd54f" stroke="#ffb300" strokeWidth="0.5" />
            <circle cx="246" cy="109" r="2.5" fill="#ffd54f" stroke="#ffb300" strokeWidth="0.5" />
            {/* Lado izquierdo */}
            <circle cx="195" cy="159" r="2.5" fill="#ffd54f" stroke="#ffb300" strokeWidth="0.5" />
            <circle cx="200" cy="139" r="2.5" fill="#ffd54f" stroke="#ffb300" strokeWidth="0.5" />
            <circle cx="204" cy="119" r="2.5" fill="#ffd54f" stroke="#ffb300" strokeWidth="0.5" />
          </g>
        );
      case 'cempasuchil':
        return (
          <g>
            <circle cx="180" cy="168" r="3" fill="#ffb300" stroke="#f57f17" />
            <circle cx="220" cy="168" r="3" fill="#ffb300" stroke="#f57f17" />
          </g>
        );
      case 'dalia':
        return (
          <g>
            <circle cx="170" cy="178" r="3" fill="#ffeb3b" stroke="#fbc02d" />
            <circle cx="230" cy="178" r="3" fill="#ffeb3b" stroke="#fbc02d" />
            <circle cx="180" cy="173" r="3" fill="#ffeb3b" stroke="#fbc02d" />
            <circle cx="220" cy="173" r="3" fill="#ffeb3b" stroke="#fbc02d" />
          </g>
        );
      case 'nochebuena':
        return (
          <g>
            <circle cx="180" cy="182" r="3" fill="#fbc02d" />
            <circle cx="220" cy="182" r="3" fill="#fbc02d" />
          </g>
        );
      case 'flordemayo':
        return (
          <g>
            <path d="M176 166 Q180 162 184 166 Z" fill="#ffd54f" stroke="#ffb300" strokeWidth="1" />
            <path d="M216 166 Q220 162 224 166 Z" fill="#ffd54f" stroke="#ffb300" strokeWidth="1" />
          </g>
        );
      case 'lily':
      default:
        return (
          <g>
            <path d="M160 148 Q165 140 170 148 L170 158 Q165 166 160 158 Z" fill="#ffeb3b" stroke="#fbc02d" strokeWidth="1.5" />
            <path d="M230 148 Q235 140 240 148 L240 158 Q235 166 230 158 Z" fill="#ffeb3b" stroke="#fbc02d" strokeWidth="1.5" />
          </g>
        );
    }
  };

  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      {/* Definiciones para degradados */}
      <defs>
        <radialGradient id={`petal-grad-${fid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
        <radialGradient id={`ovary-grad-${fid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a5d6a7" />
          <stop offset="100%" stopColor="#2e7d32" />
        </radialGradient>
      </defs>

      <g
        style={{
          transform: isDissectedMode ? 'translate(200px, 200px) scale(0.68) translate(-200px, -200px)' : 'none',
          transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformOrigin: '200px 200px'
        }}
      >
        {/* Tallo (Base de Fondo) */}
        <path d="M200 300 Q195 350 190 395" fill="none" stroke="#2e7d32" strokeWidth="12" strokeLinecap="round" />

        {/* SÉPALOS */}
        <g
          {...getPartProps('sepalos')}
          style={{
            ...getPartProps('sepalos').style,
            transform: isDissected('sepalos') ? 'translate(-70px, 130px) scale(1.15)' : 'none',
            transformOrigin: '200px 200px',
            transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {renderSepalos()}
        </g>

        {/* PÉTALOS */}
        <g
          {...getPartProps('petalos')}
          style={{
            ...getPartProps('petalos').style,
            transform: isDissected('petalos') ? 'translate(0px, -130px) scale(1.15)' : 'none',
            transformOrigin: '200px 200px',
            transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {renderPetalos()}
        </g>

        {/* OVARIO */}
        <g
          {...getPartProps('ovario')}
          style={{
            ...getPartProps('ovario').style,
            transform: isDissected('ovario') ? 'translate(-120px, 40px) scale(1.15)' : 'none',
            transformOrigin: '200px 200px',
            transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {renderOvario()}
        </g>

        {/* ÓVULOS (Dentro del Ovario) */}
        <g
          {...getPartProps('ovulo')}
          style={{
            ...getPartProps('ovulo').style,
            transform: isDissected('ovulo')
              ? 'translate(70px, 130px) scale(1.3)'
              : (isDissected('ovario')
                ? 'translate(-120px, 40px)'
                : 'none'),
            transformOrigin: '200px 255px',
            transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {renderOvulos()}
        </g>

        {/* PISTILO / ESTILO (Sube del ovario al estigma) */}
        <g
          {...getPartProps('pistilo')}
          style={{
            ...getPartProps('pistilo').style,
            transform: isDissected('pistilo') ? 'translate(100px, 60px) scale(1.15)' : 'none',
            transformOrigin: '200px 200px',
            transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {renderPistilo()}
        </g>

        {/* ESTIGMA (Cúpula del pistilo) */}
        <g
          {...getPartProps('estigma')}
          style={{
            ...getPartProps('estigma').style,
            transform: isDissected('estigma') ? 'translate(110px, -120px) scale(1.15)' : 'none',
            transformOrigin: '200px 200px',
            transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {renderEstigma()}
        </g>

        {/* FILAMENTOS (Estambres) */}
        <g
          {...getPartProps('filamento')}
          style={{
            ...getPartProps('filamento').style,
            transform: isDissected('filamento') ? 'translate(-110px, -90px) scale(1.15)' : 'none',
            transformOrigin: '200px 200px',
            transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {renderFilamentos()}
        </g>

        {/* ANTERAS (Cabezas de los estambres) */}
        <g
          {...getPartProps('antera')}
          style={{
            ...getPartProps('antera').style,
            transform: isDissected('antera') ? 'translate(130px, -30px) scale(1.15)' : 'none',
            transformOrigin: '200px 200px',
            transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {renderAnteras()}
        </g>

        {/* Elementos de texto e interactivos decorativos si la flor no está en modo juego */}
      </g>
    </svg>
  );
};

// --- FUNCIÓN GENERADORA DEL CÓDIGO HTML INDEPENDIENTE ---
export const generateBioFlorCode = (config, selectedFlowers, difficultyKey, gameDetails = {}, selectedPlatforms = ['web']) => {
  const gameName = gameDetails.gameName || 'BioFlor';
  const gameDesc = gameDetails.description || 'Juego educativo de anatomía floral.';
  const gameVersion = gameDetails.version || '1.0.0';
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
  const platformsStr = selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');

  const selectedFlowersData = selectedFlowers.map(id => FLOWER_CATALOG.find(f => f.id === id)).filter(Boolean);
  const initialFlower = selectedFlowersData[0] || FLOWER_CATALOG[0];

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Juego de BioFlor</title>
    <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; background: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; }
    button { font-family: inherit; }

        .flower-part { transform-origin: 200px 200px; transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease, opacity 0.3s ease; }
        #svg-ovulo { transform-origin: 200px 255px; }
        .flower-part.highlighted { filter: drop-shadow(0 0 12px #ffd700) brightness(1.3) !important; }
        .flower-part.dissected { transform: translate(var(--dx), var(--dy)) scale(1.15); opacity: 0.7; }
        #svg-ovulo.dissected { transform: translate(var(--dx), var(--dy)) scale(1.3); }
        .flower-part.interactive-part { cursor: pointer; }

        .flower-part.drag-over-part { filter: drop-shadow(0 0 12px var(--primary-color)) brightness(1.1); }
        .flower-part.correct-glow { filter: drop-shadow(0 0 15px var(--correct-color)) !important; opacity: 1 !important; transform: translate(0px, 0px) !important; pointer-events: none; }
        .flower-part.wrong-glow { animation: shake-glow 0.4s ease-in-out; filter: drop-shadow(0 0 15px var(--wrong-color)) !important; }

        @keyframes shake-glow {
          0%, 100% { transform: translate(var(--dx), var(--dy)); }
          20%, 60% { transform: translate(calc(var(--dx) - 5px), var(--dy)); }
          40%, 80% { transform: translate(calc(var(--dx) + 5px), var(--dy)); }
        }
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
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
        .close-info-btn:hover { color: var(--wrong-color); }

    ${BIOFLOR_PREVIEW_STYLES}
    .game-title.static span { animation: none; transform: none; }
  </style>
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://unpkg.com/lucide@0.263.1/dist/umd/lucide.js"></script>

    <div id="start-screen" class="overlay">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; text-align: center; color: var(--secondary-color);">${gameDetails.gameName || 'Juego de BioFlor'}</h1>
        <div style="background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">
            Nivel: ${difficultyKey}
        </div>
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
                <h2 class="info-title">Juego de BioFlor</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
            </div>
            <div class="info-details-grid">
                <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${gameDetails.authorName || 'No especificado'}</span></div>
                <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${gameVersion}</span></div>
                <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${platformsStr}</span></div>
                <div class="info-item"><span class="info-label">Nivel</span><span class="info-value">${difficultyKey}</span></div>
                <div class="info-item info-desc">
                    <span class="info-label">Descripción</span>
                    <p class="info-value">${gameDesc}</p>
                </div>
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
                <h2 class="info-title">Cómo Jugar BioFlor</h2>
                <div class="info-subtitle">Aprende a identificar las partes de la flor</div>
            </div>

            <div class="info-details-grid" style="grid-template-columns: 1fr;">
                <div class="info-item info-desc" style="background: #f8fafc; padding: 1.5rem; border: none; border-radius: 0.5rem;">
                    <ul style="margin: 0; padding-left: 1.2rem; color: #334155; line-height: 1.6; font-size: 1.05rem;">
                        <li style="margin-bottom: 0.75rem;">Haz clic en <strong>"Separar Partes"</strong> para visualizar todas las piezas anatómicas de la flor desglosadas.</li>
                        <li style="margin-bottom: 0.75rem;"><strong>Arrastra</strong> las piezas desde el panel de piezas disponibles hacia los recuadros con sus nombres correspondientes.</li>
                        <li style="margin-bottom: 0.75rem;">También puedes <strong>hacer clic</strong> en una pieza y luego en su recuadro para colocarla.</li>
                        <li style="margin-bottom: 0.75rem;">Una vez colocadas, presiona <strong>"Validar Solución"</strong> para comprobar tus aciertos.</li>
                        <li style="margin-bottom: 0.75rem;">Las partes correctas quedarán fijas con un borde verde. Las incorrectas se iluminarán en rojo para que lo intentes de nuevo.</li>
                        <li style="margin-bottom: 0.75rem;">Al completar correctamente las <strong>8 partes</strong> de la flor, obtienes <strong>10 puntos</strong>.</li>
                        <li>Si el tiempo se agota antes de completar el ejercicio, se pasa al <strong>siguiente ejercicio</strong> sin puntaje.</li>
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
             <button class="big-btn btn-exit" onclick="exitGame()">Salir</button>
             <button class="big-btn btn-retry" onclick="location.reload()">Volver a Jugar</button>
        </div>
    </div>

    <div class="bioflor-container" id="game-ui" style="display:none;">
        <div class="game-title" style="margin-bottom:0.5rem;">Cargando...</div>

        <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
            <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
            <span style="font-size:1rem; color:#1e40af; font-weight:500;">Disecciona la flor separando sus partes y colócalas en el recuadro del nombre correcto.</span>
        </div>

        <div class="game-layout">
            <div class="game-main-col"><div class="diagram-panel">
                <div style="display:flex; flex-direction:row; justify-content:center; align-items:center; gap:0.75rem; width:100%; margin-bottom:1rem;">
                 <button class="no-rounded-button btn-primary" onclick="toggleHowToPlay(true)" style="margin:0; width:auto; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Cómo Jugar
                    </button>    
                <button class="no-rounded-button btn-primary" onclick="toggleDissect()" id="dissect-btn" style="margin:0; width:auto; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg> Separar Partes
                    </button>

                </div>

                <div class="flower-svg-container" id="flower-svg-wrapper">
                    <!-- SVG FLOR -->
                    <svg viewBox="0 0 400 400" width="100%" height="100%">
                        <defs>
                            <radialGradient id="petal-grad" cx="50%" cy="50%" r="50%">
                                <stop id="petal-grad-start" offset="0%" stop-color="${initialFlower.colorLight}" />
                                <stop id="petal-grad-end" offset="100%" stop-color="${initialFlower.color}" />
                            </radialGradient>
                            <radialGradient id="ovary-grad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#a5d6a7" />
                                <stop offset="100%" stop-color="#2e7d32" />
                            </radialGradient>
                        </defs>
                        <g id="flower-svg-content" style="transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 200px 200px;">
                            <path d="M200 300 Q195 350 190 395" fill="none" stroke="#2e7d32" stroke-width="12" stroke-linecap="round" />

                            <g class="flower-part interactive-part" id="svg-sepalos" style="--dx:-70px; --dy:130px;" ondragover="allowDrop(event, 'sepalos')" ondragleave="dragLeave(event, 'sepalos')" ondrop="dropOnPart(event, 'sepalos')" onclick="clickPart('sepalos')" onmouseenter="hoverPart('sepalos')" onmouseleave="hoverPart(null)"></g>
                            <g class="flower-part interactive-part" id="svg-petalos" style="--dx:0px; --dy:-130px;" ondragover="allowDrop(event, 'petalos')" ondragleave="dragLeave(event, 'petalos')" ondrop="dropOnPart(event, 'petalos')" onclick="clickPart('petalos')" onmouseenter="hoverPart('petalos')" onmouseleave="hoverPart(null)"></g>
                            <g class="flower-part interactive-part" id="svg-ovario" style="--dx:-120px; --dy:40px;" ondragover="allowDrop(event, 'ovario')" ondragleave="dragLeave(event, 'ovario')" ondrop="dropOnPart(event, 'ovario')" onclick="clickPart('ovario')" onmouseenter="hoverPart('ovario')" onmouseleave="hoverPart(null)"></g>
                            <g class="flower-part interactive-part" id="svg-ovulo" style="--dx:70px; --dy:130px;" ondragover="allowDrop(event, 'ovulo')" ondragleave="dragLeave(event, 'ovulo')" ondrop="dropOnPart(event, 'ovulo')" onclick="clickPart('ovulo')" onmouseenter="hoverPart('ovulo')" onmouseleave="hoverPart(null)"></g>
                            <g class="flower-part interactive-part" id="svg-pistilo" style="--dx:100px; --dy:60px;" ondragover="allowDrop(event, 'pistilo')" ondragleave="dragLeave(event, 'pistilo')" ondrop="dropOnPart(event, 'pistilo')" onclick="clickPart('pistilo')" onmouseenter="hoverPart('pistilo')" onmouseleave="hoverPart(null)"></g>
                            <g class="flower-part interactive-part" id="svg-estigma" style="--dx:110px; --dy:-120px;" ondragover="allowDrop(event, 'estigma')" ondragleave="dragLeave(event, 'estigma')" ondrop="dropOnPart(event, 'estigma')" onclick="clickPart('estigma')" onmouseenter="hoverPart('estigma')" onmouseleave="hoverPart(null)"></g>
                            <g class="flower-part interactive-part" id="svg-filamento" style="--dx:-110px; --dy:-90px;" ondragover="allowDrop(event, 'filamento')" ondragleave="dragLeave(event, 'filamento')" ondrop="dropOnPart(event, 'filamento')" onclick="clickPart('filamento')" onmouseenter="hoverPart('filamento')" onmouseleave="hoverPart(null)"></g>
                            <g class="flower-part interactive-part" id="svg-antera" style="--dx:130px; --dy:-30px;" ondragover="allowDrop(event, 'antera')" ondragleave="dragLeave(event, 'antera')" ondrop="dropOnPart(event, 'antera')" onclick="clickPart('antera')" onmouseenter="hoverPart('antera')" onmouseleave="hoverPart(null)"></g>
                        </g>
                    </svg>
                </div>
                <div id="flower-diagram-label" style="text-align: center; color: #6b7280; font-size: 0.85rem; font-weight: bold; margin-top: 0.5rem; margin-bottom: 0.5rem;">
                    Flor Completa (Haz clic en Separar Partes)
                </div>

                <div class="pieces-dock">
                    <h4 ><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> Piezas Disponibles</h4>
                    <div class="dock-grid" id="dock-grid"></div>
                </div>
            </div>

            </div>
            <div class="game-right-col">
                <div class="stats-block">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg> Progreso
                    </h3>
                    <div class="stats-item" style="margin-top: 1rem;">
                        <span>Dificultad:</span> <strong style="color:var(--primary-color)">${difficultyKey}</strong>
                    </div>
                    <div class="stats-item">
                        <span>Flor Activa:</span> <strong id="active-flower-display" style="color:var(--primary-color)"></strong>
                    </div>
                    <div class="stats-item">
                        <span>Ejercicio:</span> <strong id="progress-display" style="color:var(--primary-color)">1/${selectedFlowersData.length}</strong>
                    </div>
                    <div class="stats-item">
                        <span>Tiempo:</span> <strong id="timer-display" style="color:var(--primary-color)">--:--</strong>
                    </div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray-color); padding-top: 0.75rem; margin-top: 0.75rem;">
                        <span>Puntaje:</span> <strong style="font-size: 1.2rem; color:var(--primary-color)"><span id="score-display">0</span> pts</strong>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.65rem; margin-top:1.25rem;">
                        <button class="no-rounded-button btn-primary" onclick="validateSolution()" style="width:100%;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Validar Solución</button>
                        <button class="no-rounded-button btn-primary" onclick="confirmFinishGame()" style="width:100%;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Finalizar Juego</button>
                    </div>
                </div>

                <h3 style="font-size:1.2rem; font-weight:700; color:var(--secondary-color); margin-top:20px; margin-bottom:8px; text-align:center;">Tabla de nombres</h3>
                <div class="association-panel" style="margin-top:0.5rem;" id="association-panel"></div>
            </div>
        </div>
    </div>

    <script>
        const partsList = ['sepalos', 'petalos', 'antera', 'filamento', 'estigma', 'pistilo', 'ovario', 'ovulo'];
        const partsLabels = {
            sepalos: 'Sépalos', petalos: 'Pétalos', antera: 'Antera', filamento: 'Filamento',
            estigma: 'Estigma', pistilo: 'Pistilo (Estilo)', ovario: 'Ovario', ovulo: 'Óvulo'
        };

        const selectedFlowers = ${JSON.stringify(selectedFlowersData)};

        let state = {
            isDissected: false,
            selectedPiece: null,
            timeLeft: ${config.timeLimit},
            pendingAssociations: {},
            score: 0,
            accumulatedScore: 0,
            currentFlowerIndex: 0,
            timerInterval: null,
            correctParts: [],
            pendingGreenParts: [],
            wrongParts: [],
            active: false
        };

        function getFlowerSvgs(type, color, colorLight) {
            let sepalos = '', petalos = '', ovario = '', ovulo = '', pistilo = '', estigma = '', filamento = '', antera = '';

            const petalGradStart = document.getElementById('petal-grad-start');
            const petalGradEnd = document.getElementById('petal-grad-end');
            if (petalGradStart && petalGradEnd) {
                petalGradStart.setAttribute('stop-color', colorLight);
                petalGradEnd.setAttribute('stop-color', color);
            }

            switch(type) {
                case 'rose':
                    sepalos = '<path d="M160 250 Q130 220 120 180 Q145 200 170 230 Z" fill="#2e7d32" stroke="#1b5e20" stroke-width="1" />' +
                              '<path d="M240 250 Q270 220 280 180 Q255 200 230 230 Z" fill="#2e7d32" stroke="#1b5e20" stroke-width="1" />' +
                              '<path d="M200 260 Q170 310 150 330 Q185 300 200 270 Z" fill="#1b5e20" />' +
                              '<path d="M200 260 Q230 310 250 330 Q215 300 200 270 Z" fill="#1b5e20" />';
                    petalos = '<path d="M200 240 C100 260 80 120 160 90 C200 90 200 180 200 240 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.8" opacity="0.95" />' +
                              '<path d="M200 240 C300 260 320 120 240 90 C200 90 200 180 200 240 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.8" opacity="0.95" />' +
                              '<path d="M200 250 C130 310 60 260 100 180 C140 180 180 210 200 250 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.8" opacity="0.95" />' +
                              '<path d="M200 250 C270 310 340 260 300 180 C260 180 220 210 200 250 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.8" opacity="0.95" />' +
                              '<circle cx="160" cy="160" r="45" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.5" />' +
                              '<circle cx="240" cy="160" r="45" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.5" />' +
                              '<circle cx="200" cy="205" r="45" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.5" />' +
                              '<circle cx="180" cy="175" r="28" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.5" />' +
                              '<circle cx="220" cy="175" r="28" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.5" />' +
                              '<circle cx="200" cy="155" r="28" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.5" />' +
                              '<circle cx="200" cy="175" r="18" fill="' + color + '" stroke="#ffd700" stroke-width="0.5" />';
                    ovario = '<path d="M200 235 C165 235 150 285 200 298 C250 285 235 235 200 235 Z" fill="#1b5e20" stroke="#0a320a" stroke-width="2.5" />';
                    ovulo = '<circle cx="185" cy="265" r="5" fill="#fff9c4" stroke="#fbc02d" stroke-width="1" />' +
                            '<circle cx="215" cy="265" r="5" fill="#fff9c4" stroke="#fbc02d" stroke-width="1" />' +
                            '<circle cx="200" cy="250" r="5" fill="#fff9c4" stroke="#fbc02d" stroke-width="1" />' +
                            '<circle cx="200" cy="280" r="5" fill="#fff9c4" stroke="#fbc02d" stroke-width="1" />';
                    pistilo = '<path d="M197 235 L197 165 L203 165 L203 235 Z" fill="#81c784" stroke="#2e7d32" stroke-width="1" />';
                    estigma = '<circle cx="200" cy="162" r="6" fill="#a5d6a7" stroke="#1b5e20" stroke-width="1.5" />';
                    filamento = '<path d="M175 220 Q160 190 170 170" fill="none" stroke="#a5d6a7" stroke-width="2" />' +
                                '<path d="M225 220 Q240 190 230 170" fill="none" stroke="#a5d6a7" stroke-width="2" />' +
                                '<path d="M185 225 Q170 200 182 175" fill="none" stroke="#a5d6a7" stroke-width="2" />' +
                                '<path d="M215 225 Q230 200 218 175" fill="none" stroke="#a5d6a7" stroke-width="2" />';
                    antera = '<circle cx="170" cy="168" r="3.5" fill="#fbc02d" stroke="#f57f17" stroke-width="0.5" />' +
                             '<circle cx="230" cy="168" r="3.5" fill="#fbc02d" stroke="#f57f17" stroke-width="0.5" />' +
                             '<circle cx="182" cy="173" r="3.5" fill="#fbc02d" stroke="#f57f17" stroke-width="0.5" />' +
                             '<circle cx="218" cy="173" r="3.5" fill="#fbc02d" stroke="#f57f17" stroke-width="0.5" />';
                    break;
                case 'tulip':
                    sepalos = '<path d="M175 285 C160 295 145 315 150 335 C165 315 175 300 182 285 Z" fill="#388e3c" stroke="#2e7d32" />' +
                              '<path d="M225 285 C240 295 255 315 250 335 C235 315 225 300 218 285 Z" fill="#388e3c" stroke="#2e7d32" />';
                    petalos = '<path d="M200 290 C150 250 130 90 200 90 C270 90 250 250 200 290 Z" fill="url(#petal-grad)" opacity="0.85" stroke="#fff" stroke-width="1" />' +
                              '<path d="M200 290 C100 290 90 120 185 100 C210 150 210 240 200 290 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1" />' +
                              '<path d="M200 290 C300 290 310 120 215 100 C190 150 190 240 200 290 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1" />' +
                              '<path d="M200 290 C170 280 160 140 200 130 C240 140 230 280 200 290 Z" fill="url(#petal-grad)" stroke="#ffe082" stroke-width="0.5" />';
                    ovario = '<path d="M188 285 L212 285 L218 190 L182 190 Z" fill="url(#ovary-grad)" stroke="#1b5e20" stroke-width="2" />';
                    ovulo = '<circle cx="195" cy="210" r="4.5" fill="#fff9c4" stroke="#fbc02d" />' +
                            '<circle cx="205" cy="210" r="4.5" fill="#fff9c4" stroke="#fbc02d" />' +
                            '<circle cx="195" cy="235" r="4.5" fill="#fff9c4" stroke="#fbc02d" />' +
                            '<circle cx="205" cy="235" r="4.5" fill="#fff9c4" stroke="#fbc02d" />' +
                            '<circle cx="195" cy="260" r="4.5" fill="#fff9c4" stroke="#fbc02d" />' +
                            '<circle cx="205" cy="260" r="4.5" fill="#fff9c4" stroke="#fbc02d" />';
                    pistilo = '<path d="M195 190 L205 190 L205 178 L195 178 Z" fill="#81c784" stroke="#2e7d32" stroke-width="1" />';
                    estigma = '<circle cx="200" cy="172" r="8" fill="#c8e6c9" stroke="#1b5e20" stroke-width="1.5" />' +
                              '<circle cx="192" cy="172" r="5" fill="#c8e6c9" stroke="#1b5e20" stroke-width="1" />' +
                              '<circle cx="208" cy="172" r="5" fill="#c8e6c9" stroke="#1b5e20" stroke-width="1" />';
                    filamento = '<path d="M175 285 L165 200" fill="none" stroke="#fff9c4" stroke-width="4.5" stroke-linecap="round" />' +
                                '<path d="M225 285 L235 200" fill="none" stroke="#fff9c4" stroke-width="4.5" stroke-linecap="round" />' +
                                '<path d="M190 290 L175 220" fill="none" stroke="#fff9c4" stroke-width="3.5" stroke-linecap="round" />' +
                                '<path d="M210 290 L225 220" fill="none" stroke="#fff9c4" stroke-width="3.5" stroke-linecap="round" />';
                    antera = '<rect x="159" y="190" width="12" height="15" rx="3" fill="#212121" stroke="#000" stroke-width="1" />' +
                             '<rect x="229" y="190" width="12" height="15" rx="3" fill="#212121" stroke="#000" stroke-width="1" />' +
                             '<rect x="169" y="210" width="10" height="13" rx="2.5" fill="#212121" stroke="#000" stroke-width="1" />' +
                             '<rect x="221" y="210" width="10" height="13" rx="2.5" fill="#212121" stroke="#000" stroke-width="1" />';
                    break;
                case 'sunflower':
                    sepalos = '<path d="M110 200 Q90 220 70 230 Q105 230 120 210 Z" fill="#2e7d32" />' +
                              '<path d="M290 200 Q310 220 330 230 Q295 230 280 210 Z" fill="#2e7d32" />' +
                              '<path d="M130 250 Q110 280 90 300 Q130 280 145 260 Z" fill="#2e7d32" />' +
                              '<path d="M270 250 Q290 280 310 300 Q270 280 255 260 Z" fill="#2e7d32" />' +
                              '<path d="M200 290 Q200 335 190 350 Q210 335 200 295 Z" fill="#1b5e20" />';

                    let radialPetals = '';
                    const angles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];
                    angles.forEach(function(angle) {
                        radialPetals += '<path d="M200 200 L185 60 Q200 35 215 60 Z" fill="url(#petal-grad)" stroke="#ff8f00" stroke-width="0.5" transform="rotate(' + angle + ' 200 200)" />';
                    });
                    petalos = radialPetals;

                    ovario = '<circle cx="200" cy="200" r="90" fill="#3e2723" stroke="#271711" stroke-width="4" />';
                    ovulo = '<circle cx="200" cy="200" r="70" fill="none" stroke="#ffeb3b" stroke-width="4" stroke-dasharray="3 7" />' +
                            '<circle cx="200" cy="200" r="50" fill="none" stroke="#ffeb3b" stroke-width="4" stroke-dasharray="4 8" />' +
                            '<circle cx="200" cy="200" r="30" fill="none" stroke="#ffd54f" stroke-width="4" stroke-dasharray="2 6" />' +
                            '<circle cx="200" cy="200" r="10" fill="#ffd54f" />';
                    pistilo = '<path d="M160 170 Q160 150 163 145" fill="none" stroke="#81c784" stroke-width="2" />' +
                              '<path d="M240 170 Q240 150 237 145" fill="none" stroke="#81c784" stroke-width="2" />' +
                              '<path d="M200 140 Q200 120 202 115" fill="none" stroke="#81c784" stroke-width="2" />';
                    estigma = '<path d="M163 145 Q165 140 167 145" fill="none" stroke="#ffeb3b" stroke-width="1.5" />' +
                              '<path d="M237 145 Q235 140 233 145" fill="none" stroke="#ffeb3b" stroke-width="1.5" />' +
                              '<path d="M202 115 Q204 110 206 115" fill="none" stroke="#ffeb3b" stroke-width="1.5" />';
                    filamento = '<path d="M150 180 L145 165" fill="none" stroke="#ffeb3b" stroke-width="2" />' +
                                '<path d="M250 180 L255 165" fill="none" stroke="#ffeb3b" stroke-width="2" />' +
                                '<path d="M180 150 L178 140" fill="none" stroke="#ffeb3b" stroke-width="2" />' +
                                '<path d="M220 150 L222 140" fill="none" stroke="#ffeb3b" stroke-width="2" />';
                    antera = '<circle cx="145" cy="164" r="2.5" fill="#fbc02d" />' +
                             '<circle cx="255" cy="164" r="2.5" fill="#fbc02d" />' +
                             '<circle cx="178" cy="139" r="2.5" fill="#fbc02d" />' +
                             '<circle cx="222" cy="139" r="2.5" fill="#fbc02d" />';
                    break;
                case 'hibiscus':
                    sepalos = '<path d="M165 240 C155 265 170 285 200 288 C230 285 245 265 235 240 C220 260 180 260 165 240 Z" fill="#388e3c" stroke="#1b5e20" stroke-width="1.5" />';
                    petalos = '<path d="M200 200 C130 110 90 50 170 50 C210 50 200 150 200 200 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1.2" />' +
                              '<path d="M200 200 C270 110 310 50 230 50 C190 50 200 150 200 200 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1.2" />' +
                              '<path d="M200 200 C280 180 340 230 310 285 C265 285 220 220 200 200 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1.2" />' +
                              '<path d="M200 200 C120 180 60 230 90 285 C135 285 180 220 200 200 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1.2" />' +
                              '<path d="M200 200 C140 260 160 340 200 340 C240 340 260 260 200 200 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1.2" />';
                    ovario = '<path d="M200 200 C180 205 175 250 200 255 C225 250 220 205 200 200 Z" fill="#2e7d32" stroke="#1b5e20" stroke-width="1.5" />';
                    ovulo = '<circle cx="194" cy="225" r="4.5" fill="#fff9c4" stroke="#fbc02d" />' +
                            '<circle cx="206" cy="225" r="4.5" fill="#fff9c4" stroke="#fbc02d" />' +
                            '<circle cx="200" cy="215" r="4.5" fill="#fff9c4" stroke="#fbc02d" />' +
                            '<circle cx="200" cy="235" r="4.5" fill="#fff9c4" stroke="#fbc02d" />';
                    pistilo = '<path d="M200 205 Q220 140 240 85" fill="none" stroke="#d81b60" stroke-width="6.5" stroke-linecap="round" />';
                    estigma = '<circle cx="240" cy="78" r="4.5" fill="#880e4f" stroke="#310010" stroke-width="1" />' +
                              '<circle cx="249" cy="80" r="4.5" fill="#880e4f" stroke="#310010" stroke-width="1" />' +
                              '<circle cx="233" cy="88" r="4.5" fill="#880e4f" stroke="#310010" stroke-width="1" />' +
                              '<circle cx="244" cy="91" r="4.5" fill="#880e4f" stroke="#310010" stroke-width="1" />' +
                              '<circle cx="254" cy="87" r="4.5" fill="#880e4f" stroke="#310010" stroke-width="1" />';
                    filamento = '<path d="M215 170 Q225 172 228 170" fill="none" stroke="#ffeb3b" stroke-width="2" />' +
                                '<path d="M220 150 Q232 152 235 150" fill="none" stroke="#ffeb3b" stroke-width="2" />' +
                                '<path d="M224 130 Q237 132 240 130" fill="none" stroke="#ffeb3b" stroke-width="2" />' +
                                '<path d="M228 110 Q242 112 245 110" fill="none" stroke="#ffeb3b" stroke-width="2" />' +
                                '<path d="M211 160 Q199 158 196 160" fill="none" stroke="#ffeb3b" stroke-width="2" />' +
                                '<path d="M216 140 Q204 138 201 140" fill="none" stroke="#ffeb3b" stroke-width="2" />' +
                                '<path d="M220 120 Q208 118 205 120" fill="none" stroke="#ffeb3b" stroke-width="2" />';
                    antera = '<circle cx="229" cy="169" r="2.5" fill="#ffd54f" stroke="#ffb300" stroke-width="0.5" />' +
                             '<circle cx="236" cy="149" r="2.5" fill="#ffd54f" stroke="#ffb300" stroke-width="0.5" />' +
                             '<circle cx="241" cy="129" r="2.5" fill="#ffd54f" stroke="#ffb300" stroke-width="0.5" />' +
                             '<circle cx="246" cy="109" r="2.5" fill="#ffd54f" stroke="#ffb300" stroke-width="0.5" />' +
                             '<circle cx="195" cy="159" r="2.5" fill="#ffd54f" stroke="#ffb300" stroke-width="0.5" />' +
                             '<circle cx="200" cy="139" r="2.5" fill="#ffd54f" stroke="#ffb300" stroke-width="0.5" />' +
                             '<circle cx="204" cy="119" r="2.5" fill="#ffd54f" stroke="#ffb300" stroke-width="0.5" />';
                    break;
                case 'cempasuchil':
                    sepalos = '<path d="M165 240 Q150 280 200 290 Q250 280 235 240 Z" fill="#2e7d32" stroke="#1b5e20" stroke-width="1.5" />';
                    let cempasuchilPetals = '';
                    const cempLayers = [
                        { count: 16, scale: 0.8 },
                        { count: 12, scale: 0.65 },
                        { count: 8, scale: 0.5 },
                        { count: 4, scale: 0.3 }
                    ];
                    cempLayers.forEach(function(layer, layerIdx) {
                        for (let i = 0; i < layer.count; i++) {
                            const angle = (360 / layer.count) * i + (layerIdx * 15);
                            cempasuchilPetals += '<path d="M200 200 C180 140 160 110 200 100 C240 110 220 140 200 200 Z" fill="url(#petal-grad)" stroke="#ffb300" stroke-width="0.5" transform="rotate(' + angle + ' 200 200) translate(200 200) scale(' + layer.scale + ') translate(-200 -200)" />';
                        }
                    });
                    petalos = cempasuchilPetals;
                    ovario = '<ellipse cx="200" cy="245" rx="20" ry="30" fill="url(#ovary-grad)" stroke="#1b5e20" stroke-width="2" />';
                    ovulo = '<circle cx="200" cy="230" r="4" fill="#fff9c4" />' +
                            '<circle cx="192" cy="245" r="4" fill="#fff9c4" />' +
                            '<circle cx="208" cy="245" r="4" fill="#fff9c4" />' +
                            '<circle cx="200" cy="260" r="4" fill="#fff9c4" />';
                    pistilo = '<path d="M198 215 L198 160 L202 160 L202 215 Z" fill="#81c784" stroke="#2e7d32" stroke-width="1" />';
                    estigma = '<circle cx="200" cy="158" r="4" fill="#ffeb3b" stroke="#fbc02d" stroke-width="1" />';
                    filamento = '<path d="M185 220 Q175 190 180 170" fill="none" stroke="#fff9c4" stroke-width="1.5" />' +
                                '<path d="M215 220 Q225 190 220 170" fill="none" stroke="#fff9c4" stroke-width="1.5" />';
                    antera = '<circle cx="180" cy="168" r="3" fill="#ffb300" stroke="#f57f17" />' +
                             '<circle cx="220" cy="168" r="3" fill="#ffb300" stroke="#f57f17" />';
                    break;
                case 'dalia':
                    sepalos = '<path d="M160 250 L120 220 L170 230 Z" fill="#2e7d32" />' +
                              '<path d="M240 250 L280 220 L230 230 Z" fill="#2e7d32" />';
                    let daliaPetals = '';
                    const dLayers = [
                        { count: 18, scale: 0.82 },
                        { count: 14, scale: 0.68 },
                        { count: 10, scale: 0.52 },
                        { count: 6, scale: 0.35 }
                    ];
                    dLayers.forEach(function(layer, layerIdx) {
                        for (let i = 0; i < layer.count; i++) {
                            const angle = (360 / layer.count) * i + (layerIdx * 20);
                            daliaPetals += '<path d="M200 200 C160 120 170 80 200 70 C230 80 240 120 200 200 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="0.5" transform="rotate(' + angle + ' 200 200) translate(200 200) scale(' + layer.scale + ') translate(-200 -200)" />';
                        }
                    });
                    petalos = daliaPetals;
                    ovario = '<rect x="180" y="240" width="40" height="50" rx="10" fill="url(#ovary-grad)" stroke="#1b5e20" stroke-width="2" />';
                    ovulo = '<circle cx="190" cy="255" r="4.5" fill="#fff9c4" />' +
                            '<circle cx="210" cy="255" r="4.5" fill="#fff9c4" />' +
                            '<circle cx="190" cy="275" r="4.5" fill="#fff9c4" />' +
                            '<circle cx="210" cy="275" r="4.5" fill="#fff9c4" />';
                    pistilo = '<path d="M196 250 L196 150 L204 150 L204 250 Z" fill="#81c784" stroke="#2e7d32" stroke-width="1.5" />';
                    estigma = '<circle cx="196" cy="148" r="4" fill="#a5d6a7" stroke="#1b5e20" />' +
                              '<circle cx="204" cy="148" r="4" fill="#a5d6a7" stroke="#1b5e20" />';
                    filamento = '<path d="M175 250 L170 180" fill="none" stroke="#a5d6a7" stroke-width="2" />' +
                                '<path d="M225 250 L230 180" fill="none" stroke="#a5d6a7" stroke-width="2" />' +
                                '<path d="M185 250 L180 175" fill="none" stroke="#a5d6a7" stroke-width="1.5" />' +
                                '<path d="M215 250 L220 175" fill="none" stroke="#a5d6a7" stroke-width="1.5" />';
                    antera = '<circle cx="170" cy="178" r="3" fill="#ffeb3b" stroke="#fbc02d" />' +
                             '<circle cx="230" cy="178" r="3" fill="#ffeb3b" stroke="#fbc02d" />' +
                             '<circle cx="180" cy="173" r="3" fill="#ffeb3b" stroke="#fbc02d" />' +
                             '<circle cx="220" cy="173" r="3" fill="#ffeb3b" stroke="#fbc02d" />';
                    break;
                case 'nochebuena':
                    sepalos = '<path d="M150 250 C140 290 190 300 200 300 C210 300 260 290 250 250 Z" fill="#2e7d32" stroke="#1b5e20" stroke-width="1.5" />';
                    let bracteas = '';
                    const nochebuenaAngles = [0, 45, 90, 135, 180, 225, 270, 315];
                    nochebuenaAngles.forEach(function(angle) {
                        bracteas += '<path d="M200 200 C150 140 130 50 200 50 C270 50 250 140 200 200 Z" fill="url(#petal-grad)" stroke="#c62828" stroke-width="0.5" transform="rotate(' + angle + ' 200 200)" />';
                    });
                    // Capa de bracteas secundarias mas pequeñas
                    nochebuenaAngles.forEach(function(angle) {
                        bracteas += '<path d="M200 200 C170 160 150 90 200 90 C250 90 230 160 200 200 Z" fill="url(#petal-grad)" stroke="#e53935" stroke-width="0.5" transform="rotate(' + (angle + 22.5) + ' 200 200)" />';
                    });
                    petalos = bracteas;
                    ovario = '<circle cx="200" cy="235" r="22" fill="url(#ovary-grad)" stroke="#1b5e20" stroke-width="2" />';
                    ovulo = '<circle cx="190" cy="225" r="4.5" fill="#fff9c4" />' +
                            '<circle cx="210" cy="225" r="4.5" fill="#fff9c4" />' +
                            '<circle cx="190" cy="245" r="4.5" fill="#fff9c4" />' +
                            '<circle cx="210" cy="245" r="4.5" fill="#fff9c4" />';
                    pistilo = '<path d="M197 220 L197 185 L203 185 L203 220 Z" fill="#81c784" stroke="#2e7d32" stroke-width="1" />';
                    estigma = '<circle cx="200" cy="182" r="5" fill="#ffd54f" stroke="#f57f17" stroke-width="1" />';
                    filamento = '<path d="M190 220 L180 185" fill="none" stroke="#c8e6c9" stroke-width="2" />' +
                                '<path d="M210 220 L220 185" fill="none" stroke="#c8e6c9" stroke-width="2" />';
                    antera = '<circle cx="180" cy="182" r="3" fill="#fbc02d" />' +
                             '<circle cx="220" cy="182" r="3" fill="#fbc02d" />';
                    break;
                case 'flordemayo':
                    sepalos = '<path d="M170 240 Q150 260 160 280 Q180 270 190 250 Z" fill="#2e7d32" />' +
                              '<path d="M230 240 Q250 260 240 280 Q220 270 210 250 Z" fill="#2e7d32" />';
                    let fmPetals = '';
                    // 5 pétalos superpuestos planos
                    for (let a = 0; a < 5; a++) {
                        const rotation = a * 72;
                        fmPetals += '<path d="M200 200 C180 140 100 80 170 50 C230 20 230 140 200 200 Z" fill="url(#petal-grad)" opacity="0.95" stroke="#fff" stroke-width="0.8" transform="rotate(' + rotation + ' 200 200)" />';
                    }
                    petalos = fmPetals;
                    ovario = '<ellipse cx="200" cy="240" rx="18" ry="25" fill="url(#ovary-grad)" stroke="#1b5e20" stroke-width="2" />';
                    ovulo = '<circle cx="192" cy="230" r="4" fill="#fff9c4" />' +
                            '<circle cx="208" cy="230" r="4" fill="#fff9c4" />' +
                            '<circle cx="192" cy="250" r="4" fill="#fff9c4" />' +
                            '<circle cx="208" cy="250" r="4" fill="#fff9c4" />';
                    pistilo = '<path d="M196 220 L196 160 L204 160 L204 220 Z" fill="#81c784" stroke="#2e7d32" stroke-width="1.5" />';
                    estigma = '<path d="M192 160 C192 153 208 153 208 160 Z" fill="#c8e6c9" stroke="#1b5e20" stroke-width="1" />';
                    filamento = '<path d="M185 220 L180 170" fill="none" stroke="#c8e6c9" stroke-width="2" />' +
                                '<path d="M215 220 L220 170" fill="none" stroke="#c8e6c9" stroke-width="2" />';
                    antera = '<path d="M176 166 Q180 162 184 166 Z" fill="#ffd54f" stroke="#ffb300" stroke-width="1" />' +
                             '<path d="M216 166 Q220 162 224 166 Z" fill="#ffd54f" stroke="#ffb300" stroke-width="1" />';
                    break;
                case 'lily':
                default:
                    sepalos = '<path d="M200 300 C155 315 130 280 120 250 C140 270 170 285 200 290 Z" fill="#4caf50" stroke="#2e7d32" stroke-width="2" />' +
                              '<path d="M200 300 C245 315 270 280 280 250 C260 270 230 285 200 290 Z" fill="#4caf50" stroke="#2e7d32" stroke-width="2" />' +
                              '<path d="M200 300 C200 340 180 345 160 350 C180 330 195 315 200 300 Z" fill="#388e3c" />';
                    petalos = '<path d="M200 200 C120 150 110 50 170 50 C200 80 200 150 200 200 Z" fill="url(#petal-grad)" opacity="0.9" stroke="#fff" stroke-width="1" />' +
                              '<path d="M200 200 C280 150 290 50 230 50 C200 80 200 150 200 200 Z" fill="url(#petal-grad)" opacity="0.9" stroke="#fff" stroke-width="1" />' +
                              '<path d="M200 200 C110 210 50 160 70 100 C110 110 160 160 200 200 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1" />' +
                              '<path d="M200 200 C290 210 350 160 330 100 C290 110 240 160 200 200 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1" />' +
                              '<path d="M200 200 C150 280 70 300 90 230 C120 220 170 210 200 200 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1" />' +
                              '<path d="M200 200 C250 280 330 300 310 230 C280 220 230 210 200 200 Z" fill="url(#petal-grad)" stroke="#fff" stroke-width="1" />';
                    ovario = '<path d="M200 200 C160 220 160 290 200 300 C240 290 240 220 200 200 Z" fill="url(#ovary-grad)" stroke="#1b5e20" stroke-width="3" />';
                    ovulo = '<circle cx="185" cy="245" r="7" fill="#fff9c4" stroke="#fbc02d" stroke-width="1.5" />' +
                            '<circle cx="215" cy="245" r="7" fill="#fff9c4" stroke="#fbc02d" stroke-width="1.5" />' +
                            '<circle cx="185" cy="265" r="7" fill="#fff9c4" stroke="#fbc02d" stroke-width="1.5" />' +
                            '<circle cx="215" cy="265" r="7" fill="#fff9c4" stroke="#fbc02d" stroke-width="1.5" />';
                    pistilo = '<path d="M194 210 L194 135 L206 135 L206 210 Z" fill="#81c784" stroke="#2e7d32" stroke-width="1.5" />';
                    estigma = '<circle cx="200" cy="128" r="10" fill="#a5d6a7" stroke="#1b5e20" stroke-width="2" />' +
                              '<circle cx="192" cy="124" r="7" fill="#a5d6a7" stroke="#1b5e20" stroke-width="1.5" />' +
                              '<circle cx="208" cy="124" r="7" fill="#a5d6a7" stroke="#1b5e20" stroke-width="1.5" />';
                    filamento = '<path d="M180 230 Q160 210 165 155" fill="none" stroke="#c8e6c9" stroke-width="4.5" />' +
                                '<path d="M220 230 Q240 210 235 155" fill="none" stroke="#c8e6c9" stroke-width="4.5" />';
                    antera = '<path d="M160 148 Q165 140 170 148 L170 158 Q165 166 160 158 Z" fill="#ffeb3b" stroke="#fbc02d" stroke-width="1.5" />' +
                             '<path d="M230 148 Q235 140 240 148 L240 158 Q235 166 230 158 Z" fill="#ffeb3b" stroke="#fbc02d" stroke-width="1.5" />';
                    break;
            }
            return { sepalos, petalos, ovario, ovulo, pistilo, estigma, filamento, antera };
        }

        function safeCreateIcons() {
            try { if (typeof lucide !== 'undefined') lucide.createIcons(); } catch(e) {}
        }

        function init() {
            safeCreateIcons();
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const d = document.getElementById('countdown-display');
            d.innerText = count;
            const i = setInterval(() => {
                count--;
                if(count > 0) { d.innerText = count; d.style.animation='none'; void d.offsetWidth; d.style.animation='popIn 0.5s ease-out'; }
                else { clearInterval(i); document.getElementById('countdown-screen').classList.add('hidden'); startGame(); }
            }, 1000);
        }

        function startGame() {
            document.getElementById('game-ui').style.display = 'flex';
            state.active = true;
            state.accumulatedScore = 0;
            loadFlower(0);
            startTimer();
        }

        function loadFlower(index) {
            state.currentFlowerIndex = index;
            const flower = selectedFlowers[index];
            if (!flower) return;

            const titleText = "Juego de BioFlor";
            const animatedHTML = titleText.split('').map((char, idx) =>
              '<span style="animation-delay: ' + (idx * 0.04) + 's">' + (char === ' ' ? '&nbsp;' : char) + '</span>'
            ).join('');
            document.querySelector('.game-title').innerHTML = animatedHTML;

            const svgs = getFlowerSvgs(flower.svgType, flower.color, flower.colorLight);
            document.getElementById('svg-sepalos').innerHTML = svgs.sepalos;
            document.getElementById('svg-petalos').innerHTML = svgs.petalos;
            document.getElementById('svg-ovario').innerHTML = svgs.ovario;
            document.getElementById('svg-ovulo').innerHTML = svgs.ovulo;
            document.getElementById('svg-pistilo').innerHTML = svgs.pistilo;
            document.getElementById('svg-estigma').innerHTML = svgs.estigma;
            document.getElementById('svg-filamento').innerHTML = svgs.filamento;
            document.getElementById('svg-antera').innerHTML = svgs.antera;

            partsList.forEach(part => {
                const el = document.getElementById('svg-' + part);
                if (el) {
                    el.className = 'flower-part interactive-part';
                }
            });

            state.isDissected = false;
            const label = document.getElementById('flower-diagram-label');
            if (label) label.style.display = 'block';
            state.pendingAssociations = {};
            state.correctParts = [];
            state.pendingGreenParts = [];
            state.wrongParts = [];
            state.selectedPiece = null;

            // Reiniciar el temporizador por cada ejercicio (flor)
            state.timeLeft = ${config.timeLimit};
            const display = document.getElementById('timer-display');
            if (display) {
                const mins = Math.floor(state.timeLeft / 60);
                const secs = state.timeLeft % 60;
                display.innerText = mins + ':' + (secs < 10 ? '0' : '') + secs;
            }

            document.getElementById('dissect-btn').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: text-bottom;"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg> Separar Partes';
            document.getElementById('progress-display').innerText = (state.currentFlowerIndex + 1) + ' / ' + selectedFlowers.length;
            const activeFlowerEl = document.getElementById('active-flower-display');
            if (activeFlowerEl) {
                activeFlowerEl.innerText = selectedFlowers[state.currentFlowerIndex].name + ' (' + (state.currentFlowerIndex + 1) + '/' + selectedFlowers.length + ')';
            }

            renderDock();
            renderSlots();
            updatePartTransforms();
            updateHighlights();
            safeCreateIcons();
        }

        function updatePartTransforms() {
            const contentGroup = document.getElementById('flower-svg-content');
            if (contentGroup) {
                contentGroup.style.transform = state.isDissected 
                    ? 'translate(200px, 200px) scale(0.68) translate(-200px, -200px)' 
                    : 'none';
            }

            partsList.forEach(part => {
                const el = document.getElementById('svg-' + part);
                if (!el) return;

                const isCorrect = state.correctParts.includes(part);
                const isPendingGreen = state.pendingGreenParts.includes(part);
                const isWrong = state.wrongParts.includes(part);

                el.classList.remove('correct-glow', 'wrong-glow', 'dissected');

                if (isCorrect || isPendingGreen) {
                    el.classList.add('correct-glow');
                } else if (isWrong) {
                    el.classList.add('wrong-glow');
                } else if (state.isDissected) {
                    el.classList.add('dissected');
                }
            });
        }

        function updateHighlights(hoveredPart) {
            partsList.forEach(part => {
                const el = document.getElementById('svg-' + part);
                if (!el) return;
                const isHighlighted = (part === hoveredPart) || (part === state.selectedPiece);
                if (isHighlighted && !state.correctParts.includes(part)) {
                    el.classList.add('highlighted');
                } else {
                    el.classList.remove('highlighted');
                }
            });
        }

        function hoverPart(part) {
            if (state.correctParts.includes(part)) return;
            updateHighlights(part);
        }

        function toggleDissect() {
            state.isDissected = !state.isDissected;
            updatePartTransforms();
            document.getElementById('dissect-btn').innerHTML = state.isDissected 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: text-bottom;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg> Reensamblar Flor' 
                : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: text-bottom;"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg> Separar Partes';

            const label = document.getElementById('flower-diagram-label');
            if (label) {
                label.style.display = state.isDissected ? 'none' : 'block';
            }
            safeCreateIcons();
        }

        function renderDock() {
            const dock = document.getElementById('dock-grid');
            dock.innerHTML = '';
            partsList.forEach(part => {
                if (state.correctParts.includes(part)) return;
                const inSlot = Object.values(state.pendingAssociations).includes(part);
                if (inSlot) return;

                const card = document.createElement('div');
                card.className = 'piece-card';
                card.id = 'piece-' + part;
                card.draggable = true;
                card.onclick = () => selectPiece(part);
                card.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', part);
                    card.classList.add('selected');
                };
                card.ondragend = () => card.classList.remove('selected');

                card.onmouseenter = () => { if (!state.correctParts.includes(part)) updateHighlights(part); };
                card.onmouseleave = () => updateHighlights(null);

                card.innerHTML = '<div class="piece-card-thumb">' + getMiniSvg(part) + '</div>';
                dock.appendChild(card);
            });
        }

        function renderSlots() {
            const panel = document.getElementById('association-panel');
            panel.innerHTML = '';
            partsList.forEach(slot => {
                const card = document.createElement('div');
                card.className = 'slot-card';
                card.id = 'slot-' + slot;
                const isCorrect = state.correctParts.includes(slot);
                const pendingPiece = state.pendingAssociations[slot];
                if (isCorrect) {
                    card.classList.add('correct');
                } else if (pendingPiece) {
                    card.style.borderColor = '#f59e0b';
                    card.style.backgroundColor = '#fffbeb';
                }

                card.ondragover = (e) => {
                    if (state.correctParts.includes(slot)) return;
                    e.preventDefault();
                    card.style.borderColor = 'var(--primary-color)';
                    card.style.backgroundColor = '#eff6ff';
                };
                card.ondragleave = () => {
                    if (state.correctParts.includes(slot)) return;
                    card.style.borderColor = pendingPiece ? '#f59e0b' : 'var(--medium-gray-color)';
                    card.style.backgroundColor = pendingPiece ? '#fffbeb' : '#f8fafc';
                };
                card.ondrop = (e) => {
                    e.preventDefault();
                    if (state.correctParts.includes(slot)) return;
                    card.style.borderColor = 'var(--medium-gray-color)';
                    card.style.backgroundColor = '#f8fafc';
                    const part = e.dataTransfer.getData('text/plain') || state.selectedPiece;
                    if (part) {
                        validateDrop(part, slot);
                    }
                };
                card.onclick = () => {
                    if (state.correctParts.includes(slot)) return;
                    if (state.selectedPiece) {
                        validateDrop(state.selectedPiece, slot);
                    }
                };

                let contentHtml = '<span style="color:#9ca3af; font-size:0.75rem; text-align:center;">Arrastra aquí</span>';
                if (isCorrect) {
                    contentHtml = '<div class="placed-piece"><div class="placed-piece-thumb">' + getMiniSvg(slot) + '</div></div>';
                } else if (pendingPiece) {
                    contentHtml = '<div class="placed-piece" style="cursor:pointer;" title="Click para quitar" onclick="(function(e){e.stopPropagation();delete state.pendingAssociations[\\'' + slot + '\\'];state.pendingGreenParts=state.pendingGreenParts.filter(p=>p!==\\'' + slot + '\\');state.wrongParts=state.wrongParts.filter(p=>p!==\\'' + slot + '\\');renderDock();renderSlots();updatePartTransforms();})(event)"><div class="placed-piece-thumb">' + getMiniSvg(pendingPiece) + '</div></div>';
                }

                card.innerHTML = '<div class="slot-label"><span>' + partsLabels[slot] + '</span></div><div class="slot-content">' + contentHtml + '</div>';
                panel.appendChild(card);
            });
        }

        function selectPiece(part) {
            if (state.selectedPiece === part) {
                state.selectedPiece = null;
            } else {
                state.selectedPiece = part;
            }
            document.querySelectorAll('.piece-card').forEach(c => c.classList.remove('selected'));
            if (state.selectedPiece) {
                const el = document.getElementById('piece-' + part);
                if (el) el.classList.add('selected');
            }
            updateHighlights();
        }

        function allowDrop(e, targetPart) {
            if (state.correctParts.includes(targetPart)) return;
            e.preventDefault();
            const el = document.getElementById('svg-' + targetPart);
            if (el) el.classList.add('drag-over-part');
        }

        function dragLeave(e, targetPart) {
            const el = document.getElementById('svg-' + targetPart);
            if (el) el.classList.remove('drag-over-part');
        }

        function dropOnPart(e, targetPart) {
            e.preventDefault();
            const el = document.getElementById('svg-' + targetPart);
            if (el) el.classList.remove('drag-over-part');
            const pieceId = e.dataTransfer.getData('text/plain') || state.selectedPiece;
            if (pieceId) {
                validateDrop(pieceId, targetPart);
            }
        }

        function clickPart(targetPart) {
            if (!state.isDissected) {
                toggleDissect();
                return;
            }
            if (state.selectedPiece) {
                validateDrop(state.selectedPiece, targetPart);
            }
        }

        function validateDrop(pieceId, targetPart) {
            if (state.correctParts.includes(targetPart)) return;
            const prevSlot = Object.keys(state.pendingAssociations).find(k => state.pendingAssociations[k] === pieceId);
            if (prevSlot) {
                delete state.pendingAssociations[prevSlot];
                state.pendingGreenParts = state.pendingGreenParts.filter(p => p !== prevSlot);
                state.wrongParts = state.wrongParts.filter(p => p !== prevSlot);
            }
            state.pendingAssociations[targetPart] = pieceId;
            state.selectedPiece = null;

            if (pieceId === targetPart) {
                state.pendingGreenParts = [...state.pendingGreenParts.filter(p => p !== targetPart), targetPart];
                state.wrongParts = state.wrongParts.filter(p => p !== targetPart);
            } else {
                state.pendingGreenParts = state.pendingGreenParts.filter(p => p !== targetPart);
                state.wrongParts = [...state.wrongParts.filter(p => p !== targetPart), targetPart];
                setTimeout(() => {
                    state.wrongParts = state.wrongParts.filter(p => p !== targetPart);
                    updatePartTransforms();
                }, 1200);
            }

            renderDock();
            renderSlots();
            updateHighlights();
            updatePartTransforms();
            document.querySelectorAll('.piece-card').forEach(c => c.classList.remove('selected'));
        }

        function validateSolution() {
            if (!state.active) return;
            const newCorrect = [...state.correctParts];
            const newWrong = [];
            let placedCount = 0;

            partsList.forEach(part => {
                const placed = state.pendingAssociations[part];
                if (state.correctParts.includes(part)) {
                    placedCount++;
                    return;
                }
                if (!placed) return;
                placedCount++;
                if (placed === part) { 
                    if (!newCorrect.includes(part)) newCorrect.push(part); 
                } else { 
                    newWrong.push(part); 
                }
            });

            const newlyCorrectCount = newCorrect.length - state.correctParts.length;
            const wrongCount = newWrong.length;

            state.correctParts = newCorrect;
            state.pendingGreenParts = state.pendingGreenParts.filter(p => !newCorrect.includes(p));
            state.wrongParts = state.wrongParts.filter(p => !newCorrect.includes(p));
            document.getElementById('score-display').innerText = state.score;
            document.getElementById('progress-display').innerText = (state.currentFlowerIndex + 1) + ' / ' + selectedFlowers.length;

            newCorrect.forEach(p => {
                delete state.pendingAssociations[p];
            });

            renderDock();
            renderSlots();
            updatePartTransforms();

            newWrong.forEach(slot => {
                const el = document.getElementById('slot-' + slot);
                if (el) { el.classList.add('incorrect'); setTimeout(() => el.classList.remove('incorrect'), 1500); }
                const placedPiece = state.pendingAssociations[slot];
                if(placedPiece) {
                    state.wrongParts = [...state.wrongParts.filter(p => p !== placedPiece), placedPiece];
                    updatePartTransforms();
                    setTimeout(() => {
                        state.wrongParts = state.wrongParts.filter(p => p !== placedPiece);
                        updatePartTransforms();
                    }, 1200);
                }
            });

            if (state.correctParts.length === 8) {
                clearInterval(state.timerInterval);
                state.active = false;
                state.score += 10;
                document.getElementById('score-display').innerText = state.score;

                if (state.currentFlowerIndex < selectedFlowers.length - 1) {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: '¡Excelente Trabajo!',
                            html: \`
                              <div class="swal-confetti">
                                <span style="font-size: 3rem;">🎉</span>
                                <span style="font-size: 3rem;">✨</span>
                                <span style="font-size: 3rem;">🎊</span>
                              </div>
                              <p style="font-size: 1.1rem; margin-bottom: 0;">Has completado la flor "<strong>\` + selectedFlowers[state.currentFlowerIndex].name + \`</strong>". ¡Vamos a la siguiente!</p>
                              <div style="font-size: 1.4rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.5rem 1rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
                                ⭐ +10 Puntos
                              </div>
                            \`,
                            icon: 'success',
                            confirmButtonText: 'Siguiente Flor',
                            confirmButtonColor: '#0077b6',
                            allowOutsideClick: false
                        }).then(() => {
                            state.active = true;
                            loadFlower(state.currentFlowerIndex + 1);
                            startTimer();
                        });
                    } else {
                        alert('¡Excelente Trabajo! Has completado la flor. ¡Ganaste 10 puntos! Vamos a la siguiente.');
                        state.active = true;
                        loadFlower(state.currentFlowerIndex + 1);
                        startTimer();
                    }
                } else {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: '¡Juego Completado!',
                            html: \`
                              <div class="swal-confetti">
                                <span style="font-size: 3rem;">🌟</span>
                                <span style="font-size: 3rem;">🏆</span>
                                <span style="font-size: 3rem;">🌟</span>
                              </div>
                              <p style="font-size: 1.1rem; margin-bottom: 0;">Has completado todas las flores de este nivel.</p>
                              <div style="font-size: 1.4rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.5rem 1rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
                                Puntaje Total: \` + state.score + \`
                              </div>
                            \`,
                            icon: 'success',
                            confirmButtonText: 'Ver Resultados',
                            confirmButtonColor: '#0077b6',
                            allowOutsideClick: false
                        }).then(() => {
                            finishGame(true);
                        });
                    } else {
                        alert('¡Juego Completado! Has completado todas las flores.');
                        finishGame(true);
                    }
                }
            } else {
                let swalTitle = '';
                let swalText = '';
                let swalIcon = '';

                if (placedCount === 0) {
                    swalTitle = 'Sin asociaciones';
                    swalText = 'No has colocado ninguna pieza todavía. Arrastra las piezas a los espacios correspondientes.';
                    swalIcon = 'question';
                } else if (newlyCorrectCount > 0 && wrongCount === 0) {
                    swalTitle = '¡Buen avance!';
                    swalText = 'Has colocado ' + newlyCorrectCount + ' pieza(s) nueva(s) correctamente. ¡Vas por buen camino!';
                    swalIcon = 'success';
                } else if (wrongCount > 0) {
                    swalTitle = 'Algunos errores detectados';
                    swalText = 'Tienes ' + state.correctParts.length + ' parte(s) correcta(s) en total, pero se detectaron ' + wrongCount + ' pieza(s) incorrecta(s). Revisa las zonas en rojo.';
                    swalIcon = 'warning';
                } else {
                    swalTitle = 'Información';
                    swalText = 'Tienes ' + state.correctParts.length + ' parte(s) correcta(s) en total. ¡Sigue colocando las piezas restantes!';
                    swalIcon = 'info';
                }

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: swalTitle,
                        text: swalText,
                        icon: swalIcon,
                        confirmButtonText: 'Continuar',
                        confirmButtonColor: '#0077b6'
                    });
                } else {
                    alert(swalTitle + ': ' + swalText);
                }
            }
        }

        function startTimer() {
            const display = document.getElementById('timer-display');
            clearInterval(state.timerInterval);
            state.timerInterval = setInterval(() => {
                state.timeLeft--;
                const mins = Math.floor(state.timeLeft / 60);
                const secs = state.timeLeft % 60;
                display.innerText = mins + ':' + (secs < 10 ? '0' : '') + secs;
                if (state.timeLeft <= 0) {
                    clearInterval(state.timerInterval);
                    state.active = false;
                    if (state.currentFlowerIndex < selectedFlowers.length - 1) {
                        if (typeof Swal !== 'undefined') {
                            Swal.fire({
                                title: '¡Tiempo agotado!',
                                html: \`
                                  <p style="font-size: 1.1rem; margin-bottom: 0;">No completaste el ejercicio a tiempo. Pasamos al siguiente.</p>
                                  <div style="font-size: 1.2rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
                                    0 Puntos obtenidos
                                  </div>
                                \`,
                                icon: 'warning',
                                confirmButtonText: 'Siguiente Ejercicio',
                                confirmButtonColor: '#0077b6',
                                allowOutsideClick: false
                            }).then(() => {
                                state.active = true;
                                loadFlower(state.currentFlowerIndex + 1);
                                startTimer();
                            });
                        } else {
                            alert('Tiempo agotado. Pasamos al siguiente ejercicio.');
                            state.active = true;
                            loadFlower(state.currentFlowerIndex + 1);
                            startTimer();
                        }
                    } else {
                        finishGame(false);
                    }
                }
            }, 1000);
        }

        function confirmFinishGame() {
            if (typeof Swal !== 'undefined') {
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
                        finishGame(false);
                    }
                });
            } else {
                if (confirm('¿Deseas finalizar el juego? Tu puntaje actual es de ' + state.score + ' puntos.')) {
                    finishGame(false);
                }
            }
        }

        function finishGame(win) {
            clearInterval(state.timerInterval);
            state.active = false;
            document.getElementById('game-ui').style.display = 'none';
            document.getElementById('end-screen').classList.remove('hidden');
            document.getElementById('end-title').innerText = win ? "¡Juego Completado!" : "Juego Terminado";
            document.getElementById('final-score').innerText = state.score;
        }

        function getMiniSvg(partId) {
            const flower = selectedFlowers[state.currentFlowerIndex];
            switch (partId) {
                case 'sepalos':
                    return '<svg viewBox="0 0 50 50" width="100%" height="100%"><path d="M25 40 C15 35 10 20 10 10 C18 18 22 28 25 35 C28 28 32 18 40 10 C40 20 35 35 25 40 Z" fill="#4caf50" stroke="#2e7d32" stroke-width="1.5" /></svg>';
                case 'petalos':
                    return '<svg viewBox="0 0 50 50" width="100%" height="100%"><path d="M25 5 C35 15 45 28 38 40 C30 45 20 45 12 40 C5 28 15 15 25 5 Z" fill="' + flower.color + '" stroke="#fff" stroke-width="1" /></svg>';
                case 'antera':
                    return '<svg viewBox="0 0 50 50" width="100%" height="100%"><rect x="18" y="10" width="14" height="20" rx="7" fill="#ffeb3b" stroke="#fbc02d" stroke-width="1.5" /><circle cx="21" cy="20" r="1.5" fill="#f57f17" /><circle cx="29" cy="20" r="1.5" fill="#f57f17" /></svg>';
                case 'filamento':
                    return '<svg viewBox="0 0 50 50" width="100%" height="100%"><path d="M25 5 C23 20 27 30 25 45" fill="none" stroke="#a5d6a7" stroke-width="3" stroke-linecap="round" /></svg>';
                case 'estigma':
                    return '<svg viewBox="0 0 50 50" width="100%" height="100%"><circle cx="25" cy="18" r="8" fill="#81c784" stroke="#2e7d32" stroke-width="1.5" /><circle cx="18" cy="18" r="5" fill="#81c784" stroke="#2e7d32" stroke-width="1.5" /><circle cx="32" cy="18" r="5" fill="#81c784" stroke="#2e7d32" stroke-width="1.5" /></svg>';
                case 'pistilo':
                    return '<svg viewBox="0 0 50 50" width="100%" height="100%"><path d="M22 5 L28 5 L26 45 L24 45 Z" fill="#81c784" stroke="#4caf50" stroke-width="1" /></svg>';
                case 'ovario':
                    return '<svg viewBox="0 0 50 50" width="100%" height="100%"><path d="M25 5 C15 15 12 30 18 40 C22 45 28 45 32 40 C38 30 35 15 25 5 Z" fill="#4caf50" stroke="#2e7d32" stroke-width="1.5" /></svg>';
                case 'ovulo':
                    return '<svg viewBox="0 0 50 50" width="100%" height="100%"><circle cx="25" cy="25" r="10" fill="#fff9c4" stroke="#fbc02d" stroke-width="2" /><circle cx="25" cy="25" r="4" fill="#fbc02d" /></svg>';
            }
            return '';
        }

        function toggleInfo(show) {
            const m = document.getElementById('info-overlay');
            if (show) {
                m.classList.remove('hidden');
                m.style.display = 'flex';
            } else {
                m.classList.add('hidden');
                m.style.display = 'none';
            }
        }
        function toggleHowToPlay(show) {
            const m = document.getElementById('howtoplay-overlay');
            if (show) {
                m.classList.remove('hidden');
                m.style.display = 'flex';
            } else {
                m.classList.add('hidden');
                m.style.display = 'none';
            }
        }
        function exitGame() {
            window.close();
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
        }
        function showAlert(title, text, icon, btnText) {
            if (typeof Swal !== 'undefined') {
                return Swal.fire({ title, text, icon, confirmButtonText: btnText || 'Aceptar', confirmButtonColor: '#005f92' });
            } else {
                alert(title + (text ? ' - ' + text : ''));
                return Promise.resolve({ isConfirmed: true });
            }
        }

        init();

    </script>
</body>
</html>`;



};


// --- COMPONENTE PRINCIPAL (CONFIGURACIÓN Y JUEGO) ---
const BioFlor = () => {
  const [view, setView] = useState('home'); // home, play, summary
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [previewFlowerId, setPreviewFlowerId] = useState(FLOWER_CATALOG[0].id);
  const [currentFlowerIndex, setCurrentFlowerIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('Básico');

  // Estados del juego en vivo
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS['Básico'].timeLimit);
  const [score, setScore] = useState(0);
  const [correctParts, setCorrectParts] = useState([]); // partes colocadas correctamente tras validar
  const [wrongParts, setWrongParts] = useState([]); // partes incorrectas tras validar
  const [pendingAssociations, setPendingAssociations] = useState({}); // asociaciones aún no validadas {slot: pieceId}
  const [isDissected, setIsDissected] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedPart, setHighlightedPart] = useState(null);
  const [hasValidated, setHasValidated] = useState(false); // si ya se validó al menos una vez
  const [pendingGreenParts, setPendingGreenParts] = useState([]); // partes con glow verde (correcto pero aún sin confirmar)

  // Referencia al timer
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  // AGREGAR:
  // Sincroniza el cambio a summary con la URL para que ProgressBar llegue al 100%
  const goToSummary = () => {
    setView('summary');
    navigate('/settings?view=Summary', {
      replace: true,
      state: { ...location.state, setupStep: 'summary' }
    });
  };
  // Limpia el parámetro al salir del summary
  const goToHome = () => {
    setView('home');
    navigate('/settings', {
      replace: true,
      state: { ...location.state, setupStep: 'game' }
    });
  };
  // ZIP state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Iniciando...");
  // Key para reiniciar el timer por ejercicio
  const [timerKey, setTimerKey] = useState(0);

  // --- Datos de configuración desde la pantalla anterior ---
  const MOCK_DATA = {
    selectedAreas: ['science'],
    selectedSkills: ['Observación', 'Clasificación'],
    gameDetails: { gameName: 'BioFlor', description: 'Disección anatómica de flores.', version: '1.0.0', date: null },
    selectedPlatforms: ['web']
  };
  const stateData = location.state || {};
  const selectedAreas = stateData.selectedAreas || MOCK_DATA.selectedAreas;
  const selectedSkills = stateData.selectedSkills || MOCK_DATA.selectedSkills;
  const gameDetails = stateData.gameDetails || MOCK_DATA.gameDetails;
  const selectedPlatforms = normalizeGamePlatforms(
    stateData.selectedPlatforms || MOCK_DATA.selectedPlatforms
  );

  const currentConfig = DIFFICULTY_SETTINGS[difficulty];
  const activeFlowerId = selectedFlowers[currentFlowerIndex] || selectedFlowers[0];
  const flower = FLOWER_CATALOG.find(f => f.id === activeFlowerId) || FLOWER_CATALOG[0];
  const previewFlower = FLOWER_CATALOG.find(f => f.id === previewFlowerId) || FLOWER_CATALOG[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Manejar finalización del temporizador
  useEffect(() => {
    if (view === 'play') {
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
  }, [view, timerKey]);

  const handleTimeout = () => {
    const isLastFlower = currentFlowerIndex === selectedFlowers.length - 1;
    if (!isLastFlower) {
      Swal.fire({
        title: '¡Tiempo agotado!',
        html: `
          <p style="font-size: 1.1rem; margin-bottom: 0;">No completaste el ejercicio a tiempo. Pasamos al siguiente.</p>
          <div style="font-size: 1.2rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
            0 Puntos obtenidos
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Siguiente Ejercicio',
        confirmButtonColor: '#0077b6',
        allowOutsideClick: false
      }).then(() => {
        clearInterval(timerRef.current);
        setTimeLeft(currentConfig.timeLimit);
        setTimerKey(k => k + 1);
        setCurrentFlowerIndex(prev => prev + 1);
        setCorrectParts([]);
        setWrongParts([]);
        setPendingAssociations({});
        setPendingGreenParts([]);
        setIsDissected(false);
        setSelectedPiece(null);
        setHasValidated(false);
      });
    } else {
      Swal.fire({
        title: '¡Fin de la Prueba!',
        html: `
          <div class="swal-confetti">
            <span style="font-size: 3rem;">🌟</span>
            <span style="font-size: 3rem;">🏆</span>
            <span style="font-size: 3rem;">🌟</span>
          </div>
          <p style="font-size: 1.1rem; margin-bottom: 0;">Se acabó el tiempo.</p>
          <div style="font-size: 1.4rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.5rem 1rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
            Puntaje Total: ${score}
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Terminar Configuración',
        cancelButtonText: 'Volver a Jugar',
        confirmButtonColor: '#0077b6',
        cancelButtonColor: '#0077b6',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          goToSummary();
        } else {
          resetGame();
        }
      });
    }
  };

  // Opcional — limpiar ?view=summary al iniciar nueva partida
  const startNewGame = () => {
    setTimeLeft(currentConfig.timeLimit);
    setScore(0);
    setCorrectParts([]);
    setWrongParts([]);
    setPendingAssociations({});
    setPendingGreenParts([]);
    setIsDissected(false);
    setSelectedPiece(null);
    setHasValidated(false);
    setCurrentFlowerIndex(0);
    setView('play');
    navigate(location.pathname, { replace: true, state: location.state });
  };

  const resetGame = () => {
    setTimeLeft(currentConfig.timeLimit);
    setScore(0);
    setCorrectParts([]);
    setWrongParts([]);
    setPendingAssociations({});
    setPendingGreenParts([]);
    setIsDissected(false);
    setSelectedPiece(null);
    setHasValidated(false);
    setCurrentFlowerIndex(0);
  };

  const handleFinishGame = (force = false) => {
    if (force) {
      clearInterval(timerRef.current);
      goToSummary();
      return;
    }

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

  const handleFlowerSelection = (flowerId) => {
    const limit = REQUIRED_FLOWERS[difficulty] || 3;
    setSelectedFlowers(prev => {
      if (prev.includes(flowerId)) {
        return prev.filter(id => id !== flowerId);
      }
      if (prev.length < limit) {
        return [...prev, flowerId];
      } else {
        Swal.fire({
          title: 'Límite alcanzado',
          text: `Solo puedes seleccionar ${limit} flores para el nivel ${difficulty}.`,
          icon: 'warning',
          timer: 2000,
          showConfirmButton: false
        });
        return prev;
      }
    });
  };

  // --- LÓGICA DE ASOCIACIÓN (sin validación automática) ---
  const handleDragStart = (e, partId) => {
    e.dataTransfer.setData('text/plain', partId);
    setSelectedPiece(partId);
  };

  const handlePieceClick = (partId) => {
    if (correctParts.includes(partId)) return;
    if (selectedPiece === partId) {
      setSelectedPiece(null);
    } else {
      setSelectedPiece(partId);
    }
  };

  // Al soltar una pieza en un slot: guarda como pendiente Y muestra feedback verde/rojo inmediato
  const handleDropOnPart = (pieceId, targetPart) => {
    if (correctParts.includes(targetPart)) return;
    // Quitar de slots anteriores donde estuviera esta pieza
    const newPending = { ...pendingAssociations };
    let prevSlot = null;
    Object.keys(newPending).forEach(slot => {
      if (newPending[slot] === pieceId) { prevSlot = slot; delete newPending[slot]; }
    });
    newPending[targetPart] = pieceId;
    setPendingAssociations(newPending);
    setSelectedPiece(null);

    // Limpiar el glow verde del slot anterior si la pieza se mueve
    if (prevSlot) {
      setPendingGreenParts(prev => prev.filter(p => p !== prevSlot));
    }

    if (pieceId === targetPart) {
      // Correcto: glow verde inmediato en el diagrama SVG
      setPendingGreenParts(prev => [...prev.filter(p => p !== targetPart), targetPart]);
      // Limpiar rojo previo para este slot si lo hubiera
      setWrongParts(prev => prev.filter(p => p !== targetPart));
    } else {
      // Incorrecto: quitar glow verde si estaba, mostrar rojo temporal
      setPendingGreenParts(prev => prev.filter(p => p !== targetPart));
      setWrongParts(prev => [...prev.filter(p => p !== targetPart), targetPart]);
      setTimeout(() => setWrongParts(prev => prev.filter(p => p !== targetPart)), 1200);
    }
  };

  const handlePartClick = (targetPart) => {
    if (selectedPiece) {
      handleDropOnPart(selectedPiece, targetPart);
    }
  };

  // --- VALIDAR SOLUCIÓN MANUALMENTE ---
  const handleValidateSolution = () => {
    const allParts = ['sepalos', 'petalos', 'antera', 'filamento', 'estigma', 'pistilo', 'ovario', 'ovulo'];
    const newCorrect = [...correctParts];
    const newWrong = [];
    let placedCount = 0;

    allParts.forEach(part => {
      if (correctParts.includes(part)) {
        placedCount++;
        return;
      }
      const placed = pendingAssociations[part];
      if (!placed) return;
      placedCount++;
      if (placed === part) {
        if (!newCorrect.includes(part)) newCorrect.push(part);
      } else {
        newWrong.push(part);
      }
    });

    const newlyCorrectCount = newCorrect.length - correctParts.length;
    const wrongCount = newWrong.length;

    setCorrectParts(newCorrect);
    setWrongParts(newWrong);
    // El puntaje no cambia mientras se colocan piezas; solo al completar el ejercicio
    setHasValidated(true);

    // Los confirmados ya no necesitan estar en pendingGreen
    setPendingGreenParts(prev => prev.filter(p => !newCorrect.includes(p)));

    // Limpiar pendientes que ya son correctos
    const newPending = { ...pendingAssociations };
    newCorrect.forEach(p => delete newPending[p]);
    setPendingAssociations(newPending);

    if (newWrong.length > 0) {
      // Indicar errores brevemente
      setTimeout(() => setWrongParts([]), 1500);
    }

    if (newCorrect.length === 8) {
      const nextScore = score + 10;
      setScore(nextScore);
      const isLastFlower = currentFlowerIndex === selectedFlowers.length - 1;
      if (isLastFlower) {
        clearInterval(timerRef.current);
        Swal.fire({
          title: '¡Fin de la Prueba!',
          html: `
            <div class="swal-confetti">
              <span style="font-size: 3rem;">🌟</span>
              <span style="font-size: 3rem;">🏆</span>
              <span style="font-size: 3rem;">🌟</span>
            </div>
            <p style="font-size: 1.1rem; margin-bottom: 0;">Has completado todas las flores de este nivel.</p>
            <div style="font-size: 1.4rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.5rem 1rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
              Puntaje Total: ${nextScore}
            </div>
          `,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Terminar Configuración',
          cancelButtonText: 'Volver a Jugar',
          confirmButtonColor: '#0077b6',
          cancelButtonColor: '#0077b6'
        }).then((result) => {
          if (result.isConfirmed) {
            goToSummary();
          } else {
            resetGame();
            setView('play');
          }
        });
      } else {
        Swal.fire({
          title: '¡Excelente Trabajo!',
          html: `
            <div class="swal-confetti">
              <span style="font-size: 3rem;">🎉</span>
              <span style="font-size: 3rem;">✨</span>
              <span style="font-size: 3rem;">🎊</span>
            </div>
            <p style="font-size: 1.1rem; margin-bottom: 0;">Has completado la flor "<strong>${flower.name}</strong>". ¡Vamos a la siguiente!</p>
            <div style="font-size: 1.4rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.5rem 1rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
              ⭐ +10 Puntos
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Siguiente Flor',
          confirmButtonColor: '#0077b6',
          allowOutsideClick: false
        }).then(() => {
          // Reiniciar el temporizador por cada ejercicio (flor)
          clearInterval(timerRef.current);
          setTimeLeft(currentConfig.timeLimit);
          setTimerKey(k => k + 1); // fuerza reinicio del useEffect del timer
          setCurrentFlowerIndex(prev => prev + 1);
          setCorrectParts([]);
          setWrongParts([]);
          setPendingAssociations({});
          setPendingGreenParts([]);
          setIsDissected(false);
          setSelectedPiece(null);
          setHasValidated(false);
        });
      }
    } else {
      let swalTitle = '';
      let swalText = '';
      let swalIcon = '';

      if (placedCount === 0) {
        swalTitle = 'Sin asociaciones';
        swalText = 'No has colocado ninguna pieza todavía. Arrastra las piezas a los espacios correspondientes.';
        swalIcon = 'question';
      } else if (newlyCorrectCount > 0 && wrongCount === 0) {
        swalTitle = '¡Buen avance!';
        swalText = `Has colocado ${newlyCorrectCount} pieza(s) nueva(s) correctamente. ¡Vas por buen camino!`;
        swalIcon = 'success';
      } else if (wrongCount > 0) {
        swalTitle = 'Algunos errores detectados';
        swalText = `Tienes ${newCorrect.length} parte(s) correcta(s) en total, pero se detectaron ${wrongCount} pieza(s) incorrecta(s). Revisa las zonas en rojo.`;
        swalIcon = 'warning';
      } else {
        swalTitle = 'Información';
        swalText = `Tienes ${newCorrect.length} parte(s) correcta(s) en total. ¡Sigue colocando las piezas restantes!`;
        swalIcon = 'info';
      }

      Swal.fire({
        title: swalTitle,
        text: swalText,
        icon: swalIcon,
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#0077b6'
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const normalizeFileName = (str) =>
    (str || 'bioflor')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

  const buildNativeConfig = () => ({
    nivel: difficulty,
    flores: selectedFlowers,
    autor: gameDetails?.authorName || '',
    version: gameDetails?.version || '1.0.0',
    fecha: gameDetails?.date || new Date().toISOString(),
    descripcion: gameDetails?.description || 'Disección anatómica de flores.',
    nombreApp: gameDetails?.gameName || 'BioFlor',
    plataformas: selectedPlatforms
  });

  const handleSmartDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(10);
    setStatusText('Preparando configuración...');

    try {
      const config = buildNativeConfig();
      const htmlContent = generateBioFlorCode(
        currentConfig,
        selectedFlowers,
        difficulty,
        gameDetails,
        selectedPlatforms
      );
      const appId = buildBioFlorApplicationId();
      const baseName = normalizeFileName(gameDetails?.gameName || 'bioflor');
      const content = await createGameDownloadArchive({
        folderName: 'BioFlor',
        baseFileName: baseName,
        htmlContent,
        configFileName: 'bioflor-config.json',
        config,
        selectedPlatforms,
        nativeTemplates: {
          android: { url: BIOFLOR_NATIVE_TEMPLATE_URLS.android, replaceIndex: false },
          ios: { url: BIOFLOR_NATIVE_TEMPLATE_URLS.ios, replaceIndex: false }
        },
        nativeMetadata: {
          appId,
          appName: gameDetails?.gameName || 'BioFlor'
        },
        onStatus: (status) => {
          setStatusText(status);
          setProgress((current) => Math.min(90, current + 18));
        }
      });

      downloadGameArchive(
        content,
        `${baseName}_${selectedPlatforms.join('_')}.zip`
      );
      setProgress(100);
      setStatusText('¡Descarga iniciada!');
      setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
    } catch (err) {
      console.error('Error generando el paquete de BioFlor:', err);
      setStatusText(err?.message || 'Error al generar el paquete.');
      setIsGenerating(false);
    }
  };
  const showInfoPopup = () => {
    Swal.fire({
      title: '¿Cómo jugar a BioFlor?',
      html: `
        <div style="text-align: left; font-size: 0.95rem; line-height: 1.6;">
          <p><strong>Objetivo:</strong> Diseccionar la flor e identificar sus 8 partes anatómicas arrastrándolas al lugar correcto.</p>
          <ol>
            <li>Haz clic en el botón <strong>"Separar Partes"</strong> para ver el diagrama diseccionado.</li>
            <li>En la <strong>"Caja de Piezas"</strong> (abajo), verás las partes anatómicas representadas visualmente.</li>
            <li>Arrastra una pieza y suéltala directamente en el lugar anatómico correcto de la flor, o haz clic en la pieza y luego en su zona anatómica correspondiente.</li>
            <li>El juego validará tu respuesta al instante:
              <br/>• Si es <strong>correcto</strong>: La pieza se iluminará en <span style="color:#10b981;font-weight:bold;">verde</span> y se acoplará en su lugar.
              <br/>• Si es <strong>incorrecto</strong>: Se iluminará brevemente en <span style="color:#ef4444;font-weight:bold;">rojo</span> y se registrará un error.
              </li>
            <li>Al completar correctamente las <strong>8 partes</strong> de la flor, obtienes <strong>10 puntos</strong>.</li>
            <li>Si el tiempo se agota, se pasa al <strong>siguiente ejercicio</strong> sin puntaje.</li>
          </ol>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '¡Entendido!',
      confirmButtonColor: '#0077b6'
    });
  };

  // --- PANTALLAS DE RENDERIZADO ---
  const renderSetupScreen = () => (
    <div className="catalog-screen">
      <div className="game-title">
        {'Juego de BioFlor'.split('').map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img src={stateData?.selectedGame?.icon || '/images/juegos/bioflor.png'} alt="BioFlor" className="game-preview-image" onError={(e) => { e.target.onerror = null; e.target.src = '/images/juegos/bioflor.png'; }} />
        <span className="game-info-badge">Ciencia</span>
      </div>

      <div className="rules-banner">
        <h2><HelpCircle size={24} /> Relación de Piezas e Identificación Botánica</h2>
        <p>
          Explora la anatomía floral diseccionando y separando sus partes. Asocia cada una de las 8 piezas estructurales (Sépalos, Pétalos, Antera, Filamento, Estigma, Pistilo, Ovario, Óvulo) con su etiqueta científica correcta antes de que termine el tiempo.
        </p>
      </div>

      <div className="difficulty-select-wrapper">
        <label htmlFor="difficulty-select">Seleccione el nivel de dificultad:</label>
        <select
          id="difficulty-select"
          className="difficulty-select"
          value={difficulty}
          onChange={(e) => {
            const newDiff = e.target.value;
            setDifficulty(newDiff);
            setSelectedFlowers([]);
            setTimeLeft(DIFFICULTY_SETTINGS[newDiff].timeLimit);
          }}
        >
          {Object.keys(DIFFICULTY_SETTINGS).map(key => (
            <option key={key} value={key}>{DIFFICULTY_SETTINGS[key].label}</option>
          ))}
        </select>
      </div>

      <div className="catalog-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#0077b6', margin: 0, fontWeight: 700 }}>Catálogo de Flores</h3>
          <span className="flower-count-badge">
            Seleccionadas: {selectedFlowers.length} / {REQUIRED_FLOWERS[difficulty]}
          </span>
        </div>
        <div className="flower-grid">
          {FLOWER_CATALOG.map((f) => {
            const isSelected = selectedFlowers.includes(f.id);
            const selectionIndex = selectedFlowers.indexOf(f.id);
            return (
              <div
                key={f.id}
                className={`flower-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  handleFlowerSelection(f.id);
                  setPreviewFlowerId(f.id);
                }}
              >
                {isSelected && (
                  <div className="selected-badge">
                    {selectionIndex + 1}
                  </div>
                )}
                <div className="flower-thumbnail">
                  <FlowerFullDiagram
                    flower={f}
                    highlightedPart={null}
                    isDissectedMode={false}
                    correctParts={[]}
                    wrongPart={null}
                  />
                </div>
                <div className="flower-card-info">
                  <h4>{f.name}</h4>
                  <p className="scientific">{f.scientificName}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {previewFlower && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--medium-gray-color)',
          borderRadius: 'var(--border-radius)',
          padding: '1.25rem',
          textAlign: 'left'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: '700' }}>
            Sobre el {previewFlower.name} ({previewFlower.scientificName})
          </h4>
          <p style={{ margin: 0, color: 'var(--dark-gray-color)', lineHeight: '1.5' }}>
            {previewFlower.description}
          </p>
        </div>
      )}

      <div className="catalog-actions">
        <button className="no-rounded-button btn-primary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Anterior
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="no-rounded-button btn-primary"
            onClick={startNewGame}
            disabled={selectedFlowers.length !== REQUIRED_FLOWERS[difficulty]}
          >
            <Play size={18} /> Siguiente
          </button>
        </div>
      </div>
    </div>
  );

  const renderGameScreen = () => {
    const partsList = ['sepalos', 'petalos', 'antera', 'filamento', 'estigma', 'pistilo', 'ovario', 'ovulo'];
    const partsLabels = {
      sepalos: 'Sépalos', petalos: 'Pétalos', antera: 'Antera', filamento: 'Filamento',
      estigma: 'Estigma', pistilo: 'Pistilo (Estilo)', ovario: 'Ovario', ovulo: 'Óvulo'
    };

    return (
      <div className="game-screen">
        <div className="game-title" style={{ marginBottom: '0.5rem' }}>
          {'Juego de BioFlor'.split('').map((char, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.04}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <h3 style={{ textAlign: 'center', color: '#6b7280', marginTop: '-0.5rem', marginBottom: '1.5rem', fontWeight: '500' }}>
          (Vista Previa)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto 1.5rem auto', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.85rem 1.25rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
            📋 Reglas básicas
          </span>
          <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>
            Disecciona la flor separando sus partes y colócalas en el recuadro del nombre correcto
          </span>
        </div>

        <div className="game-layout">
          <div className="game-main-col">
            <div className="diagram-panel">
              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginBottom: '1rem', justifyContent: 'center' }}>
                <button
                  className="no-rounded-button btn-primary"
                  onClick={showInfoPopup}
                >
                  <Info size={16} /> Cómo Jugar
                </button>
                <button
                  className="no-rounded-button btn-primary"
                  onClick={() => setIsDissected(!isDissected)}
                >
                  <RefreshCw size={16} /> {isDissected ? 'Reensamblar Flor' : 'Separar Partes (Diseccionar)'}
                </button>
              </div>

              <div className="flower-svg-container">
                <FlowerFullDiagram
                  flower={flower}
                  highlightedPart={highlightedPart}
                  isDissectedMode={isDissected}
                  correctParts={[...correctParts, ...pendingGreenParts]}
                  wrongPart={wrongParts.length > 0 ? wrongParts[0] : null}
                  onDropOnPart={handleDropOnPart}
                  onPartClick={handlePartClick}
                />
              </div>
              {!isDissected && (
                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  Flor Completa (Haz clic en Separar Partes)
                </div>
              )}

              {/* Caja de Piezas Disponibles */}
              <div className="pieces-dock">
                <h4><Grid size={18} /> Piezas de la Flor ({partsList.filter(p => !correctParts.includes(p) && !Object.values(pendingAssociations).includes(p)).length} Libres)</h4>
                <div className="dock-grid">
                  {partsList.map(partId => {
                    const isPlaced = correctParts.includes(partId);
                    const isInSlot = !!Object.values(pendingAssociations).find(v => v === partId);
                    if (isPlaced || isInSlot) return null;
                    const isSelected = selectedPiece === partId;

                    return (
                      <div
                        key={partId}
                        className={`piece-card ${isSelected ? 'selected' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, partId)}
                        onClick={() => handlePieceClick(partId)}
                        onMouseEnter={() => setHighlightedPart(partId)}
                        onMouseLeave={() => setHighlightedPart(null)}
                      >
                        <div className="piece-card-thumb">
                          {renderMiniPartSvg(partId, flower.color)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="game-right-col">
            <div className="stats-block">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} /> Progreso
              </h3>
              <div className="stats-item" style={{ marginTop: '1rem' }}>
                <span>Dificultad:</span> <strong style={{ color: 'var(--primary-color)' }}>{difficulty}</strong>
              </div>
              <div className="stats-item">
                <span>Flor Activa:</span> <strong style={{ color: 'var(--primary-color)' }}>{flower.name} ({currentFlowerIndex + 1}/{selectedFlowers.length})</strong>
              </div>
              <div className="stats-item">
                <span>Ejercicio:</span> <strong style={{ color: 'var(--primary-color)' }}>{currentFlowerIndex + 1} / {selectedFlowers.length}</strong>
              </div>
              <div className="stats-item">
                <span>Tiempo:</span> <strong style={{ color: 'var(--primary-color)' }}>{formatTime(timeLeft)}</strong>
              </div>
              <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                <span>Puntaje:</span> <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{score} pts</strong>
              </div>

              {/* Botones apilados debajo de las stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                <button
                  className="no-rounded-button btn-primary"
                  onClick={handleValidateSolution}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <CheckSquare size={16} /> Validar Solución
                </button>
                <button
                  className="no-rounded-button btn-primary"
                  onClick={() => handleFinishGame(false)}
                  style={{ width: '100%', justifyContent: 'center', color: 'white' }}
                >
                  <X size={16} /> Finalizar Juego
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--secondary-color)', marginTop: '20px', marginBottom: '8px', textAlign: 'center' }}>
              Tabla de nombres
            </h3>
            <div className="association-panel" style={{ marginTop: '0.5rem' }}>
              {partsList.map(slotId => {
                const isCorrect = correctParts.includes(slotId);
                const isWrong = wrongParts.includes(slotId);
                const isPending = !!pendingAssociations[slotId];
                const pendingPiece = pendingAssociations[slotId];

                return (
                  <div
                    key={slotId}
                    className={`slot-card ${isCorrect ? 'correct' : ''} ${isWrong ? 'incorrect' : ''} ${isPending && !isCorrect && !isWrong ? 'pending' : ''}`}
                    style={isPending && !isCorrect && !isWrong ? { borderColor: '#f59e0b', backgroundColor: '#fffbeb' } : {}}
                    onDragOver={(e) => {
                      if (isCorrect) return;
                      e.preventDefault();
                      e.currentTarget.classList.add('drag-over');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('drag-over');
                    }}
                    onDrop={(e) => {
                      if (isCorrect) return;
                      e.preventDefault();
                      e.currentTarget.classList.remove('drag-over');
                      const pieceId = e.dataTransfer.getData('text/plain') || selectedPiece;
                      if (pieceId) {
                        handleDropOnPart(pieceId, slotId);
                      }
                    }}
                    onClick={() => {
                      if (isCorrect) return;
                      if (selectedPiece) {
                        handleDropOnPart(selectedPiece, slotId);
                      }
                    }}
                    onMouseEnter={() => !isCorrect && setHighlightedPart(slotId)}
                    onMouseLeave={() => setHighlightedPart(null)}
                  >
                    <div className="slot-label">
                      <span>{partsLabels[slotId]}</span>
                      {isCorrect && <Check size={14} color="var(--correct-color)" />}
                      {isWrong && <X size={14} color="var(--wrong-color)" />}
                    </div>
                    <div className="slot-content">
                      {isCorrect ? (
                        <div className="placed-piece">
                          <div className="placed-piece-thumb">
                            {renderMiniPartSvg(slotId, flower.color)}
                          </div>
                        </div>
                      ) : isPending ? (
                        <div
                          className="placed-piece"
                          style={{ cursor: 'pointer' }}
                          title="Click para quitar"
                          onClick={(e) => { e.stopPropagation(); setPendingAssociations(prev => { const n = { ...prev }; delete n[slotId]; return n; }); }}
                        >
                          <div className="placed-piece-thumb">
                            {renderMiniPartSvg(pendingPiece, flower.color)}
                          </div>
                          <button className="remove-placed-btn" onClick={(e) => { e.stopPropagation(); setPendingAssociations(prev => { const n = { ...prev }; delete n[slotId]; return n; }); }}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.75rem', textAlign: 'center' }}>Arrastra aquí</span>
                      )}
                    </div>
                  </div>
                );
              })}
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

    const getFixedCreationDate = () => {
      // Siempre usar la fecha actual del navegador/equipo del usuario
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    };

    const gameDetailsWithDate = { ...gameDetails, date: getFixedCreationDate() };

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

        {/* ── TARJETAS INFO ── */}
        <div className="summary-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
              <div className="info-card-value">{gameDetails.gameName || 'No disponible'}</div>
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
                {gameDetails.description || 'Sin descripción.'}
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-header"><Calendar size={16} /> Fecha de Creación</div>
              <div className="info-card-value">{formatDate(gameDetailsWithDate.date)}</div>
            </div>
            <div className="info-card">
              <div className="info-card-header"><Monitor size={16} /> Plataformas</div>
              <div className="info-card-value">
                {formatGamePlatformList(selectedPlatforms)}
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


        {/* ── PARÁMETROS DEL JUEGO ── */}
        <div className="summary-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#0077b6' }}>
            Parámetros del Juego
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', rowGap: '1rem', alignItems: 'center' }}>
            <div className="summary-row">
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Star size={18} /> Flores:</span>
              <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{selectedFlowers.map(id => FLOWER_CATALOG.find(f => f.id === id)?.name).filter(Boolean).join(', ') || flower.name}</strong>
            </div>
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
            <button className="btn-primary" onClick={goToHome} disabled={isGenerating}
              style={{ opacity: isGenerating ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s', border: 'none', background: '#005f92', color: 'white', fontSize: '1rem' }}>
              <ArrowLeft size={18} /> Volver a Editar
            </button>
          </div>
        </div>

        {/* ── SECCIÓN DE DESCARGA — idéntica a CalculadoraMental ── */}
        <div className="download-section" style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
            <h3 style={{ color: '#0077b6', marginBottom: '0.5rem' }}>Descargar Paquete del Juego</h3>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              Genera el archivo .zip listo para descargar en su computadora.
            </p>

            {/* Badges de plataforma */}
            <div style={{ display: 'inline-flex', gap: '0.5rem', background: '#e2e8f0', borderRadius: '2rem', padding: '4px', marginBottom: '1rem' }}>
              {selectedPlatforms.map((platform) => (
                <span key={platform} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '600', background: '#ffffff', color: platform === 'android' ? '#16a34a' : platform === 'ios' ? '#475569' : '#0077b6', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                  <Monitor size={14} />
                  {platform === 'ios' ? 'iOS' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                </span>
              ))}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 auto 1.5rem', background: '#f1f5f9', borderRadius: '0.5rem', padding: '8px 14px', border: '1px dashed #cbd5e1' }}>
              📦 {buildGamePackageNotice(selectedPlatforms)}
            </p>

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
            className="btn-primary btn-success"
            onClick={handleSmartDownload}
            disabled={isGenerating}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: '0 4px 14px 0 rgba(0, 95, 146, 0.35)',
              minWidth: '240px', justifyContent: 'center',
              fontSize: '1rem', padding: '0.85rem 2rem',
              cursor: isGenerating ? 'wait' : 'pointer',
              opacity: isGenerating ? 0.8 : 1,
              borderRadius: '0.75rem', fontWeight: '700', letterSpacing: '0.02em',
              background: '#005f92', color: 'white', border: 'none'
            }}
          >
            {isGenerating ? (
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
      <div className="bioflor-container">
        {view === 'home' && renderSetupScreen()}
        {view === 'play' && renderGameScreen()}
        {view === 'summary' && renderSummaryScreen()}
      </div>
    </>
  );
};

export default BioFlor;
