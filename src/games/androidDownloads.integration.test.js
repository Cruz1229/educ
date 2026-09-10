import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { createGameDownloadArchive } from '../utils/gameDownloadPackaging';
import { CROMIX_NATIVE_TEMPLATE_URLS } from './Cromix/Cromix';
import { MAGIX_NATIVE_TEMPLATE_URLS } from './Magix/Magix';
import { BIOFLOR_NATIVE_TEMPLATE_URLS } from './BioFlor/BioFlor';

const games = [
  ['Cromix', 'cromix', CROMIX_NATIVE_TEMPLATE_URLS],
  ['Magix', 'magix', MAGIX_NATIVE_TEMPLATE_URLS],
  ['BioFlor', 'bioflor', BIOFLOR_NATIVE_TEMPLATE_URLS],
];

const readBlob = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsArrayBuffer(blob);
});

describe.each(games)('%s: descarga Android real', (name, slug, urls) => {
  test.each([['android'], ['web', 'android']].map(platforms => [platforms]))(
    'conserva configuración, recursos y dependencias con %j',
    async selectedPlatforms => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn(async url => {
        const bytes = fs.readFileSync(path.join(process.cwd(), 'public', url));
        return { ok: true, arrayBuffer: async () => Uint8Array.from(bytes).buffer };
      });
      try {
        const config = {
          nombreApp: `${name} revisión`, nivel: 'Intermedio', autor: 'Prueba Android',
          version: '2.1.0', fecha: '2026-09-09', descripcion: 'Configuración descargada',
          plataformas: selectedPlatforms, ...(slug === 'bioflor' ? { flores: ['rosa', 'lirio', 'dalia', 'tulipan'] } : {}),
        };
        const blob = await createGameDownloadArchive({
          folderName: name, baseFileName: slug, htmlContent: '<html>Web</html>',
          configFileName: `${slug}-config.json`, config, selectedPlatforms,
          nativeTemplates: { android: { url: urls.android, replaceIndex: false } },
          nativeMetadata: { appId: `io.educsteam.review.${slug}`, appName: config.nombreApp },
        });
        expect(global.fetch).toHaveBeenCalledWith(urls.android);
        const archive = await JSZip.loadAsync(await readBlob(blob), { checkCRC32: true });
        expect(Boolean(archive.file(`${name}/index.html`))).toBe(selectedPlatforms.includes('web'));
        const bytes = await archive.file(`${name}/${slug}_android.zip`).async('uint8array');
        const android = await JSZip.loadAsync(bytes, { checkCRC32: true });
        const read = file => {
          expect(android.file(file)).not.toBeNull();
          return android.file(file).async('string');
        };
        expect(JSON.parse(await read(`android/app/src/main/assets/public/config/${slug}-config.json`))).toEqual(config);
        expect(JSON.parse(await read('android/app/src/main/assets/capacitor.config.json'))).toMatchObject({
          appId: `io.educsteam.review.${slug}`, appName: config.nombreApp,
        });
        expect(await read('android/app/build.gradle')).toContain(`applicationId "io.educsteam.review.${slug}"`);
        expect(await read('android/app/src/main/res/values/strings.xml')).toContain(config.nombreApp);
        const settings = await read('android/capacitor.settings.gradle');
        const dependencies = [...settings.matchAll(/new File\(['"]([^'"]+)['"]\)/g)];
        expect(dependencies).toHaveLength(5);
        for (const [, relative] of dependencies) {
          const dependency = path.posix.normalize(`android/${relative}`);
          expect(dependency.startsWith('android/')).toBe(true);
          expect(android.file(`${dependency}/build.gradle`)).not.toBeNull();
          expect(Object.keys(android.files).some(file => file.startsWith(`${dependency}/src/main/`))).toBe(true);
        }
        const html = await read('android/app/src/main/assets/public/index.html');
        for (const [, asset] of html.matchAll(/(?:src|href)=["'](\/?assets\/[^"']+)["']/g)) {
          expect(android.file(`android/app/src/main/assets/public/${asset.replace(/^\//, '')}`)).not.toBeNull();
        }
        expect(android.file('android/gradle/wrapper/gradle-wrapper.jar')).not.toBeNull();
        expect(android.file('android/gradlew.bat')).not.toBeNull();
        expect(await read('android/README.md')).toContain('assembleDebug');
        expect(Object.keys(android.files).filter(file => /(?:^|\/)(?:local.properties|\.gradle|\.idea|node_modules)(?:\/|$)/.test(file))).toEqual([]);

        // Optional audit artifacts use the exact archive produced by the downloader.
        if (process.env.ANDROID_REVIEW_OUTPUT && selectedPlatforms.length === 1) {
          const output = path.resolve(process.env.ANDROID_REVIEW_OUTPUT);
          fs.mkdirSync(output, { recursive: true });
          fs.writeFileSync(path.join(output, `${slug}_android.zip`), bytes);
          fs.writeFileSync(path.join(output, `${slug}_download.zip`), new Uint8Array(await readBlob(blob)));
        }
      } finally {
        global.fetch = originalFetch;
      }
    }, 30000,
  );
});
