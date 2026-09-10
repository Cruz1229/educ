import { BIOFLOR_NATIVE_TEMPLATE_URLS } from './BioFlor/BioFlor';
import { CROMIX_NATIVE_TEMPLATE_URLS, generateCromixCode } from './Cromix/Cromix';

describe('BioFlor and Cromix native integration', () => {
  test('BioFlor ofrece plantillas Android e iOS', () => {
    expect(BIOFLOR_NATIVE_TEMPLATE_URLS).toEqual({
      android: '/templates/bioflor_android.zip',
      ios: '/templates/bioflor_ios.zip',
    });
  });

  test('Cromix ofrece plantillas Android e iOS y conserva exportación Web', () => {
    expect(CROMIX_NATIVE_TEMPLATE_URLS).toEqual({
      android: '/templates/cromix_android.zip',
      ios: '/templates/cromix_ios.zip',
    });
    const html = generateCromixCode('Básico', { gameName: 'Cromix escolar' }, ['web']);
    expect(html).toContain('<title>Cromix escolar</title>');
    expect(html).toContain('Rueda cromática interactiva');
  });
});
