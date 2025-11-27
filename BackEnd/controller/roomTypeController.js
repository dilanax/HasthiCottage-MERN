import RoomType from '../models/RoomType.js';

// Create a new RoomType
export const createRoomType = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if room type already exists
    const existingRoomType = await RoomType.findOne({ name: name.trim() });
    if (existingRoomType) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Room type with this name already exists.' 
      });
    }

    const newRoomType = new RoomType({ 
      name: name.trim(), 
      description: description?.trim() || '' 
    });
    await newRoomType.save();

    res.status(201).json({ ok: true, data: newRoomType });
  } catch (err) {
    console.error('Error creating room type:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get all active RoomTypes
export const getAllRoomTypes = async (req, res) => {
  try {
    const roomTypes = await RoomType.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ ok: true, data: roomTypes });
  } catch (err) {
    console.error('Error fetching room types:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get all RoomTypes (including inactive) - for admin
export const getAllRoomTypesAdmin = async (req, res) => {
  try {
    const roomTypes = await RoomType.find().sort({ name: 1 });
    res.status(200).json({ ok: true, data: roomTypes });
  } catch (err) {
    console.error('Error fetching room types:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get a single RoomType by ID
export const getRoomTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const roomType = await RoomType.findById(id);

    if (!roomType) {
      return res.status(404).json({ ok: false, error: 'Room type not found.' });
    }

    res.status(200).json({ ok: true, data: roomType });
  } catch (err) {
    console.error('Error fetching room type:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Update a RoomType
export const updateRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    // Check if another room type with the same name exists
    if (name) {
      const existingRoomType = await RoomType.findOne({ 
        name: name.trim(), 
        _id: { $ne: id } 
      });
      if (existingRoomType) {
        return res.status(400).json({ 
          ok: false, 
          error: 'Room type with this name already exists.' 
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedRoomType = await RoomType.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRoomType) {
      return res.status(404).json({ ok: false, error: 'Room type not found.' });
    }

    res.status(200).json({ ok: true, data: updatedRoomType });
  } catch (err) {
    console.error('Error updating room type:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Delete a RoomType (soft delete by setting isActive to false)
export const deleteRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedRoomType = await RoomType.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!updatedRoomType) {
      return res.status(404).json({ ok: false, error: 'Room type not found.' });
    }

    res.status(200).json({ 
      ok: true, 
      message: 'Room type deleted successfully.',
      data: updatedRoomType 
    });
  } catch (err) {
    console.error('Error deleting room type:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Hard delete a RoomType (permanent deletion)
export const hardDeleteRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoomType = await RoomType.findByIdAndDelete(id);

    if (!deletedRoomType) {
      return res.status(404).json({ ok: false, error: 'Room type not found.' });
    }

    res.status(200).json({ 
      ok: true, 
      message: 'Room type permanently deleted.' 
    });
  } catch (err) {
    console.error('Error hard deleting room type:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

