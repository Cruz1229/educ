import JSZip from "jszip";

const CAMERA_PERMISSION_TEXT =
  "La realidad aumentada necesita acceso a la cámara.";

function normalizedFilePaths(zip) {
  return Object.keys(zip.files)
    .filter((path) => !zip.files[path].dir)
    .map((path) => ({ original: path, normalized: path.replace(/\\/g, "/") }));
}

function findFilePath(entries, preferredPath, suffixes) {
  const preferred = entries.find(
    ({ normalized }) => normalized.toLowerCase() === preferredPath.toLowerCase(),
  );
  if (preferred) return preferred;

  return entries.find(({ normalized }) =>
    suffixes.some((suffix) =>
      normalized.toLowerCase().endsWith(suffix.toLowerCase()),
    ),
  );
}

function addAndroidCameraPermission(manifest) {
  if (manifest.includes("android.permission.CAMERA")) return manifest;
  if (!manifest.includes("</manifest>")) {
    throw new Error("La plantilla Android contiene un AndroidManifest.xml inválido.");
  }
  return manifest.replace(
    "</manifest>",
    '    <uses-permission android:name="android.permission.CAMERA" />\n</manifest>',
  );
}

function addIOSCameraPermission(infoPlist) {
  if (infoPlist.includes("NSCameraUsageDescription")) return infoPlist;
  const closingDict = infoPlist.lastIndexOf("</dict>");
  if (closingDict < 0 || !infoPlist.includes("<plist")) {
    throw new Error(
      "La plantilla iOS debe incluir un Info.plist XML para configurar la cámara.",
    );
  }

  const permission =
    `\t<key>NSCameraUsageDescription</key>\n` +
    `\t<string>${CAMERA_PERMISSION_TEXT}</string>\n`;
  return `${infoPlist.slice(0, closingDict)}${permission}${infoPlist.slice(closingDict)}`;
}

function hasZipSignature(templateData) {
  const bytes = new Uint8Array(templateData);
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) ||
      (bytes[2] === 0x05 && bytes[3] === 0x06) ||
      (bytes[2] === 0x07 && bytes[3] === 0x08));
}

function nativePlatformName(platform) {
  const normalized = String(platform).trim().toLowerCase();
  if (normalized === "ios") return "iOS";
  if (normalized === "android") return "Android";
  return String(platform);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function updateOptionalTextFile(zip, entries, preferredPath, suffixes, update) {
  const entry = findFilePath(entries, preferredPath, suffixes);
  if (!entry) return;
  const current = await zip.file(entry.original).async("string");
  zip.file(entry.original, update(current));
}

function updateCapacitorConfig(content, { appId, appName }) {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(
      {
        ...parsed,
        ...(appId ? { appId } : {}),
        ...(appName ? { appName } : {}),
      },
      null,
      2,
    );
  } catch {
    let updated = content;
    if (appId) {
      updated = updated.replace(
        /"appId"\s*:\s*"[^"]*"/,
        `"appId": ${JSON.stringify(appId)}`,
      );
    }
    if (appName) {
      updated = updated.replace(
        /"appName"\s*:\s*"[^"]*"/,
        `"appName": ${JSON.stringify(appName)}`,
      );
    }
    return updated;
  }
}

async function applyNativeMetadata(zip, entries, platform, metadata = {}) {
  const appId = String(metadata.appId || "").trim();
  const appName = String(metadata.appName || "").trim();
  if (!appId && !appName) return;

  if (platform === "android") {
    await updateOptionalTextFile(
      zip,
      entries,
      "android/app/build.gradle",
      ["/app/build.gradle"],
      (content) => {
        let updated = content;
        if (appId) {
          updated = updated
            .replace(/applicationId\s*(?:=\s*)?["'][^"']+["']/, `applicationId "${appId}"`);
        }
        return updated;
      },
    );
    await updateOptionalTextFile(
      zip,
      entries,
      "android/app/src/main/assets/capacitor.config.json",
      ["/app/src/main/assets/capacitor.config.json"],
      (content) => updateCapacitorConfig(content, { appId, appName }),
    );
    await updateOptionalTextFile(
      zip,
      entries,
      "android/app/src/main/res/values/strings.xml",
      ["/app/src/main/res/values/strings.xml"],
      (content) => {
        let updated = content;
        if (appName) {
          updated = updated
            .replace(/<string name="app_name">[^<]*<\/string>/, `<string name="app_name">${escapeXml(appName)}</string>`)
            .replace(/<string name="title_activity_main">[^<]*<\/string>/, `<string name="title_activity_main">${escapeXml(appName)}</string>`);
        }
        if (appId) {
          updated = updated
            .replace(/<string name="package_name">[^<]*<\/string>/, `<string name="package_name">${escapeXml(appId)}</string>`)
            .replace(/<string name="custom_url_scheme">[^<]*<\/string>/, `<string name="custom_url_scheme">${escapeXml(appId)}</string>`);
        }
        return updated;
      },
    );
    return;
  }

  await updateOptionalTextFile(
    zip,
    entries,
    "ios/App/App/capacitor.config.json",
    ["/app/app/capacitor.config.json"],
    (content) => updateCapacitorConfig(content, { appId, appName }),
  );
  await updateOptionalTextFile(
    zip,
    entries,
    "ios/App/App/Info.plist",
    ["/app/app/info.plist", "/info.plist"],
    (content) => appName
      ? content.replace(
          /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,
          `$1${escapeXml(appName)}$2`,
        )
      : content,
  );
  await updateOptionalTextFile(
    zip,
    entries,
    "ios/App/App.xcodeproj/project.pbxproj",
    ["/app/app.xcodeproj/project.pbxproj", "/project.pbxproj"],
    (content) => appId
      ? content.replace(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*[^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${appId};`)
      : content,
  );
}

export async function fetchNativeTemplateData(templateUrl, platform) {
  const platformName = nativePlatformName(platform);
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(
      `Plantilla ${platformName} no disponible: agrega ${templateUrl} (HTTP ${response.status}).`,
    );
  }
  const templateData = await response.arrayBuffer();
  if (!hasZipSignature(templateData)) {
    throw new Error(
      `Plantilla ${platformName} no disponible: agrega un ZIP válido en ${templateUrl}.`,
    );
  }
  return templateData;
}

export async function injectNativeTemplate({
  templateData,
  platform,
  htmlContent,
  configFileName,
  config,
  arEnabled = false,
  replaceIndex = true,
  publicFiles = {},
  nativeMetadata,
}) {
  if (!templateData) throw new Error("La plantilla nativa está vacía.");
  if (replaceIndex && !htmlContent) {
    throw new Error("No se recibió el HTML del juego.");
  }
  if (!configFileName) throw new Error("No se indicó el archivo de configuración.");

  const normalizedPlatform = String(platform).trim().toLowerCase();
  if (!["android", "ios"].includes(normalizedPlatform)) {
    throw new Error(`Plataforma nativa no soportada: ${platform}`);
  }

  const zip = await JSZip.loadAsync(templateData);
  const paths = normalizedFilePaths(zip);
  const indexEntry =
    normalizedPlatform === "android"
      ? findFilePath(
          paths,
          "android/app/src/main/assets/public/index.html",
          ["/app/src/main/assets/public/index.html", "/public/index.html"],
        )
      : findFilePath(paths, "ios/App/App/public/index.html", [
          "/app/app/public/index.html",
          "/public/index.html",
        ]);

  if (!indexEntry) {
    throw new Error(
      `La plantilla ${normalizedPlatform.toUpperCase()} no contiene una carpeta public con index.html.`,
    );
  }

  const publicRoot = indexEntry.original.slice(0, -"index.html".length);
  const publicPathSeparator = publicRoot.endsWith("\\") ? "\\" : "/";
  const publicPath = (relativePath) => {
    const normalizedRelativePath = String(relativePath)
      .replace(/^[\\/]+/, "")
      .replace(/[\\/]+/g, publicPathSeparator);
    return `${publicRoot}${normalizedRelativePath}`;
  };
  if (replaceIndex) zip.file(indexEntry.original, htmlContent);
  zip.file(
    publicPath(`config/${configFileName}`),
    JSON.stringify(config, null, 2),
  );
  // Source-based templates must retain personalization after rebuilding/syncing.
  for (const root of ['public', 'dist']) {
    const sourceConfig = `${root}/config/${configFileName}`;
    if (zip.file(sourceConfig)) zip.file(sourceConfig, JSON.stringify(config, null, 2));
  }
  if (zip.file('src/game/default-config.json')) {
    zip.file('src/game/default-config.json', JSON.stringify(config, null, 2));
  }
  if (nativeMetadata && zip.file('capacitor.config.ts')) {
    let source = await zip.file('capacitor.config.ts').async('string');
    for (const key of ['appId', 'appName']) {
      if (!nativeMetadata[key]) continue;
      const pattern = new RegExp(`((?:\\b${key}|["']${key}["'])\\s*:\\s*)(["'])(?:\\\\.|(?!\\2).)*\\2`, 'g');
      source = source.replace(pattern, (_, prefix) => prefix + JSON.stringify(nativeMetadata[key]));
    }
    zip.file('capacitor.config.ts', source);
  }
  Object.entries(publicFiles).forEach(([relativePath, content]) => {
    zip.file(publicPath(relativePath), content);
  });

  await applyNativeMetadata(zip, paths, normalizedPlatform, nativeMetadata);

  if (arEnabled && normalizedPlatform === "android") {
    const manifestEntry = findFilePath(
      paths,
      "android/app/src/main/AndroidManifest.xml",
      ["/app/src/main/androidmanifest.xml"],
    );
    if (!manifestEntry) {
      throw new Error("La plantilla Android no contiene AndroidManifest.xml.");
    }
    const manifest = await zip.file(manifestEntry.original).async("string");
    zip.file(manifestEntry.original, addAndroidCameraPermission(manifest));
  }

  if (arEnabled && normalizedPlatform === "ios") {
    const infoPlistEntry = findFilePath(paths, "ios/App/App/Info.plist", [
      "/app/app/info.plist",
      "/info.plist",
    ]);
    if (!infoPlistEntry) {
      throw new Error("La plantilla iOS no contiene Info.plist.");
    }
    const infoPlist = await zip.file(infoPlistEntry.original).async("string");
    zip.file(infoPlistEntry.original, addIOSCameraPermission(infoPlist));
  }

  return zip;
}

export async function buildNativeTemplatePackage({
  templateUrl,
  platform,
  htmlContent,
  configFileName,
  config,
  arEnabled = false,
  replaceIndex = true,
  publicFiles = {},
  nativeMetadata,
  onStatus,
}) {
  onStatus?.(`Descargando plantilla ${String(platform).toUpperCase()}...`);
  const templateData = await fetchNativeTemplateData(templateUrl, platform);

  onStatus?.(`Configurando proyecto ${String(platform).toUpperCase()}...`);
  const zip = await injectNativeTemplate({
    templateData,
    platform,
    htmlContent,
    configFileName,
    config,
    arEnabled,
    replaceIndex,
    publicFiles,
    nativeMetadata,
  });
  return zip.generateAsync({ type: "blob" });
}
