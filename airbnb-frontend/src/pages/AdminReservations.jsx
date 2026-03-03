import { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthProvider";

export default function AdminReservations() {
  const { user } = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reservations");
      setList(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || e.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setErr("");
    try {
      // Try PATCH first
      await api.patch(`/reservations/${id}`, { status });
      await load();
    } catch (e) {
      // Fallback to POST if PATCH fails
      if (e.response?.status === 404 || (typeof e.response?.data === 'string' && e.response.data.includes('<html'))) {
        try {
          await api.post(`/reservations/${id}/status`, { status });
          await load();
          return;
        } catch (e2) {
          console.error("Fallback failed", e2);
        }
      }
      setErr(e.response?.data?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const togglePaid = async (id) => {
    setUpdatingId(id);
    try {
      await api.patch(`/reservations/${id}/pay`);
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Payment update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <h3>Access Denied</h3>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={header}>
        <h2 style={{ margin: 0 }}>Admin Dashboard: Bookings</h2>
        <button onClick={load} style={refreshBtn}>Refresh</button>
      </div>

      {err && <div style={errBox}>{err}</div>}
      {loading && <div style={{ textAlign: 'center', padding: 40 }}>Loading reservations...</div>}

      {!loading && (
        <div style={grid}>
          {list.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#666' }}>
              No reservations found.
            </div>
          ) : (
            list.map((r) => (
              <div key={r._id} style={card}>
                <div style={cardHeader}>
                  <div style={statusBadge(r.status)}>{r.status.toUpperCase()}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {r.paid && <span style={{ color: '#2d8a2d', fontSize: 12, fontWeight: 700 }}>PAID</span>}
                    <div style={price}>R {r.totalPrice}</div>
                  </div>
                </div>

                <div style={listingTitle}>{r.accommodation?.title || "Unknown Listing"}</div>
                
                <div style={detailRow}>
                  <strong>Guest:</strong> {r.user?.name || "Guest"} ({r.user?.email || "No Email"})
                </div>

                <div style={detailRow}>
                  <strong>Dates:</strong> {new Date(r.checkIn).toLocaleDateString()} — {new Date(r.checkOut).toLocaleDateString()}
                </div>

                <div style={actions}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        disabled={updatingId === r._id || r.status === 'confirmed'}
                        onClick={() => updateStatus(r._id, "confirmed")} 
                        style={{ ...confirmBtn, opacity: r.status === 'confirmed' ? 0.5 : 1 }}
                      >
                        {r.status === 'confirmed' ? "Confirmed" : "Confirm"}
                      </button>
                      <button 
                        disabled={updatingId === r._id || r.status === 'cancelled'}
                        onClick={() => updateStatus(r._id, "cancelled")} 
                        style={{ ...cancelBtn, opacity: r.status === 'cancelled' ? 0.5 : 1 }}
                      >
                        Cancel
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        disabled={updatingId === r._id || r.status === 'pending'}
                        onClick={() => updateStatus(r._id, "pending")} 
                        style={secondaryBtn}
                      >
                        Reset to Pending
                      </button>
                      {!r.paid && (
                        <button 
                          disabled={updatingId === r._id}
                          onClick={() => togglePaid(r._id)} 
                          style={payBtn}
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Styles
const container = { maxWidth: 1200, margin: '0 auto', padding: '20px' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const refreshBtn = { padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 };
const card = { background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'transform 0.2s' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: 16 };
const listingTitle = { fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#111' };
const detailRow = { fontSize: 14, color: '#555', marginBottom: 8 };
const price = { fontWeight: 800, fontSize: 18, color: '#111' };
const actions = { marginTop: 20, paddingTop: 15, borderTop: '1px solid #f0f0f0' };

const confirmBtn = { flex: 1, padding: '10px', borderRadius: 10, background: '#111', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' };
const cancelBtn = { flex: 1, padding: '10px', borderRadius: 10, background: '#f5f5f5', color: '#c0392b', border: 'none', fontWeight: 600, cursor: 'pointer' };
const secondaryBtn = { flex: 1, padding: '8px', borderRadius: 10, background: '#fff', color: '#666', border: '1px solid #ddd', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const payBtn = { flex: 1, padding: '8px', borderRadius: 10, background: '#e6f4ea', color: '#1e7e34', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' };

const statusBadge = (status) => ({
  padding: '4px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 800,
  background: status === 'confirmed' ? '#e6f4ea' : status === 'pending' ? '#fff4e5' : '#fce8e6',
  color: status === 'confirmed' ? '#1e7e34' : status === 'pending' ? '#b45d00' : '#d93025'
});

const errBox = { padding: 12, background: '#fce8e6', color: '#d93025', borderRadius: 10, marginBottom: 20, fontSize: 14 };
