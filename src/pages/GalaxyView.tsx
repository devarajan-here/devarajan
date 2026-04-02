import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Billboard, Sphere } from '@react-three/drei';
import { useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

// ── Planet ────────────────────────────────────────────────────────────────
interface PlanetProps {
  name: string;
  color: string;
  emissive: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt: number;
  size: number;
  startAngle: number;
  onClick: () => void;
  isSOC?: boolean;
}

function Planet({
  name, color, emissive, orbitRadius, orbitSpeed, orbitTilt, size, startAngle, onClick, isSOC
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(startAngle);

  useFrame((_, delta) => {
    angleRef.current += delta * orbitSpeed;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      groupRef.current.position.y = Math.sin(angleRef.current * 0.3) * orbitTilt;
      groupRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.6;
      const s = hovered ? 1.25 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: hovered ? 0.7 : (isSOC ? 0.5 : 0.2),
    roughness: 0.65,
    metalness: 0.3,
  }), [color, emissive, hovered, isSOC]);

  // ring for SOC planet
  const ringGeo = useMemo(() => isSOC ? new THREE.RingGeometry(size * 1.4, size * 1.7, 64) : null, [isSOC, size]);
  const ringMat = useMemo(() => isSOC ? new THREE.MeshBasicMaterial({
    color: '#3b82f6',
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
  }) : null, [isSOC]);

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        material={mat}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <sphereGeometry args={[size, 32, 32]} />
      </mesh>

      {isSOC && ringGeo && ringMat && (
        <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI / 2.8, 0, 0]} />
      )}

      {hovered && <pointLight color={color} intensity={4} distance={6} decay={2} />}

      <Billboard follow>
        <Text
          position={[0, size + 0.45, 0]}
          fontSize={hovered ? 0.28 : 0.2}
          color={hovered ? '#ffffff' : '#ffffffaa'}
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
        {hovered && (
          <Text
            position={[0, size + 0.8, 0]}
            fontSize={0.14}
            color={isSOC ? '#60a5fa' : '#ffffff66'}
            anchorX="center"
            anchorY="middle"
          >
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
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a * 0.3) * tilt, Math.sin(a) * radius));
    }
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [radius, tilt]);

  return (
    <line geometry={geo}>
      <lineBasicMaterial color="#3b82f6" transparent opacity={0.12} />
    </line>
  );
}

// ── Central blue star ─────────────────────────────────────────────────────
function CentralStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const pulse = 1 + Math.sin(t * 2) * 0.05;
      meshRef.current.scale.set(pulse, pulse, pulse);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.3;
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.9, 32, 32]} />
      <meshStandardMaterial color="#1d4ed8" emissive="#3b82f6" emissiveIntensity={1.5} roughness={0.1} metalness={0.6} />
      <pointLight color="#3b82f6" intensity={8} distance={20} decay={2} />
    </mesh>
  );
}

// ── Galaxy particles ───────────────────────────────────────────────────────
function GalaxyBackground() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 18;
      const t = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(t) * r + (Math.random() - 0.5) * 3;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.sin(t) * r + (Math.random() - 0.5) * 3;
      const blue = 0.5 + Math.random() * 0.5;
      colors[i * 3] = 0.1 + Math.random() * 0.2;
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.3;
      colors[i * 3 + 2] = blue;
    }
    return { positions, colors };
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.04; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
}

// ── Camera slow drift ──────────────────────────────────────────────────────
function CameraDrift() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.07) * 2.5;
    camera.position.y = 3 + Math.cos(t * 0.05) * 1.2;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── Planet definitions ────────────────────────────────────────────────────
const PLANETS = [
  { name: 'SOC', color: '#1e40af', emissive: '#3b82f6', orbitRadius: 2.8, orbitSpeed: 0.35, orbitTilt: 0.3, size: 0.52, startAngle: 0.5, isSOC: true, route: '/soc' },
  { name: 'SIEM', color: '#1e3a5f', emissive: '#0ea5e9', orbitRadius: 4.2, orbitSpeed: 0.22, orbitTilt: 0.5, size: 0.4, startAngle: 2.0, isSOC: false, route: null },
  { name: 'Threat Intel', color: '#14285c', emissive: '#6366f1', orbitRadius: 5.8, orbitSpeed: 0.16, orbitTilt: 0.7, size: 0.45, startAngle: 1.0, isSOC: false, route: null },
  { name: 'Forensics', color: '#0f2545', emissive: '#22d3ee', orbitRadius: 7.2, orbitSpeed: 0.11, orbitTilt: 0.9, size: 0.38, startAngle: 3.5, isSOC: false, route: null },
  { name: 'Compliance', color: '#1a3350', emissive: '#818cf8', orbitRadius: 8.8, orbitSpeed: 0.07, orbitTilt: 0.4, size: 0.35, startAngle: 0.2, isSOC: false, route: null },
];

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
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em] text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            BLUE TEAM GALAXY
          </h1>
          <p className="mt-1 text-white/40 text-xs tracking-[0.3em] text-center uppercase">
            Click a planet to begin your mission
          </p>
        </motion.div>
      </div>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate('/nebula')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all text-sm"
      >
        ← Hackodev Nebula
      </motion.button>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 5, 14], fov: 55 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#00010f']} />
        <fog attach="fog" args={['#00010f', 22, 50]} />
        <Stars radius={90} depth={60} count={5000} factor={4} fade speed={0.4} />
        <GalaxyBackground />
        <CameraDrift />
        <ambientLight intensity={0.1} />
        <CentralStar />

        {PLANETS.map((p) => (
          <OrbitRing key={`ring-${p.name}`} radius={p.orbitRadius} tilt={p.orbitTilt} />
        ))}

        {PLANETS.map((p) => (
          <Planet
            key={p.name}
            name={p.name}
            color={p.color}
            emissive={p.emissive}
            orbitRadius={p.orbitRadius}
            orbitSpeed={p.orbitSpeed}
            orbitTilt={p.orbitTilt}
            size={p.size}
            startAngle={p.startAngle}
            isSOC={p.isSOC}
            onClick={() => handlePlanetClick(p)}
          />
        ))}
      </Canvas>

      {/* Coming Soon toast */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white text-sm"
          >
            🚀 <span className="font-semibold">{comingName}</span> — Coming Soon
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-white/25 text-xs tracking-widest pointer-events-none"
      >
        HOVER OVER PLANETS TO INTERACT
      </motion.p>
    </div>
  );
}
