import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/auth";

export default function Topbar() {
  const nav = useNavigate();
  const me = useMemo(() => getUser(), []);
  const displayName = me?.name || me?.username || "User";

  return (
    <header className="topbar">
      <button className="back" title="Back" onClick={() => nav(-1)}>←</button>
      <div className="brand">MAT COFFEE</div>
      <div className="topbar-right">
        <span className="topbar-name">Hello {displayName}</span>
      </div>
    </header>
  );
}