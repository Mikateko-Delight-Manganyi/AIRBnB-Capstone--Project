import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

export default function MyReservations() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [toasts, setToasts] = useState([]);
  const prevRef = useRef(null);

  const markPaid = async (id) => {
    try {
      await api.patch(`/reservations/${id}/pay`);
      // reload
      const res = await api.get("/reservations/my");
      setItems(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Payment failed");
    }
  };

  // show temporary toast
  const pushToast = (text) => {
    const id = Date.now().toString();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  };

  useEffect(() => {
    let mounted = true;

    const load = async (isPoll = false) => {
      try {
        setErr("");
        const res = await api.get("/reservations/my");

        if (!mounted) return;

        // on poll, compare prevRef to detect status changes
        if (isPoll && prevRef.current) {
          const prev = prevRef.current;
          const next = res.data || [];
          const prevMap = Object.fromEntries(prev.map((p) => [p._id, p]));
          for (const nx of next) {
            const pv = prevMap[nx._id];
            if (pv && pv.status !== nx.status && pv.status !== 'confirmed' && nx.status === 'confirmed') {
              pushToast(`Your booking for ${nx.accommodation?.title || 'listing'} has been confirmed.`);
            }
          }
        }

        prevRef.current = res.data || [];
        setItems(res.data || []);
      } catch (e) {
        const serverMsg = e?.response?.data?.message;
        const status = e?.response?.status;
        console.error("Failed to load /reservations/my", status, serverMsg || e.message);
        if (status === 401) setErr("Please log in to view your reservations");
        else if (status === 403) setErr("Access denied");
        else setErr(serverMsg || "Failed to load your reservations");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // initial load
    load(false);

    // polling every 15s
    const id = setInterval(() => load(true), 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>My Reservations</h2>

      {/* Toasts */}
      <div style={{ position: 'fixed', right: 20, top: 20, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: '#111', color: '#fff', padding: '10px 14px', borderRadius: 8, marginBottom: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
            {t.text}
          </div>
        ))}
      </div>

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
                    {"  "} | {"  "}
                    <strong>Paid:</strong> {r.paid ? "Yes" : "No"}
                  </div>
                  {!r.paid && (
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => markPaid(r._id)} style={{ padding: '8px 10px', borderRadius: 8, background: '#2d8a2d', color: '#fff', border: 'none', cursor: 'pointer' }}>Mark as paid</button>
                    </div>
                  )}
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