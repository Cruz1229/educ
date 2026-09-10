import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Layers,
  List,
  Monitor,
  Package,
  Puzzle,
  Shapes,
  Smartphone,
  Tag,
  Type,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildNativeTemplatePackage } from "../../utils/nativeTemplatePackaging";
import {
  AR_CONFIGURATION_CLEARED_EVENT,
  clearARConfigurationsAfterDownload,
} from "../../utils/arConfigurationStorage";
import { showInitialARInPreview } from "../Shared/arPreviewFlow";
import "./Laberinto.css";

const STAGES = ["Inicio", "Acierto", "Final"];
const CONTENT_TYPES = ["Texto", "Imagen", "Audio", "Video"];
const CAMERA_BACKGROUND_STAGE = "Acierto";
const LOGIC_PATH_AVATAR = "👦";
const DOWNLOAD_PLATFORM_ORDER = ["web", "android", "ios"];
const DOWNLOAD_PLATFORM_LABELS = {
  web: "Web",
  android: "Android",
  ios: "iOS",
};
export const LOGIC_PATH_NATIVE_TEMPLATE_URLS = Object.freeze({
  android: "/templates/laberinto_android.zip",
  ios: "/templates/laberinto_ios.zip",
});

function normalizeDownloadPlatforms(platforms) {
  const selected = new Set(
    (Array.isArray(platforms) ? platforms : []).map((platform) =>
      String(platform).trim().toLowerCase(),
    ),
  );
  const normalized = DOWNLOAD_PLATFORM_ORDER.filter((platform) =>
    selected.has(platform),
  );

  return normalized.length > 0 ? normalized : ["web"];
}

function formatSpanishList(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
}

function buildDownloadPlatformNotice(platforms) {
  const targets = platforms.map((platform) => {
    if (platform === "web") return "el paquete Web";
    return `el proyecto ${DOWNLOAD_PLATFORM_LABELS[platform]}`;
  });

  return `Se generará un ZIP con ${formatSpanishList(targets)} ${targets.length === 1 ? "incluido" : "incluidos"}.`;
}

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
    .download-platforms {
        display: inline-flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 4px;
        border-radius: 2rem;
        background: #e2e8f0;
    }
    .download-platform-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 16px;
        border-radius: 2rem;
        background: #ffffff;
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
    .download-platform-badge.web { color: #0077b6; }
    .download-platform-badge.android { color: #16a34a; }
    .download-platform-badge.ios { color: #475569; }
    .download-platform-notice {
        margin: 0 auto 1.5rem;
        padding: 8px 14px;
        border: 1px dashed #cbd5e1;
        border-radius: 0.5rem;
        background: #f1f5f9;
        color: #94a3b8;
        font-size: 0.82rem;
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

const LEVEL_CONFIG = {
  basico: {
    label: "Básico",
    showCount: 3,
    attempts: 3,
    rows: 9,
    cols: 11,
    cellSize: 36,
  },
  intermedio: {
    label: "Intermedio",
    showCount: 4,
    attempts: 2,
    rows: 11,
    cols: 15,
    cellSize: 30,
  },
  avanzado: {
    label: "Avanzado",
    showCount: 5,
    attempts: 1,
    rows: 15,
    cols: 19,
    cellSize: 24,
  },
};

const EXERCISE_BANK = {
  basico: [
    { id: 1, name: "Pasillo base", seed: 1001 },
    { id: 2, name: "Ruta en zigzag", seed: 1006 },
    { id: 3, name: "Curvas cortas", seed: 1010 },
    { id: 4, name: "Cruce simple", seed: 1015 },
    { id: 5, name: "Retorno guiado", seed: 1021 },
    { id: 6, name: "Ruta extendida", seed: 1024 },
  ],
  intermedio: [
    { id: 1, name: "Anillo central", seed: 5003 },
    { id: 2, name: "Pasillos alternos", seed: 5004 },
    { id: 3, name: "Bifurcación larga", seed: 5005 },
    { id: 4, name: "Retícula media", seed: 5010 },
    { id: 5, name: "Ruta serpiente", seed: 5012 },
    { id: 6, name: "Loop interior", seed: 5013 },
    { id: 7, name: "Puentes dobles", seed: 5014 },
    { id: 8, name: "Cierre diagonal", seed: 5016 },
  ],
  avanzado: [
    { id: 1, name: "Malla profunda", seed: 10001 },
    { id: 2, name: "Bloques espejo", seed: 10002 },
    { id: 3, name: "Núcleo complejo", seed: 10010 },
    { id: 4, name: "Trenza larga", seed: 10014 },
    { id: 5, name: "Retorno múltiple", seed: 10016 },
    { id: 6, name: "Cruce denso", seed: 10018 },
    { id: 7, name: "Galería cerrada", seed: 10019 },
    { id: 8, name: "Túneles largos", seed: 10020 },
    { id: 9, name: "Laberinto espejo", seed: 10024 },
    { id: 10, name: "Ruta final", seed: 10025 },
  ],
};

const POINTS = { basico: 10, intermedio: 15, avanzado: 20 };

const INSTRUCTION_INFO = {
  A: { variable: "A", label: "Arriba (↑) A lugares", delta: [-1, 0] },
  B: { variable: "B", label: "Abajo (↓) B lugares", delta: [1, 0] },
  I: { variable: "I", label: "Izquierda (←) I lugares", delta: [0, -1] },
  D: { variable: "D", label: "Derecha (→) D lugares", delta: [0, 1] },
};

const FILE_RULES = {
  Imagen: {
    accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
    extensions: ["jpg", "jpeg", "png"],
    maxSize: 5 * 1024 * 1024,
    folder: "Imagen",
  },
  Audio: {
    accept: ".mp3,audio/mpeg",
    extensions: ["mp3"],
    maxSize: 3 * 1024 * 1024,
    folder: "Audio",
  },
  Video: {
    accept: ".mp4,video/mp4",
    extensions: ["mp4"],
    maxSize: 10 * 1024 * 1024,
    folder: "Videos",
  },
};

const MEDIA_FIELDS = {
  Imagen: { urlKey: "imageUrl", nameKey: "imageName" },
  Audio: { urlKey: "audioUrl", nameKey: "audioName" },
  Video: { urlKey: "videoUrl", nameKey: "videoName" },
};

/* eslint-disable no-template-curly-in-string */
const LABERINTO_HTML_TEMPLATE =
  "<!doctype html>\n<html lang=\"es\">\n\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>Juego del Laberinto</title>\n  <meta http-equiv=\"Cache-Control\" content=\"no-cache, no-store, must-revalidate\" />\n  <meta http-equiv=\"Pragma\" content=\"no-cache\" />\n  <meta http-equiv=\"Expires\" content=\"0\" />\n  <script src=\"https://aframe.io/releases/1.4.0/aframe.min.js\"></script>\n  <script src=\"https://cdn.jsdelivr.net/npm/ar.js@3.4.5/aframe/build/aframe-ar-nft.js\"></script>\n  <link\n    href=\"https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap\"\n    rel=\"stylesheet\">\n  <style>\n    :root {\n      --primary: #005f92;\n      --primary-dark: #004a73;\n      --primary-light: #e0f2fe;\n      --secondary: #1f2937;\n      --success: #22c55e;\n      --success-dark: #16a34a;\n      --danger: #ef4444;\n      --warning: #d1d5db;\n      --light: #f8fafc;\n      --dark: #111827;\n      --gray: #64748b;\n      --gray-light: #e2e8f0;\n      --gray-lighter: #f3f4f6;\n      --gray-medium: #d1d5db;\n      --blue-50: #eff6ff;\n      --blue-100: #dbeafe;\n      --blue-600: #005f92;\n      --blue-700: #005f92;\n      --blue-800: #1f2937;\n      --border-radius: 8px;\n      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);\n      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.12);\n      --transition: all 0.3s ease;\n      /* Alias compartidos con la plantilla de Encriptación */\n      --primary-color: var(--primary);\n      --secondary-color: var(--secondary);\n      --light-gray: var(--gray-lighter);\n      --medium-gray: var(--gray-medium);\n      --dark-gray: #4b5563;\n      --correct: var(--success);\n      --wrong: var(--danger);\n      --light-text: #ffffff;\n      --dark-text: var(--dark);\n    }\n\n    * {\n      margin: 0;\n      padding: 0;\n      box-sizing: border-box;\n    }\n\n    body {\n      font-family: 'Nunito', 'Segoe UI', sans-serif;\n      background: #f0f2f5;\n      color: var(--dark);\n      min-height: 100vh;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: flex-start;\n      padding: 20px;\n    }\n\n    .hidden {\n      display: none !important;\n      opacity: 0;\n      pointer-events: none;\n    }\n\n    .overlay {\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      background: rgba(255, 255, 255, 0.95);\n      display: flex;\n      flex-direction: column;\n      justify-content: center;\n      align-items: center;\n      z-index: 50;\n      transition: opacity 0.3s;\n      padding: 20px;\n      box-sizing: border-box;\n    }\n\n    .start-title {\n      color: var(--primary-color);\n      margin: 0 0 1rem;\n      font-size: 3.8rem;\n      font-weight: 900;\n      text-align: center;\n      letter-spacing: -0.02em;\n      font-family: \"Nunito\", sans-serif;\n    }\n\n    .start-level-pill {\n      background: #e0f2fe;\n      color: #0369a1;\n      padding: 0.5rem 1rem;\n      border-radius: 20px;\n      font-weight: 600;\n      margin-bottom: 2rem;\n      display: inline-block;\n      font-family: 'Nunito', sans-serif;\n      font-size: 1rem;\n      letter-spacing: 0.01em;\n    }\n\n    .start-copy {\n      max-width: 560px;\n      color: #475569;\n      font-size: 1.05rem;\n      line-height: 1.6;\n      text-align: center;\n      margin: 0 0 1.5rem;\n      font-weight: 600;\n    }\n\n    .start-actions {\n      display: flex;\n      flex-direction: column;\n      gap: 1rem;\n      align-items: center;\n    }\n\n    .big-btn {\n      padding: 1rem 2rem;\n      font-size: 1.2rem;\n      font-weight: bold;\n      background: var(--primary);\n      color: white;\n      border: none;\n      border-radius: 0.5rem;\n      cursor: pointer;\n      transition: transform 0.2s;\n      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n      margin: 0.5rem;\n      display: inline-flex;\n      align-items: center;\n      gap: 0.5rem;\n      justify-content: center;\n      min-width: 200px;\n    }\n\n    .big-btn:hover {\n      transform: scale(1.05);\n      filter: brightness(1.08);\n    }\n\n    .btn-info {\n      background: white;\n      color: var(--primary);\n      border: 2px solid var(--primary);\n    }\n\n    .btn-exit {\n      background: var(--secondary);\n    }\n\n    .btn-retry {\n      background: var(--primary);\n    }\n\n    .countdown-number {\n      font-size: clamp(5rem, 18vw, 8rem);\n      font-weight: 900;\n      color: var(--primary);\n      animation: popIn 0.5s ease-out;\n    }\n\n    @keyframes popIn {\n      0% {\n        transform: scale(0);\n        opacity: 0;\n      }\n\n      80% {\n        transform: scale(1.1);\n      }\n\n      100% {\n        transform: scale(1);\n        opacity: 1;\n      }\n    }\n\n    .end-title {\n      color: var(--primary);\n      font-size: clamp(2.35rem, 7vw, 3rem);\n      font-weight: 900;\n      margin-bottom: 0.5rem;\n      text-align: center;\n      font-family: \"Nunito\", sans-serif;\n    }\n\n    .end-score {\n      color: var(--secondary);\n      font-size: clamp(1.55rem, 5vw, 2rem);\n      margin: 1rem 0;\n      font-family: \"Nunito\", sans-serif;\n      text-align: center;\n      font-weight: 800;\n    }\n\n    .end-detail {\n      color: #64748b;\n      font-size: 1rem;\n      font-weight: 700;\n      margin-bottom: 0.5rem;\n      text-align: center;\n    }\n\n    .end-buttons {\n      display: flex;\n      gap: 1rem;\n      flex-wrap: wrap;\n      justify-content: center;\n      margin-top: 1rem;\n    }\n\n    .info-modal-content {\n      background: white;\n      padding: 2.5rem;\n      border-radius: 1rem;\n      max-width: 600px;\n      width: 90%;\n      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);\n      border: 1px solid #e5e7eb;\n      position: relative;\n    }\n\n    .info-header {\n      text-align: center;\n      border-bottom: 2px solid #f1f5f9;\n      padding-bottom: 1.5rem;\n      margin-bottom: 1.5rem;\n    }\n\n    .info-title {\n      font-size: 1.8rem;\n      color: var(--primary);\n      margin: 0;\n      font-weight: 900;\n    }\n\n    .info-subtitle {\n      color: #64748b;\n      font-size: 0.9rem;\n      margin-top: 0.5rem;\n    }\n\n    .info-details-grid {\n      display: grid;\n      grid-template-columns: repeat(2, 1fr);\n      gap: 1rem;\n      margin-bottom: 1.5rem;\n    }\n\n    .info-item {\n      background: #f8fafc;\n      padding: 1rem;\n      border-radius: 0.5rem;\n      border: 1px solid #e2e8f0;\n    }\n\n    .info-label {\n      font-size: 0.7rem;\n      color: #64748b;\n      text-transform: uppercase;\n      letter-spacing: 0.05em;\n      display: block;\n      margin-bottom: 0.25rem;\n      font-weight: 600;\n    }\n\n    .info-value {\n      font-size: 0.8rem;\n      color: #334155;\n      font-weight: 600;\n    }\n\n    .close-info-btn {\n      position: absolute;\n      top: 1rem;\n      right: 1rem;\n      background: transparent;\n      border: none;\n      font-size: 1.5rem;\n      cursor: pointer;\n      color: #94a3b8;\n    }\n\n    .app-container {\n      background: white;\n      border-radius: 16px;\n      box-shadow: 0 8px 24px rgba(67, 97, 238, 0.12);\n      padding: 2.5rem 2rem;\n      width: 100%;\n      max-width: 640px;\n      position: relative;\n      animation: popin 0.6s ease;\n      margin: auto 0;\n    }\n\n    #generator-screen {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n    }\n\n    #generator-screen .level-section,\n    #generator-screen #game-options {\n      width: 100%;\n    }\n\n    #game-screen {\n      width: 100%;\n      max-width: 1200px;\n      margin: 12px auto 0;\n      animation: popin 0.6s ease;\n    }\n\n    @keyframes popin {\n      0% {\n        transform: scale(0.97);\n        opacity: 0;\n      }\n\n      100% {\n        transform: scale(1);\n        opacity: 1;\n      }\n    }\n\n    #generator-screen h1 {\n      font-size: 2.3rem;\n      font-weight: 800;\n      color: var(--secondary);\n      text-align: center;\n      margin-bottom: 1.5rem;\n      letter-spacing: 2px;\n      text-shadow: none;\n    }\n\n    .level-section,\n    #game-options {\n      background: #f8fafc;\n      border-radius: 16px;\n      box-shadow: var(--shadow);\n      padding: 1rem 1.5rem;\n      margin-bottom: 1.2rem;\n      display: flex;\n      flex-direction: column;\n      gap: 0.5rem;\n    }\n\n    label {\n      color: var(--secondary);\n      font-weight: bold;\n      font-size: 1.05rem;\n    }\n\n    select,\n    input[type=\"number\"],\n    input[type=\"text\"] {\n      padding: 0.7rem;\n      border: 2px solid var(--primary);\n      border-radius: 12px;\n      font-size: 1rem;\n      background: #f5faff;\n      transition:\n        border 0.2s,\n        background 0.2s;\n    }\n\n    select:focus,\n    input[type=\"number\"]:focus,\n    input[type=\"text\"]:focus {\n      border-color: var(--primary);\n      background: #eff6ff;\n      outline: none;\n    }\n\n    #startGameBtn {\n      background: var(--primary);\n      color: white;\n      border: none;\n      padding: 0.9rem 1.7rem;\n      border-radius: 18px;\n      cursor: pointer;\n      font-weight: 700;\n      font-size: 1.1rem;\n      box-shadow: 0 2px 8px rgba(0, 95, 146, 0.2);\n      transition:\n        background 0.2s,\n        transform 0.15s;\n      animation: bounceBtn 1.2s infinite alternate;\n    }\n\n    #startGameBtn:hover {\n      background: var(--primary-dark);\n      transform: scale(1.08);\n    }\n\n    @keyframes bounceBtn {\n      0% {\n        transform: translateY(0);\n      }\n\n      100% {\n        transform: translateY(-6px);\n      }\n    }\n\n    span#available-exercises {\n      font-size: 1rem;\n      color: var(--primary);\n      font-weight: 600;\n      background: #e0e7ff;\n      border-radius: 8px;\n      padding: 0.2rem 0.7rem;\n      align-self: flex-start;\n    }\n\n    /* ===== LABERINTO COD UI ===== */\n    .main-container {\n      flex: 1;\n      max-width: 1180px;\n      width: 100%;\n      margin: 0 auto;\n      padding: 28px 24px;\n    }\n\n    .game-title {\n      text-align: center;\n      margin-bottom: 4px;\n    }\n\n    .game-title h1 {\n      font-size: 2.2rem;\n      font-weight: 800;\n      color: var(--blue-800);\n      font-style: italic;\n    }\n\n    .rules-section {\n      margin-bottom: 16px;\n      padding: 0 4px;\n    }\n\n    .rules-section p {\n      font-size: 1rem;\n      color: var(--dark);\n      line-height: 1.5;\n    }\n\n    .rules-section strong {\n      color: var(--blue-700);\n    }\n\n    .instructions-bar {\n      display: flex;\n      align-items: center;\n      gap: 12px;\n      margin-bottom: 16px;\n      flex-wrap: wrap;\n    }\n\n    .instruction-cards {\n      display: flex;\n      gap: 10px;\n      flex-wrap: wrap;\n      flex: 1;\n    }\n\n    .inst-card {\n      background: #fff;\n      border: 2px solid var(--gray-light);\n      border-radius: 10px;\n      padding: 10px 16px;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 2px;\n      cursor: pointer;\n      transition: var(--transition);\n      user-select: none;\n      min-width: 130px;\n      flex: 1;\n    }\n\n    .inst-card:hover {\n      border-color: var(--primary);\n      background: var(--blue-50);\n      transform: translateY(-2px);\n      box-shadow: var(--shadow);\n    }\n\n    .inst-card.active {\n      border-color: var(--primary);\n      background: var(--blue-100);\n    }\n\n    .inst-var {\n      font-weight: 700;\n      font-size: 1rem;\n      color: var(--blue-700);\n    }\n\n    .inst-label {\n      font-size: 0.85rem;\n      color: var(--gray);\n    }\n\n    .popup {\n      position: fixed;\n      inset: 0;\n      background: rgba(0, 0, 0, 0.45);\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      z-index: 1000;\n      animation: fadeIn 0.25s ease-out;\n    }\n\n    @keyframes fadeIn {\n      from {\n        opacity: 0;\n      }\n\n      to {\n        opacity: 1;\n      }\n    }\n\n    .popup-content {\n      background: #fff;\n      border-radius: var(--border-radius);\n      padding: 2rem 2.2rem;\n      max-width: 520px;\n      width: 90%;\n      position: relative;\n      box-shadow: var(--shadow-lg);\n    }\n\n    .popup-content h3 {\n      color: var(--primary);\n      margin-bottom: 1rem;\n      font-size: 1.3rem;\n    }\n\n    .popup-content ul {\n      padding-left: 1.2rem;\n      color: var(--secondary);\n      font-size: 0.95rem;\n      line-height: 1.65;\n    }\n\n    .popup-close {\n      position: absolute;\n      top: 10px;\n      right: 14px;\n      background: none;\n      border: none;\n      font-size: 1.6rem;\n      cursor: pointer;\n      color: #999;\n      line-height: 1;\n      padding: 0;\n      box-shadow: none;\n    }\n\n    .popup-close:hover {\n      color: var(--danger);\n    }\n\n    .game-layout {\n      display: grid;\n      grid-template-columns: minmax(0, 1fr) 520px;\n      gap: 2rem;\n      width: 100%;\n      margin-bottom: 0;\n      align-items: start;\n    }\n\n    .game-left-col,\n    .game-right-col {\n      display: flex;\n      flex-direction: column;\n      gap: 1rem;\n      min-width: 0;\n    }\n\n    .pseudo-panel {\n      background: #f8fafc;\n      border: 1.5px solid #e2e8f0;\n      border-radius: 14px;\n      overflow: hidden;\n      box-shadow: none;\n      display: flex;\n      flex-direction: column;\n      min-height: 320px;\n    }\n\n    .panel-header {\n      text-align: center;\n      padding: 10px 12px;\n      font-weight: 700;\n      font-size: 1rem;\n      color: var(--secondary);\n      border-bottom: 2px solid var(--gray-light);\n    }\n\n    .pseudo-panel .panel-header {\n      background: linear-gradient(135deg, var(--blue-700), var(--blue-800));\n      color: white;\n      border-radius: 8px;\n      margin: 8px;\n      border-bottom: none;\n    }\n\n    .pseudo-body {\n      padding: 8px 10px;\n      font-family: \"Courier New\", Consolas, monospace;\n      font-size: 0.88rem;\n      line-height: 1.5;\n      flex: 1;\n      min-height: 0;\n      overflow-y: auto;\n      color: var(--dark);\n    }\n\n    .pseudo-line {\n      padding: 2px 0;\n      white-space: nowrap;\n    }\n\n    .pseudo-line.algo-start,\n    .pseudo-line.algo-end {\n      color: var(--primary);\n      font-weight: 700;\n    }\n\n    .pseudo-line.inst-line {\n      padding: 4px 4px 4px 12px;\n      margin: 3px 0;\n      background: var(--gray-lighter);\n      border-radius: 6px;\n      border-left: 3px solid var(--primary);\n      display: flex;\n      align-items: center;\n      gap: 4px;\n      flex-wrap: wrap;\n      white-space: normal;\n      position: relative;\n    }\n\n    .pseudo-line.inst-line .line-num {\n      display: inline-block;\n      width: 16px;\n      color: #aaa;\n      font-size: 0.72rem;\n      text-align: right;\n      margin-right: 3px;\n      flex-shrink: 0;\n    }\n\n    .pseudo-line.inst-line .assign-var {\n      color: var(--primary);\n      font-weight: 700;\n    }\n\n    .pseudo-line.inst-line .assign-val-input {\n      width: 36px;\n      padding: 1px 3px;\n      border: 1.5px solid var(--gray-light);\n      border-radius: 4px;\n      font-size: 0.82rem;\n      font-weight: 700;\n      font-family: inherit;\n      text-align: center;\n      color: var(--blue-700);\n      background: #fff;\n      transition: border-color 0.2s;\n    }\n\n    .pseudo-line.inst-line .assign-val-input:focus {\n      outline: none;\n      border-color: var(--primary);\n      box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.18);\n    }\n\n    .pseudo-line.inst-line .action-text {\n      color: var(--blue-600);\n      font-weight: 600;\n      font-size: 0.75rem;\n      display: block;\n      width: 100%;\n      margin-top: 1px;\n      padding-left: 20px;\n    }\n\n    .pseudo-line.inst-line .remove-inst-btn {\n      position: absolute;\n      right: 4px;\n      top: 50%;\n      transform: translateY(-50%);\n      background: var(--gray);\n      color: white;\n      border: none;\n      border-radius: 50%;\n      width: 16px;\n      height: 16px;\n      font-size: 0.6rem;\n      cursor: pointer;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      line-height: 1;\n      opacity: 0;\n      transition: opacity 0.2s;\n    }\n\n    .pseudo-line.inst-line:hover .remove-inst-btn {\n      opacity: 1;\n    }\n\n    .pseudo-line.inst-line .remove-inst-btn:hover {\n      background: #4a5568;\n      transform: translateY(-50%) scale(1.15);\n    }\n\n    .pseudo-actions {\n      display: flex;\n      gap: 6px;\n      padding: 8px 10px;\n      border-top: 1px solid var(--gray-light);\n      background: var(--light);\n    }\n\n    .maze-panel {\n      background: #f8fafc;\n      border: 1.5px solid #e2e8f0;\n      border-radius: 14px;\n      padding: 1rem;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      min-height: 520px;\n      box-shadow: none;\n    }\n\n    .maze-panel.animating {\n      border-color: #5a9de0;\n      box-shadow: 0 0 18px rgba(49, 130, 206, 0.28);\n    }\n\n    #maze-canvas {\n      display: block;\n      max-width: 100%;\n      background: #f8fafc;\n      border: 2px solid #d6deea;\n      border-radius: 10px;\n      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);\n      image-rendering: pixelated;\n    }\n\n    .progress-panel {\n      background: white;\n      border: 1px solid var(--medium-gray);\n      border-radius: 0.5rem;\n      overflow: hidden;\n      box-shadow: none;\n      height: fit-content;\n    }\n\n    .progress-panel .panel-header {\n      font-size: 1.15rem;\n      font-weight: 700;\n      color: var(--secondary);\n    }\n\n    .progress-info {\n      padding: 14px;\n      display: flex;\n      flex-direction: column;\n      gap: 8px;\n    }\n\n    .progress-info .info-row {\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      font-size: 0.95rem;\n    }\n\n    .progress-info .info-label {\n      font-weight: 700;\n      color: var(--secondary);\n    }\n\n    .progress-info .info-value {\n      font-weight: 500;\n      color: var(--dark);\n    }\n\n    .level-select-wrapper {\n      padding: 0 14px 8px;\n    }\n\n    .level-select-wrapper select {\n      width: 100%;\n      padding: 6px 8px;\n      border: 2px solid var(--primary);\n      border-radius: 8px;\n      font-size: 0.85rem;\n      font-weight: 600;\n      cursor: pointer;\n      background: #fff;\n    }\n\n    .btn {\n      display: inline-flex;\n      align-items: center;\n      justify-content: center;\n      padding: 12px 22px;\n      border: none;\n      border-radius: 8px;\n      font-weight: 700;\n      font-size: 0.95rem;\n      cursor: pointer;\n      transition: var(--transition);\n      gap: 6px;\n      text-decoration: none;\n    }\n\n    .btn:hover {\n      transform: translateY(-1px);\n      box-shadow: var(--shadow);\n    }\n\n    .btn:active {\n      transform: translateY(0);\n    }\n\n    .btn-instructions {\n      background: var(--primary);\n      color: white;\n      border-radius: 24px;\n      padding: 8px 20px;\n      font-size: 0.9rem;\n      white-space: nowrap;\n    }\n\n    .btn-instructions:hover {\n      background: var(--primary-dark);\n    }\n\n    .btn-small {\n      padding: 5px 10px;\n      font-size: 0.8rem;\n      border-radius: 6px;\n    }\n\n    .btn-danger {\n      background: var(--gray);\n      color: #fff;\n    }\n\n    .btn-danger:hover {\n      background: #4a5568;\n    }\n\n    .btn-warning {\n      background: var(--gray-medium);\n      color: #fff;\n    }\n\n    .btn-warning:hover {\n      background: #718096;\n    }\n\n    .action-buttons {\n      padding: 12px 14px;\n      display: flex;\n      flex-direction: column;\n      gap: 8px;\n    }\n\n    .btn-validate {\n      background: var(--primary);\n      color: white;\n    }\n\n    .btn-validate:hover {\n      background: var(--primary-dark);\n    }\n\n    .btn-finish {\n      background: var(--primary);\n      color: white;\n    }\n\n    .btn-finish:hover {\n      background: #1a365d;\n    }\n\n    .notification {\n      position: fixed;\n      top: 20px;\n      right: 20px;\n      padding: 14px 24px;\n      border-radius: 10px;\n      font-weight: 600;\n      color: white;\n      z-index: 9999;\n      animation: slideInRight 0.3s ease;\n      box-shadow: var(--shadow-lg);\n    }\n\n    .notification.success {\n      background: var(--primary);\n    }\n\n    .notification.error {\n      background: var(--gray);\n    }\n\n    .notification.info {\n      background: var(--blue-800);\n    }\n\n    @keyframes slideInRight {\n      from {\n        transform: translateX(120%);\n        opacity: 0;\n      }\n\n      to {\n        transform: translateX(0);\n        opacity: 1;\n      }\n    }\n\n    @keyframes slideOutRight {\n      from {\n        transform: translateX(0);\n        opacity: 1;\n      }\n\n      to {\n        transform: translateX(120%);\n        opacity: 0;\n      }\n    }\n\n    .modal-overlay {\n      position: fixed;\n      inset: 0;\n      background: rgba(0, 0, 0, 0.45);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      z-index: 1000;\n      animation: fadeIn 0.2s ease;\n    }\n\n    .modal-content {\n      background: white;\n      border-radius: 16px;\n      padding: 36px 32px 28px;\n      max-width: 420px;\n      width: 90%;\n      text-align: center;\n      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);\n    }\n\n    .modal-icon {\n      width: 64px;\n      height: 64px;\n      margin: 0 auto 16px;\n    }\n\n    .modal-icon svg {\n      width: 100%;\n      height: 100%;\n    }\n\n    .modal-content h2 {\n      font-size: 1.4rem;\n      margin-bottom: 8px;\n      color: var(--secondary);\n      font-weight: 800;\n    }\n\n    .modal-content p {\n      font-size: 0.95rem;\n      margin-bottom: 4px;\n      color: var(--gray);\n    }\n\n    .modal-content p strong {\n      color: var(--dark);\n    }\n\n    .modal-buttons {\n      display: flex;\n      gap: 12px;\n      justify-content: center;\n      margin-top: 22px;\n      flex-wrap: wrap;\n    }\n\n    .btn-modal-primary {\n      background: var(--primary);\n      color: white;\n      padding: 10px 22px;\n      border: 2px solid var(--primary);\n      border-radius: 8px;\n      font-weight: 700;\n      font-size: 0.88rem;\n      cursor: pointer;\n      transition: var(--transition);\n    }\n\n    .btn-modal-primary:hover {\n      background: var(--primary-dark);\n      border-color: var(--primary-dark);\n    }\n\n    .btn-modal-secondary {\n      background: white;\n      color: var(--dark);\n      padding: 10px 22px;\n      border: 2px solid var(--gray-light);\n      border-radius: 8px;\n      font-weight: 700;\n      font-size: 0.88rem;\n      cursor: pointer;\n      transition: var(--transition);\n    }\n\n    .btn-modal-secondary:hover {\n      background: var(--gray-lighter);\n      border-color: var(--gray);\n    }\n\n    #game-screen {\n      width: 100%;\n      max-width: 1400px;\n      margin: 20px auto;\n      padding: 0;\n      background: transparent;\n    }\n\n    .main-container {\n      background: white;\n      border-radius: 0.5rem;\n      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);\n      padding: 2rem;\n      width: 100%;\n      max-width: 1400px;\n      margin: 0 auto;\n      box-sizing: border-box;\n      display: flex;\n      flex-direction: column;\n      gap: 1.25rem;\n    }\n\n    .lab-animated-title-container {\n      position: relative;\n      margin-bottom: 0.25rem;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      min-height: 92px;\n    }\n\n    .lab-animated-title {\n      text-align: center;\n      font-size: clamp(2rem, 5vw, 3rem);\n      font-weight: 700;\n      color: var(--secondary);\n      margin: 0;\n      display: flex;\n      justify-content: center;\n      flex-wrap: wrap;\n      font-family: \"Merriweather\", serif;\n      line-height: 1.15;\n    }\n\n    .lab-animated-title span {\n      display: inline-block;\n      animation: labWave 1.8s infinite;\n    }\n\n    @keyframes labWave {\n\n      0%,\n      40%,\n      100% {\n        transform: translateY(0);\n      }\n\n      20% {\n        transform: translateY(-18px);\n      }\n    }\n\n    .lab-floating-icons span {\n      position: absolute;\n      color: var(--primary);\n      opacity: 0.3;\n      font-size: 1.5rem;\n      font-weight: 800;\n      animation: labIconFloat 4s ease-in-out infinite;\n      pointer-events: none;\n    }\n\n    .lab-icon-1 {\n      top: -8px;\n      left: 11%;\n      animation-delay: 0s;\n    }\n\n    .lab-icon-2 {\n      top: 4px;\n      right: 11%;\n      animation-delay: 1s;\n    }\n\n    .lab-icon-3 {\n      bottom: 0;\n      left: 22%;\n      animation-delay: 2s;\n    }\n\n    .lab-icon-4 {\n      bottom: -6px;\n      right: 22%;\n      animation-delay: 3s;\n    }\n\n    @keyframes labIconFloat {\n\n      0%,\n      100% {\n        transform: translateY(0);\n      }\n\n      50% {\n        transform: translateY(-15px);\n      }\n    }\n\n    .rules-section {\n      display: grid;\n      grid-template-columns: 1fr;\n      max-width: 760px;\n      margin: 0 auto 0.25rem;\n      background: #eff6ff;\n      border: 1px solid #bfdbfe;\n      border-radius: 0.75rem;\n      padding: 0.85rem 1.25rem;\n      text-align: center;\n    }\n\n    .rules-section p {\n      color: #1e40af;\n      font-weight: 600;\n      margin: 0;\n    }\n\n    .rules-section strong {\n      color: #64748b;\n      display: block;\n      font-size: 0.72rem;\n      text-transform: uppercase;\n      letter-spacing: 0.07em;\n      margin-bottom: 0.25rem;\n    }\n\n    .instructions-bar,\n    .pseudo-panel,\n    .progress-panel,\n    .maze-panel {\n      border: 1.5px solid #e2e8f0;\n    }\n\n    .instructions-bar {\n      background: #f8fafc;\n      border-radius: 0.75rem;\n      padding: 0.85rem;\n    }\n\n    .inst-card,\n    .pseudo-panel,\n    .progress-panel {\n      border-radius: 0.75rem;\n    }\n\n    .panel-header,\n    .progress-panel .panel-header {\n      color: var(--secondary);\n      font-family: \"Nunito\", sans-serif;\n    }\n\n    .pseudo-panel .panel-header {\n      background: var(--primary);\n      border-radius: 0.5rem;\n    }\n\n    .maze-panel {\n      background: #f8fafc;\n      border-radius: 0.75rem;\n    }\n\n    #maze-canvas {\n      border-color: #d1d5db;\n    }\n\n    .progress-info .info-row {\n      background: #f8fafc;\n      border: 1px solid #e2e8f0;\n      border-radius: 0.6rem;\n      padding: 0.75rem;\n    }\n\n    .action-buttons {\n      border-top: 1px solid #e2e8f0;\n    }\n\n    .btn-validate,\n    .btn-finish,\n    .btn-instructions {\n      border-radius: 10px;\n    }\n\n    .card-block {\n      background: #f8fafc;\n      border: 1.5px solid #e2e8f0;\n      border-radius: 14px;\n    }\n\n    .stats-block {\n      border: 1px solid var(--medium-gray);\n      border-radius: 0.5rem;\n      background: white;\n      height: fit-content;\n    }\n\n    .game-right-col .panel-header {\n      margin: 0;\n      padding: 1rem;\n      background: white;\n      color: var(--secondary-color);\n      border-radius: 0;\n      border-bottom: 1px solid var(--medium-gray);\n      text-align: left;\n      font-size: 1.2rem;\n      font-weight: 700;\n    }\n\n    .game-right-col .pseudo-panel .panel-header {\n      background: var(--primary-color);\n      color: white;\n      border-bottom: none;\n    }\n\n    .game-right-col .pseudo-actions {\n      background: white;\n    }\n\n    @media (max-width: 960px) {\n      .game-layout {\n        grid-template-columns: 1fr;\n        gap: 1rem;\n      }\n\n      .game-right-col {\n        width: 100%;\n      }\n\n      .pseudo-panel {\n        order: 2;\n      }\n\n      .maze-panel {\n        order: 1;\n        min-height: 280px;\n      }\n\n      .progress-panel {\n        order: 3;\n      }\n\n      .game-title h1 {\n        font-size: 1.5rem;\n      }\n    }\n\n    @media (max-width: 600px) {\n      .app-container {\n        padding: 1rem;\n      }\n\n      .main-container {\n        padding: 12px 10px;\n      }\n\n      .game-title h1 {\n        font-size: 1.3rem;\n      }\n\n      .instructions-bar {\n        flex-direction: column;\n        align-items: stretch;\n      }\n\n      .instruction-cards {\n        flex-direction: column;\n      }\n\n      .inst-card {\n        min-width: unset;\n      }\n\n    }\n\n    @media (max-width: 768px) {\n      .info-details-grid {\n        grid-template-columns: 1fr;\n      }\n    }\n\n    /* ===== LogicPath exportado: layout fijo de una sola pantalla ===== */\n    html,\n    body {\n      width: 100%;\n      height: 100%;\n      min-height: 100%;\n      overflow: hidden;\n    }\n\n    body {\n      padding: 0;\n      margin: 0;\n    }\n\n    #game-screen {\n      width: 100vw;\n      height: 100vh;\n      max-width: none;\n      margin: 0;\n      padding: clamp(6px, 1vh, 10px);\n      overflow: hidden;\n    }\n\n    #game-screen > .main-container {\n      width: 100%;\n      height: 100%;\n      max-width: none;\n      margin: 0;\n      padding: clamp(8px, 1.3vh, 14px) clamp(10px, 1.2vw, 18px);\n      gap: clamp(5px, 0.8vh, 9px);\n      overflow: hidden;\n      border-radius: 12px;\n    }\n\n    #game-screen .lab-animated-title-container {\n      flex: 0 0 auto;\n      min-height: clamp(42px, 5.4vh, 52px);\n      margin: 0;\n      justify-content: center;\n    }\n\n    #game-screen .lab-animated-title {\n      font-size: clamp(1.4rem, 3.1vh, 2.05rem);\n      line-height: 1.05;\n    }\n\n    #game-screen .lab-animated-title span {\n      animation-duration: 2.2s;\n    }\n\n    #game-screen .lab-floating-icons {\n      display: none;\n    }\n\n    #game-screen .rules-section {\n      flex: 0 0 auto;\n      width: min(100%, 1100px);\n      max-width: none;\n      margin: 0 auto;\n      padding: clamp(8px, 1.15vh, 12px) 14px;\n      min-height: clamp(42px, 5.2vh, 50px);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n    }\n\n    #game-screen .rules-section p {\n      font-size: clamp(0.72rem, 1.48vh, 0.88rem);\n      line-height: 1.28;\n    }\n\n    #game-screen .rules-section strong {\n      display: inline;\n      margin: 0 6px 0 0;\n      font-size: inherit;\n      letter-spacing: 0;\n      text-transform: none;\n    }\n\n    /* Las opciones arrastrables permanecen siempre arriba. */\n    #game-screen .instructions-bar {\n      flex: 0 0 auto;\n      margin: 0;\n      padding: clamp(8px, 1.15vh, 11px);\n      gap: 9px;\n      flex-wrap: nowrap;\n      overflow-x: auto;\n      overflow-y: hidden;\n      min-height: clamp(64px, 8.2vh, 78px);\n      align-items: center;\n    }\n\n    #game-screen .instruction-cards {\n      display: grid; \n height: 100%; \n      grid-template-columns: repeat(4, minmax(112px, 1fr));\n      gap: 6px;\n      flex: 1 0 560px;\n      flex-wrap: nowrap;\n    }\n\n    #game-screen .inst-card {\n      min-width: 0;\n      padding: clamp(7px, 1vh, 10px) 8px;\n      gap: 2px;\n      border-width: 1.5px;\n    }\n\n    #game-screen .inst-var {\n      font-size: clamp(1rem, 1.55vh, 0.92rem);\n      line-height: 1.1;\n    }\n\n    #game-screen .inst-label {\n      font-size: clamp(0.59rem, 1.22vh, 0.74rem);\n      line-height: 1.15;\n      text-align: center;\n    }\n\n    #game-screen .btn-instructions {\n      flex: 0 0 auto;\n      padding: 7px 11px;\n      font-size: clamp(0.68rem, 1.25vh, 0.8rem);\n    }\n\n    /*\n      Estructura solicitada:\n      [ Pseudocódigo ] [ Laberinto ] [ Progreso ]\n    */\n    #game-screen .game-layout {\n      flex: 1 1 0;\n      min-height: 0;\n      height: auto;\n      width: min(98%, 1180px);\n      display: grid;\n      grid-template-columns:\n        minmax(190px, 0.9fr)\n        minmax(330px, 1.65fr)\n        minmax(190px, 0.82fr);\n      gap: clamp(8px, 1vw, 14px);\n      align-items: stretch;\n      margin: 0 auto;\n      overflow: hidden;\n    }\n\n    #game-screen .game-pseudo-col,\n    #game-screen .game-maze-col,\n    #game-screen .game-progress-col {\n      min-width: 0;\n      min-height: 0;\n      height: 100%;\n      display: flex;\n    }\n\n    /* Izquierda: pseudocódigo, con scroll solo dentro de la lista. */\n    #game-screen .pseudo-panel {\n      width: 100%;\n      height: 100%;\n      min-height: 0;\n      overflow: hidden;\n      display: flex;\n      flex-direction: column;\n    }\n\n    #game-screen .pseudo-panel .panel-header {\n      flex: 0 0 auto;\n      margin: 6px;\n      padding: clamp(6px, 1vh, 9px);\n      font-size: clamp(0.8rem, 1.5vh, 0.95rem);\n      text-align: center;\n      border-radius: 7px;\n    }\n\n    #game-screen .pseudo-body {\n      flex: 1 1 auto;\n      min-height: 0;\n      overflow-y: auto;\n      overflow-x: hidden;\n      padding: 6px 8px;\n      font-size: clamp(0.68rem, 1.35vh, 0.83rem);\n      line-height: 1.32;\n    }\n\n    #game-screen .pseudo-actions {\n      flex: 0 0 auto;\n      padding: 6px 8px;\n      gap: 5px;\n    }\n\n    #game-screen .pseudo-actions .btn-small {\n      flex: 1;\n      min-width: 0;\n      padding: 5px 6px;\n      font-size: clamp(0.61rem, 1.15vh, 0.72rem);\n    }\n\n    /* Centro: el canvas se reduce automáticamente sin alterar el laberinto lógico. */\n    #game-screen .maze-panel {\n      width: 100%;\n      height: 100%;\n      min-height: 0;\n      padding: clamp(6px, 0.9vh, 10px);\n      overflow: hidden;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n    }\n\n    #game-screen #maze-canvas {\n      width: auto;\n      height: auto;\n      max-width: 100%;\n      max-height: 100%;\n      object-fit: contain;\n      flex: 0 1 auto;\n    }\n\n    /* Derecha: progreso fijo y acciones al fondo. */\n    #game-screen .progress-panel {\n      width: 100%;\n      height: 100%;\n      min-height: 0;\n      display: flex;\n      flex-direction: column;\n      overflow: hidden;\n    }\n\n    #game-screen .progress-panel .panel-header {\n      flex: 0 0 auto;\n      margin: 0;\n      padding: clamp(7px, 1vh, 10px);\n      font-size: clamp(0.84rem, 1.5vh, 1rem);\n      text-align: center;\n    }\n\n    #game-screen .progress-info {\n      flex: 0 0 auto;\n      padding: clamp(6px, 1vh, 10px);\n      gap: clamp(4px, 0.7vh, 7px);\n      overflow-y: auto;\n    }\n\n    #game-screen .progress-info .info-row {\n      padding: clamp(5px, 0.8vh, 8px);\n      font-size: clamp(0.66rem, 1.3vh, 0.8rem);\n      gap: 5px;\n    }\n\n    #game-screen .action-buttons {\n      flex: 0 0 auto;\n      margin-top: auto;\n      padding: clamp(6px, 1vh, 10px);\n      gap: 6px;\n    }\n\n    #game-screen .action-buttons .btn {\n      width: 100%;\n      padding: clamp(7px, 1.05vh, 10px) 8px;\n      font-size: clamp(0.67rem, 1.3vh, 0.82rem);\n    }\n\n    /* En pantallas angostas no se apilan columnas: se conserva la estructura. */\n    @media (max-width: 900px) {\n      #game-screen {\n        overflow-x: auto;\n        overflow-y: hidden;\n      }\n\n      #game-screen > .main-container {\n        min-width: 720px;\n      }\n\n      #game-screen .game-layout {\n        grid-template-columns: 180px minmax(300px, 1fr) 180px;\n        gap: 8px;\n      }\n\n      #game-screen .instructions-bar {\n        overflow-x: auto;\n      }\n    }\n\n    /* En pantallas de poca altura se compactan elementos superiores. */\n    @media (max-height: 700px) {\n      #game-screen > .main-container {\n        padding-top: 6px;\n        padding-bottom: 6px;\n        gap: 4px;\n      }\n\n      #game-screen .lab-animated-title-container {\n        height: 10%;\n      }\n\n      #game-screen .lab-animated-title {\n        font-size: 2rem;\n      }\n\n      #game-screen .rules-section {\n        height: 10%;\n        padding: 6px 9px;\n      }\n\n      #game-screen .rules-section p {\n        font-size: 0.90rem;\n      }\n\n      #game-screen .instructions-bar {\n        height: 10%;\n        padding: 6px;\n      }\n\n      #game-screen .inst-card {\n        padding: 5px 6px;\n      }\n\n      #game-screen .inst-label {\n        font-size: 0.78rem;\n      }\n\n      #game-screen .panel-header,\n      #game-screen .pseudo-panel .panel-header,\n      #game-screen .progress-panel .panel-header {\n        padding-top: 5px;\n        padding-bottom: 5px;\n      }\n    }\n\n  </style>\n</head>\n\n<body>\n  <!-- ===== PANTALLA INICIO ===== -->\n  <div id=\"start-screen\" class=\"overlay\">\n    <div class=\"game-title static\">\n      <h2 class=\"info-title start-title\" id=\"start-title\"></h2>\n    </div>\n    <div class=\"start-level-pill\">Nivel: <span id=\"start-level-label\">Basico</span></div>\n    <div class=\"start-actions\">\n      <button class=\"big-btn\" type=\"button\" onclick=\"startGameSequence()\">&#9658; Iniciar Juego</button>\n      <button class=\"big-btn btn-info\" type=\"button\" onclick=\"toggleInfo(true)\">&#9432; Informaci&oacute;n</button>\n    </div>\n  </div>\n\n  <!-- ===== PANTALLA COUNTDOWN ===== -->\n  <div id=\"countdown-screen\" class=\"overlay hidden\">\n    <div id=\"countdown-display\" class=\"countdown-number\">3</div>\n  </div>\n\n  <!-- ===== MODAL INFORMACIÓN ===== -->\n  <div id=\"info-overlay\" class=\"overlay hidden\"\n    style=\"background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(2px); z-index: 100; display: flex;\">\n    <div class=\"info-modal-content\">\n      <button class=\"close-info-btn\" type=\"button\" onclick=\"toggleInfo(false)\">&times;</button>\n      <div class=\"info-header\">\n        <h2 class=\"info-title\" id=\"info-game-name\">Juego del Laberinto</h2>\n        <div class=\"info-subtitle\">Actividad configurada desde la plataforma AR-GenSTEAM</div>\n      </div>\n      <div class=\"info-details-grid\">\n        <div class=\"info-item\">\n          <span class=\"info-label\">Nivel</span>\n          <span class=\"info-value\" id=\"info-level-label\">Basico</span>\n        </div>\n        <div class=\"info-item\">\n          <span class=\"info-label\">Plataforma</span>\n          <span class=\"info-value\">Web</span>\n        </div>\n        <div class=\"info-item\" style=\"grid-column: 1 / -1;\">\n          <span class=\"info-label\">Descripci&oacute;n</span>\n          <span class=\"info-value\">Resuelve el laberinto creando una secuencia de instrucciones en\n            pseudoc&oacute;digo.</span>\n        </div>\n      </div>\n      <div style=\"text-align: center;\">\n        <button class=\"big-btn\" type=\"button\" onclick=\"toggleInfo(false)\">Cerrar</button>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"app-container hidden\"></div>\n\n  <!-- ===== GAME UI ===== -->\n  <div id=\"game-screen\" class=\"hidden\"></div>\n  <!-- ===== END SCREEN ===== -->\n  <div id=\"end-screen\" class=\"overlay hidden\">\n    <h1 id=\"end-title\" class=\"end-title\">Fin del Juego</h1>\n    <h2 class=\"end-score\">Puntos Obtenidos: <span id=\"final-score\">0</span></h2>\n    <p id=\"end-detail\" class=\"end-detail\"></p>\n    <div class=\"end-buttons\">\n      <button class=\"big-btn btn-exit\" type=\"button\" onclick=\"exitMazeGame()\">Salir</button>\n      <button class=\"big-btn btn-retry\" type=\"button\" onclick=\"restartMazeGame()\">Volver a Jugar</button>\n    </div>\n  </div>\n  <script>\n    // ===== CONFIGURACIÓN DE SERVIDOR =====\n    const SERVER_URL =\n      window.location.hostname === \"localhost\" ||\n        window.location.hostname === \"127.0.0.1\"\n        ? \"http://localhost:3001\"\n        : \"https://juegos-o3jk.onrender.com\";\n\n    // Función para hacer fetch con reintentos automáticos\n    async function fetchWithRetry(url, options = {}, maxRetries = 3) {\n      let lastError;\n      for (let i = 0; i < maxRetries; i++) {\n        try {\n          const response = await fetch(url, options);\n          if (response.ok) return response;\n          lastError = new Error(`HTTP ${response.status}`);\n        } catch (error) {\n          lastError = error;\n        }\n        if (i < maxRetries - 1)\n          await new Promise((resolve) => setTimeout(resolve, 1000));\n      }\n      throw lastError;\n    }\n\n    // Datos del juego\n    const gameData = {\n      selectedDifficulty: \"basico\",\n      currentStep: 0,\n      score: 0,\n    };\n\n    let isConfigurationOpen = false;\n\n    let mazeGameApi = null;\n    let mazeMarkupReady = false;\n    let launchConfiguredGame = null;\n    let countdownTimerId = null;\n\n    const LEVEL_LABELS = {\n      basico: \"Basico\",\n      intermedio: \"Intermedio\",\n      avanzado: \"Avanzado\",\n    };\n\n    function getLevelLabel(level) {\n      return LEVEL_LABELS[level] || \"Basico\";\n    }\n\n    function setLaunchOverlay(activeId) {\n      [\"start-screen\", \"countdown-screen\", \"end-screen\"].forEach((id) => {\n        const el = document.getElementById(id);\n        if (!el) return;\n        el.classList.toggle(\"hidden\", id !== activeId);\n      });\n\n      if (activeId) {\n        const appContainer = document.querySelector(\".app-container\");\n        const gameScreen = document.getElementById(\"game-screen\");\n        if (appContainer) appContainer.classList.add(\"hidden\");\n        if (gameScreen) gameScreen.classList.add(\"hidden\");\n      }\n    }\n\n    function hideLaunchOverlays() {\n      [\"start-screen\", \"countdown-screen\", \"info-overlay\"].forEach((id) => {\n        const el = document.getElementById(id);\n        if (!el) return;\n        el.classList.add(\"hidden\");\n        if (id === \"info-overlay\") el.style.display = \"none\";\n      });\n    }\n\n    function showEndScreen({ completed = false, score = 0, currentExercise = 0, totalExercises = 0 } = {}) {\n      hideLaunchOverlays();\n\n      const appContainer = document.querySelector(\".app-container\");\n      const gameScreen = document.getElementById(\"game-screen\");\n      const endScreen = document.getElementById(\"end-screen\");\n      const endTitle = document.getElementById(\"end-title\");\n      const finalScore = document.getElementById(\"final-score\");\n      const endDetail = document.getElementById(\"end-detail\");\n\n      if (appContainer) appContainer.classList.add(\"hidden\");\n      if (gameScreen) gameScreen.classList.add(\"hidden\");\n      if (endTitle) endTitle.textContent = completed ? \"¡Juego Completado!\" : \"Fin del Juego\";\n      if (finalScore) finalScore.textContent = score;\n      if (endDetail) {\n        const total = totalExercises || 0;\n        const current = total ? Math.min(currentExercise + 1, total) : currentExercise + 1;\n        endDetail.textContent = total ? `Ejercicios: ${current} de ${total}` : \"\";\n      }\n      if (endScreen) {\n        endScreen.classList.remove(\"hidden\");\n        endScreen.style.display = \"flex\";\n      }\n    }\n\n    function hideEndScreen() {\n      const endScreen = document.getElementById(\"end-screen\");\n      if (!endScreen) return;\n      endScreen.classList.add(\"hidden\");\n      endScreen.style.display = \"none\";\n    }\n\n    function restartMazeGame() {\n      hideEndScreen();\n      startGameSequence();\n    }\n\n    function exitMazeGame() {\n      window.close();\n      window.setTimeout(() => {\n        if (!window.closed) {\n          window.alert(\"Juego Finalizado. Por favor cierra esta pestaña manualmente.\");\n        }\n      }, 120);\n    }\n\n    function updateStartScreenFromConfig(config) {\n      const name = config?.nombreApp || \"Juego del Laberinto\";\n      const level = getLevelLabel(config?.nivel || \"basico\");\n      const startTitle = document.getElementById(\"start-title\");\n      const startLevel = document.getElementById(\"start-level-label\");\n      const infoName = document.getElementById(\"info-game-name\");\n      const infoLevel = document.getElementById(\"info-level-label\");\n\n      document.title = name;\n      if (startTitle) startTitle.textContent = name;\n      if (startLevel) startLevel.textContent = level;\n      if (infoName) infoName.textContent = name;\n      if (infoLevel) infoLevel.textContent = level;\n    }\n\n    function toggleInfo(show) {\n      const modal = document.getElementById(\"info-overlay\");\n      if (!modal) return;\n      if (show) {\n        modal.classList.remove(\"hidden\");\n        modal.style.display = \"flex\";\n        return;\n      }\n      modal.classList.add(\"hidden\");\n      window.setTimeout(() => {\n        modal.style.display = \"none\";\n      }, 200);\n    }\n\n    function startGameSequence() {\n      const countdownDisplay = document.getElementById(\"countdown-display\");\n      if (countdownTimerId) clearInterval(countdownTimerId);\n      hideEndScreen();\n      setLaunchOverlay(\"countdown-screen\");\n\n      let remaining = 5;\n      if (countdownDisplay) countdownDisplay.textContent = remaining;\n\n      countdownTimerId = window.setInterval(() => {\n        remaining -= 1;\n        if (remaining > 0) {\n          if (countdownDisplay) {\n            countdownDisplay.textContent = remaining;\n            countdownDisplay.style.animation = \"none\";\n            countdownDisplay.offsetHeight;\n            countdownDisplay.style.animation = \"popIn 0.5s ease-out\";\n          }\n          return;\n        }\n\n        clearInterval(countdownTimerId);\n        countdownTimerId = null;\n\n        if (typeof launchConfiguredGame === \"function\") {\n          launchConfiguredGame();\n        } else {\n          startARGame();\n        }\n      }, 1000);\n    }\n\n    function buildMazeGameMarkup() {\n      return `\n        <div class=\"main-container\">\n            <div class=\"lab-animated-title-container\">\n                <h1 class=\"lab-animated-title\">\n                    <span style=\"animation-delay:0s\">J</span><span style=\"animation-delay:0.1s\">u</span><span style=\"animation-delay:0.2s\">e</span><span style=\"animation-delay:0.3s\">g</span><span style=\"animation-delay:0.4s\">o</span><span style=\"animation-delay:0.5s\">&nbsp;</span><span style=\"animation-delay:0.6s\">d</span><span style=\"animation-delay:0.7s\">e</span><span style=\"animation-delay:0.8s\">l</span><span style=\"animation-delay:0.9s\">&nbsp;</span><span style=\"animation-delay:1s\">L</span><span style=\"animation-delay:1.1s\">a</span><span style=\"animation-delay:1.2s\">b</span><span style=\"animation-delay:1.3s\">e</span><span style=\"animation-delay:1.4s\">r</span><span style=\"animation-delay:1.5s\">i</span><span style=\"animation-delay:1.6s\">n</span><span style=\"animation-delay:1.7s\">t</span><span style=\"animation-delay:1.8s\">o</span>\n                </h1>\n                <div class=\"lab-floating-icons\">\n                    <span class=\"lab-icon-1\">A</span>\n                    <span class=\"lab-icon-2\">D</span>\n                    <span class=\"lab-icon-3\">01</span>\n                    <span class=\"lab-icon-4\">I</span>\n                </div>\n            </div>\n\n            <div class=\"rules-section\">\n                <p id=\"rules-text\">\n                    <strong>📋 Reglas Básicas</strong> Usa las instrucciones de <em>Arriba</em>, <em>Abajo</em>,\n                    <em>Izquierda</em> y <em>Derecha</em> junto con la cantidad de cuadros para guiar al avatar hasta la salida.\n                    Sin límite de tiempo.\n                </p>\n            </div>\n\n            <div class=\"instructions-bar\">\n                <button id=\"toggle-instructions-btn\" class=\"btn btn-instructions\">ℹ Instrucciones</button>\n\n                <div class=\"instruction-cards\">\n                    <div class=\"inst-card\" data-type=\"A\">\n                        <span class=\"inst-var\">A &larr; ___</span>\n                        <span class=\"inst-label\">Arriba (&#8593;) <strong>A</strong> lugares</span>\n                    </div>\n                    <div class=\"inst-card\" data-type=\"B\">\n                        <span class=\"inst-var\">B &larr; ___</span>\n                        <span class=\"inst-label\">Abajo (&#8595;) <strong>B</strong> lugares</span>\n                    </div>\n                    <div class=\"inst-card\" data-type=\"I\">\n                        <span class=\"inst-var\">I &larr; ___</span>\n                        <span class=\"inst-label\">Izquierda (&#8592;) <strong>I</strong> lugares</span>\n                    </div>\n                    <div class=\"inst-card\" data-type=\"D\">\n                        <span class=\"inst-var\">D &larr; ___</span>\n                        <span class=\"inst-label\">Derecha (&#8594;) <strong>D</strong> lugares</span>\n                    </div>\n                </div>\n            </div>\n\n            <div id=\"instructions-popup\" class=\"popup hidden\">\n                <div class=\"popup-content\">\n                    <button class=\"popup-close\" id=\"close-popup\">&times;</button>\n                    <h3>Cómo jugar</h3>\n                    <ul>\n                        <li>Haz clic en una tarjeta de instrucción para agregarla a tu algoritmo.</li>\n                        <li><strong>A &larr; valor</strong>: Mover hacia arriba (&#8593;) el número de cuadros indicado.</li>\n                        <li><strong>B &larr; valor</strong>: Mover hacia abajo (&#8595;) el número de cuadros indicado.</li>\n                        <li><strong>I &larr; valor</strong>: Mover hacia la izquierda (&#8592;) el número de cuadros indicado.</li>\n                        <li><strong>D &larr; valor</strong>: Mover hacia la derecha (&#8594;) el número de cuadros indicado.</li>\n                        <li>Edita la cantidad directamente en el panel de pseudocódigo.</li>\n                        <li>Pulsa <em>Validar Solución</em> para comprobar si tu camino llega a la salida.</li>\n                        <li>Puedes eliminar instrucciones con el botón X o limpiar todo.</li>\n                    </ul>\n                </div>\n            </div>\n\n            <div class=\"game-layout\">\n                <aside class=\"game-pseudo-col\" aria-label=\"Pseudocódigo\">\n                    <div class=\"pseudo-panel card-block\">\n                        <div class=\"panel-header\">Pseudocódigo</div>\n                        <div class=\"pseudo-body\" id=\"pseudo-body\">\n                            <div class=\"pseudo-line algo-start\">Algoritmo</div>\n                            <div class=\"pseudo-line algo-end\">FinAlgoritmo</div>\n                        </div>\n                        <div class=\"pseudo-actions\">\n                            <button id=\"undo-btn\" class=\"btn btn-small btn-danger\" title=\"Eliminar última instrucción\">X Borrar última</button>\n                            <button id=\"clear-btn\" class=\"btn btn-small btn-warning\" title=\"Limpiar todo\">Limpiar</button>\n                        </div>\n                    </div>\n                </aside>\n\n                <main class=\"game-maze-col\" aria-label=\"Laberinto\">\n                    <div class=\"maze-panel\">\n                        <canvas id=\"maze-canvas\"></canvas>\n                    </div>\n                </main>\n\n                <aside class=\"game-progress-col\" aria-label=\"Progreso\">\n                    <div class=\"progress-panel stats-block\">\n                        <div class=\"panel-header\">Progreso</div>\n                        <div class=\"progress-info\">\n                            <div class=\"info-row\">\n                                <span class=\"info-label\">Nivel:</span>\n                                <span class=\"info-value\" id=\"display-level\">Básico</span>\n                            </div>\n                            <div class=\"info-row\">\n                                <span class=\"info-label\">Ejercicio:</span>\n                                <span class=\"info-value\" id=\"display-exercise\">1 de 3</span>\n                            </div>\n                            <div class=\"info-row\">\n                                <span class=\"info-label\">Oportunidades:</span>\n                                <span class=\"info-value\" id=\"display-attempts\">3 de 3</span>\n                            </div>\n                            <div class=\"info-row\">\n                                <span class=\"info-label\">Puntaje:</span>\n                                <span class=\"info-value\" id=\"display-score\">0</span>\n                            </div>\n                        </div>\n\n                        <div class=\"action-buttons\">\n                            <button class=\"btn btn-validate\" id=\"validate-btn\">Validar Solución</button>\n                            <button class=\"btn btn-finish\" id=\"finish-btn\">Finalizar Juego</button>\n                        </div>\n                    </div>\n                </aside>\n            </div>\n        </div>\n      `;\n    }\n\n    function renderMazeGameScreen() {\n      const gameScreen = document.getElementById(\"game-screen\");\n      if (!gameScreen || mazeMarkupReady) return;\n      gameScreen.innerHTML = buildMazeGameMarkup();\n      mazeMarkupReady = true;\n    }\n\n    function ensureMazeGame() {\n      renderMazeGameScreen();\n      const gameScreen = document.getElementById(\"game-screen\");\n      if (!gameScreen) return;\n      if (!mazeGameApi) {\n        mazeGameApi = createMazeGame(gameScreen);\n      }\n    }\n\n    function createMazeGame(root) {\n      const $ = (sel) => root.querySelector(sel);\n      const $$ = (sel) => root.querySelectorAll(sel);\n\n      const state = {\n        level: \"basico\",\n        maze: [],\n        rows: 0,\n        cols: 0,\n        cellSize: 0,\n        startPos: { r: 0, c: 0 },\n        endPos: { r: 0, c: 0 },\n        instructions: [],\n        score: 0,\n        isPlaying: false,\n        exercises: [],\n        currentExercise: 0,\n        totalExercises: 0,\n        attemptsLeft: 3,\n        maxAttempts: 3,\n      };\n\n      const canvas = $(\"#maze-canvas\");\n      const ctx = canvas.getContext(\"2d\");\n      const pseudoBody = $(\"#pseudo-body\");\n      const displayLevel = $(\"#display-level\");\n      const displayExercise = $(\"#display-exercise\");\n      const displayAttempts = $(\"#display-attempts\");\n      const displayScore = $(\"#display-score\");\n\n      const validateBtn = $(\"#validate-btn\");\n      const finishBtn = $(\"#finish-btn\");\n      const undoBtn = $(\"#undo-btn\");\n      const clearBtn = $(\"#clear-btn\");\n      const instructionsBtn = $(\"#toggle-instructions-btn\");\n      const instructionsPopup = $(\"#instructions-popup\");\n      const closePopupBtn = $(\"#close-popup\");\n\n      const LEVEL_CONFIG = {\n        basico: {\n          totalExercises: 6,\n          showCount: 3,\n          attempts: 3,\n          rows: 9,\n          cols: 11,\n          cellSize: 36,\n        },\n        intermedio: {\n          totalExercises: 8,\n          showCount: 4,\n          attempts: 2,\n          rows: 11,\n          cols: 15,\n          cellSize: 30,\n        },\n        avanzado: {\n          totalExercises: 10,\n          showCount: 5,\n          attempts: 1,\n          rows: 15,\n          cols: 19,\n          cellSize: 24,\n        },\n      };\n\n      const FIXED_EXERCISES = {\n        basico: [\n          { id: 1, codeLabel: \"basico 1\", name: \"Pasillo base\", seed: 1001 },\n          { id: 2, codeLabel: \"basico 2\", name: \"Ruta en zigzag\", seed: 1006 },\n          { id: 3, codeLabel: \"basico 3\", name: \"Curvas cortas\", seed: 1010 },\n          { id: 4, codeLabel: \"basico 4\", name: \"Cruce simple\", seed: 1015 },\n          { id: 5, codeLabel: \"basico 5\", name: \"Retorno guiado\", seed: 1021 },\n          { id: 6, codeLabel: \"basico 6\", name: \"Ruta extendida\", seed: 1024 },\n        ],\n        intermedio: [\n          { id: 1, codeLabel: \"intermedio 1\", name: \"Anillo central\", seed: 5003 },\n          {\n            id: 2,\n            codeLabel: \"intermedio 2\",\n            name: \"Pasillos alternos\",\n            seed: 5004,\n          },\n          {\n            id: 3,\n            codeLabel: \"intermedio 3\",\n            name: \"Bifurcacion larga\",\n            seed: 5005,\n          },\n          { id: 4, codeLabel: \"intermedio 4\", name: \"Reticula media\", seed: 5010 },\n          { id: 5, codeLabel: \"intermedio 5\", name: \"Ruta serpiente\", seed: 5012 },\n          { id: 6, codeLabel: \"intermedio 6\", name: \"Loop interior\", seed: 5013 },\n          { id: 7, codeLabel: \"intermedio 7\", name: \"Puentes dobles\", seed: 5014 },\n          { id: 8, codeLabel: \"intermedio 8\", name: \"Cierre diagonal\", seed: 5016 },\n        ],\n        avanzado: [\n          { id: 1, codeLabel: \"avanzado 1\", name: \"Malla profunda\", seed: 10001 },\n          { id: 2, codeLabel: \"avanzado 2\", name: \"Bloques espejo\", seed: 10002 },\n          { id: 3, codeLabel: \"avanzado 3\", name: \"Nucleo complejo\", seed: 10010 },\n          { id: 4, codeLabel: \"avanzado 4\", name: \"Trenza larga\", seed: 10014 },\n          { id: 5, codeLabel: \"avanzado 5\", name: \"Retorno multiple\", seed: 10016 },\n          { id: 6, codeLabel: \"avanzado 6\", name: \"Cruce denso\", seed: 10018 },\n          { id: 7, codeLabel: \"avanzado 7\", name: \"Galeria cerrada\", seed: 10019 },\n          { id: 8, codeLabel: \"avanzado 8\", name: \"Tuneles largos\", seed: 10020 },\n          { id: 9, codeLabel: \"avanzado 9\", name: \"Laberinto espejo\", seed: 10024 },\n          { id: 10, codeLabel: \"avanzado 10\", name: \"Ruta final\", seed: 10025 },\n        ],\n      };\n\n      const POINTS_CONFIG = {\n        basico: 10,\n        intermedio: 15,\n        avanzado: 20,\n      };\n\n      const COLORS = {\n        wall: \"#4a5568\",\n        wallShade: \"#3e4a60\",\n        wallHighlight: \"rgba(255, 255, 255, 0.14)\",\n        path: \"#f7fafc\",\n        grid: \"rgba(148, 163, 184, 0.34)\",\n        start: \"#3182ce\",\n        end: \"#2b6cb0\",\n        player: \"#2c5282\",\n        trail: \"rgba(49, 130, 206, 0.22)\",\n      };\n\n      function getExerciseCodeLabel(level, index, exercise = null) {\n        if (exercise && exercise.codeLabel) return exercise.codeLabel;\n        return `${level} ${index + 1}`;\n      }\n\n      function pathToMoveScript(path) {\n        if (!Array.isArray(path) || path.length < 2) return \"\";\n\n        const dirMap = {\n          \"-1,0\": \"A\",\n          \"1,0\": \"B\",\n          \"0,-1\": \"I\",\n          \"0,1\": \"D\",\n        };\n\n        const moves = [];\n        let prevType = null;\n        let count = 0;\n\n        for (let i = 1; i < path.length; i++) {\n          const dr = path[i].r - path[i - 1].r;\n          const dc = path[i].c - path[i - 1].c;\n          const type = dirMap[`${dr},${dc}`];\n          if (!type) continue;\n\n          if (type === prevType) {\n            count++;\n          } else {\n            if (prevType) moves.push(`${prevType}${count}`);\n            prevType = type;\n            count = 1;\n          }\n        }\n\n        if (prevType) moves.push(`${prevType}${count}`);\n        return moves.join(\",\");\n      }\n\n      function notify(message, type = \"info\", duration = 2500) {\n        return;\n      }\n\n      function mulberry32(seed) {\n        let t = seed >>> 0;\n        return function () {\n          t += 0x6d2b79f5;\n          let x = Math.imul(t ^ (t >>> 15), t | 1);\n          x ^= x + Math.imul(x ^ (x >>> 7), x | 61);\n          return ((x ^ (x >>> 14)) >>> 0) / 4294967296;\n        };\n      }\n\n      function shuffleArray(array, rng = Math.random) {\n        const arr = array.slice();\n        for (let i = arr.length - 1; i > 0; i--) {\n          const j = Math.floor(rng() * (i + 1));\n          [arr[i], arr[j]] = [arr[j], arr[i]];\n        }\n        return arr;\n      }\n\n      function generateMaze(rows, cols, rng = Math.random) {\n        const R = rows % 2 === 0 ? rows + 1 : rows;\n        const C = cols % 2 === 0 ? cols + 1 : cols;\n        const grid = Array.from({ length: R }, () => Array(C).fill(1));\n        const stack = [];\n        grid[1][1] = 0;\n        stack.push([1, 1]);\n        const dirs = [\n          [0, 2],\n          [0, -2],\n          [2, 0],\n          [-2, 0],\n        ];\n\n        while (stack.length) {\n          const [cr, cc] = stack[stack.length - 1];\n          const shuffled = shuffleArray(dirs, rng);\n          let moved = false;\n          for (const [dr, dc] of shuffled) {\n            const nr = cr + dr,\n              nc = cc + dc;\n            if (nr > 0 && nr < R && nc > 0 && nc < C && grid[nr][nc] === 1) {\n              grid[cr + dr / 2][cc + dc / 2] = 0;\n              grid[nr][nc] = 0;\n              stack.push([nr, nc]);\n              moved = true;\n              break;\n            }\n          }\n          if (!moved) stack.pop();\n        }\n        return { grid, R, C };\n      }\n\n      function solveMaze(grid, start, end) {\n        const R = grid.length,\n          C = grid[0].length;\n        const visited = Array.from({ length: R }, () => Array(C).fill(false));\n        const parent = Array.from({ length: R }, () => Array(C).fill(null));\n        const queue = [start];\n        visited[start.r][start.c] = true;\n        const dirs = [\n          [-1, 0],\n          [1, 0],\n          [0, -1],\n          [0, 1],\n        ];\n\n        while (queue.length) {\n          const { r, c } = queue.shift();\n          if (r === end.r && c === end.c) {\n            const path = [];\n            let cur = { r, c };\n            while (cur) {\n              path.unshift(cur);\n              cur = parent[cur.r][cur.c];\n            }\n            return path;\n          }\n          for (const [dr, dc] of dirs) {\n            const nr = r + dr,\n              nc = c + dc;\n            if (\n              nr >= 0 &&\n              nr < R &&\n              nc >= 0 &&\n              nc < C &&\n              !visited[nr][nc] &&\n              grid[nr][nc] === 0\n            ) {\n              visited[nr][nc] = true;\n              parent[nr][nc] = { r, c };\n              queue.push({ r: nr, c: nc });\n            }\n          }\n        }\n        return null;\n      }\n\n      function drawMaze(playerPos = null, trail = []) {\n        const { maze: grid, rows: R, cols: C, cellSize: s } = state;\n        canvas.width = C * s;\n        canvas.height = R * s;\n        ctx.imageSmoothingEnabled = false;\n\n\n        ctx.fillStyle = COLORS.path;\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n        ctx.strokeStyle = COLORS.grid;\n        ctx.lineWidth = 0.6;\n        for (let r = 0; r <= R; r++) {\n          ctx.beginPath();\n          ctx.moveTo(0, r * s);\n          ctx.lineTo(C * s, r * s);\n          ctx.stroke();\n        }\n        for (let c = 0; c <= C; c++) {\n          ctx.beginPath();\n          ctx.moveTo(c * s, 0);\n          ctx.lineTo(c * s, R * s);\n          ctx.stroke();\n        }\n\n        for (let r = 0; r < R; r++) {\n          for (let c = 0; c < C; c++) {\n            if (grid[r][c] === 1) {\n              ctx.fillStyle = COLORS.wall;\n              ctx.fillRect(c * s + 1, r * s + 1, s - 2, s - 2);\n\n              ctx.fillStyle = COLORS.wallHighlight;\n              ctx.fillRect(c * s + 1, r * s + 1, s - 2, 1);\n              ctx.fillRect(c * s + 1, r * s + 1, 1, s - 2);\n\n              ctx.fillStyle = COLORS.wallShade;\n              ctx.fillRect(c * s + s - 2, r * s + 1, 1, s - 2);\n              ctx.fillRect(c * s + 1, r * s + s - 2, s - 2, 1);\n            }\n          }\n        }\n\n        for (const { r, c } of trail) {\n          ctx.fillStyle = COLORS.trail;\n          ctx.fillRect(c * s + 3, r * s + 3, s - 6, s - 6);\n        }\n\n        ctx.font = `bold ${Math.floor(s * 0.5)}px sans-serif`;\n        ctx.textAlign = \"center\";\n        ctx.textBaseline = \"middle\";\n\n        ctx.fillStyle = COLORS.start;\n        ctx.fillRect(\n          state.startPos.c * s + 3,\n          state.startPos.r * s + 3,\n          s - 6,\n          s - 6,\n        );\n        ctx.strokeStyle = \"rgba(255,255,255,0.45)\";\n        ctx.lineWidth = 1;\n        ctx.strokeRect(\n          state.startPos.c * s + 3.5,\n          state.startPos.r * s + 3.5,\n          s - 7,\n          s - 7,\n        );\n        ctx.fillStyle = \"#fff\";\n        ctx.fillText(\n          \"I\",\n          state.startPos.c * s + s / 2,\n          state.startPos.r * s + s / 2,\n        );\n\n        ctx.fillStyle = COLORS.end;\n        ctx.fillRect(state.endPos.c * s + 3, state.endPos.r * s + 3, s - 6, s - 6);\n        ctx.strokeStyle = \"rgba(255,255,255,0.45)\";\n        ctx.lineWidth = 1;\n        ctx.strokeRect(\n          state.endPos.c * s + 3.5,\n          state.endPos.r * s + 3.5,\n          s - 7,\n          s - 7,\n        );\n        ctx.font = `${Math.floor(s * 0.6)}px \"Segoe UI Emoji\", \"Apple Color Emoji\", sans-serif`;\n        ctx.fillText(\n          \"🚩\",\n          state.endPos.c * s + s / 2,\n          state.endPos.r * s + s / 2 + 1,\n        );\n\n        const currentPos = playerPos || {\n          r: state.startPos.r,\n          c: state.startPos.c,\n          facing: 0,\n        };\n        drawPlayer(currentPos.r, currentPos.c, currentPos.facing);\n      }\n\n      function drawPlayer(r, c, facing = 0) {\n        const s = state.cellSize;\n        const cx = c * s + s / 2,\n          cy = r * s + s / 2;\n\n        ctx.fillStyle = \"rgba(255, 255, 255, 0.85)\";\n        ctx.beginPath();\n        ctx.arc(cx, cy, s * 0.34, 0, Math.PI * 2);\n        ctx.fill();\n\n        ctx.strokeStyle = \"rgba(49, 130, 206, 0.45)\";\n        ctx.lineWidth = 1;\n        ctx.beginPath();\n        ctx.arc(cx, cy, s * 0.34, 0, Math.PI * 2);\n        ctx.stroke();\n\n        ctx.font = `${Math.floor(s * 0.62)}px \"Segoe UI Emoji\", \"Apple Color Emoji\", sans-serif`;\n        ctx.textAlign = \"center\";\n        ctx.textBaseline = \"middle\";\n        ctx.fillText(\"👦\", cx, cy + 1);\n      }\n\n      function syncPseudoValues() {\n        const inputs = pseudoBody.querySelectorAll(\".assign-val-input\");\n        inputs.forEach((input) => {\n          const idx = parseInt(input.dataset.index);\n          if (!isNaN(idx) && idx < state.instructions.length) {\n            const val = parseInt(input.value);\n            if (!isNaN(val) && val >= 1) {\n              state.instructions[idx].value = val;\n            }\n          }\n        });\n      }\n\n      function renderPseudo() {\n        const lines = state.instructions.map((inst, idx) => {\n          const num = idx + 1;\n          let varName, actionText;\n          switch (inst.type) {\n            case \"A\":\n              varName = \"A\";\n              actionText = \"Arriba (↑) A lugares\";\n              break;\n            case \"B\":\n              varName = \"B\";\n              actionText = \"Abajo (↓) B lugares\";\n              break;\n            case \"I\":\n              varName = \"I\";\n              actionText = \"Izquierda (←) I lugares\";\n              break;\n            case \"D\":\n              varName = \"D\";\n              actionText = \"Derecha (→) D lugares\";\n              break;\n          }\n          return `<div class=\"pseudo-line inst-line\">\n                <span class=\"line-num\">${num}</span>\n                <span class=\"assign-var\">${varName}</span> &larr;\n                <input type=\"number\" class=\"assign-val-input\" data-index=\"${idx}\" min=\"1\" max=\"20\" value=\"${inst.value}\">\n                <span class=\"action-text\">${actionText}</span>\n                <button class=\"remove-inst-btn\" data-index=\"${idx}\" title=\"Eliminar\">X</button>\n            </div>`;\n        });\n\n        pseudoBody.innerHTML =\n          `<div class=\"pseudo-line algo-start\">Algoritmo</div>` +\n          lines.join(\"\") +\n          `<div class=\"pseudo-line algo-end\">FinAlgoritmo</div>`;\n\n        pseudoBody.scrollTop = pseudoBody.scrollHeight;\n\n        pseudoBody.querySelectorAll(\".assign-val-input\").forEach((input) => {\n          input.addEventListener(\"change\", () => {\n            const idx = parseInt(input.dataset.index);\n            const val = parseInt(input.value);\n            if (\n              !isNaN(idx) &&\n              idx < state.instructions.length &&\n              !isNaN(val) &&\n              val >= 1\n            ) {\n              state.instructions[idx].value = val;\n            }\n          });\n        });\n\n        pseudoBody.querySelectorAll(\".remove-inst-btn\").forEach((btn) => {\n          btn.addEventListener(\"click\", () => {\n            const idx = parseInt(btn.dataset.index);\n            syncPseudoValues();\n            state.instructions.splice(idx, 1);\n            renderPseudo();\n          });\n        });\n      }\n\n      function countPathTurns(path) {\n        if (!Array.isArray(path) || path.length < 3) return 0;\n        let turns = 0;\n        let prevDr = null,\n          prevDc = null;\n\n        for (let i = 1; i < path.length; i++) {\n          const dr = path[i].r - path[i - 1].r;\n          const dc = path[i].c - path[i - 1].c;\n          if (prevDr !== null && (dr !== prevDr || dc !== prevDc)) turns++;\n          prevDr = dr;\n          prevDc = dc;\n        }\n        return turns;\n      }\n\n      function buildExerciseAudit(exercise, index, level) {\n        return {\n          code: getExerciseCodeLabel(level, index, exercise),\n          id: exercise.id,\n          name: exercise.name || \"\",\n          seed: exercise.seed,\n          pathLength: Array.isArray(exercise.solution)\n            ? exercise.solution.length\n            : 0,\n          turns: countPathTurns(exercise.solution || []),\n          optimalMoveScript:\n            exercise.optimalMoveScript || pathToMoveScript(exercise.solution || []),\n        };\n      }\n\n      function isExactPath(trail, solution) {\n        if (!Array.isArray(trail) || !Array.isArray(solution)) return false;\n        if (trail.length !== solution.length) return false;\n\n        for (let i = 0; i < trail.length; i++) {\n          if (trail[i].r !== solution[i].r || trail[i].c !== solution[i].c) {\n            return false;\n          }\n        }\n\n        return true;\n      }\n\n      function generateExercises(level) {\n        const cfg = LEVEL_CONFIG[level];\n        const bank = FIXED_EXERCISES[level] || [];\n        const selected = shuffleArray(bank).slice(0, cfg.showCount);\n\n        return selected.map((exerciseDef) => {\n          const seed = exerciseDef.seed;\n          const rng = mulberry32(seed);\n          const { grid, R, C } = generateMaze(cfg.rows, cfg.cols, rng);\n          const startPos = { r: 1, c: 1 };\n          const endPos = { r: R - 2, c: C - 2 };\n          grid[startPos.r][startPos.c] = 0;\n          grid[endPos.r][endPos.c] = 0;\n\n          const solution = solveMaze(grid, startPos, endPos);\n          const optimalMoveScript = pathToMoveScript(solution);\n\n          return {\n            id: `${level}-${exerciseDef.id}`,\n            codeLabel: exerciseDef.codeLabel,\n            name: exerciseDef.name,\n            maze: grid,\n            rows: R,\n            cols: C,\n            startPos,\n            endPos,\n            solution,\n            optimalMoveScript,\n            seed,\n          };\n        });\n      }\n\n      function initGame() {\n        state.level = state.level || \"basico\";\n        state.score = 0;\n        state.instructions = [];\n\n        const cfg = LEVEL_CONFIG[state.level];\n        state.cellSize = cfg.cellSize;\n        state.maxAttempts = cfg.attempts;\n        state.currentExercise = 0;\n        state.exercises = generateExercises(state.level);\n        state.totalExercises = state.exercises.length;\n\n        window.getSelectedExercisesAudit = () =>\n          state.exercises.map((ex, idx) =>\n            buildExerciseAudit(ex, idx, state.level),\n          );\n        window.getCurrentExerciseAudit = () =>\n          buildExerciseAudit(\n            state.exercises[state.currentExercise],\n            state.currentExercise,\n            state.level,\n          );\n\n        const levelNames = {\n          basico: \"Basico\",\n          intermedio: \"Intermedio\",\n          avanzado: \"Avanzado\",\n        };\n        const levelLabel = levelNames[state.level];\n        displayLevel.textContent = levelLabel;\n        displayScore.textContent = \"0\";\n\n        loadExercise(0);\n        state.isPlaying = true;\n      }\n\n      function loadExercise(index) {\n        const ex = state.exercises[index];\n        state.maze = ex.maze;\n        state.rows = ex.rows;\n        state.cols = ex.cols;\n        state.startPos = ex.startPos;\n        state.endPos = ex.endPos;\n        state.instructions = [];\n        state.currentExercise = index;\n        state.attemptsLeft = state.maxAttempts;\n\n        displayExercise.textContent = `${index + 1} de ${state.totalExercises}`;\n        displayAttempts.textContent = `${state.attemptsLeft} de ${state.maxAttempts}`;\n\n        const audit = buildExerciseAudit(ex, index, state.level);\n        console.groupCollapsed(`[Laberinto][Audit] ${audit.code}`);\n        console.log(audit);\n        console.groupEnd();\n\n        renderPseudo();\n        drawMaze();\n      }\n\n      function addInstruction(type) {\n        if (!state.isPlaying) return;\n        syncPseudoValues();\n        state.instructions.push({ type, value: 1 });\n        renderPseudo();\n      }\n\n      function validateSolution() {\n        if (!state.isPlaying) return;\n        syncPseudoValues();\n\n        if (state.instructions.length === 0) {\n          notify(\"Agrega instrucciones primero\", \"error\");\n          return;\n        }\n\n        let r = state.startPos.r,\n          c = state.startPos.c;\n        const trail = [{ r, c }];\n        let hitWall = false;\n\n        const dirMap = { A: [-1, 0], B: [1, 0], I: [0, -1], D: [0, 1] };\n\n        for (const inst of state.instructions) {\n          const [dr, dc] = dirMap[inst.type];\n          for (let step = 0; step < inst.value; step++) {\n            const nr = r + dr,\n              nc = c + dc;\n            if (\n              nr < 0 ||\n              nr >= state.rows ||\n              nc < 0 ||\n              nc >= state.cols ||\n              state.maze[nr][nc] === 1\n            ) {\n              hitWall = true;\n              break;\n            }\n            r = nr;\n            c = nc;\n            trail.push({ r, c });\n          }\n          if (hitWall) break;\n        }\n\n        animateTrail(trail, hitWall, r, c);\n      }\n\n      function animateTrail(trail, hitWall, finalR, finalC) {\n        const mazePanel = root.querySelector(\".maze-panel\");\n        mazePanel.classList.add(\"animating\");\n        validateBtn.disabled = true;\n        let step = 0;\n\n        const animInterval = setInterval(() => {\n          if (step >= trail.length) {\n            clearInterval(animInterval);\n            mazePanel.classList.remove(\"animating\");\n            validateBtn.disabled = false;\n\n            const currentExercise = state.exercises[state.currentExercise];\n            const isOptimalRoute = currentExercise\n              ? isExactPath(trail, currentExercise.solution)\n              : false;\n\n            if (\n              hitWall ||\n              !(finalR === state.endPos.r && finalC === state.endPos.c) ||\n              !isOptimalRoute\n            ) {\n              state.attemptsLeft--;\n              state.score = Math.max(0, state.score - 5);\n              displayAttempts.textContent = `${state.attemptsLeft} de ${state.maxAttempts}`;\n\n              if (state.attemptsLeft <= 0) {\n                state.isPlaying = false;\n              }\n\n              showResultModal(\"failed\", state.score);\n            } else {\n              const exercisePoints = POINTS_CONFIG[state.level] || 10;\n              state.score += exercisePoints;\n              state.isPlaying = false;\n              displayScore.textContent = state.score;\n              notify(\"Correcto. Encontraste la salida.\", \"success\", 2000);\n              setTimeout(() => {\n                (async () => {\n                  await showLaberintoARStageModal(\"Acierto\");\n                  if (state.currentExercise < state.totalExercises - 1) {\n                    showResultModal(\"next\", state.score);\n                  } else {\n                    await showLaberintoARStageModal(\"Final\");\n                    showResultModal(\"complete\", state.score);\n                  }\n                })();\n              }, 1500);\n            }\n            displayScore.textContent = state.score;\n            return;\n          }\n\n          const partialTrail = trail.slice(0, step + 1);\n          const pos = trail[step];\n          let facing = 0;\n          if (step > 0) {\n            const prev = trail[step - 1];\n            const dr = pos.r - prev.r,\n              dc = pos.c - prev.c;\n            if (dc === 1) facing = 0;\n            else if (dr === 1) facing = 1;\n            else if (dc === -1) facing = 2;\n            else if (dr === -1) facing = 3;\n          }\n          drawMaze({ r: pos.r, c: pos.c, facing }, partialTrail);\n          step++;\n        }, 120);\n      }\n\n      function showResultModal(type, points) {\n        const overlay = document.createElement(\"div\");\n        overlay.className = \"modal-overlay\";\n\n        let iconSVG = \"\",\n          title = \"\",\n          msg = \"\",\n          buttons = \"\";\n        const levelNames = {\n          basico: \"Basico\",\n          intermedio: \"Intermedio\",\n          avanzado: \"Avanzado\",\n        };\n        const isLastExercise = state.currentExercise >= state.totalExercises - 1;\n\n        switch (type) {\n          case \"next\":\n            iconSVG = `<div class=\"modal-icon\"><svg viewBox=\"0 0 64 64\"><circle cx=\"32\" cy=\"32\" r=\"30\" fill=\"#3182ce\"/><path d=\"M20 34l8 8 16-16\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></div>`;\n            title = \"Solucion Correcta\";\n            msg = `<p><strong>Puntos obtenidos:</strong> ${points}</p><p>Ejercicio ${state.currentExercise + 1} de ${state.totalExercises} completado.</p>`;\n            buttons = `<button class=\"btn-modal-primary\" data-action=\"next\">Siguiente Ejercicio</button>`;\n            break;\n          case \"failed\":\n            iconSVG = `<div class=\"modal-icon\"><svg viewBox=\"0 0 52 52\"><circle cx=\"26\" cy=\"26\" r=\"25\" fill=\"none\" stroke=\"#64748b\" stroke-width=\"2\"/><path fill=\"none\" stroke=\"#64748b\" stroke-width=\"3\" stroke-linecap=\"round\" d=\"M18 18l16 16M34 18l-16 16\"/></svg></div>`;\n            title = \"Solucion Incorrecta\";\n            if (state.attemptsLeft > 0) {\n              msg = `<p>Intentos restantes: <strong>${state.attemptsLeft}</strong></p>`;\n              buttons = `<button class=\"btn-modal-secondary\" data-action=\"close\">Salir</button>\n                               <button class=\"btn-modal-primary\" data-action=\"retry\">Reintentar</button>`;\n            } else {\n              msg = `<p>Sin intentos restantes. <strong>Puntos obtenidos:</strong> ${points}</p>`;\n              buttons = `<button class=\"btn-modal-secondary\" data-action=\"close\">Salir</button>`;\n              if (!isLastExercise) {\n                buttons += `<button class=\"btn-modal-primary\" data-action=\"next\">Siguiente Ejercicio</button>`;\n              } else {\n                buttons += `<button class=\"btn-modal-primary\" data-action=\"close\">Finalizar</button>`;\n              }\n            }\n            break;\n          case \"complete\":\n            iconSVG = `<div class=\"modal-icon\"><svg viewBox=\"0 0 64 64\"><circle cx=\"32\" cy=\"32\" r=\"30\" fill=\"#2b6cb0\"/><path d=\"M20 34l8 8 16-16\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></div>`;\n            title = \"Juego Completado\";\n            msg = `<p><strong>Puntos obtenidos:</strong> ${points}</p><p>Completaste los ${state.totalExercises} ejercicios del nivel ${levelNames[state.level]}.</p>`;\n            buttons = `<button class=\"btn-modal-primary\" data-action=\"restart\">Jugar de nuevo</button>\n                           <button class=\"btn-modal-secondary\" data-action=\"close\">Cerrar</button>`;\n            break;\n          case \"finish\":\n            iconSVG = `<div class=\"modal-icon\"><svg viewBox=\"0 0 64 64\"><circle cx=\"32\" cy=\"32\" r=\"30\" fill=\"#718096\"/><text x=\"32\" y=\"40\" text-anchor=\"middle\" fill=\"#fff\" font-size=\"26\" font-weight=\"bold\">🏁</text></svg></div>`;\n            title = \"Juego finalizado\";\n            msg = `<p><strong>Puntaje:</strong> ${points}</p><p>Ejercicios: ${state.currentExercise + 1} de ${state.totalExercises}</p><p>Nivel: ${levelNames[state.level]}</p>`;\n            buttons = `<button class=\"btn-modal-primary\" data-action=\"restart\">Jugar de nuevo</button>\n                           <button class=\"btn-modal-secondary\" data-action=\"close\">Cerrar</button>`;\n            break;\n        }\n\n        overlay.innerHTML = `\n            <div class=\"modal-content\">\n                ${iconSVG}\n                <h2>${title}</h2>\n                ${msg}\n                <div class=\"modal-buttons\">${buttons}</div>\n            </div>`;\n\n        document.body.appendChild(overlay);\n\n        overlay.querySelectorAll(\"[data-action]\").forEach((btn) => {\n          btn.addEventListener(\"click\", () => {\n            const action = btn.dataset.action;\n            if (action === \"close\") closeModal();\n            if (action === \"retry\") closeModalAndRetry();\n            if (action === \"next\") nextExercise();\n            if (action === \"restart\") closeModalAndRestart();\n          });\n        });\n      }\n\n      function closeModal() {\n        const overlay = document.querySelector(\".modal-overlay\");\n        if (overlay) overlay.remove();\n      }\n\n      function closeModalAndRestart() {\n        closeModal();\n        initGame();\n      }\n\n      function closeModalAndRetry() {\n        closeModal();\n        state.isPlaying = true;\n        drawMaze();\n      }\n\n      function nextExercise() {\n        closeModal();\n        loadExercise(state.currentExercise + 1);\n        state.isPlaying = true;\n      }\n\n      $$(\".inst-card\").forEach((card) => {\n        card.addEventListener(\"click\", () => {\n          const type = card.dataset.type;\n          addInstruction(type);\n          card.classList.add(\"active\");\n          setTimeout(() => card.classList.remove(\"active\"), 300);\n        });\n      });\n\n      undoBtn.addEventListener(\"click\", () => {\n        if (state.instructions.length > 0) {\n          syncPseudoValues();\n          state.instructions.pop();\n          renderPseudo();\n        }\n      });\n\n      clearBtn.addEventListener(\"click\", () => {\n        if (state.instructions.length > 0) {\n          state.instructions = [];\n          renderPseudo();\n          notify(\"Instrucciones borradas\", \"info\", 1500);\n        }\n      });\n\n      validateBtn.addEventListener(\"click\", validateSolution);\n\n      finishBtn.addEventListener(\"click\", () => {\n        state.isPlaying = false;\n        showEndScreen({\n          completed: false,\n          score: state.score,\n          currentExercise: state.currentExercise,\n          totalExercises: state.totalExercises,\n        });\n      });\n\n      instructionsBtn.addEventListener(\"click\", () =>\n        instructionsPopup.classList.remove(\"hidden\"),\n      );\n      closePopupBtn.addEventListener(\"click\", () =>\n        instructionsPopup.classList.add(\"hidden\"),\n      );\n      instructionsPopup.addEventListener(\"click\", (e) => {\n        if (e.target === instructionsPopup)\n          instructionsPopup.classList.add(\"hidden\");\n      });\n\n      function setLevel(level) {\n        if (LEVEL_CONFIG[level]) {\n          state.level = level;\n        }\n        initGame();\n      }\n\n      return {\n        init: initGame,\n        setLevel,\n      };\n    }\n\n    // Configuración de ejercicios por dificultad\n    const exercises = {\n      basico: [\n        { id: 1, name: \"Ejercicio 1 - Básico\", description: \"Laberinto simple\" },\n        { id: 2, name: \"Ejercicio 2 - Básico\", description: \"Camino directo\" },\n        { id: 3, name: \"Ejercicio 3 - Básico\", description: \"Giro básico\" },\n      ],\n      avanzado: [\n        {\n          id: 4,\n          name: \"Ejercicio 1 - Avanzado\",\n          description: \"Laberinto complejo\",\n        },\n        { id: 5, name: \"Ejercicio 2 - Avanzado\", description: \"Múltiples caminos\" },\n        { id: 6, name: \"Ejercicio 3 - Avanzado\", description: \"Desafío extremo\" },\n      ],\n    };\n\n    function showCustomNotification(message, type = \"error\", duration = 2000) {\n      return;\n    }\n\n    // Helper: normaliza URLs para previews (soporta data:, absolute y rutas relativas)\n    function normalizeUrl(url) {\n      if (!url) return url;\n      if (/^(data:|blob:|https?:|\\/|file:)/.test(url)) return url;\n      // Relative path: prefix with current page folder so paths like \"Imagen/..\" resolve correctly\n      const basePath = window.location.pathname\n        .replace(/\\\\/g, \"/\")\n        .replace(/\\/[^/]*$/, \"\");\n      return (\n        window.location.origin.replace(/\\/$/, \"\") +\n        basePath +\n        \"/\" +\n        url.replace(/^\\//, \"\")\n      );\n    }\n\n    // Helper: eliminar contenido previo de la etapa excepto el tipo indicado\n    function clearStageContentExcept(cfg, stageName, keepType) {\n      if (!cfg[stageName]) cfg[stageName] = {};\n      const all = [\"Texto\", \"Imagen\", \"Audio\", \"Video\"];\n      all.forEach((t) => {\n        if (t === keepType) return;\n        delete cfg[stageName][t + \"Url\"];\n        delete cfg[stageName][t];\n        delete cfg[stageName][t + \"OriginalName\"];\n      });\n    }\n\n    const LABERINTO_AR_SYMBOLS = [\"🧭\", \"🧱\", \"🚩\", \"⭐\", \"➡️\", \"⬆️\", \"⬇️\"];\n\n    function ensureLaberintoARVisualEffects() {\n      if (document.getElementById(\"laberinto-ar-visual-effects\")) return;\n      const style = document.createElement(\"style\");\n      style.id = \"laberinto-ar-visual-effects\";\n      style.textContent = `\n        @keyframes laberintoArFloatText {\n            0%, 100% { transform: scale(1); }\n            50% { transform: scale(1.08); }\n        }\n        @keyframes laberintoArBgShift {\n            0% { background-position: 0% 50%; }\n            50% { background-position: 100% 50%; }\n            100% { background-position: 0% 50%; }\n        }\n        @keyframes laberintoArSpin {\n            0% { transform: rotate(0deg); }\n            100% { transform: rotate(360deg); }\n        }\n    `;\n      document.head.appendChild(style);\n    }\n\n    function createLaberintoARFloatingSymbols(container) {\n      LABERINTO_AR_SYMBOLS.forEach((symbol, index) => {\n        const item = document.createElement(\"div\");\n        item.textContent = symbol;\n        const isArrow = symbol === \"➡️\" || symbol === \"⬆️\" || symbol === \"⬇️\";\n        const driftX =\n          symbol === \"➡️\"\n            ? Math.floor(Math.random() * 32) + 20\n            : Math.floor(Math.random() * 20) - 10;\n        const driftY =\n          symbol === \"⬆️\"\n            ? -(Math.floor(Math.random() * 24) + 14)\n            : symbol === \"⬇️\"\n              ? Math.floor(Math.random() * 24) + 14\n              : Math.floor(Math.random() * 20) - 10;\n        item.style.cssText = `\n            position: absolute;\n            color: ${isArrow ? \"rgba(255,214,10,0.38)\" : \"rgba(255,255,255,0.24)\"};\n            font-size: ${Math.floor(Math.random() * 18) + 18}px;\n            left: ${Math.floor(Math.random() * 80) + 10}%;\n            top: ${Math.floor(Math.random() * 80) + 10}%;\n            pointer-events: none;\n            user-select: none;\n            animation: laberintoArSymbolFloat${index} ${Math.floor(Math.random() * 5) + 5}s ease-in-out infinite;\n        `;\n\n        const keyframes = document.createElement(\"style\");\n        keyframes.textContent = `\n            @keyframes laberintoArSymbolFloat${index} {\n                0%, 100% { transform: translate(0, 0) rotate(0deg); }\n                50% { transform: translate(${driftX}px, ${driftY}px) rotate(${Math.floor(Math.random() * 16) - 8}deg); }\n            }\n        `;\n        document.head.appendChild(keyframes);\n        container.appendChild(item);\n      });\n    }\n\n    function showLaberintoARStageModal(stageName) {\n      return new Promise((resolve) => {\n        let config = {};\n        let selectedStages = {};\n        try {\n          config = JSON.parse(localStorage.getItem(\"laberintoARConfig\") || \"{}\");\n          selectedStages = JSON.parse(\n            localStorage.getItem(\"selectedLaberintoStages\") || \"{}\",\n          );\n        } catch (e) { }\n\n        if (selectedStages && selectedStages[stageName] === false) {\n          resolve();\n          return;\n        }\n\n        const stage = config[stageName] || {};\n        const hasContent =\n          (stage[\"Texto\"] && stage[\"TextoValor\"]) ||\n          (stage[\"Imagen\"] && stage[\"ImagenUrl\"]) ||\n          (stage[\"Audio\"] && stage[\"AudioUrl\"]) ||\n          (stage[\"Video\"] && stage[\"VideoUrl\"]);\n\n        if (!hasContent) {\n          resolve();\n          return;\n        }\n\n        const overlay = document.createElement(\"div\");\n        overlay.style.cssText = `\n            position: fixed;\n            inset: 0;\n            background: rgba(0,0,0,0.82);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            z-index: 5000;\n            padding: 16px;\n        `;\n\n        const panel = document.createElement(\"div\");\n        panel.style.cssText = `\n            width: min(520px, 95vw);\n            background: #fff;\n            border-radius: 18px;\n            overflow: hidden;\n            box-shadow: 0 10px 28px rgba(0,0,0,0.35);\n            animation: fadeIn 0.25s ease;\n        `;\n\n        const header = document.createElement(\"div\");\n        header.style.cssText = `\n            background: #005f92;\n            color: #fff;\n            padding: 14px 16px;\n            text-align: center;\n            font-weight: 700;\n            font-size: 1.1rem;\n        `;\n        if (stageName === \"Inicio\") header.textContent = \"Inicio del juego\";\n        else if (stageName === \"Final\") header.textContent = \"Final del juego\";\n        else header.textContent = \"Acierto\";\n\n        const body = document.createElement(\"div\");\n        body.style.cssText = `\n            position: relative;\n            background: linear-gradient(145deg, #03045e 0%, #023e8a 50%, #0077b6 100%);\n            background-size: 240% 240%;\n            animation: laberintoArBgShift 7s ease infinite;\n            color: #fff;\n            padding: 16px;\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            gap: 12px;\n            text-align: center;\n            overflow: hidden;\n        `;\n\n        ensureLaberintoARVisualEffects();\n\n        const bgLayer = document.createElement(\"div\");\n        bgLayer.style.cssText = `\n            position: absolute;\n            inset: 0;\n            background:\n                radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 45%),\n                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 45%);\n            pointer-events: none;\n        `;\n        body.appendChild(bgLayer);\n\n        const ring = document.createElement(\"div\");\n        ring.style.cssText = `\n            position: absolute;\n            width: 220px;\n            height: 220px;\n            border-radius: 50%;\n            border: 2px solid rgba(255,255,255,0.18);\n            top: -70px;\n            right: -60px;\n            animation: laberintoArSpin 12s linear infinite;\n            pointer-events: none;\n        `;\n        body.appendChild(ring);\n\n        createLaberintoARFloatingSymbols(body);\n\n        if (stage[\"Texto\"] && stage[\"TextoValor\"]) {\n          const text = document.createElement(\"div\");\n          text.textContent = stage[\"TextoValor\"];\n          text.style.cssText = `\n                position: relative;\n                z-index: 2;\n                font-size: 1.8rem;\n                font-weight: 700;\n                color: #ffd60a;\n                text-shadow: 2px 2px 8px #023e8a;\n                animation: laberintoArFloatText 2.8s ease-in-out infinite;\n            `;\n          body.appendChild(text);\n        }\n\n        if (stage[\"Imagen\"] && stage[\"ImagenUrl\"]) {\n          const img = document.createElement(\"img\");\n          img.src = normalizeUrl(stage[\"ImagenUrl\"]);\n          img.alt = `Imagen ${stageName}`;\n          img.style.cssText = `\n                position: relative;\n                z-index: 2;\n                max-width: 220px;\n                max-height: 140px;\n                border-radius: 10px;\n                box-shadow: 0 2px 10px rgba(0,0,0,0.3);\n                background: #fff;\n            `;\n          body.appendChild(img);\n        }\n\n        if (stage[\"Audio\"] && stage[\"AudioUrl\"]) {\n          const audio = document.createElement(\"audio\");\n          audio.src = normalizeUrl(stage[\"AudioUrl\"]);\n          audio.controls = true;\n          audio.autoplay = true;\n          audio.style.width = \"100%\";\n          audio.style.position = \"relative\";\n          audio.style.zIndex = \"2\";\n          body.appendChild(audio);\n        }\n\n        if (stage[\"Video\"] && stage[\"VideoUrl\"]) {\n          const video = document.createElement(\"video\");\n          video.src = normalizeUrl(stage[\"VideoUrl\"]);\n          video.controls = true;\n          video.autoplay = true;\n          video.style.cssText = `\n                position: relative;\n                z-index: 2;\n                width: 100%;\n                max-height: 260px;\n                border-radius: 12px;\n                background: #000;\n            `;\n          body.appendChild(video);\n        }\n\n        const footer = document.createElement(\"div\");\n        footer.style.cssText = `\n            display: flex;\n            justify-content: center;\n            padding: 12px 16px 16px;\n            background: #fff;\n        `;\n\n        const continueBtn = document.createElement(\"button\");\n        continueBtn.textContent = \"Siguiente\";\n        continueBtn.style.cssText = `\n            background: #005f92;\n            color: #fff;\n            border: none;\n            border-radius: 10px;\n            padding: 0.75rem 1.8rem;\n            font-weight: 700;\n            cursor: pointer;\n        `;\n        continueBtn.addEventListener(\"click\", () => {\n          overlay.remove();\n          resolve();\n        });\n\n        footer.appendChild(continueBtn);\n        panel.appendChild(header);\n        panel.appendChild(body);\n        panel.appendChild(footer);\n        overlay.appendChild(panel);\n        document.body.appendChild(overlay);\n      });\n    }\n\n    window.showLaberintoARStageModal = showLaberintoARStageModal;\n\n    function showARConfigurationScreen() {\n      const appContainer = document.querySelector(\".app-container\");\n\n      isConfigurationOpen = true;\n      appContainer.innerHTML = \"\";\n\n      // Contenedor principal\n      const contentContainer = document.createElement(\"div\");\n      contentContainer.style.cssText = `\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: flex-start;\n        min-height: auto;\n        text-align: center;\n        gap: 1.5rem;\n        width: 100%;\n        padding: 2rem 1.5rem;\n        box-sizing: border-box;\n    `;\n\n      // Título principal\n      const title = document.createElement(\"h2\");\n      title.textContent = \"Configuración de Realidad Aumentada - Laberinto\";\n      title.style.cssText = `\n        color: var(--secondary);\n        font-size: 2.5rem;\n        margin: 0;\n        text-shadow: 0 2px 8px #e0e7ff;\n        animation: bounceIn 0.8s ease-out;\n        text-align: center;\n        width: 100%;\n        line-height: 1.2;\n    `;\n\n      // Subtítulo\n      const subtitle = document.createElement(\"h3\");\n      subtitle.textContent = \"Selecciona la etapa y tipos de contenido\";\n      subtitle.style.cssText = `\n        color: var(--primary);\n        font-size: 1.3rem;\n        margin: 0 0 0.5rem 0;\n        font-weight: 500;\n        animation: fadeIn 0.8s ease-out 0.2s both;\n        text-align: center;\n        width: 100%;\n    `;\n\n      // Etapas y tipos\n      const stages = [\"Inicio\", \"Acierto\", \"Final\"];\n      const types = [\"Texto\", \"Imagen\", \"Audio\", \"Video\"];\n      const typeIcons = { Texto: \"📝\", Imagen: \"🖼️\", Audio: \"🔊\", Video: \"🎬\" };\n\n      const stageIcons = { Inicio: \"🚀\", Acierto: \"✅\", Final: \"🏁\" };\n      const stageLetters = { Inicio: \"I\", Acierto: \"A\", Final: \"F\" };\n      const stageColors = {\n        Inicio: \"#005f92\",\n        Acierto: \"#43aa8b\",\n        Final: \"#ffd60a\",\n      };\n\n      let config = {};\n      try {\n        config = JSON.parse(localStorage.getItem(\"laberintoARConfig\") || \"{}\");\n      } catch (e) { }\n\n      const configPanelsContainer = document.createElement(\"div\");\n      configPanelsContainer.style.cssText = `\n        display: flex;\n        flex-direction: column;\n        gap: 1.5rem;\n        width: 100%;\n        max-width: 520px;\n        align-items: center;\n        margin: 0 auto;\n    `;\n\n      // Contenedor de checkboxes de etapas (múltiple selección)\n      const stageCheckboxesContainer = document.createElement(\"div\");\n      stageCheckboxesContainer.style.cssText = `\n        display: flex;\n        gap: 1.5rem;\n        margin-bottom: 1.5rem;\n        justify-content: center;\n        width: 100%;\n        flex-wrap: wrap;\n    `;\n\n      // Objeto para rastrear etapas seleccionadas\n      let selectedStages = {};\n      stages.forEach((stage) => {\n        selectedStages[stage] = false;\n      });\n\n      // Cargar etapas seleccionadas guardadas previamente\n      const savedSelectedStages = localStorage.getItem(\"selectedLaberintoStages\");\n      if (savedSelectedStages) {\n        try {\n          selectedStages = JSON.parse(savedSelectedStages);\n        } catch (e) { }\n      }\n\n      // Crear checkboxes para seleccionar múltiples etapas\n      stages.forEach((stage) => {\n        const checkboxWrapper = document.createElement(\"label\");\n        checkboxWrapper.style.cssText = `\n            display: flex;\n            align-items: center;\n            gap: 0.8rem;\n            padding: 0.8rem 1.2rem;\n            background: #ffffff;\n            border: 2.5px solid ${stageColors[stage]};\n            border-radius: 12px;\n            cursor: pointer;\n            transition: all 0.3s;\n            user-select: none;\n            font-weight: 600;\n            color: ${stageColors[stage]};\n            font-size: 1rem;\n        `;\n\n        const checkbox = document.createElement(\"input\");\n        checkbox.type = \"checkbox\";\n        checkbox.checked = selectedStages[stage];\n        checkbox.style.cssText = `\n            width: 20px;\n            height: 20px;\n            cursor: pointer;\n            accent-color: ${stageColors[stage]};\n        `;\n\n        const label = document.createElement(\"span\");\n        label.textContent = `${stageIcons[stage]} ${stage}`;\n\n        checkboxWrapper.appendChild(checkbox);\n        checkboxWrapper.appendChild(label);\n\n        checkbox.addEventListener(\"change\", () => {\n          selectedStages[stage] = checkbox.checked;\n          checkboxWrapper.style.background = checkbox.checked\n            ? stageColors[stage] + \"20\"\n            : \"#ffffff\";\n          checkboxWrapper.style.boxShadow = checkbox.checked\n            ? `0 4px 12px ${stageColors[stage]}40`\n            : \"none\";\n          localStorage.setItem(\n            \"selectedLaberintoStages\",\n            JSON.stringify(selectedStages),\n          );\n          updateUI();\n        });\n\n        checkboxWrapper.addEventListener(\"mouseenter\", () => {\n          checkboxWrapper.style.transform = \"translateY(-2px)\";\n        });\n        checkboxWrapper.addEventListener(\"mouseleave\", () => {\n          checkboxWrapper.style.transform = \"translateY(0)\";\n        });\n\n        stageCheckboxesContainer.appendChild(checkboxWrapper);\n      });\n\n      contentContainer.appendChild(title);\n      contentContainer.appendChild(subtitle);\n      contentContainer.appendChild(stageCheckboxesContainer);\n\n      function createConfigPanel(stage, selectedTypeParam = \"Texto\") {\n        const panel = document.createElement(\"div\");\n        panel.style.cssText = `\n            display: flex;\n            flex-direction: column;\n            gap: 1.5rem;\n        `;\n\n        const header = document.createElement(\"div\");\n        header.style.cssText = `\n            font-size: 1.3rem;\n            font-weight: bold;\n            color: ${stageColors[stage]};\n            text-align: center;\n            padding-bottom: 1rem;\n            border-bottom: 2px solid ${stageColors[stage]};\n        `;\n        header.textContent = `${stageIcons[stage]} Configura ${stage}`;\n        panel.appendChild(header);\n\n        const typeButtonsContainer = document.createElement(\"div\");\n        typeButtonsContainer.style.cssText = `\n            display: flex;\n            gap: 0.8rem;\n            justify-content: center;\n            flex-wrap: wrap;\n        `;\n\n        let selectedType = selectedTypeParam;\n        const typeButtons = {};\n\n        types.forEach((type) => {\n          const typeBtn = document.createElement(\"button\");\n          typeBtn.textContent = `${typeIcons[type]} ${type}`;\n          typeBtn.style.cssText = `\n                background: ${type === selectedType ? stageColors[stage] : \"#ffffff\"};\n                color: ${type === selectedType ? \"white\" : stageColors[stage]};\n                border: 2px solid ${stageColors[stage]};\n                border-radius: 10px;\n                padding: 0.7rem 1.2rem;\n                font-size: 0.95rem;\n                font-weight: 600;\n                cursor: pointer;\n                transition: all 0.3s;\n                box-shadow: ${type === selectedType ? `0 4px 12px ${stageColors[stage]}40` : \"none\"};\n            `;\n\n          typeBtn.addEventListener(\"click\", () => {\n            selectedType = type;\n            localStorage.setItem(`selectedType_${stage}`, selectedType);\n            types.forEach((t) => {\n              const isSelected = t === selectedType;\n              typeButtons[t].style.background = isSelected\n                ? stageColors[stage]\n                : \"#ffffff\";\n              typeButtons[t].style.color = isSelected\n                ? \"white\"\n                : stageColors[stage];\n              typeButtons[t].style.boxShadow = isSelected\n                ? `0 4px 12px ${stageColors[stage]}40`\n                : \"none\";\n            });\n            contentDiv.innerHTML = \"\";\n            loadTypeContent(stage, selectedType, contentDiv);\n          });\n\n          typeBtn.addEventListener(\"mouseenter\", () => {\n            if (type !== selectedType) {\n              typeBtn.style.background = stageColors[stage] + \"15\";\n            }\n          });\n\n          typeBtn.addEventListener(\"mouseleave\", () => {\n            if (type !== selectedType) {\n              typeBtn.style.background = \"#ffffff\";\n            }\n          });\n\n          typeButtonsContainer.appendChild(typeBtn);\n          typeButtons[type] = typeBtn;\n        });\n\n        panel.appendChild(typeButtonsContainer);\n\n        const contentDiv = document.createElement(\"div\");\n        contentDiv.style.cssText = `\n            display: flex;\n            flex-direction: column;\n            gap: 0.8rem;\n        `;\n\n        loadTypeContent(stage, selectedType, contentDiv);\n        panel.appendChild(contentDiv);\n\n        return panel;\n      }\n\n      function loadTypeContent(stage, type, container) {\n        container.innerHTML = \"\";\n\n        if (type === \"Texto\") {\n          const input = document.createElement(\"input\");\n          input.type = \"text\";\n          input.maxLength = 30;\n          input.placeholder = \"Escribe un mensaje (máx. 30 caracteres)\";\n          input.style.cssText = `\n                width: 100%;\n                padding: 10px 12px;\n                border-radius: 8px;\n                border: 1.5px solid #e6eefc;\n                font-size: 1rem;\n                color: ${stageColors[stage]};\n                text-align: center;\n                box-sizing: border-box;\n            `;\n          input.value =\n            config[stage] && config[stage][\"TextoValor\"]\n              ? config[stage][\"TextoValor\"]\n              : \"\";\n          container.appendChild(input);\n\n          const saveBtn = document.createElement(\"button\");\n          saveBtn.textContent = \"Guardar texto\";\n          saveBtn.style.cssText = `\n                background: ${stageColors[stage]};\n                color: white;\n                border: none;\n                border-radius: 8px;\n                padding: 0.6rem 1.2rem;\n                cursor: pointer;\n                font-weight: 600;\n                font-size: 0.95rem;\n                transition: all 0.3s;\n            `;\n          saveBtn.addEventListener(\"click\", () => {\n            if (!input.value.trim()) {\n              showCustomNotification(\"El texto no puede estar vacío\", \"error\");\n              return;\n            }\n            if (!config[stage]) config[stage] = {};\n            // limpiar otros tipos y dejar solo Texto\n            clearStageContentExcept(config, stage, \"Texto\");\n            config[stage][\"TextoValor\"] = input.value;\n            config[stage][\"Texto\"] = true;\n            localStorage.setItem(\"laberintoARConfig\", JSON.stringify(config));\n            saveBtn.textContent = \"✅ Guardado\";\n            saveBtn.disabled = true;\n            setTimeout(() => {\n              saveBtn.textContent = \"Guardar texto\";\n              saveBtn.disabled = false;\n              updateUI();\n            }, 2000);\n          });\n          container.appendChild(saveBtn);\n        } else if (type === \"Imagen\") {\n          const input = document.createElement(\"input\");\n          input.type = \"file\";\n          input.accept = \".jpg,.jpeg,.png,image/jpeg,image/png\";\n          input.style.cssText = `display: none;`;\n\n          const topContainer = document.createElement(\"div\");\n          topContainer.style.cssText = `\n                display: flex;\n                gap: 1rem;\n                align-items: flex-start;\n            `;\n\n          const examineBtn = document.createElement(\"button\");\n          examineBtn.textContent = \"📁 Examinar\";\n          examineBtn.style.cssText = `\n                background: linear-gradient(135deg, ${stageColors[stage]} 0%, ${stageColors[stage]}dd 100%);\n                color: white;\n                border: none;\n                border-radius: 8px;\n                padding: 0.6rem 1rem;\n                cursor: pointer;\n                font-weight: 600;\n                font-size: 0.85rem;\n                transition: all 0.3s;\n                box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n                flex-shrink: 0;\n            `;\n          examineBtn.addEventListener(\"click\", () => input.click());\n\n          const restrictionsDiv = document.createElement(\"div\");\n          restrictionsDiv.style.cssText = `\n                background: #f0f0f0;\n                padding: 0.6rem 0.8rem;\n                border-radius: 8px;\n                font-size: 0.85rem;\n                color: #666;\n                text-align: left;\n                flex-grow: 1;\n                border-left: 3px solid ${stageColors[stage]};\n            `;\n          restrictionsDiv.innerHTML = `📸 Formatos: .jpg, .jpeg, .png<br>⚖️ Máximo: 5 MB`;\n\n          topContainer.appendChild(examineBtn);\n          topContainer.appendChild(restrictionsDiv);\n          container.appendChild(input);\n          container.appendChild(topContainer);\n\n          const previewDiv = document.createElement(\"div\");\n          previewDiv.style.cssText = `\n                display: none;\n                text-align: center;\n                padding: 1rem;\n                background: #f9f9f9;\n                border-radius: 8px;\n                border: 2px dashed ${stageColors[stage]};\n            `;\n          container.appendChild(previewDiv);\n\n          const uploadBtn = document.createElement(\"button\");\n          uploadBtn.textContent = \"Guardar\";\n          uploadBtn.style.cssText = `\n                background: linear-gradient(90deg, #43aa8b 60%, ${stageColors[stage]} 100%);\n                color: white;\n                border: none;\n                border-radius: 12px;\n                padding: 0.6rem 1.5rem;\n                cursor: pointer;\n                font-weight: 600;\n                font-size: 0.95rem;\n                transition: all 0.3s;\n            `;\n          container.appendChild(uploadBtn);\n\n          let selectedFile = null;\n\n          function showImagePreview(imageSrc, fileName = null) {\n            const src = normalizeUrl(imageSrc);\n            previewDiv.innerHTML = `<strong style=\"color: ${stageColors[stage]};\">Vista previa:</strong><br><img src=\"${src}\" style=\"max-width: 200px; max-height: 120px; border-radius: 8px; margin-top: 0.8rem;\">`;\n            previewDiv.style.display = \"block\";\n            if (fileName) {\n              examineBtn.textContent = \"✅ Seleccionado\";\n            }\n          }\n\n          if (config[stage] && config[stage][\"ImagenUrl\"]) {\n            showImagePreview(config[stage][\"ImagenUrl\"]);\n            examineBtn.textContent = \"✅ Seleccionado\";\n          }\n\n          input.addEventListener(\"change\", () => {\n            const file = input.files[0];\n            selectedFile = file;\n            if (!file) return;\n            const validTypes = [\"image/jpeg\", \"image/png\"];\n            const validExt = /\\.(jpg|jpeg|png)$/i;\n            if (!validTypes.includes(file.type) || !validExt.test(file.name)) {\n              showCustomNotification(\"Solo .jpg, .jpeg o .png\", \"error\");\n              input.value = \"\";\n              selectedFile = null;\n              return;\n            }\n            if (file.size > 5 * 1024 * 1024) {\n              showCustomNotification(\"Máximo 5 MB\", \"error\");\n              input.value = \"\";\n              selectedFile = null;\n              return;\n            }\n            const reader = new FileReader();\n            reader.onload = (e) => {\n              showImagePreview(e.target.result, file.name);\n            };\n            reader.readAsDataURL(file);\n          });\n\n          uploadBtn.addEventListener(\"click\", async () => {\n            if (!selectedFile) {\n              showCustomNotification(\"Selecciona una imagen primero\", \"error\");\n              return;\n            }\n            uploadBtn.disabled = true;\n            uploadBtn.textContent = \"Procesando...\";\n\n            try {\n              const form = new FormData();\n              form.append(\"file\", selectedFile);\n              form.append(\"type\", \"Imagen\");\n\n              const resp = await fetch(\"./upload.php\", {\n                method: \"POST\",\n                body: form,\n              });\n              const json = await resp.json().catch(() => null);\n              if (resp.ok && json && json.success) {\n                if (!config[stage]) config[stage] = {};\n                // limpiar tipos previos y dejar solo Imagen\n                clearStageContentExcept(config, stage, \"Imagen\");\n                config[stage][\"ImagenUrl\"] = json.path || `Imagen/${json.filename}`;\n                config[stage][\"Imagen\"] = true;\n                config[stage][\"ImagenOriginalName\"] = selectedFile.name;\n                localStorage.setItem(\"laberintoARConfig\", JSON.stringify(config));\n\n                showImagePreview(config[stage][\"ImagenUrl\"]);\n                examineBtn.textContent = \"✅ Seleccionado\";\n                uploadBtn.textContent = \"✅ Guardado\";\n                setTimeout(() => {\n                  uploadBtn.textContent = \"Guardar\";\n                  uploadBtn.disabled = false;\n                  selectedFile = null;\n                  updateUI();\n                }, 1500);\n                return;\n              }\n              console.warn(\n                \"Upload imagen falló, usando fallback local\",\n                json || resp.status,\n              );\n            } catch (err) {\n              console.warn(\n                \"Error subiendo imagen al servidor, fallback a DataURL\",\n                err,\n              );\n            }\n\n            // Fallback: almacenar como DataURL (offline/local)\n            const reader = new FileReader();\n            reader.onload = (e) => {\n              try {\n                const dataUrl = e.target.result;\n                if (!config[stage]) config[stage] = {};\n                // limpiar tipos previos y dejar solo Imagen\n                clearStageContentExcept(config, stage, \"Imagen\");\n                config[stage][\"ImagenUrl\"] = dataUrl;\n                config[stage][\"Imagen\"] = true;\n                config[stage][\"ImagenOriginalName\"] = selectedFile.name;\n                localStorage.setItem(\"laberintoARConfig\", JSON.stringify(config));\n\n                uploadBtn.textContent = \"✅ Guardado\";\n                uploadBtn.disabled = true;\n                showImagePreview(dataUrl);\n                examineBtn.textContent = \"✅ Seleccionado\";\n\n                setTimeout(() => {\n                  uploadBtn.textContent = \"Guardar\";\n                  uploadBtn.disabled = false;\n                  selectedFile = null;\n                  updateUI();\n                }, 1500);\n              } catch (err) {\n                console.error(\"Error procesando imagen:\", err);\n                showCustomNotification(\"Error: \" + err.message, \"error\", 4000);\n                uploadBtn.disabled = false;\n                uploadBtn.textContent = \"Guardar\";\n              }\n            };\n            reader.onerror = () => {\n              showCustomNotification(\"Error al leer el archivo\", \"error\");\n              uploadBtn.disabled = false;\n              uploadBtn.textContent = \"Guardar\";\n            };\n            reader.readAsDataURL(selectedFile);\n          });\n        } else if (type === \"Audio\") {\n          const input = document.createElement(\"input\");\n          input.type = \"file\";\n          input.accept = \".mp3,audio/mp3\";\n          input.style.cssText = `display: none;`;\n\n          const topContainer = document.createElement(\"div\");\n          topContainer.style.cssText = `\n                display: flex;\n                gap: 1rem;\n                align-items: flex-start;\n            `;\n\n          const examineBtn = document.createElement(\"button\");\n          examineBtn.textContent = \"📁 Examinar\";\n          examineBtn.style.cssText = `\n                background: linear-gradient(135deg, ${stageColors[stage]} 0%, ${stageColors[stage]}dd 100%);\n                color: white;\n                border: none;\n                border-radius: 8px;\n                padding: 0.6rem 1rem;\n                cursor: pointer;\n                font-weight: 600;\n                font-size: 0.85rem;\n                transition: all 0.3s;\n                box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n                flex-shrink: 0;\n            `;\n          examineBtn.addEventListener(\"click\", () => input.click());\n\n          const restrictionsDiv = document.createElement(\"div\");\n          restrictionsDiv.style.cssText = `\n                background: #f0f0f0;\n                padding: 0.6rem 0.8rem;\n                border-radius: 8px;\n                font-size: 0.85rem;\n                color: #666;\n                text-align: left;\n                flex-grow: 1;\n                border-left: 3px solid ${stageColors[stage]};\n            `;\n          restrictionsDiv.innerHTML = `🔊 Formatos: .mp3<br>⚖️ Máximo: 3 MB`;\n\n          topContainer.appendChild(examineBtn);\n          topContainer.appendChild(restrictionsDiv);\n          container.appendChild(input);\n          container.appendChild(topContainer);\n\n          const previewDiv = document.createElement(\"div\");\n          previewDiv.style.cssText = `\n                display: none;\n                text-align: center;\n                padding: 1rem;\n                background: #f9f9f9;\n                border-radius: 8px;\n                border: 2px dashed ${stageColors[stage]};\n            `;\n\n          const audioPlayer = document.createElement(\"audio\");\n          audioPlayer.controls = true;\n          audioPlayer.style.cssText = `width: 100%; margin: 0.8rem 0;`;\n          previewDiv.appendChild(audioPlayer);\n          container.appendChild(previewDiv);\n\n          const uploadBtn = document.createElement(\"button\");\n          uploadBtn.textContent = \"Guardar\";\n          uploadBtn.style.cssText = `\n                background: linear-gradient(90deg, #43aa8b 60%, ${stageColors[stage]} 100%);\n                color: white;\n                border: none;\n                border-radius: 12px;\n                padding: 0.6rem 1.5rem;\n                cursor: pointer;\n                font-weight: 600;\n                font-size: 0.95rem;\n                transition: all 0.3s;\n            `;\n          container.appendChild(uploadBtn);\n\n          let selectedFile = null;\n\n          function showAudioPreview(audioUrl, fileName = null) {\n            // Keep audioPlayer element and append/update it instead of overwriting\n            previewDiv.innerHTML = \"\";\n            const header = document.createElement(\"strong\");\n            header.style.color = stageColors[stage];\n            header.textContent = \"🔊 Audio guardado\";\n            previewDiv.appendChild(header);\n            audioPlayer.src = normalizeUrl(audioUrl);\n            if (!previewDiv.contains(audioPlayer))\n              previewDiv.appendChild(audioPlayer);\n            previewDiv.style.display = \"block\";\n            if (fileName) {\n              examineBtn.textContent = \"✅ Seleccionado\";\n            }\n          }\n\n          if (config[stage] && config[stage][\"AudioUrl\"]) {\n            showAudioPreview(config[stage][\"AudioUrl\"]);\n            examineBtn.textContent = \"✅ Seleccionado\";\n          }\n\n          input.addEventListener(\"change\", () => {\n            const file = input.files[0];\n            selectedFile = file;\n            if (!file) return;\n            const validTypes = [\"audio/mp3\", \"audio/mpeg\"];\n            const validExt = /\\.(mp3)$/i;\n            if (!validTypes.includes(file.type) || !validExt.test(file.name)) {\n              showCustomNotification(\"Solo .mp3\", \"error\");\n              input.value = \"\";\n              selectedFile = null;\n              return;\n            }\n            if (file.size > 3 * 1024 * 1024) {\n              showCustomNotification(\"Máximo 3 MB\", \"error\");\n              input.value = \"\";\n              selectedFile = null;\n              return;\n            }\n            showAudioPreview(URL.createObjectURL(file), file.name);\n          });\n\n          uploadBtn.addEventListener(\"click\", async () => {\n            if (!selectedFile) {\n              showCustomNotification(\"Selecciona un audio primero\", \"error\");\n              return;\n            }\n            uploadBtn.disabled = true;\n            uploadBtn.textContent = \"Procesando...\";\n\n            try {\n              const form = new FormData();\n              form.append(\"file\", selectedFile);\n              form.append(\"type\", \"Audio\");\n\n              const resp = await fetch(\"./upload.php\", {\n                method: \"POST\",\n                body: form,\n              });\n              const json = await resp.json().catch(() => null);\n              if (resp.ok && json && json.success) {\n                if (!config[stage]) config[stage] = {};\n                // limpiar otros tipos y dejar solo Audio\n                clearStageContentExcept(config, stage, \"Audio\");\n                config[stage][\"AudioUrl\"] = json.path || `Audio/${json.filename}`;\n                config[stage][\"Audio\"] = true;\n                config[stage][\"AudioOriginalName\"] = selectedFile.name;\n                localStorage.setItem(\"laberintoARConfig\", JSON.stringify(config));\n\n                showAudioPreview(config[stage][\"AudioUrl\"]);\n                examineBtn.textContent = \"✅ Seleccionado\";\n                uploadBtn.textContent = \"✅ Guardado\";\n                setTimeout(() => {\n                  uploadBtn.textContent = \"Guardar\";\n                  uploadBtn.disabled = false;\n                  selectedFile = null;\n                  updateUI();\n                }, 1500);\n                return;\n              }\n              console.warn(\n                \"Upload audio falló, usando fallback local\",\n                json || resp.status,\n              );\n            } catch (err) {\n              console.warn(\n                \"Error subiendo audio al servidor, fallback a DataURL\",\n                err,\n              );\n            }\n\n            // Fallback: guardar como DataURL\n            const reader = new FileReader();\n            reader.onload = (e) => {\n              try {\n                const dataUrl = e.target.result;\n                if (!config[stage]) config[stage] = {};\n                // limpiar otros tipos y dejar solo Audio\n                clearStageContentExcept(config, stage, \"Audio\");\n                config[stage][\"AudioUrl\"] = dataUrl;\n                config[stage][\"Audio\"] = true;\n                config[stage][\"AudioOriginalName\"] = selectedFile.name;\n                localStorage.setItem(\"laberintoARConfig\", JSON.stringify(config));\n\n                uploadBtn.textContent = \"✅ Guardado\";\n                uploadBtn.disabled = true;\n                showAudioPreview(dataUrl);\n                examineBtn.textContent = \"✅ Seleccionado\";\n\n                setTimeout(() => {\n                  uploadBtn.textContent = \"Guardar\";\n                  uploadBtn.disabled = false;\n                  selectedFile = null;\n                  updateUI();\n                }, 1500);\n              } catch (err) {\n                console.error(\"Error procesando audio:\", err);\n                showCustomNotification(\"Error: \" + err.message, \"error\", 4000);\n                uploadBtn.disabled = false;\n                uploadBtn.textContent = \"Guardar\";\n              }\n            };\n            reader.onerror = () => {\n              showCustomNotification(\"Error al leer el archivo\", \"error\");\n              uploadBtn.disabled = false;\n              uploadBtn.textContent = \"Guardar\";\n            };\n            reader.readAsDataURL(selectedFile);\n          });\n        } else if (type === \"Video\") {\n          const input = document.createElement(\"input\");\n          input.type = \"file\";\n          input.accept = \".mp4,video/mp4\";\n          input.style.cssText = `display: none;`;\n\n          const topContainer = document.createElement(\"div\");\n          topContainer.style.cssText = `\n                display: flex;\n                gap: 1rem;\n                align-items: flex-start;\n            `;\n\n          const examineBtn = document.createElement(\"button\");\n          examineBtn.textContent = \"📁 Examinar\";\n          examineBtn.style.cssText = `\n                background: linear-gradient(135deg, ${stageColors[stage]} 0%, ${stageColors[stage]}dd 100%);\n                color: white;\n                border: none;\n                border-radius: 8px;\n                padding: 0.6rem 1rem;\n                cursor: pointer;\n                font-weight: 600;\n                font-size: 0.85rem;\n                transition: all 0.3s;\n                box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n                flex-shrink: 0;\n            `;\n          examineBtn.addEventListener(\"click\", () => input.click());\n\n          const restrictionsDiv = document.createElement(\"div\");\n          restrictionsDiv.style.cssText = `\n                background: #f0f0f0;\n                padding: 0.6rem 0.8rem;\n                border-radius: 8px;\n                font-size: 0.85rem;\n                color: #666;\n                text-align: left;\n                flex-grow: 1;\n                border-left: 3px solid ${stageColors[stage]};\n            `;\n          restrictionsDiv.innerHTML = `🎬 Formatos: .mp4<br>⚖️ Máximo: 10 MB`;\n\n          topContainer.appendChild(examineBtn);\n          topContainer.appendChild(restrictionsDiv);\n          container.appendChild(input);\n          container.appendChild(topContainer);\n\n          const previewDiv = document.createElement(\"div\");\n          previewDiv.style.cssText = `\n                display: none;\n                text-align: center;\n                padding: 1rem;\n                background: #f9f9f9;\n                border-radius: 8px;\n                border: 2px dashed ${stageColors[stage]};\n            `;\n\n          const videoPlayer = document.createElement(\"video\");\n          videoPlayer.controls = true;\n          videoPlayer.style.cssText = `width: 100%; max-height: 200px; margin: 0.8rem 0; background: #000;`;\n          previewDiv.appendChild(videoPlayer);\n          container.appendChild(previewDiv);\n\n          const uploadBtn = document.createElement(\"button\");\n          uploadBtn.textContent = \"Guardar\";\n          uploadBtn.style.cssText = `\n                background: linear-gradient(90deg, #43aa8b 60%, ${stageColors[stage]} 100%);\n                color: white;\n                border: none;\n                border-radius: 12px;\n                padding: 0.6rem 1.5rem;\n                cursor: pointer;\n                font-weight: 600;\n                font-size: 0.95rem;\n                transition: all 0.3s;\n            `;\n          container.appendChild(uploadBtn);\n\n          let selectedFile = null;\n\n          function showVideoPreview(videoUrl, fileName = null) {\n            // Keep videoPlayer element and append/update it instead of overwriting\n            previewDiv.innerHTML = \"\";\n            const header = document.createElement(\"strong\");\n            header.style.color = stageColors[stage];\n            header.textContent = \"🎬 Video guardado\";\n            previewDiv.appendChild(header);\n            videoPlayer.src = normalizeUrl(videoUrl);\n            if (!previewDiv.contains(videoPlayer))\n              previewDiv.appendChild(videoPlayer);\n            previewDiv.style.display = \"block\";\n            if (fileName) {\n              examineBtn.textContent = \"✅ Seleccionado\";\n            }\n          }\n\n          if (config[stage] && config[stage][\"VideoUrl\"]) {\n            showVideoPreview(config[stage][\"VideoUrl\"]);\n            examineBtn.textContent = \"✅ Seleccionado\";\n          }\n\n          input.addEventListener(\"change\", () => {\n            const file = input.files[0];\n            selectedFile = file;\n            if (!file) return;\n            const validTypes = [\"video/mp4\"];\n            const validExt = /\\.(mp4)$/i;\n            if (!validTypes.includes(file.type) || !validExt.test(file.name)) {\n              showCustomNotification(\"Solo .mp4\", \"error\");\n              input.value = \"\";\n              selectedFile = null;\n              return;\n            }\n            if (file.size > 10 * 1024 * 1024) {\n              showCustomNotification(\"Máximo 10 MB\", \"error\");\n              input.value = \"\";\n              selectedFile = null;\n              return;\n            }\n            showVideoPreview(URL.createObjectURL(file), file.name);\n          });\n\n          uploadBtn.addEventListener(\"click\", async () => {\n            if (!selectedFile) {\n              showCustomNotification(\"Selecciona un video primero\", \"error\");\n              return;\n            }\n            uploadBtn.disabled = true;\n            uploadBtn.textContent = \"Procesando...\";\n\n            try {\n              const form = new FormData();\n              form.append(\"file\", selectedFile);\n              // Para videos el servidor espera 'Videos' según convención usada en otros upload.php\n              form.append(\"type\", \"Videos\");\n\n              const resp = await fetch(\"./upload.php\", {\n                method: \"POST\",\n                body: form,\n              });\n              const json = await resp.json().catch(() => null);\n              if (resp.ok && json && json.success) {\n                if (!config[stage]) config[stage] = {};\n                // limpiar otros tipos y dejar solo Video\n                clearStageContentExcept(config, stage, \"Video\");\n                config[stage][\"VideoUrl\"] = json.path || `Videos/${json.filename}`;\n                config[stage][\"Video\"] = true;\n                config[stage][\"VideoOriginalName\"] = selectedFile.name;\n                localStorage.setItem(\"laberintoARConfig\", JSON.stringify(config));\n\n                showVideoPreview(config[stage][\"VideoUrl\"]);\n                examineBtn.textContent = \"✅ Seleccionado\";\n                uploadBtn.textContent = \"✅ Guardado\";\n                setTimeout(() => {\n                  uploadBtn.textContent = \"Guardar\";\n                  uploadBtn.disabled = false;\n                  selectedFile = null;\n                  updateUI();\n                }, 1500);\n                return;\n              }\n              console.warn(\n                \"Upload video falló, usando fallback local\",\n                json || resp.status,\n              );\n            } catch (err) {\n              console.warn(\n                \"Error subiendo video al servidor, fallback a DataURL\",\n                err,\n              );\n            }\n\n            // Fallback: guardar como DataURL\n            const reader = new FileReader();\n            reader.onload = (e) => {\n              try {\n                const dataUrl = e.target.result;\n                if (!config[stage]) config[stage] = {};\n                // limpiar otros tipos y dejar solo Video\n                clearStageContentExcept(config, stage, \"Video\");\n                config[stage][\"VideoUrl\"] = dataUrl;\n                config[stage][\"Video\"] = true;\n                config[stage][\"VideoOriginalName\"] = selectedFile.name;\n                localStorage.setItem(\"laberintoARConfig\", JSON.stringify(config));\n\n                uploadBtn.textContent = \"✅ Guardado\";\n                uploadBtn.disabled = true;\n                showVideoPreview(dataUrl);\n                examineBtn.textContent = \"✅ Seleccionado\";\n\n                setTimeout(() => {\n                  uploadBtn.textContent = \"Guardar\";\n                  uploadBtn.disabled = false;\n                  selectedFile = null;\n                  updateUI();\n                }, 1500);\n              } catch (err) {\n                console.error(\"Error procesando video:\", err);\n                showCustomNotification(\"Error: \" + err.message, \"error\", 4000);\n                uploadBtn.disabled = false;\n                uploadBtn.textContent = \"Guardar\";\n              }\n            };\n            reader.onerror = () => {\n              showCustomNotification(\"Error al leer el archivo\", \"error\");\n              uploadBtn.disabled = false;\n              uploadBtn.textContent = \"Guardar\";\n            };\n            reader.readAsDataURL(selectedFile);\n          });\n        }\n      }\n\n      const configPanel = document.createElement(\"div\");\n      configPanel.style.cssText = `\n        background: white;\n        border-radius: 16px;\n        padding: 2rem;\n        width: 480px;\n        max-width: 100%;\n        box-shadow: 0 4px 16px rgba(67, 97, 238, 0.2);\n        animation: fadeIn 0.4s;\n        position: relative;\n        min-height: 300px;\n        display: none;\n        padding-top: 4rem;\n    `;\n\n      // Variable para rastrear la etapa actualmente visible\n      let currentVisibleStage = null;\n\n      // Contenedor para botones-etiquetas de navegación (dentro del panel)\n      const stageLabelButtonsContainer = document.createElement(\"div\");\n      stageLabelButtonsContainer.style.cssText = `\n        display: flex;\n        gap: 0.6rem;\n        position: absolute;\n        top: 1.2rem;\n        left: 1.2rem;\n    `;\n\n      // Crear botones-etiquetas (I, A, F)\n      const labelButtons = {};\n      stages.forEach((stage) => {\n        const labelBtn = document.createElement(\"button\");\n        labelBtn.textContent = stageLetters[stage];\n        labelBtn.style.cssText = `\n            background: ${stageColors[stage]};\n            color: white;\n            border: none;\n            width: 40px;\n            height: 40px;\n            border-radius: 8px;\n            font-weight: 700;\n            font-size: 1rem;\n            cursor: pointer;\n            transition: all 0.3s;\n            box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n            display: none;\n        `;\n        labelBtn.addEventListener(\"click\", () => {\n          currentVisibleStage = stage;\n          localStorage.removeItem(`selectedType_${stage}`);\n          updateUI();\n        });\n        labelBtn.addEventListener(\"mouseenter\", () => {\n          labelBtn.style.transform = \"scale(1.1)\";\n          labelBtn.style.boxShadow = `0 4px 12px ${stageColors[stage]}60`;\n        });\n        labelBtn.addEventListener(\"mouseleave\", () => {\n          labelBtn.style.transform = \"scale(1)\";\n          labelBtn.style.boxShadow = \"0 2px 8px rgba(0,0,0,0.15)\";\n        });\n        stageLabelButtonsContainer.appendChild(labelBtn);\n        labelButtons[stage] = labelBtn;\n      });\n\n      configPanel.appendChild(stageLabelButtonsContainer);\n\n      function updateUI() {\n        // Actualizar visibilidad de botones-etiquetas\n        let hasSelectedStages = false;\n        stages.forEach((stage) => {\n          const shouldShow = selectedStages[stage];\n          labelButtons[stage].style.display = shouldShow ? \"block\" : \"none\";\n          if (shouldShow) hasSelectedStages = true;\n        });\n\n        // Verificar si hay al menos una etapa con contenido configurado\n        let hasAnyConfiguredStage = false;\n        stages.forEach((stage) => {\n          const hasContent =\n            config[stage] &&\n            ((config[stage][\"Texto\"] && config[stage][\"TextoValor\"]) ||\n              (config[stage][\"Imagen\"] && config[stage][\"ImagenUrl\"]) ||\n              (config[stage][\"Audio\"] && config[stage][\"AudioUrl\"]) ||\n              (config[stage][\"Video\"] && config[stage][\"VideoUrl\"]));\n          if (hasContent) hasAnyConfiguredStage = true;\n        });\n\n        // Mostrar/ocultar y activar/desactivar botón de guardar\n        saveButton.style.display = hasSelectedStages ? \"block\" : \"none\";\n        saveButton.disabled = !hasAnyConfiguredStage;\n        saveButton.style.opacity = hasAnyConfiguredStage ? \"1\" : \"0.5\";\n        saveButton.style.cursor = hasAnyConfiguredStage ? \"pointer\" : \"not-allowed\";\n\n        // Si no hay etapas seleccionadas, limpiar panel\n        if (!hasSelectedStages) {\n          configPanel.innerHTML =\n            '<p style=\"text-align: center; color: #999;\">Selecciona una etapa para comenzar</p>';\n          currentVisibleStage = null;\n          configPanelsContainer.innerHTML = \"\";\n          return;\n        }\n\n        // Si la etapa actual visible ya no está seleccionada, cambiar a la primera disponible\n        if (!selectedStages[currentVisibleStage]) {\n          currentVisibleStage = stages.find((s) => selectedStages[s]);\n        }\n\n        // Si aún no hay etapa visible, asignar la primera disponible\n        if (!currentVisibleStage) {\n          currentVisibleStage = stages.find((s) => selectedStages[s]);\n        }\n\n        // Actualizar panel con la etapa actual\n        configPanel.innerHTML = \"\";\n\n        // Recrear botones-etiquetas\n        stageLabelButtonsContainer.innerHTML = \"\";\n        stages.forEach((stage) => {\n          if (selectedStages[stage]) {\n            labelButtons[stage].style.display = \"block\";\n            stageLabelButtonsContainer.appendChild(labelButtons[stage]);\n          }\n        });\n\n        configPanel.appendChild(stageLabelButtonsContainer);\n\n        // Restaurar el tipo seleccionado guardado en localStorage, o usar Texto por defecto\n        const savedSelectedType =\n          localStorage.getItem(`selectedType_${currentVisibleStage}`) || \"Texto\";\n        configPanel.appendChild(\n          createConfigPanel(currentVisibleStage, savedSelectedType),\n        );\n\n        // Mostrar el panel\n        configPanel.style.display = \"block\";\n        configPanelsContainer.innerHTML = \"\";\n        configPanelsContainer.appendChild(configPanel);\n\n        // Actualizar estilos de botones-etiquetas\n        stages.forEach((stage) => {\n          if (stage === currentVisibleStage) {\n            labelButtons[stage].style.boxShadow =\n              `0 6px 16px ${stageColors[stage]}70`;\n          }\n        });\n      }\n\n      const saveButton = document.createElement(\"button\");\n      saveButton.textContent = \"💾 Guardar Configuración\";\n      saveButton.style.cssText = `\n        background: linear-gradient(90deg, var(--success) 60%, var(--primary) 100%);\n        color: white;\n        border: none;\n        padding: 0.9rem 2.5rem;\n        border-radius: 18px;\n        font-size: 1.1rem;\n        font-weight: 700;\n        cursor: not-allowed;\n        box-shadow: 0 8px 24px rgba(67, 97, 238, 0.25);\n        transition: transform 0.3s, background 0.3s, opacity 0.3s;\n        margin: 0.5rem auto 0 auto;\n        display: block;\n        align-self: center;\n        opacity: 0.5;\n    `;\n      saveButton.disabled = true;\n\n      updateUI();\n      saveButton.addEventListener(\"mouseenter\", () => {\n        if (!saveButton.disabled) {\n          saveButton.style.transform = \"scale(1.05)\";\n        }\n      });\n      saveButton.addEventListener(\"mouseleave\", () => {\n        saveButton.style.transform = \"scale(1)\";\n      });\n\n      saveButton.addEventListener(\"click\", () => {\n        let hasValidContent = false;\n\n        stages.forEach((stage) => {\n          if (selectedStages[stage] && config[stage]) {\n            const hasStageContent =\n              (config[stage][\"Texto\"] && config[stage][\"TextoValor\"]) ||\n              (config[stage][\"Imagen\"] && config[stage][\"ImagenUrl\"]) ||\n              (config[stage][\"Audio\"] && config[stage][\"AudioUrl\"]) ||\n              (config[stage][\"Video\"] && config[stage][\"VideoUrl\"]);\n            if (hasStageContent) {\n              hasValidContent = true;\n            }\n          }\n        });\n\n        if (!hasValidContent) {\n          showCustomNotification(\n            \"Debes seleccionar y configurar al menos una etapa\",\n            \"error\",\n            3000,\n          );\n          return;\n        }\n\n        localStorage.setItem(\"laberintoARConfig\", JSON.stringify(config));\n        localStorage.setItem(\n          \"selectedLaberintoStages\",\n          JSON.stringify(selectedStages),\n        );\n        saveButton.textContent = \"✅ Guardado exitosamente\";\n        saveButton.disabled = true;\n\n        setTimeout(() => {\n          saveButton.textContent = \"💾 Guardar Configuración\";\n          saveButton.disabled = false;\n          appContainer.innerHTML = \"\";\n          showConfigurationSummary(config, selectedStages);\n        }, 2000);\n      });\n\n      const backButton = document.createElement(\"button\");\n      backButton.textContent = \"← Volver\";\n      backButton.style.cssText = `\n        background: transparent;\n        color: var(--primary);\n        border: 2px solid var(--primary);\n        padding: 0.7rem 1.8rem;\n        border-radius: 18px;\n        font-size: 1rem;\n        font-weight: 600;\n        cursor: pointer;\n        transition: all 0.3s;\n        margin: 0;\n        align-self: center;\n    `;\n      backButton.addEventListener(\"mouseenter\", () => {\n        backButton.style.background = \"#005f92\";\n        backButton.style.color = \"white\";\n      });\n      backButton.addEventListener(\"mouseleave\", () => {\n        backButton.style.background = \"transparent\";\n        backButton.style.color = \"#005f92\";\n      });\n      backButton.addEventListener(\"click\", backToGenerator);\n\n      contentContainer.appendChild(configPanelsContainer);\n      contentContainer.appendChild(saveButton);\n      contentContainer.appendChild(backButton);\n      appContainer.appendChild(contentContainer);\n    }\n\n    function showConfigurationSummary(config, selectedStages) {\n      const appContainer = document.querySelector(\".app-container\");\n      appContainer.innerHTML = \"\";\n\n      const contentContainer = document.createElement(\"div\");\n      contentContainer.style.cssText = `\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        min-height: 60vh;\n        text-align: center;\n        gap: 1.5rem;\n        width: 100%;\n    `;\n\n      const title = document.createElement(\"h2\");\n      title.textContent = \"📋 Resumen de Configuración - Laberinto AR\";\n      title.style.cssText = `\n        color: var(--secondary);\n        font-size: 2rem;\n        margin: 0 auto;\n        text-shadow: 0 2px 8px #e0e7ff;\n        animation: bounceIn 0.8s ease-out;\n        text-align: center;\n        width: 100%;\n    `;\n\n      const subtitle = document.createElement(\"h3\");\n      subtitle.textContent = \"Aquí está todo lo que configuraste\";\n      subtitle.style.cssText = `\n        color: var(--primary);\n        font-size: 1.1rem;\n        margin: 0;\n        font-weight: 500;\n        animation: fadeIn 0.8s ease-out 0.2s both;\n        text-align: center;\n        width: 100%;\n    `;\n\n      const cardsContainer = document.createElement(\"div\");\n      cardsContainer.style.cssText = `\n        display: flex;\n        flex-direction: column;\n        gap: 1.2rem;\n        width: 100%;\n        max-width: 500px;\n    `;\n\n      const stageIcons = { Inicio: \"🚀\", Acierto: \"✅\", Final: \"🏁\" };\n      const stageColors = {\n        Inicio: \"#005f92\",\n        Acierto: \"#43aa8b\",\n        Final: \"#ffd60a\",\n      };\n      const stages = [\"Inicio\", \"Acierto\", \"Final\"];\n\n      function createStageCard(stageName, stageIcon) {\n        const card = document.createElement(\"div\");\n        card.style.cssText = `\n            background: white;\n            border-radius: 12px;\n            padding: 1.2rem;\n            box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n            text-align: left;\n            border-left: 4px solid ${stageColors[stageName]};\n        `;\n\n        const hasContent =\n          config[stageName] &&\n          ((config[stageName][\"Texto\"] && config[stageName][\"TextoValor\"]) ||\n            (config[stageName][\"Imagen\"] && config[stageName][\"ImagenUrl\"]) ||\n            (config[stageName][\"Audio\"] && config[stageName][\"AudioUrl\"]) ||\n            (config[stageName][\"Video\"] && config[stageName][\"VideoUrl\"]));\n\n        let contentHtml = `<h4 style=\"margin: 0 0 0.5rem 0; color: #005f92;\">${stageIcon} ${stageName}</h4>`;\n\n        if (!selectedStages[stageName]) {\n          contentHtml += '<p style=\"margin: 0; color: #999;\">No seleccionado</p>';\n        } else if (!hasContent) {\n          contentHtml += '<p style=\"margin: 0; color: #999;\">No configurado</p>';\n        } else {\n          if (config[stageName][\"Texto\"] && config[stageName][\"TextoValor\"]) {\n            contentHtml += `\n                    <div style=\"margin: 0.5rem 0; padding: 0.8rem; background: #f0f0f0; border-radius: 8px;\">\n                        <p style=\"margin: 0 0 0.3rem 0; color: #666; font-weight: 600;\">📝 Texto:</p>\n                        <p style=\"margin: 0; color: #333; font-style: italic;\">\"${config[stageName][\"TextoValor\"]}\"</p>\n                    </div>\n                `;\n          }\n          if (config[stageName][\"Imagen\"] && config[stageName][\"ImagenUrl\"]) {\n            const imageName =\n              config[stageName][\"ImagenOriginalName\"] || \"imagen.jpg\";\n            const imageSrc = normalizeUrl(config[stageName][\"ImagenUrl\"]);\n            contentHtml += `\n                    <div style=\"margin: 0.5rem 0; padding: 0.8rem; background: #f0f0f0; border-radius: 8px;\">\n                        <p style=\"margin: 0 0 0.3rem 0; color: #666; font-weight: 600;\">🖼️ Imagen:</p>\n                        <p style=\"margin: 0 0 0.5rem 0; color: #777; font-size: 0.85rem;\">${imageName}</p>\n                        <img src=\"${imageSrc}\" style=\"max-width: 150px; max-height: 100px; border-radius: 6px; border: 1px solid #ddd;\">\n                    </div>\n                `;\n          }\n          if (config[stageName][\"Audio\"] && config[stageName][\"AudioUrl\"]) {\n            const audioName = config[stageName][\"AudioOriginalName\"] || \"audio.mp3\";\n            const audioSrc = normalizeUrl(config[stageName][\"AudioUrl\"]);\n            contentHtml += `\n                    <div style=\"margin: 0.5rem 0; padding: 0.8rem; background: #f0f0f0; border-radius: 8px;\">\n                        <p style=\"margin: 0 0 0.3rem 0; color: #666; font-weight: 600;\">🔊 Audio:</p>\n                        <p style=\"margin: 0 0 0.5rem 0; color: #777; font-size: 0.85rem;\">${audioName}</p>\n                        <audio controls style=\"width: 100%; max-width: 200px;\" src=\"${audioSrc}\"></audio>\n                    </div>\n                `;\n          }\n          if (config[stageName][\"Video\"] && config[stageName][\"VideoUrl\"]) {\n            const videoName = config[stageName][\"VideoOriginalName\"] || \"video.mp4\";\n            const videoSrc = normalizeUrl(config[stageName][\"VideoUrl\"]);\n            contentHtml += `\n                    <div style=\"margin: 0.5rem 0; padding: 0.8rem; background: #f0f0f0; border-radius: 8px;\">\n                        <p style=\"margin: 0 0 0.3rem 0; color: #666; font-weight: 600;\">🎬 Video:</p>\n                        <p style=\"margin: 0 0 0.5rem 0; color: #777; font-size: 0.85rem;\">${videoName}</p>\n                        <video controls style=\"width: 100%; max-width: 250px; max-height: 150px; border-radius: 6px; background: #000;\" src=\"${videoSrc}\"></video>\n                    </div>\n                `;\n          }\n        }\n\n        card.innerHTML = contentHtml;\n        return card;\n      }\n\n      stages.forEach((stage) => {\n        cardsContainer.appendChild(createStageCard(stage, stageIcons[stage]));\n      });\n\n      const startGameBtn = document.createElement(\"button\");\n      startGameBtn.textContent = \"▶️ Comenzar Juego AR\";\n      startGameBtn.style.cssText = `\n        background: linear-gradient(90deg, #005f92 60%, #22c55e 100%);\n        color: white;\n        border: none;\n        padding: 1rem 2.5rem;\n        border-radius: 18px;\n        font-size: 1.2rem;\n        font-weight: 700;\n        cursor: pointer;\n        box-shadow: 0 8px 24px rgba(67, 97, 238, 0.3);\n        transition: transform 0.3s, background 0.3s;\n        margin-top: 1.5rem;\n        display: block;\n        align-self: center;\n    `;\n      startGameBtn.addEventListener(\"mouseenter\", () => {\n        startGameBtn.style.transform = \"translateY(-2px)\";\n      });\n      startGameBtn.addEventListener(\"mouseleave\", () => {\n        startGameBtn.style.transform = \"translateY(0)\";\n      });\n      startGameBtn.addEventListener(\"click\", startARGame);\n\n      const editButton = document.createElement(\"button\");\n      editButton.textContent = \"← Volver\";\n      editButton.style.cssText = `\n        background: transparent;\n        color: var(--primary);\n        border: 2px solid var(--primary);\n        padding: 0.8rem 2rem;\n        border-radius: 18px;\n        font-size: 1rem;\n        font-weight: 600;\n        cursor: pointer;\n        transition: all 0.3s;\n        margin-top: 0.5rem;\n        display: block;\n        align-self: center;\n    `;\n      editButton.addEventListener(\"mouseenter\", () => {\n        editButton.style.background = \"#005f92\";\n        editButton.style.color = \"white\";\n      });\n      editButton.addEventListener(\"mouseleave\", () => {\n        editButton.style.background = \"transparent\";\n        editButton.style.color = \"#005f92\";\n      });\n      editButton.addEventListener(\"click\", () => {\n        appContainer.innerHTML = \"\";\n        showARConfigurationScreen();\n      });\n\n      contentContainer.appendChild(title);\n      contentContainer.appendChild(subtitle);\n      contentContainer.appendChild(cardsContainer);\n      contentContainer.appendChild(startGameBtn);\n      contentContainer.appendChild(editButton);\n      appContainer.appendChild(contentContainer);\n    }\n\n    async function startARGame() {\n      const appContainer = document.querySelector(\".app-container\");\n      const gameScreen = document.getElementById(\"game-screen\");\n\n      appContainer.classList.add(\"hidden\");\n      gameScreen.classList.remove(\"hidden\");\n\n      ensureMazeGame();\n      if (mazeGameApi && gameData.selectedDifficulty) {\n        mazeGameApi.setLevel(gameData.selectedDifficulty);\n      }\n\n      await showLaberintoARStageModal(\"Inicio\");\n\n      showCustomNotification(\"🎮 Juego de Laberinto iniciado\", \"success\");\n    }\n\n    function backToGenerator() {\n      const appContainer = document.querySelector(\".app-container\");\n\n      isConfigurationOpen = false;\n      appContainer.classList.remove(\"hidden\");\n      appContainer.innerHTML = `\n        <div id=\"generator-screen\">\n            <h1>Laberinto de Codificación</h1>\n            <div class=\"level-section\">\n                <label for=\"level-select\"><strong>Selecciona nivel de dificultad:</strong></label>\n                <select id=\"level-select\">\n                    <option value=\"basico\">Básico</option>\n                    <option value=\"intermedio\">Intermedio</option>\n                    <option value=\"avanzado\">Avanzado</option>\n                </select>\n                <span id=\"available-exercises\"></span>\n            </div>\n            <div id=\"game-options\">\n                <button id=\"startGameBtn\">Siguiente</button>\n            </div>\n        </div>\n    `;\n\n      document.getElementById(\"startGameBtn\").addEventListener(\"click\", () => {\n        gameData.selectedDifficulty = document.getElementById(\"level-select\").value;\n        showARConfigurationScreen();\n      });\n\n      localStorage.removeItem(\"laberintoARConfig\");\n      localStorage.removeItem(\"selectedLaberintoStages\");\n      localStorage.removeItem(\"selectedType_Inicio\");\n      localStorage.removeItem(\"selectedType_Acierto\");\n      localStorage.removeItem(\"selectedType_Final\");\n    }\n\n    // Event Listeners\n    document.addEventListener(\"DOMContentLoaded\", () => {\n      gameData.selectedDifficulty = \"basico\";\n      const appContainer = document.querySelector(\".app-container\");\n      const gameScreen = document.getElementById(\"game-screen\");\n      if (appContainer) {\n        appContainer.innerHTML = \"\";\n        appContainer.classList.add(\"hidden\");\n      }\n      if (gameScreen) gameScreen.classList.add(\"hidden\");\n    });\n</script>\n</body>\n\n</html>\n";

/* eslint-enable no-template-curly-in-string */

const AR_CONTENT_CARDS = [
  {
    type: "Texto",
    title: "Texto",
    icon: "/images/areas/texto.json",
    field: "text",
    placeholder: "Escribe el mensaje de texto...",
  },
  {
    type: "Imagen",
    title: "Imagen",
    icon: "/images/areas/image.json",
    uploadIcon: "📁",
    selectedIcon: "✅",
    selectedLabel: "Imagen seleccionada",
    ...MEDIA_FIELDS.Imagen,
  },
  {
    type: "Audio",
    title: "Audio",
    icon: "/images/areas/audio.json",
    uploadIcon: "🎵",
    selectedIcon: "✅",
    selectedLabel: "Audio seleccionado",
    ...MEDIA_FIELDS.Audio,
  },
  {
    type: "Video",
    title: "Video",
    icon: "/images/areas/video.json",
    uploadIcon: "🎬",
    selectedIcon: "✅",
    selectedLabel: "Video seleccionado",
    ...MEDIA_FIELDS.Video,
  },
];

function createEmptyStageConfig() {
  return {
    text: "",
    imageUrl: "",
    imageName: "",
    audioUrl: "",
    audioName: "",
    videoUrl: "",
    videoName: "",
  };
}

function readStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || "") || fallback;
  } catch {
    return fallback;
  }
}

function normalizeStageConfig(stage) {
  const normalized = createEmptyStageConfig();
  if (!stage) return normalized;

  if (typeof stage.text === "string") normalized.text = stage.text;
  if (stage.imageUrl) normalized.imageUrl = stage.imageUrl;
  if (stage.imageName || stage.imageOriginalName) {
    normalized.imageName = stage.imageName || stage.imageOriginalName;
  }
  if (stage.audioUrl) normalized.audioUrl = stage.audioUrl;
  if (stage.audioName || stage.audioOriginalName) {
    normalized.audioName = stage.audioName || stage.audioOriginalName;
  }
  if (stage.videoUrl) normalized.videoUrl = stage.videoUrl;
  if (stage.videoName || stage.videoOriginalName) {
    normalized.videoName = stage.videoName || stage.videoOriginalName;
  }

  if (stage.type === "Texto") normalized.text = stage.value || stage.text || "";
  if (stage.type === "Imagen") {
    normalized.imageUrl = stage.url || stage.imageUrl || "";
    normalized.imageName = stage.originalName || stage.imageName || "";
  }
  if (stage.type === "Audio") {
    normalized.audioUrl = stage.url || stage.audioUrl || "";
    normalized.audioName = stage.originalName || stage.audioName || "";
  }
  if (stage.type === "Video") {
    normalized.videoUrl = stage.url || stage.videoUrl || "";
    normalized.videoName = stage.originalName || stage.videoName || "";
  }

  if (stage.Texto && stage.TextoValor) normalized.text = stage.TextoValor;
  if (stage.Imagen && stage.ImagenUrl) {
    normalized.imageUrl = stage.ImagenUrl;
    normalized.imageName = stage.ImagenOriginalName || "";
  }
  if (stage.Audio && stage.AudioUrl) {
    normalized.audioUrl = stage.AudioUrl;
    normalized.audioName = stage.AudioOriginalName || "";
  }
  if (stage.Video && stage.VideoUrl) {
    normalized.videoUrl = stage.VideoUrl;
    normalized.videoName = stage.VideoOriginalName || "";
  }

  return normalized;
}

function normalizeStoredConfig(value) {
  const normalized = {};

  STAGES.forEach((stageName) => {
    const stage = value?.[stageName];
    if (!stage) return;
    normalized[stageName] = normalizeStageConfig(stage);
  });

  return normalized;
}

function normalizeUrl(url) {
  if (!url || typeof window === "undefined") return url;
  if (/^(data:|blob:|https?:|\/|file:)/.test(url)) return url;
  return new URL(url, `${window.location.href.replace(/[^/]*$/, "")}`).href;
}

function hasStageContent(stage) {
  const normalized = normalizeStageConfig(stage);
  return Boolean(
    normalized.text.trim() ||
    normalized.imageUrl ||
    normalized.audioUrl ||
    normalized.videoUrl,
  );
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadExternalScript(src) {
  if (typeof document === "undefined") return Promise.resolve();

  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener(
        "load",
        () => {
          existing.dataset.loaded = "true";
          resolve();
        },
        { once: true },
      );
      existing.addEventListener("error", reject, { once: true });
      window.setTimeout(resolve, 800);
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

let swalLoadPromise = null;

function ensureSwal() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Swal) return Promise.resolve(window.Swal);

  if (!swalLoadPromise) {
    swalLoadPromise = loadExternalScript(
      "https://cdn.jsdelivr.net/npm/sweetalert2@11",
    )
      .then(() => window.Swal || null)
      .catch(() => null);
  }

  return swalLoadPromise;
}

function useThreeLoaders() {
  const threeLoadRef = useRef(null);
  const threeTextAddonsLoadRef = useRef(null);

  const ensureThree = useCallback(() => {
    if (typeof window === "undefined") return Promise.resolve(null);
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threeLoadRef.current) return threeLoadRef.current;

    threeLoadRef.current = loadExternalScript(
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js",
    )
      .then(() => {
        if (window.THREE) return window.THREE;
        return loadExternalScript(
          "https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js",
        ).then(() => window.THREE || null);
      })
      .catch(() =>
        loadExternalScript(
          "https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js",
        ).then(() => window.THREE || null),
      );

    return threeLoadRef.current;
  }, []);

  const ensureThreeTextAddons = useCallback(() => {
    if (typeof window === "undefined") {
      return Promise.resolve({
        THREE: null,
        FontLoader: null,
        TextGeometry: null,
      });
    }
    if (threeTextAddonsLoadRef.current) return threeTextAddonsLoadRef.current;

    threeTextAddonsLoadRef.current = ensureThree()
      .then((THREE) => {
        if (!THREE) {
          return { THREE: null, FontLoader: null, TextGeometry: null };
        }

        return loadExternalScript(
          "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/FontLoader.js",
        )
          .then(() =>
            loadExternalScript(
              "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/geometries/TextGeometry.js",
            ),
          )
          .then(() => ({
            THREE,
            FontLoader: window.THREE?.FontLoader || null,
            TextGeometry: window.THREE?.TextGeometry || null,
          }));
      })
      .catch(() => ({
        THREE: window.THREE || null,
        FontLoader: null,
        TextGeometry: null,
      }));

    return threeTextAddonsLoadRef.current;
  }, [ensureThree]);

  return { ensureThree, ensureThreeTextAddons };
}

const LABERINTO_AR_SYMBOLS = ["A", "B", "I", "D", "↑", "↓", "←", "→"];

function createFloatingSymbols(container) {
  if (!container) return () => {};

  const uid = `lab_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const nodes = [];
  const styles = [];

  LABERINTO_AR_SYMBOLS.forEach((symbol, index) => {
    const element = document.createElement("div");
    element.textContent = symbol;

    const size = Math.random() * 26 + 18;
    const duration = Math.random() * 5 + 5;
    const left = Math.random() * 80 + 10;
    const top = Math.random() * 80 + 10;
    const dx = Math.random() * 30 - 15;
    const dy = Math.random() * 30 - 15;
    const rotation = Math.random() * 30 - 15;
    const animationName = `labFloat_${uid}_${index}`;

    element.style.cssText = `
      position: absolute;
      color: rgba(255,255,255,0.22);
      font-size: ${size}px;
      font-weight: 800;
      animation: ${animationName} ${duration}s ease-in-out infinite;
      left: ${left}%;
      top: ${top}%;
      user-select: none;
      pointer-events: none;
    `;

    const keyframes = document.createElement("style");
    keyframes.textContent = `
      @keyframes ${animationName} {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(${dx}px, ${dy}px) rotate(${rotation}deg); }
      }
    `;

    document.head.appendChild(keyframes);
    container.appendChild(element);
    styles.push(keyframes);
    nodes.push(element);
  });

  return () => {
    nodes.forEach((node) => node.remove());
    styles.forEach((style) => style.remove());
  };
}

async function startCamera(videoElementId) {
  try {
    if (!navigator.mediaDevices?.getUserMedia) return null;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    const videoElement = document.getElementById(videoElementId);
    if (videoElement) {
      videoElement.srcObject = stream;
      await videoElement.play();
    }
    return stream;
  } catch {
    return null;
  }
}

function stopCamera(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

function buildDecoratedHtml({
  bgId,
  topHtml = "",
  innerHtml = "",
  useCamera = false,
  videoId = "",
}) {
  return `
    <div class="enc-ar-bg ${useCamera ? "enc-ar-bg-camera" : ""}">
      ${
        useCamera
          ? `<video id="${videoId}" class="enc-ar-camera-bg" autoplay playsinline muted></video>`
          : ""
      }
      <div id="${bgId}" class="enc-ar-bg-elements"></div>
      <div class="enc-ar-content">${topHtml}${innerHtml}</div>
    </div>
  `;
}

function getStageFlags(stage) {
  const normalized = normalizeStageConfig(stage);
  return {
    ...normalized,
    hasText: Boolean(normalized.text.trim()),
    hasImage: Boolean(normalized.imageUrl),
    hasAudio: Boolean(normalized.audioUrl),
    hasVideo: Boolean(normalized.videoUrl),
  };
}

function buildMultiContentHtml(stage, ids) {
  const config = getStageFlags(stage);
  const visualCount = [config.hasText, config.hasImage, config.hasVideo].filter(
    Boolean,
  ).length;
  const isAudioOnly = config.hasAudio && visualCount === 0;

  const textHtml = config.hasText
    ? `<div class="ar-multi-text-3d"><div id="${ids.textContainerId}" class="ar-three-container"></div></div>`
    : "";
  const imageHtml = config.hasImage
    ? `<div class="ar-multi-image"><div id="${ids.imageContainerId}" class="ar-three-container"></div></div>`
    : "";
  const videoHtml = config.hasVideo
    ? `<div class="ar-multi-video"><div id="${ids.videoContainerId}" class="ar-three-container"></div></div>`
    : "";
  const audioUrl = escapeHtml(normalizeUrl(config.audioUrl) || "");
  const audioHtml = config.hasAudio
    ? isAudioOnly
      ? `<div class="ar-audio-solo"><div class="ar-audio-icon">♪</div><audio id="${ids.audioId}" controls src="${audioUrl}" class="ar-audio-player"></audio></div>`
      : `<div class="ar-audio-hidden"><audio id="${ids.audioId}" autoplay src="${audioUrl}" class="ar-audio-player-bg"></audio></div>`
    : "";

  if (visualCount === 0) {
    return `<div class="ar-layout-single">${audioHtml}</div>`;
  }

  if (visualCount === 1) {
    return `<div class="ar-layout-single">${textHtml}${imageHtml}${videoHtml}</div>${audioHtml}`;
  }

  if (visualCount === 2 && config.hasText) {
    return `
      <div class="ar-layout-text-top">
        <div class="ar-row-text">${textHtml}</div>
        <div class="ar-row-media">${imageHtml}${videoHtml}</div>
      </div>
      ${audioHtml}
    `;
  }

  if (visualCount === 2) {
    return `<div class="ar-layout-row">${imageHtml}${videoHtml}</div>${audioHtml}`;
  }

  return `
    <div class="ar-layout-three">
      <div class="ar-row-text">${textHtml}</div>
      <div class="ar-row-media-pair">${imageHtml}${videoHtml}</div>
    </div>
    ${audioHtml}
  `;
}

function initThreeStageFactory({ ensureThree, ensureThreeTextAddons }) {
  return function initThreeStage(container, stageConfig) {
    if (!container) return () => {};

    let disposed = false;
    let renderer;
    let scene;
    let camera;
    let animationId = 0;
    let resizeObserver;
    let mediaElement;
    let clickHandler;
    let textMesh;

    const cleanup = () => {
      disposed = true;
      if (animationId) cancelAnimationFrame(animationId);
      if (resizeObserver) resizeObserver.disconnect();
      if (clickHandler) container.removeEventListener("click", clickHandler);

      try {
        if (mediaElement) {
          mediaElement.pause?.();
          mediaElement.src = "";
          mediaElement.load?.();
        }
      } catch {}

      try {
        scene?.traverse?.((object) => {
          object.geometry?.dispose?.();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose?.());
          } else {
            object.material?.dispose?.();
          }
        });
        renderer?.dispose?.();
        renderer?.domElement?.remove();
      } catch {}
    };

    (async () => {
      const THREE = await ensureThree();
      if (!THREE || disposed) return;

      const width = Math.max(260, container.clientWidth || 300);
      const height = Math.max(220, container.clientHeight || 220);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
      camera.position.set(0, 0, 6);

      scene.add(new THREE.AmbientLight(0xffffff, 1.2));
      const light = new THREE.DirectionalLight(0xffffff, 1.5);
      light.position.set(2, 3, 4);
      scene.add(light);

      const root = new THREE.Group();
      scene.add(root);

      const fitPlane = (mesh, aspect, baseSize = 4.7) => {
        if (!mesh || !aspect) return;
        if (aspect >= 1) mesh.scale.set(baseSize, baseSize / aspect, 1);
        else mesh.scale.set(baseSize * aspect, baseSize, 1);
      };

      const addCanvasTextPlane = (text) => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 128;
        const context = canvas.getContext("2d");
        context.fillStyle = "transparent";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#ffffff";
        context.font = "bold 74px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, 256, 64);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(6, 1.5),
          new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
        );
        root.add(plane);
      };

      if (stageConfig.type === "Texto") {
        const text =
          (stageConfig.text || "").trim().slice(0, 20) || "Laberinto";
        const { FontLoader, TextGeometry } =
          (await ensureThreeTextAddons?.()) || {};

        if (FontLoader && TextGeometry) {
          try {
            const loader = new FontLoader();
            const font = await new Promise((resolve, reject) => {
              loader.load(
                "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
                resolve,
                undefined,
                reject,
              );
            });

            if (disposed) return;

            const geometry = new TextGeometry(text, {
              font,
              size: 0.7,
              height: 0.18,
              curveSegments: 10,
              bevelEnabled: true,
              bevelThickness: 0.03,
              bevelSize: 0.02,
              bevelSegments: 4,
            });
            geometry.computeBoundingBox();
            geometry.center();

            const material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              roughness: 0.1,
              metalness: 0.05,
              emissive: 0xffffff,
              emissiveIntensity: 0.25,
            });
            const mesh = new THREE.Mesh(geometry, material);
            textMesh = mesh;
            root.add(mesh);
          } catch {
            addCanvasTextPlane(text);
          }
        } else {
          addCanvasTextPlane(text);
        }
      }

      if (stageConfig.type === "Imagen") {
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }),
        );
        root.add(plane);

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        loader.load(
          normalizeUrl(stageConfig.imageUrl) || "",
          (texture) => {
            if (disposed) return;
            texture.colorSpace = THREE.SRGBColorSpace;
            plane.material.map = texture;
            plane.material.needsUpdate = true;
            fitPlane(plane, texture.image.width / texture.image.height);
          },
          undefined,
          () => {
            if (!disposed)
              container.textContent = "No se pudo cargar la imagen.";
          },
        );
      }

      if (stageConfig.type === "Video") {
        mediaElement = document.createElement("video");
        mediaElement.src = normalizeUrl(stageConfig.videoUrl) || "";
        mediaElement.crossOrigin = "anonymous";
        mediaElement.loop = true;
        mediaElement.muted = true;
        mediaElement.playsInline = true;
        mediaElement.preload = "auto";

        const texture = new THREE.VideoTexture(mediaElement);
        texture.colorSpace = THREE.SRGBColorSpace;
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(4.9, 2.76),
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.96,
          }),
        );
        root.add(plane);

        mediaElement.addEventListener("loadedmetadata", () => {
          fitPlane(
            plane,
            mediaElement.videoWidth / mediaElement.videoHeight,
            5,
          );
        });
        mediaElement.play().catch(() => {});

        clickHandler = () => {
          if (mediaElement.paused) {
            mediaElement.muted = false;
            mediaElement.play().catch(() => {});
          } else {
            mediaElement.pause();
          }
        };
        container.addEventListener("click", clickHandler);
      }

      const animate = () => {
        if (disposed) return;
        if (textMesh) {
          textMesh.rotation.y += 0.01;
        }
        root.rotation.y = Math.sin(performance.now() * 0.001) * 0.16;
        root.position.y = Math.sin(performance.now() * 0.0012) * 0.08;
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };
      animate();

      resizeObserver = new ResizeObserver(() => {
        if (!renderer || !camera || disposed) return;
        const nextWidth = Math.max(260, container.clientWidth || 300);
        const nextHeight = Math.max(220, container.clientHeight || 220);
        renderer.setSize(nextWidth, nextHeight);
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
      });
      resizeObserver.observe(container);
    })().catch(() => {
      if (!disposed) {
        container.innerHTML =
          '<div class="ar-fallback-message">No se pudo preparar la vista RA.</div>';
      }
    });

    return cleanup;
  };
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = Math.imul(value ^ (value >>> 15), value | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function generateMaze(rows, cols, random) {
  const rowCount = rows % 2 === 0 ? rows + 1 : rows;
  const colCount = cols % 2 === 0 ? cols + 1 : cols;
  const grid = Array.from({ length: rowCount }, () => Array(colCount).fill(1));
  const stack = [[1, 1]];
  const directions = [
    [0, 2],
    [0, -2],
    [2, 0],
    [-2, 0],
  ];

  grid[1][1] = 0;

  while (stack.length) {
    const [row, col] = stack[stack.length - 1];
    let moved = false;

    for (const [rowDelta, colDelta] of shuffle(directions, random)) {
      const nextRow = row + rowDelta;
      const nextCol = col + colDelta;
      const isInside =
        nextRow > 0 && nextRow < rowCount && nextCol > 0 && nextCol < colCount;

      if (isInside && grid[nextRow][nextCol] === 1) {
        grid[row + rowDelta / 2][col + colDelta / 2] = 0;
        grid[nextRow][nextCol] = 0;
        stack.push([nextRow, nextCol]);
        moved = true;
        break;
      }
    }

    if (!moved) stack.pop();
  }

  return grid;
}

function buildExercises(level) {
  const config = LEVEL_CONFIG[level];
  return shuffle(EXERCISE_BANK[level])
    .slice(0, config.showCount)
    .map((definition) => {
      const random = mulberry32(definition.seed);
      const maze = generateMaze(config.rows, config.cols, random);
      const start = { r: 1, c: 1 };
      const end = { r: maze.length - 2, c: maze[0].length - 2 };

      return {
        ...definition,
        maze,
        start,
        end,
        rows: maze.length,
        cols: maze[0].length,
      };
    });
}

function drawMaze(
  canvas,
  exercise,
  preferredCellSize,
  trail,
  player,
  containerSize,
) {
  if (!canvas || !exercise) return;

  const context = canvas.getContext("2d");
  const { maze, rows, cols, start, end } = exercise;
  const availableWidth = (containerSize?.width || 0) - 4;
  const availableHeight = (containerSize?.height || 0) - 4;
  const fittedCellSize = Math.floor(
    Math.min(availableWidth / cols, availableHeight / rows),
  );
  const cellSize =
    Number.isFinite(fittedCellSize) && fittedCellSize > 0
      ? fittedCellSize
      : preferredCellSize;

  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  context.imageSmoothingEnabled = false;
  context.fillStyle = "#f7fafc";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(148, 163, 184, 0.34)";
  context.lineWidth = 0.6;
  for (let row = 0; row <= rows; row += 1) {
    context.beginPath();
    context.moveTo(0, row * cellSize);
    context.lineTo(cols * cellSize, row * cellSize);
    context.stroke();
  }
  for (let col = 0; col <= cols; col += 1) {
    context.beginPath();
    context.moveTo(col * cellSize, 0);
    context.lineTo(col * cellSize, rows * cellSize);
    context.stroke();
  }

  maze.forEach((cells, row) => {
    cells.forEach((cell, col) => {
      if (cell !== 1) return;
      context.fillStyle = "#4a5568";
      context.fillRect(
        col * cellSize + 1,
        row * cellSize + 1,
        cellSize - 2,
        cellSize - 2,
      );
      context.fillStyle = "rgba(255, 255, 255, 0.14)";
      context.fillRect(col * cellSize + 1, row * cellSize + 1, cellSize - 2, 1);
      context.fillRect(col * cellSize + 1, row * cellSize + 1, 1, cellSize - 2);
    });
  });

  trail.forEach(({ r, c }) => {
    context.fillStyle = "rgba(49, 130, 206, 0.22)";
    context.fillRect(
      c * cellSize + 3,
      r * cellSize + 3,
      cellSize - 6,
      cellSize - 6,
    );
  });

  const drawLabel = (position, background, label) => {
    context.fillStyle = background;
    context.fillRect(
      position.c * cellSize + 3,
      position.r * cellSize + 3,
      cellSize - 6,
      cellSize - 6,
    );
    context.fillStyle = "#fff";
    context.font = `bold ${Math.floor(cellSize * 0.55)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      label,
      position.c * cellSize + cellSize / 2,
      position.r * cellSize + cellSize / 2,
    );
  };

  drawLabel(start, "#3182ce", "I");
  drawLabel(end, "#2b6cb0", "🚩");

  const current = player || start;
  const centerX = current.c * cellSize + cellSize / 2;
  const centerY = current.r * cellSize + cellSize / 2;
  context.font = `${Math.floor(cellSize * 0.65)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(LOGIC_PATH_AVATAR, centerX, centerY);
}

function ChoiceModal({ onChoose }) {
  return (
    <div className="modal-overlay laberinto-choice-overlay">
      <div className="modal-content">
        <h2>¿Quieres usar Realidad Aumentada?</h2>
        <p>
          Puedes configurar contenido para el inicio, los aciertos y el final.
        </p>
        <div className="modal-buttons">
          <button
            type="button"
            className="btn-modal-primary"
            onClick={() => onChoose(true)}
          >
            Sí, usar RA
          </button>
          <button
            type="button"
            className="btn-modal-secondary"
            onClick={() => onChoose(false)}
          >
            No, continuar sin RA
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultModal({
  result,
  attemptsLeft,
  score,
  currentExercise,
  totalExercises,
  level,
  onAction,
}) {
  const isLast = currentExercise >= totalExercises - 1;
  let iconSVG = null;
  let title = "";
  let message = "";
  let actions = [];

  if (result === "failed") {
    iconSVG = (
      <div class="modal-icon">
        <svg viewBox="0 0 52 52">
          <circle
            cx="26"
            cy="26"
            r="25"
            fill="none"
            stroke="#64748b"
            stroke-width="2"
          />
          <path
            fill="none"
            stroke="#64748b"
            stroke-width="3"
            stroke-linecap="round"
            d="M18 18l16 16M34 18l-16 16"
          />
        </svg>
      </div>
    );
    title = "Solución incorrecta";
    message =
      attemptsLeft > 0
        ? `Intentos restantes: ${attemptsLeft}`
        : `Sin intentos restantes. Puntaje: ${score}`;
    actions =
      attemptsLeft > 0
        ? [
            ["close", "Cerrar", "btn-modal-secondary"],
            ["retry", "Reintentar", "btn-modal-primary"],
          ]
        : isLast
          ? [["close", "Finalizar", "btn-modal-primary"]]
          : [["next", "Siguiente ejercicio", "btn-modal-primary"]];
  } else if (result === "next") {
    iconSVG = (
      <div class="modal-icon">
        <svg viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="30" fill="#3182ce" />
          <path
            d="M20 34l8 8 16-16"
            fill="none"
            stroke="#fff"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    );
    title = "Solución correcta";
    message = `Puntaje acumulado: ${score}`;
    actions = [["next", "Siguiente ejercicio", "btn-modal-primary"]];
  } else if (result === "complete") {
    iconSVG = (
      <div class="modal-icon">
        <svg viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="30" fill="#2b6cb0" />
          <path
            d="M20 34l8 8 16-16"
            fill="none"
            stroke="#fff"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    );
    title = "Juego completado";
    message = `Completaste el nivel ${LEVEL_CONFIG[level].label} con ${score} puntos.`;
    actions = [
      ["restart", "Jugar de nuevo", "btn-modal-primary"],
      ["close", "Cerrar", "btn-modal-secondary"],
    ];
  } else {
    iconSVG = (
      <div class="modal-icon">
        <svg viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="30" fill="#718096" />
          <text
            x="32"
            y="40"
            text-anchor="middle"
            fill="#fff"
            font-size="26"
            font-weight="bold"
          >
            🏁
          </text>
        </svg>
      </div>
    );
    title = "Juego finalizado";
    message = `Puntaje: ${score}. Ejercicio ${currentExercise + 1} de ${totalExercises}.`;
    actions = [
      ["restart", "Jugar de nuevo", "btn-modal-primary"],
      ["close", "Cerrar", "btn-modal-secondary"],
    ];
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {iconSVG}
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          {actions.map(([action, label, className]) => (
            <button
              type="button"
              className={className}
              key={action}
              onClick={() => onAction(action)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SummaryPanel({
  config,
  arEnabled,
  arSelectedStages,
  arConfig,
  onBack,
  state,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Iniciando...");
  const [jsZipReady, setJsZipReady] = useState(false);
  const selectedPlatforms = normalizeDownloadPlatforms(
    state?.selectedPlatforms,
  );
  const hasWebPlatform = selectedPlatforms.includes("web");
  const hasAndroidPlatform = selectedPlatforms.includes("android");
  const hasIOSPlatform = selectedPlatforms.includes("ios");
  const downloadPlatformNotice = buildDownloadPlatformNotice(
    selectedPlatforms,
  );

  useEffect(() => {
    if (window.JSZip) {
      setJsZipReady(true);
      return undefined;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.async = true;
    script.onload = () => setJsZipReady(true);
    script.onerror = () => setStatusText("Error cargando librería ZIP");
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const blobUrlToDataUrl = async (url) => {
    if (!url || !url.startsWith("blob:")) return url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
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
    if (!cfg || typeof cfg !== "object") return {};
    const stageMap = {
      Inicio: "inicio",
      Acierto: "acierto",
      Final: "fin",
      start: "inicio",
      success: "acierto",
      end: "fin",
    };
    const result = {};

    for (const stage of Object.keys(cfg)) {
      const mappedStage = stageMap[stage] || stage;
      const stageCfg = normalizeStageConfig(cfg[stage]);
      result[mappedStage] = {
        activo: !!arSelectedStages?.[stage],
        contenido: {
          texto: stageCfg.text || "",
          imagen: await blobUrlToDataUrl(stageCfg.imageUrl),
          audio: await blobUrlToDataUrl(stageCfg.audioUrl),
          video: await blobUrlToDataUrl(stageCfg.videoUrl),
        },
      };
    }

    return result;
  };

  const resolveLegacyARConfig = async (cfg) => {
    const result = {};

    for (const stageName of STAGES) {
      const stageCfg = normalizeStageConfig(cfg?.[stageName]);
      result[stageName] = {
        Texto: !!stageCfg.text,
        TextoValor: stageCfg.text || "",
        Imagen: !!stageCfg.imageUrl,
        ImagenUrl: await blobUrlToDataUrl(stageCfg.imageUrl),
        ImagenOriginalName: stageCfg.imageName || "",
        Audio: !!stageCfg.audioUrl,
        AudioUrl: await blobUrlToDataUrl(stageCfg.audioUrl),
        AudioOriginalName: stageCfg.audioName || "",
        Video: !!stageCfg.videoUrl,
        VideoUrl: await blobUrlToDataUrl(stageCfg.videoUrl),
        VideoOriginalName: stageCfg.videoName || "",
      };
    }

    return result;
  };

  const escapeGeneratedHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const buildInfoItem = (label, value, extraStyle = "", valueId = "") => `
        <div class="info-item"${extraStyle ? ` style="${extraStyle}"` : ""}>
          <span class="info-label">${escapeGeneratedHtml(label)}</span>
          <span class="info-value"${valueId ? ` id="${valueId}"` : ""}>${escapeGeneratedHtml(value)}</span>
        </div>`;

  const getGeneratedLevelLabel = (level) =>
    LEVEL_CONFIG[level]?.label || level || "Basico";

  const getGeneratedPlatformsLabel = (platforms = []) => {
    if (!Array.isArray(platforms) || platforms.length === 0) return "Web";
    return platforms
      .map((platform) => {
        const value = String(platform || "").trim();
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
      })
      .filter(Boolean)
      .join(", ");
  };

  const buildInfoModalGrid = (fullConfig) => {
    const levelLabel = getGeneratedLevelLabel(fullConfig.nivel);
    const platformsLabel = getGeneratedPlatformsLabel(fullConfig.plataformas);

    return `<div class="info-details-grid">
${buildInfoItem("Autor", fullConfig.autor || "No especificado", "", "info-author-value")}
${buildInfoItem("Version", fullConfig.version || "1.0.0", "", "info-version-value")}
${buildInfoItem("Fecha", formatDate(fullConfig.fecha), "", "info-date-value")}
${buildInfoItem("Nivel", levelLabel, "", "info-level-label")}
${buildInfoItem(
  "Descripcion",
  fullConfig.descripcion || "Sin descripcion.",
  "grid-column: 1 / -1;",
  "info-description-value",
)}
${buildInfoItem("Plataformas", platformsLabel, "grid-column: 1 / -1;", "info-platforms-value")}
      </div>`;
  };

  const buildGeneratedARCameraScript = () => `
    // ===== VISOR RA — MISMO PATRON DE ENCRIPTACION / BLOQCODE =====
    function readGeneratedARValue(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '{}');
        } catch (error) {
            console.warn('No se pudo leer la configuracion RA.', error);
            return {};
        }
    }

    function generatedARStageHasContent(stage) {
        return Boolean(
            (stage && stage.Texto && stage.TextoValor) ||
            (stage && stage.Imagen && stage.ImagenUrl) ||
            (stage && stage.Audio && stage.AudioUrl) ||
            (stage && stage.Video && stage.VideoUrl)
        );
    }

    function generatedNormalizeUrl(url) {
        if (!url) return '';
        if (/^(data:|blob:|https?:|file:)/i.test(url) || String(url).startsWith('/')) return url;
        try {
            return new URL(url, window.location.href.replace(/[^/]*$/, '')).href;
        } catch (error) {
            return url;
        }
    }

    const LOGICPATH_AR_SYMBOLS = ['A', 'B', 'I', 'D', '↑', '↓', '←', '→'];

    function createGeneratedFloatingSymbols(container) {
        if (!container) return function () {};
        const created = [];
        const uid = 'logicpathFloat_' + Date.now() + '_' + Math.random().toString(16).slice(2);

        LOGICPATH_AR_SYMBOLS.forEach(function (symbol, index) {
            const el = document.createElement('div');
            el.textContent = symbol;
            const size = Math.random() * 26 + 18;
            const duration = Math.random() * 5 + 5;
            const left = Math.random() * 80 + 10;
            const top = Math.random() * 80 + 10;
            const dx = Math.random() * 30 - 15;
            const dy = Math.random() * 30 - 15;
            const rotation = Math.random() * 30 - 15;
            const animationName = uid + '_' + index;

            const style = document.createElement('style');
            style.textContent =
                '@keyframes ' + animationName + '{' +
                '0%,100%{transform:translate(0,0) rotate(0deg)}' +
                '50%{transform:translate(' + dx + 'px,' + dy + 'px) rotate(' + rotation + 'deg)}' +
                '}';
            document.head.appendChild(style);

            Object.assign(el.style, {
                position: 'absolute',
                color: 'rgba(255,255,255,.22)',
                fontSize: size + 'px',
                fontWeight: '800',
                animation: animationName + ' ' + duration + 's ease-in-out infinite',
                left: left + '%',
                top: top + '%',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: '1'
            });

            container.appendChild(el);
            created.push({ el: el, style: style });
        });

        return function () {
            created.forEach(function (item) {
                item.el.remove();
                item.style.remove();
            });
        };
    }

    function generatedLoadScript(src) {
        return new Promise(function (resolve, reject) {
            const existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                if (window.THREE || existing.dataset.loaded === 'true') {
                    resolve();
                    return;
                }
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
                window.setTimeout(resolve, 800);
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = function () {
                script.dataset.loaded = 'true';
                resolve();
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    let generatedThreePromise = null;
    function generatedLoadThree() {
        if (window.THREE) return Promise.resolve(window.THREE);
        if (generatedThreePromise) return generatedThreePromise;

        generatedThreePromise = generatedLoadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
            .then(function () {
                if (window.THREE) return window.THREE;
                return generatedLoadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
                    .then(function () { return window.THREE; });
            })
            .catch(function () {
                return generatedLoadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
                    .then(function () { return window.THREE; });
            });

        return generatedThreePromise;
    }

    let generatedThreeAddonsPromise = null;
    function generatedLoadThreeAddons() {
        if (generatedThreeAddonsPromise) return generatedThreeAddonsPromise;

        generatedThreeAddonsPromise = generatedLoadThree()
            .then(function () {
                return generatedLoadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/FontLoader.js');
            })
            .then(function () {
                return generatedLoadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/geometries/TextGeometry.js');
            })
            .then(function () {
                return {
                    THREE: window.THREE,
                    FontLoader: window.THREE && window.THREE.FontLoader,
                    TextGeometry: window.THREE && window.THREE.TextGeometry
                };
            });

        return generatedThreeAddonsPromise;
    }

    function generatedFallback(container, type, content) {
        if (!container) return;
        container.innerHTML = '';

        if (type === 'Texto') {
            const text = document.createElement('p');
            text.textContent = content || '';
            Object.assign(text.style, {
                color: '#caf0f8',
                fontSize: '1.35rem',
                fontWeight: '800',
                textAlign: 'center',
                whiteSpace: 'pre-wrap',
                margin: '0',
                padding: '1rem'
            });
            container.appendChild(text);
            return;
        }

        if (type === 'Imagen') {
            const img = document.createElement('img');
            img.src = content || '';
            Object.assign(img.style, {
                display: 'block',
                maxWidth: '100%',
                maxHeight: '190px',
                margin: '0 auto',
                borderRadius: '12px'
            });
            container.appendChild(img);
            return;
        }

        if (type === 'Video') {
            const video = document.createElement('video');
            video.src = content || '';
            video.controls = true;
            video.playsInline = true;
            Object.assign(video.style, {
                display: 'block',
                width: '100%',
                maxHeight: '220px',
                borderRadius: '12px',
                background: '#000'
            });
            container.appendChild(video);
        }
    }

    function generatedInitThreeForType(container, type, content) {
        if (!container) return function () {};

        let disposed = false;
        let renderer = null;
        let scene = null;
        let camera = null;
        let frameId = 0;
        let videoEl = null;
        let resizeObserver = null;
        let clickHandler = null;
        let portalGroup = null;
        let portalGlow = null;
        let portalFrameGroup = null;
        let portalParticles = null;
        const enableRootSpin = type !== 'Video';
        const planeBaseSize = type === 'Video' ? 3.6 : 1.8;

        const cleanup = function () {
            disposed = true;
            if (frameId) cancelAnimationFrame(frameId);
            if (resizeObserver) resizeObserver.disconnect();

            if (clickHandler) {
                container.removeEventListener('click', clickHandler);
            }

            if (videoEl) {
                try {
                    videoEl.pause();
                    videoEl.removeAttribute('src');
                    videoEl.load();
                } catch (error) {}
            }

            if (scene) {
                scene.traverse(function (obj) {
                    if (obj.geometry && obj.geometry.dispose) obj.geometry.dispose();
                    if (obj.material) {
                        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                        materials.forEach(function (material) {
                            if (material.map && material.map.dispose) material.map.dispose();
                            if (material.dispose) material.dispose();
                        });
                    }
                });
            }

            if (renderer) {
                if (renderer.dispose) renderer.dispose();
                if (renderer.domElement && renderer.domElement.parentNode) {
                    renderer.domElement.parentNode.removeChild(renderer.domElement);
                }
            }
        };

        generatedLoadThree().then(function (THREE) {
            if (disposed || !THREE || !container) return;

            const width = container.clientWidth || 300;
            const height = container.clientHeight || 200;

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
            camera.position.z = type === 'Video' ? 3.2 : 2.5;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.setClearColor(0x000000, 0);

            container.innerHTML = '';
            container.appendChild(renderer.domElement);

            const root = new THREE.Group();
            scene.add(root);

            function createGlowTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                const context = canvas.getContext('2d');
                const gradient = context.createRadialGradient(128, 128, 10, 128, 128, 128);
                gradient.addColorStop(0, 'rgba(0,255,255,.45)');
                gradient.addColorStop(.45, 'rgba(0,200,255,.2)');
                gradient.addColorStop(1, 'rgba(0,140,255,0)');
                context.fillStyle = gradient;
                context.fillRect(0, 0, 256, 256);
                const texture = new THREE.CanvasTexture(canvas);
                if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
                return texture;
            }

            const portalFrameMaterial = new THREE.MeshStandardMaterial({
                color: 0x83f3ff,
                emissive: 0x40e0ff,
                emissiveIntensity: .85,
                roughness: .2,
                metalness: .2,
                transparent: true,
                opacity: .95
            });

            function buildPortalFrame(frameWidth, frameHeight) {
                if (!portalFrameGroup) return;
                while (portalFrameGroup.children.length) {
                    const child = portalFrameGroup.children.pop();
                    if (child.geometry && child.geometry.dispose) child.geometry.dispose();
                }

                const thickness = .09;
                const depth = .18;
                const halfWidth = frameWidth / 2;
                const halfHeight = frameHeight / 2;
                [
                    [frameWidth + thickness * 2, thickness, depth, 0, halfHeight + thickness / 2, 0],
                    [frameWidth + thickness * 2, thickness, depth, 0, -halfHeight - thickness / 2, 0],
                    [thickness, frameHeight, depth, -halfWidth - thickness / 2, 0, 0],
                    [thickness, frameHeight, depth, halfWidth + thickness / 2, 0, 0]
                ].forEach(function (item) {
                    const mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(item[0], item[1], item[2]),
                        portalFrameMaterial
                    );
                    mesh.position.set(item[3], item[4], item[5]);
                    portalFrameGroup.add(mesh);
                });
            }

            if (type === 'Texto') {
                scene.add(new THREE.AmbientLight(0xffffff, 1.2));
                const directional = new THREE.DirectionalLight(0xffffff, 1.5);
                directional.position.set(2, 3, 4);
                scene.add(directional);

                generatedLoadThreeAddons().then(function (addons) {
                    if (disposed || !addons.FontLoader || !addons.TextGeometry) {
                        generatedFallback(container, 'Texto', content);
                        return;
                    }

                    const loader = new addons.FontLoader();

                    function buildText(font) {
                        if (disposed) return;
                        const textGroup = new THREE.Group();
                        root.add(textGroup);
                        const material = new THREE.MeshStandardMaterial({
                            color: 0xffffff,
                            roughness: .1,
                            metalness: 0,
                            emissive: 0xffffff,
                            emissiveIntensity: .2
                        });
                        const lines = String(content || '').split(/\\r?\\n/);
                        const widths = [];

                        lines.forEach(function (line, index) {
                            const geometry = new addons.TextGeometry(line || ' ', {
                                font: font,
                                size: .3,
                                height: .08,
                                curveSegments: 12,
                                bevelEnabled: true,
                                bevelThickness: .01,
                                bevelSize: .008,
                                bevelSegments: 3
                            });
                            geometry.computeBoundingBox();
                            const textWidth =
                                geometry.boundingBox &&
                                geometry.boundingBox.max &&
                                geometry.boundingBox.min
                                    ? (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
                                    : 1;
                            widths.push(textWidth || 1);
                            const mesh = new THREE.Mesh(geometry, material);
                            mesh.position.x = -(textWidth || 1) / 2;
                            mesh.position.y = ((lines.length - 1) / 2 - index) * .405;
                            textGroup.add(mesh);
                        });

                        const maxWidth = Math.max.apply(Math, widths.concat([1]));
                        textGroup.scale.setScalar(Math.min(1, 1.4 / maxWidth));
                    }

                    loader.load(
                        './fonts/helvetiker_regular.typeface.json',
                        buildText,
                        undefined,
                        function () {
                            loader.load(
                                'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/fonts/helvetiker_regular.typeface.json',
                                buildText,
                                undefined,
                                function () {
                                    if (!disposed) generatedFallback(container, 'Texto', content);
                                }
                            );
                        }
                    );
                }).catch(function () {
                    if (!disposed) generatedFallback(container, 'Texto', content);
                });
            } else if (type === 'Imagen') {
                const loader = new THREE.TextureLoader();
                loader.setCrossOrigin('anonymous');
                loader.load(
                    content,
                    function (texture) {
                        if (disposed) return;
                        if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
                        const aspect = texture.image.width / texture.image.height;
                        const planeWidth = aspect >= 1 ? 1.8 : 1.8 * aspect;
                        const planeHeight = aspect >= 1 ? 1.8 / aspect : 1.8;

                        const front = new THREE.Mesh(
                            new THREE.PlaneGeometry(planeWidth, planeHeight),
                            new THREE.MeshBasicMaterial({ map: texture, transparent: true })
                        );
                        root.add(front);

                        const backTexture = texture.clone();
                        if (THREE.SRGBColorSpace) backTexture.colorSpace = THREE.SRGBColorSpace;
                        backTexture.wrapS = THREE.RepeatWrapping;
                        backTexture.repeat.x = -1;
                        backTexture.offset.x = 1;
                        backTexture.needsUpdate = true;

                        const back = new THREE.Mesh(
                            new THREE.PlaneGeometry(planeWidth, planeHeight),
                            new THREE.MeshBasicMaterial({ map: backTexture, transparent: true })
                        );
                        back.rotation.y = Math.PI;
                        root.add(back);
                    },
                    undefined,
                    function () {
                        if (!disposed) generatedFallback(container, 'Imagen', content);
                    }
                );
            } else if (type === 'Video') {
                const plane = new THREE.Mesh(
                    new THREE.PlaneGeometry(1, 1),
                    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
                );

                function fitAspect(aspect) {
                    const planeWidth = aspect >= 1 ? planeBaseSize : planeBaseSize * aspect;
                    const planeHeight = aspect >= 1 ? planeBaseSize / aspect : planeBaseSize;
                    plane.scale.set(planeWidth, planeHeight, 1);
                    if (portalGlow) portalGlow.scale.set(planeWidth * 1.3, planeHeight * 1.3, 1);
                    buildPortalFrame(planeWidth, planeHeight);
                }

                videoEl = document.createElement('video');
                videoEl.src = content;
                videoEl.crossOrigin = 'anonymous';
                videoEl.loop = true;
                videoEl.muted = true;
                videoEl.playsInline = true;
                videoEl.preload = 'auto';

                const videoTexture = new THREE.VideoTexture(videoEl);
                if (THREE.SRGBColorSpace) videoTexture.colorSpace = THREE.SRGBColorSpace;
                plane.material = new THREE.MeshBasicMaterial({
                    map: videoTexture,
                    transparent: true,
                    opacity: .96
                });

                scene.add(new THREE.AmbientLight(0xffffff, .35));
                const rim = new THREE.PointLight(0x7ffcff, 1.1);
                rim.position.set(2.5, 2.2, 3.5);
                scene.add(rim);

                portalGroup = new THREE.Group();
                plane.position.z = -.06;
                portalGroup.add(plane);

                const glowTexture = createGlowTexture();
                const glowMaterial = new THREE.MeshBasicMaterial({
                    map: glowTexture,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                portalGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMaterial);
                portalGlow.position.z = -.14;
                portalGroup.add(portalGlow);

                portalFrameGroup = new THREE.Group();
                portalGroup.add(portalFrameGroup);

                const particleCount = 160;
                const positions = new Float32Array(particleCount * 3);
                for (let i = 0; i < particleCount; i += 1) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = .85 + Math.random() * .35;
                    const depth = Math.random() - .5;
                    positions[i * 3] = Math.cos(angle) * radius;
                    positions[i * 3 + 1] = Math.sin(angle) * radius;
                    positions[i * 3 + 2] = depth * .4;
                }
                const particleGeometry = new THREE.BufferGeometry();
                particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const particleMaterial = new THREE.PointsMaterial({
                    color: 0x7df9ff,
                    size: .05,
                    transparent: true,
                    opacity: .8,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                });
                portalParticles = new THREE.Points(particleGeometry, particleMaterial);
                portalGroup.add(portalParticles);
                root.add(portalGroup);

                fitAspect(16 / 9);
                videoEl.addEventListener('loadedmetadata', function () {
                    if (videoEl.videoWidth && videoEl.videoHeight) {
                        fitAspect(videoEl.videoWidth / videoEl.videoHeight);
                    }
                });
                videoEl.play().catch(function () {});

                clickHandler = function () {
                    if (videoEl.paused) {
                        videoEl.muted = false;
                        videoEl.play().catch(function () {});
                    } else {
                        videoEl.pause();
                    }
                };
                container.addEventListener('click', clickHandler);
            }

            if (window.ResizeObserver) {
                resizeObserver = new ResizeObserver(function () {
                    if (!renderer || !camera || !container || disposed) return;
                    const nextWidth = container.clientWidth || 300;
                    const nextHeight = container.clientHeight || 200;
                    renderer.setSize(nextWidth, nextHeight);
                    camera.aspect = nextWidth / nextHeight;
                    camera.updateProjectionMatrix();
                });
                resizeObserver.observe(container);
            }

            function animate() {
                if (disposed || !renderer || !scene || !camera) return;

                if (enableRootSpin) root.rotation.y += .008;
                if (portalGroup) {
                    const now = performance.now();
                    portalGroup.position.y = Math.sin(now * .0011) * .06;
                    portalGroup.position.x = Math.cos(now * .0009) * .02;
                    portalGroup.rotation.z = Math.sin(now * .0006) * .04;
                    portalGroup.rotation.y = Math.cos(now * .0005) * .04;
                }
                if (portalParticles) {
                    portalParticles.rotation.z += .002;
                    portalParticles.rotation.y += .001;
                }

                frameId = requestAnimationFrame(animate);
                renderer.render(scene, camera);
            }

            animate();
        }).catch(function () {
            if (!disposed) generatedFallback(container, type, content);
        });

        return cleanup;
    }

    function appendGeneratedARMedia(container, stage, cleanups) {
        const visualItems = [];
        const hasText = Boolean(stage.Texto && stage.TextoValor);
        const hasImage = Boolean(stage.Imagen && stage.ImagenUrl);
        const hasVideo = Boolean(stage.Video && stage.VideoUrl);
        const hasAudio = Boolean(stage.Audio && stage.AudioUrl);

        function createThreeContainer(type, content) {
            const wrap = document.createElement('div');
            Object.assign(wrap.style, {
                width: '300px',
                height: '200px',
                maxWidth: '82vw',
                borderRadius: '12px',
                overflow: 'visible',
                background: 'transparent'
            });
            container.appendChild(wrap);

            window.requestAnimationFrame(function () {
                window.requestAnimationFrame(function () {
                    cleanups.push(generatedInitThreeForType(wrap, type, content));
                });
            });

            visualItems.push(wrap);
        }

        if (hasText) createThreeContainer('Texto', stage.TextoValor);
        if (hasImage) createThreeContainer('Imagen', generatedNormalizeUrl(stage.ImagenUrl));
        if (hasVideo) createThreeContainer('Video', generatedNormalizeUrl(stage.VideoUrl));

        if (visualItems.length > 1) {
            container.style.flexWrap = 'wrap';
            container.style.gap = '1rem';
        }

        if (hasAudio) {
            const audio = document.createElement('audio');
            audio.src = generatedNormalizeUrl(stage.AudioUrl);
            audio.autoplay = true;

            if (visualItems.length === 0) {
                audio.controls = true;
                Object.assign(audio.style, {
                    width: 'min(320px, 80vw)',
                    position: 'relative',
                    zIndex: '3'
                });

                const audioBox = document.createElement('div');
                Object.assign(audioBox.style, {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    padding: '1.5rem',
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,.12)',
                    backdropFilter: 'blur(6px)'
                });

                const icon = document.createElement('div');
                icon.textContent = '♪';
                Object.assign(icon.style, {
                    color: '#fff',
                    fontSize: '3rem',
                    fontWeight: '800'
                });
                audioBox.appendChild(icon);
                audioBox.appendChild(audio);
                container.appendChild(audioBox);
            } else {
                audio.controls = false;
                audio.style.display = 'none';
                container.appendChild(audio);
            }

            audio.play().catch(function () {});
            cleanups.push(function () {
                try {
                    audio.pause();
                    audio.removeAttribute('src');
                    audio.load();
                } catch (error) {}
            });
        }
    }

    function showGeneratedARStageModal(stageName) {
        const config = readGeneratedARValue('laberintoARConfig');
        const selectedStages = readGeneratedARValue('selectedLaberintoStages');
        const stage = config && config[stageName] ? config[stageName] : {};

        if (selectedStages && selectedStages[stageName] === false) {
            return Promise.resolve(true);
        }
        if (!generatedARStageHasContent(stage)) {
            return Promise.resolve(true);
        }

        return new Promise(function (resolve) {
            let closed = false;
            let cameraStream = null;
            let cleanupSymbols = function () {};
            const cleanups = [];
            const useCamera = stageName === '${CAMERA_BACKGROUND_STAGE}';

            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
                position: 'fixed',
                inset: '0',
                zIndex: '99999',
                background: 'rgba(10,15,40,.92)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                boxSizing: 'border-box'
            });

            const panel = document.createElement('div');
            Object.assign(panel.style, {
                width: '680px',
                maxWidth: '95vw',
                borderRadius: '28px',
                background: 'linear-gradient(145deg,#03045e 0%,#023e8a 50%,#0077b6 100%)',
                boxShadow: '0 25px 60px rgba(0,0,0,.5)',
                overflow: 'hidden',
                position: 'relative'
            });

            const arBackground = document.createElement('div');
            Object.assign(arBackground.style, {
                position: 'relative',
                minHeight: '220px',
                width: '100%',
                background: useCamera ? 'transparent' : 'linear-gradient(135deg,#0077b6 0%,#023e8a 100%)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '1.2rem 0',
                borderRadius: '28px 28px 0 0'
            });

            let camera = null;
            let cameraStatus = null;
            if (useCamera) {
                camera = document.createElement('video');
                camera.autoplay = true;
                camera.playsInline = true;
                camera.muted = true;
                Object.assign(camera.style, {
                    position: 'absolute',
                    inset: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: '0',
                    background: '#023e8a'
                });
                arBackground.appendChild(camera);

                cameraStatus = document.createElement('div');
                cameraStatus.textContent = 'Solicitando cámara…';
                Object.assign(cameraStatus.style, {
                    position: 'absolute',
                    left: '12px',
                    bottom: '12px',
                    zIndex: '5',
                    padding: '.35rem .65rem',
                    borderRadius: '999px',
                    background: 'rgba(0,0,0,.48)',
                    color: '#fff',
                    fontSize: '.75rem',
                    fontWeight: '700'
                });
                arBackground.appendChild(cameraStatus);
            }

            const backgroundElements = document.createElement('div');
            Object.assign(backgroundElements.style, {
                position: 'absolute',
                inset: '0',
                pointerEvents: 'none',
                zIndex: '1',
                background:
                    'radial-gradient(circle at 20% 20%,rgba(255,255,255,.1) 0%,transparent 50%),' +
                    'radial-gradient(circle at 80% 80%,rgba(255,255,255,.1) 0%,transparent 50%)'
            });
            arBackground.appendChild(backgroundElements);

            const content = document.createElement('div');
            Object.assign(content.style, {
                position: 'relative',
                zIndex: '2',
                width: '100%',
                padding: '0 1rem',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
            });
            arBackground.appendChild(content);

            const actions = document.createElement('div');
            Object.assign(actions.style, {
                margin: '0',
                padding: '1rem 1.5rem 1.25rem',
                gap: '.75rem',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                flexWrap: 'nowrap',
                background: 'rgba(0,0,0,.2)'
            });

            const continueButton = document.createElement('button');
            continueButton.textContent =
                stageName === 'Inicio' ? 'Comenzar' :
                (stageName === 'Final' ? 'Terminar' : 'Continuar');
            Object.assign(continueButton.style, {
                flex: '1',
                margin: '0',
                padding: '.7rem 1rem',
                fontSize: '.95rem',
                fontWeight: '700',
                borderRadius: '10px',
                color: '#fff',
                border: '2px solid rgba(255,255,255,.5)',
                background: 'rgba(255,255,255,.15)',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer'
            });

            const cancelButton = document.createElement('button');
            cancelButton.textContent = stageName === 'Inicio' ? 'Cancelar' : 'Cerrar';
            Object.assign(cancelButton.style, {
                flex: '1',
                margin: '0',
                padding: '.7rem 1rem',
                fontSize: '.95rem',
                fontWeight: '700',
                borderRadius: '10px',
                color: '#fff',
                border: '2px solid rgba(255,255,255,.5)',
                background: 'rgba(255,255,255,.15)',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer'
            });

            actions.appendChild(cancelButton);
            actions.appendChild(continueButton);
            panel.appendChild(arBackground);
            panel.appendChild(actions);
            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            cleanupSymbols = createGeneratedFloatingSymbols(backgroundElements);
            appendGeneratedARMedia(content, stage, cleanups);

            function closeGeneratedAR(confirmed) {
                if (closed) return;
                closed = true;

                if (cameraStream) {
                    cameraStream.getTracks().forEach(function (track) { track.stop(); });
                }

                cleanups.forEach(function (cleanup) {
                    try { cleanup && cleanup(); } catch (error) {}
                });
                cleanupSymbols();
                document.removeEventListener('keydown', handleGeneratedARKeydown);
                overlay.remove();
                resolve(confirmed === true);
            }

            function handleGeneratedARKeydown(event) {
                if (event.key === 'Escape') closeGeneratedAR(false);
            }

            continueButton.addEventListener('click', function () {
                closeGeneratedAR(true);
            });
            cancelButton.addEventListener('click', function () {
                closeGeneratedAR(false);
            });
            document.addEventListener('keydown', handleGeneratedARKeydown);

            if (!useCamera) return;

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                cameraStatus.textContent = 'Cámara no disponible';
                cameraStatus.style.background = 'rgba(153,27,27,.82)';
                return;
            }

            navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false
            }).then(function (stream) {
                if (closed) {
                    stream.getTracks().forEach(function (track) { track.stop(); });
                    return;
                }
                cameraStream = stream;
                camera.srcObject = stream;
                camera.play().catch(function () {});
                cameraStatus.textContent = 'Cámara activa';
                cameraStatus.style.background = 'rgba(21,128,61,.76)';
            }).catch(function (error) {
                console.warn('No se pudo activar la cámara para RA.', error);
                cameraStatus.textContent = 'Autoriza la cámara para RA';
                cameraStatus.style.background = 'rgba(153,27,27,.82)';
            });
        });
    }

    try {
        showLaberintoARStageModal = showGeneratedARStageModal;
    } catch (error) {
        console.warn('No se pudo reemplazar el visor RA original.', error);
    }
    window.showLaberintoARStageModal = showGeneratedARStageModal;
`;

  const buildGeneratedConfigScript = (fullConfig, legacyARConfig) => {
    const selectedStages = arEnabled
      ? {
          Inicio: !!arSelectedStages?.Inicio,
          Acierto: !!arSelectedStages?.Acierto,
          Final: !!arSelectedStages?.Final,
        }
      : { Inicio: false, Acierto: false, Final: false };
    const generatorConfig = {
      nivel: fullConfig.nivel || "basico",
      nombreApp: fullConfig.nombreApp || "LogicPath",
      metadata: {
        autor: fullConfig.autor || "",
        version: fullConfig.version || "1.0.0",
        fecha: formatDate(fullConfig.fecha),
        descripcion: fullConfig.descripcion || "",
        nivel: getGeneratedLevelLabel(fullConfig.nivel),
        plataformas: getGeneratedPlatformsLabel(fullConfig.plataformas),
      },
      arConfig: arEnabled ? legacyARConfig : {},
      selectedStages,
    };
    const generatorConfigJson = JSON.stringify(
      generatorConfig,
      null,
      4,
    ).replace(/<\//g, "<\\/");

    return `
${buildGeneratedARCameraScript()}

    // ===== CONFIGURACION GENERADA POR EDUCSTEAM =====
    (function applyEducsteamGeneratorConfig() {
        const generatorConfig = ${generatorConfigJson};

        function storeGeneratedConfig() {
            try {
                localStorage.setItem('laberintoARConfig', JSON.stringify(generatorConfig.arConfig || {}));
                localStorage.setItem('selectedLaberintoStages', JSON.stringify(generatorConfig.selectedStages || {}));
            } catch (error) {
                console.warn('No se pudo guardar la configuracion generada.', error);
            }
        }

        function applyGeneratedInfo() {
            const metadata = generatorConfig.metadata || {};
            if (typeof updateStartScreenFromConfig === 'function') {
                updateStartScreenFromConfig(generatorConfig);
            }

            const setText = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };

            const levelLabels = {
                basico: 'Básico',
                intermedio: 'Intermedio',
                avanzado: 'Avanzado'
            };

            setText('start-title', 'LogicPath');
            setText('start-level-label', levelLabels[generatorConfig.nivel] || 'Básico');
            setText('info-game-name', 'LogicPath');
            setText('info-author-value', metadata.autor || 'No especificado');
            setText('info-version-value', metadata.version || '1.0.0');
            setText('info-date-value', metadata.fecha || 'No especificada');
            setText('info-description-value', metadata.descripcion || 'Sin descripcion.');
            setText('info-level-label', metadata.nivel || 'Basico');
            setText('info-platforms-value', metadata.plataformas || 'Web');
        }

        function enableGeneratedInstructionDragAndDrop() {
            const cards = Array.from(document.querySelectorAll('.instruction-cards .inst-card'));
            const pseudoBody = document.getElementById('pseudo-body');
            if (!pseudoBody || pseudoBody.dataset.dragReady === 'true') return;

            pseudoBody.dataset.dragReady = 'true';

            const setDropActive = (active) => {
                pseudoBody.style.background = active ? '#ebf8ff' : '';
                pseudoBody.style.boxShadow = active
                    ? 'inset 0 0 0 3px rgba(49,130,206,.45)'
                    : '';
            };

            cards.forEach((card) => {
                card.draggable = true;
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');
                card.setAttribute('aria-label', 'Arrastra esta instrucción al pseudocódigo o pulsa para agregarla.');

                card.addEventListener('dragstart', (event) => {
                    const type = card.dataset.type || '';
                    event.dataTransfer.effectAllowed = 'copy';
                    event.dataTransfer.setData('application/x-logicpath-instruction', type);
                    event.dataTransfer.setData('text/plain', type);
                    card.style.opacity = '.55';
                });

                card.addEventListener('dragend', () => {
                    card.style.opacity = '';
                    setDropActive(false);
                });

                card.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        card.click();
                    }
                });
            });

            pseudoBody.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                setDropActive(true);
            });

            pseudoBody.addEventListener('dragleave', (event) => {
                if (!pseudoBody.contains(event.relatedTarget)) setDropActive(false);
            });

            pseudoBody.addEventListener('drop', (event) => {
                event.preventDefault();
                setDropActive(false);

                const type =
                    event.dataTransfer.getData('application/x-logicpath-instruction') ||
                    event.dataTransfer.getData('text/plain');
                const card = cards.find((item) => item.dataset.type === type);
                if (card) card.click();
            });
        }

        function bindGeneratedFinishButton() {
            const finishButton = document.getElementById('finish-btn');
            if (!finishButton || finishButton.dataset.homeReady === 'true') return;

            finishButton.dataset.homeReady = 'true';
            finishButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();

                Promise.resolve(
                    typeof showLaberintoARStageModal === 'function'
                        ? showLaberintoARStageModal('Final')
                        : undefined
                ).finally(() => {
                    showGeneratedStartScreen();
                });
            }, true);
        }

        function startConfiguredGame() {
            storeGeneratedConfig();

            if (typeof gameData === 'object' && gameData) {
                gameData.selectedDifficulty = generatorConfig.nivel || 'basico';
            }

            document.title = generatorConfig.nombreApp || 'LogicPath';

            const levelSelect = document.getElementById('level-select');
            if (levelSelect) levelSelect.value = generatorConfig.nivel || 'basico';

            if (typeof hideLaunchOverlays === 'function') {
                hideLaunchOverlays();
            }

            const appContainer = document.querySelector('.app-container');
            const gameScreen = document.getElementById('game-screen');
            if (appContainer) appContainer.classList.add('hidden');
            if (gameScreen) gameScreen.classList.remove('hidden');

            if (typeof ensureMazeGame === 'function') {
                ensureMazeGame();
            }

            enableGeneratedInstructionDragAndDrop();
            bindGeneratedFinishButton();

            if (mazeGameApi && typeof mazeGameApi.setLevel === 'function') {
                mazeGameApi.setLevel(generatorConfig.nivel || 'basico');
            }

            // El modal de Inicio se abre cuando la vista del juego ya fue
            // montada, igual que en la vista previa del generador.
            window.requestAnimationFrame(() => Promise.resolve(
                typeof showLaberintoARStageModal === 'function'
                    ? showLaberintoARStageModal('Inicio')
                    : true
            ).then((confirmed) => {
                if (confirmed === false) {
                    showGeneratedStartScreen();
                    return;
                }

                if (typeof showCustomNotification === 'function') {
                    showCustomNotification('Juego de Laberinto iniciado', 'success');
                }
            }));
        }

        function showGeneratedStartScreen() {
            storeGeneratedConfig();
            applyGeneratedInfo();
            enableGeneratedInstructionDragAndDrop();

            if (typeof gameData === 'object' && gameData) {
                gameData.selectedDifficulty = generatorConfig.nivel || 'basico';
            }

            const levelSelect = document.getElementById('level-select');
            if (levelSelect) levelSelect.value = generatorConfig.nivel || 'basico';

            const appContainer = document.querySelector('.app-container');
            const gameScreen = document.getElementById('game-screen');
            if (appContainer) {
                appContainer.innerHTML = "";
                appContainer.classList.add('hidden');
            }
            if (gameScreen) gameScreen.classList.add('hidden');

            if (typeof setLaunchOverlay === 'function') {
                setLaunchOverlay("start-screen");
            }
        }

        launchConfiguredGame = startConfiguredGame;
        window.startGameSequence = startGameSequence;
        window.toggleInfo = toggleInfo;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => window.setTimeout(showGeneratedStartScreen, 0));
        } else {
            window.setTimeout(showGeneratedStartScreen, 0);
        }
    })();`;
  };

  const buildConfiguredIndex = (fullConfig, legacyARConfig) => {
    const appName = fullConfig.nombreApp || "LogicPath";
    const infoGrid = buildInfoModalGrid(fullConfig);
    const configuredHtml = LABERINTO_HTML_TEMPLATE.replace(/^\uFEFF/, "")
      .replace(
        '<div id="game-screen" class="hidden"></div>',
        '<div id="game-screen" class="hidden" data-preview-parity="logicpath"></div>',
      )
      .replace("&#9432; Informaci&oacute;n", "ℹ Informaci&oacute;n")
      // El visor RA homologado usa Three.js, igual que Encriptación/BloqCode.
      // Se retiran A-Frame/AR.js del HTML exportado para evitar que una versión
      // distinta de THREE interfiera con TextGeometry y VideoTexture.
      .replace(
        /\s*<script src="https:\/\/aframe\.io\/releases\/1\.4\.0\/aframe\.min\.js"><\/script>/,
        "",
      )
      .replace(
        /\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/ar\.js@3\.4\.5\/aframe\/build\/aframe-ar-nft\.js"><\/script>/,
        "",
      )
      .replaceAll("Juego del Laberinto", "LogicPath")
      .replace(
        /<h1 class="lab-animated-title">[\s\S]*?<\/h1>/,
        `<h1 class="lab-animated-title">${[..."LogicPath"]
          .map(
            (character, index) =>
              `<span style="animation-delay:${index * 0.1}s">${character}</span>`,
          )
          .join("")}</h1>`,
      )
      .replace('<span class="lab-icon-3">01</span>', '<span class="lab-icon-3">I</span>')
      .replace('<span class="lab-icon-4">I</span>', '<span class="lab-icon-4">B</span>')
      .replace(
        "</style>",
        `
    /* Pantalla inicial homologada con el HTML de Rompecabezas. */
    .overlay { font-family: 'Segoe UI', sans-serif; }
    .game-title .info-title.start-title {
      color: var(--primary-color);
      margin: 0 0 1rem;
      font-family: 'Segoe UI', sans-serif;
      font-size: 3.8rem;
      font-weight: 900;
      line-height: normal;
      text-align: center;
      letter-spacing: -0.02em;
    }
    .start-level-pill { font-family: 'Segoe UI', sans-serif; }
    .big-btn:hover { filter: brightness(1.1); }
    body { align-items: stretch; padding: 0; }
    #game-screen { width: 100%; min-width: 0; }
    .main-container {
      width: 100%;
      max-width: none;
      min-width: 0;
      margin: 0;
      padding: 2rem;
    }
  </style>`,
      )
      .replace(
        /<title>.*?<\/title>/,
        `<title>${escapeGeneratedHtml(appName)}</title>`,
      )
      .replace(
        /<h2 class="info-title" id="info-game-name">.*?<\/h2>/,
        `<h2 class="info-title" id="info-game-name">${escapeGeneratedHtml(appName)}</h2>`,
      )
      .replace(
        /<div class="info-details-grid">[\s\S]*?<\/div>\s*<div style="text-align: center;">/,
        `${infoGrid}
      <div style="text-align: center;">`,
      );

    return configuredHtml.replace(
      /\s*<\/script>\s*<\/body>/,
      `${buildGeneratedConfigScript(fullConfig, legacyARConfig)}
  </script>
</body>`,
    );
  };
  const buildSummaryConfig = async () => {
    const details = state?.gameDetails ?? {};
    const selectedLevel = config?.level || "basico";

    return {
      gameType: "laberinto",
      nivel: selectedLevel,
      ejercicios:
        config?.exerciseCount ?? LEVEL_CONFIG[selectedLevel]?.showCount ?? 3,
      autor: details.authorName || "",
      version: details.version || "1.0.0",
      fecha: details.date || new Date().toISOString(),
      descripcion: details.description || "",
      nombreApp: details.gameName || "LogicPath",
      plataformas: selectedPlatforms,
      ar: arEnabled ? await resolveARConfig(arConfig) : undefined,
    };
  };

  const generateAndDownloadZip = async () => {
    if (!window.JSZip) {
      setStatusText("La librería ZIP aún no está lista.");
      setIsGenerating(false);
      return;
    }

    try {
      const zip = new window.JSZip();
      setStatusText("Preparando configuración...");
      const fullConfig = await buildSummaryConfig();
      const legacyARConfig = await resolveLegacyARConfig(arConfig);
      const htmlContent = buildConfiguredIndex(fullConfig, legacyARConfig);

      const folder = zip.folder("LogicPath");
      if (hasWebPlatform) {
        folder.file("index.html", htmlContent);
        folder.file("logicpath-config.json", JSON.stringify(fullConfig, null, 2));
      }
      if (hasAndroidPlatform) {
        const androidContent = await buildNativeTemplatePackage({
          templateUrl: LOGIC_PATH_NATIVE_TEMPLATE_URLS.android,
          platform: "android",
          configFileName: "laberinto-config.json",
          config: fullConfig,
          arEnabled,
          replaceIndex: false
        });
        folder.file("logicpath_android.zip", androidContent);
      }
      if (hasIOSPlatform) {
        const iosContent = await buildNativeTemplatePackage({
          templateUrl: LOGIC_PATH_NATIVE_TEMPLATE_URLS.ios,
          platform: "ios",
          configFileName: "laberinto-config.json",
          config: fullConfig,
          arEnabled,
          replaceIndex: false
        });
        folder.file("logicpath_ios.zip", iosContent);
      }
      setStatusText("Generando paquete final...");
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `logicpath-${config?.level ?? "basico"}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      clearARConfigurationsAfterDownload();

      setProgress(100);
      setStatusText("¡Descarga iniciada!");
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 2000);
    } catch (error) {
      console.error("Error generando el ZIP de Laberinto:", error);
      setStatusText(error.message || "Error al generar el archivo.");
      setIsGenerating(false);
    }
  };

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
        if (currentProgress > 20 && currentProgress < 50) {
          setStatusText("Generando configuración...");
        }
        if (currentProgress >= 50 && currentProgress < 80) {
          setStatusText("Incrustando recursos RA...");
        }
        setProgress(currentProgress);
      }
    }, 200);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      const normalized = dateString.includes("T")
        ? dateString
        : `${dateString}T00:00:00`;
      return new Date(normalized).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getAreaName = (areaId) => {
    const areas = {
      science: "Ciencia",
      technology: "Tecnología",
      engineering: "Ingeniería",
      arts: "Arte",
      math: "Matemáticas",
    };
    return areas[areaId] || areaId;
  };

  const getAreaIcon = (areaId) => {
    const icons = {
      science: "/images/areas/Ciencia.png",
      technology: "/images/areas/Tecnologia.png",
      engineering: "/images/areas/Ingenieria.png",
      arts: "/images/areas/Artes.png",
      math: "/images/areas/Matematicas.png",
    };
    return icons[areaId] || "https://placehold.co/32x32/eee/aaa?text=?";
  };

  const selectedAreas = state?.selectedAreas || [];
  const selectedSkills = state?.selectedSkills || [];
  const gameDetails = {
    ...(state?.gameDetails || {}),
    date: state?.gameDetails?.date || new Date().toISOString(),
  };
  const levelLabel = LEVEL_CONFIG[config?.level]?.label || config?.level || "—";

  return (
    <div className="summary-screen">
      <style>{summaryStyles}</style>

      <h2
        style={{
          color: "#0077b6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <CheckCircle size={32} color="#22c55e" /> ¡Configuración Exitosa!
      </h2>
      <p className="rules-text">
        Tu juego ha sido configurado correctamente. Revisa los detalles y
        descárgalo.
      </p>

      <h1 className="selection-title">Resumen de la Configuración</h1>

      <div
        className="summary-details"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        <div className="info-grid">
          <div className="info-card">
            <div className="info-card-header">
              <Tag size={16} /> Nombre del Juego
            </div>
            <div className="info-card-value">
              {gameDetails.gameName || "No disponible"}
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-header">
              <Type size={16} /> Nombre del Autor
            </div>
            <div className="info-card-value">
              {gameDetails.authorName || "No especificado"}
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-header">
              <Layers size={16} /> Versión
            </div>
            <div className="info-card-value">
              {gameDetails.version || "1.0.0"}
            </div>
          </div>
          <div className="info-card full-width">
            <div className="info-card-header">
              <FileText size={16} /> Descripción
            </div>
            <div className="info-card-value">
              {gameDetails.description || "Sin descripción."}
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-header">
              <Calendar size={16} /> Fecha de Creación
            </div>
            <div className="info-card-value">
              {formatDate(gameDetails.date)}
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-header">
              <Monitor size={16} /> Plataformas
            </div>
            <div className="info-card-value">
              {selectedPlatforms.length > 0
                ? selectedPlatforms
                    .map(
                      (platform) =>
                        platform.charAt(0).toUpperCase() + platform.slice(1),
                    )
                    .join(", ")
                : "No seleccionadas"}
            </div>
          </div>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e2e8f0",
            margin: "2.5rem 0",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          <div
            className="info-card"
            style={{ borderLeft: "4px solid #3b82f6" }}
          >
            <h4
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "0 0 1rem 0",
                color: "#0077b6",
              }}
            >
              <Shapes size={20} color="#3b82f6" /> Áreas Seleccionadas
            </h4>
            {selectedAreas.length > 0 ? (
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}
              >
                {selectedAreas.map((areaId) => (
                  <span
                    key={areaId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      background: "#eff6ff",
                      borderRadius: "0.5rem",
                      fontSize: "0.95rem",
                      color: "#1e40af",
                    }}
                  >
                    <img
                      src={getAreaIcon(areaId)}
                      alt=""
                      style={{ width: "20px", height: "20px" }}
                      onError={(event) => {
                        event.target.src =
                          "https://placehold.co/20x20/eee/aaa?text=?";
                      }}
                    />
                    {getAreaName(areaId)}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>
                No hay áreas seleccionadas.
              </p>
            )}
          </div>
          <div
            className="info-card"
            style={{ borderLeft: "4px solid #8b5cf6" }}
          >
            <h4
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "0 0 1rem 0",
                color: "#0077b6",
              }}
            >
              <Puzzle size={20} color="#8b5cf6" /> Habilidades Seleccionadas
            </h4>
            {selectedSkills.length > 0 ? (
              <ul
                style={{
                  paddingLeft: "1.2rem",
                  margin: 0,
                  color: "#334155",
                  textAlign: "left",
                }}
              >
                {selectedSkills.map((skill) => (
                  <li key={skill} style={{ marginBottom: "0.4rem" }}>
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>
                No hay habilidades seleccionadas.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="summary-card" style={{ marginTop: "2.5rem" }}>
        <h3
          style={{
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
            marginBottom: "15px",
            color: "#0077b6",
          }}
        >
          Parámetros del Juego
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            rowGap: "1rem",
            alignItems: "center",
          }}
        >
          <div className="summary-row">
            <span
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                color: "#64748b",
              }}
            >
              <Type size={18} /> Nivel:
            </span>
            <strong style={{ fontSize: "1.1rem", color: "#0077b6" }}>
              {levelLabel}
            </strong>
          </div>
          <div className="summary-row">
            <span
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                color: "#64748b",
              }}
            >
              <List size={18} /> Ejercicios:
            </span>
            <strong style={{ fontSize: "1.1rem", color: "#0077b6" }}>
              {config?.exerciseCount ?? "—"}
            </strong>
          </div>
          <div className="summary-row">
            <span
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                color: "#64748b",
              }}
            >
              <Clock size={18} /> Realidad Aumentada:
            </span>
            <strong style={{ fontSize: "1.1rem", color: "#64748b" }}>
              {arEnabled ? "Sí" : "No"}
            </strong>
          </div>
        </div>
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "center",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "1.5rem",
          }}
        >
          <button
            type="button"
            className="btn-primary-summary"
            onClick={onBack}
            disabled={isGenerating}
            style={{
              opacity: isGenerating ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <ArrowLeft size={18} /> Volver a Editar
          </button>
        </div>
      </div>

      <div className="download-section">
        <div style={{ width: "100%", maxWidth: "600px", textAlign: "center" }}>
          <h3 style={{ color: "#0077b6", marginBottom: "0.5rem" }}>
            Descargar Paquete del Juego
          </h3>
          <p style={{ color: "#64748b", marginBottom: "1rem" }}>
            Genera el archivo .zip listo para descargar en su computadora.
          </p>
          <div
            className="download-platforms"
            aria-label="Plataformas seleccionadas para el paquete"
          >
            {selectedPlatforms.map((platform) => (
              <span
                className={`download-platform-badge ${platform}`}
                key={platform}
              >
                {platform === "web" ? (
                  <Monitor size={14} />
                ) : (
                  <Smartphone size={14} />
                )}
                {DOWNLOAD_PLATFORM_LABELS[platform]}
              </span>
            ))}
          </div>
          <p className="download-platform-notice">
            <span aria-hidden="true">📦</span> {downloadPlatformNotice}
          </p>
          {isGenerating && (
            <div
              style={{ marginBottom: "1.5rem", animation: "fadeIn 0.3s ease" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  color: "#4b5563",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "14px",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "7px",
                  overflow: "hidden",
                  marginTop: "0.5rem",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    backgroundColor: "#0077b6",
                    transition: "width 0.3s ease-out",
                    borderRadius: "7px",
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            className="btn-primary-summary btn-success"
            onClick={handleDownloadZip}
            disabled={isGenerating || !jsZipReady}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              boxShadow: "0 4px 14px 0 rgba(0, 95, 146, 0.35)",
              minWidth: "240px",
              justifyContent: "center",
              padding: "0.85rem 2rem",
              borderRadius: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: isGenerating || !jsZipReady ? "wait" : "pointer",
              opacity: isGenerating || !jsZipReady ? 0.8 : 1,
            }}
          >
            {isGenerating || !jsZipReady ? (
              <>{!jsZipReady ? "Cargando librería..." : "Generando..."}</>
            ) : (
              <>
                <Package size={18} /> Generar (.zip)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Laberinto({ withRA } = {}) {
  const hasExternalRAFlow = typeof withRA === "boolean";
  const location = useLocation();
  const navigate = useNavigate();
  const { ensureThree, ensureThreeTextAddons } = useThreeLoaders();
  const initThreeStage = useMemo(
    () => initThreeStageFactory({ ensureThree, ensureThreeTextAddons }),
    [ensureThree, ensureThreeTextAddons],
  );
  const canvasRef = useRef(null);
  const mazePanelRef = useRef(null);
  const animationTimerRef = useRef(null);
  const mediaObjectUrlsRef = useRef({});
  const [screen, setScreen] = useState(() =>
    hasExternalRAFlow && withRA ? "ar" : "generator",
  );
  const [difficulty, setDifficulty] = useState("basico");
  const [useAR, setUseAR] = useState(hasExternalRAFlow ? withRA : null);
  const [choiceOpen, setChoiceOpen] = useState(!hasExternalRAFlow);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [uploadingField, setUploadingField] = useState("");
  const [activeARTab, setActiveARTab] = useState("Inicio");
  const uploadingStage = "";

  const [selectedStages, setSelectedStages] = useState(() => ({
    Inicio: false,
    Acierto: false,
    Final: false,
    ...readStorage("selectedLaberintoStages", {}),
  }));
  const [arConfig, setArConfig] = useState(() =>
    normalizeStoredConfig(readStorage("laberintoARConfig", {})),
  );

  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [instructions, setInstructions] = useState([]);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [draggedInstructionType, setDraggedInstructionType] = useState(null);
  const [isPseudoDropActive, setIsPseudoDropActive] = useState(false);
  const [trail, setTrail] = useState([]);
  const [player, setPlayer] = useState(null);
  const [result, setResult] = useState(null);
  const [mazePanelSize, setMazePanelSize] = useState(null);

  useEffect(() => {
    if (!hasExternalRAFlow || location.pathname !== "/settings") return;

    const setupStepByScreen = {
      ar: "ar",
      "ar-summary": "ar-summary",
      generator: "setup",
      game: "preview",
    };
    const setupStep = setupStepByScreen[screen];

    if (!setupStep || location.state?.setupStep === setupStep) return;

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: { ...location.state, setupStep },
    });
  }, [
    hasExternalRAFlow,
    location.pathname,
    location.search,
    location.state,
    navigate,
    screen,
  ]);

  const level = LEVEL_CONFIG[difficulty];
  const exercise = exercises[currentExercise];

  const clearMediaUrls = useCallback(() => {
    Object.values(mediaObjectUrlsRef.current).forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Object URL may already be released by the browser.
      }
    });
    mediaObjectUrlsRef.current = {};
  }, []);

  useEffect(() => {
    const resetDownloadedARContent = () => {
      clearMediaUrls();
      setSelectedStages({ Inicio: false, Acierto: false, Final: false });
      setArConfig({});
      setActiveARTab("Inicio");
    };

    window.addEventListener(
      AR_CONFIGURATION_CLEARED_EVENT,
      resetDownloadedARContent,
    );
    return () => {
      window.removeEventListener(
        AR_CONFIGURATION_CLEARED_EVENT,
        resetDownloadedARContent,
      );
    };
  }, [clearMediaUrls]);

  const revokeStageUrl = useCallback((stageName, urlKey) => {
    const objectKey = `${stageName}:${urlKey}`;
    const previousUrl = mediaObjectUrlsRef.current[objectKey];
    if (!previousUrl) return;
    try {
      URL.revokeObjectURL(previousUrl);
    } catch {
      // Object URL may already be released by the browser.
    }
    delete mediaObjectUrlsRef.current[objectKey];
  }, []);

  const stepsOrder =
    useAR === true
      ? ["ar", "ar-summary", "game", "playing"]
      : ["game", "playing"];
  const stepLabels = {
    ar: "RA",
    "ar-summary": "Resumen",
    game: "Juego",
    playing: "Vista Previa",
  };

  const ProgressBar = ({ currentStep }) => {
    const currentIdx = stepsOrder.indexOf(currentStep);
    return (
      <div className="setup-progress-bar">
        {stepsOrder.map((step, i) => (
          <React.Fragment key={step}>
            <div
              className={`setup-progress-step ${i < currentIdx ? "done" : i === currentIdx ? "active" : ""}`}
            >
              <div className="setup-progress-dot" />
              <span>{stepLabels[step]}</span>
            </div>
            {i < stepsOrder.length - 1 && (
              <div className="setup-progress-line" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const AnimatedTitle = () => (
    <div className="laberinto-animated-title-container">
      <h1 className="laberinto-animated-title">
        {"Juego de LogicPath".split("").map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
      <div className="laberinto-floating-icons">
        <span className="laberinto-icon-1">A</span>
        <span className="laberinto-icon-2">D</span>
        <span className="laberinto-icon-3">I</span>
        <span className="laberinto-icon-4">B</span>
      </div>
    </div>
  );

  useEffect(() => {
    window.localStorage.setItem(
      "selectedLaberintoStages",
      JSON.stringify(selectedStages),
    );
    window.localStorage.setItem("laberintoARConfig", JSON.stringify(arConfig));
  }, [arConfig, selectedStages]);

  useEffect(() => {
    if (!hasExternalRAFlow) return;

    setUseAR(withRA);
    setChoiceOpen(false);

    if (withRA) {
      setScreen((current) => (current === "game" ? current : "ar"));
      return;
    }

    if (!withRA) {
      clearMediaUrls();
      setSelectedStages({ Inicio: false, Acierto: false, Final: false });
      setArConfig({});
      window.localStorage.removeItem("selectedLaberintoStages");
      window.localStorage.removeItem("laberintoARConfig");
      setScreen((current) => (current === "game" ? current : "generator"));
    }
  }, [clearMediaUrls, hasExternalRAFlow, withRA]);

  useEffect(() => {
    drawMaze(
      canvasRef.current,
      exercise,
      level.cellSize,
      trail,
      player,
      mazePanelSize,
    );
  }, [exercise, level.cellSize, mazePanelSize, player, trail]);

  useEffect(() => {
    if (screen !== "game" || !mazePanelRef.current) return undefined;

    const panel = mazePanelRef.current;
    const updateSize = () => {
      const styles = window.getComputedStyle(panel);
      const width =
        panel.clientWidth -
        parseFloat(styles.paddingLeft) -
        parseFloat(styles.paddingRight);
      const height =
        panel.clientHeight -
        parseFloat(styles.paddingTop) -
        parseFloat(styles.paddingBottom);

      setMazePanelSize((current) =>
        current?.width === width && current?.height === height
          ? current
          : { width, height },
      );
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(panel);

    return () => resizeObserver.disconnect();
  }, [screen]);

  useEffect(
    () => () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      clearMediaUrls();
    },
    [clearMediaUrls],
  );

  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(() => setNotification(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const selectedStageCount = useMemo(
    () => STAGES.filter((stage) => selectedStages[stage]).length,
    [selectedStages],
  );

  const isARConfigReady = useMemo(() => {
    if (selectedStageCount === 0) return false;
    return STAGES.every(
      (stageName) =>
        !selectedStages[stageName] || hasStageContent(arConfig[stageName]),
    );
  }, [arConfig, selectedStageCount, selectedStages]);

  function chooseAR(value) {
    setUseAR(value);
    setChoiceOpen(false);
    if (!value) {
      clearMediaUrls();
      setSelectedStages({ Inicio: false, Acierto: false, Final: false });
      setArConfig({});
      window.localStorage.removeItem("selectedLaberintoStages");
      window.localStorage.removeItem("laberintoARConfig");
    }
  }

  function canShowARStage(name) {
    return Boolean(
      useAR && selectedStages?.[name] && hasStageContent(arConfig[name]),
    );
  }

  async function showStageModal(name, swalOverrides = {}) {
    if (!canShowARStage(name)) return true;

    const Swal = await ensureSwal();
    if (!Swal) {
      setNotification("No se pudo cargar el visor de Realidad Aumentada.");
      return false;
    }

    const stage = normalizeStageConfig(arConfig[name]);
    const config = getStageFlags(stage);
    const timestamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const bgId = `lab-ar-bg-${name}-${timestamp}`;
    const videoId = `lab-ar-camera-${name}-${timestamp}`;
    const ids = {
      textContainerId: `lab-ar-text-${timestamp}`,
      imageContainerId: `lab-ar-image-${timestamp}`,
      videoContainerId: `lab-ar-video-${timestamp}`,
      audioId: `lab-ar-audio-${timestamp}`,
    };

    const cleanups = [];
    let cleanupSymbols = null;
    let cameraStream = null;
    let modalClosed = false;
    // La cámara funciona como fondo RA únicamente al mostrar un acierto.
    const useCamera = name === CAMERA_BACKGROUND_STAGE;

    const html = buildDecoratedHtml({
      bgId,
      innerHtml: `<div class="ar-multi-content">${buildMultiContentHtml(stage, ids)}</div>`,
      useCamera,
      videoId,
    });

    const result = await Swal.fire({
      html,
      width: 720,
      padding: 0,
      background: "transparent",
      confirmButtonText: "Continuar",
      confirmButtonColor: "#0077b6",
      customClass: {
        popup: "laberinto-ar-swal",
        htmlContainer: "laberinto-ar-html",
      },
      didOpen: async () => {
        if (useCamera) {
          const nextCameraStream = await startCamera(videoId);
          if (modalClosed) {
            stopCamera(nextCameraStream);
          } else {
            cameraStream = nextCameraStream;
          }
        }

        cleanupSymbols = createFloatingSymbols(document.getElementById(bgId));

        // Igual que los demás juegos con RA: esperar a que SweetAlert termine
        // de pintar el modal antes de medir los contenedores de Three.js.
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => {
            if (modalClosed) return;

            if (config.hasText) {
              const container = document.getElementById(ids.textContainerId);
              if (container) {
                cleanups.push(
                  initThreeStage(container, { type: "Texto", text: config.text }),
                );
              }
            }

            if (config.hasImage) {
              const container = document.getElementById(ids.imageContainerId);
              if (container) {
                cleanups.push(
                  initThreeStage(container, {
                    type: "Imagen",
                    imageUrl: config.imageUrl,
                  }),
                );
              }
            }

            if (config.hasVideo) {
              const container = document.getElementById(ids.videoContainerId);
              if (container) {
                cleanups.push(
                  initThreeStage(container, {
                    type: "Video",
                    videoUrl: config.videoUrl,
                  }),
                );
              }
            }
          }),
        );
      },
      willClose: () => {
        modalClosed = true;
        cleanups.forEach((cleanup) => cleanup?.());
        cleanupSymbols?.();
        stopCamera(cameraStream);
      },
      ...swalOverrides,
    });

    return Boolean(result?.isConfirmed);
  }

  function resetExercise(index) {
    setCurrentExercise(index);
    setInstructions([]);
    setAttemptsLeft(level.attempts);
    setTrail([]);
    setPlayer(null);
    setIsPlaying(true);
    setResult(null);
  }

  async function startGame() {
    const nextExercises = buildExercises(difficulty);
    setExercises(nextExercises);
    setCurrentExercise(0);
    setInstructions([]);
    setAttemptsLeft(level.attempts);
    setScore(0);
    setTrail([]);
    setPlayer(null);
    setIsPlaying(false);
    setResult(null);

    await showInitialARInPreview({
      enterPreview: () => {
        setIsPlaying(true);
        setScreen("game");
      },
      showInitialStage: () =>
        showStageModal("Inicio", {
          confirmButtonText: "Comenzar",
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#0077b6",
        }),
      onCancel: () => {
        setIsPlaying(false);
        setScreen("generator");
      },
    });
  }

  async function handleGeneratorNext() {
    if (useAR === null) {
      setChoiceOpen(true);
    } else if (useAR) {
      if (isARConfigReady) {
        await startGame();
      } else {
        setScreen("ar");
      }
    } else {
      await startGame();
    }
  }

  function updateStage(stageName, patch) {
    setArConfig((current) => ({
      ...current,
      [stageName]: {
        ...createEmptyStageConfig(),
        ...normalizeStageConfig(current[stageName]),
        ...patch,
      },
    }));
  }

  function selectContentType(stageName, type) {
    updateStage(stageName, type === "Texto" ? { text: "" } : {});
  }

  function toggleARStage(stageName) {
    setSelectedStages((current) => ({
      ...current,
      [stageName]: !current[stageName],
    }));
    setArConfig((current) => ({
      ...current,
      [stageName]: normalizeStageConfig(current[stageName]),
    }));
  }

  function clearStageField(stageName, field) {
    updateStage(stageName, { [field]: "" });
  }

  function clearStageFile(stageName, type) {
    const field = MEDIA_FIELDS[type];
    if (!field) return;
    revokeStageUrl(stageName, field.urlKey);
    updateStage(stageName, {
      [field.urlKey]: "",
      [field.nameKey]: "",
    });
  }

  function uploadFile(stageName, type, file) {
    if (!file) return;
    const rule = FILE_RULES[type];
    const field = MEDIA_FIELDS[type];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!field) return;
    if (!rule.extensions.includes(extension)) {
      setNotification(`Formato no permitido para ${type.toLowerCase()}.`);
      return;
    }
    if (file.size > rule.maxSize) {
      setNotification(
        `El archivo de ${type.toLowerCase()} es demasiado grande.`,
      );
      return;
    }

    setUploadingField(`${stageName}:${type}`);

    try {
      revokeStageUrl(stageName, field.urlKey);
      const nextUrl = URL.createObjectURL(file);
      mediaObjectUrlsRef.current[`${stageName}:${field.urlKey}`] = nextUrl;

      updateStage(stageName, {
        [field.urlKey]: nextUrl,
        [field.nameKey]: file.name,
      });
      setNotification("Archivo listo para vista previa.");
    } catch (error) {
      setNotification(error.message || "No se pudo preparar el archivo.");
    } finally {
      setUploadingField("");
    }
  }

  function goToSummary() {
    if (selectedStageCount === 0) {
      setNotification("Selecciona al menos una etapa.");
      return;
    }
    const missingContent = STAGES.some(
      (stageName) =>
        selectedStages[stageName] && !hasStageContent(arConfig[stageName]),
    );
    if (missingContent) {
      setNotification("Configura el contenido de cada etapa seleccionada.");
      return;
    }
    setScreen("ar-summary");
  }

  function addInstruction(type) {
    if (!isPlaying || isAnimating) return;
    setInstructions((current) => [...current, { type, value: 1 }]);
  }

  function handleInstructionDragStart(event, type) {
    if (!isPlaying || isAnimating) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-logicpath-instruction", type);
    event.dataTransfer.setData("text/plain", type);
    setDraggedInstructionType(type);
  }

  function handleInstructionDragEnd() {
    setDraggedInstructionType(null);
    setIsPseudoDropActive(false);
  }

  function handlePseudoDragOver(event) {
    if (!isPlaying || isAnimating) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsPseudoDropActive(true);
  }

  function handlePseudoDragLeave(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsPseudoDropActive(false);
  }

  function handlePseudoDrop(event) {
    event.preventDefault();
    setIsPseudoDropActive(false);
    setDraggedInstructionType(null);

    if (!isPlaying || isAnimating) return;

    const type =
      event.dataTransfer.getData("application/x-logicpath-instruction") ||
      event.dataTransfer.getData("text/plain");

    if (INSTRUCTION_INFO[type]) addInstruction(type);
  }

  function updateInstruction(index, value) {
    const safeValue = Math.max(1, Math.min(20, Number(value) || 1));
    setInstructions((current) =>
      current.map((instruction, itemIndex) =>
        itemIndex === index
          ? { ...instruction, value: safeValue }
          : instruction,
      ),
    );
  }

  async function finishValidation(hitWall, finalRow, finalCol) {
    setIsAnimating(false);
    animationTimerRef.current = null;
    const arrived =
      finalRow === exercise.end.r && finalCol === exercise.end.c && !hitWall;

    if (!arrived) {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      setScore((current) => Math.max(0, current - 5));
      if (remaining <= 0) setIsPlaying(false);
      setResult("failed");
      return;
    }

    const nextScore = score + POINTS[difficulty];
    const isLast = currentExercise >= exercises.length - 1;
    setScore(nextScore);
    setIsPlaying(false);

    if (canShowARStage("Acierto")) {
      const shouldContinue = await showStageModal("Acierto", {
        confirmButtonText: isLast ? "Ver resultado" : "Siguiente ejercicio",
        showCancelButton: true,
        cancelButtonText: "Finalizar juego",
        confirmButtonColor: "#0077b6",
      });

      if (!shouldContinue) {
        setResult("finish");
        return;
      }

      if (!isLast) {
        resetExercise(currentExercise + 1);
        return;
      }
    } else if (!isLast) {
      setResult("next");
      return;
    }

    await showStageModal("Final", {
      confirmButtonText: "Terminar",
      showCancelButton: true,
      cancelButtonText: "Cerrar",
      confirmButtonColor: "#0077b6",
    });
    setResult("complete");
  }

  function validateSolution() {
    if (!isPlaying || isAnimating) return;
    if (instructions.length === 0) {
      setNotification("Agrega instrucciones primero.");
      return;
    }

    let row = exercise.start.r;
    let col = exercise.start.c;
    let hitWall = false;
    let reachedGoal = false;
    const path = [{ r: row, c: col }];

    instructions.forEach((instruction) => {
      if (hitWall || reachedGoal) return;
      const [rowDelta, colDelta] = INSTRUCTION_INFO[instruction.type].delta;

      for (let step = 0; step < instruction.value; step += 1) {
        const nextRow = row + rowDelta;
        const nextCol = col + colDelta;
        const outside =
          nextRow < 0 ||
          nextRow >= exercise.rows ||
          nextCol < 0 ||
          nextCol >= exercise.cols;

        if (outside || exercise.maze[nextRow][nextCol] === 1) {
          hitWall = true;
          break;
        }
        row = nextRow;
        col = nextCol;
        path.push({ r: row, c: col });

        if (row === exercise.end.r && col === exercise.end.c) {
          reachedGoal = true;
          break;
        }
      }
    });

    setIsAnimating(true);
    let frame = 0;
    animationTimerRef.current = window.setInterval(() => {
      if (frame >= path.length) {
        window.clearInterval(animationTimerRef.current);
        finishValidation(hitWall, row, col);
        return;
      }
      setTrail(path.slice(0, frame + 1));
      setPlayer(path[frame]);
      frame += 1;
    }, 120);
  }

  async function finishGame() {
    if (isAnimating) return;
    setIsPlaying(false);
    await showStageModal("Final", {
      confirmButtonText: "Finalizar",
      confirmButtonColor: "#0077b6",
    });
    setResult("finish");
  }

  async function handleResultAction(action) {
    if (action === "close") {
      setResult(null);
    } else if (action === "retry") {
      setResult(null);
      setTrail([]);
      setPlayer(null);
      setIsPlaying(true);
    } else if (action === "next") {
      resetExercise(currentExercise + 1);
    } else if (action === "restart") {
      await startGame();
    }
  }

  function backToGenerator() {
    if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    setIsAnimating(false);
    setIsPlaying(false);
    setResult(null);
    window.Swal?.close?.();
    setScreen("generator");
  }

  function finishConfiguration() {
    if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    setIsAnimating(false);
    setIsPlaying(false);
    setResult(null);
    window.Swal?.close?.();

    const arEnabled = useAR === true;
    setScreen("game-summary");

    navigate("/settings?view=Summary", {
      replace: true,
      state: {
        ...location.state,
        gameType: "laberinto",
        gameConfig: {
          level: difficulty,
          exerciseCount: LEVEL_CONFIG[difficulty].showCount,
        },
        arNamespace: "laberinto",
        arSelectedStages: arEnabled
          ? selectedStages
          : { Inicio: false, Acierto: false, Final: false },
        arConfig: arEnabled ? arConfig : {},
        withRA: arEnabled,
      },
    });
  }

  const activeStageConfig = normalizeStageConfig(arConfig[activeARTab]);
  const useCromixNoARLayout = useAR === false;

  return (
    <>
      {screen !== "game" && (
        <>
          {screen === "generator" && (
            <div
              className={
                useCromixNoARLayout
                  ? "cromix-container logicpath-cromix-container"
                  : "laberinto-screen"
              }
            >
              <div
                className={
                  useCromixNoARLayout
                    ? "catalog-screen logicpath-cromix-catalog"
                    : "laberinto-panel laberinto-single-panel laberinto-game-config-panel"
                }
              >
                <AnimatedTitle />

                {useCromixNoARLayout ? (
                  <>
                    <div className="logicpath-cromix-game-identity">
                      <img alt="Cromix" class="game-preview-image" src="/images/juegos/laberinto.png"></img>
                      <span className="game-info-badge">LÓGICA</span>
                    </div>

                    <div className="rules-banner">
                      <h2>LogicPath: Secuencias y Navegación</h2>
                      <p>
                        Construye una secuencia lógica de instrucciones para recorrer el laberinto. Combina movimientos, giros y desplazamientos de forma estratégica hasta encontrar el camino correcto hacia la salida.
                      </p>
                    </div>

                    <div className="difficulty-select-wrapper">
                      <label htmlFor="level-select">
                        Seleccione el nivel de dificultad:
                      </label>
                      <select
                        id="level-select"
                        className="difficulty-select"
                        value={difficulty}
                        onChange={(event) => setDifficulty(event.target.value)}
                      >
                        {Object.entries(LEVEL_CONFIG).map(([value, config]) => (
                          <option key={value} value={value}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="catalog-actions">
                      <button
                        type="button"
                        className="no-rounded-button btn-primary"
                        onClick={() => navigate(-1)}
                      >
                        ← Anterior
                      </button>
                      <button
                        type="button"
                        className="no-rounded-button btn-primary"
                        onClick={handleGeneratorNext}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <ProgressBar currentStep="game" arEnabled={useAR === true} />
                    <h2 className="laberinto-game-config-heading">
                      Configura el juego seleccionando el nivel de dificultad
                    </h2>
                    <div className="laberinto-game-config-layout">
                      <div className="laberinto-game-config-controls">
                        <div className="laberinto-config-section">
                          <label
                            className="laberinto-config-label"
                            htmlFor="level-select"
                          >
                            Seleccione el nivel de dificultad:
                          </label>
                          <select
                            id="level-select"
                            className="laberinto-config-field"
                            value={difficulty}
                            onChange={(event) => setDifficulty(event.target.value)}
                          >
                            {Object.entries(LEVEL_CONFIG).map(([value, config]) => (
                              <option key={value} value={value}>
                                {config.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="lab-screen-actions laberinto-game-config-actions">
                          <button
                            type="button"
                            className="lab-btn"
                            onClick={() =>
                              useAR ? setScreen("ar-summary") : navigate(-1)
                            }
                          >
                            ← Anterior
                          </button>
                          <button
                            type="button"
                            className="lab-btn"
                            onClick={handleGeneratorNext}
                          >
                            Siguiente →
                          </button>
                        </div>
                      </div>
                      <div
                        className="laberinto-config-avatar"
                        role="img"
                        aria-label="Avatar de LogicPath"
                      >
                        <span
                          className="laberinto-config-avatar-character"
                          aria-hidden="true"
                        >
                          {LOGIC_PATH_AVATAR}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {false && screen === "ar" && (
            <section className="ar-config-screen">
              <h2>Configuración de contenido AR</h2>
              <p>Selecciona las etapas y el contenido que verá el jugador.</p>

              <div className="ar-stage-selector">
                {STAGES.map((stageName) => (
                  <label key={stageName}>
                    <input
                      type="checkbox"
                      checked={selectedStages[stageName]}
                      onChange={(event) =>
                        setSelectedStages((current) => ({
                          ...current,
                          [stageName]: event.target.checked,
                        }))
                      }
                    />
                    {stageName}
                  </label>
                ))}
              </div>

              <div className="ar-config-panels">
                {STAGES.filter((stageName) => selectedStages[stageName]).map(
                  (stageName) => {
                    const stage = arConfig[stageName] || { type: "Texto" };
                    return (
                      <article className="ar-config-card" key={stageName}>
                        <h3>{stageName}</h3>
                        <div className="ar-type-buttons">
                          {CONTENT_TYPES.map((type) => (
                            <button
                              type="button"
                              className={stage.type === type ? "active" : ""}
                              key={type}
                              onClick={() => selectContentType(stageName, type)}
                            >
                              {type}
                            </button>
                          ))}
                        </div>

                        {stage.type === "Texto" ? (
                          <input
                            type="text"
                            maxLength={30}
                            placeholder="Mensaje de hasta 30 caracteres"
                            value={stage.value || ""}
                            onChange={(event) =>
                              updateStage(stageName, {
                                type: "Texto",
                                value: event.target.value,
                              })
                            }
                          />
                        ) : (
                          <div className="ar-file-field">
                            <input
                              type="file"
                              accept={FILE_RULES[stage.type].accept}
                              onChange={(event) =>
                                uploadFile(
                                  stageName,
                                  stage.type,
                                  event.target.files[0],
                                )
                              }
                            />
                            {uploadingStage === stageName && (
                              <span>Subiendo...</span>
                            )}
                            {stage.originalName && (
                              <span>{stage.originalName}</span>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  },
                )}
              </div>

              <div className="ar-screen-actions">
                <button
                  type="button"
                  className="btn btn-prev"
                  onClick={backToGenerator}
                >
                  Volver
                </button>
                <button
                  type="button"
                  className="btn btn-next"
                  onClick={goToSummary}
                >
                  Guardar y continuar
                </button>
              </div>
            </section>
          )}

          {screen === "ar" && (
            <div className="laberinto-screen">
              <div className="laberinto-panel laberinto-single-panel laberinto-ra-panel">
                <AnimatedTitle />
                <ProgressBar currentStep="ar" />
                <h2 className="laberinto-ra-heading">
                  Configuración de RA
                </h2>

                <div className="ar-tabs">
                  {STAGES.map((stageName) => (
                    <button
                      type="button"
                      key={stageName}
                      className={`ar-tab ${
                        activeARTab === stageName ? "active" : ""
                      } ${selectedStages?.[stageName] ? "enabled" : ""}`}
                      onClick={() => setActiveARTab(stageName)}
                    >
                      {stageName}
                      {selectedStages?.[stageName] && (
                        <span className="ar-tab-check">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="ar-tab-content">
                  <div className="ar-stage-toggle-row">
                    <label className="ra-stage-toggle">
                      <input
                        type="checkbox"
                        checked={!!selectedStages?.[activeARTab]}
                        onChange={() => toggleARStage(activeARTab)}
                      />
                      <span>Habilitar etapa {activeARTab}</span>
                    </label>
                  </div>

                  {selectedStages[activeARTab] ? (
                    <div className="ar-content-cards">
                      {AR_CONTENT_CARDS.map((card) => {
                        if (card.type === "Texto") {
                          const hasText = Boolean(
                            activeStageConfig.text.trim(),
                          );
                          return (
                            <div
                              className={`ar-content-card ${
                                hasText ? "has-content" : ""
                              }`}
                              key={card.type}
                            >
                              <div className="ar-card-header">
                                <span className="ar-card-icon">
                                  <Player
                                    src={card.icon}
                                    loop
                                    autoplay
                                    style={{ width: 68, height: 68 }}
                                  />
                                </span>
                                <span className="ar-card-title">
                                  {card.title}
                                </span>
                                {hasText && (
                                  <button
                                    type="button"
                                    className="ar-delete-btn"
                                    onClick={() =>
                                      clearStageField(activeARTab, card.field)
                                    }
                                    title="Eliminar texto"
                                  >
                                    X
                                  </button>
                                )}
                              </div>
                              <div className="ar-card-body">
                                <textarea
                                  className="ra-field"
                                  rows={3}
                                  maxLength={120}
                                  placeholder={card.placeholder}
                                  value={activeStageConfig.text}
                                  onChange={(event) =>
                                    updateStage(activeARTab, {
                                      text: event.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          );
                        }

                        const hasFile = Boolean(activeStageConfig[card.urlKey]);
                        const inputId = `laberinto-${card.type}-${activeARTab}`;
                        const loadingKey = `${activeARTab}:${card.type}`;

                        return (
                          <div
                            className={`ar-content-card ${
                              hasFile ? "has-content" : ""
                            }`}
                            key={card.type}
                          >
                            <div className="ar-card-header">
                              <span className="ar-card-icon">
                                <Player
                                  src={card.icon}
                                  loop
                                  autoplay
                                  style={{ width: 68, height: 68 }}
                                />
                              </span>
                              <span className="ar-card-title">
                                {card.title}
                              </span>
                              {hasFile && (
                                <button
                                  type="button"
                                  className="ar-delete-btn"
                                  onClick={() =>
                                    clearStageFile(activeARTab, card.type)
                                  }
                                  title={`Eliminar ${card.title.toLowerCase()}`}
                                >
                                  X
                                </button>
                              )}
                            </div>
                            <div className="ar-card-body">
                              <input
                                id={inputId}
                                className="ar-file-input-hidden"
                                type="file"
                                accept={FILE_RULES[card.type].accept}
                                onChange={(event) =>
                                  uploadFile(
                                    activeARTab,
                                    card.type,
                                    event.target.files?.[0],
                                  )
                                }
                              />
                              <label
                                htmlFor={inputId}
                                className={`ar-file-upload-btn ${
                                  hasFile ? "has-file" : ""
                                }`}
                              >
                                {uploadingField === loadingKey
                                  ? "Preparando archivo..."
                                  : hasFile
                                    ? `${card.selectedIcon} ${card.selectedLabel}`
                                    : `${card.uploadIcon} Seleccionar ${card.title.toLowerCase()}`}
                              </label>
                              {activeStageConfig[card.nameKey] && (
                                <span className="ar-file-name">
                                  {activeStageConfig[card.nameKey]}
                                </span>
                              )}
                              {card.type === "Imagen" && hasFile && (
                                <img
                                  src={normalizeUrl(activeStageConfig.imageUrl)}
                                  alt="Vista previa"
                                  className="ar-preview-image"
                                />
                              )}
                              {card.type === "Audio" && hasFile && (
                                <audio
                                  controls
                                  src={normalizeUrl(activeStageConfig.audioUrl)}
                                  className="ar-preview-audio"
                                />
                              )}
                              {card.type === "Video" && hasFile && (
                                <video
                                  controls
                                  src={normalizeUrl(activeStageConfig.videoUrl)}
                                  className="ar-preview-video"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ar-disabled-message">
                      <p>
                        Habilita esta etapa para configurar contenido de
                        Realidad Aumentada.
                      </p>
                    </div>
                  )}
                </div>

                <div className="ar-screen-actions">
                  <button
                    type="button"
                    className="btn lab-btn"
                    onClick={() => navigate(-1)}
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    className="btn lab-btn"
                    onClick={goToSummary}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          )}

          {screen === "ar-summary" && (
            <div className="laberinto-screen">
              <div className="laberinto-panel laberinto-single-panel laberinto-ra-panel laberinto-ra-summary-panel">
                <AnimatedTitle />
                <ProgressBar currentStep="ar-summary" />
                <h2 className="laberinto-ra-heading laberinto-ra-summary-heading">
                  Resumen de Configuración RA
                </h2>
                <div className="laberinto-ra-summary-grid">
                  {STAGES.map((stageName) => {
                    const enabled = !!selectedStages[stageName];
                    const stage = normalizeStageConfig(arConfig[stageName]);
                    const items = [
                      stage.text && {
                        icon: "📝",
                        label: "Texto configurado",
                      },
                      stage.imageUrl && {
                        icon: "🖼️",
                        label: "Imagen configurada",
                      },
                      stage.audioUrl && {
                        icon: "🎵",
                        label: "Audio configurado",
                      },
                      stage.videoUrl && {
                        icon: "🎬",
                        label: "Video configurado",
                      },
                    ].filter(Boolean);

                    return (
                      <article
                        key={stageName}
                        className={`laberinto-ra-summary-card ${
                          enabled ? "is-enabled" : "is-disabled"
                        }`}
                      >
                        <header className="laberinto-ra-summary-card-header">
                          <strong>{stageName}</strong>
                          <span className="laberinto-ra-summary-status">
                            {enabled ? "Habilitada" : "Deshabilitada"}
                          </span>
                        </header>
                        <div className="laberinto-ra-summary-card-body">
                          {!enabled && (
                            <p className="laberinto-ra-summary-empty">
                              No habilitada.
                            </p>
                          )}
                          {enabled && items.length === 0 && (
                            <p className="laberinto-ra-summary-empty">
                              Sin contenido configurado.
                            </p>
                          )}
                          {enabled &&
                            items.map((item) => (
                              <div
                                key={item.label}
                                className="laberinto-ra-summary-item"
                              >
                                <span aria-hidden="true">{item.icon}</span>
                                <span>{item.label}</span>
                              </div>
                            ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="ar-screen-actions laberinto-ra-summary-actions">
                  <button
                    type="button"
                    className="btn lab-btn"
                    onClick={() => setScreen("ar")}
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    className="btn lab-btn"
                    onClick={() => setScreen("generator")}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          )}

          {screen === "game-summary" && (
            <div className="laberinto-screen">
              <div className="laberinto-panel laberinto-single-panel">
                <SummaryPanel
                  config={{
                    level: difficulty,
                    exerciseCount: LEVEL_CONFIG[difficulty].showCount,
                  }}
                  arEnabled={useAR === true}
                  arSelectedStages={
                    useAR === true
                      ? selectedStages
                      : { Inicio: false, Acierto: false, Final: false }
                  }
                  arConfig={useAR === true ? arConfig : {}}
                  onBack={() => setScreen("game")}
                  state={location.state}
                />
              </div>
            </div>
          )}
        </>
      )}

      {screen === "game" && (
        <div
          className={
            useCromixNoARLayout
              ? "cromix-container logicpath-cromix-container"
              : "laberinto-screen"
          }
        >
          <div
            className={
              useCromixNoARLayout
                ? "game-screen logicpath-cromix-game"
                : "laberinto-panel laberinto-single-panel game"
            }
          >
            <AnimatedTitle />
            {useCromixNoARLayout && (
              <h3 className="laberinto-preview-label">(Vista Previa)</h3>
            )}
            <div className="rules-section">
              <span className="rules-label">📋 Reglas Basicas</span>
              <span className="rules-text">
                Combina instrucciones y cantidades para llevar al avatar desde I
                hasta F por la ruta optima.
              </span>
            </div>

            <div className="instructions-bar">
              <button
                type="button"
                className="btn btn-instructions"
                onClick={() => setInstructionsOpen(true)}
              >
                Instrucciones
              </button>
              <div className="instruction-cards">
                {Object.entries(INSTRUCTION_INFO).map(([type, info]) => (
                  <button
                    type="button"
                    className={`inst-card ${draggedInstructionType === type ? "dragging" : ""}`}
                    key={type}
                    onClick={() => addInstruction(type)}
                    draggable={isPlaying && !isAnimating}
                    onDragStart={(event) =>
                      handleInstructionDragStart(event, type)
                    }
                    onDragEnd={handleInstructionDragEnd}
                    aria-label={`${info.label}. Arrastra al pseudocódigo o pulsa para agregar.`}
                  >
                    <span className="inst-var">{info.variable} ← ___</span>
                    <span className="inst-label">{info.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="game-layout">
              <div className="pseudo-panel">
                <div className="panel-header">Pseudocódigo</div>
                <div
                  className={`pseudo-body ${isPseudoDropActive ? "drop-active" : ""}`}
                  onDragOver={handlePseudoDragOver}
                  onDragLeave={handlePseudoDragLeave}
                  onDrop={handlePseudoDrop}
                >
                  <div className="pseudo-line algo-start">Algoritmo</div>
                  {instructions.length === 0 && (
                    <div className="pseudo-drop-hint">
                      Arrastra una instrucción aquí
                    </div>
                  )}
                  {instructions.map((instruction, index) => {
                    const info = INSTRUCTION_INFO[instruction.type];
                    return (
                      <div
                        className="pseudo-line inst-line"
                        key={`${index}-${instruction.type}`}
                      >
                        <span className="line-num">{index + 1}</span>
                        <span className="assign-var">{info.variable}</span> ←
                        <input
                          className="assign-val-input"
                          type="number"
                          min="1"
                          max="20"
                          value={instruction.value}
                          onChange={(event) =>
                            updateInstruction(index, event.target.value)
                          }
                        />
                        <span className="action-text">{info.label}</span>
                        <button
                          type="button"
                          className="remove-inst-btn"
                          title="Eliminar"
                          onClick={() =>
                            setInstructions((current) =>
                              current.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                        >
                          X
                        </button>
                      </div>
                    );
                  })}
                  <div className="pseudo-line algo-end">FinAlgoritmo</div>
                </div>
                <div className="pseudo-actions">
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() =>
                      setInstructions((current) => current.slice(0, -1))
                    }
                  >
                    X Borrar última
                  </button>
                  <button
                    type="button"
                    className="btn btn-small btn-warning"
                    onClick={() => setInstructions([])}
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div
                className={`maze-panel ${isAnimating ? "animating" : ""}`}
                ref={mazePanelRef}
              >
                <canvas id="maze-canvas" ref={canvasRef} />
              </div>

              <div className="progress-panel">
                <div className="panel-header">Progreso</div>
                <div className="progress-info">
                  <div className="info-row">
                    <span className="info-label">Nivel:</span>
                    <span className="info-value">{level.label}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ejercicio:</span>
                    <span className="info-value">
                      {currentExercise + 1} de {exercises.length}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Oportunidades:</span>
                    <span className="info-value">
                      {attemptsLeft} de {level.attempts}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Puntaje:</span>
                    <span className="info-value">{score}</span>
                  </div>
                </div>
                <div className="action-buttons">
                  <button
                    type="button"
                    className="btn btn-validate"
                    disabled={!isPlaying || isAnimating}
                    onClick={validateSolution}
                  >
                    Validar solución
                  </button>
                  <button
                    type="button"
                    className="btn btn-finish"
                    disabled={isAnimating}
                    onClick={finishGame}
                  >
                    Finalizar juego
                  </button>
                </div>
              </div>
            </div>

            <div
              className={useCromixNoARLayout ? "nav-footer" : "enc-btn-group"}
              style={useCromixNoARLayout ? undefined : { marginTop: "1.5rem" }}
            >
              <button
                type="button"
                className={
                  useCromixNoARLayout
                    ? "no-rounded-button btn-primary"
                    : "enc-btn"
                }
                onClick={backToGenerator}
                style={
                  useCromixNoARLayout
                    ? undefined
                    : { margin: 0, background: "#1f2937" }
                }
              >
                ← Anterior
              </button>
              <button
                type="button"
                className={
                  useCromixNoARLayout
                    ? "no-rounded-button btn-primary"
                    : "enc-btn primary"
                }
                onClick={finishConfiguration}
                style={useCromixNoARLayout ? undefined : { margin: 0 }}
              >
                Terminar configuración →
              </button>
            </div>
          </div>
        </div>
      )}

      {choiceOpen && <ChoiceModal onChoose={chooseAR} />}

      {instructionsOpen && (
        <div className="popup" onClick={() => setInstructionsOpen(false)}>
          <div
            className="popup-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="popup-close"
              onClick={() => setInstructionsOpen(false)}
            >
              ×
            </button>
            <h3>Cómo jugar</h3>
            <ul>
              <li>
                Arrastra una tarjeta a la sección de pseudocódigo o haz clic en
                ella para agregarla al algoritmo.
              </li>
              <li>
                <strong>A &larr; valor</strong>: Mover hacia arriba (&#8593;) el
                numero de cuadros indicado.
              </li>
              <li>
                <strong>B &larr; valor</strong>: Mover hacia abajo (&#8595;) el
                numero de cuadros indicado.
              </li>
              <li>
                <strong>I &larr; valor</strong>: Mover hacia la izquierda
                (&#8592;) el numero de cuadros indicado.
              </li>
              <li>
                <strong>D &larr; valor</strong>: Mover hacia la derecha
                (&#8594;) el numero de cuadros indicado.
              </li>
              <li>
                Edita la cantidad directamente en el panel de pseudocodigo.
              </li>
              <li>
                Pulsa <em>Validar Solucion</em> para comprobar si tu camino
                llega a la salida.
              </li>
              <li>
                Puedes eliminar instrucciones con el boton X o limpiar todo.
              </li>
            </ul>
          </div>
        </div>
      )}

      {result && (
        <ResultModal
          result={result}
          attemptsLeft={attemptsLeft}
          score={score}
          currentExercise={currentExercise}
          totalExercises={exercises.length}
          level={difficulty}
          onAction={handleResultAction}
        />
      )}
    </>
  );
}
