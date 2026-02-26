import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      // ✅ With baseURL "http://localhost:5000/api"
      // this becomes POST http://localhost:5000/api/users/register
      const res = await api.post("/users/register", {
        name,
        email,
        password,
        role: "user",
      });

      // Some backends return token on register. If yours does, store it.
      if (res?.data?.token) {
        localStorage.setItem("userToken", res.data.token);
      }

      setMsg("Registered successfully. You can login now.");
      // send to login
      setTimeout(() => nav("/login"), 700);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <h2 style={{ marginTop: 0 }}>Register</h2>

      {err && <div style={errBox}>{err}</div>}
      {msg && <div style={okBox}>{msg}</div>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
          />
        </label>

        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            placeholder="you@email.com"
          />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder="Password"
          />
        </label>

        <button disabled={loading} type="submit">
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

const errBox = {
  padding: 10,
  border: "1px solid #ffb3b3",
  background: "#ffe7e7",
  borderRadius: 10,
};

const okBox = {
  padding: 10,
  border: "1px solid #a8e6a8",
  background: "#e8ffe8",
  borderRadius: 10,
};