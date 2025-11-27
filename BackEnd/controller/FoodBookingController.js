import FoodBooking from "../models/FoodBooking.js";
import MenuItem from "../models/MenuItemModel.js";
import User from "../models/user.js";

// Create a new food booking
export const createFoodBooking = async (req, res) => {
  try {
    const {
      foodItemId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      quantity = 1,
      specialRequests = ""
    } = req.body;

    // Debug logging
    console.log('=== FOOD BOOKING REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Extracted fields:', {
      foodItemId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      quantity,
      specialRequests
    });

    // Validate required fields
    if (!foodItemId || !customerName || !customerEmail || !customerPhone) {
      console.log('Validation failed - missing required fields');
      console.log('foodItemId:', foodItemId);
      console.log('customerName:', customerName);
      console.log('customerEmail:', customerEmail);
      console.log('customerPhone:', customerPhone);
      return res.status(400).json({ 
        message: "Missing required fields: foodItemId, customerName, customerEmail, customerPhone" 
      });
    }

    // Get food item details
    const foodItem = await MenuItem.findById(foodItemId);
    if (!foodItem) {
      console.log('Food item not found for ID:', foodItemId);
      return res.status(404).json({ message: "Food item not found" });
    }

    console.log('Food item found:', {
      id: foodItem._id,
      name: foodItem.name,
      price: foodItem.price,
      category: foodItem.category
    });

    // Calculate total amount
    const totalAmount = foodItem.price * quantity;
    console.log('Calculated total amount:', totalAmount);

    // Create booking
    const bookingData = {
      foodItem: foodItemId,
      itemName: foodItem.name,
      itemPrice: foodItem.price,
      itemImage: foodItem.image,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      quantity,
      totalAmount,
      specialRequests
    };

    console.log('Creating booking with data:', bookingData);

    const booking = new FoodBooking(bookingData);
    await booking.save();

    console.log('Booking saved successfully:', {
      id: booking._id,
      itemName: booking.itemName,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      quantity: booking.quantity,
      totalAmount: booking.totalAmount,
      status: booking.status
    });

    // Populate the booking with food item details
    await booking.populate('foodItem');

    res.status(201).json({
      message: "Food booking created successfully",
      booking: {
        id: booking._id,
        itemName: booking.itemName,
        customerName: booking.customerName,
        quantity: booking.quantity,
        totalAmount: booking.totalAmount,
        status: booking.status,
        bookingDate: booking.bookingDate
      }
    });

  } catch (err) {
    console.error("Error creating food booking:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all food bookings (admin only)
export const getAllFoodBookings = async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 10, 
      sortBy = 'bookingDate', 
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;
    
    console.log('=== GET ALL FOOD BOOKINGS REQUEST ===');
    console.log('Query params:', req.query);
    
    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Add date filters
    if (startDate && endDate) {
      // Validate dates before using them
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check if dates are valid
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filter.bookingDate = {
          $gte: start,
          $lte: end
        };
        console.log('Date filter applied:', filter.bookingDate);
      } else {
        console.log('Invalid dates provided, skipping date filter');
      }
    }

    console.log('Final filter:', filter);

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get bookings with pagination
    const bookings = await FoodBooking.find(filter)
      .populate('foodItem')
      .populate('customerId', 'name email phone')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoodBooking.countDocuments(filter);

    console.log(`Found ${bookings.length} bookings out of ${total} total`);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (err) {
    console.error("Error getting food bookings:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update booking status (admin only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['pending', 'preparing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = { status };
    
    // Add timestamps based on status
    if (status === 'preparing' && !req.body.preparedAt) {
      updateData.preparedAt = new Date();
    } else if (status === 'completed' && !req.body.completedAt) {
      updateData.completedAt = new Date();
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const booking = await FoodBooking.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).populate('foodItem');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking status updated successfully",
      booking
    });

  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ message: err.message });
  }
};


// Get pending bookings count for notifications
export const getPendingBookingsCount = async (req, res) => {
  try {
    const count = await FoodBooking.countDocuments({ status: 'pending' });
    res.json({ pendingCount: count });
  } catch (err) {
    console.error("Error getting pending bookings count:", err);
    res.status(500).json({ message: err.message });
  }
};

// Test endpoint to check if there are any bookings (for debugging)
export const testBookings = async (req, res) => {
  try {
    const totalCount = await FoodBooking.countDocuments();
    const pendingCount = await FoodBooking.countDocuments({ status: 'pending' });
    const allBookings = await FoodBooking.find().limit(5);
    
    res.json({
      totalBookings: totalCount,
      pendingBookings: pendingCount,
      sampleBookings: allBookings,
      message: "Test endpoint working"
    });
  } catch (err) {
    console.error("Error in test endpoint:", err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function to populate customerId for existing bookings
export const populateCustomerIds = async (req, res) => {
  try {
    console.log('Starting customerId population for existing food bookings...');
    
    // Find all bookings without customerId
    const bookingsWithoutCustomerId = await FoodBooking.find({ 
      customerId: { $exists: false } 
    });
    
    console.log(`Found ${bookingsWithoutCustomerId.length} bookings without customerId`);
    
    let updatedCount = 0;
    
    for (const booking of bookingsWithoutCustomerId) {
      try {
        // Try to find user by email
        const user = await User.findOne({ email: booking.customerEmail });
        
        if (user) {
          // Update the booking with customerId
          await FoodBooking.findByIdAndUpdate(booking._id, { 
            customerId: user._id 
          });
          updatedCount++;
          console.log(`Updated booking ${booking._id} with customerId ${user._id} for user ${user.email}`);
        } else {
          console.log(`No user found for email: ${booking.customerEmail}`);
        }
      } catch (error) {
        console.error(`Error updating booking ${booking._id}:`, error);
      }
    }
    
    res.json({
      message: `Successfully updated ${updatedCount} out of ${bookingsWithoutCustomerId.length} bookings`,
      totalBookings: bookingsWithoutCustomerId.length,
      updatedBookings: updatedCount
    });
    
  } catch (err) {
    console.error("Error populating customerIds:", err);
    res.status(500).json({ message: err.message });
  }
};
