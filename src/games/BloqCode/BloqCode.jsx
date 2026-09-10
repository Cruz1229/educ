// REEMPLAZA la línea de imports existente por:
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Tag, Layers, FileText, Calendar, Monitor, Shapes, Puzzle, Download, Clock, List, Type } from 'lucide-react';
const STORAGE_NS = "ar:blockly";
const LS = {
  arStages: `${STORAGE_NS}:selectedStages`,
  arConfig: `${STORAGE_NS}:config`,
};

const AR_STAGES = ["Acierto"];

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { }
};

const useThreeLoaders = () => {
  const threeLoadRef = useRef(null);
  const threeAddonsRef = useRef(null);

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Error cargando: ${src}`));
      document.body.appendChild(s);
    });

  const ensureThree = useCallback(() => {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threeLoadRef.current) return threeLoadRef.current;

    threeLoadRef.current = loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
    )
      .then(() => {
        if (window.THREE) return window.THREE;
        return loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js"
        ).then(() => window.THREE);
      })
      .catch(() =>
        loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js"
        ).then(() => window.THREE)
      );

    return threeLoadRef.current;
  }, []);

  const ensureThreeTextAddons = useCallback(() => {
    if (threeAddonsRef.current) return threeAddonsRef.current;

    threeAddonsRef.current = ensureThree().then((THREE) =>
      loadScript(
        "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/FontLoader.js"
      )
        .then(() =>
          loadScript(
            "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/geometries/TextGeometry.js"
          )
        )
        .then(() => {
          const T = window.THREE;
          const FontLoader = T?.FontLoader;
          const TextGeometry = T?.TextGeometry;
          if (!FontLoader || !TextGeometry) {
            console.warn("FontLoader/TextGeometry no disponibles, usando fallback canvas.");
            return { THREE, FontLoader: null, TextGeometry: null };
          }
          return { THREE, FontLoader, TextGeometry };
        })
    );

    return threeAddonsRef.current;
  }, [ensureThree]);

  return { ensureThree, ensureThreeTextAddons };
};

const BLOCKLY_SYMBOLS = ["{ }", "< >", "( )", "[ ]", "=>", "++", "&&", "||"];

function createFloatingSymbols(container) {
  if (!container) return () => { };

  const uid = `blockly_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const nodes = [];
  const styles = [];

  BLOCKLY_SYMBOLS.forEach((symbol, index) => {
    const el = document.createElement("div");
    el.textContent = symbol;

    const size = Math.random() * 26 + 18;
    const duration = Math.random() * 5 + 5;
    const left = Math.random() * 80 + 10;
    const top = Math.random() * 80 + 10;
    const dx = Math.random() * 30 - 15;
    const dy = Math.random() * 30 - 15;
    const rot = Math.random() * 30 - 15;

    const animName = `blocklyFloat_${uid}_${index}`;

    el.style.cssText = `
      position: absolute;
      color: rgba(255,255,255,0.22);
      font-size: ${size}px;
      font-family: monospace;
      animation: ${animName} ${duration}s ease-in-out infinite;
      left: ${left}%;
      top: ${top}%;
      user-select: none;
      pointer-events: none;
    `;

    const kf = document.createElement("style");
    kf.textContent = `
      @keyframes ${animName} {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(${dx}px, ${dy}px) rotate(${rot}deg); }
      }
    `;

    document.head.appendChild(kf);
    container.appendChild(el);

    styles.push(kf);
    nodes.push(el);
  });

  return () => {
    nodes.forEach((n) => n.remove());
    styles.forEach((s) => s.remove());
  };
}

async function startCamera(videoElementId) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    const videoElement = document.getElementById(videoElementId);
    if (videoElement) {
      videoElement.srcObject = stream;
      videoElement.play();
    }
    return stream;
  } catch (error) {
    console.error('Error al acceder a la cámara:', error);
    return null;
  }
}

function stopCamera(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

// ── Three.js: loaders globales (igual que CalculadoraMental) ──────────────
const _loadScript = (src) => new Promise((res, rej) => {
  if (document.querySelector('script[src="' + src + '"]')) { res(); return; }
  const s = document.createElement('script');
  s.src = src; s.async = true;
  s.onload = res;
  s.onerror = () => rej(new Error('Error cargando: ' + src));
  document.body.appendChild(s);
});

let _threePromise = null;
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (_threePromise) return _threePromise;
  _threePromise = _loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
    .then(() => {
      if (window.THREE) return window.THREE;
      return _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
        .then(() => window.THREE);
    })
    .catch(() =>
      _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
        .then(() => window.THREE)
    );
  return _threePromise;
}

let _threeAddonsPromise = null;
function loadThreeAddons() {
  if (_threeAddonsPromise) return _threeAddonsPromise;
  _threeAddonsPromise = loadThree().then(() =>
    _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/FontLoader.js')
      .then(() => _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/geometries/TextGeometry.js'))
      .then(() => {
        const FontLoader = window.THREE?.FontLoader ?? null;
        const TextGeometry = window.THREE?.TextGeometry ?? null;
        return { THREE: window.THREE, FontLoader, TextGeometry };
      })
  );
  return _threeAddonsPromise;
}

// ── Renderizador RA principal (igual que CalculadoraMental.initThreeForType) ──
function initThreeForType(container, type, content) {
  let disposed = false, renderer, scene, camera, frameId, videoEl;
  let portalGroup, portalFrameGroup, portalGlow, portalParticles, portalParticleMeta;
  const enableRootSpin = type !== 'Video';
  const planeBaseSize = type === 'Video' ? 3.6 : 1.8;

  const cleanup = () => {
    disposed = true;
    if (frameId) cancelAnimationFrame(frameId);
    if (videoEl) { videoEl.pause(); videoEl.src = ''; videoEl.load(); }
    if (scene) scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) [].concat(obj.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    });
    if (renderer) { renderer.dispose(); renderer.domElement?.parentNode?.removeChild(renderer.domElement); }
  };

  loadThree().then(THREE => {
    if (disposed || !container) return;
    const w = container.clientWidth || 360, h = container.clientHeight || 240;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.z = type === 'Video' ? 3.2 : 2.5;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const createGlowTexture = () => {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
      g.addColorStop(0, 'rgba(0,255,255,0.45)');
      g.addColorStop(0.45, 'rgba(0,200,255,0.2)');
      g.addColorStop(1, 'rgba(0,140,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    const portalFrameMat = new THREE.MeshStandardMaterial({
      color: 0x83f3ff, emissive: 0x40e0ff, emissiveIntensity: 0.85,
      roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.95
    });

    const buildPortalFrame = (fw, fh) => {
      if (!portalFrameGroup) return;
      portalFrameGroup.children.forEach(c => c.geometry?.dispose());
      portalFrameGroup.clear();
      const t = 0.09, d = 0.18, hw = fw / 2, hh = fh / 2;
      [[fw + t * 2, t, d, 0, hh + t / 2, 0], [fw + t * 2, t, d, 0, -hh - t / 2, 0],
      [t, fh, d, -hw - t / 2, 0, 0], [t, fh, d, hw + t / 2, 0, 0]].forEach(([bw, bh, bd, x, y, z]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), portalFrameMat);
        m.position.set(x, y, z);
        portalFrameGroup.add(m);
      });
    };

    // ── ANIMATE ──
    const animate = () => {
      if (disposed) return;
      frameId = requestAnimationFrame(animate);
      if (enableRootSpin) root.rotation.y += 0.008;
      if (portalGroup) {
        const now = performance.now();
        portalGroup.position.y = Math.sin(now * 0.0011) * 0.06;
        portalGroup.position.x = Math.cos(now * 0.0009) * 0.02;
        portalGroup.rotation.z = Math.sin(now * 0.0006) * 0.04;
        portalGroup.rotation.y = Math.cos(now * 0.0005) * 0.04;
      }
      if (portalParticles) {
        portalParticles.rotation.z += 0.002;
        portalParticles.rotation.y += 0.001;
      }
      renderer.render(scene, camera);
    };

    // ── TEXTO ──
    if (type === 'Texto' || type === 'Texto3D') {
      scene.add(new THREE.AmbientLight(0xffffff, 1.2));
      const dir = new THREE.DirectionalLight(0xffffff, 1.5);
      dir.position.set(2, 3, 4);
      scene.add(dir);

      loadThreeAddons().then(({ FontLoader, TextGeometry }) => {
        if (disposed) return;
        if (!FontLoader || !TextGeometry) {
          // Fallback canvas 2D
          const c2 = document.createElement('canvas');
          c2.width = 512; c2.height = 256;
          const ctx = c2.getContext('2d');
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillRect(0, 0, 512, 256);
          ctx.fillStyle = '#0b2a4a';
          ctx.font = '48px Arial';
          ctx.fillText(String(content || '').substring(0, 20), 20, 80);
          const t = new THREE.CanvasTexture(c2);
          t.colorSpace = THREE.SRGBColorSpace;
          const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(1.8, 0.9),
            new THREE.MeshBasicMaterial({ map: t, transparent: true })
          );
          root.add(plane);
          animate();
          return;
        }
        const loader = new FontLoader();
        const buildMeshes = font => {
          const tg = new THREE.Group();
          root.add(tg);
          const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff, roughness: 0.1, metalness: 0,
            emissive: 0xffffff, emissiveIntensity: 0.2
          });
          const lines = String(content || '').split(/\r?\n/);
          const widths = [];
          lines.forEach((line, i) => {
            const geo = new TextGeometry(line || ' ', {
              font, size: 0.3, height: 0.08, curveSegments: 12,
              bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 3
            });
            geo.computeBoundingBox();
            const gw = (geo.boundingBox.max.x - geo.boundingBox.min.x) || 1;
            widths.push(gw);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.x = -gw / 2;
            mesh.position.y = ((lines.length - 1) / 2 - i) * (0.3 * 1.35);
            tg.add(mesh);
          });
          tg.scale.setScalar(Math.min(1, 1.4 / Math.max(...widths, 1)));
          animate();
        };
        loader.load(
          'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
          buildMeshes,
          undefined,
          () => loader.load(
            'https://cdn.jsdelivr.net/npm/three@0.134.0/examples/fonts/helvetiker_regular.typeface.json',
            buildMeshes,
            undefined,
            () => {
              if (!disposed) {
                const c2 = document.createElement('canvas');
                c2.width = 512; c2.height = 256;
                const ctx = c2.getContext('2d');
                ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(0, 0, 512, 256);
                ctx.fillStyle = '#0b2a4a'; ctx.font = '48px Arial';
                ctx.fillText(String(content || '').substring(0, 20), 20, 80);
                const t = new THREE.CanvasTexture(c2); t.colorSpace = THREE.SRGBColorSpace;
                root.add(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), new THREE.MeshBasicMaterial({ map: t, transparent: true })));
                animate();
              }
            }
          )
        );
      }).catch(() => { });
    }

    // ── IMAGEN ──
    else if (type === 'Imagen') {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      loader.load(content, tex => {
        if (disposed) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        const asp = tex.image.width / tex.image.height;
        const pw = asp >= 1 ? 1.8 : 1.8 * asp;
        const ph = asp >= 1 ? 1.8 / asp : 1.8;
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(pw, ph),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );
        root.add(plane);
        const bt = tex.clone();
        bt.colorSpace = THREE.SRGBColorSpace;
        bt.wrapS = THREE.RepeatWrapping;
        bt.repeat.x = -1; bt.offset.x = 1; bt.needsUpdate = true;
        const back = new THREE.Mesh(
          new THREE.PlaneGeometry(pw, ph),
          new THREE.MeshBasicMaterial({ map: bt, transparent: true })
        );
        back.rotation.y = Math.PI;
        root.add(back);
        animate();
      }, undefined, () => {
        if (!disposed) {
          const img = document.createElement('img');
          img.src = content; img.className = 'ar-fallback-img';
          container.innerHTML = ''; container.appendChild(img);
        }
      });
    }

    // ── VIDEO ──
    else if (type === 'Video') {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
      );
      const fitAsp = asp => {
        const pw = asp >= 1 ? planeBaseSize : planeBaseSize * asp;
        const ph = asp >= 1 ? planeBaseSize / asp : planeBaseSize;
        plane.scale.set(pw, ph, 1);
        if (portalGlow) portalGlow.scale.set(pw * 1.3, ph * 1.3, 1);
        buildPortalFrame(pw, ph);
      };
      videoEl = document.createElement('video');
      videoEl.src = content; videoEl.crossOrigin = 'anonymous';
      videoEl.loop = true; videoEl.muted = true;
      videoEl.playsInline = true; videoEl.preload = 'auto';
      const vtex = new THREE.VideoTexture(videoEl);
      vtex.colorSpace = THREE.SRGBColorSpace;
      plane.material = new THREE.MeshBasicMaterial({ map: vtex, transparent: true, opacity: 0.96 });
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const rim = new THREE.PointLight(0x7ffcff, 1.1);
      rim.position.set(2.5, 2.2, 3.5); scene.add(rim);
      portalGroup = new THREE.Group();
      plane.position.z = -0.06; portalGroup.add(plane);
      const gt = createGlowTexture();
      if (gt) {
        const gm = new THREE.MeshBasicMaterial({ map: gt, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
        portalGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), gm);
        portalGlow.position.z = -0.14; portalGroup.add(portalGlow);
      }
      portalFrameGroup = new THREE.Group(); portalGroup.add(portalFrameGroup);
      const pc = 160; const pos = new Float32Array(pc * 3); portalParticleMeta = [];
      for (let i = 0; i < pc; i++) {
        const a = Math.random() * Math.PI * 2, r = 0.85 + Math.random() * 0.35, dp = (Math.random() - 0.5);
        portalParticleMeta.push({ angle: a, radius: r, depth: dp });
        pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.sin(a) * r; pos[i * 3 + 2] = dp * 0.4;
      }
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pm = new THREE.PointsMaterial({ color: 0x7df9ff, size: 0.05, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
      portalParticles = new THREE.Points(pg, pm);
      portalGroup.add(portalParticles); root.add(portalGroup);
      fitAsp(16 / 9);
      videoEl.addEventListener('loadedmetadata', () => {
        if (videoEl.videoWidth && videoEl.videoHeight) fitAsp(videoEl.videoWidth / videoEl.videoHeight);
      });
      videoEl.play().catch(() => { });
      container.addEventListener('click', () => {
        if (videoEl.paused) { videoEl.muted = false; videoEl.play().catch(() => { }); }
        else videoEl.pause();
      });
      animate();
    }

    // ── AUDIO ──
    else if (type === 'Audio') {
      const noteMat = new THREE.MeshStandardMaterial({
        color: 0x83f3ff, emissive: 0x40e0ff, emissiveIntensity: 0.5,
        roughness: 0.2, metalness: 0.1
      });
      const noteGroup = new THREE.Group();
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), noteMat);
      head.position.set(-0.15, -0.1, 0); noteGroup.add(head);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12), noteMat);
      stem.position.set(0.1, 0.35, 0); noteGroup.add(stem);
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.08), noteMat);
      flag.position.set(0.35, 0.68, 0); flag.rotation.z = -0.35; noteGroup.add(flag);
      noteGroup.scale.set(2, 2, 2); scene.add(noteGroup);
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));

      const listener = new THREE.AudioListener();
      camera.add(listener);
      const audioInst = new THREE.Audio(listener);
      const audioLoader = new THREE.AudioLoader();
      audioLoader.setCrossOrigin('anonymous');
      let audioAnalyser = null;
      let notePulse = 0;

      audioLoader.load(content,
        buffer => {
          if (disposed) return;
          audioInst.setBuffer(buffer);
          audioInst.setLoop(true);
          audioInst.setVolume(0.6);
          audioAnalyser = new THREE.AudioAnalyser(audioInst, 128);
          audioInst.play().catch(() => { });
        },
        undefined,
        () => { if (!disposed) container.textContent = 'No se pudo cargar el audio.'; }
      );

      container.addEventListener('click', () => {
        if (!audioInst.buffer) return;
        if (audioInst.isPlaying) audioInst.pause();
        else audioInst.play().catch(() => { });
      });

      const animateAudio = () => {
        if (disposed) return;
        frameId = requestAnimationFrame(animateAudio);
        if (audioAnalyser) {
          const raw = audioAnalyser.getAverageFrequency() / 255;
          notePulse += (raw - notePulse) * 0.15;
          const scale = 1 + notePulse * 0.5;
          noteGroup.scale.setScalar(scale * 2);
          noteGroup.position.y = notePulse * 0.35;
        }
        renderer.render(scene, camera);
      };
      animateAudio();
    }

    // ResizeObserver
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        if (!renderer || !camera || disposed) return;
        const nw = container.clientWidth || 360, nh = container.clientHeight || 240;
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      }).observe(container);
    }
  }).catch(() => { });

  return cleanup;
}
function buildDecoratedHtml({ bgId, topHtml = "", innerHtml = "", useCamera = false, videoId = "" }) {
  return `
    <div class="blockly-ar-bg ${useCamera ? 'blockly-ar-bg-camera' : ''}">
      ${useCamera ? `<video id="${videoId}" class="blockly-ar-camera-bg" autoplay playsinline muted></video>` : ''}
      <div id="${bgId}" class="blockly-ar-bg-elements"></div>
      <div class="blockly-ar-content">${topHtml}${innerHtml}</div>
    </div>
  `;
}

function initThreeStageFactory({ ensureThree, ensureThreeTextAddons }) {
  return function initThreeStage(container, stageCfg) {
    if (!container) return () => { };

    let disposed = false;
    let rafId = 0;
    let renderer;
    let scene;
    let camera;
    let videoEl;
    let audioInstance = null;
    let resizeObserver = null;
    let toggleClickHandler = null;
    let videoMetadataHandler = null;
    let portalGroup = null;
    let portalGlow = null;
    let portalFrameGroup = null;
    let portalParticles = null;
    let portalParticleMeta = null;

    const cleanup = () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);

      try {
        if (videoEl) {
          if (videoMetadataHandler) {
            videoEl.removeEventListener("loadedmetadata", videoMetadataHandler);
          }
          videoEl.pause();
          videoEl.src = "";
          videoEl.load();
        }
      } catch { }

      try {
        if (audioInstance) {
          if (audioInstance.isPlaying) audioInstance.stop();
          audioInstance.disconnect();
        }
      } catch { }

      try {
        if (toggleClickHandler && container) {
          container.removeEventListener("click", toggleClickHandler);
        }
      } catch { }

      try {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      } catch { }

      try {
        if (renderer) {
          renderer.dispose?.();
          renderer.domElement?.remove();
        }
      } catch { }

      try {
        if (scene) {
          scene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose?.();
            if (obj.material) {
              if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
              else obj.material.dispose?.();
            }
          });
        }
      } catch { }
    };

    (async () => {
      const THREE = await ensureThree();

      const w = Math.max(260, container.clientWidth);
      const h = Math.max(220, container.clientHeight);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
      camera.position.set(0, 0, 6);

      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(3, 5, 4);
      scene.add(dir);

      const createGlowTexture = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        canvas.width = 256;
        canvas.height = 256;
        const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
        grad.addColorStop(0, "rgba(99, 102, 241, 0.45)");
        grad.addColorStop(0.45, "rgba(129, 140, 248, 0.2)");
        grad.addColorStop(1, "rgba(165, 180, 252, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      };

      const portalFrameMaterial = new THREE.MeshStandardMaterial({
        color: 0xa5b4fc,
        emissive: 0x6366f1,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.2,
        transparent: true,
        opacity: 0.95,
      });

      const updatePortalFrame = (frameWidth, frameHeight) => {
        if (!portalFrameGroup) return;

        portalFrameGroup.children.forEach((child) => {
          if (child.geometry) child.geometry.dispose();
        });
        portalFrameGroup.clear();

        const thickness = 0.09;
        const depth = 0.18;
        const halfW = frameWidth / 2;
        const halfH = frameHeight / 2;

        const top = new THREE.Mesh(
          new THREE.BoxGeometry(frameWidth + thickness * 2, thickness, depth),
          portalFrameMaterial
        );
        top.position.set(0, halfH + thickness / 2, 0);
        portalFrameGroup.add(top);

        const bottom = new THREE.Mesh(
          new THREE.BoxGeometry(frameWidth + thickness * 2, thickness, depth),
          portalFrameMaterial
        );
        bottom.position.set(0, -halfH - thickness / 2, 0);
        portalFrameGroup.add(bottom);

        const left = new THREE.Mesh(
          new THREE.BoxGeometry(thickness, frameHeight, depth),
          portalFrameMaterial
        );
        left.position.set(-halfW - thickness / 2, 0, 0);
        portalFrameGroup.add(left);

        const right = new THREE.Mesh(
          new THREE.BoxGeometry(thickness, frameHeight, depth),
          portalFrameMaterial
        );
        right.position.set(halfW + thickness / 2, 0, 0);
        portalFrameGroup.add(right);

        if (portalParticles && portalParticleMeta) {
          const posAttr = portalParticles.geometry.getAttribute("position");
          const positions = posAttr.array;
          const baseRadius = Math.hypot(halfW, halfH) * 1.08;
          const depthScale = Math.min(0.5, baseRadius * 0.2);
          for (let i = 0; i < portalParticleMeta.length; i += 1) {
            const meta = portalParticleMeta[i];
            const radius = baseRadius * meta.radius;
            positions[i * 3] = Math.cos(meta.angle) * radius;
            positions[i * 3 + 1] = Math.sin(meta.angle) * radius;
            positions[i * 3 + 2] = meta.depth * depthScale;
          }
          posAttr.needsUpdate = true;
          if (portalParticles.material) {
            portalParticles.material.size = Math.max(0.04, baseRadius * 0.03);
          }
        }
      };

      if (stageCfg.type === "Texto") {
        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 1.5);
        dir.position.set(2, 3, 4);
        scene.add(dir);

        const { FontLoader, TextGeometry } = await ensureThreeTextAddons();

        if (!FontLoader || !TextGeometry) {
          // Fallback canvas 2D si FontLoader no está disponible
          const canvas = document.createElement("canvas");
          canvas.width = 512; canvas.height = 128;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#0077b6";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 48px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText((stageCfg.text || "Blockly").slice(0, 20), 256, 64);
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 1.5),
            new THREE.MeshBasicMaterial({ map: texture, transparent: true })
          );
          scene.add(plane);
          const animate = () => {
            if (disposed) return;
            plane.rotation.y = Math.sin(Date.now() * 0.001) * 0.15;
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(animate);
          };
          animate();
          return;
        }

        const loader = new FontLoader();
        const font = await new Promise((resolve, reject) => {
          loader.load(
            "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
            resolve,
            undefined,
            reject
          );
        });

        const text = (stageCfg.text || "").trim().slice(0, 20) || "Blockly";
        const geo = new TextGeometry(text, {
          font,
          size: 0.7,
          height: 0.18,
          curveSegments: 10,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelSegments: 4,
        });
        geo.computeBoundingBox();
        geo.center();

        const mat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.1,
          metalness: 0.0,
          emissive: 0xffffff,
          emissiveIntensity: 0.2,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        const animate = () => {
          if (disposed) return;
          mesh.rotation.y += 0.01;
          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };
        animate();
      }

      if (stageCfg.type === "Imagen") {
        const root = new THREE.Group();
        scene.add(root);

        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
        );
        root.add(plane);

        const planeBack = new THREE.Mesh(
          plane.geometry.clone(),
          plane.material.clone()
        );
        planeBack.rotation.y = Math.PI;
        planeBack.visible = false;
        root.add(planeBack);

        const fitPlaneToAspect = (aspect, baseSize = 4.8) => {
          if (!aspect) return;
          if (aspect >= 1) {
            const width = baseSize;
            const height = baseSize / aspect;
            plane.scale.set(width, height, 1);
            planeBack.scale.set(width, height, 1);
          } else {
            const width = baseSize * aspect;
            const height = baseSize;
            plane.scale.set(width, height, 1);
            planeBack.scale.set(width, height, 1);
          }
        };

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        loader.load(
          stageCfg.imageUrl || "",
          (texture) => {
            if (disposed) return;
            texture.colorSpace = THREE.SRGBColorSpace;
            plane.material.map = texture;
            plane.material.needsUpdate = true;

            const backTexture = texture.clone();
            backTexture.colorSpace = THREE.SRGBColorSpace;
            backTexture.wrapS = THREE.RepeatWrapping;
            backTexture.repeat.x = -1;
            backTexture.offset.x = 1;
            backTexture.needsUpdate = true;
            planeBack.material.map = backTexture;
            planeBack.material.needsUpdate = true;
            planeBack.visible = true;

            fitPlaneToAspect(texture.image.width / texture.image.height);
          },
          undefined,
          () => {
            if (!disposed && container) {
              container.textContent = "No se pudo cargar la imagen.";
            }
          }
        );

        const animate = () => {
          if (disposed) return;
          root.rotation.y += 0.01;
          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };
        animate();
      }

      if (stageCfg.type === "Video") {
        videoEl = document.createElement("video");
        videoEl.src = stageCfg.videoUrl || "";
        videoEl.crossOrigin = "anonymous";
        videoEl.loop = true;
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.preload = "auto";

        const videoTexture = new THREE.VideoTexture(videoEl);
        videoTexture.colorSpace = THREE.SRGBColorSpace;

        portalGroup = new THREE.Group();
        scene.add(portalGroup);

        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            opacity: 0.96,
          })
        );
        plane.position.z = -0.06;
        portalGroup.add(plane);

        const glowTexture = createGlowTexture();
        if (glowTexture) {
          const glowMaterial = new THREE.MeshBasicMaterial({
            map: glowTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          portalGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMaterial);
          portalGlow.position.z = -0.14;
          portalGroup.add(portalGlow);
        }

        portalFrameGroup = new THREE.Group();
        portalGroup.add(portalFrameGroup);

        const particleCount = 160;
        const positions = new Float32Array(particleCount * 3);
        portalParticleMeta = [];
        for (let i = 0; i < particleCount; i += 1) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 0.85 + Math.random() * 0.35;
          const depth = (Math.random() - 0.5);
          portalParticleMeta.push({ angle, radius, depth });
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = Math.sin(angle) * radius;
          positions[i * 3 + 2] = depth * 0.4;
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
          color: 0xa5b4fc,
          size: 0.05,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        portalParticles = new THREE.Points(particleGeo, particleMat);
        portalGroup.add(portalParticles);

        const fitPlaneToAspect = (aspect, baseSize = 8) => {
          if (!aspect) return;
          if (aspect >= 1) {
            const width = baseSize;
            const height = baseSize / aspect;
            plane.scale.set(width, height, 1);
            if (portalGlow) portalGlow.scale.set(width * 1.3, height * 1.3, 1);
            updatePortalFrame(width, height);
          } else {
            const width = baseSize * aspect;
            const height = baseSize;
            plane.scale.set(width, height, 1);
            if (portalGlow) portalGlow.scale.set(width * 1.3, height * 1.3, 1);
            updatePortalFrame(width, height);
          }
        };

        fitPlaneToAspect(16 / 9);

        videoMetadataHandler = () => {
          if (videoEl.videoWidth && videoEl.videoHeight) {
            fitPlaneToAspect(videoEl.videoWidth / videoEl.videoHeight);
          }
        };
        videoEl.addEventListener("loadedmetadata", videoMetadataHandler);
        videoEl.play().catch(() => { });

        toggleClickHandler = () => {
          if (videoEl.paused) {
            videoEl.muted = false;
            videoEl.play().catch(() => { });
          } else {
            videoEl.pause();
          }
        };
        container.addEventListener("click", toggleClickHandler);

        const animate = () => {
          if (disposed) return;

          const now = performance.now();
          const floatY = Math.sin(now * 0.0011) * 0.06;
          const floatX = Math.cos(now * 0.0009) * 0.02;
          portalGroup.position.y = floatY;
          portalGroup.position.x = floatX;
          portalGroup.rotation.z = Math.sin(now * 0.0006) * 0.04;
          portalGroup.rotation.y = Math.cos(now * 0.0005) * 0.04;

          if (portalParticles) {
            portalParticles.rotation.z += 0.002;
            portalParticles.rotation.y += 0.001;
          }

          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };
        animate();
      }

      if (stageCfg.type === "Audio") {
        const noteMaterial = new THREE.MeshStandardMaterial({
          color: 0xa5b4fc,
          emissive: 0x6366f1,
          emissiveIntensity: 0.5,
          roughness: 0.2,
          metalness: 0.1,
        });

        const noteGroup = new THREE.Group();

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 24, 24),
          noteMaterial
        );
        head.position.set(-0.15, -0.1, 0);
        noteGroup.add(head);

        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12),
          noteMaterial
        );
        stem.position.set(0.1, 0.35, 0);
        noteGroup.add(stem);

        const flag = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.12, 0.08),
          noteMaterial
        );
        flag.position.set(0.35, 0.68, 0);
        flag.rotation.z = -0.35;
        noteGroup.add(flag);

        noteGroup.scale.set(2, 2, 2);
        scene.add(noteGroup);

        const listener = new THREE.AudioListener();
        camera.add(listener);
        audioInstance = new THREE.Audio(listener);
        const loader = new THREE.AudioLoader();
        loader.setCrossOrigin("anonymous");

        let audioAnalyser = null;
        let notePulse = 0;

        loader.load(
          stageCfg.audioUrl || "",
          (buffer) => {
            if (disposed) return;
            audioInstance.setBuffer(buffer);
            audioInstance.setLoop(true);
            audioInstance.setVolume(0.6);
            audioAnalyser = new THREE.AudioAnalyser(audioInstance, 128);
            audioInstance.play().catch(() => { });
          },
          undefined,
          () => {
            if (!disposed && container) {
              container.textContent = "No se pudo cargar el audio.";
            }
          }
        );

        toggleClickHandler = () => {
          if (!audioInstance.buffer) return;
          if (audioInstance.isPlaying) audioInstance.pause();
          else audioInstance.play().catch(() => { });
        };
        container.addEventListener("click", toggleClickHandler);

        const animate = () => {
          if (disposed) return;

          if (noteGroup && audioAnalyser) {
            const raw = audioAnalyser.getAverageFrequency() / 255;
            notePulse += (raw - notePulse) * 0.15;
            const scale = 1 + notePulse * 0.5;
            noteGroup.scale.setScalar(scale * 2);
            noteGroup.position.y = notePulse * 0.35;
          }

          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };
        animate();
      }

      resizeObserver = new ResizeObserver(() => {
        if (!renderer || !camera || disposed) return;
        const nw = Math.max(260, container.clientWidth);
        const nh = Math.max(220, container.clientHeight);
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      });
      resizeObserver.observe(container);
    })().catch(() => { });

    return cleanup;
  };
}

const SweetAlertLoader = ({ onLoaded }) => {
  useEffect(() => {
    if (window.Swal) {
      onLoaded();
      return;
    }

    if (window.swalScriptLoading) {
      if (window.Swal) {
        onLoaded();
      }
      return;
    }

    window.swalScriptLoading = true;

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    script.async = true;
    script.onload = () => {
      onLoaded();
      window.swalScriptLoading = false;
    };
    script.onerror = () => {
      console.error("SweetAlert2 script failed to load.");
      window.swalScriptLoading = false;
    };
    document.body.appendChild(script);

  }, [onLoaded]);
  return null;
};

const BlocklyLoader = ({ onLoaded }) => {
  useEffect(() => {
    if (window.Blockly && window.Blockly.Msg && window.Blockly.Msg.ES) {
      onLoaded();
      return;
    }

    if (window.blocklyScriptLoading) {
      return;
    }

    window.blocklyScriptLoading = true;

    const blocklyScript = document.createElement('script');
    blocklyScript.src = "https://unpkg.com/blockly/blockly.min.js";
    blocklyScript.async = true;
    blocklyScript.onload = () => {
      const langScript = document.createElement('script');
      langScript.src = "https://unpkg.com/blockly/msg/es.js";
      langScript.async = true;
      langScript.onload = () => {
        onLoaded();
        window.blocklyScriptLoading = false;
      };
      langScript.onerror = () => {
        console.error("Blockly 'es' language script failed to load.");
        window.blocklyScriptLoading = false;
      };
      document.body.appendChild(langScript);
    };
    blocklyScript.onerror = () => {
      console.error("Blockly core script failed to load.");
      window.blocklyScriptLoading = false;
    };
    document.body.appendChild(blocklyScript);
  }, [onLoaded]);
  return null;
};

const TailwindStyles = () => (
  <style>{`

    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

    .blockly-scope {
      font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif;
      ...
      --font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif;
    }
    .blockly-scope .font-sans { font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif; }

    @keyframes blockly-bounce {
      0%, 100% {
        transform: translateY(-5%) scale(1.05);
        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      50% {
        transform: translateY(0) scale(1);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
    .blockly-title-animate {
      animation: blockly-bounce 2s ease-in-out infinite;
    }

    .blockly-scope *,.blockly-scope ::before,.blockly-scope ::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
    .blockly-scope button,.blockly-scope input,.blockly-scope optgroup,.blockly-scope select,.blockly-scope textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}
    .blockly-scope button,.blockly-scope select{text-transform:none}
    .blockly-scope [type=button],.blockly-scope [type=reset],.blockly-scope [type=submit],.blockly-scope button{-webkit-appearance:button;background-color:transparent;background-image:none}
    .blockly-scope :disabled{cursor:default;opacity:0.7}
    .blockly-scope img,.blockly-scope svg,.blockly-scope video,.blockly-scope canvas,.blockly-scope audio,.blockly-scope iframe,.blockly-scope embed,.blockly-scope object{display:block;vertical-align:middle}
    .blockly-scope img,.blockly-scope video{max-width:100%;height:auto}
    .blockly-scope [hidden]{display:none}

    .blockly-scope .relative{position:relative}
    .blockly-scope .mx-auto{margin-left:auto;margin-right:auto}
    .blockly-scope .mx-2{margin-left:.5rem;margin-right:.5rem}
    .blockly-scope .my-4{margin-top:1rem;margin-bottom:1rem}
    .blockly-scope .my-6{margin-top:1.5rem;margin-bottom:1.5rem}
    .blockly-scope .mb-2{margin-bottom:.5rem}
    .blockly-scope .mb-4{margin-bottom:1rem}
    .blockly-scope .mb-6{margin-bottom:1.5rem}
    .blockly-scope .mb-8{margin-bottom:2rem}
    .blockly-scope .mt-1{margin-top:.25rem}
    .blockly-scope .mt-2{margin-top:.5rem}
    .blockly-scope .mt-4{margin-top:1rem}
    .blockly-scope .mt-6{margin-top:1.5rem}
    .blockly-scope .mt-8{margin-top:2rem}
    .blockly-scope .mr-2{margin-right:.5rem}
    .blockly-scope .ml-2{margin-left:.5rem}
    .blockly-scope .inline-block{display:inline-block}
    .blockly-scope .grid{display:grid}
    .blockly-scope .h-10{height:2.5rem}
    .blockly-scope .h-16{height:4rem}
    .blockly-scope .h-32{height:8rem}
    .blockly-scope .h-full{height:100%}
    .blockly-scope .min-h-screen{min-height:100vh}
    .blockly-scope .w-full{width:100%}
    .blockly-scope .w-1\\/2{width:50%}
    .blockly-scope .w-1\\/3{width:33.333333%}
    .blockly-scope .w-2\\/3{width:66.666667%}
    .blockly-scope .w-1\\/4{width:25%}
    .blockly-scope .w-1\\/5{width:20%}
    .blockly-scope .max-w-7xl{max-width:80rem}
    .blockly-scope .flex-1{flex:1 1 0%}
    .blockly-scope .flex-shrink-0{flex-shrink:0}
    .blockly-scope .grow{flex-grow:1}
    .blockly-scope .cursor-pointer{cursor:pointer}
    .blockly-scope .flex-col{flex-direction:column}
    .blockly-scope .items-start{align-items:flex-start}
    .blockly-scope .items-center{align-items:center}
    .blockly-scope .justify-start{justify-content:flex-start}
    .blockly-scope .justify-center{justify-content:center}
    .blockly-scope .justify-between{justify-content:space-between}
    .blockly-scope .gap-2{gap:.5rem}
    .blockly-scope .gap-4{gap:1rem}
    .blockly-scope .gap-6{gap:1.5rem}
    .blockly-scope .gap-8{gap:2rem}
    .blockly-scope .overflow-auto{overflow:auto}
    .blockly-scope .overflow-hidden{overflow:hidden}
    .blockly-scope .overflow-y-auto{overflow-y:auto}
    .blockly-scope .rounded-lg{border-radius:.5rem}
    .blockly-scope .rounded-xl{border-radius:.75rem}
    .blockly-scope .rounded-full{border-radius:9999px}
    .blockly-scope .border{border-width:1px}
    .blockly-scope .border-2{border-width:2px}
    .blockly-scope .border-gray-200{border-color:rgb(229 231 235)}
    .blockly-scope .border-gray-300{border-color:rgb(209 213 219)}
    .blockly-scope .border-blue-500{border-color:rgb(59 130 246)}
    .blockly-scope .bg-white{background-color:rgb(255 255 255)}
    .blockly-scope .bg-gray-100{background-color:rgb(243 244 246)}
    .blockly-scope .bg-gray-200{background-color:rgb(229 231 235)}
    .blockly-scope .bg-gray-50{background-color:rgb(249 250 251)}
    .blockly-scope .bg-blue-100{background-color:rgb(219 234 254)}
    .blockly-scope .bg-blue-500{background-color:rgb(59 130 246)}
    .blockly-scope .bg-blue-600{background-color:rgb(37 99 235)}
    .blockly-scope .bg-blue-700{background-color:rgb(29 78 216)}
    .blockly-scope .bg-green-100{background-color:rgb(220 252 231)}
    .blockly-scope .bg-green-200{background-color:rgb(187 247 208)}
    .blockly-scope .bg-green-500{background-color:rgb(34 197 94)}
    .blockly-scope .bg-green-600{background-color:rgb(22 163 74)}
    .blockly-scope .bg-red-500{background-color:rgb(239 68 68)}
    .blockly-scope .hover\\:bg-red-600:hover{background-color:rgb(220 38 38)}
    .blockly-scope .bg-teal-500{background-color:rgb(20 184 166)}
    .blockly-scope .bg-teal-600{background-color:rgb(13 148 136)}
    .blockly-scope .p-1{padding:.25rem}
    .blockly-scope .p-2{padding:.5rem}
    .blockly-scope .p-3{padding:.75rem}
    .blockly-scope .p-4{padding:1rem}
    .blockly-scope .p-6{padding:1.5rem}
    .blockly-scope .p-8{padding:2rem}
    .blockly-scope .px-2{padding-left:.5rem;padding-right:.5rem}
    .blockly-scope .px-3{padding-left:.75rem;padding-right:.75rem}
    .blockly-scope .px-4{padding-left:1rem;padding-right:1rem}
    .blockly-scope .px-6{padding-left:1.5rem;padding-right:1.5rem}
    .blockly-scope .py-1{padding-top:.25rem;padding-bottom:.25rem}
    .blockly-scope .py-2{padding-top:.5rem;padding-bottom:.5rem}
    .blockly-scope .py-3{padding-top:.75rem;padding-bottom:.75rem}
    .blockly-scope .py-4{padding-top:1rem;padding-bottom:1rem}
    .blockly-scope .pb-4{padding-bottom:1rem}
    .blockly-scope .pt-2{padding-top:.25rem}
    .blockly-scope .pt-4{padding-top:1rem}
    .blockly-scope .text-center{text-align:center}
    .blockly-scope .text-left{text-align:left}
    .blockly-scope .text-xs{font-size:.75rem;line-height:1rem}
    .blockly-scope .text-sm{font-size:.875rem;line-height:1.25rem}
    .blockly-scope .text-lg{font-size:1.125rem;line-height:1.75rem}
    .blockly-scope .text-xl{font-size:1.25rem;line-height:1.75rem}
    .blockly-scope .text-2xl{font-size:1.5rem;line-height:2rem}
    .blockly-scope .text-3xl{font-size:1.875rem;line-height:2.25rem}
    .blockly-scope .text-4xl{font-size:2.25rem;line-height:2.5rem}
    .blockly-scope .font-bold{font-weight:700}
    .blockly-scope .font-semibold{font-weight:600}
    .blockly-scope .font-medium{font-weight:500}
    .blockly-scope .text-white{color:rgb(255 255 255)}
    .blockly-scope .text-gray-400{color:rgb(156 163 175)}
    .blockly-scope .text-gray-500{color:rgb(107 114 128)}
    .blockly-scope .text-gray-600{color:rgb(75 85 99)}
    .blockly-scope .text-gray-700{color:rgb(55 65 81)}
    .blockly-scope .text-gray-800{color:rgb(31 41 55)}
    .blockly-scope .text-gray-900{color:rgb(17 24 39)}
    .blockly-scope .text-blue-600{color:rgb(37 99 235)}
    .blockly-scope .text-blue-800{color:rgb(30 64 175)}
    .blockly-scope .text-green-600{color:rgb(22 163 74)}
    .blockly-scope .text-green-700{color:rgb(21 128 61)}
    .blockly-scope .text-green-800{color:rgb(22 101 52)}
    .blockly-scope .shadow-lg{box-shadow:0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)}
    .blockly-scope .shadow-md{box-shadow:0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1)}
    .blockly-scope .shadow-sm{box-shadow:0 1px 2px 0 rgb(0 0 0 / .05)}
    .blockly-scope .shadow-inner{box-shadow:inset 0 2px 4px 0 rgb(0 0 0 / .05)}
    .blockly-scope .transition-colors{transition-property:color, background-color, border-color;transition-timing-function:cubic-bezier(.4, 0, .2, 1);transition-duration:.15s}
    .blockly-scope .transition-transform{transition-property:transform;transition-timing-function:cubic-bezier(.4, 0, .2, 1);transition-duration:.15s}
    .blockly-scope .transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4, 0, .2, 1);transition-duration:.15s}
    .blockly-scope .duration-200{transition-duration:.2s}
    .blockly-scope .duration-300{transition-duration:.3s}
    .blockly-scope .ease-in-out{transition-timing-function:cubic-bezier(.4, 0, .2, 1)}
    .blockly-scope .hover\\:scale-105:hover{transform:scale(1.05)}
    .blockly-scope .hover\\:border-blue-500:hover{border-color:rgb(59 130 246)}
    .blockly-scope .hover\\:bg-blue-700:hover{background-color:rgb(29 78 216)}
    .blockly-scope .hover\\:bg-green-600:hover{background-color:rgb(22 163 74)}
    .blockly-scope .hover\\:bg-teal-600:hover{background-color:rgb(13 148 136)}
    .blockly-scope .hover\\:shadow-lg:hover{box-shadow:0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)}
    .blockly-scope .focus\\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}
    .blockly-scope .focus\\:ring-2:focus{box-shadow:0 0 0 2px rgb(59 130 246 / .5)}
    .blockly-scope .disabled\\:opacity-50:disabled{opacity:.5}
    .blockly-scope .disabled\\:cursor-not-allowed:disabled{cursor:not-allowed}
    .blockly-scope .grid-cols-2{grid-template-columns:repeat(2, minmax(0, 1fr))}
    .blockly-scope .grid-cols-4{grid-template-columns:repeat(4, minmax(0, 1fr))}
    .blockly-scope .flex{display:flex}
    .blockly-scope .hidden{display:none}
    .blockly-scope .flex-wrap{flex-wrap:wrap}
    .blockly-scope .transform{transform:translate(var(--tw-translate-x,0), var(--tw-translate-y,0)) rotate(var(--tw-rotate,0)) scale(var(--tw-scale-x,1), var(--tw-scale-y,1))}

    .blockly-workspace {
      width: 100%;
      height: 100%;
      min-height: 500px;
    }
    .blockly-toolbox-bg {
      background-color: #f0f0f0;
    }
    .blockly-trash-can {
      background-color: #f0f0f0;
      padding: 4px;
      border-radius: 4px;
    }
    .blockly-dotted-grid {
      background-image: radial-gradient(circle, #ccc 1px, transparent 1px);
      background-size: 16px 16px;
    }
  `}</style>
);

const BlocklyARStyles = () => (
  <style>{`
    @keyframes ra-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }

    @keyframes ra-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .ra-config-container {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(2, 62, 138, 0.12);
      max-width: 100%;
    }

    .ra-config-title {
      color: var(--primary-color);
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .ra-config-subtitle {
      color: var(--secondary-color);
      text-align: center;
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
    }

    .ra-stage-list {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      max-height: 100%;
      overflow-y: auto;
      padding-right: 8px;
    }

    .ra-stage-card {
      border: 1px solid rgba(2, 62, 138, 0.15);
      border-radius: 14px;
      padding: 12px 14px;
      background: white;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }

    .ra-stage-card:hover {
      border-color: var(--primary-color);
      box-shadow: 0 6px 16px rgba(0, 119, 182, 0.12);
    }

    .ra-stage-card.is-active {
      border-color: var(--primary-color);
      box-shadow: 0 10px 24px rgba(0, 119, 182, 0.2);
      background: linear-gradient(160deg, rgba(0, 119, 182, 0.08), rgba(255, 255, 255, 0.95));
    }

    .ra-stage-toggle {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      font-weight: 600;
      color: var(--dark-color);
      cursor: pointer;
      user-select: none;
    }

    .ra-stage-toggle input {
      accent-color: var(--primary-color);
    }

    .ra-stage-body {
      margin-top: 0.75rem;
      padding-left: 0.5rem;
      display: grid;
      gap: 0.6rem;
    }

    .ra-field-label {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--dark-color);
    }

    .ra-field {
      width: 100%;
      padding: 0.65rem 0.75rem;
      border: 1px solid rgba(2, 62, 138, 0.2);
      border-radius: 8px;
      font-size: 0.95rem;
font-family: var(--font-family, 'Nunito', 'Inter', sans-serif);
      background: #ffffff;
      color: var(--dark-color);
    }

    .ra-field:focus {
      outline: 2px solid rgba(0, 119, 182, 0.3);
      border-color: var(--primary-color);
    }

    .ra-field[type="file"] {
      padding: 0.4rem;
      cursor: pointer;
    }

    .ra-preview-btn {
      background-color: rgba(0, 119, 182, 0.1);
      color: var(--dark-color);
      border: 1px solid rgba(0, 119, 182, 0.3);
      font-weight: 600;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .ra-preview-btn:hover {
      background-color: rgba(0, 119, 182, 0.18);
    }

    .ra-save-btn {
      background-color: var(--primary-color);
      color: white;
      font-weight: 600;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      width: 100%;
      margin-top: 1rem;
      transition: background-color 0.3s ease;
    }

    .ra-save-btn:hover {
      background-color: #0056b3;
    }

    .ra-three-wrap {
      width: 100%;
      height: 240px;
      border: 1px solid rgba(2, 62, 138, 0.15);
      border-radius: 12px;
      background: #f6fbff;
      overflow: hidden;
    }

    .ra-three-canvas {
      width: 100%;
      height: 100%;
    }

    .ar-tabs {
      display: flex;
      gap: 0;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #e9ecef;
    }

    .ar-tab {
      flex: 1;
      padding: 1rem 1.5rem;
      border: none;
      background: transparent;
      font-size: 1rem;
      font-weight: 600;
      color: var(--secondary-color);
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;
      font-family: var(--font-family, 'Nunito', 'Inter', sans-serif);
    }

    .ar-tab:hover {
      color: var(--primary-color);
      background: rgba(0, 123, 255, 0.05);
    }

    .ar-tab.active {
      color: var(--primary-color);
    }

    .ar-tab.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--primary-color);
      border-radius: 3px 3px 0 0;
    }

    .ar-tab.has-content .tab-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: var(--success-color);
      border-radius: 50%;
      margin-left: 8px;
      vertical-align: middle;
    }

    .ar-tab-content {
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      min-height: 300px;
    }

    .ar-tab-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .ar-stage-toggle {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: var(--dark-color);
      cursor: pointer;
    }

    .ar-stage-toggle input {
      width: 20px;
      height: 20px;
      accent-color: var(--primary-color);
      cursor: pointer;
    }

    .ar-content-cards {
      display: grid;
      width: 100%;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }

    .ar-content-card {
      width: 100%;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 1rem;
      transition: all 0.3s ease;
    }

    .ar-content-card:hover {
      border-color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
    }

    .ar-content-card.has-content {
      border-color: var(--success-color);
      background: linear-gradient(135deg, rgba(40, 167, 69, 0.05), white);
    }

    .ar-card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e9ecef;
    }

    .ar-card-icon {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .ar-card-title {
      font-weight: 600;
      color: var(--dark-color);
      font-size: 1.05rem;
      flex: 1;
    }

    .ar-delete-btn {
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.2s;
      padding: 0;
      line-height: 1;
    }

    .ar-delete-btn:hover {
      background: #ff6b7a;
      transform: scale(1.1);
    }

    .ar-card-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .ar-preview-image {
      max-width: 100%;
      max-height: 120px;
      object-fit: contain;
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    .ar-preview-audio {
      width: 100%;
      margin-top: 0.5rem;
    }

    .ar-preview-video {
      width: 100%;
      max-height: 120px;
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    .ar-disabled-message {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--secondary-color);
      text-align: center;
    }

    .ar-disabled-message p {
      font-size: 1.05rem;
      margin: 0;
    }

    @media (max-width: 768px) {
      .ar-content-cards {
        grid-template-columns: 1fr;
      }
    }

    .ar-multi-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      width: 100%;
      margin: 0;
    }

    .ar-layout-single {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    .ar-layout-text-top {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }

    .ar-layout-text-top .ar-row-text {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .ar-layout-text-top .ar-row-media {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .ar-layout-row {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
      flex-wrap: wrap;
    }

    .ar-layout-three {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }

    .ar-layout-three .ar-row-text {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .ar-layout-three .ar-row-media-pair {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
      flex-wrap: wrap;
    }

    .ar-multi-text-3d {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .ar-multi-image,
    .ar-multi-video {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 12px;
      overflow: hidden;
    }

    .ar-three-container {
      width: 300px;
      height: 200px;
      border-radius: 12px;
    }

    .ar-audio-solo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
    }

    .ar-audio-icon {
      font-size: 3.5rem;
      animation: pulse-audio 1.5s ease-in-out infinite;
    }

    @keyframes pulse-audio {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .ar-audio-solo .ar-audio-player {
      width: 280px;
      height: 40px;
    }

    .ar-audio-hidden {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .ar-audio-player-bg {
      width: 1px;
      height: 1px;
    }

    .blockly-ar-bg {
      position: relative;
      min-height: 220px;
      width: 100%;
      background: linear-gradient(135deg, #0077b6 0%, #023e8a 100%);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.2rem;
      padding: 1.2rem 0;
      border-radius: 28px;
    }

    .blockly-ar-bg-camera {
      background: transparent;
    }

    .blockly-ar-camera-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
      border-radius: 28px;
      background: none;
    }

    .blockly-ar-bg-elements {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
    }

    .blockly-ar-content {
      position: relative;
      z-index: 2;
      width: 100%;
      padding: 0 1rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .blockly-ar-top {
      color: #ffd60a;
      font-weight: 800;
      text-shadow: 2px 2px 8px #3a0ca3, 0 0 20px rgba(0,0,0,0.8);
      text-align: center;
      background: rgba(0, 0, 0, 0.4);
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      backdrop-filter: blur(5px);
    }

    .blockly-ar-three-wrap {
      width: 100%;
      height: 240px;
      overflow: hidden;
      position: relative;
      z-index: 1;
    }

    .swal2-popup {
      border-radius: 28px !important;
      width: auto;
    }

    .swal2-title {
      font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
    }

    .swal2-html-container {
      font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif !important;
    }

    .swal2-confirm {
      background-color: #0077b6 !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      padding: 0.6rem 1.25rem !important;
    }

    .swal2-cancel {
      background-color: white !important;
      color: #0077b6 !important;
      border: 2px solid #0077b6 !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      padding: 0.6rem 1.25rem !important;
    }

    .swal2-cancel:hover {
      background-color: rgba(0, 123, 255, 0.05) !important;
    }

    .ra-edit-btn {
      background-color: rgba(0, 119, 182, 0.1);
      color: var(--dark-color);
      border: 1px solid rgba(0, 119, 182, 0.3);
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .ra-edit-btn:hover {
      background-color: rgba(0, 119, 182, 0.18);
    }
  `}</style>
);

const GameTitle = () => (
  <h1 className="font-bold text-center blockly-title-animate" style={{ color: '#023e8a', textShadow: '0 3px 6px rgba(0, 119, 182, 0.4)' }}>
    Blockly
  </h1>
);

const ALL_CHALLENGES = [
  {
    id: 'b1',
    title: 'Suma de dos números',
    description: 'Crea una función que reciba dos números y devuelva su suma.',
    instructions: [
      'Arrastra el bloque de "función" para empezar.',
      'Añade dos argumentos (x, y) a tu función.',
      'Usa el bloque de "devolver" de la categoría "Funciones".',
      'Usa un bloque de "suma" de "Matemáticas" para sumar x e y.'
    ],
    testCases: [
      { input: [7, 2], expected: 9 },
      { input: [5, 0], expected: 5 },
      { input: [3, 1], expected: 4 },
    ],
    difficulty: 'Básico',
    functionName: 'sumar',
  },
  {
    id: 'b2',
    title: 'Resta de dos números',
    description: 'Crea una función que reciba dos números y devuelva su resta (el primero menos el segundo).',
    instructions: [
      'Define una función con dos argumentos (a, b).',
      'Devuelve el resultado de "a - b" usando los bloques de "Matemáticas".'
    ],
    testCases: [
      { input: [10, 2], expected: 8 },
      { input: [5, 5], expected: 0 },
      { input: [3, 5], expected: -2 },
    ],
    difficulty: 'Básico',
    functionName: 'restar',
  },
  {
    id: 'b3',
    title: '¿Es mayor que 10?',
    description: 'Crea una función que reciba un número y devuelva "verdadero" si es mayor que 10, y "falso" si no lo es.',
    instructions: [
      'Define una función con un argumento (num).',
      'Usa un bloque "si... entonces... si no..." de "Lógica".',
      'Usa un bloque de comparación de "Lógica" para ver si "num > 10".',
      'Devuelve los bloques "verdadero" o "falso" de "Lógica".'
    ],
    testCases: [
      { input: [11], expected: true },
      { input: [10], expected: false },
      { input: [9], expected: false },
      { input: [20], expected: true },
    ],
    difficulty: 'Básico',
    functionName: 'esMayorQueDiez',
  },
  {
    id: 'b4',
    title: 'Contador del 1 al 10',
    description: 'Crea una función que devuelva un array (lista) con los números del 1 al 10.',
    instructions: [
      'Define una función sin argumentos.',
      'Crea una variable "lista" y asígnale una "lista vacía" de "Listas".',
      'Usa un bucle "contar con..." de "Bucles" para contar de 1 a 10.',
      'Dentro del bucle, usa el bloque "en lista... añadir al final" de "Listas" para añadir la variable del bucle (i) a tu "lista".',
      'Al final, devuelve la "lista".'
    ],
    testCases: [
      { input: [], expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    ],
    difficulty: 'Básico',
    functionName: 'contarHastaDiez',
  },
  {
    id: 'b5',
    title: 'Mostrar mensaje',
    description: 'Crea una función que devuelva el texto "Hola Blockly".',
    instructions: [
      'Define una función sin argumentos.',
      'Usa el bloque "devolver" de "Funciones".',
      'Añade un bloque de "texto" de "Texto" con el valor "Hola Blockly".'
    ],
    testCases: [
      { input: [], expected: "Hola Blockly" },
    ],
    difficulty: 'Básico',
    functionName: 'mostrarMensaje',
  },
  {
    id: 'i1',
    title: 'Encontrar el número mayor',
    description: 'Crea una función que reciba dos números y devuelva el mayor de los dos.',
    instructions: [
      'Define una función con dos argumentos (a, b).',
      'Usa un bloque "si... entonces... si no...".',
      'Compara si "a > b".',
      'Si es verdad, devuelve "a".',
      'Si no, devuelve "b".'
    ],
    testCases: [
      { input: [5, 10], expected: 10 },
      { input: [10, 5], expected: 10 },
      { input: [7, 7], expected: 7 },
    ],
    difficulty: 'Intermedio',
    functionName: 'encontrarMayor',
  },
  {
    id: 'i2',
    title: 'Factorial de un número',
    description: 'Crea una función que calcule el factorial de un número. (Ej: 5! = 5*4*3*2*1 = 120).',
    instructions: [
      'Define una función con un argumento (n).',
      'Crea una variable "resultado" y ponla en 1.',
      'Usa un bucle "contar con..." de (i) desde 1 hasta (n).',
      'Dentro del bucle, "establece resultado" a "resultado * i".',
      'Al final, devuelve "resultado".'
    ],
    testCases: [
      { input: [5], expected: 120 },
      { input: [1], expected: 1 },
      { input: [0], expected: 1 },
      { input: [3], expected: 6 },
    ],
    difficulty: 'Intermedio',
    functionName: 'factorial',
  },
  {
    id: 'i3',
    title: 'Invertir un texto',
    description: 'Crea una función que reciba un texto y lo devuelva al revés.',
    instructions: [
      'Este desafío es más complejo. Blockly no tiene un bloque "invertir texto".',
      'Intenta usar bucles para recorrer el texto desde el final hasta el principio.',
      'Crea una variable "textoInvertido" como "" (texto vacío).',
      'Usa un bucle "contar con..." (i) desde "longitud de texto" - 1 hasta 0, disminuyendo 1.',
      'Dentro del bucle, "establece textoInvertido" a "textoInvertido" + "en texto... obtener letra #" (i).',
      'Devuelve "textoInvertido".'
    ],
    testCases: [
      { input: ["hola"], expected: "aloh" },
      { input: ["React"], expected: "tcaeR" },
      { input: ["a"], expected: "a" },
    ],
    difficulty: 'Intermedio',
    functionName: 'invertirTexto',
  },
  {
    id: 'i4',
    title: 'Sumar una lista',
    description: 'Crea una función que reciba una lista de números y devuelva la suma de todos sus elementos.',
    instructions: [
      'Define una función con un argumento (lista).',
      'Crea una variable "total" y ponla en 0.',
      'Usa un bucle "para cada elemento (item) en lista..." de "Bucles".',
      'Dentro del bucle, "establece total" a "total + item".',
      'Al final, devuelve "total".'
    ],
    testCases: [
      { input: [[1, 2, 3]], expected: 6 },
      { input: [[10, 20]], expected: 30 },
      { input: [[]], expected: 0 },
    ],
    difficulty: 'Intermedio',
    functionName: 'sumarLista',
  },
  {
    id: 'i5',
    title: '¿Es Palíndromo?',
    description: 'Crea una función que reciba un texto y devuelva "verdadero" si se lee igual al derecho y al revés (ej: "ana"), y "falso" si no.',
    instructions: [
      'Este es un desafío de lógica.',
      'Puedes re-usar la lógica de "Invertir un texto".',
      'Obtén el texto invertido.',
      'Usa un bloque de "Lógica" para comparar si "texto" == "textoInvertido".',
      'Devuelve el resultado de esa comparación.'
    ],
    testCases: [
      { input: ["ana"], expected: true },
      { input: ["radar"], expected: true },
      { input: ["hola"], expected: false },
    ],
    difficulty: 'Intermedio',
    functionName: 'esPalindromo',
  },
  {
    id: 'i6',
    title: 'Contar Pares',
    description: 'Crea una función que reciba una lista de números y devuelva cuántos de ellos son pares.',
    instructions: [
      'Define una función con un argumento (lista).',
      'Crea una variable "contador" y ponla en 0.',
      'Usa un bucle "para cada elemento (num) en lista...".',
      'Dentro del bucle, usa un bloque "si..."',
      'La condición será "num % 2 == 0" (usa el bloque "resto de" de "Matemáticas").',
      'Si es verdad, "establece contador" a "contador + 1".',
      'Al final, devuelve "contador".'
    ],
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6]], expected: 3 },
      { input: [[2, 4, 6, 8]], expected: 4 },
      { input: [[1, 3, 5]], expected: 0 },
    ],
    difficulty: 'Intermedio',
    functionName: 'contarPares',
  },
  {
    id: 'a1',
    title: 'Fibonacci',
    description: 'Crea una función que reciba un número (n) y devuelva el n-ésimo número de la secuencia de Fibonacci (0, 1, 1, 2, 3, 5, 8...).',
    instructions: [
      'Este es difícil. Si n=0, devuelve 0. Si n=1, devuelve 1.',
      'Crea una lista "fib" con [0, 1].',
      'Usa un bucle "contar con..." (i) desde 2 hasta (n).',
      'Dentro del bucle, añade a "fib" la suma de "elemento # (i-1) de fib" + "elemento # (i-2) de fib".',
      'Al final, devuelve el "elemento # (n) de fib".'
    ],
    testCases: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [5], expected: 5 },
      { input: [7], expected: 13 },
    ],
    difficulty: 'Avanzado',
    functionName: 'fibonacci',
  },
  {
    id: 'a2',
    title: 'Encontrar el Máximo de una Lista',
    description: 'Crea una función que reciba una lista de números y devuelva el número más grande.',
    instructions: [
      'Define una función con (lista).',
      'Crea una variable "maximo" y establécela al "primer elemento" de la lista.',
      'Usa un bucle "para cada elemento (num) en lista...".',
      'Dentro, usa un "si..." para comparar si "num > maximo".',
      'Si es verdad, "establece maximo" a "num".',
      'Al final, devuelve "maximo".'
    ],
    testCases: [
      { input: [[1, 5, 2, 8, 3]], expected: 8 },
      { input: [[-10, -5, -2]], expected: -2 },
      { input: [[100]], expected: 100 },
    ],
    difficulty: 'Avanzado',
    functionName: 'encontrarMaximo',
  },
  {
    id: 'a3',
    title: '¿Es número primo?',
    description: 'Crea una función que reciba un número y devuelva "verdadero" si es primo, y "falso" si no lo es.',
    instructions: [
      'Un número primo solo es divisible por 1 y por sí mismo. 1 no es primo.',
      'Define una función con (num).',
      'Si "num <= 1", devuelve "falso".',
      'Usa un bucle "contar con..." (i) desde 2 hasta "num - 1".',
      'Dentro del bucle, usa un "si..."',
      'La condición será "num % i == 0" (resto de).',
      'Si es verdad, significa que es divisible, así que "devuelve falso".',
      'Si el bucle termina sin devolver falso, "devuelve verdadero" (fuera del bucle).'
    ],
    testCases: [
      { input: [2], expected: true },
      { input: [3], expected: true },
      { input: [4], expected: false },
      { input: [7], expected: true },
      { input: [10], expected: false },
      { input: [1], expected: false },
    ],
    difficulty: 'Avanzado',
    functionName: 'esPrimo',
  },
  {
    id: 'a4',
    title: 'Promedio de una Lista',
    description: 'Crea una función que reciba una lista de números y devuelva su promedio.',
    instructions: [
      'Puedes re-usar la lógica de "Sumar una lista".',
      'Calcula la suma total.',
      'Obtén la "longitud de" la lista.',
      'Devuelve "suma total / longitud".',
      'Considera el caso de una lista vacía (debería devolver 0).'
    ],
    testCases: [
      { input: [[1, 2, 3]], expected: 2 },
      { input: [[10, 20, 30]], expected: 20 },
      { input: [[5, 5, 5, 5]], expected: 5 },
    ],
    difficulty: 'Avanzado',
    functionName: 'promedio',
  },
  {
    id: 'a5',
    title: 'Eliminar Duplicados',
    description: 'Crea una función que reciba una lista y devuelva una nueva lista sin elementos duplicados.',
    instructions: [
      'Crea una variable "listaUnica" como una lista vacía.',
      'Usa un bucle "para cada elemento (item) en lista...".',
      'Dentro, usa un "si..."',
      'La condición será "en lista "listaUnica" encontrar "item" == -1" (usando "encontrar primera/última aparición" de "Listas").',
      'Si es verdad, "añade "item" a "listaUnica".',
      'Al final, devuelve "listaUnica".'
    ],
    testCases: [
      { input: [[1, 2, 2, 3, 1, 4]], expected: [1, 2, 3, 4] },
      { input: [["a", "b", "a"]], expected: ["a", "b"] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
    ],
    difficulty: 'Avanzado',
    functionName: 'eliminarDuplicados',
  },
  {
    id: 'a6',
    title: 'Unir dos Listas',
    description: 'Crea una función que reciba dos listas y devuelva una sola lista con todos los elementos de ambas.',
    instructions: [
      'Blockly no tiene un bloque directo para "unir" listas.',
      'Crea una "nuevaLista" como una copia de "lista1".',
      'Usa un bucle "para cada elemento (item) en lista2...".',
      'Dentro, "añade "item" a "nuevaLista".',
      'Devuelve "nuevaLista".'
    ],
    testCases: [
      { input: [[1, 2], [3, 4]], expected: [1, 2, 3, 4] },
      { input: [[], [1, 2]], expected: [1, 2] },
      { input: [["a"], ["b"]], expected: ["a", "b"] },
    ],
    difficulty: 'Avanzado',
    functionName: 'unirListas',
  },
  {
    id: 'a7',
    title: 'Mayúsculas',
    description: 'Crea una función que reciba un texto y lo devuelva en mayúsculas.',
    instructions: [
      'Usa el bloque "a mayúsculas/minúsculas" de la categoría "Texto".',
      'Devuelve el resultado.'
    ],
    testCases: [
      { input: ["hola"], expected: "HOLA" },
      { input: ["Blockly"], expected: "BLOCKLY" },
      { input: ["Ya EsTa"], expected: "YA ESTA" },
    ],
    difficulty: 'Avanzado',
    functionName: 'aMayusculas',
  },
  {
    id: 'a8',
    title: 'FizzBuzz',
    description: 'Crea una función que reciba un número (n) y devuelva una lista de 1 a n, pero: si el número es divisible por 3, pon "Fizz"; si es divisible por 5, pon "Buzz"; si es divisible por ambos, pon "FizzBuzz"; si no, pon el número.',
    instructions: [
      'Este es un clásico. Crea una "listaResultado" vacía.',
      'Usa un bucle "contar con..." (i) de 1 a (n).',
      'Dentro, usa "si... si no si... si no si... si no".',
      '1. Si (i % 3 == 0) Y (i % 5 == 0) -> añade "FizzBuzz".',
      '2. Si (i % 3 == 0) -> añade "Fizz".',
      '3. Si (i % 5 == 0) -> añade "Buzz".',
      '4. Si no -> añade (i).',
      'Al final, devuelve "listaResultado".'
    ],
    testCases: [
      { input: [15], expected: [1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz"] },
    ],
    difficulty: 'Avanzado',
    functionName: 'fizzBuzz',
  },
];

const DIFFICULTY_SETTINGS = {
  Básico: {
    maxChallenges: 3,
    time: 5 * 60,
    availableChallenges: ALL_CHALLENGES.filter(c => c.difficulty === 'Básico').slice(0, 5)
  },
  Intermedio: {
    maxChallenges: 4,
    time: 10 * 60,
    availableChallenges: ALL_CHALLENGES.filter(c => c.difficulty === 'Intermedio').slice(0, 6)
  },
  Avanzado: {
    maxChallenges: 5,
    time: 15 * 60,
    availableChallenges: ALL_CHALLENGES.filter(c => c.difficulty === 'Avanzado').slice(0, 8)
  }
};

const toolboxXml = `
  <xml>
    <category name="Lógica" colour="#5C81A6">
      <block type="controls_if"></block>
      <block type="logic_compare"></block>
      <block type="logic_operation"></block>
      <block type="logic_negate"></block>
      <block type="logic_boolean"></block>
      <block type="logic_null"></block>
      <block type="logic_ternary"></block>
    </category>
    <category name="Bucles" colour="#5CA65C">
      <block type="controls_repeat_ext">
        <value name="TIMES">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
      </block>
      <block type="controls_whileUntil"></block>
      <block type="controls_for">
        <value name="FROM">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="TO">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
        <value name="BY">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="controls_forEach"></block>
      <block type="controls_flow_statements"></block>
    </category>
    <category name="Matemáticas" colour="#5C68A6">
      <block type="math_number"></block>
      <block type="math_arithmetic">
        <value name="A">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="B">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="math_single">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">9</field>
          </shadow>
        </value>
      </block>
      <block type="math_trig">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">45</field>
          </shadow>
        </value>
      </block>
      <block type="math_constant"></block>
      <block type="math_number_property">
        <value name="NUMBER_TO_CHECK">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>
      </block>
      <block type="math_round">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">3.1</field>
          </shadow>
        </value>
      </block>
      <block type="math_on_list"></block>
      <block type="math_modulo">
        <value name="DIVIDEND">
          <shadow type="math_number">
            <field name="NUM">64</field>
          </shadow>
        </value>
        <value name="DIVISOR">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
      </block>
      <block type="math_constrain">
        <value name="VALUE">
          <shadow type="math_number">
            <field name="NUM">50</field>
          </shadow>
        </value>
        <value name="LOW">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="HIGH">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
      </block>
      <block type="math_random_int">
        <value name="FROM">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="TO">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
      </block>
      <block type="math_random_float"></block>
    </category>
    <category name="Texto" colour="#A65C5C">
      <block type="text"></block>
      <block type="text_join"></block>
      <block type="text_append">
        <value name="TEXT">
          <shadow type="text"></shadow>
        </value>
      </block>
      <block type="text_length">
        <value name="VALUE">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_isEmpty">
        <value name="VALUE">
          <shadow type="text">
            <field name="TEXT"></field>
          </shadow>
        </value>
      </block>
      <block type="text_indexOf">
        <value name="VALUE">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
        <value name="FIND">
          <shadow type="text">
            <field name="TEXT">b</field>
          </shadow>
        </value>
      </block>
      <block type="text_charAt">
        <value name="VALUE">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_getSubstring">
        <value name="STRING">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_changeCase">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_trim">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT"> abc </field>
          </shadow>
        </value>
      </block>
      <block type="text_print">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
    </category>
    <category name="Listas" colour="#745CA6">
      <block type="lists_create_with">
        <mutation items="0"></mutation>
      </block>
      <block type="lists_create_with"></block>
      <block type="lists_repeat">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">5</field>
          </shadow>
        </value>
      </block>
      <block type="lists_length"></block>
      <block type="lists_isEmpty"></block>
      <block type="lists_indexOf">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_getIndex">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_setIndex">
        <value name="LIST">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_getSublist">
        <value name="LIST">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_split">
        <value name="DELIM">
          <shadow type="text">
            <field name="TEXT">,</field>
          </shadow>
        </value>
      </block>
      <block type="lists_sort"></block>
    </category>
    <sep></sep>
    <category name="Variables" colour="#A6745C" custom="VARIABLE"></category>
    <category name="Funciones" colour="#9A5CA6" custom="PROCEDURE"></category>
  </xml>
`;

const SetupScreen = ({ onGameStart, onEditAR, onConfigChange, onPreview }) => {
  const [difficulty, setDifficulty] = useState('Básico');
  const [selectedChallenges, setSelectedChallenges] = useState(new Set());
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);



  useEffect(() => {
    setSettings(DIFFICULTY_SETTINGS[difficulty]);
    setSelectedChallenges(new Set());
  }, [difficulty]);

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
        difficulty,
        challenges: selectedChallenges.size,
        time: DIFFICULTY_SETTINGS[difficulty]?.time ?? 0,
      });
    }
  }, [difficulty, selectedChallenges, onConfigChange]);

  const toggleChallenge = (challengeId) => {
    setSelectedChallenges(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(challengeId)) {
        newSelection.delete(challengeId);
      } else {
        if (newSelection.size < settings.maxChallenges) {
          newSelection.add(challengeId);
        } else {
          window.Swal.fire({
            title: 'Límite alcanzado',
            text: `Solo puedes seleccionar un máximo de ${settings.maxChallenges} desafíos para el nivel ${difficulty}.`,
            icon: 'warning',
            timer: 2000
          });
        }
      }
      return newSelection;
    });
  };

  const handleStart = () => {
    if (selectedChallenges.size === 0) {
      window.Swal.fire({
        title: 'Sin desafíos',
        text: `Debes seleccionar al menos un desafío para comenzar.`,
        icon: 'error',
        timer: 2000
      });
      return;
    }
    const challenges = settings.availableChallenges.filter(c => selectedChallenges.has(c.id));
    onGameStart(difficulty, challenges, settings.time);
  };

  useEffect(() => {
    if (onPreview) onPreview(handleStart);
  }, [handleStart]);

  const getButtonClass = (level) => {
    return level === difficulty
      ? 'text-white shadow-lg'
      : 'bg-white text-gray-700 border border-gray-300 hover:border-sky-600';
  };

  const selectedButtonStyle = { backgroundColor: '#023e8a' };

  const getChallengeCardClass = (id) => {
    return selectedChallenges.has(id)
      ? 'bg-blue-100 border-blue-500 border-2 shadow-inner'
      : 'bg-white border-gray-300 border hover:shadow-lg';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">


      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Selecciona el nivel de dificultad:</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['Básico', 'Intermedio', 'Avanzado'].map(level => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`py-3 px-6 rounded-full text-lg font-medium transition-all duration-200 ease-in-out transform hover:scale-105 sm:w-auto ${getButtonClass(level)}`}
              style={level === difficulty ? selectedButtonStyle : {}}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Selecciona los desafíos a realizar (Máximo {settings.maxChallenges}):
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-inner overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full overflow-y-auto">
              {settings.availableChallenges.map(challenge => (
                <div
                  key={challenge.id}
                  onClick={() => toggleChallenge(challenge.id)}
                  className={`p-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 flex items-center justify-center text-center font-semibold ${getChallengeCardClass(challenge.id)}`}
                >
                  {challenge.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Desafíos seleccionados: {selectedChallenges.size} / {settings.maxChallenges}</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-inner min-h-[200px]">
              {selectedChallenges.size === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                  </svg>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {settings.availableChallenges.filter(c => selectedChallenges.has(c.id)).map(c => (
                  <div key={c.id} className="p-3 rounded-lg text-white font-medium text-center shadow-md" style={{ backgroundColor: '#0077b6' }}>
                    {c.title}
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

const BlocklyWorkspace = ({ toolbox, onCodeUpdate }) => {
  const blocklyRef = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    if (window.Blockly && blocklyRef.current && !workspaceRef.current) {
      window.Blockly.setLocale('es');

      workspaceRef.current = window.Blockly.inject(blocklyRef.current, {
        toolbox: toolbox,
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true,
        },
        trashcan: true,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        }
      });

      if (window.Blockly.JavaScript) {
        workspaceRef.current.addChangeListener(() => {
          const code = window.Blockly.JavaScript.workspaceToCode(workspaceRef.current);
          onCodeUpdate(code);
        });
      } else {
        console.error("Blockly JavaScript generator not loaded.");
      }
    }

    return () => {
    };
  }, [toolbox, onCodeUpdate]);

  useEffect(() => {
    const handleResize = () => {
      if (workspaceRef.current) {
        window.Blockly.svgResize(workspaceRef.current);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={blocklyRef} className="blockly-workspace blockly-dotted-grid" />;
};

const GameScreen = ({ difficulty, challenges, totalTime, onGameEnd, onFinishConfig, arSelectedStages, arConfig, showARStageModal }) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [generatedCode, setGeneratedCode] = useState('');
  const [executionResult, setExecutionResult] = useState({ type: '', message: '' });
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const timerRef = useRef(null);

  const currentChallenge = challenges[currentChallengeIndex];

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          stopTimer();
          handleTimeOut();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []);

  const handleTimeOut = () => {
    window.Swal.fire({
      title: '¡Puedes mejorar, Intenta nuevamente!',
      text: `Se acabó el tiempo. Total: ${score} Puntos`,
      icon: 'info',
      allowOutsideClick: false,
    }).then(() => {
      onGameEnd(score);
    });
  };

  const handleFinishGame = () => {
    stopTimer();

    window.Swal.fire({
      title: '¿Estás seguro?',
      text: "Finalizarás el juego con tu puntuación actual.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        window.Swal.fire({
          title: '¡Puedes mejorar, Intenta nuevamente!',
          text: `Total: ${score} Puntos`,
          icon: 'info',
          allowOutsideClick: false,
        }).then(() => {
          onGameEnd(score);
        });
      } else {
        startTimer();
      }
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const executeSolution = () => {
    const { testCases } = currentChallenge;
    let allCorrect = true;
    let resultsLog = [];

    // Detectar cualquier nombre de función que el usuario haya definido
    const funcMatch = generatedCode.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
    if (!funcMatch) {
      setExecutionResult({
        type: 'error',
        message: 'Error: No se encontró ninguna función en tu código. Asegúrate de definir una función con bloques.'
      });
      showIncorrectModal();
      return;
    }
    const detectedFunctionName = funcMatch[1];

    try {
      const userFunction = new Function(
        `${generatedCode.replace(
          new RegExp(`function\\s+${detectedFunctionName}\\s*\\(`),
          `var ${detectedFunctionName} = function(`
        )} return ${detectedFunctionName};`
      )();

      for (const testCase of testCases) {
        const result = userFunction(...testCase.input);
        const expected = testCase.expected;

        const isCorrect = JSON.stringify(result) === JSON.stringify(expected);

        if (!isCorrect) {
          allCorrect = false;
          resultsLog.push(`Falló: Entrada [${testCase.input.join(', ')}]. Esperado: ${JSON.stringify(expected)}, Recibido: ${JSON.stringify(result)}`);
          break;
        } else {
          resultsLog.push(`Éxito: Entrada [${testCase.input.join(', ')}]. Recibido: ${JSON.stringify(result)}`);
        }
      }

    } catch (error) {
      allCorrect = false;
      resultsLog.push(`Error de ejecución: ${error.message}`);
    }

    setExecutionResult({
      type: allCorrect ? 'success' : 'error',
      message: resultsLog.join('\n')
    });

    if (allCorrect) {
      handleCorrectSolution();
    } else {
      showIncorrectModal();
    }
  };
  const showIncorrectModal = () => {
    window.Swal.fire({
      title: 'Solución incorrecta,',
      text: 'Intenta nuevamente',
      icon: 'error'
    });
  };

  const handleCorrectSolution = async () => {
    const newScore = score + 10;
    setScore(newScore);

    const hasARContent = arSelectedStages?.Acierto && arConfig?.Acierto;

    if (hasARContent) {
      const result = await showARStageModal('Acierto', {
        title: '¡Solución correcta!',
        icon: 'success',
        showCancelButton: currentChallengeIndex < challenges.length - 1,
        confirmButtonText: currentChallengeIndex < challenges.length - 1 ? 'Siguiente desafío' : 'Ver resultado',
        cancelButtonText: 'Finalizar juego',
        confirmButtonColor: '#0077b6',
      });

      if (!result && currentChallengeIndex < challenges.length - 1) {
        stopTimer();
        window.Swal.fire({
          title: '¡Buen trabajo!',
          text: `Total: ${newScore} Puntos`,
          icon: 'info',
          allowOutsideClick: false,
          confirmButtonColor: '#0077b6',
        }).then(() => {
          onGameEnd(newScore);
        });
        return;
      }
    } else {
      await window.Swal.fire({
        title: 'Solución correcta',
        html: '¡Has obtenido!<br><b class="text-2xl text-green-700">10 Puntos</b>',
        icon: 'success',
        allowOutsideClick: false,
        confirmButtonColor: '#0077b6',
      });
    }

    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
      setExecutionResult({ type: '', message: '' });
    } else {
      stopTimer();
      window.Swal.fire({
        title: '¡Felicidades, lo lograste!',
        text: `Total: ${newScore} Puntos`,
        icon: 'success',
        allowOutsideClick: false,
        confirmButtonColor: '#0077b6',
      }).then(() => {
        onGameEnd(newScore);
      });
    }
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col bg-gray-100">
      <style>{`
        .blk-game-layout {
          display: grid;
          grid-template-columns: 260px 1fr 260px;
          gap: 0.75rem;
          padding: 0.75rem;
          height: calc(100vh - 8px);
          box-sizing: border-box;
          align-items: start;
        }
        @media(max-width: 900px) {
          .blk-game-layout { grid-template-columns: 1fr; height: auto; }
        }
        .blk-left-col {
          display: flex; flex-direction: column; gap: 0.75rem;
          max-height: calc(100vh - 16px); overflow-y: auto;
        }
        .blk-center-col {
          height: calc(100vh - 16px);
          display: flex; flex-direction: column;
          background: white; border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .blk-right-col {
          display: flex; flex-direction: column; gap: 0.75rem;
          max-height: calc(100vh - 16px);
        }
        .blk-challenge-card {
          background: white; border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          padding: 1rem;
          border: 1px solid #e2e8f0;
        }
        .blk-challenge-card h3 {
          font-size: 1.1rem; font-weight: 700;
          color: #023e8a; margin: 0 0 0.5rem;
        }
        .blk-challenge-card p {
          font-size: 0.88rem; color: #475569; margin: 0 0 0.75rem;
        }
        .blk-test-cases {
          background: #f8fafc; border-radius: 8px;
          padding: 0.75rem; font-family: monospace;
          font-size: 0.8rem; border: 1px solid #e2e8f0;
        }
        .blk-test-cases p { margin: 0 0 0.25rem; color: #64748b; }
        .blk-test-cases p:last-child { margin-bottom: 0; }
        .blk-stats-block {
          border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 1rem; background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .blk-stats-block h3 {
          margin: 0 0 0.75rem; font-size: 0.95rem; font-weight: 700;
          color: #1f2937; padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .blk-stats-item {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 0.6rem;
          font-size: 0.88rem; color: #64748b;
        }
        .blk-stats-item:last-child { margin-bottom: 0; }
        .blk-stats-item strong { font-weight: 700; color: #023e8a; font-size: 0.95rem; }
        .blk-stats-item .blk-stat-icon { font-size: 1rem; margin-right: 0.35rem; }
        .blk-timer-urgent { color: #ef4444 !important; animation: blk-pulse 0.8s infinite; }
        @keyframes blk-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .blk-result-panel {
          background: white; border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          padding: 1rem; flex: 1;
          display: flex; flex-direction: column; gap: 0.75rem;
          border: 1px solid #e2e8f0;
        }
        .blk-result-panel h3 {
          font-size: 0.95rem; font-weight: 700;
          color: #1f2937; margin: 0;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .blk-run-btn {
          width: 100%; background: #16a34a;
          color: white; font-weight: 700;
          padding: 0.75rem; border-radius: 8px;
          border: none; cursor: pointer; font-size: 0.95rem;
          transition: background 0.2s;
        }
        .blk-run-btn:hover { background: #15803d; }
        .blk-console {
          flex: 1; background: #1e293b;
          color: white; font-family: monospace;
          font-size: 0.8rem; border-radius: 8px;
          padding: 0.75rem; overflow-y: auto;
          min-height: 120px;
        }
        .blk-finish-btn {
          width: 100%; background: #005f92 !important;
          color: white !important; font-weight: 700;
          padding: 0.875rem 2rem; border-radius: 8px;
          border: none !important; cursor: pointer; font-size: 1.1rem;
          transition: background 0.2s; margin-top: auto;
          font-family: 'Nunito', 'Inter', sans-serif;
        }
        .blk-finish-btn:hover { background: #004a73 !important; }
      `}</style>
      {/* ── Título animado + reglas básicas ── */}
      <div style={{ background: 'white', padding: '1.5rem 2rem 0.5rem', textAlign: 'center' }}>
        <div style={{
          textAlign: 'center', fontSize: '2.5rem', fontWeight: 700,
          color: '#1f2937', marginBottom: '0.5rem',
          display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
          fontFamily: "'Merriweather', serif",
        }}>
          {'Juego de BloqCode'.split('').map((char, i) => (
            <span key={i} style={{
              display: 'inline-block',
              animation: 'encWaveTitle 1.8s infinite',
              animationDelay: `${i * 0.07}s`,
            }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes encWaveTitle {
            0%, 40%, 100% { transform: translateY(0); }
            20% { transform: translateY(-12px); }
          }
        `}</style>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr',
          margin: '0.5rem auto 1rem auto', maxWidth: '600px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '0.75rem', padding: '0.85rem 1.25rem',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
            📋 Reglas Básicas
          </span>
          <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: 500 }}>
            Utiliza los bloques de las diferentes categorías y resuelve la problemática .
          </span>
        </div>
      </div>
      <div className="blk-game-layout">

        {/* ── Columna izquierda: desafío + casos de prueba ── */}
        <div className="blk-left-col">
          <div className="blk-challenge-card">
            <h3>{currentChallenge.title}</h3>
            <p>{currentChallenge.description}</p>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0077b6', marginBottom: '0.5rem' }}>
              Casos de prueba
            </div>
            <div className="blk-test-cases">
              {currentChallenge.testCases.map((tc, index) => (
                <div key={index} style={{ marginBottom: index < currentChallenge.testCases.length - 1 ? '0.5rem' : 0 }}>
                  <p style={{ color: '#64748b' }}>Entrada: [{tc.input.join(', ')}]</p>
                  <p style={{ color: '#1e40af', fontWeight: 600 }}>Esperado: {JSON.stringify(tc.expected)}</p>
                </div>
              ))}
            </div>

            {/* Botón de instrucciones */}
            <button
              onClick={() => setShowInstructionsModal(true)}
              style={{
                marginTop: '0.75rem',
                width: '100%',
                background: '#0077b6',
                color: 'white',
                fontWeight: 700,
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#005f92'}
              onMouseOut={e => e.currentTarget.style.background = '#0077b6'}
            >
              📖 Instrucciones
            </button>
          </div>
        </div>

        {/* Modal de instrucciones */}
        {showInstructionsModal && (
          <div
            onClick={() => setShowInstructionsModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white', borderRadius: '16px',
                padding: '2rem', maxWidth: '480px', width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: '#023e8a', fontSize: '1.2rem', fontWeight: 700 }}>
                  📖 {currentChallenge.title}
                </h2>
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '1.4rem', color: '#64748b', lineHeight: 1,
                  }}
                >×</button>
              </div>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {currentChallenge.description}
              </p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <p style={{ fontWeight: 700, color: '#0077b6', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Pasos a seguir:
                </p>
                <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentChallenge.instructions.map((step, i) => (
                    <li key={i} style={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.5 }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <button
                onClick={() => setShowInstructionsModal(false)}
                style={{
                  marginTop: '1.5rem', width: '100%',
                  background: '#0077b6', color: 'white',
                  fontWeight: 700, padding: '0.7rem',
                  borderRadius: '8px', border: 'none',
                  cursor: 'pointer', fontSize: '0.95rem',
                }}
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        )}

        {/* ── Columna central: workspace Blockly ── */}
        <div className="blk-center-col">
          <BlocklyWorkspace
            toolbox={toolboxXml}
            onCodeUpdate={setGeneratedCode}
          />
        </div>

        {/* ── Columna derecha: progreso + resultado + finalizar ── */}
        <div className="blk-right-col">

          {/* Tablero de progreso estilo CalculadoraMental */}
          <div className="blk-stats-block">
            <h3>Progreso</h3>
            <div className="blk-stats-item">
              <span><span className="blk-stat-icon">🎯</span>Nivel:</span>
              <strong>{difficulty}</strong>
            </div>
            <div className="blk-stats-item">
              <span><span className="blk-stat-icon">⏱</span>Tiempo:</span>
              <strong className={timeLeft <= 30 ? 'blk-timer-urgent' : ''}>{formatTime(timeLeft)}</strong>
            </div>
            <div className="blk-stats-item">
              <span><span className="blk-stat-icon">🧩</span>Desafío:</span>
              <strong>{currentChallengeIndex + 1} / {challenges.length}</strong>
            </div>
            <div className="blk-stats-item">
              <span><span className="blk-stat-icon">⭐</span>Puntuación:</span>
              <strong>{score}</strong>
            </div>
          </div>

          {/* Panel resultado + consola */}
          <div className="blk-result-panel">
            <h3>Resultado</h3>
            <button className="blk-run-btn" onClick={executeSolution}>
              ▶ Ejecutar Solución
            </button>
            <div className="blk-console">
              <p style={{ color: '#94a3b8', margin: '0 0 0.5rem' }}>&gt; Esperando ejecución...</p>
              {executionResult.message && (
                <pre style={{ margin: 0, color: executionResult.type === 'success' ? '#4ade80' : '#f87171', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {executionResult.message}
                </pre>
              )}
            </div>
          </div>

          {/* Botón finalizar */}
          <button className="blk-finish-btn" onClick={handleFinishGame}>
            Finalizar Juego
          </button>

        </div>
      </div>

      {/* ── Footer: Anterior | Terminar Configuración ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '1rem', padding: '1rem 2rem',
        background: 'white', borderTop: '1px solid #e2e8f0',
      }}>
        <button
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', padding: '0.875rem 2rem', fontSize: '1.1rem',
            fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: '#005f92', color: 'white',
            fontFamily: "'Nunito', 'Inter', sans-serif",
            transition: 'background 0.2s',
          }}
          onClick={() => onGameEnd(score)}
        >
          ← Anterior
        </button>
        <button
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', padding: '0.875rem 2rem', fontSize: '1.1rem',
            fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: '#005f92', color: 'white',
            fontFamily: "'Nunito', 'Inter', sans-serif",
            transition: 'background 0.2s',
          }}
          onClick={() => { stopTimer(); if (onFinishConfig) onFinishConfig(); }}
        >
          Terminar Configuración →
        </button>
      </div>

    </div>

  );
};
// ── Estilos del Summary (idénticos a Encriptacion) ──────────────────────
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
    .summary-screen .btn-primary-summary {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.5rem !important;
        padding: 0.75rem 1.5rem !important;
        border-radius: 0.5rem !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        border: none !important;
        background: #005f92 !important;
        background-color: #005f92 !important;
        color: white !important;
        font-size: 1rem !important;
        text-transform: none !important;
        width: auto !important;
        margin-top: 0 !important;
        box-shadow: none !important;
    }
    .summary-screen .btn-primary-summary:hover:not(:disabled) {
        background: #004a73 !important;
        background-color: #004a73 !important;
        transform: translateY(-1px);
    }
    .summary-screen .btn-primary-summary:disabled {
        opacity: 0.6 !important;
        cursor: not-allowed !important;
    }
    .summary-screen .btn-success {
        background: #005f92 !important;
        background-color: #005f92 !important;
        color: white !important;
    }
    .summary-screen .btn-success:hover:not(:disabled) {
        background: #004a73 !important;
        background-color: #004a73 !important;
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
// --- ANDROID: CONFIGURACIÓN Y GENERACIÓN DE APPLICATION ID ÚNICO ---
const ANDROID_BUILD_GRADLE_PATH = "android/app/build.gradle";
const CAPACITOR_CONFIG_PATH = "android/app/src/main/assets/capacitor.config.json";
const ANDROID_STRINGS_PATH = "android/app/src/main/res/values/strings.xml";
const BLOCKLY_APPLICATION_ID_BASE = "io.blockly.steam";

const createUuidSegment = () => {
  const rawUuid = window.crypto?.randomUUID?.()
    || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  const uuid = rawUuid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
  return `uuid_${uuid}`;
};

const buildBlocklyApplicationId = () => {
  return `${BLOCKLY_APPLICATION_ID_BASE}.${createUuidSegment()}`;
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

const applyBlocklyAndroidMetadata = async (zip, { applicationId }) => {
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
const SummaryPanel = ({ gameConfig, arEnabled, arSelectedStages, arConfig, onBack, state }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [statusText, setStatusText] = React.useState("Iniciando...");
  const [jsZipReady, setJsZipReady] = React.useState(false);

  React.useEffect(() => {
    if (window.JSZip) { setJsZipReady(true); return; }
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.async = true;
    script.onload = () => setJsZipReady(true);
    script.onerror = () => setStatusText("Error cargando librería ZIP");
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

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
        setProgress(90);
        setStatusText("Procesando recursos...");
        generateAndDownloadZip();
      } else {
        if (currentProgress > 20 && currentProgress < 50) setStatusText("Generando código HTML...");
        if (currentProgress >= 50 && currentProgress < 80) setStatusText("Incrustando recursos...");
        setProgress(currentProgress);
      }
    }, 200);
  };

  const blobUrlToDataUrl = async (url) => {
    if (!url || !url.startsWith('blob:')) return url;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch { return url; }
  };

  const resolveARConfig = async (cfg) => {
    if (!cfg || typeof cfg !== 'object') return cfg;
    const result = {};
    for (const stage of Object.keys(cfg)) {
      const stageCfg = cfg[stage] ?? {};
      result[stage] = {
        ...stageCfg,
        imageUrl: await blobUrlToDataUrl(stageCfg.imageUrl),
        audioUrl: await blobUrlToDataUrl(stageCfg.audioUrl),
        videoUrl: await blobUrlToDataUrl(stageCfg.videoUrl),
      };
    }
    return result;
  };

  const generateBlocklyGameHTML = (gameConfig, gameDetails, selectedPlatforms, arEnabled, arSelectedStages, arConfig) => {
    const rawDate = (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
    })();
    const formattedDate = (() => {
      try {
        const normalized = rawDate.includes('T') ? rawDate : rawDate + 'T00:00:00';
        return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch { return 'Fecha no especificada'; }
    })();

    const platformsString = selectedPlatforms?.length > 0
      ? selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
      : 'Web';

    const escHtml = (s = "") =>
      String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

    const difficulty = gameConfig?.difficulty || 'Básico';
    const challengeCount = gameConfig?.challenges || 3;
    const timeLimit = gameConfig?.time || 300;
    const gameName = gameDetails?.gameName || 'Blockly: Desafíos de Programación';

    // Datos de todos los desafíos embebidos
    const allChallenges = [
      { id: 'b1', title: 'Suma de dos números', description: 'Crea una función que reciba dos números y devuelva su suma.', instructions: ['Arrastra el bloque de "función" para empezar.', 'Añade dos argumentos (x, y) a tu función.', 'Usa el bloque de "devolver" de la categoría "Funciones".', 'Usa un bloque de "suma" de "Matemáticas" para sumar x e y.'], testCases: [{ input: [7, 2], expected: 9 }, { input: [5, 0], expected: 5 }, { input: [3, 1], expected: 4 }], difficulty: 'Básico', functionName: 'sumar' },
      { id: 'b2', title: 'Resta de dos números', description: 'Crea una función que reciba dos números y devuelva su resta (el primero menos el segundo).', instructions: ['Define una función con dos argumentos (a, b).', 'Devuelve el resultado de "a - b" usando los bloques de "Matemáticas".'], testCases: [{ input: [10, 2], expected: 8 }, { input: [5, 5], expected: 0 }, { input: [3, 5], expected: -2 }], difficulty: 'Básico', functionName: 'restar' },
      { id: 'b3', title: '¿Es mayor que 10?', description: 'Crea una función que reciba un número y devuelva "verdadero" si es mayor que 10, y "falso" si no lo es.', instructions: ['Define una función con un argumento (num).', 'Usa un bloque "si... entonces... si no..." de "Lógica".', 'Usa un bloque de comparación de "Lógica" para ver si "num > 10".', 'Devuelve los bloques "verdadero" o "falso" de "Lógica".'], testCases: [{ input: [11], expected: true }, { input: [10], expected: false }, { input: [9], expected: false }, { input: [20], expected: true }], difficulty: 'Básico', functionName: 'esMayorQueDiez' },
      { id: 'b4', title: 'Contador del 1 al 10', description: 'Crea una función que devuelva un array (lista) con los números del 1 al 10.', instructions: ['Define una función sin argumentos.', 'Crea una variable "lista" y asígnale una "lista vacía" de "Listas".', 'Usa un bucle "contar con..." de "Bucles" para contar de 1 a 10.', 'Dentro del bucle, usa el bloque "en lista... añadir al final" de "Listas" para añadir la variable del bucle (i) a tu "lista".', 'Al final, devuelve la "lista".'], testCases: [{ input: [], expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }], difficulty: 'Básico', functionName: 'contarHastaDiez' },
      { id: 'b5', title: 'Mostrar mensaje', description: 'Crea una función que devuelva el texto "Hola Blockly".', instructions: ['Define una función sin argumentos.', 'Usa el bloque "devolver" de "Funciones".', 'Conéctale un bloque de texto de "Texto" con el valor "Hola Blockly".'], testCases: [{ input: [], expected: "Hola Blockly" }], difficulty: 'Básico', functionName: 'mostrarMensaje' },
      { id: 'i1', title: 'Encontrar el número mayor', description: 'Crea una función que reciba dos números y devuelva el mayor.', instructions: ['Define una función con dos argumentos (a, b).', 'Usa un bloque "si... entonces... si no..." de "Lógica".', 'Compara si "a > b"; si es verdadero devuelve "a", si no devuelve "b".'], testCases: [{ input: [5, 3], expected: 5 }, { input: [2, 8], expected: 8 }, { input: [4, 4], expected: 4 }], difficulty: 'Intermedio', functionName: 'encontrarMayor' },
      { id: 'i2', title: 'Suma de una lista', description: 'Crea una función que reciba una lista de números y devuelva su suma total.', instructions: ['Define una función con un argumento (lista).', 'Crea una variable "total" con valor 0.', 'Usa un bucle "para cada elemento" de "Bucles" para recorrer la lista.', 'Dentro del bucle, suma cada elemento a "total".', 'Devuelve "total".'], testCases: [{ input: [[1, 2, 3]], expected: 6 }, { input: [[10, 20]], expected: 30 }, { input: [[5]], expected: 5 }], difficulty: 'Intermedio', functionName: 'sumarLista' },
      { id: 'i3', title: '¿Es par?', description: 'Crea una función que devuelva true si el número es par.', instructions: ['Define una función con un argumento (num).', 'Usa el bloque de "módulo" (resto) de "Matemáticas" para calcular "num % 2".', 'Devuelve verdadero si el resultado es igual a 0, falso si no.'], testCases: [{ input: [4], expected: true }, { input: [7], expected: false }, { input: [0], expected: true }], difficulty: 'Intermedio', functionName: 'esPar' },
      { id: 'a1', title: 'Fibonacci', description: 'Crea una función que devuelva el n-ésimo número de Fibonacci.', instructions: ['Define una función con un argumento (n).', 'Caso base: si n es 0 devuelve 0; si n es 1 devuelve 1.', 'Para otros casos, devuelve fibonacci(n-1) + fibonacci(n-2) usando llamadas recursivas o un bucle con variables.'], testCases: [{ input: [0], expected: 0 }, { input: [1], expected: 1 }, { input: [5], expected: 5 }, { input: [7], expected: 13 }], difficulty: 'Avanzado', functionName: 'fibonacci' },
      { id: 'a2', title: 'Encontrar el Máximo de una Lista', description: 'Crea una función que reciba una lista y devuelva el número más grande.', instructions: ['Define una función con un argumento (lista).', 'Crea una variable "maximo" y asígnale el primer elemento de la lista.', 'Usa un bucle "para cada elemento" para recorrer la lista.', 'Dentro del bucle, si el elemento actual es mayor que "maximo", actualiza "maximo".', 'Al final, devuelve "maximo".'], testCases: [{ input: [[1, 5, 2, 8, 3]], expected: 8 }, { input: [[-10, -5, -2]], expected: -2 }], difficulty: 'Avanzado', functionName: 'encontrarMaximo' },
    ];

    const difficultyMap = { 'Básico': 'Básico', 'Intermedio': 'Intermedio', 'Avanzado': 'Avanzado' };
    const filtered = allChallenges.filter(c => c.difficulty === (difficultyMap[difficulty] || 'Básico')).slice(0, challengeCount);
    const challengesJSON = JSON.stringify(filtered);

    const buildStageData = (stage) => {
      if (!arEnabled || !arSelectedStages?.[stage]) return 'null';
      const cfg = arConfig?.[stage] ?? {};
      const text = cfg.text?.trim() || '';
      const imageUrl = cfg.imageUrl?.trim() || '';
      const audioUrl = cfg.audioUrl?.trim() || '';
      const videoUrl = cfg.videoUrl?.trim() || '';
      if (!text && !imageUrl && !audioUrl && !videoUrl) return 'null';
      return JSON.stringify({ text, imageUrl, audioUrl, videoUrl });
    };

    const arAciertoData = buildStageData('Acierto');
    const hasArAcierto = arAciertoData !== 'null';

    const formatMinutes = (secs) => {
      const m = Math.floor(secs / 60), s = secs % 60;
      return m + ':' + String(s).padStart(2, '0');
    };

    const scriptClose = ['<', '/script>'].join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escHtml(gameName)} - ${escHtml(difficulty)}</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11">${scriptClose}
    <script src="https://unpkg.com/blockly/blockly.min.js">${scriptClose}
    <script src="https://unpkg.com/blockly/msg/es.js">${scriptClose}
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Merriweather:wght@700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #005f92;
            --secondary-color: #1f2937;
            --success-color: #22c55e;
            --danger-color: #ef4444;
            --light-gray: #f3f4f6;
            --medium-gray: #d1d5db;
            --dark-text: #111827;
            --light-text: #ffffff;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', 'Nunito', sans-serif; }
        body { background: #f0f2f5; min-height: 100vh; }

        /* ── Overlays ── */
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.97); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; padding: 20px; box-sizing: border-box; }
        .hidden { display: none !important; }

        /* ── Título animado ── */
.game-title { text-align: center; font-size: 3rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 0.25rem; margin-top: 1.5rem; display: flex; justify-content: center; flex-wrap: wrap; font-family: 'Merriweather', serif; }
        .game-title span { display: inline-block; animation: wave-animation 1.8s infinite; }
        .game-title.static span { animation: none; }
        @keyframes wave-animation { 0%,40%,100%{transform:translateY(0)} 20%{transform:translateY(-18px)} }

        /* ── Botones ── */
        .big-btn { padding: 1rem 2rem; font-size: 1.2rem; font-weight: bold; background: var(--primary-color); color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; min-width: 200px; font-family: 'Nunito', sans-serif; }
        .big-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .big-btn.btn-exit { background: #1f2937; }
        .big-btn.btn-retry { background: var(--primary-color); }
        .big-btn.btn-success { background: #16a34a; }

        /* ── Countdown ── */
        .countdown-number { font-size: 7rem; font-weight: 800; color: var(--primary-color); animation: popIn 0.5s ease-out; font-family: 'Nunito', sans-serif; }
        @keyframes popIn { 0%{transform:scale(0);opacity:0} 80%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }

        /* ── Game Layout ── */
        .game-wrapper { display: grid; grid-template-columns: 260px 1fr 260px; gap: 0.75rem; padding: 0.75rem; height: 100vh; box-sizing: border-box; }
        @media(max-width:900px){ .game-wrapper { grid-template-columns: 1fr; height: auto; } }

        .left-col { display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto; max-height: calc(100vh - 16px); }
        .center-col { display: flex; flex-direction: column; background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; height: calc(100vh - 16px); }
        .right-col { display: flex; flex-direction: column; gap: 0.75rem; max-height: calc(100vh - 16px); }

        /* ── Challenge card ── */
        .challenge-card { background: white; border-radius: 12px; padding: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .challenge-card h3 { font-size: 1.05rem; font-weight: 700; color: #023e8a; margin: 0 0 0.5rem; }
        .challenge-card p { font-size: 0.87rem; color: #475569; margin: 0 0 0.75rem; line-height: 1.5; }
        .test-label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0077b6; margin-bottom: 0.4rem; }
        .test-cases { background: #f8fafc; border-radius: 8px; padding: 0.65rem; font-family: monospace; font-size: 0.78rem; border: 1px solid #e2e8f0; }
        .test-cases .t-input { color: #64748b; margin-bottom: 2px; }
        .test-cases .t-expected { color: #1e40af; font-weight: 600; margin-bottom: 6px; }
        .test-cases .t-expected:last-child { margin-bottom: 0; }

        /* ── Blockly workspace ── */
        #blockly-workspace { flex: 1; width: 100%; }

        /* ── Stats block (igual que CalculadoraMental) ── */
        .stats-block { border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .stats-block h3 { margin: 0 0 0.75rem; font-size: 0.9rem; font-weight: 700; color: #1f2937; padding-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; }
        .stats-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.55rem; font-size: 0.87rem; color: #64748b; }
        .stats-item:last-child { margin-bottom: 0; }
        .stats-item strong { font-weight: 700; color: #023e8a; font-size: 0.92rem; }
        .timer-urgent { color: #ef4444 !important; animation: pulse 0.8s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.55} }

        /* ── Progress bar ── */
        .progress-wrap { width: 100%; height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary-color); border-radius: 999px; transition: width 0.4s; }

        /* ── Result panel ── */
        .result-panel { background: white; border-radius: 12px; padding: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); flex: 1; display: flex; flex-direction: column; gap: 0.65rem; }
        .result-panel h3 { font-size: 0.9rem; font-weight: 700; color: #1f2937; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
        .run-btn { width: 100%; background: #16a34a; color: white; font-weight: 700; padding: 0.7rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
        .run-btn:hover { background: #15803d; }
        .console { flex: 1; background: #1e293b; color: white; font-family: monospace; font-size: 0.78rem; border-radius: 8px; padding: 0.7rem; overflow-y: auto; min-height: 100px; white-space: pre-wrap; word-break: break-word; }
        .console .console-hint { color: #94a3b8; margin: 0; }
        .console .console-success { color: #4ade80; margin: 0; }
        .console .console-error { color: #f87171; margin: 0; }

        /* ── Finish btn ── */
        .finish-btn { width: 100%; background: #ef4444; color: white; font-weight: 700; padding: 0.7rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
        .finish-btn:hover { background: #dc2626; }

        /* ── End screen ── */
        .end-buttons { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-top: 1.5rem; }
        #end-title { font-size: 2.5rem; font-weight: 800; color: var(--primary-color); margin-bottom: 0.5rem; text-align: center; font-family: 'Nunito', sans-serif; }

        /* ── Info modal ── */
        .info-modal-content { background: white; padding: 2rem; border-radius: 1rem; max-width: 560px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.12); border: 1px solid #e5e7eb; position: relative; }
        .info-header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.25rem; margin-bottom: 1.25rem; }
        .info-title { font-size: 1.5rem; color: var(--primary-color); margin: 0; font-weight: 800; font-family: 'Nunito', sans-serif; }
        .info-subtitle { color: #64748b; font-size: 0.88rem; margin-top: 0.4rem; }
        .info-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
        .info-item { background: #f8fafc; padding: 0.85rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .info-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.2rem; font-weight: 600; }
        .info-value { font-size: 1rem; color: #334155; font-weight: 500; }
        .close-info-btn { position: absolute; top: 0.85rem; right: 0.85rem; background: transparent; border: none; font-size: 1.4rem; cursor: pointer; color: #94a3b8; }
        @media(max-width:600px){ .info-details-grid { grid-template-columns: 1fr; } }

        /* ── Botón instrucciones ── */
        .instructions-btn { width: 100%; margin-top: 0.75rem; background: #0077b6; color: white; font-weight: 700; padding: 0.6rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.88rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; transition: background 0.2s; font-family: 'Nunito', 'Inter', sans-serif; }
        .instructions-btn:hover { background: #005f92; }

        /* ── Modal instrucciones ── */
        .instr-overlay { display: none; position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; padding: 1rem; }
        .instr-overlay.active { display: flex; }
        .instr-modal { background: white; border-radius: 16px; padding: 2rem; max-width: 480px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.25); position: relative; max-height: 85vh; overflow-y: auto; }
        .instr-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .instr-modal-title { margin: 0; color: #023e8a; font-size: 1.1rem; font-weight: 700; font-family: 'Nunito', sans-serif; }
        .instr-modal-close { background: none; border: none; cursor: pointer; font-size: 1.4rem; color: #94a3b8; line-height: 1; }
        .instr-modal-desc { color: #475569; font-size: 0.88rem; margin-bottom: 1.25rem; line-height: 1.5; }
        .instr-modal-steps-label { font-weight: 700; color: #0077b6; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
        .instr-modal-steps { margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
        .instr-modal-steps li { color: #334155; font-size: 0.87rem; line-height: 1.5; }
        .instr-modal-confirm { margin-top: 1.5rem; width: 100%; background: #0077b6; color: white; font-weight: 700; padding: 0.7rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.95rem; font-family: 'Nunito', 'Inter', sans-serif; transition: background 0.2s; }
        .instr-modal-confirm:hover { background: #005f92; }

        /* ── AR Overlay ── */
        .ar-overlay-screen { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10,15,40,0.92); backdrop-filter: blur(6px); z-index: 50; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; padding: 2rem; box-sizing: border-box; overflow-y: auto; }
        .ar-overlay-screen.active { display: flex; }
        .ar-card { width: 100%; max-width: 860px; background: linear-gradient(145deg, #03045e 0%, #023e8a 50%, #0077b6 100%); border-radius: 1.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.5); overflow: visible; }
        .blockly-ar-bg { position: relative; min-height: 380px; width: 100%; background: linear-gradient(135deg, #0077b6 0%, #023e8a 100%); overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.2rem; padding: 1.5rem 1rem; border-radius: 24px; }
        .blockly-ar-bg-elements { position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%); pointer-events: none; }
        .blockly-ar-content { position: relative; z-index: 2; width: 100%; padding: 0 1rem; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .ar-badge-html { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(144,224,239,0.15); border: 1px solid rgba(144,224,239,0.5); color: #90e0ef; padding: 0.35rem 1rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.04em; backdrop-filter: blur(4px); }
        .ar-stage-title { color: #ffffff; font-size: 1.4rem; font-weight: 800; text-align: center; text-shadow: 0 2px 12px rgba(0,150,255,0.4); font-family: 'Nunito', sans-serif; }
        .ar-multi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; width: 100%; }
        .ar-multi-grid > *:only-child { grid-column: 1 / -1; }
        .ar-multi-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
        .ar-three-container { width: 100%; height: 260px; background: transparent; overflow: visible; }
        .ar-three-container canvas { width: 100% !important; height: 100% !important; border-radius: 0.5rem; display: block; background: transparent !important; }
        .ar-audio-solo { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .ar-audio-icon { font-size: 3rem; }
        .ar-audio-player { width: 100%; border-radius: 8px; }
        .ar-continue-btn { margin-top: 0.5rem; }
    </style>
</head>
<body>

<!-- ===== PANTALLA INICIO ===== -->
<div id="start-screen" class="overlay">
    <div class="game-title static">
    <h2 class="info-title" style="font-size: 3.8rem; font-weight: 900; margin-bottom: 1rem; text-align: center; letter-spacing: -0.02em;">BloqCode</h2>

    </div>
    <div style="background:#e0f2fe;color:#0369a1;padding:0.5rem 1.2rem;border-radius:20px;font-weight:600;margin-bottom:2rem;display:inline-block;font-family:'Nunito',sans-serif;">
        Nivel: ${escHtml(difficulty)} &nbsp;·&nbsp; 
    </div>
    <div style="display:flex;flex-direction:column;gap:0.75rem;align-items:center;">
        <button class="big-btn" onclick="startGame()">▶ Iniciar Juego</button>
        <button class="big-btn" style="background:white;color:var(--primary-color);border:2px solid var(--primary-color);" onclick="toggleInfo(true)">ℹ Información</button>
    </div>
</div>

<!-- ===== COUNTDOWN ===== -->
<div id="countdown-screen" class="overlay hidden">
    <div id="countdown-display" class="countdown-number">5</div>
</div>

<!-- ===== INFO MODAL ===== -->
<div id="info-overlay" class="overlay hidden" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(2px);z-index:100;">
    <div class="info-modal-content">
        <button class="close-info-btn" onclick="toggleInfo(false)">&times;</button>
        <div class="info-header">
            <h2 class="info-title">${escHtml(gameName)}</h2>
            <div class="info-subtitle">Actividad configurada desde la plataforma STEAM-G</div>
        </div>
        <div class="info-details-grid">
            <div class="info-item"><span class="info-label">Autor</span><span class="info-value">${escHtml(gameDetails?.authorName || 'No especificado')}</span></div>
            <div class="info-item"><span class="info-label">Versión</span><span class="info-value">${escHtml(gameDetails?.version || '1.0.0')}</span></div>
            <div class="info-item"><span class="info-label">Fecha</span><span class="info-value">${formattedDate}</span></div>
            <div class="info-item" style="grid-column:1/-1"><span class="info-label">Descripción</span><span class="info-value" style="font-size:0.95rem;line-height:1.6;color:#475569;">${escHtml(gameDetails?.description || 'Sin descripción.')}</span></div>
            <div class="info-item"><span class="info-label">Nivel</span><span class="info-value">${escHtml(difficulty)}</span></div>
            <div class="info-item"><span class="info-label">Plataformas</span><span class="info-value">${escHtml(platformsString)}</span></div>
        </div>
        <div style="text-align:center;">
            <button class="big-btn" onclick="toggleInfo(false)">Cerrar</button>
        </div>
    </div>
</div>

<!-- ===== AR: ACIERTO ===== -->
${hasArAcierto ? `
<div id="ar-screen-acierto" class="ar-overlay-screen">
    <div class="ar-card">
        <div class="blockly-ar-bg" id="ar-bg-acierto">
            <div id="ar-bg-elements-acierto" class="blockly-ar-bg-elements"></div>
            <div class="blockly-ar-content">
                <span class="ar-badge-html">🥽 Realidad Aumentada — Acierto</span>
                <div class="ar-stage-title">¡Solución Correcta!</div>
                <div class="ar-multi-grid" id="ar-multi-acierto">
                    <div id="ar-text-acierto"  class="ar-three-container" style="display:none;"></div>
                    <div id="ar-image-acierto" class="ar-three-container" style="display:none;"></div>
                    <div id="ar-video-acierto" class="ar-three-container" style="display:none;"></div>
                </div>
                <audio id="ar-audio-acierto" style="display:none;" autoplay></audio>
            </div>
        </div>
    </div>
    <button class="big-btn ar-continue-btn" onclick="afterARAcierto()">Continuar →</button>
</div>` : ''}

<!-- ===== GAME UI ===== -->
<div class="container" id="game-ui" style="display:none;">
    ${`<div class="game-title">
        ${'Juego de BloqCode'.split('').map((ch, i) =>
      `<span style="animation-delay:${i * 0.07}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('')}
    </div>`}
    <div style="display:grid;grid-template-columns:1fr;max-width:600px;margin:0 auto 1.5rem auto;background:#eff6ff;border:1px solid #bfdbfe;border-radius:0.75rem;padding:0.85rem 1.25rem;text-align:center;">
        <span style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#64748b;margin-bottom:0.25rem;display:block;">📋 Reglas Básicas</span>
        <span style="font-size:1rem;color:#1e40af;font-weight:500;">Utiliza los bloques de las diferentes categorías y resuelve la problemática.</span>
    </div>
    <div class="game-wrapper">
        <!-- Columna izquierda: desafío -->
        <!-- Modal instrucciones -->
        <div id="instructions-overlay" class="instr-overlay" onclick="if(event.target===this)toggleInstructions(false)">
            <div class="instr-modal">
                <div class="instr-modal-header">
                    <h2 class="instr-modal-title" id="instr-modal-title">Instrucciones</h2>
                    <button class="instr-modal-close" onclick="toggleInstructions(false)">&times;</button>
                </div>
                <p class="instr-modal-desc" id="instr-modal-desc"></p>
                <div class="instr-modal-steps-label">Pasos a seguir:</div>
                <ol class="instr-modal-steps" id="instr-modal-steps"></ol>
                <button class="instr-modal-confirm" onclick="toggleInstructions(false)">¡Entendido!</button>
            </div>
        </div>

        <!-- Columna izquierda: desafío -->
        <div class="left-col">
            <div class="challenge-card">
                <h3 id="challenge-title">—</h3>
                <p id="challenge-desc">—</p>
                <div class="test-label">Casos de prueba</div>
                <div class="test-cases" id="test-cases-container"></div>
                <button class="instructions-btn" onclick="toggleInstructions(true)">📖 Instrucciones</button>
            </div>
        </div>
        <!-- Columna central: Blockly workspace -->
        <div class="center-col">
            <div id="blockly-workspace"></div>
        </div>
        <!-- Columna derecha: progreso + resultado + finalizar -->
        <div class="right-col">
            <div class="stats-block">
                <h3>Progreso</h3>
                <div class="progress-wrap" style="margin-bottom:0.75rem;"><div class="progress-fill" id="progress-bar" style="width:0%"></div></div>
                <div class="stats-item"><span>🎯 Nivel:</span><strong>${escHtml(difficulty)}</strong></div>
                <div class="stats-item"><span>⏱ Tiempo:</span><strong id="timer-display">${formatMinutes(timeLimit)}</strong></div>
                <div class="stats-item"><span>🧩 Desafío:</span><strong id="challenge-counter">1 / ${challengeCount}</strong></div>
                <div class="stats-item"><span>⭐ Puntuación:</span><strong id="score-display">0</strong></div>
            </div>
            <div class="result-panel">
                <h3>Resultado</h3>
                <button class="run-btn" onclick="executeCode()">▶ Ejecutar Solución</button>
                <div class="console" id="console-output"><p class="console-hint">&gt; Esperando ejecución...</p></div>
            </div>
            <button class="finish-btn" onclick="confirmFinish()">Finalizar Juego</button>
        </div>
    </div>
</div>

<!-- ===== END SCREEN ===== -->
<div id="end-screen" class="overlay hidden">
    <div class="game-title static">
        ${'BloqCode'.split('').map((ch, i) =>
      `<span style="animation-delay:${(i * 0.05)}s">${ch === ' ' ? '&nbsp;' : escHtml(ch)}</span>`
    ).join('')}
    </div>
    <h1 id="end-title">¡Juego Completado!</h1>
    <h2 style="color:var(--secondary-color);font-size:1.8rem;margin:1rem 0;font-family:'Nunito',sans-serif;">
        Puntuación: <span id="final-score">0</span> pts
    </h2>
    <div class="end-buttons">
        <button class="big-btn btn-exit" onclick="exitGame()">Salir</button>
        <button class="big-btn btn-retry" onclick="restartGame()">Volver a Jugar</button>
    </div>
</div>

<script>
// ===== DATOS =====
const CHALLENGES = ${challengesJSON};
const GAME_NAME = "${escHtml(gameName)}";
const HAS_AR_ACIERTO = ${hasArAcierto};
const AR_DATA = { Acierto: ${arAciertoData} };
const TOTAL_TIME = ${timeLimit};
const BLOCKLY_SYMBOLS = ['{ }','< >','( )','[ ]','=>','++','&&','||'];

// ===== ESTADO =====
let gameChallenges = [];
let currentIdx = 0;
let score = 0;
let timeLeft = TOTAL_TIME;
let timerInterval = null;
let generatedCode = '';
let pendingNextCallback = null;
let arCleanups = {};
let workspace = null;

// ===== UTILIDADES =====
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function setActiveScreen(id) {
    ['start-screen','countdown-screen','game-ui','end-screen','ar-screen-acierto'].forEach(sid => {
        const el = document.getElementById(sid);
        if (!el) return;
        if (sid === 'game-ui') {
            el.style.display = (sid === id) ? 'block' : 'none';
        } else if (el.classList.contains('ar-overlay-screen')) {
            el.classList.toggle('active', sid === id);
            el.style.display = (sid === id) ? 'flex' : 'none';
        } else {
            el.classList.toggle('hidden', sid !== id);
            if (sid !== id) el.style.display = 'none';
            else el.style.display = '';
        }
    });
}

function formatTime(secs) {
    const m = Math.floor(secs / 60), s = secs % 60;
    return m + ':' + String(s).padStart(2,'0');
}

function toggleInfo(show) {
    const modal = document.getElementById('info-overlay');
    if (show) { modal.classList.remove('hidden'); modal.style.display = 'flex'; }
    else { modal.classList.add('hidden'); setTimeout(() => modal.style.display='none', 200); }
}

// ===== TIMER =====
function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        timeLeft--;
        const el = document.getElementById('timer-display');
        if (el) {
            el.textContent = formatTime(timeLeft);
            el.className = timeLeft <= 30 ? 'timer-urgent' : '';
        }
        if (timeLeft <= 0) {
            stopTimer();
            Swal.fire({ title: '⏰ ¡Tiempo agotado!', text: 'Se acabó el tiempo. Puntuación: ' + score + ' pts', icon: 'info', allowOutsideClick: false })
                .then(() => showEndScreen(false));
        }
    }, 1000);
}
function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

// ===== BLOCKLY =====
const toolboxXml = \`
  <xml>
    <category name="Lógica" colour="#5C81A6">
      <block type="controls_if"></block>
      <block type="logic_compare"></block>
      <block type="logic_operation"></block>
      <block type="logic_negate"></block>
      <block type="logic_boolean"></block>
    </category>
    <category name="Bucles" colour="#5CA65C">
      <block type="controls_repeat_ext"></block>
      <block type="controls_whileUntil"></block>
      <block type="controls_for"></block>
      <block type="controls_forEach"></block>
    </category>
    <category name="Matemáticas" colour="#5C68A6">
      <block type="math_number"></block>
      <block type="math_arithmetic"></block>
      <block type="math_single"></block>
      <block type="math_modulo"></block>
      <block type="math_constrain"></block>
    </category>
    <category name="Texto" colour="#5CA68D">
      <block type="text"></block>
      <block type="text_join"></block>
      <block type="text_length"></block>
      <block type="text_changeCase"></block>
    </category>
    <category name="Listas" colour="#745CA6">
      <block type="lists_create_empty"></block>
      <block type="lists_create_with"></block>
      <block type="lists_repeat"></block>
      <block type="lists_length"></block>
      <block type="lists_isEmpty"></block>
      <block type="lists_getIndex"></block>
      <block type="lists_setIndex"></block>
    </category>
    <sep></sep>
    <category name="Variables" colour="#A6745C" custom="VARIABLE"></category>
    <category name="Funciones" colour="#9A5CA6" custom="PROCEDURE"></category>
  </xml>
\`;

function initBlockly() {
    const container = document.getElementById('blockly-workspace');
    if (!container || !window.Blockly) return;
    workspace = Blockly.inject(container, {
        toolbox: toolboxXml,
        scrollbars: true,
        trashcan: true,
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        zoom: { controls: true, wheel: true, startScale: 1.0 }
    });
    if (Blockly.JavaScript) {
        workspace.addChangeListener(() => {
            generatedCode = Blockly.JavaScript.workspaceToCode(workspace);
        });
    }
    const handleResize = () => { if (workspace) Blockly.svgResize(workspace); };
    window.addEventListener('resize', handleResize);
    handleResize();
}

// ===== GAME FLOW =====
function startGame() {
    gameChallenges = shuffle(CHALLENGES).slice(0, ${challengeCount});
    currentIdx = 0; score = 0; timeLeft = TOTAL_TIME;
    document.getElementById('score-display').textContent = '0';
    const timerEl = document.getElementById('timer-display');
    if (timerEl) { timerEl.textContent = formatTime(timeLeft); timerEl.className = ''; }
    startCountdown();
}

function startCountdown() {
    setActiveScreen('countdown-screen');
    let n = 5;
    const el = document.getElementById('countdown-display');
    el.textContent = n;
    const iv = setInterval(() => {
        n--;
        if (n > 0) { el.textContent = n; el.style.animation='none'; el.offsetHeight; el.style.animation='popIn 0.5s ease-out'; }
        else {
            clearInterval(iv);
            setActiveScreen('game-ui');
            if (!workspace) initBlockly();
            else { Blockly.mainWorkspace && Blockly.mainWorkspace.clear ? Blockly.mainWorkspace.clear() : workspace.clear(); }
            loadChallenge();
            startTimer();
        }
    }, 1000);
}

function toggleInstructions(show) {
    const overlay = document.getElementById('instructions-overlay');
    if (show) {
        const ch = gameChallenges[currentIdx];
        if (!ch) return;
        document.getElementById('instr-modal-title').textContent = '📖 ' + ch.title;
        document.getElementById('instr-modal-desc').textContent = ch.description;
        const stepsList = document.getElementById('instr-modal-steps');
        stepsList.innerHTML = (ch.instructions || []).map(step => '<li>' + step + '</li>').join('');
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function loadChallenge() {
    const ch = gameChallenges[currentIdx];
    if (!ch) return;

    document.getElementById('challenge-title').textContent = ch.title;
    document.getElementById('challenge-desc').textContent = ch.description;
    document.getElementById('challenge-counter').textContent = (currentIdx + 1) + ' / ' + gameChallenges.length;
    document.getElementById('progress-bar').style.width = (currentIdx / gameChallenges.length * 100) + '%';
    document.getElementById('console-output').innerHTML = '<p class="console-hint">&gt; Esperando ejecución...</p>';

    const tcContainer = document.getElementById('test-cases-container');
    tcContainer.innerHTML = ch.testCases.map(tc =>
        '<div><p class="t-input">Entrada: [' + tc.input.join(', ') + ']</p>' +
        '<p class="t-expected">Esperado: ' + JSON.stringify(tc.expected) + '</p></div>'
    ).join('');

    generatedCode = '';
    if (workspace) workspace.clear();
    toggleInstructions(false);
}

function executeCode() {
    const ch = gameChallenges[currentIdx];
    if (!ch) return;
    const consoleEl = document.getElementById('console-output');

    const funcMatch = generatedCode.match(/function\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*\\(/);
    if (!funcMatch) {
        consoleEl.innerHTML = '<p class="console-error">Error: No se encontró ninguna función en tu código. Asegúrate de definir una función con bloques.</p>';
        Swal.fire({ title: 'Solución incorrecta', text: 'Intenta nuevamente', icon: 'error' });
        return;
    }
    const detectedFunctionName = funcMatch[1];

    let allCorrect = true;
    let logs = [];

    try {
        const fixedCode = generatedCode.replace(
            new RegExp('function\\\\s+' + detectedFunctionName + '\\\\s*\\\\('),
            'var ' + detectedFunctionName + ' = function('
        );
        const fn = new Function(fixedCode + ' return ' + detectedFunctionName + ';')();
        for (const tc of ch.testCases) {
            const result = fn(...tc.input);
            const isCorrect = JSON.stringify(result) === JSON.stringify(tc.expected);
            if (!isCorrect) {
                allCorrect = false;
                logs.push('Falló: Entrada [' + tc.input.join(', ') + ']. Esperado: ' + JSON.stringify(tc.expected) + ', Recibido: ' + JSON.stringify(result));
                break;
            } else {
                logs.push('✓ Entrada [' + tc.input.join(', ') + '] → ' + JSON.stringify(result));
            }
        }
    } catch (err) {
        allCorrect = false;
        logs.push('Error de ejecución: ' + err.message);
    }

    consoleEl.innerHTML = logs.map(l =>
        '<p class="' + (l.startsWith('✓') ? 'console-success' : 'console-error') + '">' + l + '</p>'
    ).join('');

    if (allCorrect) {
        score += 10;
        document.getElementById('score-display').textContent = score;
        if (HAS_AR_ACIERTO) {
            pendingNextCallback = () => nextChallenge();
            setTimeout(() => { setActiveScreen('ar-screen-acierto'); initARScreen('Acierto'); }, 500);
        } else {
            Swal.fire({ title: '¡Correcto! +10 pts', icon: 'success', timer: 1200, showConfirmButton: false })
                .then(() => nextChallenge());
        }
    } else {
        Swal.fire({ title: 'Solución incorrecta', text: 'Revisa los casos de prueba e intenta nuevamente.', icon: 'error', confirmButtonText: 'Intentar de nuevo' });
    }
}

function nextChallenge() {
    currentIdx++;
    if (currentIdx < gameChallenges.length) {
        setActiveScreen('game-ui');
        if (workspace) workspace.clear();
        loadChallenge();
    } else {
        stopTimer();
        showEndScreen(true);
    }
}

function confirmFinish() {
    stopTimer();
    Swal.fire({
        title: '¿Finalizar el juego?',
        text: 'Finalizarás con tu puntuación actual: ' + score + ' pts',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#0077b6',
        confirmButtonText: 'Sí, finalizar',
        cancelButtonText: 'Cancelar'
    }).then(r => {
        if (r.isConfirmed) showEndScreen(false);
        else startTimer();
    });
}

function showEndScreen(completed) {
    setActiveScreen('end-screen');
    document.getElementById('final-score').textContent = score;
    document.getElementById('end-title').textContent = completed ? '¡Felicidades, lo lograste!' : 'Fin del Juego';
    document.getElementById('progress-bar').style.width = '100%';
}

function restartGame() { startGame(); }
function exitGame() {
    window.close();
    Swal.fire({ title: 'Juego Finalizado', text: 'Por favor cierra esta pestaña.', icon: 'info', confirmButtonText: 'Entendido' });
}

// ===== AR =====
function createFloatingSymbols(container) {
    if (!container) return () => {};
    const created = [];
    BLOCKLY_SYMBOLS.forEach((sym, idx) => {
        const el = document.createElement('div');
        el.textContent = sym;
        const size = Math.random()*26+18, dur=Math.random()*5+5, left=Math.random()*80+10, top=Math.random()*80+10;
        const dx=Math.random()*30-15, dy=Math.random()*30-15, rot=Math.random()*30-15;
        const aName='blkFloat_'+Date.now()+'_'+idx;
        const kf=document.createElement('style');
        kf.textContent='@keyframes '+aName+'{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate('+dx+'px,'+dy+'px) rotate('+rot+'deg)}}';
        document.head.appendChild(kf);
        el.style.cssText='position:absolute;color:rgba(255,255,255,0.22);font-size:'+size+'px;font-family:monospace;animation:'+aName+' '+dur+'s ease-in-out infinite;left:'+left+'%;top:'+top+'%;pointer-events:none;z-index:1;user-select:none;';
        container.appendChild(el);
        created.push({el,kf});
    });
    return () => created.forEach(({el,kf})=>{el.remove();kf.remove();});
}

const _loadScript = src => new Promise((res,rej)=>{
    if (document.querySelector('script[src="'+src+'"]')){res();return;}
    const s=document.createElement('script');s.src=src;s.async=true;s.onload=res;s.onerror=()=>rej(new Error('Error: '+src));document.body.appendChild(s);
});
let _threePromise=null;
function loadThree(){
    if(window.THREE)return Promise.resolve(window.THREE);
    if(_threePromise)return _threePromise;
    _threePromise=_loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
        .then(()=>window.THREE||_loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js').then(()=>window.THREE))
        .catch(()=>_loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js').then(()=>window.THREE));
    return _threePromise;
}
let _addonsPromise=null;
function loadThreeAddons(){
    if(_addonsPromise)return _addonsPromise;
    _addonsPromise=loadThree().then(()=>
        _loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/FontLoader.js')
        .then(()=>_loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/geometries/TextGeometry.js'))
        .then(()=>({THREE:window.THREE,FontLoader:window.THREE?.FontLoader??null,TextGeometry:window.THREE?.TextGeometry??null}))
    );
    return _addonsPromise;
}

function initThreeForType(container, type, content) {
    let disposed=false,renderer,scene,camera,frameId,videoEl;
    let portalGroup,portalFrameGroup,portalGlow,portalParticles,portalParticleMeta;
    const enableRootSpin=type!=='Video', planeBaseSize=type==='Video'?3.6:1.8;
    const cleanup=()=>{
        disposed=true;
        if(frameId)cancelAnimationFrame(frameId);
        if(videoEl){videoEl.pause();videoEl.src='';videoEl.load();}
        if(scene)scene.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material)[].concat(obj.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose();});});
        if(renderer){renderer.dispose();renderer.domElement?.parentNode?.removeChild(renderer.domElement);}
    };
    loadThree().then(THREE=>{
        if(disposed||!container)return;
        const w=container.clientWidth||360,h=container.clientHeight||240;
        scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(50,w/h,0.1,100);
        camera.position.z=type==='Video'?3.2:2.5;
        renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
        renderer.setSize(w,h);renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
        renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,0);
        container.innerHTML='';container.appendChild(renderer.domElement);
        const root=new THREE.Group();scene.add(root);
        const createGlowTex=()=>{const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');const g=ctx.createRadialGradient(128,128,10,128,128,128);g.addColorStop(0,'rgba(99,102,241,0.45)');g.addColorStop(0.45,'rgba(129,140,248,0.2)');g.addColorStop(1,'rgba(165,180,252,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;};
        const pfMat=new THREE.MeshStandardMaterial({color:0xa5b4fc,emissive:0x6366f1,emissiveIntensity:0.85,roughness:0.2,metalness:0.2,transparent:true,opacity:0.95});
        const buildPortalFrame=(fw,fh)=>{if(!portalFrameGroup)return;portalFrameGroup.children.forEach(c=>c.geometry?.dispose());portalFrameGroup.clear();const t=0.09,d=0.18,hw=fw/2,hh=fh/2;[[fw+t*2,t,d,0,hh+t/2,0],[fw+t*2,t,d,0,-hh-t/2,0],[t,fh,d,-hw-t/2,0,0],[t,fh,d,hw+t/2,0,0]].forEach(([bw,bh,bd,x,y,z])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),pfMat);m.position.set(x,y,z);portalFrameGroup.add(m);});};
        if(type==='Texto'||type==='Texto3D'){
            scene.add(new THREE.AmbientLight(0xffffff,1.2));const dir=new THREE.DirectionalLight(0xffffff,1.5);dir.position.set(2,3,4);scene.add(dir);
            loadThreeAddons().then(({FontLoader,TextGeometry})=>{
                if(disposed)return;
                const loader=new FontLoader();
                const buildMeshes=font=>{const tg=new THREE.Group();root.add(tg);const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.1,metalness:0,emissive:0xffffff,emissiveIntensity:0.2});const lines=String(content||'').split(/\\r?\\n/);const widths=[];lines.forEach((line,i)=>{const geo=new TextGeometry(line||' ',{font,size:0.3,height:0.08,curveSegments:12,bevelEnabled:true,bevelThickness:0.01,bevelSize:0.008,bevelSegments:3});geo.computeBoundingBox();const gw=(geo.boundingBox.max.x-geo.boundingBox.min.x)||1;widths.push(gw);const mesh=new THREE.Mesh(geo,mat);mesh.position.x=-gw/2;mesh.position.y=((lines.length-1)/2-i)*(0.3*1.35);tg.add(mesh);});const mw=Math.max(...widths,1);tg.scale.setScalar(Math.min(1,1.4/mw));};
                loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',buildMeshes,undefined,()=>loader.load('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/fonts/helvetiker_regular.typeface.json',buildMeshes,undefined,()=>{if(!disposed){const c2=document.createElement('canvas');c2.width=512;c2.height=256;const ctx=c2.getContext('2d');ctx.fillStyle='rgba(255,255,255,0.9)';ctx.fillRect(0,0,512,256);ctx.fillStyle='#0b2a4a';ctx.font='48px Arial';ctx.fillText(String(content||'').substring(0,20),20,80);const t=new THREE.CanvasTexture(c2);t.colorSpace=THREE.SRGBColorSpace;root.add(new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.9),new THREE.MeshBasicMaterial({map:t,transparent:true})));}}));
            }).catch(()=>{});
        } else if(type==='Imagen'){
            const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
            loader.load(content,tex=>{if(disposed)return;tex.colorSpace=THREE.SRGBColorSpace;const asp=tex.image.width/tex.image.height;const pw=asp>=1?1.8:1.8*asp,ph=asp>=1?1.8/asp:1.8;const plane=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshBasicMaterial({map:tex,transparent:true}));root.add(plane);const bt=tex.clone();bt.colorSpace=THREE.SRGBColorSpace;bt.wrapS=THREE.RepeatWrapping;bt.repeat.x=-1;bt.offset.x=1;bt.needsUpdate=true;const back=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshBasicMaterial({map:bt,transparent:true}));back.rotation.y=Math.PI;root.add(back);},undefined,()=>{if(!disposed){const img=document.createElement('img');img.src=content;img.style.cssText='max-width:100%;max-height:180px;border-radius:0.5rem;display:block;margin:0 auto;';container.innerHTML='';container.appendChild(img);}});
        } else if(type==='Video'){
            const plane=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true}));
            const fitAsp=asp=>{const pw=asp>=1?planeBaseSize:planeBaseSize*asp,ph=asp>=1?planeBaseSize/asp:planeBaseSize;plane.scale.set(pw,ph,1);if(portalGlow)portalGlow.scale.set(pw*1.3,ph*1.3,1);buildPortalFrame(pw,ph);};
            videoEl=document.createElement('video');videoEl.src=content;videoEl.crossOrigin='anonymous';videoEl.loop=true;videoEl.muted=true;videoEl.playsInline=true;videoEl.preload='auto';
            const vtex=new THREE.VideoTexture(videoEl);vtex.colorSpace=THREE.SRGBColorSpace;
            plane.material=new THREE.MeshBasicMaterial({map:vtex,transparent:true,opacity:0.96});
            scene.add(new THREE.AmbientLight(0xffffff,0.35));const rim=new THREE.PointLight(0x7ffcff,1.1);rim.position.set(2.5,2.2,3.5);scene.add(rim);
            portalGroup=new THREE.Group();plane.position.z=-0.06;portalGroup.add(plane);
            const gt=createGlowTex();if(gt){const gm=new THREE.MeshBasicMaterial({map:gt,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});portalGlow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),gm);portalGlow.position.z=-0.14;portalGroup.add(portalGlow);}
            portalFrameGroup=new THREE.Group();portalGroup.add(portalFrameGroup);
            const pc=160;const pos=new Float32Array(pc*3);portalParticleMeta=[];
            for(let i=0;i<pc;i++){const a=Math.random()*Math.PI*2,r=0.85+Math.random()*0.35,dp=(Math.random()-0.5);portalParticleMeta.push({angle:a,radius:r,depth:dp});pos[i*3]=Math.cos(a)*r;pos[i*3+1]=Math.sin(a)*r;pos[i*3+2]=dp*0.4;}
            const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
            const pm=new THREE.PointsMaterial({color:0xa5b4fc,size:0.05,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending});
            portalParticles=new THREE.Points(pg,pm);portalGroup.add(portalParticles);root.add(portalGroup);
            fitAsp(16/9);videoEl.addEventListener('loadedmetadata',()=>{if(videoEl.videoWidth&&videoEl.videoHeight)fitAsp(videoEl.videoWidth/videoEl.videoHeight);});
            videoEl.play().catch(()=>{});container.addEventListener('click',()=>{if(videoEl.paused){videoEl.muted=false;videoEl.play().catch(()=>{});}else videoEl.pause();});
        } else if(type==='Audio'){
            const noteMat=new THREE.MeshStandardMaterial({color:0xa5b4fc,emissive:0x6366f1,emissiveIntensity:0.5,roughness:0.2,metalness:0.1});
            const noteGroup=new THREE.Group();const head=new THREE.Mesh(new THREE.SphereGeometry(0.22,24,24),noteMat);head.position.set(-0.15,-0.1,0);noteGroup.add(head);const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.8,12),noteMat);stem.position.set(0.1,0.35,0);noteGroup.add(stem);const flag=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.12,0.08),noteMat);flag.position.set(0.35,0.68,0);flag.rotation.z=-0.35;noteGroup.add(flag);noteGroup.scale.set(2,2,2);scene.add(noteGroup);scene.add(new THREE.AmbientLight(0xffffff,0.8));
            const listener=new THREE.AudioListener();camera.add(listener);const audioInst=new THREE.Audio(listener);const audioLoader=new THREE.AudioLoader();audioLoader.setCrossOrigin('anonymous');let audioAnalyser=null,notePulse=0;
            audioLoader.load(content,buffer=>{if(disposed)return;audioInst.setBuffer(buffer);audioInst.setLoop(true);audioInst.setVolume(0.6);audioAnalyser=new THREE.AudioAnalyser(audioInst,128);audioInst.play().catch(()=>{});},undefined,()=>{if(!disposed)container.textContent='No se pudo cargar el audio.';});
            container.addEventListener('click',()=>{if(!audioInst.buffer)return;if(audioInst.isPlaying)audioInst.pause();else audioInst.play().catch(()=>{});});
            const animateAudio=()=>{if(disposed)return;frameId=requestAnimationFrame(animateAudio);if(audioAnalyser){const raw=audioAnalyser.getAverageFrequency()/255;notePulse+=(raw-notePulse)*0.15;noteGroup.scale.setScalar((1+notePulse*0.5)*2);noteGroup.position.y=notePulse*0.35;}renderer.render(scene,camera);};animateAudio();return;
        }
        if(window.ResizeObserver){new ResizeObserver(()=>{if(!renderer||!camera||!container)return;const nw=container.clientWidth||360,nh=container.clientHeight||240;renderer.setSize(nw,nh);camera.aspect=nw/nh;camera.updateProjectionMatrix();}).observe(container);}
        const animate=()=>{if(disposed)return;if(enableRootSpin)root.rotation.y+=0.008;if(portalGroup){const now=performance.now();portalGroup.position.y=Math.sin(now*0.0011)*0.06;portalGroup.position.x=Math.cos(now*0.0009)*0.02;portalGroup.rotation.z=Math.sin(now*0.0006)*0.04;portalGroup.rotation.y=Math.cos(now*0.0005)*0.04;}if(portalParticles){portalParticles.rotation.z+=0.002;portalParticles.rotation.y+=0.001;}frameId=requestAnimationFrame(animate);renderer.render(scene,camera);};animate();
    }).catch(()=>{});
    return cleanup;
}

function initARScreen(stage) {
    const data = AR_DATA[stage]; if (!data) return;
    const sl = stage.toLowerCase();
    const bgEl = document.getElementById('ar-bg-elements-'+sl);
    const audioEl = document.getElementById('ar-audio-'+sl);
    const textEl  = document.getElementById('ar-text-'+sl);
    const imageEl = document.getElementById('ar-image-'+sl);
    const videoEl = document.getElementById('ar-video-'+sl);
    if (arCleanups[stage]) { arCleanups[stage](); arCleanups[stage]=null; }
    const stopSymbols = createFloatingSymbols(bgEl);
    const cleanThree = [];
    if (audioEl && data.audioUrl) { audioEl.src=data.audioUrl; audioEl.style.display='block'; audioEl.play().catch(()=>{}); }
    if (textEl  && data.text)     { textEl.style.display='block';  cleanThree.push(initThreeForType(textEl, 'Texto', data.text)); }
    if (imageEl && data.imageUrl) { imageEl.style.display='block'; cleanThree.push(initThreeForType(imageEl,'Imagen',data.imageUrl)); }
    if (videoEl && data.videoUrl) { videoEl.style.display='block'; cleanThree.push(initThreeForType(videoEl,'Video',data.videoUrl)); }
    arCleanups[stage]=()=>{ stopSymbols(); cleanThree.forEach(fn=>fn&&fn()); if(audioEl){audioEl.pause();audioEl.src='';} };
}

function cleanupARScreen(stage) {
    if (arCleanups[stage]) { arCleanups[stage](); arCleanups[stage]=null; }
}

function afterARAcierto() {
    cleanupARScreen('Acierto');
    if (pendingNextCallback) { pendingNextCallback(); pendingNextCallback=null; }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {});
<\/script>
</body>
</html>`;
  };

  const generateAndDownloadZip = async () => {
    if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

    const blobUrlToDataUrl = async (url) => {
      if (!url || !url.startsWith('blob:')) return url;
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch { return url; }
    };

    // NOTA: el HTML web (buildStageData en generateBlocklyGameHTML) espera el formato
    // plano Inicio/Acierto/Final + text/imageUrl/audioUrl/videoUrl. Usamos el
    // resolveARConfig plano (definido más arriba en SummaryPanel), NO el formato
    // {activo, contenido:{...}} en minúsculas que es exclusivo del JSON de Android
    // — de lo contrario buildStageData nunca encuentra contenido y la RA no se
    // activa en el HTML exportado.

    try {
      const zip = new window.JSZip();
      setStatusText("Procesando archivos multimedia...");
      const resolvedConfig = arEnabled && arConfig ? await resolveARConfig(arConfig) : {};
      setStatusText("Finalizando HTML...");
      const htmlContent = generateBlocklyGameHTML(
        gameConfig,
        state?.gameDetails ?? {},
        state?.selectedPlatforms ?? [],
        arEnabled,
        arEnabled ? (arSelectedStages ?? {}) : {},
        resolvedConfig
      );
      const gameDetails = state?.gameDetails ?? {};
      const htmlFileName = `${normalizeFileName(gameDetails?.gameName || 'bloqcode')}_v${(gameDetails?.version || '1.0').replace(/\s+/g, '')}.html`;
      zip.file(htmlFileName, htmlContent);
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${normalizeFileName(gameDetails?.gameName || 'bloqcode')}_web.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setProgress(100);
      setStatusText("¡Descarga iniciada!");
      setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
    } catch (error) {
      console.error("Error generando el ZIP:", error);
      setStatusText("Error al generar el archivo.");
      setIsGenerating(false);
    }
  };

  const handleDownloadAndroidZip = async () => {
    if (isGenerating || !jsZipReady) return;
    setIsGenerating(true);
    setProgress(0);
    setStatusText("Iniciando...");
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 10) + 2;
      if (currentProgress >= 90) {
        clearInterval(interval);
        setProgress(90);
        setStatusText("Inyectando configuración...");
        generateAndroidZip();
      } else {
        if (currentProgress > 20 && currentProgress < 50) setStatusText("Descargando plantilla Android...");
        if (currentProgress >= 50 && currentProgress < 80) setStatusText("Procesando configuraciones...");
        setProgress(currentProgress);
      }
    }, 200);
  };

  const generateAndroidZip = async () => {
    try {
      setStatusText("Descargando plantilla Android...");
      const response = await fetch('/templates/bloqcode_android.zip');
      if (!response.ok) {
        throw new Error("No se pudo descargar la plantilla base de Android");
      }
      const arrayBuffer = await response.arrayBuffer();

      setStatusText("Procesando archivos ZIP...");
      const zip = await window.JSZip.loadAsync(arrayBuffer);

      setStatusText("Inyectando configuración...");

      const blobUrlToDataUrl = async (url) => {
        if (!url || !url.startsWith('blob:')) return url;
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch { return url; }
      };

      const resolveARConfigFull = async (cfg, selectedStages) => {
        if (!cfg || typeof cfg !== 'object') return cfg;
        const stageMap = {
          Inicio: 'inicio',
          Acierto: 'acierto',
          Final: 'fin',
          start: 'inicio',
          success: 'acierto',
          end: 'fin'
        };
        const result = {};
        for (const stage of Object.keys(cfg)) {
          const mappedStage = stageMap[stage] || stage;
          const stageCfg = cfg[stage] ?? {};
          const isActive = !!(selectedStages?.[stage]);
          result[mappedStage] = {
            activo: isActive,
            contenido: {
              imagen: isActive ? await blobUrlToDataUrl(stageCfg.imageUrl) : '',
              audio: isActive ? await blobUrlToDataUrl(stageCfg.audioUrl) : '',
              video: isActive ? await blobUrlToDataUrl(stageCfg.videoUrl) : '',
              texto: isActive ? (stageCfg.text ?? '') : ''
            }
          };
        }
        return result;
      };

      const selectedPlats = state?.selectedPlatforms ?? [];
      const details = state?.gameDetails ?? {};
      const nivelMap = {
        'Básico': 'basico',
        'Intermedio': 'intermedio',
        'Avanzado': 'avanzado'
      };

      const fullConfig = {
        nivel: nivelMap[gameConfig?.difficulty] || 'basico',
        desafios: gameConfig?.challenges != null ? gameConfig.challenges : 3,
        tiempo: gameConfig?.time ?? 300,
        autor: details.authorName || '',
        version: details.version || '1.0.0',
        fecha: details.date || new Date().toISOString(),
        descripcion: details.description || '',
        nombreApp: details.gameName || 'Programación Por Bloques',
        plataformas: Array.isArray(selectedPlats) ? selectedPlats : ['android'],
        ar: arEnabled && arConfig ? await resolveARConfigFull(arConfig, arSelectedStages) : undefined

      };
      const androidApplicationId = buildBlocklyApplicationId();
      zip.file("android/app/src/main/assets/public/config/bloques-config.json", JSON.stringify(fullConfig, null, 2));
      await applyBlocklyAndroidMetadata(zip, { applicationId: androidApplicationId });

      // Si la RA está habilitada, inyectar el permiso de la cámara automáticamente
      if (arEnabled) {
        const manifestPath = "android/app/src/main/AndroidManifest.xml";
        const manifestFile = zip.file(manifestPath);
        if (manifestFile) {
          let manifestContent = await manifestFile.async("string");
          if (!manifestContent.includes("android.permission.CAMERA")) {
            manifestContent = manifestContent.replace(
              '</manifest>',
              '    <uses-permission android:name="android.permission.CAMERA" />\n</manifest>'
            );
            zip.file(manifestPath, manifestContent);
          }
        }
      }


      setStatusText("Generando paquete final...");
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      const platformsSuffix = (Array.isArray(selectedPlats) ? selectedPlats : ['movil'])
        .filter(p => p.toLowerCase() !== 'web')
        .map(p => platformLabel(p))
        .join('_') || 'movil';
      link.download = `${normalizeFileName(details?.gameName || 'bloqcode')}_${platformsSuffix}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setProgress(100);
      setStatusText("¡Descarga iniciada!");
      setTimeout(() => { setIsGenerating(false); setProgress(0); }, 2000);
    } catch (error) {
      console.error("Error generando el ZIP de Android:", error);
      setStatusText("Error al generar el archivo Android.");
      setIsGenerating(false);
    }
  };

  // ── ZIP Combinado (Web + Android) ─────────────────────────────────────────
  const generateAndDownloadCombinedZip = async () => {
    if (!window.JSZip) { alert("La librería ZIP aún no está lista."); setIsGenerating(false); return; }

    const blobUrlToDataUrl = async (url) => {
      if (!url || !url.startsWith('blob:')) return url;
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch { return url; }
    };

    const resolveARConfigFull = async (cfg, selectedStages) => {
      if (!cfg || typeof cfg !== 'object') return cfg;
      const stageMap = { Inicio: 'inicio', Acierto: 'acierto', Final: 'fin', start: 'inicio', success: 'acierto', end: 'fin' };
      const result = {};
      for (const stage of Object.keys(cfg)) {
        const mappedStage = stageMap[stage] || stage;
        const stageCfg = cfg[stage] ?? {};
        const isActive = !!(selectedStages?.[stage]);
        result[mappedStage] = {
          activo: isActive,
          contenido: {
            imagen: isActive ? await blobUrlToDataUrl(stageCfg.imageUrl) : '',
            audio: isActive ? await blobUrlToDataUrl(stageCfg.audioUrl) : '',
            video: isActive ? await blobUrlToDataUrl(stageCfg.videoUrl) : '',
            texto: isActive ? (stageCfg.text ?? '') : ''
          }
        };
      }
      return result;
    };

    try {
      const outerZip = new window.JSZip();

      // ── Generar ZIP Web ──
      // NOTA: buildStageData en generateBlocklyGameHTML espera el formato plano
      // Inicio/Acierto/Final + text/imageUrl/audioUrl/videoUrl. Usamos el
      // resolveARConfig plano (SummaryPanel), NO resolveARConfigFull (que es el
      // formato {activo, contenido:{...}} exclusivo del JSON de Android) — de lo
      // contrario la RA nunca se activa en el HTML exportado.
      setStatusText("Generando paquete Web...");
      const resolvedConfig = arEnabled && arConfig ? await resolveARConfig(arConfig) : {};
      const htmlContent = generateBlocklyGameHTML(
        gameConfig, state?.gameDetails ?? {}, state?.selectedPlatforms ?? [],
        arEnabled, arEnabled ? (arSelectedStages ?? {}) : {}, resolvedConfig
      );
      const webZip = new window.JSZip();

      const detailsCombined = state?.gameDetails ?? {};
      const htmlFileNameCombined = `${normalizeFileName(detailsCombined?.gameName || 'bloqcode')}_v${(detailsCombined?.version || '1.0').replace(/\s+/g, '')}.html`;
      webZip.file(htmlFileNameCombined, htmlContent);
      const webBlob = await webZip.generateAsync({ type: "blob" });
      outerZip.file(`${normalizeFileName(detailsCombined?.gameName || 'bloqcode')}_web.zip`, webBlob);

      // ── Generar ZIP Android ──
      setStatusText("Descargando plantilla Android...");
      const response = await fetch('/templates/bloqcode_android.zip');
      if (!response.ok) throw new Error("No se pudo descargar la plantilla base de Android");
      const arrayBuffer = await response.arrayBuffer();

      setStatusText("Inyectando configuración Android...");
      const androidZip = await window.JSZip.loadAsync(arrayBuffer);
      const nivelMap = { 'Básico': 'basico', 'Intermedio': 'intermedio', 'Avanzado': 'avanzado' };
      const details = state?.gameDetails ?? {};
      const selectedPlats = state?.selectedPlatforms ?? [];
      const fullConfig = {
        nivel: nivelMap[gameConfig?.difficulty] || 'basico',
        desafios: gameConfig?.challenges ?? 3,
        tiempo: gameConfig?.time ?? 300,
        autor: details.authorName || '',
        version: details.version || '1.0.0',
        fecha: details.date || new Date().toISOString(),
        descripcion: details.description || '',
        nombreApp: details.gameName || 'Programación Por Bloques',
        plataformas: Array.isArray(selectedPlats) ? selectedPlats : ['android'],
        ar: arEnabled && arConfig ? await resolveARConfigFull(arConfig, arSelectedStages) : undefined
      };
      const androidApplicationId = buildBlocklyApplicationId();
      androidZip.file("android/app/src/main/assets/public/config/bloques-config.json", JSON.stringify(fullConfig, null, 2));
      await applyBlocklyAndroidMetadata(androidZip, { applicationId: androidApplicationId });
      if (arEnabled) {
        const manifestPath = "android/app/src/main/AndroidManifest.xml";
        const manifestFile = androidZip.file(manifestPath);
        if (manifestFile) {
          let manifestContent = await manifestFile.async("string");
          if (!manifestContent.includes("android.permission.CAMERA")) {
            manifestContent = manifestContent.replace('</manifest>', '    <uses-permission android:name="android.permission.CAMERA" />\n</manifest>');
            androidZip.file(manifestPath, manifestContent);
          }
        }
      }
      const androidBlob = await androidZip.generateAsync({ type: "blob", platform: "UNIX" });
      const mobilePlatforms = (state?.selectedPlatforms ?? [])
        .filter(p => p.toLowerCase() !== 'web')
        .map(p => platformLabel(p))
        .join('_') || 'movil';
      outerZip.file(`${normalizeFileName(details?.gameName || 'bloqcode')}_${mobilePlatforms}.zip`, androidBlob);

      // ── ZIP contenedor final ──
      setStatusText("Empaquetando todo...");
      const finalBlob = await outerZip.generateAsync({ type: "blob" });
      const platformsLabel = (state?.selectedPlatforms ?? [])
        .map(p => platformLabel(p))
        .join('_');
      const url = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${normalizeFileName(details?.gameName || 'bloqcode')}_${platformsLabel}.zip`;

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

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      // Parsear como fecha local agregando T00:00:00 si es solo YYYY-MM-DD
      const normalized = dateString.includes('T') ? dateString : dateString + 'T00:00:00';
      return new Date(normalized).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return "Fecha inválida"; }
  };

  const getFixedCreationDate = () => {
    // Siempre usar la fecha actual del navegador/equipo del usuario
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`;
  };

  const selectedAreas = state?.selectedAreas || [];
  const selectedSkills = state?.selectedSkills || [];
  const gameDetails = { ...(state?.gameDetails || {}), date: getFixedCreationDate() };
  const selectedPlatforms = state?.selectedPlatforms || [];

  const getAreaName = (areaId) => {
    const areas = { science: 'Ciencia', technology: 'Tecnología', engineering: 'Ingeniería', arts: 'Arte', math: 'Matemáticas' };
    return areas[areaId] || areaId;
  };
  const getAreaIcon = (areaId) => {
    const icons = { science: '/images/areas/Ciencia.png', technology: '/images/areas/Tecnologia.png', engineering: '/images/areas/Ingenieria.png', arts: '/images/areas/Artes.png', math: '/images/areas/Matematicas.png' };
    return icons[areaId] || 'https://placehold.co/32x32/eee/aaa?text=?';
  };

  return (
    <div className="summary-screen">
      <style>{summaryStyles}</style>

      <h2 style={{ color: '#0077b6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <CheckCircle size={32} color="#22c55e" /> ¡Configuración Exitosa!
      </h2>
      <p className="rules-text">Tu juego ha sido configurado correctamente. Revisa los detalles y descárgalo.</p>

      <h1 className="selection-title">
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
            <div className="info-card-value">{gameDetails.authorName || 'No especificado'}</div>
          </div>
          <div className="info-card">
            <div className="info-card-header"><Layers size={16} /> Versión</div>
            <div className="info-card-value">{gameDetails.version || '1.0.0'}</div>
          </div>
          <div className="info-card full-width">
            <div className="info-card-header"><FileText size={16} /> Descripción</div>
            <div className="info-card-value">{gameDetails.description || 'Sin descripción.'}</div>
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
                    <img src={getAreaIcon(areaId)} alt="" style={{ width: '20px', height: '20px' }}
                      onError={(e) => { e.target.src = 'https://placehold.co/20x20/eee/aaa?text=?'; }} />
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
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Type size={18} /> Nivel:</span>
            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>
              {gameConfig?.difficulty ? gameConfig.difficulty.charAt(0).toUpperCase() + gameConfig.difficulty.slice(1) : '—'}
            </strong>
          </div>
          <div className="summary-row">
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><List size={18} /> Desafíos seleccionados:</span>
            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>{gameConfig?.challenges ?? '—'}</strong>
          </div>
          <div className="summary-row">
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Tiempo:</span>
            <strong style={{ fontSize: '1.1rem', color: '#0077b6' }}>
              {gameConfig?.time ? `${Math.floor(gameConfig.time / 60)} min` : '—'}
            </strong>
          </div>
          <div className="summary-row">
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b' }}><Clock size={18} /> Realidad Aumentada:</span>
            <strong style={{ fontSize: '1.1rem', color: '#64748b' }}>{arEnabled ? 'Sí' : 'No'}</strong>
          </div>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <button className="btn-primary-summary" onClick={onBack} disabled={isGenerating} style={{ opacity: isGenerating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#005f92', backgroundColor: '#005f92', color: 'white' }}>
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
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#0077b6', transition: 'width 0.3s ease-out', borderRadius: '7px' }} />
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
            background: '#005f92', backgroundColor: '#005f92', color: 'white',
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
const BlocklyChallenge = ({ withRA = null }) => {
  const { ensureThree, ensureThreeTextAddons } = useThreeLoaders();
  const location = useLocation();
  const navigate = useNavigate();
  const initThreeStage = useMemo(
    () => initThreeStageFactory({ ensureThree, ensureThreeTextAddons }),
    [ensureThree, ensureThreeTextAddons]
  );


  const [showARModal, setShowARModal] = useState(withRA === null);
  const [arEnabled, setArEnabled] = useState(withRA);
  const [setupStep, setSetupStep] = useState(
    withRA === true ? "ar" : "setup"
  );
  // ── Publicar setupStep inicial en location.state para que el Sidebar lo lea ──
  useEffect(() => {
    const initialStep = withRA === null ? "ar" : withRA ? "ar" : "setup";
    navigate(location.pathname + location.search, {
      replace: true,
      state: { ...location.state, setupStep: initialStep }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar
  const [activeARTab, setActiveARTab] = useState(AR_STAGES[0] ?? "Acierto");

  const [arSelectedStages, setArSelectedStages] = useState(
    { Acierto: false }
  );

  const [arConfig, setArConfig] = useState(
    { Acierto: {} }
  );
  const mediaObjectUrlsRef = useRef({});
  const previewStartRef = useRef(null);
  useEffect(() => {
    return () => {
      Object.values(mediaObjectUrlsRef.current).forEach((url) => {
        try { URL.revokeObjectURL(url); } catch { }
      });
      mediaObjectUrlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    writeJSON(LS.arStages, arSelectedStages);
  }, [arSelectedStages]);

  useEffect(() => {
    writeJSON(LS.arConfig, arConfig);
  }, [arConfig]);

  const [gameState, setGameState] = useState({
    screen: 'setup',
    difficulty: 'Básico',
    challenges: [],
    time: 0
  });
  // Después de: const [gameState, setGameState] = useState({...});
  const [blocklyGameConfig, setBlocklyGameConfig] = useState({
    difficulty: null,
    challenges: null,
    time: null,
  });
  const [isSwalLoaded, setIsSwalLoaded] = useState(false);
  const [isBlocklyLoaded, setIsBlocklyLoaded] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  const toggleARStage = (stage) => {
    setArSelectedStages((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const setARStageField = (stage, field, value) => {
    setArConfig((prev) => ({
      ...prev,
      [stage]: { ...(prev[stage] ?? {}), [field]: value },
    }));
  };

  const MAX_AR_FILE_SIZE_MB = 50;
  const MAX_AR_FILE_SIZE_BYTES = MAX_AR_FILE_SIZE_MB * 1024 * 1024;

  const handleARStageFileChange = (stage, field, file) => {
    const key = `${stage}:${field}`;
    const prevUrl = mediaObjectUrlsRef.current[key];
    if (prevUrl) {
      try { URL.revokeObjectURL(prevUrl); } catch { }
      delete mediaObjectUrlsRef.current[key];
    }

    if (!file) {
      setARStageField(stage, field, "");
      return;
    }

    // ── Validación de tamaño máximo (50 MB) ──────────────────────────────
    if (file.size > MAX_AR_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      if (window.Swal) {
        window.Swal.fire({
          icon: "warning",
          title: "Archivo demasiado grande",
          html: `El archivo <strong>${file.name}</strong> pesa <strong>${sizeMB} MB</strong>.<br/>El límite permitido es <strong>${MAX_AR_FILE_SIZE_MB} MB</strong>.`,
          confirmButtonColor: "#0077b6",
          confirmButtonText: "Entendido",
        });
      } else {
        alert(`El archivo "${file.name}" (${sizeMB} MB) supera el límite de ${MAX_AR_FILE_SIZE_MB} MB.`);
      }
      return; // No se asigna el archivo
    }
    // ─────────────────────────────────────────────────────────────────────

    const nextUrl = URL.createObjectURL(file);
    mediaObjectUrlsRef.current[key] = nextUrl;
    setARStageField(stage, field, nextUrl);
  };
  const validateARConfig = () => {
    const enabledStages = AR_STAGES.filter((s) => arSelectedStages[s]);
    if (enabledStages.length === 0) {
      return { ok: false, msg: "Selecciona al menos la etapa Acierto de RA." };
    }

    for (const stage of enabledStages) {
      const cfg = arConfig?.[stage] ?? {};
      const hasText = !!cfg.text?.trim();
      const hasImage = !!cfg.imageUrl?.trim();
      const hasAudio = !!cfg.audioUrl?.trim();
      const hasVideo = !!cfg.videoUrl?.trim();

      if (!hasText && !hasImage && !hasAudio && !hasVideo) {
        return { ok: false, msg: `Agrega al menos un contenido para la etapa "${stage}".` };
      }
    }

    return { ok: true };
  };

  const escapeHtml = (s = "") =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const normalizeStageConfig = (stageCfg = {}) => {
    const text = stageCfg.text ?? "";
    const imageUrl = stageCfg.imageUrl ?? "";
    const audioUrl = stageCfg.audioUrl ?? "";
    const videoUrl = stageCfg.videoUrl ?? "";

    let detectedType = stageCfg.type;
    if (!detectedType) {
      if (videoUrl?.trim()) detectedType = "Video";
      else if (imageUrl?.trim()) detectedType = "Imagen";
      else if (audioUrl?.trim()) detectedType = "Audio";
      else if (text?.trim()) detectedType = "Texto";
    }

    return {
      type: detectedType,
      text,
      imageUrl,
      audioUrl,
      videoUrl,
      hasText: !!text?.trim(),
      hasImage: !!imageUrl?.trim(),
      hasAudio: !!audioUrl?.trim(),
      hasVideo: !!videoUrl?.trim(),
    };
  };

  const hasStageContent = (stageCfg = {}) => {
    const cfg = normalizeStageConfig(stageCfg);
    return !!(cfg.text?.trim() || cfg.imageUrl?.trim() || cfg.audioUrl?.trim() || cfg.videoUrl?.trim());
  };

  const buildMultiContentHtml = (stageCfg, ids) => {
    const cfg = normalizeStageConfig(stageCfg);

    const visualElements = [];
    if (cfg.hasText) visualElements.push("text");
    if (cfg.hasImage) visualElements.push("image");
    if (cfg.hasVideo) visualElements.push("video");

    const visualCount = visualElements.length;
    const isAudioOnly = cfg.hasAudio && visualCount === 0;

    const textHtml = cfg.hasText ? `
      <div class="ar-multi-text-3d">
        <div id="${ids.textContainerId}" class="ar-three-container"></div>
      </div>
    ` : "";

    const imageHtml = cfg.hasImage ? `
      <div class="ar-multi-image">
        <div id="${ids.imageContainerId}" class="ar-three-container"></div>
      </div>
    ` : "";

    const videoHtml = cfg.hasVideo ? `
      <div class="ar-multi-video">
        <div id="${ids.videoContainerId}" class="ar-three-container"></div>
      </div>
    ` : "";

    const audioHtml = cfg.hasAudio ? (
      isAudioOnly
        ? `<div class="ar-audio-solo">
            <div class="ar-audio-icon">&#9835;</div>
            <audio id="${ids.audioId || "ar-audio-player"}" controls src="${escapeHtml(cfg.audioUrl)}" class="ar-audio-player"></audio>
           </div>`
        : `<div class="ar-audio-hidden">
            <audio id="${ids.audioId || "ar-audio-player"}" autoplay src="${escapeHtml(cfg.audioUrl)}" class="ar-audio-player-bg"></audio>
           </div>`
    ) : "";

    if (visualCount === 1) {
      return `
        <div class="ar-layout-single">
          ${textHtml}${imageHtml}${videoHtml}
        </div>
        ${audioHtml}
      `;
    }

    if (isAudioOnly) {
      return `
        <div class="ar-layout-single">
          ${audioHtml}
        </div>
      `;
    }

    if (visualCount === 2) {
      if (cfg.hasText && cfg.hasImage) {
        return `
          <div class="ar-layout-text-top">
            <div class="ar-row-text">${textHtml}</div>
            <div class="ar-row-media">${imageHtml}</div>
          </div>
          ${audioHtml}
        `;
      }
      if (cfg.hasText && cfg.hasVideo) {
        return `
          <div class="ar-layout-text-top">
            <div class="ar-row-text">${textHtml}</div>
            <div class="ar-row-media">${videoHtml}</div>
          </div>
          ${audioHtml}
        `;
      }
      if (cfg.hasImage && cfg.hasVideo) {
        return `
          <div class="ar-layout-row">
            ${imageHtml}
            ${videoHtml}
          </div>
          ${audioHtml}
        `;
      }
    }

    if (visualCount === 3) {
      return `
        <div class="ar-layout-three">
          <div class="ar-row-text">${textHtml}</div>
          <div class="ar-row-media-pair">
            ${imageHtml}
            ${videoHtml}
          </div>
        </div>
        ${audioHtml}
      `;
    }

    return `${textHtml}${imageHtml}${videoHtml}${audioHtml}`;
  };

  const showARStageModal = async (stage, swalOverrides = {}) => {
    if (!arSelectedStages?.[stage]) return true;

    const stageCfg = arConfig?.[stage] ?? {};
    if (!hasStageContent(stageCfg)) return true;
    if (!window.Swal) return false;

    const cfg = normalizeStageConfig(stageCfg);
    const timestamp = Date.now();
    const bgId = `blockly-ar-bg-${stage}-${timestamp}`;
    const videoId = `blockly-ar-video-${stage}-${timestamp}`;
    const useCamera = stage === 'Acierto';

    const ids = {
      textContainerId: `ar-text-${timestamp}`,
      imageContainerId: `ar-image-${timestamp}`,
      videoContainerId: `ar-video-${timestamp}`,
      audioId: `ar-audio-${timestamp}`,
    };

    const cleanups = [];
    let cleanupSymbols;
    let cameraStream;

    const innerHtml = buildMultiContentHtml(stageCfg, ids);
    const html = buildDecoratedHtml({
      bgId,
      innerHtml: `<div class="ar-multi-content">${innerHtml}</div>`,
      useCamera,
      videoId,
    });

    const res = await window.Swal?.fire({
      html,
      confirmButtonText: "Continuar",
      confirmButtonColor: '#0077b6',
      didOpen: async () => {
        if (useCamera) {
          cameraStream = await startCamera(videoId);
        }

        const bgEl = document.getElementById(bgId);
        cleanupSymbols = createFloatingSymbols(bgEl);

        // Esperar 2 frames para que Swal termine de pintar el layout
        // y clientWidth/clientHeight sean valores reales (igual que CalculadoraMental)
        if (cfg.hasText) {
          const container = document.getElementById(ids.textContainerId);
          if (container) cleanups.push(initThreeStage(container, { type: 'Texto', text: cfg.text }));
        }
        if (cfg.hasImage) {
          const container = document.getElementById(ids.imageContainerId);
          if (container) cleanups.push(initThreeStage(container, { type: 'Imagen', imageUrl: cfg.imageUrl }));
        }
        if (cfg.hasVideo) {
          const container = document.getElementById(ids.videoContainerId);
          if (container) cleanups.push(initThreeStage(container, { type: 'Video', videoUrl: cfg.videoUrl }));
        }
        if (cfg.hasAudio) {
          const container = document.getElementById(ids.audioId);
          if (container) cleanups.push(initThreeStage(container, { type: 'Audio', audioUrl: cfg.audioUrl }));
        }
      },
      willClose: () => {
        cleanups.forEach((cleanup) => cleanup && cleanup());
        if (cleanupSymbols) cleanupSymbols();
        if (cameraStream) stopCamera(cameraStream);
      },
      ...swalOverrides,
    });

    return !!res?.isConfirmed;
  };

  const buildARStageSummaryHtml = (stage, stageCfg, isEnabled) => {
    const statusText = isEnabled ? "Habilitada" : "Deshabilitada";
    let body = `<p class="ra-empty">No habilitada.</p>`;

    if (isEnabled) {
      const contents = [];

      if (stageCfg?.text?.trim()) {
        contents.push(`<div class="ra-content-item"><span class="ra-icon">TXT</span> Texto configurado</div>`);
      }
      if (stageCfg?.imageUrl?.trim()) {
        contents.push(`<div class="ra-content-item"><span class="ra-icon">IMG</span> Imagen configurada</div>`);
      }
      if (stageCfg?.audioUrl?.trim()) {
        contents.push(`<div class="ra-content-item"><span class="ra-icon">AUD</span> Audio configurado</div>`);
      }
      if (stageCfg?.videoUrl?.trim()) {
        contents.push(`<div class="ra-content-item"><span class="ra-icon">VID</span> Video configurado</div>`);
      }

      body = contents.length > 0
        ? contents.join("")
        : `<p class="ra-empty">Sin contenido configurado.</p>`;
    }

    return `
      <div class="ra-card ${isEnabled ? "is-on" : "is-off"}">
        <div class="ra-card-head">
          <span class="ra-title">${escapeHtml(stage)}</span>
          <span class="ra-status">${statusText}</span>
        </div>
        <div class="ra-card-body">${body}</div>
      </div>
    `;
  };

  const buildARConfigSummaryHtml = () => {
    const cards = AR_STAGES.map((stage) => {
      const enabled = !!arSelectedStages?.[stage];
      const cfg = arConfig?.[stage] ?? {};
      return buildARStageSummaryHtml(stage, cfg, enabled);
    }).join("");

    return `
      <style>
        .ra-summary { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); text-align: left; }
        .ra-card { border: 1px solid rgba(2, 62, 138, 0.18); border-radius: 14px; padding: 14px; background: #ffffff; }
        .ra-card.is-off { opacity: 0.7; }
        .ra-card-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; }
        .ra-title { font-weight: 700; color: #023e8a; }
        .ra-status { font-size: 0.8rem; color: #0077b6; background: rgba(0,119,182,0.12); padding: 2px 8px; border-radius: 999px; }
        .ra-card.is-off .ra-status { color: #023e8a; background: rgba(2,62,138,0.08); }
        .ra-card-body { color: #023e8a; font-size: 0.9rem; }
        .ra-text { margin: 0; white-space: pre-wrap; }
        .ra-empty { margin: 0; color: rgba(2, 62, 138, 0.6); }
        .ra-media, .ra-video { width: 100%; border-radius: 10px; display: block; }
        .ra-audio { width: 100%; }
        .ra-content-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid rgba(2, 62, 138, 0.1); }
        .ra-content-item:last-child { border-bottom: none; }
        .ra-icon { font-size: 0.85rem; font-weight: 700; color: #023e8a; }
      </style>
      <div class="ra-summary">${cards}</div>
    `;
  };


  const saveARConfigAndContinue = async () => {
    const v = validateARConfig();
    if (!v.ok) {
      if (window.Swal) {
        await window.Swal.fire("Atención", v.msg, "warning");
      } else {
        alert(v.msg);
      }
      return;
    }

    writeJSON(LS.arStages, arSelectedStages);
    writeJSON(LS.arConfig, arConfig);

    setSetupStep("ar-summary");
    navigate(location.pathname + location.search, {
      replace: true,
      state: { ...location.state, setupStep: 'ar-summary' }
    });
  };

  const handleGameStart = (difficulty, challenges, time) => {
    setBlocklyGameConfig({ difficulty, challenges: challenges?.length ?? challenges, time });
    setGameState({
      screen: 'game',
      difficulty,
      challenges,
      time
    });
  };

  const handleGameEnd = (finalScore) => {
    setGameState({
      screen: 'setup',
      difficulty: 'Básico',
      challenges: [],
      time: 0
    });
  };

  const onSwalLoaded = useCallback(() => setIsSwalLoaded(true), []);
  const onBlocklyLoaded = useCallback(() => setIsBlocklyLoaded(true), []);

  useEffect(() => {
    if (isSwalLoaded && isBlocklyLoaded) {
      setScriptsLoaded(true);
    }
  }, [isSwalLoaded, isBlocklyLoaded]);

  const renderARConfig = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Configuración de Realidad Aumentada
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '1.5rem' }}>
          Configura el contenido que se mostrará cuando el jugador acierte un desafío.
        </p>

        {/* ── Tabs estilo Encriptacion ── */}
        <div className="ar-tabs">
          {AR_STAGES.map((stage) => (
            <button
              key={stage}
              className={`ar-tab ${activeARTab === stage ? "active" : ""} ${arSelectedStages?.[stage] ? "enabled" : ""}`}
              onClick={() => setActiveARTab(stage)}
            >
              {stage}
              {arSelectedStages?.[stage] && <span className="ar-tab-check">✓</span>}
            </button>
          ))}
        </div>

        {/* ── Contenido de la tab activa ── */}
        <div className="ar-tab-content">
          <div className="ar-stage-toggle-row">
            <label className="ra-stage-toggle">
              <input
                type="checkbox"
                checked={!!arSelectedStages?.[activeARTab]}
                onChange={() => toggleARStage(activeARTab)}
              />
              <span>Habilitar etapa {activeARTab}</span>
            </label>
          </div>

          {arSelectedStages?.[activeARTab] ? (
            <div className="ar-content-cards">

              {/* ── TEXTO ── */}
              <div className={`ar-content-card ${arConfig?.[activeARTab]?.text?.trim() ? "has-content" : ""}`}>
                <div className="ar-card-header">
                  <span className="ar-card-icon">
                    <Player src="/images/areas/texto.json" loop autoplay style={{ width: 68, height: 68 }} />
                  </span>
                  <span className="ar-card-title">Texto</span>
                  {arConfig?.[activeARTab]?.text?.trim() && (
                    <button className="ar-delete-btn" onClick={() => setARStageField(activeARTab, "text", "")} title="Eliminar texto">✕</button>
                  )}
                </div>
                <div className="ar-card-body">
                  <textarea
                    className="ra-field"
                    value={arConfig?.[activeARTab]?.text ?? ""}
                    onChange={(e) => setARStageField(activeARTab, "text", e.target.value)}
                    rows={3}
                    placeholder="Escribe el mensaje de texto..."
                  />
                </div>
              </div>

              {/* ── IMAGEN ── */}
              <div className={`ar-content-card ${arConfig?.[activeARTab]?.imageUrl?.trim() ? "has-content" : ""}`}>
                <div className="ar-card-header">
                  <span className="ar-card-icon">
                    <Player src="/images/areas/image.json" loop autoplay style={{ width: 68, height: 68 }} />
                  </span>
                  <span className="ar-card-title">Imagen</span>
                  {arConfig?.[activeARTab]?.imageUrl?.trim() && (
                    <button className="ar-delete-btn" onClick={() => handleARStageFileChange(activeARTab, "imageUrl", null)} title="Eliminar imagen">✕</button>
                  )}
                </div>
                <div className="ar-card-body">
                  <input
                    id={`file-image-${activeARTab}`}
                    className="ar-file-input-hidden"
                    type="file"
                    accept="image/*"
                    onClick={(e) => { e.target.value = null; }}
                    onChange={(e) => handleARStageFileChange(activeARTab, "imageUrl", e.target.files?.[0] ?? null)}
                  />
                  <label
                    htmlFor={`file-image-${activeARTab}`}
                    className={`ar-file-upload-btn ${arConfig?.[activeARTab]?.imageUrl?.trim() ? 'has-file' : ''}`}
                  >
                    {arConfig?.[activeARTab]?.imageUrl?.trim() ? '✅ Imagen seleccionada' : '📁 Seleccionar imagen'}
                  </label>
                  {arConfig?.[activeARTab]?.imageUrl && (
                    <img src={arConfig[activeARTab].imageUrl} alt="Preview" className="ar-preview-image" />
                  )}
                </div>
              </div>

              {/* ── AUDIO ── */}
              <div className={`ar-content-card ${arConfig?.[activeARTab]?.audioUrl?.trim() ? "has-content" : ""}`}>
                <div className="ar-card-header">
                  <span className="ar-card-icon">
                    <Player src="/images/areas/audio.json" loop autoplay style={{ width: 68, height: 68 }} />
                  </span>
                  <span className="ar-card-title">Audio</span>
                  {arConfig?.[activeARTab]?.audioUrl?.trim() && (
                    <button className="ar-delete-btn" onClick={() => handleARStageFileChange(activeARTab, "audioUrl", null)} title="Eliminar audio">✕</button>
                  )}
                </div>
                <div className="ar-card-body">
                  <input
                    id={`file-audio-${activeARTab}`}
                    className="ar-file-input-hidden"
                    type="file"
                    accept="audio/*"
                    onClick={(e) => { e.target.value = null; }}
                    onChange={(e) => handleARStageFileChange(activeARTab, "audioUrl", e.target.files?.[0] ?? null)}
                  />
                  <label
                    htmlFor={`file-audio-${activeARTab}`}
                    className={`ar-file-upload-btn ${arConfig?.[activeARTab]?.audioUrl?.trim() ? 'has-file' : ''}`}
                  >
                    {arConfig?.[activeARTab]?.audioUrl?.trim() ? '✅ Audio seleccionado' : '🎵 Seleccionar audio'}
                  </label>
                  {arConfig?.[activeARTab]?.audioUrl && (
                    <audio controls src={arConfig[activeARTab].audioUrl} className="ar-preview-audio" />
                  )}
                </div>
              </div>

              {/* ── VIDEO ── */}
              <div className={`ar-content-card ${arConfig?.[activeARTab]?.videoUrl?.trim() ? "has-content" : ""}`}>
                <div className="ar-card-header">
                  <span className="ar-card-icon">
                    <Player src="/images/areas/video.json" loop autoplay style={{ width: 68, height: 68 }} />
                  </span>
                  <span className="ar-card-title">Video</span>
                  {arConfig?.[activeARTab]?.videoUrl?.trim() && (
                    <button className="ar-delete-btn" onClick={() => handleARStageFileChange(activeARTab, "videoUrl", null)} title="Eliminar video">✕</button>
                  )}
                </div>
                <div className="ar-card-body">
                  <input
                    id={`file-video-${activeARTab}`}
                    className="ar-file-input-hidden"
                    type="file"
                    accept="video/*"
                    onClick={(e) => { e.target.value = null; }}
                    onChange={(e) => handleARStageFileChange(activeARTab, "videoUrl", e.target.files?.[0] ?? null)}
                  />
                  <label
                    htmlFor={`file-video-${activeARTab}`}
                    className={`ar-file-upload-btn ${arConfig?.[activeARTab]?.videoUrl?.trim() ? 'has-file' : ''}`}
                  >
                    {arConfig?.[activeARTab]?.videoUrl?.trim() ? '✅ Video seleccionado' : '🎬 Seleccionar video'}
                  </label>
                  {arConfig?.[activeARTab]?.videoUrl && (
                    <video controls src={arConfig[activeARTab].videoUrl} className="ar-preview-video" />
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="ar-disabled-message">
              <p>Habilita esta etapa para configurar el contenido de Realidad Aumentada.</p>
            </div>
          )}
        </div>

        {/* ── Botones de navegación ── */}
        <div className="enc-btn-group">
          <button className="enc-btn" style={{ margin: 0, background: 'var(--secondary)' }} onClick={() => navigate(-1)}>
            ← Anterior
          </button>
          <button className="enc-btn primary" style={{ margin: 0 }} onClick={saveARConfigAndContinue}>
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
  // ── Pasos de progreso
  const stepsOrder = arEnabled ? ['ar', 'ar-summary', 'setup'] : ['setup'];
  const stepLabels = { ar: 'RA', 'ar-summary': 'Resumen', setup: 'Juego' };

  const ProgressBar = ({ currentStep }) => {
    const currentIdx = stepsOrder.indexOf(currentStep);
    return (
      <div className="enc-setup-progress-bar">
        {stepsOrder.map((step, i) => (
          <React.Fragment key={step}>
            <div className={`enc-setup-progress-step ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}>
              <div className="enc-setup-progress-dot" />
              <span>{stepLabels[step]}</span>
            </div>
            {i < stepsOrder.length - 1 && <div className="enc-setup-progress-line" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const AnimatedTitle = () => (
    <div className="enc-animated-title-container">
      <h1 className="enc-animated-title">
        {'Juego de BloqCode'.split('').map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
      <div className="enc-floating-icons">
        <span className="enc-icon-1">{ }</span>
        <span className="enc-icon-2">{ }</span>
        <span className="enc-icon-3">{ }</span>
        <span className="enc-icon-4">⇒</span>
      </div>
    </div>
  );
  return (
    <div className="blockly-scope font-sans bg-gray-50 min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

        :root, .blockly-scope {
          --primary: #005f92 !important;
          --secondary: #1f2937 !important;
          --success: #22c55e;
          --danger: #ef4444;
          --dark: #111827;
          --light: #f3f4f6;
          --bg-color: #f0f2f5;
          --font-family: 'Nunito', 'Inter', 'Segoe UI', sans-serif;
        }
        * { font-family: var(--font-family) !important; }
        /* ── Título animado ── */
        .enc-animated-title-container {
          position: relative;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .enc-animated-title {
          text-align: center;
          font-size: 3rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 0.25rem;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          font-family: 'Merriweather', serif;
        }
        .enc-animated-title span {
          display: inline-block;
          animation: encWaveTitle 1.8s infinite;
          position: relative;
        }
        @keyframes encWaveTitle {
          0%, 40%, 100% { transform: translateY(0); }
          20%           { transform: translateY(-20px); }
        }
        .enc-floating-icons span {
          position: absolute;
          color: var(--primary);
          opacity: 0.3;
          font-size: 1.5rem;
          font-weight: 700;
          animation: encFloat 4s ease-in-out infinite;
        }
        .enc-icon-1 { top: -20px; left: 10%; animation-delay: 0s !important; }
        .enc-icon-2 { top: 0; right: 10%; animation-delay: 1s !important; }
        .enc-icon-3 { bottom: 0px; left: 20%; animation-delay: 2s !important; }
        .enc-icon-4 { bottom: -10px; right: 20%; animation-delay: 3s !important; }
        @keyframes encFloat {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-15px); }
        }

        /* ── Barra de progreso ── */
        .enc-setup-progress-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 2rem;
        }
        .enc-setup-progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: #94a3b8;
          font-weight: 600;
        }
        .enc-setup-progress-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #e2e8f0;
          border: 2px solid #cbd5e1;
          transition: all 0.3s;
        }
        .enc-setup-progress-step.active .enc-setup-progress-dot {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0,95,146,0.2);
        }
        .enc-setup-progress-step.active { color: var(--primary); }
        .enc-setup-progress-step.done .enc-setup-progress-dot {
          background: var(--success);
          border-color: var(--success);
        }
        .enc-setup-progress-step.done { color: var(--success); }
        .enc-setup-progress-line {
          width: 48px;
          height: 2px;
          background: #e2e8f0;
          margin: 0 4px;
          margin-bottom: 18px;
        }

        /* ── Panel base ── */
        .enc-screen {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          box-sizing: border-box;
        }
        .enc-panel {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
          padding: 2rem;
          width: 100%;
        }
        .enc-single-panel { width: 100%; }

        /* ── Botones enc (idénticos a Encriptacion) ── */
        .blockly-scope .enc-btn,
        .enc-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.5rem !important;
          padding: 0.875rem 2rem !important;
          font-size: 1.1rem !important;
          font-weight: 600 !important;
          border: none !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          background-color: #005f92 !important;
          background-image: none !important;
          color: white !important;
          box-shadow: none !important;
          transition: background-color 0.3s, opacity 0.2s !important;
          width: 100% !important;
          margin-top: 1rem !important;
          text-transform: none !important;
          font-family: 'Nunito', 'Inter', sans-serif !important;
        }
        .blockly-scope .enc-btn:hover:not(:disabled),
        .enc-btn:hover:not(:disabled) { background-color: #004a73 !important; }
        .blockly-scope .enc-btn:focus,
        .enc-btn:focus { box-shadow: 0 0 0 4px rgba(0,119,182,0.25) !important; }
        .blockly-scope .enc-btn:disabled,
        .enc-btn:disabled { opacity: 0.6 !important; cursor: not-allowed !important; }
        .blockly-scope .enc-btn.primary,
        .enc-btn.primary { background-color: #005f92 !important; }

        /* ── Grupo de botones (idéntico a Encriptacion) ── */
        .enc-btn-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
          width: 100%;
        }
        .enc-btn-group > :only-child {
          grid-column: 1 / -1;
          justify-self: center;
          width: min(360px, 100%);
        }

        /* ── Botón editar RA ── */
        .ra-edit-btn {
          padding: 0.5rem 1.2rem;
          border-radius: 8px;
          border: 1.5px solid var(--primary);
          color: var(--primary);
          background: white;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .ra-edit-btn:hover { background: var(--primary); color: white; }

        /* ── Tabs (idéntico a Encriptacion — underline style) ── */
        .ar-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #e9ecef;
        }
        .ar-tab {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          color: var(--secondary);
          transition: all 0.3s ease;
          position: relative;
          font-family: var(--font-family);
        }
        .ar-tab:hover {
          color: var(--primary);
          background: rgba(0, 123, 255, 0.05);
        }
        .ar-tab.active { color: var(--primary); }
        .ar-tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary);
          border-radius: 3px 3px 0 0;
        }
        .ar-tab-check {
          display: inline-block;
          margin-left: 0.4rem;
          color: var(--success);
          font-size: 0.9rem;
        }

        /* ── Tab content y toggle ── */
        .ar-tab-content {
          padding: 1.5rem;
          background: transparent;
          border-radius: 12px;
          margin-bottom: 1rem;
        }
        .ar-stage-toggle-row {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e9ecef;
        }
        .ra-stage-toggle {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          font-weight: 600;
          color: var(--dark);
          cursor: pointer;
          user-select: none;
        }
        .ra-stage-toggle input { accent-color: var(--primary); }

        /* ── Cards (idéntico a Encriptacion) ── */
        .ar-content-cards {
          display: grid;
          width: 100%;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }
        @media (max-width: 600px) {
          .ar-content-cards { grid-template-columns: 1fr; }
        }
        .ar-content-card {
          width: 100%;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s ease;
        }
        .ar-content-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
        }
        .ar-content-card.has-content {
          border-color: var(--success);
          background: linear-gradient(135deg, rgba(40, 167, 69, 0.05), white);
        }
        .ar-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e9ecef;
        }
        .ar-card-icon { font-size: 1.5rem; }
        .ar-card-title {
          font-weight: 600;
          color: var(--dark);
          font-size: 1rem;
          flex: 1;
        }
        .ar-delete-btn {
          background: #ff4757;
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .ar-delete-btn:hover { background: #ff6b7a; transform: scale(1.1); }
        .ar-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        /* ── File inputs (idéntico a Encriptacion) ── */
        .ar-file-input-hidden { display: none; }
        .ar-file-upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.65rem 1rem;
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          background: #f8fafc;
          color: #64748b;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-family);
          text-align: center;
          box-sizing: border-box;
        }
        .ar-file-upload-btn:hover {
          border-color: var(--primary);
          background: #e0f2fe;
          color: var(--primary);
        }
        .ar-file-upload-btn.has-file {
          border-color: var(--success);
          background: #f0fdf4;
          color: #15803d;
          border-style: solid;
        }

        /* ── Campo de texto RA ── */
        .ra-field {
          width: 100%;
          padding: 0.6rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          resize: vertical;
          box-sizing: border-box;
          font-family: var(--font-family);
        }
        .ra-field:focus { outline: none; border-color: var(--primary); }

        /* ── Previews ── */
        .ar-preview-image {
          max-width: 100%;
          max-height: 100px;
          object-fit: contain;
          border-radius: 8px;
          margin-top: 0.5rem;
        }
        .ar-preview-audio { width: 100%; margin-top: 0.5rem; }
        .ar-preview-video {
          width: 100%;
          max-height: 100px;
          border-radius: 8px;
          margin-top: 0.5rem;
        }

        /* ── Mensaje etapa deshabilitada ── */
        .ar-disabled-message {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 150px;
          background: #f8f9fa;
          border-radius: 12px;
          color: var(--secondary);
        }
        .ar-disabled-message p {
          font-size: 1rem;
          margin: 0;
          text-align: center;
        }

        /* ── Botón preview RA ── */
        .ra-preview-btn {
          background-color: rgba(0, 119, 182, 0.1);
          color: var(--dark);
          border: 1px solid rgba(0, 119, 182, 0.3);
          font-weight: 600;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .ra-preview-btn:hover { background-color: rgba(0, 119, 182, 0.18); }
      `}</style>

      <SweetAlertLoader onLoaded={onSwalLoaded} />
      <BlocklyLoader onLoaded={onBlocklyLoaded} />
      <TailwindStyles />
      <BlocklyARStyles />

      {!scriptsLoaded && (
        <div className="enc-screen" style={{ padding: '3rem' }}>
          <div className="enc-panel enc-single-panel" style={{ textAlign: 'center' }}>
            <AnimatedTitle />

            <p style={{ color: '#64748b', marginTop: '1rem' }}>
              {isBlocklyLoaded ? '✅ Blockly cargado' : '⏳ Cargando Blockly...'}
            </p>
            <p style={{ color: '#64748b' }}>
              {isSwalLoaded ? '✅ SweetAlert2 cargado' : '⏳ Cargando SweetAlert2...'}
            </p>
          </div>
        </div>
      )}

      {/* ── Modal RA interno (solo cuando withRA === null) ── */}
      {showARModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '2.5rem 2rem', maxWidth: '420px', width: '90%',
            boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
            textAlign: 'center',
          }}>
            <Player
              src="/images/juegos/VRAR.json"
              loop autoplay
              style={{ maxWidth: '120px', height: '120px', margin: '0 auto 1rem' }}
            />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
              Realidad Aumentada
            </h2>
            <p style={{ color: '#444', marginBottom: '2rem', lineHeight: 1.5 }}>
              ¿Deseas integrar Tecnología de Realidad Aumentada en esta actividad?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className="enc-btn"
                style={{ background: '#1f2937', flex: 1 }}
                onClick={() => {
                  setArEnabled(false);
                  setShowARModal(false);
                  setSetupStep('setup');
                  navigate(location.pathname + location.search, {
                    replace: true,
                    state: { ...location.state, setupStep: 'setup' }
                  });
                }}              >
                No
              </button>
              <button
                className="enc-btn primary"
                style={{ flex: 1 }}
                onClick={() => {
                  // Limpiar storage y estado para empezar desde cero
                  localStorage.removeItem(LS.arStages);
                  localStorage.removeItem(LS.arConfig);
                  setArSelectedStages({ Inicio: false, Acierto: false, Final: false });
                  setArConfig({ Inicio: {}, Acierto: {}, Final: {} });
                  mediaObjectUrlsRef.current = {};
                  setArEnabled(true);
                  setShowARModal(false);
                  // Avanzar al paso de configuración de RA para que el usuario
                  // pueda definir el contenido (texto/imagen/audio/video) de la
                  // etapa "Acierto". Sin esto, arConfig.Acierto queda vacío y
                  // showARStageModal nunca se activa durante el juego.
                  setSetupStep('ar');
                  navigate(location.pathname + location.search, {
                    replace: true,
                    state: { ...location.state, setupStep: 'ar' }
                  });
                }}
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Paso: Configuración RA ── */}

      {/* ── Paso: Configuración RA ── */}
      {scriptsLoaded && setupStep === 'ar' && (
        <div className="enc-screen">
          <div className="enc-panel enc-single-panel">
            <AnimatedTitle />
            <ProgressBar currentStep="ar" />
            {renderARConfig()}
          </div>
        </div>
      )}

      {/* ── Paso: Resumen RA ── */}
      {scriptsLoaded && setupStep === 'ar-summary' && (
        <div className="enc-screen">
          <div className="enc-panel enc-single-panel">
            <AnimatedTitle />
            <ProgressBar currentStep="ar-summary" />
            <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 700 }}>
              Resumen de Configuración RA
            </h2>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
              {AR_STAGES.map((stage) => {
                const enabled = !!arSelectedStages?.[stage];
                const cfg = arConfig?.[stage] ?? {};
                const items = [
                  cfg.text?.trim() && { icon: '📝', label: 'Texto configurado' },
                  cfg.imageUrl?.trim() && { icon: '🖼️', label: 'Imagen configurada' },
                  cfg.audioUrl?.trim() && { icon: '🎵', label: 'Audio configurado' },
                  cfg.videoUrl?.trim() && { icon: '🎬', label: 'Video configurado' },
                ].filter(Boolean);
                return (
                  <div key={stage} style={{ border: '1px solid rgba(2,62,138,0.18)', borderRadius: '14px', padding: '14px', background: '#fff', opacity: enabled ? 1 : 0.7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 700, color: '#023e8a' }}>{stage}</span>
                      <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '999px', color: enabled ? '#0077b6' : '#023e8a', background: enabled ? 'rgba(0,119,182,0.12)' : 'rgba(2,62,138,0.08)' }}>
                        {enabled ? 'Habilitada' : 'Deshabilitada'}
                      </span>
                    </div>
                    <div style={{ color: '#023e8a', fontSize: '0.9rem' }}>
                      {!enabled && <p style={{ margin: 0, color: 'rgba(2,62,138,0.6)' }}>No habilitada.</p>}
                      {enabled && items.length === 0 && <p style={{ margin: 0, color: 'rgba(2,62,138,0.6)' }}>Sin contenido configurado.</p>}
                      {enabled && items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: i < items.length - 1 ? '1px solid rgba(2,62,138,0.1)' : 'none' }}>
                          {item.icon} {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="enc-btn-group">
              <button className="enc-btn" style={{ background: '#1f2937' }} onClick={() => {
                setSetupStep('ar');
                navigate(location.pathname + location.search, {
                  replace: true,
                  state: { ...location.state, setupStep: 'ar' }
                });
              }}>
                ← Anterior
              </button>
              <button className="enc-btn primary" onClick={() => {
                setSetupStep('setup');
                navigate(location.pathname + location.search, {
                  replace: true,
                  state: { ...location.state, setupStep: 'setup' }
                });
              }}>
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Paso: Setup del juego ── */}
      {/* ── Paso: Setup del juego ── */}
      {scriptsLoaded && setupStep === 'setup' && gameState.screen === 'setup' && (
        <div className="enc-screen">
          <div className="enc-panel enc-single-panel">
            <AnimatedTitle />
            <ProgressBar currentStep="setup" />

            {/* ── Reglas básicas centradas, igual que Encriptacion ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr',
              margin: '0 auto 1.5rem auto', maxWidth: '600px',
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: '0.75rem', padding: '0.85rem 1.25rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>📋 Reglas Básicas</span>
              <span style={{ fontSize: '1rem', color: '#1e40af', fontWeight: 500 }}>Utiliza los bloques de las diferentes categorías y resuelve la problemática.</span>
            </div>

            <SetupScreen
              onGameStart={handleGameStart}
              onEditAR={arEnabled ? () => setSetupStep('ar') : null}
              onConfigChange={(cfg) => setBlocklyGameConfig(cfg)}
              onPreview={(fn) => { previewStartRef.current = fn; }}
            />
            <div className="enc-btn-group">
              <button
                className="enc-btn"
                style={{ background: '#1f2937' }}
                onClick={() => navigate(-1)}
              >
                ← Anterior
              </button>
              <button
                className="enc-btn primary"
                onClick={() => {
                  if (previewStartRef.current) previewStartRef.current();
                }}
              >
                Vista Previa →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Paso: Resumen final del juego ── */}
      {scriptsLoaded && setupStep === 'game-summary' && gameState.screen !== 'game' && (
        <div className="enc-screen">
          <div className="enc-panel enc-single-panel">
            <SummaryPanel
              gameConfig={blocklyGameConfig}
              arEnabled={arEnabled}
              arSelectedStages={arSelectedStages}
              arConfig={arConfig}
              onBack={() => {
                setSetupStep('setup');
                navigate(location.pathname + location.search, {
                  replace: true,
                  state: { ...location.state, setupStep: 'setup' }
                });
              }}
              state={location.state}
            />
          </div>
        </div>
      )}

      {/* ── Juego en curso ── */}
      {scriptsLoaded && gameState.screen === 'game' && (
        <GameScreen
          difficulty={gameState.difficulty}
          challenges={gameState.challenges}
          totalTime={gameState.time}
          onGameEnd={handleGameEnd}
          onFinishConfig={() => {
            setGameState({ screen: 'setup', difficulty: 'Básico', challenges: [], time: 0 });
            setSetupStep('game-summary');
            navigate('/settings?view=Summary', {
              replace: true,
              state: {
                ...location.state,
                setupStep: 'game-summary',
                gameType: 'blockly',
                arNamespace: STORAGE_NS,
                arSelectedStages: arEnabled ? arSelectedStages : { Inicio: false, Acierto: false, Final: false },
                arConfig: arEnabled ? arConfig : {},
              }
            });
          }}
          arSelectedStages={arSelectedStages}
          arConfig={arConfig}
          showARStageModal={showARStageModal}
        />
      )}
    </div>
  );
};

export default BlocklyChallenge;