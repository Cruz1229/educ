import React, { useCallback, useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import { useLocation, useNavigate } from "react-router-dom";
import { buildAlgorithmNativePackage } from "./algorithmNativePackaging";
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
  Clock,
  ListChecks,
  RotateCcw,
  Type,
} from "lucide-react";

const STAGES = ["Inicio", "Acierto", "Final"];

const LEVEL_CONFIG = {
  basico: { required: 3, time: "02:00", seconds: 120, label: "Básico" },
  intermedio: { required: 4, time: "04:00", seconds: 240, label: "Intermedio" },
  avanzado: { required: 5, time: "05:00", seconds: 300, label: "Avanzado" },
};

const CHALLENGES = {
  basico: [
    {
      id: "suma",
      title: "Suma de dos numeros",
      summary: "Solicita dos numeros, sumalos y muestra el resultado.",
      hint: "Lee ambas entradas antes de operar.",
      commands: [
        "Proceso Suma",
        'Escribir "Ingrese el primer numero"',
        "Leer A",
        'Escribir "Ingrese el segundo numero"',
        "Leer B",
        "C <- A + B",
        'Escribir "El resultado es: ", C',
        "FinProceso",
      ],
    },
    {
      id: "metros",
      title: "Convertir metros a centimetros",
      summary: "Pide una distancia en metros y conviertela a centimetros.",
      hint: "Multiplica por 100 para obtener centimetros.",
      commands: [
        "Proceso Conversion",
        'Escribir "Ingrese los metros"',
        "Leer m",
        "cm <- m * 100",
        'Escribir "Son ", cm, " centimetros"',
        "FinProceso",
      ],
    },
    {
      id: "promedio",
      title: "Calcular promedio",
      summary: "Lee tres notas y calcula su promedio.",
      hint: "Divide la suma de las tres notas entre 3.",
      commands: [
        "Proceso Promedio",
        'Escribir "Ingrese nota 1"',
        "Leer n1",
        'Escribir "Ingrese nota 2"',
        "Leer n2",
        'Escribir "Ingrese nota 3"',
        "Leer n3",
        "promedio <- (n1 + n2 + n3) / 3",
        'Escribir "El promedio es: ", promedio',
        "FinProceso",
      ],
    },
    {
      id: "edad",
      title: "Calcular edad aproximada",
      summary: "Calcula la edad a partir del anio de nacimiento.",
      hint: "Resta el anio de nacimiento al anio actual.",
      commands: [
        "Proceso Edad",
        'Escribir "Ingrese su anio de nacimiento"',
        "Leer anio",
        "edad <- 2024 - anio",
        'Escribir "Tu edad aproximada es: ", edad',
        "FinProceso",
      ],
    },
    {
      id: "area",
      title: "Area de un rectangulo",
      summary: "Lee base y altura, luego calcula el area.",
      hint: "Multiplica base por altura.",
      commands: [
        "Proceso AreaRectangulo",
        'Escribir "Ingrese la base"',
        "Leer b",
        'Escribir "Ingrese la altura"',
        "Leer h",
        "area <- b * h",
        'Escribir "El area es: ", area',
        "FinProceso",
      ],
    },
    {
      id: "doble",
      title: "Calcular el doble",
      summary: "Obtiene el doble de un numero dado.",
      hint: "Multiplica el numero por 2.",
      commands: [
        "Proceso Doble",
        'Escribir "Ingrese el numero"',
        "Leer n",
        "doble <- n * 2",
        'Escribir "El doble es: ", doble',
        "FinProceso",
      ],
    },
  ],
  intermedio: [
    {
      id: "temperatura",
      title: "Fahrenheit a Celsius",
      summary: "Convierte grados Fahrenheit a Celsius.",
      hint: "Resta 32 y multiplica por 5/9.",
      commands: [
        "Proceso Temperatura",
        'Escribir "Ingrese grados Fahrenheit"',
        "Leer f",
        "c <- (f - 32) * 5 / 9",
        'Escribir "En Celsius: ", c',
        "FinProceso",
      ],
    },
    {
      id: "promedio-ponderado",
      title: "Promedio ponderado",
      summary: "Calcula el promedio con tres notas y sus pesos.",
      hint: "Usa (n1*p1 + n2*p2 + n3*p3) / (p1+p2+p3).",
      commands: [
        "Proceso PromedioPonderado",
        'Escribir "Ingrese nota 1"',
        "Leer n1",
        'Escribir "Peso de nota 1"',
        "Leer p1",
        'Escribir "Ingrese nota 2"',
        "Leer n2",
        'Escribir "Peso de nota 2"',
        "Leer p2",
        'Escribir "Ingrese nota 3"',
        "Leer n3",
        'Escribir "Peso de nota 3"',
        "Leer p3",
        "prom <- (n1*p1 + n2*p2 + n3*p3) / (p1 + p2 + p3)",
        'Escribir "El promedio es: ", prom',
        "FinProceso",
      ],
    },
    {
      id: "precio-descuento",
      title: "Precio con descuento",
      summary: "Aplica un porcentaje de descuento a un precio.",
      hint: "Multiplica por (1 - descuento/100).",
      commands: [
        "Proceso Descuento",
        'Escribir "Precio base"',
        "Leer precio",
        'Escribir "Descuento %"',
        "Leer desc",
        "final <- precio * (1 - desc / 100)",
        'Escribir "Precio final: ", final',
        "FinProceso",
      ],
    },
    {
      id: "mayor-de-dos",
      title: "Mayor de dos numeros",
      summary: "Determina cual de dos numeros es mayor.",
      hint: "Usa condiciones simples.",
      commands: [
        "Proceso Mayor",
        'Escribir "Ingrese numero A"',
        "Leer a",
        'Escribir "Ingrese numero B"',
        "Leer b",
        "Si a > b Entonces",
        '    Escribir "A es mayor"',
        "SiNo",
        '    Escribir "B es mayor"',
        "FinSi",
        "FinProceso",
      ],
    },
    {
      id: "area-triangulo",
      title: "Area de un triangulo",
      summary: "Calcula el area usando base y altura.",
      hint: "Usa base por altura dividido entre 2.",
      commands: [
        "Proceso AreaTriangulo",
        'Escribir "Ingrese la base"',
        "Leer b",
        'Escribir "Ingrese la altura"',
        "Leer h",
        "area <- (b * h) / 2",
        'Escribir "Area: ", area',
        "FinProceso",
      ],
    },
    {
      id: "salario-neto",
      title: "Salario neto",
      summary: "Calcula salario neto con descuento de seguridad social.",
      hint: "El descuento es porcentaje del salario base.",
      commands: [
        "Proceso SalarioNeto",
        'Escribir "Ingrese salario base"',
        "Leer base",
        'Escribir "Ingrese descuento %"',
        "Leer d",
        "neto <- base - (base * d / 100)",
        'Escribir "Salario neto: ", neto',
        "FinProceso",
      ],
    },
    {
      id: "par-impar",
      title: "Numero par o impar",
      summary: "Indica si un numero ingresado es par o impar.",
      hint: "Usa modulo 2 para decidir.",
      commands: [
        "Proceso ParImpar",
        'Escribir "Ingrese un numero"',
        "Leer n",
        "Si n % 2 = 0 Entonces",
        '    Escribir "Es par"',
        "SiNo",
        '    Escribir "Es impar"',
        "FinSi",
        "FinProceso",
      ],
    },
    {
      id: "distancia-dospuntos",
      title: "Distancia entre dos puntos",
      summary: "Calcula distancia entre (x1,y1) y (x2,y2).",
      hint: "Usa la formula con raiz cuadrada.",
      commands: [
        "Proceso Distancia",
        'Escribir "Ingrese x1"',
        "Leer x1",
        'Escribir "Ingrese y1"',
        "Leer y1",
        'Escribir "Ingrese x2"',
        "Leer x2",
        'Escribir "Ingrese y2"',
        "Leer y2",
        "d <- rc((x2 - x1)^2 + (y2 - y1)^2)",
        'Escribir "Distancia: ", d',
        "FinProceso",
      ],
    },
  ],
  avanzado: [
    {
      id: "factorial",
      title: "Factorial iterativo",
      summary: "Calcula el factorial de un numero positivo.",
      hint: "Usa un ciclo mientras multiplicando desde 1.",
      commands: [
        "Proceso Factorial",
        'Escribir "Ingrese un numero"',
        "Leer n",
        "fact <- 1",
        "i <- 1",
        "Mientras i <= n Hacer",
        "    fact <- fact * i",
        "    i <- i + 1",
        "FinMientras",
        'Escribir "El factorial es: ", fact',
        "FinProceso",
      ],
    },
    {
      id: "contador-pares",
      title: "Contar numeros pares",
      summary: "Cuenta cuantos numeros pares hay en una lista de 5.",
      hint: "Repite 5 veces y usa modulo.",
      commands: [
        "Proceso ContarPares",
        "pares <- 0",
        "i <- 1",
        "Mientras i <= 5 Hacer",
        '    Escribir "Ingrese numero"',
        "    Leer n",
        "    Si n % 2 = 0 Entonces",
        "        pares <- pares + 1",
        "    FinSi",
        "    i <- i + 1",
        "FinMientras",
        'Escribir "Cantidad de pares: ", pares',
        "FinProceso",
      ],
    },
    {
      id: "serie",
      title: "Sumatoria de serie",
      summary: "Suma los numeros del 1 al N.",
      hint: "Inicializa acumulador y usa ciclo.",
      commands: [
        "Proceso Sumatoria",
        'Escribir "Ingrese N"',
        "Leer n",
        "suma <- 0",
        "i <- 1",
        "Mientras i <= n Hacer",
        "    suma <- suma + i",
        "    i <- i + 1",
        "FinMientras",
        'Escribir "La suma es: ", suma',
        "FinProceso",
      ],
    },
    {
      id: "fibonacci",
      title: "Secuencia Fibonacci",
      summary: "Genera los primeros N terminos de Fibonacci.",
      hint: "Usa dos variables previas y actualiza en ciclo.",
      commands: [
        "Proceso Fibonacci",
        'Escribir "Ingrese N"',
        "Leer n",
        "a <- 0",
        "b <- 1",
        "i <- 1",
        "Mientras i <= n Hacer",
        "    Escribir a",
        "    temp <- a + b",
        "    a <- b",
        "    b <- temp",
        "    i <- i + 1",
        "FinMientras",
        "FinProceso",
      ],
    },
    {
      id: "numero-primo",
      title: "Verificar numero primo",
      summary: "Determina si un numero es primo.",
      hint: "Cuenta divisores con un ciclo.",
      commands: [
        "Proceso Primo",
        'Escribir "Ingrese un numero"',
        "Leer n",
        "div <- 0",
        "i <- 1",
        "Mientras i <= n Hacer",
        "    Si n % i = 0 Entonces",
        "        div <- div + 1",
        "    FinSi",
        "    i <- i + 1",
        "FinMientras",
        "Si div = 2 Entonces",
        '    Escribir "Es primo"',
        "SiNo",
        '    Escribir "No es primo"',
        "FinSi",
        "FinProceso",
      ],
    },
    {
      id: "maximo-lista",
      title: "Maximo de una lista",
      summary: "Encuentra el mayor valor en cinco entradas.",
      hint: "Actualiza maximo cuando el valor leido sea mayor.",
      commands: [
        "Proceso MaximoLista",
        "max <- -9999",
        "i <- 1",
        "Mientras i <= 5 Hacer",
        '    Escribir "Ingrese valor"',
        "    Leer n",
        "    Si n > max Entonces",
        "        max <- n",
        "    FinSi",
        "    i <- i + 1",
        "FinMientras",
        'Escribir "Mayor: ", max',
        "FinProceso",
      ],
    },
    {
      id: "tabla-multiplicar",
      title: "Tabla de multiplicar",
      summary: "Genera la tabla del numero ingresado del 1 al 10.",
      hint: "Usa un contador y multiplica en cada iteracion.",
      commands: [
        "Proceso Tabla",
        'Escribir "Ingrese numero"',
        "Leer n",
        "i <- 1",
        "Mientras i <= 10 Hacer",
        "    r <- n * i",
        '    Escribir n, " x ", i, " = ", r',
        "    i <- i + 1",
        "FinMientras",
        "FinProceso",
      ],
    },
    {
      id: "busqueda-lineal",
      title: "Busqueda lineal",
      summary: "Busca un dato dentro de una lista corta.",
      hint: "Compara elemento por elemento hasta encontrarlo.",
      commands: [
        "Proceso Busqueda",
        'Escribir "Dato a buscar"',
        "Leer objetivo",
        "encontrado <- Falso",
        "i <- 1",
        "Mientras i <= 5 Hacer",
        "    Leer dato",
        "    Si dato = objetivo Entonces",
        "        encontrado <- Verdadero",
        "    FinSi",
        "    i <- i + 1",
        "FinMientras",
        "Si encontrado Entonces",
        '    Escribir "Encontrado"',
        "SiNo",
        '    Escribir "No encontrado"',
        "FinSi",
        "FinProceso",
      ],
    },
  ],
};

Object.values(CHALLENGES)
  .flat()
  .forEach((challenge) => {
    challenge.solution = challenge.commands;
  });

const FILE_RULES = {
  Imagen: {
    accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
    extensions: ["jpg", "jpeg", "png"],
    maxSize: 5 * 1024 * 1024,
    urlKey: "imageUrl",
    nameKey: "imageName",
  },
  Audio: {
    accept: ".mp3,audio/mpeg",
    extensions: ["mp3"],
    maxSize: 3 * 1024 * 1024,
    urlKey: "audioUrl",
    nameKey: "audioName",
  },
  Video: {
    accept: ".mp4,video/mp4",
    extensions: ["mp4"],
    maxSize: 10 * 1024 * 1024,
    urlKey: "videoUrl",
    nameKey: "videoName",
  },
};

const EMPTY_STAGE = {
  text: "",
  imageUrl: "",
  imageName: "",
  audioUrl: "",
  audioName: "",
  videoUrl: "",
  videoName: "",
};

const AREA_NAMES = {
  science: "Ciencia",
  technology: "Tecnología",
  engineering: "Ingeniería",
  arts: "Arte",
  math: "Matemáticas",
};

function createEmptyARConfig() {
  return STAGES.reduce((acc, stage) => ({ ...acc, [stage]: { ...EMPTY_STAGE } }), {});
}

function hasStageContent(stage = {}) {
  return Boolean(
    stage.text?.trim() || stage.imageUrl || stage.audioUrl || stage.videoUrl,
  );
}

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dataUrlFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function dataUrlFromMaybeBlob(url) {
  if (!url || !String(url).startsWith("blob:")) return url || "";
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
    return "";
  }
}

function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function ProgressBar({ steps, currentStep }) {
  return <LogicPathProgress currentStep={currentStep} arEnabled={steps.includes("ar")} />;
}

function AnimatedTitle() {
  return <LogicPathTitle title="Juego de Algorithm" symbols={["if", "for", "←", "while"]} />;
}

function ChoiceModal({ onChoose }) {
  return (
    <div className="alg-modal-backdrop">
      <div className="alg-choice-modal">
        <h3>Realidad Aumentada</h3>
        <p>Deseas configurar contenido RA para este juego?</p>
        <div className="alg-modal-actions">
          <button type="button" className="alg-btn secondary" onClick={() => onChoose(false)}>
            Continuar sin RA
          </button>
          <button type="button" className="alg-btn primary" onClick={() => onChoose(true)}>
            Integrar RA
          </button>
        </div>
      </div>
    </div>
  );
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
      symbols={["if", "for", "←", "while", "{ }", "="]}
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
  const resultConfig = {
    success: {
      title: "Solucion correcta",
      message: `Puntos del ejercicio: ${result.points}`,
      actions: [["continue", "Continuar", "primary"]],
    },
    error: {
      title: "Solucion incorrecta",
      message: "Revisa el orden de las instrucciones e intenta de nuevo.",
      actions: [["close", "Reintentar", "primary"]],
    },
    timeout: {
      title: "Tiempo agotado",
      message: "Este desafio queda en cero puntos.",
      actions: [["continue", "Continuar", "primary"]],
    },
    complete: {
      title: "Juego completado",
      message: `Puntos globales: ${result.points}`,
      actions: [
        ["restart", "Volver a jugar", "secondary"],
        ["summary", "Terminar configuracion", "primary"],
      ],
    },
    finish: {
      title: "Juego finalizado",
      message: `Puntaje obtenido: ${result.points}`,
      actions: [
        ["restart", "Volver a jugar", "secondary"],
        ["summary", "Terminar configuracion", "primary"],
      ],
    },
  }[result.type];

  return (
    <div className="alg-modal-backdrop">
      <div className={`alg-result-modal ${result.type}`}>
        <div className="alg-result-icon">{result.type === "error" ? "!" : "OK"}</div>
        <h3>{resultConfig.title}</h3>
        <p>{resultConfig.message}</p>
        <div className="alg-modal-actions">
          {resultConfig.actions.map(([action, label, variant]) => (
            <button
              type="button"
              className={`alg-btn ${variant}`}
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

export function buildGeneratedHtml({
  config,
  gameDetails,
  selectedPlatforms,
  selectedChallenges,
  arEnabled,
  arSelectedStages,
  arConfig,
}) {
  const payload = {
    config,
    gameDetails,
    selectedPlatforms,
    selectedChallenges,
    arEnabled,
    arSelectedStages,
    arConfig,
  };
  const payloadJson = JSON.stringify(payload, null, 2).replace(/<\//g, "<\\/");
  const levelsJson = JSON.stringify(LEVEL_CONFIG, null, 2).replace(/<\//g, "<\\/");
  const challengesJson = JSON.stringify(CHALLENGES, null, 2).replace(/<\//g, "<\\/");
  const previewHeader = buildGeneratedPreviewHeader({
    title: "Algorithm",
    symbols: ["if", "for", "←", "while"],
  });
  const previewHeaderJson = JSON.stringify(previewHeader).replace(/<\//g, "<\\/");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(gameDetails.gameName || "Algorithm")}</title>
  <style>
    :root { --primary:#005f92; --primary-dark:#004a73; --secondary:#1f2937; --muted:#64748b; --light:#f8fafc; --border:#e2e8f0; --success:#22c55e; --danger:#ef4444; --warning:#f59e0b; }
    * { box-sizing: border-box; }
    body { margin:0; width:100%; min-height:100vh; min-height:100dvh; overflow-x:hidden; overflow-y:auto; font-family:'Nunito','Segoe UI',sans-serif; background:#f0f2f5; color:#111827; padding:0; }
    .hidden { display:none !important; }
    .overlay { position:fixed; inset:0; width:100%; min-height:100vh; background:rgba(255,255,255,.95); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:50; transition:opacity .3s; padding:20px; overflow-y:auto; }
    .start-title { color:var(--primary); margin:0 0 1rem; font-size:3.8rem; font-weight:900; line-height:normal; text-align:center; letter-spacing:-.02em; }
    .start-level-pill { display:inline-block; margin-bottom:2rem; padding:.5rem 1rem; border-radius:20px; background:#e0f2fe; color:#0369a1; font-size:1rem; font-weight:600; letter-spacing:.01em; }
    .start-actions { display:flex; flex-direction:column; gap:1rem; align-items:center; }
    .big-btn { min-width:200px; margin:.5rem; padding:1rem 2rem; display:inline-flex; align-items:center; justify-content:center; gap:.5rem; border:0; border-radius:.5rem; background:var(--primary); color:#fff; font-size:1.2rem; font-weight:bold; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,.1); transition:transform .2s; }
    .big-btn:hover { transform:scale(1.05); filter:brightness(1.1); }
    .big-btn.btn-info { border:2px solid var(--primary); background:#fff; color:var(--primary); }
    .countdown-number { color:var(--primary); font-size:clamp(5rem,18vw,8rem); font-weight:900; animation:countdownPop .5s ease-out; }
    @keyframes countdownPop { 0%{transform:scale(0);opacity:0} 80%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
    .info-overlay { background:rgba(0,0,0,.5); backdrop-filter:blur(2px); z-index:100; justify-content:flex-start; }
    .info-modal-content { position:relative; width:90%; max-width:600px; margin:auto; padding:2.5rem; border:1px solid #e5e7eb; border-radius:1rem; background:#fff; box-shadow:0 20px 25px -5px rgba(0,0,0,.1); }
    .close-info-btn { position:absolute; top:1rem; right:1rem; border:0; background:transparent; color:#94a3b8; font-size:1.5rem; cursor:pointer; }
    .info-header { margin-bottom:1.5rem; padding-bottom:1.5rem; border-bottom:2px solid #f1f5f9; text-align:center; }
    .info-title { margin:0; color:var(--primary); font-size:1.8rem; font-weight:900; }
    .info-subtitle { margin-top:.5rem; color:#64748b; font-size:.9rem; }
    .info-details-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; margin-bottom:1.5rem; }
    .info-item { min-width:0; padding:1rem; border:1px solid #e2e8f0; border-radius:.5rem; background:#f8fafc; }
    .info-item.wide { grid-column:1/-1; }
    .info-label { display:block; margin-bottom:.25rem; color:#64748b; font-size:.7rem; font-weight:600; letter-spacing:.05em; text-transform:uppercase; }
    .info-value { display:block; overflow-wrap:anywhere; color:#334155; font-size:.9rem; font-weight:600; line-height:1.55; }
    .info-close-action { text-align:center; }
    .shell { width:100%; max-width:none; min-height:70vh; height:auto; margin:0; }
    .panel { height:100%; min-height:0; overflow:hidden; display:flex; flex-direction:column; gap:clamp(8px,1.4vh,16px); background:#fff; border:1px solid var(--border); border-radius:8px; box-shadow:0 4px 6px -1px rgb(0 0 0 / .1); padding:clamp(12px,2vh,22px); }
    .title { flex:0 0 auto; text-align:center; color:var(--secondary); font-size:clamp(1.45rem,3vh,2.2rem); margin:0; font-style:italic; font-weight:900; }
    .subtitle { flex:0 0 auto; width:min(820px,100%); margin:0 auto; padding:.65rem 1rem; border:1px solid #bae6fd; border-radius:.75rem; background:#eff6ff; color:var(--primary); text-align:center; font-size:.86rem; font-weight:700; line-height:1.4; }
    .subtitle strong { color:var(--secondary); }
    .info-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; margin:18px 0; }
    .info { background:#f8fafc; border:1px solid var(--border); border-radius:10px; padding:10px; }
    .info span { display:block; color:var(--muted); font-size:.78rem; text-transform:uppercase; font-weight:800; }
    .info strong { color:var(--secondary); }
    .game-layout { flex:1 1 auto; min-height:0; overflow:hidden; display:grid; grid-template-columns:minmax(190px,230px) minmax(0,1fr) minmax(220px,250px); gap:clamp(10px,1.5vw,18px); align-items:stretch; }
    .card { min-width:0; min-height:0; overflow:hidden; display:flex; flex-direction:column; background:#fff; border:1.5px solid var(--border); border-radius:12px; padding:0; }
    .card-title { flex:0 0 auto; margin:8px; background:var(--primary); color:#fff; text-align:center; border-radius:8px; padding:10px; font-weight:900; }
    .commands, .lines { min-height:0; display:grid; align-content:start; gap:8px; padding:4px 12px 12px; overflow:auto; }
    button { font:inherit; }
    .command, .line { border:1px solid #cbd5e1; border-radius:8px; background:#fff; padding:9px 10px; font-weight:700; color:#111827; cursor:pointer; text-align:left; }
    .command:hover, .line:hover { border-color:var(--primary); background:#eff6ff; }
    .line { display:flex; justify-content:space-between; gap:8px; align-items:center; }
    .line small { color:var(--muted); }
    .placeholder { color:#94a3b8; font-style:italic; padding:14px; border:1px dashed #cbd5e1; border-radius:8px; text-align:center; }
    .stats { min-height:0; display:grid; align-content:start; gap:8px; padding:4px 12px 12px; overflow:auto; }
    .stat { display:flex; justify-content:space-between; gap:8px; background:#f8fafc; border:1px solid var(--border); border-radius:10px; padding:10px; font-size:.86rem; font-weight:800; }
    .stat strong { color:var(--primary); text-align:right; }
    .actions { display:flex; gap:8px; justify-content:space-between; flex-wrap:wrap; margin-top:auto; padding:12px; border-top:1px solid var(--border); }
    .btn { border:0; border-radius:8px; padding:11px 16px; font-weight:900; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; }
    .btn.primary { background:var(--primary); color:#fff; }
    .btn.secondary { background:var(--secondary); color:#fff; }
    .btn.ghost { background:#fff; border:1px solid var(--border); color:var(--secondary); }
    .btn:disabled { opacity:.55; cursor:not-allowed; }
    .modal { position:fixed; inset:0; background:rgba(0,0,0,.4); display:grid; place-items:center; padding:18px; overflow-y:auto; z-index:200; }
    .modal-card { width:min(440px,96vw); background:#fff; border-radius:12px; padding:20px; text-align:center; box-shadow:0 24px 60px rgba(15,23,42,.28); }
    .ar-card { width:min(620px,calc(100vw - 2rem)); overflow:hidden; border-radius:28px; background:transparent; text-align:center; box-shadow:0 25px 60px rgba(0,0,0,.45); }
    .ar-body { position:relative; min-height:232px; overflow:hidden; display:flex; align-items:center; justify-content:center; padding:1rem; border-radius:28px 28px 0 0; background:radial-gradient(circle at 20% 20%,rgba(255,255,255,.1),transparent 50%),radial-gradient(circle at 80% 80%,rgba(255,255,255,.1),transparent 50%),linear-gradient(135deg,#0077b6 0%,#023e8a 100%); }
    .ar-symbols span { position:absolute; z-index:0; color:rgba(255,255,255,.25); font-size:2rem; font-weight:900; animation:arFloat 5s ease-in-out infinite; }
    .ar-symbols span:nth-child(1){top:12%;left:9%}.ar-symbols span:nth-child(2){top:18%;right:12%;animation-delay:.7s}.ar-symbols span:nth-child(3){bottom:12%;left:14%;animation-delay:1.4s}.ar-symbols span:nth-child(4){right:10%;bottom:15%;animation-delay:2.1s}.ar-symbols span:nth-child(5){top:48%;left:4%;animation-delay:2.8s}.ar-symbols span:nth-child(6){top:46%;right:5%;animation-delay:3.5s}
    .ar-content { position:relative; z-index:1; display:flex; flex-wrap:wrap; align-items:center; justify-content:center; width:100%; gap:1rem; }
    .ar-text { display:flex; align-items:center; justify-content:center; width:min(460px,90%); padding:1rem; color:#fff; font-size:clamp(1.55rem,4vw,2.4rem); font-weight:900; line-height:1.25; text-align:center; text-shadow:0 3px 12px rgba(0,0,0,.35); transform-origin:center; transform-style:preserve-3d; animation:arTextMotion 9s linear infinite; }
    .ar-content img, .ar-content video { width:min(280px,44%); min-height:170px; max-height:220px; object-fit:contain; border:1px solid rgba(255,255,255,.35); border-radius:12px; background:rgba(255,255,255,.14); box-shadow:0 18px 35px rgba(0,0,0,.22); }
    .ar-content audio { width:min(360px,88%); }
    .ar-footer { display:flex; gap:.75rem; padding:.9rem 1.35rem 1.15rem; background:linear-gradient(135deg,#023e8a 0%,#005f92 100%); }
    .ar-footer .btn { flex:1; padding:.72rem 1rem; border:2px solid rgba(255,255,255,.55); border-radius:10px; background:rgba(255,255,255,.12); color:#fff; }
    .ar-footer .btn:hover { border-color:#fff; background:rgba(255,255,255,.24); }
    @keyframes arFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
    @keyframes arTextMotion { 0%{transform:perspective(620px) translateY(0) rotateY(0)} 25%{transform:perspective(620px) translateY(-9px) rotateY(90deg)} 50%{transform:perspective(620px) translateY(0) rotateY(180deg)} 75%{transform:perspective(620px) translateY(9px) rotateY(270deg)} 100%{transform:perspective(620px) translateY(0) rotateY(360deg)} }
    @media (max-width:980px) { body{overflow-y:auto}.shell{height:auto;min-height:calc(100dvh - 20px)}.panel{height:auto;overflow:visible}.game-layout{grid-template-columns:1fr;overflow:visible}.card{max-height:none}.commands,.lines,.stats{max-height:360px} }
    @media (max-width:600px) { body{padding:10px}.info-modal-content{padding:2rem 1rem}.info-details-grid{grid-template-columns:1fr}.info-item.wide{grid-column:auto}.ar-content img,.ar-content video{width:88%} }
    @media (prefers-reduced-motion:reduce) { .ar-text,.ar-symbols span{animation:none} }
    ${algoritmosStyles}
    ${GENERATED_PREVIEW_HEADER_STYLES}
  </style>
</head>
<body>
  <section id="start-screen" class="overlay" aria-labelledby="start-title">
    <h1 id="start-title" class="start-title">Algorithm</h1>
    <div class="start-level-pill">Nivel: <span id="start-level-label"></span></div>
    <div class="start-actions">
      <button id="start-btn" class="big-btn" type="button">▶ Iniciar Juego</button>
      <button id="show-info-btn" class="big-btn btn-info" type="button">ℹ Información</button>
    </div>
  </section>

  <section id="countdown-screen" class="overlay hidden" aria-live="polite">
    <div id="countdown-display" class="countdown-number">5</div>
  </section>

  <section id="info-overlay" class="overlay info-overlay hidden" aria-hidden="true">
    <article class="info-modal-content" role="dialog" aria-modal="true" aria-labelledby="info-game-name">
      <button id="close-info-icon" class="close-info-btn" type="button" aria-label="Cerrar información">&times;</button>
      <header class="info-header">
        <h2 id="info-game-name" class="info-title">Algorithm</h2>
        <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
      </header>
      <div class="info-details-grid">
        <div class="info-item"><span class="info-label">Autor</span><span class="info-value" id="info-author-value"></span></div>
        <div class="info-item"><span class="info-label">Versión</span><span class="info-value" id="info-version-value"></span></div>
        <div class="info-item"><span class="info-label">Fecha</span><span class="info-value" id="info-date-value"></span></div>
        <div class="info-item"><span class="info-label">Nivel</span><span class="info-value" id="info-level-value"></span></div>
        <div class="info-item wide"><span class="info-label">Descripción</span><span class="info-value" id="info-description-value"></span></div>
        <div class="info-item wide"><span class="info-label">Plataformas</span><span class="info-value" id="info-platforms-value"></span></div>
      </div>
      <div class="info-close-action"><button id="close-info-btn" class="big-btn" type="button">Cerrar</button></div>
    </article>
  </section>

  <div class="alg-root" data-preview-parity="algorithm">
    <div class="alg-play-screen">
      <section id="game" class="alg-panel alg-game-panel hidden"></section>
    </div>
  </div>
  <div id="modal-host"></div>
  <script>
    const LEVEL_CONFIG = ${levelsJson};
    const CHALLENGES = ${challengesJson};
    const GENERATED = ${payloadJson};
    const PREVIEW_HEADER = ${previewHeaderJson};
    const state = { index:0, score:0, challenges:[], states:{}, timer:null };
    let countdownTimer = null;
    function clean(text){ return String(text || "").replace(/\\s+/g," ").trim().toLowerCase(); }
    function fmt(total){ total = Math.max(0, Number(total)||0); return String(Math.floor(total/60)).padStart(2,"0") + ":" + String(total%60).padStart(2,"0"); }
    function shuffle(items){ const r = items.slice(); for(let i=r.length-1;i>0;i-=1){ const j=Math.floor(Math.random()*(i+1)); const t=r[i]; r[i]=r[j]; r[j]=t; } return r; }
    function stageHasContent(stage){ return !!(stage && (stage.text || stage.imageUrl || stage.audioUrl || stage.videoUrl)); }
    function formatDisplayDate(value){
      if(!value) return "No especificada";
      const dateOnly=String(value).match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
      const parsed=dateOnly?new Date(Number(dateOnly[1]),Number(dateOnly[2])-1,Number(dateOnly[3])):new Date(value);
      if(Number.isNaN(parsed.getTime())) return String(value);
      return new Intl.DateTimeFormat("es-MX",{day:"numeric",month:"long",year:"numeric"}).format(parsed);
    }
    function platformLabel(platform){
      const key=String(platform||"").toLowerCase();
      return {web:"Web",android:"Android",ios:"iOS"}[key] || platform;
    }
    function populateLaunchInformation(){
      const details=GENERATED.gameDetails || {};
      const level=LEVEL_CONFIG[GENERATED.config.level || "basico"].label;
      document.getElementById("start-level-label").textContent=level;
      document.getElementById("info-author-value").textContent=details.authorName || "No especificado";
      document.getElementById("info-version-value").textContent=details.version || "1.0.0";
      document.getElementById("info-date-value").textContent=formatDisplayDate(details.date);
      document.getElementById("info-level-value").textContent=level;
      document.getElementById("info-description-value").textContent=details.description || "Sin descripción.";
      document.getElementById("info-platforms-value").textContent=(GENERATED.selectedPlatforms || []).length
        ? GENERATED.selectedPlatforms.map(platformLabel).join(", ")
        : "Web";
    }
    function toggleInfo(show){
      const modal=document.getElementById("info-overlay");
      modal.classList.toggle("hidden",!show);
      modal.setAttribute("aria-hidden",show?"false":"true");
      if(show) document.getElementById("close-info-icon").focus();
      else document.getElementById("show-info-btn").focus();
    }
    function startGameSequence(){
      clearInterval(state.timer);
      if(countdownTimer) clearInterval(countdownTimer);
      document.getElementById("start-screen").classList.add("hidden");
      document.getElementById("game").classList.add("hidden");
      document.getElementById("countdown-screen").classList.remove("hidden");
      const display=document.getElementById("countdown-display");
      let remaining=5;
      display.textContent=String(remaining);
      countdownTimer=setInterval(() => {
        remaining-=1;
        if(remaining>0){
          display.textContent=String(remaining);
          display.style.animation="none";
          void display.offsetHeight;
          display.style.animation="countdownPop .5s ease-out";
          return;
        }
        clearInterval(countdownTimer);
        countdownTimer=null;
        start();
      },1000);
    }
    function showAR(stageName){
      if(!GENERATED.arEnabled || !GENERATED.arSelectedStages || !GENERATED.arSelectedStages[stageName]) return Promise.resolve(true);
      const stage = (GENERATED.arConfig && GENERATED.arConfig[stageName]) || {};
      if(!stageHasContent(stage)) return Promise.resolve(true);
      const host = document.getElementById("modal-host");
      const title = stageName === "Inicio" ? "Inicio del juego" : stageName === "Acierto" ? "Acierto" : "Final del juego";
      const continueLabel = stageName === "Inicio" ? "Comenzar" : "Continuar";
      host.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="'+title+'"><div class="ar-card"><div class="ar-body"><div class="ar-symbols" aria-hidden="true"><span>if</span><span>for</span><span>←</span><span>while</span><span>{ }</span><span>=</span></div><div class="ar-content" id="ar-content"></div></div><div class="ar-footer"><button class="btn" id="ar-continue">'+continueLabel+'</button></div></div></div>';
      const content = document.getElementById("ar-content");
      if(stage.text){ const node=document.createElement("div"); node.className="ar-text"; node.textContent=stage.text; content.appendChild(node); }
      if(stage.imageUrl){ const img=document.createElement("img"); img.src=stage.imageUrl; img.alt="Contenido RA"; content.appendChild(img); }
      if(stage.videoUrl){ const video=document.createElement("video"); video.src=stage.videoUrl; video.controls=true; video.autoplay=true; video.muted=true; content.appendChild(video); }
      if(stage.audioUrl){ const audio=document.createElement("audio"); audio.src=stage.audioUrl; audio.controls=true; audio.autoplay=true; content.appendChild(audio); }
      return new Promise(resolve => document.getElementById("ar-continue").onclick = () => { host.innerHTML = ""; resolve(true); });
    }
    function showModal(title, message, actions){
      const host = document.getElementById("modal-host");
      host.innerHTML = '<div class="modal"><div class="modal-card"><h2>'+title+'</h2><p>'+message+'</p><div class="actions" id="modal-actions" style="justify-content:center"></div></div></div>';
      const row = document.getElementById("modal-actions");
      actions.forEach(action => {
        const btn = document.createElement("button");
        btn.className = "btn " + (action.primary ? "primary" : "secondary");
        btn.textContent = action.label;
        btn.onclick = () => { host.innerHTML = ""; action.run(); };
        row.appendChild(btn);
      });
    }
    function start(){
      document.getElementById("start-screen").classList.add("hidden");
      document.getElementById("countdown-screen").classList.add("hidden");
      const level = GENERATED.config.level || "basico";
      const selectedIds = GENERATED.config.challengeIds || [];
      const source = CHALLENGES[level] || [];
      state.challenges = source.filter(item => selectedIds.includes(item.id));
      if(!state.challenges.length) state.challenges = source.slice(0, LEVEL_CONFIG[level].required);
      state.index = 0;
      state.score = 0;
      state.states = {};
      state.challenges.forEach(ch => state.states[ch.id] = { lines:[], available:shuffle(ch.commands), solved:false, remaining:LEVEL_CONFIG[level].seconds, attempts:0, expired:false });
      renderGame(false);
      showAR("Inicio").then(startTimer);
    }
    function current(){ return state.challenges[state.index]; }
    function cstate(){ return state.states[current().id]; }
    function renderGame(beginTimer = true){
      document.getElementById("start-screen").classList.add("hidden");
      const game = document.getElementById("game");
      game.classList.remove("hidden");
      const ch = current();
      const st = cstate();
      game.innerHTML = PREVIEW_HEADER
        + '<div class="alg-game-header"><div><h2>'+ch.title+'</h2><p><strong>Reglas básicas:</strong> '+ch.summary+' Selecciona los comandos y ordénalos correctamente para construir el algoritmo.</p></div><div class="alg-badge">'+LEVEL_CONFIG[GENERATED.config.level].label+'</div></div>'
        + '<div class="alg-game-layout">'
        + '<aside class="alg-side-panel alg-guide-column"><div class="alg-column-title">Instrucciones</div><div class="alg-guide-copy"><p>Haz clic en los comandos para agregarlos al pseudocódigo. Después usa los controles para acomodarlos en el orden correcto.</p></div><button type="button" class="alg-btn alg-hint-btn" id="hint">Usar pista</button></aside>'
        + '<section class="alg-center-column"><div class="alg-source-panel"><div class="alg-column-title">Comandos a usar</div><div class="alg-command-list alg-source-commands" id="commands"></div></div><div class="alg-workspace-panel"><div class="alg-editor-toolbar"><span>Pseudocódigo</span><span>Ordena las lineas del algoritmo.</span></div><ol class="alg-pseudo-lines" id="lines"></ol></div></section>'
        + '<aside class="alg-side-panel alg-progress-column"><div class="alg-column-title">Progreso</div><div class="alg-stat-list"><div><span>Ejercicio</span><strong>'+(state.index+1)+'/'+state.challenges.length+'</strong></div><div><span>Tiempo</span><strong id="time">'+fmt(st.remaining)+'</strong></div><div><span>Puntaje</span><strong>'+state.score+'</strong></div><div><span>Intentos</span><strong>'+st.attempts+'</strong></div></div><div class="alg-action-stack"><button class="alg-btn primary" id="validate">Probar solución</button><button class="alg-btn alg-reset-btn" id="reset">Reiniciar</button><button class="alg-btn secondary" id="finish">Finalizar juego</button></div></aside>'
        + '</div>';
      renderLists();
      document.getElementById("validate").onclick = validate;
      document.getElementById("finish").onclick = finish;
      document.getElementById("hint").onclick = () => showModal("Pista",ch.hint,[{ label:"Cerrar", primary:true, run:()=>{} }]);
      document.getElementById("reset").onclick = () => {
        st.available = shuffle(ch.commands);
        st.lines = [];
        renderLists();
      };
      if(beginTimer) startTimer();
    }
    function renderLists(){
      const st = cstate();
      const commands = document.getElementById("commands");
      const lines = document.getElementById("lines");
      commands.innerHTML = "";
      lines.innerHTML = "";
      st.available.forEach((cmd, index) => {
        const btn = document.createElement("button");
        btn.className = "alg-command-chip";
        const label = document.createElement("span");
        label.textContent = cmd;
        const order = document.createElement("small");
        order.textContent = String(index + 1);
        btn.appendChild(label);
        btn.appendChild(order);
        btn.onclick = () => { st.lines.push(cmd); st.available.splice(index,1); renderLists(); };
        commands.appendChild(btn);
      });
      if(!st.available.length) commands.innerHTML = '<div class="alg-empty-box">Todos los comandos estan en el editor.</div>';
      if(!st.lines.length) {
        for(let placeholderIndex=0; placeholderIndex<8; placeholderIndex+=1){
          const placeholder=document.createElement("li");
          placeholder.className="alg-pseudo-placeholder";
          placeholder.innerHTML='<span>'+(placeholderIndex+1)+'</span>Agrega una instrucción aquí';
          lines.appendChild(placeholder);
        }
      }
      st.lines.forEach((line, index) => {
        const row = document.createElement("li");
        row.className = "alg-pseudo-line";
        const number = document.createElement("span");
        number.className = "alg-line-number";
        number.textContent = String(index + 1);
        const code = document.createElement("code");
        code.textContent = line;
        const actions = document.createElement("div");
        actions.className = "alg-line-actions";
        [["Subir",-1],["Bajar",1],["X",0]].forEach(([label,delta]) => {
          const action = document.createElement("button");
          action.type = "button";
          action.textContent = label;
          action.disabled = (delta === -1 && index === 0) || (delta === 1 && index === st.lines.length - 1);
          action.onclick = () => {
            if(delta === 0){ st.available.push(st.lines[index]); st.lines.splice(index,1); }
            else { const target=index+delta; const moved=st.lines[index]; st.lines[index]=st.lines[target]; st.lines[target]=moved; }
            renderLists();
          };
          actions.appendChild(action);
        });
        row.appendChild(number);
        row.appendChild(code);
        row.appendChild(actions);
        lines.appendChild(row);
      });
    }
    function startTimer(){
      clearInterval(state.timer);
      state.timer = setInterval(() => {
        const st = cstate();
        if(st.solved || st.expired) return;
        st.remaining -= 1;
        const label = document.getElementById("time");
        if(label) label.textContent = fmt(st.remaining);
        if(st.remaining <= 0){
          st.expired = true;
          clearInterval(state.timer);
          showModal("Tiempo agotado","Este desafio queda en cero puntos.",[{ label:"Continuar", primary:true, run:nextPending }]);
        }
      }, 1000);
    }
    function validate(){
      const ch = current();
      const st = cstate();
      if(st.expired){ showModal("Tiempo agotado","Continua con el siguiente desafio.",[{ label:"Continuar", primary:true, run:nextPending }]); return; }
      st.attempts += 1;
      const ok = st.lines.length === ch.solution.length && ch.solution.every((line, index) => clean(line) === clean(st.lines[index]));
      if(!ok){ renderGame(); showModal("Solucion incorrecta","Revisa el orden de las instrucciones.",[{ label:"Reintentar", primary:true, run:()=>{} }]); return; }
      st.solved = true;
      state.score += 10;
      clearInterval(state.timer);
      const done = state.challenges.every(item => state.states[item.id].solved || state.states[item.id].expired);
      if(done){
        showAR("Final").then(() => showModal("Juego completado","Puntos globales: "+state.score,[{ label:"Volver a jugar", run:startGameSequence, primary:false }]));
      } else {
        showAR("Acierto").then(() => showModal("Solucion correcta","Puntos del ejercicio: 10",[{ label:"Continuar", primary:true, run:nextPending }]));
      }
    }
    function nextPending(){
      const next = state.challenges.findIndex((item, index) => index > state.index && !state.states[item.id].solved && !state.states[item.id].expired);
      state.index = next >= 0 ? next : Math.min(state.index + 1, state.challenges.length - 1);
      renderGame();
    }
    function finish(){
      clearInterval(state.timer);
      showAR("Final").then(() => showModal("Juego finalizado","Puntaje obtenido: "+state.score,[{ label:"Volver a jugar", run:startGameSequence, primary:true }]));
    }
    document.getElementById("start-btn").onclick = startGameSequence;
    document.getElementById("show-info-btn").onclick = () => toggleInfo(true);
    document.getElementById("close-info-icon").onclick = () => toggleInfo(false);
    document.getElementById("close-info-btn").onclick = () => toggleInfo(false);
    document.getElementById("info-overlay").onclick = event => { if(event.target === document.getElementById("info-overlay")) toggleInfo(false); };
    document.addEventListener("keydown", event => { if(event.key === "Escape" && !document.getElementById("info-overlay").classList.contains("hidden")) toggleInfo(false); });
    populateLaunchInformation();
  </script>
</body>
</html>`;
}

export function SummaryPanel({
  difficulty,
  selectedIds,
  arEnabled,
  arSelectedStages,
  arConfig,
  onBack,
  state,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Listo para generar");
  const selectedPlatforms = state?.selectedPlatforms || [];
  const gameDetails = {
    ...(state?.gameDetails || {}),
    date: state?.gameDetails?.date || new Date().toISOString(),
  };
  const selectedAreas = state?.selectedAreas || [];
  const selectedSkills = state?.selectedSkills || [];
  const level = LEVEL_CONFIG[difficulty];
  const selectedChallenges = (CHALLENGES[difficulty] || []).filter((challenge) =>
    selectedIds.includes(challenge.id),
  );
  const hasAndroid = selectedPlatforms.some(
    (platform) => String(platform).toLowerCase() === "android",
  );
  const hasIOS = selectedPlatforms.some(
    (platform) => String(platform).toLowerCase() === "ios",
  );
  const hasWeb =
    selectedPlatforms.length === 0 ||
    selectedPlatforms.some(
      (platform) => String(platform).trim().toLowerCase() === "web",
    );

  const resolveARConfig = async () => {
    const result = {};
    for (const stageName of STAGES) {
      const stage = arConfig[stageName] || {};
      result[stageName] = {
        text: stage.text || "",
        imageUrl: await dataUrlFromMaybeBlob(stage.imageUrl),
        imageName: stage.imageName || "",
        audioUrl: await dataUrlFromMaybeBlob(stage.audioUrl),
        audioName: stage.audioName || "",
        videoUrl: await dataUrlFromMaybeBlob(stage.videoUrl),
        videoName: stage.videoName || "",
      };
    }
    return result;
  };

  const buildFullConfig = async () => ({
    gameType: "desarrollo-algoritmos",
    level: difficulty,
    levelLabel: level.label,
    challengeIds: selectedIds,
    challengeCount: selectedIds.length,
    nombreApp: gameDetails.gameName || "Algorithm",
    autor: gameDetails.authorName || "",
    version: gameDetails.version || "1.0.0",
    fecha: gameDetails.date || new Date().toISOString(),
    descripcion: gameDetails.description || "",
    plataformas: selectedPlatforms.length ? selectedPlatforms : ["web"],
    ar: arEnabled
      ? {
          enabled: true,
          selectedStages: arSelectedStages,
          stages: await resolveARConfig(),
        }
      : { enabled: false, selectedStages: {}, stages: {} },
  });

  const handleDownloadZip = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(8);
    setStatusText("Generando configuración...");

    try {
      const fullConfig = await buildFullConfig();
      const resolvedARConfig = arEnabled ? await resolveARConfig() : createEmptyARConfig();
      const htmlContent = buildGeneratedHtml({
        config: {
          level: difficulty,
          challengeIds: selectedIds,
        },
        gameDetails,
        selectedPlatforms,
        selectedChallenges,
        arEnabled,
        arSelectedStages,
        arConfig: resolvedARConfig,
      });

      const zip = new JSZip();
      const folder = zip.folder("Algorithm");
      if (hasWeb) {
        folder.file("index.html", htmlContent);
        folder.file("algorithm-config.json", JSON.stringify(fullConfig, null, 2));
      }
      setProgress(45);

      if (hasAndroid) {
        const androidContent = await buildAlgorithmNativePackage({
          platform: "android",
          config: fullConfig,
          challenges: selectedChallenges,
          onStatus: setStatusText,
        });
        folder.file("algorithm_android.zip", androidContent);
      }

      if (hasIOS) {
        const iosContent = await buildAlgorithmNativePackage({
          platform: "ios",
          config: fullConfig,
          challenges: selectedChallenges,
          onStatus: setStatusText,
        });
        folder.file("algoritmos_ios.zip", iosContent);
      }

      setStatusText("Comprimiendo paquete...");
      setProgress(85);
      const content = await zip.generateAsync({ type: "blob" });
      downloadBlob(content, `algorithm-${difficulty}.zip`);
      clearARConfigurationsAfterDownload();
      setProgress(100);
      setStatusText("Descarga iniciada");
      window.setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 1400);
    } catch (error) {
      console.error("Error generando el ZIP de Algoritmos:", error);
      setStatusText(error.message || "Error al generar el archivo");
      setIsGenerating(false);
    }
  };

  return (
    <LogicPathConfigurationSummary
      gameDetails={gameDetails}
      selectedPlatforms={selectedPlatforms}
      selectedAreas={selectedAreas}
      selectedSkills={selectedSkills}
      areaNames={AREA_NAMES}
      parameters={[
        { icon: <Type size={18} />, label: "Nivel", value: level.label },
        { icon: <ListChecks size={18} />, label: "Desafíos", value: selectedIds.length },
        { icon: <Clock size={18} />, label: "Tiempo por desafío", value: level.time },
      ]}
      arEnabled={arEnabled}
      isGenerating={isGenerating}
      progress={progress}
      statusText={statusText}
      downloadDescription="Genera el archivo .zip listo para descargar en su computadora."
      downloadButtonLabel="Generar (.zip)"
      showDownloadPlatforms
      className="algorithm-configuration-summary"
      onBack={onBack}
      onDownload={handleDownloadZip}
    />
  );
}

export default function DesarrolloAlgoritmos({ withRA } = {}) {
  const hasExternalRAFlow = typeof withRA === "boolean";
  const location = useLocation();
  const navigate = useNavigate();
  const [screen, setScreen] = useState(() =>
    hasExternalRAFlow && withRA ? "ar" : "generator",
  );
  const [useAR, setUseAR] = useState(hasExternalRAFlow ? withRA : null);
  const [choiceOpen, setChoiceOpen] = useState(!hasExternalRAFlow);
  const [difficulty, setDifficulty] = useState("basico");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedStages, setSelectedStages] = useState({
    Inicio: false,
    Acierto: false,
    Final: false,
  });
  const [arConfig, setArConfig] = useState(createEmptyARConfig);
  const [activeARTab, setActiveARTab] = useState("Inicio");
  const [uploadingField, setUploadingField] = useState("");
  const [notification, setNotification] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [challengeStates, setChallengeStates] = useState({});
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [stageModal, setStageModal] = useState(null);

  const level = LEVEL_CONFIG[difficulty];
  const availableChallenges = useMemo(() => CHALLENGES[difficulty] || [], [difficulty]);
  const selectedChallenges = useMemo(
    () => availableChallenges.filter((challenge) => selectedIds.includes(challenge.id)),
    [availableChallenges, selectedIds],
  );
  const currentChallenge = selectedChallenges[currentIndex];
  const currentState = currentChallenge ? challengeStates[currentChallenge.id] : null;

  const stepsOrder = useAR === true
    ? ["ar", "ar-summary", "game", "playing"]
    : ["game", "playing"];
  const stepLabels = {
    ar: "RA",
    "ar-summary": "Resumen",
    game: "Juego",
    playing: "Vista previa",
  };

  const selectedStageCount = STAGES.filter((stage) => selectedStages[stage]).length;
  const isARConfigReady =
    selectedStageCount > 0 &&
    STAGES.every((stage) => !selectedStages[stage] || hasStageContent(arConfig[stage]));

  useEffect(() => {
    setSelectedIds([]);
  }, [difficulty]);

  useEffect(() => {
    if (!hasExternalRAFlow) return;
    setUseAR(withRA);
    setChoiceOpen(false);
    if (withRA) {
      setScreen((current) => (current === "game" ? current : "ar"));
    } else {
      setSelectedStages({ Inicio: false, Acierto: false, Final: false });
      setArConfig(createEmptyARConfig());
      setScreen((current) => (current === "game" ? current : "generator"));
    }
  }, [hasExternalRAFlow, withRA]);

  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(() => setNotification(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    if (screen !== "game") return;
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, [screen]);

  useEffect(() => {
    const resetARContent = () => {
      setSelectedStages({ Inicio: false, Acierto: false, Final: false });
      setArConfig(createEmptyARConfig());
      setActiveARTab("Inicio");
      setUploadingField("");
    };

    window.addEventListener(AR_CONFIGURATION_CLEARED_EVENT, resetARContent);
    return () => {
      window.removeEventListener(AR_CONFIGURATION_CLEARED_EVENT, resetARContent);
    };
  }, []);

  useEffect(() => {
    if (screen !== "game" || result || !currentChallenge || !currentState) return undefined;
    if (currentState.solved || currentState.timerExpired) return undefined;

    const timer = window.setInterval(() => {
      setChallengeStates((previous) => {
        const stateForChallenge = previous[currentChallenge.id];
        if (!stateForChallenge || stateForChallenge.solved || stateForChallenge.timerExpired) {
          return previous;
        }
        const remainingSeconds = stateForChallenge.remainingSeconds - 1;
        if (remainingSeconds <= 0) {
          window.setTimeout(() => {
            setResult({ type: "timeout", points: score });
          }, 0);
          return {
            ...previous,
            [currentChallenge.id]: {
              ...stateForChallenge,
              remainingSeconds: 0,
              timerExpired: true,
            },
          };
        }
        return {
          ...previous,
          [currentChallenge.id]: {
            ...stateForChallenge,
            remainingSeconds,
          },
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentChallenge, currentState, result, score, screen]);

  const showARStage = useCallback(
    (stageName, options = {}) => {
      if (!useAR || !selectedStages[stageName] || !hasStageContent(arConfig[stageName])) {
        return Promise.resolve(true);
      }

      return new Promise((resolve) => {
        setStageModal({
          stageName,
          stage: arConfig[stageName] || EMPTY_STAGE,
          confirmButtonText: options.confirmButtonText || "Continuar",
          cancelButtonText: options.cancelButtonText || "Cancelar",
          showCancelButton: options.showCancelButton === true,
          resolve,
        });
      });
    },
    [arConfig, selectedStages, useAR],
  );

  function closeStageModal(confirmed) {
    const resolver = stageModal?.resolve;
    setStageModal(null);
    resolver?.(Boolean(confirmed));
  }

  function chooseAR(value) {
    setUseAR(value);
    setChoiceOpen(false);
    if (!value) {
      setSelectedStages({ Inicio: false, Acierto: false, Final: false });
      setArConfig(createEmptyARConfig());
    } else {
      setScreen("ar");
    }
  }

  function toggleChallenge(id) {
    const alreadySelected = selectedIds.includes(id);
    if (alreadySelected) {
      setSelectedIds((current) => current.filter((item) => item !== id));
      return;
    }
    if (selectedIds.length >= level.required) {
      setNotification(`Solo puedes elegir ${level.required} desafíos para este nivel.`);
      return;
    }
    setSelectedIds((current) => [...current, id]);
  }

  function buildInitialChallengeStates(challenges) {
    return challenges.reduce((acc, challenge) => {
      acc[challenge.id] = {
        lines: [],
        availableCommands: shuffle(challenge.commands),
        attempts: 0,
        solved: false,
        timerExpired: false,
        remainingSeconds: level.seconds,
      };
      return acc;
    }, {});
  }

  async function startGame() {
    if (selectedIds.length !== level.required) {
      setNotification(`Selecciona ${level.required} desafíos para continuar.`);
      return;
    }

    setChallengeStates(buildInitialChallengeStates(selectedChallenges));
    setCurrentIndex(0);
    setScore(0);
    setResult(null);

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

  async function handleGeneratorNext() {
    if (useAR === null) {
      setChoiceOpen(true);
    } else if (useAR) {
      if (isARConfigReady) await startGame();
      else setScreen("ar");
    } else {
      await startGame();
    }
  }

  function updateStage(stageName, patch) {
    setArConfig((current) => ({
      ...current,
      [stageName]: {
        ...EMPTY_STAGE,
        ...(current[stageName] || {}),
        ...patch,
      },
    }));
  }

  function toggleARStage(stageName) {
    setSelectedStages((current) => ({
      ...current,
      [stageName]: !current[stageName],
    }));
  }

  async function uploadFile(stageName, type, file) {
    if (!file) return;
    const rule = FILE_RULES[type];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!rule.extensions.includes(extension)) {
      setNotification(`Formato no permitido para ${type.toLowerCase()}.`);
      return;
    }
    if (file.size > rule.maxSize) {
      setNotification(`El archivo de ${type.toLowerCase()} es demasiado grande.`);
      return;
    }

    setUploadingField(`${stageName}:${type}`);
    try {
      const dataUrl = await dataUrlFromFile(file);
      updateStage(stageName, {
        [rule.urlKey]: dataUrl,
        [rule.nameKey]: file.name,
      });
    } catch {
      setNotification("No se pudo preparar el archivo.");
    } finally {
      setUploadingField("");
    }
  }

  function clearStageFile(stageName, type) {
    const rule = FILE_RULES[type];
    updateStage(stageName, {
      [rule.urlKey]: "",
      [rule.nameKey]: "",
    });
  }

  function goToARSummary() {
    if (selectedStageCount === 0) {
      setNotification("Selecciona al menos una etapa RA.");
      return;
    }
    if (!isARConfigReady) {
      setNotification("Configura contenido para cada etapa seleccionada.");
      return;
    }
    setScreen("ar-summary");
  }

  function addCommand(commandIndex) {
    if (!currentChallenge || currentState?.timerExpired) return;
    setChallengeStates((current) => {
      const stateForChallenge = current[currentChallenge.id];
      const command = stateForChallenge.availableCommands[commandIndex];
      if (!command) return current;
      return {
        ...current,
        [currentChallenge.id]: {
          ...stateForChallenge,
          lines: [...stateForChallenge.lines, command],
          availableCommands: stateForChallenge.availableCommands.filter((_, index) => index !== commandIndex),
        },
      };
    });
  }

  function removeLine(lineIndex) {
    if (!currentChallenge || currentState?.timerExpired) return;
    setChallengeStates((current) => {
      const stateForChallenge = current[currentChallenge.id];
      const line = stateForChallenge.lines[lineIndex];
      return {
        ...current,
        [currentChallenge.id]: {
          ...stateForChallenge,
          lines: stateForChallenge.lines.filter((_, index) => index !== lineIndex),
          availableCommands: [...stateForChallenge.availableCommands, line].filter(Boolean),
        },
      };
    });
  }

  function moveLine(lineIndex, direction) {
    if (!currentChallenge || currentState?.timerExpired) return;
    setChallengeStates((current) => {
      const stateForChallenge = current[currentChallenge.id];
      const nextIndex = lineIndex + direction;
      if (nextIndex < 0 || nextIndex >= stateForChallenge.lines.length) return current;
      const nextLines = [...stateForChallenge.lines];
      [nextLines[lineIndex], nextLines[nextIndex]] = [nextLines[nextIndex], nextLines[lineIndex]];
      return {
        ...current,
        [currentChallenge.id]: {
          ...stateForChallenge,
          lines: nextLines,
        },
      };
    });
  }

  function clearLines() {
    if (!currentChallenge || currentState?.timerExpired) return;
    setChallengeStates((current) => {
      const stateForChallenge = current[currentChallenge.id];
      return {
        ...current,
        [currentChallenge.id]: {
          ...stateForChallenge,
          availableCommands: shuffle([
            ...stateForChallenge.availableCommands,
            ...stateForChallenge.lines,
          ]),
          lines: [],
        },
      };
    });
  }

  async function validateSolution() {
    if (!currentChallenge || !currentState) return;
    if (currentState.timerExpired) {
      setResult({ type: "timeout", points: score });
      return;
    }
    if (currentState.lines.length === 0) {
      setNotification("Agrega comandos al pseudocodigo primero.");
      return;
    }

    const matches =
      currentState.lines.length === currentChallenge.solution.length &&
      currentChallenge.solution.every(
        (line, index) => normalizeText(line) === normalizeText(currentState.lines[index]),
      );

    setChallengeStates((current) => ({
      ...current,
      [currentChallenge.id]: {
        ...current[currentChallenge.id],
        attempts: current[currentChallenge.id].attempts + 1,
        solved: matches ? true : current[currentChallenge.id].solved,
      },
    }));

    if (!matches) {
      setResult({ type: "error", points: 0 });
      return;
    }

    const nextScore = score + 10;
    const completedCount = selectedChallenges.filter((challenge) => {
      if (challenge.id === currentChallenge.id) return true;
      return challengeStates[challenge.id]?.solved || challengeStates[challenge.id]?.timerExpired;
    }).length;
    const isComplete = completedCount === selectedChallenges.length;
    setScore(nextScore);

    if (isComplete) {
      await showARStage("Final");
      setResult({ type: "complete", points: nextScore });
      return;
    }

    await showARStage("Acierto");
    setResult({ type: "success", points: 10 });
  }

  function goToNextPending() {
    const nextIndex = selectedChallenges.findIndex((challenge, index) => {
      if (index <= currentIndex) return false;
      const stateForChallenge = challengeStates[challenge.id];
      return !stateForChallenge?.solved && !stateForChallenge?.timerExpired;
    });
    setResult(null);
    setCurrentIndex(nextIndex >= 0 ? nextIndex : Math.min(currentIndex + 1, selectedChallenges.length - 1));
  }

  async function finishGame() {
    await showARStage("Final");
    setResult({ type: "finish", points: score });
  }

  function restartGame() {
    setChallengeStates(buildInitialChallengeStates(selectedChallenges));
    setCurrentIndex(0);
    setScore(0);
    setResult(null);
  }

  function finishConfiguration() {
    setResult(null);
    setScreen("game-summary");
    navigate("/settings?view=Summary", {
      replace: true,
      state: {
        ...location.state,
        gameType: "desarrollo-algoritmos",
        gameConfig: {
          level: difficulty,
          challengeIds: selectedIds,
        },
        arNamespace: "desarrollo-algoritmos",
        arSelectedStages: useAR ? selectedStages : {},
        arConfig: useAR ? arConfig : {},
        withRA: useAR === true,
      },
    });
  }

  function handleResultAction(action) {
    if (action === "close") {
      setResult(null);
    } else if (action === "continue") {
      goToNextPending();
    } else if (action === "restart") {
      restartGame();
    } else if (action === "summary") {
      finishConfiguration();
    }
  }

  const activeStage = arConfig[activeARTab] || EMPTY_STAGE;

  return (
    <div className="alg-root">
      <style>{algoritmosStyles}</style>

      {notification && <div className="alg-notification">{notification}</div>}

      {screen !== "game" && (
        <div className="logic-path-screen">
          <div className="logic-path-panel">
            {screen !== "game-summary" && <AnimatedTitle />}

            {screen === "generator" && (
              <>
                <ProgressBar steps={stepsOrder} labels={stepLabels} currentStep="game" />
                <h2 className="logic-path-section-title">
                  Configura tu juego seleccionando el nivel de dificultad y los ejercicios deseados
                </h2>
                <div className="alg-config-grid">
                  <label className="alg-field">
                    <span>Nivel de dificultad</span>
                    <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                      {Object.entries(LEVEL_CONFIG).map(([value, config]) => (
                        <option key={value} value={value}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="alg-counter-card">
                    <span>Seleccionados</span>
                    <strong>
                      {selectedIds.length} / {level.required}
                    </strong>
                  </div>
                </div>

                <h3 className="alg-catalog-heading" id="algorithm-exercises-heading">
                  Seleccione los ejercicios para su juego:
                </h3>
                <div className="alg-catalog" role="group" aria-labelledby="algorithm-exercises-heading">
                  {availableChallenges.map((challenge) => {
                    const selected = selectedIds.includes(challenge.id);
                    return (
                      <button
                        type="button"
                        className={`alg-challenge-card ${selected ? "selected" : ""}`}
                        aria-pressed={selected}
                        key={challenge.id}
                        onClick={() => toggleChallenge(challenge.id)}
                      >
                        <span className="alg-challenge-time">{level.time}</span>
                        <strong>{challenge.title}</strong>
                        <small>{challenge.summary}</small>
                        <span className="alg-check">{selected ? "OK" : ""}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="logic-path-actions">
                  <button
                    type="button"
                    className="logic-path-btn secondary"
                    onClick={() => (useAR ? setScreen("ar-summary") : navigate(-1))}
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    className="logic-path-btn"
                    onClick={handleGeneratorNext}
                    disabled={useAR !== null && selectedIds.length !== level.required}
                  >
                    Siguiente →
                  </button>
                </div>
              </>
            )}

            {screen === "ar" && (
              <>
                <ProgressBar steps={stepsOrder} labels={stepLabels} currentStep="ar" />
                <LogicPathARConfigurator
                  stages={STAGES}
                  activeStageName={activeARTab}
                  selectedStages={selectedStages}
                  stageConfig={activeStage}
                  fileRules={FILE_RULES}
                  uploadingField={uploadingField}
                  idPrefix="algorithm"
                  onStageSelect={setActiveARTab}
                  onStageToggle={(stageName) => toggleARStage(stageName)}
                  onTextChange={(stageName, text) => updateStage(stageName, { text })}
                  onFileChange={uploadFile}
                  onClearText={(stageName) => updateStage(stageName, { text: "" })}
                  onClearFile={clearStageFile}
                  onBack={() => navigate(-1)}
                  onNext={goToARSummary}
                />
              </>
            )}

            {screen === "ar-summary" && (
              <>
                <ProgressBar steps={stepsOrder} labels={stepLabels} currentStep="ar-summary" />
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
                selectedIds={selectedIds}
                arEnabled={useAR === true}
                arSelectedStages={useAR === true ? selectedStages : {}}
                arConfig={useAR === true ? arConfig : createEmptyARConfig()}
                onBack={() => setScreen("game")}
                state={location.state}
              />
            )}
          </div>
        </div>
      )}

      {screen === "game" && (
        <div className="alg-play-screen">
          <div className="alg-panel alg-game-panel">
            <AnimatedTitle />
            <ProgressBar steps={stepsOrder} labels={stepLabels} currentStep="playing" />

            {currentChallenge && currentState && (
              <>
                <div className="alg-game-header">
                  <div>
                    <h2>{currentChallenge.title}</h2>
                    <p>
                      <strong>Reglas básicas:</strong> {currentChallenge.summary}{" "}
                      Selecciona los comandos y ordénalos correctamente para construir el
                      algoritmo.
                    </p>
                  </div>
                  <div className="alg-badge">{level.label}</div>
                </div>

                <div className="alg-game-layout">
                  <aside className="alg-side-panel alg-guide-column">
                    <div className="alg-column-title">Instrucciones</div>
                    <div className="alg-guide-copy">
                      <p>
                        Haz clic en los comandos para agregarlos al pseudocódigo. Después usa
                        los controles para acomodarlos en el orden correcto.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="alg-btn alg-hint-btn"
                      onClick={() => setNotification(`Pista: ${currentChallenge.hint}`)}
                      disabled={currentState.timerExpired}
                    >
                      Usar pista
                    </button>
                  </aside>

                  <section className="alg-center-column">
                    <div className="alg-source-panel">
                      <div className="alg-column-title">Comandos a usar</div>
                      <div className="alg-command-list alg-source-commands">
                        {currentState.availableCommands.map((command, index) => (
                          <button
                            type="button"
                            className="alg-command-chip"
                            key={`${command}-${index}`}
                            onClick={() => addCommand(index)}
                            disabled={currentState.timerExpired}
                          >
                            <span>{command}</span>
                            <small>{index + 1}</small>
                          </button>
                        ))}
                        {currentState.availableCommands.length === 0 && (
                          <div className="alg-empty-box">
                            Todos los comandos estan en el editor.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="alg-workspace-panel">
                      <div className="alg-editor-toolbar">
                        <span>Pseudocódigo</span>
                        <span>Ordena las lineas del algoritmo.</span>
                      </div>
                      <ol className="alg-pseudo-lines">
                        {currentState.lines.map((line, index) => (
                          <li key={`${line}-${index}`} className="alg-pseudo-line">
                            <span className="alg-line-number">{index + 1}</span>
                            <code>{line}</code>
                            <div className="alg-line-actions">
                              <button type="button" onClick={() => moveLine(index, -1)} disabled={index === 0}>
                                Subir
                              </button>
                              <button
                                type="button"
                                onClick={() => moveLine(index, 1)}
                                disabled={index === currentState.lines.length - 1}
                              >
                                Bajar
                              </button>
                              <button type="button" onClick={() => removeLine(index)}>
                                X
                              </button>
                            </div>
                          </li>
                        ))}
                        {currentState.lines.length === 0 &&
                          Array.from({ length: 8 }, (_, index) => (
                            <li className="alg-pseudo-placeholder" key={index}>
                              <span>{index + 1}</span>
                              Agrega una instrucción aquí
                            </li>
                          ))}
                      </ol>
                    </div>
                  </section>

                  <aside className="alg-side-panel alg-progress-column">
                    <div className="alg-column-title">Progreso</div>
                    <div className="alg-stat-list">
                      <div>
                        <span>Ejercicio</span>
                        <strong>
                          {currentIndex + 1}/{selectedChallenges.length}
                        </strong>
                      </div>
                      <div>
                        <span>Tiempo</span>
                        <strong>{formatSeconds(currentState.remainingSeconds)}</strong>
                      </div>
                      <div>
                        <span>Puntaje</span>
                        <strong>{score}</strong>
                      </div>
                      <div>
                        <span>Intentos</span>
                        <strong>{currentState.attempts}</strong>
                      </div>
                    </div>
                    <div className="alg-action-stack">
                      <button
                        type="button"
                        className="alg-btn primary"
                        onClick={validateSolution}
                        disabled={currentState.timerExpired}
                      >
                        Probar solución
                      </button>
                      <button
                        type="button"
                        className="alg-btn alg-reset-btn"
                        onClick={clearLines}
                        disabled={currentState.timerExpired}
                      >
                        <RotateCcw size={17} /> Reiniciar
                      </button>
                      <button type="button" className="alg-btn secondary" onClick={finishGame}>
                        Finalizar juego
                      </button>
                    </div>
                  </aside>
                </div>

                <div className="alg-screen-actions alg-preview-actions">
                  <button
                    type="button"
                    className="alg-btn secondary"
                    onClick={() => setScreen(useAR ? "ar-summary" : "generator")}
                  >
                    ← Anterior
                  </button>
                  <button type="button" className="alg-btn primary" onClick={finishConfiguration}>
                    Terminar configuración →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {choiceOpen && <ChoiceModal onChoose={chooseAR} />}

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
    </div>
  );
}

const algoritmosStyles = `
.alg-root {
  width: 100%;
  min-width: 0;
  --primary: #005f92;
  --primary-dark: #004a73;
  --secondary: #1f2937;
  --success: #22c55e;
  --danger: #ef4444;
  --warning: #f59e0b;
  --light: #f8fafc;
  --dark: #111827;
  --muted: #64748b;
  --border: #e2e8f0;
  --soft-blue: #e0f2fe;
  --radius: 8px;
  font-family: "Nunito", "Segoe UI", sans-serif;
  color: var(--dark);
}
.alg-root * { box-sizing: border-box; }
.alg-root .logic-path-title {
  font-family: "Inter", "Segoe UI", sans-serif;
}
.alg-root > .logic-path-screen > .logic-path-panel,
.alg-root .alg-game-panel {
  width: 100%;
  max-width: 1400px;
  min-height: 85vh;
  margin: 20px auto;
  padding: 2rem;
  border: 0;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.alg-root .alg-play-screen {
  padding: 0;
  background: transparent;
}
.alg-screen, .alg-play-screen {
  min-height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #f0f2f5;
}
.alg-panel {
  width: 100%;
  max-width: none;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.10);
  padding: 28px;
}
.alg-play-screen {
  min-height: 70vh;
  align-items: flex-start;
  padding: 14px;
  background: #f3f7fc;
}
.alg-game-panel {
  width: 100%;
  max-width: none;
  padding: 18px;
  border-radius: var(--radius);
  box-shadow: 0 12px 28px rgba(15, 23, 42, .12);
}
.alg-game-panel .logic-path-title-container {
  margin-bottom: 8px;
}
.alg-game-panel .logic-path-title {
  font-size: clamp(1.85rem, 4vh, 2.55rem);
}
.alg-game-panel .logic-path-floating-icons {
  display: none;
}
.alg-game-panel .logic-path-progress-bar {
  margin-bottom: 12px;
}
.alg-title-box {
  text-align: center;
  position: relative;
  padding: 4px 0 20px;
}
.alg-title {
  margin: 0;
  color: var(--primary);
  font-size: clamp(2.2rem, 6vw, 4.2rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.05;
}
.alg-title span {
  display: inline-block;
  animation: alg-wave 2.4s ease-in-out infinite;
}
.alg-title-symbols {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  color: var(--secondary);
  font-weight: 900;
  opacity: .25;
}
.alg-title-symbols span {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px 10px;
  background: var(--light);
}
@keyframes alg-wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.alg-progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 8px 0 24px;
}
.alg-progress-step {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-weight: 800;
  font-size: .88rem;
}
.alg-progress-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid var(--border);
  background: #fff;
}
.alg-progress-step.active .alg-progress-dot,
.alg-progress-step.done .alg-progress-dot {
  border-color: var(--primary);
  background: var(--primary);
}
.alg-progress-step.active { color: var(--primary); }
.alg-progress-line {
  width: min(90px, 12vw);
  height: 3px;
  border-radius: 99px;
  background: var(--border);
}
.alg-section-title {
  margin: 0 0 18px;
  color: var(--primary);
  text-align: center;
  font-weight: 800;
}
.alg-config-grid {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) 180px;
  gap: 14px;
  align-items: stretch;
  margin-bottom: 18px;
}
.alg-field, .alg-counter-card {
  display: grid;
  gap: 8px;
  background: var(--light);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
}
.alg-field span, .alg-counter-card span {
  color: var(--secondary);
  font-weight: 800;
}
.alg-field select {
  width: 100%;
  border: 2px solid var(--primary);
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  color: var(--secondary);
  font-weight: 800;
}
.alg-counter-card strong {
  color: var(--primary);
  font-size: 1.5rem;
}
.alg-root .alg-catalog-heading {
  margin: 1.5rem 0 1rem;
  color: var(--primary);
  font-size: 1.25rem;
  font-weight: 700;
  text-align: left;
}
.alg-catalog {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 12px;
}
.alg-challenge-card {
  position: relative;
  display: grid;
  gap: 8px;
  text-align: left;
  min-height: 144px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  padding: 14px;
  cursor: pointer;
  transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}
.alg-challenge-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: 0 10px 24px rgba(0, 95, 146, .12);
}
.alg-challenge-card.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 95, 146, .16);
  background: #f8fbff;
}
.alg-challenge-card strong {
  color: var(--secondary);
  font-size: 1rem;
}
.alg-challenge-card small {
  color: var(--muted);
  line-height: 1.35;
}
.alg-challenge-time {
  width: fit-content;
  background: var(--soft-blue);
  color: var(--primary);
  border-radius: 999px;
  padding: 4px 8px;
  font-size: .75rem;
  font-weight: 900;
}
.alg-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: grid;
  place-items: center;
  color: #fff;
  background: #fff;
  font-size: .7rem;
  font-weight: 900;
}
.alg-challenge-card.selected .alg-check {
  background: var(--primary);
  border-color: var(--primary);
}
.alg-screen-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
.alg-btn {
  border: 0;
  border-radius: 8px;
  padding: 12px 20px;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 900;
  cursor: pointer;
  transition: transform .18s ease, filter .18s ease, box-shadow .18s ease;
}
.alg-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, .12);
}
.alg-btn.primary { background: var(--primary); color: #fff; }
.alg-btn.secondary { background: var(--secondary); color: #fff; }
.alg-btn:disabled { opacity: .58; cursor: not-allowed; }
.alg-ar-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.alg-ar-tab {
  border: 1px solid var(--border);
  background: #fff;
  color: var(--secondary);
  border-radius: 10px;
  padding: 12px;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.alg-ar-tab.active {
  border-color: var(--primary);
  color: var(--primary);
  background: #eff6ff;
}
.alg-ar-tab.enabled {
  box-shadow: inset 0 -3px 0 var(--success);
}
.alg-ar-editor {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--light);
  padding: 16px;
}
.alg-stage-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--secondary);
  font-weight: 900;
  margin-bottom: 16px;
}
.alg-stage-toggle input {
  width: 20px;
  height: 20px;
  accent-color: var(--primary);
}
.alg-ar-content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 14px;
}
.alg-ar-content-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 12px;
}
.alg-ar-content-card.has-content {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 95, 146, .10);
}
.alg-ar-content-head {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--primary);
}
.alg-ar-content-head strong {
  flex: 1;
  color: var(--secondary);
}
.alg-icon-btn {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: #fee2e2;
  color: var(--danger);
  cursor: pointer;
}
.alg-textarea {
  width: 100%;
  resize: vertical;
  min-height: 92px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  font: inherit;
}
.alg-hidden-file { display: none; }
.alg-upload-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--primary);
  color: var(--primary);
  background: #fff;
  border-radius: 10px;
  padding: 10px;
  font-weight: 900;
  cursor: pointer;
}
.alg-upload-label.ready {
  background: var(--primary);
  color: #fff;
}
.alg-file-name {
  color: var(--muted);
  font-size: .86rem;
  font-weight: 800;
  word-break: break-word;
}
.alg-preview-image, .alg-preview-video {
  width: 100%;
  max-height: 170px;
  object-fit: contain;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #fff;
}
.alg-preview-audio { width: 100%; }
.alg-disabled-box, .alg-empty-box {
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 18px;
  color: var(--muted);
  text-align: center;
  font-weight: 800;
  background: #fff;
}
.alg-ar-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.alg-ar-summary-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  background: var(--light);
}
.alg-ar-summary-card.enabled {
  background: #fff;
  border-color: rgba(0, 95, 146, .25);
}
.alg-ar-summary-card div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.alg-ar-summary-card strong { color: var(--primary); }
.alg-ar-summary-card span {
  border-radius: 999px;
  background: var(--soft-blue);
  color: var(--primary);
  padding: 2px 8px;
  font-size: .78rem;
  font-weight: 900;
}
.alg-ar-summary-card p {
  margin: 6px 0;
  color: var(--muted);
  font-weight: 800;
}
.alg-game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: .7rem 1rem;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  background: #eff6ff;
}
.alg-game-header h2 {
  margin: 0 0 6px;
  color: var(--primary);
  font-size: 1.45rem;
}
.alg-game-header p {
  margin: 0;
  color: var(--muted);
  font-weight: 700;
}
.alg-game-header p strong { color: var(--secondary); }
.alg-badge {
  background: var(--soft-blue);
  color: var(--primary);
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 900;
  white-space: nowrap;
}
.alg-game-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 220px;
  grid-template-rows: minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
  height: min(480px, calc(100dvh - 280px));
  min-height: 440px;
}
.alg-side-panel,
.alg-source-panel,
.alg-workspace-panel {
  background: #fff;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.alg-side-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.alg-guide-column { min-height: 0; }
.alg-center-column {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
}
.alg-column-title {
  margin: 8px;
  background: var(--primary);
  color: #fff;
  text-align: center;
  border-radius: var(--radius);
  padding: 10px;
  font-weight: 900;
}
.alg-guide-copy {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 20px;
  color: var(--muted);
  text-align: center;
  font-weight: 800;
  line-height: 1.45;
}
.alg-guide-copy p { margin: 0; }
.alg-hint-btn {
  width: calc(100% - 20px);
  margin: 0 10px 10px;
  background: #e5e7eb;
  color: var(--secondary);
}
.alg-command-list {
  display: grid;
  gap: 9px;
  padding: 12px;
}
.alg-source-commands {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  max-height: 132px;
  overflow-y: auto;
}
.alg-command-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  border: 1.5px solid var(--border);
  background: var(--light);
  border-radius: var(--radius);
  padding: 10px;
  cursor: pointer;
  text-align: left;
  color: var(--secondary);
  font-weight: 800;
}
.alg-command-chip:hover:not(:disabled) {
  border-color: var(--primary);
  background: #eff6ff;
  color: var(--primary);
}
.alg-command-chip small {
  color: var(--primary);
  font-weight: 900;
}
.alg-workspace-panel {
  min-width: 0;
  min-height: 0;
  padding: 14px;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 0 0, #fff 0, #f8fbff 48%, #eef4fb 100%);
}
.alg-editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 0 2px 10px;
  color: var(--muted);
  font-weight: 800;
}
.alg-editor-toolbar span:first-child { color: var(--primary); font-weight: 900; }
.alg-pseudo-lines {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius);
  overflow-y: auto;
  min-height: 0;
  flex: 1;
  background: #fff;
}
.alg-pseudo-line, .alg-pseudo-placeholder {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-bottom: 1px solid #eef2f7;
  min-height: 42px;
}
.alg-pseudo-line code {
  font-family: Consolas, "Courier New", monospace;
  font-weight: 800;
  white-space: pre-wrap;
  color: var(--secondary);
}
.alg-line-number, .alg-pseudo-placeholder span {
  color: #94a3b8;
  font-weight: 900;
  text-align: right;
}
.alg-line-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.alg-line-actions button {
  border: 1px solid var(--border);
  background: var(--light);
  color: var(--secondary);
  border-radius: 6px;
  padding: 4px 6px;
  font-size: .74rem;
  font-weight: 900;
  cursor: pointer;
}
.alg-line-actions button:disabled { opacity: .45; cursor: not-allowed; }
.alg-pseudo-placeholder {
  grid-template-columns: 34px 1fr;
  color: #94a3b8;
  font-style: italic;
  font-weight: 700;
}
.alg-stat-list {
  display: grid;
  gap: 9px;
  padding: 12px;
}
.alg-stat-list div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #eef2f7;
  padding: 0 0 7px;
  font-weight: 900;
}
.alg-stat-list span { color: var(--muted); }
.alg-stat-list strong { color: var(--primary); }
.alg-action-stack {
  display: grid;
  gap: 10px;
  margin-top: auto;
  padding: 12px;
}
.alg-action-stack .alg-btn { width: 100%; }
.alg-reset-btn { background: #e5e7eb; color: var(--secondary); }
.alg-preview-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin-top: 18px;
}
.alg-preview-actions .alg-btn {
  width: 100%;
  min-height: 44px;
  margin: 0;
  padding: .75rem 1.5rem;
  background: var(--primary);
  color: #fff;
  box-shadow: none;
}
.alg-preview-actions .alg-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  box-shadow: none;
  transform: none;
}
.alg-notification {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 1200;
  background: var(--secondary);
  color: #fff;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 900;
  box-shadow: 0 16px 35px rgba(15, 23, 42, .22);
}
.alg-modal-backdrop, .alg-ar-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(15, 23, 42, .58);
}
.alg-choice-modal, .alg-result-modal {
  width: min(440px, 96vw);
  background: #fff;
  border-radius: 12px;
  padding: 22px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(15, 23, 42, .30);
}
.alg-choice-modal h3, .alg-result-modal h3 {
  margin: 0 0 8px;
  color: var(--primary);
  font-size: 1.45rem;
}
.alg-choice-modal p, .alg-result-modal p {
  color: var(--muted);
  font-weight: 800;
}
.alg-modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}
.alg-result-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #dcfce7;
  color: #15803d;
  font-weight: 900;
}
.alg-result-modal.error .alg-result-icon {
  background: #fee2e2;
  color: var(--danger);
}
.alg-ar-card {
  width: min(700px, 96vw);
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  text-align: center;
  box-shadow: 0 24px 60px rgba(15, 23, 42, .34);
}
.alg-ar-stage {
  background: var(--primary);
  color: #fff;
  padding: 14px;
  font-weight: 900;
  font-size: 1.15rem;
}
.alg-ar-visual {
  position: relative;
  min-height: 340px;
  padding: 24px;
  display: grid;
  place-items: center;
  gap: 14px;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(135deg, #005f92 0%, #1f2937 55%, #22c55e 100%);
}
.alg-ar-ring {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,.24);
  top: -78px;
  right: -64px;
  animation: alg-spin 12s linear infinite;
}
@keyframes alg-spin { to { transform: rotate(360deg); } }
.alg-ar-code-cloud {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.alg-ar-code-cloud span {
  position: absolute;
  color: rgba(255,255,255,.17);
  font-weight: 900;
  font-size: 1.4rem;
  animation: alg-float 4.5s ease-in-out infinite;
}
.alg-ar-code-cloud span:nth-child(1) { left: 8%; top: 22%; }
.alg-ar-code-cloud span:nth-child(2) { right: 14%; bottom: 20%; animation-delay: .6s; }
.alg-ar-code-cloud span:nth-child(3) { left: 18%; bottom: 12%; animation-delay: 1s; }
.alg-ar-code-cloud span:nth-child(4) { right: 18%; top: 18%; animation-delay: 1.4s; }
@keyframes alg-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}
.alg-ar-text {
  position: relative;
  z-index: 2;
  font-size: clamp(1.7rem, 6vw, 3rem);
  font-weight: 900;
  text-shadow: 0 8px 22px rgba(0,0,0,.35);
}
.alg-ar-media-image, .alg-ar-media-video {
  position: relative;
  z-index: 2;
  max-width: min(470px, 92%);
  max-height: 240px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 16px 38px rgba(0,0,0,.30);
  background: #fff;
}
.alg-ar-audio {
  position: relative;
  z-index: 2;
  width: min(470px, 92%);
}
.alg-ar-card > .alg-btn {
  margin: 14px auto 18px;
}
.alg-summary {
  max-width: 960px;
  margin: 0 auto;
}
.alg-summary-title {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: var(--primary);
  text-align: center;
  margin: 0 0 10px;
}
.alg-summary-copy {
  text-align: center;
  color: var(--muted);
  font-weight: 800;
  margin: 0 0 22px;
}
.alg-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.alg-info-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 4px 14px rgba(15,23,42,.05);
}
.alg-info-card.wide { grid-column: 1 / -1; }
.alg-info-card-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .04em;
  font-size: .78rem;
  font-weight: 900;
  margin-bottom: 8px;
}
.alg-info-card-value {
  color: var(--secondary);
  font-weight: 900;
  word-break: break-word;
}
.alg-summary-section {
  margin-top: 18px;
  background: var(--light);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}
.alg-summary-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  color: var(--primary);
}
.alg-pill-row, .alg-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.alg-pill-row span, .alg-tag-list span {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 7px 11px;
  color: var(--secondary);
  font-weight: 900;
}
.alg-summary-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.alg-download-box {
  margin-top: 22px;
  padding: 22px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid var(--border);
  text-align: center;
}
.alg-download-box h3 {
  color: var(--primary);
  margin: 0 0 8px;
}
.alg-download-box p {
  color: var(--muted);
  font-weight: 800;
}
.alg-download-progress {
  margin: 16px auto;
  max-width: 560px;
}
.alg-download-progress > div:first-child {
  display: flex;
  justify-content: space-between;
  color: var(--secondary);
  font-weight: 900;
  margin-bottom: 8px;
}
.alg-progress-track {
  height: 14px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}
.alg-progress-track span {
  display: block;
  height: 100%;
  background: var(--primary);
  transition: width .25s ease;
}
@media (max-width: 980px) {
  .alg-game-layout,
  .alg-summary-columns,
  .alg-config-grid {
    grid-template-columns: 1fr;
  }
  .alg-game-layout { height: auto; min-height: 0; }
  .alg-guide-column { min-height: 260px; }
  .alg-workspace-panel { min-height: 390px; }
}
@media (max-width: 680px) {
  .alg-screen, .alg-play-screen {
    padding: 12px;
  }
  .alg-panel {
    padding: 18px;
  }
  .alg-ar-tabs,
  .alg-info-grid,
  .alg-source-commands,
  .alg-preview-actions {
    grid-template-columns: 1fr;
  }
  .alg-game-header,
  .alg-editor-toolbar {
    flex-direction: column;
  }
  .alg-progress-bar {
    flex-wrap: wrap;
  }
  .alg-progress-line {
    display: none;
  }
  .alg-pseudo-line {
    grid-template-columns: 28px 1fr;
  }
  .alg-line-actions {
    grid-column: 2;
    justify-content: flex-start;
  }
}
`;
