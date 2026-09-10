import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tipoContenido } from '../data/steamData';
import { IoArrowBackSharp } from "react-icons/io5";
import { GrLinkNext } from "react-icons/gr";
import { Player } from '@lottiefiles/react-lottie-player';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import '../styles/theme.css';
import '../styles/screens.css';

const TipoContenido = () => {
  const [selectedContenido, setSelectedContenido] = useState([]);
  const navigate = useNavigate();

  const toggleContenido = (ContenidoId) => {
    setSelectedContenido(prev =>
      prev.includes(ContenidoId)
        ? prev.filter(id => id !== ContenidoId)
        : [...prev, ContenidoId]
    );
  };

  return (
    <div className="screen-container">
      <div className="selection-container">
        <h2 className="selection-title">Selecciona el tipo de contenido para incluir en la Tecnología RA</h2>
        <p className="selection-instruction">
          Puedes seleccionar una o varios de tipo de contenido RA que desee
        </p>
        
        <div className="areas-grid">
          {Object.entries(tipoContenido).map(([id, contenido]) => (
            <div
              key={id}
              className={`area-card ${selectedContenido.includes(id) ? 'selected' : ''}`}
              onClick={() => toggleContenido(id)}
            >
              <div className="area-icon-container">
                <Player
                  src={contenido.icon} 
                  className="player"
                  alt={`Icono ${contenido.name}`}
                  
                  loop
                  autoplay
                  style={{ height: '100px', width: '100px' }}
                />
                
              </div>
              <h3 className="area-name">{contenido.name}</h3>
              <p className="area-description">{contenido.description}</p>
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
            disabled={selectedContenido.length === 0}
            onClick={() => navigate('/Ra', { state: { selectedContenido } })}
          >
            Siguiente <GrLinkNext />



          </button>
        </div>
      </div>
    </div>
  );
};

export default TipoContenido;