import React, { useState, useEffect } from 'react'; // Importamos useState y useEffect
import Swal from 'sweetalert2'; // Asegúrate de tener instalado sweetalert2 o quita esta línea si usas CDN
import { useLocation, useNavigate } from 'react-router-dom';
// Importamos los iconos de lucide-react
import { 
  Tag, 
  FileText, 
  Layers, 
  Calendar, 
  Monitor, 
  Shapes, 
  Puzzle,
  ArrowLeft,
  Download,
  Home,
  Package, // Icono para el modal
  X, // Icono para cerrar el modal
  CheckCircle // Icono para descarga completa
} from 'lucide-react';

// Comentamos las importaciones de CSS que no podemos resolver



// Definimos los dibujos aquí para usarlos tanto en la lógica como en la generación del HTML
const hangmanDrawings = [
    `
    +---+
    |   |
        |
        |
        |
        |
  =========
  `,
    `
    +---+
    |   |
    O   |
        |
        |
        |
  =========
  `,
    `
    +---+
    |   |
    O   |
    |   |
        |
        |
  =========
  `,
    `
    +---+
    |   |
    O   |
   /|   |
        |
        |
  =========
  `,
    `
    +---+
    |   |
    O   |
   /|\\  |
        |
        |
  =========
  `,
    `
    +---+
    |   |
    O   |
   /|\\  |
   /    |
        |
  =========
  `,
    `
    +---+
    |   |
    O   |
   /|\\  |
   / \\  |
        |
  =========
  `
];

const generateGameCode = (config) => {
    // Convertimos los dibujos a un formato seguro para insertar en el HTML
    const drawingsJSON = JSON.stringify(hangmanDrawings);
    
    // Calculamos el límite de intentos aquí mismo
    const maxAttempts = hangmanDrawings.length - 1;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Juego del Ahorcado - ${config.category}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        :root {
            --primary: #3b82f6; --secondary: #1f2937; 
            --correct: #22c55e; --wrong: #ef4444;
            --bg: #f0f2f5; --surface: #ffffff;
        }
        body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: #111827; margin: 0; padding: 20px; display: flex; justify-content: center; min-height: 100vh; }
        .container { background: var(--surface); padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 100%; max-width: 900px; display: flex; flex-direction: column; }
        h1 { text-align: center; color: var(--secondary); margin-bottom: 0.5rem; }
        .header-info { text-align: center; color: #6b7280; margin-bottom: 2rem; }
        
        .game-grid { display: grid; grid-template-columns: 1fr 280px; gap: 2rem; }
        
        /* Left Column */
        .drawing-area { background: #f9fafb; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; text-align: center; margin-bottom: 1.5rem; }
        pre { font-family: monospace; font-weight: bold; font-size: 1.2rem; color: var(--secondary); margin: 0; line-height: 1.2; }
        
        .word-area { margin-bottom: 2rem; text-align: center; }
        .word-letters { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; }
        .letter-slot { width: 45px; height: 55px; border-bottom: 4px solid var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; text-transform: uppercase; }
        
        .keyboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(40px, 1fr)); gap: 0.5rem; }
        .key-btn { padding: 0.75rem 0; border: 1px solid #e5e7eb; border-radius: 0.375rem; background: white; font-weight: 600; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
        .key-btn:hover:not(:disabled) { background: var(--primary); color: white; border-color: var(--primary); transform: translateY(-2px); }
        .key-btn:disabled { cursor: not-allowed; opacity: 0.6; }
        .key-btn.correct { background: var(--correct); color: white; border-color: var(--correct); }
        .key-btn.wrong { background: var(--wrong); color: white; border-color: var(--wrong); }

        /* Right Column */
        .stats-card { background: #f8fafc; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; height: fit-content; }
        .stat-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 1rem; }
        .stat-val { font-weight: 700; color: var(--secondary); }
        
        .actions { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .btn { padding: 0.75rem; border: none; border-radius: 0.375rem; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: opacity 0.2s; }
        .btn-hint { background: var(--primary); color: white; }
        .btn-reset { background: var(--secondary); color: white; }
        .btn:disabled { background: #9ca3af; cursor: not-allowed; }
        .btn:hover:not(:disabled) { opacity: 0.9; }

        @media(max-width: 768px) { .game-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>Ahorcado: ${config.category.toUpperCase()}</h1>
        <div class="header-info" id="clue-text">Cargando pista...</div>
        
        <div class="game-grid">
            <div class="game-main">
                <div class="drawing-area" id="drawing-container"><pre></pre></div>
                <div class="word-area">
                    <div class="word-letters" id="word-display"></div>
                </div>
                <div class="keyboard" id="keyboard"></div>
            </div>
            
            <div class="game-sidebar">
                <div class="stats-card">
                    <h3 style="margin-top:0; color:var(--secondary); border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem;">Tablero</h3>
                    <div class="stat-row"><span>Palabra:</span> <span class="stat-val" id="word-counter">1/${config.words.length}</span></div>
                    <div class="stat-row"><span>Tiempo:</span> <span class="stat-val" id="timer">${config.timeLimit}s</span></div>
                    <div class="stat-row"><span>Puntos:</span> <span class="stat-val" id="score">0</span></div>
                    
                    <div class="actions">
                        <button class="btn btn-hint" id="btn-hint" onclick="useHint()">💡 Revelar Pista</button>
                        <button class="btn btn-reset" onclick="location.reload()">🔄 Reiniciar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        // Inyectamos los dibujos directamente desde la variable JSON
        const drawings = ${drawingsJSON};
        const maxWrong = ${maxAttempts};

        let state = {
            wordIndex: 0,
            score: 0,
            wrong: 0,
            guessed: [],
            timeLeft: config.timeLimit,
            hintUsed: false,
            timer: null,
            gameActive: true
        };

        function init() {
            if (state.wordIndex >= config.words.length) return finishGame();
            
            state.wrong = 0;
            state.guessed = [];
            state.timeLeft = config.timeLimit;
            state.hintUsed = false;
            state.gameActive = true;
            
            document.getElementById('btn-hint').disabled = false;
            document.getElementById('btn-hint').innerHTML = '💡 Revelar Pista';
            
            renderUI();
            renderKeyboard();
            startTimer();
        }

        function startTimer() {
            if (state.timer) clearInterval(state.timer);
            state.timer = setInterval(() => {
                state.timeLeft--;
                document.getElementById('timer').innerText = state.timeLeft + 's';
                if (state.timeLeft <= 0) handleGameOver(false, '¡Tiempo agotado!');
            }, 1000);
        }

        function renderUI() {
            const current = config.words[state.wordIndex];
            const wordUpper = current.word.toUpperCase();
            
            // Pista
            document.getElementById('clue-text').innerHTML = '<strong>Pista:</strong> ' + current.clue;
            
            // Stats
            document.getElementById('word-counter').innerText = (state.wordIndex + 1) + '/' + config.words.length;
            document.getElementById('score').innerText = state.score;
            document.getElementById('drawing-container').innerHTML = '<pre>' + drawings[state.wrong] + '</pre>';

            // Palabra
            const wordContainer = document.getElementById('word-display');
            wordContainer.innerHTML = '';
            wordUpper.split('').forEach(char => {
                const slot = document.createElement('div');
                slot.className = 'letter-slot';
                slot.innerText = state.guessed.includes(char.toLowerCase()) ? char : '';
                wordContainer.appendChild(slot);
            });
        }

        function renderKeyboard() {
            const kb = document.getElementById('keyboard');
            kb.innerHTML = '';
            'abcdefghijklmnopqrstuvwxyzñáéíóú'.split('').forEach(char => {
                const btn = document.createElement('button');
                btn.className = 'key-btn';
                btn.innerText = char;
                btn.dataset.letter = char;
                btn.onclick = () => guess(char);
                
                if (state.guessed.includes(char)) {
                    btn.disabled = true;
                    const currentWord = config.words[state.wordIndex].word.toLowerCase();
                    if (currentWord.includes(char)) btn.classList.add('correct');
                    else btn.classList.add('wrong');
                }
                kb.appendChild(btn);
            });
        }

        function guess(char) {
            if (!state.gameActive || state.guessed.includes(char)) return;
            
            state.guessed.push(char);
            const currentWord = config.words[state.wordIndex].word.toLowerCase();
            
            if (!currentWord.includes(char)) {
                state.wrong++;
            }
            
            renderUI();
            renderKeyboard();
            checkWinCondition();
        }

        function useHint() {
            if (state.hintUsed || !state.gameActive) return;
            
            const currentWord = config.words[state.wordIndex].word.toLowerCase();
            const available = currentWord.split('').filter(c => !state.guessed.includes(c));
            
            if (available.length > 1) {
                const randomChar = available[Math.floor(Math.random() * available.length)];
                state.hintUsed = true;
                state.wrong++; 
                
                document.getElementById('btn-hint').disabled = true;
                document.getElementById('btn-hint').innerText = 'Pista Usada';
                
                Swal.fire({
                    toast: true, position: 'top-end', icon: 'info', 
                    title: 'Pista revelada: ' + randomChar.toUpperCase(),
                    showConfirmButton: false, timer: 1500
                });

                guess(randomChar);
            } else {
                Swal.fire({toast: true, icon: 'warning', title: 'No hay suficientes letras para una pista'});
            }
        }

        function checkWinCondition() {
            const currentWord = config.words[state.wordIndex].word.toLowerCase();
            const isWin = currentWord.split('').every(c => state.guessed.includes(c));
            const isLose = state.wrong >= maxWrong;
            
            if (isWin) {
                clearInterval(state.timer);
                state.gameActive = false;
                state.score += 10;
                Swal.fire({title: '¡Correcto!', icon: 'success', timer: 1500, showConfirmButton: false})
                    .then(() => nextLevel());
            } else if (isLose) {
                handleGameOver(false, '¡Ahorcado! La palabra era: ' + currentWord.toUpperCase());
            }
        }

        function handleGameOver(success, msg) {
            clearInterval(state.timer);
            state.gameActive = false;
            if (!success) {
                Swal.fire({
                    title: 'Perdiste esta ronda',
                    text: msg,
                    icon: 'error',
                    confirmButtonText: 'Continuar'
                }).then(() => nextLevel());
            }
        }

        function nextLevel() {
            state.wordIndex++;
            init();
        }

        function finishGame() {
            Swal.fire({
                title: '¡Sesión Terminada!',
                html: 'Puntaje Final: <b>' + state.score + '</b>',
                icon: 'success',
                confirmButtonText: 'Jugar de Nuevo'
            }).then(() => location.reload());
        }

        init();
    </script>
</body>
</html>`;
};

const Summary = ({ config, onBack }) => {
    const [downloadUrl, setDownloadUrl] = useState(null);

    useEffect(() => {
        // Generamos el blob solo cuando config cambia
        const htmlContent = generateGameCode(config);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        
        // Limpieza de memoria
        return () => URL.revokeObjectURL(url);
    }, [config]);
    // --- INICIO DE CORRECCIÓN DE ERROR (HOOKS) ---
      // Los hooks ahora se llaman incondicionalmente en el nivel superior,
      // corrigiendo los errores de linting.
      const location = useLocation();
      const navigate = useNavigate();
      // Obtenemos 'state' de 'location'. Puede ser 'null' si no se pasó nada
      // o si estamos en un entorno de preview que no provee un 'location.state'.
      const state = location.state;
      // --- FIN DE CORRECCIÓN DE ERROR (HOOKS) ---
    
// --- DATOS DE RESPALDO PARA PREVIEW ---
  // Si 'state' es undefined o null (porque el hook falló en preview o no se pasó),
  // usamos esto.
  const MOCK_DATA = {
    selectedAreas: ['science', 'math'],
    selectedSkills: ['Resolución de problemas', 'Creatividad'],
    gameDetails: {
      gameName: "Juego de Prueba (Preview)",
      description: "Esta es una descripción de prueba para el preview.",
      version: "1.0.0",
      date: new Date().toISOString()
    },
    selectedPlatforms: ['web', 'mobile']
  };

  // Valores por defecto: usa 'state' si existe y tiene contenido, o MOCK_DATA si no.
  // Esto mantiene la app funcional en la vista previa.
  const { 
    selectedAreas = MOCK_DATA.selectedAreas, 
    selectedSkills = MOCK_DATA.selectedSkills, 
    gameDetails = MOCK_DATA.gameDetails, 
    selectedGame, // Este puede seguir siendo undefined si no se usa
    selectedPlatforms = MOCK_DATA.selectedPlatforms
  } = state || MOCK_DATA;

  // --- Funciones de Ayuda ---

  /**
   * Obtiene el nombre legible de un área.
   * @param {string} areaId - ID del área (ej. 'science')
   * @returns {string} Nombre legible (ej. 'Ciencia')
   */
  const getAreaName = (areaId) => {
    const areas = {
      science: 'Ciencia',
      technology: 'Tecnología',
      engineering: 'Ingeniería',
      arts: 'Arte',
      math: 'Matemáticas'
    };
    return areas[areaId] || areaId;
  };

  /**
   * Obtiene la ruta del icono para un área.
   * @param {string} areaId - ID del área
   * @returns {string} Ruta de la imagen
   */
  const getAreaIcon = (areaId) => {
    const icons = {
      science: '/images/areas/Ciencia.png',
      technology: '/images/areas/Tecnologia.png',
      engineering: '/images/areas/Ingenieria.png',
      arts: '/images/areas/Artes.png',
      math: '/images/areas/Matematicas.png'
    };
    // Devuelve la ruta o un placeholder si no se encuentra
    return icons[areaId] || 'https://placehold.co/32x32/eee/aaa?text=?'; 
  };
 // --- Estilos en línea para la iconografía ---
  const summarySectionStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem', // 12px
    marginBottom: '1rem' // 16px
  };

  const iconStyle = {
    marginTop: '4px', // Alinea el icono ligeramente hacia abajo
    flexShrink: 0, // Evita que el icono se encoja
    color: '#334155' // Un color de icono neutro (slate-700)
  };
  /**
   * Formatea una cadena de fecha a un formato legible.
   * @param {string} dateString - Fecha en formato string
   * @returns {string} Fecha formateada (ej. '13 de noviembre de 2025')
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      // Ajuste para compensar la zona horaria (si es necesario)
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Fecha inválida";
    }
  };
    return (
        <div className="summary-screen">
            <h2 style={{color: 'var(--primary-color)'}}>¡Configuración Exitosa!</h2>
            <p className="rules-text">Aquí tienes el resumen de tu juego listo para descargar.</p>
             <h1 className="selection-title" style={{ 
                                    textAlign: 'center', 
                                    marginBottom: '2rem',
                                    fontSize: '2rem', // 32px
                                    fontWeight: '600'
                                  }}>
                                    Resumen de la Configuración
                                  </h1>
                                  
                                  {/* --- SECCIÓN DE DETALLES CON ICONOS --- */}
                                  <div className="summary-details">
                                    <div className="summary-section" style={summarySectionStyle}>
                                      <Tag size={20} style={iconStyle} />
                                      <div>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Nombre del Juego:</h4>
                                        <p style={{ margin: 0, fontSize: '1rem' }}>
                                          {gameDetails.gameName || 'Nombre del Juego no disponible'}
                                        </p>
                                      </div>
                                    </div>
                                    </div>
                                     <div className="summary-section" style={summarySectionStyle}>
                                                  <FileText size={20} style={iconStyle} />
                                                  <div>
                                                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Descripción:</h4>
                                                    <p style={{ margin: 0, fontSize: '1rem', whiteSpace: 'pre-line' }}>
                                                      {gameDetails.description || 'Sin descripción.'}
                                                    </p>
                                                  </div>
                                                </div>
            
                                                  <div className="summary-section" style={summarySectionStyle}>
                                                              <Layers size={20} style={iconStyle} />
                                                              <div>
                                                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Versión:</h4>
                                                                <p style={{ margin: 0, fontSize: '1rem' }}>
                                                                  {gameDetails.version || 'N/A'}
                                                                </p>
                                                              </div>
                                                            </div>
                                                            
                                                            <div className="summary-section" style={summarySectionStyle}>
                                                              <Calendar size={20} style={iconStyle} />
                                                              <div>
                                                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Fecha de Creación:</h4>
                                                                <p style={{ margin: 0, fontSize: '1rem' }}>
                                                                  {formatDate(gameDetails.date)}
                                                                </p>
                                                              </div>
                                                            </div>
                                                
                                                            <div className="summary-section" style={summarySectionStyle}>
                                                              <Monitor size={20} style={iconStyle} />
                                                              <div>
                                                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Plataformas Seleccionadas:</h4>
                                                                <p style={{ margin: 0, fontSize: '1rem' }}>
                                                                  {selectedPlatforms?.length > 0 
                                                                    ? selectedPlatforms.map(platform => platform.charAt(0).toUpperCase() + platform.slice(1)).join(', ')
                                                                    : 'No seleccionadas'
                                                                  }
                                                                </p>
                                                              </div>
                                                            </div>
                                                          
                                                          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2rem 0' }} />
                              {/* --- INICIO DE DOS COLUMNAS (Áreas y Habilidades) --- */}
                                       <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                             
                                         {/* Columna 1: Áreas */}
                                         <div className="summary-section" style={{ flex: 1, minWidth: '250px' }}>
                                           <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                             <Shapes size={18} />
                                             Áreas Seleccionadas:
                                           </h4>
                                           {selectedAreas?.length > 0 ? (
                                             <ul className="area-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
                                               {selectedAreas.map(areaId => (
                                                 <li key={areaId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                   <img 
                                                     src={getAreaIcon(areaId)} 
                                                     alt={`Icono ${getAreaName(areaId)}`}
                                                     className="summary-area-icon"
                                                     style={{ width: '24px', height: '24px' }}
                                                     // Agregamos un 'onerror' por si la imagen no carga
                                                     onError={(e) => { e.target.src = 'https://placehold.co/24x24/eee/aaa?text=?'; }}
                                                   />
                                                   {getAreaName(areaId)}
                                                 </li>
                                               ))}
                                             </ul>
                                           ) : (
                                             <p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay áreas seleccionadas.</p>
                                           )}
                                         </div>
                             
                                         {/* Columna 2: Habilidades */}
                                         <div className="summary-section" style={{ flex: 1, minWidth: '250px' }}>
                                           <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                             {/* Error corregido: Se usa Puzzle en lugar de PuzzlePiece */}
                                             <Puzzle size={18} /> 
                                             Habilidades Seleccionadas:
                                           </h4>
                                           {selectedSkills?.length > 0 ? (
                                             <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                                               {selectedSkills.map(skill => (
                                                 <li key={skill} style={{ marginBottom: '0.25rem' }}>{skill}</li>
                                               ))}
                                             </ul>
                                           ) : (
                                             <p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay habilidades seleccionadas.</p>
                                           )}
                                         </div>
                                       </div>                             
            <div className="summary-card">
                <h3>Resumen del Paquete</h3>
                <div className="summary-row">
                    <span>Categoría:</span>
                    <strong>{config.category.toUpperCase()}</strong>
                </div>
                <div className="summary-row">
                    <span>Dificultad:</span>
                    <strong>{config.difficulty.toUpperCase()}</strong>
                </div>
                <div className="summary-row">
                    <span>Tiempo Límite:</span>
                    <strong>{config.timeLimit} segundos</strong>
                </div>
                <div className="summary-row">
                    <span>Total Palabras:</span>
                    <strong>{config.words.length}</strong>
                </div>
                <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee'}}>
                    <strong style={{display:'block', marginBottom:'0.5rem'}}>Palabras incluidas:</strong>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'5px'}}>
                        {config.words.map(w => (
                            <span key={w.word} style={{
                                background:'var(--light-gray-color)', 
                                padding:'4px 10px', 
                                borderRadius:'15px', 
                                fontSize:'0.85rem',
                                border: '1px solid var(--medium-gray-color)'
                            }}>
                                {w.word}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="download-section">
                <button className="btn-secondary" onClick={onBack}>
                    Volver a Editar
                </button>
                {downloadUrl && (
                    <a href={downloadUrl} download={`ahorcado-${config.category}.html`} style={{textDecoration:'none'}}>
                        <button className="btn-primary btn-success">
                            Descargar Juego (.html)
                        </button>
                    </a>
                )}
            </div>
        </div>
    );
};

export default Summary;

