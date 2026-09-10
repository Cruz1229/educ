import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, Download, Layers, Tag, FileText,
    Calendar, Monitor, Shapes, Puzzle, Type, Clock, List,
    Play, Info, RotateCcw, ArrowRight, HelpCircle, User
} from 'lucide-react';

// Icono de configuración
const IconConfigure = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"></path>
    </svg>
);

// --- ESTILOS COMPARTIDOS (Idénticos a Acertijo.jsx) ---
const Style = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap');
    
    /* --- ESTILOS GENERALES --- */
    :root {
      --primary-color: #0077b6;
      --secondary-color: #1f2937;
      --light-gray-color: #f3f4f6;
      --medium-gray-color: #d1d5db;
      --dark-gray-color: #4b5563;
      --correct-color: #22c55e;
      --wrong-color: #ef4444;
      --light-text: #ffffff;
      --dark-text: #111827;
      --border-radius: 0.5rem;
      --box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    body {
        background-color: #f0f2f5;
        margin: 0;
    }

    .acertijo-container {
      background: var(--light-text);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 2rem;
      width: 100%;
      max-width: 950px;
      margin: 20px auto;
      color: var(--dark-text);
      min-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    /* --- TÍTULO ANIMADO --- */
    .game-title {
        text-align: center;
        font-size: 3rem;
        font-weight: 700;
        color: var(--secondary-color);
        margin-bottom: 0.5rem;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }

    .game-title span {
        display: inline-block;
        animation: wave-animation 1.8s infinite;
        position: relative;
    }

    @keyframes wave-animation {
        0%, 40%, 100% { transform: translateY(0); }
        20% { transform: translateY(-20px); }
    }

    /* --- PANTALLA DE CONFIGURACIÓN --- */
    .config-screen {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      flex-grow: 1;
    }
    
    .rules-text {
        text-align: center;
        color: var(--dark-gray-color);
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--medium-gray-color);
        margin-top: 1rem;
    }
    .rules-text h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
    }

    .config-controls {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      align-items: end;
      margin-bottom: 1rem;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      text-align: left;
      gap: 0.5rem;
    }
    .control-group label {
      font-weight: 500;
      color: var(--dark-gray-color);
    }
    .control-group select {
      padding: 0.75rem;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      font-size: 1rem;
      background: white;
    }

    /* --- GRID DE SELECCIÓN --- */
    .riddle-catalog {
        border: 1px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        padding: 1.5rem;
        flex-grow: 1;
        overflow-y: auto;
        max-height: 500px;
        background: #fafafa;
    }
    
    .riddle-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }

    .riddle-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 0.75rem;
    }

    .acertijo-select-btn {
        background: white;
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid var(--medium-gray-color);
        transition: all 0.2s ease;
        text-align: left;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;
        width: 100%;
        color: var(--dark-text);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    
    .acertijo-select-btn:hover {
        background-color: var(--light-gray-color);
        border-color: var(--primary-color);
    }

    .acertijo-select-btn.selected {
        background-color: #e0f2fe; 
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
    }

    /* --- BOTONES DEL FOOTER DE CONFIGURACIÓN --- */
     .config-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 2rem;
        border-top: 1px solid var(--medium-gray-color);
        padding-top: 1.5rem;
    }
    
    .no-rounded-button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
    }
    .no-rounded-button:hover {
        background-color: #0077b6;
        color: white;
    }
    .no-rounded-button:disabled {
        background-color: var(--medium-gray-color);
        color: #9ca3af;
        cursor: not-allowed;
        opacity: 0.7;
        pointer-events: none;
    }

    /* --- ESTILOS DEL JUEGO (GAME UI) --- */
    .game-screen {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .clue-text {
        text-align: center;
        color: var(--dark-gray-color);
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
    }

    .game-layout {
        display: grid;
        grid-template-columns: 1fr 280px; 
        gap: 2rem;
        width: 100%;
        align-items: start;
    }
    
    .game-left-col {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .game-right-col {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .stats-block {
        border: 1px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        padding: 1rem;
        text-align: left;
        background: white;
    }
    .stats-block h3 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        color: var(--secondary-color);
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--medium-gray-color);
    }
    .stats-item {
        margin-bottom: 0.75rem;
        font-size: 1rem;
        display: flex;
        justify-content: space-between;
    }
    .stats-item strong {
        font-weight: 700;
        color: var(--dark-text);
    }
    
    .question-card {
        background: white;
        padding: 1.5rem; 
        border-radius: 1rem; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
        text-align: center; 
        border: 1px solid var(--medium-gray-color);
        margin-bottom: 1rem;
    }

    .question-text {
        font-family: 'Merriweather', serif; 
        font-size: 1.3rem; 
        color: var(--secondary-color); 
        line-height: 1.5;
        margin-top: 1rem;
    }

    .topic-badge {
        background: #e0f2fe; 
        color: var(--primary-color); 
        padding: 0.25rem 1rem; 
        border-radius: 2rem; 
        font-weight: 700; 
        font-size: 0.8rem; 
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .btn-primary {
        background-color: var(--primary-color);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: var(--border-radius);
        font-weight: 600;
        border: none;
        cursor: pointer;
        width: 100%;
        transition: background 0.2s;
    }
    .btn-primary:hover {
        background-color: #005f92;
    }

    /* --- ESTILOS ESPECIFICOS DIAGRAMAS --- */
    .flow-drop-zone {
        min-height: 300px;
        background: #fff;
        border: 2px dashed var(--medium-gray-color);
        border-radius: 1rem;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }
    
    .draggable-source-container {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        padding: 1rem;
        background: #f9fafb;
        border: 1px solid var(--medium-gray-color);
        border-radius: 0.5rem;
    }

    .draggable-item {
        background: white;
        border: 1px solid var(--medium-gray-color);
        padding: 0.75rem;
        border-radius: 0.5rem;
        cursor: grab;
        text-align: center;
        font-weight: 600;
        color: var(--dark-text);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        transition: all 0.2s;
    }
    .draggable-item:hover {
        border-color: var(--primary-color);
        transform: translateY(-2px);
    }
    .draggable-item:active {
        cursor: grabbing;
    }

    .flow-node-endpoint {
        background-color: var(--primary-color);
        color: white;
        padding: 10px 30px;
        border-radius: 2rem;
        font-weight: 700;
        display: inline-block;
        min-width: 100px;
        text-align: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .flow-slot-empty {
        width: 100%;
        max-width: 300px;
        height: 3.5rem;
        border: 2px dashed #9ca3af;
        background-color: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        color: #9ca3af;
        font-size: 0.9rem;
    }
    
    .flow-shape-process {
        width: 100%;
        max-width: 300px;
        height: 3.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border-radius: 0.5rem;
        background: white;
        border: 2px solid var(--dark-gray-color);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .flow-shape-data {
        width: 90%;
        max-width: 280px;
        height: 3.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border-radius: 0.5rem;
        background: white;
        border: 2px solid var(--dark-gray-color);
        transform: skew(-15deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .flow-text-fix {
        transform: skew(15deg);
        width: 100%;
        text-align: center;
    }

    .nav-footer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1.5rem;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--medium-gray-color);
        width: 100%;
    }

    @media (max-width: 900px) {
        .config-controls, .game-layout { grid-template-columns: 1fr; }
        .game-layout { gap: 1rem; }
    }
    `}</style>
);

// --- ESTILOS DE SUMMARY ---
const summaryStyles = `
    .summary-screen {
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem;
        background: #ffffff;
        color: #1f2937;
    }
    .selection-title {
        text-align: center;
        color: #005f92;
        margin-bottom: 2rem;
        font-size: 2rem;
        font-weight: 700;
    }
    .rules-text {
        text-align: center;
        color: #6b7280;
        margin-bottom: 2rem;
        font-size: 1.1rem;
    }
    .summary-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        border: 1px solid #e5e7eb;
        margin-top: 2rem;
    }
    .summary-row {
        display: flex;
        flex-direction: row; 
        align-items: center; 
        gap: 0.5rem;
        justify-content: flex-start; 
        white-space: nowrap;
    }
    .download-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        margin-top: 3rem;
        padding: 2rem;
        background: #f8fafc;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
    }
    .btn-primary-summary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        background: #005f92;
        color: white;
        font-size: 1rem;
    }
    .btn-primary-summary:hover:not(:disabled) {
        background: #004a73;
        transform: translateY(-1px);
    }
    .btn-primary-summary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .btn-success {
        background: #005f92;
    }
    .btn-success:hover:not(:disabled) {
        background: #004a73;
    }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .info-card { 
        background: white; 
        padding: 1.25rem; 
        border-radius: 0.75rem; 
        box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
        border: 1px solid #f1f5f9; 
        display: flex; 
        flex-direction: column; 
        gap: 0.5rem; 
    }
    .info-card-header { 
        display: flex; 
        align-items: center; 
        gap: 0.5rem; 
        color: #64748b; 
        font-size: 0.9rem; 
        font-weight: 600; 
        text-transform: uppercase; 
        letter-spacing: 0.05em; 
        width: 100%;
    }
    .info-card-value { 
        font-size: 1.1rem; 
        color: #334155; 
        font-weight: 500; 
        text-align: center; 
        width: 100%;
    }
    .full-width { grid-column: 1 / -1; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
`;

// --- DATOS DEL JUEGO ---
const TODOS_LOS_PROBLEMAS = [
    // NIVEL BÁSICO - Usos e implicaciones de la energía
    {
        id: 'b1',
        titulo: 'Hacer funcionar un ventilador eléctrico',
        nivel: 'Básico',
        opciones: ['El motor convierte la energía eléctrica en movimiento', 'Conectar el cable a la corriente', 'El ventilador empieza a girar', 'Encender el botón de velocidad'],
        solucion: ['Conectar el cable a la corriente', 'Encender el botón de velocidad', 'El motor convierte la energía eléctrica en movimiento', 'El ventilador empieza a girar'],
        plantilla: [0, 0, 0, 0]
    },
    {
        id: 'b2',
        titulo: 'Cargar celular con energía solar',
        nivel: 'Básico',
        opciones: ['El celular empieza a cargarse', 'Colocar el panel solar bajo el Sol', 'Conectar el cargador solar al celular', 'El panel convierte la energía solar en eléctrica'],
        solucion: ['Colocar el panel solar bajo el Sol', 'El panel convierte la energía solar en eléctrica', 'Conectar el cargador solar al celular', 'El celular empieza a cargarse'],
        plantilla: [0, 0, 0, 0]
    },
    {
        id: 'b3',
        titulo: 'Encender un automóvil',
        nivel: 'Básico',
        opciones: ['Las llantas comienzan a moverse', 'La energía química se transforma en energía mecánica', 'Girar la llave de encendido', 'El combustible se quema en el motor'],
        solucion: ['Girar la llave de encendido', 'El combustible se quema en el motor', 'La energía química se transforma en energía mecánica', 'Las llantas comienzan a moverse'],
        plantilla: [0, 0, 0, 0]
    },
    {
        id: 'b4',
        titulo: 'Generar energía con molino de viento',
        nivel: 'Básico',
        opciones: ['Se usa para encender un foco', 'El viento mueve las aspas del molino', 'La energía se envía por cables', 'El generador convierte el movimiento en energía eléctrica'],
        solucion: ['El viento mueve las aspas del molino', 'El generador convierte el movimiento en energía eléctrica', 'La energía se envía por cables', 'Se usa para encender un foco'],
        plantilla: [0, 0, 0, 0]
    },
    {
        id: 'b5',
        titulo: 'Encender foco con circuito sencillo',
        nivel: 'Básico',
        opciones: ['El foco se enciende', 'Asegurar que el interruptor esté cerrado', 'La corriente fluye hacia el foco', 'Conectar la pila al foco con los cables'],
        solucion: ['Conectar la pila al foco con los cables', 'Asegurar que el interruptor esté cerrado', 'La corriente fluye hacia el foco', 'El foco se enciende'],
        plantilla: [0, 0, 0, 0]
    },

    // NIVEL INTERMEDIO - Sistemas de control automático
    {
        id: 'i1',
        titulo: 'Semáforo inteligente',
        nivel: 'Intermedio',
        opciones: ['Cambiar a luz amarilla (precaución)', 'Luz verde encendida (autos avanzan)', 'Encender sistema de control', 'Cambiar a luz roja (autos se detienen)'],
        solucion: ['Encender sistema de control', 'Luz verde encendida (autos avanzan)', 'Cambiar a luz amarilla (precaución)', 'Cambiar a luz roja (autos se detienen)'],
        plantilla: [1, 0, 0, 0]
    },
    {
        id: 'i2',
        titulo: 'Encender regadera automática',
        nivel: 'Intermedio',
        opciones: ['Al salir la persona, el sistema cierra la válvula', 'Sistema abre la válvula de agua', 'El agua fluye por la regadera', 'Sensor detecta movimiento de las personas'],
        solucion: ['Sensor detecta movimiento de las personas', 'Sistema abre la válvula de agua', 'El agua fluye por la regadera', 'Al salir la persona, el sistema cierra la válvula'],
        plantilla: [1, 0, 0, 0]
    },
    {
        id: 'i3',
        titulo: 'Regular temperatura con termostato',
        nivel: 'Intermedio',
        opciones: ['Si hace calor, apagar calefacción', 'Comparar con temperatura deseada', 'Leer temperatura actual', 'Si hace frío, encender calefacción'],
        solucion: ['Leer temperatura actual', 'Comparar con temperatura deseada', 'Si hace frío, encender calefacción', 'Si hace calor, apagar calefacción'],
        plantilla: [1, 0, 0, 0]
    },
    {
        id: 'i4',
        titulo: 'Iluminación automática en casa',
        nivel: 'Intermedio',
        opciones: ['Si no hay movimiento, las luces se apagan', 'Luces se encienden automáticamente', 'Sensor de movimiento detecta presencia', 'Enviar señal al sistema de luces'],
        solucion: ['Sensor de movimiento detecta presencia', 'Enviar señal al sistema de luces', 'Luces se encienden automáticamente', 'Si no hay movimiento, las luces se apagan'],
        plantilla: [1, 0, 0, 0]
    },
    {
        id: 'i5',
        titulo: 'Sistema contra incendios',
        nivel: 'Intermedio',
        opciones: ['Apagar el fuego y cerrar válvulas', 'Activar alarma de emergencia', 'Abrir válvulas de aspersores', 'Sensor detecta humo o aumento de temperatura'],
        solucion: ['Sensor detecta humo o aumento de temperatura', 'Activar alarma de emergencia', 'Abrir válvulas de aspersores', 'Apagar el fuego y cerrar válvulas'],
        plantilla: [1, 0, 0, 0]
    },
    {
        id: 'i6',
        titulo: 'Cruce peatonal automatizado',
        nivel: 'Intermedio',
        opciones: ['Después de unos segundos, vuelve a luz verde para autos', 'Luz verde para peatones', 'Peatón presiona el botón de cruce', 'Luz roja para autos'],
        solucion: ['Peatón presiona el botón de cruce', 'Luz roja para autos', 'Luz verde para peatones', 'Después de unos segundos, vuelve a luz verde para autos'],
        plantilla: [1, 0, 0, 0]
    },

    // NIVEL AVANZADO - Herramientas, máquinas e instrumentos
    {
        id: 'a1',
        titulo: 'Lavadora automática',
        nivel: 'Avanzado',
        opciones: ['Centrifugar y apagar el sistema', 'Llenar el tanque con agua', 'Enjuagar la ropa', 'Activar el ciclo de lavado'],
        solucion: ['Llenar el tanque con agua', 'Activar el ciclo de lavado', 'Enjuagar la ropa', 'Centrifugar y apagar el sistema'],
        plantilla: [1, 0, 0, 0]
    },
    {
        id: 'a2',
        titulo: 'Tostadora automática para preparar desayuno',
        nivel: 'Avanzado',
        opciones: ['Saltar el pan automáticamente al finalizar', 'Insertar el pan en las ranuras', 'Las resistencias calientan el pan', 'Activar el nivel de tostado'],
        solucion: ['Insertar el pan en las ranuras', 'Activar el nivel de tostado', 'Las resistencias calientan el pan', 'Saltar el pan automáticamente al finalizar'],
        plantilla: [1, 0, 0, 0]
    },
    {
        id: 'a3',
        titulo: 'Cafetera programable',
        nivel: 'Avanzado',
        opciones: ['Servir el café en la jarra', 'Programar hora de inicio', 'Pasar el agua caliente por el café molido', 'Calentar el agua'],
        solucion: ['Programar hora de inicio', 'Calentar el agua', 'Pasar el agua caliente por el café molido', 'Servir el café en la jarra'],
        plantilla: [1, 0, 0, 0]
    },
    {
        id: 'a4',
        titulo: 'Refrigerador con control automático',
        nivel: 'Avanzado',
        opciones: ['Apagar compresor al alcanzar temperatura deseada', 'Medir temperatura interna', 'Activar compresor si hace calor', 'Comparar con temperatura configurada'],
        solucion: ['Medir temperatura interna', 'Comparar con temperatura configurada', 'Activar compresor si hace calor', 'Apagar compresor al alcanzar temperatura deseada'],
        plantilla: [1, 1, 0, 0]
    },
    {
        id: 'a5',
        titulo: 'Lavavajillas automático',
        nivel: 'Avanzado',
        opciones: ['Apagar al finalizar el ciclo', 'Cargar los platos y cubiertos', 'Lavar, enjuagar y secar los utensilios', 'Seleccionar el programa de lavado'],
        solucion: ['Cargar los platos y cubiertos', 'Seleccionar el programa de lavado', 'Lavar, enjuagar y secar los utensilios', 'Apagar al finalizar el ciclo'],
        plantilla: [1, 0, 0, 0]
    },
    {
        id: 'a6',
        titulo: 'Horno eléctrico con temporizador',
        nivel: 'Avanzado',
        opciones: ['Apagar el horno al terminar el tiempo programado', 'Cocinar el alimento', 'Programar temperatura y tiempo', 'Encender las resistencias de calor'],
        solucion: ['Programar temperatura y tiempo', 'Encender las resistencias de calor', 'Cocinar el alimento', 'Apagar el horno al terminar el tiempo programado'],
        plantilla: [1, 0, 0, 0]
    },
    {
        id: 'a7',
        titulo: 'Aire acondicionado inteligente',
        nivel: 'Avanzado',
        opciones: ['Mantener temperatura constante', 'Leer temperatura del ambiente', 'Enfriar o calentar el aire', 'Comparar con temperatura deseada'],
        solucion: ['Leer temperatura del ambiente', 'Comparar con temperatura deseada', 'Enfriar o calentar el aire', 'Mantener temperatura constante'],
        plantilla: [1, 1, 0, 0]
    }
];

const CONFIG_NIVELES = {
    'Básico': { maxProblemas: 3, tiempo: 300 },
    'Intermedio': { maxProblemas: 4, tiempo: 600 },
    'Avanzado': { maxProblemas: 5, tiempo: 900 },
};

// --- GENERADOR HTML ---

// Agregar esta función después de las importaciones y antes del componente
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
const generateFlowchartHTML = (config, gameDetails, selectedPlatforms) => {
    // Si config no existe, usar valores por defecto
    if (!config) config = { difficulty: "Básico", timeLimit: 60, problems: [] };
    const rawDate = (() => {
        try {
            const stored = typeof localStorage !== 'undefined'
                ? localStorage.getItem('diagramasflujo:creation_date')
                : null;
            return stored || gameDetails?.date || new Date().toISOString();
        } catch { return gameDetails?.date || new Date().toISOString(); }
    })();
    const formattedDate = (() => {
        try {
            return new Date(rawDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Fecha no especificada'; }
    })();

    const platformsString = selectedPlatforms && selectedPlatforms.length > 0
        ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
        : 'Web';

    // Title HTML logic (ANIMATED FOR GAME UI) - Fixed title as requested
    const titleText = 'Juego de Diagramas de Flujo';
    const animatedTitleHTML = `
    <div class="game-title">
        ${'Juego de Diagrama de Flujo'.split('').map((char, index) =>
        `<span style="animation-delay: ${index * 0.07}s">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('')}
    </div>
`;

    // STATIC Title for start screen
    const staticTitleHTML = `
        <div class="game-title static">
            ${titleText.split('').map((char) =>
        `<span>${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('')}
        </div>
    `;

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${gameDetails.gameName || 'Diagramas de Flujo'} - ${config.difficulty}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root { 
            --primary-color: #005f92; 
            --secondary-color: #1f2937; 
            --light-gray: #f3f4f6;
            --medium-gray: #d1d5db; 
            --dark-gray: #4b5563; 
            --correct: #22c55e; 
            --wrong: #ef4444;
            --light-text: #ffffff; 
            --dark-text: #111827;
        }
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; display: flex; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 900px; display: flex; flex-direction: column; }
        
        .game-layout { display: grid; grid-template-columns: 1fr 250px; gap: 2rem; width: 100%; }
        @media (max-width: 768px) { .game-layout { grid-template-columns: 1fr; } }

        .question-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center; border: 1px solid var(--medium-gray); margin-bottom: 1.5rem; }
        .question-text { font-family: 'Merriweather', serif; font-size: 1.3rem; color: var(--secondary-color); margin-top: 1rem; }
        .topic-badge { background: #e0f2fe; color: var(--primary-color); padding: 0.25rem 1rem; border-radius: 2rem; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; }

        .flow-drop-zone { min-height: 300px; background: #fff; border: 2px dashed var(--medium-gray); border-radius: 1rem; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .draggable-source-container { display: flex; flex-direction: column; gap: 0.8rem; padding: 1rem; background: #f9fafb; border: 1px solid var(--medium-gray); border-radius: 0.5rem; margin-bottom: 1rem; }
        .draggable-item { 
            background: white; 
            border: 1px solid var(--medium-gray); 
            padding: 0.75rem; 
            border-radius: 0.5rem; 
            cursor: grab; 
            text-align: center; 
            font-weight: 600; 
            color: var(--dark-text); 
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            /* MEJORA: Evita selección de texto para drag & drop robusto */
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
        }
        .draggable-item:hover { border-color: var(--primary-color); transform: translateY(-2px); }
        .draggable-item:active { cursor: grabbing; }

        .flow-node-endpoint { background-color: var(--primary-color); color: white; padding: 10px 30px; border-radius: 2rem; font-weight: 700; display: inline-block; min-width: 100px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .flow-slot-empty { width: 100%; max-width: 300px; height: 3.5rem; border: 2px dashed #9ca3af; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; border-radius: 0.5rem; color: #9ca3af; font-size: 0.9rem; }
        .flow-shape-process { width: 100%; max-width: 300px; height: 3.5rem; display: flex; align-items: center; justify-content: center; padding: 0.5rem; border-radius: 0.5rem; background: white; border: 2px solid var(--dark-gray); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .flow-shape-data { width: 90%; max-width: 280px; height: 3.5rem; display: flex; align-items: center; justify-content: center; padding: 0.5rem; border-radius: 0.5rem; background: white; border: 2px solid var(--dark-gray); transform: skew(-15deg); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .flow-text-fix { transform: skew(15deg); width: 100%; text-align: center; }
        .flow-arrow { font-size: 24px; color: var(--medium-gray); margin: 0; line-height: 1; }

        .stats-block { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; height: fit-content; background: white; }
        .stats-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); }
        .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
        .stats-item strong { font-weight: 700; color: var(--dark-text); }

        .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; color: white; transition: background 0.2s; }
        .btn-primary { background: var(--primary-color); }
        .btn-primary:hover { background: #005f92; }
        
        /* Overlays */
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; transition: opacity 0.3s; padding: 20px; box-sizing: border-box; }
        .hidden { display: none !important; opacity: 0; pointer-events: none; }
        
        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; min-width: 200px; }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        
        .btn-exit { background: #1f2937; }
        .btn-retry { background: var(--primary-color); }
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }
        
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        /* Animated Title */
        .game-title { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1rem; display: flex; justify-content: center; flex-wrap: wrap; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; position: relative; }
        .game-title.static span { animation: none; transform: none; }
        @keyframes wave-animation { 0%, 40%, 100% { transform: translateY(0); } 20% { transform: translateY(-20px); } }

        /* Modal Info */
        .info-modal-content { background: white; padding: 2.5rem; border-radius: 1rem; max-width: 600px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; position: relative; }
        .info-header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .info-title { font-size: 1.8rem; color: var(--primary-color); margin: 0; font-weight: 800; }
        .info-subtitle { color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; }
        .info-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
        .info-item { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .info-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem; font-weight: 600; }
        .info-value { font-size: 1.1rem; color: #334155; font-weight: 500; }
        .info-desc { grid-column: 1 / -1; background: #fff; padding: 0; border: none; }
        .close-info-btn { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
    </style>
</head>
<body>
    <div id="start-screen" class="overlay">
    <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">Diagramas de Flujo</h2>

        <div style="background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">
            Nivel: ${config.difficulty}
        </div>
       
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <button class="big-btn" onclick="startGameSequence()">▶ Iniciar Juego</button>
            <button class="big-btn btn-info" onclick="toggleInfo(true)">ℹ Información</button>
        </div>
    </div>

    <div id="countdown-screen" class="overlay hidden">
        <div id="countdown-display" class="countdown-number">5</div>
    </div>

    <div id="info-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">Diagramas de Flujo</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
            </div>
            <div class="info-details-grid">
            <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${gameDetails.authorName || 'No especificado'}</span></div>

                <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${gameDetails.version || '1.0.0'}</span></div>
                <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${platformsString}</span></div>
                <div class="info-item"><span class="info-label">Dificultad</span><span class="info-value">${config.difficulty}</span></div>
                <div class="info-item info-desc">
                    <span class="info-label">Descripción</span>
                    <p class="info-value" style="font-size:1rem; color:#475569;">${gameDetails.description || 'Sin descripción disponible.'}</p>
                </div>
            </div>
            <div style="text-align: center;"><button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem;" onclick="toggleInfo(false)">Cerrar</button></div>
        </div>
    </div>

    <div id="end-screen" class="overlay hidden">
        <h1 id="end-title" style="color:var(--primary-color); font-size:3rem; font-weight: 800;">Fin del Juego</h1>
        <h2 style="color:var(--secondary-color); font-size:2rem; margin:1rem 0;">Puntos Obtenidos: <span id="final-score">0</span></h2>
        <div class="end-buttons">
             <button class="big-btn btn-exit" onclick="window.close()">Salir</button>
             <button class="big-btn btn-retry" onclick="location.reload()">Volver a Jugar</button>
        </div>
    </div>

    <div class="container hidden" id="game-ui">
        ${animatedTitleHTML}
          <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
    <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
    <span style="font-size:1rem; color:#1e40af; font-weight:500;">Arrastra las instrucciones al diagrama de flujo en el orden adecuado.</span>
</div>
        <div class="game-layout">
            <div class="game-left-col">
                 <div class="question-card">
                    <span class="topic-badge">Problemática</span>
                    <h2 class="question-text" id="question">Cargando...</h2>
                </div>
                
                <div id="flow-container" class="flow-drop-zone">
                     <!-- Slots generated here -->
                </div>
            </div>

            <div class="game-right-col">
                <div class="stats-block">
                    <h3>Progreso</h3>
                    <div class="stats-item"><span>Nivel:</span> <strong>${config.difficulty}</strong></div>
                    <div class="stats-item"><span>Tiempo Límite:</span> <strong id="timer">${formatTime(config.timeLimit)}</strong></div>
                    <div class="stats-item"><span>Puntaje:</span> <strong id="score">0</strong></div>
                    <div class="stats-item"><span>Problema:</span> <strong id="progress">1/${config.problems.length}</strong></div>
                </div>

                <div class="draggable-source-container" id="source-container" ondragover="allowDrop(event)" ondrop="drop(event, 'source')">
                    <!-- Options generated here -->
                </div>

                <button class="btn btn-primary" onclick="checkAnswer()">Validar Solución</button>
                <button class="btn btn-primary" style="margin-top: 10px;" onclick="finishGame(false)">Finalizar Juego</button>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        let state = { currentIdx: 0, score: 0, timeLeft: config.timeLimit, timer: null };
        let currentProblem = null;
        let slots = [];
        let sourceOptions = [];
        let draggedContent = null;

        function toggleInfo(show) {
            const el = document.getElementById('info-overlay');
            if(show) { el.classList.remove('hidden'); el.style.display = 'flex'; }
            else { el.classList.add('hidden'); setTimeout(()=>el.style.display='none',300); }
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const disp = document.getElementById('countdown-display');
            disp.innerText = count;
            const int = setInterval(() => {
                count--;
                if(count > 0) {
                    disp.innerText = count;
                    disp.style.animation = 'none';
                    disp.offsetHeight; 
                    disp.style.animation = 'popIn 0.5s ease-out';
                } else {
                    clearInterval(int);
                    document.getElementById('countdown-screen').classList.add('hidden');
                    startGame();
                }
            }, 1000);
        }

        function startGame() {
            document.getElementById('game-ui').classList.remove('hidden');
            loadProblem();
            state.timer = setInterval(() => {
    state.timeLeft--;
    const mins = Math.floor(state.timeLeft / 60);
    const secs = state.timeLeft % 60;
    document.getElementById('timer').innerText = mins + ':' + secs.toString().padStart(2, '0');
    if(state.timeLeft <= 0) {
                    clearInterval(state.timer);
                    Swal.fire({ title: '¡Tiempo agotado!', icon: 'warning' }).then(() => finishGame(false));
                }
            }, 1000);
        }

        function loadProblem() {
    if(state.currentIdx >= config.problems.length) return finishGame(true);
    
    currentProblem = config.problems[state.currentIdx];
    document.getElementById('question').innerText = currentProblem.titulo;
    document.getElementById('progress').innerText = (state.currentIdx + 1) + '/' + config.problems.length;
    
    // Render Slots
    const flowCont = document.getElementById('flow-container');
    flowCont.innerHTML = '<div class="flow-node-endpoint">Inicio</div>';
    
    slots = new Array(currentProblem.solucion.length).fill(null);
    
    currentProblem.solucion.forEach((_, i) => {
        const arrow = document.createElement('div');
        arrow.className = 'flow-arrow'; 
        arrow.innerHTML = '↓';
        flowCont.appendChild(arrow);
        
        const slot = document.createElement('div');
        slot.className = 'flow-slot-empty';
        slot.id = 'slot-'+i;
        slot.innerText = 'Arrastra aquí';
        
        // IMPORTANTE: Usar setAttribute para ondragover y ondrop
        slot.setAttribute('ondragover', 'event.preventDefault(); event.dataTransfer.dropEffect = "copy";');
        slot.setAttribute('ondrop', 'handleDrop(event, ' + i + ')');
        
        flowCont.appendChild(slot);
    });
    
    const endArrow = document.createElement('div');
    endArrow.className = 'flow-arrow'; 
    endArrow.innerHTML = '↓';
    flowCont.appendChild(endArrow);
    flowCont.innerHTML += '<div class="flow-node-endpoint">Fin</div>';

    // Render Options
    const sourceCont = document.getElementById('source-container');
    sourceCont.innerHTML = '';
    sourceOptions = [...currentProblem.opciones].sort(() => Math.random() - 0.5);
    
    sourceOptions.forEach((opt, i) => {
        const el = document.createElement('div');
        el.className = 'draggable-item';
        el.draggable = true;
        el.id = 'opt-'+i;
        el.innerText = opt;
        
        // IMPORTANTE: Usar setAttribute para ondragstart
        el.setAttribute('ondragstart', 'handleDragStart(event, "' + opt.replace(/"/g, '&quot;') + '")');
        
        sourceCont.appendChild(el);
    });
}

function handleDragStart(e, text) {
    draggedContent = text;
    e.dataTransfer.setData('text/plain', text);
    e.dataTransfer.effectAllowed = 'copy';
}

function handleDrop(e, slotIndex) {
    e.preventDefault();
    const content = e.dataTransfer.getData('text/plain') || draggedContent;
    
    if(!content) return;
    
    const targetSlot = document.getElementById('slot-'+slotIndex);
    const shapeClass = currentProblem.plantilla[slotIndex] === 1 ? 'flow-shape-data' : 'flow-shape-process';
    
    targetSlot.className = shapeClass;
    targetSlot.innerHTML = '';
    
    const textDiv = document.createElement('div');
    textDiv.className = currentProblem.plantilla[slotIndex] === 1 ? 'flow-text-fix' : '';
    textDiv.innerText = content;
    targetSlot.appendChild(textDiv);
    
    slots[slotIndex] = content;
    
    // NO eliminar del contenedor fuente - comentado para permitir reutilización
    // const sourceItems = document.querySelectorAll('#source-container .draggable-item');
    // sourceItems.forEach(item => {
    //     if(item.innerText === content) {
    //         item.remove();
    //     }
    // });
    
    draggedContent = null;
}

        function checkAnswer() {
             if(slots.some(s => s === null)) {
                 Swal.fire('Incompleto', 'Llena todos los espacios', 'warning');
                 return;
             }
             
             if(JSON.stringify(slots) === JSON.stringify(currentProblem.solucion)) {
                 state.score += 10;
                 document.getElementById('score').innerText = state.score;
                 Swal.fire({ title: '¡Correcto!', icon: 'success', timer: 1000, showConfirmButton: false }).then(() => {
                     state.currentIdx++;
                     loadProblem();
                 });
             } else {
                 Swal.fire('Incorrecto', 'El orden no es correcto', 'error');
             }
        }

        function finishGame(completed) {
            clearInterval(state.timer);
            document.getElementById('game-ui').classList.add('hidden');
            document.getElementById('end-screen').classList.remove('hidden');
            document.getElementById('final-score').innerText = state.score;
            document.getElementById('end-title').innerText = completed ? "¡Juego Completado!" : "Fin del Juego";
        }
    </script>
        
</body>
</html>`;
};
// --- ANDROID: CONFIGURACIÓN Y GENERACIÓN DE APPLICATION ID ÚNICO ---
const ANDROID_BUILD_GRADLE_PATH = "android/app/build.gradle";
const CAPACITOR_CONFIG_PATH = "android/app/src/main/assets/capacitor.config.json";
const ANDROID_STRINGS_PATH = "android/app/src/main/res/values/strings.xml";
const DIAGRAMAS_APPLICATION_ID_BASE = "io.diagramasflujo.steam";

const createUuidSegment = () => {
    const rawUuid = window.crypto?.randomUUID?.()
        || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    return `uuid_${uuid}`;
};

const buildDiagramasApplicationId = () => {
    return `${DIAGRAMAS_APPLICATION_ID_BASE}.${createUuidSegment()}`;
};

const escapeXmlValue = (str) => str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
// Normaliza un texto: minúsculas, sin acentos, espacios → guión bajo
const normalizeFileName = (str) =>
    (str || '')
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");

// Mapea el nombre de plataforma a su etiqueta en el ZIP
const platformLabel = (p) => {
    const val = p.toLowerCase();
    if (val === 'web') return 'web';
    return 'movil'; // android, ios, mobile → siempre "movil"
};

const updateZipTextFile = async (zip, filePath, updateContent) => {
    const file = zip.file(filePath);
    if (!file) throw new Error(`No se encontro ${filePath} en la plantilla Android`);
    const currentContent = await file.async("string");
    zip.file(filePath, updateContent(currentContent));
};

const applyDiagramasAndroidMetadata = async (zip, { applicationId }) => {
    await updateZipTextFile(zip, ANDROID_BUILD_GRADLE_PATH, (content) => content
        .replace(/applicationId\s+["'][^"']+["']/, `applicationId "${applicationId}"`));

    await updateZipTextFile(zip, CAPACITOR_CONFIG_PATH, (content) => {
        try {
            const capacitorConfig = JSON.parse(content);
            return JSON.stringify({ ...capacitorConfig, appId: applicationId }, null, 2);
        } catch {
            return content.replace(/"appId"\s*:\s*"[^"]*"/, `"appId": ${JSON.stringify(applicationId)}`);
        }
    });

    await updateZipTextFile(zip, ANDROID_STRINGS_PATH, (content) => content
        .replace(/<string name="package_name">[^<]*<\/string>/, `<string name="package_name">${escapeXmlValue(applicationId)}</string>`)
        .replace(/<string name="custom_url_scheme">[^<]*<\/string>/, `<string name="custom_url_scheme">${escapeXmlValue(applicationId)}</string>`));
};
// --- COMPONENTE SUMMARY (Restaurado) ---
const Summary = ({ config, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const [jsZipReady, setJsZipReady] = useState(false);

    const location = useLocation();
    const state = location.state || {};

    // MOCK DATA for preview
    const MOCK_DATA = {
        selectedAreas: ['science', 'technology'],
        selectedSkills: ['Lógica', 'Secuenciación'],
        gameDetails: {
            gameName: "Juego de Diagramas",
            description: "Ordena los procesos lógicos correctamente.",
            version: "1.0.0",
            date: null
        },
        selectedPlatforms: ['web']
    };

    const getFixedCreationDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    };

    const {
        selectedAreas = MOCK_DATA.selectedAreas,
        selectedSkills = MOCK_DATA.selectedSkills,
        gameDetails: rawGameDetails = MOCK_DATA.gameDetails,
        selectedPlatforms = MOCK_DATA.selectedPlatforms
    } = state;

    const gameDetails = { ...(rawGameDetails || MOCK_DATA.gameDetails), date: getFixedCreationDate() };

    useEffect(() => {
        if (window.JSZip) { setJsZipReady(true); return; }
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.async = true;
        script.onload = () => setJsZipReady(true);
        document.body.appendChild(script);
        return () => { if (document.body.contains(script)) document.body.removeChild(script); }
    }, []);

    const handleDownloadZip = () => {
        if (isGenerating || !jsZipReady) return;
        setIsGenerating(true); setProgress(0); setStatusText("Iniciando...");
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 10) + 2;
            if (currentProgress >= 90) {
                clearInterval(interval); setStatusText("Procesando recursos..."); generateAndDownloadZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Generando código HTML...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Incrustando imágenes...");
                setProgress(currentProgress);
            }
        }, 200);
    };

    const generateAndDownloadZip = async () => {
        try {
            const zip = new window.JSZip();
            const htmlContent = generateFlowchartHTML(config, gameDetails, selectedPlatforms);

            const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'diagramas_flujo')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            zip.file(htmlFileName, htmlContent);

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'diagramas_flujo')}_web.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setProgress(100); setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error("Error:", error); setStatusText("Error al generar."); setIsGenerating(false);
        }
    };

    // ── Descarga ZIP Android (Capacitor) ──────────────────────────────────────
    const handleDownloadAndroidZip = () => {
        if (isGenerating || !jsZipReady) return;
        setIsGenerating(true); setProgress(0); setStatusText("Iniciando...");
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 8) + 4;
            if (currentProgress >= 90) {
                clearInterval(interval);
                setStatusText("Inyectando recursos en Android...");
                generateAndDownloadAndroidZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Descargando plantilla Android...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando diagramas...");
                setProgress(currentProgress);
            }
        }, 150);
    };

    const generateAndDownloadAndroidZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        try {
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/diagramas_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Procesando archivos ZIP...");
            const zipOriginal = await window.JSZip.loadAsync(arrayBuffer);

            setStatusText("Inyectando configuración...");

            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];

            // Nivel normalizado — normalizarNivelConfig en Diagrama.tsx acepta 'basico'/'intermedio'/'avanzado'
            const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
            const nivelKey = nivelMap[config.difficulty] || config.difficulty?.toLowerCase() || 'basico';

            // Construir diagramas como objetos DiagramaJSON completos
            // Diagrama.tsx los procesa en: id, titulo, opciones (barajados), solucion (orden correcto)
            // Diagrama.tsx solo usa: id, titulo, solucion (→ bloquesOrdenados)
            // Las opciones las baraja internamente con shuffleArray — NO enviarlas desde aquí
            // p.solucion ya tiene el array de pasos correcto — es la propiedad directa del objeto
            const diagramasCompletos = config.problems.map(p => ({
                id: p.id,
                titulo: p.titulo || p.id,
                solucion: Array.isArray(p.solucion) ? p.solucion : [],
                opciones: Array.isArray(p.solucion) ? p.solucion : []
            }));

            const fullConfig = {
                nivel: nivelKey,
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                // YYYY-MM-DD para que formatearFechaLarga() de Diagrama.tsx haga split("-")
                fecha: details.date
                    ? details.date.split('T')[0]
                    : new Date().toISOString().split('T')[0],
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Diagramas de Flujo',
                nombreJuego: details.gameName || 'Diagramas de Flujo',
                plataformas: selectedPlats,
                // diagramas como objetos completos — Diagrama.tsx los convierte en EscenarioFlujo
                diagramas: diagramasCompletos
                // NO enviar diagramasIds — si se envían ambos, diagramas tiene prioridad
            };

            const androidApplicationId = buildDiagramasApplicationId();
            zipOriginal.file(
                "android/app/src/main/assets/public/config/diagramas-config.json",
                JSON.stringify(fullConfig, null, 2)
            );
            await applyDiagramasAndroidMetadata(zipOriginal, { applicationId: androidApplicationId });


            setStatusText("Generando paquete final...");
            const blob = await zipOriginal.generateAsync({
                type: "blob",
                platform: "UNIX"
            });

            const platformsSuffix = (Array.isArray(selectedPlats) ? selectedPlats : ['movil'])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'diagramas_flujo')}_${platformsSuffix}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setProgress(100); setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error("Error generando el ZIP de Android:", error);
            setStatusText("Error al generar el archivo Android.");
            setIsGenerating(false);
        }
    };

    // ── ZIP Combinado (Web + Android) ────────────────────────────────────────
    const generateAndDownloadCombinedZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        try {
            const outerZip = new window.JSZip();

            // ── Generar ZIP Web ──
            setStatusText("Generando paquete Web...");
            const htmlContent = generateFlowchartHTML(config, gameDetails, selectedPlatforms);
            const webZip = new window.JSZip();

            const htmlFileNameCombined = `${normalizeFileName(gameDetails?.gameName || 'diagramas_flujo')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            webZip.file(htmlFileNameCombined, htmlContent);
            const webBlob = await webZip.generateAsync({ type: "blob" });
            outerZip.file(`${normalizeFileName(gameDetails?.gameName || 'diagramas_flujo')}_web.zip`, webBlob);

            // ── Generar ZIP Android ──
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/diagramas_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Inyectando configuración Android...");
            const zipOriginal = await window.JSZip.loadAsync(arrayBuffer);
            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];
            const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
            const nivelKey = nivelMap[config.difficulty] || config.difficulty?.toLowerCase() || 'basico';
            const diagramasCompletos = config.problems.map(p => ({
                id: p.id,
                titulo: p.titulo || p.id,
                solucion: Array.isArray(p.solucion) ? p.solucion : [],
                opciones: Array.isArray(p.solucion) ? p.solucion : []
            }));
            const fullConfig = {
                nivel: nivelKey,
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                fecha: details.date ? details.date.split('T')[0] : new Date().toISOString().split('T')[0],
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Diagramas de Flujo',
                nombreJuego: details.gameName || 'Diagramas de Flujo',
                plataformas: selectedPlats,
                diagramas: diagramasCompletos
            };
            const androidApplicationId = buildDiagramasApplicationId();
            zipOriginal.file(
                "android/app/src/main/assets/public/config/diagramas-config.json",
                JSON.stringify(fullConfig, null, 2)
            );
            await applyDiagramasAndroidMetadata(zipOriginal, { applicationId: androidApplicationId });

            const androidBlob = await zipOriginal.generateAsync({ type: "blob", platform: "UNIX" });
            const mobilePlatforms = (selectedPlatforms ?? [])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            outerZip.file(`${normalizeFileName(gameDetails?.gameName || 'diagramas_flujo')}_${mobilePlatforms}.zip`, androidBlob);

            // ── ZIP contenedor final ──
            setStatusText("Empaquetando todo...");
            const finalBlob = await outerZip.generateAsync({ type: "blob" });
            const platformsLabel = (selectedPlatforms ?? [])
                .map(p => platformLabel(p))
                .join('_');
            const url = window.URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'diagramas_flujo')}_${platformsLabel}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setProgress(100); setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error("Error generando ZIP combinado:", error);
            setStatusText("Error al generar el archivo combinado.");
            setIsGenerating(false);
        }
    };

    // ── Botón inteligente: decide qué descargar según plataformas ──
    const handleSmartDownload = () => {
        if (isGenerating || !jsZipReady) return;
        const hasWeb = selectedPlatforms?.some(p => p.toLowerCase() === 'web');
        const hasAndroid = selectedPlatforms?.some(p => p.toLowerCase() === 'android');

        if (hasWeb && hasAndroid) {
            setIsGenerating(true); setProgress(0); setStatusText("Iniciando...");
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += Math.floor(Math.random() * 6) + 3;
                if (currentProgress >= 90) {
                    clearInterval(interval);
                    setProgress(90);
                    setStatusText("Empaquetando plataformas...");
                    generateAndDownloadCombinedZip();
                } else {
                    if (currentProgress > 20 && currentProgress < 50) setStatusText("Generando Web...");
                    if (currentProgress >= 50 && currentProgress < 80) setStatusText("Generando Android...");
                    setProgress(currentProgress);
                }
            }, 180);
        } else if (hasAndroid) {
            handleDownloadAndroidZip();
        } else {
            handleDownloadZip();
        }
    };

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
            const normalized = dateString.includes('T') ? dateString : dateString + 'T00:00:00';
            return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Fecha inválida'; }
    };
    return (
        <div className="summary-screen">
            <style>{summaryStyles}</style>
            <h2 style={{ color: '#0077b6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <CheckCircle size={32} color="#22c55e" /> ¡Configuración Exitosa!
            </h2>
            <p className="rules-text">Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.</p>

            <h1 className="selection-title" style={{ textAlign: 'center', color: '#0077b6', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>
                Resumen de la Configuración
            </h1>

            <div className="summary-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="info-grid">
                    <div className="info-card">
                        <div className="info-card-header"><Tag size={16} /> Nombre del Juego</div>
                        <div className="info-card-value">{gameDetails.gameName || 'Diagramas de Flujo'}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><User size={16} /> Autor</div>
                        <div className="info-card-value">{gameDetails.authorName || gameDetails.author || 'No especificado'}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><Layers size={16} /> Versión</div>
                        <div className="info-card-value">{gameDetails.version || '1.0.0'}</div>
                    </div>
                    <div className="info-card full-width">
                        <div className="info-card-header"><FileText size={16} /> Descripción</div>
                        <div className="info-card-value" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{gameDetails.description || 'Sin descripción.'}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><Calendar size={16} /> Fecha de Creación</div>
                        <div className="info-card-value">{formatDate(gameDetails.date)}</div>
                    </div>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="info-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#0077b6' }}>
                            <Shapes size={20} color="#3b82f6" /> Áreas Seleccionadas
                        </h4>
                        {selectedAreas?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
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

                    <div className="info-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#0077b6' }}>
                            <Puzzle size={20} color="#8b5cf6" /> Habilidades Seleccionadas
                        </h4>
                        {selectedSkills?.length > 0 ? (
                            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#334155', textAlign: 'left' }}>
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

            <div className="summary-card" style={{ marginTop: '2.5rem' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#0077b6' }}>
                    Parámetros del Juego
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', rowGap: '1rem', alignItems: 'center' }}>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Tag size={18} /> Dificultad:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.difficulty}</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Tiempo Límite:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{formatTime(config.timeLimit)} minutos</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><List size={18} /> Problemáticas:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.problems.length}</strong>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#334155' }}>Problemáticas seleccionadas:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {config.problems.map(p => (
                            <span key={p.id} style={{ background: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#475569' }}>
                                {p.titulo}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    <button className="btn-primary-summary" onClick={onBack} disabled={isGenerating} style={{ opacity: isGenerating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={18} /> Volver a Editar
                    </button>
                </div>
            </div>

            <div className="download-section">
                <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                    <h3 style={{ color: '#0077b6', marginBottom: '0.5rem' }}>Descargar Paquete del Juego</h3>
                    <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                        Genera el archivo .zip listo para descargar en su computadora.
                    </p>

                    {/* ── TABS DE PLATAFORMAS ── */}
                    <div style={{
                        display: 'inline-flex', gap: '0.5rem', background: '#e2e8f0',
                        borderRadius: '2rem', padding: '4px', marginBottom: '1rem'
                    }}>
                        {selectedPlatforms?.some(p => p.toLowerCase() === 'web') && (
                            <span style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 16px', borderRadius: '2rem', fontSize: '0.85rem',
                                fontWeight: '600', background: '#ffffff', color: '#0077b6',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                                Web
                            </span>
                        )}
                        {selectedPlatforms?.some(p => p.toLowerCase() === 'android') && (
                            <span style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 16px', borderRadius: '2rem', fontSize: '0.85rem',
                                fontWeight: '600', background: '#ffffff', color: '#16a34a',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                    <line x1="12" y1="18" x2="12.01" y2="18" />
                                </svg>
                                Android
                            </span>
                        )}
                    </div>

                    {/* Descripción dinámica */}
                    <p style={{
                        fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.5rem',
                        background: '#f1f5f9', borderRadius: '0.5rem', padding: '8px 14px',
                        border: '1px dashed #cbd5e1'
                    }}>
                        {(() => {
                            const hasWeb = selectedPlatforms?.some(p => p.toLowerCase() === 'web');
                            const hasAndroid = selectedPlatforms?.some(p => p.toLowerCase() === 'android');
                            if (hasWeb && hasAndroid) return '📦 Se generará un ZIP con el paquete Web y el proyecto Android incluidos.';
                            if (hasAndroid) return '📱 Se generará el proyecto Android (plantilla Capacitor).';
                            return '🌐 Se generará el archivo HTML del juego listo para web.';
                        })()}
                    </p>

                    {/* Barra de progreso */}
                    {isGenerating && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: '500' }}>
                                <span>{statusText}</span><span>{progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '7px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#0077b6', transition: 'width 0.3s' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── BOTÓN INTELIGENTE ÚNICO ── */}
                <button
                    className="btn-primary-summary btn-success"
                    onClick={handleSmartDownload}
                    disabled={isGenerating || !jsZipReady}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        boxShadow: '0 4px 14px 0 rgba(0, 119, 182, 0.35)',
                        minWidth: '240px', justifyContent: 'center',
                        fontSize: '1rem', padding: '0.85rem 2rem',
                        cursor: (isGenerating || !jsZipReady) ? 'wait' : 'pointer',
                        opacity: (isGenerating || !jsZipReady) ? 0.8 : 1,
                        borderRadius: '0.75rem', fontWeight: '700', letterSpacing: '0.02em'
                    }}
                >
                    {!jsZipReady ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ animation: 'spin 1s linear infinite' }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Cargando librería...
                        </>
                    ) : isGenerating ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ animation: 'spin 1s linear infinite' }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Generando...
                        </>
                    ) : (selectedPlatforms?.filter(p => ['web', 'android'].includes(p.toLowerCase())).length > 1) ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                            Generar (.zip)
                        </>
                    ) : selectedPlatforms?.some(p => p.toLowerCase() === 'android') ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Generar (.zip)
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Generar (.zip)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL (Reescrito para coincidir con Acertijo.jsx) ---
export default function DiagramasFlujo() {
    const [view, setView] = useState('home'); // 'home', 'game', 'summary'
    const [level, setLevel] = useState('Básico');
    const [selectedProblems, setSelectedProblems] = useState([]);

    // Estados del Juego (Preview)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [slots, setSlots] = useState([]);
    const [sourceOptions, setSourceOptions] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const timerRef = useRef(null);

    const currentConfig = CONFIG_NIVELES[level];

    useEffect(() => {
        // Cargar SweetAlert para el preview
        if (!window.Swal) {
            const s = document.createElement('script');
            s.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
            s.async = true;
            document.body.appendChild(s);
        }
    }, []);

    // Efecto del Temporizador
    useEffect(() => {
        if (view === 'game' && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000);
        } else if (view === 'game' && timeLeft === 0) {
            clearInterval(timerRef.current);
            window.Swal?.fire({ title: '¡Tiempo Agotado!', icon: 'warning', confirmButtonText: 'Siguiente' }).then(() => nextProblem());
        }
        return () => clearInterval(timerRef.current);
    }, [view, timeLeft]);

    const handleLevelChange = (e) => {
        setLevel(e.target.value);
        setSelectedProblems([]); // Reset al cambiar nivel
    };

    const handleProblemToggle = (problem) => {
        if (selectedProblems.some(p => p.id === problem.id)) {
            setSelectedProblems(selectedProblems.filter(p => p.id !== problem.id));
        } else if (selectedProblems.length < currentConfig.maxProblemas) {
            setSelectedProblems([...selectedProblems, problem]);
        }
    };

    const startGame = () => {
        if (selectedProblems.length === 0) return;
        setCurrentIndex(0);
        setScore(0);
        setTimeLeft(currentConfig.tiempo);
        loadProblem(0);
        setView('game');
    };

    const loadProblem = (idx) => {
        const problem = selectedProblems[idx];
        if (!problem) return;
        setSlots(new Array(problem.solucion.length).fill(null));
        setSourceOptions([...problem.opciones].sort(() => Math.random() - 0.5));
    };

    const nextProblem = (currentScore) => {
        // Usar el score pasado como argumento si existe (para asegurar consistencia),
        // de lo contrario usar el del estado.
        const scoreToCheck = typeof currentScore === 'number' ? currentScore : score;

        const next = currentIndex + 1;
        if (next < selectedProblems.length) {
            setCurrentIndex(next);
            loadProblem(next);
        } else {
            finishGame(scoreToCheck);
        }
    };

    const checkAnswer = () => {
        const problem = selectedProblems[currentIndex];
        if (slots.some(s => s === null)) {
            window.Swal?.fire('Incompleto', 'Debes llenar todos los espacios', 'warning');
            return;
        }

        if (JSON.stringify(slots) === JSON.stringify(problem.solucion)) {
            const newScore = score + 10;
            setScore(newScore);
            // Pasamos newScore a nextProblem para asegurar que el último puntaje se cuente
            window.Swal?.fire({ icon: 'success', title: '¡Correcto!', timer: 1000, showConfirmButton: false }).then(() => nextProblem(newScore));
        } else {
            window.Swal?.fire('Incorrecto', 'El orden no es correcto', 'error');
        }
    };

    const finishGame = (finalScore) => {
        clearInterval(timerRef.current);
        window.Swal?.fire({
            title: '¡Juego Completado!',
            html: `<p>Puntos Obtenidos: <strong>${finalScore}</strong></p>`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Volver a Jugar',
            cancelButtonText: 'Salir',
            confirmButtonColor: '#0077b6',
            cancelButtonColor: '#4b5563',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) startGame();
            else setView('home');
        });
    };

    const goToSummary = () => {
        setView('summary');
        navigate('/settings?view=summary', {
            replace: true,
            state: {
                ...location.state,
                gameDetails: location.state?.gameDetails || {},
                selectedPlatforms: location.state?.selectedPlatforms || []
            }
        });
    };

    // --- Drag and Drop Logic for React Preview (CORREGIDO) ---
    const handleDragStart = (e, text) => {
        e.dataTransfer.setData("text/plain", text);
        e.dataTransfer.effectAllowed = "copy";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (e, slotIndex) => {
        e.preventDefault();
        const text = e.dataTransfer.getData("text/plain");
        if (text) {
            const newSlots = [...slots];
            newSlots[slotIndex] = text;
            setSlots(newSlots);
        }
    };

    const renderConfigScreen = () => (
        <div className="config-screen">
            <div className="game-title">
                {'Diagramas de Flujo'.split('').map((letter, index) => (
                    <span key={index} style={{ animationDelay: `${index * 0.07}s` }}>
                        {letter === ' ' ? '\u00A0' : letter}
                    </span>
                ))}
            </div>

            <div className="rules-text">
                <h2>Configura tu juego seleccionando las problemáticas.</h2>
            </div>

            <div className="config-controls">
                <div className="control-group">
                    <label>Seleccione el nivel de dificultad:</label>
                    <select value={level} onChange={handleLevelChange}>
                        {Object.keys(CONFIG_NIVELES).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                </div>
                <div className="control-group" style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <button className="no-rounded-button" style={{ backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', fontSize: '0.9rem' }} onClick={() => setSelectedProblems([])}>
                        <RotateCcw size={16} /> Reiniciar Selección
                    </button>
                </div>
            </div>

            <div className="riddle-catalog">
                <div className="riddle-header">
                    <strong style={{ color: '#1f2937' }}>Catálogo de Problemas</strong>
                    <span style={{ color: '#0077b6', fontWeight: 'bold' }}>{selectedProblems.length} / {currentConfig.maxProblemas} Seleccionados</span>
                </div>
                <div className="riddle-grid">
                    {TODOS_LOS_PROBLEMAS.filter(p => p.nivel === level).map(p => {
                        const isSelected = selectedProblems.some(sel => sel.id === p.id);
                        return (
                            <button key={p.id} onClick={() => handleProblemToggle(p)} className={`acertijo-select-btn ${isSelected ? 'selected' : ''}`}>
                                <div style={{ marginTop: 2 }}>{isSelected ? <CheckCircle size={18} color="#0077b6" /> : <HelpCircle size={18} color="#ccc" />}</div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase' }}>{p.nivel}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titulo}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="config-footer">
                <button onClick={() => navigate(-1)} className="no-rounded-button">
                    <ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior
                </button>
                <button onClick={startGame} disabled={selectedProblems.length < currentConfig.maxProblemas} className="no-rounded-button">
                    Siguiente <ArrowRight style={{ marginLeft: '0.5rem' }} />
                </button>

            </div>
        </div>
    );

    return (
        <>
            <Style />
            <div className="acertijo-container">
                {view === 'summary' && (
                    <Summary
                        config={{ difficulty: level, timeLimit: currentConfig.tiempo, problems: selectedProblems }}
                        onBack={() => setView('home')}
                    />
                )}

                {view === 'game' && (
                    <div className="game-screen">
                        {/* Título Animado y Subtítulo */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div className="game-title">
                                {'Diagramas de Flujo'.split('').map((letter, index) => (
                                    <span key={index} style={{ animationDelay: `${index * 0.07}s` }}>
                                        {letter === ' ' ? '\u00A0' : letter}
                                    </span>
                                ))}
                            </div>
                            {/* Agregado (Vista Previa) */}
                            <h2 style={{ textAlign: 'center', color: '#6b7280', marginTop: '-10px', fontSize: '1.2rem', fontWeight: '500' }}>(Vista Previa)</h2>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            margin: '0 auto 1.5rem auto',
                            maxWidth: '600px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '0.75rem',
                            padding: '0.85rem 1.25rem',
                            textAlign: 'center'
                        }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem' }}>📋 Reglas Básicas</span>
                            <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>Arrastra las instrucciones al diagrama de flujo en el orden adecuado.</span>
                        </div>
                        <div className="game-layout">
                            {/* Left Column: Flowchart (The "Question" Area) */}
                            <div className="game-left-col">
                                <div className="question-card">
                                    <span className="topic-badge">Problemática</span>
                                    <h2 className="question-text">{selectedProblems[currentIndex]?.titulo}</h2>
                                </div>
                                <div className="flow-drop-zone">
                                    <div className="flow-node-endpoint">Inicio</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
                                        {selectedProblems[currentIndex]?.solucion.map((_, i) => (
                                            <React.Fragment key={i}>
                                                <div style={{ color: '#ccc' }}>↓</div>
                                                <div
                                                    className={slots[i] ? (selectedProblems[currentIndex].plantilla[i] === 1 ? 'flow-shape-data' : 'flow-shape-process') : 'flow-slot-empty'}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, i)}
                                                >
                                                    {slots[i] ? (
                                                        <div className={selectedProblems[currentIndex].plantilla[i] === 1 ? 'flow-text-fix' : ''}>{slots[i]}</div>
                                                    ) : 'Arrastra aquí'}
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div style={{ color: '#ccc' }}>↓</div>
                                    <div className="flow-node-endpoint">Fin</div>
                                </div>
                            </div>

                            {/* Right Column: Stats & Source Options */}
                            <div className="game-right-col">
                                <div className="stats-block">
                                    <h3>Progreso</h3>
                                    <div className="stats-item"><span>Nivel:</span> <strong>{level}</strong></div>
                                    <div className="stats-item"><span>Tiempo Límite:</span> <strong>{formatTime(timeLeft)}</strong></div>
                                    <div className="stats-item"><span>Puntaje:</span> <strong>{score}</strong></div>
                                    <div className="stats-item"><span>Problemática:</span> <strong>{currentIndex + 1}/{selectedProblems.length}</strong></div>

                                </div>

                                <div className="draggable-source-container">
                                    {sourceOptions.map((opt, i) => (
                                        <div
                                            key={i}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, opt)}
                                            className="draggable-item"
                                            style={{ cursor: 'grab' }}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </div>

                                <button className="btn-primary" onClick={checkAnswer}>
                                    Validar Respuesta
                                </button>
                                <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => finishGame(score)}>
                                    Finalizar Juego
                                </button>
                            </div>
                        </div>

                        <div className="nav-footer">
                            <button className="no-rounded-button" onClick={() => setView('home')}>
                                <ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior
                            </button>
                            <button className="no-rounded-button" onClick={goToSummary}>
                                <IconConfigure size={16} style={{ marginRight: '0.5rem' }} /> Terminar Configuración <ArrowRight style={{ marginLeft: '0.5rem' }} />
                            </button>
                        </div>
                    </div>
                )}

                {view === 'home' && renderConfigScreen()}
            </div>
        </>
    );
}