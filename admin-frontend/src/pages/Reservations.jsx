import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Reservations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const OVERRIDE_KEY = "resStatusOverrides";

  const loadOverrides = () => {
    try {
      return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  };

  const saveOverride = (id, status) => {
    const all = loadOverrides();
    all[id] = status;
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(all));
  };

  const clearOverrides = () => {
    localStorage.removeItem(OVERRIDE_KEY);
    load();
  };

  const load = async () => {
    setErr("");
    try {
      const res = await api.get("/reservations");
      console.log("GET /reservations response:", res?.data);
      const fetched = res.data || [];
      const overrides = loadOverrides();
      const merged = fetched.map((it) => {
        if (overrides[it._id]) return { ...it, status: overrides[it._id], _localOverride: true };
        return it;
      });
      setItems(merged);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const resetAllToPending = async () => {
    if (!confirm('Reset all reservations to "pending"? This will affect all records.')) return;
    try {
      setErr('');
      setLoading(true);
      // perform client-side PATCH calls for each reservation (works even if backend lacks bulk endpoint)
      const ids = (items || []).map((it) => it._id).filter(Boolean);
      const results = await Promise.all(
        ids.map((id) =>
          api.patch(`/reservations/${id}`, { status: 'pending' }).then((r) => ({ id, ok: true, data: r.data })).catch((err) => ({ id, ok: false, error: err }))
        )
      );
      console.log('Bulk reset results', results);
      await load();
      alert('Reservations reset to pending');
    } catch (e) {
      console.error('Reset failed', e);
      setErr(e?.response?.data?.message || e?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setErr("");
    setUpdatingId(id);
    // optimistic UI update
    const prev = items;
    setItems((cur) => cur.map((it) => (it._id === id ? { ...it, status } : it)));

    try {
      console.log("Updating reservation", id, status);
      const res = await api.patch(`/reservations/${id}`, { status });
      console.log("Update response", res?.data);
      await load();
    } catch (e) {
      console.error("Update failed", e);
      console.error('Request info', { url: e?.config?.url, method: e?.config?.method, status: e?.response?.status, data: e?.response?.data });

      // If server responded with HTML or 404 (some hosts don't allow PATCH), try POST fallback
      const serverBody = e?.response?.data;
      const isHtml = typeof serverBody === 'string' && serverBody.trim().startsWith('<');
      const is404 = e?.response?.status === 404;

      if (isHtml || is404) {
        try {
          console.log('Attempting POST fallback /status for', id);
          const res2 = await api.post(`/reservations/${id}/status`, { status });
          console.log('Fallback response', res2?.data);
          await load();
          return;
        } catch (e2) {
          console.error('Fallback failed', e2);
          // Persist local-only override so admin sees the change
          try {
            saveOverride(id, status);
            setItems((cur) => cur.map((it) => (it._id === id ? { ...it, status, _localOverride: true } : it)));
            setErr('Server rejected update; change applied locally only. Update server to persist changes.');
            return;
          } catch (saveErr) {
            console.error('Saving local override failed', saveErr);
          }
          // fallthrough to show friendly message below
        }
      }

      // don't show raw HTML responses to users; show friendly message instead
      let serverMsg = e?.response?.data?.message || e?.response?.data || e.message;
      if (typeof serverMsg === 'string' && serverMsg.trim().startsWith('<')) {
        serverMsg = 'Server returned an unexpected HTML error (404). The server may not support PATCH; fallback failed.';
      }
      // revert optimistic update
      setItems(prev);
      setErr(serverMsg || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  function StatusBadge({ status }) {
    const map = {
      pending: { bg: '#f39c12', color: '#fff', text: 'Pending' },
      confirmed: { bg: '#2d8a2d', color: '#fff', text: 'Confirmed' },
      cancelled: { bg: '#c0392b', color: '#fff', text: 'Cancelled' },
    };
    const s = map[status] || { bg: '#7f8c8d', color: '#fff', text: status };
    return (
      <span style={{ background: s.bg, color: s.color, padding: '6px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>
        {s.text}
      </span>
    );
  }

  const btnConfirm = { background: '#2d8a2d', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' };
  const btnCancel = { background: '#c0392b', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Bookings — Manage reservations</h2>
      <div style={{ color: '#555', marginBottom: 12 }}>Change reservation status using the action buttons.</div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button onClick={resetAllToPending} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Reset all to pending</button>
        <button onClick={clearOverrides} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Clear local overrides</button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 13, color: '#666' }}>
          <input type="checkbox" checked={showRaw} onChange={(e) => setShowRaw(e.target.checked)} /> Show raw response
        </label>
      </div>

      {loading && <div>Loading...</div>}
      {err && <div style={errBox}>{err}</div>}

      {!loading && !err && (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Guest</th>
                <th style={th}>Email</th>
                <th style={th}>Listing</th>
                <th style={th}>Check-in</th>
                <th style={th}>Check-out</th>
                <th style={th}>Total</th>
                <th style={th}>Status</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id}>
                  <td style={td}>{r.user?.name || "-"}</td>
                  <td style={td}>{r.user?.email || "-"}</td>
                  <td style={td}>{r.accommodation?.title || "-"}</td>
                  <td style={td}>{r.checkIn ? new Date(r.checkIn).toLocaleDateString() : "-"}</td>
                  <td style={td}>{r.checkOut ? new Date(r.checkOut).toLocaleDateString() : "-"}</td>
                  <td style={td}>R {r.totalPrice}</td>
                  <td style={td}>
                    <StatusBadge status={r.status} />
                  </td>
                  <td style={td}>
                    {r.status === "pending" && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          style={btnConfirm}
                          onClick={() => updateStatus(r._id, "confirmed")}
                          disabled={updatingId === r._id}
                        >
                          {updatingId === r._id ? "Updating..." : "Confirm"}
                        </button>
                        <button
                          style={btnCancel}
                          onClick={() => updateStatus(r._id, "cancelled")}
                          disabled={updatingId === r._id}
                        >
                          {updatingId === r._id ? "Updating..." : "Cancel"}
                        </button>
                      </div>
                    )}
                    {r.status === "confirmed" && <span style={{ color: '#2d8a2d', fontWeight: 700 }}>Confirmed</span>}
                      {r.status === "cancelled" && <span style={{ color: '#c0392b', fontWeight: 700 }}>Cancelled</span>}
                      {r.status !== 'pending' && (
                        <button
                          style={{ marginLeft: 8, padding: '6px 8px', borderRadius: 8, cursor: 'pointer' }}
                          onClick={() => updateStatus(r._id, 'pending')}
                          disabled={updatingId === r._id}
                        >
                          {updatingId === r._id ? 'Updating...' : 'Reset'}
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showRaw && (
            <pre style={{ maxHeight: 240, overflow: 'auto', background: '#f7f7f7', padding: 10, borderRadius: 8, marginTop: 12 }}>
              {JSON.stringify(items, null, 2)}
            </pre>
          )}

          {items.length === 0 && <div style={{ marginTop: 10 }}>No reservations yet.</div>}
        </div>
      )}
    </div>
  );
}

const tableWrap = { border: "1px solid #eee", borderRadius: 14, overflow: "hidden" };
const table = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: 10, borderBottom: "1px solid #eee", background: "#fafafa", fontSize: 13 };
const td = { padding: 10, borderBottom: "1px solid #f2f2f2", fontSize: 13 };
const errBox = { padding: 10, border: "1px solid #ffb3b3", background: "#ffe7e7", borderRadius: 10, marginBottom: 10 };