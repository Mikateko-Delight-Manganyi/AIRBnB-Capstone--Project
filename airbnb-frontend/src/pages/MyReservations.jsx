import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function MyReservations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");

        // Option 1 (recommended): /reservations/my
        const res = await api.get("/reservations/my");

        // If your backend uses a different endpoint, replace with:
        // const res = await api.get("/reservations/me");

        setItems(res.data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load your reservations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>My Reservations</h2>

      {loading && <div>Loading...</div>}
      {err && <div style={errBox}>{err}</div>}

      {!loading && !err && (
        <>
          {items.length === 0 ? (
            <div>
              No reservations yet. Go back to <Link to="/">Home</Link> and reserve a stay.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {items.map((r) => (
                <div key={r._id} style={card}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    {r.accommodation?.title || "Listing"}
                  </div>
                  <div style={{ color: "#555", marginTop: 4 }}>
                    {r.accommodation?.location || ""}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <strong>Check-in:</strong>{" "}
                    {r.checkIn ? new Date(r.checkIn).toLocaleDateString() : "-"}
                    {"  "} | {"  "}
                    <strong>Check-out:</strong>{" "}
                    {r.checkOut ? new Date(r.checkOut).toLocaleDateString() : "-"}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <strong>Total:</strong> R {r.totalPrice} {"  "} | {"  "}
                    <strong>Status:</strong> {r.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const card = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 14,
  background: "#fff",
};

const errBox = {
  padding: 10,
  border: "1px solid #ffb3b3",
  background: "#ffe7e7",
  borderRadius: 10,
  marginBottom: 10,
};