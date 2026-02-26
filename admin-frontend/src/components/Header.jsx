import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", gap: 12 }}>
      <Link to="/login">Login</Link>

      {token && (
        <>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/listings">Listings</Link>
          <Link to="/admin/reservations">Reservations</Link>
          <button onClick={logout} style={{ marginLeft: "auto" }}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}