import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const item = ({ isActive }) => "side-item" + (isActive ? " active" : "");

  // Lấy role từ sessionStorage (đã lưu sau khi login)
  const userStr = sessionStorage.getItem("user");
  const me = userStr ? JSON.parse(userStr) : null;
  const role = (me?.role || "").toLowerCase();

  return (
    <aside className="sidebar">
      <div className="side-title">YOUR STORE</div>

      {/* Staff CHỈ thấy Order */}
      {role === "staff" && (
        <>
          <NavLink to="/orders" className={item}>ORDER</NavLink>
        </>
      )}

      {/* Manager/Admin thấy các mục quản trị */}
      {(role === "manager" || role === "admin") && (
        <>
          <NavLink to="/home" className={item}>HOMEPAGE</NavLink>
          <NavLink to="/revenue" className={item}>REVENUE</NavLink>
          <NavLink to="/staffs" className={item}>STAFFS</NavLink>
          <NavLink to="/export" className={item}>EXPORT</NavLink>
          <NavLink to="/orders" className={item}>ORDER</NavLink>
        </>
      )}

      {/* Nếu chưa đăng nhập hoặc role lạ: không hiện gì, hoặc tuỳ bạn thêm link Login */}
      {!role && (
        <NavLink to="/login" className={item}>LOGIN</NavLink>
      )}
    </aside>
  );
}