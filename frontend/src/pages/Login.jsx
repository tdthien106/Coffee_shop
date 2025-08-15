import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000/api";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ❌ KHÔNG dùng credentials với JWT
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Login failed (${res.status})`);
      }

      // ✅ Lưu token & user từ JWT login API
      sessionStorage.setItem("token", json.token);
      sessionStorage.setItem("user", JSON.stringify(json.user));

      // Điều hướng theo role (tùy UI của bạn)
      const role = (json.user?.role || "").toLowerCase();
      if (role === "manager" || role === "admin" ) {
        nav("/home", { replace: true });
      } else {
        // staff / customer
        nav("/orders", { replace: true });
      }
    } catch (e2) {
      setErr(e2.message || "Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-title">COFFEE SHOP</div>

      <form className="login-card" onSubmit={submit}>
        <h1 className="login-h1">Login</h1>

        {err && (
          <div style={{ color: "#c00", fontSize: 13, marginBottom: 8 }}>
            {err}
          </div>
        )}

        <label className="login-label">
          <span>Username*</span>
          <input
            className="login-input"
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="Username"
            autoComplete="username"
            required
          />
        </label>

        <label className="login-label">
          <span>Password*</span>
          <input
            className="login-input"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            autoComplete="current-password"
            required
          />
        </label>

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
