import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children, roles }){
  const u = localStorage.getItem('user');
  const me = u ? JSON.parse(u) : null;
  const loc = useLocation();

  if (!me) return <Navigate to="/login" state={{ from: loc }} replace />;

  if (roles && roles.length && !roles.map(r=>r.toLowerCase()).includes(me.role)) {
    return <div className="p">403 – Bạn không có quyền truy cập</div>;
  }
  return children;
}
