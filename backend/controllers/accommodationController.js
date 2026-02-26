const Accommodation = require("../models/Accommodation");

exports.createAccommodation = async (req, res) => {
  try {
    const { title, location, pricePerNight, images, description, amenities } = req.body;

    if (!title || !location || pricePerNight === undefined) {
      return res.status(400).json({ message: "title, location, pricePerNight are required" });
    }

    const accommodation = await Accommodation.create({
      title,
      location,
      pricePerNight,
      images: Array.isArray(images) ? images : [],
      description: description || "",
      amenities: Array.isArray(amenities) ? amenities : [],
      host: req.user.id,
    });

    res.status(201).json(accommodation);
  } catch (err) {
    res.status(500).json({ message: "Create accommodation failed", error: err.message });
  }
};

exports.getAccommodations = async (req, res) => {
  try {
    const items = await Accommodation.find().sort({ createdAt: -1 }).populate("host", "name email role");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Fetch accommodations failed", error: err.message });
  }
};

exports.getAccommodationById = async (req, res) => {
  try {
    const item = await Accommodation.findById(req.params.id).populate("host", "name email role");
    if (!item) return res.status(404).json({ message: "Accommodation not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Fetch accommodation failed", error: err.message });
  }
};

exports.updateAccommodation = async (req, res) => {
  try {
    const updated = await Accommodation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Accommodation not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update accommodation failed", error: err.message });
  }
};

exports.deleteAccommodation = async (req, res) => {
  try {
    const deleted = await Accommodation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Accommodation not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete accommodation failed", error: err.message });
  }
};
