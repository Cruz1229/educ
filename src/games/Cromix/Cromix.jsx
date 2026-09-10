import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Timer, Trophy, Star, Download, ArrowLeft, Tag, Layers, FileText,
  Calendar, Monitor, Shapes, Puzzle, Play, ArrowRight, Check, Grid,
  Info, RefreshCw, X, HelpCircle, CheckSquare, Type, CheckCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import {
  buildGamePackageNotice,
  createGameDownloadArchive,
  downloadGameArchive,
  formatGamePlatformList,
  normalizeGamePlatforms,
} from '../../utils/gameDownloadPackaging';

const CROMIX_RULES = {
              'Básico': 'Identifica en la rueda cromática los colores primarios y secundarios. Selecciona los colores correctos según la instrucción y valida tu respuesta.',
              'Intermedio': 'Observa la rueda cromática y selecciona los colores terciarios o contrastantes que correspondan a la instrucción.',
              'Avanzado': 'Aplica la teoría del color seleccionando los tonos que representan emociones específicas dentro de la rueda cromática.'
            };

// --- ESTILOS COMPARTIDOS CON LA LÍNEA GRÁFICA DE EDUCSTEAM ---
export const CROMIX_PREVIEW_STYLES = `
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

    .cromix-container {
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
      margin: 1.5rem 0;
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

    .instructions-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: var(--border-radius);
      padding: 1.5rem;
      text-align: left;
      max-width: 800px;
      margin: 0 auto;
    }

    .instructions-card h3 {
      margin-top: 0;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .instructions-card ul {
      padding-left: 1.2rem;
      margin-bottom: 0;
      color: var(--dark-gray-color);
      line-height: 1.6;
    }

    /* --- GAME LAYOUT --- */
    .game-layout {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 2rem;
      width: 100%;
      align-items: start;
    }

    .game-main-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: white;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      align-items: center;
      position: relative;
    }

    /* --- WHEEL SVG --- */
    .wheel-container {
      width: 100%;
      max-width: 450px;
      height: 450px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .color-slice {
      cursor: pointer;
      transition: transform 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease;
      transform-origin: 250px 250px;
    }

    .color-slice:hover {
      transform: scale(1.03);
      filter: brightness(1.1);
    }

    .color-slice.selected {
      transform: scale(1.08);
      stroke: #1e293b;
      stroke-width: 5px;
      animation: pulseGlow 1.5s ease-in-out infinite;
    }

    @keyframes slowSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .wheel-spin-group {
      animation: slowSpin 40s linear infinite;
      transform-origin: 250px 250px;
    }

    @keyframes pulseGlow {
      0% { filter: drop-shadow(0 0 5px rgba(0,0,0,0.3)); }
      50% { filter: drop-shadow(0 0 15px rgba(0,0,0,0.6)); }
      100% { filter: drop-shadow(0 0 5px rgba(0,0,0,0.3)); }
    }

    .center-mix-circle {
      transition: fill 0.3s ease;
    }

    .mix-display {
      margin-top: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }

    .mix-color-preview {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 0 1px #d1d5db;
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

    /* --- QUESTION OVERLAY MODAL --- */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease-out;
    }

    .question-modal {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05);
      padding: 3rem 2.5rem;
      max-width: 600px;
      width: 90%;
      text-align: center;
      animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
      border: none;
    }

    .question-modal::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 8px;
      background: linear-gradient(90deg, #0077b6, #00b4d8, #90e0ef);
    }

    @keyframes bounceIn {
      0% { transform: scale(0.8) translateY(20px); opacity: 0; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }

    .question-icon-wrapper {
      width: 90px;
      height: 90px;
      background: #f0f9ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5rem;
      margin: 0 auto 1.5rem auto;
      box-shadow: 0 10px 15px -3px rgba(186, 230, 253, 0.5);
      animation: floatIcon 3s ease-in-out infinite;
      border: 4px solid white;
      position: relative;
      z-index: 2;
    }

    @keyframes floatIcon {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .question-header {
      font-size: 0.9rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #0284c7;
      margin-bottom: 0.75rem;
      background: #e0f2fe;
      padding: 0.35rem 1rem;
      border-radius: 20px;
      display: inline-block;
    }

    .question-body {
      font-size: 1.7rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 1rem;
      line-height: 1.3;
    }

    .question-helper {
      color: #475569;
      font-size: 1.05rem;
      margin-bottom: 2.5rem;
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 1rem;
      border: 1px dashed #cbd5e1;
      line-height: 1.5;
    }

    .btn-start-exercise {
      font-size: 1.2rem;
      padding: 1rem 2.5rem;
      border-radius: 50px;
      box-shadow: 0 4px 14px 0 rgba(0, 119, 182, 0.39);
      transition: all 0.3s ease;
      background: var(--primary-color);
      color: white;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
    }
    
    .btn-start-exercise:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 119, 182, 0.45);
      background: #005f92;
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

    .timer-warn {
      color: var(--wrong-color) !important;
      animation: pulse 1s infinite alternate;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.05); }
    }

    /* --- PROGRESS GRAPHICS --- */
    .exercise-dots {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
      transition: all 0.3s;
      border: 1px solid #cbd5e1;
    }

    .dot.current {
      background: #e0f2fe;
      color: #0369a1;
      border-color: #0284c7;
      box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
    }

    .dot.correct {
      background: var(--correct-color);
      color: white;
      border-color: #16a34a;
    }

    .dot.wrong {
      background: var(--wrong-color);
      color: white;
      border-color: #dc2626;
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

    .no-rounded-button.btn-primary {
      background-color: var(--primary-color);
      color: white;
      border-radius: var(--border-radius);
      font-weight: 700;
    }

    .no-rounded-button.btn-primary:hover:not(:disabled) {
      background-color: #005f92;
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

    /* --- ANIMACIONES ADICIONALES --- */
    @keyframes popJump {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-15px) scale(1.2); }
    }
    @keyframes pulseGlow {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
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
    .swal-confetti span:nth-child(2) { animation-delay: 0.2s; }
    .swal-confetti span:nth-child(3) { animation-delay: 0.4s; }

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

    /* --- CATALOG ACTIONS (igual que BioFlor) --- */
    .catalog-actions {
      display: flex;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid var(--medium-gray-color);
    }

    @media (max-width: 900px) {
      .game-layout {
        grid-template-columns: 1fr;
      }
      .info-grid {
        grid-template-columns: 1fr;
      }
    }

    /* ANIMACIONES DE EMOCIONES AVANZADAS */
    @keyframes jumpJoy {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.1); }
    }
    @keyframes shiverFear {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    @keyframes shakeFrustration {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-15deg); }
      75% { transform: rotate(15deg); }
    }
    @keyframes trembleAnger {
      0% { transform: translate(1px, 1px) rotate(0deg) scale(1); }
      10% { transform: translate(-1px, -2px) rotate(-1deg) scale(1.1); }
      20% { transform: translate(-3px, 0px) rotate(1deg) scale(1.1); }
      30% { transform: translate(3px, 2px) rotate(0deg) scale(1.1); }
      40% { transform: translate(1px, -1px) rotate(1deg) scale(1.1); }
      50% { transform: translate(-1px, 2px) rotate(-1deg) scale(1.1); }
      60% { transform: translate(-3px, 1px) rotate(0deg) scale(1.1); }
      70% { transform: translate(3px, 1px) rotate(-1deg) scale(1.1); }
      80% { transform: translate(-1px, -1px) rotate(1deg) scale(1.1); }
      90% { transform: translate(1px, 2px) rotate(0deg) scale(1.1); }
      100% { transform: translate(1px, -2px) rotate(-1deg) scale(1); }
    }
    @keyframes dropSadness {
      0% { transform: translateY(-10px) scale(0.9); opacity: 0.8; }
      50% { transform: translateY(5px) scale(1); opacity: 1; }
      100% { transform: translateY(0px) scale(0.95); opacity: 0.9; }
    }
    @keyframes swellPride {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(0,0,0,0)); }
      50% { transform: scale(1.2); filter: drop-shadow(0 4px 10px rgba(34, 197, 94, 0.6)); }
    }

    .anim-alegria { animation: jumpJoy 0.8s ease-in-out infinite; }
    .anim-miedo { animation: shiverFear 0.3s ease-in-out infinite; }
    .anim-frustracion { animation: shakeFrustration 0.5s ease-in-out infinite; }
    .anim-enojo { animation: trembleAnger 0.4s infinite; }
    .anim-tristeza { animation: dropSadness 2s ease-in-out infinite; }
    .anim-orgullo { animation: swellPride 2s ease-in-out infinite; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `;

const Style = () => <style>{CROMIX_PREVIEW_STYLES}</style>;

// --- BASE DE DATOS DE COLORES Y PREGUNTAS ---
const CHROMATIC_COLORS = [
  { name: 'Amarillo', hex: '#FFE600', text: '#000000' },
  { name: 'Anaranjado', hex: '#FF9900', text: '#000000' },
  { name: 'Naranja', hex: '#FF6600', text: '#ffffff' },
  { name: 'Café', hex: '#8B4513', text: '#ffffff' },
  { name: 'Rojo', hex: '#FF0000', text: '#ffffff' },
  { name: 'Magenta', hex: '#E6007E', text: '#ffffff' },
  { name: 'Morado', hex: '#7900B5', text: '#ffffff' },
  { name: 'Negro', hex: '#000000', text: '#ffffff' },
  { name: 'Azul', hex: '#0033FF', text: '#ffffff' },
  { name: 'Gris', hex: '#808080', text: '#ffffff' },
  { name: 'Verde', hex: '#00B53F', text: '#ffffff' },
  { name: 'Lila', hex: '#C8A2C8', text: '#000000' }
];

const QUESTIONS_DB = {
  'Básico': [
    {
      id: 1,
      question: '¿Cuáles son los colores primarios?',
      correctColors: ['Amarillo', 'Rojo', 'Azul'],
      helperText: 'Selecciona los 3 colores primarios en la rueda cromática.',
      emoji: '🎨'
    },
    {
      id: 2,
      question: '¿Qué colores se combinan para formar el color secundario: verde?',
      correctColors: ['Amarillo', 'Azul'],
      helperText: 'Selecciona los 2 colores necesarios para mezclar verde.',
      emoji: '🌿'
    },
    {
      id: 3,
      question: '¿Qué colores se combinan para formar el color secundario: morado?',
      correctColors: ['Rojo', 'Azul'],
      helperText: 'Selecciona los 2 colores necesarios para mezclar morado.',
      emoji: '🍇'
    },
    {
      id: 4,
      question: '¿Qué colores se combinan para formar el color secundario: naranja?',
      correctColors: ['Rojo', 'Amarillo'],
      helperText: 'Selecciona los 2 colores necesarios para mezclar naranja.',
      emoji: '🍊'
    }
  ],
  'Intermedio': [
    {
      id: 1,
      question: '¿Qué colores se combinan para formar el color terciario: anaranjado?',
      correctColors: ['Amarillo', 'Naranja'],
      helperText: 'Selecciona los 2 colores necesarios para mezclar anaranjado.',
      emoji: '🦊'
    },
    {
      id: 2,
      question: '¿Qué colores se combinan para formar el color terciario: magenta?',
      correctColors: ['Rojo', 'Morado'],
      helperText: 'Selecciona los 2 colores necesarios para mezclar magenta.',
      emoji: '🌺'
    },
    {
      id: 3,
      question: '¿Cuál es el contraste del color rojo?',
      correctColors: ['Verde'],
      helperText: 'Selecciona el color opuesto (complementario) al rojo en la rueda cromática.',
      emoji: '☯️'
    },
    {
      id: 4,
      question: '¿Cuál es el contraste del color amarillo?',
      correctColors: ['Morado'],
      helperText: 'Selecciona el color opuesto (complementario) al amarillo en la rueda cromática.',
      emoji: '🌓'
    },
    {
      id: 5,
      question: '¿Cuál es el contraste del color azul?',
      correctColors: ['Naranja'],
      helperText: 'Selecciona el color opuesto (complementario) al azul en la rueda cromática.',
      emoji: '🌀'
    }
  ],
  'Avanzado': [
    {
      id: 1,
      question: '¿Qué color se asocia con la emoción de Alegría?',
      correctColors: ['Amarillo'],
      helperText: 'Selecciona el color que representa la alegría.',
      emoji: '😊',
      animClass: 'anim-alegria'
    },
    {
      id: 2,
      question: '¿Qué color se asocia con la emoción del Miedo?',
      correctColors: ['Lila'],
      helperText: 'Selecciona el color que representa el miedo.',
      emoji: '😨',
      animClass: 'anim-miedo'
    },
    {
      id: 3,
      question: '¿Qué color se asocia con la emoción de Asco o Desagrado?',
      correctColors: ['Verde'],
      helperText: 'Selecciona el color que representa el asco o desagrado.',
      emoji: '🤢',
      animClass: 'anim-frustracion'
    },
    {
      id: 4,
      question: '¿Qué color se asocia con la emoción de Enojo?',
      correctColors: ['Rojo'],
      helperText: 'Selecciona el color que representa el enojo.',
      emoji: '😡',
      animClass: 'anim-enojo'
    },
    {
      id: 5,
      question: '¿Qué color se asocia con la emoción de la Tristeza?',
      correctColors: ['Azul'],
      helperText: 'Selecciona el color que representa la tristeza.',
      emoji: '😢',
      animClass: 'anim-tristeza'
    },
    {
      id: 6,
      question: '¿Qué color se asocia con la emoción de la Ansiedad?',
      correctColors: ['Naranja'],
      helperText: 'Selecciona el color que representa la ansiedad.',
      emoji: '😰',
      animClass: 'anim-orgullo'
    }
  ]
};

const MOCK_DATA = {
  selectedAreas: ['science'],
  selectedSkills: [
    'Pensamiento analítico y crítico',
    'Observación y experimentación',
    'Resolución de problemas'
  ],
  gameDetails: {
    gameName: 'Cromix',
    authorName: 'EducSteam',
    version: '1.0.0',
    description: 'Rueda cromática interactiva basada en el modelo de Newton para el aprendizaje de teoría de colores y emociones.'
  },
  selectedPlatforms: ['web']
};

export const CROMIX_NATIVE_TEMPLATE_URLS = Object.freeze({
  android: '/templates/cromix_android.zip',
  ios: '/templates/cromix_ios.zip'
});

const buildCromixApplicationId = () => {
  const rawUuid = window.crypto?.randomUUID?.()
    || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
  return `io.cromix.steam.uuid_${uuid}`;
};

// --- HELPER PARA DIBUJAR LAS REBANADAS DEL SVG ---
const getSlicePath = (cx, cy, rIn, rOut, startAngle, endAngle) => {
  const rad = Math.PI / 180;
  const x1_out = cx + rOut * Math.cos(startAngle * rad);
  const y1_out = cy + rOut * Math.sin(startAngle * rad);
  const x2_out = cx + rOut * Math.cos(endAngle * rad);
  const y2_out = cy + rOut * Math.sin(endAngle * rad);

  const x1_in = cx + rIn * Math.cos(startAngle * rad);
  const y1_in = cy + rIn * Math.sin(startAngle * rad);
  const x2_in = cx + rIn * Math.cos(endAngle * rad);
  const y2_in = cy + rIn * Math.sin(endAngle * rad);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `
    M ${x1_out} ${y1_out}
    A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${x2_out} ${y2_out}
    L ${x2_in} ${y2_in}
    A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${x1_in} ${y1_in}
    Z
  `;
};

// --- MEZCLADOR DE COLORES PARA EL CÍRCULO CENTRAL ---
const getMixedColorHex = (selectedNames) => {
  if (selectedNames.length === 0) return '#e2e8f0';

  // Reglas fijas para combinaciones conocidas de RYB
  const key = [...selectedNames].sort().join('+');
  const presets = {
    'Amarillo+Azul': '#00B53F', // Verde
    'Azul+Rojo': '#7900B5', // Morado
    'Amarillo+Rojo': '#FF6600', // Naranja
    'Amarillo+Naranja': '#FF9900', // Anaranjado
    'Morado+Rojo': '#E6007E' // Magenta
  };

  if (presets[key]) return presets[key];

  // Si no hay combinación especial, se hace un promedio de los valores RGB
  const selectedObjects = CHROMATIC_COLORS.filter(c => selectedNames.includes(c.name));
  let r = 0, g = 0, b = 0;
  selectedObjects.forEach(c => {
    const hex = c.hex.replace('#', '');
    r += parseInt(hex.substring(0, 2), 16);
    g += parseInt(hex.substring(2, 4), 16);
    b += parseInt(hex.substring(4, 6), 16);
  });

  r = Math.round(r / selectedObjects.length);
  g = Math.round(g / selectedObjects.length);
  b = Math.round(b / selectedObjects.length);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const Cromix = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [view, setView] = useState('home'); // 'home', 'play', 'summary'
  const [difficulty, setDifficulty] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedColors, setSelectedColors] = useState([]);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]); // Array de booleanos o nulos
  const [timeLeft, setTimeLeft] = useState(180);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // JSZip se incluye en gameDownloadPackaging; no necesita cargarse desde un CDN.
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const timerRef = useRef(null);

  const stateData = location.state || {};
  const selectedAreas = stateData.selectedAreas || MOCK_DATA.selectedAreas;
  const selectedSkills = stateData.selectedSkills || MOCK_DATA.selectedSkills;
  const gameDetails = stateData.gameDetails || MOCK_DATA.gameDetails;
  const selectedPlatforms = normalizeGamePlatforms(
    stateData.selectedPlatforms || MOCK_DATA.selectedPlatforms
  );

  const getFixedCreationDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
  };

  const gameDetailsWithDate = { ...gameDetails, date: getFixedCreationDate() };
  const currentQuestions = QUESTIONS_DB[difficulty] || QUESTIONS_DB['Básico'];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedColors([]);
    setScore(0);
    setResults(new Array(QUESTIONS_DB[difficulty].length).fill(null));
    setTimeLeft(difficulty === 'Avanzado' ? 300 : difficulty === 'Intermedio' ? 240 : 180);
    setIsPlaying(false);
    setShowQuestionModal(true); // Mostrar modal animado de la primera pregunta
  };

  const startNewGame = () => {
    setView('play');
    initGame();
  };

  // Temporizador
  useEffect(() => {
    if (view === 'play' && isPlaying && !showQuestionModal) {
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
  }, [view, isPlaying, showQuestionModal, currentQuestionIndex]);

  const handleTimeout = () => {
    setIsPlaying(false);

    // Registrar error
    const nextResults = [...results];
    nextResults[currentQuestionIndex] = false;
    setResults(nextResults);

    Swal.fire({
      title: 'Tiempo agotado',
      html: `
        <p>Se acabó el tiempo límite para responder este ejercicio.</p>
        <div style="font-size: 1.2rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.5rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
          0 Puntos obtenidos
        </div>
      `,
      icon: 'error',
      confirmButtonColor: '#0077b6',
      confirmButtonText: 'Continuar'
    }).then(() => {
      advanceQuestion(nextResults);
    });
  };

  const showFinalScoreModal = (currentResults, isEarlyFinish = false) => {
    const finalScore = currentResults.filter(r => r === true).length;
    const answeredCount = currentResults.filter(r => r !== null).length;
    setScore(finalScore);
    
    let title = isEarlyFinish ? '¡Juego Finalizado!' : '¡Juego Completado!';
    let message = isEarlyFinish 
      ? `Has finalizado el juego resolviendo ${answeredCount} de ${currentQuestions.length} ejercicios.` 
      : 'Has terminado todos los ejercicios exitosamente.';

    Swal.fire({
      title: title,
      html: `
        <div class="swal-confetti">
          <span style="font-size: 3rem;">🌟</span>
          <span style="font-size: 3rem;">🏆</span>
          <span style="font-size: 3rem;">🌟</span>
        </div>
        <p style="font-size: 1.1rem; margin-bottom: 0;">${message}</p>
        <div style="font-size: 1.4rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.5rem 1rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
          Puntaje final: ${finalScore} puntos
        </div>
      `,
      icon: isEarlyFinish ? 'info' : 'success',
      showCancelButton: true,
      confirmButtonColor: '#0077b6',
      cancelButtonColor: '#0077b6',
      confirmButtonText: 'Finalizar Juego',
      cancelButtonText: 'Volver a Jugar',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
          goToHome();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
          startNewGame();
      }
    });
  };

  const advanceQuestion = (currentResults) => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < currentQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedColors([]);
      setTimeLeft(difficulty === 'Avanzado' ? 300 : difficulty === 'Intermedio' ? 240 : 180);
      setIsPlaying(false);
      setShowQuestionModal(true);
    } else {
      showFinalScoreModal(currentResults, false);
    }
  };

  const handleColorClick = (colorName) => {
    if (!isPlaying || showQuestionModal) return;

    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        return prev.filter(c => c !== colorName);
      } else {
        // Limitar selección según el tipo de pregunta para evitar abusos
        const maxSelectable = currentQuestion.correctColors.length;
        if (maxSelectable === 1) {
          return [colorName]; // Selección única
        } else if (prev.length >= maxSelectable) {
          // Reemplaza el más antiguo o simplemente no permite agregar más
          return [...prev.slice(1), colorName];
        }
        return [...prev, colorName];
      }
    });
  };

  const handleValidateSolution = () => {
    if (selectedColors.length === 0) {
      Swal.fire({
        title: 'Atención',
        text: 'Por favor selecciona al menos un color en la rueda.',
        icon: 'warning',
        confirmButtonColor: '#0077b6'
      });
      return;
    }

    clearInterval(timerRef.current);
    setIsPlaying(false);

    // Comparar respuestas (sin importar el orden)
    const isCorrect =
      selectedColors.length === currentQuestion.correctColors.length &&
      selectedColors.every(c => currentQuestion.correctColors.includes(c));

    const nextResults = [...results];
    nextResults[currentQuestionIndex] = isCorrect;
    setResults(nextResults);

    const isAvanzado = difficulty === 'Avanzado';
    const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
    const nextButtonText = isLastQuestion ? 'Ver Resultados' : 'Siguiente Ejercicio';

    if (isCorrect) {
      setScore(prev => prev + 1);
      Swal.fire({
        title: '¡Excelente!',
        html: `
          <div class="swal-confetti">
            <span style="font-size: 3rem;">🎉</span>
            <span style="font-size: 3rem;">✨</span>
            <span style="font-size: 3rem;">🎊</span>
          </div>
          ${difficulty === 'Avanzado' ? 
            `<div style="display: flex; justify-content: center; align-items: center; padding: 0.5rem; background: #f8fafc; border-radius: 50%; width: 90px; height: 90px; margin: 0.5rem auto 1rem auto; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
               <div style="font-size: 3.5rem;" class="${currentQuestion.animClass}">${currentQuestion.emoji}</div>
             </div>`
          : ''}
          <p style="font-size: 1.1rem; margin-bottom: 0;">${difficulty === 'Avanzado' || currentQuestion.correctColors.length === 1 || (difficulty === 'Básico' && currentQuestionIndex === 0) ? 'Tu respuesta es correcta.' : 'Tu combinación cromática es correcta.'}</p>
          <div style="font-size: 1.4rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.5rem 1rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
            ⭐ +1 Punto
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#0077b6',
        confirmButtonText: nextButtonText,
        timer: isAvanzado ? 5000 : undefined,
        showConfirmButton: !isAvanzado
      }).then(() => {
        if (isAvanzado) {
          setTimeout(() => advanceQuestion(nextResults), 2000);
        } else {
          advanceQuestion(nextResults);
        }
      });
    } else {
      Swal.fire({
        title: 'Incorrecto',
        html: `
          <p style="font-size: 1.1rem; margin-bottom: 0;">${difficulty === 'Básico' && currentQuestionIndex === 0 ? 'La respuesta no es correcta, Los colores primarios son: Amarillo, Rojo y Azul.' : `La respuesta no es correcta, ${difficulty === 'Avanzado' || currentQuestion.correctColors.length === 1 ? 'El color correcto es:' : 'La combinación correcta es:'} <strong>${currentQuestion.correctColors.join(' + ')}</strong>.`}</p>
          <div style="font-size: 1.2rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
            0 Puntos obtenidos
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#0077b6',
        confirmButtonText: nextButtonText,
        timer: isAvanzado ? 5000 : undefined,
        showConfirmButton: !isAvanzado
      }).then(() => {
        if (isAvanzado) {
          setTimeout(() => advanceQuestion(nextResults), 2000);
        } else {
          advanceQuestion(nextResults);
        }
      });
    }
  };

  const startCurrentExercise = () => {
    setShowQuestionModal(false);
    setIsPlaying(true);
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
      text: `Has resuelto ${results.filter(r => r !== null).length} de ${currentQuestions.length} ejercicios.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0077b6',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Seguir Jugando'
    }).then((result) => {
      if (result.isConfirmed) {
        clearInterval(timerRef.current);
        showFinalScoreModal(results, true);
      }
    });
  };

  const handleSmartDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(10);
    setStatusText('Preparando configuración...');

    try {
      const title = gameDetailsWithDate?.gameName || 'Cromix';
      const baseName = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      const config = {
        nombreApp: title,
        nivel: difficulty,
        autor: gameDetailsWithDate?.authorName || '',
        version: gameDetailsWithDate?.version || '1.0.0',
        fecha: gameDetailsWithDate?.date || new Date().toISOString(),
        descripcion: gameDetailsWithDate?.description || 'Rueda cromática interactiva basada en el modelo de Newton.',
        plataformas: selectedPlatforms
      };
      const htmlContent = generateCromixCode(
        difficulty,
        gameDetailsWithDate,
        selectedPlatforms
      );
      const content = await createGameDownloadArchive({
        folderName: 'Cromix',
        baseFileName: baseName,
        htmlContent,
        configFileName: 'cromix-config.json',
        config,
        selectedPlatforms,
        nativeTemplates: {
          android: { url: CROMIX_NATIVE_TEMPLATE_URLS.android, replaceIndex: false },
          ios: { url: CROMIX_NATIVE_TEMPLATE_URLS.ios, replaceIndex: false }
        },
        nativeMetadata: {
          appId: buildCromixApplicationId(),
          appName: title
        },
        onStatus: (status) => {
          setStatusText(status);
          setProgress((current) => Math.min(90, current + 18));
        }
      });

      downloadGameArchive(content, `${baseName}_${selectedPlatforms.join('_')}.zip`);
      setProgress(100);
      setStatusText('¡Descarga iniciada!');
      setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
    } catch (err) {
      console.error('Error generando el paquete de Cromix:', err);
      setStatusText(err?.message || 'Error al generar el paquete.');
      setIsGenerating(false);
    }
  };
  const renderSetupScreen = () => {
    const gameIcon = location.state?.selectedGame?.icon || "/images/juegos/cromix.png";
    return (
      <div className="catalog-screen">
        {/* TÍTULO ANIMADO */}
        <div className="game-title">
          {'Juego de Cromix'.split('').map((char, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        {/* LOGO / IMAGEN DEL JUEGO */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src={gameIcon} alt="Cromix" className="game-preview-image" onError={(e) => { e.target.onerror = null; e.target.src = '/images/juegos/cromix.png'; }} />
          <span className="game-info-badge">Ciencia</span>
        </div>

        <div className="rules-banner">
          <h2><QuestionIcon size={24} /> Cromix: Rueda Cromática de Newton</h2>
          <p>
            Identifica relaciones de color fundamentales. Selecciona las secciones del círculo de color interactivo
            para resolver retos sobre colores primarios, secundarios, mezclas y combinaciones emocionales.
          </p>
        </div>

        <div className="difficulty-select-wrapper">
          <label htmlFor="difficulty-select">Seleccione el nivel de dificultad:</label>
          <select
            id="difficulty-select"
            className="difficulty-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="" disabled>Selecciona un nivel...</option>
            <option value="Básico">Básico (4 Ejercicios)</option>
            <option value="Intermedio">Intermedio (5 Ejercicios)</option>
            <option value="Avanzado">Avanzado (6 Ejercicios)</option>
          </select>
        </div>

        <div className="catalog-actions">
          <button className="no-rounded-button btn-primary" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Anterior
          </button>
          <button
            className="no-rounded-button btn-primary"
            onClick={startNewGame}
            disabled={!difficulty}
            style={{ opacity: difficulty ? 1 : 0.5, cursor: difficulty ? 'pointer' : 'not-allowed' }}
          >
            <Play size={18} /> Siguiente
          </button>
        </div>
      </div>
    );
  };

  const renderGameScreen = () => {
    const mixedHex = getMixedColorHex(selectedColors);

    return (
      <div className="game-screen">
        {/* TÍTULO ANIMADO */}
        <div className="game-title" style={{ marginBottom: '0.5rem' }}>
          {'Juego de Cromix'.split('').map((char, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.04}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <h3 style={{ textAlign: 'center', color: '#6b7280', marginTop: '-0.5rem', marginBottom: '1.5rem', fontWeight: '500' }}>
          (Vista Previa)
        </h3>

        {/* REGLAS BÁSICAS — dinámicas por dificultad */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto 1.5rem auto', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.85rem 1.25rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
            📋 Reglas básicas
          </span>
          <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>
            {CROMIX_RULES[difficulty]}
          </span>
        </div>

        {/* MODAL ANIMADO DE LA PREGUNTA */}
        {showQuestionModal && (
          <div className="modal-backdrop">
            <div className="question-modal">
              {currentQuestion.emoji && (
                <div className="question-icon-wrapper">
                  {currentQuestion.emoji}
                </div>
              )}
              <div className="question-header">Ejercicio {currentQuestionIndex + 1} de {currentQuestions.length}</div>
              <div className="question-body">{currentQuestion.question}</div>
              <div className="question-helper">{currentQuestion.helperText}</div>
              <button className="btn-start-exercise" onClick={startCurrentExercise}>
                <Play size={22} fill="white" /> ¡Comenzar Ejercicio!
              </button>
            </div>
          </div>
        )}

        {/* TÍTULO DE PREGUNTA DURANTE JUEGO */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem 2rem', marginBottom: '1.5rem', textAlign: 'center', width: '100%' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Ejercicio Actual</span>
          <span style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', fontWeight: '700' }}>{currentQuestion.question}</span>
        </div>

        <div className="game-layout">
          <div className="game-main-col">
            <div className="wheel-container">
              <svg width="450" height="450" viewBox="0 0 500 500">
                <g className="wheel-spin-group">
                  {CHROMATIC_COLORS.map((color, index) => {
                    const angleSize = 360 / CHROMATIC_COLORS.length;
                    const startAngle = index * angleSize - 105;
                    const endAngle = (index + 1) * angleSize - 105;
                    const pathD = getSlicePath(250, 250, 100, 220, startAngle, endAngle);
                    const isSelected = selectedColors.includes(color.name);

                    return (
                      <path
                        key={color.name}
                        d={pathD}
                        fill={color.hex}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className={`color-slice ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleColorClick(color.name)}
                        title={color.name}
                      />
                    );
                  })}
                </g>
                {/* Círculo central que muestra el color resultante de la mezcla */}
                <circle
                  cx="250"
                  cy="250"
                  r="90"
                  fill={mixedHex}
                  stroke="#ffffff"
                  strokeWidth="4"
                  className="center-mix-circle"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                />
                <text
                  x="250"
                  y="254"
                  textAnchor="middle"
                  fill={selectedColors.length > 0 ? (CHROMATIC_COLORS.find(c => c.name === selectedColors[0])?.text || '#4b5563') : '#4b5563'}
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    pointerEvents: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {selectedColors.length === 0 ? 'Mezcla' : (selectedColors.length === 1 ? 'Color' : 'Mezclado')}
                </text>
              </svg>
            </div>

            {/* Muestra combinaciones visuales en texto */}
            <div className="mix-display" style={{ flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="mix-color-preview" style={{ backgroundColor: mixedHex }} />
                <span>
                  {selectedColors.length === 0 ? (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Haz clic en los colores de la rueda para seleccionarlos</span>
                  ) : (
                    <span>Selección: {selectedColors.join(' + ')}</span>
                  )}
                </span>
              </div>
              {difficulty === 'Avanzado' && results[currentQuestionIndex] === true && (
                <div className={currentQuestion.animClass} style={{ fontSize: '4.5rem', marginTop: '1.5rem', display: 'inline-block' }}>
                  {currentQuestion.emoji}
                </div>
              )}
            </div>
          </div>

          <div className="game-right-col">
            <div className="stats-block">
              <h3><Trophy size={20} /> Progreso</h3>
              <div className="stats-item">
                <span>Dificultad:</span>
                <strong>{difficulty}</strong>
              </div>
              <div className="stats-item">
                <span>Tiempo Límite:</span>
                <strong className={timeLeft <= 30 ? 'timer-warn' : ''}>{formatTime(timeLeft)}</strong>
              </div>
              <div className="stats-item">
                <span>Ejercicio:</span>
                <strong>{currentQuestionIndex + 1} / {currentQuestions.length}</strong>
              </div>
              <div className="stats-item">
                <span>Puntaje:</span>
                <strong style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>{score} pts</strong>
              </div>
              <div className="stats-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Estatus de Ejercicios:</span>
                <div className="exercise-dots">
                  {results.map((res, i) => {
                    let className = 'dot';
                    let content = i + 1;
                    if (i === currentQuestionIndex) className += ' current';
                    else if (res === true) className += ' correct';
                    else if (res === false) className += ' wrong';

                    if (res === true) content = '✓';
                    else if (res === false) content = '✗';

                    return (
                      <div key={i} className={className}>
                        {content}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                <button className="no-rounded-button btn-primary" onClick={handleValidateSolution} style={{ width: '100%', justifyContent: 'center' }}>
                  <CheckSquare size={16} /> Validar Solución
                </button>
                <button className="no-rounded-button btn-primary" onClick={handleFinishGame} style={{ width: '100%', justifyContent: 'center' }}>
                  <X size={16} /> Finalizar Juego
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* NAV FOOTER — igual que BioFlor */}
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
        <p className="rules-text" style={{ textAlign: 'center' }}>Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.</p>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.5rem 0 2rem 0', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }} />

        <h1 className="selection-title" style={{ textAlign: 'center', color: '#0077b6', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>
          Resumen de la Configuración
        </h1>

        <div className="summary-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
              <div className="info-card-value">{gameDetailsWithDate.gameName || 'Cromix'}</div>
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
                {gameDetailsWithDate.description || 'Rueda cromática interactiva basada en el modelo de Newton.'}
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
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Star size={18} /> Ejercicios:</span>
              <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentQuestions.length}</strong>
            </div>
            <div className="summary-row">
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Timer size={18} /> Tiempo Límite:</span>
              <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{difficulty === 'Avanzado' ? '5 minutos' : difficulty === 'Intermedio' ? '4 minutos' : '3 minutos'}</strong>
            </div>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <button className="no-rounded-button btn-primary" onClick={goToHome} disabled={isGenerating}
              style={{ opacity: isGenerating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          <button
            className="no-rounded-button btn-primary"
            onClick={handleSmartDownload}
            disabled={isGenerating}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: '0 4px 14px 0 rgba(0, 119, 182, 0.35)',
              minWidth: '240px', justifyContent: 'center',
              fontSize: '1rem', padding: '0.85rem 2rem',
              cursor: isGenerating ? 'wait' : 'pointer',
              opacity: isGenerating ? 0.8 : 1,
              fontWeight: '700', letterSpacing: '0.02em'
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
      <div className="cromix-container">
        {view === 'home' && renderSetupScreen()}
        {view === 'play' && renderGameScreen()}
        {view === 'summary' && renderSummaryScreen()}
      </div>
    </>
  );
};

// --- GENERADOR HTML PARA EL JUEGO INDEPENDIENTE ---
export const generateCromixCode = (difficulty, gameDetails = {}, selectedPlatforms = ['web']) => {
  const titleText = gameDetails.gameName || 'Cromix';
  const authorName = gameDetails.authorName || 'No especificado';
  const version = gameDetails.version || '1.0.0';
  const gameDesc = gameDetails.description || 'Rueda cromática interactiva basada en el modelo de Newton.';
  const rawDate = gameDetails.date || new Date().toISOString();
  const formattedDate = (() => {
    try {
      const normalized = rawDate.includes('T') ? rawDate : rawDate + 'T00:00:00';
      return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return 'Fecha no especificada'; }
  })();
  const platformsStr = selectedPlatforms && selectedPlatforms.length > 0
    ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
    : 'Web';

  const questionsList = QUESTIONS_DB[difficulty] || QUESTIONS_DB['Básico'];

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleText}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; background: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; }
    button { font-family: inherit; }

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

    .info-modal-content { background: white; padding: 2.5rem; border-radius: 1rem; max-width: 600px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; position: relative; text-align: left; }
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

    ${CROMIX_PREVIEW_STYLES}
    .game-title.static span { animation: none; transform: none; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="https://unpkg.com/lucide@0.263.1/dist/umd/lucide.js"></script>

  <div id="start-screen" class="overlay">
    <h1 style="font-size: 2.5rem; margin-bottom: 1rem; text-align: center; color: var(--secondary-color);">${titleText}</h1>
    <div style="background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">
      Nivel: ${difficulty}
    </div>
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
        <div class="info-item"><span class="info-label">Dificultad</span><span class="info-value">${difficulty}</span></div>
        <div class="info-item info-desc"><span class="info-label">Descripción</span><p class="info-value">${gameDesc}</p></div>
      </div>
      <div style="text-align: center; margin-top: 1.5rem;">
        <button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem;" onclick="toggleInfo(false)">Cerrar</button>
      </div>
    </div>
  </div>

  <!-- Modal de preguntas dentro del juego -->
  <div id="question-overlay" class="modal-backdrop hidden">
    <div class="question-modal">
      <div id="q-icon" class="question-icon-wrapper" style="display:none;"></div>
      <div class="question-header" id="q-header-text">Ejercicio 1 de ${questionsList.length}</div>
      <div class="question-body" id="q-body-text">Pregunta</div>
      <div class="question-helper" id="q-helper-text">Ayuda</div>
      <button class="btn-start-exercise" onclick="closeQuestionModal()">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        ¡Comenzar Ejercicio!
      </button>
    </div>
  </div>


  <div class="cromix-container" id="game-ui" style="display:none;">
    <div class="game-title" id="main-title" style="margin-bottom:0.5rem;">Cargando...</div>

    <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
        <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
        <span style="font-size:1rem; color:#1e40af; font-weight:500;">${CROMIX_RULES[difficulty] || CROMIX_RULES['Básico']}</span>
    </div>

    <div id="question-title-bar" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:0.75rem; padding:1.25rem 2rem; margin-bottom:1.5rem; text-align:center; width:100%; box-sizing: border-box;">
      <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; display:block; margin-bottom:0.5rem;">Ejercicio Actual</span>
      <span style="font-size:1.4rem; color:var(--secondary-color); font-weight:700;" id="current-question-title">Pregunta...</span>
    </div>

    <div class="game-layout">
      <div class="game-main-col">
        <div class="wheel-container">
          <svg width="450" height="450" viewBox="0 0 500 500" id="wheel-svg"></svg>
        </div>
        <div class="mix-display" style="flex-direction: column; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="mix-color-preview" id="mix-color-preview-el" style="background-color: #e2e8f0;"></div>
            <span id="mix-text-el" style="color: #94a3b8; font-style: italic;">Haz clic en los colores de la rueda para seleccionarlos</span>
          </div>
          <div id="advanced-emoji-display" style="font-size: 4.5rem; margin-top: 1.5rem; display: none;"></div>
        </div>
      </div>
      <div class="game-right-col">
        <div class="stats-block">
          <h3><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> Progreso</h3>
          <div class="stats-item"><span>Dificultad:</span> <strong>${difficulty}</strong></div>
          <div class="stats-item"><span>Tiempo Límite:</span> <strong id="timer-val">${difficulty === 'Avanzado' ? '05:00' : difficulty === 'Intermedio' ? '04:00' : '03:00'}</strong></div>
          <div class="stats-item"><span>Ejercicio:</span> <strong id="exercise-val">1 / ${questionsList.length}</strong></div>
          <div class="stats-item"><span>Puntaje:</span> <strong id="score-val" style="color: var(--primary-color); font-size: 1.2rem;">0 pts</strong></div>

          <div class="stats-item" style="flex-direction: column; align-items: flex-start; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid #f1f5f9; padding-top: 1rem;">
            <span style="font-size: 0.9rem; margin-bottom: 0.25rem;">Estatus de Ejercicios:</span>
            <div class="exercise-dots" id="exercise-dots-container"></div>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.65rem; margin-top:1.25rem;">
            <button class="no-rounded-button btn-primary" onclick="handleValidateSolution()" style="width:100%; justify-content:center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg> Validar Solución</button>
            <button class="no-rounded-button btn-primary" onclick="handleFinish()" style="width:100%; justify-content:center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> Finalizar Juego</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const difficulty = "${difficulty}";
    const colorsData = ${JSON.stringify(CHROMATIC_COLORS)};
    const questions = ${JSON.stringify(questionsList)};

    let state = {
      currentQuestionIndex: 0,
      selectedColors: [],
      score: 0,
      results: new Array(questions.length).fill(null),
      timeLeft: difficulty === 'Avanzado' ? 300 : difficulty === 'Intermedio' ? 240 : 180,
      isPlaying: false,
      showModal: false
    };

    let timerInterval = null;

    // Helper SVG slice path
    function getSlicePath(cx, cy, rIn, rOut, startAngle, endAngle) {
      const rad = Math.PI / 180;
      const x1_out = cx + rOut * Math.cos(startAngle * rad);
      const y1_out = cy + rOut * Math.sin(startAngle * rad);
      const x2_out = cx + rOut * Math.cos(endAngle * rad);
      const y2_out = cy + rOut * Math.sin(endAngle * rad);
      const x1_in = cx + rIn * Math.cos(startAngle * rad);
      const y1_in = cy + rIn * Math.sin(startAngle * rad);
      const x2_in = cx + rIn * Math.cos(endAngle * rad);
      const y2_in = cy + rIn * Math.sin(endAngle * rad);
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      return "M "+x1_out+" "+y1_out+" A "+rOut+" "+rOut+" 0 "+largeArc+" 1 "+x2_out+" "+y2_out+" L "+x2_in+" "+y2_in+" A "+rIn+" "+rIn+" 0 "+largeArc+" 0 "+x1_in+" "+y1_in+" Z";
    }

    function getMixedColorHex(selectedNames) {
      if (selectedNames.length === 0) return '#e2e8f0';
      const key = [...selectedNames].sort().join('+');
      const presets = {
        'Amarillo+Azul': '#00B53F',
        'Azul+Rojo': '#7900B5',
        'Amarillo+Rojo': '#FF6600',
        'Amarillo+Naranja': '#FF9900',
        'Morado+Rojo': '#E6007E'
      };
      if (presets[key]) return presets[key];

      const selectedObjects = colorsData.filter(c => selectedNames.includes(c.name));
      let r = 0, g = 0, b = 0;
      selectedObjects.forEach(c => {
        const hex = c.hex.replace('#', '');
        r += parseInt(hex.substring(0, 2), 16);
        g += parseInt(hex.substring(2, 4), 16);
        b += parseInt(hex.substring(4, 6), 16);
      });
      r = Math.round(r / selectedObjects.length);
      g = Math.round(g / selectedObjects.length);
      b = Math.round(b / selectedObjects.length);
      return "#"+r.toString(16).padStart(2, '0')+g.toString(16).padStart(2, '0')+b.toString(16).padStart(2, '0');
    }

    function initTitle() {
      const el = document.getElementById('main-title');
      const textToAnimate = "Juego de " + "${titleText}";
      el.innerHTML = textToAnimate.split('').map((c, i) => '<span style="animation-delay:'+(i*0.04)+'s">'+(c===' '?'&nbsp;':c)+'</span>').join('');
    }

    function startGameSequence() {
      document.getElementById('start-screen').classList.add('hidden');
      document.getElementById('countdown-screen').classList.remove('hidden');
      let count = 5, d = document.getElementById('countdown-display');
      const interval = setInterval(() => {
        count--;
        if(count > 0) d.innerText = count;
        else { clearInterval(interval); document.getElementById('countdown-screen').classList.add('hidden'); startGame(); }
      }, 1000);
    }

    function startGame() {
      document.getElementById('game-ui').style.display = 'flex';
      initTitle();
      drawWheel();
      showQuestionModal();
      startTimer();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function drawWheel() {
      const svg = document.getElementById('wheel-svg');
      svg.innerHTML = '';

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "wheel-spin-group");

      colorsData.forEach((color, index) => {
        const angleSize = 360 / colorsData.length;
        const startAngle = index * angleSize - 105;
        const endAngle = (index + 1) * angleSize - 105;
        const pathD = getSlicePath(250, 250, 100, 220, startAngle, endAngle);

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        path.setAttribute("fill", color.hex);
        path.setAttribute("stroke", "#ffffff");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("class", "color-slice");
        path.setAttribute("id", "slice-" + color.name);
        path.onclick = () => handleColorClick(color.name);
        g.appendChild(path);
      });
      svg.appendChild(g);

      // Central mixture circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "250");
      circle.setAttribute("cy", "250");
      circle.setAttribute("r", "90");
      circle.setAttribute("fill", "#e2e8f0");
      circle.setAttribute("stroke", "#ffffff");
      circle.setAttribute("stroke-width", "4");
      circle.setAttribute("class", "center-mix-circle");
      circle.setAttribute("id", "mix-circle");
      circle.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.15))";
      svg.appendChild(circle);

      // Central text
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", "250");
      text.setAttribute("y", "254");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#4b5563");
      text.setAttribute("id", "mix-text-inner");
      text.style.fontSize = "0.85rem";
      text.style.fontWeight = "800";
      text.style.pointerEvents = "none";
      text.style.textTransform = "uppercase";
      text.style.letterSpacing = "0.05em";
      text.textContent = "Mezcla";
      svg.appendChild(text);
    }

    function showQuestionModal() {
      state.showModal = true;
      const q = questions[state.currentQuestionIndex];

      const qIcon = document.getElementById('q-icon');
      if (q.emoji) {
        qIcon.innerText = q.emoji;
        qIcon.style.display = 'flex';
      } else {
        qIcon.style.display = 'none';
      }

      document.getElementById('q-header-text').innerText = "Ejercicio "+(state.currentQuestionIndex+1)+" de "+questions.length;
      document.getElementById('q-body-text').innerText = q.question;
      document.getElementById('q-helper-text').innerText = q.helperText;
      document.getElementById('question-overlay').classList.remove('hidden');
    }

    function closeQuestionModal() {
      state.showModal = false;
      state.isPlaying = true;
      document.getElementById('question-overlay').classList.add('hidden');
      updateUI();
    }

    function handleColorClick(colorName) {
      if (!state.isPlaying || state.showModal) return;

      const q = questions[state.currentQuestionIndex];
      const maxSelectable = q.correctColors.length;

      const index = state.selectedColors.indexOf(colorName);
      if (index > -1) {
        state.selectedColors.splice(index, 1);
      } else {
        if (maxSelectable === 1) {
          state.selectedColors = [colorName];
        } else if (state.selectedColors.length >= maxSelectable) {
          state.selectedColors.shift();
          state.selectedColors.push(colorName);
        } else {
          state.selectedColors.push(colorName);
        }
      }
      updateUI();
    }

    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (state.isPlaying && !state.showModal && state.timeLeft > 0) {
          state.timeLeft--;
          updateTimerUI();
        }
      }, 1000);
    }

    function updateTimerUI() {
      const el = document.getElementById('timer-val');
      el.innerText = Math.floor(state.timeLeft/60)+':'+(state.timeLeft%60).toString().padStart(2,'0');
      if (state.timeLeft <= 30) {
        el.classList.add('timer-warn');
      } else {
        el.classList.remove('timer-warn');
      }
      if (state.timeLeft <= 0) {
        handleTimeOut();
      }
    }

    function handleTimeOut() {
      state.isPlaying = false;
      state.results[state.currentQuestionIndex] = false;
      Swal.fire({
        title: 'Tiempo agotado',
        html: \`
          <p>Se acabó el tiempo límite para responder este ejercicio.</p>
          <div style="font-size: 1.2rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.5rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
            0 Puntos obtenidos
          </div>
        \`,
        icon: 'error',
        confirmButtonColor: '#0077b6',
        confirmButtonText: 'Continuar'
      }).then(() => {
        advanceQuestion();
      });
    }

    function updateUI() {
      // Update Question title
      const q = questions[state.currentQuestionIndex];
      document.getElementById('current-question-title').innerText = q.question;

      // Update Slices selection classes
      colorsData.forEach(c => {
        const slice = document.getElementById('slice-' + c.name);
        if (state.selectedColors.includes(c.name)) {
          slice.classList.add('selected');
        } else {
          slice.classList.remove('selected');
        }
      });

      // Center mixed color
      const mixedHex = getMixedColorHex(state.selectedColors);
      document.getElementById('mix-circle').setAttribute("fill", mixedHex);

      const textInner = document.getElementById('mix-text-inner');
      if (state.selectedColors.length === 0) {
        textInner.textContent = "Mezcla";
        textInner.setAttribute("fill", "#4b5563");
      } else if (state.selectedColors.length === 1) {
        textInner.textContent = "Color";
        const matched = colorsData.find(c => c.name === state.selectedColors[0]);
        textInner.setAttribute("fill", matched ? matched.text : "#4b5563");
      } else {
        textInner.textContent = "Mezclado";
        textInner.setAttribute("fill", "#4b5563");
      }

      // Bottom mix bar text
      const mixTextEl = document.getElementById('mix-text-el');
      const mixPreviewEl = document.getElementById('mix-color-preview-el');
      mixPreviewEl.style.backgroundColor = mixedHex;
      if (state.selectedColors.length === 0) {
        mixTextEl.innerHTML = '<span style="color:#94a3b8; font-style:italic;">Haz clic en los colores de la rueda para seleccionarlos</span>';
      } else {
        mixTextEl.innerText = "Selección: " + state.selectedColors.join(' + ');
      }

      // Advanced Emotion Emoji logic
      const emojiDisplay = document.getElementById('advanced-emoji-display');
      if (difficulty === 'Avanzado' && state.results[state.currentQuestionIndex] === true) {
        emojiDisplay.innerText = q.emoji || '';
        emojiDisplay.className = q.animClass || '';
        emojiDisplay.style.display = 'inline-block';
      } else {
        emojiDisplay.style.display = 'none';
        emojiDisplay.className = '';
      }

      // Exercise and Score val
      document.getElementById('exercise-val').innerText = (state.currentQuestionIndex + 1) + " / " + questions.length;
      document.getElementById('score-val').innerText = state.results.filter(r => r === true).length + " pts";

      // Dots
      const dotsContainer = document.getElementById('exercise-dots-container');
      dotsContainer.innerHTML = '';
      state.results.forEach((res, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        let content = i + 1;
        if (i === state.currentQuestionIndex) dot.classList.add('current');
        else if (res === true) dot.classList.add('correct');
        else if (res === false) dot.classList.add('wrong');

        if (res === true) content = '✓';
        else if (res === false) content = '✗';

        dot.innerText = content;
        dotsContainer.appendChild(dot);
      });
      updateTimerUI();
    }

    function handleValidateSolution() {
      if (state.selectedColors.length === 0) {
        Swal.fire({
          title: 'Atención',
          text: 'Por favor selecciona al menos un color en la rueda.',
          icon: 'warning',
          confirmButtonColor: '#0077b6'
        });
        return;
      }

      state.isPlaying = false;
      const q = questions[state.currentQuestionIndex];
      const isCorrect = 
        state.selectedColors.length === q.correctColors.length &&
        state.selectedColors.every(c => q.correctColors.includes(c));

      state.results[state.currentQuestionIndex] = isCorrect;

      const isLastQuestion = state.currentQuestionIndex === questions.length - 1;
      const nextButtonText = isLastQuestion ? 'Ver Resultados' : 'Siguiente Ejercicio';

      if (isCorrect) {
        state.score++;
        Swal.fire({
          title: '¡Excelente!',
          html: \`
            <div class="swal-confetti">
              <span style="font-size: 3rem;">🎉</span>
              <span style="font-size: 3rem;">✨</span>
              <span style="font-size: 3rem;">🎊</span>
            </div>
            \${difficulty === 'Avanzado' ? 
              \`<div style="display: flex; justify-content: center; align-items: center; padding: 0.5rem; background: #f8fafc; border-radius: 50%; width: 90px; height: 90px; margin: 0.5rem auto 1rem auto; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                 <div style="font-size: 3.5rem;" class="\${q.animClass}">\${q.emoji}</div>
               </div>\`
            : ''}
            <p style="font-size: 1.1rem; margin-bottom: 0;">\${difficulty === 'Avanzado' || q.correctColors.length === 1 || (difficulty === 'Básico' && state.currentQuestionIndex === 0) ? 'Tu respuesta es correcta.' : 'Tu combinación cromática es correcta.'}</p>
            <div style="font-size: 1.4rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.5rem 1rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
              ⭐ +1 Punto
            </div>
          \`,
          icon: 'success',
          confirmButtonColor: '#0077b6',
          confirmButtonText: nextButtonText,
          timer: difficulty === 'Avanzado' ? 5000 : undefined,
          showConfirmButton: difficulty !== 'Avanzado'
        }).then(() => {
          if (difficulty === 'Avanzado') {
            setTimeout(() => advanceQuestion(), 2000);
          } else {
            advanceQuestion();
          }
        });
      } else {
        Swal.fire({
          title: 'Incorrecto',
          html: \`
            <p style="font-size: 1.1rem; margin-bottom: 0;">\${difficulty === 'Básico' && state.currentQuestionIndex === 0 ? 'La respuesta no es correcta, Los colores primarios son: Amarillo, Rojo y Azul.' : \`La respuesta no es correcta, \${difficulty === 'Avanzado' || q.correctColors.length === 1 ? 'El color correcto es:' : 'La combinación correcta es:'} <strong>\${q.correctColors.join(' + ')}</strong>.\`}</p>
            <div style="font-size: 1.2rem; font-weight: bold; color: #64748b; margin-top: 1rem; padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 0.5rem; display: inline-block;">
              0 Puntos obtenidos
            </div>
          \`,
          icon: 'error',
          confirmButtonColor: '#0077b6',
          confirmButtonText: nextButtonText,
          timer: difficulty === 'Avanzado' ? 5000 : undefined,
          showConfirmButton: difficulty !== 'Avanzado'
        }).then(() => {
          if (difficulty === 'Avanzado') {
            setTimeout(() => advanceQuestion(), 2000);
          } else {
            advanceQuestion();
          }
        });
      }
    }

    function advanceQuestion() {
      state.currentQuestionIndex++;
      if (state.currentQuestionIndex < questions.length) {
        state.selectedColors = [];
        state.timeLeft = difficulty === 'Avanzado' ? 300 : difficulty === 'Intermedio' ? 240 : 180;
        showQuestionModal();
      } else {
        finishGame(false);
      }
    }

    function handleFinish() {
      Swal.fire({
        title: '¿Deseas finalizar el juego?',
        text: 'Has resuelto ' + state.results.filter(r => r !== null).length + ' de ' + questions.length + ' ejercicios.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0077b6',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Sí, finalizar',
        cancelButtonText: 'Seguir Jugando'
      }).then((result) => {
        if (result.isConfirmed) {
          finishGame(true);
        }
      });
    }

    function finishGame(isEarlyFinish = false) {
      state.isPlaying = false;
      if (timerInterval) clearInterval(timerInterval);

      const finalScore = state.results.filter(r => r === true).length;
      const answeredCount = state.results.filter(r => r !== null).length;

      let title = isEarlyFinish ? '¡Juego Finalizado!' : '¡Juego Completado!';
      let message = isEarlyFinish 
        ? \`Has finalizado el juego resolviendo \${answeredCount} de \${questions.length} ejercicios.\` 
        : 'Has terminado todos los ejercicios exitosamente.';

      Swal.fire({
        title: title,
        html: \`
          <div class="swal-confetti">
            <span style="font-size: 3rem;">🌟</span>
            <span style="font-size: 3rem;">🏆</span>
            <span style="font-size: 3rem;">🌟</span>
          </div>
          <p style="font-size: 1.1rem; margin-bottom: 0;">\${message}</p>
          <div style="font-size: 1.4rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.5rem 1rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
            Puntaje final: \${finalScore} puntos
          </div>
        \`,
        icon: isEarlyFinish ? 'info' : 'success',
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
            location.reload();
        }
      });
    }

    function toggleInfo(show) { document.getElementById('info-overlay').classList.toggle('hidden', !show); }
  </script>
</body>
</html>`;
};

export default Cromix;
