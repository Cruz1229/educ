import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tecnologiaRa } from '../data/steamData';
import { IoArrowBackSharp } from "react-icons/io5";
import { GrLinkNext } from "react-icons/gr";
import { Player } from '@lottiefiles/react-lottie-player';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import '../styles/theme.css';
import '../styles/screens.css';

const TecnologiaRa = () => {
  const [selectedTecnologia, setSelectedTecnologia] = useState([]);
  const navigate = useNavigate();

  const toggleTecnologia = (TecnologiaId) => {
    setSelectedTecnologia(prev =>
      prev.includes(TecnologiaId)
        ? prev.filter(id => id !== TecnologiaId)
        : [...prev, TecnologiaId]
    );
  };

  return (
    <div className="screen-container">
      <div className="selection-container">
        <h2 className="selection-title">Selecciona la sección donde quieres incluir Tecnología RA</h2>
        <p className="selection-instruction">
          Puedes seleccionar una o varias secciones
        </p>
        
        <div className="areas-grid">
          {Object.entries(tecnologiaRa).map(([id, tecnologia]) => (
            <div
              key={id}
              className={`area-card ${selectedTecnologia.includes(id) ? 'selected' : ''}`}
              onClick={() => toggleTecnologia(id)}
            >
              <div className="area-icon-container">
                <Player
                  src={tecnologia.icon} 
                  className="player"
                  alt={`Icono ${tecnologia.name}`}
                  
                  loop
                  autoplay
                  style={{ height: '100px', width: '100px' }}
                />
                
              </div>
              <h3 className="area-name">{tecnologia.name}</h3>
              <p className="area-description">{tecnologia.description}</p>
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
            disabled={selectedTecnologia.length === 0}
            onClick={() => navigate('/TipoContenido', { state: { selectedTecnologia } })}
          >
            Siguiente <GrLinkNext />



          </button>
        </div>
      </div>
    </div>
  );
};

export default TecnologiaRa;