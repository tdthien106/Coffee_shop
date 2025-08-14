import { Navigate, useLocation } from 'react-router-dom';

/**
 * RequireAuth
 * - Kiểm tra đã đăng nhập (dựa trên sessionStorage: token + user)
 * - Nếu có props roles thì chỉ cho phép các role đó
 * - Nếu không đủ quyền: điều hướng mềm về trang hợp lệ theo role hiện tại
 */
export default function RequireAuth({ children, roles }) {
  const loc = useLocation();
  const userStr = sessionStorage.getItem('user');
  const token   = sessionStorage.getItem('token');
  const me      = userStr ? JSON.parse(userStr) : null;
  const role    = (me?.role || '').toLowerCase();

  // Chưa đăng nhập => về /login (giữ "from" để sau này cần quay lại)
  if (!token || !me) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  // Nếu có yêu cầu roles => check quyền
  if (Array.isArray(roles) && roles.length > 0) {
    const allow = roles.map(r => String(r).toLowerCase());
    if (!allow.includes(role)) {
      // Điều hướng mềm theo role hiện tại
      return role === 'staff'
        ? <Navigate to="/orders" replace />
        : <Navigate to="/home" replace />;
    }
  }

  return children;
}


