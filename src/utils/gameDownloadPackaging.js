import JSZip from "jszip";
import { buildNativeTemplatePackage } from "./nativeTemplatePackaging";

export const GAME_PLATFORM_ORDER = Object.freeze(["web", "android", "ios"]);

export const GAME_PLATFORM_LABELS = Object.freeze({
  web: "Web",
  android: "Android",
  ios: "iOS",
});

export function normalizeGamePlatforms(platforms) {
  const selected = new Set(
    (Array.isArray(platforms) ? platforms : []).map((platform) =>
      String(platform).trim().toLowerCase(),
    ),
  );
  const result = GAME_PLATFORM_ORDER.filter((platform) => selected.has(platform));
  return result.length > 0 ? result : ["web"];
}

export function formatGamePlatformList(platforms) {
  return normalizeGamePlatforms(platforms)
    .map((platform) => GAME_PLATFORM_LABELS[platform])
    .join(", ");
}

export function buildGamePackageNotice(platforms) {
  const selected = normalizeGamePlatforms(platforms);
  const targets = selected.map((platform) =>
    platform === "web"
      ? "el paquete Web"
      : `el proyecto ${GAME_PLATFORM_LABELS[platform]}`,
  );
  const formatted = targets.length === 1
    ? targets[0]
    : targets.length === 2
      ? `${targets[0]} y ${targets[1]}`
      : `${targets.slice(0, -1).join(", ")} y ${targets.at(-1)}`;
  return `Se generará un ZIP con ${formatted} ${targets.length === 1 ? "incluido" : "incluidos"}.`;
}

export async function createGameDownloadArchive({
  folderName,
  baseFileName,
  htmlContent,
  configFileName,
  config,
  selectedPlatforms,
  nativeTemplates = {},
  nativeMetadata,
  webFiles = {},
  onStatus,
}) {
  const platforms = normalizeGamePlatforms(selectedPlatforms);
  const archive = new JSZip();
  const folder = archive.folder(folderName);

  if (platforms.includes("web")) {
    onStatus?.("Preparando paquete Web...");
    folder.file("index.html", htmlContent);
    folder.file(configFileName, JSON.stringify(config, null, 2));
    Object.entries(webFiles).forEach(([fileName, content]) => folder.file(fileName, content));
  }

  for (const platform of ["android", "ios"]) {
    if (!platforms.includes(platform)) continue;
    const template = nativeTemplates[platform];
    if (!template?.url) {
      throw new Error(`No se configuró la plantilla ${GAME_PLATFORM_LABELS[platform]}.`);
    }
    const nativeContent = await buildNativeTemplatePackage({
      templateUrl: template.url,
      platform,
      htmlContent,
      configFileName,
      config,
      replaceIndex: template.replaceIndex ?? false,
      nativeMetadata,
      onStatus,
    });
    folder.file(`${baseFileName}_${platform}.zip`, nativeContent);
  }

  onStatus?.("Generando paquete final...");
  return archive.generateAsync({ type: "blob" });
}

export function downloadGameArchive(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
