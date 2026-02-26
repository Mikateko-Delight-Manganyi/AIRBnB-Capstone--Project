import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("user1@test.com");
  const [password, setPassword] = useState("user123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // backend route you used earlier
      const res = await api.post("/users/login", { email, password });

      // ✅ IMPORTANT: Save token so reservations can use it
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      nav("/"); // go home after login
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "30px auto" }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>

      {err && (
        <div
          style={{
            padding: 10,
            border: "1px solid #ffb3b3",
            background: "#ffe7e7",
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}