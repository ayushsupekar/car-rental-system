import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />;
  if (adminOnly && !user.roles?.includes('ROLE_ADMIN')) return <Navigate to="/" replace />;
  return children;
}
