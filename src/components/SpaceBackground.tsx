import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  prevZ: number;
}

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const speedRef = useRef(0.5);
  const [warp, setWarp] = useState<number>(1);

  useEffect(() => {
    // base speed * warp level
    speedRef.current = 0.5 * warp;
  }, [warp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < 800; i++) {
        starsRef.current.push({
          x: Math.random() * 1600 - 800,
          y: Math.random() * 900 - 450,
          z: Math.random() * 1000,
          prevZ: Math.random() * 1000,
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'white';

      for (const star of starsRef.current) {
        star.prevZ = star.z;
        star.z -= speedRef.current;

        if (star.z <= 0) {
          star.x = Math.random() * 1600 - 800;
          star.y = Math.random() * 900 - 450;
          star.z = 1000;
          star.prevZ = 1000;
        }

        const x = (star.x / star.z) * canvas.width / 2 + canvas.width / 2;
        const y = (star.y / star.z) * canvas.height / 2 + canvas.height / 2;

        const prevX = (star.x / star.prevZ) * canvas.width / 2 + canvas.width / 2;
        const prevY = (star.y / star.prevZ) * canvas.height / 2 + canvas.height / 2;

        const radius = (1 - star.z / 1000) * 2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    initStars();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'black' }}
      />
      {/* Warp Controls */}
      <div className="fixed bottom-6 inset-x-0 z-20 flex justify-center">
        <div className="flex items-center gap-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 text-white">
          <button
            aria-label="Decrease warp"
            onClick={() => setWarp((w) => Math.max(1, w - 1))}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            –
          </button>
          <span className="text-sm tracking-wide">WARP {warp}</span>
          <button
            aria-label="Increase warp"
            onClick={() => setWarp((w) => Math.min(10, w + 1))}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}