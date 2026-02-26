import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Search from "./pages/Search";
import ListingDetails from "./pages/ListingDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyReservations from "./pages/MyReservations";


export default function App() {
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
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </div>
    </>
  );
}