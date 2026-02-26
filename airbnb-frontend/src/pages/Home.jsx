import { useEffect, useState } from "react";
import api from "../api/api";
import ListingCard from "../components/ListingCard";

export default function Home() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get("/accommodations");
      setItems(res.data || []);
      setFiltered(res.data || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let result = [...items];

    // Search by location
    if (search) {
      result = result.filter((l) =>
        l.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Price filter
    if (minPrice) {
      result = result.filter((l) => l.pricePerNight >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((l) => l.pricePerNight <= Number(maxPrice));
    }

    // Sorting
    if (sort === "low") {
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    }
    if (sort === "high") {
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    }

    setFiltered(result);
  }, [search, minPrice, maxPrice, sort, items]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <h1>Explore Stays</h1>

      {/* FILTER BAR */}
      <div style={filterBar}>
        <input
          placeholder="Search by location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          placeholder="Min Price"
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          placeholder="Max Price"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>
      </div>

      {loading && <div>Loading...</div>}

      <div style={grid}>
        {filtered.map((l) => (
          <ListingCard key={l._id} listing={l} />
        ))}
      </div>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 20,
  marginTop: 20,
};

const filterBar = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};