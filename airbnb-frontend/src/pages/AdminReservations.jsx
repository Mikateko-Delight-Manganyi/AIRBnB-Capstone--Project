import { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthProvider";

export default function AdminReservations() {
  const { user } = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");

  const load = () => {
    api
      .get("/reservations")
      .then((r) => setList(r.data))
      .catch((e) => setErr(e.response?.data?.message || e.message));
  };

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    load();
  }, [user]);

  const updateStatus = (id, status) => {
    api
      .patch(`/reservations/${id}`, { status })
      .then(load)
      .catch((e) => setErr(e.response?.data?.message || e.message));
  };

  if (!user || user.role !== "admin") return <div>Access denied</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>All bookings (admin)</h2>
      {err && <div style={{ color: "red" }}>{err}</div>}
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Accommodation</th>
            <th>Dates</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r._id}>
              <td>{r.user?.email || r.user}</td>
              <td>{r.accommodation?.title || r.accommodation}</td>
              <td>
                {new Date(r.checkIn).toLocaleDateString()} – {" "}
                {new Date(r.checkOut).toLocaleDateString()}
              </td>
              <td>{r.status}</td>
              <td>
                {r.status !== "confirmed" && (
                  <button onClick={() => updateStatus(r._id, "confirmed")}>Accept</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
