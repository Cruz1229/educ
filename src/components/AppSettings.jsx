import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavigationButtons from './NavigationButtons';
import GameViewer from './GameViewer';
import '../styles/theme.css';
import '../styles/screens.css';
import Encriptacion from '../games/Encriptacion/Encriptacion';
import BloqCode from '../games/BloqCode/BloqCode';
import CalculadoraMental from '../games/CalculoMental/CalculadoraMental';

const AppSettings = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { selectedGame, selectedPlatforms, gameDetails, selectedAreas, selectedSkills } = state || {};
  const [activeTab, setActiveTab] = useState(0);
  const [platformConfigs, setPlatformConfigs] = useState({});
  const [isFinishButtonDisabled, setIsFinishButtonDisabled] = useState(true);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setIsFinishButtonDisabled(false);
    }, 9000);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  // En AppSettings.jsx, reemplaza la función handleFinishConfiguration
  // y agrega manejo de pasos RA:

  const withRA = state?.withRA === true;
  const searchParams = new URLSearchParams(window.location.search);
  const currentStep = searchParams.get('step'); // null | 'tipoContenido' | 'tecnologiaRA' | 'vistaPrevia'

  const handleNext = () => {
    if (!withRA) {
      // Flujo normal sin RA → ir al resumen
      navigate('/settings?view=Summary', {
        state: { selectedAreas, selectedSkills, selectedGame, selectedPlatforms, gameDetails, platformConfigs }
      });
      return;
    }

    // Flujo con RA: avanzar por los sub-pasos
    const nextStepMap = {
      null: '/settings?step=tipoContenido',
      'tipoContenido': '/settings?step=tecnologiaRA',
      'tecnologiaRA': '/settings?step=vistaPrevia',
      'vistaPrevia': '/settings?view=Summary',
    };

    const next = nextStepMap[currentStep] ?? '/settings?step=tipoContenido';
    navigate(next, {
      state: { selectedAreas, selectedSkills, selectedGame, selectedPlatforms, gameDetails, platformConfigs, withRA: true }
    });
  };

  if (!selectedGame || !gameDetails) {
    return (
      <div className="screen-container">
        <div className="selection-container" style={{ textAlign: 'center' }}>
          <h2 className="selection-title">Datos no disponibles</h2>
          <p className="selection-instruction">
            Por favor, completa el formulario anterior primero.
          </p>
          <button className="no-rounded-button" onClick={() => navigate(-1)} style={{ margin: 'auto' }}>
            Volver
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="tab-content">
      <div className="web-config web-config-game-preview">
        <div className="game-preview">
          {selectedGame.id === 'Encriptacion' ? (
            <Encriptacion withRA={state?.withRA ?? false} />
          ) : selectedGame.id === 'BloqCode' ? (
            <BloqCode withRA={state?.withRA ?? false} />
          ) : selectedGame.id === 'CalculoMental' ? (
            <CalculadoraMental withRA={state?.withRA ?? false} />
          ) : (
            <GameViewer
              gameId={selectedGame.id}
              withRA={state?.withRA ?? false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const MobileConfigForm = ({ platform, config, onChange }) => {
  const [fileName, setFileName] = useState(config.fileName || '');
  const [version, setVersion] = useState(config.version || '1.0.0');
  const [author, setAuthor] = useState(config.author || '');

  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    onChange(newConfig);

    if (field === 'fileName') setFileName(value);
    if (field === 'version') setVersion(value);
    if (field === 'author') setAuthor(value);
  };

  return (
    <div className="customization-form">
      <div className="form-group">
        <label>Nombre del archivo:</label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => handleChange('fileName', e.target.value)}
          className="form-input"
          placeholder="Ingresa el nombre del archivo"
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
          placeholder="Tu nombre o organización"
        />
      </div>
    </div>
  );
};

export default AppSettings;
