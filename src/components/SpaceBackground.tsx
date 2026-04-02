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
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, x: jumpPos.x, y: jumpPos.y }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <div className="relative pointer-events-auto">
              {/* Outer glow rings */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.8, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }}
              />

              <motion.button
                id="are-you-ready-btn"
                onMouseEnter={handleBtnHover}
                onClick={() => navigate('/nebula')}
                whileTap={{ scale: 0.95 }}
                className="relative px-10 py-5 rounded-full text-white font-bold text-xl tracking-widest uppercase cursor-pointer select-none overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)',
                  boxShadow: '0 0 40px rgba(99,102,241,0.8), 0 0 80px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  border: '1px solid rgba(139,92,246,0.6)',
                }}
              >
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)',
                  }}
                />
                <span className="relative z-10">Are you ready?</span>
              </motion.button>

              {btnJumped && (
                <p className="text-white/40 text-xs text-center mt-3 tracking-widest animate-pulse">
                  catch me if you can...
                </p>
              )}
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