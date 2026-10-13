import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { logout } from '../store/authSlice';
import OwnerDashboard from './OwnerDashboard';

export default function DualDashboard() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOwner = user?.roles?.includes('ROLE_OWNER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const handleLogout = async () => { await dispatch(logout()); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-light">
      <div className="bg-white border-b border-gray-mid px-6 md:px-16 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Link to="/" className="text-xl font-bold tracking-wide text-charcoal">Drive<span className="text-orange">Luxe</span></Link>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${isAdmin ? 'bg-forest/10 text-forest' : isOwner ? 'bg-orange/10 text-orange' : 'bg-blue-50 text-blue-600'}`}>
            {isAdmin ? 'Admin' : isOwner ? 'Car Owner' : 'Renter'}
          </span>
          {isOwner && <Link to="/profile" className="text-sm text-charcoal/60 hover:text-orange transition-colors font-medium">My Bookings</Link>}
          {isAdmin && <Link to="/admin" className="text-sm text-charcoal/60 hover:text-orange transition-colors font-medium">Admin Panel</Link>}
          <Link to="/profile" className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-orange transition-colors font-medium">
            <UserCircleIcon className="w-5 h-5" />{user?.firstName}
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-red-500 transition-colors font-medium">
            <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
      {isOwner || isAdmin ? (
        <OwnerDashboard />
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-5xl mb-6">🚗</p>
          <h2 className="text-2xl font-extrabold text-charcoal mb-3">Welcome, {user?.firstName}!</h2>
          <p className="text-charcoal/50 text-sm mb-8 leading-relaxed">You're signed in as a <strong>Renter</strong>. Browse our fleet, make bookings, and track all your rentals from your profile.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/#cars" className="bg-orange hover:bg-orange-hover text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange/30">Browse Cars</Link>
            <Link to="/profile" className="border-2 border-orange text-orange hover:bg-orange hover:text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all duration-300">My Bookings & Profile</Link>
          </div>
        </div>
      )}
    </div>
  );
}
