import OffersAndPromotions from "../models/offersAndPromotionsModel.js";

// Get all promotions
// Get all promotions
export async function getPromotions(req, res)  {
    let promotions;
    try {
        promotions = await OffersAndPromotions.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching promotions" });
    }

    if (!promotions || promotions.length === 0) {
        return res.status(404).json({ message: "No Promotions Found" });
    }

    return res.status(200).json({ promotions });
}; 

// Get promotion by ID
export async function getPromotionById(req, res) {
    const { id } = req.params;

    let promotion;
    try {
        promotion = await OffersAndPromotions.findOne({ promotion_id: id });
    } catch (err) {
        console.error("Fetch Error:", err);
        return res.status(500).json({ message: "Error fetching promotion", error: err.message });
    }

    if (!promotion) {
        return res.status(404).json({ message: "Promotion not found" });
    }

    return res.status(200).json({ promotion });
};

// Generate next promotion ID
export async function getNextPromotionId(req, res) {
    try {
        // Find the highest existing promotion ID
        const lastPromotion = await OffersAndPromotions.findOne({}, {}, { sort: { promotion_id: -1 } });
        
        let nextId;
        if (!lastPromotion) {
            // If no promotions exist, start with P001
            nextId = "P001";
        } else {
            // Extract the number from the last promotion ID and increment
            const lastId = lastPromotion.promotion_id;
            const match = lastId.match(/^P(\d+)$/);
            
            if (match) {
                const lastNumber = parseInt(match[1], 10);
                const nextNumber = lastNumber + 1;
                nextId = `P${nextNumber.toString().padStart(3, '0')}`;
            } else {
                // If format is unexpected, start from P001
                nextId = "P001";
            }
        }

        return res.status(200).json({ 
            message: "Next promotion ID generated successfully", 
            data: { promotion_id: nextId } 
        });
    } catch (err) {
        console.error("Generate ID Error:", err);
        return res.status(500).json({ message: "Error generating promotion ID", error: err.message });
    }
}

// Add a new promotion
export async function addPromotions(req, res) {
    const { title, description, start_date, end_date, discount_type, discount_value, status, promotion_category } = req.body;

    if (!title || !description || !start_date || !end_date || !discount_type || !discount_value) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    try {
        // Generate the next promotion ID
        const lastPromotion = await OffersAndPromotions.findOne({}, {}, { sort: { promotion_id: -1 } });
        
        let promotion_id;
        if (!lastPromotion) {
            promotion_id = "P001";
        } else {
            const lastId = lastPromotion.promotion_id;
            const match = lastId.match(/^P(\d+)$/);
            
            if (match) {
                const lastNumber = parseInt(match[1], 10);
                const nextNumber = lastNumber + 1;
                promotion_id = `P${nextNumber.toString().padStart(3, '0')}`;
            } else {
                promotion_id = "P001";
            }
        }

        const newPromotion = new OffersAndPromotions({
            promotion_id,
            title,
            description,
            start_date,
            end_date,
            discount_type,
            discount_value,
            status: status || 'active',
            promotion_category: promotion_category || 'Food Promotions'
        });

        await newPromotion.save();
        return res.status(201).json({ message: "Promotion added successfully", promotion: newPromotion });
    } catch (err) {
        console.error("Save Error:", err);
        return res.status(500).json({ message: "Error adding promotion", error: err.message });
    }
};

// Update a promotion
export async function updatePromotion(req, res) {
    const { id } = req.params; 
    const { title, description, start_date, end_date, discount_type, discount_value, status, promotion_category } = req.body;

    let updatedPromotion;
    try {
        updatedPromotion = await OffersAndPromotions.findOneAndUpdate(
            { promotion_id: id },
            { title, description, start_date, end_date, discount_type, discount_value, status, promotion_category, updated_at: Date.now() },
            { new: true, runValidators: true }
        );
    } catch (err) {
        console.error("Update Error:", err);
        return res.status(500).json({ message: "Error updating promotion", error: err.message });
    }

    if (!updatedPromotion) {
        return res.status(404).json({ message: "Promotion not found" });
    }

    return res.status(200).json({ message: "Promotion updated successfully", promotion: updatedPromotion });
};

// Delete a promotion
export async function deletePromotion(req, res) {
    const { id } = req.params; 

    let deletedPromotion;
    try {
        deletedPromotion = await OffersAndPromotions.findOneAndDelete({ promotion_id: id });
    } catch (err) {
        console.error("Delete Error:", err);
        return res.status(500).json({ message: "Error deleting promotion", error: err.message });
    }

    if (!deletedPromotion) {
        return res.status(404).json({ message: "Promotion not found" });
    }

    return res.status(200).json({ message: "Promotion deleted successfully", promotion: deletedPromotion });
};

// exports.getPromotions = getPromotions;
// exports.getPromotionById = getPromotionById;
// exports.addPromotions = addPromotions;
// exports.updatePromotion = updatePromotion;
// exports.deletePromotion = deletePromotion;

export default {
  getPromotions,
  getPromotionById,
  getNextPromotionId,
  addPromotions,
  updatePromotion,
  deletePromotion,
};



   