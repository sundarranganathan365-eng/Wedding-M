const BlessingSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden">
      <div className="max-w-3xl mx-auto text-center px-4">
        <div className="reveal-on-scroll">
          {/* Sanskrit verse */}
          <p className="font-tamil text-wedding-gold/70 text-base md:text-lg mb-6 leading-relaxed">
            இரு உயிர்கள் இணையும் இனிய தருணம்
          </p>

          {/* Kolam-style divider */}
          <KolamDivider />

          <p className="font-subtext text-wedding-ivory/80 text-lg md:text-xl mt-8 mb-12 italic leading-relaxed">
            With the blessings of the Almighty and the love of our families, we joyfully invite you
            to celebrate the union of our beloved children.
          </p>

          {/* Parents */}
          <div className="grid md:grid-cols-2 gap-12 mt-12">
            <div className="reveal-on-scroll">
              <p className="font-heading text-wedding-gold text-sm tracking-[0.2em] uppercase mb-3">Bride's Family</p>
              <p className="font-body text-wedding-ivory/90 text-lg">Mr. Bride Father & Mrs. Bride Mother </p>
              <p className="font-body text-wedding-ivory/50 text-sm mt-1">Son of  Mr. GrandFather & Mrs. GrandMother </p>
            </div>
            <div className="reveal-on-scroll">
              <p className="font-heading text-wedding-gold text-sm tracking-[0.2em] uppercase mb-3">Groom's Family</p>
              <p className="font-body text-wedding-ivory/90 text-lg">Mr. Groom Father & Mrs. Groom Mother</p>
              <p className="font-body text-wedding-ivory/50 text-sm mt-1">Son of Mr. GrandFather & Mrs. GrandMother </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const KolamDivider = () => (
  <div className="flex items-center justify-center gap-3 my-6">
    <div className="w-20 h-px bg-gradient-to-r from-transparent to-wedding-gold/40" />
    <span className="text-2xl text-wedding-gold/80">☪</span>
    <div className="w-20 h-px bg-gradient-to-l from-transparent to-wedding-gold/40" />
  </div>
);

export default BlessingSection;
