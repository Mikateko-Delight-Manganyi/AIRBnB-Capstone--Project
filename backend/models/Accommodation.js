const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    images: [{ type: String }], // URLs or filenames
    description: { type: String, default: "" },
    amenities: [{ type: String }],
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accommodation", accommodationSchema);
