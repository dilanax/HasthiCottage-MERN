# 🤖 Hasthi Safari Cottage Chatbot

A modern, user-friendly chatbot integrated into the Hasthi Safari Cottage hotel management system that helps guests discover amazing places around Udawalawe, Sri Lanka.

## ✨ Features

### 🎯 **Smart Place Recommendations**
- **10+ Nearby Attractions**: Curated list of Udawalawe's best attractions
- **Real-time Suggestions**: Dynamic recommendations based on user queries
- **Detailed Information**: Distance, duration, ratings, activities, and contact details
- **Featured Places**: Highlighted top attractions for quick discovery

### 🗺️ **Comprehensive Location Data**
- **Udawalawe National Park** (5km) - Famous for elephant herds and wildlife
- **Elephant Transit Home** (3km) - Conservation center for orphaned elephants
- **Udawalawe Reservoir** (8km) - Scenic lake perfect for relaxation
- **Bundala National Park** (45km) - UNESCO World Heritage bird sanctuary
- **Kataragama Temple** (35km) - Sacred religious pilgrimage site
- **Yala National Park** (60km) - World-famous for leopard sightings
- **Sithulpawwa Rock Temple** (25km) - Ancient Buddhist temple
- **Lunugamvehera National Park** (40km) - Alternative wildlife destination
- **Tissamaharama Stupa** (30km) - Historic Buddhist monument
- **Kirinda Beach** (50km) - Pristine beach for relaxation

### 💬 **Interactive Chat Experience**
- **Natural Language Processing**: Understands various question formats
- **Quick Questions**: Pre-defined buttons for common queries
- **Rich Responses**: Beautiful cards with detailed place information
- **Typing Indicators**: Realistic bot typing animation
- **Fallback Support**: Works even when backend is unavailable

### 🎨 **Modern UI Design**
- **Floating Chat Button**: Fixed position with smooth animations
- **Gradient Themes**: Beautiful blue-to-green color scheme
- **Responsive Design**: Works perfectly on all device sizes
- **Smooth Animations**: Hover effects and transitions
- **Professional Styling**: Matches the hotel's luxury brand

## 🚀 Quick Start

### 1. **Seed the Database**
```bash
cd hasthi-safari-cottage-MERN-BackEnd
npm run seed:chatbot
```

### 2. **Start the Backend**
```bash
npm start
```

### 3. **Start the Frontend**
```bash
cd hasthi-safari-cottage-MERN-FrontEnd
npm run dev
```

### 4. **Test the Chatbot**
- Look for the blue chat button in the bottom-right corner
- Click to open the chatbot
- Try asking: "What are the best nearby attractions?"

## 🛠️ Technical Implementation

### **Frontend Components**
- `Chatbot.jsx` - Main chatbot component with UI and logic
- `chatbotApi.js` - API service for backend communication
- `ChatbotManagement.jsx` - Admin panel for managing places

### **Backend API**
- `chatbotController.js` - Handles all chatbot requests
- `chatbotRoutes.js` - API route definitions
- `nearbyPlaces.js` - MongoDB model for places data
- `chatbotPlaces.js` - Seed data for Udawalawe attractions

### **API Endpoints**
```
GET  /api/chatbot/places              - Get all places
GET  /api/chatbot/places/featured     - Get featured places
GET  /api/chatbot/places/category/:id - Get places by category
GET  /api/chatbot/places/search       - Search places
GET  /api/chatbot/places/distance     - Get places by distance
GET  /api/chatbot/places/:id          - Get place details
POST /api/chatbot/query               - Send chatbot query
```

## 📱 User Experience

### **For Guests**
1. **Easy Discovery**: Click the chat button to instantly access local recommendations
2. **Quick Questions**: Use pre-defined buttons for common queries
3. **Rich Information**: Get detailed place information with ratings and activities
4. **Smart Suggestions**: Bot provides contextual follow-up suggestions

### **For Administrators**
1. **Manage Places**: Add, edit, and delete attraction information
2. **Feature Management**: Mark places as featured for priority display
3. **Category Organization**: Organize places by type (wildlife, culture, nature)
4. **Real-time Updates**: Changes reflect immediately in the chatbot

## 🎯 Sample Conversations

### **Guest**: "What are the best nearby attractions?"
**Bot**: Shows 3 featured places with ratings, distances, and activities

### **Guest**: "Tell me about Udawalawe National Park"
**Bot**: Detailed information about the park including entry fees, best times, and activities

### **Guest**: "How far is the Elephant Transit Home?"
**Bot**: "The Elephant Transit Home is 3km away from Hasthi Safari Cottage! 🐘❤️"

### **Guest**: "What activities are available?"
**Bot**: Lists all available activities across different attractions

## 🔧 Customization

### **Adding New Places**
1. Access admin panel at `/admin/chatbot`
2. Click "Add Place" button
3. Fill in place details (name, type, distance, description, etc.)
4. Save to database

### **Modifying Bot Responses**
Edit the `generateBotResponse` function in `Chatbot.jsx` to customize how the bot responds to different queries.

### **Styling Changes**
The chatbot uses Tailwind CSS classes. Modify colors, animations, and layout in the `Chatbot.jsx` component.

## 📊 Database Schema

```javascript
{
  name: String,           // Place name
  type: String,           // Place type (Wildlife Safari, etc.)
  distance: String,       // Distance from hotel
  duration: String,       // Recommended visit duration
  rating: Number,         // 1-5 star rating
  description: String,    // Detailed description
  activities: [String],   // Available activities
  bestTime: String,       // Best visiting time
  contact: String,        // Contact information
  website: String,        // Official website
  coordinates: {          // GPS coordinates
    latitude: Number,
    longitude: Number
  },
  entryFee: {             // Entry fees
    adult: Number,
    child: Number,
    foreigner: Number
  },
  facilities: [String],   // Available facilities
  openingHours: Object,   // Opening hours by day
  category: String,       // Category (wildlife, culture, etc.)
  featured: Boolean       // Featured status
}
```

## 🎨 Design Philosophy

The chatbot follows these design principles:
- **User-Friendly**: Intuitive interface with clear visual hierarchy
- **Professional**: Matches the luxury hotel brand aesthetic
- **Responsive**: Works seamlessly across all devices
- **Accessible**: Clear typography and color contrast
- **Engaging**: Smooth animations and interactive elements

## 🔮 Future Enhancements

- **Voice Input**: Add speech-to-text functionality
- **Multilingual Support**: Support for Sinhala and Tamil
- **Real-time Weather**: Include weather information for outdoor activities
- **Booking Integration**: Direct booking links for attractions
- **Guest Preferences**: Learn from user interactions for better recommendations
- **Photo Gallery**: Include images for each attraction
- **Reviews Integration**: Show guest reviews for attractions

## 🐛 Troubleshooting

### **Chatbot Not Appearing**
- Check if the Chatbot component is imported in App.jsx
- Verify the chatbot button is positioned correctly

### **API Errors**
- Ensure backend server is running on port 5000
- Check CORS configuration in backend
- Verify database connection

### **Empty Responses**
- Run the seed script to populate the database
- Check if places exist in the database

## 📞 Support

For technical support or feature requests, contact the development team or refer to the main project documentation.

---

**Built with ❤️ for Hasthi Safari Cottage - Your Gateway to Udawalawe Adventures!**
