const events = [
  {
    name: "Nikah Ceremony",
    tamil: "நிக்காஹ் முபாரக்",
    date: "May 29, 2026",
    time: "10:30 AM",
    venue: "Grand Jamia Masjid, Chennai",
    highlight: true
  },
  {
    name: "Walima Reception",
    tamil: "வலீமா வரவேற்பு",
    date: "May 31, 2026",
    time: "6:30 PM",
    venue: "Imperial Royal Palace Hall, Chennai"
  },
];

const EventsSection = () => {
  return (
    <section className="relative py-24 md:py-32 section-gradient overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16 reveal-on-scroll">
          <p className="font-heading text-wedding-gold/60 text-sm tracking-[0.3em] uppercase mb-3">Celebrations</p>
          <h2 className="font-display text-3xl md:text-5xl text-gold-gradient">Wedding Events</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {events.map((event, i) => (
            <div
              key={event.name}
              className="reveal-on-scroll group relative overflow-hidden rounded-2xl gold-border bg-wedding-deep-red/30 backdrop-blur-sm p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_hsl(40,66%,48%,0.2)]"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {event.highlight && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-wedding-gold to-transparent" />
              )}
              <p className="font-tamil text-wedding-gold/50 text-xs mb-2">{event.tamil}</p>
              <h3 className="font-heading text-wedding-ivory text-2xl mb-4">{event.name}</h3>
              <div className="space-y-2 text-base">
                <p className="font-body text-wedding-gold/80">{event.date} • {event.time}</p>
                <p className="font-subtext text-wedding-ivory/50">{event.venue}</p>
              </div>
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle at center, hsl(40,66%,48%,0.05) 0%, transparent 70%)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
