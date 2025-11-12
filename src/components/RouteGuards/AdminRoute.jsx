import { Navigate, useLocation } from 'react-router-dom';

function AdminRoute({ children }) {
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true';
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default AdminRoute;


