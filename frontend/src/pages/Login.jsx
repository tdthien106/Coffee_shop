import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000/api";

export default function Login() {
  const nav = useNavigate();

  // PHẢI có useState để có setErr
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault(); // quan trọng: tránh reload trang
    setErr("");
    setLoading(true);

    try {
      console.log("[Login] submitting", form);

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",              // QUAN TRỌNG: để nhận cookie session
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      console.log("[Login] status", res.status);

      // Dù 401/500 vẫn phải .json() (có thể throw)
      const json = await res.json().catch(() => ({}));
      console.log("[Login] response json", json);

      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Login failed (${res.status}`);
      }

      // Lưu user (role) để điều hướng UI — quyền thực thi check ở server
      localStorage.setItem("user", JSON.stringify(json.data));

      // Điều hướng theo role
      const role = (json.data?.role || "").toLowerCase();
      nav(role === "manager" ? "/home" : "/staffs", { replace: true });
    } catch (e2) {
      console.error("[Login] error", e2);
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

        {err && <div style={{ color: "#c00", fontSize: 13 }}>{err}</div>}

        <label className="login-label">
          <span>Username*</span>
          <input
            className="login-input"
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="Username"
            autoComplete="username"
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
          />
        </label>

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}