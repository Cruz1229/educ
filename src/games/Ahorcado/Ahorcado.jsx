import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IoArrowBackSharp } from "react-icons/io5";
import { GrLinkNext } from "react-icons/gr";
import Summary from './Summary';
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

// --- DATOS Y CONSTANTES ---

const wordDictionary = {
    básico: {
        "animales": [
            { word: 'perro', clue: 'Considerado el mejor amigo del hombre.' },
            { word: 'gato', clue: 'Felino doméstico que a menudo caza ratones.' },
            { word: 'pato', clue: 'Ave acuática que hace "cuac".' },
            { word: 'oso', clue: 'Gran mamífero que hiberna en invierno.' },
            { word: 'rata', clue: 'Roedor de gran tamaño, a menudo encontrado en ciudades.' },
            { word: 'ratón', clue: 'Pequeño roedor que ama el queso.' },
            { word: 'león', clue: 'Conocido como el "rey de la selva".' },
            { word: 'ave', clue: 'Animal con plumas que puede volar.' },
            { word: 'loro', clue: 'Pájaro tropical conocido por imitar sonidos.' },
            { word: 'pájaro', clue: 'Término general para animales voladores con plumas.' },
            { word: 'elefante', clue: 'Mamífero terrestre más grande con trompa.' },
            { word: 'jirafa', clue: 'Animal más alto con un cuello muy largo.' },
            { word: 'serpiente', clue: 'Reptil sin patas que se desliza.' },
            { word: 'pez', clue: 'Animal acuático que respira por branquias.' },
            { word: 'mono', clue: 'Primate ágil que vive en los árboles.' }
        ],
        "frutas": [
            { word: 'manzana', clue: 'Fruta que mantuvo al doctor alejado, según el dicho.' },
            { word: 'pera', clue: 'Fruta con forma de campana y piel verde o marrón.' },
            { word: 'uva', clue: 'Fruta pequeña que crece en racimos y se usa para hacer vino.' },
            { word: 'kiwi', clue: 'Fruta marrón y peluda por fuera, verde por dentro.' },
            { word: 'mango', clue: 'Fruta tropical dulce y jugosa con un gran hueso.' },
            { word: 'banana', clue: 'Fruta amarilla alargada rica en potasio.' },
            { word: 'sandía', clue: 'Gran fruta verde por fuera y roja por dentro, muy refrescante.' },
            { word: 'melón', clue: 'Fruta redonda de pulpa anaranjada o verde.' },
            { word: 'ciruela', clue: 'Fruta de piel morada o amarilla, a menudo se come seca.' },
            { word: 'naranja', clue: 'Cítrico redondo y de color anaranjado.' },
            { word: 'fresa', clue: 'Fruta roja pequeña con semillas por fuera.' },
            { word: 'piña', clue: 'Fruta tropical con una corona de hojas y piel dura.' },
            { word: 'limón', clue: 'Fruto cítrico verde y ácido' },
            { word: 'cereza', clue: 'Fruta pequeña y roja que a menudo viene en pares.' },
            { word: 'durazno', clue: 'Fruta de piel aterciopelada y pulpa jugosa.' }
        ],
        "órganos y su función": [
            { word: 'cerebro', clue: 'Principal órgano del sistema nervioso que controla el pensamiento.' },
            { word: 'corazón', clue: 'Órgano que bombea sangre a todo el cuerpo' },
            { word: 'pulmones', clue: 'Órganos principales de la respiración.' },
            { word: 'hígado', clue: 'Órgano que desintoxica la sangre y produce bilis.' },
            { word: 'riñones', clue: 'Órganos que filtran la sangre y producen orina.' },
            { word: 'piel', clue: 'El órgano más grande del cuerpo humano.' },
            { word: 'páncreas', clue: 'Produce insulina y enzimas digestivas.' },
            { word: 'intestinos', clue: 'Parte fundamental del sistema digestivo Su función principal es absorber los nutrientes' },
            { word: 'esófago', clue: 'Tubo que conecta la garganta con el estómago.' },
            { word: 'estómago', clue: 'Órgano donde se digiere la comida.' },
            { word: 'lengua', clue: 'Órgano muscular en la boca para gustar y hablar.' },
            { word: 'ojos', clue: 'Órganos de la visión.' },
            { word: 'oído', clue: 'Órgano responsable de la audición y el equilibrio.' }
        ]
    },
    intermedio: {
        "reacciones químicas": [
            { word: 'reacción química', clue: 'Procesos mediante los cuales una o más sustancias se convierten en otras.' },
            { word: 'reactivos', clue: 'Sustancia que interacciona con otra en una reacción química.' },
            { word: 'síntesis', clue: 'Reacción donde dos o más reactivos se combinan para formar un solo producto.' },
            { word: 'descomposición', clue: 'Reacción donde una sustancia se descompone en productos más simples.' },
            { word: 'desplazamiento', clue: 'Reacción donde un elemento reemplaza a otro en un compuesto.' },
            { word: 'combustión', clue: 'Reacción con oxígeno que produce energía y calor.' },
            { word: 'redox', clue: 'Reacción con transferencia de electrones (oxidación y reducción).' },
            { word: 'ácido-base', clue: 'Reacción entre un ácido y una base para formar agua y sal.' },
            { word: 'temperatura', clue: 'Factor que incrementa la velocidad de reacción.' },
            { word: 'catalizadores', clue: 'Sustancias que aumentan la velocidad de reacción sin consumirse.' },
            { word: 'químicas', clue: 'Propiedades de la composición de una sustancia.' },
            { word: 'físicas', clue: 'Características físicas de la materia.' }
        ],
        "aportaciones científicas": [
            { word: 'copérnico', clue: 'Astrónomo que estableció que el Sol es el centro del Universo.' },
            { word: 'galileo', clue: 'Primero que utilizó el telescopio en sus observaciones.' },
            { word: 'newton', clue: 'Dedujo la fuerza de la gravedad.' },
            { word: 'telescopio', clue: 'Instrumento óptico para observar objetos lejanos.' },
            { word: 'halley', clue: 'Cometa periódico que lleva su nombre.' },
            { word: 'urano', clue: 'Planeta descubierto por William Herschel.' },
            { word: 'galaxia', clue: 'Gran sistema estelar.' },
            { word: 'nebulosas', clue: 'Manchas blanquecinas en el fondo celeste.' },
            { word: 'satélite', clue: 'Cuerpo opaco que gira alrededor de un planeta.' },
            { word: 'artificial', clue: 'Vehículo puesto en órbita para recoger información.' }
        ],
        "sistema Solar": [
            { word: 'sol', clue: 'Es la estrella en el centro de nuestro sistema solar.' },
            { word: 'mercurio', clue: 'Es el planeta más cercano al Sol' },
            { word: 'venus', clue: 'Es el planeta más caliente de nuestro sistema solar.' },
            { word: 'tierra', clue: 'Nuestro planeta, es el tercero más alejado del Sol.' },
            { word: 'marte', clue: 'Es conocido como el "planeta rojo".' },
            { word: 'jupiter', clue: 'Es El planeta más grande de nuestro sistema solar.' },
            { word: 'saturno', clue: 'Es famoso por sus impresionantes anillos.' },
            { word: 'urano', clue: 'Tarda 84 años en dar la vuelta alrededor del sol' },
            { word: 'neptuno', clue: 'Es El planeta más alejado del Sol.' },
            { word: 'plutón', clue: 'Dejó de formar parte del sistema solar como planeta en 2006.' }
        ]
    },
    avanzado: {
        "ciencia": [
            { word: 'astronomía', clue: 'Ciencia que estudia los cuerpos celestes del universo.' },
            { word: 'biología', clue: 'Ciencia que estudia a los seres vivos.' },
            { word: 'química', clue: 'Ciencia que estudia la composición y propiedades de la materia.' },
            { word: 'física', clue: 'Ciencia que estudia la energía, la materia y sus interacciones.' },
            { word: 'matemáticas', clue: 'Ciencia que estudia los números, estructura, espacios y cambios.' },
            { word: 'geología', clue: 'Ciencia que estudia la Tierra, su composición y su historia.' },
            { word: 'meteorología', clue: 'Ciencia que estudia la atmósfera y el clima.' },
            { word: 'psicología', clue: 'Ciencia que estudia la mente y el comportamiento humano.' },
            { word: 'ecología', clue: 'Rama de la biología que estudia las relaciones de los organismos y su medio ambiente.' },
            { word: 'genética', clue: 'Rama de la biología que estudia la herencia.' },
            { word: 'evolución', clue: 'Teoría de Darwin sobre el cambio de las especies a lo largo del tiempo.' },
            { word: 'átomo', clue: 'La unidad más pequeña y simple de la materia.' },
            { word: 'molécula', clue: 'Conjunto de átomos que se unen mediante enlaces químicos.' },
            { word: 'gravedad', clue: 'Fuerza de atracción que actúa entre todos los objetos con masa.' }
        ],
        "tecnología": [
            { word: 'computadora', clue: 'Máquina electrónica que procesa información.' },
            { word: 'algoritmo', clue: 'Conjunto de instrucciones para resolver un problema.' },
            { word: 'aplicación', clue: 'Programa de software diseñado para una tarea específica.' },
            { word: 'internet', clue: 'Red global de computadoras interconectadas.' },
            { word: 'software', clue: 'Conjunto de programas e instrucciones para una computadora.' },
            { word: 'hardware', clue: 'Componentes físicos de una computadora.' },
            { word: 'robótica', clue: 'Diseño y operación de robots.' },
            { word: 'ciberseguridad', clue: 'Protección de sistemas informáticos.' },
            { word: 'teclado', clue: 'Dispositivo de entrada con teclas.' },
            { word: 'mouse', clue: 'Dispositivo señalador.' },
            { word: 'monitor', clue: 'Dispositivo de salida que muestra información visual.' },
            { word: 'computación', clue: 'Estudio y práctica de procesar información.' },
            { word: 'operativo', clue: 'Software que gestiona el hardware (Sistema ...).' },
            { word: 'programa', clue: 'Secuencia de instrucciones ejecutables.' },
            { word: 'cpu', clue: 'El cerebro del computador.' },
            { word: 'ram', clue: 'Memoria de acceso rápido temporal.' },
            { word: 'inteligencia', clue: 'Rama informática que busca imitar la mente humana (IA).' },
            { word: 'programación', clue: 'Proceso de codificar instrucciones.' },
            { word: 'web', clue: 'Sistema de documentos accesibles por Internet.' },
            { word: 'lenguaje', clue: 'Reglas y símbolos para programar (... de programación).' }
        ],
        "seres vivos": [
            { word: 'biodiversidad', clue: 'Variedad de especies de seres vivos.' },
            { word: 'alimenticia', clue: 'Cadena de transferencia de nutrientes.' },
            { word: 'fotosíntesis', clue: 'Proceso de las plantas usando luz solar.' },
            { word: 'hábitat', clue: 'Lugar físico donde vive una comunidad.' },
            { word: 'simbiosis', clue: 'Coexistencia dependiente entre especies.' },
            { word: 'deforestación', clue: 'Eliminación de bosques.' },
            { word: 'herbívoros', clue: 'Se alimentan de material vegetal.' },
            { word: 'planta', clue: 'Organismo que produce oxígeno y necesita sol.' },
            { word: 'ave', clue: 'Vertebrado con plumas y alas.' },
            { word: 'microorganismos', clue: 'Seres vivos microscópicos.' },
            { word: 'seres', clue: 'Organismos que nacen, crecen y mueren (... vivos).' },
            { word: 'mutualismo', clue: 'Interacción beneficiosa para ambas partes.' },
            { word: 'depredación', clue: 'Un animal caza a otro.' },
            { word: 'parasitismo', clue: 'Un organismo vive a expensas de otro.' }
        ]
    }
};

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

const MAX_ATTEMPTS = hangmanDrawings.length - 1;

const difficultySettings = {
    básico: { wordCount: 3, time: 180, label: 'Básico: 3 palabras' },
    intermedio: { wordCount: 4, time: 300, label: 'Intermedio: 4 palabras' },
    avanzado: { wordCount: 5, time: 600, label: 'Avanzado: 5 palabras' }
};

// --- FUNCIÓN PARA GENERAR HTML DESCARGABLE (PLANTILLA) ---
const generateGameCode = (config) => {
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
            --primary-color: #3b82f6; --secondary-color: #1f2937; --light-gray: #f3f4f6;
            --medium-gray: #d1d5db; --dark-gray: #4b5563; --correct: #22c55e; --wrong: #ef4444;
            --light-text: #ffffff; --dark-text: #111827;
        }
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; display: flex; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 900px; }
        h1 { text-align: center; color: var(--secondary-color); }
        .game-area { display: grid; grid-template-columns: 1fr 250px; gap: 2rem; }
        .drawing pre { font-family: monospace; font-size: 1.2rem; background: #fafafa; padding: 1rem; border: 1px solid var(--medium-gray); border-radius: 0.5rem; }
        .word-container { margin: 1rem 0; font-size: 2rem; letter-spacing: 0.5rem; font-weight: bold; text-align: center; min-height: 50px; }
        .keyboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(35px, 1fr)); gap: 5px; margin-top: 1rem; }
        button.key { padding: 10px; cursor: pointer; border: 1px solid var(--medium-gray); background: white; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
        button.key:hover:not(:disabled) { background: var(--primary-color); color: white; }
        button.key:disabled { cursor: not-allowed; opacity: 0.6; }
        button.key.correct { background: var(--correct); color: white; border-color: var(--correct); }
        button.key.wrong { background: var(--dark-gray); color: white; border-color: var(--dark-gray); }
        .stats { border: 1px solid var(--medium-gray); padding: 1rem; border-radius: 0.5rem; height: fit-content; }
        .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; color: white; }
        .btn-hint { background: var(--primary-color); }
        .btn-reset { background: var(--secondary-color); }
        @media(max-width: 700px) { .game-area { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>Ahorcado: ${config.category.toUpperCase()}</h1>
        <p id="clue-text"></p>
        <div class="game-area">
            <div>
                <div class="drawing" id="drawing-area"><pre></pre></div>
                <div class="word-container" id="word-display"></div>
                <div class="keyboard" id="keyboard"></div>
            </div>
            <div class="stats">
                <h3>Progreso</h3>
                <p>Palabra: <strong id="word-counter"></strong></p>
                <p>Tiempo: <strong id="timer"></strong>s</p>
                <p>Puntaje: <strong id="score">0</strong></p>
                <button class="btn btn-hint" id="btn-hint" onclick="useHint()">Revelar Pista</button>
                <button class="btn btn-reset" onclick="location.reload()">Reiniciar</button>
            </div>
        </div>
    </div>

    <script>
        const config = ${JSON.stringify(config)};
        let currentWordIndex = 0, score = 0, wrongAttempts = 0, timeLeft = config.timeLimit;
        let guessedLetters = [], timerInterval;
        let hintUsed = false;
        const drawings = [
            \`\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========\`,
            \`\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========\`,
            \`\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========\`,
            \`\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========\`,
            \`\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========\`,
            \`\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========\`,
            \`\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========\`
        ];

        function initGame() {
            if(currentWordIndex >= config.words.length) {
                Swal.fire({ title: '¡Juego Completado!', text: 'Puntaje Final: ' + score, icon: 'success' }).then(()=> location.reload());
                return;
            }
            guessedLetters = [];
            wrongAttempts = 0;
            timeLeft = config.timeLimit;
            hintUsed = false;
            document.getElementById('btn-hint').innerText = "Revelar Pista";
            document.getElementById('btn-hint').disabled = false;
            updateUI();
            startTimer();
            generateKeyboard();
        }

        function updateUI() {
            const current = config.words[currentWordIndex];
            document.getElementById('clue-text').innerHTML = '<strong>Pista:</strong> ' + current.clue;
            document.getElementById('word-counter').innerText = (currentWordIndex + 1) + ' de ' + config.words.length;
            document.getElementById('drawing-area').innerHTML = '<pre>' + drawings[wrongAttempts] + '</pre>';
            document.getElementById('score').innerText = score;
            
            const wordDisplay = current.word.split('').map(l => guessedLetters.includes(l) ? l : '_').join(' ');
            document.getElementById('word-display').innerText = wordDisplay;
        }

        function generateKeyboard() {
            const kb = document.getElementById('keyboard');
            kb.innerHTML = '';
            'abcdefghijklmnopqrstuvwxyzñáéíóú'.split('').forEach(letter => {
                const btn = document.createElement('button');
                btn.className = 'key';
                btn.innerText = letter;
                btn.onclick = () => handleGuess(letter, btn);
                if(guessedLetters.includes(letter)) btn.disabled = true;
                kb.appendChild(btn);
            });
        }

        function handleGuess(letter, btnElement) {
            if(guessedLetters.includes(letter)) return;
            guessedLetters.push(letter);
            const word = config.words[currentWordIndex].word.toLowerCase();
            
            if(word.includes(letter)) {
                if(btnElement) btnElement.classList.add('correct');
            } else {
                if(btnElement) btnElement.classList.add('wrong');
                wrongAttempts++;
            }
            
            if(btnElement) btnElement.disabled = true;
            updateUI();
            checkWinLoss();
        }

        function useHint() {
            if(hintUsed || wrongAttempts >= drawings.length - 1) return;
            const word = config.words[currentWordIndex].word.toLowerCase();
            const available = word.split('').filter(l => !guessedLetters.includes(l));
            if(available.length > 1) {
                const random = available[Math.floor(Math.random() * available.length)];
                hintUsed = true;
                wrongAttempts++; 
                handleGuess(random, document.querySelector(\`button.key[innerText="\${random}"]\`)); // Logic simplification
                // Refresh keyboard visually
                generateKeyboard();
                updateUI();
                document.getElementById('btn-hint').innerText = "Pista Usada";
                document.getElementById('btn-hint').disabled = true;
                Swal.fire({toast: true, position: 'top-end', icon: 'info', title: 'Pista: ' + random.toUpperCase(), timer: 1500, showConfirmButton: false});
            }
        }

        function checkWinLoss() {
            const word = config.words[currentWordIndex].word.toLowerCase();
            const isWin = word.split('').every(l => guessedLetters.includes(l));
            const isLoss = wrongAttempts >= drawings.length - 1;

            if(isWin) {
                clearInterval(timerInterval);
                score += 10;
                Swal.fire({title: '¡Correcto!', icon: 'success', timer: 1500, showConfirmButton: false}).then(() => {
                    currentWordIndex++;
                    initGame();
                });
            } else if(isLoss) {
                clearInterval(timerInterval);
                Swal.fire({title: '¡Perdiste!', text: 'La palabra era: ' + word, icon: 'error'}).then(() => {
                    currentWordIndex++; // O terminar juego
                    initGame();
                });
            }
        }

        function startTimer() {
            clearInterval(timerInterval);
            document.getElementById('timer').innerText = timeLeft;
            timerInterval = setInterval(() => {
                timeLeft--;
                document.getElementById('timer').innerText = timeLeft;
                if(timeLeft <= 0) {
                    clearInterval(timerInterval);
                    Swal.fire({title: 'Tiempo Agotado', icon: 'warning'}).then(() => {
                        currentWordIndex++;
                        initGame();
                    });
                }
            }, 1000);
        }

        initGame();
    </script>
</body>
</html>`;
};


// --- COMPONENTE DE ESTILOS ---
const Style = () => (
    <style>{`
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

    .ahorcado-container {
      background: var(--light-text);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 2rem;
      width: 100%;
      max-width: 950px;
      margin: 20px auto;
      color: var(--dark-text);
    }

    /* --- TÍTULO ANIMADO --- */
    .game-title {
        text-align: center;
        font-size: 3rem;
        font-weight: 700;
        color: var(--secondary-color);
        margin-bottom: 1rem;
        display: flex;
        justify-content: center;
    }

    .game-title span {
        display: inline-block;
        animation: wave-animation 1.8s infinite;
        position: relative;
    }

    @keyframes wave-animation {
        0%, 40%, 100% {
            transform: translateY(0);
        }
        20% {
            transform: translateY(-20px);
        }
    }

    /* --- PANTALLA DE CONFIGURACIÓN --- */
    .config-screen {
      display: flex;
      flex-direction: column;
      gap: 2rem;
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
    }
    .config-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center; /* Centrar botones */
    }
    .config-buttons button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background-color: var(--primary-color);
      color: var(--light-text);
    }
    .btn-primary:hover {
      background-color: #0077b6;
    }
    .btn-secondary {
      background-color: var(--dark-gray-color);
      color: var(--light-text);
    }
     .btn-secondary:hover {
      background-color: #374151;
    }
    .btn-primary:disabled, .btn-secondary:disabled {
      background-color: var(--medium-gray-color);
      cursor: not-allowed;
    }
    
    .btn-success {
        background-color: var(--correct-color);
        color: white;
    }
    .btn-success:hover {
        background-color: #16a34a;
    }

    .word-catalog {
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;
    }
    .word-catalog h3 {
      text-align: left;
      margin-top: 0;
      color: var(--dark-text);
    }
    .word-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.75rem;
    }
    .word-btn {
      padding: 0.5rem;
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      cursor: pointer;
      background-color: #fff;
      transition: all 0.2s;
      font-weight: 500;
      color: var(--dark-text);
    }
    .word-btn:hover {
      background-color: var(--light-gray-color);
    }
    .word-btn.selected {
      background-color: var(--primary-color);
      color: var(--light-text);
      border-color: var(--primary-color);
    }
    
    /* Footer de configuración para botones Anterior/Siguiente */
    .config-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 2rem;
        border-top: 1px solid var(--medium-gray-color);
        padding-top: 1.5rem;
    }
    .config-footer button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: all 0.2s;
    }

    /* --- PANTALLA DE JUEGO --- */
    .game-screen {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    .clue-text {
        font-size: 1.1rem;
        color: var(--dark-gray-color);
        text-align: left;
    }
    .game-layout {
        display: grid;
        grid-template-columns: 1fr 250px;
        gap: 2rem;
    }
    .game-left-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }
    .hangman-display {
      border: 1px solid var(--medium-gray-color);
      border-radius: var(--border-radius);
      padding: 1rem;
      background-color: #fafafa;
    }
    .hangman-display pre {
      font-family: 'Courier New', Courier, monospace;
      font-size: 1.2rem;
      color: var(--secondary-color);
      margin: 0;
    }
    .word-display {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .letter {
      width: 40px;
      height: 40px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      font-size: 1.8rem;
      font-weight: 700;
      border-bottom: 3px solid var(--secondary-color);
      color: var(--dark-text);
      text-transform: uppercase;
    }
    .keyboard-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
      gap: 0.5rem;
      width: 100%;
    }
    .keyboard-container button {
      height: 45px;
      font-size: 1.2rem;
      font-weight: 600;
      text-transform: uppercase;
      border: 1px solid var(--medium-gray-color);
      border-radius: 5px;
      cursor: pointer;
      background-color: #fff;
      transition: all 0.2s;
      color: var(--dark-text);
    }
    .keyboard-container button:not(:disabled):hover {
      background-color: var(--primary-color);
      color: var(--light-text);
    }
    .keyboard-container button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .keyboard-container button.correct-letter {
      background-color: var(--correct-color);
      color: var(--light-text);
    }
    .keyboard-container button.used-letter {
      background-color: var(--dark-gray-color);
      color: var(--light-text);
    }
    .game-right-col {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        text-align: left;
    }
    .stats-block {
        border: 1px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        padding: 1rem;
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
    }
    .stats-item strong {
        font-weight: 700;
        color: var(--dark-text);
    }
    
    /* --- NAVIGATION BUTTONS IN GAME (UPDATED) --- */
    .nav-footer {
        display: flex;
        flex-direction: row; /* Cambiado a fila para alineación horizontal */
        justify-content: center; /* Centrado horizontal */
        gap: 1.5rem; /* Espacio entre botones */
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--medium-gray-color);
        width: 100%; /* Ancho completo */
    }

    /* --- SUMMARY SCREEN --- */
    .summary-screen {
        text-align: center;
    }
    .summary-card {
        background: #fff;
        border: 1px solid var(--medium-gray-color);
        border-radius: var(--border-radius);
        padding: 2rem;
        margin-bottom: 2rem;
        text-align: left;
    }
    .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
    }
    .summary-row:last-child { border-bottom: none; }
    .download-section {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .config-controls, .game-layout {
        grid-template-columns: 1fr;
      }
    }
    `}</style>
);



// --- COMPONENTE PRINCIPAL ---
const Ahorcado = () => {
    const navigate = useNavigate(); // Hook para navegación
    const location = useLocation(); // 
    // Estados de flujo y configuración
    // 'config', 'playing', 'word-result', 'session-over', 'summary'
    const [gameStep, setGameStep] = useState('config');
    const [difficulty, setDifficulty] = useState('básico');
    const [selectedCategory, setSelectedCategory] = useState('animales');
    const [isCatalogVisible, setIsCatalogVisible] = useState(false);
    const [selectedWords, setSelectedWords] = useState([]);

    // Estados de la partida
    const [wordList, setWordList] = useState([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isProcessingLetter, setIsProcessingLetter] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);

    // --- NUEVO CÓDIGO AÑADIDO: SCROLL AL TOP ---
    // Esto se ejecutará cada vez que 'gameStep' cambie o el componente se monte.
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [gameStep]);
    // ------------------------------------------

    const currentWordData = wordList[currentWordIndex] || {};
    const word = (currentWordData.word || '').toLowerCase();
    const wordCountLimit = difficultySettings[difficulty].wordCount;

    // Cargar SweetAlert2
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.contains(script) && document.body.removeChild(script); };
    }, []);

    // --- MANEJADORES DE CONFIGURACIÓN ---
    const handleDifficultyChange = (e) => {
        const newDifficulty = e.target.value;
        setDifficulty(newDifficulty);
        const firstCategory = Object.keys(wordDictionary[newDifficulty])[0];
        setSelectedCategory(firstCategory);
        setSelectedWords([]);
        setIsCatalogVisible(false);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedWords([]);
        setIsCatalogVisible(false);
    };

    const handleWordToggle = (wordObj) => {
        setSelectedWords(prev => {
            const isSelected = prev.some(w => w.word === wordObj.word);
            if (isSelected) {
                return prev.filter(w => w.word !== wordObj.word);
            }
            if (prev.length < wordCountLimit) {
                return [...prev, wordObj];
            }
            return prev;
        });
    };

    const handleStartGame = () => {
        setWordList(selectedWords);
        setCurrentWordIndex(0);
        setGuessedLetters([]);
        setWrongAttempts(0);
        setScore(0);
        setTimeLeft(difficultySettings[difficulty].time);
        setHintUsed(false);
        setGameStep('playing');
    };

    const returnToConfig = () => {
        setGameStep('config');
        // No limpiamos selectedWords para que el usuario pueda editar
    };

    const resetToConfig = () => {
        setGameStep('config');
        setIsCatalogVisible(false);
        setSelectedWords([]);
        setWordList([]);
    };

    const goToSummary = () => {
        setGameStep('summary');
        // Actualizar la URL para que el ProgressBar muestre 100% PERO manteniendo el state
        navigate('/settings?view=summary', {
            replace: true,
            state: location.state // Pasar el state que ya existía
        });
    };

    // --- LÓGICA DEL JUEGO ---
    const handleLetterClick = useCallback((letter) => {
        if (gameStep !== 'playing' || guessedLetters.includes(letter) || isProcessingLetter) return;

        setIsProcessingLetter(true);

        setGuessedLetters(prev => [...prev, letter]);
        if (!word.includes(letter)) {
            setWrongAttempts(prev => prev + 1);
        }
    }, [gameStep, guessedLetters, word, isProcessingLetter]);

    const handleHint = useCallback(() => {
        if (gameStep !== 'playing' || hintUsed || wrongAttempts >= MAX_ATTEMPTS) {
            if (window.Swal && hintUsed) {
                window.Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'warning',
                    title: 'Ya usaste la pista para esta palabra.',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
            return;
        }

        const unguessedLetters = [...word].filter(letter => !guessedLetters.includes(letter));

        if (unguessedLetters.length <= 1) {
            if (window.Swal) {
                window.Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: 'No quedan suficientes letras para una pista útil.',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
            return;
        }

        const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];

        setHintUsed(true);
        setWrongAttempts(prev => prev + 1);
        handleLetterClick(randomLetter);

        if (window.Swal) {
            window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: `Pista revelada: '${randomLetter.toUpperCase()}'`,
                text: '¡Te ha costado un intento!',
                showConfirmButton: false,
                timer: 2500,
            });
        }
    }, [gameStep, hintUsed, wrongAttempts, word, guessedLetters, handleLetterClick]);

    // Timer
    useEffect(() => {
        if (gameStep !== 'playing' || timeLeft <= 0) return;
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [gameStep, timeLeft]);

    useEffect(() => {
        if (isProcessingLetter) {
            setIsProcessingLetter(false);
        }
    }, [guessedLetters]);


    // Win/Loss
    useEffect(() => {
        if (gameStep !== 'playing' || !word) return;
        const isWin = [...word].every(letter => guessedLetters.includes(letter));
        const isLoss = wrongAttempts >= MAX_ATTEMPTS;
        const isTimeout = timeLeft <= 0;

        if (isWin || isLoss || isTimeout) {
            setGameStep('word-result');

            let pointsWon = 0;
            if (isWin) {
                pointsWon = 10;
                setScore(prev => prev + pointsWon);
            }

            const hasNextWord = currentWordIndex < wordList.length - 1;

            if (window.Swal) {
                window.Swal.fire({
                    title: isWin ? '¡Correcto!' : (isLoss ? '¡Ahorcado!' : '¡Tiempo Agotado!'),
                    html: `<p>La palabra era: <strong>${word.toUpperCase()}</strong></p>${isWin ? `<p>Ganaste ${pointsWon} puntos.</p>` : ''}`,
                    icon: isWin ? 'success' : 'error',
                    confirmButtonText: hasNextWord ? 'Siguiente Palabra' : 'Ver Resultados',
                    allowOutsideClick: false,
                }).then(() => {
                    if (hasNextWord) {
                        setCurrentWordIndex(prev => prev + 1);
                        setGuessedLetters([]);
                        setWrongAttempts(0);
                        setTimeLeft(difficultySettings[difficulty].time);
                        setHintUsed(false);
                        setGameStep('playing');
                    } else {
                        setGameStep('session-over');
                    }
                });
            }
        }
    }, [guessedLetters, wrongAttempts, timeLeft, gameStep, word, currentWordIndex, wordList, difficulty]);

    // Fin de sesión
    useEffect(() => {
        if (gameStep !== 'session-over' || !window.Swal) return;
        window.Swal.fire({
            title: '¡Fin de la Prueba!',
            html: `<p>Puntaje final:</p><h2 style="font-size: 2.5rem; color: var(--primary-color);">${score}</h2>`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Terminar Configuración',
            cancelButtonText: 'Volver a Jugar'
        }).then((result) => {
            if (result.isConfirmed) {
                goToSummary();
            } else {
                handleStartGame(); // Replay same config
            }
        });
    }, [gameStep, score]);

    const renderConfigScreen = () => {
        const catalogWords = wordDictionary[difficulty]?.[selectedCategory] || [];
        return (
            <div className="config-screen">
                <div className="game-title">
                    {'Juego del Ahorcado'.split('').map((letter, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.07}s` }}>
                            {letter === ' ' ? '\u00A0' : letter}
                        </span>
                    ))}
                </div>
                <div className="rules-text">
                    <h2>Configura tu juego seleccionando palabras.</h2>
                </div>
                <div className="config-controls">
                    <div className="control-group">
                        <label htmlFor="difficulty-select">Seleccione el nivel de dificultad:</label>
                        <select id="difficulty-select" value={difficulty} onChange={handleDifficultyChange}>
                            {Object.entries(difficultySettings).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="control-group">
                        <label htmlFor="category-select">Seleccione la categoría:</label>
                        <select id="category-select" value={selectedCategory} onChange={handleCategoryChange}>
                            {Object.keys(wordDictionary[difficulty]).map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Botón de Catálogo Centrado */}
                <div className="config-buttons">
                    <button className="no-rounded-button" onClick={() => setIsCatalogVisible(true)}>Mostrar Catálogo de palabras</button>
                </div>

                {isCatalogVisible && (
                    <div className="word-catalog">
                        <h3>Seleccione las palabras para su juego ({selectedWords.length}/{wordCountLimit})</h3>
                        <div className="word-grid">
                            {catalogWords.map(wordObj => (
                                <button
                                    key={wordObj.word}
                                    className={`word-btn ${selectedWords.some(w => w.word === wordObj.word) ? 'selected' : ''}`}
                                    onClick={() => handleWordToggle(wordObj)}
                                >
                                    {wordObj.word.charAt(0).toUpperCase() + wordObj.word.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer de Navegación Inferior */}
                <div className="config-footer">
                    <button className="no-rounded-button" onClick={() => navigate(-1)}>
                        <IconArrowBack /> Anterior
                    </button>
                    <button className="no-rounded-button" onClick={handleStartGame} disabled={selectedWords.length !== wordCountLimit}>
                        Siguiente <GrLinkNext />
                    </button>
                </div>

            </div>
        );
    };

    const renderGameScreen = () => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyzñáéíóú';
        return (
            <div className="game-screen">
                <p className="clue-text"><strong>Vista Previa - Pista:</strong> {currentWordData.clue}</p>
                <div className="game-layout">
                    <div className="game-left-col">
                        <div className="hangman-display"><pre>{hangmanDrawings[wrongAttempts]}</pre></div>
                        <div className="word-display">
                            {word.split('').map((letter, index) => (
                                <span key={index} className="letter">{guessedLetters.includes(letter) ? letter : ''}</span>
                            ))}
                        </div>
                        <div className="keyboard-container">
                            {alphabet.split('').map(letter => (
                                <button key={letter} onClick={() => handleLetterClick(letter)}
                                    disabled={guessedLetters.includes(letter) || isProcessingLetter}
                                    className={guessedLetters.includes(letter) ? (word.includes(letter) ? 'correct-letter' : 'used-letter') : ''}>
                                    {letter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="game-right-col">
                        <div className="stats-block">
                            <h3>Progreso</h3>
                            <p className="stats-item">Nivel: <strong>{difficultySettings[difficulty].label.split(':')[0]}</strong></p>
                            <p className="stats-item">Categoría: <strong>{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</strong></p>
                            <p className="stats-item">Palabra: <strong>{currentWordIndex + 1} de {wordList.length}</strong></p>
                            <p className="stats-item">Tiempo: <strong>{`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}</strong></p>

                            <p className="stats-item">Puntaje: <strong>{score}</strong></p>
                        </div>
                        <button className="btn-primary" onClick={handleHint} disabled={hintUsed || gameStep !== 'playing'}>
                            {hintUsed ? 'Pista Usada' : 'Revelar Pista'}
                        </button>
                    </div>
                </div>

                {/* BOTONES MOVIDOS AQUÍ (FUERA DE LAS COLUMNAS) */}
                <div className="nav-footer">
                    <button className="no-rounded-button" onClick={returnToConfig}><IconArrowBack /> Anterior </button>
                    <button className="no-rounded-button" onClick={goToSummary}><IconConfigure /> Terminar Configuración <GrLinkNext /></button>
                </div>

            </div>
        );
    };

    return (
        <>
            <Style />
            <div className="ahorcado-container">
                {gameStep === 'config' && renderConfigScreen()}
                {gameStep === 'playing' && renderGameScreen()}
                {gameStep === 'word-result' && renderGameScreen()}
                {gameStep === 'session-over' && renderGameScreen()}
                {gameStep === 'summary' && (
                    <Summary
                        config={{
                            category: selectedCategory,
                            difficulty: difficulty,
                            words: selectedWords,
                            timeLimit: difficultySettings[difficulty].time
                        }}
                        onBack={returnToConfig}
                    />
                )}
            </div>
        </>
    );
};

export default Ahorcado;