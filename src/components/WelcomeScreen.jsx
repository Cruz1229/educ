import { useNavigate } from 'react-router-dom';
import { GiVrHeadset } from "react-icons/gi";
import { FaReact } from "react-icons/fa";
import { Player } from '@lottiefiles/react-lottie-player';
import '../styles/theme.css';

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title"><GiVrHeadset /> Bienvenido a STEAM-G</h1>
          <p className="welcome-subtitle"><b>Plataforma de aprendizaje interactivo</b></p>
          <Player
  src='https://lottie.host/6bb89242-7ce3-430c-91e7-94bb4cc6e3fc/4Q9mPVVlG6.json'
  className="player"
  loop
  autoplay
  style={{ height: '250px', width: '250px' }}
/>
        </div>
        
        <div className="welcome-card">
          <p className="welcome-description">
            Este asistente le guiará en la creación de un nuevo proyecto de aprendizaje 
            basado en el enfoque STEAM (Ciencia, Tecnología, Ingeniería, Arte y Matemáticas).
          </p>
          
          <div className="welcome-features">
            <div className="feature-item">
              <span className="feature-icon"><Player
  src='https://lottie.host/114633ce-2ef2-4d43-971a-aafef1ec8216/n8X7eyKcfi.json'
  className="player"
  loop
  autoplay
  style={{ height: '100px', width: '100px' }}
/></span>
              <span>Descubre áreas de interés</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon"><Player
  src='https://lottie.host/fbf4710c-a54e-4a75-861c-3cdfb1d4c61d/DfAvcaCsAg.json'
  className="player"
  loop
  autoplay
  style={{ height: '100px', width: '100px' }}
/></span>
              <span>Desarrolla habilidades clave</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon"><Player
  src='https://lottie.host/5d452728-dcbb-4b86-be1e-ec0c6587583e/oBradWJYiw.json'
  className="player"
  loop
  autoplay
  style={{ height: '100px', width: '100px' }}
/></span>
              <span>Generación de aplicaciones educativas</span>
            </div>
          </div>
          
          <button 
            className="no-rounded-button"
            onClick={() => navigate('/areas')}
            
          >
           <FaReact /> Comenzar Experiencia
          </button>
        </div>
      </div>
      
      <footer className="welcome-footer">
        <p className="copyright">STEAM-G® 2024-2025. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default WelcomeScreen;