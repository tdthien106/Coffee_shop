import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Staffs from "./pages/Staffs.jsx";
import Home from "./pages/Home.jsx";
import Orders from "./pages/Orders.jsx";
import Revenue from "./pages/Revenue.jsx";
import Login from "./pages/Login.jsx";

/* ==== Guard nhỏ ngay trong file: kiểm tra đăng nhập + role ==== */
function RequireAuth({ children, roles }) {
  const u = localStorage.getItem("user");
  const me = u ? JSON.parse(u) : null;

  // Chưa đăng nhập => về /login
  if (!me) return <Navigate to="/login" replace />;

  // Có cấu hình roles => kiểm tra quyền
  if (roles && roles.length) {
    const allow = roles.map((r) => r.toLowerCase());
    const myRole = (me.role || "").toLowerCase();
    if (!allow.includes(myRole)) {
      return <div className="p">403 – Bạn không có quyền truy cập trang này</div>;
    }
  }
  return children;
}

export default function App() {
  const { pathname } = useLocation();

  // Trang đăng nhập: render độc lập (không topbar/sidebar)
  if (pathname.startsWith("/login")) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/home"    element={<RequireAuth roles={['manager']}><Home /></RequireAuth>} />
        <Route path="/staffs"  element={<RequireAuth roles={['staff','manager']}><Staffs/></RequireAuth>} />
      </Routes>
    );
  }

  // Các trang còn lại dùng layout chung + bảo vệ truy cập
  return (
    <div className="layout">
      <Topbar />
      <div className="body">
        <Sidebar />
        <main className="content">
          <Routes>
            {/* Mặc định về login */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Manager-only */}
            <Route
              path="/home"
              element={
                <RequireAuth roles={["manager"]}>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/revenue"
              element={
                <RequireAuth roles={["manager"]}>
                  <Revenue />
                </RequireAuth>
              }
            />

            {/* Staff + Manager đều vào được */}
            <Route
              path="/orders"
              element={
                <RequireAuth roles={["staff", "manager"]}>
                  <Orders />
                </RequireAuth>
              }
            />
            <Route
              path="/staffs"
              element={
                <RequireAuth roles={["staff", "manager"]}>
                  <Staffs />
                </RequireAuth>
              }
            />

            <Route path="*" element={<div className="p">404</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}