import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Star {
  x: number;
  y: number;
  z: number;
  prevZ: number;
}

interface SpaceBackgroundProps {
  onGalaxyActiveChange?: (active: boolean) => void;
}

const BLACK_HOLE_MODEL_URL = '/assets/blackhole_skybox_web.glb';
let blackHoleScenePromise: Promise<THREE.Object3D> | null = null;

function keepBlackHoleDisplayPlane(model: THREE.Object3D) {
  const meshesToRemove: THREE.Mesh[] = [];
  model.traverse((obj: any) => {
    if (!obj.isMesh) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    const isDisplayPlane = materials.some((material: THREE.Material | undefined) => material?.name === 'sky1');
    if (!isDisplayPlane) meshesToRemove.push(obj);
  });
  meshesToRemove.forEach((mesh) => mesh.parent?.remove(mesh));
  return model;
}

function preloadBlackHoleModel() {
  if (!blackHoleScenePromise) {
    blackHoleScenePromise = new Promise((resolve, reject) => {
      new GLTFLoader().load(
        BLACK_HOLE_MODEL_URL,
        (gltf) => resolve(keepBlackHoleDisplayPlane(gltf.scene)),
        undefined,
        (error) => {
          blackHoleScenePromise = null;
          reject(error);
        },
      );
    });
  }

  return blackHoleScenePromise!;
}

function BlackHoleSkyboxModel() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 820;
    const height = mount.clientHeight || 520;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 100);
    camera.position.set(0, 0, 4.25);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x88ccff, 0.8));

    const keyLight = new THREE.PointLight(0x8fdcff, 3.2, 12);
    keyLight.position.set(1.8, 1.4, 2.5);
    scene.add(keyLight);

    const warmLight = new THREE.PointLight(0xff9b45, 2.4, 10);
    warmLight.position.set(-1.6, -0.7, 2.2);
    scene.add(warmLight);

    const group = new THREE.Group();
    scene.add(group);

    let disposed = false;
    let loadedModel: THREE.Object3D | null = null;
    let loadedModelMaxSize = 1;
    const fitModelToViewport = () => {
      if (!loadedModel) return;
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const viewWidth = viewHeight * camera.aspect;
      const coverSize = Math.max(viewWidth, viewHeight) * 1.08;
      loadedModel.scale.setScalar(coverSize / loadedModelMaxSize);
    };

    preloadBlackHoleModel().then((sourceModel) => {
      if (disposed) return;
      let displayTexture: THREE.Texture | null = null;
      sourceModel.traverse((obj: any) => {
        if (!obj.isMesh || displayTexture) return;
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        const texturedMaterial = materials.find((material: any) => material?.map);
        if (texturedMaterial?.map) displayTexture = texturedMaterial.map;
      });
      if (!displayTexture) throw new Error('Black-hole display texture is missing');

      const screenPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshBasicMaterial({
          map: displayTexture,
          color: 0xffffff,
          toneMapped: false,
          depthWrite: false,
        }),
      );
      screenPlane.frustumCulled = false;
      loadedModel = screenPlane;
      loadedModelMaxSize = 2;
      fitModelToViewport();
      group.add(screenPlane);
    }).catch((err) => {
      console.error('Error loading blackhole_skybox.glb:', err);
    });

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      group.rotation.y = 0;
      group.rotation.z = Math.sin(elapsed * 0.35) * 0.018;
      group.scale.setScalar(1 + Math.sin(elapsed * 1.2) * 0.025);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const nextWidth = mount.clientWidth || 820;
      const nextHeight = mount.clientHeight || 520;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
      fitModelToViewport();
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      loadedModel?.traverse((obj: any) => {
        obj.geometry?.dispose?.();
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.forEach((material: THREE.Material | undefined) => material?.dispose());
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 6 }}
      aria-hidden="true"
    />
  );
}

// ── Canvas-based hyperspace warp transition ─────────────────────────────
function HyperspaceWarp({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Hyperspace stars
    const STAR_COUNT = 1200;
    const stars: { x: number; y: number; z: number; speed: number; color: string }[] = [];
    const starColors = ['#ffffff', '#aaccff', '#88bbff', '#66aaff', '#ff9944', '#ffcc66', '#aaaaff'];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 3,
        y: (Math.random() - 0.5) * canvas.height * 3,
        z: Math.random() * 2000,
        speed: 2 + Math.random() * 6,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    let frame = 0;
    const TOTAL_FRAMES = 180; // ~3 seconds at 60fps
    let animId: number;

    const draw = () => {
      frame++;
      const progress = Math.min(frame / TOTAL_FRAMES, 1);

      // Acceleration curve — slow start, extreme speed, then flash
      const accel = Math.pow(progress, 1.8);
      const currentSpeed = 5 + accel * 80;

      // Background — darken then brighten
      if (progress < 0.85) {
        ctx.fillStyle = `rgba(0,0,8,${0.15 + accel * 0.1})`;
      } else {
        // Flash to white at end
        const flash = (progress - 0.85) / 0.15;
        const r = Math.floor(flash * 255);
        const g = Math.floor(flash * 255);
        const b = Math.floor(flash * 255);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.2 + flash * 0.8})`;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Star streaks
      for (const star of stars) {
        const prevZ = star.z;
        star.z -= currentSpeed * star.speed * 0.12;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width * 3;
          star.y = (Math.random() - 0.5) * canvas.height * 3;
          star.z = 2000;
          continue;
        }

        const sx = (star.x / star.z) * 500 + cx;
        const sy = (star.y / star.z) * 500 + cy;
        const px = (star.x / prevZ) * 500 + cx;
        const py = (star.y / prevZ) * 500 + cy;

        // Streak length grows with speed
        const streakLength = Math.sqrt((sx - px) ** 2 + (sy - py) ** 2);
        const brightness = Math.min(1, (1 - star.z / 2000) * (1 + accel * 2));

        // Thicker, brighter lines as we accelerate
        ctx.lineWidth = 0.5 + accel * 2.5;
        ctx.strokeStyle = star.color;
        ctx.globalAlpha = brightness * (0.4 + accel * 0.6);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // Bright head dot
        if (streakLength > 3) {
          ctx.beginPath();
          ctx.arc(sx, sy, 0.5 + accel * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Center tunnel vortex glow
      if (progress > 0.1) {
        const vortexSize = 50 + accel * 250;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, vortexSize);
        gradient.addColorStop(0, `rgba(180,200,255,${0.15 * accel})`);
        gradient.addColorStop(0.3, `rgba(100,150,255,${0.1 * accel})`);
        gradient.addColorStop(0.7, `rgba(60,100,200,${0.05 * accel})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Chromatic ring at center
      if (progress > 0.3) {
        const ringAlpha = Math.min(0.6, (progress - 0.3) * 1.5);
        ctx.strokeStyle = `rgba(100,180,255,${ringAlpha})`;
        ctx.lineWidth = 2 + accel * 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 20 + accel * 60, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (frame >= TOTAL_FRAMES) {
        // Final white flash held
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setTimeout(onComplete, 300);
        return;
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-[60]"
      style={{ width: '100vw', height: '100vh' }} />
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function SpaceBackground({ onGalaxyActiveChange }: SpaceBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const speedRef = useRef(0.5);
  const [warp, setWarp] = useState<number>(1);
  const [hasClickedWarp, setHasClickedWarp] = useState(false);
  const [entering, setEntering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void preloadBlackHoleModel().catch((error) => {
      console.error('Error preloading blackhole_skybox.glb:', error);
    });
  }, []);

  const handleEnter = useCallback(() => {
    setEntering(true);
  }, []);

  const handleWarpComplete = useCallback(() => {
    navigate('/nebula');
  }, [navigate]);

  const handleIncreaseWarp = useCallback(() => {
    setHasClickedWarp(true);
    setWarp((w) => Math.min(10, w + 1));
  }, []);

  useEffect(() => {
    speedRef.current = 0.5 * warp;
  }, [warp]);

  useEffect(() => {
    // Release the other large WebGL scenes as soon as the warp sequence starts,
    // well before the galaxy GLB needs its own context at warp 10.
    onGalaxyActiveChange?.(warp > 1);
  }, [onGalaxyActiveChange, warp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < 800; i++) {
        starsRef.current.push({
          x: Math.random() * 1600 - 800,
          y: Math.random() * 900 - 450,
          z: Math.random() * 1000,
          prevZ: Math.random() * 1000,
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'white';

      for (const star of starsRef.current) {
        star.prevZ = star.z;
        star.z -= speedRef.current;

        if (star.z <= 0) {
          star.x = Math.random() * 1600 - 800;
          star.y = Math.random() * 900 - 450;
          star.z = 1000;
          star.prevZ = 1000;
        }

        const x = (star.x / star.z) * canvas.width / 2 + canvas.width / 2;
        const y = (star.y / star.z) * canvas.height / 2 + canvas.height / 2;
        const prevX = (star.x / star.prevZ) * canvas.width / 2 + canvas.width / 2;
        const prevY = (star.y / star.prevZ) * canvas.height / 2 + canvas.height / 2;
        const radius = (1 - star.z / 1000) * 2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    initStars();
    animate();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'black' }}
      />

      {/* ── Hyperspace canvas warp ── */}
      <AnimatePresence>
        {entering && (
          <HyperspaceWarp onComplete={handleWarpComplete} />
        )}
      </AnimatePresence>

      {/* ── White Hole — appears when warp = 10 ── */}
      <AnimatePresence>
        {warp === 10 && !entering && (
          <motion.div key="wh-wrapper"
            initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
            transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-black pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.9 }}
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.78) 36%, #000 74%)',
              }}
            />
            <div className="relative z-10 h-full w-full pointer-events-auto">

              <button id="are-you-ready-btn" onClick={handleEnter}
                className="relative flex h-full w-full cursor-pointer items-end justify-center border-0 bg-transparent pb-[14vh] text-white outline-none group"
                style={{ perspective: 900 }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                >
                  <BlackHoleSkyboxModel />
                </div>

                {/* Text inside — dark with star shimmer */}
                <div className="hidden"
                  style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 240, zIndex: 8 }}>
                  {/* Shimmer CSS */}
                  <style>{`
                    @keyframes starShimmer {
                      0% { background-position: -200% center; }
                      100% { background-position: 200% center; }
                    }
                    .shimmer-text {
                      background: linear-gradient(
                        105deg,
                        #dff7ff 0%,
                        #ffffff 35%,
                        #ffffff 42%,
                        #77e5ff 45%,
                        #ffffff 48%,
                        #dff7ff 55%,
                        #ffffff 100%
                      );
                      background-size: 200% 100%;
                      -webkit-background-clip: text;
                      background-clip: text;
                      -webkit-text-fill-color: transparent;
                      animation: starShimmer 3s ease-in-out infinite;
                      text-shadow: 0 0 10px rgba(255,255,255,0.95), 0 0 24px rgba(103,232,249,0.8), 0 2px 14px rgba(0,0,0,1);
                    }
                    .shimmer-text-sub {
                      color: rgba(210,245,255,0.95);
                      -webkit-text-fill-color: rgba(210,245,255,0.95);
                      text-shadow: 0 0 10px rgba(103,232,249,0.9), 0 2px 10px #000;
                    }
                  `}</style>
                  <span className="shimmer-text font-black text-center leading-tight"
                    style={{
                      fontSize: 16,
                      letterSpacing: '0.14em',
                      filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.85)) drop-shadow(0 0 20px rgba(103,232,249,0.65))',
                    }}>
                    ARE YOU READY<br />TO GO BEYOND?
                  </span>
                  <span className="shimmer-text-sub text-center mt-2 font-semibold"
                    style={{ fontSize: 9, letterSpacing: '0.2em' }}>
                    ▶ CLICK TO ENTER HYPERSPACE
                  </span>
                </div>
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.55 }}
                  className="relative z-10 pointer-events-none text-center text-sm font-semibold uppercase text-cyan-100/90 transition group-hover:text-white"
                  style={{
                    letterSpacing: '0.22em',
                    textShadow: '0 0 14px rgba(103,232,249,0.75), 0 0 30px rgba(255,255,255,0.22)',
                  }}
                >
                  Click to enter the black hole
                </motion.span>
              </button>

              {/* Subtitle */}
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="hidden">
                approaching the black hole
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warp Controls */}
      <div className="fixed bottom-6 inset-x-0 z-20 flex justify-center">
        <div className="relative flex items-center gap-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 text-white">
          {warp < 10 && !hasClickedWarp && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              transition={{ opacity: { duration: 0.35 }, y: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } }}
              className="absolute -top-12 right-0 flex items-center gap-2 whitespace-nowrap rounded-full border border-cyan-300/25 bg-black/75 px-3 py-1.5 text-xs font-semibold tracking-wide text-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.25)]"
            >
              <span>Click + for warp</span>
            </motion.div>
          )}
          <button
            aria-label="Decrease warp"
            onClick={() => setWarp((w) => Math.max(1, w - 1))}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            –
          </button>
          <span
            className="text-sm tracking-wide font-mono"
            style={warp === 10 ? { color: '#93c5fd', textShadow: '0 0 12px #93c5fd' } : {}}
          >
            WARP {warp}
          </span>
          <button
            aria-label="Increase warp"
            onClick={handleIncreaseWarp}
            className="relative h-8 w-8 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            {warp < 10 && (
              <motion.span
                className="absolute inset-0 rounded-full border border-cyan-300/70"
                animate={{ opacity: [0.9, 0], scale: [1, 1.85] }}
                transition={{ duration: 1.25, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            +
          </button>
        </div>
      </div>
    </>
  );
}

