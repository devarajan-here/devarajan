import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

interface Star {
  x: number;
  y: number;
  z: number;
  prevZ: number;
}

// ── Canvas-based hyperspace warp transition ─────────────────────────────
function HyperspaceWarp({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Hyperspace stars
    const STAR_COUNT = 1200;
    const stars: { x: number; y: number; z: number; speed: number; color: string }[] = [];
    const starColors = ['#ffffff', '#aaccff', '#88bbff', '#66aaff', '#ff9944', '#ffcc66', '#aaaaff'];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 3,
        y: (Math.random() - 0.5) * canvas.height * 3,
        z: Math.random() * 2000,
        speed: 2 + Math.random() * 6,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    let frame = 0;
    const TOTAL_FRAMES = 180; // ~3 seconds at 60fps
    let animId: number;

    const draw = () => {
      frame++;
      const progress = Math.min(frame / TOTAL_FRAMES, 1);

      // Acceleration curve — slow start, extreme speed, then flash
      const accel = Math.pow(progress, 1.8);
      const currentSpeed = 5 + accel * 80;

      // Background — darken then brighten
      if (progress < 0.85) {
        ctx.fillStyle = `rgba(0,0,8,${0.15 + accel * 0.1})`;
      } else {
        // Flash to white at end
        const flash = (progress - 0.85) / 0.15;
        const r = Math.floor(flash * 255);
        const g = Math.floor(flash * 255);
        const b = Math.floor(flash * 255);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.2 + flash * 0.8})`;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Star streaks
      for (const star of stars) {
        const prevZ = star.z;
        star.z -= currentSpeed * star.speed * 0.12;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width * 3;
          star.y = (Math.random() - 0.5) * canvas.height * 3;
          star.z = 2000;
          continue;
        }

        const sx = (star.x / star.z) * 500 + cx;
        const sy = (star.y / star.z) * 500 + cy;
        const px = (star.x / prevZ) * 500 + cx;
        const py = (star.y / prevZ) * 500 + cy;

        // Streak length grows with speed
        const streakLength = Math.sqrt((sx - px) ** 2 + (sy - py) ** 2);
        const brightness = Math.min(1, (1 - star.z / 2000) * (1 + accel * 2));

        // Thicker, brighter lines as we accelerate
        ctx.lineWidth = 0.5 + accel * 2.5;
        ctx.strokeStyle = star.color;
        ctx.globalAlpha = brightness * (0.4 + accel * 0.6);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // Bright head dot
        if (streakLength > 3) {
          ctx.beginPath();
          ctx.arc(sx, sy, 0.5 + accel * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Center tunnel vortex glow
      if (progress > 0.1) {
        const vortexSize = 50 + accel * 250;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, vortexSize);
        gradient.addColorStop(0, `rgba(180,200,255,${0.15 * accel})`);
        gradient.addColorStop(0.3, `rgba(100,150,255,${0.1 * accel})`);
        gradient.addColorStop(0.7, `rgba(60,100,200,${0.05 * accel})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Chromatic ring at center
      if (progress > 0.3) {
        const ringAlpha = Math.min(0.6, (progress - 0.3) * 1.5);
        ctx.strokeStyle = `rgba(100,180,255,${ringAlpha})`;
        ctx.lineWidth = 2 + accel * 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 20 + accel * 60, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (frame >= TOTAL_FRAMES) {
        // Final white flash held
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setTimeout(onComplete, 300);
        return;
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-[60]"
      style={{ width: '100vw', height: '100vh' }} />
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const speedRef = useRef(0.5);
  const [warp, setWarp] = useState<number>(1);
  const [entering, setEntering] = useState(false);
  const navigate = useNavigate();

  const handleEnter = useCallback(() => {
    setEntering(true);
  }, []);

  const handleWarpComplete = useCallback(() => {
    navigate('/nebula');
  }, [navigate]);

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

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'black' }}
      />

      {/* ── Hyperspace canvas warp ── */}
      <AnimatePresence>
        {entering && (
          <HyperspaceWarp onComplete={handleWarpComplete} />
        )}
      </AnimatePresence>

      {/* ── White Hole — appears when warp = 10 ── */}
      <AnimatePresence>
        {warp === 10 && !entering && (
          <motion.div key="wh-wrapper"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <div className="relative pointer-events-auto flex flex-col items-center">

              {/* Outer radiant glow rings */}
              {[500, 400, 320, 250].map((size, i) => (
                <motion.div key={i} className="absolute rounded-full pointer-events-none"
                  style={{
                    width: size, height: size, top: '50%', left: '50%',
                    marginLeft: -size / 2, marginTop: -size / 2,
                    background: `radial-gradient(circle, rgba(200,220,255,${0.06 - i * 0.012}) 0%, rgba(120,160,255,${0.03 - i * 0.005}) 50%, transparent 70%)`,
                    border: `1px solid rgba(180,210,255,${0.08 - i * 0.015})`,
                  }}
                  animate={{ opacity: [0.5, 0.2, 0.5], scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, delay: i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}

              {/* White Hole SVG */}
              <button id="are-you-ready-btn" onClick={handleEnter}
                className="relative cursor-pointer group"
                style={{ background: 'none', border: 'none', padding: 0, width: 340, height: 340 }}
              >
                <svg viewBox="0 0 340 340" width="340" height="340">
                  <defs>
                    <filter id="wh-glow"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <filter id="wh-outer"><feGaussianBlur stdDeviation="20" /></filter>
                    <filter id="wh-intense"><feGaussianBlur stdDeviation="12" /></filter>
                    <radialGradient id="wh-core-g" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="30%" stopColor="rgba(200,225,255,0.95)" />
                      <stop offset="60%" stopColor="rgba(130,170,255,0.5)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <radialGradient id="wh-ring-g" cx="50%" cy="50%" r="50%">
                      <stop offset="70%" stopColor="transparent" />
                      <stop offset="82%" stopColor="rgba(160,200,255,0.6)" />
                      <stop offset="90%" stopColor="rgba(200,225,255,0.9)" />
                      <stop offset="95%" stopColor="rgba(255,255,255,1)" />
                      <stop offset="100%" stopColor="rgba(160,200,255,0.3)" />
                    </radialGradient>
                  </defs>

                  {/* Outer diffuse corona */}
                  <circle cx="170" cy="170" r="160" fill="rgba(140,180,255,0.04)" filter="url(#wh-outer)" />
                  <circle cx="170" cy="170" r="130" fill="rgba(180,210,255,0.06)" filter="url(#wh-outer)" />

                  {/* Light rays emanating outward */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const x1 = 170 + Math.cos(angle) * 75;
                    const y1 = 170 + Math.sin(angle) * 75;
                    const x2 = 170 + Math.cos(angle) * 155;
                    const y2 = 170 + Math.sin(angle) * 155;
                    return (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="rgba(200,225,255,0.12)" strokeWidth="2" filter="url(#wh-glow)" />
                    );
                  })}

                  {/* Photon ring */}
                  <circle cx="170" cy="170" r="80" fill="url(#wh-ring-g)" filter="url(#wh-glow)" />

                  {/* Bright event horizon edge */}
                  <circle cx="170" cy="170" r="72" fill="none" stroke="rgba(220,240,255,0.9)"
                    strokeWidth="3" filter="url(#wh-glow)" />

                  {/* White core — blinding center */}
                  <circle cx="170" cy="170" r="68" fill="url(#wh-core-g)" />

                  {/* Inner bright spot */}
                  <circle cx="170" cy="170" r="30" fill="rgba(255,255,255,0.95)" filter="url(#wh-intense)" />
                  <circle cx="170" cy="170" r="15" fill="#ffffff" />
                </svg>

                {/* Pulsing glow overlay */}
                <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(200,225,255,0.15) 0%, transparent 60%)',
                  }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.02, 0.95] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Text inside — dark with star shimmer */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none"
                  style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 170 }}>
                  {/* Shimmer CSS */}
                  <style>{`
                    @keyframes starShimmer {
                      0% { background-position: -200% center; }
                      100% { background-position: 200% center; }
                    }
                    .shimmer-text {
                      background: linear-gradient(
                        105deg,
                        #1a1a3a 0%,
                        #1a1a3a 35%,
                        #ffffff 42%,
                        #c0d8ff 45%,
                        #ffffff 48%,
                        #1a1a3a 55%,
                        #1a1a3a 100%
                      );
                      background-size: 200% 100%;
                      -webkit-background-clip: text;
                      background-clip: text;
                      -webkit-text-fill-color: transparent;
                      animation: starShimmer 3s ease-in-out infinite;
                    }
                    .shimmer-text-sub {
                      background: linear-gradient(
                        105deg,
                        rgba(150,180,220,0.4) 0%,
                        rgba(150,180,220,0.4) 30%,
                        rgba(255,255,255,0.9) 45%,
                        rgba(200,220,255,0.8) 50%,
                        rgba(150,180,220,0.4) 60%,
                        rgba(150,180,220,0.4) 100%
                      );
                      background-size: 200% 100%;
                      -webkit-background-clip: text;
                      background-clip: text;
                      -webkit-text-fill-color: transparent;
                      animation: starShimmer 3s ease-in-out infinite;
                      animation-delay: 0.5s;
                    }
                  `}</style>
                  <span className="shimmer-text font-black text-center leading-tight"
                    style={{
                      fontSize: 14,
                      letterSpacing: '0.14em',
                      filter: 'drop-shadow(0 0 6px rgba(180,210,255,0.6)) drop-shadow(0 0 20px rgba(100,150,255,0.3))',
                    }}>
                    ARE YOU READY<br />TO GO BEYOND?
                  </span>
                  <span className="shimmer-text-sub text-center mt-2 font-semibold"
                    style={{ fontSize: 8, letterSpacing: '0.2em' }}>
                    ▶ CLICK TO ENTER HYPERSPACE
                  </span>
                </div>
              </button>

              {/* Subtitle */}
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="mt-4 text-blue-200/40 text-xs tracking-[0.3em] uppercase">
                approaching the white hole
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
            style={warp === 10 ? { color: '#93c5fd', textShadow: '0 0 12px #93c5fd' } : {}}
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