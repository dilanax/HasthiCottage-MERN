import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NearbyPlaces from '../models/nearbyPlaces.js';

dotenv.config();

const udawalawePlaces = [
  {
    name: "Udawalawe National Park",
    type: "Wildlife Safari",
    distance: "5 km",
    duration: "3-4 hours",
    rating: 4.8,
    description: "Famous for large elephant herds, leopards, and diverse bird species. Perfect for wildlife photography and safari adventures.",
    activities: ["Elephant Safari", "Bird Watching", "Photography", "Game Drives"],
    bestTime: "6:00 AM - 6:00 PM",
    contact: "+94 47 492 0001",
    website: "www.udawalawe.com",
    coordinates: {
      latitude: 6.4372,
      longitude: 80.8905
    },
    entryFee: {
      adult: 2500,
      child: 1250,
      foreigner: 5000
    },
    facilities: ["Parking", "Restrooms", "Restaurant", "Gift Shop", "Guide Services"],
    openingHours: {
      monday: "6:00 AM - 6:00 PM",
      tuesday: "6:00 AM - 6:00 PM",
      wednesday: "6:00 AM - 6:00 PM",
      thursday: "6:00 AM - 6:00 PM",
      friday: "6:00 AM - 6:00 PM",
      saturday: "6:00 AM - 6:00 PM",
      sunday: "6:00 AM - 6:00 PM"
    },
    category: "wildlife",
    featured: true
  },
  {
    name: "Udawalawe Elephant Transit Home",
    type: "Conservation Center",
    distance: "3 km",
    duration: "1-2 hours",
    rating: 4.6,
    description: "Rehabilitation center for orphaned elephant calves. Watch feeding sessions and learn about conservation efforts.",
    activities: ["Elephant Feeding", "Educational Tours", "Conservation Learning", "Photography"],
    bestTime: "10:00 AM - 4:00 PM",
    contact: "+94 47 492 0002",
    website: "www.elephanttransithome.lk",
    coordinates: {
      latitude: 6.4200,
      longitude: 80.8800
    },
    entryFee: {
      adult: 1000,
      child: 500,
      foreigner: 2000
    },
    facilities: ["Parking", "Restrooms", "Information Center", "Gift Shop"],
    openingHours: {
      monday: "10:00 AM - 4:00 PM",
      tuesday: "10:00 AM - 4:00 PM",
      wednesday: "10:00 AM - 4:00 PM",
      thursday: "10:00 AM - 4:00 PM",
      friday: "10:00 AM - 4:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "10:00 AM - 4:00 PM"
    },
    category: "wildlife",
    featured: true
  },
  {
    name: "Udawalawe Reservoir",
    type: "Scenic Viewpoint",
    distance: "8 km",
    duration: "2-3 hours",
    rating: 4.4,
    description: "Beautiful man-made lake perfect for relaxation and picnics with stunning sunset views and bird watching.",
    activities: ["Picnic", "Boating", "Photography", "Relaxation", "Bird Watching"],
    bestTime: "5:00 AM - 7:00 PM",
    contact: "+94 47 492 0003",
    website: "www.udawalawe.gov.lk",
    coordinates: {
      latitude: 6.4500,
      longitude: 80.9200
    },
    entryFee: {
      adult: 500,
      child: 250,
      foreigner: 1000
    },
    facilities: ["Parking", "Restrooms", "Picnic Areas", "Boat Rental"],
    openingHours: {
      monday: "5:00 AM - 7:00 PM",
      tuesday: "5:00 AM - 7:00 PM",
      wednesday: "5:00 AM - 7:00 PM",
      thursday: "5:00 AM - 7:00 PM",
      friday: "5:00 AM - 7:00 PM",
      saturday: "5:00 AM - 7:00 PM",
      sunday: "5:00 AM - 7:00 PM"
    },
    category: "nature",
    featured: true
  },
  {
    name: "Bundala National Park",
    type: "Bird Sanctuary",
    distance: "45 km",
    duration: "4-5 hours",
    rating: 4.7,
    description: "UNESCO World Heritage site known for migratory birds, saltwater crocodiles, and diverse wetland ecosystems.",
    activities: ["Bird Watching", "Crocodile Spotting", "Nature Walks", "Photography"],
    bestTime: "6:00 AM - 6:00 PM",
    contact: "+94 47 492 0004",
    website: "www.bundala.com",
    coordinates: {
      latitude: 6.2000,
      longitude: 81.2000
    },
    entryFee: {
      adult: 2000,
      child: 1000,
      foreigner: 4000
    },
    facilities: ["Parking", "Restrooms", "Guide Services", "Observation Points"],
    openingHours: {
      monday: "6:00 AM - 6:00 PM",
      tuesday: "6:00 AM - 6:00 PM",
      wednesday: "6:00 AM - 6:00 PM",
      thursday: "6:00 AM - 6:00 PM",
      friday: "6:00 AM - 6:00 PM",
      saturday: "6:00 AM - 6:00 PM",
      sunday: "6:00 AM - 6:00 PM"
    },
    category: "wildlife",
    featured: true
  },
  {
    name: "Kataragama Temple",
    type: "Religious Site",
    distance: "35 km",
    duration: "3-4 hours",
    rating: 4.5,
    description: "Sacred Hindu and Buddhist pilgrimage site with rich cultural heritage and spiritual significance.",
    activities: ["Temple Visit", "Cultural Experience", "Religious Ceremonies", "Photography"],
    bestTime: "5:00 AM - 8:00 PM",
    contact: "+94 47 492 0005",
    website: "www.kataragama.org",
    coordinates: {
      latitude: 6.4167,
      longitude: 81.3333
    },
    entryFee: {
      adult: 0,
      child: 0,
      foreigner: 0
    },
    facilities: ["Parking", "Restrooms", "Information Center", "Gift Shop", "Restaurants"],
    openingHours: {
      monday: "5:00 AM - 8:00 PM",
      tuesday: "5:00 AM - 8:00 PM",
      wednesday: "5:00 AM - 8:00 PM",
      thursday: "5:00 AM - 8:00 PM",
      friday: "5:00 AM - 8:00 PM",
      saturday: "5:00 AM - 8:00 PM",
      sunday: "5:00 AM - 8:00 PM"
    },
    category: "culture",
    featured: false
  },
  {
    name: "Yala National Park",
    type: "Wildlife Safari",
    distance: "60 km",
    duration: "6-8 hours",
    rating: 4.9,
    description: "World-famous for leopards and diverse wildlife. One of Sri Lanka's premier safari destinations with highest leopard density.",
    activities: ["Leopard Safari", "Wildlife Photography", "Game Drives", "Bird Watching"],
    bestTime: "5:30 AM - 6:30 PM",
    contact: "+94 47 492 0006",
    website: "www.yala.com",
    coordinates: {
      latitude: 6.3833,
      longitude: 81.5167
    },
    entryFee: {
      adult: 3000,
      child: 1500,
      foreigner: 6000
    },
    facilities: ["Parking", "Restrooms", "Restaurant", "Gift Shop", "Guide Services", "Accommodation"],
    openingHours: {
      monday: "5:30 AM - 6:30 PM",
      tuesday: "5:30 AM - 6:30 PM",
      wednesday: "5:30 AM - 6:30 PM",
      thursday: "5:30 AM - 6:30 PM",
      friday: "5:30 AM - 6:30 PM",
      saturday: "5:30 AM - 6:30 PM",
      sunday: "5:30 AM - 6:30 PM"
    },
    category: "wildlife",
    featured: true
  },
  {
    name: "Sithulpawwa Rock Temple",
    type: "Religious Site",
    distance: "25 km",
    duration: "2-3 hours",
    rating: 4.3,
    description: "Ancient Buddhist rock temple with historical significance and panoramic views of the surrounding wilderness.",
    activities: ["Temple Visit", "Historical Tour", "Photography", "Hiking"],
    bestTime: "6:00 AM - 6:00 PM",
    contact: "+94 47 492 0007",
    website: "www.sithulpawwa.com",
    coordinates: {
      latitude: 6.3500,
      longitude: 81.2500
    },
    entryFee: {
      adult: 500,
      child: 250,
      foreigner: 1000
    },
    facilities: ["Parking", "Restrooms", "Information Center"],
    openingHours: {
      monday: "6:00 AM - 6:00 PM",
      tuesday: "6:00 AM - 6:00 PM",
      wednesday: "6:00 AM - 6:00 PM",
      thursday: "6:00 AM - 6:00 PM",
      friday: "6:00 AM - 6:00 PM",
      saturday: "6:00 AM - 6:00 PM",
      sunday: "6:00 AM - 6:00 PM"
    },
    category: "culture",
    featured: false
  },
  {
    name: "Lunugamvehera National Park",
    type: "Wildlife Safari",
    distance: "40 km",
    duration: "4-5 hours",
    rating: 4.2,
    description: "Less crowded alternative to Yala with excellent wildlife viewing opportunities and beautiful reservoir views.",
    activities: ["Wildlife Safari", "Bird Watching", "Photography", "Nature Walks"],
    bestTime: "6:00 AM - 6:00 PM",
    contact: "+94 47 492 0008",
    website: "www.lunugamvehera.com",
    coordinates: {
      latitude: 6.3333,
      longitude: 81.1500
    },
    entryFee: {
      adult: 2000,
      child: 1000,
      foreigner: 4000
    },
    facilities: ["Parking", "Restrooms", "Guide Services"],
    openingHours: {
      monday: "6:00 AM - 6:00 PM",
      tuesday: "6:00 AM - 6:00 PM",
      wednesday: "6:00 AM - 6:00 PM",
      thursday: "6:00 AM - 6:00 PM",
      friday: "6:00 AM - 6:00 PM",
      saturday: "6:00 AM - 6:00 PM",
      sunday: "6:00 AM - 6:00 PM"
    },
    category: "wildlife",
    featured: false
  },
  {
    name: "Tissamaharama Stupa",
    type: "Religious Site",
    distance: "30 km",
    duration: "1-2 hours",
    rating: 4.1,
    description: "Historic Buddhist stupa dating back to 200 BC with beautiful architecture and religious significance.",
    activities: ["Temple Visit", "Historical Tour", "Photography", "Meditation"],
    bestTime: "5:00 AM - 7:00 PM",
    contact: "+94 47 492 0009",
    website: "www.tissamaharama.org",
    coordinates: {
      latitude: 6.2833,
      longitude: 81.2833
    },
    entryFee: {
      adult: 0,
      child: 0,
      foreigner: 500
    },
    facilities: ["Parking", "Restrooms", "Information Center"],
    openingHours: {
      monday: "5:00 AM - 7:00 PM",
      tuesday: "5:00 AM - 7:00 PM",
      wednesday: "5:00 AM - 7:00 PM",
      thursday: "5:00 AM - 7:00 PM",
      friday: "5:00 AM - 7:00 PM",
      saturday: "5:00 AM - 7:00 PM",
      sunday: "5:00 AM - 7:00 PM"
    },
    category: "culture",
    featured: false
  },
  {
    name: "Kirinda Beach",
    type: "Scenic Viewpoint",
    distance: "50 km",
    duration: "3-4 hours",
    rating: 4.0,
    description: "Pristine beach with golden sand, perfect for relaxation and sunset viewing. Great for swimming and beach activities.",
    activities: ["Swimming", "Sunset Viewing", "Photography", "Beach Games", "Relaxation"],
    bestTime: "6:00 AM - 7:00 PM",
    contact: "+94 47 492 0010",
    website: "www.kirindabeach.com",
    coordinates: {
      latitude: 6.2500,
      longitude: 81.3500
    },
    entryFee: {
      adult: 0,
      child: 0,
      foreigner: 0
    },
    facilities: ["Parking", "Restrooms", "Restaurants", "Lifeguard Services"],
    openingHours: {
      monday: "6:00 AM - 7:00 PM",
      tuesday: "6:00 AM - 7:00 PM",
      wednesday: "6:00 AM - 7:00 PM",
      thursday: "6:00 AM - 7:00 PM",
      friday: "6:00 AM - 7:00 PM",
      saturday: "6:00 AM - 7:00 PM",
      sunday: "6:00 AM - 7:00 PM"
    },
    category: "nature",
    featured: false
  }
];

const seedNearbyPlaces = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing places
    await NearbyPlaces.deleteMany({});
    console.log('Cleared existing places');

    // Insert new places
    const insertedPlaces = await NearbyPlaces.insertMany(udawalawePlaces);
    console.log(`Successfully seeded ${insertedPlaces.length} places`);

    // Display summary
    const featuredCount = insertedPlaces.filter(place => place.featured).length;
    const categories = [...new Set(insertedPlaces.map(place => place.category))];
    
    console.log('\n=== Seeding Summary ===');
    console.log(`Total places: ${insertedPlaces.length}`);
    console.log(`Featured places: ${featuredCount}`);
    console.log(`Categories: ${categories.join(', ')}`);
    
    console.log('\n=== Featured Places ===');
    insertedPlaces
      .filter(place => place.featured)
      .forEach(place => {
        console.log(`- ${place.name} (${place.distance} away, Rating: ${place.rating})`);
      });

    console.log('\n=== All Places by Category ===');
    categories.forEach(category => {
      const placesInCategory = insertedPlaces.filter(place => place.category === category);
      console.log(`\n${category.toUpperCase()} (${placesInCategory.length} places):`);
      placesInCategory.forEach(place => {
        console.log(`  - ${place.name} (${place.distance} away)`);
      });
    });

  } catch (error) {
    console.error('Error seeding places:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNearbyPlaces();
}

export default seedNearbyPlaces;
