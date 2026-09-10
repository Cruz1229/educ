import {
  fetchNativeTemplateData,
  injectNativeTemplate,
} from "../../utils/nativeTemplatePackaging";

export const ALGORITHM_NATIVE_TEMPLATE_URLS = {
  android: "/templates/algoritmos_android.zip",
  ios: "/templates/algoritmos_ios.zip",
};

const NATIVE_CONFIG_FILE = "algoritmos-config.json";
const NATIVE_STAGES = { Inicio: "inicio", Acierto: "acierto", Final: "fin" };

export function buildAlgorithmNativeConfig(config, challenges) {
  return {
    nombreApp: config.nombreApp,
    nivel: config.level,
    autor: config.autor,
    version: config.version,
    fecha: config.fecha,
    descripcion: config.descripcion,
    plataformas: config.plataformas,
    ejercicios: challenges.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.summary,
      options: challenge.commands.map((command, index) => ({
        id: `${challenge.id}-${index}`,
        label: command,
        lines: [command],
      })),
    })),
    ar: Object.fromEntries(
      Object.entries(NATIVE_STAGES).map(([stage, nativeStage]) => {
        const active = Boolean(config.ar?.enabled && config.ar.selectedStages?.[stage]);
        const content = active ? config.ar.stages?.[stage] || {} : {};
        return [nativeStage, {
          activo: active,
          contenido: {
            texto: content.text || "",
            imagen: content.imageUrl || "",
            audio: content.audioUrl || "",
            video: content.videoUrl || "",
          },
        }];
      }),
    ),
  };
}

export async function buildAlgorithmNativePackage({ platform, config, challenges, onStatus }) {
  const templateUrl = ALGORITHM_NATIVE_TEMPLATE_URLS[platform];
  if (!templateUrl) throw new Error(`Plataforma de Algorithm no soportada: ${platform}`);

  onStatus?.(`Descargando plantilla ${platform.toUpperCase()}...`);
  const templateData = await fetchNativeTemplateData(templateUrl, platform);
  const zip = await injectNativeTemplate({
    templateData,
    platform,
    configFileName: NATIVE_CONFIG_FILE,
    config: buildAlgorithmNativeConfig(config, challenges),
    arEnabled: Boolean(config.ar?.enabled),
    replaceIndex: false,
  });

  // The supplied apps only look up their seven bundled exercise IDs. Extend
  // that lookup to accept configured exercises, keeping the native UI/assets.
  onStatus?.(`Configurando proyecto ${platform.toUpperCase()}...`);
  let adaptedScripts = 0;
  for (const entry of Object.values(zip.files)) {
    if (entry.dir || !/[/\\]public[/\\]assets[/\\].+\.js$/.test(entry.name)) continue;
    const script = await entry.async("string");
    if (!script.includes(`/config/${NATIVE_CONFIG_FILE}`)) continue;

    let replacements = 0;
    const adapted = script.replace(
      /(\.ejercicios\.map\()([\w$]+)=>([\w$]+)\.get\(\2\)(\))/g,
      (_, prefix, exercise, catalog, suffix) => {
        replacements += 1;
        return `${prefix}${exercise}=>typeof ${exercise}==="string"?${catalog}.get(${exercise}):${exercise}${suffix}`;
      },
    );
    if (replacements !== 1) {
      throw new Error("La plantilla de Algorithm cambió y no permite configurar los ejercicios.");
    }
    zip.file(entry.name, adapted);
    adaptedScripts += 1;
  }
  if (!adaptedScripts) {
    throw new Error("La plantilla de Algorithm no contiene el lector de configuración esperado.");
  }

  return zip.generateAsync({ type: "blob" });
}
