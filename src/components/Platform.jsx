import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- Componentes de iconos SVG (sin cambios) ---
const IconArrowBack = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M249.38 256L370.06 135.32a16.79 16.79 0 10-23.74-23.74L213.78 244.14a16.8 16.8 0 000 23.74l132.54 132.54a16.79 16.79 0 0023.74-23.74z"></path>
    </svg>
);
const IconConfigure = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"></path>
    </svg>
);
const IconGamepad = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}><path d="M421.1 64H90.9C40.7 64 0 104.7 0 154.9V357.1C0 407.3 40.7 448 90.9 448H421.1C471.3 448 512 407.3 512 357.1V154.9C512 104.7 471.3 64 421.1 64zM160 288h-32v-32h-32v-64h32V160h32v32h32v64h-32v32zm192 32c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm64-64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"></path></svg>;
const IconUser = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"></path></svg>;
const IconCodeBranch = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}><path d="M384 144c0-44.2-35.8-80-80-80s-80 35.8-80 80c0 36.4 24.3 67.1 57.5 76.8-.6 16.5-5.4 32.8-14.2 47.2-20.3 32.5-51.5 53.6-88.6 57.8-1.2 6-2.5 11.9-4.2 17.6-18.3 59.5-77.3 93.4-138.5 75.1-61.2-18.3-95.1-77.3-76.8-138.5 18.3-61.2 77.3-95.1 138.5-76.8 4.2 1.2 8.3 2.5 12.3 4.2.1-17.1.1-34.2 0-51.3-4.2-1.2-8.3-2.5-12.3-4.2C35.8 256 1.9 197 20.2 135.8 38.5 74.6 97.5 40.7 158.7 59.1c54.3 16.2 87.7 67.8 81.3 121.3-.3 1.1-.6 2.2-1 3.3 14.2-4.1 28.9-6.7 44-7.5 1-.6 2-1.2 3-1.8 20.3-11.4 34.2-31.5 38.2-53.9C360.7 211.1 384 179.6 384 144zM64 240c-22.1 0-40 17.9-40 40s17.9 40 40 40 40-17.9 40-40-17.9-40-40-40zm256-96c-22.1 0-40 17.9-40 40s17.9 40 40 40 40-17.9 40-40-17.9-40-40-40z"></path></svg>;
const IconFile = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}><path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM336 480H48V48h160v104c0 13.3 10.7 24 24 24h104v204z"></path></svg>;
const IconCalendar = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}><path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"></path></svg>;
// REEMPLAZA desde línea 20 hasta línea 36
const IconWeb = ({ size = 70 }) => (
    <img src="https://www.google.com/chrome/static/images/chrome-logo-m100.svg" alt="Web" width={size} height={size} style={{ display: 'block' }} />
);
const IconAndroid = ({ size = 70 }) => (
    <img src="https://cdn-icons-png.flaticon.com/512/174/174836.png" alt="Android" width={size} height={size} style={{ display: 'block' }} />
);

const IconApple = ({ size = 70 }) => (
    <img src="https://cdn-icons-png.flaticon.com/512/179/179309.png" alt="iOS" width={size} height={size} style={{ display: 'block' }} />
);
const Platform = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const selectedGame = state?.selectedGame;

    // --- NUEVO CÓDIGO AÑADIDO ---
    // Fuerza el scroll al inicio (top) cada vez que se carga este componente
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    // ----------------------------

    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

    // --- ESTADO RESTAURADO ---
    // Volvemos a un único estado para el formulario, como en el código original
    const [formData, setFormData] = useState({
        gameName: '',
        authorName: '',
        version: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });
    // Volvemos a un único estado de errores
    const [errors, setErrors] = useState({});
    const [tooltipVisible, setTooltipVisible] = useState({});


    // Estado para la pestaña activa (esto es solo visual)
    const [activeTab, setActiveTab] = useState('');

    // Efecto para actualizar la pestaña activa cuando cambian las plataformas
    useEffect(() => {
        if (selectedPlatforms.length === 0) {
            setActiveTab('');
        } else if (!selectedPlatforms.includes(activeTab)) {
            // Si la pestaña activa fue eliminada, selecciona la primera de la lista
            setActiveTab(selectedPlatforms[0]);
        }
    }, [selectedPlatforms, activeTab]);

    const togglePlatform = (platform) => {
        const isSelected = selectedPlatforms.includes(platform);
        let newSelectedPlatforms;

        if (isSelected) {
            // Eliminar plataforma
            newSelectedPlatforms = selectedPlatforms.filter(p => p !== platform);
            setSelectedPlatforms(newSelectedPlatforms);
        } else {
            // Añadir plataforma
            newSelectedPlatforms = [...selectedPlatforms, platform];
            setSelectedPlatforms(newSelectedPlatforms);
            // Establecer la nueva plataforma como la pestaña activa
            setActiveTab(platform);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validación en tiempo real por campo
        if (name === 'gameName' || name === 'authorName') {
            // Solo letras (incluyendo acentos, ñ) y espacios
            if (value !== '' && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) return;
        }

        if (name === 'version') {
            // Solo números enteros o decimales con máximo 1 decimal (ej: 1, 2.0, 3.1)
            if (value !== '' && !/^\d+(\.\d?)?$/.test(value)) return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    // Vuelve a ser 'validateForm' (singular)
    const validateForm = () => {
        const newErrors = {};

        // Nombre del juego: obligatorio y solo letras/espacios
        if (!formData.gameName.trim()) {
            newErrors.gameName = 'El nombre del juego es obligatorio.';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(formData.gameName.trim())) {
            newErrors.gameName = 'El nombre solo puede contener letras y espacios.';
        }

        // Versión: obligatoria y formato N o N.N (un solo decimal)
        if (!formData.version.trim()) {
            newErrors.version = 'La versión del juego es obligatoria.';
        } else if (!/^\d+(\.\d)?$/.test(formData.version.trim())) {
            newErrors.version = 'Formato inválido. Use: 1, 2.0, 3.1 (máximo un decimal).';
        }

        // Autor: si se llenó, solo letras/espacios
        if (formData.authorName.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(formData.authorName.trim())) {
            newErrors.authorName = 'El autor solo puede contener letras y espacios.';
        }

        return newErrors;
    };

    const handleContinue = () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

        navigate('/settings', {
            state: {
                ...state,             // ya trae withRA desde SteamActivities
                selectedPlatforms,
                gameDetails: formData,
            }
        });
    };

    if (!selectedGame) {
        return (
            <div className="screen-container">
                <div className="selection-container">
                    <h2 className="selection-title">No se ha seleccionado ninguna actividad</h2>
                    {/* ... (código de "no seleccionado" sin cambios) ... */}
                </div>
            </div>
        );
    }

    return (
        <div className="screen-container">
            <div className="selection-container">
                <h2 className="selection-title">Selecciona plataforma(s) para</h2>

                <div className="selected-game-info">
                    <div className="game-image-wrapper">
                        {selectedGame.icon ? (
                            <img
                                src={selectedGame.icon}
                                alt={selectedGame.name}
                                className="game-preview-image"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="game-image-placeholder">
                                <IconGamepad />
                            </div>
                        )}
                    </div>
                    <h3 className="game-info-title">{selectedGame.name}</h3>
                    {selectedGame.area && (
                        <span className="game-area-badge">{selectedGame.area}</span>
                    )}
                </div>

                {selectedPlatforms.length > 0 && (
                    <div className="platforms-selected-count">
                        {selectedPlatforms.length} plataforma(s) seleccionada(s)
                    </div>
                )}

                <div className="platform-options">
                    {['web', 'android', 'ios'].map(platform => (
                        <div key={platform} className="platform-btn-wrapper">
                            <button
                                className={`platform-btn ${selectedPlatforms.includes(platform) ? 'selected' : ''}`}
                                onClick={() => togglePlatform(platform)}
                            >
                                <span className="platform-icon">
                                    {platform === 'web' ? <IconWeb size={70} /> : platform === 'ios' ? <IconApple size={70} /> : <IconAndroid size={70} />}
                                </span>
                                <span className="platform-name">
                                    {platform === 'web' ? 'Web' : platform === 'ios' ? 'iOS' : 'Android'}
                                </span>
                            </button>
                            {selectedPlatforms.includes(platform) && (
                                <span className="selection-counter">✓</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* --- INICIO: Formulario de Usuario (con Tabs) --- */}
                {selectedPlatforms.length > 0 && (
                    <div className="user-form-container">

                        {/* 1. RENDER TABS (si hay 2 o más) */}
                        {selectedPlatforms.length >= 2 && (
                            <div className="tabs-container">
                                {selectedPlatforms.map(platform => (
                                    <button
                                        key={platform}
                                        className={`tab-btn ${activeTab === platform ? 'active' : ''}`}
                                        onClick={() => setActiveTab(platform)}
                                    >
                                        <span className="platform-icon" style={{ marginRight: '0.5rem' }}>
                                            {platform === 'web' ? <IconWeb size={24} /> : platform === 'ios' ? <IconApple size={24} /> : <IconAndroid size={24} />}
                                        </span>
                                        <span className="platform-name">
                                            {platform === 'web' ? 'Web' : platform === 'ios' ? 'iOS' : 'Android'}
                                        </span>
                                        {/* El indicador de error ahora mira el 'errors' único, 
                                            pero solo si la pestaña está activa (para evitar confusión) */}
                                        {activeTab === platform && Object.keys(errors).length > 0 && (
                                            <span className="tab-error-indicator">!</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 2. RENDER FORM (ahora usa 'formData' único) */}
                        <div className="form-content">
                            <h3 className="form-title">
                                {selectedPlatforms.length >= 2
                                    ? `Detalles para ${activeTab === 'web' ? 'Web' : activeTab === 'ios' ? 'iOS' : 'Android'}`
                                    : 'Detalles del Juego'}
                            </h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="gameName"><IconGamepad /> Nombre del Juego</label>
                                    <div className="input-tooltip-wrapper">
                                        <input
                                            type="text" id="gameName" name="gameName"
                                            value={formData.gameName}
                                            onChange={handleInputChange}
                                            onFocus={() => errors.gameName && setTooltipVisible(prev => ({ ...prev, gameName: true }))}
                                            onBlur={() => setTooltipVisible(prev => ({ ...prev, gameName: false }))}
                                            placeholder="Ej: Ahorcado"
                                            className={errors.gameName ? 'input-error' : ''}
                                        />
                                        {errors.gameName && tooltipVisible.gameName && (
                                            <div className="error-tooltip">
                                                <span className="error-tooltip-icon">⚠</span>
                                                {errors.gameName}
                                                <div className="error-tooltip-arrow" />
                                            </div>
                                        )}
                                        {errors.gameName && !tooltipVisible.gameName && (
                                            <span className="error-inline-icon" onMouseEnter={() => setTooltipVisible(prev => ({ ...prev, gameName: true }))} onMouseLeave={() => setTooltipVisible(prev => ({ ...prev, gameName: false }))}>⚠</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="authorName"><IconUser /> Nombre del Autor</label>
                                    <div className="input-tooltip-wrapper">
                                        <input
                                            type="text" id="authorName" name="authorName"
                                            value={formData.authorName}
                                            onChange={handleInputChange}
                                            onFocus={() => errors.authorName && setTooltipVisible(prev => ({ ...prev, authorName: true }))}
                                            onBlur={() => setTooltipVisible(prev => ({ ...prev, authorName: false }))}
                                            placeholder="Ej: Juan Pérez"
                                            className={errors.authorName ? 'input-error' : ''}
                                        />
                                        {errors.authorName && tooltipVisible.authorName && (
                                            <div className="error-tooltip">
                                                <span className="error-tooltip-icon">⚠</span>
                                                {errors.authorName}
                                                <div className="error-tooltip-arrow" />
                                            </div>
                                        )}
                                        {errors.authorName && !tooltipVisible.authorName && (
                                            <span className="error-inline-icon" onMouseEnter={() => setTooltipVisible(prev => ({ ...prev, authorName: true }))} onMouseLeave={() => setTooltipVisible(prev => ({ ...prev, authorName: false }))}>⚠</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="version"><IconCodeBranch /> Versión del Juego</label>
                                    <div className="input-tooltip-wrapper">
                                        <input
                                            type="text" id="version" name="version"
                                            value={formData.version}
                                            onChange={handleInputChange}
                                            onFocus={() => errors.version && setTooltipVisible(prev => ({ ...prev, version: true }))}
                                            onBlur={() => setTooltipVisible(prev => ({ ...prev, version: false }))}
                                            placeholder="Ej: 1.0"
                                            className={errors.version ? 'input-error' : ''}
                                        />
                                        {errors.version && tooltipVisible.version && (
                                            <div className="error-tooltip">
                                                <span className="error-tooltip-icon">⚠</span>
                                                {errors.version}
                                                <div className="error-tooltip-arrow" />
                                            </div>
                                        )}
                                        {errors.version && !tooltipVisible.version && (
                                            <span className="error-inline-icon" onMouseEnter={() => setTooltipVisible(prev => ({ ...prev, version: true }))} onMouseLeave={() => setTooltipVisible(prev => ({ ...prev, version: false }))}>⚠</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="description"><IconFile /> Descripción del juego</label>
                                    <textarea
                                        id="description" name="description"
                                        value={formData.description} // Usa formData
                                        onChange={handleInputChange}
                                        placeholder="Añade una breve descripción sobre el objetivo del juego..." rows="3"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* --- FIN: Formulario de Usuario --- */}

                <div className="action-buttons">
                    <button className="no-rounded-button" onClick={() => navigate(-1)}>
                        <IconArrowBack />
                        Anterior
                    </button>
                    <button
                        className="no-rounded-button"
                        disabled={selectedPlatforms.length === 0}
                        onClick={handleContinue}
                    >
                        <IconConfigure />
                        Configurar ({selectedPlatforms.length})
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.85); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes floatImage {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50%       { transform: translateY(-5px) scale(1.03); }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50%       { opacity: 0.75; transform: scale(1.1); }
                }

                .screen-container { padding: 20px; font-family: sans-serif; background-color: #f0f2f5; }
                .selection-container { max-width: 800px; margin: auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .selection-title { text-align: center; color: #333; margin-bottom: 2rem; }

                /* ====== CARD DEL JUEGO — diseño original + efectos nuevos ====== */
                .selected-game-info {
                    text-align: center;
                    margin-bottom: 20px;
                    background-color: #e9f5ff;
                    padding: 20px 15px 18px;
                    border-radius: 8px;
                    border-left: 5px solid #007bff;
                    animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }

                /* Imagen del juego */
                .game-image-wrapper {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 14px;
                }
                .game-preview-image {
                    width: 110px;
                    height: 110px;
                    object-fit: contain;
                    border-radius: 16px;
                    background: rgba(0, 119, 182, 0.08);
                    padding: 8px;
                    border: 2px solid rgba(0, 119, 182, 0.2);
                    box-shadow: 0 4px 16px rgba(0,119,182,0.18);
                    animation: floatImage 3.5s ease-in-out infinite;
                    display: block;
                    position: relative;
                    z-index: 2;
                }

                .game-image-placeholder {
                    width: 110px; height: 110px;
                    border-radius: 16px;
                    background: rgba(0,119,182,0.1);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2.5rem; color: #007bff;
                    border: 2px solid rgba(0,119,182,0.2);
                    margin: 0 auto 14px;
                }
                .game-info-title {
                    margin: 0 0 8px;
                    color: #0056b3;
                    font-size: 1.2rem;
                    font-weight: 700;
                }
                /* Badge del área — glassmorphism sobre fondo claro */
                .game-area-badge {
                    display: inline-block;
                    background: rgba(0, 86, 179, 0.12);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    color: #0056b3;
                    font-size: 0.78rem;
                    font-weight: 600;
                    padding: 3px 12px;
                    border-radius: 20px;
                    border: 1px solid rgba(0, 119, 182, 0.25);
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                }

                /* ====== RESTO: diseño original sin cambios ====== */
                .platforms-selected-count { text-align: center; margin-bottom: 10px; color: #555; font-style: italic; }
                .platform-options { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
                .platform-btn-wrapper { position: relative; }
                .platform-icon svg { width: 100%; height: 100%; }
                .tab-btn .platform-icon { width: 1.4rem; height: 1.4rem; font-size: 1.4rem; }

                .platform-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 30px; border: 2px solid #ddd; border-radius: 16px; background: #fff; cursor: pointer; transition: all 0.25s; min-width: 120px; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
                .platform-btn:hover { border-color: #0077b6; transform: translateY(-4px); box-shadow: 0 6px 18px rgba(0,119,182,0.15); }
                .platform-btn.selected { border-color: #0077b6; background: linear-gradient(135deg, #e7f3ff, #cce4ff); transform: translateY(-4px); box-shadow: 0 6px 20px rgba(0,119,182,0.25); }
                .platform-btn.selected .platform-name { color: #0056b3; }
                .platform-icon { display: flex; align-items: center; justify-content: center; }
                .platform-name { font-weight: bold; font-size: 0.95rem; color: #333; }
                .selection-counter { position: absolute; top: -8px; right: -8px; background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2px solid white; }

                .user-form-container { width: 100%; margin-top: 2.5rem; padding: 0; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6; box-sizing: border-box; overflow: hidden; }

                .tabs-container { display: flex; background-color: #e9ecef; border-bottom: 1px solid #dee2e6; }
                .tab-btn { padding: 12px 18px; background: none; border: none; cursor: pointer; font-size: 1rem; color: #555; position: relative; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; border-bottom: 3px solid transparent; transition: all 0.2s; }
                .tab-btn .platform-name { margin-top: 0; }
                .tab-btn:hover { background-color: #dee2e6; }
                .tab-btn.active { color: #007bff; background: #fff; border-bottom: 3px solid #007bff; font-weight: bold; }
                .tab-error-indicator { position: absolute; top: 5px; right: 5px; background: #dc3545; color: white; width: 16px; height: 16px; border-radius: 50%; font-size: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .form-content { padding: 1.5rem; }

                .form-title { margin-top: 0; margin-bottom: 1.5rem; color: #333; text-align: center; font-size: 1.5rem; }
                .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
                .form-group { display: flex; flex-direction: column; }
                .form-group.full-width { grid-column: 1 / -1; }
                .form-group label { margin-bottom: 0.5rem; font-weight: 500; color: #555; display: flex; align-items: center; gap: 0.5rem; }
                .form-group input, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
                .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25); }
                /* Tooltip de error */
.input-tooltip-wrapper { position: relative; width: 100%; }

.input-error { border-color: #dc3545 !important; box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15) !important; }

.error-tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 0;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: #fff;
    font-size: 0.82rem;
    font-weight: 500;
    padding: 8px 12px 8px 10px;
    border-radius: 8px;
    border-left: 3px solid #0077b6;
    white-space: nowrap;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 16px rgba(0, 119, 182, 0.35);
    animation: tooltipFadeIn 0.18s ease;
    pointer-events: none;
}

.error-tooltip-arrow {
    position: absolute;
    bottom: -6px;
    left: 14px;
    width: 10px;
    height: 10px;
    background: #1a1a2e;
    border-right: 3px solid #0077b6;
    border-bottom: 3px solid #0077b6;
    transform: rotate(45deg);
    border-radius: 0 0 3px 0;
}

.error-tooltip-icon { font-size: 0.9rem; color: #f0a500; flex-shrink: 0; }

.error-inline-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #dc3545;
    font-size: 1rem;
    cursor: pointer;
    line-height: 1;
}

@keyframes tooltipFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
}

                .action-buttons { margin-top: 2.5rem; display: flex; justify-content: space-between; gap: 1rem; }
                .no-rounded-button { padding: 12px 24px; border-radius: 8px; border: none; font-size: 1rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .no-rounded-button:first-of-type { background-color: #0077b6; color: white; }
                .no-rounded-button:first-of-type:hover { background-color: #0077b6; }
                .no-rounded-button:last-of-type { background-color: #0077b6; color: white; }
                .no-rounded-button:last-of-type:hover { background-color: #0077b6; }
                .no-rounded-button:disabled { background: #e9ecef; color: #6c757d; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default Platform;