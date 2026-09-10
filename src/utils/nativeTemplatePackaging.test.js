import JSZip from "jszip";
import fs from "fs";
import path from "path";
import {
  buildNativeTemplatePackage,
  fetchNativeTemplateData,
  injectNativeTemplate,
} from "./nativeTemplatePackaging";

describe("nativeTemplatePackaging", () => {
  test("inyecta HTML, configuración y permiso de cámara en una plantilla iOS", async () => {
    const template = new JSZip();
    template.file("ios/App/App/public/index.html", "original");
    template.file(
      "ios/App/App/Info.plist",
      '<?xml version="1.0"?><plist version="1.0"><dict></dict></plist>',
    );
    const templateData = await template.generateAsync({ type: "uint8array" });

    const result = await injectNativeTemplate({
      templateData,
      platform: "ios",
      htmlContent: "<html>LogicPath</html>",
      configFileName: "logicpath-config.json",
      config: { gameType: "laberinto" },
      arEnabled: true,
    });

    await expect(
      result.file("ios/App/App/public/index.html").async("string"),
    ).resolves.toBe("<html>LogicPath</html>");
    await expect(
      result
        .file("ios/App/App/public/config/logicpath-config.json")
        .async("string"),
    ).resolves.toContain('"gameType": "laberinto"');
    await expect(
      result.file("ios/App/App/Info.plist").async("string"),
    ).resolves.toContain("NSCameraUsageDescription");
  });

  test("conserva el index nativo y añade archivos públicos para una plantilla iOS", async () => {
    const template = new JSZip();
    template.file("ios/App/App/public/index.html", "index nativo");
    template.file(
      "ios/App/App/Info.plist",
      '<?xml version="1.0"?><plist version="1.0"><dict></dict></plist>',
    );
    const templateData = await template.generateAsync({ type: "uint8array" });

    const result = await injectNativeTemplate({
      templateData,
      platform: "ios",
      configFileName: "bloques-config.json",
      config: { juegoId: "BloqCode" },
      arEnabled: true,
      replaceIndex: false,
      publicFiles: {
        "data/exercises.json": JSON.stringify({ exercises: [{ id: "b2" }] }),
      },
    });

    await expect(
      result.file("ios/App/App/public/index.html").async("string"),
    ).resolves.toBe("index nativo");
    await expect(
      result.file("ios/App/App/public/data/exercises.json").async("string"),
    ).resolves.toContain('"b2"');
  });

  test("informa la ruta exacta cuando falta una plantilla", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(
      buildNativeTemplatePackage({
        templateUrl: "/templates/algorithm_ios.zip",
        platform: "ios",
        htmlContent: "<html></html>",
        configFileName: "algorithm-config.json",
        config: {},
      }),
    ).rejects.toThrow("/templates/algorithm_ios.zip");

    global.fetch = originalFetch;
  });

  test("rechaza la respuesta HTML del servidor cuando todavía no existe el ZIP", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: async () => Uint8Array.from([60, 104, 116, 109, 108, 62]).buffer,
    });

    await expect(
      fetchNativeTemplateData("/templates/bloqcode_ios.zip", "iOS"),
    ).rejects.toThrow("/templates/bloqcode_ios.zip");

    global.fetch = originalFetch;
  });

  test("adapta la plantilla Android real con HTML, configuración y cámara", async () => {
    const templateData = fs.readFileSync(
      path.join(process.cwd(), "public", "templates", "laberinto_android.zip"),
    );
    const result = await injectNativeTemplate({
      templateData,
      platform: "android",
      htmlContent: "<html>Robot Walking</html>",
      configFileName: "robot-config.json",
      config: { gameType: "robot" },
      arEnabled: true,
    });
    const files = Object.keys(result.files);
    const findEntry = (suffix) =>
      files.find((file) =>
        file.replace(/\\/g, "/").toLowerCase().endsWith(suffix.toLowerCase()),
      );

    const indexPath = findEntry("/app/src/main/assets/public/index.html");
    const configPath = findEntry(
      "/app/src/main/assets/public/config/robot-config.json",
    );
    const manifestPath = findEntry("/app/src/main/AndroidManifest.xml");

    await expect(result.file(indexPath).async("string")).resolves.toBe(
      "<html>Robot Walking</html>",
    );
    await expect(result.file(configPath).async("string")).resolves.toContain(
      '"gameType": "robot"',
    );
    await expect(result.file(manifestPath).async("string")).resolves.toContain(
      "android.permission.CAMERA",
    );
  });

  test("adapta la plantilla iOS real de Laberinto con configuración y cámara", async () => {
    const templateData = fs.readFileSync(
      path.join(process.cwd(), "public", "templates", "laberinto_ios.zip"),
    );
    const result = await injectNativeTemplate({
      templateData,
      platform: "ios",
      htmlContent: "<html>LogicPath iOS</html>",
      configFileName: "logicpath-config.json",
      config: { gameType: "laberinto" },
      arEnabled: true,
    });
    const files = Object.keys(result.files);
    const findEntry = (suffix) =>
      files.find((file) =>
        file.replace(/\\/g, "/").toLowerCase().endsWith(suffix.toLowerCase()),
      );
    const indexPath = findEntry("/app/app/public/index.html");
    const configPath = findEntry(
      "/app/app/public/config/logicpath-config.json",
    );
    const infoPlistPath = findEntry("/app/app/info.plist");

    await expect(
      result.file(indexPath).async("string"),
    ).resolves.toBe("<html>LogicPath iOS</html>");
    await expect(
      result.file(configPath).async("string"),
    ).resolves.toContain('"gameType": "laberinto"');
    await expect(
      result.file(infoPlistPath).async("string"),
    ).resolves.toContain("NSCameraUsageDescription");
  });

  test("conserva BloqCode Android e inyecta sólo los desafíos elegidos", async () => {
    const templateData = fs.readFileSync(
      path.join(process.cwd(), "public", "templates", "bloqcode_android.zip"),
    );
    const originalZip = await JSZip.loadAsync(templateData);
    const indexPath = "android/app/src/main/assets/public/index.html";
    const originalIndex = await originalZip.file(indexPath).async("string");

    const result = await injectNativeTemplate({
      templateData,
      platform: "android",
      configFileName: "bloques-config.json",
      config: {
        juegoId: "BloqCode",
        plataformas: ["web", "android"],
        desafiosSeleccionados: ["b2"],
        ar: { acierto: { activo: true } },
      },
      arEnabled: true,
      replaceIndex: false,
      publicFiles: {
        "data/exercises.json": JSON.stringify({
          exercises: [{ id: "b2", title: "Resta" }],
        }),
      },
    });

    await expect(result.file(indexPath).async("string")).resolves.toBe(originalIndex);
    await expect(
      result
        .file("android/app/src/main/assets/public/config/bloques-config.json")
        .async("string"),
    ).resolves.toContain('"b2"');
    await expect(
      result
        .file("android/app/src/main/assets/public/data/exercises.json")
        .async("string"),
    ).resolves.toContain('"Resta"');
    await expect(
      result.file("android/app/src/main/AndroidManifest.xml").async("string"),
    ).resolves.toContain("android.permission.CAMERA");
  });
});
