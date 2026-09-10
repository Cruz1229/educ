import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavigationButtons from './NavigationButtons';
import GameViewer from './GameViewer';
import '../styles/theme.css';
import '../styles/screens.css';


const handleFinishConfiguration = () => {
    navigate('/summary', {
      state: {
        selectedAreas,
        selectedSkills,
        selectedGame,
        selectedPlatforms,
        platformConfigs
      }
    });
  };

  const updatePlatformConfig = (platform, config) => {
    setPlatformConfigs(prev => ({
      ...prev,
      [platform]: config
    }));
  };

  if (!selectedGame || !selectedPlatforms || selectedPlatforms.length === 0) {
    return (
      <div className="screen-container">
        <div className="selection-container">
          <h2 className="selection-title">Configuración no disponible</h2>
          <p className="selection-instruction">
            Completa la selección de plataforma primero
          </p>
          <NavigationButtons 
            onBack={() => navigate(-1)}
          />
        </div>
      </div>
    );
  }


const Formulario = ({platform, config, onChange }) => {
  const [fileName, setFileName] = useState(config.fileName || '');
  const [version, setVersion] = useState(config.version || '1.0.0');
  const [author, setAuthor] = useState(config.author || '');

  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    onChange(newConfig);
    
    // Actualizar estado local
    if (field === 'fileName') setFileName(value);
    if (field === 'version') setVersion(value);
    if (field === 'author') setAuthor(value);
  };

  return (
    <div className="customization-form">
      <div className="form-group">
        <label>Nombre del archivo o imagen:</label>
        <input 
          type="text" 
          value={fileName}
          onChange={(e) => handleChange('fileName', e.target.value)}
          className="form-input"
          placeholder="Ingresa el nombre del archivo o imagen para tu juego"
        />
      </div>
      <div className="form-group">
        <label>Versión:</label>
        <input 
          type="text" 
          value={version}
          onChange={(e) => handleChange('version', e.target.value)}
          className="form-input"
          placeholder="Ej: 1.0.0"
        />
      </div>
      <div className="form-group">
        <label>Autor:</label>
        <input 
          type="text" 
          value={author}
          onChange={(e) => handleChange('author', e.target.value)}
          className="form-input"
          placeholder="Tu nombre completo  o organización"
        />
      </div>
    </div>
  );
};
export default Formulario;