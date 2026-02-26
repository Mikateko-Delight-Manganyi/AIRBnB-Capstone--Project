const router = require("express").Router();
const {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
} = require("../controllers/accommodationController");

const { auth, adminOnly } = require("../middleware/auth");

// Public
router.get("/", getAccommodations);
router.get("/:id", getAccommodationById);

// Protected (admin)
router.post("/", auth, adminOnly, createAccommodation);
router.put("/:id", auth, adminOnly, updateAccommodation);
router.delete("/:id", auth, adminOnly, deleteAccommodation);

module.exports = router;
