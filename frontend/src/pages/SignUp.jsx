import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { register, clearError } from '../store/authSlice';

export default function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'ROLE_CUSTOMER' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);
  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); dispatch(register(form)); };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: `linear-gradient(135deg, rgba(30,71,58,0.92) 0%, rgba(51,51,51,0.88) 100%), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop') center/cover no-repeat` }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card-hover overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange to-orange-hover" />
        <div className="p-8 md:p-10">
          <Link to="/" className="inline-block text-2xl font-bold tracking-wide text-charcoal mb-8">Drive<span className="text-orange">Luxe</span></Link>
          <h1 className="text-2xl font-extrabold text-charcoal mb-1">Create account</h1>
          <p className="text-charcoal/50 text-sm mb-8">Join DriveLuxe and start renting today</p>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {['firstName', 'lastName'].map((field) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">{field === 'firstName' ? 'First Name' : 'Last Name'}</label>
                  <div className="flex items-center gap-2 border border-gray-mid rounded-xl px-3 py-3 focus-within:border-orange transition-colors">
                    <UserIcon className="w-4 h-4 text-orange flex-shrink-0" />
                    <input type="text" name={field} value={form[field]} onChange={handleChange} placeholder={field === 'firstName' ? 'John' : 'Doe'} required
                      className="flex-1 text-sm text-charcoal outline-none bg-transparent" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">Email Address</label>
              <div className="flex items-center gap-3 border border-gray-mid rounded-xl px-4 py-3 focus-within:border-orange transition-colors">
                <EnvelopeIcon className="w-5 h-5 text-orange flex-shrink-0" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required
                  className="flex-1 text-sm text-charcoal outline-none bg-transparent" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">Password</label>
              <div className="flex items-center gap-3 border border-gray-mid rounded-xl px-4 py-3 focus-within:border-orange transition-colors">
                <LockClosedIcon className="w-5 h-5 text-orange flex-shrink-0" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" required
                  className="flex-1 text-sm text-charcoal outline-none bg-transparent" />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="text-charcoal/40 hover:text-orange transition-colors">
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[['ROLE_CUSTOMER', '🚗 Rent a Car'], ['ROLE_OWNER', '🏠 List My Car']].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setForm(p => ({ ...p, role: value }))}
                    className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${form.role === value ? 'border-orange bg-orange/5 text-orange' : 'border-gray-mid text-charcoal/60 hover:border-orange/50'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange hover:bg-orange-hover disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange/30 mt-1">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-mid" />
            <span className="text-charcoal/40 text-xs">Already have an account?</span>
            <div className="flex-1 h-px bg-gray-mid" />
          </div>
          <Link to="/signin" className="block w-full text-center border-2 border-orange text-orange hover:bg-orange hover:text-white font-semibold text-sm py-3 rounded-xl transition-all duration-300">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
