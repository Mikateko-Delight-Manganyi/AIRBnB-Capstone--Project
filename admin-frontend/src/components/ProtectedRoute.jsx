
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");

  if (!token) return <Navigate to="/admin/login" replace />;

  // ensure stored user has admin role
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || localStorage.getItem("user") || "null");
    if (!adminUser || adminUser.role !== "admin") {
      // token exists but user is not admin
      return <Navigate to="/admin/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}