import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  TagIcon, RectangleStackIcon, PlusIcon, PencilSquareIcon, TrashIcon,
  CheckCircleIcon, XCircleIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  UsersIcon, TruckIcon, CreditCardIcon, ChartBarIcon, ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import api from '../api/axios';

const ADMIN_PIN = 'ayush@2583';
const SESSION_KEY = 'admin_unlocked';
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const cls = "border border-gray-mid rounded-xl px-4 py-2.5 text-sm text-charcoal outline-none focus:border-orange transition-colors bg-white";

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700', COMPLETED: 'bg-gray-100 text-gray-600', CANCELLED: 'bg-red-100 text-red-600',
};
const PAYMENT_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-600', REFUNDED: 'bg-purple-100 text-purple-700',
};

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) { sessionStorage.setItem(SESSION_KEY, '1'); onUnlock(); }
    else { setError('Incorrect password. Try again.'); setShake(true); setPin(''); setTimeout(() => setShake(false), 600); }
  };
  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className={`bg-white rounded-2xl shadow-card-hover w-full max-w-sm overflow-hidden ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
        <div className="h-1.5 bg-gradient-to-r from-orange to-orange-hover" />
        <div className="p-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-orange/10 flex items-center justify-center mb-5"><LockClosedIcon className="w-7 h-7 text-orange" /></div>
          <h2 className="text-xl font-extrabold text-charcoal mb-1">Admin Access</h2>
          <p className="text-xs text-charcoal/50 mb-6 text-center">Enter the admin password to continue</p>
          {error && <p className="w-full text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex items-center border border-gray-mid rounded-xl px-4 py-3 focus-within:border-orange gap-3">
              <LockClosedIcon className="w-4 h-4 text-charcoal/30 shrink-0" />
              <input ref={inputRef} type={show ? 'text' : 'password'} value={pin} onChange={e => { setPin(e.target.value); setError(''); }} placeholder="Admin password" className="flex-1 text-sm text-charcoal outline-none bg-transparent" />
              <button type="button" onClick={() => setShow(s => !s)} className="text-charcoal/30 hover:text-orange">{show ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}</button>
            </div>
            <button type="submit" className="w-full bg-orange hover:bg-orange-hover text-white font-semibold text-sm py-3 rounded-xl transition-all">Unlock Dashboard</button>
          </form>
          <Link to="/" className="mt-5 text-xs text-charcoal/40 hover:text-orange">← Back to Home</Link>
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = 'text-orange' }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0"><Icon className={`w-6 h-6 ${color}`} /></div>
      <div><p className="text-2xl font-extrabold text-charcoal">{value}</p><p className="text-xs text-charcoal/50 font-medium">{label}</p></div>
    </div>
  );
}

function CrudTable({ rows, columns, loading, onEdit, onDelete, actions }) {
  if (loading) return <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-mid/40 rounded-xl animate-pulse" />)}</div>;
  if (!rows.length) return <p className="text-center text-charcoal/40 text-sm py-12">No records found.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-mid">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-light border-b border-gray-mid">{columns.map(c => <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold text-charcoal/50 uppercase tracking-wider">{c.label}</th>)}<th className="text-right px-4 py-3 text-xs font-semibold text-charcoal/50 uppercase tracking-wider">Actions</th></tr></thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id} className={`border-b border-gray-mid last:border-0 hover:bg-orange/5 transition-colors ${idx % 2 !== 0 ? 'bg-gray-light/50' : ''}`}>
              {columns.map(c => <td key={c.key} className="px-4 py-3 text-charcoal">{c.render ? c.render(row) : row[c.key] ?? '—'}</td>)}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {actions ? actions(row) : <>
                    {onEdit && <button onClick={() => onEdit(row)} className="p-1.5 rounded-lg text-charcoal/40 hover:text-orange hover:bg-orange/10"><PencilSquareIcon className="w-4 h-4" /></button>}
                    {onDelete && <button onClick={() => onDelete(row)} className="p-1.5 rounded-lg text-charcoal/40 hover:text-red-500 hover:bg-red-50"><TrashIcon className="w-4 h-4" /></button>}
                  </>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormModal({ title, fields, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange to-orange-hover" />
        <div className="p-7">
          <h3 className="text-lg font-bold text-charcoal mb-5">{title}</h3>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map(({ key, label, placeholder, type = 'text', required = true, options }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">{label}</label>
                {type === 'textarea' ? <textarea value={form[key] ?? ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} rows={3} className={`${cls} resize-none`} />
                  : type === 'select' ? <select value={form[key] ?? ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required={required} className={cls}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  : <input type={type} value={form[key] ?? ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} required={required} className={cls} />}
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-mid text-charcoal/60 font-semibold text-sm py-2.5 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-orange hover:bg-orange-hover disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl">{loading ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function DashboardSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/admin/dashboard').then(({ data }) => setStats(data.data)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-mid/40 rounded-2xl animate-pulse" />)}</div>;
  if (!stats) return <p className="text-charcoal/40 text-sm">Could not load stats.</p>;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} label="Total Users" value={stats.totalUsers ?? 0} />
        <StatCard icon={TruckIcon} label="Total Cars" value={stats.totalCars ?? 0} />
        <StatCard icon={ChartBarIcon} label="Total Bookings" value={stats.totalBookings ?? 0} />
        <StatCard icon={CreditCardIcon} label="Total Revenue" value={fmtMoney(stats.totalRevenue ?? 0)} color="text-green-600" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircleIcon} label="Active Bookings" value={stats.activeBookings ?? 0} color="text-blue-600" />
        <StatCard icon={XCircleIcon} label="Cancelled" value={stats.cancelledBookings ?? 0} color="text-red-500" />
        <StatCard icon={TruckIcon} label="Available Cars" value={stats.availableCars ?? 0} color="text-green-600" />
        <StatCard icon={UsersIcon} label="Active Users" value={stats.activeUsers ?? 0} color="text-forest" />
      </div>
    </div>
  );
}

function BrandsSection() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const load = useCallback(async () => { setLoading(true); try { const { data } = await api.get('/admin/brands?size=100&sortBy=name'); setBrands(data.data?.content ?? []); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const handleSave = async (form) => {
    if (modal.mode === 'add') { const { data } = await api.post('/admin/brands', form); setBrands(p => [data.data, ...p]); }
    else { const { data } = await api.put(`/admin/brands/${modal.item.id}`, form); setBrands(p => p.map(b => b.id === data.data.id ? data.data : b)); }
  };
  const handleDelete = async (brand) => { if (!window.confirm(`Delete brand "${brand.name}"?`)) return; await api.delete(`/admin/brands/${brand.id}`); setBrands(p => p.filter(b => b.id !== brand.id)); };
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Brand', render: row => <div className="flex items-center gap-3">{row.logoUrl ? <img src={row.logoUrl} alt={row.name} className="w-7 h-7 object-contain rounded" onError={e => { e.target.style.display = 'none'; }} /> : <div className="w-7 h-7 rounded bg-orange/10 flex items-center justify-center"><TagIcon className="w-4 h-4 text-orange" /></div>}<span className="font-semibold">{row.name}</span></div> },
    { key: 'isActive', label: 'Status', render: row => row.isActive !== false ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircleIcon className="w-4 h-4" />Active</span> : <span className="flex items-center gap-1 text-red-400 text-xs font-semibold"><XCircleIcon className="w-4 h-4" />Inactive</span> },
  ];
  const fields = [{ key: 'name', label: 'Brand Name', placeholder: 'e.g. Maruti Suzuki' }, { key: 'logoUrl', label: 'Logo URL (optional)', placeholder: 'https://...', required: false }];
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-lg font-bold text-charcoal">Brands</h2><p className="text-xs text-charcoal/50 mt-0.5">{brands.length} total</p></div>
        <button onClick={() => setModal({ mode: 'add', item: null })} className="flex items-center gap-2 bg-orange hover:bg-orange-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"><PlusIcon className="w-4 h-4" /> Add Brand</button>
      </div>
      <CrudTable rows={brands} columns={columns} loading={loading} onEdit={item => setModal({ mode: 'edit', item })} onDelete={handleDelete} />
      {modal && <FormModal title={modal.mode === 'add' ? 'Add Brand' : 'Edit Brand'} fields={fields} initial={modal.item ? { name: modal.item.name, logoUrl: modal.item.logoUrl ?? '' } : { name: '', logoUrl: '' }} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}

function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const load = useCallback(async () => { setLoading(true); try { const { data } = await api.get('/admin/categories?size=100&sortBy=name'); setCategories(data.data?.content ?? []); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const handleSave = async (form) => {
    if (modal.mode === 'add') { const { data } = await api.post('/admin/categories', form); setCategories(p => [data.data, ...p]); }
    else { const { data } = await api.put(`/admin/categories/${modal.item.id}`, form); setCategories(p => p.map(c => c.id === data.data.id ? data.data : c)); }
  };
  const handleDelete = async (cat) => { if (!window.confirm(`Delete category "${cat.name}"?`)) return; await api.delete(`/admin/categories/${cat.id}`); setCategories(p => p.filter(c => c.id !== cat.id)); };
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Category', render: row => <div className="flex items-center gap-3"><div className="w-7 h-7 rounded bg-forest/10 flex items-center justify-center"><RectangleStackIcon className="w-4 h-4 text-forest" /></div><span className="font-semibold">{row.name}</span></div> },
    { key: 'description', label: 'Description', render: row => <span className="text-charcoal/50">{row.description || '—'}</span> },
    { key: 'isActive', label: 'Status', render: row => row.isActive !== false ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircleIcon className="w-4 h-4" />Active</span> : <span className="flex items-center gap-1 text-red-400 text-xs font-semibold"><XCircleIcon className="w-4 h-4" />Inactive</span> },
  ];
  const fields = [{ key: 'name', label: 'Category Name', placeholder: 'e.g. SUV' }, { key: 'description', label: 'Description (optional)', placeholder: 'Short description…', type: 'textarea', required: false }];
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-lg font-bold text-charcoal">Categories</h2><p className="text-xs text-charcoal/50 mt-0.5">{categories.length} total</p></div>
        <button onClick={() => setModal({ mode: 'add', item: null })} className="flex items-center gap-2 bg-orange hover:bg-orange-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"><PlusIcon className="w-4 h-4" /> Add Category</button>
      </div>
      <CrudTable rows={categories} columns={columns} loading={loading} onEdit={item => setModal({ mode: 'edit', item })} onDelete={handleDelete} />
      {modal && <FormModal title={modal.mode === 'add' ? 'Add Category' : 'Edit Category'} fields={fields} initial={modal.item ? { name: modal.item.name, description: modal.item.description ?? '' } : { name: '', description: '' }} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}

function CarsSection() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { const { data } = await api.get('/admin/cars?size=100'); setCars(data.data?.content ?? []); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const handleToggle = async (car) => { const { data } = await api.patch(`/admin/cars/${car.id}/toggle-availability`); setCars(p => p.map(c => c.id === data.data.id ? data.data : c)); };
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'model', label: 'Car', render: row => <div><p className="font-semibold text-charcoal">{row.brandName} {row.model}</p><p className="text-xs text-charcoal/40">{row.year} · {row.fuelType} · {row.transmission}</p></div> },
    { key: 'categoryName', label: 'Category' },
    { key: 'pricePerDay', label: 'Price/Day', render: row => <span className="font-bold text-orange">{fmtMoney(row.pricePerDay)}</span> },
    { key: 'isAvailable', label: 'Available', render: row => row.isAvailable ? <span className="text-green-600 text-xs font-semibold">Yes</span> : <span className="text-red-500 text-xs font-semibold">No</span> },
    { key: 'isActive', label: 'Active', render: row => row.isActive !== false ? <span className="text-green-600 text-xs font-semibold">Yes</span> : <span className="text-red-500 text-xs font-semibold">No</span> },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-lg font-bold text-charcoal">Cars</h2><p className="text-xs text-charcoal/50 mt-0.5">{cars.length} total</p></div>
      </div>
      <CrudTable rows={cars} columns={columns} loading={loading}
        actions={(row) => (
          <button onClick={() => handleToggle(row)} className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-all ${row.isAvailable ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>{row.isAvailable ? 'Disable' : 'Enable'}</button>
        )}
      />
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { const { data } = await api.get('/admin/users?size=100'); setUsers(data.data?.content ?? []); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const handleToggle = async (user) => { const { data } = await api.patch(`/admin/users/${user.id}/toggle-status`); setUsers(p => p.map(u => u.id === data.data.id ? data.data : u)); };
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name', render: row => <div><p className="font-semibold">{row.firstName} {row.lastName}</p><p className="text-xs text-charcoal/40">{row.email}</p></div> },
    { key: 'roles', label: 'Roles', render: row => <div className="flex flex-wrap gap-1">{row.roles?.map(r => <span key={r} className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange/10 text-orange">{r.replace('ROLE_', '')}</span>)}</div> },
    { key: 'isActive', label: 'Status', render: row => row.isActive ? <span className="text-green-600 text-xs font-semibold">Active</span> : <span className="text-red-500 text-xs font-semibold">Inactive</span> },
    { key: 'createdAt', label: 'Joined', render: row => fmt(row.createdAt) },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-lg font-bold text-charcoal">Users</h2><p className="text-xs text-charcoal/50 mt-0.5">{users.length} total</p></div>
      </div>
      <CrudTable rows={users} columns={columns} loading={loading}
        actions={(row) => (
          <button onClick={() => handleToggle(row)} className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-all ${row.isActive ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>{row.isActive ? 'Deactivate' : 'Activate'}</button>
        )}
      />
    </div>
  );
}

function BookingsSection() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { const { data } = await api.get('/admin/bookings?size=100'); setBookings(data.data?.content ?? []); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'car', label: 'Car', render: row => <span className="font-semibold">{row.brandName} {row.carModel}</span> },
    { key: 'user', label: 'User', render: row => <span>{row.userFullName}</span> },
    { key: 'startDate', label: 'Dates', render: row => <span className="text-xs">{fmt(row.startDate)} → {fmt(row.endDate)}</span> },
    { key: 'totalPrice', label: 'Amount', render: row => <span className="font-bold text-orange">{fmtMoney(row.totalPrice)}</span> },
    { key: 'status', label: 'Status', render: row => <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[row.status] ?? 'bg-gray-100 text-gray-600'}`}>{row.status}</span> },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-lg font-bold text-charcoal">Bookings</h2><p className="text-xs text-charcoal/50 mt-0.5">{bookings.length} total</p></div>
      </div>
      <CrudTable rows={bookings} columns={columns} loading={loading} />
    </div>
  );
}

function PaymentsSection() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { const { data } = await api.get('/admin/payments?size=100'); setPayments(data.data?.content ?? []); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'car', label: 'Car', render: row => <span className="font-semibold">{row.brandName} {row.carModel}</span> },
    { key: 'amount', label: 'Amount', render: row => <span className="font-bold text-orange">{fmtMoney(row.amount)}</span> },
    { key: 'method', label: 'Method', render: row => <span className="text-xs">{row.method}</span> },
    { key: 'status', label: 'Status', render: row => <span className={`text-xs font-semibold px-2 py-1 rounded-full ${PAYMENT_STYLES[row.status] ?? 'bg-gray-100 text-gray-600'}`}>{row.status}</span> },
    { key: 'paidAt', label: 'Paid At', render: row => fmt(row.paidAt) },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-lg font-bold text-charcoal">Payments</h2><p className="text-xs text-charcoal/50 mt-0.5">{payments.length} total</p></div>
      </div>
      <CrudTable rows={payments} columns={columns} loading={loading} />
    </div>
  );
}

function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { const { data } = await api.get('/admin/reviews?size=100'); setReviews(data.data?.content ?? []); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const handleDelete = async (review) => { if (!window.confirm('Delete this review?')) return; await api.delete(`/admin/reviews/${review.id}`); setReviews(p => p.filter(r => r.id !== review.id)); };
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'car', label: 'Car', render: row => <span className="font-semibold">{row.brandName} {row.carModel}</span> },
    { key: 'user', label: 'User', render: row => <span>{row.reviewerName}</span> },
    { key: 'rating', label: 'Rating', render: row => <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <StarIcon key={s} className={`w-4 h-4 ${s <= row.rating ? 'text-orange' : 'text-gray-mid'}`} />)}</div> },
    { key: 'comment', label: 'Comment', render: row => <span className="text-charcoal/60 text-xs">{row.comment || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: row => fmt(row.createdAt) },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-lg font-bold text-charcoal">Reviews</h2><p className="text-xs text-charcoal/50 mt-0.5">{reviews.length} total</p></div>
      </div>
      <CrudTable rows={reviews} columns={columns} loading={loading} onDelete={handleDelete} />
    </div>
  );
}

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { key: 'brands', label: 'Brands', icon: TagIcon },
  { key: 'categories', label: 'Categories', icon: RectangleStackIcon },
  { key: 'cars', label: 'Cars', icon: TruckIcon },
  { key: 'users', label: 'Users', icon: UsersIcon },
  { key: 'bookings', label: 'Bookings', icon: CreditCardIcon },
  { key: 'payments', label: 'Payments', icon: CreditCardIcon },
  { key: 'reviews', label: 'Reviews', icon: StarIcon },
];

export default function AdminDashboard() {
  const [active, setActive] = useState('dashboard');
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;
  return (
    <div className="min-h-screen bg-gray-light flex flex-col">
      <div className="bg-white border-b border-gray-mid px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold tracking-wide text-charcoal">Drive<span className="text-orange">Luxe</span></Link>
          <span className="text-charcoal/30">|</span>
          <span className="text-sm font-semibold text-forest">Admin Panel</span>
        </div>
        <Link to="/dashboard" className="text-sm text-charcoal/50 hover:text-orange transition-colors font-medium">← Back to Dashboard</Link>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 bg-white border-r border-gray-mid p-4 flex flex-col gap-1 shrink-0 sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto">
          <p className="text-xs font-bold text-charcoal/40 uppercase tracking-widest px-3 mb-2">Manage</p>
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActive(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full ${active === key ? 'bg-orange text-white shadow-md shadow-orange/30' : 'text-charcoal/60 hover:bg-orange/10 hover:text-orange'}`}>
              <Icon className="w-4 h-4 shrink-0" />{label}
            </button>
          ))}
        </aside>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto min-w-0">
          <div className="max-w-5xl">
          {active === 'dashboard' && <DashboardSection />}
          {active === 'brands' && <BrandsSection />}
          {active === 'categories' && <CategoriesSection />}
          {active === 'cars' && <CarsSection />}
          {active === 'users' && <UsersSection />}
          {active === 'bookings' && <BookingsSection />}
          {active === 'payments' && <PaymentsSection />}
          {active === 'reviews' && <ReviewsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
