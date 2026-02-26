import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div style={bar}>
      <div style={{ fontWeight: 700 }}>Airbnb Clone</div>

      <div style={links}>
        <Link to="/" style={a}>Home</Link>
        <Link to="/search" style={a}>Search</Link>
        <Link to="/login" style={a}>Login</Link>
        <Link to="/register" style={a}>Register</Link>
        <Link to="/my-reservations">My Reservations</Link>
      </div>
    </div>
  );
}

const bar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 20px",
  borderBottom: "1px solid #eee",
};

const links = { display: "flex", gap: 14 };
const a = { textDecoration: "none" };