import { openGeneratedHtml } from '../Shared/generatedHtmlTestUtils';
import { steamGames } from '../../data/steamData';
import {
  generateMagixCode,
  MAGIX_NATIVE_TEMPLATE_URLS,
} from './Magix';

describe('Magix integration', () => {
  test('está registrado en Matemáticas con las habilidades solicitadas', () => {
    expect(steamGames.math.Magix).toMatchObject({
      id: 'Magix',
      name: 'Magix',
      icon: '/images/juegos/magix.svg',
    });
    expect(steamGames.math.Magix.skills).toContain('Razonamiento lógico-matemático');
    expect(steamGames.math.Magix.skills).toContain('Precisión y atención al detalle');
  });

  test('declara plantillas Android e iOS', () => {
    expect(MAGIX_NATIVE_TEMPLATE_URLS).toEqual({
      android: '/templates/magix_android.zip',
      ios: '/templates/magix_ios.zip',
    });
  });

  test('el HTML exportado conserva inicio, información y juego', async () => {
    const html = generateMagixCode({
      nombreApp: 'Magix escolar',
      nivel: 'basico',
      autor: 'EducSteam',
      version: '1.0.0',
      descripcion: 'Triángulo de prueba',
      plataformas: ['web'],
    });
    const page = await openGeneratedHtml(html);
    try {
      const { document, advanceTime } = page;
      expect(document.getElementById('start').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('game').classList.contains('hidden')).toBe(true);
      document.getElementById('show-info').click();
      expect(document.getElementById('info').classList.contains('hidden')).toBe(false);
      document.getElementById('close-info').click();
      document.getElementById('play').click();
      advanceTime(4000);
      expect(document.getElementById('game').classList.contains('hidden')).toBe(false);
      expect(document.querySelectorAll('.magix-slot')).toHaveLength(6);
      expect(document.getElementById('target').textContent).toBe('9');
    } finally {
      page.close();
    }
  });
});
