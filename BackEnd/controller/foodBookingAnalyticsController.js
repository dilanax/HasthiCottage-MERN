import FoodBooking from "../models/FoodBooking.js";
import MenuItem from "../models/MenuItemModel.js";

// Get food booking analytics
export const getFoodBookingAnalytics = async (req, res) => {
  try {
    const { timeframe, startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      // Validate dates before using them
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        dateFilter.bookingDate = {
          $gte: start,
          $lte: end
        };
        console.log('Analytics date filter applied:', dateFilter.bookingDate);
      } else {
        console.log('Invalid dates in analytics request, skipping date filter');
      }
    } else if (timeframe) {
      const now = new Date();
      let start;
      
      switch (timeframe) {
        case 'daily':
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          dateFilter.bookingDate = { $gte: start };
          break;
        case 'weekly':
          start = new Date(now);
          start.setDate(now.getDate() - 7);
          dateFilter.bookingDate = { $gte: start };
          break;
        case 'monthly':
          start = new Date(now);
          start.setMonth(now.getMonth() - 1);
          dateFilter.bookingDate = { $gte: start };
          break;
      }
    }

    // Get bookings with filters
    const bookings = await FoodBooking.find(dateFilter).populate('foodItem');
    
    // Filter completed bookings for revenue calculations
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    
    // Calculate analytics
    const totalBookings = bookings.length;
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const averageOrderValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;
    
    // Status breakdown (all bookings)
    const statusBreakdown = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
    
    // Popular items (only from completed bookings)
    const popularItems = completedBookings.reduce((acc, booking) => {
      const itemName = booking.itemName;
      if (!acc[itemName]) {
        acc[itemName] = { count: 0, revenue: 0 };
      }
      acc[itemName].count += booking.quantity;
      acc[itemName].revenue += booking.totalAmount;
      return acc;
    }, {});
    
    const popularItemsArray = Object.entries(popularItems)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Revenue trend (last 7 days) - only completed bookings
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= dayStart && bookingDate <= dayEnd;
      });
      
      // Only completed bookings for revenue
      const dayCompletedBookings = dayBookings.filter(booking => booking.status === 'completed');
      const dayRevenue = dayCompletedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
      const dayBookingsCount = dayBookings.length; // Total bookings count
      
      revenueTrend.push({
        _id: date.toISOString().split('T')[0],
        sales: dayRevenue,
        orders: dayBookingsCount
      });
    }
    
    // Category revenue - only from completed bookings
    const categoryRevenue = {};
    completedBookings.forEach(booking => {
      let category = null;
      
      // Try to get category from populated foodItem first
      if (booking.foodItem && booking.foodItem.category) {
        category = booking.foodItem.category;
      } else if (booking.foodItem && typeof booking.foodItem === 'string') {
        // If foodItem is just an ID, we need to fetch it separately
        // For now, we'll skip this booking and log it
        console.log('FoodItem not populated for booking:', booking._id);
        return;
      }
      
      if (category) {
        if (!categoryRevenue[category]) {
          categoryRevenue[category] = 0;
        }
        categoryRevenue[category] += booking.totalAmount;
      }
    });
    
    // If no category data found, try to get it from MenuItem collection directly
    if (Object.keys(categoryRevenue).length === 0) {
      console.log('No category revenue found, trying alternative approach...');
      
      // Get all unique food item IDs from completed bookings
      const foodItemIds = [...new Set(completedBookings.map(booking => 
        typeof booking.foodItem === 'string' ? booking.foodItem : booking.foodItem?._id
      ).filter(Boolean))];
      
      if (foodItemIds.length > 0) {
        // Get menu items with their categories
        const menuItems = await MenuItem.find({ _id: { $in: foodItemIds } });
        const menuItemMap = {};
        menuItems.forEach(item => {
          menuItemMap[item._id.toString()] = item.category;
        });
        
        // Calculate category revenue using the map (only completed bookings)
        completedBookings.forEach(booking => {
          const foodItemId = typeof booking.foodItem === 'string' ? booking.foodItem : booking.foodItem?._id;
          const category = menuItemMap[foodItemId];
          
          if (category) {
            if (!categoryRevenue[category]) {
              categoryRevenue[category] = 0;
            }
            categoryRevenue[category] += booking.totalAmount;
          }
        });
      }
    }
    
    const categoryRevenueArray = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ _id: category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
    
    // Recent bookings
    const recentBookings = await FoodBooking.find(dateFilter)
      .populate('foodItem')
      .sort({ bookingDate: -1 })
      .limit(10);
    
    // Debug information
    console.log('Analytics Debug Info:');
    console.log('- Total bookings:', totalBookings);
    console.log('- Completed bookings:', completedBookings.length);
    console.log('- Total revenue (completed only):', totalRevenue);
    console.log('- Average order value (completed only):', averageOrderValue);
    console.log('- Category revenue array:', categoryRevenueArray);
    console.log('- Popular items count:', popularItemsArray.length);
    console.log('- Sample completed booking:', completedBookings[0] ? {
      id: completedBookings[0]._id,
      foodItem: completedBookings[0].foodItem,
      itemName: completedBookings[0].itemName,
      status: completedBookings[0].status,
      totalAmount: completedBookings[0].totalAmount
    } : 'No completed bookings found');

    // If no bookings found, return empty data structure
    if (totalBookings === 0) {
      console.log('No bookings found, returning empty analytics data');
      return res.json({
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        ordersByStatus: [],
        revenueByCategory: [],
        topSellingItems: [],
        recentActivity: [],
        revenueTrend: [],
        categoryRevenue: [],
        popularItems: [],
        debug: {
          totalBookings: 0,
          completedBookings: 0,
          categoryRevenueCount: 0,
          popularItemsCount: 0,
          sampleCompletedBooking: null
        }
      });
    }

    // Format response to match frontend expectations
    const ordersByStatus = Object.entries(statusBreakdown).map(([status, count]) => ({
      status,
      count
    }));

    const recentActivity = recentBookings.map(booking => ({
      description: `${booking.customerName} ordered ${booking.itemName}`,
      timestamp: booking.bookingDate,
      amount: booking.totalAmount,
      status: booking.status
    }));

    res.json({
      // Main metrics
      totalOrders: totalBookings,
      totalRevenue,
      averageOrderValue,
      pendingOrders: statusBreakdown.pending || 0,
      
      // Status breakdown
      ordersByStatus,
      
      // Revenue by category
      revenueByCategory: categoryRevenueArray.map(item => ({
        category: item._id,
        revenue: item.revenue
      })),
      
      // Top selling items
      topSellingItems: popularItemsArray.map(item => ({
        name: item.name,
        category: 'Unknown', // We'll need to get this from menu items
        orders: item.count,
        revenue: item.revenue
      })),
      
      // Recent activity
      recentActivity,
      
      // Additional data for charts
      revenueTrend,
      categoryRevenue: categoryRevenueArray,
      popularItems: popularItemsArray,
      
      // Debug info (remove in production)
      debug: {
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        categoryRevenueCount: categoryRevenueArray.length,
        popularItemsCount: popularItemsArray.length,
        sampleCompletedBooking: completedBookings[0] ? {
          id: completedBookings[0]._id,
          foodItem: completedBookings[0].foodItem,
          itemName: completedBookings[0].itemName,
          status: completedBookings[0].status,
          totalAmount: completedBookings[0].totalAmount
        } : null
      }
    });
    
  } catch (err) {
    console.error("Food booking analytics error:", err);
    res.status(500).json({ message: err.message });
  }
};
