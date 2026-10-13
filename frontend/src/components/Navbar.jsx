import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => { await dispatch(logout()); navigate('/'); };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-card' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-4 flex items-center justify-between">
        <Link to="/" className={`text-xl font-bold tracking-wide ${scrolled ? 'text-charcoal' : 'text-white'}`}>
          Drive<span className="text-orange">Luxe</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {['#cars', '#booking', '#about'].map((href, i) => (
            <a key={href} href={href} className={`text-sm font-medium transition-colors hover:text-orange ${scrolled ? 'text-charcoal/70' : 'text-white/80'}`}>
              {['Fleet', 'Book Now', 'About'][i]}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className={`text-sm font-medium transition-colors hover:text-orange ${scrolled ? 'text-charcoal/70' : 'text-white/80'}`}>
                <UserCircleIcon className="w-5 h-5 inline mr-1" />{user.firstName}
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors">
                <ArrowRightOnRectangleIcon className="w-5 h-5 inline mr-1" />Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className={`text-sm font-medium transition-colors hover:text-orange ${scrolled ? 'text-charcoal/70' : 'text-white/80'}`}>Sign In</Link>
              <Link to="/signup" className="bg-orange hover:bg-orange-hover text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange/30">Get Started</Link>
            </>
          )}
        </div>
        <button onClick={() => setOpen(!open)} className={`md:hidden ${scrolled ? 'text-charcoal' : 'text-white'}`}>
          {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-gray-mid px-6 py-4 flex flex-col gap-4">
          {['#cars', '#booking'].map((href, i) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="text-sm font-medium text-charcoal/70 hover:text-orange">{['Fleet', 'Book Now'][i]}</a>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium text-charcoal/70 hover:text-orange">Dashboard</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="text-sm font-medium text-red-400 text-left">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/signin" onClick={() => setOpen(false)} className="text-sm font-medium text-charcoal/70 hover:text-orange">Sign In</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="bg-orange text-white text-sm font-semibold px-5 py-2.5 rounded-xl text-center">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
