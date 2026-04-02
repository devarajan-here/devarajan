import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Billboard } from '@react-three/drei';
import { useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

// ── Galaxy particle cluster ────────────────────────────────────────────────
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
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 3);
      const armAngle = (arm / 3) * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.6) * 2.2;
      const spin = radius * 1.2;
      const angle = armAngle + spin + (Math.random() - 0.5) * 0.6;
      const spread = (1 - radius / 3) * 0.25;

      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread;

      const brightness = 0.6 + Math.random() * 0.4;
      colors[i * 3] = baseColor.r * brightness;
      colors[i * 3 + 1] = baseColor.g * brightness;
      colors[i * 3 + 2] = baseColor.b * brightness;
    }
    return { positions, colors };
  }, [color]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const material = useMemo(() => new THREE.PointsMaterial({
    size: hovered ? 0.028 : 0.018,
    vertexColors: true,
    transparent: true,
    opacity: hovered ? 1 : 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), [hovered]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (hovered ? 0.4 : 0.15);
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
    }
    if (particlesRef.current) {
      (particlesRef.current.material as THREE.PointsMaterial).size = THREE.MathUtils.lerp(
        (particlesRef.current.material as THREE.PointsMaterial).size,
        hovered ? 0.028 : 0.018,
        0.1
      );
    }
  });

  const [vec] = useState(() => new THREE.Vector3());
  useFrame(({ camera }) => {
    if (groupRef.current) {
      const scale = hovered ? 1.18 : 1;
      groupRef.current.scale.lerp(vec.set(scale, scale, scale), 0.08);
    }
  });

  // Glow ring
  const ringGeo = useMemo(() => new THREE.RingGeometry(2.3, 2.6, 64), []);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: hovered ? 0.35 : 0.1,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }), [color, hovered]);

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <points ref={particlesRef} geometry={geometry} material={material} />
        <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI / 2, 0, 0]} />
        {/* Invisible click target */}
        <mesh>
          <sphereGeometry args={[2.5, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* Label */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, -3.2, 0]}
          fontSize={hovered ? 0.38 : 0.28}
          color={color}
          anchorX="center"
          anchorY="middle"
          font={undefined}
          fillOpacity={hovered ? 1 : 0.75}
        >
          {name}
        </Text>
        {hovered && (
          <Text
            position={[0, -3.75, 0]}
            fontSize={0.18}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.6}
          >
            Click to explore
          </Text>
        )}
      </Billboard>

      {/* Halo glow point light */}
      {hovered && <pointLight color={color} intensity={3} distance={8} decay={2} />}
    </group>
  );
}

// ── Nebula ambient particles ──────────────────────────────────────────────
function NebulaDust() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#4f46e5'),
      new THREE.Color('#7c3aed'),
      new THREE.Color('#2563eb'),
      new THREE.Color('#0ea5e9'),
      new THREE.Color('#6d28d9'),
    ];
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.35;
      positions[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.025;
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        vertexColors
        size={0.08}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ── Camera drift ──────────────────────────────────────────────────────────
function CameraDrift() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.1) * 1.5;
    camera.position.y = Math.cos(t * 0.08) * 0.8;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── Main page ─────────────────────────────────────────────────────────────
const GALAXIES = [
  { id: 'blue-team', name: 'Blue Team Galaxy', color: '#3b82f6', position: [-5, 0.5, 0] as [number, number, number], route: '/nebula/blue-team' },
  { id: 'red-team', name: 'Red Team Galaxy', color: '#ef4444', position: [5.5, -0.5, -2] as [number, number, number], route: null },
  { id: 'cloud-sec', name: 'Cloud Nebula', color: '#a855f7', position: [1, 1.5, -6] as [number, number, number], route: null },
  { id: 'threat-intel', name: 'Threat Intel Cluster', color: '#f59e0b', position: [-4, -1.5, -5] as [number, number, number], route: null },
];

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
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-5xl font-bold tracking-[0.25em] bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            HACKODEV NEBULA
          </h1>
          <p className="mt-2 text-white/50 text-sm tracking-widest uppercase">
            Select a galaxy to explore
          </p>
        </motion.div>
      </div>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all text-sm"
      >
        ← Back to Base
      </motion.button>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 2, 14], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#00000f']} />
        <fog attach="fog" args={['#00000f', 20, 45]} />
        <Stars radius={80} depth={60} count={6000} factor={4} saturation={0.3} fade speed={0.5} />
        <NebulaDust />
        <CameraDrift />

        <ambientLight intensity={0.15} />
        <pointLight position={[0, 10, 10]} intensity={0.5} color="#4f46e5" />

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
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white text-sm"
          >
            🚀 <span className="font-semibold">{comingSoonName}</span> — Coming Soon
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-white/30 text-xs tracking-widest pointer-events-none"
      >
        HOVER &amp; CLICK A GALAXY TO ENTER
      </motion.p>
    </div>
  );
}
