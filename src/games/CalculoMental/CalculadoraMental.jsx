import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { GrLinkNext } from "react-icons/gr";
import { Player } from '@lottiefiles/react-lottie-player';
import { CheckCircle, ArrowLeft, Tag, Layers, FileText, Calendar, Monitor, Shapes, Puzzle, Download, Clock, List, Type } from 'lucide-react';

const exerciseData = [

    // ── BÁSICO (15 ejercicios) ──────────────────────────────────────────────────
    {
        "nivel": "basico",
        "operation": "3,+2,-1,+4,-2",
        "options": [
            { "text": "6", "isCorrect": true },
            { "text": "5", "isCorrect": false },
            { "text": "7", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "5,+3,-2,+1,-4",
        "options": [
            { "text": "3", "isCorrect": true },
            { "text": "2", "isCorrect": false },
            { "text": "4", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "7,-2,+5,-3,+1",
        "options": [
            { "text": "8", "isCorrect": true },
            { "text": "7", "isCorrect": false },
            { "text": "9", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "10,-4,+2,-1,+3",
        "options": [
            { "text": "10", "isCorrect": true },
            { "text": "9", "isCorrect": false },
            { "text": "11", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "6,+2,-3,+4,-1",
        "options": [
            { "text": "8", "isCorrect": true },
            { "text": "7", "isCorrect": false },
            { "text": "9", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "4,+5,-3,+2,-1",
        "options": [
            { "text": "7", "isCorrect": true },
            { "text": "6", "isCorrect": false },
            { "text": "8", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "9,-3,+4,-2,+1",
        "options": [
            { "text": "9", "isCorrect": true },
            { "text": "8", "isCorrect": false },
            { "text": "10", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "2,+6,-1,+3,-4",
        "options": [
            { "text": "6", "isCorrect": true },
            { "text": "5", "isCorrect": false },
            { "text": "7", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "8,-5,+3,-1,+4",
        "options": [
            { "text": "9", "isCorrect": true },
            { "text": "8", "isCorrect": false },
            { "text": "10", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "11,-3,+2,-4,+5",
        "options": [
            { "text": "11", "isCorrect": true },
            { "text": "10", "isCorrect": false },
            { "text": "12", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "1,+7,-2,+3,-5",
        "options": [
            { "text": "4", "isCorrect": true },
            { "text": "3", "isCorrect": false },
            { "text": "5", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "12,-5,+1,-2,+6",
        "options": [
            { "text": "12", "isCorrect": true },
            { "text": "11", "isCorrect": false },
            { "text": "13", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "5,-1,+4,-3,+2",
        "options": [
            { "text": "7", "isCorrect": true },
            { "text": "6", "isCorrect": false },
            { "text": "8", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "3,+8,-4,+1,-3",
        "options": [
            { "text": "5", "isCorrect": true },
            { "text": "4", "isCorrect": false },
            { "text": "6", "isCorrect": false }
        ]
    },
    {
        "nivel": "basico",
        "operation": "14,-6,+2,-3,+5",
        "options": [
            { "text": "12", "isCorrect": true },
            { "text": "11", "isCorrect": false },
            { "text": "13", "isCorrect": false }
        ]
    },

    // ── INTERMEDIO (15 ejercicios) ─────────────────────────────────────────────
    {
        "nivel": "intermedio",
        "operation": "20,÷2,+5,-3,+4,-2,+6,-1,+3,-4",
        "options": [
            { "text": "18", "isCorrect": true },
            { "text": "17", "isCorrect": false },
            { "text": "19", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "18,÷3,+7,-2,+5,-4,+6,-3,+2,-1",
        "options": [
            { "text": "16", "isCorrect": true },
            { "text": "15", "isCorrect": false },
            { "text": "17", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "30,÷5,+8,-3,+7,-2,+4,-1,+6,-5",
        "options": [
            { "text": "20", "isCorrect": true },
            { "text": "19", "isCorrect": false },
            { "text": "21", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "24,÷4,+6,-2,+5,-3,+7,-1,+2,-4",
        "options": [
            { "text": "16", "isCorrect": true },
            { "text": "15", "isCorrect": false },
            { "text": "17", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "15,÷3,+9,-4,+6,-2,+5,-3,+4,-1",
        "options": [
            { "text": "19", "isCorrect": true },
            { "text": "18", "isCorrect": false },
            { "text": "20", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "16,÷4,+8,-3,+5,-2,+6,-4,+3,-1",
        "options": [
            { "text": "16", "isCorrect": true },
            { "text": "15", "isCorrect": false },
            { "text": "17", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "40,÷8,+7,-1,+4,-3,+6,-2,+5,-3",
        "options": [
            { "text": "18", "isCorrect": true },
            { "text": "17", "isCorrect": false },
            { "text": "19", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "36,÷6,+4,-1,+8,-3,+2,-4,+5,-2",
        "options": [
            { "text": "15", "isCorrect": true },
            { "text": "14", "isCorrect": false },
            { "text": "16", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "28,÷4,+5,-2,+6,-1,+4,-3,+2,-4",
        "options": [
            { "text": "14", "isCorrect": true },
            { "text": "13", "isCorrect": false },
            { "text": "15", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "45,÷9,+6,-2,+7,-3,+4,-1,+5,-6",
        "options": [
            { "text": "15", "isCorrect": true },
            { "text": "14", "isCorrect": false },
            { "text": "16", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "50,÷5,+3,-1,+6,-4,+5,-2,+4,-3",
        "options": [
            { "text": "18", "isCorrect": true },
            { "text": "17", "isCorrect": false },
            { "text": "19", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "35,÷7,+9,-3,+4,-2,+6,-1,+3,-5",
        "options": [
            { "text": "16", "isCorrect": true },
            { "text": "15", "isCorrect": false },
            { "text": "17", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "12,÷2,+8,-4,+5,-1,+3,-2,+6,-4",
        "options": [
            { "text": "17", "isCorrect": true },
            { "text": "16", "isCorrect": false },
            { "text": "18", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "42,÷6,+5,-2,+8,-3,+4,-1,+2,-6",
        "options": [
            { "text": "14", "isCorrect": true },
            { "text": "13", "isCorrect": false },
            { "text": "15", "isCorrect": false }
        ]
    },
    {
        "nivel": "intermedio",
        "operation": "27,÷3,+6,-1,+5,-3,+7,-2,+4,-5",
        "options": [
            { "text": "20", "isCorrect": true },
            { "text": "19", "isCorrect": false },
            { "text": "21", "isCorrect": false }
        ]
    },

    // ── AVANZADO (15 ejercicios) ───────────────────────────────────────────────
    {
        "nivel": "avanzado",
        "operation": "8,×2,+5,-3,÷2,+4,×3,-2,+6,÷2,+7,-5,×2,+1,-4",
        "options": [
            { "text": "44", "isCorrect": true },
            { "text": "42", "isCorrect": false },
            { "text": "46", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "12,×3,-6,÷2,+8,×2,-4,+7,÷2,+5,-3,×2,+6,-2,+4",
        "options": [
            { "text": "61", "isCorrect": true },
            { "text": "59", "isCorrect": false },
            { "text": "63", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "10,×2,+6,-4,÷2,+8,×3,-5,+7,÷2,+9,-6,×2,+3,-7",
        "options": [
            { "text": "61", "isCorrect": true },
            { "text": "59", "isCorrect": false },
            { "text": "63", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "15,×2,-5,÷5,+10,×3,-6,+8,÷2,+7,-4,×2,+5,-3,+6",
        "options": [
            { "text": "61", "isCorrect": true },
            { "text": "59", "isCorrect": false },
            { "text": "63", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "20,×2,+8,-6,÷2,+9,×3,-7,+5,÷2,+6,-2,×2,+4,-8",
        "options": [
            { "text": "92", "isCorrect": true },
            { "text": "90", "isCorrect": false },
            { "text": "94", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "6,×4,-8,÷2,+7,×3,-5,+6,÷2,+9,-4,×2,-6,+3,-2",
        "options": [
            { "text": "51", "isCorrect": true },
            { "text": "49", "isCorrect": false },
            { "text": "53", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "5,×3,+9,-4,÷4,+8,×4,-7,+3,÷6,+11,-2,×3,-1,+6,-4",
        "options": [
            { "text": "52", "isCorrect": true },
            { "text": "50", "isCorrect": false },
            { "text": "54", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "9,×2,+6,-4,÷5,+8,×5,-10,+4,÷6,+7,-3,×4,+2,-5,+1",
        "options": [
            { "text": "50", "isCorrect": true },
            { "text": "48", "isCorrect": false },
            { "text": "52", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "3,×6,+2,-5,÷3,+9,×4,-6,+4,÷9,+8,-1,×5,-5,+3,-7",
        "options": [
            { "text": "56", "isCorrect": true },
            { "text": "54", "isCorrect": false },
            { "text": "58", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "7,×3,-1,÷4,+6,×6,-6,+5,÷5,+7,-2,×3,-4,+6,-3,+1",
        "options": [
            { "text": "54", "isCorrect": true },
            { "text": "52", "isCorrect": false },
            { "text": "56", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "4,×5,+8,-8,÷4,+9,×4,-6,+2,÷4,+7,-3,×3,+4,-7,+2",
        "options": [
            { "text": "50", "isCorrect": true },
            { "text": "48", "isCorrect": false },
            { "text": "52", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "11,×2,+8,-5,÷5,+7,×5,-8,+3,÷5,+9,-2,×4,-12,+5,-5",
        "options": [
            { "text": "60", "isCorrect": true },
            { "text": "58", "isCorrect": false },
            { "text": "62", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "2,×9,+6,-4,÷5,+8,×3,-6,+9,÷3,+8,-5,×4,-4,+3,-9",
        "options": [
            { "text": "54", "isCorrect": true },
            { "text": "52", "isCorrect": false },
            { "text": "56", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "6,×3,+2,-5,÷3,+5,×7,-10,+3,÷7,+8,-4,×5,-5,+4,-6",
        "options": [
            { "text": "58", "isCorrect": true },
            { "text": "56", "isCorrect": false },
            { "text": "60", "isCorrect": false }
        ]
    },
    {
        "nivel": "avanzado",
        "operation": "10,×3,-5,÷5,+7,×6,-12,+5,÷5,+9,-4,×3,-4,+8,-5,+2",
        "options": [
            { "text": "55", "isCorrect": true },
            { "text": "53", "isCorrect": false },
            { "text": "57", "isCorrect": false }
        ]
    }
];

const STORAGE_NS = "cm";
const lsKey = (k) => `${STORAGE_NS}:${k}`;

const LS_KEYS = {
    arSelectedStages: lsKey("ar_selected_stages"),
    arConfig: lsKey("ar_config"),
    gameConfig: lsKey("game_config"),
};

const AR_STAGES = ["Inicio", "Acierto", "Final"];
const AR_TYPES = ["Texto", "Texto3D", "Imagen", "Audio", "Video"];

const DEFAULT_AR_STAGES = { Inicio: false, Acierto: false, Final: false };

const loadJSON = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const escapeHtml = (s = "") =>
    String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");


const IconArrowBack = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M249.38 256L370.06 135.32a16.79 16.79 0 10-23.74-23.74L213.78 244.14a16.8 16.8 0 000 23.74l132.54 132.54a16.79 16.79 0 0023.74-23.74z"></path>
    </svg>
);
const IconConfigure = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"></path>
    </svg>
);
// --- COMPONENTE SUMMARY ---
// ✅ REEMPLAZA TODO EL COMPONENTE SummaryPanel
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
    .btn-success { background: #005f92; }
    .btn-success:hover:not(:disabled) { background: #004a73; }
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
// --- ANDROID: CONFIGURACIÓN Y GENERACIÓN DE APPLICATION ID ÚNICO ---
const ANDROID_BUILD_GRADLE_PATH = "android/app/build.gradle";
const CAPACITOR_CONFIG_PATH = "android/app/src/main/assets/capacitor.config.json";
const ANDROID_STRINGS_PATH = "android/app/src/main/res/values/strings.xml";
const CALCULOMENTAL_APPLICATION_ID_BASE = "io.calculomental.steam";

const createUuidSegment = () => {
    const rawUuid = window.crypto?.randomUUID?.()
        || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    return `uuid_${uuid}`;
};

const buildCalculoMentalApplicationId = () => {
    return `${CALCULOMENTAL_APPLICATION_ID_BASE}.${createUuidSegment()}`;
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

const applyCalculoMentalAndroidMetadata = async (zip, { applicationId }) => {
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
const SummaryPanel = ({ config, arEnabled, arSelectedStages, arConfig, onBack }) => {
    const { state } = useLocation();
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const [jsZipReady, setJsZipReady] = useState(false);

    useEffect(() => {
        if (window.JSZip) { setJsZipReady(true); return; }
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.async = true;
        script.onload = () => setJsZipReady(true);
        script.onerror = () => setStatusText("Error cargando librería ZIP");
        document.body.appendChild(script);
        return () => { if (document.body.contains(script)) document.body.removeChild(script); };
    }, []);

    const handleDownloadZip = () => {
        if (isGenerating || !jsZipReady) return;
        setIsGenerating(true);
        setProgress(0);
        setStatusText("Iniciando...");
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
                setStatusText("Inyectando recursos en Android...");
                generateAndDownloadAndroidZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Descargando plantilla Android...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando configuraciones...");
                setProgress(currentProgress);
            }
        }, 200);
    };

    // ============================================================
    // REEMPLAZAR en SummaryPanel (CalculadoraMental.jsx)
    // La función generateAndDownloadZip existente y agregar
    // generateGameHTML ANTES de generateAndDownloadZip
    // ============================================================

    const generateGameHTML = (config, gameDetails, selectedPlatforms, arEnabled, arSelectedStages, arConfig) => {
        // Tomar la fecha persistida del localStorage del cliente; si no existe, usar la del gameDetails
        const rawDate = (() => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
        })();
        const formattedDate = (() => {
            try {
                return new Date(rawDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            } catch { return 'Fecha no especificada'; }
        })();

        const platformsString = selectedPlatforms?.length > 0
            ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
            : 'Web';

        const escHtml = (s = "") =>
            String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

        const exercises = [
            // ── BÁSICO (15 ejercicios) ──────────────────────────────────────────────────
            {
                "nivel": "basico",
                "operation": "3,+2,-1,+4,-2",
                "options": [
                    { "text": "6", "isCorrect": true },
                    { "text": "5", "isCorrect": false },
                    { "text": "7", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "5,+3,-2,+1,-4",
                "options": [
                    { "text": "3", "isCorrect": true },
                    { "text": "2", "isCorrect": false },
                    { "text": "4", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "7,-2,+5,-3,+1",
                "options": [
                    { "text": "8", "isCorrect": true },
                    { "text": "7", "isCorrect": false },
                    { "text": "9", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "10,-4,+2,-1,+3",
                "options": [
                    { "text": "10", "isCorrect": true },
                    { "text": "9", "isCorrect": false },
                    { "text": "11", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "6,+2,-3,+4,-1",
                "options": [
                    { "text": "8", "isCorrect": true },
                    { "text": "7", "isCorrect": false },
                    { "text": "9", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "4,+5,-3,+2,-1",
                "options": [
                    { "text": "7", "isCorrect": true },
                    { "text": "6", "isCorrect": false },
                    { "text": "8", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "9,-3,+4,-2,+1",
                "options": [
                    { "text": "9", "isCorrect": true },
                    { "text": "8", "isCorrect": false },
                    { "text": "10", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "2,+6,-1,+3,-4",
                "options": [
                    { "text": "6", "isCorrect": true },
                    { "text": "5", "isCorrect": false },
                    { "text": "7", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "8,-5,+3,-1,+4",
                "options": [
                    { "text": "9", "isCorrect": true },
                    { "text": "8", "isCorrect": false },
                    { "text": "10", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "11,-3,+2,-4,+5",
                "options": [
                    { "text": "11", "isCorrect": true },
                    { "text": "10", "isCorrect": false },
                    { "text": "12", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "1,+7,-2,+3,-5",
                "options": [
                    { "text": "4", "isCorrect": true },
                    { "text": "3", "isCorrect": false },
                    { "text": "5", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "12,-5,+1,-2,+6",
                "options": [
                    { "text": "12", "isCorrect": true },
                    { "text": "11", "isCorrect": false },
                    { "text": "13", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "5,-1,+4,-3,+2",
                "options": [
                    { "text": "7", "isCorrect": true },
                    { "text": "6", "isCorrect": false },
                    { "text": "8", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "3,+8,-4,+1,-3",
                "options": [
                    { "text": "5", "isCorrect": true },
                    { "text": "4", "isCorrect": false },
                    { "text": "6", "isCorrect": false }
                ]
            },
            {
                "nivel": "basico",
                "operation": "14,-6,+2,-3,+5",
                "options": [
                    { "text": "12", "isCorrect": true },
                    { "text": "11", "isCorrect": false },
                    { "text": "13", "isCorrect": false }
                ]
            },

            // ── INTERMEDIO (15 ejercicios) ─────────────────────────────────────────────
            {
                "nivel": "intermedio",
                "operation": "20,÷2,+5,-3,+4,-2,+6,-1,+3,-4",
                "options": [
                    { "text": "18", "isCorrect": true },
                    { "text": "17", "isCorrect": false },
                    { "text": "19", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "18,÷3,+7,-2,+5,-4,+6,-3,+2,-1",
                "options": [
                    { "text": "16", "isCorrect": true },
                    { "text": "15", "isCorrect": false },
                    { "text": "17", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "30,÷5,+8,-3,+7,-2,+4,-1,+6,-5",
                "options": [
                    { "text": "20", "isCorrect": true },
                    { "text": "19", "isCorrect": false },
                    { "text": "21", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "24,÷4,+6,-2,+5,-3,+7,-1,+2,-4",
                "options": [
                    { "text": "16", "isCorrect": true },
                    { "text": "15", "isCorrect": false },
                    { "text": "17", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "15,÷3,+9,-4,+6,-2,+5,-3,+4,-1",
                "options": [
                    { "text": "19", "isCorrect": true },
                    { "text": "18", "isCorrect": false },
                    { "text": "20", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "16,÷4,+8,-3,+5,-2,+6,-4,+3,-1",
                "options": [
                    { "text": "16", "isCorrect": true },
                    { "text": "15", "isCorrect": false },
                    { "text": "17", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "40,÷8,+7,-1,+4,-3,+6,-2,+5,-3",
                "options": [
                    { "text": "18", "isCorrect": true },
                    { "text": "17", "isCorrect": false },
                    { "text": "19", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "36,÷6,+4,-1,+8,-3,+2,-4,+5,-2",
                "options": [
                    { "text": "15", "isCorrect": true },
                    { "text": "14", "isCorrect": false },
                    { "text": "16", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "28,÷4,+5,-2,+6,-1,+4,-3,+2,-4",
                "options": [
                    { "text": "14", "isCorrect": true },
                    { "text": "13", "isCorrect": false },
                    { "text": "15", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "45,÷9,+6,-2,+7,-3,+4,-1,+5,-6",
                "options": [
                    { "text": "15", "isCorrect": true },
                    { "text": "14", "isCorrect": false },
                    { "text": "16", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "50,÷5,+3,-1,+6,-4,+5,-2,+4,-3",
                "options": [
                    { "text": "18", "isCorrect": true },
                    { "text": "17", "isCorrect": false },
                    { "text": "19", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "35,÷7,+9,-3,+4,-2,+6,-1,+3,-5",
                "options": [
                    { "text": "16", "isCorrect": true },
                    { "text": "15", "isCorrect": false },
                    { "text": "17", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "12,÷2,+8,-4,+5,-1,+3,-2,+6,-4",
                "options": [
                    { "text": "17", "isCorrect": true },
                    { "text": "16", "isCorrect": false },
                    { "text": "18", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "42,÷6,+5,-2,+8,-3,+4,-1,+2,-6",
                "options": [
                    { "text": "14", "isCorrect": true },
                    { "text": "13", "isCorrect": false },
                    { "text": "15", "isCorrect": false }
                ]
            },
            {
                "nivel": "intermedio",
                "operation": "27,÷3,+6,-1,+5,-3,+7,-2,+4,-5",
                "options": [
                    { "text": "20", "isCorrect": true },
                    { "text": "19", "isCorrect": false },
                    { "text": "21", "isCorrect": false }
                ]
            },

            // ── AVANZADO (15 ejercicios) ───────────────────────────────────────────────
            {
                "nivel": "avanzado",
                "operation": "8,×2,+5,-3,÷2,+4,×3,-2,+6,÷2,+7,-5,×2,+1,-4",
                "options": [
                    { "text": "44", "isCorrect": true },
                    { "text": "42", "isCorrect": false },
                    { "text": "46", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "12,×3,-6,÷2,+8,×2,-4,+7,÷2,+5,-3,×2,+6,-2,+4",
                "options": [
                    { "text": "61", "isCorrect": true },
                    { "text": "59", "isCorrect": false },
                    { "text": "63", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "10,×2,+6,-4,÷2,+8,×3,-5,+7,÷2,+9,-6,×2,+3,-7",
                "options": [
                    { "text": "61", "isCorrect": true },
                    { "text": "59", "isCorrect": false },
                    { "text": "63", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "15,×2,-5,÷5,+10,×3,-6,+8,÷2,+7,-4,×2,+5,-3,+6",
                "options": [
                    { "text": "61", "isCorrect": true },
                    { "text": "59", "isCorrect": false },
                    { "text": "63", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "20,×2,+8,-6,÷2,+9,×3,-7,+5,÷2,+6,-2,×2,+4,-8",
                "options": [
                    { "text": "92", "isCorrect": true },
                    { "text": "90", "isCorrect": false },
                    { "text": "94", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "6,×4,-8,÷2,+7,×3,-5,+6,÷2,+9,-4,×2,-6,+3,-2",
                "options": [
                    { "text": "51", "isCorrect": true },
                    { "text": "49", "isCorrect": false },
                    { "text": "53", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "5,×3,+9,-4,÷4,+8,×4,-7,+3,÷6,+11,-2,×3,-1,+6,-4",
                "options": [
                    { "text": "52", "isCorrect": true },
                    { "text": "50", "isCorrect": false },
                    { "text": "54", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "9,×2,+6,-4,÷5,+8,×5,-10,+4,÷6,+7,-3,×4,+2,-5,+1",
                "options": [
                    { "text": "50", "isCorrect": true },
                    { "text": "48", "isCorrect": false },
                    { "text": "52", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "3,×6,+2,-5,÷3,+9,×4,-6,+4,÷9,+8,-1,×5,-5,+3,-7",
                "options": [
                    { "text": "56", "isCorrect": true },
                    { "text": "54", "isCorrect": false },
                    { "text": "58", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "7,×3,-1,÷4,+6,×6,-6,+5,÷5,+7,-2,×3,-4,+6,-3,+1",
                "options": [
                    { "text": "54", "isCorrect": true },
                    { "text": "52", "isCorrect": false },
                    { "text": "56", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "4,×5,+8,-8,÷4,+9,×4,-6,+2,÷4,+7,-3,×3,+4,-7,+2",
                "options": [
                    { "text": "50", "isCorrect": true },
                    { "text": "48", "isCorrect": false },
                    { "text": "52", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "11,×2,+8,-5,÷5,+7,×5,-8,+3,÷5,+9,-2,×4,-12,+5,-5",
                "options": [
                    { "text": "60", "isCorrect": true },
                    { "text": "58", "isCorrect": false },
                    { "text": "62", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "2,×9,+6,-4,÷5,+8,×3,-6,+9,÷3,+8,-5,×4,-4,+3,-9",
                "options": [
                    { "text": "54", "isCorrect": true },
                    { "text": "52", "isCorrect": false },
                    { "text": "56", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "6,×3,+2,-5,÷3,+5,×7,-10,+3,÷7,+8,-4,×5,-5,+4,-6",
                "options": [
                    { "text": "58", "isCorrect": true },
                    { "text": "56", "isCorrect": false },
                    { "text": "60", "isCorrect": false }
                ]
            },
            {
                "nivel": "avanzado",
                "operation": "10,×3,-5,÷5,+7,×6,-12,+5,÷5,+9,-4,×3,-4,+8,-5,+2",
                "options": [
                    { "text": "55", "isCorrect": true },
                    { "text": "53", "isCorrect": false },
                    { "text": "57", "isCorrect": false }
                ]
            }

        ];

        const filtered = exercises.filter(e => e.nivel === config.level).slice(0, config.exerciseCount);
        const exercisesJSON = JSON.stringify(filtered);

        // Normalizar config de etapa RA
        const normalizeStageCfg = (cfg = {}) => {
            // Respetar el type explícito guardado por el usuario
            // Solo inferir si no existe
            const type = cfg.type?.trim()
                || (cfg.text?.trim() ? 'Texto'
                    : cfg.imageUrl?.trim() ? 'Imagen'
                        : cfg.audioUrl?.trim() ? 'Audio'
                            : cfg.videoUrl?.trim() ? 'Video' : null);
            return {
                type,
                text: cfg.text ?? '',
                imageUrl: cfg.imageUrl ?? '',
                audioUrl: cfg.audioUrl ?? '',
                videoUrl: cfg.videoUrl ?? '',
            };
        };

        // Generar datos RA serializados para el JS del HTML
        const buildStageData = (stage) => {
            if (!arEnabled || !arSelectedStages?.[stage]) return 'null';
            const cfg = arConfig?.[stage] ?? {};
            const text = cfg.text?.trim() || '';
            const imageUrl = cfg.imageUrl?.trim() || '';
            const audioUrl = cfg.audioUrl?.trim() || '';
            const videoUrl = cfg.videoUrl?.trim() || '';
            if (!text && !imageUrl && !audioUrl && !videoUrl) return 'null';
            // Guardar TODOS los contenidos presentes, sin "type" único
            return JSON.stringify({
                text,
                imageUrl,
                audioUrl,
                videoUrl,
            });
        };
        const arInicioData = buildStageData('Inicio');
        const arAciertoData = buildStageData('Acierto');
        const arFinalData = buildStageData('Final');

        const hasArInicio = arInicioData !== 'null';
        const hasArAcierto = arAciertoData !== 'null';
        const hasArFinal = arFinalData !== 'null';

        const gameName = gameDetails?.gameName || 'Cálculo Mental';
        const levelLabel = config.level.charAt(0).toUpperCase() + config.level.slice(1);

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escHtml(gameName)} - ${escHtml(levelLabel)}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito', 'Segoe UI', sans-serif; background: #f0f2f5; min-height: 100vh; }

        /* ---- Overlays (igual que Acertijo) ---- */
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; transition: opacity 0.3s; padding: 20px; box-sizing: border-box; }
        .hidden { display: none !important; opacity: 0; pointer-events: none; }

        /* ---- Game title wave (igual que Acertijo) ---- */
        .game-title { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        .game-title.static span { animation: none; transform: none; }
        @keyframes wave-animation { 0%,40%,100%{transform:translateY(0)} 20%{transform:translateY(-20px)} }

        /* ---- Buttons (igual que Acertijo) ---- */
        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; min-width: 200px; }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .btn-exit { background: #1f2937; }
        .btn-retry { background: var(--primary-color); }
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }

        /* ---- Countdown ---- */
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0%{transform:scale(0);opacity:0} 80%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        
        /* ---- Game UI ---- */
        .container { background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); padding: 2rem; width: 100%; max-width: 950px; margin: 20px auto; box-sizing: border-box; display: flex; flex-direction: column; }
        .game-layout { display: grid; grid-template-columns: 1fr 250px; gap: 2rem; width: 100%; }
        @media(max-width:768px){ .game-layout { grid-template-columns: 1fr; } }
        .game-left-col { display: flex; flex-direction: column; gap: 1rem; }
        .game-right-col { display: flex; flex-direction: column; gap: 1rem; }
        .stats-block { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; height: fit-content; background: white; }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); }
        .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }
        .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; color: white; transition: background 0.2s; font-size: 1rem; }
        .btn-primary { background: var(--primary-color); }
        .btn-primary:hover { background: #005f92; }

        .question-card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center; min-height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; border: 1px solid var(--medium-gray); margin-bottom: 1rem; }
        .question-prompt { font-family: 'Merriweather', serif; font-size: 1.5rem; color: var(--secondary-color); line-height: 1.5; margin-bottom: 1rem; font-weight: 700; }
        /* ---- Operation tokens ---- */
        .operation-wrapper { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin: 1rem 0; min-height: 3rem; }
        .op-token { padding: 0.5rem 0.9rem; border-radius: 0.5rem; font-size: 1.4rem; font-weight: 700; background: #f1f5f9; border: 2px solid var(--medium-gray); transition: all 0.35s; font-family: 'Merriweather', serif; }
        .op-token.shown { background: #e0f2fe; border-color: var(--primary-color); color: var(--primary-color); }

        /* ---- Options ---- */
        .answers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .answer-btn { background: white; border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center; justify-content: center; min-height: 80px; color: var(--dark-text); box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-family: 'Nunito', sans-serif; font-size: 1.2rem; font-weight: 700; }
        .answer-btn:hover:not(:disabled) { transform: translateY(-2px); border-color: var(--primary-color); box-shadow: 0 4px 6px rgba(0,0,0,0.1); background: #f8fafc; }
        .answer-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .answer-btn.correct { border-color: var(--correct) !important; background: #dcfce7 !important; color: #15803d !important; }
        .answer-btn.wrong   { border-color: var(--wrong)   !important; background: #fee2e2 !important; color: #b91c1c !important; }

        /* ---- Stats ---- */
        .stats-block { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; height: fit-content; background: white; }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); }
        .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }

        /* ---- Progress bar ---- */
        .progress-bar-wrap { width: 100%; height: 8px; background: var(--medium-gray); border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem; }
        .progress-bar-fill { height: 100%; background: var(--primary-color); border-radius: 4px; transition: width 0.4s ease; }

        /* ---- Info modal (igual que Acertijo) ---- */
        .info-modal-content { background: white; padding: 2.5rem; border-radius: 1rem; max-width: 600px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; position: relative; }
        .info-header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .info-title { font-size: 1.8rem; color: var(--primary-color); margin: 0; font-weight: 800; }
        .info-subtitle { color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; }
        .info-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
        .info-item { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .info-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem; font-weight: 600; }
        .info-value { font-size: 1.1rem; color: #334155; font-weight: 500; }
        .close-info-btn { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
        @media(max-width:768px){ .info-details-grid { grid-template-columns: 1fr; } }

        /* ---- End screen ---- */
        .end-buttons { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-top: 1rem; }

        /* ---- AR Panel (fondo oscuro con efecto) ---- */
       /* ---- AR Overlay ---- */
        .ar-overlay-screen {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(10,15,40,0.92); backdrop-filter: blur(6px);
            z-index: 50; overflow-y: auto; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 1.5rem; padding: 2rem; box-sizing: border-box;
        }
        .ar-overlay-screen.active { display: flex; }

        /* Tarjeta contenedora */
        .ar-card {
            width: 100%; max-width: 860px;
            background: linear-gradient(145deg, #03045e 0%, #023e8a 50%, #0077b6 100%);
            border-radius: 1.5rem;
            box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(144,224,239,0.15);
            overflow: visible; position: relative;
        }

        /* Fondo de símbolos flotantes */
       .cm-ar-bg {
                    position: relative;
                    min-height: 420px;
                    width: 100%;
                    background: linear-gradient(135deg, #0077b6 0%, #023e8a 100%);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.2rem;
                    padding: 1.5rem 1rem;
                    border-radius: 28px;
                }
        /* Contenido interior */
        .cm-ar-content {
            position: relative; z-index: 2; width: 100%; padding: 2rem 2rem 1.5rem;
            display: flex; flex-direction: column; align-items: center; gap: 1.25rem;
            box-sizing: border-box;
        }
        .ar-badge-html {
            display: inline-flex; align-items: center; gap: 0.4rem;
            background: rgba(144,224,239,0.15); border: 1px solid rgba(144,224,239,0.5);
            color: #90e0ef; padding: 0.35rem 1rem; border-radius: 999px;
            font-size: 0.8rem; font-weight: 700; letter-spacing: 0.04em;
            font-family: 'Nunito', sans-serif; backdrop-filter: blur(4px);
        }
        .ar-stage-title {
            color: #ffffff; font-size: 1.4rem; font-weight: 800;
            font-family: 'Nunito', sans-serif; text-align: center;
            text-shadow: 0 2px 12px rgba(0,150,255,0.4);
        }
        /* Grid 2 columnas — todos los tipos de contenido iguales */
        .ar-multi-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            width: 100%;
        }
        /* Si solo hay 1 elemento, ocupa todo el ancho */
        .ar-multi-grid > *:only-child { grid-column: 1 / -1; }
        /* Si hay cantidad impar, el último ocupa todo el ancho */
        .ar-multi-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }

        /* Todos los contenedores Three.js idénticos — sin distinción video */
        .ar-three-container,
        .ar-three-container--video {
            width: 100%; height: 260px;
            background: transparent;
            overflow: visible;
            box-shadow: none;
        }
        .ar-three-container canvas,
        .ar-three-container--video canvas {
            width: 100% !important;
            height: 100% !important;
            border-radius: 0.5rem;
            display: block;
            background: transparent !important;
        }
        .ar-audio-solo { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .ar-audio-icon { font-size: 3rem; }
        .ar-audio-player { width: 100%; border-radius: 8px; }
        .ar-fallback-text {
            color: #caf0f8; font-size: 1.05rem; white-space: pre-wrap; text-align: center;
            font-family: 'Nunito', sans-serif; padding: 1rem;
            background: rgba(255,255,255,0.08); border-radius: 0.5rem; width: 100%;
            box-sizing: border-box;
        }
        .ar-fallback-img { max-width: 100%; max-height: 180px; border-radius: 0.5rem; display: block; margin: 0 auto; }
        .ar-fallback-video { width: 100%; border-radius: 0.5rem; display: block; }

        /* Botón continuar debajo de la card */
        .ar-continue-btn {
            margin-top: 0.5rem;
        }
    </style>
</head>
<body>

<!-- ===== PANTALLA INICIO ===== -->
<div id="start-screen" class="overlay">
    <div class="game-title static">
            <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">Cálculo Mental</h2>

    </div>
<div style="background:#e0f2fe;color:#0369a1;padding:0.5rem 1rem;border-radius:20px;font-weight:600;margin-bottom:2rem;display:inline-block;font-family:'Nunito',sans-serif;font-size:1rem;letter-spacing:0.01em;">
        Nivel: ${escHtml(levelLabel)} &nbsp;
    </div>
    <div style="display:flex;flex-direction:column;gap:1rem;align-items:center;">
        <button class="big-btn" onclick="startGameSequence()">▶ Iniciar Juego</button>
        <button class="big-btn btn-info" onclick="toggleInfo(true)">ℹ Información</button>
    </div>
</div>

<!-- ===== PANTALLA COUNTDOWN ===== -->
<div id="countdown-screen" class="overlay hidden">
    <div id="countdown-display" class="countdown-number">5</div>
</div>

<!-- ===== MODAL INFORMACIÓN ===== -->
<div id="info-overlay" class="overlay hidden" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(2px);z-index:100;">
    <div class="info-modal-content">
        <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
        <div class="info-header">
            <h2 class="info-title">${escHtml(gameName)}</h2>
            <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
        </div>
      <div class="info-details-grid">
    <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${escHtml(gameDetails?.authorName || 'No especificado')}</span></div>
    <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${escHtml(gameDetails?.version || '1.0.0')}</span></div>
    <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
            <div class="info-item" style="grid-column:1/-1"><span class="info-label">Descripción</span><span class="info-value" style="font-size:1rem;line-height:1.6;color:#475569;">${escHtml(gameDetails?.description || 'Sin descripción.')}</span></div>
            <div class="info-item"><span class="info-label">Nivel</span><span class="info-value">${escHtml(levelLabel)}</span></div>
            <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${escHtml(platformsString)}</span></div>
        </div>
        <div style="text-align:center;">
            <button class="big-btn" onclick="toggleInfo(false)">Cerrar</button>
        </div>
    </div>
</div>

<!-- ===== AR: INICIO ===== -->
${hasArInicio ? `
<div id="ar-screen-inicio" class="ar-overlay-screen">
    <div class="ar-card">
        <div class="cm-ar-bg" id="ar-bg-inicio">
            <div id="ar-bg-elements-inicio" class="cm-ar-bg-elements"></div>
            <div class="cm-ar-content">
                <span class="ar-badge-html">🥽 Realidad Aumentada — Inicio</span>
                <div class="ar-stage-title">¡Bienvenido al juego!</div>
                <div class="ar-multi-grid" id="ar-multi-inicio">
                    <div id="ar-text-inicio"  class="ar-three-container" style="display:none;"></div>
                    <div id="ar-image-inicio" class="ar-three-container" style="display:none;"></div>
                    <div id="ar-video-inicio" class="ar-three-container ar-three-container--video" style="display:none;"></div>
                </div>
                <audio id="ar-audio-inicio" style="display:none;" autoplay></audio>
            </div>
        </div>
    </div>
    <button class="big-btn ar-continue-btn" onclick="afterARInicio()">Continuar →</button>
</div>` : ''}

<!-- ===== AR: ACIERTO ===== -->
${hasArAcierto ? `
<div id="ar-screen-acierto" class="ar-overlay-screen">
    <div class="ar-card">
        <div class="cm-ar-bg" id="ar-bg-acierto">
            <div id="ar-bg-elements-acierto" class="cm-ar-bg-elements"></div>
            <div class="cm-ar-content">
                <span class="ar-badge-html">🥽 Realidad Aumentada — Acierto</span>
                <div class="ar-stage-title">¡Respuesta Correcta!</div>
                <div class="ar-multi-grid" id="ar-multi-acierto">
                    <div id="ar-text-acierto"  class="ar-three-container" style="display:none;"></div>
                    <div id="ar-image-acierto" class="ar-three-container" style="display:none;"></div>
                    <div id="ar-video-acierto" class="ar-three-container ar-three-container--video" style="display:none;"></div>
                </div>
                <audio id="ar-audio-acierto" style="display:none;" autoplay></audio>
            </div>
        </div>
    </div>
    <button class="big-btn ar-continue-btn" onclick="afterARAcierto()">Continuar →</button>
</div>` : ''}

<!-- ===== AR: FINAL ===== -->
${hasArFinal ? `
<div id="ar-screen-final" class="ar-overlay-screen">
    <div class="ar-card">
        <div class="cm-ar-bg" id="ar-bg-final">
            <div id="ar-bg-elements-final" class="cm-ar-bg-elements"></div>
            <div class="cm-ar-content">
                <span class="ar-badge-html">🥽 Realidad Aumentada — Final</span>
                <div class="ar-stage-title">¡Juego Completado!</div>
                <div class="ar-multi-grid" id="ar-multi-final">
                    <div id="ar-text-final"  class="ar-three-container" style="display:none;"></div>
                    <div id="ar-image-final" class="ar-three-container" style="display:none;"></div>
                    <div id="ar-video-final" class="ar-three-container ar-three-container--video" style="display:none;"></div>
                </div>
                <audio id="ar-audio-final" style="display:none;" autoplay></audio>
            </div>
        </div>
    </div>
    <button class="big-btn ar-continue-btn" onclick="afterARFinal()">Ver Resultados →</button>
</div>` : ''}

<!-- ===== GAME UI ===== -->
<div class="container" id="game-ui" style="display:none;">
    ${`<div class="game-title">
        ${'Juego de Cálculo Mental'.split('').map((ch, i) =>
            `<span style="animation-delay:${i * 0.07}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
        ).join('')}
    </div>`}
    <div style="display:grid;grid-template-columns:1fr;max-width:600px;margin:0 auto 1.5rem auto;background:#eff6ff;border:1px solid #bfdbfe;border-radius:0.75rem;padding:0.85rem 1.25rem;text-align:center;">
        <span style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#64748b;margin-bottom:0.25rem;display:block;">📋 Reglas Básicas</span>
        <span style="font-size:1rem;color:#1e40af;font-weight:500;">Realiza el cálculo mentalmente de la operación matemática y elige la respuesta correcta.</span>
    </div>
    <div class="game-layout">
        <div class="game-left-col">
            <div class="progress-bar-wrap"><div class="progress-bar-fill" id="progress-bar" style="width:0%"></div></div>
            <div class="question-card">
                <div class="question-prompt" id="question-prompt">Memoriza los números...</div>
                <div class="operation-wrapper" id="operation-display"></div>
            </div>
            <div class="answers-grid" id="answers-container" style="display:none;"></div>
        </div>
        <div class="game-right-col">
            <div class="stats-block">
                <h3>Progreso</h3>
                <div class="stats-item"><span>Ejercicio:</span> <strong id="progress-text">1/${config.exerciseCount}</strong></div>
                <div class="stats-item"><span>Puntaje:</span> <strong id="score">0</strong></div>
                <div class="stats-item"><span>Nivel:</span> <strong>${escHtml(levelLabel)}</strong></div>
            </div>
            <button class="btn btn-primary" style="margin-top:1rem;" onclick="finishGame(false)">Finalizar Juego</button>
        </div>
    </div>
</div>
<!-- ===== END SCREEN ===== -->
<div id="end-screen" class="overlay hidden">
    <h1 id="end-title" style="color:var(--primary-color); font-size:3rem; font-weight:800; margin-bottom:0.5rem; text-align:center; font-family:'Nunito',sans-serif;">Fin del Juego</h1>
    <h2 style="color:var(--secondary-color); font-size:2rem; margin:1rem 0; font-family:'Nunito',sans-serif;">Puntos Obtenidos: <span id="final-score">0</span></h2>
    <div class="end-buttons">
        <button class="big-btn btn-exit" onclick="exitGame()">Salir</button>
        <button class="big-btn btn-retry" onclick="restartGame()">Volver a Jugar</button>
    </div>
</div>

<script>
// ===== DATOS =====
const EXERCISES = ${exercisesJSON};
const GAME_NAME = "${escHtml(gameName)}";
const HAS_AR_INICIO  = ${hasArInicio};
const HAS_AR_ACIERTO = ${hasArAcierto};
const HAS_AR_FINAL   = ${hasArFinal};
const AR_DATA = {
    Inicio:  ${arInicioData},
    Acierto: ${arAciertoData},
    Final:   ${arFinalData}
};
const CM_MATH_SYMBOLS = ['×','+','÷','-','=','1','2','3'];
const LEVEL_CONFIG = {
    basico:     { tokenSpeed: 1200, answerTime: 20  },
    intermedio: { tokenSpeed: 800,  answerTime: 15 },
    avanzado:   { tokenSpeed: 450,  answerTime: 10 },
};
const CURRENT_LEVEL_CFG = LEVEL_CONFIG['${config.level}'] || LEVEL_CONFIG.basico;

// ===== ESTADO =====
let gameExercises = [];
let currentIdx = 0;
let score = 0;
let pendingNextCallback = null;
let arCleanups = {};

// ===== UTILIDADES =====
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function setActiveScreen(id) {
    ['start-screen','countdown-screen','game-ui','end-screen',
     'ar-screen-inicio','ar-screen-acierto','ar-screen-final'].forEach(sid => {
        const el = document.getElementById(sid);
        if (!el) return;
        if (sid === 'game-ui') {
            el.style.display = (sid === id) ? 'block' : 'none';
        } else if (el.classList.contains('ar-overlay-screen')) {
            el.classList.toggle('active', sid === id);
            // Asegurarse de que display sea correcto cuando active cambia
            el.style.display = (sid === id) ? 'flex' : 'none';
        } else {
            el.classList.toggle('hidden', sid !== id);
            if (sid !== id) el.style.display = 'none';
            else el.style.display = '';
        }
    });
}
function buildAnimatedTitle(containerId, text, animate) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = text.split('').map((ch, i) =>
        '<span style="animation-delay:' + (i * 0.07) + 's">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>'
    ).join('');
    if (!animate) el.classList.add('static');
}

// ===== INFO MODAL =====
function toggleInfo(show) {
    const modal = document.getElementById('info-overlay');
    if (show) { modal.classList.remove('hidden'); modal.style.display = 'flex'; }
    else { modal.classList.add('hidden'); setTimeout(() => modal.style.display = 'none', 300); }
}

// ===== SÍMBOLOS FLOTANTES RA =====
function createFloatingSymbols(container) {
    if (!container) return () => {};
    const created = [];
    CM_MATH_SYMBOLS.forEach((sym, idx) => {
        const el = document.createElement('div');
        el.textContent = sym;
        const size = Math.random() * 30 + 20;
        const dur  = Math.random() * 5 + 5;
        const left = Math.random() * 80 + 10;
        const top  = Math.random() * 80 + 10;
        const dx   = Math.random() * 30 - 15;
        const dy   = Math.random() * 30 - 15;
        const rot  = Math.random() * 30 - 15;
        const aName = 'cmFloat_' + Date.now() + '_' + idx;
        const kf = document.createElement('style');
        kf.textContent = '@keyframes ' + aName + '{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)}}';
        document.head.appendChild(kf);
        el.style.cssText = 'position:absolute;color:rgba(255,255,255,0.2);font-size:' + size + 'px;animation:' + aName + ' ' + dur + 's ease-in-out infinite;left:' + left + '%;top:' + top + '%;pointer-events:none;z-index:1;';
        container.appendChild(el);
        created.push({ el, kf });
    });
    return () => created.forEach(({ el, kf }) => { el.remove(); kf.remove(); });
}

// ===== THREE.JS RA =====

//  DESPUÉS — sin template literals, usando concatenación
const _loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector('script[src="' + src + '"]')) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = res;
    s.onerror = () => rej(new Error('Error cargando: ' + src));
    document.body.appendChild(s);
});

let threePromise = null;
function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threePromise) return threePromise;
    threePromise = _loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
        .then(() => {
            if (window.THREE) return window.THREE;
            return _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
                .then(() => window.THREE);
        })
        .catch(() =>
            _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
                .then(() => window.THREE)
        );
    return threePromise;
}

let threeAddonsPromise = null;
function loadThreeAddons() {
    if (threeAddonsPromise) return threeAddonsPromise;
    threeAddonsPromise = loadThree().then((THREE) =>
        _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/FontLoader.js')
            .then(() => _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/geometries/TextGeometry.js'))
            .then(() => {
                const FontLoader    = window.THREE?.FontLoader    ?? null;
                const TextGeometry  = window.THREE?.TextGeometry  ?? null;
                return { THREE, FontLoader, TextGeometry };
            })
    );
    return threeAddonsPromise;
}
function initThreeForType(container, type, content) {
    let disposed = false, renderer, scene, camera, frameId, videoEl;
    let portalGroup, portalFrameGroup, portalGlow, portalParticles, portalParticleMeta;
    const enableRootSpin = type !== 'Video';
    const planeBaseSize = type === 'Video' ? 3.6 : 1.8;

    const cleanup = () => {
        disposed = true;
        if (frameId) cancelAnimationFrame(frameId);
        if (videoEl) { videoEl.pause(); videoEl.src = ''; videoEl.load(); }
        if (scene) scene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) [].concat(obj.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        });
        if (renderer) { renderer.dispose(); renderer.domElement?.parentNode?.removeChild(renderer.domElement); }
    };

    loadThree().then(THREE => {
        if (disposed || !container) return;
        const w = container.clientWidth || 360, h = container.clientHeight || 240;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        camera.position.z = type === 'Video' ? 3.2 : 2.5;
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0); // fondo 100% transparente
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        const root = new THREE.Group();
        scene.add(root);

        const createGlowTexture = () => {
            const c = document.createElement('canvas'); c.width = c.height = 256;
            const ctx = c.getContext('2d');
            const g = ctx.createRadialGradient(128,128,10,128,128,128);
            g.addColorStop(0,'rgba(0,255,255,0.45)'); g.addColorStop(0.45,'rgba(0,200,255,0.2)'); g.addColorStop(1,'rgba(0,140,255,0)');
            ctx.fillStyle = g; ctx.fillRect(0,0,256,256);
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
        };

        const portalFrameMat = new THREE.MeshStandardMaterial({ color:0x83f3ff, emissive:0x40e0ff, emissiveIntensity:0.85, roughness:0.2, metalness:0.2, transparent:true, opacity:0.95 });

        const buildPortalFrame = (fw, fh) => {
            if (!portalFrameGroup) return;
            portalFrameGroup.children.forEach(c => c.geometry?.dispose());
            portalFrameGroup.clear();
            const t=0.09, d=0.18, hw=fw/2, hh=fh/2;
            [[fw+t*2,t,d,0,hh+t/2,0],[fw+t*2,t,d,0,-hh-t/2,0],[t,fh,d,-hw-t/2,0,0],[t,fh,d,hw+t/2,0,0]].forEach(([bw,bh,bd,x,y,z]) => {
                const m = new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),portalFrameMat);
                m.position.set(x,y,z); portalFrameGroup.add(m);
            });
        };

        if (type === 'Texto' || type === 'Texto3D') {
            scene.add(new THREE.AmbientLight(0xffffff,1.2));
            const dir = new THREE.DirectionalLight(0xffffff,1.5); dir.position.set(2,3,4); scene.add(dir);
            loadThreeAddons().then(({ FontLoader, TextGeometry }) => {
                if (disposed) return;
                const loader = new FontLoader();
                const buildMeshes = font => {
                    const tg = new THREE.Group(); root.add(tg);
                    const mat = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.1, metalness:0, emissive:0xffffff, emissiveIntensity:0.2 });
                    const lines = String(content || '').split(/\\r?\\n/);
                    const widths = [];
                    lines.forEach((line, i) => {
                        const geo = new TextGeometry(line || ' ', { font, size:0.3, height:0.08, curveSegments:12, bevelEnabled:true, bevelThickness:0.01, bevelSize:0.008, bevelSegments:3 });
                        geo.computeBoundingBox();
                        const gw = (geo.boundingBox.max.x - geo.boundingBox.min.x) || 1;
                        widths.push(gw);
                        const mesh = new THREE.Mesh(geo, mat);
                        mesh.position.x = -gw/2;
                        mesh.position.y = ((lines.length-1)/2 - i) * (0.3*1.35);
                        tg.add(mesh);
                    });
                    const mw = Math.max(...widths, 1);
                    tg.scale.setScalar(Math.min(1, 1.4/mw));
                };
                loader.load('/fonts/helvetiker_regular.typeface.json', buildMeshes, undefined,
                    () => loader.load('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/fonts/helvetiker_regular.typeface.json', buildMeshes, undefined, () => {
                        if (!disposed) { const c2 = document.createElement('canvas'); c2.width=512; c2.height=256; const ctx=c2.getContext('2d'); ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(0,0,512,256); ctx.fillStyle='#0b2a4a'; ctx.font='48px Arial'; ctx.fillText(String(content||'').substring(0,20),20,80); const t=new THREE.CanvasTexture(c2); t.colorSpace=THREE.SRGBColorSpace; const plane=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.9),new THREE.MeshBasicMaterial({map:t,transparent:true})); root.add(plane); }
                    })
                );
            }).catch(() => {});

        } else if (type === 'Imagen') {
            const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
            loader.load(content, tex => {
                if (disposed) return;
                tex.colorSpace = THREE.SRGBColorSpace;
                const asp = tex.image.width / tex.image.height;
                const pw = asp>=1?1.8:1.8*asp, ph = asp>=1?1.8/asp:1.8;
                const plane = new THREE.Mesh(new THREE.PlaneGeometry(pw,ph), new THREE.MeshBasicMaterial({map:tex,transparent:true})); root.add(plane);
                const bt = tex.clone(); bt.colorSpace=THREE.SRGBColorSpace; bt.wrapS=THREE.RepeatWrapping; bt.repeat.x=-1; bt.offset.x=1; bt.needsUpdate=true;
                const back = new THREE.Mesh(new THREE.PlaneGeometry(pw,ph), new THREE.MeshBasicMaterial({map:bt,transparent:true})); back.rotation.y=Math.PI; root.add(back);
            }, undefined, () => { if (!disposed) { const img=document.createElement('img'); img.src=content; img.className='ar-fallback-img'; container.innerHTML=''; container.appendChild(img); } });

        } else if (type === 'Video') {
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({color:0xffffff,transparent:true}));
            const fitAsp = asp => {
                const pw=asp>=1?planeBaseSize:planeBaseSize*asp, ph=asp>=1?planeBaseSize/asp:planeBaseSize;
                plane.scale.set(pw,ph,1);
                if (portalGlow) portalGlow.scale.set(pw*1.3,ph*1.3,1);
                buildPortalFrame(pw,ph);
            };
            videoEl = document.createElement('video'); videoEl.src=content; videoEl.crossOrigin='anonymous'; videoEl.loop=true; videoEl.muted=true; videoEl.playsInline=true; videoEl.preload='auto';
            const vtex = new THREE.VideoTexture(videoEl); vtex.colorSpace=THREE.SRGBColorSpace;
            plane.material = new THREE.MeshBasicMaterial({map:vtex,transparent:true,opacity:0.96});
            scene.add(new THREE.AmbientLight(0xffffff,0.35));
            const rim=new THREE.PointLight(0x7ffcff,1.1); rim.position.set(2.5,2.2,3.5); scene.add(rim);
            portalGroup=new THREE.Group(); plane.position.z=-0.06; portalGroup.add(plane);
            const gt=createGlowTexture(); if(gt){const gm=new THREE.MeshBasicMaterial({map:gt,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}); portalGlow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),gm); portalGlow.position.z=-0.14; portalGroup.add(portalGlow);}
            portalFrameGroup=new THREE.Group(); portalGroup.add(portalFrameGroup);
            const pc=160; const pos=new Float32Array(pc*3); portalParticleMeta=[];
            for(let i=0;i<pc;i++){const a=Math.random()*Math.PI*2,r=0.85+Math.random()*0.35,d=(Math.random()-0.5); portalParticleMeta.push({angle:a,radius:r,depth:d}); pos[i*3]=Math.cos(a)*r; pos[i*3+1]=Math.sin(a)*r; pos[i*3+2]=d*0.4;}
            const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
            const pm=new THREE.PointsMaterial({color:0x7df9ff,size:0.05,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending});
            portalParticles=new THREE.Points(pg,pm); portalGroup.add(portalParticles); root.add(portalGroup);
            fitAsp(16/9);
            videoEl.addEventListener('loadedmetadata',()=>{if(videoEl.videoWidth&&videoEl.videoHeight)fitAsp(videoEl.videoWidth/videoEl.videoHeight);});
            videoEl.play().catch(()=>{});
            container.addEventListener('click',()=>{if(videoEl.paused){videoEl.muted=false;videoEl.play().catch(()=>{});}else videoEl.pause();});
        }

        if (window.ResizeObserver) {
            new ResizeObserver(() => { if(!renderer||!camera||!container)return; const nw=container.clientWidth||360,nh=container.clientHeight||240; renderer.setSize(nw,nh); camera.aspect=nw/nh; camera.updateProjectionMatrix(); }).observe(container);
        }

        const animate = () => {
            if (disposed) return;
            if (enableRootSpin) root.rotation.y += 0.008;
            if (portalGroup) { const now=performance.now(); portalGroup.position.y=Math.sin(now*0.0011)*0.06; portalGroup.position.x=Math.cos(now*0.0009)*0.02; portalGroup.rotation.z=Math.sin(now*0.0006)*0.04; portalGroup.rotation.y=Math.cos(now*0.0005)*0.04; }
            if (portalParticles) { portalParticles.rotation.z+=0.002; portalParticles.rotation.y+=0.001; }
            frameId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
    }).catch(() => {
        // Fallback si Three.js no carga
        if (!container) return;
        const cfg = { type, content };
        if (type === 'Texto' || type === 'Texto3D') { const p=document.createElement('p'); p.className='ar-fallback-text'; p.textContent=content; container.innerHTML=''; container.appendChild(p); }
        else if (type === 'Imagen') { const img=document.createElement('img'); img.src=content; img.className='ar-fallback-img'; container.innerHTML=''; container.appendChild(img); }
        else if (type === 'Video') { const v=document.createElement('video'); v.src=content; v.controls=true; v.className='ar-fallback-video'; container.innerHTML=''; container.appendChild(v); }
    });

    return cleanup;
}

function initARScreen(stage) {
    const data = AR_DATA[stage];
    if (!data) return;

    const sl = stage.toLowerCase();
    const bgEl    = document.getElementById('ar-bg-elements-' + sl);
    const audioEl = document.getElementById('ar-audio-' + sl);
    const textEl  = document.getElementById('ar-text-'  + sl);
    const imageEl = document.getElementById('ar-image-' + sl);
    const videoEl = document.getElementById('ar-video-' + sl);

    if (arCleanups[stage]) { arCleanups[stage](); arCleanups[stage] = null; }

    const stopCleanup = createFloatingSymbols(bgEl);
    const cleanThreeFns = [];

    // --- Audio (siempre independiente) ---
    if (audioEl && data.audioUrl) {
        audioEl.src = data.audioUrl;
        audioEl.style.display = 'block';
        audioEl.play().catch(() => {});
    }

    // --- Texto / Texto3D ---
    if (textEl && data.text) {
        textEl.style.display = 'block';
        cleanThreeFns.push(initThreeForType(textEl, 'Texto', data.text));
    }

    // --- Imagen ---
    if (imageEl && data.imageUrl) {
        imageEl.style.display = 'block';
        cleanThreeFns.push(initThreeForType(imageEl, 'Imagen', data.imageUrl));
    }

    // --- Video ---
    if (videoEl && data.videoUrl) {
        videoEl.style.display = 'block';
        cleanThreeFns.push(initThreeForType(videoEl, 'Video', data.videoUrl));
    }

    arCleanups[stage] = () => {
        stopCleanup();
        cleanThreeFns.forEach(fn => fn && fn());
        if (audioEl) { audioEl.pause(); audioEl.src = ''; }
    };
}
function cleanupARScreen(stage) {
    if (arCleanups[stage]) { arCleanups[stage](); arCleanups[stage] = null; }
}

// ===== FLUJO DE JUEGO =====
function startGameSequence() {
    gameExercises = shuffle(EXERCISES).slice(0, ${config.exerciseCount});
    currentIdx = 0; score = 0;
    document.getElementById('score').textContent = '0';

    if (HAS_AR_INICIO) {
        setActiveScreen('ar-screen-inicio');
        initARScreen('Inicio');
    } else {
        startCountdown();
    }
}

function afterARInicio() { cleanupARScreen('Inicio'); startCountdown(); }

function startCountdown() {
    setActiveScreen('countdown-screen');
    let n = 5;
    const el = document.getElementById('countdown-display');
    el.textContent = n;
    const iv = setInterval(() => {
        n--;
        if (n > 0) { el.textContent = n; el.style.animation='none'; el.offsetHeight; el.style.animation='popIn 0.5s ease-out'; }
        else { clearInterval(iv); setActiveScreen('game-ui'); loadExercise(); }
    }, 1000);
}
    let _exerciseTimers = [];
function loadExercise() {
    // Cancelar todos los timers del ejercicio anterior
    _exerciseTimers.forEach(id => clearTimeout(id));
    _exerciseTimers = [];

    const ex = gameExercises[currentIdx];
    document.getElementById('progress-text').textContent = (currentIdx+1) + '/${config.exerciseCount}';
    document.getElementById('progress-bar').style.width = ((currentIdx / gameExercises.length) * 100) + '%';

    const tokens = ex.operation.split(',');
    const wrapper = document.getElementById('operation-display');
    const answersContainer = document.getElementById('answers-container');
    const prompt = document.getElementById('question-prompt');

    // Resetear estado visual
    answersContainer.style.display = 'none';
    answersContainer.innerHTML = '';
    wrapper.innerHTML = '';
    if (prompt) prompt.textContent = 'Memoriza los números...';

    // Crear token único que se irá actualizando
    const tokenEl = document.createElement('div');
    tokenEl.className = 'op-token shown';
    tokenEl.style.cssText = 'font-size:2.5rem;min-width:4rem;text-align:center;opacity:0;transition:opacity 0.25s,transform 0.25s;transform:scale(0.7);padding:0.6rem 1.2rem;';
    wrapper.appendChild(tokenEl);

    const tokenSpeed = CURRENT_LEVEL_CFG.tokenSpeed;
    const answerTime = CURRENT_LEVEL_CFG.answerTime;
    let _answerTimer = null;

    const startAnswerTimer = () => {
        let remaining = answerTime;
        const timerEl = document.createElement('div');
        timerEl.id = 'answer-timer';
        timerEl.style.cssText = 'font-size:1.1rem;font-weight:700;color:#ef4444;text-align:center;margin-top:0.5rem;font-family:Nunito,sans-serif;';
        timerEl.textContent = '⏱ ' + remaining + 's';
        answersContainer.after(timerEl);

        _answerTimer = setInterval(() => {
            remaining--;
            if (timerEl) timerEl.textContent = '⏱ ' + remaining + 's';
            if (remaining <= 0) {
                clearInterval(_answerTimer);
                timerEl?.remove();
                // Tiempo agotado — deshabilitar botones y pasar al siguiente
                answersContainer.querySelectorAll('.answer-btn').forEach(b => {
                    b.disabled = true;
                    const correctText = ex.options.find(o => o.isCorrect)?.text;
                    if (b.textContent === correctText) b.classList.add('correct');
                });
                Swal.fire({
                    title: '⏰ ¡Tiempo agotado!',
                    html: 'La respuesta era: <b>' + ex.options.find(o => o.isCorrect)?.text + '</b>',
                    icon: 'error',
                    confirmButtonText: 'Continuar',
                    timer: 3000,
                }).then(() => nextExercise());
            }
        }, 1000);
        _exerciseTimers.push(_answerTimer);
    };

    const showToken = (idx) => {
        if (idx >= tokens.length) {
            tokenEl.style.opacity = '0';
            tokenEl.style.transform = 'scale(0.7)';
            const t = setTimeout(() => {
                wrapper.innerHTML = '';
                if (prompt) prompt.textContent = '¿Cuál es el resultado?';
                answersContainer.innerHTML = '';
                const opts = shuffle(ex.options);
                opts.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'answer-btn';
                    btn.textContent = opt.text;
                    btn.onclick = () => {
                        clearInterval(_answerTimer);
                        document.getElementById('answer-timer')?.remove();
                        handleAnswer(opt.isCorrect, btn, answersContainer, ex);
                    };
                    answersContainer.appendChild(btn);
                });
                answersContainer.style.display = 'grid';
                startAnswerTimer();
            }, 400);
            _exerciseTimers.push(t);
            return;
        }
        tokenEl.style.opacity = '0';
        tokenEl.style.transform = 'scale(0.7)';
        const t1 = setTimeout(() => {
            tokenEl.textContent = tokens[idx];
            tokenEl.style.transition = 'opacity 0.25s, transform 0.25s';
            tokenEl.style.opacity = '1';
            tokenEl.style.transform = 'scale(1)';
            const t2 = setTimeout(() => showToken(idx + 1), tokenSpeed);
            _exerciseTimers.push(t2);
        }, idx === 0 ? 0 : 200);
        _exerciseTimers.push(t1);
    };

    showToken(0);
}

// DESPUÉS
function handleAnswer(isCorrect, clickedBtn, container, ex) {
    container.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
    const correctText = ex.options.find(o => o.isCorrect)?.text;

    if (isCorrect) {
        clickedBtn.classList.add('correct');
        score += 10;
        document.getElementById('score').textContent = score;
        if (HAS_AR_ACIERTO) {
            pendingNextCallback = () => nextExercise();
            setTimeout(() => { setActiveScreen('ar-screen-acierto'); initARScreen('Acierto'); }, 600);
        } else {
            Swal.fire({
                html: \`
                    <div style="background:linear-gradient(145deg,#03045e 0%,#023e8a 50%,#0077b6 100%);
                                border-radius:20px;padding:2rem 1.5rem;text-align:center;position:relative;overflow:hidden;">
                      <div style="position:absolute;inset:0;pointer-events:none;
                        background:radial-gradient(circle at 20% 20%,rgba(255,255,255,0.08) 0%,transparent 50%),
                                   radial-gradient(circle at 80% 80%,rgba(255,255,255,0.08) 0%,transparent 50%);">
                      </div>
                      <div style="font-size:3.5rem;margin-bottom:0.5rem;">🎉</div>
                      <div style="color:#ffd60a;font-size:1.6rem;font-weight:800;margin-bottom:0.5rem;
                                  text-shadow:0 2px 12px rgba(0,0,0,0.5);">¡Correcto!</div>
                      <div style="color:#caf0f8;font-size:1rem;margin-bottom:0.5rem;">La respuesta era:</div>
                      <div style="color:#ffffff;font-size:1.5rem;font-weight:800;
                                  background:rgba(255,255,255,0.12);border-radius:10px;
                                  padding:0.5rem 1rem;display:inline-block;">
                        \${correctText}
                      </div>
                      <div style="color:#90e0ef;font-size:0.9rem;margin-top:1rem;font-weight:600;">+10 puntos 🔑</div>
                    </div>
                \`,
                confirmButtonText: '➡️ Continuar',
                confirmButtonColor: '#0077b6',
            }).then(() => nextExercise());
        }
    } else {
        clickedBtn.classList.add('wrong');
        container.querySelectorAll('.answer-btn').forEach(b => { if (b.textContent === correctText) b.classList.add('correct'); });
        const userAnswer = clickedBtn.textContent;
        Swal.fire({
            html: \`
                <div style="background:linear-gradient(145deg,#4a0000 0%,#7f1d1d 50%,#b91c1c 100%);
                            border-radius:20px;padding:2rem 1.5rem;text-align:center;position:relative;overflow:hidden;">
                  <div style="position:absolute;inset:0;pointer-events:none;
                    background:radial-gradient(circle at 20% 20%,rgba(255,255,255,0.06) 0%,transparent 50%),
                               radial-gradient(circle at 80% 80%,rgba(255,255,255,0.06) 0%,transparent 50%);">
                  </div>
                  <div style="font-size:3.5rem;margin-bottom:0.5rem;">❌</div>
                  <div style="color:#fca5a5;font-size:1.6rem;font-weight:800;margin-bottom:0.5rem;
                              text-shadow:0 2px 12px rgba(0,0,0,0.5);">¡Incorrecto!</div>
                  <div style="color:#fecaca;font-size:1rem;margin-bottom:0.5rem;">La respuesta correcta era:</div>
                  <div style="color:#ffffff;font-size:1.5rem;font-weight:800;
                              background:rgba(255,255,255,0.12);border-radius:10px;
                              padding:0.5rem 1rem;display:inline-block;">
                    \${correctText}
                  </div>
                  <div style="color:#fca5a5;font-size:0.9rem;margin-top:1rem;font-weight:600;">
                    Tu respuesta: <span style="color:#ffffff;">\${userAnswer}</span>
                  </div>
                </div>
            \`,
            confirmButtonText: '➡️ Continuar',
            confirmButtonColor: '#b91c1c',
        }).then(() => nextExercise());
    }
}
function afterARAcierto() {
    cleanupARScreen('Acierto');
    if (pendingNextCallback) { pendingNextCallback(); pendingNextCallback = null; }
}

function nextExercise() {
    currentIdx++;
    if (currentIdx < gameExercises.length) {
        setActiveScreen('game-ui');
        loadExercise();
    } else {
        finishGame(true);
    }
}

function finishGame(completed) {
    if (!completed) { showEndScreen(); return; }
    if (HAS_AR_FINAL) {
        setActiveScreen('ar-screen-final');
        initARScreen('Final');
    } else {
        showEndScreen();
    }
}

function afterARFinal() { cleanupARScreen('Final'); showEndScreen(); }

function showEndScreen() {
    setActiveScreen('end-screen');
    document.getElementById('final-score').textContent = score;
    const completed = currentIdx >= gameExercises.length;
    document.getElementById('end-title').textContent = completed ? '¡Juego Completado!' : 'Fin del Juego';
}
function restartGame() { startGameSequence(); }
function exitGame() {
    window.close();
    Swal.fire({ title: 'Juego Finalizado', text: 'Por favor cierra esta pestaña manualmente.', icon: 'info', confirmButtonText: 'Entendido' });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {});
</script>
</body>
</html>`;
    };


    // ---- REEMPLAZAR generateAndDownloadZip ----
    const generateAndDownloadZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        // Convierte una blob: URL a data URL base64 embebible en HTML standalone
        const blobUrlToDataUrl = async (url) => {
            if (!url || !url.startsWith('blob:')) return url;
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                return await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch {
                return url;
            }
        };

        const resolveARConfig = async (cfg) => {
            if (!cfg || typeof cfg !== 'object') return cfg;
            const result = {};
            for (const stage of Object.keys(cfg)) {
                const stageCfg = cfg[stage] ?? {};
                result[stage] = {
                    ...stageCfg,
                    imageUrl: await blobUrlToDataUrl(stageCfg.imageUrl),
                    audioUrl: await blobUrlToDataUrl(stageCfg.audioUrl),
                    videoUrl: await blobUrlToDataUrl(stageCfg.videoUrl),
                    text: stageCfg.text ?? '',
                };
            }
            return result;
        };

        try {
            const zip = new window.JSZip();
            setStatusText("Procesando archivos multimedia...");

            // Usar las props directamente — no depender de localStorage
            const resolvedConfig = arEnabled && arConfig
                ? await resolveARConfig(arConfig)
                : {};

            setStatusText("Finalizando HTML...");

            const htmlContent = generateGameHTML(
                config,
                state?.gameDetails ?? {},
                state?.selectedPlatforms ?? [],
                arEnabled,
                arEnabled ? (arSelectedStages ?? {}) : {},
                resolvedConfig
            );


            const gameDetails = state?.gameDetails ?? {};
            const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'calculadora_mental')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            zip.file(htmlFileName, htmlContent);

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'calculadora_mental')}_web.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setProgress(100);
            setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error("Error generando el ZIP:", error);
            setStatusText("Error al generar el archivo.");
            setIsGenerating(false);
        }
    };

    const generateAndDownloadAndroidZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        const blobUrlToDataUrl = async (url) => {
            if (!url || !url.startsWith('blob:')) return url;
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                return await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch { return url; }
        };

        const resolveARConfig = async (cfg) => {
            if (!cfg || typeof cfg !== 'object') return cfg;
            const stageMap = {
                Inicio: 'inicio',
                Acierto: 'acierto',
                Final: 'fin',
                start: 'inicio',
                success: 'acierto',
                end: 'fin'
            };
            const result = {};
            for (const stage of Object.keys(cfg)) {
                const mappedStage = stageMap[stage] || stage;
                const stageCfg = cfg[stage] ?? {};

                result[mappedStage] = {
                    activo: true,
                    contenido: {
                        imagen: await blobUrlToDataUrl(stageCfg.imageUrl),
                        audio: await blobUrlToDataUrl(stageCfg.audioUrl),
                        video: await blobUrlToDataUrl(stageCfg.videoUrl),
                        texto: stageCfg.text ?? ''
                    }
                };
            }
            return result;
        };

        try {
            setStatusText("Descargando plantilla Android...");
            // Asume que la plantilla ligera estará en /templates/calculomental_android.zip
            const response = await fetch('/templates/calculomental_android.zip');
            if (!response.ok) {
                throw new Error("No se pudo descargar la plantilla base de Android");
            }
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Procesando archivos ZIP...");
            const zip = await window.JSZip.loadAsync(arrayBuffer);

            setStatusText("Inyectando configuración...");
            const resolvedConfig = arEnabled && arConfig ? await resolveARConfig(arConfig) : {};

            const selectedPlats = state?.selectedPlatforms ?? [];
            const details = state?.gameDetails ?? {};

            const fullConfig = {
                nivel: config?.level || 'Básico',
                autor: details.authorName || '',
                version: details.version || '1.0.0',
                fecha: details.date || new Date().toISOString(),
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Cálculo Mental',
                plataformas: Array.isArray(selectedPlats) ? selectedPlats : ['android'],
                ar: arEnabled && arConfig ? await resolveARConfig(arConfig) : undefined
            };

            // Inyectar el archivo de configuración en la ruta de assets del proyecto Capacitor
            const androidApplicationId = buildCalculoMentalApplicationId();
            zip.file("android/app/src/main/assets/public/config/calculo-config.json", JSON.stringify(fullConfig, null, 2));
            await applyCalculoMentalAndroidMetadata(zip, { applicationId: androidApplicationId });

            // Si la RA está habilitada, inyectar el permiso de la cámara automáticamente
            if (arEnabled) {
                const manifestPath = "android/app/src/main/AndroidManifest.xml";
                const manifestFile = zip.file(manifestPath);
                if (manifestFile) {
                    let manifestContent = await manifestFile.async("string");
                    if (!manifestContent.includes("android.permission.CAMERA")) {
                        manifestContent = manifestContent.replace(
                            '</manifest>',
                            '    <uses-permission android:name="android.permission.CAMERA" />\n</manifest>'
                        );
                        zip.file(manifestPath, manifestContent);
                    }
                }
            }


            setStatusText("Generando paquete final...");
            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            const platformsSuffix = (Array.isArray(selectedPlats) ? selectedPlats : ['movil'])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            link.download = `${normalizeFileName(details?.gameName || 'calculadora_mental')}_${platformsSuffix}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setProgress(100);
            setStatusText("¡Descarga iniciada!");
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

        const blobUrlToDataUrl = async (url) => {
            if (!url || !url.startsWith('blob:')) return url;
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                return await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch { return url; }
        };

        const resolveARConfig = async (cfg) => {
            if (!cfg || typeof cfg !== 'object') return cfg;
            const stageMap = { Inicio: 'inicio', Acierto: 'acierto', Final: 'fin', start: 'inicio', success: 'acierto', end: 'fin' };
            const result = {};
            for (const stage of Object.keys(cfg)) {
                const mappedStage = stageMap[stage] || stage;
                const stageCfg = cfg[stage] ?? {};
                result[mappedStage] = {
                    activo: true,
                    contenido: {
                        imagen: await blobUrlToDataUrl(stageCfg.imageUrl),
                        audio: await blobUrlToDataUrl(stageCfg.audioUrl),
                        video: await blobUrlToDataUrl(stageCfg.videoUrl),
                        texto: stageCfg.text ?? ''
                    }
                };
            }
            return result;
        };

        try {
            const outerZip = new window.JSZip();

            // ── Generar ZIP Web ──
            setStatusText("Generando paquete Web...");
            const resolvedARForWeb = arEnabled && arConfig ? await resolveARConfig(arConfig) : {};
            const htmlContent = generateGameHTML(
                config, state?.gameDetails ?? {}, state?.selectedPlatforms ?? [],
                arEnabled, arEnabled ? (arSelectedStages ?? {}) : {}, resolvedARForWeb
            );
            const webZip = new window.JSZip();

            const detailsCombined = state?.gameDetails ?? {};
            const htmlFileNameCombined = `${normalizeFileName(detailsCombined?.gameName || 'calculadora_mental')}_v${(detailsCombined?.version || '1.0').replace(/\s+/g, '')}.html`;
            webZip.file(htmlFileNameCombined, htmlContent);
            const webBlob = await webZip.generateAsync({ type: "blob" });
            outerZip.file(`${normalizeFileName(detailsCombined?.gameName || 'calculadora_mental')}_web.zip`, webBlob);

            // ── Generar ZIP Android ──
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/calculomental_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Inyectando configuración Android...");
            const androidZip = await window.JSZip.loadAsync(arrayBuffer);
            const details = state?.gameDetails ?? {};
            const selectedPlats = state?.selectedPlatforms ?? [];
            const fullConfig = {
                nivel: config?.level || 'Básico',
                autor: details.authorName || '',
                version: details.version || '1.0.0',
                fecha: details.date || new Date().toISOString(),
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Cálculo Mental',
                plataformas: Array.isArray(selectedPlats) ? selectedPlats : ['android'],
                ar: arEnabled && arConfig ? await resolveARConfig(arConfig) : undefined
            };
            const androidApplicationId = buildCalculoMentalApplicationId();
            androidZip.file("android/app/src/main/assets/public/config/calculo-config.json", JSON.stringify(fullConfig, null, 2));
            await applyCalculoMentalAndroidMetadata(androidZip, { applicationId: androidApplicationId });
            if (arEnabled) {
                const manifestPath = "android/app/src/main/AndroidManifest.xml";
                const manifestFile = androidZip.file(manifestPath);
                if (manifestFile) {
                    let manifestContent = await manifestFile.async("string");
                    if (!manifestContent.includes("android.permission.CAMERA")) {
                        manifestContent = manifestContent.replace('</manifest>', '    <uses-permission android:name="android.permission.CAMERA" />\n</manifest>');
                        androidZip.file(manifestPath, manifestContent);
                    }
                }
            }
            const androidBlob = await androidZip.generateAsync({ type: "blob", platform: "UNIX" });

            const mobilePlatforms = (state?.selectedPlatforms ?? [])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            outerZip.file(`${normalizeFileName(details?.gameName || 'calculadora_mental')}_${mobilePlatforms}.zip`, androidBlob);

            // ── ZIP contenedor final ──
            setStatusText("Empaquetando todo...");
            const finalBlob = await outerZip.generateAsync({ type: "blob" });
            const platformsLabel = (state?.selectedPlatforms ?? [])
                .map(p => platformLabel(p))
                .join('_');
            const url = window.URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'calculadora_mental')}_${platformsLabel}.zip`;

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
        const hasWeb = state?.selectedPlatforms?.some(p => p.toLowerCase() === 'web');
        const hasAndroid = state?.selectedPlatforms?.some(p => p.toLowerCase() === 'android');

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

        if (!dateString) return 'No especificada';
        try {
            const normalized = dateString.includes('T') ? dateString : dateString + 'T00:00:00';
            return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return "Fecha inválida"; }
    };

    // Siempre usar la fecha actual del navegador/equipo del usuario
    const getFixedCreationDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    };

    const selectedAreas = state?.selectedAreas || [];
    const selectedSkills = state?.selectedSkills || [];
    const gameDetails = { ...(state?.gameDetails || {}), date: getFixedCreationDate() };
    const selectedPlatforms = state?.selectedPlatforms || [];

    const getAreaName = (areaId) => {
        const areas = { science: 'Ciencia', technology: 'Tecnología', engineering: 'Ingeniería', arts: 'Arte', math: 'Matemáticas' };
        return areas[areaId] || areaId;
    };
    const getAreaIcon = (areaId) => {
        const icons = { science: '/images/areas/Ciencia.png', technology: '/images/areas/Tecnologia.png', engineering: '/images/areas/Ingenieria.png', arts: '/images/areas/Artes.png', math: '/images/areas/Matematicas.png' };
        return icons[areaId] || 'https://placehold.co/32x32/eee/aaa?text=?';
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

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2.5rem 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
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
                                        <img src={getAreaIcon(areaId)} alt="" style={{ width: '20px', height: '20px' }}
                                            onError={(e) => { e.target.src = 'https://placehold.co/20x20/eee/aaa?text=?'; }} />
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
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Type size={18} /> Nivel:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.level.charAt(0).toUpperCase() + config.level.slice(1)}</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><List size={18} /> Ejercicios:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.exerciseCount}</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Realidad Aumentada:</span>
                        <strong style={{ fontSize: '1.1rem', color: arEnabled ? '#64748b' : '#64748b' }}>{arEnabled ? 'Sí' : 'No'}</strong>
                    </div>
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    <button className="btn-primary-summary" onClick={onBack} disabled={isGenerating} style={{ opacity: isGenerating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={18} /> Volver a Editar
                    </button>
                </div>
            </div>

            <div className="download-section" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '1.5rem', marginTop: '3rem', padding: '2rem',
                background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0'
            }}>
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
                        {state?.selectedPlatforms?.some(p => p.toLowerCase() === 'web') && (
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
                        {state?.selectedPlatforms?.some(p => p.toLowerCase() === 'android') && (
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
                            const hasWeb = state?.selectedPlatforms?.some(p => p.toLowerCase() === 'web');
                            const hasAndroid = state?.selectedPlatforms?.some(p => p.toLowerCase() === 'android');
                            if (hasWeb && hasAndroid) return '📦 Se generará un ZIP con el paquete Web y el proyecto Android incluidos.';
                            if (hasAndroid) return '📱 Se generará el proyecto Android (plantilla Capacitor).';
                            return '🌐 Se generará el archivo HTML del juego listo para web.';
                        })()}
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
                    ) : (state?.selectedPlatforms?.filter(p => ['web', 'android'].includes(p.toLowerCase())).length > 1) ? (
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
                    ) : state?.selectedPlatforms?.some(p => p.toLowerCase() === 'android') ? (
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
const CalculoMental = ({ withRA: withRAProp = null }) => {
    const location = useLocation();
    const { state } = location;
    const navigate = useNavigate();

    const STORAGE_NS = 'ar:calculoMental';
    const LS = {
        stages: `${STORAGE_NS}:selectedStages`,
        config: `${STORAGE_NS}:config`,
    };

    const readJson = (key, legacyKey, fallback) => {
        try {
            const raw = localStorage.getItem(key) ?? localStorage.getItem(legacyKey);
            return raw ? (JSON.parse(raw) ?? fallback) : fallback;
        } catch {
            return fallback;
        }
    };

    const raFromNav = state?.withRA ?? withRAProp;
    const [showARModal, setShowARModal] = useState(false);
    const [arEnabled, setArEnabled] = useState(raFromNav ?? false);
    const [setupStep, setSetupStep] = useState(
        raFromNav === true ? "ar" : "game"
    );
    // ── Publicar setupStep inicial en location.state para que el Sidebar lo lea ──
    useEffect(() => {
        const initialStep = raFromNav === true ? "ar" : "game";
        navigate(location.pathname + location.search, {
            replace: true,
            state: { ...location.state, setupStep: initialStep }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo al montar
    const [activeARTab, setActiveARTab] = useState("Inicio");

    const [arSelectedStages, setArSelectedStages] = useState(
        { Inicio: false, Acierto: false, Final: false }
    );

    const [arConfig, setArConfig] = useState({});

    // Limpiar configuración anterior al montar el componente
    useEffect(() => {
        localStorage.removeItem(LS.stages);
        localStorage.removeItem(LS.config);
    }, []);

    const threeLoadRef = useRef(null);
    const threeAddonsLoadRef = useRef(null);
    const mediaObjectUrlsRef = useRef({});

    useEffect(() => {
        return () => {
            Object.values(mediaObjectUrlsRef.current).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, []);

    const ensureSwal = () => {
        if (!window.Swal) {
            alert("SweetAlert2 aún no ha cargado. Intenta de nuevo en 1-2 segundos.");
            return false;
        }
        return true;
    };

    //  DESPUÉS — reutiliza loadThree/loadThreeAddons ya corregidas arriba
    //  DESPUÉS — implementación directa dentro del componente
    const ensureThree = () => {
        if (window.THREE) return Promise.resolve(window.THREE);
        if (threeLoadRef.current) return threeLoadRef.current;
        const loadScriptLocal = (src) => new Promise((res, rej) => {
            if (document.querySelector('script[src="' + src + '"]')) { res(); return; }
            const s = document.createElement('script');
            s.src = src; s.async = true;
            s.onload = res;
            s.onerror = () => rej(new Error('Error cargando: ' + src));
            document.body.appendChild(s);
        });
        threeLoadRef.current = loadScriptLocal('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
            .then(() => {
                if (window.THREE) return window.THREE;
                return loadScriptLocal('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
                    .then(() => window.THREE);
            })
            .catch(() =>
                loadScriptLocal('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
                    .then(() => window.THREE)
            );
        return threeLoadRef.current;
    };

    const ensureThreeTextAddons = () => {
        if (threeAddonsLoadRef.current) return threeAddonsLoadRef.current;
        threeAddonsLoadRef.current = ensureThree().then((THREE) => {
            const loadScriptLocal = (src) => new Promise((res, rej) => {
                if (document.querySelector('script[src="' + src + '"]')) { res(); return; }
                const s = document.createElement('script');
                s.src = src; s.async = true;
                s.onload = res;
                s.onerror = () => rej(new Error('Error cargando: ' + src));
                document.body.appendChild(s);
            });
            return loadScriptLocal('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/FontLoader.js')
                .then(() => loadScriptLocal('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/geometries/TextGeometry.js'))
                .then(() => {
                    const FontLoader = window.THREE?.FontLoader ?? null;
                    const TextGeometry = window.THREE?.TextGeometry ?? null;
                    return { THREE, FontLoader, TextGeometry };
                });
        });
        return threeAddonsLoadRef.current;
    };

    const AR_STAGES = ['Inicio', 'Acierto', 'Final'];

    const toggleStage = (stage) => {
        setArSelectedStages(prev => ({ ...prev, [stage]: !prev[stage] }));
    };

    const updateStageValue = (stage, key, value) => {
        setArConfig(prev => ({
            ...prev,
            [stage]: {
                ...(prev[stage] ?? {}),
                [key]: value,
            }
        }));
    };

    const escapeHtml = (s = '') =>
        s.replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');

    const normalizeStageConfig = (stageCfg = {}) => {
        const text = stageCfg.text ?? stageCfg.TextoValor ?? "";
        const imageUrl = stageCfg.imageUrl ?? stageCfg.ImagenUrl ?? "";
        const audioUrl = stageCfg.audioUrl ?? stageCfg.AudioUrl ?? "";
        const videoUrl = stageCfg.videoUrl ?? stageCfg.VideoUrl ?? "";

        let detectedType = stageCfg.type;
        if (!detectedType) {
            if (videoUrl?.trim()) detectedType = "Video";
            else if (imageUrl?.trim()) detectedType = "Imagen";
            else if (audioUrl?.trim()) detectedType = "Audio";
            else if (text?.trim()) detectedType = "Texto";
            else if (stageCfg.Video) detectedType = "Video";
            else if (stageCfg.Imagen) detectedType = "Imagen";
            else if (stageCfg.Audio) detectedType = "Audio";
            else if (stageCfg.Texto) detectedType = "Texto";
        }

        return {
            type: detectedType,
            text,
            imageUrl,
            audioUrl,
            videoUrl,
            hasText: !!text?.trim(),
            hasImage: !!imageUrl?.trim(),
            hasAudio: !!audioUrl?.trim(),
            hasVideo: !!videoUrl?.trim(),
        };
    };

    const hasStageContent = (stageCfg = {}) => {
        const cfg = normalizeStageConfig(stageCfg);
        return !!(cfg.text?.trim() || cfg.imageUrl?.trim() || cfg.audioUrl?.trim() || cfg.videoUrl?.trim());
    };

    const CM_MATH_SYMBOLS = ['×', '+', '÷', '-', '=', '1', '2', '3'];

    const cmCreateFloatingSymbols = (container) => {
        if (!container) return () => { };

        const uid = `cm_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        const createdNodes = [];
        const createdStyles = [];

        CM_MATH_SYMBOLS.forEach((symbol, index) => {
            const floating = document.createElement("div");
            floating.textContent = symbol;

            const size = Math.random() * 30 + 20;
            const duration = Math.random() * 5 + 5;
            const left = Math.random() * 80 + 10;
            const top = Math.random() * 80 + 10;
            const dx = Math.random() * 30 - 15;
            const dy = Math.random() * 30 - 15;
            const rot = Math.random() * 30 - 15;

            const animName = `cmFloat_${uid}_${index}`;

            floating.style.cssText = `
                position: absolute;
                color: rgba(0, 180, 255, 0.35);
                font-size: ${size}px;
                animation: ${animName} ${duration}s ease-in-out infinite;
                left: ${left}%;
                top: ${top}%;
            `;

            const keyframes = document.createElement("style");
            keyframes.textContent = `
                @keyframes ${animName} {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(${dx}px, ${dy}px) rotate(${rot}deg); }
                }
            `;

            document.head.appendChild(keyframes);
            container.appendChild(floating);

            createdStyles.push(keyframes);
            createdNodes.push(floating);
        });

        return () => {
            createdNodes.forEach((n) => n.remove());
            createdStyles.forEach((s) => s.remove());
        };
    };

    const startCamera = async (videoElementId) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            const videoElement = document.getElementById(videoElementId);
            if (videoElement) {
                videoElement.srcObject = stream;
                videoElement.play();
            }
            return stream;
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            return null;
        }
    };

    const stopCamera = (stream) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const cmBuildARDecoratedHtml = ({ bgId, topHtml = "", innerHtml = "", useCamera = false, videoId = "" }) => `
        <div class="cm-ar-bg ${useCamera ? 'cm-ar-bg-camera' : ''}">
            ${useCamera ? `<video id="${videoId}" class="cm-ar-camera-bg" autoplay playsinline muted></video>` : ''}
            <div id="${bgId}" class="cm-ar-bg-elements"></div>

            <div class="cm-ar-content">
            ${topHtml}
            ${innerHtml}
            </div>
        </div>
    `;


    const initThreeStage = (container, stageCfg = {}) => {
        let disposed = false;
        let renderer;
        let scene;
        let camera;
        let frameId;
        let resizeObserver;
        let resizeHandler;
        let videoEl;
        let videoMetadataHandler;
        let toggleHandler;
        let audioObj;
        let audioAnalyser;
        let noteGroup;
        let notePulse = 0;
        let portalGroup;
        let portalFrameGroup;
        let portalGlow;
        let portalParticles;
        let portalParticleMeta;
        let enableRootSpin = true;
        let planeBaseSize = 1.8;

        const cleanup = () => {
            disposed = true;
            if (frameId) cancelAnimationFrame(frameId);
            if (resizeObserver) resizeObserver.disconnect();
            if (resizeHandler) window.removeEventListener("resize", resizeHandler);
            if (toggleHandler && container) container.removeEventListener("click", toggleHandler);
            if (videoEl) {
                if (videoMetadataHandler) {
                    videoEl.removeEventListener("loadedmetadata", videoMetadataHandler);
                }
                videoEl.pause();
                videoEl.src = "";
                videoEl.load();
            }
            if (audioObj && audioObj.isPlaying) audioObj.stop();
            if (scene) {
                scene.traverse((obj) => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) {
                        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                        materials.forEach((mat) => {
                            if (mat.map) mat.map.dispose();
                            mat.dispose();
                        });
                    }
                });
            }
            if (renderer) {
                renderer.dispose();
                if (renderer.domElement?.parentNode) {
                    renderer.domElement.parentNode.removeChild(renderer.domElement);
                }
            }
        };

        ensureThree()
            .then((THREE) => {
                if (disposed || !container) return;

                const cfg = normalizeStageConfig(stageCfg);
                if (!cfg.type) {
                    container.textContent = "Sin tipo configurado.";
                    return;
                }
                enableRootSpin = cfg.type !== "Video";
                if (cfg.type === "Video") {
                    planeBaseSize = 4;
                }

                const width = container.clientWidth || 360;
                const height = container.clientHeight || 240;

                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
                camera.position.z = 3.2;

                renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setSize(width, height);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                renderer.outputColorSpace = THREE.SRGBColorSpace;

                container.innerHTML = "";
                container.appendChild(renderer.domElement);

                const root = new THREE.Group();
                scene.add(root);

                const plane = new THREE.Mesh(
                    new THREE.PlaneGeometry(1, 1),
                    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
                );
                root.add(plane);

                const planeBack = new THREE.Mesh(
                    plane.geometry.clone(),
                    plane.material.clone()
                );
                planeBack.rotation.y = Math.PI;
                planeBack.visible = false;
                root.add(planeBack);

                const fitPlaneToAspect = (aspect, baseSize = planeBaseSize) => {
                    if (!aspect) return;
                    if (aspect >= 1) {
                        const width = baseSize;
                        const height = baseSize / aspect;
                        plane.scale.set(width, height, 1);
                        planeBack.scale.set(width, height, 1);
                        if (portalGlow) portalGlow.scale.set(width * 1.3, height * 1.3, 1);
                        updatePortalFrame(width, height);
                    } else {
                        const width = baseSize * aspect;
                        const height = baseSize;
                        plane.scale.set(width, height, 1);
                        planeBack.scale.set(width, height, 1);
                        if (portalGlow) portalGlow.scale.set(width * 1.3, height * 1.3, 1);
                        updatePortalFrame(width, height);
                    }
                };

                const createTextTexture = (text) => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return null;

                    const lines = String(text).split(/\r?\n/);
                    const fontSize = 48;
                    const lineHeight = Math.round(fontSize * 1.2);
                    const padding = 28;
                    ctx.font = `${fontSize}px Arial`;
                    const maxWidth = Math.max(
                        ...lines.map((line) => ctx.measureText(line).width),
                        1
                    );
                    canvas.width = Math.min(Math.max(maxWidth + padding * 2, 256), 1024);
                    canvas.height = Math.min(lines.length * lineHeight + padding * 2, 1024);
                    ctx.fillStyle = "rgba(255,255,255,0.9)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#0b2a4a";
                    ctx.textBaseline = "top";
                    ctx.font = `${fontSize}px Arial`;
                    lines.forEach((line, index) => {
                        ctx.fillText(line, padding, padding + index * lineHeight);
                    });
                    const texture = new THREE.CanvasTexture(canvas);
                    texture.colorSpace = THREE.SRGBColorSpace;
                    return texture;
                };

                const createGlowTexture = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return null;
                    canvas.width = 256;
                    canvas.height = 256;
                    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
                    grad.addColorStop(0, "rgba(0, 255, 255, 0.45)");
                    grad.addColorStop(0.45, "rgba(0, 200, 255, 0.2)");
                    grad.addColorStop(1, "rgba(0, 140, 255, 0)");
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    const texture = new THREE.CanvasTexture(canvas);
                    texture.colorSpace = THREE.SRGBColorSpace;
                    return texture;
                };

                const portalFrameMaterial = new THREE.MeshStandardMaterial({
                    color: 0x83f3ff,
                    emissive: 0x40e0ff,
                    emissiveIntensity: 0.85,
                    roughness: 0.2,
                    metalness: 0.2,
                    transparent: true,
                    opacity: 0.95,
                });

                const updatePortalFrame = (frameWidth, frameHeight) => {
                    if (!portalFrameGroup) return;

                    portalFrameGroup.children.forEach((child) => {
                        if (child.geometry) child.geometry.dispose();
                    });
                    portalFrameGroup.clear();

                    const thickness = 0.09;
                    const depth = 0.18;
                    const halfW = frameWidth / 2;
                    const halfH = frameHeight / 2;

                    const top = new THREE.Mesh(
                        new THREE.BoxGeometry(frameWidth + thickness * 2, thickness, depth),
                        portalFrameMaterial
                    );
                    top.position.set(0, halfH + thickness / 2, 0);
                    portalFrameGroup.add(top);

                    const bottom = new THREE.Mesh(
                        new THREE.BoxGeometry(frameWidth + thickness * 2, thickness, depth),
                        portalFrameMaterial
                    );
                    bottom.position.set(0, -halfH - thickness / 2, 0);
                    portalFrameGroup.add(bottom);

                    const left = new THREE.Mesh(
                        new THREE.BoxGeometry(thickness, frameHeight, depth),
                        portalFrameMaterial
                    );
                    left.position.set(-halfW - thickness / 2, 0, 0);
                    portalFrameGroup.add(left);

                    const right = new THREE.Mesh(
                        new THREE.BoxGeometry(thickness, frameHeight, depth),
                        portalFrameMaterial
                    );
                    right.position.set(halfW + thickness / 2, 0, 0);
                    portalFrameGroup.add(right);

                    if (portalParticles && portalParticleMeta) {
                        const posAttr = portalParticles.geometry.getAttribute("position");
                        const positions = posAttr.array;
                        const baseRadius = Math.hypot(halfW, halfH) * 1.08;
                        const depthScale = Math.min(0.5, baseRadius * 0.2);
                        for (let i = 0; i < portalParticleMeta.length; i += 1) {
                            const meta = portalParticleMeta[i];
                            const radius = baseRadius * meta.radius;
                            positions[i * 3] = Math.cos(meta.angle) * radius;
                            positions[i * 3 + 1] = Math.sin(meta.angle) * radius;
                            positions[i * 3 + 2] = meta.depth * depthScale;
                        }
                        posAttr.needsUpdate = true;
                        if (portalParticles.material) {
                            portalParticles.material.size = Math.max(0.04, baseRadius * 0.03);
                        }
                    }
                };

                if (cfg.type === "Texto" || cfg.type === "Texto3D") {
                    plane.visible = false;
                    planeBack.visible = false;

                    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
                    scene.add(ambient);
                    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
                    dir.position.set(2, 3, 4);
                    scene.add(dir);

                    ensureThreeTextAddons()
                        .then(({ FontLoader, TextGeometry }) => {
                            if (disposed) return;

                            const loader = new FontLoader();
                            const fontUrl = "/fonts/helvetiker_regular.typeface.json";
                            const fallbackFontUrl =
                                "https://cdn.jsdelivr.net/npm/three@0.160.1/examples/fonts/helvetiker_regular.typeface.json";

                            const buildTextMeshes = (font) => {
                                const textGroup = new THREE.Group();
                                root.add(textGroup);

                                const size = 0.35;
                                const depth = 0.1;
                                const lineHeight = size * 1.35;
                                const material = new THREE.MeshStandardMaterial({
                                    color: 0xffffff,
                                    roughness: 0.1,
                                    metalness: 0.0,
                                    emissive: 0xffffff,
                                    emissiveIntensity: 0.2,
                                });

                                const lines = String(cfg.text || "").split(/\r?\n/);
                                const widths = [];

                                lines.forEach((line, index) => {
                                    const geometry = new TextGeometry(line || " ", {
                                        font,
                                        size,
                                        height: depth,
                                        curveSegments: 12,
                                        bevelEnabled: true,
                                        bevelThickness: 0.01,
                                        bevelSize: 0.008,
                                        bevelSegments: 3,
                                    });
                                    geometry.computeBoundingBox();

                                    const box = geometry.boundingBox;
                                    const width = box ? box.max.x - box.min.x : 1;
                                    widths.push(width);

                                    const mesh = new THREE.Mesh(geometry, material);
                                    mesh.position.x = -width / 2;
                                    mesh.position.y = ((lines.length - 1) / 2 - index) * lineHeight;
                                    textGroup.add(mesh);
                                });

                                const maxWidth = Math.max(...widths, 1);
                                const targetWidth = 1.6;
                                const scale = maxWidth > 0 ? Math.min(1, targetWidth / maxWidth) : 1;
                                textGroup.scale.setScalar(scale);
                            };

                            loader.load(
                                fontUrl,
                                (font) => {
                                    if (disposed) return;
                                    buildTextMeshes(font);
                                },
                                undefined,
                                () => {
                                    loader.load(
                                        fallbackFontUrl,
                                        (font) => {
                                            if (disposed) return;
                                            buildTextMeshes(font);
                                        },
                                        undefined,
                                        () => {
                                            if (!disposed) {
                                                plane.visible = true;
                                                const texture = createTextTexture(cfg.text || "");
                                                if (texture) {
                                                    plane.material.map = texture;
                                                    plane.material.needsUpdate = true;
                                                    fitPlaneToAspect(texture.image.width / texture.image.height);
                                                }
                                            }
                                        }
                                    );
                                }
                            );
                        })
                        .catch(() => {
                            if (!disposed) {
                                plane.visible = true;
                                const texture = createTextTexture(cfg.text || "");
                                if (texture) {
                                    plane.material.map = texture;
                                    plane.material.needsUpdate = true;
                                    fitPlaneToAspect(texture.image.width / texture.image.height);
                                }
                            }
                        });
                } else if (cfg.type === "Imagen") {
                    const loader = new THREE.TextureLoader();
                    loader.setCrossOrigin("anonymous");
                    loader.load(
                        cfg.imageUrl || "",
                        (texture) => {
                            if (disposed) return;
                            texture.colorSpace = THREE.SRGBColorSpace;
                            plane.material.map = texture;
                            plane.material.needsUpdate = true;
                            const backTexture = texture.clone();
                            backTexture.colorSpace = THREE.SRGBColorSpace;
                            backTexture.wrapS = THREE.RepeatWrapping;
                            backTexture.repeat.x = -1;
                            backTexture.offset.x = 1;
                            backTexture.needsUpdate = true;
                            planeBack.material.map = backTexture;
                            planeBack.material.needsUpdate = true;
                            planeBack.visible = true;
                            fitPlaneToAspect(texture.image.width / texture.image.height);
                        },
                        undefined,
                        () => {
                            if (!disposed) container.textContent = "No se pudo cargar la imagen.";
                        }
                    );
                } else if (cfg.type === "Video") {
                    videoEl = document.createElement("video");
                    videoEl.src = cfg.videoUrl || "";
                    videoEl.crossOrigin = "anonymous";
                    videoEl.loop = true;
                    videoEl.muted = true;
                    videoEl.playsInline = true;
                    videoEl.preload = "auto";
                    const texture = new THREE.VideoTexture(videoEl);
                    texture.colorSpace = THREE.SRGBColorSpace;
                    planeBack.visible = false;
                    plane.material = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        opacity: 0.96,
                    });
                    plane.material.needsUpdate = true;

                    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
                    scene.add(ambient);
                    const rim = new THREE.PointLight(0x7ffcff, 1.1);
                    rim.position.set(2.5, 2.2, 3.5);
                    scene.add(rim);

                    portalGroup = new THREE.Group();
                    if (plane.parent) plane.parent.remove(plane);
                    plane.position.z = -0.06;
                    portalGroup.add(plane);

                    const glowTexture = createGlowTexture();
                    if (glowTexture) {
                        const glowMaterial = new THREE.MeshBasicMaterial({
                            map: glowTexture,
                            transparent: true,
                            blending: THREE.AdditiveBlending,
                            depthWrite: false,
                        });
                        portalGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMaterial);
                        portalGlow.position.z = -0.14;
                        portalGroup.add(portalGlow);
                    }

                    portalFrameGroup = new THREE.Group();
                    portalGroup.add(portalFrameGroup);

                    const particleCount = 160;
                    const positions = new Float32Array(particleCount * 3);
                    portalParticleMeta = [];
                    for (let i = 0; i < particleCount; i += 1) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = 0.85 + Math.random() * 0.35;
                        const depth = (Math.random() - 0.5);
                        portalParticleMeta.push({ angle, radius, depth });
                        positions[i * 3] = Math.cos(angle) * radius;
                        positions[i * 3 + 1] = Math.sin(angle) * radius;
                        positions[i * 3 + 2] = depth * 0.4;
                    }
                    const particleGeo = new THREE.BufferGeometry();
                    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
                    const particleMat = new THREE.PointsMaterial({
                        color: 0x7df9ff,
                        size: 0.05,
                        transparent: true,
                        opacity: 0.8,
                        depthWrite: false,
                        blending: THREE.AdditiveBlending,
                    });
                    portalParticles = new THREE.Points(particleGeo, particleMat);
                    portalGroup.add(portalParticles);

                    root.add(portalGroup);
                    fitPlaneToAspect(16 / 9);

                    videoMetadataHandler = () => {
                        if (videoEl.videoWidth && videoEl.videoHeight) {
                            fitPlaneToAspect(videoEl.videoWidth / videoEl.videoHeight);
                        }
                    };
                    videoEl.addEventListener("loadedmetadata", videoMetadataHandler);
                    videoEl.play().catch(() => { });
                    toggleHandler = () => {
                        if (videoEl.paused) {
                            videoEl.muted = false;
                            videoEl.play().catch(() => { });
                        }
                        else videoEl.pause();
                    };
                    container.addEventListener("click", toggleHandler);
                } else if (cfg.type === "Audio") {
                    plane.visible = false;
                    planeBack.visible = false;

                    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
                    scene.add(ambient);
                    const point = new THREE.PointLight(0xffffff, 1.4);
                    point.position.set(2, 3, 4);
                    scene.add(point);

                    const noteMaterial = new THREE.MeshStandardMaterial({
                        color: 0xffd166,
                        emissive: 0xffb703,
                        emissiveIntensity: 0.5,
                        roughness: 0.2,
                        metalness: 0.1,
                    });

                    const note = new THREE.Group();
                    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), noteMaterial);

                    head.position.set(-0.15, -0.1, 0);
                    note.add(head);

                    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12), noteMaterial);
                    stem.position.set(0.1, 0.35, 0);
                    note.add(stem);

                    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.08), noteMaterial);
                    flag.position.set(0.35, 0.68, 0);
                    flag.rotation.z = -0.35;
                    note.add(flag);

                    noteGroup = note;
                    root.add(noteGroup);

                    const listener = new THREE.AudioListener();
                    camera.add(listener);
                    const audio = new THREE.Audio(listener);
                    audioObj = audio;
                    const loader = new THREE.AudioLoader();
                    loader.setCrossOrigin("anonymous");
                    loader.load(
                        cfg.audioUrl || "",
                        (buffer) => {
                            if (disposed) return;
                            audio.setBuffer(buffer);
                            audio.setLoop(true);
                            audio.setVolume(0.6);
                            audioAnalyser = new THREE.AudioAnalyser(audio, 128);
                            audio.play().catch(() => { });
                        },
                        undefined,
                        () => {
                            if (!disposed) container.textContent = "No se pudo cargar el audio.";
                        }
                    );

                    toggleHandler = () => {
                        if (!audio.buffer) return;
                        if (audio.isPlaying) audio.pause();
                        else audio.play().catch(() => { });
                    };
                    container.addEventListener("click", toggleHandler);
                }

                const resize = () => {
                    if (!renderer || !camera || !container) return;
                    const nextWidth = container.clientWidth || 360;
                    const nextHeight = container.clientHeight || 240;
                    renderer.setSize(nextWidth, nextHeight);
                    camera.aspect = nextWidth / nextHeight;
                    camera.updateProjectionMatrix();
                };

                if (window.ResizeObserver) {
                    resizeObserver = new ResizeObserver(resize);
                    resizeObserver.observe(container);
                } else {
                    resizeHandler = () => resize();
                    window.addEventListener("resize", resizeHandler);
                }

                const animate = () => {
                    if (disposed) return;
                    if (enableRootSpin) {
                        root.rotation.y += 0.01;
                    }
                    if (portalGroup) {
                        const now = performance.now();
                        const floatY = Math.sin(now * 0.0011) * 0.06;
                        const floatX = Math.cos(now * 0.0009) * 0.02;
                        portalGroup.position.y = floatY;
                        portalGroup.position.x = floatX;
                        portalGroup.rotation.z = Math.sin(now * 0.0006) * 0.04;
                        portalGroup.rotation.y = Math.cos(now * 0.0005) * 0.04;
                    }
                    if (portalParticles) {
                        portalParticles.rotation.z += 0.002;
                        portalParticles.rotation.y += 0.001;
                    }
                    if (noteGroup && audioAnalyser) {
                        const raw = audioAnalyser.getAverageFrequency() / 255;
                        notePulse += (raw - notePulse) * 0.15;
                        const scale = 1 + notePulse * 0.5;
                        noteGroup.scale.setScalar(scale);
                        noteGroup.position.y = notePulse * 0.35;
                    }
                    frameId = requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                };
                animate();
            })
            .catch(() => {
                if (container) {
                    container.innerHTML = buildStageHtml(stageCfg);
                }
            });

        return cleanup;
    };

    const buildStageHtml = (stageCfg = {}) => {
        const blocks = [];
        const type = stageCfg.type;

        if ((type === "Texto" || type === "Texto3D") && stageCfg.text?.trim()) {
            blocks.push(`<p style="margin:0 0 12px 0; white-space:pre-wrap;">${escapeHtml(stageCfg.text.trim())}</p>`);
        }

        if (type === "Imagen" && stageCfg.imageUrl?.trim()) {
            const url = escapeHtml(stageCfg.imageUrl.trim());
            blocks.push(`<img src="${url}" alt="RA Imagen" style="max-width:100%; border-radius:12px; display:block; margin:8px auto;" />`);
        }

        if (type === "Audio" && stageCfg.audioUrl?.trim()) {
            const url = escapeHtml(stageCfg.audioUrl.trim());
            blocks.push(`<audio controls style="width:100%; margin-top:8px;"><source src="${url}"></audio>`);
        }

        if (type === "Video" && stageCfg.videoUrl?.trim()) {
            const url = escapeHtml(stageCfg.videoUrl.trim());
            blocks.push(`<video controls style="width:100%; border-radius:12px; margin-top:8px;"><source src="${url}"></video>`);
        }

        if (blocks.length > 0) return blocks.join('');

        if (stageCfg.Texto && stageCfg.TextoValor?.trim()) {
            blocks.push(`<p style="margin:0 0 12px 0; white-space:pre-wrap;">${escapeHtml(stageCfg.TextoValor.trim())}</p>`);
        }

        if (stageCfg.Imagen && stageCfg.ImagenUrl?.trim()) {
            const url = escapeHtml(stageCfg.ImagenUrl.trim());
            blocks.push(`<img src="${url}" alt="RA Imagen" style="max-width:100%; border-radius:12px; display:block; margin:8px auto;" />`);
        }

        if (stageCfg.Audio && stageCfg.AudioUrl?.trim()) {
            const url = escapeHtml(stageCfg.AudioUrl.trim());
            blocks.push(`<audio controls style="width:100%; margin-top:8px;"><source src="${url}"></audio>`);
        }

        if (stageCfg.Video && stageCfg.VideoUrl?.trim()) {
            const url = escapeHtml(stageCfg.VideoUrl.trim());
            blocks.push(`<video controls style="width:100%; border-radius:12px; margin-top:8px;"><source src="${url}"></video>`);
        }

        return blocks.join('');
    };

    const buildMultiContentHtml = (stageCfg, ids) => {
        const cfg = normalizeStageConfig(stageCfg);

        const visualElements = [];
        if (cfg.hasText) visualElements.push('text');
        if (cfg.hasImage) visualElements.push('image');
        if (cfg.hasVideo) visualElements.push('video');

        const visualCount = visualElements.length;
        const isAudioOnly = cfg.hasAudio && visualCount === 0;
        const cellStyle = `style="width:100%;height:150px;display:block;"`;

        const textHtml = cfg.hasText ? `
            <div class="ar-multi-text-3d">
                <div id="${ids.textContainerId}" class="ar-three-container" ${cellStyle}></div>
            </div>
        ` : '';

        const imageHtml = cfg.hasImage ? `
            <div class="ar-multi-image">
                <div id="${ids.imageContainerId}" class="ar-three-container" ${cellStyle}></div>
            </div>
        ` : '';

        const videoHtml = cfg.hasVideo ? `
            <div class="ar-multi-video">
                <div id="${ids.videoContainerId}" class="ar-three-container" ${cellStyle}></div>
            </div>
        ` : '';
        const audioHtml = cfg.hasAudio ? (
            isAudioOnly
                ? `<div class="ar-audio-solo">
                        <div class="ar-audio-icon">🎵</div>
                        <audio id="${ids.audioId || 'ar-audio-player'}" controls src="${escapeHtml(cfg.audioUrl)}" class="ar-audio-player"></audio>
                   </div>`
                : `<div class="ar-audio-hidden">
                        <audio id="${ids.audioId || 'ar-audio-player'}" autoplay src="${escapeHtml(cfg.audioUrl)}" class="ar-audio-player-bg"></audio>
                   </div>`
        ) : '';

        if (visualCount === 1) {
            return `
                <div class="ar-layout-single">
                    ${textHtml}${imageHtml}${videoHtml}
                </div>
                ${audioHtml}
            `;
        }

        if (isAudioOnly) {
            return `
                <div class="ar-layout-single">
                    ${audioHtml}
                </div>
            `;
        }

        if (visualCount === 2) {
            if (cfg.hasText && cfg.hasImage) {
                return `
                    <div class="ar-layout-text-top">
                        <div class="ar-row-text">${textHtml}</div>
                        <div class="ar-row-media">${imageHtml}</div>
                    </div>
                    ${audioHtml}
                `;
            }
            if (cfg.hasText && cfg.hasVideo) {
                return `
                    <div class="ar-layout-text-top">
                        <div class="ar-row-text">${textHtml}</div>
                        <div class="ar-row-media">${videoHtml}</div>
                    </div>
                    ${audioHtml}
                `;
            }
            if (cfg.hasImage && cfg.hasVideo) {
                return `
                    <div class="ar-layout-row">
                        ${imageHtml}
                        ${videoHtml}
                    </div>
                    ${audioHtml}
                `;
            }
        }

        if (visualCount === 3) {
            return `
                <div class="ar-layout-three">
                    <div class="ar-row-text">${textHtml}</div>
                    <div class="ar-row-media-pair">
                        ${imageHtml}
                        ${videoHtml}
                    </div>
                </div>
                ${audioHtml}
            `;
        }

        // 4 tipos: texto + imagen + video + audio → grid 2×2
        return `
            <div class="ar-layout-four">
                ${textHtml}
                ${imageHtml}
                ${videoHtml}
                ${audioHtml ? `<div class="ar-audio-solo" style="justify-content:center;">${audioHtml}</div>` : ''}
            </div>
        `;
    };

    const initThreeForType = (container, type, content) => {
        let disposed = false;
        let renderer, scene, camera, frameId, videoEl;
        let portalGroup, portalFrameGroup, portalGlow, portalParticles, portalParticleMeta;
        let enableRootSpin = type !== "Video";

        const cleanup = () => {
            disposed = true;
            if (frameId) cancelAnimationFrame(frameId);
            if (videoEl) {
                videoEl.pause();
                videoEl.src = "";
                videoEl.load();
            }
            if (scene) {
                scene.traverse((obj) => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) {
                        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                        materials.forEach((mat) => {
                            if (mat.map) mat.map.dispose();
                            mat.dispose();
                        });
                    }
                });
            }
            if (renderer) {
                renderer.dispose();
                if (renderer.domElement?.parentNode) {
                    renderer.domElement.parentNode.removeChild(renderer.domElement);
                }
            }
        };

        ensureThree().then((THREE) => {
            if (disposed || !container) return;

            const width = container.clientWidth || 300;
            const height = container.clientHeight || 200;

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
            camera.position.z = type === "Video" ? 3.2 : 2.5;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.outputColorSpace = THREE.SRGBColorSpace;

            container.innerHTML = "";
            container.appendChild(renderer.domElement);

            const root = new THREE.Group();
            scene.add(root);

            if (type === "Texto") {
                const ambient = new THREE.AmbientLight(0xffffff, 1.2);
                scene.add(ambient);
                const dir = new THREE.DirectionalLight(0xffffff, 1.5);
                dir.position.set(2, 3, 4);
                scene.add(dir);

                ensureThreeTextAddons()
                    .then(({ FontLoader, TextGeometry }) => {
                        if (disposed) return;

                        const loader = new FontLoader();
                        const fontUrl = "/fonts/helvetiker_regular.typeface.json";
                        const fallbackFontUrl =
                            "https://cdn.jsdelivr.net/npm/three@0.160.1/examples/fonts/helvetiker_regular.typeface.json";

                        const buildTextMeshes = (font) => {
                            const textGroup = new THREE.Group();
                            root.add(textGroup);

                            const size = 0.3;
                            const depth = 0.08;
                            const lineHeight = size * 1.35;
                            const material = new THREE.MeshStandardMaterial({
                                color: 0xffffff,
                                roughness: 0.1,
                                metalness: 0.0,
                                emissive: 0xffffff,
                                emissiveIntensity: 0.2,
                            });

                            const lines = String(content || "").split(/\r?\n/);
                            const widths = [];

                            lines.forEach((line, index) => {
                                const geometry = new TextGeometry(line || " ", {
                                    font,
                                    size,
                                    height: depth,
                                    curveSegments: 12,
                                    bevelEnabled: true,
                                    bevelThickness: 0.01,
                                    bevelSize: 0.008,
                                    bevelSegments: 3,
                                });
                                geometry.computeBoundingBox();

                                const box = geometry.boundingBox;
                                const geoWidth = box ? box.max.x - box.min.x : 1;
                                widths.push(geoWidth);

                                const mesh = new THREE.Mesh(geometry, material);
                                mesh.position.x = -geoWidth / 2;
                                mesh.position.y = ((lines.length - 1) / 2 - index) * lineHeight;
                                textGroup.add(mesh);
                            });

                            const maxWidth = Math.max(...widths, 1);
                            const targetWidth = 1.4;
                            const scale = maxWidth > 0 ? Math.min(1, targetWidth / maxWidth) : 1;
                            textGroup.scale.setScalar(scale);
                        };

                        loader.load(
                            fontUrl,
                            (font) => !disposed && buildTextMeshes(font),
                            undefined,
                            () => {
                                loader.load(
                                    fallbackFontUrl,
                                    (font) => !disposed && buildTextMeshes(font),
                                    undefined,
                                    () => console.warn("No se pudo cargar la fuente 3D")
                                );
                            }
                        );
                    })
                    .catch(() => console.warn("Error cargando addons de Three.js"));

            } else if (type === "Imagen") {
                const loader = new THREE.TextureLoader();
                loader.setCrossOrigin("anonymous");
                loader.load(content, (texture) => {
                    if (disposed) return;
                    texture.colorSpace = THREE.SRGBColorSpace;
                    const aspect = texture.image.width / texture.image.height;
                    const planeWidth = aspect >= 1 ? 1.8 : 1.8 * aspect;
                    const planeHeight = aspect >= 1 ? 1.8 / aspect : 1.8;

                    const plane = new THREE.Mesh(
                        new THREE.PlaneGeometry(planeWidth, planeHeight),
                        new THREE.MeshBasicMaterial({ map: texture, transparent: true })
                    );
                    root.add(plane);

                    const backTexture = texture.clone();
                    backTexture.colorSpace = THREE.SRGBColorSpace;
                    backTexture.wrapS = THREE.RepeatWrapping;
                    backTexture.repeat.x = -1;
                    backTexture.offset.x = 1;
                    backTexture.needsUpdate = true;

                    const planeBack = new THREE.Mesh(
                        new THREE.PlaneGeometry(planeWidth, planeHeight),
                        new THREE.MeshBasicMaterial({ map: backTexture, transparent: true })
                    );
                    planeBack.rotation.y = Math.PI;
                    root.add(planeBack);
                });

            } else if (type === "Video") {
                const planeBaseSize = 2.8;

                const createGlowTexture = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return null;
                    canvas.width = 256;
                    canvas.height = 256;
                    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
                    grad.addColorStop(0, "rgba(0, 255, 255, 0.45)");
                    grad.addColorStop(0.45, "rgba(0, 200, 255, 0.2)");
                    grad.addColorStop(1, "rgba(0, 140, 255, 0)");
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    const texture = new THREE.CanvasTexture(canvas);
                    texture.colorSpace = THREE.SRGBColorSpace;
                    return texture;
                };

                const portalFrameMaterial = new THREE.MeshStandardMaterial({
                    color: 0x83f3ff,
                    emissive: 0x40e0ff,
                    emissiveIntensity: 0.85,
                    roughness: 0.2,
                    metalness: 0.2,
                    transparent: true,
                    opacity: 0.95,
                });

                const updatePortalFrame = (frameWidth, frameHeight) => {
                    if (!portalFrameGroup) return;

                    portalFrameGroup.children.forEach((child) => {
                        if (child.geometry) child.geometry.dispose();
                    });
                    portalFrameGroup.clear();

                    const thickness = 0.09;
                    const depth = 0.18;
                    const halfW = frameWidth / 2;
                    const halfH = frameHeight / 2;

                    const top = new THREE.Mesh(
                        new THREE.BoxGeometry(frameWidth + thickness * 2, thickness, depth),
                        portalFrameMaterial
                    );
                    top.position.set(0, halfH + thickness / 2, 0);
                    portalFrameGroup.add(top);

                    const bottom = new THREE.Mesh(
                        new THREE.BoxGeometry(frameWidth + thickness * 2, thickness, depth),
                        portalFrameMaterial
                    );
                    bottom.position.set(0, -halfH - thickness / 2, 0);
                    portalFrameGroup.add(bottom);

                    const left = new THREE.Mesh(
                        new THREE.BoxGeometry(thickness, frameHeight, depth),
                        portalFrameMaterial
                    );
                    left.position.set(-halfW - thickness / 2, 0, 0);
                    portalFrameGroup.add(left);

                    const right = new THREE.Mesh(
                        new THREE.BoxGeometry(thickness, frameHeight, depth),
                        portalFrameMaterial
                    );
                    right.position.set(halfW + thickness / 2, 0, 0);
                    portalFrameGroup.add(right);

                    if (portalParticles && portalParticleMeta) {
                        const posAttr = portalParticles.geometry.getAttribute("position");
                        const positions = posAttr.array;
                        const baseRadius = Math.hypot(halfW, halfH) * 1.08;
                        const depthScale = Math.min(0.5, baseRadius * 0.2);
                        for (let i = 0; i < portalParticleMeta.length; i += 1) {
                            const meta = portalParticleMeta[i];
                            const radius = baseRadius * meta.radius;
                            positions[i * 3] = Math.cos(meta.angle) * radius;
                            positions[i * 3 + 1] = Math.sin(meta.angle) * radius;
                            positions[i * 3 + 2] = meta.depth * depthScale;
                        }
                        posAttr.needsUpdate = true;
                        if (portalParticles.material) {
                            portalParticles.material.size = Math.max(0.04, baseRadius * 0.03);
                        }
                    }
                };

                const plane = new THREE.Mesh(
                    new THREE.PlaneGeometry(1, 1),
                    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
                );

                const fitPlaneToAspect = (aspect) => {
                    if (!aspect) return;
                    let planeWidth, planeHeight;
                    if (aspect >= 1) {
                        planeWidth = planeBaseSize;
                        planeHeight = planeBaseSize / aspect;
                    } else {
                        planeWidth = planeBaseSize * aspect;
                        planeHeight = planeBaseSize;
                    }
                    plane.scale.set(planeWidth, planeHeight, 1);
                    if (portalGlow) portalGlow.scale.set(planeWidth * 1.3, planeHeight * 1.3, 1);
                    updatePortalFrame(planeWidth, planeHeight);
                };

                videoEl = document.createElement("video");
                videoEl.src = content;
                videoEl.crossOrigin = "anonymous";
                videoEl.loop = true;
                videoEl.muted = true;
                videoEl.playsInline = true;
                videoEl.preload = "auto";

                const texture = new THREE.VideoTexture(videoEl);
                texture.colorSpace = THREE.SRGBColorSpace;
                plane.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.96,
                });

                const ambient = new THREE.AmbientLight(0xffffff, 0.35);
                scene.add(ambient);
                const rim = new THREE.PointLight(0x7ffcff, 1.1);
                rim.position.set(2.5, 2.2, 3.5);
                scene.add(rim);

                portalGroup = new THREE.Group();
                plane.position.z = -0.06;
                portalGroup.add(plane);

                const glowTexture = createGlowTexture();
                if (glowTexture) {
                    const glowMaterial = new THREE.MeshBasicMaterial({
                        map: glowTexture,
                        transparent: true,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false,
                    });
                    portalGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMaterial);
                    portalGlow.position.z = -0.14;
                    portalGroup.add(portalGlow);
                }

                portalFrameGroup = new THREE.Group();
                portalGroup.add(portalFrameGroup);

                const particleCount = 160;
                const positions = new Float32Array(particleCount * 3);
                portalParticleMeta = [];
                for (let i = 0; i < particleCount; i += 1) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 0.85 + Math.random() * 0.35;
                    const depth = (Math.random() - 0.5);
                    portalParticleMeta.push({ angle, radius, depth });
                    positions[i * 3] = Math.cos(angle) * radius;
                    positions[i * 3 + 1] = Math.sin(angle) * radius;
                    positions[i * 3 + 2] = depth * 0.4;
                }
                const particleGeo = new THREE.BufferGeometry();
                particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
                const particleMat = new THREE.PointsMaterial({
                    color: 0x7df9ff,
                    size: 0.05,
                    transparent: true,
                    opacity: 0.8,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                });
                portalParticles = new THREE.Points(particleGeo, particleMat);
                portalGroup.add(portalParticles);

                root.add(portalGroup);
                fitPlaneToAspect(16 / 9);

                videoEl.addEventListener("loadedmetadata", () => {
                    if (videoEl.videoWidth && videoEl.videoHeight) {
                        fitPlaneToAspect(videoEl.videoWidth / videoEl.videoHeight);
                    }
                });
                videoEl.play().catch(() => { });

                container.addEventListener("click", () => {
                    if (videoEl.paused) {
                        videoEl.muted = false;
                        videoEl.play().catch(() => { });
                    } else {
                        videoEl.pause();
                    }
                });
            }

            const animate = () => {
                if (disposed) return;
                if (enableRootSpin) {
                    root.rotation.y += 0.008;
                }
                if (portalGroup) {
                    const now = performance.now();
                    const floatY = Math.sin(now * 0.0011) * 0.06;
                    const floatX = Math.cos(now * 0.0009) * 0.02;
                    portalGroup.position.y = floatY;
                    portalGroup.position.x = floatX;
                    portalGroup.rotation.z = Math.sin(now * 0.0006) * 0.04;
                    portalGroup.rotation.y = Math.cos(now * 0.0005) * 0.04;
                }
                if (portalParticles) {
                    portalParticles.rotation.z += 0.002;
                    portalParticles.rotation.y += 0.001;
                }
                frameId = requestAnimationFrame(animate);
                renderer.render(scene, camera);
            };
            animate();
        });

        return cleanup;
    };

    const showARStageModal = async (stage, swalOverrides = {}) => {
        if (!arSelectedStages?.[stage]) return true;

        const stageCfg = arConfig?.[stage] ?? {};
        if (!hasStageContent(stageCfg)) return true;
        if (!ensureSwal()) return false;

        const cfg = normalizeStageConfig(stageCfg);
        const timestamp = Date.now();
        const bgId = `cm-ar-bg-${stage}-${timestamp}`;
        const ids = {
            textContainerId: `ar-text-${timestamp}`,
            imageContainerId: `ar-image-${timestamp}`,
            videoContainerId: `ar-video-${timestamp}`,
            audioId: `ar-audio-${timestamp}`,
        };

        const cleanups = [];
        let cleanupSymbols;

        const innerHtml = buildMultiContentHtml(stageCfg, ids);
        const html = cmBuildARDecoratedHtml({
            bgId,
            innerHtml: `<div class="ar-multi-content">${innerHtml}</div>`,
        });

        const res = await window.Swal?.fire({
            html,
            confirmButtonText: "Continuar",
            confirmButtonColor: '#0077b6',
            didOpen: () => {
                const bgEl = document.getElementById(bgId);
                cleanupSymbols = cmCreateFloatingSymbols(bgEl);

                // Esperar 2 frames para que el Swal termine de pintar el layout
                // y clientWidth/clientHeight sean valores reales del grid
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    if (cfg.hasText) {
                        const textContainer = document.getElementById(ids.textContainerId);
                        if (textContainer) {
                            cleanups.push(initThreeForType(textContainer, "Texto", cfg.text));
                        }
                    }
                    if (cfg.hasImage) {
                        const imageContainer = document.getElementById(ids.imageContainerId);
                        if (imageContainer) {
                            cleanups.push(initThreeForType(imageContainer, "Imagen", cfg.imageUrl));
                        }
                    }
                    if (cfg.hasVideo) {
                        const videoContainer = document.getElementById(ids.videoContainerId);
                        if (videoContainer) {
                            cleanups.push(initThreeForType(videoContainer, "Video", cfg.videoUrl));
                        }
                    }
                }));
            },
            willClose: () => {
                cleanups.forEach(cleanup => cleanup && cleanup());
                if (cleanupSymbols) cleanupSymbols();
            },
            ...swalOverrides,
        });

        return !!res?.isConfirmed;
    };


    const toggleARStage = (stage) => {
        setArSelectedStages((prev) => ({ ...prev, [stage]: !prev[stage] }));
    };

    const setARStageField = (stage, field, value) => {
        setArConfig((prev) => ({
            ...prev,
            [stage]: { ...(prev[stage] ?? {}), [field]: value },
        }));
    };

    const MAX_AR_FILE_SIZE_MB = 50;
    const MAX_AR_FILE_SIZE_BYTES = MAX_AR_FILE_SIZE_MB * 1024 * 1024;

    const handleARStageFileChange = (stage, field, file) => {
        const key = `${stage}:${field}`;
        const prevUrl = mediaObjectUrlsRef.current[key];
        if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
            delete mediaObjectUrlsRef.current[key];
        }
        if (!file) {
            setARStageField(stage, field, "");
            return;
        }

        // ── Validación de tamaño máximo (50 MB) ──────────────────────────────
        if (file.size > MAX_AR_FILE_SIZE_BYTES) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            if (ensureSwal()) {
                window.Swal.fire({
                    icon: "warning",
                    title: "Archivo demasiado grande",
                    html: `El archivo <strong>${file.name}</strong> pesa <strong>${sizeMB} MB</strong>.<br/>El límite permitido es <strong>${MAX_AR_FILE_SIZE_MB} MB</strong>.`,
                    confirmButtonColor: "#0077b6",
                    confirmButtonText: "Entendido",
                });
            } else {
                alert(`El archivo "${file.name}" (${sizeMB} MB) supera el límite de ${MAX_AR_FILE_SIZE_MB} MB.`);
            }
            return; // No se asigna el archivo
        }
        // ─────────────────────────────────────────────────────────────────────

        const nextUrl = URL.createObjectURL(file);
        mediaObjectUrlsRef.current[key] = nextUrl;
        setARStageField(stage, field, nextUrl);
    };

    const validateARConfig = () => {
        const enabledStages = AR_STAGES.filter((s) => arSelectedStages[s]);
        if (enabledStages.length === 0) {
            return { ok: false, msg: "Selecciona al menos una etapa de RA (Inicio/Acierto/Final)." };
        }

        for (const stage of enabledStages) {
            const cfg = arConfig?.[stage] ?? {};
            const hasText = !!cfg.text?.trim();
            const hasImage = !!cfg.imageUrl?.trim();
            const hasAudio = !!cfg.audioUrl?.trim();
            const hasVideo = !!cfg.videoUrl?.trim();

            if (!hasText && !hasImage && !hasAudio && !hasVideo) {
                return { ok: false, msg: `Agrega al menos un contenido para la etapa "${stage}".` };
            }
        }

        return { ok: true };
    };

    const buildARStageSummaryHtml = (stage, stageCfg, isEnabled) => {
        const statusText = isEnabled ? "Habilitada" : "Deshabilitada";
        let body = `<p class="ra-empty">No habilitada.</p>`;

        if (isEnabled) {
            const contents = [];

            if (stageCfg?.text?.trim()) {
                contents.push(`<div class="ra-content-item"><span class="ra-icon">📝</span> Texto configurado</div>`);
            }
            if (stageCfg?.imageUrl?.trim()) {
                contents.push(`<div class="ra-content-item"><span class="ra-icon">🖼️</span> Imagen configurada</div>`);
            }
            if (stageCfg?.audioUrl?.trim()) {
                contents.push(`<div class="ra-content-item"><span class="ra-icon">🎵</span> Audio configurado</div>`);
            }
            if (stageCfg?.videoUrl?.trim()) {
                contents.push(`<div class="ra-content-item"><span class="ra-icon">🎬</span> Video configurado</div>`);
            }

            body = contents.length > 0
                ? contents.join("")
                : `<p class="ra-empty">Sin contenido configurado.</p>`;
        }

        return `
      <div class="ra-card ${isEnabled ? "is-on" : "is-off"}">
        <div class="ra-card-head">
          <span class="ra-title">${escapeHtml(stage)}</span>
          <span class="ra-status">${statusText}</span>
        </div>
        <div class="ra-card-body">${body}</div>
      </div>
    `;
    };

    const buildARConfigSummaryHtml = () => {
        const cards = AR_STAGES.map((stage) => {
            const enabled = !!arSelectedStages?.[stage];
            const cfg = arConfig?.[stage] ?? {};
            return buildARStageSummaryHtml(stage, cfg, enabled);
        }).join("");

        return `
      <style>
        .ra-summary { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); text-align: left; }
        .ra-card { border: 1px solid rgba(2, 62, 138, 0.18); border-radius: 14px; padding: 14px; background: #ffffff; }
        .ra-card.is-off { opacity: 0.7; }
        .ra-card-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; }
        .ra-title { font-weight: 700; color: #023e8a; }
        .ra-status { font-size: 0.8rem; color: #0077b6; background: rgba(0,119,182,0.12); padding: 2px 8px; border-radius: 999px; }
        .ra-card.is-off .ra-status { color: #023e8a; background: rgba(2,62,138,0.08); }
        .ra-card-body { color: #023e8a; font-size: 0.9rem; }
        .ra-text { margin: 0; white-space: pre-wrap; }
        .ra-empty { margin: 0; color: rgba(2, 62, 138, 0.6); }
        .ra-media, .ra-video { width: 100%; border-radius: 10px; display: block; }
        .ra-audio { width: 100%; }
        .ra-content-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid rgba(2, 62, 138, 0.1); }
        .ra-content-item:last-child { border-bottom: none; }
        .ra-icon { font-size: 1.1rem; }
      </style>
      <div class="ra-summary">${cards}</div>
    `;
    };

    const showARConfigSummaryModal = async () => {
        if (!ensureSwal()) return true;

        const html = buildARConfigSummaryHtml();
        const res = await window.Swal.fire({
            title: "Configuracion RA",
            html,
            width: 900,
            confirmButtonText: "Continuar",
            showCancelButton: true,
            cancelButtonText: "Editar",
            confirmButtonColor: '#0077b6',
        });

        return !!res?.isConfirmed;
    };

    const saveARConfigAndContinue = async () => {
        const validation = validateARConfig();
        if (!validation.ok) {
            if (ensureSwal()) {
                await window.Swal.fire("Atención", validation.msg, "warning");
            } else {
                alert(validation.msg);
            }
            return;
        }

        localStorage.setItem(LS.stages, JSON.stringify(arSelectedStages));
        localStorage.setItem(LS.config, JSON.stringify(arConfig));
        setSetupStep("ar-summary");
        navigate(location.pathname + location.search, {
            replace: true,
            state: { ...location.state, setupStep: 'ar-summary' }
        });
    };

    const MAX_EXERCISES_PER_LEVEL = {
        basico: 3,
        intermedio: 4,
        avanzado: 5,
    };

    const [gameState, setGameState] = useState('config');
    const [config, setConfig] = useState({ level: 'basico', exerciseCount: 1 });
    const [gameData, setGameData] = useState({ exercises: [], currentStep: 0, score: 0 });
    const [operationText, setOperationText] = useState('');
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [availableCount, setAvailableCount] = useState(0);


    const levels = [...new Set(exerciseData.map(ej => ej.nivel))];

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        const maxAllowed = MAX_EXERCISES_PER_LEVEL[config.level] ?? 3;
        setAvailableCount(maxAllowed);
        if (config.exerciseCount > maxAllowed) {
            setConfig(prev => ({ ...prev, exerciseCount: maxAllowed }));
        }
    }, [config.level]);

    const goToSummary = () => {
        if (!ensureSwal()) return;

        if (arEnabled && setupStep === "ar") {
            window.Swal.fire("Atención", "Primero completa la Configuración de RA.", "warning");
            return;
        }

        localStorage.setItem(LS_KEYS.gameConfig, JSON.stringify(config));

        setGameState("summary");
        navigate("/settings?view=Summary", {
            replace: true,
            state: {
                ...location.state,
                gameType: "calculoMental",
                gameConfig: {
                    level: config.level,
                    exerciseCount: config.exerciseCount,
                },
                arNamespace: STORAGE_NS,
                arSelectedStages: arEnabled ? arSelectedStages : { Inicio: false, Acierto: false, Final: false },
                arConfig: arEnabled ? arConfig : {},
            },
        });
    };

    const returnToConfig = () => {
        setGameState('config');
        setSetupStep('game');
        navigate(location.pathname + location.search, {
            replace: true,
            state: { ...location.state, setupStep: 'game' }
        });
    };


    const handleShowPreview = () => {
        localStorage.setItem(LS_KEYS.gameConfig, JSON.stringify(config));

        setGameState("welcome");
        setSetupStep("preview");
        navigate(location.pathname + location.search, {
            replace: true,
            state: { ...location.state, setupStep: 'preview' }
        });
    };

    const handleStartGame = async () => {
        localStorage.removeItem(LS_KEYS.arSelectedStages);
        localStorage.removeItem(LS_KEYS.arConfig);
        localStorage.removeItem(LS.stages);
        localStorage.removeItem(LS.config);

        const ok = await showARStageModal('Inicio', {
            confirmButtonText: 'Comenzar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0077b6',
        });
        if (!ok) return;

        const filteredExercises = exerciseData.filter(ej => ej.nivel === config.level);
        const selectedExercises = filteredExercises.sort(() => Math.random() - 0.5).slice(0, config.exerciseCount);

        if (selectedExercises.length > 0) {
            setGameData({ exercises: selectedExercises, currentStep: 0, score: 0 });
            displayAROperation(0, selectedExercises);
        } else {
            window.Swal?.fire('Error', 'No hay ejercicios disponibles para este nivel.', 'error');
            setGameState('config');
        }
    };


    const LEVEL_TOKEN_SPEED = { basico: 1200, intermedio: 800, avanzado: 450 };
    const LEVEL_ANSWER_TIME = { basico: 20, intermedio: 15, avanzado: 10 };

    // DESPUÉS
    const answerTimerRef = useRef(null);
    const tokenIntervalRef = useRef(null);
    const [answerTimeLeft, setAnswerTimeLeft] = useState(null);

    // DESPUÉS
    const clearAnswerTimer = () => {
        if (answerTimerRef.current) {
            clearInterval(answerTimerRef.current);
            answerTimerRef.current = null;
        }
        setAnswerTimeLeft(null);
    };

    const stopGame = () => {
        // Detiene el intervalo de tokens
        if (tokenIntervalRef.current) {
            clearInterval(tokenIntervalRef.current);
            tokenIntervalRef.current = null;
        }
        // Detiene el timer de respuesta
        clearAnswerTimer();
        // Cierra cualquier Swal abierto
        window.Swal?.close();
        // Resetea el estado del juego
        setGameState('welcome');
        setOperationText('');
        setSelectedOption(null);
        setShuffledOptions([]);
        setGameData({ exercises: [], currentStep: 0, score: 0 });
    };

    const startAnswerTimer = (exercises, step) => {
        clearAnswerTimer();
        const seconds = LEVEL_ANSWER_TIME[config.level] ?? 10;
        let remaining = seconds;
        setAnswerTimeLeft(remaining);
        answerTimerRef.current = setInterval(() => {
            remaining--;
            setAnswerTimeLeft(remaining);
            if (remaining <= 0) {
                clearAnswerTimer();
                const correct = exercises[step].options.find(o => o.isCorrect);
                if (ensureSwal()) {
                    window.Swal.fire({
                        title: '⏰ ¡Tiempo agotado!',
                        html: 'La respuesta era: <b>' + correct?.text + '</b>',
                        icon: 'error',
                        confirmButtonText: 'Continuar',
                        timer: 3000,
                        confirmButtonColor: '#0077b6',
                        customClass: { popup: 'swal-cm-popup' },
                    }).then(() => {
                        const nextStep = step + 1;
                        if (nextStep < exercises.length) {
                            setGameData(prev => ({ ...prev, currentStep: nextStep }));
                            displayAROperation(nextStep, exercises);
                        } else {
                            goToSummary();
                        }
                    });
                }
            }
        }, 1000);
    };

    const displayAROperation = (step, exercises) => {
        setGameState('playing');
        setSelectedOption(null);
        setShuffledOptions([]);
        setOperationText('');
        clearAnswerTimer();

        const currentExercise = exercises[step];
        const operationString = currentExercise.operation.replace(/,/g, '');
        const parts = operationString.match(/(\d+|[+\-×÷*/])/g) || [];
        let i = 0;
        const speed = LEVEL_TOKEN_SPEED[config.level] ?? 800;
        // DESPUÉS
        if (tokenIntervalRef.current) {
            clearInterval(tokenIntervalRef.current);
            tokenIntervalRef.current = null;
        }
        tokenIntervalRef.current = setInterval(() => {
            if (i < parts.length) {
                setOperationText(parts[i]);
                i++;
            } else {
                clearInterval(tokenIntervalRef.current);
                tokenIntervalRef.current = null;
                setOperationText('¿Listo? ¡Puedes responder!');
                setShuffledOptions([...currentExercise.options].sort(() => Math.random() - 0.5));
                setGameState('answering');
                startAnswerTimer(exercises, step);
            }
        }, speed);
    };

    const handleValidate = async () => {
        clearAnswerTimer();
        if (!selectedOption) {
            if (ensureSwal()) {
                window.Swal.fire({
                    title: 'Atención',
                    text: 'Por favor, selecciona una opcion.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#0077b6',
                    customClass: { popup: 'swal-cm-popup' },
                });
            } else {
                alert('Por favor, selecciona una opcion.');
            }
            return;
        }

        const isCorrect = selectedOption.isCorrect;
        const newScore = isCorrect ? gameData.score + 10 : gameData.score;
        setGameData(prev => ({ ...prev, score: newScore }));

        const isLastQuestion = gameData.currentStep === gameData.exercises.length - 1;

        // DESPUÉS
        const correctText = gameData.exercises[gameData.currentStep]?.options.find(o => o.isCorrect)?.text ?? '';

        if (isCorrect) {
            if (!ensureSwal()) return;

            const hasARacierto = arEnabled && arSelectedStages?.['Acierto'] && hasStageContent(arConfig?.['Acierto'] ?? {});

            let continuar = false;

            if (hasARacierto) {
                // ── Modal RA de acierto (prioridad) ──
                const stageCfg = arConfig?.Acierto ?? {};
                const cfg = normalizeStageConfig(stageCfg);
                const timestamp = Date.now();
                const cleanups = [];
                let cleanupSymbols;
                let cameraStream;
                const bgId = `cm-ar-bg-acierto-${timestamp}`;
                const cameraVideoId = `cm-ar-video-acierto-${timestamp}`;
                const ids = {
                    textContainerId: `ar-text-acierto-${timestamp}`,
                    imageContainerId: `ar-image-acierto-${timestamp}`,
                    videoContainerId: `ar-video-acierto-${timestamp}`,
                    audioId: `ar-audio-acierto-${timestamp}`,
                };
                const innerHtml = buildMultiContentHtml(stageCfg, ids);
                const html = cmBuildARDecoratedHtml({
                    bgId,
                    topHtml: `<div class="cm-ar-top" style="font-size:1.5rem;">+10 Puntos 🎉</div>`,
                    innerHtml: `<div class="ar-multi-content">${innerHtml}</div>`,
                    useCamera: true,
                    videoId: cameraVideoId,
                });
                const result = await window.Swal.fire({
                    html,
                    showCancelButton: true,
                    confirmButtonText: isLastQuestion ? '🏆 Ver Resultado' : '➡️ Siguiente ejercicio',
                    cancelButtonText: 'Finalizar juego',
                    confirmButtonColor: '#0077b6',
                    didOpen: async () => {
                        cameraStream = await startCamera(cameraVideoId);
                        const bgEl = document.getElementById(bgId);
                        cleanupSymbols = cmCreateFloatingSymbols(bgEl);
                        if (cfg.hasText) {
                            const el = document.getElementById(ids.textContainerId);
                            if (el) cleanups.push(initThreeForType(el, "Texto", cfg.text));
                        }
                        if (cfg.hasImage) {
                            const el = document.getElementById(ids.imageContainerId);
                            if (el) cleanups.push(initThreeForType(el, "Imagen", cfg.imageUrl));
                        }
                        if (cfg.hasVideo) {
                            const el = document.getElementById(ids.videoContainerId);
                            if (el) cleanups.push(initThreeForType(el, "Video", cfg.videoUrl));
                        }
                    },
                    willClose: () => {
                        cleanups.forEach(c => c && c());
                        if (cleanupSymbols) cleanupSymbols();
                        if (cameraStream) stopCamera(cameraStream);
                    },
                });
                continuar = !!result?.isConfirmed;
            } else {
                // ── Modal de acierto estilizado sin RA ──
                const result = await window.Swal.fire({
                    html: `
                        <div style="background:linear-gradient(145deg,#03045e 0%,#023e8a 50%,#0077b6 100%);
                                    border-radius:20px;padding:2rem 1.5rem;text-align:center;position:relative;overflow:hidden;">
                          <div style="position:absolute;inset:0;pointer-events:none;
                            background:radial-gradient(circle at 20% 20%,rgba(255,255,255,0.08) 0%,transparent 50%),
                                       radial-gradient(circle at 80% 80%,rgba(255,255,255,0.08) 0%,transparent 50%);">
                          </div>
                          <div style="font-size:3.5rem;margin-bottom:0.5rem;">🎉</div>
                          <div style="color:#ffd60a;font-size:1.6rem;font-weight:800;margin-bottom:0.5rem;
                                      text-shadow:0 2px 12px rgba(0,0,0,0.5);">¡Correcto!</div>
                          <div style="color:#caf0f8;font-size:1rem;margin-bottom:0.5rem;">La respuesta era:</div>
                          <div style="color:#ffffff;font-size:1.5rem;font-weight:800;
                                      background:rgba(255,255,255,0.12);border-radius:10px;
                                      padding:0.5rem 1rem;display:inline-block;">
                            ${correctText}
                          </div>
                          <div style="color:#90e0ef;font-size:0.9rem;margin-top:1rem;font-weight:600;">
                            +10 puntos 🔑
                          </div>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: isLastQuestion ? '🏆 Ver Resultado' : '➡️ Siguiente ejercicio',
                    cancelButtonText: 'Finalizar juego',
                    confirmButtonColor: '#0077b6',
                });
                continuar = !!result?.isConfirmed;
            }

            if (continuar) handleNextStep();
            else handleBackToGenerator();

        } else {
            // ── Modal de error (siempre, con o sin RA) ──
            if (!ensureSwal()) return;
            const result = await window.Swal.fire({
                html: `
                    <div style="background:linear-gradient(145deg,#4a0000 0%,#7f1d1d 50%,#b91c1c 100%);
                                border-radius:20px;padding:2rem 1.5rem;text-align:center;position:relative;overflow:hidden;">
                      <div style="position:absolute;inset:0;pointer-events:none;
                        background:radial-gradient(circle at 20% 20%,rgba(255,255,255,0.06) 0%,transparent 50%),
                                   radial-gradient(circle at 80% 80%,rgba(255,255,255,0.06) 0%,transparent 50%);">
                      </div>
                      <div style="font-size:3.5rem;margin-bottom:0.5rem;">❌</div>
                      <div style="color:#fca5a5;font-size:1.6rem;font-weight:800;margin-bottom:0.5rem;
                                  text-shadow:0 2px 12px rgba(0,0,0,0.5);">¡Incorrecto!</div>
                      <div style="color:#fecaca;font-size:1rem;margin-bottom:0.5rem;">La respuesta correcta era:</div>
                      <div style="color:#ffffff;font-size:1.5rem;font-weight:800;
                                  background:rgba(255,255,255,0.12);border-radius:10px;
                                  padding:0.5rem 1rem;display:inline-block;">
                        ${correctText}
                      </div>
                      <div style="color:#fca5a5;font-size:0.9rem;margin-top:1rem;font-weight:600;">
                        Tu respuesta: <span style="color:#ffffff;">${selectedOption?.text ?? '—'}</span>
                      </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: '🔄 Reiniciar juego',
                cancelButtonText: 'Finalizar juego',
                confirmButtonColor: '#b91c1c',
            });
            if (result?.isConfirmed) handleBackToGenerator(true);
            else handleBackToGenerator();
        }
    };

    const handleNextStep = async () => {
        const nextStep = gameData.currentStep + 1;
        if (nextStep < gameData.exercises.length) {
            setGameData(prev => ({ ...prev, currentStep: nextStep }));
            displayAROperation(nextStep, gameData.exercises);
        } else {
            setGameState('finished');

            if (!ensureSwal()) return;
            const stageCfg = arConfig?.Final ?? {};
            const cfg = normalizeStageConfig(stageCfg);
            const hasAR = hasStageContent(stageCfg);
            const timestamp = Date.now();
            const cleanups = [];
            let cleanupSymbols;
            const bgId = `cm-ar-bg-final-${timestamp}`;
            const ids = {
                textContainerId: `ar-text-final-${timestamp}`,
                imageContainerId: `ar-image-final-${timestamp}`,
                videoContainerId: `ar-video-final-${timestamp}`,
                audioId: `ar-audio-final-${timestamp}`,
            };

            const innerHtml = hasAR ? buildMultiContentHtml(stageCfg, ids) : '';
            const html = cmBuildARDecoratedHtml({
                bgId,
                topHtml: `<div class="cm-ar-top" style="font-size:1.5rem;">Puntuación Final: ${gameData.score + (selectedOption.isCorrect ? 10 : 0)}</div>`,
                innerHtml: `<div class="ar-multi-content">${innerHtml}</div>`,
            });

            const result = await window.Swal.fire({
                title: 'Juego Completado',
                html,
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Terminar Configuracion',
                cancelButtonText: 'Volver a Jugar',
                confirmButtonColor: '#0077b6',
                customClass: { popup: 'swal-cm-popup' },
                // ... didOpen y willClose sin cambios
                didOpen: () => {
                    const bgEl = document.getElementById(bgId);
                    cleanupSymbols = cmCreateFloatingSymbols(bgEl);

                    if (cfg.hasText) {
                        const textContainer = document.getElementById(ids.textContainerId);
                        if (textContainer) {
                            cleanups.push(initThreeForType(textContainer, "Texto", cfg.text));
                        }
                    }

                    if (cfg.hasImage) {
                        const imageContainer = document.getElementById(ids.imageContainerId);
                        if (imageContainer) {
                            cleanups.push(initThreeForType(imageContainer, "Imagen", cfg.imageUrl));
                        }
                    }

                    if (cfg.hasVideo) {
                        const videoContainer = document.getElementById(ids.videoContainerId);
                        if (videoContainer) {
                            cleanups.push(initThreeForType(videoContainer, "Video", cfg.videoUrl));
                        }
                    }
                },
                willClose: () => {
                    cleanups.forEach(cleanup => cleanup && cleanup());
                    if (cleanupSymbols) cleanupSymbols();
                },
            });

            if (result?.isConfirmed) goToSummary();
            else handleBackToGenerator(true);
        }
    };

    const handleBackToGenerator = (restart = false) => {
        setGameState(restart ? 'welcome' : 'config');
        setOperationText('');
        setSelectedOption(null);
        setGameData({ exercises: [], currentStep: 0, score: 0 });
        if (restart) {
            handleStartGame();
        }
    };

    const renderPreviewArea = () => {
        switch (gameState) {
            // DESPUÉS
            case 'welcome':
                return (
                    <div className="game-container welcome">
                        <h2>Bienvenido al juego de Cálculo Mental</h2>
                        <p>Observa como se juega</p>
                    </div>
                );
            case 'playing':
            case 'answering': {
                const isAnswering = gameState === 'answering';
                return (
                    <div className="pv-game-layout">
                        {/* Columna izquierda — juego */}
                        <div className="pv-left-col">
                            <div className="pv-progress-bar-wrap">
                                <div className="pv-progress-bar-fill" style={{ width: `${(gameData.currentStep / (gameData.exercises.length || 1)) * 100}%` }}></div>
                            </div>
                            <div className="pv-question-card">
                                <div className="pv-question-prompt">
                                    {isAnswering ? '¿Cuál es el resultado?' : 'Memoriza los números...'}
                                </div>
                                <div className="pv-operation-display">{operationText}</div>
                                {isAnswering && answerTimeLeft !== null && (
                                    <div style={{
                                        fontSize: '1rem', fontWeight: 700,
                                        color: answerTimeLeft <= 3 ? '#ef4444' : '#0077b6',
                                        textAlign: 'center', marginTop: '0.5rem',
                                        fontFamily: 'Nunito, sans-serif',
                                    }}>⏱ {answerTimeLeft}s</div>
                                )}
                            </div>
                            {isAnswering && (
                                <>
                                    <div className="pv-options-grid">
                                        {shuffledOptions.map((option, index) => (
                                            <button
                                                key={index}
                                                className={`pv-option-btn ${selectedOption === option ? 'selected' : ''}`}
                                                onClick={() => setSelectedOption(option)}
                                            >{option.text}</button>
                                        ))}
                                    </div>
                                    <button className="game-btn success" onClick={handleValidate} disabled={!selectedOption}>Validar Resultado</button>
                                </>
                            )}
                        </div>
                        {/* Columna derecha — sidebar */}
                        {/* Columna derecha — sidebar */}
                        <div className="pv-right-col">
                            <div className="pv-stats-block">
                                <h3>Progreso</h3>
                                <div className="pv-stats-item"><span>Ejercicio:</span><strong>{gameData.currentStep + 1}/{gameData.exercises.length}</strong></div>
                                <div className="pv-stats-item"><span>Puntaje:</span><strong>{gameData.score}</strong></div>
                                <div className="pv-stats-item"><span>Nivel:</span><strong>{config.level.charAt(0).toUpperCase() + config.level.slice(1)}</strong></div>
                            </div>

                            {/* ── Botón Finalizar Juego con modal de confirmación ── */}
                            <button
                                className="main-btn"
                                style={{
                                    marginTop: '0.75rem',
                                    width: '100%',
                                    background: '#1f2937',
                                    padding: '0.75rem',
                                    fontSize: '1rem',
                                }}
                                onClick={async () => {
                                    if (!ensureSwal()) return;

                                    // Inyectar estilos ANTES de abrir para garantizar que apliquen
                                    const styleEl = document.createElement('style');
                                    styleEl.id = 'swal-finalizar-override';
                                    styleEl.textContent = `
        body > .swal2-container.swal2-backdrop-show {
            background: rgba(0,0,0,0.55) !important;
            backdrop-filter: blur(3px) !important;
        }
        .swal2-popup.swal-finalizar-popup {
            background: #ffffff !important;
            border-radius: 16px !important;
            box-shadow: 0 24px 64px rgba(0,0,0,0.22) !important;
            padding: 2rem 2rem 1.5rem !important;
            max-width: 420px !important;
            font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
        }
        .swal2-popup.swal-finalizar-popup .swal2-icon {
            border-color: #0077b6 !important;
            color: #0077b6 !important;
        }
        .swal2-popup.swal-finalizar-popup .swal2-title {
            color: #1f2937 !important;
            font-size: 1.4rem !important;
            font-weight: 700 !important;
            font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
            background: transparent !important;
        }
        .swal2-popup.swal-finalizar-popup .swal2-html-container,
        .swal2-popup.swal-finalizar-popup .swal2-content {
            color: #4b5563 !important;
            font-size: 1rem !important;
            font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
            background: transparent !important;
        }
        .swal2-popup.swal-finalizar-popup .swal2-actions {
            gap: 0.75rem !important;
            margin-top: 1.25rem !important;
        }
        .swal2-popup.swal-finalizar-popup .swal2-confirm {
            background: #1f2937 !important;
            color: #ffffff !important;
            border: none !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            padding: 0.7rem 1.6rem !important;
            font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
            box-shadow: none !important;
        }
        .swal2-popup.swal-finalizar-popup .swal2-cancel {
            background: #0077b6 !important;
            color: #ffffff !important;
            border: none !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            padding: 0.7rem 1.6rem !important;
            font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
            box-shadow: none !important;
        }
        .swal2-popup.swal-finalizar-popup .swal2-confirm:hover {
            background: #374151 !important;
        }
        .swal2-popup.swal-finalizar-popup .swal2-cancel:hover {
            background: #005f92 !important;
        }
    `;
                                    document.head.appendChild(styleEl);

                                    const result = await window.Swal.fire({
                                        title: '¿Finalizar juego?',
                                        text: 'Volverás a la configuración de vista previa.',
                                        icon: 'question',
                                        showCancelButton: true,
                                        confirmButtonText: 'Sí, finalizar',
                                        cancelButtonText: 'Continuar jugando',
                                        customClass: { popup: 'swal-finalizar-popup' },
                                        buttonsStyling: false,   // ← clave: desactiva estilos internos de Swal
                                    });

                                    // Limpiar estilos inyectados
                                    document.getElementById('swal-finalizar-override')?.remove();

                                    if (result.isConfirmed) {
                                        setGameState('config');
                                        setOperationText('');
                                        setSelectedOption(null);
                                        setGameData({ exercises: [], currentStep: 0, score: 0 });
                                    }
                                }}
                            >
                                Finalizar Juego
                            </button>
                        </div>
                    </div>
                );
            }

            case 'config':
            default:
                return <div className="game-container placeholder">Selecciona tus opciones y presiona "Vista Previa" para comenzar.</div>;
        }
    };

    const AnimatedTitle = () => (
        <div className="animated-title-container">
            <h1 className="animated-title">
                {'Juego de Cálculo Mental'.split('').map((char, index) => (
                    <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </h1>
            <div className="floating-icons">
                <span className="icon-1">+</span>
                <span className="icon-2">×</span>
                <span className="icon-3">-</span>
                <span className="icon-4">÷</span>
            </div>
        </div>
    );
    return (
        <>
            <style>{`
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
:root {
    --primary-color: #005f92;
    --secondary-color: #1f2937;
    --success-color: #22c55e;
    --danger-color: #ef4444;
    --light-color: #f3f4f6;
    --dark-color: #111827;
    --bg-color: #f0f2f5;
    --font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif;

    .swal2-popup.swal-cm-popup {
    font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
    background: #ffffff !important;
    border-radius: 16px !important;
}
.swal2-popup.swal-cm-popup .swal2-title {
    font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
    color: #1f2937 !important;
    font-weight: 700 !important;
}
.swal2-popup.swal-cm-popup .swal2-html-container,
.swal2-popup.swal-cm-popup .swal2-content {
    font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
    color: #4b5563 !important;
}
.swal2-popup.swal-cm-popup .swal2-confirm,
.swal2-popup.swal-cm-popup .swal2-cancel {
    font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
}
}
* { font-family: var(--font-family) !important; }

                /* DESPUÉS: */
.app-layout {
    display: flex;
    gap: 2rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto 2rem auto;
    max-height: 100%;
    padding: 2rem 2rem 0 2rem;
    box-sizing: border-box;
}

                .app-layout.single-panel {
                    justify-content: center;
                }

                .config-panel, .preview-panel {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.1);
                }

                .config-panel {
                    flex: 1;
                }

                .config-panel.full-width,
                .preview-panel.full-width {
                    flex: none;
                    width: 100%;
                }

                .preview-panel {
                    flex: 2;
                    display: flex;
                    flex-direction: column;
                }

                .preview-content {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 300px;
                }

                .button-group {
                    display: grid;
                    width: 100%;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 1rem;
                    margin-top: 1.5rem;
                    justify-content: centar;
                }

                .button-group > :only-child {
                    grid-column: 1 / -1;      
                    justify-self: center;       
                    width: min(360px, 100%);   
                }

                .game-btn.secondary {
                    background-color: white;
                    color: var(--primary-color);
                    border: 2px solid var(--primary-color);
                }

                .game-btn.secondary:hover {
                    background-color: rgba(0, 123, 255, 0.05);
                }
                
                h2 {
                    color: var(--primary-color);
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                .animated-title-container {
    position: relative;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
}
.animated-title {
    text-align: center;
    font-size: 3rem;
    font-weight: 700;
    color: var(--secondary-color);
    margin-bottom: 0.25rem;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    font-family: 'Merriweather', serif;
}
.animated-title span {
    display: inline-block;
    animation: waveTitle 1.8s infinite;
    position: relative;
}
@keyframes waveTitle {
    0%, 40%, 100% { transform: translateY(0); }
    20% { transform: translateY(-20px); }
}
                }

                .floating-icons span {
                    position: absolute;
                    color: var(--primary-color);
                    opacity: 0.3;
                    font-size: 1.5rem;
                    font-weight: 700;
                    animation: float 4s ease-in-out infinite;
                }

                .floating-icons .icon-1 { top: -20px; left: 10%; animation-delay: 0s; }
                .floating-icons .icon-2 { top: 0; right: 10%; animation-delay: 1s; }
                .floating-icons .icon-3 { bottom: 0px; left: 20%; animation-delay: 2s; }
                .floating-icons .icon-4 { bottom: -10px; right: 20%; animation-delay: 3s; }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }


                .form-section {
                    margin-bottom: 1.5rem;
                }

                .form-section label {
                    display: block;
                
                }

                .ra-config {
                    margin-top: 1rem;
                }

                .ra-stage-list {
                    display: grid;
                    gap: 14px;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    max-height: 100%;
                    overflow-y: auto;
                    padding-right: 8px;
                }

                .ra-stage-card {
                    border: 1px solid rgba(2, 62, 138, 0.15);
                    border-radius: 14px;
                    padding: 12px 14px;
                    background: #ffffff;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease,
                        transform 0.2s ease;
                }

                .ra-stage-card.is-active {
                    border-color: var(--primary-color);
                    box-shadow: 0 10px 24px rgba(0, 119, 182, 0.2);
                    background: linear-gradient(
                        160deg,
                        rgba(0, 119, 182, 0.08),
                        rgba(255, 255, 255, 0.95)
                    );
                }

                .ra-stage-toggle {
                    display: flex;
                    gap: 0.6rem;
                    align-items: center;
                    font-weight: 600;
                    color: var(--dark-color);
                }

                .ra-stage-toggle input {
                    accent-color: var(--primary-color);
                }

                .ra-stage-body {
                    margin-top: 0.75rem;
                    padding-left: 0.5rem;
                    display: grid;
                    gap: 0.6rem;
                }

                .ra-field-label {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--dark-color);
                }

                .ra-field {
                    width: 100%;
                    padding: 0.65rem 0.75rem;
                    border: 1px solid rgba(2, 62, 138, 0.2);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-family: var(--font-family);
                    background: #ffffff;
                }

                .ra-field:focus {
                    outline: 2px solid rgba(0, 119, 182, 0.3);
                    border-color: var(--primary-color);
                }

                .ra-preview-btn {
                    align-self: start;
                    background-color: rgba(0, 119, 182, 0.1);
                    color: var(--dark-color);
                    border: 1px solid rgba(0, 119, 182, 0.3);
                }

                .ra-preview-btn:hover {
                    background-color: rgba(0, 119, 182, 0.18);
                }

                .ra-three-wrap {
                    width: 100%;
                    height: 240px;
                    border: 1px solid rgba(2, 62, 138, 0.15);
                    border-radius: 12px;
                    background: #f6fbff;
                    overflow: hidden;
                }

                .ra-three-canvas {
                    width: 100%;
                    height: 100%;
                }

                .cm-ar-bg {
                    position: relative;
                    min-height: 220px;
                    width: 100%;
                    background: linear-gradient(135deg, #0077b6 0%, #023e8a 100%);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.2rem;
                    padding: 1.2rem 0;
                    border-radius: 28px;
                }

                .cm-ar-bg-camera {
                    background: transparent;
                }

                .cm-ar-camera-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: 0;
                    border-radius: 28px;
                }

                .cm-ar-bg-elements {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
                    pointer-events: none;
                }

                .cm-ar-content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    padding: 0 1rem;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .cm-ar-three-wrap {
                    width: 100%;
                    height: 320px;
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                    border-radius: 0.5rem;
                    background: transparent;
                }
                .cm-ar-top {
                    color: #ffd60a;
                    font-weight: 800;
                    text-shadow: 2px 2px 8px #3a0ca3, 0 0 20px rgba(0,0,0,0.8);
                    text-align: center;
                    background: rgba(0, 0, 0, 0.4);
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    backdrop-filter: blur(5px);
                }
               select, input[type="number"], input[type="text"] {
                    width: 100%;
                    padding: 0.85rem 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-family: var(--font-family);
                    color: #1e293b;
                    background: #f8fafc;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    appearance: none;
                    -webkit-appearance: none;
                }
                select:focus, input[type="number"]:focus, input[type="text"]:focus {
                    border-color: var(--primary-color);
                    background: #ffffff;
                    box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.12);
                }
                select:hover, input[type="number"]:hover, input[type="text"]:hover {
                    border-color: #94a3b8;
                    background: #ffffff;
                }
                select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%230077b6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    padding-right: 2.5rem;
                    cursor: pointer;
                }
                .form-section label {
                    display: block;
                    font-weight: 700;
                    font-size: 0.92rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--primary-color);
                    margin-bottom: 0.6rem;
                
                }

                .main-btn {
                    padding: 0.75rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border: none !important;
                    border-radius: 8px;
                    cursor: pointer;
                    background-color: var(--primary-color) !important;
                    background-image: none !important;
                    color: white !important;
                    box-shadow: none !important;
                    transition: background-color 0.3s, opacity 0.2s;
                    appearance: auto;
                    -webkit-appearance: auto;
                }
                .main-btn:hover {
                    background-color: #005f92 !important;
                    border-color: transparent !important;
                }
                .main-btn:focus {
                    box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.25) !important;
                    border-color: transparent !important;
                }
                .game-container {
                    border: none;
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    background-color: #ffffff;
                }

                .game-container.placeholder {
                    color: var(--secondary-color);
                }
                
                .game-container.welcome h2 { margin-bottom: 0.5rem; }
                .game-container.welcome p { margin-bottom: 2rem; color: var(--secondary-color); }

                /* ---- Preview game layout con sidebar ---- */
                .pv-game-layout {
                    display: grid;
                    grid-template-columns: 1fr 200px;
                    gap: 1.5rem;
                    width: 100%;
                    height: 100%;
                    align-items: start;
                }
                @media(max-width:600px){ .pv-game-layout { grid-template-columns: 1fr; } }
                .pv-left-col { display: flex; flex-direction: column; gap: 0.75rem; }
                .pv-right-col { display: flex; flex-direction: column; gap: 0.75rem; }
                .pv-progress-bar-wrap { width: 100%; height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
                .pv-progress-bar-fill { height: 100%; background: var(--primary-color); border-radius: 999px; transition: width 0.4s; }
                .pv-question-card {
                    background: white; border: 1px solid #e2e8f0; border-radius: 1rem;
                    padding: 1.5rem; text-align: center; min-height: 130px;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .pv-question-prompt { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 0.5rem; }
                .pv-operation-display { font-size: 3rem; font-weight: 800; color: var(--secondary-color); min-height: 60px; }
                .pv-options-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; width: 100%; }
                .pv-option-btn {
                    padding: 1rem; font-size: 1.3rem; font-weight: 700;
                    border: 2px solid #e2e8f0; border-radius: 0.75rem;
                    background: white; cursor: pointer; transition: all 0.2s; color: var(--dark-color);
                }
                .pv-option-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
                .pv-option-btn.selected { background: var(--primary-color); color: white; border-color: var(--primary-color); }
                .pv-stats-block {
                    border: 1px solid #d1d5db; border-radius: 0.5rem;
                    padding: 1rem; background: white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                    height: fit-content;
                }
                .pv-stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid #d1d5db; font-family: 'Nunito', sans-serif; font-weight: 700; }
                .pv-stats-item { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 1rem; font-family: 'Nunito', sans-serif; }
                .pv-stats-item strong { font-weight: 700; color: var(--dark-color); }
                .pv-stats-item:last-child { margin-bottom: 0; }

                .operation-display {
                    font-size: 4rem;
                    font-weight: 700;
                    color: var(--dark-color);
                    margin-bottom: 2rem;
                    min-height: 80px;
                }

                .score {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: auto;
                    color: var(--primary-color);
                }

                .options-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    width: 100%;
                    max-width: 400px;
                    margin-bottom: 2rem;
                }

                .option-btn {
                    padding: 1.5rem;
                    font-size: 1.5rem;
                    border: 2px solid #ced4da;
                    border-radius: 8px;
                    background-color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--dark-color); /* FIX: Asegura que el texto sea visible. */
                }

                .option-btn:hover {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }

                .option-btn.selected {
                    background-color: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .game-btn {
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                
                .game-btn.primary { background-color: var(--primary-color); color: white; }
                .game-btn.primary:hover { background-color: #0056b3; }
                .game-btn.success { background-color: var(--success-color); color: white; }
                .game-btn.success:hover { background-color: #1e7e34; }
                .game-btn.success:disabled { background-color: #6c757d; cursor: not-allowed; }
                
                .swal2-popup {
                    width: 680px !important;
                    max-width: 95vw !important;
                    border-radius: 28px !important;
                    background: linear-gradient(145deg, #03045e 0%, #023e8a 50%, #0077b6 100%) !important;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.5) !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                }
                .swal2-icon { display: none !important; }
                .swal2-title { display: none !important; }
                .swal2-html-container {
                    font-family: var(--font-family);
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                }
                .swal2-actions {
                    margin: 0 !important;
                    padding: 1rem 1.5rem 1.25rem !important;
                    gap: 0.75rem !important;
                    display: flex !important;
                    flex-direction: row !important;
                    justify-content: center !important;
                    flex-wrap: nowrap !important;
                    background: rgba(0,0,0,0.2);
                }
                .swal2-confirm, .swal2-cancel {
                    flex: 1 !important;
                    margin: 0 !important;
                    padding: 0.7rem 1rem !important;
                    font-size: 0.95rem !important;
                    font-weight: 700 !important;
                    border-radius: 10px !important;
                    color: #ffffff !important;
                    border: 2px solid rgba(255,255,255,0.5) !important;
                    background: rgba(255,255,255,0.15) !important;
                    backdrop-filter: blur(4px);
                    box-shadow: none !important;
                    transition: background 0.2s !important;
                    white-space: nowrap !important;
                }
                .swal2-confirm:hover, .swal2-cancel:hover {
                    background: rgba(255,255,255,0.28) !important;
                    border-color: #ffffff !important;
                }
                .ar-tabs {
                    display: flex;
                    gap: 0;
                    margin-bottom: 1.5rem;
                    border-bottom: 2px solid #e9ecef;
                }

                .ar-tab {
                    flex: 1;
                    padding: 1rem 1.5rem;
                    border: none;
                    background: transparent;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--secondary-color);
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s ease;
                    font-family: var(--font-family);
                }

                .ar-tab:hover {
                    color: var(--primary-color);
                    background: rgba(0, 123, 255, 0.05);
                }

                .ar-tab.active {
                    color: var(--primary-color);
                }

                .ar-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--primary-color);
                    border-radius: 3px 3px 0 0;
                }

                .ar-tab.has-content .tab-indicator {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background: var(--success-color);
                    border-radius: 50%;
                    margin-left: 8px;
                    vertical-align: middle;
                }

                .ar-tab-content {
                    padding: 1.5rem;
                    background: #f8f9fa;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    min-height: 300px;
                }

                .ar-tab-header {
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e9ecef;
                }

                .ar-stage-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    color: var(--dark-color);
                    cursor: pointer;
                }

                .ar-stage-toggle input {
                    width: 20px;
                    height: 20px;
                    accent-color: var(--primary-color);
                    cursor: pointer;
                }

                .ar-content-cards {
                    display: grid;
                    width: 100%;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 1rem;
                }

                .ar-content-card {
                    width: 100%;
                    background: white;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    padding: 1rem;
                    transition: all 0.3s ease;
                }

                .ar-content-card:hover {
                    border-color: var(--primary-color);
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
                }

                .ar-content-card.has-content {
                    border-color: var(--success-color);
                    background: linear-gradient(135deg, rgba(40, 167, 69, 0.05), white);
                }

                .ar-card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid #e9ecef;
                }

                .ar-card-icon {
                    font-size: 1.5rem;
                }

                .ar-card-title {
                    font-weight: 600;
                    color: var(--dark-color);
                    font-size: 1.1rem;
                    flex: 1;
                }

                .ar-delete-btn {
                    background: #ff4757;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s, transform 0.2s;
                    padding: 0;
                    line-height: 1;
                }

                .ar-delete-btn:hover {
                    background: #ff6b7a;
                    transform: scale(1.1);
                }

                .ar-card-body {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .ar-preview-image {
                    max-width: 100%;
                    max-height: 120px;
                    object-fit: contain;
                    border-radius: 8px;
                    margin-top: 0.5rem;
                }

                .ar-preview-audio {
                    width: 100%;
                    margin-top: 0.5rem;
                }

                .ar-preview-video {
                    width: 100%;
                    max-height: 120px;
                    border-radius: 8px;
                    margin-top: 0.5rem;
                }

                .ar-file-upload-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.65rem 1rem;
                    border: 2px dashed #cbd5e1;
                    border-radius: 10px;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 0.92rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: inherit;
                    text-align: center;
                }
                .ar-file-upload-btn:hover {
                    border-color: #0077b6;
                    background: #e0f2fe;
                    color: #0077b6;
                }
                .ar-file-upload-btn.has-file {
                    border-color: #22c55e;
                    background: #f0fdf4;
                    color: #15803d;
                    border-style: solid;
                }
                .ar-file-input-hidden {
                    display: none;
                }

                .ar-disabled-message {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                .ar-disabled-message p {
                    font-size: 1.1rem;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .ar-content-cards {
                        grid-template-columns: 1fr;
                    }
                }

                .ar-multi-content {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                    width: 100%;
                    margin: 0;
                    padding: 0 1rem 1rem;
                    box-sizing: border-box;
                }
                /* Si solo hay 1 elemento ocupa todo el ancho */
                .ar-multi-content > *:only-child { grid-column: 1 / -1; }
                /* Si cantidad impar, el último ocupa todo el ancho */
                .ar-multi-content > *:last-child:nth-child(odd) { grid-column: 1 / -1; }

                .ar-layout-single {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                }

                .ar-layout-text-top {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                }

                .ar-layout-text-top .ar-row-text {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }

                .ar-layout-text-top .ar-row-media {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }
                .ar-layout-row {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    gap: 1.5rem;
                    width: 100%;
                    flex-wrap: wrap;
                }

                .ar-layout-three {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                }

                .ar-layout-three .ar-row-text {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }

                .ar-layout-three .ar-row-media-pair {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    gap: 1.5rem;
                    width: 100%;
                    flex-wrap: wrap;
                }

                .ar-layout-four {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                    width: 100%;
                }
                .ar-layout-four > * {
                    width: 100%;
                    min-width: 0;
                }

                /* Todos los wrappers de contenido con altura fija */
                /* Todos los wrappers de contenido con altura fija */
                /* Todos los wrappers de contenido con altura fija */
                .ar-multi-text-3d,
                .ar-multi-image,
                .ar-multi-video {
                    width: 100%;
                    height: 260px;
                    display: block;
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                }

                /* ar-three-container dentro del preview React */
                .ar-multi-text-3d .ar-three-container,
                .ar-multi-image .ar-three-container,
                .ar-multi-video .ar-three-container {
                    width: 100% !important;
                    height: 100% !important;
                    background: transparent;
                    overflow: hidden;
                }
                .ar-multi-text-3d .ar-three-container canvas,
                .ar-multi-image .ar-three-container canvas,
                .ar-multi-video .ar-three-container canvas {
                    width: 100% !important;
                    height: 100% !important;
                    display: block;
                }
               .ar-multi-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            width: 100%;
            max-width: 640px;
        }
        .ar-multi-grid > *:only-child {
            grid-column: 1 / -1;
        }
        .ar-multi-grid > *:nth-last-child(1):nth-child(odd) {
            grid-column: 1 / -1;
        }
        .ar-three-container {
            width: 100%; height: 200px;
            background: transparent;
            overflow: visible;
        }
        .ar-three-container canvas {
            width: 100% !important;
            height: 100% !important;
            border-radius: 0.5rem;
            display: block;
        }
        .ar-three-container--video {
            width: 100%; height: 200px;
        }
        .ar-three-container--video canvas {
            width: 100% !important;
            height: 100% !important;
            border-radius: 0.5rem;
            box-shadow: none;
            background: transparent;
        }
                .ar-audio-solo {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 16px;
                }

                .ar-audio-icon {
                    font-size: 5rem;
                    animation: pulse-audio 1.5s ease-in-out infinite;
                }

                @keyframes pulse-audio {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }

                .ar-audio-solo .ar-audio-player {
                    width: 280px;
                    height: 40px;
                }

                .ar-audio-hidden {
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                }

                .ar-audio-player-bg {
                    width: 1px;
                    height: 1px;
                }
            `}</style>

            {showARModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '16px',
                        padding: '2.5rem 2rem', maxWidth: '420px', width: '90%',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
                        textAlign: 'center', fontFamily: 'Poppins, sans-serif',
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔮</div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0077b6', marginBottom: '0.75rem' }}>
                            Realidad Aumentada
                        </h2>
                        <p style={{ color: '#444', marginBottom: '2rem', lineHeight: 1.5 }}>
                            ¿Deseas integrar Tecnología de Realidad Aumentada en esta actividad?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => {
                                    setArEnabled(false);
                                    setShowARModal(false);
                                    setSetupStep('game');
                                    navigate(location.pathname + location.search, {
                                        replace: true,
                                        state: { ...location.state, setupStep: 'game' }
                                    });
                                }} style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '8px', border: '2px solid #6c757d',
                                    background: '#fff', color: '#6c757d', fontWeight: 600, fontSize: '1rem',
                                    cursor: 'pointer',
                                }}
                            >
                                No
                            </button>
                            <button
                                onClick={() => { setArEnabled(true); setShowARModal(false); }}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
                                    background: '#0077b6', color: '#fff', fontWeight: 600, fontSize: '1rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Sí
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="app-layout single-panel">
                {setupStep === "ar" && (
                    <div style={{ width: '100%' }}>

                        <AnimatedTitle />

                        <div className="ar-tabs">
                            {AR_STAGES.map((stage) => (
                                <button
                                    key={stage}
                                    className={`ar-tab ${activeARTab === stage ? "active" : ""} ${arSelectedStages[stage] ? "has-content" : ""}`}
                                    onClick={() => setActiveARTab(stage)}
                                >
                                    {stage}
                                    {arSelectedStages[stage] && <span className="tab-indicator"></span>}
                                </button>
                            ))}
                        </div>

                        <div className="ar-tab-content">
                            <div className="ar-tab-header">
                                <label className="ar-stage-toggle">
                                    <input
                                        type="checkbox"
                                        checked={!!arSelectedStages[activeARTab]}
                                        onChange={() => toggleARStage(activeARTab)}
                                    />
                                    <span>Habilitar etapa "{activeARTab}"</span>
                                </label>
                            </div>

                            {arSelectedStages[activeARTab] && (
                                <div className="ar-content-cards">
                                    <div className={`ar-content-card ${arConfig?.[activeARTab]?.text?.trim() ? "has-content" : ""}`}>
                                        <div className="ar-card-header">
                                            <span className="ar-card-icon"><Player src="/images/areas/texto.json" loop autoplay style={{ width: 68, height: 68 }} /></span>
                                            <span className="ar-card-title">Texto</span>
                                            {arConfig?.[activeARTab]?.text?.trim() && (
                                                <button
                                                    className="ar-delete-btn"
                                                    onClick={() => setARStageField(activeARTab, "text", "")}
                                                    title="Eliminar texto"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                        <div className="ar-card-body">
                                            <textarea
                                                className="ra-field"
                                                value={arConfig?.[activeARTab]?.text ?? ""}
                                                onChange={(e) => setARStageField(activeARTab, "text", e.target.value)}
                                                rows={3}
                                                placeholder="Escribe el mensaje de texto..."
                                            />
                                        </div>
                                    </div>

                                    <div className={`ar-content-card ${arConfig?.[activeARTab]?.imageUrl?.trim() ? "has-content" : ""}`}>
                                        <div className="ar-card-header">
                                            <span className="ar-card-icon"><Player src="/images/areas/image.json" loop autoplay style={{ width: 68, height: 68 }} />
                                            </span>
                                            <span className="ar-card-title">Imagen</span>
                                            {arConfig?.[activeARTab]?.imageUrl?.trim() && (
                                                <button
                                                    className="ar-delete-btn"
                                                    onClick={() => handleARStageFileChange(activeARTab, "imageUrl", null)}
                                                    title="Eliminar imagen"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                        <div className="ar-card-body">
                                            <input
                                                id={`file-image-${activeARTab}`}
                                                className="ar-file-input-hidden"
                                                type="file"
                                                accept="image/*"
                                                onClick={(e) => { e.target.value = null; }}
                                                onChange={(e) =>
                                                    handleARStageFileChange(
                                                        activeARTab,
                                                        "imageUrl",
                                                        e.target.files?.[0] ?? null
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`file-image-${activeARTab}`}
                                                className={`ar-file-upload-btn ${arConfig?.[activeARTab]?.imageUrl?.trim() ? 'has-file' : ''}`}
                                            >
                                                {arConfig?.[activeARTab]?.imageUrl?.trim()
                                                    ? '✅ Imagen seleccionada'
                                                    : '📁 Seleccionar imagen'}
                                            </label>
                                            {arConfig?.[activeARTab]?.imageUrl && (
                                                <img
                                                    src={arConfig[activeARTab].imageUrl}
                                                    alt="Preview"
                                                    className="ar-preview-image"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className={`ar-content-card ${arConfig?.[activeARTab]?.audioUrl?.trim() ? "has-content" : ""}`}>
                                        <div className="ar-card-header">
                                            <span className="ar-card-icon"><Player src="/images/areas/audio.json" loop autoplay style={{ width: 68, height: 68 }} />
                                            </span>
                                            <span className="ar-card-title">Audio</span>
                                            {arConfig?.[activeARTab]?.audioUrl?.trim() && (
                                                <button
                                                    className="ar-delete-btn"
                                                    onClick={() => handleARStageFileChange(activeARTab, "audioUrl", null)}
                                                    title="Eliminar audio"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                        <div className="ar-card-body">
                                            <input
                                                id={`file-audio-${activeARTab}`}
                                                className="ar-file-input-hidden"
                                                type="file"
                                                accept="audio/*"
                                                onClick={(e) => { e.target.value = null; }}
                                                onChange={(e) =>
                                                    handleARStageFileChange(
                                                        activeARTab,
                                                        "audioUrl",
                                                        e.target.files?.[0] ?? null
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`file-audio-${activeARTab}`}
                                                className={`ar-file-upload-btn ${arConfig?.[activeARTab]?.audioUrl?.trim() ? 'has-file' : ''}`}
                                            >
                                                {arConfig?.[activeARTab]?.audioUrl?.trim()
                                                    ? '✅ Audio seleccionado'
                                                    : '🎵 Seleccionar audio'}
                                            </label>
                                            {arConfig?.[activeARTab]?.audioUrl && (
                                                <audio
                                                    controls
                                                    src={arConfig[activeARTab].audioUrl}
                                                    className="ar-preview-audio"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className={`ar-content-card ${arConfig?.[activeARTab]?.videoUrl?.trim() ? "has-content" : ""}`}>
                                        <div className="ar-card-header">
                                            <span className="ar-card-icon"><Player src="/images/areas/video.json" loop autoplay style={{ width: 68, height: 68 }} />
                                            </span>
                                            <span className="ar-card-title">Video</span>
                                            {arConfig?.[activeARTab]?.videoUrl?.trim() && (
                                                <button
                                                    className="ar-delete-btn"
                                                    onClick={() => handleARStageFileChange(activeARTab, "videoUrl", null)}
                                                    title="Eliminar video"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                        <div className="ar-card-body">
                                            <input
                                                id={`file-video-${activeARTab}`}
                                                className="ar-file-input-hidden"
                                                type="file"
                                                accept="video/*"
                                                onClick={(e) => { e.target.value = null; }}
                                                onChange={(e) =>
                                                    handleARStageFileChange(
                                                        activeARTab,
                                                        "videoUrl",
                                                        e.target.files?.[0] ?? null
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`file-video-${activeARTab}`}
                                                className={`ar-file-upload-btn ${arConfig?.[activeARTab]?.videoUrl?.trim() ? 'has-file' : ''}`}
                                            >
                                                {arConfig?.[activeARTab]?.videoUrl?.trim()
                                                    ? '✅ Video seleccionado'
                                                    : '🎬 Seleccionar video'}
                                            </label>
                                            {arConfig?.[activeARTab]?.videoUrl && (
                                                <video
                                                    controls
                                                    src={arConfig[activeARTab].videoUrl}
                                                    className="ar-preview-video"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!arSelectedStages[activeARTab] && (
                                <div className="ar-disabled-message">
                                    <p>Habilita esta etapa para configurar el contenido de Realidad Aumentada.</p>
                                </div>
                            )}
                        </div>

                        <div className="button-group">
                            <button className="main-btn" onClick={() => navigate(-1)}>
                                <IconArrowBack /> Anterior
                            </button>
                            <button className="main-btn" onClick={saveARConfigAndContinue}>
                                Siguiente <GrLinkNext style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
                            </button>
                        </div>
                    </div>
                )}

                {setupStep === "ar-summary" && (
                    <div className="config-panel full-width">
                        <AnimatedTitle />
                        <h2 style={{ textAlign: 'center', color: '#0077b6', marginBottom: '1.5rem', fontWeight: 700 }}>
                            Resumen de Configuración de Realidad Aumentada
                        </h2>
                        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
                            {AR_STAGES.map((stage) => {
                                const enabled = !!arSelectedStages?.[stage];
                                const cfg = arConfig?.[stage] ?? {};
                                const items = [
                                    cfg.text?.trim() && { icon: '📝', label: 'Texto configurado' },
                                    cfg.imageUrl?.trim() && { icon: '🖼️', label: 'Imagen configurada' },
                                    cfg.audioUrl?.trim() && { icon: '🎵', label: 'Audio configurado' },
                                    cfg.videoUrl?.trim() && { icon: '🎬', label: 'Video configurado' },
                                ].filter(Boolean);
                                return (
                                    <div key={stage} style={{ border: '1px solid rgba(2,62,138,0.18)', borderRadius: '14px', padding: '14px', background: '#fff', opacity: enabled ? 1 : 0.7 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <span style={{ fontWeight: 700, color: '#023e8a' }}>{stage}</span>
                                            <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '999px', color: enabled ? '#0077b6' : '#023e8a', background: enabled ? 'rgba(0,119,182,0.12)' : 'rgba(2,62,138,0.08)' }}>
                                                {enabled ? 'Habilitada' : 'Deshabilitada'}
                                            </span>
                                        </div>
                                        <div style={{ color: '#023e8a', fontSize: '0.9rem' }}>
                                            {!enabled && <p style={{ margin: 0, color: 'rgba(2,62,138,0.6)' }}>No habilitada.</p>}
                                            {enabled && items.length === 0 && <p style={{ margin: 0, color: 'rgba(2,62,138,0.6)' }}>Sin contenido configurado.</p>}
                                            {enabled && items.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: i < items.length - 1 ? '1px solid rgba(2,62,138,0.1)' : 'none' }}>
                                                    {item.icon} {item.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="button-group">
                            <button className="main-btn" onClick={() => {
                                if (arEnabled) {
                                    setSetupStep("ar");
                                    navigate(location.pathname + location.search, {
                                        replace: true,
                                        state: { ...location.state, setupStep: 'ar' }
                                    });
                                } else {
                                    navigate(-1);
                                }
                            }}>
                                <IconArrowBack /> Anterior
                            </button>
                            <button id="preview-btn" className="main-btn" onClick={() => {
                                setSetupStep("game");
                                navigate(location.pathname + location.search, {
                                    replace: true,
                                    state: { ...location.state, setupStep: 'game' }
                                });
                            }}>
                                Siguiente <GrLinkNext style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
                            </button>
                        </div>
                    </div>
                )}

                {setupStep === "game" && (
                    <div className="config-panel full-width">
                        <AnimatedTitle />

                        <div className="form-section">
                            <label htmlFor="level-select">Seleccione el nivel de dificultad:</label>
                            <select
                                id="level-select"
                                value={config.level}
                                onChange={(e) => setConfig({ ...config, level: e.target.value })}
                            >
                                {levels.map((level) => (
                                    <option key={level} value={level}>
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-section">
                            <label htmlFor="exercise-count">
                                Seleccione el número de ejercicios a realizar:
                                <span style={{ fontWeight: 400, color: '#64748b', textTransform: 'none', fontSize: '0.85rem', marginLeft: '0.4rem' }}>
                                    (máx. {availableCount})
                                </span>
                            </label>
                            <input
                                type="number"
                                id="exercise-count"
                                value={config.exerciseCount}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        exerciseCount: Math.max(1, Math.min(availableCount, parseInt(e.target.value, 10) || 1)),
                                    })
                                }
                                min="1"
                                max={availableCount}
                                disabled={availableCount === 0}
                            />
                        </div>

                        <div className="button-group">
                            <button className="main-btn" onClick={() => {
                                if (arEnabled) {
                                    const prevStep = "ar-summary";
                                    setSetupStep(prevStep);
                                    navigate(location.pathname + location.search, {
                                        replace: true,
                                        state: { ...location.state, setupStep: prevStep }
                                    });
                                } else {
                                    // Sin RA: regresar a selección de plataforma
                                    navigate(-1);
                                }
                            }}>
                                <IconArrowBack /> Anterior
                            </button>
                            <button id="preview-btn" className="main-btn" onClick={handleShowPreview}>
                                Siguiente <GrLinkNext style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
                            </button>
                        </div>
                    </div>
                )}

                {setupStep === "preview" && (
                    <div className="preview-panel full-width">
                        <AnimatedTitle />
                        <h3 style={{ textAlign: 'center', color: '#6b7280', marginTop: '-1.5rem', marginBottom: '1.5rem', fontWeight: '500', fontFamily: "'Nunito', sans-serif" }}>
                            (Vista Previa)
                        </h3>

                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr',
                            margin: '-0.5rem auto 1.5rem auto', maxWidth: '640px',
                            background: '#eff6ff', border: '1px solid #bfdbfe',
                            borderRadius: '0.75rem', padding: '0.85rem 1.25rem', textAlign: 'center'
                        }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>📋 Reglas Básicas</span>
                            <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: 500 }}>Realiza el cálculo mentalmente de la operación matemática y elige la respuesta correcta.</span>
                        </div>
                        <div className="preview-content">
                            {renderPreviewArea()}
                        </div>

                        {/* ── Botón Iniciar Juego centrado ── */}


                        {/* ── Footer: Anterior | Terminar configuración ── */}

                        <div className="button-group" style={{ marginTop: '1.5rem' }}>
                            <button className="main-btn" onClick={() => {
                                setSetupStep("game");
                                setGameState("config");
                                navigate(location.pathname + location.search, {
                                    replace: true,
                                    state: { ...location.state, setupStep: 'game' }
                                });
                            }}>
                                <IconArrowBack /> Anterior
                            </button>
                            {gameState === 'welcome' ? (
                                <button className="main-btn" onClick={handleStartGame}>
                                    ▶ Iniciar juego
                                </button>
                            ) : (
                                // DESPUÉS
                                <button className="main-btn" onClick={() => {
                                    stopGame();
                                    setSetupStep("summary");
                                    navigate("/settings?view=Summary", { replace: true, state: location.state });
                                }}>
                                    Terminar Configuración <GrLinkNext style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {setupStep === "summary" && (
                    <div style={{ width: '100%', marginTop: '-2rem' }}>
                        <SummaryPanel
                            config={config}
                            arEnabled={arEnabled}
                            arSelectedStages={arSelectedStages}
                            arConfig={arConfig}
                            onBack={() => setSetupStep("preview")}
                        />
                    </div>
                )}
            </div>    {/* ← cierra app-layout single-panel */}
        </>
    );

};

export default CalculoMental;