import Room from "../models/Room.js";
import Reservation from "../models/Reservation.js";
import Counter from "../models/roomCounter.js";
import { uploadToAzure, deleteFromAzure } from "../lib/azureUpload.js";

// GET all available rooms with availability count (for users)
export const getAvailableRoomPackages = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    const query = { active: true, availableCount: { $gt: 0 } };

    // Filter rooms that have availability
    const rooms = await Room.find(query).lean();
    
    // If dates are provided, we could add additional filtering logic here
    // For now, we rely on availableCount field for availability
    
    res.status(200).json({ ok: true, data: rooms });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};

// GET all rooms (for admin - includes unavailable rooms)
export const getAllRooms = async (req, res) => {
  try {
    // Get all rooms regardless of availability status
    const rooms = await Room.find({}).lean();
    
    res.status(200).json({ ok: true, data: rooms });
  } catch (err) {
    console.error("Error fetching all rooms:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};

// GET single room
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("getRoomById param:", id);
    const room = await Room.findOne({ room_id: id }).lean();
    if (!room) return res.status(404).json({ ok: false, error: "Room not found" });
    res.status(200).json({ ok: true, data: room });
  } catch (err) {
    console.error("Error fetching room:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};

export const createRoom = async (req, res) => {
  try {
    const {
      roomType,
      bedLabel,
      sizeSqm,
      capacityAdults = 2,
      capacityChildren = 0,
      active = true,
      availableCount = 1,
    } = req.body;

    // Validation
    if (!roomType || !bedLabel || !sizeSqm) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // Parse JSON fields
    let features = {};
    let perks = {};
    if (req.body.features) {
      try { features = JSON.parse(req.body.features); } catch (err) { console.error("Parse features failed", err); }
    }
    if (req.body.perks) {
      try { perks = JSON.parse(req.body.perks); } catch (err) { console.error("Parse perks failed", err); }
    }

    // Auto-increment room ID
    const counter = await Counter.findByIdAndUpdate(
      "roomId",
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    const roomId = `${roomType.replace(/-/g, "")}_${counter.sequence_value}`;

    // Handle image uploads
    let imageGallery = [];
    if (req.files?.length) {
      const uploadedUrls = await Promise.all(
        req.files.map(async (file, index) => {
          try {
            const url = await uploadToAzure(file, roomId);
            return { url, position: index + 1 };
          } catch (err) {
            console.error("Azure upload error:", err);
            return null;
          }
        })
      );
      imageGallery = uploadedUrls.filter(Boolean);
    }

    // Create Room
    const room = new Room({
      room_id: roomId,
      roomType,
      bedLabel,
      sizeSqm,
      capacityAdults,
      capacityChildren,
      features,
      perks,
      imageGallery,
      active,
      availableCount,
    });

    await room.save();
    res.status(201).json({ ok: true, data: room });

  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};

// controller/roomController.js

export const updateRoom = async (req, res) => {
  try {
    // Route is /api/room-packages/:id (business key = room_id)
    const { id: roomId } = req.params;

    const {
      roomType,
      bedLabel,
      sizeSqm,
      capacityAdults = 2,
      capacityChildren = 0,
      active,
      availableCount = 1,
      removeImages = "[]", // JSON string from frontend (array of URLs)
    } = req.body;

    // Parse JSON fields
    let features = {};
    let perks = {};
    let removeImagesArr = [];
    if (req.body.features) { try { features = JSON.parse(req.body.features); } catch {} }
    if (req.body.perks) { try { perks = JSON.parse(req.body.perks); } catch {} }
    if (removeImages) { try { removeImagesArr = JSON.parse(removeImages); } catch {} }

    // Fetch existing room by business key (room_id), not Mongo _id
    const room = await Room.findOne({ room_id: roomId });
    if (!room) return res.status(404).json({ ok: false, error: "Room not found" });

    // Remove selected images (and delete from Azure)
    if (Array.isArray(removeImagesArr) && removeImagesArr.length) {
      const toDelete = new Set(removeImagesArr);
      const keep = [];
      for (const img of room.imageGallery || []) {
        if (img?.url && toDelete.has(img.url)) {
          try {
            await deleteFromAzure(img.url);
          } catch (err) {
            console.warn(`Failed to delete image from Azure: ${img.url}`, err?.message || err);
          }
        } else {
          keep.push(img);
        }
      }
      room.imageGallery = keep;
    }

    // Upload new files
    if (req.files?.length) {
      const starting = room.imageGallery?.length || 0;
      const uploaded = await Promise.all(
        req.files.map(async (file, index) => {
          try {
            const url = await uploadToAzure(file, room.room_id);
            return { url, position: starting + index + 1 };
          } catch (err) {
            console.error("Azure upload error:", err);
            return null;
          }
        })
      );
      room.imageGallery.push(...uploaded.filter(Boolean));
    }

    // Update scalar fields (fallback to existing)
    room.roomType = roomType || room.roomType;
    room.bedLabel = bedLabel || room.bedLabel;
    room.sizeSqm = sizeSqm || room.sizeSqm;
    room.capacityAdults = Number.isFinite(+capacityAdults) ? +capacityAdults : room.capacityAdults;
    room.capacityChildren = Number.isFinite(+capacityChildren) ? +capacityChildren : room.capacityChildren;
    room.features = Object.keys(features).length ? features : room.features;
    room.perks = Object.keys(perks).length ? perks : room.perks;
    // Handle active field - convert string to boolean if needed
    if (active !== undefined) {
      room.active = active === 'true' || active === true;
    }
    room.availableCount = Number.isFinite(+availableCount) ? +availableCount : room.availableCount;

    await room.save();
    res.status(200).json({ ok: true, data: room });

  } catch (err) {
    console.error("Error updating room:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};


// DELETE room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findOne({ room_id: id });
    if (!room) {
      return res.status(404).json({ ok: false, error: "Room not found" });
    }

    // Delete Azure images safely (imageGallery)
    if (Array.isArray(room.imageGallery) && room.imageGallery.length > 0) {
       for (const img of room.imageGallery) {
        const url = img?.url;
        if (url) {
          try {
            await deleteFromAzure(url);
          } catch (err) {
            console.warn(`Failed to delete image from Azure: ${url}`, err.message);
          }
        }
      }
    }

    await Room.deleteOne({ room_id: id });

    return res.status(200).json({ ok: true, message: "Room deleted successfully" });
  } catch (err) {
    console.error("Error deleting room:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
};


// GET only room IDs (for dropdowns)
export const getRoomIds = async (req, res) => {
  try {
    // Find only active rooms, select only room_id field
    const rooms = await Room.find({ active: true }).select("room_id -_id").lean();

    // Convert to simple array of IDs
    const ids = rooms.map(r => r.room_id);

    res.status(200).json({ ok: true, data: ids });
  } catch (err) {
    console.error("Error fetching room IDs:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};



// SEED sample room
export const seedSampleRoom = async (req, res) => {
  try {
    const exists = await Room.findOne({ roomType: "double-room-with-balcony" });
    if (exists) return res.status(409).json({ ok: false, error: "Sample already exists" });

    const counter = await Counter.findByIdAndUpdate(
      { _id: "roomId" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    const roomId = `doubleroomwithbalcony_${counter.sequence_value}`;

    const room = new Room({
      room_id: roomId,
      roomType: "double-room-with-balcony",
      bedLabel: "1 extra-large double bed",
      sizeSqm: 18,
      features: { freeWifi: true, patio: true, bidet: true, balcony: true },
      perks: { gardenView: true, innerCourtyardView: true, privateBathroom: true },
      imageUrl: [],
      active: true,
    });

    await room.save();
    res.status(201).json({ ok: true, data: room });
  } catch (err) {
    console.error("Error seeding room:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};
