export default function Testimonials() {
  const reviews = [
    { name: 'Priya Sharma', role: 'Business Traveller', rating: 5, text: 'Absolutely seamless experience! The car was spotless and the booking process took less than 2 minutes.' },
    { name: 'Rahul Mehta', role: 'Weekend Explorer', rating: 5, text: 'Best car rental service I have used. Transparent pricing and excellent vehicle condition.' },
    { name: 'Ananya Patel', role: 'Family Vacationer', rating: 4, text: 'Great selection of family cars. The SUV we rented was perfect for our road trip.' },
  ];
  return (
    <section className="py-24 px-6 md:px-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-orange text-sm font-semibold uppercase tracking-widest mb-2">Testimonials</p>
          <h2 className="text-charcoal text-4xl md:text-5xl font-extrabold">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(({ name, role, rating, text }) => (
            <div key={name} className="bg-gray-light rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(s => <span key={s} className={`text-lg ${s <= rating ? 'text-orange' : 'text-gray-mid'}`}>★</span>)}</div>
              <p className="text-charcoal/70 text-sm leading-relaxed italic mb-5">"{text}"</p>
              <div>
                <p className="text-charcoal font-bold text-sm">{name}</p>
                <p className="text-charcoal/40 text-xs">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
