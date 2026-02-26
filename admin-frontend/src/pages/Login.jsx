import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });

      // save token
      localStorage.setItem("token", res.data.token);

      // go to admin dashboard
      navigate("/admin");
    } catch (err) {
      setError("Invalid login details");
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "auto" }}>
      <h2>Admin Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />

        <button type="submit" style={{ width: "100%" }}>
          Login
        </button>
      </form>
    </div>
  );
}