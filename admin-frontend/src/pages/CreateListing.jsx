import { useState } from "react";
import api from "../api/axios";

export default function CreateListing() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [amenities, setAmenities] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErr("No token found. Please login again.");
        setLoading(false);
        return;
      }

      const payload = {
        title,
        location,
        pricePerNight: Number(pricePerNight),
        images: [image1, image2].filter(Boolean),
        amenities: amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        description,
      };

      await api.post("/accommodations", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Listing created successfully!");
      setTitle("");
      setLocation("");
      setPricePerNight("");
      setImage1("");
      setImage2("");
      setAmenities("");
      setDescription("");
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Listing</h2>

      {err && (
        <div style={{ padding: 10, border: "1px solid #ffb3b3", background: "#ffe7e7", marginBottom: 10 }}>
          {err}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div>
          <label>Title *</label><br />
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label>Location *</label><br />
          <input value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>

        <div>
          <label>Price per night (R) *</label><br />
          <input
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            type="number"
            required
          />
        </div>

        <div>
          <label>Image URL 1</label><br />
          <input value={image1} onChange={(e) => setImage1(e.target.value)} />
        </div>

        <div>
          <label>Image URL 2</label><br />
          <input value={image2} onChange={(e) => setImage2(e.target.value)} />
        </div>

        <div>
          <label>Amenities (comma separated)</label><br />
          <input value={amenities} onChange={(e) => setAmenities(e.target.value)} />
        </div>

        <div>
          <label>Description</label><br />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}

const errBox = {
  padding: 10,
  border: "1px solid #ffb3b3",
  background: "#ffe7e7",
  borderRadius: 10,
  marginBottom: 10,
};