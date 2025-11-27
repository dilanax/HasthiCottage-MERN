import BedLabel from '../models/BedLabel.js';

// Create a new BedLabel
export const createBedLabel = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if bed label already exists
    const existingBedLabel = await BedLabel.findOne({ name: name.trim() });
    if (existingBedLabel) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Bed label with this name already exists.' 
      });
    }

    const newBedLabel = new BedLabel({ 
      name: name.trim(), 
      description: description?.trim() || '' 
    });
    await newBedLabel.save();

    res.status(201).json({ ok: true, data: newBedLabel });
  } catch (err) {
    console.error('Error creating bed label:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get all active BedLabels
export const getAllBedLabels = async (req, res) => {
  try {
    const bedLabels = await BedLabel.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ ok: true, data: bedLabels });
  } catch (err) {
    console.error('Error fetching bed labels:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get all BedLabels (including inactive) - for admin
export const getAllBedLabelsAdmin = async (req, res) => {
  try {
    const bedLabels = await BedLabel.find().sort({ name: 1 });
    res.status(200).json({ ok: true, data: bedLabels });
  } catch (err) {
    console.error('Error fetching bed labels:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get a single BedLabel by ID
export const getBedLabelById = async (req, res) => {
  try {
    const { id } = req.params;
    const bedLabel = await BedLabel.findById(id);

    if (!bedLabel) {
      return res.status(404).json({ ok: false, error: 'Bed label not found.' });
    }

    res.status(200).json({ ok: true, data: bedLabel });
  } catch (err) {
    console.error('Error fetching bed label:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Update a BedLabel
export const updateBedLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    // Check if another bed label with the same name exists
    if (name) {
      const existingBedLabel = await BedLabel.findOne({ 
        name: name.trim(), 
        _id: { $ne: id } 
      });
      if (existingBedLabel) {
        return res.status(400).json({ 
          ok: false, 
          error: 'Bed label with this name already exists.' 
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedBedLabel = await BedLabel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBedLabel) {
      return res.status(404).json({ ok: false, error: 'Bed label not found.' });
    }

    res.status(200).json({ ok: true, data: updatedBedLabel });
  } catch (err) {
    console.error('Error updating bed label:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Delete a BedLabel (soft delete by setting isActive to false)
export const deleteBedLabel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedBedLabel = await BedLabel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!updatedBedLabel) {
      return res.status(404).json({ ok: false, error: 'Bed label not found.' });
    }

    res.status(200).json({ 
      ok: true, 
      message: 'Bed label deleted successfully.',
      data: updatedBedLabel 
    });
  } catch (err) {
    console.error('Error deleting bed label:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Hard delete a BedLabel (permanent deletion)
export const hardDeleteBedLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBedLabel = await BedLabel.findByIdAndDelete(id);

    if (!deletedBedLabel) {
      return res.status(404).json({ ok: false, error: 'Bed label not found.' });
    }

    res.status(200).json({ 
      ok: true, 
      message: 'Bed label permanently deleted.' 
    });
  } catch (err) {
    console.error('Error hard deleting bed label:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};









