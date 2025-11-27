import SafariBooking from "../models/SafariBooking.js";
import Package from "../models/PackageModel.js";
import User from "../models/user.js";

// Create a new safari booking
export const createSafariBooking = async (req, res) => {
  try {
    const {
      packageId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      numberOfPeople = 1,
      specialRequests = ""
    } = req.body;

    // Validate required fields
    if (!packageId || !customerId || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ 
        message: "Missing required fields: packageId, customerId, customerName, customerEmail, customerPhone" 
      });
    }

    // Get package details
    const packageDetails = await Package.findById(packageId);
    if (!packageDetails) {
      return res.status(404).json({ message: "Safari package not found" });
    }

    // Calculate total amount
    const totalAmount = packageDetails.price * numberOfPeople;

    // Create booking
    const booking = new SafariBooking({
      packageId,
      packageName: packageDetails.description,
      packagePrice: packageDetails.price,
      packageImage: packageDetails.image,
      packageType: packageDetails.type,
      packageDestination: packageDetails.destination,
      packageDate: packageDetails.date,
      packagePeriod: packageDetails.period,
      packageVisitors: packageDetails.visitors,
      customerName,
      customerEmail,
      customerPhone,
      customerId, // From request body
      numberOfPeople,
      totalAmount,
      specialRequests
    });

    await booking.save();

    // Populate the booking with package details
    await booking.populate('packageId');

    res.status(201).json({
      message: "Safari booking created successfully",
      booking: {
        id: booking._id,
        packageName: booking.packageName,
        customerName: booking.customerName,
        totalAmount: booking.totalAmount,
        status: booking.status,
        bookingDate: booking.bookingDate
      }
    });

  } catch (err) {
    console.error("Error creating safari booking:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all safari bookings (admin only)
export const getAllSafariBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'bookingDate', sortOrder = 'desc' } = req.query;
    
    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get bookings with pagination
    const bookings = await SafariBooking.find(filter)
      .populate('packageId')
      .populate('customerId', 'name email phone')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SafariBooking.countDocuments(filter);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (err) {
    console.error("Error getting safari bookings:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update booking status (admin only)
export const updateSafariBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = { status };
    
    // Add timestamps based on status
    if (status === 'confirmed' && !req.body.confirmedAt) {
      updateData.confirmedAt = new Date();
    } else if (status === 'completed' && !req.body.completedAt) {
      updateData.completedAt = new Date();
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const booking = await SafariBooking.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).populate('packageId').populate('customerId', 'name email phone');

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
export const getPendingSafariBookingsCount = async (req, res) => {
  try {
    const count = await SafariBooking.countDocuments({ status: 'pending' });
    res.json({ pendingCount: count });
  } catch (err) {
    console.error("Error getting pending bookings count:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get safari booking analytics
export const getSafariBookingAnalytics = async (req, res) => {
  try {
    const { timeframe = 'monthly' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get analytics data
    const totalBookings = await SafariBooking.countDocuments({
      bookingDate: { $gte: startDate }
    });

    const totalRevenue = await SafariBooking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startDate },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const statusBreakdown = await SafariBooking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const packageTypeBreakdown = await SafariBooking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$packageType',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get top selling packages
    const topSellingPackages = await SafariBooking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$packageName',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get sales over time (daily for the last 30 days)
    const salesOverTime = await SafariBooking.aggregate([
      {
        $match: {
          bookingDate: { 
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            $lte: now
          },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" }
          },
          sales: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get destination breakdown
    const destinationBreakdown = await SafariBooking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$packageDestination',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    const averageBookingValue = totalBookings > 0 
      ? (totalRevenue[0]?.total || 0) / totalBookings 
      : 0;

    res.json({
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageBookingValue,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      packageTypeBreakdown: packageTypeBreakdown.map(item => ({
        type: item._id,
        count: item.count,
        revenue: item.revenue
      })),
      topSellingPackages: topSellingPackages.map(item => ({
        name: item._id,
        count: item.count,
        revenue: item.revenue
      })),
      salesOverTime: salesOverTime.map(item => ({
        _id: item._id,
        sales: item.sales,
        bookings: item.bookings
      })),
      destinationBreakdown: destinationBreakdown.map(item => ({
        destination: item._id,
        count: item.count,
        revenue: item.revenue
      }))
    });

  } catch (err) {
    console.error("Error getting safari booking analytics:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get user's safari bookings
export const getUserSafariBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const bookings = await SafariBooking.find({ customerId: userId })
      .populate('packageId')
      .sort({ bookingDate: -1 });

    res.json({ bookings });

  } catch (err) {
    console.error("Error getting user safari bookings:", err);
    res.status(500).json({ message: err.message });
  }
};
