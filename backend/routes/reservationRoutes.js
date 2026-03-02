const router = require("express").Router();
const {
  createReservation,
  getReservations,
  getReservationById,
  getMyReservations,
  updateReservationStatus,
} = require("../controllers/reservationController");

const { auth, adminOnly } = require("../middleware/auth");

// User creates reservation
router.post("/", auth, createReservation);

// User views their own reservations
router.get("/my", auth, getMyReservations);

// Admin views all reservations
router.get("/", auth, adminOnly, getReservations);
router.get("/:id", auth, adminOnly, getReservationById);

// Admin updates reservation status
router.patch("/:id", auth, adminOnly, updateReservationStatus);

// Some hosting providers block PATCH; provide a POST fallback to update status
router.post('/:id/status', auth, adminOnly, async (req, res, next) => {
  try {
    const controller = require('../controllers/reservationController');
    return controller.updateReservationStatus(req, res, next);
  } catch (err) {
    next(err);
  }
});

// User marks reservation as paid (owner or admin)
router.patch("/:id/pay", auth, async (req, res, next) => {
  try {
    const controller = require("../controllers/reservationController");
    return controller.markPaid(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Admin utility: reset reservation statuses to 'pending' (admin only)
router.patch('/reset-pending', auth, adminOnly, async (req, res, next) => {
  try {
    const controller = require('../controllers/reservationController');
    return controller.resetToPending(req, res, next);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
