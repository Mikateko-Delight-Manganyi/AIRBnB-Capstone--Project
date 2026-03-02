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

    // new reservations are created as 'pending' so an admin can confirm them
    const reservation = await Reservation.create({
      accommodation: accommodationId,
      user: req.user.id,
      checkIn: inDate,
      checkOut: outDate,
      totalPrice,
      status: "pending",
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

exports.getMyReservations = async (req, res) => {
  try {
    const items = await Reservation.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("accommodation")
      .populate("user", "name email role");

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Fetch my reservations failed", error: err.message });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "status is required" });
    console.log('updateReservationStatus called for id=', req.params.id, 'by user=', req.user && req.user.id, 'role=', req.user && req.user.role);
    const item = await Reservation.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Reservation not found" });

    item.status = status;
    await item.save();
    const populated = await Reservation.findById(item._id).populate("accommodation").populate("user", "name email role");

    // if changed to confirmed, send notification to user (email if configured, otherwise console)
    if (status === "confirmed") {
      try {
        await sendConfirmationNotification(populated);
        populated.notified = true;
        await populated.save();
      } catch (notifyErr) {
        console.error("Notify failed:", notifyErr.message);
      }
    }

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Update reservation failed", error: err.message });
  }
};

async function sendConfirmationNotification(reservation) {
  // Try to send email if SMTP config present, otherwise log to console
  const userEmail = reservation.user?.email;
  const message = `Your reservation for ${reservation.accommodation?.title || 'listing'} from ${reservation.checkIn.toISOString().slice(0,10)} to ${reservation.checkOut.toISOString().slice(0,10)} has been confirmed.`;

  if (process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: userEmail,
      subject: 'Reservation confirmed',
      text: message,
    });
    console.log('Confirmation email sent to', userEmail);
  } else {
    console.log('Notification (console):', message, '->', userEmail);
  }
}

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

exports.resetToPending = async (req, res) => {
  try {
    // If ids provided, reset only those, otherwise reset all reservations (admin-only)
    const ids = req.body?.ids;
    let result;
    if (Array.isArray(ids) && ids.length > 0) {
      result = await Reservation.updateMany({ _id: { $in: ids } }, { $set: { status: 'pending' } });
    } else {
      result = await Reservation.updateMany({}, { $set: { status: 'pending' } });
    }
    res.json({ message: 'Reservations reset to pending', result });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed', error: err.message });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const item = await Reservation.findById(req.params.id).populate("user", "name email role");
    if (!item) return res.status(404).json({ message: "Reservation not found" });

    // only owner or admin can mark as paid
    if (req.user.id !== item.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to mark payment' });
    }

    item.paid = true;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Mark paid failed', error: err.message });
  }
};
