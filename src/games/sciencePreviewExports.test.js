import { openGeneratedHtml } from './Shared/generatedHtmlTestUtils';
import { generateCromixCode, CROMIX_PREVIEW_STYLES } from './Cromix/Cromix';
import { generateBioFlorCode, BIOFLOR_PREVIEW_STYLES } from './BioFlor/BioFlor';
import { generateMagixCode } from './Magix/Magix';
import { MAGIX_PREVIEW_STYLES } from './Magix/Magix.styles';

const assertGameOnly = (document) => {
  expect(document.querySelector('nav, .nav-footer, .steam-header, .steam-footer')).toBeNull();
  const labels = [...document.querySelectorAll('button, a')].map(node => node.textContent.trim());
  expect(labels.some(label => /terminar configuración|^(siguiente|anterior)$/i.test(label))).toBe(false);
};

describe('HTML de ciencias y matemáticas con estilos de la vista previa', () => {
  test.each([
    ['Cromix', () => generateCromixCode('Básico'), CROMIX_PREVIEW_STYLES, '.cromix-container'],
    ['BioFlor', () => generateBioFlorCode({ timeLimit: 300 }, ['rosa'], 'Básico'), BIOFLOR_PREVIEW_STYLES, '.bioflor-container'],
    ['Magix', () => generateMagixCode({ nivel: 'basico' }), MAGIX_PREVIEW_STYLES, '.magix-card'],
  ])('%s incluye el estilo compartido y solamente los controles del juego', async (name, generate, styles, container) => {
    const html = generate();
    expect(html).toContain(styles);
    const page = await openGeneratedHtml(html);
    try {
      expect(page.document.querySelector(container)).not.toBeNull();
      assertGameOnly(page.document);
    } finally { page.close(); }
  });

  test.each(['Básico', 'Intermedio', 'Avanzado'])('Cromix conserva rueda, pregunta y selección en %s', async difficulty => {
    const page = await openGeneratedHtml(generateCromixCode(difficulty));
    try {
      const { window, document, advanceTime } = page;
      window.startGameSequence();
      advanceTime(5000);
      expect(document.getElementById('game-ui').style.display).toBe('flex');
      expect(document.querySelectorAll('.game-layout > div')).toHaveLength(2);
      expect(document.querySelector('.game-main-col .wheel-container svg').getAttribute('width')).toBe('450');
      expect(window.getComputedStyle(document.querySelector('.wheel-container')).maxWidth).toBe('450px');
      expect(window.getComputedStyle(document.querySelector('.game-layout')).gridTemplateColumns).toBe('1.2fr 0.8fr');
      expect(window.getComputedStyle(document.querySelector('.cromix-container')).maxWidth).toBe('1400px');
      expect(document.querySelectorAll('.color-slice')).toHaveLength(12);
      expect(document.getElementById('question-overlay').classList.contains('hidden')).toBe(false);
      expect(document.querySelector('#question-overlay .question-modal')).not.toBeNull();
      window.closeQuestionModal();
      window.handleColorClick('Rojo');
      expect(document.querySelector('.color-slice.selected')).not.toBeNull();
      expect(document.querySelector('.game-right-col .stats-block')).not.toBeNull();
      assertGameOnly(document);
    } finally { page.close(); }
  });

  test('BioFlor conserva el diagrama, la disección y la asociación de piezas', async () => {
    const page = await openGeneratedHtml(generateBioFlorCode({ timeLimit: 300 }, ['rosa'], 'Básico'));
    try {
      const { window, document, advanceTime } = page;
      window.startGameSequence();
      advanceTime(5000);
      expect(document.getElementById('game-ui').style.display).toBe('flex');
      expect(document.querySelectorAll('.game-layout > div')).toHaveLength(2);
      expect(document.querySelector('.game-main-col > .diagram-panel .flower-svg-container')).not.toBeNull();
      expect(window.getComputedStyle(document.querySelector('.flower-svg-container')).height).toBe('440px');
      expect(window.getComputedStyle(document.querySelector('.game-layout')).gridTemplateColumns).toBe('1fr 380px');
      expect(document.querySelectorAll('.slot-card')).toHaveLength(8);
      expect(document.querySelectorAll('.piece-card-thumb')).toHaveLength(8);
      window.toggleDissect();
      document.getElementById('piece-petalos').click();
      document.getElementById('slot-petalos').click();
      expect(document.querySelector('#slot-petalos .placed-piece-thumb')).not.toBeNull();
      expect(document.getElementById('piece-petalos')).toBeNull();
      assertGameOnly(document);
    } finally { page.close(); }
  });

  test.each([
    ['basico', [1, 5, 3, 4, 2, 6], 9, 15],
    ['avanzado', [4, 17, 9, 7, 14, 12], 30, 25],
  ])('Magix conserva selección, sumas, victoria y reinicio en %s', async (nivel, solution, target, points) => {
    const page = await openGeneratedHtml(generateMagixCode({ nivel }));
    try {
      const { window, document, advanceTime } = page;
      document.getElementById('play').click();
      advanceTime(3500);
      expect(window.getComputedStyle(document.querySelector('.magix-layout')).gridTemplateColumns).toBe('minmax(0, 1fr) 310px');
      expect(window.getComputedStyle(document.querySelector('.magix-triangle-wrap')).height).toBe('405px');
      expect(document.querySelector('.magix-progress-stats #time').textContent).toBe(nivel === 'basico' ? '01:00' : '00:25');
      solution.forEach((number, index) => {
        [...document.querySelectorAll('.magix-number')].find(button => button.textContent === String(number)).click();
        expect(document.querySelector('.magix-number.is-selected').getAttribute('aria-pressed')).toBe('true');
        document.querySelector('.magix-slot--' + index).click();
      });
      expect(document.querySelectorAll('.magix-slot.is-filled')).toHaveLength(6);
      expect(document.querySelectorAll('.magix-number')).toHaveLength(0);
      for (let index = 0; index < 3; index++) {
        expect(document.getElementById('total-' + index).textContent).toBe(String(target));
        expect(document.getElementById('side-' + index).textContent).toBe(target + ' / ' + target);
      }
      document.getElementById('check').click();
      expect(document.getElementById('score').textContent).toBe(String(points));
      expect(document.getElementById('result-card').classList.contains('magix-modal--success')).toBe(true);
      assertGameOnly(document);
      document.getElementById('again').click();
      expect(document.querySelectorAll('.magix-slot.is-empty')).toHaveLength(6);
      expect(document.querySelectorAll('.magix-number')).toHaveLength(6);
    } finally { page.close(); }
  });
});
