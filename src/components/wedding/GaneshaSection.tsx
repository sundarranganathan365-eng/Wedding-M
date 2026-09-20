const GaneshaSection = () => {
  return (
    <section className="relative py-24 md:py-32 section-gradient overflow-hidden">
      {/* Emerald & Gold Radial Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(42,75%,50%) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 reveal-on-scroll max-w-2xl mx-auto">
        <p className="font-subtext text-wedding-gold text-2xl md:text-3xl mb-3 font-semibold tracking-widest">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="font-tamil text-wedding-gold/90 text-lg md:text-xl mb-6">
          "அளவற்ற அருளாளனும் நிகரற்ற அன்புடையோனுமாகிய அல்லாஹ்வின் திருப்பெயரால்..."
        </p>

        {/* Islamic Crescent & Star Divider */}
        <div className="flex items-center justify-center gap-3 my-4 text-wedding-gold/70">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-wedding-gold/50" />
          <span className="text-xl">☪</span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-wedding-gold/50" />
        </div>

        <p className="font-subtext text-wedding-ivory/80 text-base md:text-lg italic mt-4 leading-relaxed">
          "And among His signs is that He created for you spouses from among yourselves so that you may find tranquility in them, and He placed between you affection and mercy."
        </p>
        <p className="font-heading text-wedding-gold/50 text-xs tracking-[0.3em] uppercase mt-4">
          — Surah Ar-Rum (30:21)
        </p>
      </div>
    </section>
  );
};

export default GaneshaSection;
