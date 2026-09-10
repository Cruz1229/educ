// src/appsData.js
const baseUrl = process.env.PUBLIC_URL || '';

export const apps = [
  {
    name: "Acertijo",
    path: `${baseUrl}/apps/Acertijo/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/Acertijo/index.html`
  },
  {
    name: "Ahorcado", 
    path: `${baseUrl}/apps/Ahorcado/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/Ahorcado/index.html`
  },
  {
    name: "Blockly", 
    path: `${baseUrl}/apps/Blockly/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/Blockly/index.html`
  },
  {
    name: "CalculoMental", 
    path: `${baseUrl}/apps/CalculoMental/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/CalculoMental/index.html`
  },
  {
    name: "Crucigrama", 
    path: `${baseUrl}/apps/Crucigrama/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/Crucigrama/index.html`
  },
  {
    name: "Digramas de Flujo", 
    path: `${baseUrl}/apps/DiagramasFlujo/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/DiagramasFlujo/index.html`
  },
  {
    name: "Memorama", 
    path: `${baseUrl}/apps/Memorama/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/Memorama/index.html`
  },
  {
    name: "Ordena la Historia", 
    path: `${baseUrl}/apps/OdenadorIMG/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/OdenadorIMG/index.html`
  },
  {
    name: "PixelArt", 
    path: `${baseUrl}/apps/Pixelart/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/Pixelart/index.html`
  },
  {
    name: "Rompecabezas", 
    path: `${baseUrl}/apps/Rompecabezas/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/Rompecabezas/index.html`
  },
  {
    name: "Sudoku", 
    path: `${baseUrl}/apps/Sudoku/index.html`,
    testUrl: `${window.location.origin}${baseUrl}/apps/Sudoku/index.html`
  },
  // ... otras apps
];

// Función para verificar rutas
export const verifyAppPaths = async () => {
  const results = {};
  for (const app of apps) {
    try {
      const response = await fetch(app.testUrl, { method: 'HEAD' });
      results[app.name] = response.ok;
    } catch {
      results[app.name] = false;
    }
  }
  console.log('Verificación de rutas:', results);
  return results;
};