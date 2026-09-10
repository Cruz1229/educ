import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Layers,
  ListChecks,
  Monitor,
  Shapes,
  Smartphone,
  Tag,
  Type,
  X,
} from "lucide-react";
import "./LogicPathFlow.css";

const CONTENT_CARDS = [
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
    urlKey: "imageUrl",
    nameKey: "imageName",
    uploadIcon: "📁",
    selectedIcon: "✅",
    selectedLabel: "Imagen seleccionada",
  },
  {
    type: "Audio",
    title: "Audio",
    icon: "/images/areas/audio.json",
    urlKey: "audioUrl",
    nameKey: "audioName",
    uploadIcon: "🎵",
    selectedIcon: "✅",
    selectedLabel: "Audio seleccionado",
  },
  {
    type: "Video",
    title: "Video",
    icon: "/images/areas/video.json",
    urlKey: "videoUrl",
    nameKey: "videoName",
    uploadIcon: "🎬",
    selectedIcon: "✅",
    selectedLabel: "Video seleccionado",
  },
];

const AREA_NAMES = {
  science: "Ciencia",
  technology: "Tecnología",
  engineering: "Ingeniería",
  arts: "Arte",
  math: "Matemáticas",
};

const AREA_ICONS = {
  science: "/images/areas/Ciencia.png",
  technology: "/images/areas/Tecnologia.png",
  engineering: "/images/areas/Ingenieria.png",
  arts: "/images/areas/Artes.png",
  math: "/images/areas/Matematicas.png",
};

export function LogicPathTitle({ title, symbols = ["A", "D", "I", "B"] }) {
  return (
    <div className="logic-path-title-container">
      <h1 className="logic-path-title">
        {title.split("").map((character, index) => (
          <span key={`${character}-${index}`} style={{ animationDelay: `${index * 0.1}s` }}>
            {character === " " ? "\u00A0" : character}
          </span>
        ))}
      </h1>
      <div className="logic-path-floating-icons" aria-hidden="true">
        {symbols.slice(0, 4).map((symbol, index) => (
          <span className={`logic-path-icon-${index + 1}`} key={`${symbol}-${index}`}>
            {symbol}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LogicPathProgress({ currentStep, arEnabled }) {
  const steps = arEnabled
    ? ["ar", "ar-summary", "game", "playing"]
    : ["game", "playing"];
  const labels = {
    ar: "RA",
    "ar-summary": "Resumen",
    game: "Juego",
    playing: "Vista Previa",
  };
  const currentIndex = Math.max(0, steps.indexOf(currentStep));

  return (
    <div className="logic-path-progress-bar">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={`logic-path-progress-step ${index < currentIndex ? "done" : index === currentIndex ? "active" : ""
              }`}
          >
            <span className="logic-path-progress-dot" />
            <span>{labels[step]}</span>
          </div>
          {index < steps.length - 1 && <span className="logic-path-progress-line" />}
        </React.Fragment>
      ))}
    </div>
  );
}

export function LogicPathARConfigurator({
  stages,
  activeStageName,
  selectedStages,
  stageConfig,
  fileRules,
  uploadingField,
  idPrefix,
  maxTextLength = 120,
  onStageSelect,
  onStageToggle,
  onTextChange,
  onFileChange,
  onClearText,
  onClearFile,
  onBack,
  onNext,
  nextDisabled = false,
}) {
  const stage = stageConfig || {};

  return (
    <>
      <h2 className="logic-path-section-title">Configuración de RA</h2>

      <div className="logic-path-ar-tabs">
        {stages.map((stageName) => (
          <button
            type="button"
            key={stageName}
            className={`logic-path-ar-tab ${activeStageName === stageName ? "active" : ""} ${selectedStages[stageName] ? "enabled" : ""
              }`}
            onClick={() => onStageSelect(stageName)}
          >
            {stageName}
            {selectedStages[stageName] && <span className="logic-path-ar-tab-check">✓</span>}
          </button>
        ))}
      </div>

      <div className="logic-path-ar-tab-content">
        <div className="logic-path-stage-toggle-row">
          <label className="logic-path-stage-toggle">
            <input
              type="checkbox"
              checked={Boolean(selectedStages[activeStageName])}
              onChange={(event) => onStageToggle(activeStageName, event.target.checked)}
            />
            <span>Habilitar etapa {activeStageName}</span>
          </label>
        </div>

        {selectedStages[activeStageName] ? (
          <div className="logic-path-content-cards">
            {CONTENT_CARDS.map((card) => {
              if (card.type === "Texto") {
                const hasText = Boolean(stage.text?.trim());
                return (
                  <article
                    className={`logic-path-content-card ${hasText ? "has-content" : ""}`}
                    key={card.type}
                  >
                    <div className="logic-path-card-header">
                      <Player src={card.icon} loop autoplay className="logic-path-card-icon" />
                      <strong>{card.title}</strong>
                      {hasText && (
                        <button
                          type="button"
                          className="logic-path-delete-btn"
                          onClick={() => onClearText(activeStageName)}
                          title="Eliminar texto"
                          aria-label="Eliminar texto"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <textarea
                      className="logic-path-field"
                      rows={3}
                      maxLength={maxTextLength}
                      placeholder={card.placeholder}
                      value={stage.text || ""}
                      onChange={(event) => onTextChange(activeStageName, event.target.value)}
                    />
                  </article>
                );
              }

              const rule = fileRules[card.type];
              const hasFile = Boolean(stage[card.urlKey]);
              const loadingKey = `${activeStageName}:${card.type}`;
              const inputId = `${idPrefix}-${activeStageName}-${card.type}`;

              return (
                <article
                  className={`logic-path-content-card ${hasFile ? "has-content" : ""}`}
                  key={card.type}
                >
                  <div className="logic-path-card-header">
                    <Player src={card.icon} loop autoplay className="logic-path-card-icon" />
                    <strong>{card.title}</strong>
                    {hasFile && (
                      <button
                        type="button"
                        className="logic-path-delete-btn"
                        onClick={() => onClearFile(activeStageName, card.type)}
                        title={`Eliminar ${card.title.toLowerCase()}`}
                        aria-label={`Eliminar ${card.title.toLowerCase()}`}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    id={inputId}
                    className="logic-path-file-input"
                    type="file"
                    accept={rule.accept}
                    onChange={(event) => onFileChange(activeStageName, card.type, event.target.files?.[0])}
                  />
                  <label
                    htmlFor={inputId}
                    className={`logic-path-upload-btn ${hasFile ? "has-file" : ""}`}
                  >
                    {uploadingField === loadingKey
                      ? "Preparando archivo..."
                      : hasFile
                        ? `${card.selectedIcon} ${card.selectedLabel}`
                        : `${card.uploadIcon} Seleccionar ${card.title.toLowerCase()}`}
                  </label>
                  {stage[card.nameKey] && (
                    <span className="logic-path-file-name">{stage[card.nameKey]}</span>
                  )}
                  {card.type === "Imagen" && hasFile && (
                    <img className="logic-path-preview-image" src={stage.imageUrl} alt="Vista previa" />
                  )}
                  {card.type === "Audio" && hasFile && (
                    <audio className="logic-path-preview-audio" src={stage.audioUrl} controls />
                  )}
                  {card.type === "Video" && hasFile && (
                    <video className="logic-path-preview-video" src={stage.videoUrl} controls />
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="logic-path-disabled-message">
            <p>Habilita esta etapa para configurar contenido de Realidad Aumentada.</p>
          </div>
        )}
      </div>

      <div className="logic-path-actions">
        <button type="button" className="logic-path-btn secondary" onClick={onBack}>
          ← Anterior
        </button>
        <button
          type="button"
          className="logic-path-btn"
          onClick={onNext}
          disabled={nextDisabled}
        >
          Siguiente →
        </button>
      </div>
    </>
  );
}

export function LogicPathARSummary({ stages, selectedStages, arConfig, onBack, onNext }) {
  return (
    <>
      <h2 className="logic-path-section-title summary">Resumen de Configuración RA</h2>
      <div className="logic-path-ar-summary-grid">
        {stages.map((stageName) => {
          const enabled = Boolean(selectedStages[stageName]);
          const stage = arConfig[stageName] || {};
          const items = [
            stage.text && { icon: "📝", label: "Texto configurado" },
            stage.imageUrl && { icon: "🖼️", label: "Imagen configurada" },
            stage.audioUrl && { icon: "🎵", label: "Audio configurado" },
            stage.videoUrl && { icon: "🎬", label: "Video configurado" },
          ].filter(Boolean);

          return (
            <article className={`logic-path-ar-summary-card ${enabled ? "enabled" : ""}`} key={stageName}>
              <header>
                <strong>{stageName}</strong>
                <span>{enabled ? "Habilitada" : "Deshabilitada"}</span>
              </header>
              <div>
                {!enabled && <p>No habilitada.</p>}
                {enabled && items.length === 0 && <p>Sin contenido configurado.</p>}
                {enabled &&
                  items.map((item) => (
                    <p className="logic-path-ar-summary-item" key={item.label}>
                      {item.icon} {item.label}
                    </p>
                  ))}
              </div>
            </article>
          );
        })}
      </div>
      <div className="logic-path-actions">
        <button type="button" className="logic-path-btn secondary" onClick={onBack}>
          ← Anterior
        </button>
        <button type="button" className="logic-path-btn" onClick={onNext}>
          Siguiente →
        </button>
      </div>
    </>
  );
}

export function LogicPathStageModal({
  stageName,
  stage = {},
  symbols = ["A", "D", "I", "B", "✦", "○"],
  confirmButtonText = "Continuar",
  cancelButtonText = "Cancelar",
  showCancelButton = false,
  showStageLabel = true,
  previewStyle = false,
  onConfirm,
  onCancel,
  onClose,
}) {
  const stageTitles = {
    Inicio: "Inicio del juego",
    Acierto: "Solución correcta",
    Final: "Final del juego",
  };
  const visualItems = [stage.text, stage.imageUrl, stage.videoUrl].filter(Boolean).length;

  return (
    <div
      className={`logic-path-stage-backdrop ${previewStyle ? "logic-path-stage-preview" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={stageTitles[stageName] || stageName}
    >
      <div className="logic-path-stage-modal">
        <div className="logic-path-stage-experience">
          <div className="logic-path-stage-symbols" aria-hidden="true">
            {symbols.slice(0, 6).map((symbol, index) => (
              <span key={`${symbol}-${index}`}>{symbol}</span>
            ))}
          </div>
          <div className="logic-path-stage-content">
            {showStageLabel && (
              <span className="logic-path-stage-label">
                {stageTitles[stageName] || stageName}
              </span>
            )}
            <div className={`logic-path-stage-media count-${visualItems}`}>
              {stage.text && <div className="logic-path-stage-text">{stage.text}</div>}
              {stage.imageUrl && (
                <img className="logic-path-stage-image" src={stage.imageUrl} alt="Contenido de Realidad Aumentada" />
              )}
              {stage.videoUrl && (
                <video className="logic-path-stage-video" src={stage.videoUrl} controls autoPlay muted />
              )}
            </div>
            {stage.audioUrl && <audio className="logic-path-stage-audio" src={stage.audioUrl} controls autoPlay />}
          </div>
        </div>
        <div className="logic-path-stage-actions">
          <button
            type="button"
            className="logic-path-stage-action confirm"
            onClick={onConfirm || onClose}
          >
            {confirmButtonText}
          </button>
          {showCancelButton && (
            <button
              type="button"
              className="logic-path-stage-action cancel"
              onClick={onCancel || onClose}
            >
              {cancelButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "No especificada";
  const normalized = dateString.includes("T") ? dateString : `${dateString}T00:00:00`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  return date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
}

function SummaryInfoCard({ icon, label, value, wide = false }) {
  return (
    <article className={`logic-path-info-card ${wide ? "wide" : ""}`}>
      <div className="logic-path-info-label">{icon}{label}</div>
      <div className="logic-path-info-value">{value}</div>
    </article>
  );
}

export function LogicPathConfigurationSummary({
  gameDetails = {},
  selectedPlatforms = [],
  selectedAreas = [],
  selectedSkills = [],
  areaNames = AREA_NAMES,
  parameters = [],
  arEnabled,
  isGenerating,
  progress,
  statusText,
  downloadDescription,
  downloadButtonLabel = "Generar y Descargar (.zip)",
  showDownloadPlatforms = false,
  className = "",
  onBack,
  onDownload,
}) {
  const normalizedPlatforms = selectedPlatforms.map((platform) =>
    String(platform).trim().toLowerCase(),
  );
  const platformLabel = (platform) =>
    platform === "ios"
      ? "iOS"
      : `${platform}`.charAt(0).toUpperCase() + `${platform}`.slice(1);
  const platforms = normalizedPlatforms.length
    ? normalizedPlatforms.map(platformLabel).join(", ")
    : "No seleccionadas";
  const formatSpanishList = (items) => {
    if (items.length <= 1) return items[0] || "";
    if (items.length === 2) return `${items[0]} y ${items[1]}`;
    return `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
  };

  const downloadPlatformNotice = (() => {
    const targets = normalizedPlatforms.map((platform) => {
      if (platform === "web") return "el paquete Web";
      if (platform === "android") return "el proyecto Android";
      if (platform === "ios") return "el proyecto iOS";
      return platform;
    });

    return `Se generará un ZIP con ${formatSpanishList(targets)} ${targets.length === 1 ? "incluido" : "incluidos"
      }.`;
  })();

  return (
    <div className={`logic-path-summary-screen ${className}`.trim()}>
      <h2 className="logic-path-success-title">
        <CheckCircle size={32} color="#22c55e" /> ¡Configuración Exitosa!
      </h2>
      <p className="logic-path-summary-copy">
        Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.
      </p>
      <h1 className="logic-path-summary-title">Resumen de la Configuración</h1>

      <div className="logic-path-info-grid">
        <SummaryInfoCard icon={<Tag size={16} />} label="Nombre del Juego" value={gameDetails.gameName || "No disponible"} />
        <SummaryInfoCard icon={<Type size={16} />} label="Nombre del Autor" value={gameDetails.authorName || "No especificado"} />
        <SummaryInfoCard icon={<Layers size={16} />} label="Versión" value={gameDetails.version || "1.0.0"} />
        <SummaryInfoCard icon={<FileText size={16} />} label="Descripción" value={gameDetails.description || "Sin descripción."} wide />
        <SummaryInfoCard icon={<Calendar size={16} />} label="Fecha de Creación" value={formatDate(gameDetails.date)} />
        <SummaryInfoCard icon={<Monitor size={16} />} label="Plataformas" value={platforms} />
      </div>

      <hr className="logic-path-summary-divider" />

      <div className="logic-path-summary-columns">
        <section className="logic-path-info-card logic-path-context-card areas">
          <h3><Shapes size={20} /> Áreas Seleccionadas</h3>
          {selectedAreas.length ? (
            <div className="logic-path-area-list">
              {selectedAreas.map((area) => (
                <span key={area}>
                  {AREA_ICONS[area] && <img src={AREA_ICONS[area]} alt="" />}
                  {areaNames[area] || area}
                </span>
              ))}
            </div>
          ) : (
            <p className="logic-path-empty-copy">No hay áreas seleccionadas.</p>
          )}
        </section>
        <section className="logic-path-info-card logic-path-context-card skills">
          <h3><ListChecks size={20} /> Habilidades Seleccionadas</h3>
          {selectedSkills.length ? (
            <ul>{selectedSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
          ) : (
            <p className="logic-path-empty-copy">No hay habilidades seleccionadas.</p>
          )}
        </section>
      </div>

      <section className="logic-path-parameters-card">
        <h3>Parámetros del Juego</h3>
        <div className="logic-path-parameter-list">
          {parameters.map(({ icon, label, value }) => (
            <div className="logic-path-parameter" key={label}>
              <span>{icon}{label}:</span>
              <strong>{value}</strong>
            </div>
          ))}
          <div className="logic-path-parameter">
            <span><Monitor size={18} /> Realidad Aumentada:</span>
            <strong>{arEnabled ? "Sí" : "No"}</strong>
          </div>
        </div>
        <div className="logic-path-edit-actions">
          <button type="button" className="logic-path-edit-btn" onClick={onBack} disabled={isGenerating}>
            <ArrowLeft size={18} /> Volver a Editar
          </button>
        </div>
      </section>

      <section className="logic-path-download-section">
        <h3>Descargar Paquete del Juego</h3>
        <p>{downloadDescription}</p>
        {showDownloadPlatforms && normalizedPlatforms.length > 0 && (
          <>
            <div className="logic-path-download-platforms" aria-label="Plataformas seleccionadas">
              {normalizedPlatforms.map((platform) => (
                <span className={`logic-path-platform-badge ${platform}`} key={platform}>
                  {platform === "web" ? <Monitor size={14} /> : <Smartphone size={14} />}
                  {platformLabel(platform)}
                </span>
              ))}
            </div>
            <div className="logic-path-platform-notices">
              <div className="logic-path-platform-notice">
                <span aria-hidden="true">📦</span> {downloadPlatformNotice}
              </div>
            </div>
          </>
        )}
        {isGenerating && (
          <div className="logic-path-download-progress">
            <div><span>{statusText}</span><strong>{progress}%</strong></div>
            <div className="logic-path-download-track"><span style={{ width: `${progress}%` }} /></div>
          </div>
        )}
        <button type="button" className="logic-path-download-btn" onClick={onDownload} disabled={isGenerating}>
          <Download size={18} /> {isGenerating ? "Generando..." : downloadButtonLabel}
        </button>
      </section>
    </div>
  );
}
