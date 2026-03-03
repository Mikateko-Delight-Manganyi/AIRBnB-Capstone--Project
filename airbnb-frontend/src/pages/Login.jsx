import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthProvider";

export default function Login() {
  const nav = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.post("/users/login", { email, password });
      const token = res.data?.token;
      const user = res.data?.user;

      if (!token) throw new Error("No token returned");

      // use AuthContext to persist token + user
      if (typeof login === "function") {
        login({ token, user });
      } else {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Role-based redirection
      if (user?.role === "admin") {
        console.log("Admin logged in, redirecting to admin dashboard");
        // If admin frontend is on a different URL, you can use:
        // window.location.href = import.meta.env.VITE_ADMIN_URL || "/admin/bookings";
        nav("/admin/bookings");
      } else {
        nav("/");
      }
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Login</h2>

      {err && (
        <div style={{ padding: 10, background: "#ffe7e7", border: "1px solid #ffb3b3", borderRadius: 10 }}>
          {err}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>

      <p style={{ marginTop: 10 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
