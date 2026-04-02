import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [btnJumped, setBtnJumped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Random jump position so the button "escapes" to a new spot
  const [jumpPos, setJumpPos] = useState({ x: 0, y: 0 });
  const handleBtnHover = () => {
    if (!btnJumped) return;
    const x = (Math.random() - 0.5) * 300;
    const y = (Math.random() - 0.5) * 200;
    setJumpPos({ x, y });
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'black' }}
      />

      {/* "Are you ready?" button — appears when warp = 10 */}
      <AnimatePresence>
        {warp === 10 && (
          <motion.div
            key="ready-btn-wrapper"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1, x: jumpPos.x, y: jumpPos.y }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <div className="relative pointer-events-auto flex flex-col items-center">

              {/* ── White-hole gravitational rings ── */}
              {[1, 1.6, 2.3, 3.1].map((scale, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-white pointer-events-none"
                  style={{ width: 160, height: 160, top: '50%', left: '50%', marginLeft: -80, marginTop: -80 }}
                  animate={{ scale: [scale, scale + 0.18, scale], opacity: [0.18 - i * 0.03, 0.05, 0.18 - i * 0.03] }}
                  transition={{ duration: 2.4, delay: i * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}

              {/* ── Outer blinding white aura ── */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{ width: 260, height: 260, top: '50%', left: '50%', marginLeft: -130, marginTop: -130 }}
                animate={{ opacity: [0.12, 0.28, 0.12], scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style2={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, transparent 72%)' }}
              />

              {/* ── The globe itself ── */}
              <motion.button
                id="are-you-ready-btn"
                onMouseEnter={handleBtnHover}
                onClick={() => navigate('/nebula')}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                className="relative flex items-center justify-center cursor-pointer select-none overflow-hidden"
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 35%, #ffffff 0%, #e0e0e0 55%, #b0b0b0 100%)',
                  boxShadow: `
                    0 0 0 2px rgba(255,255,255,0.6),
                    0 0 30px rgba(255,255,255,0.9),
                    0 0 80px rgba(255,255,255,0.5),
                    0 0 160px rgba(255,255,255,0.25),
                    inset 0 0 30px rgba(0,0,0,0.08),
                    inset -4px -6px 16px rgba(0,0,0,0.12)
                  `,
                  border: '2px solid rgba(255,255,255,0.9)',
                }}
              >
                {/* Globe latitude lines */}
                <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 160 160">
                  {/* Horizontal arcs */}
                  <ellipse cx="80" cy="54" rx="58" ry="14" fill="none" stroke="black" strokeWidth="0.8"/>
                  <ellipse cx="80" cy="80" rx="76" ry="18" fill="none" stroke="black" strokeWidth="0.8"/>
                  <ellipse cx="80" cy="106" rx="58" ry="14" fill="none" stroke="black" strokeWidth="0.8"/>
                  {/* Vertical arc */}
                  <ellipse cx="80" cy="80" rx="18" ry="76" fill="none" stroke="black" strokeWidth="0.8"/>
                  <ellipse cx="80" cy="80" rx="44" ry="76" fill="none" stroke="black" strokeWidth="0.8"/>
                </svg>

                {/* Bright top-left specular highlight — gives the sphere illusion */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: 55, height: 42, borderRadius: '50%',
                    top: 18, left: 24,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 80%)',
                    transform: 'rotate(-20deg)',
                    filter: 'blur(8px)',
                  }}
                />

                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 75%, rgba(0,0,0,0.06) 90%, transparent 100%)',
                    borderRadius: '50%',
                  }}
                />

                {/* Text */}
                <span
                  className="relative z-10 text-black font-bold text-center leading-tight tracking-wider"
                  style={{ fontSize: 13 }}
                >
                  ARE YOU<br />READY?
                </span>
              </motion.button>

              {/* Subtitle hint */}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-5 text-white/40 text-xs tracking-[0.25em] uppercase animate-pulse"
              >
                Enter the white hole
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <span
            className="text-sm tracking-wide font-mono"
            style={warp === 10 ? { color: '#818cf8', textShadow: '0 0 12px #818cf8' } : {}}
          >
            WARP {warp}
          </span>
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