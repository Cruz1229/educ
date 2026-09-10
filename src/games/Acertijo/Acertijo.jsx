import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    HelpCircle, RotateCcw, Timer, Trophy, Star, CheckCircle,
    Sun, Wind, Sprout, Leaf, Copy, Activity,
    Calculator, PieChart, Hash, Divide,
    Brain, Heart, Eye, Ear, Bone, Stethoscope,
    Square, Circle, Triangle, Hexagon, Octagon, BoxSelect,
    Syringe, Shield, Thermometer, Pill, AlertTriangle, Cross,
    Box, Cylinder, Cone, Globe, Pyramid,
    LogOut, ArrowLeft, ArrowRight, Download, Package, X, Tag, FileText, Calendar, Monitor, Shapes, Grid, Clock, List, Layers, Puzzle, Home, Type, Info,
    Utensils, Filter, Zap, Layout, Play, Edit3
} from 'lucide-react';

const IconConfigure = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"></path>
    </svg>
);

// --- ESTILOS COMPARTIDOS ---
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

    /* --- TÍTULO ANIMADO (SOLO PARA PREVIEW EN REACT) --- */
    .game-title {
        text-align: center;
        font-size: 3rem;
        font-weight: 700;
        color: var(--secondary-color);
        margin-bottom: 1rem;
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

    /* --- GRID DE ACERTIJOS --- */
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
        background-color: #e0f2fe; /* Azul muy claro */
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
    
    /* Estado deshabilitado para el botón */
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
        grid-template-columns: 1fr 250px; 
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
        padding: 2rem; 
        border-radius: 1rem; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
        text-align: center; 
        min-height: 200px; 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        align-items: center; 
        position: relative;
        border: 1px solid var(--medium-gray-color);
    }

    .question-text {
        font-family: 'Merriweather', serif; 
        font-size: 1.5rem; 
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

    .answers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
    }

    .answer-btn-modern {
        background: white;
        border: 1px solid var(--medium-gray-color);
        padding: 1rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        text-align: center;
        justify-content: center;
        min-height: 100px;
        color: var(--dark-text);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    
    .answer-btn-modern:hover {
        transform: translateY(-2px);
        border-color: var(--primary-color);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        background-color: #f8fafc;
    }
    
    .answer-btn-modern span {
        font-weight: 600;
        font-size: 0.95rem;
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
// Copiado del componente Summary.jsx proporcionado y MODIFICADO para centrar valores
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
    
    /* Grid Helpers */
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
        /* Corregido: Removido centrado del contenedor para que las etiquetas queden a la izquierda */
    }
    
    .info-card-header { 
        display: flex; 
        align-items: center; 
        /* Corregido: Justify content start (default) para etiqueta a la izquierda */
        gap: 0.5rem; 
        color: #64748b; 
        font-size: 0.9rem; 
        font-weight: 600; 
        text-transform: uppercase; 
        letter-spacing: 0.05em; 
        width: 100%;
    }
    
    /* Corregido: Centrado SOLO del valor */
    .info-card-value { 
        font-size: 1.1rem; 
        color: #334155; 
        font-weight: 500; 
        text-align: center; 
        width: 100%;
    }
   @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
    
    .full-width { grid-column: 1 / -1; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
`;

// --- DATOS ---
const ACERTIJOS_POR_NIVEL = {
    "básico": [
        { id: "b1", tema: "Funciones Vitales", pregunta: "No me alimento como tú ni como un animal; con luz, agua y aire fabrico mi pan.", respuesta: "Fotosíntesis", opciones: ["Fotosíntesis", "Respiración", "Reproducción"] },
        { id: "b2", tema: "Funciones Vitales", pregunta: "No tengo pulmones como tú, pero día y noche respiro. Tomo aire por mis poros y en silencio sigo vivo. ¿Qué proceso realizo?", respuesta: "Respiración", opciones: ["Digestión", "Respiración", "Excreción"] },
        { id: "b3", tema: "Funciones Vitales", pregunta: "No necesito pedir comida ni pedir comida para llevar. Yo mismo me la preparo, ¿cómo me puedo llamar?", respuesta: "Autótrofo", opciones: ["Autótrofo", "Heterótrofo", "Trofólogo"] },
        { id: "b4", tema: "Funciones Vitales", pregunta: "De una semillita salgo yo, y luego hago miles más. Soy un proceso que hace copias para que la vida continúe sin parar. ¿Quién soy?", respuesta: "Reproducción", opciones: ["Nutrición", "Reproducción", "Deporte vegetal"] },
        { id: "b5", tema: "Funciones Vitales", pregunta: "Aunque no tengo pies ni ruedas, me muevo sin caminar. Si la luz aparece, hacia ella me verás girar. ¿Qué soy?", respuesta: "Fototropismo", opciones: ["Fototropismo", "Hibernación", "Fotosíntesis"] },
        { id: "b6", tema: "Lógica", pregunta: "Ana tiene el doble de años que Luis. Si entre los dos suman 18 años, ¿cuántos años tiene Ana?", respuesta: "12", opciones: ["6", "12", "9"] },
        { id: "b7", tema: "Lógica", pregunta: "Tenías 3/4 de una pizza. Te comes la mitad de lo que tenías. ¿Qué fracción de la pizza comiste?", respuesta: "3/8", opciones: ["3/8", "1/4", "1/2"] },
        { id: "b8", tema: "Lógica", pregunta: "A, B y C tienen canicas. A tiene el doble que B, y C tiene 5 menos que A. Si entre los tres suman 30 canicas, ¿cuántas tiene B?", respuesta: "7", opciones: ["5", "7", "10"] },
        { id: "b9", tema: "Lógica", pregunta: "Soy un número de dos cifras. La cifra de las decenas es 3 veces la cifra de las unidades, y la suma de mis cifras es 12. ¿Quién soy?", respuesta: "93", opciones: ["39", "84", "93"] },
        { id: "b10", tema: "Lógica", pregunta: "¿Cuál es el número más pequeño mayor que 100 que es divisible tanto por 5 como por 7?", respuesta: "105", opciones: ["105", "110", "140"] }
    ],
    "intermedio": [
        { id: "i1", tema: "Cuerpo Humano", pregunta: "Sin mí no puedes pensar, soñar ni recordar. Coordino lo que haces sin descansar. ¿Quién soy?", respuesta: "Cerebro", opciones: ["Corazón", "Cerebro", "Estómago"] },
        { id: "i2", tema: "Cuerpo Humano", pregunta: "Me inflo y me desinflo sin parar, gracias a mí puedes saltar, hablar y respirar. ¿Quién soy?", respuesta: "Pulmones", opciones: ["Pulmones", "Hígado", "Riñones"] },
        { id: "i3", tema: "Cuerpo Humano", pregunta: "Soy un saco que nunca cocina, pero con jugos y ácidos la comida tritura. ¿Quién soy?", respuesta: "Estómago", opciones: ["Estómago", "Intestino", "Páncreas"] },
        { id: "i4", tema: "Cuerpo Humano", pregunta: "Somos dos y trabajamos en silencio, limpiamos la sangre y expulsamos lo que no tiene uso. ¿Quiénes somos?", respuesta: "Riñones", opciones: ["Pulmones", "Riñones", "Corazón"] },
        { id: "i5", tema: "Cuerpo Humano", pregunta: "Transformo lo que comes, limpio tu sangre y te ayudo a digerir. Sin mí, te costaría mucho vivir. ¿Quién soy?", respuesta: "Hígado", opciones: ["Páncreas", "Hígado", "Estómago"] },
        { id: "i6", tema: "Cuerpo Humano", pregunta: "Soy largo, delgado y estoy en tu barriga. De lo que comes, tomo lo bueno y lo envío a la sangre enseguida. ¿Quién soy?", respuesta: "Intestino delgado", opciones: ["Intestino grueso", "Intestino delgado", "Páncreas"] },
        { id: "i7", tema: "Cuerpo Humano", pregunta: "Gracias a mí puedes brincar, correr y abrazar. Me estiro y me encojo para poder moverte sin parar. ¿Quién soy?", respuesta: "Músculo", opciones: ["Músculo", "Hueso", "Cerebro"] },
        { id: "i8", tema: "Cuerpo Humano", pregunta: "Abro y cierro mis cortinas cada día, y con mi ayuda ves colores, formas y alegría. ¿Quién soy?", respuesta: "Ojo", opciones: ["Oído", "Ojo", "Nariz"] },
        { id: "i9", tema: "Geometría", pregunta: "Todos mis lados son iguales, y mis ángulos son perfectos y rectales. ¿Quién soy?", respuesta: "Cuadrado", opciones: ["Cuadrado", "Rectángulo", "Rombo"] },
        { id: "i10", tema: "Geometría", pregunta: "Parezco un cuadrado girado, todos mis lados son iguales, pero mis ángulos algo inclinados. ¿Quién soy?", respuesta: "Rombo", opciones: ["Trapecio", "Rombo", "Hexágono"] },
        { id: "i11", tema: "Geometría", pregunta: "Si dibujas una estrella, seguro me ves, porque soy el polígono con cinco pies. ¿Quién soy?", respuesta: "Pentágono", opciones: ["Pentágono", "Hexágono", "Heptágono"] },
        { id: "i12", tema: "Geometría", pregunta: "Las abejas me usan para construir su hogar, tengo seis lados iguales, ¡me encanta trabajar!", respuesta: "Hexágono", opciones: ["Hexágono", "Octágono", "Heptágono"] },
        { id: "i13", tema: "Geometría", pregunta: "Cuando manejas, me ves en la esquina, tengo ocho lados y una forma divina.", respuesta: "Octágono", opciones: ["Octágono", "Hexágono", "Decágono"] },
        { id: "i14", tema: "Geometría", pregunta: "No tengo lados ni puntas tampoco, pero si me lanzas, ruedo poco a poco.", respuesta: "Círculo", opciones: ["Círculo", "Elipse", "Óvalo"] },
        { id: "i15", tema: "Geometría", pregunta: "Nací del círculo al partirlo en dos, parezco una sonrisa si me ves con atención. ¿Quién soy?", respuesta: "Semicírculo", opciones: ["Trapecio", "Triángulo", "Semicírculo"] },
        { id: "i16", tema: "Geometría", pregunta: "Tengo cuatro lados, pero solo dos son paralelos. Parecen mis techos inclinados, ¡no soy nada feo!", respuesta: "Trapecio", opciones: ["Romboide", "Trapecio", "Triángulo"] }
    ],
    "avanzado": [
        { id: "a1", tema: "Vacunas", pregunta: "Provoco fiebre, tos y puntitos rojos en la piel, soy muy contagioso. Gracias a una vacuna triple, ya no doy tanto miedo.", respuesta: "Triple viral (SRP)", opciones: ["Varicela", "Triple viral (SRP)", "Rotavirus"] },
        { id: "a2", tema: "Vacunas", pregunta: "Te dejo sin aire con mi garganta inflamada, y antes mi ataque era temido. Una vacuna con tres nombres me detuvo enseguida.", respuesta: "Difteria", opciones: ["Difteria", "BCG", "Hepatitis B"] },
        { id: "a3", tema: "Vacunas", pregunta: "Me gusta esconderme en los nervios y dejarte sin mover. Pero con una vacuna oral me hicieron desaparecer.", respuesta: "Polio (Sabin)", opciones: ["Triple viral", "Polio (Sabin)", "Rotavirus"] },
        { id: "a4", tema: "Vacunas", pregunta: "Si te cortas y no estás protegido, te dejo tieso y adolorido. Por suerte, hay una vacuna que evita el peligro.", respuesta: "Tétanos", opciones: ["Hepatitis A", "Tétanos", "BCG"] },
        { id: "a5", tema: "Vacunas", pregunta: "Me escondo en el agua y la comida contaminada, y dejo tu piel amarilla. Con una vacuna sencilla quedo derrotada.", respuesta: "Hepatitis A", opciones: ["Neumocócica", "Hepatitis A", "Hepatitis B"] },
        { id: "a6", tema: "Vacunas", pregunta: "Me encanta inflar tu cara y causar fiebre, antes era común entre niños. Una vacuna triple me deja sin poderes.", respuesta: "Triple viral (Paperas)", opciones: ["Triple viral (Paperas)", "Hepatitis A", "DTP"] },
        { id: "a7", tema: "Vacunas", pregunta: "Provoco diarrea y vómito sin parar, especialmente en bebés. Con unas gotitas en la boca me puedes derrotar.", respuesta: "Rotavirus", opciones: ["Neumocócica", "Rotavirus", "Hepatitis A"] },
        { id: "a8", tema: "Vacunas", pregunta: "Entro por el aire y ataco los pulmones, dejo tos y cansancio. Una vacuna deja marca en el brazo, y me detiene.", respuesta: "BCG", opciones: ["BCG", "DTP", "Influenza"] },
        { id: "a9", tema: "Vacunas", pregunta: "Cada año cambio de disfraz, te hago estornudar y moquear sin paz. Una vacuna anual me pone un alto eficaz.", respuesta: "Influenza", opciones: ["Influenza", "COVID-19", "Neumocócica"] },
        { id: "a10", tema: "Vacunas", pregunta: "Dejo granitos que dan picazón, y aunque soy leve, provoco irritación. Una vacuna evita mi invasión.", respuesta: "Varicela", opciones: ["Rotavirus", "Varicela", "Triple viral"] },
        { id: "a11", tema: "Geometría 3D", pregunta: "Tengo 6 caras rectangulares y todas se enfrentan con orden, guardo cosas, soy práctico y me encuentras en cualquier rincón.", respuesta: "Prisma rectangular", opciones: ["Cubo", "Prisma rectangular", "Pirámide"] },
        { id: "a12", tema: "Geometría 3D", pregunta: "Tengo 6 caras cuadradas, 8 vértices y 12 aristas bien contadas. Me usan en los juegos y también en matemáticas.", respuesta: "Cubo", opciones: ["Esfera", "Cilindro", "Cubo"] },
        { id: "a13", tema: "Geometría 3D", pregunta: "Tengo dos bases iguales y paralelas, mis caras laterales son rectángulos. Puedo ser triangular, cuadrangular o hexagonal.", respuesta: "Prisma", opciones: ["Prisma", "Pirámide", "Cono"] },
        { id: "a14", tema: "Geometría 3D", pregunta: "Tengo una base que puede ser cuadrada o triangular, y todas mis caras laterales se encuentran en un punto al brillar.", respuesta: "Pirámide", opciones: ["Cilindro", "Pirámide", "Prisma"] },
        { id: "a15", tema: "Geometría 3D", pregunta: "No tengo vértices ni caras planas, ruedo sin parar y soy totalmente suave. ¿Quién soy?", respuesta: "Esfera", opciones: ["Esfera", "Cono", "Cilindro"] },
        { id: "a16", tema: "Geometría 3D", pregunta: "Tengo dos círculos arriba y abajo, y un cuerpo recto que parece un tubo. Sirvo para guardar agua o lápices.", respuesta: "Cilindro", opciones: ["Cono", "Cilindro", "Prisma"] },
        { id: "a17", tema: "Geometría 3D", pregunta: "Tengo una base redonda y un solo vértice arriba, si me giras parezco un helado o una colina.", respuesta: "Cono", opciones: ["Cono", "Esfera", "Pirámide"] },
        { id: "a18", tema: "Geometría 3D", pregunta: "Tengo 4 caras, todas son triángulos iguales, no tengo base diferente ni lados desiguales.", respuesta: "Tetraedro", opciones: ["Tetraedro", "Octaedro", "Prisma triangular"] },
        { id: "a19", tema: "Geometría 3D", pregunta: "Parezco dos pirámides pegadas por la base, mis 8 caras son triángulos, ¡qué elegancia y clase!", respuesta: "Octaedro", opciones: ["Octaedro", "Dodecaedro", "Prisma hexagonal"] },
        { id: "a20", tema: "Geometría 3D", pregunta: "Mis caras son pentágonos perfectos, y aunque soy difícil de dibujar, ¡soy muy geométrico y correcto!", respuesta: "Dodecaedro", opciones: ["Dodecaedro", "Icosaedro", "Cubo"] }
    ]
};

// Fallback helper
const UserIcon = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

// --- MAPEO DE ICONOS ---
const iconMap = {
    // Biología / Procesos
    "Fotosíntesis": { icon: Sun },
    "Respiración": { icon: Wind },
    "Autótrofo": { icon: Sprout },
    "Reproducción": { icon: Copy },
    "Fototropismo": { icon: Leaf },

    // Números / Lógica
    "6": { icon: Hash }, "12": { icon: Calculator }, "9": { icon: Hash },
    "3/8": { icon: PieChart }, "1/4": { icon: PieChart }, "1/2": { icon: PieChart },
    "7": { icon: Hash }, "5": { icon: Hash }, "10": { icon: Hash },
    "93": { icon: Hash }, "39": { icon: Hash }, "84": { icon: Hash },
    "105": { icon: Hash }, "110": { icon: Hash }, "140": { icon: Hash },

    // Órganos
    "Cerebro": { icon: Brain },
    "Corazón": { icon: Heart },
    "Estómago": { icon: Utensils },
    "Pulmones": { icon: Wind },
    "Hígado": { icon: Activity },
    "Riñones": { icon: Filter },
    "Páncreas": { icon: Zap },
    "Intestino": { icon: Layers },
    "Intestino grueso": { icon: Layers },
    "Intestino delgado": { icon: Layers },
    "Músculo": { icon: Activity },
    "Hueso": { icon: Bone },
    "Ojo": { icon: Eye },
    "Oído": { icon: Ear },
    "Nariz": { icon: UserIcon },

    // Geometría
    "Cuadrado": { icon: Square },
    "Rectángulo": { icon: Square },
    "Rombo": { icon: Layout },
    "Trapecio": { icon: BoxSelect },
    "Hexágono": { icon: Hexagon },
    "Pentágono": { icon: Hexagon },
    "Heptágono": { icon: Hexagon },
    "Octágono": { icon: Octagon },
    "Decágono": { icon: Octagon },
    "Círculo": { icon: Circle },
    "Elipse": { icon: Circle },
    "Óvalo": { icon: Circle },
    "Semicírculo": { icon: Circle },
    "Triángulo": { icon: Triangle },
    "Romboide": { icon: Layout },

    // Vacunas y Salud
    "Triple viral (SRP)": { icon: Syringe },
    "Varicela": { icon: AlertTriangle },
    "Rotavirus": { icon: Pill },
    "Difteria": { icon: Shield },
    "Tétanos": { icon: Shield },
    "DTP": { icon: Shield },
    "BCG": { icon: Syringe },
    "Hepatitis B": { icon: Syringe },
    "Hepatitis A": { icon: Pill },
    "Polio (Sabin)": { icon: Syringe },
    "Triple viral": { icon: Syringe },
    "Triple viral (Paperas)": { icon: Syringe },
    "Neumocócica": { icon: Syringe },
    "Influenza": { icon: Thermometer },
    "COVID-19": { icon: AlertTriangle },

    // Geometría 3D
    "Prisma rectangular": { icon: Box },
    "Cubo": { icon: Box },
    "Pirámide": { icon: Pyramid },
    "Esfera": { icon: Globe },
    "Cilindro": { icon: Cylinder },
    "Cono": { icon: Cone },
    "Prisma": { icon: Box },
    "Tetraedro": { icon: Pyramid },
    "Octaedro": { icon: Pyramid },
    "Dodecaedro": { icon: Globe },
    "Icosaedro": { icon: Globe },
    "Prisma hexagonal": { icon: Box },
    "Prisma triangular": { icon: Pyramid }
};

// --- GENERADOR HTML ---
const generateGameCode = (config, gameDetails, selectedPlatforms) => {
    // Si config no existe, usar valores por defecto
    if (!config) config = { difficulty: "Básico", timeLimit: 60, riddles: [] };

    const rawDate = (() => {
        try {
            const stored = typeof localStorage !== 'undefined'
                ? localStorage.getItem('acertijo:creation_date')
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

    const iconMappingJS = `
        const iconMap = {
            "Fotosíntesis": "sun", "Respiración": "wind", "Autótrofo": "sprout", "Reproducción": "copy", "Fototropismo": "leaf",
            "6": "hash", "12": "calculator", "9": "hash", "3/8": "pie-chart", "1/4": "pie-chart", "1/2": "pie-chart",
            "7": "hash", "5": "hash", "10": "hash", "93": "hash", "39": "hash", "84": "hash", "105": "hash", "110": "hash", "140": "hash",
            "Cerebro": "brain", "Corazón": "heart", "Estómago": "utensils", "Pulmones": "wind", "Hígado": "activity", "Riñones": "filter",
            "Páncreas": "zap", "Intestino": "layers", "Intestino grueso": "layers", "Intestino delgado": "layers",
            "Músculo": "activity", "Hueso": "bone", "Ojo": "eye", "Oído": "ear",
            "Cuadrado": "square", "Rectángulo": "square", "Rombo": "layout", "Trapecio": "box-select", "Hexágono": "hexagon",
            "Pentágono": "hexagon", "Heptágono": "hexagon", "Octágono": "octagon", "Decágono": "octagon", "Círculo": "circle",
            "Elipse": "circle", "Óvalo": "circle", "Semicírculo": "circle", "Triángulo": "triangle", "Romboide": "layout",
            "Triple viral (SRP)": "syringe", "Varicela": "alert-triangle", "Rotavirus": "pill", "Difteria": "shield",
            "Tétanos": "shield", "DTP": "shield", "BCG": "syringe", "Hepatitis B": "syringe", "Hepatitis A": "pill",
            "Polio (Sabin)": "syringe", "Triple viral": "syringe", "Triple viral (Paperas)": "syringe", "Neumocócica": "syringe",
            "Influenza": "thermometer", "COVID-19": "alert-triangle",
            "Prisma rectangular": "box", "Cubo": "box", "Pirámide": "pyramid", "Esfera": "globe", "Cilindro": "cylinder",
            "Cono": "cone", "Prisma": "box", "Tetraedro": "pyramid", "Octaedro": "pyramid", "Dodecaedro": "globe",
            "Icosaedro": "globe", "Prisma hexagonal": "box", "Prisma triangular": "pyramid"
        };
    `;

    // --- Generate Animated Title HTML ---
    const titleText = gameDetails.gameName || 'Juego de Acertijos';
    const animatedTitleHTML = `
    <div class="game-title">
        ${'Juego de Acertijos'.split('').map((char, index) =>
        `<span style="animation-delay: ${index * 0.07}s">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('')}
    </div>
`;

    // --- Generate Static Title HTML (For Start Screen) ---
    // STATIC TITLE: No animation
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
    <title>${gameDetails.gameName || 'Juego de Acertijos'} - ${config.difficulty}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root { 
            --primary-color: #005f92; /* Adjusted to dark blue from reference image */
            --secondary-color: #1f2937; 
            --light-gray: #f3f4f6;
            --medium-gray: #d1d5db; 
            --dark-gray: #4b5563; 
            --correct: #22c55e; 
            --wrong: #ef4444;
            --light-text: #ffffff; 
            --dark-text: #111827;
        }
         body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; padding: 20px; box-sizing: border-box; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 900px; margin: 20px auto; box-sizing: border-box; display: flex; flex-direction: column; }       
        .game-layout { display: grid; grid-template-columns: 1fr 250px; gap: 2rem; width: 100%; }
        @media (max-width: 768px) { .game-layout { grid-template-columns: 1fr; } }

        .question-card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center; min-height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; border: 1px solid var(--medium-gray); margin-bottom: 1.5rem; }
        .question-text { font-family: 'Merriweather', serif; font-size: 1.5rem; color: var(--secondary-color); line-height: 1.5; margin-top: 1rem; }
        .topic-badge { background: #e0f2fe; color: var(--primary-color); padding: 0.25rem 1rem; border-radius: 2rem; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; position: absolute; top: 1rem; }
        
        .answers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; }
        
        .answer-btn { 
            background: white; 
            border: 1px solid var(--medium-gray); 
            padding: 1rem; 
            border-radius: 0.5rem; 
            cursor: pointer; 
            transition: all 0.2s; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 0.5rem; 
            text-align: center; 
            justify-content: center; 
            min-height: 100px; 
            color: var(--dark-text); 
            box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
            font-family: 'Segoe UI', sans-serif;
        }
        .answer-btn:hover { 
            transform: translateY(-2px); 
            border-color: var(--primary-color); 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
            background-color: #f8fafc; 
        }

        .answer-label { font-weight: 600; font-size: 0.95rem; }
        .icon-large { width: 36px; height: 36px; color: var(--primary-color); }

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
        
        .big-btn { 
            padding: 1rem 2rem; 
            font-size: 1.2rem; 
            font-weight: bold; 
            background: var(--primary-color); 
            color: white; 
            border: none; 
            border-radius: 0.5rem; 
            cursor: pointer; 
            transition: transform 0.2s; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            margin: 0.5rem; 
            display: inline-flex; 
            align-items: center; 
            gap: 0.5rem; 
            justify-content: center; 
            min-width: 200px; 
        }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        
        /* Updated End Screen Buttons colors to match image */
        .btn-exit { background: #1f2937; } /* Dark button for Salir */
        .btn-retry { background: var(--primary-color); } /* Blue for Volver a Jugar */
        
        /* START SCREEN INFO BUTTON: White bg, Blue border, Blue text */
        .btn-info { 
            background: white; 
            color: var(--primary-color); 
            border: 2px solid var(--primary-color); 
        }
        
        .countdown-number { font-size: 8rem; font-weight: bold; color: var(--primary-color); animation: popIn 0.5s ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        /* Animated Title Styles */
        .game-title {
            text-align: center;
            font-size: 3rem;
            font-weight: 700;
            color: var(--secondary-color);
            margin-bottom: 1rem;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
        }
        .game-title span {
            display: inline-block;
            animation: wave-animation 1.8s infinite;
            position: relative;
        }
        /* Static class to remove animation for start screen */
        .game-title.static span {
            animation: none;
            transform: none;
        }
        
        @keyframes wave-animation {
            0%, 40%, 100% { transform: translateY(0); }
            20% { transform: translateY(-20px); }
        }

        /* Estilos para el Modal de Información (COPIADOS DE SUMMARY.JSX) */
        .info-modal-content {
            background: white;
            padding: 2.5rem;
            border-radius: 1rem;
            max-width: 600px;
            width: 90%;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
            position: relative;
        }
        .info-header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .info-title { font-size: 1.8rem; color: var(--primary-color); margin: 0; font-weight: 800; }
        .info-subtitle { color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; }
        .info-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
        .info-item { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .info-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem; font-weight: 600; }
        .info-value { font-size: 1.1rem; color: #334155; font-weight: 500; }
        .info-desc { grid-column: 1 / -1; background: #fff; padding: 0; border: none; }
        .info-desc .info-value { font-size: 1rem; line-height: 1.6; color: #475569; }
        .close-info-btn { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
        .close-info-btn:hover { color: var(--wrong-color); }

        @media(max-width: 768px) { .info-details-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div id="start-screen" class="overlay">
        <!-- Static Title for Start Screen (No animation) -->
        <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">Acertijos</h2>
        
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

    <!-- MODAL DE INFORMACIÓN (ESTILO SUMMARY.JSX) -->
    <div id="info-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">Acertijos</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
            </div>
            
            <div class="info-details-grid">
             <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${gameDetails.authorName || 'No especificado'}</span></div>

                <div class="info-item">
                    <span class="info-label">Versión</span>
                    <span class="info-value">${gameDetails.version || '1.0.0'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de Creación</span>
                    <span class="info-value">${formattedDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Plataformas</span>
                    <span class="info-value">${platformsString}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dificultad</span>
                    <span class="info-value" style="text-transform: capitalize;">${config.difficulty}</span>
                </div>
                <div class="info-item info-desc">
                    <span class="info-label">Descripción</span>
                    <p class="info-value">${gameDetails.description || 'Sin descripción disponible para este juego.'}</p>
                </div>
            </div>

            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem;" onclick="toggleInfo(false)">Cerrar</button>
            </div>
        </div>
    </div>

    <div id="end-screen" class="overlay hidden">
        <h1 id="end-title" style="color:var(--primary-color); font-size:3rem; font-weight: 800;">Fin del Juego</h1>
        <h2 style="color:var(--secondary-color); font-size:2rem; margin:1rem 0;">Puntos Obtenidos: <span id="final-score">0</span></h2>
        <div class="end-buttons">
             <button class="big-btn btn-exit" onclick="exitGame()">Salir</button>
             <button class="big-btn btn-retry" onclick="location.reload()">Volver a Jugar</button>
        </div>
    </div>

    <div class="container" id="game-ui" style="display:none;">
        <!-- Animated Title in Game Loop -->
        ${animatedTitleHTML}
        <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
    <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
    <span style="font-size:1rem; color:#1e40af; font-weight:500;">Resuelve el acertijo seleccionando la respuesta correcta.</span>
</div>
        <div class="game-layout">
            <div class="game-left-col">
                 <div class="question-card">
                    <span class="topic-badge" id="topic">Tema</span>
                    <h2 class="question-text" id="question">Pregunta...</h2>
                </div>
                <div class="answers-grid" id="answers-container"></div>
            </div>
            <div class="game-right-col">
                <div class="stats-block">
                    <h3>Progreso</h3>
                    <div class="stats-item"><span>Tiempo:</span> <strong id="timer">${Math.floor(config.timeLimit / 60)}:${String(config.timeLimit % 60).padStart(2, '0')}</strong></div>

                    <div class="stats-item"><span>Puntaje:</span> <strong id="score">0</strong></div>
                    <div class="stats-item"><span>Progreso:</span> <strong id="progress">1/${config.riddles.length}</strong></div>
                </div>
                 <button class="btn btn-primary" onclick="finishGame(false)">Finalizar Juego</button>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        ${iconMappingJS}
        let state = { currentIndex: 0, score: 0, timeLeft: config.timeLimit, timer: null, active: false };
        
        function toggleInfo(show) {
            const modal = document.getElementById('info-overlay');
            if(show) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            } else {
                modal.classList.add('hidden');
                setTimeout(() => modal.style.display = 'none', 300);
            }
        }

        function exitGame() {
            // Intenta cerrar la ventana/pestaña
            window.close();
            
            // Mensaje de respaldo por si el navegador bloquea el cierre
            Swal.fire({
                title: 'Juego Finalizado',
                text: 'Por favor, cierra esta pestaña manualmente.',
                icon: 'info',
                confirmButtonText: 'Entendido'
            });
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const countDisplay = document.getElementById('countdown-display');
            countDisplay.innerText = count;
            const countInterval = setInterval(() => {
                count--;
                if(count > 0) {
                    countDisplay.innerText = count;
                    countDisplay.style.animation = 'none';
                    countDisplay.offsetHeight; 
                    countDisplay.style.animation = 'popIn 0.5s ease-out';
                } else {
                    clearInterval(countInterval);
                    document.getElementById('countdown-screen').classList.add('hidden');
                    startGame();
                }
            }, 1000);
        }

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
            document.getElementById('game-ui').style.display = 'block';
            state.active = true; state.score = 0; state.currentIndex = 0;
            loadRiddle();
        }
        function formatTime(s) {
            return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
        }
        function loadRiddle() {
            if (state.currentIndex >= config.riddles.length) return finishGame(true);
            const riddle = config.riddles[state.currentIndex];
            document.getElementById('question').innerText = riddle.pregunta;
            document.getElementById('topic').innerText = 'Temática: ' + riddle.tema;
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
            document.getElementById('timer').innerText = formatTime(state.timeLeft);
            state.timer = setInterval(() => {
                state.timeLeft--;
                document.getElementById('timer').innerText = formatTime(state.timeLeft);
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
                document.getElementById('score').innerText = state.score;
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
// --- ANDROID: CONFIGURACIÓN Y GENERACIÓN DE APPLICATION ID ÚNICO ---
const ANDROID_BUILD_GRADLE_PATH = "android/app/build.gradle";
const CAPACITOR_CONFIG_PATH = "android/app/src/main/assets/capacitor.config.json";
const ANDROID_STRINGS_PATH = "android/app/src/main/res/values/strings.xml";
const ACERTIJO_APPLICATION_ID_BASE = "io.acertijo.steam";

const createUuidSegment = () => {
    const rawUuid = window.crypto?.randomUUID?.()
        || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    return `uuid_${uuid}`;
};

const buildAcertijoApplicationId = () => {
    return `${ACERTIJO_APPLICATION_ID_BASE}.${createUuidSegment()}`;
};

const escapeXmlValue = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

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

const applyAcertijoAndroidMetadata = async (zip, { applicationId }) => {
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
// --- COMPONENTE SUMMARY (Integrado de Summary.jsx) ---
const Summary = ({ config, onBack }) => {
    // Nuevos estados para controlar la descarga inline
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    // Estado para verificar si JSZip está listo
    const [jsZipReady, setJsZipReady] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;

    // --- DATOS DE RESPALDO PARA PREVIEW ---
    const MOCK_DATA = {
        selectedAreas: ['science', 'math'],
        selectedSkills: ['Resolución de problemas', 'Creatividad'],
        gameDetails: {
            gameName: "Juego de Prueba (Preview)",
            description: "Esta es una descripción de prueba para el preview.",
            version: "1.0.0",
            date: null
        },
        selectedPlatforms: ['web', 'mobile']
    };

    // Siempre usar la fecha actual del sistema — igual que CalculadoraMental
    const getFixedCreationDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    };

    const {
        selectedAreas = MOCK_DATA.selectedAreas,
        selectedSkills = MOCK_DATA.selectedSkills,
        gameDetails: rawGameDetails = MOCK_DATA.gameDetails,
        selectedPlatforms = MOCK_DATA.selectedPlatforms
    } = state || MOCK_DATA;

    const gameDetails = { ...rawGameDetails, date: getFixedCreationDate() };

    // Efecto para cargar JSZip dinámicamente
    useEffect(() => {
        if (window.JSZip) {
            setJsZipReady(true);
            return;
        }

        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.async = true;
        script.onload = () => {
            console.log("JSZip cargado correctamente");
            setJsZipReady(true);
        };
        script.onerror = () => {
            console.error("Error cargando JSZip");
            setStatusText("Error cargando librería ZIP");
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        }
    }, []);

    // Función modificada para manejar la descarga en pantalla (sin modal)
    const handleDownloadZip = () => {
        if (isGenerating || !jsZipReady) return;

        setIsGenerating(true);
        setProgress(0);
        setStatusText("Iniciando...");

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 10) + 2;

            if (currentProgress >= 90) {
                clearInterval(interval);
                setStatusText("Procesando recursos...");
                generateAndDownloadZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Generando código HTML...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Incrustando imágenes...");
                setProgress(currentProgress);
            }
        }, 200);
    };

    const generateAndDownloadZip = async () => {
        if (!window.JSZip) {
            alert("La librería ZIP aún no está lista. Por favor intente de nuevo en unos segundos.");
            setIsGenerating(false);
            return;
        }

        try {
            const zip = new window.JSZip();
            setStatusText("Finalizando HTML...");

            const htmlContent = generateGameCode(config, gameDetails, selectedPlatforms);

            const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'acertijo')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            zip.file(htmlFileName, htmlContent);

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'acertijo')}_web.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setProgress(100);
            setStatusText("¡Descarga iniciada!");
            setTimeout(() => {
                setIsGenerating(false);
                setProgress(0);
            }, 2000);

        } catch (error) {
            console.error("Error generando el ZIP:", error);
            setStatusText("Error al generar el archivo.");
            setIsGenerating(false);
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
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando acertijos...");
                setProgress(currentProgress);
            }
        }, 150);
    };
    // ── Botón Inteligente: decide qué descargar según plataformas ──
    const handleSmartDownload = () => {
        if (isGenerating || !jsZipReady) return;
        const hasWeb = selectedPlatforms?.some(p => p.toLowerCase() === 'web');
        const hasAndroid = selectedPlatforms?.some(p => p.toLowerCase() === 'android');

        if (hasWeb && hasAndroid) {
            // Inicia el flujo combinado
            setIsGenerating(true); setProgress(0); setStatusText("Iniciando...");
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += Math.floor(Math.random() * 6) + 3;
                if (currentProgress >= 90) {
                    clearInterval(interval);
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
    const generateAndDownloadAndroidZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        try {
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/acertijos_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Procesando archivos ZIP...");
            const zipOriginal = await window.JSZip.loadAsync(arrayBuffer);

            setStatusText("Inyectando configuración...");

            const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
            const nivelKey = nivelMap[config.difficulty] || 'basico';
            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];

            const acertijosJSON = config.riddles.map(r => ({
                id: String(r.id),
                tema: r.tema,
                pregunta: r.pregunta,
                respuesta: r.respuesta,
                opciones: Array.isArray(r.opciones) ? r.opciones : [r.respuesta]
            }));

            const fullConfig = {
                nivel: nivelKey,
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                fecha: details.date
                    ? details.date.split('T')[0]   // siempre "YYYY-MM-DD" para formatearFechaLarga()
                    : new Date().toISOString().split('T')[0],
                descripcion: details.description || '',
                nombreApp: details.gameName || 'Acertijos',
                plataformas: selectedPlats,
                tiempoLimite: config.timeLimit,
                // categoria: primer tema único de los acertijos (lo usa Acertijos.tsx línea 863)
                categoria: config.riddles.length > 0
                    ? [...new Set(config.riddles.map(r => r.tema))].join(', ')
                    : '',
                // problematicas: IDs para el flujo nativo (línea 862 de Acertijos.tsx)
                problematicas: config.riddles.map(r => r.id),
                acertijos: acertijosJSON
            };

            const configPath = "android/app/src/main/assets/public/config/acertijos-config.json";

            // ── CLAVE: NO reconstruir el ZIP — solo añadir/sobreescribir el archivo de config ──
            // Usar directamente el ZIP cargado y añadir el archivo de config sobre él.
            // Esto preserva TODOS los archivos originales, permisos, metadatos y compresión.
            // Crear la carpeta config/ si no existe en la plantilla
            const configDir = "android/app/src/main/assets/public/config/";
            if (!zipOriginal.folder(configDir)) {
                zipOriginal.folder(configDir);
            }
            const androidApplicationId = buildAcertijoApplicationId();
            zipOriginal.file(configPath, JSON.stringify(fullConfig, null, 2));
            await applyAcertijoAndroidMetadata(zipOriginal, { applicationId: androidApplicationId });

            setStatusText("Generando paquete final...");

            const blob = await zipOriginal.generateAsync({
                type: "blob",
                platform: "UNIX",
                // No forzar compresión: cada archivo mantiene su método original
            });


            const platformsSuffix = (Array.isArray(selectedPlatforms) ? selectedPlatforms : ['movil'])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'acertijo')}_${platformsSuffix}.zip`;
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
    };  // ← cierra generateAndDownloadAndroidZip

    // ── Descarga ZIP Combinado (Web + Android) ────────────────────────────────
    const generateAndDownloadCombinedZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        try {
            const outerZip = new window.JSZip();

            // ── Generar ZIP Web ──
            setStatusText("Generando paquete Web...");
            const htmlContent = generateGameCode(config, gameDetails, selectedPlatforms);
            const webZip = new window.JSZip();

            const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'acertijo')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            webZip.file(htmlFileName, htmlContent);
            const webBlob = await webZip.generateAsync({ type: "blob" });
            outerZip.file(`${normalizeFileName(gameDetails?.gameName || 'acertijo')}_web.zip`, webBlob);

            // ── Generar ZIP Android ──
            setStatusText("Descargando plantilla Android...");
            const response = await fetch('/templates/acertijos_android.zip');
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Inyectando configuración Android...");
            const zipOriginal = await window.JSZip.loadAsync(arrayBuffer);

            const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
            const nivelKey = nivelMap[config.difficulty] || 'basico';
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];

            const acertijosJSON = config.riddles.map(r => ({
                id: String(r.id),
                tema: r.tema,
                pregunta: r.pregunta,
                respuesta: r.respuesta,
                opciones: r.opciones || [r.respuesta]
            }));

            const fullConfig = {
                gameName: gameDetails.gameName || 'Juego de Acertijos',
                description: gameDetails.description || '',
                version: gameDetails.version || '1.0.0',
                date: gameDetails.date || new Date().toISOString(),
                authorName: gameDetails.authorName || gameDetails.author || '',
                platforms: selectedPlats,
                difficulty: config.difficulty,
                nivel: nivelKey,
                timeLimit: config.timeLimit,
                temas: config.riddles.length > 0 ? [...new Set(config.riddles.map(r => r.tema))].join(', ') : '',
                problematicas: config.riddles.map(r => r.id),
                acertijos: acertijosJSON
            };

            const configPath = "android/app/src/main/assets/public/config/acertijos-config.json";
            const configDir = "android/app/src/main/assets/public/config/";
            if (!zipOriginal.folder(configDir)) zipOriginal.folder(configDir);
            const androidApplicationId = buildAcertijoApplicationId();
            zipOriginal.file(configPath, JSON.stringify(fullConfig, null, 2));
            await applyAcertijoAndroidMetadata(zipOriginal, { applicationId: androidApplicationId });

            const androidBlob = await zipOriginal.generateAsync({ type: "blob", platform: "UNIX" });
            const mobilePlatforms = (selectedPlatforms ?? [])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            outerZip.file(`${normalizeFileName(gameDetails?.gameName || 'acertijo')}_${mobilePlatforms}.zip`, androidBlob);
            // ── Generar ZIP contenedor ──
            setStatusText("Empaquetando todo...");
            const finalBlob = await outerZip.generateAsync({ type: "blob" });

            const platformsLabel = (selectedPlatforms ?? [])
                .map(p => platformLabel(p))
                .join('_');
            const url = window.URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'acertijo')}_${platformsLabel}.zip`;

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
            // Normalizar: si ya trae T lo usa, si no le agrega T00:00:00 para evitar desfase de zona horaria
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
                        <div className="info-card-value">{gameDetails.gameName || 'No disponible'}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><Type size={16} /> Nombre del Autor</div>
                        <div className="info-card-value">
                            {gameDetails.authorName || gameDetails.author || 'No especificado'}
                        </div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header"><Layers size={16} /> Versión</div>
                        <div className="info-card-value">{gameDetails.version || '1.0.0'}</div>
                    </div>

                    <div className="info-card full-width">
                        <div className="info-card-header"><FileText size={16} /> Descripción</div>
                        <div className="info-card-value" style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                            {gameDetails.description || 'Sin descripción.'}
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-card-header"><Calendar size={16} /> Fecha de Creación</div>
                        <div className="info-card-value">{formatDate(gameDetails.date)}</div>
                    </div>

                    <div className="info-card">
                        <div className="info-card-header"><Monitor size={16} /> Plataformas</div>
                        <div className="info-card-value">
                            {selectedPlatforms && selectedPlatforms.length > 0
                                ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
                                : 'Web'}
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
                {/* Modificación: Cambio de grid a flex para una distribución más natural y compacta, igual a Summary.jsx */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', rowGap: '1rem', alignItems: 'center' }}>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Tag size={18} /> Temática:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>
                            {[...new Set(config.riddles.map(r => r.tema))].join(', ') || 'Varios'}
                        </strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Type size={18} /> Dificultad:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1).toLowerCase()}</strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Tiempo Límite:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>
                            {`${Math.floor(config.timeLimit / 60)}:${String(config.timeLimit % 60).padStart(2, '0')} minutos`}
                        </strong>
                    </div>
                    <div className="summary-row">
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><List size={18} /> Total de Acertijos:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.riddles.length}</strong>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#334155' }}>Acertijos incluidos en el paquete:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {config.riddles.map(r => (
                            <span key={r.id} style={{
                                background: 'white', padding: '6px 12px',
                                borderRadius: '20px', fontSize: '0.9rem', border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#475569'
                            }}>
                                {r.tema}: <b>{r.respuesta}</b>
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

            <div className="download-section" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '1.5rem', marginTop: '3rem', padding: '2rem',
                background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0'
            }}>
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
                        <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: '500' }}>
                                <span>{statusText}</span>
                                <span>{progress}%</span>
                            </div>
                            <div style={{
                                width: '100%', height: '14px', backgroundColor: '#e2e8f0',
                                borderRadius: '7px', overflow: 'hidden',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{
                                    width: `${progress}%`, height: '100%',
                                    backgroundColor: '#0077b6', transition: 'width 0.3s ease-out', borderRadius: '7px'
                                }} />
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

// --- COMPONENTE PRINCIPAL (ACERTIJO) ---
export default function Acertijo() {
    const [view, setView] = useState('home'); // 'home', 'game', 'summary'
    const [level, setLevel] = useState('Básico');
    const [selectedRiddles, setSelectedRiddles] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const levelConfig = {
        'Básico': { limit: 3, time: 300 },
        'Intermedio': { limit: 4, time: 600 },
        'Avanzado': { limit: 5, time: 900 }
    };

    // Estados del Juego
    const [gameRiddles, setGameRiddles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [options, setOptions] = useState([]);
    const timerRef = useRef(null);

    useEffect(() => {
        const s = document.createElement('script');
        s.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
        s.async = true;
        document.body.appendChild(s);
        return () => { if (document.body.contains(s)) document.body.removeChild(s); }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);

    useEffect(() => {
        setSelectedRiddles([]);
    }, [level]);

    useEffect(() => {
        if (view === 'game' && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000);
        } else if (view === 'game' && timeLeft === 0) {
            clearInterval(timerRef.current);
            window.Swal?.fire({ title: '¡Tiempo Agotado!', icon: 'warning', confirmButtonText: 'Siguiente' }).then(() => nextRiddle(score));
        }
        return () => clearInterval(timerRef.current);
    }, [view, timeLeft]);

    const handleLevelChange = (e) => {
        setLevel(e.target.value);
    };

    const handleResetSelection = () => {
        setSelectedRiddles([]);
    };

    const handleRiddleToggle = (riddle) => {
        const config = levelConfig[level];
        if (selectedRiddles.some(r => r.id === riddle.id)) {
            setSelectedRiddles(selectedRiddles.filter(r => r.id !== riddle.id));
        } else if (selectedRiddles.length < config.limit) {
            setSelectedRiddles([...selectedRiddles, riddle]);
        }
    };

    const startGame = () => {
        const config = levelConfig[level];
        const shuffled = [...selectedRiddles].sort(() => Math.random() - 0.5);
        setGameRiddles(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setTimeLeft(config.time);

        if (shuffled.length > 0) {
            const r = shuffled[0];
            setOptions(r.opciones ? [...r.opciones].sort(() => Math.random() - 0.5) : [r.respuesta, "Opción X", "Opción Y"]);
        }

        setView('game');
    };

    const handleAnswer = (ans) => {
        clearInterval(timerRef.current);
        const correct = gameRiddles[currentIndex].respuesta;
        if (ans === correct) {
            const newScore = score + 10;
            setScore(newScore);
            window.Swal?.fire({ icon: 'success', title: '¡Correcto!', timer: 1000, showConfirmButton: false }).then(() => nextRiddle(newScore));
        } else {
            window.Swal?.fire({ icon: 'error', title: 'Incorrecto', text: `Era: ${correct}` }).then(() => nextRiddle(score));
        }
    };

    const nextRiddle = (currentScore) => {
        const config = levelConfig[level];
        const next = currentIndex + 1;
        if (next < gameRiddles.length) {
            setCurrentIndex(next);
            const r = gameRiddles[next];
            setOptions(r.opciones ? [...r.opciones].sort(() => Math.random() - 0.5) : [r.respuesta, "Opción X", "Opción Y"]);
            setTimeLeft(config.time);
        } else {
            finishGame(currentScore);
        }
    };

    const finishGame = (finalScore) => {
        window.Swal?.fire({
            title: '¡Juego Completado!',
            html: `<p>Puntos Obtenidos: <strong>${finalScore}</strong></p>`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Volver a Jugar',
            cancelButtonText: 'Salir',
            confirmButtonColor: '#0077b6',
            cancelButtonColor: '#4b5563',
            reverseButtons: true,
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                // Volver a Jugar: Reinicia el juego con la misma configuración
                startGame();
            } else if (result.dismiss === window.Swal.DismissReason.cancel) {
                // Salir: Regresa a la pantalla de configuración
                setView('home');
            }
        });
    };

    // DESPUÉS:
    const goToSummary = () => {
        setView('summary');
        navigate('/settings?view=summary', {
            replace: true,
            state: {
                ...location.state,
                // Asegurar que gameDetails y selectedPlatforms llegan al Summary
                gameDetails: location.state?.gameDetails || {},
                selectedPlatforms: location.state?.selectedPlatforms || []
            }
        });
    };
    const currentConfig = levelConfig[level];

    // --- RENDERIZADO DEL PANEL DE CONFIGURACIÓN ---
    const renderConfigScreen = () => {
        return (
            <div className="config-screen">
                <div className="game-title">
                    {'Juego de Acertijos'.split('').map((letter, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.07}s` }}>
                            {letter === ' ' ? '\u00A0' : letter}
                        </span>
                    ))}
                </div>

                <div className="rules-text">
                    <h2>Configura tu juego seleccionando los acertijos.</h2>
                </div>

                <div className="config-controls">
                    <div className="control-group">
                        <label>Seleccione el nivel de dificultad:</label>
                        <select value={level} onChange={handleLevelChange}>
                            {Object.keys(levelConfig).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div className="control-group" style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <button className="no-rounded-button" style={{ backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', fontSize: '0.9rem' }} onClick={handleResetSelection}>
                            <RotateCcw size={16} /> Reiniciar Selección
                        </button>
                    </div>
                </div>

                <div className="riddle-catalog">
                    <div className="riddle-header">
                        <strong style={{ color: '#1f2937' }}>Catálogo de Acertijos</strong>
                        <span style={{ color: '#0077b6', fontWeight: 'bold' }}>{selectedRiddles.length} / {currentConfig.limit} Seleccionados</span>
                    </div>
                    <div className="riddle-grid">
                        {ACERTIJOS_POR_NIVEL[level.toLowerCase()]?.map(r => {
                            const isSelected = selectedRiddles.some(sel => sel.id === r.id);
                            return (
                                <button key={r.id} onClick={() => handleRiddleToggle(r)} className={`acertijo-select-btn ${isSelected ? 'selected' : ''}`}>
                                    <div style={{ marginTop: 2 }}>{isSelected ? <CheckCircle size={18} color="#0077b6" /> : <HelpCircle size={18} color="#ccc" />}</div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase' }}>{r.tema}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.pregunta}</div>
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

                    <button
                        onClick={startGame}
                        disabled={selectedRiddles.length !== currentConfig.limit}
                        className="no-rounded-button"
                    >
                        Siguiente <ArrowRight style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <Style />
            <div className="acertijo-container">
                {view === 'summary' && (
                    <Summary
                        config={{ difficulty: level, timeLimit: currentConfig.time, riddles: selectedRiddles }}
                        onBack={() => setView('home')}
                    />
                )}

                {view === 'game' && (
                    <div className="game-screen">

                        {/* TÍTULO ANIMADO AGREGADO AQUÍ */}
                        <div className="game-title">
                            {'Juego de Acertijos'.split('').map((letter, index) => (
                                <span key={index} style={{ animationDelay: `${index * 0.07}s` }}>
                                    {letter === ' ' ? '\u00A0' : letter}
                                </span>
                            ))}
                        </div>

                        {/* SUBTÍTULO (VISTA PREVIA) AGREGADO AQUÍ */}
                        <h3 style={{
                            textAlign: 'center',
                            color: '#6b7280',
                            marginTop: '-0.5rem',
                            marginBottom: '1.5rem',
                            fontWeight: '500'
                        }}>
                            (Vista Previa)
                        </h3>

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
                            <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>Resuelve el acertijo seleccionando la respuesta correcta.</span>
                        </div>
                        <div className="game-layout">
                            {/* COLUMNA IZQUIERDA: Pregunta y Respuestas */}
                            <div className="game-left-col">
                                <div className="question-card">
                                    <span className="topic-badge">Temática: {gameRiddles[currentIndex]?.tema}</span>
                                    <h2 className="question-text">"{gameRiddles[currentIndex]?.pregunta}"</h2>
                                </div>
                                <div className="answers-grid">
                                    {options.map((opt, i) => {
                                        const Icon = iconMap[opt]?.icon || HelpCircle;
                                        return (
                                            <button key={i} onClick={() => handleAnswer(opt)} className="answer-btn-modern">
                                                <Icon size={36} color="#0077b6" />
                                                <span>{opt}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: Estadísticas */}
                            <div className="game-right-col">
                                <div className="stats-block">
                                    <h3>Progreso</h3>
                                    <p className="stats-item">Nivel: <strong>{level}</strong></p>
                                    <div className="stats-item"><span>Tiempo:</span> <strong>{`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}</strong></div>

                                    <div className="stats-item"><span>Puntaje:</span> <strong>{score}</strong></div>
                                    <div className="stats-item"><span>Acertijo:</span> <strong>{currentIndex + 1}/{gameRiddles.length}</strong></div>
                                </div>
                                <button className="btn-primary" onClick={() => finishGame(score)}>
                                    Finalizar Juego
                                </button>
                            </div>
                        </div>

                        {/* FOOTER DE NAVEGACIÓN */}
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