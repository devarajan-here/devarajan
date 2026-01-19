import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function Photo() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 15, 60);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 1.2, 8);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: true,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("WebGL not available or context creation failed. Photo disabled.", err);
      return;
    }

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.9);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x88ccff, 1.1);
    rimLight.position.set(-6, 2, -4);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0x335577, 0.25);
    scene.add(ambient);

    const starsGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = -Math.random() * 40 - 5;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starsGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 })
    );
    scene.add(stars);

    const loader = new GLTFLoader();
    const MODEL_PATH = "/assets/photo.glb"; // Changed to photo.glb
    const group = new THREE.Group();
    scene.add(group);

    let model: THREE.Object3D | null = null;
    loader.load(
      MODEL_PATH,
      (gltf) => {
        model = gltf.scene;
        model.traverse((obj: any) => {
          if (obj.isMesh) {
            obj.castShadow = false;
            obj.receiveShadow = false;
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            for (const m of mats) {
              if (m && typeof m === "object" && "transparent" in m) {
                (m as any).transparent = false;
                if ("opacity" in m && typeof (m as any).opacity === "number") {
                  (m as any).opacity = 1;
                }
                if ("needsUpdate" in m) {
                  (m as any).needsUpdate = true;
                }
              }
            }
          }
        });

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const sizeVec = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxSize = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);

        gltf.scene.position.sub(center);

        // Adjust rotation for the photo model if needed
        gltf.scene.rotation.y = (5 * Math.PI) / 18; // Rotate to the right for left side

        const targetScale = 0.5;
        gltf.scene.scale.setScalar(targetScale);

        const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
        const distance = (maxSize / (2 * Math.tan(halfFovY))) * 0.7; // Made a little farther

        const minDistance = 3; // Made a little farther
        camera.position.set(0, 0, Math.max(distance, minDistance)); // Lowered position

        camera.near = Math.max(0.1, maxSize / 1000);
        camera.far = Math.max(200, maxSize * 10);
        camera.updateProjectionMatrix();

        group.add(gltf.scene);
        gltf.scene.position.y -= 0.5; // Move down a little
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to load photo model:", err);
      }
    );

    const mouse = new THREE.Vector2(0, 0);
    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const lookAtTarget = new THREE.Vector3(0, 0, 0);

    const clock = new THREE.Clock();

    const animate = () => {
      const dt = clock.getDelta();

      if (group && model) {
        // Simple bobbing animation
        group.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
        group.position.x = Math.cos(clock.getElapsedTime() * 0.5) * 0.05;

        // Slow rotation
        model.rotation.y += 0.005;

        // Mouse parallax
        const targetRotX = mouse.y * 0.25;
        const targetRotY = mouse.x * 0.35;
        group.rotation.x += (targetRotX - group.rotation.x) * 0.05;
        group.rotation.y += (targetRotY - group.rotation.y) * 0.04;

        camera.lookAt(lookAtTarget);
      }

      stars.rotation.z += 0.01 * dt;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    let raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      starsGeo.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-y-0 left-0 z-10" // Changed to left-0
      style={{
        width: "55vw",
        minWidth: 320,
        maxWidth: "900px",
      }}
      aria-hidden="true"
    />
  );
}
