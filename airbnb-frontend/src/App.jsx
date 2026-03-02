import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Navbar from "./components/Navbar";
import { AuthContext } from "./context/AuthProvider";

import Home from "./pages/Home";
import Search from "./pages/Search";
import ListingDetails from "./pages/ListingDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyReservations from "./pages/MyReservations";
import AdminReservations from "./pages/AdminReservations";


export default function App() {
  const { user } = useContext(AuthContext);

  function RequireAuth({ children }) {
    return user ? children : <Navigate to="/login" />;
  }

  function RequireAdmin({ children }) {
    return user && user.role === "admin" ? children : <Navigate to="/login" />;
  }

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/my-reservations"
            element={
              <RequireAuth>
                <MyReservations />
              </RequireAuth>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <RequireAdmin>
                <AdminReservations />
              </RequireAdmin>
            }
          />

          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </div>
    </>
  );
}