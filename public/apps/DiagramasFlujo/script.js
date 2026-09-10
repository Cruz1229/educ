document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultScreen = document.getElementById('result-screen');
    const difficultyButtons = document.querySelectorAll('.btn-difficulty');
    const btnBack = document.getElementById('btn-back');
    const btnCheck = document.getElementById('btn-check');
    const btnClear = document.getElementById('btn-clear');
    const btnNext = document.getElementById('btn-next');
    const btnRetry = document.getElementById('btn-retry');
    const btnHint = document.getElementById('btn-hint');
    const problemDescription = document.getElementById('problem-description');
    const currentLevelDisplay = document.getElementById('current-level');
    const currentScoreDisplay = document.getElementById('current-score');
    const resultMessage = document.getElementById('result-message');
    const toolbox = document.getElementById('toolbox');
    
    // Variables del juego
    let currentLevel = '';
    let score = 0;
    let currentProblem = null;
    let diagram = null;
    let palette = null;
    
    // Problemas por nivel de dificultad
    const problems = {
        easy: [
            {
                id: 1,
                description: "Crea un diagrama de flujo que sume dos números ingresados por el usuario y muestre el resultado.",
                solution: [
                    { type: 'Start', text: 'Inicio', next: 1 },
                    { type: 'Input', text: 'Leer número A y B', next: 2 },
                    { type: 'Process', text: 'Sumar A + B', next: 3 },
                    { type: 'Output', text: 'Mostrar resultado', next: 4 },
                    { type: 'End', text: 'Fin', next: null }
                ],
                hints: [
                    "Comienza siempre con un nodo 'Inicio'",
                    "Necesitarás nodos de 'Entrada' para leer los números",
                    "Usa un nodo 'Proceso' para la suma",
                    "Termina siempre con un nodo 'Fin'"
                ]
            },
            {
                id: 2,
                description: "Diseña un diagrama que calcule el área de un rectángulo (base x altura).",
                solution: [
                    { type: 'Start', text: 'Inicio', next: 1 },
                    { type: 'Input', text: 'Leer base y altura', next: 2 },
                    { type: 'Process', text: 'Calcular base * altura', next: 3 },
                    { type: 'Output', text: 'Mostrar área', next: 4 },
                    { type: 'End', text: 'Fin', next: null }
                ],
                hints: [
                    "Recuerda la fórmula del área: base x altura",
                    "Necesitas dos valores de entrada",
                    "La multiplicación es un proceso"
                ]
            }
        ],
        medium: [
            {
                id: 1,
                description: "Crea un diagrama que determine si un número ingresado es par o impar.",
                solution: [
                    { type: 'Start', text: 'Inicio', next: 1 },
                    { type: 'Input', text: 'Leer número', next: 2 },
                    { type: 'Process', text: 'Calcular número % 2', next: 3 },
                    { type: 'Decision', text: '¿Resultado == 0?', next: { yes: 4, no: 5 } },
                    { type: 'Output', text: 'Mostrar "Par"', next: 6 },
                    { type: 'Output', text: 'Mostrar "Impar"', next: 6 },
                    { type: 'End', text: 'Fin', next: null }
                ],
                hints: [
                    "Usa el operador módulo (%) para determinar paridad",
                    "Necesitarás un nodo de 'Decisión'",
                    "La decisión debe tener dos caminos posibles"
                ]
            },
            {
                id: 2,
                description: "Diseña un diagrama que encuentre el mayor de tres números ingresados.",
                solution: [
                    { type: 'Start', text: 'Inicio', next: 1 },
                    { type: 'Input', text: 'Leer A, B, C', next: 2 },
                    { type: 'Decision', text: '¿A > B?', next: { yes: 3, no: 4 } },
                    { type: 'Decision', text: '¿A > C?', next: { yes: 7, no: 5 } },
                    { type: 'Decision', text: '¿B > C?', next: { yes: 8, no: 9 } },
                    { type: 'Output', text: 'Mostrar C', next: 6 },
                    { type: 'Output', text: 'Mostrar A', next: 6 },
                    { type: 'Output', text: 'Mostrar B', next: 6 },
                    { type: 'End', text: 'Fin', next: null }
                ],
                hints: [
                    "Compara los números de dos en dos",
                    "Necesitarás varias decisiones anidadas",
                    "Considera todos los casos posibles"
                ]
            }
        ],
        hard: [
            {
                id: 1,
                description: "Crea un diagrama que calcule el factorial de un número ingresado (n!).",
                solution: [
                    { type: 'Start', text: 'Inicio', next: 1 },
                    { type: 'Input', text: 'Leer número n', next: 2 },
                    { type: 'Process', text: 'factorial = 1, i = 1', next: 3 },
                    { type: 'Decision', text: '¿i <= n?', next: { yes: 4, no: 5 } },
                    { type: 'Process', text: 'factorial = factorial * i\ni = i + 1', next: 3 },
                    { type: 'Output', text: 'Mostrar factorial', next: 6 },
                    { type: 'End', text: 'Fin', next: null }
                ],
                hints: [
                    "El factorial requiere un bucle",
                    "Necesitas una variable acumuladora",
                    "No olvides actualizar el contador"
                ]
            },
            {
                id: 2,
                description: "Diseña un diagrama que determine si un número es primo o no.",
                solution: [
                    { type: 'Start', text: 'Inicio', next: 1 },
                    { type: 'Input', text: 'Leer número n', next: 2 },
                    { type: 'Decision', text: '¿n < 2?', next: { yes: 8, no: 3 } },
                    { type: 'Process', text: 'i = 2', next: 4 },
                    { type: 'Decision', text: '¿i <= n/2?', next: { yes: 5, no: 7 } },
                    { type: 'Decision', text: '¿n % i == 0?', next: { yes: 8, no: 6 } },
                    { type: 'Process', text: 'i = i + 1', next: 4 },
                    { type: 'Output', text: 'Mostrar "Primo"', next: 9 },
                    { type: 'Output', text: 'Mostrar "No primo"', next: 9 },
                    { type: 'End', text: 'Fin', next: null }
                ],
                hints: [
                    "Un número primo solo es divisible por 1 y sí mismo",
                    "Puedes comprobar divisores hasta n/2",
                    "Si encuentras un divisor, el número no es primo"
                ]
            }
        ]
    };

    // Inicializar GoJS
    function initDiagram() {
        const $ = go.GraphObject.make;
        
        diagram = $(go.Diagram, "diagram", {
            "undoManager.isEnabled": true,
            "grid.visible": true,
            allowCopy: false,
            allowDelete: false,
            "clickCreatingTool.archetypeNodeData": null, // Deshabilitar creación con clic
            "draggingTool.dragsTree": true,
            "linkingTool.isUnconnectedLinkValid": false,
            "linkingTool.portGravity": 20,
            "relinkingTool.isUnconnectedLinkValid": false
        });
        
        // Definir el modelo de nodos y enlaces
        diagram.nodeTemplateMap.add("Start",
            $(go.Node, "Spot",
                { locationSpot: go.Spot.Center },
                $(go.Shape, "Circle",
                    {
                        fill: "#2ecc71",
                        stroke: "#27ae60",
                        strokeWidth: 2,
                        width: 60,
                        height: 60
                    },
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    {
                        margin: 5,
                        stroke: "white",
                        font: "bold 12px sans-serif"
                    },
                    new go.Binding("text", "text"))
            ));
        
        diagram.nodeTemplateMap.add("End",
            $(go.Node, "Spot",
                { locationSpot: go.Spot.Center },
                $(go.Shape, "Circle",
                    {
                        fill: "#e74c3c",
                        stroke: "#c0392b",
                        strokeWidth: 2,
                        width: 60,
                        height: 60
                    },
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    {
                        margin: 5,
                        stroke: "white",
                        font: "bold 12px sans-serif"
                    },
                    new go.Binding("text", "text"))
            ));
        
        diagram.nodeTemplateMap.add("Process",
            $(go.Node, "Auto",
                { locationSpot: go.Spot.Center },
                $(go.Shape, "Rectangle",
                    {
                        fill: "#3498db",
                        stroke: "#2980b9",
                        strokeWidth: 2,
                        width: 100,
                        height: 60
                    },
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    {
                        margin: 5,
                        stroke: "white",
                        font: "bold 12px sans-serif",
                        textAlign: "center"
                    },
                    new go.Binding("text", "text"))
            ));
        
        diagram.nodeTemplateMap.add("Decision",
            $(go.Node, "Auto",
                { locationSpot: go.Spot.Center },
                $(go.Shape, "Diamond",
                    {
                        fill: "#f39c12",
                        stroke: "#d35400",
                        strokeWidth: 2,
                        width: 80,
                        height: 80
                    },
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    {
                        margin: 5,
                        stroke: "white",
                        font: "bold 12px sans-serif",
                        textAlign: "center"
                    },
                    new go.Binding("text", "text"))
            ));
        
        diagram.nodeTemplateMap.add("Input",
            $(go.Node, "Auto",
                { locationSpot: go.Spot.Center },
                $(go.Shape, "Parallelogram",
                    {
                        fill: "#9b59b6",
                        stroke: "#8e44ad",
                        strokeWidth: 2,
                        width: 120,
                        height: 60
                    },
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    {
                        margin: 5,
                        stroke: "white",
                        font: "bold 12px sans-serif",
                        textAlign: "center"
                    },
                    new go.Binding("text", "text"))
            ));
        
        diagram.nodeTemplateMap.add("Output",
            $(go.Node, "Auto",
                { locationSpot: go.Spot.Center },
                $(go.Shape, "Parallelogram",
                    {
                        fill: "#9b59b6",
                        stroke: "#8e44ad",
                        strokeWidth: 2,
                        width: 120,
                        height: 60
                    },
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    {
                        margin: 5,
                        stroke: "white",
                        font: "bold 12px sans-serif",
                        textAlign: "center"
                    },
                    new go.Binding("text", "text"))
            ));
        
        diagram.nodeTemplateMap.add("Comment",
            $(go.Node, "Auto",
                { locationSpot: go.Spot.Center },
                $(go.Shape, "Rectangle",
                    {
                        fill: "#f1c40f",
                        stroke: "#f39c12",
                        strokeWidth: 2,
                        width: 120,
                        height: 80
                    },
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    {
                        margin: 5,
                        stroke: "#34495e",
                        font: "italic 12px sans-serif",
                        textAlign: "center",
                        editable: true
                    },
                    new go.Binding("text", "text"))
            ));
        
        // Definir el template para los enlaces
        diagram.linkTemplate =
            $(go.Link,
                {
                    routing: go.Link.Orthogonal,
                    corner: 5,
                    relinkableFrom: true,
                    relinkableTo: true
                },
                $(go.Shape,
                    { strokeWidth: 2, stroke: "#34495e" }),
                $(go.Shape,
                    { toArrow: "Standard", stroke: null, fill: "#34495e" }),
                $(go.TextBlock,
                    {
                        textAlign: "center",
                        font: "10pt sans-serif",
                        stroke: "#34495e",
                        margin: 4,
                        editable: true
                    },
                    new go.Binding("text", "text"))
            );
        
        // Configurar puertos de conexión
        diagram.nodeTemplateMap.each(template => {
            template.ports = 
                $(go.Panel, "Auto",
                    $(go.Shape, "Circle",
                        { fill: "transparent", stroke: null, desiredSize: new go.Size(8, 8) }),
                    $(go.Shape, "Circle",
                        { fill: "#34495e", stroke: null, desiredSize: new go.Size(6, 6) },
                        new go.Binding("fill", "", portFill))
                );
            
            template.portSpots = [
                go.Spot.TopCenter,
                go.Spot.BottomCenter,
                go.Spot.LeftCenter,
                go.Spot.RightCenter
            ];
        });
        
        function portFill() {
            return "#34495e";
        }
    }
    
    // Inicializar la paleta de herramientas
    function initPalette() {
        const $ = go.GraphObject.make;
        
        palette = $(go.Palette, "toolbox");
        
        // Definir los nodos de la paleta
        palette.nodeTemplateMap = diagram.nodeTemplateMap;
        
        // Añadir nodos a la paleta
        palette.model = new go.GraphLinksModel([
            { key: "Start", category: "Start", text: "Inicio", color: "#2ecc71" },
            { key: "End", category: "End", text: "Fin", color: "#e74c3c" },
            { key: "Process", category: "Process", text: "Proceso", color: "#3498db" },
            { key: "Decision", category: "Decision", text: "Decisión", color: "#f39c12" },
            { key: "Input", category: "Input", text: "Entrada", color: "#9b59b6" },
            { key: "Output", category: "Output", text: "Salida", color: "#9b59b6" },
            { key: "Comment", category: "Comment", text: "Comentario", color: "#f1c40f" }
        ]);
    }
    
    // Event listeners para los botones de dificultad
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentLevel = this.getAttribute('data-level');
            currentLevelDisplay.textContent = this.textContent;
            startGame();
        });
    });
    
    // Botón para volver al menú principal
    btnBack.addEventListener('click', function() {
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        clearDiagram();
    });
    
    // Botón para verificar la solución
    btnCheck.addEventListener('click', checkSolution);
    
    // Botón para limpiar el diagrama
    btnClear.addEventListener('click', clearDiagram);
    
    // Botón para el siguiente problema
    btnNext.addEventListener('click', function() {
        resultScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        generateProblem();
    });
    
    // Botón para reintentar el mismo problema
    btnRetry.addEventListener('click', function() {
        resultScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        clearDiagram();
    });
    
    // Botón para mostrar una pista
    btnHint.addEventListener('click', showHint);
    
    // Iniciar el juego
    function startGame() {
        initDiagram();
        initPalette();
        
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        score = 0;
        currentScoreDisplay.textContent = score;
        generateProblem();
    }
    
    // Generar un problema aleatorio
    function generateProblem() {
        const levelProblems = problems[currentLevel];
        currentProblem = levelProblems[Math.floor(Math.random() * levelProblems.length)];
        problemDescription.textContent = currentProblem.description;
        clearDiagram();
    }
    
    // Limpiar el diagrama
    function clearDiagram() {
        if (diagram) {
            diagram.clear();
        }
    }
    
    // Verificar la solución del usuario
    function checkSolution() {
        // Implementación simplificada - en una aplicación real necesitarías una lógica más compleja
        
        // Verificar que hay nodos en el diagrama
        if (diagram.nodes.count === 0) {
            showResult(false, "El diagrama está vacío. ¡Agrega algunos nodos!");
            return;
        }
        
        // Verificar que hay un nodo de inicio
        const hasStart = diagram.nodes.any(node => node.category === "Start");
        if (!hasStart) {
            showResult(false, "Falta el nodo de Inicio. ¡Todos los diagramas deben comenzar con uno!");
            return;
        }
        
        // Verificar que hay un nodo de fin
        const hasEnd = diagram.nodes.any(node => node.category === "End");
        if (!hasEnd) {
            showResult(false, "Falta el nodo de Fin. ¡Todos los diagramas deben terminar con uno!");
            return;
        }
        
        // Verificar que hay conexiones
        if (diagram.links.count === 0) {
            showResult(false, "No hay conexiones entre los nodos. ¡Conéctalos para crear un flujo!");
            return;
        }
        
        // Verificación básica de estructura
        const startNodes = diagram.nodes.filter(node => node.category === "Start");
        if (startNodes.count > 1) {
            showResult(false, "Hay más de un nodo de Inicio. ¡Solo debe haber uno!");
            return;
        }
        
        const endNodes = diagram.nodes.filter(node => node.category === "End");
        if (endNodes.count > 1) {
            showResult(false, "Hay más de un nodo de Fin. ¡Solo debe haber uno!");
            return;
        }
        
        // Incrementar puntaje
        score += 10;
        currentScoreDisplay.textContent = score;
        
        showResult(true, "¡Correcto! Has creado un diagrama válido para este problema.");
    }
    
    // Mostrar el resultado
    function showResult(isSuccess, message) {
        gameScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
        
        resultMessage.textContent = message;
        resultMessage.className = isSuccess ? 'success' : 'error';
    }
    
    // Mostrar una pista
    function showHint() {
        if (!currentProblem || !currentProblem.hints || currentProblem.hints.length === 0) return;
        
        const randomHint = currentProblem.hints[Math.floor(Math.random() * currentProblem.hints.length)];
        alert(`Pista: ${randomHint}`);
    }
});