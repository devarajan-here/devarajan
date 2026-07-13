import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Stars, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import * as THREE from 'three';

type RedPlanetDefinition = {
  name: string;
  tagline: string;
  route: string;
  textureUrl: string;
  color: string;
  glow: string;
  radius: number;
  speed: number;
  tilt: number;
  size: number;
  angle: number;
  rings?: boolean;
};

function RedOrbitCamera() {
  const { camera, gl } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const radius = useRef(15);
  const focus = useRef(new THREE.Vector3());
  const targetFocus = useRef(new THREE.Vector3());
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = gl.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hasHit = raycaster.ray.intersectPlane(plane, hit);
      radius.current = THREE.MathUtils.clamp(radius.current + event.deltaY * 0.022, 5, 34);
      if (hasHit && event.deltaY < 0) targetFocus.current.lerp(hit, 0.18);
      if (event.deltaY > 0) targetFocus.current.lerp(new THREE.Vector3(), 0.08);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('wheel', onWheel);
    };
  }, [camera, gl, hit, plane, pointer, raycaster]);

  useFrame(() => {
    focus.current.lerp(targetFocus.current, 0.06);
    const azimuth = -mouse.current.x * Math.PI * 0.58;
    const elevation = 0.34 + mouse.current.y * Math.PI * 0.2;
    const r = radius.current;
    const next = new THREE.Vector3(
      r * Math.sin(azimuth) * Math.cos(elevation),
      r * Math.sin(elevation),
      r * Math.cos(azimuth) * Math.cos(elevation),
    ).add(focus.current);
    camera.position.lerp(next, 0.045);
    camera.lookAt(focus.current);
  });

  return null;
}

function RedCore() {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const haloTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(128, 128, 4, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,245,210,1)');
    gradient.addColorStop(0.16, 'rgba(255,78,35,0.92)');
    gradient.addColorStop(0.5, 'rgba(185,18,18,0.28)');
    gradient.addColorStop(1, 'rgba(80,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(({ clock }, delta) => {
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.5) * 0.07;
    core.current?.scale.setScalar(pulse);
    if (halo.current) halo.current.rotation.z += delta * 0.12;
  });

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.05, 5]} />
        <meshStandardMaterial color="#ff4d24" emissive="#ff1800" emissiveIntensity={3.8} roughness={0.18} toneMapped={false} />
      </mesh>
      <mesh ref={halo}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial map={haloTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#ff2d00" intensity={22} distance={42} decay={2} />
      <pointLight color="#ff9a3d" intensity={8} distance={22} decay={2} />
    </group>
  );
}

function RedOrbit({ radius, tilt }: { radius: number; tilt: number }) {
  const orbitLine = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let index = 0; index <= 192; index += 1) {
      const angle = (index / 192) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * tilt,
        Math.sin(angle) * radius,
      ));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: '#ef4444',
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Line(geometry, material);
  }, [radius, tilt]);

  useEffect(() => () => {
    orbitLine.geometry.dispose();
    (orbitLine.material as THREE.Material).dispose();
  }, [orbitLine]);

  return <primitive object={orbitLine} />;
}

function RedPlanet({ planet, onClick }: { planet: RedPlanetDefinition; onClick: () => void }) {
  const orbitGroup = useRef<THREE.Group>(null);
  const globe = useRef<THREE.Mesh>(null);
  const angle = useRef(planet.angle);
  const [hovered, setHovered] = useState(false);
  const texture = useMemo(() => new THREE.TextureLoader().load(planet.textureUrl), [planet.textureUrl]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    color: planet.color,
    emissive: new THREE.Color(planet.glow),
    emissiveIntensity: hovered ? 1.35 : 0.62,
    roughness: 0.5,
    metalness: 0.18,
    toneMapped: false,
  }), [hovered, planet.color, planet.glow, texture]);

  useFrame((_, delta) => {
    angle.current += delta * planet.speed;
    if (orbitGroup.current) {
      orbitGroup.current.position.set(
        Math.cos(angle.current) * planet.radius,
        Math.sin(angle.current) * planet.tilt,
        Math.sin(angle.current) * planet.radius,
      );
    }
    if (globe.current) {
      globe.current.rotation.y += delta * 0.42;
      globe.current.scale.lerp(new THREE.Vector3().setScalar(hovered ? 1.24 : 1), 0.1);
    }
  });

  return (
    <group ref={orbitGroup}>
      <mesh
        ref={globe}
        material={material}
        onClick={onClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[planet.size, 40, 40]} />
      </mesh>
      <mesh scale={1.18}>
        <sphereGeometry args={[planet.size, 28, 28]} />
        <meshBasicMaterial color={planet.glow} transparent opacity={hovered ? 0.28 : 0.13} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {planet.rings && (
        <mesh rotation={[Math.PI * 0.46, 0.2, 0]}>
          <ringGeometry args={[planet.size * 1.45, planet.size * 2.05, 72]} />
          <meshBasicMaterial color="#ff5a36" transparent opacity={0.58} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
      <pointLight color={planet.glow} intensity={hovered ? 8 : 2} distance={7} decay={2} />
      <Billboard follow>
        <Text position={[0, planet.size + 0.5, 0]} fontSize={hovered ? 0.3 : 0.22} color={hovered ? '#ffffff' : '#fecaca'} anchorX="center" anchorY="middle">
          {planet.name}
        </Text>
        {hovered && (
          <Text position={[0, planet.size + 0.88, 0]} fontSize={0.13} color="#fb923c" maxWidth={2.8} textAlign="center" anchorX="center" anchorY="middle">
            {planet.tagline}
          </Text>
        )}
      </Billboard>
    </group>
  );
}

function RedDust() {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 2600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const radius = 5 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      positions[index * 3] = Math.cos(theta) * radius + (Math.random() - 0.5) * 3;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[index * 3 + 2] = Math.sin(theta) * radius + (Math.random() - 0.5) * 3;
      colors[index * 3] = 0.55 + Math.random() * 0.45;
      colors[index * 3 + 1] = 0.03 + Math.random() * 0.18;
      colors[index * 3 + 2] = 0.02 + Math.random() * 0.08;
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    result.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return result;
  }, []);
  useFrame((_, delta) => { if (points.current) points.current.rotation.y -= delta * 0.025; });
  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={0.075} vertexColors transparent opacity={0.78} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

const RED_PLANETS: RedPlanetDefinition[] = [
  { name: 'Engagement Planning', tagline: 'Scope, rules, evidence, safety', route: '/red-team/engagement-planning', textureUrl: '/textures/earth.jpg', color: '#7f1d1d', glow: '#ff3b1f', radius: 3, speed: 0.28, tilt: 0.35, size: 0.58, angle: 0.3, rings: true },
  { name: 'Reconnaissance', tagline: 'Asset discovery and attack surface', route: '/red-team/reconnaissance', textureUrl: '/textures/mars.jpg', color: '#991b1b', glow: '#fb7185', radius: 4.8, speed: 0.2, tilt: 0.55, size: 0.47, angle: 1.9 },
  { name: 'Web Applications', tagline: 'Authorized application assessment', route: '/red-team/web-applications', textureUrl: '/textures/jupiter.jpg', color: '#9a3412', glow: '#f97316', radius: 6.5, speed: 0.15, tilt: 0.78, size: 0.5, angle: 3.2 },
  { name: 'Network Testing', tagline: 'Services, segmentation, exposure', route: '/red-team/network-testing', textureUrl: '/textures/neptune.jpg', color: '#7f1d1d', glow: '#ef4444', radius: 8.2, speed: 0.11, tilt: 0.92, size: 0.45, angle: 5.1, rings: true },
  { name: 'Active Directory', tagline: 'Identity paths and privilege risk', route: '/red-team/active-directory', textureUrl: '/textures/earth.jpg', color: '#881337', glow: '#f43f5e', radius: 9.9, speed: 0.086, tilt: 0.48, size: 0.49, angle: 2.4 },
  { name: 'Cloud Testing', tagline: 'IAM, workload, and configuration paths', route: '/red-team/cloud-testing', textureUrl: '/textures/neptune.jpg', color: '#9f1239', glow: '#fb7185', radius: 11.5, speed: 0.071, tilt: 1.12, size: 0.43, angle: 4.2 },
  { name: 'Social Engineering', tagline: 'People, process, and awareness controls', route: '/red-team/social-engineering', textureUrl: '/textures/mars.jpg', color: '#9a3412', glow: '#fdba74', radius: 13.1, speed: 0.058, tilt: 0.72, size: 0.4, angle: 0.8, rings: true },
  { name: 'Post-Exploitation', tagline: 'Impact validation and cleanup', route: '/red-team/post-exploitation', textureUrl: '/textures/jupiter.jpg', color: '#701a75', glow: '#f43f5e', radius: 14.7, speed: 0.048, tilt: 1.28, size: 0.46, angle: 3.7 },
  { name: 'Reporting', tagline: 'Evidence, risk, and remediation', route: '/red-team/reporting', textureUrl: '/textures/earth.jpg', color: '#7c2d12', glow: '#f59e0b', radius: 16.2, speed: 0.04, tilt: 0.88, size: 0.42, angle: 5.6 },
];

export default function RedTeamGalaxy() {
  const navigate = useNavigate();
  const handlePlanetClick = useCallback((planet: RedPlanetDefinition) => navigate(planet.route), [navigate]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#070001]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-8">
        <motion.div initial={{ opacity: 0, y: -26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          <h1 className="bg-gradient-to-r from-red-500 via-orange-400 to-rose-400 bg-clip-text text-center text-3xl font-bold tracking-[0.22em] text-transparent md:text-4xl">
            RED TEAM GALAXY
          </h1>
          <p className="mt-1 text-center text-xs uppercase tracking-[0.28em] text-red-100/40">
            Authorized testing · Adversary simulation · Actionable reporting
          </p>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate('/nebula')}
        className="absolute left-6 top-6 z-30 rounded-full border border-red-300/20 bg-red-950/35 px-4 py-2 text-sm text-red-100/80 backdrop-blur transition hover:bg-red-900/50 hover:text-white"
      >
        ← Back
      </motion.button>

      <Canvas camera={{ position: [0, 5, 15], fov: 55 }} gl={{ antialias: true }}>
        <color attach="background" args={['#070001']} />
        <fog attach="fog" args={['#070001', 25, 55]} />
        <Stars radius={90} depth={60} count={5200} factor={4} saturation={0.55} fade speed={0.45} />
        <RedDust />
        <RedOrbitCamera />
        <ambientLight intensity={0.32} />
        <hemisphereLight args={['#fecaca', '#240004', 0.72]} />
        <RedCore />
        {RED_PLANETS.map((planet) => <RedOrbit key={`orbit-${planet.name}`} radius={planet.radius} tilt={planet.tilt} />)}
        {RED_PLANETS.map((planet) => <RedPlanet key={planet.name} planet={planet} onClick={() => handlePlanetClick(planet)} />)}
      </Canvas>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-xs tracking-widest text-red-100/30">
        MOVE MOUSE TO ORBIT · SCROLL TO ZOOM · CLICK A PLANET
      </motion.p>
    </div>
  );
}
