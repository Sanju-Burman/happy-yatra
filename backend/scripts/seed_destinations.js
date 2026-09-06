const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Destination = require('../src/models/destination.model');

const dummyDestinations = [
    {
        name: "Goa",
        imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        averageCost: 15000,
        styles: ["Beach", "Relaxation", "Party"],
        tags: ["Tropical", "Coastal", "Nightlife"],
        activities: ["Surfing", "Beach Volleyball", "Clubbing"],
        location: "Goa, India",
        latitude: 15.2993,
        longitude: 74.1240,
        trending: true,
        description: "India's pocket-sized paradise, known for its beautiful beaches and vibrant nightlife.",
        viewCount: 1250
    },
    {
        name: "Manali",
        imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        averageCost: 20000,
        styles: ["Adventure", "Mountains", "Nature"],
        tags: ["Snow", "Hiking", "Backpacking"],
        activities: ["Skiing", "Trekking", "Paragliding"],
        location: "Himachal Pradesh, India",
        latitude: 32.2432,
        longitude: 77.1892,
        trending: true,
        description: "A high-altitude Himalayan resort town known for its cool climate and snow-capped peaks.",
        viewCount: 980
    },
    {
        name: "Kerala Backwaters",
        imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        averageCost: 25000,
        styles: ["Peaceful", "Nature", "Romantic"],
        tags: ["Water", "Greenery", "Houseboat"],
        activities: ["Boating", "Ayurveda Spa", "Bird Watching"],
        location: "Alleppey, Kerala, India",
        latitude: 9.4981,
        longitude: 76.3388,
        trending: false,
        description: "Experience tranquility in the lush green landscapes and calm waters of Kerala.",
        viewCount: 750
    },
    {
        name: "Jaipur",
        imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        averageCost: 12000,
        styles: ["Culture", "History", "City"],
        tags: ["Palaces", "Heritage", "Shopping"],
        activities: ["Fort Visiting", "City Tour", "Traditional Dining"],
        location: "Rajasthan, India",
        latitude: 26.9124,
        longitude: 75.7873,
        trending: true,
        description: "The Pink City of India, famous for its majestic forts and rich cultural heritage.",
        viewCount: 1100
    },
    {
        name: "Leh Ladakh",
        imageUrl: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        averageCost: 35000,
        styles: ["Adventure", "Rugged", "Spiritual"],
        tags: ["Cold Desert", "Monasteries", "Biking"],
        activities: ["Motorcycle Biking", "Monastery Visit", "Camping"],
        location: "Ladakh, India",
        latitude: 34.1526,
        longitude: 77.5771,
        trending: false,
        description: "A land of high passes and dramatic landscapes, perfect for adventure seekers.",
        viewCount: 620
    },
    {
        name: "Udaipur",
        imageUrl: "https://images.unsplash.com/photo-1590050752117-23a9d7f28243?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        averageCost: 22000,
        styles: ["Luxury", "Romantic", "History"],
        tags: ["Lakes", "Royal", "Scenic"],
        activities: ["Lake Boating", "Palace Tour", "Sunset Watching"],
        location: "Rajasthan, India",
        latitude: 24.5854,
        longitude: 73.7125,
        trending: true,
        description: "The City of Lakes, known for its romantic atmosphere and stunning royal architecture.",
        viewCount: 890
    },
    {
        name: "Hampi",
        imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        averageCost: 8000,
        styles: ["History", "Ancient", "Backpacking"],
        tags: ["Ruins", "UNESCO", "Boulders"],
        activities: ["Bouldering", "Temple Hopping", "Coracle Riding"],
        location: "Karnataka, India",
        latitude: 15.3350,
        longitude: 76.4600,
        trending: false,
        description: "An ancient village with breathtaking ruins of the Vijayanagara Empire.",
        viewCount: 540
    },
    {
        name: "Rishikesh",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        averageCost: 10000,
        styles: ["Spiritual", "Adventure", "Nature"],
        tags: ["Yoga", "Ganges", "Rafting"],
        activities: ["River Rafting", "Yoga Meditation", "Ganga Aarti"],
        location: "Uttarakhand, India",
        latitude: 30.0869,
        longitude: 78.2676,
        trending: true,
        description: "The Yoga Capital of the World, offering a blend of spirituality and white-water rafting.",
        viewCount: 1350
    },
    {
        name: "Munnar",
        imageUrl: "https://images.unsplash.com/photo-1593693397690-362af9666fc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        averageCost: 18000,
        styles: ["Nature", "Peaceful", "Mountains"],
        tags: ["Tea Gardens", "Mist", "Flora"],
        activities: ["Tea Plantation Tour", "Hiking", "Eravikulam Park Visit"],
        location: "Kerala, India",
        latitude: 10.0889,
        longitude: 77.0595,
        trending: false,
        description: "A serene hill station famous for its sprawling tea estates and rolling hills.",
        viewCount: 710
    },
    {
        name: "Varanasi",
        imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        averageCost: 9000,
        styles: ["Spiritual", "Culture", "Ancient"],
        tags: ["Ghats", "Religious", "History"],
        activities: ["Ghat Walk", "Boat Ride", "Temple Visit"],
        location: "Uttar Pradesh, India",
        latitude: 25.3176,
        longitude: 83.0062,
        trending: true,
        description: "One of the oldest continuously inhabited cities in the world, the spiritual heart of India.",
        viewCount: 920
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_DB);
        console.log('Connected!');

        console.log('Cleaning up existing destinations...');
        await Destination.deleteMany({});
        console.log('Cleanup complete.');

        console.log('Seeding dummy destinations...');
        const result = await Destination.insertMany(dummyDestinations);
        console.log(`${result.length} destinations seeded successfully!`);

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

seed();
