const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const accommodationRoutes = require("./routes/accommodationRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/users", userRoutes);
app.use("/api/accommodations", accommodationRoutes);
app.use("/api/reservations", reservationRoutes);

console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log("Server running on port " + port));
  })
  .catch((err) => console.error("Mongo error:", err));
