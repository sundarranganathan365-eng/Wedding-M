import { useEffect, useRef, useState } from 'react';
import { useScroll, useSpring, useTransform, motion } from 'framer-motion';

const FRAME_COUNT = 240;
const FRAME_PREFIX = '/Frames/ezgif-frame-';
const FRAME_SUFFIX = '.png';

function getFrameUrl(index: number) {
  return `${FRAME_PREFIX}${index.toString().padStart(3, '0')}${FRAME_SUFFIX}`;
}

export default function TempleScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bgColor, setBgColor] = useState('#000000');

  // Using a ref to hold ImageBitmaps for high-performance canvas rendering
  const framesRef = useRef<(ImageBitmap | null)[]>(new Array(FRAME_COUNT + 1).fill(null));

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Adding spring physics for premium 'ease-out' cinematic feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  // Story Mapping interpolation
  // 0% -> 20%: Top of gopuram (Frames 1 - 24)
  // 20% -> 60%: Descent (Frames 24 - 72)
  // 60% -> 85%: Interior (Frames 72 - 108)
  // 85% -> 100%: Reveal - slow down (Frames 108 - 120)
  const currentFrameIndex = useTransform(
    smoothProgress, 
    [0, 0.2, 0.6, 0.85, 1], 
    [1, 48, 144, 204, FRAME_COUNT]
  );

  // High-end cinematic text opacity maps matching story segments
  const text1Opacity = useTransform(smoothProgress, [0, 0.1, 0.18, 0.22], [1, 1, 0, 0]);
  const text2Opacity = useTransform(smoothProgress, [0.22, 0.3, 0.5, 0.6], [0, 1, 1, 0]);
  const text3Opacity = useTransform(smoothProgress, [0.6, 0.7, 0.8, 0.85], [0, 1, 1, 0]);
  const text4Opacity = useTransform(smoothProgress, [0.88, 0.92, 1], [0, 1, 1]);

  // Handle Progressive Caching
  useEffect(() => {
    let isCancelled = false;

    const loadImages = async () => {
      let loadedCount = 0;

      const fetchImage = async (idx: number) => {
        try {
          const res = await fetch(getFrameUrl(idx));
          if (!res.ok) throw new Error('Fetch failed');
          const blob = await res.blob();
          const bitmap = await createImageBitmap(blob);
          if (!isCancelled) {
            framesRef.current[idx] = bitmap;
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
          }
        } catch (e) {
          console.warn(`Failed to preload frame ${idx}`, e);
        }
      };

      // Progressive loading: Load the first batch (e.g. 30 frames) to unblock user faster
      const batch1 = [];
      for (let i = 1; i <= 30; i++) {
        batch1.push(fetchImage(i));
      }
      await Promise.all(batch1);

      if (isCancelled) return;

      // Extract sky/background color from the very first frame to create a seamless edge
      const firstFrame = framesRef.current[1];
      if (firstFrame) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = firstFrame.width;
        tempCanvas.height = firstFrame.height;
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(firstFrame, 0, 0);
          const pixel = ctx.getImageData(0, 0, 1, 1).data; // Read pixel at (0,0)
          setBgColor(`rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`);
        }
      }

      setLoaded(true); // Allow scrolling while the rest loads in background

      // Load remaining frames in small chunks
      const chunkSize = 15;
      for (let i = 31; i <= FRAME_COUNT; i += chunkSize) {
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
      framesRef.current.forEach(bmp => bmp && bmp.close());
    };
  }, []);

  // Sync Canvas rendering to Framer Motion progress 
  useEffect(() => {
    if (!loaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Performance: Remove alpha from context since we are painting it ourselves 
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      let index = Math.round(currentFrameIndex.get());
      index = Math.max(1, Math.min(index, FRAME_COUNT));

      // Fallback if user scrolls into un-loaded territory
      while (!framesRef.current[index] && index > 1) {
        index--;
      }

      const img = framesRef.current[index];

      if (img) {
        // Sync canvas internal resolution with window layout seamlessly
        const { innerWidth, innerHeight } = window;
        if (canvas.width !== innerWidth || canvas.height !== innerHeight) {
          canvas.width = innerWidth;
          canvas.height = innerHeight;
        }

        // Draw solid background based on extracted pixel color for invisible edges
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Object-contain scale logic
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio);

        const centerShiftX = (canvas.width - img.width * ratio) / 2;
        const centerShiftY = (canvas.height - img.height * ratio) / 2;

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
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [loaded, currentFrameIndex, bgColor]);

  return (
    // Height 300vh allows extended scroll. Dynamically colored to match sky
    <div ref={containerRef} className="relative h-[300vh] w-full" style={{ backgroundColor: bgColor }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Loading Overlay */}
        {!loaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-white/80 backdrop-blur-md bg-black/80 w-full h-full">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white/80 rounded-full animate-spin mb-6" />
            <p className="font-sans text-xs tracking-[0.3em] font-light uppercase">
              Preparing the Journey <span className="tabular-nums ml-2 font-mono opacity-60 text-[10px]">{loadingProgress}%</span>
            </p>
          </div>
        )}

        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full block transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Cinematic Scrollytelling Overlays */}
        <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none z-10 flex flex-col items-center justify-end pb-32">
          
          <motion.div style={{ opacity: text1Opacity }} className="absolute bottom-32 text-center max-w-md px-6">
            <h2 className="text-white font-sans text-lg tracking-[0.3em] font-light mb-3">THE ASCENT</h2>
            <p className="text-white/60 text-sm font-light">Approaching the sacred gopuram</p>
          </motion.div>

          <motion.div style={{ opacity: text2Opacity }} className="absolute bottom-32 text-center max-w-md px-6">
            <h2 className="text-white font-sans text-lg tracking-[0.3em] font-light mb-3">BEYOND THE GATES</h2>
            <p className="text-white/60 text-sm font-light">Descending into a realm of peace</p>
          </motion.div>

          <motion.div style={{ opacity: text3Opacity }} className="absolute bottom-32 text-center max-w-md px-6">
            <h2 className="text-white font-sans text-lg tracking-[0.3em] font-light mb-3">THE INNER SANCTUM</h2>
            <p className="text-white/60 text-sm font-light">Sensing the divine presence</p>
          </motion.div>

          <motion.div style={{ opacity: text4Opacity }} className="absolute bottom-32 text-center max-w-md px-6">
            <h2 className="text-white font-sans text-2xl tracking-[0.4em] font-semibold mb-4">OM SARAVANABHAVA</h2>
            <p className="text-white/80 text-xs font-light tracking-[0.2em] uppercase">Lord Murugan Revealed</p>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
