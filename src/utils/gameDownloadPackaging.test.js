import JSZip from 'jszip';
import {
  buildGamePackageNotice,
  createGameDownloadArchive,
  normalizeGamePlatforms,
} from './gameDownloadPackaging';

function readBlobAsArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

async function buildTemplate(platform) {
  const zip = new JSZip();
  if (platform === 'android') {
    zip.file('android/app/src/main/assets/public/index.html', 'React Android');
    zip.file('android/app/src/main/assets/capacitor.config.json', '{"appId":"old","appName":"Old"}');
    zip.file('android/app/build.gradle', 'namespace "old"\napplicationId "old"');
    zip.file('android/app/src/main/res/values/strings.xml', '<resources><string name="app_name">Old</string><string name="title_activity_main">Old</string><string name="package_name">old</string><string name="custom_url_scheme">old</string></resources>');
  } else {
    zip.file('ios/App/App/public/index.html', 'React iOS');
    zip.file('ios/App/App/capacitor.config.json', '{"appId":"old","appName":"Old"}');
    zip.file('ios/App/App/Info.plist', '<plist><dict><key>CFBundleDisplayName</key><string>Old</string></dict></plist>');
    zip.file('ios/App/App.xcodeproj/project.pbxproj', 'PRODUCT_BUNDLE_IDENTIFIER = old;');
  }
  return zip.generateAsync({ type: 'uint8array' });
}

describe('gameDownloadPackaging', () => {
  test('normaliza plataformas y explica el contenido del paquete', () => {
    expect(normalizeGamePlatforms(['IOS', 'web', 'android', 'web'])).toEqual(['web', 'android', 'ios']);
    expect(buildGamePackageNotice(['android', 'ios'])).toBe('Se generará un ZIP con el proyecto Android y el proyecto iOS incluidos.');
  });

  test('genera Web y proyectos React nativos configurados dentro del mismo ZIP', async () => {
    const androidTemplate = await buildTemplate('android');
    const iosTemplate = await buildTemplate('ios');
    const originalFetch = global.fetch;
    global.fetch = jest.fn(async (url) => ({
      ok: true,
      status: 200,
      arrayBuffer: async () => (url.includes('android') ? androidTemplate : iosTemplate).buffer,
    }));

    try {
      const blob = await createGameDownloadArchive({
        folderName: 'Cromix',
        baseFileName: 'cromix',
        htmlContent: '<html>Cromix Web</html>',
        configFileName: 'cromix-config.json',
        config: { nombreApp: 'Cromix escolar' },
        selectedPlatforms: ['ios', 'web', 'android'],
        nativeTemplates: {
          android: { url: '/templates/cromix_android.zip', replaceIndex: false },
          ios: { url: '/templates/cromix_ios.zip', replaceIndex: false },
        },
        nativeMetadata: { appId: 'io.cromix.test', appName: 'Cromix escolar' },
      });
      const archive = await JSZip.loadAsync(await readBlobAsArrayBuffer(blob));

      await expect(archive.file('Cromix/index.html').async('string')).resolves.toContain('Cromix Web');
      await expect(archive.file('Cromix/cromix-config.json').async('string')).resolves.toContain('Cromix escolar');

      const android = await JSZip.loadAsync(await archive.file('Cromix/cromix_android.zip').async('uint8array'));
      const ios = await JSZip.loadAsync(await archive.file('Cromix/cromix_ios.zip').async('uint8array'));
      await expect(android.file('android/app/src/main/assets/public/index.html').async('string')).resolves.toBe('React Android');
      await expect(android.file('android/app/src/main/assets/public/config/cromix-config.json').async('string')).resolves.toContain('Cromix escolar');
      await expect(android.file('android/app/build.gradle').async('string')).resolves.toContain('applicationId "io.cromix.test"');
      await expect(ios.file('ios/App/App/public/index.html').async('string')).resolves.toBe('React iOS');
      await expect(ios.file('ios/App/App.xcodeproj/project.pbxproj').async('string')).resolves.toContain('PRODUCT_BUNDLE_IDENTIFIER = io.cromix.test;');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
