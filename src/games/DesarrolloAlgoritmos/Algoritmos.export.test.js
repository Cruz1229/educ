import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { SummaryPanel } from "./Algoritmos";

function readBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

test("la descarga de Algorithm incluye ambas plantillas con la configuración elegida", async () => {
  const originalFetch = global.fetch;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  global.fetch = jest.fn(async (url) => ({
    ok: true,
    arrayBuffer: async () => fs.readFileSync(path.join(process.cwd(), "public", url)),
  }));
  URL.createObjectURL = jest.fn(() => "blob:algorithm-export");
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  try {
    render(<SummaryPanel
      difficulty="basico"
      selectedIds={["suma", "metros", "promedio"]}
      arEnabled
      arSelectedStages={{ Inicio: true, Acierto: false, Final: false }}
      arConfig={{ Inicio: { text: "Inicio elegido" } }}
      onBack={jest.fn()}
      state={{
        selectedPlatforms: ["web", "android", "ios"],
        gameDetails: {
          gameName: "Mi Algorithm", authorName: "Docente", description: "Ejercicios elegidos",
          date: "2026-09-03", version: "2.0",
        },
      }}
    />);
    fireEvent.click(screen.getByRole("button", { name: /Generar \(\.zip\)/i }));
    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled(), { timeout: 15000 });
    const outer = await JSZip.loadAsync(await readBlob(URL.createObjectURL.mock.calls[0][0]));
    expect(await outer.file("Algorithm/index.html").async("string")).toContain('id="start-screen" class="overlay"');
    expect(JSON.parse(await outer.file("Algorithm/algorithm-config.json").async("string")).challengeIds)
      .toEqual(["suma", "metros", "promedio"]);
    for (const filename of ["algorithm_android.zip", "algoritmos_ios.zip"]) {
      const native = await JSZip.loadAsync(await outer.file(`Algorithm/${filename}`).async("uint8array"));
      const configPath = Object.keys(native.files).find(name => name.replace(/\\/g, "/").endsWith("/config/algoritmos-config.json"));
      const config = JSON.parse(await native.file(configPath).async("string"));
      expect(config).toMatchObject({ nombreApp: "Mi Algorithm", autor: "Docente", nivel: "basico", descripcion: "Ejercicios elegidos" });
      expect(config.ejercicios.map(exercise => exercise.id)).toEqual(["suma", "metros", "promedio"]);
      expect(config.ejercicios.every(exercise => exercise.options.length > 0)).toBe(true);
      expect(config.ar.inicio).toMatchObject({ activo: true, contenido: { texto: "Inicio elegido" } });
      expect(config.ar.acierto.activo).toBe(false);
      expect(config.ar.fin.activo).toBe(false);
    }
  } finally {
    global.fetch = originalFetch;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    jest.restoreAllMocks();
  }
}, 20000);
