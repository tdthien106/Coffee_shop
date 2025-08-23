import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiDollarSign,
  FiUsers,
  FiFileText,
  FiShoppingCart,
  FiLogIn,
} from "react-icons/fi";

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
          <NavLink to="/orders" className={item}>
            ORDER
          </NavLink>
        </>
      )}

      {/* Manager/Admin thấy các mục quản trị */}
      {(role === "manager" || role === "admin") && (
        <>
          <NavLink to="/home" className={item}>
            <FiHome className="side-icon" />
            HOMEPAGE
          </NavLink>

          <NavLink to="/orders" className={item}>
            <FiShoppingCart className="side-icon" />
            ORDER
          </NavLink>

          <NavLink to="/revenue" className={item}>
            <FiDollarSign className="side-icon" />
            REVENUE
          </NavLink>

          <NavLink to="/staffs" className={item}>
            <FiUsers className="side-icon" />
            STAFFS
          </NavLink>

          <NavLink to="/export" className={item}>
            <FiFileText className="side-icon" />
            EXPORT
          </NavLink>

          {!role && (
            <NavLink to="/login" className={item}>
              <FiLogIn className="side-icon" />
              LOGIN
            </NavLink>
          )}
        </>
      )}

      {/* Nếu chưa đăng nhập hoặc role lạ: không hiện gì, hoặc tuỳ bạn thêm link Login */}
      {!role && (
        <NavLink to="/login" className={item}>
          LOGIN
        </NavLink>
      )}
    </aside>
  );
}
