import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import api from '../api/axios';

const FALLBACK_IMAGES = {
  SUV: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80&auto=format&fit=crop',
  Sedan: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80&auto=format&fit=crop',
  MPV: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80&auto=format&fit=crop',
};

function StarRating({ rating }) {
  const r = rating ?? 0;
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => <StarIcon key={s} className={`w-4 h-4 ${s <= Math.round(r) ? 'text-orange' : 'text-gray-mid'}`} />)}
      <span className="text-xs text-charcoal/60 ml-1 font-medium">{r > 0 ? r.toFixed(1) : 'New'}</span>
    </div>
  );
}

function CarCard({ car, featured }) {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const image = car.primaryImageUrl || FALLBACK_IMAGES[car.categoryName] || FALLBACK_IMAGES.default;
  const today = new Date().toISOString().split('T')[0];
  const handleRent = () => {
    if (!user) {
      navigate('/signin', { state: { from: { pathname: '/' } } });
      return;
    }
    setError('');
    setShowBooking(true);
  };
  const handleBooking = async (e) => {
    e.preventDefault();
    setBooking(true);
    setError('');
    try {
      await api.post('/bookings', { carId: car.id, startDate, endDate });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create booking. Please try different dates.');
    } finally {
      setBooking(false);
    }
  };
  return (
    <>
      <div className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${featured ? 'shadow-featured ring-2 ring-orange/20' : 'shadow-card hover:shadow-card-hover'}`}>
      {featured && <div className="absolute top-4 right-4 bg-orange text-white text-xs font-bold px-3 py-1 rounded-full z-10">Featured</div>}
      <div className="relative h-48 overflow-hidden bg-gray-light">
        <img src={image} alt={`${car.brandName} ${car.model}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" onError={(e) => { e.target.src = FALLBACK_IMAGES.default; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="p-6">
        <p className="text-orange text-xs font-bold uppercase tracking-widest mb-1">{car.categoryName ?? 'Vehicle'}</p>
        <h3 className="text-charcoal text-xl font-bold mb-3">{car.brandName} {car.model}</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[['Fuel', car.fuelType], ['Gearbox', car.transmission], ['Seating', car.seats ? `${car.seats} Seats` : '—'], ['Year', car.year ?? '—']].map(([label, value]) => (
            <div key={label} className="bg-gray-light rounded-lg px-3 py-2">
              <p className="text-charcoal/50 text-xs">{label}</p>
              <p className="text-charcoal text-xs font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <StarRating rating={car.averageRating} />
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-orange text-2xl font-extrabold">₹{Number(car.pricePerDay).toLocaleString('en-IN')}</span>
            <span className="text-charcoal/50 text-xs ml-1">/day</span>
          </div>
          <button onClick={handleRent} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${featured ? 'bg-orange hover:bg-orange-hover text-white shadow-lg shadow-orange/25' : 'border-2 border-orange text-orange hover:bg-orange hover:text-white'}`}>Rent Now</button>
        </div>
      </div>
      </div>
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-orange to-orange-hover" />
            <form onSubmit={handleBooking} className="p-7">
              <h3 className="text-xl font-bold text-charcoal mb-1">Book {car.brandName} {car.model}</h3>
              <p className="text-sm text-charcoal/50 mb-6">₹{Number(car.pricePerDay).toLocaleString('en-IN')} per day</p>
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-charcoal/60 uppercase tracking-wider">
                  Start date
                  <input type="date" required min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-mid rounded-xl px-3 py-2.5 text-sm text-charcoal outline-none focus:border-orange" />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-charcoal/60 uppercase tracking-wider">
                  End date
                  <input type="date" required min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-mid rounded-xl px-3 py-2.5 text-sm text-charcoal outline-none focus:border-orange" />
                </label>
              </div>
              <div className="flex gap-3 mt-7">
                <button type="button" onClick={() => setShowBooking(false)} className="flex-1 border-2 border-gray-mid text-charcoal/60 font-semibold text-sm py-2.5 rounded-xl">Cancel</button>
                <button type="submit" disabled={booking} className="flex-1 bg-orange hover:bg-orange-hover disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl">{booking ? 'Booking…' : 'Confirm Booking'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
      <div className="h-48 bg-gray-mid" />
      <div className="p-6 flex flex-col gap-3">
        <div className="h-3 w-16 bg-gray-mid rounded" /><div className="h-5 w-40 bg-gray-mid rounded" />
        <div className="grid grid-cols-2 gap-2">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-light rounded-lg" />)}</div>
        <div className="flex justify-between items-center mt-2"><div className="h-7 w-20 bg-gray-mid rounded" /><div className="h-9 w-24 bg-gray-mid rounded-xl" /></div>
      </div>
    </div>
  );
}

export default function Fleet() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api.get('/cars', { params: { isAvailable: true, size: showAll ? 100 : 3, sortBy: 'pricePerDay', direction: 'asc' } })
      .then(({ data }) => setCars(data.data?.content ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [showAll]);

  return (
    <section id="cars" className="py-24 px-6 md:px-16 bg-white mt-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-orange text-sm font-semibold uppercase tracking-widest mb-2">Premium Selection</p>
          <h2 className="text-charcoal text-4xl md:text-5xl font-extrabold">Our Fleet</h2>
          <p className="text-charcoal/50 mt-3 max-w-md mx-auto text-sm leading-relaxed">Handpicked well-maintained vehicles for every need — from daily commutes to family road trips.</p>
        </div>
        {loading && <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>}
        {!loading && error && <p className="text-center text-charcoal/50 text-sm py-12">Could not load vehicles. Please ensure the backend is running.</p>}
        {!loading && !error && cars.length === 0 && <p className="text-center text-charcoal/50 text-sm py-12">No vehicles available right now. Check back soon!</p>}
        {!loading && !error && cars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {cars.map((car, i) => <CarCard key={car.id} car={car} featured={i === 1} />)}
          </div>
        )}
        {!loading && !error && !showAll && <div className="text-center mt-12">
            <button onClick={() => { setLoading(true); setShowAll(true); }} className="inline-flex items-center gap-2 border-2 border-orange text-orange hover:bg-orange hover:text-white font-semibold text-sm px-8 py-3 rounded-full transition-all duration-300">View All Vehicles</button>
          </div>}
      </div>
    </section>
  );
}
