const router = require("express").Router();
const {
  createReservation,
  getReservations,
  getReservationById,
} = require("../controllers/reservationController");

const { auth, adminOnly } = require("../middleware/auth");

// User creates reservation
router.post("/", auth, createReservation);

// Admin views all reservations
router.get("/", auth, adminOnly, getReservations);
router.get("/:id", auth, adminOnly, getReservationById);

module.exports = router;
