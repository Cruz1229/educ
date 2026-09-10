import fs from "fs";
import path from "path";
import crypto from "crypto";
import { runInNewContext } from "vm";
import { parse } from "@babel/parser";
import JSZip from "jszip";
import {
  ALGORITHM_NATIVE_TEMPLATE_URLS,
  buildAlgorithmNativeConfig,
  buildAlgorithmNativePackage,
} from "./algorithmNativePackaging";

const challenges = [{
  id: "suma",
  title: "Suma de dos numeros",
  summary: "Suma las entradas.",
  commands: ["Proceso Suma", "Leer A", "Leer B", "C <- A + B", "FinProceso"],
}];
const config = {
  nombreApp: "Algorithm personalizado",
  level: "basico",
  autor: "Autora de prueba",
  version: "2.0.0",
  fecha: "2026-09-03",
  descripcion: "Descripción elegida",
  plataformas: ["android", "ios"],
  ar: {
    enabled: true,
    selectedStages: { Inicio: true, Acierto: false, Final: true },
    stages: {
      Inicio: { text: "Comienza", imageUrl: "data:image/png;base64,aW1hZ2Vu" },
      Acierto: { text: "No debe mostrarse" },
      Final: { text: "Terminaste", audioUrl: "data:audio/mp3;base64,YXVkaW8=", videoUrl: "data:video/mp4;base64,dmlkZW8=" },
    },
  },
};
const emptyContent = { texto: "", imagen: "", audio: "", video: "" };
const originalFetch = global.fetch;

function readBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

afterEach(() => { global.fetch = originalFetch; });

test.each(["basico", "intermedio", "avanzado"])("adapta el nivel %s, ejercicios y RA al formato móvil", (level) => {
  const native = buildAlgorithmNativeConfig({ ...config, level }, challenges);
  expect(native).toMatchObject({
    nombreApp: config.nombreApp, nivel: level, autor: config.autor,
    version: config.version, fecha: config.fecha, descripcion: config.descripcion,
    plataformas: config.plataformas,
  });
  expect(native.ejercicios).toEqual([{
    id: "suma", title: challenges[0].title, description: challenges[0].summary,
    options: challenges[0].commands.map((command, index) => ({
      id: `suma-${index}`, label: command, lines: [command],
    })),
  }]);
  expect(native.ar.inicio).toEqual({ activo: true, contenido: {
    texto: "Comienza", imagen: config.ar.stages.Inicio.imageUrl, audio: "", video: "",
  } });
  expect(native.ar.acierto).toEqual({ activo: false, contenido: emptyContent });
  expect(native.ar.fin).toEqual({ activo: true, contenido: {
    texto: "Terminaste", imagen: "", audio: config.ar.stages.Final.audioUrl,
    video: config.ar.stages.Final.videoUrl,
  } });
});

test("no conserva la RA de demostración cuando se desactiva", () => {
  const native = buildAlgorithmNativeConfig({ ...config, ar: { enabled: false } }, challenges);
  expect(Object.values(native.ar)).toEqual(Array(3).fill({ activo: false, contenido: emptyContent }));
});

test.each([
  ["android", "9893d23ca99b55b0ed28fac8ab957b4581466a6117ea3dc1ee421ef588f1fe84"],
  ["ios", "eb15da0fadba36d27ca10b6050592eca1ee56d8d43a495430bbb3638842f2b8e"],
])("usa la plantilla %s suministrada y preserva la interfaz móvil", async (platform, hash) => {
  const bytes = fs.readFileSync(path.join(process.cwd(), "public", ALGORITHM_NATIVE_TEMPLATE_URLS[platform]));
  expect(crypto.createHash("sha256").update(bytes).digest("hex")).toBe(hash);
  global.fetch = jest.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes });
  const original = await JSZip.loadAsync(bytes);
  const result = await JSZip.loadAsync(await readBlob(await buildAlgorithmNativePackage({
    platform, config, challenges,
  })));
  expect(global.fetch).toHaveBeenCalledWith(ALGORITHM_NATIVE_TEMPLATE_URLS[platform]);
  const findPath = (suffix) => Object.keys(result.files).find(name => name.replace(/\\/g, "/").endsWith(suffix));
  const configPath = findPath("/public/config/algoritmos-config.json");
  expect(JSON.parse(await result.file(configPath).async("string"))).toEqual(buildAlgorithmNativeConfig(config, challenges));
  expect(findPath("/public/config/algorithm-config.json")).toBeUndefined();

  let adaptedScripts = 0;
  for (const entry of Object.values(original.files)) {
    if (entry.dir) continue;
    const originalBytes = await entry.async("uint8array");
    const outputBytes = await result.file(entry.name).async("uint8array");
    if (entry.name === configPath || /AndroidManifest\.xml$|Info\.plist$/.test(entry.name)) continue;
    if (/\.js$/.test(entry.name) && (await entry.async("string")).includes("/config/algoritmos-config.json")) {
      const script = await result.file(entry.name).async("string");
      expect(() => parse(script, { sourceType: "unambiguous" })).not.toThrow();
      const lookup = script.match(/([\w$]+)\.ejercicios\.map\(([\w$]+)=>typeof \2==="string"\?([\w$]+)\.get\(\2\):\2\)/);
      expect(lookup).not.toBeNull();
      const selected = buildAlgorithmNativeConfig(config, challenges).ejercicios[0];
      const bundled = { id: "bundled" };
      expect(runInNewContext(lookup[0], {
        [lookup[1]]: { ejercicios: [selected, "bundled"] },
        [lookup[3]]: new Map([["bundled", bundled]]),
      })).toEqual([selected, bundled]);
      adaptedScripts += 1;
    } else {
      // Includes index.html, styles, icons, native projects and all other assets.
      expect(Buffer.compare(Buffer.from(outputBytes), Buffer.from(originalBytes))).toBe(0);
    }
  }
  expect(adaptedScripts).toBe(2); // Modern and legacy builds both consume the selected exercises.
  const permissionPath = findPath(platform === "android" ? "/main/AndroidManifest.xml" : "/App/Info.plist");
  expect(await result.file(permissionPath).async("string")).toContain(
    platform === "android" ? "android.permission.CAMERA" : "NSCameraUsageDescription",
  );
});

test("rechaza una plantilla cuyo lector móvil ya no sea compatible", async () => {
  const template = new JSZip();
  template.file("android/app/src/main/assets/public/index.html", "<html></html>");
  template.file("android/app/src/main/assets/public/assets/index.js", 'fetch("/config/algoritmos-config.json")');
  const bytes = await template.generateAsync({ type: "uint8array" });
  global.fetch = jest.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes });
  await expect(buildAlgorithmNativePackage({
    platform: "android", config: { ...config, ar: { enabled: false } }, challenges,
  })).rejects.toThrow("no permite configurar los ejercicios");
});
