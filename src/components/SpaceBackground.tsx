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
  const [entering, setEntering] = useState(false);
  const navigate = useNavigate();

  const handleEnter = () => {
    setEntering(true);
    setTimeout(() => navigate('/nebula'), 2400);
  };

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

      {/* ── Entering flash animation ── */}
      <AnimatePresence>
        {entering && (
          <motion.div key="entering" className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
            {/* Radial beams pulling inward */}
            {Array.from({ length: 16 }).map((_, i) => (
              <motion.div key={i} className="absolute"
                style={{
                  width: 3, height: '60vmax', top: '50%', left: '50%',
                  transformOrigin: 'top center',
                  transform: `rotate(${i * 22.5}deg)`,
                  background: 'linear-gradient(to bottom, rgba(255,200,80,0.6), transparent)',
                  filter: 'blur(2px)',
                }}
                animate={{ scaleY: [0, 1, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: 1.4, delay: i * 0.04, ease: 'easeIn' }}
              />
            ))}
            {/* Contracting rings */}
            {[500, 380, 260, 150, 60].map((size, i) => (
              <motion.div key={size} className="absolute rounded-full border border-white/30"
                style={{ width: size, height: size }}
                animate={{ scale: [1, 0], opacity: [0.6, 0] }}
                transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeIn' }}
              />
            ))}
            {/* White flash */}
            <motion.div className="absolute inset-0 bg-white"
              animate={{ opacity: [0, 0, 1] }}
              transition={{ duration: 2.4, times: [0, 0.7, 1], ease: 'easeIn' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gargantua black hole — appears when warp = 10 ── */}
      <AnimatePresence>
        {warp === 10 && !entering && (
          <motion.div key="bh-wrapper"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <div className="relative pointer-events-auto flex flex-col items-center">
              {/* Outer gravitational glow */}
              {[420, 340, 270].map((size, i) => (
                <motion.div key={i} className="absolute rounded-full pointer-events-none"
                  style={{ width: size, height: size, top: '50%', left: '50%', marginLeft: -size/2, marginTop: -size/2,
                    background: `radial-gradient(ellipse 55% 40% at 50% 52%, rgba(255,${160 - i*30},${40 - i*10},${0.08 - i*0.02}) 0%, transparent 70%)` }}
                  animate={{ opacity: [0.6, 0.2, 0.6], scale: [1, 1.06, 1] }}
                  transition={{ duration: 3, delay: i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}

              {/* SVG: Gargantua black hole */}
              <button id="are-you-ready-btn" onClick={handleEnter}
                className="relative cursor-pointer"
                style={{ background: 'none', border: 'none', padding: 0, width: 320, height: 230 }}
              >
                <svg viewBox="0 0 320 230" width="320" height="230">
                  <defs>
                    <filter id="bh-glow">
                      <feGaussianBlur stdDeviation="5" result="b"/>
                      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <filter id="bh-corona"><feGaussianBlur stdDeviation="16"/></filter>
                    <linearGradient id="disk-g" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="transparent"/>
                      <stop offset="10%" stopColor="rgba(255,130,30,0.3)"/>
                      <stop offset="28%" stopColor="rgba(255,195,80,0.85)"/>
                      <stop offset="50%" stopColor="rgba(255,250,190,1)"/>
                      <stop offset="72%" stopColor="rgba(255,195,80,0.85)"/>
                      <stop offset="90%" stopColor="rgba(255,130,30,0.3)"/>
                      <stop offset="100%" stopColor="transparent"/>
                    </linearGradient>
                    <linearGradient id="ring-g" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255,255,220,1)"/>
                      <stop offset="50%" stopColor="rgba(255,210,130,0.95)"/>
                      <stop offset="100%" stopColor="rgba(255,150,50,0.75)"/>
                    </linearGradient>
                  </defs>
                  {/* Corona outer diffuse */}
                  <ellipse cx="160" cy="118" rx="155" ry="90" fill="rgba(255,110,20,0.06)" filter="url(#bh-corona)"/>
                  {/* Back accretion disk */}
                  <ellipse cx="160" cy="122" rx="152" ry="22" fill="url(#disk-g)" filter="url(#bh-glow)" opacity="0.88"/>
                  {/* Photon ring */}
                  <circle cx="160" cy="115" r="78" fill="none" stroke="url(#ring-g)" strokeWidth="18" filter="url(#bh-glow)" opacity="0.97"/>
                  {/* Shadow */}
                  <circle cx="160" cy="115" r="70" fill="#000000"/>
                  {/* Front disk */}
                  <ellipse cx="160" cy="126" rx="152" ry="18" fill="url(#disk-g)" filter="url(#bh-glow)" opacity="0.82">
                    <clipPath id="front-clip"><rect x="0" y="114" width="320" height="116"/></clipPath>
                  </ellipse>
                  {/* Lensing top arc */}
                  <path d="M 84,115 A 76,76 0 0,1 236,115" fill="none" stroke="rgba(255,250,200,0.45)" strokeWidth="5" filter="url(#bh-glow)"/>
                </svg>

                {/* Animated accretion shimmer */}
                <motion.div className="absolute pointer-events-none"
                  style={{ top: '47%', left: '5%', right: '5%', height: 18, borderRadius: 9,
                    background: 'linear-gradient(90deg, transparent, rgba(255,200,80,0.15) 30%, rgba(255,240,160,0.35) 50%, rgba(255,200,80,0.15) 70%, transparent)',
                    filter: 'blur(3px)' }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Text inside shadow */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none"
                  style={{ top: '22%', left: '50%', transform: 'translateX(-50%)', width: 130 }}>
                  <span className="text-white/90 font-black text-center leading-tight"
                    style={{ fontSize: 11, letterSpacing: '0.1em', textShadow: '0 0 8px rgba(255,200,80,0.8)' }}>
                    ARE YOU READY<br />TO GO BEYOND?
                  </span>
                  <span className="text-white/40 text-center mt-1" style={{ fontSize: 7.5, letterSpacing: '0.15em' }}>
                    CLICK TO ENTER
                  </span>
                </div>
              </button>

              {/* Subtitle */}
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="mt-3 text-white/35 text-xs tracking-[0.3em] uppercase animate-pulse">
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