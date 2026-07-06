import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Property from '../models/propertyModel.js';
import Review from '../models/reviewModel.js';
import Booking from '../models/bookingModel.js';
import Favorite from '../models/favoriteModel.js';
import Transaction from '../models/transactionModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-rental')
  .then(() => console.log('MongoDB Connected for seeding'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Review.deleteMany({});
    await Booking.deleteMany({});
    await Favorite.deleteMany({});
    await Transaction.deleteMany({});

    console.log('Existing data cleared');

    // Create Admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: adminPassword,
      role: 'Admin',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    });
    console.log('Admin user created');

    // Create sample Owners (with Google provider - no password needed)
    const owner1Password = await bcrypt.hash('password123', 10);
    const owner1 = await User.create({
      name: 'John Property Owner',
      email: 'owner1@example.com',
      password: owner1Password,
      role: 'Owner',
      provider: 'credentials',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner1'
    });

    const owner2Password = await bcrypt.hash('password123', 10);
    const owner2 = await User.create({
      name: 'Sarah Landlord',
      email: 'owner2@example.com',
      password: owner2Password,
      role: 'Owner',
      provider: 'credentials',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner2'
    });
    console.log('Sample owners created');

    // Create sample Tenants (with Google provider - no password needed)
    const tenant1Password = await bcrypt.hash('password123', 10);
    const tenant1 = await User.create({
      name: 'Mike Renter',
      email: 'tenant1@example.com',
      password: tenant1Password,
      role: 'Tenant',
      provider: 'credentials',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tenant1'
    });

    const tenant2Password = await bcrypt.hash('password123', 10);
    const tenant2 = await User.create({
      name: 'Emma Tenant',
      email: 'tenant2@example.com',
      password: tenant2Password,
      role: 'Tenant',
      provider: 'credentials',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tenant2'
    });
    console.log('Sample tenants created');

    // Sample properties
    const properties = [
      {
        title: 'Luxury Downtown Apartment',
        description: 'Modern apartment in the heart of downtown with stunning city views. Features hardwood floors, stainless steel appliances, and spacious layout.',
        location: '123 Main St, Downtown, NY',
        propertyType: 'Apartment',
        rent: 2500,
        rentType: 'Monthly',
        bedrooms: 2,
        bathrooms: 2,
        propertySize: 1200,
        amenities: ['WiFi', 'Parking', 'Gym', 'Pool', 'Air Conditioning', 'Dishwasher'],
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        extraFeatures: ['Balcony', 'City View', 'Doorman', 'Laundry in Building'],
        status: 'Approved',
        ownerName: owner1.name,
        ownerEmail: owner1.email,
        ownerPhoto: owner1.photo
      },
      {
        title: 'Cozy Suburban House',
        description: 'Beautiful family home in quiet neighborhood. Large backyard, updated kitchen, and close to schools and parks.',
        location: '456 Oak Ave, Suburbia, NJ',
        propertyType: 'House',
        rent: 3200,
        rentType: 'Monthly',
        bedrooms: 3,
        bathrooms: 2,
        propertySize: 1800,
        amenities: ['WiFi', 'Parking', 'Backyard', 'Air Conditioning', 'Washer/Dryer'],
        images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'],
        extraFeatures: ['Fireplace', '2-Car Garage', 'Patio', 'Storage Shed'],
        status: 'Approved',
        ownerName: owner1.name,
        ownerEmail: owner1.email,
        ownerPhoto: owner1.photo
      },
      {
        title: 'Modern Studio Loft',
        description: 'Trendy studio loft in arts district. High ceilings, exposed brick, and modern finishes throughout.',
        location: '789 Art District Blvd, Los Angeles, CA',
        propertyType: 'Studio',
        rent: 1800,
        rentType: 'Monthly',
        bedrooms: 0,
        bathrooms: 1,
        propertySize: 600,
        amenities: ['WiFi', 'Air Conditioning', 'Hardwood Floors'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
        extraFeatures: ['High Ceilings', 'Exposed Brick', 'Natural Light'],
        status: 'Approved',
        ownerName: owner2.name,
        ownerEmail: owner2.email,
        ownerPhoto: owner2.photo
      },
      {
        title: 'Beachfront Villa',
        description: 'Stunning villa with ocean views. Private beach access, infinity pool, and luxurious amenities.',
        location: '101 Ocean Drive, Miami, FL',
        propertyType: 'Villa',
        rent: 8500,
        rentType: 'Weekly',
        bedrooms: 4,
        bathrooms: 3,
        propertySize: 3500,
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Air Conditioning', 'Kitchen', 'Parking'],
        images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800'],
        extraFeatures: ['Ocean View', 'Private Pool', 'Outdoor Kitchen', 'Guest House'],
        status: 'Approved',
        ownerName: owner2.name,
        ownerEmail: owner2.email,
        ownerPhoto: owner2.photo
      },
      {
        title: 'Urban Condo',
        description: 'Sleek condo in prime location. Walk to shops, restaurants, and public transit.',
        location: '222 Urban Way, Chicago, IL',
        propertyType: 'Condo',
        rent: 2200,
        rentType: 'Monthly',
        bedrooms: 1,
        bathrooms: 1,
        propertySize: 800,
        amenities: ['WiFi', 'Gym', 'Pool', 'Concierge', 'Parking'],
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
        extraFeatures: ['City View', 'Balcony', 'In-Unit Laundry'],
        status: 'Approved',
        ownerName: owner1.name,
        ownerEmail: owner1.email,
        ownerPhoto: owner1.photo
      },
      {
        title: 'Spacious Townhouse',
        description: 'Multi-level townhouse with modern updates. Private patio and attached garage.',
        location: '333 Town Center, Boston, MA',
        propertyType: 'Townhouse',
        rent: 3800,
        rentType: 'Monthly',
        bedrooms: 3,
        bathrooms: 2,
        propertySize: 2100,
        amenities: ['WiFi', 'Parking', 'Backyard', 'Air Conditioning', 'Washer/Dryer'],
        images: ['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'],
        extraFeatures: ['3 Levels', 'Finished Basement', 'Deck'],
        status: 'Approved',
        ownerName: owner2.name,
        ownerEmail: owner2.email,
        ownerPhoto: owner2.photo
      },
      {
        title: 'Cozy Studio',
        description: 'Efficient studio perfect for students or young professionals. Great location near campus.',
        location: '444 Campus Dr, Austin, TX',
        propertyType: 'Studio',
        rent: 950,
        rentType: 'Monthly',
        bedrooms: 0,
        bathrooms: 1,
        propertySize: 450,
        amenities: ['WiFi', 'Air Conditioning'],
        images: ['https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800'],
        extraFeatures: ['Furnished', 'Near Transit'],
        status: 'Pending',
        ownerName: owner1.name,
        ownerEmail: owner1.email,
        ownerPhoto: owner1.photo
      },
      {
        title: 'Executive Office Space',
        description: 'Professional office space in business district. Private offices and conference room included.',
        location: '555 Business Park, Denver, CO',
        propertyType: 'Office',
        rent: 3500,
        rentType: 'Monthly',
        bedrooms: 0,
        bathrooms: 2,
        propertySize: 1500,
        amenities: ['WiFi', 'Parking', 'Conference Room', 'Kitchen'],
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
        extraFeatures: ['Reception Area', 'Private Offices', 'Storage'],
        status: 'Approved',
        ownerName: owner2.name,
        ownerEmail: owner2.email,
        ownerPhoto: owner2.photo
      }
    ];

    const createdProperties = await Property.insertMany(properties);
    console.log(`${createdProperties.length} properties created`);

    // Sample reviews
    const reviews = [
      {
        propertyId: createdProperties[0]._id,
        tenantName: tenant1.name,
        tenantEmail: tenant1.email,
        rating: 5,
        comment: 'Amazing apartment! The location is perfect and the amenities are top-notch. Highly recommend!'
      },
      {
        propertyId: createdProperties[0]._id,
        tenantName: tenant2.name,
        tenantEmail: tenant2.email,
        rating: 4,
        comment: 'Great place to live. Very responsive landlord and clean building.'
      },
      {
        propertyId: createdProperties[1]._id,
        tenantName: tenant1.name,
        tenantEmail: tenant1.email,
        rating: 5,
        comment: 'Perfect for families. Quiet neighborhood and spacious rooms.'
      },
      {
        propertyId: createdProperties[2]._id,
        tenantName: tenant2.name,
        tenantEmail: tenant2.email,
        rating: 4,
        comment: 'Cool loft with great character. Love the high ceilings!'
      },
      {
        propertyId: createdProperties[3]._id,
        tenantName: tenant1.name,
        tenantEmail: tenant1.email,
        rating: 5,
        comment: 'Absolutely stunning! The beach access and pool made our vacation unforgettable.'
      }
    ];

    await Review.insertMany(reviews);
    console.log(`${reviews.length} reviews created`);

    // Sample bookings
    const bookings = [
      {
        propertyId: createdProperties[0]._id,
        propertyTitle: createdProperties[0].title,
        propertyLocation: createdProperties[0].location,
        tenantName: tenant1.name,
        tenantEmail: tenant1.email,
        ownerEmail: owner1.email,
        moveInDate: '2025-02-01',
        contactNumber: '+1234567890',
        additionalNotes: 'Looking forward to moving in!',
        amount: createdProperties[0].rent,
        bookingStatus: 'Approved',
        paymentStatus: 'Paid',
        transactionId: 'txn_luxury_apt_001'
      },
      {
        propertyId: createdProperties[1]._id,
        propertyTitle: createdProperties[1].title,
        propertyLocation: createdProperties[1].location,
        tenantName: tenant2.name,
        tenantEmail: tenant2.email,
        ownerEmail: owner1.email,
        moveInDate: '2025-03-15',
        contactNumber: '+1234567891',
        additionalNotes: 'Have a small dog, hope that\'s okay',
        amount: createdProperties[1].rent,
        bookingStatus: 'Pending',
        paymentStatus: 'Pending',
        transactionId: ''
      },
      {
        propertyId: createdProperties[3]._id,
        propertyTitle: createdProperties[3].title,
        propertyLocation: createdProperties[3].location,
        tenantName: tenant1.name,
        tenantEmail: tenant1.email,
        ownerEmail: owner2.email,
        moveInDate: '2025-07-01',
        contactNumber: '+1234567892',
        additionalNotes: 'Vacation rental for 2 weeks',
        amount: createdProperties[3].rent * 2,
        bookingStatus: 'Approved',
        paymentStatus: 'Paid',
        transactionId: 'txn_beach_villa_001'
      },
      {
        propertyId: createdProperties[4]._id,
        propertyTitle: createdProperties[4].title,
        propertyLocation: createdProperties[4].location,
        tenantName: tenant2.name,
        tenantEmail: tenant2.email,
        ownerEmail: owner1.email,
        moveInDate: '2025-04-01',
        contactNumber: '+1234567893',
        additionalNotes: '',
        amount: createdProperties[4].rent,
        bookingStatus: 'Rejected',
        paymentStatus: 'Failed',
        transactionId: ''
      },
      {
        propertyId: createdProperties[5]._id,
        propertyTitle: createdProperties[5].title,
        propertyLocation: createdProperties[5].location,
        tenantName: tenant1.name,
        tenantEmail: tenant1.email,
        ownerEmail: owner2.email,
        moveInDate: '2025-05-01',
        contactNumber: '+1234567894',
        additionalNotes: 'Great location for work',
        amount: createdProperties[5].rent,
        bookingStatus: 'Pending',
        paymentStatus: 'Pending',
        transactionId: ''
      }
    ];

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`${createdBookings.length} bookings created`);

    // Sample favorites
    const favorites = [
      {
        propertyId: createdProperties[0]._id,
        tenantEmail: tenant1.email,
        propertyInfo: {
          title: createdProperties[0].title,
          location: createdProperties[0].location,
          rent: createdProperties[0].rent,
          rentType: createdProperties[0].rentType,
          propertyType: createdProperties[0].propertyType,
          bedrooms: createdProperties[0].bedrooms,
          bathrooms: createdProperties[0].bathrooms,
          image: createdProperties[0].images[0]
        }
      },
      {
        propertyId: createdProperties[1]._id,
        tenantEmail: tenant2.email,
        propertyInfo: {
          title: createdProperties[1].title,
          location: createdProperties[1].location,
          rent: createdProperties[1].rent,
          rentType: createdProperties[1].rentType,
          propertyType: createdProperties[1].propertyType,
          bedrooms: createdProperties[1].bedrooms,
          bathrooms: createdProperties[1].bathrooms,
          image: createdProperties[1].images[0]
        }
      },
      {
        propertyId: createdProperties[3]._id,
        tenantEmail: tenant1.email,
        propertyInfo: {
          title: createdProperties[3].title,
          location: createdProperties[3].location,
          rent: createdProperties[3].rent,
          rentType: createdProperties[3].rentType,
          propertyType: createdProperties[3].propertyType,
          bedrooms: createdProperties[3].bedrooms,
          bathrooms: createdProperties[3].bathrooms,
          image: createdProperties[3].images[0]
        }
      },
      {
        propertyId: createdProperties[5]._id,
        tenantEmail: tenant2.email,
        propertyInfo: {
          title: createdProperties[5].title,
          location: createdProperties[5].location,
          rent: createdProperties[5].rent,
          rentType: createdProperties[5].rentType,
          propertyType: createdProperties[5].propertyType,
          bedrooms: createdProperties[5].bedrooms,
          bathrooms: createdProperties[5].bathrooms,
          image: createdProperties[5].images[0]
        }
      },
      {
        propertyId: createdProperties[2]._id,
        tenantEmail: tenant1.email,
        propertyInfo: {
          title: createdProperties[2].title,
          location: createdProperties[2].location,
          rent: createdProperties[2].rent,
          rentType: createdProperties[2].rentType,
          propertyType: createdProperties[2].propertyType,
          bedrooms: createdProperties[2].bedrooms,
          bathrooms: createdProperties[2].bathrooms,
          image: createdProperties[2].images[0]
        }
      },
      {
        propertyId: createdProperties[7]._id,
        tenantEmail: tenant2.email,
        propertyInfo: {
          title: createdProperties[7].title,
          location: createdProperties[7].location,
          rent: createdProperties[7].rent,
          rentType: createdProperties[7].rentType,
          propertyType: createdProperties[7].propertyType,
          bedrooms: createdProperties[7].bedrooms,
          bathrooms: createdProperties[7].bathrooms,
          image: createdProperties[7].images[0]
        }
      }
    ];

    const createdFavorites = await Favorite.insertMany(favorites);
    console.log(`${createdFavorites.length} favorites created`);

    // Sample transactions
    const transactions = [
      {
        transactionId: 'txn_luxury_apt_001',
        propertyId: createdProperties[0]._id,
        propertyName: createdProperties[0].title,
        tenantName: tenant1.name,
        tenantEmail: tenant1.email,
        ownerName: owner1.name,
        ownerEmail: owner1.email,
        amount: 2500,
        date: new Date('2025-01-15')
      },
      {
        transactionId: 'txn_beach_villa_001',
        propertyId: createdProperties[3]._id,
        propertyName: createdProperties[3].title,
        tenantName: tenant1.name,
        tenantEmail: tenant1.email,
        ownerName: owner2.name,
        ownerEmail: owner2.email,
        amount: 17000,
        date: new Date('2025-06-20')
      },
      {
        transactionId: 'txn_studio_loft_001',
        propertyId: createdProperties[2]._id,
        propertyName: createdProperties[2].title,
        tenantName: tenant2.name,
        tenantEmail: tenant2.email,
        ownerName: owner2.name,
        ownerEmail: owner2.email,
        amount: 1800,
        date: new Date('2025-05-10')
      },
      {
        transactionId: 'txn_urban_condo_001',
        propertyId: createdProperties[4]._id,
        propertyName: createdProperties[4].title,
        tenantName: tenant1.name,
        tenantEmail: tenant1.email,
        ownerName: owner1.name,
        ownerEmail: owner1.email,
        amount: 2200,
        date: new Date('2025-04-05')
      },
      {
        transactionId: 'txn_townhouse_001',
        propertyId: createdProperties[5]._id,
        propertyName: createdProperties[5].title,
        tenantName: tenant2.name,
        tenantEmail: tenant2.email,
        ownerName: owner2.name,
        ownerEmail: owner2.email,
        amount: 3800,
        date: new Date('2025-03-20')
      }
    ];

    const createdTransactions = await Transaction.insertMany(transactions);
    console.log(`${createdTransactions.length} transactions created`);

    console.log('Seed data completed successfully!');
    console.log('\nLogin credentials:');
    console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@example.com'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('Owner 1: owner1@example.com / password123');
    console.log('Owner 2: owner2@example.com / password123');
    console.log('Tenant 1: tenant1@example.com / password123');
    console.log('Tenant 2: tenant2@example.com / password123');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
