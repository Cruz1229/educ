import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- INICIO: Estilos CSS Integrados ---
// Copiamos los estilos del componente Summary y añadimos los nuevos
// para el panel de descarga.
const AppStyles = () => (
  <style>
    {`
      /* Estilos base (de Summary.jsx) */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #f0f2f5;
        margin: 0;
        padding: 0;
      }
      .screen-container {
        max-width: 1000px;
        margin: 2rem auto;
        padding: 1rem;
      }
      .selection-container {
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        padding: 1.5rem 2rem;
      }
      .summary-card {
        padding: 1rem;
        border-radius: 8px;
      }
      .selection-title {
        font-size: 1.75rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 1.5rem;
      }
      .summary-card h3 {
        font-size: 1.5rem;
        color: #2c5282;
        font-weight: 600;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
      }
      .summary-header h3 {
        font-size: 1.75rem;
        color: #333;
        font-weight: 700;
        border-bottom: none;
        margin-bottom: 1rem;
      }
      .summary-meta, .meta-item, .summary-platforms {
        margin-bottom: 1rem;
        line-height: 1.6;
        color: #555;
        font-size: 0.95rem;
      }
      .meta-item strong {
        color: #111;
        font-weight: 600;
      }
      .summary-section {
        margin-top: 1.5rem;
      }
      .summary-section h4 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2b6cb0;
        margin-bottom: 1rem;
      }
      .area-list {
        list-style: none;
        padding: 0;
      }
      .area-list li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        font-size: 1rem;
        color: #333;
      }
      .summary-area-icon {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }
      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: bold;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-block;
      }
      .btn-back {
        background-color: transparent;
        color: #4a5568;
        font-weight: 600;
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
      }
      .btn-back:hover {
        background-color: #f7fafc;
      }

      /* --- NUEVOS ESTILOS para DownloadGame.jsx --- */
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .download-panel {
        background: linear-gradient(135deg, #f5f7fa 0%, #e0e8f0 100%);
        border: 1px solid #d1dce5;
        border-radius: 12px;
        padding: 2rem;
        margin-top: 2rem;
        text-align: center;
        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      }
      .download-panel h4 {
        font-size: 1.75rem;
        font-weight: 600;
        color: #1a365d;
        margin-bottom: 0.5rem;
      }
      .download-panel p {
        font-size: 1.1rem;
        color: #4a5568;
        margin-bottom: 1.5rem;
      }
      .countdown-timer {
        font-size: 4rem;
        font-weight: 700;
        color: #2b6cb0;
        line-height: 1;
        margin-bottom: 1rem;
        animation: pulse 1s infinite;
      }
      .btn-download {
        background-color: #2b6cb0;
        color: white;
        font-size: 1.1rem;
        padding: 0.8rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(43,108,176,0.3);
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
      }
      .btn-download:hover {
        background-color: #2c5282;
      }
      .btn-download:disabled {
        background-color: #a0aec0;
        color: #e2e8f0;
        cursor: not-allowed;
        box-shadow: none;
      }
      .spinner {
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    `}
  </style>
);
// --- FIN: Estilos CSS Integrados ---

// --- Iconos SVG ---
const SpinnerIcon = () => <div className="spinner"></div>;

const DownloadIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const BackIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ verticalAlign: 'middle', marginRight: '0.25rem' }}
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);
// --- Fin Iconos SVG ---


// --- Funciones Helper (copiadas de Summary.jsx) ---
const getAreaName = (areaId) => {
  const areas = {
    science: 'Ciencia',
    technology: 'Tecnología',
    engineering: 'Ingeniería',
    arts: 'Arte',
    math: 'Matemáticas'
  };
  return areas[areaId] || areaId;
};

const getAreaIcon = (areaId) => {
  const icons = {
    science: 'https://placehold.co/64x64/3498db/ffffff?text=C',
    technology: 'https://placehold.co/64x64/2ecc71/ffffff?text=T',
    engineering: 'https://placehold.co/64x64/e67e22/ffffff?text=I',
    arts: 'https://placehold.co/64x64/9b59b6/ffffff?text=A',
    math: 'https://placehold.co/64x64/f1c40f/ffffff?text=M'
  };
  return icons[areaId] || 'https://placehold.co/64x64/cccccc/ffffff?text=?';
};

const formatDate = (dateString) => {
  if (!dateString) return 'No especificada';
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
};
// --- Fin Funciones Helper ---


const DownloadGame = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Obtenemos los datos del estado de la navegación
  const { 
    selectedAreas = [], 
    selectedSkills = [], 
    gameDetails = {}, 
    selectedPlatforms = [] 
  } = state || {};

  // Estados para la cuenta regresiva y la descarga
  const [countdown, setCountdown] = useState(10);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Efecto para la cuenta regresiva
  useEffect(() => {
    // Si la cuenta llega a 0, habilitamos el botón y detenemos el intervalo
    if (countdown <= 0) {
      setIsButtonDisabled(false);
      return;
    }

    // Creamos un intervalo que se ejecuta cada segundo
    const timerId = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    // Limpiamos el intervalo cuando el componente se desmonte o la cuenta cambie
    return () => clearInterval(timerId);
  }, [countdown]); // Este efecto se ejecuta cada vez que 'countdown' cambia

  // Función para simular la descarga
  const handleDownload = () => {
    setIsDownloading(true);

    // Creamos un contenido simulado para el archivo ZIP
    const gameData = JSON.stringify(state, null, 2);
    const zipContent = `Este es un archivo ZIP simulado para '${gameDetails.gameName}'.\n\nDatos de configuración:\n${gameData}`;
    
    // Creamos un Blob (archivo en memoria)
    const blob = new Blob([zipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Creamos un enlace (<a>) invisible
    const a = document.createElement('a');
    a.href = url;
    a.download = `${gameDetails.gameName || 'juego'}.zip`; // Nombre del archivo
    
    // Simulamos un retraso de 2 segundos para la "descarga"
    setTimeout(() => {
      document.body.appendChild(a); // Añadimos el enlace al DOM
      a.click(); // Simulamkos un clic
      
      // Limpiamos
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsDownloading(false);
    }, 2000);
  };

  return (
    <div className="screen-container">
      <AppStyles />
      
      <button onClick={() => navigate(-1)} className="btn btn-back">
        <BackIcon />
        Volver
      </button>

      <div className="selection-container">
        
        {/* --- INICIO DE LA CORRECCIÓN --- */}
        {/* El div 'summary-card' ha sido eliminado. El contenido ahora
            está directamente dentro de 'selection-container' */}

        {/* --- Sección de Resumen (traído de Summary) --- */}
        
        <h2 className="selection-title" style={{ marginBottom: '1rem' }}>
          {gameDetails.gameName || 'Nombre del Juego no disponible'}
        </h2>

        <div className="meta-item">
          <strong>Descripción: </strong>
          {gameDetails.description || 'Sin descripción.'}
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', borderTop: '1px solid #eee', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <div className="summary-section" style={{ flex: 1, minWidth: '250px', marginTop: 0 }}>
            <h4>Áreas Seleccionadas:</h4>
            <ul className="area-list">
              {selectedAreas && selectedAreas.length > 0 ? selectedAreas.map(areaId => (
                <li key={areaId}>
                  <img 
                    src={getAreaIcon(areaId)} 
                    alt={`Icono ${getAreaName(areaId)}`}
                    className="summary-area-icon"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/64x64/cccccc/ffffff?text=?'; }}
                  />
                  {getAreaName(areaId)}
                </li>
              )) : (
                <li>No se seleccionaron áreas.</li>
              )}
            </ul>
          </div>
          <div className="summary-section" style={{ flex: 1, minWidth: '250px', marginTop: 0 }}>
            <h4>Habilidades Seleccionadas:</h4>
            {selectedSkills && selectedSkills.length > 0 ? (
              <ul style={{ listStylePosition: 'inside', paddingLeft: '0.5rem' }}>
                {selectedSkills.map(skill => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p>No se seleccionaron habilidades.</p>
            )}
          </div>
        </div>
        
        {/* --- FIN DE LA CORRECCIÓN --- */}

        
        {/* --- Panel de Descarga --- */}
        <div className="download-panel">
          <h4>¡Tu juego está casi listo!</h4>
          
          {isButtonDisabled ? (
            <>
              <p>Habilitando descarga en...</p>
              <div className="countdown-timer">
                {countdown}
              </div>
            </>
          ) : (
            <p>¡Tu descarga está lista!</p>
          )}

          <button 
            className="btn btn-download"
            onClick={handleDownload}
            disabled={isButtonDisabled || isDownloading}
          >
            {isDownloading ? (
              <>
                <SpinnerIcon />
                Descargando...
              </>
            ) : (
              <>
                <DownloadIcon />
                Descargar Juego (.zip)
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DownloadGame;