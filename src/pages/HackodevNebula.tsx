import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Billboard } from '@react-three/drei';
import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

// ── Mouse-controlled orbit camera ─────────────────────────────────────────
function MouseOrbitCamera() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const RADIUS = 22;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    const azimuth = -mouse.current.x * Math.PI * 0.55;
    const elevation = mouse.current.y * Math.PI * 0.22;
    const target = new THREE.Vector3(
      RADIUS * Math.sin(azimuth) * Math.cos(elevation),
      RADIUS * Math.sin(elevation),
      RADIUS * Math.cos(azimuth) * Math.cos(elevation),
    );
    camera.position.lerp(target, 0.035);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Galaxy particle cluster ───────────────────────────────────────────────
interface GalaxyProps {
  position: [number, number, number];
  color: string;
  name: string;
  onClick: () => void;
  hovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

function GalaxyCluster({ position, color, name, onClick, hovered, onPointerOver, onPointerOut }: GalaxyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleVec = useMemo(() => new THREE.Vector3(), []);

  const { positions, colors } = useMemo(() => {
    const count = 3200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const base = new THREE.Color(color);
    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 3);
      const armAngle = (arm / 3) * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.5) * 3.8;
      const spin = radius * 1.4;
      const angle = armAngle + spin + (Math.random() - 0.5) * 0.7;
      const spread = (1 - radius / 4) * 0.4;
      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.4;
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread;
      const b = 0.55 + Math.random() * 0.45;
      colors[i * 3] = base.r * b;
      colors[i * 3 + 1] = base.g * b;
      colors[i * 3 + 2] = base.b * b;
    }
    return { positions, colors };
  }, [color]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    size: hovered ? 0.032 : 0.022,
    vertexColors: true,
    transparent: true,
    opacity: hovered ? 1 : 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), [hovered]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (hovered ? 0.35 : 0.12);
      const s = hovered ? 1.2 : 1;
      groupRef.current.scale.lerp(scaleVec.set(s, s, s), 0.08);
    }
  });

  const ringGeo = useMemo(() => new THREE.RingGeometry(4.0, 4.5, 64), []);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: hovered ? 0.3 : 0.08,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  }), [color, hovered]);

  return (
    <group position={position}>
      <group ref={groupRef} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <points geometry={geo} material={mat} />
        <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI / 2, 0, 0]} />
        <mesh>
          <sphereGeometry args={[4.2, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <Billboard follow>
        <Text position={[0, -5.2, 0]} fontSize={hovered ? 0.48 : 0.34} color={color}
          anchorX="center" anchorY="middle" fillOpacity={hovered ? 1 : 0.7}>
          {name}
        </Text>
        {hovered && (
          <Text position={[0, -5.85, 0]} fontSize={0.22} color="#ffffff"
            anchorX="center" anchorY="middle" fillOpacity={0.55}>
            Click to explore
          </Text>
        )}
      </Billboard>
      {hovered && <pointLight color={color} intensity={4} distance={10} decay={2} />}
    </group>
  );
}

// ── Nebula ambient dust ────────────────────────────────────────────────────
function NebulaDust() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#4f46e5'), new THREE.Color('#7c3aed'),
      new THREE.Color('#2563eb'), new THREE.Color('#0ea5e9'), new THREE.Color('#6d28d9'),
    ];
    for (let i = 0; i < count; i++) {
      const r = 12 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.45;
      positions[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.015; });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial vertexColors size={0.1} transparent opacity={0.45}
        blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
}

// ── Galaxies — spread far apart ───────────────────────────────────────────
const GALAXIES = [
  { id: 'blue-team',    name: 'Blue Team Galaxy',       color: '#3b82f6', position: [-18,  3,  2] as [number,number,number], route: '/nebula/blue-team' },
  { id: 'red-team',     name: 'Red Team Galaxy',        color: '#ef4444', position: [ 17, -4, -6] as [number,number,number], route: null },
  { id: 'cloud-sec',    name: 'Cloud Nebula',           color: '#a855f7', position: [  2,  9,-20] as [number,number,number], route: null },
  { id: 'threat-intel', name: 'Threat Intel Cluster',  color: '#f59e0b', position: [-10, -9,-16] as [number,number,number], route: null },
  { id: 'malware',      name: 'Malware Analytics',     color: '#10b981', position: [ 20,  6,  8] as [number,number,number], route: null },
];

// ── Main page ─────────────────────────────────────────────────────────────
export default function HackodevNebula() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonName, setComingSoonName] = useState('');

  const handleGalaxyClick = useCallback((galaxy: typeof GALAXIES[0]) => {
    if (galaxy.route) {
      navigate(galaxy.route);
    } else {
      setComingSoonName(galaxy.name);
      setShowComingSoon(true);
      setTimeout(() => setShowComingSoon(false), 2500);
    }
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center pt-8 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <h1 className="text-3xl md:text-5xl font-bold tracking-[0.25em] bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-center">
            HACKODEV NEBULA
          </h1>
          <p className="mt-2 text-white/45 text-xs tracking-widest uppercase text-center">
            Move your mouse to explore · Click a galaxy to enter
          </p>
        </motion.div>
      </div>

      {/* Back */}
      <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all text-sm">
        ← Back to Base
      </motion.button>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 4, 22], fov: 65 }} gl={{ antialias: true }}>
        <color attach="background" args={['#00000d']} />
        <fog attach="fog" args={['#00000d', 35, 65]} />
        <Stars radius={100} depth={70} count={8000} factor={5} saturation={0.2} fade speed={0.4} />
        <NebulaDust />
        <MouseOrbitCamera />
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 15, 15]} intensity={0.4} color="#4f46e5" />

        {GALAXIES.map((g) => (
          <GalaxyCluster
            key={g.id}
            position={g.position}
            color={g.color}
            name={g.name}
            hovered={hoveredId === g.id}
            onPointerOver={() => setHoveredId(g.id)}
            onPointerOut={() => setHoveredId(null)}
            onClick={() => handleGalaxyClick(g)}
          />
        ))}
      </Canvas>

      {/* Coming soon toast */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white text-sm">
            🚀 <span className="font-semibold">{comingSoonName}</span> — Coming Soon
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
