const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    accommodation: { type: mongoose.Schema.Types.ObjectId, ref: "Accommodation", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "confirmed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
