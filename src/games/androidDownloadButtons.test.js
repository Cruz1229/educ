import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cromix from './Cromix/Cromix';
import BioFlor from './BioFlor/BioFlor';
import Magix from './Magix/Magix';
import { createGameDownloadArchive, downloadGameArchive } from '../utils/gameDownloadPackaging';

jest.mock('../utils/gameDownloadPackaging', () => ({
  ...jest.requireActual('../utils/gameDownloadPackaging'),
  createGameDownloadArchive: jest.fn(),
  downloadGameArchive: jest.fn(),
}));

test.each([['Cromix', Cromix], ['BioFlor', BioFlor], ['Magix', Magix]])(
  '%s permite descargar Android sin una librería ZIP externa',
  async (name, Game) => {
    const scroll = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const previousZip = window.JSZip;
    delete window.JSZip;
    const blob = new Blob(['zip']);
    createGameDownloadArchive.mockResolvedValue(blob);
    try {
      const { container } = render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[{
          pathname: '/settings',
          state: { selectedPlatforms: ['android'], gameDetails: { gameName: name, authorName: 'Revisión' } },
        }]}><Game /></MemoryRouter>,
      );
      const select = screen.getByRole('combobox');
      const basicOption = [...select.options].find(option => option.textContent.startsWith('Básico'));
      fireEvent.change(select, { target: { value: basicOption.value } });
      if (name === 'BioFlor') {
        [...container.querySelectorAll('.flower-card')].slice(0, 3).forEach(card => fireEvent.click(card));
      }
      fireEvent.click(screen.getByRole('button', { name: /Siguiente|Comenzar vista previa/i }));
      fireEvent.click(screen.getByRole('button', { name: /Terminar configuración/i }));
      const button = screen.getByRole('button', { name: 'Generar (.zip)' });
      expect(button).toBeEnabled();
      expect(document.querySelector('script[src*="jszip"]')).toBeNull();
      fireEvent.click(button);
      await waitFor(() => expect(downloadGameArchive).toHaveBeenCalledWith(blob, `${name.toLowerCase()}_android.zip`));
      expect(createGameDownloadArchive).toHaveBeenCalledWith(expect.objectContaining({
        selectedPlatforms: ['android'],
        configFileName: `${name.toLowerCase()}-config.json`,
        nativeTemplates: expect.objectContaining({ android: { url: `/templates/${name.toLowerCase()}_android.zip`, replaceIndex: false } }),
      }));
    } finally {
      scroll.mockRestore();
      if (previousZip !== undefined) window.JSZip = previousZip;
      jest.clearAllMocks();
    }
  },
);
