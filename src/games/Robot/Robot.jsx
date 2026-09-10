import React, { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import { useLocation, useNavigate } from "react-router-dom";
import { buildNativeTemplatePackage } from "../../utils/nativeTemplatePackaging";
import {
  AR_CONFIGURATION_CLEARED_EVENT,
  clearARConfigurationsAfterDownload,
} from "../../utils/arConfigurationStorage";
import {
  LogicPathARConfigurator,
  LogicPathARSummary,
  LogicPathConfigurationSummary,
  LogicPathProgress,
  LogicPathStageModal,
  LogicPathTitle,
} from "../Shared/LogicPathFlow";
import { showInitialARInPreview } from "../Shared/arPreviewFlow";
import {
  buildGeneratedPreviewHeader,
  GENERATED_PREVIEW_HEADER_STYLES,
} from "../Shared/generatedPreviewParity";
import {
  Bot,
  Flag,
  Package,
  Play,
  RotateCcw,
  Star,
  Trash2,
  Type,
} from "lucide-react";

const STAGES = ["Inicio", "Acierto", "Final"];

const EMPTY_STAGE = {
  type: "Texto",
  text: "",
  imageUrl: "",
  imageName: "",
  audioUrl: "",
  audioName: "",
  videoUrl: "",
  videoName: "",
};

const LEVELS = {
  basico: {
    label: "Básico",
    attempts: 3,
    showCount: 3,
    points: 10,
    exercises: [
      {
        id: 1,
        name: "Primeros pasos",
        description: "El robot debe avanzar en linea recta hasta la meta.",
        grid: [["S", ".", ".", ".", "E"]],
        expectedSteps: 4,
        objects: [],
      },
      {
        id: 2,
        name: "Camino corto",
        description: "El robot debe avanzar en linea recta hasta llegar al final.",
        grid: [["S", ".", ".", ".", ".", "E"]],
        expectedSteps: 5,
        objects: [],
      },
      {
        id: 3,
        name: "Camino largo",
        description: "El robot debe recorrer todo el camino recto hasta la meta.",
        grid: [["S", ".", ".", ".", ".", ".", "E"]],
        expectedSteps: 6,
        objects: [],
      },
      {
        id: 4,
        name: "Paseo sencillo",
        description: "Avanza por el sendero recto hasta llegar al destino.",
        grid: [["S", ".", ".", ".", ".", ".", ".", "E"]],
        expectedSteps: 7,
        objects: [],
      },
      {
        id: 5,
        name: "Ruta directa",
        description: "Lleva al robot por el camino directo hacia la meta.",
        grid: [["S", ".", ".", ".", "E"]],
        expectedSteps: 4,
        objects: [],
      },
      {
        id: 6,
        name: "Marcha simple",
        description: "El robot marcha en linea recta sin detenerse.",
        grid: [["S", ".", ".", ".", ".", ".", ".", ".", "E"]],
        expectedSteps: 8,
        objects: [],
      },
    ],
  },
  intermedio: {
    label: "Intermedio",
    attempts: 2,
    showCount: 4,
    points: 20,
    exercises: [
      {
        id: 7,
        name: "Dos paquetes",
        description: "Avanza en linea recta y recoge los dos objetos del camino.",
        grid: [["S", ".", "O", ".", "O", ".", "E"]],
        expectedSteps: 6,
        objects: [
          { row: 0, col: 2, type: "box" },
          { row: 0, col: 4, type: "box" },
        ],
      },
      {
        id: 8,
        name: "Recorrido medio",
        description: "El robot camina recogiendo los objetos hasta la meta.",
        grid: [["S", ".", ".", "O", ".", "O", ".", ".", "E"]],
        expectedSteps: 8,
        objects: [
          { row: 0, col: 3, type: "star" },
          { row: 0, col: 5, type: "star" },
        ],
      },
      {
        id: 9,
        name: "Tres estrellas",
        description: "Recoge las tres estrellas del camino recto.",
        grid: [["S", "O", ".", "O", ".", "O", ".", "E"]],
        expectedSteps: 7,
        objects: [
          { row: 0, col: 1, type: "star" },
          { row: 0, col: 3, type: "star" },
          { row: 0, col: 5, type: "star" },
        ],
      },
      {
        id: 10,
        name: "Paquetes y estrellas",
        description: "Recoge los tres objetos antes de llegar a la meta.",
        grid: [["S", ".", "O", ".", ".", "O", ".", "O", ".", "E"]],
        expectedSteps: 9,
        objects: [
          { row: 0, col: 2, type: "box" },
          { row: 0, col: 5, type: "star" },
          { row: 0, col: 7, type: "box" },
        ],
      },
      {
        id: 11,
        name: "Doble recoleccion",
        description: "Recoge los paquetes dispersos en el camino.",
        grid: [["S", ".", ".", "O", ".", ".", "O", ".", "E"]],
        expectedSteps: 8,
        objects: [
          { row: 0, col: 3, type: "box" },
          { row: 0, col: 6, type: "box" },
        ],
      },
      {
        id: 12,
        name: "Estrellas dispersas",
        description: "Avanza recogiendo tres estrellas repartidas.",
        grid: [["S", ".", "O", ".", ".", "O", ".", ".", "O", "E"]],
        expectedSteps: 9,
        objects: [
          { row: 0, col: 2, type: "star" },
          { row: 0, col: 5, type: "star" },
          { row: 0, col: 8, type: "star" },
        ],
      },
      {
        id: 13,
        name: "Camino con tesoros",
        description: "Recoge dos objetos mientras avanzas hasta la meta.",
        grid: [["S", ".", "O", ".", ".", ".", "O", ".", "E"]],
        expectedSteps: 8,
        objects: [
          { row: 0, col: 2, type: "box" },
          { row: 0, col: 6, type: "star" },
        ],
      },
      {
        id: 14,
        name: "Triple recogida",
        description: "Recoge los tres objetos consecutivos del camino.",
        grid: [["S", ".", ".", "O", "O", "O", ".", ".", "E"]],
        expectedSteps: 8,
        objects: [
          { row: 0, col: 3, type: "box" },
          { row: 0, col: 4, type: "star" },
          { row: 0, col: 5, type: "box" },
        ],
      },
    ],
  },
  avanzado: {
    label: "Avanzado",
    attempts: 1,
    showCount: 5,
    points: 30,
    exercises: [
      {
        id: 15,
        name: "Recorrido con cuatro objetos",
        description: "Avanza en linea recta recogiendo los cuatro objetos.",
        grid: [["S", ".", "O", ".", "O", ".", "O", ".", "O", ".", "E"]],
        expectedSteps: 10,
        objects: [
          { row: 0, col: 2, type: "star" },
          { row: 0, col: 4, type: "star" },
          { row: 0, col: 6, type: "star" },
          { row: 0, col: 8, type: "star" },
        ],
      },
      {
        id: 16,
        name: "Cinco estrellas",
        description: "Recoge las cinco estrellas en el camino largo.",
        grid: [["S", "O", ".", "O", ".", ".", "O", ".", "O", ".", "O", ".", "E"]],
        expectedSteps: 12,
        objects: [
          { row: 0, col: 1, type: "star" },
          { row: 0, col: 3, type: "star" },
          { row: 0, col: 6, type: "star" },
          { row: 0, col: 8, type: "star" },
          { row: 0, col: 10, type: "star" },
        ],
      },
      {
        id: 17,
        name: "Camino mixto",
        description: "Recoge cinco objetos variados antes de llegar a la meta.",
        grid: [["S", ".", "O", ".", "O", ".", ".", "O", "O", ".", "O", ".", "E"]],
        expectedSteps: 12,
        objects: [
          { row: 0, col: 2, type: "box" },
          { row: 0, col: 4, type: "star" },
          { row: 0, col: 7, type: "star" },
          { row: 0, col: 8, type: "box" },
          { row: 0, col: 10, type: "star" },
        ],
      },
      {
        id: 18,
        name: "Desafio largo",
        description: "Recoge seis objetos en este largo camino.",
        grid: [["S", "O", ".", "O", ".", "O", ".", ".", "O", ".", "O", ".", "O", ".", "E"]],
        expectedSteps: 14,
        objects: [
          { row: 0, col: 1, type: "star" },
          { row: 0, col: 3, type: "star" },
          { row: 0, col: 5, type: "box" },
          { row: 0, col: 8, type: "star" },
          { row: 0, col: 10, type: "star" },
          { row: 0, col: 12, type: "star" },
        ],
      },
      {
        id: 19,
        name: "Desafio final",
        description: "El camino mas largo: recoge todos los objetos.",
        grid: [["S", ".", "O", "O", ".", ".", "O", ".", "O", ".", ".", "O", ".", "O", ".", "E"]],
        expectedSteps: 15,
        objects: [
          { row: 0, col: 2, type: "star" },
          { row: 0, col: 3, type: "box" },
          { row: 0, col: 6, type: "star" },
          { row: 0, col: 8, type: "star" },
          { row: 0, col: 11, type: "box" },
          { row: 0, col: 13, type: "star" },
        ],
      },
      {
        id: 20,
        name: "Cuatro estrellas",
        description: "Recoge las cuatro estrellas colocadas en el recorrido.",
        grid: [["S", ".", ".", "O", ".", "O", ".", ".", "O", ".", "O", "E"]],
        expectedSteps: 11,
        objects: [
          { row: 0, col: 3, type: "star" },
          { row: 0, col: 5, type: "star" },
          { row: 0, col: 8, type: "star" },
          { row: 0, col: 10, type: "star" },
        ],
      },
      {
        id: 21,
        name: "Tesoros escondidos",
        description: "Encuentra y recoge cinco tesoros del camino.",
        grid: [["S", ".", "O", ".", ".", "O", ".", "O", ".", ".", "O", ".", "O", "E"]],
        expectedSteps: 13,
        objects: [
          { row: 0, col: 2, type: "box" },
          { row: 0, col: 5, type: "star" },
          { row: 0, col: 7, type: "star" },
          { row: 0, col: 10, type: "box" },
          { row: 0, col: 12, type: "star" },
        ],
      },
      {
        id: 22,
        name: "Ruta de estrellas",
        description: "Recoge las seis estrellas a lo largo del camino.",
        grid: [["S", ".", "O", ".", "O", ".", ".", "O", ".", "O", ".", "O", ".", "O", "E"]],
        expectedSteps: 14,
        objects: [
          { row: 0, col: 2, type: "star" },
          { row: 0, col: 4, type: "star" },
          { row: 0, col: 7, type: "star" },
          { row: 0, col: 9, type: "star" },
          { row: 0, col: 11, type: "star" },
          { row: 0, col: 13, type: "star" },
        ],
      },
      {
        id: 23,
        name: "Colección variada",
        description: "Recoge los cuatro objetos diferentes en el camino largo.",
        grid: [["S", ".", "O", ".", ".", ".", "O", ".", "O", ".", ".", "O", ".", "E"]],
        expectedSteps: 13,
        objects: [
          { row: 0, col: 2, type: "box" },
          { row: 0, col: 6, type: "star" },
          { row: 0, col: 8, type: "star" },
          { row: 0, col: 11, type: "box" },
        ],
      },
      {
        id: 24,
        name: "Gran expedición",
        description: "La expedición más larga: recoge los cinco objetos.",
        grid: [["S", "O", ".", ".", "O", ".", "O", ".", ".", "O", ".", ".", "O", ".", ".", "E"]],
        expectedSteps: 15,
        objects: [
          { row: 0, col: 1, type: "star" },
          { row: 0, col: 4, type: "star" },
          { row: 0, col: 6, type: "box" },
          { row: 0, col: 9, type: "star" },
          { row: 0, col: 12, type: "star" },
        ],
      },
    ],
  },
};

const INSTRUCTIONS = [
  { id: "inicio", label: "Inicio", kind: "marker" },
  { id: "avanzar", label: "Avanzar", kind: "move", paramDefault: 2 },
  { id: "recoger", label: "Recoger", kind: "collect" },
  { id: "fin", label: "Fin", kind: "marker" },
];

const ROBOT_MOTION_TIMINGS = {
  step: 650,
  collect: 900,
  jump: 1200,
  greeting: 650,
};

const FILE_RULES = {
  Imagen: {
    accept: "image/*",
    maxSize: 5 * 1024 * 1024,
    urlKey: "imageUrl",
    nameKey: "imageName",
    label: "imagen",
  },
  Audio: {
    accept: "audio/*",
    maxSize: 10 * 1024 * 1024,
    urlKey: "audioUrl",
    nameKey: "audioName",
    label: "audio",
  },
  Video: {
    accept: "video/*",
    maxSize: 35 * 1024 * 1024,
    urlKey: "videoUrl",
    nameKey: "videoName",
    label: "video",
  },
};

function createEmptyARConfig() {
  return STAGES.reduce((acc, stage) => {
    acc[stage] = { ...EMPTY_STAGE };
    return acc;
  }, {});
}

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function shuffleItems(items) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function pickExercises(levelKey) {
  const level = LEVELS[levelKey] || LEVELS.basico;
  return shuffleItems(level.exercises).slice(0, level.showCount);
}

function objectKey(object) {
  return `${object.row}:${object.col}:${object.type}`;
}

function findStartColumn(exercise) {
  const row = exercise?.grid?.[0] || [];
  const index = row.findIndex((cell) => cell === "S");
  return index >= 0 ? index : 0;
}

function normalizeStageConfig(stage = {}) {
  return { ...EMPTY_STAGE, ...stage };
}

function hasStageContent(stage = {}) {
  const normalized = normalizeStageConfig(stage);
  return Boolean(
    normalized.text ||
      normalized.imageUrl ||
      normalized.audioUrl ||
      normalized.videoUrl,
  );
}

function dataUrlFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getObjectLabel(type) {
  return type === "star" ? "STAR" : "BOX";
}

function getObjectIcon(type) {
  return type === "star" ? <Star size={22} /> : <Package size={22} />;
}

function buildHintSequence(exercise) {
  const sortedObjects = [...(exercise?.objects || [])].sort((a, b) => a.col - b.col);
  const endCol = (exercise?.grid?.[0] || []).findIndex((cell) => cell === "E");
  let currentCol = findStartColumn(exercise);
  const sequence = [{ id: "inicio", label: "Inicio", kind: "marker" }];

  sortedObjects.forEach((object) => {
    const steps = object.col - currentCol;
    if (steps > 0) {
      sequence.push({
        id: "avanzar",
        label: "Avanzar",
        kind: "move",
        param: steps,
      });
    }
    sequence.push({ id: "recoger", label: "Recoger", kind: "collect" });
    currentCol = object.col;
  });

  if (endCol > currentCol) {
    sequence.push({
      id: "avanzar",
      label: "Avanzar",
      kind: "move",
      param: endCol - currentCol,
    });
  }

  sequence.push({ id: "fin", label: "Fin", kind: "marker" });
  return sequence;
}

const GENERATED_ROBOT_ASSETS = {
  walking: "/games/robot/Imagen/camina.gif",
  greeting: "/games/robot/Imagen/saludar.gif",
  success: "/games/robot/Imagen/salto.gif",
};

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer la animación del robot."));
    reader.readAsDataURL(blob);
  });
}

async function loadGeneratedRobotAssets() {
  const publicBase = String(process.env.PUBLIC_URL || "").replace(/\/$/, "");
  const entries = await Promise.all(
    Object.entries(GENERATED_ROBOT_ASSETS).map(async ([name, path]) => {
      try {
        const response = await fetch(`${publicBase}${path}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return [name, await blobToDataUrl(await response.blob())];
      } catch (error) {
        console.warn(`No se pudo incorporar la animación ${name} al HTML de Robot Walking.`, error);
        return [name, ""];
      }
    }),
  );
  return Object.fromEntries(entries);
}

export function buildGeneratedHtml(payload) {
  const safePayload = JSON.stringify(payload).replace(/<\//g, "<\\/");
  const previewHeader = buildGeneratedPreviewHeader({
    title: "Robot Walking",
    symbols: ["S", "M", "P", "E"],
  });

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(payload.fullConfig.nombreApp || "Robot Walking")}</title>
  <style>${generatedRobotStyles}\n${robotStyles}\n${GENERATED_PREVIEW_HEADER_STYLES}</style>
</head>
<body>
  <section id="start-screen" class="launch-overlay" aria-labelledby="start-title">
    <h1 id="start-title" class="start-title">Robot Walking</h1>
    <div class="start-level-pill">Nivel: <span id="start-level"></span></div>
    <div class="start-actions">
      <button id="start-game-btn" class="big-btn" type="button">▶ Iniciar Juego</button>
      <button id="show-info-btn" class="big-btn btn-info" type="button">ℹ Información</button>
    </div>
  </section>

  <section id="countdown-screen" class="launch-overlay hidden" aria-live="polite">
    <div id="countdown-display" class="countdown-number">5</div>
  </section>

  <section id="info-overlay" class="launch-overlay info-overlay hidden" aria-hidden="true">
    <article class="info-modal-content" role="dialog" aria-modal="true" aria-labelledby="info-title">
      <button id="close-info-icon" class="close-info-btn" type="button" aria-label="Cerrar información">&times;</button>
      <header class="info-header">
        <h2 id="info-title" class="info-title">Robot Walking</h2>
        <p class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</p>
      </header>
      <div class="info-details-grid">
        <div class="info-item"><span class="metadata-label">Autor</span><span class="metadata-value" id="info-author"></span></div>
        <div class="info-item"><span class="metadata-label">Versión</span><span class="metadata-value" id="info-version"></span></div>
        <div class="info-item"><span class="metadata-label">Fecha</span><span class="metadata-value" id="info-date"></span></div>
        <div class="info-item"><span class="metadata-label">Nivel</span><span class="metadata-value" id="info-level"></span></div>
        <div class="info-item info-item-wide"><span class="metadata-label">Descripción</span><span class="metadata-value metadata-description" id="info-description"></span></div>
        <div class="info-item info-item-wide"><span class="metadata-label">Plataformas</span><span class="metadata-value" id="info-platforms"></span></div>
      </div>
      <div class="info-close-action">
        <button id="close-info-btn" class="big-btn" type="button">Cerrar</button>
      </div>
    </article>
  </section>

  <div class="robot-root" data-preview-parity="robot-walking">
    <main id="game-screen" class="robot-play-screen hidden">
      <section class="robot-game-panel">
        ${previewHeader}
        <div class="robot-game-head">
          <div>
            <h2 id="exercise-name">Robot Walking</h2>
            <p id="rules-text"><strong>Reglas básicas:</strong> ${escapeHtml(payload.fullConfig.descripcion || "Observa el recorrido del robot y ordena correctamente las instrucciones.")}</p>
          </div>
          <div class="robot-level-pill">${escapeHtml(LEVELS[payload.level]?.label || payload.level || "Básico")}</div>
        </div>
        <div class="robot-game-layout">
          <aside class="robot-side-panel robot-sequence-column instructions-panel">
            <div class="robot-panel-header">Instrucciones</div>
            <div class="robot-sequence-drop-zone drop-zone" id="sequence-drop-zone" aria-label="Secuencia de instrucciones"></div>
            <button class="robot-btn compact secondary" id="btn-hint" type="button">Usar pista</button>
          </aside>
          <section class="robot-center-column center-area">
            <div class="robot-source-panel">
              <div class="robot-panel-header">Instrucciones a usar</div>
              <div class="robot-instruction-list robot-source-instructions puzzle-pieces-row" id="puzzle-pieces-row" aria-label="Fichas disponibles"></div>
            </div>
            <div class="robot-center-panel board-area">
              <div class="game-grid robot-board" id="game-grid"></div>
            </div>
          </section>
          <aside class="robot-side-panel progress-panel">
            <div class="robot-panel-header">Progreso</div>
            <div class="robot-progress-info progress-info">
              <div><span>Ejercicio</span><strong id="exercise-display"></strong></div>
              <div><span>Intentos</span><strong id="attempts-display">0</strong></div>
              <div><span>Puntaje</span><strong id="score-display">0</strong></div>
              <div><span>Objetos</span><strong id="objects-display">0/0</strong></div>
            </div>
            <div class="robot-action-stack action-buttons">
              <button class="robot-btn primary btn-validate" id="btn-validate">Probar solución</button>
              <button class="robot-btn secondary" id="btn-reset">Reiniciar</button>
              <button class="robot-btn dark btn-finish" id="btn-finish">Finalizar juego</button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  </div>
  <script>
    window.ROBOT_GENERATED = ${safePayload};
${generatedRobotScript}
  </script>
</body>
</html>`;
}

function AnimatedTitle() {
  return (
    <LogicPathTitle title="Robot Walking" symbols={["S", "M", "P", "E"]} />
  );
}

function ProgressBar({ currentStep, arEnabled }) {
  return <LogicPathProgress currentStep={currentStep} arEnabled={arEnabled} />;
}

function StageModal({
  stageName,
  stage,
  confirmButtonText,
  cancelButtonText,
  showCancelButton,
  onConfirm,
  onCancel,
}) {
  return (
    <LogicPathStageModal
      stageName={stageName}
      stage={stage}
      symbols={["S", "M", "P", "E", "→", "✦"]}
      confirmButtonText={confirmButtonText}
      cancelButtonText={cancelButtonText}
      showCancelButton={showCancelButton}
      showStageLabel={false}
      previewStyle
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

function ResultModal({ result, onAction }) {
  const content = {
    success: {
      title: "¡Juego completado!",
      message: `Puntos obtenidos: ${result.points}`,
      actions: [
        ["close", "Salir", "secondary"],
        ["continue", "Siguiente ejercicio", "primary"],
      ],
    },
    complete: {
      title: "¡Juego completado!",
      message: `Puntaje global: ${result.points}`,
      actions: [
        ["close", "Salir", "secondary"],
        ["finish-level", "Finalizar", "primary"],
      ],
    },
    fail: {
      title: "¡Solución incorrecta!",
      message: `Intentos restantes: ${result.attemptsRemaining}`,
      actions: [
        ["close", "Salir", "secondary"],
        ["retry", "Reintentar", "primary"],
      ],
    },
    noAttempts: {
      title: "Sin intentos",
      message: "Sin intentos restantes. Puntos obtenidos: 0",
      actions: [
        ["close", "Salir", "secondary"],
        [result.isLast ? "finish-level" : "continue", result.isLast ? "Finalizar" : "Siguiente ejercicio", "primary"],
      ],
    },
    finish: {
      title: "Juego finalizado",
      message: `Puntaje final: ${result.points}`,
      actions: [["generator", "Cerrar", "primary"]],
    },
  }[result.type];

  return (
    <div className="robot-modal-backdrop">
      <div className={`robot-result-modal ${result.type}`}>
        <div className="robot-result-icon">
          {result.type === "fail" || result.type === "noAttempts" ? "!" : "✓"}
        </div>
        <h3>{content.title}</h3>
        <p>{content.message}</p>
        <div className="robot-modal-actions">
          {content.actions.map(([action, label, variant]) => (
            <button
              type="button"
              key={action}
              className={`robot-btn ${variant}`}
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

function SummaryPanel({
  difficulty,
  selectedExercises,
  score,
  arEnabled,
  selectedStages,
  arConfig,
  onBack,
  state,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Listo para generar");

  const gameDetails = state?.gameDetails || {};
  const selectedPlatforms = state?.selectedPlatforms || [];
  const hasAndroid = selectedPlatforms.some(
    (platform) => String(platform).trim().toLowerCase() === "android",
  );
  const hasIOS = selectedPlatforms.some(
    (platform) => String(platform).trim().toLowerCase() === "ios",
  );
  const hasWeb =
    selectedPlatforms.length === 0 ||
    selectedPlatforms.some(
      (platform) => String(platform).trim().toLowerCase() === "web",
    );

  const buildFullConfig = () => ({
    gameType: "robot",
    nivel: difficulty,
    nombreApp: gameDetails.gameName || "Robot Walking",
    autor: gameDetails.authorName || "",
    version: gameDetails.version || "1.0.0",
    fecha: gameDetails.date || new Date().toISOString(),
    descripcion:
      gameDetails.description ||
      "Programa una secuencia para que el robot avance, recoja objetos y llegue a la meta.",
    plataformas: selectedPlatforms.length ? selectedPlatforms : ["web"],
    puntaje: score,
    ejercicios: selectedExercises.map((exercise) => exercise.id),
    ar: arEnabled
      ? {
          enabled: true,
          selectedStages,
          stages: arConfig,
        }
      : { enabled: false, selectedStages: {}, stages: {} },
  });

  const handleDownloadZip = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(10);
    setStatusText("Generando configuración...");

    try {
      const fullConfig = buildFullConfig();
      setStatusText("Preparando animaciones del robot...");
      const robotAssets = await loadGeneratedRobotAssets();
      const htmlContent = buildGeneratedHtml({
        fullConfig,
        level: difficulty,
        exercises: selectedExercises,
        arEnabled,
        selectedStages: arEnabled ? selectedStages : {},
        arConfig: arEnabled ? arConfig : createEmptyARConfig(),
        robotAssets,
      });

      const zip = new JSZip();
      const folder = zip.folder("RobotWalking");
      if (hasWeb) {
        folder.file("index.html", htmlContent);
        folder.file("robot-config.json", JSON.stringify(fullConfig, null, 2));
      }
      setProgress(45);

      if (hasAndroid) {
        const androidContent = await buildNativeTemplatePackage({
          templateUrl: "/templates/robot_android.zip",
          platform: "android",
          configFileName: "robot-config.json",
          config: fullConfig,
          arEnabled,
          replaceIndex: false
        });
        folder.file("robot_android.zip", androidContent);
      }

      if (hasIOS) {
        const iosContent = await buildNativeTemplatePackage({
          templateUrl: "/templates/robot_ios.zip",
          platform: "ios",
          configFileName: "robot-config.json",
          config: fullConfig,
          arEnabled,
          replaceIndex: false
        });
        folder.file("robot_ios.zip", iosContent);
      }

      setStatusText("Comprimiendo paquete...");
      setProgress(85);
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `robot-walking-${difficulty}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      clearARConfigurationsAfterDownload();

      setProgress(100);
      setStatusText("Descarga iniciada");
      window.setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 1400);
    } catch (error) {
      console.error("Error generando el ZIP de Robot:", error);
      setStatusText(error.message || "Error al generar el archivo");
      setIsGenerating(false);
    }
  };

  return (
    <LogicPathConfigurationSummary
      gameDetails={gameDetails}
      selectedPlatforms={selectedPlatforms}
      selectedAreas={state?.selectedAreas || []}
      selectedSkills={state?.selectedSkills || []}
      parameters={[
        { icon: <Type size={18} />, label: "Nivel", value: LEVELS[difficulty]?.label },
        { icon: <Package size={18} />, label: "Ejercicios", value: selectedExercises.length },
      ]}
      arEnabled={arEnabled}
      isGenerating={isGenerating}
      progress={progress}
      statusText={statusText}
      downloadDescription="Genera el archivo .zip listo para descargar en su computadora."
      downloadButtonLabel="Generar (.zip)"
      showDownloadPlatforms
      className="robot-configuration-summary"
      onBack={onBack}
      onDownload={handleDownloadZip}
    />
  );
}

function Robot({ withRA = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [useAR, setUseAR] = useState(withRA === true);
  const [screen, setScreen] = useState(withRA === true ? "ar" : "generator");
  const [difficulty, setDifficulty] = useState("basico");
  const [selectedStages, setSelectedStages] = useState(() =>
    readStorage("selectedRobotStages", {
      Inicio: false,
      Acierto: false,
      Final: false,
    }),
  );
  const [arConfig, setArConfig] = useState(() =>
    readStorage("robotARConfig", createEmptyARConfig()),
  );
  const [activeARTab, setActiveARTab] = useState("Inicio");
  const [notification, setNotification] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [robotCol, setRobotCol] = useState(0);
  const [collectedKeys, setCollectedKeys] = useState([]);
  const [attemptsRemaining, setAttemptsRemaining] = useState(LEVELS.intermedio.attempts);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [robotMotion, setRobotMotion] = useState("greeting");
  const [collectingObjectType, setCollectingObjectType] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [result, setResult] = useState(null);
  const [stageModal, setStageModal] = useState(null);

  const currentExercise =
    selectedExercises[currentIndex] || LEVELS[difficulty].exercises[0];
  const level = LEVELS[difficulty] || LEVELS.basico;
  const activeStage = normalizeStageConfig(arConfig[activeARTab]);

  const selectedStageCount = useMemo(
    () => STAGES.filter((stage) => selectedStages[stage]).length,
    [selectedStages],
  );

  const isARConfigReady = useMemo(() => {
    if (!useAR) return true;
    if (selectedStageCount === 0) return false;
    return STAGES.every(
      (stage) => !selectedStages[stage] || hasStageContent(arConfig[stage]),
    );
  }, [arConfig, selectedStageCount, selectedStages, useAR]);

  useEffect(() => {
    setUseAR(withRA === true);
    if (withRA === true) {
      setScreen((current) =>
        current === "game" || current === "game-summary" ? current : "ar",
      );
    } else {
      setSelectedStages({ Inicio: false, Acierto: false, Final: false });
      setArConfig(createEmptyARConfig());
      window.localStorage.removeItem("selectedRobotStages");
      window.localStorage.removeItem("robotARConfig");
      setScreen((current) =>
        current === "game" || current === "game-summary" ? current : "generator",
      );
    }
  }, [withRA]);

  useEffect(() => {
    window.localStorage.setItem("selectedRobotStages", JSON.stringify(selectedStages));
    window.localStorage.setItem("robotARConfig", JSON.stringify(arConfig));
  }, [arConfig, selectedStages]);

  useEffect(() => {
    const resetARContent = () => {
      setSelectedStages({ Inicio: false, Acierto: false, Final: false });
      setArConfig(createEmptyARConfig());
      setActiveARTab("Inicio");
    };

    window.addEventListener(AR_CONFIGURATION_CLEARED_EVENT, resetARContent);
    return () => {
      window.removeEventListener(AR_CONFIGURATION_CLEARED_EVENT, resetARContent);
    };
  }, []);

  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(() => setNotification(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notification]);

  function resetBoard(exercise = currentExercise) {
    setSequence([]);
    setRobotCol(findStartColumn(exercise));
    setCollectedKeys([]);
    setHighlightIndex(null);
    setRobotMotion("greeting");
    setCollectingObjectType(null);
    setDropTarget(null);
  }

  function prepareGame() {
    const exercises = pickExercises(difficulty);
    setSelectedExercises(exercises);
    setCurrentIndex(0);
    setScore(0);
    setAttemptsRemaining(level.attempts);
    resetBoard(exercises[0]);
  }

  function canShowARStage(stageName) {
    return Boolean(
      useAR && selectedStages[stageName] && hasStageContent(arConfig[stageName]),
    );
  }

  function showARStage(stageName, options = {}) {
    if (!canShowARStage(stageName)) return Promise.resolve(true);
    return new Promise((resolve) => {
      setStageModal({
        stageName,
        stage: normalizeStageConfig(arConfig[stageName]),
        confirmButtonText: options.confirmButtonText || "Continuar",
        cancelButtonText: options.cancelButtonText || "Cancelar",
        showCancelButton: options.showCancelButton === true,
        resolve,
      });
    });
  }

  function closeStageModal(confirmed) {
    if (stageModal?.resolve) stageModal.resolve(Boolean(confirmed));
    setStageModal(null);
  }

  async function startGame() {
    prepareGame();

    await showInitialARInPreview({
      enterPreview: () => setScreen("game"),
      showInitialStage: () =>
        showARStage("Inicio", {
          confirmButtonText: "Comenzar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
        }),
      onCancel: () => setScreen("generator"),
    });
  }

  function addInstruction(instructionId) {
    const instruction = INSTRUCTIONS.find((item) => item.id === instructionId);
    if (!instruction || isRunning) return;
    setSequence((current) => [
      ...current,
      {
        id: instruction.id,
        label: instruction.label,
        kind: instruction.kind,
        param: instruction.paramDefault || 0,
      },
    ]);
  }

  function createSequenceItem(instructionId, param) {
    const instruction = INSTRUCTIONS.find((item) => item.id === instructionId);
    if (!instruction) return null;
    return {
      id: instruction.id,
      label: instruction.label,
      kind: instruction.kind,
      param:
        instruction.kind === "move"
          ? Number(param) || instruction.paramDefault || 0
          : 0,
    };
  }

  function writeDragPayload(event, payload) {
    const serialized = JSON.stringify(payload);
    event.dataTransfer.setData("application/json", serialized);
    event.dataTransfer.setData("text/plain", serialized);
  }

  function readDragPayload(event) {
    try {
      const serialized =
        event.dataTransfer.getData("application/json") ||
        event.dataTransfer.getData("text/plain");
      return JSON.parse(serialized);
    } catch {
      return null;
    }
  }

  function handleInstructionDragStart(event, instruction) {
    if (isRunning) {
      event.preventDefault();
      return;
    }
    writeDragPayload(event, {
      instructionId: instruction.id,
      param: instruction.paramDefault || 0,
      fromSequence: false,
    });
    event.dataTransfer.effectAllowed = "copyMove";
    event.currentTarget.classList.add("dragging");
  }

  function handleSequenceDragStart(event, index) {
    if (isRunning) {
      event.preventDefault();
      return;
    }
    const item = sequence[index];
    writeDragPayload(event, {
      instructionId: item.id,
      param: item.param,
      fromSequence: true,
      sequenceIndex: index,
    });
    event.dataTransfer.effectAllowed = "move";
    event.currentTarget.classList.add("dragging");
  }

  function finishDragging(event) {
    event.currentTarget.classList.remove("dragging");
    setDropTarget(null);
  }

  function insertDraggedItem(payload, requestedIndex) {
    if (!payload || isRunning) return;
    setSequence((current) => {
      const next = [...current];
      let insertIndex = Math.max(0, Math.min(requestedIndex, next.length));
      let item = createSequenceItem(payload.instructionId, payload.param);
      if (!item) return current;

      if (payload.fromSequence && Number.isInteger(payload.sequenceIndex)) {
        const [existing] = next.splice(payload.sequenceIndex, 1);
        if (!existing) return current;
        item = existing;
        if (payload.sequenceIndex < insertIndex) insertIndex -= 1;
      }

      next.splice(Math.max(0, insertIndex), 0, item);
      return next;
    });
    setDropTarget(null);
  }

  function handleSequenceDrop(event) {
    event.preventDefault();
    insertDraggedItem(readDragPayload(event), sequence.length);
  }

  function handleSequenceItemDragOver(event, index) {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const side = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
    setDropTarget(`${index}:${side}`);
    event.dataTransfer.dropEffect = "move";
  }

  function handleSequenceItemDrop(event, index) {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const insertAfter = event.clientY >= rect.top + rect.height / 2;
    insertDraggedItem(readDragPayload(event), index + (insertAfter ? 1 : 0));
  }

  function updateSequenceParam(index, value) {
    const nextValue = Math.max(0, Math.min(20, Number(value) || 0));
    setSequence((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, param: nextValue } : item,
      ),
    );
  }

  function removeInstruction(index) {
    if (isRunning) return;
    setSequence((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function loadHint() {
    if (isRunning) return;
    setSequence(buildHintSequence(currentExercise));
  }

  function resetExercise() {
    if (isRunning) return;
    resetBoard(currentExercise);
    setAttemptsRemaining(level.attempts);
  }

  async function validateSolution() {
    if (isRunning) return;
    if (sequence.length === 0) {
      setNotification("Agrega instrucciones a la secuencia primero.");
      return;
    }

    const hasStart = sequence[0]?.id === "inicio";
    const hasEnd = sequence[sequence.length - 1]?.id === "fin";
    if (!hasStart || !hasEnd) {
      setResult({
        type: "fail",
        message: 'La secuencia debe comenzar con "Inicio" y terminar con "Fin".',
      });
      return;
    }

    setIsRunning(true);
    setResult(null);
    setHighlightIndex(null);
    setRobotCol(findStartColumn(currentExercise));
    setCollectedKeys([]);
    setRobotMotion("greeting");
    setCollectingObjectType(null);

    await sleep(250);

    let nextCol = findStartColumn(currentExercise);
    let nextCollected = [];
    let success = true;
    let errorMessage = "";
    const row = currentExercise.grid[0] || [];

    for (let index = 0; index < sequence.length; index += 1) {
      const item = sequence[index];
      setHighlightIndex(index);
      await sleep(260);

      if (item.id === "avanzar") {
        const steps = Number(item.param) || 0;
        if (steps <= 0) {
          success = false;
          errorMessage = "Indica un numero mayor a cero para avanzar.";
          break;
        }

        for (let step = 0; step < steps; step += 1) {
          const target = nextCol + 1;
          if (target >= row.length || ![".", "O", "E"].includes(row[target])) {
            success = false;
            errorMessage = "El robot se salio del camino.";
            break;
          }
          setRobotMotion("walking");
          nextCol = target;
          setRobotCol(nextCol);
          await sleep(ROBOT_MOTION_TIMINGS.step);
          setRobotMotion("greeting");
        }

        if (!success) break;
      } else if (item.id === "recoger") {
        let object = null;
        for (const candidate of currentExercise.objects) {
          if (
            candidate.row === 0 &&
            candidate.col === nextCol &&
            !nextCollected.includes(objectKey(candidate))
          ) {
            object = candidate;
            break;
          }
        }

        if (!object) {
          success = false;
          errorMessage = "No hay objeto para recoger en esta casilla.";
          break;
        }

        setCollectingObjectType(object.type);
        setRobotMotion("collecting");
        await sleep(ROBOT_MOTION_TIMINGS.collect);
        nextCollected = [...nextCollected, objectKey(object)];
        setCollectedKeys(nextCollected);
        setRobotMotion("greeting");
        setCollectingObjectType(null);
        setNotification(
          object.type === "star" ? "¡Estrella recogida!" : "¡Paquete recogido!",
        );
      }
    }

    setHighlightIndex(null);

    const endCol = row.findIndex((cell) => cell === "E");
    const allObjectsCollected =
      nextCollected.length >= currentExercise.objects.length;

    if (success && nextCol === endCol && allObjectsCollected) {
      const nextScore = score + level.points;
      setScore(nextScore);
      setRobotMotion("jumping");
      await sleep(ROBOT_MOTION_TIMINGS.jump);
      setRobotMotion("greeting");
      await sleep(ROBOT_MOTION_TIMINGS.greeting);
      await showARStage("Acierto");
      setResult({
        type: currentIndex >= selectedExercises.length - 1 ? "complete" : "success",
        points:
          currentIndex >= selectedExercises.length - 1
            ? nextScore
            : level.points,
      });
    } else {
      const nextAttempts = Math.max(0, attemptsRemaining - 1);
      setAttemptsRemaining(nextAttempts);
      setRobotMotion("greeting");
      setCollectingObjectType(null);
      setResult({
        type: nextAttempts <= 0 ? "noAttempts" : "fail",
        attemptsRemaining: nextAttempts,
        isLast: currentIndex >= selectedExercises.length - 1,
        message:
          errorMessage ||
          "El robot debe terminar en la meta y recoger todos los objetos.",
      });
    }

    setIsRunning(false);
  }

  function nextExercise() {
    setResult(null);
    if (currentIndex >= selectedExercises.length - 1) {
      finishConfiguration();
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setAttemptsRemaining(level.attempts);
    resetBoard(selectedExercises[nextIndex]);
  }

  function restartGame() {
    prepareGame();
    setResult(null);
    setScreen("game");
  }

  async function finishGame() {
    if (isRunning) return;
    await showARStage("Final");
    setResult({ type: "finish", points: score });
  }

  function finishConfiguration() {
    setResult(null);
    setScreen("game-summary");
    navigate("/settings?view=Summary", {
      replace: true,
      state: {
        ...location.state,
        gameType: "robot",
        gameConfig: {
          level: difficulty,
          exerciseIds: selectedExercises.map((exercise) => exercise.id),
        },
        arNamespace: "robot",
        arSelectedStages: useAR
          ? selectedStages
          : { Inicio: false, Acierto: false, Final: false },
        arConfig: useAR ? arConfig : {},
        withRA: useAR === true,
      },
    });
  }

  async function handleResultAction(action) {
    if (action === "close" || action === "finish-level") {
      setResult(null);
    } else if (action === "retry") {
      setResult(null);
      resetBoard(currentExercise);
    } else if (action === "continue") {
      nextExercise();
    } else if (action === "restart") {
      restartGame();
    } else if (action === "generator") {
      setResult(null);
      resetBoard(currentExercise);
      setScreen("generator");
    } else if (action === "summary") {
      const shouldShowFinalStage = result?.type === "complete";
      setResult(null);
      if (shouldShowFinalStage) {
        await sleep(0);
        await showARStage("Final");
      }
      finishConfiguration();
    }
  }

  function toggleStage(stageName, checked) {
    setSelectedStages((current) => ({ ...current, [stageName]: checked }));
    if (checked) setActiveARTab(stageName);
  }

  function setStageType(stageName, type) {
    setArConfig((current) => ({
      ...current,
      [stageName]: {
        ...normalizeStageConfig(current[stageName]),
        type,
      },
    }));
  }

  function updateStageText(stageName, text) {
    setArConfig((current) => ({
      ...current,
      [stageName]: {
        ...normalizeStageConfig(current[stageName]),
        type: "Texto",
        text,
      },
    }));
  }

  async function uploadFile(stageName, type, file) {
    if (!file) return;
    const rule = FILE_RULES[type];
    if (!rule) return;

    if (file.size > rule.maxSize) {
      setNotification(`El archivo de ${rule.label} es demasiado grande.`);
      return;
    }

    try {
      const dataUrl = await dataUrlFromFile(file);
      setArConfig((current) => ({
        ...current,
        [stageName]: {
          ...normalizeStageConfig(current[stageName]),
          type,
          [rule.urlKey]: dataUrl,
          [rule.nameKey]: file.name,
        },
      }));
      setNotification("Archivo listo para vista previa.");
    } catch {
      setNotification("No se pudo preparar el archivo.");
    }
  }

  function clearStageField(stageName, type) {
    if (type === "Texto") {
      setArConfig((current) => ({
        ...current,
        [stageName]: { ...normalizeStageConfig(current[stageName]), text: "" },
      }));
      return;
    }

    const rule = FILE_RULES[type];
    if (!rule) return;
    setArConfig((current) => ({
      ...current,
      [stageName]: {
        ...normalizeStageConfig(current[stageName]),
        [rule.urlKey]: "",
        [rule.nameKey]: "",
      },
    }));
  }

  function goToARSummary() {
    if (!isARConfigReady) {
      setNotification("Configura al menos una etapa RA seleccionada.");
      return;
    }
    setScreen("ar-summary");
  }

  const objectAtRobot = currentExercise.objects.find(
    (object) =>
      object.col === robotCol && !collectedKeys.includes(objectKey(object)),
  );

  return (
    <div className="robot-root">
      <style>{robotStyles}</style>

      {notification && <div className="robot-notification">{notification}</div>}

      {stageModal && (
        <StageModal
          stageName={stageModal.stageName}
          stage={stageModal.stage}
          confirmButtonText={stageModal.confirmButtonText}
          cancelButtonText={stageModal.cancelButtonText}
          showCancelButton={stageModal.showCancelButton}
          onConfirm={() => closeStageModal(true)}
          onCancel={() => closeStageModal(false)}
        />
      )}

      {result && <ResultModal result={result} onAction={handleResultAction} />}

      {screen !== "game" && (
        <div className="logic-path-screen">
          <div className="logic-path-panel">
            {screen === "generator" && (
              <>
                <AnimatedTitle />
                <ProgressBar currentStep="game" arEnabled={useAR} />
                <h2 className="logic-path-section-title">Configuración del juego</h2>
                <div className="logic-path-config-section">
                  <label className="logic-path-config-label" htmlFor="robot-level">
                    Selecciona nivel:
                  </label>
                  <select
                    id="robot-level"
                    className="logic-path-config-field"
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                  >
                    {Object.entries(LEVELS).map(([key, item]) => (
                      <option value={key} key={key}>
                        {item.label} - {item.showCount} ejercicios
                      </option>
                    ))}
                  </select>
                </div>
                <div className="logic-path-actions">
                  <button
                    type="button"
                    className="logic-path-btn secondary"
                    onClick={() => (useAR ? setScreen("ar-summary") : navigate(-1))}
                  >
                    ← Anterior
                  </button>
                  <button type="button" className="logic-path-btn" onClick={startGame}>
                    Vista Previa →
                  </button>
                </div>
              </>
            )}

            {screen === "ar" && (
              <>
                <AnimatedTitle />
                <ProgressBar currentStep="ar" arEnabled={useAR} />
                <LogicPathARConfigurator
                  stages={STAGES}
                  activeStageName={activeARTab}
                  selectedStages={selectedStages}
                  stageConfig={activeStage}
                  fileRules={FILE_RULES}
                  idPrefix="robot"
                  maxTextLength={60}
                  onStageSelect={setActiveARTab}
                  onStageToggle={toggleStage}
                  onTextChange={(stageName, text) => {
                    setStageType(stageName, "Texto");
                    updateStageText(stageName, text);
                  }}
                  onFileChange={(stageName, type, file) => {
                    setStageType(stageName, type);
                    uploadFile(stageName, type, file);
                  }}
                  onClearText={(stageName) => clearStageField(stageName, "Texto")}
                  onClearFile={clearStageField}
                  onBack={() => navigate(-1)}
                  onNext={goToARSummary}
                  nextDisabled={!isARConfigReady}
                />
              </>
            )}

            {screen === "ar-summary" && (
              <>
                <AnimatedTitle />
                <ProgressBar currentStep="ar-summary" arEnabled={useAR} />
                <LogicPathARSummary
                  stages={STAGES}
                  selectedStages={selectedStages}
                  arConfig={arConfig}
                  onBack={() => setScreen("ar")}
                  onNext={() => setScreen("generator")}
                />
              </>
            )}

            {screen === "game-summary" && (
              <SummaryPanel
                difficulty={difficulty}
                selectedExercises={selectedExercises}
                score={score}
                arEnabled={useAR}
                selectedStages={selectedStages}
                arConfig={arConfig}
                state={location.state}
                onBack={() => setScreen("game")}
              />
            )}
          </div>
        </div>
      )}

      {screen === "game" && (
        <div className="robot-play-screen">
          <div className="robot-game-panel">
            <AnimatedTitle />
            <ProgressBar currentStep="playing" arEnabled={useAR} />
            <div className="robot-game-head">
              <div>
                <h2>{currentExercise.name}</h2>
                <p>
                  <strong>Reglas básicas:</strong> {currentExercise.description}{" "}
                  Observa el recorrido y ordena correctamente las instrucciones.
                </p>
              </div>
              <div className="robot-level-pill">{level.label}</div>
            </div>

            <div className="robot-game-layout">
              <aside className="robot-side-panel robot-sequence-column">
                <div className="robot-panel-header">Instrucciones</div>
                <div
                  className={`robot-sequence-drop-zone ${
                    dropTarget === "end" ? "drag-over" : ""
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDropTarget("end");
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setDropTarget(null);
                    }
                  }}
                  onDrop={handleSequenceDrop}
                >
                  {sequence.length === 0 ? (
                    <div className="robot-empty-sequence">
                      Arrastra las fichas aquí para armar la secuencia.
                    </div>
                  ) : (
                    <div className="robot-sequence-list">
                      {sequence.map((item, index) => {
                        const before = dropTarget === `${index}:before`;
                        const after = dropTarget === `${index}:after`;
                        return (
                          <div
                            className={`robot-sequence-item ${item.id} ${
                              highlightIndex === index ? "active" : ""
                            } ${before ? "drop-before" : ""} ${
                              after ? "drop-after" : ""
                            }`}
                            key={`${item.id}-${index}`}
                            draggable={!isRunning}
                            onDragStart={(event) =>
                              handleSequenceDragStart(event, index)
                            }
                            onDragEnd={finishDragging}
                            onDragOver={(event) =>
                              handleSequenceItemDragOver(event, index)
                            }
                            onDrop={(event) =>
                              handleSequenceItemDrop(event, index)
                            }
                          >
                            <span className="robot-drag-handle" aria-hidden="true">
                              ⋮⋮
                            </span>
                            <span>{item.label}</span>
                            {item.id === "avanzar" && (
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={item.param || ""}
                                placeholder="?"
                                draggable="false"
                                onChange={(event) =>
                                  updateSequenceParam(index, event.target.value)
                                }
                                disabled={isRunning}
                                aria-label={`Bloques para avanzar en la instrucción ${index + 1}`}
                              />
                            )}
                            <button
                              type="button"
                              title="Eliminar"
                              draggable="false"
                              onClick={() => removeInstruction(index)}
                              disabled={isRunning}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="robot-btn compact secondary"
                  onClick={loadHint}
                  disabled={isRunning}
                >
                  Usar pista
                </button>
              </aside>

              <section className="robot-center-column">
                <div className="robot-source-panel">
                  <div className="robot-panel-header">Instrucciones a usar</div>
                  <div className="robot-instruction-list robot-source-instructions">
                    {INSTRUCTIONS.map((instruction) => (
                      <button
                        type="button"
                        className={`robot-instruction ${instruction.id}`}
                        key={instruction.id}
                        onClick={() => addInstruction(instruction.id)}
                        disabled={isRunning}
                        draggable={!isRunning}
                        onDragStart={(event) =>
                          handleInstructionDragStart(event, instruction)
                        }
                        onDragEnd={finishDragging}
                        title="Haz clic o arrastra esta ficha a las instrucciones"
                      >
                        {instruction.id === "inicio" && <Play size={17} />}
                        {instruction.id === "avanzar" && <Bot size={17} />}
                        {instruction.id === "recoger" && <Package size={17} />}
                        {instruction.id === "fin" && <Flag size={17} />}
                        {instruction.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="robot-center-panel">
                <div
                  className="robot-board"
                  style={{
                    gridTemplateColumns: `repeat(${currentExercise.grid[0].length}, minmax(54px, 1fr))`,
                  }}
                >
                  {currentExercise.grid[0].map((cell, col) => {
                    const object = currentExercise.objects.find(
                      (candidate) =>
                        candidate.col === col &&
                        !collectedKeys.includes(objectKey(candidate)),
                    );
                    const isRobot = robotCol === col;
                    return (
                      <div
                        className={`robot-cell ${
                          cell === "S" ? "start" : cell === "E" ? "end" : cell === "O" ? "object" : "path"
                        } ${isRobot ? "has-robot" : ""}`}
                        key={`${currentExercise.id}-${col}`}
                      >
                        <span className="robot-cell-label">
                          {cell === "S" ? "I" : cell === "E" ? "F" : col}
                        </span>
                        {object && (
                          <span className={`robot-object ${object.type}`}>
                            {getObjectIcon(object.type)}
                          </span>
                        )}
                        {isRobot && (
                          <span className={`robot-avatar ${robotMotion}`}>
                            <Bot size={34} />
                            {robotMotion === "collecting" && collectingObjectType && (
                              <span className={`robot-collect-effect ${collectingObjectType}`}>
                                {getObjectIcon(collectingObjectType)}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {objectAtRobot && (
                  <div className="robot-object-note">
                    Objeto actual: {getObjectLabel(objectAtRobot.type)}
                  </div>
                )}
                </div>
              </section>

              <aside className="robot-side-panel">
                <div className="robot-panel-header">Progreso</div>
                <div className="robot-progress-info">
                  <div>
                    <span>Ejercicio</span>
                    <strong>
                      {currentIndex + 1}/{selectedExercises.length}
                    </strong>
                  </div>
                  <div>
                    <span>Intentos</span>
                    <strong>{attemptsRemaining}</strong>
                  </div>
                  <div>
                    <span>Puntaje</span>
                    <strong>{score}</strong>
                  </div>
                  <div>
                    <span>Objetos</span>
                    <strong>
                      {collectedKeys.length}/{currentExercise.objects.length}
                    </strong>
                  </div>
                </div>
                <div className="robot-action-stack">
                  <button
                    type="button"
                    className="robot-btn primary"
                    onClick={validateSolution}
                    disabled={isRunning}
                  >
                    Probar solucion
                  </button>
                  <button
                    type="button"
                    className="robot-btn secondary"
                    onClick={resetExercise}
                    disabled={isRunning}
                  >
                    <RotateCcw size={17} />
                    Reiniciar
                  </button>
                  <button
                    type="button"
                    className="robot-btn dark"
                    onClick={finishGame}
                    disabled={isRunning}
                  >
                    Finalizar juego
                  </button>
                </div>
              </aside>
            </div>

            <div className="robot-actions robot-preview-actions">
              <button
                type="button"
                className="robot-btn secondary"
                onClick={() => setScreen(useAR ? "ar-summary" : "generator")}
                disabled={isRunning}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className="robot-btn primary"
                onClick={finishConfiguration}
                disabled={isRunning}
              >
                Terminar configuración →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const robotStyles = `
.robot-root {
  width: 100%;
  min-width: 0;
  --robot-primary: #005f92;
  --robot-primary-dark: #004a73;
  --robot-primary-soft: #e0f2fe;
  --robot-secondary: #1f2937;
  --robot-success: #16a34a;
  --robot-border: #d6deea;
  --robot-muted: #64748b;
  --robot-panel: #ffffff;
  --robot-bg: #f3f7fc;
  --robot-radius: 8px;
  --robot-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  color: var(--robot-secondary);
  font-family: "Nunito", "Segoe UI", sans-serif;
}

.robot-screen,
.robot-play-screen {
  width: 100%;
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 18px;
  background: var(--robot-bg);
}

.robot-root > .logic-path-screen > .logic-path-panel,
.robot-root .robot-game-panel {
  width: 100%;
  max-width: 1200px;
  min-height: 85vh;
  margin: 20px auto;
  padding: 2rem;
  border: 0;
  border-radius: 0.75rem;
  box-sizing: border-box;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.robot-root .robot-play-screen {
  padding: 0;
  background: transparent;
}

.robot-panel-main,
.robot-game-panel {
  width: 100%;
  max-width: none;
  background: var(--robot-panel);
  border: 1px solid var(--robot-border);
  border-radius: var(--robot-radius);
  box-shadow: var(--robot-shadow);
  padding: 28px;
}

.robot-panel-main {
  max-width: 920px;
}

.robot-title-box {
  text-align: center;
  margin-bottom: 16px;
}

.robot-title-text {
  margin: 0;
  color: var(--robot-primary);
  font-size: clamp(2rem, 6vw, 3.2rem);
  font-weight: 900;
  line-height: 1.05;
}

.robot-title-text span {
  display: inline-block;
  animation: robotTitleRise 0.55s ease both;
}

.robot-title-symbols {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 12px;
}

.robot-title-symbols span {
  border: 1px solid var(--robot-border);
  color: var(--robot-primary);
  background: #f8fafc;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.robot-progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 18px auto 24px;
  max-width: 680px;
}

.robot-progress-step {
  display: grid;
  justify-items: center;
  gap: 5px;
  color: var(--robot-muted);
  font-size: 0.78rem;
  font-weight: 800;
  min-width: 72px;
}

.robot-progress-dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #cbd5e1;
  border: 3px solid #eef2f7;
}

.robot-progress-step.active .robot-progress-dot,
.robot-progress-step.done .robot-progress-dot {
  background: var(--robot-primary);
}

.robot-progress-step.active {
  color: var(--robot-primary);
}

.robot-progress-line {
  height: 2px;
  flex: 1;
  max-width: 90px;
  background: #d9e2ee;
}

.robot-panel-main h2,
.robot-summary h2 {
  margin: 0 0 18px;
  color: var(--robot-primary);
  text-align: center;
  font-size: 1.55rem;
}

.robot-config-row {
  display: grid;
  gap: 8px;
  max-width: 520px;
  margin: 0 auto 20px;
}

.robot-config-row.compact {
  max-width: 420px;
}

.robot-config-row label {
  font-weight: 800;
  color: var(--robot-secondary);
}

.robot-config-row select {
  border: 2px solid var(--robot-primary);
  border-radius: var(--robot-radius);
  padding: 11px 12px;
  font-size: 1rem;
  background: #f8fafc;
}

.robot-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: var(--robot-radius);
  padding: 11px 18px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.robot-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16);
}

.robot-btn:disabled {
  opacity: 0.52;
  cursor: not-allowed;
}

.robot-btn.primary {
  background: var(--robot-primary);
  color: #fff;
}

.robot-btn.secondary {
  background: #e5e7eb;
  color: var(--robot-secondary);
}

.robot-btn.dark {
  background: var(--robot-secondary);
  color: #fff;
}

.robot-btn.compact {
  width: 100%;
  padding: 9px 12px;
}

.robot-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.robot-actions.center {
  justify-content: center;
}

.robot-preview-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin-top: 18px;
}

.robot-preview-actions .robot-btn {
  width: 100%;
  min-height: 44px;
  margin: 0;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 8px;
  background: var(--robot-primary);
  color: #fff;
  box-shadow: none;
  font-size: 0.95rem;
  font-weight: 800;
}

.robot-preview-actions .robot-btn:hover:not(:disabled) {
  background: var(--robot-primary-dark);
  box-shadow: none;
  transform: none;
}

.robot-ar-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0 auto 16px;
  max-width: 640px;
}

.robot-ar-tab {
  border: 2px solid var(--robot-border);
  border-radius: var(--robot-radius);
  background: #fff;
  color: var(--robot-secondary);
  padding: 10px 12px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.robot-ar-tab.active {
  border-color: var(--robot-primary);
  color: var(--robot-primary);
  background: var(--robot-primary-soft);
}

.robot-ar-tab.enabled {
  box-shadow: inset 0 -3px 0 var(--robot-success);
}

.robot-stage-toggle {
  max-width: 640px;
  margin: 0 auto 16px;
  background: #f8fafc;
  border: 1px solid var(--robot-border);
  border-radius: var(--robot-radius);
  padding: 12px;
  font-weight: 800;
}

.robot-stage-toggle label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.robot-stage-toggle input {
  width: 19px;
  height: 19px;
  accent-color: var(--robot-primary);
}

.robot-ar-content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  max-width: 820px;
  margin: 0 auto;
}

.robot-ar-content-card {
  border: 2px solid var(--robot-border);
  border-radius: var(--robot-radius);
  padding: 14px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.robot-ar-content-card.active {
  border-color: var(--robot-primary);
  background: #f8fbff;
}

.robot-card-head {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 8px;
}

.robot-card-head > span {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--robot-primary-soft);
  color: var(--robot-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.robot-card-head button {
  border: 0;
  background: #e5e7eb;
  color: var(--robot-secondary);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.robot-ar-content-card textarea {
  min-height: 104px;
  resize: vertical;
  border: 1.5px solid var(--robot-border);
  border-radius: var(--robot-radius);
  padding: 10px;
  font: inherit;
}

.robot-hidden-file {
  display: none;
}

.robot-upload-btn {
  border: 1.5px dashed var(--robot-primary);
  color: var(--robot-primary);
  background: var(--robot-primary-soft);
  border-radius: var(--robot-radius);
  padding: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 800;
  cursor: pointer;
}

.robot-upload-btn.has-file {
  border-style: solid;
  background: #ecfdf5;
  color: #047857;
}

.robot-file-name {
  font-size: 0.84rem;
  color: var(--robot-muted);
  overflow-wrap: anywhere;
}

.robot-preview-image,
.robot-ar-content-card video {
  width: 100%;
  max-height: 170px;
  object-fit: contain;
  border: 1px solid var(--robot-border);
  border-radius: var(--robot-radius);
  background: #f8fafc;
}

.robot-ar-content-card audio {
  width: 100%;
}

.robot-disabled-stage {
  max-width: 640px;
  margin: 0 auto;
  padding: 26px;
  border: 1px dashed var(--robot-border);
  border-radius: var(--robot-radius);
  text-align: center;
  color: var(--robot-muted);
  background: #f8fafc;
  font-weight: 700;
}

.robot-stage-summary-grid,
.robot-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
  margin: 18px 0;
}

.robot-stage-summary,
.robot-info-card {
  background: #f8fafc;
  border: 1px solid var(--robot-border);
  border-radius: var(--robot-radius);
  padding: 14px;
}

.robot-stage-summary h3 {
  margin: 0 0 8px;
  color: var(--robot-primary);
}

.robot-stage-summary p,
.robot-summary p {
  margin: 4px 0;
  color: var(--robot-muted);
}

.robot-info-card {
  display: grid;
  gap: 5px;
}

.robot-info-card span {
  color: var(--robot-muted);
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.robot-info-card strong {
  color: var(--robot-secondary);
  font-size: 1.02rem;
}

.robot-game-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.robot-game-head h2 {
  margin: 0 0 6px;
  color: var(--robot-primary);
}

.robot-game-head p {
  margin: 0;
  color: var(--robot-muted);
  font-weight: 700;
}

.robot-level-pill {
  background: var(--robot-primary-soft);
  color: var(--robot-primary);
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 900;
  white-space: nowrap;
}

.robot-game-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 220px;
  gap: 16px;
  align-items: stretch;
}

.robot-side-panel,
.robot-source-panel {
  background: #fff;
  border: 2px solid var(--robot-border);
  border-radius: var(--robot-radius);
  overflow: hidden;
}

.robot-sequence-column {
  display: flex;
  flex-direction: column;
  min-height: 520px;
}

.robot-sequence-column > .robot-btn {
  width: calc(100% - 20px);
  margin: 0 10px 10px;
}

.robot-panel-header {
  margin: 8px;
  padding: 10px 12px;
  background: var(--robot-primary);
  color: #fff;
  border-radius: var(--robot-radius);
  text-align: center;
  font-weight: 900;
}

.robot-instruction-list,
.robot-action-stack,
.robot-progress-info {
  display: grid;
  gap: 9px;
  padding: 12px;
}

.robot-center-column {
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
}

.robot-source-instructions {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.robot-instruction {
  min-height: 42px;
  border: 1.5px solid var(--robot-border);
  border-radius: var(--robot-radius);
  background: #f8fafc;
  color: var(--robot-secondary);
  font-weight: 850;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.robot-instruction:hover:not(:disabled) {
  border-color: var(--robot-primary);
  color: var(--robot-primary);
  background: var(--robot-primary-soft);
}

.robot-instruction[draggable="true"] {
  cursor: grab;
}

.robot-instruction.dragging,
.robot-sequence-item.dragging {
  opacity: 0.45;
  cursor: grabbing;
}

.robot-progress-info div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eef2f7;
  padding-bottom: 7px;
  gap: 8px;
}

.robot-progress-info span {
  color: var(--robot-muted);
  font-weight: 800;
}

.robot-progress-info strong {
  color: var(--robot-primary);
}

.robot-center-panel {
  min-width: 0;
  min-height: 390px;
  background: radial-gradient(circle at 0 0, #fff 0, #f8fbff 48%, #eef4fb 100%);
  border: 2px solid var(--robot-border);
  border-radius: var(--robot-radius);
  padding: 14px;
  overflow-x: auto;
  display: grid;
  align-content: center;
  gap: 12px;
}

.robot-board {
  display: grid;
  gap: 8px;
  min-width: max-content;
}

.robot-cell {
  position: relative;
  min-width: 54px;
  aspect-ratio: 1;
  border: 2px solid #cbd5e1;
  border-radius: var(--robot-radius);
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.robot-cell.start {
  background: #e0f2fe;
  border-color: var(--robot-primary);
}

.robot-cell.end {
  background: #ecfdf5;
  border-color: var(--robot-success);
}

.robot-cell.object {
  background: #fff7ed;
}

.robot-cell-label {
  position: absolute;
  top: 4px;
  left: 6px;
  color: var(--robot-muted);
  font-size: 0.68rem;
  font-weight: 900;
}

.robot-object {
  color: #c2410c;
  opacity: 0.9;
}

.robot-object.star {
  color: #ca8a04;
}

.robot-avatar {
  position: absolute;
  color: var(--robot-primary);
  filter: drop-shadow(0 5px 8px rgba(0, 95, 146, 0.25));
}

.robot-avatar.walking {
  animation: robotWalk 0.35s ease-in-out infinite alternate;
}

.robot-avatar.greeting {
  animation: robotGreeting 1.1s ease-in-out infinite;
}

.robot-avatar.collecting {
  animation: robotCollect 0.55s ease-in-out infinite alternate;
}

.robot-avatar.jumping {
  animation: robotJump 0.62s cubic-bezier(0.2, 0.8, 0.3, 1) infinite;
}

.robot-collect-effect {
  position: absolute;
  top: -20px;
  right: -22px;
  display: inline-flex;
  color: #c2410c;
  filter: drop-shadow(0 3px 4px rgba(15, 23, 42, 0.24));
  animation: robotCollectObject 0.55s ease-in-out infinite alternate;
}

.robot-collect-effect.star {
  color: #ca8a04;
}

.robot-object-note {
  text-align: center;
  color: var(--robot-primary);
  font-weight: 900;
}

.robot-sequence-drop-zone {
  min-height: 360px;
  flex: 1;
  margin: 0 10px 10px;
  border: 2px dashed transparent;
  border-radius: var(--robot-radius);
  overflow-x: hidden;
  overflow-y: auto;
  transition: border-color 0.2s, background 0.2s;
}

.robot-sequence-drop-zone.drag-over {
  border-color: var(--robot-primary);
  background: var(--robot-primary-soft);
}

.robot-empty-sequence {
  padding: 18px;
  color: var(--robot-muted);
  text-align: center;
  font-weight: 800;
}

.robot-sequence-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 6px;
}

.robot-sequence-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 2px solid var(--robot-border);
  border-radius: var(--robot-radius);
  background: #f8fafc;
  padding: 7px 8px;
  font-weight: 850;
  cursor: grab;
  transition: border-color 0.2s, background 0.2s, opacity 0.2s;
  width: 100%;
  justify-content: center;
}

.robot-sequence-item.drop-before::before,
.robot-sequence-item.drop-after::after {
  content: "";
  position: absolute;
  left: -4px;
  right: -4px;
  height: 4px;
  border-radius: 999px;
  background: var(--robot-primary);
}

.robot-sequence-item.drop-before::before {
  top: -7px;
}

.robot-sequence-item.drop-after::after {
  bottom: -7px;
}

.robot-drag-handle {
  color: var(--robot-muted);
  font-weight: 900;
  letter-spacing: -3px;
  user-select: none;
}

.robot-sequence-item.active {
  border-color: var(--robot-primary);
  background: var(--robot-primary-soft);
  color: var(--robot-primary);
}

.robot-sequence-item input {
  width: 58px;
  border: 1.5px solid var(--robot-border);
  border-radius: 6px;
  padding: 5px;
  font-weight: 800;
  text-align: center;
}

.robot-sequence-item button {
  border: 0;
  background: #e5e7eb;
  color: var(--robot-secondary);
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.robot-notification {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  background: var(--robot-secondary);
  color: #fff;
  padding: 11px 18px;
  border-radius: var(--robot-radius);
  box-shadow: var(--robot-shadow);
  font-weight: 850;
}

.robot-modal-backdrop,
.robot-ar-overlay {
  position: fixed;
  inset: 0;
  z-index: 2500;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.robot-result-modal,
.robot-ar-card {
  background: #fff;
  border-radius: var(--robot-radius);
  box-shadow: var(--robot-shadow);
  width: min(520px, 100%);
  padding: 24px;
  text-align: center;
}

.robot-result-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: var(--robot-primary-soft);
  color: var(--robot-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.robot-result-modal.fail .robot-result-icon,
.robot-result-modal.noAttempts .robot-result-icon {
  background: #fee2e2;
  color: #b91c1c;
}

.robot-result-modal h3 {
  margin: 0 0 8px;
  color: var(--robot-secondary);
}

.robot-result-modal p {
  margin: 0;
  color: var(--robot-muted);
  font-weight: 700;
}

.robot-modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.robot-ar-card {
  width: min(720px, 100%);
}

.robot-ar-label {
  color: var(--robot-primary);
  font-weight: 900;
  font-size: 1.25rem;
  margin-bottom: 12px;
}

.robot-ar-visual {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  border-radius: var(--robot-radius);
  background: radial-gradient(circle at 50% 20%, #e0f2fe, #eff6ff 45%, #0f172a 120%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  margin-bottom: 16px;
}

.robot-ar-ring {
  position: absolute;
  width: 230px;
  height: 230px;
  border: 4px solid rgba(0, 95, 146, 0.22);
  border-top-color: var(--robot-primary);
  border-radius: 50%;
  animation: robotSpin 9s linear infinite;
}

.robot-ar-grid {
  position: absolute;
  inset: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  opacity: 0.18;
}

.robot-ar-grid span {
  border: 1px solid var(--robot-primary);
  border-radius: var(--robot-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--robot-primary);
  font-weight: 900;
}

.robot-ar-text {
  position: relative;
  z-index: 2;
  color: var(--robot-primary);
  font-size: clamp(1.8rem, 6vw, 3.2rem);
  font-weight: 900;
  text-align: center;
  text-shadow: 0 8px 18px rgba(255, 255, 255, 0.85);
  animation: robotFloat 2.5s ease-in-out infinite;
}

.robot-ar-media-image,
.robot-ar-media-video {
  position: relative;
  z-index: 2;
  max-width: min(82%, 420px);
  max-height: 260px;
  object-fit: contain;
  border-radius: var(--robot-radius);
  box-shadow: var(--robot-shadow);
  background: #fff;
}

.robot-ar-audio {
  position: relative;
  z-index: 2;
  width: min(90%, 420px);
}

.robot-summary {
  max-width: 860px;
  margin: 0 auto;
}

.robot-download-box {
  margin-top: 22px;
  border: 1px solid var(--robot-border);
  border-radius: var(--robot-radius);
  background: #f8fafc;
  padding: 18px;
  text-align: center;
}

.robot-download-box h3 {
  margin: 0 0 8px;
  color: var(--robot-primary);
}

.robot-download-progress {
  display: grid;
  gap: 8px;
  max-width: 520px;
  margin: 14px auto;
}

.robot-download-progress > div:first-child {
  display: flex;
  justify-content: space-between;
  color: var(--robot-muted);
  font-weight: 800;
}

.robot-download-track {
  height: 10px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.robot-download-track div {
  height: 100%;
  background: var(--robot-primary);
  transition: width 0.25s ease;
}

@keyframes robotTitleRise {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes robotWalk {
  from { transform: translateY(0); }
  to { transform: translateY(-5px); }
}

@keyframes robotGreeting {
  0%, 100% { transform: rotate(-3deg) translateY(0); }
  50% { transform: rotate(5deg) translateY(-3px); }
}

@keyframes robotCollect {
  from { transform: translateX(-2px) rotate(-8deg) scale(1); }
  to { transform: translateX(3px) rotate(8deg) scale(1.08); }
}

@keyframes robotCollectObject {
  from { transform: translateY(0) scale(0.9); opacity: 0.72; }
  to { transform: translateY(-8px) scale(1.12); opacity: 1; }
}

@keyframes robotJump {
  0%, 100% { transform: translateY(0) rotate(0); }
  45% { transform: translateY(-18px) rotate(-8deg) scale(1.08); }
  65% { transform: translateY(-16px) rotate(8deg) scale(1.08); }
}

@keyframes robotSpin {
  to { transform: rotate(360deg); }
}

@keyframes robotFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 980px) {
  .robot-game-layout {
    grid-template-columns: 1fr;
  }

  .robot-sequence-column {
    min-height: auto;
  }

  .robot-sequence-column .robot-sequence-drop-zone {
    min-height: 160px;
    max-height: 360px;
  }

  .robot-ar-content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .robot-screen,
  .robot-play-screen {
    padding: 10px;
  }

  .robot-panel-main,
  .robot-game-panel {
    padding: 18px 14px;
  }

  .robot-progress-bar,
  .robot-ar-tabs {
    gap: 6px;
  }

  .robot-progress-step {
    min-width: 54px;
    font-size: 0.68rem;
  }

  .robot-ar-tabs {
    grid-template-columns: 1fr;
  }

  .robot-game-head {
    flex-direction: column;
  }

  .robot-source-instructions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .robot-preview-actions {
    grid-template-columns: 1fr;
  }
}
`;

const generatedRobotStyles = `
:root {
  --primary: #005f92;
  --primary-dark: #004a73;
  --primary-light: #e0f2fe;
  --secondary: #1f2937;
  --success: #22c55e;
  --danger: #ef4444;
  --light: #f8fafc;
  --dark: #111827;
  --gray: #64748b;
  --gray-light: #e2e8f0;
  --gray-lighter: #f3f4f6;
  --gray-medium: #d1d5db;
  --launch-primary: var(--primary);
  --blue-50: #eff6ff;
  --blue-100: #dbeafe;
  --blue-200: #bfdbfe;
  --blue-500: #0077b6;
  --blue-600: var(--primary);
  --blue-700: var(--primary-dark);
  --blue-800: var(--secondary);
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --radius: 12px;
  --shadow: 0 4px 16px rgba(15, 23, 42, .08);
  --shadow-lg: 0 8px 32px rgba(15, 23, 42, .14);
}
* { box-sizing: border-box; }
body {
  margin: 0;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: "Nunito", "Segoe UI", system-ui, -apple-system, sans-serif;
  background: #f0f2f5;
  color: var(--dark);
}
button, input { font: inherit; }
.hidden { display: none !important; }
.launch-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  background: rgba(255, 255, 255, .95);
  transition: opacity .3s;
}
.start-title { margin: 0 0 1rem; color: var(--launch-primary); font-size: 3.8rem; font-weight: 900; line-height: normal; letter-spacing: -.02em; text-align: center; }
.start-level-pill { display: inline-block; margin-bottom: 2rem; padding: .5rem 1rem; border-radius: 20px; background: #e0f2fe; color: #0369a1; font-size: 1rem; font-weight: 600; letter-spacing: .01em; }
.start-actions { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.big-btn { min-width: 200px; margin: .5rem; display: inline-flex; align-items: center; justify-content: center; gap: .5rem; padding: 1rem 2rem; border: 0; border-radius: .5rem; background: var(--launch-primary); color: #fff; font-size: 1.2rem; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, .1); transition: transform .2s; }
.big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
.big-btn.btn-info { border: 2px solid var(--launch-primary); background: #fff; color: var(--launch-primary); }
.countdown-number { color: var(--launch-primary); font-size: clamp(5rem, 18vw, 8rem); font-weight: 900; animation: countdownPop .5s ease-out; }
.info-overlay { z-index: 110; justify-content: flex-start; background: rgba(15, 23, 42, .58); backdrop-filter: blur(3px); }
.info-modal-content { position: relative; width: 90%; max-width: 600px; margin: auto; padding: 2.5rem; border: 1px solid #e5e7eb; border-radius: 1rem; background: #fff; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, .1); }
.close-info-btn { position: absolute; top: .8rem; right: .9rem; padding: 0; border: 0; background: transparent; color: var(--slate-400); font-size: 1.7rem; line-height: 1; cursor: pointer; }
.info-header { margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 2px solid var(--slate-100); text-align: center; }
.info-title { margin: 0; color: var(--launch-primary); font-size: 1.8rem; font-weight: 900; }
.info-subtitle { margin: .45rem 0 0; color: var(--slate-500); font-size: .9rem; }
.info-details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.info-item { min-width: 0; padding: .9rem; border: 1px solid var(--slate-200); border-radius: .6rem; background: var(--slate-50); }
.info-item-wide { grid-column: 1 / -1; }
.metadata-label { display: block; margin-bottom: .25rem; color: var(--slate-500); font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.metadata-value { display: block; overflow-wrap: anywhere; color: var(--slate-700); font-size: .95rem; font-weight: 600; }
.metadata-description { line-height: 1.55; }
.info-close-action { margin-top: 1.35rem; text-align: center; }
.info-close-action .big-btn { min-width: 170px; padding: .75rem 1.5rem; font-size: .95rem; }
.main-container {
  width: 100%;
  max-width: none;
  min-height: 70vh;
  height: auto;
  margin: 0;
  padding: clamp(12px, 2vh, 24px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.4vh, 16px);
  border-radius: .5rem;
  background: #fff;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / .1);
}
.game-title { flex: 0 0 auto; text-align: center; }
.game-title h1 { margin: 0; color: var(--secondary); font-size: clamp(1.45rem, 3vh, 2rem); font-style: italic; font-weight: 800; }
.rules-section {
  flex: 0 0 auto;
  width: min(760px, 100%);
  margin: 0 auto;
  padding: .65rem 1rem;
  border: 1px solid var(--blue-200);
  border-radius: .75rem;
  background: var(--blue-50);
  text-align: center;
}
.rules-section p { margin: 0; color: var(--primary); font-size: .86rem; font-weight: 600; line-height: 1.4; }
.rules-section strong { color: var(--gray); font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; }
.game-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(180px, 220px) minmax(0, 1fr) minmax(220px, 260px);
  gap: clamp(10px, 1.5vw, 18px);
  align-items: stretch;
  overflow: hidden;
}
.instructions-panel, .progress-panel {
  min-height: 0;
  overflow: hidden;
  background: var(--slate-50);
  border: 1.5px solid var(--gray-light);
  border-radius: .75rem;
  display: flex;
  flex-direction: column;
}
.progress-panel { background: #fff; }
.instructions-panel .panel-header {
  margin: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  text-align: center;
  font-size: .95rem;
  font-weight: 700;
}
.drop-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 12px 10px;
  overflow: auto hidden;
  transition: background .25s, outline .25s;
}
.drop-zone.drag-over { background: var(--primary-light); outline: 2px dashed var(--primary); outline-offset: -4px; }
.placeholder-text { padding: 30px 10px; color: var(--slate-500); font-size: .82rem; font-style: italic; line-height: 1.5; text-align: center; }
.center-area { min-width: 0; min-height: 0; overflow: hidden; display: flex; flex-direction: column; gap: 12px; }
.puzzle-pieces-row {
  flex: 0 0 auto;
  min-height: 64px;
  max-height: 112px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px 16px;
  overflow-x: auto;
  background: #fff;
  border: 1.5px solid var(--gray-light);
  border-radius: .75rem;
}
.puzzle-piece {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: 2px solid var(--slate-400);
  border-radius: 6px;
  background: #fff;
  color: var(--slate-700);
  font-size: .82rem;
  font-weight: 600;
  white-space: nowrap;
  user-select: none;
  cursor: grab;
  transition: transform .2s, border-color .2s, background .2s, box-shadow .2s;
}
.puzzle-piece:hover { z-index: 5; transform: translateY(-2px); border-color: var(--primary); background: var(--primary-light); }
.puzzle-piece.dragging { opacity: .4; transform: scale(.95); }
.puzzle-piece.active { box-shadow: 0 0 0 3px rgba(0, 95, 146, .24); background: var(--primary-light); }
.puzzle-piece input { width: 34px; padding: 2px; border: 1.5px solid var(--slate-300); border-radius: 4px; background: var(--slate-100); text-align: center; font-size: .82rem; font-weight: 700; }
.puzzle-piece::after {
  content: "";
  position: absolute;
  right: -9px;
  top: 50%;
  width: 9px;
  height: 14px;
  transform: translateY(-50%);
  border: 2px solid var(--slate-400);
  border-left: 0;
  border-radius: 0 6px 6px 0;
  background: inherit;
}
.puzzle-piece::before {
  content: "";
  position: absolute;
  left: -1px;
  top: 50%;
  width: 9px;
  height: 14px;
  transform: translateY(-50%);
  border-radius: 6px 0 0 6px;
  background: inherit;
}
.puzzle-pieces-row .puzzle-piece { padding: 10px 18px; border-radius: 10px; }
.puzzle-pieces-row .puzzle-piece::before, .puzzle-pieces-row .puzzle-piece::after { display: none; }
.piece-inicio { padding-left: 14px; border-color: var(--primary); background: var(--primary-light); color: var(--secondary); }
.piece-inicio::before { display: none; }
.piece-inicio::after { border-color: var(--primary); background: var(--primary-light); }
.piece-fin { padding-right: 14px; border-color: var(--slate-600); background: var(--slate-200); color: var(--slate-700); }
.piece-fin::after { display: none; }
.piece-avanzar { border-color: var(--primary); color: var(--primary); }
.piece-avanzar::after { border-color: var(--primary); }
.piece-recoger { border-color: var(--slate-500); color: var(--slate-600); }
.piece-recoger::after { border-color: var(--slate-500); }
.drop-zone .puzzle-piece { width: 88%; justify-content: center; padding: 10px 14px 14px; border-radius: 8px; font-size: .78rem; }
.drop-zone .puzzle-piece::before, .drop-zone .puzzle-piece::after { display: none; }
.drop-zone .puzzle-piece + .puzzle-piece { margin-top: 2px; }
.connector-bottom {
  position: absolute;
  bottom: -10px;
  left: 50%;
  z-index: 3;
  width: 26px;
  height: 11px;
  transform: translateX(-50%);
  border: 2px solid var(--slate-400);
  border-top: 0;
  border-radius: 0 0 10px 10px;
  background: inherit;
}
.connector-top {
  position: absolute;
  top: -2px;
  left: 50%;
  z-index: 3;
  width: 26px;
  height: 11px;
  transform: translateX(-50%);
  border: 2px solid var(--slate-300);
  border-top: 0;
  border-radius: 0 0 10px 10px;
  background: var(--slate-100);
}
.piece-inicio .connector-top, .piece-fin .connector-bottom { display: none; }
.remove-btn {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--slate-500);
  color: #fff;
  font-size: .62rem;
  cursor: pointer;
}
.board-area {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px 20px;
  overflow: auto;
  background: var(--slate-50);
  border: 1.5px solid var(--gray-light);
  border-radius: .75rem;
}
.game-grid { width: fit-content; max-width: 100%; display: grid; gap: 2px; padding: 3px; border: 2px solid var(--gray-medium); border-radius: 10px; background: var(--gray-light); }
.grid-cell {
  position: relative;
  width: var(--cell-size, 110px);
  max-width: var(--cell-size, 110px);
  aspect-ratio: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #c9d3e3;
  border-radius: 4px;
  background: #fff;
  font-size: clamp(.9rem, 2vw, 1.5rem);
}
.grid-cell.path { background: var(--slate-50); }
.grid-cell.start { background: var(--primary-light); }
.grid-cell.end { background: var(--gray-light); }
.object-icon { z-index: 1; font-size: clamp(1.1rem, 2.4vw, 1.85rem); }
.robot-sprite, .robot-fallback { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; object-fit: contain; }
.robot-fallback { display: flex; align-items: center; justify-content: center; font-size: clamp(2rem, 5vw, 4rem); animation: robotFloat .65s ease-in-out infinite alternate; }
.robot-sprite + .robot-fallback { visibility: hidden; }
.robot-sprite.is-missing { display: none; }
.robot-sprite.is-missing + .robot-fallback { visibility: visible; }
.robot-sprite.collecting { width: 64%; right: auto; }
.progress-panel .panel-header { padding: 10px 12px; border-bottom: 1px solid var(--gray-medium); color: var(--secondary); text-align: left; font-size: 1.05rem; font-weight: 700; }
.progress-info { display: flex; flex-direction: column; gap: 8px; padding: 12px; }
.info-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: .62rem .7rem; border: 1px solid var(--gray-light); border-radius: .6rem; background: var(--light); font-size: .86rem; }
.info-label { color: var(--secondary); font-weight: 700; }
.info-value { color: var(--primary); font-weight: 600; text-align: right; }
.action-buttons { display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; border-top: 1px solid var(--gray-light); }
.btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; border: 0; border-radius: 8px; font-weight: 700; font-size: .9rem; cursor: pointer; transition: transform .2s, box-shadow .2s, background .2s; }
.btn:hover { transform: translateY(-1px); box-shadow: var(--shadow); }
.btn:disabled { opacity: .55; cursor: wait; transform: none; }
.btn-validate { background: var(--primary); color: #fff; }
.btn-validate:hover { background: var(--primary-dark); }
.btn-finish, .btn-prev { background: var(--secondary); color: #fff; }
.btn-finish:hover, .btn-prev:hover { background: var(--dark); }
.navigation-buttons { flex: 0 0 auto; display: flex; justify-content: center; gap: 16px; margin: 0; }
.btn-nav { min-width: 180px; padding: 12px 32px; border-radius: 24px; }
.notification { position: fixed; top: 20px; right: 20px; z-index: 80; max-width: min(360px, calc(100vw - 40px)); padding: 14px 24px; border-radius: 10px; background: var(--primary); color: #fff; font-weight: 600; box-shadow: var(--shadow-lg); animation: slideIn .3s ease; }
.notification.error { background: var(--danger); }
.modal, .modal-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(15, 23, 42, .58); }
.modal-card { width: min(520px, 100%); overflow: hidden; border-radius: 18px; background: #fff; text-align: center; box-shadow: 0 12px 40px rgba(0, 0, 0, .24); }
.modal-content { width: min(520px, 100%); padding: 28px 26px; border-radius: 16px; background: #fff; text-align: center; box-shadow: 0 12px 40px rgba(0, 0, 0, .2); }
.modal-content h2 { margin: 0 0 8px; color: var(--slate-800); font-size: 1.4rem; }
.modal-content p { margin: 8px 0; color: var(--slate-500); }
.modal-buttons { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
.btn-modal-primary, .btn-modal-secondary { padding: 10px 22px; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-modal-primary { border: 2px solid var(--primary); background: var(--primary); color: #fff; }
.btn-modal-secondary { border: 2px solid var(--slate-300); background: #fff; color: var(--slate-700); }
.ar-modal-header { padding: 14px 16px; background: var(--primary); color: #fff; font-size: 1.1rem; font-weight: 800; text-align: center; }
.ar-visual { position: relative; min-height: 150px; margin: 0; padding: 18px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; font-size: 2rem; font-weight: 900; text-shadow: 1px 2px 5px rgba(15, 23, 42, .45); }
.ar-visual::before { content: "⬆   ➡   ⭐   🤖"; position: absolute; inset: 16px; color: rgba(255, 255, 255, .18); font-size: 1.5rem; letter-spacing: 2rem; animation: robotFloat 1.8s ease-in-out infinite alternate; }
.ar-visual > * { position: relative; z-index: 1; }
.ar-visual img, .ar-visual video { max-width: 90%; max-height: 220px; border-radius: 8px; background: #fff; text-shadow: none; }
.ar-visual audio { width: 90%; }
.ar-modal-footer { display: flex; justify-content: center; padding: 12px 16px 16px; background: #fff; }
.ar-modal-footer .btn { padding: .7rem 1.6rem; background: var(--launch-primary); }
@keyframes robotFloat { to { transform: translateY(-4px); } }
@keyframes countdownPop { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
@keyframes slideIn { from { transform: translateX(120%); opacity: 0; } }
@media (max-width: 900px) {
  body { overflow-y: auto; }
  .main-container { height: auto; min-height: calc(100dvh - 20px); overflow: visible; }
  .game-layout { grid-template-columns: 1fr; gap: 12px; overflow: visible; }
  .instructions-panel { order: 1; min-height: 280px; max-height: 430px; }
  .center-area { order: 2; }
  .progress-panel { order: 3; height: fit-content; }
  .board-area { min-height: 300px; max-height: 62dvh; }
  .puzzle-pieces-row { justify-content: flex-start; }
  .game-title h1 { font-size: 1.5rem; }
}
@media (max-width: 600px) {
  body { padding: 8px; }
  .main-container { padding: 12px 10px; }
  .puzzle-piece { padding: 6px 10px; font-size: .72rem; }
  .board-area { justify-content: flex-start; }
  .launch-overlay { padding: 16px; }
  .info-modal-content { padding: 1.5rem 1rem; }
  .info-details-grid { grid-template-columns: 1fr; }
  .info-item-wide { grid-column: auto; }
}
@media (min-width: 901px) and (max-height: 700px) {
  .puzzle-pieces-row { min-height: 54px; max-height: 76px; padding: 8px 12px; gap: 8px; }
  .puzzle-pieces-row .puzzle-piece { padding: 7px 12px; }
  .progress-info { gap: 5px; padding: 9px; }
  .info-row { padding: .42rem .55rem; }
  .action-buttons { padding: 9px; }
  .btn { padding: 8px 14px; }
  .btn-nav { padding: 8px 24px; }
}
`;

const generatedRobotScript = `
(function () {
  const payload = window.ROBOT_GENERATED;
  const fullConfig = payload.fullConfig || {};
  const level = payload.level || "basico";
  const levelLabels = { basico: "Básico", intermedio: "Intermedio", avanzado: "Avanzado" };
  const levelAttempts = { basico: 3, intermedio: 2, avanzado: 1 };
  const levelPoints = { basico: 10, intermedio: 20, avanzado: 30 };
  const exercises = payload.exercises || [];
  const selectedStages = payload.selectedStages || {};
  const arConfig = payload.arConfig || {};
  const robotAssets = payload.robotAssets || {};
  const arEnabled = !!payload.arEnabled;
  let index = 0;
  let score = 0;
  let attempts = levelAttempts[level] || 3;
  let sequence = [];
  let robotCol = 0;
  let collected = [];
  let running = false;
  let robotMode = "greeting";
  let dragPayload = null;
  let countdownTimer = null;

  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const objectKey = (object) => object.row + ":" + object.col + ":" + object.type;
  const currentExercise = () => exercises[index] || exercises[0] || {
    name: "Primeros pasos",
    description: "Avanza hasta la meta.",
    grid: [["S", ".", ".", ".", "E"]],
    objects: []
  };
  const startCol = (exercise) => (exercise.grid[0] || []).indexOf("S");
  const endCol = (exercise) => (exercise.grid[0] || []).indexOf("E");
  const hasStageContent = (stage) => !!(stage && (stage.text || stage.imageUrl || stage.audioUrl || stage.videoUrl));
  const objectIcon = (type) => type === "star" || type === "⭐" ? "⭐" : type === "diamond" || type === "💎" ? "💎" : "📦";
  const instructionLabel = (id) => ({ inicio: "Inicio", avanzar: "Avanzar", recoger: "Recoger objetos", fin: "Fin" }[id] || id);
  const robotSource = () => {
    if (robotMode === "walking") return robotAssets.walking || "Imagen/camina.gif";
    if (robotMode === "success") return robotAssets.success || "Imagen/salto.gif";
    return robotAssets.greeting || "Imagen/saludar.gif";
  };

  function formatDisplayDate(value) {
    if (!value) return "No especificada";
    const dateOnly = String(value).match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
    const parsed = dateOnly
      ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
      : new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(parsed);
  }

  function populateLaunchInformation() {
    $("start-level").textContent = levelLabels[level] || level;
    $("info-author").textContent = fullConfig.autor || "No especificado";
    $("info-version").textContent = fullConfig.version || "1.0.0";
    $("info-date").textContent = formatDisplayDate(fullConfig.fecha);
    $("info-level").textContent = levelLabels[level] || level;
    $("info-description").textContent = fullConfig.descripcion || "Sin descripción.";
    $("info-platforms").textContent = Array.isArray(fullConfig.plataformas) && fullConfig.plataformas.length
      ? fullConfig.plataformas.map((platform) => ({ web: "Web", android: "Android", ios: "iOS" }[String(platform).toLowerCase()] || platform)).join(", ")
      : "Web";
  }

  function toggleInfo(show) {
    const overlay = $("info-overlay");
    overlay.classList.toggle("hidden", !show);
    overlay.setAttribute("aria-hidden", show ? "false" : "true");
    if (show) $("close-info-icon").focus();
    else $("show-info-btn").focus();
  }

  async function launchConfiguredGame() {
    $("countdown-screen").classList.add("hidden");
    $("start-screen").classList.add("hidden");
    $("game-screen").classList.remove("hidden");
    window.requestAnimationFrame(renderBoard);
    await showARStage("Inicio");
  }

  function startGameFlow() {
    if (countdownTimer) window.clearInterval(countdownTimer);
    $("start-screen").classList.add("hidden");
    $("game-screen").classList.add("hidden");
    $("countdown-screen").classList.remove("hidden");
    const display = $("countdown-display");
    let remaining = 5;
    display.textContent = String(remaining);

    countdownTimer = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        display.textContent = String(remaining);
        display.style.animation = "none";
        void display.offsetHeight;
        display.style.animation = "countdownPop .5s ease-out";
        return;
      }
      window.clearInterval(countdownTimer);
      countdownTimer = null;
      launchConfiguredGame();
    }, 1000);
  }

  function returnToStart() {
    if (countdownTimer) window.clearInterval(countdownTimer);
    countdownTimer = null;
    index = 0;
    score = 0;
    resetExercise(false);
    $("countdown-screen").classList.add("hidden");
    $("game-screen").classList.add("hidden");
    $("start-screen").classList.remove("hidden");
  }

  function showARStage(stageName) {
    const stage = arConfig[stageName] || {};
    if (!arEnabled || !selectedStages[stageName] || !hasStageContent(stage)) return Promise.resolve();
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "modal";
      const card = document.createElement("div");
      card.className = "modal-card";
      const header = document.createElement("div");
      header.className = "ar-modal-header";
      header.textContent = stageName === "Inicio" ? "Inicio del juego" : stageName === "Final" ? "Final del juego" : "Acierto";
      const visual = document.createElement("div");
      visual.className = "ar-visual";
      let content;
      if (stage.imageUrl) {
        content = document.createElement("img");
        content.src = stage.imageUrl;
        content.alt = "Contenido RA";
      } else if (stage.videoUrl) {
        content = document.createElement("video");
        content.src = stage.videoUrl;
        content.controls = true;
        content.autoplay = true;
        content.muted = true;
      } else if (stage.audioUrl) {
        content = document.createElement("audio");
        content.src = stage.audioUrl;
        content.controls = true;
        content.autoplay = true;
      } else {
        content = document.createElement("span");
        content.textContent = stage.text || stageName;
      }
      const continueButton = document.createElement("button");
      continueButton.className = "btn";
      continueButton.textContent = "Siguiente";
      continueButton.addEventListener("click", () => {
        overlay.remove();
        resolve();
      });
      const footer = document.createElement("div");
      footer.className = "ar-modal-footer";
      footer.appendChild(continueButton);
      visual.appendChild(content);
      card.appendChild(header);
      card.appendChild(visual);
      card.appendChild(footer);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    });
  }

  function createPuzzlePiece(id, itemIndex, sourceParam) {
    const piece = document.createElement("div");
    const isSource = itemIndex === null;
    piece.className = "puzzle-piece piece-" + id;
    piece.draggable = true;
    piece.tabIndex = 0;
    piece.dataset.instructionId = id;
    if (!isSource) piece.dataset.sequenceIndex = String(itemIndex);

    if (!isSource && itemIndex > 0) {
      const connectorTop = document.createElement("span");
      connectorTop.className = "connector-top";
      piece.appendChild(connectorTop);
    }

    const label = document.createElement("span");
    label.textContent = instructionLabel(id);
    piece.appendChild(label);
    if (id === "avanzar") {
      const input = document.createElement("input");
      input.type = "number";
      input.min = "1";
      input.max = "20";
      input.placeholder = "?";
      input.value = sourceParam || "";
      input.setAttribute("aria-label", "Bloques a avanzar");
      input.addEventListener("click", (event) => event.stopPropagation());
      input.addEventListener("input", (event) => {
        if (!isSource && sequence[itemIndex]) sequence[itemIndex].param = Math.max(0, Number(event.target.value) || 0);
      });
      piece.appendChild(input);
      const suffix = document.createElement("span");
      suffix.textContent = "bloques";
      piece.appendChild(suffix);
    }

    if (!isSource) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-btn";
      remove.title = "Eliminar";
      remove.textContent = "✕";
      remove.addEventListener("click", (event) => {
        event.stopPropagation();
        if (running) return;
        sequence.splice(itemIndex, 1);
        renderSequence();
      });
      piece.appendChild(remove);
      if (itemIndex < sequence.length - 1) {
        const connectorBottom = document.createElement("span");
        connectorBottom.className = "connector-bottom";
        piece.appendChild(connectorBottom);
      }
    }

    piece.addEventListener("dragstart", (event) => {
      if (running) {
        event.preventDefault();
        return;
      }
      const input = piece.querySelector("input");
      dragPayload = {
        fromSequence: !isSource,
        index: isSource ? null : itemIndex,
        id: id,
        param: input ? Math.max(0, Number(input.value) || 0) : 0
      };
      piece.classList.add("dragging");
      event.dataTransfer.effectAllowed = isSource ? "copy" : "move";
      event.dataTransfer.setData("text/plain", id);
    });
    piece.addEventListener("dragend", () => {
      piece.classList.remove("dragging");
      document.querySelectorAll(".drop-indicator").forEach((node) => node.classList.remove("drop-indicator"));
    });

    if (isSource) {
      const addFromSource = () => {
        if (running) return;
        const input = piece.querySelector("input");
        addInstruction(id, input ? Number(input.value) || 2 : 0);
      };
      piece.addEventListener("click", addFromSource);
      piece.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          addFromSource();
        }
      });
    } else {
      piece.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = dragPayload && dragPayload.fromSequence ? "move" : "copy";
      });
      piece.addEventListener("drop", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const rect = piece.getBoundingClientRect();
        insertDraggedAt(event.clientY < rect.top + rect.height / 2 ? itemIndex : itemIndex + 1);
      });
    }
    return piece;
  }

  function renderSourcePieces() {
    const row = $("puzzle-pieces-row");
    row.innerHTML = "";
    ["inicio", "avanzar", "recoger", "fin"].forEach((id) => row.appendChild(createPuzzlePiece(id, null, id === "avanzar" ? "" : 0)));
  }

  function insertDraggedAt(targetIndex) {
    if (!dragPayload || running) return;
    let insertAt = Math.max(0, Math.min(targetIndex, sequence.length));
    if (dragPayload.fromSequence) {
      const moved = sequence.splice(dragPayload.index, 1)[0];
      if (dragPayload.index < insertAt) insertAt -= 1;
      sequence.splice(insertAt, 0, moved);
    } else {
      sequence.splice(insertAt, 0, { id: dragPayload.id, label: instructionLabel(dragPayload.id), param: dragPayload.id === "avanzar" ? dragPayload.param || 2 : 0 });
    }
    dragPayload = null;
    renderSequence();
  }

  function resetExercise(keepAttempts) {
    const exercise = currentExercise();
    robotCol = Math.max(0, startCol(exercise));
    collected = [];
    sequence = [];
    robotMode = "greeting";
    if (!keepAttempts) attempts = levelAttempts[level] || 3;
    render();
  }

  function loadHint() {
    if (running) return;
    const exercise = currentExercise();
    const objects = (exercise.objects || []).slice().sort((a, b) => a.col - b.col);
    const hint = [{ id: "inicio", label: instructionLabel("inicio"), param: 0 }];
    let cursor = Math.max(0, startCol(exercise));
    objects.forEach((object) => {
      if (object.col > cursor) {
        hint.push({ id: "avanzar", label: instructionLabel("avanzar"), param: object.col - cursor });
      }
      hint.push({ id: "recoger", label: instructionLabel("recoger"), param: 0 });
      cursor = object.col;
    });
    const target = Math.max(cursor, endCol(exercise));
    if (target > cursor) {
      hint.push({ id: "avanzar", label: instructionLabel("avanzar"), param: target - cursor });
    }
    hint.push({ id: "fin", label: instructionLabel("fin"), param: 0 });
    sequence = hint;
    renderSequence();
  }

  function renderBoard() {
    const exercise = currentExercise();
    const board = $("game-grid");
    const boardArea = document.querySelector(".board-area");
    const row = exercise.grid[0] || [];
    const availableWidth = Math.max(0, (boardArea ? boardArea.clientWidth : 0) - 48);
    const availableHeight = Math.max(0, (boardArea ? boardArea.clientHeight : 0) - 40);
    const byWidth = availableWidth ? Math.floor((availableWidth - (row.length - 1) * 2) / row.length) : 0;
    let targetSize = row.length >= 14 ? 110 : row.length >= 11 ? 125 : row.length >= 8 ? 140 : 160;
    const fittedSize = Math.min(targetSize, byWidth || targetSize, availableHeight || targetSize);
    const cellSize = Math.max(48, fittedSize);
    board.style.gridTemplateColumns = "repeat(" + row.length + ", " + cellSize + "px)";
    board.style.setProperty("--cell-size", cellSize + "px");
    board.innerHTML = "";
    row.forEach((cell, col) => {
      const div = document.createElement("div");
      div.className = "grid-cell robot-cell " + (cell === "S" ? "start" : cell === "E" ? "end" : cell === "O" ? "object" : "path");
      const cellLabel = document.createElement("span");
      cellLabel.className = "robot-cell-label";
      cellLabel.textContent = cell === "S" ? "I" : cell === "E" ? "F" : String(col);
      div.appendChild(cellLabel);
      const object = exercise.objects.find((candidate) => candidate.col === col && !collected.includes(objectKey(candidate)));
      if (object && robotCol !== col) {
        const obj = document.createElement("span");
        obj.className = "object-icon robot-object " + object.type;
        obj.textContent = objectIcon(object.type);
        div.appendChild(obj);
      }
      if (robotCol === col) {
        const robot = document.createElement("img");
        robot.className = "robot-sprite" + (robotMode === "collecting" ? " collecting" : "");
        robot.src = robotSource();
        robot.alt = robotMode === "walking" ? "Robot caminando" : robotMode === "success" ? "Robot celebrando" : "Robot saludando";
        robot.addEventListener("error", () => robot.classList.add("is-missing"));
        const fallback = document.createElement("span");
        fallback.className = "robot-fallback";
        fallback.textContent = "🤖";
        div.appendChild(robot);
        div.appendChild(fallback);
        if (object) {
          const obj = document.createElement("span");
          obj.className = "object-icon";
          obj.textContent = objectIcon(object.type);
          div.appendChild(obj);
        }
      }
      board.appendChild(div);
    });
  }

  function renderSequence(activeIndex) {
    const list = $("sequence-drop-zone");
    list.innerHTML = "";
    if (sequence.length === 0) {
      const placeholder = document.createElement("span");
      placeholder.className = "placeholder-text";
      placeholder.textContent = "Arrastra las fichas aquí para armar la secuencia";
      list.appendChild(placeholder);
      return;
    }
    sequence.forEach((item, itemIndex) => {
      const piece = createPuzzlePiece(item.id, itemIndex, item.param);
      if (activeIndex === itemIndex) piece.classList.add("active");
      list.appendChild(piece);
    });
  }

  function renderProgress() {
    $("exercise-display").textContent = (index + 1) + " / " + Math.max(1, exercises.length);
    $("score-display").textContent = String(score);
    $("attempts-display").textContent = String(attempts);
    $("objects-display").textContent = collected.length + "/" + currentExercise().objects.length;
    $("btn-validate").disabled = running;
    $("btn-finish").disabled = running;
    $("btn-reset").disabled = running;
  }

  function render(activeIndex) {
    const exercise = currentExercise();
    $("exercise-name").textContent = exercise.name || "Robot Walking";
    const rules = $("rules-text");
    rules.innerHTML = "<strong>Reglas básicas:</strong> ";
    rules.appendChild(document.createTextNode(exercise.description + " Observa el recorrido y ordena correctamente las instrucciones."));
    renderProgress();
    renderBoard();
    renderSequence(activeIndex);
  }

  function addInstruction(id, param) {
    if (running) return;
    sequence.push({ id, label: instructionLabel(id), param: id === "avanzar" ? param || 2 : 0 });
    renderSequence();
  }

  function showNotification(message, type) {
    const previous = document.querySelector(".notification");
    if (previous) previous.remove();
    const notification = document.createElement("div");
    notification.className = "notification" + (type === "error" ? " error" : "");
    notification.textContent = message;
    document.body.appendChild(notification);
    window.setTimeout(() => notification.remove(), 2600);
  }

  function showResult(title, message, actions) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    const content = document.createElement("div");
    content.className = "modal-content";
    const heading = document.createElement("h2");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    const buttons = document.createElement("div");
    buttons.className = "modal-buttons";
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.textContent = action.label;
      button.className = action.secondary ? "btn-modal-secondary" : "btn-modal-primary";
      button.addEventListener("click", () => {
        overlay.remove();
        action.run();
      });
      buttons.appendChild(button);
    });
    content.appendChild(heading);
    content.appendChild(paragraph);
    content.appendChild(buttons);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
  }

  async function validateSolution() {
    if (running) return;
    if (!sequence.length || sequence[0].id !== "inicio" || sequence[sequence.length - 1].id !== "fin") {
      showResult("Secuencia incorrecta", 'La secuencia debe iniciar con "Inicio" y terminar con "Fin".', [{ label: "Cerrar", run: function () {} }]);
      return;
    }
    running = true;
    renderProgress();
    const exercise = currentExercise();
    const row = exercise.grid[0] || [];
    robotCol = startCol(exercise);
    collected = [];
    robotMode = "greeting";
    render();
    await sleep(350);
    let ok = true;
    let message = "";
    for (let i = 0; i < sequence.length; i += 1) {
      const item = sequence[i];
      renderSequence(i);
      await sleep(300);
      if (item.id === "avanzar") {
        const steps = Number(item.param) || 0;
        if (steps <= 0) { ok = false; message = "Avanzar requiere un número mayor a cero."; break; }
        for (let s = 0; s < steps; s += 1) {
          const target = robotCol + 1;
          if (target >= row.length || ![".", "O", "E"].includes(row[target])) { ok = false; message = "El robot se salió del camino."; break; }
          robotMode = "walking";
          robotCol = target;
          renderBoard();
          await sleep(720);
          robotMode = "greeting";
          renderBoard();
        }
        if (!ok) break;
      }
      if (item.id === "recoger") {
        const object = exercise.objects.find((candidate) => candidate.col === robotCol && !collected.includes(objectKey(candidate)));
        if (!object) { ok = false; message = "No hay objeto para recoger en esta casilla."; break; }
        robotMode = "collecting";
        renderBoard();
        await sleep(650);
        collected.push(objectKey(object));
        robotMode = "greeting";
        renderBoard();
        showNotification("¡Objeto recogido!", "success");
      }
    }
    renderSequence();
    const solved = ok && robotCol === endCol(exercise) && collected.length >= exercise.objects.length;
    if (solved) {
      score += levelPoints[level] || 10;
      robotMode = "success";
      renderBoard();
      renderProgress();
      await sleep(1200);
      robotMode = "greeting";
      renderBoard();
      await showARStage("Acierto");
      running = false;
      renderProgress();
      showResult("¡Juego completado!", "Puntos obtenidos: " + (levelPoints[level] || 10), [
        { label: "Salir", secondary: true, run: function () {} },
        { label: index >= exercises.length - 1 ? "Finalizar" : "Siguiente ejercicio", run: index >= exercises.length - 1 ? finishGame : nextExercise }
      ]);
    } else {
      attempts -= 1;
      robotMode = "greeting";
      running = false;
      renderProgress();
      showResult(attempts <= 0 ? "Sin intentos" : "¡Solución incorrecta!", message || "Revisa el camino y los objetos.", [
        { label: "Salir", secondary: true, run: function () {} },
        { label: attempts <= 0 ? (index >= exercises.length - 1 ? "Finalizar" : "Siguiente ejercicio") : "Reintentar", run: attempts <= 0 ? (index >= exercises.length - 1 ? finishGame : nextExercise) : function () { robotCol = Math.max(0, startCol(exercise)); collected = []; render(); } }
      ]);
    }
  }

  async function nextExercise() {
    index += 1;
    resetExercise(false);
  }

  async function finishGame() {
    if (running) return;
    await showARStage("Final");
    showResult("Juego finalizado", "Puntaje final: " + score, [{ label: "Volver al inicio", run: returnToStart }]);
  }

  const dropZone = $("sequence-drop-zone");
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
    insertDraggedAt(sequence.length);
  });
  $("btn-validate").addEventListener("click", validateSolution);
  $("btn-reset").addEventListener("click", () => resetExercise(false));
  $("btn-hint").addEventListener("click", loadHint);
  $("btn-finish").addEventListener("click", finishGame);
  $("start-game-btn").addEventListener("click", startGameFlow);
  $("show-info-btn").addEventListener("click", () => toggleInfo(true));
  $("close-info-icon").addEventListener("click", () => toggleInfo(false));
  $("close-info-btn").addEventListener("click", () => toggleInfo(false));
  $("info-overlay").addEventListener("click", (event) => {
    if (event.target === $("info-overlay")) toggleInfo(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("info-overlay").classList.contains("hidden")) toggleInfo(false);
  });
  window.addEventListener("resize", renderBoard);
  populateLaunchInformation();
  renderSourcePieces();
  resetExercise(false);
})();
`;

export default Robot;
