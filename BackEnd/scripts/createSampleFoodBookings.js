import mongoose from "mongoose";
import dotenv from "dotenv";
import FoodBooking from "../models/FoodBooking.js";
import MenuItem from "../models/MenuItemModel.js";

dotenv.config();

const sampleBookings = [
  {
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    customerPhone: "+94771234567",
    quantity: 2,
    specialRequests: "Extra spicy, no onions",
    status: "pending"
  },
  {
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    customerPhone: "+94772345678",
    quantity: 1,
    specialRequests: "Vegetarian option",
    status: "preparing"
  },
  {
    customerName: "Mike Wilson",
    customerEmail: "mike.w@email.com",
    customerPhone: "+94773456789",
    quantity: 3,
    specialRequests: "Well done",
    status: "completed"
  },
  {
    customerName: "Emma Davis",
    customerEmail: "emma.d@email.com",
    customerPhone: "+94774567890",
    quantity: 1,
    specialRequests: "Gluten-free",
    status: "pending"
  },
  {
    customerName: "David Brown",
    customerEmail: "david.b@email.com",
    customerPhone: "+94775678901",
    quantity: 2,
    specialRequests: "Extra sauce",
    status: "completed"
  }
];

async function createSampleBookings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Get a sample menu item
    const menuItem = await MenuItem.findOne();
    if (!menuItem) {
      console.log("No menu items found. Please create menu items first.");
      return;
    }

    console.log("Using menu item:", menuItem.name, "Price:", menuItem.price);

    // Clear existing bookings (optional)
    await FoodBooking.deleteMany({});
    console.log("Cleared existing bookings");

    // Create sample bookings
    for (const bookingData of sampleBookings) {
      const totalAmount = menuItem.price * bookingData.quantity;
      
      const booking = new FoodBooking({
        foodItem: menuItem._id,
        itemName: menuItem.name,
        itemPrice: menuItem.price,
        itemImage: menuItem.image,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        quantity: bookingData.quantity,
        totalAmount: totalAmount,
        specialRequests: bookingData.specialRequests,
        status: bookingData.status,
        bookingDate: new Date()
      });

      await booking.save();
      console.log(`Created booking for ${bookingData.customerName}`);
    }

    console.log("Sample food bookings created successfully!");
    
    // Verify bookings were created
    const totalBookings = await FoodBooking.countDocuments();
    console.log(`Total bookings in database: ${totalBookings}`);

  } catch (error) {
    console.error("Error creating sample bookings:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createSampleBookings();

