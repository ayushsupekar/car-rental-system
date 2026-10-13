export default function Advantages() {
  const items = [
    { icon: '🚗', title: 'Wide Selection', desc: 'From budget hatchbacks to luxury SUVs — we have the right car for every occasion.' },
    { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden fees. What you see is what you pay. Simple, honest pricing always.' },
    { icon: '🔒', title: 'Secure Booking', desc: 'Your data and payments are protected with industry-standard encryption.' },
    { icon: '⚡', title: 'Instant Confirmation', desc: 'Book in minutes and get instant confirmation. No waiting, no hassle.' },
    { icon: '🛠️', title: 'Well Maintained', desc: 'Every vehicle is regularly serviced and inspected before each rental.' },
    { icon: '📞', title: '24/7 Support', desc: 'Our support team is always available to help you on the road.' },
  ];
  return (
    <section id="about" className="py-24 px-6 md:px-16 bg-gray-light">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-orange text-sm font-semibold uppercase tracking-widest mb-2">Why Choose Us</p>
          <h2 className="text-charcoal text-4xl md:text-5xl font-extrabold">The DriveLuxe Advantage</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-charcoal font-bold text-lg mb-2">{title}</h3>
              <p className="text-charcoal/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
