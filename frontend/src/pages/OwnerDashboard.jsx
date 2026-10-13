import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilSquareIcon, TrashIcon, PhotoIcon, CurrencyRupeeIcon, CheckCircleIcon, XCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import api from '../api/axios';

const FALLBACK = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=70&auto=format&fit=crop';
const fmtMoney = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const inputCls = "border border-gray-mid rounded-xl px-4 py-2.5 text-sm text-charcoal outline-none focus:border-orange transition-colors bg-white";

function CarFormModal({ car, brands, categories, onClose, onSaved }) {
  const isEdit = !!car;
  const [form, setForm] = useState({ model: car?.model ?? '', year: car?.year ?? new Date().getFullYear(), pricePerDay: car?.pricePerDay ?? '', seats: car?.seats ?? 5, transmission: car?.transmission ?? 'MANUAL', fuelType: car?.fuelType ?? 'PETROL', description: car?.description ?? '', brandId: car?.brandId ?? '', categoryId: car?.categoryId ?? '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const payload = { ...form, year: Number(form.year), seats: Number(form.seats), pricePerDay: Number(form.pricePerDay), brandId: Number(form.brandId), categoryId: Number(form.categoryId) };
      const { data } = isEdit ? await api.put(`/owner/cars/${car.id}`, payload) : await api.post('/owner/cars', payload);
      onSaved(data.data); onClose();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save car'); }
    finally { setLoading(false); }
  };
  const Field = ({ label, children }) => (<div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">{label}</label>{children}</div>);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange to-orange-hover" />
        <div className="p-7">
          <h3 className="text-lg font-bold text-charcoal mb-5">{isEdit ? 'Edit Car' : 'List a New Car'}</h3>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand"><select value={form.brandId} onChange={e => set('brandId', e.target.value)} required className={inputCls}><option value="">Select brand</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
              <Field label="Category"><select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} required className={inputCls}><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Model Name"><input type="text" value={form.model} onChange={e => set('model', e.target.value)} required placeholder="e.g. Swift Dzire" className={inputCls} /></Field>
              <Field label="Year"><input type="number" value={form.year} onChange={e => set('year', e.target.value)} required min="2000" max="2100" className={inputCls} /></Field>
              <Field label="Price Per Day (₹)"><input type="number" value={form.pricePerDay} onChange={e => set('pricePerDay', e.target.value)} required min="1" placeholder="e.g. 1500" className={inputCls} /></Field>
              <Field label="Seats"><input type="number" value={form.seats} onChange={e => set('seats', e.target.value)} required min="1" max="20" className={inputCls} /></Field>
              <Field label="Transmission"><select value={form.transmission} onChange={e => set('transmission', e.target.value)} className={inputCls}><option value="MANUAL">Manual</option><option value="AUTOMATIC">Automatic</option></select></Field>
              <Field label="Fuel Type"><select value={form.fuelType} onChange={e => set('fuelType', e.target.value)} className={inputCls}><option value="PETROL">Petrol</option><option value="DIESEL">Diesel</option><option value="ELECTRIC">Electric</option><option value="HYBRID">Hybrid</option></select></Field>
            </div>
            <Field label="Description (optional)"><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe your car..." className={`${inputCls} resize-none`} /></Field>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-mid text-charcoal/60 font-semibold text-sm py-2.5 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-orange hover:bg-orange-hover disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-all">{loading ? 'Saving…' : isEdit ? 'Save Changes' : 'List Car'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ImageModal({ car, onClose, onUpdated }) {
  const [images, setImages] = useState(car.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); setError('');
    const fd = new FormData(); fd.append('file', file);
    try {
      const { data } = await api.post(`/owner/cars/${car.id}/images?isPrimary=${images.length === 0}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = [...images, data.data]; setImages(updated); onUpdated(car.id, updated);
    } catch (err) { setError(err.response?.data?.message || 'Upload failed.'); }
    finally { setUploading(false); e.target.value = ''; }
  };
  const deleteImg = async (imgId) => {
    try { await api.delete(`/owner/cars/${car.id}/images/${imgId}`); const updated = images.filter(i => i.id !== imgId); setImages(updated); onUpdated(car.id, updated); }
    catch { setError('Delete failed'); }
  };
  const setPrimary = async (imgId) => {
    try { await api.patch(`/owner/cars/${car.id}/images/${imgId}/set-primary`); const updated = images.map(i => ({ ...i, isPrimary: i.id === imgId })); setImages(updated); onUpdated(car.id, updated); }
    catch { setError('Failed to set primary'); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-lg overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange to-orange-hover" />
        <div className="p-7">
          <h3 className="text-lg font-bold text-charcoal mb-1">Manage Photos</h3>
          <p className="text-xs text-charcoal/50 mb-5">{car.brandName} {car.model} · JPEG/PNG/WebP · Max 5MB</p>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
          <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-4 cursor-pointer transition-colors mb-5 ${uploading ? 'border-orange/40 bg-orange/5' : 'border-gray-mid hover:border-orange hover:bg-orange/5'}`}>
            <ArrowUpTrayIcon className="w-5 h-5 text-orange" />
            <span className="text-sm font-medium text-charcoal/60">{uploading ? 'Uploading…' : 'Click to upload photo'}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} disabled={uploading} />
          </label>
          {images.length === 0 ? <p className="text-center text-charcoal/40 text-sm py-6">No photos yet.</p> : (
            <div className="grid grid-cols-3 gap-3">
              {images.map(img => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-light">
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  {img.isPrimary && <span className="absolute top-1.5 left-1.5 bg-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">Primary</span>}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isPrimary && <button onClick={() => setPrimary(img.id)} className="bg-orange text-white text-xs px-2 py-1 rounded-lg font-semibold">Set Primary</button>}
                    <button onClick={() => deleteImg(img.id)} className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-semibold">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={onClose} className="mt-5 w-full border-2 border-gray-mid text-charcoal/60 font-semibold text-sm py-2.5 rounded-xl hover:border-charcoal transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
}

function PriceModal({ car, onClose, onSaved }) {
  const [price, setPrice] = useState(car.pricePerDay);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { const { data } = await api.patch(`/owner/cars/${car.id}/price?price=${price}`); onSaved(data.data); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to update price'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange to-orange-hover" />
        <div className="p-7">
          <h3 className="text-lg font-bold text-charcoal mb-1">Update Price</h3>
          <p className="text-xs text-charcoal/50 mb-5">{car.brandName} {car.model}</p>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border border-gray-mid rounded-xl px-4 py-3 focus-within:border-orange transition-colors">
              <CurrencyRupeeIcon className="w-5 h-5 text-orange flex-shrink-0" />
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="1" required className="flex-1 text-sm text-charcoal outline-none bg-transparent font-bold" />
              <span className="text-charcoal/40 text-xs">/day</span>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-mid text-charcoal/60 font-semibold text-sm py-2.5 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-orange hover:bg-orange-hover disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-all">{loading ? 'Saving…' : 'Update Price'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function OwnerCarCard({ car, onEdit, onImages, onPrice, onToggle, onDelete }) {
  const img = car.primaryImageUrl || car.images?.[0]?.imageUrl || FALLBACK;
  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
      <div className="relative h-44 overflow-hidden bg-gray-light">
        <img src={img} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.src = FALLBACK; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${car.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{car.available ? 'Available' : 'Unavailable'}</span>
        <span className="absolute top-3 left-3 bg-orange text-white text-xs font-bold px-2.5 py-1 rounded-full">{car.categoryName}</span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-charcoal text-base">{car.brandName} {car.model} <span className="text-charcoal/40 font-normal text-sm">({car.year})</span></h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-charcoal/50"><span>{car.fuelType}</span><span>·</span><span>{car.transmission}</span><span>·</span><span>{car.seats} Seats</span></div>
        <div className="flex items-center justify-between mt-3">
          <div><span className="text-orange text-xl font-extrabold">{fmtMoney(car.pricePerDay)}</span><span className="text-charcoal/40 text-xs ml-1">/day</span></div>
          <div className="flex items-center gap-1 text-xs text-charcoal/50"><StarSolid className="w-3.5 h-3.5 text-orange" />{car.averageRating > 0 ? car.averageRating.toFixed(1) : 'New'}{car.totalReviews > 0 && <span>({car.totalReviews})</span>}</div>
        </div>
        <p className="text-xs text-charcoal/40 mt-1">{car.images?.length ?? 0} photo{(car.images?.length ?? 0) !== 1 ? 's' : ''}</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={() => onImages(car)} className="flex items-center justify-center gap-1.5 border border-gray-mid text-charcoal/60 hover:border-orange hover:text-orange text-xs font-semibold py-2 rounded-xl transition-all"><PhotoIcon className="w-4 h-4" /> Photos</button>
          <button onClick={() => onPrice(car)} className="flex items-center justify-center gap-1.5 border border-gray-mid text-charcoal/60 hover:border-orange hover:text-orange text-xs font-semibold py-2 rounded-xl transition-all"><CurrencyRupeeIcon className="w-4 h-4" /> Price</button>
          <button onClick={() => onEdit(car)} className="flex items-center justify-center gap-1.5 border border-gray-mid text-charcoal/60 hover:border-orange hover:text-orange text-xs font-semibold py-2 rounded-xl transition-all"><PencilSquareIcon className="w-4 h-4" /> Edit</button>
          <button onClick={() => onToggle(car)} className={`flex items-center justify-center gap-1.5 border text-xs font-semibold py-2 rounded-xl transition-all ${car.available ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
            {car.available ? <><XCircleIcon className="w-4 h-4" /> Disable</> : <><CheckCircleIcon className="w-4 h-4" /> Enable</>}
          </button>
        </div>
        <button onClick={() => onDelete(car)} className="mt-2 w-full flex items-center justify-center gap-1.5 text-red-400 hover:text-red-600 text-xs font-semibold py-1.5 rounded-xl hover:bg-red-50 transition-all"><TrashIcon className="w-4 h-4" /> Remove Listing</button>
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [imageCar, setImageCar] = useState(null);
  const [priceCar, setPriceCar] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [carsRes, brandsRes, catsRes] = await Promise.all([api.get('/owner/cars?size=50'), api.get('/brands?size=100'), api.get('/categories?size=100')]);
      setCars(carsRes.data.data?.content ?? []);
      setBrands(brandsRes.data.data?.content ?? []);
      setCategories(catsRes.data.data?.content ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (saved) => setCars(prev => { const idx = prev.findIndex(c => c.id === saved.id); return idx >= 0 ? prev.map(c => c.id === saved.id ? saved : c) : [saved, ...prev]; });
  const handleToggle = async (car) => { const { data } = await api.patch(`/owner/cars/${car.id}/toggle-availability`); handleSaved(data.data); };
  const handleDelete = async (car) => { if (!window.confirm(`Remove "${car.brandName} ${car.model}" from listings?`)) return; await api.delete(`/owner/cars/${car.id}`); setCars(prev => prev.filter(c => c.id !== car.id)); };
  const handleImagesUpdated = (carId, images) => setCars(prev => prev.map(c => c.id === carId ? { ...c, images, primaryImageUrl: images.find(i => i.isPrimary)?.imageUrl ?? images[0]?.imageUrl ?? null } : c));

  const available = cars.filter(c => c.available).length;

  return (
    <div className="min-h-screen bg-gray-light">
      <div className="bg-white border-b border-gray-mid px-6 md:px-16 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold tracking-wide text-charcoal">Drive<span className="text-orange">Luxe</span></Link>
          <span className="text-charcoal/20">|</span>
          <div><p className="text-sm font-extrabold text-charcoal leading-none">Owner Dashboard</p><p className="text-xs text-charcoal/50">Manage your listings</p></div>
        </div>
        <button onClick={() => { setEditCar(null); setShowForm(true); }} className="flex items-center gap-2 bg-orange hover:bg-orange-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange/30"><PlusIcon className="w-4 h-4" /> List a Car</button>
      </div>
      <div className="max-w-6xl mx-auto px-6 md:px-16 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[['Total Listings', cars.length], ['Available Now', available], ['Unavailable', cars.length - available], ['Combined Rate', fmtMoney(cars.reduce((s, c) => s + Number(c.pricePerDay), 0))]].map(([label, value]) => (
            <div key={label} className="bg-white rounded-2xl shadow-card p-4"><p className="text-xl font-extrabold text-charcoal truncate">{value}</p><p className="text-xs text-charcoal/50 mt-0.5 leading-tight">{label}</p></div>
          ))}
        </div>
        {!loading && (brands.length === 0 || categories.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6 text-sm text-yellow-800">⚠️ <strong>Brands or categories are empty.</strong> Ask the admin to add brands and categories first.</div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl shadow-card animate-pulse"><div className="h-44 bg-gray-mid rounded-t-2xl" /><div className="p-5 flex flex-col gap-3"><div className="h-4 w-40 bg-gray-mid rounded" /><div className="h-3 w-24 bg-gray-mid rounded" /><div className="h-6 w-20 bg-gray-mid rounded" /></div></div>)}</div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-card">
            <p className="text-4xl mb-4">🚗</p><p className="text-charcoal font-bold text-lg">No cars listed yet</p>
            <p className="text-charcoal/50 text-sm mt-1 mb-6">Start earning by listing your first car</p>
            <button onClick={() => { setEditCar(null); setShowForm(true); }} className="bg-orange hover:bg-orange-hover text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all">List Your First Car</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map(car => <OwnerCarCard key={car.id} car={car} onEdit={c => { setEditCar(c); setShowForm(true); }} onImages={setImageCar} onPrice={setPriceCar} onToggle={handleToggle} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
      {showForm && <CarFormModal car={editCar} brands={brands} categories={categories} onClose={() => { setShowForm(false); setEditCar(null); }} onSaved={handleSaved} />}
      {imageCar && <ImageModal car={imageCar} onClose={() => setImageCar(null)} onUpdated={handleImagesUpdated} />}
      {priceCar && <PriceModal car={priceCar} onClose={() => setPriceCar(null)} onSaved={handleSaved} />}
    </div>
  );
}
