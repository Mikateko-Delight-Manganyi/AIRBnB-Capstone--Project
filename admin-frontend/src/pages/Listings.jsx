 import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Listings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      // baseURL already has /api
      const res = await api.get("/accommodations");
      setItems(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await api.delete(`/accommodations/${id}`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ marginTop: 0, flex: 1 }}>Listings</h2>
        <Link to="/admin/listings/new">
          <button>+ Create Listing</button>
        </Link>
      </div>

      {loading && <div>Loading...</div>}
      {err && <div style={errBox}>{err}</div>}

      {!loading && !err && (
        <>
          {items.length === 0 ? (
            <div>No listings yet. Click “Create Listing”.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {items.map((a) => (
                <div key={a._id} style={card}>
                  <div style={{ fontWeight: 700 }}>{a.title}</div>
                  <div>{a.location}</div>
                  <div>R {a.pricePerNight} / night</div>

                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <Link to={`/admin/listings/${a._id}/edit`}>
                      <button>Edit</button>
                    </Link>
                    <button onClick={() => handleDelete(a._id)}>Delete</button>
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

const card = { border: "1px solid #eee", borderRadius: 12, padding: 14 };
const errBox = {
  padding: 10,
  border: "1px solid #ffb3b3",
  background: "#ffe7e7",
  borderRadius: 10,
  marginBottom: 10,
};