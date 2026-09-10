import React, { useEffect, useMemo, useRef, useState } from "react";
import { Player } from '@lottiefiles/react-lottie-player';
import { CheckCircle, ArrowLeft, Tag, Layers, FileText, Calendar, Monitor, Shapes, Puzzle, Download, Clock, List, Type } from 'lucide-react';
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_NS = "ar:encriptacion";
const LS = {
  arStages: `${STORAGE_NS}:selectedStages`,
  arConfig: `${STORAGE_NS}:config`,
  gameConfig: `${STORAGE_NS}:game_config`,
};

const AR_STAGES = ["Inicio", "Acierto", "Final"];

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
};

const ALPHABET_ES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "Ñ",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];


// --- COMPONENTE SUMMARY ---
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
const ENCRIPTACION_APPLICATION_ID_BASE = "io.encriptacion.steam";

const createUuidSegment = () => {
  const rawUuid = window.crypto?.randomUUID?.()
    || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
  return `uuid_${uuid}`;
};

const buildEncriptacionApplicationId = () => {
  return `${ENCRIPTACION_APPLICATION_ID_BASE}.${createUuidSegment()}`;
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

const applyEncriptacionAndroidMetadata = async (zip, { applicationId }) => {
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
const SummaryPanel = ({ config, arEnabled, arSelectedStages, arConfig, onBack, state }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [statusText, setStatusText] = React.useState("Iniciando...");
  const [jsZipReady, setJsZipReady] = React.useState(false);

  React.useEffect(() => {
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
        setProgress(90);
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
        setProgress(90);
        setStatusText("Inyectando recursos en Android...");
        generateAndDownloadAndroidZip();
      } else {
        if (currentProgress > 20 && currentProgress < 50) setStatusText("Descargando plantilla Android...");
        if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando configuraciones...");
        setProgress(currentProgress);
      }
    }, 200);
  };

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

  // Usada únicamente para el HTML web standalone (generateGameHTML / buildStageData
  // espera claves "Inicio"/"Acierto"/"Final" con campos planos text/imageUrl/audioUrl/videoUrl).
  // Aquí solo se resuelven los blob: URLs a data URLs para que funcionen offline;
  // NO se debe convertir a la forma {activo, contenido:{...}} en minúsculas, esa es
  // exclusiva del JSON de configuración de Android.
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

  const generateGameHTML = (config, gameDetails, selectedPlatforms, arEnabled, arSelectedStages, arConfig) => {
    const rawDate = (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    })();
    const formattedDate = (() => {
      try {
        // Normalizar para evitar desfase UTC
        const normalized = rawDate.includes('T') ? rawDate : rawDate + 'T00:00:00';
        return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      catch { return 'Fecha no especificada'; }
    })();

    const platformsString = selectedPlatforms?.length > 0
      ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
      : 'Web';

    const escHtml = (s = "") =>
      String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

    const ALPHABET_JS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    const buildStageData = (stage) => {
      if (!arEnabled || !arSelectedStages?.[stage]) return 'null';
      const cfg = arConfig?.[stage] ?? {};
      const text = cfg.text?.trim() || '';
      const imageUrl = cfg.imageUrl?.trim() || '';
      const audioUrl = cfg.audioUrl?.trim() || '';
      const videoUrl = cfg.videoUrl?.trim() || '';
      if (!text && !imageUrl && !audioUrl && !videoUrl) return 'null';
      return JSON.stringify({ text, imageUrl, audioUrl, videoUrl });
    };

    const arInicioData = buildStageData('Inicio');
    const arAciertoData = buildStageData('Acierto');
    const arFinalData = buildStageData('Final');
    const hasArInicio = arInicioData !== 'null';
    const hasArAcierto = arAciertoData !== 'null';
    const hasArFinal = arFinalData !== 'null';

    const gameName = gameDetails?.gameName || 'Encriptación';
    const levelLabel = config?.level ? config.level.charAt(0).toUpperCase() + config.level.slice(1) : 'Básico';
    const exerciseCount = config?.exerciseCount ?? 5;
    const scriptClose = ['<', '/script>'].join(''); // eslint-disable-next-line no-useless-concat
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escHtml(gameName)} - ${escHtml(levelLabel)}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11">${scriptClose}
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
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
body { font-family: 'Nunito', 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; padding: 20px; box-sizing: border-box; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; transition: opacity 0.3s; padding: 20px; box-sizing: border-box; }
        .hidden { display: none !important; opacity: 0; pointer-events: none; }

        .game-title { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1rem; display: flex; justify-content: center; flex-wrap: wrap; font-family: 'Merriweather', serif; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        .game-title.static span { animation: none; transform: none; }
        @keyframes wave-animation { 0%,40%,100%{transform:translateY(0)} 20%{transform:translateY(-20px)} }

        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; min-width: 200px; }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .btn-exit { background: #1f2937; }
        .btn-retry { background: var(--primary-color); }
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }

        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0%{transform:scale(0);opacity:0} 80%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }

        .container { background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); padding: 2rem; width: 100%; max-width: 1400px; margin: 20px auto; box-sizing: border-box; display: flex; flex-direction: column; gap: 1.25rem; }   
        .game-layout { display: grid; grid-template-columns: 1fr 520px; gap: 2rem; width: 100%; }
        @media(max-width:768px){ .game-layout { grid-template-columns: 1fr; } }
        .game-left-col { display: flex; flex-direction: column; gap: 1rem; }
        .game-right-col { display: flex; flex-direction: column; gap: 1rem; }

        .stats-block { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; height: fit-content; background: white; }
.stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); font-family: 'Nunito', sans-serif; }
.stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; font-family: 'Nunito', sans-serif; }
.stats-item strong { font-weight: 700; color: var(--dark-text); }

        .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; color: white; transition: background 0.2s; font-size: 1rem; }
        .btn-primary { background: var(--primary-color); }
        .btn-primary:hover { background: #004a73; }

        .card-block { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .card-label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--primary-color); }
        .encrypted-display { font-size: 1.25rem; font-weight: 700; color: var(--dark-text); min-height: 44px; text-align: center; background: white; border-radius: 10px; border: 2px dashed var(--primary-color); padding: 0.6rem 0.7rem; letter-spacing: 3px; word-break: break-word; font-family: 'Courier New', monospace; line-height: 1.5; }
        .hint-inline { font-size: 0.8rem; color: #64748b; text-align: center; font-weight: 500; line-height: 1.4; }
        .enc-input { width: 100%; box-sizing: border-box; padding: 0.85rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; font-weight: 600; text-align: center; background: white; transition: border-color 0.2s; color: var(--dark-text); font-family: 'Nunito', sans-serif; }
        .enc-input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(0,95,146,0.12); }
        .verify-btn { width: 100%; padding: 0.85rem; font-size: 1rem; border-radius: 10px; letter-spacing: 0.03em; border: none; cursor: pointer; font-weight: 700; background: var(--primary-color); color: white; transition: background 0.2s; }
        .verify-btn:hover { background: #004a73; }
        .verify-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .stat-box { background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 0.75rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
        .stat-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; }
        .stat-value { font-size: 1.35rem; font-weight: 800; color: var(--primary-color); line-height: 1.1; }

        .progress-bar-wrap { width: 100%; height: 8px; background: var(--medium-gray); border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem; }
        .progress-bar-fill { height: 100%; background: var(--primary-color); border-radius: 4px; transition: width 0.4s ease; }

        .cw-rim  { animation: cwS1 100s linear infinite; transform-origin: 240px 240px; }
        .cw-deco { animation: cwS2  80s linear infinite; transform-origin: 240px 240px; }
        .cw-ptr  { animation: cwP    2s ease-in-out infinite; }
        @keyframes cwS1 { to { transform: rotate(360deg);  } }
        @keyframes cwS2 { to { transform: rotate(-360deg); } }
        @keyframes cwP  { 0%,100%{opacity:1} 50%{opacity:.45} }
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

        .end-buttons { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-top: 1rem; }

        .ar-overlay-screen { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10,15,40,0.92); backdrop-filter: blur(6px); z-index: 50; overflow-y: auto; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; padding: 2rem; box-sizing: border-box; }
        .ar-overlay-screen.active { display: flex; }
        .ar-card { width: 100%; max-width: 860px; background: linear-gradient(145deg, #03045e 0%, #023e8a 50%, #0077b6 100%); border-radius: 1.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(144,224,239,0.15); overflow: visible; position: relative; }
        .cm-ar-bg { position: relative; min-height: 420px; width: 100%; background: linear-gradient(135deg, #0077b6 0%, #023e8a 100%); overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.2rem; padding: 1.5rem 1rem; border-radius: 28px; }
        .cm-ar-bg-elements { position: absolute; inset: 0; pointer-events: none; }
        .cm-ar-content { position: relative; z-index: 2; width: 100%; padding: 2rem 2rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; box-sizing: border-box; }
        .ar-badge-html { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(144,224,239,0.15); border: 1px solid rgba(144,224,239,0.5); color: #90e0ef; padding: 0.35rem 1rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.04em; font-family: 'Nunito', sans-serif; backdrop-filter: blur(4px); }
        .ar-stage-title { color: #ffffff; font-size: 1.4rem; font-weight: 800; font-family: 'Nunito', sans-serif; text-align: center; text-shadow: 0 2px 12px rgba(0,150,255,0.4); }
        .ar-multi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; width: 100%; }
        .ar-multi-grid > *:only-child { grid-column: 1 / -1; }
        .ar-multi-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
        .ar-three-container, .ar-three-container--video { width: 100%; height: 260px; background: transparent; overflow: visible; box-shadow: none; }
        .ar-three-container canvas, .ar-three-container--video canvas { width: 100% !important; height: 100% !important; border-radius: 0.5rem; display: block; background: transparent !important; }
        .ar-audio-solo { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .ar-audio-icon { font-size: 3rem; }
        .ar-audio-player { width: 100%; border-radius: 8px; }
        .ar-fallback-text { color: #caf0f8; font-size: 1.05rem; white-space: pre-wrap; text-align: center; font-family: 'Nunito', sans-serif; padding: 1rem; background: rgba(255,255,255,0.08); border-radius: 0.5rem; width: 100%; box-sizing: border-box; }
        .ar-fallback-img { max-width: 100%; max-height: 180px; border-radius: 0.5rem; display: block; margin: 0 auto; }
        .ar-fallback-video { width: 100%; border-radius: 0.5rem; display: block; }
        .ar-continue-btn { margin-top: 0.5rem; }
        /* ── Título animado HTML generado ── */
        .enc-animated-title-container { position: relative; margin-bottom: 1.5rem; display: flex; flex-direction: column; align-items: center; }
        .enc-animated-title { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 0.25rem; display: flex; justify-content: center; flex-wrap: wrap; font-family: 'Merriweather', serif; }
        .enc-animated-title span { display: inline-block; animation: encWave 1.8s infinite; }
        @keyframes encWave { 0%,40%,100%{transform:translateY(0)} 20%{transform:translateY(-20px)} }
        .enc-floating-icons span { position: absolute; color: var(--primary-color); opacity: 0.3; font-size: 1.5rem; font-weight: 700; animation: encIconFloat 4s ease-in-out infinite; }
        .enc-icon-1 { top: -20px; left: 10%; animation-delay: 0s; }
        .enc-icon-2 { top: 0;     right: 10%; animation-delay: 1s; }
        .enc-icon-3 { bottom: 0;  left: 20%; animation-delay: 2s; }
        .enc-icon-4 { bottom: -10px; right: 20%; animation-delay: 3s; }
        @keyframes encIconFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }

        /* ── Modales SweetAlert2 personalizados ── */
.swal2-popup { background: transparent !important; box-shadow: none !important; padding: 0 !important; border-radius: 24px !important; overflow: hidden !important; max-width: 500px !important; }
.swal2-icon { display: none !important; }
.swal2-title { display: none !important; }
.swal2-html-container { margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
.swal2-actions { margin: 0 !important; padding: 0.75rem 1.25rem 1rem !important; gap: 0.75rem !important; display: flex !important; justify-content: center !important; background: rgba(0,0,0,0.25); }
.swal2-confirm, .swal2-cancel { flex: 1 !important; margin: 0 !important; padding: 0.65rem 1rem !important; font-size: 0.95rem !important; font-weight: 700 !important; border-radius: 10px !important; color: #fff !important; border: 2px solid rgba(255,255,255,0.5) !important; background: rgba(255,255,255,0.15) !important; backdrop-filter: blur(4px); box-shadow: none !important; transition: background 0.2s !important; }
.swal2-confirm:hover, .swal2-cancel:hover { background: rgba(255,255,255,0.28) !important; border-color: #fff !important; }
.swal2-timer-progress-bar { background: rgba(255,255,255,0.4) !important; }
    </style>
</head>
<body>

<!-- ===== PANTALLA INICIO ===== -->
<div id="start-screen" class="overlay">
    <div class="game-title static">
            <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">Enkrypto</h2>
    </div>
<div style="background:#e0f2fe;color:#0369a1;padding:0.5rem 1rem;border-radius:20px;font-weight:600;margin-bottom:2rem;display:inline-block;font-family:'Nunito',sans-serif;font-size:1rem;letter-spacing:0.01em;">
        Nivel: ${escHtml(levelLabel)}
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
                <div class="ar-stage-title">¡Bienvenido a Enkrypto!</div>
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
                <div class="ar-stage-title">¡Mensaje Descifrado!</div>
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
    <div class="enc-animated-title-container">
        <h1 class="enc-animated-title">
            ${'Juego de Cripto Mensajes'.split('').map((ch, i) =>
      `<span style="animation-delay:${i * 0.1}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('')}
        </h1>
        <div class="enc-floating-icons">
            <span class="enc-icon-1">🔐</span>
            <span class="enc-icon-2">🗝️</span>
            <span class="enc-icon-3">01</span>
            <span class="enc-icon-4">Ñ</span>
        </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr;max-width:600px;margin:0 auto;background:#eff6ff;border:1px solid #bfdbfe;border-radius:0.75rem;padding:0.85rem 1.25rem;text-align:center;">
        <span style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#64748b;margin-bottom:0.25rem;display:block;">📋 Reglas Básicas</span>
        <span style="font-size:1rem;color:#1e40af;font-weight:500;">Observa el mensaje encriptado, descifra cada número usando el alfabeto de referencia y escribe la frase original.</span>
    </div>
    <div class="game-layout">
        <div class="game-left-col">
            <div class="progress-bar-wrap"><div class="progress-bar-fill" id="progress-bar" style="width:0%"></div></div>
            <div class="card-block">
                <div class="card-label"><span>🔐</span> Mensaje Encriptado</div>
                <div class="encrypted-display" id="encrypted-display">—</div>
               <div class="hint-inline">Nivel <strong>${escHtml(levelLabel)}</strong>: cada número representa una letra según el desplazamiento de la rueda. Los espacios dobles separan palabras.</div>
            </div>
            <div class="card-block">
                <div class="card-label"><span>✍️</span> Tu Respuesta</div>
                <input class="enc-input" type="text" id="answer-input" placeholder="Escribe la frase descifrada..." autocomplete="off" />
                <button class="verify-btn" id="verify-btn" onclick="handleVerify()">Verificar Respuesta 🔓</button>
            </div>
            <div class="stats-row">
                <div class="stat-box"><div class="stat-label">Ejercicio</div><div class="stat-value" id="step-display">1/${exerciseCount}</div></div>
                <div class="stat-box"><div class="stat-label">Puntaje</div><div class="stat-value" id="score-display">0</div></div>
            </div>
        </div>
       <div class="game-right-col">
            <div class="stats-block">
                <h3>Progreso</h3>
                <div class="stats-item"><span>Ejercicio:</span><strong id="progress-text">1/${exerciseCount}</strong></div>
                <div class="stats-item"><span>Puntaje:</span><strong id="score">0</strong></div>
                <div class="stats-item"><span>Nivel:</span><strong>${escHtml(levelLabel)}</strong></div>
            </div>
            <div id="cipher-wheel-wrap" style="width:100%;margin-top:0.5rem;"></div>
            <button class="btn btn-primary" style="margin-top:1rem;" onclick="finishGame(false)">Finalizar Juego</button>
        </div>
    </div>
</div>

<!-- ===== END SCREEN ===== -->
<div id="end-screen" class="overlay hidden">
    <h1 id="end-title" style="color:var(--primary-color);font-size:3rem;font-weight:800;margin-bottom:0.5rem;text-align:center;font-family:'Nunito',sans-serif;">Fin del Juego</h1>
    <h2 style="color:var(--secondary-color);font-size:2rem;margin:1rem 0;font-family:'Nunito',sans-serif;">Puntos Obtenidos: <span id="final-score">0</span></h2>
    <div class="end-buttons">
        <button class="big-btn btn-exit" onclick="exitGame()">Salir</button>
        <button class="big-btn btn-retry" onclick="restartGame()">Volver a Jugar</button>
    </div>
</div>

<script>
// ===== DATOS =====
const ALPHABET_ES = ${JSON.stringify(ALPHABET_JS)};
const GAME_NAME   = "${escHtml(gameName)}";
const LEVEL       = "${config?.level ?? 'basico'}";
const EXERCISE_COUNT = ${exerciseCount};
const HAS_AR_INICIO  = ${hasArInicio};
const HAS_AR_ACIERTO = ${hasArAcierto};
const HAS_AR_FINAL   = ${hasArFinal};
const AR_DATA = {
    Inicio:  ${arInicioData},
    Acierto: ${arAciertoData},
    Final:   ${arFinalData}
};
const ENC_SYMBOLS = ['🔐','🗝️','01','10','Ñ','Z','🧩','🧠'];

// ===== EJERCICIOS =====
// Se cargan dinámicamente desde ejercicios.json embebido
// (la ruta /encrip/ejercicios.json no estará disponible offline,
//  por eso embebemos los ejercicios directamente si se pasaron al HTML)
let EXERCISES_BY_LEVEL = {};
let gameExercises = [];
let currentIdx = 0;
let score = 0;
let pendingNextCallback = null;
let arCleanups = {};

const LEVEL_OFFSETS_MAP = { basico: 0, intermedio: 9, avanzado: 17 };
const LEVEL_LABELS_MAP  = { basico: 'A = 1', intermedio: 'A = 10', avanzado: 'A = 18' };
const CIPHER_OFFSET = LEVEL_OFFSETS_MAP[LEVEL] ?? 0;

function encryptText(text) {
    return String(text).split('').map(char => {
        const upper = char.toUpperCase();
        if (upper === ' ') return '  ';
        const idx = ALPHABET_ES.indexOf(upper);
        if (idx === -1) return char;
        return String((idx + CIPHER_OFFSET) % ALPHABET_ES.length + 1).padStart(2, '0');
    }).join(' ');
}

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
            el.style.display = (sid === id) ? 'flex' : 'none';
        } else {
            el.classList.toggle('hidden', sid !== id);
            if (sid !== id) el.style.display = 'none';
            else el.style.display = '';
        }
    });
}

function toggleInfo(show) {
    const modal = document.getElementById('info-overlay');
    if (show) { modal.classList.remove('hidden'); modal.style.display = 'flex'; }
    else { modal.classList.add('hidden'); setTimeout(() => modal.style.display = 'none', 300); }
}

function buildCipherGrid() {
    const grid = document.getElementById('cipher-grid');
    if (!grid) return;
    grid.innerHTML = ALPHABET_ES.map((letter, i) =>
        '<div class="cipher-cell"><strong>' + letter + '</strong><br><span style="font-size:0.7rem;color:#64748b;">' + String(i).padStart(2,'0') + '</span></div>'
    ).join('');
}

// ===== FLOATING SYMBOLS RA =====
function createFloatingSymbols(container) {
    if (!container) return () => {};
    const created = [];
    ENC_SYMBOLS.forEach((sym, idx) => {
        const el = document.createElement('div');
        el.textContent = sym;
        const size = Math.random() * 26 + 18;
        const dur  = Math.random() * 5 + 5;
        const left = Math.random() * 80 + 10;
        const top  = Math.random() * 80 + 10;
        const dx   = Math.random() * 30 - 15;
        const dy   = Math.random() * 30 - 15;
        const rot  = Math.random() * 30 - 15;
        const aName = 'encFloat_' + Date.now() + '_' + idx;
        const kf = document.createElement('style');
        kf.textContent = '@keyframes ' + aName + '{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)}}';
        document.head.appendChild(kf);
        el.style.cssText = 'position:absolute;color:rgba(255,255,255,0.22);font-size:' + size + 'px;animation:' + aName + ' ' + dur + 's ease-in-out infinite;left:' + left + '%;top:' + top + '%;pointer-events:none;z-index:1;user-select:none;';
        container.appendChild(el);
        created.push({ el, kf });
    });
    return () => created.forEach(({ el, kf }) => { el.remove(); kf.remove(); });
}

// ===== THREE.JS RA =====
const _loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector('script[src="' + src + '"]')) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = res;
    s.onerror = () => rej(new Error('Error: ' + src));
    document.body.appendChild(s);
});

let threePromise = null;
function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threePromise) return threePromise;
    threePromise = _loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
        .then(() => window.THREE || _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js').then(() => window.THREE))
        .catch(() => _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js').then(() => window.THREE));
    return threePromise;
}

let threeAddonsPromise = null;
function loadThreeAddons() {
    if (threeAddonsPromise) return threeAddonsPromise;
    threeAddonsPromise = loadThree().then(() =>
        _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/FontLoader.js')
            .then(() => _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/geometries/TextGeometry.js'))
            .then(() => ({ THREE: window.THREE, FontLoader: window.THREE?.FontLoader ?? null, TextGeometry: window.THREE?.TextGeometry ?? null }))
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
        renderer.setClearColor(0x000000, 0);
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
                if (disposed || !FontLoader || !TextGeometry) return;
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
                    () => loader.load('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/fonts/helvetiker_regular.typeface.json', buildMeshes, undefined,
                        () => { if (!disposed) { const p=document.createElement('p'); p.className='ar-fallback-text'; p.textContent=content; container.innerHTML=''; container.appendChild(p); } }
                    )
                );
            }).catch(() => { if (!disposed) { const p=document.createElement('p'); p.className='ar-fallback-text'; p.textContent=content; container.innerHTML=''; container.appendChild(p); } });

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
        if (!container) return;
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

    if (audioEl && data.audioUrl) { audioEl.src = data.audioUrl; audioEl.style.display = 'block'; audioEl.play().catch(() => {}); }
    if (textEl  && data.text)     { textEl.style.display = 'block';  cleanThreeFns.push(initThreeForType(textEl,  'Texto',  data.text)); }
    if (imageEl && data.imageUrl) { imageEl.style.display = 'block'; cleanThreeFns.push(initThreeForType(imageEl, 'Imagen', data.imageUrl)); }
    if (videoEl && data.videoUrl) { videoEl.style.display = 'block'; cleanThreeFns.push(initThreeForType(videoEl, 'Video',  data.videoUrl)); }

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
    currentIdx = 0; score = 0;
    document.getElementById('score').textContent = '0';
    document.getElementById('score-display').textContent = '0';

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

function loadExercise() {
    const ex = gameExercises[currentIdx];
    if (!ex) return;
    const total = gameExercises.length;
    document.getElementById('progress-text').textContent = (currentIdx + 1) + '/' + total;
    document.getElementById('step-display').textContent  = (currentIdx + 1) + '/' + total;
    document.getElementById('progress-bar').style.width  = ((currentIdx / total) * 100) + '%';
    document.getElementById('encrypted-display').textContent = encryptText(ex.frase);
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').focus();
}

function handleVerify() {
    const ex = gameExercises[currentIdx];
    if (!ex) return;
    const input = document.getElementById('answer-input');
    const userAnswer = input.value.trim().toUpperCase();
    const correct    = String(ex.frase).trim().toUpperCase();
    const isCorrect  = userAnswer === correct;
    const isLast     = currentIdx === gameExercises.length - 1;

    if (isCorrect) {
        score += 10;
        document.getElementById('score').textContent = score;
        document.getElementById('score-display').textContent = score;

        if (HAS_AR_ACIERTO) {
            // ── RA Acierto tiene PRIORIDAD ──
            pendingNextCallback = () => nextExercise();
            setTimeout(() => { setActiveScreen('ar-screen-acierto'); initARScreen('Acierto'); }, 400);
        } else {
            // ── Modal de acierto estilizado sin RA ──
            Swal.fire({
                html: '<div style="background:linear-gradient(145deg,#03045e 0%,#023e8a 50%,#0077b6 100%);border-radius:20px;padding:2rem 1.5rem;text-align:center;position:relative;overflow:hidden;">' +
                      '<div style="font-size:3.5rem;margin-bottom:0.5rem;">🎉</div>' +
                      '<div style="color:#ffd60a;font-size:1.6rem;font-weight:800;margin-bottom:0.5rem;">¡Correcto!</div>' +
                      '<div style="color:#caf0f8;font-size:1rem;margin-bottom:0.5rem;">La respuesta era:</div>' +
                      '<div style="color:#ffffff;font-size:1.5rem;font-weight:800;background:rgba(255,255,255,0.12);border-radius:10px;padding:0.5rem 1rem;letter-spacing:2px;display:inline-block;">' + correct + '</div>' +
                      '<div style="color:#90e0ef;font-size:0.9rem;margin-top:1rem;font-weight:600;">+10 puntos 🔑</div>' +
                      '</div>',
                showConfirmButton: true,
                confirmButtonText: isLast ? '🏆 Ver Resultado' : '➡️ Siguiente',
                showCancelButton: false,
                timer: isLast ? undefined : 1800,
                timerProgressBar: !isLast,
            }).then(() => nextExercise());
        }
    } else {
        // ── Modal de error estilizado (siempre, con o sin RA) ──
        Swal.fire({
            html: '<div style="background:linear-gradient(145deg,#4a0000 0%,#7f1d1d 50%,#b91c1c 100%);border-radius:20px;padding:2rem 1.5rem;text-align:center;position:relative;overflow:hidden;">' +
                  '<div style="font-size:3.5rem;margin-bottom:0.5rem;">❌</div>' +
                  '<div style="color:#fca5a5;font-size:1.6rem;font-weight:800;margin-bottom:0.5rem;">¡Incorrecto!</div>' +
                  '<div style="color:#fecaca;font-size:1rem;margin-bottom:0.5rem;">La respuesta correcta era:</div>' +
                  '<div style="color:#ffffff;font-size:1.5rem;font-weight:800;background:rgba(255,255,255,0.12);border-radius:10px;padding:0.5rem 1rem;letter-spacing:2px;display:inline-block;">' + correct + '</div>' +
                  '<div style="color:#fca5a5;font-size:0.9rem;margin-top:1rem;font-weight:600;">Tu respuesta: <span style="color:#ffffff;">' + (userAnswer || '—') + '</span></div>' +
                  '</div>',
            confirmButtonText: 'Continuar',
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
    document.getElementById('end-title').textContent = currentIdx >= gameExercises.length ? '¡Juego Completado!' : 'Fin del Juego';
    document.getElementById('progress-bar').style.width = '100%';
}

function restartGame() { startGameSequence(); }
function exitGame() {
    window.close();
    Swal.fire({ title: 'Juego Finalizado', text: 'Por favor cierra esta pestaña manualmente.', icon: 'info', confirmButtonText: 'Entendido' });
}

// ===== CIPHER WHEEL =====
// ===== CIPHER WHEEL =====
function buildCipherWheel() {
    const wrap = document.getElementById('cipher-wheel-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.width = 480; canvas.height = 480;
    canvas.style.cssText = 'width:100%;max-width:480px;display:block;margin:0 auto;cursor:grab;touch-action:none;filter:drop-shadow(0 4px 16px rgba(26,95,168,0.2))';
    wrap.appendChild(canvas);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;align-items:center;justify-content:center;margin-top:8px;';
    const btnL = document.createElement('button');
    btnL.textContent = '◀';
    btnL.style.cssText = 'width:34px;height:34px;border-radius:50%;border:2px solid #1a5fa8;background:transparent;color:#1a5fa8;cursor:pointer;font-size:16px;';
    const btnR = document.createElement('button');
    btnR.textContent = '▶';
    btnR.style.cssText = btnL.style.cssText;
    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:0.78rem;font-weight:700;color:#1a5fa8;text-transform:uppercase;letter-spacing:0.06em;';
    lbl.textContent = (LEVEL_LABELS_MAP[LEVEL] ?? 'A = 1') + ' — Arrastra o usa las flechas';
    btnRow.appendChild(btnL); btnRow.appendChild(lbl); btnRow.appendChild(btnR);
    wrap.appendChild(btnRow);

    const ctx = canvas.getContext('2d');
    let rot = 0, animId = null;
    const N  = ALPHABET_ES.length;
    const offset = CIPHER_OFFSET;
    const sector = (2 * Math.PI) / N;
    const startOff = -Math.PI / 2 - sector / 2;

    function draw(r) {
        const W = canvas.width, H = canvas.height;
        const CX = W/2, CY = H/2;
        const R_OUT = CX*0.97, R_MID = CX*0.72, R_IN = CX*0.48, R_CORE = CX*0.32;
        ctx.clearRect(0,0,W,H);

        // Anillo exterior (letras)
        ctx.beginPath(); ctx.arc(CX,CY,R_OUT,0,2*Math.PI);
        ctx.fillStyle='#ffffff'; ctx.fill();
        ctx.strokeStyle='#1a5fa8'; ctx.lineWidth=2; ctx.stroke();

        for(let i=0;i<N;i++){
            const a1=startOff+i*sector, a2=a1+sector, amid=(a1+a2)/2, even=i%2===0;
            ctx.beginPath();
            ctx.moveTo(CX+R_MID*Math.cos(a1),CY+R_MID*Math.sin(a1));
            ctx.arc(CX,CY,R_OUT,a1+0.01,a2-0.01);
            ctx.lineTo(CX+R_MID*Math.cos(a2),CY+R_MID*Math.sin(a2));
            ctx.arc(CX,CY,R_MID,a2-0.01,a1+0.01,true); ctx.closePath();
            ctx.fillStyle=even?'#f0f9ff':'#e0f2fe'; ctx.fill();
            ctx.strokeStyle='#5b9bd5'; ctx.lineWidth=0.5; ctx.stroke();
            const lx=CX+(R_MID+(R_OUT-R_MID)/2)*Math.cos(amid);
            const ly=CY+(R_MID+(R_OUT-R_MID)/2)*Math.sin(amid);
            ctx.save(); ctx.translate(lx,ly); ctx.rotate(amid+Math.PI/2);
            ctx.fillStyle='#023e8a'; ctx.font='bold '+Math.round(W*0.038)+'px Inter,sans-serif';
            ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillText(ALPHABET_ES[i],0,0); ctx.restore();
        }

        // Anillo interior (números, ROTA)
        ctx.save(); ctx.translate(CX,CY); ctx.rotate(r); ctx.translate(-CX,-CY);
        ctx.beginPath(); ctx.arc(CX,CY,R_MID-1,0,2*Math.PI);
        ctx.fillStyle='#3a7fc1'; ctx.fill(); ctx.strokeStyle='#1a5fa8'; ctx.lineWidth=1.5; ctx.stroke();

        for(let i=0;i<N;i++){
            const a1=startOff+i*sector, a2=a1+sector, amid=(a1+a2)/2, even=i%2===0;
            const numVal=(i+offset)%N+1;
            ctx.beginPath();
            ctx.moveTo(CX+R_IN*Math.cos(a1),CY+R_IN*Math.sin(a1));
            ctx.arc(CX,CY,R_MID-2,a1+0.01,a2-0.01);
            ctx.lineTo(CX+R_IN*Math.cos(a2),CY+R_IN*Math.sin(a2));
            ctx.arc(CX,CY,R_IN,a2-0.01,a1+0.01,true); ctx.closePath();
            ctx.fillStyle=even?'#5b9bd5':'#4a8bc4'; ctx.fill();
            ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=0.5; ctx.stroke();
            const nx=CX+(R_IN+(R_MID-2-R_IN)/2)*Math.cos(amid);
            const ny=CY+(R_IN+(R_MID-2-R_IN)/2)*Math.sin(amid);
            ctx.save(); ctx.translate(nx,ny); ctx.rotate(amid+Math.PI/2);
            ctx.fillStyle='#ffffff'; ctx.font='bold '+Math.round(W*0.032)+'px Courier New,monospace';
            ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillText(String(numVal).padStart(2,'0'),0,0); ctx.restore();
        }
        ctx.restore();

        // Separador blanco
        ctx.beginPath(); ctx.arc(CX,CY,R_IN-1,0,2*Math.PI);
        ctx.fillStyle='#e8f4ff'; ctx.fill(); ctx.strokeStyle='#1a5fa8'; ctx.lineWidth=1.5; ctx.stroke();
        for(let i=0;i<N;i++){
            const a=startOff+i*sector+sector/2;
            ctx.beginPath(); ctx.moveTo(CX+(R_IN-3)*Math.cos(a),CY+(R_IN-3)*Math.sin(a));
            ctx.lineTo(CX+(R_IN-9)*Math.cos(a),CY+(R_IN-9)*Math.sin(a));
            ctx.strokeStyle='#5b9bd5'; ctx.lineWidth=1; ctx.stroke();
        }

        // Centro
        ctx.beginPath(); ctx.arc(CX,CY,R_CORE,0,2*Math.PI);
        ctx.fillStyle='#ffffff'; ctx.fill(); ctx.strokeStyle='#1a5fa8'; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle='#1a5fa8'; ctx.font='bold '+Math.round(W*0.038)+'px Inter,sans-serif';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(LEVEL_LABELS_MAP[LEVEL]??'A = 1', CX, CY);

        ctx.beginPath(); ctx.arc(CX,CY,R_OUT,0,2*Math.PI);
        ctx.strokeStyle='#1a5fa8'; ctx.lineWidth=3; ctx.stroke();
    }

    draw(rot);

    function animSpin(from,to){
        if(animId) cancelAnimationFrame(animId);
        const dur=380, t0=performance.now();
        function step(now){
            const p=Math.min((now-t0)/dur,1);
            const e=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
            rot=from+(to-from)*e; draw(rot);
            if(p<1) animId=requestAnimationFrame(step);
        }
        animId=requestAnimationFrame(step);
    }

    const spinStep=(2*Math.PI)/N;
    btnL.onclick=()=>animSpin(rot,rot-spinStep);
    btnR.onclick=()=>animSpin(rot,rot+spinStep);

    let drag={on:false,sx:0,sr:0};
    canvas.addEventListener('mousedown',e=>{drag={on:true,sx:e.clientX,sr:rot};});
    window.addEventListener('mousemove',e=>{if(!drag.on)return;rot=drag.sr+(e.clientX-drag.sx)*0.012;draw(rot);});
    window.addEventListener('mouseup',()=>{drag.on=false;});
    canvas.addEventListener('touchstart',e=>{drag={on:true,sx:e.touches[0].clientX,sr:rot};},{passive:true});
    canvas.addEventListener('touchmove',e=>{if(!drag.on)return;rot=drag.sr+(e.touches[0].clientX-drag.sx)*0.012;draw(rot);},{passive:true});
    canvas.addEventListener('touchend',()=>{drag.on=false;});
}
// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    buildCipherWheel();
    // Cargar ejercicios desde JSON embebido o fetch
    fetch('/encrip/ejercicios.json')
        .then(r => r.json())
        .then(data => {
            EXERCISES_BY_LEVEL = data;
            const pool = (data[LEVEL] || data['basico'] || []);
            gameExercises = shuffle(pool).slice(0, EXERCISE_COUNT);
        })
        .catch(() => {
            // Fallback de ejercicios básicos si no hay JSON
            gameExercises = shuffle([
                { frase: 'HOLA' }, { frase: 'MUNDO' }, { frase: 'CLAVE' },
                { frase: 'CODIGO' }, { frase: 'CIFRAR' }
            ]).slice(0, EXERCISE_COUNT);
        });
});
${scriptClose}
</body>
</html>`;
  };

  const generateAndDownloadZip = async () => {
    if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }
    try {
      const zip = new window.JSZip();
      setStatusText("Procesando archivos multimedia...");
      const resolvedConfig = arEnabled && arConfig ? await resolveARConfig(arConfig) : {};
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
      const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'encriptacion')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
      zip.file(htmlFileName, htmlContent);
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${normalizeFileName(gameDetails?.gameName || 'encriptacion')}_web.zip`;
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

    // Bug 4 fix: blobUrlToDataUrl definida localmente para este contexto
    const blobUrlToDataUrlLocal = async (url) => {
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

    // Bug 3 fix: solo inyectar etapas que el usuario habilitó (arSelectedStages[stage] === true)
    // Bug 4 fix: usar blobUrlToDataUrlLocal en vez del closure externo
    const resolveARConfigAndroid = async (cfg) => {
      if (!cfg || typeof cfg !== 'object') return cfg;
      const stageMap = {
        Inicio: 'inicio', Acierto: 'acierto', Final: 'fin',
        start: 'inicio', success: 'acierto', end: 'fin'
      };
      const result = {};
      for (const stage of Object.keys(cfg)) {
        // Omitir etapas que el usuario no activó
        if (!arSelectedStages?.[stage]) continue;
        const mappedStage = stageMap[stage] || stage;
        const stageCfg = cfg[stage] ?? {};
        result[mappedStage] = {
          activo: true,
          contenido: {
            imagen: await blobUrlToDataUrlLocal(stageCfg.imageUrl),
            audio: await blobUrlToDataUrlLocal(stageCfg.audioUrl),
            video: await blobUrlToDataUrlLocal(stageCfg.videoUrl),
            texto: stageCfg.text ?? ''
          }
        };
      }
      return result;
    };

    try {
      setStatusText("Descargando plantilla Android...");
      const response = await fetch('/templates/encriptacion_android.zip');
      if (!response.ok) {
        throw new Error("No se pudo descargar la plantilla base de Android");
      }
      const arrayBuffer = await response.arrayBuffer();

      setStatusText("Procesando archivos ZIP...");
      const zip = await window.JSZip.loadAsync(arrayBuffer);

      setStatusText("Inyectando configuración...");

      // Bug 2 fix: resolver UNA sola vez y reusar
      const resolvedAR = arEnabled && arConfig
        ? await resolveARConfigAndroid(arConfig)
        : undefined;

      const selectedPlats = state?.selectedPlatforms ?? [];
      const details = state?.gameDetails ?? {};

      const fullConfig = {
        nivel: config?.level || 'Básico',
        numeroEjercicios: config?.exerciseCount ?? 5,  // Bug 1 fix
        autor: details.authorName || '',
        version: details.version || '1.0.0',
        fecha: details.date || new Date().toISOString(),
        descripcion: details.description || '',
        nombreApp: details.gameName || 'Cripto Mensajes',
        plataformas: Array.isArray(selectedPlats) ? selectedPlats : ['android'],
        ar: resolvedAR  // Bug 2 fix: reusar en vez de llamar de nuevo
      };

      const androidApplicationId = buildEncriptacionApplicationId();
      zip.file("android/app/src/main/assets/public/config/encriptacion-config.json", JSON.stringify(fullConfig, null, 2));
      await applyEncriptacionAndroidMetadata(zip, { applicationId: androidApplicationId });

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
      link.download = `${normalizeFileName(details?.gameName || 'encriptacion')}_${platformsSuffix}.zip`;
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

    const blobUrlToDataUrlLocal = async (url) => {
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

    const resolveARConfigLocal = async (cfg) => {
      if (!cfg || typeof cfg !== 'object') return cfg;
      const stageMap = {
        Inicio: 'inicio', Acierto: 'acierto', Final: 'fin',
        start: 'inicio', success: 'acierto', end: 'fin'
      };
      const result = {};
      for (const stage of Object.keys(cfg)) {
        if (!arSelectedStages?.[stage]) continue;
        const mappedStage = stageMap[stage] || stage;
        const stageCfg = cfg[stage] ?? {};
        result[mappedStage] = {
          activo: true,
          contenido: {
            imagen: await blobUrlToDataUrlLocal(stageCfg.imageUrl),
            audio: await blobUrlToDataUrlLocal(stageCfg.audioUrl),
            video: await blobUrlToDataUrlLocal(stageCfg.videoUrl),
            texto: stageCfg.text ?? ''
          }
        };
      }
      return result;
    };

    // Forma plana (Inicio/Acierto/Final + text/imageUrl/audioUrl/videoUrl), que es
    // la que realmente espera generateGameHTML/buildStageData para el HTML web.
    // resolveARConfigLocal (arriba) genera la forma {activo, contenido:{...}} en
    // minúsculas, exclusiva del JSON de Android — usarla para el HTML web hacía
    // que buildStageData nunca encontrara contenido y la RA no se activara nunca
    // en el archivo exportado.
    const resolveARConfigWebLocal = async (cfg) => {
      if (!cfg || typeof cfg !== 'object') return cfg;
      const result = {};
      for (const stage of Object.keys(cfg)) {
        const stageCfg = cfg[stage] ?? {};
        result[stage] = {
          ...stageCfg,
          imageUrl: await blobUrlToDataUrlLocal(stageCfg.imageUrl),
          audioUrl: await blobUrlToDataUrlLocal(stageCfg.audioUrl),
          videoUrl: await blobUrlToDataUrlLocal(stageCfg.videoUrl),
          text: stageCfg.text ?? '',
        };
      }
      return result;
    };

    try {
      const outerZip = new window.JSZip();

      // ── Generar ZIP Web ──
      setStatusText("Generando paquete Web...");
      const resolvedARForWeb = arEnabled && arConfig ? await resolveARConfigWebLocal(arConfig) : undefined;
      const htmlContent = generateGameHTML(
        config,
        state?.gameDetails ?? {},
        state?.selectedPlatforms ?? [],
        arEnabled,
        arEnabled ? (arSelectedStages ?? {}) : {},
        resolvedARForWeb
      );
      const webZip = new window.JSZip();

      const detailsCombined = state?.gameDetails ?? {};
      const htmlFileNameCombined = `${normalizeFileName(detailsCombined?.gameName || 'encriptacion')}_v${(detailsCombined?.version || '1.0').replace(/\s+/g, '')}.html`;
      webZip.file(htmlFileNameCombined, htmlContent);
      const webBlob = await webZip.generateAsync({ type: "blob" });
      outerZip.file(`${normalizeFileName(detailsCombined?.gameName || 'encriptacion')}_web.zip`, webBlob);

      // ── Generar ZIP Android ──
      setStatusText("Descargando plantilla Android...");
      const response = await fetch('/templates/encriptacion_android.zip');
      if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
      const arrayBuffer = await response.arrayBuffer();

      setStatusText("Inyectando configuración Android...");
      const zip = await window.JSZip.loadAsync(arrayBuffer);
      const resolvedAR = arEnabled && arConfig ? await resolveARConfigLocal(arConfig) : undefined;
      const selectedPlats = state?.selectedPlatforms ?? [];
      const details = state?.gameDetails ?? {};
      const fullConfig = {
        nivel: config?.level || 'Básico',
        numeroEjercicios: config?.exerciseCount ?? 5,
        autor: details.authorName || '',
        version: details.version || '1.0.0',
        fecha: details.date || new Date().toISOString(),
        descripcion: details.description || '',
        nombreApp: details.gameName || 'Cripto Mensajes',
        plataformas: Array.isArray(selectedPlats) ? selectedPlats : ['android'],
        ar: resolvedAR
      };
      const androidApplicationId = buildEncriptacionApplicationId();
      zip.file("android/app/src/main/assets/public/config/encriptacion-config.json", JSON.stringify(fullConfig, null, 2));
      await applyEncriptacionAndroidMetadata(zip, { applicationId: androidApplicationId });
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
      const androidBlob = await zip.generateAsync({ type: "blob", platform: "UNIX" });

      const mobilePlatforms = (state?.selectedPlatforms ?? [])
        .filter(p => p.toLowerCase() !== 'web')
        .map(p => platformLabel(p))
        .join('_') || 'movil';
      outerZip.file(`${normalizeFileName(details?.gameName || 'encriptacion')}_${mobilePlatforms}.zip`, androidBlob);

      // ── ZIP contenedor final ──
      setStatusText("Empaquetando todo...");
      const finalBlob = await outerZip.generateAsync({ type: "blob" });
      const platformsLabel = (state?.selectedPlatforms ?? [])
        .map(p => platformLabel(p))
        .join('_');
      const url = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${normalizeFileName(details?.gameName || 'encriptacion')}_${platformsLabel}.zip`;
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
      // Parsear como fecha local agregando T00:00:00 si es solo YYYY-MM-DD
      const normalized = dateString.includes('T') ? dateString : dateString + 'T00:00:00';
      return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return "Fecha inválida"; }
  };

  const getFixedCreationDate = () => {
    // Siempre usar la fecha actual del navegador/equipo del usuario
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

      <h1 className="selection-title">
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
            <div className="info-card-value">{gameDetails.description || 'Sin descripción.'}</div>
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
            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config?.level ? config.level.charAt(0).toUpperCase() + config.level.slice(1) : '—'}</strong>
          </div>
          <div className="summary-row">
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><List size={18} /> Ejercicios:</span>
            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config?.exerciseCount ?? '—'}</strong>
          </div>
          <div className="summary-row">
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Realidad Aumentada:</span>
            <strong style={{ fontSize: '1.1rem', color: '#64748b' }}>{arEnabled ? 'Sí' : 'No'}</strong>
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
              <div style={{ width: '100%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', marginTop: '0.5rem', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
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
function encrypt(text) {
  return String(text)
    .split("")
    .map((char) => {
      const upperChar = char.toUpperCase();
      if (upperChar === " ") return "  ";
      const idx = ALPHABET_ES.indexOf(upperChar);
      if (idx === -1) return char;
      return String(idx).padStart(2, "0");
    })
    .join(" ");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ensureSwal() {
  if (!window.Swal) {
    console.warn("SweetAlert2 aún no ha cargado.");
    return false;
  }
  return true;
}

function toast(message, type = "info") {
  if (!ensureSwal()) return;

  window.Swal.fire({
    toast: true,
    position: "top-end",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
}

// DESPUÉS — versión única r134, que sí tiene FontLoader y TextGeometry en el global THREE
const useThreeLoaders = () => {
  const threeLoadRef = useRef(null);
  const threeAddonsRef = useRef(null);

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      // Evita cargar el mismo script dos veces
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Error cargando: ${src}`));
      document.body.appendChild(s);
    });

  const ensureThree = () => {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threeLoadRef.current) return threeLoadRef.current;

    // r134: versión que incluye FontLoader y TextGeometry en el global window.THREE
    threeLoadRef.current = loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
    )
      .then(() => {
        if (window.THREE) return window.THREE;
        // fallback
        return loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js"
        ).then(() => window.THREE);
      })
      .catch(() =>
        loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js"
        ).then(() => window.THREE)
      );

    return threeLoadRef.current;
  };

  const ensureThreeTextAddons = () => {
    if (threeAddonsRef.current) return threeAddonsRef.current;

    threeAddonsRef.current = ensureThree().then((THREE) =>
      // En r134 los ejemplos js exponen FontLoader y TextGeometry en window.THREE
      loadScript(
        "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/FontLoader.js"
      )
        .then(() =>
          loadScript(
            "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/geometries/TextGeometry.js"
          )
        )
        .then(() => {
          const T = window.THREE;
          const FontLoader = T?.FontLoader;
          const TextGeometry = T?.TextGeometry;

          if (!FontLoader || !TextGeometry) {
            // Como último recurso: fallback canvas 2D en lugar de fallar silenciosamente
            console.warn("FontLoader/TextGeometry no disponibles, usando fallback canvas.");
            return { THREE, FontLoader: null, TextGeometry: null };
          }

          return { THREE, FontLoader, TextGeometry };
        })
    );

    return threeAddonsRef.current;
  };

  return { ensureThree, ensureThreeTextAddons };
};
const ENCRYPT_SYMBOLS = ["🔐", "🗝️", "01", "10", "Ñ", "Z", "🧩", "🧠"];

function createFloatingSymbols(container) {
  if (!container) return () => { };

  const uid = `enc_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const nodes = [];
  const styles = [];

  ENCRYPT_SYMBOLS.forEach((symbol, index) => {
    const el = document.createElement("div");
    el.textContent = symbol;

    const size = Math.random() * 26 + 18;
    const duration = Math.random() * 5 + 5;
    const left = Math.random() * 80 + 10;
    const top = Math.random() * 80 + 10;
    const dx = Math.random() * 30 - 15;
    const dy = Math.random() * 30 - 15;
    const rot = Math.random() * 30 - 15;

    const animName = `encFloat_${uid}_${index}`;

    el.style.cssText = `
      position: absolute;
      color: rgba(255,255,255,0.22);
      font-size: ${size}px;
      animation: ${animName} ${duration}s ease-in-out infinite;
      left: ${left}%;
      top: ${top}%;
      user-select: none;
      pointer-events: none;
    `;

    const kf = document.createElement("style");
    kf.textContent = `
      @keyframes ${animName} {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(${dx}px, ${dy}px) rotate(${rot}deg); }
      }
    `;

    document.head.appendChild(kf);
    container.appendChild(el);

    styles.push(kf);
    nodes.push(el);
  });

  return () => {
    nodes.forEach((n) => n.remove());
    styles.forEach((s) => s.remove());
  };
}

async function startCamera(videoElementId) {
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
}

function stopCamera(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

function buildDecoratedHtml({ bgId, topHtml = "", innerHtml = "", useCamera = false, videoId = "" }) {
  return `
    <div class="enc-ar-bg ${useCamera ? 'enc-ar-bg-camera' : ''}">
      ${useCamera ? `<video id="${videoId}" class="enc-ar-camera-bg" autoplay playsinline muted></video>` : ''}
      <div id="${bgId}" class="enc-ar-bg-elements"></div>
      <div class="enc-ar-content">${topHtml}${innerHtml}</div>
    </div>
  `;
}

function initThreeStageFactory({ ensureThree, ensureThreeTextAddons }) {
  return function initThreeStage(container, stageCfg) {
    if (!container) return () => { };

    let disposed = false;
    let rafId = 0;

    let renderer;
    let scene;
    let camera;

    let videoEl;
    let videoTexture;
    let audioInstance = null;
    let resizeObserver = null;
    let toggleClickHandler = null;
    let videoMetadataHandler = null;
    let portalGroup = null;
    let portalGlow = null;
    let portalFrameGroup = null;
    let portalParticles = null;
    let portalParticleMeta = null;

    const cleanup = () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);

      try {
        if (videoEl) {
          if (videoMetadataHandler) {
            videoEl.removeEventListener("loadedmetadata", videoMetadataHandler);
          }
          videoEl.pause();
          videoEl.src = "";
          videoEl.load();
        }
      } catch { }

      try {
        if (audioInstance) {
          if (audioInstance.isPlaying) audioInstance.stop();
          audioInstance.disconnect();
        }
      } catch { }

      try {
        if (toggleClickHandler && container) {
          container.removeEventListener("click", toggleClickHandler);
        }
      } catch { }

      try {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      } catch { }

      try {
        if (renderer) {
          renderer.dispose?.();
          renderer.domElement?.remove();
        }
      } catch { }

      try {
        if (scene) {
          scene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose?.();
            if (obj.material) {
              if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
              else obj.material.dispose?.();
            }
          });
        }
      } catch { }
    };

    (async () => {
      const THREE = await ensureThree();

      const w = Math.max(260, container.clientWidth);
      const h = Math.max(220, container.clientHeight);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
      camera.position.set(0, 0, 6);

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

      if (stageCfg.type === "Texto") {
        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 1.5);
        dir.position.set(2, 3, 4);
        scene.add(dir);
        //  DESPUÉS — con guard por si FontLoader no cargó
        const { FontLoader, TextGeometry } = await ensureThreeTextAddons();

        if (!FontLoader || !TextGeometry) {
          // Fallback: texto en Canvas 2D sobre un plano Three.js
          const canvas = document.createElement("canvas");
          canvas.width = 512; canvas.height = 128;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#0077b6";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 48px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText((stageCfg.text || "Encriptación").slice(0, 20), 256, 64);
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 1.5),
            new THREE.MeshBasicMaterial({ map: texture, transparent: true })
          );
          scene.add(plane);
          const ambient2 = new THREE.AmbientLight(0xffffff, 1);
          scene.add(ambient2);
          const animate = () => {
            if (disposed) return;
            plane.rotation.y = Math.sin(Date.now() * 0.001) * 0.15;
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(animate);
          };
          animate();
          return; // sale del bloque Texto, el fallback canvas ya está renderizando
        }

        const loader = new FontLoader();
        const font = await new Promise((resolve, reject) => {
          loader.load(
            "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
            resolve,
            undefined,
            reject
          );
        });

        const text = (stageCfg.text || "").trim().slice(0, 20) || "Encriptación";
        const geo = new TextGeometry(text, {
          font,
          size: 0.7,
          height: 0.18,
          curveSegments: 10,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelSegments: 4,
        });
        geo.computeBoundingBox();
        geo.center();

        const mat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.1,
          metalness: 0.0,
          emissive: 0xffffff,
          emissiveIntensity: 0.2,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        const animate = () => {
          if (disposed) return;
          mesh.rotation.y += 0.01;
          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };
        animate();
      }

      if (stageCfg.type === "Imagen") {
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

        const fitPlaneToAspect = (aspect, baseSize = 4.8) => {
          if (!aspect) return;
          if (aspect >= 1) {
            const width = baseSize;
            const height = baseSize / aspect;
            plane.scale.set(width, height, 1);
            planeBack.scale.set(width, height, 1);
          } else {
            const width = baseSize * aspect;
            const height = baseSize;
            plane.scale.set(width, height, 1);
            planeBack.scale.set(width, height, 1);
          }
        };

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        loader.load(
          stageCfg.imageUrl || "",
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
            if (!disposed && container) {
              container.textContent = "No se pudo cargar la imagen.";
            }
          }
        );

        const animate = () => {
          if (disposed) return;
          root.rotation.y += 0.01;
          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };
        animate();
      }

      if (stageCfg.type === "Video") {
        const ambient = new THREE.AmbientLight(0xffffff, 0.35);
        scene.add(ambient);
        const rim = new THREE.PointLight(0x7ffcff, 1.1);
        rim.position.set(2.5, 2.2, 3.5);
        scene.add(rim);

        videoEl = document.createElement("video");
        videoEl.src = stageCfg.videoUrl || "";
        videoEl.crossOrigin = "anonymous";
        videoEl.loop = true;
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.preload = "auto";

        videoTexture = new THREE.VideoTexture(videoEl);
        videoTexture.colorSpace = THREE.SRGBColorSpace;

        portalGroup = new THREE.Group();
        scene.add(portalGroup);

        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            opacity: 0.96,
          })
        );
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

        const fitPlaneToAspect = (aspect, baseSize = 8) => {
          if (!aspect) return;
          if (aspect >= 1) {
            const width = baseSize;
            const height = baseSize / aspect;
            plane.scale.set(width, height, 1);
            if (portalGlow) portalGlow.scale.set(width * 1.3, height * 1.3, 1);
            updatePortalFrame(width, height);
          } else {
            const width = baseSize * aspect;
            const height = baseSize;
            plane.scale.set(width, height, 1);
            if (portalGlow) portalGlow.scale.set(width * 1.3, height * 1.3, 1);
            updatePortalFrame(width, height);
          }
        };

        fitPlaneToAspect(16 / 9);

        videoMetadataHandler = () => {
          if (videoEl.videoWidth && videoEl.videoHeight) {
            fitPlaneToAspect(videoEl.videoWidth / videoEl.videoHeight);
          }
        };
        videoEl.addEventListener("loadedmetadata", videoMetadataHandler);

        videoEl.play().catch(() => { });

        toggleClickHandler = () => {
          if (videoEl.paused) {
            videoEl.muted = false;
            videoEl.play().catch(() => { });
          } else {
            videoEl.pause();
          }
        };
        container.addEventListener("click", toggleClickHandler);

        const animate = () => {
          if (disposed) return;
          const now = performance.now();
          const floatY = Math.sin(now * 0.0011) * 0.06;
          const floatX = Math.cos(now * 0.0009) * 0.02;
          portalGroup.position.y = floatY;
          portalGroup.position.x = floatX;
          portalGroup.rotation.z = Math.sin(now * 0.0006) * 0.04;
          portalGroup.rotation.y = Math.cos(now * 0.0005) * 0.04;

          if (portalParticles) {
            portalParticles.rotation.z += 0.002;
            portalParticles.rotation.y += 0.001;
          }

          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };
        animate();
      }

      if (stageCfg.type === "Audio") {
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

        const noteGroup = new THREE.Group();

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 24, 24),
          noteMaterial
        );
        head.position.set(-0.15, -0.1, 0);
        noteGroup.add(head);

        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12),
          noteMaterial
        );
        stem.position.set(0.1, 0.35, 0);
        noteGroup.add(stem);

        const flag = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.12, 0.08),
          noteMaterial
        );
        flag.position.set(0.35, 0.68, 0);
        flag.rotation.z = -0.35;
        noteGroup.add(flag);

        noteGroup.scale.set(2, 2, 2);

        scene.add(noteGroup);

        const listener = new THREE.AudioListener();
        camera.add(listener);
        audioInstance = new THREE.Audio(listener);
        const loader = new THREE.AudioLoader();
        loader.setCrossOrigin("anonymous");

        let audioAnalyser = null;
        let notePulse = 0;

        loader.load(
          stageCfg.audioUrl || "",
          (buffer) => {
            if (disposed) return;
            audioInstance.setBuffer(buffer);
            audioInstance.setLoop(true);
            audioInstance.setVolume(0.6);
            audioAnalyser = new THREE.AudioAnalyser(audioInstance, 128);
            audioInstance.play().catch(() => { });
          },
          undefined,
          () => {
            if (!disposed && container) {
              container.textContent = "No se pudo cargar el audio.";
            }
          }
        );

        toggleClickHandler = () => {
          if (!audioInstance.buffer) return;
          if (audioInstance.isPlaying) audioInstance.pause();
          else audioInstance.play().catch(() => { });
        };
        container.addEventListener("click", toggleClickHandler);

        const animate = () => {
          if (disposed) return;
          if (noteGroup && audioAnalyser) {
            const raw = audioAnalyser.getAverageFrequency() / 255;
            notePulse += (raw - notePulse) * 0.15;
            const scale = 1 + notePulse * 0.5;
            noteGroup.scale.setScalar(scale * 2);
            noteGroup.position.y = notePulse * 0.35;
          }

          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };
        animate();
      }

      resizeObserver = new ResizeObserver(() => {
        if (!renderer || !camera || disposed) return;
        const nw = Math.max(260, container.clientWidth);
        const nh = Math.max(220, container.clientHeight);
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      });
      resizeObserver.observe(container);
    })().catch(() => {
    });

    return cleanup;
  };
}

export default function Encriptacion({ withRA = null }) {
  const { ensureThree, ensureThreeTextAddons } = useThreeLoaders();
  const location = useLocation();   // ← AGREGAR esta línea
  const navigate = useNavigate();
  const initThreeStage = useMemo(
    () => initThreeStageFactory({ ensureThree, ensureThreeTextAddons }),
    [ensureThree, ensureThreeTextAddons]
  );

  // Igual que en CalculadoraMental: la decisión de activar RA puede venir
  // por navegación (location.state.withRA) o por prop. Antes este componente
  // solo miraba el prop `withRA` e ignoraba location.state, por lo que si la
  // pantalla anterior navegaba pasando state:{ withRA: true/false }, aquí se
  // perdía y la RA nunca quedaba activada correctamente.
  const raFromNav = location.state?.withRA ?? withRA;

  // Si withRA viene definido desde afuera, usarlo directamente sin mostrar el modal interno
  const [showARModal, setShowARModal] = useState(raFromNav === null); // muestra modal solo si no viene prop ni state
  const [arEnabled, setArEnabled] = useState(raFromNav);             // null = pendiente, true/false = definido
  const [setupStep, setSetupStep] = useState(
    raFromNav === null ? "ar" : raFromNav ? "ar" : "game"               // sin RA → ir directo a "game"
  );

  // ── Publicar setupStep inicial para que el Sidebar lo lea ──
  useEffect(() => {
    const initialStep = raFromNav === null ? "ar" : raFromNav ? "ar" : "game";
    navigate(location.pathname + location.search, {
      replace: true,
      state: { ...location.state, setupStep: initialStep }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeARTab, setActiveARTab] = useState("Inicio");



  const [arSelectedStages, setArSelectedStages] = useState(
    { Inicio: false, Acierto: false, Final: false }
  );

  const [arConfig, setArConfig] = useState({});
  const normalizeStageConfig = (stageCfg = {}) => {
    const text = stageCfg.text ?? "";
    const imageUrl = stageCfg.imageUrl ?? "";
    const audioUrl = stageCfg.audioUrl ?? "";
    const videoUrl = stageCfg.videoUrl ?? "";

    let detectedType = stageCfg.type;
    if (!detectedType) {
      if (videoUrl?.trim()) detectedType = "Video";
      else if (imageUrl?.trim()) detectedType = "Imagen";
      else if (audioUrl?.trim()) detectedType = "Audio";
      else if (text?.trim()) detectedType = "Texto";
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

  const buildMultiContentHtml = (stageCfg, ids) => {
    const cfg = normalizeStageConfig(stageCfg);

    const visualElements = [];
    if (cfg.hasText) visualElements.push('text');
    if (cfg.hasImage) visualElements.push('image');
    if (cfg.hasVideo) visualElements.push('video');

    const visualCount = visualElements.length;
    const isAudioOnly = cfg.hasAudio && visualCount === 0;

    const textHtml = cfg.hasText ? `
      <div class="ar-multi-text-3d">
        <div id="${ids.textContainerId}" class="ar-three-container"></div>
      </div>
    ` : '';

    const imageHtml = cfg.hasImage ? `
      <div class="ar-multi-image">
        <div id="${ids.imageContainerId}" class="ar-three-container"></div>
      </div>
    ` : '';

    const videoHtml = cfg.hasVideo ? `
      <div class="ar-multi-video">
        <div id="${ids.videoContainerId}" class="ar-three-container"></div>
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

    return `${textHtml}${imageHtml}${videoHtml}${audioHtml}`;
  };

  const mediaObjectUrlsRef = useRef({});
  useEffect(() => {
    return () => {
      Object.values(mediaObjectUrlsRef.current).forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch { }
      });
      mediaObjectUrlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    writeJSON(LS.arStages, arSelectedStages);
  }, [arSelectedStages]);

  useEffect(() => {
    writeJSON(LS.arConfig, arConfig);
  }, [arConfig]);

  const [gameConfig, setGameConfig] = useState(() =>
    readJSON(LS.gameConfig, { level: "basico", exerciseCount: 1 })
  );

  useEffect(() => {
    writeJSON(LS.gameConfig, gameConfig);
  }, [gameConfig]);

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

  const LEVEL_OFFSETS = { basico: 0, intermedio: 9, avanzado: 17 };
  const LEVEL_LABELS = { basico: 'A = 1', intermedio: 'A = 10', avanzado: 'A = 18' };

  const encrypt = (text) => {
    const offset = LEVEL_OFFSETS[gameConfig.level] ?? 0;
    return String(text).split('').map(char => {
      const upper = char.toUpperCase();
      if (upper === ' ') return '  ';
      const idx = ALPHABET_ES.indexOf(upper);
      if (idx === -1) return char;
      return String((idx + offset) % ALPHABET_ES.length + 1).padStart(2, '0');
    }).join(' ');
  };

  const [exerciseBank, setExerciseBank] = useState({ basico: [], intermedio: [], avanzado: [] });

  useEffect(() => {
    const fallback = {
      basico: [{ frase: 'HOLA' }, { frase: 'CASA' }, { frase: 'SOL' }],
      intermedio: [{ frase: 'CLAVE' }, { frase: 'CIFRAR' }, { frase: 'CODIGO' }, { frase: 'MENSAJE' }],
      avanzado: [{ frase: 'SECRETO' }, { frase: 'ALGORITMO' }, { frase: 'DESCIFRAR' },
      { frase: 'PROTEGER' }, { frase: 'SEGURIDAD' }],
    };
    fetch("/encrip/ejercicios.json")
      .then((r) => r.json())
      .then((data) => {
        setExerciseBank({
          basico: data?.basico ?? fallback.basico,
          intermedio: data?.intermedio ?? fallback.intermedio,
          avanzado: data?.avanzado ?? fallback.avanzado,
        });
      })
      .catch(() => setExerciseBank(fallback));
  }, []);

  // Límites fijos por nivel: Básico 3, Intermedio 4, Avanzado 5
  const MAX_PER_LEVEL = { basico: 3, intermedio: 4, avanzado: 5 };

  const availableCount = useMemo(() => {
    return MAX_PER_LEVEL[gameConfig.level] ?? 3;
  }, [gameConfig.level]);


  useEffect(() => {
    if (availableCount === 0) return;
    setGameConfig((prev) => ({
      ...prev,
      exerciseCount: Math.max(1, Math.min(prev.exerciseCount, availableCount)),
    }));
  }, [availableCount]);

  const [gameState, setGameState] = useState("playing"); // eslint-disable-line no-unused-vars
  const [pickedExercises, setPickedExercises] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [encryptedText, setEncryptedText] = useState("");
  const [answer, setAnswer] = useState("");

  const toggleARStage = (stage) => {
    setArSelectedStages((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const setARStageField = (stage, field, value) => {
    setArConfig((prev) => ({
      ...prev,
      [stage]: { ...(prev[stage] ?? {}), [field]: value },
    }));
  };

  const resetARConfig = () => {
    // Revoca todos los object URLs activos
    Object.values(mediaObjectUrlsRef.current).forEach((url) => {
      try { URL.revokeObjectURL(url); } catch { }
    });
    mediaObjectUrlsRef.current = {};

    setArSelectedStages({ Inicio: false, Acierto: false, Final: false });
    setArConfig({});
    setActiveARTab("Inicio");

    // Limpia también el localStorage
    try {
      localStorage.removeItem(LS.arStages);
      localStorage.removeItem(LS.arConfig);
    } catch { }
  };


  const MAX_AR_FILE_SIZE_MB = 50;
  const MAX_AR_FILE_SIZE_BYTES = MAX_AR_FILE_SIZE_MB * 1024 * 1024;

  const handleARStageFileChange = (stage, field, file) => {
    const key = `${stage}:${field}`;
    const prevUrl = mediaObjectUrlsRef.current[key];
    if (prevUrl) {
      try {
        URL.revokeObjectURL(prevUrl);
      } catch { }
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

  const escapeHtml = (s = "") =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const showStageModal = async (stage, swalOverrides = {}) => {
    if (!arSelectedStages?.[stage]) return true;

    const stageCfg = arConfig?.[stage] ?? {};
    if (!hasStageContent(stageCfg)) return true;
    if (!ensureSwal()) return false;

    const cfg = normalizeStageConfig(stageCfg);
    const timestamp = Date.now();
    const bgId = `enc-ar-bg-${stage}-${timestamp}`;
    const videoId = `enc-ar-video-${stage}-${timestamp}`;
    const useCamera = stage === 'Acierto';

    const ids = {
      textContainerId: `ar-text-${timestamp}`,
      imageContainerId: `ar-image-${timestamp}`,
      videoContainerId: `ar-video-${timestamp}`,
      audioId: `ar-audio-${timestamp}`,
    };

    const cleanups = [];
    let cleanupSymbols;
    let cameraStream;

    const innerHtml = buildMultiContentHtml(stageCfg, ids);
    const html = buildDecoratedHtml({
      bgId,
      innerHtml: `<div class="ar-multi-content">${innerHtml}</div>`,
      useCamera,
      videoId,
    });

    const res = await window.Swal?.fire({
      html,
      confirmButtonText: "Continuar",
      confirmButtonColor: '#0077b6',
      didOpen: async () => {
        if (useCamera) {
          cameraStream = await startCamera(videoId);
        }

        const bgEl = document.getElementById(bgId);
        cleanupSymbols = createFloatingSymbols(bgEl);

        if (cfg.hasText) {
          const container = document.getElementById(ids.textContainerId);
          if (container) cleanups.push(initThreeStage(container, { type: "Texto", text: cfg.text }));
        }
        if (cfg.hasImage) {
          const container = document.getElementById(ids.imageContainerId);
          if (container) cleanups.push(initThreeStage(container, { type: "Imagen", imageUrl: cfg.imageUrl }));
        }
        if (cfg.hasVideo) {
          const container = document.getElementById(ids.videoContainerId);
          if (container) cleanups.push(initThreeStage(container, { type: "Video", videoUrl: cfg.videoUrl }));
        }
      },
      willClose: () => {
        cleanups.forEach(cleanup => cleanup && cleanup());
        if (cleanupSymbols) cleanupSymbols();
        if (cameraStream) stopCamera(cameraStream);
      },
      ...swalOverrides,
    });

    return !!res?.isConfirmed;
  };





  const saveARConfigAndContinue = async () => {
    const v = validateARConfig();
    if (!v.ok) {
      toast(v.msg, "error");
      return;
    }

    writeJSON(LS.arStages, arSelectedStages);
    writeJSON(LS.arConfig, arConfig);

    setSetupStep("ar-summary");
    navigate(location.pathname + location.search, {
      replace: true,
      state: { ...location.state, setupStep: 'ar-summary' }
    });
  };

  const prepareRun = async () => {
    const pool = exerciseBank?.[gameConfig.level] ?? [];
    if (pool.length === 0) {
      toast("No hay ejercicios disponibles para este nivel", "error");
      return;
    }

    const count = Math.max(1, Math.min(Number(gameConfig.exerciseCount) || 1, pool.length));
    const selection = shuffle(pool).slice(0, count);

    setPickedExercises(selection);
    setStepIndex(0);
    setScore(0);
    setAnswer("");

    // Mostrar modal RA Inicio si está configurado, antes de empezar
    if (arEnabled && arSelectedStages?.['Inicio']) {
      const ok = await showStageModal('Inicio', {
        confirmButtonText: 'Comenzar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#0077b6',
      });
      if (!ok) return; // usuario canceló
    }

    // Cargar primer ejercicio y arrancar
    const firstEx = selection[0];
    setEncryptedText(encrypt(firstEx.frase));
    setGameState("playing");
    setSetupStep("playing");
  };
  const loadCurrentChallenge = (idx) => {
    const ex = pickedExercises[idx];
    if (!ex) return;

    setEncryptedText(encrypt(ex.frase));
    setAnswer("");
    setGameState("playing");
  };

  const handleVerify = async () => {
    const ex = pickedExercises[stepIndex];
    if (!ex) return;

    const ok = answer.trim().toUpperCase() === String(ex.frase).trim().toUpperCase();
    const isLastQuestion = stepIndex === pickedExercises.length - 1;

    if (ok) {
      setScore((s) => s + 10);
      if (!ensureSwal()) return;

      // ── ACIERTO ──────────────────────────────────────────────────────────
      // Si la pestaña Acierto tiene RA configurado → modal RA tiene PRIORIDAD
      const hasARacierto = arEnabled && arSelectedStages?.['Acierto'] &&
        hasStageContent(arConfig?.['Acierto'] ?? {});

      let continuar = false;

      if (hasARacierto) {
        // Modal RA de acierto puro (sin icon/title de Swal que lo oculta)
        continuar = await showStageModal('Acierto', {
          confirmButtonText: isLastQuestion ? '🏆 Ver Resultado' : '➡️ Siguiente ejercicio',
          showCancelButton: true,
          cancelButtonText: 'Finalizar juego',
          confirmButtonColor: '#0077b6',
        });
      } else {
        // Modal de acierto estilizado sin RA
        continuar = !!(await window.Swal.fire({
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
                          padding:0.5rem 1rem;letter-spacing:2px;display:inline-block;">
                ${String(ex.frase).toUpperCase()}
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
        }))?.isConfirmed;
      }

      if (continuar) {
        const next = stepIndex + 1;
        if (next < pickedExercises.length) {
          setStepIndex(next);
          loadCurrentChallenge(next);
        } else {
          // Mostrar modal Final RA si existe, si no Swal de fin
          const hasARfinal = arEnabled && arSelectedStages?.['Final'] &&
            hasStageContent(arConfig?.['Final'] ?? {});
          if (hasARfinal) {
            await showStageModal('Final', {
              confirmButtonText: '🏁 Terminar',
              showCancelButton: true,
              cancelButtonText: 'Volver a Jugar',
              confirmButtonColor: '#0077b6',
            });
          } else {
            await window.Swal.fire({
              html: `
                <div style="background:linear-gradient(145deg,#03045e 0%,#023e8a 50%,#0077b6 100%);
                            border-radius:20px;padding:2rem 1.5rem;text-align:center;">
                  <div style="font-size:3.5rem;margin-bottom:0.5rem;">🏆</div>
                  <div style="color:#ffd60a;font-size:1.6rem;font-weight:800;margin-bottom:0.5rem;">
                    ¡Juego Completado!
                  </div>
                  <div style="color:#caf0f8;font-size:1rem;">Terminaste todos los ejercicios.</div>
                </div>
              `,
              confirmButtonText: '🏁 Terminar',
              showCancelButton: true,
              cancelButtonText: 'Volver a Jugar',
              confirmButtonColor: '#0077b6',
            });
          }
          setGameState("config");
          setPickedExercises([]);
          setStepIndex(0);
          setEncryptedText("");
          setAnswer("");
        }
      } else {
        setGameState("config");
        setPickedExercises([]);
        setStepIndex(0);
        setEncryptedText("");
        setAnswer("");
      }

    } else {
      // ── ERROR ─────────────────────────────────────────────────────────────
      // El modal de error se muestra siempre (con o sin RA)
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
                        padding:0.5rem 1rem;letter-spacing:2px;display:inline-block;">
              ${String(ex.frase).toUpperCase()}
            </div>
            <div style="color:#fca5a5;font-size:0.9rem;margin-top:1rem;font-weight:600;">
              Tu respuesta: <span style="color:#ffffff;">${answer.trim().toUpperCase() || '—'}</span>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: '🔄 Reiniciar juego',
        cancelButtonText: 'Finalizar juego',
        confirmButtonColor: '#b91c1c',
      });
      if (result?.isConfirmed) {
        setPickedExercises([]);
        setStepIndex(0);
        setScore(0);
        setEncryptedText("");
        setAnswer("");
        setGameState("welcome");
      } else {
        setGameState("config");
        setPickedExercises([]);
        setStepIndex(0);
        setScore(0);
        setEncryptedText("");
        setAnswer("");
      }
    }
  };

  const renderGameScreen = () => {
    return (
      <div className="enc-screen">
        <div className="enc-panel enc-game-panel">
          <AnimatedTitle />
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr',
            margin: '-0.5rem auto 1.5rem auto', maxWidth: '640px',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '0.75rem', padding: '0.85rem 1.25rem', textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>📋 Reglas Básicas</span>
            <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: 500 }}>Observa el mensaje encriptado, descifra cada número usando el alfabeto de referencia y escribe la frase original.</span>
          </div>

          <div className="enc-game-layout">

            {/* ── Columna izquierda ── */}
            <div className="enc-game-content">

              <div className="enc-card-block">
                <div className="enc-card-label">
                  <span className="enc-card-label-icon">🔐</span>
                  Mensaje encriptado
                </div>
                <div className="enc-encrypted-display">{encryptedText || '\u00A0'}</div>
                <div className="enc-hint-inline">
                  Cada número representa una letra. Los espacios dobles separan palabras.
                </div>
              </div>

              <div className="enc-card-block">
                <div className="enc-card-label">
                  <span className="enc-card-label-icon">✍️</span>
                  Tu respuesta
                </div>
                <input
                  className="enc-input"
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && answer.trim()) handleVerify();
                  }}
                  placeholder="Escribe la frase descifrada..."
                  autoFocus
                />
                <button
                  className="enc-btn primary enc-btn-verify"
                  disabled={!answer.trim()}
                  onClick={handleVerify}
                >
                  ✓ Verificar respuesta
                </button>
              </div>



            </div>

            {/* ── Columna derecha: progreso + rueda + botón ── */}
            <div className="enc-image-reference">

              {/* Panel de progreso — arriba de la rueda */}
              <div className="enc-stats-block">
                <h3>Progreso</h3>
                <div className="enc-stats-item">
                  <span>Ejercicio:</span>
                  <strong>{Math.min(stepIndex + 1, pickedExercises.length)}/{pickedExercises.length}</strong>
                </div>
                <div className="enc-stats-item">
                  <span>Puntaje:</span>
                  <strong>{score}</strong>
                </div>
                <div className="enc-stats-item">
                  <span>Nivel:</span>
                  <strong>{gameConfig.level.charAt(0).toUpperCase() + gameConfig.level.slice(1)}</strong>
                </div>
              </div>

              {/* Rueda */}
              <CipherWheel />

              {/* Botón Finalizar — debajo de la rueda */}
              <button
                className="enc-btn"
                style={{ margin: '0.75rem 0 0 0', width: '100%', background: 'var(--secondary)' }}
                onClick={() => { setSetupStep('game'); setGameState('config'); }}
              >
                Finalizar Juego
              </button>

            </div>

          </div>

          {/* ── Footer Vista Previa: Anterior | Terminar configuración ── */}
          <div className="enc-btn-group" style={{ marginTop: '1.5rem' }}>
            <button
              className="enc-btn"
              style={{ margin: 0, background: 'var(--secondary)' }}
              onClick={() => {
                setSetupStep('game');
                setGameState('config');
                setPickedExercises([]);
                setStepIndex(0);
                setEncryptedText('');
                setAnswer('');
                navigate(location.pathname + location.search, {
                  replace: true,
                  state: { ...location.state, setupStep: 'game' }
                });
              }}
            >
              ← Anterior
            </button>

            <button
              className="enc-btn primary"
              style={{ margin: 0 }}
              onClick={() => {
                setSetupStep('game-summary');
                navigate("/settings?view=Summary", {
                  replace: true,
                  state: {
                    ...location.state,
                    gameType: "encriptacion",
                    gameConfig: { level: gameConfig.level, exerciseCount: gameConfig.exerciseCount },
                    arNamespace: STORAGE_NS,
                    arSelectedStages: arEnabled ? arSelectedStages : { Inicio: false, Acierto: false, Final: false },
                    arConfig: arEnabled ? arConfig : {},
                  },
                });
              }}
            >
              Terminar configuración →
            </button>
          </div>

        </div>
      </div>
    );
  };

  const stepsOrder = arEnabled ? ['ar', 'ar-summary', 'game', 'playing'] : ['game', 'playing'];
  const stepLabels = { ar: 'RA', 'ar-summary': 'Resumen', game: 'Juego', playing: 'Vista Previa' };

  const ProgressBar = ({ currentStep }) => {
    const currentIdx = stepsOrder.indexOf(currentStep);
    return (
      <div className="setup-progress-bar">
        {stepsOrder.map((step, i) => (
          <React.Fragment key={step}>
            <div className={`setup-progress-step ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}>
              <div className="setup-progress-dot" />
              <span>{stepLabels[step]}</span>
            </div>
            {i < stepsOrder.length - 1 && <div className="setup-progress-line" />}
          </React.Fragment>
        ))}
      </div>
    );
  };
  // AGREGAR — AnimatedTitle igual que CalculadoraMental
  const AnimatedTitle = () => (
    <div className="enc-animated-title-container">
      <h1 className="enc-animated-title">
        {'Juego de Cripto Mensajes'.split('').map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
      <div className="enc-floating-icons">
        <span className="enc-icon-1">🔐</span>
        <span className="enc-icon-2">🗝️</span>
        <span className="enc-icon-3">01</span>
        <span className="enc-icon-4">Ñ</span>
      </div>
    </div>
  );

  // ✅ REEMPLAZA COMPLETO desde "const CipherWheel = () => {" hasta su cierre "};"

  const CipherWheel = () => {
    const canvasRef = React.useRef(null);
    const rotRef = React.useRef(0);
    const dragRef = React.useRef({ dragging: false, startX: 0, startRot: 0 });
    const animRef = React.useRef(null);

    const offset = LEVEL_OFFSETS[gameConfig.level] ?? 0;
    const label = LEVEL_LABELS[gameConfig.level] ?? 'A = 1';
    const N = ALPHABET_ES.length; // 27

    const drawWheel = React.useCallback((rot) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const CX = W / 2, CY = H / 2;
      const R_OUT = CX * 0.97, R_MID = CX * 0.72, R_IN = CX * 0.48, R_CORE = CX * 0.32;
      ctx.clearRect(0, 0, W, H);

      const sector = (2 * Math.PI) / N;
      const startOff = -Math.PI / 2 - sector / 2;

      // ── Anillo exterior blanco (letras) ──
      ctx.beginPath(); ctx.arc(CX, CY, R_OUT, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.strokeStyle = '#1a5fa8'; ctx.lineWidth = 2; ctx.stroke();

      for (let i = 0; i < N; i++) {
        const a1 = startOff + i * sector, a2 = a1 + sector, amid = (a1 + a2) / 2;
        const even = i % 2 === 0;
        // sector fondo
        ctx.beginPath();
        ctx.moveTo(CX + R_MID * Math.cos(a1), CY + R_MID * Math.sin(a1));
        ctx.arc(CX, CY, R_OUT, a1 + 0.01, a2 - 0.01);
        ctx.lineTo(CX + R_MID * Math.cos(a2), CY + R_MID * Math.sin(a2));
        ctx.arc(CX, CY, R_MID, a2 - 0.01, a1 + 0.01, true);
        ctx.closePath();
        ctx.fillStyle = even ? '#f0f9ff' : '#e0f2fe'; ctx.fill();
        ctx.strokeStyle = '#5b9bd5'; ctx.lineWidth = 0.5; ctx.stroke();
        // letra
        const lx = CX + (R_MID + (R_OUT - R_MID) / 2) * Math.cos(amid);
        const ly = CY + (R_MID + (R_OUT - R_MID) / 2) * Math.sin(amid);
        ctx.save();
        ctx.translate(lx, ly); ctx.rotate(amid + Math.PI / 2);
        ctx.fillStyle = '#023e8a'; ctx.font = `bold ${W * 0.038}px Inter,sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(ALPHABET_ES[i], 0, 0);
        ctx.restore();
      }

      // ── Anillo interior azul (números, ROTA) ──
      ctx.save();
      ctx.translate(CX, CY); ctx.rotate(rot); ctx.translate(-CX, -CY);

      ctx.beginPath(); ctx.arc(CX, CY, R_MID - 1, 0, 2 * Math.PI);
      ctx.fillStyle = '#3a7fc1'; ctx.fill();
      ctx.strokeStyle = '#1a5fa8'; ctx.lineWidth = 1.5; ctx.stroke();

      for (let i = 0; i < N; i++) {
        const a1 = startOff + i * sector, a2 = a1 + sector, amid = (a1 + a2) / 2;
        const even = i % 2 === 0;
        const numVal = (i + offset) % N + 1;
        ctx.beginPath();
        ctx.moveTo(CX + R_IN * Math.cos(a1), CY + R_IN * Math.sin(a1));
        ctx.arc(CX, CY, R_MID - 2, a1 + 0.01, a2 - 0.01);
        ctx.lineTo(CX + R_IN * Math.cos(a2), CY + R_IN * Math.sin(a2));
        ctx.arc(CX, CY, R_IN, a2 - 0.01, a1 + 0.01, true);
        ctx.closePath();
        ctx.fillStyle = even ? '#5b9bd5' : '#4a8bc4'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 0.5; ctx.stroke();
        const nx = CX + (R_IN + (R_MID - 2 - R_IN) / 2) * Math.cos(amid);
        const ny = CY + (R_IN + (R_MID - 2 - R_IN) / 2) * Math.sin(amid);
        ctx.save();
        ctx.translate(nx, ny); ctx.rotate(amid + Math.PI / 2);
        ctx.fillStyle = '#ffffff'; ctx.font = `bold ${W * 0.032}px Courier New,monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(numVal).padStart(2, '0'), 0, 0);
        ctx.restore();
      }
      ctx.restore();

      // ── Anillo interior blanco (separador) ──
      ctx.beginPath(); ctx.arc(CX, CY, R_IN - 1, 0, 2 * Math.PI);
      ctx.fillStyle = '#e8f4ff'; ctx.fill();
      ctx.strokeStyle = '#1a5fa8'; ctx.lineWidth = 1.5; ctx.stroke();

      // marcas en el separador
      for (let i = 0; i < N; i++) {
        const a = startOff + i * sector + sector / 2;
        const x1 = CX + (R_IN - 3) * Math.cos(a), y1 = CY + (R_IN - 3) * Math.sin(a);
        const x2 = CX + (R_IN - 9) * Math.cos(a), y2 = CY + (R_IN - 9) * Math.sin(a);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#5b9bd5'; ctx.lineWidth = 1; ctx.stroke();
      }

      // ── Centro ──
      ctx.beginPath(); ctx.arc(CX, CY, R_CORE, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.strokeStyle = '#1a5fa8'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#1a5fa8';
      ctx.font = `bold ${W * 0.038}px Inter,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, CX, CY);

      // ── Borde exterior ──
      ctx.beginPath(); ctx.arc(CX, CY, R_OUT, 0, 2 * Math.PI);
      ctx.strokeStyle = '#1a5fa8'; ctx.lineWidth = 3; ctx.stroke();
    }, [offset, label, N]);

    React.useEffect(() => { drawWheel(rotRef.current); }, [drawWheel]);

    const spinStep = (2 * Math.PI) / N;

    const animSpin = (from, to) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const dur = 380, t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        rotRef.current = from + (to - from) * e;
        drawWheel(rotRef.current);
        if (p < 1) animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    };

    const onMouseDown = (e) => {
      dragRef.current = { dragging: true, startX: e.clientX, startRot: rotRef.current };
    };
    const onMouseMove = (e) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      rotRef.current = dragRef.current.startRot + dx * 0.012;
      drawWheel(rotRef.current);
    };
    const onMouseUp = () => { dragRef.current.dragging = false; };
    const onTouchStart = (e) => {
      dragRef.current = { dragging: true, startX: e.touches[0].clientX, startRot: rotRef.current };
    };
    const onTouchMove = (e) => {
      if (!dragRef.current.dragging) return;
      rotRef.current = dragRef.current.startRot + (e.touches[0].clientX - dragRef.current.startX) * 0.012;
      drawWheel(rotRef.current);
    };

    React.useEffect(() => {
      window.addEventListener('mouseup', onMouseUp);
      return () => window.removeEventListener('mouseup', onMouseUp);
    }, []);

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <canvas
          ref={canvasRef} width={480} height={480}
          style={{
            width: '100%', maxWidth: '480px', cursor: 'grab', touchAction: 'none',
            filter: 'drop-shadow(0 4px 16px rgba(26,95,168,0.2))'
          }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
        />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => animSpin(rotRef.current, rotRef.current - spinStep)}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: '2px solid #1a5fa8',
              background: 'transparent', color: '#1a5fa8', cursor: 'pointer', fontSize: 16
            }}>◀</button>
          <span style={{
            fontSize: '0.78rem', fontWeight: 700, color: '#1a5fa8',
            textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>
            {label} — Arrastra o usa las flechas
          </span>
          <button onClick={() => animSpin(rotRef.current, rotRef.current + spinStep)}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: '2px solid #1a5fa8',
              background: 'transparent', color: '#1a5fa8', cursor: 'pointer', fontSize: 16
            }}>▶</button>
        </div>
      </div>
    );
  };
  return (
    <>
      <style>{`
        
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
:root {
  --primary: #005f92;
  --secondary: #1f2937;
  --success: #22c55e;
  --danger: #ef4444;
  --light: #f3f4f6;
  --dark: #111827;
  --bg-color: #f0f2f5;
  --confirm-color: #005f92;
  --font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif;
}
* { font-family: var(--font-family) !important; }

        .enc-screen {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          box-sizing: border-box;
        }
 /* AGREGAR en el bloque <style> */
/* ── Título animado (igual que CalculadoraMental) ── */
.enc-animated-title-container {
  position: relative;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}
.enc-animated-title {
  text-align: center;
  font-size: 3rem;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 0.25rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  font-family: 'Merriweather', serif;
}
.enc-animated-title span {
  display: inline-block;
  animation: encWaveTitle 1.8s infinite;
  position: relative;
}
@keyframes encWaveTitle {
  0%, 40%, 100% { transform: translateY(0); }
  20%           { transform: translateY(-20px); }
}
.enc-floating-icons span {
  position: absolute;
  color: var(--primary);
  opacity: 0.3;
  font-size: 1.5rem;
  font-weight: 700;
  animation: encFloat 4s ease-in-out infinite;
}
.enc-icon-1 { top: -20px; left: 10%; animation-delay: 0s !important; }
.enc-icon-2 { top: 0;     right: 10%; animation-delay: 1s !important; }
.enc-icon-3 { bottom: 0px; left: 20%; animation-delay: 2s !important; }
.enc-icon-4 { bottom: -10px; right: 20%; animation-delay: 3s !important; }
@keyframes encFloat {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-15px); }
}
        .enc-panel {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          width: 100%;
        }

        .enc-single-panel {
          width: 100%;
        }

   .enc-game-panel {
  width: 100%;
  max-width: 1200px;
} 
        .enc-welcome-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
          padding: 2rem;
        }

        .enc-welcome-content h2 {
          margin-bottom: 0.5rem;
          color: var(--primary);
        }

        .enc-welcome-content p {
          margin-bottom: 2rem;
          color: var(--secondary);
        }

        .enc-title {
          margin: 0 0 1.5rem 0;
          color: var(--primary);
          text-align: center;
          font-weight: 700;
          font-size: 2rem;
        }

        .enc-section {
          background: #f8f9fa;
          border-radius: 14px;
          padding: 1rem 1.2rem;
          margin-top: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        /*  DESPUÉS */
.enc-label {
  display: block;
  font-weight: 700;
  font-size: 0.92rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary);
  margin-bottom: 0.6rem;
}

        /* DESPUÉS */
.enc-field {
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
  box-sizing: border-box;
}
.enc-field:focus {
  border-color: var(--primary);
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.12);
}
.enc-field:hover {
  border-color: #94a3b8;
  background: #ffffff;
}

        /*  DESPUÉS */
.enc-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none !important;
  border-radius: 8px;
  cursor: pointer;
  background-color: var(--primary) !important;
  background-image: none !important;
  color: white !important;
  box-shadow: none !important;
  transition: background-color 0.3s, opacity 0.2s;
  width: 100%;
  margin-top: 1rem;
}
.enc-btn:hover:not(:disabled) { background-color: #004a73 !important; }
.enc-btn:focus { box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.25) !important; }
.enc-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.enc-btn.primary { background-color: var(--primary) !important; }
.enc-btn.success { background-color: var(--success) !important; }
.enc-btn.success:hover:not(:disabled) { background-color: #16a34a !important; }
/* Grupo de botones de navegación — igual que button-group de CalculadoraMental */
.enc-btn-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  width: 100%;
}
.enc-btn-group > :only-child {
  grid-column: 1 / -1;
  justify-self: center;
  width: min(360px, 100%);
}
        /* RA cards */
        .ra-stage-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 270px;
          overflow-y: auto;
        }

        .ra-stage-card {
          border: 1px solid rgba(2, 62, 138, 0.15);
          border-radius: 14px;
          padding: 12px 14px;
          background: white;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .ra-stage-card.is-active {
          border-color: var(--primary);
          box-shadow: 0 10px 24px rgba(0, 119, 182, 0.2);
          background: linear-gradient(160deg, rgba(0, 119, 182, 0.08), rgba(255, 255, 255, 0.95));
        }

        .ra-stage-toggle {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          font-weight: 600;
          color: var(--dark);
          cursor: pointer;
          user-select: none;
        }

        .ra-stage-toggle input {
          accent-color: var(--primary);
        }

        .ra-stage-body { margin-top: 0.75rem; padding-left: 0.5rem; display: grid; gap: 0.6rem; }
        .ra-field-label { font-weight: 600; color: var(--dark); font-size: 0.9rem; }

        .ra-preview-btn {
          background-color: rgba(0, 119, 182, 0.1);
          color: var(--dark);
          border: 1px solid rgba(0, 119, 182, 0.3);
          font-weight: 600;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .ra-preview-btn:hover { background-color: rgba(0, 119, 182, 0.18); }


/* DESPUÉS */
.enc-game-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.enc-game-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.enc-image-reference {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 0.75rem;
}

@media (max-width: 900px) {
  .enc-game-layout { grid-template-columns: 1fr; }
  .enc-image-reference { max-width: 520px; margin: 0 auto; align-items: center; }
}
/* ── Tarjetas de sección ── */
.enc-card-block {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.enc-card-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--primary);
}

.enc-card-label-icon {
  font-size: 1rem;
}

.enc-hint-inline {
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
  font-weight: 500;
  line-height: 1.4;
}

/* DESPUÉS */
.enc-encrypted-display {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dark);
  min-height: 44px;
  text-align: center;
  background: white;
  border-radius: 10px;
  border: 2px dashed var(--primary);
  padding: 0.6rem 0.7rem;
  letter-spacing: 3px;
  word-break: break-word;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
}

/* ── Input de respuesta ── */
.enc-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  color: var(--dark);
}

.enc-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0,95,146,0.12);
}

/* ── Botón verificar ── */
.enc-btn-verify {
  width: 100%;
  margin-top: 0;
  padding: 0.85rem;
  font-size: 1rem;
  border-radius: 10px;
  letter-spacing: 0.03em;
}

/* ── Fila de estadísticas ── */
.enc-stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
/* Panel progreso lateral — igual al HTML generado */
.enc-stats-block {
  border: 1px solid #d1d5db;
  padding: 1rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  height: fit-content;
}
.enc-stats-block h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: var(--secondary);
  font-weight: 700;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d1d5db;
  font-family: 'Nunito', sans-serif;
}
.enc-stats-item {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  display: flex;
  justify-content: space-between;
  font-family: 'Nunito', sans-serif;
}
.enc-stats-item strong {
  font-weight: 700;
  color: #111827;
}
.enc-stats-item:last-child { margin-bottom: 0; }

.enc-stats-item strong {
  font-weight: 800;
  color: var(--primary);
  font-size: 1.1rem;
}

.enc-stat-box {
  background: #f0f9ff;
  border: 1.5px solid #bae6fd;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.enc-stat-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
}

/* DESPUÉS */
.enc-stat-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.1;
}

/* ── Responsive ── */
@media (max-width: 1060px) {
  .enc-game-layout    { flex-direction: column; }
  .enc-image-reference { flex: 1 1 auto; max-width: 520px; margin: 0 auto; }
}



        /* DESPUÉS — igual que CalculadoraMental */
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
        .enc-ar-bg {
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

        .enc-ar-bg-camera {
          background: transparent;
        }

        .enc-ar-camera-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
          border-radius: 28px;
          background: none;
        }

        .enc-ar-bg-elements {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }

        .enc-ar-content {
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

        .enc-ar-top {
          color: #ffd60a;
          font-weight: 800;
          text-shadow: 2px 2px 8px #3a0ca3, 0 0 20px rgba(0,0,0,0.8);
          text-align: center;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          backdrop-filter: blur(5px);
        }

        .enc-ar-three-wrap {
          width: 100%;
          height: 240px;
          overflow: hidden;
          position: relative;
          z-index: 1;
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

        .ar-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #e9ecef;
        }

        /*  DESPUÉS */
.ar-tab {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: var(--secondary);
  transition: all 0.3s ease;
  position: relative;
  font-family: var(--font-family);
}
        .ar-tab:hover {
          color: var(--primary);
          background: rgba(0, 123, 255, 0.05);
        }
      
        .ar-tab.active {
          color: var(--primary);
        }

        .ar-tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary);
          border-radius: 3px 3px 0 0;
        }

        .ar-tab-check {
          display: inline-block;
          margin-left: 0.4rem;
          color: var(--success);
          font-size: 0.9rem;
        }

        .ar-tab.enabled .ar-tab-check {
          color: var(--success);
        }

        .ar-tab-content {
          padding: 1.5rem;
          background: transparent;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .ar-stage-toggle-row {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e9ecef;
        }
         /* ✅ AGREGAR en el bloque <style> de Encriptacion */
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
  font-family: var(--font-family);
  text-align: center;
}
.ar-file-upload-btn:hover {
  border-color: #005f92;
  background: #e0f2fe;
  color: #005f92;
}
.ar-file-upload-btn.has-file {
  border-color: #22c55e;
  background: #f0fdf4;
  color: #15803d;
  border-style: solid;
}
.ar-file-input-hidden { display: none; }
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
          transition: all 0.2s ease;
        }

        .ar-content-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
        }

        .ar-content-card.has-content {
          border-color: var(--success);
          background: linear-gradient(135deg, rgba(40, 167, 69, 0.05), white);
        }

        .ar-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .ar-card-icon {
          font-size: 1.5rem;
        }

        .ar-card-title {
          font-weight: 600;
          color: var(--dark);
          font-size: 1rem;
          flex: 1;
        }

        .ar-delete-btn {
          background: #ff4757;
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
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
          max-height: 100px;
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
          max-height: 100px;
          border-radius: 8px;
          margin-top: 0.5rem;
        }

        .ar-disabled-message {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 150px;
          background: #f8f9fa;
          border-radius: 12px;
          color: var(--secondary);
        }

        .ar-disabled-message p {
          font-size: 1rem;
          margin: 0;
          text-align: center;
        }

        @media (max-width: 600px) {
          .ar-content-cards {
            grid-template-columns: 1fr;
          }
        }

        .ar-multi-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          width: 100%;
          margin: 0;
        }

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

        .ar-multi-text-3d {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ar-multi-image,
        .ar-multi-video {
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 12px;
          overflow: hidden;
        }

        .ar-three-container {
          width: 300px;
          height: 200px;
          border-radius: 12px;
        }
         /* AGREGAR — barra de progreso de pasos */
.setup-progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.setup-progress-step {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
}
.setup-progress-step.active { color: var(--primary); }
.setup-progress-step.done { color: var(--success); }
.setup-progress-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #e2e8f0;
}
.setup-progress-step.active .setup-progress-dot { background: var(--primary); }
.setup-progress-step.done .setup-progress-dot { background: var(--success); }
.setup-progress-line {
  flex: 1; height: 2px; background: #e2e8f0; max-width: 40px; border-radius: 999px;
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
          /* ✅ AGREGAR — estilos para textarea y file upload botones */
.ra-field {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(2, 62, 138, 0.2);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: var(--font-family);
  background: #ffffff;
  box-sizing: border-box;
  resize: vertical;
}
.ra-field:focus {
  outline: 2px solid rgba(0, 119, 182, 0.3);
  border-color: var(--primary);
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
  font-family: var(--font-family);
  text-align: center;
  box-sizing: border-box;
}
.ar-file-upload-btn:hover {
  border-color: var(--primary);
  background: #e0f2fe;
  color: var(--primary);
}
.ar-file-upload-btn.has-file {
  border-color: var(--success);
  background: #f0fdf4;
  color: #15803d;
  border-style: solid;
}
.ar-file-input-hidden {
  display: none;
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
                onClick={() => { resetARConfig(); setArEnabled(true); setShowARModal(false); }}
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

      {setupStep === "ar" && (
        <div className="enc-screen">
          <div className="enc-panel enc-single-panel">

            <AnimatedTitle />
            <ProgressBar currentStep="ar" />   {/* ← barra de progreso aquí */}
            <h2 style={{ margin: 0, color: "var(--primary)", textAlign: "center" }}>
              Configuración de RA
            </h2>

            <div className="ar-tabs">
              {AR_STAGES.map((stage) => (
                <button
                  key={stage}
                  className={`ar-tab ${activeARTab === stage ? "active" : ""} ${arSelectedStages?.[stage] ? "enabled" : ""}`}
                  onClick={() => setActiveARTab(stage)}
                >
                  {stage}
                  {arSelectedStages?.[stage] && <span className="ar-tab-check">✓</span>}
                </button>
              ))}
            </div>

            <div className="ar-tab-content">
              <div className="ar-stage-toggle-row">
                <label className="ra-stage-toggle">
                  <input
                    type="checkbox"
                    checked={!!arSelectedStages?.[activeARTab]}
                    onChange={() => toggleARStage(activeARTab)}
                  />
                  <span>Habilitar etapa {activeARTab}</span>
                </label>
              </div>


              {arSelectedStages[activeARTab] && (
                <div className="ar-content-cards">

                  {/* ── TEXTO ── */}
                  <div className={`ar-content-card ${arConfig?.[activeARTab]?.text?.trim() ? "has-content" : ""}`}>
                    <div className="ar-card-header">
                      <span className="ar-card-icon">
                        <Player src="/images/areas/texto.json" loop autoplay style={{ width: 68, height: 68 }} />
                      </span>
                      <span className="ar-card-title">Texto</span>
                      {arConfig?.[activeARTab]?.text?.trim() && (
                        <button className="ar-delete-btn" onClick={() => setARStageField(activeARTab, "text", "")} title="Eliminar texto">✕</button>
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

                  {/* ── IMAGEN ── */}
                  <div className={`ar-content-card ${arConfig?.[activeARTab]?.imageUrl?.trim() ? "has-content" : ""}`}>
                    <div className="ar-card-header">
                      <span className="ar-card-icon">
                        <Player src="/images/areas/image.json" loop autoplay style={{ width: 68, height: 68 }} />
                      </span>
                      <span className="ar-card-title">Imagen</span>
                      {arConfig?.[activeARTab]?.imageUrl?.trim() && (
                        <button className="ar-delete-btn" onClick={() => handleARStageFileChange(activeARTab, "imageUrl", null)} title="Eliminar imagen">✕</button>
                      )}
                    </div>
                    <div className="ar-card-body">
                      <input
                        id={`file-image-${activeARTab}`}
                        className="ar-file-input-hidden"
                        type="file"
                        accept="image/*"
                        onClick={(e) => { e.target.value = null; }}
                        onChange={(e) => handleARStageFileChange(activeARTab, "imageUrl", e.target.files?.[0] ?? null)}
                      />
                      <label
                        htmlFor={`file-image-${activeARTab}`}
                        className={`ar-file-upload-btn ${arConfig?.[activeARTab]?.imageUrl?.trim() ? 'has-file' : ''}`}
                      >
                        {arConfig?.[activeARTab]?.imageUrl?.trim() ? '✅ Imagen seleccionada' : '📁 Seleccionar imagen'}
                      </label>
                      {arConfig?.[activeARTab]?.imageUrl && (
                        <img src={arConfig[activeARTab].imageUrl} alt="Preview" className="ar-preview-image" />
                      )}
                    </div>
                  </div>

                  {/* ── AUDIO ── */}
                  <div className={`ar-content-card ${arConfig?.[activeARTab]?.audioUrl?.trim() ? "has-content" : ""}`}>
                    <div className="ar-card-header">
                      <span className="ar-card-icon">
                        <Player src="/images/areas/audio.json" loop autoplay style={{ width: 68, height: 68 }} />
                      </span>
                      <span className="ar-card-title">Audio</span>
                      {arConfig?.[activeARTab]?.audioUrl?.trim() && (
                        <button className="ar-delete-btn" onClick={() => handleARStageFileChange(activeARTab, "audioUrl", null)} title="Eliminar audio">✕</button>
                      )}
                    </div>
                    <div className="ar-card-body">
                      <input
                        id={`file-audio-${activeARTab}`}
                        className="ar-file-input-hidden"
                        type="file"
                        accept="audio/*"
                        onClick={(e) => { e.target.value = null; }}
                        onChange={(e) => handleARStageFileChange(activeARTab, "audioUrl", e.target.files?.[0] ?? null)}
                      />
                      <label
                        htmlFor={`file-audio-${activeARTab}`}
                        className={`ar-file-upload-btn ${arConfig?.[activeARTab]?.audioUrl?.trim() ? 'has-file' : ''}`}
                      >
                        {arConfig?.[activeARTab]?.audioUrl?.trim() ? '✅ Audio seleccionado' : '🎵 Seleccionar audio'}
                      </label>
                      {arConfig?.[activeARTab]?.audioUrl && (
                        <audio controls src={arConfig[activeARTab].audioUrl} className="ar-preview-audio" />
                      )}
                    </div>
                  </div>

                  {/* ── VIDEO ── */}
                  <div className={`ar-content-card ${arConfig?.[activeARTab]?.videoUrl?.trim() ? "has-content" : ""}`}>
                    <div className="ar-card-header">
                      <span className="ar-card-icon">
                        <Player src="/images/areas/video.json" loop autoplay style={{ width: 68, height: 68 }} />
                      </span>
                      <span className="ar-card-title">Video</span>
                      {arConfig?.[activeARTab]?.videoUrl?.trim() && (
                        <button className="ar-delete-btn" onClick={() => handleARStageFileChange(activeARTab, "videoUrl", null)} title="Eliminar video">✕</button>
                      )}
                    </div>
                    <div className="ar-card-body">
                      <input
                        id={`file-video-${activeARTab}`}
                        className="ar-file-input-hidden"
                        type="file"
                        accept="video/*"
                        onClick={(e) => { e.target.value = null; }}
                        onChange={(e) => handleARStageFileChange(activeARTab, "videoUrl", e.target.files?.[0] ?? null)}
                      />
                      <label
                        htmlFor={`file-video-${activeARTab}`}
                        className={`ar-file-upload-btn ${arConfig?.[activeARTab]?.videoUrl?.trim() ? 'has-file' : ''}`}
                      >
                        {arConfig?.[activeARTab]?.videoUrl?.trim() ? '✅ Video seleccionado' : '🎬 Seleccionar video'}
                      </label>
                      {arConfig?.[activeARTab]?.videoUrl && (
                        <video controls src={arConfig[activeARTab].videoUrl} className="ar-preview-video" />
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

            <div className="enc-btn-group">
              <button className="enc-btn" style={{ margin: 0, background: 'var(--secondary)' }} onClick={() => navigate(-1)}>
                ← Anterior
              </button>
              <button className="enc-btn primary" style={{ margin: 0 }} onClick={saveARConfigAndContinue}>
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}

      {setupStep === "ar-summary" && (
        <div className="enc-screen">
          <div className="enc-panel enc-single-panel">

            <AnimatedTitle />
            <ProgressBar currentStep="ar-summary" />   {/* ← barra de progreso aquí */}
            <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 700 }}>
              Resumen de Configuración RA
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
            <div className="enc-btn-group">
              <button className="enc-btn" style={{ margin: 0, background: 'var(--secondary)' }} onClick={() => {
                setSetupStep('ar');
                navigate(location.pathname + location.search, {
                  replace: true,
                  state: { ...location.state, setupStep: 'ar' }
                });
              }}>
                ← Anterior
              </button>
              <button className="enc-btn primary" style={{ margin: 0 }} onClick={() => {
                setSetupStep('game');
                navigate(location.pathname + location.search, {
                  replace: true,
                  state: { ...location.state, setupStep: 'game' }
                });
              }}>
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}

      {setupStep === "game" && (
        <div className="enc-screen">
          <div className="enc-panel enc-single-panel">

            <AnimatedTitle />
            <ProgressBar currentStep="game" />

            <h2 style={{ margin: '0 0 1.2rem 0', color: "var(--primary)" }}>
              Configuración del juego
            </h2>

            <div className="enc-section">
              <label className="enc-label">Selecciona nivel:</label>
              <select
                className="enc-field"
                value={gameConfig.level}
                onChange={(e) => setGameConfig((prev) => ({ ...prev, level: e.target.value }))}
              >
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>

              <label className="enc-label" style={{ marginTop: "0.8rem" }}>
                Número de ejercicios:
              </label>
              <input
                className="enc-field"
                type="number"
                min={1}
                max={availableCount}
                value={gameConfig.exerciseCount}
                onChange={(e) =>
                  setGameConfig((prev) => ({
                    ...prev,
                    exerciseCount: Math.max(1, Math.min(availableCount, Number(e.target.value) || 1)),
                  }))
                }
              />


            </div>

            {/* ── Barra de navegación inferior: Anterior | Terminar configuración ── */}
            <div className="enc-btn-group" style={{ marginTop: '1.5rem' }}>
              <button
                className="enc-btn"
                style={{ margin: 0, background: 'var(--secondary)' }}
                onClick={() => {
                  // Si hay RA activo volver a ar-summary, si no volver atrás
                  if (arEnabled) {
                    setSetupStep('ar-summary');
                    navigate(location.pathname + location.search, {
                      replace: true,
                      state: { ...location.state, setupStep: 'ar-summary' }
                    });
                  } else {
                    navigate(-1);
                  }
                }}
              >
                ← Anterior
              </button>

              <button
                className="enc-btn"
                style={{ margin: 0, background: 'var(--secondary)' }}
                onClick={prepareRun}
                disabled={availableCount === 0}
              >
                Vista Previa →
              </button>
            </div>

          </div>
        </div>
      )}
      {setupStep === "game-summary" && (
        <div className="enc-screen">
          <div className="enc-panel enc-single-panel">
            <SummaryPanel
              config={gameConfig}
              arEnabled={arEnabled}
              arSelectedStages={arSelectedStages}
              arConfig={arConfig}
              onBack={() => setSetupStep('game')}
              state={location.state}
            />
          </div>
        </div>
      )}
      {setupStep === "playing" && renderGameScreen()}
    </>
  );
}
