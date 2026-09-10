import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { steamAreas } from '../data/steamData';
import { IoArrowBackSharp } from "react-icons/io5";
import { GrLinkNext } from "react-icons/gr";
import { Player } from '@lottiefiles/react-lottie-player';


import '../styles/theme.css';
import '../styles/screens.css';

const SteamAreas = () => {
  const [selectedAreas, setSelectedAreas] = useState([]);
  const navigate = useNavigate();

  // Efecto para hacer scroll al inicio de la página al cargar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleArea = (areaId) => {
    setSelectedAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  return (
    <div className="screen-container">
      <div className="selection-container">
        <h2 className="selection-title">Selecciona tus áreas STEAM</h2>
        <p className="selection-instruction">
          Puedes seleccionar una o varias áreas de interés
        </p>
        
        <div className="areas-grid">
          {Object.entries(steamAreas).map(([id, area]) => (
            <div
              key={id}
              className={`area-card ${selectedAreas.includes(id) ? 'selected' : ''}`}
              onClick={() => toggleArea(id)}
            >
              <div className="area-icon-container">
                <Player
                  src={area.icon} 
                  className="player"
                  alt={`Icono ${area.name}`}
                  
                  loop
                  autoplay
                  style={{ height: '100px', width: '100px' }}
                />
                
              </div>
              <h3 className="area-name">{area.name}</h3>
              <p className="area-description">{area.description}</p>
            </div>
          ))}
        </div>
        
        <div className="action-buttons">
          <button
             className="no-rounded-button"
            onClick={() => navigate(-1)}
          ><IoArrowBackSharp />


            Anterior
          </button>
          <button
            className="no-rounded-button"
            disabled={selectedAreas.length === 0}
            onClick={() => navigate('/skills', { state: { selectedAreas } })}
            style={{ 
              opacity: selectedAreas.length === 0 ? 0.5 : 1, 
              cursor: selectedAreas.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.3s ease'
            }}
          >
            Ver Habilidades <GrLinkNext />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SteamAreas;