import Artisanal from "../models/artisanal.js";

/**
 * Generate next sequential artisanalId: ART0001, ART0002, ...
 */
async function generateNextArtisanalId() {
  const last = await Artisanal.find().sort({ createdAt: -1 }).limit(1);
  if (!last.length) return "ART0001";
  const lastNumber = (last[0].artisanalId || "ART0000").replace("ART", "");
  const newInt = (parseInt(lastNumber, 10) || 0) + 1;
  return "ART" + newInt.toString().padStart(4, "0");
}

// Create
export async function createArtisanal(req, res) {
  try {
    const artisanalId = await generateNextArtisanalId();
    const { name, price, description, images, category } = req.body;

    const doc = new Artisanal({
      artisanalId,
      name,
      price,
      description,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      category,
    });

    await doc.save();
    res.json({ message: "Artisanal item created successfully", artisanal: doc });
  } catch (err) {
    console.error("createArtisanal error:", err);
    res.status(500).json({ message: "Artisanal item not created" });
  }
}

// Read: one
export async function getArtisanalById(req, res) {
  try {
    const artisanalId = req.params.artisanalId;
    const artisanal = await Artisanal.findOne({ artisanalId });
    if (!artisanal) {
      res.status(404).json({ message: "Artisanal item not found" });
      return;
    }
    res.json({ artisanal });
  } catch (err) {
    console.error("getArtisanalById error:", err);
    res.status(500).json({ message: "Failed to fetch artisanal item" });
  }
}

// Read: all
export async function getAllArtisanal(req, res) {
  try {
    const artisanal = await Artisanal.find().sort({ createdAt: -1 });
    res.json({ artisanal });
  } catch (err) {
    console.error("getAllArtisanal error:", err);
    res.status(500).json({ message: "Failed to fetch artisanal list" });
  }
}

// Update
export async function updateArtisanal(req, res) {
  try {
    const { artisanalId } = req.params;
    const payload = { ...req.body };

    if (payload.images && !Array.isArray(payload.images)) {
      payload.images = [payload.images];
    }

    const updated = await Artisanal.findOneAndUpdate(
      { artisanalId },
      payload,
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ message: "Artisanal item not found" });
      return;
    }
    res.json({ message: "Artisanal item updated successfully", artisanal: updated });
  } catch (err) {
    console.error("updateArtisanal error:", err);
    res.status(500).json({ message: "Artisanal item not updated" });
  }
}

// Delete
export async function deleteArtisanal(req, res) {
  try {
    const { artisanalId } = req.params;
    const deleted = await Artisanal.findOneAndDelete({ artisanalId });
    if (!deleted) {
      res.status(404).json({ message: "Artisanal item not found" });
      return;
    }
    res.json({ message: "Artisanal item deleted successfully" });
  } catch (err) {
    console.error("deleteArtisanal error:", err);
    res.status(500).json({ message: "Artisanal item not deleted" });
  }
}

/**
 * Lightweight list for public UIs (only necessary fields).
 */
export async function listPublicArtisanal(req, res) {
  try {
    const items = await Artisanal
      .find({}, "artisanalId name price images category createdAt")
      .sort({ createdAt: -1 });
    res.json({ artisanal: items });
  } catch (err) {
    console.error("listPublicArtisanal error:", err);
    res.status(500).json({ message: "Failed to fetch artisanal items" });
  }
}
