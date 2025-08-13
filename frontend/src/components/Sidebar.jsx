import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const item = ({ isActive }) => "side-item" + (isActive ? " active" : "");
  return (
    <aside className="sidebar">
      <div className="side-title">YOUR STORE</div>
      <NavLink to="/home" className={item}>HOMEPAGE</NavLink>
      <NavLink to="/orders" className={item}>ORDER</NavLink>
      <NavLink to="/revenue" className={item}>REVENUE</NavLink>
      <NavLink to="/staffs" className={item}>STAFFS</NavLink>
      <NavLink to="/export" className={item}>EXPORT</NavLink>
    </aside>
  );
}
