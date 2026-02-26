const Reservation = require("../models/Reservation");
const Accommodation = require("../models/Accommodation");

exports.createReservation = async (req, res) => {
  try {
    const { accommodationId, checkIn, checkOut } = req.body;

    if (!accommodationId || !checkIn || !checkOut) {
      return res.status(400).json({ message: "accommodationId, checkIn, checkOut are required" });
    }

    const acc = await Accommodation.findById(accommodationId);
    if (!acc) return res.status(404).json({ message: "Accommodation not found" });

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (!(inDate < outDate)) return res.status(400).json({ message: "checkOut must be after checkIn" });

    const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * acc.pricePerNight;

    const reservation = await Reservation.create({
      accommodation: accommodationId,
      user: req.user.id,
      checkIn: inDate,
      checkOut: outDate,
      totalPrice,
      status: "confirmed",
    });

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: "Create reservation failed", error: err.message });
  }
};

exports.getReservations = async (req, res) => {
  try {
    const items = await Reservation.find()
      .sort({ createdAt: -1 })
      .populate("accommodation")
      .populate("user", "name email role");

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Fetch reservations failed", error: err.message });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const item = await Reservation.findById(req.params.id)
      .populate("accommodation")
      .populate("user", "name email role");

    if (!item) return res.status(404).json({ message: "Reservation not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Fetch reservation failed", error: err.message });
  }
};
