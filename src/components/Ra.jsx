import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bibliotecaRa} from '../data/steamData';
import { IoArrowBackSharp } from "react-icons/io5";
import { GrLinkNext } from "react-icons/gr";
import { Player } from '@lottiefiles/react-lottie-player';
import { Tooltip } from 'react-tooltip';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import '../styles/theme.css';
import '../styles/screens.css';

const Ra = () => {
  const [selectedBiblioteca, setSelectedBiblioteca] = useState([]);
  const navigate = useNavigate();

  const toggleBiblioteca = (BibliotecaId) => {
    setSelectedBiblioteca(prev =>
      prev.includes(BibliotecaId)
        ? prev.filter(id => id !== BibliotecaId)
        : [...prev, BibliotecaId]
    );
  };

  return (
    <div className="screen-container">
      <div className="selection-container">
        <h2 className="selection-title">Tecnologías de Realidad Aumentada</h2>
        <p className="selection-instruction">
          Puedes seleccionar la biblioteca de la tecnología de realidad aumentada que desee
        </p>
        
        <div className="areas-grid">
          {Object.entries(bibliotecaRa).map(([id, biblioteca]) => (
            <div
              key={id}
              className={`area-card ${selectedBiblioteca.includes(id) ? 'selected' : ''}`}
              onClick={() => toggleBiblioteca(id)}
            >
              

              <div className="area-icon-container">
                
                <Player
                  src={biblioteca.icon} 
                  className="player"
                  alt={`Icono ${biblioteca.name}`}
                  
                  loop
                  autoplay
                  style={{ height: '100px', width: '100px' }}
                />
                
              </div>
           
              <h3 className="area-name">{biblioteca.name}</h3>
              <p className="area-description">{biblioteca.description}</p>
                   <a
  data-tooltip-id="my-tooltip"
  data-tooltip-content="Hello world!"
  data-tooltip-place="top"
></a>
<Tooltip id="my-tooltip" />
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
            disabled={selectedBiblioteca.length === 0}
            onClick={() => navigate('/platform', { state: { selectedBiblioteca } })}
          >
            Siguiente <GrLinkNext />



          </button>
        </div>
      </div>
    </div>
  );
};

export default Ra;