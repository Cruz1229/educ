import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { MISSING_MOBILE_GAMES, buildMissingMobileConfig, getMobileTemplates, buildMissingMobileDownload } from './missingMobileGames';
import { injectNativeTemplate } from './nativeTemplatePackaging';

const readBlob = blob => new Promise((resolve, reject) => {
  const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsArrayBuffer(blob);
});
const nativeRoot = platform => platform === 'android' ? 'android/app/src/main/assets/public/' : 'ios/App/App/public/';
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

test('maps generator selections to native config without losing object IDs or figure order', () => {
  expect(buildMissingMobileConfig('magforce', { gameName: 'Imanes del aula', authorName: 'Docente' }, ['ios', 'android'], { objetos: [{ id: 'nail' }, { id: 'wood' }] })).toMatchObject({ nombreApp: 'Imanes del aula', autor: 'Docente', objetos: ['nail', 'wood'], plataformas: ['android', 'ios'] });
  expect(buildMissingMobileConfig('memoria', {}, ['ios'], { nivel: 'Avanzado', categoria: 'Tecnología', cantidadPalabras: '18' })).toMatchObject({ nivel: 'Avanzado', categoria: 'Tecnología', cantidadPalabras: 18 });
  expect(buildMissingMobileConfig('tangram', {}, [], { figuras: ['Barco', 'Casa', 'Vela'] }).figuras).toEqual(['Barco', 'Casa', 'Vela']);
  expect(() => getMobileTemplates('unknown')).toThrow('desconocido');
});

describe.each(Object.keys(MISSING_MOBILE_GAMES))('%s native templates', slug => {
  test.each(['android', 'ios'])('%s contains buildable source and retains personalization after cap sync', async platform => {
    const bytes = fs.readFileSync(path.join(process.cwd(), 'public', getMobileTemplates(slug)[platform].url));
    const original = await JSZip.loadAsync(bytes);
    const fileName = `${slug}-config.json`;
    const config = { ...JSON.parse(await original.file(`public/config/${fileName}`).async('string')), nombreApp: 'Aula "STEAM" & más', autor: 'Docente', plataformas: [platform] };
    const appId = `io.${slug.replace(/-/g, '')}.steam.gtest`;
    const result = await injectNativeTemplate({ templateData: bytes, platform, configFileName: fileName, config, replaceIndex: false, nativeMetadata: { appId, appName: config.nombreApp } });
    for (const folder of [nativeRoot(platform), 'public/', 'dist/']) {
      expect(JSON.parse(await result.file(`${folder}config/${fileName}`).async('string'))).toEqual(config);
    }
    expect(JSON.parse(await result.file('src/game/default-config.json').async('string'))).toEqual(config);
    expect(await result.file('capacitor.config.ts').async('string')).toContain(JSON.stringify(appId));
    expect(await result.file('capacitor.config.ts').async('string')).toContain(JSON.stringify(config.nombreApp));
    expect(await result.file(`${nativeRoot(platform)}index.html`).async('string')).toBe(await original.file(`${nativeRoot(platform)}index.html`).async('string'));
    expect(result.file('package-lock.json')).not.toBeNull();
    expect(result.file('src/game/Game.tsx')).not.toBeNull();
    expect(result.file('scripts/package-native.mjs')).not.toBeNull();
    expect(Object.keys(result.files).some(p => /(^|\/)node_modules\//.test(p) || /local\.properties$/.test(p) || /\.jks$/.test(p))).toBe(false);
    const pkg = JSON.parse(await result.file('package.json').async('string'));
    expect(pkg.dependencies['@capacitor/ios']).toBe('8.0.2');
    expect(pkg.dependencies['@capacitor/android']).toBe('8.0.2');
    if (platform === 'android') expect(await result.file('android/app/build.gradle').async('string')).toContain(appId);
    else {
      expect(await result.file('ios/App/App.xcodeproj/project.pbxproj').async('string')).toContain(appId);
      const swift = await result.file('ios/App/CapApp-SPM/Package.swift').async('string');
      expect(swift).toContain('../../../node_modules/@capacitor/app');
      expect(swift).not.toMatch(/path:\s*"[^"\n]*\\/);
    }
  }, 30000);
});

test.each([['web'], ['android'], ['ios'], ['web','android'], ['web','ios'], ['android','ios'], ['web','android','ios']])('includes exactly the platforms requested: %j', async (...platforms) => {
  // jest.each spreads each row, so the final argument can be its optional done callback.
  platforms = platforms.filter(p => typeof p === 'string');
  global.fetch = jest.fn(async url => ({ ok: true, arrayBuffer: async () => fs.readFileSync(path.join(process.cwd(), 'public', url)) }));
  const result = await buildMissingMobileDownload({ slug: 'torres-hanoi', details: { gameName: 'Hanoi escolar' }, platforms, options: { nivel: 'Avanzado' }, htmlContent: '<html>Hanoi Web</html>' });
  const archive = await JSZip.loadAsync(await readBlob(result.blob));
  expect(Boolean(archive.file('Torres de Hanoi/index.html'))).toBe(platforms.includes('web'));
  for (const platform of ['android', 'ios']) expect(Boolean(archive.file(`Torres de Hanoi/hanoi_escolar_${platform}.zip`))).toBe(platforms.includes(platform));
}, 30000);

test('reports missing templates instead of returning a web-only zip', async () => {
  global.fetch = jest.fn(async () => ({ ok: false, status: 404 }));
  await expect(buildMissingMobileDownload({ slug: 'stroop', details: {}, platforms: ['ios'], options: { nivel: 'Básico' }, htmlContent: '<html/>' })).rejects.toThrow('Plantilla iOS no disponible');
});

test('preserves extra Capacitor settings when personalizing a source project', async () => {
  const zip = new JSZip();
  zip.file('android/app/src/main/assets/public/index.html', 'native');
  zip.file('capacitor.config.ts', "export default { appId: 'io.old', appName: 'Old', webDir: 'dist', plugins: { Keyboard: { resize: 'body' } } };");
  const result = await injectNativeTemplate({ templateData: await zip.generateAsync({ type: 'uint8array' }), platform: 'android', configFileName: 'test.json', config: {}, replaceIndex: false, nativeMetadata: { appId: 'io.new', appName: 'Aula $&' } });
  const source = await result.file('capacitor.config.ts').async('string');
  expect(source).toContain('appId: "io.new"'); expect(source).toContain('appName: "Aula $&"'); expect(source).toContain("resize: 'body'");
});
