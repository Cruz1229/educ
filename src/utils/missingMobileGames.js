import { createGameDownloadArchive, normalizeGamePlatforms } from './gameDownloadPackaging';

export const MISSING_MOBILE_GAMES = Object.freeze({
  minermyst: 'MinerMyst',
  circuitswap: 'CircuitSwap',
  magforce: 'MagForce',
  'torres-hanoi': 'Torres de Hanoi',
  stroop: 'Stroop',
  'geometric-art': 'Geometric Art',
  memoria: 'Memoria',
  tangram: 'Tangram',
  'diseno-fractal': 'Diseño fractal',
});

export function getMobileTemplates(slug) {
  if (!MISSING_MOBILE_GAMES[slug]) throw new Error(`Juego móvil desconocido: ${slug}`);
  return Object.fromEntries(['android', 'ios'].map(platform => [platform, { url: `/templates/${slug}_${platform}.zip`, replaceIndex: false }]));
}

export function buildMissingMobileConfig(slug, details = {}, platforms = [], options = {}) {
  if (!MISSING_MOBILE_GAMES[slug]) throw new Error(`Juego móvil desconocido: ${slug}`);
  const config = {
    nombreApp: details.gameName || MISSING_MOBILE_GAMES[slug],
    autor: details.authorName || '',
    version: details.version || '1.0.0',
    fecha: details.date || new Date().toISOString().slice(0, 10),
    descripcion: details.description || '',
    plataformas: normalizeGamePlatforms(platforms),
  };
  if (options.nivel) config.nivel = options.nivel;
  if (['circuitswap', 'magforce'].includes(slug)) config.objetos = (options.objetos || []).map(o => typeof o === 'string' ? o : o.id);
  if (['geometric-art', 'tangram'].includes(slug)) config.figuras = [...(options.figuras || [])];
  if (slug === 'memoria') { config.categoria = options.categoria; config.cantidadPalabras = Number(options.cantidadPalabras); }
  return config;
}

export async function buildMissingMobileDownload({ slug, details, platforms, options, htmlContent, webAssets = [], onStatus }) {
  const config = buildMissingMobileConfig(slug, details, platforms, options);
  const baseName = (config.nombreApp || slug).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || slug;
  const webFiles = {};
  if (config.plataformas.includes('web')) {
    for (const asset of webAssets) {
      const response = await fetch(asset);
      if (!response.ok) throw new Error(`No se pudo incluir el recurso ${asset}.`);
      webFiles[asset.replace(/^\//, '')] = await response.arrayBuffer();
    }
  }
  const uniqueId = window.crypto?.randomUUID?.().replace(/-/g, '') || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  const blob = await createGameDownloadArchive({
    folderName: MISSING_MOBILE_GAMES[slug], baseFileName: baseName, htmlContent,
    configFileName: `${slug}-config.json`, config, selectedPlatforms: config.plataformas,
    nativeTemplates: getMobileTemplates(slug),
    nativeMetadata: { appName: config.nombreApp, appId: `io.${slug.replace(/-/g, '')}.steam.g${uniqueId}` },
    webFiles, onStatus,
  });
  return { blob, fileName: `${baseName}_${config.plataformas.join('_')}.zip` };
}
