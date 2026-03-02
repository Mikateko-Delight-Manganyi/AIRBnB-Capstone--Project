
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // backend route: /api/users/login
      const res = await api.post("/users/login", { email, password });
      const user = res.data?.user;

      // ensure this is an admin user
      if (!user || user.role !== "admin") {
        setErr("Admin access required");
        setLoading(false);
        return;
      }

      // store token for admin app
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser", JSON.stringify(user));

      // optional: also store token as "token" if other parts expect it
      localStorage.setItem("token", res.data.token);

      // Redirect admin to reservations page so they can accept bookings
      nav("/admin/reservations");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <h2 style={{ marginTop: 0 }}>Admin Login</h2>

      {err && <div style={errBox}>{err}</div>}

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        <button disabled={loading} style={btn}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 12, fontSize: 13, color: "#666" }}>
        If you get “User not found”, it means your admin user does not exist in
        the deployed Mongo database yet.
      </p>
    </div>
  );
}

const wrap = {
  maxWidth: 460,
  margin: "40px auto",
  padding: 18,
  border: "1px solid #eee",
  borderRadius: 14,
};

const input = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
  outline: "none",
};

const btn = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

const errBox = {
  padding: 10,
  border: "1px solid #ffb3b3",
  background: "#ffe7e7",
  borderRadius: 10,
  marginBottom: 10,
};