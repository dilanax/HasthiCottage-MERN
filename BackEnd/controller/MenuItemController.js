// Controllers/MenuItemController.js
import MenuItem from "../models/MenuItemModel.js";
import { uploadMenuImage, deleteFromAzure } from "../lib/azureUpload.js";

// Currency conversion utility
const USD_TO_LKR_RATE = 330; // 1 USD = 330 LKR
const convertUSDToLKR = (usdAmount) => Number(usdAmount) * USD_TO_LKR_RATE;

// Create
export const createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      tags,
      spicyLevel,
      available, // JSON string or object
    } = req.body;

    // Upload image to Azure if provided
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadMenuImage(req.file);
    }

    const payload = {
      name,
      description,
      category,
      price: convertUSDToLKR(price), // Convert USD to LKR for storage
      image: imageUrl,
      spicyLevel: spicyLevel !== undefined ? Number(spicyLevel) : undefined,
    };

    // Optional: tags as array (accept comma-separated or array)
    if (tags) {
      payload.tags = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(",")
            .map(t => t.trim())
            .filter(Boolean);
    }

    // Optional: availability as object or JSON
    if (available) {
      try {
        payload.available =
          typeof available === "string" ? JSON.parse(available) : available;
      } catch {
        // fallback: ignore invalid JSON
      }
    }

    const item = new MenuItem(payload);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error("Error creating menu item:", err);
    res.status(500).json({ message: err.message });
  }
};

// Read All (with filters & search)
export const getMenuItems = async (req, res) => {
  try {
    const { category, q, archived, tag } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (archived === "true") filter.isArchived = true;
    if (archived === "false") filter.isArchived = false;
    if (tag) filter.tags = { $in: [tag] };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read One
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the existing menu item to check for old image
    const existingMenuItem = await MenuItem.findById(id);
    if (!existingMenuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const {
      name,
      description,
      category,
      price,
      tags,
      spicyLevel,
      available,
      isArchived,
    } = req.body;

    const updateData = {
      name,
      description,
      category,
      price: price !== undefined ? convertUSDToLKR(price) : undefined, // Convert USD to LKR for storage
      spicyLevel: spicyLevel !== undefined ? Number(spicyLevel) : undefined,
      isArchived:
        isArchived !== undefined
          ? isArchived === "true" || isArchived === true
          : undefined,
    };

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(",")
            .map(t => t.trim())
            .filter(Boolean);
    }

    if (available !== undefined) {
      try {
        updateData.available =
          typeof available === "string" ? JSON.parse(available) : available;
      } catch {
        // ignore invalid JSON
      }
    }

    // If there's a new image, upload it and delete the old one
    if (req.file) {
      // Upload new image
      updateData.image = await uploadMenuImage(req.file, id);
      
      // Delete old image from Azure if it exists
      if (existingMenuItem.image) {
        await deleteFromAzure(existingMenuItem.image);
      }
    }

    // Remove undefined keys to avoid overwriting
    Object.keys(updateData).forEach(
      k => updateData[k] === undefined && delete updateData[k]
    );

    const updated = await MenuItem.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete (hard delete)
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the menu item to check for image before deleting
    const menuItemToDelete = await MenuItem.findById(id);
    if (!menuItemToDelete) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    // Delete image from Azure if it exists
    if (menuItemToDelete.image) {
      await deleteFromAzure(menuItemToDelete.image);
    }
    
    await MenuItem.findByIdAndDelete(id);
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
