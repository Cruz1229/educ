import { useState, useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { steamAreas, steamGames, bibliotecaRa } from '../data/steamData';
import { IoArrowBackSharp, IoSettingsSharp, IoCloseSharp } from "react-icons/io5";
import { Tooltip } from 'react-tooltip';
import { GrLinkNext } from "react-icons/gr";
import { Player } from '@lottiefiles/react-lottie-player';

import '../styles/theme.css';
import '../styles/screens.css';
import '../styles/game-card-hover.css';

const SteamActivities = () => {
  const { state, pathname } = useLocation();
  const navigate = useNavigate();
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [show, setShow] = useState(false);
  const [showRAModal, setShowRAModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const GAMES_PER_PAGE = 9; // 3 columns × 3 rows

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleCloseRAModal = () => setShowRAModal(false);

  // Lista de juegos que soportan tecnología RA
  const gamesWithRA = ['CalculoMental', 'desarrollo-algoritmos', 'BloqCode', 'Encriptacion', 'Laberinto', 'Robot'];

  // Efecto para prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (showRAModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [showRAModal]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    const container = document.querySelector('.screen-container');
    if (container) {
      container.scrollTop = 0;
    }

    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      if (container) container.scrollTop = 0;
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const filterGames = () => {
      if (!state?.selectedSkills || !state?.selectedAreas) return;

      // Mapa para almacenar juegos únicos por ID
      const uniqueGamesMap = new Map();

      state.selectedAreas.forEach(areaId => {
        const areaGames = steamGames[areaId] || {};

        Object.entries(areaGames).forEach(([gameId, game]) => {
          // Verificar si el juego tiene al menos una habilidad seleccionada
          const hasSelectedSkill = game.skills.some(skill =>
            state.selectedSkills.includes(skill)
          );

          if (hasSelectedSkill) {
            // Si el juego ya existe en el mapa, agregamos el área adicional
            if (uniqueGamesMap.has(gameId)) {
              const existingGame = uniqueGamesMap.get(gameId);
              // Agregar área solo si no está ya en el array
              if (!existingGame.areas.includes(areaId)) {
                existingGame.areas.push(areaId);
                existingGame.areaNames.push(steamAreas[areaId].name);
              }
            } else {
              // Primera vez que vemos este juego, lo agregamos al mapa
              uniqueGamesMap.set(gameId, {
                ...game,
                id: gameId,
                areas: [areaId], // Array de áreas donde aparece
                areaNames: [steamAreas[areaId].name], // Nombres de las áreas
                primaryArea: steamAreas[areaId].name, // Primera área encontrada
                primaryAreaId: areaId
              });
            }
          }
        });
      });

      // Convertir el mapa a array
      const uniqueGamesArray = Array.from(uniqueGamesMap.values());

      setFilteredGames(uniqueGamesArray);
      setCurrentPage(1); // Reset to first page when games change
    };

    filterGames();
  }, [state]);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  // Pagination helpers
  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * GAMES_PER_PAGE,
    currentPage * GAMES_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedGame(null); // Reset selection on page change
    const container = document.querySelector('.screen-container');
    if (container) container.scrollTop = 0;
    window.scrollTo(0, 0);
  };

  // Smart page range: always show first, last, current ±1, and ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, currentPage]);
    if (currentPage > 1) pages.add(currentPage - 1);
    if (currentPage < totalPages) pages.add(currentPage + 1);
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleConfigureActivity = () => {
    if (selectedGame) {
      // Verificar si el juego seleccionado tiene tecnología RA
      if (gamesWithRA.includes(selectedGame.id)) {
        setShowRAModal(true);
      } else {
        // Si no tiene RA, ir directamente a platform
        navigate('/platform', {
          state: {
            ...state,
            selectedGame: selectedGame
          }
        });
      }
    }
  };

  const handleRAYes = () => {
    setShowRAModal(false);
    if (selectedGame?.id === 'CalculoMental' || selectedGame?.id === 'Encriptacion' ||
      selectedGame?.id === 'BloqCode' || selectedGame?.id === 'Laberinto' ||
      selectedGame?.id === 'Robot' || selectedGame?.id === 'desarrollo-algoritmos') {
      navigate('/platform', {
        state: {
          ...state,
          selectedGame: selectedGame,
          withRA: true
        }
      });
    } else {
      navigate('/TecnologiaRa', {
        state: {
          ...state,
          selectedGame: selectedGame
        }
      });
    }
  };

  const handleRANo = () => {
    setShowRAModal(false);
    navigate('/platform', {
      state: {
        ...state,
        selectedGame: selectedGame,
        withRA: false
      }
    });
  };

  const handleIntegrateRA = () => {
    if (selectedGame) {
      navigate('/TecnologiaRa', {
        state: {
          ...state,
          selectedGame: selectedGame
        }
      });
    }
  };

  return (
    <>
      <div className="screen-container">
        <div className="selection-container">
          <h2 className="selection-title">Actividades Disponibles</h2>

          {/* ── Banner de resumen de selección ── */}
          {(state?.selectedSkills?.length > 0 || state?.selectedAreas?.length > 0) && (
            <div style={{
              background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)',
              border: '1px solid #cce0f5',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 12px rgba(0,119,182,0.08)'
            }}>

              {/* Fila superior: título + contador de resultados */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'var(--blue)'
                  }}>
                    🎯 Tu selección
                  </span>
                </div>
                {filteredGames.length > 0 && (
                  <span style={{
                    background: 'var(--blue)',
                    color: '#fff',
                    borderRadius: '20px',
                    padding: '0.28rem 0.9rem',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    letterSpacing: '0.02em',
                    boxShadow: '0 2px 8px rgba(0,119,182,0.25)'
                  }}>
                    {filteredGames.length} {filteredGames.length === 1 ? 'actividad encontrada' : 'actividades encontradas'}
                  </span>
                )}
              </div>

              {/* Dos columnas: Áreas | Habilidades */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '0.75rem 1.5rem',
                alignItems: 'start'
              }}>

                {/* — Áreas — */}
                {state?.selectedAreas?.length > 0 && (
                  <>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      paddingTop: '0.3rem',
                      whiteSpace: 'nowrap'
                    }}>
                      Áreas
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {state.selectedAreas.map((areaId, i) => {
                        const areaColors = ['#0077b6', '#0096c7', '#00b4d8', '#023e8a', '#48cae4', '#90e0ef'];
                        const color = areaColors[i % areaColors.length];
                        const name = steamAreas[areaId]?.name || areaId;
                        return (
                          <span key={areaId} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: '#fff',
                            border: `1.5px solid ${color}`,
                            color: color,
                            borderRadius: '8px',
                            padding: '0.28rem 0.75rem',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                          }}>
                            <span style={{
                              width: '7px', height: '7px',
                              borderRadius: '50%',
                              background: color,
                              flexShrink: 0
                            }} />
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* — Habilidades — */}
                {state?.selectedSkills?.length > 0 && (
                  <>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      paddingTop: '0.3rem',
                      whiteSpace: 'nowrap'
                    }}>
                      Habilidades
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {state.selectedSkills.map(skill => (
                        <span key={skill} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: 'rgba(0,119,182,0.08)',
                          color: '#0077b6',
                          borderRadius: '20px',
                          padding: '0.3rem 0.85rem',
                          fontSize: '0.82rem',
                          fontWeight: '500',
                          border: '1px solid rgba(0,119,182,0.18)'
                        }}>
                          ✦ {skill}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {filteredGames.length > 0 ? (
            <>
              {/* Contador de resultados */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  padding: '0.5rem 0.25rem',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--medium-gray)' }}>
                    Mostrando <strong style={{ color: 'var(--blue)' }}>
                      {(currentPage - 1) * GAMES_PER_PAGE + 1}–{Math.min(currentPage * GAMES_PER_PAGE, filteredGames.length)}
                    </strong> de <strong style={{ color: 'var(--blue)' }}>{filteredGames.length}</strong> actividades
                  </span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--medium-gray)' }}>
                    Página <strong style={{ color: 'var(--blue)' }}>{currentPage}</strong> / {totalPages}
                  </span>
                </div>
              )}

              {/* Grid 3×3 */}
              <div className="games-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {paginatedGames.map(game => {
                  const isSelected = selectedGame?.id === game.id;

                  return (
                    <div
                      key={game.id}
                      className={`game-card ${isSelected ? 'selected-card' : ''}`}
                      onClick={() => handleGameSelect(game)}
                      style={{
                        border: isSelected ? '3px solid #4A90E2' : '3px solid transparent',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <h4 className="game-title">{game.name}</h4>
                      <div className="area-icon-container">
                        <img
                          src={game.icon}
                          alt={`Icono ${game.name}`}
                          style={{ height: '80px', width: '80px' }}
                        />
                        {game.icon2 && (
                          <Player
                            src={game.icon2}
                            className="player"
                            loop
                            autoplay
                            style={{ height: '90px', width: '90px' }}
                          />
                        )}
                      </div>

                      {/* Mostrar todas las áreas si el juego pertenece a múltiples */}
                      <span className="game-area">
                        {game.areaNames.length > 1
                          ? `${game.areaNames.join(' / ')}`
                          : game.primaryArea
                        }
                        {game.tecno && ` - ${game.tecno}`}
                      </span>

                      <div className="game-skills">
                        <p>Desarrolla:</p>
                        <ul>
                          {game.skills.slice(0, 3).map((s, idx) => (
                            <li key={`${game.id}-skill-${idx}`}>{s}</li>
                          ))}
                          {game.skills.length > 3 && <li>+{game.skills.length - 3} más</li>}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación inteligente — solo visible cuando hay más de 9 juegos */}
              {totalPages > 1 && (
                <nav
                  aria-label="Paginación de actividades"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    marginTop: '1.8rem',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* Anterior */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      border: '1.5px solid #d0dbe8',
                      background: currentPage === 1 ? '#f4f6f8' : 'var(--pure-white)',
                      color: currentPage === 1 ? '#b0bec5' : 'var(--blue)',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.18s ease',
                      boxShadow: currentPage === 1 ? 'none' : '0 2px 6px rgba(0,119,182,0.10)'
                    }}
                    onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.borderColor = 'var(--blue)'; } }}
                    onMouseLeave={e => { if (currentPage !== 1) { e.currentTarget.style.background = 'var(--pure-white)'; e.currentTarget.style.borderColor = '#d0dbe8'; } }}
                  >
                    ‹
                  </button>

                  {/* Páginas con ellipsis inteligente */}
                  {getPageNumbers().map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsisBefore = idx > 0 && page - prevPage > 1;
                    return (
                      <span key={page} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {showEllipsisBefore && (
                          <span style={{
                            width: '32px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#90a4ae',
                            fontSize: '1rem',
                            letterSpacing: '2px',
                            userSelect: 'none'
                          }}>…</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          aria-label={`Ir a página ${page}`}
                          aria-current={currentPage === page ? 'page' : undefined}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '8px',
                            border: currentPage === page ? 'none' : '1.5px solid #d0dbe8',
                            background: currentPage === page
                              ? 'linear-gradient(135deg, var(--blue) 0%, #0096c7 100%)'
                              : 'var(--pure-white)',
                            color: currentPage === page ? '#fff' : 'var(--dark-gray)',
                            fontWeight: currentPage === page ? '700' : '500',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            boxShadow: currentPage === page
                              ? '0 4px 12px rgba(0,119,182,0.30)'
                              : '0 2px 6px rgba(0,119,182,0.07)'
                          }}
                          onMouseEnter={e => { if (currentPage !== page) { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; } }}
                          onMouseLeave={e => { if (currentPage !== page) { e.currentTarget.style.background = 'var(--pure-white)'; e.currentTarget.style.borderColor = '#d0dbe8'; e.currentTarget.style.color = 'var(--dark-gray)'; } }}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}

                  {/* Siguiente */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      border: '1.5px solid #d0dbe8',
                      background: currentPage === totalPages ? '#f4f6f8' : 'var(--pure-white)',
                      color: currentPage === totalPages ? '#b0bec5' : 'var(--blue)',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.18s ease',
                      boxShadow: currentPage === totalPages ? 'none' : '0 2px 6px rgba(0,119,182,0.10)'
                    }}
                    onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.borderColor = 'var(--blue)'; } }}
                    onMouseLeave={e => { if (currentPage !== totalPages) { e.currentTarget.style.background = 'var(--pure-white)'; e.currentTarget.style.borderColor = '#d0dbe8'; } }}
                  >
                    ›
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="no-games-message">
              <p>No se encontraron actividades para las habilidades seleccionadas</p>
              <button
                className="btn btn-outline"
                onClick={() => navigate(-1)}
              >
                Volver a selección
              </button>
            </div>
          )}

          <div className="action-buttons" style={{ gap: '15px' }}>
            <button
              className="no-rounded-button"
              onClick={() => navigate(-1)}
            >
              <IoArrowBackSharp /> Anterior
            </button>

            <button
              className="no-rounded-button"
              onClick={handleConfigureActivity}
              disabled={!selectedGame}
              style={{
                opacity: !selectedGame ? 0.5 : 1,
                cursor: !selectedGame ? 'not-allowed' : 'pointer',
                color: 'white'
              }}
            >
              Seleccionar Plataforma <GrLinkNext />
            </button>
          </div>
        </div>
      </div>

      {/* Modal personalizado usando Portal */}
      {showRAModal && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={handleCloseRAModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                Tecnología de Realidad Aumentada
              </h3>
              <button
                onClick={handleCloseRAModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666'
                }}
              >
                <IoCloseSharp />
              </button>
            </div>

            {/* Body */}
            {/* Body */}
            <div style={{ padding: '16px 24px 24px', textAlign: 'center' }}>
              <Player
                src="/images/juegos/VRAR.json"
                className="player"
                loop
                autoplay
                style={{
                  maxWidth: '160px',
                  height: '160px',
                  margin: '0 auto 8px'
                }}
              />
              <p style={{
                fontSize: '18px',
                marginTop: '4px',
                marginBottom: '8px',
                color: '#333'
              }}>
                ¿Deseas integrar <strong>Tecnología de Realidad Aumentada</strong> en esta actividad?
              </p>
              <p style={{
                fontSize: '15px',
                color: '#0077b6',
                marginTop: '6px',
                marginBottom: '0',
                lineHeight: '1.6',
                fontWeight: '500',
                background: '#e0f2fe',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'inline-block'
              }}>
                ✨ Transforma tu actividad con <strong>efectos 3D interactivos</strong> — agrega texto, imágenes, audio y video con experiencias inmersivas que potencian el aprendizaje.
              </p>
              {/* Cards de bibliotecas RA con tooltip */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                justifyContent: 'center',
                marginTop: '20px'
              }}>
                {Object.entries(bibliotecaRa).map(([id, biblioteca]) => (
                  <div
                    key={id}
                    data-tooltip-id={`tooltip-ra-${id}`}
                    data-tooltip-content={biblioteca.description}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      minWidth: '110px',
                      cursor: 'default',
                      transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,119,182,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <Player
                      src={biblioteca.icon}
                      loop
                      autoplay
                      style={{ height: '60px', width: '60px' }}
                    />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {biblioteca.name}
                    </span>
                    <Tooltip
                      id={`tooltip-ra-${id}`}
                      place="top"
                      style={{
                        maxWidth: '220px',
                        fontSize: '12px',
                        lineHeight: '1.5',
                        backgroundColor: '#1f2937',
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        zIndex: 999999
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <button
                onClick={handleRANo}
                style={{
                  padding: '12px 24px',
                  minWidth: '180px',
                  backgroundColor: '#5a6268',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#5a6268'}
              >
                No, continuar sin RA
              </button>
              <button
                onClick={handleRAYes}
                style={{
                  padding: '12px 24px',
                  minWidth: '180px',
                  backgroundColor: '#0077b6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0077b6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#0077b6'}
              >
                Sí, integrar RA
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SteamActivities;
