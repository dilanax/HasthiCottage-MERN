import NearbyPlaces from '../models/nearbyPlaces.js';

// Get all nearby places
export const getAllNearbyPlaces = async (req, res) => {
  try {
    const places = await NearbyPlaces.find({ isActive: true })
      .select('name type distance duration rating description activities bestTime contact website coordinates entryFee category featured')
      .sort({ featured: -1, rating: -1 });
    
    res.status(200).json({
      success: true,
      data: places,
      message: 'Nearby places retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby places',
      error: error.message
    });
  }
};

// Get places by category
export const getPlacesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const places = await NearbyPlaces.find({ 
      category: category,
      isActive: true 
    }).sort({ rating: -1 });
    
    res.status(200).json({
      success: true,
      data: places,
      message: `Places in ${category} category retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching places by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch places by category',
      error: error.message
    });
  }
};

// Search places by query
export const searchPlaces = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const places = await NearbyPlaces.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { activities: { $regex: q, $options: 'i' } },
            { type: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).sort({ rating: -1 });

    res.status(200).json({
      success: true,
      data: places,
      message: `Search results for "${q}"`
    });
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search places',
      error: error.message
    });
  }
};

// Get place details by ID
export const getPlaceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await NearbyPlaces.findById(id);
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    res.status(200).json({
      success: true,
      data: place,
      message: 'Place details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch place details',
      error: error.message
    });
  }
};

// Get featured places
export const getFeaturedPlaces = async (req, res) => {
  try {
    const places = await NearbyPlaces.find({ 
      featured: true,
      isActive: true 
    })
    .select('name type distance duration rating description activities bestTime contact website coordinates category')
    .sort({ rating: -1 })
    .limit(6);
    
    res.status(200).json({
      success: true,
      data: places,
      message: 'Featured places retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching featured places:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured places',
      error: error.message
    });
  }
};

// Get places by distance range
export const getPlacesByDistance = async (req, res) => {
  try {
    const { maxDistance } = req.query;
    
    if (!maxDistance || isNaN(parseInt(maxDistance))) {
      return res.status(400).json({
        success: false,
        message: 'Valid maxDistance parameter is required'
      });
    }

    const places = await NearbyPlaces.find({ isActive: true });
    
    // Filter places by distance (extract number from distance string)
    const filteredPlaces = places.filter(place => {
      const distance = parseInt(place.distance);
      return distance <= parseInt(maxDistance);
    });

    res.status(200).json({
      success: true,
      data: filteredPlaces,
      message: `Places within ${maxDistance}km retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching places by distance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch places by distance',
      error: error.message
    });
  }
};

// Chatbot response handler
export const handleChatbotQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query is required and must be at least 2 characters long'
      });
    }

    const searchQuery = query.toLowerCase();
    let response = {
      success: true,
      message: '',
      data: null,
      suggestions: []
    };

    // Handle different types of queries
    if (searchQuery.includes('nearby') || searchQuery.includes('attraction') || searchQuery.includes('place')) {
      const places = await NearbyPlaces.find({ isActive: true })
        .select('name type distance duration rating description activities bestTime contact website category')
        .sort({ featured: -1, rating: -1 })
        .limit(6);
      
      response.message = "Here are the amazing places you can visit near Hasthi Safari Cottage! 🎯";
      response.data = places;
      response.suggestions = [
        "Tell me about Udawalawe National Park",
        "How far is the Elephant Transit Home?",
        "What activities are available?"
      ];
    }
    else if (searchQuery.includes('udawalawe') && searchQuery.includes('park')) {
      const park = await NearbyPlaces.findOne({ 
        name: { $regex: /udawalawe.*park/i },
        isActive: true 
      });
      
      if (park) {
        response.message = `Let me tell you about ${park.name}! 🐘`;
        response.data = park;
      } else {
        response.message = "I couldn't find information about Udawalawe National Park. Let me show you some nearby attractions instead!";
        response.data = await NearbyPlaces.find({ isActive: true }).limit(3);
      }
    }
    else if (searchQuery.includes('elephant') && searchQuery.includes('transit')) {
      const transitHome = await NearbyPlaces.findOne({ 
        name: { $regex: /elephant.*transit/i },
        isActive: true 
      });
      
      if (transitHome) {
        response.message = `${transitHome.name} is a wonderful place to visit! 🐘❤️`;
        response.data = transitHome;
      } else {
        response.message = "I couldn't find information about the Elephant Transit Home. Let me show you some nearby attractions instead!";
        response.data = await NearbyPlaces.find({ isActive: true }).limit(3);
      }
    }
    else if (searchQuery.includes('distance') || searchQuery.includes('far') || searchQuery.includes('km')) {
      const places = await NearbyPlaces.find({ isActive: true })
        .select('name distance')
        .sort({ distance: 1 });
      
      response.message = "Here are the distances from Hasthi Safari Cottage: 📍";
      response.data = places.map(p => ({ name: p.name, distance: p.distance }));
    }
    else if (searchQuery.includes('activity') || searchQuery.includes('do')) {
      const places = await NearbyPlaces.find({ isActive: true })
        .select('name activities description')
        .sort({ rating: -1 });
      
      response.message = "Here are the exciting activities you can enjoy! 🎉";
      response.data = places;
    }
    else if (searchQuery.includes('time') || searchQuery.includes('best time') || searchQuery.includes('when')) {
      const places = await NearbyPlaces.find({ isActive: true })
        .select('name bestTime openingHours')
        .sort({ name: 1 });
      
      response.message = "Here are the best visiting times for each attraction: ⏰";
      response.data = places.map(p => ({ 
        name: p.name, 
        bestTime: p.bestTime,
        openingHours: p.openingHours 
      }));
    }
    else if (searchQuery.includes('contact') || searchQuery.includes('phone') || searchQuery.includes('number')) {
      const places = await NearbyPlaces.find({ isActive: true })
        .select('name contact website')
        .sort({ name: 1 });
      
      response.message = "Here are the contact details for nearby attractions: 📞";
      response.data = places.map(p => ({ 
        name: p.name, 
        contact: p.contact, 
        website: p.website 
      }));
    }
    else {
      // Default response with featured places
      const featuredPlaces = await NearbyPlaces.find({ 
        featured: true,
        isActive: true 
      })
      .select('name type distance duration rating description')
      .sort({ rating: -1 })
      .limit(3);
      
      response.message = "I'd love to help you explore Udawalawe! 🗺️ Here are some popular attractions near Hasthi Safari Cottage:";
      response.data = featuredPlaces;
      response.suggestions = [
        "What are the best nearby attractions?",
        "Tell me about Udawalawe National Park",
        "How far is the Elephant Transit Home?",
        "What activities are available?"
      ];
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error handling chatbot query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your request',
      error: error.message
    });
  }
};

// Add new place (Admin only)
export const addNewPlace = async (req, res) => {
  try {
    console.log('Backend: Received request to add new place');
    console.log('Backend: Request body:', req.body);
    
    const placeData = req.body;
    console.log('Backend: Place data to save:', placeData);
    
    const newPlace = new NearbyPlaces(placeData);
    console.log('Backend: Created new place object');
    
    const savedPlace = await newPlace.save();
    console.log('Backend: Place saved successfully:', savedPlace._id);
    
    res.status(201).json({
      success: true,
      data: savedPlace,
      message: 'New place added successfully'
    });
  } catch (error) {
    console.error('Backend: Error adding new place:', error);
    console.error('Backend: Error name:', error.name);
    console.error('Backend: Error message:', error.message);
    console.error('Backend: Full error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to add new place',
      error: error.message,
      details: error.name === 'ValidationError' ? error.errors : null
    });
  }
};

// Update place (Admin only)
export const updatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedPlace = await NearbyPlaces.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedPlace) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedPlace,
      message: 'Place updated successfully'
    });
  } catch (error) {
    console.error('Error updating place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update place',
      error: error.message
    });
  }
};

// Delete place (Admin only)
export const deletePlace = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPlace = await NearbyPlaces.findByIdAndDelete(id);
    
    if (!deletedPlace) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Place deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete place',
      error: error.message
    });
  }
};
