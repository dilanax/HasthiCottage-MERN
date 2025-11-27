import Package from "../models/PackageModel.js";
import { uploadPackageImage, deleteFromAzure } from "../lib/azureUpload.js";

// Currency conversion utility
const USD_TO_LKR_RATE = 330; // 1 USD = 330 LKR
const convertUSDToLKR = (usdAmount) => Number(usdAmount) * USD_TO_LKR_RATE;

// Create Package
export const createPackage = async (req, res) => {
  try {
    const { description, destination, date, period, visitors, price, type } = req.body;
    
    console.log("Received data:", req.body); // Debug log
    console.log("Received file:", req.file); // Debug log
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadPackageImage(req.file);
    }
    
    const newPackage = new Package({ 
      description, 
      destination, 
      date, 
      period, 
      visitors: Number(visitors), 
      price: convertUSDToLKR(price), // Convert USD to LKR for storage
      type, 
      image: imageUrl 
    });
    
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (err) {
    console.error("Error creating package:", err); // Debug log
    res.status(500).json({ message: err.message });
  }
};

// Get All Packages
export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Package
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, destination, date, period, visitors, price, type } = req.body;
    
    // Get the existing package to check for old image
    const existingPackage = await Package.findById(id);
    if (!existingPackage) {
      return res.status(404).json({ message: "Package not found" });
    }
    
    const updateData = { 
      description, 
      destination, 
      date, 
      period, 
      visitors: Number(visitors), 
      price: convertUSDToLKR(price), // Convert USD to LKR for storage
      type 
    };
    
    // If there's a new image, upload it and delete the old one
    if (req.file) {
      // Upload new image
      updateData.image = await uploadPackageImage(req.file, id);
      
      // Delete old image from Azure if it exists
      if (existingPackage.image) {
        await deleteFromAzure(existingPackage.image);
      }
    }
    
    const updated = await Package.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Package
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the package to check for image before deleting
    const packageToDelete = await Package.findById(id);
    if (!packageToDelete) {
      return res.status(404).json({ message: "Package not found" });
    }
    
    // Delete image from Azure if it exists
    if (packageToDelete.image) {
      await deleteFromAzure(packageToDelete.image);
    }
    
    await Package.findByIdAndDelete(id);
    res.json({ message: "Package deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Safari Analytics
export const getSafariAnalytics = async (req, res) => {
  try {
    const { timeframe, startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (timeframe) {
      const now = new Date();
      let start;
      
      switch (timeframe) {
        case 'daily':
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          dateFilter.createdAt = { $gte: start };
          break;
        case 'weekly':
          start = new Date(now);
          start.setDate(now.getDate() - 7);
          dateFilter.createdAt = { $gte: start };
          break;
        case 'monthly':
          start = new Date(now);
          start.setMonth(now.getMonth() - 1);
          dateFilter.createdAt = { $gte: start };
          break;
      }
    }

    // Get packages with filters
    const packages = await Package.find(dateFilter);
    
    // Calculate analytics
    const totalPackages = packages.length;
    const activePackages = packages.filter(pkg => pkg.type && pkg.type !== 'inactive').length;
    const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.price || 0), 0);
    const averageRating = 4.5; // Mock data - you can implement actual rating system
    
    // Revenue trend (last 7 days)
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayPackages = packages.filter(pkg => {
        const pkgDate = new Date(pkg.createdAt);
        return pkgDate >= dayStart && pkgDate <= dayEnd;
      });
      
      const dayRevenue = dayPackages.reduce((sum, pkg) => sum + (pkg.price || 0), 0);
      
      revenueTrend.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue
      });
    }
    
    // Packages by type
    const packagesByType = packages.reduce((acc, pkg) => {
      const type = pkg.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const packagesByTypeArray = Object.entries(packagesByType).map(([type, count]) => ({
      name: type,
      count
    }));
    
    // Popular destinations
    const popularDestinations = packages.reduce((acc, pkg) => {
      const dest = pkg.destination || 'Unknown';
      acc[dest] = (acc[dest] || 0) + 1;
      return acc;
    }, {});
    
    const popularDestinationsArray = Object.entries(popularDestinations)
      .map(([destination, bookings]) => ({ destination, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);
    
    res.json({
      totalPackages,
      activePackages,
      totalRevenue,
      averageRating,
      revenueTrend,
      packagesByType: packagesByTypeArray,
      popularDestinations: popularDestinationsArray
    });
    
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get Booking Details (Mock data for now)
export const getBookingDetails = async (req, res) => {
  try {
    // This would typically come from a bookings collection
    // For now, return mock data
    const mockBookings = [
      {
        packageName: "Luxury Safari Adventure",
        customerName: "John Doe",
        bookingDate: new Date().toISOString(),
        amount: 50000,
        status: "confirmed"
      },
      {
        packageName: "Budget Safari Package",
        customerName: "Jane Smith",
        bookingDate: new Date(Date.now() - 86400000).toISOString(),
        amount: 25000,
        status: "pending"
      },
      {
        packageName: "Semi-Luxury Safari",
        customerName: "Bob Johnson",
        bookingDate: new Date(Date.now() - 172800000).toISOString(),
        amount: 35000,
        status: "confirmed"
      }
    ];
    
    res.json(mockBookings);
    
  } catch (err) {
    console.error("Booking details error:", err);
    res.status(500).json({ message: err.message });
  }
};