// src/components/Topbar.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logoutClientSide, getToken } from "../utils/auth";

export default function Topbar() {
  const nav = useNavigate();
  const me = useMemo(() => getUser(), []);
  const displayName = me?.name || me?.full_name || me?.username || "User";

  const [confirmOpen, setConfirmOpen] = useState(false);

  // Đóng modal khi nhấn ESC
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e) => e.key === "Escape" && setConfirmOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  async function doLogout() {
    try {
      // Nếu có endpoint BE muốn “invalidate” token, bỏ comment và dùng template string:
      // await fetch("http://localhost:3000/api/auth/logout", {
      //   method: "POST",
      //   headers: { Authorization: Bearer ${getToken()} }
      // });
    } catch {}
    logoutClientSide();                 // Xoá token + user ở FE
    setConfirmOpen(false);
    nav("/login", { replace: true });  // Quay về màn login
  }

  return (
    <>
      <header className="topbar">
        <button className="back" title="Back" onClick={() => nav(-1)}>←</button>
        <div className="brand">GROUP 06</div>

        <div className="topbar-right">
          <span className="avatar-dot" aria-hidden />
          <span className="topbar-name" title={displayName}>Hello {displayName}</span>
          <span className="sep" aria-hidden />
          <button
            className="logout-btn"
            onClick={() => setConfirmOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={confirmOpen}
          >
            Log out
          </button>
        </div>
      </header>

      {confirmOpen && (
        <div className="modal" onMouseDown={() => setConfirmOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>Confirm</div>
              <button className="close" onClick={() => setConfirmOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              Do you want to log out?
              <div className="modal-actions">
                <button className="btn" onClick={() => setConfirmOpen(false)}>Cancel</button>
                <button className="btn danger" onClick={doLogout}>Log Out</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 