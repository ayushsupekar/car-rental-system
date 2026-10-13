import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Hero() {
  const { user } = useSelector((s) => s.auth);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-24"
      style={{ background: `linear-gradient(135deg, rgba(30,71,58,0.92) 0%, rgba(51,51,51,0.88) 100%), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop') center/cover no-repeat` }}>
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-orange text-sm font-semibold uppercase tracking-widest mb-4">Premium Car Rentals</p>
        <h1 className="text-white text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          Drive Your <span className="text-orange">Dream</span> Car Today
        </h1>
        <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Handpicked luxury and everyday vehicles. Transparent pricing. Seamless booking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#cars" className="bg-orange hover:bg-orange-hover text-white font-semibold text-sm px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange/30 hover:-translate-y-0.5">
            Browse Fleet
          </a>
          {!user && (
            <Link to="/signup" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-sm px-8 py-4 rounded-xl transition-all duration-300">
              Create Account
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
