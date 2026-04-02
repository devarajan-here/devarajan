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

              {/* ── Outer blinding white-hole aura pulses ── */}
              {[280, 340, 420].map((size, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: size, height: size,
                    top: '50%', left: '50%',
                    marginLeft: -size / 2, marginTop: -size / 2,
                    background: `radial-gradient(circle, rgba(255,255,255,${0.12 - i * 0.03}) 0%, transparent 70%)`,
                  }}
                  animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.2, 0.7] }}
                  transition={{ duration: 2.2, delay: i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}

              {/* ── The wormhole globe ── */}
              <motion.button
                id="are-you-ready-btn"
                onMouseEnter={handleBtnHover}
                onClick={() => navigate('/nebula')}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                className="relative flex items-center justify-center cursor-pointer select-none overflow-hidden"
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 35%, #ffffff 0%, #d8d8d8 45%, #aaaaaa 100%)',
                  boxShadow: `
                    0 0 0 2px rgba(255,255,255,0.8),
                    0 0 40px rgba(255,255,255,1),
                    0 0 100px rgba(255,255,255,0.6),
                    0 0 200px rgba(255,255,255,0.3),
                    inset -5px -8px 20px rgba(0,0,0,0.15)
                  `,
                  border: '2px solid rgba(255,255,255,0.95)',
                }}
              >
                {/* ── Wormhole tunnel: concentric dark rings shrinking to centre ── */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" style={{ borderRadius: '50%' }}>
                  {/* Tunnel rings — biggest to smallest, getting darker toward centre */}
                  {[88, 72, 56, 42, 30, 20, 12, 6].map((r, i) => (
                    <ellipse
                      key={r}
                      cx="100" cy="105"
                      rx={r}
                      ry={r * 0.38}
                      fill="none"
                      stroke="black"
                      strokeWidth={0.6 + i * 0.15}
                      strokeOpacity={0.12 + i * 0.06}
                    />
                  ))}
                  {/* Dark tunnel throat */}
                  <ellipse cx="100" cy="105" rx="5" ry="2" fill="black" fillOpacity="0.55" />
                  {/* Blinding white-hole light at the tunnel end */}
                  <radialGradient id="wh-light" cx="50%" cy="52%" r="12%">
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="60%" stopColor="white" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </radialGradient>
                  <ellipse cx="100" cy="105" rx="16" ry="7" fill="url(#wh-light)" />
                  {/* Globe latitude lines */}
                  <ellipse cx="100" cy="68" rx="72" ry="17" fill="none" stroke="black" strokeWidth="0.5" strokeOpacity="0.18" />
                  <ellipse cx="100" cy="100" rx="95" ry="22" fill="none" stroke="black" strokeWidth="0.5" strokeOpacity="0.18" />
                  <ellipse cx="100" cy="132" rx="72" ry="17" fill="none" stroke="black" strokeWidth="0.5" strokeOpacity="0.18" />
                  <ellipse cx="100" cy="100" rx="22" ry="95" fill="none" stroke="black" strokeWidth="0.5" strokeOpacity="0.18" />
                  <ellipse cx="100" cy="100" rx="55" ry="95" fill="none" stroke="black" strokeWidth="0.5" strokeOpacity="0.18" />
                </svg>

                {/* Animated tunnel-inward shimmer rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 200, height: 200,
                      top: 0, left: 0,
                      background: 'none',
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                    animate={{ scale: [1.0, 0.05], opacity: [0, 0.35, 0] }}
                    transition={{
                      duration: 2.0,
                      delay: i * 0.65,
                      repeat: Infinity,
                      ease: 'easeIn',
                    }}
                  />
                ))}

                {/* Specular highlight */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: 65, height: 50, borderRadius: '50%',
                    top: 20, left: 26,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, transparent 75%)',
                    transform: 'rotate(-20deg)',
                    filter: 'blur(9px)',
                  }}
                />

                {/* Text — above the tunnel */}
                <span
                  className="absolute z-10 text-black font-black text-center leading-tight"
                  style={{ fontSize: 11, top: 22, width: '75%', letterSpacing: '0.08em' }}
                >
                  ARE YOU READY<br />TO GO BEYOND?
                </span>
              </motion.button>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-5 text-white/45 text-xs tracking-[0.3em] uppercase animate-pulse"
              >
                travelling to the white hole
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