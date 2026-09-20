import { useRef, useEffect, useState } from "react";
import { useScroll, useSpring, useTransform, motion } from "framer-motion";

const FRAME_COUNT = 240;
const FRAME_PREFIX = '/Frames/ezgif-frame-';
const FRAME_SUFFIX = '.png';

function getFrameUrl(index: number) {
  return `${FRAME_PREFIX}${index.toString().padStart(3, '0')}${FRAME_SUFFIX}`;
}

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Canvas rendering pipeline for silky smooth 60fps frame rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(FRAME_COUNT + 1).fill(null));

  // Framer Motion Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const isMobile = window.innerWidth < 768;

  // Optimized spring physics for fluid inertia without micro-stutter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.2,
    restDelta: 0.0001,
  });

  const activeProgress = isMobile ? scrollYProgress : smoothProgress;

  // Uniform mapping across 240 frames
  const currentFrameIndex = useTransform(
    activeProgress, 
    [0, 1], 
    [1, FRAME_COUNT]
  );

  // Typographic Opacity maps for the cinematic title
  const titleOpacity = useTransform(activeProgress, [0, 0.08, 0.14], [1, 0.5, 0]);
  const titleScale = useTransform(activeProgress, [0, 0.14], [1, 0.95]);
  const titleY = useTransform(activeProgress, [0, 0.14], ["0%", "-30%"]);

  // Opacity maps for story text layers
  const text1Opacity = useTransform(activeProgress, [0.18, 0.22, 0.4, 0.45], [0, 1, 1, 0]);
  const text2Opacity = useTransform(activeProgress, [0.45, 0.5, 0.75, 0.8], [0, 1, 1, 0]);
  const text3Opacity = useTransform(activeProgress, [0.85, 0.9, 1], [0, 1, 1]);

  useEffect(() => {
    let isCancelled = false;

    const loadImages = async () => {
      let loadedCount = 0;
      const totalToLoad = FRAME_COUNT;

      const fetchImage = async (idx: number) => {
        try {
          const img = new Image();
          img.src = getFrameUrl(idx);
          await new Promise((resolve) => {
            img.onload = () => {
              if (!isCancelled) {
                framesRef.current[idx] = img;
                loadedCount++;
                setLoadingProgress(Math.round((loadedCount / totalToLoad) * 100));
              }
              resolve(true);
            };
            img.onerror = () => resolve(false);
          });
        } catch (e) {
          console.warn(`Failed to preload frame ${idx}`, e);
        }
      };

      // 1. Instantly load first 3 frames to unlock UI immediately (under 1 second)
      await Promise.all([fetchImage(1), fetchImage(2), fetchImage(3)]);

      if (isCancelled) return;
      setLoaded(true); // Immediate unlock!

      // 2. Stream remaining 237 frames smoothly in small background chunks
      const chunkSize = 8;
      for (let i = 4; i <= FRAME_COUNT; i += chunkSize) {
        if (isCancelled) break;
        const chunk = [];
        for (let j = i; j < i + chunkSize && j <= FRAME_COUNT; j++) {
          chunk.push(fetchImage(j));
        }
        await Promise.all(chunk);
      }
    };

    loadImages();

    return () => {
      isCancelled = true;
      framesRef.current.forEach(img => {
        if (img) img.src = "";
      });
    };
  }, []);

  // 60FPS Canvas Render loop with aspect ratio cover scaling
  useEffect(() => {
    if (!loaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let lastRenderedIndex = -1;

    const render = () => {
      let index = Math.round(currentFrameIndex.get());
      index = Math.max(1, Math.min(index, FRAME_COUNT));

      // Fallback to closest loaded frame if scrolling ahead of fetch
      while (!framesRef.current[index] && index > 1) {
        index--;
      }

      const img = framesRef.current[index];

      if (img && index !== lastRenderedIndex) {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
          canvas.width = width * dpr;
          canvas.height = height * dpr;
        }

        ctx.save();
        ctx.scale(dpr, dpr);

        // Object cover math
        const hRatio = width / img.width;
        const vRatio = height / img.height;
        const ratio = Math.max(hRatio, vRatio);

        const centerShiftX = (width - img.width * ratio) / 2;
        const centerShiftY = (height - img.height * ratio) / 2;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );

        ctx.restore();
        lastRenderedIndex = index;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [loaded, currentFrameIndex]);

  return (
    <div ref={containerRef} className={`relative ${isMobile ? "h-[200vh]" : "h-[500vh]"} bg-wedding-dark`}>
      {/* Sticky wrapper */}
      <div className="sticky top-0 h-screen w-full overflow-hidden hero-gradient bg-black">
        
        {/* Preloader Phase */}
        {!loaded && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center text-wedding-gold-light/80 backdrop-blur-md bg-black w-full h-full">
            <div className="w-12 h-12 border-2 border-wedding-gold-light/10 border-t-wedding-gold-light/80 rounded-full animate-spin mb-6" />
            <p className="font-subtext text-xs tracking-[0.3em] font-light uppercase">
              Preparing the Journey <span className="tabular-nums ml-2 font-mono opacity-60 text-[10px]">{loadingProgress}%</span>
            </p>
          </div>
        )}

        {/* Canvas Scrollytelling Pipeline */}
        <div className="absolute inset-0 z-[2] w-full h-full overflow-hidden bg-[#0a0a0a]">
          <canvas
            ref={canvasRef}
            className={`w-full h-full block transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        {/* Night Gradients to blend UI */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-wedding-dark via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* The Initial Main Content / Typography */}
        <motion.div
          style={{ opacity: titleOpacity, scale: titleScale, y: titleY }}
          className="relative z-[20] flex flex-col items-center justify-center h-full text-center px-4"
        >
          {/* Bismillah & Islamic Blessing */}
          <p className="font-subtext text-wedding-gold-light/90 text-sm sm:text-base md:text-xl mb-3 md:mb-4 tracking-widest drop-shadow-md font-medium">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="font-tamil text-wedding-gold-light/80 text-xs sm:text-sm md:text-base mb-3 md:mb-4 tracking-wider">
            இறைவனின் பேரருளால் நிகழும் திருமண நிஃகா
          </p>

          <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-8 opacity-60">
            <div className="w-8 md:w-12 h-[1px] bg-wedding-gold-light" />
            <div className="w-2 h-2 rounded-full border border-wedding-gold-light" />
            <div className="w-8 md:w-12 h-[1px] bg-wedding-gold-light" />
          </div>

          <div className="flex flex-col gap-1 md:gap-4 mb-4 md:mb-8">
            <h1 className="font-display text-4xl sm:text-5xl md:text-8xl lg:text-9xl text-wedding-gold-light drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] tracking-[0.15em] md:tracking-[0.2em] uppercase">
              The Groom
            </h1>
            <div className="flex items-center justify-center gap-4">
              <span className="font-heading text-wedding-gold-light/60 text-base md:text-xl tracking-[0.5em] uppercase">Weds</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-8xl lg:text-9xl text-wedding-gold-light drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] tracking-[0.15em] md:tracking-[0.2em] uppercase">
              The Bride
            </h1>
          </div>

          <div className="mt-2 md:mt-4 px-6 md:px-8 py-2 md:py-3 border-y border-wedding-gold-light/20 bg-black/40 backdrop-blur-md">
            <p className="font-subtext text-wedding-ivory text-lg md:text-2xl tracking-[0.2em] md:tracking-[0.3em]">
              29 . 05 . 2026
            </p>
          </div>
          
          {/* Scroll Hint */}
          <div className="absolute -bottom-32 flex flex-col items-center gap-2">
            <span className="font-subtext text-wedding-gold-light/40 text-[9px] md:text-[10px] tracking-[0.4em] uppercase">Scroll to Reveal</span>
            <div className="w-[1px] h-8 md:h-10 bg-gradient-to-b from-wedding-gold-light/40 to-transparent animate-pulse" />
          </div>
        </motion.div>

        {/* Cinematic Scrollytelling Layers during descent */}
        <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none z-[15] flex flex-col items-center justify-end pb-24 md:pb-32">
          
          <motion.div style={{ opacity: text1Opacity }} className="absolute bottom-32 text-center max-w-lg px-6">
            <h2 className="text-wedding-gold-light font-heading text-xl md:text-3xl tracking-[0.3em] font-light mb-3">THE SACRED NIKAH</h2>
            <p className="text-wedding-ivory/60 font-subtext text-sm md:text-base tracking-widest uppercase">Bound in love and faith</p>
          </motion.div>

          <motion.div style={{ opacity: text2Opacity }} className="absolute bottom-32 text-center max-w-lg px-6">
            <h2 className="text-wedding-gold-light font-heading text-xl md:text-3xl tracking-[0.3em] font-light mb-3">BLESSINGS & PEACE</h2>
            <p className="text-wedding-ivory/60 font-subtext text-sm md:text-base tracking-widest uppercase">Entering a life of harmony</p>
          </motion.div>

          <motion.div style={{ opacity: text3Opacity }} className="absolute bottom-32 text-center max-w-lg px-6">
            <h2 className="text-wedding-gold-light font-heading text-2xl md:text-4xl tracking-[0.4em] font-semibold mb-4 drop-shadow-2xl">ALHAMDULILLAH</h2>
            <p className="text-wedding-ivory/80 font-subtext flex items-center justify-center gap-4 text-xs tracking-[0.4em] uppercase">
               <span className="w-8 h-[1px] bg-wedding-gold-light/50" />
               A Celestial Union
               <span className="w-8 h-[1px] bg-wedding-gold-light/50" />
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;
