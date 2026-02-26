import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [amenities, setAmenities] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Load listing details
  useEffect(() => {
    const loadListing = async () => {
      try {
        const res = await api.get(`/accommodations/${id}`);
        const data = res.data;

        setTitle(data.title || "");
        setLocation(data.location || "");
        setPricePerNight(data.pricePerNight || "");
        setImage1(data.images?.[0] || "");
        setImage2(data.images?.[1] || "");
        setAmenities((data.amenities || []).join(", "));
        setDescription(data.description || "");
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
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

      await api.put(`/accommodations/${id}`, payload);

      alert("Listing updated successfully!");
      navigate("/admin/listings");
    } catch (e) {
      setErr(e?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading listing...</div>;

  return (
    <div>
      <h2>Edit Listing</h2>

      {err && (
        <div style={errBox}>
          {err}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Title *
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Location *
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </label>

        <label>
          Price Per Night (R) *
          <input
            type="number"
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            required
          />
        </label>

        <label>
          Image URL 1
          <input
            value={image1}
            onChange={(e) => setImage1(e.target.value)}
          />
        </label>

        <label>
          Image URL 2
          <input
            value={image2}
            onChange={(e) => setImage2(e.target.value)}
          />
        </label>

        <label>
          Amenities (comma separated)
          <input
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update Listing"}
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
  marginBottom: 12,
};