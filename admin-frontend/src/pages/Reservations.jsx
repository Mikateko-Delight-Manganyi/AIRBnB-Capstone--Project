import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Reservations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // baseURL already has /api
        const res = await api.get("/reservations");
        setItems(res.data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load reservations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Reservations</h2>

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
                  <td style={td}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

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