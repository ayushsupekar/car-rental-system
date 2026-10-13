import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white py-16 px-6 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-xl font-bold mb-3">Drive<span className="text-orange">Luxe</span></h3>
          <p className="text-white/50 text-sm leading-relaxed">Premium car rentals for every journey. Transparent pricing, quality vehicles.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/60">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {[['#cars', 'Our Fleet'], ['#booking', 'Book Now'], ['#about', 'About Us']].map(([href, label]) => (
              <a key={href} href={href} className="text-white/50 hover:text-orange text-sm transition-colors">{label}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/60">Account</h4>
          <div className="flex flex-col gap-2">
            <Link to="/signin" className="text-white/50 hover:text-orange text-sm transition-colors">Sign In</Link>
            <Link to="/signup" className="text-white/50 hover:text-orange text-sm transition-colors">Register</Link>
            <Link to="/profile" className="text-white/50 hover:text-orange text-sm transition-colors">My Bookings</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/60">Contact</h4>
          <div className="flex flex-col gap-2 text-white/50 text-sm">
            <p>support@driveluxe.com</p>
            <p>+91 98765 43210</p>
            <p>Mon–Sat, 9am–6pm</p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-white/30 text-xs">
        © {new Date().getFullYear()} DriveLuxe. All rights reserved.
      </div>
    </footer>
  );
}
