import { buildMissingMobileDownload } from '../../utils/missingMobileGames';
import { downloadGameArchive } from '../../utils/gameDownloadPackaging';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Timer, Star, ArrowLeft, ArrowRight, Tag, Layers, FileText,
    Calendar, Monitor, Check, CheckCircle, Play, CheckSquare, Type, Shapes, Puzzle, Info,
    X, HelpCircle
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

    .stroop-container {
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

    .nav-footer {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--medium-gray-color);
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
      font-size: 3.5rem;
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
      align-items: stretch;
      width: 100%;
    }

    .stroop-board {
      width: 100%;
      min-height: 480px;
      background: #f8fafc;
      border: 2px dashed var(--medium-gray-color);
      border-radius: var(--border-radius);
      position: relative;
      padding: 2rem 1.5rem;
      box-sizing: border-box;
      user-select: none;
    }

    .matching-columns-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 120px;
      position: relative;
      z-index: 2;
    }

    .column-half {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .column-half.words {
      align-items: stretch;
    }

    .column-half.pills {
      align-items: stretch;
    }

    .word-subgrid, .pill-subgrid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .word-subgrid.double-col, .pill-subgrid.double-col {
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    /* Card styling */
    .word-item {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 0.6rem;
      padding: 0.75rem 1rem;
      font-size: 1.25rem;
      font-weight: 800;
      text-align: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .word-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.06);
      border-color: var(--primary-color);
    }

    .word-item.selected {
      border-color: var(--primary-color);
      background-color: #eff6ff;
      box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.25);
    }

    .word-item.connected {
      border-color: #bae6fd;
      background-color: #f0f9ff;
    }

    .word-item.correct {
      border-color: var(--correct-color) !important;
      background-color: #f0fdf4 !important;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
    }

    .word-item.wrong {
      border-color: var(--wrong-color) !important;
      background-color: #fef2f2 !important;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }

    .pill-item {
      height: 3rem;
      border-radius: 9999px;
      cursor: pointer;
      position: relative;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 3px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2);
      display: flex;
      justify-content: center;
      align-items: center;
      border: 3px solid white;
    }

    .pill-item:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3);
    }

    .pill-item.selected {
      box-shadow: 0 0 0 4px var(--primary-color);
    }

    .pill-item.connected {
      border-color: rgba(255, 255, 255, 0.7);
    }

    /* Badges */
    .connection-badge {
      position: absolute;
      top: -6px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      color: white;
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      border: 1px solid white;
      z-index: 3;
    }

    .word-item .connection-badge {
      right: -6px;
    }

    .pill-item .connection-badge {
      left: 10px;
    }

    .disconnect-btn {
      position: absolute;
      right: -8px;
      top: -8px;
      background: var(--wrong-color);
      color: white;
      border: 1px solid white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 4;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .word-item:hover .disconnect-btn {
      opacity: 1;
    }

    /* Game Right Column */
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
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      color: var(--secondary-color);
      font-weight: 700;
      border-bottom: 1px solid var(--light-gray-color);
      padding-bottom: 0.5rem;
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

    .stats-item strong.highlight-timer {
      color: var(--primary-color);
    }

    .stats-item strong.highlight-timer.danger {
      color: var(--wrong-color);
      animation: pulseDanger 1s infinite alternate;
    }

    @keyframes pulseDanger {
      from { transform: scale(1); }
      to { transform: scale(1.1); }
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

    @media (max-width: 900px) {
      .game-layout { grid-template-columns: 1fr; }
      .matching-columns-container { gap: 40px; }
      .stroop-board { min-height: auto; }
    }
  `}</style>
);

const DIFFICULTY_SETTINGS = {
    Básico: { timeLimit: 300, points: 10, attempts: 1 },
    Avanzado: { timeLimit: 600, points: 20, attempts: 2 }
};

const getAreaName = (areaId) => {
    const names = {
        science: 'Ciencia',
        technology: 'Tecnología',
        engineering: 'Ingeniería',
        arts: 'Arte',
        art: 'Arte',
        math: 'Matemáticas'
    };
    return names[areaId] || areaId;
};

const getAreaIcon = (areaId) => {
    const icons = {
        science: '/images/areas/Ciencia.png',
        technology: '/images/areas/Tecnologia.png',
        engineering: '/images/areas/Ingenieria.png',
        arts: '/images/areas/Artes.png',
        art: '/images/areas/Artes.png',
        math: '/images/areas/Matematicas.png'
    };
    return icons[areaId] || 'https://placehold.co/20x20/eee/aaa?text=?';
};

const initGameData = (diff) => {
    const basicWords = [
        { id: 1, text: "Azul", inkColor: "#ef4444", targetColor: "Azul" },     // Written in Red
        { id: 2, text: "Rojo", inkColor: "#22c55e", targetColor: "Rojo" },     // Written in Green
        { id: 3, text: "Verde", inkColor: "#eab308", targetColor: "Verde" },   // Written in Yellow
        { id: 4, text: "Amarillo", inkColor: "#a855f7", targetColor: "Amarillo" }, // Written in Purple
        { id: 5, text: "Naranja", inkColor: "#3b82f6", targetColor: "Naranja" }, // Written in Blue
        { id: 6, text: "Morado", inkColor: "#f97316", targetColor: "Morado" }    // Written in Orange
    ];

    const basicPills = [
        { id: "p1", colorName: "Naranja", hex: "#f97316" },
        { id: "p2", colorName: "Azul", hex: "#3b82f6" },
        { id: "p3", colorName: "Amarillo", hex: "#eab308" },
        { id: "p4", colorName: "Rojo", hex: "#ef4444" },
        { id: "p5", colorName: "Verde", hex: "#22c55e" },
        { id: "p6", colorName: "Morado", hex: "#a855f7" }
    ];

    const advancedWords = [
        ...basicWords,
        { id: 7, text: "Rosa", inkColor: "#78350f", targetColor: "Rosa" },      // Written in Brown
        { id: 8, text: "Café", inkColor: "#22c55e", targetColor: "Café" },      // Written in Green
        { id: 9, text: "Negro", inkColor: "#ec4899", targetColor: "Negro" },    // Written in Pink
        { id: 10, text: "Gris", inkColor: "#0f172a", targetColor: "Gris" },     // Written in Black
        { id: 11, text: "Lima", inkColor: "#ec4899", targetColor: "Lima" },     // Written in Pink
        { id: 12, text: "Lavanda", inkColor: "#64748b", targetColor: "Lavanda" } // Written in Grey
    ];

    const advancedPills = [
        ...basicPills,
        { id: "p7", colorName: "Lavanda", hex: "#a5b4fc" },
        { id: "p8", colorName: "Negro", hex: "#0f172a" },
        { id: "p9", colorName: "Lima", hex: "#84cc16" },
        { id: "p10", colorName: "Rosa", hex: "#ec4899" },
        { id: "p11", colorName: "Café", hex: "#78350f" },
        { id: "p12", colorName: "Gris", hex: "#64748b" }
    ];

    let selectedWords = diff === 'Básico' ? [...basicWords] : [...advancedWords];
    let selectedPills = diff === 'Básico' ? [...basicPills] : [...advancedPills];

    // Shuffle the pills to make it a game
    selectedPills = selectedPills.sort(() => Math.random() - 0.5);

    return { words: selectedWords, pills: selectedPills };
};

const Stroop = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are loading into the summary directly from router state
    const stateData = location.state || {};
    const MOCK_DATA = {
        selectedAreas: ['science'],
        selectedSkills: ['Atención focalizada', 'Control inhibitorio', 'Procesamiento cognitivo'],
        gameDetails: {
            gameName: 'Juego de Stroop',
            description: 'Actividad basada en el efecto Stroop que mide la interferencia semántica al asociar palabras de colores con su color correspondiente.',
            version: '1.0.0',
            date: null
        },
        selectedPlatforms: ['web']
    };

    // Siempre usar la fecha actual del sistema (equipo del usuario) — igual que Acertijo.jsx
    const getFixedCreationDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    };

    const selectedAreas = stateData.selectedAreas || MOCK_DATA.selectedAreas;
    const selectedSkills = stateData.selectedSkills || MOCK_DATA.selectedSkills;
    const rawGameDetails = stateData.gameDetails || MOCK_DATA.gameDetails;
    const gameDetails = { ...rawGameDetails, date: getFixedCreationDate() };
    const selectedPlatforms = stateData.selectedPlatforms || MOCK_DATA.selectedPlatforms;

    const isSummaryInit = location.search.includes('view=Summary') || stateData.setupStep === 'summary';
    const [view, setView] = useState(isSummaryInit ? 'summary' : 'home');
    const [difficulty, setDifficulty] = useState('');

    // Game states
    const [words, setWords] = useState([]);
    const [pills, setPills] = useState([]);
    const [connections, setConnections] = useState([]); // Array of { wordId, pillId }

    const [selectedWordId, setSelectedWordId] = useState(null);
    const [selectedPillId, setSelectedPillId] = useState(null);

    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [attemptsUsed, setAttemptsUsed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [correctMatches, setCorrectMatches] = useState([]); // Array of wordIds

    // Bezier curve connection lines
    const [lines, setLines] = useState([]);
    const workspaceRef = useRef(null);
    const timerRef = useRef(null);

    // Download/Zip states
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const jsZipReady = true;

    const currentConfig = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS['Básico'];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);

    // Load JSZip library dynamically


    // Countdown Timer logic
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
    }, [view, isPlaying, attemptsUsed]);

    // Update coordinates for bezier lines between words and pills
    useEffect(() => {
        const updateLines = () => {
            if (!workspaceRef.current || view !== 'play') return;
            const workspaceRect = workspaceRef.current.getBoundingClientRect();

            const newLines = connections.map(conn => {
                const wordElement = document.getElementById(`word-item-${conn.wordId}`);
                const pillElement = document.getElementById(`pill-item-${conn.pillId}`);
                if (wordElement && pillElement) {
                    const wordRect = wordElement.getBoundingClientRect();
                    const pillRect = pillElement.getBoundingClientRect();

                    // Center-right of word card
                    const x1 = wordRect.right - workspaceRect.left;
                    const y1 = wordRect.top + wordRect.height / 2 - workspaceRect.top;

                    // Center-left of pill card
                    const x2 = pillRect.left - workspaceRect.left;
                    const y2 = pillRect.top + pillRect.height / 2 - workspaceRect.top;

                    // Extract color name/hex
                    const hex = pillElement.getAttribute('data-color') || '#0077b6';

                    return {
                        wordId: conn.wordId,
                        pillId: conn.pillId,
                        x1, y1, x2, y2,
                        color: hex
                    };
                }
                return null;
            }).filter(line => line !== null);

            setLines(newLines);
        };

        updateLines();
        window.addEventListener('resize', updateLines);
        const animFrame = requestAnimationFrame(updateLines);

        return () => {
            window.removeEventListener('resize', updateLines);
            cancelAnimationFrame(animFrame);
        };
    }, [connections, view, difficulty, selectedWordId, selectedPillId]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    };

    const initGame = () => {
        const data = initGameData(difficulty);
        setWords(data.words);
        setPills(data.pills);
        setConnections([]);
        setSelectedWordId(null);
        setSelectedPillId(null);
        setTimeLeft(currentConfig.timeLimit);
        setScore(0);
        setAttemptsUsed(0);
        setCorrectMatches([]);
        setIsValidated(false);
        setIsPlaying(true);
    };

    const startNewGame = () => {
        setView('play');
        initGame();
    };

    const handleTimeout = () => {
        setIsPlaying(false);
        const newAttempts = attemptsUsed + 1;
        setAttemptsUsed(newAttempts);

        if (newAttempts >= currentConfig.attempts) {
            Swal.fire({
                title: '¡Tiempo Agotado!',
                text: 'Se acabó el tiempo y has agotado todos tus intentos en este nivel.',
                icon: 'error',
                showCancelButton: true,
                confirmButtonText: 'Finalizar Juego',
                cancelButtonText: 'Volver a Jugar',
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#0077b6',
                reverseButtons: true,
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    goToHome();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    startNewGame();
                }
            });
        } else {
            Swal.fire({
                title: '¡Tiempo Agotado!',
                text: 'Te has quedado sin tiempo, pero tienes otra oportunidad.',
                icon: 'warning',
                confirmButtonText: 'Reintentar',
                confirmButtonColor: '#0077b6'
            }).then(() => {
                // Keep correct matches or clear all? Standard is to clear and reset level
                setConnections([]);
                setSelectedWordId(null);
                setSelectedPillId(null);
                setCorrectMatches([]);
                setIsValidated(false);
                setTimeLeft(currentConfig.timeLimit);
                setIsPlaying(true);
            });
        }
    };

    const handleItemClick = (type, id) => {
        if (!isPlaying) return;
        setIsValidated(false); // Reset validation feedback if they modify connections

        if (type === 'word') {
            if (selectedWordId === id) {
                // Toggle off
                setSelectedWordId(null);
            } else {
                setSelectedWordId(id);
                // If we already have a selected pill, connect them
                if (selectedPillId !== null) {
                    createConnection(id, selectedPillId);
                }
            }
        } else if (type === 'pill') {
            if (selectedPillId === id) {
                // Toggle off
                setSelectedPillId(null);
            } else {
                setSelectedPillId(id);
                // If we already have a selected word, connect them
                if (selectedWordId !== null) {
                    createConnection(selectedWordId, id);
                }
            }
        }
    };

    const createConnection = (wordId, pillId) => {
        // Remove any previous connection for this word or this pill
        setConnections(prev => {
            const filtered = prev.filter(c => c.wordId !== wordId && c.pillId !== pillId);
            return [...filtered, { wordId, pillId }];
        });
        // Clear selection
        setSelectedWordId(null);
        setSelectedPillId(null);
    };

    const removeConnection = (wordId) => {
        if (!isPlaying) return;
        setIsValidated(false);
        setConnections(prev => prev.filter(c => c.wordId !== wordId));
    };

    const validateSolution = () => {
        if (!isPlaying) return;

        // Check if all items are connected
        if (connections.length < words.length) {
            Swal.fire({
                title: 'Asociación Incompleta',
                text: `Por favor, asocia las ${words.length} palabras con sus respectivos colores antes de validar.`,
                icon: 'warning',
                confirmButtonColor: '#0077b6'
            });
            return;
        }

        // Validate each connection
        const correctList = [];
        connections.forEach(conn => {
            const word = words.find(w => w.id === conn.wordId);
            const pill = pills.find(p => p.id === conn.pillId);

            // Correct if the word's text meaning matches the pill's color name
            if (word && pill && word.targetColor === pill.colorName) {
                correctList.push(word.id);
            }
        });

        setCorrectMatches(correctList);
        setIsValidated(true);

        const allCorrect = correctList.length === words.length;

        if (allCorrect) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            setScore(currentConfig.points);

            Swal.fire({
                title: '¡Buen Trabajo!',
                html: `
                    <div class="swal-confetti">
                        <span style="font-size: 3rem;">🌟</span>
                        <span style="font-size: 3rem;">🏆</span>
                        <span style="font-size: 3rem;">🌟</span>
                    </div>
                    <p style="font-size: 1.1rem; margin-bottom: 0;">Has resuelto las asociaciones correctamente.</p>
                    <div style="font-size: 1.2rem; font-weight: bold; color: #166534; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #dcfce7; border: 2px solid #22c55e; border-radius: 0.5rem; display: inline-block; animation: pulseGlow 1.5s infinite;">
                        ✨ +${currentConfig.points} Puntos
                    </div>
                `,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Finalizar Juego',
                cancelButtonText: 'Volver a Jugar',
                confirmButtonColor: '#0077b6',
                cancelButtonColor: '#0077b6',
                reverseButtons: true,
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    goToHome();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    startNewGame();
                }
            });
        } else {
            const newAttempts = attemptsUsed + 1;
            setAttemptsUsed(newAttempts);

            if (newAttempts >= currentConfig.attempts) {
                clearInterval(timerRef.current);
                setIsPlaying(false);
                setScore(0);

                Swal.fire({
                    title: '¡Intentos Agotados!',
                    text: `Has agotado tus intentos. Respuestas correctas: ${correctList.length} de ${words.length}.`,
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonText: 'Finalizar Juego',
                    cancelButtonText: 'Volver a Jugar',
                    confirmButtonColor: '#0077b6',
                    cancelButtonColor: '#0077b6',
                    reverseButtons: true,
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        goToHome();
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        startNewGame();
                    }
                });
            } else {
                Swal.fire({
                    title: 'Asociaciones Incorrectas',
                    text: `Tienes algunas respuestas incorrectas. Revisa las líneas punteadas rojas e intenta de nuevo.`,
                    icon: 'warning',
                    confirmButtonText: 'Seguir Intentando',
                    confirmButtonColor: '#0077b6'
                });
            }
        }
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
                setIsPlaying(false);
                goToHome();
            }
        });
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
                slug: 'stroop', details: gameDetails, platforms: selectedPlatforms,
                options: { nivel: difficulty }, htmlContent: generateStroopCode(difficulty, gameDetails, selectedPlatforms), webAssets: [],
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
            title: '¿Cómo se juega?',
            html: `
                <div style="text-align:left;font-size:0.95rem;line-height:1.6;">
                    <p><strong>Objetivo:</strong> Asociar cada palabra con el color que describe (ignora el color en que está pintada la palabra).</p>
                    <ol>
                        <li>Haz clic en una <strong>palabra</strong> del panel izquierdo para seleccionarla.</li>
                        <li>Luego haz clic en el <strong>círculo de color (píldora)</strong> correspondiente en el panel derecho.</li>
                        <li>Se trazará una línea de conexión entre ambos elementos.</li>
                        <li>Para desconectar una pareja, haz clic en el botón <strong>'×'</strong> en la esquina de la palabra.</li>
                        <li>Cuando asocies todos los elementos, haz clic en <strong>'Validar Solución'</strong> para verificar tu respuesta.</li>
                    </ol>
                    <p style="margin-top:0.75rem;"><strong>Niveles:</strong><br/>
                    • <em>Básico:</em> 6 palabras, 1 minuto, 1 intento.<br/>
                    • <em>Avanzado:</em> 12 palabras, 3 minutos, 2 intentos.</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: '¡Entendido!',
            confirmButtonColor: '#0077b6'
        });
    };

    const renderSetupScreen = () => {
        const gameIcon = location.state?.selectedGame?.icon || '/images/juegos/stroop.png';
        return (
            <div className="catalog-screen" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <h1 className="game-title">
                    {"Juego de Stroop".split("").map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                            {char === " " ? "\u00A0" : char}
                        </span>
                    ))}
                </h1>

                {/* Imagen del juego con efectos, centrada debajo del título */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {gameIcon ? (
                        <img src={gameIcon} alt="Juego de Stroop" className="game-preview-image" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <div className="game-image-placeholder">🌈</div>
                    )}
                    <span className="game-info-badge">Atención y Cognición</span>
                </div>

                <div className="rules-banner">
                    <h2><HelpCircle size={22} /> Efecto Stroop</h2>
                    <p>
                        Esta actividad evalúa el control inhibitorio y la flexibilidad cognitiva.
                        El reto consiste en asociar cada palabra con el color que esta nombra/describe (su significado semántico),
                        ignorando el color físico en el que está pintado el texto.
                    </p>
                </div>

                <div className="difficulty-select-wrapper" style={{ flexDirection: 'column', paddingBottom: '2rem', borderBottom: '1px solid var(--medium-gray-color)' }}>
                    <label>Selecciona el nivel de dificultad:</label>
                    <select
                        className="difficulty-select"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="" disabled>-- Selecciona un nivel --</option>
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
                            style={{ opacity: !difficulty ? 0.5 : 1, cursor: !difficulty ? 'not-allowed' : 'pointer' }}
                        >
                            <Play size={18} /> Siguiente
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderGameScreen = () => {
        // Split lists for Avanzado (4 columns) or single columns for Básico (2 columns)
        const displayCols = difficulty === 'Avanzado';
        const col1Words = displayCols ? words.slice(0, 6) : words;
        const col2Words = displayCols ? words.slice(6, 12) : [];
        const col1Pills = displayCols ? pills.slice(0, 6) : pills;
        const col2Pills = displayCols ? pills.slice(6, 12) : [];

        // Helper to check if a word/pill is connected
        const getWordConnection = (wId) => connections.find(c => c.wordId === wId);
        const getPillConnection = (pId) => connections.find(c => c.pillId === pId);

        return (
            <div style={{ animation: 'fadeIn 0.5s ease-out', width: '100%' }}>
                <div className="game-title" style={{ marginBottom: '0.5rem' }}>
                    {"Juego de Stroop".split("").map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.04}s` }}>
                            {char === " " ? "\u00A0" : char}
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
                        Asocia cada palabra del listado del lado izquierdo con su color correspondiente del lado derecho. Recuerda poner atención en el <strong>nombre/significado</strong> del color escrito y NO en el color físico en el que está pintada la palabra.
                    </span>
                </div>

                <div className="game-layout">
                    {/* Main workspace */}
                    <div className="game-main-col">
                        <div className="stroop-board" ref={workspaceRef} id="game-workspace">

                            {/* SVG Connection Lines overlay */}
                            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                                {lines.map((line, idx) => {
                                    const isCorrect = correctMatches.includes(line.wordId);
                                    let strokeColor = line.color;
                                    let isDashed = false;

                                    if (isValidated) {
                                        strokeColor = isCorrect ? 'var(--correct-color)' : 'var(--wrong-color)';
                                        isDashed = !isCorrect;
                                    }

                                    return (
                                        <g key={idx}>
                                            <path
                                                d={`M ${line.x1} ${line.y1} C ${(line.x1 + line.x2) / 2} ${line.y1}, ${(line.x1 + line.x2) / 2} ${line.y2}, ${line.x2} ${line.y2}`}
                                                fill="none"
                                                stroke={strokeColor}
                                                strokeWidth={isValidated && isCorrect ? 5 : 4}
                                                strokeDasharray={isDashed ? "6,6" : "none"}
                                                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                                            />
                                            <circle cx={line.x1} cy={line.y1} r={4.5} fill={strokeColor} />
                                            <circle cx={line.x2} cy={line.y2} r={4.5} fill={strokeColor} />
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Cards matching container */}
                            <div className="matching-columns-container">
                                {/* Left Side: Words */}
                                <div className="column-half words">
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary-color)', fontWeight: '700', textAlign: 'center' }}>Palabras</h4>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div className="word-subgrid" style={{ flex: 1 }}>
                                            {col1Words.map((word) => {
                                                const conn = getWordConnection(word.id);
                                                const isCorrect = correctMatches.includes(word.id);

                                                let cardStateClass = '';
                                                if (isValidated) {
                                                    cardStateClass = isCorrect ? 'correct' : 'wrong';
                                                } else if (conn) {
                                                    cardStateClass = 'connected';
                                                }
                                                if (selectedWordId === word.id) {
                                                    cardStateClass += ' selected';
                                                }

                                                // Find the pill color for this connection to show the badge
                                                const connectedPill = conn ? pills.find(p => p.id === conn.pillId) : null;

                                                return (
                                                    <div
                                                        key={word.id}
                                                        id={`word-item-${word.id}`}
                                                        className={`word-item ${cardStateClass}`}
                                                        onClick={() => handleItemClick('word', word.id)}
                                                        style={{ color: word.inkColor }}
                                                    >
                                                        {word.text}
                                                        {conn && connectedPill && (
                                                            <>
                                                                <span
                                                                    className="connection-badge"
                                                                    style={{ backgroundColor: connectedPill.hex }}
                                                                >
                                                                    ✓
                                                                </span>
                                                                <button
                                                                    className="disconnect-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeConnection(word.id);
                                                                    }}
                                                                >
                                                                    ×
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {displayCols && (
                                            <div className="word-subgrid" style={{ flex: 1 }}>
                                                {col2Words.map((word) => {
                                                    const conn = getWordConnection(word.id);
                                                    const isCorrect = correctMatches.includes(word.id);

                                                    let cardStateClass = '';
                                                    if (isValidated) {
                                                        cardStateClass = isCorrect ? 'correct' : 'wrong';
                                                    } else if (conn) {
                                                        cardStateClass = 'connected';
                                                    }
                                                    if (selectedWordId === word.id) {
                                                        cardStateClass += ' selected';
                                                    }

                                                    const connectedPill = conn ? pills.find(p => p.id === conn.pillId) : null;

                                                    return (
                                                        <div
                                                            key={word.id}
                                                            id={`word-item-${word.id}`}
                                                            className={`word-item ${cardStateClass}`}
                                                            onClick={() => handleItemClick('word', word.id)}
                                                            style={{ color: word.inkColor }}
                                                        >
                                                            {word.text}
                                                            {conn && connectedPill && (
                                                                <>
                                                                    <span
                                                                        className="connection-badge"
                                                                        style={{ backgroundColor: connectedPill.hex }}
                                                                    >
                                                                        ✓
                                                                    </span>
                                                                    <button
                                                                        className="disconnect-btn"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeConnection(word.id);
                                                                        }}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Color Pills */}
                                <div className="column-half pills">
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary-color)', fontWeight: '700', textAlign: 'center' }}>Colores</h4>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div className="pill-subgrid" style={{ flex: 1 }}>
                                            {col1Pills.map((pill) => {
                                                const conn = getPillConnection(pill.id);
                                                const isSelected = selectedPillId === pill.id;

                                                return (
                                                    <div
                                                        key={pill.id}
                                                        id={`pill-item-${pill.id}`}
                                                        data-color={pill.hex}
                                                        className={`pill-item ${isSelected ? 'selected' : ''} ${conn ? 'connected' : ''}`}
                                                        onClick={() => handleItemClick('pill', pill.id)}
                                                        style={{ backgroundColor: pill.hex }}
                                                    >
                                                        {conn && (
                                                            <span className="connection-badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid white' }}>
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {displayCols && (
                                            <div className="pill-subgrid" style={{ flex: 1 }}>
                                                {col2Pills.map((pill) => {
                                                    const conn = getPillConnection(pill.id);
                                                    const isSelected = selectedPillId === pill.id;

                                                    return (
                                                        <div
                                                            key={pill.id}
                                                            id={`pill-item-${pill.id}`}
                                                            data-color={pill.hex}
                                                            className={`pill-item ${isSelected ? 'selected' : ''} ${conn ? 'connected' : ''}`}
                                                            onClick={() => handleItemClick('pill', pill.id)}
                                                            style={{ backgroundColor: pill.hex }}
                                                        >
                                                            {conn && (
                                                                <span className="connection-badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid white' }}>
                                                                    ✓
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Progress Sidebar panel */}
                    <div className="game-right-col">
                        <div className="stats-block">
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Star size={18} /> Progreso
                            </h3>
                            <div className="stats-item" style={{ marginTop: '1rem' }}>
                                <span>Nivel:</span>
                                <strong>{difficulty}</strong>
                            </div>
                            <div className="stats-item">
                                <span>Tiempo:</span>
                                <strong className={`highlight-timer ${timeLeft <= 10 ? 'danger' : ''}`}>
                                    {formatTime(timeLeft)}
                                </strong>
                            </div>
                            <div className="stats-item">
                                <span>Intentos:</span>
                                <strong>{attemptsUsed} / {currentConfig.attempts}</strong>
                            </div>
                            <div className="stats-item" style={{ borderTop: '1px solid var(--medium-gray-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                                <span>Puntaje:</span>
                                <strong style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }}>{score} pts</strong>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                                <button
                                    className="no-rounded-button btn-primary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                    onClick={validateSolution}
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
                <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1rem', fontSize: '1.1rem' }}>Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.</p>
                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 2rem 0', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }} />

                <h1 className="selection-title" style={{ textAlign: 'center', color: '#0077b6', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>Resumen de la Configuración</h1>


                {/* ── TARJETAS INFO ── */}
                <div className="summary-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
                            <div className="info-card-value">{gameDetails.gameName || 'Juego de Stroop'}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-header"><Type size={16} /> Autor</div>
                            <div className="info-card-value">{gameDetails.authorName || 'No especificado'}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-header"><Layers size={16} /> Versión</div>
                            <div className="info-card-value">{gameDetails.version || '1.0.0'}</div>
                        </div>
                        <div className="info-card full-width">
                            <div className="info-card-header"><FileText size={16} /> Descripción</div>
                            <div className="info-card-value">
                                {gameDetails.description || 'Actividad mental basada en el test de Stroop para entrenar la flexibilidad cognitiva y la atención focalizada.'}
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

                {/* ── PARÁMETROS DEL JUEGO ── */}
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
                        <div className="summary-row">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Star size={18} /> Intentos:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{currentConfig.attempts}</strong>
                        </div>
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <button className="btn-primary" onClick={goToHome} disabled={isGenerating}
                            style={{ opacity: isGenerating ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s', border: 'none', background: '#005f92', color: 'white', fontSize: '1rem' }}>
                            <ArrowLeft size={18} /> Volver a Editar
                        </button>
                    </div>
                </div>

                {/* ── SECCIÓN DE DESCARGA ── */}
                <div className="download-section" style={{ maxWidth: '800px', margin: '2rem auto' }}>
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

                    {/* Botón inteligente */}
                    <button
                        className="btn-primary btn-success"
                        onClick={handleSmartDownload}
                        disabled={isGenerating || !jsZipReady}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            boxShadow: '0 4px 14px 0 rgba(0, 95, 146, 0.35)',
                            minWidth: '240px', justifyContent: 'center',
                            fontSize: '1rem', padding: '0.85rem 2rem',
                            cursor: (isGenerating || !jsZipReady) ? 'wait' : 'pointer',
                            opacity: (isGenerating || !jsZipReady) ? 0.8 : 1,
                            borderRadius: '0.75rem', fontWeight: '700', letterSpacing: '0.02em',
                            background: '#005f92', color: 'white', border: 'none'
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
            <div className="stroop-container">
                {view === 'home' && renderSetupScreen()}
                {view === 'play' && renderGameScreen()}
                {view === 'summary' && renderSummaryScreen()}
            </div>
        </>
    );
};

// --- STANDALONE CODE GENERATION ---
const generateStroopCode = (difficulty, gameDetails, selectedPlatforms) => {
    const config = DIFFICULTY_SETTINGS[difficulty];
    const titleText = gameDetails.gameName || 'Juego de Stroop';
    const authorText = gameDetails.authorName || 'No especificado';
    const versionText = gameDetails.version || '1.0.0';
    const rawDate = gameDetails?.date || (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    })();
    const formattedDate = (() => {
        try {
            const normalized = rawDate.includes('T') ? rawDate : rawDate + 'T00:00:00';
            return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Fecha no especificada'; }
    })();
    const gameDesc = gameDetails.description || 'Actividad mental basada en el test de Stroop para entrenar la flexibilidad cognitiva y la atención focalizada.';
    const platformsStr = selectedPlatforms && selectedPlatforms.length > 0
        ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
        : 'Web';

    // Embedded Game data structures
    const basicWords = [
        { id: 1, text: "Azul", inkColor: "#ef4444", targetColor: "Azul" },
        { id: 2, text: "Rojo", inkColor: "#22c55e", targetColor: "Rojo" },
        { id: 3, text: "Verde", inkColor: "#eab308", targetColor: "Verde" },
        { id: 4, text: "Amarillo", inkColor: "#a855f7", targetColor: "Amarillo" },
        { id: 5, text: "Naranja", inkColor: "#3b82f6", targetColor: "Naranja" },
        { id: 6, text: "Morado", inkColor: "#f97316", targetColor: "Morado" }
    ];

    const basicPills = [
        { id: "p1", colorName: "Naranja", hex: "#f97316" },
        { id: "p2", colorName: "Azul", hex: "#3b82f6" },
        { id: "p3", colorName: "Amarillo", hex: "#eab308" },
        { id: "p4", colorName: "Rojo", hex: "#ef4444" },
        { id: "p5", colorName: "Verde", hex: "#22c55e" },
        { id: "p6", colorName: "Morado", hex: "#a855f7" }
    ];

    const advancedWords = [
        ...basicWords,
        { id: 7, text: "Rosa", inkColor: "#78350f", targetColor: "Rosa" },
        { id: 8, text: "Café", inkColor: "#22c55e", targetColor: "Café" },
        { id: 9, text: "Negro", inkColor: "#ec4899", targetColor: "Negro" },
        { id: 10, text: "Gris", inkColor: "#0f172a", targetColor: "Gris" },
        { id: 11, text: "Lima", inkColor: "#ec4899", targetColor: "Lima" },
        { id: 12, text: "Lavanda", inkColor: "#64748b", targetColor: "Lavanda" }
    ];

    const advancedPills = [
        ...basicPills,
        { id: "p7", colorName: "Lavanda", hex: "#a5b4fc" },
        { id: "p8", colorName: "Negro", hex: "#0f172a" },
        { id: "p9", colorName: "Lima", hex: "#84cc16" },
        { id: "p10", colorName: "Rosa", hex: "#ec4899" },
        { id: "p11", colorName: "Café", hex: "#78350f" },
        { id: "p12", colorName: "Gris", hex: "#64748b" }
    ];

    const finalWords = difficulty === 'Básico' ? basicWords : advancedWords;
    let finalPills = difficulty === 'Básico' ? basicPills : advancedPills;

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
            --correct-color: #22c55e;
            --wrong-color: #ef4444;
            --border-radius: 0.75rem;
            --box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: #f3f4f6; 
            display: flex; 
            justify-content: center; 
            align-items: center;
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
        
        /* Board and panels */
        .stroop-board {
            width: 100%;
            min-height: 460px;
            background: #f8fafc;
            border: 2px dashed var(--medium-gray);
            border-radius: var(--border-radius);
            position: relative;
            padding: 2rem 1.5rem;
            box-sizing: border-box;
        }

        .matching-columns-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 120px;
            position: relative;
            z-index: 2;
        }

        .column-half {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .word-subgrid, .pill-subgrid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            flex: 1;
        }

        .word-subgrid.double-col, .pill-subgrid.double-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }

        /* Card styling */
        .word-item {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 0.6rem;
            padding: 0.75rem 1rem;
            font-size: 1.25rem;
            font-weight: 800;
            text-align: center;
            cursor: pointer;
            position: relative;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .word-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.06);
            border-color: var(--primary-color);
        }

        .word-item.selected {
            border-color: var(--primary-color);
            background-color: #eff6ff;
            box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.25);
        }

        .word-item.connected {
            border-color: #bae6fd;
            background-color: #f0f9ff;
        }

        .word-item.correct {
            border-color: var(--correct-color) !important;
            background-color: #f0fdf4 !important;
        }

        .word-item.wrong {
            border-color: var(--wrong-color) !important;
            background-color: #fef2f2 !important;
        }

        .pill-item {
            height: 3rem;
            border-radius: 9999px;
            cursor: pointer;
            position: relative;
            transition: all 0.2s;
            box-shadow: 0 3px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2);
            display: flex;
            justify-content: center;
            align-items: center;
            border: 3px solid white;
        }

        .pill-item:hover {
            transform: scale(1.05);
        }

        .pill-item.selected {
            box-shadow: 0 0 0 4px var(--primary-color);
        }

        .connection-badge {
            position: absolute;
            top: -6px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            color: white;
            font-size: 0.75rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 1px solid white;
            z-index: 3;
        }

        .word-item .connection-badge {
            right: -6px;
        }

        .disconnect-btn {
            position: absolute;
            right: -8px;
            top: -8px;
            background: var(--wrong-color);
            color: white;
            border: 1px solid white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            z-index: 4;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .word-item:hover .disconnect-btn {
            opacity: 1;
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
            background-color: var(--primary-color);
            color: white;
            width: 100%;
            margin-top: 0.75rem;
            box-sizing: border-box;
        }
        .no-rounded-button:hover:not(:disabled) { 
            background-color: #005f92;
        }
        .no-rounded-button:disabled { 
            opacity: 0.6; 
            cursor: not-allowed; 
        }
        .no-rounded-button.btn-secondary {
            background-color: #4b5563;
        }
        .no-rounded-button.btn-secondary:hover:not(:disabled) {
            background-color: #374151;
        }
        
        .overlay { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(255,255,255,0.98); 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            z-index: 50; 
            padding: 20px; 
            box-sizing: border-box; 
        }
        .hidden { display: none !important; }
        
        .big-btn { 
            padding: 1rem 2rem; 
            font-size: 1.25rem; 
            font-weight: bold; 
            background: var(--primary-color); 
            color: white; 
            border: none; 
            border-radius: var(--border-radius); 
            cursor: pointer; 
            transition: all 0.2s; 
            min-width: 200px; 
            margin-top: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .big-btn:hover { 
            background-color: #005f92;
            transform: translateY(-2px); 
        }
        .instructions { 
            background: #e0f2fe; 
            padding: 1.5rem; 
            border-radius: 0.5rem; 
            color: #0369a1; 
            margin-bottom: 1.5rem; 
            border-left: 4px solid var(--primary-color); 
            font-size: 0.95rem; 
            line-height: 1.5;
            align-self: stretch;
        }

        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        .game-title-animated { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title-animated span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        @keyframes wave-animation { 0%, 40%, 100% { transform: translateY(0); } 20% { transform: translateY(-20px); } }

        @keyframes pulseScoreGlow {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); transform: scale(1); }
            50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); transform: scale(1.02); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); transform: scale(1); }
        }

        .info-modal-content { background: white; padding: 2.5rem; border-radius: 1rem; max-width: 600px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; position: relative; }
        .info-header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .info-title { font-size: 1.8rem; color: var(--primary-color); margin: 0; font-weight: 800; }
        .info-subtitle { color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; }
        .info-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
        .info-item { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; text-align: left; }
        .info-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem; font-weight: 600; }
        .info-value { font-size: 1.1rem; color: #334155; font-weight: 500; }
        .info-desc { grid-column: 1 / -1; background: #fff; padding: 0; border: none; }
        .close-info-btn { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
        .close-info-btn:hover { color: var(--wrong-color); }
    </style>
</head>
<body>
    <div id="start-screen" class="overlay">
        <h1 style="font-size: 3rem; margin-bottom: 1rem; text-align: center; color: var(--secondary-color); font-weight: 800;">Stroop</h1>
        <div style="background: rgba(0,119,182,0.1); color: var(--primary-color); padding: 0.4rem 1.2rem; border-radius: 20px; font-weight: 600; margin-bottom: 1.5rem; border: 1px solid rgba(0,119,182,0.2); display: inline-block;">
            Nivel: ${difficulty}
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; width: 100%;">
            <button class="big-btn" onclick="startGameSequence()" style="margin: 0.5rem 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; vertical-align: middle;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Iniciar Juego
            </button>
            <button class="big-btn" onclick="toggleInfo(true)" style="background: white; color: var(--primary-color); border: 2px solid var(--primary-color); margin: 0.5rem 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> Información
            </button>
        </div>
    </div>

    <div id="countdown-screen" class="overlay hidden"><div id="countdown-display" class="countdown-number">5</div></div>

    <div id="info-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">Juego de Stroop</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
            </div>
            <div class="info-details-grid">
                <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${authorText}</span></div>
                <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${versionText}</span></div>
                <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${platformsStr}</span></div>
                <div class="info-item info-desc"><span class="info-label">Descripción</span><p class="info-value" style="margin: 0; line-height: 1.5; font-size: 1rem;">${gameDesc}</p></div>
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem; margin-top: 0;" onclick="toggleInfo(false)">Cerrar</button>
            </div>
        </div>
    </div>

    <div class="container" id="game-ui" style="display:none;">
        <div class="game-title-animated" style="font-size: 2.5rem; margin-bottom: 0.5rem; margin-top:0;">
            ${'Juego de Stroop'.split('').map((char, index) => `<span style="animation-delay: ${index * 0.05}s">${char === ' ' ? '&nbsp;' : char}</span>`).join('')}
        </div>
        <div style="display: grid; grid-template-columns: 1fr; max-width: 600px; margin: 0 auto 1.5rem auto; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 0.85rem 1.25rem; text-align: center;">
            <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; margin-bottom: 0.25rem; display: block;">📋 Reglas básicas</span>
            <span style="font-size: 1rem; color: #1e40af; font-weight: 500;">
                Asocia cada palabra del listado del lado izquierdo con su color correspondiente del lado derecho. Recuerda poner atención en el <strong>nombre/significado</strong> del color escrito y NO en el color físico en el que está pintada la palabra.
            </span>
        </div>
        <div class="game-layout">
            <div class="game-main-col">
                <div class="stroop-board" id="game-workspace">
                    
                    <!-- SVG Overlay for lines -->
                    <svg id="connection-svg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;"></svg>

                    <div class="matching-columns-container">
                        <!-- Words -->
                        <div class="column-half words">
                            <h4 style="margin: 0 0 0.5rem 0; text-align: center; color: var(--secondary-color);">Palabras</h4>
                            <div id="words-grid-container" style="display:flex; gap: 0.75rem;">
                                <!-- Will be loaded in JS -->
                            </div>
                        </div>

                        <!-- Pills -->
                        <div class="column-half pills">
                            <h4 style="margin: 0 0 0.5rem 0; text-align: center; color: var(--secondary-color);">Colores</h4>
                            <div id="pills-grid-container" style="display:flex; gap: 0.75rem;">
                                <!-- Will be loaded in JS -->
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="game-right-col">
                <div class="stats-block">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        Progreso
                    </h3>
                    <div class="stats-item" style="margin-top: 1rem;"><span>Nivel:</span> <strong>${difficulty}</strong></div>
                    <div class="stats-item"><span>Tiempo:</span> <strong id="timer">00:00</strong></div>
                    <div class="stats-item"><span>Intentos:</span> <strong id="attempts-val">0 / ${config.attempts}</strong></div>
                    <div class="stats-item" style="border-top: 1px solid var(--medium-gray); padding-top: 0.75rem; margin-top: 0.75rem;"><span>Puntaje:</span> <strong id="score" style="font-size: 1.25rem; color: var(--primary-color);">0 pts</strong></div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 1.25rem;">
                        <button class="big-btn" style="width: 100%; justify-content: center; margin: 0; padding: 0.75rem;" onclick="validateSolution()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; vertical-align: middle;"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> Validar Solución
                        </button>
                        <button class="big-btn" style="width: 100%; justify-content: center; margin: 0; padding: 0.75rem;" onclick="finishGame()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; vertical-align: middle;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Finalizar Juego
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        const words = ${JSON.stringify(finalWords)};
        let pills = ${JSON.stringify(finalPills)};
        
        // Shuffle pills for game
        pills = pills.sort(() => Math.random() - 0.5);

        let state = {
            connections: [],
            timeLeft: config.timeLimit,
            score: 0,
            attemptsUsed: 0,
            isPlaying: false,
            isValidated: false,
            timerInterval: null,
            selectedWordId: null,
            selectedPillId: null,
            correctMatches: []
        };

        const isAdvanced = ${difficulty === 'Avanzado' ? 'true' : 'false'};

        function toggleInfo(show) {
            const overlay = document.getElementById('info-overlay');
            if (show) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            const cdScreen = document.getElementById('countdown-screen');
            const cdDisplay = document.getElementById('countdown-display');
            cdScreen.classList.remove('hidden');
            
            let count = 5;
            cdDisplay.innerText = count;
            
            const countInterval = setInterval(() => {
                count--;
                if (count > 0) {
                    cdDisplay.innerText = count;
                    cdDisplay.style.animation = 'none';
                    void cdDisplay.offsetWidth; // trigger reflow
                    cdDisplay.style.animation = 'popIn 0.5s ease-out';
                } else {
                    clearInterval(countInterval);
                    cdScreen.classList.add('hidden');
                    startGame();
                }
            }, 1000);
        }

        function startGame() {
            document.getElementById('game-ui').style.display = 'block';
            state.isPlaying = true;
            
            renderLists();
            initTimer();
            setTimeout(updateLines, 100);
            window.addEventListener('resize', updateLines);
        }

        function initTimer() {
            document.getElementById('timer').innerText = formatTime(state.timeLeft);
            state.timerInterval = setInterval(() => {
                state.timeLeft--;
                const timerEl = document.getElementById('timer');
                timerEl.innerText = formatTime(state.timeLeft);
                
                if (state.timeLeft <= 10) {
                    timerEl.classList.add('danger');
                } else {
                    timerEl.classList.remove('danger');
                }

                if (state.timeLeft <= 0) {
                    clearInterval(state.timerInterval);
                    handleTimeout();
                }
            }, 1000);
        }

        function formatTime(seconds) {
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            return \`\${m}:\${s}\`;
        }

        function renderLists() {
            const wordsContainer = document.getElementById('words-grid-container');
            const pillsContainer = document.getElementById('pills-grid-container');
            
            wordsContainer.innerHTML = '';
            pillsContainer.innerHTML = '';

            const splitCols = isAdvanced;
            
            if (splitCols) {
                // Word Col 1
                const wordCol1 = document.createElement('div');
                wordCol1.className = 'word-subgrid';
                wordCol1.style.flex = '1';
                // Word Col 2
                const wordCol2 = document.createElement('div');
                wordCol2.className = 'word-subgrid';
                wordCol2.style.flex = '1';
                
                // Pill Col 1
                const pillCol1 = document.createElement('div');
                pillCol1.className = 'pill-subgrid';
                pillCol1.style.flex = '1';
                // Pill Col 2
                const pillCol2 = document.createElement('div');
                pillCol2.className = 'pill-subgrid';
                pillCol2.style.flex = '1';

                words.forEach((w, index) => {
                    const el = createWordElement(w);
                    if (index < 6) wordCol1.appendChild(el);
                    else wordCol2.appendChild(el);
                });
                
                pills.forEach((p, index) => {
                    const el = createPillElement(p);
                    if (index < 6) pillCol1.appendChild(el);
                    else pillCol2.appendChild(el);
                });

                wordsContainer.appendChild(wordCol1);
                wordsContainer.appendChild(wordCol2);
                pillsContainer.appendChild(pillCol1);
                pillsContainer.appendChild(pillCol2);
            } else {
                const wordCol = document.createElement('div');
                wordCol.className = 'word-subgrid';
                wordCol.style.flex = '1';

                const pillCol = document.createElement('div');
                pillCol.className = 'pill-subgrid';
                pillCol.style.flex = '1';

                words.forEach(w => wordCol.appendChild(createWordElement(w)));
                pills.forEach(p => pillCol.appendChild(createPillElement(p)));

                wordsContainer.appendChild(wordCol);
                pillsContainer.appendChild(pillCol);
            }
        }

        function createWordElement(w) {
            const el = document.createElement('div');
            el.id = \`word-item-\${w.id}\`;
            el.className = 'word-item';
            el.style.color = w.inkColor;
            el.innerText = w.text;
            
            // Check state
            const conn = state.connections.find(c => c.wordId === w.id);
            const isCorrect = state.correctMatches.includes(w.id);
            
            if (state.isValidated) {
                el.classList.add(isCorrect ? 'correct' : 'wrong');
            } else if (conn) {
                el.classList.add('connected');
            }
            if (state.selectedWordId === w.id) {
                el.classList.add('selected');
            }

            if (conn) {
                const connectedPill = pills.find(p => p.id === conn.pillId);
                if (connectedPill) {
                    const badge = document.createElement('span');
                    badge.className = 'connection-badge';
                    badge.style.backgroundColor = connectedPill.hex;
                    badge.innerText = '✓';
                    el.appendChild(badge);

                    const disc = document.createElement('button');
                    disc.className = 'disconnect-btn';
                    disc.innerText = '×';
                    disc.onclick = (e) => {
                        e.stopPropagation();
                        removeConnection(w.id);
                    };
                    el.appendChild(disc);
                }
            }

            el.onclick = () => handleItemClick('word', w.id);
            return el;
        }

        function createPillElement(p) {
            const el = document.createElement('div');
            el.id = \`pill-item-\${p.id}\`;
            el.setAttribute('data-color', p.hex);
            el.className = 'pill-item';
            el.style.backgroundColor = p.hex;
            
            const conn = state.connections.find(c => c.pillId === p.id);
            if (conn) {
                el.classList.add('connected');
                const badge = document.createElement('span');
                badge.className = 'connection-badge';
                badge.style.backgroundColor = 'rgba(255,255,255,0.2)';
                badge.style.border = '2px solid white';
                badge.innerText = '✓';
                el.appendChild(badge);
            }
            if (state.selectedPillId === p.id) {
                el.classList.add('selected');
            }

            el.onclick = () => handleItemClick('pill', p.id);
            return el;
        }

        function handleItemClick(type, id) {
            if (!state.isPlaying) return;
            state.isValidated = false;

            if (type === 'word') {
                if (state.selectedWordId === id) {
                    state.selectedWordId = null;
                } else {
                    state.selectedWordId = id;
                    if (state.selectedPillId !== null) {
                        createConnection(id, state.selectedPillId);
                    }
                }
            } else if (type === 'pill') {
                if (state.selectedPillId === id) {
                    state.selectedPillId = null;
                } else {
                    state.selectedPillId = id;
                    if (state.selectedWordId !== null) {
                        createConnection(state.selectedWordId, id);
                    }
                }
            }

            renderLists();
            updateLines();
        }

        function createConnection(wordId, pillId) {
            state.connections = state.connections.filter(c => c.wordId !== wordId && c.pillId !== pillId);
            state.connections.push({ wordId, pillId });
            state.selectedWordId = null;
            state.selectedPillId = null;
        }

        function removeConnection(wordId) {
            state.connections = state.connections.filter(c => c.wordId !== wordId);
            renderLists();
            updateLines();
        }

        function checkConnectionCorrect(conn) {
            const word = words.find(w => w.id === conn.wordId);
            const pill = pills.find(p => p.id === conn.pillId);
            return word && pill && word.targetColor === pill.colorName;
        }

        function updateLines() {
            const svg = document.getElementById('connection-svg');
            if (!svg) return;
            svg.innerHTML = '';
            
            const workspace = document.getElementById('game-workspace');
            if (!workspace) return;
            const workspaceRect = workspace.getBoundingClientRect();
            
            state.connections.forEach(conn => {
                const wordEl = document.getElementById(\`word-item-\${conn.wordId}\`);
                const pillEl = document.getElementById(\`pill-item-\${conn.pillId}\`);
                if (wordEl && pillEl) {
                    const wordRect = wordEl.getBoundingClientRect();
                    const pillRect = pillEl.getBoundingClientRect();
                    
                    const x1 = wordRect.right - workspaceRect.left;
                    const y1 = wordRect.top + wordRect.height / 2 - workspaceRect.top;
                    const x2 = pillRect.left - workspaceRect.left;
                    const y2 = pillRect.top + pillRect.height / 2 - workspaceRect.top;
                    
                    const color = pillEl.getAttribute('data-color');
                    const isCorrect = checkConnectionCorrect(conn);
                    let strokeColor = color;
                    let isDashed = false;

                    if (state.isValidated) {
                        strokeColor = isCorrect ? 'var(--correct-color)' : 'var(--wrong-color)';
                        isDashed = !isCorrect;
                    }

                    // Path curve
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const d = \`M \${x1} \${y1} C \${(x1 + x2) / 2} \${y1}, \${(x1 + x2) / 2} \${y2}, \${x2} \${y2}\`;
                    path.setAttribute('d', d);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', strokeColor);
                    path.setAttribute('stroke-width', state.isValidated && isCorrect ? '5' : '4');
                    if (isDashed) {
                        path.setAttribute('stroke-dasharray', '6,6');
                    }
                    svg.appendChild(path);
                    
                    // Dots
                    const startDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    startDot.setAttribute('cx', x1);
                    startDot.setAttribute('cy', y1);
                    startDot.setAttribute('r', '4.5');
                    startDot.setAttribute('fill', strokeColor);
                    svg.appendChild(startDot);
                    
                    const endDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    endDot.setAttribute('cx', x2);
                    endDot.setAttribute('cy', y2);
                    endDot.setAttribute('r', '4.5');
                    endDot.setAttribute('fill', strokeColor);
                    svg.appendChild(endDot);
                }
            });
        }

        function validateSolution() {
            if (!state.isPlaying) return;

            if (state.connections.length < words.length) {
                Swal.fire({
                    title: 'Asociación Incompleta',
                    text: \`Por favor, asocia las \${words.length} palabras antes de validar.\`,
                    icon: 'warning',
                    confirmButtonColor: '#0077b6'
                });
                return;
            }

            const correctList = [];
            state.connections.forEach(conn => {
                if (checkConnectionCorrect(conn)) {
                    correctList.push(conn.wordId);
                }
            });

            state.correctMatches = correctList;
            state.isValidated = true;
            renderLists();
            updateLines();

            const allCorrect = correctList.length === words.length;

            if (allCorrect) {
                clearInterval(state.timerInterval);
                state.isPlaying = false;
                state.score = config.points;
                document.getElementById('score').innerText = state.score + ' pts';
                
                Swal.fire({
                    title: '\u00a1Juego Completado!',
                    html: \`
                        <div class="swal-confetti">
                            <span style="font-size: 3rem;">\ud83c\udf1f</span>
                            <span style="font-size: 3rem;">\ud83c\udfc6</span>
                            <span style="font-size: 3rem;">\ud83c\udf1f</span>
                        </div>
                        <p style="font-size: 1.1rem; margin-bottom: 0;">Has resuelto las asociaciones correctamente. Ganaste <strong>\${config.points}</strong> puntos.</p>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #1e40af; margin-top: 1rem; padding: 0.4rem 0.8rem; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.5rem; display: inline-block; animation: pulseScoreGlow 1.5s infinite;">
                            Puntaje Total: \${config.points}
                        </div>
                    \`,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Finalizar Juego',
                    cancelButtonText: 'Volver a Jugar',
                    confirmButtonColor: '#0077b6',
                    cancelButtonColor: '#0077b6',
                    reverseButtons: true,
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.close();
                        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pesta\u00f1a.</p></div>';
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        restartGame();
                    }
                });
            } else {
                state.attemptsUsed++;
                document.getElementById('attempts-val').innerText = state.attemptsUsed + ' / ' + config.attempts;
                
                if (state.attemptsUsed >= config.attempts) {
                    clearInterval(state.timerInterval);
                    state.isPlaying = false;
                    state.score = 0;
                    document.getElementById('score').innerText = '0 pts';
                    
                    Swal.fire({
                        title: '¡Intentos Agotados!',
                        text: 'Has agotado tus intentos. Respuestas correctas: ' + correctList.length + ' de ' + words.length + '.',
                        icon: 'error',
                        showCancelButton: true,
                        confirmButtonText: 'Finalizar Juego',
                        cancelButtonText: 'Volver a Jugar',
                        confirmButtonColor: '#0077b6',
                        cancelButtonColor: '#0077b6',
                        reverseButtons: true,
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.close();
                            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            restartGame();
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'Respuestas Incorrectas',
                        text: 'Tienes respuestas erróneas. Revisa las líneas punteadas en rojo e intenta corregirlas.',
                        icon: 'warning',
                        confirmButtonText: 'Seguir Intentando',
                        confirmButtonColor: '#0077b6'
                    });
                }
            }
        }

        function handleTimeout() {
            state.isPlaying = false;
            state.attemptsUsed++;
            document.getElementById('attempts-val').innerText = state.attemptsUsed + ' / ' + config.attempts;

            if (state.attemptsUsed >= config.attempts) {
                Swal.fire({
                    title: '¡Tiempo Agotado!',
                    text: 'Se acabó el tiempo y has agotado todos tus intentos.',
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonText: 'Finalizar Juego',
                    cancelButtonText: 'Volver a Jugar',
                    confirmButtonColor: '#0077b6',
                    cancelButtonColor: '#0077b6',
                    reverseButtons: true,
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.close();
                        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        restartGame();
                    }
                });
            } else {
                Swal.fire({
                    title: '¡Tiempo Agotado!',
                    text: 'Se acabó el tiempo, pero tienes otra oportunidad.',
                    icon: 'warning',
                    confirmButtonText: 'Reintentar',
                    confirmButtonColor: '#0077b6'
                }).then(() => {
                    restartGame();
                });
            }
        }

        function restartGame() {
            state.connections = [];
            state.correctMatches = [];
            state.isValidated = false;
            state.selectedWordId = null;
            state.selectedPillId = null;
            state.timeLeft = config.timeLimit;
            state.attemptsUsed = 0;
            state.score = 0;
            document.getElementById('attempts-val').innerText = '0 / ' + config.attempts;
            document.getElementById('score').innerText = '0 pts';
            
            pills = pills.sort(() => Math.random() - 0.5);
            renderLists();
            updateLines();
            initTimer();
            state.isPlaying = true;
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
                cancelButtonText: 'Seguir Jugando'
            }).then((result) => {
                if (result.isConfirmed) {
                    clearInterval(state.timerInterval);
                    state.isPlaying = false;
                    window.close();
                    document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#1f2937;color:white;font-family:sans-serif;"><h1>Juego Finalizado</h1><p>Gracias por jugar. Ya puedes cerrar esta pestaña.</p></div>';
                }
            });
        }
    </script>
</body>
</html>`;
};

export default Stroop;
