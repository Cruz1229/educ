import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
// Eliminamos imports directos de librerías externas para evitar errores de compilación
// Usaremos carga dinámica vía CDN
import {
    Timer, Trophy, Star as CheckCircle,
    Download, ArrowLeft, Tag, Layers, FileText, Calendar, Monitor,
    Shapes, Puzzle, Type, Clock, List,
    Play, ArrowRight, Check, Grid, Palette, User
} from 'lucide-react';

// --- HELPER PARA CARGAR SCRIPTS EXTERNOS ---
const loadScript = (src, id) => {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.crossOrigin = "anonymous";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Error loading script ${src}`));
        document.body.appendChild(script);
    });
};

// --- DEFINICIÓN DE FUNCIONES GEOMÉTRICAS (Globales para que funcionen en new Function) ---
const defineGlobalHelpers = () => {
    if (typeof window !== 'undefined') {
        window.getStarPoints = function (numPoints, innerRadius, outerRadius, centerX, centerY) {
            const points = [];
            const step = Math.PI / numPoints;
            let angle = -Math.PI / 2;
            for (let i = 0; i < numPoints * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                points.push({ x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius });
                angle += step;
            }
            return points;
        };

        window.getPolygonPoints = function (sides, radius, centerX, centerY, rotationDeg = 0) {
            const points = [];
            const step = (Math.PI * 2) / sides;
            let angle = -Math.PI / 2 + (rotationDeg * Math.PI / 180);
            for (let i = 0; i < sides; i++) {
                points.push({ x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius });
                angle += step;
            }
            return points;
        };

        window.getDonutPath = function (x, y, rOut, rIn) {
            return `M ${x} ${y - rOut} A ${rOut} ${rOut} 0 1 1 ${x} ${y + rOut} A ${rOut} ${rOut} 0 1 1 ${x} ${y - rOut} Z M ${x} ${y - rIn} A ${rIn} ${rIn} 0 1 0 ${x} ${y + rIn} A ${rIn} ${rIn} 0 1 0 ${x} ${y - rIn} Z`;
        };

        window.getWedgePath = function (cx, cy, r, startAngle, endAngle) {
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);
            return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
        };
    }
};

// --- ESTILOS COMPARTIDOS ---
const Style = () => (
    <style>{`
   @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap');
    
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

   body { background-color: #f0f2f5; margin: 0; }

    .acertijo-container {
      background: var(--light-text);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 2rem;
      width: 100%;
      max-width: 950px;  /* CAMBIO: era 1200px */
      margin: 20px auto;
      color: var(--dark-text);
      min-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .game-title {
    text-align: center; 
    font-size: 3rem; 
    font-weight: 700; 
    color: var(--secondary-color);
    margin-bottom: 1rem; 
    display: flex; 
    justify-content: center; 
    flex-wrap: wrap; 
    font-family: 'Inter', 'Segoe UI', sans-serif;
}
    .game-title span { 
        display: inline-block; 
        animation: wave-animation 1.8s infinite; 
        position: relative; 
    }
    @keyframes wave-animation { 
        0%, 40%, 100% { transform: translateY(0); } 
        20% { transform: translateY(-20px); }  /* CAMBIO: era -10px */
    }
    .config-screen { display: flex; flex-direction: column; gap: 2rem; flex-grow: 1; }
    .rules-text { text-align: center; color: var(--dark-gray-color); padding-bottom: 1.5rem; border-bottom: 1px solid var(--medium-gray-color); margin-top: 1rem; }
    .rules-text h2 { margin: 0; font-size: 1.25rem; font-weight: 500; }

    .config-controls { display: flex; flex-direction: column; gap: 2rem; align-items: stretch; margin-bottom: 1rem; }
    .control-group { display: flex; flex-direction: column; text-align: left; gap: 0.5rem; }
    .control-group label { font-weight: 500; color: var(--dark-gray-color); font-size: 1.1rem; }
    .control-group select, .control-group input[type="text"] { padding: 0.75rem; border: 1px solid var(--medium-gray-color); border-radius: var(--border-radius); font-size: 1rem; background: white; }

    .mandala-selection-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem;
        margin-top: 1rem; max-height: 500px; overflow-y: auto; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #f9fafb;
    }
    .mandala-item {
        position: relative; cursor: pointer; border-radius: 0.5rem; overflow: hidden; border: 3px solid transparent;
        transition: all 0.2s; background: white; display: flex; flex-direction: column; align-items: center; padding: 0.75rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08); min-height: 200px;
    }
    .mandala-item:hover { transform: translateY(-4px); box-shadow: 0 6px 12px rgba(0,0,0,0.12); }
    .mandala-item.selected { border-color: var(--primary-color); background-color: #eff6ff; transform: scale(0.98); box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.2); }
    
    .mandala-preview { width: 100%; height: 150px; display: flex; align-items: center; justify-content: center; pointer-events: none; overflow: hidden; margin-bottom: 0.5rem; }
    .mandala-preview > div { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    .mandala-name, .mandala-tema { font-size: 0.85rem; text-align: center; margin-top: 0.5rem; color: var(--dark-gray-color); font-weight: 600; line-height: 1.3; }
    .selection-badge { position: absolute; top: 8px; right: 8px; background: var(--primary-color); color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); z-index: 10; }
    .counter-badge { background-color: #e0f2fe; color: #0077b6; padding: 0.4rem 0.8rem; border-radius: 0.5rem; font-size: 0.9rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.5rem; border: 1px solid #bae6fd; }

    .config-footer { display: flex; justify-content: space-between; margin-top: 2rem; border-top: 1px solid var(--medium-gray-color); padding-top: 1.5rem; }
    .no-rounded-button { padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; border: none; border-radius: var(--border-radius); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; justify-content: center; }
    .no-rounded-button:hover { background-color: #0077b6; color: white; }
    .no-rounded-button:disabled { background-color: var(--medium-gray-color); color: #9ca3af; cursor: not-allowed; opacity: 0.7; pointer-events: none; }

    .game-screen { display: flex; flex-direction: column; gap: 1.5rem; }
    .clue-text { text-align: center; color: var(--dark-gray-color); margin-bottom: 0.5rem; font-size: 1.1rem; }
    .game-layout { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; width: 100%; align-items: start; }
    .game-left-col { display: flex; flex-direction: column; gap: 1.5rem; align-items: center; width: 100%; background: white; padding: 1rem; border-radius: var(--border-radius); border: 1px solid var(--medium-gray-color); }
    .game-right-col { display: flex; flex-direction: column; gap: 1.5rem; }

    .stats-block, .palette-block, .selected-color-block { border: 1px solid var(--medium-gray-color); border-radius: var(--border-radius); padding: 1rem; text-align: left; background: white; }
    .stats-block h3, .palette-block h3, .selected-color-block h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--secondary-color); padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray-color); }
    .stats-item { margin-bottom: 0.75rem; font-size: 1rem; display: flex; justify-content: space-between; }
    .stats-item strong { font-weight: 700; color: var(--dark-text); }

    .btn-primary { background-color: var(--primary-color); color: white; padding: 0.75rem 1.5rem; border-radius: var(--border-radius); font-weight: 600; border: none; cursor: pointer; width: 100%; transition: background 0.2s; }
    .btn-primary:hover { background-color: #005f92; }
    
    .nav-footer { display: flex; flex-direction: row; justify-content: center; gap: 1.5rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--medium-gray-color); width: 100%; }

    .color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
    .color-btn { aspect-ratio: 1; border-radius: 0.5rem; border: 2px solid transparent; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .color-btn:hover { transform: scale(1.05); z-index: 10; }
    .color-btn.selected { border-color: var(--secondary-color); transform: scale(1.1); box-shadow: 0 4px 6px rgba(0,0,0,0.15); z-index: 20; }
    .color-number { font-weight: 800; font-size: 1.2rem; text-shadow: 0px 0px 2px rgba(255,255,255,0.8); }

    @media (max-width: 900px) {
        .config-controls, .game-layout { grid-template-columns: 1fr; }
        .game-layout { gap: 1rem; }
        .game-left-col { order: 1; }
        .game-right-col { order: 2; }
        .mandala-selection-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
        .mandala-item { min-height: 170px; }
        .mandala-preview { height: 120px; }
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
        background-color: #005f92;  /* CAMBIO: era #005f92, debe ser coherente */
    }

    `}</style>
);

const summaryStyles = `
    .summary-screen { font-family: system-ui, -apple-system, sans-serif; max-width: 1000px; margin: 0 auto; padding: 2rem; background: #ffffff; color: #1f2937; }
    .selection-title { text-align: center; color: #005f92; margin-bottom: 2rem; font-size: 2rem; font-weight: 700; }
    .rules-text { text-align: center; color: #6b7280; margin-bottom: 2rem; font-size: 1.1rem; }
    .summary-card { background: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; margin-top: 2rem; }
    .summary-row { display: flex; flex-direction: row; align-items: center; gap: 0.5rem; justify-content: flex-start; white-space: nowrap; }
    .download-section { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin-top: 3rem; padding: 2rem; background: #f8fafc; border-radius: 1rem; border: 1px solid #e2e8f0; }
    .btn-primary-summary { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; background: #005f92; color: white; font-size: 1rem; }
    .btn-primary-summary:hover:not(:disabled) { background: #004a73; transform: translateY(-1px); }
    .btn-primary-summary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-success { background: #005f92; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .info-card { background: white; padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem; }
    .info-card-header { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; }
    .info-card-value { font-size: 1.1rem; color: #334155; font-weight: 500; text-align: center; width: 100%; }
    .full-width { grid-column: 1 / -1; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
`;

// --- HELPER FUNCTIONS FOR GEOMETRY ---
// Estos se inyectan en el HTML como string, pero también deben estar definidos en window para React Preview
const GEOMETRY_HELPERS_SCRIPT = `
function getStarPoints(numPoints, innerRadius, outerRadius, centerX, centerY) {
    const points = [];
    const step = Math.PI / numPoints;
    let angle = -Math.PI / 2; 
    for (let i = 0; i < numPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({ x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius });
        angle += step;
    }
    return points;
}
function getPolygonPoints(sides, radius, centerX, centerY, rotationDeg = 0) {
    const points = [];
    const step = (Math.PI * 2) / sides;
    let angle = -Math.PI / 2 + (rotationDeg * Math.PI / 180);
    for (let i = 0; i < sides; i++) {
        points.push({ x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius });
        angle += step;
    }
    return points;
}
function getDonutPath(x, y, rOut, rIn) {
    return \`M \${x} \${y - rOut} A \${rOut} \${rOut} 0 1 1 \${x} \${y + rOut} A \${rOut} \${rOut} 0 1 1 \${x} \${y - rOut} Z M \${x} \${y - rIn} A \${rIn} \${rIn} 0 1 0 \${x} \${y + rIn} A \${rIn} \${rIn} 0 1 0 \${x} \${y - rIn} Z\`;
}
function getWedgePath(cx, cy, r, startAngle, endAngle) {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    return \`M \${cx} \${cy} L \${x1} \${y1} A \${r} \${r} 0 0 1 \${x2} \${y2} Z\`;
}
`;

// --- DRAWER FUNCTIONS ---
const DRAWER_FUNCTIONS = {
    // --- BASIC LEVEL ---
    'MandalaArbol1': `function(canvas, fillState, onFill, showNumbers, solution) {
        const cx = 250, cy = 250;
        canvas.add(new fabric.Circle({ left: cx, top: cy, radius: 230, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#333', strokeWidth: 3, selectable: false, evented: false }));
        const createObj = (obj, id) => {
            obj.set({ id: id, stroke: '#333', strokeWidth: 3, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
            obj.on('mousedown', () => onFill(id));
            canvas.add(obj);
        };
        createObj(new fabric.Rect({ left: 230, top: 250, width: 40, height: 80 }), 'p1');
        createObj(new fabric.Path('M 230 330 Q 180 360 120 380 Q 120 400 140 410 Q 200 390 235 340 Z'), 'p2');
        createObj(new fabric.Path('M 245 335 L 245 410 L 255 410 L 255 335 Z'), 'p3');
        createObj(new fabric.Path('M 270 330 Q 320 360 380 380 Q 380 400 360 410 Q 300 390 265 340 Z'), 'p4');
        const crownParts = [{ id: 'p5', angle: 0 }, { id: 'p6', angle: 45 }, { id: 'p7', angle: 90 }, { id: 'p8', angle: 135 }, { id: 'p9', angle: 180 }, { id: 'p10', angle: 225 }, { id: 'p11', angle: 270 }, { id: 'p12', angle: 315 }];
        crownParts.forEach(p => {
            const rad = (p.angle * Math.PI) / 180;
            const x = cx + Math.cos(rad) * 80;
            const y = 180 + Math.sin(rad) * 80;
            createObj(new fabric.Circle({ left: x, top: y, radius: 50, originX: 'center', originY: 'center' }), p.id);
        });
        if (showNumbers && solution) {
            const addNum = (id, x, y, sz=18) => {
                canvas.add(new fabric.Text(solution[id] || '?', {
                    left: x, top: y, fontSize: sz,
                    originX: 'center', originY: 'center',
                    fill: '#111', fontWeight: 'bold',
                    stroke: '#FFFFFF', strokeWidth: 3, paintFirst: 'stroke',
                    selectable: false, evented: false
                }));
            };
            // Tronco: rect left=230, top=250, w=40, h=80 → centro x=250, y=290
            addNum('p1', 250, 320); addNum('p2', 148, 385); addNum('p3', 268, 378); addNum('p4', 352, 385);
            // Corona: números desplazados hacia el exterior del círculo (radio 80→55)
            // para evitar que se solapen entre círculos adyacentes
            crownParts.forEach(p => {
                const rad = (p.angle * Math.PI) / 180;
                addNum(p.id, cx + Math.cos(rad) * 80, 180 + Math.sin(rad) * 80, 16);
            });
        }
    }`,
    'MandalaFlor1': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#b05090', strokeWidth: 2.5, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];

    // Círculo decorativo exterior
    canvas.add(new fabric.Circle({
        left: cx, top: cy, radius: 225, originX: 'center', originY: 'center',
        fill: 'transparent', stroke: '#b05090', strokeWidth: 1.5,
        selectable: false, evented: false
    }));

    // p3..p10: 8 pétalos — más cortos (100px) para dejar espacio al anillo y círculos
    // p3..p10: pétalos con coordenadas absolutas, base en r=78 fuera del anillo
    angles.forEach((angle, i) => {
        const id = 'p' + (i + 3);
        const rad = angle * Math.PI / 180;
        const radL = (angle - 15) * Math.PI / 180;
        const radR = (angle + 15) * Math.PI / 180;
        const bLx = cx + Math.cos(radL) * 78,  bLy = cy + Math.sin(radL) * 78;
        const bRx = cx + Math.cos(radR) * 78,  bRy = cy + Math.sin(radR) * 78;
        const tx  = cx + Math.cos(rad)  * 200,  ty  = cy + Math.sin(rad)  * 200;
        const cLx = cx + Math.cos(radL) * 160, cLy = cy + Math.sin(radL) * 160;
        const cRx = cx + Math.cos(radR) * 160, cRy = cy + Math.sin(radR) * 160;
        const pathData = \`M \${bLx} \${bLy} Q \${cLx} \${cLy} \${tx} \${ty} Q \${cRx} \${cRy} \${bRx} \${bRy} Z\`;
        createObj(new fabric.Path(pathData), id);
    });

    // p11..p18: círculos entre pétalos en r=195, desplazados 22.5° para no solapar pétalos
    angles.forEach((angle, i) => {
        const id = 'p' + (i + 11);
        const rad = ((angle + 22.5) * Math.PI) / 180;
        const x = cx + Math.cos(rad) * 195;
        const y = cy + Math.sin(rad) * 195;
        createObj(new fabric.Circle({ left: x, top: y, radius: 20, originX: 'center', originY: 'center', strokeWidth: 2 }), id);
    });

    // p2: anillo r=55..75 — dibujado DESPUÉS de pétalos para quedar encima y ser clickeable
    createObj(new fabric.Path(getDonutPath(cx, cy, 75, 55)), 'p2');

    // p1: círculo central — encima de todo para ser clickeable
    createObj(new fabric.Circle({ left: cx, top: cy, radius: 53, originX: 'center', originY: 'center' }), 'p1');

    if (showNumbers && solution) {
        const addNum = (id, x, y, sz=18) => canvas.add(new fabric.Text(solution[id] || '?', {
            left: x, top: y, fontSize: sz, originX: 'center', originY: 'center',
            fill: '#1a1a1a', fontWeight: 'bold',
            stroke: '#FFFFFF', strokeWidth: 3, paintFirst: 'stroke',
            selectable: false, evented: false
        }));

        // p1: centro del círculo
        addNum('p1', cx, cy, 22);

        // p2: anillo — número en radio=65, entre dos pétalos a 22.5°
        addNum('p2', cx + Math.cos(22.5 * Math.PI / 180) * 65, cy + Math.sin(22.5 * Math.PI / 180) * 65, 17);

        angles.forEach((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            // Pétalos: número en r=140, tercio medio del pétalo (r=78..200)
            addNum('p' + (i + 3), cx + Math.cos(rad) * 140, cy + Math.sin(rad) * 140, 16);
            // Círculos exteriores: en su centro exacto a r=195, desplazados 22.5°
            const radC = ((angle + 22.5) * Math.PI) / 180;
            addNum('p' + (i + 11), cx + Math.cos(radC) * 195, cy + Math.sin(radC) * 195, 14);
        });
    }
}`,
    'MandalaMariposa1': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    canvas.add(new fabric.Circle({ 
        left: cx, top: cy, radius: 220, originX: 'center', originY: 'center', 
        fill: fillState['p10'] || '#FFFFFF', stroke: '#333', strokeWidth: 4, 
        selectable: false, hoverCursor: 'pointer', id: 'p10' 
    }));
    canvas.getObjects()[0].on('mousedown', () => onFill('p10'));
    
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#333', strokeWidth: 3, fill: fillState[id] || '#FFFFFF', 
                  selectable: false, hoverCursor: 'pointer' });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    
    // Alas superiores
    createObj(new fabric.Path('M 250 200 Q 150 150 120 180 Q 100 220 140 240 Q 200 230 245 220 Z'), 'p4');
    createObj(new fabric.Path('M 250 200 Q 350 150 380 180 Q 400 220 360 240 Q 300 230 255 220 Z'), 'p5');
    
    // Alas inferiores
    createObj(new fabric.Path('M 245 280 Q 180 300 150 330 Q 140 360 170 370 Q 220 350 245 310 Z'), 'p6');
    createObj(new fabric.Path('M 255 280 Q 320 300 350 330 Q 360 360 330 370 Q 280 350 255 310 Z'), 'p7');
    
    // Ojos en alas
    createObj(new fabric.Circle({ left: 180, top: 200, radius: 28, originX: 'center', originY: 'center', strokeWidth: 2 }), 'p8');
    createObj(new fabric.Circle({ left: 320, top: 200, radius: 28, originX: 'center', originY: 'center', strokeWidth: 2 }), 'p9');
    
    // Cuerpo
    createObj(new fabric.Rect({ left: 237, top: 180, width: 26, height: 140, rx: 13, ry: 13 }), 'p1');
    
    // Antena izquierda
    const antLColor = fillState['p2'] || '#333';
    const antLineL = new fabric.Line([245, 180, 230, 150], { stroke: antLColor, strokeWidth: 4, strokeLineCap: 'round', selectable: false, hoverCursor: 'pointer' });
    antLineL.on('mousedown', () => onFill('p2')); 
    canvas.add(antLineL);
    const antCirL = new fabric.Circle({ left: 230, top: 150, radius: 6, fill: antLColor, stroke: antLColor, originX: 'center', originY: 'center', selectable: false, hoverCursor: 'pointer' });
    antCirL.on('mousedown', () => onFill('p2')); 
    canvas.add(antCirL);
    
    // Antena derecha
    const antRColor = fillState['p3'] || '#333';
    const antLineR = new fabric.Line([255, 180, 270, 150], { stroke: antRColor, strokeWidth: 4, strokeLineCap: 'round', selectable: false, hoverCursor: 'pointer' });
    antLineR.on('mousedown', () => onFill('p3')); 
    canvas.add(antLineR);
    const antCirR = new fabric.Circle({ left: 270, top: 150, radius: 6, fill: antRColor, stroke: antRColor, originX: 'center', originY: 'center', selectable: false, hoverCursor: 'pointer' });
    antCirR.on('mousedown', () => onFill('p3')); 
    canvas.add(antCirR);
    
    if (showNumbers && solution) {
        const addNum = (id, x, y, sz=16) => {
            canvas.add(new fabric.Text(solution[id] || '?', {
                left: x, top: y, fontSize: sz,
                originX: 'center', originY: 'center',
                fill: '#111', fontWeight: 'bold',
                stroke: '#FFFFFF', strokeWidth: 3, paintFirst: 'stroke',
                selectable: false, evented: false
            }));
        };

        // p10: fondo — esquina inferior del círculo, lejos de todo
        addNum('p10', 250, 440);

        // p4: ala sup. izq. — zona izquierda alejada del ojo (ojo está en x=180,y=200)
        addNum('p4', 128, 210);

        // p5: ala sup. der. — zona derecha alejada del ojo (ojo en x=320,y=200)
        addNum('p5', 372, 210);

        // p8: ojo izq. — centrado en el círculo (x=180, y=200, r=28)
        addNum('p8', 180, 200, 14);

        // p9: ojo der. — centrado en el círculo (x=320, y=200, r=28)
        addNum('p9', 320, 200, 14);

        // p6: ala inf. izq. — zona media-baja del ala izquierda
        addNum('p6', 162, 345);

        // p7: ala inf. der. — zona media-baja del ala derecha
        addNum('p7', 338, 345);

        // p1: cuerpo — centro del rectángulo (left=237, top=180, w=26, h=140 → cx=250, cy=250)
        addNum('p1', 250, 250, 14);

        // p2: antena izq. — junto a la bolita terminal (x=230, y=150)
        addNum('p2', 218, 142, 13);

        // p3: antena der. — junto a la bolita terminal (x=270, y=150)
        addNum('p3', 282, 142, 13);
    }
}`,
    'MandalaSol': `function(canvas, fillState, onFill, showNumbers, solution) {
        const cx = 250, cy = 250;
        const createObj = (obj, id) => {
            obj.set({ id: id, stroke: '#333', strokeWidth: 3, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
            obj.on('mousedown', () => onFill(id));
            canvas.add(obj);
        };
        for(let i=0; i<12; i++) {
            const angle = i * 30;
            const rad1 = (angle - 10) * Math.PI / 180;
            const rad2 = (angle + 10) * Math.PI / 180;
            const radMid = angle * Math.PI / 180;
            const p1 = { x: cx + Math.cos(rad1) * 70, y: cy + Math.sin(rad1) * 70 };
            const p2 = { x: cx + Math.cos(radMid) * 180, y: cy + Math.sin(radMid) * 180 };
            const p3 = { x: cx + Math.cos(rad2) * 70, y: cy + Math.sin(rad2) * 70 };
            const pathData = \`M \${p1.x} \${p1.y} L \${p2.x} \${p2.y} L \${p3.x} \${p3.y} Z\`;
            createObj(new fabric.Path(pathData), 'p' + (i+3));
        }
        createObj(new fabric.Circle({ left: cx, top: cy, radius: 68, originX: 'center', originY: 'center' }), 'p2');
        const starPoints = getStarPoints(8, 28, 50, cx, cy);
        createObj(new fabric.Polygon(starPoints, { originX: 'center', originY: 'center' }), 'p1');
        if(showNumbers && solution) {
            const addNum = (id, x, y) => canvas.add(new fabric.Text(solution[id] || '?', { left: x, top: y, fontSize: 18, originX: 'center', originY: 'center', fill: '#333', selectable: false, evented: false }));
            addNum('p1', cx, cy); addNum('p2', cx, 195);
            for(let i=0; i<12; i++) { const rad = (i * 30) * Math.PI / 180; addNum('p' + (i+3), cx + Math.cos(rad) * 125, cy + Math.sin(rad) * 125); }
        }
    }`,
    'MandalaHoja': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#2d4a1e', strokeWidth: 2.5, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };

    // Círculo decorativo exterior (solo borde)
    canvas.add(new fabric.Circle({
        left: cx, top: cy, radius: 225, originX: 'center', originY: 'center',
        fill: 'transparent', stroke: '#2d4a1e', strokeWidth: 2,
        selectable: false, evented: false
    }));

    // p1: TALLO — rectángulo redondeado zona inferior, bien separado de hojas
    createObj(new fabric.Rect({
        left: cx, top: 368, width: 36, height: 90,
        originX: 'center', originY: 'top', rx: 10, ry: 10
    }), 'p1');

    // p2: HOJA CENTRAL — lanceolada, termina en y=315 antes del tallo
    createObj(new fabric.Path('M 250 95 C 225 150 220 230 250 315 C 280 230 275 150 250 95 Z'), 'p2');

    // p3: HOJA SUPERIOR IZQUIERDA
    createObj(new fabric.Path('M 233 158 C 195 118 128 122 112 158 C 106 188 152 202 218 192 Z'), 'p3');

    // p4: HOJA SUPERIOR DERECHA — espejo de p3
    createObj(new fabric.Path('M 267 158 C 305 118 372 122 388 158 C 394 188 348 202 282 192 Z'), 'p4');

    // p5: HOJA MEDIA IZQUIERDA — separada de p3 y p7
    createObj(new fabric.Path('M 230 225 C 182 208 112 228 97 268 C 92 300 142 312 222 285 Z'), 'p5');

    // p6: HOJA MEDIA DERECHA — espejo de p5
    createObj(new fabric.Path('M 270 225 C 318 208 388 228 403 268 C 408 300 358 312 278 285 Z'), 'p6');

    // p7: HOJA INFERIOR IZQUIERDA — separada del tallo
    createObj(new fabric.Path('M 236 305 C 188 305 132 328 122 362 C 116 386 156 396 222 372 Z'), 'p7');

    // p8: HOJA INFERIOR DERECHA — espejo de p7
    createObj(new fabric.Path('M 264 305 C 312 305 368 328 378 362 C 384 386 344 396 278 372 Z'), 'p8');

    // Nervio central decorativo
    canvas.add(new fabric.Line([250, 95, 250, 315], {
        stroke: '#2d4a1e', strokeWidth: 1.5, strokeDashArray: [5, 4],
        selectable: false, evented: false
    }));

    if(showNumbers && solution) {
        const addNum = (id, x, y, sz=18) => canvas.add(new fabric.Text(solution[id] || '?', {
            left: x, top: y, fontSize: sz, originX: 'center', originY: 'center',
            fill: '#1a1a1a', fontWeight: 'bold',
            stroke: '#FFFFFF', strokeWidth: 3, paintFirst: 'stroke',
            selectable: false, evented: false
        }));

        addNum('p1', cx,   413, 19);   // Tallo
        addNum('p2', cx,   205, 18);   // Hoja central
        addNum('p3', 160,  155, 17);   // Hoja sup-izq
        addNum('p4', 340,  155, 17);   // Hoja sup-der
        addNum('p5', 148,  262, 17);   // Hoja med-izq
        addNum('p6', 352,  262, 17);   // Hoja med-der
        addNum('p7', 165,  350, 17);   // Hoja inf-izq
        addNum('p8', 335,  350, 17);   // Hoja inf-der
    }
}`,
    'MandalaArbol2': `function(canvas, fillState, onFill, showNumbers, solution) {
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#333', strokeWidth: 3, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    
    // Triángulos de la copa (más grandes)
    const t1 = getPolygonPoints(3, 110, 250, 125);
    createObj(new fabric.Polygon(t1, { originX: 'center', originY: 'center' }), 'p1');
    
    const t2 = getPolygonPoints(3, 125, 250, 195);
    createObj(new fabric.Polygon(t2, { originX: 'center', originY: 'center' }), 'p2');
    
    const t3 = getPolygonPoints(3, 140, 250, 273);
    createObj(new fabric.Polygon(t3, { originX: 'center', originY: 'center' }), 'p3');
    
    // Tronco más grande
    createObj(new fabric.Rect({ left: 215, top: 340, width: 70, height: 120 }), 'p4');
    
   if(showNumbers && solution) {
       const addNum = (id, x, y, sz=20) => {
            canvas.add(new fabric.Text(solution[id] || '?', {
                left: x, top: y, fontSize: sz,
                originX: 'center', originY: 'center',
                fill: '#111', fontWeight: 'bold',
                stroke: '#FFFFFF', strokeWidth: 3, paintFirst: 'stroke',
                selectable: false, evented: false
            }));
        };
        // Punta visible de cada triángulo (zona exclusiva, no solapada)
        // p1: punta superior en y≈15, zona libre aprox y=30..80
        addNum('p1', 250, 50);
        // p2: su punta superior en y≈70, zona libre aprox y=100..140
        addNum('p2', 250, 120);
        // p3: su punta superior en y≈133, zona libre aprox y=160..210
        addNum('p3', 250, 180);
        // p4: tronco rect top=340, height=120 → centro y=400
        addNum('p4', 250, 400);
    }
}`,
    // Agregar después de 'MandalaArbol2' y antes del cierre de DRAWER_FUNCTIONS
    'MandalaPez': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#333', strokeWidth: 3, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    
    // Cuerpo del pez (óvalo grande)
    createObj(new fabric.Ellipse({ left: cx, top: cy, rx: 110, ry: 80, originX: 'center', originY: 'center', strokeWidth: 4 }), 'body');
    
    // Aleta superior (más grande)
    createObj(new fabric.Path('M 250 170 Q 220 130 250 110 Q 280 130 250 170 Z'), 'topFin');
    
    // Aleta inferior (más grande)
    createObj(new fabric.Path('M 250 330 Q 220 370 250 390 Q 280 370 250 330 Z'), 'bottomFin');
    
    // Cola (triángulo grande)
    const tail = getPolygonPoints(3, 70, 385, 250);
    createObj(new fabric.Polygon(tail, { originX: 'center', originY: 'center' }), 'tail');
    
    // Ojo grande
    createObj(new fabric.Circle({ left: 190, top: 235, radius: 25, originX: 'center', originY: 'center' }), 'eye');
    
    // Pupila (movida ligeramente)
    createObj(new fabric.Circle({ left: 195, top: 240, radius: 12, originX: 'center', originY: 'center' }), 'pupil');
    
    // Escamas decorativas (más grandes)
    createObj(new fabric.Circle({ left: 250, top: 250, radius: 22, originX: 'center', originY: 'center' }), 'scale1');
    createObj(new fabric.Circle({ left: 290, top: 230, radius: 22, originX: 'center', originY: 'center' }), 'scale2');
    createObj(new fabric.Circle({ left: 290, top: 270, radius: 22, originX: 'center', originY: 'center' }), 'scale3');
    
    // Rayas en el cuerpo (nuevas áreas para usar el color 4)
    createObj(new fabric.Rect({ left: 210, top: 240, width: 15, height: 60, originX: 'center', originY: 'center', angle: -20 }), 'stripe1');
    createObj(new fabric.Rect({ left: 230, top: 240, width: 15, height: 60, originX: 'center', originY: 'center', angle: -20 }), 'stripe2');
    
   if(showNumbers && solution) {
        // Badge con fondo blanco sólido, tamaño fijo según área disponible
        const addNum = (id, x, y, sz=16) => {
            canvas.add(new fabric.Text(solution[id] || '?', {
                left: x, top: y, fontSize: sz,
                originX: 'center', originY: 'center',
                fill: '#111', fontWeight: 'bold',
                stroke: '#FFFFFF', strokeWidth: 3, paintFirst: 'stroke',
                selectable: false, evented: false
            }));
        };

        // body: zona inf-der del óvalo, alejada de ojo/escamas/rayas
        addNum('body',   335, 290, 17, 30);

        // topFin: centro del path (y=110..170), fuera del cuerpo
        addNum('topFin', 250, 128, 16, 28);

        // bottomFin: centro del path (y=330..390), fuera del cuerpo
        addNum('bottomFin', 250, 368, 16, 28);

        // tail: interior del triángulo, ligeramente a la derecha del cuerpo
        addNum('tail', 392, 250, 16, 28);

        // eye: centrado en el círculo r=25 — número en la parte superior del ojo
        // para dejar espacio a la pupila abajo
        addNum('eye',  190, 218, 14, 24);

        // pupil: centrado exactamente en su círculo r=12
        addNum('pupil', 195, 240, 10, 18);

        // scale1: centrado en círculo r=22 en (250,250)
        addNum('scale1', 250, 250, 12, 20);

        // scale2: centrado en círculo r=22 en (290,230)
        addNum('scale2', 290, 230, 12, 20);

        // scale3: centrado en círculo r=22 en (290,270)
        addNum('scale3', 290, 270, 12, 20);

        // stripe1: rect angosto en (210,240). Número encima de la franja, dentro del cuerpo
        addNum('stripe1', 205, 195, 12, 20);

        // stripe2: rect angosto en (230,240). Número encima, separado de stripe1
        addNum('stripe2', 232, 195, 12, 20);
    }
}`,
    'MandalaBuho': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#333', strokeWidth: 3, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    
    // Cuerpo (óvalo grande)
    createObj(new fabric.Ellipse({ left: cx, top: 280, rx: 90, ry: 110, originX: 'center', originY: 'center', strokeWidth: 4 }), 'body');
    
    // Cabeza (círculo grande)
    createObj(new fabric.Circle({ left: cx, top: 170, radius: 80, originX: 'center', originY: 'center', strokeWidth: 4 }), 'head');
    
    // Orejas puntiagudas (triángulos más grandes)
    const earL = getPolygonPoints(3, 45, 195, 110, 180);
    createObj(new fabric.Polygon(earL, { originX: 'center', originY: 'center' }), 'earL');
    
    const earR = getPolygonPoints(3, 45, 305, 110, 180);
    createObj(new fabric.Polygon(earR, { originX: 'center', originY: 'center' }), 'earR');
    
    // Ojos grandes (círculos)
    createObj(new fabric.Circle({ left: 215, top: 170, radius: 32, originX: 'center', originY: 'center' }), 'eyeL');
    createObj(new fabric.Circle({ left: 285, top: 170, radius: 32, originX: 'center', originY: 'center' }), 'eyeR');
    
    // Pupilas (movidas ligeramente)
    createObj(new fabric.Circle({ left: 220, top: 175, radius: 15, originX: 'center', originY: 'center' }), 'pupilL');
    createObj(new fabric.Circle({ left: 280, top: 175, radius: 15, originX: 'center', originY: 'center' }), 'pupilR');
    
    // Pico (triángulo)
    const beak = getPolygonPoints(3, 25, 250, 210);
    createObj(new fabric.Polygon(beak, { originX: 'center', originY: 'center' }), 'beak');
    
    // Alas (óvalos más grandes a los lados)
    createObj(new fabric.Ellipse({ left: 175, top: 300, rx: 35, ry: 60, originX: 'center', originY: 'center', angle: -20 }), 'wingL');
    createObj(new fabric.Ellipse({ left: 325, top: 300, rx: 35, ry: 60, originX: 'center', originY: 'center', angle: 20 }), 'wingR');
    
    // Patas (rectángulos)
    createObj(new fabric.Rect({ left: 230, top: 370, width: 18, height: 35, originX: 'center', originY: 'center' }), 'legL');
    createObj(new fabric.Rect({ left: 270, top: 370, width: 18, height: 35, originX: 'center', originY: 'center' }), 'legR');
    
    if(showNumbers && solution) {
        const addNum = (id, x, y, sz=18) => canvas.add(new fabric.Text(solution[id] || '?', { 
            left: x, top: y, fontSize: sz, originX: 'center', originY: 'center', 
            fill: '#333', fontWeight: 'bold', selectable: false, evented: false 
        }));
        
        addNum('body', 250, 320, 26);         // Movido más abajo
        addNum('head', 250, 140, 24);         // Movido arriba para no chocar con ojos
        addNum('earL', 195, 110, 18);         // OK
        addNum('earR', 305, 110, 18);         // OK
        addNum('eyeL', 205, 155, 16);         // Movido arriba e izquierda
        addNum('eyeR', 295, 155, 16);         // Movido arriba y derecha
        addNum('pupilL', 225, 182, 11);       // Movido abajo y derecha
        addNum('pupilR', 275, 182, 11);       // Movido abajo e izquierda
        addNum('beak', 250, 210, 16);         // OK
        addNum('wingL', 175, 300, 18);        // OK
        addNum('wingR', 325, 300, 18);        // OK
        addNum('legL', 230, 370, 14);         // OK
        addNum('legR', 270, 370, 14);         // OK
    }
}`,
    // --- INTERMEDIATE LEVEL ---
    'MandalaAlegria1': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#333', strokeWidth: 3, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    // Rayos
    for(let i=0; i<8; i++) {
         const path = new fabric.Path(getWedgePath(cx, cy, 220, i*45 - 15, i*45 + 15));
         createObj(path, 'r'+i);
    }
    createObj(new fabric.Circle({left: cx, top: cy, radius: 120, originX: 'center', originY: 'center', strokeWidth:4}), 'face');
    
    // Ojos como círculos rellenos en lugar de arcos
    createObj(new fabric.Circle({left: 200, top: 220, radius: 12, originX: 'center', originY: 'center'}), 'eyeL');
    createObj(new fabric.Circle({left: 300, top: 220, radius: 12, originX: 'center', originY: 'center'}), 'eyeR');
    
    createObj(new fabric.Circle({left: 170, top: 260, radius: 20, originX: 'center', originY: 'center'}), 'chL');
    createObj(new fabric.Circle({left: 330, top: 260, radius: 20, originX: 'center', originY: 'center'}), 'chR');
    createObj(new fabric.Path('M 190 290 Q 250 380 310 290 Q 250 330 190 290 Z'), 'mouth');

    if(showNumbers && solution) {
         const addNum = (id, x, y, c='#333') => canvas.add(new fabric.Text(solution[id] || '?', {left:x, top:y, fontSize:16, originX:'center', originY:'center', fill:c, selectable:false, evented:false}));
         addNum('face', 250, 150);
         addNum('eyeL', 200, 220);
         addNum('eyeR', 300, 220);
         addNum('chL', 170, 260);
         addNum('chR', 330, 260);
         addNum('mouth', 250, 320);
         for(let i=0; i<8; i++) {
             const rad = (i*45) * Math.PI/180;
             addNum('r'+i, cx+Math.cos(rad)*180, cy+Math.sin(rad)*180);
         }
    }
}`,
    'MandalaTristeza1': `function(canvas, fillState, onFill, showNumbers, solution) {
        const createObj = (obj, id) => {
            obj.set({ id: id, stroke: '#333', strokeWidth: 2, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
            obj.on('mousedown', () => onFill(id));
            canvas.add(obj);
        };
        const drops = [{id:'d1',x:150,y:350}, {id:'d2',x:250,y:400}, {id:'d3',x:350,y:350}, {id:'d4',x:100,y:300}, {id:'d5',x:400,y:300}];
        drops.forEach(d => {
             createObj(new fabric.Path(\`M \${d.x} \${d.y-30} Q \${d.x-20} \${d.y+10} \${d.x} \${d.y+30} Q \${d.x+20} \${d.y+10} \${d.x} \${d.y-30} Z\`), d.id);
        });
        createObj(new fabric.Path('M 140 200 A 110 110 0 1 1 360 200 C 360 350 250 350 250 350 C 250 350 140 350 140 200 Z', {strokeWidth:4}), 'face');
        createObj(new fabric.Path('M 180 210 Q 200 190 220 210 Z'), 'eyeL');
        createObj(new fabric.Path('M 280 210 Q 300 190 320 210 Z'), 'eyeR');
        createObj(new fabric.Path('M 310 220 Q 300 240 310 260 Q 320 240 310 220 Z'), 'tear');
        createObj(new fabric.Path('M 210 300 Q 250 270 290 300 L 290 310 Q 250 280 210 310 Z'), 'mouth');
        
        if(showNumbers && solution) {
            const addNum = (id,x,y) => canvas.add(new fabric.Text(solution[id]||'?',{left:x,top:y,fontSize:16,originX:'center',originY:'center',fill:'#333',selectable:false,evented:false}));
            addNum('face',240,150); addNum('eyeL',190,190); addNum('eyeR',290,190); addNum('tear',305,235); addNum('mouth',240,285);
            drops.forEach(d => addNum(d.id, d.x, d.y));
        }
    }`,
    'MandalaIra': `function(canvas, fillState, onFill, showNumbers, solution) {
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#333', strokeWidth: 2, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    const star = getStarPoints(12, 140, 220, 250, 250);
    createObj(new fabric.Polygon(star, {strokeWidth:3}), 'bg');
    createObj(new fabric.Rect({left:150, top:150, width:200, height:200, rx:40, ry:40, strokeWidth:4}), 'face');
    createObj(new fabric.Path('M 170 200 L 240 230 L 240 210 L 170 180 Z'), 'browL');
    createObj(new fabric.Path('M 330 200 L 260 230 L 260 210 L 330 180 Z'), 'browR');
    createObj(new fabric.Circle({left:200, top:245, radius:20, originX:'center', originY:'center'}), 'eyeL');
    createObj(new fabric.Circle({left:300, top:245, radius:20, originX:'center', originY:'center'}), 'eyeR');
    createObj(new fabric.Rect({left:200, top:300, width:100, height:30, rx:5, ry:5}), 'mouth');
    
    if(showNumbers && solution) {
         const addNum = (id,x,y) => canvas.add(new fabric.Text(solution[id]||'?',{left:x,top:y,fontSize:18,originX:'center',originY:'center',fill:'#333',selectable:false,evented:false}));
         addNum('bg',250,90);
         addNum('face',250,160);
         addNum('browL',205,195);
         addNum('browR',295,195);
         addNum('eyeL',200,245);
         addNum('eyeR',300,245);
         addNum('mouth',250,315);
    }
}`,
    'MandalaMiedo1': `function(canvas, fillState, onFill, showNumbers, solution) {
         const createObj = (obj, id) => {
            obj.set({ id: id, stroke: '#333', strokeWidth: 2, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
            obj.on('mousedown', () => onFill(id));
            canvas.add(obj);
        };
        const star = getStarPoints(16, 130, 180, 250, 230);
        createObj(new fabric.Polygon(star, {strokeWidth:3}), 'hair');
        createObj(new fabric.Circle({left:250, top:250, radius:110, originX:'center', originY:'center', strokeWidth:4}), 'face');
        createObj(new fabric.Circle({left:210, top:230, radius:35, originX:'center', originY:'center'}), 'eyeL');
        createObj(new fabric.Circle({left:290, top:230, radius:35, originX:'center', originY:'center'}), 'eyeR');
        createObj(new fabric.Circle({left:210, top:230, radius:10, originX:'center', originY:'center'}), 'pupilL');
        createObj(new fabric.Circle({left:290, top:230, radius:10, originX:'center', originY:'center'}), 'pupilR');
        createObj(new fabric.Ellipse({left:250, top:310, rx:40, ry:20, originX:'center', originY:'center'}), 'mouth');

        if(showNumbers && solution) {
            const addNum = (id,x,y,sz=18) => canvas.add(new fabric.Text(solution[id]||'?',{left:x,top:y,fontSize:sz,originX:'center',originY:'center',fill:'#333',selectable:false,evented:false}));
            addNum('hair',240,120); addNum('face',240,180);
            addNum('eyeL',190,210); addNum('eyeR',270,210);
            addNum('pupilL',205,225,10); addNum('pupilR',285,225,10);
            addNum('mouth',240,300);
        }
    }`,
    'MandalaAsco': `function(canvas, fillState, onFill, showNumbers, solution) {
         const createObj = (obj, id) => {
            obj.set({ id: id, stroke: '#333', strokeWidth: 2, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
            obj.on('mousedown', () => onFill(id));
            canvas.add(obj);
        };
        const blobs = [0, 60, 120, 180, 240, 300].map(angle => { const rad=angle*Math.PI/180; return {x:250+Math.cos(rad)*160, y:250+Math.sin(rad)*160, id:'b'+angle}; });
        blobs.forEach(b => createObj(new fabric.Circle({left:b.x, top:b.y, radius:40, originX:'center', originY:'center'}), b.id));
        createObj(new fabric.Circle({left:250, top:250, radius:110, originX:'center', originY:'center', strokeWidth:4}), 'face');
        createObj(new fabric.Path('M 180 220 L 220 220 L 200 210 Z'), 'eyeL');
        createObj(new fabric.Path('M 280 220 L 320 220 L 300 210 Z'), 'eyeR');
        createObj(new fabric.Path('M 200 300 Q 250 280 300 300 L 300 310 Q 250 290 200 310 Z'), 'mouth');
        createObj(new fabric.Path('M 230 310 L 270 310 Q 270 360 250 370 Q 230 360 230 310 Z'), 'tongue');

        if(showNumbers && solution) {
             const addNum = (id,x,y) => canvas.add(new fabric.Text(solution[id]||'?',{left:x,top:y,fontSize:16,originX:'center',originY:'center',fill:'#333',selectable:false,evented:false}));
             blobs.forEach(b => addNum(b.id, b.x, b.y));
             addNum('face',240,160); addNum('eyeL',190,200); addNum('eyeR',290,200); addNum('mouth',240,280); addNum('tongue',240,330);
        }
    }`,
    'MandalaSorpresa': `function(canvas, fillState, onFill, showNumbers, solution) {
        const createObj = (obj, id) => {
            obj.set({ id: id, stroke: '#333', strokeWidth: 2, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
            obj.on('mousedown', () => onFill(id));
            canvas.add(obj);
        };
        const star = getStarPoints(8, 180, 220, 250, 250);
        createObj(new fabric.Polygon(star, {strokeWidth:3}), 'bg');
        createObj(new fabric.Circle({left:250, top:250, radius:110, originX:'center', originY:'center', strokeWidth:4}), 'face');
        createObj(new fabric.Path('M 180 180 A 25 25 0 0 1 220 180', {fill:'transparent', stroke:fillState['browL']||'#333'}), 'browL');
        createObj(new fabric.Path('M 280 180 A 25 25 0 0 1 320 180', {fill:'transparent', stroke:fillState['browR']||'#333'}), 'browR');
        createObj(new fabric.Circle({left:200, top:230, radius:25, originX:'center', originY:'center'}), 'eyeL');
        createObj(new fabric.Circle({left:300, top:230, radius:25, originX:'center', originY:'center'}), 'eyeR');
        createObj(new fabric.Circle({left:250, top:310, radius:30, originX:'center', originY:'center'}), 'mouth');

        if(showNumbers && solution) {
             const addNum = (id,x,y) => canvas.add(new fabric.Text(solution[id]||'?',{left:x,top:y,fontSize:16,originX:'center',originY:'center',fill:'#333',selectable:false,evented:false}));
             addNum('bg',240,90); addNum('face',240,150); addNum('browL',190,170); addNum('browR',290,170);
             addNum('eyeL',190,220); addNum('eyeR',290,220); addNum('mouth',240,300);
        }
    }`,
    'MandalaCulpa': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#333', strokeWidth: 2, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    
    // Cadenas/peso alrededor (8 cadenas)
    for(let i=0; i<8; i++) {
        const angle = i * 45;
        const rad = angle * Math.PI / 180;
        const x = cx + Math.cos(rad) * 180;
        const y = cy + Math.sin(rad) * 180;
        createObj(new fabric.Rect({ 
            left: x, top: y, width: 30, height: 50, 
            originX: 'center', originY: 'center', 
            angle: angle, rx: 5, ry: 5 
        }), 'chain'+i);
    }
    
    // Círculo de fondo (sentimiento envolvente)
    createObj(new fabric.Circle({ 
        left: cx, top: cy, radius: 130, 
        originX: 'center', originY: 'center', strokeWidth: 4 
    }), 'bg');
    
    // Rostro
    createObj(new fabric.Circle({ 
        left: cx, top: cy, radius: 100, 
        originX: 'center', originY: 'center', strokeWidth: 4 
    }), 'face');
    
    // Cejas inclinadas (preocupación) - ahora como Path rellenable
    createObj(new fabric.Path('M 195 210 L 235 220 L 235 215 L 195 205 Z'), 'browL');
    createObj(new fabric.Path('M 305 210 L 265 220 L 265 215 L 305 205 Z'), 'browR');
    
    // Ojos mirando hacia abajo
    createObj(new fabric.Circle({ 
        left: 215, top: 245, radius: 18, 
        originX: 'center', originY: 'center' 
    }), 'eyeL');
    createObj(new fabric.Circle({ 
        left: 285, top: 245, radius: 18, 
        originX: 'center', originY: 'center' 
    }), 'eyeR');
    
    // Pupilas mirando abajo
    createObj(new fabric.Circle({ 
        left: 215, top: 252, radius: 6, 
        originX: 'center', originY: 'center' 
    }), 'pupilL');
    createObj(new fabric.Circle({ 
        left: 285, top: 252, radius: 6, 
        originX: 'center', originY: 'center' 
    }), 'pupilR');
    
    // Boca curva hacia abajo (remordimiento) - como Path rellenable
    createObj(new fabric.Path('M 220 295 Q 250 285 280 295 L 280 300 Q 250 290 220 300 Z'), 'mouth');
    
    // Manos cubriéndose (gesto de culpa)
    createObj(new fabric.Ellipse({ 
        left: 170, top: 280, rx: 25, ry: 35, 
        originX: 'center', originY: 'center', angle: -20 
    }), 'handL');
    createObj(new fabric.Ellipse({ 
        left: 330, top: 280, rx: 25, ry: 35, 
        originX: 'center', originY: 'center', angle: 20 
    }), 'handR');
    
    if(showNumbers && solution) {
        const addNum = (id, x, y, sz=16) => canvas.add(new fabric.Text(solution[id] || '?', {
            left: x, top: y, fontSize: sz, originX: 'center', originY: 'center',
            fill: '#333', fontWeight: 'bold', selectable: false, evented: false
        }));
        
        // Cadenas
        for(let i=0; i<8; i++) {
            const angle = i * 45;
            const rad = angle * Math.PI / 180;
            addNum('chain'+i, cx + Math.cos(rad) * 180, cy + Math.sin(rad) * 180, 14);
        }
        
        addNum('bg', 250, 135, 18);
        addNum('face', 250, 170, 18);
        addNum('browL', 215, 210, 14);
        addNum('browR', 285, 210, 14);
        addNum('eyeL', 215, 245, 14);
        addNum('eyeR', 285, 245, 14);
        addNum('pupilL', 215, 252, 10);
        addNum('pupilR', 285, 252, 10);
        addNum('mouth', 250, 295, 14);
        addNum('handL', 170, 280, 14);
        addNum('handR', 330, 280, 14);
    }
}`,

    'MandalaVerguenza': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#333', strokeWidth: 2, fill: fillState[id] || '#FFFFFF', selectable: false, hoverCursor: 'pointer' });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    
    // Líneas de rubor/calor (rayos hacia afuera)
    for(let i=0; i<12; i++) {
        const angle = i * 30;
        const rad = angle * Math.PI / 180;
        const x1 = cx + Math.cos(rad) * 140;
        const y1 = cy + Math.sin(rad) * 140;
        const x2 = cx + Math.cos(rad) * 200;
        const y2 = cy + Math.sin(rad) * 200;
        const line = new fabric.Line([x1, y1, x2, y2], {
            stroke: fillState['ray'+i] || '#FFFFFF',
            strokeWidth: 5,
            strokeLineCap: 'round',
            selectable: false,
            hoverCursor: 'pointer',
            id: 'ray'+i
        });
        line.on('mousedown', () => onFill('ray'+i));
        canvas.add(line);
    }
    
    // Rostro principal
    createObj(new fabric.Circle({ 
        left: cx, top: cy, radius: 110, 
        originX: 'center', originY: 'center', strokeWidth: 4 
    }), 'face');
    
    // Ojos cerrados con fuerza (vergüenza) - ahora rellenables
    createObj(new fabric.Path('M 195 230 Q 220 238 245 230 L 245 235 Q 220 242 195 235 Z'), 'eyeL');
    createObj(new fabric.Path('M 255 230 Q 280 238 305 230 L 305 235 Q 280 242 255 235 Z'), 'eyeR');
    
    // Mejillas sonrojadas (grandes)
    createObj(new fabric.Circle({ 
        left: 180, top: 265, radius: 30, 
        originX: 'center', originY: 'center' 
    }), 'cheekL');
    createObj(new fabric.Circle({ 
        left: 320, top: 265, radius: 30, 
        originX: 'center', originY: 'center' 
    }), 'cheekR');
    
    // Boca pequeña (incómoda)
    createObj(new fabric.Ellipse({ 
        left: cx, top: 305, rx: 20, ry: 10, 
        originX: 'center', originY: 'center' 
    }), 'mouth');
    
    // Gotas de sudor
    createObj(new fabric.Path('M 160 200 Q 150 215 160 230 Q 170 215 160 200 Z'), 'sweat1');
    createObj(new fabric.Path('M 340 200 Q 330 215 340 230 Q 350 215 340 200 Z'), 'sweat2');
    createObj(new fabric.Path('M 190 180 Q 185 190 190 200 Q 195 190 190 180 Z'), 'sweat3');
    createObj(new fabric.Path('M 310 180 Q 305 190 310 200 Q 315 190 310 180 Z'), 'sweat4');
    
    if(showNumbers && solution) {
        const addNum = (id, x, y, sz=16) => canvas.add(new fabric.Text(solution[id] || '?', {
            left: x, top: y, fontSize: sz, originX: 'center', originY: 'center',
            fill: '#333', fontWeight: 'bold', selectable: false, evented: false
        }));
        
        // Rayos
        for(let i=0; i<12; i++) {
            const angle = i * 30;
            const rad = angle * Math.PI / 180;
            addNum('ray'+i, cx + Math.cos(rad) * 170, cy + Math.sin(rad) * 170, 14);
        }
        
        addNum('face', 250, 160, 18);
        addNum('eyeL', 220, 232, 14);
        addNum('eyeR', 280, 232, 14);
        addNum('cheekL', 180, 265, 16);
        addNum('cheekR', 320, 265, 16);
        addNum('mouth', 250, 305, 14);
        addNum('sweat1', 160, 215, 12);
        addNum('sweat2', 340, 215, 12);
        addNum('sweat3', 190, 190, 10);
        addNum('sweat4', 310, 190, 10);
    }
}`,
    // --- ADVANCED LEVEL (Geometry) ---
    'MandalaGeo1': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#222', strokeWidth: 3, fill: fillState[id] || '#F5F5F5', selectable: false, hoverCursor: 'pointer', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 6, offsetX: 2, offsetY: 2 }) });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    
    // Hexágono central grande
    createObj(new fabric.Polygon(getPolygonPoints(6, 110, cx, cy), {originX:'center', originY:'center'}), 'p1');
    
    // 6 hexágonos medianos alrededor
    for(let i=0; i<6; i++) {
        const angle = i * 60;
        const rad = angle * Math.PI / 180;
        const x = cx + Math.cos(rad) * 140;
        const y = cy + Math.sin(rad) * 140;
        createObj(new fabric.Polygon(getPolygonPoints(6, 45, x, y), {originX:'center', originY:'center'}), 'p'+(i+2));
    }
    
    // 6 triángulos en los espacios entre hexágonos
    for(let i=0; i<6; i++) {
        const angle = i * 60 + 30; // Offset de 30 grados
        const rad = angle * Math.PI / 180;
        const x = cx + Math.cos(rad) * 95;
        const y = cy + Math.sin(rad) * 95;
        createObj(new fabric.Polygon(getPolygonPoints(3, 25, x, y, angle), {originX:'center', originY:'center'}), 'p'+(i+8));
    }
    
    if(showNumbers && solution) {
        const addNum = (id, x, y, sz=18) => canvas.add(new fabric.Text(solution[id]||'?', {
            left: x, top: y, fontSize: sz, originX: 'center', originY: 'center', 
            fill: '#000', fontWeight: 'bold', selectable: false, evented: false
        }));
        
        // Hexágono central
        addNum('p1', cx, cy, 24);
        
        // Hexágonos exteriores
        for(let i=0; i<6; i++) {
            const angle = i * 60;
            const rad = angle * Math.PI / 180;
            const x = cx + Math.cos(rad) * 140;
            const y = cy + Math.sin(rad) * 140;
            addNum('p'+(i+2), x, y, 18);
        }
        
        // Triángulos
        for(let i=0; i<6; i++) {
            const angle = i * 60 + 30;
            const rad = angle * Math.PI / 180;
            const x = cx + Math.cos(rad) * 95;
            const y = cy + Math.sin(rad) * 95;
            addNum('p'+(i+8), x, y, 14);
        }
    }
}`,
    'MandalaGeo2': `function(canvas, fillState, onFill, showNumbers, solution) {
        const createObj = (obj, id) => {
             obj.set({ id: id, stroke: '#222', strokeWidth: 3, fill: fillState[id] || '#F5F5F5', selectable: false, hoverCursor: 'pointer' });
             obj.on('mousedown', () => onFill(id));
             canvas.add(obj);
        };
        createObj(new fabric.Path('M 225 195 L 255 225 L 225 255 L 195 225 Z'), 'p1');
        const pos = [{id:'p2',x:225,y:150},{id:'p3',x:300,y:225},{id:'p4',x:225,y:300},{id:'p5',x:150,y:225}];
        pos.forEach(p => createObj(new fabric.Path(\`M \${p.x} \${p.y-30} L \${p.x+22} \${p.y} L \${p.x} \${p.y+30} L \${p.x-22} \${p.y} Z\`), p.id));
        const diag = [{id:'p6',x:270,y:180},{id:'p7',x:270,y:270},{id:'p8',x:180,y:270},{id:'p9',x:180,y:180}];
        diag.forEach(p => createObj(new fabric.Path(\`M \${p.x} \${p.y-18} L \${p.x+18} \${p.y} L \${p.x} \${p.y+18} L \${p.x-18} \${p.y} Z\`), p.id));
        if(showNumbers && solution) {
             const addNum = (id,x,y) => canvas.add(new fabric.Text(solution[id]||'?',{left:x,top:y,fontSize:14,originX:'center',originY:'center',fill:'#000',selectable:false,evented:false}));
             addNum('p1', 213, 213);
             pos.forEach(p => addNum(p.id, p.x-12, p.y-12));
             diag.forEach(p => addNum(p.id, p.x-12, p.y-12));
        }
    }`,
    'MandalaGeo3': `function(canvas, fillState, onFill, showNumbers, solution) {
        const createObj = (obj, id) => {
             obj.set({ id: id, stroke: '#222', strokeWidth: 3, fill: fillState[id] || '#F5F5F5', selectable: false, hoverCursor: 'pointer', shadow: new fabric.Shadow({color:'rgba(0,0,0,0.3)',blur:6,offsetX:2,offsetY:2}) });
             obj.on('mousedown', () => onFill(id));
             canvas.add(obj);
        };
        const parts = [{id:'p1',pts:12,out:112,in:60},{id:'p2',pts:8,out:82,in:45},{id:'p3',pts:6,out:52,in:30}];
        parts.forEach(p => createObj(new fabric.Polygon(getStarPoints(p.pts, p.in, p.out, 225, 225), {originX:'center', originY:'center'}), p.id));
        createObj(new fabric.Circle({left:225, top:225, radius:22, originX:'center', originY:'center'}), 'p4');
        if(showNumbers && solution) {
             const addNum = (id,x,y) => canvas.add(new fabric.Text(solution[id]||'?',{left:x,top:y,fontSize:16,originX:'center',originY:'center',fill:'#000',selectable:false,evented:false}));
             parts.forEach(p => addNum(p.id, 213, 225-(p.out-22)));
             addNum('p4', 213, 225);
        }
    }`,
    'MandalaGeo4': `function(canvas, fillState, onFill, showNumbers, solution) {
         const createObj = (obj, id) => {
             obj.set({ id: id, stroke: '#222', strokeWidth: 3, fill: fillState[id] || '#F5F5F5', selectable: false, hoverCursor: 'pointer', shadow: new fabric.Shadow({color:'rgba(0,0,0,0.3)',blur:6,offsetX:2,offsetY:2}) });
             obj.on('mousedown', () => onFill(id));
             canvas.add(obj);
         };
         createObj(new fabric.Circle({left:225, top:225, radius:45, originX:'center', originY:'center'}), 'p1');
         for(let i=0; i<6; i++) {
             const rad = i*60*Math.PI/180;
             const x = 225+Math.cos(rad)*68, y = 225+Math.sin(rad)*68;
             createObj(new fabric.Circle({left:x, top:y, radius:38, originX:'center', originY:'center'}), 'p'+(i+2));
         }
         for(let i=0; i<6; i++) {
             const rad = (i*60+30)*Math.PI/180;
             const x = 225+Math.cos(rad)*112, y = 225+Math.sin(rad)*112;
             createObj(new fabric.Circle({left:x, top:y, radius:22, originX:'center', originY:'center'}), 'p'+(i+8));
         }
         if(showNumbers && solution) {
             const addNum = (id,x,y) => canvas.add(new fabric.Text(solution[id]||'?',{left:x,top:y,fontSize:14,originX:'center',originY:'center',fill:'#000',selectable:false,evented:false}));
             addNum('p1', 213, 213);
             for(let i=0; i<6; i++) {
                 const rad = i*60*Math.PI/180;
                 addNum('p'+(i+2), 225+Math.cos(rad)*68-12, 225+Math.sin(rad)*68-12);
             }
             for(let i=0; i<6; i++) {
                 const rad = (i*60+30)*Math.PI/180;
                 addNum('p'+(i+8), 225+Math.cos(rad)*112-12, 225+Math.sin(rad)*112-12);
             }
         }
    }`,
    'MandalaGeo5': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#222', strokeWidth: 3, fill: fillState[id] || '#F5F5F5', selectable: false, hoverCursor: 'pointer', shadow: new fabric.Shadow({color:'rgba(0,0,0,0.3)',blur:6,offsetX:2,offsetY:2}) });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    
    // Cuadrado central
    createObj(new fabric.Rect({left: cx, top: cy, width: 60, height: 60, originX:'center', originY:'center'}), 'p1');
    
    // 4 rectángulos horizontales (arriba, abajo, izquierda, derecha)
    createObj(new fabric.Rect({left: cx, top: cy - 80, width: 80, height: 30, originX:'center', originY:'center'}), 'p2'); // Arriba
    createObj(new fabric.Rect({left: cx, top: cy + 80, width: 80, height: 30, originX:'center', originY:'center'}), 'p3'); // Abajo
    createObj(new fabric.Rect({left: cx - 80, top: cy, width: 30, height: 80, originX:'center', originY:'center'}), 'p4'); // Izquierda
    createObj(new fabric.Rect({left: cx + 80, top: cy, width: 30, height: 80, originX:'center', originY:'center'}), 'p5'); // Derecha
    
    // 4 rectángulos en las esquinas (rotados 45 grados)
    createObj(new fabric.Rect({left: cx - 85, top: cy - 85, width: 70, height: 25, originX:'center', originY:'center', angle: 45}), 'p6'); // Superior izquierda
    createObj(new fabric.Rect({left: cx + 85, top: cy - 85, width: 70, height: 25, originX:'center', originY:'center', angle: -45}), 'p7'); // Superior derecha
    createObj(new fabric.Rect({left: cx + 85, top: cy + 85, width: 70, height: 25, originX:'center', originY:'center', angle: 45}), 'p8'); // Inferior derecha
    createObj(new fabric.Rect({left: cx - 85, top: cy + 85, width: 70, height: 25, originX:'center', originY:'center', angle: -45}), 'p9'); // Inferior izquierda
    
    // 4 rectángulos pequeños en las puntas exteriores
    createObj(new fabric.Rect({left: cx, top: cy - 135, width: 50, height: 20, originX:'center', originY:'center'}), 'p10'); // Arriba
    createObj(new fabric.Rect({left: cx, top: cy + 135, width: 50, height: 20, originX:'center', originY:'center'}), 'p11'); // Abajo
    createObj(new fabric.Rect({left: cx - 135, top: cy, width: 20, height: 50, originX:'center', originY:'center'}), 'p12'); // Izquierda
    createObj(new fabric.Rect({left: cx + 135, top: cy, width: 20, height: 50, originX:'center', originY:'center'}), 'p13'); // Derecha
    
    if(showNumbers && solution) {
        const addNum = (id, x, y, sz=18) => canvas.add(new fabric.Text(solution[id]||'?', {
            left: x, top: y, fontSize: sz, originX: 'center', originY: 'center', 
            fill: '#000', fontWeight: 'bold', selectable: false, evented: false
        }));
        
        // Cuadrado central
        addNum('p1', cx, cy, 22);
        
        // Rectángulos principales (arriba, abajo, izquierda, derecha)
        addNum('p2', cx, cy - 80, 18);      // Arriba
        addNum('p3', cx, cy + 80, 18);      // Abajo
        addNum('p4', cx - 80, cy, 18);      // Izquierda
        addNum('p5', cx + 80, cy, 18);      // Derecha
        
        // Rectángulos en esquinas
        addNum('p6', cx - 85, cy - 85, 16); // Superior izquierda
        addNum('p7', cx + 85, cy - 85, 16); // Superior derecha
        addNum('p8', cx + 85, cy + 85, 16); // Inferior derecha
        addNum('p9', cx - 85, cy + 85, 16); // Inferior izquierda
        
        // Rectángulos exteriores
        addNum('p10', cx, cy - 135, 14);    // Arriba
        addNum('p11', cx, cy + 135, 14);    // Abajo
        addNum('p12', cx - 135, cy, 14);    // Izquierda
        addNum('p13', cx + 135, cy, 14);    // Derecha
    }
}`,
    'MandalaGeo6': `function(canvas, fillState, onFill, showNumbers, solution) {
        const createObj = (obj, id) => {
             obj.set({ id: id, stroke: '#222', strokeWidth: 3, fill: fillState[id] || '#F5F5F5', selectable: false, hoverCursor: 'pointer' });
             obj.on('mousedown', () => onFill(id));
             canvas.add(obj);
        };
        createObj(new fabric.Polygon(getPolygonPoints(6, 45, 225, 225), {originX:'center', originY:'center'}), 'p1');
        for(let i=0; i<6; i++) {
            const rad = i*60*Math.PI/180;
            const x = 225+Math.cos(rad)*60, y = 225+Math.sin(rad)*60;
            // Trapezoid path approximation
            const path = \`M -15 -25 L 15 -25 L 25 25 L -25 25 Z\`;
            const trap = new fabric.Path(path);
            trap.set({left:x, top:y, originX:'center', originY:'center', angle:i*60});
            createObj(trap, 'p'+(i+2));
        }
        if(showNumbers && solution) {
             const addNum = (id,x,y) => canvas.add(new fabric.Text(solution[id]||'?',{left:x,top:y,fontSize:16,originX:'center',originY:'center',fill:'#000',selectable:false,evented:false}));
             addNum('p1', 213, 213);
             for(let i=0; i<6; i++) {
                 const rad = i*60*Math.PI/180;
                 addNum('p'+(i+2), 225+Math.cos(rad)*60-12, 225+Math.sin(rad)*60-12);
             }
        }
    }`,
    'MandalaGeo7': `function(canvas, fillState, onFill, showNumbers, solution) {
        const createObj = (obj, id) => {
             obj.set({ id: id, stroke: '#222', strokeWidth: 3, fill: fillState[id] || '#F5F5F5', selectable: false, hoverCursor: 'pointer' });
             obj.on('mousedown', () => onFill(id));
             canvas.add(obj);
        };
        createObj(new fabric.Polygon(getPolygonPoints(6, 40, 225, 225), {originX:'center', originY:'center'}), 'p1');
        const sq = [{id:'p2',x:165,y:165},{id:'p3',x:285,y:165},{id:'p4',x:285,y:285},{id:'p5',x:165,y:285}];
        sq.forEach(p => createObj(new fabric.Rect({left:p.x, top:p.y, width:50, height:50, originX:'center', originY:'center'}), p.id));
        const hex = [{id:'p6',x:225,y:150},{id:'p7',x:300,y:225},{id:'p8',x:225,y:300},{id:'p9',x:150,y:225}];
        hex.forEach(p => createObj(new fabric.Polygon(getPolygonPoints(6, 28, p.x, p.y), {originX:'center', originY:'center'}), p.id));
        if(showNumbers && solution) {
             const addNum = (id,x,y) => canvas.add(new fabric.Text(solution[id]||'?',{left:x,top:y,fontSize:14,originX:'center',originY:'center',fill:'#000',selectable:false,evented:false}));
             addNum('p1', 213, 213);
             sq.forEach(p => addNum(p.id, p.x-12, p.y-12));
             hex.forEach(p => addNum(p.id, p.x-12, p.y-12));
        }
    }`,
    'MandalaGeo8': `function(canvas, fillState, onFill, showNumbers, solution) {
    const cx = 250, cy = 250;
    const createObj = (obj, id) => {
        obj.set({ id: id, stroke: '#222', strokeWidth: 3, fill: fillState[id] || '#F5F5F5', selectable: false, hoverCursor: 'pointer', shadow: new fabric.Shadow({color:'rgba(0,0,0,0.3)',blur:6,offsetX:2,offsetY:2}) });
        obj.on('mousedown', () => onFill(id));
        canvas.add(obj);
    };
    
    // Octágono central grande
    createObj(new fabric.Polygon(getPolygonPoints(8, 100, cx, cy), {originX:'center', originY:'center'}), 'p1');
    
    // 8 triángulos exteriores formando una estrella
    for(let i=0; i<8; i++) {
        const angle = i * 45;
        const rad = angle * Math.PI / 180;
        const x = cx + Math.cos(rad) * 140;
        const y = cy + Math.sin(rad) * 140;
        const tri = getPolygonPoints(3, 45, x, y, angle + 90);
        createObj(new fabric.Polygon(tri, {originX:'center', originY:'center'}), 'p'+(i+2));
    }
    
    // Cuadrado central
    createObj(new fabric.Rect({left: cx, top: cy, width: 70, height: 70, originX:'center', originY:'center'}), 'p10');
    
    // 4 rombos en las esquinas del cuadrado
    const romboSize = 25;
    const positions = [
        {x: cx-35, y: cy-35, id: 'p11'},
        {x: cx+35, y: cy-35, id: 'p12'},
        {x: cx+35, y: cy+35, id: 'p13'},
        {x: cx-35, y: cy+35, id: 'p14'}
    ];
    
    positions.forEach(pos => {
        const rombo = new fabric.Path(\`M \${pos.x} \${pos.y-romboSize} L \${pos.x+romboSize} \${pos.y} L \${pos.x} \${pos.y+romboSize} L \${pos.x-romboSize} \${pos.y} Z\`);
        createObj(rombo, pos.id);
    });
    
    if(showNumbers && solution) {
        const addNum = (id, x, y, sz=16) => canvas.add(new fabric.Text(solution[id]||'?', {
            left: x, top: y, fontSize: sz, originX: 'center', originY: 'center', 
            fill: '#000', fontWeight: 'bold', selectable: false, evented: false
        }));
        
        // Octágono central
        addNum('p1', cx, cy-50, 18);
        
        // Triángulos exteriores
        for(let i=0; i<8; i++) {
            const angle = i * 45;
            const rad = angle * Math.PI / 180;
            const x = cx + Math.cos(rad) * 140;
            const y = cy + Math.sin(rad) * 140;
            addNum('p'+(i+2), x, y, 16);
        }
        
        // Cuadrado central
        addNum('p10', cx, cy, 16);
        
        // Rombos
        addNum('p11', cx-35, cy-35, 14);
        addNum('p12', cx+35, cy-35, 14);
        addNum('p13', cx+35, cy+35, 14);
        addNum('p14', cx-35, cy+35, 14);
    }
}`
};

// --- DATA CONSTANTS ---
const MANDALA_DATA = {
    // Básico
    'nat1': { id: 'nat1', name: 'Árbol de la Vida', level: 'Básico', theme: 'Naturaleza', componentName: 'MandalaArbol1', colors: [{ id: '1', hex: '#8B4513' }, { id: '2', hex: '#654321' }, { id: '3', hex: '#228B22' }, { id: '4', hex: '#90EE90' }], solution: { p1: '1', p2: '2', p3: '2', p4: '2', p5: '3', p6: '4', p7: '3', p8: '4', p9: '3', p10: '4', p11: '3', p12: '4' } },
    'nat2': { id: 'nat2', name: 'Flor Mandala', level: 'Básico', theme: 'Naturaleza', componentName: 'MandalaFlor1', colors: [{ id: '1', hex: '#FFD700' }, { id: '2', hex: '#FF69B4' }, { id: '3', hex: '#FF1493' }, { id: '4', hex: '#FFC0CB' }], solution: { p1: '1', p2: '2', p3: '2', p4: '2', p5: '2', p6: '2', p7: '2', p8: '2', p9: '2', p10: '2', p11: '3', p12: '3', p13: '3', p14: '3', p15: '3', p16: '3', p17: '3', p18: '3' } },
    'nat3': { id: 'nat3', name: 'Mariposa', level: 'Básico', theme: 'Naturaleza', componentName: 'MandalaMariposa1', colors: [{ id: '1', hex: '#E1BEE7' }, { id: '2', hex: '#9C27B0' }, { id: '3', hex: '#4A148C' }, { id: '4', hex: '#CE93D8' }], solution: { p1: '3', p2: '3', p3: '3', p4: '2', p5: '2', p6: '1', p7: '1', p8: '4', p9: '4', p10: '1' } },
    'nat4': { id: 'nat4', name: 'Sol Radiante', level: 'Básico', theme: 'Naturaleza', componentName: 'MandalaSol', colors: [{ id: '1', hex: '#FFD700' }, { id: '2', hex: '#FFA500' }, { id: '3', hex: '#FF8C00' }, { id: '4', hex: '#FFEB3B' }], solution: { p1: '1', p2: '2', p3: '3', p4: '4', p5: '3', p6: '4', p7: '3', p8: '4', p9: '3', p10: '4', p11: '3', p12: '4', p13: '3', p14: '4' } },
    'nat5': { id: 'nat5', name: 'Hoja de Otoño', level: 'Básico', theme: 'Naturaleza', componentName: 'MandalaHoja', colors: [{ id: '1', hex: '#8B4513' }, { id: '2', hex: '#228B22' }, { id: '3', hex: '#90EE90' }, { id: '4', hex: '#32CD32' }], solution: { p1: '1', p2: '2', p3: '3', p4: '3', p5: '4', p6: '4', p7: '3', p8: '3' } },
    'nat6': { id: 'nat6', name: 'Árbol Geométrico', level: 'Básico', theme: 'Naturaleza', componentName: 'MandalaArbol2', colors: [{ id: '1', hex: '#2E7D32' }, { id: '2', hex: '#66BB6A' }, { id: '3', hex: '#A5D6A7' }, { id: '4', hex: '#6D4C41' }], solution: { p1: '3', p2: '2', p3: '1', p4: '4' } },
    // Agregar después de 'nat6' y antes del comentario // Intermedio

    'nat7': {
        id: 'nat7',
        name: 'Pez Tropical',
        level: 'Básico',
        theme: 'Naturaleza',
        componentName: 'MandalaPez',
        colors: [
            { id: '1', hex: '#FF8C00' },  // Naranja
            { id: '2', hex: '#4169E1' },  // Azul real
            { id: '3', hex: '#87CEEB' },  // Azul cielo
            { id: '4', hex: '#FFD700' }   // Dorado
        ],
        solution: {
            body: '2',
            topFin: '1',
            bottomFin: '1',
            tail: '2',
            eye: '3',
            pupil: '4',
            scale1: '3',
            scale2: '3',
            scale3: '3',
            stripe1: '4',
            stripe2: '4'
        }
    },

    'nat8': {
        id: 'nat8',
        name: 'Búho Sabio',
        level: 'Básico',
        theme: 'Naturaleza',
        componentName: 'MandalaBuho',
        colors: [
            { id: '1', hex: '#8B4513' },  // Marrón
            { id: '2', hex: '#D2691E' },  // Chocolate
            { id: '3', hex: '#FFD700' },  // Dorado
            { id: '4', hex: '#F4A460' }   // Arena (Sandy Brown)
        ],
        solution: {
            body: '1',
            head: '2',
            earL: '1',
            earR: '1',
            eyeL: '3',
            eyeR: '3',
            pupilL: '4',
            pupilR: '4',
            beak: '1',
            wingL: '2',
            wingR: '2',
            legL: '4',
            legR: '4'
        }
    },
    // Intermedio
    'emo1': { id: 'emo1', name: 'Alegría Radiante', level: 'Intermedio', theme: 'Emociones', componentName: 'MandalaAlegria1', colors: [{ id: '1', hex: '#FFD700' }, { id: '2', hex: '#FFA500' }, { id: '3', hex: '#FF6347' }, { id: '4', hex: '#FFC0CB' }], solution: { face: '1', mouth: '3', eyeL: '4', eyeR: '4', chL: '4', chR: '4', r0: '2', r1: '2', r2: '2', r3: '2', r4: '2', r5: '2', r6: '2', r7: '2' } },
    'emo2': { id: 'emo2', name: 'Nube de Tristeza', level: 'Intermedio', theme: 'Emociones', componentName: 'MandalaTristeza1', colors: [{ id: '1', hex: '#E0FFFF' }, { id: '2', hex: '#4682B4' }, { id: '3', hex: '#0000CD' }, { id: '4', hex: '#87CEEB' }], solution: { face: '1', mouth: '3', eyeL: '3', eyeR: '3', tear: '4', d1: '2', d2: '2', d3: '2', d4: '2', d5: '2' } },
    'emo3': { id: 'emo3', name: 'Furia Explosiva', level: 'Intermedio', theme: 'Emociones', componentName: 'MandalaIra', colors: [{ id: '1', hex: '#FF4444' }, { id: '2', hex: '#FF6B35' }, { id: '3', hex: '#FFA500' }, { id: '4', hex: '#FFE66D' }], solution: { bg: '1', face: '2', browL: '3', browR: '3', eyeL: '4', eyeR: '4', mouth: '4' } },
    'emo4': { id: 'emo4', name: 'Miedo Espiral', level: 'Intermedio', theme: 'Emociones', componentName: 'MandalaMiedo1', colors: [{ id: '1', hex: '#9370DB' }, { id: '2', hex: '#E6E6FA' }, { id: '3', hex: '#FFFFFF' }, { id: '4', hex: '#4B0082' }], solution: { hair: '1', face: '2', eyeL: '3', eyeR: '3', pupilL: '4', pupilR: '4', mouth: '4' } },
    'emo5': { id: 'emo5', name: 'Asco Viscoso', level: 'Intermedio', theme: 'Emociones', componentName: 'MandalaAsco', colors: [{ id: '1', hex: '#32CD32' }, { id: '2', hex: '#98FB98' }, { id: '3', hex: '#2E8B57' }, { id: '4', hex: '#FF69B4' }], solution: { face: '2', eyeL: '3', eyeR: '3', mouth: '3', tongue: '4', b0: '1', b60: '1', b120: '1', b180: '1', b240: '1', b300: '1' } },
    'emo6': { id: 'emo6', name: 'Sorpresa Estelar', level: 'Intermedio', theme: 'Emociones', componentName: 'MandalaSorpresa', colors: [{ id: '1', hex: '#FFA500' }, { id: '2', hex: '#FFDAB9' }, { id: '3', hex: '#8B4513' }, { id: '4', hex: '#000000' }], solution: { bg: '1', face: '2', browL: '3', browR: '3', eyeL: '4', eyeR: '4', mouth: '4' } },

    'emo7': {
        id: 'emo7',
        name: 'Peso de la Culpa',
        level: 'Intermedio',
        theme: 'Emociones',
        componentName: 'MandalaCulpa',
        colors: [
            { id: '1', hex: '#4A4A4A' },  // Gris oscuro
            { id: '2', hex: '#6B6B6B' },  // Gris medio
            { id: '3', hex: '#8B7355' },  // Marrón apagado
            { id: '4', hex: '#2C3E50' },  // Azul grisáceo
            { id: '5', hex: '#95A5A6' }   // Gris claro
        ],
        solution: {
            face: '1', bg: '2',
            browL: '3', browR: '3',
            eyeL: '5', eyeR: '5',
            pupilL: '1', pupilR: '1',
            mouth: '3',
            handL: '2', handR: '2',
            chain0: '3', chain1: '4', chain2: '3', chain3: '4',
            chain4: '3', chain5: '4', chain6: '3', chain7: '4'
        }
    },

    'emo8': {
        id: 'emo8',
        name: 'Rubor de Vergüenza',
        level: 'Intermedio',
        theme: 'Emociones',
        componentName: 'MandalaVerguenza',
        colors: [
            { id: '1', hex: '#FFB6C1' },  // Rosa claro
            { id: '2', hex: '#FF69B4' },  // Rosa fuerte
            { id: '3', hex: '#DC143C' },  // Carmesí (diferente para ojos)
            { id: '4', hex: '#FFC0CB' }   // Rosa pálido
        ],
        solution: {
            face: '1',
            eyeL: '3', eyeR: '3',  // Ahora con color único
            cheekL: '2', cheekR: '2',
            mouth: '3',
            sweat1: '4', sweat2: '4', sweat3: '4', sweat4: '4',
            ray0: '2', ray1: '3', ray2: '2', ray3: '3',
            ray4: '2', ray5: '3', ray6: '2', ray7: '3',
            ray8: '2', ray9: '3', ray10: '2', ray11: '3'
        }
    },
    // Avanzado
    // Reemplazar geo1:
    'geo1': {
        id: 'geo1',
        name: 'Hexágonos Sagrados',
        level: 'Avanzado',
        theme: 'Geometría',
        componentName: 'MandalaGeo1',
        colors: [
            { id: '1', hex: '#E53935' },
            { id: '2', hex: '#1E88E5' },
            { id: '3', hex: '#43A047' },
            { id: '4', hex: '#FDD835' },
            { id: '5', hex: '#8E24AA' },
            { id: '6', hex: '#F06292' }
        ],
        solution: {
            p1: '1',   // Hexágono central
            p2: '2',   // Hexágono 1
            p3: '3',   // Hexágono 2
            p4: '4',   // Hexágono 3
            p5: '5',   // Hexágono 4
            p6: '6',   // Hexágono 5
            p7: '2',   // Hexágono 6
            p8: '3',   // Triángulo 1
            p9: '4',   // Triángulo 2
            p10: '5',  // Triángulo 3
            p11: '6',  // Triángulo 4
            p12: '1',  // Triángulo 5
            p13: '2'   // Triángulo 6
        }
    },


    'geo2': { id: 'geo2', name: 'Mosaico de Rombos', level: 'Avanzado', theme: 'Geometría', componentName: 'MandalaGeo2', colors: [{ id: '1', hex: '#D32F2F' }, { id: '2', hex: '#1976D2' }, { id: '3', hex: '#388E3C' }, { id: '4', hex: '#F57C00' }, { id: '5', hex: '#7B1FA2' }, { id: '6', hex: '#C2185B' }], solution: { p1: '1', p2: '2', p3: '3', p4: '4', p5: '5', p6: '6', p7: '2', p8: '3', p9: '4' } },
    'geo3': { id: 'geo3', name: 'Constelación Estelar', level: 'Avanzado', theme: 'Geometría', componentName: 'MandalaGeo3', colors: [{ id: '1', hex: '#C62828' }, { id: '2', hex: '#283593' }, { id: '3', hex: '#2E7D32' }, { id: '4', hex: '#F9A825' }], solution: { p1: '1', p2: '2', p3: '3', p4: '4' } },
    'geo4': { id: 'geo4', name: 'Galaxia Circular', level: 'Avanzado', theme: 'Geometría', componentName: 'MandalaGeo4', colors: [{ id: '1', hex: '#E91E63' }, { id: '2', hex: '#2196F3' }, { id: '3', hex: '#4CAF50' }, { id: '4', hex: '#FFEB3B' }], solution: { p1: '1', p2: '2', p3: '3', p4: '4', p5: '2', p6: '3', p7: '4', p8: '2', p9: '3', p10: '4', p11: '2', p12: '3', p13: '4' } },
    // Reemplazar geo5:
    'geo5': {
        id: 'geo5',
        name: 'Laberinto Rectangular',
        level: 'Avanzado',
        theme: 'Geometría',
        componentName: 'MandalaGeo5',
        colors: [
            { id: '1', hex: '#F44336' },  // Rojo
            { id: '2', hex: '#3F51B5' },  // Azul
            { id: '3', hex: '#009688' },  // Verde azulado
            { id: '4', hex: '#FFC107' },  // Amarillo
            { id: '5', hex: '#673AB7' },  // Púrpura
            { id: '6', hex: '#E91E63' }   // Rosa
        ],
        solution: {
            p1: '1',   // Cuadrado central
            p2: '2',   // Rectángulo arriba
            p3: '3',   // Rectángulo abajo
            p4: '4',   // Rectángulo izquierda
            p5: '5',   // Rectángulo derecha
            p6: '6',   // Esquina superior izquierda
            p7: '1',   // Esquina superior derecha
            p8: '2',   // Esquina inferior derecha
            p9: '3',   // Esquina inferior izquierda
            p10: '4',  // Exterior arriba
            p11: '5',  // Exterior abajo
            p12: '6',  // Exterior izquierda
            p13: '1'   // Exterior derecha
        }
    },
    'geo6': { id: 'geo6', name: 'Corona de Trapecios', level: 'Avanzado', theme: 'Geometría', componentName: 'MandalaGeo6', colors: [{ id: '1', hex: '#FF5722' }, { id: '2', hex: '#2196F3' }, { id: '3', hex: '#4CAF50' }, { id: '4', hex: '#FFC107' }, { id: '5', hex: '#9C27B0' }, { id: '6', hex: '#00BCD4' }], solution: { p1: '1', p2: '2', p3: '3', p4: '4', p5: '5', p6: '6', p7: '2' } },
    'geo7': { id: 'geo7', name: 'Jardín Geométrico', level: 'Avanzado', theme: 'Geometría', componentName: 'MandalaGeo7', colors: [{ id: '1', hex: '#E91E63' }, { id: '2', hex: '#3F51B5' }, { id: '3', hex: '#009688' }, { id: '4', hex: '#FF9800' }, { id: '5', hex: '#9C27B0' }, { id: '6', hex: '#00BCD4' }], solution: { p1: '1', p2: '2', p3: '3', p4: '4', p5: '5', p6: '6', p7: '2', p8: '3', p9: '4' } },
    'geo8': {
        id: 'geo8',
        name: 'Mandala Octagonal',
        level: 'Avanzado',
        theme: 'Geometría',
        componentName: 'MandalaGeo8',
        colors: [
            { id: '1', hex: '#E91E63' },  // Rosa
            { id: '2', hex: '#3F51B5' },  // Índigo
            { id: '3', hex: '#00BCD4' },  // Cian
            { id: '4', hex: '#FFC107' },  // Ámbar
            { id: '5', hex: '#9C27B0' },  // Púrpura
            { id: '6', hex: '#4CAF50' }   // Verde
        ],
        solution: {
            p1: '1',   // Octágono
            p2: '2',   // Triángulo 1
            p3: '3',   // Triángulo 2
            p4: '4',   // Triángulo 3
            p5: '5',   // Triángulo 4
            p6: '2',   // Triángulo 5
            p7: '3',   // Triángulo 6
            p8: '4',   // Triángulo 7
            p9: '5',   // Triángulo 8
            p10: '6',  // Cuadrado central
            p11: '1',  // Rombo 1
            p12: '2',  // Rombo 2
            p13: '3',  // Rombo 3
            p14: '4'   // Rombo 4
        }
    }
};

const GAME_SETTINGS = {
    'Básico': { maxMandalas: 3, time: 300, mandalasAvailable: ['nat1', 'nat2', 'nat3', 'nat4', 'nat5', 'nat6', 'nat7', 'nat8'], theme: 'Naturaleza' },
    'Intermedio': { maxMandalas: 5, time: 600, mandalasAvailable: ['emo1', 'emo2', 'emo3', 'emo4', 'emo5', 'emo6', 'emo7', 'emo8'], theme: 'Emociones' },
    'Avanzado': { maxMandalas: 7, time: 900, mandalasAvailable: ['geo1', 'geo2', 'geo3', 'geo4', 'geo5', 'geo6', 'geo7', 'geo8'], theme: 'Geometría' },
};
// Agregar después de las constantes GAME_SETTINGS
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
// --- FABRIC CANVAS COMPONENT ---
const FabricMandalaCanvas = ({ componentName, fillState, onFill, showNumbers, solution }) => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [libLoaded, setLibLoaded] = useState(false);

    useEffect(() => {
        const loadLibs = async () => {
            try {
                if (!window.fabric) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js', 'fabric-script');
                if (!window.Swal) await loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11', 'swal-script');
                defineGlobalHelpers();
                setLibLoaded(true);
            } catch (err) {
                console.error(err);
            }
        };
        loadLibs();
    }, []);

    useEffect(() => {
        if (!libLoaded || !window.fabric) return;

        const canvas = new window.fabric.Canvas(canvasRef.current, {
            selection: false,
            hoverCursor: 'pointer',
            preserveObjectStacking: true
        });
        fabricRef.current = canvas;
        return () => { canvas.dispose(); };
    }, [libLoaded]);

    useEffect(() => {
        if (!libLoaded || !window.fabric) return;
        const canvas = fabricRef.current;
        if (!canvas) return;

        canvas.clear();
        canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));

        try {
            const drawerCode = DRAWER_FUNCTIONS[componentName];
            if (drawerCode) {
                const drawerFunc = new Function('return ' + drawerCode)();
                drawerFunc(canvas, fillState, onFill, showNumbers, solution);
            }
        } catch (e) {
            console.error("Error drawing mandala:", e);
        }

        canvas.renderAll();
    }, [componentName, fillState, showNumbers, solution, libLoaded, onFill]); // Agregamos onFill a las dependencias
    if (!libLoaded) return <div style={{ width: 500, height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', borderRadius: '8px' }}>Cargando...</div>;

    return <canvas ref={canvasRef} width={500} height={500} style={{ border: '1px solid #ddd', borderRadius: '8px' }} />;
};
// --- HTML GENERATOR ---
const generateMandalaCode = (difficultyKey, selectedMandalaIds, gameDetails) => {
    const selectedMandalasData = selectedMandalaIds.map(id => MANDALA_DATA[id]);
    const config = GAME_SETTINGS[difficultyKey];
    const titleText = gameDetails.gameName || 'Juego de Mandala';

    const rawDate = (() => {
        try {
            const stored = typeof localStorage !== 'undefined'
                ? localStorage.getItem('mandala:creation_date')
                : null;
            return stored || gameDetails?.date || new Date().toISOString();
        } catch { return gameDetails?.date || new Date().toISOString(); }
    })();
    const formattedDate = (() => {
        try {
            return new Date(rawDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Fecha no especificada'; }
    })();

    const platformsString = gameDetails.selectedPlatforms && gameDetails.selectedPlatforms.length > 0
        ? gameDetails.selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
        : 'Web';

    // Construir el objeto MANDALA_COMPONENTS inyectando el código de las funciones
    const drawersStr = Object.entries(DRAWER_FUNCTIONS).map(([key, val]) => `'${key}': ${val}`).join(',\n');

    // Título Animado para pantalla inicial
    const staticTitleHTML = `
        <div class="game-title static">
            ${titleText.split('').map((char) =>
        `<span>${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('')}
        </div>
    `;

    // Título Animado para el juego
    const animatedTitleHTML = `
    <div class="game-title">
        ${'Juego de Mandala'.split('').map((char, index) =>
        `<span style="animation-delay: ${index * 0.07}s">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('')}
    </div>
`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleText}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
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
        body { font-family: 'Inter', 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
        
        /* Game Title Styles */
        .game-title {
    text-align: center;
    font-size: 3rem;
    font-weight: 700;
    color: var(--secondary-color);
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    font-family: 'Inter', 'Segoe UI', sans-serif;
}
        .game-title span {
            display: inline-block;
            animation: wave-animation 1.8s infinite;
            position: relative;
        }
        .game-title.static span { animation: none; transform: none; }
        @keyframes wave-animation {
            0%, 40%, 100% { transform: translateY(0); }
            20% { transform: translateY(-20px); }
        }
        
        /* Overlays */
        .overlay { 
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(255,255,255,0.95); display: flex; flex-direction: column; 
            justify-content: center; align-items: center; z-index: 50; 
            transition: opacity 0.3s; padding: 20px; box-sizing: border-box; 
        }
        .hidden { display: none !important; opacity: 0; pointer-events: none; }
        
        .game-layout { display: flex; gap: 2rem; max-width: 900px; width: 100%; flex-wrap: wrap; justify-content: center; margin-top: 2rem; }
        
        .canvas-container-wrapper { background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border: 1px solid #ddd; }
        .sidebar { flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 1rem; }
        .panel { background: white; padding: 1rem; border-radius: 8px; border: 1px solid #ddd; }
        .panel h3 { margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem; color: #1f2937; }
        .color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .color-btn { width: 40px; height: 40px; border-radius: 4px; cursor: pointer; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: transform 0.1s; }
        .color-btn:hover { transform: scale(1.05); }
        .color-btn.selected { border-color: #333; transform: scale(1.1); box-shadow: 0 0 0 2px #005f92; border: 2px solid #fff; }
        
        .btn { 
            background: var(--primary-color);
            color: white; 
            border: none; 
            padding: 12px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 1rem; 
            margin-top: 5px; 
            width: 100%; 
            font-weight: bold; 
        }
        .btn:hover { background: #005f92; }
        
        .stats-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
        
        /* Big Buttons */
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
        .btn-exit { background: #1f2937; }
        .btn-retry { background: var(--primary-color); }
        .btn-info { background: white; color: var(--primary-color); border: 2px solid var(--primary-color); }
        
        /* Countdown */
        .countdown-number { 
            font-size: 8rem; 
            font-weight: bold; 
            color: var(--primary-color); 
            animation: popIn 0.5s ease-out; 
        }
        @keyframes popIn { 
            0% { transform: scale(0); opacity: 0; } 
            80% { transform: scale(1.1); } 
            100% { transform: scale(1); opacity: 1; } 
        }
        
        /* Info Modal Styles */
        .info-modal-content {
            background: white; padding: 2.5rem; border-radius: 1rem; max-width: 600px; width: 90%;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; position: relative;
        }
        .info-header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .info-title { font-size: 1.8rem; color: var(--primary-color); margin: 0; font-weight: 800; }
        .info-subtitle { color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; }
        .info-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
        .info-item { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .info-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem; font-weight: 600; }
        .info-value { font-size: 1.1rem; color: #334155; font-weight: 500; }
        .info-desc { grid-column: 1 / -1; background: #fff; padding: 0; border: none; }
        .close-info-btn { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
        .close-info-btn:hover { color: var(--wrong); }
        
        .clue-text { text-align: center; color: var(--dark-gray); margin-bottom: 0.5rem; font-size: 1.1rem; }
        .game-container {
    background: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 950px;
    margin: 20px auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
    </style>
</head>
<body>
    <!-- START SCREEN -->
    <div id="start-screen" class="overlay">
        <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">Mandala</h2>

        <div style="background: #e0f2fe; color: #005f92; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; margin-bottom: 2rem; display: inline-block;">
            Nivel: ${difficultyKey}
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <button class="big-btn" onclick="startGameSequence()">▶ Iniciar Juego</button>
            <button class="big-btn btn-info" onclick="toggleInfo(true)">ℹ Información</button>
        </div>
    </div>

    <!-- COUNTDOWN SCREEN -->
    <div id="countdown-screen" class="overlay hidden">
        <div id="countdown-display" class="countdown-number">5</div>
    </div>

    <!-- INFO OVERLAY -->
    <div id="info-overlay" class="overlay hidden" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100;">
        <div class="info-modal-content">
            <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
            <div class="info-header">
                <h2 class="info-title">Mandala</h2>
                <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
            </div>
            <div class="info-details-grid">
                <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${gameDetails.version || '1.0.0'}</span></div>
                <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${platformsString}</span></div>
                <div class="info-item"><span class="info-label">Dificultad</span><span class="info-value">${difficultyKey}</span></div>
                <div class="info-item info-desc">
                    <span class="info-label">Descripción</span>
                    <p class="info-value">${gameDetails.description || 'Sin descripción disponible.'}</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="big-btn" style="font-size: 1rem; padding: 0.75rem 2rem;" onclick="toggleInfo(false)">Cerrar</button>
            </div>
        </div>
    </div>

    <!-- END SCREEN -->
    <div id="end-screen" class="overlay hidden">
        <h1 id="end-title" style="color:var(--primary-color); font-size:3rem; font-weight: 800;">Fin del Juego</h1>
        <h2 style="color:var(--secondary-color); font-size:2rem; margin:1rem 0;">Puntos Obtenidos: <span id="final-score">0</span></h2>
        <div class="end-buttons" style="display:flex; gap:1rem;">
             <button class="big-btn btn-exit" onclick="exitGame()">Salir</button>
             <button class="big-btn btn-retry" onclick="location.reload()">Volver a Jugar</button>
        </div>
    </div>

    <!-- GAME UI -->
    <div class="game-container">
    <div id="game-ui" class="hidden" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
        ${animatedTitleHTML}
        <div style="display:grid; grid-template-columns:1fr; max-width:600px; margin:0 auto 1.5rem auto; background:#eff6ff; border:1px solid #bfdbfe; border-radius:0.75rem; padding:0.85rem 1.25rem; text-align:center;">
    <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; margin-bottom:0.25rem; display:block;">📋 Reglas Básicas</span>
    <span style="font-size:1rem; color:#1e40af; font-weight:500;">Colorea las áreas correspondientes siguiendo el número indicado.</span>
</div>
        <div class="game-layout">
            <div class="canvas-container-wrapper">
                <canvas id="c" width="500" height="500"></canvas>
            </div>
            <div class="sidebar">
                <div class="panel">
                    <h3>Progreso</h3>
                    <div class="stats-item"><span>Nivel:</span> <b>${difficultyKey}</b></div>
                    <div class="stats-item"><span>Tiempo:</span> <b id="timer"></b></div>
                    <div class="stats-item"><span>Puntos:</span> <b id="score">0</b></div>
                    <div class="stats-item"><span>Mandala:</span> <b id="progress"></b></div>
                </div>
                <div class="panel">
                    <h3>Paleta</h3>
                    <div id="palette" class="color-grid"></div>
                </div>
                <button class="btn" onclick="checkSolution()">Verificar</button>
                <button class="btn" onclick="finishGame(false)">Finalizar Juego</button>
            </div>
        </div>
    </div>

    <script>
        // --- HELPER FUNCTIONS ---
        ${GEOMETRY_HELPERS_SCRIPT}

        // --- DRAWERS ---
        const DRAWERS = {
            ${drawersStr}
        };

        // --- GAME DATA ---
        const MANDALAS = ${JSON.stringify(selectedMandalasData)};
        const TIME_LIMIT = ${config.time};

        let currentIdx = 0;
        let score = 0;
        let timeLeft = TIME_LIMIT;
        let timerInterval;
        let canvas;
        let fillState = {};
        let selectedColor = null;

        function initCanvas() {
            canvas = new fabric.Canvas('c', { selection: false, hoverCursor: 'default' });
        }

        function startGameSequence() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('countdown-screen').classList.remove('hidden');
            let count = 5;
            const d = document.getElementById('countdown-display');
            d.innerText = count;
            const i = setInterval(() => {
                count--;
                if(count > 0) { 
                    d.innerText = count; 
                    d.style.animation='none'; 
                    d.offsetHeight; 
                    d.style.animation='popIn 0.5s ease-out'; 
                }
                else { 
                    clearInterval(i); 
                    document.getElementById('countdown-screen').classList.add('hidden'); 
                    startGame(); 
                }
            }, 1000);
        }

        function startGame() {
    document.getElementById('game-ui').classList.remove('hidden');
    initCanvas();
    loadMandala(0);
    startTimer(); // Se inicia una sola vez al comenzar el juego
}
        function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('timer').innerText = mins + ':' + (secs < 10 ? '0' : '') + secs;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            Swal.fire({
                title: 'Tiempo Agotado',
                html: '<p>El tiempo se ha terminado.</p><p>Puntos obtenidos: <strong>' + score + '</strong></p>',
                icon: 'warning',
                confirmButtonText: 'Ver Resultados',
                confirmButtonColor: '#0077b6',
                allowOutsideClick: false
            }).then(() => {
                finishGame(false);
            });
        }
    }, 1000);
}

        function loadMandala(idx) {
    currentIdx = idx;
    if (idx >= MANDALAS.length) {
        finishGame(true);
        return;
    }
    
    fillState = {};
    selectedColor = null;
    document.getElementById('progress').innerText = (idx + 1) + '/' + MANDALAS.length;
    renderPalette();
    drawCurrent();
    
    // NO reiniciar el timer aquí, solo continúa corriendo
}

        function renderPalette() {
            const p = document.getElementById('palette');
            p.innerHTML = '';
            MANDALAS[currentIdx].colors.forEach(c => {
                const btn = document.createElement('div');
                btn.className = 'color-btn';
                btn.style.backgroundColor = c.hex;
                btn.innerText = c.id;
                btn.style.color = getContrastColor(c.hex);
                btn.onclick = () => {
                    selectedColor = c;
                    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                };
                p.appendChild(btn);
            });
        }

        function getContrastColor(hex) {
            const r = parseInt(hex.substr(1,2),16), g = parseInt(hex.substr(3,2),16), b = parseInt(hex.substr(5,2),16);
            return ((r*299 + g*587 + b*114)/1000) >= 128 ? 'black' : 'white';
        }
     
        function onFill(id) {
            if (!selectedColor) {
                Swal.fire({ 
                    toast: true, 
                    position: 'top-end', 
                    icon: 'info', 
                    title: 'Selecciona un color', 
                    showConfirmButton: false, 
                    timer: 1500 
                });
                return;
            }
            
            fillState[id] = selectedColor.hex;
            drawCurrent();
        }
        
        function drawCurrent() {
            canvas.clear();
            canvas.setBackgroundColor('#fff', canvas.renderAll.bind(canvas));
            const m = MANDALAS[currentIdx];
            const drawer = DRAWERS[m.componentName];
            if (drawer) {
                drawer(canvas, fillState, onFill, true, m.solution);
            }
            canvas.renderAll();
        }

   function checkSolution() {
    const m = MANDALAS[currentIdx];
    const sol = m.solution;
    const colorMap = m.colors.reduce((acc, c) => ({...acc, [c.id]: c.hex}), {});
    
    const filled = Object.keys(fillState).length;
    const total = Object.keys(sol).length;
    
    // Verificar si está incompleto
    if (filled < total) {
        Swal.fire({
            title: 'Incompleto',
            text: 'Debes colorear todas las áreas antes de verificar',
            icon: 'warning',
            confirmButtonColor: '#0077b6'
        });
        return;
    }
    
    // Verificar si los colores son correctos
    let correct = true;
    for(let k in sol) {
        if(fillState[k] !== colorMap[sol[k]]) { 
            correct = false; 
            break; 
        }
    }
    
    if (!correct) {
        Swal.fire({
            title: 'Incorrecto',
            text: 'Algunos colores no coinciden. Revisa tu mandala e inténtalo de nuevo.',
            icon: 'error',
            confirmButtonColor: '#0077b6'
        });
        return;
    }
    
    // Si está correcto, suma puntos y avanza
    score += 10;
    document.getElementById('score').innerText = score;
    
    Swal.fire({
        title: '¡Correcto!',
        html: '<p style="font-size: 1.2rem; margin: 0;">+10 puntos</p>',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: '#0077b6'
    }).then(nextMandala);
}

        function nextMandala() {
    if (currentIdx < MANDALAS.length - 1) {
        // Avanzar al siguiente mandala
        currentIdx++;
        fillState = {};
        selectedColor = null;
        loadMandala(currentIdx);
    } else {
        // Terminó todos los mandalas
        clearInterval(timerInterval);
        finishGame(true);
    }
}
        function finishGame(completed) {
    clearInterval(timerInterval);
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
    
    if (completed) {
        document.getElementById('end-title').innerText = "¡Juego Completado!";
        document.getElementById('end-title').style.color = "#0077b6";
    } else {
        document.getElementById('end-title').innerText = "Tiempo Agotado";
        document.getElementById('end-title').style.color = "#ef4444";
    }
    
    document.getElementById('final-score').innerText = score;
}

        function toggleInfo(show) {
             const m = document.getElementById('info-overlay');
             m.classList.toggle('hidden', !show);
             m.style.display = show ? 'flex' : 'none';
        }

        function exitGame() { 
            window.close(); 
            Swal.fire({title:'Cierra la pestaña', icon:'info'}); 
        }

        lucide.createIcons();
    </script>
</body>
</html>`;
};

// --- PREVIEW SCREEN ---
const PreviewScreen = ({ difficulty, mandalaIds, onFinishConfig, onBack }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_SETTINGS[difficulty].time);
    const [fillState, setFillState] = useState({});
    const [selectedColor, setSelectedColor] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [libsReady, setLibsReady] = useState(false);

    const mData = MANDALA_DATA[mandalaIds[currentIdx]];
    const timerRef = useRef(null);

    const handleFinishGame = useCallback((completed = false, finalScore = null) => {
        clearInterval(timerRef.current);
        setIsActive(false);

        // Usar el score pasado como parámetro o el estado actual
        const displayScore = finalScore !== null ? finalScore : score;

        const title = completed ? '¡Juego Completado!' : 'Tiempo Agotado';
        const icon = completed ? 'success' : 'warning';

        window.Swal.fire({
            title: title,
            html: `<p style="font-size: 1.3rem; margin: 1rem 0;">Puntaje Obtenido: <strong style="color: #0077b6; font-size: 1.5rem;">${displayScore}</strong></p>`,
            icon: icon,
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
                // Reiniciar juego
                setCurrentIdx(0);
                setScore(0);
                setFillState({});
                setSelectedColor(null);
                setTimeLeft(GAME_SETTINGS[difficulty].time);
                setIsActive(true);
            } else if (result.dismiss === window.Swal.DismissReason.cancel) {
                onBack();
            }
        });
    }, [score, difficulty, onBack]);
    // Cargar librerías necesarias para el preview
    useEffect(() => {
        const load = async () => {
            if (!window.fabric) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js', 'fabric-script');
            if (!window.Swal) await loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11', 'swal-script');
            // Asegurar que los helpers estén definidos
            defineGlobalHelpers();
            setLibsReady(true);
        };
        load();
    }, []);

    useEffect(() => {
        if (!isActive) return;
        if (timeLeft <= 0) {
            clearInterval(timerRef.current);
            setIsActive(false);

            window.Swal.fire({
                title: 'Tiempo Agotado',
                html: `<p>El tiempo se ha terminado.</p><p>Puntos obtenidos: <strong>${score}</strong></p>`,
                icon: 'warning',
                confirmButtonText: 'Ver Resultados',
                confirmButtonColor: '#0077b6',
                allowOutsideClick: false
            }).then(() => {
                handleFinishGame(false, score);
            });
            return;
        }
        timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timerRef.current);
    }, [timeLeft, isActive, score, handleFinishGame]);

    const handleFill = useCallback((id) => {
        if (!selectedColor || !isActive) return;
        setFillState(prev => ({ ...prev, [id]: selectedColor.hex }));
    }, [selectedColor, isActive]);

    // Eliminar completamente la función next anterior y usar solo esta:
    const next = (updatedScore = null) => {
        // Si no se pasa un score actualizado, usar el del estado
        const scoreToUse = updatedScore !== null ? updatedScore : score;

        if (currentIdx < mandalaIds.length - 1) {
            setCurrentIdx(c => c + 1);
            setFillState({});
            setSelectedColor(null);
        } else {
            // Último mandala completado
            clearInterval(timerRef.current);
            setIsActive(false);
            // Pasar el score actualizado al finalizar
            setTimeout(() => handleFinishGame(true, scoreToUse), 500);
        }
    };

    // Nueva función que recibe el score actualizado


    const check = () => {
        if (!window.Swal) return;
        const sol = mData.solution;
        const map = mData.colors.reduce((acc, c) => ({ ...acc, [c.id]: c.hex }), {});

        const filled = Object.keys(fillState).length;
        const total = Object.keys(sol).length;

        // Verificar si está incompleto
        if (filled < total) {
            window.Swal.fire({
                title: 'Incompleto',
                text: 'Debes colorear todas las áreas antes de verificar',
                icon: 'warning',
                confirmButtonColor: '#0077b6'
            });
            return;
        }

        // Verificar si los colores son correctos
        let correct = true;
        for (let k in sol) {
            if (fillState[k] !== map[sol[k]]) {
                correct = false;
                break;
            }
        }

        if (!correct) {
            window.Swal.fire({
                title: 'Incorrecto',
                text: 'Algunos colores no coinciden. Revisa tu mandala e inténtalo de nuevo.',
                icon: 'error',
                confirmButtonColor: '#0077b6'
            });
            return;
        }

        // Si está correcto, suma puntos y avanza
        const newScore = score + 10;
        setScore(newScore);

        window.Swal.fire({
            title: '¡Correcto!',
            html: '<p style="font-size: 1.2rem; margin: 0;">+10 puntos</p>',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            // Pasar el newScore actualizado a la función next
            next(newScore);
        });
    };
    if (!libsReady) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando recursos del juego...</div>;

    // Helper para contraste de color
    const getContrastingTextColor = (hex) => {
        if (!hex) return '#000000';
        try {
            const r = parseInt(hex.substr(1, 2), 16);
            const g = parseInt(hex.substr(3, 2), 16);
            const b = parseInt(hex.substr(5, 2), 16);
            const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            return (yiq >= 128) ? '#000000' : '#FFFFFF';
        } catch (e) { return '#000000'; }
    };

    return (
        <div className="game-screen">
            <div className="game-title">
                {'Juego de Mandala'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${i * 0.07}s` }}>{c === ' ' ? '\u00A0' : c}</span>)}
            </div>
            <h3 style={{ textAlign: 'center', color: '#6b7280', marginTop: '-0.5rem', marginBottom: '1.5rem', fontWeight: '500' }}>(Vista Previa)</h3>

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
                <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '500' }}>Colorea las áreas correspondientes siguiendo el número indicado.</span>
            </div>

            <div className="game-layout">
                <div className="game-left-col" style={{ position: 'relative' }}>
                    {!isActive && (
                        <div style={{ position: 'absolute', zIndex: 10 }}>
                            <button className="btn-primary" onClick={() => setIsActive(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <Play size={20} /> Comenzar Juego
                            </button>
                        </div>
                    )}
                    <div style={{ opacity: isActive ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                        <FabricMandalaCanvas
                            componentName={mData.componentName}
                            fillState={fillState}
                            onFill={handleFill}
                            showNumbers={true}
                            solution={mData.solution}
                        />
                    </div>
                </div>
                <div className="game-right-col">
                    <div className="stats-block">
                        <h3>Progreso</h3>
                        <div className="stats-item"><span>Nivel:</span> <strong>{difficulty}</strong></div>
                        <div className="stats-item">
                            <span>Tiempo Límite:</span>
                            <strong>{formatTime(timeLeft)}</strong>
                        </div>
                        <div className="stats-item"><span>Puntaje:</span> <strong>{score}</strong></div>
                        <div className="stats-item"><span>Mandala:</span> <strong>{currentIdx + 1}/{mandalaIds.length}</strong></div>
                    </div>

                    <div className="palette-block">
                        <h3>Paleta</h3>
                        <div className="color-grid">
                            {mData.colors.map(c => (
                                <div key={c.id}
                                    className={`color-btn ${selectedColor?.id === c.id ? 'selected' : ''}`}
                                    style={{ backgroundColor: c.hex }}
                                    onClick={() => isActive && setSelectedColor(c)}>
                                    <span className="color-number" style={{ color: getContrastingTextColor(c.hex) }}>{c.id}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                        <button
                            onClick={check}
                            disabled={!isActive}
                            className="no-rounded-button"
                            style={{
                                //backgroundColor: isActive ? 'var(--correct-color)' : 'var(--medium-gray-color)',
                                color: 'white',
                                opacity: isActive ? 1 : 0.6,
                                cursor: isActive ? 'pointer' : 'not-allowed',
                                width: '100%',
                                padding: '0.75rem 1.5rem'
                            }}
                        >
                            <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
                            Verificar Mandala
                        </button>

                        <button
                            onClick={() => {
                                if (window.Swal) {
                                    window.Swal.fire({
                                        title: '¿Finalizar juego?',
                                        text: 'Se perderán los puntos acumulados',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#ef4444',
                                        cancelButtonColor: '#4b5563',
                                        confirmButtonText: 'Sí, finalizar',
                                        cancelButtonText: 'Cancelar'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            handleFinishGame(false, score);
                                        }
                                    });
                                }
                            }}
                            className="no-rounded-button"
                            style={{
                                //backgroundColor: '#ef4444', 
                                color: 'white',
                                width: '100%',
                                padding: '0.75rem 1.5rem'
                            }}
                        >
                            Finalizar Juego
                        </button>
                    </div>
                </div>
            </div>
            <div className="nav-footer">
                <button className="no-rounded-button" onClick={onBack} ><ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior</button>
                <button className="no-rounded-button" onClick={onFinishConfig}><Palette size={16} style={{ marginRight: '0.5rem' }} /> Terminar Configuración <ArrowRight style={{ marginLeft: '0.5rem' }} /></button>
            </div>
        </div>
    );
};
// --- ANDROID: GENERACIÓN DE APPLICATION ID ÚNICO ---
const MANDALA_APPLICATION_ID_BASE = "io.mandala.steam";

const createMandalaUuidSegment = () => {
    const rawUuid = window.crypto?.randomUUID?.()
        || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    return `uuid_${uuid}`;
};

const buildMandalaApplicationId = () => {
    return `${MANDALA_APPLICATION_ID_BASE}.${createMandalaUuidSegment()}`;
};

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
// --- SUMMARY SCREEN ---
const Summary = ({ config, mandalas, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Iniciando...");
    const [jsZipReady, setJsZipReady] = useState(false);

    const location = useLocation();
    const state = location.state;


    // Mock Data para que no falle si no hay estado previo
    const MOCK_DATA = {
        selectedAreas: ['Arte', 'Lógica'],
        selectedSkills: ['Creatividad', 'Concentración'],
        gameDetails: {
            gameName: "Mandala Game",
            description: "Colorea los mandalas siguiendo los números.",
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
    } = state || MOCK_DATA;

    const gameDetails = { ...rawGameDetails, date: getFixedCreationDate() };

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
            currentProgress += Math.floor(Math.random() * 10) + 5;
            if (currentProgress >= 90) {
                clearInterval(interval);
                setStatusText("Procesando recursos...");
                generateAndDownloadZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Generando código HTML...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Incrustando imágenes...");
                setProgress(currentProgress);
            }
        }, 150);
    };

    const generateAndDownloadZip = async () => {
        try {
            const zip = new window.JSZip();
            const difficultyKey = Object.keys(GAME_SETTINGS).find(key => GAME_SETTINGS[key].time === config.time) || 'Básico';

            // Usamos la nueva función generadora que usa Fabric.js
            const htmlContent = generateMandalaCode(difficultyKey, mandalas, gameDetails);

            const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'mandala')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            zip.file(htmlFileName, htmlContent);

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(gameDetails?.gameName || 'mandala')}_web.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setProgress(100); setStatusText("¡Descarga iniciada!");
            setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
        } catch (error) {
            console.error(error);
            setStatusText("Error al generar");
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
                setStatusText("Inyectando mandalas en Android...");
                generateAndDownloadAndroidZip();
            } else {
                if (currentProgress > 20 && currentProgress < 50) setStatusText("Descargando plantilla Android...");
                if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando mandalas...");
                setProgress(currentProgress);
            }
        }, 150);
    };

    const generateAndDownloadAndroidZip = async () => {
        if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

        try {
            setStatusText("Descargando plantilla Android...");
            const response = await fetch(`/templates/mandala_android.zip?v=${Date.now()}`);
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Procesando archivos ZIP...");
            const zipOriginal = await window.JSZip.loadAsync(arrayBuffer);

            // Detectar prefijo real de rutas dentro del ZIP
            const allPaths = [];
            zipOriginal.forEach((relativePath) => allPaths.push(relativePath));
            const hasAndroidPrefix = allPaths.some(p => p.startsWith('android/'));
            const prefix = hasAndroidPrefix ? 'android/' : '';

            setStatusText("Inyectando configuración...");

            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];

            // Nivel normalizado — Home.tsx usa normalizarNivelConfig: 'basico'/'intermedio'/'avanzado'
            const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
            // config no tiene .difficulty — hay que reconstruir el nivel desde config.time o config.theme
            const difficultyLabel = Object.keys(GAME_SETTINGS).find(k => GAME_SETTINGS[k].time === config.time) || 'Básico';
            const nivelKey = nivelMap[difficultyLabel] || 'basico';

            // mandalasDisponibles: Record<nivel, string[]> de IDs
            // Home.tsx los lee en data.mandalasDisponibles.basico/intermedio/avanzado
            const mandalasIds = mandalas.map(m => typeof m === 'string' ? m : m.id).filter(Boolean);
            const mandalasDisponibles = {
                [nivelKey]: mandalasIds
            };

            const appName = details.gameName || 'Mandala';
            const applicationId = buildMandalaApplicationId();

            const fullConfig = {
                nivel: nivelKey,
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                // YYYY-MM-DD para que formatearFechaLarga() de Home.tsx haga split("-")
                fecha: details.date
                    ? details.date.split('T')[0]
                    : new Date().toISOString().split('T')[0],
                descripcion: details.description || '',
                nombreApp: appName,
                plataformas: selectedPlats,
                mandalasDisponibles: mandalasDisponibles
            };

            // ── 1. Inyectar config JSON ──────────────────────────────────────
            zipOriginal.file(
                `${prefix}app/src/main/assets/public/config/mandala-config.json`,
                JSON.stringify(fullConfig, null, 2)
            );

            // ── 2. Parchear strings.xml ──────────────────────────────────────
            const stringsKey = allPaths.find(p => p.includes('res/values/strings.xml'));
            if (stringsKey) {
                let stringsContent = await zipOriginal.file(stringsKey).async("string");
                stringsContent = stringsContent.replace(
                    /<string name="app_name">.*?<\/string>/,
                    `<string name="app_name">${appName}</string>`
                );
                zipOriginal.file(stringsKey, stringsContent);
            }

            // ── 3. Parchear build.gradle ─────────────────────────────────────
            const buildGradleKey = allPaths.find(p =>
                p.endsWith('app/build.gradle') || p.endsWith('app\\build.gradle')
            );
            if (buildGradleKey) {
                let gradleContent = await zipOriginal.file(buildGradleKey).async("string");
                gradleContent = gradleContent.replace(
                    /applicationId\s+"[^"]+"/,
                    `applicationId "${applicationId}"`
                );
                zipOriginal.file(buildGradleKey, gradleContent);
            }

            // ── 4. Parchear capacitor.settings.gradle ────────────────────────
            const capSettingsKey = allPaths.find(p => p.includes('capacitor.settings.gradle'));
            if (capSettingsKey) {
                let capContent = await zipOriginal.file(capSettingsKey).async("string");
                capContent = capContent.replace(
                    /BUNDLE_ID\s*=\s*"[^"]+"/,
                    `BUNDLE_ID = "${applicationId}"`
                );
                zipOriginal.file(capSettingsKey, capContent);
            }

            // ── 5. Parchear capacitor.config.json ──────────────────────────────
            const capConfigKey = allPaths.find(p => p.includes('capacitor.config.json'));
            if (capConfigKey) {
                try {
                    const capConfigContent = await zipOriginal.file(capConfigKey).async("string");
                    const capConfig = JSON.parse(capConfigContent);
                    zipOriginal.file(capConfigKey, JSON.stringify({ ...capConfig, appId: applicationId }, null, 2));
                } catch { /* si no es JSON válido, omitir */ }
            }


            setStatusText("Generando paquete final...");
            const blob = await zipOriginal.generateAsync({ type: "blob", platform: "UNIX" });

            const platformsSuffix = (Array.isArray(selectedPlats) ? selectedPlats : ['movil'])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'mandala')}_${platformsSuffix}.zip`;
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
            const difficultyKey = Object.keys(GAME_SETTINGS).find(k => GAME_SETTINGS[k].time === config.time) || 'Básico';
            const htmlContent = generateMandalaCode(difficultyKey, mandalas, gameDetails);
            const webZip = new window.JSZip();

            const htmlFileNameCombined = `${normalizeFileName(gameDetails?.gameName || 'mandala')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
            webZip.file(htmlFileNameCombined, htmlContent);
            const webBlob = await webZip.generateAsync({ type: "blob" });
            outerZip.file(`${normalizeFileName(gameDetails?.gameName || 'mandala')}_web.zip`, webBlob);

            // ── Generar ZIP Android ──
            setStatusText("Descargando plantilla Android...");
            const response = await fetch(`/templates/mandala_android.zip?v=${Date.now()}`);
            if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
            const arrayBuffer = await response.arrayBuffer();

            setStatusText("Inyectando configuración Android...");
            const zipOriginal = await window.JSZip.loadAsync(arrayBuffer);

            const allPaths = [];
            zipOriginal.forEach((relativePath) => allPaths.push(relativePath));
            const hasAndroidPrefix = allPaths.some(p => p.startsWith('android/'));
            const prefix = hasAndroidPrefix ? 'android/' : '';

            const details = gameDetails;
            const selectedPlats = Array.isArray(selectedPlatforms) ? selectedPlatforms : ['android'];
            const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
            const difficultyLabel = Object.keys(GAME_SETTINGS).find(k => GAME_SETTINGS[k].time === config.time) || 'Básico';
            const nivelKey = nivelMap[difficultyLabel] || 'basico';
            const mandalasIds = mandalas.map(m => typeof m === 'string' ? m : m.id).filter(Boolean);
            const mandalasDisponibles = { [nivelKey]: mandalasIds };
            const appName = details.gameName || 'Mandala';
            const applicationId = buildMandalaApplicationId();


            const fullConfig = {
                nivel: nivelKey,
                autor: details.authorName || details.author || '',
                version: details.version || '1.0.0',
                fecha: details.date ? details.date.split('T')[0] : new Date().toISOString().split('T')[0],
                descripcion: details.description || '',
                nombreApp: appName,
                plataformas: selectedPlats,
                mandalasDisponibles: mandalasDisponibles
            };

            zipOriginal.file(
                `${prefix}app/src/main/assets/public/config/mandala-config.json`,
                JSON.stringify(fullConfig, null, 2)
            );

            const stringsKey = allPaths.find(p => p.includes('res/values/strings.xml'));
            if (stringsKey) {
                let stringsContent = await zipOriginal.file(stringsKey).async("string");
                stringsContent = stringsContent.replace(
                    /<string name="app_name">.*?<\/string>/,
                    `<string name="app_name">${appName}</string>`
                );
                zipOriginal.file(stringsKey, stringsContent);
            }

            const buildGradleKey = allPaths.find(p => p.endsWith('app/build.gradle') || p.endsWith('app\\build.gradle'));
            if (buildGradleKey) {
                let gradleContent = await zipOriginal.file(buildGradleKey).async("string");
                gradleContent = gradleContent.replace(/applicationId\s+"[^"]+"/, `applicationId "${applicationId}"`);
                zipOriginal.file(buildGradleKey, gradleContent);
            }

            const capSettingsKey = allPaths.find(p => p.includes('capacitor.settings.gradle'));
            if (capSettingsKey) {
                let capContent = await zipOriginal.file(capSettingsKey).async("string");
                capContent = capContent.replace(/BUNDLE_ID\s*=\s*"[^"]+"/, `BUNDLE_ID = "${applicationId}"`);
                zipOriginal.file(capSettingsKey, capContent);
            }

            const capConfigKeyComb = allPaths.find(p => p.includes('capacitor.config.json'));
            if (capConfigKeyComb) {
                try {
                    const capConfigContent = await zipOriginal.file(capConfigKeyComb).async("string");
                    const capConfig = JSON.parse(capConfigContent);
                    zipOriginal.file(capConfigKeyComb, JSON.stringify({ ...capConfig, appId: applicationId }, null, 2));
                } catch { /* si no es JSON válido, omitir */ }
            }


            const androidBlob = await zipOriginal.generateAsync({ type: "blob", platform: "UNIX" });
            const mobilePlatforms = (selectedPlatforms ?? [])
                .filter(p => p.toLowerCase() !== 'web')
                .map(p => platformLabel(p))
                .join('_') || 'movil';
            outerZip.file(`${normalizeFileName(details?.gameName || 'mandala')}_${mobilePlatforms}.zip`, androidBlob);

            // ── ZIP contenedor final ──
            setStatusText("Empaquetando todo...");
            const finalBlob = await outerZip.generateAsync({ type: "blob" });
            const platformsLabel = (selectedPlatforms ?? [])
                .map(p => platformLabel(p))
                .join('_');
            const url = window.URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${normalizeFileName(details?.gameName || 'mandala')}_${platformsLabel}.zip`;

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

    // Helpers
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
                        <div className="info-card-value">{gameDetails.gameName || 'Memorama'}</div>
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
                        <div className="info-card-value">{gameDetails.description || 'Sin descripción'}</div>
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
                                : 'Web'}
                        </div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2.5rem 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
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
                                        <img src={getAreaIcon(areaId)} alt="" style={{ width: '20px', height: '20px', borderRadius: '4px' }} onError={(e) => { e.target.src = 'https://placehold.co/20x20/eee/aaa?text=?'; }} />
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
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#0077b6' }}>Parámetros del Juego</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', rowGap: '1rem', alignItems: 'center' }}>
                    <div className="summary-row"><span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Type size={18} /> Dificultad:</span><strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{Object.keys(GAME_SETTINGS).find(k => GAME_SETTINGS[k].time === config.time)}</strong></div>
                    <div className="summary-row"><span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Type size={18} /> Temática:</span><strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.theme}</strong></div>
                    <div className="summary-row"><span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Tiempo Límite:</span><strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{Math.floor(config.time / 60)} minutos</strong></div>
                    <div className="summary-row"><span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><List size={18} /> Mandalas:</span><strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{config.maxMandalas}</strong></div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#334155' }}>Mandalas Seleccionados:</strong>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {mandalas.map((id) => (
                            <div key={id} style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.8rem', background: '#f8fafc' }}>
                                {MANDALA_DATA[id].name}
                            </div>
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
                        <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: '500' }}>
                                <span>{statusText}</span><span>{progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', marginTop: '0.5rem' }}>
                                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#0077b6', transition: 'width 0.3s ease-out', borderRadius: '7px' }}></div>
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
                        boxShadow: '0 4px 14px 0 rgba(0, 95, 146, 0.35)',
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
// --- MANDALA PREVIEW ITEM COMPONENT ---
const MandalaPreviewItem = React.memo(({ id, m, isSelected, onClick }) => {
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        // Carga diferida para mejor rendimiento
        const timer = setTimeout(() => setShowPreview(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`mandala-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
            <div className="mandala-tema"><b>Temática:</b> {m.theme}</div>
            <div className="mandala-preview">
                {showPreview ? (
                    <div style={{ transform: 'scale(0.25)', width: 500, height: 500, transformOrigin: 'center' }}>
                        <FabricMandalaCanvas componentName={m.componentName} fillState={{}} showNumbers={false} />
                    </div>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                        Cargando...
                    </div>
                )}
            </div>
            <div className="mandala-name">{m.name}</div>
            {isSelected && <div className="selection-badge"><Check size={16} /></div>}
        </div>
    );
});


// --- MAIN COMPONENT ---
export default function GeneradorMandala() {
    const [view, setView] = useState('home');
    const [level, setLevel] = useState('Básico');
    const [selected, setSelected] = useState([]);
    const settings = GAME_SETTINGS[level];
    const navigate = useNavigate();
    const location = useLocation();

    const toggle = (id) => {
        if (selected.includes(id)) setSelected(s => s.filter(x => x !== id));
        else if (selected.length < settings.maxMandalas) setSelected(s => [...s, id]);
    };
    const goToPreview = () => {
        if (selected.length === 0) {
            Swal.fire('Atención', 'Selecciona al menos un mandala', 'warning');
            return;
        }
        setView('preview');
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


    // Cargar scripts al montar el componente principal para que estén listos en el preview
    useEffect(() => {
        const load = async () => {
            if (!window.fabric) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js', 'fabric-script-main');
            if (!window.Swal) await loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11', 'swal-script-main');
            // Aseguramos que los helpers estén definidos globalmente
            defineGlobalHelpers();
        };
        load();
    }, []);

    const renderConfigScreen = () => (
        <div className="config-screen">
            <div className="game-title">
                {'Juego de Mandala'.split('').map((c, i) => (
                    <span key={i} style={{ animationDelay: `${i * 0.07}s` }}>
                        {c === ' ' ? '\u00A0' : c}
                    </span>
                ))}
            </div>

            <div className="rules-text">
                <h2>Selecciona los Mandalas para tu juego</h2>
                <p>Configura el nivel de dificultad y elige los mandalas que se incluirán en el juego.</p>
            </div>

            <div className="config-controls">
                <div className="control-group">
                    <label htmlFor="level-select">
                        <Trophy size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                        Selecciona el nivel de dificultad                </label>
                    <select
                        id="level-select"
                        value={level}
                        onChange={(e) => { setLevel(e.target.value); setSelected([]); }}
                    >
                        {Object.keys(GAME_SETTINGS).map(k => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Timer size={18} color="#0077b6" />
                            <span style={{ color: '#334155', fontWeight: '500' }}>Tiempo Límite:</span>
                            <strong style={{ color: '#0077b6' }}>{Math.floor(settings.time / 60)} minutos</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layers size={18} color="#0077b6" />
                            <span style={{ color: '#334155', fontWeight: '500' }}>Temática:</span>
                            <strong style={{ color: '#0077b6' }}>{settings.theme}</strong>
                        </div>
                    </div>
                    <div className="counter-badge">
                        <Grid size={16} /> {selected.length} / {settings.maxMandalas}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <h3 style={{ color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Palette size={20} /> Mandalas Disponibles
                </h3>
                <div className="mandala-selection-grid">
                    {settings.mandalasAvailable.map(id => {
                        const m = MANDALA_DATA[id];
                        return (
                            <MandalaPreviewItem
                                key={id}
                                id={id}
                                m={m}
                                isSelected={selected.includes(id)}
                                onClick={() => toggle(id)}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="config-footer">
                <button className="no-rounded-button" onClick={() => navigate(-1)}>
                    <ArrowLeft style={{ marginRight: '0.5rem' }} /> Anterior
                </button>
                <button
                    onClick={goToPreview}
                    disabled={selected.length < settings.maxMandalas}
                    className="no-rounded-button"
                >
                    Siguiente <ArrowRight style={{ marginLeft: '0.5rem' }} />
                </button>
            </div>
        </div>
    );
    return (
        <>
            <Style />
            <div className="acertijo-container">
                {view === 'summary' ? (
                    <Summary config={settings} mandalas={selected} onBack={() => setView('home')} />
                ) : view === 'preview' ? (
                    <PreviewScreen
                        difficulty={level}
                        mandalaIds={selected}
                        onFinishConfig={goToSummary}
                        onBack={() => setView('home')}
                    />
                ) : (
                    renderConfigScreen()
                )}
            </div>
        </>
    );
}