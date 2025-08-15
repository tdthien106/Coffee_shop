import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";

import Home    from "./pages/Home.jsx";
import Orders  from "./pages/Orders.jsx";
import Staffs  from "./pages/Staffs.jsx";
import Revenue from "./pages/Revenue.jsx";
import Login   from "./pages/Login.jsx";

import CheckoutSummary   from "./pages/CheckoutSummary.jsx";
import CheckoutTransfer  from "./pages/CheckoutTransfer.jsx";
import CheckoutSuccess   from "./pages/CheckoutSuccess.jsx";

import RequireAuth from "././guard/RequireAuth.jsx";

export default function App() {
  const { pathname } = useLocation();

  // Trang đăng nhập: render độc lập (không topbar/sidebar)
  if (pathname.startsWith("/login")) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
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
            {/* Gốc: điều hướng theo role hiện tại */}
            <Route
              path="/"
              element={
                (() => {
                  const token = sessionStorage.getItem("token");
                  const u = sessionStorage.getItem("user");
                  const me = u ? JSON.parse(u) : null;

                  if (!token || !me) return <Navigate to="/login" replace />;

                  const role = (me?.role || "").toLowerCase();
                  return role === "staff"
                    ? <Navigate to="/orders" replace />
                    : <Navigate to="/home" replace />;
                })()
              }
            />

            {/* Manager/Admin ONLY */}
            <Route
              path="/home"
              element={
                <RequireAuth roles={["manager", "admin"]}>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/staffs"
              element={
                <RequireAuth roles={["manager", "admin"]}>
                  <Staffs />
                </RequireAuth>
              }
            />
            <Route
              path="/revenue"
              element={
                <RequireAuth roles={["manager", "admin"]}>
                  <Revenue />
                </RequireAuth>
              }
            />

            {/* Staff ONLY (giữ nguyên ý định ban đầu) */}
            <Route
              path="/orders"
              element={
                <RequireAuth roles={["staff"]}>
                  <Orders />
                </RequireAuth>
              }
            />

            {/* ====== CHECKOUT FLOW (staff + manager) ====== */}
            <Route
              path="/checkout"
              element={
                <RequireAuth roles={["staff", "manager"]}>
                  <CheckoutSummary />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout/transfer"
              element={
                <RequireAuth roles={["staff", "manager"]}>
                  <CheckoutTransfer />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout/success"
              element={
                <RequireAuth roles={["staff", "manager"]}>
                  <CheckoutSuccess />
                </RequireAuth>
              }
            />
            {/* ============================================ */}

            <Route path="*" element={<div className="p">404</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
