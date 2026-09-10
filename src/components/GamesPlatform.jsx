import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { steamAreas, steamGames } from '../data/steamData';
import '../styles/theme.css';
import '../styles/screens.css';

const GamesPlatform = () => {
  const { state } = useLocation();
  const [availableGames, setAvailableGames] = useState([]);

  useEffect(() => {
    // Obtenemos TODOS los juegos sin filtrar por habilidades
    const allGames = Object.entries(steamGames).flatMap(([areaId, games]) => 
      games.map(game => ({
        ...game,
        area: steamAreas[areaId].name,
        areaId // Añadimos el areaId para referencia
      }))
    );
    setAvailableGames(allGames);
  }, []);

  const handlePlatformSelect = (platform, gamePath) => {
    if (platform === 'web') {
      window.location.href = process.env.PUBLIC_URL + gamePath;
    } else {
      alert(`Generando versión para ${platform}`);
    }
  };

  return (
    <div className="screen-container">
      <div className="selection-container">
        <h2 className="selection-title">Juegos Disponibles</h2>
        
        {state?.selectedSkills?.length > 0 && (
          <p className="selection-instruction">
            Habilidades seleccionadas: {state.selectedSkills.join(', ')}
          </p>
        )}
        
        <div className="games-grid">
          {availableGames.map(game => (
            <div key={`${game.areaId}-${game.id}`} className="game-card">
              <h3 className="game-title">{game.name}</h3>
              <span className="game-area">{game.area}</span>
              
              <div className="platform-options">
                {['web', 'ios', 'android'].map(platform => (
                  <button
                    key={platform}
                    className="btn btn-outline"
                    onClick={() => handlePlatformSelect(platform, game.path)}
                  >
                    {platform === 'web' ? 'Web' : platform === 'ios' ? 'iOS' : 'Android'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamesPlatform;