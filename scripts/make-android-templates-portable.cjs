const fs = require('node:fs/promises');
const path = require('node:path');
const JSZip = require('jszip');

const root = path.resolve(__dirname, '..');
const dependencies = [
  ['android', 'capacitor', '8.0.2'],
  ['app', 'android', '8.0.0'],
  ['haptics', 'android', '8.0.0'],
  ['keyboard', 'android', '8.0.0'],
  ['status-bar', 'android', '8.0.0'],
];
const excluded = new Set(['build', '.gradle', '.idea', 'node_modules', 'local.properties', '.DS_Store']);

async function addTree(zip, source, destination) {
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    if (excluded.has(entry.name) || /\.(log|jks|keystore)$/.test(entry.name)) continue;
    const from = path.join(source, entry.name);
    const to = `${destination}/${entry.name}`;
    if (entry.isDirectory()) await addTree(zip, from, to);
    else if (entry.isFile()) zip.file(to, await fs.readFile(from), { unixPermissions: 0o100644 });
  }
}

function instructions(name) {
  return `# ${name}: proyecto Android

1. Extrae el ZIP de la descarga. Dentro de la carpeta del juego encontrarás otro ZIP terminado en _android.zip; extráelo también.
2. En Android Studio selecciona Open y abre la carpeta android que contiene settings.gradle y gradlew.bat.
3. Usa JDK 21 y Android SDK 36. Android Studio puede instalar el SDK desde SDK Manager. La primera sincronización necesita Internet para descargar Gradle y las bibliotecas de Google/Maven.
4. Espera a que termine la sincronización de Gradle, selecciona un teléfono o emulador con Android 7.0 (API 24) o posterior y pulsa Run.

## Compilar desde Windows

Desde esta carpeta android, con JAVA_HOME apuntando al JDK 21 y ANDROID_HOME al SDK:

    .\\gradlew.bat assembleDebug

La APK de prueba queda en app/build/outputs/apk/debug/app-debug.apk.
En macOS/Linux ejecuta chmod +x gradlew y ./gradlew assembleDebug.
Si Gradle no encuentra el SDK, configura sdk.dir en un archivo local.properties con la ruta del SDK de tu equipo (puedes usar barras /).

## Contenido y personalización

La carpeta vendor incluye los módulos Android de Capacitor y sus licencias. No necesitas npm, node_modules ni otras carpetas del equipo donde se creó la plantilla.
El juego web ya está compilado en app/src/main/assets/public. Su configuración está en app/src/main/assets/public/config/${name.toLowerCase()}-config.json; se conserva al compilar Android.
Este paquete contiene el proyecto Android y los recursos web compilados. Los fuentes React se mantienen en el proyecto móvil original. Para actualizar el juego, reemplaza los recursos de public con una nueva compilación y vuelve a compilar Android.
Las versiones de las dependencias incluidas están en vendor/versions.json. Estos módulos se usan directamente desde Gradle; no ejecutes cap sync sobre este paquete independiente.
`;
}

async function main() {
  if (!process.argv[2]) throw new Error('Uso: node scripts/make-android-templates-portable.cjs <carpeta-node_modules>');
  const modules = path.resolve(process.argv[2]);
  // Validate every input before replacing any template.
  for (const [name, directory, version] of dependencies) {
    const packageRoot = path.join(modules, '@capacitor', name);
    const pkg = JSON.parse(await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8'));
    if (pkg.version !== version) throw new Error(`@capacitor/${name}: se esperaba ${version}, se encontró ${pkg.version}`);
    await fs.access(path.join(packageRoot, directory, 'build.gradle'));
    await fs.access(path.join(packageRoot, 'LICENSE'));
  }
  for (const [slug, name] of [['cromix', 'Cromix'], ['magix', 'Magix'], ['bioflor', 'BioFlor']]) {
    const filename = path.join(root, 'public/templates', `${slug}_android.zip`);
    const zip = await JSZip.loadAsync(await fs.readFile(filename), { checkCRC32: true });
    const index = `android/app/src/main/assets/public/index.html`;
    if (!zip.file(index)) throw new Error(`Falta ${index} en ${filename}`);
    zip.remove('android/vendor');
    const settings = ['// Dependencias incluidas en el ZIP; rutas relativas a esta carpeta Android.'];
    for (const [dependency, directory] of dependencies) {
      const moduleName = `capacitor-${dependency}`;
      const packageRoot = path.join(modules, '@capacitor', dependency);
      await addTree(zip, path.join(packageRoot, directory), `android/vendor/${moduleName}`);
      zip.file(`android/vendor/${moduleName}/LICENSE`, await fs.readFile(path.join(packageRoot, 'LICENSE')));
      settings.push(`include ':${moduleName}'`, `project(':${moduleName}').projectDir = new File('./vendor/${moduleName}')`, '');
    }
    zip.file('android/capacitor.settings.gradle', settings.join('\n'));
    zip.file('android/vendor/versions.json', JSON.stringify(Object.fromEntries(dependencies.map(([dependency, , version]) => [`@capacitor/${dependency}`, version])), null, 2) + '\n');
    zip.file('android/README.md', instructions(name));
    zip.file('android/gradlew', await zip.file('android/gradlew').async('string'), { unixPermissions: 0o100755 });
    const output = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 }, platform: 'UNIX' });
    await JSZip.loadAsync(output, { checkCRC32: true });
    await fs.writeFile(filename, output);
    console.log(`${name}: plantilla Android autónoma (${output.length} bytes)`);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
