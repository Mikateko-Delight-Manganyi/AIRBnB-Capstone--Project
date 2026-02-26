import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Reservations from "./pages/Reservations";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
          <Route path="/admin/listings/new" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
          <Route path="/admin/listings/:id/edit" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
          <Route path="/admin/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />

          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}