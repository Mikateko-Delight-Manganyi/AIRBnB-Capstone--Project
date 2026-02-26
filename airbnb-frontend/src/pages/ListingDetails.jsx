import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80";

function daysBetween(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Number.isFinite(days) ? days : 0;
}

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // reservation form
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const res = await api.get(`/accommodations/${id}`);
        setListing(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load listing");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const images = useMemo(() => {
    const arr = Array.isArray(listing?.images) ? listing.images : [];
    return arr.length ? arr : [FALLBACK_IMG];
  }, [listing]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return daysBetween(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const total = useMemo(() => {
    if (!listing || !nights) return 0;
    return nights * (listing.pricePerNight || 0);
  }, [listing, nights]);

  const reserve = async () => {
    setMsg("");

    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login first to reserve.");
      navigate("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      setMsg("Please select check-in and check-out dates.");
      return;
    }

    if (nights <= 0) {
      setMsg("Check-out must be after check-in.");
      return;
    }

    try {
      setSubmitting(true);

      // IMPORTANT: this matches the reservation object you showed earlier
      const payload = {
        accommodationId: id,
        checkIn,
        checkOut,
      };

      const res = await api.post("/reservations", payload);
      setMsg(res?.data?.message || "Reservation created ✅");

      // optional: reset dates
      setCheckIn("");
      setCheckOut("");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Reservation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={wrap}>
      <Link to="/">← Back</Link>

      {loading && <div>Loading...</div>}
      {err && <div style={errBox}>{err}</div>}

      {!loading && !err && listing && (
        <>
          <div style={topRow}>
            <div>
              <h1 style={{ margin: "8px 0" }}>{listing.title}</h1>
              <div style={{ color: "#555" }}>{listing.location}</div>
              <div style={{ marginTop: 8, fontWeight: 900, fontSize: 18 }}>
                R {listing.pricePerNight}{" "}
                <span style={{ fontWeight: 400 }}>/ night</span>
              </div>
            </div>
          </div>

          <div style={gallery}>
            <img
              src={images[0]}
              alt="main"
              style={hero}
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            />
            <div style={thumbs}>
              {images.slice(0, 4).map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`thumb-${idx}`}
                  style={thumb}
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                />
              ))}
            </div>
          </div>

          <div style={contentGrid}>
            <div style={panel}>
              <h3 style={{ marginTop: 0 }}>About this place</h3>
              <p style={{ lineHeight: 1.7, marginTop: 8 }}>
                {listing.description ||
                  "A standout stay designed for comfort, convenience and a memorable experience."}
              </p>

              {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
                <>
                  <h4>Amenities</h4>
                  <div style={chipRow}>
                    {listing.amenities.map((a) => (
                      <span key={a} style={chip}>
                        {a}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={panel}>
              <h3 style={{ marginTop: 0 }}>Reserve your stay</h3>

              <label style={label}>Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                style={input}
              />

              <label style={label}>Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                style={input}
              />

              <div style={{ marginTop: 10, fontWeight: 800 }}>
                {nights > 0 ? `${nights} night(s) • Total: R ${total}` : "Select dates to see total"}
              </div>

              <button
                onClick={reserve}
                disabled={submitting}
                style={{ ...btn, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Reserving..." : "Reserve"}
              </button>

              {msg && <div style={{ marginTop: 10, color: "#333" }}>{msg}</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const wrap = { maxWidth: 1100, margin: "0 auto", padding: 16 };

const topRow = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
};

const gallery = { marginTop: 14, display: "grid", gap: 12 };
const hero = {
  width: "100%",
  height: 360,
  objectFit: "cover",
  borderRadius: 14,
  display: "block",
  background: "#f3f3f3",
};
const thumbs = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 };
const thumb = {
  width: "100%",
  height: 110,
  objectFit: "cover",
  borderRadius: 12,
  display: "block",
  background: "#f3f3f3",
};

const contentGrid = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr",
  gap: 14,
};

const panel = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 14,
  background: "#fff",
};

const chipRow = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 };
const chip = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #eee",
  background: "#fafafa",
};

const label = { display: "block", marginTop: 10, fontSize: 13, fontWeight: 700 };
const input = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
  marginTop: 6,
};

const btn = {
  width: "100%",
  marginTop: 12,
  background: "#111",
  color: "#fff",
  border: "none",
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 800,
};

const errBox = {
  padding: 10,
  border: "1px solid #ffb3b3",
  background: "#ffe7e7",
  borderRadius: 10,
  marginTop: 10,
};