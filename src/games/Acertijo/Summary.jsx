import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Download, Package, CheckCircle, X,
  Clock, Tag, Home, FileText, Calendar, Monitor,
  Puzzle, Grid, Layers, Shapes, Type, List, Trophy
} from 'lucide-react';

// --- GENERADOR HTML PARA ACERTIJOS ---
const generateGameCode = (config) => {
    const iconMappingJS = `
        const iconMap = {
            "Fotosíntesis": "sun", "Respiración": "wind", "Autótrofo": "sprout", "Reproducción": "copy", "Fototropismo": "leaf",
            "6": "hash", "12": "calculator", "9": "hash", "3/8": "pie-chart", "1/4": "pie-chart", "1/2": "pie-chart",
            "7": "hash", "5": "hash", "10": "hash", "93": "hash", "39": "hash", "84": "hash", "105": "hash", "110": "hash", "140": "hash",
            "Cerebro": "brain", "Corazón": "heart", "Estómago": "activity", "Pulmones": "wind", "Hígado": "activity", "Riñones": "activity",
            "Páncreas": "activity", "Intestino": "activity", "Intestino grueso": "activity", "Intestino delgado": "activity",
            "Músculo": "activity", "Hueso": "bone", "Ojo": "eye", "Oído": "ear", "Nariz": "activity",
            "Cuadrado": "square", "Rectángulo": "square", "Rombo": "square", "Trapecio": "box-select", "Hexágono": "hexagon",
            "Pentágono": "hexagon", "Heptágono": "hexagon", "Octágono": "octagon", "Decágono": "octagon", "Círculo": "circle",
            "Elipse": "circle", "Óvalo": "circle", "Semicírculo": "circle", "Triángulo": "triangle", "Romboide": "square",
            "Triple viral (SRP)": "syringe", "Varicela": "alert-triangle", "Rotavirus": "pill", "DTP (Difteria)": "shield",
            "DTP (Tétanos)": "shield", "DTP": "shield", "BCG": "syringe", "Hepatitis B": "syringe", "Hepatitis A": "pill",
            "Polio (Sabin)": "syringe", "Triple viral": "syringe", "Triple viral (Paperas)": "syringe", "Neumocócica": "syringe",
            "Influenza": "thermometer", "COVID-19": "alert-triangle",
            "Prisma rectangular": "box", "Cubo": "box", "Pirámide": "pyramid", "Esfera": "globe", "Cilindro": "cylinder",
            "Cono": "cone", "Prisma": "box", "Tetraedro": "pyramid", "Octaedro": "pyramid", "Dodecaedro": "globe",
            "Icosaedro": "globe", "Prisma hexagonal": "box", "Prisma triangular": "pyramid"
        };
    `;

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Juego de Acertijos - ${config.difficulty}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #0077b6; --dark: #023e8a; --light: #e0f7fa; --bg: #f0f2f5; --white: #ffffff; --green: #2a9d8f; --red: #e63946; }
        body { font-family: 'Nunito', sans-serif; background: var(--bg); color: #212529; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .game-layout { display: grid; grid-template-columns: 200px 1fr 200px; gap: 2rem; width: 100%; max-width: 1200px; }
        @media (max-width: 1024px) { .game-layout { grid-template-columns: 1fr; } }
        .card { background: var(--white); border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .stats-card { display: flex; flex-direction: column; gap: 1rem; height: fit-content; }
        .stat-item { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #4b5563; font-size: 1.1rem; padding: 0.5rem; background: #f8f9fa; border-radius: 0.5rem; }
        .question-card { padding: 3rem 2rem; text-align: center; min-height: 300px; display: flex; flex-direction: column; justify-content: center; position: relative; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .question-text { font-family: 'Merriweather', serif; font-size: 1.8rem; color: var(--dark); line-height: 1.6; font-weight: 700; }
        .topic-badge { position: absolute; top: 1.5rem; left: 50%; transform: translateX(-50%); background: var(--light); color: var(--primary); padding: 0.5rem 1.5rem; border-radius: 2rem; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; }
        .answers-column { display: flex; flex-direction: column; gap: 1rem; justify-content: center; }
        .answer-btn { background: var(--white); border: 2px solid transparent; padding: 1rem; border-radius: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100px; justify-content: center; }
        .answer-btn:hover { transform: translateY(-3px); border-color: var(--primary); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .answer-label { font-weight: 600; color: var(--dark); }
        .icon-large { width: 32px; height: 32px; color: var(--primary); }
        .control-btn { padding: 0.8rem; border-radius: 0.5rem; font-weight: 700; border: none; cursor: pointer; width: 100%; margin-top: 1rem; color: white; background: var(--red); display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; transition: opacity 0.3s; }
        .hidden { display: none; opacity: 0; pointer-events: none; }
        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; background: var(--primary); color: white; border: none; border-radius: 0.5rem; cursor: pointer; }
    </style>
</head>
<body>
    <div id="start-screen" class="overlay">
        <h1 style="color:var(--dark); font-size:2.5rem; margin-bottom:1rem;">Juego de Acertijos</h1>
        <p style="font-size:1.2rem; color:#666; margin-bottom:2rem;">Nivel: ${config.difficulty}</p>
        <button class="big-btn" onclick="startGame()">Comenzar Juego</button>
    </div>
    <div id="end-screen" class="overlay hidden">
        <h1 id="end-title" style="color:var(--dark); font-size:2.5rem;">Juego Terminado</h1>
        <h2 style="color:var(--primary); font-size:2rem; margin:1rem 0;">Puntaje Final: <span id="final-score">0</span></h2>
        <button class="big-btn" onclick="location.reload()">Jugar de Nuevo</button>
    </div>
    <div class="game-layout" id="game-ui" style="display:none;">
        <div class="stats-card card">
            <div class="stat-item"><i data-lucide="timer"></i> <span id="timer">${config.timeLimit}s</span></div>
            <div class="stat-item"><i data-lucide="star"></i> <span id="score">0 pts</span></div>
            <div class="stat-item"><i data-lucide="help-circle"></i> <span id="progress">1/${config.riddles.length}</span></div>
            <hr style="border-top:1px solid #eee; width:100%; margin:1rem 0;">
            <button class="control-btn" onclick="finishGame(false)">Finalizar</button>
        </div>
        <div class="question-card card">
            <div class="topic-badge" id="topic">Tema</div>
            <h2 class="question-text" id="question">Pregunta...</h2>
        </div>
        <div class="answers-column" id="answers-container"></div>
    </div>
    <script>
        const config = ${JSON.stringify(config)};
        ${iconMappingJS}
        let state = { currentIndex: 0, score: 0, timeLeft: config.timeLimit, timer: null, active: false };
        function shuffle(array) { return array.sort(() => Math.random() - 0.5); }
        function getIconName(answer) { return iconMap[answer] || 'help-circle'; }
        function generateOptions(correctAnswer) {
            const allAnswers = Object.keys(iconMap);
            let distractors = [];
            while (distractors.length < 2) {
                const random = allAnswers[Math.floor(Math.random() * allAnswers.length)];
                if (random !== correctAnswer && !distractors.includes(random)) distractors.push(random);
            }
            return shuffle([correctAnswer, ...distractors]);
        }
        function startGame() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('game-ui').style.display = 'grid';
            state.active = true; state.score = 0; state.currentIndex = 0;
            loadRiddle();
        }
        function loadRiddle() {
            if (state.currentIndex >= config.riddles.length) return finishGame(true);
            const riddle = config.riddles[state.currentIndex];
            document.getElementById('question').innerText = riddle.pregunta;
            document.getElementById('topic').innerText = riddle.tema;
            document.getElementById('progress').innerText = (state.currentIndex + 1) + '/' + config.riddles.length;
            const options = riddle.opciones ? shuffle(riddle.opciones) : generateOptions(riddle.respuesta);
            const container = document.getElementById('answers-container');
            container.innerHTML = '';
            options.forEach(opt => {
                const btn = document.createElement('button'); btn.className = 'answer-btn';
                const iconName = getIconName(opt);
                btn.innerHTML = '<i data-lucide="' + iconName + '" class="icon-large"></i><span class="answer-label">' + opt + '</span>';
                btn.onclick = () => handleAnswer(opt);
                container.appendChild(btn);
            });
            lucide.createIcons();
            clearInterval(state.timer);
            state.timeLeft = config.timeLimit;
            document.getElementById('timer').innerText = state.timeLeft + 's';
            state.timer = setInterval(() => {
                state.timeLeft--;
                document.getElementById('timer').innerText = state.timeLeft + 's';
                if (state.timeLeft <= 0) {
                    clearInterval(state.timer);
                    Swal.fire({ title: '¡Tiempo agotado!', icon: 'warning', confirmButtonText: 'Siguiente' }).then(() => { state.currentIndex++; loadRiddle(); });
                }
            }, 1000);
        }
        function handleAnswer(selected) {
            clearInterval(state.timer);
            const currentRiddle = config.riddles[state.currentIndex];
            const isCorrect = selected === currentRiddle.respuesta;
            if (isCorrect) {
                state.score += 10;
                document.getElementById('score').innerText = state.score + ' pts';
                Swal.fire({ title: '¡Correcto!', icon: 'success', timer: 1000, showConfirmButton: false }).then(() => next());
            } else {
                Swal.fire({ title: 'Incorrecto', html: 'La respuesta correcta era: <b>' + currentRiddle.respuesta + '</b>', icon: 'error', confirmButtonText: 'Continuar' }).then(() => next());
            }
        }
        function next() { state.currentIndex++; loadRiddle(); }
        function finishGame(completed) {
            clearInterval(state.timer); state.active = false;
            document.getElementById('game-ui').style.display = 'none';
            document.getElementById('end-screen').classList.remove('hidden');
            document.getElementById('final-score').innerText = state.score;
            document.getElementById('end-title').innerText = completed ? "¡Juego Completado!" : "Fin del Juego";
        }
        lucide.createIcons();
    </script>
</body>
</html>`;
};

// --- COMPONENTE SUMMARY (PRINCIPAL) ---
const Summary = ({  onBack }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const [isDownloadReady, setIsDownloadReady] = useState(false);

    // Mock Data para fallback
    const MOCK_DATA = {
        selectedAreas: ['science', 'math'],
        selectedSkills: ['Resolución de problemas', 'Creatividad'],
        gameDetails: {
          gameName: "Juego de Acertijos",
          description: "Desafía tu mente con esta colección de acertijos.",
          version: "1.0.0",
          date: new Date().toISOString()
        },
        selectedPlatforms: ['web', 'mobile'],
        config: { difficulty: 'Demo', timeLimit: 60, riddles: [] }
    };

    

    // Inyección de JSZip
    useEffect(() => {
        if (!window.JSZip) {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleDownloadZip = () => {
        if (!window.JSZip) { alert("Cargando librería ZIP..."); return; }
        setIsModalOpen(true);
        setIsDownloadReady(false);
        setProgress(0);
        setStatusText("Preparando archivos...");

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 15) + 5; 
            
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                setStatusText("¡Completado!");
                generateAndDownloadZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Generando código HTML...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Comprimiendo recursos...");
                if (currentProgress >= 80) setStatusText("Finalizando paquete...");
                setProgress(currentProgress);
            }
        }, 400); 
    };

    const generateAndDownloadZip = async () => {
        try {
            const zip = new window.JSZip();
            const htmlContent = generateGameCode(config); // Usamos la función de Acertijo
            zip.file("index.html", htmlContent);
            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `juego-acertijos-${config.difficulty}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setProgress(100);
            setIsDownloadReady(true);
        } catch (error) {
            console.error("Error generando el ZIP:", error);
            setStatusText("Error al generar el archivo.");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setProgress(0);
    };

    const { 
        selectedAreas = MOCK_DATA.selectedAreas, 
        selectedSkills = MOCK_DATA.selectedSkills, 
        gameDetails = MOCK_DATA.gameDetails, 
        selectedPlatforms = MOCK_DATA.selectedPlatforms
    } = state || MOCK_DATA;

    // --- Funciones de Ayuda ---
    const getAreaName = (areaId) => {
        const areas = { science: 'Ciencia', technology: 'Tecnología', engineering: 'Ingeniería', arts: 'Arte', math: 'Matemáticas' };
        return areas[areaId] || areaId;
    };

    const getAreaIcon = (areaId) => {
        const icons = {
          science: '/images/areas/Ciencia.png',
          technology: '/images/areas/Tecnologia.png',
          engineering: '/images/areas/Ingenieria.png',
          arts: '/images/areas/Artes.png',
          math: '/images/areas/Matematicas.png'
        };
        return icons[areaId] || 'https://placehold.co/32x32/eee/aaa?text=?'; 
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        try {
            const date = new Date(dateString);
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
            return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (error) { return "Fecha inválida"; }
    };

    return (
        <div className="summary-screen">
             {/* ESTILOS DEL MODAL */}
             <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); animation: fadeIn 0.3s ease; }
                .modal-content { background: white; padding: 2.5rem; border-radius: 1rem; width: 90%; max-width: 450px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); position: relative; animation: slideUp 0.3s ease; }
                .progress-container { width: 100%; height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin: 1.5rem 0; }
                .progress-bar { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); transition: width 0.4s ease-in-out; border-radius: 6px; }
                .status-text { font-size: 1.1rem; color: #4b5563; font-weight: 500; min-height: 1.5rem; }
                .close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; color: #9ca3af; }
                .close-btn:hover { color: #4b5563; }
                .icon-pulse { animation: pulse 2s infinite; }
                /* Grid Helpers */
                .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
                .info-card { background: white; padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem; }
                .info-card-header { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                .info-card-value { font-size: 1.1rem; color: #334155; font-weight: 500; }
                .full-width { grid-column: 1 / -1; }
                .summary-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
                .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; }
                @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
            `}</style>

            <h2 style={{color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                <CheckCircle size={32} color="#22c55e" /> ¡Configuración Exitosa!
            </h2>
            <p className="rules-text" style={{textAlign: 'center', color: '#666', marginBottom: '2rem'}}>Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.</p>
            
            <h1 className="selection-title" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600', color: '#1e293b' }}>
                Resumen de la Configuración
            </h1>
                                  
            {/* --- SECCIÓN DE DETALLES ORGANIZADA (GRID) --- */}
            <div className="summary-details" style={{maxWidth: '800px', margin: '0 auto'}}>
                <div className="info-grid">
                    {/* Nombre del Juego */}
                    <div className="info-card">
                        <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
                        <div className="info-card-value">{gameDetails.gameName || 'No disponible'}</div>
                    </div>

                    {/* Versión */}
                    <div className="info-card">
                        <div className="info-card-header"><Layers size={16} /> Versión</div>
                        <div className="info-card-value">{gameDetails.version || '1.0.0'}</div>
                    </div>

                    {/* Descripción (Ancho completo) */}
                    <div className="info-card full-width">
                        <div className="info-card-header"><FileText size={16} /> Descripción</div>
                        <div className="info-card-value" style={{fontSize: '1rem', lineHeight: '1.5'}}>
                            {gameDetails.description || 'Sin descripción.'}
                        </div>
                    </div>

                    {/* Fecha */}
                    <div className="info-card">
                        <div className="info-card-header"><Calendar size={16} /> Fecha de Creación</div>
                        <div className="info-card-value">{formatDate(gameDetails.date)}</div>
                    </div>

                    {/* Plataformas */}
                    <div className="info-card">
                        <div className="info-card-header"><Monitor size={16} /> Plataformas</div>
                        <div className="info-card-value">
                            {selectedPlatforms?.length > 0 
                                ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
                                : 'No seleccionadas'}
                        </div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2.5rem 0' }} />

                {/* --- ÁREAS Y HABILIDADES (Estilo Tarjeta) --- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    
                    {/* Tarjeta de Áreas */}
                    <div className="info-card" style={{borderLeft: '4px solid #3b82f6'}}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#1e293b' }}>
                            <Shapes size={20} color="#3b82f6"/> Áreas Seleccionadas
                        </h4>
                        {selectedAreas?.length > 0 ? (
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem'}}>
                                {selectedAreas.map(areaId => (
                                    <span key={areaId} style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                        padding: '0.5rem 0.75rem', background: '#eff6ff', 
                                        borderRadius: '0.5rem', fontSize: '0.95rem', color: '#1e40af' 
                                    }}>
                                        <img 
                                            src={getAreaIcon(areaId)} 
                                            alt=""
                                            style={{ width: '20px', height: '20px' }}
                                            onError={(e) => { e.target.src = 'https://placehold.co/20x20/eee/aaa?text=?'; }}
                                        />
                                        {getAreaName(areaId)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay áreas seleccionadas.</p>
                        )}
                    </div>

                    {/* Tarjeta de Habilidades */}
                    <div className="info-card" style={{borderLeft: '4px solid #8b5cf6'}}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#1e293b' }}>
                            <Puzzle size={20} color="#8b5cf6"/> Habilidades Seleccionadas
                        </h4>
                        {selectedSkills?.length > 0 ? (
                            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#334155' }}>
                                {selectedSkills.map(skill => (
                                    <li key={skill} style={{ marginBottom: '0.4rem' }}>{skill}</li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay habilidades seleccionadas.</p>
                        )}
                    </div>
                </div>
            </div>                      

            {/* Detalles Técnicos del Juego */}
            <div className="info-card" style={{marginTop: '2.5rem', maxWidth: '800px', margin: '2.5rem auto'}}>
                <h3 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#0077b6'}}>
                    Parámetros del Juego
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                    <div className="summary-row">
                        <span style={{display:'flex', gap:'8px', alignItems:'center', color: '#64748b'}}><Grid size={18}/> Categoría:</span>
                        <strong style={{fontSize: '1.1rem'}}>{config.category.toUpperCase()}</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{display:'flex', gap:'8px', alignItems:'center', color: '#64748b'}}><Type size={18}/> Dificultad:</span>
                        <strong style={{fontSize: '1.1rem'}}>{config.difficulty.toUpperCase()}</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{display:'flex', gap:'8px', alignItems:'center', color: '#64748b'}}><Clock size={18}/> Tiempo Límite:</span>
                        <strong style={{fontSize: '1.1rem'}}>{config.timeLimit} segundos</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{display:'flex', gap:'8px', alignItems:'center', color: '#64748b'}}><List size={18}/> Total Preguntas:</span>
                        <strong style={{fontSize: '1.1rem'}}>{config.riddles.length}</strong>
                    </div>
                </div>
                
                <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9'}}>
                    <strong style={{display:'block', marginBottom:'0.75rem', color: '#334155'}}>Preguntas incluidas en el paquete:</strong>
                    <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                        {config.riddles.map((w, index) => (
                            <div key={w.id} style={{
                                background:'white', padding:'8px 12px', 
                                borderRadius:'8px', fontSize:'0.9rem', border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#475569', display: 'flex', justifyContent: 'space-between'
                            }}>
                                <span style={{fontWeight:'600'}}>#{index + 1} - {w.tema}</span>
                                <span style={{fontStyle:'italic', color:'#64748b'}}>{w.respuesta}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="download-section" style={{display:'flex', justifyContent:'center', gap:'1rem', marginTop:'2rem', paddingBottom:'2rem'}}>
                <button 
                    onClick={onBack} 
                    style={{backgroundColor: '#f1f5f9', color: '#475569', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: '1px solid #e2e8f0', cursor: 'pointer', display:'flex', alignItems:'center', gap:'0.5rem'}}
                >
                    <ArrowLeft size={18} /> Volver a Editar
                </button>
                
                <button 
                    onClick={handleDownloadZip}
                    style={{backgroundColor: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', display:'flex', alignItems:'center', gap:'0.5rem', boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.39)'}}
                >
                    <Download size={18} /> Descargar Juego (.zip)
                </button>
                 <button onClick={() => window.location.reload()} style={{backgroundColor: '#f1f5f9', color: '#475569', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: '1px solid #e2e8f0', cursor: 'pointer', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                    <Home size={18} /> Reiniciar Generador
                </button>
            </div>

            {/* --- MODAL DE DESCARGA --- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {isDownloadReady && <button className="close-btn" onClick={closeModal}><X size={24}/></button>}
                        
                        <div style={{margin: '0 auto 1.5rem', width: '80px', height: '80px', background: isDownloadReady ? '#dcfce7' : '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            {isDownloadReady ? (
                                <CheckCircle size={48} color="#22c55e" className="icon-pulse"/>
                            ) : (
                                <Package size={48} color="#3b82f6" className="icon-pulse"/>
                            )}
                        </div>
                        
                        <h3 style={{fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem'}}>
                            {isDownloadReady ? '¡Descarga Lista!' : 'Empaquetando Juego'}
                        </h3>
                        
                        <p style={{color: '#6b7280', margin: 0}}>
                            {statusText}
                        </p>

                        <div className="progress-container">
                            <div className="progress-bar" style={{width: `${progress}%`}}></div>
                        </div>
                        
                        <p style={{fontSize: '0.9rem', color: '#9ca3af'}}>
                            {progress}% completado
                        </p>

                        {isDownloadReady && (
                             <button onClick={closeModal} style={{marginTop: '1rem', width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer'}}>
                                Cerrar Ventana
                             </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Summary;