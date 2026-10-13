import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircleIcon, CalendarDaysIcon, CreditCardIcon, StarIcon as StarOutline, PencilSquareIcon, LockClosedIcon, ArrowRightOnRectangleIcon, CheckCircleIcon, XCircleIcon, ClockIcon, TruckIcon, ChevronLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import api from '../api/axios';
import { logout } from '../store/authSlice';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtMoney = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const STATUS_STYLES = { PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700', ACTIVE: 'bg-green-100 text-green-700', COMPLETED: 'bg-gray-100 text-gray-600', CANCELLED: 'bg-red-100 text-red-600' };
const STATUS_ICONS = { PENDING: <ClockIcon className="w-4 h-4" />, CONFIRMED: <CheckCircleIcon className="w-4 h-4" />, ACTIVE: <TruckIcon className="w-4 h-4" />, COMPLETED: <CheckCircleIcon className="w-4 h-4" />, CANCELLED: <XCircleIcon className="w-4 h-4" /> };
const PAYMENT_STYLES = { PENDING: 'bg-yellow-100 text-yellow-700', SUCCESS: 'bg-green-100 text-green-700', FAILED: 'bg-red-100 text-red-600', REFUNDED: 'bg-purple-100 text-purple-700' };

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-orange" /></div>
      <div className="min-w-0"><p className="text-xl font-extrabold text-charcoal truncate">{value}</p><p className="text-xs text-charcoal/50 font-medium leading-tight">{label}</p></div>
    </div>
  );
}

function BookingCard({ booking, onPayNow }) {
  const img = booking.primaryImageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=70&auto=format&fit=crop';
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col sm:flex-row gap-4 hover:shadow-card-hover transition-shadow">
      <img src={img} alt={booking.carModel} className="w-full sm:w-32 h-24 object-cover rounded-xl flex-shrink-0" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=70&auto=format&fit=crop'; }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div><p className="font-bold text-charcoal">{booking.brandName} {booking.carModel} {booking.carYear}</p><p className="text-xs text-charcoal/50 mt-0.5">Booking #{booking.id}</p></div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[booking.status]}`}>{STATUS_ICONS[booking.status]} {booking.status}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-charcoal/60">
          <span>📅 {fmt(booking.startDate)} → {fmt(booking.endDate)}</span>
          <span>🗓 {booking.totalDays} day{booking.totalDays > 1 ? 's' : ''}</span>
          <span className="text-orange font-bold text-sm">{fmtMoney(booking.totalPrice)}</span>
        </div>
        {booking.status === 'PENDING' && onPayNow && (
          <button onClick={() => onPayNow(booking)} className="mt-3 flex items-center gap-1.5 bg-orange hover:bg-orange-hover text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">
            <CreditCardIcon className="w-4 h-4" /> Pay Now
          </button>
        )}
      </div>
    </div>
  );
}

function PaymentCard({ payment }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex items-center justify-between gap-4 hover:shadow-card-hover transition-shadow flex-wrap">
      <div>
        <p className="font-bold text-charcoal">{payment.brandName} {payment.carModel}</p>
        <p className="text-xs text-charcoal/50 mt-0.5">Booking #{payment.bookingId} · {payment.totalDays} day{payment.totalDays > 1 ? 's' : ''}{payment.transactionId && <> · TXN: {payment.transactionId}</>}</p>
        <p className="text-xs text-charcoal/40 mt-0.5">{payment.paidAt ? fmt(payment.paidAt) : fmt(payment.createdAt)}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${PAYMENT_STYLES[payment.status] ?? 'bg-gray-light text-charcoal/60'}`}>{payment.status}</span>
        <span className="text-orange font-extrabold text-lg">{fmtMoney(payment.amount)}</span>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <p className="font-bold text-charcoal">{review.brandName} {review.carModel}</p>
        <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <StarIcon key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-orange' : 'text-gray-mid'}`} />)}</div>
      </div>
      <p className="text-sm text-charcoal/70 italic">"{review.comment}"</p>
      <p className="text-xs text-charcoal/40 mt-3">{fmt(review.createdAt)}</p>
    </div>
  );
}

function PayNowModal({ booking, onClose, onPaid }) {
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const METHODS = ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'CASH'];
  const handlePay = async () => {
    setLoading(true); setError('');
    try {
      let payment;
      try {
        const { data } = await api.get(`/payments/booking/${booking.id}`);
        payment = data.data;
      } catch (err) {
        if (err.response?.status !== 404) throw err;
        const { data } = await api.post('/payments', { bookingId: booking.id, method });
        payment = data.data;
      }
      if (payment.status !== 'PENDING') {
        throw new Error(`This booking already has a ${payment.status.toLowerCase()} payment.`);
      }
      const paymentId = payment.id;
      await api.post(`/payments/${paymentId}/confirm`);
      onPaid();
      onClose();
    } catch (err) { setError(err.response?.data?.message || err.message || 'Payment failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange to-orange-hover" />
        <div className="p-7">
          <h3 className="text-lg font-bold text-charcoal mb-1">Complete Payment</h3>
          <p className="text-xs text-charcoal/50 mb-5">{booking.brandName} {booking.carModel} · {booking.totalDays} day{booking.totalDays > 1 ? 's' : ''} · <span className="text-orange font-bold">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</span></p>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(m => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${method === m ? 'border-orange bg-orange/5 text-orange' : 'border-gray-mid text-charcoal/60 hover:border-orange/50'}`}>
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border-2 border-gray-mid text-charcoal/60 font-semibold text-sm py-2.5 rounded-xl">Cancel</button>
            <button onClick={handlePay} disabled={loading} className="flex-1 bg-orange hover:bg-orange-hover disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-all">{loading ? 'Processing…' : 'Pay Now'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { const { data } = await api.put('/users/me', form); onSaved(data.data); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange to-orange-hover" />
        <div className="p-7">
          <h3 className="text-lg font-bold text-charcoal mb-5">Edit Profile</h3>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {['firstName', 'lastName'].map(field => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">{field === 'firstName' ? 'First Name' : 'Last Name'}</label>
                  <input type="text" value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} required className="border border-gray-mid rounded-xl px-4 py-2.5 text-sm text-charcoal outline-none focus:border-orange transition-colors" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">Phone</label>
              <input type="tel" value={form.phone} placeholder="+91XXXXXXXXXX" onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="border border-gray-mid rounded-xl px-4 py-2.5 text-sm text-charcoal outline-none focus:border-orange transition-colors" />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-mid text-charcoal/60 font-semibold text-sm py-2.5 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-orange hover:bg-orange-hover disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-all">{loading ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) { setError('New password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try { await api.patch('/users/me/password', form); setSuccess(true); setTimeout(onClose, 1500); }
    catch (err) { setError(err.response?.data?.message || 'Password change failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange to-orange-hover" />
        <div className="p-7">
          <h3 className="text-lg font-bold text-charcoal mb-5">Change Password</h3>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-4 bg-green-50 px-4 py-2 rounded-xl">Password changed successfully!</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[['currentPassword', 'Current Password'], ['newPassword', 'New Password (min. 8 chars)']].map(([name, label]) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">{label}</label>
                <input type="password" value={form[name]} required onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} className="border border-gray-mid rounded-xl px-4 py-2.5 text-sm text-charcoal outline-none focus:border-orange transition-colors" />
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-mid text-charcoal/60 font-semibold text-sm py-2.5 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading || success} className="flex-1 bg-orange hover:bg-orange-hover disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-all">{loading ? 'Updating…' : 'Update Password'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'overview', label: 'Overview', icon: UserCircleIcon },
  { key: 'bookings', label: 'Bookings', icon: CalendarDaysIcon },
  { key: 'payments', label: 'Payments', icon: CreditCardIcon },
  { key: 'reviews', label: 'Reviews', icon: StarOutline },
];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: authUser } = useSelector(s => s.auth);
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [payNowBooking, setPayNowBooking] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const [pRes, bRes, payRes, rRes] = await Promise.all([api.get('/users/me'), api.get('/bookings?size=50'), api.get('/payments/my?size=50'), api.get('/reviews/my?size=50')]);
      setProfile(pRes.data.data); setBookings(bRes.data.data?.content ?? []); setPayments(payRes.data.data?.content ?? []); setReviews(rRes.data.data?.content ?? []);
    } catch (err) { setLoadError(err.response?.data?.message || 'Could not load your profile. Please try again.'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  const handleLogout = async () => { await dispatch(logout()); navigate('/'); };
  const handleProfileImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/users/me/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(data.data);
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Could not upload profile picture.');
    } finally { setUploadingImage(false); event.target.value = ''; }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center">
      <div className="flex flex-col items-center gap-3"><div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin" /><p className="text-charcoal/50 text-sm">Loading your profile…</p></div>
    </div>
  );
  if (loadError && !profile) return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-card p-8 text-center max-w-md w-full">
        <p className="text-red-500 text-sm mb-5">{loadError}</p>
        <button onClick={loadAll} className="bg-orange hover:bg-orange-hover text-white font-semibold text-sm px-6 py-2.5 rounded-xl">Try Again</button>
      </div>
    </div>
  );

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  const totalSpent = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + Number(p.amount), 0);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div className="min-h-screen bg-gray-light">
      <div className="bg-white border-b border-gray-mid px-6 md:px-16 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-charcoal/60 hover:text-orange transition-colors text-sm font-medium"><ChevronLeftIcon className="w-4 h-4" /> Back to Home</Link>
        <Link to="/" className="text-xl font-bold tracking-wide text-charcoal">Drive<span className="text-orange">Luxe</span></Link>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-red-500 transition-colors font-medium"><ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out</button>
      </div>
      <div className="max-w-6xl mx-auto px-6 md:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-5">
            <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="w-20 h-20 rounded-full bg-orange/10 flex items-center justify-center ring-4 ring-orange/20 overflow-hidden">
                {profile?.profileImageUrl ? <img src={profile.profileImageUrl} alt="avatar" className="w-full h-full rounded-full object-cover" /> : <span className="text-3xl font-extrabold text-orange">{profile?.firstName?.[0]}{profile?.lastName?.[0]}</span>}
                </div>
                <label className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-orange text-white flex items-center justify-center cursor-pointer hover:bg-orange-hover transition-colors" title="Add profile picture">
                  <PhotoIcon className="w-4 h-4" />
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleProfileImage} disabled={uploadingImage} />
                </label>
              </div>
              {uploadingImage && <p className="text-xs text-orange -mt-2 mb-2">Uploading picture…</p>}
              <h2 className="text-charcoal font-bold text-lg">{profile?.firstName} {profile?.lastName}</h2>
              <p className="text-charcoal/50 text-xs mt-1">{profile?.email}</p>
              {profile?.phone && <p className="text-charcoal/50 text-xs">{profile.phone}</p>}
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {profile?.roles?.map(r => <span key={r} className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${r === 'ROLE_ADMIN' ? 'bg-forest/10 text-forest' : 'bg-orange/10 text-orange'}`}>{r.replace('ROLE_', '')}</span>)}
              </div>
              <p className="text-charcoal/40 text-xs mt-3">Member since {profile?.createdAt ? fmt(profile.createdAt) : '—'}</p>
              <div className="flex flex-col gap-2 w-full mt-5">
                <button onClick={() => setShowEdit(true)} className="flex items-center justify-center gap-2 w-full border-2 border-orange text-orange hover:bg-orange hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all"><PencilSquareIcon className="w-4 h-4" /> Edit Profile</button>
                <button onClick={() => setShowPwd(true)} className="flex items-center justify-center gap-2 w-full border-2 border-gray-mid text-charcoal/60 hover:border-charcoal text-sm font-semibold py-2.5 rounded-xl transition-all"><LockClosedIcon className="w-4 h-4" /> Change Password</button>
              </div>
              {loadError && <p className="text-red-500 text-xs mt-3 text-center">{loadError}</p>}
              {authUser?.roles?.includes('ROLE_ADMIN') && <Link to="/admin" className="mt-3 w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest-light text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Admin Dashboard →</Link>}
            </div>
            <div className="bg-white rounded-2xl shadow-card p-3 hidden lg:flex flex-col gap-1">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${tab === key ? 'bg-orange text-white shadow-lg shadow-orange/20' : 'text-charcoal/60 hover:bg-gray-light hover:text-charcoal'}`}>
                  <Icon className="w-5 h-5 flex-shrink-0" /> {label}
                  {key === 'bookings' && bookings.length > 0 && <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${tab === key ? 'bg-white/20 text-white' : 'bg-orange/10 text-orange'}`}>{bookings.length}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${tab === key ? 'bg-orange text-white shadow-lg shadow-orange/20' : 'bg-white text-charcoal/60 shadow-card'}`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
            {tab === 'overview' && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={CalendarDaysIcon} label="Total Bookings" value={bookings.length} />
                  <StatCard icon={CheckCircleIcon} label="Completed" value={completedBookings} />
                  <StatCard icon={CreditCardIcon} label="Total Spent" value={fmtMoney(totalSpent)} />
                  <StatCard icon={StarOutline} label="Avg. Rating" value={avgRating} />
                </div>
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-5"><h3 className="font-bold text-charcoal">Recent Bookings</h3><button onClick={() => setTab('bookings')} className="text-orange text-xs font-semibold hover:underline">View all</button></div>
                  {bookings.length === 0 ? <p className="text-center text-charcoal/40 text-sm py-8">No bookings yet.</p> : <div className="flex flex-col gap-3">{bookings.slice(0, 3).map(b => <BookingCard key={b.id} booking={b} onPayNow={setPayNowBooking} />)}</div>}
                </div>
                {reviews.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-card p-6">
                    <div className="flex items-center justify-between mb-5"><h3 className="font-bold text-charcoal">Recent Reviews</h3><button onClick={() => setTab('reviews')} className="text-orange text-xs font-semibold hover:underline">View all</button></div>
                    <div className="flex flex-col gap-3">{reviews.slice(0, 2).map(r => <ReviewCard key={r.id} review={r} />)}</div>
                  </div>
                )}
              </div>
            )}
            {tab === 'bookings' && <div className="bg-white rounded-2xl shadow-card p-6"><h3 className="font-bold text-charcoal mb-5">All Bookings ({bookings.length})</h3>{bookings.length === 0 ? <p className="text-center text-charcoal/40 text-sm py-8">No bookings yet.</p> : <div className="flex flex-col gap-3">{bookings.map(b => <BookingCard key={b.id} booking={b} onPayNow={setPayNowBooking} />)}</div>}</div>}
            {tab === 'payments' && <div className="bg-white rounded-2xl shadow-card p-6"><h3 className="font-bold text-charcoal mb-5">Payment History ({payments.length})</h3>{payments.length === 0 ? <p className="text-center text-charcoal/40 text-sm py-8">No payments yet.</p> : <div className="flex flex-col gap-3">{payments.map(p => <PaymentCard key={p.id} payment={p} />)}</div>}</div>}
            {tab === 'reviews' && <div className="bg-white rounded-2xl shadow-card p-6"><h3 className="font-bold text-charcoal mb-5">My Reviews ({reviews.length})</h3>{reviews.length === 0 ? <p className="text-center text-charcoal/40 text-sm py-8">No reviews yet.</p> : <div className="flex flex-col gap-3">{reviews.map(r => <ReviewCard key={r.id} review={r} />)}</div>}</div>}
          </div>
        </div>
      </div>
      {showEdit && profile && <EditProfileModal profile={profile} onClose={() => setShowEdit(false)} onSaved={(updated) => setProfile(p => ({ ...p, ...updated }))} />}
      {showPwd && <ChangePasswordModal onClose={() => setShowPwd(false)} />}
      {payNowBooking && <PayNowModal booking={payNowBooking} onClose={() => setPayNowBooking(null)} onPaid={loadAll} />}
    </div>
  );
}
