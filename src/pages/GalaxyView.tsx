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

  // Procedural surface texture via canvas
  const texture = useMemo(() => {
    const s = 256;
    const canvas = document.createElement('canvas');
    canvas.width = s; canvas.height = s;
    const ctx = canvas.getContext('2d')!;
    const base = new THREE.Color(baseColor);

    ctx.fillStyle = `rgb(${Math.round(base.r*220)},${Math.round(base.g*220)},${Math.round(base.b*220)})`;
    ctx.fillRect(0, 0, s, s);

    // latitude bands
    for (let band = 0; band < 12; band++) {
      const y = (band / 12) * s;
      const h = s / 14;
      const br = 0.7 + Math.random() * 0.35;
      ctx.fillStyle = `rgba(${Math.round(base.r*255*br)},${Math.round(base.g*255*br)},${Math.round(base.b*255*br)},0.35)`;
      ctx.fillRect(0, y, s, h);
    }
    // noise dots
    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      const r = Math.random() * 3;
      const br = 0.6 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.round(base.r*255*br)},${Math.round(base.g*255*br)},${Math.round(base.b*255*br)},0.18)`;
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [baseColor]);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    emissive: new THREE.Color(emissiveColor),
    emissiveIntensity: hovered ? 0.55 : (isSOC ? 0.38 : 0.12),
    roughness: 0.72,
    metalness: 0.25,
  }), [texture, emissiveColor, hovered, isSOC]);

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
