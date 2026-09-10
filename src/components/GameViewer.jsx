import { useState, useEffect } from 'react';
import { games } from '../data/gameComponents';
import CalculadoraMental from '../games/CalculoMental/CalculadoraMental';
import BioFlor from '../games/BioFlor/BioFlor';
import Laberinto from '../games/Laberinto/Laberinto';
import Robot from '../games/Robot/Robot';
import DesarrolloAlgoritmos from '../games/DesarrolloAlgoritmos/Algoritmos';

const GameViewer = ({ gameId, withRA = false }) => {
  const [gameComponent, setGameComponent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGame = async () => {
      try {
        if (gameId === 'CalculoMental') {
          setGameComponent(<CalculadoraMental withRA={withRA} />);
        } else if (gameId === 'BioFlor') {
          setGameComponent(<BioFlor />);
        } else if (gameId === 'Laberinto') {
          setGameComponent(<Laberinto withRA={withRA} />);
        } else if (gameId === 'Robot') {
          setGameComponent(<Robot withRA={withRA} />);
        } else if (gameId === 'desarrollo-algoritmos') {
          setGameComponent(<DesarrolloAlgoritmos withRA={withRA} />);
        } else if (games[gameId]) {
          setGameComponent(games[gameId]);
        } else {
          console.error(`Game component not found for: ${gameId}`);
        }
      } catch (error) {
        console.error('Error loading game component:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGame();
  }, [gameId, withRA]);

  if (loading) {
    return (
      <div className="game-loading">
        <p>Cargando juego...</p>
      </div>
    );
  }

  if (!gameComponent) {
    return (
      <div className="game-error">
        <p>No se pudo cargar el juego. Inténtalo de nuevo más tarde.</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      {gameComponent}
    </div>
  );
};

export default GameViewer;
