import { useState } from 'react';
import { BuildingStorefrontIcon, CalendarDaysIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';

export default function BookingForm() {
  const [branch, setBranch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!branch || !startDate || !endDate) {
      setError('Select a branch and both rental dates.');
      return;
    }
    if (endDate <= startDate) {
      setError('Rental end date must be after the start date.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cars', { params: { isAvailable: true, size: 100 } });
      const count = data.data?.content?.length ?? 0;
      setMessage(count ? `${count} vehicle${count === 1 ? '' : 's'} available at ${branch}.` : 'No vehicles are available for these dates.');
      document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not check availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <section id="booking" className="relative z-20 px-6 md:px-16 -mt-12 mb-0">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-card-hover p-6 md:p-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">Pickup Branch</label>
            <div className="flex items-center gap-3 border border-gray-mid rounded-xl px-4 py-3 focus-within:border-orange transition-colors">
              <BuildingStorefrontIcon className="w-5 h-5 text-orange flex-shrink-0" />
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="flex-1 text-sm text-charcoal outline-none bg-transparent cursor-pointer">
                <option value="" disabled>Select branch</option>
                <option>Main Branch — City Centre</option>
                <option>North Branch — Airport Road</option>
                <option>South Branch — Highway Plaza</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">Rental Start</label>
            <div className="flex items-center gap-3 border border-gray-mid rounded-xl px-4 py-3 focus-within:border-orange transition-colors">
              <CalendarDaysIcon className="w-5 h-5 text-orange flex-shrink-0" />
              <input type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 text-sm text-charcoal outline-none bg-transparent cursor-pointer" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">Rental End</label>
            <div className="flex items-center gap-3 border border-gray-mid rounded-xl px-4 py-3 focus-within:border-orange transition-colors">
              <CalendarDaysIcon className="w-5 h-5 text-orange flex-shrink-0" />
              <input type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 text-sm text-charcoal outline-none bg-transparent cursor-pointer" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 bg-orange hover:bg-orange-hover disabled:opacity-60 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange/30 hover:-translate-y-0.5">
            <MagnifyingGlassIcon className="w-5 h-5" /> {loading ? 'Checking…' : 'Check Availability'}
          </button>
        </form>
        {(error || message) && <p className={`mt-4 text-sm text-center ${error ? 'text-red-500' : 'text-green-700'}`}>{error || message}</p>}
      </div>
    </section>
  );
}
