import { Link } from "react-router-dom";
import { useState } from "react";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80";

export default function ListingCard({ listing }) {
  const [imgError, setImgError] = useState(false);

  const img =
    !imgError && listing?.images?.length ? listing.images[0] : FALLBACK_IMG;

  return (
    <Link to={`/listing/${listing._id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={card}>
        <img
          src={img}
          alt={listing?.title || "Listing"}
          style={image}
          onError={() => setImgError(true)}
        />

        <div style={{ padding: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{listing.title}</div>
          <div style={{ color: "#555", marginTop: 4 }}>{listing.location}</div>
          <div style={{ marginTop: 10, fontWeight: 700 }}>
            R {listing.pricePerNight} <span style={{ fontWeight: 400 }}>/ night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

const card = {
  border: "1px solid #eee",
  borderRadius: 14,
  overflow: "hidden",
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const image = {
  width: "100%",
  height: 190,
  objectFit: "cover",
  display: "block",
  background: "#f3f3f3",
};