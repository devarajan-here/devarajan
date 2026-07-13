import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

THREE.Cache.enabled = true;

const MODEL_PATH = "/assets/racing_ship (1).glb";

export default function Spaceship() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 15, 60);

    // Narrower FOV for better composition and compatibility
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 1.2, 8);

    // Create WebGL renderer with graceful fallback if WebGL is unavailable
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
      console.warn("WebGL not available or context creation failed. Spaceship disabled.", err);
      return; // Exit effect early to avoid runtime errors
    }

    // Add cinematic tone mapping + exposure for better visibility
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Lights (increase brightness and add subtle ambient)
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

    // Subtle star-like points to complement background
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

    // Load GLB
    const loader = new GLTFLoader();
    const group = new THREE.Group();
    scene.add(group);

    // Engine glow (light + sprite) that follows the ship
    const engineLight = new THREE.PointLight(0x66aaff, 1.4, 6, 2.0);
    scene.add(engineLight);

    let model: THREE.Object3D | null = null;
    loader.load(
      MODEL_PATH,
      (gltf) => {
        model = gltf.scene;
        model.traverse((obj: any) => {
          if (obj.isMesh) {
            obj.castShadow = false;
            obj.receiveShadow = false;
            // Preserve original materials and avoid unintended transparency
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

        // Auto-fit camera to model so it doesn't fill the entire viewport
        // and remains nicely framed across devices.
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const sizeVec = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxSize = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);

        // Re-center model around origin for stable animation
        gltf.scene.position.sub(center);

        // Rotate 50 degrees to the left on the horizontal plane
        gltf.scene.rotation.y = (-5 * Math.PI) / 18;

        // Optional: small uniform scale if model is huge or tiny in native units
        const targetScale = 0.5; // tweak if needed
        gltf.scene.scale.setScalar(targetScale);

        // Compute a camera distance that fits the model with some margin
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
        const distance = (maxSize / (2 * Math.tan(halfFovY))) * 0.5; // Made closer

        // Clamp to ensure it never gets too close on small models
        const minDistance = 2;
        camera.position.set(0, 1.2, Math.max(distance, minDistance) + 1); // Moved camera back slightly

        // Update clipping planes to suit model size, then apply
        camera.near = 0.001; // Made near clipping plane even closer
        camera.far = Math.max(200, maxSize * 10);
        camera.updateProjectionMatrix();

        // Add to scene after fit
        group.add(gltf.scene);
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to load spaceship model:", err);
      }
    );

    // Mouse parallax
    const mouse = new THREE.Vector2(0, 0);
    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("mousemove", onMouseMove);

    // Resize
    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Add a smoothed look-at target for the camera to follow the ship
    const lookAtTarget = new THREE.Vector3(0, 0, 0);

    // Animation path
    const path = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(9, -2.2, -3),
        new THREE.Vector3(5, -1.25, -3),
        new THREE.Vector3(1.4, -0.25, -3),
        new THREE.Vector3(-2.4, 0.35, -3),
        new THREE.Vector3(-8, 0.85, -3),
        new THREE.Vector3(-12, 1, -3),
      ],
      false,
      "centripetal",
      0.35
    );
    const targetPosition = new THREE.Vector3();
    const smoothedPosition = new THREE.Vector3(9, -2.2, -3);
    const smoothedRotation = new THREE.Euler();

    // Warp streaks
    const warpStreaksGeo = new THREE.BufferGeometry();
    const warpStreaksCount = 500;
    const warpStreaksPos = new Float32Array(warpStreaksCount * 3);
    for (let i = 0; i < warpStreaksCount; i++) {
        warpStreaksPos[i * 3 + 0] = (Math.random() - 0.5) * 20;
        warpStreaksPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
        warpStreaksPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    warpStreaksGeo.setAttribute('position', new THREE.BufferAttribute(warpStreaksPos, 3));
    const warpStreaksMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.03,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const warpStreaks = new THREE.Points(warpStreaksGeo, warpStreaksMat);
    scene.add(warpStreaks);

    let t = 0;
    const clock = new THREE.Clock();
    let hyperjumpState = {
        active: false,
        time: 0,
    };

    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    const animate = () => {
      const dt = clock.getDelta();
      t += dt;

      if (group && model) {
        const speed = 0.08;
        let s = (t * speed) % 1.1; // Looping animation

        if (s > 1 && !hyperjumpState.active) {
            hyperjumpState.active = true;
            hyperjumpState.time = 0;
        }

        if (hyperjumpState.active) {
            hyperjumpState.time += dt;
            const jumpProgress = Math.min(hyperjumpState.time / 2, 1); // 2 second jump
            const easedProgress = easeInOutCubic(jumpProgress);

            // Warp streaks
            warpStreaks.position.copy(group.position);
            warpStreaksMat.opacity = easedProgress;
            const positions = warpStreaksGeo.attributes.position.array as Float32Array;
            for (let i = 0; i < warpStreaksCount; i++) {
                positions[i * 3 + 2] += 1 * easedProgress;
                if (positions[i * 3 + 2] > 10) {
                    positions[i * 3 + 2] = -10;
                }
            }
            warpStreaksGeo.attributes.position.needsUpdate = true;


            // Scale down
            const scale = 1 - easedProgress;
            group.scale.set(scale, scale, scale);

            // Z-dive
            group.position.z -= easedProgress * 0.5;

            // Exposure flash
            renderer.toneMappingExposure = 1.2 + easedProgress * 3;

            // Engine glow fade out
            engineLight.intensity = 1.4 * (1 - easedProgress);

            if (jumpProgress >= 1) {
                group.visible = false; // Hide the ship
                t = 0;
                hyperjumpState.active = false;
                group.scale.set(1, 1, 1);
                smoothedPosition.set(9, -2.2, -3);
                targetPosition.copy(smoothedPosition);
                group.position.copy(smoothedPosition);
                smoothedRotation.set(0, 0, 0);
                group.rotation.copy(smoothedRotation);
                renderer.toneMappingExposure = 1.2;
                engineLight.intensity = 1.4;
                warpStreaksMat.opacity = 0;
            }
        } else {
            group.visible = true; // Show the ship
            const pathProgress = THREE.MathUtils.smoothstep(s, 0, 1);
            const pathPoint = path.getPointAt(pathProgress);
            targetPosition.copy(pathPoint);

            // Bobbing and drift
            targetPosition.y += Math.sin(t * 1.5) * 0.08;
            targetPosition.x += Math.sin(t * 1.2) * 0.04;
            smoothedPosition.x = THREE.MathUtils.damp(smoothedPosition.x, targetPosition.x, 5, dt);
            smoothedPosition.y = THREE.MathUtils.damp(smoothedPosition.y, targetPosition.y, 5, dt);
            smoothedPosition.z = THREE.MathUtils.damp(smoothedPosition.z, targetPosition.z, 5, dt);
            group.position.copy(smoothedPosition);


            // Banking
            const tangent = path.getTangentAt(pathProgress);
            const bankTarget = THREE.MathUtils.clamp(-tangent.y * 0.85, -0.35, 0.35);

            // Mouse parallax (soften near exit)
            const parallaxFactor = 1 - s;
            const targetRotX = mouse.y * 0.25 * parallaxFactor;
            const targetRotY = mouse.x * 0.35 * parallaxFactor;
            smoothedRotation.x = THREE.MathUtils.damp(smoothedRotation.x, targetRotX, 4, dt);
            smoothedRotation.y = THREE.MathUtils.damp(smoothedRotation.y, targetRotY, 4, dt);
            smoothedRotation.z = THREE.MathUtils.damp(smoothedRotation.z, bankTarget, 5, dt);
            group.rotation.copy(smoothedRotation);
        }


        // Engine glow
        const glowOffset = new THREE.Vector3(0, -0.05, -0.5).applyQuaternion(group.quaternion);
        const glowPos = new THREE.Vector3().copy(group.position).add(glowOffset);
        engineLight.position.copy(glowPos);
        // engineSprite.position.copy(glowPos);

        // Camera tracking
        lookAtTarget.x = THREE.MathUtils.damp(lookAtTarget.x, group.position.x, 3, dt);
        lookAtTarget.y = THREE.MathUtils.damp(lookAtTarget.y, group.position.y, 3, dt);
        lookAtTarget.z = THREE.MathUtils.damp(lookAtTarget.z, group.position.z, 3, dt);
        camera.lookAt(lookAtTarget);
      }

      // Subtle star drift
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
      renderer.forceContextLoss();
      starsGeo.dispose();
      warpStreaksGeo.dispose();
      warpStreaksMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-10"
      style={{
        width: "100vw",
      }}
      aria-hidden="true"
    />
  );
}
