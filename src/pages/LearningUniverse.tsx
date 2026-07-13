import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Stars, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import * as THREE from 'three';

export type LearningNode = {
  name: string;
  tagline: string;
  route: string;
  color: string;
  radius: number;
  speed: number;
  tilt: number;
  size: number;
  angle: number;
  rings?: boolean;
};

type LearningUniverseProps = {
  title: string;
  subtitle: string;
  coreLabel: string;
  nodes: LearningNode[];
  palette: [string, string, string];
  variant: 'cloud' | 'intel';
};

function UniverseCamera() {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const distance = useRef(17);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const zoom = (event: WheelEvent) => {
      event.preventDefault();
      distance.current = THREE.MathUtils.clamp(distance.current + event.deltaY * 0.02, 7, 34);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('wheel', zoom, { passive: false });
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('wheel', zoom);
    };
  }, []);

  useFrame(() => {
    const azimuth = -pointer.current.x * Math.PI * 0.5;
    const elevation = 0.28 + pointer.current.y * Math.PI * 0.16;
    const radius = distance.current;
    const target = new THREE.Vector3(
      radius * Math.sin(azimuth) * Math.cos(elevation),
      radius * Math.sin(elevation),
      radius * Math.cos(azimuth) * Math.cos(elevation),
    );
    camera.position.lerp(target, 0.045);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function UniverseCore({ label, palette, variant }: { label: string; palette: string[]; variant: 'cloud' | 'intel' }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (group.current) group.current.rotation.y += delta * (variant === 'cloud' ? 0.11 : -0.16);
    if (inner.current) inner.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.06);
  });

  return (
    <group ref={group}>
      <mesh ref={inner}>
        {variant === 'cloud' ? <icosahedronGeometry args={[1.12, 5]} /> : <octahedronGeometry args={[1.05, 4]} />}
        <meshStandardMaterial color={palette[0]} emissive={palette[1]} emissiveIntensity={3.5} roughness={0.18} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0.2, 0]}>
        <torusGeometry args={[1.75, 0.055, 12, 128]} />
        <meshBasicMaterial color={palette[1]} transparent opacity={0.78} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2.1, -0.5, 0.65]}>
        <torusGeometry args={[2.35, 0.025, 10, 128]} />
        <meshBasicMaterial color={palette[2]} transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {variant === 'cloud' && [2.5, 3.15, 3.8].map((scale, index) => (
        <mesh key={scale} scale={[scale, scale * 0.42, scale]} rotation={[0.2 * index, 0.35 * index, 0]}>
          <sphereGeometry args={[1, 28, 20]} />
          <meshBasicMaterial color={palette[index % palette.length]} transparent opacity={0.035} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      <pointLight color={palette[0]} intensity={18} distance={35} decay={2} />
      <Billboard follow>
        <Text position={[0, -2.9, 0]} fontSize={0.24} color="#ffffff" fillOpacity={0.72} anchorX="center" anchorY="middle">
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

function OrbitPath({ node, color }: { node: LearningNode; color: string }) {
  const line = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let index = 0; index <= 180; index += 1) {
      const angle = (index / 180) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * node.radius,
        Math.sin(angle) * node.tilt,
        Math.sin(angle) * node.radius,
      ));
    }
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
  }, [color, node.radius, node.tilt]);

  useEffect(() => () => {
    line.geometry.dispose();
    (line.material as THREE.Material).dispose();
  }, [line]);

  return <primitive object={line} />;
}

function LearningPlanet({ node, onClick, accent }: { node: LearningNode; onClick: () => void; accent: string }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const angle = useRef(node.angle);
  const [hovered, setHovered] = useState(false);
  const targetScale = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    angle.current += delta * node.speed;
    group.current?.position.set(
      Math.cos(angle.current) * node.radius,
      Math.sin(angle.current) * node.tilt,
      Math.sin(angle.current) * node.radius,
    );
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.4;
      mesh.current.rotation.x += delta * 0.08;
      mesh.current.scale.lerp(targetScale.setScalar(hovered ? 1.25 : 1), 0.1);
    }
  });

  return (
    <group ref={group}>
      <mesh
        ref={mesh}
        onClick={onClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <icosahedronGeometry args={[node.size, 4]} />
        <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={hovered ? 1.9 : 0.8} roughness={0.34} metalness={0.3} toneMapped={false} />
      </mesh>
      <mesh scale={1.26}>
        <sphereGeometry args={[node.size, 24, 24]} />
        <meshBasicMaterial color={node.color} transparent opacity={hovered ? 0.24 : 0.08} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {node.rings && (
        <mesh rotation={[Math.PI * 0.46, 0.2, 0]}>
          <ringGeometry args={[node.size * 1.4, node.size * 2.05, 72]} />
          <meshBasicMaterial color={accent} transparent opacity={0.58} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
      <pointLight color={node.color} intensity={hovered ? 7 : 1.7} distance={7} decay={2} />
      <Billboard follow>
        <Text position={[0, node.size + 0.48, 0]} fontSize={hovered ? 0.29 : 0.21} color={hovered ? '#ffffff' : '#e2e8f0'} anchorX="center" anchorY="middle">
          {node.name}
        </Text>
        {hovered && (
          <Text position={[0, node.size + 0.84, 0]} fontSize={0.125} color={accent} maxWidth={2.7} textAlign="center" anchorX="center" anchorY="middle">
            {node.tagline}
          </Text>
        )}
      </Billboard>
    </group>
  );
}

function UniverseDust({ palette, variant }: { palette: string[]; variant: 'cloud' | 'intel' }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = variant === 'cloud' ? 3600 : 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const swatches = palette.map((color) => new THREE.Color(color));
    for (let index = 0; index < count; index += 1) {
      const radius = 3 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      positions[index * 3] = Math.cos(theta) * radius + (Math.random() - 0.5) * (variant === 'cloud' ? 7 : 2);
      positions[index * 3 + 1] = (Math.random() - 0.5) * (variant === 'cloud' ? 8 : 3.5);
      positions[index * 3 + 2] = Math.sin(theta) * radius + (Math.random() - 0.5) * (variant === 'cloud' ? 7 : 2);
      const color = swatches[index % swatches.length];
      const brightness = 0.35 + Math.random() * 0.65;
      colors[index * 3] = color.r * brightness;
      colors[index * 3 + 1] = color.g * brightness;
      colors[index * 3 + 2] = color.b * brightness;
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    result.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return result;
  }, [palette, variant]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * (variant === 'cloud' ? 0.018 : -0.024);
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={variant === 'cloud' ? 0.095 : 0.07} vertexColors transparent opacity={0.72} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

export default function LearningUniverse({ title, subtitle, coreLabel, nodes, palette, variant }: LearningUniverseProps) {
  const navigate = useNavigate();
  const handleNodeClick = useCallback((node: LearningNode) => navigate(node.route), [navigate]);
  const background = variant === 'cloud' ? '#02030d' : '#090500';

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-8">
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85 }}>
          <h1 className="text-center text-3xl font-bold tracking-[0.2em] md:text-4xl" style={{ color: palette[1], textShadow: `0 0 26px ${palette[0]}` }}>
            {title}
          </h1>
          <p className="mt-1 text-center text-xs uppercase tracking-[0.25em] text-slate-200/40">{subtitle}</p>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35 }}
        onClick={() => navigate('/nebula')}
        className="absolute left-6 top-6 z-30 rounded-full border bg-black/30 px-4 py-2 text-sm text-white/75 backdrop-blur transition hover:bg-white/10 hover:text-white"
        style={{ borderColor: `${palette[0]}66` }}
      >
        ← Back
      </motion.button>

      <Canvas camera={{ position: [0, 5, 17], fov: 55 }} gl={{ antialias: true }}>
        <color attach="background" args={[background]} />
        <fog attach="fog" args={[background, 27, 58]} />
        <Stars radius={95} depth={65} count={5200} factor={4} saturation={0.45} fade speed={0.4} />
        <UniverseCamera />
        <UniverseDust palette={palette} variant={variant} />
        <ambientLight intensity={0.34} />
        <hemisphereLight args={[palette[1], background, 0.75]} />
        <UniverseCore label={coreLabel} palette={palette} variant={variant} />
        {nodes.map((node) => <OrbitPath key={`orbit-${node.name}`} node={node} color={palette[0]} />)}
        {nodes.map((node) => <LearningPlanet key={node.name} node={node} accent={palette[1]} onClick={() => handleNodeClick(node)} />)}
      </Canvas>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-xs tracking-widest text-white/30">
        MOVE MOUSE TO ORBIT · SCROLL TO ZOOM · CLICK A PLANET
      </motion.p>
    </div>
  );
}
