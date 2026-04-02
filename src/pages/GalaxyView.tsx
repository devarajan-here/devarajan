import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Billboard } from '@react-three/drei';
import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

// ── Shared mouse+scroll camera controller ─────────────────────────────────
function OrbitScrollCamera({ initialRadius = 14 }: { initialRadius?: number }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const radius = useRef(initialRadius);
  const azimuth = useRef(0);
  const elevation = useRef(0.38);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius.current = Math.max(4, Math.min(28, radius.current + e.deltaY * 0.02));
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  useFrame(() => {
    azimuth.current = -mouse.current.x * Math.PI * 0.7;
    elevation.current = 0.38 + mouse.current.y * Math.PI * 0.25;
    const r = radius.current;
    const el = Math.max(-1.1, Math.min(1.1, elevation.current));
    const target = new THREE.Vector3(
      r * Math.sin(azimuth.current) * Math.cos(el),
      r * Math.sin(el),
      r * Math.cos(azimuth.current) * Math.cos(el),
    );
    camera.position.lerp(target, 0.04);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Atmosphere glow shell ─────────────────────────────────────────────────
function AtmosphereGlow({ size, color }: { size: number; color: string }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.18,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [color]);

  return (
    <mesh>
      <sphereGeometry args={[size * 1.22, 32, 32]} />
      <primitive object={mat} />
    </mesh>
  );
}

// ── Planet ────────────────────────────────────────────────────────────────
interface PlanetProps {
  name: string;
  baseColor: string;
  emissiveColor: string;
  atmosColor: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt: number;
  size: number;
  startAngle: number;
  hasRings?: boolean;
  ringColor?: string;
  cloudOpacity?: number;
  onClick: () => void;
  isSOC?: boolean;
}

function Planet({
  name, baseColor, emissiveColor, atmosColor,
  orbitRadius, orbitSpeed, orbitTilt, size, startAngle,
  hasRings, ringColor, cloudOpacity = 0,
  onClick, isSOC
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(startAngle);
  const scaleVec = useMemo(() => new THREE.Vector3(), []);

  // ── Seeded pseudo-random for deterministic textures ──
  const seededRandom = useCallback((seed: number) => {
    let x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }, []);

  // ── Simple 2D noise function for procedural terrain ──
  const noise2D = useCallback((px: number, py: number, seed: number) => {
    const ix = Math.floor(px); const iy = Math.floor(py);
    const fx = px - ix; const fy = py - iy;
    const ux = fx * fx * (3 - 2 * fx); const uy = fy * fy * (3 - 2 * fy);
    const a = seededRandom(ix + iy * 57 + seed);
    const b = seededRandom(ix + 1 + iy * 57 + seed);
    const c = seededRandom(ix + (iy + 1) * 57 + seed);
    const d = seededRandom(ix + 1 + (iy + 1) * 57 + seed);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }, [seededRandom]);

  const fbm = useCallback((x: number, y: number, seed: number, octaves = 6) => {
    let val = 0, amp = 0.5, freq = 1;
    for (let i = 0; i < octaves; i++) {
      val += amp * noise2D(x * freq, y * freq, seed + i * 100);
      amp *= 0.5; freq *= 2.1;
    }
    return val;
  }, [noise2D]);

  // ── High-detail procedural surface texture + bump map ──
  const { texture, bumpTex } = useMemo(() => {
    const S = 512;
    const canvas = document.createElement('canvas');
    canvas.width = S; canvas.height = S;
    const ctx = canvas.getContext('2d')!;
    const bCanvas = document.createElement('canvas');
    bCanvas.width = S; bCanvas.height = S;
    const bCtx = bCanvas.getContext('2d')!;

    const base = new THREE.Color(baseColor);
    const emC = new THREE.Color(emissiveColor);
    const seed = name.charCodeAt(0) * 137 + name.length * 53;
    const imgData = ctx.createImageData(S, S);
    const bmpData = bCtx.createImageData(S, S);

    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const u = px / S; const v = py / S;
        const lat = (v - 0.5) * Math.PI;

        // Fractal noise terrain
        const n1 = fbm(u * 8, v * 8, seed, 6);
        const n2 = fbm(u * 16 + 50, v * 16 + 50, seed + 7, 4);
        const n3 = fbm(u * 4, v * 4, seed + 20, 3);

        // Terrain height
        const terrain = n1 * 0.6 + n2 * 0.25 + n3 * 0.15;

        // Ice caps near poles
        const poleFade = Math.pow(Math.abs(Math.sin(lat)), 6);

        // Color mixing: deep vs surface
        let r: number, g: number, bl: number;
        const deep = Math.max(0, Math.min(1, (terrain - 0.3) * 3));

        // Mix base color with emissive for surface variation
        r = base.r * 255 * (0.5 + terrain * 0.6) + emC.r * 80 * deep;
        g = base.g * 255 * (0.5 + terrain * 0.6) + emC.g * 80 * deep;
        bl = base.b * 255 * (0.5 + terrain * 0.6) + emC.b * 80 * deep;

        // Latitude bands (gas-giant style subtle bands)
        const bandStrength = Math.sin(v * Math.PI * 18 + n1 * 2) * 0.08;
        r += bandStrength * 30;
        g += bandStrength * 25;
        bl += bandStrength * 20;

        // Surface detail cracks
        const crack = fbm(u * 40, v * 40, seed + 99, 3);
        if (crack > 0.65) {
          r *= 0.85; g *= 0.85; bl *= 0.85;
        }

        // Crater-like dark spots
        const crater = fbm(u * 12, v * 12, seed + 200, 4);
        if (crater > 0.72) {
          const cDepth = (crater - 0.72) * 5;
          r *= (1 - cDepth * 0.3);
          g *= (1 - cDepth * 0.3);
          bl *= (1 - cDepth * 0.25);
        }

        // Ice caps (whitening near poles)
        if (poleFade > 0.15) {
          const iceMix = Math.min(1, (poleFade - 0.15) * 2.5);
          r = r * (1 - iceMix) + 220 * iceMix;
          g = g * (1 - iceMix) + 228 * iceMix;
          bl = bl * (1 - iceMix) + 240 * iceMix;
        }

        // Atmospheric scattering (limb darkening for edges)
        const limbU = Math.abs(u - 0.5) * 2;
        const limbDark = 1 - Math.pow(limbU, 3) * 0.25;
        r *= limbDark; g *= limbDark; bl *= limbDark;

        const idx = (py * S + px) * 4;
        imgData.data[idx] = Math.max(0, Math.min(255, r));
        imgData.data[idx + 1] = Math.max(0, Math.min(255, g));
        imgData.data[idx + 2] = Math.max(0, Math.min(255, bl));
        imgData.data[idx + 3] = 255;

        // Bump map — terrain height as grayscale
        const bump = Math.max(0, Math.min(255, terrain * 255));
        bmpData.data[idx] = bump;
        bmpData.data[idx + 1] = bump;
        bmpData.data[idx + 2] = bump;
        bmpData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    bCtx.putImageData(bmpData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    const bTex = new THREE.CanvasTexture(bCanvas);
    bTex.wrapS = THREE.RepeatWrapping;
    bTex.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: tex, bumpTex: bTex };
  }, [baseColor, emissiveColor, name, fbm]);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    bumpMap: bumpTex,
    bumpScale: 0.035,
    emissive: new THREE.Color(emissiveColor),
    emissiveIntensity: hovered ? 0.45 : (isSOC ? 0.3 : 0.08),
    roughness: 0.8,
    metalness: 0.15,
  }), [texture, bumpTex, emissiveColor, hovered, isSOC]);

  const cloudMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: cloudOpacity,
    roughness: 1,
    depthWrite: false,
  }), [cloudOpacity]);

  // Ring geometry (Saturn-style)
  const ringGeo = useMemo(() => hasRings ? new THREE.RingGeometry(size * 1.5, size * 2.2, 80) : null, [hasRings, size]);
  const ringMat = useMemo(() => hasRings ? new THREE.MeshBasicMaterial({
    color: ringColor ?? '#88aacc',
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }) : null, [hasRings, ringColor]);

  // SOC planet special ring
  const socRingGeo = useMemo(() => isSOC ? new THREE.RingGeometry(size * 1.45, size * 1.75, 64) : null, [isSOC, size]);
  const socRingMat = useMemo(() => isSOC ? new THREE.MeshBasicMaterial({
    color: '#3b82f6',
    transparent: true,
    opacity: hovered ? 0.7 : 0.45,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }) : null, [isSOC, hovered]);

  useFrame((_, delta) => {
    angleRef.current += delta * orbitSpeed;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      groupRef.current.position.y = Math.sin(angleRef.current * 0.3) * orbitTilt;
      groupRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      const s = hovered ? 1.28 : 1;
      meshRef.current.scale.lerp(scaleVec.set(s, s, s), 0.1);
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main sphere */}
      <mesh ref={meshRef} material={mat} onClick={onClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}>
        <sphereGeometry args={[size, 48, 48]} />
      </mesh>

      {/* Cloud layer */}
      {cloudOpacity > 0 && (
        <mesh ref={cloudRef} material={cloudMat}>
          <sphereGeometry args={[size * 1.05, 32, 32]} />
        </mesh>
      )}

      {/* Atmosphere glow */}
      <AtmosphereGlow size={size} color={atmosColor} />

      {/* Rings */}
      {hasRings && ringGeo && ringMat && (
        <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI * 0.42, 0.1, 0.2]} />
      )}

      {/* SOC ring */}
      {isSOC && socRingGeo && socRingMat && (
        <mesh geometry={socRingGeo} material={socRingMat} rotation={[Math.PI / 2.6, 0, 0]} />
      )}

      {hovered && <pointLight color={emissiveColor} intensity={6} distance={8} decay={2} />}

      {/* Label */}
      <Billboard follow>
        <Text position={[0, size + 0.5, 0]} fontSize={hovered ? 0.3 : 0.22}
          color={hovered ? '#ffffff' : '#ffffffaa'} anchorX="center" anchorY="middle">
          {name}
        </Text>
        {hovered && (
          <Text position={[0, size + 0.9, 0]} fontSize={0.15}
            color={isSOC ? '#60a5fa' : '#ffffff66'} anchorX="center" anchorY="middle">
            {isSOC ? '🔵 Click to enter SOC Academy' : 'Coming Soon'}
          </Text>
        )}
      </Billboard>
    </group>
  );
}

// ── Orbit ring ────────────────────────────────────────────────────────────
function OrbitRing({ radius, tilt }: { radius: number; tilt: number }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a * 0.3) * tilt, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius, tilt]);

  return (
    <line geometry={geo}>
      <lineBasicMaterial color="#3b82f6" transparent opacity={0.1} />
    </line>
  );
}

// ── Central blue star ─────────────────────────────────────────────────────
function CentralStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  // Corona texture
  const coronaTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(59,130,246,0.6)');
    g.addColorStop(0.4, 'rgba(59,130,246,0.25)');
    g.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      const p = 1 + Math.sin(t * 2.2) * 0.06;
      meshRef.current.scale.set(p, p, p);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4 + Math.sin(t * 3.1) * 0.35;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.z += 0.003;
    }
  });

  return (
    <group>
      {/* Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.95, 48, 48]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#3b82f6" emissiveIntensity={1.6} roughness={0.05} metalness={0.7} />
      </mesh>
      {/* Corona plane */}
      <mesh ref={coronaRef} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial map={coronaTex} transparent alphaMap={coronaTex} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#3b82f6" intensity={10} distance={24} decay={2} />
      <pointLight color="#60a5fa" intensity={3} distance={40} decay={2} />
    </group>
  );
}

// ── Galaxy background particles ────────────────────────────────────────────
function GalaxyBackground() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 24;
      const t = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(t) * r + (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = Math.sin(t) * r + (Math.random() - 0.5) * 4;
      colors[i * 3] = 0.1 + Math.random() * 0.25;
      colors[i * 3 + 1] = 0.25 + Math.random() * 0.35;
      colors[i * 3 + 2] = 0.55 + Math.random() * 0.45;
    }
    return { positions, colors };
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.03; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.07} vertexColors transparent opacity={0.65}
        blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
}

// ── Planet definitions ────────────────────────────────────────────────────
const PLANETS = [
  {
    name: 'SOC', baseColor: '#1e3a8a', emissiveColor: '#3b82f6', atmosColor: '#60a5fa',
    orbitRadius: 2.8, orbitSpeed: 0.32, orbitTilt: 0.3, size: 0.55, startAngle: 0.5,
    hasRings: false, cloudOpacity: 0.28, isSOC: true, route: '/soc',
  },
  {
    name: 'SIEM', baseColor: '#0c1445', emissiveColor: '#0ea5e9', atmosColor: '#38bdf8',
    orbitRadius: 4.4, orbitSpeed: 0.2, orbitTilt: 0.5, size: 0.44, startAngle: 2.0,
    hasRings: true, ringColor: '#38bdf8', cloudOpacity: 0, isSOC: false, route: null,
  },
  {
    name: 'Threat Intel', baseColor: '#2d1b6b', emissiveColor: '#6366f1', atmosColor: '#818cf8',
    orbitRadius: 6.0, orbitSpeed: 0.15, orbitTilt: 0.7, size: 0.48, startAngle: 1.0,
    hasRings: false, cloudOpacity: 0.18, isSOC: false, route: null,
  },
  {
    name: 'Forensics', baseColor: '#083344', emissiveColor: '#22d3ee', atmosColor: '#67e8f9',
    orbitRadius: 7.5, orbitSpeed: 0.1, orbitTilt: 0.9, size: 0.42, startAngle: 3.5,
    hasRings: true, ringColor: '#22d3ee', cloudOpacity: 0, isSOC: false, route: null,
  },
  {
    name: 'Compliance', baseColor: '#1c1740', emissiveColor: '#818cf8', atmosColor: '#a5b4fc',
    orbitRadius: 9.2, orbitSpeed: 0.07, orbitTilt: 0.4, size: 0.38, startAngle: 0.2,
    hasRings: false, cloudOpacity: 0.35, isSOC: false, route: null,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────
export default function GalaxyView() {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingName, setComingName] = useState('');

  const handlePlanetClick = useCallback((planet: typeof PLANETS[0]) => {
    if (planet.route) {
      navigate(planet.route);
    } else {
      setComingName(planet.name);
      setShowComingSoon(true);
      setTimeout(() => setShowComingSoon(false), 2500);
    }
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center pt-8 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em] text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            BLUE TEAM GALAXY
          </h1>
          <p className="mt-1 text-white/40 text-xs tracking-[0.3em] text-center uppercase">
            Move mouse to orbit · Scroll to zoom · Click a planet
          </p>
        </motion.div>
      </div>

      {/* Back */}
      <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
        onClick={() => navigate('/nebula')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all text-sm">
        ← Hackodev Nebula
      </motion.button>

      {/* Canvas */}
      <Canvas camera={{ position: [0, 5, 14], fov: 55 }} gl={{ antialias: true }}>
        <color attach="background" args={['#00010f']} />
        <fog attach="fog" args={['#00010f', 28, 60]} />
        <Stars radius={90} depth={60} count={5000} factor={4} fade speed={0.4} />
        <GalaxyBackground />
        <OrbitScrollCamera initialRadius={14} />
        <ambientLight intensity={0.08} />
        <CentralStar />

        {PLANETS.map((p) => (
          <OrbitRing key={`ring-${p.name}`} radius={p.orbitRadius} tilt={p.orbitTilt} />
        ))}
        {PLANETS.map((p) => (
          <Planet key={p.name} {...p} onClick={() => handlePlanetClick(p)} />
        ))}
      </Canvas>

      {/* Toast */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white text-sm">
            🚀 <span className="font-semibold">{comingName}</span> — Coming Soon
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-white/25 text-xs tracking-widest pointer-events-none">
        MOVE MOUSE TO ORBIT · SCROLL TO ZOOM
      </motion.p>
    </div>
  );
}
