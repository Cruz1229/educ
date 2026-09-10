import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import SteamAreas from './components/SteamAreas';
import SteamSkills from './components/SteamSkills';
import SteamActivities from './components/SteamActivities';
import Platform from './components/Platform';
import AppSettings from './components/AppSettings';
import Summary from './components/Summary';
import ProgressBar from './components/ProgressBar';
import TecnologiaRa from './components/TecnologiaRa';
import TipoContenido from './components/TipoContenido';
import Ingresar from './components/Ingresar';
import Ra from './components/Ra';
// AÑADIR este import junto a los demás:
import CalculadoraMental from './games/CalculoMental/CalculadoraMental';
import React from 'react';
import LoginPage, { Email, Password, Submit, Title, Logo, Reset } from '@react-login-page/page2';
import defaultBannerImage from '@react-login-page/page2/banner-image';
import LoginLogo from 'react-login-page/logo';
import './styles/theme.css';
import './styles/screens.css';
import './styles/progress.css';
import DownloadGame from './components/DownloadGame';

// Componente interno que usa useLocation
function AppContent() {
  const location = useLocation();
  
  // Ocultar Sidebar solo en la ruta de login "/"
  const showSidebar = location.pathname !== '/';

  return (
    <div style={{ display: 'flex' }}>
      {showSidebar && <Sidebar />}
      
      <div className="main-content" style={{ 
        marginLeft: showSidebar ? '280px' : '0',
        width: '100%'
      }}>
        <Routes>
          <Route path="/" element={<Ingresar />} />
          <Route path="/WelcomeScreen" element={<WelcomeScreen />} />
          
          <Route path="/areas" element={<>
            <ProgressBar />
            <SteamAreas />
          </>} />
          <Route path="/skills" element={<>
            <ProgressBar />
            <SteamSkills />
          </>} />
          <Route path="/activities" element={<>
            <ProgressBar />
            <SteamActivities />
          </>} />
          <Route path="/platform" element={<>
            <ProgressBar />
            <Platform />
          </>} />
          <Route path="/TecnologiaRa" element={<>
            <ProgressBar />
            <TecnologiaRa />
          </>} />
          <Route path="/TipoContenido" element={<>
            <ProgressBar />
            <TipoContenido />
          </>} />
          <Route path="/Ra" element={<>
            <ProgressBar />
            <Ra />
          </>} />
          <Route path="/settings" element={<>
            <ProgressBar />
            <AppSettings />
          </>} />
          <Route path="/summary" element={<>
            <ProgressBar />
            <Summary />
          </>} />
          {/* NUEVA RUTA */}
<Route path="/CalculoMental" element={<>
  <ProgressBar />
  <CalculadoraMental />
</>} />
          <Route path="/DownloadGame" element={<>
            <ProgressBar />
            <DownloadGame />
          </>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;