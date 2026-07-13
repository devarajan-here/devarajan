import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Billboard } from '@react-three/drei';
import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

// ── Mouse-controlled orbit camera ─────────────────────────────────────────
function MouseOrbitCamera({ focusTarget }: { focusTarget: [number, number, number] | null }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const radius = useRef(38);
  const RADIUS_MIN = 14;
  const RADIUS_MAX = 80;
  const focus = useRef(new THREE.Vector3(0, 0, 0));
  const targetFocus = useRef(new THREE.Vector3(0, 0, 0));
  const focusTargetRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    focusTargetRef.current = focusTarget ? new THREE.Vector3(...focusTarget) : null;
  }, [focusTarget]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius.current = Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, radius.current + e.deltaY * 0.06));

      if (e.deltaY < 0 && focusTargetRef.current) {
        targetFocus.current.copy(focusTargetRef.current);
      } else if (e.deltaY > 0 && radius.current > 42) {
        targetFocus.current.set(0, 0, 0);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  useFrame(() => {
    const azimuth = -mouse.current.x * Math.PI * 0.55;
    const elevation = mouse.current.y * Math.PI * 0.22;
    focus.current.lerp(targetFocus.current, 0.07);
    const r = radius.current;
    const target = new THREE.Vector3(
      r * Math.sin(azimuth) * Math.cos(elevation),
      r * Math.sin(elevation),
      r * Math.cos(azimuth) * Math.cos(elevation),
    ).add(focus.current);
    camera.position.lerp(target, 0.045);
    camera.lookAt(focus.current);
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
  const coreRef = useRef<THREE.Mesh>(null);
  const scaleVec = useMemo(() => new THREE.Vector3(), []);
  const baseColor = useMemo(() => new THREE.Color(color), [color]);

  // Main spiral particles — 4 arms, 8000 stars, radius 14
  const { positions: mainPos, colors: mainCol, sizes } = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const white = new THREE.Color('#ffffff');
    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 4);
      const armAngle = (arm / 4) * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.6) * 14;
      const spin = r * 1.2;
      const angle = armAngle + spin + (Math.random() - 0.5) * (0.5 + r * 0.04);
      const spread = Math.max(0.1, (1 - r / 16)) * 0.9;
      positions[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.35;
      positions[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * spread;
      // Color: bright white at core, colored at edges
      const coreFade = Math.max(0, 1 - r / 5);
      const b = 0.6 + Math.random() * 0.4;
      const mixed = baseColor.clone().lerp(white, coreFade * 0.7);
      colors[i * 3] = mixed.r * b;
      colors[i * 3 + 1] = mixed.g * b;
      colors[i * 3 + 2] = mixed.b * b;
      // Bigger particles near core
      sizes[i] = (0.03 + coreFade * 0.06 + Math.random() * 0.02) * (hovered ? 1.4 : 1);
    }
    return { positions, colors, sizes };
  }, [baseColor, hovered]);

  // Outer dust halo
  const { positions: dustPos, colors: dustCol } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.5;
      positions[i * 3] = Math.cos(theta) * r * Math.cos(phi);
      positions[i * 3 + 1] = Math.sin(phi) * r * 0.15;
      positions[i * 3 + 2] = Math.sin(theta) * r * Math.cos(phi);
      const b = 0.3 + Math.random() * 0.3;
      colors[i * 3] = baseColor.r * b;
      colors[i * 3 + 1] = baseColor.g * b;
      colors[i * 3 + 2] = baseColor.b * b;
    }
    return { positions, colors };
  }, [baseColor]);

  const mainGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(mainPos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(mainCol, 3));
    return g;
  }, [mainPos, mainCol]);

  const mainMat = useMemo(() => new THREE.PointsMaterial({
    size: hovered ? 0.08 : 0.055,
    vertexColors: true,
    transparent: true,
    opacity: hovered ? 1 : 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), [hovered]);

  const dustGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(dustCol, 3));
    return g;
  }, [dustPos, dustCol]);

  const dustMat = useMemo(() => new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: hovered ? 0.35 : 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), [hovered]);

  // Glowing core texture
  const coreTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, `rgba(255,255,255,0.9)`);
    g.addColorStop(0.15, color.replace('#', 'rgba(') ? `${color}cc` : 'rgba(100,150,255,0.8)');
    g.addColorStop(0.5, `${color}44`);
    g.addColorStop(1, `${color}00`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, [color]);

  const ringGeo = useMemo(() => new THREE.RingGeometry(14, 15.5, 80), []);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: hovered ? 0.25 : 0.06,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  }), [color, hovered]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (hovered ? 0.3 : 0.1);
      const s = hovered ? 1.15 : 1;
      groupRef.current.scale.lerp(scaleVec.set(s, s, s), 0.06);
    }
    if (coreRef.current) {
      const p = 1 + Math.sin(Date.now() * 0.002) * 0.08;
      coreRef.current.scale.set(p, p, p);
    }
  });

  return (
    <group position={position}>
      <group ref={groupRef} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        {/* Main spiral stars */}
        <points geometry={mainGeo} material={mainMat} />
        {/* Dust halo */}
        <points geometry={dustGeo} material={dustMat} />
        {/* Glowing core */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[1.8, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={hovered ? 0.7 : 0.45}
            blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* Core glow plane */}
        <mesh rotation={[0, 0, 0]}>
          <planeGeometry args={[12, 12]} />
          <meshBasicMaterial map={coreTex} transparent depthWrite={false}
            blending={THREE.AdditiveBlending} side={THREE.DoubleSide}
            opacity={hovered ? 0.8 : 0.5} />
        </mesh>
        {/* Outer ring */}
        <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI / 2, 0, 0]} />
        {/* Clickable hitbox */}
        <mesh>
          <sphereGeometry args={[15, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <Billboard follow>
        <Text position={[0, -17, 0]} fontSize={hovered ? 1.4 : 1.1} color={color}
          anchorX="center" anchorY="middle" fillOpacity={hovered ? 1 : 0.75}
          outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>
        {hovered && (
          <Text position={[0, -18.8, 0]} fontSize={0.6} color="#ffffff"
            anchorX="center" anchorY="middle" fillOpacity={0.6}>
            Click to explore
          </Text>
        )}
      </Billboard>
      {/* Ambient glow light */}
      <pointLight color={color} intensity={hovered ? 12 : 3} distance={hovered ? 30 : 20} decay={2} />
    </group>
  );
}

// ── Nebula ambient dust ────────────────────────────────────────────────────
function NebulaDust() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#4f46e5'), new THREE.Color('#7c3aed'),
      new THREE.Color('#2563eb'), new THREE.Color('#0ea5e9'), new THREE.Color('#6d28d9'),
    ];
    for (let i = 0; i < count; i++) {
      const r = 15 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
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

  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.012; });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial vertexColors size={0.15} transparent opacity={0.4}
        blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
}

// ── Custom SkySphere component (replaces cubemap with repeating sphere) ───
function SkySphere({ texturePath }: { texturePath: string }) {
  const { scene } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    // Clear standard cubemap background
    scene.background = null;

    const loader = new THREE.TextureLoader();
    loader.load(texturePath, (tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1, 1); // Render one single continuous image across the entire sphere
      setTexture(tex);
    });
  }, [scene, texturePath]);

  if (!texture) return null;

  return (
    <mesh>
      <sphereGeometry args={[200, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

// ── Galaxies — spread far apart ───────────────────────────────────────────
const GALAXIES = [
  { id: 'blue-team',    name: 'Blue Team Galaxy',       color: '#3b82f6', position: [-38,  6,  4] as [number,number,number], route: '/nebula/blue-team' },
  { id: 'red-team',     name: 'Red Team Galaxy',        color: '#ef4444', position: [ 35, -8,-14] as [number,number,number], route: null },
  { id: 'cloud-sec',    name: 'Cloud Nebula',           color: '#a855f7', position: [  4, 18,-40] as [number,number,number], route: null },
  { id: 'threat-intel', name: 'Threat Intel Cluster',  color: '#f59e0b', position: [-20,-18,-32] as [number,number,number], route: null },
  { id: 'malware',      name: 'Malware Analytics',     color: '#10b981', position: [ 40, 12, 16] as [number,number,number], route: null },
];

// ── Main page ─────────────────────────────────────────────────────────────
export default function HackodevNebula() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonName, setComingSoonName] = useState('');
  const [musicIndex, setMusicIndex] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  
  const SCENERIES = useMemo(() => [
    { name: 'Classic Stars', path: '/textures/skybox/stars.png?v=2' },
    { name: 'Emerald Nebula', path: '/textures/skybox/stars_green.png?v=2' },
    { name: 'Amethyst Cosmos', path: '/textures/skybox/stars_purple.png?v=2' },
  ], []);

  const hoveredGalaxy = useMemo(
    () => GALAXIES.find((galaxy) => galaxy.id === hoveredId) ?? null,
    [hoveredId],
  );

  const TRACKS = useMemo(() => [
    { name: 'Star Wars Theme', src: '/star-wars-theme.mp3' },
    { name: 'Nebula Drift', src: '/1.mpeg' },
  ], []);

  const handleGalaxyClick = useCallback((galaxy: typeof GALAXIES[0]) => {
    if (galaxy.route) {
      navigate(galaxy.route);
    } else {
      setComingSoonName(galaxy.name);
      setShowComingSoon(true);
      setTimeout(() => setShowComingSoon(false), 2500);
    }
  }, [navigate]);

  // Cycle to next music track
  const handleNextTrack = useCallback(() => {
    const nextIdx = (musicIndex + 1) % TRACKS.length;
    setMusicIndex(nextIdx);
    const globalAudio = document.querySelector('audio') as HTMLAudioElement | null;
    if (globalAudio) {
      globalAudio.src = TRACKS[nextIdx].src;
      globalAudio.play().catch(() => {});
    }
  }, [musicIndex, TRACKS]);

  // Cycle to next background scenery
  const handleNextBg = useCallback(() => {
    setBgIndex((prev) => (prev + 1) % SCENERIES.length);
  }, [SCENERIES]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center pt-8 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <style>{`
            .hover-space-title {
              color: #ffffff;
              text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
              transition: all 0.5s ease;
            }
            .hover-space-title:hover {
              letter-spacing: 0.35em;
              text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(130, 170, 255, 0.6);
              transform: translateY(-2px);
            }
          `}</style>
          <h1 className="hover-space-title text-3xl md:text-5xl font-bold tracking-[0.25em] text-center cursor-default pointer-events-auto">
            HACKERS INTERGALACTIC SPACE
          </h1>
          <p className="mt-2 text-white/45 text-xs tracking-widest uppercase text-center">
            Move your mouse to explore · Click a galaxy to enter
          </p>

          {/* ── Music switcher ── */}
          <div className="flex items-center justify-center gap-3 mt-3 pointer-events-auto">
            {/* Next Track Button */}
            <button onClick={handleNextTrack}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/15 text-white/60 hover:bg-white/15 hover:text-white hover:border-white/30 transition-all duration-300 hover:scale-105"
              title={`Now playing: ${TRACKS[musicIndex].name}`}
            >
              <svg className="w-3 h-3 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
              </svg>
              <span className="text-[8px] tracking-[0.12em] uppercase font-medium">
                {TRACKS[(musicIndex + 1) % TRACKS.length].name}
              </span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Back */}
      <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all text-sm">
        ← Back to Base
      </motion.button>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 6, 38], fov: 65 }} gl={{ antialias: true }}>
        <SkySphere texturePath={SCENERIES[bgIndex].path} />
        <Stars radius={150} depth={100} count={12000} factor={6} saturation={0.2} fade speed={0.4} />
        <NebulaDust />
        <MouseOrbitCamera focusTarget={hoveredGalaxy?.position ?? null} />
        <ambientLight intensity={0.2} />
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

      {/* Floating Scenery Change Button (Stacked above audio button) */}
      <button
        onClick={handleNextBg}
        className="fixed bottom-[100px] right-6 z-50 p-4 rounded-full bg-black border border-white/20 text-white shadow-lg hover:shadow-xl hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 group"
        aria-label="Change space scenery"
        title={`Change scenery (Current: ${SCENERIES[bgIndex].name})`}
      >
        <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z"/>
        </svg>
      </button>

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
